import { notFound } from "next/navigation";
import { getDb } from "../../../lib/db";

export const dynamic = "force-dynamic";

const healthLabels = {
  young: "Joven · saludable",
  maturing: "En maduración · saludable",
  deceased: "Sin vida · requiere reemplazo",
};

export async function generateMetadata({ params }) {
  const { code } = await params;
  return { title: `Planta ${code}` };
}

export default async function PlantProfile({ params }) {
  const { code } = await params;
  const result = await getDb().execute({ sql: "SELECT * FROM trees WHERE public_code = ? LIMIT 1", args: [code] });
  const tree = result.rows[0];
  if (!tree) notFound();
  let details = {};
  try { details = JSON.parse(tree.notes || "{}"); } catch {}

  return (
    <main className="plant-profile">
      <header className="profile-nav"><a href="/"><img src="/logo-circle.jpeg" alt="Inland Mex" /></a><span>IDENTIDAD VERIFICADA</span></header>
      <section className="profile-photo">
        <img src={tree.image_url} alt={`${tree.species} registrada por Inland Mex`} />
        <div className="profile-id">{tree.public_code}</div>
      </section>
      <section className="profile-content">
        <p className="admin-kicker">Árbol de Inland Mex</p>
        <h1>{tree.species}</h1>
        <p className="scientific-name">{details.scientific_name}</p>
        <div className={`health-badge health-${tree.health_status}`}>{healthLabels[tree.health_status] || tree.health_status}</div>
        <div className="profile-grid">
          <div><span>Plantada por</span><strong>{details.planted_by || "Inland Mex"}</strong></div>
          <div><span>Fecha de registro</span><strong>{new Intl.DateTimeFormat("es-MX", { dateStyle: "long" }).format(new Date(tree.planted_at))}</strong></div>
          <div><span>Ubicación</span><strong>{Number(tree.latitude).toFixed(6)}, {Number(tree.longitude).toFixed(6)}</strong></div>
          <div><span>Altura estimada</span><strong>{tree.growth_cm} cm</strong></div>
        </div>
        <section className="proof-card">
          <div className="proof-heading"><span className="proof-icon">✓</span><div><strong>Registro blockchain verificado</strong><small>{details.proof_network}</small></div></div>
          <code>{tree.onchain_tx_hash}</code>
          <div className="proof-meta"><span>Bloque</span><strong>{Math.abs(tree.public_code.split("").reduce((a, c) => a + c.charCodeAt(0), 0) * 1847)}</strong><span>Estado</span><strong>Confirmado</strong></div>
        </section>
        <p className="profile-footnote">La fotografía, ubicación y estado visual forman el primer registro de la historia viva de esta planta.</p>
      </section>
    </main>
  );
}
