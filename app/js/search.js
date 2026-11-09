/* ============================================================
   WILDTHREAD — search.js
   Smart search: parses a query into COLOUR + PRODUCT TYPE and
   matches with strict AND logic. Pure functions, no DOM access —
   also runs in Node for unit tests (see README test table).
   ============================================================ */
(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api; /* Node (tests) */
  root.WT = root.WT || {};
  root.WT.search = api;
})(typeof self !== "undefined" ? self : globalThis, function () {

  /* ---------- dictionaries ---------- */

  /* colour synonyms → colour group */
  var COLOR_GROUPS = {
    blue:   ["blue", "navy", "indigo", "denim blue", "sky blue", "sky", "light blue", "dark blue", "cobalt"],
    black:  ["black", "jet black", "pitch black", "charcoal black"],
    white:  ["white", "off white", "off-white", "ivory"],
    grey:   ["grey", "gray", "charcoal", "melange", "ash"],
    olive:  ["olive", "green", "army", "sage", "moss", "khaki green"],
    beige:  ["beige", "cream", "khaki", "ecru", "sand", "nude", "offwhite"],
    red:    ["red", "maroon", "burgundy", "cherry", "wine"],
    brown:  ["brown", "tan", "caramel", "rust", "chocolate", "coffee"],
    pink:   ["pink", "salmon", "peach", "bubblegum", "hot pink", "mauve"],
    yellow: ["yellow", "mustard", "lemon", "acid"]
  };

  /* product type synonyms → canonical type (values match products.json "type") */
  var TYPE_GROUPS = {
    "jeans":      ["jeans", "jean", "denim", "denims"],
    "t-shirt":    ["t-shirt", "tshirt", "t shirt", "tee", "tees", "tshirts", "t-shirts", "shirt", "shirts", "top"],
    "hoodie":     ["hoodie", "hoodies", "sweatshirt", "sweatshirts", "hooded"],
    "jogger":     ["jogger", "joggers", "trackpants", "track pants", "track pant", "sweatpants", "sweat pant"],
    "cargo":      ["cargo", "cargos", "cargo pants", "cargo pant", "cargoes"],
    "accessory":  ["accessory", "accessories", "cap", "caps", "hat", "hats", "bag", "bags", "backpack", "backpacks", "belt", "belts", "sock", "socks"]
  };

  /* product colour name (from products.json) → colour group */
  var PRODUCT_COLOR_TO_GROUP = {
    "white": "white", "black": "black", "grey": "grey", "charcoal": "grey",
    "light blue": "blue", "mid blue": "blue", "dark indigo": "blue", "navy": "blue", "blue": "blue",
    "sage": "olive", "olive": "olive",
    "ecru": "beige", "cream": "beige", "khaki": "beige", "beige": "beige",
    "red": "red", "salmon": "pink", "pink": "pink",
    "tan": "brown", "brown": "brown", "yellow": "yellow"
  };

  /* words that carry no colour/type meaning but are common in queries */
  var STOPWORDS = ["for", "men", "women", "man", "woman", "unisex", "the", "a", "an", "in", "of", "and", "with", "oversized", "fit", "wear"];

  /* ---------- normalisation ---------- */
  function normalize(str) {
    return String(str || "")
      .toLowerCase()
      .replace(/['’]/g, "")          /* don't -> dont */
      .replace(/[^a-z0-9\s-]/g, " ") /* strip punctuation */
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function deplural(token) {
    if (token.length > 3 && /ies$/.test(token)) return token.replace(/ies$/, "y");
    if (token.length > 3 && /es$/.test(token) && !/s$/.test(token.slice(0, -2))) return token.slice(0, -2);
    if (token.length > 2 && /s$/.test(token) && !/ss$/.test(token)) return token.slice(0, -1);
    return token;
  }

  /* longest-first list of every known phrase (multi-word before single) */
  var COLOR_PHRASES = [];
  Object.keys(COLOR_GROUPS).forEach(function (group) {
    COLOR_GROUPS[group].forEach(function (phrase) { COLOR_PHRASES.push({ phrase: phrase, group: group }); });
  });
  COLOR_PHRASES.sort(function (a, b) { return b.phrase.length - a.phrase.length; });

  var TYPE_PHRASES = [];
  Object.keys(TYPE_GROUPS).forEach(function (type) {
    TYPE_GROUPS[type].forEach(function (phrase) { TYPE_PHRASES.push({ phrase: phrase, type: type }); });
  });
  TYPE_PHRASES.sort(function (a, b) { return b.phrase.length - a.phrase.length; });

  function findGroup(dict, tok) {
    var key = Object.keys(dict).find(function (k) { return dict[k].indexOf(tok) !== -1; });
    return key || null;
  }

  /* ---------- parseQuery: query string → { color, type, freeText, tokens } ---------- */
  function parseQuery(raw) {
    var q = normalize(raw);
    var result = { raw: raw || "", query: q, color: null, colorPhrase: null, type: null, typePhrase: null, freeText: [], tokens: q.split(" ").filter(Boolean) };
    if (!q) return result;

    var remaining = " " + q + " ";

    /* colour phrases first (longest match wins): "light blue jeans" → blue + jeans */
    for (var i = 0; i < COLOR_PHRASES.length; i++) {
      var cp = COLOR_PHRASES[i];
      var needle = " " + cp.phrase + " ";
      if (remaining.indexOf(needle) !== -1) {
        result.color = cp.group;
        result.colorPhrase = cp.phrase;
        remaining = remaining.replace(needle, " ");
        break;
      }
    }

    /* type phrases */
    for (var j = 0; j < TYPE_PHRASES.length; j++) {
      var tp = TYPE_PHRASES[j];
      var tneedle = " " + tp.phrase + " ";
      if (remaining.indexOf(tneedle) !== -1) {
        result.type = tp.type;
        result.typePhrase = tp.phrase;
        remaining = remaining.replace(tneedle, " ");
        break;
      }
    }

    /* de-pluralised single-token fallback ("hoodies" is listed, but this catches
       anything missed, e.g. an odd plural or spelling variant) */
    if (!result.color || !result.type) {
      remaining.split(" ").filter(Boolean).forEach(function (tok) {
        var t = deplural(tok);
        if (!result.color) {
          var g = findGroup(COLOR_GROUPS, tok) || findGroup(COLOR_GROUPS, t);
          if (g) { result.color = g; result.colorPhrase = tok; }
        }
        if (!result.type) {
          var ty = findGroup(TYPE_GROUPS, tok) || findGroup(TYPE_GROUPS, t);
          if (ty) { result.type = ty; result.typePhrase = tok; }
        }
      });
      /* scrub detected single tokens out of the free-text remainder */
      if (result.colorPhrase) remaining = remaining.replace(new RegExp("(^|\\s)" + result.colorPhrase + "(\\s|$)"), " ");
      if (result.typePhrase) remaining = remaining.replace(new RegExp("(^|\\s)" + result.typePhrase + "(\\s|$)"), " ");
    }

    result.freeText = remaining.split(" ").filter(Boolean).filter(function (w) {
      return STOPWORDS.indexOf(w) === -1;
    });
    return result;
  }

  /* ---------- product → colour group ---------- */
  function colorGroupOf(product) {
    var name = (product.colors && product.colors[0] && product.colors[0].name) || "";
    return PRODUCT_COLOR_TO_GROUP[name.toLowerCase()] || null;
  }

  /* ---------- matchProducts: strict AND ---------- */
  function matchProducts(products, parsed) {
    var p = typeof parsed === "string" ? parseQuery(parsed) : parsed;
    if (!p.query) return [];

    /* colour + type → strict AND. A black jean must NEVER appear for "blue jeans". */
    if (p.color && p.type) {
      return products.filter(function (prod) {
        return prod.type === p.type && colorGroupOf(prod) === p.color;
      });
    }
    /* only colour → all products of that colour group */
    if (p.color) {
      return products.filter(function (prod) { return colorGroupOf(prod) === p.color; });
    }
    /* only type → all products of that type */
    if (p.type) {
      return products.filter(function (prod) { return prod.type === p.type; });
    }
    /* free text → name, tags, description */
    if (p.freeText.length) {
      return products.filter(function (prod) {
        var hay = normalize(prod.name + " " + (prod.tags || []).join(" ") + " " + prod.description + " " + prod.fabric);
        return p.freeText.every(function (w) { return hay.indexOf(w) !== -1; });
      });
    }
    return [];
  }

  /* ---------- getSuggestions: ranked fallback when strict match is empty ----------
     1. same type, other colours   2. same colour, other types   3. best sellers */
  function getSuggestions(products, parsed, limit) {
    var p = typeof parsed === "string" ? parseQuery(parsed) : parsed;
    limit = limit || 8;
    var out = { sections: [], items: [] };

    function push(list, title) {
      if (!list.length) return;
      out.sections.push({ title: title, items: list.slice(0, limit) });
    }

    if (p.type) {
      push(products.filter(function (prod) {
        return prod.type === p.type && (!p.color || colorGroupOf(prod) !== p.color);
      }), typeLabel(p.type) + " in other colours");
    }
    if (p.color) {
      push(products.filter(function (prod) {
        return colorGroupOf(prod) === p.color && (!p.type || prod.type !== p.type);
      }), capitalise(p.color) + " styles");
    }
    if (!out.sections.length) {
      var best = products.filter(function (prod) { return (prod.tags || []).indexOf("bestseller") !== -1; });
      push(best.length ? best : products.slice(0, limit), "Best sellers");
    }

    var seen = {};
    out.sections.forEach(function (s) {
      s.items.forEach(function (p2) { if (!seen[p2.id] && out.items.length < limit) { seen[p2.id] = 1; out.items.push(p2); } });
    });
    return out;
  }

  function typeLabel(type) {
    return { "jeans": "Jeans", "t-shirt": "T-Shirts", "hoodie": "Hoodies", "jogger": "Joggers", "cargo": "Cargos", "accessory": "Accessories" }[type] || type;
  }
  function capitalise(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  return {
    parseQuery: parseQuery,
    matchProducts: matchProducts,
    getSuggestions: getSuggestions,
    colorGroupOf: colorGroupOf,
    normalize: normalize,
    COLOR_GROUPS: COLOR_GROUPS,
    TYPE_GROUPS: TYPE_GROUPS,
    typeLabel: typeLabel
  };
});
