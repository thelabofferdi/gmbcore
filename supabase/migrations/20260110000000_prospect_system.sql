-- Créer la table prospect_leads
create table prospect_leads (
  id uuid default gen_random_uuid() primary key,
  referrer_id text not null, -- ID du vendeur qui a partagé le lien
  prospect_email text,
  prospect_phone text,
  prospect_name text,
  conversation_data jsonb default '[]'::jsonb,
  clinical_analysis jsonb,
  status text default 'new' check (status in ('new', 'contacted', 'converted', 'lost')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_activity timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Créer la table shareable_links
create table shareable_links (
  id uuid default gen_random_uuid() primary key,
  link_id text unique not null,
  referrer_id text not null,
  referrer_name text not null,
  expires_at timestamp with time zone,
  max_uses integer default 100,
  current_uses integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index pour les performances
create index idx_prospect_leads_referrer on prospect_leads(referrer_id);
create index idx_prospect_leads_status on prospect_leads(status);
create index idx_shareable_links_link_id on shareable_links(link_id);

-- RLS Policies
alter table prospect_leads enable row level security;
alter table shareable_links enable row level security;

-- Les vendeurs peuvent voir leurs propres leads
create policy "Referrers can view own leads" on prospect_leads 
  for select using (referrer_id = current_setting('app.current_user_id', true));

-- Les vendeurs peuvent insérer des leads pour eux-mêmes
create policy "Referrers can insert own leads" on prospect_leads 
  for insert with check (referrer_id = current_setting('app.current_user_id', true));

-- Les vendeurs peuvent mettre à jour leurs propres leads
create policy "Referrers can update own leads" on prospect_leads 
  for update using (referrer_id = current_setting('app.current_user_id', true));

-- Policies pour shareable_links
create policy "Referrers can manage own links" on shareable_links 
  for all using (referrer_id = current_setting('app.current_user_id', true));
