PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS inventory_batches (
  id TEXT PRIMARY KEY,
  captured_by TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  model_version TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trees (
  id TEXT PRIMARY KEY,
  public_code TEXT NOT NULL UNIQUE,
  species TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  zone TEXT,
  planted_at TEXT,
  health_status TEXT NOT NULL DEFAULT 'unknown',
  growth_cm REAL,
  image_url TEXT,
  inventory_batch_id TEXT REFERENCES inventory_batches(id) ON DELETE SET NULL,
  onchain_tx_hash TEXT,
  token_id TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trees_species ON trees(species);
CREATE INDEX IF NOT EXISTS idx_trees_coordinates ON trees(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_trees_health_status ON trees(health_status);

CREATE TABLE IF NOT EXISTS tree_observations (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  batch_id TEXT REFERENCES inventory_batches(id) ON DELETE SET NULL,
  observed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  health_score REAL,
  growth_cm REAL,
  image_url TEXT,
  ml_payload_json TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_tree_observations_tree_id ON tree_observations(tree_id);
CREATE INDEX IF NOT EXISTS idx_tree_observations_batch_id ON tree_observations(batch_id);

CREATE TABLE IF NOT EXISTS tour_bookings (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  instagram TEXT,
  experience_type TEXT NOT NULL,
  party_size INTEGER NOT NULL DEFAULT 1,
  preferred_date TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending_deposit',
  deposit_amount_cents INTEGER NOT NULL DEFAULT 45000,
  total_amount_cents INTEGER NOT NULL DEFAULT 85000,
  proof_url TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tour_bookings_status ON tour_bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_tour_bookings_date ON tour_bookings(preferred_date);

CREATE TABLE IF NOT EXISTS sponsorships (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  sponsor_name TEXT NOT NULL,
  sponsor_contact TEXT,
  amount_cents INTEGER,
  status TEXT NOT NULL DEFAULT 'pledged',
  nft_contract TEXT,
  nft_token_id TEXT,
  onchain_tx_hash TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sponsorships_tree_id ON sponsorships(tree_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_status ON sponsorships(status);

CREATE TABLE IF NOT EXISTS impact_stats (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS trees_touch_updated_at
AFTER UPDATE ON trees
FOR EACH ROW
WHEN OLD.updated_at = NEW.updated_at
BEGIN
  UPDATE trees SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS tour_bookings_touch_updated_at
AFTER UPDATE ON tour_bookings
FOR EACH ROW
WHEN OLD.updated_at = NEW.updated_at
BEGIN
  UPDATE tour_bookings SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS sponsorships_touch_updated_at
AFTER UPDATE ON sponsorships
FOR EACH ROW
WHEN OLD.updated_at = NEW.updated_at
BEGIN
  UPDATE sponsorships SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
