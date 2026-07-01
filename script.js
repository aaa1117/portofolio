/* ============================================================
   Ayman Bilal — Portfolio  |  SOC console interactions
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Boot sequence (once per session) ---------- */
  var bootEl = document.getElementById("boot");
  var bootLog = document.getElementById("bootLog");
  var BOOT_KEY = "ayman-soc-booted";
  var bootDone = false;

  function endBoot() {
    if (bootDone || !bootEl) return;
    bootDone = true;
    try { sessionStorage.setItem(BOOT_KEY, "1"); } catch (e) { /* private mode */ }
    bootEl.classList.add("done");
    setTimeout(function () { bootEl.remove(); }, 500);
    document.removeEventListener("keydown", endBoot);
    document.removeEventListener("click", endBoot);
  }

  (function runBoot() {
    if (!bootEl || !bootLog) return;
    var seen = false;
    try { seen = sessionStorage.getItem(BOOT_KEY) === "1"; } catch (e) { /* ignore */ }
    if (reduceMotion || seen) { bootEl.remove(); return; }

    var lines = [
      "> ayman-soc bios v2.0",
      "> loading kernel modules .......... [OK]",
      "> mounting /dev/blueteam .......... [OK]",
      "> starting wazuh-manager .......... [OK]",
      "> arming honeypot ................. [OK]",
      "> verifying visitor credentials ... [OK]",
      "> access granted — welcome"
    ];

    bootEl.hidden = false;
    bootEl.setAttribute("aria-hidden", "false");
    document.addEventListener("keydown", endBoot);
    document.addEventListener("click", endBoot);

    var i = 0;
    (function next() {
      if (bootDone) return;
      if (i < lines.length) {
        var span = document.createElement("span");
        var text = lines[i];
        if (text.indexOf("[OK]") !== -1) {
          span.appendChild(document.createTextNode(text.replace(" [OK]", " ")));
          var ok = document.createElement("span");
          ok.className = "ok";
          ok.textContent = "[OK]";
          span.appendChild(ok);
        } else {
          span.textContent = text;
        }
        span.appendChild(document.createTextNode("\n"));
        bootLog.appendChild(span);
        i++;
        setTimeout(next, 150 + Math.random() * 120);
      } else {
        setTimeout(endBoot, 420);
      }
    })();
  })();

  /* ---------- Clocks & uptime ---------- */
  var navClock = document.getElementById("navClock");
  var utcClock = document.getElementById("utcClock");
  var uptimeEl = document.getElementById("uptime");
  var t0 = Date.now();

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function tickClock() {
    var now = new Date();
    var hh = pad(now.getUTCHours());
    var mm = pad(now.getUTCMinutes());
    var ss = pad(now.getUTCSeconds());
    var stamp = hh + ":" + mm + ":" + ss + " UTC";
    if (navClock) navClock.textContent = stamp;
    if (utcClock) utcClock.textContent = stamp;
    if (uptimeEl) {
      var s = Math.floor((Date.now() - t0) / 1000);
      uptimeEl.textContent = pad(Math.floor(s / 60)) + ":" + pad(s % 60);
    }
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------- Simulated log feed ---------- */
  var feedEl = document.getElementById("feed");

  if (feedEl) {
    var templates = [
      { src: "sshd", msg: "Accepted publickey for ayman from 10.0.0.7 port 51442", kind: "info" },
      { src: "sshd", msg: "Failed password for root from 45.155.x.x — attempt 3", kind: "warn" },
      { src: "sshd", msg: "Invalid user admin from 185.220.x.x", kind: "warn" },
      { src: "wazuh", msg: "rule 5710 (sshd brute force) triggered — level 10", kind: "alert" },
      { src: "wazuh", msg: "agent 003 keepalive — status healthy", kind: "ok" },
      { src: "wazuh", msg: "syscheck: integrity checksum ok on /etc/passwd", kind: "info" },
      { src: "honeypot", msg: "new connection from 91.204.x.x:52011 (SSH decoy)", kind: "warn" },
      { src: "honeypot", msg: "credential harvesting attempt captured — logged", kind: "alert" },
      { src: "kafka", msg: "consumer lag=0 topic=auth-logs partition=2", kind: "info" },
      { src: "kafka", msg: "ingested batch: 512 events → topic=syslog", kind: "info" },
      { src: "keycloak", msg: "token issued client=portal grant=password", kind: "info" },
      { src: "wazuh", msg: "active-response: dropped 185.220.x.x for 600s", kind: "ok" }
    ];
    var feedPaused = false;
    var lastIdx = -1;

    var addFeedLine = function () {
      var idx;
      do { idx = Math.floor(Math.random() * templates.length); } while (idx === lastIdx);
      lastIdx = idx;
      var t = templates[idx];
      var now = new Date();
      var p = document.createElement("p");
      p.className = "feed__line feed__line--" + t.kind;

      var ts = document.createElement("span");
      ts.className = "feed__ts";
      ts.textContent = pad(now.getUTCHours()) + ":" + pad(now.getUTCMinutes()) + ":" + pad(now.getUTCSeconds()) + " ";
      var src = document.createElement("span");
      src.className = "feed__src";
      src.textContent = t.src + ": ";

      p.appendChild(ts);
      p.appendChild(src);
      p.appendChild(document.createTextNode(t.msg));
      feedEl.appendChild(p);
      while (feedEl.children.length > 14) feedEl.removeChild(feedEl.firstChild);
    };

    for (var f = 0; f < 6; f++) addFeedLine();

    if (!reduceMotion) {
      feedEl.parentElement.addEventListener("pointerenter", function () { feedPaused = true; });
      feedEl.parentElement.addEventListener("pointerleave", function () { feedPaused = false; });
      setInterval(function () { if (!feedPaused) addFeedLine(); }, 1900);
    }
  }

  /* ---------- Interactive terminal ---------- */
  var terminalEl = document.getElementById("terminal");
  var inputEl = document.getElementById("termInput");
  var logEl = document.getElementById("termLog");

  if (terminalEl && inputEl && logEl) {
    var sections = Array.prototype.map.call(
      document.querySelectorAll("main section[id]"),
      function (s) { return s.getAttribute("id"); }
    );
    var aliases = {
      about: "profile",
      skills: "arsenal",
      projects: "casefiles",
      experience: "record",
      education: "record"
    };
    var builtins = ["help", "ls", "clear", "whoami", "cv"];
    var allCommands = sections.concat(builtins);
    var cvAliases = ["cv", "resume", "download", "download cv", "download resume"];

    var history = [];
    var historyIndex = 0;

    var appendLine = function (text, kind) {
      var p = document.createElement("p");
      p.className = "line term-resp" + (kind ? " term-resp--" + kind : "");
      p.textContent = text;
      logEl.appendChild(p);
    };

    var echoCommand = function (raw) {
      var p = document.createElement("p");
      p.className = "line term-echo";
      p.innerHTML =
        '<span class="prompt">visitor@ayman-soc</span>' +
        '<span class="sep">:</span><span class="path">~</span>' +
        '<span class="dollar">$</span> ';
      p.appendChild(document.createTextNode(raw));
      logEl.appendChild(p);
    };

    var goToSection = function (id) {
      var target = document.getElementById(id);
      if (!target) return;
      appendLine("→ opening " + id, "ok");
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    };

    var downloadCV = function () {
      appendLine("↓ downloading resume.pdf …", "ok");
      var a = document.createElement("a");
      a.href = "assets/resume.pdf";
      a.download = "Ayman-Bilal-Resume.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    var run = function (raw) {
      var cmd = raw.trim().toLowerCase();
      echoCommand(raw.trim());

      if (cmd === "") return;

      if (aliases[cmd]) cmd = aliases[cmd];

      if (sections.indexOf(cmd) !== -1) {
        goToSection(cmd);
      } else if (cvAliases.indexOf(cmd) !== -1) {
        downloadCV();
      } else if (cmd === "help") {
        appendLine("available commands:", "");
        appendLine("  " + sections.join("  ") + "   → jump to a section", "");
        appendLine("  cv       download my resume (PDF)", "");
        appendLine("  whoami   analyst summary", "");
        appendLine("  ls       list sections   ·   clear   wipe terminal", "");
      } else if (cmd === "ls") {
        appendLine(sections.join("   "), "");
      } else if (cmd === "clear") {
        logEl.innerHTML = "";
      } else if (cmd === "whoami") {
        appendLine("ayman bilal — SOC analyst / blue team", "");
        appendLine("focus  : wazuh siem · threat detection · log pipelines", "");
        appendLine("langs  : arabic (native) · english", "");
        appendLine("status : open to junior SOC roles", "ok");
      } else if (cmd === "sudo" || cmd.indexOf("sudo ") === 0) {
        appendLine("visitor is not in the sudoers file.", "err");
        appendLine("this incident has been reported to the SOC. (that's me.)", "");
      } else if (cmd === "nmap" || cmd.indexOf("nmap ") === 0) {
        appendLine("⚠ scan detected — visitor added to watchlist… kidding.", "err");
        appendLine("try 'casefiles' to see what I actually monitor.", "");
      } else {
        appendLine("command not found: " + cmd + "  (try 'help')", "err");
      }
    };

    var complete = function () {
      var value = inputEl.value.trim().toLowerCase();
      if (!value) return;
      var matches = allCommands.filter(function (c) { return c.indexOf(value) === 0; });
      if (matches.length === 1) {
        inputEl.value = matches[0];
      } else if (matches.length > 1) {
        appendLine(matches.join("   "), "");
      }
    };

    terminalEl.addEventListener("click", function (e) {
      if (e.target.tagName === "A") return;
      if (window.getSelection && String(window.getSelection())) return;
      inputEl.focus();
    });

    inputEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var raw = inputEl.value;
        if (raw.trim() !== "") history.push(raw.trim());
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
  var toggle = document.getElementById("navToggle");
  var links = document.querySelector(".nav__links");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Sticky nav border on scroll ---------- */
  var nav = document.querySelector(".nav");
  var onScroll = function () {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 10);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
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
  var spySections = document.querySelectorAll("main section[id]");
  var navAnchors = document.querySelectorAll('.nav__links a[href^="#"]');
  if ("IntersectionObserver" in window && spySections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute("id");
            navAnchors.forEach(function (a) {
              a.classList.toggle("active", a.getAttribute("href") === "#" + id);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    spySections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
