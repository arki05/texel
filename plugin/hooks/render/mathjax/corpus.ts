// A formula for every kind of element and attribute MathJax draws with the
// packages texel loads: drawing.test.ts checks each is drawn, none refused,
// and scripts/smoke.mts checks each against resvg, pixel by pixel.

export const CORPUS = [
  '\\int_0^\\infty e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}',
  '\\left( \\sum_{k=1}^{n} \\frac{1}{k^2} \\right)^{\\!2}',
  '\\boxed{E = mc^2}',
  '\\fbox{$a+b$}',
  '\\colorbox{red}{x}',
  '\\fcolorbox{red}{blue}{x}',
  '\\begin{array}{|c:c|}\\hline a & b \\\\ \\hdashline c & d \\\\ \\hline\\end{array}',
  '\\cancel{x} + \\bcancel{y} + \\xcancel{z}',
  '\\cancelto{0}{x}',
  '\\overline{abc} \\underline{xyz}',
  '\\overbrace{a+b+c}^{3} \\underbrace{x+y}_{2}',
  '\\xrightarrow[\\text{below}]{\\text{above}} \\xleftarrow{f}',
  '\\overrightarrow{AB} \\widehat{xyz} \\widetilde{abc}',
  '\\sqrt[3]{\\frac{a}{b}}',
  '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\begin{bmatrix} 1 \\\\ 2 \\end{bmatrix}',
  '\\left\\{ \\begin{aligned} x &= 1 \\\\ y &= 2 \\end{aligned} \\right.',
  '\\begin{cases} 1 & x > 0 \\\\ 0 & \\text{otherwise} \\end{cases}',
  '\\text{für alle $n$, café, mañana:} \\quad n \\geq 0',
  '\\color{red}{x} + \\mathbb{R} \\otimes \\mathcal{H} \\cdot \\mathfrak{g}',
  '\\bra{\\psi} \\ket{\\phi} \\braket{a|b}',
  '\\Biggl[ \\bigg( \\Big\\{ x \\Big\\} \\bigg) \\Biggr]',
  '\\not= \\neq \\nleq \\overset{!}{=} \\stackrel{def}{=}',
  '\\boldsymbol{\\alpha} \\mathbf{v} \\vec{v} \\hat{n} \\dot{x} \\ddot{y}',
]
