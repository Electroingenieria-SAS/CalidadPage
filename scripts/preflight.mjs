const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];
const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) {
  console.error(`\n[preflight] Faltan variables requeridas: ${missing.join(", ")}`);
  console.error("Configúralas en .env.local o en Vercel antes de desplegar.\n");
  process.exit(1);
}
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
  console.error("[preflight] NEXT_PUBLIC_SUPABASE_URL no tiene el formato esperado de Supabase.");
  process.exit(1);
}
if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.startsWith("sb_publishable_")) {
  console.error("[preflight] Usa una publishable key moderna (sb_publishable_...).");
  process.exit(1);
}
console.log("[preflight] Variables mínimas correctas.");
