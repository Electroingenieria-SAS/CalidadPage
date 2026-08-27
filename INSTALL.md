# CALIDOSO TEAM — Guía maestra de instalación, despliegue y traspaso

> Documento operativo para instalar, desplegar, migrar o recibir el proyecto **PAGE-CALIDAD** sin depender del desarrollador original.

## 1. Qué se está instalando

CALIDOSO TEAM es una aplicación **Next.js 16.3.3** con:

- frontend React;
- Route Handlers/API en Next.js;
- Supabase Database (PostgreSQL);
- Supabase Auth;
- Supabase Storage;
- Supabase Edge Functions;
- Phaser 4 para el juego Paco;
- GitHub como repositorio y CI;
- Vercel como hosting de producción recomendado.

El flujo oficial de producción es:

```text
GitHub (main)
      |
      v
Vercel Build / Production
      |
      +------> Supabase Auth
      +------> Supabase Database + RLS
      +------> Supabase Storage
      +------> Supabase Edge Functions
```

No se debe desplegar una copia manual por fuera de GitHub si se desea conservar trazabilidad y rollback.

---

## 2. Requisitos previos

Antes de empezar se requiere:

1. **Node.js 24.x**.
2. npm compatible con Node 24.
3. Acceso al repositorio GitHub.
4. Acceso al proyecto Vercel o permiso para crear/importar uno.
5. Acceso al proyecto Supabase o permiso para crear uno nuevo.
6. Dominio y acceso DNS si se instalará dominio personalizado.
7. Variables de entorno indicadas en `.env.example`.

Verificar Node:

```bash
node --version
npm --version
```

El proyecto declara `node: 24.x` en `package.json`.

---

## 3. Archivos que el receptor debe leer primero

En este orden:

1. `README.md` — descripción completa del sistema.
2. `INSTALL.md` — esta guía.
3. `ENTREGA-FINAL.txt` — resumen rápido de la entrega.
4. `docs/ENTREGA-TECNICA.md` — inventario técnico.
5. `docs/ARQUITECTURA-Y-SERVICIOS.md` — servicios y fronteras de confianza.
6. `docs/CREDENCIALES-Y-ROTACION.md` — inventario de secretos y rotación.
7. `docs/SUPABASE-RLS-Y-STORAGE.md` — modelo de seguridad de datos.
8. `docs/SEGURIDAD.md` — controles de seguridad.
9. `docs/OPERACION-MONITOREO.md` — operación posterior al despliegue.
10. `docs/PLAN-RESPUESTA-INCIDENTES.md` — qué hacer ante incidentes.

---

## 4. Instalación local desde el repositorio

### 4.1 Clonar

```bash
git clone <URL_DEL_REPOSITORIO>
cd Page-calidad
```

Si se recibió solo el ZIP:

1. descomprimirlo;
2. abrir una terminal en la raíz, donde está `package.json`;
3. inicializar Git solamente si el receptor va a crear un repositorio nuevo.

### 4.2 Preparar configuración local

Ejecutar:

```bash
npm run setup
```

El comando:

- comprueba Node 24;
- crea `.env.local` desde `.env.example` si no existe;
- no escribe secretos reales;
- explica qué variables faltan.

