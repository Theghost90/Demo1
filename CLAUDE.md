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

## 4. Deliverables copy names no tools, frameworks or matrices (owner instruction)

In the Deliverables section, describe what the client receives in plain language. Do not name the tools, frameworks or
matrices used to produce it (for example no RACI, Gantt, Kanban, MoSCoW or WSJF). There is no "charts and matrices" row.
Open question for the owner: whether the same rule applies to the Process section (it lists "RACI", "Roadmap", "Solution
Framework", "Sprint facilitation") and to the Agile / Scrum wording in the Product Ownership domain and the process note.
Do not change those until he decides.

## 5. Design direction (owner request)

Sophisticated and editorial, in the spirit of a high-end creative agency, not a corporate template. Asymmetric layouts,
flat colour only (no gradients), hand-crafted details. Keep it light and legible: no photographs, no heavy animation,
readable on a phone over mobile data, WCAG AA contrast, content never hidden without JavaScript.
The hand-drawn details are SVG masks defined as `--shape-*` variables at the top of `src/styles.css`.
