# Standing rules for this repository

## 1. AI stays internal (owner instruction, permanent)

The owner, Joseph Franck Onambele-Bekono, uses AI tools in his practice. **None of that may reach clients through any
channel.** Nothing about AI appears in the portfolio site:

- no "AI-assisted / human-validated" statement, no AI policy, no mention of the owner's use of AI tools;
- no AI wording at all in `content/en.json`, `content/fr.json`, page markup, `<meta>` tags, JSON-LD, alt text, link-preview
  images (`public/og*.png`) or anything else served from `dist/`;
- this includes naming AI as a service: the domain is listed as "Digital Transformation", not "...& AI Integration".

`scripts/build.mjs` enforces this: the build fails if AI wording appears in any content string or in the rendered HTML.
Do not weaken or bypass that check, and do not reintroduce AI content "just for the French version" or "just in the
description". Apply the same rule to anything else written for the owner's clients (emails, proposals, copy).
Only the owner can lift this rule, in his own words.

## 2. No invented proof

No clients, figures, results, testimonials or credentials that are not supplied by the owner. Case studies go in the
optional `engagements` block (see README) and only with the client's written consent.

## 3. Language

English is the default; French is the second language. Keep `content/en.json` and `content/fr.json` structurally
identical (the build enforces it). Use American spelling, matching the source document.
