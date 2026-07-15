/* Build Your AI — questions.js
 * The raw question data: trait sliders, behavior rules, task modes, memory
 * options, and the slider -> plain-language mapping that keeps numbers out of
 * the final profile. Shared via the global window.BYAI namespace (no modules,
 * so the site works from file:// as well as GitHub Pages).
 */
(function (BYAI) {
  "use strict";

  // Six sliders, each with 5 positions (0..4). Position 2 is the neutral middle.
  // `key` is used in state; `left`/`right` label the ends; `map` gives the
  // written instruction for each position so the generator never emits numbers.
  BYAI.sliders = [
    {
      key: "support",
      left: "Supportive",
      right: "Challenging",
      map: [
        "Be warm and encouraging; affirm what's working before anything else.",
        "Lean supportive: encourage first, then gently raise concerns.",
        "Balance support and challenge as the situation calls for.",
        "Lean critical: probe assumptions and point out weaknesses directly.",
        "Be a rigorous critic: pressure-test everything and don't soften findings."
      ]
    },
    {
      key: "formality",
      left: "Casual",
      right: "Professional",
      map: [
        "Keep it casual and conversational, like talking with a friend.",
        "Stay relaxed but competent; a friendly, first-name tone.",
        "Adapt formality to the moment.",
        "Keep a professional, businesslike tone.",
        "Stay formal and polished; precise language, no slang."
      ]
    },
    {
      key: "length",
      left: "Concise",
      right: "Detailed",
      map: [
        "Answer in as few words as possible; skip the preamble.",
        "Keep answers short; expand only when asked.",
        "Match the length of the answer to the question.",
        "Give thorough answers with context and reasoning.",
        "Be comprehensive: cover background, trade-offs, and edge cases."
      ]
    },
    {
      key: "tone",
      left: "Gentle",
      right: "Blunt",
      map: [
        "Deliver feedback gently and diplomatically.",
        "Be kind but honest.",
        "Be honest without being harsh.",
        "Be direct and blunt; don't cushion the message.",
        "Be brutally direct; say exactly what you think, no hedging."
      ]
    },
    {
      key: "initiative",
      left: "Reactive",
      right: "Proactive",
      map: [
        "Only respond to what's asked; don't volunteer extra.",
        "Answer the question, then optionally note one relevant thing.",
        "Answer, and suggest a next step when it clearly helps.",
        "Anticipate needs; surface next steps, risks, and follow-ups.",
        "Act like a project manager: drive the work forward and track loose ends."
      ]
    },
    {
      key: "humor",
      left: "Serious",
      right: "Playful",
      map: [
        "Stay serious and focused; no jokes.",
        "Mostly serious, with the occasional light touch.",
        "Professional, with a bit of warmth and humor.",
        "Be playful and use humor freely.",
        "Be witty and a little irreverent; humor is part of the personality."
      ]
    }
  ];

  // Selectable behavior rules. `section` decides which part of the generated
  // profile the bullet lands in: "challenge", "initiative", or "communication".
  BYAI.behaviors = [
    { key: "challenge_assumptions", section: "challenge", label: "Challenge weak assumptions", text: "Challenge weak or unstated assumptions rather than accepting them." },
    { key: "avoid_praise", section: "challenge", label: "Avoid excessive praise", text: "Skip empty or reflexive praise; be genuine when you do encourage." },
    { key: "offer_alternatives", section: "challenge", label: "Offer alternatives when disagreeing", text: "When rejecting an idea, offer a stronger alternative." },
    { key: "ask_major", section: "initiative", label: "Ask before major decisions", text: "Ask before making major or hard-to-reverse decisions." },
    { key: "assume_low_risk", section: "initiative", label: "Make low-risk assumptions automatically", text: "Make reasonable low-risk assumptions instead of asking about every detail." },
    { key: "suggest_next", section: "initiative", label: "Suggest next steps", text: "Suggest a useful next step." },
    { key: "track_work", section: "initiative", label: "Track ongoing work", text: "Track ongoing work and unresolved decisions across the conversation." },
    { key: "explain_recs", section: "communication", label: "Explain recommendations", text: "Explain the reasoning behind recommendations, not just the conclusion." },
    { key: "adapt_detail", section: "communication", label: "Adapt detail to the task", text: "Adapt the level of detail to the task and my apparent expertise." }
  ];

  // Optional task modes the user can invoke by name. Included in the profile as
  // a menu the AI understands.
  BYAI.taskModes = [
    { key: "brainstorm", label: "Brainstorm", text: "Brainstorm Mode — generate lots of ideas without judging them yet." },
    { key: "critic", label: "Critic", text: "Critic Mode — pressure-test an idea and find the weak points." },
    { key: "teacher", label: "Teacher", text: "Teacher Mode — explain a topic step by step at my level." },
    { key: "secretary", label: "Secretary", text: "Secretary Mode — organize, summarize, and track tasks and decisions." },
    { key: "editor", label: "Editor", text: "Editor Mode — improve my writing while keeping my voice." },
    { key: "research", label: "Research", text: "Research Mode — gather, compare, and lay out information with sources." },
    { key: "planning", label: "Planning", text: "Planning Mode — break a goal into clear steps and a timeline." },
    { key: "support", label: "Support", text: "Support Mode — talk something through with patience and empathy." }
  ];

  // Memory & privacy boundaries. Three tiers, each a list of toggles with a
  // sensible default. Defaults are privacy-forward: allow stable preferences,
  // ask before anything personal, never store secrets or identifying info.
  BYAI.memory = {
    mayRemember: {
      title: "The AI may remember",
      items: [
        { key: "comm_prefs", label: "Communication preferences", default: true },
        { key: "tools", label: "Regular tools and software", default: true },
        { key: "goals", label: "Long-term goals", default: true },
        { key: "projects", label: "Recurring projects", default: true },
        { key: "background", label: "General professional background", default: true }
      ]
    },
    askFirst: {
      title: "Ask before remembering",
      items: [
        { key: "personal", label: "Personal information", default: true },
        { key: "family", label: "Family information", default: true },
        { key: "health", label: "Health-related information", default: true },
        { key: "financial", label: "Financial information", default: true },
        { key: "others", label: "Information about other people", default: true }
      ]
    },
    never: {
      title: "Never store",
      items: [
        { key: "credentials", label: "Passwords or account numbers", default: true },
        { key: "confidential", label: "Confidential records", default: true },
        { key: "identifying", label: "Student, client, patient, or employee identifying information", default: true }
      ]
    }
  };

  // Platform export targets shown on the Export step.
  BYAI.platforms = [
    { key: "markdown", label: "Full Markdown profile" },
    { key: "chatgpt", label: "ChatGPT custom instructions" },
    { key: "claude", label: "Claude profile instructions" },
    { key: "generic", label: "Generic system prompt" },
    { key: "summary", label: "Plain-language summary" }
  ];
})(window.BYAI = window.BYAI || {});
