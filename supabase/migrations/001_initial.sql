-- Enable extension for UUID generation
create extension if not exists "pgcrypto";

-- Enums
create type public.challenge_category as enum ('headshot_only', 'spam');
create type public.challenge_status as enum ('open', 'accepted', 'in_progress', 'completed', 'cancelled');
create type public.transaction_type as enum ('deposit', 'withdrawal', 'win', 'loss', 'commission', 'referral');

-- USERS
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  email text not null unique,
  ff_username text not null,
  ff_player_id text not null unique,
  referral_code text unique,
  referred_by uuid references public.users(id) on delete set null,
  wallet_balance numeric(12,2) not null default 0,
  referral_earnings numeric(12,2) not null default 0,
  strike_count integer not null default 0,
  is_banned boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- CHALLENGES
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.users(id) on delete cascade,
  stake_amount numeric(12,2) not null check (stake_amount > 0),
  category public.challenge_category not null,
  status public.challenge_status not null default 'open',
  created_at timestamptz not null default now()
);

-- MATCHES
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  challenger_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  winner_id uuid references public.users(id) on delete set null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- WAITING ROOMS
create table if not exists public.waiting_rooms (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.matches(id) on delete cascade,
  room_ff_id text not null,
  room_password text not null,
  challenger_ready boolean not null default false,
  receiver_ready boolean not null default false,
  countdown_started_at timestamptz,
  game_ended_at timestamptz,
  created_at timestamptz not null default now()
);

-- CHAT MESSAGES
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  waiting_room_id uuid not null references public.waiting_rooms(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

-- SCREENSHOTS
create table if not exists public.screenshots (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  image_url text not null,
  ai_verdict text,
  uploaded_at timestamptz not null default now()
);

-- TRANSACTIONS
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type public.transaction_type not null,
  amount numeric(12,2) not null,
  status text not null default 'pending',
  reference text unique,
  created_at timestamptz not null default now()
);

-- REFERRALS
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.users(id) on delete cascade,
  referred_id uuid not null unique references public.users(id) on delete cascade,
  earnings numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

-- NOTIFICATIONS
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ADMIN LOGS
create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.users(id) on delete set null,
  action text not null,
  target_user_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Trigger function to auto-generate referral codes on user insert
create or replace function public.generate_referral_code()
returns trigger
language plpgsql
as $$
declare
  code_candidate text;
begin
  if new.referral_code is null or length(trim(new.referral_code)) = 0 then
    loop
      code_candidate := upper(substring(encode(gen_random_bytes(5), 'hex') from 1 for 10));
      exit when not exists (
        select 1 from public.users u where u.referral_code = code_candidate
      );
    end loop;

    new.referral_code := code_candidate;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_generate_referral_code on public.users;
create trigger trg_generate_referral_code
before insert on public.users
for each row
execute function public.generate_referral_code();

-- Indexes on foreign keys
create index if not exists idx_users_referred_by on public.users(referred_by);

create index if not exists idx_challenges_creator_id on public.challenges(creator_id);

create index if not exists idx_matches_challenge_id on public.matches(challenge_id);
create index if not exists idx_matches_challenger_id on public.matches(challenger_id);
create index if not exists idx_matches_receiver_id on public.matches(receiver_id);
create index if not exists idx_matches_winner_id on public.matches(winner_id);

create index if not exists idx_waiting_rooms_match_id on public.waiting_rooms(match_id);

create index if not exists idx_chat_messages_waiting_room_id on public.chat_messages(waiting_room_id);
create index if not exists idx_chat_messages_user_id on public.chat_messages(user_id);

create index if not exists idx_screenshots_match_id on public.screenshots(match_id);
create index if not exists idx_screenshots_user_id on public.screenshots(user_id);

create index if not exists idx_transactions_user_id on public.transactions(user_id);

create index if not exists idx_referrals_referrer_id on public.referrals(referrer_id);
create index if not exists idx_referrals_referred_id on public.referrals(referred_id);

create index if not exists idx_notifications_user_id on public.notifications(user_id);

create index if not exists idx_admin_logs_admin_id on public.admin_logs(admin_id);
create index if not exists idx_admin_logs_target_user_id on public.admin_logs(target_user_id);

-- Enable Row Level Security on all tables
alter table public.users enable row level security;
alter table public.challenges enable row level security;
alter table public.matches enable row level security;
alter table public.waiting_rooms enable row level security;
alter table public.chat_messages enable row level security;
alter table public.screenshots enable row level security;
alter table public.transactions enable row level security;
alter table public.referrals enable row level security;
alter table public.notifications enable row level security;
alter table public.admin_logs enable row level security;
