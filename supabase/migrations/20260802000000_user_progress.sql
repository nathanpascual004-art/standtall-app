-- Sauvegarde serveur OPTIONNELLE de la progression gamifiée.
--
-- Le LOCAL reste la source de vérité pour l'affichage instantané :
-- l'app fonctionne entièrement sans cette table. Elle servira quand des
-- comptes utilisateurs (Supabase Auth) existeront, pour restaurer la
-- progression après réinstallation. Aucun câblage côté app pour l'instant.

create table if not exists public.user_progress (
  user_id          uuid primary key references auth.users (id) on delete cascade,
  streak           integer not null default 0,
  best_streak      integer not null default 0,
  last_active_date date,
  freezes          integer not null default 1,
  xp               integer not null default 0,
  level            integer not null default 1,
  badges           text[] not null default '{}',
  updated_at       timestamptz not null default now()
);

alter table public.user_progress enable row level security;

-- Chaque utilisateur authentifié ne voit et n'écrit QUE sa propre ligne.
create policy "user_progress_select_own" on public.user_progress
  for select using (auth.uid() = user_id);
create policy "user_progress_insert_own" on public.user_progress
  for insert with check (auth.uid() = user_id);
create policy "user_progress_update_own" on public.user_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
