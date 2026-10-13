// Renders one language version of the site from its content object.
// Pure function: (content, ctx) -> HTML string. No I/O.

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Escapes, then turns *word* into <em>word</em> (italic accent in headlines).
const rich = (s) => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');

const pad = (i) => String(i).padStart(2, '0');
const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];
const roman = (i) => ROMAN[i] ?? String(i + 1);

// "A · B · C" -> stacked lines (avoids a dangling separator when the value wraps).
const lines = (v) =>
  String(v)
    .split(' · ')
    .map((x) => `<span class="line">${esc(x)}</span>`)
    .join('');

const arrowIcon = `<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
const copyIcon = `<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>`;

function head(c, ctx) {
  const { siteUrl, prefix, assets, bootHash, alt } = ctx;
  const abs = (path) => `${siteUrl}${path}`;
  const self = c.lang === 'en' ? '/' : '/fr/';
  const hreflangs = siteUrl
    ? `
  <link rel="canonical" href="${esc(abs(self))}">
  <link rel="alternate" hreflang="en" href="${esc(abs('/'))}">
  <link rel="alternate" hreflang="fr" href="${esc(abs('/fr/'))}">
  <link rel="alternate" hreflang="x-default" href="${esc(abs('/'))}">`
    : '';
  const og = `
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(c.meta.siteName)}">
  <meta property="og:title" content="${esc(c.meta.title)}">
  <meta property="og:description" content="${esc(c.meta.description)}">
  <meta property="og:locale" content="${esc(c.ogLocale)}">
  <meta property="og:locale:alternate" content="${esc(alt.ogLocale)}">${
    siteUrl
      ? `
  <meta property="og:url" content="${esc(abs(self))}">
  <meta property="og:image" content="${esc(abs('/' + c.meta.ogImage))}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(c.person.name)}, ${esc(c.person.role)}">
  <meta name="twitter:card" content="summary_large_image">`
      : ''
  }`;

  const domains = c.expertise.pillars.flatMap((p) => p.items.map((i) => i.title));
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: c.person.name,
    jobTitle: c.person.role,
    email: c.person.email,
    description: c.meta.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: c.person.city,
      addressCountry: c.person.countryCode,
    },
    knowsLanguage: ['en', 'fr'],
    knowsAbout: domains,
  }).replace(/</g, '\\u003c');

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'sha256-${bootHash}'`,
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  return `<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <title>${esc(c.meta.title)}</title>
  <meta name="description" content="${esc(c.meta.description)}">
  <meta name="author" content="${esc(c.person.name)}">
  <meta name="theme-color" content="#EFE8DA">
  <meta name="color-scheme" content="light">${hreflangs}${og}
  <link rel="icon" href="${prefix}favicon.svg" type="image/svg+xml">
  <link rel="preload" href="${prefix}fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${prefix}fonts/CormorantGaramond-Medium.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${prefix}assets/${assets.css}">
  <script>${ctx.bootJs}</script>
  <script type="application/ld+json">${jsonLd}</script>
</head>`;
}

function header(c, ctx) {
  const { ui, nav, person } = c;
  const links = [
    ...nav.items.map((i) => `<li><a href="#${esc(i.id)}">${esc(i.label)}</a></li>`),
    // Desktop shows the CTA button instead; this keeps Contact reachable in the mobile menu.
    `<li class="nav__link-contact"><a href="#${esc(nav.cta.id)}">${esc(nav.cta.label)}</a></li>`,
  ].join('\n          ');
  return `<header class="site-header" id="site-header">
    <div class="container nav">
      <a class="brand" href="#top">
        <span class="brand__mark" aria-hidden="true">${esc(person.initials)}</span>
        <span class="brand__name">${esc(person.name)}</span>
        <span class="brand__short">${esc(person.brandShort)}</span>
      </a>
      <nav class="nav__links" id="site-nav" aria-label="${esc(ui.mainNav)}">
        <ul>
          ${links}
        </ul>
      </nav>
      <div class="nav__actions">
        <div class="lang" role="group" aria-label="${esc(ui.langSwitchLabel)}">
          <span class="lang__item is-current" aria-current="true">${esc(ui.thisLang.short)}</span>
          <a class="lang__item" href="${esc(ctx.altHref)}" hreflang="${esc(ui.otherLang.code)}" lang="${esc(ui.otherLang.code)}" aria-label="${esc(ui.otherLang.aria)}">${esc(ui.otherLang.short)}</a>
        </div>
        <a class="btn btn--ink btn--sm nav__cta" href="#${esc(nav.cta.id)}">${esc(nav.cta.label)}</a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
          <span class="nav-toggle__bars" aria-hidden="true"></span>
          <span class="nav-toggle__label">${esc(ui.menu)}</span>
        </button>
      </div>
    </div>
  </header>`;
}

