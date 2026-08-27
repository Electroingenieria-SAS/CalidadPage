"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";

export function IntroExperience() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const closeIntro = useCallback(() => {
    if (closing) return;
    window.sessionStorage.setItem("calidoso-intro-seen-v3", "true");
    setClosing(true);
    audioRef.current?.pause();
    window.setTimeout(() => setVisible(false), 520);
  }, [closing]);

  useEffect(() => {
    const seen = window.sessionStorage.getItem("calidoso-intro-seen-v3");
    const timer = window.setTimeout(() => {
      if (!seen) setVisible(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => closeIntro(), 3000);
    return () => window.clearTimeout(timer);
  }, [closeIntro, visible]);

  async function toggleSound() {
    const audio = audioRef.current;
    if (!audio) return;
    if (soundOn) {
      audio.pause();
      setSoundOn(false);
      return;
    }
    await audio.play().catch(() => undefined);
    setSoundOn(true);
  }

  if (!visible) return null;

  return (
    <section className={`intro-experience ${closing ? "is-closing" : ""}`} aria-label="Bienvenida al repositorio">
      <video className="intro-experience__video" src="/assets/intro/intro-video.mp4" muted autoPlay playsInline />
      <div className="intro-experience__veil" aria-hidden="true" />

      <div className="intro-experience__content">
        <span className="intro-experience__code"><i /> CALIDOSO TEAM · REPOSITORIO 2026</span>
        <div className="intro-experience__logo">
          {/* El renderizador de imagen del preview no soporta este asset local; se sirve directamente. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/brand/repository-logo.png" alt="Repositorio de Apps Calidad" width={1680} height={939} />
        </div>
        <div className="intro-experience__title">
          <span>Calidad y mejoramiento continuo</span>
          <h1>Todo el conocimiento.<br />En un solo lugar.</h1>
        </div>
      </div>

      <div className="intro-experience__footer">
        <div className="intro-experience__progress"><span /></div>
        <small>Electroingeniería S.A.S.</small>
      </div>

      <div className="intro-experience__actions">
        <button type="button" className="icon-button icon-button--glass" onClick={toggleSound} aria-label={soundOn ? "Silenciar" : "Activar sonido"}>
          {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <button type="button" className="intro-enter" onClick={closeIntro}>Entrar ahora <ArrowRight size={18} /></button>
      </div>
      <audio ref={audioRef} src="/assets/intro/intro-sound.mp3" preload="metadata" />
    </section>
  );
}
