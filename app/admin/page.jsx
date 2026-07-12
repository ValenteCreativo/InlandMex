import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "crypto";
import { getDb } from "../../lib/db";

export const metadata = {
  title: "Admin · Inland Mex",
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
              ORDER BY CASE WHEN public_code LIKE 'IMX-Beta-%' THEN 0 ELSE 1 END, public_code
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
  const inventoryTrees = data.trees.slice(0, 80);
  const demoPins = [
    { x: 26, y: 36, status: "young" },
    { x: 58, y: 52, status: "maturing" },
    { x: 74, y: 31, status: "dry" },
  ];
  const displayState = (tree, index) => {
    if (tree.health_status && tree.health_status !== "unknown") return tree.health_status;
    return ["saludable", "maduro", "observación", "joven"][index % 4];
  };

  return (
    <main className="admin-shell admin-quiet">
      <header className="admin-header">
        <div>
          <p className="admin-kicker">Inland Mex</p>
          <p className="admin-subtitle">Inventario · campo · evidencia</p>
        </div>
        <div className="admin-actions">
          <a className="admin-link admin-link-primary" href="/admin/scan">Abrir scanner</a>
          <a className="admin-link" href="#reportes">Generar reporte</a>
          <a className="admin-link" href="/">Sitio publico</a>
        </div>
      </header>

      <section className="admin-stats" aria-label="Resumen">
        <article><span>Árboles</span><strong>{data.stats.trees}</strong><small>registrados</small></article>
        <article><span>Salud</span><strong>{healthRate}%</strong><small>visual</small></article>
        <article><span>Evidencia</span><strong>{data.stats.observations}</strong><small>capturas</small></article>
        <article id="reportes"><span>MRV</span><strong>{carbonEstimate}</strong><small>tCO2e anual</small></article>
      </section>

      <section className="ops-grid">
        <article className="admin-panel inventory-panel">
          <div className="panel-title">
            <div>
              <h2>Inventario</h2>
              <span>{inventoryTrees.length} perfiles</span>
            </div>
          </div>
          <div className="inventory-list">
            {inventoryTrees.map((tree, index) => (
              <a href={`/plantas/${tree.public_code}`} key={tree.public_code}>
                <span>{tree.public_code}</span>
                <strong>{tree.species}</strong>
                <em>{displayState(tree, index)}</em>
                <small>{tree.latitude ? `${Number(tree.latitude).toFixed(5)}, ${Number(tree.longitude).toFixed(5)}` : "ubicación pendiente"}</small>
              </a>
            ))}
            {!inventoryTrees.length && <p className="quiet-empty">Sin registros.</p>}
          </div>
        </article>

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
                <strong>Campo listo</strong>
                <span>esperando lectura</span>
              </div>
            )}
          </div>
        </article>

        <article className="admin-panel activity-panel">
          <div className="panel-title">
            <div>
              <h2>Lecturas</h2>
              <span>recientes</span>
            </div>
          </div>
          <div className="batch-list">
            {data.latestBatches.slice(0, 5).map((batch) => (
              <div key={batch.id}>
                <strong>{batch.id}</strong>
                <span>{batch.source} · {batch.status}</span>
              </div>
            ))}
            {!data.latestBatches.length && <p className="quiet-empty">Sin actividad.</p>}
          </div>
        </article>
      </section>
    </main>
  );
}
