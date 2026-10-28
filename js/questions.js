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
    { key: "brainstorm", label: "Brainstorm", text: "Brainstorm Mode — generate lots of ideas without judging them yet.",
      detail: ["Give many varied ideas fast, including a few unusual ones.", "Hold off on critique until I ask for it.", "Build on my ideas instead of replacing them."] },
    { key: "critic", label: "Critic", text: "Critic Mode — pressure-test an idea and find the weak points.",
      detail: ["Look for the weakest assumptions and the most likely ways this fails.", "Rank problems by how much they matter.", "For each serious problem, suggest a fix or a stronger alternative."] },
    { key: "teacher", label: "Teacher", text: "Teacher Mode — explain a topic step by step at my level.",
      detail: ["Start from what I already know and build up one step at a time.", "Use a concrete example or analogy for each new idea.", "Check my understanding with a quick question before moving on."] },
    { key: "secretary", label: "Secretary", text: "Secretary Mode — organize, summarize, and track tasks and decisions.",
      detail: ["Turn what I say into clear lists of tasks, decisions, and open questions.", "Keep a running summary I can copy.", "Point out anything without an owner or a deadline."] },
    { key: "editor", label: "Editor", text: "Editor Mode — improve my writing while keeping my voice.",
      detail: ["Fix clarity, flow, and errors without changing what I mean.", "Keep my word choices and tone unless they get in the way.", "Show what you changed and why, briefly."] },
    { key: "research", label: "Research", text: "Research Mode — gather, compare, and lay out information with sources.",
      detail: ["Separate what is well established from what is uncertain.", "Compare options side by side when there are several.", "Say where information comes from, and flag anything you can't confirm."] },
    { key: "planning", label: "Planning", text: "Planning Mode — break a goal into clear steps and a timeline.",
      detail: ["Start by pinning down what \"done\" looks like and by when.", "Break the work into a few big steps, then detail only the first.", "Call out risks and what to cut if time runs short."] },
    { key: "support", label: "Support", text: "Support Mode — talk something through with patience and empathy.",
      detail: ["Listen first; reflect back what you hear before offering advice.", "Ask before switching into problem-solving.", "Keep a calm, unhurried tone."] }
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

  // Optional "About you" answers. Free text the user types, plus one choice for
  // how much background they want. Everything here is optional and stays local.
  BYAI.aboutFields = [
    { key: "name", label: "What should it call you?", placeholder: "e.g. Sam" },
    { key: "work", label: "What do you do?", placeholder: "e.g. High-school media teacher" },
    { key: "uses", label: "What will you mostly use it for?", placeholder: "e.g. Lesson planning, feedback on writing, organizing my week" }
  ];

  BYAI.expertise = [
    { key: "", label: "No preference", text: "" },
    { key: "new", label: "I'm new to most of this", text: "Assume I'm new to the topic: define terms and explain from the ground up." },
    { key: "some", label: "I know the basics", text: "Assume I know the basics; skip beginner definitions unless I ask." },
    { key: "expert", label: "Treat me as an expert", text: "Treat me as an expert; skip the basics and get to the substance." }
  ];

  // Export targets, grouped. Claude comes first: it gets one target per place
  // you can put instructions in Claude. `where` tells the user where to paste.
  // Menu names drift; re-check them against the live apps (last checked
  // 2026-10-28).
  BYAI.platforms = [
    { key: "claude", group: "claude", label: "Claude: all chats",
      where: "In Claude, open Settings → Your Claude → Instructions and paste this in. (Older layout: Settings → Profile.) It applies to every chat." },
    { key: "claudeProject", group: "claude", label: "Claude: a Project",
      where: "In Claude, open a Project → Instructions (“Set project instructions”) and paste this in. It applies only to chats inside that Project, so you can keep a different setup per class, job, or hobby." },
    { key: "claudeSkill", group: "claude", label: "Claude: task-mode Skill",
      where: "Download the .zip, then in Claude open Customize → Skills and upload it. Claude then switches modes when you say e.g. “go into Critic Mode.” Optional — your modes are already in the other Claude versions too." },
    { key: "claudeCode", group: "claude", label: "Claude Code: CLAUDE.md",
      where: "For Claude Code. Save as CLAUDE.md in ~/.claude/ to use it in every project, or in a project folder for just that project." },
    { key: "chatgpt", group: "other", label: "ChatGPT",
      where: "In ChatGPT, open Settings → Personalization → Custom instructions. The first part goes in the box about you; the second in the box for how ChatGPT should respond. Each box holds about 1,500 characters." },
    { key: "gemini", group: "other", label: "Gemini",
      where: "In Gemini, create a Gem and paste this into its Instructions box." },
    { key: "copilot", group: "other", label: "Copilot",
      where: "Paste this as the first message of a Copilot chat (or into its instructions field if your version has one)." },
    { key: "generic", group: "other", label: "Any AI (system prompt)",
      where: "Works anywhere that accepts a system prompt or custom instructions, including the Claude API." },
    { key: "markdown", group: "other", label: "Full profile (Markdown)",
      where: "The complete profile in one readable file. Good for keeping a copy or sharing your setup." },
    { key: "summary", group: "other", label: "Plain-language summary",
      where: "A human-readable recap of what you chose. Not meant to be pasted into an AI." }
  ];

  BYAI.platformGroups = [
    { key: "claude", label: "Claude" },
    { key: "other", label: "Other AIs" }
  ];
})(window.BYAI = window.BYAI || {});
