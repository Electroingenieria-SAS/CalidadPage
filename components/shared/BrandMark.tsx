interface BrandMarkProps {
  compact?: boolean;
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <span className={`brand-mark ${compact ? "brand-mark--compact" : ""}`}>
      {/* Se sirve directamente para evitar el fallo del optimizador de imágenes en el runtime Worker. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/brand/dream-team-logo.png"
        alt="Dream Team de Calidad y Mejoramiento Continuo"
        width={900}
        height={300}
        loading="eager"
      />
    </span>
  );
}
