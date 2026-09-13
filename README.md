# DressYou — Coming soon

Standalone static site. Six approved Parisian motion photographs repeat as hard cuts for three seconds while “coming soon” fills white from left to right. The photographs fade behind a small logo as it eases into the center, shifts left, and types the lowercase dressyou wordmark. The tagline shares the wordmark’s center, with the symbol hanging to the left, and types in about 1.6 seconds at a constant pace before the replay control appears. Reduced-motion preferences skip to the final identity.

Run `python3 -m http.server 4173 --bind 127.0.0.1 --directory dist`.

Check `node --test tests/*.test.mjs` and `node --check dist/app.mjs`.

Timing lives in `dist/sequence.mjs`; layout and the stamp entrance live in `dist/style.css`. No dependencies or build step. Manrope is self-hosted under its bundled OFL license. Approved photographs have wide and tall background extensions, plus their original composition for intermediate screen shapes, to keep the full figures visible. The white logo is a transparent WebP. Because the mark is white, every favicon carries a black plate so it stays visible in light-theme tabs and in search results; `icon-*.png`, `favicon.ico`, `apple-touch-icon.png` and `og-image.jpg` are generated from that mark. Crawler files live beside the page: `robots.txt`, `sitemap.xml`, `site.webmanifest` and `llms.txt`.
