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

  const interactiveEl = document.getElementById("interactive");

  function revealOutput() {
    if (outputEl) outputEl.hidden = false;
    if (interactiveEl) interactiveEl.hidden = false;
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

  /* ---------- Interactive terminal command line ---------- */
  const terminalEl = document.getElementById("terminal");
  const inputEl = document.getElementById("termInput");
  const logEl = document.getElementById("termLog");

  if (terminalEl && inputEl && logEl) {
    // Valid keywords are derived from the actual sections on the page,
    // so only real sections are navigable commands.
    const sections = Array.from(document.querySelectorAll("main section[id]"))
      .map(function (s) { return s.getAttribute("id"); });
    const builtins = ["help", "ls", "clear", "whoami", "cv"];
    const allCommands = sections.concat(builtins);
    const cvAliases = ["cv", "resume", "download", "download cv", "download resume"];

    const history = [];
    let historyIndex = -1; // points one past the newest entry

    function appendLine(text, kind) {
      const p = document.createElement("p");
      p.className = "line term-resp" + (kind ? " term-resp--" + kind : "");
      p.textContent = text;
      logEl.appendChild(p);
    }

    function echoCommand(raw) {
      const p = document.createElement("p");
      p.className = "line term-echo";
      p.innerHTML =
        '<span class="prompt">visitor@portfolio</span>' +
        '<span class="sep">:</span><span class="path">~</span>' +
        '<span class="dollar">$</span> ';
      p.appendChild(document.createTextNode(raw));
      logEl.appendChild(p);
    }

    function goToSection(id) {
      const target = document.getElementById(id);
      if (!target) return;
      appendLine("→ navigating to " + id, "ok");
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }

    function downloadCV() {
      appendLine("↓ downloading resume.pdf …", "ok");
      const a = document.createElement("a");
      a.href = "assets/resume.pdf";
      a.download = "Ayman-Bilal-Resume.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    function run(raw) {
      const cmd = raw.trim().toLowerCase();
      echoCommand(raw.trim());

      if (cmd === "") return;

      if (sections.indexOf(cmd) !== -1) {
        goToSection(cmd);
      } else if (cvAliases.indexOf(cmd) !== -1) {
        downloadCV();
      } else if (cmd === "help") {
        appendLine("available commands:", "");
        appendLine("  " + sections.join("  ") + "   → jump to a section", "");
        appendLine("  cv | download cv   download my resume (PDF)", "");
        appendLine("  ls       list page sections", "");
        appendLine("  clear    clear the terminal", "");
        appendLine("  whoami   about me", "");
      } else if (cmd === "ls") {
        appendLine(sections.join("   "), "");
      } else if (cmd === "clear") {
        logEl.innerHTML = "";
      } else if (cmd === "whoami") {
        goToSection("about");
      } else {
        appendLine("command not found: " + cmd + "  (try 'help')", "err");
      }
    }

    function complete() {
      const value = inputEl.value.trim().toLowerCase();
      if (!value) return;
      const matches = allCommands.filter(function (c) { return c.indexOf(value) === 0; });
      if (matches.length === 1) {
        inputEl.value = matches[0];
      } else if (matches.length > 1) {
        appendLine(matches.join("   "), "");
      }
    }

    // Click anywhere in the terminal focuses the prompt (unless selecting text / a link).
    terminalEl.addEventListener("click", function (e) {
      if (e.target.tagName === "A") return;
      if (window.getSelection && String(window.getSelection())) return;
      inputEl.focus();
    });

    inputEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        const raw = inputEl.value;
        if (raw.trim() !== "") {
          history.push(raw.trim());
        }
        historyIndex = history.length;
        run(raw);
        inputEl.value = "";
        logEl.scrollTop = logEl.scrollHeight;
      } else if (e.key === "ArrowUp") {
        if (history.length && historyIndex > 0) {
          historyIndex--;
          inputEl.value = history[historyIndex];
        }
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        if (historyIndex < history.length - 1) {
          historyIndex++;
          inputEl.value = history[historyIndex];
        } else {
          historyIndex = history.length;
          inputEl.value = "";
        }
        e.preventDefault();
      } else if (e.key === "Tab") {
        complete();
        e.preventDefault();
      }
    });
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
