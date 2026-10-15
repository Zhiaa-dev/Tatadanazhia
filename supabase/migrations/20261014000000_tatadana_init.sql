-- ============================================================================
-- TATADANA DATABASE INITIAL MIGRATION
-- Indonesian Fintech SaaS: Supabase Postgres Schema + RLS Policies + Triggers
-- Timezone: Asia/Jakarta (WIB)
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Set default timezone to Asia/Jakarta
alter database postgres set timezone to 'Asia/Jakarta';

-- ============================================================================
-- 1. PROFILES TABLE (Supabase Auth link, Phone Verification, Telegram, Plan)
-- ============================================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null default '',
  avatar_url text,
  phone_number text unique,
  phone_verified boolean not null default false,
  telegram_chat_id bigint unique,
  telegram_username text,
  telegram_bot_token text, -- Encrypted or personal bot token if configured
  telegram_bot_status text default 'disconnected' check (telegram_bot_status in ('disconnected', 'testing', 'connected', 'error')),
  plan text not null default 'starter' check (plan in ('starter', 'pro')),
  plan_expires_at timestamptz,
  default_currency text not null default 'IDR',
  default_wallet_id uuid, -- Foreign key set after wallets table creation
  is_admin boolean not null default false,
  reminder_enabled boolean not null default true,
  reminder_frequency int not null default 1 check (reminder_frequency in (1, 2)),
  reminder_time_1 time not null default '12:00:00',
  reminder_time_2 time not null default '20:00:00',
  monthly_transaction_count int not null default 0,
  monthly_transaction_period date not null default date_trunc('month', (now() at time zone 'Asia/Jakarta'))::date,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default (now() at time zone 'Asia/Jakarta'),
  updated_at timestamptz not null default (now() at time zone 'Asia/Jakarta')
);

-- ============================================================================
-- 2. WALLETS TABLE (Multi-Wallet: Cash, BCA, Mandiri, GoPay, OVO, etc.)
-- ============================================================================
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  balance numeric(15, 2) not null default 0,
  color text not null default '#F97316',
  icon text not null default 'wallet',
  is_default boolean not null default false,
  created_at timestamptz not null default (now() at time zone 'Asia/Jakarta'),
  updated_at timestamptz not null default (now() at time zone 'Asia/Jakarta')
);

-- Add default_wallet_id foreign key constraint now that wallets table exists
alter table public.profiles
  drop constraint if exists profiles_default_wallet_id_fkey,
  add constraint profiles_default_wallet_id_fkey
  foreign key (default_wallet_id) references public.wallets(id) on delete set null;

-- ============================================================================
-- 3. CATEGORIES TABLE (Expenses, Income, AI recommended & custom)
-- ============================================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  emoji text not null default '🏷️',
  type text not null check (type in ('expense', 'income')),
  color text not null default '#F97316',
  is_default boolean not null default false,
  created_at timestamptz not null default (now() at time zone 'Asia/Jakarta')
);

-- ============================================================================
-- 4. BUDGETS TABLE (Per Category, Monthly target with 80% & 100% alerts)
-- ============================================================================
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  month date not null, -- First day of month (e.g., '2026-10-01')
  amount numeric(15, 2) not null check (amount > 0),
  alert_80_sent boolean not null default false,
  alert_100_sent boolean not null default false,
  created_at timestamptz not null default (now() at time zone 'Asia/Jakarta'),
  updated_at timestamptz not null default (now() at time zone 'Asia/Jakarta'),
  constraint budgets_user_category_month_unique unique (user_id, category_id, month)
);

-- ============================================================================
-- 5. TRANSACTIONS TABLE (Pemasukan, Pengeluaran, Transfer)
-- ============================================================================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  wallet_id uuid not null references public.wallets(id) on delete restrict,
  category_id uuid references public.categories(id) on delete set null,
  destination_wallet_id uuid references public.wallets(id) on delete set null, -- For transfers
  type text not null check (type in ('expense', 'income', 'transfer')),
  amount numeric(15, 2) not null check (amount > 0),
  description text,
  receipt_url text,
  has_receipt_items boolean not null default false,
  source text not null default 'web' check (source in ('web', 'telegram_text', 'telegram_photo', 'telegram_voice')),
  transaction_time timestamptz not null default (now() at time zone 'Asia/Jakarta'),
  created_at timestamptz not null default (now() at time zone 'Asia/Jakarta')
);

