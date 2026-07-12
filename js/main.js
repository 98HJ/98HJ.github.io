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

  /* ---------- 3D 头像交互:指针倾斜(通过 CSS 变量驱动) + 拖拽旋转 + 空闲摆动 ---------- */
  var heroPhoto = document.querySelector(".hero-photo");
  var stage = document.querySelector(".photo-3d");
  var reduce3d = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (heroPhoto && stage && !reduce3d) {
    var MAX_TILT = 14;
    function setTilt(rx, ry) {
      stage.style.setProperty("--rx", rx + "deg");
      stage.style.setProperty("--ry", ry + "deg");
    }

    if (canHover) {
      /* 悬停:跟随指针轻微倾斜(视差) */
      heroPhoto.addEventListener("pointermove", function (e) {
        if (dragging) return;
        var r = heroPhoto.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        setTilt((-py * MAX_TILT).toFixed(2), (px * MAX_TILT).toFixed(2));
      });
      heroPhoto.addEventListener("pointerleave", function () {
        if (dragging) return;
        setTilt(0, 0);
      });

      /* 拖拽:手动旋转头像(Y/X 轴),松开后回弹到空闲摆动 */
      var dragging = false, lastX = 0, lastY = 0, baseRY = 0, baseRX = 0;
      heroPhoto.addEventListener("pointerdown", function (e) {
        dragging = true; lastX = e.clientX; lastY = e.clientY;
        heroPhoto.classList.add("is-dragging");
        try { heroPhoto.setPointerCapture(e.pointerId); } catch (_) {}
      });
      heroPhoto.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        var dx = e.clientX - lastX, dy = e.clientY - lastY;
        lastX = e.clientX; lastY = e.clientY;
        baseRY = Math.max(-42, Math.min(42, baseRY + dx * 0.6));
        baseRX = Math.max(-22, Math.min(22, baseRX - dy * 0.4));
        setTilt(baseRX.toFixed(2), baseRY.toFixed(2));
      });
      function endDrag(e) {
        if (!dragging) return;
        dragging = false; baseRY = 0; baseRX = 0;
        heroPhoto.classList.remove("is-dragging");
        setTilt(0, 0); /* 释放后交还给空闲摆动动画 */
        try { heroPhoto.releasePointerCapture(e.pointerId); } catch (_) {}
      }
      heroPhoto.addEventListener("pointerup", endDrag);
      heroPhoto.addEventListener("pointercancel", endDrag);
    }
  }
})();
