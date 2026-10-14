import {
  texVariant
} from "./chunk-E3EGH3YQ.js";
import {
  smallop
} from "./chunk-6ME5W25R.js";
import {
  texCalligraphicBold
} from "./chunk-VOK4EEDQ.js";
import {
  texCalligraphic
} from "./chunk-5U6YMGPZ.js";
import {
  texMathit
} from "./chunk-VUEBHCHX.js";
import {
  texOldstyleBold
} from "./chunk-R2P44JJ6.js";
import {
  texOldstyle
} from "./chunk-ZVLF2ZLB.js";
import {
  texSize3
} from "./chunk-LG4QUT7T.js";
import {
  texSize4
} from "./chunk-GFGXWQ4N.js";
import {
  monospace
} from "./chunk-AM5I3XOS.js";
import {
  normal
} from "./chunk-3LNVPLLM.js";
import {
  sansSerifBoldItalic
} from "./chunk-5KYZYZAK.js";
import {
  sansSerifBold
} from "./chunk-WVRICFY6.js";
import {
  sansSerifItalic
} from "./chunk-XYTGPOPV.js";
import {
  sansSerif
} from "./chunk-ZO4NW5A4.js";
import {
  scriptBold
} from "./chunk-URQEXPK7.js";
import {
  script
} from "./chunk-VI6XJ2EP.js";
import {
  boldItalic
} from "./chunk-SVSUOSQO.js";
import {
  bold
} from "./chunk-G2QMX7VI.js";
import {
  doubleStruck
} from "./chunk-LFVBKAO5.js";
import {
  frakturBold
} from "./chunk-FPLUOQEN.js";
import {
  fraktur
} from "./chunk-2R2D7V74.js";
import {
  italic
} from "./chunk-BQIVM5LR.js";
import {
  largeop
} from "./chunk-XMBXPUCC.js";
import {
  H,
  NOSTRETCH,
  SVGFontData,
  V,
  defaultOptions,
  expandable,
  lookup,
  makeArray,
  separateOptions,
  userOptions
} from "./chunk-JNRU6QI4.js";

// node_modules/mathjax-full/ts/core/DOMAdaptor.ts
var AbstractDOMAdaptor = class {
  /**
   * @param {D} document  The document in which the nodes will be created
   * @constructor
   */
  constructor(document2 = null) {
    this.document = document2;
  }
  /**
   * @override
   */
  node(kind, def = {}, children = [], ns) {
    const node = this.create(kind, ns);
    this.setAttributes(node, def);
    for (const child of children) {
      this.append(node, child);
    }
    return node;
  }
  /**
   * @param {N} node           The HTML element whose attributes are to be set
   * @param {OptionList} def   The attributes to set on that node
   */
  setAttributes(node, def) {
    if (def.style && typeof def.style !== "string") {
      for (let key of Object.keys(def.style)) {
        this.setStyle(node, key.replace(/-([a-z])/g, (_m, c) => c.toUpperCase()), def.style[key]);
      }
    }
    if (def.properties) {
      for (let key of Object.keys(def.properties)) {
        node[key] = def.properties[key];
      }
    }
    for (let key of Object.keys(def)) {
      if ((key !== "style" || typeof def.style === "string") && key !== "properties") {
        this.setAttribute(node, key, def[key]);
      }
    }
  }
  /**
   * @override
   */
  replace(nnode, onode) {
    this.insert(nnode, onode);
    this.remove(onode);
    return onode;
  }
  /**
   * @override
   */
  childNode(node, i) {
    return this.childNodes(node)[i];
  }
  /**
   * @override
   */
  allClasses(node) {
    const classes = this.getAttribute(node, "class");
    return !classes ? [] : classes.replace(/  +/g, " ").replace(/^ /, "").replace(/ $/, "").split(/ /);
  }
};

// node_modules/mathjax-full/ts/adaptors/NodeMixin.ts
var NodeMixinOptions = {
  badCSS: true,
  // getComputedStyles() is not implemented in the DOM
  badSizes: true
  // element sizes (e.g., ClientWidth, etc.) are not implemented in the DOM
};
function NodeMixin(Base, options2 = {}) {
  options2 = userOptions(defaultOptions({}, NodeMixinOptions), options2);
  return class NodeAdaptor extends Base {
    static {
      /**
       * The default options
       */
      this.OPTIONS = {
        ...options2.badCSS ? {
          fontSize: 16,
          // We can't compute the font size, so always use this
          fontFamily: "Times"
          // We can't compute the font family, so always use this
        } : {},
        ...options2.badSizes ? {
          cjkCharWidth: 1,
          // Width (in em units) of full width characters
          unknownCharWidth: 0.6,
          // Width (in em units) of unknown (non-full-width) characters
          unknownCharHeight: 0.8
          // Height (in em units) of unknown characters
        } : {}
      };
    }
    static {
      /**
       * Pattern to identify CJK (i.e., full-width) characters
       */
      this.cjkPattern = new RegExp([
        "[",
        "ᄀ-ᅟ",
        // Hangul Jamo
        "〈〉",
        // LEFT-POINTING ANGLE BRACKET, RIGHT-POINTING ANGLE BRACKET
        "⺀-〾",
        // CJK Radicals Supplement ... CJK Symbols and Punctuation
        "぀-㉇",
        // Hiragana ... Enclosed CJK Letters and Months
        "㉐-䶿",
        // Enclosed CJK Letters and Months ... CJK Unified Ideographs Extension A
        "一-꓆",
        // CJK Unified Ideographs ... Yi Radicals
        "ꥠ-ꥼ",
        // Hangul Jamo Extended-A
        "가-힣",
        // Hangul Syllables
        "豈-﫿",
        // CJK Compatibility Ideographs
        "︐-︙",
        // Vertical Forms
        "︰-﹫",
        // CJK Compatibility Forms ... Small Form Variants
        "！-｠￠-￦",
        // Halfwidth and Fullwidth Forms
        "𛀀-𛀁",
        // Kana Supplement
        "🈀-🉑",
        // Enclosed Ideographic Supplement
        "𠀀-𿿽",
        // CJK Unified Ideographs Extension B ... Tertiary Ideographic Plane
        "]"
      ].join(""), "gu");
    }
    /**
     * @param {any} window          The window to work with
     * @param {OptionList} options  The options for the adaptor
     * @constructor
     */
    constructor(...args) {
      super(args[0]);
      let CLASS = this.constructor;
      this.options = userOptions(defaultOptions({}, CLASS.OPTIONS), args[1]);
    }
    /**
     * For DOMs that don't handle CSS well, use the font size from the options
     *
     * @override
     */
    fontSize(node) {
      return options2.badCSS ? this.options.fontSize : super.fontSize(node);
    }
    /**
     * For DOMs that don't handle CSS well, use the font family from the options
     *
     * @override
     */
    fontFamily(node) {
      return options2.badCSS ? this.options.fontFamily : super.fontFamily(node);
    }
    /**
     * @override
     */
    nodeSize(node, em2 = 1, local = null) {
      if (!options2.badSizes) {
        return super.nodeSize(node, em2, local);
      }
      const text = this.textContent(node);
      const non = Array.from(text.replace(NodeAdaptor.cjkPattern, "")).length;
      const CJK = Array.from(text).length - non;
      return [
        CJK * this.options.cjkCharWidth + non * this.options.unknownCharWidth,
        this.options.unknownCharHeight
      ];
    }
    /**
     * @override
     */
    nodeBBox(node) {
      return options2.badSizes ? { left: 0, right: 0, top: 0, bottom: 0 } : super.nodeBBox(node);
    }
  };
}

// node_modules/mathjax-full/ts/adaptors/lite/Element.ts
var LiteElement = class {
  /**
   * @param {string} kind  The type of node to create
   * @param {LiteAttributeList} attributes  The list of attributes to set (if any)
   * @param {LiteNode[]} children  The children for the node (if any)
   * @constructor
   */
  constructor(kind, attributes = {}, children = []) {
    this.kind = kind;
    this.attributes = { ...attributes };
    this.children = [...children];
    for (const child of this.children) {
      child.parent = this;
    }
    this.styles = null;
  }
};

// node_modules/mathjax-full/ts/adaptors/lite/Document.ts
var LiteDocument = class {
  /**
   * The kind is always #document
   */
  get kind() {
    return "#document";
  }
  /**
   * @constructor
   */
  constructor() {
    this.root = new LiteElement("html", {}, [
      this.head = new LiteElement("head"),
      this.body = new LiteElement("body")
    ]);
    this.type = "";
  }
};

// node_modules/mathjax-full/ts/adaptors/lite/Text.ts
var LiteText = class {
  /**
   * The kind of node is #text
   */
  get kind() {
    return "#text";
  }
  /**
   * @param {string} text  The text for the node
   * @constructor
   */
  constructor(text = "") {
    this.value = text;
  }
};
var LiteComment = class extends LiteText {
  get kind() {
    return "#comment";
  }
};

// node_modules/mathjax-full/ts/adaptors/lite/List.ts
var LiteList = class {
  /**
   * @param {N[]} children  The children for the fragment
   * @constructor
   */
  constructor(children) {
    /**
     * The nodes held in the fragment
     */
    this.nodes = [];
    this.nodes = [...children];
  }
  /**
   * @param {N} node  A node to append to the fragment
   */
  append(node) {
    this.nodes.push(node);
  }
  /**
   * Make this class iterable (so it can be used with Array.from())
   */
  [Symbol.iterator]() {
    let i = 0;
    return {
      /**
       * @return {IteratorResult<LiteNode>}
       */
      next() {
        return i === this.nodes.length ? { value: null, done: true } : { value: this.nodes[i++], done: false };
      }
    };
  }
};

// node_modules/mathjax-full/ts/util/Retries.ts
function handleRetriesFor(code) {
  return new Promise(function run(ok, fail) {
    try {
      ok(code());
    } catch (err) {
      if (err.retry && err.retry instanceof Promise) {
        err.retry.then(() => run(ok, fail)).catch((perr) => fail(perr));
      } else if (err.restart && err.restart.isCallback) {
        MathJax.Callback.After(() => run(ok, fail), err.restart);
      } else {
        fail(err);
      }
    }
  });
}
function retryAfter(promise) {
  let err = new Error("MathJax retry");
  err.retry = promise;
  throw err;
}

// node_modules/mathjax-full/ts/components/version.ts
var VERSION = "3.2.2";

// node_modules/mathjax-full/ts/util/PrioritizedList.ts
var PrioritizedList = class _PrioritizedList {
  /**
   * @constructor
   */
  constructor() {
    /**
     * The list of items, sorted by priority (smallest number first)
     */
    this.items = [];
    this.items = [];
  }
  static {
    /**
     * The default priority for items added to the list
     */
    this.DEFAULTPRIORITY = 5;
  }
  /**
   * Make the list iterable, and return the data for the items in the list
   *
   * @return {{next: Function}}  The object containing the iterator's next() function
   */
  [Symbol.iterator]() {
    let i = 0;
    let items = this.items;
    return {
      /* tslint:disable-next-line:jsdoc-require */
      next() {
        return { value: items[i++], done: i > items.length };
      }
    };
  }
  /**
   * Add an item to the list
   *
   * @param {DataClass} item   The data for the item to be added
   * @param {number} priority  The priority for the item
   * @return {DataClass}       The data itself
   */
  add(item, priority = _PrioritizedList.DEFAULTPRIORITY) {
    let i = this.items.length;
    do {
      i--;
    } while (i >= 0 && priority < this.items[i].priority);
    this.items.splice(i + 1, 0, { item, priority });
    return item;
  }
  /**
   * Remove an item from the list
   *
   * @param {DataClass} item   The data for the item to be removed
   */
  remove(item) {
    let i = this.items.length;
    do {
      i--;
    } while (i >= 0 && this.items[i].item !== item);
    if (i >= 0) {
      this.items.splice(i, 1);
    }
  }
};

// node_modules/mathjax-full/ts/core/HandlerList.ts
var HandlerList = class extends PrioritizedList {
  /**
   * @param {Handler} handler  The handler to register
   * @return {Handler}  The list item created for the handler
   */
  register(handler) {
    return this.add(handler, handler.priority);
  }
  /**
   * @param {Handler} Handler  The handler to remove from the list
   */
  unregister(handler) {
    this.remove(handler);
  }
  /**
   * @param {any} document  The document (string, window, DOM element, etc) to be handled
   * @return {Handler}      The handler from the list that can process the given document
   */
  handlesDocument(document2) {
    for (const item of this) {
      let handler = item.item;
      if (handler.handlesDocument(document2)) {
        return handler;
      }
    }
    throw new Error(`Can't find handler for document`);
  }
  /**
   * @param {any} document        The document to be processed
   * @param {OptionList} options  The options for the handler
   * @return {MathDocument}       The MathDocument created by the handler for this document
   */
  document(document2, options2 = null) {
    return this.handlesDocument(document2).create(document2, options2);
  }
};

// node_modules/mathjax-full/ts/mathjax.ts
var mathjax = {
  /**
   *  The MathJax version number
   */
  version: VERSION,
  /**
   *  The list of registers document handlers
   */
  handlers: new HandlerList(),
  /**
   * Creates a MathDocument using a registered handler that knows how to handl it
   *
   * @param {any} document        The document to handle
   * @param {OptionList} options   The options to use for the document (e.g., input and output jax)
   * @return {MathDocument}       The MathDocument to handle the document
   */
  document: function(document2, options2) {
    return mathjax.handlers.document(document2, options2);
  },
  /**
   * The functions for handling retries if a file must be loaded dynamically
   */
  handleRetriesFor,
  retryAfter,
  /**
   * A function for loading external files (can be changed for node/browser use)
   */
  asyncLoad: null
};

// node_modules/mathjax-full/ts/util/AsyncLoad.ts
function asyncLoad(name) {
  if (!mathjax.asyncLoad) {
    return Promise.reject(`Can't load '${name}': No asyncLoad method specified`);
  }
  return new Promise((ok, fail) => {
    const result = mathjax.asyncLoad(name);
    if (result instanceof Promise) {
      result.then((value) => ok(value)).catch((err) => fail(err));
    } else {
      ok(result);
    }
  });
}

// node_modules/mathjax-full/ts/util/Entities.ts
var options = {
  loadMissingEntities: true
  // True means load entity files dynamically if needed
};
var entities = {
  ApplyFunction: "\u2061",
  Backslash: "∖",
  Because: "∵",
  Breve: "˘",
  Cap: "⋒",
  CenterDot: "·",
  CircleDot: "⊙",
  CircleMinus: "⊖",
  CirclePlus: "⊕",
  CircleTimes: "⊗",
  Congruent: "≡",
  ContourIntegral: "∮",
  Coproduct: "∐",
  Cross: "⨯",
  Cup: "⋓",
  CupCap: "≍",
  Dagger: "‡",
  Del: "∇",
  Delta: "Δ",
  Diamond: "⋄",
  DifferentialD: "ⅆ",
  DotEqual: "≐",
  DoubleDot: "¨",
  DoubleRightTee: "⊨",
  DoubleVerticalBar: "∥",
  DownArrow: "↓",
  DownLeftVector: "↽",
  DownRightVector: "⇁",
  DownTee: "⊤",
  Downarrow: "⇓",
  Element: "∈",
  EqualTilde: "≂",
  Equilibrium: "⇌",
  Exists: "∃",
  ExponentialE: "ⅇ",
  FilledVerySmallSquare: "▪",
  ForAll: "∀",
  Gamma: "Γ",
  Gg: "⋙",
  GreaterEqual: "≥",
  GreaterEqualLess: "⋛",
  GreaterFullEqual: "≧",
  GreaterLess: "≷",
  GreaterSlantEqual: "⩾",
  GreaterTilde: "≳",
  Hacek: "ˇ",
  Hat: "^",
  HumpDownHump: "≎",
  HumpEqual: "≏",
  Im: "ℑ",
  ImaginaryI: "ⅈ",
  Integral: "∫",
  Intersection: "⋂",
  InvisibleComma: "\u2063",
  InvisibleTimes: "\u2062",
  Lambda: "Λ",
  Larr: "↞",
  LeftAngleBracket: "⟨",
  LeftArrow: "←",
  LeftArrowRightArrow: "⇆",
  LeftCeiling: "⌈",
  LeftDownVector: "⇃",
  LeftFloor: "⌊",
  LeftRightArrow: "↔",
  LeftTee: "⊣",
  LeftTriangle: "⊲",
  LeftTriangleEqual: "⊴",
  LeftUpVector: "↿",
  LeftVector: "↼",
  Leftarrow: "⇐",
  Leftrightarrow: "⇔",
  LessEqualGreater: "⋚",
  LessFullEqual: "≦",
  LessGreater: "≶",
  LessSlantEqual: "⩽",
  LessTilde: "≲",
  Ll: "⋘",
  Lleftarrow: "⇚",
  LongLeftArrow: "⟵",
  LongLeftRightArrow: "⟷",
  LongRightArrow: "⟶",
  Longleftarrow: "⟸",
  Longleftrightarrow: "⟺",
  Longrightarrow: "⟹",
  Lsh: "↰",
  MinusPlus: "∓",
  NestedGreaterGreater: "≫",
  NestedLessLess: "≪",
  NotDoubleVerticalBar: "∦",
  NotElement: "∉",
  NotEqual: "≠",
  NotExists: "∄",
  NotGreater: "≯",
  NotGreaterEqual: "≱",
  NotLeftTriangle: "⋪",
  NotLeftTriangleEqual: "⋬",
  NotLess: "≮",
  NotLessEqual: "≰",
  NotPrecedes: "⊀",
  NotPrecedesSlantEqual: "⋠",
  NotRightTriangle: "⋫",
  NotRightTriangleEqual: "⋭",
  NotSubsetEqual: "⊈",
  NotSucceeds: "⊁",
  NotSucceedsSlantEqual: "⋡",
  NotSupersetEqual: "⊉",
  NotTilde: "≁",
  NotVerticalBar: "∤",
  Omega: "Ω",
  OverBar: "‾",
  OverBrace: "⏞",
  PartialD: "∂",
  Phi: "Φ",
  Pi: "Π",
  PlusMinus: "±",
  Precedes: "≺",
  PrecedesEqual: "⪯",
  PrecedesSlantEqual: "≼",
  PrecedesTilde: "≾",
  Product: "∏",
  Proportional: "∝",
  Psi: "Ψ",
  Rarr: "↠",
  Re: "ℜ",
  ReverseEquilibrium: "⇋",
  RightAngleBracket: "⟩",
  RightArrow: "→",
  RightArrowLeftArrow: "⇄",
  RightCeiling: "⌉",
  RightDownVector: "⇂",
  RightFloor: "⌋",
  RightTee: "⊢",
  RightTeeArrow: "↦",
  RightTriangle: "⊳",
  RightTriangleEqual: "⊵",
  RightUpVector: "↾",
  RightVector: "⇀",
  Rightarrow: "⇒",
  Rrightarrow: "⇛",
  Rsh: "↱",
  Sigma: "Σ",
  SmallCircle: "∘",
  Sqrt: "√",
  Square: "□",
  SquareIntersection: "⊓",
  SquareSubset: "⊏",
  SquareSubsetEqual: "⊑",
  SquareSuperset: "⊐",
  SquareSupersetEqual: "⊒",
  SquareUnion: "⊔",
  Star: "⋆",
  Subset: "⋐",
  SubsetEqual: "⊆",
  Succeeds: "≻",
  SucceedsEqual: "⪰",
  SucceedsSlantEqual: "≽",
  SucceedsTilde: "≿",
  SuchThat: "∋",
  Sum: "∑",
  Superset: "⊃",
  SupersetEqual: "⊇",
  Supset: "⋑",
  Therefore: "∴",
  Theta: "Θ",
  Tilde: "∼",
  TildeEqual: "≃",
  TildeFullEqual: "≅",
  TildeTilde: "≈",
  UnderBar: "_",
  UnderBrace: "⏟",
  Union: "⋃",
  UnionPlus: "⊎",
  UpArrow: "↑",
  UpDownArrow: "↕",
  UpTee: "⊥",
  Uparrow: "⇑",
  Updownarrow: "⇕",
  Upsilon: "Υ",
  Vdash: "⊩",
  Vee: "⋁",
  VerticalBar: "∣",
  VerticalTilde: "≀",
  Vvdash: "⊪",
  Wedge: "⋀",
  Xi: "Ξ",
  amp: "&",
  acute: "´",
  aleph: "ℵ",
  alpha: "α",
  amalg: "⨿",
  and: "∧",
  ang: "∠",
  angmsd: "∡",
  angsph: "∢",
  ape: "≊",
  backprime: "‵",
  backsim: "∽",
  backsimeq: "⋍",
  beta: "β",
  beth: "ℶ",
  between: "≬",
  bigcirc: "◯",
  bigodot: "⨀",
  bigoplus: "⨁",
  bigotimes: "⨂",
  bigsqcup: "⨆",
  bigstar: "★",
  bigtriangledown: "▽",
  bigtriangleup: "△",
  biguplus: "⨄",
  blacklozenge: "⧫",
  blacktriangle: "▴",
  blacktriangledown: "▾",
  blacktriangleleft: "◂",
  bowtie: "⋈",
  boxdl: "┐",
  boxdr: "┌",
  boxminus: "⊟",
  boxplus: "⊞",
  boxtimes: "⊠",
  boxul: "┘",
  boxur: "└",
  bsol: "\\",
  bull: "•",
  cap: "∩",
  check: "✓",
  chi: "χ",
  circ: "ˆ",
  circeq: "≗",
  circlearrowleft: "↺",
  circlearrowright: "↻",
  circledR: "®",
  circledS: "Ⓢ",
  circledast: "⊛",
  circledcirc: "⊚",
  circleddash: "⊝",
  clubs: "♣",
  colon: ":",
  comp: "∁",
  ctdot: "⋯",
  cuepr: "⋞",
  cuesc: "⋟",
  cularr: "↶",
  cup: "∪",
  curarr: "↷",
  curlyvee: "⋎",
  curlywedge: "⋏",
  dagger: "†",
  daleth: "ℸ",
  ddarr: "⇊",
  deg: "°",
  delta: "δ",
  digamma: "ϝ",
  div: "÷",
  divideontimes: "⋇",
  dot: "˙",
  doteqdot: "≑",
  dotplus: "∔",
  dotsquare: "⊡",
  dtdot: "⋱",
  ecir: "≖",
  efDot: "≒",
  egs: "⪖",
  ell: "ℓ",
  els: "⪕",
  empty: "∅",
  epsi: "ε",
  epsiv: "ϵ",
  erDot: "≓",
  eta: "η",
  eth: "ð",
  flat: "♭",
  fork: "⋔",
  frown: "⌢",
  gEl: "⪌",
  gamma: "γ",
  gap: "⪆",
  gimel: "ℷ",
  gnE: "≩",
  gnap: "⪊",
  gne: "⪈",
  gnsim: "⋧",
  gt: ">",
  gtdot: "⋗",
  harrw: "↭",
  hbar: "ℏ",
  hellip: "…",
  hookleftarrow: "↩",
  hookrightarrow: "↪",
  imath: "ı",
  infin: "∞",
  intcal: "⊺",
  iota: "ι",
  jmath: "ȷ",
  kappa: "κ",
  kappav: "ϰ",
  lEg: "⪋",
  lambda: "λ",
  lap: "⪅",
  larrlp: "↫",
  larrtl: "↢",
  lbrace: "{",
  lbrack: "[",
  le: "≤",
  leftleftarrows: "⇇",
  leftthreetimes: "⋋",
  lessdot: "⋖",
  lmoust: "⎰",
  lnE: "≨",
  lnap: "⪉",
  lne: "⪇",
  lnsim: "⋦",
  longmapsto: "⟼",
  looparrowright: "↬",
  lowast: "∗",
  loz: "◊",
  lt: "<",
  ltimes: "⋉",
  ltri: "◃",
  macr: "¯",
  malt: "✠",
  mho: "℧",
  mu: "μ",
  multimap: "⊸",
  nLeftarrow: "⇍",
  nLeftrightarrow: "⇎",
  nRightarrow: "⇏",
  nVDash: "⊯",
  nVdash: "⊮",
  natur: "♮",
  nearr: "↗",
  nharr: "↮",
  nlarr: "↚",
  not: "¬",
  nrarr: "↛",
  nu: "ν",
  nvDash: "⊭",
  nvdash: "⊬",
  nwarr: "↖",
  omega: "ω",
  omicron: "ο",
  or: "∨",
  osol: "⊘",
  period: ".",
  phi: "φ",
  phiv: "ϕ",
  pi: "π",
  piv: "ϖ",
  prap: "⪷",
  precnapprox: "⪹",
  precneqq: "⪵",
  precnsim: "⋨",
  prime: "′",
  psi: "ψ",
  quot: '"',
  rarrtl: "↣",
  rbrace: "}",
  rbrack: "]",
  rho: "ρ",
  rhov: "ϱ",
  rightrightarrows: "⇉",
  rightthreetimes: "⋌",
  ring: "˚",
  rmoust: "⎱",
  rtimes: "⋊",
  rtri: "▹",
  scap: "⪸",
  scnE: "⪶",
  scnap: "⪺",
  scnsim: "⋩",
  sdot: "⋅",
  searr: "↘",
  sect: "§",
  sharp: "♯",
  sigma: "σ",
  sigmav: "ς",
  simne: "≆",
  smile: "⌣",
  spades: "♠",
  sub: "⊂",
  subE: "⫅",
  subnE: "⫋",
  subne: "⊊",
  supE: "⫆",
  supnE: "⫌",
  supne: "⊋",
  swarr: "↙",
  tau: "τ",
  theta: "θ",
  thetav: "ϑ",
  tilde: "˜",
  times: "×",
  triangle: "▵",
  triangleq: "≜",
  upsi: "υ",
  upuparrows: "⇈",
  veebar: "⊻",
  vellip: "⋮",
  weierp: "℘",
  xi: "ξ",
  yen: "¥",
  zeta: "ζ",
  zigrarr: "⇝",
  //
  //  Needed by TeX input jax
  nbsp: " ",
  rsquo: "’",
  lsquo: "‘"
};
var loaded = {};
function translate(text) {
  return text.replace(/&([a-z][a-z0-9]*|#(?:[0-9]+|x[0-9a-f]+));/ig, replace);
}
function replace(match, entity) {
  if (entity.charAt(0) === "#") {
    return numeric(entity.slice(1));
  }
  if (entities[entity]) {
    return entities[entity];
  }
  if (options["loadMissingEntities"]) {
    let file = entity.match(/^[a-zA-Z](fr|scr|opf)$/) ? RegExp.$1 : entity.charAt(0).toLowerCase();
    if (!loaded[file]) {
      loaded[file] = true;
      retryAfter(asyncLoad("./util/entities/" + file + ".js"));
    }
  }
  return match;
}
function numeric(entity) {
  let n = entity.charAt(0) === "x" ? parseInt(entity.slice(1), 16) : parseInt(entity);
  return String.fromCodePoint(n);
}

// node_modules/mathjax-full/ts/adaptors/lite/Parser.ts
var PATTERNS;
((PATTERNS2) => {
  PATTERNS2.TAGNAME = "[a-z][^\\s\\n>]*";
  PATTERNS2.ATTNAME = "[a-z][^\\s\\n>=]*";
  PATTERNS2.VALUE = `(?:'[^']*'|"[^"]*"|[^\\s\\n]+)`;
  PATTERNS2.VALUESPLIT = `(?:'([^']*)'|"([^"]*)"|([^\\s\\n]+))`;
  PATTERNS2.SPACE = "(?:\\s|\\n)+";
  PATTERNS2.OPTIONALSPACE = "(?:\\s|\\n)*";
  PATTERNS2.ATTRIBUTE = PATTERNS2.ATTNAME + "(?:" + PATTERNS2.OPTIONALSPACE + "=" + PATTERNS2.OPTIONALSPACE + PATTERNS2.VALUE + ")?";
  PATTERNS2.ATTRIBUTESPLIT = "(" + PATTERNS2.ATTNAME + ")(?:" + PATTERNS2.OPTIONALSPACE + "=" + PATTERNS2.OPTIONALSPACE + PATTERNS2.VALUESPLIT + ")?";
  PATTERNS2.TAG = "(<(?:" + PATTERNS2.TAGNAME + "(?:" + PATTERNS2.SPACE + PATTERNS2.ATTRIBUTE + ")*" + PATTERNS2.OPTIONALSPACE + "/?|/" + PATTERNS2.TAGNAME + "|!--[^]*?--|![^]*?)(?:>|$))";
  PATTERNS2.tag = new RegExp(PATTERNS2.TAG, "i");
  PATTERNS2.attr = new RegExp(PATTERNS2.ATTRIBUTE, "i");
  PATTERNS2.attrsplit = new RegExp(PATTERNS2.ATTRIBUTESPLIT, "i");
})(PATTERNS || (PATTERNS = {}));
var LiteParser = class {
  static {
    /**
     * The list of self-closing tags
     */
    this.SELF_CLOSING = {
      area: true,
      base: true,
      br: true,
      col: true,
      command: true,
      embed: true,
      hr: true,
      img: true,
      input: true,
      keygen: true,
      link: true,
      menuitem: true,
      meta: true,
      param: true,
      source: true,
      track: true,
      wbr: true
    };
  }
  static {
    /**
     * The list of tags chose content is not parsed (PCDATA)
     */
    this.PCDATA = {
      option: true,
      textarea: true,
      fieldset: true,
      title: true,
      style: true,
      script: true
    };
  }
  static {
    /**
     * The list of attributes that don't get entity translation
     */
    this.CDATA_ATTR = {
      style: true,
      datafld: true,
      datasrc: true,
      href: true,
      src: true,
      longdesc: true,
      usemap: true,
      cite: true,
      datetime: true,
      action: true,
      axis: true,
      profile: true,
      content: true,
      scheme: true
    };
  }
  /**
   * @override
   */
  parseFromString(text, _format = "text/html", adaptor2 = null) {
    const root = adaptor2.createDocument();
    let node = adaptor2.body(root);
    let parts = text.replace(/<\?.*?\?>/g, "").split(PATTERNS.tag);
    while (parts.length) {
      const text2 = parts.shift();
      const tag = parts.shift();
      if (text2) {
        this.addText(adaptor2, node, text2);
      }
      if (tag && tag.charAt(tag.length - 1) === ">") {
        if (tag.charAt(1) === "!") {
          this.addComment(adaptor2, node, tag);
        } else if (tag.charAt(1) === "/") {
          node = this.closeTag(adaptor2, node, tag);
        } else {
          node = this.openTag(adaptor2, node, tag, parts);
        }
      }
    }
    this.checkDocument(adaptor2, root);
    return root;
  }
  /**
   * @param {LiteAdaptor} adaptor  The adaptor for managing nodes
   * @param {LiteElement} node     The node to add a text element to
   * @param {string} text          The text for the text node
   * @return {LiteText}            The text element
   */
  addText(adaptor2, node, text) {
    text = translate(text);
    return adaptor2.append(node, adaptor2.text(text));
  }
  /**
   * @param {LiteAdaptor} adaptor  The adaptor for managing nodes
   * @param {LiteElement} node     The node to add a comment to
   * @param {string} comment       The text for the comment node
   * @return {LiteComment}         The comment element
   */
  addComment(adaptor2, node, comment) {
    return adaptor2.append(node, new LiteComment(comment));
  }
  /**
   * @param {LiteAdaptor} adaptor  The adaptor for managing nodes
   * @param {LiteElement} node     The node to close
   * @param {string} tag           The close tag being processed
   * @return {LiteElement}         The first unclosed parent node
   */
  closeTag(adaptor2, node, tag) {
    const kind = tag.slice(2, tag.length - 1).toLowerCase();
    while (adaptor2.parent(node) && adaptor2.kind(node) !== kind) {
      node = adaptor2.parent(node);
    }
    return adaptor2.parent(node);
  }
  /**
   * @param {LiteAdaptor} adaptor  The adaptor for managing nodes
   * @param {LiteElement} node     The parent node for the tag
   * @param {string} tag           The tag being processed
   * @param {string[]} parts       The rest of the text/tag array
   * @return {LiteElement}         The node to which the next tag will be added
   */
  openTag(adaptor2, node, tag, parts) {
    const PCDATA = this.constructor.PCDATA;
    const SELF_CLOSING = this.constructor.SELF_CLOSING;
    const kind = tag.match(/<(.*?)[\s\n>\/]/)[1].toLowerCase();
    const child = adaptor2.node(kind);
    const attributes = tag.replace(/^<.*?[\s\n>]/, "").split(PATTERNS.attrsplit);
    if (attributes.pop().match(/>$/) || attributes.length < 5) {
      this.addAttributes(adaptor2, child, attributes);
      adaptor2.append(node, child);
      if (!SELF_CLOSING[kind] && !tag.match(/\/>$/)) {
        if (PCDATA[kind]) {
          this.handlePCDATA(adaptor2, child, kind, parts);
        } else {
          node = child;
        }
      }
    }
    return node;
  }
  /**
   * @param {LiteAdaptor} adaptor  The adaptor for managing nodes
   * @param {LiteElement} node     The node getting the attributes
   * @param {string[]} attributes  The array of space, name, value1, value2, value3
   *                                as described above.
   */
  addAttributes(adaptor2, node, attributes) {
    const CDATA_ATTR = this.constructor.CDATA_ATTR;
    while (attributes.length) {
      let [, name, v1, v2, v3] = attributes.splice(0, 5);
      let value = v1 || v2 || v3 || "";
      if (!CDATA_ATTR[name]) {
        value = translate(value);
      }
      adaptor2.setAttribute(node, name, value);
    }
  }
  /**
   * @param {LiteAdaptor} adaptor  The adaptor for managing nodes
   * @param {LiteElement} node     The node whose PCDATA content is being collected
   * @param {string} kind          The tag name being handled
   * @param {string[]} parts       The array of text/tag data for the document
   */
  handlePCDATA(adaptor2, node, kind, parts) {
    const pcdata = [];
    const etag = "</" + kind + ">";
    let ptag = "";
    while (parts.length && ptag !== etag) {
      pcdata.push(ptag);
      pcdata.push(parts.shift());
      ptag = parts.shift();
    }
    adaptor2.append(node, adaptor2.text(pcdata.join("")));
  }
  /**
   * Check the contents of the parsed document and move html, head, and body
   * tags into the document structure.  That way, you can parse fragments or
   * full documents and still get a valid document.
   *
   * @param {LiteAdaptor} adaptor  The adaptor for managing nodes
   * @param {LiteDocument} root    The document being checked
   */
  checkDocument(adaptor2, root) {
    let node = this.getOnlyChild(adaptor2, adaptor2.body(root));
    if (!node) return;
    for (const child of adaptor2.childNodes(adaptor2.body(root))) {
      if (child === node) {
        break;
      }
      if (child instanceof LiteComment && child.value.match(/^<!DOCTYPE/)) {
        root.type = child.value;
      }
    }
    switch (adaptor2.kind(node)) {
      case "html":
        for (const child of node.children) {
          switch (adaptor2.kind(child)) {
            case "head":
              root.head = child;
              break;
            case "body":
              root.body = child;
              break;
          }
        }
        root.root = node;
        adaptor2.remove(node);
        if (adaptor2.parent(root.body) !== node) {
          adaptor2.append(node, root.body);
        }
        if (adaptor2.parent(root.head) !== node) {
          adaptor2.insert(root.head, root.body);
        }
        break;
      case "head":
        root.head = adaptor2.replace(node, root.head);
        break;
      case "body":
        root.body = adaptor2.replace(node, root.body);
        break;
    }
  }
  /**
   * Checks if the body has only one element child (as opposed to comments or text nodes)
   * and returns that sole element (or null if none or more than one)
   *
   * @param {LiteAdaptor} adaptor  The adaptor for managing nodes
   * @param {LiteElement} body     The body element being checked
   * @return {LiteElement}         The sole LiteElement child of the body, or null if none or more than one
   */
  getOnlyChild(adaptor2, body) {
    let node = null;
    for (const child of adaptor2.childNodes(body)) {
      if (child instanceof LiteElement) {
        if (node) return null;
        node = child;
      }
    }
    return node;
  }
  /**
   * @param {LiteAdaptor} adaptor  The adaptor for managing nodes
   * @param {LiteElement} node     The node to serialize
   * @param {boolean} xml          True when producing XML, false for HTML
   * @return {string}              The serialized element (like outerHTML)
   */
  serialize(adaptor2, node, xml = false) {
    const SELF_CLOSING = this.constructor.SELF_CLOSING;
    const CDATA = this.constructor.CDATA_ATTR;
    const tag = adaptor2.kind(node);
    const attributes = adaptor2.allAttributes(node).map(
      (x) => x.name + '="' + (CDATA[x.name] ? x.value : this.protectAttribute(x.value)) + '"'
    ).join(" ");
    const content = this.serializeInner(adaptor2, node, xml);
    const html = "<" + tag + (attributes ? " " + attributes : "") + ((!xml || content) && !SELF_CLOSING[tag] ? `>${content}</${tag}>` : xml ? "/>" : ">");
    return html;
  }
  /**
   * @param {LiteAdaptor} adaptor  The adaptor for managing nodes
   * @param {LiteElement} node     The node whose innerHTML is needed
   * @return {string}              The serialized element (like innerHTML)
   */
  serializeInner(adaptor2, node, xml = false) {
    const PCDATA = this.constructor.PCDATA;
    if (PCDATA.hasOwnProperty(node.kind)) {
      return adaptor2.childNodes(node).map((x) => adaptor2.value(x)).join("");
    }
    return adaptor2.childNodes(node).map((x) => {
      const kind = adaptor2.kind(x);
      return kind === "#text" ? this.protectHTML(adaptor2.value(x)) : kind === "#comment" ? x.value : this.serialize(adaptor2, x, xml);
    }).join("");
  }
  /**
   * @param {string} text  The attribute value to be HTML escaped
   * @return {string}      The string with " replaced by entities
   */
  protectAttribute(text) {
    if (typeof text !== "string") {
      text = String(text);
    }
    return text.replace(/"/g, "&quot;");
  }
  /**
   * @param {string} text  The text to be HTML escaped
   * @return {string}      The string with &, <, and > replaced by entities
   */
  protectHTML(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
};

// node_modules/mathjax-full/ts/adaptors/lite/Window.ts
var LiteWindow = class {
  /**
   * Create the LiteWindow and its LiteDocument
   */
  constructor() {
    /**
     * The DOMParser class
     */
    this.DOMParser = LiteParser;
    /**
     * The NodeList class
     */
    this.NodeList = LiteList;
    /**
     * The HTMLCollection class
     */
    this.HTMLCollection = LiteList;
    /**
     * The HTMLElement class
     */
    this.HTMLElement = LiteElement;
    /**
     * The DocumentFragment class
     */
    this.DocumentFragment = LiteList;
    /**
     * The Document class
     */
    this.Document = LiteDocument;
    this.document = new LiteDocument();
  }
};

// node_modules/mathjax-full/ts/util/Styles.ts
var TRBL = ["top", "right", "bottom", "left"];
var WSC = ["width", "style", "color"];
function splitSpaces(text) {
  const parts = text.split(/((?:'[^']*'|"[^"]*"|,[\s\n]|[^\s\n])*)/g);
  const split2 = [];
  while (parts.length > 1) {
    parts.shift();
    split2.push(parts.shift());
  }
  return split2;
}
function splitTRBL(name) {
  const parts = splitSpaces(this.styles[name]);
  if (parts.length === 0) {
    parts.push("");
  }
  if (parts.length === 1) {
    parts.push(parts[0]);
  }
  if (parts.length === 2) {
    parts.push(parts[0]);
  }
  if (parts.length === 3) {
    parts.push(parts[1]);
  }
  for (const child of Styles.connect[name].children) {
    this.setStyle(this.childName(name, child), parts.shift());
  }
}
function combineTRBL(name) {
  const children = Styles.connect[name].children;
  const parts = [];
  for (const child of children) {
    const part = this.styles[name + "-" + child];
    if (!part) {
      delete this.styles[name];
      return;
    }
    parts.push(part);
  }
  if (parts[3] === parts[1]) {
    parts.pop();
    if (parts[2] === parts[0]) {
      parts.pop();
      if (parts[1] === parts[0]) {
        parts.pop();
      }
    }
  }
  this.styles[name] = parts.join(" ");
}
function splitSame(name) {
  for (const child of Styles.connect[name].children) {
    this.setStyle(this.childName(name, child), this.styles[name]);
  }
}
function combineSame(name) {
  const children = [...Styles.connect[name].children];
  const value = this.styles[this.childName(name, children.shift())];
  for (const child of children) {
    if (this.styles[this.childName(name, child)] !== value) {
      delete this.styles[name];
      return;
    }
  }
  this.styles[name] = value;
}
var BORDER = {
  width: /^(?:[\d.]+(?:[a-z]+)|thin|medium|thick|inherit|initial|unset)$/,
  style: /^(?:none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|inherit|initial|unset)$/
};
function splitWSC(name) {
  let parts = { width: "", style: "", color: "" };
  for (const part of splitSpaces(this.styles[name])) {
    if (part.match(BORDER.width) && parts.width === "") {
      parts.width = part;
    } else if (part.match(BORDER.style) && parts.style === "") {
      parts.style = part;
    } else {
      parts.color = part;
    }
  }
  for (const child of Styles.connect[name].children) {
    this.setStyle(this.childName(name, child), parts[child]);
  }
}
function combineWSC(name) {
  const parts = [];
  for (const child of Styles.connect[name].children) {
    const value = this.styles[this.childName(name, child)];
    if (value) {
      parts.push(value);
    }
  }
  if (parts.length) {
    this.styles[name] = parts.join(" ");
  } else {
    delete this.styles[name];
  }
}
var FONT = {
  style: /^(?:normal|italic|oblique|inherit|initial|unset)$/,
  variant: new RegExp("^(?:" + [
    "normal|none",
    "inherit|initial|unset",
    "common-ligatures|no-common-ligatures",
    "discretionary-ligatures|no-discretionary-ligatures",
    "historical-ligatures|no-historical-ligatures",
    "contextual|no-contextual",
    "(?:stylistic|character-variant|swash|ornaments|annotation)\\([^)]*\\)",
    "small-caps|all-small-caps|petite-caps|all-petite-caps|unicase|titling-caps",
    "lining-nums|oldstyle-nums|proportional-nums|tabular-nums",
    "diagonal-fractions|stacked-fractions",
    "ordinal|slashed-zero",
    "jis78|jis83|jis90|jis04|simplified|traditional",
    "full-width|proportional-width",
    "ruby"
  ].join("|") + ")$"),
  weight: /^(?:normal|bold|bolder|lighter|[1-9]00|inherit|initial|unset)$/,
  stretch: new RegExp("^(?:" + [
    "normal",
    "(?:(?:ultra|extra|semi)-)?condensed",
    "(?:(?:semi|extra|ulta)-)?expanded",
    "inherit|initial|unset"
  ].join("|") + ")$"),
  size: new RegExp("^(?:" + [
    "xx-small|x-small|small|medium|large|x-large|xx-large|larger|smaller",
    "[d.]+%|[d.]+[a-z]+",
    "inherit|initial|unset"
  ].join("|") + ")(?:/(?:normal|[d.+](?:%|[a-z]+)?))?$")
};
function splitFont(name) {
  const parts = splitSpaces(this.styles[name]);
  const value = {
    style: "",
    variant: [],
    weight: "",
    stretch: "",
    size: "",
    family: "",
    "line-height": ""
  };
  for (const part of parts) {
    value.family = part;
    for (const name2 of Object.keys(FONT)) {
      if ((Array.isArray(value[name2]) || value[name2] === "") && part.match(FONT[name2])) {
        if (name2 === "size") {
          const [size, height] = part.split(/\//);
          value[name2] = size;
          if (height) {
            value["line-height"] = height;
          }
        } else if (value.size === "") {
          if (Array.isArray(value[name2])) {
            value[name2].push(part);
          } else {
            value[name2] = part;
          }
        }
      }
    }
  }
  saveFontParts(name, value);
  delete this.styles[name];
}
function saveFontParts(name, value) {
  for (const child of Styles.connect[name].children) {
    const cname = this.childName(name, child);
    if (Array.isArray(value[child])) {
      const values = value[child];
      if (values.length) {
        this.styles[cname] = values.join(" ");
      }
    } else if (value[child] !== "") {
      this.styles[cname] = value[child];
    }
  }
}
function combineFont(_name) {
}
var Styles = class _Styles {
  static {
    /**
     * Patterns for style values and comments
     */
    this.pattern = {
      style: /([-a-z]+)[\s\n]*:[\s\n]*((?:'[^']*'|"[^"]*"|\n|.)*?)[\s\n]*(?:;|$)/g,
      comment: /\/\*[^]*?\*\//g
    };
  }
  static {
    /**
     * The mapping of parents to children, and how to split and combine them
     */
    this.connect = {
      padding: {
        children: TRBL,
        split: splitTRBL,
        combine: combineTRBL
      },
      border: {
        children: TRBL,
        split: splitSame,
        combine: combineSame
      },
      "border-top": {
        children: WSC,
        split: splitWSC,
        combine: combineWSC
      },
      "border-right": {
        children: WSC,
        split: splitWSC,
        combine: combineWSC
      },
      "border-bottom": {
        children: WSC,
        split: splitWSC,
        combine: combineWSC
      },
      "border-left": {
        children: WSC,
        split: splitWSC,
        combine: combineWSC
      },
      "border-width": {
        children: TRBL,
        split: splitTRBL,
        combine: null
        // means its children combine to a different parent
      },
      "border-style": {
        children: TRBL,
        split: splitTRBL,
        combine: null
        // means its children combine to a different parent
      },
      "border-color": {
        children: TRBL,
        split: splitTRBL,
        combine: null
        // means its children combine to a different parent
      },
      font: {
        children: ["style", "variant", "weight", "stretch", "line-height", "size", "family"],
        split: splitFont,
        combine: combineFont
      }
    };
  }
  /**
   * @param {string} cssText  The initial definition for the style
   * @constructor
   */
  constructor(cssText = "") {
    this.parse(cssText);
  }
  /**
   * @return {string}  The CSS string for the styles currently defined
   */
  get cssText() {
    const styles = [];
    for (const name of Object.keys(this.styles)) {
      const parent = this.parentName(name);
      if (!this.styles[parent]) {
        styles.push(name + ": " + this.styles[name] + ";");
      }
    }
    return styles.join(" ");
  }
  /**
   * @param {string} name   The name of the style to set
   * @param {string|number|boolean} value The value to set it to
   */
  set(name, value) {
    name = this.normalizeName(name);
    this.setStyle(name, value);
    if (_Styles.connect[name] && !_Styles.connect[name].combine) {
      this.combineChildren(name);
      delete this.styles[name];
    }
    while (name.match(/-/)) {
      name = this.parentName(name);
      if (!_Styles.connect[name]) break;
      _Styles.connect[name].combine.call(this, name);
    }
  }
  /**
   * @param {string} name  The name of the style to get
   * @return {string}      The value of the style (or empty string if not defined)
   */
  get(name) {
    name = this.normalizeName(name);
    return this.styles.hasOwnProperty(name) ? this.styles[name] : "";
  }
  /**
   * @param {string} name   The name of the style to set (without causing parent updates)
   * @param {string} value  The value to set it to
   */
  setStyle(name, value) {
    this.styles[name] = value;
    if (_Styles.connect[name] && _Styles.connect[name].children) {
      _Styles.connect[name].split.call(this, name);
    }
    if (value === "") {
      delete this.styles[name];
    }
  }
  /**
   * @param {string} name   The name of the style whose parent is to be combined
   */
  combineChildren(name) {
    const parent = this.parentName(name);
    for (const child of _Styles.connect[name].children) {
      const cname = this.childName(parent, child);
      _Styles.connect[cname].combine.call(this, cname);
    }
  }
  /**
   * @param {string} name   The name of the style whose parent style is to be found
   * @return {string}       The name of the parent, or '' if none
   */
  parentName(name) {
    const parent = name.replace(/-[^-]*$/, "");
    return name === parent ? "" : parent;
  }
  /**
   * @param {string} name   The name of the parent style
   * @param {string} child  The suffix to be added to the parent
   * @preturn {string}      The combined name
   */
  childName(name, child) {
    if (child.match(/-/)) {
      return child;
    }
    if (_Styles.connect[name] && !_Styles.connect[name].combine) {
      child += name.replace(/.*-/, "-");
      name = this.parentName(name);
    }
    return name + "-" + child;
  }
  /**
   * @param {string} name  The name of a style to normalize
   * @return {string}      The name converted from CamelCase to lowercase with dashes
   */
  normalizeName(name) {
    return name.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
  }
  /**
   * @param {string} cssText  A style text string to be parsed into separate styles
   *                          (by using this.set(), we get all the sub-styles created
   *                           as well as the merged style shorthands)
   */
  parse(cssText = "") {
    let PATTERN = this.constructor.pattern;
    this.styles = {};
    const parts = cssText.replace(PATTERN.comment, "").split(PATTERN.style);
    while (parts.length > 1) {
      let [space, name, value] = parts.splice(0, 3);
      if (space.match(/[^\s\n]/)) return;
      this.set(name, value);
    }
  }
};

// node_modules/mathjax-full/ts/adaptors/liteAdaptor.ts
var LiteBase = class extends AbstractDOMAdaptor {
  /**
   * @param {OptionList} options  The options for the lite adaptor (e.g., fontSize)
   * @constructor
   */
  constructor() {
    super();
    this.parser = new LiteParser();
    this.window = new LiteWindow();
  }
  /**
   * @override
   */
  parse(text, format) {
    return this.parser.parseFromString(text, format, this);
  }
  /**
   * @override
   */
  create(kind, _ns = null) {
    return new LiteElement(kind);
  }
  /**
   * @override
   */
  text(text) {
    return new LiteText(text);
  }
  /**
   * @param {string} text   The text of the comment
   * @return {LiteComment}  The comment node
   */
  comment(text) {
    return new LiteComment(text);
  }
  /**
   * @return {LiteDocument}  A new document element
   */
  createDocument() {
    return new LiteDocument();
  }
  /**
   * @override
   */
  head(doc) {
    return doc.head;
  }
  /**
   * @override
   */
  body(doc) {
    return doc.body;
  }
  /**
   * @override
   */
  root(doc) {
    return doc.root;
  }
  /**
   * @override
   */
  doctype(doc) {
    return doc.type;
  }
  /**
   * @override
   */
  tags(node, name, ns = null) {
    let stack = [];
    let tags = [];
    if (ns) {
      return tags;
    }
    let n = node;
    while (n) {
      let kind = n.kind;
      if (kind !== "#text" && kind !== "#comment") {
        n = n;
        if (kind === name) {
          tags.push(n);
        }
        if (n.children.length) {
          stack = n.children.concat(stack);
        }
      }
      n = stack.shift();
    }
    return tags;
  }
  /**
   * @param {LiteElement} node   The node to be searched
   * @param {string} id          The id of the node to look for
   * @return {LiteElement}       The child node having the given id
   */
  elementById(node, id) {
    let stack = [];
    let n = node;
    while (n) {
      if (n.kind !== "#text" && n.kind !== "#comment") {
        n = n;
        if (n.attributes["id"] === id) {
          return n;
        }
        if (n.children.length) {
          stack = n.children.concat(stack);
        }
      }
      n = stack.shift();
    }
    return null;
  }
  /**
   * @param {LiteElement} node   The node to be searched
   * @param {string} name        The name of the class to find
   * @return {LiteElement[]}     The nodes with the given class
   */
  elementsByClass(node, name) {
    let stack = [];
    let tags = [];
    let n = node;
    while (n) {
      if (n.kind !== "#text" && n.kind !== "#comment") {
        n = n;
        const classes = (n.attributes["class"] || "").trim().split(/ +/);
        if (classes.includes(name)) {
          tags.push(n);
        }
        if (n.children.length) {
          stack = n.children.concat(stack);
        }
      }
      n = stack.shift();
    }
    return tags;
  }
  /**
   * @override
   */
  getElements(nodes, document2) {
    let containers = [];
    const body = this.body(document2);
    for (const node of nodes) {
      if (typeof node === "string") {
        if (node.charAt(0) === "#") {
          const n = this.elementById(body, node.slice(1));
          if (n) {
            containers.push(n);
          }
        } else if (node.charAt(0) === ".") {
          containers = containers.concat(this.elementsByClass(body, node.slice(1)));
        } else if (node.match(/^[-a-z][-a-z0-9]*$/i)) {
          containers = containers.concat(this.tags(body, node));
        }
      } else if (Array.isArray(node)) {
        containers = containers.concat(node);
      } else if (node instanceof this.window.NodeList || node instanceof this.window.HTMLCollection) {
        containers = containers.concat(node.nodes);
      } else {
        containers.push(node);
      }
    }
    return containers;
  }
  /**
   * @override
   */
  contains(container, node) {
    while (node && node !== container) {
      node = this.parent(node);
    }
    return !!node;
  }
  /**
   * @override
   */
  parent(node) {
    return node.parent;
  }
  /**
   * @param {LiteNode} node  The node whose index is needed
   * @return {number}        The index of the node it its parent's children array
   */
  childIndex(node) {
    return node.parent ? node.parent.children.findIndex((n) => n === node) : -1;
  }
  /**
   * @override
   */
  append(node, child) {
    if (child.parent) {
      this.remove(child);
    }
    node.children.push(child);
    child.parent = node;
    return child;
  }
  /**
   * @override
   */
  insert(nchild, ochild) {
    if (nchild.parent) {
      this.remove(nchild);
    }
    if (ochild && ochild.parent) {
      const i = this.childIndex(ochild);
      ochild.parent.children.splice(i, 0, nchild);
      nchild.parent = ochild.parent;
    }
  }
  /**
   * @override
   */
  remove(child) {
    const i = this.childIndex(child);
    if (i >= 0) {
      child.parent.children.splice(i, 1);
    }
    child.parent = null;
    return child;
  }
  /**
   * @override
   */
  replace(nnode, onode) {
    const i = this.childIndex(onode);
    if (i >= 0) {
      onode.parent.children[i] = nnode;
      nnode.parent = onode.parent;
      onode.parent = null;
    }
    return onode;
  }
  /**
   * @override
   */
  clone(node) {
    const nnode = new LiteElement(node.kind);
    nnode.attributes = { ...node.attributes };
    nnode.children = node.children.map((n) => {
      if (n.kind === "#text") {
        return new LiteText(n.value);
      } else if (n.kind === "#comment") {
        return new LiteComment(n.value);
      } else {
        const m = this.clone(n);
        m.parent = nnode;
        return m;
      }
    });
    return nnode;
  }
  /**
   * @override
   */
  split(node, n) {
    const text = new LiteText(node.value.slice(n));
    node.value = node.value.slice(0, n);
    node.parent.children.splice(this.childIndex(node) + 1, 0, text);
    text.parent = node.parent;
    return text;
  }
  /**
   * @override
   */
  next(node) {
    const parent = node.parent;
    if (!parent) return null;
    const i = this.childIndex(node) + 1;
    return i >= 0 && i < parent.children.length ? parent.children[i] : null;
  }
  /**
   * @override
   */
  previous(node) {
    const parent = node.parent;
    if (!parent) return null;
    const i = this.childIndex(node) - 1;
    return i >= 0 ? parent.children[i] : null;
  }
  /**
   * @override
   */
  firstChild(node) {
    return node.children[0];
  }
  /**
   * @override
   */
  lastChild(node) {
    return node.children[node.children.length - 1];
  }
  /**
   * @override
   */
  childNodes(node) {
    return [...node.children];
  }
  /**
   * @override
   */
  childNode(node, i) {
    return node.children[i];
  }
  /**
   * @override
   */
  kind(node) {
    return node.kind;
  }
  /**
   * @override
   */
  value(node) {
    return node.kind === "#text" ? node.value : node.kind === "#comment" ? node.value.replace(/^<!(--)?((?:.|\n)*)\1>$/, "$2") : "";
  }
  /**
   * @override
   */
  textContent(node) {
    return node.children.reduce((s, n) => {
      return s + (n.kind === "#text" ? n.value : n.kind === "#comment" ? "" : this.textContent(n));
    }, "");
  }
  /**
   * @override
   */
  innerHTML(node) {
    return this.parser.serializeInner(this, node);
  }
  /**
   * @override
   */
  outerHTML(node) {
    return this.parser.serialize(this, node);
  }
  /**
   * @override
   */
  serializeXML(node) {
    return this.parser.serialize(this, node, true);
  }
  /**
   * @override
   */
  setAttribute(node, name, value, ns = null) {
    if (typeof value !== "string") {
      value = String(value);
    }
    if (ns) {
      name = ns.replace(/.*\//, "") + ":" + name.replace(/^.*:/, "");
    }
    node.attributes[name] = value;
    if (name === "style") {
      node.styles = null;
    }
  }
  /**
   * @override
   */
  getAttribute(node, name) {
    return node.attributes[name];
  }
  /**
   * @override
   */
  removeAttribute(node, name) {
    delete node.attributes[name];
  }
  /**
   * @override
   */
  hasAttribute(node, name) {
    return node.attributes.hasOwnProperty(name);
  }
  /**
   * @override
   */
  allAttributes(node) {
    const attributes = node.attributes;
    const list = [];
    for (const name of Object.keys(attributes)) {
      list.push({ name, value: attributes[name] });
    }
    return list;
  }
  /**
   * @override
   */
  addClass(node, name) {
    const classes = (node.attributes["class"] || "").split(/ /);
    if (!classes.find((n) => n === name)) {
      classes.push(name);
      node.attributes["class"] = classes.join(" ");
    }
  }
  /**
   * @override
   */
  removeClass(node, name) {
    const classes = (node.attributes["class"] || "").split(/ /);
    const i = classes.findIndex((n) => n === name);
    if (i >= 0) {
      classes.splice(i, 1);
      node.attributes["class"] = classes.join(" ");
    }
  }
  /**
   * @override
   */
  hasClass(node, name) {
    const classes = (node.attributes["class"] || "").split(/ /);
    return !!classes.find((n) => n === name);
  }
  /**
   * @override
   */
  setStyle(node, name, value) {
    if (!node.styles) {
      node.styles = new Styles(this.getAttribute(node, "style"));
    }
    node.styles.set(name, value);
    node.attributes["style"] = node.styles.cssText;
  }
  /**
   * @override
   */
  getStyle(node, name) {
    if (!node.styles) {
      const style = this.getAttribute(node, "style");
      if (!style) {
        return "";
      }
      node.styles = new Styles(style);
    }
    return node.styles.get(name);
  }
  /**
   * @override
   */
  allStyles(node) {
    return this.getAttribute(node, "style");
  }
  /**
   * @override
   */
  insertRules(node, rules) {
    node.children = [this.text(rules.join("\n\n") + "\n\n" + this.textContent(node))];
  }
  /*******************************************************************/
  /*
   *  The next four methods get overridden by the NodeMixin below
   */
  /**
   * @override
   */
  fontSize(_node) {
    return 0;
  }
  /**
   * @override
   */
  fontFamily(_node) {
    return "";
  }
  /**
   * @override
   */
  nodeSize(_node, _em = 1, _local = null) {
    return [0, 0];
  }
  /**
   * @override
   */
  nodeBBox(_node) {
    return { left: 0, right: 0, top: 0, bottom: 0 };
  }
};
var LiteAdaptor = class extends NodeMixin(LiteBase) {
};
function liteAdaptor(options2 = null) {
  return new LiteAdaptor(null, options2);
}

// node_modules/mathjax-full/ts/util/FunctionList.ts
var FunctionList = class extends PrioritizedList {
  /**
   * Executes the functions in the list (in prioritized order),
   *   passing the given data to the functions.  If any return
   *   false, the list is terminated.
   *
   * @param {any[]} data  The array of arguments to pass to the functions
   * @return {boolean}    False if any function stopped the list by
   *                       returning false, true otherwise
   */
  execute(...data) {
    for (const item of this) {
      let result = item.item(...data);
      if (result === false) {
        return false;
      }
    }
    return true;
  }
  /**
   * Executes the functions in the list (in prioritized order) asynchronously,
   *   passing the given data to the functions, and doing the next function
   *   only when the previous one completes.  If the function returns a
   *   Promise, then use that to control the flow.  Otherwise, if the
   *   function returns false, the list is terminated.
   * This function returns a Promise.  If any function in the list fails,
   *   the promise fails.  If any function returns false, the promise
   *   succeeds, but passes false as its argument.  Otherwise it succeeds
   *   and passes true.
   *
   * @param {any[]} data  The array of arguments to pass to the functions
   * @return {Promise}    The promise that is satisfied when the function
   *                       list completes (with argument true or false
   *                       depending on whether some function returned
   *                       false or not).
   */
  asyncExecute(...data) {
    let i = -1;
    let items = this.items;
    return new Promise((ok, fail) => {
      (function execute() {
        while (++i < items.length) {
          let result = items[i].item(...data);
          if (result instanceof Promise) {
            result.then(execute).catch((err) => fail(err));
            return;
          }
          if (result === false) {
            ok(false);
            return;
          }
        }
        ok(true);
      })();
    });
  }
};

// node_modules/mathjax-full/ts/core/InputJax.ts
var AbstractInputJax = class {
  // set by the handler
  /**
   * @param {OptionList} options  The options to apply to this input jax
   *
   * @constructor
   */
  constructor(options2 = {}) {
    /**
     * The DOMAdaptor for the MathDocument for this input jax
     */
    this.adaptor = null;
    // set by the handler
    /**
     * The MathML node factory
     */
    this.mmlFactory = null;
    let CLASS = this.constructor;
    this.options = userOptions(defaultOptions({}, CLASS.OPTIONS), options2);
    this.preFilters = new FunctionList();
    this.postFilters = new FunctionList();
  }
  static {
    /**
     * The name of the input jax
     */
    this.NAME = "generic";
  }
  static {
    /**
     * The default options for the input jax
     */
    this.OPTIONS = {};
  }
  /**
   * @return {string}  The name of this input jax class
   */
  get name() {
    return this.constructor.NAME;
  }
  /**
   * @override
   */
  setAdaptor(adaptor2) {
    this.adaptor = adaptor2;
  }
  /**
   * @override
   */
  setMmlFactory(mmlFactory) {
    this.mmlFactory = mmlFactory;
  }
  /**
   * @override
   */
  initialize() {
  }
  /**
   * @override
   */
  reset(..._args) {
  }
  /**
   * @return {boolean}  True means find math in string array, false means in DOM element
   */
  get processStrings() {
    return true;
  }
  /**
   * @override
   */
  findMath(_node, _options) {
    return [];
  }
  /**
   * Execute a set of filters, passing them the MathItem and any needed data,
   *  and return the (possibly modified) data
   *
   * @param {FunctionList} filters   The list of functions to be performed
   * @param {MathItem} math          The math item that is being processed
   * @param {MathDocument} document  The math document containg the math item
   * @param {any} data               Whatever other data is needed
   * @return {any}                   The (possibly modified) data
   */
  executeFilters(filters, math, document2, data) {
    let args = { math, document: document2, data };
    filters.execute(args);
    return args.data;
  }
};

// node_modules/mathjax-full/ts/core/OutputJax.ts
var AbstractOutputJax = class {
  // set by the handler
  /**
   * @param {OptionList} options  The options for this instance
   */
  constructor(options2 = {}) {
    /**
     * The MathDocument's DOMAdaptor
     */
    this.adaptor = null;
    let CLASS = this.constructor;
    this.options = userOptions(defaultOptions({}, CLASS.OPTIONS), options2);
    this.postFilters = new FunctionList();
  }
  static {
    /**
     * The name for the output jax
     */
    this.NAME = "generic";
  }
  static {
    /**
     * The default options for the output jax
     */
    this.OPTIONS = {};
  }
  /**
   * @return {string}  The name for this output jax class
   */
  get name() {
    return this.constructor.NAME;
  }
  /**
   * @override
   */
  setAdaptor(adaptor2) {
    this.adaptor = adaptor2;
  }
  /**
   * @override
   */
  initialize() {
  }
  /**
   * @override
   */
  reset(..._args) {
  }
  /**
   * @override
   */
  getMetrics(_document) {
  }
  /**
   * @override
   */
  styleSheet(_document) {
    return null;
  }
  /**
   * @override
   */
  pageElements(_document) {
    return null;
  }
  /**
   * Execute a set of filters, passing them the MathItem and any needed data,
   *  and return the (possibly modified) data
   *
   * @param {FunctionList} filters   The list of functions to be performed
   * @param {MathItem} math          The math item that is being processed
   * @param {MathDocument} document  The math document contaiing the math item
   * @param {any} data               Whatever other data is needed
   * @return {any}                   The (possibly modified) data
   */
  executeFilters(filters, math, document2, data) {
    let args = { math, document: document2, data };
    filters.execute(args);
    return args.data;
  }
};

// node_modules/mathjax-full/ts/util/LinkedList.ts
var END = Symbol();
var ListItem = class {
  /**
   * @param {any} data  The data to be stored in the list item
   * @constructor
   */
  constructor(data = null) {
    /**
     * Pointers to the next item in the list
     */
    this.next = null;
    /**
     * Pointers to the previous item in the list
     */
    this.prev = null;
    this.data = data;
  }
};
var LinkedList = class _LinkedList {
  /**
   *  This.list is a special ListItem whose next property
   *    points to the head of the list and whose prev
   *    property points to the tail.  This lets us relink
   *    the head and tail items in the same way as any other
   *    item in the list, without having to handle special
   *    cases.
   *
   * @param {DataClass[]} args  The data items that form the initial list
   * @constructor
   */
  constructor(...args) {
    this.list = new ListItem(END);
    this.list.next = this.list.prev = this.list;
    this.push(...args);
  }
  /**
   *  Used for sorting and merging lists (Overridden by subclasses)
   *
   * @param {DataClass} a   The first item to compare
   * @param {DataClass} b   The second item to compare
   * @return {boolean}      True if a is before b, false otherwise
   */
  isBefore(a, b) {
    return a < b;
  }
  /**
   * Push items on the end of the list
   *
   * @param {DataClass[]} args   The list of data items to be pushed
   * @return {LinkedList}        The LinkedList object (for chaining)
   */
  push(...args) {
    for (const data of args) {
      let item = new ListItem(data);
      item.next = this.list;
      item.prev = this.list.prev;
      this.list.prev = item;
      item.prev.next = item;
    }
    return this;
  }
  /**
   * Pop the end item off the list and return its data
   *
   * @return {DataClass}  The data from the last item in the list
   */
  pop() {
    let item = this.list.prev;
    if (item.data === END) {
      return null;
    }
    this.list.prev = item.prev;
    item.prev.next = this.list;
    item.next = item.prev = null;
    return item.data;
  }
  /**
   * Push items at the head of the list
   *
   * @param {DataClass[]} args   The list of data items to inserted
   * @return {LinkedList}        The LinkedList object (for chaining)
   */
  unshift(...args) {
    for (const data of args.slice(0).reverse()) {
      let item = new ListItem(data);
      item.next = this.list.next;
      item.prev = this.list;
      this.list.next = item;
      item.next.prev = item;
    }
    return this;
  }
  /**
   * Remove an item from the head of the list and return its data
   *
   * @return {DataClass}  The data from the first item in the list
   */
  shift() {
    let item = this.list.next;
    if (item.data === END) {
      return null;
    }
    this.list.next = item.next;
    item.next.prev = this.list;
    item.next = item.prev = null;
    return item.data;
  }
  /**
   * Remove items from the list
   *
   * @param {DataClass[]} items   The items to remove
   */
  remove(...items) {
    const map = /* @__PURE__ */ new Map();
    for (const item2 of items) {
      map.set(item2, true);
    }
    let item = this.list.next;
    while (item.data !== END) {
      const next = item.next;
      if (map.has(item.data)) {
        item.prev.next = item.next;
        item.next.prev = item.prev;
        item.next = item.prev = null;
      }
      item = next;
    }
  }
  /**
   * Empty the list
   *
   * @return {LinkedList}  The LinkedList object (for chaining)
   */
  clear() {
    this.list.next.prev = this.list.prev.next = null;
    this.list.next = this.list.prev = this.list;
    return this;
  }
  /**
   * An iterator for the list in forward order
   *
   * @yield {DataClass} The next item in the iteration sequence
   */
  *[Symbol.iterator]() {
    let current = this.list.next;
    while (current.data !== END) {
      yield current.data;
      current = current.next;
    }
  }
  /**
   * An iterator for the list in reverse order
   *
   * @yield {DataClass} The previous item in the iteration sequence
   */
  *reversed() {
    let current = this.list.prev;
    while (current.data !== END) {
      yield current.data;
      current = current.prev;
    }
  }
  /**
   * Insert a new item into a sorted list in the correct locations
   *
   * @param {DataClass} data   The data item to add
   * @param {SortFn} isBefore   The function used to order the data
   * @param {LinkedList}        The LinkedList object (for chaining)
   */
  insert(data, isBefore = null) {
    if (isBefore === null) {
      isBefore = this.isBefore.bind(this);
    }
    let item = new ListItem(data);
    let cur = this.list.next;
    while (cur.data !== END && isBefore(cur.data, item.data)) {
      cur = cur.next;
    }
    item.prev = cur.prev;
    item.next = cur;
    cur.prev.next = cur.prev = item;
    return this;
  }
  /**
   * Sort the list using an optional sort function
   *
   * @param {SortFn} isBefore  The function used to order the data
   * @return {LinkedList}      The LinkedList object (for chaining)
   */
  sort(isBefore = null) {
    if (isBefore === null) {
      isBefore = this.isBefore.bind(this);
    }
    let lists = [];
    for (const item of this) {
      lists.push(new _LinkedList(item));
    }
    this.list.next = this.list.prev = this.list;
    while (lists.length > 1) {
      let l1 = lists.shift();
      let l2 = lists.shift();
      l1.merge(l2, isBefore);
      lists.push(l1);
    }
    if (lists.length) {
      this.list = lists[0].list;
    }
    return this;
  }
  /**
   * Merge a sorted list with another sorted list
   *
   * @param {LinkedList} list  The list to merge into this instance's list
   * @param {SortFn} isBefore  The function used to order the data
   * @return {LinkedList}      The LinkedList instance (for chaining)
   */
  merge(list, isBefore = null) {
    if (isBefore === null) {
      isBefore = this.isBefore.bind(this);
    }
    let lcur = this.list.next;
    let mcur = list.list.next;
    while (lcur.data !== END && mcur.data !== END) {
      if (isBefore(mcur.data, lcur.data)) {
        [mcur.prev.next, lcur.prev.next] = [lcur, mcur];
        [mcur.prev, lcur.prev] = [lcur.prev, mcur.prev];
        [this.list.prev.next, list.list.prev.next] = [list.list, this.list];
        [this.list.prev, list.list.prev] = [list.list.prev, this.list.prev];
        [lcur, mcur] = [mcur.next, lcur];
      } else {
        lcur = lcur.next;
      }
    }
    if (mcur.data !== END) {
      this.list.prev.next = list.list.next;
      list.list.next.prev = this.list.prev;
      list.list.prev.next = this.list;
      this.list.prev = list.list.prev;
      list.list.next = list.list.prev = list.list;
    }
    return this;
  }
};

// node_modules/mathjax-full/ts/core/MathList.ts
var AbstractMathList = class extends LinkedList {
  /**
   * @override
   */
  isBefore(a, b) {
    return a.start.i < b.start.i || a.start.i === b.start.i && a.start.n < b.start.n;
  }
};

// node_modules/mathjax-full/ts/core/MathItem.ts
function protoItem(open, math, close, n, start, end, display = null) {
  let item = {
    open,
    math,
    close,
    n,
    start: { n: start },
    end: { n: end },
    display
  };
  return item;
}
var AbstractMathItem = class {
  /**
   * @param {string} math      The math expression for this item
   * @param {Inputjax} jax     The input jax to use for this item
   * @param {boolean} display  True if display mode, false if inline
   * @param {Location} start   The starting position of the math in the document
   * @param {Location} end     The ending position of the math in the document
   * @constructor
   */
  constructor(math, jax, display = true, start = { i: 0, n: 0, delim: "" }, end = { i: 0, n: 0, delim: "" }) {
    /**
     * The compiled internal MathML (result of InputJax)
     */
    this.root = null;
    /**
     * The typeset result (result of OutputJax)
     */
    this.typesetRoot = null;
    /**
     * The metric information about the surrounding environment
     */
    this.metrics = {};
    /**
     * Data private to the input jax
     */
    this.inputData = {};
    /**
     * Data private to the output jax
     */
    this.outputData = {};
    /**
     * The current state of the item (how far in the render actions it has been processed)
     */
    this._state = STATE.UNPROCESSED;
    this.math = math;
    this.inputJax = jax;
    this.display = display;
    this.start = start;
    this.end = end;
    this.root = null;
    this.typesetRoot = null;
    this.metrics = {};
    this.inputData = {};
    this.outputData = {};
  }
  /**
   * @return {boolean}   True when this item is an escaped delimiter
   */
  get isEscaped() {
    return this.display === null;
  }
  /**
   * @override
   */
  render(document2) {
    document2.renderActions.renderMath(this, document2);
  }
  /**
   * @override
   */
  rerender(document2, start = STATE.RERENDER) {
    if (this.state() >= start) {
      this.state(start - 1);
    }
    document2.renderActions.renderMath(this, document2, start);
  }
  /**
   * @override
   */
  convert(document2, end = STATE.LAST) {
    document2.renderActions.renderConvert(this, document2, end);
  }
  /**
   * @override
   */
  compile(document2) {
    if (this.state() < STATE.COMPILED) {
      this.root = this.inputJax.compile(this, document2);
      this.state(STATE.COMPILED);
    }
  }
  /**
   * @override
   */
  typeset(document2) {
    if (this.state() < STATE.TYPESET) {
      this.typesetRoot = document2.outputJax[this.isEscaped ? "escaped" : "typeset"](this, document2);
      this.state(STATE.TYPESET);
    }
  }
  /**
   * @override
   */
  updateDocument(_document) {
  }
  /**
   * @override
   */
  removeFromDocument(_restore = false) {
  }
  /**
   * @override
   */
  setMetrics(em2, ex, cwidth, lwidth, scale) {
    this.metrics = {
      em: em2,
      ex,
      containerWidth: cwidth,
      lineWidth: lwidth,
      scale
    };
  }
  /**
   * @override
   */
  state(state = null, restore = false) {
    if (state != null) {
      if (state < STATE.INSERTED && this._state >= STATE.INSERTED) {
        this.removeFromDocument(restore);
      }
      if (state < STATE.TYPESET && this._state >= STATE.TYPESET) {
        this.outputData = {};
      }
      if (state < STATE.COMPILED && this._state >= STATE.COMPILED) {
        this.inputData = {};
      }
      this._state = state;
    }
    return this._state;
  }
  /**
   * @override
   */
  reset(restore = false) {
    this.state(STATE.UNPROCESSED, restore);
  }
};
var STATE = {
  UNPROCESSED: 0,
  FINDMATH: 10,
  COMPILED: 20,
  CONVERT: 100,
  METRICS: 110,
  RERENDER: 125,
  TYPESET: 150,
  INSERTED: 200,
  LAST: 1e4
};

// node_modules/mathjax-full/ts/core/Tree/Factory.ts
var AbstractFactory = class {
  /**
   * @override
   */
  constructor(nodes = null) {
    /**
     * The default kind
     */
    this.defaultKind = "unknown";
    /**
     * The map of node kinds to node classes
     */
    this.nodeMap = /* @__PURE__ */ new Map();
    /**
     * An object containing functions for creating the various node kinds
     */
    this.node = {};
    if (nodes === null) {
      nodes = this.constructor.defaultNodes;
    }
    for (const kind of Object.keys(nodes)) {
      this.setNodeClass(kind, nodes[kind]);
    }
  }
  static {
    /**
     * The default collection of objects to use for the node map
     */
    this.defaultNodes = {};
  }
  /**
   * @override
   */
  create(kind, ...args) {
    return (this.node[kind] || this.node[this.defaultKind])(...args);
  }
  /**
   * @override
   */
  setNodeClass(kind, nodeClass) {
    this.nodeMap.set(kind, nodeClass);
    let THIS = this;
    let KIND = this.nodeMap.get(kind);
    this.node[kind] = (...args) => {
      return new KIND(THIS, ...args);
    };
  }
  /**
   * @override
   */
  getNodeClass(kind) {
    return this.nodeMap.get(kind);
  }
  /**
   * @override
   */
  deleteNodeClass(kind) {
    this.nodeMap.delete(kind);
    delete this.node[kind];
  }
  /**
   * @override
   */
  nodeIsKind(node, kind) {
    return node instanceof this.getNodeClass(kind);
  }
  /**
   * @override
   */
  getKinds() {
    return Array.from(this.nodeMap.keys());
  }
};

// node_modules/mathjax-full/ts/core/Tree/NodeFactory.ts
var AbstractNodeFactory = class extends AbstractFactory {
  /**
   * @override
   */
  create(kind, properties = {}, children = []) {
    return this.node[kind](properties, children);
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/Attributes.ts
var INHERIT = "_inherit_";
var Attributes = class {
  /**
   * @param {PropertyList} defaults  The defaults for this node type
   * @param {PropertyList} global    The global properties (from the math node)
   *
   * @constructor
   */
  constructor(defaults, global) {
    this.global = global;
    this.defaults = Object.create(global);
    this.inherited = Object.create(this.defaults);
    this.attributes = Object.create(this.inherited);
    Object.assign(this.defaults, defaults);
  }
  /**
   * @param {string} name     The name of the attribute to set
   * @param {Property} value  The value to give the named attribute
   */
  set(name, value) {
    this.attributes[name] = value;
  }
  /**
   * @param {PropertyList} list  An object containing the properties to set
   */
  setList(list) {
    Object.assign(this.attributes, list);
  }
  /**
   * @param {string} name  The name of the attribute whose value is to be returned
   * @return {Property}    The value of the named attribute (including inheritance and defaults)
   */
  get(name) {
    let value = this.attributes[name];
    if (value === INHERIT) {
      value = this.global[name];
    }
    return value;
  }
  /**
   * @param {string} name  The value of the attribute whose value is to be returned
   * @return {Property}    The attribute whose name was given if it is explicit on the
   *                       node (not inherited or defaulted), null otherwise
   */
  getExplicit(name) {
    if (!this.attributes.hasOwnProperty(name)) {
      return void 0;
    }
    return this.attributes[name];
  }
  /**
   * @param {string[]} names  The names of attributes whose values are to be returned
   * @return {PropertyList}   An object containing the attributes and their values
   */
  getList(...names) {
    let values = {};
    for (const name of names) {
      values[name] = this.get(name);
    }
    return values;
  }
  /**
   * @param {string} name  The name of an inherited attribute to be set
   * @param {Property} value  The value to assign to the named attribute
   */
  setInherited(name, value) {
    this.inherited[name] = value;
  }
  /**
   * @param {string} name  The name of an inherited attribute whose value is to be returned
   * @return {Property}    The value of the named attribute if it is inherited, null otherwise
   */
  getInherited(name) {
    return this.inherited[name];
  }
  /**
   * @param {string} name  The name of a default attribute whose value is to be returned
   * @return {Property}    The value of the named attribute if a default exists for it, null otherwise
   */
  getDefault(name) {
    return this.defaults[name];
  }
  /**
   * @param {string} name  The name of a attribute to check
   * @return {boolean}     True if attribute is set explicitly or inherited
   *                         from an explicit mstyle or math attribute
   */
  isSet(name) {
    return this.attributes.hasOwnProperty(name) || this.inherited.hasOwnProperty(name);
  }
  /**
   * @param {string} name  The name of an attribute to test for the existence of a default
   * @return {boolean}     True of there is a default for the named attribute, false otherwise
   */
  hasDefault(name) {
    return name in this.defaults;
  }
  /**
   * @return {string[]}  The names of all the attributes explicitly set on the node
   */
  getExplicitNames() {
    return Object.keys(this.attributes);
  }
  /**
   * @return {string[]}  The names of all the inherited attributes for the node
   */
  getInheritedNames() {
    return Object.keys(this.inherited);
  }
  /**
   * @return {string[]}  The names of all the default attributes for the node
   */
  getDefaultNames() {
    return Object.keys(this.defaults);
  }
  /**
   * @return {string[]}  The names of all the global attributes
   */
  getGlobalNames() {
    return Object.keys(this.global);
  }
  /**
   * @return {PropertyList}  The attribute object
   */
  getAllAttributes() {
    return this.attributes;
  }
  /**
   * @return {PropertyList}  The inherited object
   */
  getAllInherited() {
    return this.inherited;
  }
  /**
   * @return {PropertyList}  The defaults object
   */
  getAllDefaults() {
    return this.defaults;
  }
  /**
   * @return {PropertyList}  The global object
   */
  getAllGlobals() {
    return this.global;
  }
};

// node_modules/mathjax-full/ts/core/Tree/Node.ts
var AbstractNode = class {
  /**
   * @param {NodeFactory} factory  The NodeFactory to use to create new nodes when needed
   * @param {PropertyList} properties  Any properties to be added to the node, if any
   * @param {Node[]} children  The initial child nodes, if any
   *
   * @constructor
   * @implements {Node}
   */
  constructor(factory, properties = {}, children = []) {
    this.factory = factory;
    /**
     * The parent node for this one
     */
    this.parent = null;
    /**
     * The properties for this node
     */
    this.properties = {};
    /**
     * The children for this node
     */
    this.childNodes = [];
    for (const name of Object.keys(properties)) {
      this.setProperty(name, properties[name]);
    }
    if (children.length) {
      this.setChildren(children);
    }
  }
  /**
   * @override
   */
  get kind() {
    return "unknown";
  }
  /**
   * @override
   */
  setProperty(name, value) {
    this.properties[name] = value;
  }
  /**
   * @override
   */
  getProperty(name) {
    return this.properties[name];
  }
  /**
   * @override
   */
  getPropertyNames() {
    return Object.keys(this.properties);
  }
  /**
   * @override
   */
  getAllProperties() {
    return this.properties;
  }
  /**
   * @override
   */
  removeProperty(...names) {
    for (const name of names) {
      delete this.properties[name];
    }
  }
  /**
   * @override
   */
  isKind(kind) {
    return this.factory.nodeIsKind(this, kind);
  }
  /**
   * @override
   */
  setChildren(children) {
    this.childNodes = [];
    for (let child of children) {
      this.appendChild(child);
    }
  }
  /**
   * @override
   */
  appendChild(child) {
    this.childNodes.push(child);
    child.parent = this;
    return child;
  }
  /**
   * @override
   */
  replaceChild(newChild, oldChild) {
    let i = this.childIndex(oldChild);
    if (i !== null) {
      this.childNodes[i] = newChild;
      newChild.parent = this;
      oldChild.parent = null;
    }
    return newChild;
  }
  /**
   * @override
   */
  removeChild(child) {
    const i = this.childIndex(child);
    if (i !== null) {
      this.childNodes.splice(i, 1);
      child.parent = null;
    }
    return child;
  }
  /**
   * @override
   */
  childIndex(node) {
    let i = this.childNodes.indexOf(node);
    return i === -1 ? null : i;
  }
  /**
   * @override
   */
  copy() {
    const node = this.factory.create(this.kind);
    node.properties = { ...this.properties };
    for (const child of this.childNodes || []) {
      if (child) {
        node.appendChild(child.copy());
      }
    }
    return node;
  }
  /**
   * @override
   */
  findNodes(kind) {
    let nodes = [];
    this.walkTree((node) => {
      if (node.isKind(kind)) {
        nodes.push(node);
      }
    });
    return nodes;
  }
  /**
   * @override
   */
  walkTree(func, data) {
    func(this, data);
    for (const child of this.childNodes) {
      if (child) {
        child.walkTree(func, data);
      }
    }
    return data;
  }
  /**
   * Simple string version for debugging, just to get the structure.
   */
  toString() {
    return this.kind + "(" + this.childNodes.join(",") + ")";
  }
};
var AbstractEmptyNode = class extends AbstractNode {
  /**
   *  We don't have children, so ignore these methods
   */
  /**
   * @override
   */
  setChildren(_children) {
  }
  /**
   * @override
   */
  appendChild(child) {
    return child;
  }
  /**
   * @override
   */
  replaceChild(_newChild, oldChild) {
    return oldChild;
  }
  /**
   * @override
   */
  childIndex(_node) {
    return null;
  }
  /**
   * Don't step into children (there aren't any)
   *
   * @override
   */
  walkTree(func, data) {
    func(this, data);
    return data;
  }
  /**
   * Simple string version for debugging, just to get the structure.
   */
  toString() {
    return this.kind;
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNode.ts
var TEXCLASS = {
  ORD: 0,
  OP: 1,
  BIN: 2,
  REL: 3,
  OPEN: 4,
  CLOSE: 5,
  PUNCT: 6,
  INNER: 7,
  VCENTER: 8,
  // Used in TeXAtom, but not for spacing
  NONE: -1
};
var TEXCLASSNAMES = ["ORD", "OP", "BIN", "REL", "OPEN", "CLOSE", "PUNCT", "INNER", "VCENTER"];
var TEXSPACELENGTH = ["", "thinmathspace", "mediummathspace", "thickmathspace"];
var TEXSPACE = [
  [0, -1, 2, 3, 0, 0, 0, 1],
  // ORD
  [-1, -1, 0, 3, 0, 0, 0, 1],
  // OP
  [2, 2, 0, 0, 2, 0, 0, 2],
  // BIN
  [3, 3, 0, 0, 3, 0, 0, 3],
  // REL
  [0, 0, 0, 0, 0, 0, 0, 0],
  // OPEN
  [0, -1, 2, 3, 0, 0, 0, 1],
  // CLOSE
  [1, 1, 0, 1, 1, 1, 1, 1],
  // PUNCT
  [1, -1, 2, 3, 1, 0, 1, 1]
  // INNER
];
var indentAttributes = [
  "indentalign",
  "indentalignfirst",
  "indentshift",
  "indentshiftfirst"
];
var AbstractMmlNode = class _AbstractMmlNode extends AbstractNode {
  /**
   *  Create an MmlNode:
   *    If the arity is -1, add the inferred row (created by the factory)
   *    Add the children, if any
   *    Create the Attribute object from the class defaults and the global defaults (the math node defaults)
   *
   *  @override
   */
  constructor(factory, attributes = {}, children = []) {
    super(factory);
    /*
     * These default to being unset (the node doesn't participate in spacing calculations).
     * The correct values are produced when the setTeXclass() method is called on the tree.
     */
    /**
     * The TeX class for the preceding node
     */
    this.prevClass = null;
    /**
     * The scriptlevel of the preceding node
     */
    this.prevLevel = null;
    /**
     * The TeX class of this node (obtained via texClass below)
     */
    this.texclass = null;
    if (this.arity < 0) {
      this.childNodes = [factory.create("inferredMrow")];
      this.childNodes[0].parent = this;
    }
    this.setChildren(children);
    this.attributes = new Attributes(
      factory.getNodeClass(this.kind).defaults,
      factory.getNodeClass("math").defaults
    );
    this.attributes.setList(attributes);
  }
  static {
    /**
     * The properties common to all MathML nodes
     */
    this.defaults = {
      mathbackground: INHERIT,
      mathcolor: INHERIT,
      mathsize: INHERIT,
      // technically only for token elements, but <mstyle mathsize="..."> should
      //    scale all spaces, fractions, etc.
      dir: INHERIT
    };
  }
  static {
    /**
     *  This lists properties that do NOT get inherited between specific kinds
     *  of nodes.  The outer keys are the node kinds that are being inherited FROM,
     *  while the second level of keys are the nodes that INHERIT the values.  Any
     *  property appearing in the innermost list is NOT inherited by the pair.
     *
     *  For example, an mpadded element will not inherit a width attribute from an mstyle node.
     */
    this.noInherit = {
      mstyle: {
        mpadded: { width: true, height: true, depth: true, lspace: true, voffset: true },
        mtable: { width: true, height: true, depth: true, align: true }
      },
      maligngroup: {
        mrow: { groupalign: true },
        mtable: { groupalign: true }
      }
    };
  }
  static {
    /**
     * This lists the attributes that should always be inherited,
     *   even when there is no default value for the attribute.
     */
    this.alwaysInherit = {
      scriptminsize: true,
      scriptsizemultiplier: true
    };
  }
  static {
    /**
     * This is the list of options for the verifyTree() method
     */
    this.verifyDefaults = {
      checkArity: true,
      checkAttributes: false,
      fullErrors: false,
      fixMmultiscripts: true,
      fixMtables: true
    };
  }
  /**
   * @override
   *
   * @param {boolean} keepIds   True to copy id attributes, false to skip them.
   *                              (May cause error in the future, since not part of the interface.)
   * @return {AbstractMmlNode}  The copied node tree.
   */
  copy(keepIds = false) {
    const node = this.factory.create(this.kind);
    node.properties = { ...this.properties };
    if (this.attributes) {
      const attributes = this.attributes.getAllAttributes();
      for (const name of Object.keys(attributes)) {
        if (name !== "id" || keepIds) {
          node.attributes.set(name, attributes[name]);
        }
      }
    }
    if (this.childNodes && this.childNodes.length) {
      let children = this.childNodes;
      if (children.length === 1 && children[0].isInferred) {
        children = children[0].childNodes;
      }
      for (const child of children) {
        if (child) {
          node.appendChild(child.copy());
        } else {
          node.childNodes.push(null);
        }
      }
    }
    return node;
  }
  /**
   * The TeX class for this node
   */
  get texClass() {
    return this.texclass;
  }
  /**
   * The TeX class for this node
   */
  set texClass(texClass) {
    this.texclass = texClass;
  }
  /**
   * @return {boolean}  true if this is a token node
   */
  get isToken() {
    return false;
  }
  /**
   * @return {boolean}  true if this is an embellished operator
   */
  get isEmbellished() {
    return false;
  }
  /**
   * @return {boolean}  true if this is a space-like node
   */
  get isSpacelike() {
    return false;
  }
  /**
   * @return {boolean}  true if this is a node that supports linebreaks in its children
   */
  get linebreakContainer() {
    return false;
  }
  /**
   * @return {boolean}  true if this node contains a line break
   */
  get hasNewLine() {
    return false;
  }
  /**
   * @return {number}  The number of children allowed, or Infinity for any number,
   *                   or -1 for when an inferred row is needed for the children.
   *                   Special case is 1, meaning at least one (other numbers
   *                   mean exactly that many).
   */
  get arity() {
    return Infinity;
  }
  /**
   * @return {boolean}  true if this is an inferred mrow
   */
  get isInferred() {
    return false;
  }
  /**
   * @return {MmlNode}  The logical parent of this node (skipping over inferred rows
   *                      some other node types)
   */
  get Parent() {
    let parent = this.parent;
    while (parent && parent.notParent) {
      parent = parent.Parent;
    }
    return parent;
  }
  /**
   * @return {boolean}  true if this is a node that doesn't count as a parent node in Parent()
   */
  get notParent() {
    return false;
  }
  /**
   * If there is an inferred row, the the children of that instead
   *
   * @override
   */
  setChildren(children) {
    if (this.arity < 0) {
      return this.childNodes[0].setChildren(children);
    }
    return super.setChildren(children);
  }
  /**
   * If there is an inferred row, append to that instead.
   * If a child is inferred, append its children instead.
   *
   * @override
   */
  appendChild(child) {
    if (this.arity < 0) {
      this.childNodes[0].appendChild(child);
      return child;
    }
    if (child.isInferred) {
      if (this.arity === Infinity) {
        child.childNodes.forEach((node) => super.appendChild(node));
        return child;
      }
      const original = child;
      child = this.factory.create("mrow");
      child.setChildren(original.childNodes);
      child.attributes = original.attributes;
      for (const name of original.getPropertyNames()) {
        child.setProperty(name, original.getProperty(name));
      }
    }
    return super.appendChild(child);
  }
  /**
   * If there is an inferred row, remove the child from there
   *
   * @override
   */
  replaceChild(newChild, oldChild) {
    if (this.arity < 0) {
      this.childNodes[0].replaceChild(newChild, oldChild);
      return newChild;
    }
    return super.replaceChild(newChild, oldChild);
  }
  /**
   * @override
   */
  core() {
    return this;
  }
  /**
   * @override
   */
  coreMO() {
    return this;
  }
  /**
   * @override
   */
  coreIndex() {
    return 0;
  }
  /**
   * @override
   */
  childPosition() {
    let child = this;
    let parent = child.parent;
    while (parent && parent.notParent) {
      child = parent;
      parent = parent.parent;
    }
    if (parent) {
      let i = 0;
      for (const node of parent.childNodes) {
        if (node === child) {
          return i;
        }
        i++;
      }
    }
    return null;
  }
  /**
   * @override
   */
  setTeXclass(prev) {
    this.getPrevClass(prev);
    return this.texClass != null ? this : prev;
  }
  /**
   * For embellished operators, get the data from the core and clear the core
   *
   * @param {MmlNode} core  The core <mo> for this node
   */
  updateTeXclass(core) {
    if (core) {
      this.prevClass = core.prevClass;
      this.prevLevel = core.prevLevel;
      core.prevClass = core.prevLevel = null;
      this.texClass = core.texClass;
    }
  }
  /**
   * Get the previous element's texClass and scriptlevel
   *
   * @param {MmlNode} prev  The previous node to this one
   */
  getPrevClass(prev) {
    if (prev) {
      this.prevClass = prev.texClass;
      this.prevLevel = prev.attributes.get("scriptlevel");
    }
  }
  /**
   * @return {string}  returns the spacing to use before this node
   */
  texSpacing() {
    let prevClass = this.prevClass != null ? this.prevClass : TEXCLASS.NONE;
    let texClass = this.texClass || TEXCLASS.ORD;
    if (prevClass === TEXCLASS.NONE || texClass === TEXCLASS.NONE) {
      return "";
    }
    if (prevClass === TEXCLASS.VCENTER) {
      prevClass = TEXCLASS.ORD;
    }
    if (texClass === TEXCLASS.VCENTER) {
      texClass = TEXCLASS.ORD;
    }
    let space = TEXSPACE[prevClass][texClass];
    if ((this.prevLevel > 0 || this.attributes.get("scriptlevel") > 0) && space >= 0) {
      return "";
    }
    return TEXSPACELENGTH[Math.abs(space)];
  }
  /**
   * @return {boolean}  The core mo element has an explicit 'form' attribute
   */
  hasSpacingAttributes() {
    return this.isEmbellished && this.coreMO().hasSpacingAttributes();
  }
  /**
   * Sets the inherited propertis for this node, and pushes inherited properties to the children
   *
   *   For each inheritable attribute:
   *     If the node has a default for this attribute, try to inherit it
   *       but check if the noInherit object prevents that.
   *   If the node doesn't have an explicit displaystyle, inherit it
   *   If the node doesn't have an explicit scriptstyle, inherit it
   *   If the prime style is true, set it as a property (it is not a MathML attribute)
   *   Check that the number of children is correct
   *   Finally, push any inherited attributes to teh children.
   *
   * @override
   */
  setInheritedAttributes(attributes = {}, display = false, level = 0, prime = false) {
    let defaults = this.attributes.getAllDefaults();
    for (const key of Object.keys(attributes)) {
      if (defaults.hasOwnProperty(key) || _AbstractMmlNode.alwaysInherit.hasOwnProperty(key)) {
        let [node, value] = attributes[key];
        let noinherit = (_AbstractMmlNode.noInherit[node] || {})[this.kind] || {};
        if (!noinherit[key]) {
          this.attributes.setInherited(key, value);
        }
      }
    }
    let displaystyle = this.attributes.getExplicit("displaystyle");
    if (displaystyle === void 0) {
      this.attributes.setInherited("displaystyle", display);
    }
    let scriptlevel = this.attributes.getExplicit("scriptlevel");
    if (scriptlevel === void 0) {
      this.attributes.setInherited("scriptlevel", level);
    }
    if (prime) {
      this.setProperty("texprimestyle", prime);
    }
    let arity = this.arity;
    if (arity >= 0 && arity !== Infinity && (arity === 1 && this.childNodes.length === 0 || arity !== 1 && this.childNodes.length !== arity)) {
      if (arity < this.childNodes.length) {
        this.childNodes = this.childNodes.slice(0, arity);
      } else {
        while (this.childNodes.length < arity) {
          this.appendChild(this.factory.create("mrow"));
        }
      }
    }
    this.setChildInheritedAttributes(attributes, display, level, prime);
  }
  /**
   * Apply inherited attributes to all children
   * (Some classes override this to handle changes in displaystyle and scriptlevel)
   *
   * @param {AttributeList} attributes  The list of inheritable attributes (with the node kinds
   *                                    from which they came)
   * @param {boolean} display           The displaystyle to inherit
   * @param {number} level              The scriptlevel to inherit
   * @param {boolean} prime             The TeX prime style to inherit (T vs. T', etc).
   */
  setChildInheritedAttributes(attributes, display, level, prime) {
    for (const child of this.childNodes) {
      child.setInheritedAttributes(attributes, display, level, prime);
    }
  }
  /**
   * Used by subclasses to add their own attributes to the inherited list
   * (e.g., mstyle uses this to augment the inherited attibutes)
   *
   * @param {AttributeList} current    The current list of inherited attributes
   * @param {PropertyList} attributes  The new attributes to add into the list
   */
  addInheritedAttributes(current, attributes) {
    let updated = { ...current };
    for (const name of Object.keys(attributes)) {
      if (name !== "displaystyle" && name !== "scriptlevel" && name !== "style") {
        updated[name] = [this.kind, attributes[name]];
      }
    }
    return updated;
  }
  /**
   * Set the nodes inherited attributes based on the attributes of the given node
   *   (used for creating extra nodes in the tree after setInheritedAttributes has already run)
   *
   * @param {MmlNode} node   The node whose attributes are to be used as a template
   */
  inheritAttributesFrom(node) {
    const attributes = node.attributes;
    const display = attributes.get("displaystyle");
    const scriptlevel = attributes.get("scriptlevel");
    const defaults = !attributes.isSet("mathsize") ? {} : {
      mathsize: ["math", attributes.get("mathsize")]
    };
    const prime = node.getProperty("texprimestyle") || false;
    this.setInheritedAttributes(defaults, display, scriptlevel, prime);
  }
  /**
   * Verify the attributes, and that there are the right number of children.
   * Then verify the children.
   *
   * @param {PropertyList} options   The options telling how much to verify
   */
  verifyTree(options2 = null) {
    if (options2 === null) {
      return;
    }
    this.verifyAttributes(options2);
    let arity = this.arity;
    if (options2["checkArity"]) {
      if (arity >= 0 && arity !== Infinity && (arity === 1 && this.childNodes.length === 0 || arity !== 1 && this.childNodes.length !== arity)) {
        this.mError('Wrong number of children for "' + this.kind + '" node', options2, true);
      }
    }
    this.verifyChildren(options2);
  }
  /**
   * Verify that all the attributes are valid (i.e., have defaults)
   *
   * @param {PropertyList} options   The options telling how much to verify
   */
  verifyAttributes(options2) {
    if (options2["checkAttributes"]) {
      const attributes = this.attributes;
      const bad = [];
      for (const name of attributes.getExplicitNames()) {
        if (name.substr(0, 5) !== "data-" && attributes.getDefault(name) === void 0 && !name.match(/^(?:class|style|id|(?:xlink:)?href)$/)) {
          bad.push(name);
        }
      }
      if (bad.length) {
        this.mError("Unknown attributes for " + this.kind + " node: " + bad.join(", "), options2);
      }
    }
  }
  /**
   * Verify the children.
   *
   * @param {PropertyList} options   The options telling how much to verify
   */
  verifyChildren(options2) {
    for (const child of this.childNodes) {
      child.verifyTree(options2);
    }
  }
  /**
   * Replace the current node with an error message (or the name of the node)
   *
   * @param {string} message         The error message to use
   * @param {PropertyList} options   The options telling how much to verify
   * @param {boolean} short          True means use just the kind if not using full errors
   * @return {MmlNode}               The constructed merror
   */
  mError(message, options2, short = false) {
    if (this.parent && this.parent.isKind("merror")) {
      return null;
    }
    let merror = this.factory.create("merror");
    merror.attributes.set("data-mjx-message", message);
    if (options2["fullErrors"] || short) {
      let mtext = this.factory.create("mtext");
      let text = this.factory.create("text");
      text.setText(options2["fullErrors"] ? message : this.kind);
      mtext.appendChild(text);
      merror.appendChild(mtext);
      this.parent.replaceChild(merror, this);
    } else {
      this.parent.replaceChild(merror, this);
      merror.appendChild(this);
    }
    return merror;
  }
};
var AbstractMmlTokenNode = class extends AbstractMmlNode {
  static {
    /**
     * Add the attributes common to all token nodes
     */
    this.defaults = {
      ...AbstractMmlNode.defaults,
      mathvariant: "normal",
      mathsize: INHERIT
    };
  }
  /**
   * @override
   */
  get isToken() {
    return true;
  }
  /**
   * Get the text of the token node (skipping mglyphs, and combining
   *   multiple text nodes)
   */
  getText() {
    let text = "";
    for (const child of this.childNodes) {
      if (child instanceof TextNode) {
        text += child.getText();
      }
    }
    return text;
  }
  /**
   * Only inherit to child nodes that are AbstractMmlNodes (not TextNodes)
   *
   * @override
   */
  setChildInheritedAttributes(attributes, display, level, prime) {
    for (const child of this.childNodes) {
      if (child instanceof AbstractMmlNode) {
        child.setInheritedAttributes(attributes, display, level, prime);
      }
    }
  }
  /**
   * Only step into children that are AbstractMmlNodes (not TextNodes)
   * @override
   */
  walkTree(func, data) {
    func(this, data);
    for (const child of this.childNodes) {
      if (child instanceof AbstractMmlNode) {
        child.walkTree(func, data);
      }
    }
    return data;
  }
};
var AbstractMmlLayoutNode = class extends AbstractMmlNode {
  static {
    /**
     * Use the same defaults as AbstractMmlNodes
     */
    this.defaults = AbstractMmlNode.defaults;
  }
  /**
   * @override
   */
  get isSpacelike() {
    return this.childNodes[0].isSpacelike;
  }
  /**
   * @override
   */
  get isEmbellished() {
    return this.childNodes[0].isEmbellished;
  }
  /**
   * @override
   */
  get arity() {
    return -1;
  }
  /**
   * @override
   */
  core() {
    return this.childNodes[0];
  }
  /**
   * @override
   */
  coreMO() {
    return this.childNodes[0].coreMO();
  }
  /**
   * @override
   */
  setTeXclass(prev) {
    prev = this.childNodes[0].setTeXclass(prev);
    this.updateTeXclass(this.childNodes[0]);
    return prev;
  }
};
var AbstractMmlBaseNode = class extends AbstractMmlNode {
  static {
    /**
     * Use the same defaults as AbstractMmlNodes
     */
    this.defaults = AbstractMmlNode.defaults;
  }
  /**
   * @override
   */
  get isEmbellished() {
    return this.childNodes[0].isEmbellished;
  }
  /**
   * @override
   */
  core() {
    return this.childNodes[0];
  }
  /**
   * @override
   */
  coreMO() {
    return this.childNodes[0].coreMO();
  }
  /**
   * @override
   */
  setTeXclass(prev) {
    this.getPrevClass(prev);
    this.texClass = TEXCLASS.ORD;
    let base = this.childNodes[0];
    if (base) {
      if (this.isEmbellished || base.isKind("mi")) {
        prev = base.setTeXclass(prev);
        this.updateTeXclass(this.core());
      } else {
        base.setTeXclass(null);
        prev = this;
      }
    } else {
      prev = this;
    }
    for (const child of this.childNodes.slice(1)) {
      if (child) {
        child.setTeXclass(null);
      }
    }
    return prev;
  }
};
var AbstractMmlEmptyNode = class extends AbstractEmptyNode {
  /**
   * @return {boolean}  Not a token element
   */
  get isToken() {
    return false;
  }
  /**
   * @return {boolean}  Not embellished
   */
  get isEmbellished() {
    return false;
  }
  /**
   * @return {boolean}  Not space-like
   */
  get isSpacelike() {
    return false;
  }
  /**
   * @return {boolean}  Not a container of any kind
   */
  get linebreakContainer() {
    return false;
  }
  /**
   * @return {boolean}  Does not contain new lines
   */
  get hasNewLine() {
    return false;
  }
  /**
   * @return {number}  No children
   */
  get arity() {
    return 0;
  }
  /**
   * @return {boolean}  Is not an inferred row
   */
  get isInferred() {
    return false;
  }
  /**
   * @return {boolean}  Is not a container element
   */
  get notParent() {
    return false;
  }
  /**
   * @return {MmlNode}  Parent is the actual parent
   */
  get Parent() {
    return this.parent;
  }
  /**
   * @return {number}  No TeX class
   */
  get texClass() {
    return TEXCLASS.NONE;
  }
  /**
   * @return {number}  No previous element
   */
  get prevClass() {
    return TEXCLASS.NONE;
  }
  /**
   * @return {number}  No previous element
   */
  get prevLevel() {
    return 0;
  }
  /**
   * @return {boolean}  The core mo element has an explicit 'form' attribute
   */
  hasSpacingAttributes() {
    return false;
  }
  /**
   * return {Attributes}  No attributes, so don't store one
   */
  get attributes() {
    return null;
  }
  /**
   * @override
   */
  core() {
    return this;
  }
  /**
   * @override
   */
  coreMO() {
    return this;
  }
  /**
   * @override
   */
  coreIndex() {
    return 0;
  }
  /**
   * @override
   */
  childPosition() {
    return 0;
  }
  /**
   * @override
   */
  setTeXclass(prev) {
    return prev;
  }
  /**
   * @override
   */
  texSpacing() {
    return "";
  }
  /**
   * No children or attributes, so ignore this call.
   *
   * @override
   */
  setInheritedAttributes(_attributes, _display, _level, _prime) {
  }
  /**
   * No children or attributes, so ignore this call.
   *
   * @override
   */
  inheritAttributesFrom(_node) {
  }
  /**
   * No children or attributes, so ignore this call.
   *
   * @param {PropertyList} options  The options for the check
   */
  verifyTree(_options) {
  }
  /**
   *  @override
   */
  mError(_message, _options, _short = false) {
    return null;
  }
};
var TextNode = class extends AbstractMmlEmptyNode {
  constructor() {
    super(...arguments);
    /**
     * The text for this node
     */
    this.text = "";
  }
  /**
   * @override
   */
  get kind() {
    return "text";
  }
  /**
   * @return {string}  Return the node's text
   */
  getText() {
    return this.text;
  }
  /**
   * @param {string} text  The text to use for the node
   * @return {TextNode}  The text node (for chaining of method calls)
   */
  setText(text) {
    this.text = text;
    return this;
  }
  /**
   * @override
   */
  copy() {
    return this.factory.create(this.kind).setText(this.getText());
  }
  /**
   * Just use the text
   */
  toString() {
    return this.text;
  }
};
var XMLNode = class extends AbstractMmlEmptyNode {
  constructor() {
    super(...arguments);
    /**
     * The XML content for this node
     */
    this.xml = null;
    /**
     * DOM adaptor for the content
     */
    this.adaptor = null;
  }
  /**
   * @override
   */
  get kind() {
    return "XML";
  }
  /**
   * @return {Object}  Return the node's XML content
   */
  getXML() {
    return this.xml;
  }
  /**
   * @param {object} xml  The XML content to be saved
   * @param {DOMAdaptor} adaptor DOM adaptor for the content
   * @return {XMLNode}  The XML node (for chaining of method calls)
   */
  setXML(xml, adaptor2 = null) {
    this.xml = xml;
    this.adaptor = adaptor2;
    return this;
  }
  /**
   * @return {string}  The serialized XML content
   */
  getSerializedXML() {
    return this.adaptor.serializeXML(this.xml);
  }
  /**
   * @override
   */
  copy() {
    return this.factory.create(this.kind).setXML(this.adaptor.clone(this.xml));
  }
  /**
   * Just indicate that this is XML data
   */
  toString() {
    return "XML data";
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/math.ts
var MmlMath = class extends AbstractMmlLayoutNode {
  static {
    /**
     *  These are used as the defaults for any attributes marked INHERIT in other classes
     */
    this.defaults = {
      ...AbstractMmlLayoutNode.defaults,
      mathvariant: "normal",
      mathsize: "normal",
      mathcolor: "",
      // Should be 'black', but allow it to inherit from surrounding text
      mathbackground: "transparent",
      dir: "ltr",
      scriptlevel: 0,
      displaystyle: false,
      display: "inline",
      maxwidth: "",
      overflow: "linebreak",
      altimg: "",
      "altimg-width": "",
      "altimg-height": "",
      "altimg-valign": "",
      alttext: "",
      cdgroup: "",
      scriptsizemultiplier: 1 / Math.sqrt(2),
      scriptminsize: "8px",
      // Should be 8pt, but that's too big
      infixlinebreakstyle: "before",
      lineleading: "1ex",
      linebreakmultchar: "\u2062",
      // Invisible times
      indentshift: "auto",
      // Use user configuration
      indentalign: "auto",
      indenttarget: "",
      indentalignfirst: "indentalign",
      indentshiftfirst: "indentshift",
      indentalignlast: "indentalign",
      indentshiftlast: "indentshift"
    };
  }
  /**
   * @override
   */
  get kind() {
    return "math";
  }
  /**
   * Linebreaking can occur in math nodes
   * @override
   */
  get linebreakContainer() {
    return true;
  }
  /**
   * The attributes of math nodes are inherited, so add them into the list.
   * The displaystyle attribute comes from the display attribute if not given explicitly
   * The scriptlevel comes from the scriptlevel attribute or default
   *
   * @override
   */
  setChildInheritedAttributes(attributes, display, level, prime) {
    if (this.attributes.get("mode") === "display") {
      this.attributes.setInherited("display", "block");
    }
    attributes = this.addInheritedAttributes(attributes, this.attributes.getAllAttributes());
    display = !!this.attributes.get("displaystyle") || !this.attributes.get("displaystyle") && this.attributes.get("display") === "block";
    this.attributes.setInherited("displaystyle", display);
    level = this.attributes.get("scriptlevel") || this.constructor.defaults["scriptlevel"];
    super.setChildInheritedAttributes(attributes, display, level, prime);
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/mi.ts
var MmlMi = class _MmlMi extends AbstractMmlTokenNode {
  constructor() {
    super(...arguments);
    /**
     * TeX class is ORD
     */
    this.texclass = TEXCLASS.ORD;
  }
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlTokenNode.defaults
    };
  }
  static {
    /**
     * Pattern for operator names
     */
    this.operatorName = /^[a-z][a-z0-9]*$/i;
  }
  static {
    /**
     * Pattern for single-character texts
     */
    this.singleCharacter = /^[\uD800-\uDBFF]?.[\u0300-\u036F\u1AB0-\u1ABE\u1DC0-\u1DFF\u20D0-\u20EF]*$/;
  }
  /**
   * @override
   */
  get kind() {
    return "mi";
  }
  /**
   * Do the usual inheritance, then check the text length to see
   *   if mathvariant should be normal or italic.
   *
   * @override
   */
  setInheritedAttributes(attributes = {}, display = false, level = 0, prime = false) {
    super.setInheritedAttributes(attributes, display, level, prime);
    let text = this.getText();
    if (text.match(_MmlMi.singleCharacter) && !attributes.mathvariant) {
      this.attributes.setInherited("mathvariant", "italic");
    }
  }
  /**
   * Mark multi-character texts as OP rather than ORD for spacing purposes
   *
   * @override
   */
  setTeXclass(prev) {
    this.getPrevClass(prev);
    let name = this.getText();
    if (name.length > 1 && name.match(_MmlMi.operatorName) && this.attributes.get("mathvariant") === "normal" && this.getProperty("autoOP") === void 0 && this.getProperty("texClass") === void 0) {
      this.texClass = TEXCLASS.OP;
      this.setProperty("autoOP", true);
    }
    return this;
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/mn.ts
var MmlMn = class extends AbstractMmlTokenNode {
  constructor() {
    super(...arguments);
    /**
     * TeX class is ORD
     */
    this.texclass = TEXCLASS.ORD;
  }
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlTokenNode.defaults
    };
  }
  /**
   * @override
   */
  get kind() {
    return "mn";
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/OperatorDictionary.ts
function OPDEF(lspace, rspace, texClass = TEXCLASS.BIN, properties = null) {
  return [lspace, rspace, texClass, properties];
}
var MO = {
  ORD: OPDEF(0, 0, TEXCLASS.ORD),
  ORD11: OPDEF(1, 1, TEXCLASS.ORD),
  ORD21: OPDEF(2, 1, TEXCLASS.ORD),
  ORD02: OPDEF(0, 2, TEXCLASS.ORD),
  ORD55: OPDEF(5, 5, TEXCLASS.ORD),
  NONE: OPDEF(0, 0, TEXCLASS.NONE),
  OP: OPDEF(1, 2, TEXCLASS.OP, { largeop: true, movablelimits: true, symmetric: true }),
  OPFIXED: OPDEF(1, 2, TEXCLASS.OP, { largeop: true, movablelimits: true }),
  INTEGRAL: OPDEF(0, 1, TEXCLASS.OP, { largeop: true, symmetric: true }),
  INTEGRAL2: OPDEF(1, 2, TEXCLASS.OP, { largeop: true, symmetric: true }),
  BIN3: OPDEF(3, 3, TEXCLASS.BIN),
  BIN4: OPDEF(4, 4, TEXCLASS.BIN),
  BIN01: OPDEF(0, 1, TEXCLASS.BIN),
  BIN5: OPDEF(5, 5, TEXCLASS.BIN),
  TALLBIN: OPDEF(4, 4, TEXCLASS.BIN, { stretchy: true }),
  BINOP: OPDEF(4, 4, TEXCLASS.BIN, { largeop: true, movablelimits: true }),
  REL: OPDEF(5, 5, TEXCLASS.REL),
  REL1: OPDEF(1, 1, TEXCLASS.REL, { stretchy: true }),
  REL4: OPDEF(4, 4, TEXCLASS.REL),
  RELSTRETCH: OPDEF(5, 5, TEXCLASS.REL, { stretchy: true }),
  RELACCENT: OPDEF(5, 5, TEXCLASS.REL, { accent: true }),
  WIDEREL: OPDEF(5, 5, TEXCLASS.REL, { accent: true, stretchy: true }),
  OPEN: OPDEF(0, 0, TEXCLASS.OPEN, { fence: true, stretchy: true, symmetric: true }),
  CLOSE: OPDEF(0, 0, TEXCLASS.CLOSE, { fence: true, stretchy: true, symmetric: true }),
  INNER: OPDEF(0, 0, TEXCLASS.INNER),
  PUNCT: OPDEF(0, 3, TEXCLASS.PUNCT),
  ACCENT: OPDEF(0, 0, TEXCLASS.ORD, { accent: true }),
  WIDEACCENT: OPDEF(0, 0, TEXCLASS.ORD, { accent: true, stretchy: true })
};
var RANGES = [
  [32, 127, TEXCLASS.REL, "mo"],
  // Basic Latin
  [160, 191, TEXCLASS.ORD, "mo"],
  // Latin-1 Supplement symbols
  [192, 591, TEXCLASS.ORD, "mi"],
  // Latin-1 Supplement, Latin Extended-A, Latin Extended-B
  [688, 879, TEXCLASS.ORD, "mo"],
  // Spacing modifier letters, Combining Diacritical Marks
  [880, 6688, TEXCLASS.ORD, "mi"],
  // Greek and Coptic (through) Tai Tham
  [6832, 6911, TEXCLASS.ORD, "mo"],
  // Combining Diacritical Marks Extended
  [6912, 7615, TEXCLASS.ORD, "mi"],
  // Balinese (through) Phonetic Extensions Supplement
  [7616, 7679, TEXCLASS.ORD, "mo"],
  // Combining Diacritical Marks Supplement
  [7680, 8191, TEXCLASS.ORD, "mi"],
  // Latin Extended Additional, Greek Extended
  [8192, 8303, TEXCLASS.ORD, "mo"],
  // General Punctuation
  [8304, 8351, TEXCLASS.ORD, "mo"],
  // Superscript and Subscripts (through) Combining Diacritical Marks for Symbols
  [8448, 8527, TEXCLASS.ORD, "mi"],
  // Letterlike Symbols
  [8528, 8591, TEXCLASS.ORD, "mn"],
  // Number Forms
  [8592, 8703, TEXCLASS.REL, "mo"],
  // Arrows
  [8704, 8959, TEXCLASS.BIN, "mo"],
  // Mathematical Operators
  [8960, 9215, TEXCLASS.ORD, "mo"],
  // Miscellaneous Technical
  [9312, 9471, TEXCLASS.ORD, "mn"],
  // Enclosed Alphanumerics
  [9472, 10223, TEXCLASS.ORD, "mo"],
  // Box Drawing (though) Miscellaneous Math Symbols-A
  [10224, 10239, TEXCLASS.REL, "mo"],
  // Supplemental Arrows-A
  [10240, 10495, TEXCLASS.ORD, "mtext"],
  // Braille Patterns
  [10496, 10623, TEXCLASS.REL, "mo"],
  // Supplemental Arrows-B
  [10624, 10751, TEXCLASS.ORD, "mo"],
  // Miscellaneous Math Symbols-B
  [10752, 11007, TEXCLASS.BIN, "mo"],
  // Supplemental Math Operators
  [11008, 11055, TEXCLASS.ORD, "mo"],
  // Miscellaneous Symbols and Arrows
  [11056, 11087, TEXCLASS.REL, "mo"],
  //   Arrows from above
  [11088, 11263, TEXCLASS.ORD, "mo"],
  //   Rest of above
  [11264, 11744, TEXCLASS.ORD, "mi"],
  // Glagolitic (through) Ethipoc Extended
  [11776, 11903, TEXCLASS.ORD, "mo"],
  // Supplemental Punctuation
  [11904, 12255, TEXCLASS.ORD, "mi", "normal"],
  // CJK Radicals Supplement (through) Kangxi Radicals
  [12272, 12351, TEXCLASS.ORD, "mo"],
  // Ideographic Desc. Characters, CJK Symbols and Punctuation
  [12352, 42143, TEXCLASS.ORD, "mi", "normal"],
  // Hiragana (through) Yi Radicals
  [42192, 43055, TEXCLASS.ORD, "mi"],
  // Lisu (through) Syloti Nagri
  [43056, 43071, TEXCLASS.ORD, "mn"],
  // Common Indic Number FormsArabic Presentation Forms-A
  [43072, 55295, TEXCLASS.ORD, "mi"],
  // Phags-pa (though) Hangul Jamo Extended-B
  [63744, 64255, TEXCLASS.ORD, "mi", "normal"],
  // CJK Compatibility Ideographs
  [64256, 65023, TEXCLASS.ORD, "mi"],
  // Alphabetic Presentation Forms (though) Arabic Presentation Forms-A
  [65024, 65135, TEXCLASS.ORD, "mo"],
  // Variation Selector (through) Small Form Variants
  [65136, 65791, TEXCLASS.ORD, "mi"],
  // Arabic Presentation Forms-B (through) Linear B Ideograms
  [65792, 65935, TEXCLASS.ORD, "mn"],
  // Aegean Numbers, Ancient Greek Numbers
  [65936, 74751, TEXCLASS.ORD, "mi", "normal"],
  // Ancient Symbols (through) Cuneiform
  [74752, 74879, TEXCLASS.ORD, "mn"],
  // Cuneiform Numbers and Punctuation
  [74880, 113823, TEXCLASS.ORD, "mi", "normal"],
  // Early Dynastic Cuneiform (through) Duployan
  [113824, 119391, TEXCLASS.ORD, "mo"],
  // Shorthand Format Controls (through) TaiXuan Jing Symbols
  [119648, 119679, TEXCLASS.ORD, "mn"],
  // Counting Rod Numerals
  [119808, 120781, TEXCLASS.ORD, "mi"],
  // Math Alphanumeric Symbols
  [120782, 120831, TEXCLASS.ORD, "mn"],
  //   Numerals from above
  [122624, 129023, TEXCLASS.ORD, "mo"],
  // Mahjong Tiles (through) Geometric Shapes Extended
  [129024, 129279, TEXCLASS.REL, "mo"],
  // Supplemental Arrows-C
  [129280, 129535, TEXCLASS.ORD, "mo"],
  // Supplemental Symbols and Pictographs
  [131072, 195103, TEXCLASS.ORD, "mi", "normnal"]
  // CJK Unified Ideographs Ext. B (through) CJK Sompatibility Ideographs Supp.
];
function getRange(text) {
  const n = text.codePointAt(0);
  for (const range of RANGES) {
    if (n <= range[1]) {
      if (n >= range[0]) {
        return range;
      }
      break;
    }
  }
  return null;
}
var MMLSPACING = [
  [0, 0],
  // ORD
  [1, 2],
  // OP
  [3, 3],
  // BIN
  [4, 4],
  // REL
  [0, 0],
  // OPEN
  [0, 0],
  // CLOSE
  [0, 3]
  // PUNCT
];
var OPTABLE = {
  prefix: {
    "(": MO.OPEN,
    // left parenthesis
    "+": MO.BIN01,
    // plus sign
    "-": MO.BIN01,
    // hyphen-minus
    "[": MO.OPEN,
    // left square bracket
    "{": MO.OPEN,
    // left curly bracket
    "|": MO.OPEN,
    // vertical line
    "||": [0, 0, TEXCLASS.BIN, { fence: true, stretchy: true, symmetric: true }],
    // multiple character operator: ||
    "|||": [0, 0, TEXCLASS.ORD, { fence: true, stretchy: true, symmetric: true }],
    // multiple character operator: |||
    "¬": MO.ORD21,
    // not sign
    "±": MO.BIN01,
    // plus-minus sign
    "‖": [0, 0, TEXCLASS.ORD, { fence: true, stretchy: true }],
    // double vertical line
    "‘": [0, 0, TEXCLASS.OPEN, { fence: true }],
    // left single quotation mark
    "“": [0, 0, TEXCLASS.OPEN, { fence: true }],
    // left double quotation mark
    "ⅅ": MO.ORD21,
    // double-struck italic capital d
    "ⅆ": OPDEF(2, 0, TEXCLASS.ORD),
    // double-struck italic small d
    "∀": MO.ORD21,
    // for all
    "∂": MO.ORD21,
    // partial differential
    "∃": MO.ORD21,
    // there exists
    "∄": MO.ORD21,
    // there does not exist
    "∇": MO.ORD21,
    // nabla
    "∏": MO.OP,
    // n-ary product
    "∐": MO.OP,
    // n-ary coproduct
    "∑": MO.OP,
    // n-ary summation
    "−": MO.BIN01,
    // minus sign
    "∓": MO.BIN01,
    // minus-or-plus sign
    "√": [1, 1, TEXCLASS.ORD, { stretchy: true }],
    // square root
    "∛": MO.ORD11,
    // cube root
    "∜": MO.ORD11,
    // fourth root
    "∠": MO.ORD,
    // angle
    "∡": MO.ORD,
    // measured angle
    "∢": MO.ORD,
    // spherical angle
    "∫": MO.INTEGRAL,
    // integral
    "∬": MO.INTEGRAL,
    // double integral
    "∭": MO.INTEGRAL,
    // triple integral
    "∮": MO.INTEGRAL,
    // contour integral
    "∯": MO.INTEGRAL,
    // surface integral
    "∰": MO.INTEGRAL,
    // volume integral
    "∱": MO.INTEGRAL,
    // clockwise integral
    "∲": MO.INTEGRAL,
    // clockwise contour integral
    "∳": MO.INTEGRAL,
    // anticlockwise contour integral
    "⋀": MO.OP,
    // n-ary logical and
    "⋁": MO.OP,
    // n-ary logical or
    "⋂": MO.OP,
    // n-ary intersection
    "⋃": MO.OP,
    // n-ary union
    "⌈": MO.OPEN,
    // left ceiling
    "⌊": MO.OPEN,
    // left floor
    "〈": MO.OPEN,
    // left-pointing angle bracket
    "❲": MO.OPEN,
    // light left tortoise shell bracket ornament
    "⟦": MO.OPEN,
    // mathematical left white square bracket
    "⟨": MO.OPEN,
    // mathematical left angle bracket
    "⟪": MO.OPEN,
    // mathematical left double angle bracket
    "⟬": MO.OPEN,
    // mathematical left white tortoise shell bracket
    "⟮": MO.OPEN,
    // mathematical left flattened parenthesis
    "⦀": [0, 0, TEXCLASS.ORD, { fence: true, stretchy: true }],
    // triple vertical bar delimiter
    "⦃": MO.OPEN,
    // left white curly bracket
    "⦅": MO.OPEN,
    // left white parenthesis
    "⦇": MO.OPEN,
    // z notation left image bracket
    "⦉": MO.OPEN,
    // z notation left binding bracket
    "⦋": MO.OPEN,
    // left square bracket with underbar
    "⦍": MO.OPEN,
    // left square bracket with tick in top corner
    "⦏": MO.OPEN,
    // left square bracket with tick in bottom corner
    "⦑": MO.OPEN,
    // left angle bracket with dot
    "⦓": MO.OPEN,
    // left arc less-than bracket
    "⦕": MO.OPEN,
    // double left arc greater-than bracket
    "⦗": MO.OPEN,
    // left black tortoise shell bracket
    "⧼": MO.OPEN,
    // left-pointing curved angle bracket
    "⨀": MO.OP,
    // n-ary circled dot operator
    "⨁": MO.OP,
    // n-ary circled plus operator
    "⨂": MO.OP,
    // n-ary circled times operator
    "⨃": MO.OP,
    // n-ary union operator with dot
    "⨄": MO.OP,
    // n-ary union operator with plus
    "⨅": MO.OP,
    // n-ary square intersection operator
    "⨆": MO.OP,
    // n-ary square union operator
    "⨇": MO.OP,
    // two logical and operator
    "⨈": MO.OP,
    // two logical or operator
    "⨉": MO.OP,
    // n-ary times operator
    "⨊": MO.OP,
    // modulo two sum
    "⨋": MO.INTEGRAL2,
    // summation with integral
    "⨌": MO.INTEGRAL,
    // quadruple integral operator
    "⨍": MO.INTEGRAL2,
    // finite part integral
    "⨎": MO.INTEGRAL2,
    // integral with double stroke
    "⨏": MO.INTEGRAL2,
    // integral average with slash
    "⨐": MO.OP,
    // circulation function
    "⨑": MO.OP,
    // anticlockwise integration
    "⨒": MO.OP,
    // line integration with rectangular path around pole
    "⨓": MO.OP,
    // line integration with semicircular path around pole
    "⨔": MO.OP,
    // line integration not including the pole
    "⨕": MO.INTEGRAL2,
    // integral around a point operator
    "⨖": MO.INTEGRAL2,
    // quaternion integral operator
    "⨗": MO.INTEGRAL2,
    // integral with leftwards arrow with hook
    "⨘": MO.INTEGRAL2,
    // integral with times sign
    "⨙": MO.INTEGRAL2,
    // integral with intersection
    "⨚": MO.INTEGRAL2,
    // integral with union
    "⨛": MO.INTEGRAL2,
    // integral with overbar
    "⨜": MO.INTEGRAL2,
    // integral with underbar
    "⫼": MO.OP,
    // large triple vertical bar operator
    "⫿": MO.OP
    // n-ary white vertical bar
  },
  postfix: {
    "!!": OPDEF(1, 0),
    // multiple character operator: !!
    "!": [1, 0, TEXCLASS.CLOSE, null],
    // exclamation mark
    '"': MO.ACCENT,
    // quotation mark
    "&": MO.ORD,
    // ampersand
    ")": MO.CLOSE,
    // right parenthesis
    "++": OPDEF(0, 0),
    // multiple character operator: ++
    "--": OPDEF(0, 0),
    // multiple character operator: --
    "..": OPDEF(0, 0),
    // multiple character operator: ..
    "...": MO.ORD,
    // multiple character operator: ...
    "'": MO.ACCENT,
    // apostrophe
    "]": MO.CLOSE,
    // right square bracket
    "^": MO.WIDEACCENT,
    // circumflex accent
    "_": MO.WIDEACCENT,
    // low line
    "`": MO.ACCENT,
    // grave accent
    "|": MO.CLOSE,
    // vertical line
    "}": MO.CLOSE,
    // right curly bracket
    "~": MO.WIDEACCENT,
    // tilde
    "||": [0, 0, TEXCLASS.BIN, { fence: true, stretchy: true, symmetric: true }],
    // multiple character operator: ||
    "|||": [0, 0, TEXCLASS.ORD, { fence: true, stretchy: true, symmetric: true }],
    // multiple character operator: |||
    "¨": MO.ACCENT,
    // diaeresis
    "ª": MO.ACCENT,
    // feminie ordinal indicator
    "¯": MO.WIDEACCENT,
    // macron
    "°": MO.ORD,
    // degree sign
    "²": MO.ACCENT,
    // superscript 2
    "³": MO.ACCENT,
    // superscript 3
    "´": MO.ACCENT,
    // acute accent
    "¸": MO.ACCENT,
    // cedilla
    "¹": MO.ACCENT,
    // superscript 1
    "º": MO.ACCENT,
    // masculine ordinal indicator
    "ˆ": MO.WIDEACCENT,
    // modifier letter circumflex accent
    "ˇ": MO.WIDEACCENT,
    // caron
    "ˉ": MO.WIDEACCENT,
    // modifier letter macron
    "ˊ": MO.ACCENT,
    // modifier letter acute accent
    "ˋ": MO.ACCENT,
    // modifier letter grave accent
    "ˍ": MO.WIDEACCENT,
    // modifier letter low macron
    "˘": MO.ACCENT,
    // breve
    "˙": MO.ACCENT,
    // dot above
    "˚": MO.ACCENT,
    // ring above
    "˜": MO.WIDEACCENT,
    // small tilde
    "˝": MO.ACCENT,
    // double acute accent
    "˷": MO.WIDEACCENT,
    // modifier letter low tilde
    "̂": MO.WIDEACCENT,
    // combining circumflex accent
    "̑": MO.ACCENT,
    // combining inverted breve
    "϶": MO.REL,
    // greek reversed lunate epsilon symbol
    "‖": [0, 0, TEXCLASS.ORD, { fence: true, stretchy: true }],
    // double vertical line
    "’": [0, 0, TEXCLASS.CLOSE, { fence: true }],
    // right single quotation mark
    "‚": MO.ACCENT,
    // single low-9 quotation mark
    "‛": MO.ACCENT,
    // single high-reversed-9 quotation mark
    "”": [0, 0, TEXCLASS.CLOSE, { fence: true }],
    // right double quotation mark
    "„": MO.ACCENT,
    // double low-9 quotation mark
    "‟": MO.ACCENT,
    // double high-reversed-9 quotation mark
    "′": MO.ORD,
    // prime
    "″": MO.ACCENT,
    // double prime
    "‴": MO.ACCENT,
    // triple prime
    "‵": MO.ACCENT,
    // reversed prime
    "‶": MO.ACCENT,
    // reversed double prime
    "‷": MO.ACCENT,
    // reversed triple prime
    "‾": MO.WIDEACCENT,
    // overline
    "⁗": MO.ACCENT,
    // quadruple prime
    "⃛": MO.ACCENT,
    // combining three dots above
    "⃜": MO.ACCENT,
    // combining four dots above
    "⌉": MO.CLOSE,
    // right ceiling
    "⌋": MO.CLOSE,
    // right floor
    "〉": MO.CLOSE,
    // right-pointing angle bracket
    "⎴": MO.WIDEACCENT,
    // top square bracket
    "⎵": MO.WIDEACCENT,
    // bottom square bracket
    "⏜": MO.WIDEACCENT,
    // top parenthesis
    "⏝": MO.WIDEACCENT,
    // bottom parenthesis
    "⏞": MO.WIDEACCENT,
    // top curly bracket
    "⏟": MO.WIDEACCENT,
    // bottom curly bracket
    "⏠": MO.WIDEACCENT,
    // top tortoise shell bracket
    "⏡": MO.WIDEACCENT,
    // bottom tortoise shell bracket
    "■": MO.BIN3,
    // black square
    "□": MO.BIN3,
    // white square
    "▪": MO.BIN3,
    // black small square
    "▫": MO.BIN3,
    // white small square
    "▭": MO.BIN3,
    // white rectangle
    "▮": MO.BIN3,
    // black vertical rectangle
    "▯": MO.BIN3,
    // white vertical rectangle
    "▰": MO.BIN3,
    // black parallelogram
    "▱": MO.BIN3,
    // white parallelogram
    "▲": MO.BIN4,
    // black up-pointing triangle
    "▴": MO.BIN4,
    // black up-pointing small triangle
    "▶": MO.BIN4,
    // black right-pointing triangle
    "▷": MO.BIN4,
    // white right-pointing triangle
    "▸": MO.BIN4,
    // black right-pointing small triangle
    "▼": MO.BIN4,
    // black down-pointing triangle
    "▾": MO.BIN4,
    // black down-pointing small triangle
    "◀": MO.BIN4,
    // black left-pointing triangle
    "◁": MO.BIN4,
    // white left-pointing triangle
    "◂": MO.BIN4,
    // black left-pointing small triangle
    "◄": MO.BIN4,
    // black left-pointing pointer
    "◅": MO.BIN4,
    // white left-pointing pointer
    "◆": MO.BIN4,
    // black diamond
    "◇": MO.BIN4,
    // white diamond
    "◈": MO.BIN4,
    // white diamond containing black small diamond
    "◉": MO.BIN4,
    // fisheye
    "◌": MO.BIN4,
    // dotted circle
    "◍": MO.BIN4,
    // circle with vertical fill
    "◎": MO.BIN4,
    // bullseye
    "●": MO.BIN4,
    // black circle
    "◖": MO.BIN4,
    // left half black circle
    "◗": MO.BIN4,
    // right half black circle
    "◦": MO.BIN4,
    // white bullet
    "♭": MO.ORD02,
    // music flat sign
    "♮": MO.ORD02,
    // music natural sign
    "♯": MO.ORD02,
    // music sharp sign
    "❳": MO.CLOSE,
    // light right tortoise shell bracket ornament
    "⟧": MO.CLOSE,
    // mathematical right white square bracket
    "⟩": MO.CLOSE,
    // mathematical right angle bracket
    "⟫": MO.CLOSE,
    // mathematical right double angle bracket
    "⟭": MO.CLOSE,
    // mathematical right white tortoise shell bracket
    "⟯": MO.CLOSE,
    // mathematical right flattened parenthesis
    "⦀": [0, 0, TEXCLASS.ORD, { fence: true, stretchy: true }],
    // triple vertical bar delimiter
    "⦄": MO.CLOSE,
    // right white curly bracket
    "⦆": MO.CLOSE,
    // right white parenthesis
    "⦈": MO.CLOSE,
    // z notation right image bracket
    "⦊": MO.CLOSE,
    // z notation right binding bracket
    "⦌": MO.CLOSE,
    // right square bracket with underbar
    "⦎": MO.CLOSE,
    // right square bracket with tick in bottom corner
    "⦐": MO.CLOSE,
    // right square bracket with tick in top corner
    "⦒": MO.CLOSE,
    // right angle bracket with dot
    "⦔": MO.CLOSE,
    // right arc greater-than bracket
    "⦖": MO.CLOSE,
    // double right arc less-than bracket
    "⦘": MO.CLOSE,
    // right black tortoise shell bracket
    "⧽": MO.CLOSE
    // right-pointing curved angle bracket
  },
  infix: {
    "!=": MO.BIN4,
    // multiple character operator: !=
    "#": MO.ORD,
    // #
    "$": MO.ORD,
    // $
    "%": [3, 3, TEXCLASS.ORD, null],
    // percent sign
    "&&": MO.BIN4,
    // multiple character operator: &&
    "": MO.ORD,
    // empty <mo>
    "*": MO.BIN3,
    // asterisk
    "**": OPDEF(1, 1),
    // multiple character operator: **
    "*=": MO.BIN4,
    // multiple character operator: *=
    "+": MO.BIN4,
    // plus sign
    "+=": MO.BIN4,
    // multiple character operator: +=
    ",": [0, 3, TEXCLASS.PUNCT, { linebreakstyle: "after", separator: true }],
    // comma
    "-": MO.BIN4,
    // hyphen-minus
    "-=": MO.BIN4,
    // multiple character operator: -=
    "->": MO.BIN5,
    // multiple character operator: ->
    ".": [0, 3, TEXCLASS.PUNCT, { separator: true }],
    // \ldotp
    "/": MO.ORD11,
    // solidus
    "//": OPDEF(1, 1),
    // multiple character operator: //
    "/=": MO.BIN4,
    // multiple character operator: /=
    ":": [1, 2, TEXCLASS.REL, null],
    // colon
    ":=": MO.BIN4,
    // multiple character operator: :=
    ";": [0, 3, TEXCLASS.PUNCT, { linebreakstyle: "after", separator: true }],
    // semicolon
    "<": MO.REL,
    // less-than sign
    "<=": MO.BIN5,
    // multiple character operator: <=
    "<>": OPDEF(1, 1),
    // multiple character operator: <>
    "=": MO.REL,
    // equals sign
    "==": MO.BIN4,
    // multiple character operator: ==
    ">": MO.REL,
    // greater-than sign
    ">=": MO.BIN5,
    // multiple character operator: >=
    "?": [1, 1, TEXCLASS.CLOSE, null],
    // question mark
    "@": MO.ORD11,
    // commercial at
    "\\": MO.ORD,
    // reverse solidus
    "^": MO.ORD11,
    // circumflex accent
    "_": MO.ORD11,
    // low line
    "|": [2, 2, TEXCLASS.ORD, { fence: true, stretchy: true, symmetric: true }],
    // vertical line
    "||": [2, 2, TEXCLASS.BIN, { fence: true, stretchy: true, symmetric: true }],
    // multiple character operator: ||
    "|||": [2, 2, TEXCLASS.ORD, { fence: true, stretchy: true, symmetric: true }],
    // multiple character operator: |||
    "±": MO.BIN4,
    // plus-minus sign
    "·": MO.BIN4,
    // middle dot
    "×": MO.BIN4,
    // multiplication sign
    "÷": MO.BIN4,
    // division sign
    "ʹ": MO.ORD,
    // prime
    "̀": MO.ACCENT,
    // \grave
    "́": MO.ACCENT,
    // \acute
    "̃": MO.WIDEACCENT,
    // \tilde
    "̄": MO.ACCENT,
    // \bar
    "̆": MO.ACCENT,
    // \breve
    "̇": MO.ACCENT,
    // \dot
    "̈": MO.ACCENT,
    // \ddot
    "̌": MO.ACCENT,
    // \check
    "̲": MO.WIDEACCENT,
    // horizontal line
    "̸": MO.REL4,
    // \not
    "―": [0, 0, TEXCLASS.ORD, { stretchy: true }],
    // horizontal line
    "‗": [0, 0, TEXCLASS.ORD, { stretchy: true }],
    // horizontal line
    "†": MO.BIN3,
    // \dagger
    "‡": MO.BIN3,
    // \ddagger
    "•": MO.BIN4,
    // bullet
    "…": MO.INNER,
    // horizontal ellipsis
    "⁃": MO.BIN4,
    // hyphen bullet
    "⁄": MO.TALLBIN,
    // fraction slash
    "\u2061": MO.NONE,
    // function application
    "\u2062": MO.NONE,
    // invisible times
    "\u2063": [0, 0, TEXCLASS.NONE, { linebreakstyle: "after", separator: true }],
    // invisible separator
    "\u2064": MO.NONE,
    // invisible plus
    "⃗": MO.ACCENT,
    // \vec
    "ℑ": MO.ORD,
    // \Im
    "ℓ": MO.ORD,
    // \ell
    "℘": MO.ORD,
    // \wp
    "ℜ": MO.ORD,
    // \Re
    "←": MO.WIDEREL,
    // leftwards arrow
    "↑": MO.RELSTRETCH,
    // upwards arrow
    "→": MO.WIDEREL,
    // rightwards arrow
    "↓": MO.RELSTRETCH,
    // downwards arrow
    "↔": MO.WIDEREL,
    // left right arrow
    "↕": MO.RELSTRETCH,
    // up down arrow
    "↖": MO.RELSTRETCH,
    // north west arrow
    "↗": MO.RELSTRETCH,
    // north east arrow
    "↘": MO.RELSTRETCH,
    // south east arrow
    "↙": MO.RELSTRETCH,
    // south west arrow
    "↚": MO.RELACCENT,
    // leftwards arrow with stroke
    "↛": MO.RELACCENT,
    // rightwards arrow with stroke
    "↜": MO.WIDEREL,
    // leftwards wave arrow
    "↝": MO.WIDEREL,
    // rightwards wave arrow
    "↞": MO.WIDEREL,
    // leftwards two headed arrow
    "↟": MO.WIDEREL,
    // upwards two headed arrow
    "↠": MO.WIDEREL,
    // rightwards two headed arrow
    "↡": MO.RELSTRETCH,
    // downwards two headed arrow
    "↢": MO.WIDEREL,
    // leftwards arrow with tail
    "↣": MO.WIDEREL,
    // rightwards arrow with tail
    "↤": MO.WIDEREL,
    // leftwards arrow from bar
    "↥": MO.RELSTRETCH,
    // upwards arrow from bar
    "↦": MO.WIDEREL,
    // rightwards arrow from bar
    "↧": MO.RELSTRETCH,
    // downwards arrow from bar
    "↨": MO.RELSTRETCH,
    // up down arrow with base
    "↩": MO.WIDEREL,
    // leftwards arrow with hook
    "↪": MO.WIDEREL,
    // rightwards arrow with hook
    "↫": MO.WIDEREL,
    // leftwards arrow with loop
    "↬": MO.WIDEREL,
    // rightwards arrow with loop
    "↭": MO.WIDEREL,
    // left right wave arrow
    "↮": MO.RELACCENT,
    // left right arrow with stroke
    "↯": MO.RELSTRETCH,
    // downwards zigzag arrow
    "↰": MO.RELSTRETCH,
    // upwards arrow with tip leftwards
    "↱": MO.RELSTRETCH,
    // upwards arrow with tip rightwards
    "↲": MO.RELSTRETCH,
    // downwards arrow with tip leftwards
    "↳": MO.RELSTRETCH,
    // downwards arrow with tip rightwards
    "↴": MO.RELSTRETCH,
    // rightwards arrow with corner downwards
    "↵": MO.RELSTRETCH,
    // downwards arrow with corner leftwards
    "↶": MO.RELACCENT,
    // anticlockwise top semicircle arrow
    "↷": MO.RELACCENT,
    // clockwise top semicircle arrow
    "↸": MO.REL,
    // north west arrow to long bar
    "↹": MO.WIDEREL,
    // leftwards arrow to bar over rightwards arrow to bar
    "↺": MO.REL,
    // anticlockwise open circle arrow
    "↻": MO.REL,
    // clockwise open circle arrow
    "↼": MO.WIDEREL,
    // leftwards harpoon with barb upwards
    "↽": MO.WIDEREL,
    // leftwards harpoon with barb downwards
    "↾": MO.RELSTRETCH,
    // upwards harpoon with barb rightwards
    "↿": MO.RELSTRETCH,
    // upwards harpoon with barb leftwards
    "⇀": MO.WIDEREL,
    // rightwards harpoon with barb upwards
    "⇁": MO.WIDEREL,
    // rightwards harpoon with barb downwards
    "⇂": MO.RELSTRETCH,
    // downwards harpoon with barb rightwards
    "⇃": MO.RELSTRETCH,
    // downwards harpoon with barb leftwards
    "⇄": MO.WIDEREL,
    // rightwards arrow over leftwards arrow
    "⇅": MO.RELSTRETCH,
    // upwards arrow leftwards of downwards arrow
    "⇆": MO.WIDEREL,
    // leftwards arrow over rightwards arrow
    "⇇": MO.WIDEREL,
    // leftwards paired arrows
    "⇈": MO.RELSTRETCH,
    // upwards paired arrows
    "⇉": MO.WIDEREL,
    // rightwards paired arrows
    "⇊": MO.RELSTRETCH,
    // downwards paired arrows
    "⇋": MO.WIDEREL,
    // leftwards harpoon over rightwards harpoon
    "⇌": MO.WIDEREL,
    // rightwards harpoon over leftwards harpoon
    "⇍": MO.RELACCENT,
    // leftwards double arrow with stroke
    "⇎": MO.RELACCENT,
    // left right double arrow with stroke
    "⇏": MO.RELACCENT,
    // rightwards double arrow with stroke
    "⇐": MO.WIDEREL,
    // leftwards double arrow
    "⇑": MO.RELSTRETCH,
    // upwards double arrow
    "⇒": MO.WIDEREL,
    // rightwards double arrow
    "⇓": MO.RELSTRETCH,
    // downwards double arrow
    "⇔": MO.WIDEREL,
    // left right double arrow
    "⇕": MO.RELSTRETCH,
    // up down double arrow
    "⇖": MO.RELSTRETCH,
    // north west double arrow
    "⇗": MO.RELSTRETCH,
    // north east double arrow
    "⇘": MO.RELSTRETCH,
    // south east double arrow
    "⇙": MO.RELSTRETCH,
    // south west double arrow
    "⇚": MO.WIDEREL,
    // leftwards triple arrow
    "⇛": MO.WIDEREL,
    // rightwards triple arrow
    "⇜": MO.WIDEREL,
    // leftwards squiggle arrow
    "⇝": MO.WIDEREL,
    // rightwards squiggle arrow
    "⇞": MO.REL,
    // upwards arrow with double stroke
    "⇟": MO.REL,
    // downwards arrow with double stroke
    "⇠": MO.WIDEREL,
    // leftwards dashed arrow
    "⇡": MO.RELSTRETCH,
    // upwards dashed arrow
    "⇢": MO.WIDEREL,
    // rightwards dashed arrow
    "⇣": MO.RELSTRETCH,
    // downwards dashed arrow
    "⇤": MO.WIDEREL,
    // leftwards arrow to bar
    "⇥": MO.WIDEREL,
    // rightwards arrow to bar
    "⇦": MO.WIDEREL,
    // leftwards white arrow
    "⇧": MO.RELSTRETCH,
    // upwards white arrow
    "⇨": MO.WIDEREL,
    // rightwards white arrow
    "⇩": MO.RELSTRETCH,
    // downwards white arrow
    "⇪": MO.RELSTRETCH,
    // upwards white arrow from bar
    "⇫": MO.RELSTRETCH,
    // upwards white arrow on pedestal
    "⇬": MO.RELSTRETCH,
    // upwards white arrow on pedestal with horizontal bar
    "⇭": MO.RELSTRETCH,
    // upwards white arrow on pedestal with vertical bar
    "⇮": MO.RELSTRETCH,
    // upwards white double arrow
    "⇯": MO.RELSTRETCH,
    // upwards white double arrow on pedestal
    "⇰": MO.WIDEREL,
    // rightwards white arrow from wall
    "⇱": MO.REL,
    // north west arrow to corner
    "⇲": MO.REL,
    // south east arrow to corner
    "⇳": MO.RELSTRETCH,
    // up down white arrow
    "⇴": MO.RELACCENT,
    // right arrow with small circle
    "⇵": MO.RELSTRETCH,
    // downwards arrow leftwards of upwards arrow
    "⇶": MO.WIDEREL,
    // three rightwards arrows
    "⇷": MO.RELACCENT,
    // leftwards arrow with vertical stroke
    "⇸": MO.RELACCENT,
    // rightwards arrow with vertical stroke
    "⇹": MO.RELACCENT,
    // left right arrow with vertical stroke
    "⇺": MO.RELACCENT,
    // leftwards arrow with double vertical stroke
    "⇻": MO.RELACCENT,
    // rightwards arrow with double vertical stroke
    "⇼": MO.RELACCENT,
    // left right arrow with double vertical stroke
    "⇽": MO.WIDEREL,
    // leftwards open-headed arrow
    "⇾": MO.WIDEREL,
    // rightwards open-headed arrow
    "⇿": MO.WIDEREL,
    // left right open-headed arrow
    "∁": OPDEF(1, 2, TEXCLASS.ORD),
    // complement
    "∅": MO.ORD,
    // \emptyset
    "∆": MO.BIN3,
    // increment
    "∈": MO.REL,
    // element of
    "∉": MO.REL,
    // not an element of
    "∊": MO.REL,
    // small element of
    "∋": MO.REL,
    // contains as member
    "∌": MO.REL,
    // does not contain as member
    "∍": MO.REL,
    // small contains as member
    "∎": MO.BIN3,
    // end of proof
    "−": MO.BIN4,
    // minus sign
    "∓": MO.BIN4,
    // minus-or-plus sign
    "∔": MO.BIN4,
    // dot plus
    "∕": MO.TALLBIN,
    // division slash
    "∖": MO.BIN4,
    // set minus
    "∗": MO.BIN4,
    // asterisk operator
    "∘": MO.BIN4,
    // ring operator
    "∙": MO.BIN4,
    // bullet operator
    "∝": MO.REL,
    // proportional to
    "∞": MO.ORD,
    // \infty
    "∟": MO.REL,
    // right angle
    "∣": MO.REL,
    // divides
    "∤": MO.REL,
    // does not divide
    "∥": MO.REL,
    // parallel to
    "∦": MO.REL,
    // not parallel to
    "∧": MO.BIN4,
    // logical and
    "∨": MO.BIN4,
    // logical or
    "∩": MO.BIN4,
    // intersection
    "∪": MO.BIN4,
    // union
    "∴": MO.REL,
    // therefore
    "∵": MO.REL,
    // because
    "∶": MO.REL,
    // ratio
    "∷": MO.REL,
    // proportion
    "∸": MO.BIN4,
    // dot minus
    "∹": MO.REL,
    // excess
    "∺": MO.BIN4,
    // geometric proportion
    "∻": MO.REL,
    // homothetic
    "∼": MO.REL,
    // tilde operator
    "∽": MO.REL,
    // reversed tilde
    "∽̱": MO.BIN3,
    // reversed tilde with underline
    "∾": MO.REL,
    // inverted lazy s
    "∿": MO.BIN3,
    // sine wave
    "≀": MO.BIN4,
    // wreath product
    "≁": MO.REL,
    // not tilde
    "≂": MO.REL,
    // minus tilde
    "≂̸": MO.REL,
    // minus tilde with slash
    "≃": MO.REL,
    // asymptotically equal to
    "≄": MO.REL,
    // not asymptotically equal to
    "≅": MO.REL,
    // approximately equal to
    "≆": MO.REL,
    // approximately but not actually equal to
    "≇": MO.REL,
    // neither approximately nor actually equal to
    "≈": MO.REL,
    // almost equal to
    "≉": MO.REL,
    // not almost equal to
    "≊": MO.REL,
    // almost equal or equal to
    "≋": MO.REL,
    // triple tilde
    "≌": MO.REL,
    // all equal to
    "≍": MO.REL,
    // equivalent to
    "≎": MO.REL,
    // geometrically equivalent to
    "≎̸": MO.REL,
    // geometrically equivalent to with slash
    "≏": MO.REL,
    // difference between
    "≏̸": MO.REL,
    // difference between with slash
    "≐": MO.REL,
    // approaches the limit
    "≑": MO.REL,
    // geometrically equal to
    "≒": MO.REL,
    // approximately equal to or the image of
    "≓": MO.REL,
    // image of or approximately equal to
    "≔": MO.REL,
    // colon equals
    "≕": MO.REL,
    // equals colon
    "≖": MO.REL,
    // ring in equal to
    "≗": MO.REL,
    // ring equal to
    "≘": MO.REL,
    // corresponds to
    "≙": MO.REL,
    // estimates
    "≚": MO.REL,
    // equiangular to
    "≛": MO.REL,
    // star equals
    "≜": MO.REL,
    // delta equal to
    "≝": MO.REL,
    // equal to by definition
    "≞": MO.REL,
    // measured by
    "≟": MO.REL,
    // questioned equal to
    "≠": MO.REL,
    // not equal to
    "≡": MO.REL,
    // identical to
    "≢": MO.REL,
    // not identical to
    "≣": MO.REL,
    // strictly equivalent to
    "≤": MO.REL,
    // less-than or equal to
    "≥": MO.REL,
    // greater-than or equal to
    "≦": MO.REL,
    // less-than over equal to
    "≦̸": MO.REL,
    // less-than over equal to with slash
    "≧": MO.REL,
    // greater-than over equal to
    "≨": MO.REL,
    // less-than but not equal to
    "≩": MO.REL,
    // greater-than but not equal to
    "≪": MO.REL,
    // much less-than
    "≪̸": MO.REL,
    // much less than with slash
    "≫": MO.REL,
    // much greater-than
    "≫̸": MO.REL,
    // much greater than with slash
    "≬": MO.REL,
    // between
    "≭": MO.REL,
    // not equivalent to
    "≮": MO.REL,
    // not less-than
    "≯": MO.REL,
    // not greater-than
    "≰": MO.REL,
    // neither less-than nor equal to
    "≱": MO.REL,
    // neither greater-than nor equal to
    "≲": MO.REL,
    // less-than or equivalent to
    "≳": MO.REL,
    // greater-than or equivalent to
    "≴": MO.REL,
    // neither less-than nor equivalent to
    "≵": MO.REL,
    // neither greater-than nor equivalent to
    "≶": MO.REL,
    // less-than or greater-than
    "≷": MO.REL,
    // greater-than or less-than
    "≸": MO.REL,
    // neither less-than nor greater-than
    "≹": MO.REL,
    // neither greater-than nor less-than
    "≺": MO.REL,
    // precedes
    "≻": MO.REL,
    // succeeds
    "≼": MO.REL,
    // precedes or equal to
    "≽": MO.REL,
    // succeeds or equal to
    "≾": MO.REL,
    // precedes or equivalent to
    "≿": MO.REL,
    // succeeds or equivalent to
    "≿̸": MO.REL,
    // succeeds or equivalent to with slash
    "⊀": MO.REL,
    // does not precede
    "⊁": MO.REL,
    // does not succeed
    "⊂": MO.REL,
    // subset of
    "⊂⃒": MO.REL,
    // subset of with vertical line
    "⊃": MO.REL,
    // superset of
    "⊃⃒": MO.REL,
    // superset of with vertical line
    "⊄": MO.REL,
    // not a subset of
    "⊅": MO.REL,
    // not a superset of
    "⊆": MO.REL,
    // subset of or equal to
    "⊇": MO.REL,
    // superset of or equal to
    "⊈": MO.REL,
    // neither a subset of nor equal to
    "⊉": MO.REL,
    // neither a superset of nor equal to
    "⊊": MO.REL,
    // subset of with not equal to
    "⊋": MO.REL,
    // superset of with not equal to
    "⊌": MO.BIN4,
    // multiset
    "⊍": MO.BIN4,
    // multiset multiplication
    "⊎": MO.BIN4,
    // multiset union
    "⊏": MO.REL,
    // square image of
    "⊏̸": MO.REL,
    // square image of with slash
    "⊐": MO.REL,
    // square original of
    "⊐̸": MO.REL,
    // square original of with slash
    "⊑": MO.REL,
    // square image of or equal to
    "⊒": MO.REL,
    // square original of or equal to
    "⊓": MO.BIN4,
    // square cap
    "⊔": MO.BIN4,
    // square cup
    "⊕": MO.BIN4,
    // circled plus
    "⊖": MO.BIN4,
    // circled minus
    "⊗": MO.BIN4,
    // circled times
    "⊘": MO.BIN4,
    // circled division slash
    "⊙": MO.BIN4,
    // circled dot operator
    "⊚": MO.BIN4,
    // circled ring operator
    "⊛": MO.BIN4,
    // circled asterisk operator
    "⊜": MO.BIN4,
    // circled equals
    "⊝": MO.BIN4,
    // circled dash
    "⊞": MO.BIN4,
    // squared plus
    "⊟": MO.BIN4,
    // squared minus
    "⊠": MO.BIN4,
    // squared times
    "⊡": MO.BIN4,
    // squared dot operator
    "⊢": MO.REL,
    // right tack
    "⊣": MO.REL,
    // left tack
    "⊤": MO.ORD55,
    // down tack
    "⊥": MO.REL,
    // up tack
    "⊦": MO.REL,
    // assertion
    "⊧": MO.REL,
    // models
    "⊨": MO.REL,
    // true
    "⊩": MO.REL,
    // forces
    "⊪": MO.REL,
    // triple vertical bar right turnstile
    "⊫": MO.REL,
    // double vertical bar double right turnstile
    "⊬": MO.REL,
    // does not prove
    "⊭": MO.REL,
    // not true
    "⊮": MO.REL,
    // does not force
    "⊯": MO.REL,
    // negated double vertical bar double right turnstile
    "⊰": MO.REL,
    // precedes under relation
    "⊱": MO.REL,
    // succeeds under relation
    "⊲": MO.REL,
    // normal subgroup of
    "⊳": MO.REL,
    // contains as normal subgroup
    "⊴": MO.REL,
    // normal subgroup of or equal to
    "⊵": MO.REL,
    // contains as normal subgroup or equal to
    "⊶": MO.REL,
    // original of
    "⊷": MO.REL,
    // image of
    "⊸": MO.REL,
    // multimap
    "⊹": MO.REL,
    // hermitian conjugate matrix
    "⊺": MO.BIN4,
    // intercalate
    "⊻": MO.BIN4,
    // xor
    "⊼": MO.BIN4,
    // nand
    "⊽": MO.BIN4,
    // nor
    "⊾": MO.BIN3,
    // right angle with arc
    "⊿": MO.BIN3,
    // right triangle
    "⋄": MO.BIN4,
    // diamond operator
    "⋅": MO.BIN4,
    // dot operator
    "⋆": MO.BIN4,
    // star operator
    "⋇": MO.BIN4,
    // division times
    "⋈": MO.REL,
    // bowtie
    "⋉": MO.BIN4,
    // left normal factor semidirect product
    "⋊": MO.BIN4,
    // right normal factor semidirect product
    "⋋": MO.BIN4,
    // left semidirect product
    "⋌": MO.BIN4,
    // right semidirect product
    "⋍": MO.REL,
    // reversed tilde equals
    "⋎": MO.BIN4,
    // curly logical or
    "⋏": MO.BIN4,
    // curly logical and
    "⋐": MO.REL,
    // double subset
    "⋑": MO.REL,
    // double superset
    "⋒": MO.BIN4,
    // double intersection
    "⋓": MO.BIN4,
    // double union
    "⋔": MO.REL,
    // pitchfork
    "⋕": MO.REL,
    // equal and parallel to
    "⋖": MO.REL,
    // less-than with dot
    "⋗": MO.REL,
    // greater-than with dot
    "⋘": MO.REL,
    // very much less-than
    "⋙": MO.REL,
    // very much greater-than
    "⋚": MO.REL,
    // less-than equal to or greater-than
    "⋛": MO.REL,
    // greater-than equal to or less-than
    "⋜": MO.REL,
    // equal to or less-than
    "⋝": MO.REL,
    // equal to or greater-than
    "⋞": MO.REL,
    // equal to or precedes
    "⋟": MO.REL,
    // equal to or succeeds
    "⋠": MO.REL,
    // does not precede or equal
    "⋡": MO.REL,
    // does not succeed or equal
    "⋢": MO.REL,
    // not square image of or equal to
    "⋣": MO.REL,
    // not square original of or equal to
    "⋤": MO.REL,
    // square image of or not equal to
    "⋥": MO.REL,
    // square original of or not equal to
    "⋦": MO.REL,
    // less-than but not equivalent to
    "⋧": MO.REL,
    // greater-than but not equivalent to
    "⋨": MO.REL,
    // precedes but not equivalent to
    "⋩": MO.REL,
    // succeeds but not equivalent to
    "⋪": MO.REL,
    // not normal subgroup of
    "⋫": MO.REL,
    // does not contain as normal subgroup
    "⋬": MO.REL,
    // not normal subgroup of or equal to
    "⋭": MO.REL,
    // does not contain as normal subgroup or equal
    "⋮": MO.ORD55,
    // vertical ellipsis
    "⋯": MO.INNER,
    // midline horizontal ellipsis
    "⋰": MO.REL,
    // up right diagonal ellipsis
    "⋱": [5, 5, TEXCLASS.INNER, null],
    // down right diagonal ellipsis
    "⋲": MO.REL,
    // element of with long horizontal stroke
    "⋳": MO.REL,
    // element of with vertical bar at end of horizontal stroke
    "⋴": MO.REL,
    // small element of with vertical bar at end of horizontal stroke
    "⋵": MO.REL,
    // element of with dot above
    "⋶": MO.REL,
    // element of with overbar
    "⋷": MO.REL,
    // small element of with overbar
    "⋸": MO.REL,
    // element of with underbar
    "⋹": MO.REL,
    // element of with two horizontal strokes
    "⋺": MO.REL,
    // contains with long horizontal stroke
    "⋻": MO.REL,
    // contains with vertical bar at end of horizontal stroke
    "⋼": MO.REL,
    // small contains with vertical bar at end of horizontal stroke
    "⋽": MO.REL,
    // contains with overbar
    "⋾": MO.REL,
    // small contains with overbar
    "⋿": MO.REL,
    // z notation bag membership
    "⌅": MO.BIN3,
    // barwedge
    "⌆": MO.BIN3,
    // doublebarwedge
    "⌢": MO.REL4,
    // \frown
    "⌣": MO.REL4,
    // \smile
    "〈": MO.OPEN,
    // langle
    "〉": MO.CLOSE,
    // rangle
    "⎪": MO.ORD,
    // \bracevert
    "⎯": [0, 0, TEXCLASS.ORD, { stretchy: true }],
    // \underline
    "⎰": MO.OPEN,
    // \lmoustache
    "⎱": MO.CLOSE,
    // \rmoustache
    "─": MO.ORD,
    // horizontal line
    "△": MO.BIN4,
    // white up-pointing triangle
    "▵": MO.BIN4,
    // white up-pointing small triangle
    "▹": MO.BIN4,
    // white right-pointing small triangle
    "▽": MO.BIN4,
    // white down-pointing triangle
    "▿": MO.BIN4,
    // white down-pointing small triangle
    "◃": MO.BIN4,
    // white left-pointing small triangle
    "◯": MO.BIN3,
    // \bigcirc
    "♠": MO.ORD,
    // \spadesuit
    "♡": MO.ORD,
    // \heartsuit
    "♢": MO.ORD,
    // \diamondsuit
    "♣": MO.ORD,
    // \clubsuit
    "❘": MO.REL,
    // light vertical bar
    "⟰": MO.RELSTRETCH,
    // upwards quadruple arrow
    "⟱": MO.RELSTRETCH,
    // downwards quadruple arrow
    "⟵": MO.WIDEREL,
    // long leftwards arrow
    "⟶": MO.WIDEREL,
    // long rightwards arrow
    "⟷": MO.WIDEREL,
    // long left right arrow
    "⟸": MO.WIDEREL,
    // long leftwards double arrow
    "⟹": MO.WIDEREL,
    // long rightwards double arrow
    "⟺": MO.WIDEREL,
    // long left right double arrow
    "⟻": MO.WIDEREL,
    // long leftwards arrow from bar
    "⟼": MO.WIDEREL,
    // long rightwards arrow from bar
    "⟽": MO.WIDEREL,
    // long leftwards double arrow from bar
    "⟾": MO.WIDEREL,
    // long rightwards double arrow from bar
    "⟿": MO.WIDEREL,
    // long rightwards squiggle arrow
    "⤀": MO.RELACCENT,
    // rightwards two-headed arrow with vertical stroke
    "⤁": MO.RELACCENT,
    // rightwards two-headed arrow with double vertical stroke
    "⤂": MO.RELACCENT,
    // leftwards double arrow with vertical stroke
    "⤃": MO.RELACCENT,
    // rightwards double arrow with vertical stroke
    "⤄": MO.RELACCENT,
    // left right double arrow with vertical stroke
    "⤅": MO.RELACCENT,
    // rightwards two-headed arrow from bar
    "⤆": MO.RELACCENT,
    // leftwards double arrow from bar
    "⤇": MO.RELACCENT,
    // rightwards double arrow from bar
    "⤈": MO.REL,
    // downwards arrow with horizontal stroke
    "⤉": MO.REL,
    // upwards arrow with horizontal stroke
    "⤊": MO.RELSTRETCH,
    // upwards triple arrow
    "⤋": MO.RELSTRETCH,
    // downwards triple arrow
    "⤌": MO.WIDEREL,
    // leftwards double dash arrow
    "⤍": MO.WIDEREL,
    // rightwards double dash arrow
    "⤎": MO.WIDEREL,
    // leftwards triple dash arrow
    "⤏": MO.WIDEREL,
    // rightwards triple dash arrow
    "⤐": MO.WIDEREL,
    // rightwards two-headed triple dash arrow
    "⤑": MO.RELACCENT,
    // rightwards arrow with dotted stem
    "⤒": MO.RELSTRETCH,
    // upwards arrow to bar
    "⤓": MO.RELSTRETCH,
    // downwards arrow to bar
    "⤔": MO.RELACCENT,
    // rightwards arrow with tail with vertical stroke
    "⤕": MO.RELACCENT,
    // rightwards arrow with tail with double vertical stroke
    "⤖": MO.RELACCENT,
    // rightwards two-headed arrow with tail
    "⤗": MO.RELACCENT,
    // rightwards two-headed arrow with tail with vertical stroke
    "⤘": MO.RELACCENT,
    // rightwards two-headed arrow with tail with double vertical stroke
    "⤙": MO.RELACCENT,
    // leftwards arrow-tail
    "⤚": MO.RELACCENT,
    // rightwards arrow-tail
    "⤛": MO.RELACCENT,
    // leftwards double arrow-tail
    "⤜": MO.RELACCENT,
    // rightwards double arrow-tail
    "⤝": MO.RELACCENT,
    // leftwards arrow to black diamond
    "⤞": MO.RELACCENT,
    // rightwards arrow to black diamond
    "⤟": MO.RELACCENT,
    // leftwards arrow from bar to black diamond
    "⤠": MO.RELACCENT,
    // rightwards arrow from bar to black diamond
    "⤡": MO.RELSTRETCH,
    // north west and south east arrow
    "⤢": MO.RELSTRETCH,
    // north east and south west arrow
    "⤣": MO.REL,
    // north west arrow with hook
    "⤤": MO.REL,
    // north east arrow with hook
    "⤥": MO.REL,
    // south east arrow with hook
    "⤦": MO.REL,
    // south west arrow with hook
    "⤧": MO.REL,
    // north west arrow and north east arrow
    "⤨": MO.REL,
    // north east arrow and south east arrow
    "⤩": MO.REL,
    // south east arrow and south west arrow
    "⤪": MO.REL,
    // south west arrow and north west arrow
    "⤫": MO.REL,
    // rising diagonal crossing falling diagonal
    "⤬": MO.REL,
    // falling diagonal crossing rising diagonal
    "⤭": MO.REL,
    // south east arrow crossing north east arrow
    "⤮": MO.REL,
    // north east arrow crossing south east arrow
    "⤯": MO.REL,
    // falling diagonal crossing north east arrow
    "⤰": MO.REL,
    // rising diagonal crossing south east arrow
    "⤱": MO.REL,
    // north east arrow crossing north west arrow
    "⤲": MO.REL,
    // north west arrow crossing north east arrow
    "⤳": MO.RELACCENT,
    // wave arrow pointing directly right
    "⤴": MO.REL,
    // arrow pointing rightwards then curving upwards
    "⤵": MO.REL,
    // arrow pointing rightwards then curving downwards
    "⤶": MO.REL,
    // arrow pointing downwards then curving leftwards
    "⤷": MO.REL,
    // arrow pointing downwards then curving rightwards
    "⤸": MO.REL,
    // right-side arc clockwise arrow
    "⤹": MO.REL,
    // left-side arc anticlockwise arrow
    "⤺": MO.RELACCENT,
    // top arc anticlockwise arrow
    "⤻": MO.RELACCENT,
    // bottom arc anticlockwise arrow
    "⤼": MO.RELACCENT,
    // top arc clockwise arrow with minus
    "⤽": MO.RELACCENT,
    // top arc anticlockwise arrow with plus
    "⤾": MO.REL,
    // lower right semicircular clockwise arrow
    "⤿": MO.REL,
    // lower left semicircular anticlockwise arrow
    "⥀": MO.REL,
    // anticlockwise closed circle arrow
    "⥁": MO.REL,
    // clockwise closed circle arrow
    "⥂": MO.RELACCENT,
    // rightwards arrow above short leftwards arrow
    "⥃": MO.RELACCENT,
    // leftwards arrow above short rightwards arrow
    "⥄": MO.RELACCENT,
    // short rightwards arrow above leftwards arrow
    "⥅": MO.RELACCENT,
    // rightwards arrow with plus below
    "⥆": MO.RELACCENT,
    // leftwards arrow with plus below
    "⥇": MO.RELACCENT,
    // rightwards arrow through x
    "⥈": MO.RELACCENT,
    // left right arrow through small circle
    "⥉": MO.REL,
    // upwards two-headed arrow from small circle
    "⥊": MO.RELACCENT,
    // left barb up right barb down harpoon
    "⥋": MO.RELACCENT,
    // left barb down right barb up harpoon
    "⥌": MO.REL,
    // up barb right down barb left harpoon
    "⥍": MO.REL,
    // up barb left down barb right harpoon
    "⥎": MO.WIDEREL,
    // left barb up right barb up harpoon
    "⥏": MO.RELSTRETCH,
    // up barb right down barb right harpoon
    "⥐": MO.WIDEREL,
    // left barb down right barb down harpoon
    "⥑": MO.RELSTRETCH,
    // up barb left down barb left harpoon
    "⥒": MO.WIDEREL,
    // leftwards harpoon with barb up to bar
    "⥓": MO.WIDEREL,
    // rightwards harpoon with barb up to bar
    "⥔": MO.RELSTRETCH,
    // upwards harpoon with barb right to bar
    "⥕": MO.RELSTRETCH,
    // downwards harpoon with barb right to bar
    "⥖": MO.RELSTRETCH,
    // leftwards harpoon with barb down to bar
    "⥗": MO.RELSTRETCH,
    // rightwards harpoon with barb down to bar
    "⥘": MO.RELSTRETCH,
    // upwards harpoon with barb left to bar
    "⥙": MO.RELSTRETCH,
    // downwards harpoon with barb left to bar
    "⥚": MO.WIDEREL,
    // leftwards harpoon with barb up from bar
    "⥛": MO.WIDEREL,
    // rightwards harpoon with barb up from bar
    "⥜": MO.RELSTRETCH,
    // upwards harpoon with barb right from bar
    "⥝": MO.RELSTRETCH,
    // downwards harpoon with barb right from bar
    "⥞": MO.WIDEREL,
    // leftwards harpoon with barb down from bar
    "⥟": MO.WIDEREL,
    // rightwards harpoon with barb down from bar
    "⥠": MO.RELSTRETCH,
    // upwards harpoon with barb left from bar
    "⥡": MO.RELSTRETCH,
    // downwards harpoon with barb left from bar
    "⥢": MO.RELACCENT,
    // leftwards harpoon with barb up above leftwards harpoon with barb down
    "⥣": MO.REL,
    // upwards harpoon with barb left beside upwards harpoon with barb right
    "⥤": MO.RELACCENT,
    // rightwards harpoon with barb up above rightwards harpoon with barb down
    "⥥": MO.REL,
    // downwards harpoon with barb left beside downwards harpoon with barb right
    "⥦": MO.RELACCENT,
    // leftwards harpoon with barb up above rightwards harpoon with barb up
    "⥧": MO.RELACCENT,
    // leftwards harpoon with barb down above rightwards harpoon with barb down
    "⥨": MO.RELACCENT,
    // rightwards harpoon with barb up above leftwards harpoon with barb up
    "⥩": MO.RELACCENT,
    // rightwards harpoon with barb down above leftwards harpoon with barb down
    "⥪": MO.RELACCENT,
    // leftwards harpoon with barb up above long dash
    "⥫": MO.RELACCENT,
    // leftwards harpoon with barb down below long dash
    "⥬": MO.RELACCENT,
    // rightwards harpoon with barb up above long dash
    "⥭": MO.RELACCENT,
    // rightwards harpoon with barb down below long dash
    "⥮": MO.RELSTRETCH,
    // upwards harpoon with barb left beside downwards harpoon with barb right
    "⥯": MO.RELSTRETCH,
    // downwards harpoon with barb left beside upwards harpoon with barb right
    "⥰": MO.RELACCENT,
    // right double arrow with rounded head
    "⥱": MO.RELACCENT,
    // equals sign above rightwards arrow
    "⥲": MO.RELACCENT,
    // tilde operator above rightwards arrow
    "⥳": MO.RELACCENT,
    // leftwards arrow above tilde operator
    "⥴": MO.RELACCENT,
    // rightwards arrow above tilde operator
    "⥵": MO.RELACCENT,
    // rightwards arrow above almost equal to
    "⥶": MO.RELACCENT,
    // less-than above leftwards arrow
    "⥷": MO.RELACCENT,
    // leftwards arrow through less-than
    "⥸": MO.RELACCENT,
    // greater-than above rightwards arrow
    "⥹": MO.RELACCENT,
    // subset above rightwards arrow
    "⥺": MO.RELACCENT,
    // leftwards arrow through subset
    "⥻": MO.RELACCENT,
    // superset above leftwards arrow
    "⥼": MO.RELACCENT,
    // left fish tail
    "⥽": MO.RELACCENT,
    // right fish tail
    "⥾": MO.REL,
    // up fish tail
    "⥿": MO.REL,
    // down fish tail
    "⦁": MO.BIN3,
    // z notation spot
    "⦂": MO.BIN3,
    // z notation type colon
    "⦙": MO.BIN3,
    // dotted fence
    "⦚": MO.BIN3,
    // vertical zigzag line
    "⦛": MO.BIN3,
    // measured angle opening left
    "⦜": MO.BIN3,
    // right angle variant with square
    "⦝": MO.BIN3,
    // measured right angle with dot
    "⦞": MO.BIN3,
    // angle with s inside
    "⦟": MO.BIN3,
    // acute angle
    "⦠": MO.BIN3,
    // spherical angle opening left
    "⦡": MO.BIN3,
    // spherical angle opening up
    "⦢": MO.BIN3,
    // turned angle
    "⦣": MO.BIN3,
    // reversed angle
    "⦤": MO.BIN3,
    // angle with underbar
    "⦥": MO.BIN3,
    // reversed angle with underbar
    "⦦": MO.BIN3,
    // oblique angle opening up
    "⦧": MO.BIN3,
    // oblique angle opening down
    "⦨": MO.BIN3,
    // measured angle with open arm ending in arrow pointing up and right
    "⦩": MO.BIN3,
    // measured angle with open arm ending in arrow pointing up and left
    "⦪": MO.BIN3,
    // measured angle with open arm ending in arrow pointing down and right
    "⦫": MO.BIN3,
    // measured angle with open arm ending in arrow pointing down and left
    "⦬": MO.BIN3,
    // measured angle with open arm ending in arrow pointing right and up
    "⦭": MO.BIN3,
    // measured angle with open arm ending in arrow pointing left and up
    "⦮": MO.BIN3,
    // measured angle with open arm ending in arrow pointing right and down
    "⦯": MO.BIN3,
    // measured angle with open arm ending in arrow pointing left and down
    "⦰": MO.BIN3,
    // reversed empty set
    "⦱": MO.BIN3,
    // empty set with overbar
    "⦲": MO.BIN3,
    // empty set with small circle above
    "⦳": MO.BIN3,
    // empty set with right arrow above
    "⦴": MO.BIN3,
    // empty set with left arrow above
    "⦵": MO.BIN3,
    // circle with horizontal bar
    "⦶": MO.BIN4,
    // circled vertical bar
    "⦷": MO.BIN4,
    // circled parallel
    "⦸": MO.BIN4,
    // circled reverse solidus
    "⦹": MO.BIN4,
    // circled perpendicular
    "⦺": MO.BIN4,
    // circle divided by horizontal bar and top half divided by vertical bar
    "⦻": MO.BIN4,
    // circle with superimposed x
    "⦼": MO.BIN4,
    // circled anticlockwise-rotated division sign
    "⦽": MO.BIN4,
    // up arrow through circle
    "⦾": MO.BIN4,
    // circled white bullet
    "⦿": MO.BIN4,
    // circled bullet
    "⧀": MO.REL,
    // circled less-than
    "⧁": MO.REL,
    // circled greater-than
    "⧂": MO.BIN3,
    // circle with small circle to the right
    "⧃": MO.BIN3,
    // circle with two horizontal strokes to the right
    "⧄": MO.BIN4,
    // squared rising diagonal slash
    "⧅": MO.BIN4,
    // squared falling diagonal slash
    "⧆": MO.BIN4,
    // squared asterisk
    "⧇": MO.BIN4,
    // squared small circle
    "⧈": MO.BIN4,
    // squared square
    "⧉": MO.BIN3,
    // two joined squares
    "⧊": MO.BIN3,
    // triangle with dot above
    "⧋": MO.BIN3,
    // triangle with underbar
    "⧌": MO.BIN3,
    // s in triangle
    "⧍": MO.BIN3,
    // triangle with serifs at bottom
    "⧎": MO.REL,
    // right triangle above left triangle
    "⧏": MO.REL,
    // left triangle beside vertical bar
    "⧏̸": MO.REL,
    // left triangle beside vertical bar with slash
    "⧐": MO.REL,
    // vertical bar beside right triangle
    "⧐̸": MO.REL,
    // vertical bar beside right triangle with slash
    "⧑": MO.REL,
    // bowtie with left half black
    "⧒": MO.REL,
    // bowtie with right half black
    "⧓": MO.REL,
    // black bowtie
    "⧔": MO.REL,
    // times with left half black
    "⧕": MO.REL,
    // times with right half black
    "⧖": MO.BIN4,
    // white hourglass
    "⧗": MO.BIN4,
    // black hourglass
    "⧘": MO.BIN3,
    // left wiggly fence
    "⧙": MO.BIN3,
    // right wiggly fence
    "⧛": MO.BIN3,
    // right double wiggly fence
    "⧜": MO.BIN3,
    // incomplete infinity
    "⧝": MO.BIN3,
    // tie over infinity
    "⧞": MO.REL,
    // infinity negated with vertical bar
    "⧟": MO.BIN3,
    // double-ended multimap
    "⧠": MO.BIN3,
    // square with contoured outline
    "⧡": MO.REL,
    // increases as
    "⧢": MO.BIN4,
    // shuffle product
    "⧣": MO.REL,
    // equals sign and slanted parallel
    "⧤": MO.REL,
    // equals sign and slanted parallel with tilde above
    "⧥": MO.REL,
    // identical to and slanted parallel
    "⧦": MO.REL,
    // gleich stark
    "⧧": MO.BIN3,
    // thermodynamic
    "⧨": MO.BIN3,
    // down-pointing triangle with left half black
    "⧩": MO.BIN3,
    // down-pointing triangle with right half black
    "⧪": MO.BIN3,
    // black diamond with down arrow
    "⧫": MO.BIN3,
    // black lozenge
    "⧬": MO.BIN3,
    // white circle with down arrow
    "⧭": MO.BIN3,
    // black circle with down arrow
    "⧮": MO.BIN3,
    // error-barred white square
    "⧯": MO.BIN3,
    // error-barred black square
    "⧰": MO.BIN3,
    // error-barred white diamond
    "⧱": MO.BIN3,
    // error-barred black diamond
    "⧲": MO.BIN3,
    // error-barred white circle
    "⧳": MO.BIN3,
    // error-barred black circle
    "⧴": MO.REL,
    // rule-delayed
    "⧵": MO.BIN4,
    // reverse solidus operator
    "⧶": MO.BIN4,
    // solidus with overbar
    "⧷": MO.BIN4,
    // reverse solidus with horizontal stroke
    "⧸": MO.BIN3,
    // big solidus
    "⧹": MO.BIN3,
    // big reverse solidus
    "⧺": MO.BIN3,
    // double plus
    "⧻": MO.BIN3,
    // triple plus
    "⧾": MO.BIN4,
    // tiny
    "⧿": MO.BIN4,
    // miny
    "⨝": MO.BIN3,
    // join
    "⨞": MO.BIN3,
    // large left triangle operator
    "⨟": MO.BIN3,
    // z notation schema composition
    "⨠": MO.BIN3,
    // z notation schema piping
    "⨡": MO.BIN3,
    // z notation schema projection
    "⨢": MO.BIN4,
    // plus sign with small circle above
    "⨣": MO.BIN4,
    // plus sign with circumflex accent above
    "⨤": MO.BIN4,
    // plus sign with tilde above
    "⨥": MO.BIN4,
    // plus sign with dot below
    "⨦": MO.BIN4,
    // plus sign with tilde below
    "⨧": MO.BIN4,
    // plus sign with subscript two
    "⨨": MO.BIN4,
    // plus sign with black triangle
    "⨩": MO.BIN4,
    // minus sign with comma above
    "⨪": MO.BIN4,
    // minus sign with dot below
    "⨫": MO.BIN4,
    // minus sign with falling dots
    "⨬": MO.BIN4,
    // minus sign with rising dots
    "⨭": MO.BIN4,
    // plus sign in left half circle
    "⨮": MO.BIN4,
    // plus sign in right half circle
    "⨯": MO.BIN4,
    // vector or cross product
    "⨰": MO.BIN4,
    // multiplication sign with dot above
    "⨱": MO.BIN4,
    // multiplication sign with underbar
    "⨲": MO.BIN4,
    // semidirect product with bottom closed
    "⨳": MO.BIN4,
    // smash product
    "⨴": MO.BIN4,
    // multiplication sign in left half circle
    "⨵": MO.BIN4,
    // multiplication sign in right half circle
    "⨶": MO.BIN4,
    // circled multiplication sign with circumflex accent
    "⨷": MO.BIN4,
    // multiplication sign in double circle
    "⨸": MO.BIN4,
    // circled division sign
    "⨹": MO.BIN4,
    // plus sign in triangle
    "⨺": MO.BIN4,
    // minus sign in triangle
    "⨻": MO.BIN4,
    // multiplication sign in triangle
    "⨼": MO.BIN4,
    // interior product
    "⨽": MO.BIN4,
    // righthand interior product
    "⨾": MO.BIN4,
    // z notation relational composition
    "⨿": MO.BIN4,
    // amalgamation or coproduct
    "⩀": MO.BIN4,
    // intersection with dot
    "⩁": MO.BIN4,
    // union with minus sign
    "⩂": MO.BIN4,
    // union with overbar
    "⩃": MO.BIN4,
    // intersection with overbar
    "⩄": MO.BIN4,
    // intersection with logical and
    "⩅": MO.BIN4,
    // union with logical or
    "⩆": MO.BIN4,
    // union above intersection
    "⩇": MO.BIN4,
    // intersection above union
    "⩈": MO.BIN4,
    // union above bar above intersection
    "⩉": MO.BIN4,
    // intersection above bar above union
    "⩊": MO.BIN4,
    // union beside and joined with union
    "⩋": MO.BIN4,
    // intersection beside and joined with intersection
    "⩌": MO.BIN4,
    // closed union with serifs
    "⩍": MO.BIN4,
    // closed intersection with serifs
    "⩎": MO.BIN4,
    // double square intersection
    "⩏": MO.BIN4,
    // double square union
    "⩐": MO.BIN4,
    // closed union with serifs and smash product
    "⩑": MO.BIN4,
    // logical and with dot above
    "⩒": MO.BIN4,
    // logical or with dot above
    "⩓": MO.BIN4,
    // double logical and
    "⩔": MO.BIN4,
    // double logical or
    "⩕": MO.BIN4,
    // two intersecting logical and
    "⩖": MO.BIN4,
    // two intersecting logical or
    "⩗": MO.BIN4,
    // sloping large or
    "⩘": MO.BIN4,
    // sloping large and
    "⩙": MO.REL,
    // logical or overlapping logical and
    "⩚": MO.BIN4,
    // logical and with middle stem
    "⩛": MO.BIN4,
    // logical or with middle stem
    "⩜": MO.BIN4,
    // logical and with horizontal dash
    "⩝": MO.BIN4,
    // logical or with horizontal dash
    "⩞": MO.BIN4,
    // logical and with double overbar
    "⩟": MO.BIN4,
    // logical and with underbar
    "⩠": MO.BIN4,
    // logical and with double underbar
    "⩡": MO.BIN4,
    // small vee with underbar
    "⩢": MO.BIN4,
    // logical or with double overbar
    "⩣": MO.BIN4,
    // logical or with double underbar
    "⩤": MO.BIN4,
    // z notation domain antirestriction
    "⩥": MO.BIN4,
    // z notation range antirestriction
    "⩦": MO.REL,
    // equals sign with dot below
    "⩧": MO.REL,
    // identical with dot above
    "⩨": MO.REL,
    // triple horizontal bar with double vertical stroke
    "⩩": MO.REL,
    // triple horizontal bar with triple vertical stroke
    "⩪": MO.REL,
    // tilde operator with dot above
    "⩫": MO.REL,
    // tilde operator with rising dots
    "⩬": MO.REL,
    // similar minus similar
    "⩭": MO.REL,
    // congruent with dot above
    "⩮": MO.REL,
    // equals with asterisk
    "⩯": MO.REL,
    // almost equal to with circumflex accent
    "⩰": MO.REL,
    // approximately equal or equal to
    "⩱": MO.BIN4,
    // equals sign above plus sign
    "⩲": MO.BIN4,
    // plus sign above equals sign
    "⩳": MO.REL,
    // equals sign above tilde operator
    "⩴": MO.REL,
    // double colon equal
    "⩵": MO.REL,
    // two consecutive equals signs
    "⩶": MO.REL,
    // three consecutive equals signs
    "⩷": MO.REL,
    // equals sign with two dots above and two dots below
    "⩸": MO.REL,
    // equivalent with four dots above
    "⩹": MO.REL,
    // less-than with circle inside
    "⩺": MO.REL,
    // greater-than with circle inside
    "⩻": MO.REL,
    // less-than with question mark above
    "⩼": MO.REL,
    // greater-than with question mark above
    "⩽": MO.REL,
    // less-than or slanted equal to
    "⩽̸": MO.REL,
    // less-than or slanted equal to with slash
    "⩾": MO.REL,
    // greater-than or slanted equal to
    "⩾̸": MO.REL,
    // greater-than or slanted equal to with slash
    "⩿": MO.REL,
    // less-than or slanted equal to with dot inside
    "⪀": MO.REL,
    // greater-than or slanted equal to with dot inside
    "⪁": MO.REL,
    // less-than or slanted equal to with dot above
    "⪂": MO.REL,
    // greater-than or slanted equal to with dot above
    "⪃": MO.REL,
    // less-than or slanted equal to with dot above right
    "⪄": MO.REL,
    // greater-than or slanted equal to with dot above left
    "⪅": MO.REL,
    // less-than or approximate
    "⪆": MO.REL,
    // greater-than or approximate
    "⪇": MO.REL,
    // less-than and single-line not equal to
    "⪈": MO.REL,
    // greater-than and single-line not equal to
    "⪉": MO.REL,
    // less-than and not approximate
    "⪊": MO.REL,
    // greater-than and not approximate
    "⪋": MO.REL,
    // less-than above double-line equal above greater-than
    "⪌": MO.REL,
    // greater-than above double-line equal above less-than
    "⪍": MO.REL,
    // less-than above similar or equal
    "⪎": MO.REL,
    // greater-than above similar or equal
    "⪏": MO.REL,
    // less-than above similar above greater-than
    "⪐": MO.REL,
    // greater-than above similar above less-than
    "⪑": MO.REL,
    // less-than above greater-than above double-line equal
    "⪒": MO.REL,
    // greater-than above less-than above double-line equal
    "⪓": MO.REL,
    // less-than above slanted equal above greater-than above slanted equal
    "⪔": MO.REL,
    // greater-than above slanted equal above less-than above slanted equal
    "⪕": MO.REL,
    // slanted equal to or less-than
    "⪖": MO.REL,
    // slanted equal to or greater-than
    "⪗": MO.REL,
    // slanted equal to or less-than with dot inside
    "⪘": MO.REL,
    // slanted equal to or greater-than with dot inside
    "⪙": MO.REL,
    // double-line equal to or less-than
    "⪚": MO.REL,
    // double-line equal to or greater-than
    "⪛": MO.REL,
    // double-line slanted equal to or less-than
    "⪜": MO.REL,
    // double-line slanted equal to or greater-than
    "⪝": MO.REL,
    // similar or less-than
    "⪞": MO.REL,
    // similar or greater-than
    "⪟": MO.REL,
    // similar above less-than above equals sign
    "⪠": MO.REL,
    // similar above greater-than above equals sign
    "⪡": MO.REL,
    // double nested less-than
    "⪡̸": MO.REL,
    // double nested less-than with slash
    "⪢": MO.REL,
    // double nested greater-than
    "⪢̸": MO.REL,
    // double nested greater-than with slash
    "⪣": MO.REL,
    // double nested less-than with underbar
    "⪤": MO.REL,
    // greater-than overlapping less-than
    "⪥": MO.REL,
    // greater-than beside less-than
    "⪦": MO.REL,
    // less-than closed by curve
    "⪧": MO.REL,
    // greater-than closed by curve
    "⪨": MO.REL,
    // less-than closed by curve above slanted equal
    "⪩": MO.REL,
    // greater-than closed by curve above slanted equal
    "⪪": MO.REL,
    // smaller than
    "⪫": MO.REL,
    // larger than
    "⪬": MO.REL,
    // smaller than or equal to
    "⪭": MO.REL,
    // larger than or equal to
    "⪮": MO.REL,
    // equals sign with bumpy above
    "⪯": MO.REL,
    // precedes above single-line equals sign
    "⪯̸": MO.REL,
    // precedes above single-line equals sign with slash
    "⪰": MO.REL,
    // succeeds above single-line equals sign
    "⪰̸": MO.REL,
    // succeeds above single-line equals sign with slash
    "⪱": MO.REL,
    // precedes above single-line not equal to
    "⪲": MO.REL,
    // succeeds above single-line not equal to
    "⪳": MO.REL,
    // precedes above equals sign
    "⪴": MO.REL,
    // succeeds above equals sign
    "⪵": MO.REL,
    // precedes above not equal to
    "⪶": MO.REL,
    // succeeds above not equal to
    "⪷": MO.REL,
    // precedes above almost equal to
    "⪸": MO.REL,
    // succeeds above almost equal to
    "⪹": MO.REL,
    // precedes above not almost equal to
    "⪺": MO.REL,
    // succeeds above not almost equal to
    "⪻": MO.REL,
    // double precedes
    "⪼": MO.REL,
    // double succeeds
    "⪽": MO.REL,
    // subset with dot
    "⪾": MO.REL,
    // superset with dot
    "⪿": MO.REL,
    // subset with plus sign below
    "⫀": MO.REL,
    // superset with plus sign below
    "⫁": MO.REL,
    // subset with multiplication sign below
    "⫂": MO.REL,
    // superset with multiplication sign below
    "⫃": MO.REL,
    // subset of or equal to with dot above
    "⫄": MO.REL,
    // superset of or equal to with dot above
    "⫅": MO.REL,
    // subset of above equals sign
    "⫆": MO.REL,
    // superset of above equals sign
    "⫇": MO.REL,
    // subset of above tilde operator
    "⫈": MO.REL,
    // superset of above tilde operator
    "⫉": MO.REL,
    // subset of above almost equal to
    "⫊": MO.REL,
    // superset of above almost equal to
    "⫋": MO.REL,
    // subset of above not equal to
    "⫌": MO.REL,
    // superset of above not equal to
    "⫍": MO.REL,
    // square left open box operator
    "⫎": MO.REL,
    // square right open box operator
    "⫏": MO.REL,
    // closed subset
    "⫐": MO.REL,
    // closed superset
    "⫑": MO.REL,
    // closed subset or equal to
    "⫒": MO.REL,
    // closed superset or equal to
    "⫓": MO.REL,
    // subset above superset
    "⫔": MO.REL,
    // superset above subset
    "⫕": MO.REL,
    // subset above subset
    "⫖": MO.REL,
    // superset above superset
    "⫗": MO.REL,
    // superset beside subset
    "⫘": MO.REL,
    // superset beside and joined by dash with subset
    "⫙": MO.REL,
    // element of opening downwards
    "⫚": MO.REL,
    // pitchfork with tee top
    "⫛": MO.REL,
    // transversal intersection
    "⫝": MO.REL,
    // nonforking
    "⫝̸": MO.REL,
    // nonforking with slash
    "⫞": MO.REL,
    // short left tack
    "⫟": MO.REL,
    // short down tack
    "⫠": MO.REL,
    // short up tack
    "⫡": MO.REL,
    // perpendicular with s
    "⫢": MO.REL,
    // vertical bar triple right turnstile
    "⫣": MO.REL,
    // double vertical bar left turnstile
    "⫤": MO.REL,
    // vertical bar double left turnstile
    "⫥": MO.REL,
    // double vertical bar double left turnstile
    "⫦": MO.REL,
    // long dash from left member of double vertical
    "⫧": MO.REL,
    // short down tack with overbar
    "⫨": MO.REL,
    // short up tack with underbar
    "⫩": MO.REL,
    // short up tack above short down tack
    "⫪": MO.REL,
    // double down tack
    "⫫": MO.REL,
    // double up tack
    "⫬": MO.REL,
    // double stroke not sign
    "⫭": MO.REL,
    // reversed double stroke not sign
    "⫮": MO.REL,
    // does not divide with reversed negation slash
    "⫯": MO.REL,
    // vertical line with circle above
    "⫰": MO.REL,
    // vertical line with circle below
    "⫱": MO.REL,
    // down tack with circle below
    "⫲": MO.REL,
    // parallel with horizontal stroke
    "⫳": MO.REL,
    // parallel with tilde operator
    "⫴": MO.BIN4,
    // triple vertical bar binary relation
    "⫵": MO.BIN4,
    // triple vertical bar with horizontal stroke
    "⫶": MO.BIN4,
    // triple colon operator
    "⫷": MO.REL,
    // triple nested less-than
    "⫸": MO.REL,
    // triple nested greater-than
    "⫹": MO.REL,
    // double-line slanted less-than or equal to
    "⫺": MO.REL,
    // double-line slanted greater-than or equal to
    "⫻": MO.BIN4,
    // triple solidus binary relation
    "⫽": MO.BIN4,
    // double solidus operator
    "⫾": MO.BIN3,
    // white vertical bar
    "⭅": MO.RELSTRETCH,
    // leftwards quadruple arrow
    "⭆": MO.RELSTRETCH,
    // rightwards quadruple arrow
    "〈": MO.OPEN,
    // langle
    "〉": MO.CLOSE,
    // rangle
    "︷": MO.WIDEACCENT,
    // horizontal brace down
    "︸": MO.WIDEACCENT
    // horizontal brace up
  }
};
OPTABLE.infix["^"] = MO.WIDEREL;
OPTABLE.infix["_"] = MO.WIDEREL;
OPTABLE.infix["⫝̸"] = MO.REL;

// node_modules/mathjax-full/ts/util/string.ts
function sortLength(a, b) {
  return a.length !== b.length ? b.length - a.length : a === b ? 0 : a < b ? -1 : 1;
}
function quotePattern(text) {
  return text.replace(/([\^$(){}+*?\-|\[\]\:\\])/g, "\\$1");
}
function unicodeChars(text) {
  return Array.from(text).map((c) => c.codePointAt(0));
}
function unicodeString(data) {
  return String.fromCodePoint(...data);
}
function isPercent(x) {
  return !!x.match(/%\s*$/);
}
function split(x) {
  return x.trim().split(/\s+/);
}

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/mo.ts
var MmlMo = class extends AbstractMmlTokenNode {
  constructor() {
    super(...arguments);
    /**
     * The internal TeX class of the node (for use with getter/setter below)
     */
    this._texClass = null;
    /**
     * The default MathML spacing on the left
     */
    /* tslint:disable-next-line:whitespace */
    this.lspace = 5 / 18;
    /**
     * The default MathML spacing on the right
     */
    /* tslint:disable-next-line:whitespace */
    this.rspace = 5 / 18;
  }
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlTokenNode.defaults,
      form: "infix",
      fence: false,
      separator: false,
      lspace: "thickmathspace",
      rspace: "thickmathspace",
      stretchy: false,
      symmetric: false,
      maxsize: "infinity",
      minsize: "0em",
      // MathML says '1em', but that is larger than some natural sizes
      largeop: false,
      movablelimits: false,
      accent: false,
      linebreak: "auto",
      lineleading: "1ex",
      linebreakstyle: "before",
      indentalign: "auto",
      indentshift: "0",
      indenttarget: "",
      indentalignfirst: "indentalign",
      indentshiftfirst: "indentshift",
      indentalignlast: "indentalign",
      indentshiftlast: "indentshift"
    };
  }
  static {
    /**
     * The MathML spacing values for the TeX classes
     */
    this.MMLSPACING = MMLSPACING;
  }
  static {
    /**
     * The Operator Dictionary
     */
    this.OPTABLE = OPTABLE;
  }
  static {
    /**
     * Pattern for matching when the contents is one ore more pseudoscripts
     */
    this.pseudoScripts = new RegExp([
      "^[\"'*`",
      "ª",
      // FEMININE ORDINAL INDICATOR
      "°",
      // DEGREE SIGN
      "²-´",
      // SUPERSCRIPT 2 and 3, ACUTE ACCENT
      "¹",
      // SUPERSCRIPT ONE
      "º",
      // MASCULINE ORDINAL INDICATOR
      "‘-‟",
      // Various double and single quotation marks (up and down)
      "′-‷⁗",
      // Primes and reversed primes (forward and reversed)
      "⁰ⁱ",
      // SUPERSCRIPT 0 and i
      "⁴-ⁿ",
      // SUPERCRIPT 4 through 9, -, =, (, ), and n
      "₀-₎",
      // SUBSCRIPT 0 through 9, -, =, (, ).
      "]+$"
    ].join(""));
  }
  static {
    /**
     * Pattern for when contents is a collection of primes
     */
    this.primes = new RegExp([
      "^[\"'`",
      "‘-‟",
      // Various double and single quotation marks (up and down)
      "]+$"
    ].join(""));
  }
  static {
    /**
     * Default map for remapping prime characters
     */
    this.remapPrimes = {
      34: 8243,
      // double quotes
      39: 8242,
      // single quote
      96: 8245,
      // back quote
      8216: 8245,
      // open single quote
      8217: 8242,
      // close single quote
      8218: 8242,
      // low open single quote
      8219: 8245,
      // reversed open single quote
      8220: 8246,
      // open double quote
      8221: 8243,
      // close double quote
      8222: 8243,
      // low open double quote
      8223: 8246
      // reversed open double quote
    };
  }
  static {
    /**
     * Regular expression matching characters that are marked as math accents
     */
    this.mathaccents = new RegExp([
      "^[",
      "´́ˊ",
      // acute
      "`̀ˋ",
      // grave
      "¨̈",
      // ddot
      "~̃˜",
      // tilde
      "¯̄ˉ",
      // bar
      "˘̆",
      // breve
      "ˇ̌",
      // check
      "^̂ˆ",
      // hat
      "→⃗",
      // vec
      "˙̇",
      // dot
      "˚̊",
      // mathring
      "⃛",
      // dddot
      "⃜",
      // ddddot
      "]$"
    ].join(""));
  }
  /**
   * Use a getter to look up the TeX class from the operator table if it hasn't
   * been set yet (but don't save it in case the form changes when it is in its
   * location).
   */
  get texClass() {
    if (this._texClass === null) {
      let mo = this.getText();
      let [form1, form2, form3] = this.handleExplicitForm(this.getForms());
      let OPTABLE2 = this.constructor.OPTABLE;
      let def = OPTABLE2[form1][mo] || OPTABLE2[form2][mo] || OPTABLE2[form3][mo];
      return def ? def[2] : TEXCLASS.REL;
    }
    return this._texClass;
  }
  /**
   * Use a setter to store the actual value in _texClass;
   */
  set texClass(value) {
    this._texClass = value;
  }
  /**
   * @override
   */
  get kind() {
    return "mo";
  }
  /**
   * All <mo> are considered embellished
   * @override
   */
  get isEmbellished() {
    return true;
  }
  /**
   * @return {boolean}  Is <mo> marked as an explicit linebreak?
   */
  get hasNewLine() {
    return this.attributes.get("linebreak") === "newline";
  }
  /**
   * @return {MmlNode}  The node that is the outermost embellished operator
   *                    with this node as its core
   */
  coreParent() {
    let embellished = this;
    let parent = this;
    let math = this.factory.getNodeClass("math");
    while (parent && parent.isEmbellished && parent.coreMO() === this && !(parent instanceof math)) {
      embellished = parent;
      parent = parent.parent;
    }
    return embellished;
  }
  /**
   * @param {MmlNode} parent  The node whose core text is to be obtained
   * @return {string}         The text of the core MO of the given parent element
   */
  coreText(parent) {
    if (!parent) {
      return "";
    }
    if (parent.isEmbellished) {
      return parent.coreMO().getText();
    }
    while (((parent.isKind("mrow") || parent.isKind("TeXAtom") && parent.texClass !== TEXCLASS.VCENTER || parent.isKind("mstyle") || parent.isKind("mphantom")) && parent.childNodes.length === 1 || parent.isKind("munderover")) && parent.childNodes[0]) {
      parent = parent.childNodes[0];
    }
    return parent.isToken ? parent.getText() : "";
  }
  /**
   * @override
   */
  hasSpacingAttributes() {
    return this.attributes.isSet("lspace") || this.attributes.isSet("rspace");
  }
  /**
   * @return {boolean}  True is this mo is an accent in an munderover construction
   */
  get isAccent() {
    let accent = false;
    const node = this.coreParent().parent;
    if (node) {
      const key = node.isKind("mover") ? node.childNodes[node.over].coreMO() ? "accent" : "" : node.isKind("munder") ? node.childNodes[node.under].coreMO() ? "accentunder" : "" : node.isKind("munderover") ? this === node.childNodes[node.over].coreMO() ? "accent" : this === node.childNodes[node.under].coreMO() ? "accentunder" : "" : "";
      if (key) {
        const value = node.attributes.getExplicit(key);
        accent = value !== void 0 ? accent : this.attributes.get("accent");
      }
    }
    return accent;
  }
  /**
   * Produce the texClass based on the operator dictionary values
   *
   * @override
   */
  setTeXclass(prev) {
    let { form, fence } = this.attributes.getList("form", "fence");
    if (this.getProperty("texClass") === void 0 && (this.attributes.isSet("lspace") || this.attributes.isSet("rspace"))) {
      return null;
    }
    if (fence && this.texClass === TEXCLASS.REL) {
      if (form === "prefix") {
        this.texClass = TEXCLASS.OPEN;
      }
      if (form === "postfix") {
        this.texClass = TEXCLASS.CLOSE;
      }
    }
    return this.adjustTeXclass(prev);
  }
  /**
   * Follow the TeXBook rules for adjusting the TeX class once its neighbors are known
   *
   * @param {MmlNode} prev  The node appearing before this one in the output
   * @return {MmlNode}      The last node displayed (this node)
   */
  adjustTeXclass(prev) {
    let texClass = this.texClass;
    let prevClass = this.prevClass;
    if (texClass === TEXCLASS.NONE) {
      return prev;
    }
    if (prev) {
      if (prev.getProperty("autoOP") && (texClass === TEXCLASS.BIN || texClass === TEXCLASS.REL)) {
        prevClass = prev.texClass = TEXCLASS.ORD;
      }
      prevClass = this.prevClass = prev.texClass || TEXCLASS.ORD;
      this.prevLevel = this.attributes.getInherited("scriptlevel");
    } else {
      prevClass = this.prevClass = TEXCLASS.NONE;
    }
    if (texClass === TEXCLASS.BIN && (prevClass === TEXCLASS.NONE || prevClass === TEXCLASS.BIN || prevClass === TEXCLASS.OP || prevClass === TEXCLASS.REL || prevClass === TEXCLASS.OPEN || prevClass === TEXCLASS.PUNCT)) {
      this.texClass = TEXCLASS.ORD;
    } else if (prevClass === TEXCLASS.BIN && (texClass === TEXCLASS.REL || texClass === TEXCLASS.CLOSE || texClass === TEXCLASS.PUNCT)) {
      prev.texClass = this.prevClass = TEXCLASS.ORD;
    } else if (texClass === TEXCLASS.BIN) {
      let child = this;
      let parent = this.parent;
      while (parent && parent.parent && parent.isEmbellished && (parent.childNodes.length === 1 || !parent.isKind("mrow") && parent.core() === child)) {
        child = parent;
        parent = parent.parent;
      }
      if (parent.childNodes[parent.childNodes.length - 1] === child) {
        this.texClass = TEXCLASS.ORD;
      }
    }
    return this;
  }
  /**
   * Do the normal inheritance, then look up the attributes from the operator dictionary.
   * If there is no dictionary entry, get the TeX class from the Unicode range list.
   *
   * @override
   */
  setInheritedAttributes(attributes = {}, display = false, level = 0, prime = false) {
    super.setInheritedAttributes(attributes, display, level, prime);
    let mo = this.getText();
    this.checkOperatorTable(mo);
    this.checkPseudoScripts(mo);
    this.checkPrimes(mo);
    this.checkMathAccent(mo);
  }
  /**
   * Set the attributes from the operator table
   *
   * @param {string} mo   The test of the mo element
   */
  checkOperatorTable(mo) {
    let [form1, form2, form3] = this.handleExplicitForm(this.getForms());
    this.attributes.setInherited("form", form1);
    let OPTABLE2 = this.constructor.OPTABLE;
    let def = OPTABLE2[form1][mo] || OPTABLE2[form2][mo] || OPTABLE2[form3][mo];
    if (def) {
      if (this.getProperty("texClass") === void 0) {
        this.texClass = def[2];
      }
      for (const name of Object.keys(def[3] || {})) {
        this.attributes.setInherited(name, def[3][name]);
      }
      this.lspace = (def[0] + 1) / 18;
      this.rspace = (def[1] + 1) / 18;
    } else {
      let range = getRange(mo);
      if (range) {
        if (this.getProperty("texClass") === void 0) {
          this.texClass = range[2];
        }
        const spacing = this.constructor.MMLSPACING[range[2]];
        this.lspace = (spacing[0] + 1) / 18;
        this.rspace = (spacing[1] + 1) / 18;
      }
    }
  }
  /**
   * @return {[string, string, string]}  The list of form attribute values in the
   *                                     order they should be tested, based on the
   *                                     position of the element in its parent.
   */
  getForms() {
    let core = this;
    let parent = this.parent;
    let Parent = this.Parent;
    while (Parent && Parent.isEmbellished) {
      core = parent;
      parent = Parent.parent;
      Parent = Parent.Parent;
    }
    if (parent && parent.isKind("mrow") && parent.nonSpaceLength() !== 1) {
      if (parent.firstNonSpace() === core) {
        return ["prefix", "infix", "postfix"];
      }
      if (parent.lastNonSpace() === core) {
        return ["postfix", "infix", "prefix"];
      }
    }
    return ["infix", "prefix", "postfix"];
  }
  /**
   * @param {string[]} forms     The three forms in the default order they are to be tested
   * @return {string[]}          The forms in the new order, if there is an explicit form attribute
   */
  handleExplicitForm(forms) {
    if (this.attributes.isSet("form")) {
      const form = this.attributes.get("form");
      forms = [form].concat(forms.filter((name) => name !== form));
    }
    return forms;
  }
  /**
   * Mark the mo as a pseudoscript if it is one.  True means it is,
   *   false means it is a pseudo-script character, but in an msup (so needs a variant form)
   *
   * @param {string} mo   The test of the mo element
   */
  checkPseudoScripts(mo) {
    const PSEUDOSCRIPTS = this.constructor.pseudoScripts;
    if (!mo.match(PSEUDOSCRIPTS)) return;
    const parent = this.coreParent().Parent;
    const isPseudo = !parent || !(parent.isKind("msubsup") && !parent.isKind("msub"));
    this.setProperty("pseudoscript", isPseudo);
    if (isPseudo) {
      this.attributes.setInherited("lspace", 0);
      this.attributes.setInherited("rspace", 0);
    }
  }
  /**
   * Determine whether the mo consists of primes, and remap them if so.
   *
   * @param {string} mo   The test of the mo element
   */
  checkPrimes(mo) {
    const PRIMES = this.constructor.primes;
    if (!mo.match(PRIMES)) return;
    const REMAP = this.constructor.remapPrimes;
    const primes = unicodeString(unicodeChars(mo).map((c) => REMAP[c]));
    this.setProperty("primes", primes);
  }
  /**
   * Determine whether the mo is a mathaccent character
   *
   * @param {string} mo   The test of the mo element
   */
  checkMathAccent(mo) {
    const parent = this.Parent;
    if (this.getProperty("mathaccent") !== void 0 || !parent || !parent.isKind("munderover")) return;
    const base = parent.childNodes[0];
    if (base.isEmbellished && base.coreMO() === this) return;
    const MATHACCENT = this.constructor.mathaccents;
    if (mo.match(MATHACCENT)) {
      this.setProperty("mathaccent", true);
    }
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/mtext.ts
var MmlMtext = class extends AbstractMmlTokenNode {
  constructor() {
    super(...arguments);
    /**
     * TeX class is ORD
     */
    this.texclass = TEXCLASS.ORD;
  }
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlTokenNode.defaults
    };
  }
  /**
   * @override
   */
  get kind() {
    return "mtext";
  }
  /**
   * <mtext> is always space-like according to the spec
   * @override
   */
  get isSpacelike() {
    return true;
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/mspace.ts
var MmlMspace = class extends AbstractMmlTokenNode {
  constructor() {
    super(...arguments);
    /**
     * TeX class is ORD
     */
    this.texclass = TEXCLASS.NONE;
  }
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlTokenNode.defaults,
      width: "0em",
      height: "0ex",
      depth: "0ex",
      linebreak: "auto"
    };
  }
  /**
   * @override
   */
  setTeXclass(prev) {
    return prev;
  }
  /**
   * @override
   */
  get kind() {
    return "mspace";
  }
  /**
   * mspace can't have children
   * @override
   */
  get arity() {
    return 0;
  }
  /**
   * @override
   */
  get isSpacelike() {
    return true;
  }
  /**
   * Only process linebreak if the space has no explicit dimensions (according to spec)
   *
   * @override
   */
  get hasNewline() {
    let attributes = this.attributes;
    return attributes.getExplicit("width") == null && attributes.getExplicit("height") == null && attributes.getExplicit("depth") == null && attributes.get("linebreak") === "newline";
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/ms.ts
var MmlMs = class extends AbstractMmlTokenNode {
  constructor() {
    super(...arguments);
    /**
     * TeX class is ORD
     */
    this.texclass = TEXCLASS.ORD;
  }
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlTokenNode.defaults,
      lquote: '"',
      rquote: '"'
    };
  }
  /**
   * @override
   */
  get kind() {
    return "ms";
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/mrow.ts
var MmlMrow = class extends AbstractMmlNode {
  constructor() {
    super(...arguments);
    /**
     * The index of the core child, when acting as an embellish mrow
     */
    this._core = null;
  }
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlNode.defaults
    };
  }
  /**
   * @override
   */
  get kind() {
    return "mrow";
  }
  /**
   * An mrow is space-like if all its children are.
   *
   * @override
   */
  get isSpacelike() {
    for (const child of this.childNodes) {
      if (!child.isSpacelike) {
        return false;
      }
    }
    return true;
  }
  /**
   * An mrow is embellished if it contains one embellished operator
   * and any number of space-like nodes
   *
   * @override
   */
  get isEmbellished() {
    let embellished = false;
    let i = 0;
    for (const child of this.childNodes) {
      if (child) {
        if (child.isEmbellished) {
          if (embellished) {
            return false;
          }
          embellished = true;
          this._core = i;
        } else if (!child.isSpacelike) {
          return false;
        }
      }
      i++;
    }
    return embellished;
  }
  /**
   * @override
   */
  core() {
    if (!this.isEmbellished || this._core == null) {
      return this;
    }
    return this.childNodes[this._core];
  }
  /**
   * @override
   */
  coreMO() {
    if (!this.isEmbellished || this._core == null) {
      return this;
    }
    return this.childNodes[this._core].coreMO();
  }
  /**
   * @return {number}  The number of non-spacelike child nodes
   */
  nonSpaceLength() {
    let n = 0;
    for (const child of this.childNodes) {
      if (child && !child.isSpacelike) {
        n++;
      }
    }
    return n;
  }
  /**
   * @return {MmlNode|null}  The first non-space-like child node
   */
  firstNonSpace() {
    for (const child of this.childNodes) {
      if (child && !child.isSpacelike) {
        return child;
      }
    }
    return null;
  }
  /**
   * @return {MmlNode|null}  The last non-space-like child node
   */
  lastNonSpace() {
    let i = this.childNodes.length;
    while (--i >= 0) {
      let child = this.childNodes[i];
      if (child && !child.isSpacelike) {
        return child;
      }
    }
    return null;
  }
  /**
   * @override
   */
  setTeXclass(prev) {
    if (this.getProperty("open") != null || this.getProperty("close") != null) {
      this.getPrevClass(prev);
      prev = null;
      for (const child of this.childNodes) {
        prev = child.setTeXclass(prev);
      }
      if (this.texClass == null) {
        this.texClass = TEXCLASS.INNER;
      }
    } else {
      for (const child of this.childNodes) {
        prev = child.setTeXclass(prev);
      }
      if (this.childNodes[0]) {
        this.updateTeXclass(this.childNodes[0]);
      }
    }
    return prev;
  }
};
var MmlInferredMrow = class extends MmlMrow {
  static {
    /**
     * @override
     */
    this.defaults = MmlMrow.defaults;
  }
  /**
   * @return {string}  The inferred-mrow kind
   */
  get kind() {
    return "inferredMrow";
  }
  /**
   * @return {boolean}  This is inferred
   */
  get isInferred() {
    return true;
  }
  /**
   * @override
   */
  get notParent() {
    return true;
  }
  /**
   * Show the child nodes in brackets
   */
  toString() {
    return "[" + this.childNodes.join(",") + "]";
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/mfrac.ts
var MmlMfrac = class extends AbstractMmlBaseNode {
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlBaseNode.defaults,
      linethickness: "medium",
      numalign: "center",
      denomalign: "center",
      bevelled: false
    };
  }
  /**
   * @override
   */
  get kind() {
    return "mfrac";
  }
  /**
   * <mfrac> requires two children
   * @override
   */
  get arity() {
    return 2;
  }
  /**
   * The children of <mfrac> can include line breaks
   * @override
   */
  get linebreakContainer() {
    return true;
  }
  /**
   * Update the children separately
   * @override
   */
  setTeXclass(prev) {
    this.getPrevClass(prev);
    for (const child of this.childNodes) {
      child.setTeXclass(null);
    }
    return this;
  }
  /**
   * Adjust the display level, and use prime style in denominator
   * @override
   */
  setChildInheritedAttributes(attributes, display, level, prime) {
    if (!display || level > 0) {
      level++;
    }
    this.childNodes[0].setInheritedAttributes(attributes, false, level, prime);
    this.childNodes[1].setInheritedAttributes(attributes, false, level, true);
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/msqrt.ts
var MmlMsqrt = class extends AbstractMmlNode {
  constructor() {
    super(...arguments);
    /**
     * TeX class is ORD
     */
    this.texclass = TEXCLASS.ORD;
  }
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlNode.defaults
    };
  }
  /**
   * @override
   */
  get kind() {
    return "msqrt";
  }
  /**
   * <msqrt> has an inferred mrow
   * @override
   */
  get arity() {
    return -1;
  }
  /**
   * <msqrt> can contain line breaks
   * @override
   */
  get linebreakContainer() {
    return true;
  }
  /**
   * @override
   */
  setTeXclass(prev) {
    this.getPrevClass(prev);
    this.childNodes[0].setTeXclass(null);
    return this;
  }
  /**
   * The contents of sqrt are in TeX prime style.
   *
   * @override
   */
  setChildInheritedAttributes(attributes, display, level, _prime) {
    this.childNodes[0].setInheritedAttributes(attributes, display, level, true);
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/mroot.ts
var MmlMroot = class extends AbstractMmlNode {
  constructor() {
    super(...arguments);
    /**
     * TeX class is ORD
     */
    this.texclass = TEXCLASS.ORD;
  }
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlNode.defaults
    };
  }
  /**
   * @override
   */
  get kind() {
    return "mroot";
  }
  /**
   * <mroot> requires two children
   * @override
   */
  get arity() {
    return 2;
  }
  /**
   * Set the TeX class for the content of the root and the root separately.
   * Return ourself as the previous item.
   *
   * @override
   */
  setTeXclass(prev) {
    this.getPrevClass(prev);
    this.childNodes[0].setTeXclass(null);
    this.childNodes[1].setTeXclass(null);
    return this;
  }
  /**
   * Set the children display/level/prime for the base and root.
   *
   * @override
   */
  setChildInheritedAttributes(attributes, display, level, prime) {
    this.childNodes[0].setInheritedAttributes(attributes, display, level, true);
    this.childNodes[1].setInheritedAttributes(attributes, false, level + 2, prime);
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/mstyle.ts
var MmlMstyle = class extends AbstractMmlLayoutNode {
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlLayoutNode.defaults,
      scriptlevel: INHERIT,
      displaystyle: INHERIT,
      scriptsizemultiplier: 1 / Math.sqrt(2),
      scriptminsize: "8px",
      // should be 8pt, but that is too large
      mathbackground: INHERIT,
      mathcolor: INHERIT,
      dir: INHERIT,
      infixlinebreakstyle: "before"
    };
  }
  /**
   * @override
   */
  get kind() {
    return "mstyle";
  }
  /**
   * @override
   */
  get notParent() {
    return this.childNodes[0] && this.childNodes[0].childNodes.length === 1;
  }
  /**
   * Handle scriptlevel changes, and add mstyle attributes to the ones being inherited.
   *
   * @override
   */
  setChildInheritedAttributes(attributes, display, level, prime) {
    let scriptlevel = this.attributes.getExplicit("scriptlevel");
    if (scriptlevel != null) {
      scriptlevel = scriptlevel.toString();
      if (scriptlevel.match(/^\s*[-+]/)) {
        level += parseInt(scriptlevel);
      } else {
        level = parseInt(scriptlevel);
      }
      prime = false;
    }
    let displaystyle = this.attributes.getExplicit("displaystyle");
    if (displaystyle != null) {
      display = displaystyle === true;
      prime = false;
    }
    const cramped = this.attributes.getExplicit("data-cramped");
    if (cramped != null) {
      prime = cramped;
    }
    attributes = this.addInheritedAttributes(attributes, this.attributes.getAllAttributes());
    this.childNodes[0].setInheritedAttributes(attributes, display, level, prime);
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/merror.ts
var MmlMerror = class extends AbstractMmlNode {
  constructor() {
    super(...arguments);
    /**
     * TeX class is ORD
     */
    this.texclass = TEXCLASS.ORD;
  }
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlNode.defaults
    };
  }
  /**
   * @override
   */
  get kind() {
    return "merror";
  }
  /**
   * <merror> gets an inferred mrow
   * @override
   */
  get arity() {
    return -1;
  }
  /**
   * <merror> can contain line breaks
   * @override
   */
  get linebreakContainer() {
    return true;
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/mpadded.ts
var MmlMpadded = class extends AbstractMmlLayoutNode {
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlLayoutNode.defaults,
      width: "",
      height: "",
      depth: "",
      lspace: 0,
      voffset: 0
    };
  }
  /**
   * @override
   */
  get kind() {
    return "mpadded";
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/mphantom.ts
var MmlMphantom = class extends AbstractMmlLayoutNode {
  constructor() {
    super(...arguments);
    /**
     * TeX class is ORD
     */
    this.texclass = TEXCLASS.ORD;
  }
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlLayoutNode.defaults
    };
  }
  /**
   * @override
   */
  get kind() {
    return "mphantom";
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/mfenced.ts
var MmlMfenced = class extends AbstractMmlNode {
  constructor() {
    super(...arguments);
    /**
     * TeX class is INNER
     */
    this.texclass = TEXCLASS.INNER;
    /**
     * Storage for "fake" nodes for the separators
     */
    this.separators = [];
    /**
     * Storage for "fake" open node
     */
    this.open = null;
    /**
     * Storage for "fake" close node
     */
    this.close = null;
  }
  static {
    /**
     * @overeride
     */
    this.defaults = {
      ...AbstractMmlNode.defaults,
      open: "(",
      close: ")",
      separators: ","
    };
  }
  /**
   * @override
   */
  get kind() {
    return "mfenced";
  }
  /**
   * Include the fake nodes in the process, since they will be used
   *  to produce the output.
   *
   * @override
   */
  setTeXclass(prev) {
    this.getPrevClass(prev);
    if (this.open) {
      prev = this.open.setTeXclass(prev);
    }
    if (this.childNodes[0]) {
      prev = this.childNodes[0].setTeXclass(prev);
    }
    for (let i = 1, m = this.childNodes.length; i < m; i++) {
      if (this.separators[i - 1]) {
        prev = this.separators[i - 1].setTeXclass(prev);
      }
      if (this.childNodes[i]) {
        prev = this.childNodes[i].setTeXclass(prev);
      }
    }
    if (this.close) {
      prev = this.close.setTeXclass(prev);
    }
    this.updateTeXclass(this.open);
    return prev;
  }
  /**
   * Create the fake nodes and do their inheritance
   * Then do inheridence of usual children
   *
   * @override
   */
  setChildInheritedAttributes(attributes, display, level, prime) {
    this.addFakeNodes();
    for (const child of [this.open, this.close].concat(this.separators)) {
      if (child) {
        child.setInheritedAttributes(attributes, display, level, prime);
      }
    }
    super.setChildInheritedAttributes(attributes, display, level, prime);
  }
  /**
   * Create <mo> elements for the open and close delimiters, and for the separators (if any)
   */
  addFakeNodes() {
    let { open, close, separators } = this.attributes.getList("open", "close", "separators");
    open = open.replace(/[ \t\n\r]/g, "");
    close = close.replace(/[ \t\n\r]/g, "");
    separators = separators.replace(/[ \t\n\r]/g, "");
    if (open) {
      this.open = this.fakeNode(open, { fence: true, form: "prefix" }, TEXCLASS.OPEN);
    }
    if (separators) {
      while (separators.length < this.childNodes.length - 1) {
        separators += separators.charAt(separators.length - 1);
      }
      let i = 0;
      for (const child of this.childNodes.slice(1)) {
        if (child) {
          this.separators.push(this.fakeNode(separators.charAt(i++)));
        }
      }
    }
    if (close) {
      this.close = this.fakeNode(close, { fence: true, form: "postfix" }, TEXCLASS.CLOSE);
    }
  }
  /**
   * @param {string} c                 The character for the text of the node
   * @param {PropertyList} properties  The attributes for the node
   * @param {number} texClass          The TeX class for the node
   * @return {MmlNode}                 The generated <mo> node
   */
  fakeNode(c, properties = {}, texClass = null) {
    let text = this.factory.create("text").setText(c);
    let node = this.factory.create("mo", properties, [text]);
    node.texClass = texClass;
    node.parent = this;
    return node;
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/menclose.ts
var MmlMenclose = class extends AbstractMmlNode {
  constructor() {
    super(...arguments);
    /**
     * TeX class is ORD
     */
    this.texclass = TEXCLASS.ORD;
  }
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlNode.defaults,
      notation: "longdiv"
    };
  }
  /**
   * The menclose kind
   * @override
   */
  get kind() {
    return "menclose";
  }
  /**
   * <menclose> has an inferred mrow
   * @override
   */
  get arity() {
    return -1;
  }
  /**
   * <menclose> is a linebreak container
   * @override
   */
  get linebreakContininer() {
    return true;
  }
  /**
   * @override
   */
  setTeXclass(prev) {
    prev = this.childNodes[0].setTeXclass(prev);
    this.updateTeXclass(this.childNodes[0]);
    return prev;
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/maction.ts
var MmlMaction = class extends AbstractMmlNode {
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlNode.defaults,
      actiontype: "toggle",
      selection: 1
    };
  }
  /**
   * @override
   */
  get kind() {
    return "maction";
  }
  /**
   * At least one child
   * @override
   */
  get arity() {
    return 1;
  }
  /**
   * @return {MmlNode}  The selected child node (or an mrow if none selected)
   */
  get selected() {
    const selection = this.attributes.get("selection");
    const i = Math.max(1, Math.min(this.childNodes.length, selection)) - 1;
    return this.childNodes[i] || this.factory.create("mrow");
  }
  /**
   * @override
   */
  get isEmbellished() {
    return this.selected.isEmbellished;
  }
  /**
   * @override
   */
  get isSpacelike() {
    return this.selected.isSpacelike;
  }
  /**
   * @override
   */
  core() {
    return this.selected.core();
  }
  /**
   * @override
   */
  coreMO() {
    return this.selected.coreMO();
  }
  /**
   * @override
   */
  verifyAttributes(options2) {
    super.verifyAttributes(options2);
    if (this.attributes.get("actiontype") !== "toggle" && this.attributes.getExplicit("selection") !== void 0) {
      const attributes = this.attributes.getAllAttributes();
      delete attributes.selection;
    }
  }
  /**
   * Get the TeX class from the selceted node
   * For tooltips, set TeX classes within the tip as a separate math list
   *
   * @override
   */
  setTeXclass(prev) {
    if (this.attributes.get("actiontype") === "tooltip" && this.childNodes[1]) {
      this.childNodes[1].setTeXclass(null);
    }
    let selected = this.selected;
    prev = selected.setTeXclass(prev);
    this.updateTeXclass(selected);
    return prev;
  }
  /**
   * Select the next child for a toggle action
   */
  nextToggleSelection() {
    let selection = Math.max(1, this.attributes.get("selection") + 1);
    if (selection > this.childNodes.length) {
      selection = 1;
    }
    this.attributes.set("selection", selection);
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/msubsup.ts
var MmlMsubsup = class extends AbstractMmlBaseNode {
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlBaseNode.defaults,
      subscriptshift: "",
      superscriptshift: ""
    };
  }
  /**
   * @override
   */
  get kind() {
    return "msubsup";
  }
  /**
   * <msubsup> requires three children
   * @override
   */
  get arity() {
    return 3;
  }
  /**
   * @return {number}  The position of the base element
   */
  get base() {
    return 0;
  }
  /**
   * @return {number}  The position of the subscript (overridden in msup below)
   */
  get sub() {
    return 1;
  }
  /**
   * @return {number}  The position of the superscript (overridden in msup below)
   */
  get sup() {
    return 2;
  }
  /**
   * Super- and subscripts are not in displaymode, have scriptlevel increased, and prime style in subscripts.
   *
   * @override
   */
  setChildInheritedAttributes(attributes, display, level, prime) {
    let nodes = this.childNodes;
    nodes[0].setInheritedAttributes(attributes, display, level, prime);
    nodes[1].setInheritedAttributes(attributes, false, level + 1, prime || this.sub === 1);
    if (!nodes[2]) {
      return;
    }
    nodes[2].setInheritedAttributes(attributes, false, level + 1, prime || this.sub === 2);
  }
};
var MmlMsub = class extends MmlMsubsup {
  static {
    /**
     * @override
     */
    this.defaults = {
      ...MmlMsubsup.defaults
    };
  }
  /**
   * @override
   */
  get kind() {
    return "msub";
  }
  /**
   * <msub> only gets two children
   * @override
   */
  get arity() {
    return 2;
  }
};
var MmlMsup = class extends MmlMsubsup {
  static {
    /**
     * @override
     */
    this.defaults = {
      ...MmlMsubsup.defaults
    };
  }
  /**
   * @override
   */
  get kind() {
    return "msup";
  }
  /**
   * <msup> only gets two children
   * @override
   */
  get arity() {
    return 2;
  }
  /**
   * child 1 is superscript
   * @override
   */
  get sup() {
    return 1;
  }
  /**
   * child 2 is null (no subscript)
   * @override
   */
  get sub() {
    return 2;
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/munderover.ts
var MmlMunderover = class extends AbstractMmlBaseNode {
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlBaseNode.defaults,
      accent: false,
      accentunder: false,
      align: "center"
    };
  }
  static {
    /**
     * The names of attributes controling accents for each child node (reversed for mover below)
     */
    this.ACCENTS = ["", "accentunder", "accent"];
  }
  /**
   * @override
   */
  get kind() {
    return "munderover";
  }
  /**
   * <munderover> requires three children
   * @override
   */
  get arity() {
    return 3;
  }
  /**
   * @return {number}  The base is child 0
   */
  get base() {
    return 0;
  }
  /**
   * @return {number}  Child 1 goes under (overridden by mover below)
   */
  get under() {
    return 1;
  }
  /**
   * @return {number}  Child 2 goes over (overridden by mover below)
   */
  get over() {
    return 2;
  }
  /**
   * <munderover> can contain line breaks
   * @override
   */
  get linebreakContainer() {
    return true;
  }
  /**
   * Base is in prime style if there is an over node
   * Force scriptlevel change if converted to sub-sup by movablelimits on the base in non-display mode
   * Adjust displaystyle, scriptlevel, and primestyle for the under/over nodes and check if accent
   *   values have changed due to the inheritance (e.g., settings in operator dictionary)
   *
   * @override
   */
  setChildInheritedAttributes(attributes, display, level, prime) {
    let nodes = this.childNodes;
    nodes[0].setInheritedAttributes(attributes, display, level, prime || !!nodes[this.over]);
    let force = !!(!display && nodes[0].coreMO().attributes.get("movablelimits"));
    let ACCENTS = this.constructor.ACCENTS;
    nodes[1].setInheritedAttributes(
      attributes,
      false,
      this.getScriptlevel(ACCENTS[1], force, level),
      prime || this.under === 1
    );
    this.setInheritedAccent(1, ACCENTS[1], display, level, prime, force);
    if (!nodes[2]) {
      return;
    }
    nodes[2].setInheritedAttributes(
      attributes,
      false,
      this.getScriptlevel(ACCENTS[2], force, level),
      prime || this.under === 2
    );
    this.setInheritedAccent(2, ACCENTS[2], display, level, prime, force);
  }
  /**
   * @param {string} accent  The name of the accent attribute to check ("accent" or "accentunder")
   * @param {boolean} force  True if the scriptlevel change is to be forced to occur
   * @param {number} level   The current scriptlevel
   * @return {number}        The new script level based on the accent attribute
   */
  getScriptlevel(accent, force, level) {
    if (force || !this.attributes.get(accent)) {
      level++;
    }
    return level;
  }
  /**
   * Check if an under or over accent should cause the appropriate accent attribute to be inherited
   *   on the munderover node, and if it is not the default, re-inherit the scriptlevel, since that
   *   is affected by the accent attribute
   *
   * @param {number} n         The index of the node to check
   * @param {string} accent    The name of the accent attribute to check ("accent" or "accentunder")
   * @param {boolean} display  The displaystyle
   * @param {number} level     The scriptlevel
   * @param {number} prime     The TeX prime style
   * @param {boolean} force    Whether to force the scriptlevel change
   */
  setInheritedAccent(n, accent, display, level, prime, force) {
    let node = this.childNodes[n];
    if (this.attributes.getExplicit(accent) == null && node.isEmbellished) {
      let value = node.coreMO().attributes.get("accent");
      this.attributes.setInherited(accent, value);
      if (value !== this.attributes.getDefault(accent)) {
        node.setInheritedAttributes({}, display, this.getScriptlevel(accent, force, level), prime);
      }
    }
  }
};
var MmlMunder = class extends MmlMunderover {
  static {
    /**
     * @override
     */
    this.defaults = {
      ...MmlMunderover.defaults
    };
  }
  /**
   * @override
   */
  get kind() {
    return "munder";
  }
  /**
   * <munder> has only two children
   * @override
   */
  get arity() {
    return 2;
  }
};
var MmlMover = class extends MmlMunderover {
  static {
    /**
     * @override
     */
    this.defaults = {
      ...MmlMunderover.defaults
    };
  }
  static {
    /**
     *  The first child is the over accent (second never occurs)
     */
    this.ACCENTS = ["", "accent", "accentunder"];
  }
  /**
   * @override
   */
  get kind() {
    return "mover";
  }
  /**
   * <mover> has only two children
   * @override
   */
  get arity() {
    return 2;
  }
  /**
   * Child 1 is the over node
   * @override
   */
  get over() {
    return 1;
  }
  /**
   * Child 2 is the null (the under node)
   * @override
   */
  get under() {
    return 2;
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/mmultiscripts.ts
var MmlMmultiscripts = class extends MmlMsubsup {
  static {
    /**
     * @override
     */
    this.defaults = {
      ...MmlMsubsup.defaults
    };
  }
  /**
   * @override
   */
  get kind() {
    return "mmultiscripts";
  }
  /**
   * <mmultiscripts> requires at least one child (the base)
   * @override
   */
  get arity() {
    return 1;
  }
  /**
   * Push the inherited values to the base
   * Make sure the number of pre- and post-scripts are even by adding mrows, if needed.
   * For the scripts, use displaystyle = false, scriptlevel + 1, and
   *   set the primestyle in the subscripts.
   *
   * @override
   */
  setChildInheritedAttributes(attributes, display, level, prime) {
    this.childNodes[0].setInheritedAttributes(attributes, display, level, prime);
    let prescripts = false;
    for (let i = 1, n = 0; i < this.childNodes.length; i++) {
      let child = this.childNodes[i];
      if (child.isKind("mprescripts")) {
        if (!prescripts) {
          prescripts = true;
          if (i % 2 === 0) {
            let mrow = this.factory.create("mrow");
            this.childNodes.splice(i, 0, mrow);
            mrow.parent = this;
            i++;
          }
        }
      } else {
        let primestyle = prime || n % 2 === 0;
        child.setInheritedAttributes(attributes, false, level + 1, primestyle);
        n++;
      }
    }
    if (this.childNodes.length % 2 === (prescripts ? 1 : 0)) {
      this.appendChild(this.factory.create("mrow"));
      this.childNodes[this.childNodes.length - 1].setInheritedAttributes(attributes, false, level + 1, prime);
    }
  }
  /**
   * Check that mprescripts only occurs once, and that the number of pre- and post-scripts are even.
   *
   * @override
   */
  verifyChildren(options2) {
    let prescripts = false;
    let fix = options2["fixMmultiscripts"];
    for (let i = 0; i < this.childNodes.length; i++) {
      let child = this.childNodes[i];
      if (child.isKind("mprescripts")) {
        if (prescripts) {
          child.mError(child.kind + " can only appear once in " + this.kind, options2, true);
        } else {
          prescripts = true;
          if (i % 2 === 0 && !fix) {
            this.mError("There must be an equal number of prescripts of each type", options2);
          }
        }
      }
    }
    if (this.childNodes.length % 2 === (prescripts ? 1 : 0) && !fix) {
      this.mError("There must be an equal number of scripts of each type", options2);
    }
    super.verifyChildren(options2);
  }
};
var MmlMprescripts = class extends AbstractMmlNode {
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlNode.defaults
    };
  }
  /**
   * @return {string}  The mprescripts kind
   */
  get kind() {
    return "mprescripts";
  }
  /**
   * @return {number}  <mprescripts> can have no children
   */
  get arity() {
    return 0;
  }
  /**
   * Check that parent is mmultiscripts
   *
   * @override
   */
  verifyTree(options2) {
    super.verifyTree(options2);
    if (this.parent && !this.parent.isKind("mmultiscripts")) {
      this.mError(this.kind + " must be a child of mmultiscripts", options2, true);
    }
  }
};
var MmlNone = class extends AbstractMmlNode {
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlNode.defaults
    };
  }
  /**
   * @return {string}  The none kind
   */
  get kind() {
    return "none";
  }
  /**
   * @return {number}  <none> can have no children
   */
  get arity() {
    return 0;
  }
  /**
   * Check that parent is mmultiscripts
   *
   * @override
   */
  verifyTree(options2) {
    super.verifyTree(options2);
    if (this.parent && !this.parent.isKind("mmultiscripts")) {
      this.mError(this.kind + " must be a child of mmultiscripts", options2, true);
    }
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/mtable.ts
var MmlMtable = class extends AbstractMmlNode {
  constructor() {
    super(...arguments);
    /**
     * Extra properties for this node
     */
    this.properties = {
      useHeight: true
    };
    /**
     * TeX class is ORD
     */
    this.texclass = TEXCLASS.ORD;
  }
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlNode.defaults,
      align: "axis",
      rowalign: "baseline",
      columnalign: "center",
      groupalign: "{left}",
      alignmentscope: true,
      columnwidth: "auto",
      width: "auto",
      rowspacing: "1ex",
      columnspacing: ".8em",
      rowlines: "none",
      columnlines: "none",
      frame: "none",
      framespacing: "0.4em 0.5ex",
      equalrows: false,
      equalcolumns: false,
      displaystyle: false,
      side: "right",
      minlabelspacing: "0.8em"
    };
  }
  /**
   * @override
   */
  get kind() {
    return "mtable";
  }
  /**
   * Linebreaks are allowed in tables
   * @override
   */
  get linebreakContainer() {
    return true;
  }
  /**
   * @override
   */
  setInheritedAttributes(attributes, display, level, prime) {
    for (const name of indentAttributes) {
      if (attributes[name]) {
        this.attributes.setInherited(name, attributes[name][1]);
      }
      if (this.attributes.getExplicit(name) !== void 0) {
        delete this.attributes.getAllAttributes()[name];
      }
    }
    super.setInheritedAttributes(attributes, display, level, prime);
  }
  /**
   * Make sure all children are mtr or mlabeledtr nodes
   * Inherit the table attributes, and set the display attribute based on the table's displaystyle attribute
   * Reset the prime value to false
   *
   * @override
   */
  setChildInheritedAttributes(attributes, display, level, _prime) {
    for (const child of this.childNodes) {
      if (!child.isKind("mtr")) {
        this.replaceChild(this.factory.create("mtr"), child).appendChild(child);
      }
    }
    level = this.getProperty("scriptlevel") || level;
    display = !!(this.attributes.getExplicit("displaystyle") || this.attributes.getDefault("displaystyle"));
    attributes = this.addInheritedAttributes(attributes, {
      columnalign: this.attributes.get("columnalign"),
      rowalign: "center"
    });
    const cramped = this.attributes.getExplicit("data-cramped");
    const ralign = split(this.attributes.get("rowalign"));
    for (const child of this.childNodes) {
      attributes.rowalign[1] = ralign.shift() || attributes.rowalign[1];
      child.setInheritedAttributes(attributes, display, level, !!cramped);
    }
  }
  /**
   * Check that children are mtr or mlabeledtr
   *
   * @override
   */
  verifyChildren(options2) {
    let mtr = null;
    const factory = this.factory;
    for (let i = 0; i < this.childNodes.length; i++) {
      const child = this.childNodes[i];
      if (child.isKind("mtr")) {
        mtr = null;
      } else {
        const isMtd = child.isKind("mtd");
        if (mtr) {
          this.removeChild(child);
          i--;
        } else {
          mtr = this.replaceChild(factory.create("mtr"), child);
        }
        mtr.appendChild(isMtd ? child : factory.create("mtd", {}, [child]));
        if (!options2["fixMtables"]) {
          child.parent.removeChild(child);
          child.parent = this;
          isMtd && mtr.appendChild(factory.create("mtd"));
          const merror = child.mError("Children of " + this.kind + " must be mtr or mlabeledtr", options2, isMtd);
          mtr.childNodes[mtr.childNodes.length - 1].appendChild(merror);
        }
      }
    }
    super.verifyChildren(options2);
  }
  /**
   * @override
   */
  setTeXclass(prev) {
    this.getPrevClass(prev);
    for (const child of this.childNodes) {
      child.setTeXclass(null);
    }
    return this;
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/mtr.ts
var MmlMtr = class extends AbstractMmlNode {
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlNode.defaults,
      rowalign: INHERIT,
      columnalign: INHERIT,
      groupalign: INHERIT
    };
  }
  /**
   * @override
   */
  get kind() {
    return "mtr";
  }
  /**
   * <mtr> can contain linebreaks
   * @override
   */
  get linebreakContainer() {
    return true;
  }
  /**
   * Inherit the mtr attributes
   *
   * @override
   */
  setChildInheritedAttributes(attributes, display, level, prime) {
    for (const child of this.childNodes) {
      if (!child.isKind("mtd")) {
        this.replaceChild(this.factory.create("mtd"), child).appendChild(child);
      }
    }
    const calign = split(this.attributes.get("columnalign"));
    if (this.arity === 1) {
      calign.unshift(this.parent.attributes.get("side"));
    }
    attributes = this.addInheritedAttributes(attributes, {
      rowalign: this.attributes.get("rowalign"),
      columnalign: "center"
    });
    for (const child of this.childNodes) {
      attributes.columnalign[1] = calign.shift() || attributes.columnalign[1];
      child.setInheritedAttributes(attributes, display, level, prime);
    }
  }
  /**
   * Check that parent is mtable and children are mtd
   *
   * @override
   */
  verifyChildren(options2) {
    if (this.parent && !this.parent.isKind("mtable")) {
      this.mError(this.kind + " can only be a child of an mtable", options2, true);
      return;
    }
    for (const child of this.childNodes) {
      if (!child.isKind("mtd")) {
        let mtd = this.replaceChild(this.factory.create("mtd"), child);
        mtd.appendChild(child);
        if (!options2["fixMtables"]) {
          child.mError("Children of " + this.kind + " must be mtd", options2);
        }
      }
    }
    super.verifyChildren(options2);
  }
  /**
   * @override
   */
  setTeXclass(prev) {
    this.getPrevClass(prev);
    for (const child of this.childNodes) {
      child.setTeXclass(null);
    }
    return this;
  }
};
var MmlMlabeledtr = class extends MmlMtr {
  /**
   * @override
   */
  get kind() {
    return "mlabeledtr";
  }
  /**
   * <mlabeledtr> requires at least one child (the label)
   * @override
   */
  get arity() {
    return 1;
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/mtd.ts
var MmlMtd = class extends AbstractMmlBaseNode {
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlBaseNode.defaults,
      rowspan: 1,
      columnspan: 1,
      rowalign: INHERIT,
      columnalign: INHERIT,
      groupalign: INHERIT
    };
  }
  /**
   * @override
   */
  get kind() {
    return "mtd";
  }
  /**
   * <mtd> has an inferred mrow
   * @overrride
   */
  get arity() {
    return -1;
  }
  /**
   * <mtd> can contain line breaks
   * @override
   */
  get linebreakContainer() {
    return true;
  }
  /**
   * Check that parent is mtr
   *
   * @override
   */
  verifyChildren(options2) {
    if (this.parent && !this.parent.isKind("mtr")) {
      this.mError(this.kind + " can only be a child of an mtr or mlabeledtr", options2, true);
      return;
    }
    super.verifyChildren(options2);
  }
  /**
   * @override
   */
  setTeXclass(prev) {
    this.getPrevClass(prev);
    this.childNodes[0].setTeXclass(null);
    return this;
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/maligngroup.ts
var MmlMaligngroup = class extends AbstractMmlLayoutNode {
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlLayoutNode.defaults,
      groupalign: INHERIT
    };
  }
  /**
   * @override
   */
  get kind() {
    return "maligngroup";
  }
  /**
   * <maligngroup> is space-like
   * @override
   */
  get isSpacelike() {
    return true;
  }
  /**
   * Children can inherit from <maligngroup>
   * @override
   */
  setChildInheritedAttributes(attributes, display, level, prime) {
    attributes = this.addInheritedAttributes(attributes, this.attributes.getAllAttributes());
    super.setChildInheritedAttributes(attributes, display, level, prime);
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/malignmark.ts
var MmlMalignmark = class extends AbstractMmlNode {
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlNode.defaults,
      edge: "left"
    };
  }
  /**
   * @override
   */
  get kind() {
    return "malignmark";
  }
  /**
   * No children allowed
   * @override
   */
  get arity() {
    return 0;
  }
  /**
   * <malignmark> is space-like
   * @override
   */
  get isSpacelike() {
    return true;
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/mglyph.ts
var MmlMglyph = class extends AbstractMmlTokenNode {
  constructor() {
    super(...arguments);
    /**
     * TeX class is ORD
     */
    this.texclass = TEXCLASS.ORD;
  }
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlTokenNode.defaults,
      alt: "",
      src: "",
      index: "",
      width: "auto",
      height: "auto",
      valign: "0em"
    };
  }
  /**
   * @override
   */
  get kind() {
    return "mglyph";
  }
  /**
   * @override
   */
  verifyAttributes(options2) {
    const { src, fontfamily, index } = this.attributes.getList("src", "fontfamily", "index");
    if (src === "" && (fontfamily === "" || index === "")) {
      this.mError("mglyph must have either src or fontfamily and index attributes", options2, true);
    } else {
      super.verifyAttributes(options2);
    }
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/semantics.ts
var MmlSemantics = class extends AbstractMmlBaseNode {
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlBaseNode.defaults,
      definitionUrl: null,
      encoding: null
    };
  }
  /**
   * @override
   */
  get kind() {
    return "semantics";
  }
  /**
   * <semantics> requires at least one node
   * @override
   */
  get arity() {
    return 1;
  }
  /**
   * Ignore <semantics> when looking for partent node
   * @override
   */
  get notParent() {
    return true;
  }
};
var MmlAnnotationXML = class extends AbstractMmlNode {
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlNode.defaults,
      definitionUrl: null,
      encoding: null,
      cd: "mathmlkeys",
      name: "",
      src: null
    };
  }
  /**
   * @override
   */
  get kind() {
    return "annotation-xml";
  }
  /**
   * Children are XMLNodes, so don't bother inheritting to them
   * @override
   */
  setChildInheritedAttributes() {
  }
};
var MmlAnnotation = class extends MmlAnnotationXML {
  constructor() {
    super(...arguments);
    /**
     * Extra properties for this node
     */
    this.properties = {
      isChars: true
    };
  }
  static {
    /**
     * @override
     */
    this.defaults = {
      ...MmlAnnotationXML.defaults
    };
  }
  /**
   * @override
   */
  get kind() {
    return "annotation";
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/TeXAtom.ts
var TeXAtom = class extends AbstractMmlBaseNode {
  /**
   * @override
   */
  constructor(factory, attributes, children) {
    super(factory, attributes, children);
    /**
     * TeX class is ORD
     */
    this.texclass = TEXCLASS.ORD;
    this.setProperty("texClass", this.texClass);
  }
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlBaseNode.defaults
    };
  }
  /**
   * @override
   */
  get kind() {
    return "TeXAtom";
  }
  /**
   * Inferred mrow with any number of children
   * @override
   */
  get arity() {
    return -1;
  }
  /**
   * This element is not considered a MathML container
   * @override
   */
  get notParent() {
    return this.childNodes[0] && this.childNodes[0].childNodes.length === 1;
  }
  /**
   * @override
   */
  setTeXclass(prev) {
    this.childNodes[0].setTeXclass(null);
    return this.adjustTeXclass(prev);
  }
  /**
   * (Replaced below by the version from the MmlMo node)
   *
   * @override
   */
  adjustTeXclass(prev) {
    return prev;
  }
};
TeXAtom.prototype.adjustTeXclass = MmlMo.prototype.adjustTeXclass;

// node_modules/mathjax-full/ts/core/MmlTree/MmlNodes/mathchoice.ts
var MathChoice = class extends AbstractMmlBaseNode {
  static {
    /**
     * @override
     */
    this.defaults = {
      ...AbstractMmlBaseNode.defaults
    };
  }
  /**
   *  @override
   */
  get kind() {
    return "MathChoice";
  }
  /**
   * 4 children (display, text, script, and scriptscript styles)
   * @override
   */
  get arity() {
    return 4;
  }
  /**
   * This element is not considered a MathML container
   * @override
   */
  get notParent() {
    return true;
  }
  /**
   * Replace the MathChoice node with the selected on based on the displaystyle and scriptlevel settings
   * (so the MathChoice never ends up in a finished MmlNode tree)
   *
   * @override
   */
  setInheritedAttributes(attributes, display, level, prime) {
    const selection = display ? 0 : Math.max(0, Math.min(level, 2)) + 1;
    const child = this.childNodes[selection] || this.factory.create("mrow");
    this.parent.replaceChild(child, this);
    child.setInheritedAttributes(attributes, display, level, prime);
  }
};

// node_modules/mathjax-full/ts/core/MmlTree/MML.ts
var MML = {
  [MmlMath.prototype.kind]: MmlMath,
  [MmlMi.prototype.kind]: MmlMi,
  [MmlMn.prototype.kind]: MmlMn,
  [MmlMo.prototype.kind]: MmlMo,
  [MmlMtext.prototype.kind]: MmlMtext,
  [MmlMspace.prototype.kind]: MmlMspace,
  [MmlMs.prototype.kind]: MmlMs,
  [MmlMrow.prototype.kind]: MmlMrow,
  [MmlInferredMrow.prototype.kind]: MmlInferredMrow,
  [MmlMfrac.prototype.kind]: MmlMfrac,
  [MmlMsqrt.prototype.kind]: MmlMsqrt,
  [MmlMroot.prototype.kind]: MmlMroot,
  [MmlMstyle.prototype.kind]: MmlMstyle,
  [MmlMerror.prototype.kind]: MmlMerror,
  [MmlMpadded.prototype.kind]: MmlMpadded,
  [MmlMphantom.prototype.kind]: MmlMphantom,
  [MmlMfenced.prototype.kind]: MmlMfenced,
  [MmlMenclose.prototype.kind]: MmlMenclose,
  [MmlMaction.prototype.kind]: MmlMaction,
  [MmlMsub.prototype.kind]: MmlMsub,
  [MmlMsup.prototype.kind]: MmlMsup,
  [MmlMsubsup.prototype.kind]: MmlMsubsup,
  [MmlMunder.prototype.kind]: MmlMunder,
  [MmlMover.prototype.kind]: MmlMover,
  [MmlMunderover.prototype.kind]: MmlMunderover,
  [MmlMmultiscripts.prototype.kind]: MmlMmultiscripts,
  [MmlMprescripts.prototype.kind]: MmlMprescripts,
  [MmlNone.prototype.kind]: MmlNone,
  [MmlMtable.prototype.kind]: MmlMtable,
  [MmlMlabeledtr.prototype.kind]: MmlMlabeledtr,
  [MmlMtr.prototype.kind]: MmlMtr,
  [MmlMtd.prototype.kind]: MmlMtd,
  [MmlMaligngroup.prototype.kind]: MmlMaligngroup,
  [MmlMalignmark.prototype.kind]: MmlMalignmark,
  [MmlMglyph.prototype.kind]: MmlMglyph,
  [MmlSemantics.prototype.kind]: MmlSemantics,
  [MmlAnnotation.prototype.kind]: MmlAnnotation,
  [MmlAnnotationXML.prototype.kind]: MmlAnnotationXML,
  [TeXAtom.prototype.kind]: TeXAtom,
  [MathChoice.prototype.kind]: MathChoice,
  [TextNode.prototype.kind]: TextNode,
  [XMLNode.prototype.kind]: XMLNode
};

// node_modules/mathjax-full/ts/core/MmlTree/MmlFactory.ts
var MmlFactory = class extends AbstractNodeFactory {
  static {
    /**
     * The default node-creation functions
     */
    this.defaultNodes = MML;
  }
  /**
   * @return {Object}  The list of node-creation functions (similar to the
   *                   MML object from MathJax v2).
   */
  get MML() {
    return this.node;
  }
};

// node_modules/mathjax-full/ts/util/BitField.ts
var BitField = class _BitField {
  constructor() {
    /**
     * The bits that are set
     */
    this.bits = 0;
  }
  static {
    /**
     * The largest bit available
     */
    this.MAXBIT = 1 << 31;
  }
  static {
    /**
     * The next bit to be allocated
     */
    this.next = 1;
  }
  static {
    /**
     * The map of names to bit positions
     */
    this.names = /* @__PURE__ */ new Map();
  }
  /**
   * @param {string} names    The names of the bit positions to reserve
   */
  static allocate(...names) {
    for (const name of names) {
      if (this.has(name)) {
        throw new Error("Bit already allocated for " + name);
      }
      if (this.next === _BitField.MAXBIT) {
        throw new Error("Maximum number of bits already allocated");
      }
      this.names.set(name, this.next);
      this.next <<= 1;
    }
  }
  /**
   * @param {string} name   The name of the bit to check for being defined
   * @return {boolean}      True if the named bit is already allocated
   */
  static has(name) {
    return this.names.has(name);
  }
  /**
   * @param {string} name    The name of the bit position to set
   */
  set(name) {
    this.bits |= this.getBit(name);
  }
  /**
   * @param {string} name    The name of the bit position to clear
   */
  clear(name) {
    this.bits &= ~this.getBit(name);
  }
  /**
   * @param {string} name   The name of the bit to check if set
   * @return {boolean}      True if the named bit is set
   */
  isSet(name) {
    return !!(this.bits & this.getBit(name));
  }
  /**
   * Clear all bits
   */
  reset() {
    this.bits = 0;
  }
  /**
   * @param {string} name   The name whose bit position is needed (error if not defined)
   * @return {number}       The position of the named bit
   */
  getBit(name) {
    const bit = this.constructor.names.get(name);
    if (!bit) {
      throw new Error("Unknown bit-field name: " + name);
    }
    return bit;
  }
};
function BitFieldClass(...names) {
  const Bits = class extends BitField {
  };
  Bits.allocate(...names);
  return Bits;
}

// node_modules/mathjax-full/ts/core/MathDocument.ts
var RenderList = class extends PrioritizedList {
  /**
   * Creates a new RenderList from an initial list of rendering actions
   *
   * @param {RenderActions} actions The list of actions to take during render(), rerender(), and convert() calls
   * @returns {RenderList}    The newly created prioritied list
   */
  static create(actions) {
    const list = new this();
    for (const id of Object.keys(actions)) {
      const [action, priority] = this.action(id, actions[id]);
      if (priority) {
        list.add(action, priority);
      }
    }
    return list;
  }
  /**
   * Parses a RenderAction to produce the correspinding RenderData item
   *  (e.g., turn method names into actual functions that call the method)
   *
   * @param {string} id               The id of the action
   * @param {RenderAction} action     The RenderAction defining the action
   * @returns {[RenderData,number]}   The corresponding RenderData definition for the action and its priority
   */
  static action(id, action) {
    let renderDoc, renderMath;
    let convert = true;
    let priority = action[0];
    if (action.length === 1 || typeof action[1] === "boolean") {
      action.length === 2 && (convert = action[1]);
      [renderDoc, renderMath] = this.methodActions(id);
    } else if (typeof action[1] === "string") {
      if (typeof action[2] === "string") {
        action.length === 4 && (convert = action[3]);
        const [method1, method2] = action.slice(1);
        [renderDoc, renderMath] = this.methodActions(method1, method2);
      } else {
        action.length === 3 && (convert = action[2]);
        [renderDoc, renderMath] = this.methodActions(action[1]);
      }
    } else {
      action.length === 4 && (convert = action[3]);
      [renderDoc, renderMath] = action.slice(1);
    }
    return [{ id, renderDoc, renderMath, convert }, priority];
  }
  /**
   * Produces the doc and math actions for the given method name(s)
   *   (a blank name is a no-op)
   *
   * @param {string} method1    The method to use for the render() call
   * @param {string} method1    The method to use for the rerender() and convert() calls
   */
  static methodActions(method1, method2 = method1) {
    return [
      (document2) => {
        method1 && document2[method1]();
        return false;
      },
      (math, document2) => {
        method2 && math[method2](document2);
        return false;
      }
    ];
  }
  /**
   * Perform the document-level rendering functions
   *
   * @param {MathDocument} document   The MathDocument whose methods are to be called
   * @param {number=} start           The state at which to start rendering (default is UNPROCESSED)
   */
  renderDoc(document2, start = STATE.UNPROCESSED) {
    for (const item of this.items) {
      if (item.priority >= start) {
        if (item.item.renderDoc(document2)) return;
      }
    }
  }
  /**
   * Perform the MathItem-level rendering functions
   *
   * @param {MathItem} math           The MathItem whose methods are to be called
   * @param {MathDocument} document   The MathDocument to pass to the MathItem methods
   * @param {number=} start           The state at which to start rendering (default is UNPROCESSED)
   */
  renderMath(math, document2, start = STATE.UNPROCESSED) {
    for (const item of this.items) {
      if (item.priority >= start) {
        if (item.item.renderMath(math, document2)) return;
      }
    }
  }
  /**
   * Perform the MathItem-level conversion functions
   *
   * @param {MathItem} math           The MathItem whose methods are to be called
   * @param {MathDocument} document   The MathDocument to pass to the MathItem methods
   * @param {number=} end             The state at which to end rendering (default is LAST)
   */
  renderConvert(math, document2, end = STATE.LAST) {
    for (const item of this.items) {
      if (item.priority > end) return;
      if (item.item.convert) {
        if (item.item.renderMath(math, document2)) return;
      }
    }
  }
  /**
   * Find an entry in the list with a given ID
   *
   * @param {string} id            The id to search for
   * @returns {RenderData|null}   The data for the given id, if found, or null
   */
  findID(id) {
    for (const item of this.items) {
      if (item.item.id === id) {
        return item.item;
      }
    }
    return null;
  }
};
var resetOptions = {
  all: false,
  processed: false,
  inputJax: null,
  outputJax: null
};
var resetAllOptions = {
  all: true,
  processed: true,
  inputJax: [],
  outputJax: []
};
var DefaultInputJax = class extends AbstractInputJax {
  /**
   * @override
   */
  compile(_math) {
    return null;
  }
};
var DefaultOutputJax = class extends AbstractOutputJax {
  /**
   * @override
   */
  typeset(_math, _document = null) {
    return null;
  }
  /**
   * @override
   */
  escaped(_math, _document) {
    return null;
  }
};
var DefaultMathList = class extends AbstractMathList {
};
var DefaultMathItem = class extends AbstractMathItem {
};
var AbstractMathDocument = class _AbstractMathDocument {
  static {
    /**
     * The type of MathDocument
     */
    this.KIND = "MathDocument";
  }
  static {
    /**
     * The default options for the document
     */
    this.OPTIONS = {
      OutputJax: null,
      // instance of an OutputJax for the document
      InputJax: null,
      // instance of an InputJax or an array of them
      MmlFactory: null,
      // instance of a MmlFactory for this document
      MathList: DefaultMathList,
      // constructor for a MathList to use for the document
      MathItem: DefaultMathItem,
      // constructor for a MathItem to use for the MathList
      compileError: (doc, math, err) => {
        doc.compileError(math, err);
      },
      typesetError: (doc, math, err) => {
        doc.typesetError(math, err);
      },
      renderActions: expandable({
        find: [STATE.FINDMATH, "findMath", "", false],
        compile: [STATE.COMPILED],
        metrics: [STATE.METRICS, "getMetrics", "", false],
        typeset: [STATE.TYPESET],
        update: [STATE.INSERTED, "updateDocument", false]
      })
    };
  }
  static {
    /**
     * A bit-field for the actions that have been processed
     */
    this.ProcessBits = BitFieldClass("findMath", "compile", "getMetrics", "typeset", "updateDocument");
  }
  /**
   * @param {any} document           The document (HTML string, parsed DOM, etc.) to be processed
   * @param {DOMAdaptor} adaptor     The DOM adaptor for this document
   * @param {OptionList} options     The options for this document
   * @constructor
   */
  constructor(document2, adaptor2, options2) {
    let CLASS = this.constructor;
    this.document = document2;
    this.options = userOptions(defaultOptions({}, CLASS.OPTIONS), options2);
    this.math = new (this.options["MathList"] || DefaultMathList)();
    this.renderActions = RenderList.create(this.options["renderActions"]);
    this.processed = new _AbstractMathDocument.ProcessBits();
    this.outputJax = this.options["OutputJax"] || new DefaultOutputJax();
    let inputJax = this.options["InputJax"] || [new DefaultInputJax()];
    if (!Array.isArray(inputJax)) {
      inputJax = [inputJax];
    }
    this.inputJax = inputJax;
    this.adaptor = adaptor2;
    this.outputJax.setAdaptor(adaptor2);
    this.inputJax.map((jax) => jax.setAdaptor(adaptor2));
    this.mmlFactory = this.options["MmlFactory"] || new MmlFactory();
    this.inputJax.map((jax) => jax.setMmlFactory(this.mmlFactory));
    this.outputJax.initialize();
    this.inputJax.map((jax) => jax.initialize());
  }
  /**
   * @return {string}  The kind of document
   */
  get kind() {
    return this.constructor.KIND;
  }
  /**
   * @override
   */
  addRenderAction(id, ...action) {
    const [fn, p] = RenderList.action(id, action);
    this.renderActions.add(fn, p);
  }
  /**
   * @override
   */
  removeRenderAction(id) {
    const action = this.renderActions.findID(id);
    if (action) {
      this.renderActions.remove(action);
    }
  }
  /**
   * @override
   */
  render() {
    this.renderActions.renderDoc(this);
    return this;
  }
  /**
   * @override
   */
  rerender(start = STATE.RERENDER) {
    this.state(start - 1);
    this.render();
    return this;
  }
  /**
   * @override
   */
  convert(math, options2 = {}) {
    let { format, display, end, ex, em: em2, containerWidth, lineWidth, scale, family } = userOptions({
      format: this.inputJax[0].name,
      display: true,
      end: STATE.LAST,
      em: 16,
      ex: 8,
      containerWidth: null,
      lineWidth: 1e6,
      scale: 1,
      family: ""
    }, options2);
    if (containerWidth === null) {
      containerWidth = 80 * ex;
    }
    const jax = this.inputJax.reduce((jax2, ijax) => ijax.name === format ? ijax : jax2, null);
    const mitem = new this.options.MathItem(math, jax, display);
    mitem.start.node = this.adaptor.body(this.document);
    mitem.setMetrics(em2, ex, containerWidth, lineWidth, scale);
    if (this.outputJax.options.mtextInheritFont) {
      mitem.outputData.mtextFamily = family;
    }
    if (this.outputJax.options.merrorInheritFont) {
      mitem.outputData.merrorFamily = family;
    }
    mitem.convert(this, end);
    return mitem.typesetRoot || mitem.root;
  }
  /**
   * @override
   */
  findMath(_options = null) {
    this.processed.set("findMath");
    return this;
  }
  /**
   * @override
   */
  compile() {
    if (!this.processed.isSet("compile")) {
      const recompile = [];
      for (const math of this.math) {
        this.compileMath(math);
        if (math.inputData.recompile !== void 0) {
          recompile.push(math);
        }
      }
      for (const math of recompile) {
        const data = math.inputData.recompile;
        math.state(data.state);
        math.inputData.recompile = data;
        this.compileMath(math);
      }
      this.processed.set("compile");
    }
    return this;
  }
  /**
   * @param {MathItem} math   The item to compile
   */
  compileMath(math) {
    try {
      math.compile(this);
    } catch (err) {
      if (err.retry || err.restart) {
        throw err;
      }
      this.options["compileError"](this, math, err);
      math.inputData["error"] = err;
    }
  }
  /**
   * Produce an error using MmlNodes
   *
   * @param {MathItem} math  The MathItem producing the error
   * @param {Error} err      The Error object for the error
   */
  compileError(math, err) {
    math.root = this.mmlFactory.create("math", null, [
      this.mmlFactory.create("merror", { "data-mjx-error": err.message, title: err.message }, [
        this.mmlFactory.create("mtext", null, [
          this.mmlFactory.create("text").setText("Math input error")
        ])
      ])
    ]);
    if (math.display) {
      math.root.attributes.set("display", "block");
    }
    math.inputData.error = err.message;
  }
  /**
   * @override
   */
  typeset() {
    if (!this.processed.isSet("typeset")) {
      for (const math of this.math) {
        try {
          math.typeset(this);
        } catch (err) {
          if (err.retry || err.restart) {
            throw err;
          }
          this.options["typesetError"](this, math, err);
          math.outputData["error"] = err;
        }
      }
      this.processed.set("typeset");
    }
    return this;
  }
  /**
   * Produce an error using HTML
   *
   * @param {MathItem} math  The MathItem producing the error
   * @param {Error} err      The Error object for the error
   */
  typesetError(math, err) {
    math.typesetRoot = this.adaptor.node("mjx-container", {
      class: "MathJax mjx-output-error",
      jax: this.outputJax.name
    }, [
      this.adaptor.node("span", {
        "data-mjx-error": err.message,
        title: err.message,
        style: {
          color: "red",
          "background-color": "yellow",
          "line-height": "normal"
        }
      }, [
        this.adaptor.text("Math output error")
      ])
    ]);
    if (math.display) {
      this.adaptor.setAttributes(math.typesetRoot, {
        style: {
          display: "block",
          margin: "1em 0",
          "text-align": "center"
        }
      });
    }
    math.outputData.error = err.message;
  }
  /**
   * @override
   */
  getMetrics() {
    if (!this.processed.isSet("getMetrics")) {
      this.outputJax.getMetrics(this);
      this.processed.set("getMetrics");
    }
    return this;
  }
  /**
   * @override
   */
  updateDocument() {
    if (!this.processed.isSet("updateDocument")) {
      for (const math of this.math.reversed()) {
        math.updateDocument(this);
      }
      this.processed.set("updateDocument");
    }
    return this;
  }
  /**
   * @override
   */
  removeFromDocument(_restore = false) {
    return this;
  }
  /**
   * @override
   */
  state(state, restore = false) {
    for (const math of this.math) {
      math.state(state, restore);
    }
    if (state < STATE.INSERTED) {
      this.processed.clear("updateDocument");
    }
    if (state < STATE.TYPESET) {
      this.processed.clear("typeset");
      this.processed.clear("getMetrics");
    }
    if (state < STATE.COMPILED) {
      this.processed.clear("compile");
    }
    return this;
  }
  /**
   * @override
   */
  reset(options2 = { processed: true }) {
    options2 = userOptions(Object.assign({}, resetOptions), options2);
    options2.all && Object.assign(options2, resetAllOptions);
    options2.processed && this.processed.reset();
    options2.inputJax && this.inputJax.forEach((jax) => jax.reset(...options2.inputJax));
    options2.outputJax && this.outputJax.reset(...options2.outputJax);
    return this;
  }
  /**
   * @override
   */
  clear() {
    this.reset();
    this.math.clear();
    return this;
  }
  /**
   * @override
   */
  concat(list) {
    this.math.merge(list);
    return this;
  }
  /**
   * @override
   */
  clearMathItemsWithin(containers) {
    const items = this.getMathItemsWithin(containers);
    this.math.remove(...items);
    return items;
  }
  /**
   * @override
   */
  getMathItemsWithin(elements) {
    if (!Array.isArray(elements)) {
      elements = [elements];
    }
    const adaptor2 = this.adaptor;
    const items = [];
    const containers = adaptor2.getElements(elements, this.document);
    ITEMS:
      for (const item of this.math) {
        for (const container of containers) {
          if (item.start.node && adaptor2.contains(container, item.start.node)) {
            items.push(item);
            continue ITEMS;
          }
        }
      }
    return items;
  }
};

// node_modules/mathjax-full/ts/core/Handler.ts
var DefaultMathDocument = class extends AbstractMathDocument {
};
var AbstractHandler = class {
  /**
   * @param {number} priority  The priority to use for this handler
   *
   * @constructor
   */
  constructor(adaptor2, priority = 5) {
    /**
     * The class implementing the MathDocument for this handler
     *   (so it can be subclassed by extensions as needed)
     */
    this.documentClass = DefaultMathDocument;
    this.adaptor = adaptor2;
    this.priority = priority;
  }
  static {
    /**
     * The name of this class
     */
    this.NAME = "generic";
  }
  /**
   * @return {string}  The name of this handler class
   */
  get name() {
    return this.constructor.NAME;
  }
  /**
   * @override
   */
  handlesDocument(_document) {
    return false;
  }
  /**
   * @override
   */
  create(document2, options2) {
    return new this.documentClass(document2, this.adaptor, options2);
  }
};

// node_modules/mathjax-full/ts/handlers/html/HTMLMathItem.ts
var HTMLMathItem = class extends AbstractMathItem {
  /**
   * Easy access to DOM adaptor
   */
  get adaptor() {
    return this.inputJax.adaptor;
  }
  /**
   * @override
   */
  constructor(math, jax, display = true, start = { node: null, n: 0, delim: "" }, end = { node: null, n: 0, delim: "" }) {
    super(math, jax, display, start, end);
  }
  /**
   * Insert the typeset MathItem into the document at the right location
   *   If the starting and ending nodes are the same:
   *     Split the text to isolate the math and its delimiters
   *     Replace the math by the typeset version
   *   Otherewise (spread over several nodes)
   *     Split the start node, if needed
   *     Remove nodes until we reach the end node
   *     Insert the math before the end node
   *     Split the end node, if needed
   *     Remove the end node
   *
   * @override
   */
  updateDocument(_html) {
    if (this.state() < STATE.INSERTED) {
      if (this.inputJax.processStrings) {
        let node = this.start.node;
        if (node === this.end.node) {
          if (this.end.n && this.end.n < this.adaptor.value(this.end.node).length) {
            this.adaptor.split(this.end.node, this.end.n);
          }
          if (this.start.n) {
            node = this.adaptor.split(this.start.node, this.start.n);
          }
          this.adaptor.replace(this.typesetRoot, node);
        } else {
          if (this.start.n) {
            node = this.adaptor.split(node, this.start.n);
          }
          while (node !== this.end.node) {
            let next = this.adaptor.next(node);
            this.adaptor.remove(node);
            node = next;
          }
          this.adaptor.insert(this.typesetRoot, node);
          if (this.end.n < this.adaptor.value(node).length) {
            this.adaptor.split(node, this.end.n);
          }
          this.adaptor.remove(node);
        }
      } else {
        this.adaptor.replace(this.typesetRoot, this.start.node);
      }
      this.start.node = this.end.node = this.typesetRoot;
      this.start.n = this.end.n = 0;
      this.state(STATE.INSERTED);
    }
  }
  /**
   * Update the style sheet for any changes due to rerendering
   *
   * @param {HTMLDocument} document   The document whose styles are to be updated
   */
  updateStyleSheet(document2) {
    document2.addStyleSheet();
  }
  /**
   * Remove the typeset math from the document, and put back the original
   *  expression and its delimiters, if requested.
   *
   * @override
   */
  removeFromDocument(restore = false) {
    if (this.state() >= STATE.TYPESET) {
      const adaptor2 = this.adaptor;
      let node = this.start.node;
      let math = adaptor2.text("");
      if (restore) {
        let text = this.start.delim + this.math + this.end.delim;
        if (this.inputJax.processStrings) {
          math = adaptor2.text(text);
        } else {
          const doc = adaptor2.parse(text, "text/html");
          math = adaptor2.firstChild(adaptor2.body(doc));
        }
      }
      if (adaptor2.parent(node)) {
        adaptor2.replace(math, node);
      }
      this.start.node = this.end.node = math;
      this.start.n = this.end.n = 0;
    }
  }
};

// node_modules/mathjax-full/ts/handlers/html/HTMLMathList.ts
var HTMLMathList = class extends AbstractMathList {
};

// node_modules/mathjax-full/ts/handlers/html/HTMLDomStrings.ts
var HTMLDomStrings = class {
  static {
    /**
     * The default options for string processing
     */
    this.OPTIONS = {
      skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code", "annotation", "annotation-xml"],
      // The names of the tags whose contents will not be
      // scanned for math delimiters
      includeHtmlTags: { br: "\n", wbr: "", "#comment": "" },
      //  tags to be included in the text (and what
      //  text to replace them with)
      ignoreHtmlClass: "mathjax_ignore",
      // the class name of elements whose contents should
      // NOT be processed by tex2jax.  Note that this
      // is a regular expression, so be sure to quote any
      // regexp special characters
      processHtmlClass: "mathjax_process"
      // the class name of elements whose contents SHOULD
      // be processed when they appear inside ones that
      // are ignored.  Note that this is a regular expression,
      // so be sure to quote any regexp special characters
    };
  }
  /**
   * @param {OptionList} options  The user-supplied options
   * @constructor
   */
  constructor(options2 = null) {
    let CLASS = this.constructor;
    this.options = userOptions(defaultOptions({}, CLASS.OPTIONS), options2);
    this.init();
    this.getPatterns();
  }
  /**
   * Set the initial values of the main properties
   */
  init() {
    this.strings = [];
    this.string = "";
    this.snodes = [];
    this.nodes = [];
    this.stack = [];
  }
  /**
   * Create the search patterns for skipHtmlTags, ignoreHtmlClass, and processHtmlClass
   */
  getPatterns() {
    let skip = makeArray(this.options["skipHtmlTags"]);
    let ignore = makeArray(this.options["ignoreHtmlClass"]);
    let process = makeArray(this.options["processHtmlClass"]);
    this.skipHtmlTags = new RegExp("^(?:" + skip.join("|") + ")$", "i");
    this.ignoreHtmlClass = new RegExp("(?:^| )(?:" + ignore.join("|") + ")(?: |$)");
    this.processHtmlClass = new RegExp("(?:^| )(?:" + process + ")(?: |$)");
  }
  /**
   * Add a string to the string array and record its node list
   */
  pushString() {
    if (this.string.match(/\S/)) {
      this.strings.push(this.string);
      this.nodes.push(this.snodes);
    }
    this.string = "";
    this.snodes = [];
  }
  /**
   * Add more text to the current string, and record the
   * node and its position in the string.
   *
   * @param {N|T} node        The node to be pushed
   * @param {string} text   The text to be added (it may not be the actual text
   *                         of the node, if it is one of the nodes that gets
   *                         translated to text, like <br> to a newline).
   */
  extendString(node, text) {
    this.snodes.push([node, text.length]);
    this.string += text;
  }
  /**
   * Handle a #text node (add its text to the current string)
   *
   * @param {T} node          The Text node to process
   * @param {boolean} ignore  Whether we are currently ignoring content
   * @return {N | T}          The next element to process
   */
  handleText(node, ignore) {
    if (!ignore) {
      this.extendString(node, this.adaptor.value(node));
    }
    return this.adaptor.next(node);
  }
  /**
   * Handle a BR, WBR, or #comment element (or others in the includeHtmlTags object).
   *
   * @param {N} node          The node to process
   * @param {boolean} ignore  Whether we are currently ignoring content
   * @return {N | T}          The next element to process
   */
  handleTag(node, ignore) {
    if (!ignore) {
      let text = this.options["includeHtmlTags"][this.adaptor.kind(node)];
      this.extendString(node, text);
    }
    return this.adaptor.next(node);
  }
  /**
   * Handle an arbitrary DOM node:
   *   Check the class to see if it matches the processHtmlClass regex
   *   If the node has a child and is not marked as created by MathJax (data-MJX)
   *       and either it is marked as restarting processing or is not a tag to be skipped, then
   *     Save the next node (if there is one) and whether we are currently ignoring content
   *     Move to the first child node
   *     Update whether we are ignoring content
   *   Otherwise
   *     Move on to the next sibling
   *   Return the next node to process and the ignore state
   *
   * @param {N} node               The node to process
   * @param {boolean} ignore       Whether we are currently ignoring content
   * @return {[N|T, boolean]}      The next element to process and whether to ignore its content
   */
  handleContainer(node, ignore) {
    this.pushString();
    const cname = this.adaptor.getAttribute(node, "class") || "";
    const tname = this.adaptor.kind(node) || "";
    const process = this.processHtmlClass.exec(cname);
    let next = node;
    if (this.adaptor.firstChild(node) && !this.adaptor.getAttribute(node, "data-MJX") && (process || !this.skipHtmlTags.exec(tname))) {
      if (this.adaptor.next(node)) {
        this.stack.push([this.adaptor.next(node), ignore]);
      }
      next = this.adaptor.firstChild(node);
      ignore = (ignore || this.ignoreHtmlClass.exec(cname)) && !process;
    } else {
      next = this.adaptor.next(node);
    }
    return [next, ignore];
  }
  /**
   * Handle an unknown node type (nodeType other than 1, 3, 8)
   *
   * @param {N} node           The node to process
   * @param {boolean} ignore   Whether we are currently ignoring content
   * @return {N|T}             The next element to process
   */
  handleOther(node, _ignore) {
    this.pushString();
    return this.adaptor.next(node);
  }
  /**
   * Find the strings for a given DOM element:
   *   Initialize the state
   *   Get the element where we stop processing
   *   While we still have a node, and it is not the one where we are to stop:
   *     If it is a text node, handle it and get the next node
   *     Otherwise, if it is in the includeHtmlTags list, handle it and get the next node
   *     Otherwise, handle it as a container and get the next node and ignore status
   *     If there is no next node, and there are more nodes on the stack:
   *       Save the current string, and pop the node and ignore status from the stack
   *   Push the final string
   *   Get the string array and array of associated DOM nodes
   *   Clear the internal values (so the memory can be freed)
   *   Return the strings and node lists
   *
   * @param {N} node                       The node to search
   * @return {[string[], HTMLNodeList[]]}  The array of strings and their associated lists of nodes
   */
  find(node) {
    this.init();
    let stop = this.adaptor.next(node);
    let ignore = false;
    let include = this.options["includeHtmlTags"];
    while (node && node !== stop) {
      const kind = this.adaptor.kind(node);
      if (kind === "#text") {
        node = this.handleText(node, ignore);
      } else if (include.hasOwnProperty(kind)) {
        node = this.handleTag(node, ignore);
      } else if (kind) {
        [node, ignore] = this.handleContainer(node, ignore);
      } else {
        node = this.handleOther(node, ignore);
      }
      if (!node && this.stack.length) {
        this.pushString();
        [node, ignore] = this.stack.pop();
      }
    }
    this.pushString();
    let result = [this.strings, this.nodes];
    this.init();
    return result;
  }
};

// node_modules/mathjax-full/ts/handlers/html/HTMLDocument.ts
var HTMLDocument = class extends AbstractMathDocument {
  static {
    /**
     * The kind of document
     */
    this.KIND = "HTML";
  }
  static {
    /**
     * The default options for HTMLDocument
     */
    this.OPTIONS = {
      ...AbstractMathDocument.OPTIONS,
      renderActions: expandable({
        ...AbstractMathDocument.OPTIONS.renderActions,
        styles: [STATE.INSERTED + 1, "", "updateStyleSheet", false]
        // update styles on a rerender() call
      }),
      MathList: HTMLMathList,
      // Use the HTMLMathList for MathLists
      MathItem: HTMLMathItem,
      // Use the HTMLMathItem for MathItem
      DomStrings: null
      // Use the default DomString parser
    };
  }
  /**
   * @override
   * @constructor
   * @extends {AbstractMathDocument}
   */
  constructor(document2, adaptor2, options2) {
    let [html, dom] = separateOptions(options2, HTMLDomStrings.OPTIONS);
    super(document2, adaptor2, html);
    this.domStrings = this.options["DomStrings"] || new HTMLDomStrings(dom);
    this.domStrings.adaptor = adaptor2;
    this.styles = [];
  }
  /**
   * Creates a Location object for a delimiter at the position given by index in the N's string
   *  of the array of strings searched for math, recovering the original DOM node where the delimiter
   *  was found.
   *
   * @param {number} N             The index of the string in the string array
   * @param {number} index         The position within the N's string that needs to be found
   * @param {string} delim         The delimiter for this position
   * @param {HTMLNodeArray} nodes  The list of node lists representing the string array
   * @return {Location}            The Location object for the position of the delimiter in the document
   */
  findPosition(N, index, delim, nodes) {
    const adaptor2 = this.adaptor;
    for (const list of nodes[N]) {
      let [node, n] = list;
      if (index <= n && adaptor2.kind(node) === "#text") {
        return { node, n: Math.max(index, 0), delim };
      }
      index -= n;
    }
    return { node: null, n: 0, delim };
  }
  /**
   * Convert a ProtoItem to a MathItem (i.e., determine the actual Location
   *  objects for its start and end)
   *
   * @param {ProtoItem} item       The proto math item to turn into an actual MathItem
   * @param {InputJax} jax         The input jax to use for the MathItem
   * @param {HTMLNodeArray} nodes  The array of node lists that produced the string array
   * @return {HTMLMathItem}        The MathItem for the given proto item
   */
  mathItem(item, jax, nodes) {
    let math = item.math;
    let start = this.findPosition(item.n, item.start.n, item.open, nodes);
    let end = this.findPosition(item.n, item.end.n, item.close, nodes);
    return new this.options.MathItem(math, jax, item.display, start, end);
  }
  /**
   * Find math within the document:
   *  Get the list of containers (default is document.body), and for each:
   *    For each input jax:
   *      Make a new MathList to store the located math
   *      If the input jax processes strings:
   *        If we haven't already made the string array and corresponding node list, do so
   *        Ask the jax to find the math in the string array, and
   *          for each one, push it onto the math list
   *      Otherwise (the jax processes DOM nodes):
   *        Ask the jax to find the math in the container, and
   *          for each one, make the result into a MathItem, and push it on the list
   *      Merge the new math list into the document's math list
   *        (we use merge to maintain a sorted list of MathItems)
   *
   * @override
   */
  findMath(options2) {
    if (!this.processed.isSet("findMath")) {
      this.adaptor.document = this.document;
      options2 = userOptions({ elements: this.options.elements || [this.adaptor.body(this.document)] }, options2);
      for (const container of this.adaptor.getElements(options2["elements"], this.document)) {
        let [strings, nodes] = [null, null];
        for (const jax of this.inputJax) {
          let list = new this.options["MathList"]();
          if (jax.processStrings) {
            if (strings === null) {
              [strings, nodes] = this.domStrings.find(container);
            }
            for (const math of jax.findMath(strings)) {
              list.push(this.mathItem(math, jax, nodes));
            }
          } else {
            for (const math of jax.findMath(container)) {
              let item = new this.options.MathItem(math.math, jax, math.display, math.start, math.end);
              list.push(item);
            }
          }
          this.math.merge(list);
        }
      }
      this.processed.set("findMath");
    }
    return this;
  }
  /**
   * @override
   */
  updateDocument() {
    if (!this.processed.isSet("updateDocument")) {
      this.addPageElements();
      this.addStyleSheet();
      super.updateDocument();
      this.processed.set("updateDocument");
    }
    return this;
  }
  /**
   *  Add any elements needed for the document
   */
  addPageElements() {
    const body = this.adaptor.body(this.document);
    const node = this.documentPageElements();
    if (node) {
      this.adaptor.append(body, node);
    }
  }
  /**
   * Add the stylesheet to the document
   */
  addStyleSheet() {
    const sheet = this.documentStyleSheet();
    const adaptor2 = this.adaptor;
    if (sheet && !adaptor2.parent(sheet)) {
      const head = adaptor2.head(this.document);
      let styles = this.findSheet(head, adaptor2.getAttribute(sheet, "id"));
      if (styles) {
        adaptor2.replace(sheet, styles);
      } else {
        adaptor2.append(head, sheet);
      }
    }
  }
  /**
   * @param {N} head     The document <head>
   * @param {string} id  The id of the stylesheet to find
   * @param {N|null}     The stylesheet with the given ID
   */
  findSheet(head, id) {
    if (id) {
      for (const sheet of this.adaptor.tags(head, "style")) {
        if (this.adaptor.getAttribute(sheet, "id") === id) {
          return sheet;
        }
      }
    }
    return null;
  }
  /**
   * @override
   */
  removeFromDocument(restore = false) {
    if (this.processed.isSet("updateDocument")) {
      for (const math of this.math) {
        if (math.state() >= STATE.INSERTED) {
          math.state(STATE.TYPESET, restore);
        }
      }
    }
    this.processed.clear("updateDocument");
    return this;
  }
  /**
   * @override
   */
  documentStyleSheet() {
    return this.outputJax.styleSheet(this);
  }
  /**
   * @override
   */
  documentPageElements() {
    return this.outputJax.pageElements(this);
  }
  /**
   * Add styles to be included in the document's stylesheet
   *
   * @param {StyleList} styles   The styles to include
   */
  addStyles(styles) {
    this.styles.push(styles);
  }
  /**
   * Get the array of document-specific styles
   */
  getStyles() {
    return this.styles;
  }
};

// node_modules/mathjax-full/ts/handlers/html/HTMLHandler.ts
var HTMLHandler = class extends AbstractHandler {
  constructor() {
    super(...arguments);
    // declare a more specific adaptor type
    /**
     * @override
     */
    this.documentClass = HTMLDocument;
  }
  /**
   * @override
   */
  handlesDocument(document2) {
    const adaptor2 = this.adaptor;
    if (typeof document2 === "string") {
      try {
        document2 = adaptor2.parse(document2, "text/html");
      } catch (err) {
      }
    }
    if (document2 instanceof adaptor2.window.Document || document2 instanceof adaptor2.window.HTMLElement || document2 instanceof adaptor2.window.DocumentFragment) {
      return true;
    }
    return false;
  }
  /**
   * If the document isn't already a Document object, create one
   * using the given data
   *
   * @override
   */
  create(document2, options2) {
    const adaptor2 = this.adaptor;
    if (typeof document2 === "string") {
      document2 = adaptor2.parse(document2, "text/html");
    } else if (document2 instanceof adaptor2.window.HTMLElement || document2 instanceof adaptor2.window.DocumentFragment) {
      let child = document2;
      document2 = adaptor2.parse("", "text/html");
      adaptor2.append(adaptor2.body(document2), child);
    }
    return super.create(document2, options2);
  }
};

// node_modules/mathjax-full/ts/handlers/html.ts
function RegisterHTMLHandler(adaptor2) {
  const handler = new HTMLHandler(adaptor2);
  mathjax.handlers.register(handler);
  return handler;
}

// node_modules/mathjax-full/ts/input/tex/MapHandler.ts
var MapHandler;
((MapHandler2) => {
  let maps = /* @__PURE__ */ new Map();
  MapHandler2.register = function(map) {
    maps.set(map.name, map);
  };
  MapHandler2.getMap = function(name) {
    return maps.get(name);
  };
})(MapHandler || (MapHandler = {}));
var SubHandler = class {
  constructor() {
    this._configuration = new PrioritizedList();
    this._fallback = new FunctionList();
  }
  /**
   * Adds a list of symbol maps to the handler.
   * @param {string[]} maps The names of the symbol maps to add.
   * @param {ParseMethod} fallback A fallback method.
   * @param {number} priority Optionally a priority.
   */
  add(maps, fallback, priority = PrioritizedList.DEFAULTPRIORITY) {
    for (const name of maps.slice().reverse()) {
      let map = MapHandler.getMap(name);
      if (!map) {
        this.warn("Configuration " + name + " not found! Omitted.");
        return;
      }
      this._configuration.add(map, priority);
    }
    if (fallback) {
      this._fallback.add(fallback, priority);
    }
  }
  /**
   * Parses the given input with the first applicable symbol map.
   * @param {ParseInput} input The input for the parser.
   * @return {ParseResult} The output of the parsing function.
   */
  parse(input) {
    for (let { item: map } of this._configuration) {
      const result = map.parse(input);
      if (result) {
        return result;
      }
    }
    let [env, symbol] = input;
    Array.from(this._fallback)[0].item(env, symbol);
  }
  /**
   * Maps a symbol to its "parse value" if it exists.
   *
   * @param {string} symbol The symbol to parse.
   * @return {T} A boolean, Character, or Macro.
   */
  lookup(symbol) {
    let map = this.applicable(symbol);
    return map ? map.lookup(symbol) : null;
  }
  /**
   * Checks if a symbol is contained in one of the symbol mappings of this
   * configuration.
   *
   * @param {string} symbol The symbol to parse.
   * @return {boolean} True if the symbol is contained in the mapping.
   */
  contains(symbol) {
    return this.applicable(symbol) ? true : false;
  }
  /**
   * @override
   */
  toString() {
    let names = [];
    for (let { item: map } of this._configuration) {
      names.push(map.name);
    }
    return names.join(", ");
  }
  /**
   * Retrieves the first applicable symbol map in the configuration.
   * @param {string} symbol The symbol to parse.
   * @return {SymbolMap} A map that can parse the symbol.
   */
  applicable(symbol) {
    for (let { item: map } of this._configuration) {
      if (map.contains(symbol)) {
        return map;
      }
    }
    return null;
  }
  /**
   * Retrieves the map of the given name.
   * @param {string} name Name of the symbol map.
   * @return {SymbolMap} The map if it exists.
   */
  retrieve(name) {
    for (let { item: map } of this._configuration) {
      if (map.name === name) {
        return map;
      }
    }
    return null;
  }
  /**
   * Prints a warning message.
   * @param {string} message The warning.
   */
  warn(message) {
    console.log("TexParser Warning: " + message);
  }
};
var SubHandlers = class {
  constructor() {
    this.map = /* @__PURE__ */ new Map();
  }
  /**
   * Adds a symbol map to the configuration if it exists.
   * @param {string} name of the symbol map.
   */
  add(handlers, fallbacks, priority = PrioritizedList.DEFAULTPRIORITY) {
    for (const key of Object.keys(handlers)) {
      let name = key;
      let subHandler = this.get(name);
      if (!subHandler) {
        subHandler = new SubHandler();
        this.set(name, subHandler);
      }
      subHandler.add(handlers[name], fallbacks[name], priority);
    }
  }
  /**
   * Setter for subhandlers.
   * @param {HandlerType} name The name of the subhandler.
   * @param {SubHandler} subHandler The subhandler.
   */
  set(name, subHandler) {
    this.map.set(name, subHandler);
  }
  /**
   * Getter for subhandler.
   * @param {HandlerType} name Name of the subhandler.
   * @return {SubHandler} The subhandler by that name if it exists.
   */
  get(name) {
    return this.map.get(name);
  }
  /**
   * Retrieves a symbol map of the given name.
   * @param {string} name Name of the symbol map.
   * @return {SymbolMap} The map if it exists. O/w null.
   */
  retrieve(name) {
    for (const handler of this.map.values()) {
      let map = handler.retrieve(name);
      if (map) {
        return map;
      }
    }
    return null;
  }
  /**
   * All names of registered subhandlers.
   * @return {IterableIterator<string>} Iterable list of keys.
   */
  keys() {
    return this.map.keys();
  }
};

// node_modules/mathjax-full/ts/input/tex/NodeUtil.ts
var NodeUtil;
((NodeUtil2) => {
  const attrs = /* @__PURE__ */ new Map([
    ["autoOP", true],
    ["fnOP", true],
    ["movesupsub", true],
    ["subsupOK", true],
    ["texprimestyle", true],
    ["useHeight", true],
    ["variantForm", true],
    ["withDelims", true],
    ["mathaccent", true],
    ["open", true],
    ["close", true]
  ]);
  function createEntity(code) {
    return String.fromCodePoint(parseInt(code, 16));
  }
  NodeUtil2.createEntity = createEntity;
  function getChildren(node) {
    return node.childNodes;
  }
  NodeUtil2.getChildren = getChildren;
  function getText(node) {
    return node.getText();
  }
  NodeUtil2.getText = getText;
  function appendChildren(node, children) {
    for (let child of children) {
      node.appendChild(child);
    }
  }
  NodeUtil2.appendChildren = appendChildren;
  function setAttribute(node, attribute, value) {
    node.attributes.set(attribute, value);
  }
  NodeUtil2.setAttribute = setAttribute;
  function setProperty(node, property, value) {
    node.setProperty(property, value);
  }
  NodeUtil2.setProperty = setProperty;
  function setProperties(node, properties) {
    for (const name of Object.keys(properties)) {
      let value = properties[name];
      if (name === "texClass") {
        node.texClass = value;
        node.setProperty(name, value);
      } else if (name === "movablelimits") {
        node.setProperty("movablelimits", value);
        if (node.isKind("mo") || node.isKind("mstyle")) {
          node.attributes.set("movablelimits", value);
        }
      } else if (name === "inferred") {
      } else if (attrs.has(name)) {
        node.setProperty(name, value);
      } else {
        node.attributes.set(name, value);
      }
    }
  }
  NodeUtil2.setProperties = setProperties;
  function getProperty(node, property) {
    return node.getProperty(property);
  }
  NodeUtil2.getProperty = getProperty;
  function getAttribute(node, attr) {
    return node.attributes.get(attr);
  }
  NodeUtil2.getAttribute = getAttribute;
  function removeProperties(node, ...properties) {
    node.removeProperty(...properties);
  }
  NodeUtil2.removeProperties = removeProperties;
  function getChildAt(node, position) {
    return node.childNodes[position];
  }
  NodeUtil2.getChildAt = getChildAt;
  function setChild(node, position, child) {
    let children = node.childNodes;
    children[position] = child;
    if (child) {
      child.parent = node;
    }
  }
  NodeUtil2.setChild = setChild;
  function copyChildren(oldNode, newNode) {
    let children = oldNode.childNodes;
    for (let i = 0; i < children.length; i++) {
      setChild(newNode, i, children[i]);
    }
  }
  NodeUtil2.copyChildren = copyChildren;
  function copyAttributes(oldNode, newNode) {
    newNode.attributes = oldNode.attributes;
    setProperties(newNode, oldNode.getAllProperties());
  }
  NodeUtil2.copyAttributes = copyAttributes;
  function isType(node, kind) {
    return node.isKind(kind);
  }
  NodeUtil2.isType = isType;
  function isEmbellished(node) {
    return node.isEmbellished;
  }
  NodeUtil2.isEmbellished = isEmbellished;
  function getTexClass(node) {
    return node.texClass;
  }
  NodeUtil2.getTexClass = getTexClass;
  function getCoreMO(node) {
    return node.coreMO();
  }
  NodeUtil2.getCoreMO = getCoreMO;
  function isNode(item) {
    return item instanceof AbstractMmlNode || item instanceof AbstractMmlEmptyNode;
  }
  NodeUtil2.isNode = isNode;
  function isInferred(node) {
    return node.isInferred;
  }
  NodeUtil2.isInferred = isInferred;
  function getForm(node) {
    if (!isType(node, "mo")) {
      return null;
    }
    let mo = node;
    let forms = mo.getForms();
    for (let form of forms) {
      let symbol = MmlMo.OPTABLE[form][mo.getText()];
      if (symbol) {
        return symbol;
      }
    }
    return null;
  }
  NodeUtil2.getForm = getForm;
})(NodeUtil || (NodeUtil = {}));
var NodeUtil_default = NodeUtil;

// node_modules/mathjax-full/ts/input/tex/TexError.ts
var TexError = class _TexError {
  /**
   * @constructor
   * @param{string} id        message id (for localization)
   * @param{string} message   text of English message
   * @param{string[]=} rest   any substitution arguments
   */
  constructor(id, message, ...rest) {
    this.id = id;
    this.message = _TexError.processString(message, rest);
  }
  static {
    this.pattern = /%(\d+|\{\d+\}|\{[a-z]+:\%\d+(?:\|(?:%\{\d+\}|%.|[^\}])*)+\}|.)/g;
  }
  /**
   * The old MathJax processing function.
   * @param {string} str The basic error message.
   * @param {string[]} args The arguments to be replaced in the error message.
   * @return {string} The processed error string.
   */
  static processString(str, args) {
    let parts = str.split(_TexError.pattern);
    for (let i = 1, m = parts.length; i < m; i += 2) {
      let c = parts[i].charAt(0);
      if (c >= "0" && c <= "9") {
        parts[i] = args[parseInt(parts[i], 10) - 1];
        if (typeof parts[i] === "number") {
          parts[i] = parts[i].toString();
        }
      } else if (c === "{") {
        c = parts[i].substr(1);
        if (c >= "0" && c <= "9") {
          parts[i] = args[parseInt(parts[i].substr(1, parts[i].length - 2), 10) - 1];
          if (typeof parts[i] === "number") {
            parts[i] = parts[i].toString();
          }
        } else {
          let match = parts[i].match(/^\{([a-z]+):%(\d+)\|(.*)\}$/);
          if (match) {
            parts[i] = "%" + parts[i];
          }
        }
      }
      if (parts[i] == null) {
        parts[i] = "???";
      }
    }
    return parts.join("");
  }
};

// node_modules/mathjax-full/ts/input/tex/ParseUtil.ts
var ParseUtil;
((ParseUtil2) => {
  const emPerInch = 7.2;
  const pxPerInch = 72;
  const UNIT_CASES = {
    "em": (m) => m,
    "ex": (m) => m * 0.43,
    "pt": (m) => m / 10,
    // 10 pt to an em
    "pc": (m) => m * 1.2,
    // 12 pt to a pc
    "px": (m) => m * emPerInch / pxPerInch,
    "in": (m) => m * emPerInch,
    "cm": (m) => m * emPerInch / 2.54,
    // 2.54 cm to an inch
    "mm": (m) => m * emPerInch / 25.4,
    // 10 mm to a cm
    "mu": (m) => m / 18
  };
  const num = "([-+]?([.,]\\d+|\\d+([.,]\\d*)?))";
  const unit = "(pt|em|ex|mu|px|mm|cm|in|pc)";
  const dimenEnd = RegExp("^\\s*" + num + "\\s*" + unit + "\\s*$");
  const dimenRest = RegExp("^\\s*" + num + "\\s*" + unit + " ?");
  function matchDimen(dim, rest = false) {
    let match = dim.match(rest ? dimenRest : dimenEnd);
    return match ? muReplace([match[1].replace(/,/, "."), match[4], match[0].length]) : [null, null, 0];
  }
  ParseUtil2.matchDimen = matchDimen;
  function muReplace([value, unit2, length]) {
    if (unit2 !== "mu") {
      return [value, unit2, length];
    }
    let em2 = Em(UNIT_CASES[unit2](parseFloat(value || "1")));
    return [em2.slice(0, -2), "em", length];
  }
  function dimen2em(dim) {
    let [value, unit2] = matchDimen(dim);
    let m = parseFloat(value || "1");
    let func = UNIT_CASES[unit2];
    return func ? func(m) : 0;
  }
  ParseUtil2.dimen2em = dimen2em;
  function Em(m) {
    if (Math.abs(m) < 6e-4) {
      return "0em";
    }
    return m.toFixed(3).replace(/\.?0+$/, "") + "em";
  }
  ParseUtil2.Em = Em;
  function cols(...W) {
    return W.map((n) => Em(n)).join(" ");
  }
  ParseUtil2.cols = cols;
  function fenced(configuration, open, mml, close, big = "", color = "") {
    let nf = configuration.nodeFactory;
    let mrow = nf.create(
      "node",
      "mrow",
      [],
      { open, close, texClass: TEXCLASS.INNER }
    );
    let mo;
    if (big) {
      mo = new TexParser("\\" + big + "l" + open, configuration.parser.stack.env, configuration).mml();
    } else {
      let openNode = nf.create("text", open);
      mo = nf.create(
        "node",
        "mo",
        [],
        { fence: true, stretchy: true, symmetric: true, texClass: TEXCLASS.OPEN },
        openNode
      );
    }
    NodeUtil_default.appendChildren(mrow, [mo, mml]);
    if (big) {
      mo = new TexParser("\\" + big + "r" + close, configuration.parser.stack.env, configuration).mml();
    } else {
      let closeNode = nf.create("text", close);
      mo = nf.create(
        "node",
        "mo",
        [],
        { fence: true, stretchy: true, symmetric: true, texClass: TEXCLASS.CLOSE },
        closeNode
      );
    }
    color && mo.attributes.set("mathcolor", color);
    NodeUtil_default.appendChildren(mrow, [mo]);
    return mrow;
  }
  ParseUtil2.fenced = fenced;
  function fixedFence(configuration, open, mml, close) {
    let mrow = configuration.nodeFactory.create(
      "node",
      "mrow",
      [],
      { open, close, texClass: TEXCLASS.ORD }
    );
    if (open) {
      NodeUtil_default.appendChildren(mrow, [mathPalette(configuration, open, "l")]);
    }
    if (NodeUtil_default.isType(mml, "mrow")) {
      NodeUtil_default.appendChildren(mrow, NodeUtil_default.getChildren(mml));
    } else {
      NodeUtil_default.appendChildren(mrow, [mml]);
    }
    if (close) {
      NodeUtil_default.appendChildren(mrow, [mathPalette(configuration, close, "r")]);
    }
    return mrow;
  }
  ParseUtil2.fixedFence = fixedFence;
  function mathPalette(configuration, fence, side) {
    if (fence === "{" || fence === "}") {
      fence = "\\" + fence;
    }
    let D = "{\\bigg" + side + " " + fence + "}";
    let T = "{\\big" + side + " " + fence + "}";
    return new TexParser("\\mathchoice" + D + T + T + T, {}, configuration).mml();
  }
  ParseUtil2.mathPalette = mathPalette;
  function fixInitialMO(configuration, nodes) {
    for (let i = 0, m = nodes.length; i < m; i++) {
      let child = nodes[i];
      if (child && (!NodeUtil_default.isType(child, "mspace") && (!NodeUtil_default.isType(child, "TeXAtom") || NodeUtil_default.getChildren(child)[0] && NodeUtil_default.getChildren(NodeUtil_default.getChildren(child)[0]).length))) {
        if (NodeUtil_default.isEmbellished(child) || NodeUtil_default.isType(child, "TeXAtom") && NodeUtil_default.getTexClass(child) === TEXCLASS.REL) {
          let mi = configuration.nodeFactory.create("node", "mi");
          nodes.unshift(mi);
        }
        break;
      }
    }
  }
  ParseUtil2.fixInitialMO = fixInitialMO;
  function internalMath2(parser, text, level, font) {
    if (parser.configuration.options.internalMath) {
      return parser.configuration.options.internalMath(parser, text, level, font);
    }
    let mathvariant = font || parser.stack.env.font;
    let def = mathvariant ? { mathvariant } : {};
    let mml = [], i = 0, k = 0, c, node, match = "", braces = 0;
    if (text.match(/\\?[${}\\]|\\\(|\\(eq)?ref\s*\{/)) {
      while (i < text.length) {
        c = text.charAt(i++);
        if (c === "$") {
          if (match === "$" && braces === 0) {
            node = parser.create(
              "node",
              "TeXAtom",
              [new TexParser(text.slice(k, i - 1), {}, parser.configuration).mml()]
            );
            mml.push(node);
            match = "";
            k = i;
          } else if (match === "") {
            if (k < i - 1) {
              mml.push(internalText(parser, text.slice(k, i - 1), def));
            }
            match = "$";
            k = i;
          }
        } else if (c === "{" && match !== "") {
          braces++;
        } else if (c === "}") {
          if (match === "}" && braces === 0) {
            let atom = new TexParser(text.slice(k, i), {}, parser.configuration).mml();
            node = parser.create("node", "TeXAtom", [atom], def);
            mml.push(node);
            match = "";
            k = i;
          } else if (match !== "") {
            if (braces) {
              braces--;
            }
          }
        } else if (c === "\\") {
          if (match === "" && text.substr(i).match(/^(eq)?ref\s*\{/)) {
            let len = RegExp["$&"].length;
            if (k < i - 1) {
              mml.push(internalText(parser, text.slice(k, i - 1), def));
            }
            match = "}";
            k = i - 1;
            i += len;
          } else {
            c = text.charAt(i++);
            if (c === "(" && match === "") {
              if (k < i - 2) {
                mml.push(internalText(parser, text.slice(k, i - 2), def));
              }
              match = ")";
              k = i;
            } else if (c === ")" && match === ")" && braces === 0) {
              node = parser.create(
                "node",
                "TeXAtom",
                [new TexParser(text.slice(k, i - 2), {}, parser.configuration).mml()]
              );
              mml.push(node);
              match = "";
              k = i;
            } else if (c.match(/[${}\\]/) && match === "") {
              i--;
              text = text.substr(0, i - 1) + text.substr(i);
            }
          }
        }
      }
      if (match !== "") {
        throw new TexError("MathNotTerminated", "Math not terminated in text box");
      }
    }
    if (k < text.length) {
      mml.push(internalText(parser, text.slice(k), def));
    }
    if (level != null) {
      mml = [parser.create("node", "mstyle", mml, { displaystyle: false, scriptlevel: level })];
    } else if (mml.length > 1) {
      mml = [parser.create("node", "mrow", mml)];
    }
    return mml;
  }
  ParseUtil2.internalMath = internalMath2;
  function internalText(parser, text, def) {
    text = text.replace(/^\s+/, entities.nbsp).replace(/\s+$/, entities.nbsp);
    let textNode = parser.create("text", text);
    return parser.create("node", "mtext", [], def, textNode);
  }
  ParseUtil2.internalText = internalText;
  function underOver(parser, base, script2, pos, stack) {
    ParseUtil2.checkMovableLimits(base);
    if (NodeUtil_default.isType(base, "munderover") && NodeUtil_default.isEmbellished(base)) {
      NodeUtil_default.setProperties(NodeUtil_default.getCoreMO(base), { lspace: 0, rspace: 0 });
      const mo = parser.create("node", "mo", [], { rspace: 0 });
      base = parser.create("node", "mrow", [mo, base]);
    }
    const mml = parser.create("node", "munderover", [base]);
    NodeUtil_default.setChild(mml, pos === "over" ? mml.over : mml.under, script2);
    let node = mml;
    if (stack) {
      node = parser.create("node", "TeXAtom", [mml], { texClass: TEXCLASS.OP, movesupsub: true });
    }
    NodeUtil_default.setProperty(node, "subsupOK", true);
    return node;
  }
  ParseUtil2.underOver = underOver;
  function checkMovableLimits(base) {
    const symbol = NodeUtil_default.isType(base, "mo") ? NodeUtil_default.getForm(base) : null;
    if (NodeUtil_default.getProperty(base, "movablelimits") || symbol && symbol[3] && symbol[3].movablelimits) {
      NodeUtil_default.setProperties(base, { movablelimits: false });
    }
  }
  ParseUtil2.checkMovableLimits = checkMovableLimits;
  function trimSpaces(text) {
    if (typeof text !== "string") {
      return text;
    }
    let TEXT = text.trim();
    if (TEXT.match(/\\$/) && text.match(/ $/)) {
      TEXT += " ";
    }
    return TEXT;
  }
  ParseUtil2.trimSpaces = trimSpaces;
  function setArrayAlign(array, align) {
    align = ParseUtil2.trimSpaces(align || "");
    if (align === "t") {
      array.arraydef.align = "baseline 1";
    } else if (align === "b") {
      array.arraydef.align = "baseline -1";
    } else if (align === "c") {
      array.arraydef.align = "axis";
    } else if (align) {
      array.arraydef.align = align;
    }
    return array;
  }
  ParseUtil2.setArrayAlign = setArrayAlign;
  function substituteArgs(parser, args, str) {
    let text = "";
    let newstring = "";
    let i = 0;
    while (i < str.length) {
      let c = str.charAt(i++);
      if (c === "\\") {
        text += c + str.charAt(i++);
      } else if (c === "#") {
        c = str.charAt(i++);
        if (c === "#") {
          text += c;
        } else {
          if (!c.match(/[1-9]/) || parseInt(c, 10) > args.length) {
            throw new TexError(
              "IllegalMacroParam",
              "Illegal macro parameter reference"
            );
          }
          newstring = addArgs(
            parser,
            addArgs(parser, newstring, text),
            args[parseInt(c, 10) - 1]
          );
          text = "";
        }
      } else {
        text += c;
      }
    }
    return addArgs(parser, newstring, text);
  }
  ParseUtil2.substituteArgs = substituteArgs;
  function addArgs(parser, s1, s2) {
    if (s2.match(/^[a-z]/i) && s1.match(/(^|[^\\])(\\\\)*\\[a-z]+$/i)) {
      s1 += " ";
    }
    if (s1.length + s2.length > parser.configuration.options["maxBuffer"]) {
      throw new TexError(
        "MaxBufferSize",
        "MathJax internal buffer size exceeded; is there a recursive macro call?"
      );
    }
    return s1 + s2;
  }
  ParseUtil2.addArgs = addArgs;
  function checkMaxMacros(parser, isMacro = true) {
    if (++parser.macroCount <= parser.configuration.options["maxMacros"]) {
      return;
    }
    if (isMacro) {
      throw new TexError(
        "MaxMacroSub1",
        "MathJax maximum macro substitution count exceeded; is here a recursive macro call?"
      );
    } else {
      throw new TexError(
        "MaxMacroSub2",
        "MathJax maximum substitution count exceeded; is there a recursive latex environment?"
      );
    }
  }
  ParseUtil2.checkMaxMacros = checkMaxMacros;
  function checkEqnEnv(parser) {
    if (parser.stack.global.eqnenv) {
      throw new TexError("ErroneousNestingEq", "Erroneous nesting of equation structures");
    }
    parser.stack.global.eqnenv = true;
  }
  ParseUtil2.checkEqnEnv = checkEqnEnv;
  function copyNode(node, parser) {
    const tree2 = node.copy();
    const options2 = parser.configuration;
    tree2.walkTree((n) => {
      options2.addNode(n.kind, n);
      const lists = (n.getProperty("in-lists") || "").split(/,/);
      for (const list of lists) {
        list && options2.addNode(list, n);
      }
    });
    return tree2;
  }
  ParseUtil2.copyNode = copyNode;
  function MmlFilterAttribute(_parser, _name, value) {
    return value;
  }
  ParseUtil2.MmlFilterAttribute = MmlFilterAttribute;
  function getFontDef(parser) {
    const font = parser.stack.env["font"];
    return font ? { mathvariant: font } : {};
  }
  ParseUtil2.getFontDef = getFontDef;
  function keyvalOptions(attrib, allowed = null, error = false) {
    let def = readKeyval(attrib);
    if (allowed) {
      for (let key of Object.keys(def)) {
        if (!allowed.hasOwnProperty(key)) {
          if (error) {
            throw new TexError("InvalidOption", "Invalid option: %1", key);
          }
          delete def[key];
        }
      }
    }
    return def;
  }
  ParseUtil2.keyvalOptions = keyvalOptions;
  function readKeyval(text) {
    let options2 = {};
    let rest = text;
    let end, key, val;
    while (rest) {
      [key, end, rest] = readValue(rest, ["=", ","]);
      if (end === "=") {
        [val, end, rest] = readValue(rest, [","]);
        val = val === "false" || val === "true" ? JSON.parse(val) : val;
        options2[key] = val;
      } else if (key) {
        options2[key] = true;
      }
    }
    return options2;
  }
  function removeBraces(text, count) {
    while (count > 0) {
      text = text.trim().slice(1, -1);
      count--;
    }
    return text.trim();
  }
  function readValue(text, end) {
    let length = text.length;
    let braces = 0;
    let value = "";
    let index = 0;
    let start = 0;
    let startCount = true;
    let stopCount = false;
    while (index < length) {
      let c = text[index++];
      switch (c) {
        case " ":
          break;
        case "{":
          if (startCount) {
            start++;
          } else {
            stopCount = false;
            if (start > braces) {
              start = braces;
            }
          }
          braces++;
          break;
        case "}":
          if (braces) {
            braces--;
          }
          if (startCount || stopCount) {
            start--;
            stopCount = true;
          }
          startCount = false;
          break;
        default:
          if (!braces && end.indexOf(c) !== -1) {
            return [stopCount ? "true" : (
              // If Stop count is true we
              // have balanced braces, only.
              removeBraces(value, start)
            ), c, text.slice(index)];
          }
          startCount = false;
          stopCount = false;
      }
      value += c;
    }
    if (braces) {
      throw new TexError(
        "ExtraOpenMissingClose",
        "Extra open brace or missing close brace"
      );
    }
    return [stopCount ? "true" : removeBraces(value, start), "", text.slice(index)];
  }
})(ParseUtil || (ParseUtil = {}));
var ParseUtil_default = ParseUtil;

// node_modules/mathjax-full/ts/input/tex/Stack.ts
var Stack = class {
  /**
   * @constructor
   * @param {StackItemFactory} factory The stack item factory.
   * @param {EnvList} env The environment.
   * @param {boolean} inner True if parser has been called recursively.
   */
  constructor(_factory, _env, inner) {
    this._factory = _factory;
    this._env = _env;
    /**
     * @type {EnvList}
     */
    this.global = {};
    /**
     * The actual stack, a list of stack items.
     * @type {Array.<StackItem>}
     */
    this.stack = [];
    this.global = { isInner: inner };
    this.stack = [this._factory.create("start", this.global)];
    if (_env) {
      this.stack[0].env = _env;
    }
    this.env = this.stack[0].env;
  }
  /**
   * Set the environment of the stack.
   * @param {EnvList} env The new environment.
   */
  set env(env) {
    this._env = env;
  }
  /**
   * Retrieves the environment of that stack.
   * @return {EnvList} The current environment.
   */
  get env() {
    return this._env;
  }
  /**
   * Pushes items or nodes onto stack.
   * @param {...StackItem|MmlNode} args A list of items to push.
   */
  Push(...args) {
    for (const node of args) {
      if (!node) {
        continue;
      }
      const item = NodeUtil_default.isNode(node) ? this._factory.create("mml", node) : node;
      item.global = this.global;
      const [top, success] = this.stack.length ? this.Top().checkItem(item) : [null, true];
      if (!success) {
        continue;
      }
      if (top) {
        this.Pop();
        this.Push(...top);
        continue;
      }
      this.stack.push(item);
      if (item.env) {
        if (item.copyEnv) {
          Object.assign(item.env, this.env);
        }
        this.env = item.env;
      } else {
        item.env = this.env;
      }
    }
  }
  /**
   * Pop the topmost elements off the stack.
   * @return {StackItem} A stack item.
   */
  Pop() {
    const item = this.stack.pop();
    if (!item.isOpen) {
      delete item.env;
    }
    this.env = this.stack.length ? this.Top().env : {};
    return item;
  }
  /**
   * Lookup the nth elements on the stack without removing them.
   * @param {number=} n Position of element that should be returned. Default 1.
   * @return {StackItem} Nth item on the stack.
   */
  Top(n = 1) {
    return this.stack.length < n ? null : this.stack[this.stack.length - n];
  }
  /**
   * Lookup the topmost element on the stack, returning the Mml node in that
   * item. Optionally pops the Mml node from that stack item.
   * @param {boolean=} noPop Pop top item if true.
   * @return {MmlNode} The Mml node in the topmost stack item.
   */
  Prev(noPop) {
    const top = this.Top();
    return noPop ? top.First : top.Pop();
  }
  /**
   * @override
   */
  toString() {
    return "stack[\n  " + this.stack.join("\n  ") + "\n]";
  }
};

// node_modules/mathjax-full/ts/input/tex/TexParser.ts
var TexParser = class _TexParser {
  /**
   * @constructor
   * @param {string} string The string to parse.
   * @param {EnvList} env The intial environment representing the current parse
   *     state of the overall expression translation.
   * @param {ParseOptions} configuration A parser configuration.
   */
  constructor(_string, env, configuration) {
    this._string = _string;
    this.configuration = configuration;
    /**
     * Counter for recursive macros.
     * @type {number}
     */
    this.macroCount = 0;
    /**
     * Current position in the string that is parsed.
     * @type {number}
     */
    this.i = 0;
    /**
     * The last command sequence
     * @type {string}
     */
    this.currentCS = "";
    const inner = env.hasOwnProperty("isInner");
    const isInner = env["isInner"];
    delete env["isInner"];
    let ENV;
    if (env) {
      ENV = {};
      for (const id of Object.keys(env)) {
        ENV[id] = env[id];
      }
    }
    this.configuration.pushParser(this);
    this.stack = new Stack(this.itemFactory, ENV, inner ? isInner : true);
    this.Parse();
    this.Push(this.itemFactory.create("stop"));
  }
  /**
   * @return {OptionList} The configuration options.
   */
  get options() {
    return this.configuration.options;
  }
  /**
   * @return {StackItemFactory} The factory for stack items.
   */
  get itemFactory() {
    return this.configuration.itemFactory;
  }
  /**
   * @return {Tags} The tags style of this configuration.
   */
  get tags() {
    return this.configuration.tags;
  }
  /**
   * Sets the string that should be parsed.
   * @param {string} str The new string to parse.
   */
  set string(str) {
    this._string = str;
  }
  /**
   * @return {string} The string that is currently parsed.
   */
  get string() {
    return this._string;
  }
  /**
   * Parses the input with the specified kind of map.
   * @param {HandlerType} kind Configuration name.
   * @param {ParseInput} input Input to be parsed.
   * @return {ParseResult} The output of the parsing function.
   */
  parse(kind, input) {
    return this.configuration.handlers.get(kind).parse(input);
  }
  /**
   * Maps a symbol to its "parse value" if it exists.
   * @param {HandlerType} kind Configuration name.
   * @param {string} symbol The symbol to parse.
   * @return {any} A boolean, Character, or Macro.
   */
  lookup(kind, symbol) {
    return this.configuration.handlers.get(kind).lookup(symbol);
  }
  /**
   * Checks if a symbol is contained in one of the symbol mappings of the
   * specified kind.
   * @param {HandlerType} kind Configuration name.
   * @param {string} symbol The symbol to parse.
   * @return {boolean} True if the symbol is contained in the given types of
   *     symbol mapping.
   */
  contains(kind, symbol) {
    return this.configuration.handlers.get(kind).contains(symbol);
  }
  /**
   * @override
   */
  toString() {
    let str = "";
    for (const config2 of Array.from(this.configuration.handlers.keys())) {
      str += config2 + ": " + this.configuration.handlers.get(config2) + "\n";
    }
    return str;
  }
  /**
   * Parses the current input string.
   */
  Parse() {
    let c;
    while (this.i < this.string.length) {
      c = this.getCodePoint();
      this.i += c.length;
      this.parse("character", [this, c]);
    }
  }
  /**
   * Pushes a new item onto the stack. The item can also be a Mml node,
   *   but if the mml item is an inferred row, push its children instead.
   * @param {StackItem|MmlNode} arg The new item.
   */
  Push(arg) {
    if (arg instanceof AbstractMmlNode && arg.isInferred) {
      this.PushAll(arg.childNodes);
    } else {
      this.stack.Push(arg);
    }
  }
  /**
   * Pushes a list of new items onto the stack.
   * @param {StackItem|MmlNode[]} args The new items.
   */
  PushAll(args) {
    for (const arg of args) {
      this.stack.Push(arg);
    }
  }
  /**
   * @return {MmlNode} The internal Mathml structure.
   */
  mml() {
    if (!this.stack.Top().isKind("mml")) {
      return null;
    }
    let node = this.stack.Top().First;
    this.configuration.popParser();
    return node;
  }
  /************************************************************************
   *
   *   String handling routines
   */
  /**
   * Convert delimiter to character.
   * @param {string} c The delimiter name.
   * @return {string} The corresponding character.
   */
  convertDelimiter(c) {
    const symbol = this.lookup("delimiter", c);
    return symbol ? symbol.char : null;
  }
  /**
   * @return {string}   Get the next unicode character in the string
   */
  getCodePoint() {
    const code = this.string.codePointAt(this.i);
    return code === void 0 ? "" : String.fromCodePoint(code);
  }
  /**
   * @return {boolean} True if the next character to parse is a space.
   */
  nextIsSpace() {
    return !!this.string.charAt(this.i).match(/\s/);
  }
  /**
   * @return {string} Get the next non-space character.
   */
  GetNext() {
    while (this.nextIsSpace()) {
      this.i++;
    }
    return this.getCodePoint();
  }
  /**
   * @return {string} Get and return a control-sequence name
   */
  GetCS() {
    let CS = this.string.slice(this.i).match(/^(([a-z]+) ?|[\uD800-\uDBFF].|.)/i);
    if (CS) {
      this.i += CS[0].length;
      return CS[2] || CS[1];
    } else {
      this.i++;
      return " ";
    }
  }
  /**
   * Get and return a TeX argument (either a single character or control
   *     sequence, or the contents of the next set of braces).
   * @param {string} name Name of the current control sequence.
   * @param {boolean} noneOK? True if no argument is OK.
   * @return {string} The next argument.
   */
  GetArgument(_name, noneOK) {
    switch (this.GetNext()) {
      case "":
        if (!noneOK) {
          throw new TexError("MissingArgFor", "Missing argument for %1", this.currentCS);
        }
        return null;
      case "}":
        if (!noneOK) {
          throw new TexError(
            "ExtraCloseMissingOpen",
            "Extra close brace or missing open brace"
          );
        }
        return null;
      case "\\":
        this.i++;
        return "\\" + this.GetCS();
      case "{":
        let j = ++this.i, parens = 1;
        while (this.i < this.string.length) {
          switch (this.string.charAt(this.i++)) {
            case "\\":
              this.i++;
              break;
            case "{":
              parens++;
              break;
            case "}":
              if (--parens === 0) {
                return this.string.slice(j, this.i - 1);
              }
              break;
          }
        }
        throw new TexError("MissingCloseBrace", "Missing close brace");
    }
    const c = this.getCodePoint();
    this.i += c.length;
    return c;
  }
  /**
   * Get an optional LaTeX argument in brackets.
   * @param {string} name Name of the current control sequence.
   * @param {string} def? The default value for the optional argument.
   * @return {string} The optional argument.
   */
  GetBrackets(_name, def) {
    if (this.GetNext() !== "[") {
      return def;
    }
    let j = ++this.i, parens = 0;
    while (this.i < this.string.length) {
      switch (this.string.charAt(this.i++)) {
        case "{":
          parens++;
          break;
        case "\\":
          this.i++;
          break;
        case "}":
          if (parens-- <= 0) {
            throw new TexError(
              "ExtraCloseLooking",
              "Extra close brace while looking for %1",
              "']'"
            );
          }
          break;
        case "]":
          if (parens === 0) {
            return this.string.slice(j, this.i - 1);
          }
          break;
      }
    }
    throw new TexError(
      "MissingCloseBracket",
      "Could not find closing ']' for argument to %1",
      this.currentCS
    );
  }
  /**
   *  Get the name of a delimiter (check it in the delimiter list).
   * @param {string} name Name of the current control sequence.
   * @param {boolean} braceOK? Are braces around the delimiter OK.
   * @return {string} The delimiter name.
   */
  GetDelimiter(name, braceOK) {
    let c = this.GetNext();
    this.i += c.length;
    if (this.i <= this.string.length) {
      if (c === "\\") {
        c += this.GetCS();
      } else if (c === "{" && braceOK) {
        this.i--;
        c = this.GetArgument(name).trim();
      }
      if (this.contains("delimiter", c)) {
        return this.convertDelimiter(c);
      }
    }
    throw new TexError(
      "MissingOrUnrecognizedDelim",
      "Missing or unrecognized delimiter for %1",
      this.currentCS
    );
  }
  /**
   * Get a dimension (including its units).
   * @param {string} name Name of the current control sequence.
   * @return {string} The dimension string.
   */
  GetDimen(name) {
    if (this.GetNext() === "{") {
      let dimen = this.GetArgument(name);
      let [value, unit] = ParseUtil_default.matchDimen(dimen);
      if (value) {
        return value + unit;
      }
    } else {
      let dimen = this.string.slice(this.i);
      let [value, unit, length] = ParseUtil_default.matchDimen(dimen, true);
      if (value) {
        this.i += length;
        return value + unit;
      }
    }
    throw new TexError(
      "MissingDimOrUnits",
      "Missing dimension or its units for %1",
      this.currentCS
    );
  }
  /**
   *  Get everything up to the given control sequence (token)
   * @param {string} name Name of the current control sequence.
   * @param {string} token The element until where to parse.
   * @return {string} The text between the current position and the given token.
   */
  GetUpTo(_name, token) {
    while (this.nextIsSpace()) {
      this.i++;
    }
    let j = this.i;
    let parens = 0;
    while (this.i < this.string.length) {
      let k = this.i;
      let c = this.GetNext();
      this.i += c.length;
      switch (c) {
        case "\\":
          c += this.GetCS();
          break;
        case "{":
          parens++;
          break;
        case "}":
          if (parens === 0) {
            throw new TexError(
              "ExtraCloseLooking",
              "Extra close brace while looking for %1",
              token
            );
          }
          parens--;
          break;
      }
      if (parens === 0 && c === token) {
        return this.string.slice(j, k);
      }
    }
    throw new TexError(
      "TokenNotFoundForCommand",
      "Could not find %1 for %2",
      token,
      this.currentCS
    );
  }
  /**
   * Parse the arguments of a control sequence in a new parser instance.
   * @param {string} name Name of the current control sequence.
   * @return {MmlNode} The parsed node.
   */
  ParseArg(name) {
    return new _TexParser(
      this.GetArgument(name),
      this.stack.env,
      this.configuration
    ).mml();
  }
  /**
   * Parses a given string up to a given token in a new parser instance.
   * @param {string} name Name of the current control sequence.
   * @param {string} token A Token at which to end parsing.
   * @return {MmlNode} The parsed node.
   */
  ParseUpTo(name, token) {
    return new _TexParser(
      this.GetUpTo(name, token),
      this.stack.env,
      this.configuration
    ).mml();
  }
  /**
   * Get a delimiter or empty argument
   * @param {string} name Name of the current control sequence.
   * @return {string} The delimiter.
   */
  GetDelimiterArg(name) {
    let c = ParseUtil_default.trimSpaces(this.GetArgument(name));
    if (c === "") {
      return null;
    }
    if (this.contains("delimiter", c)) {
      return c;
    }
    throw new TexError(
      "MissingOrUnrecognizedDelim",
      "Missing or unrecognized delimiter for %1",
      this.currentCS
    );
  }
  /**
   * @return {boolean} True if a star follows the control sequence name.
   */
  GetStar() {
    let star = this.GetNext() === "*";
    if (star) {
      this.i++;
    }
    return star;
  }
  /**
   * Convenience method to create nodes with the node factory of the current
   * configuration.
   * @param {string} kind The kind of node to create.
   * @param {any[]} ...rest The remaining arguments for the creation method.
   * @return {MmlNode} The newly created node.
   */
  create(kind, ...rest) {
    return this.configuration.nodeFactory.create(kind, ...rest);
  }
};

// node_modules/mathjax-full/ts/input/tex/Tags.ts
var Label = class {
  /**
   * @constructor
   * @param {string=} tag The tag that's displayed.
   * @param {string=} id The id that serves as reference.
   */
  constructor(tag = "???", id = "") {
    this.tag = tag;
    this.id = id;
  }
};
var TagInfo = class {
  /**
   * @constructor
   * @param {string} env The environment name (e.g., align).
   * @param {boolean} taggable Environment supports tags (e.g., align* does, but
   *     split does not.)
   * @param {boolean} defaultTags Environment is tagged by default (e.g., align
   *     is, but align* is not).
   * @param {string} tag The tag name (e.g., 1).
   * @param {string} tagId The unique id for that tag (e.g., mjx-eqn:1).
   * @param {string} tagFormat The formatted tag (e.g., "(1)").
   * @param {boolean} noTag A no tagging command has been set (e.g., \notag,
   *     \nonumber).
   * @param {string} labelId The label referring to the tag.
   */
  constructor(env = "", taggable = false, defaultTags = false, tag = null, tagId = "", tagFormat = "", noTag = false, labelId = "") {
    this.env = env;
    this.taggable = taggable;
    this.defaultTags = defaultTags;
    this.tag = tag;
    this.tagId = tagId;
    this.tagFormat = tagFormat;
    this.noTag = noTag;
    this.labelId = labelId;
  }
};
var AbstractTags = class {
  constructor() {
    /**
     * Current equation number.
     * @type {number}
     */
    this.counter = 0;
    /**
     * Equation number as equation begins.
     * @type {number}
     */
    this.allCounter = 0;
    /**
     * @override
     */
    this.configuration = null;
    /**
     * @override
     */
    this.ids = {};
    /**
     * @override
     */
    this.allIds = {};
    /**
     * @override
     */
    this.labels = {};
    /**
     * @override
     */
    this.allLabels = {};
    /**
     * @override
     */
    this.redo = false;
    /**
     * @override
     */
    this.refUpdate = false;
    /**
     * @override
     */
    this.currentTag = new TagInfo();
    /**
     * Chronology of all previous tags, in case we need to look something up in
     * the finalize method.
     * @type {TagInfo[]}
     */
    this.history = [];
    this.stack = [];
    /**
     * @override
     */
    this.enTag = function(node, tag) {
      let nf = this.configuration.nodeFactory;
      let cell = nf.create("node", "mtd", [node]);
      let row = nf.create("node", "mlabeledtr", [tag, cell]);
      let table = nf.create("node", "mtable", [row], {
        side: this.configuration.options["tagSide"],
        minlabelspacing: this.configuration.options["tagIndent"],
        displaystyle: true
      });
      return table;
    };
  }
  /**
   * @override
   */
  start(env, taggable, defaultTags) {
    if (this.currentTag) {
      this.stack.push(this.currentTag);
    }
    this.currentTag = new TagInfo(env, taggable, defaultTags);
  }
  get env() {
    return this.currentTag.env;
  }
  /**
   * @override
   */
  end() {
    this.history.push(this.currentTag);
    this.currentTag = this.stack.pop();
  }
  /**
   * @override
   */
  tag(tag, noFormat) {
    this.currentTag.tag = tag;
    this.currentTag.tagFormat = noFormat ? tag : this.formatTag(tag);
    this.currentTag.noTag = false;
  }
  /**
   * @override
   */
  notag() {
    this.tag("", true);
    this.currentTag.noTag = true;
  }
  get noTag() {
    return this.currentTag.noTag;
  }
  set label(label) {
    this.currentTag.labelId = label;
  }
  get label() {
    return this.currentTag.labelId;
  }
  /**
   * @override
   */
  formatUrl(id, base) {
    return base + "#" + encodeURIComponent(id);
  }
  /**
   * @override
   */
  formatTag(tag) {
    return "(" + tag + ")";
  }
  /**
   * How to format ids for labelling equations.
   * @param {string} id The unique part of the id (e.g., label or number).
   * @return {string} The formatted id.
   */
  formatId(id) {
    return "mjx-eqn:" + id.replace(/\s/g, "_");
  }
  /**
   * How to format numbers in tags.
   * @param {number} n The tag number.
   * @return {string} The formatted number.
   */
  formatNumber(n) {
    return n.toString();
  }
  // Tag handling functions.
  /**
   * @override
   */
  autoTag() {
    if (this.currentTag.tag == null) {
      this.counter++;
      this.tag(this.formatNumber(this.counter), false);
    }
  }
  /**
   * @override
   */
  clearTag() {
    this.label = "";
    this.tag(null, true);
    this.currentTag.tagId = "";
  }
  /**
   * @override
   */
  getTag(force = false) {
    if (force) {
      this.autoTag();
      return this.makeTag();
    }
    const ct = this.currentTag;
    if (ct.taggable && !ct.noTag) {
      if (ct.defaultTags) {
        this.autoTag();
      }
      if (ct.tag) {
        return this.makeTag();
      }
    }
    return null;
  }
  /**
   * @override
   */
  resetTag() {
    this.history = [];
    this.redo = false;
    this.refUpdate = false;
    this.clearTag();
  }
  /**
   * @override
   */
  reset(offset = 0) {
    this.resetTag();
    this.counter = this.allCounter = offset;
    this.allLabels = {};
    this.allIds = {};
  }
  /**
   * @override
   */
  startEquation(math) {
    this.history = [];
    this.stack = [];
    this.clearTag();
    this.currentTag = new TagInfo("", void 0, void 0);
    this.labels = {};
    this.ids = {};
    this.counter = this.allCounter;
    this.redo = false;
    const recompile = math.inputData.recompile;
    if (recompile) {
      this.refUpdate = true;
      this.counter = recompile.counter;
    }
  }
  /**
   * @override
   */
  finishEquation(math) {
    if (this.redo) {
      math.inputData.recompile = {
        state: math.state(),
        counter: this.allCounter
      };
    }
    if (!this.refUpdate) {
      this.allCounter = this.counter;
    }
    Object.assign(this.allIds, this.ids);
    Object.assign(this.allLabels, this.labels);
  }
  /**
   * @override
   */
  finalize(node, env) {
    if (!env.display || this.currentTag.env || this.currentTag.tag == null) {
      return node;
    }
    let tag = this.makeTag();
    let table = this.enTag(node, tag);
    return table;
  }
  /**
   * Sets the tag id.
   */
  makeId() {
    this.currentTag.tagId = this.formatId(
      this.configuration.options["useLabelIds"] ? this.label || this.currentTag.tag : this.currentTag.tag
    );
  }
  /**
   * @return {MmlNode} The actual tag node as an mtd.
   */
  makeTag() {
    this.makeId();
    if (this.label) {
      this.labels[this.label] = new Label(this.currentTag.tag, this.currentTag.tagId);
    }
    let mml = new TexParser(
      "\\text{" + this.currentTag.tagFormat + "}",
      {},
      this.configuration
    ).mml();
    return this.configuration.nodeFactory.create(
      "node",
      "mtd",
      [mml],
      { id: this.currentTag.tagId }
    );
  }
};
var NoTags = class extends AbstractTags {
  /**
   * @override
   */
  autoTag() {
  }
  /**
   * @override
   */
  getTag() {
    return !this.currentTag.tag ? null : super.getTag();
  }
};
var AllTags = class extends AbstractTags {
  /**
   * @override
   */
  finalize(node, env) {
    if (!env.display || this.history.find(
      function(x) {
        return x.taggable;
      }
    )) {
      return node;
    }
    let tag = this.getTag(true);
    return this.enTag(node, tag);
  }
};
var TagsFactory;
((TagsFactory2) => {
  let tagsMapping = /* @__PURE__ */ new Map([
    ["none", NoTags],
    ["all", AllTags]
  ]);
  let defaultTags = "none";
  TagsFactory2.OPTIONS = {
    // Tagging style, used to be autonumber in v2.
    tags: defaultTags,
    // This specifies the side on which \tag{} macros will place the tags.
    // Set to 'left' to place on the left-hand side.
    tagSide: "right",
    // This is the amount of indentation (from right or left) for the tags.
    tagIndent: "0.8em",
    // make element ID's use \label name rather than equation number
    // MJ puts in an equation prefix: mjx-eqn
    // When true it uses the label name XXX as mjx-eqn:XXX
    // If false it uses the actual number N that is displayed: mjx-eqn:N
    useLabelIds: true,
    // Set to true in order to prevent error messages for duplicate label ids
    ignoreDuplicateLabels: false
  };
  TagsFactory2.add = function(name, constr) {
    tagsMapping.set(name, constr);
  };
  TagsFactory2.addTags = function(tags) {
    for (const key of Object.keys(tags)) {
      TagsFactory2.add(key, tags[key]);
    }
  };
  TagsFactory2.create = function(name) {
    let constr = tagsMapping.get(name) || tagsMapping.get(defaultTags);
    if (!constr) {
      throw Error("Unknown tags class");
    }
    return new constr();
  };
  TagsFactory2.setDefault = function(name) {
    defaultTags = name;
  };
  TagsFactory2.getDefault = function() {
    return TagsFactory2.create(defaultTags);
  };
})(TagsFactory || (TagsFactory = {}));

// node_modules/mathjax-full/ts/input/tex/Configuration.ts
var Configuration = class _Configuration {
  /**
   * @constructor
   */
  constructor(name, handler = {}, fallback = {}, items = {}, tags = {}, options2 = {}, nodes = {}, preprocessors = [], postprocessors = [], initMethod = null, configMethod = null, priority, parser) {
    this.name = name;
    this.handler = handler;
    this.fallback = fallback;
    this.items = items;
    this.tags = tags;
    this.options = options2;
    this.nodes = nodes;
    this.preprocessors = preprocessors;
    this.postprocessors = postprocessors;
    this.initMethod = initMethod;
    this.configMethod = configMethod;
    this.priority = priority;
    this.parser = parser;
    this.handler = Object.assign(
      { character: [], delimiter: [], macro: [], environment: [] },
      handler
    );
  }
  /**
   * Creates a function priority pair.
   * @param {ProtoProcessor<T>} func The function or processor.
   * @param {number} priority The default priority.
   * @return {Processor} The processor pair.
   * @template T
   */
  static makeProcessor(func, priority) {
    return Array.isArray(func) ? func : [func, priority];
  }
  /**
   * Creates a configuration for a package.
   * @param {string} name The package name or empty string.
   * @param {Object} config See `create` method.
   * @return {Configuration} The newly generated configuration.
   */
  static _create(name, config2 = {}) {
    let priority = config2.priority || PrioritizedList.DEFAULTPRIORITY;
    let init3 = config2.init ? this.makeProcessor(config2.init, priority) : null;
    let conf = config2.config ? this.makeProcessor(config2.config, priority) : null;
    let preprocessors = (config2.preprocessors || []).map(
      (pre) => this.makeProcessor(pre, priority)
    );
    let postprocessors = (config2.postprocessors || []).map(
      (post) => this.makeProcessor(post, priority)
    );
    let parser = config2.parser || "tex";
    return new _Configuration(
      name,
      config2.handler || {},
      config2.fallback || {},
      config2.items || {},
      config2.tags || {},
      config2.options || {},
      config2.nodes || {},
      preprocessors,
      postprocessors,
      init3,
      conf,
      priority,
      parser
    );
  }
  /**
   * Creator pattern for creating a named package configuration. This will be
   * administered in the configuration handler and can be retrieved again.
   * @param {string} name The package name.
   * @param {Object} config The configuration parameters:
   * Configuration for the TexParser consist of the following:
   *  * _handler_  configuration mapping handler types to lists of symbol mappings.
   *  * _fallback_ configuration mapping handler types to fallback methods.
   *  * _items_ for the StackItem factory.
   *  * _tags_ mapping tagging configurations to tagging objects.
   *  * _options_ parse options for the packages.
   *  * _nodes_ for the Node factory.
   *  * _preprocessors_ list of functions for preprocessing the LaTeX
   *      string wrt. to given parse options. Can contain a priority.
   *  * _postprocessors_ list of functions for postprocessing the MmlNode
   *      wrt. to given parse options. Can contain a priority.
   *  * _init_ init method and optionally its priority.
   *  * _config_ config method and optionally its priority.
   *  * _priority_ default priority of the configuration.
   *  * _parser_ the name of the parser that this configuration targets.
   * @return {Configuration} The newly generated configuration.
   */
  static create(name, config2 = {}) {
    let configuration = _Configuration._create(name, config2);
    ConfigurationHandler.set(name, configuration);
    return configuration;
  }
  /**
   * Creates an unnamed, ephemeral package configuration. It will not added to
   * the configuration handler.
   * @param {Object} config See `create` method.
   * @return {Configuration} The ephemeral package configuration.
   */
  static local(config2 = {}) {
    return _Configuration._create("", config2);
  }
  /**
   * The init method.
   * @type {Function}
   */
  get init() {
    return this.initMethod ? this.initMethod[0] : null;
  }
  /**
   * The config method to call once jax is ready.
   * @type {FunctionList}
   */
  get config() {
    return this.configMethod ? this.configMethod[0] : null;
  }
};
var ConfigurationHandler;
((ConfigurationHandler2) => {
  let maps = /* @__PURE__ */ new Map();
  ConfigurationHandler2.set = function(name, map) {
    maps.set(name, map);
  };
  ConfigurationHandler2.get = function(name) {
    return maps.get(name);
  };
  ConfigurationHandler2.keys = function() {
    return maps.keys();
  };
})(ConfigurationHandler || (ConfigurationHandler = {}));
var ParserConfiguration = class {
  /**
   * @constructor
   * @param {(string|[string,number])[]} packages A list of packages with
   *     optional priorities.
   * @parm {string[]} parsers   The names of the parsers this package targets
   */
  constructor(packages, parsers = ["tex"]) {
    /**
     * Priority list of init methods.
     * @type {FunctionList}
     */
    this.initMethod = new FunctionList();
    /**
     * Priority list of init methods to call once jax is ready.
     * @type {FunctionList}
     */
    this.configMethod = new FunctionList();
    /**
     * An ordered list of cofigurations.
     * @type {PrioritizedList<Configuration>}
     */
    this.configurations = new PrioritizedList();
    /**
     * The list of parsers this configuration targets
     */
    this.parsers = [];
    /**
     * The subhandlers for this configuration.
     * @type {SubHandlers}
     */
    this.handlers = new SubHandlers();
    /**
     * The collated stack items.
     * @type {StackItemConfig}
     */
    this.items = {};
    /**
     * The collated tag configurations.
     * @type {TagsConfig}
     */
    this.tags = {};
    /**
     * The collated options.
     * @type {OptionList}
     */
    this.options = {};
    /**
     * The collated node creators.
     * @type {{[key: string]: any}}
     */
    this.nodes = {};
    this.parsers = parsers;
    for (const pkg of packages.slice().reverse()) {
      this.addPackage(pkg);
    }
    for (let { item: config2, priority } of this.configurations) {
      this.append(config2, priority);
    }
  }
  /**
   * Init method for the configuration;
   */
  init() {
    this.initMethod.execute(this);
  }
  /**
   * Init method for when the jax is ready
   * @param {TeX} jax The TeX jax for this configuration
   */
  config(jax) {
    this.configMethod.execute(this, jax);
    for (const config2 of this.configurations) {
      this.addFilters(jax, config2.item);
    }
  }
  /**
   * Retrieves and adds configuration for a package with priority.
   * @param {(string | [string, number]} pkg Package with priority.
   */
  addPackage(pkg) {
    const name = typeof pkg === "string" ? pkg : pkg[0];
    const conf = this.getPackage(name);
    conf && this.configurations.add(conf, typeof pkg === "string" ? conf.priority : pkg[1]);
  }
  /**
   * Adds a configuration after the input jax is created.  (Used by \require.)
   * Sets items, nodes and runs configuration method explicitly.
   *
   * @param {string} name            The name of the package to add
   * @param {TeX} jax                The TeX jax where it is being registered
   * @param {OptionList=} options    The options for the configuration.
   */
  add(name, jax, options2 = {}) {
    const config2 = this.getPackage(name);
    this.append(config2);
    this.configurations.add(config2, config2.priority);
    this.init();
    const parser = jax.parseOptions;
    parser.nodeFactory.setCreators(config2.nodes);
    for (const kind of Object.keys(config2.items)) {
      parser.itemFactory.setNodeClass(kind, config2.items[kind]);
    }
    TagsFactory.addTags(config2.tags);
    defaultOptions(parser.options, config2.options);
    userOptions(parser.options, options2);
    this.addFilters(jax, config2);
    if (config2.config) {
      config2.config(this, jax);
    }
  }
  /**
   * Find a package and check that it is for the targeted parser
   *
   * @param {string} name       The name of the package to check
   * @return {Configuration}    The configuration for the package
   */
  getPackage(name) {
    const config2 = ConfigurationHandler.get(name);
    if (config2 && this.parsers.indexOf(config2.parser) < 0) {
      throw Error(`Package ${name} doesn't target the proper parser`);
    }
    return config2;
  }
  /**
   * Appends a configuration to the overall configuration object.
   * @param {Configuration} config A configuration.
   * @param {number} priority The configurations optional priority.
   */
  append(config2, priority) {
    priority = priority || config2.priority;
    if (config2.initMethod) {
      this.initMethod.add(config2.initMethod[0], config2.initMethod[1]);
    }
    if (config2.configMethod) {
      this.configMethod.add(config2.configMethod[0], config2.configMethod[1]);
    }
    this.handlers.add(config2.handler, config2.fallback, priority);
    Object.assign(this.items, config2.items);
    Object.assign(this.tags, config2.tags);
    defaultOptions(this.options, config2.options);
    Object.assign(this.nodes, config2.nodes);
  }
  /**
   * Adds pre- and postprocessor as filters to the jax.
   * @param {TeX<any} jax The TeX Jax.
   * @param {Configuration} config The configuration whose processors are added.
   */
  addFilters(jax, config2) {
    for (const [pre, priority] of config2.preprocessors) {
      jax.preFilters.add(pre, priority);
    }
    for (const [post, priority] of config2.postprocessors) {
      jax.postFilters.add(post, priority);
    }
  }
};

// node_modules/mathjax-full/ts/input/tex/StackItem.ts
var MmlStack = class {
  /**
   * @constructor
   * @extends {NodeStack}
   * @param {MmlNode[]} nodes An initial list of nodes to put on the stack.
   */
  constructor(_nodes) {
    this._nodes = _nodes;
  }
  /**
   * @return {MmlNode[]} The nodes on the stack.
   */
  get nodes() {
    return this._nodes;
  }
  /**
   * @override
   */
  Push(...nodes) {
    this._nodes.push(...nodes);
  }
  /**
   * @override
   */
  Pop() {
    return this._nodes.pop();
  }
  /**
   * @override
   */
  get First() {
    return this._nodes[this.Size() - 1];
  }
  /**
   * @override
   */
  set First(node) {
    this._nodes[this.Size() - 1] = node;
  }
  /**
   * @override
   */
  get Last() {
    return this._nodes[0];
  }
  /**
   * @override
   */
  set Last(node) {
    this._nodes[0] = node;
  }
  /**
   * @override
   */
  Peek(n) {
    if (n == null) {
      n = 1;
    }
    return this._nodes.slice(this.Size() - n);
  }
  /**
   * @override
   */
  Size() {
    return this._nodes.length;
  }
  /**
   * @override
   */
  Clear() {
    this._nodes = [];
  }
  /**
   * @override
   */
  toMml(inferred = true, forceRow) {
    if (this._nodes.length === 1 && !forceRow) {
      return this.First;
    }
    return this.create(
      "node",
      inferred ? "inferredMrow" : "mrow",
      this._nodes,
      {}
    );
  }
  /**
   * Convenience method to create nodes with the node factory on this stack.
   * @param {string} kind The kind of node to create.
   * @param {any[]} ...rest The remaining arguments for the creation method.
   * @return {MmlNode} The newly created node.
   */
  create(kind, ...rest) {
    return this.factory.configuration.nodeFactory.create(kind, ...rest);
  }
};
var BaseItem = class _BaseItem extends MmlStack {
  /**
   * @constructor
   * @extends {MmlStack}
   */
  constructor(factory, ...nodes) {
    super(nodes);
    this.factory = factory;
    /**
     * @override
     */
    this.global = {};
    this._properties = {};
    if (this.isOpen) {
      this._env = {};
    }
  }
  static {
    /**
     * The fail value.
     * @type {CheckType}
     */
    this.fail = [null, false];
  }
  static {
    /**
     * The success value.
     * @type {CheckType}
     */
    this.success = [null, true];
  }
  static {
    /**
     * A list of basic errors.
     * @type {{[key: string]: string[]}}
     */
    this.errors = {
      // @test ExtraOpenMissingClose
      end: ["MissingBeginExtraEnd", "Missing \\begin{%1} or extra \\end{%1}"],
      // @test ExtraCloseMissingOpen
      close: ["ExtraCloseMissingOpen", "Extra close brace or missing open brace"],
      // @test MissingLeftExtraRight
      right: ["MissingLeftExtraRight", "Missing \\left or extra \\right"],
      middle: ["ExtraMiddle", "Extra \\middle"]
    };
  }
  /**
   * @return {string} The type of the stack item.
   */
  get kind() {
    return "base";
  }
  /**
   * @return {EnvList} Get the private environment
   */
  get env() {
    return this._env;
  }
  /**
   * Set the private environment
   * @param {EnvList} value New private environemt.
   */
  set env(value) {
    this._env = value;
  }
  /**
   * Default is to copy local environment when pushed on stack
   */
  get copyEnv() {
    return true;
  }
  /**
   * @override
   */
  getProperty(key) {
    return this._properties[key];
  }
  /**
   * @override
   */
  setProperty(key, value) {
    this._properties[key] = value;
    return this;
  }
  /**
   * @return {boolean} True if item is an opening entity, i.e., it expects a
   *     closing counterpart on the stack later.
   */
  get isOpen() {
    return false;
  }
  /**
   * @return {boolean} True if item is an closing entity, i.e., it needs an
   *     opening counterpart already on the stack.
   */
  get isClose() {
    return false;
  }
  /**
   * @return {boolean} True if item is final, i.e., it contains one or multiple
   *      finished parsed nodes.
   */
  get isFinal() {
    return false;
  }
  /**
   * @override
   */
  isKind(kind) {
    return kind === this.kind;
  }
  /**
   * @override
   */
  checkItem(item) {
    if (item.isKind("over") && this.isOpen) {
      item.setProperty("num", this.toMml(false));
      this.Clear();
    }
    if (item.isKind("cell") && this.isOpen) {
      if (item.getProperty("linebreak")) {
        return _BaseItem.fail;
      }
      throw new TexError("Misplaced", "Misplaced %1", item.getName());
    }
    if (item.isClose && this.getErrors(item.kind)) {
      const [id, message] = this.getErrors(item.kind);
      throw new TexError(id, message, item.getName());
    }
    if (!item.isFinal) {
      return _BaseItem.success;
    }
    this.Push(item.First);
    return _BaseItem.fail;
  }
  /**
   * Clears the item's environment.
   */
  clearEnv() {
    for (const id of Object.keys(this.env)) {
      delete this.env[id];
    }
  }
  /**
   * @override
   */
  setProperties(def) {
    Object.assign(this._properties, def);
    return this;
  }
  /**
   * @override
   */
  getName() {
    return this.getProperty("name");
  }
  /**
   * @override
   */
  toString() {
    return this.kind + "[" + this.nodes.join("; ") + "]";
  }
  /**
   * Get error messages for a particular types of stack items. This reads error
   * messages from the static errors object, which can be extended in
   * subclasses.
   * @param {string} kind The stack item type.
   * @return {string[]} The list of arguments for the TeXError.
   */
  getErrors(kind) {
    const CLASS = this.constructor;
    return (CLASS.errors || {})[kind] || _BaseItem.errors[kind];
  }
};

// node_modules/mathjax-full/ts/input/tex/base/BaseItems.ts
var StartItem = class extends BaseItem {
  /**
   * @override
   */
  constructor(factory, global) {
    super(factory);
    this.global = global;
  }
  /**
   * @override
   */
  get kind() {
    return "start";
  }
  /**
   * @override
   */
  get isOpen() {
    return true;
  }
  /**
   * @override
   */
  checkItem(item) {
    if (item.isKind("stop")) {
      let node = this.toMml();
      if (!this.global.isInner) {
        node = this.factory.configuration.tags.finalize(node, this.env);
      }
      return [[this.factory.create("mml", node)], true];
    }
    return super.checkItem(item);
  }
};
var StopItem = class extends BaseItem {
  /**
   * @override
   */
  get kind() {
    return "stop";
  }
  /**
   * @override
   */
  get isClose() {
    return true;
  }
};
var OpenItem = class extends BaseItem {
  static {
    /**
     * @override
     */
    this.errors = Object.assign(Object.create(BaseItem.errors), {
      // @test ExtraOpenMissingClose
      "stop": [
        "ExtraOpenMissingClose",
        "Extra open brace or missing close brace"
      ]
    });
  }
  /**
   * @override
   */
  get kind() {
    return "open";
  }
  /**
   * @override
   */
  get isOpen() {
    return true;
  }
  /**
   * @override
   */
  checkItem(item) {
    if (item.isKind("close")) {
      let mml = this.toMml();
      const node = this.create("node", "TeXAtom", [mml]);
      return [[this.factory.create("mml", node)], true];
    }
    return super.checkItem(item);
  }
};
var CloseItem = class extends BaseItem {
  /**
   * @override
   */
  get kind() {
    return "close";
  }
  /**
   * @override
   */
  get isClose() {
    return true;
  }
};
var PrimeItem = class extends BaseItem {
  /**
   * @override
   */
  get kind() {
    return "prime";
  }
  /**
   * @override
   */
  checkItem(item) {
    let [top0, top1] = this.Peek(2);
    if (!NodeUtil_default.isType(top0, "msubsup") || NodeUtil_default.isType(top0, "msup")) {
      const node = this.create("node", "msup", [top0, top1]);
      return [[node, item], true];
    }
    NodeUtil_default.setChild(top0, top0.sup, top1);
    return [[top0, item], true];
  }
};
var SubsupItem = class extends BaseItem {
  static {
    /**
     * @override
     */
    this.errors = Object.assign(Object.create(BaseItem.errors), {
      // @test MissingScript Sub, MissingScript Sup
      "stop": [
        "MissingScript",
        "Missing superscript or subscript argument"
      ],
      // @test MissingOpenForSup
      "sup": [
        "MissingOpenForSup",
        "Missing open brace for superscript"
      ],
      // @test MissingOpenForSub
      "sub": [
        "MissingOpenForSub",
        "Missing open brace for subscript"
      ]
    });
  }
  /**
   * @override
   */
  get kind() {
    return "subsup";
  }
  /**
   * @override
   */
  checkItem(item) {
    if (item.isKind("open") || item.isKind("left")) {
      return BaseItem.success;
    }
    const top = this.First;
    const position = this.getProperty("position");
    if (item.isKind("mml")) {
      if (this.getProperty("primes")) {
        if (position !== 2) {
          NodeUtil_default.setChild(top, 2, this.getProperty("primes"));
        } else {
          NodeUtil_default.setProperty(this.getProperty("primes"), "variantForm", true);
          const node = this.create("node", "mrow", [this.getProperty("primes"), item.First]);
          item.First = node;
        }
      }
      NodeUtil_default.setChild(top, position, item.First);
      if (this.getProperty("movesupsub") != null) {
        NodeUtil_default.setProperty(top, "movesupsub", this.getProperty("movesupsub"));
      }
      const result = this.factory.create("mml", top);
      return [[result], true];
    }
    if (super.checkItem(item)[1]) {
      const error = this.getErrors(["", "sub", "sup"][position]);
      throw new TexError(error[0], error[1], ...error.splice(2));
    }
    return null;
  }
};
var OverItem = class extends BaseItem {
  /**
   * @override
   */
  constructor(factory) {
    super(factory);
    this.setProperty("name", "\\over");
  }
  /**
   * @override
   */
  get kind() {
    return "over";
  }
  /**
   * @override
   */
  get isClose() {
    return true;
  }
  /**
   * @override
   */
  checkItem(item) {
    if (item.isKind("over")) {
      throw new TexError(
        "AmbiguousUseOf",
        "Ambiguous use of %1",
        item.getName()
      );
    }
    if (item.isClose) {
      let mml = this.create(
        "node",
        "mfrac",
        [this.getProperty("num"), this.toMml(false)]
      );
      if (this.getProperty("thickness") != null) {
        NodeUtil_default.setAttribute(
          mml,
          "linethickness",
          this.getProperty("thickness")
        );
      }
      if (this.getProperty("open") || this.getProperty("close")) {
        NodeUtil_default.setProperty(mml, "withDelims", true);
        mml = ParseUtil_default.fixedFence(
          this.factory.configuration,
          this.getProperty("open"),
          mml,
          this.getProperty("close")
        );
      }
      return [[this.factory.create("mml", mml), item], true];
    }
    return super.checkItem(item);
  }
  /**
   * @override
   */
  toString() {
    return "over[" + this.getProperty("num") + " / " + this.nodes.join("; ") + "]";
  }
};
var LeftItem = class extends BaseItem {
  static {
    /**
     * @override
     */
    this.errors = Object.assign(Object.create(BaseItem.errors), {
      // @test ExtraLeftMissingRight
      "stop": [
        "ExtraLeftMissingRight",
        "Extra \\left or missing \\right"
      ]
    });
  }
  /**
   * @override
   */
  constructor(factory, delim) {
    super(factory);
    this.setProperty("delim", delim);
  }
  /**
   * @override
   */
  get kind() {
    return "left";
  }
  /**
   * @override
   */
  get isOpen() {
    return true;
  }
  /**
   * @override
   */
  checkItem(item) {
    if (item.isKind("right")) {
      return [[this.factory.create("mml", ParseUtil_default.fenced(
        this.factory.configuration,
        this.getProperty("delim"),
        this.toMml(),
        item.getProperty("delim"),
        "",
        item.getProperty("color")
      ))], true];
    }
    if (item.isKind("middle")) {
      const def = { stretchy: true };
      if (item.getProperty("color")) {
        def.mathcolor = item.getProperty("color");
      }
      this.Push(
        this.create("node", "TeXAtom", [], { texClass: TEXCLASS.CLOSE }),
        this.create("token", "mo", def, item.getProperty("delim")),
        this.create("node", "TeXAtom", [], { texClass: TEXCLASS.OPEN })
      );
      this.env = {};
      return [[this], true];
    }
    return super.checkItem(item);
  }
};
var Middle = class extends BaseItem {
  /**
   * @override
   */
  constructor(factory, delim, color) {
    super(factory);
    this.setProperty("delim", delim);
    color && this.setProperty("color", color);
  }
  /**
   * @override
   */
  get kind() {
    return "middle";
  }
  /**
   * @override
   */
  get isClose() {
    return true;
  }
};
var RightItem = class extends BaseItem {
  /**
   * @override
   */
  constructor(factory, delim, color) {
    super(factory);
    this.setProperty("delim", delim);
    color && this.setProperty("color", color);
  }
  /**
   * @override
   */
  get kind() {
    return "right";
  }
  /**
   * @override
   */
  get isClose() {
    return true;
  }
};
var BeginItem = class extends BaseItem {
  /**
   * @override
   */
  get kind() {
    return "begin";
  }
  /**
   * @override
   */
  get isOpen() {
    return true;
  }
  /**
   * @override
   */
  checkItem(item) {
    if (item.isKind("end")) {
      if (item.getName() !== this.getName()) {
        throw new TexError(
          "EnvBadEnd",
          "\\begin{%1} ended with \\end{%2}",
          this.getName(),
          item.getName()
        );
      }
      if (!this.getProperty("end")) {
        return [[this.factory.create("mml", this.toMml())], true];
      }
      return BaseItem.fail;
    }
    if (item.isKind("stop")) {
      throw new TexError("EnvMissingEnd", "Missing \\end{%1}", this.getName());
    }
    return super.checkItem(item);
  }
};
var EndItem = class extends BaseItem {
  /**
   * @override
   */
  get kind() {
    return "end";
  }
  /**
   * @override
   */
  get isClose() {
    return true;
  }
};
var StyleItem = class extends BaseItem {
  /**
   * @override
   */
  get kind() {
    return "style";
  }
  /**
   * @override
   */
  checkItem(item) {
    if (!item.isClose) {
      return super.checkItem(item);
    }
    const mml = this.create("node", "mstyle", this.nodes, this.getProperty("styles"));
    return [[this.factory.create("mml", mml), item], true];
  }
};
var PositionItem = class extends BaseItem {
  /**
   * @override
   */
  get kind() {
    return "position";
  }
  /**
   * @override
   */
  checkItem(item) {
    if (item.isClose) {
      throw new TexError("MissingBoxFor", "Missing box for %1", this.getName());
    }
    if (item.isFinal) {
      let mml = item.toMml();
      switch (this.getProperty("move")) {
        case "vertical":
          mml = this.create(
            "node",
            "mpadded",
            [mml],
            {
              height: this.getProperty("dh"),
              depth: this.getProperty("dd"),
              voffset: this.getProperty("dh")
            }
          );
          return [[this.factory.create("mml", mml)], true];
        case "horizontal":
          return [[
            this.factory.create("mml", this.getProperty("left")),
            item,
            this.factory.create("mml", this.getProperty("right"))
          ], true];
      }
    }
    return super.checkItem(item);
  }
};
var CellItem = class extends BaseItem {
  /**
   * @override
   */
  get kind() {
    return "cell";
  }
  /**
   * @override
   */
  get isClose() {
    return true;
  }
};
var MmlItem = class extends BaseItem {
  /**
   * @override
   */
  get isFinal() {
    return true;
  }
  /**
   * @override
   */
  get kind() {
    return "mml";
  }
};
var FnItem = class extends BaseItem {
  /**
   * @override
   */
  get kind() {
    return "fn";
  }
  /**
   * @override
   */
  checkItem(item) {
    const top = this.First;
    if (top) {
      if (item.isOpen) {
        return BaseItem.success;
      }
      if (!item.isKind("fn")) {
        let mml = item.First;
        if (!item.isKind("mml") || !mml) {
          return [[top, item], true];
        }
        if (NodeUtil_default.isType(mml, "mstyle") && mml.childNodes.length && NodeUtil_default.isType(mml.childNodes[0].childNodes[0], "mspace") || NodeUtil_default.isType(mml, "mspace")) {
          return [[top, item], true];
        }
        if (NodeUtil_default.isEmbellished(mml)) {
          mml = NodeUtil_default.getCoreMO(mml);
        }
        const form = NodeUtil_default.getForm(mml);
        if (form != null && [0, 0, 1, 1, 0, 1, 1, 0, 0, 0][form[2]]) {
          return [[top, item], true];
        }
      }
      const node = this.create(
        "token",
        "mo",
        { texClass: TEXCLASS.NONE },
        entities.ApplyFunction
      );
      return [[top, node, item], true];
    }
    return super.checkItem.apply(this, arguments);
  }
};
var NotItem = class extends BaseItem {
  constructor() {
    super(...arguments);
    this.remap = MapHandler.getMap("not_remap");
  }
  /**
   * @override
   */
  get kind() {
    return "not";
  }
  /**
   * @override
   */
  checkItem(item) {
    let mml;
    let c;
    let textNode;
    if (item.isKind("open") || item.isKind("left")) {
      return BaseItem.success;
    }
    if (item.isKind("mml") && (NodeUtil_default.isType(item.First, "mo") || NodeUtil_default.isType(item.First, "mi") || NodeUtil_default.isType(item.First, "mtext"))) {
      mml = item.First;
      c = NodeUtil_default.getText(mml);
      if (c.length === 1 && !NodeUtil_default.getProperty(mml, "movesupsub") && NodeUtil_default.getChildren(mml).length === 1) {
        if (this.remap.contains(c)) {
          textNode = this.create("text", this.remap.lookup(c).char);
          NodeUtil_default.setChild(mml, 0, textNode);
        } else {
          textNode = this.create("text", "̸");
          NodeUtil_default.appendChildren(mml, [textNode]);
        }
        return [[item], true];
      }
    }
    textNode = this.create("text", "⧸");
    const mtextNode = this.create("node", "mtext", [], {}, textNode);
    const paddedNode = this.create("node", "mpadded", [mtextNode], { width: 0 });
    mml = this.create("node", "TeXAtom", [paddedNode], { texClass: TEXCLASS.REL });
    return [[mml, item], true];
  }
};
var NonscriptItem = class extends BaseItem {
  /**
   * @override
   */
  get kind() {
    return "nonscript";
  }
  /**
   * @override
   */
  checkItem(item) {
    if (item.isKind("mml") && item.Size() === 1) {
      let mml = item.First;
      if (mml.isKind("mstyle") && mml.notParent) {
        mml = NodeUtil_default.getChildren(NodeUtil_default.getChildren(mml)[0])[0];
      }
      if (mml.isKind("mspace")) {
        if (mml !== item.First) {
          const mrow = this.create("node", "mrow", [item.Pop()]);
          item.Push(mrow);
        }
        this.factory.configuration.addNode("nonscript", item.First);
      }
    }
    return [[item], true];
  }
};
var DotsItem = class extends BaseItem {
  /**
   * @override
   */
  get kind() {
    return "dots";
  }
  /**
   * @override
   */
  checkItem(item) {
    if (item.isKind("open") || item.isKind("left")) {
      return BaseItem.success;
    }
    let dots = this.getProperty("ldots");
    let top = item.First;
    if (item.isKind("mml") && NodeUtil_default.isEmbellished(top)) {
      const tclass = NodeUtil_default.getTexClass(NodeUtil_default.getCoreMO(top));
      if (tclass === TEXCLASS.BIN || tclass === TEXCLASS.REL) {
        dots = this.getProperty("cdots");
      }
    }
    return [[dots, item], true];
  }
};
var ArrayItem = class extends BaseItem {
  constructor() {
    super(...arguments);
    /**
     * The table as a list of rows.
     * @type {MmlNode[]}
     */
    this.table = [];
    /**
     * The current row as a list of cells.
     * @type {MmlNode[]}
     */
    this.row = [];
    /**
     * Frame specification as a list of strings.
     * @type {string[]}
     */
    this.frame = [];
    /**
     * Hfill value.
     * @type {number[]}
     */
    this.hfill = [];
    /**
     * Properties for special array definitions.
     * @type {{[key: string]: string|number|boolean}}
     */
    this.arraydef = {};
    /**
     * True if separators are dashed.
     * @type {boolean}
     */
    this.dashed = false;
  }
  /**
   * @override
   */
  get kind() {
    return "array";
  }
  /**
   * @override
   */
  get isOpen() {
    return true;
  }
  /**
   * @override
   */
  get copyEnv() {
    return false;
  }
  /**
   * @override
   */
  checkItem(item) {
    if (item.isClose && !item.isKind("over")) {
      if (item.getProperty("isEntry")) {
        this.EndEntry();
        this.clearEnv();
        return BaseItem.fail;
      }
      if (item.getProperty("isCR")) {
        this.EndEntry();
        this.EndRow();
        this.clearEnv();
        return BaseItem.fail;
      }
      this.EndTable();
      this.clearEnv();
      let newItem = this.factory.create("mml", this.createMml());
      if (this.getProperty("requireClose")) {
        if (item.isKind("close")) {
          return [[newItem], true];
        }
        throw new TexError("MissingCloseBrace", "Missing close brace");
      }
      return [[newItem, item], true];
    }
    return super.checkItem(item);
  }
  /**
   * Create the MathML representation of the table.
   *
   * @return {MmlNode}
   */
  createMml() {
    const scriptlevel = this.arraydef["scriptlevel"];
    delete this.arraydef["scriptlevel"];
    let mml = this.create("node", "mtable", this.table, this.arraydef);
    if (scriptlevel) {
      mml.setProperty("scriptlevel", scriptlevel);
    }
    if (this.frame.length === 4) {
      NodeUtil_default.setAttribute(mml, "frame", this.dashed ? "dashed" : "solid");
    } else if (this.frame.length) {
      if (this.arraydef["rowlines"]) {
        this.arraydef["rowlines"] = this.arraydef["rowlines"].replace(/none( none)+$/, "none");
      }
      NodeUtil_default.setAttribute(mml, "frame", "");
      mml = this.create("node", "menclose", [mml], { notation: this.frame.join(" ") });
      if ((this.arraydef["columnlines"] || "none") !== "none" || (this.arraydef["rowlines"] || "none") !== "none") {
        NodeUtil_default.setAttribute(mml, "data-padding", 0);
      }
    }
    if (this.getProperty("open") || this.getProperty("close")) {
      mml = ParseUtil_default.fenced(
        this.factory.configuration,
        this.getProperty("open"),
        mml,
        this.getProperty("close")
      );
    }
    return mml;
  }
  /**
   * Finishes a single cell of the array.
   */
  EndEntry() {
    const mtd = this.create("node", "mtd", this.nodes);
    if (this.hfill.length) {
      if (this.hfill[0] === 0) {
        NodeUtil_default.setAttribute(mtd, "columnalign", "right");
      }
      if (this.hfill[this.hfill.length - 1] === this.Size()) {
        NodeUtil_default.setAttribute(
          mtd,
          "columnalign",
          NodeUtil_default.getAttribute(mtd, "columnalign") ? "center" : "left"
        );
      }
    }
    this.row.push(mtd);
    this.Clear();
    this.hfill = [];
  }
  /**
   * Finishes a single row of the array.
   */
  EndRow() {
    let node;
    if (this.getProperty("isNumbered") && this.row.length === 3) {
      this.row.unshift(this.row.pop());
      node = this.create("node", "mlabeledtr", this.row);
    } else {
      node = this.create("node", "mtr", this.row);
    }
    this.table.push(node);
    this.row = [];
  }
  /**
   * Finishes the table layout.
   */
  EndTable() {
    if (this.Size() || this.row.length) {
      this.EndEntry();
      this.EndRow();
    }
    this.checkLines();
  }
  /**
   * Finishes line layout if not already given.
   */
  checkLines() {
    if (this.arraydef["rowlines"]) {
      const lines = this.arraydef["rowlines"].split(/ /);
      if (lines.length === this.table.length) {
        this.frame.push("bottom");
        lines.pop();
        this.arraydef["rowlines"] = lines.join(" ");
      } else if (lines.length < this.table.length - 1) {
        this.arraydef["rowlines"] += " none";
      }
    }
    if (this.getProperty("rowspacing")) {
      const rows = this.arraydef["rowspacing"].split(/ /);
      while (rows.length < this.table.length) {
        rows.push(this.getProperty("rowspacing") + "em");
      }
      this.arraydef["rowspacing"] = rows.join(" ");
    }
  }
  /**
   * Adds a row-spacing to the current row (padding out the rowspacing if needed to get there).
   *
   * @param {string} spacing   The rowspacing to use for the current row.
   */
  addRowSpacing(spacing) {
    if (this.arraydef["rowspacing"]) {
      const rows = this.arraydef["rowspacing"].split(/ /);
      if (!this.getProperty("rowspacing")) {
        let dimem = ParseUtil_default.dimen2em(rows[0]);
        this.setProperty("rowspacing", dimem);
      }
      const rowspacing = this.getProperty("rowspacing");
      while (rows.length < this.table.length) {
        rows.push(ParseUtil_default.Em(rowspacing));
      }
      rows[this.table.length - 1] = ParseUtil_default.Em(
        Math.max(0, rowspacing + ParseUtil_default.dimen2em(spacing))
      );
      this.arraydef["rowspacing"] = rows.join(" ");
    }
  }
};
var EqnArrayItem = class extends ArrayItem {
  /**
   * @override
   */
  constructor(factory, ...args) {
    super(factory);
    /**
     * The length of the longest row.
     */
    this.maxrow = 0;
    this.factory.configuration.tags.start(args[0], args[2], args[1]);
  }
  /**
   * @override
   */
  get kind() {
    return "eqnarray";
  }
  /**
   * @override
   */
  EndEntry() {
    if (this.row.length) {
      ParseUtil_default.fixInitialMO(this.factory.configuration, this.nodes);
    }
    const node = this.create("node", "mtd", this.nodes);
    this.row.push(node);
    this.Clear();
  }
  /**
   * @override
   */
  EndRow() {
    if (this.row.length > this.maxrow) {
      this.maxrow = this.row.length;
    }
    let mtr = "mtr";
    let tag = this.factory.configuration.tags.getTag();
    if (tag) {
      this.row = [tag].concat(this.row);
      mtr = "mlabeledtr";
    }
    this.factory.configuration.tags.clearTag();
    const node = this.create("node", mtr, this.row);
    this.table.push(node);
    this.row = [];
  }
  /**
   * @override
   */
  EndTable() {
    super.EndTable();
    this.factory.configuration.tags.end();
    this.extendArray("columnalign", this.maxrow);
    this.extendArray("columnwidth", this.maxrow);
    this.extendArray("columnspacing", this.maxrow - 1);
  }
  /**
   * Extend a column specification to include a repeating set of values
   *   so that it has enough to match the maximum row length.
   */
  extendArray(name, max2) {
    if (!this.arraydef[name]) return;
    const repeat = this.arraydef[name].split(/ /);
    const columns = [...repeat];
    if (columns.length > 1) {
      while (columns.length < max2) {
        columns.push(...repeat);
      }
      this.arraydef[name] = columns.slice(0, max2).join(" ");
    }
  }
};
var EquationItem = class extends BaseItem {
  /**
   * @override
   */
  constructor(factory, ...args) {
    super(factory);
    this.factory.configuration.tags.start("equation", true, args[0]);
  }
  /**
   * @override
   */
  get kind() {
    return "equation";
  }
  /**
   * @override
   */
  get isOpen() {
    return true;
  }
  /**
   * @override
   */
  checkItem(item) {
    if (item.isKind("end")) {
      let mml = this.toMml();
      let tag = this.factory.configuration.tags.getTag();
      this.factory.configuration.tags.end();
      return [[tag ? this.factory.configuration.tags.enTag(mml, tag) : mml, item], true];
    }
    if (item.isKind("stop")) {
      throw new TexError("EnvMissingEnd", "Missing \\end{%1}", this.getName());
    }
    return super.checkItem(item);
  }
};

// node_modules/mathjax-full/ts/input/tex/TexConstants.ts
var TexConstant;
((TexConstant2) => {
  TexConstant2.Variant = {
    NORMAL: "normal",
    BOLD: "bold",
    ITALIC: "italic",
    BOLDITALIC: "bold-italic",
    DOUBLESTRUCK: "double-struck",
    FRAKTUR: "fraktur",
    BOLDFRAKTUR: "bold-fraktur",
    SCRIPT: "script",
    BOLDSCRIPT: "bold-script",
    SANSSERIF: "sans-serif",
    BOLDSANSSERIF: "bold-sans-serif",
    SANSSERIFITALIC: "sans-serif-italic",
    SANSSERIFBOLDITALIC: "sans-serif-bold-italic",
    MONOSPACE: "monospace",
    INITIAL: "inital",
    TAILED: "tailed",
    LOOPED: "looped",
    STRETCHED: "stretched",
    CALLIGRAPHIC: "-tex-calligraphic",
    BOLDCALLIGRAPHIC: "-tex-bold-calligraphic",
    OLDSTYLE: "-tex-oldstyle",
    BOLDOLDSTYLE: "-tex-bold-oldstyle",
    MATHITALIC: "-tex-mathit"
  };
  TexConstant2.Form = {
    PREFIX: "prefix",
    INFIX: "infix",
    POSTFIX: "postfix"
  };
  TexConstant2.LineBreak = {
    AUTO: "auto",
    NEWLINE: "newline",
    NOBREAK: "nobreak",
    GOODBREAK: "goodbreak",
    BADBREAK: "badbreak"
  };
  TexConstant2.LineBreakStyle = {
    BEFORE: "before",
    AFTER: "after",
    DUPLICATE: "duplicate",
    INFIXLINBREAKSTYLE: "infixlinebreakstyle"
  };
  TexConstant2.IndentAlign = {
    LEFT: "left",
    CENTER: "center",
    RIGHT: "right",
    AUTO: "auto",
    ID: "id",
    INDENTALIGN: "indentalign"
  };
  TexConstant2.IndentShift = {
    INDENTSHIFT: "indentshift"
  };
  TexConstant2.LineThickness = {
    THIN: "thin",
    MEDIUM: "medium",
    THICK: "thick"
  };
  TexConstant2.Notation = {
    LONGDIV: "longdiv",
    ACTUARIAL: "actuarial",
    PHASORANGLE: "phasorangle",
    RADICAL: "radical",
    BOX: "box",
    ROUNDEDBOX: "roundedbox",
    CIRCLE: "circle",
    LEFT: "left",
    RIGHT: "right",
    TOP: "top",
    BOTTOM: "bottom",
    UPDIAGONALSTRIKE: "updiagonalstrike",
    DOWNDIAGONALSTRIKE: "downdiagonalstrike",
    VERTICALSTRIKE: "verticalstrike",
    HORIZONTALSTRIKE: "horizontalstrike",
    NORTHEASTARROW: "northeastarrow",
    MADRUWB: "madruwb",
    UPDIAGONALARROW: "updiagonalarrow"
  };
  TexConstant2.Align = {
    TOP: "top",
    BOTTOM: "bottom",
    CENTER: "center",
    BASELINE: "baseline",
    AXIS: "axis",
    LEFT: "left",
    RIGHT: "right"
  };
  TexConstant2.Lines = {
    NONE: "none",
    SOLID: "solid",
    DASHED: "dashed"
  };
  TexConstant2.Side = {
    LEFT: "left",
    RIGHT: "right",
    LEFTOVERLAP: "leftoverlap",
    RIGHTOVERLAP: "rightoverlap"
  };
  TexConstant2.Width = {
    AUTO: "auto",
    FIT: "fit"
  };
  TexConstant2.Actiontype = {
    TOGGLE: "toggle",
    STATUSLINE: "statusline",
    TOOLTIP: "tooltip",
    INPUT: "input"
  };
  TexConstant2.Overflow = {
    LINBREAK: "linebreak",
    SCROLL: "scroll",
    ELIDE: "elide",
    TRUNCATE: "truncate",
    SCALE: "scale"
  };
  TexConstant2.Unit = {
    EM: "em",
    EX: "ex",
    PX: "px",
    IN: "in",
    CM: "cm",
    MM: "mm",
    PT: "pt",
    PC: "pc"
  };
})(TexConstant || (TexConstant = {}));

// node_modules/mathjax-full/ts/input/tex/ams/AmsItems.ts
var MultlineItem = class extends ArrayItem {
  /**
   * @override
   */
  constructor(factory, ...args) {
    super(factory);
    this.factory.configuration.tags.start("multline", true, args[0]);
  }
  /**
   * @override
   */
  get kind() {
    return "multline";
  }
  /**
   * @override
   */
  EndEntry() {
    if (this.table.length) {
      ParseUtil_default.fixInitialMO(this.factory.configuration, this.nodes);
    }
    const shove = this.getProperty("shove");
    const mtd = this.create(
      "node",
      "mtd",
      this.nodes,
      shove ? { columnalign: shove } : {}
    );
    this.setProperty("shove", null);
    this.row.push(mtd);
    this.Clear();
  }
  /**
   * @override
   */
  EndRow() {
    if (this.row.length !== 1) {
      throw new TexError(
        "MultlineRowsOneCol",
        "The rows within the %1 environment must have exactly one column",
        "multline"
      );
    }
    let row = this.create("node", "mtr", this.row);
    this.table.push(row);
    this.row = [];
  }
  /**
   * @override
   */
  EndTable() {
    super.EndTable();
    if (this.table.length) {
      let m = this.table.length - 1, label = -1;
      if (!NodeUtil_default.getAttribute(
        NodeUtil_default.getChildren(this.table[0])[0],
        "columnalign"
      )) {
        NodeUtil_default.setAttribute(
          NodeUtil_default.getChildren(this.table[0])[0],
          "columnalign",
          TexConstant.Align.LEFT
        );
      }
      if (!NodeUtil_default.getAttribute(
        NodeUtil_default.getChildren(this.table[m])[0],
        "columnalign"
      )) {
        NodeUtil_default.setAttribute(
          NodeUtil_default.getChildren(this.table[m])[0],
          "columnalign",
          TexConstant.Align.RIGHT
        );
      }
      let tag = this.factory.configuration.tags.getTag();
      if (tag) {
        label = this.arraydef.side === TexConstant.Align.LEFT ? 0 : this.table.length - 1;
        const mtr = this.table[label];
        const mlabel = this.create(
          "node",
          "mlabeledtr",
          [tag].concat(NodeUtil_default.getChildren(mtr))
        );
        NodeUtil_default.copyAttributes(mtr, mlabel);
        this.table[label] = mlabel;
      }
    }
    this.factory.configuration.tags.end();
  }
};
var FlalignItem = class extends EqnArrayItem {
  /**
   * @override
   */
  constructor(factory, name, numbered, padded, center) {
    super(factory);
    this.name = name;
    this.numbered = numbered;
    this.padded = padded;
    this.center = center;
    this.factory.configuration.tags.start(name, numbered, numbered);
  }
  /**
   * @override
   */
  get kind() {
    return "flalign";
  }
  /**
   * @override
   */
  EndEntry() {
    super.EndEntry();
    const n = this.getProperty("xalignat");
    if (!n) return;
    if (this.row.length > n) {
      throw new TexError("XalignOverflow", "Extra %1 in row of %2", "&", this.name);
    }
  }
  /**
   * @override
   */
  EndRow() {
    let cell;
    let row = this.row;
    const n = this.getProperty("xalignat");
    while (row.length < n) {
      row.push(this.create("node", "mtd"));
    }
    this.row = [];
    if (this.padded) {
      this.row.push(this.create("node", "mtd"));
    }
    while (cell = row.shift()) {
      this.row.push(cell);
      cell = row.shift();
      if (cell) this.row.push(cell);
      if (row.length || this.padded) {
        this.row.push(this.create("node", "mtd"));
      }
    }
    if (this.row.length > this.maxrow) {
      this.maxrow = this.row.length;
    }
    super.EndRow();
    const mtr = this.table[this.table.length - 1];
    if (this.getProperty("zeroWidthLabel") && mtr.isKind("mlabeledtr")) {
      const mtd = NodeUtil_default.getChildren(mtr)[0];
      const side = this.factory.configuration.options["tagSide"];
      const def = { width: 0, ...side === "right" ? { lspace: "-1width" } : {} };
      const mpadded = this.create("node", "mpadded", NodeUtil_default.getChildren(mtd), def);
      mtd.setChildren([mpadded]);
    }
  }
  /**
   * @override
   */
  EndTable() {
    super.EndTable();
    if (this.center) {
      if (this.maxrow <= 2) {
        const def = this.arraydef;
        delete def.width;
        delete this.global.indentalign;
      }
    }
  }
};

// node_modules/mathjax-full/ts/input/tex/ParseMethods.ts
var ParseMethods;
((ParseMethods2) => {
  function variable(parser, c) {
    const def = ParseUtil_default.getFontDef(parser);
    const env = parser.stack.env;
    if (env.multiLetterIdentifiers && env.font !== "") {
      c = parser.string.substr(parser.i - 1).match(env.multiLetterIdentifiers)[0];
      parser.i += c.length - 1;
      if (def.mathvariant === TexConstant.Variant.NORMAL && env.noAutoOP && c.length > 1) {
        def.autoOP = false;
      }
    }
    const node = parser.create("token", "mi", def, c);
    parser.Push(node);
  }
  ParseMethods2.variable = variable;
  function digit(parser, c) {
    let mml;
    const pattern = parser.configuration.options["digits"];
    const n = parser.string.slice(parser.i - 1).match(pattern);
    const def = ParseUtil_default.getFontDef(parser);
    if (n) {
      mml = parser.create("token", "mn", def, n[0].replace(/[{}]/g, ""));
      parser.i += n[0].length - 1;
    } else {
      mml = parser.create("token", "mo", def, c);
    }
    parser.Push(mml);
  }
  ParseMethods2.digit = digit;
  function controlSequence(parser, _c) {
    const name = parser.GetCS();
    parser.parse("macro", [parser, name]);
  }
  ParseMethods2.controlSequence = controlSequence;
  function mathchar0mi(parser, mchar) {
    const def = mchar.attributes || { mathvariant: TexConstant.Variant.ITALIC };
    const node = parser.create("token", "mi", def, mchar.char);
    parser.Push(node);
  }
  ParseMethods2.mathchar0mi = mathchar0mi;
  function mathchar0mo(parser, mchar) {
    const def = mchar.attributes || {};
    def["stretchy"] = false;
    const node = parser.create("token", "mo", def, mchar.char);
    NodeUtil_default.setProperty(node, "fixStretchy", true);
    parser.configuration.addNode("fixStretchy", node);
    parser.Push(node);
  }
  ParseMethods2.mathchar0mo = mathchar0mo;
  function mathchar7(parser, mchar) {
    const def = mchar.attributes || { mathvariant: TexConstant.Variant.NORMAL };
    if (parser.stack.env["font"]) {
      def["mathvariant"] = parser.stack.env["font"];
    }
    const node = parser.create("token", "mi", def, mchar.char);
    parser.Push(node);
  }
  ParseMethods2.mathchar7 = mathchar7;
  function delimiter(parser, delim) {
    let def = delim.attributes || {};
    def = Object.assign({ fence: false, stretchy: false }, def);
    const node = parser.create("token", "mo", def, delim.char);
    parser.Push(node);
  }
  ParseMethods2.delimiter = delimiter;
  function environment(parser, env, func, args) {
    const end = args[0];
    let mml = parser.itemFactory.create("begin").setProperties({ name: env, end });
    mml = func(parser, mml, ...args.slice(1));
    parser.Push(mml);
  }
  ParseMethods2.environment = environment;
})(ParseMethods || (ParseMethods = {}));
var ParseMethods_default = ParseMethods;

// node_modules/mathjax-full/ts/input/tex/Symbol.ts
var Symbol2 = class {
  /**
   * @constructor
   * @param {string} symbol The symbol parsed.
   * @param {string} char The corresponding translation.
   * @param {Attributes} attributes The attributes for the translation.
   */
  constructor(_symbol, _char, _attributes) {
    this._symbol = _symbol;
    this._char = _char;
    this._attributes = _attributes;
  }
  get symbol() {
    return this._symbol;
  }
  get char() {
    return this._char;
  }
  get attributes() {
    return this._attributes;
  }
};
var Macro = class {
  /**
   * @constructor
   * @param {string} symbol The symbol parsed
   * @param {ParseMethod} func The parsing function for that symbol.
   * @param {Args[]} args Additional arguments for the function.
   */
  constructor(_symbol, _func, _args = []) {
    this._symbol = _symbol;
    this._func = _func;
    this._args = _args;
  }
  get symbol() {
    return this._symbol;
  }
  get func() {
    return this._func;
  }
  get args() {
    return this._args;
  }
};

// node_modules/mathjax-full/ts/util/lengths.ts
var BIGDIMEN = 1e6;
var UNITS = {
  px: 1,
  "in": 96,
  // 96 px to an inch
  cm: 96 / 2.54,
  // 2.54 cm to an inch
  mm: 96 / 25.4
  // 10 mm to a cm
};
var RELUNITS = {
  em: 1,
  ex: 0.431,
  // this.TEX.x_height;
  pt: 1 / 10,
  // 10 pt to an em
  pc: 12 / 10,
  // 12 pc to a pt
  mu: 1 / 18
  // 18mu to an em for the scriptlevel
};
var MATHSPACE = {
  /* tslint:disable:whitespace */
  veryverythinmathspace: 1 / 18,
  verythinmathspace: 2 / 18,
  thinmathspace: 3 / 18,
  mediummathspace: 4 / 18,
  thickmathspace: 5 / 18,
  verythickmathspace: 6 / 18,
  veryverythickmathspace: 7 / 18,
  negativeveryverythinmathspace: -1 / 18,
  negativeverythinmathspace: -2 / 18,
  negativethinmathspace: -3 / 18,
  negativemediummathspace: -4 / 18,
  negativethickmathspace: -5 / 18,
  negativeverythickmathspace: -6 / 18,
  negativeveryverythickmathspace: -7 / 18,
  /* tslint:enable */
  thin: 0.04,
  medium: 0.06,
  thick: 0.1,
  normal: 1,
  big: 2,
  small: 1 / Math.sqrt(2),
  infinity: BIGDIMEN
};
function length2em(length, size = 0, scale = 1, em2 = 16) {
  if (typeof length !== "string") {
    length = String(length);
  }
  if (length === "" || length == null) {
    return size;
  }
  if (MATHSPACE[length]) {
    return MATHSPACE[length];
  }
  let match = length.match(/^\s*([-+]?(?:\.\d+|\d+(?:\.\d*)?))?(pt|em|ex|mu|px|pc|in|mm|cm|%)?/);
  if (!match) {
    return size;
  }
  let m = parseFloat(match[1] || "1"), unit = match[2];
  if (UNITS.hasOwnProperty(unit)) {
    return m * UNITS[unit] / em2 / scale;
  }
  if (RELUNITS.hasOwnProperty(unit)) {
    return m * RELUNITS[unit];
  }
  if (unit === "%") {
    return m / 100 * size;
  }
  return m * size;
}
function percent(m) {
  return (100 * m).toFixed(1).replace(/\.?0+$/, "") + "%";
}
function em(m) {
  if (Math.abs(m) < 1e-3) return "0";
  return m.toFixed(3).replace(/\.?0+$/, "") + "em";
}
function px(m, M = -BIGDIMEN, em2 = 16) {
  m *= em2;
  if (M && m < M) m = M;
  if (Math.abs(m) < 0.1) return "0";
  return m.toFixed(1).replace(/\.0$/, "") + "px";
}

// node_modules/mathjax-full/ts/input/tex/base/BaseMethods.ts
var BaseMethods = {};
var P_HEIGHT = 1.2 / 0.85;
var MmlTokenAllow = {
  fontfamily: 1,
  fontsize: 1,
  fontweight: 1,
  fontstyle: 1,
  color: 1,
  background: 1,
  id: 1,
  "class": 1,
  href: 1,
  style: 1
};
BaseMethods.Open = function(parser, _c) {
  parser.Push(parser.itemFactory.create("open"));
};
BaseMethods.Close = function(parser, _c) {
  parser.Push(parser.itemFactory.create("close"));
};
BaseMethods.Tilde = function(parser, _c) {
  parser.Push(parser.create("token", "mtext", {}, entities.nbsp));
};
BaseMethods.Space = function(_parser, _c) {
};
BaseMethods.Superscript = function(parser, _c) {
  if (parser.GetNext().match(/\d/)) {
    parser.string = parser.string.substr(0, parser.i + 1) + " " + parser.string.substr(parser.i + 1);
  }
  let primes;
  let base;
  const top = parser.stack.Top();
  if (top.isKind("prime")) {
    [base, primes] = top.Peek(2);
    parser.stack.Pop();
  } else {
    base = parser.stack.Prev();
    if (!base) {
      base = parser.create("token", "mi", {}, "");
    }
  }
  const movesupsub = NodeUtil_default.getProperty(base, "movesupsub");
  let position = NodeUtil_default.isType(base, "msubsup") ? base.sup : base.over;
  if (NodeUtil_default.isType(base, "msubsup") && !NodeUtil_default.isType(base, "msup") && NodeUtil_default.getChildAt(base, base.sup) || NodeUtil_default.isType(base, "munderover") && !NodeUtil_default.isType(base, "mover") && NodeUtil_default.getChildAt(base, base.over) && !NodeUtil_default.getProperty(base, "subsupOK")) {
    throw new TexError("DoubleExponent", "Double exponent: use braces to clarify");
  }
  if (!NodeUtil_default.isType(base, "msubsup") || NodeUtil_default.isType(base, "msup")) {
    if (movesupsub) {
      if (!NodeUtil_default.isType(base, "munderover") || NodeUtil_default.isType(base, "mover") || NodeUtil_default.getChildAt(base, base.over)) {
        base = parser.create("node", "munderover", [base], { movesupsub: true });
      }
      position = base.over;
    } else {
      base = parser.create("node", "msubsup", [base]);
      position = base.sup;
    }
  }
  parser.Push(
    parser.itemFactory.create("subsup", base).setProperties({
      position,
      primes,
      movesupsub
    })
  );
};
BaseMethods.Subscript = function(parser, _c) {
  if (parser.GetNext().match(/\d/)) {
    parser.string = parser.string.substr(0, parser.i + 1) + " " + parser.string.substr(parser.i + 1);
  }
  let primes, base;
  const top = parser.stack.Top();
  if (top.isKind("prime")) {
    [base, primes] = top.Peek(2);
    parser.stack.Pop();
  } else {
    base = parser.stack.Prev();
    if (!base) {
      base = parser.create("token", "mi", {}, "");
    }
  }
  const movesupsub = NodeUtil_default.getProperty(base, "movesupsub");
  let position = NodeUtil_default.isType(base, "msubsup") ? base.sub : base.under;
  if (NodeUtil_default.isType(base, "msubsup") && !NodeUtil_default.isType(base, "msup") && NodeUtil_default.getChildAt(base, base.sub) || NodeUtil_default.isType(base, "munderover") && !NodeUtil_default.isType(base, "mover") && NodeUtil_default.getChildAt(base, base.under) && !NodeUtil_default.getProperty(base, "subsupOK")) {
    throw new TexError("DoubleSubscripts", "Double subscripts: use braces to clarify");
  }
  if (!NodeUtil_default.isType(base, "msubsup") || NodeUtil_default.isType(base, "msup")) {
    if (movesupsub) {
      if (!NodeUtil_default.isType(base, "munderover") || NodeUtil_default.isType(base, "mover") || NodeUtil_default.getChildAt(base, base.under)) {
        base = parser.create("node", "munderover", [base], { movesupsub: true });
      }
      position = base.under;
    } else {
      base = parser.create("node", "msubsup", [base]);
      position = base.sub;
    }
  }
  parser.Push(
    parser.itemFactory.create("subsup", base).setProperties({
      position,
      primes,
      movesupsub
    })
  );
};
BaseMethods.Prime = function(parser, c) {
  let base = parser.stack.Prev();
  if (!base) {
    base = parser.create("node", "mi");
  }
  if (NodeUtil_default.isType(base, "msubsup") && !NodeUtil_default.isType(base, "msup") && NodeUtil_default.getChildAt(base, base.sup)) {
    throw new TexError(
      "DoubleExponentPrime",
      "Prime causes double exponent: use braces to clarify"
    );
  }
  let sup = "";
  parser.i--;
  do {
    sup += entities.prime;
    parser.i++, c = parser.GetNext();
  } while (c === "'" || c === entities.rsquo);
  sup = ["", "′", "″", "‴", "⁗"][sup.length] || sup;
  const node = parser.create("token", "mo", { variantForm: true }, sup);
  parser.Push(
    parser.itemFactory.create("prime", base, node)
  );
};
BaseMethods.Comment = function(parser, _c) {
  while (parser.i < parser.string.length && parser.string.charAt(parser.i) !== "\n") {
    parser.i++;
  }
};
BaseMethods.Hash = function(_parser, _c) {
  throw new TexError(
    "CantUseHash1",
    "You can't use 'macro parameter character #' in math mode"
  );
};
BaseMethods.MathFont = function(parser, name, variant) {
  const text = parser.GetArgument(name);
  let mml = new TexParser(text, {
    ...parser.stack.env,
    font: variant,
    multiLetterIdentifiers: /^[a-zA-Z]+/,
    noAutoOP: true
  }, parser.configuration).mml();
  parser.Push(parser.create("node", "TeXAtom", [mml]));
};
BaseMethods.SetFont = function(parser, _name, font) {
  parser.stack.env["font"] = font;
};
BaseMethods.SetStyle = function(parser, _name, texStyle, style, level) {
  parser.stack.env["style"] = texStyle;
  parser.stack.env["level"] = level;
  parser.Push(
    parser.itemFactory.create("style").setProperty(
      "styles",
      { displaystyle: style, scriptlevel: level }
    )
  );
};
BaseMethods.SetSize = function(parser, _name, size) {
  parser.stack.env["size"] = size;
  parser.Push(
    parser.itemFactory.create("style").setProperty("styles", { mathsize: em(size) })
  );
};
BaseMethods.Spacer = function(parser, _name, space) {
  const node = parser.create("node", "mspace", [], { width: em(space) });
  const style = parser.create("node", "mstyle", [node], { scriptlevel: 0 });
  parser.Push(style);
};
BaseMethods.LeftRight = function(parser, name) {
  const first = name.substr(1);
  parser.Push(parser.itemFactory.create(first, parser.GetDelimiter(name), parser.stack.env.color));
};
BaseMethods.NamedFn = function(parser, name, id) {
  if (!id) {
    id = name.substr(1);
  }
  const mml = parser.create("token", "mi", { texClass: TEXCLASS.OP }, id);
  parser.Push(parser.itemFactory.create("fn", mml));
};
BaseMethods.NamedOp = function(parser, name, id) {
  if (!id) {
    id = name.substr(1);
  }
  id = id.replace(/&thinsp;/, " ");
  const mml = parser.create("token", "mo", {
    movablelimits: true,
    movesupsub: true,
    form: TexConstant.Form.PREFIX,
    texClass: TEXCLASS.OP
  }, id);
  parser.Push(mml);
};
BaseMethods.Limits = function(parser, _name, limits) {
  let op = parser.stack.Prev(true);
  if (!op || NodeUtil_default.getTexClass(NodeUtil_default.getCoreMO(op)) !== TEXCLASS.OP && NodeUtil_default.getProperty(op, "movesupsub") == null) {
    throw new TexError("MisplacedLimits", "%1 is allowed only on operators", parser.currentCS);
  }
  const top = parser.stack.Top();
  let node;
  if (NodeUtil_default.isType(op, "munderover") && !limits) {
    node = parser.create("node", "msubsup");
    NodeUtil_default.copyChildren(op, node);
    op = top.Last = node;
  } else if (NodeUtil_default.isType(op, "msubsup") && limits) {
    node = parser.create("node", "munderover");
    NodeUtil_default.copyChildren(op, node);
    op = top.Last = node;
  }
  NodeUtil_default.setProperty(op, "movesupsub", limits ? true : false);
  NodeUtil_default.setProperties(NodeUtil_default.getCoreMO(op), { "movablelimits": false });
  if (NodeUtil_default.getAttribute(op, "movablelimits") || NodeUtil_default.getProperty(op, "movablelimits")) {
    NodeUtil_default.setProperties(op, { "movablelimits": false });
  }
};
BaseMethods.Over = function(parser, name, open, close) {
  const mml = parser.itemFactory.create("over").setProperty("name", parser.currentCS);
  if (open || close) {
    mml.setProperty("open", open);
    mml.setProperty("close", close);
  } else if (name.match(/withdelims$/)) {
    mml.setProperty("open", parser.GetDelimiter(name));
    mml.setProperty("close", parser.GetDelimiter(name));
  }
  if (name.match(/^\\above/)) {
    mml.setProperty("thickness", parser.GetDimen(name));
  } else if (name.match(/^\\atop/) || open || close) {
    mml.setProperty("thickness", 0);
  }
  parser.Push(mml);
};
BaseMethods.Frac = function(parser, name) {
  const num = parser.ParseArg(name);
  const den = parser.ParseArg(name);
  const node = parser.create("node", "mfrac", [num, den]);
  parser.Push(node);
};
BaseMethods.Sqrt = function(parser, name) {
  const n = parser.GetBrackets(name);
  let arg = parser.GetArgument(name);
  if (arg === "\\frac") {
    arg += "{" + parser.GetArgument(arg) + "}{" + parser.GetArgument(arg) + "}";
  }
  let mml = new TexParser(arg, parser.stack.env, parser.configuration).mml();
  if (!n) {
    mml = parser.create("node", "msqrt", [mml]);
  } else {
    mml = parser.create("node", "mroot", [mml, parseRoot(parser, n)]);
  }
  parser.Push(mml);
};
function parseRoot(parser, n) {
  const env = parser.stack.env;
  const inRoot = env["inRoot"];
  env["inRoot"] = true;
  const newParser = new TexParser(n, env, parser.configuration);
  let node = newParser.mml();
  const global = newParser.stack.global;
  if (global["leftRoot"] || global["upRoot"]) {
    const def = {};
    if (global["leftRoot"]) {
      def["width"] = global["leftRoot"];
    }
    if (global["upRoot"]) {
      def["voffset"] = global["upRoot"];
      def["height"] = global["upRoot"];
    }
    node = parser.create("node", "mpadded", [node], def);
  }
  env["inRoot"] = inRoot;
  return node;
}
BaseMethods.Root = function(parser, name) {
  const n = parser.GetUpTo(name, "\\of");
  const arg = parser.ParseArg(name);
  const node = parser.create("node", "mroot", [arg, parseRoot(parser, n)]);
  parser.Push(node);
};
BaseMethods.MoveRoot = function(parser, name, id) {
  if (!parser.stack.env["inRoot"]) {
    throw new TexError("MisplacedMoveRoot", "%1 can appear only within a root", parser.currentCS);
  }
  if (parser.stack.global[id]) {
    throw new TexError("MultipleMoveRoot", "Multiple use of %1", parser.currentCS);
  }
  let n = parser.GetArgument(name);
  if (!n.match(/-?[0-9]+/)) {
    throw new TexError("IntegerArg", "The argument to %1 must be an integer", parser.currentCS);
  }
  n = parseInt(n, 10) / 15 + "em";
  if (n.substr(0, 1) !== "-") {
    n = "+" + n;
  }
  parser.stack.global[id] = n;
};
BaseMethods.Accent = function(parser, name, accent, stretchy) {
  const c = parser.ParseArg(name);
  const def = { ...ParseUtil_default.getFontDef(parser), accent: true, mathaccent: true };
  const entity = NodeUtil_default.createEntity(accent);
  const moNode = parser.create("token", "mo", def, entity);
  const mml = moNode;
  NodeUtil_default.setAttribute(mml, "stretchy", stretchy ? true : false);
  const mo = NodeUtil_default.isEmbellished(c) ? NodeUtil_default.getCoreMO(c) : c;
  if (NodeUtil_default.isType(mo, "mo") || NodeUtil_default.getProperty(mo, "movablelimits")) {
    NodeUtil_default.setProperties(mo, { "movablelimits": false });
  }
  const muoNode = parser.create("node", "munderover");
  NodeUtil_default.setChild(muoNode, 0, c);
  NodeUtil_default.setChild(muoNode, 1, null);
  NodeUtil_default.setChild(muoNode, 2, mml);
  let texAtom = parser.create("node", "TeXAtom", [muoNode]);
  parser.Push(texAtom);
};
BaseMethods.UnderOver = function(parser, name, c, stack) {
  const entity = NodeUtil_default.createEntity(c);
  const mo = parser.create("token", "mo", { stretchy: true, accent: true }, entity);
  const pos = name.charAt(1) === "o" ? "over" : "under";
  const base = parser.ParseArg(name);
  parser.Push(ParseUtil_default.underOver(parser, base, mo, pos, stack));
};
BaseMethods.Overset = function(parser, name) {
  const top = parser.ParseArg(name);
  const base = parser.ParseArg(name);
  ParseUtil_default.checkMovableLimits(base);
  if (top.isKind("mo")) {
    NodeUtil_default.setAttribute(top, "accent", false);
  }
  const node = parser.create("node", "mover", [base, top]);
  parser.Push(node);
};
BaseMethods.Underset = function(parser, name) {
  const bot = parser.ParseArg(name);
  const base = parser.ParseArg(name);
  ParseUtil_default.checkMovableLimits(base);
  if (bot.isKind("mo")) {
    NodeUtil_default.setAttribute(bot, "accent", false);
  }
  const node = parser.create("node", "munder", [base, bot], { accentunder: false });
  parser.Push(node);
};
BaseMethods.Overunderset = function(parser, name) {
  const top = parser.ParseArg(name);
  const bot = parser.ParseArg(name);
  const base = parser.ParseArg(name);
  ParseUtil_default.checkMovableLimits(base);
  if (top.isKind("mo")) {
    NodeUtil_default.setAttribute(top, "accent", false);
  }
  if (bot.isKind("mo")) {
    NodeUtil_default.setAttribute(bot, "accent", false);
  }
  const node = parser.create("node", "munderover", [base, bot, top], { accent: false, accentunder: false });
  parser.Push(node);
};
BaseMethods.TeXAtom = function(parser, name, mclass) {
  let def = { texClass: mclass };
  let mml;
  let node;
  let parsed;
  if (mclass === TEXCLASS.OP) {
    def["movesupsub"] = def["movablelimits"] = true;
    const arg = parser.GetArgument(name);
    const match = arg.match(/^\s*\\rm\s+([a-zA-Z0-9 ]+)$/);
    if (match) {
      def["mathvariant"] = TexConstant.Variant.NORMAL;
      node = parser.create("token", "mi", def, match[1]);
    } else {
      parsed = new TexParser(arg, parser.stack.env, parser.configuration).mml();
      node = parser.create("node", "TeXAtom", [parsed], def);
    }
    mml = parser.itemFactory.create("fn", node);
  } else {
    parsed = parser.ParseArg(name);
    mml = parser.create("node", "TeXAtom", [parsed], def);
  }
  parser.Push(mml);
};
BaseMethods.MmlToken = function(parser, name) {
  const kind = parser.GetArgument(name);
  let attr = parser.GetBrackets(name, "").replace(/^\s+/, "");
  const text = parser.GetArgument(name);
  const def = {};
  const keep = [];
  let node;
  try {
    node = parser.create("node", kind);
  } catch (e) {
    node = null;
  }
  if (!node || !node.isToken) {
    throw new TexError("NotMathMLToken", "%1 is not a token element", kind);
  }
  while (attr !== "") {
    const match = attr.match(/^([a-z]+)\s*=\s*('[^']*'|"[^"]*"|[^ ,]*)\s*,?\s*/i);
    if (!match) {
      throw new TexError("InvalidMathMLAttr", "Invalid MathML attribute: %1", attr);
    }
    if (!node.attributes.hasDefault(match[1]) && !MmlTokenAllow[match[1]]) {
      throw new TexError(
        "UnknownAttrForElement",
        "%1 is not a recognized attribute for %2",
        match[1],
        kind
      );
    }
    let value = ParseUtil_default.MmlFilterAttribute(
      parser,
      match[1],
      match[2].replace(/^(['"])(.*)\1$/, "$2")
    );
    if (value) {
      if (value.toLowerCase() === "true") {
        value = true;
      } else if (value.toLowerCase() === "false") {
        value = false;
      }
      def[match[1]] = value;
      keep.push(match[1]);
    }
    attr = attr.substr(match[0].length);
  }
  if (keep.length) {
    def["mjx-keep-attrs"] = keep.join(" ");
  }
  const textNode = parser.create("text", text);
  node.appendChild(textNode);
  NodeUtil_default.setProperties(node, def);
  parser.Push(node);
};
BaseMethods.Strut = function(parser, _name) {
  const row = parser.create("node", "mrow");
  const padded = parser.create(
    "node",
    "mpadded",
    [row],
    { height: "8.6pt", depth: "3pt", width: 0 }
  );
  parser.Push(padded);
};
BaseMethods.Phantom = function(parser, name, v, h) {
  let box = parser.create("node", "mphantom", [parser.ParseArg(name)]);
  if (v || h) {
    box = parser.create("node", "mpadded", [box]);
    if (h) {
      NodeUtil_default.setAttribute(box, "height", 0);
      NodeUtil_default.setAttribute(box, "depth", 0);
    }
    if (v) {
      NodeUtil_default.setAttribute(box, "width", 0);
    }
  }
  const atom = parser.create("node", "TeXAtom", [box]);
  parser.Push(atom);
};
BaseMethods.Smash = function(parser, name) {
  const bt = ParseUtil_default.trimSpaces(parser.GetBrackets(name, ""));
  const smash = parser.create("node", "mpadded", [parser.ParseArg(name)]);
  switch (bt) {
    case "b":
      NodeUtil_default.setAttribute(smash, "depth", 0);
      break;
    case "t":
      NodeUtil_default.setAttribute(smash, "height", 0);
      break;
    default:
      NodeUtil_default.setAttribute(smash, "height", 0);
      NodeUtil_default.setAttribute(smash, "depth", 0);
  }
  const atom = parser.create("node", "TeXAtom", [smash]);
  parser.Push(atom);
};
BaseMethods.Lap = function(parser, name) {
  const mml = parser.create("node", "mpadded", [parser.ParseArg(name)], { width: 0 });
  if (name === "\\llap") {
    NodeUtil_default.setAttribute(mml, "lspace", "-1width");
  }
  const atom = parser.create("node", "TeXAtom", [mml]);
  parser.Push(atom);
};
BaseMethods.RaiseLower = function(parser, name) {
  let h = parser.GetDimen(name);
  let item = parser.itemFactory.create("position").setProperties({ name: parser.currentCS, move: "vertical" });
  if (h.charAt(0) === "-") {
    h = h.slice(1);
    name = name.substr(1) === "raise" ? "\\lower" : "\\raise";
  }
  if (name === "\\lower") {
    item.setProperty("dh", "-" + h);
    item.setProperty("dd", "+" + h);
  } else {
    item.setProperty("dh", "+" + h);
    item.setProperty("dd", "-" + h);
  }
  parser.Push(item);
};
BaseMethods.MoveLeftRight = function(parser, name) {
  let h = parser.GetDimen(name);
  let nh = h.charAt(0) === "-" ? h.slice(1) : "-" + h;
  if (name === "\\moveleft") {
    let tmp = h;
    h = nh;
    nh = tmp;
  }
  parser.Push(
    parser.itemFactory.create("position").setProperties({
      name: parser.currentCS,
      move: "horizontal",
      left: parser.create("node", "mspace", [], { width: h }),
      right: parser.create("node", "mspace", [], { width: nh })
    })
  );
};
BaseMethods.Hskip = function(parser, name) {
  const node = parser.create(
    "node",
    "mspace",
    [],
    { width: parser.GetDimen(name) }
  );
  parser.Push(node);
};
BaseMethods.Nonscript = function(parser, _name) {
  parser.Push(parser.itemFactory.create("nonscript"));
};
BaseMethods.Rule = function(parser, name, style) {
  const w = parser.GetDimen(name), h = parser.GetDimen(name), d = parser.GetDimen(name);
  let def = { width: w, height: h, depth: d };
  if (style !== "blank") {
    def["mathbackground"] = parser.stack.env["color"] || "black";
  }
  const node = parser.create("node", "mspace", [], def);
  parser.Push(node);
};
BaseMethods.rule = function(parser, name) {
  const v = parser.GetBrackets(name), w = parser.GetDimen(name), h = parser.GetDimen(name);
  let mml = parser.create("node", "mspace", [], {
    width: w,
    height: h,
    mathbackground: parser.stack.env["color"] || "black"
  });
  if (v) {
    mml = parser.create("node", "mpadded", [mml], { voffset: v });
    if (v.match(/^\-/)) {
      NodeUtil_default.setAttribute(mml, "height", v);
      NodeUtil_default.setAttribute(mml, "depth", "+" + v.substr(1));
    } else {
      NodeUtil_default.setAttribute(mml, "height", "+" + v);
    }
  }
  parser.Push(mml);
};
BaseMethods.MakeBig = function(parser, name, mclass, size) {
  size *= P_HEIGHT;
  let sizeStr = String(size).replace(/(\.\d\d\d).+/, "$1") + "em";
  const delim = parser.GetDelimiter(name, true);
  const mo = parser.create("token", "mo", {
    minsize: sizeStr,
    maxsize: sizeStr,
    fence: true,
    stretchy: true,
    symmetric: true
  }, delim);
  const node = parser.create("node", "TeXAtom", [mo], { texClass: mclass });
  parser.Push(node);
};
BaseMethods.BuildRel = function(parser, name) {
  const top = parser.ParseUpTo(name, "\\over");
  const bot = parser.ParseArg(name);
  const node = parser.create("node", "munderover");
  NodeUtil_default.setChild(node, 0, bot);
  NodeUtil_default.setChild(node, 1, null);
  NodeUtil_default.setChild(node, 2, top);
  const atom = parser.create("node", "TeXAtom", [node], { texClass: TEXCLASS.REL });
  parser.Push(atom);
};
BaseMethods.HBox = function(parser, name, style, font) {
  parser.PushAll(ParseUtil_default.internalMath(parser, parser.GetArgument(name), style, font));
};
BaseMethods.FBox = function(parser, name) {
  const internal = ParseUtil_default.internalMath(parser, parser.GetArgument(name));
  const node = parser.create("node", "menclose", internal, { notation: "box" });
  parser.Push(node);
};
BaseMethods.FrameBox = function(parser, name) {
  const width = parser.GetBrackets(name);
  const pos = parser.GetBrackets(name) || "c";
  let mml = ParseUtil_default.internalMath(parser, parser.GetArgument(name));
  if (width) {
    mml = [parser.create("node", "mpadded", mml, {
      width,
      "data-align": lookup(pos, { l: "left", r: "right" }, "center")
    })];
  }
  const node = parser.create(
    "node",
    "TeXAtom",
    [parser.create("node", "menclose", mml, { notation: "box" })],
    { texClass: TEXCLASS.ORD }
  );
  parser.Push(node);
};
BaseMethods.Not = function(parser, _name) {
  parser.Push(parser.itemFactory.create("not"));
};
BaseMethods.Dots = function(parser, _name) {
  const ldotsEntity = NodeUtil_default.createEntity("2026");
  const cdotsEntity = NodeUtil_default.createEntity("22EF");
  const ldots = parser.create("token", "mo", { stretchy: false }, ldotsEntity);
  const cdots = parser.create("token", "mo", { stretchy: false }, cdotsEntity);
  parser.Push(
    parser.itemFactory.create("dots").setProperties({
      ldots,
      cdots
    })
  );
};
BaseMethods.Matrix = function(parser, _name, open, close, align, spacing, vspacing, style, cases, numbered) {
  const c = parser.GetNext();
  if (c === "") {
    throw new TexError("MissingArgFor", "Missing argument for %1", parser.currentCS);
  }
  if (c === "{") {
    parser.i++;
  } else {
    parser.string = c + "}" + parser.string.slice(parser.i + 1);
    parser.i = 0;
  }
  const array = parser.itemFactory.create("array").setProperty("requireClose", true);
  array.arraydef = {
    rowspacing: vspacing || "4pt",
    columnspacing: spacing || "1em"
  };
  if (cases) {
    array.setProperty("isCases", true);
  }
  if (numbered) {
    array.setProperty("isNumbered", true);
    array.arraydef.side = numbered;
  }
  if (open || close) {
    array.setProperty("open", open);
    array.setProperty("close", close);
  }
  if (style === "D") {
    array.arraydef.displaystyle = true;
  }
  if (align != null) {
    array.arraydef.columnalign = align;
  }
  parser.Push(array);
};
BaseMethods.Entry = function(parser, name) {
  parser.Push(parser.itemFactory.create("cell").setProperties({ isEntry: true, name }));
  const top = parser.stack.Top();
  const env = top.getProperty("casesEnv");
  const cases = top.getProperty("isCases");
  if (!cases && !env) return;
  const str = parser.string;
  let braces = 0, close = -1, i = parser.i, m = str.length;
  const end = env ? new RegExp(`^\\\\end\\s*\\{${env.replace(/\*/, "\\*")}\\}`) : null;
  while (i < m) {
    const c = str.charAt(i);
    if (c === "{") {
      braces++;
      i++;
    } else if (c === "}") {
      if (braces === 0) {
        m = 0;
      } else {
        braces--;
        if (braces === 0 && close < 0) {
          close = i - parser.i;
        }
        i++;
      }
    } else if (c === "&" && braces === 0) {
      throw new TexError("ExtraAlignTab", "Extra alignment tab in \\cases text");
    } else if (c === "\\") {
      const rest = str.substr(i);
      if (rest.match(/^((\\cr)[^a-zA-Z]|\\\\)/) || end && rest.match(end)) {
        m = 0;
      } else {
        i += 2;
      }
    } else {
      i++;
    }
  }
  const text = str.substr(parser.i, i - parser.i);
  if (!text.match(/^\s*\\text[^a-zA-Z]/) || close !== text.replace(/\s+$/, "").length - 1) {
    const internal = ParseUtil_default.internalMath(parser, ParseUtil_default.trimSpaces(text), 0);
    parser.PushAll(internal);
    parser.i = i;
  }
};
BaseMethods.Cr = function(parser, name) {
  parser.Push(
    parser.itemFactory.create("cell").setProperties({ isCR: true, name })
  );
};
BaseMethods.CrLaTeX = function(parser, name, nobrackets = false) {
  let n;
  if (!nobrackets) {
    if (parser.string.charAt(parser.i) === "*") {
      parser.i++;
    }
    if (parser.string.charAt(parser.i) === "[") {
      let dim = parser.GetBrackets(name, "");
      let [value, unit] = ParseUtil_default.matchDimen(dim);
      if (dim && !value) {
        throw new TexError(
          "BracketMustBeDimension",
          "Bracket argument to %1 must be a dimension",
          parser.currentCS
        );
      }
      n = value + unit;
    }
  }
  parser.Push(
    parser.itemFactory.create("cell").setProperties({ isCR: true, name, linebreak: true })
  );
  const top = parser.stack.Top();
  let node;
  if (top instanceof ArrayItem) {
    if (n) {
      top.addRowSpacing(n);
    }
  } else {
    if (n) {
      node = parser.create("node", "mspace", [], { depth: n });
      parser.Push(node);
    }
    node = parser.create("node", "mspace", [], { linebreak: TexConstant.LineBreak.NEWLINE });
    parser.Push(node);
  }
};
BaseMethods.HLine = function(parser, _name, style) {
  if (style == null) {
    style = "solid";
  }
  const top = parser.stack.Top();
  if (!(top instanceof ArrayItem) || top.Size()) {
    throw new TexError("Misplaced", "Misplaced %1", parser.currentCS);
  }
  if (!top.table.length) {
    top.frame.push("top");
  } else {
    const lines = top.arraydef["rowlines"] ? top.arraydef["rowlines"].split(/ /) : [];
    while (lines.length < top.table.length) {
      lines.push("none");
    }
    lines[top.table.length - 1] = style;
    top.arraydef["rowlines"] = lines.join(" ");
  }
};
BaseMethods.HFill = function(parser, _name) {
  const top = parser.stack.Top();
  if (top instanceof ArrayItem) {
    top.hfill.push(top.Size());
  } else {
    throw new TexError("UnsupportedHFill", "Unsupported use of %1", parser.currentCS);
  }
};
BaseMethods.BeginEnd = function(parser, name) {
  let env = parser.GetArgument(name);
  if (env.match(/\\/i)) {
    throw new TexError("InvalidEnv", "Invalid environment name '%1'", env);
  }
  let macro = parser.configuration.handlers.get("environment").lookup(env);
  if (macro && name === "\\end") {
    if (!macro.args[0]) {
      const mml = parser.itemFactory.create("end").setProperty("name", env);
      parser.Push(mml);
      return;
    }
    parser.stack.env["closing"] = env;
  }
  ParseUtil_default.checkMaxMacros(parser, false);
  parser.parse("environment", [parser, env]);
};
BaseMethods.Array = function(parser, begin, open, close, align, spacing, vspacing, style, raggedHeight) {
  if (!align) {
    align = parser.GetArgument("\\begin{" + begin.getName() + "}");
  }
  let lines = ("c" + align).replace(/[^clr|:]/g, "").replace(/[^|:]([|:])+/g, "$1");
  align = align.replace(/[^clr]/g, "").split("").join(" ");
  align = align.replace(/l/g, "left").replace(/r/g, "right").replace(/c/g, "center");
  const array = parser.itemFactory.create("array");
  array.arraydef = {
    columnalign: align,
    columnspacing: spacing || "1em",
    rowspacing: vspacing || "4pt"
  };
  if (lines.match(/[|:]/)) {
    if (lines.charAt(0).match(/[|:]/)) {
      array.frame.push("left");
      array.dashed = lines.charAt(0) === ":";
    }
    if (lines.charAt(lines.length - 1).match(/[|:]/)) {
      array.frame.push("right");
    }
    lines = lines.substr(1, lines.length - 2);
    array.arraydef.columnlines = lines.split("").join(" ").replace(/[^|: ]/g, "none").replace(/\|/g, "solid").replace(/:/g, "dashed");
  }
  if (open) {
    array.setProperty("open", parser.convertDelimiter(open));
  }
  if (close) {
    array.setProperty("close", parser.convertDelimiter(close));
  }
  if ((style || "").charAt(1) === "'") {
    array.arraydef["data-cramped"] = true;
    style = style.charAt(0);
  }
  if (style === "D") {
    array.arraydef["displaystyle"] = true;
  } else if (style) {
    array.arraydef["displaystyle"] = false;
  }
  if (style === "S") {
    array.arraydef["scriptlevel"] = 1;
  }
  if (raggedHeight) {
    array.arraydef["useHeight"] = false;
  }
  parser.Push(begin);
  return array;
};
BaseMethods.AlignedArray = function(parser, begin) {
  const align = parser.GetBrackets("\\begin{" + begin.getName() + "}");
  let item = BaseMethods.Array(parser, begin);
  return ParseUtil_default.setArrayAlign(item, align);
};
BaseMethods.Equation = function(parser, begin, numbered) {
  parser.Push(begin);
  ParseUtil_default.checkEqnEnv(parser);
  return parser.itemFactory.create("equation", numbered).setProperty("name", begin.getName());
};
BaseMethods.EqnArray = function(parser, begin, numbered, taggable, align, spacing) {
  parser.Push(begin);
  if (taggable) {
    ParseUtil_default.checkEqnEnv(parser);
  }
  align = align.replace(/[^clr]/g, "").split("").join(" ");
  align = align.replace(/l/g, "left").replace(/r/g, "right").replace(/c/g, "center");
  let newItem = parser.itemFactory.create(
    "eqnarray",
    begin.getName(),
    numbered,
    taggable,
    parser.stack.global
  );
  newItem.arraydef = {
    displaystyle: true,
    columnalign: align,
    columnspacing: spacing || "1em",
    rowspacing: "3pt",
    side: parser.options["tagSide"],
    minlabelspacing: parser.options["tagIndent"]
  };
  return newItem;
};
BaseMethods.HandleNoTag = function(parser, _name) {
  parser.tags.notag();
};
BaseMethods.HandleLabel = function(parser, name) {
  let label = parser.GetArgument(name);
  if (label === "") {
    return;
  }
  if (!parser.tags.refUpdate) {
    if (parser.tags.label) {
      throw new TexError("MultipleCommand", "Multiple %1", parser.currentCS);
    }
    parser.tags.label = label;
    if ((parser.tags.allLabels[label] || parser.tags.labels[label]) && !parser.options["ignoreDuplicateLabels"]) {
      throw new TexError("MultipleLabel", "Label '%1' multiply defined", label);
    }
    parser.tags.labels[label] = new Label();
  }
};
BaseMethods.HandleRef = function(parser, name, eqref) {
  let label = parser.GetArgument(name);
  let ref = parser.tags.allLabels[label] || parser.tags.labels[label];
  if (!ref) {
    if (!parser.tags.refUpdate) {
      parser.tags.redo = true;
    }
    ref = new Label();
  }
  let tag = ref.tag;
  if (eqref) {
    tag = parser.tags.formatTag(tag);
  }
  let node = parser.create("node", "mrow", ParseUtil_default.internalMath(parser, tag), {
    href: parser.tags.formatUrl(ref.id, parser.options.baseURL),
    "class": "MathJax_ref"
  });
  parser.Push(node);
};
BaseMethods.Macro = function(parser, name, macro, argcount, def) {
  if (argcount) {
    const args = [];
    if (def != null) {
      const optional = parser.GetBrackets(name);
      args.push(optional == null ? def : optional);
    }
    for (let i = args.length; i < argcount; i++) {
      args.push(parser.GetArgument(name));
    }
    macro = ParseUtil_default.substituteArgs(parser, args, macro);
  }
  parser.string = ParseUtil_default.addArgs(parser, macro, parser.string.slice(parser.i));
  parser.i = 0;
  ParseUtil_default.checkMaxMacros(parser);
};
BaseMethods.MathChoice = function(parser, name) {
  const D = parser.ParseArg(name);
  const T = parser.ParseArg(name);
  const S = parser.ParseArg(name);
  const SS = parser.ParseArg(name);
  parser.Push(parser.create("node", "MathChoice", [D, T, S, SS]));
};
var BaseMethods_default = BaseMethods;

// node_modules/mathjax-full/ts/input/tex/ams/AmsMethods.ts
var AmsMethods = {};
AmsMethods.AmsEqnArray = function(parser, begin, numbered, taggable, align, spacing, style) {
  const args = parser.GetBrackets("\\begin{" + begin.getName() + "}");
  const array = BaseMethods_default.EqnArray(parser, begin, numbered, taggable, align, spacing, style);
  return ParseUtil_default.setArrayAlign(array, args);
};
AmsMethods.AlignAt = function(parser, begin, numbered, taggable) {
  const name = begin.getName();
  let n, valign, align = "", spacing = [];
  if (!taggable) {
    valign = parser.GetBrackets("\\begin{" + name + "}");
  }
  n = parser.GetArgument("\\begin{" + name + "}");
  if (n.match(/[^0-9]/)) {
    throw new TexError(
      "PositiveIntegerArg",
      "Argument to %1 must me a positive integer",
      "\\begin{" + name + "}"
    );
  }
  let count = parseInt(n, 10);
  while (count > 0) {
    align += "rl";
    spacing.push("0em 0em");
    count--;
  }
  let spaceStr = spacing.join(" ");
  if (taggable) {
    return AmsMethods.EqnArray(parser, begin, numbered, taggable, align, spaceStr);
  }
  let array = AmsMethods.EqnArray(parser, begin, numbered, taggable, align, spaceStr);
  return ParseUtil_default.setArrayAlign(array, valign);
};
AmsMethods.Multline = function(parser, begin, numbered) {
  parser.Push(begin);
  ParseUtil_default.checkEqnEnv(parser);
  const item = parser.itemFactory.create("multline", numbered, parser.stack);
  item.arraydef = {
    displaystyle: true,
    rowspacing: ".5em",
    columnspacing: "100%",
    width: parser.options.ams["multlineWidth"],
    side: parser.options["tagSide"],
    minlabelspacing: parser.options["tagIndent"],
    framespacing: parser.options.ams["multlineIndent"] + " 0",
    frame: "",
    // Use frame spacing with no actual frame
    "data-width-includes-label": true
    // take label space out of 100% width
  };
  return item;
};
AmsMethods.XalignAt = function(parser, begin, numbered, padded) {
  let n = parser.GetArgument("\\begin{" + begin.getName() + "}");
  if (n.match(/[^0-9]/)) {
    throw new TexError(
      "PositiveIntegerArg",
      "Argument to %1 must me a positive integer",
      "\\begin{" + begin.getName() + "}"
    );
  }
  const align = padded ? "crl" : "rlc";
  const width = padded ? "fit auto auto" : "auto auto fit";
  const item = AmsMethods.FlalignArray(parser, begin, numbered, padded, false, align, width, true);
  item.setProperty("xalignat", 2 * parseInt(n));
  return item;
};
AmsMethods.FlalignArray = function(parser, begin, numbered, padded, center, align, width, zeroWidthLabel = false) {
  parser.Push(begin);
  ParseUtil_default.checkEqnEnv(parser);
  align = align.split("").join(" ").replace(/r/g, "right").replace(/l/g, "left").replace(/c/g, "center");
  const item = parser.itemFactory.create(
    "flalign",
    begin.getName(),
    numbered,
    padded,
    center,
    parser.stack
  );
  item.arraydef = {
    width: "100%",
    displaystyle: true,
    columnalign: align,
    columnspacing: "0em",
    columnwidth: width,
    rowspacing: "3pt",
    side: parser.options["tagSide"],
    minlabelspacing: zeroWidthLabel ? "0" : parser.options["tagIndent"],
    "data-width-includes-label": true
  };
  item.setProperty("zeroWidthLabel", zeroWidthLabel);
  return item;
};
var NEW_OPS = "ams-declare-ops";
AmsMethods.HandleDeclareOp = function(parser, name) {
  let star = parser.GetStar() ? "*" : "";
  let cs = ParseUtil_default.trimSpaces(parser.GetArgument(name));
  if (cs.charAt(0) === "\\") {
    cs = cs.substr(1);
  }
  let op = parser.GetArgument(name);
  parser.configuration.handlers.retrieve(NEW_OPS).add(cs, new Macro(cs, AmsMethods.Macro, [`\\operatorname${star}{${op}}`]));
};
AmsMethods.HandleOperatorName = function(parser, name) {
  const star = parser.GetStar();
  let op = ParseUtil_default.trimSpaces(parser.GetArgument(name));
  let mml = new TexParser(op, {
    ...parser.stack.env,
    font: TexConstant.Variant.NORMAL,
    multiLetterIdentifiers: /^[-*a-z]+/i,
    operatorLetters: true
  }, parser.configuration).mml();
  if (!mml.isKind("mi")) {
    mml = parser.create("node", "TeXAtom", [mml]);
  }
  NodeUtil_default.setProperties(mml, { movesupsub: star, movablelimits: true, texClass: TEXCLASS.OP });
  if (!star) {
    const c = parser.GetNext(), i = parser.i;
    if (c === "\\" && ++parser.i && parser.GetCS() !== "limits") {
      parser.i = i;
    }
  }
  parser.Push(mml);
};
AmsMethods.SideSet = function(parser, name) {
  const [preScripts, preRest] = splitSideSet(parser.ParseArg(name));
  const [postScripts, postRest] = splitSideSet(parser.ParseArg(name));
  const base = parser.ParseArg(name);
  let mml = base;
  if (preScripts) {
    if (preRest) {
      preScripts.replaceChild(
        parser.create("node", "mphantom", [
          parser.create("node", "mpadded", [ParseUtil_default.copyNode(base, parser)], { width: 0 })
        ]),
        NodeUtil_default.getChildAt(preScripts, 0)
      );
    } else {
      mml = parser.create("node", "mmultiscripts", [base]);
      if (postScripts) {
        NodeUtil_default.appendChildren(mml, [
          NodeUtil_default.getChildAt(postScripts, 1) || parser.create("node", "none"),
          NodeUtil_default.getChildAt(postScripts, 2) || parser.create("node", "none")
        ]);
      }
      NodeUtil_default.setProperty(mml, "scriptalign", "left");
      NodeUtil_default.appendChildren(mml, [
        parser.create("node", "mprescripts"),
        NodeUtil_default.getChildAt(preScripts, 1) || parser.create("node", "none"),
        NodeUtil_default.getChildAt(preScripts, 2) || parser.create("node", "none")
      ]);
    }
  }
  if (postScripts && mml === base) {
    postScripts.replaceChild(base, NodeUtil_default.getChildAt(postScripts, 0));
    mml = postScripts;
  }
  const mrow = parser.create("node", "TeXAtom", [], { texClass: TEXCLASS.OP, movesupsub: true, movablelimits: true });
  if (preRest) {
    preScripts && mrow.appendChild(preScripts);
    mrow.appendChild(preRest);
  }
  mrow.appendChild(mml);
  postRest && mrow.appendChild(postRest);
  parser.Push(mrow);
};
function splitSideSet(mml) {
  if (!mml || mml.isInferred && mml.childNodes.length === 0) return [null, null];
  if (mml.isKind("msubsup") && checkSideSetBase(mml)) return [mml, null];
  const child = NodeUtil_default.getChildAt(mml, 0);
  if (!(mml.isInferred && child && checkSideSetBase(child))) return [null, mml];
  mml.childNodes.splice(0, 1);
  return [child, mml];
}
function checkSideSetBase(mml) {
  const base = mml.childNodes[0];
  return base && base.isKind("mi") && base.getText() === "";
}
AmsMethods.operatorLetter = function(parser, c) {
  return parser.stack.env.operatorLetters ? ParseMethods_default.variable(parser, c) : false;
};
AmsMethods.MultiIntegral = function(parser, name, integral) {
  let next = parser.GetNext();
  if (next === "\\") {
    let i = parser.i;
    next = parser.GetArgument(name);
    parser.i = i;
    if (next === "\\limits") {
      if (name === "\\idotsint") {
        integral = "\\!\\!\\mathop{\\,\\," + integral + "}";
      } else {
        integral = "\\!\\!\\!\\mathop{\\,\\,\\," + integral + "}";
      }
    }
  }
  parser.string = integral + " " + parser.string.slice(parser.i);
  parser.i = 0;
};
AmsMethods.xArrow = function(parser, name, chr, l, r) {
  let def = { width: "+" + ParseUtil_default.Em((l + r) / 18), lspace: ParseUtil_default.Em(l / 18) };
  let bot = parser.GetBrackets(name);
  let first = parser.ParseArg(name);
  let dstrut = parser.create("node", "mspace", [], { depth: ".25em" });
  let arrow = parser.create(
    "token",
    "mo",
    { stretchy: true, texClass: TEXCLASS.REL },
    String.fromCodePoint(chr)
  );
  arrow = parser.create("node", "mstyle", [arrow], { scriptlevel: 0 });
  let mml = parser.create("node", "munderover", [arrow]);
  let mpadded = parser.create("node", "mpadded", [first, dstrut], def);
  NodeUtil_default.setAttribute(mpadded, "voffset", "-.2em");
  NodeUtil_default.setAttribute(mpadded, "height", "-.2em");
  NodeUtil_default.setChild(mml, mml.over, mpadded);
  if (bot) {
    let bottom = new TexParser(bot, parser.stack.env, parser.configuration).mml();
    let bstrut = parser.create("node", "mspace", [], { height: ".75em" });
    mpadded = parser.create("node", "mpadded", [bottom, bstrut], def);
    NodeUtil_default.setAttribute(mpadded, "voffset", ".15em");
    NodeUtil_default.setAttribute(mpadded, "depth", "-.15em");
    NodeUtil_default.setChild(mml, mml.under, mpadded);
  }
  NodeUtil_default.setProperty(mml, "subsupOK", true);
  parser.Push(mml);
};
AmsMethods.HandleShove = function(parser, _name, shove) {
  let top = parser.stack.Top();
  if (top.kind !== "multline") {
    throw new TexError(
      "CommandOnlyAllowedInEnv",
      "%1 only allowed in %2 environment",
      parser.currentCS,
      "multline"
    );
  }
  if (top.Size()) {
    throw new TexError(
      "CommandAtTheBeginingOfLine",
      "%1 must come at the beginning of the line",
      parser.currentCS
    );
  }
  top.setProperty("shove", shove);
};
AmsMethods.CFrac = function(parser, name) {
  let lr = ParseUtil_default.trimSpaces(parser.GetBrackets(name, ""));
  let num = parser.GetArgument(name);
  let den = parser.GetArgument(name);
  let lrMap = {
    l: TexConstant.Align.LEFT,
    r: TexConstant.Align.RIGHT,
    "": ""
  };
  let numNode = new TexParser(
    "\\strut\\textstyle{" + num + "}",
    parser.stack.env,
    parser.configuration
  ).mml();
  let denNode = new TexParser(
    "\\strut\\textstyle{" + den + "}",
    parser.stack.env,
    parser.configuration
  ).mml();
  let frac = parser.create("node", "mfrac", [numNode, denNode]);
  lr = lrMap[lr];
  if (lr == null) {
    throw new TexError("IllegalAlign", "Illegal alignment specified in %1", parser.currentCS);
  }
  if (lr) {
    NodeUtil_default.setProperties(frac, { numalign: lr, denomalign: lr });
  }
  parser.Push(frac);
};
AmsMethods.Genfrac = function(parser, name, left, right, thick, style) {
  if (left == null) {
    left = parser.GetDelimiterArg(name);
  }
  if (right == null) {
    right = parser.GetDelimiterArg(name);
  }
  if (thick == null) {
    thick = parser.GetArgument(name);
  }
  if (style == null) {
    style = ParseUtil_default.trimSpaces(parser.GetArgument(name));
  }
  let num = parser.ParseArg(name);
  let den = parser.ParseArg(name);
  let frac = parser.create("node", "mfrac", [num, den]);
  if (thick !== "") {
    NodeUtil_default.setAttribute(frac, "linethickness", thick);
  }
  if (left || right) {
    NodeUtil_default.setProperty(frac, "withDelims", true);
    frac = ParseUtil_default.fixedFence(parser.configuration, left, frac, right);
  }
  if (style !== "") {
    let styleDigit = parseInt(style, 10);
    let styleAlpha = ["D", "T", "S", "SS"][styleDigit];
    if (styleAlpha == null) {
      throw new TexError("BadMathStyleFor", "Bad math style for %1", parser.currentCS);
    }
    frac = parser.create("node", "mstyle", [frac]);
    if (styleAlpha === "D") {
      NodeUtil_default.setProperties(frac, { displaystyle: true, scriptlevel: 0 });
    } else {
      NodeUtil_default.setProperties(frac, {
        displaystyle: false,
        scriptlevel: styleDigit - 1
      });
    }
  }
  parser.Push(frac);
};
AmsMethods.HandleTag = function(parser, name) {
  if (!parser.tags.currentTag.taggable && parser.tags.env) {
    throw new TexError(
      "CommandNotAllowedInEnv",
      "%1 not allowed in %2 environment",
      parser.currentCS,
      parser.tags.env
    );
  }
  if (parser.tags.currentTag.tag) {
    throw new TexError("MultipleCommand", "Multiple %1", parser.currentCS);
  }
  let star = parser.GetStar();
  let tagId = ParseUtil_default.trimSpaces(parser.GetArgument(name));
  parser.tags.tag(tagId, star);
};
AmsMethods.HandleNoTag = BaseMethods_default.HandleNoTag;
AmsMethods.HandleRef = BaseMethods_default.HandleRef;
AmsMethods.Macro = BaseMethods_default.Macro;
AmsMethods.Accent = BaseMethods_default.Accent;
AmsMethods.Tilde = BaseMethods_default.Tilde;
AmsMethods.Array = BaseMethods_default.Array;
AmsMethods.Spacer = BaseMethods_default.Spacer;
AmsMethods.NamedOp = BaseMethods_default.NamedOp;
AmsMethods.EqnArray = BaseMethods_default.EqnArray;
AmsMethods.Equation = BaseMethods_default.Equation;

// node_modules/mathjax-full/ts/input/tex/SymbolMap.ts
function parseResult(result) {
  return result === void 0 ? true : result;
}
var AbstractSymbolMap = class {
  /**
   * @constructor
   * @implements {SymbolMap}
   * @param {string} name Name of the mapping.
   * @param {ParseMethod} parser The parser for the mappiong.
   */
  constructor(_name, _parser) {
    this._name = _name;
    this._parser = _parser;
    MapHandler.register(this);
  }
  /**
   * @override
   */
  get name() {
    return this._name;
  }
  /**
   * @override
   */
  parserFor(symbol) {
    return this.contains(symbol) ? this.parser : null;
  }
  /**
   * @override
   */
  parse([env, symbol]) {
    let parser = this.parserFor(symbol);
    let mapped = this.lookup(symbol);
    return parser && mapped ? parseResult(parser(env, mapped)) : null;
  }
  set parser(parser) {
    this._parser = parser;
  }
  get parser() {
    return this._parser;
  }
};
var RegExpMap = class extends AbstractSymbolMap {
  /**
   * @constructor
   * @extends {AbstractSymbolMap}
   * @param {string} name Name of the mapping.
   * @param {ParseMethod} parser The parser for the mappiong.
   * @param {RegExp} regexp The regular expression.
   */
  constructor(name, parser, _regExp) {
    super(name, parser);
    this._regExp = _regExp;
  }
  /**
   * @override
   */
  contains(symbol) {
    return this._regExp.test(symbol);
  }
  /**
   * @override
   */
  lookup(symbol) {
    return this.contains(symbol) ? symbol : null;
  }
};
var AbstractParseMap = class extends AbstractSymbolMap {
  constructor() {
    super(...arguments);
    this.map = /* @__PURE__ */ new Map();
  }
  /**
   * @override
   */
  lookup(symbol) {
    return this.map.get(symbol);
  }
  /**
   * @override
   */
  contains(symbol) {
    return this.map.has(symbol);
  }
  /**
   * Sets mapping for a symbol.
   * @param {string} symbol The symbol to map.
   * @param {K} object The symbols value in the mapping's codomain.
   */
  add(symbol, object) {
    this.map.set(symbol, object);
  }
  /**
   * Removes a symbol from the map
   * @param {string} symbol The symbol to remove
   */
  remove(symbol) {
    this.map.delete(symbol);
  }
};
var CharacterMap = class extends AbstractParseMap {
  /**
   * @constructor
   * @param {string} name Name of the mapping.
   * @param {ParseMethod} parser The parser for the mapping.
   * @param {JSON} json The JSON representation of the character mapping.
   */
  constructor(name, parser, json) {
    super(name, parser);
    for (const key of Object.keys(json)) {
      let value = json[key];
      let [char, attrs] = typeof value === "string" ? [value, null] : value;
      let character = new Symbol2(key, char, attrs);
      this.add(key, character);
    }
  }
};
var DelimiterMap = class extends CharacterMap {
  /**
   * @override
   */
  parse([env, symbol]) {
    return super.parse([env, "\\" + symbol]);
  }
};
var MacroMap = class extends AbstractParseMap {
  /**
   * @constructor
   * @param {string} name Name of the mapping.
   * @param {JSON} json The JSON representation of the macro map.
   * @param {Record<string, ParseMethod>} functionMap Collection of parse
   *     functions for the single macros.
   */
  constructor(name, json, functionMap) {
    super(name, null);
    for (const key of Object.keys(json)) {
      let value = json[key];
      let [func, ...attrs] = typeof value === "string" ? [value] : value;
      let character = new Macro(key, functionMap[func], attrs);
      this.add(key, character);
    }
  }
  /**
   * @override
   */
  parserFor(symbol) {
    let macro = this.lookup(symbol);
    return macro ? macro.func : null;
  }
  /**
   * @override
   */
  parse([env, symbol]) {
    let macro = this.lookup(symbol);
    let parser = this.parserFor(symbol);
    if (!macro || !parser) {
      return null;
    }
    return parseResult(parser(env, macro.symbol, ...macro.args));
  }
};
var CommandMap = class extends MacroMap {
  /**
   * @override
   */
  parse([env, symbol]) {
    let macro = this.lookup(symbol);
    let parser = this.parserFor(symbol);
    if (!macro || !parser) {
      return null;
    }
    let saveCommand = env.currentCS;
    env.currentCS = "\\" + symbol;
    let result = parser(env, "\\" + macro.symbol, ...macro.args);
    env.currentCS = saveCommand;
    return parseResult(result);
  }
};
var EnvironmentMap = class extends MacroMap {
  /**
   * @constructor
   * @param {string} name Name of the mapping.
   * @param {ParseMethod} parser The parser for the environments.
   * @param {JSON} json The JSON representation of the macro map.
   * @param {Record<string, ParseMethod>} functionMap Collection of parse
   *     functions for the single macros.
   */
  constructor(name, parser, json, functionMap) {
    super(name, json, functionMap);
    this.parser = parser;
  }
  /**
   * @override
   */
  parse([env, symbol]) {
    let macro = this.lookup(symbol);
    let envParser = this.parserFor(symbol);
    if (!macro || !envParser) {
      return null;
    }
    return parseResult(this.parser(env, macro.symbol, envParser, macro.args));
  }
};

// node_modules/mathjax-full/ts/input/tex/ams/AmsMappings.ts
new CharacterMap("AMSmath-mathchar0mo", ParseMethods_default.mathchar0mo, {
  iiiint: ["⨌", { texClass: TEXCLASS.OP }]
});
new RegExpMap("AMSmath-operatorLetter", AmsMethods.operatorLetter, /[-*]/i);
new CommandMap("AMSmath-macros", {
  mathring: ["Accent", "02DA"],
  // or 0x30A
  nobreakspace: "Tilde",
  negmedspace: ["Spacer", MATHSPACE.negativemediummathspace],
  negthickspace: ["Spacer", MATHSPACE.negativethickmathspace],
  idotsint: ["MultiIntegral", "\\int\\cdots\\int"],
  dddot: ["Accent", "20DB"],
  ddddot: ["Accent", "20DC"],
  sideset: "SideSet",
  boxed: ["Macro", "\\fbox{$\\displaystyle{#1}$}", 1],
  tag: "HandleTag",
  notag: "HandleNoTag",
  eqref: ["HandleRef", true],
  substack: ["Macro", "\\begin{subarray}{c}#1\\end{subarray}", 1],
  injlim: ["NamedOp", "inj&thinsp;lim"],
  projlim: ["NamedOp", "proj&thinsp;lim"],
  varliminf: ["Macro", "\\mathop{\\underline{\\mmlToken{mi}{lim}}}"],
  varlimsup: ["Macro", "\\mathop{\\overline{\\mmlToken{mi}{lim}}}"],
  varinjlim: ["Macro", "\\mathop{\\underrightarrow{\\mmlToken{mi}{lim}}}"],
  varprojlim: ["Macro", "\\mathop{\\underleftarrow{\\mmlToken{mi}{lim}}}"],
  DeclareMathOperator: "HandleDeclareOp",
  operatorname: "HandleOperatorName",
  genfrac: "Genfrac",
  frac: ["Genfrac", "", "", "", ""],
  tfrac: ["Genfrac", "", "", "", "1"],
  dfrac: ["Genfrac", "", "", "", "0"],
  binom: ["Genfrac", "(", ")", "0", ""],
  tbinom: ["Genfrac", "(", ")", "0", "1"],
  dbinom: ["Genfrac", "(", ")", "0", "0"],
  cfrac: "CFrac",
  shoveleft: ["HandleShove", TexConstant.Align.LEFT],
  shoveright: ["HandleShove", TexConstant.Align.RIGHT],
  xrightarrow: ["xArrow", 8594, 5, 10],
  xleftarrow: ["xArrow", 8592, 10, 5]
}, AmsMethods);
new EnvironmentMap("AMSmath-environment", ParseMethods_default.environment, {
  "equation*": ["Equation", null, false],
  "eqnarray*": [
    "EqnArray",
    null,
    false,
    true,
    "rcl",
    ParseUtil_default.cols(0, MATHSPACE.thickmathspace),
    ".5em"
  ],
  align: ["EqnArray", null, true, true, "rl", ParseUtil_default.cols(0, 2)],
  "align*": ["EqnArray", null, false, true, "rl", ParseUtil_default.cols(0, 2)],
  multline: ["Multline", null, true],
  "multline*": ["Multline", null, false],
  split: ["EqnArray", null, false, false, "rl", ParseUtil_default.cols(0)],
  gather: ["EqnArray", null, true, true, "c"],
  "gather*": ["EqnArray", null, false, true, "c"],
  alignat: ["AlignAt", null, true, true],
  "alignat*": ["AlignAt", null, false, true],
  alignedat: ["AlignAt", null, false, false],
  aligned: ["AmsEqnArray", null, null, null, "rl", ParseUtil_default.cols(0, 2), ".5em", "D"],
  gathered: ["AmsEqnArray", null, null, null, "c", null, ".5em", "D"],
  xalignat: ["XalignAt", null, true, true],
  "xalignat*": ["XalignAt", null, false, true],
  xxalignat: ["XalignAt", null, false, false],
  flalign: ["FlalignArray", null, true, false, true, "rlc", "auto auto fit"],
  "flalign*": ["FlalignArray", null, false, false, true, "rlc", "auto auto fit"],
  subarray: ["Array", null, null, null, null, ParseUtil_default.cols(0), "0.1em", "S", 1],
  smallmatrix: [
    "Array",
    null,
    null,
    null,
    "c",
    ParseUtil_default.cols(1 / 3),
    ".2em",
    "S",
    1
  ],
  matrix: ["Array", null, null, null, "c"],
  pmatrix: ["Array", null, "(", ")", "c"],
  bmatrix: ["Array", null, "[", "]", "c"],
  Bmatrix: ["Array", null, "\\{", "\\}", "c"],
  vmatrix: ["Array", null, "\\vert", "\\vert", "c"],
  Vmatrix: ["Array", null, "\\Vert", "\\Vert", "c"],
  cases: ["Array", null, "\\{", ".", "ll", null, ".2em", "T"]
}, AmsMethods);
new DelimiterMap("AMSmath-delimiter", ParseMethods_default.delimiter, {
  "\\lvert": ["|", { texClass: TEXCLASS.OPEN }],
  "\\rvert": ["|", { texClass: TEXCLASS.CLOSE }],
  "\\lVert": ["‖", { texClass: TEXCLASS.OPEN }],
  "\\rVert": ["‖", { texClass: TEXCLASS.CLOSE }]
});
new CharacterMap("AMSsymbols-mathchar0mi", ParseMethods_default.mathchar0mi, {
  // Lowercase Greek letters
  digamma: "ϝ",
  varkappa: "ϰ",
  // Uppercase Greek letters
  varGamma: ["Γ", { mathvariant: TexConstant.Variant.ITALIC }],
  varDelta: ["Δ", { mathvariant: TexConstant.Variant.ITALIC }],
  varTheta: ["Θ", { mathvariant: TexConstant.Variant.ITALIC }],
  varLambda: ["Λ", { mathvariant: TexConstant.Variant.ITALIC }],
  varXi: ["Ξ", { mathvariant: TexConstant.Variant.ITALIC }],
  varPi: ["Π", { mathvariant: TexConstant.Variant.ITALIC }],
  varSigma: ["Σ", { mathvariant: TexConstant.Variant.ITALIC }],
  varUpsilon: ["Υ", { mathvariant: TexConstant.Variant.ITALIC }],
  varPhi: ["Φ", { mathvariant: TexConstant.Variant.ITALIC }],
  varPsi: ["Ψ", { mathvariant: TexConstant.Variant.ITALIC }],
  varOmega: ["Ω", { mathvariant: TexConstant.Variant.ITALIC }],
  // Hebrew letters
  beth: "ℶ",
  gimel: "ℷ",
  daleth: "ℸ",
  // Miscellaneous symbols
  //    hbar:                   '\u0127',  // in TeX/jax.js
  backprime: ["‵", { variantForm: true }],
  hslash: "ℏ",
  varnothing: ["∅", { variantForm: true }],
  blacktriangle: "▴",
  triangledown: ["▽", { variantForm: true }],
  blacktriangledown: "▾",
  square: "◻",
  Box: "◻",
  blacksquare: "◼",
  lozenge: "◊",
  Diamond: "◊",
  blacklozenge: "⧫",
  circledS: ["Ⓢ", { mathvariant: TexConstant.Variant.NORMAL }],
  bigstar: "★",
  //    angle:                  '\u2220',  // in TeX/jax.js
  sphericalangle: "∢",
  measuredangle: "∡",
  nexists: "∄",
  complement: "∁",
  mho: "℧",
  eth: ["ð", { mathvariant: TexConstant.Variant.NORMAL }],
  Finv: "Ⅎ",
  diagup: "╱",
  Game: "⅁",
  diagdown: "╲",
  Bbbk: [
    "k",
    { mathvariant: TexConstant.Variant.DOUBLESTRUCK }
  ],
  yen: "¥",
  circledR: "®",
  checkmark: "✓",
  maltese: "✠"
});
new CharacterMap("AMSsymbols-mathchar0mo", ParseMethods_default.mathchar0mo, {
  // Binary operators
  dotplus: "∔",
  ltimes: "⋉",
  smallsetminus: ["∖", { variantForm: true }],
  rtimes: "⋊",
  Cap: "⋒",
  doublecap: "⋒",
  leftthreetimes: "⋋",
  Cup: "⋓",
  doublecup: "⋓",
  rightthreetimes: "⋌",
  barwedge: "⊼",
  curlywedge: "⋏",
  veebar: "⊻",
  curlyvee: "⋎",
  doublebarwedge: "⩞",
  boxminus: "⊟",
  circleddash: "⊝",
  boxtimes: "⊠",
  circledast: "⊛",
  boxdot: "⊡",
  circledcirc: "⊚",
  boxplus: "⊞",
  centerdot: ["⋅", { variantForm: true }],
  divideontimes: "⋇",
  intercal: "⊺",
  // Binary relations
  leqq: "≦",
  geqq: "≧",
  leqslant: "⩽",
  geqslant: "⩾",
  eqslantless: "⪕",
  eqslantgtr: "⪖",
  lesssim: "≲",
  gtrsim: "≳",
  lessapprox: "⪅",
  gtrapprox: "⪆",
  approxeq: "≊",
  lessdot: "⋖",
  gtrdot: "⋗",
  lll: "⋘",
  llless: "⋘",
  ggg: "⋙",
  gggtr: "⋙",
  lessgtr: "≶",
  gtrless: "≷",
  lesseqgtr: "⋚",
  gtreqless: "⋛",
  lesseqqgtr: "⪋",
  gtreqqless: "⪌",
  doteqdot: "≑",
  Doteq: "≑",
  eqcirc: "≖",
  risingdotseq: "≓",
  circeq: "≗",
  fallingdotseq: "≒",
  triangleq: "≜",
  backsim: "∽",
  thicksim: ["∼", { variantForm: true }],
  backsimeq: "⋍",
  thickapprox: ["≈", { variantForm: true }],
  subseteqq: "⫅",
  supseteqq: "⫆",
  Subset: "⋐",
  Supset: "⋑",
  sqsubset: "⊏",
  sqsupset: "⊐",
  preccurlyeq: "≼",
  succcurlyeq: "≽",
  curlyeqprec: "⋞",
  curlyeqsucc: "⋟",
  precsim: "≾",
  succsim: "≿",
  precapprox: "⪷",
  succapprox: "⪸",
  vartriangleleft: "⊲",
  lhd: "⊲",
  vartriangleright: "⊳",
  rhd: "⊳",
  trianglelefteq: "⊴",
  unlhd: "⊴",
  trianglerighteq: "⊵",
  unrhd: "⊵",
  vDash: ["⊨", { variantForm: true }],
  Vdash: "⊩",
  Vvdash: "⊪",
  smallsmile: ["⌣", { variantForm: true }],
  shortmid: ["∣", { variantForm: true }],
  smallfrown: ["⌢", { variantForm: true }],
  shortparallel: ["∥", { variantForm: true }],
  bumpeq: "≏",
  between: "≬",
  Bumpeq: "≎",
  pitchfork: "⋔",
  varpropto: ["∝", { variantForm: true }],
  backepsilon: "∍",
  blacktriangleleft: "◂",
  blacktriangleright: "▸",
  therefore: "∴",
  because: "∵",
  eqsim: "≂",
  vartriangle: ["△", { variantForm: true }],
  Join: "⋈",
  // Negated relations
  nless: "≮",
  ngtr: "≯",
  nleq: "≰",
  ngeq: "≱",
  nleqslant: ["⪇", { variantForm: true }],
  ngeqslant: ["⪈", { variantForm: true }],
  nleqq: ["≰", { variantForm: true }],
  ngeqq: ["≱", { variantForm: true }],
  lneq: "⪇",
  gneq: "⪈",
  lneqq: "≨",
  gneqq: "≩",
  lvertneqq: ["≨", { variantForm: true }],
  gvertneqq: ["≩", { variantForm: true }],
  lnsim: "⋦",
  gnsim: "⋧",
  lnapprox: "⪉",
  gnapprox: "⪊",
  nprec: "⊀",
  nsucc: "⊁",
  npreceq: ["⋠", { variantForm: true }],
  nsucceq: ["⋡", { variantForm: true }],
  precneqq: "⪵",
  succneqq: "⪶",
  precnsim: "⋨",
  succnsim: "⋩",
  precnapprox: "⪹",
  succnapprox: "⪺",
  nsim: "≁",
  ncong: "≇",
  nshortmid: ["∤", { variantForm: true }],
  nshortparallel: ["∦", { variantForm: true }],
  nmid: "∤",
  nparallel: "∦",
  nvdash: "⊬",
  nvDash: "⊭",
  nVdash: "⊮",
  nVDash: "⊯",
  ntriangleleft: "⋪",
  ntriangleright: "⋫",
  ntrianglelefteq: "⋬",
  ntrianglerighteq: "⋭",
  nsubseteq: "⊈",
  nsupseteq: "⊉",
  nsubseteqq: ["⊈", { variantForm: true }],
  nsupseteqq: ["⊉", { variantForm: true }],
  subsetneq: "⊊",
  supsetneq: "⊋",
  varsubsetneq: ["⊊", { variantForm: true }],
  varsupsetneq: ["⊋", { variantForm: true }],
  subsetneqq: "⫋",
  supsetneqq: "⫌",
  varsubsetneqq: ["⫋", { variantForm: true }],
  varsupsetneqq: ["⫌", { variantForm: true }],
  // Arrows
  leftleftarrows: "⇇",
  rightrightarrows: "⇉",
  leftrightarrows: "⇆",
  rightleftarrows: "⇄",
  Lleftarrow: "⇚",
  Rrightarrow: "⇛",
  twoheadleftarrow: "↞",
  twoheadrightarrow: "↠",
  leftarrowtail: "↢",
  rightarrowtail: "↣",
  looparrowleft: "↫",
  looparrowright: "↬",
  leftrightharpoons: "⇋",
  rightleftharpoons: ["⇌", { variantForm: true }],
  curvearrowleft: "↶",
  curvearrowright: "↷",
  circlearrowleft: "↺",
  circlearrowright: "↻",
  Lsh: "↰",
  Rsh: "↱",
  upuparrows: "⇈",
  downdownarrows: "⇊",
  upharpoonleft: "↿",
  upharpoonright: "↾",
  downharpoonleft: "⇃",
  restriction: "↾",
  multimap: "⊸",
  downharpoonright: "⇂",
  leftrightsquigarrow: "↭",
  rightsquigarrow: "⇝",
  leadsto: "⇝",
  dashrightarrow: "⇢",
  dashleftarrow: "⇠",
  // Negated arrows
  nleftarrow: "↚",
  nrightarrow: "↛",
  nLeftarrow: "⇍",
  nRightarrow: "⇏",
  nleftrightarrow: "↮",
  nLeftrightarrow: "⇎"
});
new DelimiterMap("AMSsymbols-delimiter", ParseMethods_default.delimiter, {
  // corners
  "\\ulcorner": "⌜",
  "\\urcorner": "⌝",
  "\\llcorner": "⌞",
  "\\lrcorner": "⌟"
});
new CommandMap("AMSsymbols-macros", {
  implies: ["Macro", "\\;\\Longrightarrow\\;"],
  impliedby: ["Macro", "\\;\\Longleftarrow\\;"]
}, AmsMethods);

// node_modules/mathjax-full/ts/input/tex/ams/AmsConfiguration.ts
var AmsTags = class extends AbstractTags {
};
var init = function(config2) {
  new CommandMap(NEW_OPS, {}, {});
  config2.append(Configuration.local({
    handler: { macro: [NEW_OPS] },
    priority: -1
  }));
};
var AmsConfiguration = Configuration.create(
  "ams",
  {
    handler: {
      character: ["AMSmath-operatorLetter"],
      delimiter: ["AMSsymbols-delimiter", "AMSmath-delimiter"],
      macro: [
        "AMSsymbols-mathchar0mi",
        "AMSsymbols-mathchar0mo",
        "AMSsymbols-delimiter",
        "AMSsymbols-macros",
        "AMSmath-mathchar0mo",
        "AMSmath-macros",
        "AMSmath-delimiter"
      ],
      environment: ["AMSmath-environment"]
    },
    items: {
      [MultlineItem.prototype.kind]: MultlineItem,
      [FlalignItem.prototype.kind]: FlalignItem
    },
    tags: { "ams": AmsTags },
    init,
    config: (_config, jax) => {
      if (jax.parseOptions.options.multlineWidth) {
        jax.parseOptions.options.ams.multlineWidth = jax.parseOptions.options.multlineWidth;
      }
      delete jax.parseOptions.options.multlineWidth;
    },
    options: {
      multlineWidth: "",
      ams: {
        multlineWidth: "100%",
        // The width to use for multline environments.
        multlineIndent: "1em"
        // The margin to use on both sides of multline environments.
      }
    }
  }
);

// node_modules/mathjax-full/ts/input/tex/base/BaseMappings.ts
new RegExpMap("letter", ParseMethods_default.variable, /[a-z]/i);
new RegExpMap("digit", ParseMethods_default.digit, /[0-9.,]/);
new RegExpMap("command", ParseMethods_default.controlSequence, /^\\/);
new MacroMap("special", {
  // This is now handled with a RegExp!
  // '\\':  'ControlSequence',
  "{": "Open",
  "}": "Close",
  "~": "Tilde",
  "^": "Superscript",
  "_": "Subscript",
  " ": "Space",
  "	": "Space",
  "\r": "Space",
  "\n": "Space",
  "'": "Prime",
  "%": "Comment",
  "&": "Entry",
  "#": "Hash",
  " ": "Space",
  "’": "Prime"
}, BaseMethods_default);
new CharacterMap("mathchar0mi", ParseMethods_default.mathchar0mi, {
  // Lower-case greek
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  epsilon: "ϵ",
  zeta: "ζ",
  eta: "η",
  theta: "θ",
  iota: "ι",
  kappa: "κ",
  lambda: "λ",
  mu: "μ",
  nu: "ν",
  xi: "ξ",
  omicron: "ο",
  // added for completeness
  pi: "π",
  rho: "ρ",
  sigma: "σ",
  tau: "τ",
  upsilon: "υ",
  phi: "ϕ",
  chi: "χ",
  psi: "ψ",
  omega: "ω",
  varepsilon: "ε",
  vartheta: "ϑ",
  varpi: "ϖ",
  varrho: "ϱ",
  varsigma: "ς",
  varphi: "φ",
  // Ord symbols
  S: ["§", { mathvariant: TexConstant.Variant.NORMAL }],
  aleph: ["ℵ", { mathvariant: TexConstant.Variant.NORMAL }],
  hbar: ["ℏ", { variantForm: true }],
  imath: "ı",
  jmath: "ȷ",
  ell: "ℓ",
  wp: ["℘", { mathvariant: TexConstant.Variant.NORMAL }],
  Re: ["ℜ", { mathvariant: TexConstant.Variant.NORMAL }],
  Im: ["ℑ", { mathvariant: TexConstant.Variant.NORMAL }],
  partial: ["∂", { mathvariant: TexConstant.Variant.ITALIC }],
  infty: ["∞", { mathvariant: TexConstant.Variant.NORMAL }],
  prime: ["′", { variantForm: true }],
  emptyset: ["∅", { mathvariant: TexConstant.Variant.NORMAL }],
  nabla: ["∇", { mathvariant: TexConstant.Variant.NORMAL }],
  top: ["⊤", { mathvariant: TexConstant.Variant.NORMAL }],
  bot: ["⊥", { mathvariant: TexConstant.Variant.NORMAL }],
  angle: ["∠", { mathvariant: TexConstant.Variant.NORMAL }],
  triangle: ["△", { mathvariant: TexConstant.Variant.NORMAL }],
  backslash: ["∖", { mathvariant: TexConstant.Variant.NORMAL }],
  forall: ["∀", { mathvariant: TexConstant.Variant.NORMAL }],
  exists: ["∃", { mathvariant: TexConstant.Variant.NORMAL }],
  neg: ["¬", { mathvariant: TexConstant.Variant.NORMAL }],
  lnot: ["¬", { mathvariant: TexConstant.Variant.NORMAL }],
  flat: ["♭", { mathvariant: TexConstant.Variant.NORMAL }],
  natural: ["♮", { mathvariant: TexConstant.Variant.NORMAL }],
  sharp: ["♯", { mathvariant: TexConstant.Variant.NORMAL }],
  clubsuit: ["♣", { mathvariant: TexConstant.Variant.NORMAL }],
  diamondsuit: ["♢", { mathvariant: TexConstant.Variant.NORMAL }],
  heartsuit: ["♡", { mathvariant: TexConstant.Variant.NORMAL }],
  spadesuit: ["♠", { mathvariant: TexConstant.Variant.NORMAL }]
});
new CharacterMap("mathchar0mo", ParseMethods_default.mathchar0mo, {
  surd: "√",
  // big ops
  coprod: ["∐", {
    texClass: TEXCLASS.OP,
    movesupsub: true
  }],
  bigvee: ["⋁", {
    texClass: TEXCLASS.OP,
    movesupsub: true
  }],
  bigwedge: ["⋀", {
    texClass: TEXCLASS.OP,
    movesupsub: true
  }],
  biguplus: ["⨄", {
    texClass: TEXCLASS.OP,
    movesupsub: true
  }],
  bigcap: ["⋂", {
    texClass: TEXCLASS.OP,
    movesupsub: true
  }],
  bigcup: ["⋃", {
    texClass: TEXCLASS.OP,
    movesupsub: true
  }],
  "int": ["∫", { texClass: TEXCLASS.OP }],
  intop: ["∫", {
    texClass: TEXCLASS.OP,
    movesupsub: true,
    movablelimits: true
  }],
  iint: ["∬", { texClass: TEXCLASS.OP }],
  iiint: ["∭", { texClass: TEXCLASS.OP }],
  prod: ["∏", {
    texClass: TEXCLASS.OP,
    movesupsub: true
  }],
  sum: ["∑", {
    texClass: TEXCLASS.OP,
    movesupsub: true
  }],
  bigotimes: ["⨂", {
    texClass: TEXCLASS.OP,
    movesupsub: true
  }],
  bigoplus: ["⨁", {
    texClass: TEXCLASS.OP,
    movesupsub: true
  }],
  bigodot: ["⨀", {
    texClass: TEXCLASS.OP,
    movesupsub: true
  }],
  oint: ["∮", { texClass: TEXCLASS.OP }],
  bigsqcup: ["⨆", {
    texClass: TEXCLASS.OP,
    movesupsub: true
  }],
  smallint: ["∫", { largeop: false }],
  // binary operations
  triangleleft: "◃",
  triangleright: "▹",
  bigtriangleup: "△",
  bigtriangledown: "▽",
  wedge: "∧",
  land: "∧",
  vee: "∨",
  lor: "∨",
  cap: "∩",
  cup: "∪",
  ddagger: "‡",
  dagger: "†",
  sqcap: "⊓",
  sqcup: "⊔",
  uplus: "⊎",
  amalg: "⨿",
  diamond: "⋄",
  bullet: "∙",
  wr: "≀",
  div: "÷",
  divsymbol: "÷",
  odot: ["⊙", { largeop: false }],
  oslash: ["⊘", { largeop: false }],
  otimes: ["⊗", { largeop: false }],
  ominus: ["⊖", { largeop: false }],
  oplus: ["⊕", { largeop: false }],
  mp: "∓",
  pm: "±",
  circ: "∘",
  bigcirc: "◯",
  setminus: "∖",
  cdot: "⋅",
  ast: "∗",
  times: "×",
  star: "⋆",
  // Relations
  propto: "∝",
  sqsubseteq: "⊑",
  sqsupseteq: "⊒",
  parallel: "∥",
  mid: "∣",
  dashv: "⊣",
  vdash: "⊢",
  leq: "≤",
  le: "≤",
  geq: "≥",
  ge: "≥",
  lt: "<",
  gt: ">",
  succ: "≻",
  prec: "≺",
  approx: "≈",
  succeq: "⪰",
  // or '227C',
  preceq: "⪯",
  // or '227D',
  supset: "⊃",
  subset: "⊂",
  supseteq: "⊇",
  subseteq: "⊆",
  "in": "∈",
  ni: "∋",
  notin: "∉",
  owns: "∋",
  gg: "≫",
  ll: "≪",
  sim: "∼",
  simeq: "≃",
  perp: "⊥",
  equiv: "≡",
  asymp: "≍",
  smile: "⌣",
  frown: "⌢",
  ne: "≠",
  neq: "≠",
  cong: "≅",
  doteq: "≐",
  bowtie: "⋈",
  models: "⊨",
  notChar: "⧸",
  // Arrows
  Leftrightarrow: "⇔",
  Leftarrow: "⇐",
  Rightarrow: "⇒",
  leftrightarrow: "↔",
  leftarrow: "←",
  gets: "←",
  rightarrow: "→",
  to: ["→", { accent: false }],
  mapsto: "↦",
  leftharpoonup: "↼",
  leftharpoondown: "↽",
  rightharpoonup: "⇀",
  rightharpoondown: "⇁",
  nearrow: "↗",
  searrow: "↘",
  nwarrow: "↖",
  swarrow: "↙",
  rightleftharpoons: "⇌",
  hookrightarrow: "↪",
  hookleftarrow: "↩",
  longleftarrow: "⟵",
  Longleftarrow: "⟸",
  longrightarrow: "⟶",
  Longrightarrow: "⟹",
  Longleftrightarrow: "⟺",
  longleftrightarrow: "⟷",
  longmapsto: "⟼",
  // Misc.
  ldots: "…",
  cdots: "⋯",
  vdots: "⋮",
  ddots: "⋱",
  dotsc: "…",
  // dots with commas
  dotsb: "⋯",
  // dots with binary ops and relations
  dotsm: "⋯",
  // dots with multiplication
  dotsi: "⋯",
  // dots with integrals
  dotso: "…",
  // other dots
  ldotp: [".", { texClass: TEXCLASS.PUNCT }],
  cdotp: ["⋅", { texClass: TEXCLASS.PUNCT }],
  colon: [":", { texClass: TEXCLASS.PUNCT }]
});
new CharacterMap("mathchar7", ParseMethods_default.mathchar7, {
  Gamma: "Γ",
  Delta: "Δ",
  Theta: "Θ",
  Lambda: "Λ",
  Xi: "Ξ",
  Pi: "Π",
  Sigma: "Σ",
  Upsilon: "Υ",
  Phi: "Φ",
  Psi: "Ψ",
  Omega: "Ω",
  "_": "_",
  "#": "#",
  "$": "$",
  "%": "%",
  "&": "&",
  And: "&"
});
new DelimiterMap("delimiter", ParseMethods_default.delimiter, {
  "(": "(",
  ")": ")",
  "[": "[",
  "]": "]",
  "<": "⟨",
  ">": "⟩",
  "\\lt": "⟨",
  "\\gt": "⟩",
  "/": "/",
  "|": ["|", { texClass: TEXCLASS.ORD }],
  ".": "",
  "\\\\": "\\",
  "\\lmoustache": "⎰",
  // non-standard
  "\\rmoustache": "⎱",
  // non-standard
  "\\lgroup": "⟮",
  // non-standard
  "\\rgroup": "⟯",
  // non-standard
  "\\arrowvert": "⏐",
  "\\Arrowvert": "‖",
  "\\bracevert": "⎪",
  // non-standard
  "\\Vert": ["‖", { texClass: TEXCLASS.ORD }],
  "\\|": ["‖", { texClass: TEXCLASS.ORD }],
  "\\vert": ["|", { texClass: TEXCLASS.ORD }],
  "\\uparrow": "↑",
  "\\downarrow": "↓",
  "\\updownarrow": "↕",
  "\\Uparrow": "⇑",
  "\\Downarrow": "⇓",
  "\\Updownarrow": "⇕",
  "\\backslash": "\\",
  "\\rangle": "⟩",
  "\\langle": "⟨",
  "\\rbrace": "}",
  "\\lbrace": "{",
  "\\}": "}",
  "\\{": "{",
  "\\rceil": "⌉",
  "\\lceil": "⌈",
  "\\rfloor": "⌋",
  "\\lfloor": "⌊",
  "\\lbrack": "[",
  "\\rbrack": "]"
});
new CommandMap("macros", {
  displaystyle: ["SetStyle", "D", true, 0],
  textstyle: ["SetStyle", "T", false, 0],
  scriptstyle: ["SetStyle", "S", false, 1],
  scriptscriptstyle: ["SetStyle", "SS", false, 2],
  rm: ["SetFont", TexConstant.Variant.NORMAL],
  mit: ["SetFont", TexConstant.Variant.ITALIC],
  oldstyle: ["SetFont", TexConstant.Variant.OLDSTYLE],
  cal: ["SetFont", TexConstant.Variant.CALLIGRAPHIC],
  it: ["SetFont", TexConstant.Variant.MATHITALIC],
  // needs special handling
  bf: ["SetFont", TexConstant.Variant.BOLD],
  bbFont: ["SetFont", TexConstant.Variant.DOUBLESTRUCK],
  scr: ["SetFont", TexConstant.Variant.SCRIPT],
  frak: ["SetFont", TexConstant.Variant.FRAKTUR],
  sf: ["SetFont", TexConstant.Variant.SANSSERIF],
  tt: ["SetFont", TexConstant.Variant.MONOSPACE],
  mathrm: ["MathFont", TexConstant.Variant.NORMAL],
  mathup: ["MathFont", TexConstant.Variant.NORMAL],
  mathnormal: ["MathFont", ""],
  mathbf: ["MathFont", TexConstant.Variant.BOLD],
  mathbfup: ["MathFont", TexConstant.Variant.BOLD],
  mathit: ["MathFont", TexConstant.Variant.MATHITALIC],
  mathbfit: ["MathFont", TexConstant.Variant.BOLDITALIC],
  mathbb: ["MathFont", TexConstant.Variant.DOUBLESTRUCK],
  Bbb: ["MathFont", TexConstant.Variant.DOUBLESTRUCK],
  mathfrak: ["MathFont", TexConstant.Variant.FRAKTUR],
  mathbffrak: ["MathFont", TexConstant.Variant.BOLDFRAKTUR],
  mathscr: ["MathFont", TexConstant.Variant.SCRIPT],
  mathbfscr: ["MathFont", TexConstant.Variant.BOLDSCRIPT],
  mathsf: ["MathFont", TexConstant.Variant.SANSSERIF],
  mathsfup: ["MathFont", TexConstant.Variant.SANSSERIF],
  mathbfsf: ["MathFont", TexConstant.Variant.BOLDSANSSERIF],
  mathbfsfup: ["MathFont", TexConstant.Variant.BOLDSANSSERIF],
  mathsfit: ["MathFont", TexConstant.Variant.SANSSERIFITALIC],
  mathbfsfit: ["MathFont", TexConstant.Variant.SANSSERIFBOLDITALIC],
  mathtt: ["MathFont", TexConstant.Variant.MONOSPACE],
  mathcal: ["MathFont", TexConstant.Variant.CALLIGRAPHIC],
  mathbfcal: ["MathFont", TexConstant.Variant.BOLDCALLIGRAPHIC],
  symrm: ["MathFont", TexConstant.Variant.NORMAL],
  symup: ["MathFont", TexConstant.Variant.NORMAL],
  symnormal: ["MathFont", ""],
  symbf: ["MathFont", TexConstant.Variant.BOLD],
  symbfup: ["MathFont", TexConstant.Variant.BOLD],
  symit: ["MathFont", TexConstant.Variant.ITALIC],
  symbfit: ["MathFont", TexConstant.Variant.BOLDITALIC],
  symbb: ["MathFont", TexConstant.Variant.DOUBLESTRUCK],
  symfrak: ["MathFont", TexConstant.Variant.FRAKTUR],
  symbffrak: ["MathFont", TexConstant.Variant.BOLDFRAKTUR],
  symscr: ["MathFont", TexConstant.Variant.SCRIPT],
  symbfscr: ["MathFont", TexConstant.Variant.BOLDSCRIPT],
  symsf: ["MathFont", TexConstant.Variant.SANSSERIF],
  symsfup: ["MathFont", TexConstant.Variant.SANSSERIF],
  symbfsf: ["MathFont", TexConstant.Variant.BOLDSANSSERIF],
  symbfsfup: ["MathFont", TexConstant.Variant.BOLDSANSSERIF],
  symsfit: ["MathFont", TexConstant.Variant.SANSSERIFITALIC],
  symbfsfit: ["MathFont", TexConstant.Variant.SANSSERIFBOLDITALIC],
  symtt: ["MathFont", TexConstant.Variant.MONOSPACE],
  symcal: ["MathFont", TexConstant.Variant.CALLIGRAPHIC],
  symbfcal: ["MathFont", TexConstant.Variant.BOLDCALLIGRAPHIC],
  textrm: ["HBox", null, TexConstant.Variant.NORMAL],
  textup: ["HBox", null, TexConstant.Variant.NORMAL],
  textnormal: ["HBox"],
  textit: ["HBox", null, TexConstant.Variant.ITALIC],
  textbf: ["HBox", null, TexConstant.Variant.BOLD],
  textsf: ["HBox", null, TexConstant.Variant.SANSSERIF],
  texttt: ["HBox", null, TexConstant.Variant.MONOSPACE],
  tiny: ["SetSize", 0.5],
  Tiny: ["SetSize", 0.6],
  // non-standard
  scriptsize: ["SetSize", 0.7],
  small: ["SetSize", 0.85],
  normalsize: ["SetSize", 1],
  large: ["SetSize", 1.2],
  Large: ["SetSize", 1.44],
  LARGE: ["SetSize", 1.73],
  huge: ["SetSize", 2.07],
  Huge: ["SetSize", 2.49],
  arcsin: "NamedFn",
  arccos: "NamedFn",
  arctan: "NamedFn",
  arg: "NamedFn",
  cos: "NamedFn",
  cosh: "NamedFn",
  cot: "NamedFn",
  coth: "NamedFn",
  csc: "NamedFn",
  deg: "NamedFn",
  det: "NamedOp",
  dim: "NamedFn",
  exp: "NamedFn",
  gcd: "NamedOp",
  hom: "NamedFn",
  inf: "NamedOp",
  ker: "NamedFn",
  lg: "NamedFn",
  lim: "NamedOp",
  liminf: ["NamedOp", "lim&thinsp;inf"],
  limsup: ["NamedOp", "lim&thinsp;sup"],
  ln: "NamedFn",
  log: "NamedFn",
  max: "NamedOp",
  min: "NamedOp",
  Pr: "NamedOp",
  sec: "NamedFn",
  sin: "NamedFn",
  sinh: "NamedFn",
  sup: "NamedOp",
  tan: "NamedFn",
  tanh: "NamedFn",
  limits: ["Limits", 1],
  nolimits: ["Limits", 0],
  overline: ["UnderOver", "2015"],
  underline: ["UnderOver", "2015"],
  overbrace: ["UnderOver", "23DE", 1],
  underbrace: ["UnderOver", "23DF", 1],
  overparen: ["UnderOver", "23DC"],
  underparen: ["UnderOver", "23DD"],
  overrightarrow: ["UnderOver", "2192"],
  underrightarrow: ["UnderOver", "2192"],
  overleftarrow: ["UnderOver", "2190"],
  underleftarrow: ["UnderOver", "2190"],
  overleftrightarrow: ["UnderOver", "2194"],
  underleftrightarrow: ["UnderOver", "2194"],
  overset: "Overset",
  underset: "Underset",
  overunderset: "Overunderset",
  stackrel: ["Macro", "\\mathrel{\\mathop{#2}\\limits^{#1}}", 2],
  stackbin: ["Macro", "\\mathbin{\\mathop{#2}\\limits^{#1}}", 2],
  over: "Over",
  overwithdelims: "Over",
  atop: "Over",
  atopwithdelims: "Over",
  above: "Over",
  abovewithdelims: "Over",
  brace: ["Over", "{", "}"],
  brack: ["Over", "[", "]"],
  choose: ["Over", "(", ")"],
  frac: "Frac",
  sqrt: "Sqrt",
  root: "Root",
  uproot: ["MoveRoot", "upRoot"],
  leftroot: ["MoveRoot", "leftRoot"],
  left: "LeftRight",
  right: "LeftRight",
  middle: "LeftRight",
  llap: "Lap",
  rlap: "Lap",
  raise: "RaiseLower",
  lower: "RaiseLower",
  moveleft: "MoveLeftRight",
  moveright: "MoveLeftRight",
  ",": ["Spacer", MATHSPACE.thinmathspace],
  ":": ["Spacer", MATHSPACE.mediummathspace],
  ">": ["Spacer", MATHSPACE.mediummathspace],
  ";": ["Spacer", MATHSPACE.thickmathspace],
  "!": ["Spacer", MATHSPACE.negativethinmathspace],
  enspace: ["Spacer", 0.5],
  quad: ["Spacer", 1],
  qquad: ["Spacer", 2],
  thinspace: ["Spacer", MATHSPACE.thinmathspace],
  negthinspace: ["Spacer", MATHSPACE.negativethinmathspace],
  hskip: "Hskip",
  hspace: "Hskip",
  kern: "Hskip",
  mskip: "Hskip",
  mspace: "Hskip",
  mkern: "Hskip",
  rule: "rule",
  Rule: ["Rule"],
  Space: ["Rule", "blank"],
  nonscript: "Nonscript",
  big: ["MakeBig", TEXCLASS.ORD, 0.85],
  Big: ["MakeBig", TEXCLASS.ORD, 1.15],
  bigg: ["MakeBig", TEXCLASS.ORD, 1.45],
  Bigg: ["MakeBig", TEXCLASS.ORD, 1.75],
  bigl: ["MakeBig", TEXCLASS.OPEN, 0.85],
  Bigl: ["MakeBig", TEXCLASS.OPEN, 1.15],
  biggl: ["MakeBig", TEXCLASS.OPEN, 1.45],
  Biggl: ["MakeBig", TEXCLASS.OPEN, 1.75],
  bigr: ["MakeBig", TEXCLASS.CLOSE, 0.85],
  Bigr: ["MakeBig", TEXCLASS.CLOSE, 1.15],
  biggr: ["MakeBig", TEXCLASS.CLOSE, 1.45],
  Biggr: ["MakeBig", TEXCLASS.CLOSE, 1.75],
  bigm: ["MakeBig", TEXCLASS.REL, 0.85],
  Bigm: ["MakeBig", TEXCLASS.REL, 1.15],
  biggm: ["MakeBig", TEXCLASS.REL, 1.45],
  Biggm: ["MakeBig", TEXCLASS.REL, 1.75],
  mathord: ["TeXAtom", TEXCLASS.ORD],
  mathop: ["TeXAtom", TEXCLASS.OP],
  mathopen: ["TeXAtom", TEXCLASS.OPEN],
  mathclose: ["TeXAtom", TEXCLASS.CLOSE],
  mathbin: ["TeXAtom", TEXCLASS.BIN],
  mathrel: ["TeXAtom", TEXCLASS.REL],
  mathpunct: ["TeXAtom", TEXCLASS.PUNCT],
  mathinner: ["TeXAtom", TEXCLASS.INNER],
  vcenter: ["TeXAtom", TEXCLASS.VCENTER],
  buildrel: "BuildRel",
  hbox: ["HBox", 0],
  text: "HBox",
  mbox: ["HBox", 0],
  fbox: "FBox",
  boxed: ["Macro", "\\fbox{$\\displaystyle{#1}$}", 1],
  framebox: "FrameBox",
  strut: "Strut",
  mathstrut: ["Macro", "\\vphantom{(}"],
  phantom: "Phantom",
  vphantom: ["Phantom", 1, 0],
  hphantom: ["Phantom", 0, 1],
  smash: "Smash",
  acute: ["Accent", "00B4"],
  // or 0301 or 02CA
  grave: ["Accent", "0060"],
  // or 0300 or 02CB
  ddot: ["Accent", "00A8"],
  // or 0308
  tilde: ["Accent", "007E"],
  // or 0303 or 02DC
  bar: ["Accent", "00AF"],
  // or 0304 or 02C9
  breve: ["Accent", "02D8"],
  // or 0306
  check: ["Accent", "02C7"],
  // or 030C
  hat: ["Accent", "005E"],
  // or 0302 or 02C6
  vec: ["Accent", "2192"],
  // or 20D7
  dot: ["Accent", "02D9"],
  // or 0307
  widetilde: ["Accent", "007E", 1],
  // or 0303 or 02DC
  widehat: ["Accent", "005E", 1],
  // or 0302 or 02C6
  matrix: "Matrix",
  array: "Matrix",
  pmatrix: ["Matrix", "(", ")"],
  cases: [
    "Matrix",
    "{",
    "",
    "left left",
    null,
    ".1em",
    null,
    true
  ],
  eqalign: [
    "Matrix",
    null,
    null,
    "right left",
    em(MATHSPACE.thickmathspace),
    ".5em",
    "D"
  ],
  displaylines: ["Matrix", null, null, "center", null, ".5em", "D"],
  cr: "Cr",
  "\\": "CrLaTeX",
  newline: ["CrLaTeX", true],
  hline: ["HLine", "solid"],
  hdashline: ["HLine", "dashed"],
  //      noalign:            'HandleNoAlign',
  eqalignno: [
    "Matrix",
    null,
    null,
    "right left",
    em(MATHSPACE.thickmathspace),
    ".5em",
    "D",
    null,
    "right"
  ],
  leqalignno: [
    "Matrix",
    null,
    null,
    "right left",
    em(MATHSPACE.thickmathspace),
    ".5em",
    "D",
    null,
    "left"
  ],
  hfill: "HFill",
  hfil: "HFill",
  // \hfil treated as \hfill for now
  hfilll: "HFill",
  // \hfilll treated as \hfill for now
  //  TeX substitution macros
  bmod: ["Macro", '\\mmlToken{mo}[lspace="thickmathspace" rspace="thickmathspace"]{mod}'],
  pmod: ["Macro", "\\pod{\\mmlToken{mi}{mod}\\kern 6mu #1}", 1],
  mod: [
    "Macro",
    "\\mathchoice{\\kern18mu}{\\kern12mu}{\\kern12mu}{\\kern12mu}\\mmlToken{mi}{mod}\\,\\,#1",
    1
  ],
  pod: ["Macro", "\\mathchoice{\\kern18mu}{\\kern8mu}{\\kern8mu}{\\kern8mu}(#1)", 1],
  iff: ["Macro", "\\;\\Longleftrightarrow\\;"],
  skew: ["Macro", "{{#2{#3\\mkern#1mu}\\mkern-#1mu}{}}", 3],
  pmb: ["Macro", "\\rlap{#1}\\kern1px{#1}", 1],
  TeX: ["Macro", "T\\kern-.14em\\lower.5ex{E}\\kern-.115em X"],
  LaTeX: ["Macro", "L\\kern-.325em\\raise.21em{\\scriptstyle{A}}\\kern-.17em\\TeX"],
  " ": ["Macro", "\\text{ }"],
  //  Specially handled
  not: "Not",
  dots: "Dots",
  space: "Tilde",
  " ": "Tilde",
  //  LaTeX
  begin: "BeginEnd",
  end: "BeginEnd",
  label: "HandleLabel",
  ref: "HandleRef",
  nonumber: "HandleNoTag",
  // Internal use:
  mathchoice: "MathChoice",
  mmlToken: "MmlToken"
}, BaseMethods_default);
new EnvironmentMap("environment", ParseMethods_default.environment, {
  array: ["AlignedArray"],
  equation: ["Equation", null, true],
  eqnarray: [
    "EqnArray",
    null,
    true,
    true,
    "rcl",
    ParseUtil_default.cols(0, MATHSPACE.thickmathspace),
    ".5em"
  ]
}, BaseMethods_default);
new CharacterMap("not_remap", null, {
  "←": "↚",
  "→": "↛",
  "↔": "↮",
  "⇐": "⇍",
  "⇒": "⇏",
  "⇔": "⇎",
  "∈": "∉",
  "∋": "∌",
  "∣": "∤",
  "∥": "∦",
  "∼": "≁",
  "~": "≁",
  "≃": "≄",
  "≅": "≇",
  "≈": "≉",
  "≍": "≭",
  "=": "≠",
  "≡": "≢",
  "<": "≮",
  ">": "≯",
  "≤": "≰",
  "≥": "≱",
  "≲": "≴",
  "≳": "≵",
  "≶": "≸",
  "≷": "≹",
  "≺": "⊀",
  "≻": "⊁",
  "⊂": "⊄",
  "⊃": "⊅",
  "⊆": "⊈",
  "⊇": "⊉",
  "⊢": "⊬",
  "⊨": "⊭",
  "⊩": "⊮",
  "⊫": "⊯",
  "≼": "⋠",
  "≽": "⋡",
  "⊑": "⋢",
  "⊒": "⋣",
  "⊲": "⋪",
  "⊳": "⋫",
  "⊴": "⋬",
  "⊵": "⋭",
  "∃": "∄"
});

// node_modules/mathjax-full/ts/input/tex/base/BaseConfiguration.ts
new CharacterMap("remap", null, {
  "-": "−",
  "*": "∗",
  "`": "‘"
  // map ` to back quote
});
function Other(parser, char) {
  const font = parser.stack.env["font"];
  let def = font ? (
    // @test Other Font
    { mathvariant: parser.stack.env["font"] }
  ) : {};
  const remap = MapHandler.getMap("remap").lookup(char);
  const range = getRange(char);
  const type = range ? range[3] : "mo";
  let mo = parser.create("token", type, def, remap ? remap.char : char);
  range[4] && mo.attributes.set("mathvariant", range[4]);
  if (type === "mo") {
    NodeUtil_default.setProperty(mo, "fixStretchy", true);
    parser.configuration.addNode("fixStretchy", mo);
  }
  parser.Push(mo);
}
function csUndefined(_parser, name) {
  throw new TexError(
    "UndefinedControlSequence",
    "Undefined control sequence %1",
    "\\" + name
  );
}
function envUndefined(_parser, env) {
  throw new TexError("UnknownEnv", "Unknown environment '%1'", env);
}
function filterNonscript({ data }) {
  for (const mml of data.getList("nonscript")) {
    if (mml.attributes.get("scriptlevel") > 0) {
      const parent = mml.parent;
      parent.childNodes.splice(parent.childIndex(mml), 1);
      data.removeFromList(mml.kind, [mml]);
      if (mml.isKind("mrow")) {
        const mstyle = mml.childNodes[0];
        data.removeFromList("mstyle", [mstyle]);
        data.removeFromList("mspace", mstyle.childNodes[0].childNodes);
      }
    } else if (mml.isKind("mrow")) {
      mml.parent.replaceChild(mml.childNodes[0], mml);
      data.removeFromList("mrow", [mml]);
    }
  }
}
var BaseTags = class extends AbstractTags {
};
var BaseConfiguration = Configuration.create(
  "base",
  {
    handler: {
      character: ["command", "special", "letter", "digit"],
      delimiter: ["delimiter"],
      // Note, that the position of the delimiters here is important!
      macro: ["delimiter", "macros", "mathchar0mi", "mathchar0mo", "mathchar7"],
      environment: ["environment"]
    },
    fallback: {
      character: Other,
      macro: csUndefined,
      environment: envUndefined
    },
    items: {
      // BaseItems
      [StartItem.prototype.kind]: StartItem,
      [StopItem.prototype.kind]: StopItem,
      [OpenItem.prototype.kind]: OpenItem,
      [CloseItem.prototype.kind]: CloseItem,
      [PrimeItem.prototype.kind]: PrimeItem,
      [SubsupItem.prototype.kind]: SubsupItem,
      [OverItem.prototype.kind]: OverItem,
      [LeftItem.prototype.kind]: LeftItem,
      [Middle.prototype.kind]: Middle,
      [RightItem.prototype.kind]: RightItem,
      [BeginItem.prototype.kind]: BeginItem,
      [EndItem.prototype.kind]: EndItem,
      [StyleItem.prototype.kind]: StyleItem,
      [PositionItem.prototype.kind]: PositionItem,
      [CellItem.prototype.kind]: CellItem,
      [MmlItem.prototype.kind]: MmlItem,
      [FnItem.prototype.kind]: FnItem,
      [NotItem.prototype.kind]: NotItem,
      [NonscriptItem.prototype.kind]: NonscriptItem,
      [DotsItem.prototype.kind]: DotsItem,
      [ArrayItem.prototype.kind]: ArrayItem,
      [EqnArrayItem.prototype.kind]: EqnArrayItem,
      [EquationItem.prototype.kind]: EquationItem
    },
    options: {
      maxMacros: 1e3,
      baseURL: typeof document === "undefined" || document.getElementsByTagName("base").length === 0 ? "" : String(document.location).replace(/#.*$/, "")
    },
    tags: {
      base: BaseTags
    },
    postprocessors: [[filterNonscript, -4]]
  }
);

// node_modules/mathjax-full/ts/input/tex/NodeFactory.ts
var NodeFactory = class _NodeFactory {
  constructor() {
    /**
     * The external node factory.
     * @type {MmlFactory}
     */
    this.mmlFactory = null;
    /**
     * The factory table populated with some default methods.
     */
    this.factory = {
      "node": _NodeFactory.createNode,
      "token": _NodeFactory.createToken,
      "text": _NodeFactory.createText,
      "error": _NodeFactory.createError
    };
  }
  /**
   * Default node generation function.
   * @param {NodeFactory} factory The current node factory.
   * @param {string} kind The type of node to create.
   * @param {MmlNode[]} children Its children.
   * @param {any=} def Its properties.
   * @param {TextNode=} text An optional text node if this is a token.
   * @return {MmlNode} The newly created Mml node.
   */
  static createNode(factory, kind, children = [], def = {}, text) {
    const node = factory.mmlFactory.create(kind);
    node.setChildren(children);
    if (text) {
      node.appendChild(text);
    }
    NodeUtil_default.setProperties(node, def);
    return node;
  }
  /**
   * Default token generation function.
   * @param {NodeFactory} factory The current node factory.
   * @param {string} kind The type of node to create.
   * @param {any} def Its properties.
   * @param {string} text Text of the token.
   * @return {MmlNode} The newly created token node.
   */
  static createToken(factory, kind, def = {}, text = "") {
    const textNode = factory.create("text", text);
    return factory.create("node", kind, [], def, textNode);
  }
  /**
   * Default text node generation function.
   * @param {NodeFactory} factory The current node factory.
   * @param {string} text The text for the new node.
   * @return {TextNode} The newly created text node.
   */
  static createText(factory, text) {
    if (text == null) {
      return null;
    }
    return factory.mmlFactory.create("text").setText(text);
  }
  /**
   * Default error node generation function.
   * @param {NodeFactory} factory The current node factory.
   * @param {string} message The error message.
   * @return {MmlNode} The newly created error node.
   */
  static createError(factory, message) {
    let text = factory.create("text", message);
    let mtext = factory.create("node", "mtext", [], {}, text);
    let error = factory.create("node", "merror", [mtext], { "data-mjx-error": message });
    return error;
  }
  /**
   * @param {MmlFactory} mmlFactory   The MmlFactory for the TeX jax to use
   */
  setMmlFactory(mmlFactory) {
    this.mmlFactory = mmlFactory;
  }
  /**
   * Adds a method to the factory.
   * @param {string} kind The type of node the method creates.
   * @param {NodeFactoryMethod} func The node creator.
   */
  set(kind, func) {
    this.factory[kind] = func;
  }
  /**
   * Adds a set of node creators to the factory.
   * @param {Object.<NodeFactoryMethod>} maps The set of functions.
   */
  setCreators(maps) {
    for (let kind in maps) {
      this.set(kind, maps[kind]);
    }
  }
  /**
   * Creates a node for the internal data structure from the factory.
   * @param {string} kind The type of node to be created.
   * @param {any[]} ...rest The arguments for the node.
   * @return {MmlNode} The created node.
   */
  create(kind, ...rest) {
    const func = this.factory[kind] || this.factory["node"];
    const node = func(this, rest[0], ...rest.slice(1));
    if (kind === "node") {
      this.configuration.addNode(rest[0], node);
    }
    return node;
  }
  /**
   * @param {string} kind The method for generating a node of given kind.
   */
  get(kind) {
    return this.factory[kind];
  }
};

// node_modules/mathjax-full/ts/input/tex/boldsymbol/BoldsymbolConfiguration.ts
var BOLDVARIANT = {};
BOLDVARIANT[TexConstant.Variant.NORMAL] = TexConstant.Variant.BOLD;
BOLDVARIANT[TexConstant.Variant.ITALIC] = TexConstant.Variant.BOLDITALIC;
BOLDVARIANT[TexConstant.Variant.FRAKTUR] = TexConstant.Variant.BOLDFRAKTUR;
BOLDVARIANT[TexConstant.Variant.SCRIPT] = TexConstant.Variant.BOLDSCRIPT;
BOLDVARIANT[TexConstant.Variant.SANSSERIF] = TexConstant.Variant.BOLDSANSSERIF;
BOLDVARIANT["-tex-calligraphic"] = "-tex-bold-calligraphic";
BOLDVARIANT["-tex-oldstyle"] = "-tex-bold-oldstyle";
BOLDVARIANT["-tex-mathit"] = TexConstant.Variant.BOLDITALIC;
var BoldsymbolMethods = {};
BoldsymbolMethods.Boldsymbol = function(parser, name) {
  let boldsymbol = parser.stack.env["boldsymbol"];
  parser.stack.env["boldsymbol"] = true;
  let mml = parser.ParseArg(name);
  parser.stack.env["boldsymbol"] = boldsymbol;
  parser.Push(mml);
};
new CommandMap("boldsymbol", { boldsymbol: "Boldsymbol" }, BoldsymbolMethods);
function createBoldToken(factory, kind, def, text) {
  let token = NodeFactory.createToken(factory, kind, def, text);
  if (kind !== "mtext" && factory.configuration.parser.stack.env["boldsymbol"]) {
    NodeUtil_default.setProperty(token, "fixBold", true);
    factory.configuration.addNode("fixBold", token);
  }
  return token;
}
function rewriteBoldTokens(arg) {
  for (let node of arg.data.getList("fixBold")) {
    if (NodeUtil_default.getProperty(node, "fixBold")) {
      let variant = NodeUtil_default.getAttribute(node, "mathvariant");
      if (variant == null) {
        NodeUtil_default.setAttribute(node, "mathvariant", TexConstant.Variant.BOLD);
      } else {
        NodeUtil_default.setAttribute(
          node,
          "mathvariant",
          BOLDVARIANT[variant] || variant
        );
      }
      NodeUtil_default.removeProperties(node, "fixBold");
    }
  }
}
var BoldsymbolConfiguration = Configuration.create(
  "boldsymbol",
  {
    handler: { macro: ["boldsymbol"] },
    nodes: { "token": createBoldToken },
    postprocessors: [rewriteBoldTokens]
  }
);

// node_modules/mathjax-full/ts/input/tex/braket/BraketItems.ts
var BraketItem = class extends BaseItem {
  /**
   * @override
   */
  get kind() {
    return "braket";
  }
  /**
   * @override
   */
  get isOpen() {
    return true;
  }
  /**
   * @override
   */
  checkItem(item) {
    if (item.isKind("close")) {
      return [[this.factory.create("mml", this.toMml())], true];
    }
    if (item.isKind("mml")) {
      this.Push(item.toMml());
      if (this.getProperty("single")) {
        return [[this.toMml()], true];
      }
      return BaseItem.fail;
    }
    return super.checkItem(item);
  }
  /**
   * @override
   */
  toMml() {
    let inner = super.toMml();
    let open = this.getProperty("open");
    let close = this.getProperty("close");
    if (this.getProperty("stretchy")) {
      return ParseUtil_default.fenced(this.factory.configuration, open, inner, close);
    }
    let attrs = { fence: true, stretchy: false, symmetric: true, texClass: TEXCLASS.OPEN };
    let openNode = this.create("token", "mo", attrs, open);
    attrs.texClass = TEXCLASS.CLOSE;
    let closeNode = this.create("token", "mo", attrs, close);
    let mrow = this.create(
      "node",
      "mrow",
      [openNode, inner, closeNode],
      { open, close, texClass: TEXCLASS.INNER }
    );
    return mrow;
  }
};

// node_modules/mathjax-full/ts/input/tex/braket/BraketMethods.ts
var BraketMethods = {};
BraketMethods.Macro = BaseMethods_default.Macro;
BraketMethods.Braket = function(parser, _name, open, close, stretchy, barmax) {
  let next = parser.GetNext();
  if (next === "") {
    throw new TexError("MissingArgFor", "Missing argument for %1", parser.currentCS);
  }
  let single = true;
  if (next === "{") {
    parser.i++;
    single = false;
  }
  parser.Push(
    parser.itemFactory.create("braket").setProperties({
      barmax,
      barcount: 0,
      open,
      close,
      stretchy,
      single
    })
  );
};
BraketMethods.Bar = function(parser, name) {
  let c = name === "|" ? "|" : "∥";
  let top = parser.stack.Top();
  if (top.kind !== "braket" || top.getProperty("barcount") >= top.getProperty("barmax")) {
    let mml = parser.create("token", "mo", { texClass: TEXCLASS.ORD, stretchy: false }, c);
    parser.Push(mml);
    return;
  }
  if (c === "|" && parser.GetNext() === "|") {
    parser.i++;
    c = "∥";
  }
  let stretchy = top.getProperty("stretchy");
  if (!stretchy) {
    let node2 = parser.create("token", "mo", { stretchy: false, braketbar: true }, c);
    parser.Push(node2);
    return;
  }
  let node = parser.create("node", "TeXAtom", [], { texClass: TEXCLASS.CLOSE });
  parser.Push(node);
  top.setProperty("barcount", top.getProperty("barcount") + 1);
  node = parser.create("token", "mo", { stretchy: true, braketbar: true }, c);
  parser.Push(node);
  node = parser.create("node", "TeXAtom", [], { texClass: TEXCLASS.OPEN });
  parser.Push(node);
};
var BraketMethods_default = BraketMethods;

// node_modules/mathjax-full/ts/input/tex/braket/BraketMappings.ts
new CommandMap("Braket-macros", {
  bra: ["Macro", "{\\langle {#1} \\vert}", 1],
  ket: ["Macro", "{\\vert {#1} \\rangle}", 1],
  braket: ["Braket", "⟨", "⟩", false, Infinity],
  "set": ["Braket", "{", "}", false, 1],
  Bra: ["Macro", "{\\left\\langle {#1} \\right\\vert}", 1],
  Ket: ["Macro", "{\\left\\vert {#1} \\right\\rangle}", 1],
  Braket: ["Braket", "⟨", "⟩", true, Infinity],
  Set: ["Braket", "{", "}", true, 1],
  // Not part of the LaTeX package:
  ketbra: ["Macro", "{\\vert {#1} \\rangle\\langle {#2} \\vert}", 2],
  Ketbra: ["Macro", "{\\left\\vert {#1} \\right\\rangle\\left\\langle {#2} \\right\\vert}", 2],
  // Treatment of bar.
  "|": "Bar"
}, BraketMethods_default);
new MacroMap("Braket-characters", {
  "|": "Bar"
}, BraketMethods_default);

// node_modules/mathjax-full/ts/input/tex/braket/BraketConfiguration.ts
var BraketConfiguration = Configuration.create(
  "braket",
  {
    handler: {
      character: ["Braket-characters"],
      macro: ["Braket-macros"]
    },
    items: {
      [BraketItem.prototype.kind]: BraketItem
    }
  }
);

// node_modules/mathjax-full/ts/input/tex/enclose/EncloseConfiguration.ts
var ENCLOSE_OPTIONS = {
  "data-arrowhead": 1,
  color: 1,
  mathcolor: 1,
  background: 1,
  mathbackground: 1,
  "data-padding": 1,
  "data-thickness": 1
};
var EncloseMethods = {};
EncloseMethods.Enclose = function(parser, name) {
  let notation = parser.GetArgument(name).replace(/,/g, " ");
  const attr = parser.GetBrackets(name, "");
  const math = parser.ParseArg(name);
  const def = ParseUtil_default.keyvalOptions(attr, ENCLOSE_OPTIONS);
  def.notation = notation;
  parser.Push(parser.create("node", "menclose", [math], def));
};
new CommandMap("enclose", { enclose: "Enclose" }, EncloseMethods);
var EncloseConfiguration = Configuration.create(
  "enclose",
  { handler: { macro: ["enclose"] } }
);

// node_modules/mathjax-full/ts/input/tex/cancel/CancelConfiguration.ts
var CancelMethods = {};
CancelMethods.Cancel = function(parser, name, notation) {
  const attr = parser.GetBrackets(name, "");
  const math = parser.ParseArg(name);
  const def = ParseUtil_default.keyvalOptions(attr, ENCLOSE_OPTIONS);
  def["notation"] = notation;
  parser.Push(parser.create("node", "menclose", [math], def));
};
CancelMethods.CancelTo = function(parser, name) {
  const attr = parser.GetBrackets(name, "");
  let value = parser.ParseArg(name);
  const math = parser.ParseArg(name);
  const def = ParseUtil_default.keyvalOptions(attr, ENCLOSE_OPTIONS);
  def["notation"] = [
    TexConstant.Notation.UPDIAGONALSTRIKE,
    TexConstant.Notation.UPDIAGONALARROW,
    TexConstant.Notation.NORTHEASTARROW
  ].join(" ");
  value = parser.create(
    "node",
    "mpadded",
    [value],
    { depth: "-.1em", height: "+.1em", voffset: ".1em" }
  );
  parser.Push(parser.create(
    "node",
    "msup",
    [parser.create("node", "menclose", [math], def), value]
  ));
};
new CommandMap("cancel", {
  cancel: ["Cancel", TexConstant.Notation.UPDIAGONALSTRIKE],
  bcancel: ["Cancel", TexConstant.Notation.DOWNDIAGONALSTRIKE],
  xcancel: ["Cancel", TexConstant.Notation.UPDIAGONALSTRIKE + " " + TexConstant.Notation.DOWNDIAGONALSTRIKE],
  cancelto: "CancelTo"
}, CancelMethods);
var CancelConfiguration = Configuration.create(
  "cancel",
  { handler: { macro: ["cancel"] } }
);

// node_modules/mathjax-full/ts/input/tex/color/ColorMethods.ts
function padding(colorPadding) {
  const pad = `+${colorPadding}`;
  const unit = colorPadding.replace(/^.*?([a-z]*)$/, "$1");
  const pad2 = 2 * parseFloat(pad);
  return {
    width: `+${pad2}${unit}`,
    height: pad,
    depth: pad,
    lspace: colorPadding
  };
}
var ColorMethods = {};
ColorMethods.Color = function(parser, name) {
  const model = parser.GetBrackets(name, "");
  const colorDef = parser.GetArgument(name);
  const colorModel = parser.configuration.packageData.get("color").model;
  const color = colorModel.getColor(model, colorDef);
  const style = parser.itemFactory.create("style").setProperties({ styles: { mathcolor: color } });
  parser.stack.env["color"] = color;
  parser.Push(style);
};
ColorMethods.TextColor = function(parser, name) {
  const model = parser.GetBrackets(name, "");
  const colorDef = parser.GetArgument(name);
  const colorModel = parser.configuration.packageData.get("color").model;
  const color = colorModel.getColor(model, colorDef);
  const old = parser.stack.env["color"];
  parser.stack.env["color"] = color;
  const math = parser.ParseArg(name);
  if (old) {
    parser.stack.env["color"] = old;
  } else {
    delete parser.stack.env["color"];
  }
  const node = parser.create("node", "mstyle", [math], { mathcolor: color });
  parser.Push(node);
};
ColorMethods.DefineColor = function(parser, name) {
  const cname = parser.GetArgument(name);
  const model = parser.GetArgument(name);
  const def = parser.GetArgument(name);
  const colorModel = parser.configuration.packageData.get("color").model;
  colorModel.defineColor(model, cname, def);
};
ColorMethods.ColorBox = function(parser, name) {
  const cname = parser.GetArgument(name);
  const math = ParseUtil_default.internalMath(parser, parser.GetArgument(name));
  const colorModel = parser.configuration.packageData.get("color").model;
  const node = parser.create("node", "mpadded", math, {
    mathbackground: colorModel.getColor("named", cname)
  });
  NodeUtil_default.setProperties(node, padding(parser.options.color.padding));
  parser.Push(node);
};
ColorMethods.FColorBox = function(parser, name) {
  const fname = parser.GetArgument(name);
  const cname = parser.GetArgument(name);
  const math = ParseUtil_default.internalMath(parser, parser.GetArgument(name));
  const options2 = parser.options.color;
  const colorModel = parser.configuration.packageData.get("color").model;
  const node = parser.create("node", "mpadded", math, {
    mathbackground: colorModel.getColor("named", cname),
    style: `border: ${options2.borderWidth} solid ${colorModel.getColor("named", fname)}`
  });
  NodeUtil_default.setProperties(node, padding(options2.padding));
  parser.Push(node);
};

// node_modules/mathjax-full/ts/input/tex/color/ColorConstants.ts
var COLORS = /* @__PURE__ */ new Map([
  ["Apricot", "#FBB982"],
  ["Aquamarine", "#00B5BE"],
  ["Bittersweet", "#C04F17"],
  ["Black", "#221E1F"],
  ["Blue", "#2D2F92"],
  ["BlueGreen", "#00B3B8"],
  ["BlueViolet", "#473992"],
  ["BrickRed", "#B6321C"],
  ["Brown", "#792500"],
  ["BurntOrange", "#F7921D"],
  ["CadetBlue", "#74729A"],
  ["CarnationPink", "#F282B4"],
  ["Cerulean", "#00A2E3"],
  ["CornflowerBlue", "#41B0E4"],
  ["Cyan", "#00AEEF"],
  ["Dandelion", "#FDBC42"],
  ["DarkOrchid", "#A4538A"],
  ["Emerald", "#00A99D"],
  ["ForestGreen", "#009B55"],
  ["Fuchsia", "#8C368C"],
  ["Goldenrod", "#FFDF42"],
  ["Gray", "#949698"],
  ["Green", "#00A64F"],
  ["GreenYellow", "#DFE674"],
  ["JungleGreen", "#00A99A"],
  ["Lavender", "#F49EC4"],
  ["LimeGreen", "#8DC73E"],
  ["Magenta", "#EC008C"],
  ["Mahogany", "#A9341F"],
  ["Maroon", "#AF3235"],
  ["Melon", "#F89E7B"],
  ["MidnightBlue", "#006795"],
  ["Mulberry", "#A93C93"],
  ["NavyBlue", "#006EB8"],
  ["OliveGreen", "#3C8031"],
  ["Orange", "#F58137"],
  ["OrangeRed", "#ED135A"],
  ["Orchid", "#AF72B0"],
  ["Peach", "#F7965A"],
  ["Periwinkle", "#7977B8"],
  ["PineGreen", "#008B72"],
  ["Plum", "#92268F"],
  ["ProcessBlue", "#00B0F0"],
  ["Purple", "#99479B"],
  ["RawSienna", "#974006"],
  ["Red", "#ED1B23"],
  ["RedOrange", "#F26035"],
  ["RedViolet", "#A1246B"],
  ["Rhodamine", "#EF559F"],
  ["RoyalBlue", "#0071BC"],
  ["RoyalPurple", "#613F99"],
  ["RubineRed", "#ED017D"],
  ["Salmon", "#F69289"],
  ["SeaGreen", "#3FBC9D"],
  ["Sepia", "#671800"],
  ["SkyBlue", "#46C5DD"],
  ["SpringGreen", "#C6DC67"],
  ["Tan", "#DA9D76"],
  ["TealBlue", "#00AEB3"],
  ["Thistle", "#D883B7"],
  ["Turquoise", "#00B4CE"],
  ["Violet", "#58429B"],
  ["VioletRed", "#EF58A0"],
  ["White", "#FFFFFF"],
  ["WildStrawberry", "#EE2967"],
  ["Yellow", "#FFF200"],
  ["YellowGreen", "#98CC70"],
  ["YellowOrange", "#FAA21A"]
]);

// node_modules/mathjax-full/ts/input/tex/color/ColorUtil.ts
var ColorModelProcessors = /* @__PURE__ */ new Map();
var ColorModel = class {
  constructor() {
    /**
     * User defined colors.
     *
     * This variable is local to the parser, so two parsers in the same
     * JavaScript thread can have two different sets of user-defined colors.
     */
    this.userColors = /* @__PURE__ */ new Map();
  }
  /**
   * Converts a color model from string representation to its CSS format `#44ff00`
   *
   * @param {string} model The coloring model type: `rgb` `RGB` or `gray`.
   * @param {string} def The color definition: `0.5,0,1`, `128,0,255`, `0.5`.
   * @return {string} The color definition in CSS format e.g. `#44ff00`.
   */
  normalizeColor(model, def) {
    if (!model || model === "named") {
      return def;
    }
    if (ColorModelProcessors.has(model)) {
      const modelProcessor = ColorModelProcessors.get(model);
      return modelProcessor(def);
    }
    throw new TexError("UndefinedColorModel", "Color model '%1' not defined", model);
  }
  /**
   * Look up a color based on its model and definition.
   *
   * @param {string} model The coloring model type: `named`, `rgb` `RGB` or `gray`.
   * @param {string} def The color definition: `red, `0.5,0,1`, `128,0,255`, `0.5`.
   * @return {string} The color definition in CSS format e.g. `#44ff00`.
   */
  getColor(model, def) {
    if (!model || model === "named") {
      return this.getColorByName(def);
    }
    return this.normalizeColor(model, def);
  }
  /**
   * Get a named color.
   *
   * @param {string} name The color name e.g. `darkblue`.
   * @return {string} The color definition in CSS format e.g. `#44ff00`.
   *
   * To retain backward compatilbity with MathJax v2 this method returns
   * unknown as-is, this is useful for both passing through CSS format colors like `#ff0`,
   * or even standard CSS color names that this plugin is unaware of.
   *
   * In TeX format, this would help to let `\textcolor{#f80}{\text{Orange}}` show an
   * orange word.
   */
  getColorByName(name) {
    if (this.userColors.has(name)) {
      return this.userColors.get(name);
    }
    if (COLORS.has(name)) {
      return COLORS.get(name);
    }
    return name;
  }
  /**
   * Create a new user-defined color.
   *
   * This color is local to the parser, so another MathJax parser won't be poluted.
   *
   * @param {string} model The coloring model type: e.g. `rgb`, `RGB` or `gray`.
   * @param {string} name The color name: `darkblue`.
   * @param {string} def The color definition in the color model format: `128,0,255`.
   */
  defineColor(model, name, def) {
    const normalized = this.normalizeColor(model, def);
    this.userColors.set(name, normalized);
  }
};
ColorModelProcessors.set("rgb", function(rgb) {
  const rgbParts = rgb.trim().split(/\s*,\s*/);
  let RGB = "#";
  if (rgbParts.length !== 3) {
    throw new TexError("ModelArg1", "Color values for the %1 model require 3 numbers", "rgb");
  }
  for (const rgbPart of rgbParts) {
    if (!rgbPart.match(/^(\d+(\.\d*)?|\.\d+)$/)) {
      throw new TexError("InvalidDecimalNumber", "Invalid decimal number");
    }
    const n = parseFloat(rgbPart);
    if (n < 0 || n > 1) {
      throw new TexError(
        "ModelArg2",
        "Color values for the %1 model must be between %2 and %3",
        "rgb",
        "0",
        "1"
      );
    }
    let pn = Math.floor(n * 255).toString(16);
    if (pn.length < 2) {
      pn = "0" + pn;
    }
    RGB += pn;
  }
  return RGB;
});
ColorModelProcessors.set("RGB", function(rgb) {
  const rgbParts = rgb.trim().split(/\s*,\s*/);
  let RGB = "#";
  if (rgbParts.length !== 3) {
    throw new TexError("ModelArg1", "Color values for the %1 model require 3 numbers", "RGB");
  }
  for (const rgbPart of rgbParts) {
    if (!rgbPart.match(/^\d+$/)) {
      throw new TexError("InvalidNumber", "Invalid number");
    }
    const n = parseInt(rgbPart);
    if (n > 255) {
      throw new TexError(
        "ModelArg2",
        "Color values for the %1 model must be between %2 and %3",
        "RGB",
        "0",
        "255"
      );
    }
    let pn = n.toString(16);
    if (pn.length < 2) {
      pn = "0" + pn;
    }
    RGB += pn;
  }
  return RGB;
});
ColorModelProcessors.set("gray", function(gray) {
  if (!gray.match(/^\s*(\d+(\.\d*)?|\.\d+)\s*$/)) {
    throw new TexError("InvalidDecimalNumber", "Invalid decimal number");
  }
  const n = parseFloat(gray);
  if (n < 0 || n > 1) {
    throw new TexError(
      "ModelArg2",
      "Color values for the %1 model must be between %2 and %3",
      "gray",
      "0",
      "1"
    );
  }
  let pn = Math.floor(n * 255).toString(16);
  if (pn.length < 2) {
    pn = "0" + pn;
  }
  return `#${pn}${pn}${pn}`;
});

// node_modules/mathjax-full/ts/input/tex/color/ColorConfiguration.ts
new CommandMap("color", {
  color: "Color",
  textcolor: "TextColor",
  definecolor: "DefineColor",
  colorbox: "ColorBox",
  fcolorbox: "FColorBox"
}, ColorMethods);
var config = function(_config, jax) {
  jax.parseOptions.packageData.set("color", { model: new ColorModel() });
};
var ColorConfiguration = Configuration.create(
  "color",
  {
    handler: {
      macro: ["color"]
    },
    options: {
      color: {
        padding: "5px",
        borderWidth: "2px"
      }
    },
    config
  }
);

// node_modules/mathjax-full/ts/input/tex/newcommand/NewcommandUtil.ts
var NewcommandUtil;
((NewcommandUtil2) => {
  function disassembleSymbol(name, symbol) {
    let newArgs = [name, symbol.char];
    if (symbol.attributes) {
      for (let key in symbol.attributes) {
        newArgs.push(key);
        newArgs.push(symbol.attributes[key]);
      }
    }
    return newArgs;
  }
  NewcommandUtil2.disassembleSymbol = disassembleSymbol;
  function assembleSymbol(args) {
    let name = args[0];
    let char = args[1];
    let attrs = {};
    for (let i = 2; i < args.length; i = i + 2) {
      attrs[args[i]] = args[i + 1];
    }
    return new Symbol2(name, char, attrs);
  }
  NewcommandUtil2.assembleSymbol = assembleSymbol;
  function GetCSname(parser, cmd) {
    let c = parser.GetNext();
    if (c !== "\\") {
      throw new TexError(
        "MissingCS",
        "%1 must be followed by a control sequence",
        cmd
      );
    }
    let cs = ParseUtil_default.trimSpaces(parser.GetArgument(cmd));
    return cs.substr(1);
  }
  NewcommandUtil2.GetCSname = GetCSname;
  function GetCsNameArgument(parser, name) {
    let cs = ParseUtil_default.trimSpaces(parser.GetArgument(name));
    if (cs.charAt(0) === "\\") {
      cs = cs.substr(1);
    }
    if (!cs.match(/^(.|[a-z]+)$/i)) {
      throw new TexError(
        "IllegalControlSequenceName",
        "Illegal control sequence name for %1",
        name
      );
    }
    return cs;
  }
  NewcommandUtil2.GetCsNameArgument = GetCsNameArgument;
  function GetArgCount(parser, name) {
    let n = parser.GetBrackets(name);
    if (n) {
      n = ParseUtil_default.trimSpaces(n);
      if (!n.match(/^[0-9]+$/)) {
        throw new TexError(
          "IllegalParamNumber",
          "Illegal number of parameters specified in %1",
          name
        );
      }
    }
    return n;
  }
  NewcommandUtil2.GetArgCount = GetArgCount;
  function GetTemplate(parser, cmd, cs) {
    let c = parser.GetNext();
    let params = [];
    let n = 0;
    let i = parser.i;
    while (parser.i < parser.string.length) {
      c = parser.GetNext();
      if (c === "#") {
        if (i !== parser.i) {
          params[n] = parser.string.substr(i, parser.i - i);
        }
        c = parser.string.charAt(++parser.i);
        if (!c.match(/^[1-9]$/)) {
          throw new TexError(
            "CantUseHash2",
            "Illegal use of # in template for %1",
            cs
          );
        }
        if (parseInt(c) !== ++n) {
          throw new TexError(
            "SequentialParam",
            "Parameters for %1 must be numbered sequentially",
            cs
          );
        }
        i = parser.i + 1;
      } else if (c === "{") {
        if (i !== parser.i) {
          params[n] = parser.string.substr(i, parser.i - i);
        }
        if (params.length > 0) {
          return [n.toString()].concat(params);
        } else {
          return n;
        }
      }
      parser.i++;
    }
    throw new TexError(
      "MissingReplacementString",
      "Missing replacement string for definition of %1",
      cmd
    );
  }
  NewcommandUtil2.GetTemplate = GetTemplate;
  function GetParameter(parser, name, param) {
    if (param == null) {
      return parser.GetArgument(name);
    }
    let i = parser.i;
    let j = 0;
    let hasBraces = 0;
    while (parser.i < parser.string.length) {
      let c = parser.string.charAt(parser.i);
      if (c === "{") {
        if (parser.i === i) {
          hasBraces = 1;
        }
        parser.GetArgument(name);
        j = parser.i - i;
      } else if (MatchParam(parser, param)) {
        if (hasBraces) {
          i++;
          j -= 2;
        }
        return parser.string.substr(i, j);
      } else if (c === "\\") {
        parser.i++;
        j++;
        hasBraces = 0;
        let match = parser.string.substr(parser.i).match(/[a-z]+|./i);
        if (match) {
          parser.i += match[0].length;
          j = parser.i - i;
        }
      } else {
        parser.i++;
        j++;
        hasBraces = 0;
      }
    }
    throw new TexError("RunawayArgument", "Runaway argument for %1?", name);
  }
  NewcommandUtil2.GetParameter = GetParameter;
  function MatchParam(parser, param) {
    if (parser.string.substr(parser.i, param.length) !== param) {
      return 0;
    }
    if (param.match(/\\[a-z]+$/i) && parser.string.charAt(parser.i + param.length).match(/[a-z]/i)) {
      return 0;
    }
    parser.i += param.length;
    return 1;
  }
  NewcommandUtil2.MatchParam = MatchParam;
  function addDelimiter(parser, cs, char, attr) {
    const handlers = parser.configuration.handlers;
    const handler = handlers.retrieve(NewcommandUtil2.NEW_DELIMITER);
    handler.add(cs, new Symbol2(cs, char, attr));
  }
  NewcommandUtil2.addDelimiter = addDelimiter;
  function addMacro(parser, cs, func, attr, symbol = "") {
    const handlers = parser.configuration.handlers;
    const handler = handlers.retrieve(NewcommandUtil2.NEW_COMMAND);
    handler.add(cs, new Macro(symbol ? symbol : cs, func, attr));
  }
  NewcommandUtil2.addMacro = addMacro;
  function addEnvironment(parser, env, func, attr) {
    const handlers = parser.configuration.handlers;
    const handler = handlers.retrieve(NewcommandUtil2.NEW_ENVIRONMENT);
    handler.add(env, new Macro(env, func, attr));
  }
  NewcommandUtil2.addEnvironment = addEnvironment;
  NewcommandUtil2.NEW_DELIMITER = "new-Delimiter";
  NewcommandUtil2.NEW_COMMAND = "new-Command";
  NewcommandUtil2.NEW_ENVIRONMENT = "new-Environment";
})(NewcommandUtil || (NewcommandUtil = {}));
var NewcommandUtil_default = NewcommandUtil;

// node_modules/mathjax-full/ts/input/tex/newcommand/NewcommandMethods.ts
var NewcommandMethods = {};
NewcommandMethods.NewCommand = function(parser, name) {
  let cs = NewcommandUtil_default.GetCsNameArgument(parser, name);
  let n = NewcommandUtil_default.GetArgCount(parser, name);
  let opt = parser.GetBrackets(name);
  let def = parser.GetArgument(name);
  NewcommandUtil_default.addMacro(parser, cs, NewcommandMethods.Macro, [def, n, opt]);
};
NewcommandMethods.NewEnvironment = function(parser, name) {
  let env = ParseUtil_default.trimSpaces(parser.GetArgument(name));
  let n = NewcommandUtil_default.GetArgCount(parser, name);
  let opt = parser.GetBrackets(name);
  let bdef = parser.GetArgument(name);
  let edef = parser.GetArgument(name);
  NewcommandUtil_default.addEnvironment(parser, env, NewcommandMethods.BeginEnv, [true, bdef, edef, n, opt]);
};
NewcommandMethods.MacroDef = function(parser, name) {
  let cs = NewcommandUtil_default.GetCSname(parser, name);
  let params = NewcommandUtil_default.GetTemplate(parser, name, "\\" + cs);
  let def = parser.GetArgument(name);
  !(params instanceof Array) ? (
    // @test Def DoubleLet, DefReDef
    NewcommandUtil_default.addMacro(parser, cs, NewcommandMethods.Macro, [def, params])
  ) : (
    // @test Def Let
    NewcommandUtil_default.addMacro(parser, cs, NewcommandMethods.MacroWithTemplate, [def].concat(params))
  );
};
NewcommandMethods.Let = function(parser, name) {
  const cs = NewcommandUtil_default.GetCSname(parser, name);
  let c = parser.GetNext();
  if (c === "=") {
    parser.i++;
    c = parser.GetNext();
  }
  const handlers = parser.configuration.handlers;
  if (c === "\\") {
    name = NewcommandUtil_default.GetCSname(parser, name);
    let macro2 = handlers.get("delimiter").lookup("\\" + name);
    if (macro2) {
      NewcommandUtil_default.addDelimiter(parser, "\\" + cs, macro2.char, macro2.attributes);
      return;
    }
    const map = handlers.get("macro").applicable(name);
    if (!map) {
      return;
    }
    if (map instanceof MacroMap) {
      const macro3 = map.lookup(name);
      NewcommandUtil_default.addMacro(parser, cs, macro3.func, macro3.args, macro3.symbol);
      return;
    }
    macro2 = map.lookup(name);
    const newArgs = NewcommandUtil_default.disassembleSymbol(cs, macro2);
    const method = (p, _cs, ...rest) => {
      const symb = NewcommandUtil_default.assembleSymbol(rest);
      return map.parser(p, symb);
    };
    NewcommandUtil_default.addMacro(parser, cs, method, newArgs);
    return;
  }
  parser.i++;
  const macro = handlers.get("delimiter").lookup(c);
  if (macro) {
    NewcommandUtil_default.addDelimiter(parser, "\\" + cs, macro.char, macro.attributes);
    return;
  }
  NewcommandUtil_default.addMacro(parser, cs, NewcommandMethods.Macro, [c]);
};
NewcommandMethods.MacroWithTemplate = function(parser, name, text, n, ...params) {
  const argCount = parseInt(n, 10);
  if (argCount) {
    let args = [];
    parser.GetNext();
    if (params[0] && !NewcommandUtil_default.MatchParam(parser, params[0])) {
      throw new TexError(
        "MismatchUseDef",
        "Use of %1 doesn't match its definition",
        name
      );
    }
    for (let i = 0; i < argCount; i++) {
      args.push(NewcommandUtil_default.GetParameter(parser, name, params[i + 1]));
    }
    text = ParseUtil_default.substituteArgs(parser, args, text);
  }
  parser.string = ParseUtil_default.addArgs(
    parser,
    text,
    parser.string.slice(parser.i)
  );
  parser.i = 0;
  ParseUtil_default.checkMaxMacros(parser);
};
NewcommandMethods.BeginEnv = function(parser, begin, bdef, edef, n, def) {
  if (begin.getProperty("end") && parser.stack.env["closing"] === begin.getName()) {
    delete parser.stack.env["closing"];
    let rest = parser.string.slice(parser.i);
    parser.string = edef;
    parser.i = 0;
    parser.Parse();
    parser.string = rest;
    parser.i = 0;
    return parser.itemFactory.create("end").setProperty("name", begin.getName());
  }
  if (n) {
    let args = [];
    if (def != null) {
      let optional = parser.GetBrackets("\\begin{" + begin.getName() + "}");
      args.push(optional == null ? def : optional);
    }
    for (let i = args.length; i < n; i++) {
      args.push(parser.GetArgument("\\begin{" + begin.getName() + "}"));
    }
    bdef = ParseUtil_default.substituteArgs(parser, args, bdef);
    edef = ParseUtil_default.substituteArgs(parser, [], edef);
  }
  parser.string = ParseUtil_default.addArgs(
    parser,
    bdef,
    parser.string.slice(parser.i)
  );
  parser.i = 0;
  return parser.itemFactory.create("beginEnv").setProperty("name", begin.getName());
};
NewcommandMethods.Macro = BaseMethods_default.Macro;
var NewcommandMethods_default = NewcommandMethods;

// node_modules/mathjax-full/ts/input/tex/mathtools/MathtoolsUtil.ts
var MathtoolsUtil = {
  /**
   * Set the displaystyle and scriptlevel attributes of an mstyle element
   *
   * @param {MmlNode} mml     The mstyle node to modify.
   * @param {string} style    The TeX style macro to apply.
   */
  setDisplayLevel(mml, style) {
    if (!style) return;
    const [display, script2] = lookup(style, {
      "\\displaystyle": [true, 0],
      "\\textstyle": [false, 0],
      "\\scriptstyle": [false, 1],
      "\\scriptscriptstyle": [false, 2]
    }, [null, null]);
    if (display !== null) {
      mml.attributes.set("displaystyle", display);
      mml.attributes.set("scriptlevel", script2);
    }
  },
  /**
   * Check that the top stack item is an alignment table.
   *
   * @param {TexParser} parser   The current TeX parser.
   * @param {string} name        The name of the macro doing the checking.
   * @return {EqnArrayItem}      The top item (an EqnArrayItem).
   */
  checkAlignment(parser, name) {
    const top = parser.stack.Top();
    if (top.kind !== EqnArrayItem.prototype.kind) {
      throw new TexError("NotInAlignment", "%1 can only be used in aligment environments", name);
    }
    return top;
  },
  /**
   * Add a paired delimiter to the list of them.
   *
   * @param {ParseOptions} config   The parse options to modify.
   * @param {string} cs             The control sequence for the paired delimiters.
   * @param {string[]} args         The definition for the paired delimiters.  One of:
   *                                   [left, right]
   *                                   [left, right, body, argcount]
   *                                   [left, right, body, argcount, pre, post]
   */
  addPairedDelims(config2, cs, args) {
    const delims = config2.handlers.retrieve(PAIREDDELIMS);
    delims.add(cs, new Macro(cs, MathtoolsMethods.PairedDelimiters, args));
  },
  /**
   * Adjust the line spacing for a table.
   *
   * @param {MmlNode} mtable   The mtable node to adjust (if it is a table).
   * @param {string} spread    The dimension to change by (number-with-units).
   */
  spreadLines(mtable, spread) {
    if (!mtable.isKind("mtable")) return;
    let rowspacing = mtable.attributes.get("rowspacing");
    if (rowspacing) {
      const add = ParseUtil_default.dimen2em(spread);
      rowspacing = rowspacing.split(/ /).map((s) => ParseUtil_default.Em(Math.max(0, ParseUtil_default.dimen2em(s) + add))).join(" ");
    } else {
      rowspacing = spread;
    }
    mtable.attributes.set("rowspacing", rowspacing);
  },
  /**
   * Check if a string is a number and return it with an explicit plus if there isn't one.
   *
   * @param {string} name   The name of the macro doing the checking.
   * @param {string} n      The string to test as a number.
   * @return {srtring}      The number with an explicit sign.
   */
  plusOrMinus(name, n) {
    n = n.trim();
    if (!n.match(/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/)) {
      throw new TexError("NotANumber", "Argument to %1 is not a number", name);
    }
    return n.match(/^[-+]/) ? n : "+" + n;
  },
  /**
   * Parse a \prescript argument, with its associated format, if any.
   *
   * @param {TexParser} parser   The active tex parser.
   * @param {string} name        The name of the calling macro (\prescript).
   * @param {string} pos         The position for the argument (sub, sup, arg).
   * @return {MmlNode}           The parsed MML version of the argument.
   */
  getScript(parser, name, pos) {
    let arg = ParseUtil_default.trimSpaces(parser.GetArgument(name));
    if (arg === "") {
      return parser.create("node", "none");
    }
    const format = parser.options.mathtools[`prescript-${pos}-format`];
    format && (arg = `${format}{${arg}}`);
    return new TexParser(arg, parser.stack.env, parser.configuration).mml();
  }
};

// node_modules/mathjax-full/ts/input/tex/mathtools/MathtoolsMethods.ts
var MathtoolsMethods = {
  /**
   * Handle a mathtools matrix environment, with optional alignment.
   *
   * @param {TexParser} parser   The active tex parser.
   * @param {StackItem} begin    The BeginItem for the environment.
   * @param {string} open        The open delimiter for the matrix.
   * @param {string} close       The close delimiter for the matrix.
   * @return {ParserResult}      The ArrayItem for the matrix.
   */
  MtMatrix(parser, begin, open, close) {
    const align = parser.GetBrackets(`\\begin{${begin.getName()}}`, "c");
    return MathtoolsMethods.Array(parser, begin, open, close, align);
  },
  /**
   * Create a smallmatrix with given delimiters, and with optional alignment (and settable default)
   *
   * @param {TexParser} parser   The active tex parser.
   * @param {StackItem} begin    The BeginItem for the environment.
   * @param {string} open        The open delimiter for the matrix.
   * @param {string} close       The close delimiter for the matrix.
   * @param {string} align       The (optional) alignment.  If not given, use a bracket argument for it.
   * @return {ParseResult}       The ArrayItem for the matrix.
   */
  MtSmallMatrix(parser, begin, open, close, align) {
    if (!align) {
      align = parser.GetBrackets(`\\begin{${begin.getName()}}`, parser.options.mathtools["smallmatrix-align"]);
    }
    return MathtoolsMethods.Array(
      parser,
      begin,
      open,
      close,
      align,
      ParseUtil_default.Em(1 / 3),
      ".2em",
      "S",
      1
    );
  },
  /**
   * Create the multlined StackItem.
   *
   * @param {TexParser} parser   The active tex parser.
   * @param {StackItem} begin    The BeginItem for the environment.
   * @return {ParseResult}       The MultlinedItem.
   */
  MtMultlined(parser, begin) {
    const name = `\\begin{${begin.getName()}}`;
    let pos = parser.GetBrackets(name, parser.options.mathtools["multlined-pos"] || "c");
    let width = pos ? parser.GetBrackets(name, "") : "";
    if (pos && !pos.match(/^[cbt]$/)) {
      [width, pos] = [pos, width];
    }
    parser.Push(begin);
    const item = parser.itemFactory.create("multlined", parser, begin);
    item.arraydef = {
      displaystyle: true,
      rowspacing: ".5em",
      width: width || "auto",
      columnwidth: "100%"
    };
    return ParseUtil_default.setArrayAlign(item, pos || "c");
  },
  /**
   * Replacement for the AMS HandleShove that includes optional spacing values
   *
   * @param {TexParser} parser   The active tex parser.
   * @param {string} name        The name of the calling macro.
   * @param {string} shove       Which way to shove the result.
   */
  HandleShove(parser, name, shove) {
    let top = parser.stack.Top();
    if (top.kind !== "multline" && top.kind !== "multlined") {
      throw new TexError(
        "CommandInMultlined",
        "%1 can only appear within the multline or multlined environments",
        name
      );
    }
    if (top.Size()) {
      throw new TexError(
        "CommandAtTheBeginingOfLine",
        "%1 must come at the beginning of the line",
        name
      );
    }
    top.setProperty("shove", shove);
    let shift = parser.GetBrackets(name);
    let mml = parser.ParseArg(name);
    if (shift) {
      let mrow = parser.create("node", "mrow", []);
      let mspace = parser.create("node", "mspace", [], { width: shift });
      if (shove === "left") {
        mrow.appendChild(mspace);
        mrow.appendChild(mml);
      } else {
        mrow.appendChild(mml);
        mrow.appendChild(mspace);
      }
      mml = mrow;
    }
    parser.Push(mml);
  },
  /**
   * Handle the spreadlines environment.
   *
   * @param {TexParser} parser   The active tex parser.
   * @param {StackItem} begin    The BeginItem for the environment.
   */
  SpreadLines(parser, begin) {
    if (parser.stack.env.closing === begin.getName()) {
      delete parser.stack.env.closing;
      const top = parser.stack.Pop();
      const mml = top.toMml();
      const spread = top.getProperty("spread");
      if (mml.isInferred) {
        for (const child of NodeUtil_default.getChildren(mml)) {
          MathtoolsUtil.spreadLines(child, spread);
        }
      } else {
        MathtoolsUtil.spreadLines(mml, spread);
      }
      parser.Push(mml);
    } else {
      const spread = parser.GetDimen(`\\begin{${begin.getName()}}`);
      begin.setProperty("spread", spread);
      parser.Push(begin);
    }
  },
  /**
   * Implements the various cases environments.
   *
   * @param {TexParser} parser   The calling parser.
   * @param {StackItem} begin    The BeginItem for the environment.
   * @param {string} open        The open delimiter for the matrix.
   * @param {string} close       The close delimiter for the matrix.
   * @param {string} style       The style (D, T, S, SS) for the contents of the array
   * @return {ArrayItem}         The ArrayItem for the environment
   */
  Cases(parser, begin, open, close, style) {
    const array = parser.itemFactory.create("array").setProperty("casesEnv", begin.getName());
    array.arraydef = {
      rowspacing: ".2em",
      columnspacing: "1em",
      columnalign: "left"
    };
    if (style === "D") {
      array.arraydef.displaystyle = true;
    }
    array.setProperties({ open, close });
    parser.Push(begin);
    return array;
  },
  /**
   * Handle \mathrlap, \mathllap, \mathclap, and their cramped versions.
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   * @param {string} pos         The position (l, c, r) of the lapped content
   * @param {boolean} cramped    True if the style should be cramped
   */
  MathLap(parser, name, pos, cramped) {
    const style = parser.GetBrackets(name, "").trim();
    let mml = parser.create("node", "mstyle", [
      parser.create("node", "mpadded", [parser.ParseArg(name)], {
        width: 0,
        ...pos === "r" ? {} : { lspace: pos === "l" ? "-1width" : "-.5width" }
      })
    ], { "data-cramped": cramped });
    MathtoolsUtil.setDisplayLevel(mml, style);
    parser.Push(parser.create("node", "TeXAtom", [mml]));
  },
  /**
   * Implements \cramped.
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   */
  Cramped(parser, name) {
    const style = parser.GetBrackets(name, "").trim();
    const arg = parser.ParseArg(name);
    const mml = parser.create("node", "mstyle", [arg], { "data-cramped": true });
    MathtoolsUtil.setDisplayLevel(mml, style);
    parser.Push(mml);
  },
  /**
   * Implements \clap (and could do \llap and \rlap, where the contents are text mode).
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   * @param {string} pos         The position (l, c, r) of the lapped content
   */
  MtLap(parser, name, pos) {
    const content = ParseUtil_default.internalMath(parser, parser.GetArgument(name), 0);
    let mml = parser.create("node", "mpadded", content, { width: 0 });
    if (pos !== "r") {
      NodeUtil_default.setAttribute(mml, "lspace", pos === "l" ? "-1width" : "-.5width");
    }
    parser.Push(mml);
  },
  /**
   * Implements \mathmakebox.
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   */
  MathMakeBox(parser, name) {
    const width = parser.GetBrackets(name);
    const pos = parser.GetBrackets(name, "c");
    const mml = parser.create("node", "mpadded", [parser.ParseArg(name)]);
    if (width) {
      NodeUtil_default.setAttribute(mml, "width", width);
    }
    const align = lookup(pos, { c: "center", r: "right" }, "");
    if (align) {
      NodeUtil_default.setAttribute(mml, "data-align", align);
    }
    parser.Push(mml);
  },
  /**
   * Implements \mathmbox.
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   */
  MathMBox(parser, name) {
    parser.Push(parser.create("node", "mrow", [parser.ParseArg(name)]));
  },
  /**
   * Implements \underbacket and \overbracket.
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   */
  UnderOverBracket(parser, name) {
    const thickness = length2em(parser.GetBrackets(name, ".1em"), 0.1);
    const height = parser.GetBrackets(name, ".2em");
    const arg = parser.GetArgument(name);
    const [pos, accent, border] = name.charAt(1) === "o" ? ["over", "accent", "bottom"] : ["under", "accentunder", "top"];
    const t = em(thickness);
    const base = new TexParser(arg, parser.stack.env, parser.configuration).mml();
    const copy = new TexParser(arg, parser.stack.env, parser.configuration).mml();
    const script2 = parser.create("node", "mpadded", [
      parser.create("node", "mphantom", [copy])
    ], {
      style: `border: ${t} solid; border-${border}: none`,
      height,
      depth: 0
    });
    const node = ParseUtil_default.underOver(parser, base, script2, pos, true);
    const munderover = NodeUtil_default.getChildAt(NodeUtil_default.getChildAt(node, 0), 0);
    NodeUtil_default.setAttribute(munderover, accent, true);
    parser.Push(node);
  },
  /**
   * Implements \Aboxed.
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   */
  Aboxed(parser, name) {
    const top = MathtoolsUtil.checkAlignment(parser, name);
    if (top.row.length % 2 === 1) {
      top.row.push(parser.create("node", "mtd", []));
    }
    const arg = parser.GetArgument(name);
    const rest = parser.string.substr(parser.i);
    parser.string = arg + "&&\\endAboxed";
    parser.i = 0;
    const left = parser.GetUpTo(name, "&");
    const right = parser.GetUpTo(name, "&");
    parser.GetUpTo(name, "\\endAboxed");
    const tex = ParseUtil_default.substituteArgs(
      parser,
      [left, right],
      "\\rlap{\\boxed{#1{}#2}}\\kern.267em\\phantom{#1}&\\phantom{{}#2}\\kern.267em"
    );
    parser.string = tex + rest;
    parser.i = 0;
  },
  /**
   * Implements \ArrowBetweenLines.
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   */
  ArrowBetweenLines(parser, name) {
    const top = MathtoolsUtil.checkAlignment(parser, name);
    if (top.Size() || top.row.length) {
      throw new TexError("BetweenLines", "%1 must be on a row by itself", name);
    }
    const star = parser.GetStar();
    const symbol = parser.GetBrackets(name, "\\Updownarrow");
    if (star) {
      top.EndEntry();
      top.EndEntry();
    }
    const tex = star ? "\\quad" + symbol : symbol + "\\quad";
    const mml = new TexParser(tex, parser.stack.env, parser.configuration).mml();
    parser.Push(mml);
    top.EndEntry();
    top.EndRow();
  },
  /**
   * Implements \vdotswithin.
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   */
  VDotsWithin(parser, name) {
    const top = parser.stack.Top();
    const isFlush = top.getProperty("flushspaceabove") === top.table.length;
    const arg = "\\mmlToken{mi}{}" + parser.GetArgument(name) + "\\mmlToken{mi}{}";
    const base = new TexParser(arg, parser.stack.env, parser.configuration).mml();
    let mml = parser.create("node", "mpadded", [
      parser.create("node", "mpadded", [
        parser.create("node", "mo", [
          parser.create("text", "⋮")
        ])
      ], {
        width: 0,
        lspace: "-.5width",
        ...isFlush ? { height: "-.6em", voffset: "-.18em" } : {}
      }),
      parser.create("node", "mphantom", [base])
    ], {
      lspace: ".5width"
    });
    parser.Push(mml);
  },
  /**
   * Implements \shortvdotswithin.
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   */
  ShortVDotsWithin(parser, _name) {
    const top = parser.stack.Top();
    const star = parser.GetStar();
    MathtoolsMethods.FlushSpaceAbove(parser, "\\MTFlushSpaceAbove");
    !star && top.EndEntry();
    MathtoolsMethods.VDotsWithin(parser, "\\vdotswithin");
    star && top.EndEntry();
    MathtoolsMethods.FlushSpaceBelow(parser, "\\MTFlushSpaceBelow");
  },
  /**
   * Implements \MTFlushSpaceAbove.
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   */
  FlushSpaceAbove(parser, name) {
    const top = MathtoolsUtil.checkAlignment(parser, name);
    top.setProperty("flushspaceabove", top.table.length);
    top.addRowSpacing("-" + parser.options.mathtools["shortvdotsadjustabove"]);
  },
  /**
   * Implements \MTFlushSpaceBelow.
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   */
  FlushSpaceBelow(parser, name) {
    const top = MathtoolsUtil.checkAlignment(parser, name);
    top.Size() && top.EndEntry();
    top.EndRow();
    top.addRowSpacing("-" + parser.options.mathtools["shortvdotsadjustbelow"]);
  },
  /**
   * Implements a paired delimiter (e.g., from \DeclarePairedDelimiter).
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   * @param {string} open        The open delimiter.
   * @param {string} close       The close delimiter.
   * @param {string?} body       The body betweeen the delimiters.
   * @param {number?} n          The number of arguments to use for the body.
   * @param {string?} pre        The TeX to go before the open delimiter.
   * @param {string?} post       The TeX to go after the close delimiter.
   */
  PairedDelimiters(parser, name, open, close, body = "#1", n = 1, pre = "", post = "") {
    const star = parser.GetStar();
    const size = star ? "" : parser.GetBrackets(name);
    const [left, right] = star ? ["\\left", "\\right"] : size ? [size + "l", size + "r"] : ["", ""];
    const delim = star ? "\\middle" : size || "";
    if (n) {
      const args = [];
      for (let i = args.length; i < n; i++) {
        args.push(parser.GetArgument(name));
      }
      pre = ParseUtil_default.substituteArgs(parser, args, pre);
      body = ParseUtil_default.substituteArgs(parser, args, body);
      post = ParseUtil_default.substituteArgs(parser, args, post);
    }
    body = body.replace(/\\delimsize/g, delim);
    parser.string = [pre, left, open, body, right, close, post, parser.string.substr(parser.i)].reduce((s, part) => ParseUtil_default.addArgs(parser, s, part), "");
    parser.i = 0;
    ParseUtil_default.checkMaxMacros(parser);
  },
  /**
   * Implements \DeclarePairedDelimiter.
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   */
  DeclarePairedDelimiter(parser, name) {
    const cs = NewcommandUtil_default.GetCsNameArgument(parser, name);
    const open = parser.GetArgument(name);
    const close = parser.GetArgument(name);
    MathtoolsUtil.addPairedDelims(parser.configuration, cs, [open, close]);
  },
  /**
   * Implements \DeclarePairedDelimiterX.
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   */
  DeclarePairedDelimiterX(parser, name) {
    const cs = NewcommandUtil_default.GetCsNameArgument(parser, name);
    const n = NewcommandUtil_default.GetArgCount(parser, name);
    const open = parser.GetArgument(name);
    const close = parser.GetArgument(name);
    const body = parser.GetArgument(name);
    MathtoolsUtil.addPairedDelims(parser.configuration, cs, [open, close, body, n]);
  },
  /**
   * Implements \DeclarePairedDelimiterXPP.
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   */
  DeclarePairedDelimiterXPP(parser, name) {
    const cs = NewcommandUtil_default.GetCsNameArgument(parser, name);
    const n = NewcommandUtil_default.GetArgCount(parser, name);
    const pre = parser.GetArgument(name);
    const open = parser.GetArgument(name);
    const close = parser.GetArgument(name);
    const post = parser.GetArgument(name);
    const body = parser.GetArgument(name);
    MathtoolsUtil.addPairedDelims(parser.configuration, cs, [open, close, body, n, pre, post]);
  },
  /**
   * Implements \centeredcolon, \ordinarycolon, \MTThinColon.
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   * @param {boolean} center     True if colon should be centered
   * @param {boolean} force      True menas always center (don't use centercolon option).
   * @param {boolean} thin       True if this is a thin color (for \coloneqq, etc).
   */
  CenterColon(parser, _name, center, force = false, thin = false) {
    const options2 = parser.options.mathtools;
    let mml = parser.create("token", "mo", {}, ":");
    if (center && (options2["centercolon"] || force)) {
      const dy = options2["centercolon-offset"];
      mml = parser.create("node", "mpadded", [mml], {
        voffset: dy,
        height: `+${dy}`,
        depth: `-${dy}`,
        ...thin ? { width: options2["thincolon-dw"], lspace: options2["thincolon-dx"] } : {}
      });
    }
    parser.Push(mml);
  },
  /**
   * Implements \coloneqq and related macros.
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   * @param {string} tex         The tex string to use (if not using unicode versions or if there isn't one).
   * @param {string} unicode     The unicode character (if there is one).
   */
  Relation(parser, _name, tex, unicode) {
    const options2 = parser.options.mathtools;
    if (options2["use-unicode"] && unicode) {
      parser.Push(parser.create("token", "mo", { texClass: TEXCLASS.REL }, unicode));
    } else {
      tex = "\\mathrel{" + tex.replace(/:/g, "\\MTThinColon").replace(/-/g, "\\mathrel{-}") + "}";
      parser.string = ParseUtil_default.addArgs(parser, tex, parser.string.substr(parser.i));
      parser.i = 0;
    }
  },
  /**
   * Implements \ndownarrow and \nuparrow via a terrible hack (visual only, no chance of this working with SRE).
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   * @param {string} c           The base arrow for the slashed version
   * @param {string} dy          A vertical offset for the slash
   */
  NArrow(parser, _name, c, dy) {
    parser.Push(
      parser.create("node", "TeXAtom", [
        parser.create("token", "mtext", {}, c),
        parser.create("node", "mpadded", [
          parser.create("node", "mpadded", [
            parser.create("node", "menclose", [
              parser.create("node", "mspace", [], { height: ".2em", depth: 0, width: ".4em" })
            ], { notation: "updiagonalstrike", "data-thickness": ".05em", "data-padding": 0 })
          ], { width: 0, lspace: "-.5width", voffset: dy }),
          parser.create("node", "mphantom", [
            parser.create("token", "mtext", {}, c)
          ])
        ], { width: 0, lspace: "-.5width" })
      ], { texClass: TEXCLASS.REL })
    );
  },
  /**
   * Implements \splitfrac and \splitdfrac.
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   * @param {boolean} display    True if \splitdfrac.
   */
  SplitFrac(parser, name, display) {
    const num = parser.ParseArg(name);
    const den = parser.ParseArg(name);
    parser.Push(
      parser.create("node", "mstyle", [
        parser.create("node", "mfrac", [
          parser.create("node", "mstyle", [
            num,
            parser.create("token", "mi"),
            parser.create("token", "mspace", { width: "1em" })
            // no parameter for this in mathtools.  Should we add one?
          ], { scriptlevel: 0 }),
          parser.create("node", "mstyle", [
            parser.create("token", "mspace", { width: "1em" }),
            parser.create("token", "mi"),
            den
          ], { scriptlevel: 0 })
        ], { linethickness: 0, numalign: "left", denomalign: "right" })
      ], { displaystyle: display, scriptlevel: 0 })
    );
  },
  /**
   * Implements \xmathstrut.
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   */
  XMathStrut(parser, name) {
    let dd = parser.GetBrackets(name);
    let dh = parser.GetArgument(name);
    dh = MathtoolsUtil.plusOrMinus(name, dh);
    dd = MathtoolsUtil.plusOrMinus(name, dd || dh);
    parser.Push(
      parser.create("node", "TeXAtom", [
        parser.create("node", "mpadded", [
          parser.create("node", "mphantom", [
            parser.create("token", "mo", { stretchy: false }, "(")
          ])
        ], { width: 0, height: dh + "height", depth: dd + "depth" })
      ], { texClass: TEXCLASS.ORD })
    );
  },
  /**
   * Implements \prescript.
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   */
  Prescript(parser, name) {
    const sup = MathtoolsUtil.getScript(parser, name, "sup");
    const sub = MathtoolsUtil.getScript(parser, name, "sub");
    const base = MathtoolsUtil.getScript(parser, name, "arg");
    if (NodeUtil_default.isType(sup, "none") && NodeUtil_default.isType(sub, "none")) {
      parser.Push(base);
      return;
    }
    const mml = parser.create("node", "mmultiscripts", [base]);
    NodeUtil_default.getChildren(mml).push(null, null);
    NodeUtil_default.appendChildren(mml, [parser.create("node", "mprescripts"), sub, sup]);
    mml.setProperty("fixPrescript", true);
    parser.Push(mml);
  },
  /**
   * Implements \newtagform and \renewtagform.
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   * @param {boolean=} renew     True if \renewtagform.
   */
  NewTagForm(parser, name, renew = false) {
    const tags = parser.tags;
    if (!("mtFormats" in tags)) {
      throw new TexError("TagsNotMT", "%1 can only be used with ams or mathtools tags", name);
    }
    const id = parser.GetArgument(name).trim();
    if (!id) {
      throw new TexError("InvalidTagFormID", "Tag form name can't be empty");
    }
    const format = parser.GetBrackets(name, "");
    const left = parser.GetArgument(name);
    const right = parser.GetArgument(name);
    if (!renew && tags.mtFormats.has(id)) {
      throw new TexError("DuplicateTagForm", "Duplicate tag form: %1", id);
    }
    tags.mtFormats.set(id, [left, right, format]);
  },
  /**
   * Implements \usetagform.
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   */
  UseTagForm(parser, name) {
    const tags = parser.tags;
    if (!("mtFormats" in tags)) {
      throw new TexError("TagsNotMT", "%1 can only be used with ams or mathtools tags", name);
    }
    const id = parser.GetArgument(name).trim();
    if (!id) {
      tags.mtCurrent = null;
      return;
    }
    if (!tags.mtFormats.has(id)) {
      throw new TexError("UndefinedTagForm", "Undefined tag form: %1", id);
    }
    tags.mtCurrent = tags.mtFormats.get(id);
  },
  /**
   * Implements \mathtoolsset.
   *
   * @param {TexParser} parser   The calling parser.
   * @param {string} name        The macro name.
   */
  SetOptions(parser, name) {
    const options2 = parser.options.mathtools;
    if (!options2["allow-mathtoolsset"]) {
      throw new TexError("ForbiddenMathtoolsSet", "%1 is disabled", name);
    }
    const allowed = {};
    Object.keys(options2).forEach((id) => {
      if (id !== "pariedDelimiters" && id !== "tagforms" && id !== "allow-mathtoolsset") {
        allowed[id] = 1;
      }
    });
    const args = parser.GetArgument(name);
    const keys = ParseUtil_default.keyvalOptions(args, allowed, true);
    for (const id of Object.keys(keys)) {
      options2[id] = keys[id];
    }
  },
  /**
   * Use the Base or AMS methods for these
   */
  Array: BaseMethods_default.Array,
  Macro: BaseMethods_default.Macro,
  xArrow: AmsMethods.xArrow,
  HandleRef: AmsMethods.HandleRef,
  AmsEqnArray: AmsMethods.AmsEqnArray,
  MacroWithTemplate: NewcommandMethods_default.MacroWithTemplate
};

// node_modules/mathjax-full/ts/input/tex/mathtools/MathtoolsMappings.ts
new CommandMap("mathtools-macros", {
  shoveleft: ["HandleShove", TexConstant.Align.LEFT],
  // override AMS version
  shoveright: ["HandleShove", TexConstant.Align.RIGHT],
  // override AMS version
  xleftrightarrow: ["xArrow", 8596, 10, 10],
  xLeftarrow: ["xArrow", 8656, 12, 7],
  xRightarrow: ["xArrow", 8658, 7, 12],
  xLeftrightarrow: ["xArrow", 8660, 12, 12],
  xhookleftarrow: ["xArrow", 8617, 10, 5],
  xhookrightarrow: ["xArrow", 8618, 5, 10],
  xmapsto: ["xArrow", 8614, 10, 10],
  xrightharpoondown: ["xArrow", 8641, 5, 10],
  xleftharpoondown: ["xArrow", 8637, 10, 5],
  xrightleftharpoons: ["xArrow", 8652, 10, 10],
  xrightharpoonup: ["xArrow", 8640, 5, 10],
  xleftharpoonup: ["xArrow", 8636, 10, 5],
  xleftrightharpoons: ["xArrow", 8651, 10, 10],
  mathllap: ["MathLap", "l", false],
  mathrlap: ["MathLap", "r", false],
  mathclap: ["MathLap", "c", false],
  clap: ["MtLap", "c"],
  textllap: ["MtLap", "l"],
  textrlap: ["MtLap", "r"],
  textclap: ["MtLap", "c"],
  cramped: "Cramped",
  crampedllap: ["MathLap", "l", true],
  crampedrlap: ["MathLap", "r", true],
  crampedclap: ["MathLap", "c", true],
  crampedsubstack: ["Macro", "\\begin{crampedsubarray}{c}#1\\end{crampedsubarray}", 1],
  mathmbox: "MathMBox",
  mathmakebox: "MathMakeBox",
  overbracket: "UnderOverBracket",
  underbracket: "UnderOverBracket",
  refeq: "HandleRef",
  MoveEqLeft: ["Macro", "\\hspace{#1em}&\\hspace{-#1em}", 1, "2"],
  Aboxed: "Aboxed",
  ArrowBetweenLines: "ArrowBetweenLines",
  vdotswithin: "VDotsWithin",
  shortvdotswithin: "ShortVDotsWithin",
  MTFlushSpaceAbove: "FlushSpaceAbove",
  MTFlushSpaceBelow: "FlushSpaceBelow",
  DeclarePairedDelimiter: "DeclarePairedDelimiter",
  DeclarePairedDelimiterX: "DeclarePairedDelimiterX",
  DeclarePairedDelimiterXPP: "DeclarePairedDelimiterXPP",
  //
  //  Typos from initial release -- kept for backward compatibility for now
  //
  DeclarePairedDelimiters: "DeclarePairedDelimiter",
  DeclarePairedDelimitersX: "DeclarePairedDelimiterX",
  DeclarePairedDelimitersXPP: "DeclarePairedDelimiterXPP",
  centercolon: ["CenterColon", true, true],
  ordinarycolon: ["CenterColon", false],
  MTThinColon: ["CenterColon", true, true, true],
  coloneqq: ["Relation", ":=", "≔"],
  Coloneqq: ["Relation", "::=", "⩴"],
  coloneq: ["Relation", ":-"],
  Coloneq: ["Relation", "::-"],
  eqqcolon: ["Relation", "=:", "≕"],
  Eqqcolon: ["Relation", "=::"],
  eqcolon: ["Relation", "-:", "∹"],
  Eqcolon: ["Relation", "-::"],
  colonapprox: ["Relation", ":\\approx"],
  Colonapprox: ["Relation", "::\\approx"],
  colonsim: ["Relation", ":\\sim"],
  Colonsim: ["Relation", "::\\sim"],
  dblcolon: ["Relation", "::", "∷"],
  nuparrow: ["NArrow", "↑", ".06em"],
  ndownarrow: ["NArrow", "↓", ".25em"],
  bigtimes: ["Macro", "\\mathop{\\Large\\kern-.1em\\boldsymbol{\\times}\\kern-.1em}"],
  splitfrac: ["SplitFrac", false],
  splitdfrac: ["SplitFrac", true],
  xmathstrut: "XMathStrut",
  prescript: "Prescript",
  newtagform: ["NewTagForm", false],
  renewtagform: ["NewTagForm", true],
  usetagform: "UseTagForm",
  adjustlimits: [
    "MacroWithTemplate",
    "\\mathop{{#1}\\vphantom{{#3}}}_{{#2}\\vphantom{{#4}}}\\mathop{{#3}\\vphantom{{#1}}}_{{#4}\\vphantom{{#2}}}",
    4,
    ,
    "_",
    ,
    "_"
  ],
  mathtoolsset: "SetOptions"
}, MathtoolsMethods);
new EnvironmentMap("mathtools-environments", ParseMethods_default.environment, {
  dcases: ["Array", null, "\\{", "", "ll", null, ".2em", "D"],
  rcases: ["Array", null, "", "\\}", "ll", null, ".2em"],
  drcases: ["Array", null, "", "\\}", "ll", null, ".2em", "D"],
  "dcases*": ["Cases", null, "{", "", "D"],
  "rcases*": ["Cases", null, "", "}"],
  "drcases*": ["Cases", null, "", "}", "D"],
  "cases*": ["Cases", null, "{", ""],
  "matrix*": ["MtMatrix", null, null, null],
  "pmatrix*": ["MtMatrix", null, "(", ")"],
  "bmatrix*": ["MtMatrix", null, "[", "]"],
  "Bmatrix*": ["MtMatrix", null, "\\{", "\\}"],
  "vmatrix*": ["MtMatrix", null, "\\vert", "\\vert"],
  "Vmatrix*": ["MtMatrix", null, "\\Vert", "\\Vert"],
  "smallmatrix*": ["MtSmallMatrix", null, null, null],
  psmallmatrix: ["MtSmallMatrix", null, "(", ")", "c"],
  "psmallmatrix*": ["MtSmallMatrix", null, "(", ")"],
  bsmallmatrix: ["MtSmallMatrix", null, "[", "]", "c"],
  "bsmallmatrix*": ["MtSmallMatrix", null, "[", "]"],
  Bsmallmatrix: ["MtSmallMatrix", null, "\\{", "\\}", "c"],
  "Bsmallmatrix*": ["MtSmallMatrix", null, "\\{", "\\}"],
  vsmallmatrix: ["MtSmallMatrix", null, "\\vert", "\\vert", "c"],
  "vsmallmatrix*": ["MtSmallMatrix", null, "\\vert", "\\vert"],
  Vsmallmatrix: ["MtSmallMatrix", null, "\\Vert", "\\Vert", "c"],
  "Vsmallmatrix*": ["MtSmallMatrix", null, "\\Vert", "\\Vert"],
  crampedsubarray: ["Array", null, null, null, null, "0em", "0.1em", "S'", 1],
  multlined: "MtMultlined",
  spreadlines: ["SpreadLines", true],
  lgathered: ["AmsEqnArray", null, null, null, "l", null, ".5em", "D"],
  rgathered: ["AmsEqnArray", null, null, null, "r", null, ".5em", "D"]
}, MathtoolsMethods);
new DelimiterMap("mathtools-delimiters", ParseMethods_default.delimiter, {
  "\\lparen": "(",
  "\\rparen": ")"
});
new CommandMap("mathtools-characters", {
  ":": ["CenterColon", true]
}, MathtoolsMethods);

// node_modules/mathjax-full/ts/input/tex/mathtools/MathtoolsTags.ts
var tagID = 0;
function MathtoolsTagFormat(config2, jax) {
  const tags = jax.parseOptions.options.tags;
  if (tags !== "base" && config2.tags.hasOwnProperty(tags)) {
    TagsFactory.add(tags, config2.tags[tags]);
  }
  const TagClass = TagsFactory.create(jax.parseOptions.options.tags).constructor;
  class TagFormat extends TagClass {
    /**
     * @override
     * @constructor
     */
    constructor() {
      super();
      /**
       * The defined tag formats
       */
      this.mtFormats = /* @__PURE__ */ new Map();
      /**
       * The format currently in use ([left, right, format]), or null for using the default
       */
      this.mtCurrent = null;
      const forms = jax.parseOptions.options.mathtools.tagforms;
      for (const form of Object.keys(forms)) {
        if (!Array.isArray(forms[form]) || forms[form].length !== 3) {
          throw new TexError(
            "InvalidTagFormDef",
            'The tag form definition for "%1" should be an array fo three strings',
            form
          );
        }
        this.mtFormats.set(form, forms[form]);
      }
    }
    /**
     * @override
     */
    formatTag(tag) {
      if (this.mtCurrent) {
        const [left, right, format] = this.mtCurrent;
        return format ? `${left}${format}{${tag}}${right}` : `${left}${tag}${right}`;
      }
      return super.formatTag(tag);
    }
  }
  tagID++;
  const tagName = "MathtoolsTags-" + tagID;
  TagsFactory.add(tagName, TagFormat);
  jax.parseOptions.options.tags = tagName;
}

// node_modules/mathjax-full/ts/input/tex/mathtools/MathtoolsItems.ts
var MultlinedItem = class extends MultlineItem {
  /**
   * @override
   */
  get kind() {
    return "multlined";
  }
  /**
   * @override
   */
  EndTable() {
    if (this.Size() || this.row.length) {
      this.EndEntry();
      this.EndRow();
    }
    if (this.table.length > 1) {
      const options2 = this.factory.configuration.options.mathtools;
      const gap = options2.multlinegap;
      const firstskip = options2["firstline-afterskip"] || gap;
      const lastskip = options2["lastline-preskip"] || gap;
      const first = NodeUtil_default.getChildren(this.table[0])[0];
      if (NodeUtil_default.getAttribute(first, "columnalign") !== TexConstant.Align.RIGHT) {
        first.appendChild(this.create("node", "mspace", [], { width: firstskip }));
      }
      const last = NodeUtil_default.getChildren(this.table[this.table.length - 1])[0];
      if (NodeUtil_default.getAttribute(last, "columnalign") !== TexConstant.Align.LEFT) {
        const top = NodeUtil_default.getChildren(last)[0];
        top.childNodes.unshift(null);
        const space = this.create("node", "mspace", [], { width: lastskip });
        NodeUtil_default.setChild(top, 0, space);
      }
    }
    super.EndTable.call(this);
  }
};

// node_modules/mathjax-full/ts/input/tex/mathtools/MathtoolsConfiguration.ts
var PAIREDDELIMS = "mathtools-paired-delims";
function initMathtools(config2) {
  new CommandMap(PAIREDDELIMS, {}, {});
  config2.append(Configuration.local({ handler: { macro: [PAIREDDELIMS] }, priority: -5 }));
}
function configMathtools(config2, jax) {
  const parser = jax.parseOptions;
  const pairedDelims = parser.options.mathtools.pairedDelimiters;
  for (const cs of Object.keys(pairedDelims)) {
    MathtoolsUtil.addPairedDelims(parser, cs, pairedDelims[cs]);
  }
  MathtoolsTagFormat(config2, jax);
}
function fixPrescripts({ data }) {
  for (const node of data.getList("mmultiscripts")) {
    if (!node.getProperty("fixPrescript")) continue;
    const childNodes = NodeUtil_default.getChildren(node);
    let n = 0;
    for (const i of [1, 2]) {
      if (!childNodes[i]) {
        NodeUtil_default.setChild(node, i, data.nodeFactory.create("node", "none"));
        n++;
      }
    }
    for (const i of [4, 5]) {
      if (NodeUtil_default.isType(childNodes[i], "mrow") && NodeUtil_default.getChildren(childNodes[i]).length === 0) {
        NodeUtil_default.setChild(node, i, data.nodeFactory.create("node", "none"));
      }
    }
    if (n === 2) {
      childNodes.splice(1, 2);
    }
  }
}
var MathtoolsConfiguration = Configuration.create(
  "mathtools",
  {
    handler: {
      macro: ["mathtools-macros", "mathtools-delimiters"],
      environment: ["mathtools-environments"],
      delimiter: ["mathtools-delimiters"],
      character: ["mathtools-characters"]
    },
    items: {
      [MultlinedItem.prototype.kind]: MultlinedItem
    },
    init: initMathtools,
    config: configMathtools,
    postprocessors: [[fixPrescripts, -6]],
    options: {
      mathtools: {
        "multlinegap": "1em",
        // horizontal space for multlined environments
        "multlined-pos": "c",
        // default alignment for multlined environments
        "firstline-afterskip": "",
        // space for first line of multlined (overrides multlinegap)
        "lastline-preskip": "",
        // space for last line of multlined (overrides multlinegap)
        "smallmatrix-align": "c",
        // default alignment for smallmatrix environments
        "shortvdotsadjustabove": ".2em",
        // space to remove above \shortvdots
        "shortvdotsadjustbelow": ".2em",
        // space to remove below \shortvdots
        "centercolon": false,
        // true to have colon automatically centered
        "centercolon-offset": ".04em",
        // vertical adjustment for centered colons
        "thincolon-dx": "-.04em",
        // horizontal adjustment for thin colons (e.g., \coloneqq)
        "thincolon-dw": "-.08em",
        // width adjustment for thin colons
        "use-unicode": false,
        // true to use unicode characters rather than multi-character
        //   version for \coloneqq, etc., when possible
        "prescript-sub-format": "",
        // format for \prescript subscript
        "prescript-sup-format": "",
        // format for \prescript superscript
        "prescript-arg-format": "",
        // format for \prescript base
        "allow-mathtoolsset": true,
        // true to allow \mathtoolsset to change settings
        pairedDelimiters: expandable({}),
        // predefined paired delimiters
        //     name: [left, right, body, argcount, pre, post]
        tagforms: expandable({})
        // tag form definitions
        //     name: [left, right, format]
      }
    }
  }
);

// node_modules/mathjax-full/ts/input/tex/newcommand/NewcommandItems.ts
var BeginEnvItem = class extends BaseItem {
  /**
   * @override
   */
  get kind() {
    return "beginEnv";
  }
  /**
   * @override
   */
  get isOpen() {
    return true;
  }
  /**
   * @override
   */
  checkItem(item) {
    if (item.isKind("end")) {
      if (item.getName() !== this.getName()) {
        throw new TexError(
          "EnvBadEnd",
          "\\begin{%1} ended with \\end{%2}",
          this.getName(),
          item.getName()
        );
      }
      return [[this.factory.create("mml", this.toMml())], true];
    }
    if (item.isKind("stop")) {
      throw new TexError("EnvMissingEnd", "Missing \\end{%1}", this.getName());
    }
    return super.checkItem(item);
  }
};

// node_modules/mathjax-full/ts/input/tex/newcommand/NewcommandMappings.ts
new CommandMap("Newcommand-macros", {
  newcommand: "NewCommand",
  renewcommand: "NewCommand",
  newenvironment: "NewEnvironment",
  renewenvironment: "NewEnvironment",
  def: "MacroDef",
  "let": "Let"
}, NewcommandMethods_default);

// node_modules/mathjax-full/ts/input/tex/newcommand/NewcommandConfiguration.ts
var init2 = function(config2) {
  new DelimiterMap(
    NewcommandUtil_default.NEW_DELIMITER,
    ParseMethods_default.delimiter,
    {}
  );
  new CommandMap(NewcommandUtil_default.NEW_COMMAND, {}, {});
  new EnvironmentMap(
    NewcommandUtil_default.NEW_ENVIRONMENT,
    ParseMethods_default.environment,
    {},
    {}
  );
  config2.append(Configuration.local(
    {
      handler: {
        character: [],
        delimiter: [NewcommandUtil_default.NEW_DELIMITER],
        macro: [
          NewcommandUtil_default.NEW_DELIMITER,
          NewcommandUtil_default.NEW_COMMAND
        ],
        environment: [NewcommandUtil_default.NEW_ENVIRONMENT]
      },
      priority: -1
    }
  ));
};
var NewcommandConfiguration = Configuration.create(
  "newcommand",
  {
    handler: {
      macro: ["Newcommand-macros"]
    },
    items: {
      [BeginEnvItem.prototype.kind]: BeginEnvItem
    },
    options: { maxMacros: 1e3 },
    init: init2
  }
);

// node_modules/mathjax-full/ts/input/tex/StackItemFactory.ts
var DummyItem = class extends BaseItem {
};
var StackItemFactory = class extends AbstractFactory {
  constructor() {
    super(...arguments);
    /**
     * @override
     */
    this.defaultKind = "dummy";
    /**
     * The parser configuration.
     * @type {ParseOptions}
     */
    this.configuration = null;
  }
  static {
    /**
     * @override
     */
    this.DefaultStackItems = {
      [DummyItem.prototype.kind]: DummyItem
    };
  }
};

// node_modules/mathjax-full/ts/input/tex/ParseOptions.ts
var ParseOptions = class {
  /**
   * @constructor
   * @param {Configuration} configuration Configuration object of the current
   *     TeX parser.
   * @param {OptionList[]} options   [TeX options, Tag options, {packages}]
   */
  constructor(configuration, options2 = []) {
    /**
     * A set of options, mapping names to string or boolean values.
     * @type {OptionList}
     */
    this.options = {};
    /**
     * Storage area for parser-specific package data (indexed by package name)
     * @type {Map<string, any>}
     */
    this.packageData = /* @__PURE__ */ new Map();
    // Fields for ephemeral options, i.e., options that will be cleared for each
    // run of the parser.
    /**
     * Stack of previous tex parsers. This is used to keep track of parser
     * settings when expressions are recursively parsed.
     * @type {TexParser[]}
     */
    this.parsers = [];
    /**
     * The current root node.
     * @type {MmlNode}
     */
    this.root = null;
    /**
     * List of node lists saved with respect to some property or their kind.
     * @type {{[key: string]: MmlNode[]}}
     */
    this.nodeLists = {};
    /**
     * Error state of the parser.
     * @type {boolean}
     */
    this.error = false;
    this.handlers = configuration.handlers;
    this.nodeFactory = new NodeFactory();
    this.nodeFactory.configuration = this;
    this.nodeFactory.setCreators(configuration.nodes);
    this.itemFactory = new StackItemFactory(configuration.items);
    this.itemFactory.configuration = this;
    defaultOptions(this.options, ...options2);
    defaultOptions(this.options, configuration.options);
  }
  // Methods for dealing with ephemeral fields.
  /**
   * Pushes a new tex parser onto the stack.
   * @param {TexParser} parser The new parser.
   */
  pushParser(parser) {
    this.parsers.unshift(parser);
  }
  /**
   * Pops a parser of the tex parser stack.
   */
  popParser() {
    this.parsers.shift();
  }
  /**
   * @return {TexParser} The currently active tex parser.
   */
  get parser() {
    return this.parsers[0];
  }
  /**
   * Clears all the ephemeral options.
   */
  clear() {
    this.parsers = [];
    this.root = null;
    this.nodeLists = {};
    this.error = false;
    this.tags.resetTag();
  }
  /**
   * Saves a tree node to a list of nodes for post processing.
   * @param {string} property The property name that will be used for
   *     postprocessing.
   * @param {MmlNode} node The node to save.
   */
  addNode(property, node) {
    let list = this.nodeLists[property];
    if (!list) {
      list = this.nodeLists[property] = [];
    }
    list.push(node);
    if (node.kind !== property) {
      const inlists = NodeUtil_default.getProperty(node, "in-lists") || "";
      const lists = (inlists ? inlists.split(/,/) : []).concat(property).join(",");
      NodeUtil_default.setProperty(node, "in-lists", lists);
    }
  }
  /**
   * Gets a saved node list with respect to a given property. It first ensures
   * that all the nodes are "live", i.e., actually live in the current
   * tree. Sometimes nodes are created, saved in the node list but discarded
   * later in the parsing. These will be filtered out here.
   *
   * NB: Do not use this method before the root field of the options is
   * set. Otherwise, your node list will always be empty!
   * @param {string} property The property for which to retrieve the node list.
   */
  getList(property) {
    let list = this.nodeLists[property] || [];
    let result = [];
    for (let node of list) {
      if (this.inTree(node)) {
        result.push(node);
      }
    }
    this.nodeLists[property] = result;
    return result;
  }
  /**
   * Remove a list of nodes from a saved list (e.g., when a filter removes the
   * node from the DOM, like for munderover => munder).
   *
   * @param {string} property The property from which to remove nodes.
   * @param {MmlNode[]} nodes The nodes to remove.
   */
  removeFromList(property, nodes) {
    const list = this.nodeLists[property] || [];
    for (const node of nodes) {
      const i = list.indexOf(node);
      if (i >= 0) {
        list.splice(i, 1);
      }
    }
  }
  /**
   * Tests if the node is in the tree spanned by the current root node.
   * @param {MmlNode} node The node to test.
   */
  inTree(node) {
    while (node && node !== this.root) {
      node = node.parent;
    }
    return !!node;
  }
};

// node_modules/mathjax-full/ts/input/tex/textmacros/TextParser.ts
var TextParser = class _TextParser extends TexParser {
  /**
   * Short-hand for obtaining the saved TexParser
   */
  get texParser() {
    return this.configuration.packageData.get("textmacros").texParser;
  }
  /**
   * @override
   */
  get tags() {
    return this.texParser.tags;
  }
  /**
   * @override
   * @constructor
   */
  constructor(text, env, configuration, level) {
    super(text, env, configuration);
    this.level = level;
  }
  /**
   * Make sure we only return one element (wrap multiple ones in an mrow or mstyle, as needed).
   *
   * @override
   */
  mml() {
    return this.level != null ? this.create("node", "mstyle", this.nodes, { displaystyle: false, scriptlevel: this.level }) : this.nodes.length === 1 ? this.nodes[0] : this.create("node", "mrow", this.nodes);
  }
  /**
   * @override
   */
  Parse() {
    this.text = "";
    this.nodes = [];
    this.envStack = [];
    super.Parse();
  }
  /**
   * Creates an mtext element for the saved text and pushes that onto the node list
   */
  saveText() {
    if (this.text) {
      const mathvariant = this.stack.env.mathvariant;
      const text = ParseUtil_default.internalText(this, this.text, mathvariant ? { mathvariant } : {});
      this.text = "";
      this.Push(text);
    }
  }
  /**
   * @override
   */
  Push(mml) {
    if (this.text) {
      this.saveText();
    }
    if (mml instanceof StopItem) {
      return super.Push(mml);
    }
    if (mml instanceof StyleItem) {
      this.stack.env.mathcolor = this.stack.env.color;
      return;
    }
    if (mml instanceof AbstractMmlNode) {
      this.addAttributes(mml);
      this.nodes.push(mml);
    }
  }
  /**
   * Push some math into the node list, adding mathsize and mathcolor
   *   if specified in the environment.
   *
   * @param {MmlNode} mml   The math nodes to push
   */
  PushMath(mml) {
    const env = this.stack.env;
    if (!mml.isKind("TeXAtom")) {
      mml = this.create("node", "TeXAtom", [mml]);
    }
    for (const name of ["mathsize", "mathcolor"]) {
      if (env[name] && !mml.attributes.getExplicit(name)) {
        if (!mml.isToken && !mml.isKind("mstyle")) {
          mml = this.create("node", "mstyle", [mml]);
        }
        NodeUtil_default.setAttribute(mml, name, env[name]);
      }
    }
    if (mml.isInferred) {
      mml = this.create("node", "mrow", mml.childNodes);
    }
    this.nodes.push(mml);
  }
  /**
   * Add mathsize, mathcolor, and mathvariant to token nodes,
   *   if they are specified in the environment
   *
   * @param {MmlNode} mml   The node to adjust
   */
  addAttributes(mml) {
    const env = this.stack.env;
    if (!mml.isToken) return;
    for (const name of ["mathsize", "mathcolor", "mathvariant"]) {
      if (env[name] && !mml.attributes.getExplicit(name)) {
        NodeUtil_default.setAttribute(mml, name, env[name]);
      }
    }
  }
  /**
   * Process the argument as text with the given environment settings
   *
   * @param {string} name   The macro that is calling for a parameter
   * @param {EnvList} env   The environment to use
   */
  ParseTextArg(name, env) {
    const text = this.GetArgument(name);
    env = Object.assign(Object.assign({}, this.stack.env), env);
    return new _TextParser(text, env, this.configuration).mml();
  }
  /**
   * Process an argument as text rather than math
   *
   * @override
   */
  ParseArg(name) {
    return new _TextParser(this.GetArgument(name), this.stack.env, this.configuration).mml();
  }
  /**
   * Throw an error
   *
   * @param {string} id        The id for the message string
   * @param {string} message   The English version of the message
   * @param {string[]} args    Any substitution args for the message
   */
  Error(id, message, ...args) {
    throw new TexError(id, message, ...args);
  }
};

// node_modules/mathjax-full/ts/input/tex/textmacros/TextMacrosMethods.ts
var TextMacrosMethods = {
  /**
   * @param {TextParser} parser   The text-mode parser
   * @param {string} c            The character that called this function
   */
  Comment(parser, _c) {
    while (parser.i < parser.string.length && parser.string.charAt(parser.i) !== "\n") {
      parser.i++;
    }
    parser.i++;
  },
  /**
   * @param {TextParser} parser   The text-mode parser
   * @param {string} open         The delimiter used to open math-mode in text-mode
   */
  Math(parser, open) {
    parser.saveText();
    let i = parser.i;
    let j, c;
    let braces = 0;
    while (c = parser.GetNext()) {
      j = parser.i++;
      switch (c) {
        case "\\":
          const cs = parser.GetCS();
          if (cs === ")") c = "\\(";
        // \( is the opening delimiter for \)
        case "$":
          if (braces === 0 && open === c) {
            const config2 = parser.texParser.configuration;
            const mml = new TexParser(parser.string.substr(i, j - i), parser.stack.env, config2).mml();
            parser.PushMath(mml);
            return;
          }
          break;
        case "{":
          braces++;
          break;
        case "}":
          if (braces === 0) {
            parser.Error("ExtraCloseMissingOpen", "Extra close brace or missing open brace");
          }
          braces--;
          break;
      }
    }
    parser.Error("MathNotTerminated", "Math-mode is not properly terminated");
  },
  /**
   * @param {TextParser} parser   The text-mode parser
   * @param {string} c            The character that called this function
   */
  MathModeOnly(parser, c) {
    parser.Error("MathModeOnly", "'%1' allowed only in math mode", c);
  },
  /**
   * @param {TextParser} parser   The text-mode parser
   * @param {string} c            The character that called this function
   */
  Misplaced(parser, c) {
    parser.Error("Misplaced", "'%1' can not be used here", c);
  },
  /**
   * @param {TextParser} parser   The text-mode parser
   * @param {string} c            The character that called this function
   */
  OpenBrace(parser, _c) {
    const env = parser.stack.env;
    parser.envStack.push(env);
    parser.stack.env = Object.assign({}, env);
  },
  /**
   * @param {TextParser} parser   The text-mode parser
   * @param {string} c            The character that called this function
   */
  CloseBrace(parser, _c) {
    if (parser.envStack.length) {
      parser.saveText();
      parser.stack.env = parser.envStack.pop();
    } else {
      parser.Error("ExtraCloseMissingOpen", "Extra close brace or missing open brace");
    }
  },
  /**
   * @param {TextParser} parser   The text-mode parser
   * @param {string} c            The character that called this function
   */
  OpenQuote(parser, c) {
    if (parser.string.charAt(parser.i) === c) {
      parser.text += "“";
      parser.i++;
    } else {
      parser.text += "‘";
    }
  },
  /**
   * @param {TextParser} parser   The text-mode parser
   * @param {string} c            The character that called this function
   */
  CloseQuote(parser, c) {
    if (parser.string.charAt(parser.i) === c) {
      parser.text += "”";
      parser.i++;
    } else {
      parser.text += "’";
    }
  },
  /**
   * @param {TextParser} parser   The text-mode parser
   * @param {string} c            The character that called this function
   */
  Tilde(parser, _c) {
    parser.text += " ";
  },
  /**
   * @param {TextParser} parser   The text-mode parser
   * @param {string} c            The character that called this function
   */
  Space(parser, _c) {
    parser.text += " ";
    while (parser.GetNext().match(/\s/)) parser.i++;
  },
  /**
   * @param {TextParser} parser   The text-mode parser
   * @param {string} name         The control sequence that called this function
   */
  SelfQuote(parser, name) {
    parser.text += name.substr(1);
  },
  /**
   * @param {TextParser} parser   The text-mode parser
   * @param {string} name         The control sequence that called this function
   * @param {string} c            The character to insert into the string
   */
  Insert(parser, _name, c) {
    parser.text += c;
  },
  /**
   * @param {TextParser} parser   The text-mode parser
   * @param {string} name         The control sequence that called this function
   * @param {string} c            The character to insert into the string
   */
  Accent(parser, name, c) {
    const base = parser.ParseArg(name);
    const accent = parser.create("token", "mo", {}, c);
    parser.addAttributes(accent);
    parser.Push(parser.create("node", "mover", [base, accent]));
  },
  /**
   * @param {TextParser} parser   The text-mode parser
   * @param {string} name         The control sequence that called this function
   */
  Emph(parser, name) {
    const variant = parser.stack.env.mathvariant === "-tex-mathit" ? "normal" : "-tex-mathit";
    parser.Push(parser.ParseTextArg(name, { mathvariant: variant }));
  },
  /**
   * @param {TextParser} parser   The text-mode parser
   * @param {string} name         The control sequence that called this function
   * @param {string} variant      The font variant to use from now on
   */
  SetFont(parser, _name, variant) {
    parser.saveText();
    parser.stack.env.mathvariant = variant;
  },
  /**
   * @param {TextParser} parser   The text-mode parser
   * @param {string} name         The control sequence that called this function
   * @param {number} size         The font size to use from now on
   */
  SetSize(parser, _name, size) {
    parser.saveText();
    parser.stack.env.mathsize = size;
  },
  /**
   * @param {TextParser} parser   The text-mode parser
   * @param {string} name         The control sequence that called this function
   */
  CheckAutoload(parser, name) {
    const autoload = parser.configuration.packageData.get("autoload");
    const texParser = parser.texParser;
    name = name.slice(1);
    const macro = texParser.lookup("macro", name);
    if (!macro || autoload && macro._func === autoload.Autoload) {
      texParser.parse("macro", [texParser, name]);
      if (!macro) return;
      retryAfter(Promise.resolve());
    }
    texParser.parse("macro", [parser, name]);
  },
  //
  // Copy some methods from the base package
  //
  Macro: BaseMethods_default.Macro,
  Spacer: BaseMethods_default.Spacer,
  Hskip: BaseMethods_default.Hskip,
  rule: BaseMethods_default.rule,
  Rule: BaseMethods_default.Rule,
  HandleRef: BaseMethods_default.HandleRef
};

// node_modules/mathjax-full/ts/input/tex/textmacros/TextMacrosMappings.ts
new MacroMap("text-special", {
  "$": "Math",
  "%": "Comment",
  "^": "MathModeOnly",
  "_": "MathModeOnly",
  "&": "Misplaced",
  "#": "Misplaced",
  "~": "Tilde",
  " ": "Space",
  "	": "Space",
  "\r": "Space",
  "\n": "Space",
  " ": "Tilde",
  "{": "OpenBrace",
  "}": "CloseBrace",
  "`": "OpenQuote",
  "'": "CloseQuote"
}, TextMacrosMethods);
new CommandMap("text-macros", {
  "(": "Math",
  "$": "SelfQuote",
  "_": "SelfQuote",
  "%": "SelfQuote",
  "{": "SelfQuote",
  "}": "SelfQuote",
  " ": "SelfQuote",
  "&": "SelfQuote",
  "#": "SelfQuote",
  "\\": "SelfQuote",
  "'": ["Accent", "´"],
  "’": ["Accent", "´"],
  "`": ["Accent", "`"],
  "‘": ["Accent", "`"],
  "^": ["Accent", "^"],
  '"': ["Accent", "¨"],
  "~": ["Accent", "~"],
  "=": ["Accent", "¯"],
  ".": ["Accent", "˙"],
  "u": ["Accent", "˘"],
  "v": ["Accent", "ˇ"],
  emph: "Emph",
  rm: ["SetFont", TexConstant.Variant.NORMAL],
  mit: ["SetFont", TexConstant.Variant.ITALIC],
  oldstyle: ["SetFont", TexConstant.Variant.OLDSTYLE],
  cal: ["SetFont", TexConstant.Variant.CALLIGRAPHIC],
  it: ["SetFont", "-tex-mathit"],
  // needs special handling
  bf: ["SetFont", TexConstant.Variant.BOLD],
  bbFont: ["SetFont", TexConstant.Variant.DOUBLESTRUCK],
  scr: ["SetFont", TexConstant.Variant.SCRIPT],
  frak: ["SetFont", TexConstant.Variant.FRAKTUR],
  sf: ["SetFont", TexConstant.Variant.SANSSERIF],
  tt: ["SetFont", TexConstant.Variant.MONOSPACE],
  tiny: ["SetSize", 0.5],
  Tiny: ["SetSize", 0.6],
  // non-standard
  scriptsize: ["SetSize", 0.7],
  small: ["SetSize", 0.85],
  normalsize: ["SetSize", 1],
  large: ["SetSize", 1.2],
  Large: ["SetSize", 1.44],
  LARGE: ["SetSize", 1.73],
  huge: ["SetSize", 2.07],
  Huge: ["SetSize", 2.49],
  Bbb: ["Macro", "{\\bbFont #1}", 1],
  textnormal: ["Macro", "{\\rm #1}", 1],
  textup: ["Macro", "{\\rm #1}", 1],
  textrm: ["Macro", "{\\rm #1}", 1],
  textit: ["Macro", "{\\it #1}", 1],
  textbf: ["Macro", "{\\bf #1}", 1],
  textsf: ["Macro", "{\\sf #1}", 1],
  texttt: ["Macro", "{\\tt #1}", 1],
  dagger: ["Insert", "†"],
  ddagger: ["Insert", "‡"],
  S: ["Insert", "§"],
  ",": ["Spacer", MATHSPACE.thinmathspace],
  ":": ["Spacer", MATHSPACE.mediummathspace],
  ">": ["Spacer", MATHSPACE.mediummathspace],
  ";": ["Spacer", MATHSPACE.thickmathspace],
  "!": ["Spacer", MATHSPACE.negativethinmathspace],
  enspace: ["Spacer", 0.5],
  quad: ["Spacer", 1],
  qquad: ["Spacer", 2],
  thinspace: ["Spacer", MATHSPACE.thinmathspace],
  negthinspace: ["Spacer", MATHSPACE.negativethinmathspace],
  hskip: "Hskip",
  hspace: "Hskip",
  kern: "Hskip",
  mskip: "Hskip",
  mspace: "Hskip",
  mkern: "Hskip",
  rule: "rule",
  Rule: ["Rule"],
  Space: ["Rule", "blank"],
  color: "CheckAutoload",
  textcolor: "CheckAutoload",
  colorbox: "CheckAutoload",
  fcolorbox: "CheckAutoload",
  href: "CheckAutoload",
  style: "CheckAutoload",
  class: "CheckAutoload",
  cssId: "CheckAutoload",
  unicode: "CheckAutoload",
  ref: ["HandleRef", false],
  eqref: ["HandleRef", true]
}, TextMacrosMethods);

// node_modules/mathjax-full/ts/input/tex/textmacros/TextMacrosConfiguration.ts
var TextBaseConfiguration = Configuration.create("text-base", {
  parser: "text",
  handler: {
    character: ["command", "text-special"],
    macro: ["text-macros"]
  },
  fallback: {
    //
    // Unknown characters are added to the text verbatim
    //
    character: (parser, c) => {
      parser.text += c;
    },
    //
    // For unknown macros, if they are defined in the main TeX parser
    //   and not string-replacement macros, give an error, otherwise
    //   run the macro (this either does the string replacement or
    //   produces the error as configured in the main TeX parser, so
    //   this will respect the noundefined package, if loaded).
    //
    macro: (parser, name) => {
      const texParser = parser.texParser;
      const macro = texParser.lookup("macro", name);
      if (macro && macro._func !== TextMacrosMethods.Macro) {
        parser.Error("MathMacro", "%1 is only supported in math mode", "\\" + name);
      }
      texParser.parse("macro", [parser, name]);
    }
  },
  items: {
    [StartItem.prototype.kind]: StartItem,
    [StopItem.prototype.kind]: StopItem,
    [MmlItem.prototype.kind]: MmlItem,
    [StyleItem.prototype.kind]: StyleItem
    // needed for \color
  }
});
function internalMath(parser, text, level, mathvariant) {
  const config2 = parser.configuration.packageData.get("textmacros");
  if (!(parser instanceof TextParser)) {
    config2.texParser = parser;
  }
  return [new TextParser(text, mathvariant ? { mathvariant } : {}, config2.parseOptions, level).mml()];
}
var TextMacrosConfiguration = Configuration.create("textmacros", {
  /**
   * @param {ParserConfiguration} config   The configuration object we are being configured within
   * @param {TeX<any,any,any>} jax         The TeX input jax in which we are running
   */
  config(_config, jax) {
    const textConf = new ParserConfiguration(jax.parseOptions.options.textmacros.packages, ["tex", "text"]);
    textConf.init();
    const parseOptions = new ParseOptions(textConf, []);
    parseOptions.options = jax.parseOptions.options;
    textConf.config(jax);
    TagsFactory.addTags(textConf.tags);
    parseOptions.tags = TagsFactory.getDefault();
    parseOptions.tags.configuration = parseOptions;
    parseOptions.packageData = jax.parseOptions.packageData;
    parseOptions.packageData.set("textmacros", { parseOptions, jax, texParser: null });
    parseOptions.options.internalMath = internalMath;
  },
  preprocessors: [(data) => {
    const config2 = data.data.packageData.get("textmacros");
    config2.parseOptions.nodeFactory.setMmlFactory(config2.jax.mmlFactory);
  }],
  options: {
    textmacros: {
      packages: ["text-base"]
      // textmacro packages to load
    }
  }
});

// node_modules/mathjax-full/ts/core/FindMath.ts
var AbstractFindMath = class {
  static {
    /**
     * The default options for FindMath
     */
    this.OPTIONS = {};
  }
  /**
   * @param {OptionList} options  The user options for this instance
   */
  constructor(options2) {
    let CLASS = this.constructor;
    this.options = userOptions(defaultOptions({}, CLASS.OPTIONS), options2);
  }
};

// node_modules/mathjax-full/ts/input/tex/FindTeX.ts
var FindTeX = class extends AbstractFindMath {
  static {
    /**
     * @type {OptionList}
     */
    this.OPTIONS = {
      inlineMath: [
        // The start/end delimiter pairs for in-line math
        //  ['$', '$'],              //  (comment out any you don't want, or add your own, but
        ["\\(", "\\)"]
        //  be sure that you don't have an extra comma at the end)
      ],
      displayMath: [
        // The start/end delimiter pairs for display math
        ["$$", "$$"],
        //  (comment out any you don't want, or add your own, but
        ["\\[", "\\]"]
        //  be sure that you don't have an extra comma at the end)
      ],
      processEscapes: true,
      // set to true to allow \$ to produce a dollar without
      //   starting in-line math mode
      processEnvironments: true,
      // set to true to process \begin{xxx}...\end{xxx} outside
      //   of math mode, false to prevent that
      processRefs: true
      // set to true to process \ref{...} outside of math mode
    };
  }
  /**
   * @override
   */
  constructor(options2) {
    super(options2);
    this.getPatterns();
  }
  /**
   * Create the patterns needed for searching the strings for TeX
   *   based on the configuration options
   */
  getPatterns() {
    let options2 = this.options;
    let starts = [], parts = [], subparts = [];
    this.end = {};
    this.env = this.sub = 0;
    let i = 1;
    options2["inlineMath"].forEach((delims) => this.addPattern(starts, delims, false));
    options2["displayMath"].forEach((delims) => this.addPattern(starts, delims, true));
    if (starts.length) {
      parts.push(starts.sort(sortLength).join("|"));
    }
    if (options2["processEnvironments"]) {
      parts.push("\\\\begin\\s*\\{([^}]*)\\}");
      this.env = i;
      i++;
    }
    if (options2["processEscapes"]) {
      subparts.push("\\\\([\\\\$])");
    }
    if (options2["processRefs"]) {
      subparts.push("(\\\\(?:eq)?ref\\s*\\{[^}]*\\})");
    }
    if (subparts.length) {
      parts.push("(" + subparts.join("|") + ")");
      this.sub = i;
    }
    this.start = new RegExp(parts.join("|"), "g");
    this.hasPatterns = parts.length > 0;
  }
  /**
   * Add the needed patterns for a pair of delimiters
   *
   * @param {string[]} starts  Array of starting delimiter strings
   * @param {Delims} delims    Array of delimiter strings, as [start, end]
   * @param {boolean} display  True if the delimiters are for display mode
   */
  addPattern(starts, delims, display) {
    let [open, close] = delims;
    starts.push(quotePattern(open));
    this.end[open] = [close, display, this.endPattern(close)];
  }
  /**
   * Create the pattern for a close delimiter
   *
   * @param {string} end   The end delimiter text
   * @param {string} endp  The end delimiter pattern (overrides the literal end pattern)
   * @return {RegExp}      The regular expression for the end delimiter
   */
  endPattern(end, endp) {
    return new RegExp((endp || quotePattern(end)) + "|\\\\(?:[a-zA-Z]|.)|[{}]", "g");
  }
  /**
   * Search for the end delimiter given the start delimiter,
   *   skipping braced groups, and control sequences that aren't
   *   the close delimiter.
   *
   * @param {string} text            The string being searched for the end delimiter
   * @param {number} n               The index of the string being searched
   * @param {RegExpExecArray} start  The result array from the start-delimiter search
   * @param {EndItem} end            The end-delimiter data corresponding to the start delimiter
   * @return {ProtoItem<N,T>}        The proto math item for the math, if found
   */
  findEnd(text, n, start, end) {
    let [close, display, pattern] = end;
    let i = pattern.lastIndex = start.index + start[0].length;
    let match, braces = 0;
    while (match = pattern.exec(text)) {
      if ((match[1] || match[0]) === close && braces === 0) {
        return protoItem(
          start[0],
          text.substr(i, match.index - i),
          match[0],
          n,
          start.index,
          match.index + match[0].length,
          display
        );
      } else if (match[0] === "{") {
        braces++;
      } else if (match[0] === "}" && braces) {
        braces--;
      }
    }
    return null;
  }
  /**
   * Search a string for math delimited by one of the delimiter pairs,
   *   or by \begin{env}...\end{env}, or \eqref{...}, \ref{...}, \\, or \$.
   *
   * @param {ProtoItem[]} math  The array of proto math items located so far
   * @param {number} n          The index of the string being searched
   * @param {string} text       The string being searched
   */
  findMathInString(math, n, text) {
    let start, match;
    this.start.lastIndex = 0;
    while (start = this.start.exec(text)) {
      if (start[this.env] !== void 0 && this.env) {
        let end = "\\\\end\\s*(\\{" + quotePattern(start[this.env]) + "\\})";
        match = this.findEnd(text, n, start, ["{" + start[this.env] + "}", true, this.endPattern(null, end)]);
        if (match) {
          match.math = match.open + match.math + match.close;
          match.open = match.close = "";
        }
      } else if (start[this.sub] !== void 0 && this.sub) {
        let math2 = start[this.sub];
        let end = start.index + start[this.sub].length;
        if (math2.length === 2) {
          match = protoItem("", math2.substr(1), "", n, start.index, end);
        } else {
          match = protoItem("", math2, "", n, start.index, end, false);
        }
      } else {
        match = this.findEnd(text, n, start, this.end[start[0]]);
      }
      if (match) {
        math.push(match);
        this.start.lastIndex = match.end.n;
      }
    }
  }
  /**
   * Search for math in an array of strings and return an array of matches.
   *
   * @override
   */
  findMath(strings) {
    let math = [];
    if (this.hasPatterns) {
      for (let i = 0, m = strings.length; i < m; i++) {
        this.findMathInString(math, i, strings[i]);
      }
    }
    return math;
  }
};

// node_modules/mathjax-full/ts/input/tex/FilterUtil.ts
var FilterUtil;
((FilterUtil2) => {
  FilterUtil2.cleanStretchy = function(arg) {
    let options2 = arg.data;
    for (let mo of options2.getList("fixStretchy")) {
      if (NodeUtil_default.getProperty(mo, "fixStretchy")) {
        let symbol = NodeUtil_default.getForm(mo);
        if (symbol && symbol[3] && symbol[3]["stretchy"]) {
          NodeUtil_default.setAttribute(mo, "stretchy", false);
        }
        const parent = mo.parent;
        if (!NodeUtil_default.getTexClass(mo) && (!symbol || !symbol[2])) {
          const texAtom = options2.nodeFactory.create("node", "TeXAtom", [mo]);
          parent.replaceChild(texAtom, mo);
          texAtom.inheritAttributesFrom(mo);
        }
        NodeUtil_default.removeProperties(mo, "fixStretchy");
      }
    }
  };
  FilterUtil2.cleanAttributes = function(arg) {
    let node = arg.data.root;
    node.walkTree((mml, _d) => {
      let attribs = mml.attributes;
      if (!attribs) {
        return;
      }
      const keep = new Set((attribs.get("mjx-keep-attrs") || "").split(/ /));
      delete attribs.getAllAttributes()["mjx-keep-attrs"];
      for (const key of attribs.getExplicitNames()) {
        if (!keep.has(key) && attribs.attributes[key] === mml.attributes.getInherited(key)) {
          delete attribs.attributes[key];
        }
      }
    }, {});
  };
  FilterUtil2.combineRelations = function(arg) {
    const remove = [];
    for (let mo of arg.data.getList("mo")) {
      if (mo.getProperty("relationsCombined") || !mo.parent || mo.parent && !NodeUtil_default.isType(mo.parent, "mrow") || NodeUtil_default.getTexClass(mo) !== TEXCLASS.REL) {
        continue;
      }
      let mml = mo.parent;
      let m2;
      let children = mml.childNodes;
      let next = children.indexOf(mo) + 1;
      let variantForm = NodeUtil_default.getProperty(mo, "variantForm");
      while (next < children.length && (m2 = children[next]) && NodeUtil_default.isType(m2, "mo") && NodeUtil_default.getTexClass(m2) === TEXCLASS.REL) {
        if (variantForm === NodeUtil_default.getProperty(m2, "variantForm") && _compareExplicit(mo, m2)) {
          NodeUtil_default.appendChildren(mo, NodeUtil_default.getChildren(m2));
          _copyExplicit(["stretchy", "rspace"], mo, m2);
          for (const name of m2.getPropertyNames()) {
            mo.setProperty(name, m2.getProperty(name));
          }
          children.splice(next, 1);
          remove.push(m2);
          m2.parent = null;
          m2.setProperty("relationsCombined", true);
        } else {
          if (mo.attributes.getExplicit("rspace") == null) {
            NodeUtil_default.setAttribute(mo, "rspace", "0pt");
          }
          if (m2.attributes.getExplicit("lspace") == null) {
            NodeUtil_default.setAttribute(m2, "lspace", "0pt");
          }
          break;
        }
      }
      mo.attributes.setInherited("form", mo.getForms()[0]);
    }
    arg.data.removeFromList("mo", remove);
  };
  let _copyExplicit = function(attrs, node1, node2) {
    let attr1 = node1.attributes;
    let attr2 = node2.attributes;
    attrs.forEach((x) => {
      let attr = attr2.getExplicit(x);
      if (attr != null) {
        attr1.set(x, attr);
      }
    });
  };
  let _compareExplicit = function(node1, node2) {
    let filter = (attr, space) => {
      let exp = attr.getExplicitNames();
      return exp.filter((x) => {
        return x !== space && (x !== "stretchy" || attr.getExplicit("stretchy"));
      });
    };
    let attr1 = node1.attributes;
    let attr2 = node2.attributes;
    let exp1 = filter(attr1, "lspace");
    let exp2 = filter(attr2, "rspace");
    if (exp1.length !== exp2.length) {
      return false;
    }
    for (let name of exp1) {
      if (attr1.getExplicit(name) !== attr2.getExplicit(name)) {
        return false;
      }
    }
    return true;
  };
  let _cleanSubSup = function(options2, low, up) {
    const remove = [];
    for (let mml of options2.getList("m" + low + up)) {
      const children = mml.childNodes;
      if (children[mml[low]] && children[mml[up]]) {
        continue;
      }
      const parent = mml.parent;
      let newNode = children[mml[low]] ? options2.nodeFactory.create("node", "m" + low, [children[mml.base], children[mml[low]]]) : options2.nodeFactory.create("node", "m" + up, [children[mml.base], children[mml[up]]]);
      NodeUtil_default.copyAttributes(mml, newNode);
      if (parent) {
        parent.replaceChild(newNode, mml);
      } else {
        options2.root = newNode;
      }
      remove.push(mml);
    }
    options2.removeFromList("m" + low + up, remove);
  };
  FilterUtil2.cleanSubSup = function(arg) {
    let options2 = arg.data;
    if (options2.error) {
      return;
    }
    _cleanSubSup(options2, "sub", "sup");
    _cleanSubSup(options2, "under", "over");
  };
  let _moveLimits = function(options2, underover, subsup) {
    const remove = [];
    for (const mml of options2.getList(underover)) {
      if (mml.attributes.get("displaystyle")) {
        continue;
      }
      const base = mml.childNodes[mml.base];
      const mo = base.coreMO();
      if (base.getProperty("movablelimits") && !mo.attributes.getExplicit("movablelimits")) {
        let node = options2.nodeFactory.create("node", subsup, mml.childNodes);
        NodeUtil_default.copyAttributes(mml, node);
        if (mml.parent) {
          mml.parent.replaceChild(node, mml);
        } else {
          options2.root = node;
        }
        remove.push(mml);
      }
    }
    options2.removeFromList(underover, remove);
  };
  FilterUtil2.moveLimits = function(arg) {
    const options2 = arg.data;
    _moveLimits(options2, "munderover", "msubsup");
    _moveLimits(options2, "munder", "msub");
    _moveLimits(options2, "mover", "msup");
  };
  FilterUtil2.setInherited = function(arg) {
    arg.data.root.setInheritedAttributes({}, arg.math["display"], 0, false);
  };
})(FilterUtil || (FilterUtil = {}));
var FilterUtil_default = FilterUtil;

// node_modules/mathjax-full/ts/input/tex.ts
var TeX = class _TeX extends AbstractInputJax {
  static {
    /**
     * Name of input jax.
     * @type {string}
     */
    this.NAME = "TeX";
  }
  static {
    /**
     * Default options for the jax.
     * @type {OptionList}
     */
    this.OPTIONS = {
      ...AbstractInputJax.OPTIONS,
      FindTeX: null,
      packages: ["base"],
      // Digit pattern to match numbers.
      digits: /^(?:[0-9]+(?:\{,\}[0-9]{3})*(?:\.[0-9]*)?|\.[0-9]+)/,
      // Maximum size of TeX string to process.
      maxBuffer: 5 * 1024,
      formatError: (jax, err) => jax.formatError(err)
    };
  }
  /**
   * Initialises the configurations.
   * @param {string[]} packages Names of packages.
   * @return {Configuration} The configuration object.
   */
  static configure(packages) {
    let configuration = new ParserConfiguration(packages, ["tex"]);
    configuration.init();
    return configuration;
  }
  /**
   * Initialises the Tags factory. Add tagging structures from packages and set
   * tagging to given default.
   * @param {ParseOptions} options The parse options.
   * @param {Configuration} configuration The configuration.
   */
  static tags(options2, configuration) {
    TagsFactory.addTags(configuration.tags);
    TagsFactory.setDefault(options2.options.tags);
    options2.tags = TagsFactory.getDefault();
    options2.tags.configuration = options2;
  }
  /**
   * @override
   */
  constructor(options2 = {}) {
    const [rest, tex, find2] = separateOptions(options2, _TeX.OPTIONS, FindTeX.OPTIONS);
    super(tex);
    this.findTeX = this.options["FindTeX"] || new FindTeX(find2);
    const packages = this.options.packages;
    const configuration = this.configuration = _TeX.configure(packages);
    const parseOptions = this._parseOptions = new ParseOptions(configuration, [this.options, TagsFactory.OPTIONS]);
    userOptions(parseOptions.options, rest);
    configuration.config(this);
    _TeX.tags(parseOptions, configuration);
    this.postFilters.add(FilterUtil_default.cleanSubSup, -6);
    this.postFilters.add(FilterUtil_default.setInherited, -5);
    this.postFilters.add(FilterUtil_default.moveLimits, -4);
    this.postFilters.add(FilterUtil_default.cleanStretchy, -3);
    this.postFilters.add(FilterUtil_default.cleanAttributes, -2);
    this.postFilters.add(FilterUtil_default.combineRelations, -1);
  }
  /**
   * @override
   */
  setMmlFactory(mmlFactory) {
    super.setMmlFactory(mmlFactory);
    this._parseOptions.nodeFactory.setMmlFactory(mmlFactory);
  }
  /**
   * @return {ParseOptions} The parse options that configure this JaX instance.
   */
  get parseOptions() {
    return this._parseOptions;
  }
  /**
   * @override
   */
  reset(tag = 0) {
    this.parseOptions.tags.reset(tag);
  }
  /**
   * @override
   */
  compile(math, document2) {
    this.parseOptions.clear();
    this.executeFilters(this.preFilters, math, document2, this.parseOptions);
    let display = math.display;
    this.latex = math.math;
    let node;
    this.parseOptions.tags.startEquation(math);
    let globalEnv;
    try {
      let parser = new TexParser(
        this.latex,
        { display, isInner: false },
        this.parseOptions
      );
      node = parser.mml();
      globalEnv = parser.stack.global;
    } catch (err) {
      if (!(err instanceof TexError)) {
        throw err;
      }
      this.parseOptions.error = true;
      node = this.options.formatError(this, err);
    }
    node = this.parseOptions.nodeFactory.create("node", "math", [node]);
    if (globalEnv?.indentalign) {
      NodeUtil_default.setAttribute(node, "indentalign", globalEnv.indentalign);
    }
    if (display) {
      NodeUtil_default.setAttribute(node, "display", "block");
    }
    this.parseOptions.tags.finishEquation(math);
    this.parseOptions.root = node;
    this.executeFilters(this.postFilters, math, document2, this.parseOptions);
    this.mathNode = this.parseOptions.root;
    return this.mathNode;
  }
  /**
   * @override
   */
  findMath(strings) {
    return this.findTeX.findMath(strings);
  }
  /**
   * Default formatter for error messages:
   *   wrap an error into a node for output.
   * @param {TeXError} err The TexError.
   * @return {Node} The merror node.
   */
  formatError(err) {
    let message = err.message.replace(/\n.*/, "");
    return this.parseOptions.nodeFactory.create(
      "error",
      message,
      err.id,
      this.latex
    );
  }
};

// node_modules/mathjax-full/ts/util/StyleList.ts
var CssStyles = class {
  /**
   * @param {StyleList} styles  The initial styles to use, if any
   * @constructor
   */
  constructor(styles = null) {
    /**
     * The styles as they currently stand
     */
    this.styles = {};
    this.addStyles(styles);
  }
  /**
   * @return {string}  The styles as a CSS string
   */
  get cssText() {
    return this.getStyleString();
  }
  /**
   * @param {StyleList} styles  The styles to combine with the existing ones
   */
  addStyles(styles) {
    if (!styles) return;
    for (const style of Object.keys(styles)) {
      if (!this.styles[style]) {
        this.styles[style] = {};
      }
      Object.assign(this.styles[style], styles[style]);
    }
  }
  /**
   * @param {string[]} selectors  The selectors for the styles to remove
   */
  removeStyles(...selectors) {
    for (const selector of selectors) {
      delete this.styles[selector];
    }
  }
  /**
   * Clear all the styles
   */
  clear() {
    this.styles = {};
  }
  /**
   * @return {string} The CSS string for the style list
   */
  getStyleString() {
    return this.getStyleRules().join("\n\n");
  }
  /**
   * @return {string[]}  An array of rule strings for the style list
   */
  getStyleRules() {
    const selectors = Object.keys(this.styles);
    const defs = new Array(selectors.length);
    let i = 0;
    for (const selector of selectors) {
      defs[i++] = selector + " {\n" + this.getStyleDefString(this.styles[selector]) + "\n}";
    }
    return defs;
  }
  /**
   * @param {StyleData} styles  The style data to be stringified
   * @return {string}           The CSS string for the given data
   */
  getStyleDefString(styles) {
    const properties = Object.keys(styles);
    const values = new Array(properties.length);
    let i = 0;
    for (const property of properties) {
      values[i++] = "  " + property + ": " + styles[property] + ";";
    }
    return values.join("\n");
  }
};

// node_modules/mathjax-full/ts/output/common/OutputJax.ts
var CommonOutputJax = class extends AbstractOutputJax {
  static {
    /**
     * The name of this output jax
     */
    this.NAME = "Common";
  }
  static {
    /**
     * @override
     */
    this.OPTIONS = {
      ...AbstractOutputJax.OPTIONS,
      scale: 1,
      // global scaling factor for all expressions
      minScale: 0.5,
      // smallest scaling factor to use
      mtextInheritFont: false,
      // true to make mtext elements use surrounding font
      merrorInheritFont: false,
      // true to make merror text use surrounding font
      mtextFont: "",
      // font to use for mtext, if not inheriting (empty means use MathJax fonts)
      merrorFont: "serif",
      // font to use for merror, if not inheriting (empty means use MathJax fonts)
      mathmlSpacing: false,
      // true for MathML spacing rules, false for TeX rules
      skipAttributes: {},
      // RFDa and other attributes NOT to copy to the output
      exFactor: 0.5,
      // default size of ex in em units
      displayAlign: "center",
      // default for indentalign when set to 'auto'
      displayIndent: "0",
      // default for indentshift when set to 'auto'
      wrapperFactory: null,
      // The wrapper factory to use
      font: null,
      // The FontData object to use
      cssStyles: null
      // The CssStyles object to use
    };
  }
  static {
    /**
     *  The default styles for the output jax
     */
    this.commonStyles = {};
  }
  /*****************************************************************/
  /**
   * Get the WrapperFactory and connect it to this output jax
   * Get the cssStyle and font objects
   *
   * @param {OptionList} options         The configuration options
   * @param {CommonWrapperFactory} defaultFactory  The default wrapper factory class
   * @param {FC} defaultFont  The default FontData constructor
   * @constructor
   */
  constructor(options2 = null, defaultFactory = null, defaultFont = null) {
    const [jaxOptions, fontOptions] = separateOptions(options2, defaultFont.OPTIONS);
    super(jaxOptions);
    this.factory = this.options.wrapperFactory || new defaultFactory();
    this.factory.jax = this;
    this.cssStyles = this.options.cssStyles || new CssStyles();
    this.font = this.options.font || new defaultFont(fontOptions);
    this.unknownCache = /* @__PURE__ */ new Map();
  }
  /*****************************************************************/
  /**
   * Save the math document
   * Create the mjx-container node
   * Create the DOM output for the root MathML math node in the container
   * Return the container node
   *
   * @override
   */
  typeset(math, html) {
    this.setDocument(html);
    let node = this.createNode();
    this.toDOM(math, node, html);
    return node;
  }
  /**
   * @return {N}  The container DOM node for the typeset math
   */
  createNode() {
    const jax = this.constructor.NAME;
    return this.html("mjx-container", { "class": "MathJax", jax });
  }
  /**
   * @param {N} node   The container whose scale is to be set
   */
  setScale(node) {
    const scale = this.math.metrics.scale * this.options.scale;
    if (scale !== 1) {
      this.adaptor.setStyle(node, "fontSize", percent(scale));
    }
  }
  /**
   * Save the math document, if any, and the math item
   * Set the document where HTML nodes will be created via the adaptor
   * Recursively set the TeX classes for the nodes
   * Set the scaling for the DOM node
   * Create the nodeMap (maps MathML nodes to corresponding wrappers)
   * Create the HTML output for the root MathML node in the container
   * Clear the nodeMape
   * Execute the post-filters
   *
   * @param {MathItem} math      The math item to convert
   * @param {N} node             The contaier to place the result into
   * @param {MathDocument} html  The document containing the math
   */
  toDOM(math, node, html = null) {
    this.setDocument(html);
    this.math = math;
    this.pxPerEm = math.metrics.ex / this.font.params.x_height;
    math.root.setTeXclass(null);
    this.setScale(node);
    this.nodeMap = /* @__PURE__ */ new Map();
    this.container = node;
    this.processMath(math.root, node);
    this.nodeMap = null;
    this.executeFilters(this.postFilters, math, html, node);
  }
  /*****************************************************************/
  /**
   * @param {MathItem} math      The MathItem to get the bounding box for
   * @param {MathDocument} html  The MathDocument for the math
   */
  getBBox(math, html) {
    this.setDocument(html);
    this.math = math;
    math.root.setTeXclass(null);
    this.nodeMap = /* @__PURE__ */ new Map();
    let bbox = this.factory.wrap(math.root).getOuterBBox();
    this.nodeMap = null;
    return bbox;
  }
  /*****************************************************************/
  /**
   * @override
   */
  getMetrics(html) {
    this.setDocument(html);
    const adaptor2 = this.adaptor;
    const maps = this.getMetricMaps(html);
    for (const math of html.math) {
      const parent = adaptor2.parent(math.start.node);
      if (math.state() < STATE.METRICS && parent) {
        const map = maps[math.display ? 1 : 0];
        const { em: em2, ex, containerWidth, lineWidth, scale, family } = map.get(parent);
        math.setMetrics(em2, ex, containerWidth, lineWidth, scale);
        if (this.options.mtextInheritFont) {
          math.outputData.mtextFamily = family;
        }
        if (this.options.merrorInheritFont) {
          math.outputData.merrorFamily = family;
        }
        math.state(STATE.METRICS);
      }
    }
  }
  /**
   * @param {N} node            The container node whose metrics are to be measured
   * @param {boolean} display   True if the metrics are for displayed math
   * @return {Metrics}          Object containing em, ex, containerWidth, etc.
   */
  getMetricsFor(node, display) {
    const getFamily = this.options.mtextInheritFont || this.options.merrorInheritFont;
    const test = this.getTestElement(node, display);
    const metrics = this.measureMetrics(test, getFamily);
    this.adaptor.remove(test);
    return metrics;
  }
  /**
   * Get a MetricMap for the math list
   *
   * @param {MathDocument} html  The math document whose math list is to be processed.
   * @return {MetricMap[]}       The node-to-metrics maps for all the containers that have math
   */
  getMetricMaps(html) {
    const adaptor2 = this.adaptor;
    const domMaps = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
    for (const math of html.math) {
      const node = adaptor2.parent(math.start.node);
      if (node && math.state() < STATE.METRICS) {
        const map = domMaps[math.display ? 1 : 0];
        if (!map.has(node)) {
          map.set(node, this.getTestElement(node, math.display));
        }
      }
    }
    const getFamily = this.options.mtextInheritFont || this.options.merrorInheritFont;
    const maps = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
    for (const i of maps.keys()) {
      for (const node of domMaps[i].keys()) {
        maps[i].set(node, this.measureMetrics(domMaps[i].get(node), getFamily));
      }
    }
    for (const i of maps.keys()) {
      for (const node of domMaps[i].values()) {
        adaptor2.remove(node);
      }
    }
    return maps;
  }
  /**
   * @param {N} node    The math element to be measured
   * @return {N}        The test elements that were added
   */
  getTestElement(node, display) {
    const adaptor2 = this.adaptor;
    if (!this.testInline) {
      this.testInline = this.html("mjx-test", { style: {
        display: "inline-block",
        width: "100%",
        "font-style": "normal",
        "font-weight": "normal",
        "font-size": "100%",
        "font-size-adjust": "none",
        "text-indent": 0,
        "text-transform": "none",
        "letter-spacing": "normal",
        "word-spacing": "normal",
        overflow: "hidden",
        height: "1px",
        "margin-right": "-1px"
      } }, [
        this.html("mjx-left-box", { style: {
          display: "inline-block",
          width: 0,
          "float": "left"
        } }),
        this.html("mjx-ex-box", { style: {
          position: "absolute",
          overflow: "hidden",
          width: "1px",
          height: "60ex"
        } }),
        this.html("mjx-right-box", { style: {
          display: "inline-block",
          width: 0,
          "float": "right"
        } })
      ]);
      this.testDisplay = adaptor2.clone(this.testInline);
      adaptor2.setStyle(this.testDisplay, "display", "table");
      adaptor2.setStyle(this.testDisplay, "margin-right", "");
      adaptor2.setStyle(adaptor2.firstChild(this.testDisplay), "display", "none");
      const right = adaptor2.lastChild(this.testDisplay);
      adaptor2.setStyle(right, "display", "table-cell");
      adaptor2.setStyle(right, "width", "10000em");
      adaptor2.setStyle(right, "float", "");
    }
    return adaptor2.append(node, adaptor2.clone(display ? this.testDisplay : this.testInline));
  }
  /**
   * @param {N} node              The test node to measure
   * @param {boolean} getFamily   True if font family of surroundings is to be determined
   * @return {ExtendedMetrics}    The metric data for the given node
   */
  measureMetrics(node, getFamily) {
    const adaptor2 = this.adaptor;
    const family = getFamily ? adaptor2.fontFamily(node) : "";
    const em2 = adaptor2.fontSize(node);
    const [w, h] = adaptor2.nodeSize(adaptor2.childNode(node, 1));
    const ex = w ? h / 60 : em2 * this.options.exFactor;
    const containerWidth = !w ? 1e6 : adaptor2.getStyle(node, "display") === "table" ? adaptor2.nodeSize(adaptor2.lastChild(node))[0] - 1 : adaptor2.nodeBBox(adaptor2.lastChild(node)).left - adaptor2.nodeBBox(adaptor2.firstChild(node)).left - 2;
    const scale = Math.max(
      this.options.minScale,
      this.options.matchFontHeight ? ex / this.font.params.x_height / em2 : 1
    );
    const lineWidth = 1e6;
    return { em: em2, ex, containerWidth, lineWidth, scale, family };
  }
  /*****************************************************************/
  /**
   * @override
   */
  styleSheet(html) {
    this.setDocument(html);
    this.cssStyles.clear();
    this.cssStyles.addStyles(this.constructor.commonStyles);
    if ("getStyles" in html) {
      for (const styles of html.getStyles()) {
        this.cssStyles.addStyles(styles);
      }
    }
    this.addWrapperStyles(this.cssStyles);
    this.addFontStyles(this.cssStyles);
    const sheet = this.html("style", { id: "MJX-styles" }, [this.text("\n" + this.cssStyles.cssText + "\n")]);
    return sheet;
  }
  /**
   * @param {CssStyles} styles   The style object to add to
   */
  addFontStyles(styles) {
    styles.addStyles(this.font.styles);
  }
  /**
   * @param {CssStyles} styles   The style object to add to
   */
  addWrapperStyles(styles) {
    for (const kind of this.factory.getKinds()) {
      this.addClassStyles(this.factory.getNodeClass(kind), styles);
    }
  }
  /**
   * @param {typeof CommonWrapper} CLASS  The Wrapper class whose styles are to be added
   * @param {CssStyles} styles            The style object to add to.
   */
  addClassStyles(CLASS, styles) {
    styles.addStyles(CLASS.styles);
  }
  /*****************************************************************/
  /**
   * @param {MathDocument} html  The document to be used
   */
  setDocument(html) {
    if (html) {
      this.document = html;
      this.adaptor.document = html.document;
    }
  }
  /**
   * @param {string} type      The type of HTML node to create
   * @param {OptionList} def   The properties to set on the HTML node
   * @param {(N|T)[]} content  Array of child nodes to set for the HTML node
   * @param {string} ns        The namespace for the element
   * @return {N}               The newly created DOM tree
   */
  html(type, def = {}, content = [], ns) {
    return this.adaptor.node(type, def, content, ns);
  }
  /**
   * @param {string} text  The text string for which to make a text node
   *
   * @return {T}  A text node with the given text
   */
  text(text) {
    return this.adaptor.text(text);
  }
  /**
   * @param {number} m    A number to be shown with a fixed number of digits
   * @param {number=} n   The number of digits to use
   * @return {string}     The formatted number
   */
  fixed(m, n = 3) {
    if (Math.abs(m) < 6e-4) {
      return "0";
    }
    return m.toFixed(n).replace(/\.?0+$/, "");
  }
  /**
   * Measure text from a specific font, or that isn't in the MathJax font
   *
   * @param {string} text        The text to measure
   * @param {string} variant     The variant for the text
   * @param {CssFontData} font   The family, italic, and bold data for explicit fonts
   * @return {UnknownBBox}       The width, height, and depth of the text (in ems)
   */
  measureText(text, variant, font = ["", false, false]) {
    const node = this.unknownText(text, variant);
    if (variant === "-explicitFont") {
      const styles = this.cssFontStyles(font);
      this.adaptor.setAttributes(node, { style: styles });
    }
    return this.measureTextNodeWithCache(node, text, variant, font);
  }
  /**
   * Get the size of a text node, caching the result, and using
   *   a cached result, if there is one.
   *
   * @param {N} text         The text element to measure
   * @param {string} chars   The string contained in the text node
   * @param {string} variant     The variant for the text
   * @param {CssFontData} font   The family, italic, and bold data for explicit fonts
   * @return {UnknownBBox}   The width, height and depth for the text
   */
  measureTextNodeWithCache(text, chars, variant, font = ["", false, false]) {
    if (variant === "-explicitFont") {
      variant = [font[0], font[1] ? "T" : "F", font[2] ? "T" : "F", ""].join("-");
    }
    if (!this.unknownCache.has(variant)) {
      this.unknownCache.set(variant, /* @__PURE__ */ new Map());
    }
    const map = this.unknownCache.get(variant);
    const cached = map.get(chars);
    if (cached) return cached;
    const bbox = this.measureTextNode(text);
    map.set(chars, bbox);
    return bbox;
  }
  /**
   * Measure the width, height and depth of an annotation-xml node's content
   *
   * @param{N} xml          The xml content node to be measured
   * @return {UnknownBBox}  The width, height, and depth of the content
   */
  measureXMLnode(xml) {
    const adaptor2 = this.adaptor;
    const content = this.html("mjx-xml-block", { style: { display: "inline-block" } }, [adaptor2.clone(xml)]);
    const base = this.html("mjx-baseline", { style: { display: "inline-block", width: 0, height: 0 } });
    const style = {
      position: "absolute",
      display: "inline-block",
      "font-family": "initial",
      "line-height": "normal"
    };
    const node = this.html("mjx-measure-xml", { style }, [base, content]);
    adaptor2.append(adaptor2.parent(this.math.start.node), this.container);
    adaptor2.append(this.container, node);
    const em2 = this.math.metrics.em * this.math.metrics.scale;
    const { left, right, bottom, top } = adaptor2.nodeBBox(content);
    const w = (right - left) / em2;
    const h = (adaptor2.nodeBBox(base).top - top) / em2;
    const d = (bottom - top) / em2 - h;
    adaptor2.remove(this.container);
    adaptor2.remove(node);
    return { w, h, d };
  }
  /**
   * @param {CssFontData} font   The family, style, and weight for the given font
   * @param {StyleList} styles   The style object to add the font data to
   * @return {StyleList}         The modified (or initialized) style object
   */
  cssFontStyles(font, styles = {}) {
    const [family, italic2, bold2] = font;
    styles["font-family"] = this.font.getFamily(family);
    if (italic2) styles["font-style"] = "italic";
    if (bold2) styles["font-weight"] = "bold";
    return styles;
  }
  /**
   * @param {Styles} styles   The style object to query
   * @return {CssFontData}    The family, italic, and boolean values
   */
  getFontData(styles) {
    if (!styles) {
      styles = new Styles();
    }
    return [
      this.font.getFamily(styles.get("font-family")),
      styles.get("font-style") === "italic",
      styles.get("font-weight") === "bold"
    ];
  }
};

// node_modules/mathjax-full/ts/core/Tree/WrapperFactory.ts
var AbstractWrapperFactory = class extends AbstractFactory {
  /**
   * @param {N} node  The node to be wrapped
   * @param {any[]} args  Any additional arguments needed when wrapping the node
   * @return {W}  The newly wrapped node
   */
  wrap(node, ...args) {
    return this.create(node.kind, node, ...args);
  }
};

// node_modules/mathjax-full/ts/output/common/WrapperFactory.ts
var CommonWrapperFactory = class extends AbstractWrapperFactory {
  constructor() {
    super(...arguments);
    /**
     * The output jax associated with this factory
     */
    this.jax = null;
  }
  static {
    /**
     * The default list of wrapper nodes this factory can create
     *   (filled in by subclasses)
     */
    this.defaultNodes = {};
  }
  /**
   * @return {Object}  The list of node-creation functions
   */
  get Wrappers() {
    return this.node;
  }
};

// node_modules/mathjax-full/ts/util/BBox.ts
var BBox = class _BBox {
  static {
    /**
     * Constant for pwidth of full width box
     */
    this.fullWidth = "100%";
  }
  static {
    /**
     *  CSS styles that affect BBoxes
     */
    this.StyleAdjust = [
      ["borderTopWidth", "h"],
      ["borderRightWidth", "w"],
      ["borderBottomWidth", "d"],
      ["borderLeftWidth", "w", 0],
      ["paddingTop", "h"],
      ["paddingRight", "w"],
      ["paddingBottom", "d"],
      ["paddingLeft", "w", 0]
    ];
  }
  // offset for combining characters as accents
  /* tslint:enable */
  /**
   * @return {BBox}  A BBox initialized to zeros
   */
  static zero() {
    return new _BBox({ h: 0, d: 0, w: 0 });
  }
  /**
   * @return {BBox}  A BBox with height and depth not set
   */
  static empty() {
    return new _BBox();
  }
  /**
   * @param {BBoxData} def  The data with which to initialize the BBox
   *
   * @constructor
   */
  constructor(def = { w: 0, h: -BIGDIMEN, d: -BIGDIMEN }) {
    this.w = def.w || 0;
    this.h = "h" in def ? def.h : -BIGDIMEN;
    this.d = "d" in def ? def.d : -BIGDIMEN;
    this.L = this.R = this.ic = this.sk = this.dx = 0;
    this.scale = this.rscale = 1;
    this.pwidth = "";
  }
  /**
   * Set up a bbox for append() and combine() operations
   * @return {BBox}  the boox itself (for chaining calls)
   */
  empty() {
    this.w = 0;
    this.h = this.d = -BIGDIMEN;
    return this;
  }
  /**
   * Convert any unspecified values into zeros
   */
  clean() {
    if (this.w === -BIGDIMEN) this.w = 0;
    if (this.h === -BIGDIMEN) this.h = 0;
    if (this.d === -BIGDIMEN) this.d = 0;
  }
  /**
   * @param {number} scale  The scale to use to modify the bounding box size
   */
  rescale(scale) {
    this.w *= scale;
    this.h *= scale;
    this.d *= scale;
  }
  /**
   * @param {BBox} cbox  A bounding to combine with this one
   * @param {number} x   An x-offest for the child bounding box
   * @param {number} y   A y-offset for the child bounding box
   */
  combine(cbox, x = 0, y = 0) {
    let rscale = cbox.rscale;
    let w = x + rscale * (cbox.w + cbox.L + cbox.R);
    let h = y + rscale * cbox.h;
    let d = rscale * cbox.d - y;
    if (w > this.w) this.w = w;
    if (h > this.h) this.h = h;
    if (d > this.d) this.d = d;
  }
  /**
   * @param {BBox} cbox  A bounding box to be added to the right of this one
   */
  append(cbox) {
    let scale = cbox.rscale;
    this.w += scale * (cbox.w + cbox.L + cbox.R);
    if (scale * cbox.h > this.h) {
      this.h = scale * cbox.h;
    }
    if (scale * cbox.d > this.d) {
      this.d = scale * cbox.d;
    }
  }
  /**
   * @param {BBox} cbox  The bounding box to use to overwrite this one
   */
  updateFrom(cbox) {
    this.h = cbox.h;
    this.d = cbox.d;
    this.w = cbox.w;
    if (cbox.pwidth) {
      this.pwidth = cbox.pwidth;
    }
  }
};

// node_modules/mathjax-full/ts/core/Tree/Wrapper.ts
var AbstractWrapper = class {
  /**
   * The kind of this wrapper
   */
  get kind() {
    return this.node.kind;
  }
  /**
   * @param {WrapperFactory} factory  The WrapperFactory to use to wrap child nodes when needed
   * @param {Node} node               The node to wrap
   *
   * @constructor
   * @implements {Wrapper}
   */
  constructor(factory, node) {
    this.factory = factory;
    this.node = node;
  }
  /**
   * @override
   */
  wrap(node) {
    return this.factory.wrap(node);
  }
};

// node_modules/mathjax-full/ts/output/common/Wrapper.ts
var SMALLSIZE = 2 / 18;
function MathMLSpace(script2, size) {
  return script2 ? size < SMALLSIZE ? 0 : SMALLSIZE : size;
}
var CommonWrapper = class _CommonWrapper extends AbstractWrapper {
  /*******************************************************************/
  /**
   * @override
   */
  constructor(factory, node, parent = null) {
    super(factory, node);
    /**
     * The parent of this node
     */
    this.parent = null;
    /**
     * Styles that must be handled directly by the wrappers (mostly having to do with fonts)
     */
    this.removedStyles = null;
    /**
     * The explicit styles set by the node
     */
    this.styles = null;
    /**
     * The mathvariant for this node
     */
    this.variant = "";
    /**
     * Whether the bounding box has been computed yet
     */
    this.bboxComputed = false;
    /**
     * Delimiter data for stretching this node (NOSTRETCH means not yet determined)
     */
    this.stretch = NOSTRETCH;
    /**
     * Easy access to the font parameters
     */
    this.font = null;
    this.parent = parent;
    this.font = factory.jax.font;
    this.bbox = BBox.zero();
    this.getStyles();
    this.getVariant();
    this.getScale();
    this.getSpace();
    this.childNodes = node.childNodes.map((child) => {
      const wrapped = this.wrap(child);
      if (wrapped.bbox.pwidth && (node.notParent || node.isKind("math"))) {
        this.bbox.pwidth = BBox.fullWidth;
      }
      return wrapped;
    });
  }
  static {
    /**
     * The wrapper kind
     */
    this.kind = "unknown";
  }
  static {
    /**
     * Any styles needed for the class
     */
    this.styles = {};
  }
  static {
    /**
     * Styles that should not be passed on from style attribute
     */
    this.removeStyles = [
      "fontSize",
      "fontFamily",
      "fontWeight",
      "fontStyle",
      "fontVariant",
      "font"
    ];
  }
  static {
    /**
     * Non-MathML attributes on MathML elements NOT to be copied to the
     * corresponding DOM elements.  If set to false, then the attribute
     * WILL be copied.  Most of these (like the font attributes) are handled
     * in other ways.
     */
    this.skipAttributes = {
      fontfamily: true,
      fontsize: true,
      fontweight: true,
      fontstyle: true,
      color: true,
      background: true,
      "class": true,
      href: true,
      style: true,
      xmlns: true
    };
  }
  static {
    /**
     * The translation of mathvariant to bold styles, or to remove
     * bold from a mathvariant.
     */
    this.BOLDVARIANTS = {
      bold: {
        normal: "bold",
        italic: "bold-italic",
        fraktur: "bold-fraktur",
        script: "bold-script",
        "sans-serif": "bold-sans-serif",
        "sans-serif-italic": "sans-serif-bold-italic"
      },
      normal: {
        bold: "normal",
        "bold-italic": "italic",
        "bold-fraktur": "fraktur",
        "bold-script": "script",
        "bold-sans-serif": "sans-serif",
        "sans-serif-bold-italic": "sans-serif-italic"
      }
    };
  }
  static {
    /**
     * The translation of mathvariant to italic styles, or to remove
     * italic from a mathvariant.
     */
    this.ITALICVARIANTS = {
      italic: {
        normal: "italic",
        bold: "bold-italic",
        "sans-serif": "sans-serif-italic",
        "bold-sans-serif": "sans-serif-bold-italic"
      },
      normal: {
        italic: "normal",
        "bold-italic": "bold",
        "sans-serif-italic": "sans-serif",
        "sans-serif-bold-italic": "bold-sans-serif"
      }
    };
  }
  /**
   * Easy access to the output jax for this node
   */
  get jax() {
    return this.factory.jax;
  }
  /**
   * Easy access to the DOMAdaptor object
   */
  get adaptor() {
    return this.factory.jax.adaptor;
  }
  /**
   * Easy access to the metric data for this node
   */
  get metrics() {
    return this.factory.jax.math.metrics;
  }
  /**
   * True if children with percentage widths should be resolved by this container
   */
  get fixesPWidth() {
    return !this.node.notParent && !this.node.isToken;
  }
  /**
   * @param {MmlNode} node  The node to the wrapped
   * @param {W} parent  The wrapped parent node
   * @return {W}  The newly wrapped node
   */
  wrap(node, parent = null) {
    const wrapped = this.factory.wrap(node, parent || this);
    if (parent) {
      parent.childNodes.push(wrapped);
    }
    this.jax.nodeMap.set(node, wrapped);
    return wrapped;
  }
  /*******************************************************************/
  /**
   * Return the wrapped node's bounding box, either the cached one, if it exists,
   *   or computed directly if not.
   *
   * @param {boolean} save  Whether to cache the bbox or not (used for stretchy elements)
   * @return {BBox}  The computed bounding box
   */
  getBBox(save = true) {
    if (this.bboxComputed) {
      return this.bbox;
    }
    const bbox = save ? this.bbox : BBox.zero();
    this.computeBBox(bbox);
    this.bboxComputed = save;
    return bbox;
  }
  /**
   * Return the wrapped node's bounding box that includes borders and padding
   *
   * @param {boolean} save  Whether to cache the bbox or not (used for stretchy elements)
   * @return {BBox}  The computed bounding box
   */
  getOuterBBox(save = true) {
    const bbox = this.getBBox(save);
    if (!this.styles) return bbox;
    const obox = new BBox();
    Object.assign(obox, bbox);
    for (const [name, side] of BBox.StyleAdjust) {
      const x = this.styles.get(name);
      if (x) {
        obox[side] += this.length2em(x, 1, obox.rscale);
      }
    }
    return obox;
  }
  /**
   * @param {BBox} bbox           The bounding box to modify (either this.bbox, or an empty one)
   * @param {boolean} recompute   True if we are recomputing due to changes in children that have percentage widths
   */
  computeBBox(bbox, recompute = false) {
    bbox.empty();
    for (const child of this.childNodes) {
      bbox.append(child.getOuterBBox());
    }
    bbox.clean();
    if (this.fixesPWidth && this.setChildPWidths(recompute)) {
      this.computeBBox(bbox, true);
    }
  }
  /**
   * Recursively resolve any percentage widths in the child nodes using the given
   *   container width (or the child width, if none was passed).
   *   Overriden for mtables in order to compute the width.
   *
   * @param {boolean} recompute  True if we are recomputing due to changes in children
   * @param {(number|null)=} w   The width of the container (from which percentages are computed)
   * @param {boolean=} clear     True if pwidth marker is to be cleared
   * @return {boolean}           True if a percentage width was found
   */
  setChildPWidths(recompute, w = null, clear = true) {
    if (recompute) {
      return false;
    }
    if (clear) {
      this.bbox.pwidth = "";
    }
    let changed = false;
    for (const child of this.childNodes) {
      const cbox = child.getOuterBBox();
      if (cbox.pwidth && child.setChildPWidths(recompute, w === null ? cbox.w : w, clear)) {
        changed = true;
      }
    }
    return changed;
  }
  /**
   * Mark BBox to be computed again (e.g., when an mo has stretched)
   */
  invalidateBBox() {
    if (this.bboxComputed) {
      this.bboxComputed = false;
      if (this.parent) {
        this.parent.invalidateBBox();
      }
    }
  }
  /**
   * Copy child skew and italic correction
   *
   * @param {BBox} bbox  The bounding box to modify
   */
  copySkewIC(bbox) {
    const first = this.childNodes[0];
    if (first?.bbox.sk) {
      bbox.sk = first.bbox.sk;
    }
    if (first?.bbox.dx) {
      bbox.dx = first.bbox.dx;
    }
    const last = this.childNodes[this.childNodes.length - 1];
    if (last?.bbox.ic) {
      bbox.ic = last.bbox.ic;
      bbox.w += bbox.ic;
    }
  }
  /*******************************************************************/
  /**
   * Add the style attribute, but remove any font-related styles
   *   (since these are handled separately by the variant)
   */
  getStyles() {
    const styleString = this.node.attributes.getExplicit("style");
    if (!styleString) return;
    const style = this.styles = new Styles(styleString);
    for (let i = 0, m = _CommonWrapper.removeStyles.length; i < m; i++) {
      const id = _CommonWrapper.removeStyles[i];
      if (style.get(id)) {
        if (!this.removedStyles) this.removedStyles = {};
        this.removedStyles[id] = style.get(id);
        style.set(id, "");
      }
    }
  }
  /**
   * Get the mathvariant (or construct one, if needed).
   */
  getVariant() {
    if (!this.node.isToken) return;
    const attributes = this.node.attributes;
    let variant = attributes.get("mathvariant");
    if (!attributes.getExplicit("mathvariant")) {
      const values = attributes.getList("fontfamily", "fontweight", "fontstyle");
      if (this.removedStyles) {
        const style = this.removedStyles;
        if (style.fontFamily) values.family = style.fontFamily;
        if (style.fontWeight) values.weight = style.fontWeight;
        if (style.fontStyle) values.style = style.fontStyle;
      }
      if (values.fontfamily) values.family = values.fontfamily;
      if (values.fontweight) values.weight = values.fontweight;
      if (values.fontstyle) values.style = values.fontstyle;
      if (values.weight && values.weight.match(/^\d+$/)) {
        values.weight = parseInt(values.weight) > 600 ? "bold" : "normal";
      }
      if (values.family) {
        variant = this.explicitVariant(values.family, values.weight, values.style);
      } else {
        if (this.node.getProperty("variantForm")) variant = "-tex-variant";
        variant = (_CommonWrapper.BOLDVARIANTS[values.weight] || {})[variant] || variant;
        variant = (_CommonWrapper.ITALICVARIANTS[values.style] || {})[variant] || variant;
      }
    }
    this.variant = variant;
  }
  /**
   * Set the CSS for a token element having an explicit font (rather than regular mathvariant).
   *
   * @param {string} fontFamily  The font family to use
   * @param {string} fontWeight  The font weight to use
   * @param {string} fontStyle   The font style to use
   */
  explicitVariant(fontFamily, fontWeight, fontStyle) {
    let style = this.styles;
    if (!style) style = this.styles = new Styles();
    style.set("fontFamily", fontFamily);
    if (fontWeight) style.set("fontWeight", fontWeight);
    if (fontStyle) style.set("fontStyle", fontStyle);
    return "-explicitFont";
  }
  /**
   * Determine the scaling factor to use for this wrapped node, and set the styles for it.
   */
  getScale() {
    let scale = 1, parent = this.parent;
    let pscale = parent ? parent.bbox.scale : 1;
    let attributes = this.node.attributes;
    let scriptlevel = Math.min(attributes.get("scriptlevel"), 2);
    let fontsize = attributes.get("fontsize");
    let mathsize = this.node.isToken || this.node.isKind("mstyle") ? attributes.get("mathsize") : attributes.getInherited("mathsize");
    if (scriptlevel !== 0) {
      scale = Math.pow(attributes.get("scriptsizemultiplier"), scriptlevel);
      let scriptminsize = this.length2em(attributes.get("scriptminsize"), 0.8, 1);
      if (scale < scriptminsize) scale = scriptminsize;
    }
    if (this.removedStyles && this.removedStyles.fontSize && !fontsize) {
      fontsize = this.removedStyles.fontSize;
    }
    if (fontsize && !attributes.getExplicit("mathsize")) {
      mathsize = fontsize;
    }
    if (mathsize !== "1") {
      scale *= this.length2em(mathsize, 1, 1);
    }
    this.bbox.scale = scale;
    this.bbox.rscale = scale / pscale;
  }
  /**
   * Sets the spacing based on TeX or MathML algorithm
   */
  getSpace() {
    const isTop = this.isTopEmbellished();
    const hasSpacing = this.node.hasSpacingAttributes();
    if (this.jax.options.mathmlSpacing || hasSpacing) {
      isTop && this.getMathMLSpacing();
    } else {
      this.getTeXSpacing(isTop, hasSpacing);
    }
  }
  /**
   * Get the spacing using MathML rules based on the core MO
   */
  getMathMLSpacing() {
    const node = this.node.coreMO();
    const child = node.coreParent();
    const parent = child.parent;
    if (!parent || !parent.isKind("mrow") || parent.childNodes.length === 1) return;
    const attributes = node.attributes;
    const isScript = attributes.get("scriptlevel") > 0;
    this.bbox.L = attributes.isSet("lspace") ? Math.max(0, this.length2em(attributes.get("lspace"))) : MathMLSpace(isScript, node.lspace);
    this.bbox.R = attributes.isSet("rspace") ? Math.max(0, this.length2em(attributes.get("rspace"))) : MathMLSpace(isScript, node.rspace);
    const n = parent.childIndex(child);
    if (n === 0) return;
    const prev = parent.childNodes[n - 1];
    if (!prev.isEmbellished) return;
    const bbox = this.jax.nodeMap.get(prev).getBBox();
    if (bbox.R) {
      this.bbox.L = Math.max(0, this.bbox.L - bbox.R);
    }
  }
  /**
   * Get the spacing using the TeX rules
   *
   * @parm {boolean} isTop       True when this is a top-level embellished operator
   * @parm {boolean} hasSpacing  True when there is an explicit or inherited 'form' attribute
   */
  getTeXSpacing(isTop, hasSpacing) {
    if (!hasSpacing) {
      const space = this.node.texSpacing();
      if (space) {
        this.bbox.L = this.length2em(space);
      }
    }
    if (isTop || hasSpacing) {
      const attributes = this.node.coreMO().attributes;
      if (attributes.isSet("lspace")) {
        this.bbox.L = Math.max(0, this.length2em(attributes.get("lspace")));
      }
      if (attributes.isSet("rspace")) {
        this.bbox.R = Math.max(0, this.length2em(attributes.get("rspace")));
      }
    }
  }
  /**
   * @return {boolean}   True if this is the top-most container of an embellished operator that is
   *                       itself an embellished operator (the maximal embellished operator for its core)
   */
  isTopEmbellished() {
    return this.node.isEmbellished && !(this.node.parent && this.node.parent.isEmbellished);
  }
  /*******************************************************************/
  /**
   * @return {CommonWrapper}  The wrapper for this node's core node
   */
  core() {
    return this.jax.nodeMap.get(this.node.core());
  }
  /**
   * @return {CommonWrapper}  The wrapper for this node's core <mo> node
   */
  coreMO() {
    return this.jax.nodeMap.get(this.node.coreMO());
  }
  /**
   * @return {string}  For a token node, the combined text content of the node's children
   */
  getText() {
    let text = "";
    if (this.node.isToken) {
      for (const child of this.node.childNodes) {
        if (child instanceof TextNode) {
          text += child.getText();
        }
      }
    }
    return text;
  }
  /**
   * @param {DIRECTION} direction  The direction to stretch this node
   * @return {boolean}             Whether the node can stretch in that direction
   */
  canStretch(direction) {
    this.stretch = NOSTRETCH;
    if (this.node.isEmbellished) {
      let core = this.core();
      if (core && core.node !== this.node) {
        if (core.canStretch(direction)) {
          this.stretch = core.stretch;
        }
      }
    }
    return this.stretch.dir !== 0 /* None */;
  }
  /**
   * @return {[string, number]}  The alignment and indentation shift for the expression
   */
  getAlignShift() {
    let { indentalign, indentshift, indentalignfirst, indentshiftfirst } = this.node.attributes.getList(...indentAttributes);
    if (indentalignfirst !== "indentalign") {
      indentalign = indentalignfirst;
    }
    if (indentalign === "auto") {
      indentalign = this.jax.options.displayAlign;
    }
    if (indentshiftfirst !== "indentshift") {
      indentshift = indentshiftfirst;
    }
    if (indentshift === "auto") {
      indentshift = this.jax.options.displayIndent;
      if (indentalign === "right" && !indentshift.match(/^\s*0[a-z]*\s*$/)) {
        indentshift = ("-" + indentshift.trim()).replace(/^--/, "");
      }
    }
    const shift = this.length2em(indentshift, this.metrics.containerWidth);
    return [indentalign, shift];
  }
  /**
   * @param {number} W       The total width
   * @param {BBox} bbox      The bbox to be aligned
   * @param {string} align   How to align (left, center, right)
   * @return {number}        The x position of the aligned width
   */
  getAlignX(W, bbox, align) {
    return align === "right" ? W - (bbox.w + bbox.R) * bbox.rscale : align === "left" ? bbox.L * bbox.rscale : (W - bbox.w * bbox.rscale) / 2;
  }
  /**
   * @param {number} H        The total height
   * @param {number} D        The total depth
   * @param {number} h        The height to be aligned
   * @param {number} d        The depth to be aligned
   * @param {string} align    How to align (top, bottom, center, axis, baseline)
   * @return {number}         The y position of the aligned baseline
   */
  getAlignY(H2, D, h, d, align) {
    return align === "top" ? H2 - h : align === "bottom" ? d - D : align === "center" ? (H2 - h - (D - d)) / 2 : 0;
  }
  /**
   * @param {number} i   The index of the child element whose container is needed
   * @return {number}    The inner width as a container (for percentage widths)
   */
  getWrapWidth(i) {
    return this.childNodes[i].getBBox().w;
  }
  /**
   * @param {number} i   The index of the child element whose container is needed
   * @return {string}    The alignment child element
   */
  getChildAlign(_i) {
    return "left";
  }
  /*******************************************************************/
  /*
   * Easy access to some utility routines
   */
  /**
   * @param {number} m  A number to be shown as a percent
   * @return {string}  The number m as a percent
   */
  percent(m) {
    return percent(m);
  }
  /**
   * @param {number} m  A number to be shown in ems
   * @return {string}  The number with units of ems
   */
  em(m) {
    return em(m);
  }
  /**
   * @param {number} m   A number of em's to be shown as pixels
   * @param {number} M   The minimum number of pixels to allow
   * @return {string}  The number with units of px
   */
  px(m, M = -BIGDIMEN) {
    return px(m, M, this.metrics.em);
  }
  /**
   * @param {Property} length  A dimension (giving number and units) or number to be converted to ems
   * @param {number} size  The default size of the dimension (for percentage values)
   * @param {number} scale  The current scaling factor (to handle absolute units)
   * @return {number}  The dimension converted to ems
   */
  length2em(length, size = 1, scale = null) {
    if (scale === null) {
      scale = this.bbox.scale;
    }
    return length2em(length, size, scale, this.jax.pxPerEm);
  }
  /**
   * @param {string} text   The text to turn into unicode locations
   * @param {string} name   The name of the variant for the characters
   * @return {number[]}     Array of numbers represeting the string's unicode character positions
   */
  unicodeChars(text, name = this.variant) {
    let chars = unicodeChars(text);
    const variant = this.font.getVariant(name);
    if (variant && variant.chars) {
      const map = variant.chars;
      chars = chars.map((n) => ((map[n] || [])[3] || {}).smp || n);
    }
    return chars;
  }
  /**
   * @param {number[]} chars    The array of unicode character numbers to remap
   * @return {number[]}         The converted array
   */
  remapChars(chars) {
    return chars;
  }
  /**
   * @param {string} text   The text from which to create a TextNode object
   * @return {TextNode}     The TextNode with the given text
   */
  mmlText(text) {
    return this.node.factory.create("text").setText(text);
  }
  /**
   * @param {string} kind             The kind of MmlNode to create
   * @param {ProperyList} properties  The properties to set initially
   * @param {MmlNode[]} children      The child nodes to add to the created node
   * @return {MmlNode}                The newly created MmlNode
   */
  mmlNode(kind, properties = {}, children = []) {
    return this.node.factory.create(kind, properties, children);
  }
  /**
   * Create an mo wrapper with the given text,
   *   link it in, and give it the right defaults.
   *
   * @param {string} text     The text for the wrapped element
   * @return {CommonWrapper}  The wrapped MmlMo node
   */
  createMo(text) {
    const mmlFactory = this.node.factory;
    const textNode = mmlFactory.create("text").setText(text);
    const mml = mmlFactory.create("mo", { stretchy: true }, [textNode]);
    mml.inheritAttributesFrom(this.node);
    const node = this.wrap(mml);
    node.parent = this;
    return node;
  }
  /**
   * @param {string} variant   The variant in which to look for the character
   * @param {number} n         The number of the character to look up
   * @return {CharData}        The full CharData object, with CharOptions guaranteed to be defined
   */
  getVariantChar(variant, n) {
    const char = this.font.getChar(variant, n) || [0, 0, 0, { unknown: true }];
    if (char.length === 3) {
      char[3] = {};
    }
    return char;
  }
};

// node_modules/mathjax-full/ts/output/svg/Wrapper.ts
var SVGWrapper = class _SVGWrapper extends CommonWrapper {
  constructor() {
    super(...arguments);
    /**
     * The SVG element generated for this wrapped node
     */
    this.element = null;
    /**
     * Offset due to border/padding
     */
    this.dx = 0;
  }
  static {
    /**
     * The kind of wrapper
     */
    this.kind = "unknown";
  }
  static {
    /**
     * A fuzz factor for borders to avoid anti-alias problems at the edges
     */
    this.borderFuzz = 5e-3;
  }
  /*******************************************************************/
  /**
   * Create the HTML for the wrapped node.
   *
   * @param {N} parent  The HTML node where the output is added
   */
  toSVG(parent) {
    this.addChildren(this.standardSVGnode(parent));
  }
  /**
   * @param {N} parent  The element in which to add the children
   */
  addChildren(parent) {
    let x = 0;
    for (const child of this.childNodes) {
      child.toSVG(parent);
      const bbox = child.getOuterBBox();
      if (child.element) {
        child.place(x + bbox.L * bbox.rscale, 0);
      }
      x += (bbox.L + bbox.w + bbox.R) * bbox.rscale;
    }
  }
  /*******************************************************************/
  /**
   * Create the standard SVG element for the given wrapped node.
   *
   * @param {N} parent  The HTML element in which the node is to be created
   * @returns {N}  The root of the HTML tree for the wrapped node's output
   */
  standardSVGnode(parent) {
    const svg = this.createSVGnode(parent);
    this.handleStyles();
    this.handleScale();
    this.handleBorder();
    this.handleColor();
    this.handleAttributes();
    return svg;
  }
  /**
   * @param {N} parent  The HTML element in which the node is to be created
   * @returns {N}  The root of the HTML tree for the wrapped node's output
   */
  createSVGnode(parent) {
    this.element = this.svg("g", { "data-mml-node": this.node.kind });
    const href = this.node.attributes.get("href");
    if (href) {
      parent = this.adaptor.append(parent, this.svg("a", { href }));
      const { h, d, w } = this.getOuterBBox();
      this.adaptor.append(this.element, this.svg("rect", {
        "data-hitbox": true,
        fill: "none",
        stroke: "none",
        "pointer-events": "all",
        width: this.fixed(w),
        height: this.fixed(h + d),
        y: this.fixed(-d)
      }));
    }
    this.adaptor.append(parent, this.element);
    return this.element;
  }
  /**
   * Set the CSS styles for the svg element
   */
  handleStyles() {
    if (!this.styles) return;
    const styles = this.styles.cssText;
    if (styles) {
      this.adaptor.setAttribute(this.element, "style", styles);
    }
    BBox.StyleAdjust.forEach(([name, , lr]) => {
      if (lr !== 0) return;
      const x = this.styles.get(name);
      if (x) {
        this.dx += this.length2em(x, 1, this.bbox.rscale);
      }
    });
  }
  /**
   * Set the (relative) scaling factor for the node
   */
  handleScale() {
    if (this.bbox.rscale !== 1) {
      const scale = "scale(" + this.fixed(this.bbox.rscale / 1e3, 3) + ")";
      this.adaptor.setAttribute(this.element, "transform", scale);
    }
  }
  /**
   * Add the foreground and background colors
   * (Only look at explicit attributes, since inherited ones will
   *  be applied to a parent element, and we will inherit from that)
   */
  handleColor() {
    const adaptor2 = this.adaptor;
    const attributes = this.node.attributes;
    const mathcolor = attributes.getExplicit("mathcolor");
    const color = attributes.getExplicit("color");
    const mathbackground = attributes.getExplicit("mathbackground");
    const background = attributes.getExplicit("background");
    const bgcolor = this.styles?.get("background-color") || "";
    if (mathcolor || color) {
      adaptor2.setAttribute(this.element, "fill", mathcolor || color);
      adaptor2.setAttribute(this.element, "stroke", mathcolor || color);
    }
    if (mathbackground || background || bgcolor) {
      let { h, d, w } = this.getOuterBBox();
      let rect = this.svg("rect", {
        fill: mathbackground || background || bgcolor,
        x: this.fixed(-this.dx),
        y: this.fixed(-d),
        width: this.fixed(w),
        height: this.fixed(h + d),
        "data-bgcolor": true
      });
      let child = adaptor2.firstChild(this.element);
      if (child) {
        adaptor2.insert(rect, child);
      } else {
        adaptor2.append(this.element, rect);
      }
    }
  }
  /**
   * Create the borders, if any are requested.
   */
  handleBorder() {
    if (!this.styles) return;
    const width = Array(4).fill(0);
    const style = Array(4);
    const color = Array(4);
    for (const [name, i] of [["Top", 0], ["Right", 1], ["Bottom", 2], ["Left", 3]]) {
      const key = "border" + name;
      const w2 = this.styles.get(key + "Width");
      if (!w2) continue;
      width[i] = Math.max(0, this.length2em(w2, 1, this.bbox.rscale));
      style[i] = this.styles.get(key + "Style") || "solid";
      color[i] = this.styles.get(key + "Color") || "currentColor";
    }
    const f = _SVGWrapper.borderFuzz;
    const bbox = this.getOuterBBox();
    const [h, d, w] = [bbox.h + f, bbox.d + f, bbox.w + f];
    const outerRT = [w, h];
    const outerLT = [-f, h];
    const outerRB = [w, -d];
    const outerLB = [-f, -d];
    const innerRT = [w - width[1], h - width[0]];
    const innerLT = [-f + width[3], h - width[0]];
    const innerRB = [w - width[1], -d + width[2]];
    const innerLB = [-f + width[3], -d + width[2]];
    const paths = [
      [outerLT, outerRT, innerRT, innerLT],
      [outerRB, outerRT, innerRT, innerRB],
      [outerLB, outerRB, innerRB, innerLB],
      [outerLB, outerLT, innerLT, innerLB]
    ];
    const adaptor2 = this.adaptor;
    const child = adaptor2.firstChild(this.element);
    for (const i of [0, 1, 2, 3]) {
      if (!width[i]) continue;
      const path = paths[i];
      if (style[i] === "dashed" || style[i] === "dotted") {
        this.addBorderBroken(path, color[i], style[i], width[i], i);
      } else {
        this.addBorderSolid(path, color[i], child);
      }
    }
  }
  /**
   * Create a solid border piece with the given color
   *
   * @param {[number, number][]} path    The points for the border segment
   * @param {string} color               The color to use
   * @param {N} child                    Insert the border before this child, if any
   */
  addBorderSolid(path, color, child) {
    const border = this.svg("polygon", {
      points: path.map(([x, y]) => `${this.fixed(x - this.dx)},${this.fixed(y)}`).join(" "),
      stroke: "none",
      fill: color
    });
    if (child) {
      this.adaptor.insert(border, child);
    } else {
      this.adaptor.append(this.element, border);
    }
  }
  /**
   * Create a dashed or dotted border line with the given width and color
   *
   * @param {[number, number][]} path   The points for the border segment
   * @param {string} color              The color to use
   * @param {string} style              Either 'dotted' or 'dashed'
   * @param {number} t                  The thickness for the border line
   * @param {number} i                  The side being drawn
   */
  addBorderBroken(path, color, style, t, i) {
    const dot = style === "dotted";
    const t2 = t / 2;
    const [tx1, ty1, tx2, ty2] = [[t2, -t2, -t2, -t2], [-t2, t2, -t2, -t2], [t2, t2, -t2, t2], [t2, t2, t2, -t2]][i];
    const [A, B] = path;
    const x1 = A[0] + tx1 - this.dx, y1 = A[1] + ty1;
    const x2 = B[0] + tx2 - this.dx, y2 = B[1] + ty2;
    const W = Math.abs(i % 2 ? y2 - y1 : x2 - x1);
    const n = dot ? Math.ceil(W / (2 * t)) : Math.ceil((W - t) / (4 * t));
    const m = W / (4 * n + 1);
    const line = this.svg("line", {
      x1: this.fixed(x1),
      y1: this.fixed(y1),
      x2: this.fixed(x2),
      y2: this.fixed(y2),
      "stroke-width": this.fixed(t),
      stroke: color,
      "stroke-linecap": dot ? "round" : "square",
      "stroke-dasharray": dot ? [1, this.fixed(W / n - 2e-3)].join(" ") : [this.fixed(m), this.fixed(3 * m)].join(" ")
    });
    const adaptor2 = this.adaptor;
    const child = adaptor2.firstChild(this.element);
    if (child) {
      adaptor2.insert(line, child);
    } else {
      adaptor2.append(this.element, line);
    }
  }
  /**
   * Copy RDFa, aria, and other tags from the MathML to the SVG output nodes.
   * Don't copy those in the skipAttributes list, or anything that already exists
   * as a property of the node (e.g., no "onlick", etc.).  If a name in the
   * skipAttributes object is set to false, then the attribute WILL be copied.
   * Add the class to any other classes already in use.
   */
  handleAttributes() {
    const attributes = this.node.attributes;
    const defaults = attributes.getAllDefaults();
    const skip = _SVGWrapper.skipAttributes;
    for (const name of attributes.getExplicitNames()) {
      if (skip[name] === false || !(name in defaults) && !skip[name] && !this.adaptor.hasAttribute(this.element, name)) {
        this.adaptor.setAttribute(this.element, name, attributes.getExplicit(name));
      }
    }
    if (attributes.get("class")) {
      const names = attributes.get("class").trim().split(/ +/);
      for (const name of names) {
        this.adaptor.addClass(this.element, name);
      }
    }
  }
  /*******************************************************************/
  /**
   * @param {number} x   The x-offset for the element
   * @param {number} y   The y-offset for the element
   * @param {N} element  The element to be placed
   */
  place(x, y, element = null) {
    x += this.dx;
    if (!(x || y)) return;
    if (!element) {
      element = this.element;
      y = this.handleId(y);
    }
    const translate2 = `translate(${this.fixed(x)},${this.fixed(y)})`;
    const transform = this.adaptor.getAttribute(element, "transform") || "";
    this.adaptor.setAttribute(element, "transform", translate2 + (transform ? " " + transform : ""));
  }
  /**
   * Firefox and Safari don't scroll to the top of the element with an Id, so
   *   we shift the element up and then translate its contents down in order to
   *   correct for their positioning.  Also, Safari will go to the baseline of
   *   a <text> element (e.g., when mtextInheritFont is true), so add a text
   *   element to help Safari get the right location.
   *
   * @param {number} y     The current offset of the element
   * @return {number}      The new offset for the element if it has an id
   */
  handleId(y) {
    if (!this.node.attributes || !this.node.attributes.get("id")) {
      return y;
    }
    const adaptor2 = this.adaptor;
    const h = this.getBBox().h;
    const children = adaptor2.childNodes(this.element);
    children.forEach((child) => adaptor2.remove(child));
    const g = this.svg("g", { "data-idbox": true, transform: `translate(0,${this.fixed(-h)})` }, children);
    adaptor2.append(this.element, this.svg("text", { "data-id-align": true }, [this.text("")]));
    adaptor2.append(this.element, g);
    return y + h;
  }
  /**
   * Return the first child element, skipping id align boxes and href hit boxes
   *
   * @return {N}   The first "real" child element
   */
  firstChild() {
    const adaptor2 = this.adaptor;
    let child = adaptor2.firstChild(this.element);
    if (child && adaptor2.kind(child) === "text" && adaptor2.getAttribute(child, "data-id-align")) {
      child = adaptor2.firstChild(adaptor2.next(child));
    }
    if (child && adaptor2.kind(child) === "rect" && adaptor2.getAttribute(child, "data-hitbox")) {
      child = adaptor2.next(child);
    }
    return child;
  }
  /**
   * @param {number} n        The character number
   * @param {number} x        The x-position of the character
   * @param {number} y        The y-position of the character
   * @param {N} parent        The container for the character
   * @param {string} variant  The variant to use for the character
   * @return {number}         The width of the character
   */
  placeChar(n, x, y, parent, variant = null) {
    if (variant === null) {
      variant = this.variant;
    }
    const C = n.toString(16).toUpperCase();
    const [, , w, data] = this.getVariantChar(variant, n);
    if ("p" in data) {
      const path = data.p ? "M" + data.p + "Z" : "";
      this.place(x, y, this.adaptor.append(parent, this.charNode(variant, C, path)));
    } else if ("c" in data) {
      const g = this.adaptor.append(parent, this.svg("g", { "data-c": C }));
      this.place(x, y, g);
      x = 0;
      for (const n2 of this.unicodeChars(data.c, variant)) {
        x += this.placeChar(n2, x, y, g, variant);
      }
    } else if (data.unknown) {
      const char = String.fromCodePoint(n);
      const text = this.adaptor.append(parent, this.jax.unknownText(char, variant));
      this.place(x, y, text);
      return this.jax.measureTextNodeWithCache(text, char, variant).w;
    }
    return w;
  }
  /**
   * @param {string} variant    The name of the variant being used
   * @param {string} C          The hex string for the character code
   * @param {string} path       The data from the character
   * @return {N}                The <path> or <use> node for the glyph
   */
  charNode(variant, C, path) {
    const cache = this.jax.options.fontCache;
    return cache !== "none" ? this.useNode(variant, C, path) : this.pathNode(C, path);
  }
  /**
   * @param {string} C          The hex string for the character code
   * @param {string} path       The data from the character
   * @return {N}                The <path> for the glyph
   */
  pathNode(C, path) {
    return this.svg("path", { "data-c": C, d: path });
  }
  /**
   * @param {string} variant    The name of the variant being used
   * @param {string} C          The hex string for the character code
   * @param {string} path       The data from the character
   * @return {N}                The <use> node for the glyph
   */
  useNode(variant, C, path) {
    const use = this.svg("use", { "data-c": C });
    const id = "#" + this.jax.fontCache.cachePath(variant, C, path);
    this.adaptor.setAttribute(use, "href", id, XLINKNS);
    return use;
  }
  /*******************************************************************/
  /**
   * For debugging
   */
  drawBBox() {
    let { w, h, d } = this.getBBox();
    const box = this.svg("g", { style: {
      opacity: 0.25
    } }, [
      this.svg("rect", {
        fill: "red",
        height: this.fixed(h),
        width: this.fixed(w)
      }),
      this.svg("rect", {
        fill: "green",
        height: this.fixed(d),
        width: this.fixed(w),
        y: this.fixed(-d)
      })
    ]);
    const node = this.element || this.parent.element;
    this.adaptor.append(node, box);
  }
  /*******************************************************************/
  /*
   * Easy access to some utility routines
   */
  /**
   * @param {string} type      The tag name of the HTML node to be created
   * @param {OptionList} def   The properties to set for the created node
   * @param {(N|T)[]} content  The child nodes for the created HTML node
   * @return {N}               The generated HTML tree
   */
  html(type, def = {}, content = []) {
    return this.jax.html(type, def, content);
  }
  /**
   * @param {string} type      The tag name of the svg node to be created
   * @param {OptionList} def   The properties to set for the created node
   * @param {(N|T)[]} content  The child nodes for the created SVG node
   * @return {N}               The generated SVG tree
   */
  svg(type, def = {}, content = []) {
    return this.jax.svg(type, def, content);
  }
  /**
   * @param {string} text  The text from which to create an HTML text node
   * @return {T}  The generated text node with the given text
   */
  text(text) {
    return this.jax.text(text);
  }
  /**
   * @param {number} x   The dimension to display
   * @param {number=} n  The number of digits to display
   * @return {string}    The dimension with the given number of digits (minus trailing zeros)
   */
  fixed(x, n = 1) {
    return this.jax.fixed(x * 1e3, n);
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/math.ts
function CommonMathMixin(Base) {
  return class extends Base {
    /**
     * @override
     */
    getWrapWidth(_i) {
      return this.parent ? this.getBBox().w : this.metrics.containerWidth / this.jax.pxPerEm;
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/math.ts
var SVGmath = class extends CommonMathMixin(SVGWrapper) {
  static {
    /**
     * The math wrapper
     */
    this.kind = MmlMath.prototype.kind;
  }
  static {
    /**
     * @overreide
     */
    this.styles = {
      'mjx-container[jax="SVG"][display="true"]': {
        display: "block",
        "text-align": "center",
        margin: "1em 0"
      },
      'mjx-container[jax="SVG"][display="true"][width="full"]': {
        display: "flex"
      },
      'mjx-container[jax="SVG"][justify="left"]': {
        "text-align": "left"
      },
      'mjx-container[jax="SVG"][justify="right"]': {
        "text-align": "right"
      }
    };
  }
  /**
   * @override
   */
  toSVG(parent) {
    super.toSVG(parent);
    const adaptor2 = this.adaptor;
    const display = this.node.attributes.get("display") === "block";
    if (display) {
      adaptor2.setAttribute(this.jax.container, "display", "true");
      this.handleDisplay();
    }
    if (this.jax.document.options.internalSpeechTitles) {
      this.handleSpeech();
    }
  }
  /**
   * Set the justification, and get the minwidth and shift needed
   * for the displayed equation.
   */
  handleDisplay() {
    const [align, shift] = this.getAlignShift();
    if (align !== "center") {
      this.adaptor.setAttribute(this.jax.container, "justify", align);
    }
    if (this.bbox.pwidth === BBox.fullWidth) {
      this.adaptor.setAttribute(this.jax.container, "width", "full");
      if (this.jax.table) {
        let { L, w, R } = this.jax.table.getOuterBBox();
        if (align === "right") {
          R = Math.max(R || -shift, -shift);
        } else if (align === "left") {
          L = Math.max(L || shift, shift);
        } else if (align === "center") {
          w += 2 * Math.abs(shift);
        }
        this.jax.minwidth = Math.max(0, L + w + R);
      }
    } else {
      this.jax.shift = shift;
    }
  }
  /**
   * Handle adding speech to the top-level node, if any.
   */
  handleSpeech() {
    const adaptor2 = this.adaptor;
    const attributes = this.node.attributes;
    const speech = attributes.get("aria-label") || attributes.get("data-semantic-speech");
    if (speech) {
      const id = this.getTitleID();
      const label = this.svg("title", { id }, [this.text(speech)]);
      adaptor2.insert(label, adaptor2.firstChild(this.element));
      adaptor2.setAttribute(this.element, "aria-labeledby", id);
      adaptor2.removeAttribute(this.element, "aria-label");
      for (const child of this.childNodes[0].childNodes) {
        adaptor2.setAttribute(child.element, "aria-hidden", "true");
      }
    }
  }
  /**
   * @return {string}  A unique ID to use for aria-labeledby title elements
   */
  getTitleID() {
    return "mjx-svg-title-" + String(this.jax.options.titleID++);
  }
  /**
   * @override
   */
  setChildPWidths(recompute, w = null, _clear = true) {
    return super.setChildPWidths(
      recompute,
      this.parent ? w : this.metrics.containerWidth / this.jax.pxPerEm,
      false
    );
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/mrow.ts
function CommonMrowMixin(Base) {
  return class extends Base {
    /**
     * @override
     */
    get fixesPWidth() {
      return false;
    }
    /**
     * @override
     * @constructor
     */
    constructor(...args) {
      super(...args);
      this.stretchChildren();
      for (const child of this.childNodes) {
        if (child.bbox.pwidth) {
          this.bbox.pwidth = BBox.fullWidth;
          break;
        }
      }
    }
    /**
     * Handle vertical stretching of children to match height of
     *  other nodes in the row.
     */
    stretchChildren() {
      let stretchy = [];
      for (const child of this.childNodes) {
        if (child.canStretch(1 /* Vertical */)) {
          stretchy.push(child);
        }
      }
      let count = stretchy.length;
      let nodeCount = this.childNodes.length;
      if (count && nodeCount > 1) {
        let H2 = 0, D = 0;
        let all = count > 1 && count === nodeCount;
        for (const child of this.childNodes) {
          const noStretch = child.stretch.dir === 0 /* None */;
          if (all || noStretch) {
            let { h, d, rscale } = child.getOuterBBox(noStretch);
            h *= rscale;
            d *= rscale;
            if (h > H2) H2 = h;
            if (d > D) D = d;
          }
        }
        for (const child of stretchy) {
          child.coreMO().getStretchedVariant([H2, D]);
        }
      }
    }
  };
}
function CommonInferredMrowMixin(Base) {
  return class extends Base {
    /**
     * Since inferred rows don't produce a container span, we can't
     * set a font-size for it, so we inherit the parent scale
     *
     * @override
     */
    getScale() {
      this.bbox.scale = this.parent.bbox.scale;
      this.bbox.rscale = 1;
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/mrow.ts
var SVGmrow = class extends CommonMrowMixin(SVGWrapper) {
  static {
    /**
     * The mrow wrapper
     */
    this.kind = MmlMrow.prototype.kind;
  }
  /**
   * @override
   */
  toSVG(parent) {
    const svg = this.node.isInferred ? this.element = parent : this.standardSVGnode(parent);
    this.addChildren(svg);
  }
};
var SVGinferredMrow = class extends CommonInferredMrowMixin(SVGmrow) {
  static {
    /**
     * The inferred-mrow wrapper
     */
    this.kind = MmlInferredMrow.prototype.kind;
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/mi.ts
function CommonMiMixin(Base) {
  return class extends Base {
    /**
     * @override
     */
    computeBBox(bbox, _recompute = false) {
      super.computeBBox(bbox);
      this.copySkewIC(bbox);
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/mi.ts
var SVGmi = class extends CommonMiMixin(SVGWrapper) {
  static {
    /**
     * The mi wrapper
     */
    this.kind = MmlMi.prototype.kind;
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/mo.ts
var DirectionVH = {
  [1 /* Vertical */]: "v",
  [2 /* Horizontal */]: "h"
};
function CommonMoMixin(Base) {
  return class extends Base {
    /**
     * @override
     */
    constructor(...args) {
      super(...args);
      /**
       * The font size that a stretched operator uses.
       * If -1, then stretch arbitrarily, and bbox gives the actual height, depth, width
       */
      this.size = null;
      this.isAccent = this.node.isAccent;
    }
    /**
     * @override
     */
    computeBBox(bbox, _recompute = false) {
      this.protoBBox(bbox);
      if (this.node.attributes.get("symmetric") && this.stretch.dir !== 2 /* Horizontal */) {
        const d = this.getCenterOffset(bbox);
        bbox.h += d;
        bbox.d -= d;
      }
      if (this.node.getProperty("mathaccent") && (this.stretch.dir === 0 /* None */ || this.size >= 0)) {
        bbox.w = 0;
      }
    }
    /**
     * Get the (unmodified) bbox of the contents (before centering or setting accents to width 0)
     *
     * @param {BBox} bbox   The bbox to fill
     */
    protoBBox(bbox) {
      const stretchy = this.stretch.dir !== 0 /* None */;
      if (stretchy && this.size === null) {
        this.getStretchedVariant([0]);
      }
      if (stretchy && this.size < 0) return;
      super.computeBBox(bbox);
      this.copySkewIC(bbox);
    }
    /**
     * @return {number}    Offset to the left by half the actual width of the accent
     */
    getAccentOffset() {
      const bbox = BBox.empty();
      this.protoBBox(bbox);
      return -bbox.w / 2;
    }
    /**
     * @param {BBox} bbox   The bbox to center, or null to compute the bbox
     * @return {number}     The offset to move the glyph to center it
     */
    getCenterOffset(bbox = null) {
      if (!bbox) {
        bbox = BBox.empty();
        super.computeBBox(bbox);
      }
      return (bbox.h + bbox.d) / 2 + this.font.params.axis_height - bbox.h;
    }
    /**
     * @override
     */
    getVariant() {
      if (this.node.attributes.get("largeop")) {
        this.variant = this.node.attributes.get("displaystyle") ? "-largeop" : "-smallop";
        return;
      }
      if (!this.node.attributes.getExplicit("mathvariant") && this.node.getProperty("pseudoscript") === false) {
        this.variant = "-tex-variant";
        return;
      }
      super.getVariant();
    }
    /**
     * @override
     */
    canStretch(direction) {
      if (this.stretch.dir !== 0 /* None */) {
        return this.stretch.dir === direction;
      }
      const attributes = this.node.attributes;
      if (!attributes.get("stretchy")) return false;
      const c = this.getText();
      if (Array.from(c).length !== 1) return false;
      const delim = this.font.getDelimiter(c.codePointAt(0));
      this.stretch = delim && delim.dir === direction ? delim : NOSTRETCH;
      return this.stretch.dir !== 0 /* None */;
    }
    /**
     * Determint variant for vertically/horizontally stretched character
     *
     * @param {number[]} WH  size to stretch to, either [W] or [H, D]
     * @param {boolean} exact  True if not allowed to use delimiter factor and shortfall
     */
    getStretchedVariant(WH, exact = false) {
      if (this.stretch.dir !== 0 /* None */) {
        let D = this.getWH(WH);
        const min = this.getSize("minsize", 0);
        const max2 = this.getSize("maxsize", Infinity);
        const mathaccent = this.node.getProperty("mathaccent");
        D = Math.max(min, Math.min(max2, D));
        const df = this.font.params.delimiterfactor / 1e3;
        const ds = this.font.params.delimitershortfall;
        const m = min || exact ? D : mathaccent ? Math.min(D / df, D + ds) : Math.max(D * df, D - ds);
        const delim = this.stretch;
        const c = delim.c || this.getText().codePointAt(0);
        let i = 0;
        if (delim.sizes) {
          for (const d of delim.sizes) {
            if (d >= m) {
              if (mathaccent && i) {
                i--;
              }
              this.variant = this.font.getSizeVariant(c, i);
              this.size = i;
              if (delim.schar && delim.schar[i]) {
                this.stretch = { ...this.stretch, c: delim.schar[i] };
              }
              return;
            }
            i++;
          }
        }
        if (delim.stretch) {
          this.size = -1;
          this.invalidateBBox();
          this.getStretchBBox(WH, this.checkExtendedHeight(D, delim), delim);
        } else {
          this.variant = this.font.getSizeVariant(c, i - 1);
          this.size = i - 1;
        }
      }
    }
    /**
     * @param {string} name   The name of the attribute to get
     * @param {number} value  The default value to use
     * @return {number}       The size in em's of the attribute (or the default value)
     */
    getSize(name, value) {
      let attributes = this.node.attributes;
      if (attributes.isSet(name)) {
        value = this.length2em(attributes.get(name), 1, 1);
      }
      return value;
    }
    /**
     * @param {number[]} WH  Either [W] for width, [H, D] for height and depth, or [] for min/max size
     * @return {number}      Either the width or the total height of the character
     */
    getWH(WH) {
      if (WH.length === 0) return 0;
      if (WH.length === 1) return WH[0];
      let [H2, D] = WH;
      const a = this.font.params.axis_height;
      return this.node.attributes.get("symmetric") ? 2 * Math.max(H2 - a, D + a) : H2 + D;
    }
    /**
     * @param {number[]} WHD     The [W] or [H, D] being requested from the parent mrow
     * @param {number} D         The full dimension (including symmetry, etc)
     * @param {DelimiterData} C  The delimiter data for the stretchy character
     */
    getStretchBBox(WHD, D, C) {
      if (C.hasOwnProperty("min") && C.min > D) {
        D = C.min;
      }
      let [h, d, w] = C.HDW;
      if (this.stretch.dir === 1 /* Vertical */) {
        [h, d] = this.getBaseline(WHD, D, C);
      } else {
        w = D;
      }
      this.bbox.h = h;
      this.bbox.d = d;
      this.bbox.w = w;
    }
    /**
     * @param {number[]} WHD     The [H, D] being requested from the parent mrow
     * @param {number} HD        The full height (including symmetry, etc)
     * @param {DelimiterData} C  The delimiter data for the stretchy character
     * @return {[number, number]}        The height and depth for the vertically stretched delimiter
     */
    getBaseline(WHD, HD, C) {
      const hasWHD = WHD.length === 2 && WHD[0] + WHD[1] === HD;
      const symmetric = this.node.attributes.get("symmetric");
      const [H2, D] = hasWHD ? WHD : [HD, 0];
      let [h, d] = [H2 + D, 0];
      if (symmetric) {
        const a = this.font.params.axis_height;
        if (hasWHD) {
          h = 2 * Math.max(H2 - a, D + a);
        }
        d = h / 2 - a;
      } else if (hasWHD) {
        d = D;
      } else {
        let [ch, cd] = C.HDW || [0.75, 0.25];
        d = cd * (h / (ch + cd));
      }
      return [h - d, d];
    }
    /**
     * @override
     */
    checkExtendedHeight(D, C) {
      if (C.fullExt) {
        const [extSize, endSize] = C.fullExt;
        const n = Math.ceil(Math.max(0, D - endSize) / extSize);
        D = endSize + n * extSize;
      }
      return D;
    }
    /**
     * @override
     */
    remapChars(chars) {
      const primes = this.node.getProperty("primes");
      if (primes) {
        return unicodeChars(primes);
      }
      if (chars.length === 1) {
        const parent = this.node.coreParent().parent;
        const isAccent = this.isAccent && !parent.isKind("mrow");
        const map = isAccent ? "accent" : "mo";
        const text = this.font.getRemappedChar(map, chars[0]);
        if (text) {
          chars = this.unicodeChars(text, this.variant);
        }
      }
      return chars;
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/mo.ts
var VFUZZ = 0.1;
var HFUZZ = 0.1;
var SVGmo = class extends CommonMoMixin(SVGWrapper) {
  static {
    /**
     * The mo wrapper
     */
    this.kind = MmlMo.prototype.kind;
  }
  /**
   * @override
   */
  toSVG(parent) {
    const attributes = this.node.attributes;
    const symmetric = attributes.get("symmetric") && this.stretch.dir !== 2 /* Horizontal */;
    const stretchy = this.stretch.dir !== 0 /* None */;
    if (stretchy && this.size === null) {
      this.getStretchedVariant([]);
    }
    let svg = this.standardSVGnode(parent);
    if (stretchy && this.size < 0) {
      this.stretchSVG();
    } else {
      const u = symmetric || attributes.get("largeop") ? this.fixed(this.getCenterOffset()) : "0";
      const v = this.node.getProperty("mathaccent") ? this.fixed(this.getAccentOffset()) : "0";
      if (u !== "0" || v !== "0") {
        this.adaptor.setAttribute(svg, "transform", `translate(${v} ${u})`);
      }
      this.addChildren(svg);
    }
  }
  /**
   * Create the SVG for a multi-character stretchy delimiter
   */
  stretchSVG() {
    const stretch = this.stretch.stretch;
    const variants = this.getStretchVariants();
    const bbox = this.getBBox();
    if (this.stretch.dir === 1 /* Vertical */) {
      this.stretchVertical(stretch, variants, bbox);
    } else {
      this.stretchHorizontal(stretch, variants, bbox);
    }
  }
  /**
   * Get the variant array for the assembly pieces
   */
  getStretchVariants() {
    const c = this.stretch.c || this.getText().codePointAt(0);
    const variants = [];
    for (const i of this.stretch.stretch.keys()) {
      variants[i] = this.font.getStretchVariant(c, i);
    }
    return variants;
  }
  /**
   * @param {number[]} stretch    The characters to use for stretching
   * @param {string[]} variant    The variants for the parts to use for stretching
   * @param {BBox} bbox           The full size of the stretched character
   */
  stretchVertical(stretch, variant, bbox) {
    const { h, d, w } = bbox;
    const T = this.addTop(stretch[0], variant[0], h, w);
    const B = this.addBot(stretch[2], variant[2], d, w);
    if (stretch.length === 4) {
      const [H2, D] = this.addMidV(stretch[3], variant[3], w);
      this.addExtV(stretch[1], variant[1], h, 0, T, H2, w);
      this.addExtV(stretch[1], variant[1], 0, d, D, B, w);
    } else {
      this.addExtV(stretch[1], variant[1], h, d, T, B, w);
    }
  }
  /**
   * @param {number[]} stretch    The characters to use for stretching
   * @param {string[]} variant    The variants for the parts to use for stretching
   * @param {BBox} bbox           The full size of the stretched character
   */
  stretchHorizontal(stretch, variant, bbox) {
    const w = bbox.w;
    const L = this.addLeft(stretch[0], variant[0]);
    const R = this.addRight(stretch[2], variant[2], w);
    if (stretch.length === 4) {
      const [x1, x2] = this.addMidH(stretch[3], variant[3], w);
      const w2 = w / 2;
      this.addExtH(stretch[1], variant[1], w2, L, w2 - x1);
      this.addExtH(stretch[1], variant[1], w2, x2 - w2, R, w2);
    } else {
      this.addExtH(stretch[1], variant[1], w, L, R);
    }
  }
  /***********************************************************/
  /**
   * @param {number} n         The number of the character to look up
   * @param {string} variant   The variant for the character to look up
   * @return {SVGCharData}     The full CharData object, with CharOptions guaranteed to be defined
   */
  getChar(n, variant) {
    const char = this.font.getChar(variant, n) || [0, 0, 0, null];
    return [char[0], char[1], char[2], char[3] || {}];
  }
  /**
   * @param {number} n         The character code for the glyph
   * @param {string} variant   The variant for the glyph
   * @param {number} x         The x position of the glyph
   * @param {number} y         The y position of the glyph
   * @param {N} parent         The container for the glyph
   * @return {number}          The width of the character placed
   */
  addGlyph(n, variant, x, y, parent = null) {
    return this.placeChar(n, x, y, parent || this.element, variant);
  }
  /***********************************************************/
  /**
   * @param {number} n    The character number for the top glyph
   * @param {string} v    The variant for the top glyph
   * @param {number} H    The height of the stretched delimiter
   * @param {number} W    The width of the stretched delimiter
   * @return {number}     The total height of the top glyph
   */
  addTop(n, v, H2, W) {
    if (!n) return 0;
    const [h, d, w] = this.getChar(n, v);
    this.addGlyph(n, v, (W - w) / 2, H2 - h);
    return h + d;
  }
  /**
   * @param {number} n    The character number for the extender glyph
   * @param {string} v    The variant for the extender glyph
   * @param {number} H    The height of the stretched delimiter
   * @param {number} D    The depth of the stretched delimiter
   * @param {number} T    The height of the top glyph in the delimiter
   * @param {number} B    The height of the bottom glyph in the delimiter
   * @param {number} W    The width of the stretched delimiter
   */
  addExtV(n, v, H2, D, T, B, W) {
    if (!n) return;
    T = Math.max(0, T - VFUZZ);
    B = Math.max(0, B - VFUZZ);
    const adaptor2 = this.adaptor;
    const [h, d, w] = this.getChar(n, v);
    const Y = H2 + D - T - B;
    const s = 1.5 * Y / (h + d);
    const y = (s * (h - d) - Y) / 2;
    if (Y <= 0) return;
    const svg = this.svg("svg", {
      width: this.fixed(w),
      height: this.fixed(Y),
      y: this.fixed(B - D),
      x: this.fixed((W - w) / 2),
      viewBox: [0, y, w, Y].map((x) => this.fixed(x)).join(" ")
    });
    this.addGlyph(n, v, 0, 0, svg);
    const glyph = adaptor2.lastChild(svg);
    adaptor2.setAttribute(glyph, "transform", `scale(1,${this.jax.fixed(s)})`);
    adaptor2.append(this.element, svg);
  }
  /**
   * @param {number} n    The character number for the bottom glyph
   * @param {string} v    The variant for the bottom glyph
   * @param {number} D    The depth of the stretched delimiter
   * @param {number} W    The width of the stretched delimiter
   * @return {number}     The total height of the bottom glyph
   */
  addBot(n, v, D, W) {
    if (!n) return 0;
    const [h, d, w] = this.getChar(n, v);
    this.addGlyph(n, v, (W - w) / 2, d - D);
    return h + d;
  }
  /**
   * @param {number} n    The character number for the middle glyph
   * @param {string} v    The variant for the middle glyph
   * @param {number} W    The width of the stretched delimiter
   * @return {[number, number]}   The top and bottom positions of the middle glyph
   */
  addMidV(n, v, W) {
    if (!n) return [0, 0];
    const [h, d, w] = this.getChar(n, v);
    const y = (d - h) / 2 + this.font.params.axis_height;
    this.addGlyph(n, v, (W - w) / 2, y);
    return [h + y, d - y];
  }
  /***********************************************************/
  /**
   * @param {number} n   The character number for the left glyph of the stretchy character
   * @param {string} v   The variant for the left glyph
   * @return {number}    The width of the left glyph
   */
  addLeft(n, v) {
    return n ? this.addGlyph(n, v, 0, 0) : 0;
  }
  /**
   * @param {number} n   The character number for the extender glyph of the stretchy character
   * @param {string} v   The variant for the extender glyph
   * @param {number} W   The width of the stretched character
   * @param {number} L   The width of the left glyph of the stretchy character
   * @param {number} R   The width of the right glyph of the stretchy character
   * @param {number} x   The x-position of the extender (needed for ones with two extenders)
   */
  addExtH(n, v, W, L, R, x = 0) {
    if (!n) return;
    R = Math.max(0, R - HFUZZ);
    L = Math.max(0, L - HFUZZ);
    const adaptor2 = this.adaptor;
    const [h, d, w] = this.getChar(n, v);
    const X = W - L - R;
    const Y = h + d + 2 * VFUZZ;
    const s = 1.5 * (X / w);
    const D = -(d + VFUZZ);
    if (X <= 0) return;
    const svg = this.svg("svg", {
      width: this.fixed(X),
      height: this.fixed(Y),
      x: this.fixed(x + L),
      y: this.fixed(D),
      viewBox: [(s * w - X) / 2, D, X, Y].map((x2) => this.fixed(x2)).join(" ")
    });
    this.addGlyph(n, v, 0, 0, svg);
    const glyph = adaptor2.lastChild(svg);
    adaptor2.setAttribute(glyph, "transform", "scale(" + this.jax.fixed(s) + ",1)");
    adaptor2.append(this.element, svg);
  }
  /**
   * @param {number} n   The character number for the right glyph of the stretchy character
   * @param {string} v   The variant for the right glyph
   * @param {number} W   The width of the stretched character
   * @return {number}    The width of the right glyph
   */
  addRight(n, v, W) {
    if (!n) return 0;
    const w = this.getChar(n, v)[2];
    return this.addGlyph(n, v, W - w, 0);
  }
  /**
   * @param {number} n   The character number for the middle glyph of the stretchy character
   * @param {string} v   The variant for the middle glyph
   * @param {number} W   The width of the stretched character
   * @return {[number, number]}  The positions of the left and right edges of the middle glyph
   */
  addMidH(n, v, W) {
    if (!n) return [0, 0];
    const w = this.getChar(n, v)[2];
    this.addGlyph(n, v, (W - w) / 2, 0);
    return [(W - w) / 2, (W + w) / 2];
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/mn.ts
function CommonMnMixin(Base) {
  return class extends Base {
    /**
     * @override
     */
    remapChars(chars) {
      if (chars.length) {
        const text = this.font.getRemappedChar("mn", chars[0]);
        if (text) {
          const c = this.unicodeChars(text, this.variant);
          if (c.length === 1) {
            chars[0] = c[0];
          } else {
            chars = c.concat(chars.slice(1));
          }
        }
      }
      return chars;
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/mn.ts
var SVGmn = class extends CommonMnMixin(SVGWrapper) {
  static {
    /**
     * The mn wrapper
     */
    this.kind = MmlMn.prototype.kind;
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/ms.ts
function CommonMsMixin(Base) {
  return class extends Base {
    /**
     * Add the quote characters to the wrapper children so they will be output
     *
     * @override
     */
    constructor(...args) {
      super(...args);
      const attributes = this.node.attributes;
      let quotes = attributes.getList("lquote", "rquote");
      if (this.variant !== "monospace") {
        if (!attributes.isSet("lquote") && quotes.lquote === '"') quotes.lquote = "“";
        if (!attributes.isSet("rquote") && quotes.rquote === '"') quotes.rquote = "”";
      }
      this.childNodes.unshift(this.createText(quotes.lquote));
      this.childNodes.push(this.createText(quotes.rquote));
    }
    /**
     * Create a text wrapper with the given text;
     *
     * @param {string} text   The text for the wrapped element
     * @return {AnyWrapper}   The wrapped text node
     */
    createText(text) {
      const node = this.wrap(this.mmlText(text));
      node.parent = this;
      return node;
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/ms.ts
var SVGms = class extends CommonMsMixin(SVGWrapper) {
  static {
    /**
     * The ms wrapper
     */
    this.kind = MmlMs.prototype.kind;
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/mtext.ts
function CommonMtextMixin(Base) {
  return class extends Base {
    static {
      /**
       * The font-family, weight, and style to use for the variants when mtextInheritFont
       * is true or mtextFont is specified.  If not in this list, then the font's
       * getCssFont() is called.  When the font family is not specified (as in these four),
       * the inherited or specified font is used.
       */
      this.INHERITFONTS = {
        normal: ["", false, false],
        bold: ["", false, true],
        italic: ["", true, false],
        "bold-italic": ["", true, true]
      };
    }
    /**
     * @override
     */
    getVariant() {
      const options2 = this.jax.options;
      const data = this.jax.math.outputData;
      const merror = (!!data.merrorFamily || !!options2.merrorFont) && this.node.Parent.isKind("merror");
      if (!!data.mtextFamily || !!options2.mtextFont || merror) {
        const variant = this.node.attributes.get("mathvariant");
        const font = this.constructor.INHERITFONTS[variant] || this.jax.font.getCssFont(variant);
        const family = font[0] || (merror ? data.merrorFamily || options2.merrorFont : data.mtextFamily || options2.mtextFont);
        this.variant = this.explicitVariant(family, font[2] ? "bold" : "", font[1] ? "italic" : "");
        return;
      }
      super.getVariant();
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/mtext.ts
var SVGmtext = class extends CommonMtextMixin(SVGWrapper) {
  static {
    /**
     * The mtext wrapper
     */
    this.kind = MmlMtext.prototype.kind;
  }
};

// node_modules/mathjax-full/ts/output/svg/Wrappers/merror.ts
var SVGmerror = class extends SVGWrapper {
  static {
    /**
     * The merror wrapper
     */
    this.kind = MmlMerror.prototype.kind;
  }
  static {
    /**
     * @override
     */
    this.styles = {
      'g[data-mml-node="merror"] > g': {
        fill: "red",
        stroke: "red"
      },
      'g[data-mml-node="merror"] > rect[data-background]': {
        fill: "yellow",
        stroke: "none"
      }
    };
  }
  /**
   * @override
   */
  toSVG(parent) {
    const svg = this.standardSVGnode(parent);
    const { h, d, w } = this.getBBox();
    this.adaptor.append(this.element, this.svg("rect", {
      "data-background": true,
      width: this.fixed(w),
      height: this.fixed(h + d),
      y: this.fixed(-d)
    }));
    const title = this.node.attributes.get("title");
    if (title) {
      this.adaptor.append(this.element, this.svg("title", {}, [this.adaptor.text(title)]));
    }
    this.addChildren(svg);
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/mspace.ts
function CommonMspaceMixin(Base) {
  return class extends Base {
    /**
     * @override
     */
    computeBBox(bbox, _recompute = false) {
      const attributes = this.node.attributes;
      bbox.w = this.length2em(attributes.get("width"), 0);
      bbox.h = this.length2em(attributes.get("height"), 0);
      bbox.d = this.length2em(attributes.get("depth"), 0);
    }
    /**
     * No contents, so no need for variant class
     *
     * @override
     */
    handleVariant() {
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/mspace.ts
var SVGmspace = class extends CommonMspaceMixin(SVGWrapper) {
  static {
    /**
     * The mspace wrapper
     */
    this.kind = MmlMspace.prototype.kind;
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/mpadded.ts
function CommonMpaddedMixin(Base) {
  return class extends Base {
    /**
     * Get the content bounding box, and the change in size and offsets
     *   as specified by the parameters
     *
     * @return {number[]}  The original height, depth, width, the changes in height, depth,
     *                    and width, and the horizontal and vertical offsets of the content
     */
    getDimens() {
      const values = this.node.attributes.getList("width", "height", "depth", "lspace", "voffset");
      const bbox = this.childNodes[0].getBBox();
      let { w, h, d } = bbox;
      let W = w, H2 = h, D = d, x = 0, y = 0, dx = 0;
      if (values.width !== "") w = this.dimen(values.width, bbox, "w", 0);
      if (values.height !== "") h = this.dimen(values.height, bbox, "h", 0);
      if (values.depth !== "") d = this.dimen(values.depth, bbox, "d", 0);
      if (values.voffset !== "") y = this.dimen(values.voffset, bbox);
      if (values.lspace !== "") x = this.dimen(values.lspace, bbox);
      const align = this.node.attributes.get("data-align");
      if (align) {
        dx = this.getAlignX(w, bbox, align);
      }
      return [H2, D, W, h - H2, d - D, w - W, x, y, dx];
    }
    /**
     * Get a particular dimension, which can be relative to any of the BBox dimensions,
     *   and can be an offset from the default size of the given dimension.
     *
     * @param {Property} length   The value to be converted to a length in ems
     * @param {BBox} bbox         The bbox of the mpadded content
     * @param {string} d          The default dimension to use for relative sizes ('w', 'h', or 'd')
     * @param {number} m          The minimum value allowed for the dimension
     * @return {number}           The final dimension in ems
     */
    dimen(length, bbox, d = "", m = null) {
      length = String(length);
      const match = length.match(/width|height|depth/);
      const size = match ? bbox[match[0].charAt(0)] : d ? bbox[d] : 0;
      let dimen = this.length2em(length, size) || 0;
      if (length.match(/^[-+]/) && d) {
        dimen += size;
      }
      if (m != null) {
        dimen = Math.max(m, dimen);
      }
      return dimen;
    }
    /**
     * @override
     */
    computeBBox(bbox, recompute = false) {
      const [H2, D, W, dh, dd, dw] = this.getDimens();
      bbox.w = W + dw;
      bbox.h = H2 + dh;
      bbox.d = D + dd;
      this.setChildPWidths(recompute, bbox.w);
    }
    /**
     * @override
     */
    getWrapWidth(_i) {
      return this.getBBox().w;
    }
    /**
     * @override
     */
    getChildAlign(_i) {
      return this.node.attributes.get("data-align") || "left";
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/mpadded.ts
var SVGmpadded = class extends CommonMpaddedMixin(SVGWrapper) {
  static {
    /**
     * The mpadded wrapper
     */
    this.kind = MmlMpadded.prototype.kind;
  }
  /**
   * @override
   */
  toSVG(parent) {
    let svg = this.standardSVGnode(parent);
    const [, , , , , dw, x, y, dx] = this.getDimens();
    const align = this.node.attributes.get("data-align") || "left";
    const X = x + dx - (dw < 0 && align !== "left" ? align === "center" ? dw / 2 : dw : 0);
    if (X || y) {
      svg = this.adaptor.append(svg, this.svg("g"));
      this.place(X, y, svg);
    }
    this.addChildren(svg);
  }
};

// node_modules/mathjax-full/ts/output/svg/Wrappers/mphantom.ts
var SVGmphantom = class extends SVGWrapper {
  static {
    /**
     * The mphantom wrapper
     */
    this.kind = MmlMphantom.prototype.kind;
  }
  /**
   * @override
   */
  toSVG(parent) {
    this.standardSVGnode(parent);
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/mfrac.ts
function CommonMfracMixin(Base) {
  return class extends Base {
    /************************************************/
    /**
     * @override
     * @constructor
     */
    constructor(...args) {
      super(...args);
      /**
       * Wrapper for <mo> to use for bevelled fraction
       */
      this.bevel = null;
      this.pad = this.node.getProperty("withDelims") ? 0 : this.font.params.nulldelimiterspace;
      if (this.node.attributes.get("bevelled")) {
        const { H: H2 } = this.getBevelData(this.isDisplay());
        const bevel = this.bevel = this.createMo("/");
        bevel.node.attributes.set("symmetric", true);
        bevel.canStretch(1 /* Vertical */);
        bevel.getStretchedVariant([H2], true);
      }
    }
    /**
     * @override
     */
    computeBBox(bbox, recompute = false) {
      bbox.empty();
      const { linethickness, bevelled } = this.node.attributes.getList("linethickness", "bevelled");
      const display = this.isDisplay();
      let w = null;
      if (bevelled) {
        this.getBevelledBBox(bbox, display);
      } else {
        const thickness = this.length2em(String(linethickness), 0.06);
        w = -2 * this.pad;
        if (thickness === 0) {
          this.getAtopBBox(bbox, display);
        } else {
          this.getFractionBBox(bbox, display, thickness);
          w -= 0.2;
        }
        w += bbox.w;
      }
      bbox.clean();
      this.setChildPWidths(recompute, w);
    }
    /************************************************/
    /**
     * @param {BBox} bbox        The buonding box to modify
     * @param {boolean} display  True for display-mode fractions
     * @param {number} t         The thickness of the line
     */
    getFractionBBox(bbox, display, t) {
      const nbox = this.childNodes[0].getOuterBBox();
      const dbox = this.childNodes[1].getOuterBBox();
      const tex = this.font.params;
      const a = tex.axis_height;
      const { T, u, v } = this.getTUV(display, t);
      bbox.combine(nbox, 0, a + T + Math.max(nbox.d * nbox.rscale, u));
      bbox.combine(dbox, 0, a - T - Math.max(dbox.h * dbox.rscale, v));
      bbox.w += 2 * this.pad + 0.2;
    }
    /**
     * @param {boolean} display  True for display-mode fractions
     * @param {number} t         The thickness of the line
     * @return {Object}          The expanded rule thickness (T), and baseline offsets
     *                             for numerator and denomunator (u and v)
     */
    getTUV(display, t) {
      const tex = this.font.params;
      const a = tex.axis_height;
      const T = (display ? 3.5 : 1.5) * t;
      return {
        T: (display ? 3.5 : 1.5) * t,
        u: (display ? tex.num1 : tex.num2) - a - T,
        v: (display ? tex.denom1 : tex.denom2) + a - T
      };
    }
    /************************************************/
    /**
     * @param {BBox} bbox        The bounding box to modify
     * @param {boolean} display  True for display-mode fractions
     */
    getAtopBBox(bbox, display) {
      const { u, v, nbox, dbox } = this.getUVQ(display);
      bbox.combine(nbox, 0, u);
      bbox.combine(dbox, 0, -v);
      bbox.w += 2 * this.pad;
    }
    /**
     * @param {boolean} display  True for diplay-mode fractions
     * @return {Object}
     *    The vertical offsets of the numerator (u), the denominator (v),
     *    the separation between the two, and the bboxes themselves.
     */
    getUVQ(display) {
      const nbox = this.childNodes[0].getOuterBBox();
      const dbox = this.childNodes[1].getOuterBBox();
      const tex = this.font.params;
      let [u, v] = display ? [tex.num1, tex.denom1] : [tex.num3, tex.denom2];
      let p = (display ? 7 : 3) * tex.rule_thickness;
      let q = u - nbox.d * nbox.scale - (dbox.h * dbox.scale - v);
      if (q < p) {
        u += (p - q) / 2;
        v += (p - q) / 2;
        q = p;
      }
      return { u, v, q, nbox, dbox };
    }
    /************************************************/
    /**
     * @param {BBox} bbox        The boundng box to modify
     * @param {boolean} display  True for display-mode fractions
     */
    getBevelledBBox(bbox, display) {
      const { u, v, delta, nbox, dbox } = this.getBevelData(display);
      const lbox = this.bevel.getOuterBBox();
      bbox.combine(nbox, 0, u);
      bbox.combine(lbox, bbox.w - delta / 2, 0);
      bbox.combine(dbox, bbox.w - delta / 2, v);
    }
    /**
     * @param {boolean} display  True for display-style fractions
     * @return {Object}          The height (H) of the bevel, horizontal offest (delta)
     *                             vertical offsets (u and v) of the parts, and
     *                             bounding boxes of the parts.
     */
    getBevelData(display) {
      const nbox = this.childNodes[0].getOuterBBox();
      const dbox = this.childNodes[1].getOuterBBox();
      const delta = display ? 0.4 : 0.15;
      const H2 = Math.max(nbox.scale * (nbox.h + nbox.d), dbox.scale * (dbox.h + dbox.d)) + 2 * delta;
      const a = this.font.params.axis_height;
      const u = nbox.scale * (nbox.d - nbox.h) / 2 + a + delta;
      const v = dbox.scale * (dbox.d - dbox.h) / 2 + a - delta;
      return { H: H2, delta, u, v, nbox, dbox };
    }
    /************************************************/
    /**
     * @override
     */
    canStretch(_direction) {
      return false;
    }
    /**
     * @return {boolean}   True if in display mode, false otherwise
     */
    isDisplay() {
      const { displaystyle, scriptlevel } = this.node.attributes.getList("displaystyle", "scriptlevel");
      return displaystyle && scriptlevel === 0;
    }
    /**
     * @override
     */
    getWrapWidth(i) {
      const attributes = this.node.attributes;
      if (attributes.get("bevelled")) {
        return this.childNodes[i].getOuterBBox().w;
      }
      const w = this.getBBox().w;
      const thickness = this.length2em(attributes.get("linethickness"));
      return w - (thickness ? 0.2 : 0) - 2 * this.pad;
    }
    /**
     * @override
     */
    getChildAlign(i) {
      const attributes = this.node.attributes;
      return attributes.get("bevelled") ? "left" : attributes.get(["numalign", "denomalign"][i]);
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/mfrac.ts
var SVGmfrac = class extends CommonMfracMixin(SVGWrapper) {
  static {
    /**
     * The mfrac wrapper
     */
    this.kind = MmlMfrac.prototype.kind;
  }
  /************************************************/
  /**
   * @override
   */
  toSVG(parent) {
    this.standardSVGnode(parent);
    const { linethickness, bevelled } = this.node.attributes.getList("linethickness", "bevelled");
    const display = this.isDisplay();
    if (bevelled) {
      this.makeBevelled(display);
    } else {
      const thickness = this.length2em(String(linethickness), 0.06);
      if (thickness === 0) {
        this.makeAtop(display);
      } else {
        this.makeFraction(display, thickness);
      }
    }
  }
  /************************************************/
  /**
   * @param {boolean} display  True when fraction is in display mode
   * @param {number} t         The rule line thickness
   */
  makeFraction(display, t) {
    const svg = this.element;
    const { numalign, denomalign } = this.node.attributes.getList("numalign", "denomalign");
    const [num, den] = this.childNodes;
    const nbox = num.getOuterBBox();
    const dbox = den.getOuterBBox();
    const tex = this.font.params;
    const a = tex.axis_height;
    const d = 0.1;
    const pad = this.node.getProperty("withDelims") ? 0 : tex.nulldelimiterspace;
    const W = Math.max(
      (nbox.L + nbox.w + nbox.R) * nbox.rscale,
      (dbox.L + dbox.w + dbox.R) * dbox.rscale
    );
    const nx = this.getAlignX(W, nbox, numalign) + d + pad;
    const dx = this.getAlignX(W, dbox, denomalign) + d + pad;
    const { T, u, v } = this.getTUV(display, t);
    num.toSVG(svg);
    num.place(nx, a + T + Math.max(nbox.d * nbox.rscale, u));
    den.toSVG(svg);
    den.place(dx, a - T - Math.max(dbox.h * dbox.rscale, v));
    this.adaptor.append(svg, this.svg("rect", {
      width: this.fixed(W + 2 * d),
      height: this.fixed(t),
      x: this.fixed(pad),
      y: this.fixed(a - t / 2)
    }));
  }
  /************************************************/
  /**
   * @param {boolean} display  True when fraction is in display mode
   */
  makeAtop(display) {
    const svg = this.element;
    const { numalign, denomalign } = this.node.attributes.getList("numalign", "denomalign");
    const [num, den] = this.childNodes;
    const nbox = num.getOuterBBox();
    const dbox = den.getOuterBBox();
    const tex = this.font.params;
    const pad = this.node.getProperty("withDelims") ? 0 : tex.nulldelimiterspace;
    const W = Math.max(
      (nbox.L + nbox.w + nbox.R) * nbox.rscale,
      (dbox.L + dbox.w + dbox.R) * dbox.rscale
    );
    const nx = this.getAlignX(W, nbox, numalign) + pad;
    const dx = this.getAlignX(W, dbox, denomalign) + pad;
    const { u, v } = this.getUVQ(display);
    num.toSVG(svg);
    num.place(nx, u);
    den.toSVG(svg);
    den.place(dx, -v);
  }
  /************************************************/
  /**
   * @param {boolean} display  True when fraction is in display mode
   */
  makeBevelled(display) {
    const svg = this.element;
    const [num, den] = this.childNodes;
    const { u, v, delta, nbox, dbox } = this.getBevelData(display);
    const w = (nbox.L + nbox.w + nbox.R) * nbox.rscale;
    num.toSVG(svg);
    this.bevel.toSVG(svg);
    den.toSVG(svg);
    num.place(nbox.L * nbox.rscale, u);
    this.bevel.place(w - delta / 2, 0);
    den.place(w + this.bevel.getOuterBBox().w + dbox.L * dbox.rscale - delta, v);
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/msqrt.ts
function CommonMsqrtMixin(Base) {
  return class extends Base {
    /**
     * @return {number}  The index of the base of the root in childNodes
     */
    get base() {
      return 0;
    }
    /**
     * @return {number}  The index of the surd in childNodes
     */
    get surd() {
      return 1;
    }
    /**
     * @return {number}  The index of the root in childNodes (or null if none)
     */
    get root() {
      return null;
    }
    /**
     * Add the surd character so we can display it later
     *
     * @override
     */
    constructor(...args) {
      super(...args);
      const surd = this.createMo("√");
      surd.canStretch(1 /* Vertical */);
      const { h, d } = this.childNodes[this.base].getOuterBBox();
      const t = this.font.params.rule_thickness;
      const p = this.node.attributes.get("displaystyle") ? this.font.params.x_height : t;
      this.surdH = h + d + 2 * t + p / 4;
      surd.getStretchedVariant([this.surdH - d, d], true);
    }
    /**
     * @override
     */
    createMo(text) {
      const node = super.createMo(text);
      this.childNodes.push(node);
      return node;
    }
    /**
     * @override
     */
    computeBBox(bbox, recompute = false) {
      const surdbox = this.childNodes[this.surd].getBBox();
      const basebox = new BBox(this.childNodes[this.base].getOuterBBox());
      const q = this.getPQ(surdbox)[1];
      const t = this.font.params.rule_thickness;
      const H2 = basebox.h + q + t;
      const [x] = this.getRootDimens(surdbox, H2);
      bbox.h = H2 + t;
      this.combineRootBBox(bbox, surdbox, H2);
      bbox.combine(surdbox, x, H2 - surdbox.h);
      bbox.combine(basebox, x + surdbox.w, 0);
      bbox.clean();
      this.setChildPWidths(recompute);
    }
    /**
     * Combine the bounding box of the root (overridden in mroot)
     *
     * @param {BBox} bbox  The bounding box so far
     * @param {BBox} sbox  The bounding box of the surd
     * @param {number} H   The height of the root as a whole
     */
    combineRootBBox(_bbox, _sbox, _H) {
    }
    /**
     * @param {BBox} sbox  The bounding box for the surd character
     * @return {[number, number]}  The p, q, and x values for the TeX layout computations
     */
    getPQ(sbox) {
      const t = this.font.params.rule_thickness;
      const p = this.node.attributes.get("displaystyle") ? this.font.params.x_height : t;
      const q = sbox.h + sbox.d > this.surdH ? (sbox.h + sbox.d - (this.surdH - 2 * t - p / 2)) / 2 : t + p / 4;
      return [p, q];
    }
    /**
     * @param {BBox} sbox  The bounding box of the surd
     * @param {number} H   The height of the root as a whole
     * @return {[number, number, number, number]} The x offset of the surd, and
     *     the height, x offset, and scale of the root
     */
    getRootDimens(_sbox, _H) {
      return [0, 0, 0, 0];
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/msqrt.ts
var SVGmsqrt = class extends CommonMsqrtMixin(SVGWrapper) {
  constructor() {
    super(...arguments);
    /**
     * Indent due to root
     */
    this.dx = 0;
  }
  static {
    /**
     * The msqrt wrapper
     */
    this.kind = MmlMsqrt.prototype.kind;
  }
  /**
   * @override
   */
  toSVG(parent) {
    const surd = this.childNodes[this.surd];
    const base = this.childNodes[this.base];
    const root = this.root ? this.childNodes[this.root] : null;
    const sbox = surd.getBBox();
    const bbox = base.getOuterBBox();
    const q = this.getPQ(sbox)[1];
    const t = this.font.params.rule_thickness * this.bbox.scale;
    const H2 = bbox.h + q + t;
    const SVG3 = this.standardSVGnode(parent);
    const BASE = this.adaptor.append(SVG3, this.svg("g"));
    this.addRoot(SVG3, root, sbox, H2);
    surd.toSVG(SVG3);
    surd.place(this.dx, H2 - sbox.h);
    base.toSVG(BASE);
    base.place(this.dx + sbox.w, 0);
    this.adaptor.append(SVG3, this.svg("rect", {
      width: this.fixed(bbox.w),
      height: this.fixed(t),
      x: this.fixed(this.dx + sbox.w),
      y: this.fixed(H2 - t)
    }));
  }
  /**
   * Add root HTML (overridden in mroot)
   *
   * @param {N} ROOT           The container for the root
   * @param {SVGWrapper} root  The wrapped MML root content
   * @param {BBox} sbox        The bounding box of the surd
   * @param {number} H         The height of the root as a whole
   */
  addRoot(_ROOT, _root, _sbox, _H) {
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/mroot.ts
function CommonMrootMixin(Base) {
  return class extends Base {
    /**
     * @override
     */
    get surd() {
      return 2;
    }
    /**
     * @override
     */
    get root() {
      return 1;
    }
    /**
     * @override
     */
    combineRootBBox(BBOX, sbox, H2) {
      const bbox = this.childNodes[this.root].getOuterBBox();
      const h = this.getRootDimens(sbox, H2)[1];
      BBOX.combine(bbox, 0, h);
    }
    /**
     * @override
     */
    getRootDimens(sbox, H2) {
      const surd = this.childNodes[this.surd];
      const bbox = this.childNodes[this.root].getOuterBBox();
      const offset = (surd.size < 0 ? 0.5 : 0.6) * sbox.w;
      const { w, rscale } = bbox;
      const W = Math.max(w, offset / rscale);
      const dx = Math.max(0, W - w);
      const h = this.rootHeight(bbox, sbox, surd.size, H2);
      const x = W * rscale - offset;
      return [x, h, dx];
    }
    /**
     * @param {BBox} rbox      The bbox of the root
     * @param {BBox} sbox      The bbox of the surd
     * @param {number} size    The size of the surd
     * @param {number} H       The height of the root as a whole
     * @return {number}        The height of the root within the surd
     */
    rootHeight(rbox, sbox, size, H2) {
      const h = sbox.h + sbox.d;
      const b = (size < 0 ? 1.9 : 0.55 * h) - (h - H2);
      return b + Math.max(0, rbox.d * rbox.rscale);
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/mroot.ts
var SVGmroot = class extends CommonMrootMixin(SVGmsqrt) {
  static {
    /**
     * The mroot wrapper
     */
    this.kind = MmlMroot.prototype.kind;
  }
  /**
   * @override
   */
  addRoot(ROOT, root, sbox, H2) {
    root.toSVG(ROOT);
    const [x, h, dx] = this.getRootDimens(sbox, H2);
    const bbox = root.getOuterBBox();
    root.place(dx * bbox.rscale, h);
    this.dx = x;
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/mfenced.ts
function CommonMfencedMixin(Base) {
  return class extends Base {
    /**
     * @override
     * @constructor
     */
    constructor(...args) {
      super(...args);
      /**
       * An mrow to use for the layout of the mfenced
       */
      this.mrow = null;
      this.createMrow();
      this.addMrowChildren();
    }
    /**
     * Creates the mrow wrapper to use for the layout
     */
    createMrow() {
      const mmlFactory = this.node.factory;
      const mrow = mmlFactory.create("inferredMrow");
      mrow.inheritAttributesFrom(this.node);
      this.mrow = this.wrap(mrow);
      this.mrow.parent = this;
    }
    /**
     * Populate the mrow with wrapped mo elements interleaved
     *   with the mfenced children (the mo's are already created
     *   in the mfenced object)
     */
    addMrowChildren() {
      const mfenced = this.node;
      const mrow = this.mrow;
      this.addMo(mfenced.open);
      if (this.childNodes.length) {
        mrow.childNodes.push(this.childNodes[0]);
      }
      let i = 0;
      for (const child of this.childNodes.slice(1)) {
        this.addMo(mfenced.separators[i++]);
        mrow.childNodes.push(child);
      }
      this.addMo(mfenced.close);
      mrow.stretchChildren();
    }
    /**
     * Wrap an mo element and push it onto the mrow
     *
     * @param {MmlNode} node  The mo element to push on the mrow
     */
    addMo(node) {
      if (!node) return;
      const mo = this.wrap(node);
      this.mrow.childNodes.push(mo);
      mo.parent = this.mrow;
    }
    /**
     * @override
     */
    computeBBox(bbox, recompute = false) {
      bbox.updateFrom(this.mrow.getOuterBBox());
      this.setChildPWidths(recompute);
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/mfenced.ts
var SVGmfenced = class extends CommonMfencedMixin(SVGWrapper) {
  static {
    /**
     * The mfenced wrapper
     */
    this.kind = MmlMfenced.prototype.kind;
  }
  /**
   * @override
   */
  toSVG(parent) {
    const svg = this.standardSVGnode(parent);
    this.setChildrenParent(this.mrow);
    this.mrow.toSVG(svg);
    this.setChildrenParent(this);
  }
  /**
   * @param {SVGWrapper} parent   The parent to use for the fenced children
   */
  setChildrenParent(parent) {
    for (const child of this.childNodes) {
      child.parent = parent;
    }
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/scriptbase.ts
function CommonScriptbaseMixin(Base) {
  return class extends Base {
    /**
     * @override
     */
    constructor(...args) {
      super(...args);
      /**
       * The base element's wrapper
       */
      this.baseScale = 1;
      /**
       * The relative scaling of the base compared to the munderover/msubsup
       */
      this.baseIc = 0;
      /**
       * True if base italic correction should be removed (msub and msubsup or mathaccents)
       */
      this.baseRemoveIc = false;
      /**
       * True if the base is a single character
       */
      this.baseIsChar = false;
      /**
       * True if the base has an accent under or over
       */
      this.baseHasAccentOver = null;
      this.baseHasAccentUnder = null;
      /**
       * True if this is an overline or underline
       */
      this.isLineAbove = false;
      this.isLineBelow = false;
      /**
       * True if this is an msup with script that is a math accent
       */
      this.isMathAccent = false;
      const core = this.baseCore = this.getBaseCore();
      if (!core) return;
      this.setBaseAccentsFor(core);
      this.baseScale = this.getBaseScale();
      this.baseIc = this.getBaseIc();
      this.baseIsChar = this.isCharBase();
      this.isMathAccent = this.baseIsChar && (this.scriptChild && !!this.scriptChild.coreMO().node.getProperty("mathaccent"));
      this.checkLineAccents();
      this.baseRemoveIc = !this.isLineAbove && !this.isLineBelow && (!this.constructor.useIC || this.isMathAccent);
    }
    static {
      /**
       * Set to false for msubsup/msub (Appendix G 13)
       */
      this.useIC = true;
    }
    /**
     * @return {W}  The base element's wrapper
     */
    get baseChild() {
      return this.childNodes[this.node.base];
    }
    /**
     * @return {W}  The script element's wrapper (overridden in subclasses)
     */
    get scriptChild() {
      return this.childNodes[1];
    }
    /***************************************************************************/
    /*
     *  Methods for information about the core element for the base
     */
    /**
     * @return {W}    The wrapper for the base core mi or mo (or whatever)
     */
    getBaseCore() {
      let core = this.getSemanticBase() || this.childNodes[0];
      while (core && (core.childNodes.length === 1 && (core.node.isKind("mrow") || core.node.isKind("TeXAtom") && core.node.texClass !== TEXCLASS.VCENTER || core.node.isKind("mstyle") || core.node.isKind("mpadded") || core.node.isKind("mphantom") || core.node.isKind("semantics")) || core.node.isKind("munderover") && core.isMathAccent)) {
        this.setBaseAccentsFor(core);
        core = core.childNodes[0];
      }
      if (!core) {
        this.baseHasAccentOver = this.baseHasAccentUnder = false;
      }
      return core || this.childNodes[0];
    }
    /**
     * @param {W} core   The element to check for accents
     */
    setBaseAccentsFor(core) {
      if (core.node.isKind("munderover")) {
        if (this.baseHasAccentOver === null) {
          this.baseHasAccentOver = !!core.node.attributes.get("accent");
        }
        if (this.baseHasAccentUnder === null) {
          this.baseHasAccentUnder = !!core.node.attributes.get("accentunder");
        }
      }
    }
    /**
     * @return {W}    The base fence item or null
     */
    getSemanticBase() {
      let fence = this.node.attributes.getExplicit("data-semantic-fencepointer");
      return this.getBaseFence(this.baseChild, fence);
    }
    /**
     * Recursively retrieves an element for a given fencepointer.
     *
     * @param {W} fence The potential fence.
     * @param {string} id The fencepointer id.
     * @return {W} The original fence the scripts belong to.
     */
    getBaseFence(fence, id) {
      if (!fence || !fence.node.attributes || !id) {
        return null;
      }
      if (fence.node.attributes.getExplicit("data-semantic-id") === id) {
        return fence;
      }
      for (const child of fence.childNodes) {
        const result = this.getBaseFence(child, id);
        if (result) {
          return result;
        }
      }
      return null;
    }
    /**
     * @return {number}   The scaling factor for the base core relative to the munderover/msubsup
     */
    getBaseScale() {
      let child = this.baseCore;
      let scale = 1;
      while (child && child !== this) {
        const bbox = child.getOuterBBox();
        scale *= bbox.rscale;
        child = child.parent;
      }
      return scale;
    }
    /**
     * The base's italic correction (properly scaled)
     */
    getBaseIc() {
      return this.baseCore.getOuterBBox().ic * this.baseScale;
    }
    /**
     * An adjusted italic correction (for slightly better results)
     */
    getAdjustedIc() {
      const bbox = this.baseCore.getOuterBBox();
      return (bbox.ic ? 1.05 * bbox.ic + 0.05 : 0) * this.baseScale;
    }
    /**
     * @return {boolean}  True if the base is an mi, mn, or mo consisting of a single character
     */
    isCharBase() {
      let base = this.baseCore;
      return (base.node.isKind("mo") && base.size === null || base.node.isKind("mi") || base.node.isKind("mn")) && base.bbox.rscale === 1 && Array.from(base.getText()).length === 1;
    }
    /**
     * Determine if the under- and overscripts are under- or overlines.
     */
    checkLineAccents() {
      if (!this.node.isKind("munderover")) return;
      if (this.node.isKind("mover")) {
        this.isLineAbove = this.isLineAccent(this.scriptChild);
      } else if (this.node.isKind("munder")) {
        this.isLineBelow = this.isLineAccent(this.scriptChild);
      } else {
        const mml = this;
        this.isLineAbove = this.isLineAccent(mml.overChild);
        this.isLineBelow = this.isLineAccent(mml.underChild);
      }
    }
    /**
     * @param {W} script   The script node to check for being a line
     * @return {boolean}   True if the script is U+2015
     */
    isLineAccent(script2) {
      const node = script2.coreMO().node;
      return node.isToken && node.getText() === "―";
    }
    /***************************************************************************/
    /*
     *  Methods for sub-sup nodes
     */
    /**
     * @return {number}    The base child's width without the base italic correction (if not needed)
     */
    getBaseWidth() {
      const bbox = this.baseChild.getOuterBBox();
      return bbox.w * bbox.rscale - (this.baseRemoveIc ? this.baseIc : 0) + this.font.params.extra_ic;
    }
    /**
     * This gives the common bbox for msub and msup.  It is overridden
     * for all the others (msubsup, munder, mover, munderover).
     *
     * @override
     */
    computeBBox(bbox, recompute = false) {
      const w = this.getBaseWidth();
      const [x, y] = this.getOffset();
      bbox.append(this.baseChild.getOuterBBox());
      bbox.combine(this.scriptChild.getOuterBBox(), w + x, y);
      bbox.w += this.font.params.scriptspace;
      bbox.clean();
      this.setChildPWidths(recompute);
    }
    /**
     * Get the shift for the script (implemented in subclasses)
     *
     * @return {[number, number]}   The horizontal and vertical offsets for the script
     */
    getOffset() {
      return [0, 0];
    }
    /**
     * @param {number} n    The value to use if the base isn't a (non-large-op, unstretched) char
     * @return {number}     Either n or 0
     */
    baseCharZero(n) {
      const largeop2 = !!this.baseCore.node.attributes.get("largeop");
      const scale = this.baseScale;
      return this.baseIsChar && !largeop2 && scale === 1 ? 0 : n;
    }
    /**
     * Get the shift for a subscript (TeXBook Appendix G 18ab)
     *
     * @return {number}     The vertical offset for the script
     */
    getV() {
      const bbox = this.baseCore.getOuterBBox();
      const sbox = this.scriptChild.getOuterBBox();
      const tex = this.font.params;
      const subscriptshift = this.length2em(this.node.attributes.get("subscriptshift"), tex.sub1);
      return Math.max(
        this.baseCharZero(bbox.d * this.baseScale + tex.sub_drop * sbox.rscale),
        subscriptshift,
        sbox.h * sbox.rscale - 4 / 5 * tex.x_height
      );
    }
    /**
     * Get the shift for a superscript (TeXBook Appendix G 18acd)
     *
     * @return {number}     The vertical offset for the script
     */
    getU() {
      const bbox = this.baseCore.getOuterBBox();
      const sbox = this.scriptChild.getOuterBBox();
      const tex = this.font.params;
      const attr = this.node.attributes.getList("displaystyle", "superscriptshift");
      const prime = this.node.getProperty("texprimestyle");
      const p = prime ? tex.sup3 : attr.displaystyle ? tex.sup1 : tex.sup2;
      const superscriptshift = this.length2em(attr.superscriptshift, p);
      return Math.max(
        this.baseCharZero(bbox.h * this.baseScale - tex.sup_drop * sbox.rscale),
        superscriptshift,
        sbox.d * sbox.rscale + 1 / 4 * tex.x_height
      );
    }
    /***************************************************************************/
    /*
     *  Methods for under-over nodes
     */
    /**
     * @return {boolean}  True if the base has movablelimits (needed by munderover)
     */
    hasMovableLimits() {
      const display = this.node.attributes.get("displaystyle");
      const mo = this.baseChild.coreMO().node;
      return !display && !!mo.attributes.get("movablelimits");
    }
    /**
     * Get the separation and offset for overscripts (TeXBoox Appendix G 13, 13a)
     *
     * @param {BBox} basebox  The bounding box of the base
     * @param {BBox} overbox  The bounding box of the overscript
     * @return {[number, number]}     The separation between their boxes, and the offset of the overscript
     */
    getOverKU(basebox, overbox) {
      const accent = this.node.attributes.get("accent");
      const tex = this.font.params;
      const d = overbox.d * overbox.rscale;
      const t = tex.rule_thickness * tex.separation_factor;
      const delta = this.baseHasAccentOver ? t : 0;
      const T = this.isLineAbove ? 3 * tex.rule_thickness : t;
      const k = (accent ? T : Math.max(tex.big_op_spacing1, tex.big_op_spacing3 - Math.max(0, d))) - delta;
      return [k, basebox.h * basebox.rscale + k + d];
    }
    /**
     * Get the separation and offset for underscripts (TeXBoox Appendix G 13, 13a)
     *
     * @param {BBox} basebox   The bounding box of the base
     * @param {BBox} underbox  The bounding box of the underscript
     * @return {[number, number]}      The separation between their boxes, and the offset of the underscript
     */
    getUnderKV(basebox, underbox) {
      const accent = this.node.attributes.get("accentunder");
      const tex = this.font.params;
      const h = underbox.h * underbox.rscale;
      const t = tex.rule_thickness * tex.separation_factor;
      const delta = this.baseHasAccentUnder ? t : 0;
      const T = this.isLineBelow ? 3 * tex.rule_thickness : t;
      const k = (accent ? T : Math.max(tex.big_op_spacing2, tex.big_op_spacing4 - h)) - delta;
      return [k, -(basebox.d * basebox.rscale + k + h)];
    }
    /**
     * @param {BBox[]} boxes     The bounding boxes whose offsets are to be computed
     * @param {number[]=} delta  The initial x offsets of the boxes
     * @return {number[]}        The actual offsets needed to center the boxes in the stack
     */
    getDeltaW(boxes, delta = [0, 0, 0]) {
      const align = this.node.attributes.get("align");
      const widths = boxes.map((box) => box.w * box.rscale);
      widths[0] -= this.baseRemoveIc && !this.baseCore.node.attributes.get("largeop") ? this.baseIc : 0;
      const w = Math.max(...widths);
      const dw = [];
      let m = 0;
      for (const i of widths.keys()) {
        dw[i] = (align === "center" ? (w - widths[i]) / 2 : align === "right" ? w - widths[i] : 0) + delta[i];
        if (dw[i] < m) {
          m = -dw[i];
        }
      }
      if (m) {
        for (const i of dw.keys()) {
          dw[i] += m;
        }
      }
      [1, 2].map((i) => dw[i] += boxes[i] ? boxes[i].dx * boxes[0].scale : 0);
      return dw;
    }
    /**
     * @param {boolean=} noskew   Whether to ignore the skew amount
     * @return {number}           The offset for under and over
     */
    getDelta(noskew = false) {
      const accent = this.node.attributes.get("accent");
      const { sk, ic } = this.baseCore.getOuterBBox();
      return ((accent && !noskew ? sk : 0) + this.font.skewIcFactor * ic) * this.baseScale;
    }
    /**
     * Handle horizontal stretching of children to match greatest width
     *  of all children
     */
    stretchChildren() {
      let stretchy = [];
      for (const child of this.childNodes) {
        if (child.canStretch(2 /* Horizontal */)) {
          stretchy.push(child);
        }
      }
      let count = stretchy.length;
      let nodeCount = this.childNodes.length;
      if (count && nodeCount > 1) {
        let W = 0;
        let all = count > 1 && count === nodeCount;
        for (const child of this.childNodes) {
          const noStretch = child.stretch.dir === 0 /* None */;
          if (all || noStretch) {
            const { w, rscale } = child.getOuterBBox(noStretch);
            if (w * rscale > W) W = w * rscale;
          }
        }
        for (const child of stretchy) {
          child.coreMO().getStretchedVariant([W / child.bbox.rscale]);
        }
      }
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/scriptbase.ts
var SVGscriptbase = class extends CommonScriptbaseMixin(SVGWrapper) {
  static {
    /**
     * The scriptbase wrapper
     */
    this.kind = "scriptbase";
  }
  /**
   * This gives the common output for msub and msup.  It is overridden
   * for all the others (msubsup, munder, mover, munderover).
   *
   * @override
   */
  toSVG(parent) {
    const svg = this.standardSVGnode(parent);
    const w = this.getBaseWidth();
    const [x, v] = this.getOffset();
    this.baseChild.toSVG(svg);
    this.scriptChild.toSVG(svg);
    this.scriptChild.place(w + x, v);
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/msubsup.ts
function CommonMsubMixin(Base) {
  return class extends Base {
    static {
      /**
       * Do not include italic correction
       */
      this.useIC = false;
    }
    /**
     * @override
     */
    get scriptChild() {
      return this.childNodes[this.node.sub];
    }
    /**
     * Get the shift for the subscript
     *
     * @override
     */
    getOffset() {
      return [0, -this.getV()];
    }
  };
}
function CommonMsupMixin(Base) {
  return class extends Base {
    /**
     * @override
     */
    get scriptChild() {
      return this.childNodes[this.node.sup];
    }
    /**
     * Get the shift for the superscript
     *
     * @override
     */
    getOffset() {
      const x = this.getAdjustedIc() - (this.baseRemoveIc ? 0 : this.baseIc);
      return [x, this.getU()];
    }
  };
}
function CommonMsubsupMixin(Base) {
  return class extends Base {
    constructor() {
      super(...arguments);
      /**
       *  Cached values for the script offsets and separation (so if they are
       *  computed in computeBBox(), they don't have to be recomputed during output)
       */
      this.UVQ = null;
    }
    static {
      /**
       * Do not include italic correction
       */
      this.useIC = false;
    }
    /**
     * @return {W}  The wrapper for the subscript
     */
    get subChild() {
      return this.childNodes[this.node.sub];
    }
    /**
     * @return {W}  The wrapper for the superscript
     */
    get supChild() {
      return this.childNodes[this.node.sup];
    }
    /**
     * @override
     */
    computeBBox(bbox, recompute = false) {
      const basebox = this.baseChild.getOuterBBox();
      const [subbox, supbox] = [this.subChild.getOuterBBox(), this.supChild.getOuterBBox()];
      bbox.empty();
      bbox.append(basebox);
      const w = this.getBaseWidth();
      const x = this.getAdjustedIc();
      const [u, v] = this.getUVQ();
      bbox.combine(subbox, w, v);
      bbox.combine(supbox, w + x, u);
      bbox.w += this.font.params.scriptspace;
      bbox.clean();
      this.setChildPWidths(recompute);
    }
    /**
     * Get the shift for the scripts and their separation (TeXBook Appendix G 18adef)
     *
     * @param {BBox} subbox     The bounding box of the superscript
     * @param {BBox} supbox     The bounding box of the subscript
     * @return {number[]}       The vertical offsets for super and subscripts, and the space between them
     */
    getUVQ(subbox = this.subChild.getOuterBBox(), supbox = this.supChild.getOuterBBox()) {
      const basebox = this.baseCore.getOuterBBox();
      if (this.UVQ) return this.UVQ;
      const tex = this.font.params;
      const t = 3 * tex.rule_thickness;
      const subscriptshift = this.length2em(this.node.attributes.get("subscriptshift"), tex.sub2);
      const drop = this.baseCharZero(basebox.d * this.baseScale + tex.sub_drop * subbox.rscale);
      let [u, v] = [this.getU(), Math.max(drop, subscriptshift)];
      let q = u - supbox.d * supbox.rscale - (subbox.h * subbox.rscale - v);
      if (q < t) {
        v += t - q;
        const p = 4 / 5 * tex.x_height - (u - supbox.d * supbox.rscale);
        if (p > 0) {
          u += p;
          v -= p;
        }
      }
      u = Math.max(this.length2em(this.node.attributes.get("superscriptshift"), u), u);
      v = Math.max(this.length2em(this.node.attributes.get("subscriptshift"), v), v);
      q = u - supbox.d * supbox.rscale - (subbox.h * subbox.rscale - v);
      this.UVQ = [u, -v, q];
      return this.UVQ;
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/msubsup.ts
var SVGmsub = class extends CommonMsubMixin(SVGscriptbase) {
  static {
    /**
     * The msub wrapper
     */
    this.kind = MmlMsub.prototype.kind;
  }
};
var SVGmsup = class extends CommonMsupMixin(SVGscriptbase) {
  static {
    /**
     * The msup wrapper
     */
    this.kind = MmlMsup.prototype.kind;
  }
};
var SVGmsubsup = class extends CommonMsubsupMixin(SVGscriptbase) {
  static {
    /**
     * The msubsup wrapper
     */
    this.kind = MmlMsubsup.prototype.kind;
  }
  /**
   * @override
   */
  toSVG(parent) {
    const svg = this.standardSVGnode(parent);
    const [base, sup, sub] = [this.baseChild, this.supChild, this.subChild];
    const w = this.getBaseWidth();
    const x = this.getAdjustedIc();
    const [u, v] = this.getUVQ();
    base.toSVG(svg);
    sup.toSVG(svg);
    sub.toSVG(svg);
    sub.place(w, v);
    sup.place(w + x, u);
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/munderover.ts
function CommonMunderMixin(Base) {
  return class extends Base {
    /**
     * @override
     */
    get scriptChild() {
      return this.childNodes[this.node.under];
    }
    /**
     * @override
     * @constructor
     */
    constructor(...args) {
      super(...args);
      this.stretchChildren();
    }
    /**
     * @override
     */
    computeBBox(bbox, recompute = false) {
      if (this.hasMovableLimits()) {
        super.computeBBox(bbox, recompute);
        return;
      }
      bbox.empty();
      const basebox = this.baseChild.getOuterBBox();
      const underbox = this.scriptChild.getOuterBBox();
      const v = this.getUnderKV(basebox, underbox)[1];
      const delta = this.isLineBelow ? 0 : this.getDelta(true);
      const [bw, uw] = this.getDeltaW([basebox, underbox], [0, -delta]);
      bbox.combine(basebox, bw, 0);
      bbox.combine(underbox, uw, v);
      bbox.d += this.font.params.big_op_spacing5;
      bbox.clean();
      this.setChildPWidths(recompute);
    }
  };
}
function CommonMoverMixin(Base) {
  return class extends Base {
    /**
     * @override
     */
    get scriptChild() {
      return this.childNodes[this.node.over];
    }
    /**
     * @override
     * @constructor
     */
    constructor(...args) {
      super(...args);
      this.stretchChildren();
    }
    /**
     * @override
     */
    computeBBox(bbox) {
      if (this.hasMovableLimits()) {
        super.computeBBox(bbox);
        return;
      }
      bbox.empty();
      const basebox = this.baseChild.getOuterBBox();
      const overbox = this.scriptChild.getOuterBBox();
      if (this.node.attributes.get("accent")) {
        basebox.h = Math.max(basebox.h, this.font.params.x_height * basebox.scale);
      }
      const u = this.getOverKU(basebox, overbox)[1];
      const delta = this.isLineAbove ? 0 : this.getDelta();
      const [bw, ow] = this.getDeltaW([basebox, overbox], [0, delta]);
      bbox.combine(basebox, bw, 0);
      bbox.combine(overbox, ow, u);
      bbox.h += this.font.params.big_op_spacing5;
      bbox.clean();
    }
  };
}
function CommonMunderoverMixin(Base) {
  return class extends Base {
    /*
     * @return {W}   The wrapped under node
     */
    get underChild() {
      return this.childNodes[this.node.under];
    }
    /*
     * @return {W}   The wrapped overder node
     */
    get overChild() {
      return this.childNodes[this.node.over];
    }
    /*
     * Needed for movablelimits
     *
     * @override
     */
    get subChild() {
      return this.underChild;
    }
    /*
     * Needed for movablelimits
     *
     * @override
     */
    get supChild() {
      return this.overChild;
    }
    /**
     * @override
     * @constructor
     */
    constructor(...args) {
      super(...args);
      this.stretchChildren();
    }
    /**
     * @override
     */
    computeBBox(bbox) {
      if (this.hasMovableLimits()) {
        super.computeBBox(bbox);
        return;
      }
      bbox.empty();
      const overbox = this.overChild.getOuterBBox();
      const basebox = this.baseChild.getOuterBBox();
      const underbox = this.underChild.getOuterBBox();
      if (this.node.attributes.get("accent")) {
        basebox.h = Math.max(basebox.h, this.font.params.x_height * basebox.scale);
      }
      const u = this.getOverKU(basebox, overbox)[1];
      const v = this.getUnderKV(basebox, underbox)[1];
      const delta = this.getDelta();
      const [bw, uw, ow] = this.getDeltaW(
        [basebox, underbox, overbox],
        [0, this.isLineBelow ? 0 : -delta, this.isLineAbove ? 0 : delta]
      );
      bbox.combine(basebox, bw, 0);
      bbox.combine(overbox, ow, u);
      bbox.combine(underbox, uw, v);
      const z = this.font.params.big_op_spacing5;
      bbox.h += z;
      bbox.d += z;
      bbox.clean();
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/munderover.ts
var SVGmunder = class extends CommonMunderMixin(SVGmsub) {
  static {
    /**
     * The munder wrapper
     */
    this.kind = MmlMunder.prototype.kind;
  }
  /**
   * @override
   */
  toSVG(parent) {
    if (this.hasMovableLimits()) {
      super.toSVG(parent);
      return;
    }
    const svg = this.standardSVGnode(parent);
    const [base, script2] = [this.baseChild, this.scriptChild];
    const [bbox, sbox] = [base.getOuterBBox(), script2.getOuterBBox()];
    base.toSVG(svg);
    script2.toSVG(svg);
    const delta = this.isLineBelow ? 0 : this.getDelta(true);
    const v = this.getUnderKV(bbox, sbox)[1];
    const [bx, sx] = this.getDeltaW([bbox, sbox], [0, -delta]);
    base.place(bx, 0);
    script2.place(sx, v);
  }
};
var SVGmover = class extends CommonMoverMixin(SVGmsup) {
  static {
    /**
     * The mover wrapper
     */
    this.kind = MmlMover.prototype.kind;
  }
  /**
   * @override
   */
  toSVG(parent) {
    if (this.hasMovableLimits()) {
      super.toSVG(parent);
      return;
    }
    const svg = this.standardSVGnode(parent);
    const [base, script2] = [this.baseChild, this.scriptChild];
    const [bbox, sbox] = [base.getOuterBBox(), script2.getOuterBBox()];
    base.toSVG(svg);
    script2.toSVG(svg);
    const delta = this.isLineAbove ? 0 : this.getDelta();
    const u = this.getOverKU(bbox, sbox)[1];
    const [bx, sx] = this.getDeltaW([bbox, sbox], [0, delta]);
    base.place(bx, 0);
    script2.place(sx, u);
  }
};
var SVGmunderover = class extends CommonMunderoverMixin(SVGmsubsup) {
  static {
    /**
     * The munderover wrapper
     */
    this.kind = MmlMunderover.prototype.kind;
  }
  /**
   * @override
   */
  toSVG(parent) {
    if (this.hasMovableLimits()) {
      super.toSVG(parent);
      return;
    }
    const svg = this.standardSVGnode(parent);
    const [base, over, under] = [this.baseChild, this.overChild, this.underChild];
    const [bbox, obox, ubox] = [base.getOuterBBox(), over.getOuterBBox(), under.getOuterBBox()];
    base.toSVG(svg);
    under.toSVG(svg);
    over.toSVG(svg);
    const delta = this.getDelta();
    const u = this.getOverKU(bbox, obox)[1];
    const v = this.getUnderKV(bbox, ubox)[1];
    const [bx, ux, ox] = this.getDeltaW(
      [bbox, ubox, obox],
      [0, this.isLineBelow ? 0 : -delta, this.isLineAbove ? 0 : delta]
    );
    base.place(bx, 0);
    under.place(ux, v);
    over.place(ox, u);
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/mmultiscripts.ts
var NextScript = {
  base: "subList",
  subList: "supList",
  supList: "subList",
  psubList: "psupList",
  psupList: "psubList"
};
function CommonMmultiscriptsMixin(Base) {
  return class extends Base {
    /**
     * @override
     */
    constructor(...args) {
      super(...args);
      /**
       *  The cached data for the various bounding boxes
       */
      this.scriptData = null;
      /**
       *  The index of the child following the <mprescripts/> tag
       */
      this.firstPrescript = 0;
      this.getScriptData();
    }
    /*************************************************************/
    /**
     * @param {BBox} pre   The prescript bounding box
     * @param {BBox} post  The postcript bounding box
     * @return {BBox}      The combined bounding box
     */
    combinePrePost(pre, post) {
      const bbox = new BBox(pre);
      bbox.combine(post, 0, 0);
      return bbox;
    }
    /*************************************************************/
    /**
     * @override
     */
    computeBBox(bbox, recompute = false) {
      const scriptspace = this.font.params.scriptspace;
      const data = this.scriptData;
      const sub = this.combinePrePost(data.sub, data.psub);
      const sup = this.combinePrePost(data.sup, data.psup);
      const [u, v] = this.getUVQ(sub, sup);
      bbox.empty();
      if (data.numPrescripts) {
        bbox.combine(data.psup, scriptspace, u);
        bbox.combine(data.psub, scriptspace, v);
      }
      bbox.append(data.base);
      if (data.numScripts) {
        const w = bbox.w;
        bbox.combine(data.sup, w, u);
        bbox.combine(data.sub, w, v);
        bbox.w += scriptspace;
      }
      bbox.clean();
      this.setChildPWidths(recompute);
    }
    /**
     * Compute the bounding box information about all the scripts
     */
    getScriptData() {
      const data = this.scriptData = {
        base: null,
        sub: BBox.empty(),
        sup: BBox.empty(),
        psub: BBox.empty(),
        psup: BBox.empty(),
        numPrescripts: 0,
        numScripts: 0
      };
      const lists = this.getScriptBBoxLists();
      this.combineBBoxLists(data.sub, data.sup, lists.subList, lists.supList);
      this.combineBBoxLists(data.psub, data.psup, lists.psubList, lists.psupList);
      data.base = lists.base[0];
      data.numPrescripts = lists.psubList.length;
      data.numScripts = lists.subList.length;
    }
    /**
     * @return {ScriptLists}  The bounding boxes for all the scripts divided into lists by position
     */
    getScriptBBoxLists() {
      const lists = {
        base: [],
        subList: [],
        supList: [],
        psubList: [],
        psupList: []
      };
      let script2 = "base";
      for (const child of this.childNodes) {
        if (child.node.isKind("mprescripts")) {
          script2 = "psubList";
        } else {
          lists[script2].push(child.getOuterBBox());
          script2 = NextScript[script2];
        }
      }
      this.firstPrescript = lists.subList.length + lists.supList.length + 2;
      this.padLists(lists.subList, lists.supList);
      this.padLists(lists.psubList, lists.psupList);
      return lists;
    }
    /**
     * Pad the second list, if it is one short
     *
     * @param {BBox[]} list1   The first list
     * @param {BBox[]} list2   The second list
     */
    padLists(list1, list2) {
      if (list1.length > list2.length) {
        list2.push(BBox.empty());
      }
    }
    /**
     * @param {BBox} bbox1    The bbox for the combined subscripts
     * @param {BBox} bbox2    The bbox for the combined superscripts
     * @param {BBox[]} list1  The list of subscripts to combine
     * @param {BBox[]} list2  The list of superscripts to combine
     */
    combineBBoxLists(bbox1, bbox2, list1, list2) {
      for (let i = 0; i < list1.length; i++) {
        const [w1, h1, d1] = this.getScaledWHD(list1[i]);
        const [w2, h2, d2] = this.getScaledWHD(list2[i]);
        const w = Math.max(w1, w2);
        bbox1.w += w;
        bbox2.w += w;
        if (h1 > bbox1.h) bbox1.h = h1;
        if (d1 > bbox1.d) bbox1.d = d1;
        if (h2 > bbox2.h) bbox2.h = h2;
        if (d2 > bbox2.d) bbox2.d = d2;
      }
    }
    /**
     * @param {BBox} bbox  The bounding box from which to get the (scaled) width, height, and depth
     */
    getScaledWHD(bbox) {
      const { w, h, d, rscale } = bbox;
      return [w * rscale, h * rscale, d * rscale];
    }
    /*************************************************************/
    /**
     * @override
     */
    getUVQ(subbox, supbox) {
      if (!this.UVQ) {
        let [u, v, q] = [0, 0, 0];
        if (subbox.h === 0 && subbox.d === 0) {
          u = this.getU();
        } else if (supbox.h === 0 && supbox.d === 0) {
          u = -this.getV();
        } else {
          [u, v, q] = super.getUVQ(subbox, supbox);
        }
        this.UVQ = [u, v, q];
      }
      return this.UVQ;
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/mmultiscripts.ts
function AlignX(align) {
  return {
    left: (_w, _W) => 0,
    center: (w, W) => (W - w) / 2,
    right: (w, W) => W - w
  }[align] || ((_w, _W) => 0);
}
var SVGmmultiscripts = class extends CommonMmultiscriptsMixin(SVGmsubsup) {
  static {
    /**
     * The mmultiscripts wrapper
     */
    this.kind = MmlMmultiscripts.prototype.kind;
  }
  /**
   * @override
   */
  toSVG(parent) {
    const svg = this.standardSVGnode(parent);
    const data = this.scriptData;
    const scriptalign = this.node.getProperty("scriptalign") || "right left";
    const [preAlign, postAlign] = split(scriptalign + " " + scriptalign);
    const sub = this.combinePrePost(data.sub, data.psub);
    const sup = this.combinePrePost(data.sup, data.psup);
    const [u, v] = this.getUVQ(sub, sup);
    let x = 0;
    if (data.numPrescripts) {
      x = this.addScripts(0.05, u, v, this.firstPrescript, data.numPrescripts, preAlign);
    }
    const base = this.baseChild;
    base.toSVG(svg);
    base.place(x, 0);
    x += base.getOuterBBox().w;
    if (data.numScripts) {
      this.addScripts(x, u, v, 1, data.numScripts, postAlign);
    }
  }
  /**
   * Create a table with the super and subscripts properly separated and aligned.
   *
   * @param {number} x       The x offset of the scripts
   * @param {number} u       The baseline offset for the superscripts
   * @param {number} v       The baseline offset for the subscripts
   * @param {number} i       The starting index for the scripts
   * @param {number} n       The number of sub/super-scripts
   * @param {string} align   The alignment for the scripts
   * @return {number}        The right-hand offset of the scripts
   */
  addScripts(x, u, v, i, n, align) {
    const adaptor2 = this.adaptor;
    const alignX = AlignX(align);
    const supRow = adaptor2.append(this.element, this.svg("g"));
    const subRow = adaptor2.append(this.element, this.svg("g"));
    this.place(x, u, supRow);
    this.place(x, v, subRow);
    let m = i + 2 * n;
    let dx = 0;
    while (i < m) {
      const [sub, sup] = [this.childNodes[i++], this.childNodes[i++]];
      const [subbox, supbox] = [sub.getOuterBBox(), sup.getOuterBBox()];
      const [subr, supr] = [subbox.rscale, supbox.rscale];
      const w = Math.max(subbox.w * subr, supbox.w * supr);
      sub.toSVG(subRow);
      sup.toSVG(supRow);
      sub.place(dx + alignX(subbox.w * subr, w), 0);
      sup.place(dx + alignX(supbox.w * supr, w), 0);
      dx += w;
    }
    return x + dx;
  }
};

// node_modules/mathjax-full/ts/util/numeric.ts
function sum(A) {
  return A.reduce((a, b) => a + b, 0);
}
function max(A) {
  return A.reduce((a, b) => Math.max(a, b), 0);
}

// node_modules/mathjax-full/ts/output/common/Wrappers/mtable.ts
function CommonMtableMixin(Base) {
  return class extends Base {
    /******************************************************************/
    /**
     * @override
     * @constructor
     */
    constructor(...args) {
      super(...args);
      /**
       * The number of columns in the table
       */
      this.numCols = 0;
      /**
       * The number of rows in the table
       */
      this.numRows = 0;
      /**
       * The bounding box information for the table rows and columns
       */
      this.data = null;
      /**
       * The table cells that have percentage-width content
       */
      this.pwidthCells = [];
      /**
       * The full width of a percentage-width table
       */
      this.pWidth = 0;
      this.numCols = max(this.tableRows.map((row) => row.numCells));
      this.numRows = this.childNodes.length;
      this.hasLabels = this.childNodes.reduce((value, row) => value || row.node.isKind("mlabeledtr"), false);
      this.findContainer();
      this.isTop = !this.container || this.container.node.isKind("math") && !this.container.parent;
      if (this.isTop) {
        this.jax.table = this;
      }
      this.getPercentageWidth();
      const attributes = this.node.attributes;
      this.frame = attributes.get("frame") !== "none";
      this.fLine = this.frame && attributes.get("frame") ? 0.07 : 0;
      this.fSpace = this.frame ? this.convertLengths(this.getAttributeArray("framespacing")) : [0, 0];
      this.cSpace = this.convertLengths(this.getColumnAttributes("columnspacing"));
      this.rSpace = this.convertLengths(this.getRowAttributes("rowspacing"));
      this.cLines = this.getColumnAttributes("columnlines").map((x) => x === "none" ? 0 : 0.07);
      this.rLines = this.getRowAttributes("rowlines").map((x) => x === "none" ? 0 : 0.07);
      this.cWidths = this.getColumnWidths();
      this.stretchRows();
      this.stretchColumns();
    }
    /**
     * @return {R[]}  The rows of the table
     */
    get tableRows() {
      return this.childNodes;
    }
    /**
     * Find the container and the child position of the table
     */
    findContainer() {
      let node = this;
      let parent = node.parent;
      while (parent && (parent.node.notParent || parent.node.isKind("mrow"))) {
        node = parent;
        parent = parent.parent;
      }
      this.container = parent;
      this.containerI = node.node.childPosition();
    }
    /**
     * If the table has a precentage width or has labels, set the pwidth of the bounding box
     */
    getPercentageWidth() {
      if (this.hasLabels) {
        this.bbox.pwidth = BBox.fullWidth;
      } else {
        const width = this.node.attributes.get("width");
        if (isPercent(width)) {
          this.bbox.pwidth = width;
        }
      }
    }
    /**
     * Stretch the rows to the equal height or natural height
     */
    stretchRows() {
      const equal = this.node.attributes.get("equalrows");
      const HD = equal ? this.getEqualRowHeight() : 0;
      const { H: H2, D } = equal ? this.getTableData() : { H: [0], D: [0] };
      const rows = this.tableRows;
      for (let i = 0; i < this.numRows; i++) {
        const hd = equal ? [(HD + H2[i] - D[i]) / 2, (HD - H2[i] + D[i]) / 2] : null;
        rows[i].stretchChildren(hd);
      }
    }
    /**
     * Stretch the columns to their proper widths
     */
    stretchColumns() {
      for (let i = 0; i < this.numCols; i++) {
        const width = typeof this.cWidths[i] === "number" ? this.cWidths[i] : null;
        this.stretchColumn(i, width);
      }
    }
    /**
     * Handle horizontal stretching within the ith column
     *
     * @param {number} i   The column number
     * @param {number} W   The computed width of the column (or null of not computed)
     */
    stretchColumn(i, W) {
      let stretchy = [];
      for (const row of this.tableRows) {
        const cell = row.getChild(i);
        if (cell) {
          const child = cell.childNodes[0];
          if (child.stretch.dir === 0 /* None */ && child.canStretch(2 /* Horizontal */)) {
            stretchy.push(child);
          }
        }
      }
      let count = stretchy.length;
      let nodeCount = this.childNodes.length;
      if (count && nodeCount > 1) {
        if (W === null) {
          W = 0;
          let all = count > 1 && count === nodeCount;
          for (const row of this.tableRows) {
            const cell = row.getChild(i);
            if (cell) {
              const child = cell.childNodes[0];
              const noStretch = child.stretch.dir === 0 /* None */;
              if (all || noStretch) {
                const { w } = child.getBBox(noStretch);
                if (w > W) {
                  W = w;
                }
              }
            }
          }
        }
        for (const child of stretchy) {
          child.coreMO().getStretchedVariant([W]);
        }
      }
    }
    /******************************************************************/
    /**
     * Determine the row heights and depths, the column widths,
     * and the natural width and height of the table.
     *
     * @return {TableData}  The dimensions of the rows and columns
     */
    getTableData() {
      if (this.data) {
        return this.data;
      }
      const H2 = new Array(this.numRows).fill(0);
      const D = new Array(this.numRows).fill(0);
      const W = new Array(this.numCols).fill(0);
      const NH = new Array(this.numRows);
      const ND = new Array(this.numRows);
      const LW = [0];
      const rows = this.tableRows;
      for (let j = 0; j < rows.length; j++) {
        let M = 0;
        const row = rows[j];
        const align = row.node.attributes.get("rowalign");
        for (let i = 0; i < row.numCells; i++) {
          const cell = row.getChild(i);
          M = this.updateHDW(cell, i, j, align, H2, D, W, M);
          this.recordPWidthCell(cell, i);
        }
        NH[j] = H2[j];
        ND[j] = D[j];
        if (row.labeled) {
          M = this.updateHDW(row.childNodes[0], 0, j, align, H2, D, LW, M);
        }
        this.extendHD(j, H2, D, M);
        this.extendHD(j, NH, ND, M);
      }
      const L = LW[0];
      this.data = { H: H2, D, W, NH, ND, L };
      return this.data;
    }
    /**
     * @override
     */
    updateHDW(cell, i, j, align, H2, D, W, M) {
      let { h, d, w } = cell.getBBox();
      const scale = cell.parent.bbox.rscale;
      if (cell.parent.bbox.rscale !== 1) {
        h *= scale;
        d *= scale;
        w *= scale;
      }
      if (this.node.getProperty("useHeight")) {
        if (h < 0.75) h = 0.75;
        if (d < 0.25) d = 0.25;
      }
      let m = 0;
      align = cell.node.attributes.get("rowalign") || align;
      if (align !== "baseline" && align !== "axis") {
        m = h + d;
        h = d = 0;
      }
      if (h > H2[j]) H2[j] = h;
      if (d > D[j]) D[j] = d;
      if (m > M) M = m;
      if (W && w > W[i]) W[i] = w;
      return M;
    }
    /**
     * @override
     */
    extendHD(i, H2, D, M) {
      const d = (M - (H2[i] + D[i])) / 2;
      if (d < 1e-5) return;
      H2[i] += d;
      D[i] += d;
    }
    /**
     * @param {C} cell     The cell to check for percentage widths
     * @param {number} i   The column index of the cell
     */
    recordPWidthCell(cell, i) {
      if (cell.childNodes[0] && cell.childNodes[0].getBBox().pwidth) {
        this.pwidthCells.push([cell, i]);
      }
    }
    /**
     * @override
     */
    computeBBox(bbox, _recompute = false) {
      const { H: H2, D } = this.getTableData();
      let height, width;
      if (this.node.attributes.get("equalrows")) {
        const HD = this.getEqualRowHeight();
        height = sum([].concat(this.rLines, this.rSpace)) + HD * this.numRows;
      } else {
        height = sum(H2.concat(D, this.rLines, this.rSpace));
      }
      height += 2 * (this.fLine + this.fSpace[1]);
      const CW = this.getComputedWidths();
      width = sum(CW.concat(this.cLines, this.cSpace)) + 2 * (this.fLine + this.fSpace[0]);
      const w = this.node.attributes.get("width");
      if (w !== "auto") {
        width = Math.max(this.length2em(w, 0) + 2 * this.fLine, width);
      }
      let [h, d] = this.getBBoxHD(height);
      bbox.h = h;
      bbox.d = d;
      bbox.w = width;
      let [L, R] = this.getBBoxLR();
      bbox.L = L;
      bbox.R = R;
      if (!isPercent(w)) {
        this.setColumnPWidths();
      }
    }
    /**
     * @override
     */
    setChildPWidths(_recompute, cwidth, _clear) {
      const width = this.node.attributes.get("width");
      if (!isPercent(width)) return false;
      if (!this.hasLabels) {
        this.bbox.pwidth = "";
        this.container.bbox.pwidth = "";
      }
      const { w, L, R } = this.bbox;
      const labelInWidth = this.node.attributes.get("data-width-includes-label");
      const W = Math.max(w, this.length2em(width, Math.max(cwidth, L + w + R))) - (labelInWidth ? L + R : 0);
      const cols = this.node.attributes.get("equalcolumns") ? Array(this.numCols).fill(this.percent(1 / Math.max(1, this.numCols))) : this.getColumnAttributes("columnwidth", 0);
      this.cWidths = this.getColumnWidthsFixed(cols, W);
      const CW = this.getComputedWidths();
      this.pWidth = sum(CW.concat(this.cLines, this.cSpace)) + 2 * (this.fLine + this.fSpace[0]);
      if (this.isTop) {
        this.bbox.w = this.pWidth;
      }
      this.setColumnPWidths();
      if (this.pWidth !== w) {
        this.parent.invalidateBBox();
      }
      return this.pWidth !== w;
    }
    /**
     * Finalize any cells that have percentage-width content
     */
    setColumnPWidths() {
      const W = this.cWidths;
      for (const [cell, i] of this.pwidthCells) {
        if (cell.setChildPWidths(false, W[i])) {
          cell.invalidateBBox();
          cell.getBBox();
        }
      }
    }
    /**
     * @param {number} height   The total height of the table
     * @return {[number, number]}  The [height, depth] for the aligned table
     */
    getBBoxHD(height) {
      const [align, row] = this.getAlignmentRow();
      if (row === null) {
        const a = this.font.params.axis_height;
        const h2 = height / 2;
        const HD = {
          top: [0, height],
          center: [h2, h2],
          bottom: [height, 0],
          baseline: [h2, h2],
          axis: [h2 + a, h2 - a]
        };
        return HD[align] || [h2, h2];
      } else {
        const y = this.getVerticalPosition(row, align);
        return [y, height - y];
      }
    }
    /**
     * Get bbox left and right amounts to cover labels
     */
    getBBoxLR() {
      if (this.hasLabels) {
        const attributes = this.node.attributes;
        const side = attributes.get("side");
        let [pad, align] = this.getPadAlignShift(side);
        const labels = this.hasLabels && !!attributes.get("data-width-includes-label");
        if (labels && this.frame && this.fSpace[0]) {
          pad -= this.fSpace[0];
        }
        return align === "center" && !labels ? [pad, pad] : side === "left" ? [pad, 0] : [0, pad];
      }
      return [0, 0];
    }
    /**
     * @param {string} side                 The side for the labels
     * @return {[number, string, number]}   The padding, alignment, and shift amounts
     */
    getPadAlignShift(side) {
      const { L } = this.getTableData();
      const sep = this.length2em(this.node.attributes.get("minlabelspacing"));
      let pad = L + sep;
      const [lpad, rpad] = this.styles == null ? ["", ""] : [this.styles.get("padding-left"), this.styles.get("padding-right")];
      if (lpad || rpad) {
        pad = Math.max(pad, this.length2em(lpad || "0"), this.length2em(rpad || "0"));
      }
      let [align, shift] = this.getAlignShift();
      if (align === side) {
        shift = side === "left" ? Math.max(pad, shift) - pad : Math.min(-pad, shift) + pad;
      }
      return [pad, align, shift];
    }
    /**
     * @override
     */
    getAlignShift() {
      return this.isTop ? super.getAlignShift() : [this.container.getChildAlign(this.containerI), 0];
    }
    /**
     * @return {number}    The true width of the table (without labels)
     */
    getWidth() {
      return this.pWidth || this.getBBox().w;
    }
    /******************************************************************/
    /**
     * @return {number}   The maximum height of a row
     */
    getEqualRowHeight() {
      const { H: H2, D } = this.getTableData();
      const HD = Array.from(H2.keys()).map((i) => H2[i] + D[i]);
      return Math.max.apply(Math, HD);
    }
    /**
     * @return {number[]}   The array of computed widths
     */
    getComputedWidths() {
      const W = this.getTableData().W;
      let CW = Array.from(W.keys()).map((i) => {
        return typeof this.cWidths[i] === "number" ? this.cWidths[i] : W[i];
      });
      if (this.node.attributes.get("equalcolumns")) {
        CW = Array(CW.length).fill(max(CW));
      }
      return CW;
    }
    /**
     * Determine the column widths that can be computed (and need to be set).
     * The resulting arrays will have numbers for fixed-size arrays,
     *   strings for percentage sizes that can't be determined now,
     *   and null for stretchy columns that will expand to fill the extra space.
     * Depending on the width specified for the table, different column
     *  values can be determined.
     *
     * @return {(string|number|null)[]}  The array of widths
     */
    getColumnWidths() {
      const width = this.node.attributes.get("width");
      if (this.node.attributes.get("equalcolumns")) {
        return this.getEqualColumns(width);
      }
      const swidths = this.getColumnAttributes("columnwidth", 0);
      if (width === "auto") {
        return this.getColumnWidthsAuto(swidths);
      }
      if (isPercent(width)) {
        return this.getColumnWidthsPercent(swidths);
      }
      return this.getColumnWidthsFixed(swidths, this.length2em(width));
    }
    /**
     * For tables with equal columns, get the proper amount per column.
     *
     * @param {string} width   The width attribute of the table
     * @return {(string|number|null)[]}  The array of widths
     */
    getEqualColumns(width) {
      const n = Math.max(1, this.numCols);
      let cwidth;
      if (width === "auto") {
        const { W } = this.getTableData();
        cwidth = max(W);
      } else if (isPercent(width)) {
        cwidth = this.percent(1 / n);
      } else {
        const w = sum([].concat(this.cLines, this.cSpace)) + 2 * this.fSpace[0];
        cwidth = Math.max(0, this.length2em(width) - w) / n;
      }
      return Array(this.numCols).fill(cwidth);
    }
    /**
     * For tables with width="auto", auto and fit columns
     * will end up being natural width, so don't need to
     * set those explicitly.
     *
     * @param {string[]} swidths   The split and padded columnwidths attribute
     * @return {ColumnWidths}  The array of widths
     */
    getColumnWidthsAuto(swidths) {
      return swidths.map((x) => {
        if (x === "auto" || x === "fit") return null;
        if (isPercent(x)) return x;
        return this.length2em(x);
      });
    }
    /**
     * For tables with percentage widths, the 'fit' columns (or 'auto'
     * columns if there are not 'fit' ones) will stretch automatically,
     * but for 'auto' columns (when there are 'fit' ones), set the size
     * to the natural size of the column.
     *
     * @param {string[]} swidths   The split and padded columnwidths attribute
     * @return {ColumnWidths}      The array of widths
     */
    getColumnWidthsPercent(swidths) {
      const hasFit = swidths.indexOf("fit") >= 0;
      const { W } = hasFit ? this.getTableData() : { W: null };
      return Array.from(swidths.keys()).map((i) => {
        const x = swidths[i];
        if (x === "fit") return null;
        if (x === "auto") return hasFit ? W[i] : null;
        if (isPercent(x)) return x;
        return this.length2em(x);
      });
    }
    /**
     * For fixed-width tables, compute the column widths of all columns.
     *
     * @param {string[]} swidths   The split and padded columnwidths attribute
     * @param {number} width       The width of the table
     * @return {ColumnWidths}      The array of widths
     */
    getColumnWidthsFixed(swidths, width) {
      const indices = Array.from(swidths.keys());
      const fit = indices.filter((i) => swidths[i] === "fit");
      const auto = indices.filter((i) => swidths[i] === "auto");
      const n = fit.length || auto.length;
      const { W } = n ? this.getTableData() : { W: null };
      const cwidth = width - sum([].concat(this.cLines, this.cSpace)) - 2 * this.fSpace[0];
      let dw = cwidth;
      indices.forEach((i) => {
        const x = swidths[i];
        dw -= x === "fit" || x === "auto" ? W[i] : this.length2em(x, cwidth);
      });
      const fw = n && dw > 0 ? dw / n : 0;
      return indices.map((i) => {
        const x = swidths[i];
        if (x === "fit") return W[i] + fw;
        if (x === "auto") return W[i] + (fit.length === 0 ? fw : 0);
        return this.length2em(x, cwidth);
      });
    }
    /**
     * @param {number} i      The row number (starting at 0)
     * @param {string} align  The alignment on that row
     * @return {number}       The offest of the alignment position from the top of the table
     */
    getVerticalPosition(i, align) {
      const equal = this.node.attributes.get("equalrows");
      const { H: H2, D } = this.getTableData();
      const HD = equal ? this.getEqualRowHeight() : 0;
      const space = this.getRowHalfSpacing();
      let y = this.fLine;
      for (let j = 0; j < i; j++) {
        y += space[j] + (equal ? HD : H2[j] + D[j]) + space[j + 1] + this.rLines[j];
      }
      const [h, d] = equal ? [(HD + H2[i] - D[i]) / 2, (HD - H2[i] + D[i]) / 2] : [H2[i], D[i]];
      const offset = {
        top: 0,
        center: space[i] + (h + d) / 2,
        bottom: space[i] + h + d + space[i + 1],
        baseline: space[i] + h,
        axis: space[i] + h - 0.25
      };
      y += offset[align] || 0;
      return y;
    }
    /******************************************************************/
    /**
     * @param {number} fspace   The frame spacing to use
     * @param {number[]} space  The array of spacing values to convert to strings
     * @param {number} scale    A scaling factor to use for the sizes
     * @return {string[]}       The half-spacing as stings with units of "em"
     *                           with frame spacing at the beginning and end
     */
    getEmHalfSpacing(fspace, space, scale = 1) {
      const fspaceEm = this.em(fspace * scale);
      const spaceEm = this.addEm(space, 2 / scale);
      spaceEm.unshift(fspaceEm);
      spaceEm.push(fspaceEm);
      return spaceEm;
    }
    /**
     * @return {number[]}   The half-spacing for rows with frame spacing at the ends
     */
    getRowHalfSpacing() {
      const space = this.rSpace.map((x) => x / 2);
      space.unshift(this.fSpace[1]);
      space.push(this.fSpace[1]);
      return space;
    }
    /**
     * @return {number[]}   The half-spacing for columns with frame spacing at the ends
     */
    getColumnHalfSpacing() {
      const space = this.cSpace.map((x) => x / 2);
      space.unshift(this.fSpace[0]);
      space.push(this.fSpace[0]);
      return space;
    }
    /**
     * @return {[string,number|null]}  The alignment and row number (based at 0) or null
     */
    getAlignmentRow() {
      const [align, row] = split(this.node.attributes.get("align"));
      if (row == null) return [align, null];
      let i = parseInt(row);
      if (i < 0) i += this.numRows + 1;
      return [align, i < 1 || i > this.numRows ? null : i - 1];
    }
    /**
     * @param {string} name           The name of the attribute to get as an array
     * @param {number=} i             Return this many fewer than numCols entries
     * @return {string[]}             The array of values in the given attribute, split at spaces,
     *                                 padded to the number of table columns (minus 1) by repeating the last entry
     */
    getColumnAttributes(name, i = 1) {
      const n = this.numCols - i;
      const columns = this.getAttributeArray(name);
      if (columns.length === 0) return null;
      while (columns.length < n) {
        columns.push(columns[columns.length - 1]);
      }
      if (columns.length > n) {
        columns.splice(n);
      }
      return columns;
    }
    /**
     * @param {string} name           The name of the attribute to get as an array
     * @param {number=} i             Return this many fewer than numRows entries
     * @return {string[]}             The array of values in the given attribute, split at spaces,
     *                                 padded to the number of table rows (minus 1) by repeating the last entry
     */
    getRowAttributes(name, i = 1) {
      const n = this.numRows - i;
      const rows = this.getAttributeArray(name);
      if (rows.length === 0) return null;
      while (rows.length < n) {
        rows.push(rows[rows.length - 1]);
      }
      if (rows.length > n) {
        rows.splice(n);
      }
      return rows;
    }
    /**
     * @param {string} name           The name of the attribute to get as an array
     * @return {string[]}             The array of values in the given attribute, split at spaces
     *                                 (after leading and trailing spaces are removed, and multiple
     *                                  spaces have been collapsed to one).
     */
    getAttributeArray(name) {
      const value = this.node.attributes.get(name);
      if (!value) return [this.node.attributes.getDefault(name)];
      return split(value);
    }
    /**
     * Adds "em" to a list of dimensions, after dividing by n (defaults to 1).
     *
     * @param {string[]} list   The array of dimensions (in em's)
     * @param {nunber=} n       The number to divide each dimension by after converted
     * @return {string[]}       The array of values with "em" added
     */
    addEm(list, n = 1) {
      if (!list) return null;
      return list.map((x) => this.em(x / n));
    }
    /**
     * Converts an array of dimensions (with arbitrary units) to an array of numbers
     *   representing the dimensions in units of em's.
     *
     * @param {string[]} list   The array of dimensions to be turned into em's
     * @return {number[]}       The array of values converted to em's
     */
    convertLengths(list) {
      if (!list) return null;
      return list.map((x) => this.length2em(x));
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/mtable.ts
var CLASSPREFIX = "mjx-";
var SVGmtable = class extends CommonMtableMixin(SVGWrapper) {
  static {
    /**
     * The mtable wrapper
     */
    this.kind = MmlMtable.prototype.kind;
  }
  static {
    /**
     * @override
     */
    this.styles = {
      'g[data-mml-node="mtable"] > line[data-line], svg[data-table] > g > line[data-line]': {
        "stroke-width": "70px",
        fill: "none"
      },
      'g[data-mml-node="mtable"] > rect[data-frame], svg[data-table] > g > rect[data-frame]': {
        "stroke-width": "70px",
        fill: "none"
      },
      'g[data-mml-node="mtable"] > .mjx-dashed, svg[data-table] > g > .mjx-dashed': {
        "stroke-dasharray": "140"
      },
      'g[data-mml-node="mtable"] > .mjx-dotted, svg[data-table] > g > .mjx-dotted': {
        "stroke-linecap": "round",
        "stroke-dasharray": "0,140"
      },
      'g[data-mml-node="mtable"] > g > svg': {
        overflow: "visible"
      }
    };
  }
  /******************************************************************/
  /**
   * @override
   */
  constructor(factory, node, parent = null) {
    super(factory, node, parent);
    const def = { "data-labels": true };
    if (this.isTop) {
      def.transform = "matrix(1 0 0 -1 0 0)";
    }
    this.labels = this.svg("g", def);
  }
  /**
   * @override
   */
  toSVG(parent) {
    const svg = this.standardSVGnode(parent);
    this.placeRows(svg);
    this.handleColumnLines(svg);
    this.handleRowLines(svg);
    this.handleFrame(svg);
    const dx = this.handlePWidth(svg);
    this.handleLabels(svg, parent, dx);
  }
  /**
   * @param {N} svg  The container in which to place the rows
   */
  placeRows(svg) {
    const equal = this.node.attributes.get("equalrows");
    const { H: H2, D } = this.getTableData();
    const HD = this.getEqualRowHeight();
    const rSpace = this.getRowHalfSpacing();
    const rLines = [this.fLine, ...this.rLines, this.fLine];
    let y = this.getBBox().h - rLines[0];
    for (let i = 0; i < this.numRows; i++) {
      const row = this.childNodes[i];
      [row.H, row.D] = this.getRowHD(equal, HD, H2[i], D[i]);
      [row.tSpace, row.bSpace] = [rSpace[i], rSpace[i + 1]];
      [row.tLine, row.bLine] = [rLines[i], rLines[i + 1]];
      row.toSVG(svg);
      row.place(0, y - rSpace[i] - row.H);
      y -= rSpace[i] + row.H + row.D + rSpace[i + 1] + rLines[i + 1];
    }
  }
  /**
   * @param {boolean} equal   True for equal-height rows
   * @param {number} HD       The height of equal-height rows
   * @param {number} H        The natural height of the row
   * @param {number} D        The natural depth of the row
   * @returns {number[]}      The (possibly scaled) height and depth to use
   */
  getRowHD(equal, HD, H2, D) {
    return equal ? [(HD + H2 - D) / 2, (HD - H2 + D) / 2] : [H2, D];
  }
  /******************************************************************/
  /**
   * @override
   */
  handleColor() {
    super.handleColor();
    const rect = this.firstChild();
    if (rect) {
      this.adaptor.setAttribute(rect, "width", this.fixed(this.getWidth()));
    }
  }
  /**
   * Add vertical lines between columns
   *
   * @param {N} svg   The container for the table
   */
  handleColumnLines(svg) {
    if (this.node.attributes.get("columnlines") === "none") return;
    const lines = this.getColumnAttributes("columnlines");
    if (!lines) return;
    const cSpace = this.getColumnHalfSpacing();
    const cLines = this.cLines;
    const cWidth = this.getComputedWidths();
    let x = this.fLine;
    for (let i = 0; i < lines.length; i++) {
      x += cSpace[i] + cWidth[i] + cSpace[i + 1];
      if (lines[i] !== "none") {
        this.adaptor.append(svg, this.makeVLine(x, lines[i], cLines[i]));
      }
      x += cLines[i];
    }
  }
  /**
   * Add horizontal lines between rows
   *
   * @param {N} svg   The container for the table
   */
  handleRowLines(svg) {
    if (this.node.attributes.get("rowlines") === "none") return;
    const lines = this.getRowAttributes("rowlines");
    if (!lines) return;
    const equal = this.node.attributes.get("equalrows");
    const { H: H2, D } = this.getTableData();
    const HD = this.getEqualRowHeight();
    const rSpace = this.getRowHalfSpacing();
    const rLines = this.rLines;
    let y = this.getBBox().h - this.fLine;
    for (let i = 0; i < lines.length; i++) {
      const [rH, rD] = this.getRowHD(equal, HD, H2[i], D[i]);
      y -= rSpace[i] + rH + rD + rSpace[i + 1];
      if (lines[i] !== "none") {
        this.adaptor.append(svg, this.makeHLine(y, lines[i], rLines[i]));
      }
      y -= rLines[i];
    }
  }
  /**
   * Add a frame to the mtable, if needed
   *
   * @param {N} svg   The container for the table
   */
  handleFrame(svg) {
    if (this.frame && this.fLine) {
      const { h, d, w } = this.getBBox();
      const style = this.node.attributes.get("frame");
      this.adaptor.append(svg, this.makeFrame(w, h, d, style));
    }
  }
  /**
   * @returns {number}   The x-adjustement needed to handle the true size of percentage-width tables
   */
  handlePWidth(svg) {
    if (!this.pWidth) {
      return 0;
    }
    const { w, L, R } = this.getBBox();
    const W = L + this.pWidth + R;
    const align = this.getAlignShift()[0];
    const CW = Math.max(this.isTop ? W : 0, this.container.getWrapWidth(this.containerI)) - L - R;
    const dw = w - (this.pWidth > CW ? CW : this.pWidth);
    const dx = align === "left" ? 0 : align === "right" ? dw : dw / 2;
    if (dx) {
      const table = this.svg("g", {}, this.adaptor.childNodes(svg));
      this.place(dx, 0, table);
      this.adaptor.append(svg, table);
    }
    return dx;
  }
  /******************************************************************/
  /**
   * @param {string} style   The line style whose class is to be obtained
   * @returns {string}       The class name for the style
   */
  lineClass(style) {
    return CLASSPREFIX + style;
  }
  /**
   * @param {number} w       The width of the frame
   * @param {number} h       The height of the frame
   * @param {number} d       The depth of the frame
   * @param {string} style   The border style for the frame
   * @returns {N}            The SVG element for the frame
   */
  makeFrame(w, h, d, style) {
    const t = this.fLine;
    return this.svg("rect", this.setLineThickness(t, style, {
      "data-frame": true,
      "class": this.lineClass(style),
      width: this.fixed(w - t),
      height: this.fixed(h + d - t),
      x: this.fixed(t / 2),
      y: this.fixed(t / 2 - d)
    }));
  }
  /**
   * @param {number} x       The x location of the line
   * @param {string} style   The border style for the line
   * @param {number} t       The line thickness
   * @returns {N}            The SVG element for the line
   */
  makeVLine(x, style, t) {
    const { h, d } = this.getBBox();
    const dt = style === "dotted" ? t / 2 : 0;
    const X = this.fixed(x + t / 2);
    return this.svg("line", this.setLineThickness(t, style, {
      "data-line": "v",
      "class": this.lineClass(style),
      x1: X,
      y1: this.fixed(dt - d),
      x2: X,
      y2: this.fixed(h - dt)
    }));
  }
  /**
   * @param {number} y       The y location of the line
   * @param {string} style   The border style for the line
   * @param {number} t       The line thickness
   * @returns {N}            The SVG element for the line
   */
  makeHLine(y, style, t) {
    const w = this.getBBox().w;
    const dt = style === "dotted" ? t / 2 : 0;
    const Y = this.fixed(y - t / 2);
    return this.svg("line", this.setLineThickness(t, style, {
      "data-line": "h",
      "class": this.lineClass(style),
      x1: this.fixed(dt),
      y1: Y,
      x2: this.fixed(w - dt),
      y2: Y
    }));
  }
  /**
   * @param {number} t                The thickness of the line
   * @param {string} style            The border style for the line
   * @param {OptionList} properties   The list of properties to modify
   * @param {OptionList}              The modified properties
   */
  setLineThickness(t, style, properties) {
    if (t !== 0.07) {
      properties["stroke-thickness"] = this.fixed(t);
      if (style !== "solid") {
        properties["stroke-dasharray"] = (style === "dotted" ? "0," : "") + this.fixed(2 * t);
      }
    }
    return properties;
  }
  /******************************************************************/
  /**
   * Handle addition of labels to the table
   *
   * @param {N} svg       The container for the table contents
   * @param {N} parent    The parent containing the the table
   * @param {number} dx   The adjustement for percentage width tables
   */
  handleLabels(svg, _parent, dx) {
    if (!this.hasLabels) return;
    const labels = this.labels;
    const attributes = this.node.attributes;
    const side = attributes.get("side");
    this.spaceLabels();
    this.isTop ? this.topTable(svg, labels, side) : this.subTable(svg, labels, side, dx);
  }
  /**
   * Add spacing elements between the label rows to align them with the rest of the table
   */
  spaceLabels() {
    const adaptor2 = this.adaptor;
    const h = this.getBBox().h;
    const L = this.getTableData().L;
    const space = this.getRowHalfSpacing();
    let y = h - this.fLine;
    let current = adaptor2.firstChild(this.labels);
    for (let i = 0; i < this.numRows; i++) {
      const row = this.childNodes[i];
      if (row.node.isKind("mlabeledtr")) {
        const cell = row.childNodes[0];
        y -= space[i] + row.H;
        row.placeCell(cell, { x: 0, y, w: L, lSpace: 0, rSpace: 0, lLine: 0, rLine: 0 });
        y -= row.D + space[i + 1] + this.rLines[i];
        current = adaptor2.next(current);
      } else {
        y -= space[i] + row.H + row.D + space[i + 1] + this.rLines[i];
      }
    }
  }
  /**
   * Handles tables with labels so that the label will move with the size of the container
   *
   * @param {N} svg         The SVG container for the table
   * @param {N} labels      The group of labels
   * @param {string} side   The side alignment (left or right)
   */
  topTable(svg, labels, side) {
    const adaptor2 = this.adaptor;
    const { h, d, w, L, R } = this.getBBox();
    const W = L + (this.pWidth || w) + R;
    const LW = this.getTableData().L;
    const [, align, shift] = this.getPadAlignShift(side);
    const dx = shift + (align === "right" ? -W : align === "center" ? -W / 2 : 0) + L;
    const matrix = "matrix(1 0 0 -1 0 0)";
    const scale = `scale(${this.jax.fixed(this.font.params.x_height * 1e3 / this.metrics.ex, 2)})`;
    const transform = `translate(0 ${this.fixed(h)}) ${matrix} ${scale}`;
    let table = this.svg("svg", {
      "data-table": true,
      preserveAspectRatio: align === "left" ? "xMinYMid" : align === "right" ? "xMaxYMid" : "xMidYMid",
      viewBox: [this.fixed(-dx), this.fixed(-h), 1, this.fixed(h + d)].join(" ")
    }, [
      this.svg("g", { transform: matrix }, adaptor2.childNodes(svg))
    ]);
    labels = this.svg("svg", {
      "data-labels": true,
      preserveAspectRatio: side === "left" ? "xMinYMid" : "xMaxYMid",
      viewBox: [side === "left" ? 0 : this.fixed(LW), this.fixed(-h), 1, this.fixed(h + d)].join(" ")
    }, [labels]);
    adaptor2.append(svg, this.svg("g", { transform }, [table, labels]));
    this.place(-L, 0, svg);
  }
  /**
   * @param {N} svg         The SVG container for the table
   * @param {N} labels      The group of labels
   * @param {string} side   The side alignment (left or right)
   * @param {number} dx     The adjustement for percentage width tables
   */
  subTable(svg, labels, side, dx) {
    const adaptor2 = this.adaptor;
    const { w, L, R } = this.getBBox();
    const W = L + (this.pWidth || w) + R;
    const labelW = this.getTableData().L;
    const align = this.getAlignShift()[0];
    const CW = Math.max(W, this.container.getWrapWidth(this.containerI));
    this.place(
      side === "left" ? (align === "left" ? 0 : align === "right" ? W - CW + dx : (W - CW) / 2 + dx) - L : (align === "left" ? CW : align === "right" ? W + dx : (CW + W) / 2 + dx) - L - labelW,
      0,
      labels
    );
    adaptor2.append(svg, labels);
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/mtr.ts
function CommonMtrMixin(Base) {
  return class extends Base {
    /**
     * @override
     */
    get fixesPWidth() {
      return false;
    }
    /**
     * @return {number}   The number of mtd's in the mtr
     */
    get numCells() {
      return this.childNodes.length;
    }
    /**
     * @return {boolean}   True if this is a labeled row
     */
    get labeled() {
      return false;
    }
    /**
     * @return {C[]}  The child nodes that are part of the table (no label node)
     */
    get tableCells() {
      return this.childNodes;
    }
    /**
     * @param {number} i   The index of the child to get (skipping labels)
     * @return {C}         The ith child node wrapper
     */
    getChild(i) {
      return this.childNodes[i];
    }
    /**
     * @return {BBox[]}  An array of the bounding boxes for the mtd's in the row
     */
    getChildBBoxes() {
      return this.childNodes.map((cell) => cell.getBBox());
    }
    /**
     * Handle vertical stretching of cells to match height of
     *  other cells in the row.
     *
     * @param {number[]} HD   The total height and depth for the row [H, D]
     *
     * If this isn't specified, the maximum height and depth is computed.
     */
    stretchChildren(HD = null) {
      let stretchy = [];
      let children = this.labeled ? this.childNodes.slice(1) : this.childNodes;
      for (const mtd of children) {
        const child = mtd.childNodes[0];
        if (child.canStretch(1 /* Vertical */)) {
          stretchy.push(child);
        }
      }
      let count = stretchy.length;
      let nodeCount = this.childNodes.length;
      if (count && nodeCount > 1) {
        if (HD === null) {
          let H2 = 0, D = 0;
          let all = count > 1 && count === nodeCount;
          for (const mtd of children) {
            const child = mtd.childNodes[0];
            const noStretch = child.stretch.dir === 0 /* None */;
            if (all || noStretch) {
              const { h, d } = child.getBBox(noStretch);
              if (h > H2) {
                H2 = h;
              }
              if (d > D) {
                D = d;
              }
            }
          }
          HD = [H2, D];
        }
        for (const child of stretchy) {
          child.coreMO().getStretchedVariant(HD);
        }
      }
    }
  };
}
function CommonMlabeledtrMixin(Base) {
  return class extends Base {
    /**
     * @override
     */
    get numCells() {
      return Math.max(0, this.childNodes.length - 1);
    }
    /**
     * @override
     */
    get labeled() {
      return true;
    }
    /**
     * @override
     */
    get tableCells() {
      return this.childNodes.slice(1);
    }
    /**
     * @override
     */
    getChild(i) {
      return this.childNodes[i + 1];
    }
    /**
     * @override
     */
    getChildBBoxes() {
      return this.childNodes.slice(1).map((cell) => cell.getBBox());
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/mtr.ts
var SVGmtr = class extends CommonMtrMixin(SVGWrapper) {
  static {
    /**
     * The mtr wrapper
     */
    this.kind = MmlMtr.prototype.kind;
  }
  /**
   * @override
   */
  toSVG(parent) {
    const svg = this.standardSVGnode(parent);
    this.placeCells(svg);
    this.placeColor();
  }
  /**
   * Set the location of the cell contents in the row and expand the cell background colors
   *
   * @param {N} svg   The container for the table
   */
  placeCells(svg) {
    const cSpace = this.parent.getColumnHalfSpacing();
    const cLines = [this.parent.fLine, ...this.parent.cLines, this.parent.fLine];
    const cWidth = this.parent.getComputedWidths();
    const scale = 1 / this.getBBox().rscale;
    let x = cLines[0];
    for (let i = 0; i < this.numCells; i++) {
      const child = this.getChild(i);
      child.toSVG(svg);
      x += this.placeCell(child, {
        x,
        y: 0,
        lSpace: cSpace[i] * scale,
        rSpace: cSpace[i + 1] * scale,
        w: cWidth[i] * scale,
        lLine: cLines[i] * scale,
        rLine: cLines[i + 1] * scale
      });
    }
  }
  /**
   * @param {SVGmtd} cell      The cell to place
   * @param {SizeData} sizes   The positioning information
   * @return {number}          The new x position
   */
  placeCell(cell, sizes) {
    const { x, y, lSpace, w, rSpace, lLine, rLine } = sizes;
    const scale = 1 / this.getBBox().rscale;
    const [h, d] = [this.H * scale, this.D * scale];
    const [t, b] = [this.tSpace * scale, this.bSpace * scale];
    const [dx, dy] = cell.placeCell(x + lSpace, y, w, h, d);
    const W = lSpace + w + rSpace;
    cell.placeColor(-(dx + lSpace + lLine / 2), -(d + b + dy), W + (lLine + rLine) / 2, h + d + t + b);
    return W + rLine;
  }
  /**
   * Expand the backgound color to fill the entire row
   */
  placeColor() {
    const scale = 1 / this.getBBox().rscale;
    const adaptor2 = this.adaptor;
    const child = this.firstChild();
    if (child && adaptor2.kind(child) === "rect" && adaptor2.getAttribute(child, "data-bgcolor")) {
      const [TL, BL] = [this.tLine / 2 * scale, this.bLine / 2 * scale];
      const [TS, BS] = [this.tSpace * scale, this.bSpace * scale];
      const [H2, D] = [this.H * scale, this.D * scale];
      adaptor2.setAttribute(child, "y", this.fixed(-(D + BS + BL)));
      adaptor2.setAttribute(child, "width", this.fixed(this.parent.getWidth() * scale));
      adaptor2.setAttribute(child, "height", this.fixed(TL + TS + H2 + D + BS + BL));
    }
  }
};
var SVGmlabeledtr = class extends CommonMlabeledtrMixin(SVGmtr) {
  static {
    /**
     * The mlabeledtr wrapper
     */
    this.kind = MmlMlabeledtr.prototype.kind;
  }
  /**
   * @override
   */
  toSVG(parent) {
    super.toSVG(parent);
    const child = this.childNodes[0];
    if (child) {
      child.toSVG(this.parent.labels);
    }
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/mtd.ts
function CommonMtdMixin(Base) {
  return class extends Base {
    /**
     * @override
     */
    get fixesPWidth() {
      return false;
    }
    /**
     * @override
     */
    invalidateBBox() {
      this.bboxComputed = false;
    }
    /**
     * @override
     */
    getWrapWidth(_j) {
      const table = this.parent.parent;
      const row = this.parent;
      const i = this.node.childPosition() - (row.labeled ? 1 : 0);
      return typeof table.cWidths[i] === "number" ? table.cWidths[i] : table.getTableData().W[i];
    }
    /**
     * @override
     */
    getChildAlign(_i) {
      return this.node.attributes.get("columnalign");
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/mtd.ts
var SVGmtd = class extends CommonMtdMixin(SVGWrapper) {
  static {
    /**
     * The mtd wrapper
     */
    this.kind = MmlMtd.prototype.kind;
  }
  /**
   * @param {number} x    The x offset of the left side of the cell
   * @param {number} y    The y offset of the baseline of the cell
   * @param {number} W    The width of the cell
   * @param {number} H    The height of the cell
   * @param {number} D    The depth of the cell
   * @return {[number, number]}   The x and y offsets used
   */
  placeCell(x, y, W, H2, D) {
    const bbox = this.getBBox();
    const h = Math.max(bbox.h, 0.75);
    const d = Math.max(bbox.d, 0.25);
    const calign = this.node.attributes.get("columnalign");
    const ralign = this.node.attributes.get("rowalign");
    const alignX = this.getAlignX(W, bbox, calign);
    const alignY = this.getAlignY(H2, D, h, d, ralign);
    this.place(x + alignX, y + alignY);
    return [alignX, alignY];
  }
  /**
   * @param {number} x    The x offset of the left side of the cell
   * @param {number} y    The y position of the bottom of the cell
   * @param {number} W    The width of the cell
   * @param {number} H    The height + depth of the cell
   */
  placeColor(x, y, W, H2) {
    const adaptor2 = this.adaptor;
    const child = this.firstChild();
    if (child && adaptor2.kind(child) === "rect" && adaptor2.getAttribute(child, "data-bgcolor")) {
      adaptor2.setAttribute(child, "x", this.fixed(x));
      adaptor2.setAttribute(child, "y", this.fixed(y));
      adaptor2.setAttribute(child, "width", this.fixed(W));
      adaptor2.setAttribute(child, "height", this.fixed(H2));
    }
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/maction.ts
var TooltipData = {
  dx: ".2em",
  // x-offset of tooltip from right side of maction bbox
  dy: ".1em",
  // y-offset of tooltip from bottom of maction bbox
  postDelay: 600,
  // milliseconds before tooltip posts
  clearDelay: 100,
  // milliseconds before tooltip is removed
  hoverTimer: /* @__PURE__ */ new Map(),
  // timers for posting tooltips
  clearTimer: /* @__PURE__ */ new Map(),
  // timers for removing tooltips
  /*
   * clear the timers if any are active
   */
  stopTimers: (node, data) => {
    if (data.clearTimer.has(node)) {
      clearTimeout(data.clearTimer.get(node));
      data.clearTimer.delete(node);
    }
    if (data.hoverTimer.has(node)) {
      clearTimeout(data.hoverTimer.get(node));
      data.hoverTimer.delete(node);
    }
  }
};
function CommonMactionMixin(Base) {
  return class extends Base {
    /**
     * @return {W}  The selected child wrapper
     */
    get selected() {
      const selection = this.node.attributes.get("selection");
      const i = Math.max(1, Math.min(this.childNodes.length, selection)) - 1;
      return this.childNodes[i] || this.wrap(this.node.selected);
    }
    /*************************************************************/
    /**
     * @override
     */
    constructor(...args) {
      super(...args);
      const actions = this.constructor.actions;
      const action = this.node.attributes.get("actiontype");
      const [handler, data] = actions.get(action) || [(_node, _data) => {
      }, {}];
      this.action = handler;
      this.data = data;
      this.getParameters();
    }
    /**
     * Look up attribute parameters
     */
    getParameters() {
      const offsets = this.node.attributes.get("data-offsets");
      let [dx, dy] = split(offsets || "");
      this.dx = this.length2em(dx || TooltipData.dx);
      this.dy = this.length2em(dy || TooltipData.dy);
    }
    /**
     * @override
     */
    computeBBox(bbox, recompute = false) {
      bbox.updateFrom(this.selected.getOuterBBox());
      this.selected.setChildPWidths(recompute);
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/maction.ts
var SVGmaction = class extends CommonMactionMixin(SVGWrapper) {
  static {
    /**
     * The maction wrapper
     */
    this.kind = MmlMaction.prototype.kind;
  }
  static {
    /**
     * @override
     */
    this.styles = {
      '[jax="SVG"] mjx-tool': {
        display: "inline-block",
        position: "relative",
        width: 0,
        height: 0
      },
      '[jax="SVG"] mjx-tool > mjx-tip': {
        position: "absolute",
        top: 0,
        left: 0
      },
      "mjx-tool > mjx-tip": {
        display: "inline-block",
        padding: ".2em",
        border: "1px solid #888",
        "font-size": "70%",
        "background-color": "#F8F8F8",
        color: "black",
        "box-shadow": "2px 2px 5px #AAAAAA"
      },
      'g[data-mml-node="maction"][data-toggle]': {
        cursor: "pointer"
      },
      "mjx-status": {
        display: "block",
        position: "fixed",
        left: "1em",
        bottom: "1em",
        "min-width": "25%",
        padding: ".2em .4em",
        border: "1px solid #888",
        "font-size": "90%",
        "background-color": "#F8F8F8",
        color: "black"
      }
    };
  }
  static {
    /**
     * The valid action types and their handlers
     */
    this.actions = /* @__PURE__ */ new Map([
      ["toggle", [(node, _data) => {
        node.adaptor.setAttribute(node.element, "data-toggle", node.node.attributes.get("selection"));
        const math = node.factory.jax.math;
        const document2 = node.factory.jax.document;
        const mml = node.node;
        node.setEventHandler("click", (event) => {
          if (!math.end.node) {
            math.start.node = math.end.node = math.typesetRoot;
            math.start.n = math.end.n = 0;
          }
          mml.nextToggleSelection();
          math.rerender(document2);
          event.stopPropagation();
        });
      }, {}]],
      ["tooltip", [(node, data) => {
        const tip = node.childNodes[1];
        if (!tip) return;
        const rect = node.firstChild();
        if (tip.node.isKind("mtext")) {
          const text = tip.node.getText();
          node.adaptor.insert(node.svg("title", {}, [node.text(text)]), rect);
        } else {
          const adaptor2 = node.adaptor;
          const container = node.jax.container;
          const math = node.node.factory.create("math", {}, [node.childNodes[1].node]);
          const tool = node.html("mjx-tool", {}, [node.html("mjx-tip")]);
          const hidden = adaptor2.append(rect, node.svg("foreignObject", { style: { display: "none" } }, [tool]));
          node.jax.processMath(math, adaptor2.firstChild(tool));
          node.childNodes[1].node.parent = node.node;
          node.setEventHandler("mouseover", (event) => {
            data.stopTimers(node, data);
            data.hoverTimer.set(node, setTimeout(() => {
              adaptor2.setStyle(tool, "left", "0");
              adaptor2.setStyle(tool, "top", "0");
              adaptor2.append(container, tool);
              const tbox = adaptor2.nodeBBox(tool);
              const nbox = adaptor2.nodeBBox(node.element);
              const dx = (nbox.right - tbox.left) / node.metrics.em + node.dx;
              const dy = (nbox.bottom - tbox.bottom) / node.metrics.em + node.dy;
              adaptor2.setStyle(tool, "left", node.px(dx));
              adaptor2.setStyle(tool, "top", node.px(dy));
            }, data.postDelay));
            event.stopPropagation();
          });
          node.setEventHandler("mouseout", (event) => {
            data.stopTimers(node, data);
            const timer = setTimeout(() => adaptor2.append(hidden, tool), data.clearDelay);
            data.clearTimer.set(node, timer);
            event.stopPropagation();
          });
        }
      }, TooltipData]],
      ["statusline", [(node, data) => {
        const tip = node.childNodes[1];
        if (!tip) return;
        if (tip.node.isKind("mtext")) {
          const adaptor2 = node.adaptor;
          const text = tip.node.getText();
          adaptor2.setAttribute(node.element, "data-statusline", text);
          node.setEventHandler("mouseover", (event) => {
            if (data.status === null) {
              const body = adaptor2.body(adaptor2.document);
              data.status = adaptor2.append(body, node.html("mjx-status", {}, [node.text(text)]));
            }
            event.stopPropagation();
          });
          node.setEventHandler("mouseout", (event) => {
            if (data.status) {
              adaptor2.remove(data.status);
              data.status = null;
            }
            event.stopPropagation();
          });
        }
      }, {
        status: null
        // cached status line
      }]]
    ]);
  }
  /*************************************************************/
  /**
   * @override
   */
  toSVG(parent) {
    const svg = this.standardSVGnode(parent);
    const child = this.selected;
    const { h, d, w } = child.getOuterBBox();
    this.adaptor.append(this.element, this.svg("rect", {
      width: this.fixed(w),
      height: this.fixed(h + d),
      y: this.fixed(-d),
      fill: "none",
      "pointer-events": "all"
    }));
    child.toSVG(svg);
    const bbox = child.getOuterBBox();
    if (child.element) {
      child.place(bbox.L * bbox.rscale, 0);
    }
    this.action(this, this.data);
  }
  /**
   * Add an event handler to the output for this maction
   */
  setEventHandler(type, handler) {
    this.element.addEventListener(type, handler);
  }
};

// node_modules/mathjax-full/ts/output/common/Notation.ts
var ARROWX = 4;
var ARROWDX = 1;
var ARROWY = 2;
var THICKNESS = 0.067;
var PADDING = 0.2;
var SOLID = THICKNESS + "em solid";
var sideIndex = { top: 0, right: 1, bottom: 2, left: 3 };
var sideNames = Object.keys(sideIndex);
var fullBBox = (node) => new Array(4).fill(node.thickness + node.padding);
var fullBorder = (node) => new Array(4).fill(node.thickness);
var arrowHead = (node) => {
  return Math.max(node.padding, node.thickness * (node.arrowhead.x + node.arrowhead.dx + 1));
};
var arrowBBoxHD = (node, TRBL2) => {
  if (node.childNodes[0]) {
    const { h, d } = node.childNodes[0].getBBox();
    TRBL2[0] = TRBL2[2] = Math.max(0, node.thickness * node.arrowhead.y - (h + d) / 2);
  }
  return TRBL2;
};
var arrowBBoxW = (node, TRBL2) => {
  if (node.childNodes[0]) {
    const { w } = node.childNodes[0].getBBox();
    TRBL2[1] = TRBL2[3] = Math.max(0, node.thickness * node.arrowhead.y - w / 2);
  }
  return TRBL2;
};
var arrowDef = {
  up: [-Math.PI / 2, false, true, "verticalstrike"],
  down: [Math.PI / 2, false, true, "verticakstrike"],
  right: [0, false, false, "horizontalstrike"],
  left: [Math.PI, false, false, "horizontalstrike"],
  updown: [Math.PI / 2, true, true, "verticalstrike uparrow downarrow"],
  leftright: [0, true, false, "horizontalstrike leftarrow rightarrow"]
};
var diagonalArrowDef = {
  updiagonal: [-1, 0, false, "updiagonalstrike northeastarrow"],
  northeast: [-1, 0, false, "updiagonalstrike updiagonalarrow"],
  southeast: [1, 0, false, "downdiagonalstrike"],
  northwest: [1, Math.PI, false, "downdiagonalstrike"],
  southwest: [-1, Math.PI, false, "updiagonalstrike"],
  northeastsouthwest: [-1, 0, true, "updiagonalstrike northeastarrow updiagonalarrow southwestarrow"],
  northwestsoutheast: [1, 0, true, "downdiagonalstrike northwestarrow southeastarrow"]
};
var arrowBBox = {
  up: (node) => arrowBBoxW(node, [arrowHead(node), 0, node.padding, 0]),
  down: (node) => arrowBBoxW(node, [node.padding, 0, arrowHead(node), 0]),
  right: (node) => arrowBBoxHD(node, [0, arrowHead(node), 0, node.padding]),
  left: (node) => arrowBBoxHD(node, [0, node.padding, 0, arrowHead(node)]),
  updown: (node) => arrowBBoxW(node, [arrowHead(node), 0, arrowHead(node), 0]),
  leftright: (node) => arrowBBoxHD(node, [0, arrowHead(node), 0, arrowHead(node)])
};
var CommonBorder = function(render) {
  return (side) => {
    const i = sideIndex[side];
    return [side, {
      //
      // Add the border to the main child object
      //
      renderer: render,
      //
      // Indicate the extra space on the given side
      //
      bbox: (node) => {
        const bbox = [0, 0, 0, 0];
        bbox[i] = node.thickness + node.padding;
        return bbox;
      },
      //
      // Indicate the border on the given side
      //
      border: (node) => {
        const bbox = [0, 0, 0, 0];
        bbox[i] = node.thickness;
        return bbox;
      }
    }];
  };
};
var CommonBorder2 = function(render) {
  return (name, side1, side2) => {
    const i1 = sideIndex[side1];
    const i2 = sideIndex[side2];
    return [name, {
      //
      // Add the border along the given sides
      //
      renderer: render,
      //
      // Mark the extra space along the two sides
      //
      bbox: (node) => {
        const t = node.thickness + node.padding;
        const bbox = [0, 0, 0, 0];
        bbox[i1] = bbox[i2] = t;
        return bbox;
      },
      //
      // Indicate the border on the two sides
      //
      border: (node) => {
        const bbox = [0, 0, 0, 0];
        bbox[i1] = bbox[i2] = node.thickness;
        return bbox;
      },
      //
      // Remove the single side notations, if present
      //
      remove: side1 + " " + side2
    }];
  };
};
var CommonDiagonalStrike = function(render) {
  return (name) => {
    const cname = "mjx-" + name.charAt(0) + "strike";
    return [name + "diagonalstrike", {
      //
      // Find the angle and width from the bounding box size and create the diagonal line
      //
      renderer: render(cname),
      //
      //  Add padding all around
      //
      bbox: fullBBox
    }];
  };
};
var CommonDiagonalArrow = function(render) {
  return (name) => {
    const [c, pi, double, remove] = diagonalArrowDef[name];
    return [name + "arrow", {
      //
      // Find the angle and width from the bounding box size and create
      //   the arrow from them and the other arrow data
      //
      renderer: (node, _child) => {
        const [a, W] = node.arrowAW();
        const arrow = node.arrow(W, c * (a - pi), double);
        render(node, arrow);
      },
      //
      // Add space for the arrowhead all around
      //
      bbox: (node) => {
        const { a, x, y } = node.arrowData();
        const [ax, ay, adx] = [node.arrowhead.x, node.arrowhead.y, node.arrowhead.dx];
        const [b, ar] = node.getArgMod(ax + adx, ay);
        const dy = y + (b > a ? node.thickness * ar * Math.sin(b - a) : 0);
        const dx = x + (b > Math.PI / 2 - a ? node.thickness * ar * Math.sin(b + a - Math.PI / 2) : 0);
        return [dy, dx, dy, dx];
      },
      //
      // Remove redundant notations
      //
      remove
    }];
  };
};
var CommonArrow = function(render) {
  return (name) => {
    const [angle, double, isVertical, remove] = arrowDef[name];
    return [name + "arrow", {
      //
      // Get the arrow height and depth from the bounding box and the arrow direction
      //   then create the arrow from that and the other data
      //
      renderer: (node, _child) => {
        const { w, h, d } = node.getBBox();
        const [W, offset] = isVertical ? [h + d, "X"] : [w, "Y"];
        const dd = node.getOffset(offset);
        const arrow = node.arrow(W, angle, double, offset, dd);
        render(node, arrow);
      },
      //
      // Add the padding to the proper sides
      //
      bbox: arrowBBox[name],
      //
      // Remove redundant notations
      //
      remove
    }];
  };
};

// node_modules/mathjax-full/ts/output/common/Wrappers/menclose.ts
function CommonMencloseMixin(Base) {
  return class extends Base {
    /**
     * @override
     * @constructor
     */
    constructor(...args) {
      super(...args);
      /**
       *  The notations active on this menclose, if any
       */
      this.notations = {};
      /**
       *  The notation to use for the child, if any
       */
      this.renderChild = null;
      /**
       * fake msqrt for radial notation (if used)
       */
      this.msqrt = null;
      /**
       * The padding of the arrow head (may be overridden using data-padding attibute)
       */
      this.padding = PADDING;
      /**
       * The thickness of the arrow head (may be overridden using data-thickness attibute)
       */
      this.thickness = THICKNESS;
      /**
       * The shape of the arrow head (may be overridden using data-arrowhead attibutes)
       */
      this.arrowhead = { x: ARROWX, y: ARROWY, dx: ARROWDX };
      /**
       * The top, right, bottom, and left padding (added by notations)
       */
      this.TRBL = [0, 0, 0, 0];
      this.getParameters();
      this.getNotations();
      this.removeRedundantNotations();
      this.initializeNotations();
      this.TRBL = this.getBBoxExtenders();
    }
    /**
     * Look up the data-* attributes and override the default values
     */
    getParameters() {
      const attributes = this.node.attributes;
      const padding2 = attributes.get("data-padding");
      if (padding2 !== void 0) {
        this.padding = this.length2em(padding2, PADDING);
      }
      const thickness = attributes.get("data-thickness");
      if (thickness !== void 0) {
        this.thickness = this.length2em(thickness, THICKNESS);
      }
      const arrowhead = attributes.get("data-arrowhead");
      if (arrowhead !== void 0) {
        let [x, y, dx] = split(arrowhead);
        this.arrowhead = {
          x: x ? parseFloat(x) : ARROWX,
          y: y ? parseFloat(y) : ARROWY,
          dx: dx ? parseFloat(dx) : ARROWDX
        };
      }
    }
    /**
     *  Get the notations given in the notation attribute
     *    and check if any are used to render the child nodes
     */
    getNotations() {
      const Notations = this.constructor.notations;
      for (const name of split(this.node.attributes.get("notation"))) {
        const notation = Notations.get(name);
        if (notation) {
          this.notations[name] = notation;
          if (notation.renderChild) {
            this.renderChild = notation.renderer;
          }
        }
      }
    }
    /**
     *  Remove any redundant notations
     */
    removeRedundantNotations() {
      for (const name of Object.keys(this.notations)) {
        if (this.notations[name]) {
          const remove = this.notations[name].remove || "";
          for (const notation of remove.split(/ /)) {
            delete this.notations[notation];
          }
        }
      }
    }
    /**
     *  Run any initialization needed by notations in use
     */
    initializeNotations() {
      for (const name of Object.keys(this.notations)) {
        const init3 = this.notations[name].init;
        init3 && init3(this);
      }
    }
    /********************************************************/
    /**
     * @override
     */
    computeBBox(bbox, recompute = false) {
      let [T, R, B, L] = this.TRBL;
      const child = this.childNodes[0].getBBox();
      bbox.combine(child, L, 0);
      bbox.h += T;
      bbox.d += B;
      bbox.w += R;
      this.setChildPWidths(recompute);
    }
    /**
     * @return {Notation.PaddingData}  Array of the maximum extra space from the notations along each side
     */
    getBBoxExtenders() {
      let TRBL2 = [0, 0, 0, 0];
      for (const name of Object.keys(this.notations)) {
        this.maximizeEntries(TRBL2, this.notations[name].bbox(this));
      }
      return TRBL2;
    }
    /**
     * @return {Notation.PaddingData}  Array of padding (i.e., BBox minus border) along each side
     */
    getPadding() {
      let BTRBL = [0, 0, 0, 0];
      for (const name of Object.keys(this.notations)) {
        const border = this.notations[name].border;
        if (border) {
          this.maximizeEntries(BTRBL, border(this));
        }
      }
      return [0, 1, 2, 3].map((i) => this.TRBL[i] - BTRBL[i]);
    }
    /**
     * Each entry in X gets replaced by the corresponding one in Y if it is larger
     *
     * @param {Notation.PaddingData} X   An array of numbers
     * @param {Notation.PaddingData} Y   An array of numbers that replace smaller ones in X
     */
    maximizeEntries(X, Y) {
      for (let i = 0; i < X.length; i++) {
        if (X[i] < Y[i]) {
          X[i] = Y[i];
        }
      }
    }
    /********************************************************/
    /**
     * Get the offset amount for the given direction for vertical and horizontal centering
     *
     * @param {string} direction    The direction 'X' or 'Y' for the offset
     * @return {number}             The amount of offset in that direction
     */
    getOffset(direction) {
      let [T, R, B, L] = this.TRBL;
      const d = (direction === "X" ? R - L : B - T) / 2;
      return Math.abs(d) > 1e-3 ? d : 0;
    }
    /**
     * @param {number} w    The width of the box whose diagonal is needed
     * @param {number} h    The height of the box whose diagonal is needed
     * @return {number[]}   The angle and width of the diagonal of the box
     */
    getArgMod(w, h) {
      return [Math.atan2(h, w), Math.sqrt(w * w + h * h)];
    }
    /**
     * Create an arrow using an svg element
     *
     * @param {number} w        The length of the arrow
     * @param {number} a        The angle for the arrow
     * @param {boolean} double  True if this is a double-headed arrow
     * @param {string} offset   'X' for vertical arrow, 'Y' for horizontal
     * @param {number} dist     Distance to translate in the offset direction
     * @return {N}              The newly created arrow
     */
    arrow(_w, _a, _double, _offset = "", _dist = 0) {
      return null;
    }
    /**
     * Get the angle and width of a diagonal arrow, plus the x and y extension
     *   past the content bounding box
     *
     * @return {Object}  The angle, width, and x and y extentions
     */
    arrowData() {
      const [p, t] = [this.padding, this.thickness];
      const r = t * (this.arrowhead.x + Math.max(1, this.arrowhead.dx));
      const { h, d, w } = this.childNodes[0].getBBox();
      const H2 = h + d;
      const R = Math.sqrt(H2 * H2 + w * w);
      const x = Math.max(p, r * w / R);
      const y = Math.max(p, r * H2 / R);
      const [a, W] = this.getArgMod(w + 2 * x, H2 + 2 * y);
      return { a, W, x, y };
    }
    /**
     * Get the angle and width for a diagonal arrow
     *
     * @return {[number, number]}   The angle and width
     */
    arrowAW() {
      const { h, d, w } = this.childNodes[0].getBBox();
      const [T, R, B, L] = this.TRBL;
      return this.getArgMod(L + w + R, T + h + d + B);
    }
    /********************************************************/
    /**
     * Create an unattached msqrt wrapper to render the 'radical' notation.
     *   We replace the inferred mrow of the msqrt with the one from the menclose
     *   but without changing the parent pointer, so as not to detach it from
     *   the menclose (which would desrtoy the original MathML tree).
     *
     * @param {W} child   The inferred mrow that is the child of this menclose
     * @return {S}        The newly created (but detached) msqrt wrapper
     */
    createMsqrt(child) {
      const mmlFactory = this.node.factory;
      const mml = mmlFactory.create("msqrt");
      mml.inheritAttributesFrom(this.node);
      mml.childNodes[0] = child.node;
      const node = this.wrap(mml);
      node.parent = this;
      return node;
    }
    /**
     * @return {number[]}  The differences between the msqrt bounding box
     *                     and its child bounding box (i.e., the extra space
     *                     created by the radical symbol).
     */
    sqrtTRBL() {
      const bbox = this.msqrt.getBBox();
      const cbox = this.msqrt.childNodes[0].getBBox();
      return [bbox.h - cbox.h, 0, bbox.d - cbox.d, bbox.w - cbox.w];
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Notation.ts
var computeLineData = {
  top: (h, _d, w, t) => [0, h - t, w, h - t],
  right: (h, d, w, t) => [w - t, -d, w - t, h],
  bottom: (_h, d, w, t) => [0, t - d, w, t - d],
  left: (h, d, _w, t) => [t, -d, t, h],
  vertical: (h, d, w, _t) => [w / 2, h, w / 2, -d],
  horizontal: (h, d, w, _t) => [0, (h - d) / 2, w, (h - d) / 2],
  up: (h, d, w, t) => [t, t - d, w - t, h - t],
  down: (h, d, w, t) => [t, h - t, w - t, t - d]
};
var lineData = function(node, kind, offset = "") {
  const { h, d, w } = node.getBBox();
  const t = node.thickness / 2;
  return lineOffset(computeLineData[kind](h, d, w, t), node, offset);
};
var lineOffset = function(data, node, offset) {
  if (offset) {
    const d = node.getOffset(offset);
    if (d) {
      if (offset === "X") {
        data[0] -= d;
        data[2] -= d;
      } else {
        data[1] -= d;
        data[3] -= d;
      }
    }
  }
  return data;
};
var RenderLine = function(line, offset = "") {
  return (node, _child) => {
    const L = node.line(lineData(node, line, offset));
    node.adaptor.append(node.element, L);
  };
};
var Border = function(side) {
  return CommonBorder((node, _child) => {
    node.adaptor.append(node.element, node.line(lineData(node, side)));
  })(side);
};
var Border2 = function(name, side1, side2) {
  return CommonBorder2((node, _child) => {
    node.adaptor.append(node.element, node.line(lineData(node, side1)));
    node.adaptor.append(node.element, node.line(lineData(node, side2)));
  })(name, side1, side2);
};
var DiagonalStrike = function(name) {
  return CommonDiagonalStrike((_cname) => (node, _child) => {
    node.adaptor.append(node.element, node.line(lineData(node, name)));
  })(name);
};
var DiagonalArrow = function(name) {
  return CommonDiagonalArrow((node, arrow) => {
    node.adaptor.append(node.element, arrow);
  })(name);
};
var Arrow = function(name) {
  return CommonArrow((node, arrow) => {
    node.adaptor.append(node.element, arrow);
  })(name);
};

// node_modules/mathjax-full/ts/output/svg/Wrappers/menclose.ts
var SVGmenclose = class extends CommonMencloseMixin(SVGWrapper) {
  static {
    /**
     * The menclose wrapper
     */
    this.kind = MmlMenclose.prototype.kind;
  }
  static {
    /**
     *  The definitions of the various notations
     */
    this.notations = new Map([
      Border("top"),
      Border("right"),
      Border("bottom"),
      Border("left"),
      Border2("actuarial", "top", "right"),
      Border2("madruwb", "bottom", "right"),
      DiagonalStrike("up"),
      DiagonalStrike("down"),
      ["horizontalstrike", {
        renderer: RenderLine("horizontal", "Y"),
        bbox: (node) => [0, node.padding, 0, node.padding]
      }],
      ["verticalstrike", {
        renderer: RenderLine("vertical", "X"),
        bbox: (node) => [node.padding, 0, node.padding, 0]
      }],
      ["box", {
        renderer: (node, _child) => {
          const { w, h, d } = node.getBBox();
          node.adaptor.append(node.element, node.box(w, h, d));
        },
        bbox: fullBBox,
        border: fullBorder,
        remove: "left right top bottom"
      }],
      ["roundedbox", {
        renderer: (node, _child) => {
          const { w, h, d } = node.getBBox();
          const r = node.thickness + node.padding;
          node.adaptor.append(node.element, node.box(w, h, d, r));
        },
        bbox: fullBBox
      }],
      ["circle", {
        renderer: (node, _child) => {
          const { w, h, d } = node.getBBox();
          node.adaptor.append(node.element, node.ellipse(w, h, d));
        },
        bbox: fullBBox
      }],
      ["phasorangle", {
        //
        // Use a bottom border and an upward strike properly angled
        //
        renderer: (node, _child) => {
          const { w, h, d } = node.getBBox();
          const a = node.getArgMod(1.75 * node.padding, h + d)[0];
          const t = node.thickness / 2;
          const HD = h + d;
          const cos = Math.cos(a);
          node.adaptor.append(
            node.element,
            node.path("mitre", "M", w, t - d, "L", t + cos * t, t - d, "L", cos * HD + t, HD - d - t)
          );
        },
        bbox: (node) => {
          const p = node.padding / 2;
          const t = node.thickness;
          return [2 * p, p, p + t, 3 * p + t];
        },
        border: (node) => [0, 0, node.thickness, 0],
        remove: "bottom"
      }],
      Arrow("up"),
      Arrow("down"),
      Arrow("left"),
      Arrow("right"),
      Arrow("updown"),
      Arrow("leftright"),
      DiagonalArrow("updiagonal"),
      // backward compatibility
      DiagonalArrow("northeast"),
      DiagonalArrow("southeast"),
      DiagonalArrow("northwest"),
      DiagonalArrow("southwest"),
      DiagonalArrow("northeastsouthwest"),
      DiagonalArrow("northwestsoutheast"),
      ["longdiv", {
        //
        // Use a line along the top followed by a half ellipse at the left
        //
        renderer: (node, _child) => {
          const { w, h, d } = node.getBBox();
          const t = node.thickness / 2;
          const p = node.padding;
          node.adaptor.append(
            node.element,
            node.path(
              "round",
              "M",
              t,
              t - d,
              "a",
              p - t / 2,
              (h + d) / 2 - 4 * t,
              0,
              "0,1",
              0,
              h + d - 2 * t,
              "L",
              w - t,
              h - t
            )
          );
        },
        bbox: (node) => {
          const p = node.padding;
          const t = node.thickness;
          return [p + t, p, p, 2 * p + t / 2];
        }
      }],
      ["radical", {
        //
        //  Use the msqrt rendering, but remove the extra space due to the radical
        //    (it is added in at the end, so other notations overlap the root)
        //
        renderer: (node, child) => {
          node.msqrt.toSVG(child);
          const left = node.sqrtTRBL()[3];
          node.place(-left, 0, child);
        },
        //
        //  Create the needed msqrt wrapper
        //
        init: (node) => {
          node.msqrt = node.createMsqrt(node.childNodes[0]);
        },
        //
        //  Add back in the padding for the square root
        //
        bbox: (node) => node.sqrtTRBL(),
        //
        //  This notation replaces the child
        //
        renderChild: true
      }]
    ]);
  }
  /********************************************************/
  /**
   * @override
   */
  toSVG(parent) {
    const svg = this.standardSVGnode(parent);
    const left = this.getBBoxExtenders()[3];
    const def = {};
    if (left > 0) {
      def.transform = "translate(" + this.fixed(left) + ", 0)";
    }
    const block = this.adaptor.append(svg, this.svg("g", def));
    if (this.renderChild) {
      this.renderChild(this, block);
    } else {
      this.childNodes[0].toSVG(block);
    }
    for (const name of Object.keys(this.notations)) {
      const notation = this.notations[name];
      !notation.renderChild && notation.renderer(this, svg);
    }
  }
  /********************************************************/
  /**
   * Create an arrow using SVG elements
   *
   * @param {number} W        The length of the arrow
   * @param {number} a        The angle for the arrow
   * @param {boolean} double  True if this is a double-headed arrow
   * @param {string} offset   'X' for vertical arrow, 'Y' for horizontal
   * @param {number} dist     Distance to translate in the offset direction
   * @return {N}              The newly created arrow
   */
  arrow(W, a, double, offset = "", dist = 0) {
    const { w, h, d } = this.getBBox();
    const dw = (W - w) / 2;
    const m = (h - d) / 2;
    const t = this.thickness;
    const t2 = t / 2;
    const [x, y, dx] = [t * this.arrowhead.x, t * this.arrowhead.y, t * this.arrowhead.dx];
    const arrow = double ? this.fill(
      "M",
      w + dw,
      m,
      // point of arrow
      "l",
      -(x + dx),
      y,
      "l",
      dx,
      t2 - y,
      // upper right head
      "L",
      x - dw,
      m + t2,
      // upper side of shaft
      "l",
      dx,
      y - t2,
      "l",
      -(x + dx),
      -y,
      // left point
      "l",
      x + dx,
      -y,
      "l",
      -dx,
      y - t2,
      // lower left head
      "L",
      w + dw - x,
      m - t2,
      // lower side of shaft
      "l",
      -dx,
      t2 - y,
      "Z"
      // lower head
    ) : this.fill(
      "M",
      w + dw,
      m,
      // point of arrow
      "l",
      -(x + dx),
      y,
      "l",
      dx,
      t2 - y,
      // upper head
      "L",
      -dw,
      m + t2,
      "l",
      0,
      -t,
      // upper side of shaft
      "L",
      w + dw - x,
      m - t2,
      // lower side of shaft
      "l",
      -dx,
      t2 - y,
      "Z"
      // lower head
    );
    const transform = [];
    if (dist) {
      transform.push(offset === "X" ? `translate(${this.fixed(-dist)} 0)` : `translate(0 ${this.fixed(dist)})`);
    }
    if (a) {
      const A = this.jax.fixed(-a * 180 / Math.PI);
      transform.push(`rotate(${A} ${this.fixed(w / 2)} ${this.fixed(m)})`);
    }
    if (transform.length) {
      this.adaptor.setAttribute(arrow, "transform", transform.join(" "));
    }
    return arrow;
  }
  /********************************************************/
  /**
   * Create a line element
   *
   * @param {number[]} pq   The coordinates of the endpoints, [x1, y1, x2, y2]
   * @return {N}            The newly created line element
   */
  line(pq) {
    const [x1, y1, x2, y2] = pq;
    return this.svg("line", {
      x1: this.fixed(x1),
      y1: this.fixed(y1),
      x2: this.fixed(x2),
      y2: this.fixed(y2),
      "stroke-width": this.fixed(this.thickness)
    });
  }
  /**
   * Create a rectangle element
   *
   * @param {number} w    The width of the rectangle
   * @param {number} h    The height of the rectangle
   * @param {number} d    The depth of the rectangle
   * @param {number=} r   The corner radius for a rounded rectangle
   * @return {N}          The newly created line element
   */
  box(w, h, d, r = 0) {
    const t = this.thickness;
    const def = {
      x: this.fixed(t / 2),
      y: this.fixed(t / 2 - d),
      width: this.fixed(w - t),
      height: this.fixed(h + d - t),
      fill: "none",
      "stroke-width": this.fixed(t)
    };
    if (r) {
      def.rx = this.fixed(r);
    }
    return this.svg("rect", def);
  }
  /**
   * Create an ellipse element
   *
   * @param {number} w  The width of the ellipse
   * @param {number} h  The height of the ellipse
   * @param {number} d  The depth of the ellipse
   * @return {N}        The newly created ellipse node
   */
  ellipse(w, h, d) {
    const t = this.thickness;
    return this.svg("ellipse", {
      rx: this.fixed((w - t) / 2),
      ry: this.fixed((h + d - t) / 2),
      cx: this.fixed(w / 2),
      cy: this.fixed((h - d) / 2),
      "fill": "none",
      "stroke-width": this.fixed(t)
    });
  }
  /**
   * Create a path element from the commands that specify it
   *
   * @param {string} join           The join style for the path
   * @param {(string|number)[]} P   The list of commands and coordinates for the path
   * @return {N}                    The newly created path
   */
  path(join, ...P) {
    return this.svg("path", {
      d: P.map((x) => typeof x === "string" ? x : this.fixed(x)).join(" "),
      style: { "stroke-width": this.fixed(this.thickness) },
      "stroke-linecap": "round",
      "stroke-linejoin": join,
      fill: "none"
    });
  }
  /**
   * Create a filled path element from the commands the specify it
   *   (same as path above, but no thickness adjustments)
   *
   * @param {(string|number)[]} P   The list of commands and coordinates for the path
   * @return {N}                    The newly created path
   */
  fill(...P) {
    return this.svg("path", {
      d: P.map((x) => typeof x === "string" ? x : this.fixed(x)).join(" ")
    });
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/semantics.ts
function CommonSemanticsMixin(Base) {
  return class extends Base {
    /**
     * @override
     */
    computeBBox(bbox, _recompute = false) {
      if (this.childNodes.length) {
        const { w, h, d } = this.childNodes[0].getBBox();
        bbox.w = w;
        bbox.h = h;
        bbox.d = d;
      }
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/semantics.ts
var SVGsemantics = class extends CommonSemanticsMixin(SVGWrapper) {
  static {
    /**
     * The semantics wrapper
     */
    this.kind = MmlSemantics.prototype.kind;
  }
  /**
   * @override
   */
  toSVG(parent) {
    const svg = this.standardSVGnode(parent);
    if (this.childNodes.length) {
      this.childNodes[0].toSVG(svg);
    }
  }
};
var SVGannotation = class extends SVGWrapper {
  static {
    /**
     * The annotation wrapper
     */
    this.kind = MmlAnnotation.prototype.kind;
  }
  /**
   * @override
   */
  toSVG(parent) {
    super.toSVG(parent);
  }
  /**
   * @override
   */
  computeBBox() {
    return this.bbox;
  }
};
var SVGannotationXML = class extends SVGWrapper {
  static {
    /**
     * The annotation-xml wrapper
     */
    this.kind = MmlAnnotationXML.prototype.kind;
  }
  static {
    /**
     * @override
     */
    this.styles = {
      "foreignObject[data-mjx-xml]": {
        "font-family": "initial",
        "line-height": "normal",
        overflow: "visible"
      }
    };
  }
};
var SVGxml = class extends SVGWrapper {
  static {
    /**
     * The XMLNode wrapper
     */
    this.kind = XMLNode.prototype.kind;
  }
  static {
    /**
     * Don't include inline-block CSS for this element
     */
    this.autoStyle = false;
  }
  /**
   * @override
   */
  toSVG(parent) {
    const xml = this.adaptor.clone(this.node.getXML());
    const em2 = this.jax.math.metrics.em * this.jax.math.metrics.scale;
    const scale = this.fixed(1 / em2);
    const { w, h, d } = this.getBBox();
    this.element = this.adaptor.append(parent, this.svg("foreignObject", {
      "data-mjx-xml": true,
      y: this.jax.fixed(-h * em2) + "px",
      width: this.jax.fixed(w * em2) + "px",
      height: this.jax.fixed((h + d) * em2) + "px",
      transform: `scale(${scale}) matrix(1 0 0 -1 0 0)`
    }, [xml]));
  }
  /**
   * @override
   */
  computeBBox(bbox, _recompute = false) {
    const { w, h, d } = this.jax.measureXMLnode(this.node.getXML());
    bbox.w = w;
    bbox.h = h;
    bbox.d = d;
  }
  /**
   * @override
   */
  getStyles() {
  }
  /**
   * @override
   */
  getScale() {
  }
  /**
   * @override
   */
  getVariant() {
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/mglyph.ts
function CommonMglyphMixin(Base) {
  return class extends Base {
    /**
     * @override
     * @constructor
     */
    constructor(...args) {
      super(...args);
      this.getParameters();
    }
    /**
     * @override
     */
    getParameters() {
      const { width, height, valign, src, index } = this.node.attributes.getList("width", "height", "valign", "src", "index");
      if (src) {
        this.width = width === "auto" ? 1 : this.length2em(width);
        this.height = height === "auto" ? 1 : this.length2em(height);
        this.valign = this.length2em(valign || "0");
      } else {
        const text = String.fromCodePoint(parseInt(index));
        const mmlFactory = this.node.factory;
        this.charWrapper = this.wrap(mmlFactory.create("text").setText(text));
        this.charWrapper.parent = this;
      }
    }
    /**
     * @override
     */
    computeBBox(bbox, _recompute = false) {
      if (this.charWrapper) {
        bbox.updateFrom(this.charWrapper.getBBox());
      } else {
        bbox.w = this.width;
        bbox.h = this.height + this.valign;
        bbox.d = -this.valign;
      }
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/mglyph.ts
var SVGmglyph = class extends CommonMglyphMixin(SVGWrapper) {
  static {
    /**
     * The mglyph wrapper
     */
    this.kind = MmlMglyph.prototype.kind;
  }
  /**
   * @override
   */
  toSVG(parent) {
    const svg = this.standardSVGnode(parent);
    if (this.charWrapper) {
      this.charWrapper.toSVG(svg);
      return;
    }
    const { src, alt } = this.node.attributes.getList("src", "alt");
    const h = this.fixed(this.height);
    const w = this.fixed(this.width);
    const y = this.fixed(this.height + (this.valign || 0));
    const properties = {
      width: w,
      height: h,
      transform: "translate(0 " + y + ") matrix(1 0 0 -1 0 0)",
      preserveAspectRatio: "none",
      "aria-label": alt,
      href: src
    };
    const img = this.svg("image", properties);
    this.adaptor.append(svg, img);
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/TeXAtom.ts
function CommonTeXAtomMixin(Base) {
  return class extends Base {
    /**
     * @override
     */
    computeBBox(bbox, recompute = false) {
      super.computeBBox(bbox, recompute);
      if (this.childNodes[0] && this.childNodes[0].bbox.ic) {
        bbox.ic = this.childNodes[0].bbox.ic;
      }
      if (this.node.texClass === TEXCLASS.VCENTER) {
        const { h, d } = bbox;
        const a = this.font.params.axis_height;
        const dh = (h + d) / 2 + a - h;
        bbox.h += dh;
        bbox.d -= dh;
      }
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/TeXAtom.ts
var SVGTeXAtom = class extends CommonTeXAtomMixin(SVGWrapper) {
  static {
    /**
     * The TeXAtom wrapper
     */
    this.kind = TeXAtom.prototype.kind;
  }
  /**
   * @override
   */
  toSVG(parent) {
    super.toSVG(parent);
    this.adaptor.setAttribute(this.element, "data-mjx-texclass", TEXCLASSNAMES[this.node.texClass]);
    if (this.node.texClass === TEXCLASS.VCENTER) {
      const bbox = this.childNodes[0].getBBox();
      const { h, d } = bbox;
      const a = this.font.params.axis_height;
      const dh = (h + d) / 2 + a - h;
      const translate2 = "translate(0 " + this.fixed(dh) + ")";
      this.adaptor.setAttribute(this.element, "transform", translate2);
    }
  }
};

// node_modules/mathjax-full/ts/output/common/Wrappers/TextNode.ts
function CommonTextNodeMixin(Base) {
  return class extends Base {
    /**
     * @override
     */
    computeBBox(bbox, _recompute = false) {
      const variant = this.parent.variant;
      const text = this.node.getText();
      if (variant === "-explicitFont") {
        const font = this.jax.getFontData(this.parent.styles);
        const { w, h, d } = this.jax.measureText(text, variant, font);
        bbox.h = h;
        bbox.d = d;
        bbox.w = w;
      } else {
        const chars = this.remappedText(text, variant);
        bbox.empty();
        for (const char of chars) {
          let [h, d, w, data] = this.getVariantChar(variant, char);
          if (data.unknown) {
            const cbox = this.jax.measureText(String.fromCodePoint(char), variant);
            w = cbox.w;
            h = cbox.h;
            d = cbox.d;
          }
          bbox.w += w;
          if (h > bbox.h) bbox.h = h;
          if (d > bbox.d) bbox.d = d;
          bbox.ic = data.ic || 0;
          bbox.sk = data.sk || 0;
          bbox.dx = data.dx || 0;
        }
        if (chars.length > 1) {
          bbox.sk = 0;
        }
        bbox.clean();
      }
    }
    /**
     * @param {string} text     The text to remap
     * @param {string} variant  The variant for the character
     * @return {number[]}       The unicode points for the (remapped) text
     */
    remappedText(text, variant) {
      const c = this.parent.stretch.c;
      return c ? [c] : this.parent.remapChars(this.unicodeChars(text, variant));
    }
    /******************************************************/
    /*
     * TextNodes don't need these, since these properties
     *   are inherited from the parent nodes
     */
    /**
     * @override
     */
    getStyles() {
    }
    /**
     * @override
     */
    getVariant() {
    }
    /**
     * @override
     */
    getScale() {
    }
    /**
     * @override
     */
    getSpace() {
    }
  };
}

// node_modules/mathjax-full/ts/output/svg/Wrappers/TextNode.ts
var SVGTextNode = class extends CommonTextNodeMixin(SVGWrapper) {
  static {
    /**
     * The TextNode wrapper
     */
    this.kind = TextNode.prototype.kind;
  }
  static {
    /**
     * @override
     */
    this.styles = {
      'mjx-container[jax="SVG"] path[data-c], mjx-container[jax="SVG"] use[data-c]': {
        "stroke-width": 3
      }
    };
  }
  /**
   * @override
   */
  toSVG(parent) {
    const text = this.node.getText();
    const variant = this.parent.variant;
    if (text.length === 0) return;
    if (variant === "-explicitFont") {
      this.element = this.adaptor.append(parent, this.jax.unknownText(text, variant));
    } else {
      const chars = this.remappedText(text, variant);
      if (this.parent.childNodes.length > 1) {
        parent = this.element = this.adaptor.append(parent, this.svg("g", { "data-mml-node": "text" }));
      }
      let x = 0;
      for (const n of chars) {
        x += this.placeChar(n, x, 0, parent, variant);
      }
    }
  }
};

// node_modules/mathjax-full/ts/output/svg/Wrappers.ts
var SVGWrappers = {
  [SVGmath.kind]: SVGmath,
  [SVGmrow.kind]: SVGmrow,
  [SVGinferredMrow.kind]: SVGinferredMrow,
  [SVGmi.kind]: SVGmi,
  [SVGmo.kind]: SVGmo,
  [SVGmn.kind]: SVGmn,
  [SVGms.kind]: SVGms,
  [SVGmtext.kind]: SVGmtext,
  [SVGmerror.kind]: SVGmerror,
  [SVGmspace.kind]: SVGmspace,
  [SVGmpadded.kind]: SVGmpadded,
  [SVGmphantom.kind]: SVGmphantom,
  [SVGmfrac.kind]: SVGmfrac,
  [SVGmsqrt.kind]: SVGmsqrt,
  [SVGmroot.kind]: SVGmroot,
  [SVGmfenced.kind]: SVGmfenced,
  [SVGmsub.kind]: SVGmsub,
  [SVGmsup.kind]: SVGmsup,
  [SVGmsubsup.kind]: SVGmsubsup,
  [SVGmunder.kind]: SVGmunder,
  [SVGmover.kind]: SVGmover,
  [SVGmunderover.kind]: SVGmunderover,
  [SVGmmultiscripts.kind]: SVGmmultiscripts,
  [SVGmtable.kind]: SVGmtable,
  [SVGmtr.kind]: SVGmtr,
  [SVGmlabeledtr.kind]: SVGmlabeledtr,
  [SVGmtd.kind]: SVGmtd,
  [SVGmaction.kind]: SVGmaction,
  [SVGmenclose.kind]: SVGmenclose,
  [SVGsemantics.kind]: SVGsemantics,
  [SVGannotation.kind]: SVGannotation,
  [SVGannotationXML.kind]: SVGannotationXML,
  [SVGxml.kind]: SVGxml,
  [SVGmglyph.kind]: SVGmglyph,
  [SVGTeXAtom.kind]: SVGTeXAtom,
  [SVGTextNode.kind]: SVGTextNode,
  [SVGWrapper.kind]: SVGWrapper
};

// node_modules/mathjax-full/ts/output/svg/WrapperFactory.ts
var SVGWrapperFactory = class extends CommonWrapperFactory {
  constructor() {
    super(...arguments);
    /**
     * The CHTML output jax associated with this factory
     */
    this.jax = null;
  }
  static {
    /**
     * The default list of wrapper nodes this factory can create
     */
    this.defaultNodes = SVGWrappers;
  }
};

// node_modules/mathjax-full/ts/output/common/fonts/tex.ts
function CommonTeXFontMixin(Base) {
  return class extends Base {
    static {
      /**
       * @override
       */
      this.NAME = "TeX";
    }
    static {
      /**
       *  Add the extra variants for the TeX fonts
       */
      this.defaultVariants = [
        ...Base.defaultVariants,
        ["-smallop", "normal"],
        ["-largeop", "normal"],
        ["-size3", "normal"],
        ["-size4", "normal"],
        ["-tex-calligraphic", "italic"],
        ["-tex-bold-calligraphic", "bold-italic"],
        ["-tex-oldstyle", "normal"],
        ["-tex-bold-oldstyle", "bold"],
        ["-tex-mathit", "italic"],
        ["-tex-variant", "normal"]
      ];
    }
    static {
      /**
       * The data used for CSS for undefined characters for each variant
       */
      this.defaultCssFonts = {
        ...Base.defaultCssFonts,
        "-smallop": ["serif", false, false],
        "-largeop": ["serif", false, false],
        "-size3": ["serif", false, false],
        "-size4": ["serif", false, false],
        "-tex-calligraphic": ["cursive", true, false],
        "-tex-bold-calligraphic": ["cursive", true, true],
        "-tex-oldstyle": ["serif", false, false],
        "-tex-bold-oldstyle": ["serif", false, true],
        "-tex-mathit": ["serif", true, false]
      };
    }
    static {
      /**
       *  The default variants for the standard stretchy sizes
       */
      this.defaultSizeVariants = ["normal", "-smallop", "-largeop", "-size3", "-size4", "-tex-variant"];
    }
    static {
      /**
       *  The default variants for the standard stretchy assmebly parts
       */
      this.defaultStretchVariants = ["-size4"];
    }
    /**
     * @override
     */
    getDelimiterData(n) {
      return this.getChar("-smallop", n) || this.getChar("-size4", n);
    }
  };
}

// node_modules/mathjax-full/ts/output/common/fonts/tex/delimiters.ts
var HDW1 = [0.75, 0.25, 0.875];
var HDW2 = [0.85, 0.349, 0.667];
var HDW3 = [0.583, 0.082, 0.5];
var VSIZES = [1, 1.2, 1.8, 2.4, 3];
var DELIM2F = { c: 47, dir: V, sizes: VSIZES };
var DELIMAF = { c: 175, dir: H, sizes: [0.5], stretch: [0, 175], HDW: [0.59, -0.544, 0.5] };
var DELIM2C6 = { c: 710, dir: H, sizes: [0.5, 0.556, 1, 1.444, 1.889] };
var DELIM2DC = { c: 732, dir: H, sizes: [0.5, 0.556, 1, 1.444, 1.889] };
var DELIM2013 = { c: 8211, dir: H, sizes: [0.5], stretch: [0, 8211], HDW: [0.285, -0.248, 0.5] };
var DELIM2190 = { c: 8592, dir: H, sizes: [1], stretch: [8592, 8722], HDW: HDW3 };
var DELIM2192 = { c: 8594, dir: H, sizes: [1], stretch: [0, 8722, 8594], HDW: HDW3 };
var DELIM2194 = { c: 8596, dir: H, sizes: [1], stretch: [8592, 8722, 8594], HDW: HDW3 };
var DELIM21A4 = { c: 8612, dir: H, stretch: [8592, 8722, 8739], HDW: HDW3, min: 1.278 };
var DELIM21A6 = { c: 8614, dir: H, sizes: [1], stretch: [8739, 8722, 8594], HDW: HDW3 };
var DELIM21D0 = { c: 8656, dir: H, sizes: [1], stretch: [8656, 61], HDW: HDW3 };
var DELIM21D2 = { c: 8658, dir: H, sizes: [1], stretch: [0, 61, 8658], HDW: HDW3 };
var DELIM21D4 = { c: 8660, dir: H, sizes: [1], stretch: [8656, 61, 8658], HDW: HDW3 };
var DELIM2212 = { c: 8722, dir: H, sizes: [0.778], stretch: [0, 8722], HDW: HDW3 };
var DELIM2223 = { c: 8739, dir: V, sizes: [1], stretch: [0, 8739], HDW: [0.627, 0.015, 0.333] };
var DELIM23DC = {
  c: 9180,
  dir: H,
  sizes: [0.778, 1],
  schar: [8994, 8994],
  variants: [5, 0],
  stretch: [57680, 57684, 57681],
  HDW: [0.32, 0.2, 0.5]
};
var DELIM23DD = {
  c: 9181,
  dir: H,
  sizes: [0.778, 1],
  schar: [8995, 8995],
  variants: [5, 0],
  stretch: [57682, 57684, 57683],
  HDW: [0.32, 0.2, 0.5]
};
var DELIM23DE = { c: 9182, dir: H, stretch: [57680, 57684, 57681, 57685], HDW: [0.32, 0.2, 0.5], min: 1.8 };
var DELIM23DF = { c: 9183, dir: H, stretch: [57682, 57684, 57683, 57686], HDW: [0.32, 0.2, 0.5], min: 1.8 };
var DELIM27E8 = { c: 10216, dir: V, sizes: VSIZES };
var DELIM27E9 = { c: 10217, dir: V, sizes: VSIZES };
var DELIM2906 = { c: 10502, dir: H, stretch: [8656, 61, 8739], HDW: HDW3, min: 1.278 };
var DELIM2907 = { c: 10503, dir: H, stretch: [8872, 61, 8658], HDW: HDW3, min: 1.278 };
var delimiters = {
  40: { dir: V, sizes: VSIZES, stretch: [9115, 9116, 9117], HDW: [0.85, 0.349, 0.875] },
  41: { dir: V, sizes: VSIZES, stretch: [9118, 9119, 9120], HDW: [0.85, 0.349, 0.875] },
  45: DELIM2212,
  47: DELIM2F,
  61: { dir: H, sizes: [0.778], stretch: [0, 61], HDW: HDW3 },
  91: { dir: V, sizes: VSIZES, stretch: [9121, 9122, 9123], HDW: HDW2 },
  92: { dir: V, sizes: VSIZES },
  93: { dir: V, sizes: VSIZES, stretch: [9124, 9125, 9126], HDW: HDW2 },
  94: DELIM2C6,
  95: DELIM2013,
  123: { dir: V, sizes: VSIZES, stretch: [9127, 9130, 9129, 9128], HDW: [0.85, 0.349, 0.889] },
  124: { dir: V, sizes: [1], stretch: [0, 8739], HDW: [0.75, 0.25, 0.333] },
  125: { dir: V, sizes: VSIZES, stretch: [9131, 9130, 9133, 9132], HDW: [0.85, 0.349, 0.889] },
  126: DELIM2DC,
  175: DELIMAF,
  710: DELIM2C6,
  713: DELIMAF,
  732: DELIM2DC,
  770: DELIM2C6,
  771: DELIM2DC,
  818: DELIM2013,
  8211: DELIM2013,
  8212: DELIM2013,
  8213: DELIM2013,
  8214: { dir: V, sizes: [0.602, 1], schar: [0, 8741], variants: [1, 0], stretch: [0, 8741], HDW: [0.602, 0, 0.556] },
  8215: DELIM2013,
  8254: DELIMAF,
  8407: DELIM2192,
  8592: DELIM2190,
  8593: { dir: V, sizes: [0.888], stretch: [8593, 9168], HDW: [0.6, 0, 0.667] },
  8594: DELIM2192,
  8595: { dir: V, sizes: [0.888], stretch: [0, 9168, 8595], HDW: [0.6, 0, 0.667] },
  8596: DELIM2194,
  8597: { dir: V, sizes: [1.044], stretch: [8593, 9168, 8595], HDW: HDW1 },
  8606: { dir: H, sizes: [1], stretch: [8606, 8722], HDW: HDW3 },
  8608: { dir: H, sizes: [1], stretch: [0, 8722, 8608], HDW: HDW3 },
  8612: DELIM21A4,
  8613: { dir: V, stretch: [8593, 9168, 8869], HDW: HDW1, min: 1.555 },
  8614: DELIM21A6,
  8615: { dir: V, stretch: [8868, 9168, 8595], HDW: HDW1, min: 1.555 },
  8624: { dir: V, sizes: [0.722], stretch: [8624, 9168], HDW: HDW1 },
  8625: { dir: V, sizes: [0.722], stretch: [8625, 9168], HDW: HDW1 },
  8636: { dir: H, sizes: [1], stretch: [8636, 8722], HDW: HDW3 },
  8637: { dir: H, sizes: [1], stretch: [8637, 8722], HDW: HDW3 },
  8638: { dir: V, sizes: [0.888], stretch: [8638, 9168], HDW: HDW1 },
  8639: { dir: V, sizes: [0.888], stretch: [8639, 9168], HDW: HDW1 },
  8640: { dir: H, sizes: [1], stretch: [0, 8722, 8640], HDW: HDW3 },
  8641: { dir: H, sizes: [1], stretch: [0, 8722, 8641], HDW: HDW3 },
  8642: { dir: V, sizes: [0.888], stretch: [0, 9168, 8642], HDW: HDW1 },
  8643: { dir: V, sizes: [0.888], stretch: [0, 9168, 8643], HDW: HDW1 },
  8656: DELIM21D0,
  8657: { dir: V, sizes: [0.888], stretch: [8657, 8214], HDW: [0.599, 0, 0.778] },
  8658: DELIM21D2,
  8659: { dir: V, sizes: [0.888], stretch: [0, 8214, 8659], HDW: [0.6, 0, 0.778] },
  8660: DELIM21D4,
  8661: { dir: V, sizes: [1.044], stretch: [8657, 8214, 8659], HDW: [0.75, 0.25, 0.778] },
  8666: { dir: H, sizes: [1], stretch: [8666, 8801], HDW: [0.464, -0.036, 0.5] },
  8667: { dir: H, sizes: [1], stretch: [0, 8801, 8667], HDW: [0.464, -0.036, 0.5] },
  8722: DELIM2212,
  8725: DELIM2F,
  8730: { dir: V, sizes: VSIZES, stretch: [57345, 57344, 9143], fullExt: [0.65, 2.3], HDW: [0.85, 0.35, 1.056] },
  8739: DELIM2223,
  8741: { dir: V, sizes: [1], stretch: [0, 8741], HDW: [0.627, 0.015, 0.556] },
  8968: { dir: V, sizes: VSIZES, stretch: [9121, 9122], HDW: HDW2 },
  8969: { dir: V, sizes: VSIZES, stretch: [9124, 9125], HDW: HDW2 },
  8970: { dir: V, sizes: VSIZES, stretch: [0, 9122, 9123], HDW: HDW2 },
  8971: { dir: V, sizes: VSIZES, stretch: [0, 9125, 9126], HDW: HDW2 },
  8978: DELIM23DC,
  8994: DELIM23DC,
  8995: DELIM23DD,
  9001: DELIM27E8,
  9002: DELIM27E9,
  9130: { dir: V, sizes: [0.32], stretch: [9130, 9130, 9130], HDW: [0.29, 0.015, 0.889] },
  9135: DELIM2013,
  9136: { dir: V, sizes: [0.989], stretch: [9127, 9130, 9133], HDW: [0.75, 0.25, 0.889] },
  9137: { dir: V, sizes: [0.989], stretch: [9131, 9130, 9129], HDW: [0.75, 0.25, 0.889] },
  9140: { dir: H, stretch: [9484, 8722, 9488], HDW: HDW3, min: 1 },
  9141: { dir: H, stretch: [9492, 8722, 9496], HDW: HDW3, min: 1 },
  9168: { dir: V, sizes: [0.602, 1], schar: [0, 8739], variants: [1, 0], stretch: [0, 8739], HDW: [0.602, 0, 0.333] },
  9180: DELIM23DC,
  9181: DELIM23DD,
  9182: DELIM23DE,
  9183: DELIM23DF,
  9184: { dir: H, stretch: [714, 713, 715], HDW: [0.59, -0.544, 0.5], min: 1 },
  9185: { dir: H, stretch: [715, 713, 714], HDW: [0.59, -0.544, 0.5], min: 1 },
  9472: DELIM2013,
  10072: DELIM2223,
  10216: DELIM27E8,
  10217: DELIM27E9,
  10222: { dir: V, sizes: [0.989], stretch: [9127, 9130, 9129], HDW: [0.75, 0.25, 0.889] },
  10223: { dir: V, sizes: [0.989], stretch: [9131, 9130, 9133], HDW: [0.75, 0.25, 0.889] },
  10229: DELIM2190,
  10230: DELIM2192,
  10231: DELIM2194,
  10232: DELIM21D0,
  10233: DELIM21D2,
  10234: DELIM21D4,
  10235: DELIM21A4,
  10236: DELIM21A6,
  10237: DELIM2906,
  10238: DELIM2907,
  10502: DELIM2906,
  10503: DELIM2907,
  10574: { dir: H, stretch: [8636, 8722, 8640], HDW: HDW3, min: 2 },
  10575: { dir: V, stretch: [8638, 9168, 8642], HDW: HDW1, min: 1.776 },
  10576: { dir: H, stretch: [8637, 8722, 8641], HDW: HDW3, min: 2 },
  10577: { dir: V, stretch: [8639, 9168, 8643], HDW: HDW1, min: 0.5 },
  10586: { dir: H, stretch: [8636, 8722, 8739], HDW: HDW3, min: 1.278 },
  10587: { dir: H, stretch: [8739, 8722, 8640], HDW: HDW3, min: 1.278 },
  10588: { dir: V, stretch: [8638, 9168, 8869], HDW: HDW1, min: 1.556 },
  10589: { dir: V, stretch: [8868, 9168, 8642], HDW: HDW1, min: 1.556 },
  10590: { dir: H, stretch: [8637, 8722, 8739], HDW: HDW3, min: 1.278 },
  10591: { dir: H, stretch: [8739, 8722, 8641], HDW: HDW3, min: 1.278 },
  10592: { dir: V, stretch: [8639, 9168, 8869], HDW: HDW1, min: 1.776 },
  10593: { dir: V, stretch: [8868, 9168, 8643], HDW: HDW1, min: 1.776 },
  12296: DELIM27E8,
  12297: DELIM27E9,
  65079: DELIM23DE,
  65080: DELIM23DF
};

// node_modules/mathjax-full/ts/output/svg/fonts/tex.ts
var TeXFont = class extends CommonTeXFontMixin(SVGFontData) {
  static {
    /**
     *  The stretchy delimiter data
     */
    this.defaultDelimiters = delimiters;
  }
  static {
    /**
     *  The character data by variant
     */
    this.defaultChars = {
      "normal": normal,
      "bold": bold,
      "italic": italic,
      "bold-italic": boldItalic,
      "double-struck": doubleStruck,
      "fraktur": fraktur,
      "bold-fraktur": frakturBold,
      "script": script,
      "bold-script": scriptBold,
      "sans-serif": sansSerif,
      "bold-sans-serif": sansSerifBold,
      "sans-serif-italic": sansSerifItalic,
      "sans-serif-bold-italic": sansSerifBoldItalic,
      "monospace": monospace,
      "-smallop": smallop,
      "-largeop": largeop,
      "-size3": texSize3,
      "-size4": texSize4,
      "-tex-calligraphic": texCalligraphic,
      "-tex-bold-calligraphic": texCalligraphicBold,
      "-tex-mathit": texMathit,
      "-tex-oldstyle": texOldstyle,
      "-tex-bold-oldstyle": texOldstyleBold,
      "-tex-variant": texVariant
    };
  }
  static {
    /**
     * The cacheIDs to use for the variants in font-caching
     */
    this.variantCacheIds = {
      "normal": "N",
      "bold": "B",
      "italic": "I",
      "bold-italic": "BI",
      "double-struck": "D",
      "fraktur": "F",
      "bold-fraktur": "BF",
      "script": "S",
      "bold-script": "BS",
      "sans-serif": "SS",
      "bold-sans-serif": "BSS",
      "sans-serif-italic": "SSI",
      "sans-serif-bold-italic": "SSBI",
      "monospace": "M",
      "-smallop": "SO",
      "-largeop": "LO",
      "-size3": "S3",
      "-size4": "S4",
      "-tex-calligraphic": "C",
      "-tex-bold-calligraphic": "BC",
      "-tex-mathit": "MI",
      "-tex-oldstyle": "OS",
      "-tex-bold-oldstyle": "BOS",
      "-tex-variant": "V"
    };
  }
  /**
   * @override
   */
  constructor(options2 = null) {
    super(options2);
    const CLASS = this.constructor;
    for (const variant of Object.keys(CLASS.variantCacheIds)) {
      this.variant[variant].cacheID = "TEX-" + CLASS.variantCacheIds[variant];
    }
  }
};

// node_modules/mathjax-full/ts/output/svg/FontCache.ts
var FontCache = class {
  /**
   * @param {SVG} jax  The SVG jax owning this font cache
   */
  constructor(jax) {
    /**
     * The cache of font character IDs to their paths
     */
    this.cache = /* @__PURE__ */ new Map();
    /**
     * The SVG <defs> element for storing the cache
     */
    this.defs = null;
    /**
     * A string to use to make per-equation cache IDs unique
     */
    this.localID = "";
    /**
     * A number used to make localID values to use for each equation
     */
    this.nextID = 0;
    this.jax = jax;
  }
  /**
   * Cache a character from a particular variant and return the cache ID
   *
   * @param {string} variant   The variant name for the character
   * @param {string} C         The character to be cached
   * @param {string} path      The SVG path data for the character
   * @return {string}          The id for the cached <path> element
   */
  cachePath(variant, C, path) {
    const id = "MJX-" + this.localID + (this.jax.font.getVariant(variant).cacheID || "") + "-" + C;
    if (!this.cache.has(id)) {
      this.cache.set(id, path);
      this.jax.adaptor.append(this.defs, this.jax.svg("path", { id, d: path }));
    }
    return id;
  }
  /**
   * Clear the localID value
   */
  clearLocalID() {
    this.localID = "";
  }
  /**
   * Use a localID (for font-specific caching), either with a specific string,
   * or from the nextID number.
   */
  useLocalID(id = null) {
    this.localID = (id == null ? ++this.nextID : id) + (id === "" ? "" : "-");
  }
  /**
   * Clear the cache
   */
  clearCache() {
    this.cache = /* @__PURE__ */ new Map();
    this.defs = this.jax.svg("defs");
  }
  /**
   * Return the font cache <defs> element
   */
  getCache() {
    return this.defs;
  }
};

// node_modules/mathjax-full/ts/output/svg.ts
var SVGNS = "http://www.w3.org/2000/svg";
var XLINKNS = "http://www.w3.org/1999/xlink";
var SVG2 = class _SVG extends CommonOutputJax {
  /**
   * @override
   * @constructor
   */
  constructor(options2 = null) {
    super(options2, SVGWrapperFactory, TeXFont);
    /**
     * Minimum width for tables with labels,
     */
    this.minwidth = 0;
    /**
     * The shift for the main equation
     */
    this.shift = 0;
    /**
     * The container element for the math
     */
    this.container = null;
    /**
     * The SVG stylesheet, once it is constructed
     */
    this.svgStyles = null;
    this.fontCache = new FontCache(this);
  }
  static {
    /**
     * The name of the output jax
     */
    this.NAME = "SVG";
  }
  static {
    /**
     * @override
     */
    this.OPTIONS = {
      ...CommonOutputJax.OPTIONS,
      internalSpeechTitles: true,
      // insert <title> tags with speech content
      titleID: 0,
      // initial id number to use for aria-labeledby titles
      fontCache: "local",
      // or 'global' or 'none'
      localID: null
      // ID to use for local font cache (for single equation processing)
    };
  }
  static {
    /**
     *  The default styles for SVG
     */
    this.commonStyles = {
      'mjx-container[jax="SVG"]': {
        direction: "ltr"
      },
      'mjx-container[jax="SVG"] > svg': {
        overflow: "visible",
        "min-height": "1px",
        "min-width": "1px"
      },
      'mjx-container[jax="SVG"] > svg a': {
        fill: "blue",
        stroke: "blue"
      }
    };
  }
  static {
    /**
     * The ID for the SVG element that stores the cached font paths
     */
    this.FONTCACHEID = "MJX-SVG-global-cache";
  }
  static {
    /**
     * The ID for the stylesheet element for the styles for the SVG output
     */
    this.STYLESHEETID = "MJX-SVG-styles";
  }
  /**
   * @override
   */
  initialize() {
    if (this.options.fontCache === "global") {
      this.fontCache.clearCache();
    }
  }
  /**
   * Clear the font cache (use for resetting the global font cache)
   */
  clearFontCache() {
    this.fontCache.clearCache();
  }
  /**
   * @override
   */
  reset() {
    this.clearFontCache();
  }
  /**
   * @override
   */
  setScale(node) {
    if (this.options.scale !== 1) {
      this.adaptor.setStyle(node, "fontSize", percent(this.options.scale));
    }
  }
  /**
   * @override
   */
  escaped(math, html) {
    this.setDocument(html);
    return this.html("span", {}, [this.text(math.math)]);
  }
  /**
   * @override
   */
  styleSheet(html) {
    if (this.svgStyles) {
      return this.svgStyles;
    }
    const sheet = this.svgStyles = super.styleSheet(html);
    this.adaptor.setAttribute(sheet, "id", _SVG.STYLESHEETID);
    return sheet;
  }
  /**
   * @override
   */
  pageElements(html) {
    if (this.options.fontCache === "global" && !this.findCache(html)) {
      return this.svg("svg", { id: _SVG.FONTCACHEID, style: { display: "none" } }, [this.fontCache.getCache()]);
    }
    return null;
  }
  /**
   * Checks if there is already a font-cache element in the page
   *
   * @param {MathDocument} html   The document to search
   * @return {boolean}            True if a font cache already exists in the page
   */
  findCache(html) {
    const adaptor2 = this.adaptor;
    const svgs = adaptor2.tags(adaptor2.body(html.document), "svg");
    for (let i = svgs.length - 1; i >= 0; i--) {
      if (this.adaptor.getAttribute(svgs[i], "id") === _SVG.FONTCACHEID) {
        return true;
      }
    }
    return false;
  }
  /**
   * @param {MmlNode} math  The MML node whose SVG is to be produced
   * @param {N} parent      The HTML node to contain the SVG
   */
  processMath(math, parent) {
    const container = this.container;
    this.container = parent;
    const wrapper = this.factory.wrap(math);
    const [svg, g] = this.createRoot(wrapper);
    this.typesetSVG(wrapper, svg, g);
    this.container = container;
  }
  /**
   * @param {SVGWrapper} wrapper   The wrapped math to process
   * @return {[N, N]}              The svg and g nodes for the math
   */
  createRoot(wrapper) {
    const { w, h, d, pwidth } = wrapper.getOuterBBox();
    const px2 = wrapper.metrics.em / 1e3;
    const W = Math.max(w, px2);
    const H2 = Math.max(h + d, px2);
    const g = this.svg("g", {
      stroke: "currentColor",
      fill: "currentColor",
      "stroke-width": 0,
      transform: "scale(1,-1)"
    });
    const adaptor2 = this.adaptor;
    const svg = adaptor2.append(this.container, this.svg("svg", {
      xmlns: SVGNS,
      width: this.ex(W),
      height: this.ex(H2),
      role: "img",
      focusable: false,
      style: { "vertical-align": this.ex(-d) },
      viewBox: [0, this.fixed(-h * 1e3, 1), this.fixed(W * 1e3, 1), this.fixed(H2 * 1e3, 1)].join(" ")
    }, [g]));
    if (W === 1e-3) {
      adaptor2.setAttribute(svg, "preserveAspectRatio", "xMidYMid slice");
      if (w < 0) {
        adaptor2.setStyle(this.container, "margin-right", this.ex(w));
      }
    }
    if (pwidth) {
      adaptor2.setStyle(svg, "min-width", this.ex(W));
      adaptor2.setAttribute(svg, "width", pwidth);
      adaptor2.removeAttribute(svg, "viewBox");
      const scale = this.fixed(wrapper.metrics.ex / (this.font.params.x_height * 1e3), 6);
      adaptor2.setAttribute(g, "transform", `scale(${scale},-${scale}) translate(0, ${this.fixed(-h * 1e3, 1)})`);
    }
    if (this.options.fontCache !== "none") {
      adaptor2.setAttribute(svg, "xmlns:xlink", XLINKNS);
    }
    return [svg, g];
  }
  /**
   * Typeset the math and add minwidth (from mtables), or set the alignment and indentation
   * of the finalized expression.
   *
   * @param {SVGWrapper} wrapper   The wrapped math to typeset
   * @param {N} svg                The main svg element for the typeet math
   * @param {N} g                  The group in which the math is typeset
   */
  typesetSVG(wrapper, svg, g) {
    const adaptor2 = this.adaptor;
    this.minwidth = this.shift = 0;
    if (this.options.fontCache === "local") {
      this.fontCache.clearCache();
      this.fontCache.useLocalID(this.options.localID);
      adaptor2.insert(this.fontCache.getCache(), g);
    }
    wrapper.toSVG(g);
    this.fontCache.clearLocalID();
    if (this.minwidth) {
      adaptor2.setStyle(svg, "minWidth", this.ex(this.minwidth));
      adaptor2.setStyle(this.container, "minWidth", this.ex(this.minwidth));
    } else if (this.shift) {
      const align = adaptor2.getAttribute(this.container, "justify") || "center";
      this.setIndent(svg, align, this.shift);
    }
  }
  /**
   * @param {N} svg         The svg node whose indentation is to be adjusted
   * @param {string} align  The alignment for the node
   * @param {number} shift  The indent (positive or negative) for the node
   */
  setIndent(svg, align, shift) {
    if (align === "center" || align === "left") {
      this.adaptor.setStyle(svg, "margin-left", this.ex(shift));
    }
    if (align === "center" || align === "right") {
      this.adaptor.setStyle(svg, "margin-right", this.ex(-shift));
    }
  }
  /**
   * @param {number} m  A number to be shown in ex
   * @return {string}   The number with units of ex
   */
  ex(m) {
    m /= this.font.params.x_height;
    return Math.abs(m) < 1e-3 ? "0" : m.toFixed(3).replace(/\.?0+$/, "") + "ex";
  }
  /**
   * @param {string} kind             The kind of node to create
   * @param {OptionList} properties   The properties to set for the element
   * @param {(N|T)[]} children            The child nodes for this node
   * @return {N}                      The newly created node in the SVG namespace
   */
  svg(kind, properties = {}, children = []) {
    return this.html(kind, properties, children, SVGNS);
  }
  /**
   * @param {string} text      The text to be displayed
   * @param {string} variant   The name of the variant for the text
   * @return {N}               The text element containing the text
   */
  unknownText(text, variant) {
    const metrics = this.math.metrics;
    const scale = this.font.params.x_height / metrics.ex * metrics.em * 1e3;
    const svg = this.svg("text", {
      "data-variant": variant,
      transform: "scale(1,-1)",
      "font-size": this.fixed(scale, 1) + "px"
    }, [this.text(text)]);
    const adaptor2 = this.adaptor;
    if (variant !== "-explicitFont") {
      const c = unicodeChars(text);
      if (c.length !== 1 || c[0] < 119808 || c[0] > 120831) {
        const [family, italic2, bold2] = this.font.getCssFont(variant);
        adaptor2.setAttribute(svg, "font-family", family);
        if (italic2) {
          adaptor2.setAttribute(svg, "font-style", "italic");
        }
        if (bold2) {
          adaptor2.setAttribute(svg, "font-weight", "bold");
        }
      }
    }
    return svg;
  }
  /**
   * Measure the width of a text element by placing it in the page
   *  and looking up its size (fake the height and depth, since we can't measure that)
   *
   * @param {N} text         The text element to measure
   * @return {Object}        The width, height and depth for the text
   */
  measureTextNode(text) {
    const adaptor2 = this.adaptor;
    text = adaptor2.clone(text);
    adaptor2.removeAttribute(text, "transform");
    const ex = this.fixed(this.font.params.x_height * 1e3, 1);
    const svg = this.svg("svg", {
      position: "absolute",
      visibility: "hidden",
      width: "1ex",
      height: "1ex",
      viewBox: [0, 0, ex, ex].join(" ")
    }, [text]);
    adaptor2.append(adaptor2.body(adaptor2.document), svg);
    let w = adaptor2.nodeSize(text, 1e3, true)[0];
    adaptor2.remove(svg);
    return { w, h: 0.75, d: 0.2 };
  }
};

// scripts/mathjax-entry.ts
var PACKAGES = ["base", "ams", "newcommand", "boldsymbol", "braket", "mathtools", "cancel", "color", "textmacros"];
var adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
function tree(node) {
  const children = adaptor.childNodes(node).filter((child) => adaptor.kind(child) !== "#text");
  const attrs = {};
  for (const { name, value } of adaptor.allAttributes(node)) attrs[name] = value;
  const tag = adaptor.kind(node);
  return { tag, attrs, children: children.map(tree), ...tag === "text" && { text: adaptor.textContent(node) } };
}
function find(node, test) {
  if (test(node)) return node;
  for (const child of node.children) {
    const found = find(child, test);
    if (found) return found;
  }
  return void 0;
}
var output = new SVG2({ fontCache: "none" });
function convertIn(document2, tex, display) {
  let root;
  try {
    root = tree(document2.convert(tex, { display, em: 16, ex: 8, containerWidth: 1280 }));
  } catch (e) {
    return { error: `MathJax failed: ${e instanceof Error ? e.message : String(e)}` };
  }
  const svg = find(root, (node) => node.tag === "svg");
  if (!svg) return { error: "MathJax drew nothing" };
  const error = find(svg, (node) => node.attrs["data-mml-node"] === "merror");
  return error ? { error: error.attrs["data-mjx-error"] ?? "TeX error" } : svg;
}
function createTex(macros) {
  const documentWithMacros = () => {
    const document2 = mathjax.document("", { InputJax: new TeX({ packages: PACKAGES }), OutputJax: output });
    return { document: document2, defined: macros.trim() ? convertIn(document2, macros, false) : void 0 };
  };
  const { defined } = documentWithMacros();
  if (defined && "error" in defined) return { convert: () => ({ error: `in your macros: ${defined.error}` }) };
  return { convert: (tex, display) => convertIn(documentWithMacros().document, tex, display) };
}
function stylesheet() {
  const document2 = mathjax.document("", { InputJax: new TeX({ packages: PACKAGES }), OutputJax: output });
  return adaptor.textContent(output.styleSheet(document2));
}
export {
  createTex,
  stylesheet
};
