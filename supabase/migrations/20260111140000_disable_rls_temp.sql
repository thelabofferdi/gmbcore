-- Désactiver temporairement RLS pour débugger les prospects
alter table prospect_leads disable row level security;
alter table shareable_links disable row level security;

-- Ajouter des permissions publiques temporaires
grant all on prospect_leads to anon, authenticated;
grant all on shareable_links to anon, authenticated;
