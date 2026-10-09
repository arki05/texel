# MathJax, bundled

The files here are MathJax 3.2.2 (https://github.com/mathjax/MathJax-src,
npm `mathjax-full`), Copyright The MathJax Consortium, licensed under the
Apache License 2.0 (LICENSE here).

They are generated, not edited: `npm run build:mathjax` bundles the part of
MathJax texel uses (scripts/mathjax-entry.ts: TeX input, SVG output, the TeX
fonts) with esbuild into minified ES modules, one per font file. texel's own
code in scripts/mathjax-entry.ts, which converts TeX to an SVG tree, is MIT
like the rest of texel.
