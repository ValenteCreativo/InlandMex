PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS inventory_media (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL REFERENCES inventory_batches(id) ON DELETE CASCADE,
  source_url TEXT,
  local_path TEXT,
  media_type TEXT NOT NULL DEFAULT 'video',
  captured_at TEXT,
  latitude REAL,
  longitude REAL,
  gps_track_json TEXT,
  duration_seconds REAL,
  frame_count INTEGER,
  status TEXT NOT NULL DEFAULT 'uploaded',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_media_batch_id ON inventory_media(batch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_media_status ON inventory_media(status);

CREATE TABLE IF NOT EXISTS visual_tree_detections (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL REFERENCES inventory_batches(id) ON DELETE CASCADE,
  media_id TEXT REFERENCES inventory_media(id) ON DELETE SET NULL,
  tree_id TEXT REFERENCES trees(id) ON DELETE SET NULL,
  tracker_id INTEGER,
  frame_index INTEGER,
  observed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  latitude REAL,
  longitude REAL,
  bbox_x REAL,
  bbox_y REAL,
  bbox_width REAL,
  bbox_height REAL,
  confidence REAL,
  class_name TEXT NOT NULL DEFAULT 'tree',
  health_score REAL,
  health_status TEXT NOT NULL DEFAULT 'unknown',
  growth_estimate_cm REAL,
  evidence_url TEXT,
  annotated_frame_url TEXT,
  ml_payload_json TEXT,
  review_status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_visual_tree_detections_batch_id ON visual_tree_detections(batch_id);
CREATE INDEX IF NOT EXISTS idx_visual_tree_detections_tree_id ON visual_tree_detections(tree_id);
CREATE INDEX IF NOT EXISTS idx_visual_tree_detections_review_status ON visual_tree_detections(review_status);
CREATE INDEX IF NOT EXISTS idx_visual_tree_detections_tracker ON visual_tree_detections(batch_id, tracker_id);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id TEXT PRIMARY KEY,
  actor TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  payload_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_entity ON admin_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);
