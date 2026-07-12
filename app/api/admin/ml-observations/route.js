import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDb } from "../../../../lib/db";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function id(prefix) {
  return `${prefix}-${randomUUID()}`;
}

function readBearer(request) {
  const header = request.headers.get("authorization") || "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

export async function POST(request) {
  if (!process.env.ADMIN_INGEST_TOKEN || readBearer(request) !== process.env.ADMIN_INGEST_TOKEN) {
    return unauthorized();
  }

  const payload = await request.json();
  const batch = payload.batch || {};
  const media = payload.media || {};
  const detections = Array.isArray(payload.detections) ? payload.detections : [];
  const db = getDb();

  const batchId = batch.id || id("batch");
  const mediaId = media.id || (media.source_url || media.local_path ? id("media") : null);

  await db.execute({
    sql: `INSERT INTO inventory_batches (id, captured_by, source, model_version, status, notes)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            captured_by = excluded.captured_by,
            source = excluded.source,
            model_version = excluded.model_version,
            status = excluded.status,
            notes = excluded.notes`,
    args: [
      batchId,
      batch.captured_by || "ML pipeline",
      batch.source || "visual-ml",
      batch.model_version || payload.model_version || null,
      batch.status || "ml_pending_review",
      batch.notes || null,
    ],
  });

  if (mediaId) {
    await db.execute({
      sql: `INSERT INTO inventory_media (
              id, batch_id, source_url, local_path, media_type, captured_at,
              latitude, longitude, gps_track_json, duration_seconds, frame_count, status, notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              source_url = excluded.source_url,
              local_path = excluded.local_path,
              status = excluded.status,
              notes = excluded.notes`,
      args: [
        mediaId,
        batchId,
        media.source_url || null,
        media.local_path || null,
        media.media_type || "video",
        media.captured_at || null,
        media.latitude ?? null,
        media.longitude ?? null,
        media.gps_track_json ? JSON.stringify(media.gps_track_json) : null,
        media.duration_seconds ?? null,
        media.frame_count ?? null,
        media.status || "processed",
        media.notes || null,
      ],
    });
  }

  for (const detection of detections) {
    const detectionId = detection.id || id("det");
    const mlPayload = {
      ...detection,
      source_payload_version: "phase2-visual-detection-v1",
    };

    await db.execute({
      sql: `INSERT INTO visual_tree_detections (
              id, batch_id, media_id, tree_id, tracker_id, frame_index, observed_at,
              latitude, longitude, bbox_x, bbox_y, bbox_width, bbox_height, confidence,
              class_name, health_score, health_status, growth_estimate_cm, evidence_url,
              annotated_frame_url, ml_payload_json, review_status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              tree_id = excluded.tree_id,
              confidence = excluded.confidence,
              health_score = excluded.health_score,
              health_status = excluded.health_status,
              review_status = excluded.review_status,
              ml_payload_json = excluded.ml_payload_json`,
      args: [
        detectionId,
        batchId,
        detection.media_id || mediaId,
        detection.tree_id || null,
        detection.tracker_id ?? null,
        detection.frame_index ?? null,
        detection.observed_at || new Date().toISOString(),
        detection.latitude ?? null,
        detection.longitude ?? null,
        detection.bbox?.x ?? detection.bbox_x ?? null,
        detection.bbox?.y ?? detection.bbox_y ?? null,
        detection.bbox?.width ?? detection.bbox_width ?? null,
        detection.bbox?.height ?? detection.bbox_height ?? null,
        detection.confidence ?? null,
        detection.class_name || "tree",
        detection.health_score ?? null,
        detection.health_status || "unknown",
        detection.growth_estimate_cm ?? null,
        detection.evidence_url || null,
        detection.annotated_frame_url || null,
        JSON.stringify(mlPayload),
        detection.review_status || "pending",
      ],
    });

    if (detection.tree_id) {
      await db.execute({
        sql: `INSERT INTO tree_observations (
                id, tree_id, batch_id, observed_at, health_score, growth_cm,
                image_url, ml_payload_json, notes
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id("obs"),
          detection.tree_id,
          batchId,
          detection.observed_at || new Date().toISOString(),
          detection.health_score ?? null,
          detection.growth_estimate_cm ?? null,
          detection.evidence_url || detection.annotated_frame_url || null,
          JSON.stringify(mlPayload),
          detection.notes || "Observacion generada por pipeline visual ML.",
        ],
      });
    }
  }

  await db.execute({
    sql: `INSERT INTO admin_audit_log (id, actor, action, entity_type, entity_id, payload_json)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      id("audit"),
      "ml-pipeline",
      "ingest_visual_detections",
      "inventory_batch",
      batchId,
      JSON.stringify({ detections: detections.length, media_id: mediaId }),
    ],
  });

  return NextResponse.json({ ok: true, batch_id: batchId, media_id: mediaId, detections: detections.length });
}
