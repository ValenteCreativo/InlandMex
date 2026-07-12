"use client";

import { useEffect, useRef, useState } from "react";

const stages = {
  ready: "Listo",
  locating: "GPS",
  analyzing: "Visión",
  registering: "Registro",
};

const signalFrames = [
  ["COPA", "FOLLAJE", "TALLO"],
  ["ESPECIE", "DENSIDAD", "RIEGO"],
  ["SALUD", "ALTURA", "GPS"],
  ["LECTURA", "HIDRATACIÓN", "PERFIL"],
];

export default function PlantScanner() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [photo, setPhoto] = useState("");
  const [stage, setStage] = useState("ready");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [scanReady, setScanReady] = useState(true);
  const [signalIndex, setSignalIndex] = useState(0);
  const [demoIndex, setDemoIndex] = useState(0);

  useEffect(() => {
    const saved = Number(window.localStorage.getItem("imx-demo-sequence") || 0);
    if (Number.isFinite(saved)) setDemoIndex(saved % 3);
  }, []);

  useEffect(() => {
    const signalTimer = window.setInterval(() => setSignalIndex((value) => (value + 1) % signalFrames.length), 900);
    return () => window.clearInterval(signalTimer);
  }, []);

  useEffect(() => {
    let active = true;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })
      .then((stream) => {
        if (!active) return stream.getTracks().forEach((track) => track.stop());
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setError("No pudimos abrir la cámara. Revisa el permiso del navegador."));
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function capture() {
    const video = videoRef.current;
    if (!video?.videoWidth) return setError("La cámara todavía está iniciando.");
    const canvas = document.createElement("canvas");
    const maxWidth = 720;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhoto(canvas.toDataURL("image/jpeg", 0.68));
    setError("");
  }

  function locate() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ latitude: 19.34468, longitude: -98.98948, accuracy: null });
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy }),
        () => resolve({ latitude: 19.34468, longitude: -98.98948, accuracy: null }),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 },
      );
    });
  }

  async function registerPlant() {
    if (!photo) return;
    try {
      setError("");
      setStage("locating");
      const location = await locate();
      setStage("analyzing");
      await new Promise((resolve) => setTimeout(resolve, 1300));
      setStage("registering");
      const response = await fetch("/api/admin/register-plant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image: photo, demoIndex, ...location }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo registrar la planta.");
      const nextIndex = (demoIndex + 1) % 3;
      window.localStorage.setItem("imx-demo-sequence", String(nextIndex));
      setDemoIndex(nextIndex);
      setResult(data);
    } catch (err) {
      setError(err.message);
      setStage("ready");
    }
  }

  function reset() {
    setPhoto("");
    setResult(null);
    setStage("ready");
    setScanReady(true);
  }

  if (result) {
    return (
      <main className="scanner-shell scanner-result">
        <div className="scanner-top"><span>INLAND VISION</span><span>REGISTRO COMPLETO</span></div>
        <section className="result-hero">
          <img src={photo} alt="Planta registrada" />
          <div className="result-check">✓</div>
        </section>
        <section className="result-copy">
          <p className="admin-kicker">Lectura visual completada</p>
          <h1>{result.species}</h1>
          <p className="scientific-name">{result.scientific_name}</p>
          <div className={`health-badge health-${result.health_status}`}>{result.health_label}</div>
          <dl className="scan-facts">
            <div><dt>Perfil</dt><dd>{result.public_code}</dd></div>
            <div><dt>Confianza</dt><dd>{Math.round(result.confidence * 100)}%</dd></div>
            <div><dt>Plantado por</dt><dd>{result.planted_by}</dd></div>
            <div><dt>Ubicación</dt><dd>{result.address}</dd></div>
            <div><dt>Altura estimada</dt><dd>{result.signals.height}</dd></div>
            <div><dt>Hidratación visual</dt><dd>{result.signals.hydration}</dd></div>
            <div><dt>Cobertura</dt><dd>{result.signals.canopy}</dd></div>
            <div><dt>Acción sugerida</dt><dd>{result.signals.recommendation}</dd></div>
          </dl>
          <a className="scan-primary" href={result.profile_url}>Ver perfil actualizado</a>
          <button className="scan-secondary" onClick={reset}>Nueva lectura</button>
        </section>
      </main>
    );
  }

  return (
    <main className="scanner-shell">
      <div className="scanner-top"><a href="/admin" aria-label="Volver">←</a><span>INLAND VISION</span><span>LIVE</span></div>
      <section className="camera-view">
        {photo ? <img src={photo} alt="Captura de la planta" /> : <video ref={videoRef} autoPlay muted playsInline />}
        {scanReady && (
          <div className="scan-reticle">
            <div className="tracking-box tracking-main"><span>{signalFrames[signalIndex][0]}</span></div>
            <div className="tracking-box tracking-leaf"><span>{signalFrames[signalIndex][1]}</span></div>
            <div className="tracking-box tracking-stem"><span>{signalFrames[signalIndex][2]}</span></div>
            <div className="tracking-box tracking-ghost" />
          </div>
        )}
        <div className="vision-label"><span /> {photo ? "FRAME" : "TRACKING"}</div>
      </section>
      <section className="scanner-controls">
        <p>{stages[stage]}</p>
        {error && <div className="scan-error">{error}</div>}
        {photo ? (
          <>
            <button className="scan-primary" onClick={registerPlant} disabled={stage !== "ready"}>
              {stage === "ready" ? "Crear lectura" : stages[stage]}
            </button>
            <button className="scan-secondary" onClick={() => setPhoto("")} disabled={stage !== "ready"}>Repetir foto</button>
          </>
        ) : (
          <button className="shutter" onClick={capture} aria-label="Tomar foto"><span /></button>
        )}
      </section>
    </main>
  );
}
