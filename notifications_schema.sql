-- Create notifications table
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  message text not null,
  type text check (type in ('info', 'warning', 'success', 'error')) default 'info',
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  related_entity_type text,
  related_entity_id uuid
);

-- Enable RLS
alter table notifications enable row level security;

-- Create policies
create policy "Users can view their own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Users can insert their own notifications"
  on notifications for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on notifications for update
  using (auth.uid() = user_id);

create policy "Users can delete their own notifications"
  on notifications for delete
  using (auth.uid() = user_id);

-- Create function to automatically clean up old notifications (optional, e.g., older than 30 days)
-- For now, we'll keep it simple.
