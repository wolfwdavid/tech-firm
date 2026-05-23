-- Crystarium v2 initial schema.
--
-- Tables match the contract in Claude-B's claude-b/supabase-scaffold:
-- automation_events row shape consumed by the React Crystarium's Realtime
-- subscriber is { id, business_id, from_node, to_node, label, created_at }.
--
-- Auth is intentionally NOT wired tonight — hackathon scope. Policies are
-- permissive so the anon key acts as the app key. Add real Supabase Auth
-- + tighter RLS post-demo.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- businesses
-- ---------------------------------------------------------------------------
create table if not exists public.businesses (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid references auth.users(id) on delete cascade,
  name            text not null,
  niche           text,
  mrr             integer default 0,
  customer_count  integer default 0,
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- nodes  (capability crystals — one row per node on the grid)
-- ---------------------------------------------------------------------------
create table if not exists public.nodes (
  id              text primary key,
  business_id     uuid references public.businesses(id) on delete cascade,
  role            text not null check (role in (
                    'manager', 'storefront', 'customer', 'email',
                    'content', 'payments', 'analytics', 'automations'
                  )),
  position        jsonb not null default '{"x": 0, "y": 0}'::jsonb,
  parent_id       text references public.nodes(id) on delete cascade,
  specialization  text,
  status          text not null default 'active'
                    check (status in ('active', 'idle', 'thinking')),
  created_at      timestamptz not null default now()
);

create index if not exists nodes_business_id_idx on public.nodes(business_id);

-- ---------------------------------------------------------------------------
-- agents  (one per node — persona + prompt + recent activity)
-- ---------------------------------------------------------------------------
create table if not exists public.agents (
  id              uuid primary key default gen_random_uuid(),
  node_id         text not null references public.nodes(id) on delete cascade,
  persona         text not null default '',
  system_prompt   text not null default '',
  recent_actions  jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now(),
  unique (node_id)
);

-- ---------------------------------------------------------------------------
-- chat_messages
-- ---------------------------------------------------------------------------
create table if not exists public.chat_messages (
  id              uuid primary key default gen_random_uuid(),
  node_id         text not null references public.nodes(id) on delete cascade,
  from_user       boolean not null,
  text            text not null,
  created_at      timestamptz not null default now()
);

create index if not exists chat_messages_node_id_idx on public.chat_messages(node_id, created_at);

-- ---------------------------------------------------------------------------
-- automation_events  (the wire between storefront and Crystarium)
-- Shape matches Claude-B's RemoteAutomationEvent in src/lib/supabase.ts
-- ---------------------------------------------------------------------------
create table if not exists public.automation_events (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid references public.businesses(id) on delete cascade,
  from_node       text not null,
  to_node         text not null,
  label           text not null,
  created_at      timestamptz not null default now()
);

create index if not exists automation_events_business_id_idx
  on public.automation_events(business_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Realtime publication
-- The React Crystarium subscribes to INSERTs on automation_events to
-- visually pulse the edges in the live demo.
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.automation_events;

-- ---------------------------------------------------------------------------
-- RLS — permissive for demo. Anon key is treated as the app key.
-- TODO post-hackathon: replace with auth-scoped policies (owner_id = auth.uid()).
-- ---------------------------------------------------------------------------
alter table public.businesses        enable row level security;
alter table public.nodes             enable row level security;
alter table public.agents            enable row level security;
alter table public.chat_messages     enable row level security;
alter table public.automation_events enable row level security;

-- Read-everything-write-everything for anon + authenticated until auth lands.
do $$
declare
  t text;
begin
  foreach t in array array[
    'businesses', 'nodes', 'agents', 'chat_messages', 'automation_events'
  ]
  loop
    execute format(
      'create policy %I on public.%I for all to anon, authenticated using (true) with check (true)',
      t || '_all_demo', t
    );
  end loop;
end $$;
