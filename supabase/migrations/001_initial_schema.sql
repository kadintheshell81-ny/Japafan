-- =============================================
-- JAPAFAN: Initial Schema Migration v1.0
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================

-- 1. USER PROFILES
-- Linked to Supabase Auth users via foreign key.
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  username text not null unique,
  avatar_seed text default 'JapaFanUser',
  bio text,
  favorite_genres text[] default '{}',
  xp integer default 0 check (xp >= 0),
  level text default 'Lv.1 Trainee',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Auto-update 'updated_at' on every profile change
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger on_user_updated
  before update on public.users
  for each row execute function public.handle_updated_at();

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, username, avatar_seed)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_seed', 'JapaFanUser')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. ANIME RANKINGS (Top 5 per user)
create table if not exists public.rankings (
  id bigint generated always as identity primary key,
  user_id uuid references public.users on delete cascade not null,
  rank_position integer not null check (rank_position between 1 and 5),
  mal_id bigint not null,
  anime_title text not null,
  poster_url text not null,
  reflection_note text,
  created_at timestamptz default now() not null,
  unique (user_id, rank_position)
);


-- 3. ANIME REVIEWS / DISCUSSION COMMENTS
create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  user_id uuid references public.users on delete cascade not null,
  mal_id bigint not null,
  comment_text text not null check (char_length(comment_text) <= 500),
  created_at timestamptz default now() not null
);


-- 4. REAL-TIME CHAT MESSAGES
create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  user_id uuid references public.users on delete cascade not null,
  channel text not null,
  message_text text not null check (char_length(message_text) <= 300),
  created_at timestamptz default now() not null
);


-- =============================================
-- PERFORMANCE INDEXES
-- =============================================
create index if not exists idx_rankings_user_pos
  on public.rankings (user_id, rank_position);

create index if not exists idx_reviews_mal_id
  on public.reviews (mal_id, created_at desc);

create index if not exists idx_chat_channel_time
  on public.chat_messages (channel, created_at desc);
