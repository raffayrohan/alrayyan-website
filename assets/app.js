/* Al-Rayyan Jeddah — custom JS (no libraries) */
(function () {
  "use strict";
  // Mobile menu
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
  // Reveal on scroll (smooth, respects reduced motion via CSS)
  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && els.length) {
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
  // Gallery filters
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
  // Quote calculator -> WhatsApp with prefilled message
  var form = document.getElementById("quoteForm");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var g = function (id) { var n = document.getElementById(id); return n ? n.value.trim() : ""; };
      var isEn = document.documentElement.lang === "en";
      var lines = isEn
        ? ["Sandwich Panels", "Car Shades — Cantilever & PVDF", "Pergolas", "Privacy Screens", "Royal Tents & Qarmid", "Al-Hamdaniyah · Obhur · Al-Safa · Al-Samer", "Free Inspection & Written Quote", "Official 10-Year Warranty"] : ["سندويش بنل وغرف وملاحق", "مظلات سيارات كابولي وPVDF", "برجولات وجلسات", "سواتر حديد وقص ليزر ولكسان", "بيوت شعر وقرميد", "الحمدانية · أبحر · الصفا · السامر", "معاينة مجانية وعرض سعر مكتوب", "شهادة ضمان رسمية 10 سنوات"];
      var url = "https://wa.me/966550044696?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");
    });
  }
  // Scroll progress bar + shrinking header + back-to-top
  var prog = document.createElement("div");
  prog.id = "scrollbar-progress";
  document.body.appendChild(prog);
  var toTop = document.createElement("button");
  toTop.id = "toTop";
  toTop.type = "button";
  toTop.textContent = "↑";
  toTop.setAttribute("aria-label", "Back to top");
  document.body.appendChild(toTop);
  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  var hdr = document.querySelector("header.site");
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
  // Services marquee under the homepage hero
  var hero = document.querySelector(".hero");
  if (hero) {
    var isEnPage = document.documentElement.lang === "en";
    var items = isEnPage
      ? ["Sandwich Panels", "Car Shades — Cantilever & PVDF", "Pergolas", "Privacy Screens", "Royal Tents & Qarmid", "Al-Hamdaniyah · Obhur · Al-Safa · Al-Samer", "Free Inspection & Written Quote", "Official 10-Year Warranty"] : ["سندويش بنل وغرف وملاحق", "مظلات سيارات كابولي وPVDF", "برجولات وجلسات", "سواتر حديد وقص ليزر ولكسان", "بيوت شعر وقرميد", "الحمدانية · أبحر · الصفا · السامر", "معاينة مجانية وعرض سعر مكتوب", "شهادة ضمان رسمية 10 سنوات"];
    var group = items.map(function (t) { return "<span>" + t + " ✦</span>"; }).join("");
    var mq = document.createElement("div");
    mq.className = "marquee";
    mq.setAttribute("aria-hidden", "true");
    mq.innerHTML = '<div class="marquee-track"><div class="mq-group">' + group + '</div><div class="mq-group">' + group + "</div></div>";
    hero.parentNode.insertBefore(mq, hero.nextSibling);
  }
  // Footer year
  var y = document.getElementById("yr");
  if (y) y.textContent = new Date().getFullYear();
})();
