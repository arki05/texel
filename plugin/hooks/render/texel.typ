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
#let maxw = int(input("max-columns")) * cw
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
  set text(fill: rgb("#" + input("foreground")), size: size)
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

// In a line of prose: `rows` tall with the text in the middle row (one row,
// or three for display style, which LaTeX also gives room above and below).
// Size wins over alignment: the formula shrinks only when taller than its
// rows; otherwise it sits on the text's baseline, slid up or down just enough
// to stay inside them.
#let inline-math(body, rows: 1) = context {
  let m = measure(body)
  nonempty(m)
  // Ink below the baseline: beside a strut standing on the baseline, the line
  // grows by exactly that much.
  let below = measure([#body#box(width: 0pt, height: 1000pt)]).height - 1000pt
  let above = m.height - below
  let height = rows * ch
  let base = (rows - 1) / 2 * ch + baseline * ch
  let s = calc.min(1.0, height * 0.98 / m.height, maxw / m.width)
  let dy = calc.min(calc.max(base - above * s, 0pt), height - m.height * s)
  let cols = calc.max(1, calc.ceil(m.width * s / cw))
  box(width: cols * cw, height: height, place(
    top + center,
    dy: dy,
    scale(s * 100%, origin: top + left, reflow: true, body),
  ))
}

// Inline LaTeX, from the `tex` input: three rows when it asks for display
// style, one otherwise.
#let inline-latex() = inline-math(latex(), rows: if input("style") == "display" { 3 } else { 1 })

// An equation on its own: centred, shrunk to fit the width (it cannot wrap).
#let display-math(body) = context {
  let m = measure(body)
  nonempty(m)
  let s = calc.min(1.0, maxw / (m.width + cw))
  let cols = calc.max(1, calc.ceil((m.width + cw) * s / cw))
  let rows = calc.max(1, calc.ceil((m.height * s + ch * 0.5) / ch))
  box(width: cols * cw, height: rows * ch, align(center + horizon, scale(s * 100%, reflow: true, body)))
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
    let h = measure(block(width: maxw, body)).height
    box(width: maxw, height: calc.max(1, calc.ceil(h / ch)) * ch, body)
  }
}
