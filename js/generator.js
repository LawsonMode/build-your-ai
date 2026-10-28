/* Build Your AI — generator.js
 * Turns the wizard state into finished text: Claude-first outputs (all-chats
 * instructions, Project instructions, a task-mode Skill, CLAUDE.md), versions
 * for other AIs (ChatGPT, Gemini, Copilot, generic system prompt), a full
 * Markdown profile, and a plain-language summary. Pure functions — no DOM, no
 * side effects.
 *
 * Every output is built from the same sections (see `sections`), so a choice
 * made in the wizard never silently drops out of one platform's version.
 *
 * Expected state shape:
 *   {
 *     archetype: "organizer",
 *     about:    { name:"Sam", work:"Teacher", uses:"Lesson planning", expertise:"some" },
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
  function trimmed(v) { return (v || "").replace(/\s+/g, " ").trim(); }
  function sentence(v) {
    v = trimmed(v);
    if (!v) return "";
    return /[.!?]$/.test(v) ? v : v + ".";
  }
  function lowerFirst(v) { return v ? v.charAt(0).toLowerCase() + v.slice(1) : v; }
  function bullets(lines) {
    return lines.map(function (l) { return "- " + l; }).join("\n");
  }

  // --- shared sections ---------------------------------------------------

  function aboutLines(state) {
    var a = state.about || {};
    var lines = [];
    if (trimmed(a.name)) lines.push("Call me " + sentence(a.name));
    if (trimmed(a.work)) lines.push("What I do: " + sentence(a.work));
    if (trimmed(a.uses)) lines.push("What I'll mostly use you for: " + sentence(a.uses));
    var exp = byKey(BYAI.expertise, a.expertise || "");
    if (exp && exp.text) lines.push(exp.text);
    return lines;
  }

  function styleLines(state) {
    var lines = [];
    BYAI.sliders.forEach(function (s) {
      var pos = state.sliders[s.key];
      if (typeof pos !== "number") pos = 2;
      lines.push(s.map[pos]);
    });
    return lines;
  }

  function behaviorLines(state, section) {
    return BYAI.behaviors
      .filter(function (b) { return b.section === section && state.behaviors.indexOf(b.key) !== -1; })
      .map(function (b) { return b.text; });
  }

  function chosenModes(state) {
    return BYAI.taskModes.filter(function (m) { return state.modes.indexOf(m.key) !== -1; });
  }

  function memoryLists(state) {
    var out = { may: [], ask: [], never: [] };
    function collect(group, bucket) {
      group.items.forEach(function (item) {
        if (state.memory[item.key]) out[bucket].push(lowerFirst(item.label));
      });
    }
    collect(BYAI.memory.mayRemember, "may");
    collect(BYAI.memory.askFirst, "ask");
    collect(BYAI.memory.never, "never");
    return out;
  }

  // Memory rules as instruction lines. Claude follows instructions better when
  // it knows the reason, so each tier carries a short "why" unless `brief`.
  // Items are joined with semicolons because some labels contain commas.
  function memoryRuleLines(state, brief) {
    var mem = memoryLists(state);
    var lines = [];
    function why(text) { return brief ? "" : " " + text; }
    if (mem.may.length) lines.push("You may remember: " + mem.may.join("; ") + "." + why("These help you work with me without me repeating myself."));
    if (mem.ask.length) lines.push("Ask me before remembering: " + mem.ask.join("; ") + "." + why("I want to decide which personal details you keep."));
    if (mem.never.length) lines.push("Never store: " + mem.never.join("; ") + "." + why("If I share any of this, use it only for the task at hand."));
    lines.push("Don't repeat sensitive information back unless I bring it up first.");
    return lines;
  }

  function sections(state) {
    var role = trimmed(state.role) || "Personal assistant";
    return {
      about: aboutLines(state),
      role: role,
      roleLower: lowerFirst(role),
      personality: sentence(state.personality) || "Balanced and adaptable.",
      style: styleLines(state).concat(behaviorLines(state, "communication")),
      challenge: behaviorLines(state, "challenge"),
      initiative: behaviorLines(state, "initiative"),
      modes: chosenModes(state),
      memory: memoryRuleLines(state)
    };
  }

  function howLines(sec) {
    return sec.style.concat(sec.challenge, sec.initiative);
  }
  function modeLines(sec) {
    return sec.modes.map(function (m) { return m.text; });
  }
  var MODE_INTRO = "When I name one of these modes, switch into it and stay in it until I name another or say \"normal mode\":";

  // --- Claude ------------------------------------------------------------

  // Account-wide instructions (Settings → Your Claude → Instructions).
  function toClaude(state) {
    var sec = sections(state);
    var out = [];
    if (sec.about.length) {
      out.push("About me:");
      out.push(bullets(sec.about));
      out.push("");
    }
    out.push("Act as my " + sec.roleLower + ". " + sec.personality);
    out.push("");
    out.push("How to work with me:");
    out.push(bullets(howLines(sec)));
    if (sec.modes.length) {
      out.push("");
      out.push(MODE_INTRO);
      out.push(bullets(modeLines(sec)));
    }
    out.push("");
    out.push("Memory and privacy:");
    out.push(bullets(sec.memory));
    return out.join("\n");
  }

  // Project instructions. Longer and wrapped in XML-style tags, which Claude
  // uses to keep sections apart.
  function toClaudeProject(state) {
    var sec = sections(state);
    var out = [];
    function block(tag, lines) {
      out.push("<" + tag + ">");
      lines.forEach(function (l) { out.push(l); });
      out.push("</" + tag + ">");
      out.push("");
    }
    if (sec.about.length) block("about_me", [bullets(sec.about)]);
    block("role", ["In this project, act as my " + sec.roleLower + ". " + sec.personality]);
    block("communication_style", [bullets(sec.style)]);
    if (sec.challenge.length) block("feedback", [bullets(sec.challenge)]);
    if (sec.initiative.length) block("initiative", [bullets(sec.initiative)]);
    if (sec.modes.length) {
      var modeOut = [MODE_INTRO];
      sec.modes.forEach(function (m) {
        modeOut.push("- " + m.text);
        (m.detail || []).forEach(function (d) { modeOut.push("  - " + d); });
      });
      block("modes", modeOut);
    }
    block("memory_and_privacy", [bullets(sec.memory)]);
    return out.join("\n").trim();
  }

  // A Claude Skill (SKILL.md) that teaches the chosen task modes. Returns ""
  // when no modes are chosen.
  BYAI.skillName = "my-task-modes";
  function toClaudeSkill(state) {
    var sec = sections(state);
    if (!sec.modes.length) return "";
    var names = sec.modes.map(function (m) { return m.label + " Mode"; });
    var out = [];
    out.push("---");
    out.push("name: " + BYAI.skillName);
    out.push("description: Switches into one of my named working modes (" + names.join(", ") +
      ") when I ask for it by name, for example \"go into " + names[0] + "\". Use whenever I mention one of these modes.");
    out.push("---");
    out.push("");
    out.push("# My task modes");
    out.push("");
    out.push("When I name one of the modes below, switch into it and stay in it until I name another mode or say \"normal mode\". " +
      "Say which mode you're in at the start of your first reply in it. Keep following my usual preferences while in a mode.");
    sec.modes.forEach(function (m) {
      out.push("");
      out.push("## " + m.label + " Mode");
      out.push("");
      out.push(m.text.replace(/^[^—]*—\s*/, "").replace(/^./, function (c) { return c.toUpperCase(); }));
      out.push("");
      out.push(bullets(m.detail || []));
    });
    return out.join("\n") + "\n";
  }

  // CLAUDE.md for Claude Code.
  function toClaudeCode(state) {
    var sec = sections(state);
    var mem = memoryLists(state);
    var out = [];
    out.push("# How to work with me");
    if (sec.about.length) {
      out.push("");
      out.push("## About me");
      out.push(bullets(sec.about));
    }
    out.push("");
    out.push("## Role");
    out.push("Act as my " + sec.roleLower + ". " + sec.personality);
    out.push("");
    out.push("## Communication");
    out.push(bullets(sec.style));
    if (sec.challenge.length) {
      out.push("");
      out.push("## Feedback");
      out.push(bullets(sec.challenge));
    }
    if (sec.initiative.length) {
      out.push("");
      out.push("## Initiative");
      out.push(bullets(sec.initiative));
    }
    if (sec.modes.length) {
      out.push("");
      out.push("## Modes");
      out.push(MODE_INTRO);
      out.push(bullets(modeLines(sec)));
    }
    if (mem.never.length) {
      out.push("");
      out.push("## Privacy");
      out.push("- Never write these into files, commits, logs, or memory: " + mem.never.join("; ") + ".");
    }
    return out.join("\n") + "\n";
  }

  // --- other AIs ---------------------------------------------------------

  // ChatGPT splits into two boxes: what it should know about you, and how it
  // should respond. Return both so the UI can show and measure them.
  function toChatGPT(state) {
    var sec = sections(state);
    var about = sec.about.concat(memoryRuleLines(state, true));
    var how = ["Act as my " + sec.roleLower + ". " + sec.personality]
      .concat(howLines(sec));
    if (sec.modes.length) how.push(MODE_INTRO.replace(/:$/, ": ") + sec.modes.map(function (m) { return m.label + " Mode"; }).join(", ") + ".");
    return {
      about: about.join(" "),
      how: bullets(how)
    };
  }
  BYAI.chatgptLimit = 1500;

  // Gemini Gem instructions.
  function toGemini(state) {
    var sec = sections(state);
    var out = [];
    if (sec.about.length) {
      out.push("About me:");
      out.push(bullets(sec.about));
      out.push("");
    }
    out.push("Role: my " + sec.roleLower + ".");
    out.push("Personality: " + sec.personality);
    out.push("");
    out.push("How you should respond:");
    out.push(bullets(howLines(sec)));
    if (sec.modes.length) {
      out.push("");
      out.push(MODE_INTRO);
      out.push(bullets(modeLines(sec)));
    }
    out.push("");
    out.push("Memory and privacy:");
    out.push(bullets(sec.memory));
    return out.join("\n");
  }

  // Microsoft Copilot: a compact conversation-starter directive.
  function toCopilot(state) {
    var sec = sections(state);
    var out = [];
    var intro = "For our conversations, act as my " + sec.roleLower + ". " + sec.personality;
    if (sec.about.length) intro = sec.about.join(" ") + " " + intro;
    out.push(intro);
    out.push("");
    out.push(bullets(howLines(sec)));
    if (sec.modes.length) {
      out.push("");
      out.push(MODE_INTRO);
      out.push(bullets(modeLines(sec)));
    }
    out.push("");
    out.push(bullets(sec.memory));
    return out.join("\n");
  }

  // Portable system prompt for any AI (or an API call).
  function toGeneric(state) {
    var sec = sections(state);
    var out = [];
    out.push("You are my " + sec.roleLower + ". " + sec.personality);
    if (sec.about.length) {
      out.push("");
      out.push("About me:");
      out.push(bullets(sec.about));
    }
    out.push("");
    out.push("Behavior:");
    out.push(bullets(howLines(sec)));
    if (sec.modes.length) {
      out.push("");
      out.push(MODE_INTRO);
      out.push(bullets(modeLines(sec)));
    }
    out.push("");
    out.push("Memory and privacy:");
    out.push(bullets(sec.memory));
    return out.join("\n");
  }

  // Full Markdown profile.
  function toMarkdown(state) {
    var sec = sections(state);
    var parts = [];
    parts.push("# AI Interaction Profile");
    if (sec.about.length) {
      parts.push("");
      parts.push("## About Me");
      parts.push(bullets(sec.about));
    }
    parts.push("");
    parts.push("## Primary Role");
    parts.push(sec.role);
    parts.push("");
    parts.push("## Default Personality");
    parts.push(sec.personality);
    parts.push("");
    parts.push("## Communication Style");
    parts.push(bullets(sec.style));
    if (sec.challenge.length) {
      parts.push("");
      parts.push("## Challenge and Feedback");
      parts.push(bullets(sec.challenge));
    }
    if (sec.initiative.length) {
      parts.push("");
      parts.push("## Initiative");
      parts.push(bullets(sec.initiative));
    }
    parts.push("");
    parts.push("## Memory and Privacy");
    parts.push(bullets(sec.memory));
    if (sec.modes.length) {
      parts.push("");
      parts.push("## Task Modes");
      parts.push(MODE_INTRO);
      parts.push(bullets(modeLines(sec)));
    }
    return parts.join("\n") + "\n";
  }

  // Plain-language summary of what was chosen.
  function toSummary(state) {
    var arche = BYAI.getArchetype(state.archetype);
    var sec = sections(state);
    var mem = memoryLists(state);
    var out = [];
    out.push(arche ? ("You built " + arche.name + ".") : "You built a custom assistant.");
    out.push("");
    out.push("In plain terms, your AI will:");
    out.push("- Act as: " + sec.role + ".");
    out.push("- Feel: " + sec.personality);
    BYAI.sliders.forEach(function (s) {
      var pos = state.sliders[s.key];
      if (typeof pos !== "number") pos = 2;
      var word = pos < 2 ? s.left : pos > 2 ? s.right : "balanced (" + s.left + "/" + s.right + ")";
      out.push("- Be more " + word.toLowerCase() + ".");
    });
    if (sec.modes.length) {
      out.push("- Understand these modes: " + sec.modes.map(function (m) { return m.label; }).join(", ") + ".");
    }
    if (mem.never.length) {
      out.push("- Keep private: " + mem.never.join("; ") + ".");
    }
    if (sec.about.length) {
      out.push("");
      out.push("What it knows about you:");
      out.push(bullets(sec.about));
    }
    return out.join("\n");
  }

  // --- conflict check ----------------------------------------------------

  // Combinations that produce instructions pulling in opposite directions.
  // Shown as a heads-up on the Preview step; the user decides.
  BYAI.findConflicts = function (state) {
    var s = state.sliders;
    var has = function (k) { return state.behaviors.indexOf(k) !== -1; };
    var out = [];
    if (s.support === 4 && s.tone <= 1) {
      out.push("“Rigorous critic, don't soften findings” clashes with “deliver feedback gently.” Ease one slider toward the middle.");
    }
    if (s.support === 0 && s.tone >= 3) {
      out.push("“Warm and encouraging” clashes with “blunt.” Ease one slider toward the middle.");
    }
    if (s.support === 0 && has("avoid_praise")) {
      out.push("“Affirm what's working first” clashes with “Avoid excessive praise.” Move Supportive↔Challenging up a notch, or turn that behavior off.");
    }
    if (s.length === 0 && has("explain_recs")) {
      out.push("“As few words as possible” clashes with “Explain the reasoning behind recommendations.” Expect it to pick one.");
    }
    if (s.initiative === 0 && (has("suggest_next") || has("track_work"))) {
      out.push("“Only respond to what's asked” clashes with suggesting next steps or tracking work. Move Reactive↔Proactive up a notch, or turn those off.");
    }
    if (s.humor === 4 && s.formality === 4) {
      out.push("“Witty and a little irreverent” clashes with “formal and polished, no slang.” Ease one slider toward the middle.");
    }
    return out;
  };

  BYAI.generate = function (state) {
    return {
      claude: toClaude(state),
      claudeProject: toClaudeProject(state),
      claudeSkill: toClaudeSkill(state),
      claudeCode: toClaudeCode(state),
      chatgpt: toChatGPT(state),
      gemini: toGemini(state),
      copilot: toCopilot(state),
      generic: toGeneric(state),
      markdown: toMarkdown(state),
      summary: toSummary(state)
    };
  };
})(window.BYAI = window.BYAI || {});
