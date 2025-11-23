-- Create goals table
create table goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  target_amount decimal(12,2) not null,
  current_amount decimal(12,2) default 0 not null,
  deadline date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table goals enable row level security;

-- Create policies
create policy "Users can view their own goals"
  on goals for select
  using (auth.uid() = user_id);

create policy "Users can insert their own goals"
  on goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own goals"
  on goals for update
  using (auth.uid() = user_id);

create policy "Users can delete their own goals"
  on goals for delete
  using (auth.uid() = user_id);
