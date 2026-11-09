/* ============================================================
   WILDTHREAD — main.js
   Boot: load catalogue → init UI + router → dismiss loader →
   optional GSAP flourishes. Runs last (deferred after the rest).
   ============================================================ */
(function () {
  "use strict";
  window.WT = window.WT || {};

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function dismissLoader() {
    var loader = document.getElementById("loader");
    if (!loader) return;
    if (reduced) { loader.remove(); return; }
    loader.classList.add("is-done");
    setTimeout(function () { loader.remove(); }, 650);
  }

  function heroIntro() {
    if (reduced || !window.gsap) return;
    try {
      if (window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);
      var tl = window.gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(".hero__title .reveal-line", { yPercent: 110, duration: 0.9, stagger: 0.12 }, 0.1)
        .from(".hero__sub", { y: 24, autoAlpha: 0, duration: 0.6 }, "-=0.5")
        .from(".hero__ctas .btn", { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.5 }, "-=0.4")
        .from(".hero__media", { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "power3.inOut" }, 0.2)
        .from(".hero__media .sticker", { scale: 0, rotation: -20, stagger: 0.1, duration: 0.5, ease: "back.out(2)" }, "-=0.4");

      /* gentle parallax on hero image */
      if (window.ScrollTrigger) {
        window.gsap.to(".hero__media img", {
          yPercent: 8,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
        });
      }
    } catch (e) { /* GSAP is a flourish — the page must work without it */ }
  }

  function boot() {
    WT.data.load()
      .catch(function (err) {
        /* fetch of products.json failed (e.g. file:// protocol) —
           keep the site alive with an empty catalogue + a note */
        console.error("[WILDTHREAD] products.json failed to load:", err);
        var host = document.getElementById("home-grid");
        if (host) host.innerHTML =
          '<div class="empty-state"><p class="empty-state__big">Catalogue didn&rsquo;t load.</p>' +
          "<p>Serve the folder over HTTP — <code>npx serve</code> — instead of opening the file directly.</p></div>";
      })
      .then(function () {
        WT.router.init();
        WT.ui.init();
        WT.router.dispatch();
        dismissLoader();
        heroIntro();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