-- ============================================================================
-- 6. TRANSACTION ITEMS TABLE (Itemized OCR receipt lines)
-- ============================================================================
create table if not exists public.transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  item_name text not null,
  price numeric(15, 2) not null check (price >= 0),
  quantity numeric(10, 2) not null default 1,
  category_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default (now() at time zone 'Asia/Jakarta')
);

-- ============================================================================
-- 7. TELEGRAM UPDATES TABLE (Strict Idempotency for Telegram Webhooks)
-- ============================================================================
create table if not exists public.telegram_updates (
  update_id bigint primary key,
  user_id uuid references public.profiles(id) on delete set null,
  message_type text,
  status text not null default 'processed',
  processed_at timestamptz not null default (now() at time zone 'Asia/Jakarta')
);

-- ============================================================================
-- 8. AI PROVIDERS & AI LOGS TABLES (Multi-provider failover & cost monitor)
-- ============================================================================
create table if not exists public.ai_providers (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('gemini', 'openai', 'deepseek', 'custom')),
  model_name text not null,
  api_key_encrypted text not null,
  priority int not null default 1,
  is_active boolean not null default true,
  mode text not null default 'single' check (mode in ('single', 'parallel_failover')),
  created_at timestamptz not null default (now() at time zone 'Asia/Jakarta'),
  updated_at timestamptz not null default (now() at time zone 'Asia/Jakarta')
);

create table if not exists public.ai_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  provider text not null,
  model text not null,
  action_type text not null check (action_type in ('parse_text', 'ocr_receipt', 'speech_to_text', 'advisor', 'onboarding_recommendation')),
  prompt_tokens int not null default 0,
  completion_tokens int not null default 0,
  latency_ms int not null default 0,
  status text not null check (status in ('success', 'failed')),
  error_message text,
  created_at timestamptz not null default (now() at time zone 'Asia/Jakarta')
);

-- ============================================================================
-- 9. EXPORT HISTORY TABLE (PDF / Excel generated reports in Supabase Storage)
-- ============================================================================
create table if not exists public.export_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  file_format text not null check (file_format in ('pdf', 'xlsx')),
  storage_path text not null,
  period_start date not null,
  period_end date not null,
  filter_meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default (now() at time zone 'Asia/Jakarta')
);

-- ============================================================================
-- 10. PAYMENTS TABLE (Midtrans + Admin Manual Approval)
-- ============================================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id text unique not null,
  amount numeric(15, 2) not null,
  plan text not null check (plan in ('starter', 'pro')),
  payment_method text default 'midtrans',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'failed', 'settlement')),
  midtrans_transaction_id text,
  proof_image_url text,
  approved_by uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default (now() at time zone 'Asia/Jakarta'),
  updated_at timestamptz not null default (now() at time zone 'Asia/Jakarta')
);

-- ============================================================================
-- 11. ADMIN AUDIT LOGS TABLE (User data inspection privacy tracker)
-- ============================================================================
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  target_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  details jsonb default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default (now() at time zone 'Asia/Jakarta')
);

-- ============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.categories enable row level security;
alter table public.budgets enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_items enable row level security;
alter table public.telegram_updates enable row level security;
alter table public.ai_providers enable row level security;
alter table public.ai_logs enable row level security;
alter table public.export_history enable row level security;
alter table public.payments enable row level security;
alter table public.admin_audit_logs enable row level security;

