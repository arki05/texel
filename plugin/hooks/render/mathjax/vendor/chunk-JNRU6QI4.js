// node_modules/mathjax-full/ts/util/Options.ts
var OBJECT = {}.constructor;
function isObject(obj) {
  return typeof obj === "object" && obj !== null && (obj.constructor === OBJECT || obj.constructor === Expandable);
}
var APPEND = "[+]";
var REMOVE = "[-]";
var OPTIONS = {
  invalidOption: "warn",
  /**
   * Function to report messages for invalid options
   *
   * @param {string} message   The message for the invalid parameter.
   * @param {string} key       The invalid key itself.
   */
  optionError: (message, _key) => {
    if (OPTIONS.invalidOption === "fatal") {
      throw new Error(message);
    }
    console.warn("MathJax: " + message);
  }
};
var Expandable = class {
};
function expandable(def) {
  return Object.assign(Object.create(Expandable.prototype), def);
}
function makeArray(x) {
  return Array.isArray(x) ? x : [x];
}
function keys(def) {
  if (!def) {
    return [];
  }
  return Object.keys(def).concat(Object.getOwnPropertySymbols(def));
}
function copy(def) {
  let props = {};
  for (const key of keys(def)) {
    let prop = Object.getOwnPropertyDescriptor(def, key);
    let value = prop.value;
    if (Array.isArray(value)) {
      prop.value = insert([], value, false);
    } else if (isObject(value)) {
      prop.value = copy(value);
    }
    if (prop.enumerable) {
      props[key] = prop;
    }
  }
  return Object.defineProperties(def.constructor === Expandable ? expandable({}) : {}, props);
}
function insert(dst, src, warn = true) {
  for (let key of keys(src)) {
    if (warn && dst[key] === void 0 && dst.constructor !== Expandable) {
      if (typeof key === "symbol") {
        key = key.toString();
      }
      OPTIONS.optionError(`Invalid option "${key}" (no default value).`, key);
      continue;
    }
    let sval = src[key], dval = dst[key];
    if (isObject(sval) && dval !== null && (typeof dval === "object" || typeof dval === "function")) {
      const ids = keys(sval);
      if (
        //
        // If the destination value is an array...
        //
        Array.isArray(dval) && //
        // If there is only one key and it is APPEND or REMOVE and the keys value is an array...
        //
        (ids.length === 1 && (ids[0] === APPEND || ids[0] === REMOVE) && Array.isArray(sval[ids[0]]) || //
        // Or if there are two keys and they are APPEND and REMOVE and both keys' values
        //   are arrays...
        //
        ids.length === 2 && ids.sort().join(",") === APPEND + "," + REMOVE && Array.isArray(sval[APPEND]) && Array.isArray(sval[REMOVE]))
      ) {
        if (sval[REMOVE]) {
          dval = dst[key] = dval.filter((x) => sval[REMOVE].indexOf(x) < 0);
        }
        if (sval[APPEND]) {
          dst[key] = [...dval, ...sval[APPEND]];
        }
      } else {
        insert(dval, sval, warn);
      }
    } else if (Array.isArray(sval)) {
      dst[key] = [];
      insert(dst[key], sval, false);
    } else if (isObject(sval)) {
      dst[key] = copy(sval);
    } else {
      dst[key] = sval;
    }
  }
  return dst;
}
function defaultOptions(options, ...defs) {
  defs.forEach((def) => insert(options, def, false));
  return options;
}
function userOptions(options, ...defs) {
  defs.forEach((def) => insert(options, def, true));
  return options;
}
function separateOptions(options, ...objects) {
  let results = [];
  for (const object of objects) {
    let exists = {}, missing = {};
    for (const key of Object.keys(options || {})) {
      (object[key] === void 0 ? missing : exists)[key] = options[key];
    }
    results.push(exists);
    options = missing;
  }
  results.unshift(options);
  return results;
}
function lookup(name, lookup2, def = null) {
  return lookup2.hasOwnProperty(name) ? lookup2[name] : def;
}

