import ClientEffects from "./client-effects";

const coordinates = [
  ["ARB-001", "Fresno · 19.344353°N, 98.989863°W"],
  ["ARB-002", "Fresno · 19.344718°N, 98.989436°W"],
  ["ARB-003", "Jacaranda · 19.344684°N, 98.989477°W"],
  ["ARB-004", "Liquidámbar · 19.344680°N, 98.989476°W"],
  ["ARB-005", "Fresno · 19.344712°N, 98.989477°W"],
  ["ARB-006", "Liquidámbar · 19.344690°N, 98.989500°W"],
  ["ARB-007", "Jacaranda · 19.344399°N, 98.989627°W"],
  ["ARB-008", "Jacaranda · 19.344365°N, 98.989624°W"],
  ["ARB-009", "Fresno · 19.344304°N, 98.989621°W"],
  ["ARB-010", "Jacaranda · 19.344403°N, 98.989670°W"],
  ["ARB-011", "Jacaranda · 19.344423°N, 98.989630°W"],
  ["ARB-012", "Fresno · 19.344438°N, 98.989633°W"],
  ["ARB-013", "Liquidámbar · 19.343984°N, 98.989675°W"],
  ["ARB-014", "Jacaranda · 19.343971°N, 98.989713°W"],
  ["ARB-015", "Liquidámbar · 19.343957°N, 98.989763°W"],
  ["ARB-016", "Liquidámbar · 19.344015°N, 98.989755°W"],
  ["ARB-017", "Pata de vaca · 19.343967°N, 98.989737°W"],
  ["ARB-018", "Fresno · 19.346147°N, 98.990391°W"],
  ["ARB-019", "Fresno · 19.345930°N, 98.990362°W"],
  ["ARB-020", "Jacaranda · 19.345875°N, 98.990329°W"],
  ["ARB-021", "Fresno · 19.345848°N, 98.990320°W"],
  ["ARB-022", "Fresno · 19.345758°N, 98.990412°W"],
  ["ARB-023", "Arce rojo · 19.345763°N, 98.990450°W"],
  ["ARB-024", "Fresno · 19.345772°N, 98.990536°W"],
  ["ARB-025", "Liquidámbar · 19.345774°N, 98.990555°W"],
  ["ARB-026", "Jacaranda · 19.345704°N, 98.990408°W"],
  ["ARB-027", "Jacaranda · 19.345677°N, 98.990405°W"],
  ["ARB-028", "Arce rojo · 19.345314°N, 98.990372°W"],
  ["ARB-029", "Jacaranda · 19.344967°N, 98.990443°W"],
  ["ARB-030", "Jacaranda · 19.344269°N, 98.990798°W"],
  ["ARB-031", "Jacaranda · 19.344722°N, 98.991266°W"],
  ["ARB-032", "Liquidámbar · 19.344726°N, 98.989531°W"],
  ["ARB-033", "Fresno · 19.344766°N, 98.989541°W"],
  ["ARB-034", "Fresno · 19.344804°N, 98.989536°W"],
  ["ARB-035", "Fresno · 19.344919°N, 98.989527°W"],
  ["ARB-036", "Fresno · 19.344871°N, 98.989594°W"],
  ["ARB-037", "Fresno · 19.244816°N, 98.989576°W"],
  ["ARB-038", "Liquidámbar · 19.344680°N, 98.989476°W"],
  ["ARB-039", "Fresno · ubicación pendiente"],
  ["ARB-040", "Fresno · 19.346527°N, 98.989371°W"],
  ["ARB-041", "Fresno · ubicación pendiente"],
];

