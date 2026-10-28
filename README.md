# Build Your AI

**Don't just *use* an AI. Decide how you want it to work with you.**

<p align="center">
  <a href="https://lawsonmode.github.io/build-your-ai/">
    <img src="https://img.shields.io/badge/%E2%96%B6%20Launch%20the%20builder-4f5bd5?style=for-the-badge" alt="Launch the builder" />
  </a>
</p>

<p align="center"><strong><a href="https://lawsonmode.github.io/build-your-ai/">▶ Open the live builder → lawsonmode.github.io/build-your-ai</a></strong></p>

A beginner-friendly, browser-based builder that turns plain-language choices into
ready-to-paste instructions for your AI. **It's made for Claude**, with a version
for each place Claude takes instructions, and it also exports for ChatGPT,
Gemini, Microsoft Copilot, or any system-prompt box.

No account. No server. No AI API calls. Everything happens in your browser, and
your answers are saved only in your browser's local storage.

---

## What it does

Most guides start with *"write some custom instructions"* — which is like teaching
someone to adjust a car seat by handing them a socket wrench. Build Your AI walks a
complete newcomer through the questions that actually matter, then assembles the
answer for them.

Seven quick steps:

1. **Start** — pick an archetype (Organizer, Companion, Motivator, Challenger, Teacher, Creator, Expert Assistant, or Build My Own).
2. **About you** (optional) — what to call you, what you do, what you'll use it for, and how much background you want.
3. **Traits** — nudge six sliders (supportive↔challenging, casual↔professional, concise↔detailed, gentle↔blunt, reactive↔proactive, serious↔playful).
4. **Behaviors** — toggle working habits and the task modes it should understand.
5. **Memory & privacy** — set what it may remember, what to ask about first, and what to never store.
6. **Preview** — see a live sample reply that recomposes from your settings (no API calls), get a heads-up when two choices contradict each other, and fine-tune with one-click nudges.
7. **Export** — Claude first, then other AIs. Each version says exactly where to paste it.

### Exports

| Claude | Other AIs |
|---|---|
| **All chats**: Settings → Your Claude → Instructions | **ChatGPT**: two boxes, with a character count for each |
| **A Project**: per-project instructions, in tagged sections | **Gemini**: Gem instructions |
| **Task-mode Skill**: a ready-to-upload `.zip` that teaches Claude your modes | **Copilot**: a chat starter |
| **Claude Code**: a `CLAUDE.md` file | **Any AI**: a generic system prompt, the full Markdown profile, or a plain-language summary |

See [Setting up Claude](docs/claude-guide.md) for which Claude version to use.

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
│   ├── generator.js      # state → Claude + other-AI outputs, conflict check (pure functions)
│   ├── preview.js        # live sample reply, assembled from settings (no API)
│   ├── zip.js            # tiny zip writer for the Claude Skill download
│   └── app.js            # wizard flow, state, localStorage, export
├── docs/                 # beginner guide and reference docs
├── examples/             # ready-made example profiles (secretary, companion, ...)
├── package.json          # canonical version
├── README.md
└── LICENSE
```

## Docs

Optional background reading (all in [`docs/`](docs/)):
[setting up Claude](docs/claude-guide.md) ·
[beginner's guide](docs/beginner-guide.md) ·
[privacy & memory](docs/privacy-and-memory.md) ·
[testing & refining](docs/testing-your-ai.md) ·
[personality recipes](docs/personality-recipes.md).

## Example profiles

Not sure where to start? The [`examples/`](examples/) folder has finished
profiles for each archetype — the exact output the builder produces — ready to
copy and paste into any AI: [secretary](examples/secretary.md), [companion](examples/companion.md),
[coach](examples/coach.md), [devil's advocate](examples/devils-advocate.md),
[creative partner](examples/creative-partner.md).

## Privacy

The MVP stores settings only in your browser via `localStorage`. There is no
account system, database, analytics, or network request for your data. Clearing
your browser's site data erases your saved profile.

## Roadmap

- More archetypes and example profiles.
- Import/export of a saved configuration file, or a share link.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the release history.

## License

MIT — see [LICENSE](LICENSE).
