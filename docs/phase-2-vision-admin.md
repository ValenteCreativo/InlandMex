# Inland Mex Fase 2: Admin + Inventario Visual ML

## Decisión técnica

Usamos `roboflow/supervision` como capa de tracking/anotación, no como base de datos ni backend. Supervision recibe predicciones de un modelo como YOLO o Roboflow Inference, las normaliza como `Detections`, asigna IDs temporales con `ByteTrack` y permite generar evidencia visual del recorrido.

Fuentes revisadas:

- Supervision docs: `Detections.from_ultralytics`, `process_video` y anotadores para video.
- Supervision tracking docs: `ByteTrack.update_with_detections`.
- GitHub `roboflow/supervision`: librería open-source para herramientas reutilizables de visión computacional.

## Flujo MVP

1. El equipo graba video con celular durante un recorrido.
2. El script `ml/process_inventory_video.py` procesa el video.
3. El modelo detecta candidatos de arboles por frame.
4. `supervision.ByteTrack` agrupa detecciones por objeto temporal.
5. El script consolida cada track en una detección revisable.
6. El endpoint `/api/admin/ml-observations` guarda lote, media y detecciones en Turso.
7. `/admin` muestra inventario, lotes y cola de revisión.
8. Un humano valida o liga cada detección a un `tree_id`.

## Setup

Variables en Vercel/local:

```bash
ADMIN_PASSWORD=...
ADMIN_INGEST_TOKEN=...
TURSO_DATABASE_URL=...
TURSO_AUTH_TOKEN=...
```

Aplicar tablas de Fase 2:

```bash
npm run db:phase2
```

Instalar pipeline Python:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r ml/requirements.txt
```

Procesar un video y guardar JSON local:

```bash
python ml/process_inventory_video.py public/Video1.mp4 \
  --model yolov8n.pt \
  --class-filter tree "potted plant" \
  --latitude 19.344353 \
  --longitude -98.989863
```

Procesar e ingresar al admin desplegado:

```bash
python ml/process_inventory_video.py public/Video1.mp4 \
  --model yolov8n.pt \
  --api-url https://inland-mex.vercel.app/api/admin/ml-observations \
  --ingest-token "$ADMIN_INGEST_TOKEN"
```

## Lo que falta para producción

- Entrenar un modelo propio en Roboflow con videos/fotos reales de Inland Mex.
- Capturar GPS por recorrido, idealmente exportado como GPX o JSON y sincronizado por timestamp/frame.
- Agregar UI de revisión para aceptar detecciones y ligarlas a `trees`.
- Subir evidencia visual a storage persistente.
- Calibrar crecimiento con referencia física en campo, porque estimar cm reales desde video sin escala es débil.
- Definir el evento canónico que Fase 3 registrará en blockchain: alta de árbol, observación validada, patrocinio o certificación de impacto.
