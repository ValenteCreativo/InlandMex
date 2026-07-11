import ClientEffects from "./client-effects";

const coordinates = [
  ["INM-0421", "19.3447, -99.0291 · Healthy"],
  ["INM-0418", "19.3452, -99.0304 · New growth"],
  ["INM-0409", "19.3438, -99.0287 · Needs water"],
  ["INM-0397", "19.3460, -99.0312 · Healthy"],
  ["INM-0388", "19.3429, -99.0278 · Stabilized"],
  ["INM-0375", "19.3456, -99.0298 · Healthy"],
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
          <div className="float-photo photo-one">
            <video className="lazy-video" src="/hero-loop.mp4" muted playsInline preload="none" />
          </div>
          <div className="float-photo photo-two" />
          <div className="float-photo photo-three" />
          <div className="float-photo photo-four">
            <video className="lazy-video" src="/hero-loop.mp4" muted playsInline preload="none" />
          </div>
          <div className="float-photo photo-five" />
          <div className="float-photo photo-six" />

          <article className="story-copy copy-one">
            <p className="kicker">What is Inland Mex?</p>
            <h1>Experiences where every trip restores nature.</h1>
            <p>
              At Inland Mex, we create experiences where every journey helps restore nature, support
              the local economy, and reveal another side of Iztapalapa.
            </p>
          </article>

          <article className="story-copy copy-two">
            <p className="kicker">What will you live?</p>
            <h2>A morning that changes how you see Iztapalapa, nature, the city, and your own way of living.</h2>
            <p>
              Walk before sunrise through an ancient volcano, contemplate Mexico City from above,
              share breakfast over the clouds, plant a tree that will last for decades, and discover
              our story of territorial regeneration.
            </p>
          </article>
        </section>

        <section className="compact-section tours" id="experiences">
          <div className="section-title">
            <p className="kicker">Experiences</p>
            <h2>Three ways into the volcano.</h2>
          </div>
          <div className="orb-row">
            <article className="tour-orb">
              <div className="orb-image sunrise" />
              <h3>Sunrise Hike</h3>
              <p>Early trail, slow pace, first light over the city.</p>
            </article>
            <article className="tour-orb">
              <div className="orb-image forest" />
              <h3>Reforestation Walk</h3>
              <p>Visit planting zones and document one living tree.</p>
            </article>
            <article className="tour-orb">
              <div className="orb-image private" />
              <h3>Private Field Day</h3>
              <p>Custom route for teams, schools, and travelers.</p>
            </article>
          </div>
          <div className="detail-box">
            <div>
              <strong>Includes</strong>
              <span>Local guide, trail briefing, photo recap, impact contribution, and inventory record.</span>
            </div>
            <div>
              <strong>From $48 USD</strong>
              <span>Small groups · private dates available</span>
            </div>
          </div>
        </section>

        <section className="mission-banner">
          <p>Mission</p>
          <h2>Your hike plants, monitors, and protects native trees in Iztapalapa.</h2>
        </section>

        <section className="compact-section impact" id="impact">
          <div className="section-title">
            <p className="kicker">Impact</p>
            <h2>Measured restoration.</h2>
          </div>
          <div className="impact-grid">
            <div className="before-after" data-before-after>
              <div className="before-layer" />
              <div className="after-layer" />
              <input type="range" min="12" max="88" defaultValue="56" aria-label="Compare restoration before and after" />
              <span className="label before-label">Before</span>
              <span className="label after-label">After</span>
            </div>
            <aside className="tree-feed" aria-label="Tree coordinate feed">
              <div className="feed-title"><span />Inventory</div>
              <div className="feed-window">
                <ul>
                  {coordinates.map(([id, meta]) => (
                    <li key={id}><strong>{id}</strong><span>{meta}</span></li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
          <div className="metrics">
            <div><strong>400+</strong><span>trees planted</span></div>
            <div><strong>38.5t</strong><span>CO2 restored</span></div>
            <div><strong>12</strong><span>active zones</span></div>
            <div><strong>1:1</strong><span>tour-to-tree goal</span></div>
          </div>
        </section>

        <section className="compact-section tech" id="technology">
          <div className="section-title">
            <p className="kicker">Technology</p>
            <h2>Field data, ready for trust.</h2>
          </div>
          <div className="tech-grid">
            <div className="vision-card">
              <div className="scan-scene">
                <div className="scan-box box-one"><span>health 92%</span></div>
                <div className="scan-box box-two"><span>growth +14cm</span></div>
                <div className="scan-box box-three"><span>species id</span></div>
              </div>
            </div>
            <div className="mini-stack">
              <article><strong>ML inventory</strong><span>Camera capture estimates tree health, growth, and duplicate risk.</span></article>
              <article><strong>Carbon markets</strong><span>Verified restoration data prepares future carbon and impact records.</span></article>
              <article><strong>NFT sponsorship</strong><span>Visitors can adopt a tree and receive a digital proof of stewardship.</span></article>
            </div>
          </div>
        </section>

        <section className="compact-section reserve" id="reserve">
          <div className="reserve-copy">
            <p className="kicker">RSVP</p>
            <h2>Reserve a field day.</h2>
            <p>Send your dates, group size, or sponsorship interest. We will confirm the field details.</p>
            <div className="contact-icons">
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram"><span>◎</span> Instagram</a>
              <a href="mailto:hola@inlandmex.com" aria-label="Email Inland Mex"><span>@</span> Email</a>
              <a href="#top" aria-label="Back to top"><span>↑</span> Top</a>
            </div>
          </div>
          <form className="reserve-form">
            <label>Name<input type="text" name="name" placeholder="Your name" /></label>
            <label>Email<input type="email" name="email" placeholder="you@example.com" /></label>
            <label>Interest<select name="interest"><option>Book a volcano hike</option><option>Sponsor a tree</option><option>Partner with Inland Mex</option></select></label>
            <label>Message<textarea name="message" rows="2" placeholder="Dates, group size, or notes" /></label>
            <button type="submit">Send request</button>
          </form>
        </section>
      </main>

      <footer className="footer">
        <nav aria-label="Footer navigation">
          <a href="#experiences">Experiences</a>
          <a href="#impact">Impact</a>
          <a href="#technology">Technology</a>
          <a href="#reserve">Reserve</a>
        </nav>
        <p>From México with 💚</p>
        <small>© 2026 Inland Mex</small>
      </footer>
    </>
  );
}
