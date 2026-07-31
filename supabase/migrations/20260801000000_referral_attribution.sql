-- Attribution / parrainage (programme d'affiliation StandTall).
--
-- Chaîne complète :
--   code saisi à l'onboarding → attribut RevenueCat `referral_code`
--   → webhook RevenueCat → Edge Function `rc-webhook` → journal ici.
--
-- Sécurité : RLS activé SANS policy sur les deux tables → seul le
-- service role (les Edge Functions) lit/écrit. Rien n'est exposé au
-- client de l'app (ni en anon, ni en publishable).

-- ── Affiliés ────────────────────────────────────────────────────────────
-- `code` est TOUJOURS stocké en MAJUSCULES (contrainte) : l'unicité de
-- la colonne équivaut donc à un index unique sur upper(code), et la
-- référence depuis referral_conversions reste une vraie clé étrangère.
create table if not exists public.affiliates (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique check (code = upper(code) and code ~ '^[A-Z0-9_-]{3,24}$'),
  name        text,
  email       text,
  payout_info text,                    -- comment payer cet affilié (rempli à la main)
  status      text not null default 'active' check (status in ('active', 'paused')),
  created_at  timestamptz not null default now()
);

-- ── Journal des ventes attribuées ───────────────────────────────────────
create table if not exists public.referral_conversions (
  id             uuid primary key default gen_random_uuid(),
  affiliate_code text not null references public.affiliates (code) on update cascade,
  rc_app_user_id text not null,
  event_type     text not null check (event_type in (
    'initial_purchase', 'trial_conversion', 'renewal',
    'cancellation', 'refund', 'expiration'
  )),
  product_id     text,
  store          text,
  price_eur      numeric,             -- informatif (devise d'achat) ; la prime est forfaitaire
  event_time     timestamptz not null,
  is_refunded    boolean not null default false,
  bounty_eur     numeric not null default 0,
  payout_status  text not null default 'held' check (payout_status in (
    'held',      -- fenêtre de remboursement en cours
    'payable',   -- fenêtre passée, à verser
    'paid',      -- versé (marqué à la main par Nate)
    'void'       -- remboursé / annulé : jamais versé
  )),
  created_at     timestamptz not null default now(),
  -- Idempotence : RevenueCat renvoie parfois le même event plusieurs fois.
  unique (rc_app_user_id, event_type, event_time)
);

create index if not exists referral_conversions_affiliate_idx
  on public.referral_conversions (affiliate_code);
create index if not exists referral_conversions_user_idx
  on public.referral_conversions (rc_app_user_id);
-- Le job held → payable balaie par statut + date.
create index if not exists referral_conversions_held_idx
  on public.referral_conversions (event_time)
  where payout_status = 'held';

-- ── RLS : service role uniquement ───────────────────────────────────────
alter table public.affiliates enable row level security;
alter table public.referral_conversions enable row level security;
-- Aucune policy créée volontairement : anon/authenticated ne voient rien.

-- ── Tableau de bord : qui payer, combien ────────────────────────────────
-- Seules les lignes à prime (bounty_eur > 0) comptent ; les lignes
-- d'audit (annulations/remboursements journalisés à 0 €) n'affectent
-- ni les compteurs ni les totaux.
create or replace view public.affiliate_payouts
with (security_invoker = true) as
select
  a.code,
  a.name,
  a.status,
  a.payout_info,
  count(c.id) filter (where c.bounty_eur > 0)                              as conversions,
  coalesce(sum(c.bounty_eur) filter (where c.payout_status = 'payable'), 0) as total_payable_eur,
  coalesce(sum(c.bounty_eur) filter (where c.payout_status = 'held'), 0)    as total_held_eur,
  coalesce(sum(c.bounty_eur) filter (where c.payout_status = 'paid'), 0)    as total_paid_eur,
  coalesce(sum(c.bounty_eur) filter (where c.payout_status = 'void'), 0)    as total_void_eur
from public.affiliates a
left join public.referral_conversions c on c.affiliate_code = a.code
group by a.code, a.name, a.status, a.payout_info
order by total_payable_eur desc, conversions desc;

-- ── Job held → payable ──────────────────────────────────────────────────
-- Passe en 'payable' toute prime 'held', non remboursée, dont la fenêtre
-- de remboursement (hold_days) est écoulée. Appelée par l'Edge Function
-- `promote-payouts` (qui porte la constante HOLD_DAYS), ou à la main :
--   select public.promote_payable_conversions(30);
create or replace function public.promote_payable_conversions(hold_days integer)
returns integer
language sql
security definer
set search_path = public
as $$
  with promoted as (
    update public.referral_conversions
    set payout_status = 'payable'
    where payout_status = 'held'
      and not is_refunded
      and bounty_eur > 0
      and event_time + make_interval(days => hold_days) <= now()
    returning 1
  )
  select count(*)::integer from promoted;
$$;

-- Seul le service role peut exécuter la promotion.
revoke all on function public.promote_payable_conversions(integer) from public, anon, authenticated;
