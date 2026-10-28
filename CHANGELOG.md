# Changelog

All notable changes to **Build Your AI** are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
(fix → PATCH, feature → MINOR, breaking → MAJOR).

## [0.7.0] — 2026-10-28
### Added
- **Claude-first exports.** The Export step now leads with four Claude versions,
  each with a note saying where to paste it: all chats (Settings → Your Claude →
  Instructions), a Project (instructions in tagged sections), a task-mode
  **Skill** downloaded as a ready-to-upload `.zip`, and `CLAUDE.md` for Claude
  Code. ChatGPT, Gemini, Copilot, a generic system prompt, the Markdown profile,
  and the summary are grouped under "Other AIs".
- **About you** step (optional): what to call you, what you do, what you'll use
  the AI for, and how much background you want. Feeds every export.
- **Conflict check** on the Preview step: flags choices that produce opposing
  instructions (e.g. "rigorous critic" with "deliver feedback gently").
- ChatGPT export shows a character count for each box against its 1,500 limit,
  with separate Copy buttons for each box.
- Task modes carry a few working rules each, used by the Project and Skill exports.
- `docs/claude-guide.md`: which Claude version to use and where it goes, plus
  Claude's memory controls.
- `js/zip.js`: a tiny dependency-free zip writer for the Skill download.

### Changed
- Every export is built from the same sections, so a choice never drops out of
  one platform's version.
- Memory rules give Claude a short reason for each tier, and list items are
  separated by semicolons (some labels contain commas).
- The page follows the system light/dark setting until you pick one, without a
  flash of the wrong theme.
- Example profiles regenerated with the new generator.

### Fixed
- Task modes were missing from the Claude, ChatGPT, Gemini, and Copilot exports.
- Memory tiers were partly missing from the Gemini, Copilot, and generic exports.
- Screen readers now hear each slider's written instruction instead of a number.

## [0.6.3] — 2026-07-15
### Changed
- GitHub account renamed `AngryMunky` → `LawsonMode`. Updated all URLs (Pages site,
  repo links, Open Graph/Twitter meta, docs and example links), the social-preview
  image, the LICENSE holder, and the git remote to the new username.

## [0.6.2] — 2026-07-15
### Added
- This changelog.

## [0.6.1] — 2026-07-15
### Added
- Prominent **Launch the builder** badge and live link at the top of the README.
- Repo About homepage link and discovery topics.

## [0.6.0] — 2026-07-15
### Added
- Social-preview image (`assets/og-image.png`, 1200×630) and favicons
  (`favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`).
- Open Graph and Twitter Card meta tags so shared links render as a rich card.
- `scripts/gen_assets.py` to regenerate the image assets (Pillow).

## [0.5.0] — 2026-07-15
### Added
- Documentation library: privacy & memory, testing & refining, personality
  recipes, plus a `docs/` index.
### Changed
- Header **Guide** link now points to the rendered docs folder on GitHub instead
  of a raw Markdown file.

## [0.4.0] — 2026-07-15
### Added
- **Gemini Gem** and **Microsoft Copilot** export formats, bringing the Export
  step to seven platform outputs.

## [0.3.0] — 2026-07-15
### Added
- Live **sample-response preview** on the Preview step: a mocked reply across
  three scenarios that recomposes from the current settings (no API calls).
### Fixed
- Wizard navigation: the DOM helper was setting `disabled="null"`, which silently
  disabled every stepper button. Null/undefined attributes are now skipped.

## [0.2.0] — 2026-07-15
### Added
- Five ready-made example profiles (secretary, companion, coach, devil's
  advocate, creative partner) with an index.

## [0.1.0] — 2026-07-15
### Added
- Initial builder MVP: 6-step wizard (archetype → traits → behaviors → memory →
  preview → export), 8 archetypes, six trait sliders with plain-language mapping,
  behavior and task-mode selection, a three-tier memory model, profile generator
  (Markdown + ChatGPT + Claude + generic + summary), localStorage persistence,
  light/dark theme, and copy/download export. Deployed to GitHub Pages.

[0.6.3]: https://github.com/LawsonMode/build-your-ai/compare/v0.6.2...v0.6.3
[0.6.2]: https://github.com/LawsonMode/build-your-ai/compare/v0.6.1...v0.6.2
[0.6.1]: https://github.com/LawsonMode/build-your-ai/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/LawsonMode/build-your-ai/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/LawsonMode/build-your-ai/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/LawsonMode/build-your-ai/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/LawsonMode/build-your-ai/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/LawsonMode/build-your-ai/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/LawsonMode/build-your-ai/releases/tag/v0.1.0