// Circular text stamp. Decorative: the same words are already in the eyebrow.
function stamp(c) {
  const ring = `${c.hero.eyebrow} · `.toLocaleUpperCase(c.lang);
  return `<svg class="stamp" viewBox="0 0 160 160" aria-hidden="true" focusable="false">
          <defs><path id="stamp-ring" d="M80,80 m-58,0 a58,58 0 1,1 116,0 a58,58 0 1,1 -116,0"/></defs>
          <circle class="stamp__edge" cx="80" cy="80" r="75"/>
          <g class="stamp__spin"><text class="stamp__text"><textPath href="#stamp-ring" textLength="356" lengthAdjust="spacing">${esc(ring)}</textPath></text></g>
          <text class="stamp__mono" x="80" y="93" text-anchor="middle">${esc(c.person.initials)}</text>
        </svg>`;
}

function hero(c) {
  const h = c.hero;
  const title = h.headline
    .split('|')
    .map((l, i) => `<span class="hl hl${i + 1}">${rich(l)}</span>`)
    .join(' ');
  const glance = h.glance.items
    .map((i) => `<div class="glance__row"><dt>${esc(i.label)}</dt><dd>${lines(i.value)}</dd></div>`)
    .join('\n            ');
  const method = h.method
    .map((m, i) => `<li><span class="method__n" aria-hidden="true">${pad(i + 1)}</span>${esc(m)}</li>`)
    .join('\n            ');
  return `<section class="hero" id="top">
      <div class="container hero__wrap">
        <p class="eyebrow hero__eyebrow">${esc(h.eyebrow)}</p>
        <h1 class="hero__title">${title}</h1>
        ${stamp(c)}
        <div class="hero__copy">
          <p class="lede">${esc(h.lede)}</p>
          <div class="hero__actions">
            <a class="btn btn--vermilion" href="#${esc(h.ctaPrimary.id)}">${esc(h.ctaPrimary.label)} ${arrowIcon}</a>
            <a class="btn btn--line" href="#${esc(h.ctaSecondary.id)}">${esc(h.ctaSecondary.label)}</a>
          </div>
        </div>
        <aside class="glance" aria-labelledby="glance-title">
          <h2 class="glance__title" id="glance-title">${esc(h.glance.title)}</h2>
          <dl class="glance__list">
            ${glance}
          </dl>
        </aside>
        <div class="method">
          <p class="method__label" id="method-label">${esc(h.methodLabel)}</p>
          <ol class="method__list" aria-labelledby="method-label">
            ${method}
          </ol>
        </div>
      </div>
    </section>`;
}

function brief(c) {
  const items = c.brief.items
    .map(
      (i) => `<li class="brief__item">
              <h3>${esc(i.title)}</h3>
              <p>${esc(i.text)}</p>
            </li>`,
    )
    .join('\n            ');
  return `<section class="brief" aria-label="${esc(c.brief.label)}">
      <div class="container brief__wrap">
        <p class="brief__label">${esc(c.brief.label)}</p>
        <ul class="brief__list">
            ${items}
        </ul>
      </div>
    </section>`;
}

function sectionHead(s, id, ctx) {
  const m = ctx.marks[id];
  return `<header class="shead" data-reveal>
          <p class="shead__mark" aria-hidden="true"><span>${pad(m.n)}</span><i></i><span>${pad(m.total)}</span></p>
          <div class="shead__body">
            <p class="eyebrow">${esc(s.eyebrow)}</p>
            <h2 id="${id}-title">${rich(s.title)}</h2>
            ${s.intro ? `<p class="shead__intro">${esc(s.intro)}</p>` : ''}
          </div>
        </header>`;
}

function expertise(c, ctx) {
  const e = c.expertise;
  const pillars = e.pillars
    .map(
      (p, i) => `<article class="pillar" data-reveal>
            <div class="pillar__head">
              <p class="pillar__num">${pad(i + 1)}</p>
              <h3 class="pillar__name">${esc(p.name)}</h3>
              <p class="pillar__tag">${esc(p.tagline)}</p>
            </div>
            <ul class="domains">
              ${p.items
                .map(
                  (d) => `<li>
                <h4>${esc(d.title)}</h4>
                <p>${esc(d.text)}</p>
              </li>`,
                )
                .join('\n              ')}
            </ul>
          </article>`,
    )
    .join('\n          ');
  return `<section class="section" id="expertise" aria-labelledby="expertise-title">
      <div class="container">
        ${sectionHead(e, 'expertise', ctx)}
        <div class="pillars">
          ${pillars}
        </div>
      </div>
    </section>`;
}

function industries(c, ctx) {
  const s = c.industries;
  return `<section class="section section--sand cut" id="industries" aria-labelledby="industries-title">
      <div class="container">
        ${sectionHead(s, 'industries', ctx)}
        <ul class="runin" data-reveal>
          ${s.items.map((i) => `<li>${esc(i)}</li>`).join('\n          ')}
        </ul>
      </div>
    </section>`;
}