// node_modules/mathjax-full/ts/output/common/FontData.ts
var V = 1 /* Vertical */;
var H = 2 /* Horizontal */;
var NOSTRETCH = { dir: 0 /* None */ };
var FontData = class {
  /**
   * Copies the data from the defaults to the instance
   *
   * @param {OptionList} options   The options for this font
   *
   * @constructor
   */
  constructor(options = null) {
    /**
     * The actual variant information for this font
     */
    this.variant = {};
    /**
     * The actual delimiter information for this font
     */
    this.delimiters = {};
    /**
     * The data to use to make variants to default fonts and css for unknown characters
     */
    this.cssFontMap = {};
    /**
     * The character maps
     */
    this.remapChars = {};
    /**
     * Factor by which to multiply italic correction for computation of delta in munderover
     */
    this.skewIcFactor = 0.75;
    let CLASS = this.constructor;
    this.options = userOptions(defaultOptions({}, CLASS.OPTIONS), options);
    this.params = { ...CLASS.defaultParams };
    this.sizeVariants = [...CLASS.defaultSizeVariants];
    this.stretchVariants = [...CLASS.defaultStretchVariants];
    this.cssFontMap = { ...CLASS.defaultCssFonts };
    for (const name of Object.keys(this.cssFontMap)) {
      if (this.cssFontMap[name][0] === "unknown") {
        this.cssFontMap[name][0] = this.options.unknownFamily;
      }
    }
    this.cssFamilyPrefix = CLASS.defaultCssFamilyPrefix;
    this.createVariants(CLASS.defaultVariants);
    this.defineDelimiters(CLASS.defaultDelimiters);
    for (const name of Object.keys(CLASS.defaultChars)) {
      this.defineChars(name, CLASS.defaultChars[name]);
    }
    this.defineRemap("accent", CLASS.defaultAccentMap);
    this.defineRemap("mo", CLASS.defaultMoMap);
    this.defineRemap("mn", CLASS.defaultMnMap);
  }
  static {
    /**
     * Options for the font
     */
    this.OPTIONS = {
      unknownFamily: "serif"
      // Should use 'monospace' with LiteAdaptor
    };
  }
  static {
    /**
     * The name of the output jax this font data is for (used by extensions)
     */
    this.JAX = "common";
  }
  static {
    /**
     * The name of the font that is being defined (used by extensions)
     */
    this.NAME = "";
  }
  static {
    /**
     *  The standard variants to define
     */
    this.defaultVariants = [
      ["normal"],
      ["bold", "normal"],
      ["italic", "normal"],
      ["bold-italic", "italic", "bold"],
      ["double-struck", "bold"],
      ["fraktur", "normal"],
      ["bold-fraktur", "bold", "fraktur"],
      ["script", "italic"],
      ["bold-script", "bold-italic", "script"],
      ["sans-serif", "normal"],
      ["bold-sans-serif", "bold", "sans-serif"],
      ["sans-serif-italic", "italic", "sans-serif"],
      ["sans-serif-bold-italic", "bold-italic", "bold-sans-serif"],
      ["monospace", "normal"]
    ];
  }
  static {
    /**
     * The family, style, and weight to use for each variant (for unknown characters)
     * The 'unknown' family is replaced by options.unknownFamily
     */
    this.defaultCssFonts = {
      normal: ["unknown", false, false],
      bold: ["unknown", false, true],
      italic: ["unknown", true, false],
      "bold-italic": ["unknown", true, true],
      "double-struck": ["unknown", false, true],
      fraktur: ["unknown", false, false],
      "bold-fraktur": ["unknown", false, true],
      script: ["cursive", false, false],
      "bold-script": ["cursive", false, true],
      "sans-serif": ["sans-serif", false, false],
      "bold-sans-serif": ["sans-serif", false, true],
      "sans-serif-italic": ["sans-serif", true, false],
      "sans-serif-bold-italic": ["sans-serif", true, true],
      monospace: ["monospace", false, false]
    };
  }
  static {
    /**
     * The default prefix for explicit font-family settings
     */
    this.defaultCssFamilyPrefix = "";
  }
  static {
    /**
     * Variant locations in the Math Alphabnumerics block:
     *  [upper-alpha, lower-alpha, upper-Greek, lower-Greek, numbers]
     */
    this.VariantSmp = {
      bold: [119808, 119834, 120488, 120514, 120782],
      italic: [119860, 119886, 120546, 120572],
      "bold-italic": [119912, 119938, 120604, 120630],
      script: [119964, 119990],
      "bold-script": [120016, 120042],
      fraktur: [120068, 120094],
      "double-struck": [120120, 120146, , , 120792],
      "bold-fraktur": [120172, 120198],
      "sans-serif": [120224, 120250, , , 120802],
      "bold-sans-serif": [120276, 120302, 120662, 120688, 120812],
      "sans-serif-italic": [120328, 120354],
      "sans-serif-bold-italic": [120380, 120406, 120720, 120746],
      "monospace": [120432, 120458, , , 120822]
    };
  }
  static {
    /**
     * Character ranges to remap into Math Alphanumerics
     */
    this.SmpRanges = [
      [0, 65, 90],
      // Upper-case alpha
      [1, 97, 122],
      // Lower-case alpha
      [2, 913, 937],
      // Upper-case Greek
      [3, 945, 969],
      // Lower-case Greek
      [4, 48, 57]
      // Numbers
    ];
  }
  static {
    /**
     * Characters to map back top other Unicode positions
     * (holes in the Math Alphanumeric ranges)
     */
    this.SmpRemap = {
      119893: 8462,
      // PLANCK CONSTANT
      119965: 8492,
      // SCRIPT CAPITAL B
      119968: 8496,
      // SCRIPT CAPITAL E
      119969: 8497,
      // SCRIPT CAPITAL F
      119971: 8459,
      // SCRIPT CAPITAL H
      119972: 8464,
      // SCRIPT CAPITAL I
      119975: 8466,
      // SCRIPT CAPITAL L
      119976: 8499,
      // SCRIPT CAPITAL M
      119981: 8475,
      // SCRIPT CAPITAL R
      119994: 8495,
      // SCRIPT SMALL E
      119996: 8458,
      // SCRIPT SMALL G
      120004: 8500,
      // SCRIPT SMALL O
      120070: 8493,
      // BLACK-LETTER CAPITAL C
      120075: 8460,
      // BLACK-LETTER CAPITAL H
      120076: 8465,
      // BLACK-LETTER CAPITAL I
      120085: 8476,
      // BLACK-LETTER CAPITAL R
      120093: 8488,
      // BLACK-LETTER CAPITAL Z
      120122: 8450,
      // DOUBLE-STRUCK CAPITAL C
      120127: 8461,
      // DOUBLE-STRUCK CAPITAL H
      120133: 8469,
      // DOUBLE-STRUCK CAPITAL N
      120135: 8473,
      // DOUBLE-STRUCK CAPITAL P
      120136: 8474,
      // DOUBLE-STRUCK CAPITAL Q
      120137: 8477,
      // DOUBLE-STRUCK CAPITAL R
      120145: 8484
      // DOUBLE-STRUCK CAPITAL Z
    };
  }
  static {
    /**
     * Greek upper-case variants
     */
    this.SmpRemapGreekU = {
      8711: 25,
      // nabla
      1012: 17
      // theta symbol
    };
  }
  static {
    /**
     * Greek lower-case variants
     */
    this.SmpRemapGreekL = {
      977: 27,
      // theta symbol
      981: 29,
      // phi symbol
      982: 31,
      // omega symbol
      1008: 28,
      // kappa symbol
      1009: 30,
      // rho symbol
      1013: 26,
      // lunate epsilon symbol
      8706: 25
      // partial differential
    };
  }
  static {
    /**
     *  The default remappings
     */
    this.defaultAccentMap = {
      768: "ˋ",
      // grave accent
      769: "ˊ",
      // acute accent
      770: "ˆ",
      // curcumflex
      771: "˜",
      // tilde accent
      772: "ˉ",
      // macron
      774: "˘",
      // breve
      775: "˙",
      // dot
      776: "¨",
      // diaresis
      778: "˚",
      // ring above
      780: "ˇ",
      // caron
      8594: "⃗",
      8242: "'",
      8243: "''",
      8244: "'''",
      8245: "`",
      8246: "``",
      8247: "```",
      8279: "''''",
      8400: "↼",
      // combining left harpoon
      8401: "⇀",
      // combining right harpoon
      8406: "←",
      // combining left arrow
      8417: "↔",
      // combining left-right arrow
      8432: "*",
      // combining asterisk
      8411: "...",
      // combining three dots above
      8412: "....",
      // combining four dots above
      8428: "⇁",
      // combining low left harpoon
      8429: "↽",
      // combining low right harpoon
      8430: "←",
      // combining low left arrows
      8431: "→"
      // combining low right arrows
    };
  }
  static {
    /**
     * Default map for characters inside <mo>
     */
    this.defaultMoMap = {
      45: "−"
      // hyphen
    };
  }
  static {
    /**
     * Default map for characters inside <mn>
     */
    this.defaultMnMap = {
      45: "−"
      // hyphen
    };
  }
  static {
    /**
     *  The default font parameters for the font
     */
    this.defaultParams = {
      x_height: 0.442,
      quad: 1,
      num1: 0.676,
      num2: 0.394,
      num3: 0.444,
      denom1: 0.686,
      denom2: 0.345,
      sup1: 0.413,
      sup2: 0.363,
      sup3: 0.289,
      sub1: 0.15,
      sub2: 0.247,
      sup_drop: 0.386,
      sub_drop: 0.05,
      delim1: 2.39,
      delim2: 1,
      axis_height: 0.25,
      rule_thickness: 0.06,
      big_op_spacing1: 0.111,
      big_op_spacing2: 0.167,
      big_op_spacing3: 0.2,
      big_op_spacing4: 0.6,
      big_op_spacing5: 0.1,
      surd_height: 0.075,
      scriptspace: 0.05,
      nulldelimiterspace: 0.12,
      delimiterfactor: 901,
      delimitershortfall: 0.3,
      min_rule_thickness: 1.25,
      // in pixels
      separation_factor: 1.75,
      // expansion factor for spacing e.g. between accents and base
      extra_ic: 0.033
      // extra spacing for scripts (compensate for not having actual ic values)
    };
  }
  static {
    /**
     * The default delimiter data
     */
    this.defaultDelimiters = {};
  }
  static {
    /**
     * The default character data
     */
    this.defaultChars = {};
  }
  static {
    /**
     * The default variants for the fixed size stretchy delimiters
     */
    this.defaultSizeVariants = [];
  }
  static {
    /**
     * The default variants for the assembly parts for stretchy delimiters
     */
    this.defaultStretchVariants = [];
  }
  /**
   * @param {CharMap} font   The font to check
   * @param {number} n       The character to get options for
   * @return {CharOptions}   The options for the character
   */
  static charOptions(font, n) {
    const char = font[n];
    if (char.length === 3) {
      char[3] = {};
    }
    return char[3];
  }
  /**
   * Returns list of styles needed for the font
   */
  get styles() {
    return this._styles;
  }
  /**
   * Sets styles needed for that font.
   */
  set styles(style) {
    this._styles = style;
  }
  /**
   * Creates the data structure for a variant -- an object with
   *   prototype chain that includes a copy of the linked variant,
   *   and then the inherited variant chain.
   *
   *   The reason for this extra link is that for a mathvariant like
   *   bold-italic, you want to inherit from both the bold and
   *   italic variants, but the prototype chain can only inherit
   *   from one. So for bold-italic, we make an object that has a
   *   prototype consisting of a copy of the bold data, and add the
   *   italic data as the prototype chain. (Since this is a copy, we
   *   keep a record of this link so that if bold is changed later,
   *   we can update this copy. That is not needed for the prototype
   *   chain, since the prototypes are the actual objects, not
   *   copies.) We then use this bold-plus-italic object as the
   *   prototype chain for the bold-italic object
   *
   *   That means that bold-italic will first look in its own object
   *   for specifically bold-italic glyphs that are defined there,
   *   then in the copy of the bold glyphs (only its top level is
   *   copied, not its prototype chain), and then the specifically
   *   italic glyphs, and then the prototype chain for italics,
   *   which is the normal glyphs. Effectively, this means
   *   bold-italic looks for bold-italic, then bold, then italic,
   *   then normal glyphs in order to find the given character.
   *
   * @param {string} name     The new variant to create
   * @param {string} inherit  The variant to use if a character is not in this one
   * @param {string} link     A variant to search before the inherit one (but only
   *                           its top-level object).
   */
  createVariant(name, inherit = null, link = null) {
    let variant = {
      linked: [],
      chars: inherit ? Object.create(this.variant[inherit].chars) : {}
    };
    if (link && this.variant[link]) {
      Object.assign(variant.chars, this.variant[link].chars);
      this.variant[link].linked.push(variant.chars);
      variant.chars = Object.create(variant.chars);
    }
    this.remapSmpChars(variant.chars, name);
    this.variant[name] = variant;
  }
  /**
   * Create the mapping from Basic Latin and Greek blocks to
   * the Math Alphanumeric block for a given variant.
   */
  remapSmpChars(chars, name) {
    const CLASS = this.constructor;
    if (CLASS.VariantSmp[name]) {
      const SmpRemap = CLASS.SmpRemap;
      const SmpGreek = [null, null, CLASS.SmpRemapGreekU, CLASS.SmpRemapGreekL];
      for (const [i, lo, hi] of CLASS.SmpRanges) {
        const base = CLASS.VariantSmp[name][i];
        if (!base) continue;
        for (let n = lo; n <= hi; n++) {
          if (n === 930) continue;
          const smp = base + n - lo;
          chars[n] = this.smpChar(SmpRemap[smp] || smp);
        }
        if (SmpGreek[i]) {
          for (const n of Object.keys(SmpGreek[i]).map((x) => parseInt(x))) {
            chars[n] = this.smpChar(base + SmpGreek[i][n]);
          }
        }
      }
    }
    if (name === "bold") {
      chars[988] = this.smpChar(120778);
      chars[989] = this.smpChar(120779);
    }
  }
  /**
   * @param {number} n      Math Alphanumerics position for this remapping
   * @return {CharData<C>}  The character data for the remapping
   */
  smpChar(n) {
    return [, , , { smp: n }];
  }
  /**
   * Create a collection of variants
   *
   * @param {string[][]} variants  Array of [name, inherit?, link?] values for
   *                              the variants to define
   */
  createVariants(variants) {
    for (const variant of variants) {
      this.createVariant(variant[0], variant[1], variant[2]);
    }
  }
  /**
   * Defines new character data in a given variant
   *  (We use Object.assign() here rather than the spread operator since
   *  the character maps are objeccts with prototypes, and we don't
   *  want to loose those by doing {...chars} or something similar.)
   *
   * @param {string} name    The variant for these characters
   * @param {CharMap} chars  The characters to define
   */
  defineChars(name, chars) {
    let variant = this.variant[name];
    Object.assign(variant.chars, chars);
    for (const link of variant.linked) {
      Object.assign(link, chars);
    }
  }
  /**
   * Defines stretchy delimiters
   *
   * @param {DelimiterMap} delims  The delimiters to define
   */
  defineDelimiters(delims) {
    Object.assign(this.delimiters, delims);
  }
  /**
   * Defines a character remapping map
   *
   * @param {string} name     The name of the map to define or augment
   * @param {RemapMap} remap  The characters to remap
   */
  defineRemap(name, remap) {
    if (!this.remapChars.hasOwnProperty(name)) {
      this.remapChars[name] = {};
    }
    Object.assign(this.remapChars[name], remap);
  }
  /**
   * @param {number} n  The delimiter character number whose data is desired
   * @return {DelimiterData}  The data for that delimiter (or undefined)
   */
  getDelimiter(n) {
    return this.delimiters[n];
  }
  /**
   * @param {number} n  The delimiter character number whose variant is needed
   * @param {number} i  The index in the size array of the size whose variant is needed
   * @return {string}   The variant of the i-th size for delimiter n
   */
  getSizeVariant(n, i) {
    if (this.delimiters[n].variants) {
      i = this.delimiters[n].variants[i];
    }
    return this.sizeVariants[i];
  }
  /**
   * @param {number} n  The delimiter character number whose variant is needed
   * @param {number} i  The index in the stretch array of the part whose variant is needed
   * @return {string}   The variant of the i-th part for delimiter n
   */
  getStretchVariant(n, i) {
    return this.stretchVariants[this.delimiters[n].stretchv ? this.delimiters[n].stretchv[i] : 0];
  }
  /**
   * @param {string} name  The variant whose character data is being querried
   * @param {number} n     The unicode number for the character to be found
   * @return {CharData}    The data for the given character (or undefined)
   */
  getChar(name, n) {
    return this.variant[name].chars[n];
  }
  /**
   * @param {string} name   The name of the variant whose data is to be obtained
   * @return {V}            The data for the requested variant (or undefined)
   */
  getVariant(name) {
    return this.variant[name];
  }
  /**
   * @param {string} variant   The name of the variant whose data is to be obtained
   * @return {CssFontData}     The CSS data for the requested variant
   */
  getCssFont(variant) {
    return this.cssFontMap[variant] || ["serif", false, false];
  }
  /**
   * @param {string} family   The font camily to use
   * @return {string}         The family with the css prefix
   */
  getFamily(family) {
    return this.cssFamilyPrefix ? this.cssFamilyPrefix + ", " + family : family;
  }
  /**
   * @param {string} name   The name of the map to query
   * @param {number} c      The character to remap
   * @return {string}       The remapped character (or the original)
   */
  getRemappedChar(name, c) {
    const map = this.remapChars[name] || {};
    return map[c];
  }
};

// node_modules/mathjax-full/ts/output/svg/FontData.ts
var SVGFontData = class extends FontData {
  static {
    /**
     * @override
     */
    this.OPTIONS = {
      ...FontData.OPTIONS,
      dynamicPrefix: "./output/svg/fonts"
    };
  }
  static {
    /**
     * @override
     */
    this.JAX = "SVG";
  }
  /**
   * @override
   */
  static charOptions(font, n) {
    return super.charOptions(font, n);
  }
};
function AddPaths(font, paths, content) {
  for (const c of Object.keys(paths)) {
    const n = parseInt(c);
    SVGFontData.charOptions(font, n).p = paths[n];
  }
  for (const c of Object.keys(content)) {
    const n = parseInt(c);
    SVGFontData.charOptions(font, n).c = content[n];
  }
  return font;
}

export {
  expandable,
  makeArray,
  defaultOptions,
  userOptions,
  separateOptions,
  lookup,
  V,
  H,
  NOSTRETCH,
  SVGFontData,
  AddPaths
};
