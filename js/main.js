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
  setLang(savedLang === "en" ? "en" : "zh");

  if (toggle) {
    toggle.addEventListener("click", function () {
      var cur = root.getAttribute("data-lang");
      setLang(cur === "zh" ? "en" : "zh");
    });
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

  /* ---------- 3D 头像交互:指针倾斜(通过 CSS 变量驱动) + 空闲旋转 ---------- */
  var heroPhoto = document.querySelector(".hero-photo");
  var stage = document.querySelector(".photo-3d");
  var reduce3d = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (heroPhoto && stage && !reduce3d) {
    var MAX_TILT = 14;
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
  /* ---------- 社交分享 ---------- */
  var SHARE_URL = "https://98HJ.github.io/";
  var SHARE_TITLE = document.title || "花健 · 个人主页 | Jian Hua";
  var SHARE_DESC = "苏州大学服装设计与工程博士研究生 · 数字时尚与可穿戴系统";
  function enc(s) { return encodeURIComponent(s); }

  /* 平台链接 */
  var shareLinks = {
    shareWeibo:   "https://service.weibo.com/share/share.php?url=" + enc(SHARE_URL) + "&title=" + enc(SHARE_TITLE),
    shareTwitter: "https://twitter.com/intent/tweet?url=" + enc(SHARE_URL) + "&text=" + enc(SHARE_TITLE),
    shareLinkedin: "https://www.linkedin.com/sharing/share-offsite/?url=" + enc(SHARE_URL),
    shareFacebook: "https://www.facebook.com/sharer/sharer.php?u=" + enc(SHARE_URL)
  };
  Object.keys(shareLinks).forEach(function (id) {
    var el = document.getElementById(id);
    if (el && !el.href) el.href = shareLinks[id];
  });

  /* Web Share API (系统原生分享) */
  var nativeBtn = document.getElementById("shareNative");
  if (nativeBtn) {
    if (navigator.share) {
      nativeBtn.addEventListener("click", function () {
        navigator.share({ title: SHARE_TITLE, text: SHARE_DESC, url: SHARE_URL }).catch(function () {});
      });
    } else {
      nativeBtn.style.display = "none"; // 不支持则隐藏
    }
  }

  /* 复制链接 */
  var copyBtn = document.getElementById("shareCopy");
  var toastEl = document.getElementById("shareToast");
  if (copyBtn && toastEl) {
    copyBtn.addEventListener("click", function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(SHARE_URL).then(function () { showToast(); }).catch(fallbackCopy);
      } else { fallbackCopy(); }
    });
    function fallbackCopy() {
      var ta = document.createElement("textarea");
      ta.value = SHARE_URL; ta.style.cssText = "position:fixed;opacity:0;";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); showToast(); } catch (_) {}
      document.body.removeChild(ta);
    }
    function showToast() {
      toastEl.textContent = root.getAttribute("data-lang") === "en" ? "Link copied!" : "链接已复制！";
      toastEl.classList.add("show");
      clearTimeout(toastEl._t);
      toastEl._t = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
    }
  }
})();
