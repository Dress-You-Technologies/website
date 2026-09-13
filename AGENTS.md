# AGENTS.md

Static coming-soon page for dressyou (https://dressyouapp.com). No build step, no
dependencies, no backend. `dist/` is served verbatim — what is in it is what ships.

## Commands

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist   # serve
node --test tests/*.test.mjs                                    # test
node --check dist/app.mjs                                       # syntax
```

## Layout

- `dist/index.html` — markup and all SEO metadata (canonical, Open Graph, JSON-LD).
- `dist/sequence.mjs` — the timeline: phase boundaries, tagline rhythm. Pure, unit-tested.
- `dist/app.mjs` — DOM wiring and the rAF loop. Imports `sequence.mjs`.
- `dist/style.css` — layout, the stamp entrance, and the phase-driven visibility rules.
- `tests/` — Node's built-in runner against a hand-rolled DOM stub. No framework.

Phases (`loading → spawn → shift → write → tagline → rest`) are driven by
`data-phase` on `.experience`; CSS reacts to that attribute. Change timing in
`sequence.mjs`, never by hardcoding durations in CSS — `app.mjs` pushes
`--spawn-duration` and `--shift-duration` into custom properties so the two stay
in sync.

## Conventions

- No dependencies and no build step. Both are deliberate; do not add either.
- Do not minify. Vercel serves Brotli, and the sources are a few kilobytes.
- CSS and JS stay unbundled ES modules served as-is.
- Respect `prefers-reduced-motion`: it must skip straight to the final identity.

## Assets

- Photographs in `dist/images/` are approved brand art with intentional film grain.
  Do not re-encode, resize, or crop them without being asked.
- The logo mark is white on transparency. Anything that may sit on a light
  background (favicons, touch icons) needs the black plate baked in, or it
  disappears. Regenerate icons from the mark; do not hand-edit them.
- `Manrope.woff2` is a variable subset (wght 200–800, Latin-1 + common punctuation).
  Adding copy outside that range means re-subsetting. Keep `Manrope-OFL.txt` beside
  it — the license requires it.

## Metadata

`index.html` metadata, `sitemap.xml`, `llms.txt` and the JSON-LD all repeat the
canonical URL, the name, and the tagline. If one changes, change all of them.
