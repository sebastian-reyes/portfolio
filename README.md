# Portfolio — Sebastián Reyes

Portfolio personal de **Sebastián Reyes**, Backend Software Engineer (Java · Spring WebFlux · Quarkus · Kafka · Azure).

🔗 **https://sebastian-reyes.github.io/portfolio/**

## Stack

Sitio estático sin dependencias que instalar. El único paso de build incrusta el CSS
en el HTML al desplegar y usa solo Node del runner (sin `npm install`, sin `package.json`).

| | |
|---|---|
| Marcado | HTML5 semántico |
| Estilos | CSS3 propio (custom properties), sin framework |
| Scripts | JavaScript (sin framework ni librerías) |
| Iconos | SVG en línea (sprite `<symbol>` + `<use>`) |
| Tipografía | Poppins autoalojada (subset latin, WOFF2) |
| Animación | CSS + `IntersectionObserver` |
| Formulario | [FormSubmit](https://formsubmit.co/) |
| Hosting | GitHub Pages vía GitHub Actions |

No hay peticiones a terceros: ni CDN, ni Google Fonts, ni Font Awesome.

## Estructura

```
.
├── index.html              # única página del sitio
├── styles.css              # estilos propios y variables de tema
├── scripts.js              # tema, navbar, carruseles, filtro, reveal, validación
├── build.mjs               # incrusta styles.css en index.html y arma dist/
├── fonts/                  # Poppins 300/400/600, subset latin
├── img/                    # capturas (WebP), iconos y og-image
├── robots.txt
├── sitemap.xml
└── .github/workflows/deploy.yml
```

`styles.css` va en la **raíz**, no en `css/`, a propósito: así las rutas `img/…` y
`fonts/…` que contiene resuelven igual esté suelto o incrustado en `index.html`, y
`build.mjs` puede ser una sustitución de texto pura sin reescribir URLs.
`scripts.js` está al lado por simetría.

## Desarrollo

```bash
python -m http.server 8000
# http://localhost:8000
```

Se edita `styles.css` como un archivo normal; en local el `index.html` lo enlaza con
un `<link>`. Abrir `index.html` directamente también funciona, aunque conviene usar un
servidor para que las rutas relativas y el `localStorage` se comporten como en producción.

## Build y despliegue

`build.mjs` genera `dist/` con el CSS incrustado dentro del `<style>` del `<head>`,
para que la página no tenga ninguna hoja de estilos bloqueando el render:

```bash
node build.mjs   # -> dist/
```

El workflow `.github/workflows/deploy.yml` lo ejecuta en cada push a `master` y publica
`dist/` en Pages. **La fuente de Pages debe estar en `GitHub Actions`**
(Settings → Pages → Build and deployment → Source), no en «deploy from a branch».

Si añades un archivo nuevo en la raíz que deba publicarse (`CNAME`, `_headers`, un PDF),
súmalo al array `RECURSOS` de `build.mjs` o no llegará al sitio. `build.mjs` falla con
código 1 si `index.html` deja de enlazar `styles.css` con la forma esperada, así que el
despliegue se corta antes de publicar una página sin estilos.

## Rendimiento

La carga inicial son **7 peticiones a un solo origen, ~64 kB** (HTML 15 kB gz + JS 3 kB gz
+ 3 WOFF2 24 kB + fondo 22 kB). Decisiones que sostienen ese número:

- **Sin Bootstrap ni Font Awesome.** Eran ~85 kB gz de CSS bloqueante repartidos en
  cuatro orígenes, más las webfonts de iconos. El CSS propio con solo lo que la página
  usa son 6 kB gz.
- **CSS incrustado al desplegar**, no enlazado: cero recursos bloqueando el render.
  Separarlo no compensa aquí porque GitHub Pages manda `Cache-Control: max-age=600` a
  todo por igual, HTML y assets, así que caducan juntos y no hay nada que ganar en caché.
- **Fuentes autoalojadas** con `preload`, en vez de dos orígenes de Google.
- **No se minifica.** Medido: son 475 bytes gz, y un minificador casero puede corromper
  los `data:image/svg+xml` de los controles del carrusel, que llevan `;` y `{`
  significativos. Mal negocio.
- **Iconos de tecnologías a 52 px** (2× de los 26 px a los que se pintan), no a 256 px.
- **`img/fondo.webp` a 1280×720 y calidad baja**: va bajo un velo negro al 80 %, no se
  nota, y es el elemento LCP.
- **Un solo temporizador** para los 7 carruseles, que se apaga cuando ninguno está en
  pantalla o la pestaña está oculta.

## Decisiones de estructura

- **Texto corrido alineado a la izquierda**, con `--medida` (65ch) como ancho de
  lectura. Centrar párrafos largos deja ambos márgenes irregulares y cuesta
  encontrar el inicio de cada línea; los títulos sí van centrados.
- **Experiencia como línea de tiempo** (`.linea-tiempo`), no como rejilla: tres
  puestos en dos columnas dejaban un hueco, y una carrera es una secuencia.
  Añadir un puesto es un `<li class="hito">` más.
- **Espaciado por escala** (`--espacio-xs` … `--espacio-xl`) en vez de valores
  sueltos, para que todas las secciones respiren igual.
- **Conocimiento agrupado** por dónde encaja cada tecnología: una parrilla plana
  donde HTML pesa lo mismo que Spring no comunica el perfil.
- **Reveal al hacer scroll** con `IntersectionObserver`. La clase `js-reveal` se
  añade desde JS: si el script no corre, el contenido se ve igual en vez de
  quedarse en `opacity: 0`.
- **Temas por tokens**: los dos temas se definen solo en `:root` y
  `html.dark-mode`. Ningún color de marca va cableado en las reglas: se usan
  `--acento`, `--sombra`, `--footer-bg`, `--nav-bg`… El azul de marca se aclara
  en oscuro (`#0162c8` → `#4d9fff`) porque el original no llega a contraste
  suficiente, y el texto no es blanco puro para evitar el halo. Los únicos
  colores literales que quedan son blancos sobre superficies oscuras en ambos
  temas (foto del hero, degradados, pie).
- **Navbar**: transparente sobre el hero y sólido con desenfoque al bajar. La
  clase `.desplazado` la pone `scripts.js` al hacer scroll **y** al abrir el
  menú móvil (sin eso el desplegable quedaría sin fondo sobre la foto). El
  `order: 3` de `.navbar-acciones` solo aplica desde 992px: en móvil el
  desplegable ocupa una fila propia y empujaría el botón de tema por debajo de
  los enlaces.
- **Rejilla y utilidades propias**: al quitar Bootstrap se reescribieron a mano solo
  las clases que el marcado usa (`.container`, `.row`, `.col-*`, `.navbar-*`,
  `.carousel-*`, `.form-*` y un puñado de utilidades), copiando los valores reales de
  Bootstrap 5.3.3 para no mover nada de sitio. Las utilidades (`.mb-3`, `.w-100`,
  `.text-center`…) conservan `!important` como en el original: sin él, reglas de
  componente como `.navbar-nav { margin-bottom: 0 }` las pisan por orden de cascada.
- **`.fixed-top` va después de `.navbar`** en la hoja. Las dos reglas tienen la misma
  especificidad y compiten por `position`; si `.fixed-top` va antes, la navbar deja de
  ser fija. En Bootstrap funcionaba porque las utilidades se cargan al final.

## Cómo añadir un proyecto

Hay **una sola tarjeta por proyecto** y el filtrado se hace por `data-categoria`.
Para añadir uno, copia un `<article class="… proyecto-item">` dentro de
`#grid-proyectos` y ajusta:

- `data-categoria` — una de `api`, `webapp`, `landing` (deben coincidir con los
  `data-filtro` de los botones; si añades una categoría nueva, añade su botón)
- el `id` del carrusel (`scripts.js` lo localiza solo; los botones llevan
  `data-slide="prev"` / `data-slide="next"` y no necesitan apuntar a ningún id)
- las imágenes (WebP, ancho máximo 1140 px, con `width`, `height` y `loading="lazy"`)
- los `<li class="tech-chip">` y el enlace `.enlace-proyecto`

## Cómo añadir un icono

Los iconos de la interfaz están en un sprite SVG al principio del `<body>`. Para añadir
uno, mete un `<symbol id="i-loquesea" viewBox="…">` en el sprite y úsalo con
`<svg class="icono" aria-hidden="true"><use href="#i-loquesea"></use></svg>`.
El tamaño se controla con `font-size` sobre `.icono` (que mide `1em × 1em`), igual que
se hacía con las clases de Font Awesome.

## Notas de mantenimiento

- **Edad**: se calcula en `scripts.js` desde `data-nacimiento="AAAA-MM-DD"` en
  `<span id="age">`, comparando mes y día.
- **Correo del formulario**: `index.html` aún usa la dirección en claro en el
  `action`. Conviene cambiarla por el alias con hash de FormSubmit para no
  exponerla al scraping.
- **`sitemap.xml`**: el `<lastmod>` se actualiza a mano.
- **Imágenes**: las capturas se sirven a 1140 px de ancho y los iconos de tecnologías a
  52 px. Todo es WebP salvo los 17 logos en SVG, el favicon y `og-image.jpg`.
- **Carruseles**: las diapositivas inactivas van en `display: none` para no descargar
  sus imágenes hasta que se ven. Chrome no dispara el `loading="lazy"` de una imagen que
  pasa de oculta a visible hasta que haya scroll, así que `scripts.js` le pone
  `loading="eager"` a la lámina destino justo antes del cambio; sin eso el hueco se
  queda en blanco.
- **Iconos de tecnologías**: los logos en SVG vienen de
  [Devicon](https://devicon.dev/) (MIT); los WebP se generaron desde los originales del
  repo. Las marcas pertenecen a sus dueños y se usan solo para identificar cada
  tecnología. Las 40 tienen logo. Cuatro no existían en ningún CDN de iconos y se
  obtuvieron de su fuente oficial, recortando el símbolo del wordmark: Mockito y
  AsyncAPI (repos oficiales), Checkstyle (repo oficial) y Confluent (Wikimedia
  Commons, dominio público; recortado por `viewBox`, sin pérdida al ser SVG).
- **Marcas de GitHub y LinkedIn**: la de GitHub es el mark de
  [Octicons](https://github.com/primer/octicons) (MIT); la de LinkedIn es su marca
  registrada y se usa solo como enlace al perfil. El resto de iconos de interfaz
  (calendario, documento, avión, sol, luna) están dibujados a trazo, al mismo estilo.
- **Tamaño de los logos de estudios**: se dimensionan por **altura**, no por
  ancho. IDAT es casi cuadrado (1.14) y UTP muy apaisado (3.29), así que un ancho
  común los dejaba con pesos visuales muy distintos (130x114 frente a 130x40).
  Cada uno lleva su propio `height: clamp(...)`, que escala de forma continua
  entre móvil y escritorio sin saltos por breakpoints. Los atributos
  `width`/`height` del HTML se mantienen para conservar la proporción y evitar
  saltos de layout.
- **Logos de estudios**: IDAT y UTP tienen una variante por tema (`logo-tema`
  + `logo-claro`/`logo-oscuro`); el CSS muestra una sola. IDAT es monocromo, así
  que la versión oscura es el archivo invertido entero. UTP es mixto: se invierte
  **solo el texto descriptivo** (a partir de x=493, el hueco entre los bloques y
  el texto en el propio archivo) y los bloques rojo/negro quedan intactos, porque
  invertir el bloque negro de la "T" haría desaparecer su letra blanca.
- **Logos oscuros en tema oscuro**: GitHub, Apache Kafka, SQL Server y Confluent
  bajan de 2:1 de contraste sobre `--card-bg` oscuro y desaparecen. Llevan la
  clase `.icono-fondo-claro`, que les pone una placa clara solo en tema oscuro.
  No se invierten porque eso falsearía el color de los que no son negro puro.
  El criterio es el **contraste real contra el fondo de la tarjeta**, no la
  saturación: Confluent es `#173361`, muy saturado pero a 1.36:1.
- **Transparencia**: al convertir a WebP hay que conservar el modo RGBA. Pasar
  por `.convert("RGB")` aplasta el canal alfa sobre negro y los iconos salen
  con un recuadro negro de fondo.
- **Dimensiones**: los `<img>` llevan `width`/`height` para evitar saltos de
  layout, pero el CSS necesita `height: auto` o la imagen se deforma al
  escalar el ancho. Si cambias una imagen de tamaño, actualiza sus atributos.
- **Tema**: se aplica en un script inline del `<head>` para evitar el destello
  blanco, y respeta `prefers-color-scheme` cuando no hay preferencia guardada.
- **Animaciones**: se anima `transform` y `opacity`, nunca `width` ni `height`, para no
  provocar layout en cada frame. El subrayado de las cabeceras usa `scaleX()` por eso.
