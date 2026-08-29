# Portfolio Visual Improvements Plan

Date: 2026-08-29  
Status: implemented and verified on `codex/portfolio-visual-improvements`; user-owned baseline changes preserved

## Outcome

Improve the existing nine-slide portfolio without replacing its slide-based identity:

1. Make the navigation truly full-width and non-sticky.
2. Present every primary portfolio video in S3-S8 in a responsive 16:9 frame.
3. Add a warm, expressive pointer effect inspired by the reference while guaranteeing contrast over hovered surfaces.
4. Replace the current ambient glow with an original, optimized golden-cloud portal scene inspired by the MotionSites reference.

The plan preserves the user's uncommitted work and adds no dependency.

## Current System and Constraints

- The app is a React 19/Vite single-page portfolio with nine absolutely stacked slides. `App` owns slide state, wheel/touch/keyboard navigation, and GSAP transitions (`src/App.tsx:20-167`).
- Each S2-S9 component owns an inner `overflow-y-auto` scroller, while `Header` locates the active scroller through DOM queries (`src/components/Header.tsx:24-47`).
- The header already spans the viewport but remains `fixed` and direction-aware, so it does not satisfy a strict non-sticky behavior (`src/components/Header.tsx:51-57`).
- `VideoCard` supports four presentation ratios and applies ratio-specific viewport height caps (`src/components/VideoCard.tsx:4-13`, `src/components/VideoCard.tsx:49-69`). S3/S8 use 16:9, S4/S5 read mixed ratios from JSON, and S6/S7 force 9:16.
- The custom cursor creates new GSAP tweens on every mouse move and uses a gold `mix-blend-difference` dot/ring. This reacts to interactive elements but does not guarantee contrast (`src/components/CustomCursor.tsx:14-27`, `src/components/CustomCursor.tsx:38-77`).
- The current `.golden-portal-bg` is a blurred radial/conic glow, not a painterly cloud portal (`src/index.css:130-162`). Opaque `bg-[#0A0E14]` slide roots cover it on S2-S9.
- S1 uses `h-full` plus `overflow-hidden`; at small/short mobile viewports its lower content can be clipped instead of becoming scrollable (`src/components/S1Hero.tsx:23-24`). The shared scroller work must correct this integration issue.
- The production build passes, but currently emits a 16.6 MB PNG and a 503.76 kB JavaScript chunk. A heavy autoplay background would worsen an existing payload problem.
- There is no `DESIGN.md`, automated UI test suite, or project-local browser-test framework. Verification must use the existing TypeScript/build commands plus browser QA unless adding a test dependency is approved separately.

## Reference Findings

### Pointer reference