Después editar `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REEMPLAZAR
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

**Nunca** poner `SUPABASE_SERVICE_ROLE_KEY` con prefijo `NEXT_PUBLIC_`.

### 4.3 Instalar dependencias

```bash
npm ci
```

No usar `npm install` para una instalación reproducible si existe `package-lock.json`.

### 4.4 Verificaciones antes de iniciar

```bash
npm run preflight
npm run scan:secrets
npm run lint
npm run typecheck
```

O:

```bash
npm run verify
```

### 4.5 Desarrollo

```bash
npm run dev
```

Abrir:

```text
http://localhost:3000
```

La aplicación debe mostrar primero el **login obligatorio**. El contenido del portal no debe montarse antes de una sesión válida.

---

## 5. Uso del Supabase actual

Proyecto utilizado durante esta entrega:

```text
Project ref: zultnmgildejjskwdzgq
Nombre: Calidosos team
```

Si se mantiene este proyecto, **no recrear el esquema desde cero**. Las migraciones de acceso y etiquetas ya están aplicadas en producción.

Edge Functions activas al momento de la entrega:

```text
portal-user-admin    v5
portal-access-admin  v1
```

Ambas requieren JWT válido.

### 5.1 Variables del frontend

Obtener en Supabase:

- Project URL;
- Publishable Key moderna `sb_publishable_...`.

Configurar esas variables en Vercel, no dentro del código.

### 5.2 Rotación recomendada para traspaso

Para cambio de propietario/equipo:

1. crear una nueva publishable key;
2. actualizar `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en Vercel;
3. desplegar;
4. probar login, lectura, permisos y administración;
5. solo después retirar/deshabilitar la clave anterior.

Nunca revocar una clave primero y actualizar Vercel después, porque produciría caída de servicio.

---

## 6. Instalación en un Supabase nuevo

Usar esta sección solamente si se migrará a otro proyecto Supabase.

### 6.1 Crear proyecto

Crear el nuevo proyecto y guardar de forma segura:

- project ref;
- Project URL;
- publishable key;
- credenciales administrativas del propietario.

### 6.2 Aplicar SQL base

Revisar `supabase/sql/`.

Archivos relevantes:

```text
supabase/sql/00_install_or_upgrade.sql
supabase/sql/01_bootstrap_super_admin.sql
supabase/sql/02_user_admin_hardening.sql
supabase/sql/99_verify_installation.sql
```

### 6.3 Aplicar migraciones

Las migraciones versionadas están en:

```text
supabase/migrations/
```

Incluyen:

```text
20260827_role_access_and_tags.sql
20260827_seed_base_content_tags.sql
```

Si se usa Supabase CLI:

```bash
supabase login
supabase link --project-ref <NUEVO_PROJECT_REF>
supabase db push
```

Si el proyecto nuevo no contiene las migraciones históricas completas, revisar primero `00_install_or_upgrade.sql` y la documentación de datos. No ejecutar SQL destructivo sin respaldo.

### 6.4 Edge Functions

Desplegar:

```bash
supabase functions deploy portal-user-admin
supabase functions deploy portal-access-admin
```

Las fuentes están en:

```text
supabase/functions/portal-user-admin/
supabase/functions/portal-access-admin/
```

Mantener JWT verification habilitado.

### 6.5 Secrets de Edge Functions

`SUPABASE_URL` y los secretos internos de Supabase deben residir en el entorno administrado de Edge Functions.

Nunca poner `service_role` en:

- `.env.example`;
- `.env.local` compartido;
- GitHub;
- JavaScript cliente;
- variables `NEXT_PUBLIC_*`;
- documentación.

### 6.6 Verificación

Ejecutar el SQL de:

```text
supabase/sql/99_verify_installation.sql
```

Luego comprobar:

- RLS activo;
- perfiles;
- roles;
- tags;
- políticas de acceso;
- buckets de Storage;
- Edge Functions;
- Security Advisor.

---

## 7. Modelo de roles y acceso

La autorización no depende únicamente del frontend.

Capas:

1. sesión Supabase Auth;
2. perfil activo;
3. rol del perfil;
4. `role_access_policies` para módulos;
5. `role_content_scopes` para alcance;
6. categorías/etiquetas/contenido específico;
7. RLS como autoridad final.

El `super_admin` mantiene acceso total para impedir un autobloqueo irrecuperable.

El panel del super admin permite controlar qué puede ver cada rol en:

- Inicio;
- Apps;
- Documentos;
- Noticias;
- Auditorías;
- Publicaciones.

El alcance puede definirse como:

- todo;
- registros específicos;
- categorías;
- etiquetas.

