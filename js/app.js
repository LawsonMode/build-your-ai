/* Build Your AI — app.js
 * The wizard: state, rendering, navigation, localStorage, preview, and export.
 * No framework, no build step. Shares window.BYAI with the data + generator.
 */
(function (BYAI) {
  "use strict";

  var STORE_KEY = "byai.state.v1";
  var STEPS = ["Archetype", "Traits", "Behaviors", "Memory", "Preview", "Export"];

  var state = null;   // current wizard state
  var step = 0;       // current step index
  var toastTimer = null;
  var previewScenario = 0; // which sample prompt the Preview step is showing

  // --- helpers -----------------------------------------------------------

  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (attrs[k] == null) return; // skip null/undefined so we don't set e.g. disabled="null"
        if (k === "class") node.className = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k.indexOf("on") === 0 && typeof attrs[k] === "function") {
          node.addEventListener(k.slice(2), attrs[k]);
        } else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }
  function clamp(n) { return Math.max(0, Math.min(4, n)); }

  function defaultMemory() {
    var m = {};
    [BYAI.memory.mayRemember, BYAI.memory.askFirst, BYAI.memory.never].forEach(function (g) {
      g.items.forEach(function (item) { m[item.key] = !!item.default; });
    });
    return m;
  }

  function freshState() {
    return {
      archetype: null,
      role: "",
      personality: "",
      sliders: { support: 2, formality: 2, length: 2, tone: 2, initiative: 2, humor: 2 },
      behaviors: [],
      modes: [],
      memory: defaultMemory()
    };
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.sliders) return null;
      return parsed;
    } catch (e) { return null; }
  }

  function applyArchetype(key) {
    var a = BYAI.getArchetype(key);
    if (!a) return;
    state.archetype = a.key;
    state.role = a.role;
    state.personality = a.personality;
    state.sliders = {
      support: a.sliders.support, formality: a.sliders.formality, length: a.sliders.length,
      tone: a.sliders.tone, initiative: a.sliders.initiative, humor: a.sliders.humor
    };
    state.behaviors = a.behaviors.slice();
    state.modes = a.modes.slice();
    if (!state.memory) state.memory = defaultMemory();
    save();
  }

  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 1800);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast("Copied to clipboard"); },
        function () { legacyCopy(text); });
    } else legacyCopy(text);
  }
  function legacyCopy(text) {
    var ta = el("textarea"); ta.value = text;
    ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); toast("Copied to clipboard"); }
    catch (e) { toast("Copy failed — select and copy manually"); }
    document.body.removeChild(ta);
  }
  function download(filename, text) {
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = el("a", { href: url, download: filename });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("Downloaded " + filename);
  }

  // --- step renderers ----------------------------------------------------

  function renderArchetypeStep(body) {
    body.appendChild(el("h2", { text: "1. What should your AI be?" }));
    body.appendChild(el("p", { class: "step-hint", text: "Pick a starting point. You can tweak everything after — this just fills in sensible defaults." }));

    var grid = el("div", { class: "card-grid" });
    BYAI.archetypes.forEach(function (a) {
      var selected = state.archetype === a.key;
      var card = el("button", {
        class: "archetype-card" + (selected ? " selected" : ""),
        type: "button",
        onclick: function () {
          applyArchetype(a.key);
          renderStep(); // reflect selection
        }
      }, [
        el("div", { class: "archetype-emoji", text: a.emoji }),
        el("div", { class: "archetype-name", text: a.name }),
        el("div", { class: "archetype-blurb", text: a.blurb })
      ]);
      grid.appendChild(card);
    });
    body.appendChild(grid);
  }

  function renderTraitsStep(body) {
    body.appendChild(el("h2", { text: "2. Mix the personality" }));
    body.appendChild(el("p", { class: "step-hint", text: "Slide toward whichever end fits you. The middle means “adapt to the moment.”" }));

    BYAI.sliders.forEach(function (s) {
      var val = state.sliders[s.key];
      var labelRow = el("div", { class: "slider-labels" }, [
        el("span", { text: s.left }),
        el("span", { class: "slider-caption", text: s.map[val] }),
        el("span", { text: s.right })
      ]);
      var input = el("input", {
        type: "range", min: "0", max: "4", step: "1", value: String(val),
        class: "slider", "aria-label": s.left + " to " + s.right
      });
      input.addEventListener("input", function () {
        state.sliders[s.key] = parseInt(input.value, 10);
        $(".slider-caption", wrap).textContent = s.map[state.sliders[s.key]];
        save();
      });
      var wrap = el("div", { class: "slider-block" }, [labelRow, input]);
      body.appendChild(wrap);
    });

    // Editable role + personality
    var roleField = el("input", { type: "text", class: "text-field", value: state.role, placeholder: "e.g. Organizer and executive assistant" });
    roleField.addEventListener("input", function () { state.role = roleField.value; save(); });
    var persField = el("textarea", { class: "text-field", rows: "2", placeholder: "One line: how it should feel to work with." });
    persField.value = state.personality;
    persField.addEventListener("input", function () { state.personality = persField.value; save(); });

    body.appendChild(el("div", { class: "field-block" }, [
      el("label", { class: "field-label", text: "Primary role" }), roleField
    ]));
    body.appendChild(el("div", { class: "field-block" }, [
      el("label", { class: "field-label", text: "Default personality" }), persField
    ]));
  }

  function checkGroup(items, isChecked, onToggle, describe) {
    var group = el("div", { class: "check-grid" });
    items.forEach(function (item) {
      var id = "chk-" + item.key;
      var input = el("input", { type: "checkbox", id: id });
      input.checked = isChecked(item.key);
      input.addEventListener("change", function () { onToggle(item.key, input.checked); });
      var lbl = el("label", { class: "check-item", for: id }, [
        input,
        el("span", { class: "check-text" }, [
          el("span", { class: "check-title", text: item.label }),
          describe ? el("span", { class: "check-desc", text: describe(item) }) : null
        ])
      ]);
      group.appendChild(lbl);
    });
    return group;
  }

  function renderBehaviorsStep(body) {
    body.appendChild(el("h2", { text: "3. How should it behave?" }));
    body.appendChild(el("p", { class: "step-hint", text: "Turn on the working habits you want. None are required." }));

    body.appendChild(el("h3", { class: "sub-head", text: "Behavior rules" }));
    body.appendChild(checkGroup(
      BYAI.behaviors,
      function (k) { return state.behaviors.indexOf(k) !== -1; },
      function (k, on) {
        var i = state.behaviors.indexOf(k);
        if (on && i === -1) state.behaviors.push(k);
        if (!on && i !== -1) state.behaviors.splice(i, 1);
        save();
      }
    ));

    body.appendChild(el("h3", { class: "sub-head", text: "Task modes it should understand" }));
    body.appendChild(el("p", { class: "step-hint", text: "Modes you can invoke by name later, e.g. “go into Critic Mode.”" }));
    body.appendChild(checkGroup(
      BYAI.taskModes,
      function (k) { return state.modes.indexOf(k) !== -1; },
      function (k, on) {
        var i = state.modes.indexOf(k);
        if (on && i === -1) state.modes.push(k);
        if (!on && i !== -1) state.modes.splice(i, 1);
        save();
      },
      function (item) { return item.text.replace(/^[^—]*—\s*/, ""); }
    ));
  }

  function renderMemoryStep(body) {
    body.appendChild(el("h2", { text: "4. Memory & privacy" }));
    body.appendChild(el("p", { class: "step-hint", text: "Defaults are privacy-forward. Loosen or tighten as you like — the “never store” tier is a good one to keep." }));

    [BYAI.memory.mayRemember, BYAI.memory.askFirst, BYAI.memory.never].forEach(function (g) {
      body.appendChild(el("h3", { class: "sub-head", text: g.title }));
      body.appendChild(checkGroup(
        g.items,
        function (k) { return !!state.memory[k]; },
        function (k, on) { state.memory[k] = on; save(); }
      ));
    });
  }

  function quickAdjust(label, fn) {
    return el("button", { class: "chip", type: "button", onclick: function () {
      fn(); save(); renderStep();
      toast("Adjusted: " + label);
    }, text: label });
  }

  function renderPreviewStep(body) {
    body.appendChild(el("h2", { text: "5. Preview" }));
    body.appendChild(el("p", { class: "step-hint", text: "Here's the profile you've built. Use the quick nudges to fine-tune, then head to Export." }));

    var s = state.sliders;
    var chips = el("div", { class: "chip-row" }, [
      quickAdjust("More supportive", function () { s.support = clamp(s.support - 1); }),
      quickAdjust("More critical", function () { s.support = clamp(s.support + 1); }),
      quickAdjust("Shorter", function () { s.length = clamp(s.length - 1); }),
      quickAdjust("More detailed", function () { s.length = clamp(s.length + 1); }),
      quickAdjust("Blunter", function () { s.tone = clamp(s.tone + 1); }),
      quickAdjust("Less robotic", function () { s.humor = clamp(s.humor + 1); s.formality = clamp(s.formality - 1); }),
      quickAdjust("More proactive", function () { s.initiative = clamp(s.initiative + 1); })
    ]);
    body.appendChild(chips);

    // Live sample-response panel — recomposes from current settings (no API).
    body.appendChild(renderSamplePanel());

    body.appendChild(el("h3", { class: "sub-head", text: "Your full profile" }));
    var out = BYAI.generate(state);
    body.appendChild(el("pre", { class: "profile-preview", text: out.markdown }));
  }

  function renderSamplePanel() {
    var panel = el("div", { class: "sample-panel" });
    panel.appendChild(el("h3", { class: "sub-head", text: "See it in action" }));

    var tabs = el("div", { class: "tab-row" });
    BYAI.sampleScenarios.forEach(function (sc, i) {
      tabs.appendChild(el("button", {
        class: "tab" + (i === previewScenario ? " active" : ""),
        type: "button",
        onclick: function () { previewScenario = i; renderStep(); },
        text: sc.label
      }));
    });
    panel.appendChild(tabs);

    var sc = BYAI.sampleScenarios[previewScenario];
    var chat = el("div", { class: "chat" }, [
      el("div", { class: "bubble user" }, [
        el("div", { class: "bubble-who", text: "You" }),
        el("div", { text: sc.userPrompt })
      ]),
      el("div", { class: "bubble ai" }, [
        el("div", { class: "bubble-who", text: "Your AI" }),
        el("div", { class: "bubble-body", text: BYAI.sampleResponse(state, sc) })
      ])
    ]);
    panel.appendChild(chat);
    panel.appendChild(el("p", { class: "sample-note",
      text: "Sample only — assembled from your settings to show the feel, not a real AI reply. Nudge the dials above and watch it change." }));
    return panel;
  }

  function renderExportStep(body) {
    body.appendChild(el("h2", { text: "6. Export" }));
    body.appendChild(el("p", { class: "step-hint", text: "Copy the version that fits where you'll use it, or download the full Markdown profile." }));

    var out = BYAI.generate(state);

    // tabs
    var tabRow = el("div", { class: "tab-row" });
    var pane = el("pre", { class: "profile-preview" });
    var current = "markdown";

    function contentFor(key) {
      if (key === "chatgpt") {
        return "— What ChatGPT should know about me —\n" + out.chatgpt.about +
          "\n\n— How ChatGPT should respond —\n" + out.chatgpt.how;
      }
      return out[key];
    }
    function selectTab(key) {
      current = key;
      pane.textContent = contentFor(key);
      Array.prototype.forEach.call(tabRow.children, function (btn) {
        btn.classList.toggle("active", btn.getAttribute("data-key") === key);
      });
    }

    BYAI.platforms.forEach(function (p) {
      tabRow.appendChild(el("button", {
        class: "tab", type: "button", "data-key": p.key,
        onclick: function () { selectTab(p.key); }, text: p.label
      }));
    });

    body.appendChild(tabRow);
    body.appendChild(pane);

    var actions = el("div", { class: "action-row" }, [
      el("button", { class: "btn primary", type: "button", text: "Copy this version",
        onclick: function () { copyText(contentFor(current)); } }),
      el("button", { class: "btn", type: "button", text: "Download Markdown profile",
        onclick: function () { download("ai-interaction-profile.md", out.markdown); } }),
      el("button", { class: "btn", type: "button", text: "Download plain text",
        onclick: function () { download("ai-interaction-profile.txt", out.summary + "\n\n" + out.generic); } }),
      el("button", { class: "btn ghost", type: "button", text: "Start over",
        onclick: function () {
          if (confirm("Clear everything and start a new profile?")) {
            state = freshState(); step = 0; save(); renderStep();
          }
        } })
    ]);
    body.appendChild(actions);

    selectTab("markdown");
  }

  // --- shell -------------------------------------------------------------

  function renderStepper() {
    var nav = $("#stepper");
    nav.innerHTML = "";
    STEPS.forEach(function (name, i) {
      var canGo = i === 0 || state.archetype;
      var b = el("button", {
        class: "stepper-item" + (i === step ? " current" : "") + (i < step ? " done" : ""),
        type: "button",
        onclick: function () { if (canGo) { step = i; renderStep(); } },
        disabled: canGo ? null : "disabled"
      }, [
        el("span", { class: "stepper-num", text: String(i + 1) }),
        el("span", { class: "stepper-label", text: name })
      ]);
      nav.appendChild(b);
    });
  }

  function renderNav() {
    var back = $("#nav-back");
    var next = $("#nav-next");
    back.style.visibility = step === 0 ? "hidden" : "visible";
    if (step === STEPS.length - 1) {
      next.style.visibility = "hidden";
    } else {
      next.style.visibility = "visible";
      next.disabled = !state.archetype;
      next.textContent = step === 0 ? "Next →" : "Next →";
    }
  }

  function renderStep() {
    renderStepper();
    var body = $("#wizard-body");
    body.innerHTML = "";
    switch (step) {
      case 0: renderArchetypeStep(body); break;
      case 1: renderTraitsStep(body); break;
      case 2: renderBehaviorsStep(body); break;
      case 3: renderMemoryStep(body); break;
      case 4: renderPreviewStep(body); break;
      case 5: renderExportStep(body); break;
    }
    renderNav();
    body.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function initTheme() {
    var toggle = $("#theme-toggle");
    var saved = null;
    try { saved = localStorage.getItem("byai.theme"); } catch (e) {}
    if (saved) document.documentElement.setAttribute("data-theme", saved);
    toggle.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme");
      var nextTheme = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", nextTheme);
      try { localStorage.setItem("byai.theme", nextTheme); } catch (e) {}
    });
  }

  function init() {
    state = load() || freshState();
    initTheme();
    $("#nav-back").addEventListener("click", function () { if (step > 0) { step--; renderStep(); } });
    $("#nav-next").addEventListener("click", function () {
      if (!state.archetype) { toast("Pick a starting archetype first"); return; }
      if (step < STEPS.length - 1) { step++; renderStep(); }
    });
    renderStep();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else init();
})(window.BYAI = window.BYAI || {});
