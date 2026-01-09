# Supabase Setup Instructions

## 1. Create Supabase Project Manually
- Go to [supabase.com](https://supabase.com)
- Create new project named "axiosOS"
- Note your Project URL and anon API key from Settings > API

## 2. Get Your Keys
After creating the project, go to Settings > API and copy:
- Project URL: `https://your-project-ref.supabase.co`
- Anon public key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 3. Update Environment Variables
Replace in `.env` and `.env.production`:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. Database Schema
Run these SQL commands in Supabase SQL Editor:

```sql
-- Enable RLS
alter table auth.users enable row level security;

-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Create clinical_data table
create table clinical_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  patient_age integer,
  patient_sex text,
  glycemia_mmol_l numeric,
  cholesterol_total_mmol_l numeric,
  hdl_mmol_l numeric,
  ldl_mmol_l numeric,
  triglycerides_mmol_l numeric,
  systolic_bp integer,
  diastolic_bp integer,
  bmi numeric,
  analysis text,
  protocol jsonb,
  risk_flags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table profiles enable row level security;
alter table clinical_data enable row level security;

-- Profiles policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Clinical data policies
create policy "Users can view own clinical data" on clinical_data for select using (auth.uid() = user_id);
create policy "Users can insert own clinical data" on clinical_data for insert with check (auth.uid() = user_id);

-- Function to handle new user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## 5. Authentication Settings
- Enable Email/Password authentication in Authentication > Settings
- Configure email templates if needed
- Set up redirect URLs for production

## 6. Test Connection
Once you have the keys, update the environment files and test the authentication.
