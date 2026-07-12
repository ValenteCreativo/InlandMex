# Inland Mex

Plataforma web para turismo regenerativo, inventario vivo de árboles y trazabilidad ambiental.

Inland Mex conecta experiencias de naturaleza en Iztapalapa con tecnología para registrar, monitorear y comunicar el impacto de la reforestación. El proyecto combina una landing pública para atraer visitantes con un dashboard privado para operar el inventario forestal.

## Problema

La reforestación no termina cuando se planta un árbol. El principal punto de fallo suele estar en el seguimiento: saber dónde está cada árbol, en qué estado se encuentra, quién lo plantó y qué necesita para sobrevivir.

Cuando el inventario crece, el monitoreo manual se vuelve lento, costoso y difícil de sostener. Inland Mex convierte ese seguimiento en una experiencia digital sencilla, verificable y socialmente reconocible.

## Solución

La plataforma tiene dos capas:

- **Sitio público**: comunica las experiencias de Inland Mex, rutas, misión, impacto y tecnología.
- **Admin privado**: permite operar el inventario de árboles, abrir un scanner móvil, revisar perfiles individuales y preparar reportes de impacto.

El flujo de demo permite:

- Abrir el scanner desde un celular.
- Capturar evidencia visual de un árbol.
- Obtener geolocalización del dispositivo.
- Simular una lectura visual de especie, salud y señales de campo.
- Actualizar un perfil individual del árbol.
- Abrir ese perfil desde un NFC.

El perfil del árbol muestra información como especie, nombre científico, estado visual, quién lo plantó, ubicación, fecha, señales de salud y una prueba de registro beta.

## Demo del Hackathon

El demo está diseñado como una simulación elegante de un sistema de inventario visual:

1. El admin abre `/admin/scan`.
2. La cámara muestra un overlay de detección tipo bounding box.
3. La captura actualiza perfiles beta preconfigurados:
   - `/plantas/IMX-Beta-01`
   - `/plantas/IMX-Beta-02`
   - `/plantas/IMX-Beta-03`
4. El NFC principal apunta a:

```txt
https://inland-mex.vercel.app/plantas/IMX-Beta-01
```

Así, durante la presentación, el árbol parece contener una identidad viva: foto reciente, ubicación, responsable, estado y señales visuales.

## Machine Learning y visión computacional

El pipeline de visión está diseñado alrededor de herramientas open-source usadas en producción para detección, tracking y anotación visual:

- [`roboflow/supervision`](https://github.com/roboflow/supervision) para normalizar detecciones, tracking con ByteTrack y visualización de bounding boxes.
- YOLO/Roboflow Inference como capa de predicción.
- OpenCV para procesamiento de frames y señales visuales básicas.
- Turso/libSQL para persistir inventario, observaciones y lotes.

Para el hackathon, el scanner web incluye una capa beta de inferencia simulada que permite demostrar el flujo completo de producto: cámara, evidencia, lectura visual, actualización del perfil y trazabilidad. El repo también incluye un script Python (`ml/process_inventory_video.py`) que procesa video con YOLO + Supervision y puede enviar observaciones al admin.

## Stack

- Next.js App Router
- React
- Turso/libSQL
- Roboflow Supervision
- YOLO / Ultralytics
- OpenCV
- Vercel

## Variables de entorno

```bash
TURSO_DATABASE_URL=...
TURSO_AUTH_TOKEN=...
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
ADMIN_INGEST_TOKEN=...
NEXT_PUBLIC_SITE_URL=https://inland-mex.vercel.app
```

## Scripts

```bash
npm install
npm run dev
npm run build
npm run db:schema
npm run db:seed
npm run db:phase2
```

## Pipeline ML

Instalar dependencias:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r ml/requirements.txt
```

Procesar un video de campo:

```bash
python ml/process_inventory_video.py path/to/field-walkthrough.mp4 \
  --model yolov8n.pt \
  --class-filter tree "potted plant" \
  --latitude 19.344353 \
  --longitude -98.989863
```

Enviar detecciones al admin:

```bash
python ml/process_inventory_video.py path/to/field-walkthrough.mp4 \
  --model yolov8n.pt \
  --api-url https://inland-mex.vercel.app/api/admin/ml-observations \
  --ingest-token "$ADMIN_INGEST_TOKEN"
```

## Roadmap

- Entrenar un modelo propio con fotos y videos reales de Inland Mex.
- Sincronizar video con GPS por recorrido.
- Subir evidencia a almacenamiento persistente.
- Agregar revisión humana de detecciones antes de consolidar árbol.
- Registrar observaciones validadas en blockchain.
- Convertir inventario y evidencia en reportes MRV para futuros bonos de carbono.

