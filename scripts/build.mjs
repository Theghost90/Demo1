// Static site build. Zero dependencies: Node >= 18.
//   node scripts/build.mjs                      -> dist/
//   SITE_URL=https://example.com node scripts/build.mjs   -> adds canonical, hreflang, OG image URL, sitemap
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPage } from '../src/template.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const siteUrl = (process.env.SITE_URL || '').replace(/\/+$/, '');
const year = new Date().getFullYear();

const hash = (data, enc = 'hex', len = 8) =>
  createHash('sha1').update(data).digest(enc).slice(0, len);

// ---- content -------------------------------------------------------------

const readJson = async (file) => JSON.parse(await readFile(join(root, 'content', file), 'utf8'));

// Every key path and array length, so en/fr drift fails the build instead of shipping.
function shape(value, path = '') {
  if (Array.isArray(value)) {
    return [`${path}[${value.length}]`, ...value.flatMap((v, i) => shape(v, `${path}[${i}]`))];
  }
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .flatMap((k) => shape(value[k], path ? `${path}.${k}` : k));
  }
  return [path];
}

function assertSameShape(a, b, labelA, labelB) {
  const sa = new Set(shape(a));
  const sb = new Set(shape(b));
  const onlyA = [...sa].filter((x) => !sb.has(x));
  const onlyB = [...sb].filter((x) => !sa.has(x));
  if (onlyA.length || onlyB.length) {
    const lines = [
      ...onlyA.map((x) => `  only in ${labelA}: ${x}`),
      ...onlyB.map((x) => `  only in ${labelB}: ${x}`),
    ];
    throw new Error(`Content mismatch between ${labelA} and ${labelB}:\n${lines.join('\n')}`);
  }
}

// French typography: no-break space before : and thin no-break space before ; ? !
const NBSP = ' ';
const NNBSP = ' ';
const SKIP_KEYS = new Set(['email', 'mailSubject', 'mailBody']);
function frenchTypography(value, key = '') {
  if (SKIP_KEYS.has(key)) return value;
  if (typeof value === 'string') {
    return value
      .replace(/\s+([;!?])/g, `${NNBSP}$1`)
      .replace(/\s+:/g, `${NBSP}:`)
      .replace(/«\s+/g, `«${NBSP}`)
      .replace(/\s+»/g, `${NBSP}»`);
  }
  if (Array.isArray(value)) return value.map((v) => frenchTypography(v, key));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, frenchTypography(v, k)]));
  }
  return value;
}

// ---- build ---------------------------------------------------------------

const en = await readJson('en.json');
const fr = await readJson('fr.json');
assertSameShape(en, fr, 'en.json', 'fr.json');
const pages = [
  { content: en, out: 'index.html', prefix: '', altHref: 'fr/' },
  { content: frenchTypography(fr), out: 'fr/index.html', prefix: '../', altHref: '../' },
];

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, 'assets'), { recursive: true });

// Fingerprinted assets (cache-busting without a bundler).
const css = await readFile(join(root, 'src', 'styles.css'));
const js = await readFile(join(root, 'src', 'main.js'));
const assets = { css: `styles.${hash(css)}.css`, js: `main.${hash(js)}.js` };
await writeFile(join(dist, 'assets', assets.css), css);
await writeFile(join(dist, 'assets', assets.js), js);

// Inline boot script (adds .js class before first paint); allowed by CSP via its hash.
const bootJs = "document.documentElement.classList.add('js');";
const bootHash = createHash('sha256').update(bootJs).digest('base64');

await cp(join(root, 'public'), dist, { recursive: true });

for (const page of pages) {
  const alt = page.content === en ? fr : en;
  const html = renderPage(page.content, {
    siteUrl,
    year,
    assets,
    bootJs,
    bootHash,
    prefix: page.prefix,
    altHref: page.altHref,
    alt: { ogLocale: alt.ogLocale },
  });
  const target = join(dist, page.out);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html);
}

// Bilingual 404 (served by serve.mjs; most static hosts pick up /404.html too).
await writeFile(
  join(dist, '404.html'),
  `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Page not found | Page introuvable</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/${assets.css}">
</head>
<body class="notfound">
  <main class="notfound__box">
    <p class="eyebrow">404</p>
    <h1>Page not found.</h1>
    <p>Page introuvable.</p>
    <p><a class="btn btn--primary" href="/">English</a> <a class="btn btn--ghost" href="/fr/">Français</a></p>
  </main>
</body>
</html>
`,
);

if (siteUrl) {
  await writeFile(
    join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${['/', '/fr/']
  .map(
    (loc) => `  <url>
    <loc>${siteUrl}${loc}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/"/>
    <xhtml:link rel="alternate" hreflang="fr" href="${siteUrl}/fr/"/>
  </url>`,
  )
  .join('\n')}
</urlset>
`,
  );
  await writeFile(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
}

console.log(`Built ${pages.length} pages -> dist/ (${assets.css}, ${assets.js})${siteUrl ? ` for ${siteUrl}` : ''}`);
