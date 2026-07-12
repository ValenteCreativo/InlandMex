import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash, randomUUID } from "crypto";
import { getDb } from "../../../../lib/db";

export const runtime = "nodejs";

const demoProfiles = [
  {
    code: "IMX-Beta-01",
    id: "tree-imx-beta-01",
    species: "Violeta Africana",
    scientific: "Saintpaulia ionantha",
    health: "young",
    label: "Joven · hidratada · saludable",
    score: 0.96,
    growth: 18,
    plantedBy: "José Varela",
    plantedAt: "2026-07-12T10:00:00.000Z",
    signals: {
      height: "18 cm",
      growth: "activo",
      hydration: "hidratada",
      canopy: "compacta",
      recommendation: "luz indirecta y riego moderado",
    },
  },
  {
    code: "IMX-Beta-02",
    id: "tree-imx-beta-02",
    species: "Jacaranda",
    scientific: "Jacaranda mimosifolia",
    health: "mature",
    label: "Maduro · estable",
    score: 0.91,
    growth: 180,
    plantedBy: "Brigada Inland Mex",
    plantedAt: "2025-08-18T10:00:00.000Z",
    signals: {
      height: "1.8 m",
      growth: "consolidado",
      hydration: "estable",
      canopy: "alta",
      recommendation: "monitoreo de copa",
    },
  },
  {
    code: "IMX-Beta-03",
    id: "tree-imx-beta-03",
    species: "Encino",
    scientific: "Quercus rugosa",
    health: "dry",
    label: "Seco · requiere atención",
    score: 0.89,
    growth: 54,
    plantedBy: "Comunidad Inland Mex",
    plantedAt: "2025-05-04T10:00:00.000Z",
    signals: {
      height: "54 cm",
      growth: "detenido",
      hydration: "crítica",
      canopy: "ausente",
      recommendation: "reemplazo recomendado",
    },
  },
];

const demoAddress = "Izazaga 8, Centro Histórico, Ciudad de México";

function secretHash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function adminSessionHash() {
  return secretHash(`${process.env.ADMIN_EMAIL}:${process.env.ADMIN_PASSWORD}`);
}

export async function POST(request) {
  const cookieStore = await cookies();
  const validCookie = process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && cookieStore.get("inland_admin")?.value === adminSessionHash();
  if (!validCookie) return NextResponse.json({ error: "Sesión no autorizada." }, { status: 401 });

  const body = await request.json();
  if (!body.image) return NextResponse.json({ error: "Falta la foto." }, { status: 400 });
  if (body.image.length > 1_500_000) return NextResponse.json({ error: "La foto es demasiado grande." }, { status: 413 });

  const db = getDb();
  const latitude = Number.isFinite(Number(body.latitude)) ? Number(body.latitude) : 19.43213;
  const longitude = Number.isFinite(Number(body.longitude)) ? Number(body.longitude) : -99.13323;
  const profile = demoProfiles[0];
  const treeId = profile.id;
  const publicCode = profile.code;
  const createdAt = new Date().toISOString();
  const proofPayload = {
    tree_id: treeId,
    public_code: publicCode,
    species: profile.species,
    health_status: profile.health,
    latitude,
    longitude,
    planted_by: profile.plantedBy,
    captured_at: createdAt,
  };
  const txHash = `0x${createHash("sha256").update(JSON.stringify(proofPayload)).digest("hex")}`;
  const notes = JSON.stringify({
    schema: "hackathon-demo-v1",
    scientific_name: profile.scientific,
    planted_by: profile.plantedBy,
    planted_at_label: new Intl.DateTimeFormat("es-MX", { dateStyle: "long" }).format(new Date(profile.plantedAt)),
    confidence: profile.score,
    gps_accuracy_m: body.accuracy ?? null,
    address: demoAddress,
    visual_signals: profile.signals,
    last_reading_at: createdAt,
    reading_label: "Lectura visual reciente",
    proof_network: "Inland Proof Ledger · Hackathon Testnet",
    proof_payload: proofPayload,
  });

  await db.execute({
    sql: `INSERT INTO trees (id, public_code, species, latitude, longitude, zone, planted_at, health_status, growth_cm, image_url, onchain_tx_hash, token_id, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(public_code) DO UPDATE SET
            species = excluded.species,
            latitude = excluded.latitude,
            longitude = excluded.longitude,
            zone = excluded.zone,
            planted_at = excluded.planted_at,
            health_status = excluded.health_status,
            growth_cm = excluded.growth_cm,
            image_url = excluded.image_url,
            onchain_tx_hash = excluded.onchain_tx_hash,
            token_id = excluded.token_id,
            notes = excluded.notes`,
    args: [
      treeId, publicCode, profile.species, latitude, longitude, demoAddress, profile.plantedAt, profile.health, profile.growth, body.image, txHash, publicCode, notes,
    ],
  });
  const treeRow = await db.execute({ sql: "SELECT id FROM trees WHERE public_code = ? LIMIT 1", args: [publicCode] });
  const observationTreeId = treeRow.rows[0]?.id || treeId;
  await db.execute({
    sql: `INSERT INTO tree_observations (id, tree_id, observed_at, health_score, growth_cm, image_url, ml_payload_json, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [`obs-${randomUUID()}`, observationTreeId, createdAt, profile.score, profile.growth, body.image, JSON.stringify({ model: "inland-vision-beta", species_confidence: profile.score, health_label: profile.label, signals: profile.signals }), "Lectura visual actualizada desde cámara móvil."],
  });

  return NextResponse.json({
    ok: true,
    public_code: publicCode,
    species: profile.species,
    health_status: profile.health,
    health_label: profile.label,
    confidence: profile.score,
    scientific_name: profile.scientific,
    planted_by: profile.plantedBy,
    planted_at: profile.plantedAt,
    address: demoAddress,
    growth_cm: profile.growth,
    signals: profile.signals,
    tx_hash: txHash,
    profile_url: `/plantas/${publicCode}`,
  });
}
