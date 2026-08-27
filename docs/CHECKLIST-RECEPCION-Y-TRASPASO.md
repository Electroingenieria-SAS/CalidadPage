# Checklist de recepción y traspaso

## Código
- [ ] Se recibió repositorio Git o ZIP completo.
- [ ] Existe `package.json` y `package-lock.json`.
- [ ] Existe `.env.example` sin valores secretos reales.
- [ ] Existen `README.md` e `INSTALL.md`.
- [ ] Existen migraciones y Edge Functions.

## GitHub
- [ ] Receptor tiene permisos suficientes.
- [ ] Rama de producción identificada como `main`.
- [ ] CI de seguridad ejecuta correctamente.
- [ ] Dependabot está configurado.
- [ ] Historial fue revisado si hubo secretos antiguos.

## Vercel
- [ ] Proyecto importado/conectado al repositorio correcto.
- [ ] Node 24.x.
- [ ] Build `npm run build`.
- [ ] Install `npm ci`.
- [ ] Variables de entorno configuradas.
- [ ] Dominio agregado y verificado.

## Supabase
- [ ] Proyecto correcto identificado.
- [ ] URL y publishable key configuradas.
- [ ] RLS revisado.
- [ ] Storage revisado.
- [ ] `portal-user-admin` activa.
- [ ] `portal-access-admin` activa.
- [ ] Migraciones registradas.
- [ ] Security Advisor revisado.

## Seguridad
- [ ] No hay service role en frontend.
- [ ] Claves privadas no están en Git.
- [ ] Publishable key rotada si aplica al traspaso.
- [ ] Password Verification Hook configurado si se desea bloqueo 5/15 a nivel Auth.
- [ ] CAPTCHA configurado si se dispone de credenciales.
- [ ] Leaked Password Protection activado si el plan lo permite.
- [ ] MFA/2FA de cuentas administrativas activado cuando sea posible.

## Funcional
- [ ] Login obligatorio.
- [ ] Super admin funcional.
- [ ] Gestión de usuarios funcional.
- [ ] Matriz por rol funcional.
- [ ] Apps por rol/tag/categoría funcional.
- [ ] Documentos por rol/tag/categoría funcional.
- [ ] Hero y Paco no sufrieron regresiones.

## Aceptación
- [ ] Receptor puede desplegar sin depender del autor original.
- [ ] Receptor sabe dónde rotar cada secreto.
- [ ] Receptor sabe cómo hacer rollback.
- [ ] Receptor sabe qué servicios se pueden reemplazar y cuáles no es necesario reemplazar.
