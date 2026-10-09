# mathjax-full, bundled

The files here are mathjax-full 3.2.2 (https://github.com/mathjax/MathJax-src), Copyright The MathJax Consortium,
licensed under the Apache License 2.0 (LICENSE here).

They are generated, not edited: `npm run build:vendor` bundles the part of it
texel uses (scripts/mathjax-entry.ts: TeX input, SVG output and the TeX fonts, one module per font file, built from MathJax's TypeScript sources, which convert TeX to an SVG tree) with esbuild into minified ES modules.
texel's own code in scripts/mathjax-entry.ts is MIT like the rest of texel.