function statement(c) {
  const s = c.statement;
  return `<section class="section section--verm cut statement" aria-label="${esc(s.eyebrow)}">
      <div class="container">
        <figure class="statement__fig" data-reveal>
          <span class="statement__mark" aria-hidden="true">&ldquo;</span>
          <p class="eyebrow">${esc(s.eyebrow)}</p>
          <blockquote class="statement__quote"><p>${esc(s.quote)}</p></blockquote>
          <figcaption class="statement__by">${esc(s.attribution)}</figcaption>
        </figure>
      </div>
    </section>`;
}

function approach(c, ctx) {
  const a = c.approach;
  const items = a.principles
    .map(
      (p, i) => `<li class="principle" data-reveal>
            <span class="principle__no" aria-hidden="true">${roman(i)}</span>
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.text)}</p>
          </li>`,
    )
    .join('\n          ');
  return `<section class="section" id="approach" aria-labelledby="approach-title">
      <div class="container">
        ${sectionHead(a, 'approach', ctx)}
        <ol class="principles">
          ${items}
        </ol>
      </div>
    </section>`;
}

function process(c, ctx) {
  const p = c.process;
  const phases = p.phases
    .map(
      (ph, i) => `<li class="phase" data-reveal>
            <span class="phase__n" aria-hidden="true">${roman(i)}</span>
            <div class="phase__body">
              <h3>${esc(ph.title)}</h3>
              <p class="phase__label">${esc(p.activitiesLabel)}</p>
              <ul class="phase__acts">
                ${ph.activities.map((a) => `<li>${esc(a)}</li>`).join('\n                ')}
              </ul>
            </div>
            <div class="phase__out">
              <p class="phase__label">${esc(p.outputLabel)}</p>
              <ul>
                ${ph.outputs.map((o) => `<li>${esc(o)}</li>`).join('\n                ')}
              </ul>
            </div>
          </li>`,
    )
    .join('\n          ');
  return `<section class="section section--forest cut" id="process" aria-labelledby="process-title">
      <div class="container">
        ${sectionHead(p, 'process', ctx)}
        <div class="phases-head" aria-hidden="true">
          <span></span><span>${esc(p.activitiesLabel)}</span><span>${esc(p.outputLabel)}</span>
        </div>
        <ol class="phases">
          ${phases}
        </ol>
        <div class="callout" data-reveal>
          <h3>${esc(p.agile.title)}</h3>
          <p>${esc(p.agile.text)}</p>
        </div>
      </div>
    </section>`;
}

function engagements(c, ctx) {
  const e = c.engagements;
  if (!e || !e.items || !e.items.length) return '';
  const cards = e.items
    .map(
      (i) => `<article class="case" data-reveal>
            <p class="case__sector">${esc(i.sector)}</p>
            <h3>${esc(i.title)}</h3>
            <dl>
              <div><dt>${esc(e.labels.challenge)}</dt><dd>${esc(i.challenge)}</dd></div>
              <div><dt>${esc(e.labels.approach)}</dt><dd>${esc(i.approach)}</dd></div>
              <div><dt>${esc(e.labels.outcome)}</dt><dd>${esc(i.outcome)}</dd></div>
            </dl>
          </article>`,
    )
    .join('\n          ');
  return `<section class="section" id="engagements" aria-labelledby="engagements-title">
      <div class="container">
        ${sectionHead(e, 'engagements', ctx)}
        <div class="cases">
          ${cards}
        </div>
      </div>
    </section>`;
}

function clients(c, ctx) {
  const s = c.clients;
  const rows = s.rows
    .map((r) => `<div class="facts__row"><dt>${esc(r.label)}</dt><dd>${lines(r.value)}</dd></div>`)
    .join('\n            ');
  const steps = s.maturity.steps.map((m) => `<li><span>${esc(m)}</span></li>`).join('\n              ');
  return `<section class="section section--sand cut" id="clients" aria-labelledby="clients-title">
      <div class="container">
        ${sectionHead(s, 'clients', ctx)}
        <dl class="facts" data-reveal>
            ${rows}
        </dl>
        <div class="maturity" data-reveal>
          <p class="maturity__label">${esc(s.maturity.label)}</p>
          <div class="maturity__plot">
            <svg class="maturity__curve" viewBox="0 0 1000 260" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <path d="M 30 208 C 120 206, 215 170, 320 156 S 520 118, 620 99 S 860 52, 960 26"/>
            </svg>
            <ol class="maturity__steps">
              ${steps}
            </ol>
          </div>
        </div>
      </div>
    </section>`;
}

