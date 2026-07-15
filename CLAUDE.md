# Claude Context — Build Your AI (v0.1.0)

A beginner-friendly, GitHub Pages-hosted **AI personality & interaction builder**.
Users answer plain-language questions (pick an archetype, nudge some trait
sliders, choose behaviors and memory boundaries) and the tool assembles a
portable "AI Interaction Profile" they can paste into ChatGPT, Claude, Gemini,
or Copilot. Pure static site — HTML/CSS/vanilla JS, browser-only local storage,
**no backend, no accounts, no analytics, no AI API calls**.

Tagline: *Don't just use an AI. Decide how you want it to work with you.*

## Version location
Canonical version lives in **`package.json`** (`version` field). There is no
build step — `package.json` is used only as the single semver home per the root
rule. Bump it on every versioned change (fix→PATCH, feature→MINOR, breaking→MAJOR).

## Files
- `index.html` — the 6-step wizard shell.
- `css/styles.css` — all styling (light/dark aware).
- `js/questions.js` — trait sliders, behavior rules, task modes, memory options + slider→language mapping.
- `js/profiles.js` — archetype definitions and their preset answers.
- `js/generator.js` — turns wizard state into the profile + platform-specific outputs.
- `js/app.js` — wizard flow, state, localStorage, rendering, export/copy.
- `templates/` — reference Markdown skeletons for each platform output.
- `docs/` — beginner guide, privacy & memory, personality recipes, testing your AI.
- `examples/` — ready-made example profiles (secretary, companion, etc.).
- `README.md` / `CONTRIBUTING.md` / `LICENSE`.

## How to run
Open `index.html` directly in a browser, or serve the folder and visit it. On
GitHub: push, enable **Pages** (deploy from `main`, root), visit the Pages URL.
Scripts load as plain (non-module) scripts sharing a `window.BYAI` namespace so
the site also works from `file://` without a server.

## Gotchas / constraints
- Keep it dependency-free and backend-free. Settings persist via `localStorage`
  only; never send user answers anywhere.
- No real chatbot preview in the MVP — the "preview" renders the generated
  profile and offers quick trait nudges; it does **not** call an AI.
- GitHub pushes use the **"Angry Munky"** alias (see root memory), not the real name.
