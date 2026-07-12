"use client";

import { useEffect, useRef, useState } from "react";

const stages = {
  ready: "Apunta la cámara hacia la planta",
  locating: "Obteniendo ubicación...",
  analyzing: "Analizando especie y salud...",
  registering: "Creando identidad y comprobante...",
};

export default function PlantScanner() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [photo, setPhoto] = useState("");
  const [stage, setStage] = useState("ready");
  const [planter, setPlanter] = useState("Valente / Inland Mex");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

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
    const maxWidth = 900;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhoto(canvas.toDataURL("image/jpeg", 0.72));
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
    if (!photo || !planter.trim()) return;
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
        body: JSON.stringify({ image: photo, planter: planter.trim(), ...location }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo registrar la planta.");
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
          <p className="admin-kicker">Identidad creada</p>
          <h1>{result.species}</h1>
          <div className={`health-badge health-${result.health_status}`}>{result.health_label}</div>
          <dl className="scan-facts">
            <div><dt>ID</dt><dd>{result.public_code}</dd></div>
            <div><dt>Confianza</dt><dd>{Math.round(result.confidence * 100)}%</dd></div>
            <div><dt>Prueba blockchain</dt><dd>{result.tx_hash.slice(0, 10)}...{result.tx_hash.slice(-6)}</dd></div>
          </dl>
          <a className="scan-primary" href={result.profile_url}>Ver perfil público</a>
          <button className="scan-secondary" onClick={reset}>Registrar otra planta</button>
        </section>
      </main>
    );
  }

  return (
    <main className="scanner-shell">
      <div className="scanner-top"><a href="/admin" aria-label="Volver">←</a><span>INLAND VISION</span><span>LIVE</span></div>
      <section className="camera-view">
        {photo ? <img src={photo} alt="Captura de la planta" /> : <video ref={videoRef} autoPlay muted playsInline />}
        {!photo && <div className="scan-reticle"><i /><i /><i /><i /></div>}
        <div className="vision-label"><span /> {photo ? "PLANTA DETECTADA" : "BUSCANDO PLANTA"}</div>
      </section>
      <section className="scanner-controls">
        <p>{stages[stage]}</p>
        {error && <div className="scan-error">{error}</div>}
        {photo ? (
          <>
            <label className="planter-field">Plantada por<input value={planter} onChange={(event) => setPlanter(event.target.value)} /></label>
            <button className="scan-primary" onClick={registerPlant} disabled={stage !== "ready"}>
              {stage === "ready" ? "Identificar y registrar" : stages[stage]}
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
