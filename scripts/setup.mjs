import { existsSync, copyFileSync } from 'node:fs';
import process from 'node:process';

const major = Number(process.versions.node.split('.')[0]);
if (major !== 24) {
  console.error(`ERROR: Node ${process.versions.node} detectado. Este proyecto requiere Node 24.x.`);
  process.exit(1);
}

if (!existsSync('.env.local')) {
  if (!existsSync('.env.example')) {
    console.error('ERROR: falta .env.example.');
    process.exit(1);
  }
  copyFileSync('.env.example', '.env.local');
  console.log('Creado .env.local desde .env.example. Completa sus valores antes de ejecutar el portal.');
} else {
  console.log('.env.local ya existe; no se modificó.');
}

console.log('\nSiguientes pasos:');
console.log('1. Completa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env.local.');
console.log('2. Ejecuta: npm ci');
console.log('3. Ejecuta: npm run preflight');
console.log('4. Ejecuta: npm run dev');
