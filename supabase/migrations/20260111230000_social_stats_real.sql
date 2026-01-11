-- Migration pour les statistiques sociales réelles
-- Remplace les données mock par un vrai système de tracking

-- Table pour tracker les partages sociaux
CREATE TABLE IF NOT EXISTS social_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform TEXT NOT NULL, -- 'whatsapp', 'facebook', 'twitter', etc.
    link_type TEXT NOT NULL, -- 'smart_link', 'invite_link', 'product_link'
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour tracker les clics sur les liens
CREATE TABLE IF NOT EXISTS link_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source TEXT NOT NULL, -- 'social_share', 'direct', 'referral'
    referrer_url TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour tracker les conversions
CREATE TABLE IF NOT EXISTS conversions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL, -- 'signup', 'purchase', 'consultation'
    value DECIMAL(10,2), -- Valeur monétaire si applicable
    source_share_id UUID REFERENCES social_shares(id),
    source_click_id UUID REFERENCES link_clicks(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_social_shares_created_at ON social_shares(created_at);
CREATE INDEX IF NOT EXISTS idx_link_clicks_created_at ON link_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_conversions_created_at ON conversions(created_at);

-- RLS Policies (Row Level Security)
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion anonyme (tracking public)
CREATE POLICY "Allow anonymous inserts on social_shares" ON social_shares
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on link_clicks" ON link_clicks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on conversions" ON conversions
    FOR INSERT WITH CHECK (true);

-- Politique pour permettre la lecture des stats (pour les dashboards)
CREATE POLICY "Allow read access to social_shares" ON social_shares
    FOR SELECT USING (true);

CREATE POLICY "Allow read access to link_clicks" ON link_clicks
    FOR SELECT USING (true);

CREATE POLICY "Allow read access to conversions" ON conversions
    FOR SELECT USING (true);
