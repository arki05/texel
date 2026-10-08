// texel: lays a typst block out on the terminal's cell grid.
//
// The hooks module compiles one small main file per block that imports this
// library and calls `typst-block` with the block's markup. Everything else
// arrives as `sys.inputs` (strings). The block is drawn as a box whose size is
// a whole number of cells, so its PNG maps onto the grid exactly.

#let input(key) = sys.inputs.at(key)
#let length(key) = float(input(key)) * 1pt

// The terminal's grid and font, as the hooks module measured or assumed them.
#let cw = length("cell-width")
#let ch = length("cell-height")

// Text is sized so its x-height matches the terminal font's. 0.4415em is the
// x-height of New Computer Modern, typst's default math font, close to its
// text font's.
#let size = length("x-height") / 0.4415

// A typst block, `max-columns` the widest it may be: a figure that fits is
// centred at its own size, at least a cell narrower than allowed (render/
// typst/backend.ts tells natural size by it); anything wider is laid out at
// the full width, so its prose wraps.
#let typst-block(body) = {
  set page(width: auto, height: auto, margin: 0pt, fill: none)
  set text(fill: rgb("#" + input("foreground")), size: size)
  set par(justify: true)
  context {
    let maxw = int(input("max-columns")) * cw
    let m = measure(body)
    if m.width == 0pt or m.height == 0pt { panic("the block draws nothing") }
    if m.width + cw <= maxw {
      let cols = calc.ceil((m.width + cw) / cw)
      let rows = calc.max(1, calc.ceil((m.height + ch * 0.5) / ch))
      box(width: cols * cw, height: rows * ch, align(center + horizon, body))
    } else {
      // Typst measures prose from the first line's cap height to the last
      // one's baseline: room above for ascenders and accents, below for
      // descenders.
      let (top, bottom) = (0.25 * ch, 0.45 * ch)
      let h = measure(block(width: maxw, body)).height + top + bottom
      box(width: maxw, height: calc.max(1, calc.ceil(h / ch)) * ch, inset: (top: top), body)
    }
  }
}
