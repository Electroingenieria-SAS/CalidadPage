export function recordTitle(record: Record<string, unknown>) {
  return String(record.title || record.name || "Registro sin título");
}

export function recordDescription(record: Record<string, unknown>) {
  return String(record.description || record.content || "Sin descripción disponible.");
}

export function recordLink(record: Record<string, unknown>) {
  return String(record.url || record.external_url || record.file_url || "");
}

export function formatDate(value?: string | null) {
  if (!value) return "Actualizado recientemente";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Actualizado recientemente";
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function mergePortalSettings<T extends object>(base: T, patch?: Partial<T> | null): T {
  if (!patch) return structuredClone(base);
  const output = structuredClone(base) as Record<string, unknown>;
  for (const [key, value] of Object.entries(patch)) {
    const current = output[key];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      current &&
      typeof current === "object" &&
      !Array.isArray(current)
    ) {
      output[key] = mergePortalSettings(
        current as Record<string, unknown>,
        value as Record<string, unknown>,
      );
    } else {
      output[key] = value;
    }
  }
  return output as T;
}
