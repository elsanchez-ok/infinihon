# InfiniHon Corp.

Corporativo tecnológico hondureño: proyectos propios de software, motores
experimentales, infraestructura IT, tienda de hardware y servidores.

Sitio único (single-file HTML generado con Vite) con las experiencias servidas
desde `infinihon.vercel.app`:

| Ruta             | Archivo            | App             |
|------------------|--------------------|-----------------|
| `/`              | `index.html`       | Landing         |
| `/proyectos`     | `proyectos.html`   | Proyectos       |
| `/ghost-browser` | `proyectos.html`   | Proyectos       |
| `/tienda`        | `tienda.html`      | Tienda Digital  |
| `/auth`          | `auth.html`        | Acceso          |
| `/admin`         | `admin.html`       | Control Center  |
| `/account`       | `account.html`     | Portal de usuario |

La app `proyectos` comparte el mismo single-file para `/proyectos` (catálogo)
y `/ghost-browser` (página del proyecto Ghost Browser); el enrutado es por
`window.location.pathname` en el cliente.

`vercel.json` redirige las rutas de aplicaciones `pushState` hacia sus
single-files. Las fuentes viven en `app/<nombre>` y se compilan con:

```bash
cd app/<nombre>
npm install
npm approve-scripts esbuild   # npm 11 bloquea el binario de esbuild
npm run build
# el build copia dist/index.html al HTML de la raíz que sirve Vercel
```

Los paquetes `admin`, `account`, `tienda` y `proyectos` publican
automáticamente su HTML raíz al compilar; no copies `dist/index.html`
manualmente.

## Despliegue

El proyecto Vercel `infinihon` está vinculado al repositorio
`elsanchez-ok/infinihon` con rama de producción `main`. Al hacer merge a
`main`, Vercel despliega automáticamente el contenido de `web/` (ver
`vercel.json`, `outputDirectory: web`).

## Notas

- Todo corre estático; no hay backend.
- Los datos de demostración viven en memoria (nada persiste).
- Los proyectos de `/proyectos` se definen en
  `app/proyectos/src/data/projects.ts`.
