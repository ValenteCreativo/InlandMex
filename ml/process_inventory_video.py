#!/usr/bin/env python3
"""
Process a field video, track tree detections, and optionally post results to Inland Mex.

Example:
  python ml/process_inventory_video.py path/to/field-walkthrough.mp4 \
    --model yolov8n.pt \
    --class-filter tree potted plant \
    --api-url https://inland-mex.vercel.app/api/admin/ml-observations \
    --ingest-token "$ADMIN_INGEST_TOKEN"
"""

from __future__ import annotations

import argparse
import json
import os
import statistics
import uuid
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

import cv2
import requests
import supervision as sv
from ultralytics import YOLO


def make_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4()}"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Inland Mex visual inventory pipeline")
    parser.add_argument("video", help="Path to the source field video")
    parser.add_argument("--model", default=os.getenv("INLAND_ML_MODEL", "yolov8n.pt"))
    parser.add_argument("--batch-id", default=f"batch-visual-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}")
    parser.add_argument("--captured-by", default="Inland Mex field team")
    parser.add_argument("--class-filter", nargs="*", default=["tree", "potted plant"])
    parser.add_argument("--confidence", type=float, default=0.25)
    parser.add_argument("--sample-every", type=int, default=8, help="Run inference every N frames")
    parser.add_argument("--latitude", type=float)
    parser.add_argument("--longitude", type=float)
    parser.add_argument("--api-url", default=os.getenv("INLAND_ADMIN_INGEST_URL"))
    parser.add_argument("--ingest-token", default=os.getenv("ADMIN_INGEST_TOKEN"))
    parser.add_argument("--output-json", default="ml/output/latest-visual-inventory.json")
    parser.add_argument("--annotated-video", default="")
    return parser.parse_args()


def bbox_to_payload(xyxy: list[float]) -> dict[str, float]:
    x1, y1, x2, y2 = [float(value) for value in xyxy]
    return {"x": x1, "y": y1, "width": x2 - x1, "height": y2 - y1}


def estimate_health_score(frame, xyxy: list[float]) -> float | None:
    height, width = frame.shape[:2]
    x1, y1, x2, y2 = [int(round(value)) for value in xyxy]
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(width - 1, x2), min(height - 1, y2)
    if x2 <= x1 or y2 <= y1:
        return None

    crop = frame[y1:y2, x1:x2]
    if crop.size == 0:
        return None

    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    green_mask = cv2.inRange(hsv, (30, 35, 35), (95, 255, 255))
    green_ratio = float(cv2.countNonZero(green_mask)) / float(crop.shape[0] * crop.shape[1])
    return max(0.0, min(1.0, green_ratio * 1.8))


def health_status(score: float | None) -> str:
    if score is None:
        return "unknown"
    if score >= 0.62:
        return "healthy"
    if score >= 0.34:
        return "watch"
    return "stressed"


def process_video(args: argparse.Namespace) -> dict:
    source_path = Path(args.video)
    output_path = Path(args.output_json)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    model = YOLO(args.model)
    tracker = sv.ByteTrack(track_thresh=args.confidence)
    cap = cv2.VideoCapture(str(source_path))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    duration = frame_count / fps if frame_count else None

    writer = None
    box_annotator = sv.BoundingBoxAnnotator()
    label_annotator = sv.LabelAnnotator()
    if args.annotated_video:
      video_info = sv.VideoInfo.from_video_path(str(source_path))
      writer = cv2.VideoWriter(
          args.annotated_video,
          cv2.VideoWriter_fourcc(*"mp4v"),
          video_info.fps,
          (video_info.width, video_info.height),
      )

    names = model.names
    wanted = {item.lower() for item in args.class_filter}
    tracks = defaultdict(list)
    frame_index = 0

    while True:
        ok, frame = cap.read()
        if not ok:
            break

        if frame_index % max(args.sample_every, 1) != 0:
            frame_index += 1
            continue

        result = model(frame, conf=args.confidence, verbose=False)[0]
        detections = sv.Detections.from_ultralytics(result)

        if len(detections) and wanted:
            keep = []
            for class_id in detections.class_id:
                keep.append(names.get(int(class_id), str(class_id)).lower() in wanted)
            detections = detections[keep]

        detections = tracker.update_with_detections(detections)

        if writer:
            labels = []
            for class_id, tracker_id, confidence in zip(detections.class_id, detections.tracker_id, detections.confidence):
                labels.append(f"#{tracker_id} {names.get(int(class_id), 'object')} {confidence:.2f}")
            annotated = box_annotator.annotate(frame.copy(), detections=detections)
            annotated = label_annotator.annotate(annotated, detections=detections, labels=labels)
            writer.write(annotated)

        for xyxy, confidence, class_id, tracker_id in zip(
            detections.xyxy,
            detections.confidence,
            detections.class_id,
            detections.tracker_id,
        ):
            score = estimate_health_score(frame, xyxy.tolist())
            tracks[int(tracker_id)].append(
                {
                    "frame_index": frame_index,
                    "confidence": float(confidence),
                    "class_name": names.get(int(class_id), "tree"),
                    "bbox": bbox_to_payload(xyxy.tolist()),
                    "health_score": score,
                    "health_status": health_status(score),
                }
            )

        frame_index += 1

    cap.release()
    if writer:
        writer.release()

    detections_payload = []
    for tracker_id, observations in tracks.items():
        best = max(observations, key=lambda item: item["confidence"])
        scores = [item["health_score"] for item in observations if item["health_score"] is not None]
        mean_score = statistics.mean(scores) if scores else None
        detections_payload.append(
            {
                "id": make_id("det"),
                "tracker_id": tracker_id,
                "frame_index": best["frame_index"],
                "confidence": best["confidence"],
                "class_name": best["class_name"],
                "bbox": best["bbox"],
                "latitude": args.latitude,
                "longitude": args.longitude,
                "health_score": mean_score,
                "health_status": health_status(mean_score),
                "review_status": "pending",
                "notes": f"Track consolidado desde {len(observations)} detecciones de video.",
            }
        )

    payload = {
        "model_version": str(args.model),
        "batch": {
            "id": args.batch_id,
            "captured_by": args.captured_by,
            "source": "visual-ml-video",
            "model_version": str(args.model),
            "status": "ml_pending_review",
        },
        "media": {
            "id": make_id("media"),
            "local_path": str(source_path),
            "media_type": "video",
            "latitude": args.latitude,
            "longitude": args.longitude,
            "duration_seconds": duration,
            "frame_count": frame_count,
            "status": "processed",
        },
        "detections": detections_payload,
    }

    output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False))
    return payload


def post_payload(payload: dict, api_url: str, ingest_token: str) -> requests.Response:
    return requests.post(
        api_url,
        json=payload,
        headers={"Authorization": f"Bearer {ingest_token}"},
        timeout=60,
    )


def main() -> None:
    args = parse_args()
    payload = process_video(args)
    print(f"Created {len(payload['detections'])} consolidated detections")
    print(f"Wrote {args.output_json}")

    if args.api_url and args.ingest_token:
        response = post_payload(payload, args.api_url, args.ingest_token)
        print(f"POST {args.api_url} -> {response.status_code}")
        print(response.text)
    else:
        print("Skipping API ingest because --api-url or --ingest-token is missing")


if __name__ == "__main__":
    main()
