# Política de seguridad

InfiniHon Corp. se toma en serio la seguridad de sus sistemas, incluyendo el
sitio web, la tienda, el portal de cuentas y las funciones de backend
(Supabase Edge Functions) de este repositorio.

## Reportar una vulnerabilidad

Si encuentras una vulnerabilidad de seguridad, por favor **no abras un issue
público**. En su lugar, repórtala de forma privada a:

📧 **infinihon.hn@gmail.com**

Incluye, si es posible:

- Una descripción clara del problema y su impacto potencial.
- Pasos para reproducirlo (URL, payload, capturas, etc.).
- Cualquier prueba de concepto, si la tienes.

Confirmaremos la recepción de tu reporte y te mantendremos al tanto del
progreso mientras se investiga y corrige. Agradecemos la divulgación
responsable y el tiempo de quienes reportan problemas de buena fe.

## Alcance

Este repositorio contiene el código fuente público del sitio
(`infinihon.vercel.app`) y sus funciones de backend. Credenciales, llaves de
servicio y variables de entorno **no** viven en este repositorio: se
gestionan como secretos en Supabase y Vercel.
