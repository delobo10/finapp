-- Create categories table
create table categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text check (type in ('income', 'expense')) not null,
  icon text, -- Store lucide icon name or emoji
  color text, -- Store hex color or tailwind class
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table categories enable row level security;

-- Create policies
create policy "Users can view their own categories"
  on categories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own categories"
  on categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own categories"
  on categories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own categories"
  on categories for delete
  using (auth.uid() = user_id);

-- Insert default categories for new users (This would typically be done via a trigger on auth.users creation, 
-- but for now we can just have a frontend 'initialize defaults' or just let them start empty/use hardcoded defaults if table is empty)
