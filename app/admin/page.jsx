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
  try {
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
  } catch (error) {
    if (!String(error?.message || error).includes("Missing TURSO")) throw error;
  }

  return {
    stats: {
      trees: 0,
      observations: 0,
      pendingDetections: 0,
    },
    latestBatches: [],
    healthRows: [],
    trees: [],
    detections: [],
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
      <section className="login-panel">
        <div className="login-mark">IMX</div>
        <p className="admin-kicker">Inland Mex</p>
        <h1>Acceso admin</h1>
        <p className="login-copy">Inventario · campo · evidencia</p>
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
  const healthyCount = data.healthRows.reduce((sum, row) => {
    const status = String(row.health_status || "").toLowerCase();
    return status.includes("healthy") || status.includes("young") || status.includes("maturing")
      ? sum + Number(row.count || 0)
      : sum;
  }, 0);
  const treeTotal = Number(data.stats.trees || 0);
  const healthRate = treeTotal ? Math.round((healthyCount / treeTotal) * 100) : 0;
  const carbonEstimate = Math.max(0.1, treeTotal * 0.021).toFixed(2);
  const mappedTrees = data.trees.filter((tree) => tree.latitude && tree.longitude).slice(0, 18);
  const latestTrees = data.trees.slice(0, 8);
  const demoPins = [
    { x: 26, y: 36, status: "young" },
    { x: 58, y: 52, status: "maturing" },
    { x: 74, y: 31, status: "deceased" },
  ];
  const sequence = [
    ["01", "Joven"],
    ["02", "Maduro"],
    ["03", "Viejo"],
  ];

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="admin-kicker">IMX OS · Fase 2</p>
          <h1>Inventario vivo</h1>
          <p className="admin-subtitle">Campo · visión · trazabilidad</p>
        </div>
        <div className="admin-actions">
          <a className="admin-link admin-link-primary" href="/admin/scan">Cámara</a>
          <a className="admin-link" href="#carbon-report">MRV</a>
          <a className="admin-link" href="/">Sitio publico</a>
        </div>
      </header>

      <section className="command-hero">
        <div className="command-copy">
          <span className="status-pill"><i /> Campo activo</span>
          <h2>Visión</h2>
          <div className="sequence-grid" aria-label="Secuencia demo">
            {sequence.map(([id, label]) => (
              <div key={id}><span>{id}</span><strong>{label}</strong></div>
            ))}
          </div>
          <a className="admin-link admin-link-primary" href="/admin/scan">Abrir cámara</a>
        </div>
        <div className="carbon-card" id="carbon-report">
          <span>MRV</span>
          <strong>{carbonEstimate} tCO2e</strong>
          <p>Estimación anual</p>
          <button type="button">Generar reporte</button>
        </div>
      </section>

      <section className="admin-stats" aria-label="Resumen">
        <article><span>Árboles</span><strong>{data.stats.trees}</strong><small>registrados</small></article>
        <article><span>Salud</span><strong>{healthRate}%</strong><small>visual</small></article>
        <article><span>Evidencia</span><strong>{data.stats.observations}</strong><small>capturas</small></article>
        <article><span>Cola ML</span><strong>{data.stats.pendingDetections}</strong><small>pendientes</small></article>
      </section>

      <section className="ops-grid">
        <article className="admin-panel map-panel" id="inventory-map">
          <div className="panel-title">
            <div>
              <h2>Terreno</h2>
              <span>Sierra de Santa Catarina</span>
            </div>
            <strong>{mappedTrees.length ? `${mappedTrees.length} pines` : "demo"}</strong>
          </div>
          <div className="field-map">
            <div className="map-grid" />
            {mappedTrees.map((tree, index) => {
              const x = 14 + ((index * 29) % 72);
              const y = 18 + ((index * 47) % 64);
              return (
                <a
                  aria-label={`Abrir perfil ${tree.public_code}`}
                  className={`map-pin pin-${String(tree.health_status || "unknown").toLowerCase()}`}
                  href={`/plantas/${tree.public_code}`}
                  key={tree.public_code}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  title={`${tree.public_code} · ${tree.species}`}
                />
              );
            })}
            {!mappedTrees.length && demoPins.map((pin) => (
              <span
                className={`map-pin map-pin-demo pin-${pin.status}`}
                key={`${pin.status}-${pin.x}`}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              />
            ))}
            {!mappedTrees.length && (
              <div className="map-empty">
                <strong>Sin capturas</strong>
                <span>01 · 02 · 03</span>
              </div>
            )}
          </div>
        </article>

        <article className="admin-panel health-panel">
          <div className="panel-title">
            <div>
              <h2>Estados</h2>
              <span>lectura visual</span>
            </div>
          </div>
          <div className="health-list">
            {data.healthRows.map((row) => (
              <div key={row.health_status}>
                <span>{row.health_status}</span>
                <strong>{row.count}</strong>
              </div>
            ))}
            {!data.healthRows.length && <p className="quiet-empty">Aún no hay estados registrados.</p>}
          </div>
        </article>

        <article className="admin-panel activity-panel">
          <div className="panel-title">
            <div>
              <h2>Actividad</h2>
              <span>reciente</span>
            </div>
          </div>
          <div className="batch-list">
            {data.latestBatches.slice(0, 5).map((batch) => (
              <div key={batch.id}>
                <strong>{batch.id}</strong>
                <span>{batch.source} · {batch.status}</span>
              </div>
            ))}
            {!data.latestBatches.length && latestTrees.map((tree) => (
              <a href={`/plantas/${tree.public_code}`} key={tree.public_code}>
                <strong>{tree.public_code}</strong>
                <span>{tree.species} · {tree.health_status} · {tree.zone || "campo"}</span>
              </a>
            ))}
            {!data.latestBatches.length && !latestTrees.length && <p className="quiet-empty">Sin actividad.</p>}
          </div>
        </article>
      </section>

      <section className="admin-panel">
        <div className="panel-title">
          <div>
            <h2>Detecciones recientes</h2>
            <span>visión computacional</span>
          </div>
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
                <tr><td colSpan="6">Sin detecciones pendientes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-panel">
        <div className="panel-title">
          <div>
            <h2>Inventario base</h2>
            <span>{data.trees.length} perfiles</span>
          </div>
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
