import { existsSync, readFileSync } from 'node:fs';

const required = [
  'README.md',
  'INSTALL.md',
  'ENTREGA-FINAL.txt',
  '.env.example',
  '.gitignore',
  'package.json',
  'package-lock.json',
  'vercel.json',
  'docs/ENTREGA-TECNICA.md',
  'docs/ENTREGA-DOMINIO-HOSTING.md',
  'docs/CHECKLIST-RECEPCION-Y-TRASPASO.md',
  'docs/ARQUITECTURA-Y-SERVICIOS.md',
  'docs/CREDENCIALES-Y-ROTACION.md',
  'docs/SEGURIDAD.md',
  'docs/SUPABASE-RLS-Y-STORAGE.md',
  'supabase/functions/portal-user-admin/index.ts',
  'supabase/functions/portal-access-admin/index.ts',
  'supabase/migrations/20260827_role_access_and_tags.sql',
  'supabase/migrations/20260827_seed_base_content_tags.sql',
];

let failed = false;
for (const path of required) {
  if (!existsSync(path)) {
    console.error(`FALTA: ${path}`);
    failed = true;
  }
}

const env = existsSync('.env.example') ? readFileSync('.env.example', 'utf8') : '';
for (const name of ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'NEXT_PUBLIC_SITE_URL']) {
  if (!env.includes(name)) {
    console.error(`FALTA variable documentada: ${name}`);
    failed = true;
  }
}

if (/SUPABASE_SERVICE_ROLE_KEY\s*=\s*\S+/m.test(env)) {
  console.error('RIESGO: .env.example no debe contener un valor de service role.');
  failed = true;
}

if (failed) process.exit(1);
console.log(`Entrega verificada: ${required.length} componentes obligatorios presentes.`);
console.log('La verificación confirma estructura/documentación; no sustituye npm run verify ni pruebas funcionales de producción.');
