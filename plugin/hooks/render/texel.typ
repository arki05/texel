// texel: lays rendered math and typst out on the terminal's cell grid.
//
// The hooks module compiles one small main file per figure that imports this
// library; everything that varies arrives as `sys.inputs` (strings), so no
// LaTeX, colour or size is ever spliced into source. Every figure is a box
// whose size is a whole number of cells, so its PNG maps onto the grid exactly.

#import "@preview/mitex:0.2.7": mitex, mi

#let input(key) = sys.inputs.at(key)
#let length(key) = float(input(key)) * 1pt

// The terminal's grid and font, as the hooks module measured or assumed them.
#let cw = length("cell-width")
#let ch = length("cell-height")
// The widest a figure may be; measuring passes none.
#let maxw = int(sys.inputs.at("max-columns", default: "1000")) * cw
// Where the text's baseline sits in a row, as a fraction of it from the top.
#let baseline = float(input("baseline"))

// Math is sized relative to the terminal font: at `scale` 1 its x-height
// matches the text's; larger reads better in a cell grid. 0.4415em is the
// x-height of New Computer Modern Math, typst's math font.
#let size = float(input("scale")) * length("x-height") / 0.4415

// `ink`: measure by the glyphs' own bounds, so math never spills past its box
// and gets cut. Off for typst blocks, whose prose needs typst's line metrics.
#let setup(body, ink: true) = {
  set page(width: auto, height: auto, margin: 0pt, fill: none)
  // Measuring passes no colour: ink has none.
  set text(fill: rgb("#" + sys.inputs.at("foreground", default: "000000")), size: size)
  set text(top-edge: "bounds", bottom-edge: "bounds") if ink
  set par(justify: true)
  body
}

// The `tex` input, after the person's own macros (`\newcommand`s).
#let latex(display: false) = {
  let source = sys.inputs.at("macros", default: "") + "\n" + input("tex")
  if display { mitex(source) } else { mi(source) }
}

#let nonempty(m) = if m.width == 0pt or m.height == 0pt { panic("empty render") }

// Inline math is placed in two passes. `inline-ink` reports the formula's ink
// at its natural size; the hooks module decides from it how many rows the
// line needs and where the formula sits (fit.ts); `inline-latex` draws it so.

// Width, and ink above and below the baseline, in points.
#let ink(body) = {
  let m = measure(body)
  nonempty(m)
  // Beside a strut standing on the baseline, the line grows by exactly the
  // ink below it.
  let below = measure([#body#box(width: 0pt, height: 1000pt)]).height - 1000pt
  (width: m.width / 1pt, above: (m.height - below) / 1pt, below: below / 1pt)
}

// The `tex` input's ink, for `typst eval` to read back as `<ink>`.
#let inline-ink() = context [#metadata(ink(latex())) <ink>]

// The `tex` input drawn as fitted: `fit-scale` times its natural size,
// `fit-dy` down from the top of a box `fit-rows` x `fit-columns` cells.
#let inline-latex() = box(
  width: int(input("fit-columns")) * cw,
  height: int(input("fit-rows")) * ch,
  place(
    top + center,
    dy: length("fit-dy"),
    scale(float(input("fit-scale")) * 100%, origin: top + left, reflow: true, latex()),
  ),
)

// An equation on its own, at its natural size whatever the width: only inline
// math is ever scaled. One wider than the transcript is the view's to handle.
#let display-math(body) = context {
  let m = measure(body)
  nonempty(m)
  let cols = calc.max(1, calc.ceil((m.width + cw) / cw))
  let rows = calc.max(1, calc.ceil((m.height + ch * 0.5) / ch))
  box(width: cols * cw, height: rows * ch, align(center + horizon, body))
}

// A typst block: a figure that fits is centred at its own size; anything
// wider is laid out at the transcript's width, so its prose wraps.
#let typst-block(body) = context {
  let m = measure(body)
  nonempty(m)
  if m.width + cw <= maxw {
    let cols = calc.ceil((m.width + cw) / cw)
    let rows = calc.max(1, calc.ceil((m.height + ch * 0.5) / ch))
    box(width: cols * cw, height: rows * ch, align(center + horizon, body))
  } else {
    // Typst measures prose from the first line's cap height to the last one's
    // baseline: room above for ascenders and accents, below for descenders.
    let (top, bottom) = (0.25 * ch, 0.45 * ch)
    let h = measure(block(width: maxw, body)).height + top + bottom
    box(width: maxw, height: calc.max(1, calc.ceil(h / ch)) * ch, inset: (top: top), body)
  }
}
