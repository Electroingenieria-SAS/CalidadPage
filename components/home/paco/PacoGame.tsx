"use client";

import { useEffect, useRef, useState } from "react";
import type { MascotItem } from "@/types/portal";

export function PacoGame({ mascot: _mascot }: { mascot: MascotItem[] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      if (!hostRef.current) return;
      const { createPacoGame } = await import("@/src/game/createPacoGame");
      if (cancelled || !hostRef.current) return;
      cleanupRef.current?.();
      cleanupRef.current = createPacoGame(hostRef.current);
      setReady(true);
    }

    void boot();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  return (
    <section id="paco-game" className="paco-phaser-section" aria-label="Paco Runner">
      <div className="paco-phaser-frame">
        <div ref={hostRef} className="paco-phaser-host" />
        {!ready ? (
          <div className="paco-phaser-loading" aria-live="polite">
            <span>ENERGIZANDO PACO</span>
            <i />
          </div>
        ) : null}
      </div>
    </section>
  );
}
