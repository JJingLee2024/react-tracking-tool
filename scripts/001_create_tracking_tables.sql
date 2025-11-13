-- Create tracking_events table to store all events
create table if not exists public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  session_id text not null,
  user_id text,
  properties jsonb default '{}'::jsonb,
  page_url text,
  referrer text,
  user_agent text,
  ip_address text,
  timestamp timestamptz default now(),
  created_at timestamptz default now()
);

-- Create index for faster queries
create index if not exists idx_tracking_events_session_id on public.tracking_events(session_id);
create index if not exists idx_tracking_events_event_name on public.tracking_events(event_name);
create index if not exists idx_tracking_events_timestamp on public.tracking_events(timestamp desc);
create index if not exists idx_tracking_events_user_id on public.tracking_events(user_id);

-- Create sessions table to track user sessions
create table if not exists public.tracking_sessions (
  id text primary key,
  user_id text,
  started_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  page_views integer default 0,
  events_count integer default 0,
  device_type text,
  browser text,
  os text,
  country text,
  city text
);

-- Create index for sessions
create index if not exists idx_tracking_sessions_user_id on public.tracking_sessions(user_id);
create index if not exists idx_tracking_sessions_started_at on public.tracking_sessions(started_at desc);

-- Enable RLS for tracking_events
alter table public.tracking_events enable row level security;

-- Allow anyone to insert tracking events (public tracking)
create policy "tracking_events_insert_public"
  on public.tracking_events for insert
  with check (true);

-- Allow authenticated users to view all tracking events
create policy "tracking_events_select_authenticated"
  on public.tracking_events for select
  using (true);

-- Enable RLS for tracking_sessions
alter table public.tracking_sessions enable row level security;

-- Allow anyone to insert/update sessions (public tracking)
create policy "tracking_sessions_insert_public"
  on public.tracking_sessions for insert
  with check (true);

create policy "tracking_sessions_update_public"
  on public.tracking_sessions for update
  using (true);

-- Allow authenticated users to view all sessions
create policy "tracking_sessions_select_authenticated"
  on public.tracking_sessions for select
  using (true);
