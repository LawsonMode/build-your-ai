# Build Your AI

**Don't just *use* an AI. Decide how you want it to work with you.**

A beginner-friendly, browser-based builder that turns plain-language choices into
a portable **AI Interaction Profile** you can paste into ChatGPT, Claude, Gemini,
Microsoft Copilot, or any generic system-prompt box.

No account. No server. No AI API calls. Everything happens in your browser, and
your answers are saved only in your browser's local storage.

---

## What it does

Most guides start with *"write some custom instructions"* — which is like teaching
someone to adjust a car seat by handing them a socket wrench. Build Your AI walks a
complete newcomer through the questions that actually matter, then assembles the
answer for them.

Six quick steps:

1. **Archetype** — pick a starting point (Organizer, Companion, Motivator, Challenger, Teacher, Creator, Expert Assistant, or Build My Own).
2. **Traits** — nudge six sliders (supportive↔challenging, casual↔professional, concise↔detailed, gentle↔blunt, reactive↔proactive, serious↔playful).
3. **Behaviors** — toggle working habits and the task modes it should understand.
4. **Memory & privacy** — set what it may remember, what to ask about first, and what to never store.
5. **Preview** — see the finished profile and fine-tune it with one-click nudges.
6. **Export** — copy the version for your platform, or download the full Markdown profile.

The slider positions become *written instructions*, not numbers — you get
"Be direct and blunt; don't cushion the message," never `bluntness: 80%`.

## Run it

- **Locally:** open `index.html` in any modern browser. That's it.
- **Served:** `npm start` (runs `python -m http.server 8080`), then visit `http://localhost:8080`.
- **On GitHub Pages:** push to `main`, enable **Settings → Pages → Deploy from branch → main / root**, then visit the Pages URL.

The scripts load as plain (non-module) scripts sharing a `window.BYAI` namespace,
so the site works from `file://` without a server.

## Project layout

```text
build-your-ai/
├── index.html            # the 6-step wizard shell
├── css/styles.css        # all styling (light/dark aware)
├── js/
│   ├── questions.js      # sliders, behaviors, task modes, memory + slider→language map
│   ├── profiles.js       # archetype presets
│   ├── generator.js      # state → profile + platform outputs (pure functions)
│   └── app.js            # wizard flow, state, localStorage, export
├── docs/                 # beginner guide and reference docs
├── package.json          # canonical version
├── README.md
└── LICENSE
```

## Privacy

The MVP stores settings only in your browser via `localStorage`. There is no
account system, database, analytics, or network request for your data. Clearing
your browser's site data erases your saved profile.

## Roadmap

- Live sample-response preview (canned, still no API calls).
- More archetypes and example profiles.
- Import/export of a saved configuration file.
- Gemini Gems and Copilot-specific export formats.

## License

MIT — see [LICENSE](LICENSE).
