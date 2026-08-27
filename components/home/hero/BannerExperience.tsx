"use client";

import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Media } from "@/components/shared/Media";
import { PaperBurnTransition } from "./PaperBurnTransition";
import type { BannerItem, PortalRoute } from "@/types/portal";

interface BannerExperienceProps {
  banners: BannerItem[];
  onNavigate: (route: PortalRoute) => void;
}

type TransitionPhase = "idle" | "preparing" | "burning" | "settling";
type NavigationDirection = 1 | -1;

const AUTO_ADVANCE_MS = 10000;
const PAPER_BURN_MS = 2050;
const SETTLE_COMPOSITOR_FRAMES = 6;
const routes: PortalRoute[] = ["inicio", "apps", "documentos", "noticias", "auditorias", "publicaciones", "perfil", "admin"];
const bindingPoints = Array.from({ length: 10 }, (_, index) => ({
  id: index,
  y: 7.5 + index * (85 / 9),
}));

const motionVariables = {
  "--notebook-cycle-duration": `${AUTO_ADVANCE_MS}ms`,
  "--notebook-burn-duration": `${PAPER_BURN_MS}ms`,
} as CSSProperties;

function bindingPointStyle(y: number): CSSProperties {
  return { "--binding-y": `${y}%` } as CSSProperties;
}

function isVideoSource(src: string) {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(src);
}

function IncomingMedia({ src }: { src: string }) {
  if (isVideoSource(src)) {
    return <video src={src} muted playsInline preload="auto" aria-hidden="true" tabIndex={-1} />;
  }

  // Predecoded/cached by the neighbour warm-up effect above. Rendering the
  // incoming image directly avoids extra component work in the critical turn.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="eager" decoding="async" />;
}

