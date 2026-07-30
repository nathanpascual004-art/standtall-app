-- StandTall — base nutritionnelle servant de source des macros au scan.
-- Le modèle de vision IDENTIFIE les aliments ; les macros viennent d'ici.
--
-- Appliquer avec :  supabase db push
-- (ou : psql "$SUPABASE_DB_URL" -f supabase/migrations/20260731000000_nutrition_foods.sql)

-- Recherche floue par trigrammes + suppression d'accents côté SQL.
create extension if not exists pg_trgm;
create extension if not exists unaccent;

create table if not exists public.nutrition_foods (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,          -- libellé aliment (ex. « Riz blanc, cuit »)
  name_norm     text not null,          -- minuscules sans accents, pour le match
  kcal_100g     numeric not null,
  protein_100g  numeric not null default 0,
  carb_100g     numeric not null default 0,
  fat_100g      numeric not null default 0,
  source        text not null check (source in ('ciqual', 'off'))
);

-- Index trigram : match_food() reste indexé même avec ~3 000 lignes CIQUAL.
create index if not exists nutrition_foods_name_norm_trgm
  on public.nutrition_foods using gin (name_norm gin_trgm_ops);

-- Ré-imports idempotents (upsert sur libellé normalisé + source).
create unique index if not exists nutrition_foods_name_norm_source_key
  on public.nutrition_foods (name_norm, source);

-- RLS sans policy : la table n'est lisible que par le service role
-- (l'Edge Function). Rien n'est exposé à la clé publishable.
alter table public.nutrition_foods enable row level security;

-- Normalisation côté SQL — MÊME convention que scripts/import-ciqual.mjs.
create or replace function public.norm_food_name(t text)
returns text
language sql
stable
as $$
  select lower(unaccent(coalesce(t, '')));
$$;

-- Meilleure correspondance par similarité trigram.
-- L'opérateur % applique le seuil pg_trgm (0.3 par défaut) : en dessous,
-- aucune ligne n'est renvoyée — l'appelant traite ça comme « pas de match »
-- et retombe sur l'estimation basse confiance du modèle.
create or replace function public.match_food(query text)
returns table (
  id           uuid,
  name         text,
  kcal_100g    numeric,
  protein_100g numeric,
  carb_100g    numeric,
  fat_100g     numeric,
  sim          real
)
language sql
stable
as $$
  select
    f.id,
    f.name,
    f.kcal_100g,
    f.protein_100g,
    f.carb_100g,
    f.fat_100g,
    similarity(f.name_norm, public.norm_food_name(query)) as sim
  from public.nutrition_foods f
  where f.name_norm % public.norm_food_name(query)
  order by sim desc
  limit 1;
$$;