function deliverables(c, ctx) {
  const d = c.deliverables;
  const items = d.items
    .map(
      (i, n) => `<li class="deliv__item">
              <span class="deliv__k" aria-hidden="true">${String.fromCharCode(97 + n)}</span>
              <h3>${esc(i.title)}</h3>
              <p>${esc(i.text)}</p>
            </li>`,
    )
    .join('\n            ');
  const standards = d.standards.map((s) => `<li>${esc(s)}</li>`).join('\n              ');
  return `<section class="section deliverables" id="deliverables" aria-labelledby="deliverables-title">
      <div class="container">
        ${sectionHead(d, 'deliverables', ctx)}
        <div class="deliv__grid">
          <ul class="deliv" data-reveal>
            ${items}
          </ul>
          <div class="standards" data-reveal>
            <h3>${esc(d.standardsTitle)}</h3>
            <ol>
              ${standards}
            </ol>
          </div>
        </div>
      </div>
    </section>`;
}

function terms(c, ctx) {
  const t = c.terms;
  return `<section class="section section--sand cut terms" id="terms" aria-labelledby="terms-title">
      <div class="container">
        ${sectionHead(t, 'terms', ctx)}
        <ul class="checks" data-reveal>
          ${t.engagement.map((x) => `<li>${esc(x)}</li>`).join('\n          ')}
        </ul>
      </div>
    </section>`;
}

function contact(c, ctx) {
  const k = c.contact;
  const m = ctx.marks.contact;
  const body = k.mailBody.replace(/\n/g, '\r\n');
  const href = `mailto:${c.person.email}?subject=${encodeURIComponent(k.mailSubject)}&body=${encodeURIComponent(body)}`;
  const details = k.details
    .map((d) => `<div><dt>${esc(d.label)}</dt><dd>${esc(d.value)}</dd></div>`)
    .join('\n            ');
  return `<section class="section section--forest cut contact" id="contact" aria-labelledby="contact-title">
      <div class="container contact__wrap">
        <p class="shead__mark" aria-hidden="true"><span>${pad(m.n)}</span><i></i><span>${pad(m.total)}</span></p>
        <div class="contact__head" data-reveal>
          <p class="eyebrow">${esc(k.eyebrow)}</p>
          <h2 id="contact-title">${rich(k.title)}</h2>
        </div>
        <p class="contact__email" data-reveal><a href="mailto:${esc(c.person.email)}" id="contact-email">${esc(c.person.email)}</a></p>
        <div class="contact__text" data-reveal>
          <p class="shead__intro">${esc(k.text)}</p>
          <div class="contact__actions">
            <a class="btn btn--ochre" href="${esc(href)}">${esc(k.mailCta)} ${arrowIcon}</a>
            <button class="btn btn--line-light" type="button" id="copy-email" data-email="${esc(c.person.email)}" data-copied="${esc(c.ui.copied)}" data-failed="${esc(c.ui.copyFailed)}">${copyIcon}<span>${esc(c.ui.copy)}</span></button>
          </div>
          <p class="sr-only" role="status" aria-live="polite" id="copy-status"></p>
        </div>
        <dl class="contact__details" data-reveal>
            ${details}
        </dl>
      </div>
    </section>`;
}

function footer(c, ctx) {
  return `<footer class="site-footer">
    <div class="container footer__row">
      <p>&copy; ${ctx.year} ${esc(c.person.name)}. ${esc(c.footer.rights)}</p>
      <p>${esc(c.footer.line)}</p>
      <a class="footer__top" href="#top">${esc(c.ui.backToTop)} <span aria-hidden="true">&uarr;</span></a>
    </div>
  </footer>`;
}

export function renderPage(c, ctx) {
  // Section numbering ("02 / 08") follows whichever sections are actually present.
  const order = [
    'expertise',
    'industries',
    'approach',
    'process',
    ...(c.engagements && c.engagements.items && c.engagements.items.length ? ['engagements'] : []),
    'clients',
    'deliverables',
    'terms',
    'contact',
  ];
  const marks = Object.fromEntries(order.map((k, i) => [k, { n: i + 1, total: order.length }]));
  const x = { ...ctx, marks };

  return `<!doctype html>
<html lang="${esc(c.lang)}">
${head(c, ctx)}
<body>
  <a class="skip-link" href="#main">${esc(c.ui.skip)}</a>
  ${header(c, ctx)}
  <main id="main">
    ${hero(c)}
    ${brief(c)}
    ${expertise(c, x)}
    ${industries(c, x)}
    ${statement(c)}
    ${approach(c, x)}
    ${process(c, x)}
    ${engagements(c, x)}
    ${clients(c, x)}
    ${deliverables(c, x)}
    ${terms(c, x)}
    ${contact(c, x)}
  </main>
  ${footer(c, ctx)}
  <script src="${ctx.prefix}assets/${ctx.assets.js}" defer></script>
</body>
</html>
`;
}
