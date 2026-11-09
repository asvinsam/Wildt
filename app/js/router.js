/* ============================================================
   WILDTHREAD — router.js
   Hash router: #/  #/category/:slug  #/product/:id  #/search?q=
   #/wishlist  #/checkout  #/order/:id   (+ #/#section anchors)
   Renders into #view-route; home stays static in #view-home.
   Plain script — attaches to window.WT.router
   ============================================================ */
(function () {
  "use strict";
  window.WT = window.WT || {};

  var router = {};
  WT.router = router;

  var $, $$;
  function ui$() { $ = WT.ui.$; $$ = WT.ui.$$; }

  var homeEl, routeEl;
  var catState = { slug: null, sizes: [], colors: [], maxPrice: null, inStock: false, sort: "featured" };

  /* ---------- helpers ---------- */
  function esc(s) { return WT.esc(s); }
  function money(n) { return WT.money(n); }

  function showHome(anchor) {
    routeEl.hidden = true;
    homeEl.hidden = false;
    document.title = WT.config.brand + " — " + WT.config.tagline + " | Loud Indian Streetwear";
    var main = $("#view-home");
    if (anchor) {
      var t = document.getElementById(anchor);
      if (t) {
        setTimeout(function () { t.scrollIntoView({ behavior: "smooth", block: "start" }); }, 60);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    }
    WT.ui.observeReveals(homeEl);
  }

  function showRoute(html, title, focusSel) {
    homeEl.hidden = true;
    routeEl.hidden = false;
    routeEl.innerHTML = html;
    document.title = title + " | " + WT.config.brand;
    window.scrollTo({ top: 0, behavior: "auto" });
    WT.ui.observeReveals(routeEl);
    var f = focusSel ? $(focusSel, routeEl) : $("h1, h2, [data-autofocus]", routeEl);
    if (f) { f.setAttribute("tabindex", "-1"); f.focus({ preventScroll: true }); }
  }

  function crumb(items) {
    return '<nav class="crumb" aria-label="Breadcrumb"><ol>' +
      items.map(function (it, i) {
        var last = i === items.length - 1;
        return "<li>" + (last
          ? '<span aria-current="page">' + esc(it.label) + "</span>"
          : '<a href="' + esc(it.href) + '">' + esc(it.label) + "</a>") + "</li>";
      }).join("") + "</ol></nav>";
  }

  /* ============================================================
     CATEGORY PAGE
     ============================================================ */
  function colorChipStyle(hex) { return 'style="--sw:' + esc(hex) + '"'; }

  function categoryColors(products) {
    var seen = {}, out = [];
    products.forEach(function (p) {
      (p.colors || []).forEach(function (c) {
        var g = WT.search.colorGroupOf(p);
        if (!seen[c.name]) { seen[c.name] = 1; out.push(c); }
      });
    });
    return out;
  }

  function applyFilters(products) {
    var s = catState;
    return products.filter(function (p) {
      if (s.inStock && WT.data.totalStock(p) === 0) return false;
      if (s.maxPrice != null && p.price > s.maxPrice) return false;
      if (s.colors.length) {
        var hit = (p.colors || []).some(function (c) { return s.colors.indexOf(c.name) !== -1; });
        if (!hit) return false;
      }
      if (s.sizes.length) {
        var ok = s.sizes.some(function (sz) { return (p.stock && p.stock[sz] || 0) > 0; });
        if (!ok) return false;
      }
      return true;
    });
  }

  function applySort(products) {
    var list = products.slice();
    switch (catState.sort) {
      case "price-asc": list.sort(function (a, b) { return a.price - b.price; }); break;
      case "price-desc": list.sort(function (a, b) { return b.price - a.price; }); break;
      case "newest": list.sort(function (a, b) { return (b.createdAt || "").localeCompare(a.createdAt || ""); }); break;
      default:
        list.sort(function (a, b) {
          var ab = (b.tags || []).indexOf("bestseller") !== -1, bb = (a.tags || []).indexOf("bestseller") !== -1;
          if (ab !== bb) return ab - bb;
          return (b.tags || []).length - (a.tags || []).length;
        });
    }
    return list;
  }

  function renderCategoryGrid() {
    var grid = $("#route-grid"), countEl = $("#route-count");
    if (!grid) return;
    var cat = WT.CATEGORIES.filter(function (c) { return c.slug === catState.slug; })[0];
    var base = WT.data.byCategory(cat.slug);
    var list = applySort(applyFilters(base));
    if (countEl) countEl.textContent = list.length + (list.length === 1 ? " style" : " styles");
    if (!list.length) {
      grid.innerHTML = '<div class="empty-state">' +
        '<p class="empty-state__big">Nothing matches those filters.</p>' +
        "<p>Loosen up a filter or two — the heat is in there.</p>" +
        '<button class="btn btn--acid" type="button" data-clear-filters>Clear filters</button>' +
        "</div>";
      return;
    }
    grid.innerHTML = list.map(function (p, i) { return WT.ui.productCard(p, { eager: i < 4 }); }).join("");
    WT.ui.refreshWishButtons();
    WT.ui.observeReveals(grid);
  }

  function viewCategory(slug) {
    var cat = WT.CATEGORIES.filter(function (c) { return c.slug === slug; })[0];
    if (!cat) { viewNotFound(); return; }
    catState = { slug: slug, sizes: [], colors: [], maxPrice: null, inStock: false, sort: "featured" };
    var products = WT.data.byCategory(slug);
    var allSizes = [];
    products.forEach(function (p) { (p.sizes || []).forEach(function (s) { if (allSizes.indexOf(s) === -1) allSizes.push(s); }); });
    var sizeOrder = { XS: 1, S: 2, M: 3, L: 4, XL: 5, XXL: 6, Free: 99 };
    allSizes.sort(function (a, b) {
      var na = parseInt(a, 10), nb = parseInt(b, 10);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return (sizeOrder[a] || 50) - (sizeOrder[b] || 50);
    });
    var colors = categoryColors(products);
    var maxP = products.reduce(function (m, p) { return Math.max(m, p.price); }, 0);
    var minP = products.reduce(function (m, p) { return Math.min(m, p.price); }, Infinity);

    var html = '' +
    '<section class="route route--category" aria-labelledby="route-title">' +
      crumb([{ label: "Home", href: "#/" }, { label: "Shop", href: "#/#categories" }, { label: cat.label }]) +
      '<header class="route__head">' +
        "<div>" +
          '<h1 class="route__title" id="route-title">' + esc(cat.label) + "</h1>" +
          '<p class="route__count" id="route-count" aria-live="polite">' + products.length + " styles</p>" +
        "</div>" +
        '<button class="btn btn--ghost btn--sm filters-toggle" type="button" data-filters-toggle aria-expanded="false">Filters</button>' +
      "</header>" +
      '<div class="shop-layout">' +
        '<aside class="filters" id="filters" aria-label="Product filters">' +
          '<div class="filters__head"><h2>Filters</h2><button class="filters__clear" type="button" data-clear-filters>Clear all</button></div>' +
          '<fieldset class="filters__group"><legend>Size</legend><div class="filters__row">' +
            allSizes.map(function (s) {
              return '<button type="button" class="size-chip" data-filter-size="' + esc(s) + '" aria-pressed="false">' + esc(s) + "</button>";
            }).join("") +
          "</div></fieldset>" +
          '<fieldset class="filters__group"><legend>Colour</legend><div class="filters__row">' +
            colors.map(function (c) {
              return '<button type="button" class="swatch-chip" data-filter-color="' + esc(c.name) + '" aria-pressed="false" title="' + esc(c.name) + '"><span class="swatch-dot" ' + colorChipStyle(c.hex) + '></span>' + esc(c.name) + "</button>";
            }).join("") +
          "</div></fieldset>" +
          '<fieldset class="filters__group"><legend>Max price</legend>' +
            '<div class="filters__price">' +
              '<input type="range" id="filter-price" min="' + minP + '" max="' + maxP + '" step="50" value="' + maxP + '" aria-describedby="filter-price-out">' +
              '<output id="filter-price-out" for="filter-price">Up to ' + money(maxP) + "</output>" +
            "</div>" +
          "</fieldset>" +
          '<fieldset class="filters__group"><legend>Availability</legend>' +
            '<label class="filters__check"><input type="checkbox" id="filter-stock"> <span>In stock only</span></label>' +
          "</fieldset>" +
        "</aside>" +
        '<div class="shop-main">' +
          '<div class="sort-bar">' +
            '<label for="sort-select">Sort</label>' +
            '<select id="sort-select">' +
              '<option value="featured">Featured</option>' +
              '<option value="price-asc">Price: low to high</option>' +
              '<option value="price-desc">Price: high to low</option>' +
              '<option value="newest">Newest</option>' +
            "</select>" +
          "</div>" +
          '<div class="product-grid" id="route-grid"></div>' +
        "</div>" +
      "</div>" +
    "</section>";

    showRoute(html, cat.label + " — Shop " + cat.label, "#route-title");
    bindCategoryControls();
    renderCategoryGrid();
  }

  function bindCategoryControls() {
    var root = routeEl;
    $$("[data-filter-size]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        var s = b.getAttribute("data-filter-size");
        var i = catState.sizes.indexOf(s);
        if (i === -1) catState.sizes.push(s); else catState.sizes.splice(i, 1);
        b.classList.toggle("is-on", i === -1);
        b.setAttribute("aria-pressed", i === -1 ? "true" : "false");
        renderCategoryGrid();
      });
    });
    $$("[data-filter-color]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        var c = b.getAttribute("data-filter-color");
        var i = catState.colors.indexOf(c);
        if (i === -1) catState.colors.push(c); else catState.colors.splice(i, 1);
        b.classList.toggle("is-on", i === -1);
        b.setAttribute("aria-pressed", i === -1 ? "true" : "false");
        renderCategoryGrid();
      });
    });
    var price = $("#filter-price", root), out = $("#filter-price-out", root);
    if (price) price.addEventListener("input", function () {
      catState.maxPrice = parseInt(price.value, 10);
      if (out) out.textContent = "Up to " + money(catState.maxPrice);
      renderCategoryGrid();
    });
    var stock = $("#filter-stock", root);
    if (stock) stock.addEventListener("change", function () {
      catState.inStock = stock.checked;
      renderCategoryGrid();
    });
    var sort = $("#sort-select", root);
    if (sort) sort.addEventListener("change", function () {
      catState.sort = sort.value;
      renderCategoryGrid();
    });
    $$("[data-clear-filters]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        catState.sizes = []; catState.colors = []; catState.maxPrice = null; catState.inStock = false;
        $$("[data-filter-size], [data-filter-color]", root).forEach(function (x) {
          x.classList.remove("is-on"); x.setAttribute("aria-pressed", "false");
        });
        var pr = $("#filter-price", root);
        if (pr) { pr.value = pr.max; if (out) out.textContent = "Up to " + money(parseInt(pr.max, 10)); }
        var st = $("#filter-stock", root); if (st) st.checked = false;
        renderCategoryGrid();
      });
    });
    var ft = $("[data-filters-toggle]", root);
    if (ft) ft.addEventListener("click", function () {
      var f = $("#filters", root);
      var open = f.classList.toggle("is-open");
      ft.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ============================================================
     PRODUCT DETAIL
     ============================================================ */
  function viewProduct(id) {
    var p = WT.data.byId(id);
    if (!p) { viewNotFound(); return; }
    var pct = WT.data.discountPct(p);
    var soldOut = WT.data.totalStock(p) === 0;
    var front = WT.ui.img(p.images[0]);
    var back = WT.ui.img(p.images[1] || p.images[0]);
    var catLabel = WT.data.categoryLabel(p.category);
    var related = WT.data.byCategory(p.category).filter(function (x) { return x.id !== p.id; }).slice(0, 4);

    var html = '' +
    '<section class="route route--product" aria-labelledby="route-title">' +
      crumb([{ label: "Home", href: "#/" }, { label: catLabel, href: "#/category/" + p.category }, { label: p.name }]) +
      '<div class="pd">' +
        '<div class="pd__gallery">' +
          '<div class="pd__stage">' +
            '<img id="pd-main" src="' + esc(front) + '" alt="' + esc(p.name) + " — colour " + esc(p.colors[0].name) + '" width="720" height="900" fetchpriority="high">' +
            (soldOut ? '<span class="product-card__oos">SOLD OUT</span>' : "") +
          "</div>" +
          '<div class="pd__thumbs" role="group" aria-label="Product images">' +
            '<button type="button" class="pd__thumb is-on" data-thumb="' + esc(front) + '"><img src="' + esc(front) + '" alt="Front view" width="96" height="120" loading="lazy"></button>' +
            '<button type="button" class="pd__thumb" data-thumb="' + esc(back) + '"><img src="' + esc(back) + '" alt="Back view" width="96" height="120" loading="lazy"></button>' +
          "</div>" +
        "</div>" +
        '<div class="pd__info" data-sel-size="">' +
          '<p class="pd__cat">' + esc(catLabel) + "</p>" +
          '<h1 class="pd__name" id="route-title">' + esc(p.name) + "</h1>" +
          '<p class="pd__price"><strong>' + money(p.price) + "</strong>" +
            (pct > 0 ? "<s>" + money(p.mrp) + "</s><em>" + pct + "% OFF</em>" : "") +
          "</p>" +
          '<p class="pd__color">Colour: <span class="swatch-dot" style="--sw:' + esc(p.colors[0].hex) + '"></span> ' + esc(p.colors[0].name) + "</p>" +
          '<div class="pd__sizes">' +
            '<div class="pd__sizes-head"><h2>Select size</h2><button type="button" class="pd__chart-btn" data-size-chart>Size chart</button></div>' +
            '<div class="product-card__sizes" role="group" aria-label="Sizes">' +
              (p.sizes || []).map(function (s) {
                var st = (p.stock && p.stock[s]) || 0;
                return '<button type="button" class="size-chip' + (st <= 0 ? " is-off" : "") + '" data-size-pick="' + esc(s) + '" data-pid="' + esc(p.id) + '"' + (st <= 0 ? " disabled" : "") + ">" + esc(s) + "</button>";
              }).join("") +
            "</div>" +
            '<p class="pd__stock" data-stock-note>' + (soldOut ? "Sold out — check the next drop." : stockNote(p)) + "</p>" +
          "</div>" +
          '<div class="pd__qty">' +
            '<button type="button" data-pd-qty="-1" aria-label="Decrease quantity">' + WT.ui.ICONS.minus + "</button>" +
            '<b data-qty-val aria-live="polite">1</b>' +
            '<button type="button" data-pd-qty="1" aria-label="Increase quantity">' + WT.ui.ICONS.plus + "</button>" +
          "</div>" +
          '<div class="pd__actions">' +
            '<button type="button" class="btn btn--dark pd__add" data-add-cart="' + esc(p.id) + '"' + (soldOut ? " disabled" : "") + ">" + (soldOut ? "Sold Out" : "Add to Cart") + "</button>" +
            '<button type="button" class="btn btn--acid pd__buy" data-buy-now="' + esc(p.id) + '"' + (soldOut ? " disabled" : "") + ">Buy Now</button>" +
            '<button type="button" class="wish-btn wish-btn--lg' + (WT.store.inWishlist(p.id) ? " is-on" : "") + '" data-wish="' + esc(p.id) + '" aria-pressed="' + WT.store.inWishlist(p.id) + '" aria-label="Toggle wishlist">' + (WT.store.inWishlist(p.id) ? WT.ui.ICONS.heartFill : WT.ui.ICONS.heart) + "</button>" +
          "</div>" +
          '<div class="pd__panels">' +
            '<details open><summary>Description</summary><p>' + esc(p.description) + "</p></details>" +
            "<details><summary>Fabric &amp; care</summary><p>" + esc(p.fabric) + "</p></details>" +
            '<details><summary>Shipping &amp; returns</summary><p>Free shipping over ' + money(WT.config.freeShippingAbove) + " (else " + money(WT.config.shippingFee) + '). Dispatched in 24–48h, delivered in 3–6 days. 7-day easy returns — tags on, no questions.</p></details>' +
          "</div>" +
        "</div>" +
      "</div>" +
      (related.length ?
        '<section class="pd__related" aria-labelledby="rel-h">' +
          '<h2 id="rel-h" class="section__title section__title--sm">Goes loud with</h2>' +
          '<div class="product-grid product-grid--4">' + related.map(function (r) { return WT.ui.productCard(r); }).join("") + "</div>" +
        "</section>" : "") +
    "</section>";

    showRoute(html, p.name, "#route-title");
    bindProduct(p);
  }

  function stockNote(p) {
    var total = WT.data.totalStock(p);
    if (total <= 8) return "Low stock — only " + total + " left across sizes.";
    return "In stock — ships in 24–48h.";
  }

  function bindProduct(p) {
    var root = routeEl;
    /* thumbs */
    $$("[data-thumb]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        var main = $("#pd-main", root);
        if (main) main.src = b.getAttribute("data-thumb");
        $$("[data-thumb]", root).forEach(function (x) { x.classList.remove("is-on"); });
        b.classList.add("is-on");
      });
    });
    /* qty */
    $$("[data-pd-qty]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        var v = $("[data-qty-val]", root);
        var n = (parseInt(v.textContent, 10) || 1) + parseInt(b.getAttribute("data-pd-qty"), 10);
        v.textContent = Math.max(1, Math.min(9, n));
      });
    });
    /* size chart modal (simple dialog) */
    var chartBtn = $("[data-size-chart]", root);
    if (chartBtn) chartBtn.addEventListener("click", function () {
      var isJeans = p.type === "jeans";
      var head = isJeans
        ? ["Size", "Waist (in)", "Hip (in)", "Length (in)"]
        : ["Size", "Chest (in)", "Length (in)", "Shoulder (in)"];
      var rows = isJeans
        ? [["28", "28", "36", "39"], ["30", "30", "38", "40"], ["32", "32", "40", "41"], ["34", "34", "42", "41"], ["36", "36", "44", "42"]]
        : [["S", "40", "27", "20"], ["M", "42", "28", "21"], ["L", "44", "29", "22"], ["XL", "46", "30", "23"], ["XXL", "48", "31", "24"]];
      var table = "<table class='size-table'><thead><tr>" + head.map(function (h) { return "<th>" + h + "</th>"; }).join("") + "</tr></thead><tbody>" +
        rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>";
      openModal("Size chart — " + p.name, "<p class='modal-sub'>Oversized fit: take your usual size for the intended drape, size down for a regular fit.</p>" + table);
    });
    /* buy now */
    var buy = $("[data-buy-now]", root);
    if (buy) buy.addEventListener("click", function () {
      var pd = $(".pd", root);
      var size = pd && pd.dataset.selSize;
      if (!size) {
        if (p.sizes.length === 1) size = p.sizes[0];
        else { WT.ui.toast("Select a size first.", "warn"); return; }
      }
      var qty = parseInt(($("[data-qty-val]", root) || {}).textContent, 10) || 1;
      var res = WT.store.addToCart(p.id, size, qty);
      if (res.ok) {
        WT.ui.updateBadges();
        location.hash = "#/checkout";
      } else if (res.reason === "max") WT.ui.toast("Only " + res.max + " in stock.", "warn");
      else WT.ui.toast("That size is unavailable.", "warn");
    });
  }

  /* simple accessible modal */
  function openModal(title, bodyHtml) {
    closeModal();
    var ov = document.createElement("div");
    ov.className = "modal-ov";
    ov.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
      '<div class="modal__head"><h2>' + esc(title) + '</h2><button type="button" class="modal__close" aria-label="Close">' + WT.ui.ICONS.close + "</button></div>" +
      '<div class="modal__body">' + bodyHtml + "</div></div>";
    document.body.appendChild(ov);
    document.body.classList.add("no-scroll");
    var closeBtn = $(".modal__close", ov);
    closeBtn.focus();
    ov.addEventListener("click", function (e) { if (e.target === ov || e.target.closest(".modal__close")) closeModal(); });
    ov.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
      if (e.key === "Tab") WT.ui.trapFocus($(".modal", ov), e);
    });
  }
  function closeModal() {
    var ov = $(".modal-ov");
    if (ov) ov.remove();
    document.body.classList.remove("no-scroll");
  }
  router.closeModal = closeModal;

  /* ============================================================
     SEARCH RESULTS
     ============================================================ */
  function viewSearch(query) {
    var q = (query || "").trim();
    var parsed = WT.search.parseQuery(q);
    var all = WT.data.all();
    var matches = q ? WT.search.matchProducts(all, parsed) : [];

    var chips = [];
    if (parsed.color) chips.push({ label: "Colour: " + parsed.colorPhrase, key: "color" });
    if (parsed.type) chips.push({ label: "Type: " + WT.search.typeLabel(parsed.type), key: "type" });

    var html = "" +
    '<section class="route route--search" aria-labelledby="route-title">' +
      crumb([{ label: "Home", href: "#/" }, { label: "Search" }]) +
      '<header class="route__head"><div>' +
        '<h1 class="route__title" id="route-title">Search</h1>' +
        '<p class="route__count" aria-live="polite">' +
          (q ? matches.length + ' result' + (matches.length === 1 ? "" : "s") + ' for &ldquo;' + esc(q) + '&rdquo;' : "Type to search the whole drop") +
        "</p>" +
      "</div></header>" +
      '<form class="search-again" id="search-again" role="search">' +
        '<label class="sr-only" for="search-again-input">Search products</label>' +
        '<input id="search-again-input" type="search" value="' + esc(q) + '" placeholder="Try: blue jeans, black hoodie, caps&hellip;">' +
        '<button class="btn btn--dark btn--sm" type="submit">Search</button>' +
      "</form>" +
      (chips.length ? '<div class="search-chips" aria-label="How we read your search">' +
        "<span>We read that as:</span>" + chips.map(function (c) {
          return '<span class="chip">' + esc(c.label) + '<button type="button" data-chip-remove="' + c.key + '" aria-label="Remove ' + esc(c.label) + ' filter">&times;</button></span>';
        }).join("") + "</div>" : "");

    if (q && matches.length) {
      html += '<div class="product-grid" id="route-grid">' +
        matches.map(function (p, i) { return WT.ui.productCard(p, { eager: i < 4 }); }).join("") + "</div>";
    } else if (q) {
      var sugg = WT.search.getSuggestions(all, parsed, 8);
      html += '<div class="nomatch">' +
        '<p class="nomatch__big">We couldn&rsquo;t find &ldquo;' + esc(q) + '&rdquo; right now.</p>' +
        "<p>You could try our other products:</p>";
      sugg.sections.forEach(function (sec) {
        if (!sec.items.length) return;
        html += '<section class="nomatch__sec" aria-label="' + esc(sec.title) + '">' +
          "<h2>" + esc(sec.title) + "</h2>" +
          '<div class="product-grid product-grid--4">' + sec.items.map(function (p) { return WT.ui.productCard(p); }).join("") + "</div>" +
          "</section>";
      });
      html += '<div class="nomatch__cats"><h2>Browse all categories</h2><div class="nomatch__btns">' +
        WT.CATEGORIES.map(function (c) { return '<a class="btn btn--ghost btn--sm" href="#/category/' + c.slug + '">' + esc(c.label) + "</a>"; }).join("") +
        "</div></div></div>";
    } else {
      html += '<div class="nomatch__cats"><div class="nomatch__btns">' +
        WT.CATEGORIES.map(function (c) { return '<a class="btn btn--ghost btn--sm" href="#/category/' + c.slug + '">' + esc(c.label) + "</a>"; }).join("") +
        "</div></div>";
    }
    html += "</section>";

    showRoute(html, 'Search: "' + q + '"', "#search-again-input");

    var form = $("#search-again", routeEl);
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = $("#search-again-input", routeEl).value.trim();
      if (v) location.hash = "#/search?q=" + encodeURIComponent(v);
    });
    $$("[data-chip-remove]", routeEl).forEach(function (b) {
      b.addEventListener("click", function () {
        var key = b.getAttribute("data-chip-remove");
        var np = WT.search.parseQuery(q);
        var next = key === "color" ? (np.typePhrase || "") : (np.colorPhrase || "");
        if (!next) next = key === "color" ? (np.type || "") : (np.color || "");
        location.hash = "#/search?q=" + encodeURIComponent(next.trim());
      });
    });
  }

  /* ============================================================
     WISHLIST
     ============================================================ */
  function viewWishlist() {
    var ids = WT.store.wishlist();
    var items = ids.map(function (id) { return WT.data.byId(id); }).filter(Boolean);
    var html = "" +
    '<section class="route route--wishlist" aria-labelledby="route-title">' +
      crumb([{ label: "Home", href: "#/" }, { label: "Wishlist" }]) +
      '<header class="route__head"><div>' +
        '<h1 class="route__title" id="route-title">Wishlist</h1>' +
        '<p class="route__count">' + items.length + (items.length === 1 ? " item" : " items") + "</p>" +
      "</div></header>";
    if (!items.length) {
      html += '<div class="empty-state">' +
        '<p class="empty-state__big">Nothing saved yet.</p>' +
        "<p>Tap the heart on anything loud — it&rsquo;ll wait for you here.</p>" +
        '<a class="btn btn--acid" href="#/#new">Shop new arrivals</a>' +
        "</div>";
    } else {
      html += '<div class="wish-grid">' + items.map(function (p) {
        return WT.ui.productCard(p) ;
      }).join("") + "</div>";
    }
    html += "</section>";
    showRoute(html, "Wishlist", "#route-title");
    WT.ui.refreshWishButtons();
  }

  /* ============================================================
     ORDER CONFIRMATION
     ============================================================ */
  function viewOrder(orderId) {
    var o = WT.store.orderById(orderId);
    if (!o) { viewNotFound(); return; }
    var html = "" +
    '<section class="route route--order" aria-labelledby="route-title">' +
      '<div class="order-ok">' +
        '<p class="order-ok__eyebrow">' + WT.ui.ICONS.check + " Order placed</p>" +
        '<h1 id="route-title">You&rsquo;re in, legend.</h1>' +
        '<p class="order-ok__id">Order ID: <strong>' + esc(o.id) + "</strong></p>" +
        '<p class="demo-note">' + WT.ui.ICONS.tag + " Demo checkout: no payment is taken.</p>" +
        '<div class="order-ok__grid">' +
          '<div class="order-ok__box"><h2>Items</h2><ul>' +
            o.items.map(function (it) {
              return "<li><span>" + esc(it.name) + " · " + esc(it.size) + " × " + it.qty + "</span><b>" + money(it.price * it.qty) + "</b></li>";
            }).join("") +
          "</ul>" +
          '<dl class="totals">' +
            "<div><dt>Subtotal</dt><dd>" + money(o.totals.subtotal) + "</dd></div>" +
            (o.totals.discount > 0 ? "<div class='totals__off'><dt>Coupon</dt><dd>−" + money(o.totals.discount) + "</dd></div>" : "") +
            "<div><dt>Shipping</dt><dd>" + (o.totals.shipping === 0 ? "FREE" : money(o.totals.shipping)) + "</dd></div>" +
            '<div class="totals__grand"><dt>Total</dt><dd>' + money(o.totals.total) + "</dd></div>" +
          "</dl></div>" +
          '<div class="order-ok__box"><h2>Deliver to</h2>' +
            "<p><strong>" + esc(o.customer.name) + "</strong><br>" +
            esc(o.customer.address) + "<br>" +
            esc(o.customer.city) + ", " + esc(o.customer.state) + " — " + esc(o.customer.pin) + "<br>" +
            esc(o.customer.phone) + "<br>" + esc(o.customer.email) + "</p>" +
            "<p class='order-ok__eta'>Estimated delivery: <strong>" + esc(o.eta) + "</strong><br>Payment: " + esc(o.payment === "cod" ? "Cash on delivery" : "Pay online (demo)") + "</p>" +
          "</div>" +
        "</div>" +
        '<div class="order-ok__cta"><a class="btn btn--acid" href="#/">Back to the noise</a>' +
        '<a class="btn btn--ghost" href="#/#new">Keep shopping</a></div>' +
      "</div>" +
    "</section>";
    showRoute(html, "Order " + o.id, "#route-title");
  }

  /* ============================================================
     404
     ============================================================ */
  function viewNotFound() {
    var html = "" +
    '<section class="route route--404" aria-labelledby="route-title">' +
      '<div class="empty-state empty-state--tall">' +
        '<p class="empty-state__big">404 — that page ghosted us.</p>' +
        "<p>The link is broken or the drop sold out in a past life.</p>" +
        '<a class="btn btn--acid" href="#/">Take me home</a>' +
      "</div>" +
    "</section>";
    showRoute(html, "Page not found", ".empty-state__big");
  }

  /* ============================================================
     ROUTE TABLE
     ============================================================ */
  function parseHash() {
    var h = location.hash || "#/";
    if (h.charAt(0) === "#") h = h.slice(1);
    if (h.charAt(0) !== "/") h = "/" + h;
    var qIdx = h.indexOf("?");
    var query = "";
    if (qIdx !== -1) { query = h.slice(qIdx + 1); h = h.slice(0, qIdx); }
    return { path: h, query: query };
  }

  router.dispatch = function () {
    ui$();
    homeEl = homeEl || $("#view-home");
    routeEl = routeEl || $("#view-route");
    if (!routeEl) return;
    closeModal();
    WT.ui.closeSearch();
    WT.ui.closeCart();
    WT.ui.closeMenu();

    var h = parseHash();
    var path = h.path;

    /* anchor-style: #/#section */
    if (path.indexOf("/#") === 0) { showHome(path.slice(2)); return; }
    if (path === "/" || path === "") { showHome(); return; }

    var parts = path.split("/").filter(Boolean);
    if (parts[0] === "category" && parts[1]) { viewCategory(decodeURIComponent(parts[1])); return; }
    if (parts[0] === "product" && parts[1]) { viewProduct(decodeURIComponent(parts[1])); return; }
    if (parts[0] === "search") {
      var m = /(?:^|&)q=([^&]*)/.exec(h.query);
      viewSearch(m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : "");
      return;
    }
    if (parts[0] === "wishlist") { viewWishlist(); return; }
    if (parts[0] === "checkout") { WT.checkout.view(); return; }
    if (parts[0] === "order" && parts[1]) { viewOrder(decodeURIComponent(parts[1])); return; }
    viewNotFound();
  };

  /* expose renderers for checkout module */
  router.showRoute = showRoute;
  router.crumb = crumb;

  router.init = function () {
    window.addEventListener("hashchange", router.dispatch);
  };
})();
