"use client";

import { useEffect, useRef } from "react";

interface MediaProps {
  src?: string | null;
  alt: string;
  className?: string;
  eager?: boolean;
  fit?: "contain" | "cover";
  position?: string;
}

export function Media({ src, alt, className = "", eager = false, fit = "contain", position = "center" }: MediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }
    if (eager) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void video.play().catch(() => undefined);
      else video.pause();
    }, { rootMargin: "120px", threshold: 0.08 });
    observer.observe(video);
    return () => observer.disconnect();
  }, [eager, src]);

  if (!src) return null;
  const isVideo = /\.(mp4|webm|ogg)(\?|$)/i.test(src);
  if (isVideo) {
    return (
      <video
        ref={videoRef}
        className={className}
        src={src}
        muted
        loop
        autoPlay={eager}
        playsInline
        preload="metadata"
        aria-label={alt}
        style={{ objectFit: fit, objectPosition: position }}
      />
    );
  }
  // Remote, user-managed Supabase assets cannot be known at build time.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" style={{ objectFit: fit, objectPosition: position }} />;
}
