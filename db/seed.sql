INSERT INTO inventory_batches (id, captured_by, source, model_version, status, notes)
VALUES ('batch-initial-2026-07', 'Inland Mex', 'field-list', NULL, 'verified', 'Inventario inicial cargado desde coordenadas reales compartidas por el equipo.')
ON CONFLICT(id) DO UPDATE SET
  captured_by = excluded.captured_by,
  source = excluded.source,
  model_version = excluded.model_version,
  status = excluded.status,
  notes = excluded.notes;

INSERT INTO trees (id, public_code, species, latitude, longitude, zone, inventory_batch_id, notes)
VALUES
  ('tree-arb-001', 'ARB-001', 'Fresno', 19.344353, -98.989863, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-002', 'ARB-002', 'Fresno', 19.344718, -98.989436, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-003', 'ARB-003', 'Jacaranda', 19.344684, -98.989477, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-004', 'ARB-004', 'Liquidambar', 19.344680, -98.989476, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-005', 'ARB-005', 'Fresno', 19.344712, -98.989477, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-006', 'ARB-006', 'Liquidambar', 19.344690, -98.989500, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-007', 'ARB-007', 'Jacaranda', 19.344399, -98.989627, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-008', 'ARB-008', 'Jacaranda', 19.344365, -98.989624, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-009', 'ARB-009', 'Fresno', 19.344304, -98.989621, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-010', 'ARB-010', 'Jacaranda', 19.344403, -98.989670, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-011', 'ARB-011', 'Jacaranda', 19.344423, -98.989630, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-012', 'ARB-012', 'Fresno', 19.344438, -98.989633, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-013', 'ARB-013', 'Liquidambar', 19.343984, -98.989675, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-014', 'ARB-014', 'Jacaranda', 19.343971, -98.989713, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-015', 'ARB-015', 'Liquidambar', 19.343957, -98.989763, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-016', 'ARB-016', 'Liquidambar', 19.344015, -98.989755, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-017', 'ARB-017', 'Pata de vaca', 19.343967, -98.989737, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-018', 'ARB-018', 'Fresno', 19.346147, -98.990391, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-019', 'ARB-019', 'Fresno', 19.345930, -98.990362, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-020', 'ARB-020', 'Jacaranda', 19.345875, -98.990329, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-021', 'ARB-021', 'Fresno', 19.345848, -98.990320, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-022', 'ARB-022', 'Fresno', 19.345758, -98.990412, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-023', 'ARB-023', 'Arce rojo', 19.345763, -98.990450, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-024', 'ARB-024', 'Fresno', 19.345772, -98.990536, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-025', 'ARB-025', 'Liquidambar', 19.345774, -98.990555, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-026', 'ARB-026', 'Jacaranda', 19.345704, -98.990408, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-027', 'ARB-027', 'Jacaranda', 19.345677, -98.990405, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-028', 'ARB-028', 'Arce rojo', 19.345314, -98.990372, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-029', 'ARB-029', 'Jacaranda', 19.344967, -98.990443, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-030', 'ARB-030', 'Jacaranda', 19.344269, -98.990798, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-031', 'ARB-031', 'Jacaranda', 19.344722, -98.991266, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-032', 'ARB-032', 'Liquidambar', 19.344726, -98.989531, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-033', 'ARB-033', 'Fresno', 19.344766, -98.989541, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-034', 'ARB-034', 'Fresno', 19.344804, -98.989536, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-035', 'ARB-035', 'Fresno', 19.344919, -98.989527, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-036', 'ARB-036', 'Fresno', 19.344871, -98.989594, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-037', 'ARB-037', 'Fresno', 19.244816, -98.989576, 'Iztapalapa', 'batch-initial-2026-07', 'Revisar latitud: posible captura 19.344816.'),
  ('tree-arb-038', 'ARB-038', 'Liquidambar', 19.344680, -98.989476, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-039', 'ARB-039', 'Fresno', NULL, NULL, 'Iztapalapa', 'batch-initial-2026-07', 'Ubicación pendiente.'),
  ('tree-arb-040', 'ARB-040', 'Fresno', 19.346527, -98.989371, 'Iztapalapa', 'batch-initial-2026-07', NULL),
  ('tree-arb-041', 'ARB-041', 'Fresno', NULL, NULL, 'Iztapalapa', 'batch-initial-2026-07', 'Ubicación pendiente.')
ON CONFLICT(public_code) DO UPDATE SET
  species = excluded.species,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  zone = excluded.zone,
  inventory_batch_id = excluded.inventory_batch_id,
  notes = excluded.notes;

INSERT INTO trees (id, public_code, species, latitude, longitude, zone, planted_at, health_status, growth_cm, image_url, onchain_tx_hash, token_id, notes)
VALUES
  (
    'tree-imx-beta-01',
    'IMX-Beta-01',
    'Violeta Africana',
    19.43213,
    -99.13323,
    'Izazaga 8, Centro Histórico, Ciudad de México',
    '2026-07-12T10:00:00.000Z',
    'young',
    18,
    '/fotos/website/3.png',
    '0xbeta01',
    'IMX-Beta-01',
    '{"schema":"beta-profile-v1","scientific_name":"Saintpaulia ionantha","planted_by":"José Varela","confidence":0.96,"address":"Izazaga 8, Centro Histórico, Ciudad de México","reading_label":"Lectura visual reciente","visual_signals":{"height":"18 cm","growth":"activo","hydration":"hidratada","canopy":"compacta","recommendation":"luz indirecta y riego moderado"},"proof_network":"Inland Proof Ledger · Beta"}'
  ),
  (
    'tree-imx-beta-02',
    'IMX-Beta-02',
    'Jacaranda',
    19.43213,
    -99.13323,
    'Izazaga 8, Centro Histórico, Ciudad de México',
    '2025-08-18T10:00:00.000Z',
    'mature',
    180,
    '/fotos/website/4.png',
    '0xbeta02',
    'IMX-Beta-02',
    '{"schema":"beta-profile-v1","scientific_name":"Jacaranda mimosifolia","planted_by":"Brigada Inland Mex","confidence":0.91,"address":"Izazaga 8, Centro Histórico, Ciudad de México","reading_label":"Lectura visual reciente","visual_signals":{"height":"1.8 m","growth":"consolidado","hydration":"estable","canopy":"alta","recommendation":"monitoreo de copa"},"proof_network":"Inland Proof Ledger · Beta"}'
  ),
  (
    'tree-imx-beta-03',
    'IMX-Beta-03',
    'Encino',
    19.43213,
    -99.13323,
    'Izazaga 8, Centro Histórico, Ciudad de México',
    '2025-05-04T10:00:00.000Z',
    'dry',
    54,
    '/fotos/website/5.png',
    '0xbeta03',
    'IMX-Beta-03',
    '{"schema":"beta-profile-v1","scientific_name":"Quercus rugosa","planted_by":"Comunidad Inland Mex","confidence":0.89,"address":"Izazaga 8, Centro Histórico, Ciudad de México","reading_label":"Lectura visual reciente","visual_signals":{"height":"54 cm","growth":"detenido","hydration":"crítica","canopy":"ausente","recommendation":"reemplazo recomendado"},"proof_network":"Inland Proof Ledger · Beta"}'
  )
ON CONFLICT(public_code) DO UPDATE SET
  species = excluded.species,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  zone = excluded.zone,
  planted_at = excluded.planted_at,
  health_status = excluded.health_status,
  growth_cm = excluded.growth_cm,
  image_url = CASE WHEN trees.image_url IS NULL OR trees.image_url LIKE '/fotos/%' THEN excluded.image_url ELSE trees.image_url END,
  onchain_tx_hash = CASE WHEN trees.onchain_tx_hash IS NULL OR trees.onchain_tx_hash LIKE '0xbeta%' THEN excluded.onchain_tx_hash ELSE trees.onchain_tx_hash END,
  token_id = excluded.token_id,
  notes = CASE WHEN trees.notes IS NULL OR trees.notes LIKE '%beta-profile-v1%' THEN excluded.notes ELSE trees.notes END;

INSERT INTO impact_stats (key, label, value, unit, sort_order)
VALUES
  ('trees_planted', 'Árboles plantados', '400+', NULL, 1),
  ('co2_restored', 'CO2 restaurado', '38.5', 't', 2),
  ('active_zones', 'Zonas activas', '12', NULL, 3),
  ('tour_tree_goal', 'Meta tour-árbol', '1:1', NULL, 4)
ON CONFLICT(key) DO UPDATE SET
  label = excluded.label,
  value = excluded.value,
  unit = excluded.unit,
  sort_order = excluded.sort_order,
  updated_at = CURRENT_TIMESTAMP;
