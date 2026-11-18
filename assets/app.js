/* Al-Rayyan Jeddah — custom JS v2 (no libraries, deferred)
   Effects: page loading line, scroll progress, scrolled header, hero counters,
   reveal-on-scroll, smooth FAQ accordion, gallery lightbox, services marquee.
   Transform/opacity only; respects prefers-reduced-motion. */
(function () {
  "use strict";
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isRtl = document.documentElement.dir === "rtl";

  /* 1) Page loading line — bronze bar at the very top */
  var loadLine = document.getElementById("loadLine");
  var loadBar = loadLine ? loadLine.querySelector("span") : null;
  if (loadBar) {
    if (reduced) {
      loadBar.style.width = "100%";
      loadLine.classList.add("done");
    } else {
      requestAnimationFrame(function () { loadBar.style.width = "68%"; });
      var finishLoad = function () {
        loadBar.style.width = "100%";
        setTimeout(function () {
          loadLine.classList.add("done");
          setTimeout(function () { if (loadLine.parentNode) loadLine.parentNode.removeChild(loadLine); }, 500);
        }, 250);
      };
      if (document.readyState === "complete") finishLoad();
      else window.addEventListener("load", finishLoad);
    }
  }

  /* Mobile menu */
  var burger = document.querySelector(".burger");
  var menu = document.querySelector(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("show");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll("button.drop").forEach(function (b) {
      b.addEventListener("click", function () {
        b.parentElement.classList.toggle("open");
      });
    });
  }

  /* 4) Reveal on scroll (staggered per sibling group) */
  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && els.length && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("vis"); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    els.forEach(function (el) {
      var sibs = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList && c.classList.contains("reveal"); }) : [];
      var i = sibs.indexOf(el);
      el.style.transitionDelay = Math.min(Math.max(i, 0), 5) * 70 + "ms";
      io.observe(el);
    });
  } else {
    els.forEach(function (el) { el.classList.add("vis"); });
  }

  /* 5) Count-up counters in the trust strip */
  var counters = document.querySelectorAll("[data-count]");
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduced || !("requestAnimationFrame" in window)) { el.textContent = target + suffix; return; }
    var dur = 1300, t0 = null;
    function tick(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (counters.length) {
    if ("IntersectionObserver" in window && !reduced) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(runCounter);
    }
  }

  /* Gallery filters */
  document.querySelectorAll(".filters").forEach(function (bar) {
    bar.addEventListener("click", function (ev) {
      var btn = ev.target.closest("button[data-f]");
      if (!btn) return;
      bar.querySelectorAll("button").forEach(function (b) { b.classList.remove("on"); });
      btn.classList.add("on");
      var f = btn.getAttribute("data-f");
      var grid = document.querySelector(bar.getAttribute("data-target") || ".gal");
      if (!grid) return;
      grid.querySelectorAll("figure[data-cat]").forEach(function (fig) {
        fig.classList.toggle("hide", f !== "all" && fig.getAttribute("data-cat") !== f);
      });
    });
  });

  /* 7) Gallery lightbox — click any gallery photo */
  var grids = document.querySelectorAll(".gal");
  if (grids.length) {
    var isEn = document.documentElement.lang === "en";
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.innerHTML =
      '<button class="lb-btn lb-close" type="button" aria-label="' + (isEn ? "Close" : "إغلاق") + '">✕</button>' +
      '<button class="lb-btn lb-prev" type="button" aria-label="' + (isEn ? "Previous" : "السابق") + '">' + (isRtl ? "›" : "‹") + "</button>" +
      '<figure class="lb-fig"><img alt=""><figcaption class="lb-cap"></figcaption><div class="lb-count"></div></figure>' +
      '<button class="lb-btn lb-next" type="button" aria-label="' + (isEn ? "Next" : "التالي") + '">' + (isRtl ? "‹" : "›") + "</button>";
    document.body.appendChild(lb);
    var lbImg = lb.querySelector("img");
    var lbCap = lb.querySelector(".lb-cap");
    var lbCount = lb.querySelector(".lb-count");
    var curFigs = [], curIdx = 0;
    function visibleFigs(grid) {
      return Array.prototype.filter.call(grid.querySelectorAll("figure"), function (f) { return !f.classList.contains("hide"); });
    }
    function show(i) {
      if (!curFigs.length) return;
      curIdx = (i + curFigs.length) % curFigs.length;
      var fig = curFigs[curIdx];
      var img = fig.querySelector("img");
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || "";
      var cap = fig.querySelector("figcaption");
      lbCap.innerHTML = cap ? cap.innerHTML : "";
      lbCount.textContent = (curIdx + 1) + " / " + curFigs.length;
    }
    function openLb(fig) {
      curFigs = visibleFigs(fig.closest(".gal"));
      show(curFigs.indexOf(fig));
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function closeLb() {
      lb.classList.remove("open");
      document.body.style.overflow = "";
    }
    grids.forEach(function (grid) {
      grid.addEventListener("click", function (ev) {
        if (ev.target.closest("a")) return; /* caption service links navigate */
        var fig = ev.target.closest("figure");
        if (fig) openLb(fig);
      });
    });
    lb.querySelector(".lb-close").addEventListener("click", closeLb);
    lb.querySelector(".lb-next").addEventListener("click", function () { show(curIdx + 1); });
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(curIdx - 1); });
    lb.addEventListener("click", function (ev) { if (ev.target === lb) closeLb(); });
    document.addEventListener("keydown", function (ev) {
      if (!lb.classList.contains("open")) return;
      if (ev.key === "Escape") closeLb();
      else if (ev.key === "ArrowLeft") show(curIdx + (isRtl ? 1 : -1));
      else if (ev.key === "ArrowRight") show(curIdx + (isRtl ? -1 : 1));
    });
  }

  /* 8) Smooth FAQ accordion — wrap answers, animate max-height */
  document.querySelectorAll("details").forEach(function (det) {
    var summary = det.querySelector("summary");
    if (!summary) return;
    var body = document.createElement("div");
    body.className = "faq-body";
    Array.prototype.slice.call(det.children).forEach(function (child) {
      if (child !== summary) body.appendChild(child);
    });
    det.appendChild(body);
    if (det.open) body.style.maxHeight = body.scrollHeight + "px";
    summary.addEventListener("click", function (ev) {
      ev.preventDefault();
      var willOpen = !det.open;
      if (reduced) {
        det.open = willOpen;
        body.style.maxHeight = willOpen ? body.scrollHeight + "px" : "0px";
        return;
      }
      if (willOpen) {
        det.open = true;
        body.style.maxHeight = "0px";
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { body.style.maxHeight = body.scrollHeight + "px"; });
        });
      } else {
        body.style.maxHeight = body.scrollHeight + "px";
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            body.style.maxHeight = "0px";
            setTimeout(function () { det.open = false; }, 460);
          });
        });
      }
    });
  });

  /* Quote form -> WhatsApp */
  var form = document.getElementById("quoteForm");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var g = function (id) { var n = document.getElementById(id); return n ? n.value.trim() : ""; };
      var isEn = document.documentElement.lang === "en";
      var lines = isEn
        ? ["New quote request from the Al-Rayyan website:", "Service: " + g("qService"), "District: " + g("qCity"), "Site type: " + g("qScope"), "Details: " + (g("qDetails") || "—")]
        : ["طلب عرض سعر جديد من موقع الريان:", "الخدمة: " + g("qService"), "الحي: " + g("qCity"), "نوع الموقع: " + g("qScope"), "التفاصيل: " + (g("qDetails") || "—")];
      var url = "https://wa.me/966550044696?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");
    });
  }

  /* 2) Scroll progress line under the header + 6) scrolled header + back-to-top */
  var hdr = document.querySelector("header.site");
  var prog = document.createElement("div");
  prog.className = "scroll-progress";
  prog.setAttribute("aria-hidden", "true");
  if (hdr) hdr.appendChild(prog);
  var toTop = document.createElement("button");
  toTop.id = "toTop";
  toTop.type = "button";
  toTop.textContent = "↑";
  toTop.setAttribute("aria-label", "Back to top");
  document.body.appendChild(toTop);
  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); });
  var ticking = false;
  function onScroll() {
    var st = window.scrollY || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.transform = "scaleX(" + (h > 0 ? st / h : 0) + ")";
    if (hdr) hdr.classList.toggle("scrolled", st > 10);
    toTop.classList.toggle("show", st > 600);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* 9) Bronze services marquee — under the trust strip below the hero */
  var hero = document.querySelector(".hero");
  if (hero) {
    var isEnPage = document.documentElement.lang === "en";
    var items = isEnPage
      ? ["Sandwich Panels", "Car Shades — Cantilever & PVDF", "Pergolas", "Privacy Screens", "Royal Tents & Qarmid", "Al-Hamdaniyah · Obhur · Al-Safa · Al-Samer", "Free Inspection & Written Quote", "Official 10-Year Warranty"]
      : ["سندويش بنل وغرف وملاحق", "مظلات سيارات كابولي وPVDF", "برجولات وجلسات", "سواتر حديد وقص ليزر ولكسان", "بيوت شعر وقرميد", "الحمدانية · أبحر · الصفا · السامر", "معاينة مجانية وعرض سعر مكتوب", "شهادة ضمان رسمية 10 سنوات"];
    var group = items.map(function (t) { return "<span>" + t + " ✦</span>"; }).join("");
    var mq = document.createElement("div");
    mq.className = "marquee";
    mq.setAttribute("aria-hidden", "true");
    mq.innerHTML = '<div class="marquee-track"><div class="mq-group">' + group + '</div><div class="mq-group">' + group + "</div></div>";
    var anchor = document.querySelector(".trust-strip") || hero;
    anchor.parentNode.insertBefore(mq, anchor.nextSibling);
  }

  /* Footer year */
  var y = document.getElementById("yr");
  if (y) y.textContent = new Date().getFullYear();
})();
