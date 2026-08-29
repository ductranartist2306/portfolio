# Changelog

All notable changes to this project are documented in this file.

## [0.1.0.1] - 2026-08-30

### Changed

- Make full-slide navigation settle with shorter travel and a natural decelerating arrival.
- Let the non-sticky header follow section scrolling through a damped spring instead of snapping immediately.
- Preserve effectively instant transitions when reduced motion is requested.

## [0.1.0.0] - 2026-08-30

### Added

- Publish the filmmaker portfolio automatically to GitHub Pages from `main`.
- Present an original responsive golden-portal backdrop across every portfolio section.
- Provide a contrast-aware fine-pointer trail, accessible mobile navigation, and keyboard-friendly experience controls.
- Verify shared navigation, media, cursor, and reduced-motion behavior with dependency-free tests.

### Changed

- Standardize project videos on responsive 16:9 stages while preserving portrait footage with contained framing.
- Load native and YouTube media only for the active slide to avoid hidden playback and network work.
- Make the full-width navigation scroll away with each section instead of remaining fixed.
- Reduce the portrait build asset from 16.6 MB to approximately 61 kB and keep portal assets below 44 kB each.

### Fixed

- Preserve keyboard scrolling inside long sections before changing slides.
- Trap and restore focus correctly in the mobile navigation drawer.
- Keep visible focus indicators on primary controls and timeline entries.
