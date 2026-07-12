/* ============================================================
   交互脚本:主题切换 / 双语切换 / 移动端菜单 / 导航高亮
            / 滚动渐显 / 滚动进度 / 回到顶部 / 年份
   纯原生 JS,无依赖。
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;
  var LANG_KEY = "site-lang";
  var THEME_KEY = "site-theme";

  /* ---------- 主题切换(深 / 浅) ---------- */
  var themeBtn = document.getElementById("themeToggle");
  function getSystemTheme() {
    return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
  }
  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }
  var savedTheme = null;
  try { savedTheme = localStorage.getItem(THEME_KEY); } catch (e) {}
  setTheme(savedTheme === "dark" || savedTheme === "light" ? savedTheme : getSystemTheme());

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var cur = root.getAttribute("data-theme");
      setTheme(cur === "dark" ? "light" : "dark");
    });
  }
  // 若用户未手动设定,跟随系统主题变化
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onMq = function (e) {
      var s = null; try { s = localStorage.getItem(THEME_KEY); } catch (err) {}
      if (s !== "dark" && s !== "light") setTheme(e.matches ? "dark" : "light");
    };
    if (mq.addEventListener) mq.addEventListener("change", onMq);
    else if (mq.addListener) mq.addListener(onMq);
  }

  /* ---------- 双语切换 ---------- */
  var toggle = document.getElementById("langToggle");
  function setLang(lang) {
    root.setAttribute("data-lang", lang);
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    root.lang = (lang === "en") ? "en" : "zh";
  }
  var savedLang = null;
  try { savedLang = localStorage.getItem(LANG_KEY); } catch (e) {}

  if (toggle) {
    // 首页:启用中 / 英切换
    setLang(savedLang === "en" ? "en" : "zh");
    toggle.addEventListener("click", function () {
      var cur = root.getAttribute("data-lang");
      setLang(cur === "zh" ? "en" : "zh");
    });
  } else {
    // 子页面(笔记 / 归档):仅中文。强制 zh,避免套用首页已保存的英文偏好,
    // 否则没有英文文本的中文页面会被 CSS 全部隐藏,看起来像"打开后是空白 / 报错"。
    root.setAttribute("data-lang", "zh");
    root.lang = "zh";
  }

  /* ---------- 移动端菜单 ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- 导航高亮(scroll-spy) ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var linkEls = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  function onScroll() {
    var pos = window.scrollY + 120;
    var current = null;
    sections.forEach(function (sec) {
      if (sec.offsetTop <= pos) current = sec.id;
    });
    linkEls.forEach(function (a) {
      a.classList.remove("active");
      if (a.getAttribute("href") === "#" + current) a.classList.add("active");
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 滚动渐显 ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- 滚动进度条 ---------- */
  var progress = document.getElementById("scrollProgress");
  function onProgress() {
    if (!progress) return;
    var doc = document.documentElement;
    var h = doc.scrollHeight - window.innerHeight;
    var pct = h > 0 ? (window.scrollY / h) * 100 : 0;
    progress.style.width = pct + "%";
  }
  window.addEventListener("scroll", onProgress, { passive: true });
  onProgress();

  /* ---------- 回到顶部 ---------- */
  var toTop = document.getElementById("toTop");
  if (toTop) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 420) toTop.classList.add("show");
      else toTop.classList.remove("show");
    }, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- 页脚年份 ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 3D 头像交互:悬停跟随光标倾斜(视差) ---------- */
  var heroPhoto = document.querySelector(".hero-photo");
  var stage = document.querySelector(".photo-3d");
  var reduce3d = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine3d = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (heroPhoto && stage && !reduce3d && fine3d) {
    var MAX_TILT = 16;
    heroPhoto.addEventListener("pointermove", function (e) {
      var r = heroPhoto.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      stage.style.setProperty("--rx", (-py * MAX_TILT).toFixed(2) + "deg");
      stage.style.setProperty("--ry", (px * MAX_TILT).toFixed(2) + "deg");
    });
    heroPhoto.addEventListener("pointerleave", function () {
      stage.style.setProperty("--rx", "0deg");
      stage.style.setProperty("--ry", "0deg");
    });
  }

  /* ---------- 卡片 3D 微倾斜:研究卡片 / 笔记卡片 ---------- */
  function enableTilt(selector, maxDeg) {
    if (!window.matchMedia) return;
    var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    var els = document.querySelectorAll(selector);
    Array.prototype.forEach.call(els, function (el) {
      el.style.transformStyle = "preserve-3d";
      el.addEventListener("pointerenter", function () { el.classList.add("tilt-on"); });
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(760px) rotateY(" + (px * maxDeg).toFixed(2) + "deg) rotateX(" + (-py * maxDeg).toFixed(2) + "deg)";
      });
      el.addEventListener("pointerleave", function () {
        el.classList.remove("tilt-on");
        el.style.transform = "";
      });
    });
  }
  enableTilt(".card", 7);
  enableTilt(".blog-card", 6);

  /* ---------- 全局点赞 + 访客统计(CountAPI,零后端、跨访客累计) ---------- */
  var COUNTAPI = "https://api.countapi.xyz";
  var NS = "jianhua-site";

  function capiHit(ns, key) {
    return fetch(COUNTAPI + "/hit/" + ns + "/" + key).then(function (r) { return r.json(); });
  }
  function capiGet(ns, key) {
    return fetch(COUNTAPI + "/get/" + ns + "/" + key).then(function (r) { return r.json(); });
  }

  // 全局点赞:每个浏览器仅计一次,计数跨所有访客累加
  var likeBtn = document.getElementById("likeBtn");
  var likeCount = document.getElementById("likeCount");
  if (likeBtn) {
    var LIKE_KEY = "site-liked";
    var liked = false;
    try { liked = localStorage.getItem(LIKE_KEY) === "1"; } catch (e) {}
    likeBtn.classList.toggle("liked", liked);
    likeBtn.setAttribute("aria-pressed", liked ? "true" : "false");
    // 先展示当前全局总数
    capiGet(NS, "likes").then(function (d) {
      if (d && typeof d.value === "number" && likeCount) likeCount.textContent = String(d.value);
    }).catch(function () {});
    likeBtn.addEventListener("click", function () {
      if (liked) return; // 已点过:不重复计数
      liked = true;
      try { localStorage.setItem(LIKE_KEY, "1"); } catch (e) {}
      likeBtn.classList.add("liked");
      likeBtn.setAttribute("aria-pressed", "true");
      likeBtn.classList.remove("pop"); void likeBtn.offsetWidth; likeBtn.classList.add("pop");
      capiHit(NS, "likes").then(function (d) {
        if (d && typeof d.value === "number" && likeCount) likeCount.textContent = String(d.value);
      }).catch(function () {});
    });
  }

  // 访客统计(全局 UV / PV;本地 file:// 或离线时显示 —)
  var uvEl = document.getElementById("siteUv");
  var pvEl = document.getElementById("sitePv");
  if (pvEl) {
    capiHit(NS, "site-pv").then(function (d) {
      if (d && typeof d.value === "number") pvEl.textContent = String(d.value);
    }).catch(function () {});
  }
  if (uvEl) {
    var uvSeen = false;
    try { uvSeen = localStorage.getItem("site-uv-seen") === "1"; } catch (e) {}
    var done = function (d) { if (d && typeof d.value === "number") uvEl.textContent = String(d.value); };
    if (uvSeen) {
      capiGet(NS, "site-uv").then(done).catch(function () {});
    } else {
      capiHit(NS, "site-uv").then(function (d) {
        done(d);
        try { localStorage.setItem("site-uv-seen", "1"); } catch (e) {}
      }).catch(function () {});
    }
  }

  // Giscus 评论区跟随站点深 / 浅主题
  function syncGiscusTheme(theme) {
    var f = document.querySelector("iframe.giscus-frame");
    if (f && f.contentWindow) {
      f.contentWindow.postMessage({ giscus: { setConfig: { theme: theme } } }, "https://giscus.app");
    }
  }
  var _themeBtn = document.getElementById("themeToggle");
  if (_themeBtn) {
    _themeBtn.addEventListener("click", function () {
      var t = document.documentElement.getAttribute("data-theme");
      syncGiscusTheme(t === "dark" ? "dark" : "light");
    });
  }
  // 初次加载后尝试同步(iframe 可能稍晚就绪,找到即停止轮询)
  var _giscusTries = 15;
  (function tryGiscus() {
    var f = document.querySelector("iframe.giscus-frame");
    if (f) { syncGiscusTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"); return; }
    if (_giscusTries-- > 0) setTimeout(tryGiscus, 700);
  })();

  // 标记脚本已初始化(供子页面兜底脚本判断,避免渐显元素因脚本未加载而永久隐藏)
  window.__siteReady = true;
})();
