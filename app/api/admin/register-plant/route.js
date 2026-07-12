import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash, randomUUID } from "crypto";
import { getDb } from "../../../../lib/db";

export const runtime = "nodejs";

const demoProfiles = [
  { species: "Pino Moctezuma", scientific: "Pinus montezumae", health: "young", label: "Planta joven · saludable", score: 0.94, growth: 28 },
  { species: "Fresno mexicano", scientific: "Fraxinus uhdei", health: "maturing", label: "En maduración · saludable", score: 0.88, growth: 96 },
  { species: "Encino", scientific: "Quercus rugosa", health: "deceased", label: "Sin vida · requiere reemplazo", score: 0.12, growth: 54 },
];

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
  if (!body.image || !body.planter) return NextResponse.json({ error: "Faltan la foto o el responsable." }, { status: 400 });
  if (body.image.length > 1_500_000) return NextResponse.json({ error: "La foto es demasiado grande." }, { status: 413 });

  const db = getDb();
  const requestedIndex = Number(body.demoIndex);
  let profileIndex = Number.isFinite(requestedIndex) ? requestedIndex : 0;
  if (!Number.isFinite(requestedIndex)) {
    const countResult = await db.execute("SELECT COUNT(*) AS count FROM trees WHERE notes LIKE '%hackathon-demo-v1%'");
    profileIndex = Number(countResult.rows[0]?.count || 0);
  }
  const profile = demoProfiles[Math.abs(profileIndex) % demoProfiles.length];
  const treeId = `tree-${randomUUID()}`;
  const publicCode = `IMX-${Date.now().toString(36).toUpperCase()}`;
  const createdAt = new Date().toISOString();
  const proofPayload = {
    tree_id: treeId,
    public_code: publicCode,
    species: profile.species,
    health_status: profile.health,
    latitude: Number(body.latitude),
    longitude: Number(body.longitude),
    planted_by: body.planter,
    captured_at: createdAt,
  };
  const txHash = `0x${createHash("sha256").update(JSON.stringify(proofPayload)).digest("hex")}`;
  const notes = JSON.stringify({
    schema: "hackathon-demo-v1",
    scientific_name: profile.scientific,
    planted_by: body.planter,
    confidence: profile.score,
    gps_accuracy_m: body.accuracy ?? null,
    proof_network: "Inland Proof Ledger · Hackathon Testnet",
    proof_payload: proofPayload,
  });

  await db.execute({
    sql: `INSERT INTO trees (id, public_code, species, latitude, longitude, zone, planted_at, health_status, growth_cm, image_url, onchain_tx_hash, token_id, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [treeId, publicCode, profile.species, Number(body.latitude), Number(body.longitude), "Sierra de Santa Catarina", createdAt, profile.health, profile.growth, body.image, txHash, publicCode, notes],
  });
  await db.execute({
    sql: `INSERT INTO tree_observations (id, tree_id, observed_at, health_score, growth_cm, image_url, ml_payload_json, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [`obs-${randomUUID()}`, treeId, createdAt, profile.score, profile.growth, body.image, JSON.stringify({ model: "inland-vision-demo-v1", species_confidence: profile.score, health_label: profile.label }), "Registro inicial desde cámara móvil."],
  });

  return NextResponse.json({
    ok: true,
    public_code: publicCode,
    species: profile.species,
    health_status: profile.health,
    health_label: profile.label,
    confidence: profile.score,
    tx_hash: txHash,
    profile_url: `/plantas/${publicCode}`,
  });
}