No sustituir este mecanismo por validaciones únicamente visuales.

---

## 8. GitHub: preparación de repositorio

### 8.1 Archivos que sí deben versionarse

- código fuente;
- `package.json`;
- `package-lock.json`;
- migraciones;
- Edge Functions;
- `.env.example`;
- documentación;
- workflows de GitHub;
- Dependabot.

### 8.2 Archivos que nunca deben versionarse

- `.env.local`;
- `.env.production` con valores reales;
- claves privadas;
- tokens GitHub;
- SMTP passwords;
- service role;
- secret keys Supabase;
- secretos CAPTCHA.

### 8.3 Antes del primer push

```bash
npm run handoff:check
npm run scan:secrets
npm run verify
```

Después:

```bash
git status
git add .
git commit -m "release: entrega segura calidoso team"
git push origin main
```

La política recomendada es proteger `main` y exigir CI exitoso.

---

## 9. Vercel: despliegue por GitHub

El flujo recomendado es **importar el repositorio** en Vercel, no subir manualmente una carpeta compilada.

### 9.1 Configuración del proyecto

- Framework Preset: `Next.js`.
- Node.js: `24.x`.
- Install Command: `npm ci`.
- Build Command: `npm run build`.
- Production branch: `main`.

`vercel.json` ya incluye la configuración básica de framework/install/build.

### 9.2 Variables requeridas

