# Portfolio — Sebastián Reyes

Portfolio personal de **Sebastián Reyes**, Backend Software Engineer (Java · Spring WebFlux · Quarkus · Kafka · Azure).

🔗 **https://sebastian-reyes.github.io/portfolio/**

## Stack

Sitio estático, sin build ni dependencias que instalar.

| | |
|---|---|
| Marcado | HTML5 semántico |
| Estilos | CSS3 (custom properties) + Bootstrap 5.3 |
| Scripts | JavaScript (sin framework) |
| Iconos | Font Awesome 6.7 |
| Animación | CSS + `IntersectionObserver` (sin librería) |
| Formulario | [FormSubmit](https://formsubmit.co/) |
| Hosting | GitHub Pages |

## Estructura

```
.
├── index.html          # única página del sitio
├── css/styles.css      # estilos propios y variables de tema
├── js/scripts.js       # tema, filtro de proyectos, barra de progreso, validación
├── img/                # capturas (WebP), iconos y og-image
├── robots.txt
└── sitemap.xml
```

## Desarrollo

No hay proceso de build. Basta con servir la carpeta:

```bash
python -m http.server 8000
# http://localhost:8000
```

Abrir `index.html` directamente también funciona, aunque conviene usar un servidor
para que las rutas relativas y el `localStorage` se comporten igual que en producción.

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
- **Cuidado con los canales de Bootstrap**: `.row` con `g-5` aplica márgenes de
  −24px, mayores que el padding de 12px del `.container`, y desborda en móvil.
  `g-4` encaja exactamente.

## Cómo añadir un proyecto

Los proyectos ya no están duplicados por pestaña: hay **una sola tarjeta por proyecto**
y el filtrado se hace por `data-categoria`. Para añadir uno, copia un `<article
class="... proyecto-item">` dentro de `#grid-proyectos` y ajusta:

- `data-categoria` — una de `api`, `webapp`, `landing` (deben coincidir con los
  `data-filtro` de los botones; si añades una categoría nueva, añade su botón)
- el `id` del carrusel y los `data-bs-target` de sus dos botones (deben coincidir)
- las imágenes (WebP, ancho máximo 1140 px, con `width`, `height` y `loading="lazy"`)
- los `<li class="tech-chip">` y el enlace `.enlace-proyecto`

## Notas de mantenimiento

- **Edad**: se calcula en `js/scripts.js` desde `data-nacimiento="AAAA-MM-DD"` en
  `<span id="age">`, comparando mes y dia.
- **Correo del formulario**: `index.html` aún usa la dirección en claro en el
  `action`. Conviene cambiarla por el alias con hash de FormSubmit para no
  exponerla al scraping.
- **Imágenes**: las capturas se sirven a 1140 px de ancho y los iconos a 256 px.
  Se usa WebP salvo en los archivos donde el PNG original pesa menos (capturas
  planas con paleta de 256 colores), que se mantienen en PNG.
- **Iconos de tecnologías**: los logos en SVG vienen de
  [Devicon](https://devicon.dev/) (MIT); los PNG/WebP originales ya estaban en el
  repo. Las marcas pertenecen a sus dueños y se usan solo para identificar cada
  tecnología. Las 40 tienen logo. Cuatro no existían en ningún CDN de iconos y se
  obtuvieron de su fuente oficial, recortando el símbolo del wordmark: Mockito y
  AsyncAPI (repos oficiales), Checkstyle (repo oficial) y Confluent (Wikimedia
  Commons, dominio público; recortado por `viewBox`, sin pérdida al ser SVG).
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
  escalar el ancho.
- **Tema**: se aplica en un script inline del `<head>` para evitar el destello
  blanco, y respeta `prefers-color-scheme` cuando no hay preferencia guardada.
