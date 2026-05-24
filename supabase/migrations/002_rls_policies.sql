-- =============================================
-- JAPAFAN: Row-Level Security Policies v1.0
-- Run this in: Supabase Dashboard → SQL Editor
-- IMPORTANT: Run AFTER 001_initial_schema.sql
-- =============================================


-- =============================================
-- TABLE: users
-- =============================================
alter table public.users enable row level security;

-- Anyone can view user profiles (for matchmaking)
create policy "users_select_all"
  on public.users for select
  using (true);

-- Only the authenticated user can insert their own profile
create policy "users_insert_self"
  on public.users for insert
  with check (auth.uid() = id);

-- Only the authenticated user can update their own profile
create policy "users_update_self"
  on public.users for update
  using (auth.uid() = id);

-- Only the authenticated user can delete their own account
create policy "users_delete_self"
  on public.users for delete
  using (auth.uid() = id);


-- =============================================
-- TABLE: rankings
-- =============================================
alter table public.rankings enable row level security;

-- Anyone can view rankings (for taste comparison feature)
create policy "rankings_select_all"
  on public.rankings for select
  using (true);

-- Only authenticated user can write their own rankings
create policy "rankings_insert_self"
  on public.rankings for insert
  with check (auth.uid() = user_id);

-- Only authenticated user can update their own rankings
create policy "rankings_update_self"
  on public.rankings for update
  using (auth.uid() = user_id);

-- Only authenticated user can delete their own rankings
create policy "rankings_delete_self"
  on public.rankings for delete
  using (auth.uid() = user_id);


-- =============================================
-- TABLE: reviews
-- =============================================
alter table public.reviews enable row level security;

-- Anyone can read discussion comments
create policy "reviews_select_all"
  on public.reviews for select
  using (true);

-- Only authenticated users can post reviews
create policy "reviews_insert_auth"
  on public.reviews for insert
  with check (auth.uid() = user_id);

-- Only the original author can delete their review
create policy "reviews_delete_self"
  on public.reviews for delete
  using (auth.uid() = user_id);


-- =============================================
-- TABLE: chat_messages
-- =============================================
alter table public.chat_messages enable row level security;

-- All users can read channel history
create policy "chat_select_all"
  on public.chat_messages for select
  using (true);

-- Only authenticated users can send messages
create policy "chat_insert_auth"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

-- Only the original author can delete their message
create policy "chat_delete_self"
  on public.chat_messages for delete
  using (auth.uid() = user_id);
