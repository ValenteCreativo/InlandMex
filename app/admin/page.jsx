import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "crypto";
import { getDb } from "../../lib/db";

export const metadata = {
  title: "Admin Fase 2",
};

export const dynamic = "force-dynamic";

function hashSecret(value) {
  return createHash("sha256").update(value).digest("hex");
}

function adminSessionHash() {
  return hashSecret(`${process.env.ADMIN_EMAIL}:${process.env.ADMIN_PASSWORD}`);
}

async function getAdminData() {
  const db = getDb();
  const [treeCount, observationCount, latestBatches, healthRows, trees] = await Promise.all([
    db.execute("SELECT COUNT(*) AS count FROM trees"),
    db.execute("SELECT COUNT(*) AS count FROM tree_observations"),
    db.execute({
      sql: `SELECT id, source, model_version, status, created_at, notes
            FROM inventory_batches
            ORDER BY created_at DESC
            LIMIT 8`,
    }),
    db.execute({
      sql: `SELECT health_status, COUNT(*) AS count
            FROM trees
            GROUP BY health_status
            ORDER BY count DESC`,
    }),
    db.execute({
      sql: `SELECT public_code, species, zone, latitude, longitude, health_status, growth_cm, updated_at
            FROM trees
            ORDER BY public_code
            LIMIT 80`,
    }),
  ]);

  let pendingDetections = { rows: [{ count: 0 }] };
  let detections = { rows: [] };
  try {
    pendingDetections = await db.execute("SELECT COUNT(*) AS count FROM visual_tree_detections WHERE review_status = 'pending'");
    detections = await db.execute({
      sql: `SELECT d.id, d.tracker_id, d.frame_index, d.confidence, d.health_score,
                   d.health_status, d.review_status, d.latitude, d.longitude,
                   d.evidence_url, d.created_at, b.source AS batch_source
            FROM visual_tree_detections d
            LEFT JOIN inventory_batches b ON b.id = d.batch_id
            ORDER BY d.created_at DESC
            LIMIT 24`,
    });
  } catch (error) {
    if (!String(error?.message || error).includes("no such table")) throw error;
  }

  return {
    stats: {
      trees: treeCount.rows[0]?.count || 0,
      observations: observationCount.rows[0]?.count || 0,
      pendingDetections: pendingDetections.rows[0]?.count || 0,
    },
    latestBatches: latestBatches.rows,
    healthRows: healthRows.rows,
    trees: trees.rows,
    detections: detections.rows,
  };
}

async function AdminLogin() {
  async function login(formData) {
    "use server";
    const email = formData.get("email")?.toString().trim().toLowerCase() || "";
    const password = formData.get("password")?.toString() || "";
    const expectedEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    if (!expectedEmail || !process.env.ADMIN_PASSWORD || email !== expectedEmail || password !== process.env.ADMIN_PASSWORD) return;
    const cookieStore = await cookies();
    cookieStore.set("inland_admin", adminSessionHash(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    redirect("/admin");
  }

  return (
    <main className="admin-shell admin-login">
      <section className="admin-panel login-panel">
        <p className="admin-kicker">Inland Mex Admin</p>
        <h1>Acceso operativo</h1>
        <form action={login} className="admin-form">
          <label>
            Email
            <input name="email" type="email" required autoComplete="username" />
          </label>
          <label>
            Password
            <input name="password" type="password" required autoComplete="current-password" />
          </label>
          <button type="submit">Entrar</button>
        </form>
      </section>
    </main>
  );
}

export default async function AdminPage() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    return (
      <main className="admin-shell admin-login">
        <section className="admin-panel login-panel">
          <p className="admin-kicker">Setup requerido</p>
          <h1>Define `ADMIN_EMAIL` y `ADMIN_PASSWORD` en Vercel para activar el panel.</h1>
        </section>
      </main>
    );
  }

  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("inland_admin")?.value === adminSessionHash();
  if (!isAuthed) return <AdminLogin />;

  const data = await getAdminData();

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="admin-kicker">Fase 2</p>
          <h1>Inventario visual y operaciones</h1>
        </div>
        <div className="admin-actions">
          <a className="admin-link admin-link-primary" href="/admin/scan">Abrir escáner</a>
          <a className="admin-link" href="/">Sitio publico</a>
        </div>
      </header>

      <a className="scan-launch" href="/admin/scan">
        <span className="scan-launch-icon" aria-hidden="true">⌾</span>
        <span><strong>Registrar una planta</strong><small>Cámara, ubicación, análisis visual y perfil NFC</small></span>
        <span aria-hidden="true">→</span>
      </a>

      <section className="admin-stats" aria-label="Resumen">
        <article><strong>{data.stats.trees}</strong><span>Arboles registrados</span></article>
        <article><strong>{data.stats.observations}</strong><span>Observaciones historicas</span></article>
        <article><strong>{data.stats.pendingDetections}</strong><span>Detecciones por revisar</span></article>
      </section>

      <section className="admin-grid">
        <article className="admin-panel">
          <div className="panel-title">
            <h2>Salud del inventario</h2>
            <span>estado actual</span>
          </div>
          <div className="health-list">
            {data.healthRows.map((row) => (
              <div key={row.health_status}>
                <span>{row.health_status}</span>
                <strong>{row.count}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel">
          <div className="panel-title">
            <h2>Ultimos lotes</h2>
            <span>campo + ML</span>
          </div>
          <div className="batch-list">
            {data.latestBatches.map((batch) => (
              <div key={batch.id}>
                <strong>{batch.id}</strong>
                <span>{batch.source} · {batch.status} · {batch.model_version || "sin modelo"}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="admin-panel">
        <div className="panel-title">
          <h2>Detecciones recientes</h2>
          <span>cola de revision</span>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Track</th>
                <th>Frame</th>
                <th>Conf.</th>
                <th>Salud</th>
                <th>GPS</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.detections.map((detection) => (
                <tr key={detection.id}>
                  <td>#{detection.tracker_id ?? "-"}</td>
                  <td>{detection.frame_index ?? "-"}</td>
                  <td>{Number(detection.confidence || 0).toFixed(2)}</td>
                  <td>{detection.health_status} {detection.health_score ? `(${Number(detection.health_score).toFixed(2)})` : ""}</td>
                  <td>{detection.latitude ? `${Number(detection.latitude).toFixed(6)}, ${Number(detection.longitude).toFixed(6)}` : "pendiente"}</td>
                  <td>{detection.review_status}</td>
                </tr>
              ))}
              {!data.detections.length && (
                <tr><td colSpan="6">Aun no hay detecciones ML. Corre `npm run db:phase2` y luego el pipeline de video.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-panel">
        <div className="panel-title">
          <h2>Inventario base</h2>
          <span>{data.trees.length} visibles</span>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Especie</th>
                <th>Zona</th>
                <th>GPS</th>
                <th>Salud</th>
                <th>Crec.</th>
              </tr>
            </thead>
            <tbody>
              {data.trees.map((tree) => (
                <tr key={tree.public_code}>
                  <td>{tree.public_code}</td>
                  <td>{tree.species}</td>
                  <td>{tree.zone || "-"}</td>
                  <td>{tree.latitude ? `${Number(tree.latitude).toFixed(6)}, ${Number(tree.longitude).toFixed(6)}` : "pendiente"}</td>
                  <td>{tree.health_status}</td>
                  <td>{tree.growth_cm ? `${tree.growth_cm} cm` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
