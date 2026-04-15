-- Enable extension for UUID generation
create extension if not exists "pgcrypto";

-- USERS
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  ff_username text not null,
  ff_player_id text not null unique,
  referral_code text not null unique,
  referred_by_user_id uuid references public.users(id) on delete set null,
  wallet_balance numeric(12,2) not null default 0,
  strike_count integer not null default 0,
  country text default 'Nigeria',
  region text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CHALLENGES
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references public.users(id) on delete cascade,
  opponent_user_id uuid references public.users(id) on delete set null,
  stake_amount numeric(12,2) not null,
  game_mode text not null default 'Free Fire 1v1',
  status text not null default 'open',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- MATCHES
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  player_one_user_id uuid not null references public.users(id) on delete cascade,
  player_two_user_id uuid not null references public.users(id) on delete cascade,
  winner_user_id uuid references public.users(id) on delete set null,
  status text not null default 'pending',
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- WAITING ROOMS
create table if not exists public.waiting_rooms (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null unique references public.challenges(id) on delete cascade,
  room_code text not null unique,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CHAT MESSAGES
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  waiting_room_id uuid not null references public.waiting_rooms(id) on delete cascade,
  sender_user_id uuid not null references public.users(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

-- TRANSACTIONS
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  challenge_id uuid references public.challenges(id) on delete set null,
  match_id uuid references public.matches(id) on delete set null,
  transaction_type text not null,
  amount numeric(12,2) not null,
  status text not null default 'pending',
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- REFERRALS
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references public.users(id) on delete cascade,
  referred_user_id uuid not null unique references public.users(id) on delete cascade,
  bonus_amount numeric(12,2) not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- NOTIFICATIONS
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  body text not null,
  notification_type text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ADMIN LOGS
create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.users(id) on delete set null,
  action text not null,
  target_table text,
  target_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_challenges_creator_user_id on public.challenges(creator_user_id);
create index if not exists idx_challenges_opponent_user_id on public.challenges(opponent_user_id);
create index if not exists idx_matches_challenge_id on public.matches(challenge_id);
create index if not exists idx_chat_messages_waiting_room_id on public.chat_messages(waiting_room_id);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.challenges enable row level security;
alter table public.matches enable row level security;
alter table public.waiting_rooms enable row level security;
alter table public.chat_messages enable row level security;
alter table public.transactions enable row level security;
alter table public.referrals enable row level security;
alter table public.notifications enable row level security;
alter table public.admin_logs enable row level security;
