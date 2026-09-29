# InfiniHon

Tecnología e infraestructura para construir lo que sigue.

Sitio único (single-file HTML generado con Vite) con cinco experiencias
servidas desde `infinihon.vercel.app`:

| Ruta       | Archivo           | App             |
|------------|-------------------|-----------------|
| `/`        | `index.html`      | Landing         |
| `/tienda`  | `tienda.html`     | Tienda Digital  |
| `/auth`    | `auth.html`       | Acceso          |
| `/admin`   | `admin.html`      | Control Center  |
| `/account` | `account.html`    | Portal de usuario |

`vercel.json` redirige las rutas de aplicaciones `pushState` hacia sus
single-files. Las fuentes viven en `app/<nombre>` y se compilan con:

```bash
cd app/<nombre>
npm install
npm approve-scripts esbuild   # npm 11 bloquea el binario de esbuild
npm run build
# el build copia dist/index.html al HTML de la raíz que sirve Vercel
```

Los paquetes `admin`, `account` y `tienda` publican automáticamente su HTML raíz
al compilar; no copies `dist/index.html` manualmente.

## Notas

- Todo corre estático; no hay backend.
- Los datos de demostración viven en memoria (nada persiste).