# Claude Context — Build Your AI (v0.7.1)

A beginner-friendly, GitHub Pages-hosted **AI personality & interaction builder**,
**made for Claude but working with any AI**. Users answer plain-language
questions (pick an archetype, optionally say a bit about themselves, nudge some
trait sliders, choose behaviors and memory boundaries) and the tool assembles
ready-to-paste instructions. Claude gets one export per place it takes
instructions (all chats, a Project, a task-mode Skill .zip, CLAUDE.md); ChatGPT,
Gemini, Copilot, and a generic system prompt are grouped under "Other AIs". Pure static site — HTML/CSS/vanilla JS, browser-only local storage,
**no backend, no accounts, no analytics, no AI API calls**.

Tagline: *Don't just use an AI. Decide how you want it to work with you.*

## Version location
Canonical version lives in **`package.json`** (`version` field). There is no
build step — `package.json` is used only as the single semver home per the root
rule. Bump it on every versioned change (fix→PATCH, feature→MINOR, breaking→MAJOR).

## Files
- `index.html` — the 7-step wizard shell (Start, About you, Traits, Behaviors, Memory, Preview, Export).
- `css/styles.css` — all styling (light/dark aware).
- `js/questions.js` — trait sliders, behavior rules, task modes, memory options, About-you fields, export targets (with "where to paste" notes) + slider→language mapping.
- `js/profiles.js` — archetype definitions and their preset answers.
- `js/generator.js` — turns wizard state into every export from shared sections, plus the conflict check.
- `js/preview.js` — composes the live "See it in action" sample reply from settings (no API).
- `js/zip.js` — tiny store-only zip writer for the Claude Skill download.
- `js/app.js` — wizard flow, state, localStorage, rendering, export/copy.
- `assets/` — social-preview image (og-image.png) + favicons (favicon.svg, favicon-32.png, apple-touch-icon.png). Regenerate via `scripts/gen_assets.py` (needs Pillow).
- `scripts/gen_assets.py` — regenerates the assets above.
- `docs/` — index (README) + Claude setup guide, beginner guide, privacy & memory, testing your AI, personality recipes.
- `.claude/launch.json` — local preview server (`python -m http.server 8080`).
- `examples/` — ready-made example profiles (secretary, companion, etc.).
- `README.md` / `CHANGELOG.md` / `LICENSE`.
- Release note: on each version bump, add a `CHANGELOG.md` entry (Keep a Changelog format) alongside the `package.json` + this header bump.

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
- GitHub pushes use the **"LawsonMode"** alias (see root memory), not the real name.
- Claude menu names live only in `BYAI.platforms[].where` (questions.js) and
  `docs/claude-guide.md`. They drift as Claude updates; re-check both together.
- `examples/*.md` are verbatim Markdown-profile output. When the generator
  changes, regenerate them rather than hand-editing.