-- Profiles: users read/update own profile; admins read all
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Wallets: user owns wallets; admins can view for support
create policy "Users can manage own wallets" on public.wallets
  for all using (auth.uid() = user_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- Categories: user owns categories
create policy "Users can manage own categories" on public.categories
  for all using (auth.uid() = user_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- Budgets: user owns budgets
create policy "Users can manage own budgets" on public.budgets
  for all using (auth.uid() = user_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- Transactions: user owns transactions; admin can view for support
create policy "Users can manage own transactions" on public.transactions
  for all using (auth.uid() = user_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- Transaction items: user owns transaction items
create policy "Users can manage own transaction items" on public.transaction_items
  for all using (
    exists (select 1 from public.transactions t where t.id = transaction_id and (t.user_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)))
  );

-- Export history: user owns export history
create policy "Users can view own export history" on public.export_history
  for all using (auth.uid() = user_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- Payments: user can view own payments, admins manage all
create policy "Users can view own payments" on public.payments
  for select using (auth.uid() = user_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Users can insert own payments" on public.payments
  for insert with check (auth.uid() = user_id);

create policy "Admins can update payments" on public.payments
  for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- Admin only tables: ai_providers, ai_logs, admin_audit_logs
create policy "Admins can manage ai_providers" on public.ai_providers
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Admins can view ai_logs" on public.ai_logs
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Admins can view admin_audit_logs" on public.admin_audit_logs
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- Telegram Updates: internal/service role access
create policy "Service role can manage telegram_updates" on public.telegram_updates
  for all using (true);

-- ============================================================================
-- 13. AUTOMATED TRIGGERS & FUNCTIONS
-- ============================================================================

-- A. Auto create profile on Supabase auth.users sign up
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_wallet_id uuid;
begin
  insert into public.profiles (id, full_name, avatar_url, phone_number, phone_verified)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User TataDana'),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    new.phone,
    (new.phone_confirmed_at is not null)
  );

  -- Create default wallet: "Dompet Utama (Cash)"
  insert into public.wallets (user_id, name, balance, color, icon, is_default)
  values (new.id, 'Cash', 0, '#F97316', 'wallet', true)
  returning id into new_wallet_id;

  update public.profiles
  set default_wallet_id = new_wallet_id
  where id = new.id;

  -- Create initial standard categories
  insert into public.categories (user_id, name, emoji, type, color, is_default) values
    (new.id, 'Makanan', '🍜', 'expense', '#F97316', true),
    (new.id, 'Transport', '🚗', 'expense', '#3B82F6', true),
    (new.id, 'Tagihan', '🏠', 'expense', '#EF4444', true),
    (new.id, 'Belanja', '👕', 'expense', '#8B5CF6', true),
    (new.id, 'Hiburan', '🎮', 'expense', '#EC4899', true),
    (new.id, 'Kesehatan', '💊', 'expense', '#10B981', true),
    (new.id, 'Gaji', '💰', 'income', '#10B981', true),
    (new.id, 'Freelance', '💻', 'income', '#06B6D4', true);

  return new;
end;
$$ language plpgsql security definer;

-- Trigger for auth.users signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- B. Update Wallet Balance on Transactions
create or replace function public.handle_transaction_balance_change()
returns trigger as $$
begin
  -- IF INSERT
  if (TG_OP = 'INSERT') then
    if (new.type = 'expense') then
      update public.wallets set balance = balance - new.amount where id = new.wallet_id;
    elsif (new.type = 'income') then
      update public.wallets set balance = balance + new.amount where id = new.wallet_id;
    elsif (new.type = 'transfer') then
      update public.wallets set balance = balance - new.amount where id = new.wallet_id;
      if (new.destination_wallet_id is not null) then
        update public.wallets set balance = balance + new.amount where id = new.destination_wallet_id;
      end if;
    end if;

    -- Increment monthly transaction count
    update public.profiles
    set monthly_transaction_count = monthly_transaction_count + 1
    where id = new.user_id;

  -- IF DELETE
  elsif (TG_OP = 'DELETE') then
    if (old.type = 'expense') then
      update public.wallets set balance = balance + old.amount where id = old.wallet_id;
    elsif (old.type = 'income') then
      update public.wallets set balance = balance - old.amount where id = old.wallet_id;
    elsif (old.type = 'transfer') then
      update public.wallets set balance = balance + old.amount where id = old.wallet_id;
      if (old.destination_wallet_id is not null) then
        update public.wallets set balance = balance - old.amount where id = old.destination_wallet_id;
      end if;
    end if;

    -- Decrement monthly transaction count
    update public.profiles
    set monthly_transaction_count = greatest(0, monthly_transaction_count - 1)
    where id = old.user_id;
  end if;

  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_transaction_balance_change on public.transactions;
create trigger on_transaction_balance_change
  after insert or delete on public.transactions
  for each row execute function public.handle_transaction_balance_change();

-- ============================================================================
-- 14. SUPABASE STORAGE BUCKETS (Receipts & Export Files)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('exports', 'exports', false)
on conflict (id) do nothing;

-- Storage RLS: Users can only upload and read files in their own folder ({user_id}/*)
create policy "Users can upload their own receipts" on storage.objects
  for insert with check (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can read their own receipts" on storage.objects
  for select using (bucket_id = 'receipts' and (auth.uid()::text = (storage.foldername(name))[1] or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)));

create policy "Users can upload and read their own exports" on storage.objects
  for all using (bucket_id = 'exports' and (auth.uid()::text = (storage.foldername(name))[1] or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)));
