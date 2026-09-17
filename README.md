# Dígnitas Abogacía — notas técnicas

Sitio estático servido por **GitHub Pages** (dominio propio `www.dignitasabogacia.com` vía `CNAME`). No hay compilación, framework ni build: cada carpeta contiene un `index.html` completo y autocontenido, con el encabezado, el menú y el pie de página duplicados en cada archivo. Este documento vive en el repositorio para quien mantenga el código después. No está enlazado desde ninguna página ni listado en `sitemap.xml`, pero queda accesible si alguien escribe su dirección directamente; no contiene datos confidenciales.

## Limitación de plataforma: no hay negociación de contenido ni encabezados personalizados

GitHub Pages es un CDN de archivos estáticos (Fastly), sin ningún servidor de aplicación detrás. Esto se comprobó de forma directa contra producción:

```
curl -H "Accept: text/markdown" https://www.dignitasabogacia.com/
→ Content-Type: text/html; charset=utf-8   (idéntico a una petición normal)
```

GitHub Pages ignora por completo el encabezado `Accept` de cualquier petición: siempre devuelve el mismo archivo `.html`, sea lo que sea que el cliente diga aceptar. **No existe ningún archivo de configuración en este repositorio que pueda cambiar esto** — a diferencia de Netlify (`_headers`, `_redirects`) o Vercel (`vercel.json`), GitHub Pages no admite reglas de servidor, funciones edge ni encabezados HTTP personalizados de ningún tipo.

En consecuencia:

- **No es posible** servir una versión Markdown de las páginas cuando el cliente pide `Accept: text/markdown`, ni ningún otro tipo de negociación de contenido, mientras el sitio siga en GitHub Pages.
- El encabezado `Vary: Accept-Encoding` **ya está presente** en todas las respuestas — lo añade automáticamente la CDN de Fastly cuando comprime con gzip/brotli, no requiere nada de este repositorio. **No debe añadirse `Accept` a ese encabezado**: `Vary: Accept` le diría a los cachés que la respuesta cambia según lo que el cliente acepte, y —como se demuestra arriba— eso no ocurre. Añadirlo generaría cachés inconsistentes sin resolver nada.

### Solución recomendada si en el futuro se necesita negociación real

Poner el dominio detrás de un proxy con lógica propia, sin abandonar GitHub Pages como origen de los archivos:

1. **Cloudflare Workers** (la opción más simple): un Worker que intercepte la petición, mire el encabezado `Accept`, y si pide `text/markdown` reescriba la respuesta HTML a Markdown antes de devolverla al cliente. Cloudflare ya sería el proxy DNS si se usa su plan gratuito; solo hay que añadir el Worker.
2. Alternativa: migrar el hospedaje a **Netlify** o **Vercel**, que sí permiten un archivo `_headers` o funciones edge para esto directamente, sin necesidad de un proxy aparte.

Cualquiera de las dos opciones es una decisión de infraestructura — cambia dónde vive el sitio o añade una capa nueva — y debe evaluarse por separado, no como una edición de este código.

## Otras notas

- `js/dignitas.js` y `css/estilos.css` concentran el consentimiento de cookies, Google Analytics 4 y el pixel de Meta. No deben tocarse salvo que el cambio sea explícitamente sobre eso.
- `404.html` en la raíz lo sirve GitHub Pages automáticamente para cualquier ruta que no exista.
- `llms.txt` en la raíz es el mapa del sitio pensado para agentes de IA (ChatGPT, Claude, Perplexity), leído junto con `robots.txt`, que les permite el paso expresamente.

## Archivos que NO deben subirse

Windows y los clientes de sincronización en la nube (Google Drive, iCloud) dejan archivos ocultos dentro de las carpetas. Si se sube la carpeta completa por arrastre, esos archivos acaban publicados en el sitio.

Ya ocurrió: `desktop.ini` llegó a publicarse y quedó accesible en `/css/desktop.ini` y `/js/desktop.ini`, exponiendo una ruta interna del equipo. Antes de subir, comprobar que no vayan:

- `desktop.ini` (Windows / Google Drive)
- `.DS_Store` (macOS)
- `Thumbs.db` (Windows)
- Cualquier archivo terminado en `(1)`, copia duplicada por la sincronización.

Los únicos archivos que deben existir en el repositorio son los 29 listados por el sitio: los 17 `.html`, `css/estilos.css`, `js/dignitas.js`, las 6 imágenes, `robots.txt`, `sitemap.xml`, `llms.txt`, este `README.md` y el `CNAME` (que vive solo en GitHub y no debe borrarse).
