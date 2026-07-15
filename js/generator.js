/* Build Your AI — generator.js
 * Turns the wizard state into finished text: a full Markdown profile plus
 * platform-specific variants (ChatGPT, Claude, generic system prompt) and a
 * plain-language summary. Pure functions — no DOM, no side effects.
 *
 * Expected state shape:
 *   {
 *     archetype: "organizer",
 *     role: "Organizer and executive assistant",
 *     personality: "Professional, proactive...",
 *     sliders:  { support:2, formality:3, length:1, tone:2, initiative:4, humor:1 },
 *     behaviors:["suggest_next","track_work"],
 *     modes:    ["secretary","planning"],
 *     memory:   { comm_prefs:true, personal:true, credentials:true, ... }
 *   }
 */
(function (BYAI) {
  "use strict";

  function byKey(list, key) {
    return list.filter(function (x) { return x.key === key; })[0] || null;
  }

  // --- section builders --------------------------------------------------

  function communicationLines(state) {
    var lines = [];
    BYAI.sliders.forEach(function (s) {
      var pos = state.sliders[s.key];
      if (typeof pos !== "number") pos = 2;
      lines.push(s.map[pos]);
    });
    // Communication-tagged behaviors join here too.
    BYAI.behaviors.forEach(function (b) {
      if (b.section === "communication" && state.behaviors.indexOf(b.key) !== -1) {
        lines.push(b.text);
      }
    });
    return lines;
  }

  function challengeLines(state) {
    var lines = [];
    BYAI.behaviors.forEach(function (b) {
      if (b.section === "challenge" && state.behaviors.indexOf(b.key) !== -1) {
        lines.push(b.text);
      }
    });
    return lines;
  }

  function initiativeLines(state) {
    var lines = [];
    BYAI.behaviors.forEach(function (b) {
      if (b.section === "initiative" && state.behaviors.indexOf(b.key) !== -1) {
        lines.push(b.text);
      }
    });
    return lines;
  }

  function memoryLines(state) {
    var out = { may: [], ask: [], never: [] };
    function collect(group, bucket) {
      group.items.forEach(function (item) {
        if (state.memory[item.key]) out[bucket].push(item.label);
      });
    }
    collect(BYAI.memory.mayRemember, "may");
    collect(BYAI.memory.askFirst, "ask");
    collect(BYAI.memory.never, "never");
    return out;
  }

  function modeLines(state) {
    return BYAI.taskModes
      .filter(function (m) { return state.modes.indexOf(m.key) !== -1; })
      .map(function (m) { return m.text; });
  }

  function bullets(lines) {
    return lines.map(function (l) { return "- " + l; }).join("\n");
  }

  // --- full Markdown profile --------------------------------------------

  function toMarkdown(state) {
    var mem = memoryLines(state);
    var parts = [];

    parts.push("# AI Interaction Profile");
    parts.push("");
    parts.push("## Primary Role");
    parts.push(state.role || "Personal assistant");
    parts.push("");
    parts.push("## Default Personality");
    parts.push(state.personality || "Balanced and adaptable.");
    parts.push("");
    parts.push("## Communication Style");
    parts.push(bullets(communicationLines(state)));

    var chal = challengeLines(state);
    if (chal.length) {
      parts.push("");
      parts.push("## Challenge and Feedback");
      parts.push(bullets(chal));
    }

    var init = initiativeLines(state);
    if (init.length) {
      parts.push("");
      parts.push("## Initiative");
      parts.push(bullets(init));
    }

    parts.push("");
    parts.push("## Memory Rules");
    if (mem.may.length) parts.push("- You may remember: " + mem.may.join(", ") + ".");
    if (mem.ask.length) parts.push("- Ask before remembering: " + mem.ask.join(", ") + ".");

    parts.push("");
    parts.push("## Privacy Boundaries");
    if (mem.never.length) {
      parts.push("- Never store: " + mem.never.join(", ") + ".");
    }
    parts.push("- Do not repeat sensitive information back unless I bring it up first.");

    var modes = modeLines(state);
    if (modes.length) {
      parts.push("");
      parts.push("## Task Modes");
      parts.push("When I name one of these, switch into it:");
      parts.push(bullets(modes));
    }

    return parts.join("\n") + "\n";
  }

  // --- platform variants -------------------------------------------------

  // ChatGPT splits into two boxes. Return an object so the UI can show both.
  function toChatGPT(state) {
    var mem = memoryLines(state);
    var about = [];
    about.push("I want you to act as my " + (state.role || "personal assistant").toLowerCase() + ".");
    about.push("Personality: " + (state.personality || "balanced and adaptable."));
    if (mem.may.length) about.push("You may remember: " + mem.may.join(", ") + ".");
    if (mem.ask.length) about.push("Ask before remembering: " + mem.ask.join(", ") + ".");
    if (mem.never.length) about.push("Never store: " + mem.never.join(", ") + ".");

    var how = [];
    communicationLines(state).forEach(function (l) { how.push(l); });
    challengeLines(state).forEach(function (l) { how.push(l); });
    initiativeLines(state).forEach(function (l) { how.push(l); });

    return {
      about: about.join(" "),
      how: how.map(function (l) { return "- " + l; }).join("\n")
    };
  }

  // Claude profile instructions: one clean prose+bullets block.
  function toClaude(state) {
    var mem = memoryLines(state);
    var out = [];
    out.push("Act as my " + (state.role || "personal assistant").toLowerCase() + ". " +
      (state.personality || "Be balanced and adaptable."));
    out.push("");
    out.push("How to work with me:");
    communicationLines(state).forEach(function (l) { out.push("- " + l); });
    challengeLines(state).forEach(function (l) { out.push("- " + l); });
    initiativeLines(state).forEach(function (l) { out.push("- " + l); });
    out.push("");
    out.push("Memory and privacy:");
    if (mem.may.length) out.push("- You may remember: " + mem.may.join(", ") + ".");
    if (mem.ask.length) out.push("- Ask before remembering: " + mem.ask.join(", ") + ".");
    if (mem.never.length) out.push("- Never store: " + mem.never.join(", ") + ".");
    return out.join("\n");
  }

  // Portable generic system prompt.
  function toGeneric(state) {
    var mem = memoryLines(state);
    var out = [];
    out.push("You are my " + (state.role || "personal assistant").toLowerCase() + ". " +
      (state.personality || "You are balanced and adaptable."));
    out.push("");
    out.push("Behavior:");
    communicationLines(state).forEach(function (l) { out.push("- " + l); });
    challengeLines(state).forEach(function (l) { out.push("- " + l); });
    initiativeLines(state).forEach(function (l) { out.push("- " + l); });
    if (mem.never.length) {
      out.push("");
      out.push("Constraints: never store " + mem.never.join(", ").toLowerCase() + ".");
    }
    var modes = modeLines(state);
    if (modes.length) {
      out.push("");
      out.push("Modes I may invoke by name:");
      modes.forEach(function (l) { out.push("- " + l); });
    }
    return out.join("\n");
  }

  // Plain-language summary of what was chosen.
  function toSummary(state) {
    var arche = BYAI.getArchetype(state.archetype);
    var mem = memoryLines(state);
    var out = [];
    out.push(arche ? ("You built " + arche.name + ".") : "You built a custom assistant.");
    out.push("");
    out.push("In plain terms, your AI will:");
    out.push("- Act as: " + (state.role || "a personal assistant") + ".");
    out.push("- Feel: " + (state.personality || "balanced and adaptable"));
    BYAI.sliders.forEach(function (s) {
      var pos = state.sliders[s.key];
      if (typeof pos !== "number") pos = 2;
      var word = pos < 2 ? s.left : pos > 2 ? s.right : "balanced (" + s.left + "/" + s.right + ")";
      out.push("- Be more " + word.toLowerCase() + ".");
    });
    if (mem.never.length) {
      out.push("- Keep private: " + mem.never.join(", ").toLowerCase() + ".");
    }
    return out.join("\n");
  }

  BYAI.generate = function (state) {
    return {
      markdown: toMarkdown(state),
      chatgpt: toChatGPT(state),
      claude: toClaude(state),
      generic: toGeneric(state),
      summary: toSummary(state)
    };
  };
})(window.BYAI = window.BYAI || {});
