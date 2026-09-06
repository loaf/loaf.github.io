/* ============================================================
   Plume 主题脚本：深浅色切换 / 导航状态 / 移动端菜单 /
   全文搜索（/api/search.json）/ 本页目录与标题锚点 /
   代码复制 / 可选 highlight.js / 分页跳转
   ============================================================ */
(function () {
  'use strict';

  var CFG = window.PLUME || {};
  var doc = document;

  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $all(sel, root) {
    return Array.prototype.slice.call((root || doc).querySelectorAll(sel));
  }

  /* ---------------- 深浅色切换 ---------------- */
  function isDark() { return doc.documentElement.getAttribute('data-theme') === 'dark'; }

  function syncGiscusTheme(dark) {
    var frame = $('.giscus-frame');
    if (!frame || !frame.contentWindow) { return; }
    try {
      frame.contentWindow.postMessage({
        giscus: { setConfig: { theme: dark ? 'dark' : 'light' } }
      }, 'https://giscus.app');
    } catch (e) {}
  }

  function initTheme() {
    var btn = $('#theme-toggle');
    if (!btn) { return; }
    btn.addEventListener('click', function () {
      var dark = !isDark();
      if (dark) { doc.documentElement.setAttribute('data-theme', 'dark'); }
      else { doc.documentElement.removeAttribute('data-theme'); }
      try { localStorage.setItem('plume:theme', dark ? 'dark' : 'light'); } catch (e) {}
      applyHljsTheme();
      syncGiscusTheme(dark);
    });
  }

  /* giscus 兜底同步：iframe 是懒加载的，若用户在 iframe 就绪前切换了主题，
     上面的 syncGiscusTheme 会被 giscus 忽略。等 .giscus-frame 出现后
     再同步一次，并监听其 load 完成后同步一次，覆盖所有时序。 */
  function watchGiscus() {
    var host = $('#comment');
    if (!host) { return; }
    var sync = function () { syncGiscusTheme(isDark()); };
    var frame = $('.giscus-frame');
    if (frame) {
      frame.addEventListener('load', sync);
      sync();
      return;
    }
    if (typeof MutationObserver === 'undefined') { return; }
    var ob = new MutationObserver(function () {
      var f = $('.giscus-frame');
      if (f) {
        ob.disconnect();
        f.addEventListener('load', sync);
        sync();
      }
    });
    ob.observe(host, { childList: true, subtree: true });
  }

  /* ---------------- 导航激活态 / 移动端菜单 ---------------- */
  function initNav() {
    var path = decodeURIComponent(location.pathname);
    $all('[data-nav-link]').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href.indexOf('/') !== 0 || /^https?:/.test(href)) { return; }
      href = decodeURIComponent(href);
      if (href === '/' ? path === '/' || path === '/index.html'
        : path === href || path.indexOf(href + '/') === 0) {
        a.classList.add('route-link-active');
      }
    });

    var toggle = $('#nav-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var open = doc.documentElement.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      doc.addEventListener('click', function (e) {
        if (!doc.documentElement.classList.contains('nav-open')) { return; }
        if (e.target.closest && e.target.closest('.vp-nav-dropdown')) { return; }
        if (e.target === toggle || toggle.contains(e.target)) { return; }
        doc.documentElement.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    }
  }

  /* ---------------- 全文搜索 ---------------- */
  var searchData = null;
  var searchDataLoading = false;

  function loadSearchData(cb) {
    if (searchData) { cb(searchData); return; }
    if (searchDataLoading) { return; }
    searchDataLoading = true;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/search.json', true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) { return; }
      searchDataLoading = false;
      if (xhr.status >= 200 && xhr.status < 300) {
        try { searchData = JSON.parse(xhr.responseText) || []; }
        catch (e) { searchData = []; }
        cb(searchData);
      }
    };
    xhr.send();
  }

  var smModal, smInput, smResults;
  var smActive = -1;
  var smItems = [];

  function smOpen() {
    if (!smModal) { return; }
    smModal.hidden = false;
    doc.body.style.overflow = 'hidden';
    setTimeout(function () { smInput.focus(); }, 30);
    if (!searchData) {
      smResults.innerHTML = '<div class="sm-hint">正在加载搜索索引…</div>';
      loadSearchData(function () {
        if (!smModal.hidden) { smRender(smInput.value); }
      });
    }
  }

  function smClose() {
    if (!smModal) { return; }
    smModal.hidden = true;
    doc.body.style.overflow = '';
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function mark(text, q) {
    var safe = escapeHTML(text);
    if (!q) { return safe; }
    var i = text.toLowerCase().indexOf(q);
    if (i < 0) { return safe; }
    return escapeHTML(text.slice(0, i)) + '<b>' + escapeHTML(text.slice(i, i + q.length)) + '</b>' + escapeHTML(text.slice(i + q.length));
  }

  function search(query) {
    var q = (query || '').trim().toLowerCase();
    if (!q || !searchData) { return []; }
    var out = [];
    for (var i = 0; i < searchData.length && out.length < 30; i++) {
      var it = searchData[i];
      var title = it.title || '';
      var content = it.content || '';
      var tags = (it.tags || []).join(',');
      var ti = title.toLowerCase().indexOf(q);
      var gi = tags.toLowerCase().indexOf(q);
      var ci = content.toLowerCase().indexOf(q);
      if (ti < 0 && gi < 0 && ci < 0) { continue; }
      out.push({
        item: it,
        score: (ti === 0 ? 0 : ti > 0 ? 1 : 10) + (gi >= 0 ? 0 : 5) + (ci >= 0 ? 0 : 8),
        hitTitle: ti >= 0,
        contentIdx: ci
      });
    }
    out.sort(function (a, b) { return a.score - b.score; });
    return out;
  }

  function smRender(query) {
    var q = (query || '').trim().toLowerCase();
    smItems = [];
    smActive = -1;

    if (!q) {
      smResults.innerHTML = '<div class="sm-hint">输入关键词开始搜索</div>';
      return;
    }
    if (!searchData) {
      smResults.innerHTML = '<div class="sm-hint">正在加载搜索索引…</div>';
      return;
    }

    var hits = search(query);
    if (!hits.length) {
      smResults.innerHTML = '<div class="sm-empty">没有找到与「' + escapeHTML(query.trim()) + '」相关的文章</div>';
      return;
    }

    var frag = doc.createDocumentFragment();
    hits.slice(0, 20).forEach(function (h) {
      var it = h.item;
      var snippet = '';
      if (h.contentIdx >= 0) {
        var s = Math.max(0, h.contentIdx - 32);
        snippet = (s > 0 ? '…' : '') + (it.content || '').slice(s, h.contentIdx + q.length + 46) + '…';
      }
      var el = doc.createElement('a');
      el.className = 'sm-item';
      el.href = it.link || '#';
      el.innerHTML =
        '<span class="sm-title">' + (h.hitTitle ? mark(it.title, query.trim()) : escapeHTML(it.title)) + '</span>' +
        (snippet ? '<span class="sm-snippet">' + mark(snippet, query.trim()) + '</span>' : '');
      el.addEventListener('click', smClose);
      frag.appendChild(el);
    });
    smResults.innerHTML = '';
    smResults.appendChild(frag);
    smItems = $all('.sm-item', smResults);
  }

  function smSetActive(idx) {
    if (!smItems.length) { return; }
    if (smActive >= 0 && smItems[smActive]) { smItems[smActive].classList.remove('active'); }
    smActive = (idx + smItems.length) % smItems.length;
    var el = smItems[smActive];
    el.classList.add('active');
    el.scrollIntoView({ block: 'nearest' });
  }

  function initSearch() {
    smModal = $('#search-modal');
    smInput = $('#sm-input');
    smResults = $('#sm-results');
    if (!smModal || !smInput) { return; }

    var btn = $('#search-btn');
    if (btn) {
      btn.addEventListener('click', smOpen);
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); smOpen(); }
      });
    }
    $all('[data-sm-close]', smModal).forEach(function (el) {
      el.addEventListener('click', smClose);
    });

    var debounce = null;
    smInput.addEventListener('input', function () {
      clearTimeout(debounce);
      debounce = setTimeout(function () { smRender(smInput.value); }, 120);
    });

    smInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); smSetActive(smActive + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); smSetActive(smActive - 1); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        var el = smActive >= 0 ? smItems[smActive] : smItems[0];
        if (el) { window.location.href = el.getAttribute('href'); }
      }
    });

    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !smModal.hidden) { smClose(); return; }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (smModal.hidden) { smOpen(); } else { smClose(); }
      }
    });
  }

  /* ---------------- 标题锚点 + 本页目录 ---------------- */
  function slugify(text, i) {
    var s = String(text || '').trim().replace(/\s+/g, '-').slice(0, 40);
    return s ? 'h-' + (i + 1) + '-' + s : 'h-' + (i + 1);
  }

  function initAnchorsAndToc() {
    var content = $('.vp-content');
    if (!content) { return; }

    var heads = $all('h2, h3', content);
    heads.forEach(function (h, i) {
      if (!h.id) { h.id = slugify(h.textContent, i); }
      if (h.querySelector('.header-anchor')) { return; }
      var a = doc.createElement('a');
      a.className = 'header-anchor';
      a.href = '#' + h.id;
      // 把标题文本包进锚点（与原站一致，悬浮显示 ¶）
      var nodes = Array.prototype.slice.call(h.childNodes);
      nodes.forEach(function (n) { a.appendChild(n); });
      h.appendChild(a);
    });

    var toc = $('#vp-toc');
    var list = $('#vp-toc-list');
    if (!toc || !list || heads.length < 2) { return; }

    var frag = doc.createDocumentFragment();
    heads.forEach(function (h) {
      var li = doc.createElement('li');
      li.className = 'vp-toc-item';
      var a = doc.createElement('a');
      a.className = 'vp-toc-link' + (h.tagName === 'H3' ? ' lv3' : '');
      a.href = '#' + h.id;
      a.textContent = h.textContent || '';
      li.appendChild(a);
      frag.appendChild(li);
    });
    list.appendChild(frag);
    toc.hidden = false;

    var links = $all('.vp-toc-link', list);

    function setActive(id) {
      links.forEach(function (l) {
        l.classList.toggle('active', l.getAttribute('href') === '#' + id);
      });
    }

    if ('IntersectionObserver' in window) {
      var visible = {};
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          visible[en.target.id] = en.isIntersecting ? en.target : null;
        });
        var best = null;
        heads.forEach(function (h) {
          if (visible[h.id] && (!best || h.offsetTop < best.offsetTop)) { best = h; }
        });
        if (!best) {
          var y = window.scrollY + 120;
          heads.forEach(function (h) { if (h.offsetTop <= y) { best = h; } });
        }
        if (best) { setActive(best.id); }
      }, { rootMargin: '-72px 0px -68% 0px', threshold: 0 });
      heads.forEach(function (h) { io.observe(h); });
    } else {
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (ticking) { return; }
        ticking = true;
        setTimeout(function () {
          ticking = false;
          var y = window.scrollY + 120;
          var current = heads[0];
          heads.forEach(function (h) { if (h.offsetTop <= y) { current = h; } });
          if (current) { setActive(current.id); }
        }, 100);
      });
    }
  }

  /* ---------------- 代码块复制 ---------------- */
  function legacyCopy(text) {
    var ta = doc.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    doc.body.appendChild(ta);
    ta.select();
    try { doc.execCommand('copy'); } catch (e) {}
    doc.body.removeChild(ta);
  }

  function initCopy() {
    $all('.vp-content pre').forEach(function (pre) {
      if (pre.querySelector('.copy-btn')) { return; }
      var code = pre.querySelector('code');
      if (!code) { return; }
      var btn = doc.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.textContent = '复制';
      btn.addEventListener('click', function () {
        var text = code.textContent || '';
        function done() {
          btn.textContent = '已复制';
          btn.classList.add('done');
          setTimeout(function () {
            btn.textContent = '复制';
            btn.classList.remove('done');
          }, 1600);
        }
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(done, function () { legacyCopy(text); done(); });
        } else {
          legacyCopy(text);
          done();
        }
      });
      pre.appendChild(btn);
    });
  }

  /* ---------------- 可选 highlight.js ---------------- */
  var HLJS_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0';

  function hljsLink() {
    var link = doc.getElementById('hljs-css');
    if (!link) {
      link = doc.createElement('link');
      link.id = 'hljs-css';
      link.rel = 'stylesheet';
      doc.head.appendChild(link);
    }
    link.href = HLJS_BASE + '/styles/' + (isDark() ? 'github-dark' : 'github') + '.min.css';
  }

  function applyHljsTheme() {
    if (window.hljs) { hljsLink(); }
  }

  function initHighlight() {
    if (!CFG.highlight) { return; }
    var hasCode = $('.vp-content pre code');
    if (!hasCode) { return; }

    // 代码块本身为深色，统一用深色高亮主题
    var link = doc.getElementById('hljs-css');
    if (!link) {
      link = doc.createElement('link');
      link.id = 'hljs-css';
      link.rel = 'stylesheet';
      link.href = HLJS_BASE + '/styles/github-dark.min.css';
      doc.head.appendChild(link);
    }

    if (window.hljs) { afterHljs(); return; }
    var s = doc.createElement('script');
    s.src = HLJS_BASE + '/highlight.min.js';
    s.onload = function () { if (window.hljs) { afterHljs(); } };
    s.onerror = function () {
      var l = doc.getElementById('hljs-css');
      if (l) { l.parentNode.removeChild(l); }
    };
    doc.head.appendChild(s);
  }

  function afterHljs() {
    try {
      window.hljs.configure({ ignoreUnescapedHTML: true });
      $all('.vp-content pre code').forEach(function (block) {
        window.hljs.highlightElement(block);
      });
    } catch (e) {}
  }

  /* ---------------- 分页交互 ---------------- */
  function pageBase() {
    var m = location.pathname.replace(/\/page\/\d+\/?$/, '');
    return (m || '/') ;
  }

  function initPagination() {
    $all('.vp-pagination-number > div[data-href]').forEach(function (el) {
      el.addEventListener('click', function () { location.href = el.getAttribute('data-href'); });
    });
    var btn = $('#vp-page-jump-btn');
    var input = $('#vp-page-jump');
    if (!btn || !input) { return; }
    function go() {
      var n = parseInt(input.value, 10);
      if (!n || n < 1) { return; }
      var base = pageBase();
      if (base.charAt(base.length - 1) !== '/') { base += '/'; }
      location.href = n === 1 ? base : base + 'page/' + n + '/';
    }
    btn.addEventListener('click', go);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); go(); }
    });
  }

  /* ---------------- 启动 ---------------- */
  function init() {
    initTheme();
    initNav();
    initSearch();
    initAnchorsAndToc();
    initCopy();
    initHighlight();
    initPagination();
    watchGiscus();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
