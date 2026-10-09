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

// A typst block, `max-columns` the widest it may be, on whole cells.
#let typst-block(body) = {
  let fg = rgb("#" + input("foreground"))
  set page(width: auto, height: auto, margin: 0pt, fill: none)
  // No punctuation hanging past a line's end: at the full width there is
  // no margin for it, and it would be cut off.
  set text(fill: fg, size: size, overhang: false)
  set par(justify: true)
  // Lines given no colour take the text's, not black, which a dark terminal
  // hides: typst folds it into a stroke that names only its width (a table's
  // `stroke: 0.5pt`, fletcher's arrows and nodes). Only unfilled shapes take
  // it, so a filled one gains no outline.
  set line(stroke: fg)
  show curve.where(fill: none): set curve(stroke: fg)
  show circle.where(fill: none): set circle(stroke: fg)
  show ellipse.where(fill: none): set ellipse(stroke: fg)
  show rect.where(fill: none): set rect(stroke: fg)
  show polygon.where(fill: none): set polygon(stroke: fg)
  // A table's padding in em, as typst's 5pt is at its own 11pt: at the size
  // text is set here, an inline fraction would overflow 5pt into the next row.
  set table(stroke: fg, inset: 0.45em)
  context {
    let maxw = int(input("max-columns")) * cw
    // Its width laid out within the allowed one: a figure's own, all of it
    // for what stretches to fill it (a `1fr` column, a full-width box).
    let natural = measure(body, width: maxw).width
    if natural == 0pt { panic("the block draws nothing") }
    // Laid out at its own width with a cell to spare where that fits
    // (render/typst/backend.ts tells natural size by it being narrower than
    // allowed), else at the full width, so its prose wraps.
    let w = if natural + cw <= maxw { calc.ceil((natural + cw) / cw) * cw } else { maxw }
    // Its height measured at that width. Typst measures text from the first
    // line's cap height to the last one's baseline: room above for ascenders
    // and accents, below for descenders.
    let (top, bottom) = (0.25 * ch, 0.45 * ch)
    let h = measure(block(width: w, body)).height
    let rows = calc.max(1, calc.ceil((h + top + bottom) / ch))
    // Laid out as it was measured, with no height to fill (a `height: 100%`
    // in a box of fixed height would take all of it), and padded to whole
    // rows. Centred as one block; its own lines keep their alignment.
    block(width: w, inset: (top: top, bottom: rows * ch - h - top), align(center, box({ set align(start); body })))
  }
}
