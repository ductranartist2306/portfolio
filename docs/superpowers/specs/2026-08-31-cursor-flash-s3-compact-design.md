# Cursor, Transition Flash, and Compact S3 Design

Date: 2026-08-31
Status: Approved for specification review

## Goal

Polish the portfolio interaction without changing the approved slide motion: restore the operating-system cursor while retaining its animated trail, remove the single-frame flash at slide completion, and redesign S3 as a desktop viewport-sized block that advances to S4 in one downward gesture.

## Supersession

For S3 only, this addendum replaces the earlier desktop shared-scroll and sticky-column contract in `2026-08-31-scroll-effect-video-focus-design.md` when viewport width is at least `1280px` and height is at least `720px`. Below that gate, the earlier shared inner-scroll and boundary-navigation behavior remains in force so all content stays reachable. The prior GSAP motion and S4–S8 showcase-focus contracts remain unchanged at every viewport.

## Approved Experience

### Native cursor with animated trail

- The browser and operating system render the normal pointer or hand cursor.
- The browser and operating system own every native cursor state after cursor replacement is removed; the app renders only the particle canvas.
- The app no longer hides the native cursor globally.
- The custom 32px ring and 12px dot are removed.
- The existing canvas particle trail remains active for fine mouse pointers when reduced motion is not requested.
- Trail color continues to follow the existing light, dark, and accent tone rules.
- Interactive targets may continue using the existing denser/smaller particle behavior, but they do not enlarge or replace the native cursor.
- Coarse pointers and reduced-motion users receive no custom trail, matching the current capability guard.

### Flash-free slide completion

- Preserve the approved GSAP values, overlap, fade, scale, direction, and reduced-motion behavior.
- The outgoing slide must become `display: none` before its animated opacity/transform styles are cleared.
- React may then commit `currentSlide`; clearing GSAP properties must never expose the outgoing slide at full opacity for an intermediate frame.
- At no recorded animation frame may both the outgoing and incoming slides be visible at full opacity after transition completion.

### Compact S3

S3 keeps four roles in chronological order:

1. Bazic Entertainment, 2021–2022
2. Baliogo Group, 2022–2023
3. Govi Việt Nam, 2023–2024
4. Carnow, 2024–2026

GAPO Social Network and Media Department – VOV World are removed from the S3 timeline data and from visible company summaries.

All visible S3 metadata must reflect the retained data. The current top-right `2019–2026` chip must derive from the first and last retained roles and render `2021–2026`; any employer count must render four or be removed.

- The four roles remain a single vertical timeline, not a 2×2 grid or horizontal carousel.
- Only one role is expanded at a time. Carnow remains selected initially.
- Collapsed cards show company, role, and period in a compact row.
- The selected card expands in place and shows its existing highlights.
- Reduce card padding, vertical gaps, heading spacing, and detail spacing only as much as needed to fit the section.
- Remove the redundant “Đơn vị đã công tác” company-list card from the left column. The vertical timeline already communicates the retained employers.
- Keep the behind-the-scenes video as the left-column showcase.
- Remove the desktop sticky behavior from the left column; the section no longer needs an independently pinned column when all desktop content fits one viewport.

## Responsive Behavior

- Desktop no-scroll behavior applies only when viewport width is at least `1280px` and viewport height is at least `720px`. At `1280×720`, `1440×900`, and larger viewports that satisfy both thresholds, S3's inner `data-slide-scroll` must have no meaningful vertical travel (`scrollHeight <= clientHeight + 1`).
- Because desktop S3 starts at its lower boundary, one deliberate downward wheel/trackpad gesture uses the existing GSAP transition to enter S4.
- Upward navigation from S3 behaves like the other viewport-sized blocks and returns to S2 through the same transition path.
- If either viewport dimension is below the desktop gate, including a wide-but-short viewport such as `1600×700`, S3 may use its existing vertical inner scroller so all four jobs and expanded details remain reachable. Content reachability takes priority over one-gesture navigation on mobile and short desktop screens.

## Architecture and Data Flow

### Cursor

`CustomCursor` becomes a trail renderer rather than a cursor replacement. It keeps the capability detection, tone resolution, particle spawning, canvas resize, and animation loop. Remove DOM/style responsibilities that exist only for the dot and ring: injected `cursor: none`, cursor dataset state, dot/ring refs, dot/ring scale state, hover enlargement, and dot/ring rendering.

### Slide completion

Keep `goToSlide` as the single navigation path. In the GSAP timeline completion callback:

1. Hide the outgoing element.
2. Commit `currentSlide`.
3. Clear outgoing transform/opacity/scale styles while leaving it hidden.
4. Clear incoming transition-only styles.
5. Release the animation lock.

The existing incoming preparation still sets `display: block`, so a previously hidden slide remains reusable.

### S3 content

Update `contentData.json` so S3 owns only the four approved roles. `S3Experience` continues to derive its default selected index from `timeline.length - 1`, so Carnow remains active without a hard-coded index. The component renders the reduced vertical timeline and removes its duplicated company card.

## Edge Cases

- A native pointer remains visible if the trail canvas cannot initialize.
- Trail teardown removes listeners, cancels animation frames, and clears particles without changing global cursor CSS.
- Rapid navigation remains guarded by `isAnimating`.
- Reduced motion still completes the slide change effectively immediately without exposing the outgoing slide.
- Removing two timeline records must not leave stale company-count copy, labels, or accessibility references.
- Expanding any of the four retained roles must keep the selected details reachable at supported mobile widths.

## Verification

### Automated

- Cursor source contract confirms there is no `cursor: none`, ring element, or dot element while the trail canvas remains.
- S3 data contract confirms exactly four roles in the approved order and excludes GAPO/VOV.
- S3 source contract confirms one vertical timeline, no redundant company-list block, and no desktop sticky class.
- Transition contract confirms the outgoing slide is hidden before transition properties are cleared.
- Run TypeScript, the complete unit suite, and the production build.

### Browser

- At desktop fine-pointer settings, verify the normal arrow/hand cursor is visible and colored particles follow pointer movement.
- Record animation frames through slide completion and verify the outgoing slide never flashes back to full opacity before becoming hidden.
- At `1280×720` and `1440×900`, verify S3 `scrollHeight <= clientHeight + 1` and one downward gesture begins the S4 transition.
- Verify all four vertical job cards are visible, Carnow starts expanded, and selecting Bazic/Baliogo/Govi updates the expanded details.
- At `390×844`, verify all four roles and expanded details remain reachable by inner scrolling.
- Recheck drawer isolation, reduced motion, and S3 video lifecycle.

## Scope Boundaries

- Do not change the approved GSAP motion curve or showcase focus behavior for S4–S8.
- Do not add a cursor library, animation dependency, modal, carousel, or horizontal scroll.
- Do not rewrite job descriptions for the four retained roles.
- Do not redesign sections outside S3.