En Vercel → Project → Settings → Environment Variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL
```

Opcional:

```text
NEXT_PUBLIC_TURNSTILE_SITE_KEY
```

Aplicarlas al menos a `Production`; repetir en Preview/Development si esos ambientes se usarán.

### 9.3 Primera publicación

1. guardar variables;
2. desplegar desde `main`;
3. esperar build `READY`;
4. abrir la URL de Vercel;
5. verificar que aparezca login;
6. autenticar super admin;
7. comprobar matriz de acceso;
8. verificar Apps/documentos por rol;
9. probar administración de usuarios;
10. revisar logs por errores 4xx/5xx inesperados.

---

## 10. Dominio personalizado

### 10.1 Agregar dominio

En Vercel:

```text
Project -> Settings -> Domains -> Add Domain
```

Agregar, por ejemplo:

```text
portal.midominio.com
```

o el dominio raíz deseado.

### 10.2 DNS

Vercel mostrará los registros DNS exactos requeridos para ese dominio.

Configurar **exactamente los valores que Vercel muestre** en el proveedor DNS. No copiar A/CNAME de otra instalación porque pueden cambiar según configuración/plataforma.

### 10.3 Esperar verificación

No cambiar `NEXT_PUBLIC_SITE_URL` hasta que el dominio esté verificado o se tenga preparada una publicación coordinada.

Cuando Vercel marque el dominio como válido:

```text
NEXT_PUBLIC_SITE_URL=https://portal.midominio.com
```

Actualizar la variable y redeployar.

### 10.4 Supabase Auth URL Configuration

Agregar el dominio nuevo a la configuración de URLs permitidas de Supabase Auth.

Revisar:

- Site URL;
- Redirect URLs autorizadas;
- cualquier callback utilizado por Auth.

No dejar redirects comodín innecesariamente amplios en producción.

### 10.5 HTTPS

Vercel gestiona TLS/HTTPS para dominios correctamente asociados. La aplicación también define headers de seguridad, incluyendo HSTS cuando corresponde.

Verificar siempre:

```text
http://dominio -> redirección/servicio HTTPS
https://dominio -> 200/login
```

---

## 11. Transferencia a otro propietario o proveedor

Entregar:

- repositorio Git o ZIP completo;
- acceso/transferencia GitHub;
- acceso/transferencia Vercel;
- acceso/transferencia Supabase;
- dominio/DNS;
- inventario de variables **sin valores secretos dentro del documento**;
- procedimiento de rotación;
- estado de migraciones;
- estado de Edge Functions;
- usuarios administrativos autorizados.

No enviar secretos por correo o chat junto con el código. Transferirlos mediante un gestor de contraseñas o mecanismo seguro independiente.

---

## 12. Firebase

Esta versión no utiliza Firebase.

Por tanto:

- no crear un proyecto Firebase solo para “llenar” el inventario;
- no pedir credenciales Firebase;
- no añadir SDK Firebase innecesariamente.

Si en el futuro se incorpora Firebase, documentarlo como un servicio nuevo y separarlo de Supabase.

---

## 13. Checklist posterior al despliegue

### Aplicación

- [ ] carga exclusivamente después del login;
- [ ] login válido funciona;
- [ ] logout funciona;
- [ ] sesión expirada vuelve a login;
- [ ] menú respeta módulos del rol;
- [ ] Apps respetan alcance;
- [ ] documentos respetan alcance;
- [ ] tags/categorías funcionan;
- [ ] Paco/hero conservan comportamiento;
- [ ] responsive funciona.

### Super admin

- [ ] ve Seguridad y Operación;
- [ ] ve administración de usuarios;
- [ ] puede modificar permisos por rol;
- [ ] no puede quedar sin acceso total por configuración accidental;
- [ ] puede asignar contenido/categorías/tags.

### Supabase

- [ ] Security Advisor revisado;
- [ ] RLS activo;
- [ ] Edge Functions activas;
- [ ] Storage con límites MIME/tamaño;
- [ ] no existe `service_role` en cliente;
- [ ] nueva publishable key probada.

### Vercel

- [ ] deployment READY;
- [ ] production apunta a `main`;
- [ ] variables configuradas;
- [ ] dominio válido;
- [ ] HTTPS válido;
- [ ] no hay errores 500 persistentes.

### GitHub

- [ ] CI verde;
- [ ] scanner de secretos verde;
- [ ] Dependabot activo;
- [ ] `main` protegido si la organización lo permite;
- [ ] no existe `.env.local` en Git.

---

## 14. Rollback

### Si falla el frontend

1. no tocar la base de datos inmediatamente;
2. identificar último deployment sano en Vercel;
3. revertir el commit problemático o promover deployment anterior;
4. verificar variables de entorno;
5. revisar logs.

### Si falla una migración

No improvisar `DROP TABLE` ni borrado de políticas.

1. detener nuevas migraciones;
2. revisar historial;
3. restaurar mediante una migración correctiva versionada;
4. validar RLS y permisos;
5. documentar el incidente.

### Si se filtra un secreto

Seguir `docs/PLAN-RESPUESTA-INCIDENTES.md` y `docs/GIT-SECRET-CLEANUP.md`.

La respuesta correcta es **rotar el secreto**, no solo borrarlo del último commit.

---

## 15. Comandos de referencia

```bash
# Preparación local
npm run setup
npm ci

# Calidad
npm run preflight
npm run scan:secrets
npm run lint
npm run typecheck
npm run verify
npm run handoff:check

# Desarrollo
npm run dev

# Build de producción
npm run build
npm run start

# Auditoría de dependencias
npm run security:audit
```

---

## 16. Criterio de aceptación de la entrega

La entrega puede considerarse aceptada cuando:

1. un tercero puede clonar/descomprimir el proyecto;
2. puede identificar variables sin recibir secretos embebidos;
3. puede instalar dependencias;
4. puede enlazar Supabase;
5. puede desplegar Edge Functions/migraciones si migra de backend;
6. puede importar GitHub a Vercel;
7. puede asociar dominio;
8. puede autenticar usuarios;
9. super admin puede gestionar accesos;
10. RLS impide acceso no autorizado;
11. CI y scanners pasan;
12. existe procedimiento de rollback y rotación de credenciales.

Si cualquiera de estos puntos falla, revisar la sección correspondiente de este documento antes de realizar cambios destructivos.
