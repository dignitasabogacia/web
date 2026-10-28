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
- Excepción documentada: el 19 de octubre de 2026 se añadió al final de `css/estilos.css` el bloque «6. Pie de página ordenado en todos los anchos», solo con reglas para `footer`. No toca cookies, Analytics ni el pixel.
- Segunda excepción documentada: el 20 de octubre de 2026 se añadió al final de `css/estilos.css` el bloque «MARCA 2026-10-20» (cursivas en Playfair Display, marca de agua única del logotipo al inicio de cada página y tema de color de Empresas) más el `@font-face` de Playfair Display. No toca cookies, Analytics ni el pixel.
- Tercera excepción documentada: el 20 de octubre de 2026 se añadió al final de `css/estilos.css` el bloque «6. Brillo que sigue al cursor en todas las tarjetas» y al final de `js/dignitas.js` un bloque independiente que solo asigna las variables `--mx` y `--my` a las tarjetas (`.service-card` y `.value-card`) al mover el cursor o tocar la pantalla. No toca cookies, Analytics ni el pixel.
- `404.html` en la raíz lo sirve GitHub Pages automáticamente para cualquier ruta que no exista.
- `llms.txt` en la raíz es el mapa del sitio pensado para agentes de IA (ChatGPT, Claude, Perplexity), leído junto con `robots.txt`, que les permite el paso expresamente.

## Archivos que NO deben subirse

Windows y los clientes de sincronización en la nube (Google Drive, iCloud) dejan archivos ocultos dentro de las carpetas. Si se sube la carpeta completa por arrastre, esos archivos acaban publicados en el sitio.

Ya ocurrió dos veces. La primera, `desktop.ini` quedó accesible en `/css/desktop.ini` y `/js/desktop.ini`. Se borró, y **volvió a pasar**: el 19 de octubre de 2026 había **32 copias publicadas**, una por carpeta, exponiendo una ruta interna del equipo.

El problema es que Windows los regenera solos y están marcados como ocultos, así que no se ven en el Explorador ni al revisar la carpeta a simple vista. **No basta con borrarlos una vez: hay que comprobarlo antes de cada subida.** Nunca deben ir:

- `desktop.ini` (Windows / Google Drive) — oculto, reaparece solo
- `.DS_Store` (macOS)
- `Thumbs.db` (Windows)
- Cualquier archivo terminado en `(1)`, copia duplicada por la sincronización.

## Qué debe contener el repositorio

Estado al 20 de octubre de 2026 (tercera revisión): **57 archivos**.

- 37 páginas `.html` (incluidas las 19 guías de `/guias/` y su índice, más `404.html`)
- `css/estilos.css` y `js/dignitas.js`
- `fonts/` con las 4 tipografías propias (`.woff2`): Montserrat, Cormorant Garamond (normal e itálica) y Playfair Display itálica (licencia SIL Open Font License). El sitio no carga tipografías de terceros: el Aviso de Privacidad lo afirma y debe seguir siendo cierto.
- 7 imágenes (`Logo.png`, `Logo-128.png`, `banner.png`, `og-banner.jpg`, `Elvira.jpeg`, `Emmanuel.jpeg`, `Foto.jpeg`) y `favicon.ico`
- `robots.txt`, `sitemap.xml`, `llms.txt`, este `README.md`
- `ed46adfe89adc8bd47535fa61ea8962d.txt` — clave de IndexNow para la indexación instantánea en Bing. Su contenido es su propio nombre. No borrar ni renombrar.
- `CNAME` — el dominio propio. **Nunca debe borrarse**; si desaparece, el sitio deja de responder en `www.dignitasabogacia.com`.
