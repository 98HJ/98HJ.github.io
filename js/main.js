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

  /* 访客统计已取消(腾讯云欠费停服);点赞改为纯点赞,不再调用任何云端计数接口 */

  // ====== 点赞粒子迸发 ======
  function spawnParticles(btn) {
    if (!btn) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var host = btn.querySelector(".like-heart");
    if (!host) return;
    var n = 8;
    var colors = ["#a85a3c", "#d98c6a", "#e0533d", "#f0c5b0"];
    for (var i = 0; i < n; i++) {
      var p = document.createElement("span");
      p.className = "like-particle";
      var angle = (Math.PI * 2 * i) / n + (Math.random() * 0.5 - 0.25);
      var dist = 24 + Math.random() * 20;
      p.style.setProperty("--bx", (Math.cos(angle) * dist).toFixed(1) + "px");
      p.style.setProperty("--by", (Math.sin(angle) * dist).toFixed(1) + "px");
      p.style.background = colors[i % colors.length];
      var sz = (5 + Math.random() * 4).toFixed(1);
      p.style.width = sz + "px";
      p.style.height = sz + "px";
      host.appendChild(p);
      void p.offsetWidth;
      p.classList.add("is-on");
      (function (node) {
        var remove = function () { if (node.parentNode) node.parentNode.removeChild(node); };
        node.addEventListener("animationend", remove);
        setTimeout(remove, 800);
      })(p);
    }
  }

  // 点赞全屏庆祝(心形升起铺满视口 + 居中致谢卡片;尊重 reduced-motion)
  function celebrateLike(btn, showThanks) {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var layer = document.querySelector(".like-celebrate");
    if (!layer) {
      layer = document.createElement("div");
      layer.className = "like-celebrate";
      document.body.appendChild(layer);
    }
    // 限制同时存在的庆祝心形数量,避免快速连点导致 DOM 堆叠卡顿
    var existing = layer ? layer.querySelectorAll(".celebrate-heart").length : 0;
    if (existing >= 48) return;
    var rect = btn ? btn.getBoundingClientRect() : null;
    var ox = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    var oy = rect ? rect.top + rect.height / 2 : window.innerHeight * 0.6;
    var palette = ["#a85a3c", "#d98c6a", "#e0533d", "#f0c5b0", "#c2683f"];
    var HEART = "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";
    var N = 16;
    for (var i = 0; i < N; i++) {
      var h = document.createElement("span");
      h.className = "celebrate-heart";
      var size = (14 + Math.random() * 16).toFixed(0);
      var dx = (Math.random() * 160 - 80).toFixed(0);
      var rise = (window.innerHeight * (0.85 + Math.random() * 0.5)).toFixed(0);
      var rot = (Math.random() * 80 - 40).toFixed(0);
      var sc = (0.8 + Math.random() * 0.8).toFixed(2);
      var dur = (1.6 + Math.random() * 1.1).toFixed(2);
      var delay = (Math.random() * 0.25).toFixed(2);
      h.style.left = ox + "px";
      h.style.top = oy + "px";
      h.style.width = size + "px";
      h.style.height = size + "px";
      h.style.setProperty("--dx", dx + "px");
      h.style.setProperty("--rise", "-" + rise + "px");
      h.style.setProperty("--rot", rot + "deg");
      h.style.setProperty("--sc", sc);
      h.style.setProperty("--dur", dur + "s");
      h.style.animationDelay = delay + "s";
      h.innerHTML = '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="' + palette[i % palette.length] + '" d="' + HEART + '"/></svg>';
      layer.appendChild(h);
      (function (node) {
        var rm = function () { if (node.parentNode) node.parentNode.removeChild(node); };
        node.addEventListener("animationend", rm);
        setTimeout(rm, 3600);
      })(h);
    }
    if (showThanks) {
      var old = document.querySelector(".like-thanks");
      if (old && old.parentNode) old.parentNode.removeChild(old);
      var thanks = document.createElement("div");
      thanks.className = "like-thanks";
      thanks.innerHTML = '<svg viewBox="0 0 24 24"><path fill="#e0533d" d="' + HEART + '"/></svg><span class="t-zh">感谢您的小心心</span><span class="t-en">Thanks for the like</span>';
      document.body.appendChild(thanks);
      (function (node) {
        var rm = function () { if (node.parentNode) node.parentNode.removeChild(node); };
        node.addEventListener("animationend", rm);
        setTimeout(rm, 2300);
      })(thanks);
    }
  }

  // ====== 点赞(纯点赞:心形填充 / 弹跳 / 粒子 / 庆祝,无计数;本地记录是否已赞) ======
  var likeBtn = document.getElementById("likeBtn");
  if (likeBtn) {
    var LIKED_KEY = "site-liked";
    var liked = false;
    try { liked = localStorage.getItem(LIKED_KEY) === "1"; } catch (e) {}

    function paint() {
      likeBtn.classList.toggle("liked", liked);
      likeBtn.setAttribute("aria-pressed", liked ? "true" : "false");
    }
    paint();

    likeBtn.addEventListener("click", function () {
      liked = !liked;
      try { localStorage.setItem(LIKED_KEY, liked ? "1" : "0"); } catch (e) {}
      paint();
      likeBtn.classList.remove("pop"); void likeBtn.offsetWidth; likeBtn.classList.add("pop");
      if (liked) {
        spawnParticles(likeBtn);
        // 全屏心形升起 + 致谢卡片(每次点赞都给反馈,卡片单实例防堆叠)
        celebrateLike(likeBtn, true);
      }
    });
  }

  // 访客统计已移除(腾讯云欠费停服);如需恢复,见 deploy/tencent-scf-counter*.py

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
