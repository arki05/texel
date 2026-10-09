# fflate, bundled

The files here are fflate 0.8.3 (https://github.com/101arrowz/fflate), Copyright Arjun Barrett,
licensed under the MIT License (LICENSE here).

They are generated, not edited: `npm run build:vendor` bundles the part of it
texel uses (scripts/fflate-entry.ts: zlib compression for PNGs, and its reverse) with esbuild into minified ES modules.
texel's own code in scripts/fflate-entry.ts is MIT like the rest of texel.
