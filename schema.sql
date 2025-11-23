-- Create transactions table
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  description text not null,
  amount decimal(12,2) not null,
  type text check (type in ('income', 'expense')) not null,
  category text not null,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table transactions enable row level security;

-- Create policies
create policy "Users can view their own transactions"
  on transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
  on transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on transactions for delete
  using (auth.uid() = user_id);
