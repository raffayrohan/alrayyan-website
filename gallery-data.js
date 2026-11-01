// =========================================================================
// Al-Rayyan Dynamic Gallery Data & Controller (gallery-data.js)
// Zero-conflict architecture — works seamlessly with index.html
// Updated with all final client title & category corrections:
//   - Image #4  -> Category: shades   | Title Ar: مظلات مخروطي PVDF
//   - Image #5  -> Category: shades   | Title Ar: مظلات إنشائية
//   - Image #6  -> Category: pergolas | Title Ar: برجولات كلادينج خشبية
//   - Image #7  -> Category: shades   | Title Ar: مظلات فرنسي
//   - Image #8  -> Category: swater   | Title Ar: سواتر لكسان
//   - Image #9  -> Category: swater   | Title Ar: سواتر قص ليزر
//   - Image #11 -> Category: pergolas | Title Ar: برجولة مودرن
//   - Image #12 -> Category: pergolas | Title Ar: برجولات حديد مع لكسان
//   - Image #13 -> Category: tents    | Title Ar: بيوت شعر (صندوق)
//   - Image #14 -> Category: shades   | Title Ar: مظلات سيارات
//   - Image #18 -> Category: qarmid   | Title Ar: قرميد فخار إيطالي
//   - Image #20 -> Category: pergolas | Title Ar: برجولات حديد ولكسان
//   - Image #22 -> Category: pergolas | Title Ar: برجولات حديد مودرن
//   - Image #23 -> Category: decor    | Title Ar: ديكورات عشبية 3D
//   - Image #24 -> Category: decor    | Title Ar: ديكورات عشب 3D مع بديل الخشب
//   - Image #25 -> Category: panels   | Title Ar: غرف سندويش بنل
//   - Image #26 -> Category: decor    | Title Ar: ديكورات بديل الخشب
// =========================================================================
(function() {
  if (window.__RAYYAN_GALLERY_INITIALIZED__) return;
  window.__RAYYAN_GALLERY_INITIALIZED__ = true;

  // Smart multi-extension fallback handler inside gallery/ folder
  if (!window.__handleGalleryImgError) {
    window.__handleGalleryImgError = function(img) {
      if (!img) return;
      const currentTry = parseInt(img.getAttribute("data-try") || "0", 10);
      const orig = img.getAttribute("data-orig") || img.getAttribute("src") || "";
      if (!img.getAttribute("data-orig")) {
        img.setAttribute("data-orig", orig);
      }
      const basePath = orig.replace(/\.[a-zA-Z0-9]+$/, "");
      const altSrc = img.getAttribute("data-alt-src") || "";
      const candidates = [];
      if (altSrc) candidates.push(altSrc);
      candidates.push(
        basePath + ".jpg",
        basePath + ".png",
        basePath + ".webp",
        basePath + ".JPG",
        basePath + ".JPEG"
      );

      if (currentTry < candidates.length) {
        img.setAttribute("data-try", (currentTry + 1).toString());
        img.src = candidates[currentTry];
        return;
      }

      const fallbackSvg = img.getAttribute("data-fallback");
      img.onerror = null;
      if (fallbackSvg) {
        img.src = fallbackSvg;
      }
    };
  }

  // Complete, unique portfolio items aligned with client image numbers & sources
  const galleryData = [
    {
      serial: 1,
      src: "gallery/panel-1.jpeg",
      category: "panels",
      titleAr: "سندويش بنل - رقم 1",
      titleEn: "Sandwich Panels - #1",
      descAr: "توريد وتركيب ألواح سندويش بنل للغرف والملاحق والشقق كاملة.",
      descEn: "Supply and installation of sandwich panels for rooms and apartments."
    },
    {
      serial: 2,
      src: "gallery/panel-2.jpeg",
      category: "panels",
      titleAr: "سندويش بنل - رقم 2",
      titleEn: "Sandwich Panels - #2",
      descAr: "توريد وتركيب ألواح سندويش بنل للغرف والملاحق والشقق كاملة.",
      descEn: "Supply and installation of sandwich panels for rooms and apartments."
    },
    {
      serial: 3,
      src: "gallery/panel-3.jpeg",
      category: "panels",
      titleAr: "سندويش بنل - رقم 3",
      titleEn: "Sandwich Panels - #3",
      descAr: "توريد وتركيب ألواح سندويش بنل للغرف والملاحق والشقق كاملة.",
      descEn: "Supply and installation of sandwich panels for rooms and apartments."
    },
    {
      serial: 4,
      src: "gallery/shade-1.jpeg",
      category: "shades",
      titleAr: "مظلات مخروطي PVDF",
      titleEn: "PVDF Cone Shades",
      descAr: "تصميم وتنفيذ مظلات مخروطي بأغشية PVDF الألمانية والوطنية المقاومة للأشعة فوق البنفسجية والأمطار.",
      descEn: "Design and installation of conical PVDF membrane shades resistant to UV rays and rain."
    },
    {
      serial: 5,
      src: "gallery/shade-2.jpeg",
      category: "shades",
      titleAr: "مظلات إنشائية",
      titleEn: "Tensile Shades",
      descAr: "توريد وتركيب مظلات الشد الإنشائي للمشاريع والمواقف والمساحات الواسعة بهياكل فولاذية عالية المتانة.",
      descEn: "Engineering and installation of architectural tensile shades with heavy-duty steel structures."
    },
    {
      serial: 6,
      src: "gallery/shade-3.jpeg",
      category: "pergolas",
      titleAr: "برجولات كلادينج خشبية",
      titleEn: "Wooden Cladding Pergolas",
      descAr: "تصميم وتنفيذ برجولات كلادينج خشبية فاخرة للحدائق والمداخل والجلسات الخارجية بتشطيبات عصرية.",
      descEn: "Design and installation of luxury wooden cladding pergolas for gardens, entrances, and outdoor seating."
    },
    {
      serial: 7,
      src: "gallery/shade-5.jpeg",
      category: "shades",
      titleAr: "مظلات فرنسي",
      titleEn: "French Car Shades",
      descAr: "تفصيل وتركيب مظلات سيارات بقماش فرنسي أصلي عالي الكثافة مقاوم للحرارة والأشعة فوق البنفسجية.",
      descEn: "Custom car shades crafted with high-density French architectural fabric resistant to heat and UV rays."
    },
    {
      serial: 8,
      src: "gallery/shade-6.jpeg",
      category: "swater",
      titleAr: "سواتر لكسان",
      titleEn: "Lexan Swater",
      descAr: "تنفيذ سواتر لكسان بولي كربونيت ضد الكسر بتصاميم فخمة تجمع بين الخصوصية والجمال العصري.",
      descEn: "Unbreakable polycarbonate Lexan privacy screens combining luxury aesthetics with full privacy."
    },
    {
      serial: 9,
      src: "gallery/swater-1.jpeg",
      category: "swater",
      titleAr: "سواتر قص ليزر",
      titleEn: "Laser-Cut Privacy Screens",
      descAr: "تصميم وتركيب سواتر حديد مشغولة بزخارف قص ليزر (CNC) بدهانات فرن حرارية توفر الخصوصية والفخامة.",
      descEn: "Custom CNC laser-cut iron privacy screens with oven-baked finishes for luxury and security."
    },
    {
      serial: 10,
      src: "gallery/swater-2.jpeg",
      category: "swater",
      titleAr: "سواتر - رقم 10",
      titleEn: "Privacy Screens - #10",
      descAr: "تركيب سواتر حديثة توفر الخصوصية التامة والحماية.",
      descEn: "Installation of modern privacy screens providing complete protection."
    },
    {
      serial: 11,
      src: "gallery/swater-3.jpeg",
      category: "pergolas",
      titleAr: "برجولة مودرن",
      titleEn: "Modern Pergola",
      descAr: "تصميم وتنفيذ برجولة مودرن للحدائق والأسطح والجلسات الخارجية بلمسات معمارية أنيقة.",
      descEn: "Bespoke modern pergola for gardens, rooftops, and outdoor seating areas."
    },
    {
      serial: 12,
      src: "gallery/pergola-1.jpeg",
      category: "pergolas",
      titleAr: "برجولات حديد مع لكسان",
      titleEn: "Iron & Lexan Pergolas",
      descAr: "تركيب برجولات حديد مع تغطية ألواح لكسان مقاومة للكسر والأمطار للجلسات الخارجية والحدائق.",
      descEn: "Iron pergolas with unbreakable polycarbonate Lexan roofing for outdoor seating and gardens."
    },
    {
      serial: 13,
      src: "gallery/pergola-2.jpeg",
      category: "tents",
      titleAr: "بيوت شعر (صندوق)",
      titleEn: "Box-Style Traditional Tents",
      descAr: "تفصيل وتركيب بيوت شعر ملكية وعادية بنظام صندوق متكامل العزل الحراري والمائي وبتشطيبات راقية.",
      descEn: "Custom box-style royal and traditional tents with full thermal and waterproof insulation."
    },
    {
      serial: 14,
      src: "gallery/pergola-3.jpeg",
      category: "shades",
      titleAr: "مظلات سيارات",
      titleEn: "Car Parking Shades",
      descAr: "حلول كاملة للتظليل وتفصيل جميع أنواع مظلات السيارات بأفضل الخامات المقاومة للشمس والرطوبة.",
      descEn: "Complete shading solutions and custom car parking shades with weather-resistant materials."
    },
    {
      serial: 15,
      src: "gallery/pergola-4.jpeg",
      category: "pergolas",
      titleAr: "برجولات - رقم 15",
      titleEn: "Pergolas - #15",
      descAr: "ابتكار مساحات استرخاء خارجية وبرجولات للحدائق.",
      descEn: "Innovative outdoor relaxation spaces and pergolas for gardens."
    },
    {
      serial: 16,
      src: "gallery/tent-1.jpeg",
      category: "tents",
      titleAr: "بيوت شعر - رقم 16",
      titleEn: "Traditional Tents - #16",
      descAr: "تفصيل وتركيب بيوت شعر ملكية وعادية بتصاميم تراثية وعصرية.",
      descEn: "Custom royal and regular traditional tents with modern designs."
    },
    {
      serial: 17,
      src: "gallery/tent-2.jpeg",
      category: "tents",
      titleAr: "بيوت شعر - رقم 17",
      titleEn: "Traditional Tents - #17",
      descAr: "تفصيل وتركيب بيوت شعر ملكية وعادية بتصاميم تراثية وعصرية.",
      descEn: "Custom royal and regular traditional tents with modern designs."
    },
    {
      serial: 18,
      src: "gallery/tent-3.jpeg",
      category: "qarmid",
      titleAr: "قرميد فخار إيطالي",
      titleEn: "Italian Pottery Qarmid",
      descAr: "توريد وتركيب قرميد فخار إيطالي أصلي للأسقف والملاحق والواجهات مع العزل المائي والحراري المتكامل.",
      descEn: "Supply and installation of authentic Italian terracotta clay roof tiles with full insulation."
    },
    {
      serial: 19,
      src: "gallery/qarmid-1.jpeg",
      category: "qarmid",
      titleAr: "قرميد إيطالي ومعدني - رقم 19",
      titleEn: "Italian & Metal Qarmid - #19",
      descAr: "توريد وتركيب القرميد الإيطالي والمعدني للأسطح والواجهات.",
      descEn: "Supply and installation of Italian and metal roof tiles."
    },
    {
      serial: 20,
      src: "gallery/qarmid-2.jpeg",
      category: "pergolas",
      titleAr: "برجولات حديد ولكسان",
      titleEn: "Iron & Lexan Pergolas",
      descAr: "تصميم وتركيب برجولات حديد مغطاة بألواح اللكسان المقاومة للكسر لحماية الجلسات من الأمطار والشمس.",
      descEn: "Custom iron pergolas topped with unbreakable polycarbonate Lexan sheets."
    },
    {
      serial: 21,
      src: "images services/قرميد معدني.jpeg",
      altSrc: "gallery/qarmid-3.jpeg",
      category: "qarmid",
      titleAr: "قرميد معدني وكوري - رقم 21",
      titleEn: "Metal & Korean Qarmid - #21",
      descAr: "توريد وتركيب القرميد المعدني والكوري المقاوم للصدأ والرطوبة للأسطح والواجهات.",
      descEn: "Supply and installation of rust-resistant metal and Korean roof tiles."
    },
    {
      serial: 22,
      src: "gallery/decor-1.jpeg",
      category: "pergolas",
      titleAr: "برجولات حديد مودرن",
      titleEn: "Modern Iron Pergolas",
      descAr: "تصميم وتنفيذ برجولات حديد مودرن للحدائق والجلسات الخارجية بدهانات حرارية مقاومة للرطوبة والصدأ.",
      descEn: "Design and installation of modern iron pergolas for gardens and outdoor seating areas."
    },
    {
      serial: 23,
      src: "gallery/decor-2.jpeg",
      category: "decor",
      titleAr: "ديكورات عشبية 3D",
      titleEn: "3D Grass Decor",
      descAr: "تصميم وتنفيذ جداريات وديكورات عشبية ثلاثية الأبعاد (3D) لتزيين الحدائق والأحواش والجلسات الخارجية.",
      descEn: "3D artificial grass wall decor and landscaping for gardens, courtyards, and outdoor seating."
    },
    {
      serial: 24,
      src: "gallery/decor-3.jpeg",
      category: "decor",
      titleAr: "ديكورات عشب 3D مع بديل الخشب",
      titleEn: "3D Grass & Wood-Alternative Decor",
      descAr: "تنفيذ ديكورات خارجية تجمع بين العشب الجداري ثلاثي الأبعاد (3D) وتكسيات بديل الخشب المقاوم للعوامل الجوية.",
      descEn: "Exterior wall decor combining 3D artificial greenery with weather-resistant WPC wood alternatives."
    },
    {
      serial: 25,
      src: "gallery/decor-4.jpeg",
      category: "panels",
      titleAr: "غرف سندويش بنل",
      titleEn: "Sandwich Panel Rooms",
      descAr: "تصميم وتنفيذ غرف وملاحق سندويش بنل حديثة بواجهات زجاجية وعزل حراري ومائي متكامل.",
      descEn: "Design and construction of modern insulated sandwich panel rooms and backyard extensions."
    },
    {
      serial: 26,
      src: "gallery/decor-5.jpeg",
      category: "decor",
      titleAr: "ديكورات بديل الخشب",
      titleEn: "Wood-Alternative Decor",
      descAr: "تركيب تكسيات وديكورات بديل الخشب (WPC) الفاخرة المقاومة للرطوبة والحرارة للواجهات والجلسات الخارجية.",
      descEn: "Installation of weather-resistant WPC wood-alternative cladding and exterior decorative finishes."
    },
    {
      serial: 27,
      src: "gallery/tensile-1.jpeg",
      category: "tensile",
      titleAr: "مظلات الشد الإنشائي - رقم 27",
      titleEn: "Tensile Shades - #27",
      descAr: "مظلات هندسية بأقمشة PVC و PVDF المقاومة للماء.",
      descEn: "Giant engineered shades with waterproof PVC/PVDF fabrics."
    },
    {
      serial: 28,
      src: "gallery/tensile-2.jpeg",
      category: "tensile",
      titleAr: "مظلات الشد الإنشائي - رقم 28",
      titleEn: "Tensile Shades - #28",
      descAr: "مظلات هندسية بأقمشة PVC و PVDF المقاومة للماء.",
      descEn: "Giant engineered shades with waterproof PVC/PVDF fabrics."
    }
  ];

  window.GALLERY_DATA = galleryData;

  let currentItem = 0;
  const itemsPerPage = 9;
  let currentFilter = "all";

  function getActiveLang() {
    if (window.currentLang === "en" || document.documentElement.getAttribute("lang") === "en") {
      return "en";
    }
    return "ar";
  }

  function syncGalleryLanguage(lang) {
    const activeLang = (lang === "en") ? "en" : ((lang === "ar") ? "ar" : getActiveLang());
    document.querySelectorAll("#dynamic-gallery-grid .lang-ar").forEach(function(el) {
      el.style.display = (activeLang === "ar") ? "block" : "none";
    });
    document.querySelectorAll("#dynamic-gallery-grid .lang-en").forEach(function(el) {
      el.style.display = (activeLang === "en") ? "block" : "none";
    });
  }

  window.syncGalleryLanguage = syncGalleryLanguage;

  function loadGalleryItems() {
    const galleryGrid = document.getElementById("dynamic-gallery-grid");
    const loadMoreBtn = document.getElementById("load-more-btn");
    if (!galleryGrid) return;

    const activeLang = getActiveLang();
    const arDisplay = (activeLang === "ar") ? "block" : "none";
    const enDisplay = (activeLang === "en") ? "block" : "none";

    const filteredData = (currentFilter === "all")
      ? galleryData
      : galleryData.filter(function(item) { return item.category === currentFilter; });

    let maxItem = currentItem + itemsPerPage;
    if (maxItem > filteredData.length) {
      maxItem = filteredData.length;
    }

    for (let i = currentItem; i < maxItem; i++) {
      const item = filteredData[i];
      const badgeNum = item.serial || (i + 1);
      const fallbackSvg = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">' +
        '<rect width="600" height="400" fill="#1A1917"/>' +
        '<rect x="20" y="20" width="560" height="360" fill="none" stroke="#B68D52" stroke-width="1.5" stroke-opacity="0.45"/>' +
        '<text x="300" y="190" text-anchor="middle" fill="#D1AE79" font-family="sans-serif" font-size="22" font-weight="bold">' + item.titleAr + '</text>' +
        '<text x="300" y="225" text-anchor="middle" fill="#C6BFB3" font-family="sans-serif" font-size="16">' + item.titleEn + '</text>' +
        '</svg>'
      );

      const altSrcAttr = item.altSrc ? (' data-alt-src="' + item.altSrc + '"') : '';

      const cardHtml =
        '<div class="gallery-item" data-category="' + item.category + '" data-serial="' + badgeNum + '">' +
          '<div class="gallery-img-wrapper" style="object-fit: cover; width: 100%; height: 100%;">' +
            '<img src="' + item.src + '"' + altSrcAttr + ' alt="' + item.titleAr + ' - ' + item.descAr + '" loading="lazy" decoding="async" style="object-fit: cover; width: 100%; height: 100%;" data-fallback="' + fallbackSvg + '" onerror="window.__handleGalleryImgError&&window.__handleGalleryImgError(this)">' +
            '<span class="gallery-badge">#' + badgeNum + '</span>' +
          '</div>' +
          '<div class="gallery-card-body">' +
            '<h4 class="lang-ar" style="display:' + arDisplay + ';">' + item.titleAr + '</h4>' +
            '<p class="lang-ar" style="display:' + arDisplay + ';">' + item.descAr + '</p>' +
            '<h4 class="lang-en" style="display:' + enDisplay + ';">' + item.titleEn + '</h4>' +
            '<p class="lang-en" style="display:' + enDisplay + ';">' + item.descEn + '</p>' +
          '</div>' +
        '</div>';

      galleryGrid.insertAdjacentHTML("beforeend", cardHtml);
    }

    currentItem = maxItem;

    if (loadMoreBtn) {
      if (currentItem >= filteredData.length) {
        loadMoreBtn.style.display = "none";
      } else {
        loadMoreBtn.style.display = "inline-flex";
      }
    }
  }

  function initGallery() {
    const galleryGrid = document.getElementById("dynamic-gallery-grid");
    const loadMoreBtn = document.getElementById("load-more-btn");
    const filterBtns = document.querySelectorAll(".filter-btn");

    if (!galleryGrid) return;

    galleryGrid.innerHTML = "";
    currentItem = 0;
    loadGalleryItems();

    filterBtns.forEach(function(btn) {
      if (btn.getAttribute("data-gallery-bound") === "true") return;
      btn.setAttribute("data-gallery-bound", "true");
      btn.addEventListener("click", function(e) {
        e.preventDefault();
        filterBtns.forEach(function(b) {
          b.classList.remove("active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");

        currentFilter = btn.getAttribute("data-filter") || "all";
        galleryGrid.innerHTML = "";
        currentItem = 0;
        loadGalleryItems();
      });
    });

    if (loadMoreBtn && loadMoreBtn.getAttribute("data-gallery-bound") !== "true") {
      loadMoreBtn.setAttribute("data-gallery-bound", "true");
      loadMoreBtn.addEventListener("click", function(e) {
        e.preventDefault();
        loadGalleryItems();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGallery);
  } else {
    initGallery();
  }
})();