export default function Home() {
  return (
    <>
      <ClientEffects />
      <main id="top">
        <section className="hero" aria-label="Inland Mex volcano hiking">
          <div className="hero-video-shell">
            <video className="hero-video" src="/hero-loop.mp4" autoPlay muted playsInline preload="auto" />
            <div className="video-soften" />
          </div>

          <div className="hero-mark">
            <img src="/logo-circle.jpeg" alt="Inland Mex" />
            <a href="#reserve">Reserva ahora</a>
          </div>
        </section>

        <section className="kudanil-story" aria-label="Inland Mex story">
          <div className="glass-backdrop" aria-hidden="true" />
          <div className="float-photo photo-one" />
          <div className="float-photo photo-two" />
          <div className="float-photo photo-three" />
          <div className="float-photo photo-four" />
          <div className="float-photo photo-five" />
          <div className="float-photo photo-six" />
          <div className="float-photo photo-seven" />
          <div className="float-photo photo-eight" />

          <article className="story-copy copy-one">
            <p className="kicker">Quiénes somos</p>
            <h1>Experiencias donde cada viaje ayuda a restaurar la naturaleza.</h1>
            <p>
              En Inland Mex creamos experiencias donde cada viaje ayuda a restaurar la naturaleza,
              impulsar la economía local y mostrar otra cara de Iztapalapa.
            </p>
          </article>

          <article className="story-copy copy-two">
            <p className="kicker">Qué vivirás</p>
            <h2>Una mañana que cambiará la forma en la que ves Iztapalapa, la naturaleza, la ciudad y tu propio estilo de vida.</h2>
            <p>
              Caminarás antes del amanecer por un antiguo volcán, contemplarás desde las alturas la
              Ciudad de México, la quinta ciudad más grande del mundo, compartirás un desayuno sobre
              las nubes, plantarás un árbol que durará por décadas y descubrirás nuestra historia de
              regeneración del territorio.
            </p>
          </article>
        </section>

        <section className="compact-section tours" id="experiences">
          <div className="section-title">
            <p className="kicker">Experiencias</p>
            <h2>Elige tu ruta por Iztapalapa.</h2>
          </div>
          <div className="orb-row">
            <article className="tour-orb">
              <div className="orb-image night-route" />
              <h3>Ruta nocturna</h3>
              <p>$850 · Senderismo, linternas y amanecer sobre la ciudad.</p>
            </article>
            <article className="tour-orb">
              <div className="orb-image graffiti-route" />
              <h3>Grafiti Tour</h3>
              <p>$650 · Arte urbano, barrio y otra mirada de Iztapalapa.</p>
            </article>
            <article className="tour-orb">
              <div className="orb-image temazcal-route" />
              <h3>Ruta Temazcal</h3>
              <p>$850 · Caminata, ritual, naturaleza y regeneración.</p>
            </article>
          </div>
          <div className="detail-box">
            <div>
              <strong>Qué incluye</strong>
              <span>
                Árbol y tierra para reforestar · Guías · Box lunch desayuno · Bolsa de agua · Linternas ·
                Entrada al área natural protegida · Visita al teleférico · Fotografías durante la experiencia ·
                Meditación · Senderismo interpretativo · Visita al cráter opcional · Transporte.
              </span>
            </div>
            <div>
              <strong>Inversión</strong>
              <span>$850 por persona. Reserva con $450 y liquida con $400.</span>
              <strong>Transferencia</strong>
              <span>Tarjeta Santander: 5579 0990 1666 4502 · José Varela.</span>
            </div>
          </div>
        </section>

        <section className="mission-banner">
          <p>Misión</p>
          <h2>Tu caminata planta, monitorea y protege árboles nativos en Iztapalapa.</h2>
        </section>

        <section className="compact-section impact" id="impact">
          <div className="section-title">
            <p className="kicker">Impacto</p>
            <h2>Restauración medible.</h2>
          </div>
          <div className="impact-grid">
            <div className="before-after" data-before-after>
              <div className="after-layer" />
              <div className="before-layer" />
              <input type="range" min="12" max="88" defaultValue="50" aria-label="Comparar restauración antes y después" />
              <span className="label before-label">Antes</span>
              <span className="label after-label">Después</span>
            </div>
            <aside className="tree-feed" aria-label="Tree coordinate feed">
              <div className="feed-title"><span />Inventario</div>
              <div className="feed-window">
                <ul>
                  {[...coordinates, ...coordinates].map(([id, meta], index) => (
                    <li key={`${id}-${index}`}><strong>{id}</strong><span>{meta}</span></li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
          <div className="metrics">
            <div><strong>400+</strong><span>árboles plantados</span></div>
            <div><strong>38.5t</strong><span>CO2 restaurado</span></div>
            <div><strong>12</strong><span>zonas activas</span></div>
            <div><strong>1:1</strong><span>meta tour-árbol</span></div>
          </div>
        </section>

        <section className="compact-section tech" id="technology">
          <div className="section-title">
            <p className="kicker">Tecnología</p>
            <h2>Datos de campo listos para generar confianza.</h2>
          </div>
          <div className="tech-grid">
            <div className="vision-card">
              <div className="scan-scene">
                <div className="scan-box box-one"><span>salud 92%</span></div>
                <div className="scan-box box-two"><span>crece +14cm</span></div>
                <div className="scan-box box-three"><span>especie id</span></div>
              </div>
            </div>
            <div className="mini-stack">
              <article><strong>Inventario ML</strong><span>La cámara estima salud, crecimiento y riesgo de duplicados por árbol.</span></article>
              <article><strong>Bonos de carbono</strong><span>Los datos verificados preparan futuros registros de carbono e impacto.</span></article>
              <article><strong>Padrinazgo NFT</strong><span>Visitantes podrán adoptar un árbol y recibir una prueba digital de cuidado.</span></article>
            </div>
          </div>
        </section>

        <section className="compact-section reserve" id="reserve">
          <div className="reserve-copy">
            <p className="kicker">Reservas</p>
            <h2>Reserva tu experiencia.</h2>
            <p>Envíanos tus fechas, tamaño de grupo o interés de patrocinio. Confirmaremos los detalles de campo.</p>
            <div className="contact-icons">
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram"><span>◎</span> Instagram</a>
              <a href="mailto:hola@inlandmex.com" aria-label="Email Inland Mex"><span>@</span> Email</a>
              <a href="#top" aria-label="Volver al inicio"><span>↑</span> Inicio</a>
            </div>
          </div>
          <form className="reserve-form">
            <label>Nombre<input type="text" name="name" placeholder="Tu nombre" /></label>
            <label>Email<input type="email" name="email" placeholder="tu@email.com" /></label>
            <label>Interés<select name="interest"><option>Reservar una ruta</option><option>Apadrinar un árbol</option><option>Aliarme con Inland Mex</option></select></label>
            <label>Mensaje<textarea name="message" rows="2" placeholder="Fechas, grupo o notas" /></label>
            <button type="submit">Enviar solicitud</button>
          </form>
        </section>
      </main>

      <footer className="footer">
        <nav aria-label="Footer navigation">
          <a href="#experiences">Experiencias</a>
          <a href="#impact">Impacto</a>
          <a href="#technology">Tecnología</a>
          <a href="#reserve">Reservas</a>
        </nav>
        <p>777 130 9737 · @Inlandmex</p>
        <small>© 2026 Inland Mex</small>
      </footer>
    </>
  );
}
