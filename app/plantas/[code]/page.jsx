import { notFound } from "next/navigation";
import { createHash } from "crypto";
import { getDb } from "../../../lib/db";

export const dynamic = "force-dynamic";

const betaProfiles = {
  "IMX-Beta-01": {
    id: "tree-imx-beta-01",
    public_code: "IMX-Beta-01",
    species: "Violeta Africana",
    health_status: "young",
    growth_cm: 18,
    latitude: 19.43213,
    longitude: -99.13323,
    zone: "Izazaga 8, Centro Histórico, Ciudad de México",
    planted_at: "2026-07-12T10:00:00.000Z",
    image_url: "/fotos/website/3.png",
    notes: JSON.stringify({
      scientific_name: "Saintpaulia ionantha",
      planted_by: "José Varela",
      confidence: 0.96,
      address: "Izazaga 8, Centro Histórico, Ciudad de México",
      reading_label: "Lectura visual reciente",
      visual_signals: {
        height: "18 cm",
        growth: "activo",
        hydration: "hidratada",
        canopy: "compacta",
        recommendation: "luz indirecta y riego moderado",
      },
    }),
  },
  "IMX-Beta-02": {
    id: "tree-imx-beta-02",
    public_code: "IMX-Beta-02",
    species: "Jacaranda",
    health_status: "mature",
    growth_cm: 180,
    latitude: 19.43213,
    longitude: -99.13323,
    zone: "Izazaga 8, Centro Histórico, Ciudad de México",
    planted_at: "2025-08-18T10:00:00.000Z",
    image_url: "/fotos/website/4.png",
    notes: JSON.stringify({
      scientific_name: "Jacaranda mimosifolia",
      planted_by: "Brigada Inland Mex",
      confidence: 0.91,
      address: "Izazaga 8, Centro Histórico, Ciudad de México",
      reading_label: "Lectura visual reciente",
      visual_signals: {
        height: "1.8 m",
        growth: "consolidado",
        hydration: "estable",
        canopy: "alta",
        recommendation: "monitoreo de copa",
      },
    }),
  },
  "IMX-Beta-03": {
    id: "tree-imx-beta-03",
    public_code: "IMX-Beta-03",
    species: "Encino",
    health_status: "dry",
    growth_cm: 54,
    latitude: 19.43213,
    longitude: -99.13323,
    zone: "Izazaga 8, Centro Histórico, Ciudad de México",
    planted_at: "2025-05-04T10:00:00.000Z",
    image_url: "/fotos/website/5.png",
    notes: JSON.stringify({
      scientific_name: "Quercus rugosa",
      planted_by: "Comunidad Inland Mex",
      confidence: 0.89,
      address: "Izazaga 8, Centro Histórico, Ciudad de México",
      reading_label: "Lectura visual reciente",
      visual_signals: {
        height: "54 cm",
        growth: "detenido",
        hydration: "crítica",
        canopy: "ausente",
        recommendation: "reemplazo recomendado",
      },
    }),
  },
};

const healthLabels = {
  young: "Joven",
  mature: "Maduro",
  maturing: "Maduro",
  dry: "Seco",
  deceased: "Seco",
  healthy: "Saludable",
  unknown: "Observación",
};

function proofHash(tree) {
  return tree.onchain_tx_hash || `0x${createHash("sha256").update(`${tree.public_code}:${tree.species}`).digest("hex")}`;
}

function parseDetails(tree) {
  try {
    return JSON.parse(tree.notes || "{}");
  } catch {
    return {};
  }
}