export function BannerExperience({ banners, onNavigate }: BannerExperienceProps) {
  const activeBanners = useMemo(
    () => banners.filter((banner) => banner.is_active !== false).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
    [banners],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [direction, setDirection] = useState<NavigationDirection>(1);
  const [transitionSerial, setTransitionSerial] = useState(0);
  const [manualPaused, setManualPaused] = useState(false);
  const animationFramesRef = useRef<number[]>([]);
  const preloadMediaRef = useRef<Array<HTMLImageElement | HTMLVideoElement>>([]);
  const notebookStageRef = useRef<HTMLDivElement>(null);
  const currentPageRef = useRef<HTMLElement>(null);

  const transitionLockRef = useRef(false);

  const clearTransitionWork = useCallback(() => {
    for (const frame of animationFramesRef.current) window.cancelAnimationFrame(frame);
    animationFramesRef.current = [];
  }, []);

  useEffect(() => clearTransitionWork, [clearTransitionWork]);

  // BannerExperience is remounted by HomeView when the banner signature changes.
  // Keeping reset state out of an Effect avoids synchronous state cascades and
  // preserves the same zero-frame-flash transition behavior.

  const isPaused = manualPaused;
  const safeIndex = activeBanners.length ? activeIndex % activeBanners.length : 0;
  const banner = activeBanners[safeIndex];
  const nextBanner = targetIndex === null ? null : activeBanners[targetIndex];

  useEffect(() => {
    if (activeBanners.length <= 1) return;

    const neighbourIndexes = [
      (safeIndex + 1) % activeBanners.length,
      (safeIndex - 1 + activeBanners.length) % activeBanners.length,
    ];
    const imageSources = activeBanners
      .map((item) => item.media_url)
      .filter((src): src is string => Boolean(src) && !isVideoSource(src));
    const neighbourVideoSources = neighbourIndexes
      .map((index) => activeBanners[index]?.media_url)
      .filter((src): src is string => Boolean(src) && isVideoSource(src));
    const uniqueSources = Array.from(new Set([...imageSources, ...neighbourVideoSources]));
    const warmedMedia: Array<HTMLImageElement | HTMLVideoElement> = [];

    for (const src of uniqueSources) {
      if (isVideoSource(src)) {
        const video = document.createElement("video");
        video.preload = "auto";
        video.muted = true;
        video.playsInline = true;
        video.src = src;
        video.load();
        warmedMedia.push(video);
      } else {
        const image = new Image();
        image.decoding = "async";
        image.src = src;
        void image.decode?.().catch(() => undefined);
        warmedMedia.push(image);
      }
    }

    preloadMediaRef.current = warmedMedia;
    return () => {
      for (const media of warmedMedia) {
        if (media instanceof HTMLVideoElement) {
          media.removeAttribute("src");
          media.load();
        }
      }
      preloadMediaRef.current = [];
    };
  }, [activeBanners, safeIndex]);

  const transitionTo = useCallback((nextIndex: number, nextDirection: NavigationDirection = 1) => {
    if (transitionLockRef.current || phase !== "idle" || activeBanners.length <= 1 || nextIndex === safeIndex) return;

    transitionLockRef.current = true;
    clearTransitionWork();
    setDirection(nextDirection);
    setTransitionSerial((serial) => serial + 1);
    setTargetIndex(nextIndex);
    setPhase("preparing");

    // Two compositor frames guarantee that the incoming page and current page
    // refs exist before the procedural Canvas starts. Every transition is a
    // fresh burn instance; no visual state survives from the previous sheet.
    const frameOne = window.requestAnimationFrame(() => {
      const frameTwo = window.requestAnimationFrame(() => {
        notebookStageRef.current?.querySelectorAll("video").forEach((video) => video.pause());
        setPhase("burning");
      });
      animationFramesRef.current = [frameTwo];
    });
    animationFramesRef.current = [frameOne];
  }, [activeBanners.length, clearTransitionWork, phase, safeIndex]);

  const completeTransition = useCallback(() => {
    if (targetIndex === null) {
      transitionLockRef.current = false;
      setPhase("idle");
      return;
    }

    // The incoming sheet is already fully composited underneath the outgoing
    // one. Commit the new index, but keep that identical incoming sheet alive
    // for a few display frames. This removes the one-frame flash that can occur
    // when React swaps DOM nodes at the exact instant the fire disappears.
    setActiveIndex(targetIndex);
    setPhase("settling");

    let frameCount = 0;
    const settle = () => {
      frameCount += 1;
      if (frameCount < SETTLE_COMPOSITOR_FRAMES) {
        const nextFrame = window.requestAnimationFrame(settle);
        animationFramesRef.current = [nextFrame];
        return;
      }

      setTargetIndex(null);
      setPhase("idle");
      transitionLockRef.current = false;
      animationFramesRef.current = [];
    };

    const firstFrame = window.requestAnimationFrame(settle);
    animationFramesRef.current = [firstFrame];
  }, [targetIndex]);

  useEffect(() => {
    if (phase !== "idle" || activeBanners.length <= 1 || isPaused) return;
    const timer = window.setTimeout(() => {
      transitionTo((safeIndex + 1) % activeBanners.length, 1);
    }, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [activeBanners.length, isPaused, phase, safeIndex, transitionTo]);

  // Last-resort guard: a missing canvas/context/ref must never leave the whole
  // carousel permanently locked after one successful page.
  useEffect(() => {
    if (phase !== "burning") return;
    const watchdog = window.setTimeout(() => {
      completeTransition();
    }, PAPER_BURN_MS + 450);
    return () => window.clearTimeout(watchdog);
  }, [phase, transitionSerial, completeTransition]);

  if (!banner) return null;

  function move(nextDirection: NavigationDirection) {
    const nextIndex = (safeIndex + nextDirection + activeBanners.length) % activeBanners.length;
    transitionTo(nextIndex, nextDirection);
  }

  function select(index: number) {
    if (index === safeIndex) return;
    const forwardDistance = (index - safeIndex + activeBanners.length) % activeBanners.length;
    const backwardDistance = (safeIndex - index + activeBanners.length) % activeBanners.length;
    transitionTo(index, forwardDistance <= backwardDistance ? 1 : -1);
  }

  function openDestination() {
    const destination = banner.link_url || "apps";
    if (routes.includes(destination as PortalRoute)) onNavigate(destination as PortalRoute);
    else window.open(destination, "_blank", "noopener,noreferrer");
  }

  function scrollToPaco() {
    document.getElementById("paco-game")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const transitionClass = phase === "burning"
    ? `is-burning ${direction > 0 ? "is-forward" : "is-backward"}`
    : phase === "preparing"
      ? "is-preparing"
      : "";

  return (
    <section
      className={`banner-experience banner-experience--reference ${transitionClass}`}
      style={motionVariables}
      aria-roledescription="carrusel"
      aria-label="Destacados del repositorio"
      data-hero-engine="paper-burn-zero-frame-flash-120hz-v10"
    >
      <div className="reference-hero-bg" aria-hidden="true">
        <video className="reference-hero-bg__video" autoPlay muted loop playsInline preload="metadata" tabIndex={-1}>
          <source src="/assets/backgrounds/banner-background.mp4" type="video/mp4" />
        </video>
        <span className="reference-hero-bg__veil" />
        <span className="reference-hero-bg__wave reference-hero-bg__wave--one" />
        <span className="reference-hero-bg__wave reference-hero-bg__wave--two" />
        <span className="reference-hero-bg__square reference-hero-bg__square--one" />
        <span className="reference-hero-bg__square reference-hero-bg__square--two" />
        <span className="reference-hero-bg__square reference-hero-bg__square--three" />
      </div>

      <div className="reference-hero__content">
        <header className="reference-hero__heading" aria-live="polite">
          <span className="reference-hero__eyebrow">Calidad y mejoramiento continuo</span>
          <h1>{banner.title}</h1>
          {banner.description ? <p>{banner.description}</p> : null}
          <div className="reference-hero__actions">
            <button type="button" className="primary-button primary-button--gold" onClick={openDestination}>
              {banner.button_text || "Explorar"}
              <ArrowUpRight size={17} />
            </button>
            <button type="button" className="reference-hero__paco-link" onClick={scrollToPaco}>
              Conoce a Paco
              <ArrowDown size={16} />
            </button>
          </div>
        </header>

        <div className="notebook-shell">
          <div className="notebook-stage" ref={notebookStageRef}>
            <div className="notebook-binding" aria-hidden="true">
              {bindingPoints.map((point) => <span key={point.id} style={bindingPointStyle(point.y)} />)}
            </div>

            {nextBanner ? (
              <article
                key={`incoming-${transitionSerial}-${targetIndex ?? safeIndex}`}
                className="notebook-page notebook-page--incoming"
                aria-hidden="true"
                style={{ opacity: 1, transform: "translate3d(0,0,0) scale3d(1,1,1)" }}
              >
                <div className="notebook-page__punches" aria-hidden="true">
                  {bindingPoints.map((point) => <span key={point.id} style={bindingPointStyle(point.y)} />)}
                </div>
                <div className="notebook-page__media">
                  <IncomingMedia src={nextBanner.media_url} />
                </div>
              </article>
            ) : null}

            <article
              ref={currentPageRef}
              className="notebook-page notebook-page--current"
              key={`current-${banner.id}-${safeIndex}-${transitionSerial}`}
              aria-live="polite"
              style={phase === "settling" ? { opacity: 0, pointerEvents: "none" } : undefined}
            >
              <div className="notebook-page__punches" aria-hidden="true">
                {bindingPoints.map((point) => <span key={point.id} style={bindingPointStyle(point.y)} />)}
              </div>
              <div className="notebook-page__media">
                <Media src={banner.media_url} alt={banner.title} fit="contain" eager />
              </div>
            </article>

            <PaperBurnTransition
              key={`paper-burn-${transitionSerial}-${safeIndex}-${targetIndex ?? "idle"}`}
              active={phase === "burning"}
              durationMs={PAPER_BURN_MS}
              pageRef={currentPageRef}
              onComplete={completeTransition}
            />

            <button type="button" className="notebook-control notebook-control--prev" onClick={() => move(-1)} aria-label="Banner anterior" disabled={activeBanners.length <= 1 || phase !== "idle"}>
              <ChevronLeft size={21} />
            </button>
            <button type="button" className="notebook-control notebook-control--next" onClick={() => move(1)} aria-label="Banner siguiente" disabled={activeBanners.length <= 1 || phase !== "idle"}>
              <ChevronRight size={21} />
            </button>
          </div>
        </div>

        <div className="reference-hero__footer">
          <div className="reference-hero__counter" aria-label={`Banner ${safeIndex + 1} de ${activeBanners.length}`}>
            <span>{String(safeIndex + 1).padStart(2, "0")}</span>
            <i />
            <small>{String(activeBanners.length).padStart(2, "0")}</small>
          </div>

          {activeBanners.length > 1 ? (
            <div className="banner-timeline" aria-label="Seleccionar banner">
              {activeBanners.map((item, index) => (
                <button key={`${item.id}-${index}`} type="button" className={index === safeIndex ? "is-active" : ""} onClick={() => select(index)} aria-label={`Mostrar banner ${index + 1}: ${item.title}`} disabled={phase !== "idle"}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {index === safeIndex ? <i key={safeIndex} className={isPaused || phase !== "idle" ? "is-paused" : ""} /> : null}
                </button>
              ))}
            </div>
          ) : <span />}

          {activeBanners.length > 1 ? (
            <button type="button" className="banner-pause" onClick={() => setManualPaused((value) => !value)} aria-label={manualPaused ? "Reanudar carrusel" : "Pausar carrusel"}>
              {manualPaused ? <Play size={15} /> : <Pause size={15} />}
              {manualPaused ? "Reanudar" : "Pausar"}
            </button>
          ) : <span />}
        </div>
      </div>
    </section>
  );
}
