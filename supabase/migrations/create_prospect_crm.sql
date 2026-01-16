-- Table: prospect_sessions
-- Stocke les sessions de conversation des prospects
CREATE TABLE IF NOT EXISTS prospect_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL,
  referrer_id TEXT NOT NULL, -- ID du distributeur (ex: "067-2922111")
  referrer_web_alias TEXT, -- Alias NeoLife du distributeur
  device_fingerprint TEXT, -- Hash unique du device pour reconnaître les retours
  first_visit TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  total_messages INTEGER DEFAULT 0,
  conversation_duration INTEGER DEFAULT 0, -- en secondes
  consent_given BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: conversation_messages
-- Stocke chaque message de la conversation
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES prospect_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'model')),
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: prospect_metrics
-- Métriques comportementales pour le lead scoring
CREATE TABLE IF NOT EXISTS prospect_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES prospect_sessions(id) ON DELETE CASCADE,
  intent TEXT CHECK (intent IN ('HEALTH', 'BUSINESS', 'GENERAL', 'BOTH')),
  products_viewed TEXT[], -- Array de SKUs
  links_clicked INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  ready_to_buy BOOLEAN DEFAULT false,
  ready_to_recruit BOOLEAN DEFAULT false,
  last_topic TEXT,
  pain_points TEXT[], -- Points de douleur exprimés
  objections TEXT[], -- Objections soulevées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: prospect_contacts (optionnel - si prospect donne ses infos)
CREATE TABLE IF NOT EXISTS prospect_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES prospect_sessions(id) ON DELETE CASCADE,
  whatsapp TEXT,
  email TEXT,
  name TEXT,
  consent_marketing BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_sessions_referrer ON prospect_sessions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_sessions_prospect ON prospect_sessions(prospect_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON prospect_sessions(last_activity);
CREATE INDEX IF NOT EXISTS idx_messages_session ON conversation_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_metrics_session ON prospect_metrics(session_id);

-- RLS (Row Level Security) - Les distributeurs ne voient que leurs prospects
ALTER TABLE prospect_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_contacts ENABLE ROW LEVEL SECURITY;

-- Policy: Les distributeurs voient uniquement leurs propres prospects
CREATE POLICY "Distributors see own prospects" ON prospect_sessions
  FOR SELECT
  USING (referrer_id = auth.jwt() ->> 'subscriber_id');

CREATE POLICY "Distributors see own messages" ON conversation_messages
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM prospect_sessions WHERE referrer_id = auth.jwt() ->> 'subscriber_id'
    )
  );

CREATE POLICY "Distributors see own metrics" ON prospect_metrics
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM prospect_sessions WHERE referrer_id = auth.jwt() ->> 'subscriber_id'
    )
  );

CREATE POLICY "Distributors see own contacts" ON prospect_contacts
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM prospect_sessions WHERE referrer_id = auth.jwt() ->> 'subscriber_id'
    )
  );

-- Policy: Les prospects anonymes peuvent créer/modifier leurs propres sessions
CREATE POLICY "Prospects can insert sessions" ON prospect_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Prospects can update own sessions" ON prospect_sessions
  FOR UPDATE
  USING (prospect_id::text = current_setting('app.prospect_id', true));

CREATE POLICY "Prospects can insert messages" ON conversation_messages
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Prospects can insert metrics" ON prospect_metrics
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Prospects can update metrics" ON prospect_metrics
  FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM prospect_sessions WHERE prospect_id::text = current_setting('app.prospect_id', true)
    )
  );