function enrichTree(tree) {
  const details = parseDetails(tree);
  const plantedAt = tree.planted_at || tree.created_at || "2026-07-12T10:00:00.000Z";
  const fallbackSignals = {
    height: tree.growth_cm ? `${tree.growth_cm} cm` : "pendiente",
    growth: tree.health_status === "unknown" ? "en observación" : "estable",
    hydration: "estable",
    canopy: "media",
    recommendation: "seguimiento mensual",
  };

  return {
    ...tree,
    species: tree.public_code === "IMX-Beta-01" ? "Violeta Africana" : tree.species,
    growth_cm: tree.public_code === "IMX-Beta-01" ? 18 : tree.growth_cm,
    image_url: tree.image_url || "/fotos/website/3.png",
    planted_at: plantedAt,
    health_status: tree.health_status || "unknown",
    details: {
      scientific_name: tree.public_code === "IMX-Beta-01" ? "Saintpaulia ionantha" : details.scientific_name || tree.species,
      planted_by: tree.public_code === "IMX-Beta-01" ? "José Varela" : details.planted_by || "Inland Mex",
      confidence: tree.public_code === "IMX-Beta-01" ? 0.96 : Number(details.confidence || 0.86),
      address: details.address || tree.zone || "Sierra de Santa Catarina, Iztapalapa",
      reading_label: details.reading_label || "Registro de inventario",
      visual_signals: tree.public_code === "IMX-Beta-01" ? {
        height: "18 cm",
        growth: "activo",
        hydration: "hidratada",
        canopy: "compacta",
        recommendation: "luz indirecta y riego moderado",
      } : details.visual_signals || fallbackSignals,
      last_reading_at: details.last_reading_at || tree.updated_at || plantedAt,
      proof_network: details.proof_network || "Inland Proof Ledger · Beta",
    },
  };
}

async function loadTree(code) {
  try {
    const result = await getDb().execute({ sql: "SELECT * FROM trees WHERE public_code = ? LIMIT 1", args: [code] });
    if (result.rows[0]) return enrichTree(result.rows[0]);
  } catch (error) {
    if (!String(error?.message || error).includes("Missing TURSO")) throw error;
  }

  if (betaProfiles[code]) return enrichTree(betaProfiles[code]);
  return null;
}

export async function generateMetadata({ params }) {
  const { code } = await params;
  return { title: `Planta ${code}` };
}

export default async function PlantProfile({ params }) {
  const { code } = await params;
  const tree = await loadTree(code);
  if (!tree) notFound();

  const details = tree.details;
  const signals = details.visual_signals;
  const confidence = Math.round(details.confidence * 100);
  const date = new Intl.DateTimeFormat("es-MX", { dateStyle: "long" }).format(new Date(tree.planted_at));
  const readingDate = new Intl.DateTimeFormat("es-MX", { dateStyle: "long" }).format(new Date(details.last_reading_at));
  const txHash = proofHash(tree);
  const latitude = Number(tree.latitude);
  const longitude = Number(tree.longitude);

  return (
    <main className="plant-profile">
      <header className="profile-nav">
        <a href="/"><img src="/logo-circle.jpeg" alt="Inland Mex" /></a>
        <span>{tree.public_code}</span>
      </header>

      <section className="profile-photo">
        <img src={tree.image_url} alt={`${tree.species} registrada por Inland Mex`} />
        <div className="profile-id">{healthLabels[tree.health_status] || tree.health_status}</div>
      </section>

      <section className="profile-content">
        <p className="admin-kicker">Identidad viva</p>
        <h1>{tree.species}</h1>
        <p className="scientific-name">{details.scientific_name}</p>

        <section className={`reading-card health-${tree.health_status}`}>
          <span>{details.reading_label}</span>
          <strong>{healthLabels[tree.health_status] || tree.health_status}</strong>
          <small>{confidence}% confianza · {readingDate}</small>
        </section>

        <div className="profile-grid">
          <div><span>Plantado por</span><strong>{details.planted_by}</strong></div>
          <div><span>Fecha</span><strong>{date}</strong></div>
          <div><span>Ubicación</span><strong>{details.address}</strong></div>
          <div><span>Coordenadas</span><strong>{Number.isFinite(latitude) ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` : "pendiente"}</strong></div>
        </div>

        <section className="signal-grid" aria-label="Señales visuales">
          <div><span>Altura</span><strong>{signals.height}</strong></div>
          <div><span>Crecimiento</span><strong>{signals.growth}</strong></div>
          <div><span>Hidratación</span><strong>{signals.hydration}</strong></div>
          <div><span>Cobertura</span><strong>{signals.canopy}</strong></div>
        </section>

        <section className="care-note">
          <span>Acción sugerida</span>
          <strong>{signals.recommendation}</strong>
        </section>

        <section className="proof-card">
          <div className="proof-heading">
            <span className="proof-icon">✓</span>
            <div><strong>Prueba de registro</strong><small>{details.proof_network}</small></div>
          </div>
          <code>{txHash}</code>
        </section>
      </section>
    </main>
  );
}
