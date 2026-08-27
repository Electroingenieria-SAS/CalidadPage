"use client";

import { useEffect, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode, RefObject } from "react";

interface RevealProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "section";
  children: ReactNode;
}

export function Reveal({ as = "div", children, className = "", ...props }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const timer = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(timer);
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setVisible(true);
      observer.disconnect();
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const classes = `${className} reveal-block ${visible ? "is-visible" : ""}`.trim();
  if (as === "section") return <section {...props} ref={ref} className={classes}>{children}</section>;
  return <div {...props} ref={ref as RefObject<HTMLDivElement | null>} className={classes}>{children}</div>;
}
