/* ============================================================
   Ayman Bilal — Portfolio  |  interactions
   ============================================================ */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Hero: typed `whoami` ---------- */
  const typedEl = document.getElementById("typed");
  const cursorEl = document.getElementById("cursor");
  const outputEl = document.getElementById("output");
  const command = "whoami";

  function revealOutput() {
    if (outputEl) outputEl.hidden = false;
  }

  if (typedEl && outputEl) {
    if (reduceMotion) {
      typedEl.textContent = command;
      revealOutput();
    } else {
      let i = 0;
      const speed = 110;
      const tick = function () {
        if (i <= command.length) {
          typedEl.textContent = command.slice(0, i);
          i++;
          setTimeout(tick, speed);
        } else {
          setTimeout(revealOutput, 350);
        }
      };
      setTimeout(tick, 600);
    }
  }

  /* ---------- Mobile nav toggle ---------- */
  const toggle = document.getElementById("navToggle");
  const links = document.querySelector(".nav__links");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      const open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    // Close on link click (mobile)
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Sticky nav border on scroll ---------- */
  const nav = document.querySelector(".nav");
  const onScroll = function () {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 10);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll("main section[id]");
  const navAnchors = document.querySelectorAll('.nav__links a[href^="#"]');
  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navAnchors.forEach(function (a) {
              a.classList.toggle("active", a.getAttribute("href") === "#" + id);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
