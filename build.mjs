import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const raiz = new URL('./', import.meta.url);
const salida = new URL('./dist/', raiz);

const ENLACE = '<link rel="stylesheet" href="styles.css">';
const RECURSOS = ['scripts.js', 'img', 'fonts', 'robots.txt', 'sitemap.xml'];

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

const incrustado = html.replace(ENLACE, '<style>\n' + css.trim() + '\n    </style>');

await rm(salida, { recursive: true, force: true });
await mkdir(salida, { recursive: true });
await writeFile(new URL('index.html', salida), incrustado);

for (const recurso of RECURSOS) {
    await cp(new URL(recurso, raiz), new URL(recurso, salida), { recursive: true });
}

const kb = n => (n / 1024).toFixed(1) + ' kB';
console.log('dist/index.html  ' + kb(Buffer.byteLength(incrustado)) + ' (CSS incrustado: ' + kb(Buffer.byteLength(css)) + ')');
console.log('copiado          ' + RECURSOS.join(', '));