The [portfolio reference](https://nguyenviettuananh.github.io/portfolio/) uses a fixed canvas particle trail rather than only a lagging ring. The useful behavior to borrow is the short-lived motion trail and hover responsiveness, not its blue palette or exact implementation.

### Background reference

The [Golden Portal reference](https://motionsites.ai/?prompt=golden-portal) is a painterly composition: cream and burgundy foreground clouds, a warm gold opening/sky, soft atmospheric motion, and restrained editorial content above it. The source preview is an approximately 1.49 MB animated WebP. The portfolio should create an original local interpretation rather than hotlinking or copying that asset.

## Options Considered

### Option A: Minimal patch

- Keep the fixed header but hide it sooner.
- Force `aspectRatio="16:9"` at call sites.
- Expand the existing dot/ring cursor.
- Tune the current CSS gradients.

Pros: smallest diff.  
Cons: fails the literal non-sticky requirement, does not solve vertical-video presentation, and remains visually far from the cloud portal reference.

### Option B: Contract-led component update (recommended)

- Keep the nine-slide shell and GSAP transitions.
- Make the header scroll away based on active-scroller position.
- Make `VideoCard` enforce one 16:9 presentation frame with source-fit metadata.
- Use one RAF-driven cursor controller with a bounded warm trail and explicit contrast modes.
- Mount one optimized background component behind all slides and make section surfaces translucent.

Pros: meets all four requirements, preserves existing architecture, and gives future content one consistent contract.  
Cons: touches the shared shell plus six media-section layouts and requires an original background asset.

### Option C: Convert to a normal document-scrolling site

- Remove the full-screen slide stack and render sections in normal flow.

Pros: native navigation and true in-flow header behavior.  
Cons: changes the portfolio's core interaction model, invalidates current GSAP navigation work, and is outside the requested scope.

Decision: Option B.

## Design and Behavior Contract

### 1. Full-width, non-sticky navigation

Definition of done:

- The menu is edge-to-edge, with no maximum-width wrapper or floating rounded shell.
- It begins at the top of every slide.
- As the active section scrolls, it translates out with the first header-height of content.
- It does not reappear merely because the user reverses scroll direction; it returns only when the section is near the top.
- The mobile drawer remains a viewport overlay only while open.

Implementation design:

- Replace the direction-aware `hidden` boolean in `src/components/Header.tsx:17-47` with a scroll-offset value derived from the active slide scroller.
- Mark section scrollers with `data-slide-scroll` rather than relying on the generic `.overflow-y-auto` class.
- Make S1 an explicit vertical scroller (`overflow-y-auto overflow-x-hidden`) so the hero remains usable on short mobile viewports and follows the same header contract as S2-S9.
- Change the nav from `fixed` to `absolute`; drive `translateY` from `-min(scrollTop, measuredHeaderHeight)` using `requestAnimationFrame` or a Motion value, not React state on every scroll event.
- Reset the header offset when `currentSlide` changes and ensure each navigation action lands at `scrollTop = 0`.
- Collapse the desktop link row below `xl`; nine links, a centered logo, and a duplicate Contact CTA are too crowded at 1024-1280 px.
- Remove the duplicate Contact action: style the existing S9 navigation item as the CTA.
- Keep the drawer fixed only while open; add Escape-to-close, focus restoration, scroll lock, and automatic close on slide change.
- Report drawer-open state to `App`. While open, suspend wheel/touch/Arrow/Page key slide navigation, hide/disable the right-side slide controls, and mark the background slide stack inert/`aria-hidden` so focus and gestures cannot move the page behind the overlay.

Primary files:

- `src/components/Header.tsx`
- `src/App.tsx`
- `src/components/S1Hero.tsx` through `src/components/S9Contact.tsx` for the explicit scroller marker

### 2. Responsive 16:9 video system

Scope: every primary project video in S3-S8. S9's decorative full-bleed background is not a portfolio video; S1/S2 do not currently render primary video cards.

Implementation design:

- Simplify `VideoCard` to one presentation frame: `w-full min-w-0 aspect-video overflow-hidden`.
- Remove the public presentation-ratio prop and the ratio-specific max-height logic at `src/components/VideoCard.tsx:49-69` so call sites cannot drift.
- Add source-fit metadata (`cover` for landscape footage, `contain` for portrait/short-form footage). Vertical sources remain fully visible inside a 16:9 dark stage; no destructive center crop.
- Apply the same 16:9 wrapper to native video, YouTube iframe, loading/poster, missing-media, and error states (`src/components/VideoCard.tsx:71-95`, `src/components/VideoCard.tsx:132-169`).
- Add `loading="lazy"` to iframes and `preload="metadata"` to native videos.
- Delay iframe `src` assignment and pause native video when its slide is inactive. All slides remain mounted, so hidden media must not load/autoplay without a visibility gate.
- Pass an explicit `isActive` prop from each `App` slide boundary into S3-S8 and then `VideoCard`; do not rediscover active state from the DOM.
- Native video behavior: when `isActive` becomes false, pause and reset any hover-preview state; autoplay is permitted only for an active card whose `playMode` requests it.
- YouTube behavior: render/assign the iframe `src` only while its card is active/visible, include `enablejsapi=1`, expose native YouTube controls (`controls=1`) and a descriptive title, and unmount the iframe on deactivation so playback/network/audio cannot continue on a hidden slide. If active autoplay remains desired for S3, set `autoplay=1&mute=1` only for that active mount; reduced motion forces `autoplay=0`.
- Replace hover-only playback with a semantic, keyboard-operable control. Desktop hover may preview, but click/Enter/Space must always play or pause, including coarse-pointer devices.
- Keep accessible mute/play labels and visible focus styles.

Section layout updates:

- S3: retain the 5/7 desktop split; video remains a full-width 16:9 item (`src/components/S3Experience.tsx:29-43`).
- S4/S5: use a one-column mobile and balanced two-column desktop layout; remove ratio-driven bento asymmetry (`src/components/S4Commercials.tsx:27-40`, `src/components/S5Animation.tsx:26-39`).
- S6: replace the phone-shaped grid and 9:16 feature card with 16:9 media rows/cards; render portrait sources with `contain` (`src/components/S6TikTok.tsx:27-75`).
- S7: change review media from forced 9:16 to the shared 16:9 frame and rebalance copy beside/below it (`src/components/S7Reviews.tsx:27-48`).
- S8: retain its existing 16:9 intent but move it onto the same shared contract (`src/components/S8Events.tsx:25-46`).
- Keep native source aspect metadata in `src/data/contentData.json:178-290` only when it drives `object-fit`; do not let it control presentation geometry.

### 3. Contrast-aware pointer effect

Implementation design:

- Replace per-mousemove `gsap.to` calls with `gsap.quickTo`, Motion values, or direct RAF transforms.
- Keep a small locator dot/ring, then add the reference-inspired warm particle trail on a fixed, DPR-capped canvas. Cap the live trail at 10-12 particles and update it in one RAF loop.
- Use event delegation for interactive targets (`a`, `button`, form controls, media, and `[data-cursor]`).
- Add `data-cursor-tone="light|dark|accent"` to intentional hover surfaces:
  - `light`: white/cream cursor over dark/video surfaces.
  - `dark`: near-black cursor over cream/gold controls.
  - `accent`: warm-gold cursor plus a black/white dual outline where the surface varies.
- Treat the explicit data attribute as authoritative; use the nearest opaque computed background only as a fallback.
- Expand the ring and slightly tighten the trail over interactive targets; compress on pointer down; fade on pointer leave/window blur.
- Enable only under `(hover: hover) and (pointer: fine)`. Keep the native cursor on touch/coarse devices, within cross-origin iframes, and when reduced motion is requested.
- Remove `md:cursor-none` from `src/App.tsx:169-173`; hide the system cursor with a fine-pointer media query only after the custom cursor has mounted.
- Preserve visible keyboard focus independently of pointer effects.

Primary files:

- `src/components/CustomCursor.tsx`
- `src/index.css`
- Interactive components that require explicit `data-cursor-tone`

### 4. Golden portal background

Implementation design:

- Add `src/components/GoldenPortalBackground.tsx`, mounted once at `src/App.tsx:175-180` behind the slide stack.
- Create an original, locally owned painterly asset with the same composition principles, not the MotionSites file: cream/burgundy clouds framing a warm gold opening, restrained grain, and a darker lower vignette for white portfolio typography.
- Export responsive AVIF/WebP variants with an initial background payload target of 350 kB or less; include a mobile crop with a protected central focal point.
- Animate only transform and opacity on pre-rendered layers. Do not animate a viewport-sized CSS blur.
- Add a lightweight radial glow and grain/scrim overlay for integration with existing amber accents.
- Provide a static poster/fallback for reduced motion and failed image decoding.
- Replace opaque S2-S9 root backgrounds with shared translucent section scrims so the portal remains visible without weakening text contrast.
- Remove or reconcile the competing S9 background video at `src/components/S9Contact.tsx:22-35`; the recommended result uses the shared portal background plus a stronger contact-section scrim.
- Introduce CSS variables for the scene and surface system, for example `--portal-gold`, `--portal-cream`, `--portal-burgundy`, `--surface-scrim`, and `--content-foreground`.
- Compress the existing 16.6 MB portrait PNG during the same asset pass; otherwise the new background budget has little practical effect on page weight.

Primary files/assets:

- `src/components/GoldenPortalBackground.tsx` (new)
- `src/App.tsx`
- `src/index.css`
- S2-S9 root surface classes
- Optimized local background and portrait assets

## Interaction State Coverage

| Feature | Initial/loading | Success | Error/fallback | Reduced motion / coarse pointer |
|---|---|---|---|---|
| Header | Visible at section top | Scrolls out over one header height | Remains usable if scroller lookup fails | No entrance animation; drawer remains normal |
| Video | Reserved 16:9 poster/skeleton | Play/pause/mute works by pointer and keyboard | Honest 16:9 missing-media card | No autoplay; click-to-play only |
| Cursor | Native cursor until custom layer is ready | Dot/ring/trail follows fine pointer | Native cursor remains if setup fails | Custom cursor and trail disabled |
| Portal background | Dark-gold CSS base appears immediately | Optimized image/layers fade in | Static CSS gradient/scrim remains | Static background, no drift/pulse |

## Responsive Rules

| Viewport | Navigation | Video grid | Cursor | Portal |
|---|---|---|---|---|
| 360-767 px | Brand + menu button; full-screen drawer | One 16:9 item per row | Native touch cursor | Mobile crop, static under reduced motion |
| 768-1279 px | Compact menu/drawer; no crowded 9-link row | One or two columns based on available width | Custom only if pointer is fine | Tablet crop with central focal point |
| 1280 px+ | Full-width desktop navigation | Balanced one/two-column layouts | Full dot/ring/trail effect | Desktop landscape asset and subtle drift |

## Accessibility and Performance Gates

- Body text contrast: at least 4.5:1 against the effective background/scrim.
- Large text and visible pointer/focus boundaries: at least 3:1.
- All video controls and drawer actions work with Tab, Enter/Space, and Escape where applicable.
- No hover-only essential action.
- Touch targets are at least 44 by 44 CSS pixels.
- Background and cursor layers remain `pointer-events: none`.
- No new runtime dependency.
- Added background payload target: <=350 kB initial desktop asset and <=200 kB mobile asset.
- Hidden-slide media does not autoplay or make unnecessary network requests.
- Avoid continuously animating blur/filter; animate compositor-friendly transform/opacity only.

## Implementation Sequence

1. Preserve and baseline the dirty working tree.
   - Record `git diff --stat` and relevant file diffs; do not reset user changes.
   - Re-run `npm run lint` and `npm run build` before edits.

2. Establish shared scroller and surface contracts.
   - Add `data-slide-scroll` and a shared active-scroller lookup/helper.
   - Make the S1 hero vertically scrollable on small/short viewports instead of clipping its lower cards.
   - Add portal/scrim CSS tokens and layering rules.

3. Implement and verify the non-sticky header.
   - Replace direction-based hide logic, change fixed positioning, reset per slide, then validate desktop and mobile drawer behavior.
   - Lift or report drawer-open state so `App` can suspend background navigation and make the inactive page inert.

4. Normalize `VideoCard` and media-section layouts.
   - Lock the shared 16:9 frame first, then migrate S3-S8 one section at a time.
   - Thread `isActive` from `App` through S3-S8; implement native pause/reset and YouTube mount/src gating with visible native controls.

5. Add the optimized golden portal scene.
   - Produce original responsive assets, mount the background once, convert S2-S9 to translucent scrims, and remove the S9 conflict.

6. Implement the pointer controller after final surface colors are stable.
   - Add fine-pointer gating, contrast metadata, optimized motion, and the bounded warm trail.

7. Run full verification and visual QA.
   - Fix failures before considering the work complete.

## Testable Acceptance Criteria

### Navigation

- At 360, 768, 1024, 1280, 1440, and 1920 px widths, the navigation spans the viewport within 1 px and causes no horizontal overflow.
- The desktop navigation computed position is not `fixed` or `sticky`.
- At section `scrollTop = 0`, the full header is visible.
- After scrolling at least one measured header height, the header is fully out of view.
- Reversing direction in the middle of a section does not resurrect the header; returning near the top does.
- Changing slides resets the target section to the top and shows the header.
- Mobile drawer closes by Escape, selection, and slide change, then returns focus to its trigger.
- While the mobile drawer is open, wheel/touch/Arrow/Page keys and right-side controls cannot change slides; focus cannot enter the background slide stack.
- At 360×640 and 390×844, all S1 hero controls and lower expertise cards are reachable by vertical scroll with no horizontal overflow.

### Video

- Every primary S3-S8 video wrapper measures 16:9 within 1% at 360, 390, 768, 1024, 1280, 1440, and 1920 px widths.
- Loading, error, placeholder, native-video, and iframe branches reserve identical 16:9 geometry; no layout shift occurs when media loads.
- Portrait footage remains fully visible inside the frame; essential source content is not cropped.
- Native and embedded video can be operated by pointer and keyboard.
- Inactive-slide native videos are paused and inactive iframes are not eagerly loaded/autoplaying.
- Navigating away from S3 unmounts its YouTube iframe (or clears its `src`) so no hidden audio/network activity continues; returning mounts one active iframe with visible native controls and a descriptive title.
- Under reduced motion, the S3 iframe URL resolves with `autoplay=0`; normal active autoplay, if retained, is muted and scoped to the active mount only.

### Pointer

- The custom effect appears only when both hover and a fine pointer are available.
- Reduced motion and coarse/touch input retain the native cursor.
- The cursor/trail never receives pointer events or blocks controls.
- Dark/video, light/cream, and gold hover fixtures each produce a visibly contrasting locator boundary with a target ratio of at least 3:1.
- Trail length never exceeds 12 live particles; listeners and RAF are cleaned up on unmount.

### Background

- The cloud/portal scene is visible on all nine slides; no opaque section root hides it.
- White body copy retains at least 4.5:1 contrast through the local scrim.
- Reduced motion stops portal drift/pulse.
- The browser makes no request to the MotionSites asset URL or another third-party background host.
- Optimized assets meet the stated payload budgets, and the production build no longer emits the 16.6 MB portrait PNG.

### Regression

- Wheel, touch, Arrow/Page keys, right-side slide controls, and menu navigation still reach all nine slides.
- `npm run lint` passes.
- `npm run build` passes with no new errors.
- Browser console has no uncaught errors or warnings caused by these changes.

## Verification Procedure

1. Run `npm run lint` and `npm run build`.
2. Inspect production asset sizes and confirm the background/portrait budgets.
3. Browser-test S1 and every S3-S8 media section at the acceptance widths.
4. Programmatically record header computed position/transform at top and after one header-height of scroll.
5. Programmatically record each video wrapper's width and height and calculate `width / height`.
6. Verify pointer modes over dark content, cream/gold controls, and video; repeat with reduced motion and coarse-pointer emulation.
7. Test keyboard focus, video play/pause/mute, drawer Escape/focus restoration, and slide navigation.
   - With the drawer open, attempt wheel, touch, ArrowDown, PageDown, and right-side control navigation and verify the active slide cannot change.
   - Enter and leave S3 while inspecting the DOM/network/audio state to prove its iframe is mounted only when active.
8. Inspect console and network activity; confirm hidden media is quiet and no remote background is fetched.
9. Capture desktop and mobile screenshots for S1 plus S3-S8, including the reduced-motion fallback.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| “Same background” becomes an unlicensed copy | Produce an original local asset that borrows composition principles only; never hotlink the reference WebP. |
| Vertical short-form footage is damaged by a 16:9 crop | Use a 16:9 presentation stage with `object-contain` and intentional pillarboxing. |
| Header behavior fights nested slide scrolling | Use one explicit active-scroller contract and offset derived from its `scrollTop`. |
| Custom cursor disappears on mid-tone surfaces | Use explicit surface tone metadata plus a dual black/white outline fallback; do not rely on gold difference blending alone. |
| Canvas trail and ambient background reduce frame rate | One RAF loop, capped particles/DPR, transform-only background motion, no animated viewport blur. |
| Hidden slides load all videos | Gate iframe source/loading and pause media using active-slide/visibility state. |
| Drawer gestures navigate the slide behind the overlay | Report drawer state to `App`, suspend global navigation handlers, hide/disable slide controls, and make the background inert. |
| Existing uncommitted work is overwritten | Work from the current tree, inspect overlapping diffs before every edit, and never reset unrelated changes. |
| Missing local MP4 files prevent full playback verification | Treat real approved embed/local media as a delivery dependency; verify layout with placeholders and playback when assets exist. |

## What Already Exists and Should Be Reused

- `App` slide state, GSAP transitions, and wheel/touch/keyboard navigation.
- `Header` navigation data and mobile drawer structure.
- `VideoCard` native/YouTube branches, placeholder behavior, and accessible mute label.
- `CustomCursor` lifecycle and existing interactive target delegation as a starting point.
- Existing Space Grotesk, Be Vietnam Pro, JetBrains Mono, liquid-glass, amber, and dark surface vocabulary.
- Existing reduced-motion handling in `App` and `src/index.css:164-173`.

## Not in Scope

- Replacing the nine-slide portfolio with a conventional scrolling site.
- Adding videos to S1, S2, or S9 when no approved content was supplied.
- Hotlinking/copying the Golden Portal reference asset.
- Rewriting portfolio copy, experience data, or contact content.
- Adding a new UI/testing dependency without explicit approval.

## Assumptions Applied

- “Each section” means each section that presents a primary project video: S3-S8.
- Portrait source footage is letterboxed inside the required 16:9 frame rather than cropped.
- The golden portal direction is an original visual interpretation, not an exact asset copy.
- The current slide navigation model remains part of the product identity.

## Evidence Appendix

Baseline evidence captured on 2026-08-29 against the pre-implementation uncommitted working tree and the two live reference pages. Repository/build claims are backed by repeatable shell commands; visual-reference claims include repeatable browser-console probes and their captured outputs below. The implementation evidence later in this document records the delivered state separately.

### Requirement-to-evidence matrix

| Requirement / planning claim | Authoritative baseline evidence | Status |
|---|---|---|
| Full-width menu is not yet truly non-sticky | `src/components/Header.tsx:51-57` renders the nav as `fixed top-0 left-0 right-0 w-full`; `src/components/Header.tsx:24-47` uses direction-sensitive hide/reveal logic. | Confirmed gap |
| The app has nested slide scrollers that the header must follow | `src/App.tsx:87-167` reads the active `.overflow-y-auto` element before changing slides; S2-S9 roots each declare `overflow-y-auto`. | Confirmed architecture constraint |
| Video presentation is not consistently 16:9 | `src/components/S6TikTok.tsx:31-37` and `src/components/S7Reviews.tsx:35-41` force `9:16`; S4/S5 pass JSON ratios at `src/components/S4Commercials.tsx:31-37` and `src/components/S5Animation.tsx:30-36`; `src/components/VideoCard.tsx:49-69` supports four ratios and ratio-specific height caps. | Confirmed gap |
| Hidden media needs an explicit active-slide lifecycle | All nine section components remain mounted inside the absolute slide stack (`src/App.tsx:188-270`), while S3 supplies an autoplaying YouTube embed (`src/components/S3Experience.tsx:34-41`). | Confirmed risk |
| Current cursor motion can allocate repeated GSAP tweens | `src/components/CustomCursor.tsx:14-27` calls `gsap.to` twice per mousemove; `src/components/CustomCursor.tsx:85-91` relies on gold `mix-blend-difference` for contrast. | Confirmed gap |
| Cursor reference uses a non-blocking canvas effect | Live DOM probe of the reference found a `1280×720` fixed canvas at `z-index: 50`, `opacity: 0.3`, and `pointer-events: none`, plus two background canvases. | Confirmed reference behavior |
| Current golden background is materially simpler than the reference | `src/App.tsx:178-180` mounts one `.golden-portal-bg`; `src/index.css:130-162` implements only blurred radial/conic gradients with spin/pulse. | Confirmed gap |
| Opaque sections prevent a shared portal scene from showing throughout | S2-S9 root elements use opaque `bg-[#0A0E14]`, including `src/components/S2About.tsx:12`, `src/components/S8Events.tsx:11`, and `src/components/S9Contact.tsx:21`. | Confirmed gap |
| Golden Portal is an animated WebP reference that should not be hotlinked | Live MotionSites DOM exposed `animated (13).webp` for the Golden Portal card/detail. An HTTP HEAD probe returned `Content-Type: image/webp` and `Content-Length: 1,494,012` bytes. | Confirmed external reference |
| Small mobile hero heights need a scrollable S1 integration | `src/components/S1Hero.tsx:23-24` combines `h-full min-h-screen` with `overflow-hidden`, which can make lower hero content unreachable on short viewports. | Confirmed responsive risk |
| Current payload makes an additional heavy background unsafe | Fresh production build emitted `regenerated_image_1787278337594-*.png` at `16,642.68 kB` and the main JS chunk at `503.76 kB` (`165.16 kB` gzip). | Confirmed performance constraint |
| Current working changes must be preserved | Fresh `git status --short --branch` showed 17 modified tracked files plus untracked `.omc/`, `.omx/`, and local instruction files. | Confirmed delivery constraint |

### Fresh command evidence

```text
$ npm run lint
> tsc --noEmit
exit: 0

$ npm run build
✓ 2094 modules transformed
✓ built in 6.48s
exit: 0

Build evidence:
- dist/index.html: 0.90 kB (0.53 kB gzip)
- portrait PNG: 16,642.68 kB
- CSS: 40.71 kB (7.80 kB gzip)
- JavaScript: 503.76 kB (165.16 kB gzip)
- Vite warning: JavaScript chunk exceeds 500 kB
```

### Reproduction commands

```bash
git status --short --branch
git diff --stat
rg -n "fixed top-0|aspectRatio=\"9:16\"|aspectRatio=\{item.aspectRatio|golden-portal-bg|mix-blend-difference|gsap\.to\(|md:cursor-none" src
npm run lint
npm run build
curl -sIL 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(13).webp' \
  | rg -i '^(content-length|content-type|etag|last-modified|http/)'
```

### Browser-console reference probes

Run each snippet in the browser developer console on the stated public page. These are read-only DOM/style inspections.

Pointer reference: `https://nguyenviettuananh.github.io/portfolio/`

```js
({
  url: location.href,
  title: document.title,
  canvases: [...document.querySelectorAll('canvas')].map((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      position: style.position,
      pointerEvents: style.pointerEvents,
      zIndex: style.zIndex,
      opacity: style.opacity,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  }),
})
```

Captured at a 1280×720 viewport:

```json
{
  "canvases": [
    { "position": "fixed", "pointerEvents": "none", "zIndex": "50", "opacity": "0.3", "width": 1280, "height": 720 },
    { "position": "absolute", "pointerEvents": "none", "zIndex": "0", "opacity": "0.6", "width": 1280, "height": 720 },
    { "position": "absolute", "pointerEvents": "none", "zIndex": "1", "opacity": "0.3", "width": 1280, "height": 720 }
  ]
}
```

Golden Portal reference: `https://motionsites.ai/?prompt=golden-portal`

```js
({
  url: location.href,
  title: document.title,
  goldenPortalImages: [...document.querySelectorAll('img[alt="Golden Portal"]')].map((element) => {
    const rect = element.getBoundingClientRect();
    return {
      src: element.currentSrc || element.src,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      visible: rect.width > 0 && rect.height > 0,
    };
  }),
})
```

Captured after the Golden Portal detail was visible:

```json
{
  "goldenPortalImages": [
    { "src": "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(13).webp", "width": 299, "height": 224, "visible": true },
    { "src": "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(13).webp", "width": 681, "height": 500, "visible": true }
  ]
}
```

### Evidence limits

- The repository initially had no UI test suite. This implementation adds dependency-free Node/TypeScript behavior tests through the existing `tsx` tool; DOM interaction and visual behavior remain verified through browser automation.
- Several content entries reference local MP4 paths that are not present in the repository; layout/error-state verification is possible now, but final playback proof requires approved media or embed URLs.
- The external reference probes establish visual/technical inspiration only. They do not grant a license to reuse the MotionSites asset; the implementation must create an original local background.

## Implementation Evidence

Evidence captured from the delivered working tree on branch `codex/portfolio-visual-improvements`.

### Automated and build evidence

| Check | Result |
|---|---|
| `npm test` | 13 tests passed, 0 failed. Covers header offset, inactive YouTube/native source gating, YouTube parameters, media render states, media fit, portal base paths, cursor capability/palettes, drawer navigation suspension, keyboard scroll boundaries, and the Pages workflow contract. |
| `npm run lint` | `tsc --noEmit` exited 0. |
| `npm run build` | Vite production build exited 0; 2,096 modules transformed. |
| `git diff --check` | Clean. |
| Independent code review | Initial `REVISE` on three accessibility issues; all fixed and re-reviewed as `APPROVED`. |

Production asset results:

- Portrait build asset: `60.71 kB`, down from the baseline `16,642.68 kB` PNG output.
- Golden portal desktop: AVIF `41,654` bytes; WebP `43,628` bytes.
- Golden portal mobile: AVIF `25,620` bytes; WebP `26,534` bytes.
- No new runtime dependency was added.
- The existing JavaScript-size warning remains: main bundle `520.66 kB` (`170.50 kB` gzip), above Vite's 500 kB advisory threshold.

### Browser interaction evidence

| Acceptance area | Measured result |
|---|---|
| Full-width, non-sticky header | At 1280px: header width `1280`, computed position `absolute`. On S3 scrollTop `554`, header top reached `-70` with height `71`; reversing to scrollTop `454` kept it at `-70`; returning to top restored header top `0`. |
| Responsive 16:9 stages | Active S3-S8 stages measured `1.7778`. S6 was rechecked at 360, 390, 768, 1024, 1280, 1440, and 1920px with no horizontal overflow and the same ratio at every width. |
| Responsive navigation | Menu width equaled viewport width at every tested breakpoint. Desktop links appeared at 1280px+; the drawer trigger appeared below 1280px. |
| Mobile S1 reachability | At 360×640, S1 scrollHeight `907`, clientHeight `640`, max scroll `315`; the final location card was visible at the bottom and horizontal overflow was `0`. |
| Drawer isolation | At 360px, opening the drawer set body overflow to `hidden`, created two inert background regions, and kept S1 active after `ArrowDown`. Escape closed the dialog, removed inert state, restored body overflow, and returned focus to `Mở menu`. |
| Media lifecycle | Fresh S1 load had `0` assigned native sources and `0` iframes. Active S3 mounted one iframe with `autoplay=1` normally and `autoplay=0` under reduced motion. Navigating to S4 removed the iframe and assigned exactly the two S4 sources. |
| Cursor capability | Normal fine-pointer mode produced one `pointer-events:none` canvas, active cursor mode, and cream contrast over dark input surfaces. Reduced motion produced no cursor canvas and no custom-cursor mode. |
| Shared background | S9 had `0` competing video elements, retained `.portal-section`, and used the shared local Golden Portal component. Fresh network inspection found no MotionSites/R2 background request. |
| Keyboard accessibility | `PageDown` on long S3 content scrolled the active section to `522` without changing slides. Pressing Enter on the GAPO experience button expanded its controlled details; computed focus styling included a 4px gold ring. |
| Runtime console | Fresh final QA session: `0` errors, `0` warnings. |

### Visual evidence

- Desktop S1, mobile S1, S2, S3, and S4 were rendered and inspected.
- Visual-verdict progression: `74/100 revise` → `91/100 pass` → `94/100 pass` → final `95/100 pass`.
- Final verdict is persisted at `.omx/state/portfolio-visual-improvements/ralph-progress.json` with differences, reasoning, and approved next actions.
- The background is original ImageGen artwork stored locally as responsive AVIF/WebP variants; no reference asset is shipped.

### Remaining limitations

- Nine referenced local MP4 files are absent from the repository. The implementation shows stable 16:9 error/deferred states and fully verifies the working S3 YouTube path, but real native playback requires the approved media files or replacement URLs.
- The production build succeeds but retains Vite's advisory warning for the `520.66 kB` JavaScript chunk. This predates the feature and is not caused by the optimized image assets.

## Review Report

The requested Frontend Developer subagent independently reviewed repository architecture, relevant files, responsive/accessibility/performance risks, both references, and acceptance criteria. A planning critic found two blockers (iframe lifecycle and drawer/background isolation), which were resolved before implementation. The final code reviewer then found three accessibility issues (keyboard scroll boundaries, mouse-only timeline cards, and missing focus rings); all were fixed and the exact implementation was re-reviewed as `APPROVED`.

| Dimension | Initial | Reviewed | Result |
|---|---:|---:|---|
| Information architecture | 7/10 | 9/10 | UI scope and component ownership are explicit. |
| Interaction states | 5/10 | 9/10 | Loading/error/success/reduced-motion behavior is defined. |
| Responsive behavior | 5/10 | 9/10 | Breakpoints, 16:9 tolerance, portrait-source treatment, and mobile nav are testable. |
| Accessibility | 6/10 | 9/10 | Keyboard, focus, pointer gating, contrast, and touch targets are specified. |
| Visual specificity | 5/10 | 9/10 | Golden portal composition, layering, asset ownership, and motion limits are concrete. |
| Performance | 5/10 | 9/10 | Existing payload risk, new budgets, media visibility, and animation constraints are covered. |
| Verification | 6/10 | 9/10 | Commands, viewport matrix, computed measurements, screenshots, network, and console checks are defined. |

Verdict: IMPLEMENTED, VERIFIED, AND INDEPENDENTLY APPROVED. The documented missing native media files and existing bundle-size advisory are the only remaining limitations.

NO UNRESOLVED DESIGN DECISIONS
