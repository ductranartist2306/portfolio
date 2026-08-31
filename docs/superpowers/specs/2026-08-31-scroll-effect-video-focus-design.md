# Scroll Effect and Video Showcase Focus Design

Date: 2026-08-31
Status: Approved for specification review

## Goal

Restore the portfolio's previous slide-transition feel while making every navigation path land on the primary video showcase. Fix S3 so scrolling over either desktop column advances one shared section scroller and cannot enter S4 until the work-history content has reached its lower boundary.

## Approved Experience

### Slide transitions

- Wheel, touch, menu, slide controls, and page-key navigation use one transition function.
- Directional transitions reuse the motion values from commit `f07687f`:
  - the current slide exits by `10%` in the requested direction, fades, and scales to `0.996` over `0.46s` with `power2.in`;
  - the next slide begins `18%` from its resting position at opacity `0` and scale `0.992`, then settles over `0.78s` with `power3.out`;
  - the exit and entrance overlap, with the entrance beginning at `0.08s`;
  - reduced-motion mode makes the transition effectively immediate and removes spatial movement.
- Repeated wheel or touch input cannot start a second transition while the first transition is active.

### Showcase landing target

- Each video section exposes exactly one `data-showcase-focus` target:
  - S3: the primary behind-the-scenes video wrapper;
  - S4 and S5: the complete two-video horizontal grid;
  - S6 and S7: the complete two-video portrait grid;
  - S8: the complete mixed-orientation video grid.
- S1, S2, and S9 use the start of their content because they do not have a primary video showcase.
- Individual `VideoCard` instances are not navigation or snap targets. A section with two cards must not create two competing destinations.
- Before the incoming slide is revealed, its inner section scroller is positioned at the section's approved target.
- If the target fits within the usable viewport, it is centered. If it is taller than the usable viewport, its top edge is aligned below the header-safe inset. The final scroll position is clamped to the section's valid scroll range.

## S3 Shared-Scroll Contract

S3 is one scrolling surface, not two independently behaving columns.

- The S3 root marked `data-slide-scroll` is the only vertical scroll owner inside the slide.
- The right work-history column determines the section's scrollable height.
- The left media/company column remains sticky on desktop, but a wheel or trackpad gesture originating anywhere in S3 scrolls the same S3 root.
- No left-column wrapper, right-column wrapper, or video-card wrapper introduces another vertical scrollbar.
- While the S3 root can still scroll in the requested direction, the gesture changes only S3's `scrollTop`; `currentSlide` remains S3.
- Reaching the lower boundary does not let the inertial tail of the same trackpad gesture enter S4. The transition to S4 requires a new downward gesture after the boundary has settled.
- The upward path is symmetrical: S3 scrolls to its upper boundary first, then a new upward gesture can enter S2.
- Touch input uses the same boundary rule: a swipe that begins before the boundary finishes scrolling S3; a later swipe that begins at the boundary changes slides.

## Architecture

### Slide stack

Return the main content to an active-slide stack so the old GSAP animation can run between two known slide elements. Only the active and incoming slides participate in a transition. Existing `currentSlide` propagation continues to gate video loading and autoplay.

Each slide retains an inner `data-slide-scroll` element for content taller than the viewport. The app owns navigation between slides; the slide owns native scrolling within itself.

### Focus positioning

Add a pure helper that calculates the target inner `scrollTop` from:

- scroller height and current scroll range;
- showcase offset and height;
- header-safe inset;
- center-versus-start alignment rule.

The helper returns a clamped number and has no DOM dependency. `App` reads the DOM measurements and applies the result before the entrance animation.

### Gesture boundary state

Track whether the current wheel sequence reached a section boundary. A short no-input interval ends the sequence. Navigation is allowed only when a later sequence starts at the requested boundary. This protects trackpads whose momentum continues emitting wheel events after the user's fingers stop.

Normal mouse-wheel input, touch input, PageUp/PageDown, menu buttons, and side controls all call the same guarded slide transition. Arrow keys continue to provide fine-grained scrolling inside a long active section before they navigate at a boundary.

### Drawer and media behavior

- Opening the mobile drawer suspends slide and inner-section gesture navigation.
- Existing focus trapping and focus restoration remain unchanged.
- Inactive native videos pause and inactive YouTube embeds remain deferred as they do now.
- The change adds no dependency; GSAP is already installed.

## Edge Cases

- A section without `data-showcase-focus` lands at scroll position `0`.
- A showcase taller than the viewport aligns to the safe top instead of hiding its leading content through centering.
- Resize and orientation changes recalculate the destination on the next navigation rather than storing stale pixel offsets.
- Navigation to the already active slide repositions that slide at its approved showcase target without replaying a cross-slide animation.
- Invalid target indices and missing slide elements are ignored safely.
- Reduced-motion users receive correct focus positioning without animated translation, fade, or smooth inner scrolling.
- Interactive form fields and the open navigation drawer do not trigger keyboard slide navigation.

## Verification

### Unit tests

- Focus-scroll calculation centers a short showcase.
- Focus-scroll calculation top-aligns a tall showcase and respects the header-safe inset.
- Focus-scroll calculation clamps at both ends of the available scroll range.
- Gesture-state logic does not navigate from the inertial tail that first reaches a boundary.
- A new gesture that begins at the lower or upper boundary returns the expected adjacent slide direction.
- S3 shared-scroll decisions retain S3 before the boundary and allow S4 only on the subsequent downward gesture.

### Browser checks

- At desktop widths, scroll S3 over the left column and confirm the right timeline advances while the left column remains sticky.
- Repeat over the right timeline and verify the same S3 `scrollTop` behavior.
- Reach the bottom with a trackpad gesture and confirm momentum does not skip into S4; start another downward gesture and confirm the old GSAP transition enters S4.
- Repeat the symmetrical S4-to-S3-to-S2 path.
- Verify S3 through S8 land on their single showcase targets from wheel, touch, menu, side controls, PageUp, and PageDown.
- Verify S4/S5 land on the two-card horizontal grid, S6/S7 on the portrait grid, and S8 on the mixed grid rather than one individual card.
- Verify mobile touch behavior, drawer isolation, video controls, and reduced-motion behavior.
- Run TypeScript, the full test suite, and the production build.

## Scope Boundaries

- Do not redesign video cards, timeline content, header appearance, or section copy.
- Do not add a second scrolling pane to S3.
- Do not reintroduce multiple snap points within one showcase section.
- Do not add new packages or replace GSAP.
