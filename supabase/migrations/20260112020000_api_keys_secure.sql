-- Migration pour stocker les clés API de manière sécurisée
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key_name TEXT NOT NULL UNIQUE,
    encrypted_key TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'rate_limited', 'expired', 'disabled')),
    error_count INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys(status);
CREATE INDEX IF NOT EXISTS idx_api_keys_error_count ON api_keys(error_count);

-- RLS pour sécurité
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture/écriture par l'application
CREATE POLICY "Allow app access to api_keys" ON api_keys
    FOR ALL USING (true);
