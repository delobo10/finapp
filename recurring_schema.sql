-- Create recurring_transactions table
create table recurring_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  description text not null,
  amount decimal(12,2) not null,
  type text check (type in ('income', 'expense')) not null,
  category text not null,
  frequency text check (frequency in ('daily', 'weekly', 'monthly', 'yearly')) not null,
  start_date date not null,
  next_due_date date not null,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table recurring_transactions enable row level security;

-- Create policies
create policy "Users can view their own recurring transactions"
  on recurring_transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own recurring transactions"
  on recurring_transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own recurring transactions"
  on recurring_transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own recurring transactions"
  on recurring_transactions for delete
  using (auth.uid() = user_id);
