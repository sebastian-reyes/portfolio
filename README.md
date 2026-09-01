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
├── index.html              # única página del sitio, en español (fuente)
├── styles.css              # estilos propios y variables de tema
├── scripts.js              # tema, navbar, carruseles, filtro, reveal, validación
├── build.mjs               # incrusta el CSS, traduce y arma dist/
├── i18n/en.json            # tabla de traducción al inglés
├── fonts/                  # Poppins 300/400/600, subset latin
├── img/                    # capturas (WebP), iconos y og-image
├── robots.txt
├── sitemap.xml
└── .github/workflows/deploy.yml
```

El sitio publicado tiene dos páginas:

| URL | idioma |
|---|---|
| `/portfolio/` | español (por defecto) |
| `/portfolio/en/` | inglés |

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

`build.mjs` genera `dist/` con las dos páginas y el CSS incrustado dentro del `<style>`
del `<head>`, para que ninguna tenga hojas de estilos bloqueando el render:

```bash
node build.mjs
# dist/index.html      [es]
# dist/en/index.html   [en]  104 cadenas traducidas
```

El workflow `.github/workflows/deploy.yml` lo ejecuta en cada push a `master` y publica
`dist/` en Pages. **La fuente de Pages debe estar en `GitHub Actions`**
(Settings → Pages → Build and deployment → Source), no en «deploy from a branch».

Si añades un archivo nuevo en la raíz que deba publicarse (`CNAME`, `_headers`, un PDF),
súmalo al array `RECURSOS` de `build.mjs` o no llegará al sitio. `build.mjs` falla con
código 1 si `index.html` deja de enlazar `styles.css` con la forma esperada, así que el
despliegue se corta antes de publicar una página sin estilos.

## Idiomas

**Hay un solo HTML fuente, en español.** La versión en inglés se genera en el build
aplicando `i18n/en.json` sobre `index.html`. No existe un segundo HTML que mantener,
que es justo lo que se desincroniza a las dos semanas.

`i18n/en.json` traduce **bloques de HTML completos**, no palabras sueltas:

```json
{ "es": "Soy <b>Backend Java Software Engineer</b> con más de 4 años…",
  "en": "I'm a <b>Backend Java Software Engineer</b> with more than 4 years…" }
```

Se traduce con el marcado dentro a propósito. El texto está partido por `<b>`, y en
español el énfasis cae en sitios donde en inglés no encaja; llevando el `<b>` en la
traducción, cada idioma pone la negrita donde le corresponde. Los espacios y saltos de
línea no importan al buscar: el build compara con `\s+`.

Cada entrada acepta `veces` (cuántas apariciones espera, 1 por defecto). Además hay
`patrones`, para lo repetitivo con estructura fija:

```json
{ "buscar": "Captura (\\d+) de (\\d+) del proyecto ",
  "poner": "Screenshot $1 of $2 of the project ", "minimo": 22 }
```

**El build aborta con código 1 si una entrada no aparece exactamente las veces
esperadas.** O sea: si cambias una frase en `index.html` y olvidas la traducción, el
despliegue falla en vez de publicar media página en español. Es la propiedad que hace
que este enfoque no se pudra.

### Añadir o cambiar texto

1. Edita `index.html` como siempre.
2. Ejecuta `node build.mjs`. Si tocaste algo traducido, te dirá exactamente qué entrada
   quedó huérfana.
3. Actualiza esa entrada en `i18n/en.json`.

### Añadir otro idioma

Copia `i18n/en.json` a `i18n/<código>.json`, tradúcelo y añade el código al array
`IDIOMAS` de `build.mjs`. El selector de idioma del navbar es una entrada más de la
tabla (cambia el `href` y la etiqueta), así que habría que replantearlo si pasas de dos.

### Rutas y SEO

La página en inglés vive un nivel más abajo, así que el build reescribe sus rutas
relativas con el prefijo `../` (ver `PREFIJOS` en `build.mjs`). Después **comprueba
contra el disco que cada ruta referenciada existe de verdad** en `dist/`, en las dos
páginas. Esa verificación es la que vale: una comprobación por texto no detecta una ruta
malformada, porque simplemente no casa con el patrón y se salta el chequeo.

Cada página lleva su `<html lang>`, su `canonical` y el juego completo de `hreflang`
(`es`, `en`, `x-default`), y `sitemap.xml` declara las dos URLs con sus alternates.
No hay redirección automática por idioma del navegador: rompe el botón atrás y confunde
a los rastreadores. El cambio es explícito, con el selector del navbar.

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
- **`ol, ul { margin-top: 0 }`** hace falta explícitamente. El Reboot de Bootstrap lo
  traía y al reescribir el CSS solo se repuso `margin-bottom`, así que `.navbar-nav`
  heredaba el `margin-block-start: 1em` por defecto del navegador: los enlaces caían 8px
  por debajo del centro del navbar y la barra medía 16px de más. Al quitar un framework,
  los agujeros no están en lo que escribes mal, sino en las reglas del reset que no
  sabías que te estaban sosteniendo.

## Cómo añadir un proyecto

Hay **una sola tarjeta por proyecto** y el filtrado se hace por `data-categoria`.
Para añadir uno, copia un `<article class="… proyecto-item">` dentro de
`#grid-proyectos` y ajusta:

- `data-categoria` — una de `api`, `fullstack`, `webapp`, `landing` (deben coincidir
  con los `data-filtro` de los botones; si añades una categoría nueva, añade su botón)
- el `id` del carrusel (`scripts.js` lo localiza solo; los botones llevan
  `data-slide="prev"` / `data-slide="next"` y no necesitan apuntar a ningún id)
- las imágenes (WebP, ancho máximo 1140 px, con `width`, `height` y `loading="lazy"`)
- los `<li class="tech-chip">` y el enlace `.enlace-proyecto`

### La tarjeta destacada

FinScope usa una variante: `col-12` + `.proyecto-destacado`, con el carrusel y el texto
repartidos por `.proyecto-destacado-cuerpo`, que es un grid de dos columnas a partir de
992 px y una sola por debajo. Aporta `.proyecto-etiqueta` (el punto con el rótulo),
`.proyecto-resumen` (el párrafo, limitado a `--medida`) y `.proyecto-enlaces`, que
permite varios `.enlace-proyecto` en fila —el primero con `.enlace-demo`, que lo pinta
como botón—. Es el único proyecto con demo pública y con dos repositorios, y por eso es
el único que no encaja en el patrón de «un enlace a GitHub por tarjeta».

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
