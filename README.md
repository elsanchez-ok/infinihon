# InfiniHon Corp.

**InfiniHon Corp.** (también conocido como *Corporativo InfiniHon*) es un corporativo
tecnológico hondureño con sede en Tegucigalpa, Honduras. Diseñamos, implementamos y
protegemos la infraestructura tecnológica de empresas — redes, servidores, cloud,
ciberseguridad y monitorización — y publicamos aquí los proyectos de software y
plataformas propias que construimos dentro del corporativo.

🔗 **Sitio oficial:** [infinihon.vercel.app](https://infinihon.vercel.app/)

## Qué hacemos

- **Networking** — diseño e implementación de redes corporativas, VPN y enrutamiento (MikroTik, BGP, MPLS).
- **Cloud** — arquitecturas cloud e híbridas en AWS, Azure y Google Cloud.
- **DevOps** — infraestructura como código, contenedores y pipelines (Docker, Kubernetes, Terraform, Ansible).
- **Seguridad** — auditoría, hardening, segmentación de red y accesos remotos seguros.
- **Monitoring** — métricas, dashboards y alertas con Prometheus y Grafana.
- **Software a medida** — desarrollo, automatización de procesos e integraciones entre sistemas.

## Proyectos propios

Más allá de redes e infraestructura, InfiniHon Corp. publica sus propios proyectos de
software y motores experimentales en [infinihon.vercel.app/proyectos](https://infinihon.vercel.app/proyectos),
incluyendo [Ghost Browser](https://github.com/sarch-codelab/ghost-browser), un navegador
de escritorio ligero con arquitectura híbrida (Rust + WebView2).

## Estructura del repositorio

Este repositorio contiene el código fuente de todas las apps que sirven
`infinihon.vercel.app`: landing/home, tienda, proyectos, acceso (`/auth`), portal de
usuario (`/account`) y panel de control (`/admin`). Cada app vive en `web/app/<nombre>` y
se compila a un único HTML estático servido por Vercel. Detalles técnicos de build y
despliegue en [`web/README.md`](web/README.md).

## Contacto

📧 [infinihon.hn@gmail.com](mailto:infinihon.hn@gmail.com) · 📍 Tegucigalpa, Honduras
