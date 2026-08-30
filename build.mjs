import { access, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const raiz = new URL('./', import.meta.url);
const salida = new URL('./dist/', raiz);

const ENLACE = '<link rel="stylesheet" href="styles.css">';
const RECURSOS = ['scripts.js', 'img', 'fonts', 'robots.txt', 'sitemap.xml'];
const IDIOMAS = ['en'];

const PREFIJOS = [
    ['src="img/', 'src="../img/'],
    ['src="scripts.js"', 'src="../scripts.js"'],
    ['href="img/', 'href="../img/'],
    ['href="fonts/', 'href="../fonts/'],
    ["url('img/", "url('../img/"],
    ['url(fonts/', 'url(../fonts/']
];

const fallos = [];

const aRegex = txt => txt
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\s+/g, '\\s+');

function traducir(html, tabla, idioma) {
    for (const { buscar, poner, minimo = 1 } of tabla.patrones ?? []) {
        const re = new RegExp(buscar, 'g');
        const n = [...html.matchAll(re)].length;
        if (n < minimo) {
            fallos.push(`[${idioma}] patron /${buscar}/ aparece ${n} veces, se esperaban >= ${minimo}`);
            continue;
        }
        html = html.replace(re, poner);
    }

    for (const { es, en, veces = 1 } of tabla.reemplazos) {
        const re = new RegExp(aRegex(es), 'g');
        const n = [...html.matchAll(re)].length;
        if (n !== veces) {
            fallos.push(`[${idioma}] "${es.slice(0, 70)}…" aparece ${n} veces, se esperaban ${veces}`);
            continue;
        }
        html = html.replace(re, () => en);
    }

    return html;
}

function subirNivel(html, idioma) {
    for (const [desde, hasta] of PREFIJOS) {
        html = html.replaceAll(desde, hasta);
    }
    for (const [desde] of PREFIJOS) {
        if (html.includes(desde)) {
            fallos.push(`[${idioma}] queda una ruta sin reescribir: ${desde}`);
        }
    }
    return html;
}

function rutasLocales(html) {
    const encontradas = new Set();
    for (const m of html.matchAll(/(?:src|href)="([^"]*)"/g)) encontradas.add(m[1]);
    for (const m of html.matchAll(/url\(([^)]*)\)/g)) {
        encontradas.add(m[1].trim().replace(/^['"]|['"]$/g, ''));
    }
    return [...encontradas].filter(r => r && !/^(https?:|\/\/|#|mailto:|tel:|data:)/.test(r));
}

async function verificarRutas(html, base, etiqueta) {
    for (const ruta of rutasLocales(html)) {
        const destino = new URL(ruta.split('#')[0].split('?')[0], base);
        if (destino.pathname.endsWith('/')) continue;
        try {
            await access(destino);
        } catch {
            fallos.push(`[${etiqueta}] ruta rota: ${ruta}`);
        }
    }
}

const html = await readFile(new URL('index.html', raiz), 'utf8');
const css = await readFile(new URL('styles.css', raiz), 'utf8');

if (!html.includes(ENLACE)) {
    console.error('index.html no enlaza styles.css con la forma esperada:');
    console.error('  ' + ENLACE);
    process.exit(1);
}

if (html.includes('<style>')) {
    console.error('index.html ya contiene un bloque <style>');
    process.exit(1);
}

const incrustar = doc => doc.replace(ENLACE, () => '<style>\n' + css.trim() + '\n    </style>');

await rm(salida, { recursive: true, force: true });
await mkdir(salida, { recursive: true });

for (const recurso of RECURSOS) {
    await cp(new URL(recurso, raiz), new URL(recurso, salida), { recursive: true });
}

const kb = n => (n / 1024).toFixed(1) + ' kB';
const paginas = [];

const espanol = incrustar(html);
await writeFile(new URL('index.html', salida), espanol);
paginas.push(['es', 'index.html', espanol, salida]);

for (const idioma of IDIOMAS) {
    const tabla = JSON.parse(await readFile(new URL(`i18n/${idioma}.json`, raiz), 'utf8'));
    let doc = traducir(html, tabla, idioma);

    if (doc.includes('href="en/"')) {
        fallos.push(`[${idioma}] el selector de idioma sigue apuntando a en/`);
    }

    doc = subirNivel(incrustar(doc), idioma);
    const carpeta = new URL(`${idioma}/`, salida);
    await mkdir(carpeta, { recursive: true });
    await writeFile(new URL('index.html', carpeta), doc);
    paginas.push([idioma, `${idioma}/index.html`, doc, carpeta, tabla.reemplazos.length]);
}

for (const [idioma, nombre, doc, base, cadenas] of paginas) {
    await verificarRutas(doc, base, idioma);
    const extra = cadenas ? `  ${cadenas} cadenas traducidas` : '';
    console.log(`dist/${nombre.padEnd(16)} ${kb(Buffer.byteLength(doc)).padStart(8)}  [${idioma}]${extra}`);
}

if (fallos.length) {
    console.error('\nBuild abortado:');
    for (const f of fallos) console.error('  - ' + f);
    process.exit(1);
}

console.log('recursos copiados        ' + RECURSOS.join(', '));
