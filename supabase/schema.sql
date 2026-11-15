-- ==============================================================================
-- SolvR Cloud Database Schema (Supabase PostgreSQL)
-- 100% Free Tier Ready with Row Level Security (RLS) & Realtime
-- ==============================================================================

-- 1. Create Profiles Table (Linked to Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  display_name text,
  avatar_url text,
  current_streak int default 0,
  longest_streak int default 0,
  total_solved int default 0,
  is_public boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( is_public = true or auth.uid() = id );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Auto-create profile trigger on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Create Topics Table
create table if not exists public.topics (
  id text not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  order_index int default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id, user_id)
);

alter table public.topics enable row level security;

create policy "Users can manage their own topics."
  on public.topics for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- 3. Create Subtopics Table
create table if not exists public.subtopics (
  id text not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  topic_id text not null,
  name text not null,
  order_index int default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id, user_id)
);

alter table public.subtopics enable row level security;

create policy "Users can manage their own subtopics."
  on public.subtopics for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- 4. Create Questions Table
create table if not exists public.questions (
  id text not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  topic_id text not null,
  subtopic_id text,
  title text not null,
  difficulty text not null,
  link text default '',
  resource text default '',
  tags text[] default array[]::text[],
  notes text default '',
  is_solved boolean default false,
  is_starred boolean default false,
  is_revision boolean default false,
  last_practiced_at timestamp with time zone,
  solved_at timestamp with time zone,
  order_index int default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id, user_id)
);

alter table public.questions enable row level security;

create policy "Users can manage their own questions."
  on public.questions for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- 5. Create Activity History Table
create table if not exists public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  question_id text not null,
  solved_date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, question_id, solved_date)
);

alter table public.activity_logs enable row level security;

create policy "Users can manage their own activity logs."
  on public.activity_logs for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

create policy "Activity logs of public profiles are viewable."
  on public.activity_logs for select
  using ( exists (select 1 from public.profiles where profiles.id = activity_logs.user_id and profiles.is_public = true) );

-- 6. Create Follows Table (Social Feature)
create table if not exists public.follows (
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id)
);

alter table public.follows enable row level security;

create policy "Users can manage their follows."
  on public.follows for all
  using ( auth.uid() = follower_id )
  with check ( auth.uid() = follower_id );

create policy "Everyone can view follows relationship."
  on public.follows for select
  using ( true );

-- 7. Realtime Enablement
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.activity_logs;
alter publication supabase_realtime add table public.follows;
