# texel

Typeset math in Claude Code's terminal. texel is a Claude Code plugin that
redraws Claude's replies, and your own prompts, with LaTeX math and typst
blocks rendered as images, inline with the text around them.

<!-- A screenshot or short recording goes here. -->

- **LaTeX, with nothing to install.** `\( … \)`, `\[ … \]`, `$ … $`,
  `$$ … $$` and `latex`/`math` code fences are typeset by MathJax, which runs
  inside the plugin.
- **Inline math sits in the line.** Formulas sit on the text's baseline at a
  readable size; a tall one (a fraction, a matrix) gives its line the extra
  rows it needs, as LaTeX does, and the paragraph re-wraps around it.
- **typst blocks**, if typst is installed: a ```` ```typst ```` fence is set by
  typst, as a figure (cetz diagrams, tables) or as prose laid out at the
  terminal's width.
- **Claude knows.** A short note in the system prompt tells Claude this
  terminal typesets LaTeX, and typst blocks where typst can draw them.

## Requirements

- **Claude Code** with plugin hooks (mods). They are early access, so texel
  may need updating as Claude Code changes.
- **A terminal that shows Claude Code's images**: kitty, Ghostty, or cmux
  (Ghostty-based). Not through tmux. Elsewhere texel steps aside and Claude
  Code's own rendering stays.
- **Optional: typst 0.15 or newer**, for ```` ```typst ```` blocks
  (`brew install typst`). Without it, LaTeX still renders; a typst block shows
  its source and says what it needs.

## Install

In Claude Code:

```
/plugin install texel --marketplace arki05/texel
```

Answer `y` to add the marketplace, then choose a scope. texel is active at once.

## Use

Ask Claude for anything with math in it; it writes LaTeX, and texel draws it.
Your own prompts are rendered too.

| Command | What it does |
|---|---|
| `/texel` | What texel draws with here: pictures on or off, typst found or not. |
| `/texel source` | Shows every message as its source, for reading or copying, until you run it again. Selecting a rendered formula copies placeholder characters, not its LaTeX. |

**Your own macros.** `~/.config/texel/macros.tex` is read before every
formula, so `\newcommand`s there work everywhere; Claude never sees the file.

```latex
\newcommand{\norm}[1]{\left\lVert #1 \right\rVert}
\newcommand{\inner}[2]{\left\langle #1, #2 \right\rangle}
```

## Settings

All in `/config`, under texel.

| Setting | Default | |
|---|---|---|
| `promptNote` | on | Tell Claude this terminal typesets math. |
| `mathColor` | `#b3bd5a` | Colour of LaTeX math; empty follows the text colour. |
| `typstColor` | empty | Colour of typst blocks' text; empty follows the text colour. |
| `typstPackages` | on | Let typst blocks import packages (typst downloads them). Off: such a block shows its source. |
| `inlineSize` | 1.2 | Inline math's size against the text's x-height. |
| `inlineMinScale` | 0.75 | How far a formula may shrink before its line gains a row. |
| `inlineMaxScale` | 1 | How far a formula smaller than its row may grow to fill it. |
| `inlineShiftUp`, `inlineShiftDown` | 0.5 | How far (in rows) a formula may sit off the baseline to save a row. |
| `terminalFont` | JetBrains Mono | Your terminal's font, so math matches its proportions: JetBrains Mono (Ghostty's default), Menlo / DejaVu Sans Mono (kitty's), SF Mono, Monaco, or Custom with `fontAspect`, `fontXHeight` and `fontBaseline`. |
| `images` | auto | Draw pictures: `auto` (in kitty and Ghostty, not tmux), `always`, `never`. |

## How it works

texel hooks Claude Code's rendering of transcript rows. A reply's markdown is
split into prose, inline math, display math and typst blocks.

- **LaTeX** goes to MathJax, bundled into the plugin, whose SVG texel fills
  into pixels itself: a plugin has no canvas and no WebAssembly, so a small
  rasteriser (exact area coverage, the technique of font-rs and tiny-skia)
  does it, checked against resvg in development.
- **typst blocks** go to the `typst` command line, a few at a time, and are
  cached by content in your cache folder (`~/Library/Caches/texel`, or
  `$XDG_CACHE_HOME/texel`).
- **Inline formulas** are measured, then fitted into their line in whole
  terminal rows; texel wraps those paragraphs itself so every row lines up.
- **Nothing waits.** A picture not ready yet shows its source and is drawn
  when it is, so a resize or a long reply never holds up the transcript.

## Develop

```sh
npm install                   # build tooling: MathJax, esbuild, resvg (dev only)
npm run build:mathjax         # rebuild the bundled MathJax into plugin/hooks/render/mathjax/vendor
npm run smoke                 # both backends for real; the rasteriser against resvg
claude plugin test plugin     # the plugin's tests
claude plugin validate .      # marketplace, manifest and hooks
claude --plugin-dir plugin    # a session with this checkout's texel, reloaded on edit
```

## License

MIT, see [LICENSE](LICENSE). The bundled MathJax is Apache-2.0, its licence in
`plugin/hooks/render/mathjax/vendor/LICENSE`.
