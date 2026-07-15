/* Build Your AI — preview.js
 * A fake-but-plausible sample reply so users can *feel* their settings before
 * exporting. NO API CALLS: the response is assembled from the current sliders
 * and behaviors using scenario fragment banks. Deterministic — same settings
 * always produce the same sample. Shared via window.BYAI.
 */
(function (BYAI) {
  "use strict";

  // Each scenario supplies a user prompt plus the raw material the composer
  // stitches together depending on personality settings.
  BYAI.sampleScenarios = [
    {
      key: "idea",
      label: "Pitch an idea",
      userPrompt: "I've got an idea for an app, but I'm honestly not sure it's worth pursuing.",
      affirm: "There's real potential here — the fact that you keep coming back to it is a signal worth trusting.",
      neutralAck: "Worth a serious look. Let's figure out whether it holds up.",
      critical: "The hard question isn't whether it's a nice idea — it's whether anyone will change what they do today to use it.",
      detailPoints: [
        "The strongest ideas solve a problem people already feel, not one you have to convince them they have.",
        "Think about who it's for and what they use instead right now — that gap is the real opportunity.",
        "How hard it is to build matters less than whether the first ten users would actually show up."
      ],
      pushback: "One assumption to check first: are you sure other people want this, or do you want it to exist?",
      nextStep: "Before writing a line of code, talk to five people who'd actually use it and just listen.",
      clarifyingQ: "What does it let someone do that they can't do easily today?",
      quip: "Worst case, you kill a bad idea cheaply — that's a win too."
    },
    {
      key: "plan",
      label: "Plan a project",
      userPrompt: "I need to plan a class project but I don't even know where to start.",
      affirm: "Totally doable — the overwhelm usually just means it hasn't been broken down yet.",
      neutralAck: "Let's turn the fog into a short list.",
      critical: "The reason it feels stuck is probably a fuzzy goal — nail that first or every step wobbles.",
      detailPoints: [
        "Start from the end: what does \"done\" actually look like, and by when?",
        "Work backward into three or four big chunks, then only detail the first one.",
        "Decide now what you'd cut if time runs short — that saves panic later."
      ],
      pushback: "Quick gut-check: is the scope realistic for the time you actually have?",
      nextStep: "Write the sentence \"This project is done when ___\" and we'll build backward from it.",
      clarifyingQ: "When is it due, and roughly how many hours can you give it?",
      quip: "Momentum beats perfection here — just start the list."
    },
    {
      key: "draft",
      label: "Review my writing",
      userPrompt: "Can you look at this paragraph I wrote and tell me what you think?",
      affirm: "Nice work getting it down — a draft on the page beats a perfect one in your head.",
      neutralAck: "Happy to. I'll flag what's working and what I'd tighten.",
      critical: "I'll be straight with you rather than just polite — that's more useful.",
      detailPoints: [
        "The core idea comes through; the main fix is cutting words that don't earn their place.",
        "Lead with your strongest sentence — right now it's buried in the middle.",
        "Vary your sentence length so it has some rhythm instead of running flat."
      ],
      pushback: "One thing worth questioning: who's the reader, and does this actually land for them?",
      nextStep: "Paste the paragraph and I'll mark it up line by line, keeping your voice.",
      clarifyingQ: "Who's this written for, and what should they feel after reading it?",
      quip: "Good writing is mostly rewriting, so you're already on track."
    }
  ];

  function bucket(v) { return v <= 1 ? "low" : (v === 2 ? "mid" : "high"); }

  BYAI.sampleResponse = function (state, sc) {
    var s = state.sliders;
    var has = function (k) { return state.behaviors.indexOf(k) !== -1; };
    var len = typeof s.length === "number" ? s.length : 2;
    var lead = [];   // opening/stance/reasoning sentences
    var follow = []; // next step / question / quip (second paragraph)

    // Opener — only when the user wants some length.
    if (len >= 3) {
      if (bucket(s.humor) === "high" && s.formality <= 1) lead.push("Ooh, fun one — let's poke at it.");
      else if (s.formality >= 3) lead.push("Happy to weigh in.");
      else lead.push("Alright, let's take a look.");
    }

    // Stance — driven by supportive↔challenging (and avoid-praise).
    var stance;
    if (bucket(s.support) === "low") stance = has("avoid_praise") ? sc.neutralAck : sc.affirm;
    else if (bucket(s.support) === "high") stance = sc.critical;
    else stance = sc.neutralAck;
    if (bucket(s.tone) === "high") stance = "Honestly? " + stance.charAt(0).toLowerCase() + stance.slice(1);
    lead.push(stance);

    // Reasoning — how much depends on concise↔detailed and "explain recommendations".
    if (len >= 2 || has("explain_recs")) {
      var n = len >= 4 ? 3 : (len >= 3 ? 2 : 1);
      for (var i = 0; i < n && i < sc.detailPoints.length; i++) lead.push(sc.detailPoints[i]);
    }

    // Pushback — only if they asked it to challenge assumptions.
    if (has("challenge_assumptions")) lead.push(sc.pushback);

    // Second paragraph: initiative and questions.
    if (has("suggest_next") || bucket(s.initiative) === "high") follow.push(sc.nextStep);
    if (has("ask_major")) follow.push(sc.clarifyingQ);
    if (bucket(s.humor) === "high" && len >= 2) follow.push(sc.quip);

    // Very terse mode overrides everything.
    if (len === 0) {
      lead = [stance];
      follow = (has("suggest_next") || bucket(s.initiative) === "high") ? [sc.nextStep] : [];
    }

    var paras = [lead.join(" ")];
    if (follow.length) paras.push(follow.join(" "));
    return paras.join("\n\n");
  };
})(window.BYAI = window.BYAI || {});
