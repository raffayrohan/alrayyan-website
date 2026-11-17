/* Al Rayyan — live reviews renderer.
 * Loads data/reviews.json (updated daily by .github/workflows/sync-reviews.yml)
 * and replaces the hardcoded review cards with the newest 5-star reviews first.
 * If the JSON cannot be fetched, the hardcoded cards in index.html stay as fallback.
 * No API key is used in the browser. Never put a Google API key in this file.
 */
(function () {
  var JSON_URL = 'data/reviews.json';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function stars(rating) {
    var r = Math.max(0, Math.min(5, Math.round(rating || 5)));
    return '★★★★★'.slice(0, r) + '☆☆☆☆☆'.slice(0, 5 - r);
  }

  function sortReviews(reviews) {
    // 5-star first, then newest publishTime first. No-date reviews go last.
    return (reviews || []).slice().sort(function (a, b) {
      var ra = a.rating || 0, rb = b.rating || 0;
      if (rb !== ra) return rb - ra;
      var da = a.publishTime ? Date.parse(a.publishTime) : 0;
      var db = b.publishTime ? Date.parse(b.publishTime) : 0;
      return db - da;
    });
  }

  function render(data) {
    if (!data || !Array.isArray(data.reviews) || !data.reviews.length) return false;
    var grid = document.getElementById('reviewsGrid');
    if (!grid) return false;

    var withText = sortReviews(data.reviews).filter(function (r) {
      return r && (r.textAr || r.textEn);
    });
    var top = withText.slice(0, 5);
    if (!top.length) return false;

    var lang = (window.currentLang === 'en') ? 'en' : 'ar';
    var html = top.map(function (r, i) {
      var author = lang === 'en' ? (r.authorEn || r.author) : (r.authorAr || r.author);
      var quoteAr = r.textAr || r.textEn || '';
      var quoteEn = r.textEn || '';
      var date = r.publishTime ? esc(r.publishTime) : '';
      return '<article class="review-card reveal active" style="--stagger-idx: ' + (i % 2) + ';">'
        + '<div><div class="review-stars">' + stars(r.rating) + '</div>'
        + '<p class="review-quote-ar">«' + esc(quoteAr) + '»</p>'
        + (quoteEn ? '<p class="review-quote-en">“' + esc(quoteEn) + '”</p>' : '')
        + '</div>'
        + '<div class="review-author"><span class="review-author-name">' + esc(author) + '</span>'
        + '<span class="review-source-badge">Google Review</span>'
        + (date ? '<span class="review-date" style="font-size:.78rem;opacity:.7;">' + date + '</span>' : '')
        + '</div></article>';
    }).join('');
    grid.innerHTML = html;

    // Aggregate score + count (in the current language).
    if (typeof data.rating === 'number') {
      var score = document.getElementById('reviewsScore');
      if (score) score.innerHTML = data.rating.toFixed(1) + ' <span style="font-size:1.25rem;color:var(--text-secondary-light);">/ 5</span>';
    }
    if (typeof data.reviewCount === 'number') updateCount(data.reviewCount);
    return true;
  }

  function updateCount(count) {
    var el = document.getElementById('reviewsCount');
    if (!el) return;
    var lang = (window.currentLang === 'en') ? 'en' : 'ar';
    el.textContent = lang === 'en'
      ? 'Based on ' + count + ' Google Reviews'
      : 'بناءً على ' + count + ' تقييم على Google';
  }

  var lastData = null;
  function load() {
    fetch(JSON_URL, { cache: 'no-store' })
      .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(function (data) { lastData = data; render(data); })
      .catch(function () { /* keep hardcoded fallback cards */ });
  }

  // Re-render the count text after a language switch (applyLanguage overwrites data-i18n text).
  if (typeof window.applyLanguage === 'function' && !window.applyLanguage.__reviewsWrapped) {
    var origApply = window.applyLanguage;
    window.applyLanguage = function (lang) {
      origApply(lang);
      if (lastData && typeof lastData.reviewCount === 'number') updateCount(lastData.reviewCount);
    };
    window.applyLanguage.__reviewsWrapped = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
