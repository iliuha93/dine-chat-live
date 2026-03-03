-- Create dish_photos table for custom menu item photos
create table if not exists public.dish_photos (
  dish_id   text        primary key,
  photo_url text        not null,
  source    text        not null default 'upload' check (source in ('upload', 'ai_generated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at on row change
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger dish_photos_updated_at
  before update on public.dish_photos
  for each row execute procedure public.set_updated_at();

-- Row-level security: anyone can read, only authenticated owners can write
alter table public.dish_photos enable row level security;

create policy "dish_photos_select_all"
  on public.dish_photos for select
  using (true);

create policy "dish_photos_insert_auth"
  on public.dish_photos for insert
  with check (auth.role() = 'authenticated');

create policy "dish_photos_update_auth"
  on public.dish_photos for update
  using (auth.role() = 'authenticated');

create policy "dish_photos_delete_auth"
  on public.dish_photos for delete
  using (auth.role() = 'authenticated');

-- Storage bucket for dish photos (run once in Supabase dashboard or via API)
-- insert into storage.buckets (id, name, public)
-- values ('dish-photos', 'dish-photos', true)
-- on conflict (id) do nothing;
