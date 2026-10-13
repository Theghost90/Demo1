# Joseph Franck Onambele-Bekono — portfolio site

Bilingual (English / French) portfolio for an independent business consultant based in Douala, Cameroon.
Static HTML, no framework, **zero npm dependencies** (Node 18+).

## Run it

```bash
npm start          # builds, then serves on http://localhost:3111
```

| URL | Language |
| --- | --- |
| http://localhost:3111/ | English |
| http://localhost:3111/fr/ | Français |

Other scripts: `npm run build` (writes `dist/`), `npm run serve` (serves an existing `dist/`).
Environment: `PORT` (default `3111`), `HOST` (default `0.0.0.0`).

## Edit the content

All copy lives in two files. Nothing is hard-coded in the template.

- `content/en.json`
- `content/fr.json`

The build **fails** if the two files differ in structure (a missing key, a different number of list items), so the
languages cannot drift apart silently. French typographic spacing (before `: ; ? !`) is applied automatically at build time.

Source of every statement: the *Global Consulting Operating Instructions* document. The one-line descriptions under
each expertise domain, the section titles and the French translation are drafted wording and need your review before
the site goes public.

### Adding case studies later

The site deliberately shows no client work, because the source document says client information is confidential and
published only with written consent, and no verified engagements were supplied. When you have approved case studies,
add an `engagements` block to **both** JSON files and a "Selected engagements" section appears automatically:

```json
"engagements": {
  "eyebrow": "Selected engagements",
  "title": "Work I can talk about.",
  "intro": "Published with the client's written consent or fully anonymized.",
  "labels": { "challenge": "Challenge", "approach": "Approach", "outcome": "Outcome" },
  "items": [
    { "sector": "Fintech", "title": "…", "challenge": "…", "approach": "…", "outcome": "…" }
  ]
}
```

Only put figures in `outcome` that you can substantiate.

## Deploy

The output in `dist/` is plain static files with relative paths, so it works on any static host and under a sub-path.

```bash
SITE_URL=https://your-domain.com npm run build
```

Setting `SITE_URL` adds the canonical and `hreflang` links, absolute Open Graph image URLs (needed for WhatsApp and
LinkedIn link previews), `sitemap.xml` and `robots.txt`. Without it those tags are omitted rather than guessed.

## Things to know

- **Contact is `mailto:` only.** A static site cannot send email. If you want an on-page form, it needs a form service
  or a small backend.
- **Content-Security-Policy** is set via a `<meta>` tag (`script-src 'self'` plus one hashed inline snippet). If you
  add analytics or any third-party script or font, extend the policy in `src/template.mjs` or it will be blocked.
- **No tracking, no external requests.** Fonts are self-hosted subsets (63 KB for all four files).
- **Accessibility:** semantic landmarks, skip link, keyboard-operable menu, visible focus, `prefers-reduced-motion`
  respected, readable with JavaScript disabled. Palette contrast is WCAG AA or better (see the top of `src/styles.css`).
- **French uses the masculine job title** ("Consultant indépendant"). Change `person.role`, `hero.eyebrow` and
  `footer.line` in `content/fr.json` if you prefer the feminine form.
- The two link-preview images (`public/og.png`, `public/og-fr.png`) are static 1200×630 files; replace them freely.

## Structure

```
content/      en.json, fr.json      all copy
src/          template.mjs          page markup (pure function: content -> HTML)
              styles.css, main.js   design + progressive enhancement
scripts/      build.mjs, serve.mjs  static build and preview server
public/       fonts, favicon, OG images (copied as-is)
```

## Licenses

Fonts: Cormorant Garamond and Inter, SIL Open Font License 1.1 (`public/fonts/OFL.txt`).
