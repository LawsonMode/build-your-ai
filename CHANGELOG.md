# Changelog

All notable changes to **Build Your AI** are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
(fix → PATCH, feature → MINOR, breaking → MAJOR).

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

[0.6.2]: https://github.com/AngryMunky/build-your-ai/compare/v0.6.1...v0.6.2
[0.6.1]: https://github.com/AngryMunky/build-your-ai/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/AngryMunky/build-your-ai/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/AngryMunky/build-your-ai/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/AngryMunky/build-your-ai/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/AngryMunky/build-your-ai/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/AngryMunky/build-your-ai/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/AngryMunky/build-your-ai/releases/tag/v0.1.0
