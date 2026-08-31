# Scroll Effect and Video Focus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the approved GSAP slide transition, land S3-S8 on one primary showcase target each, and make both S3 columns share the same boundary-gated content scroll before S4.

**Architecture:** Return `App` to an active absolute slide stack with a single guarded navigation function and inner `data-slide-scroll` elements. Pure helpers in `portfolioUi.ts` calculate showcase landing offsets and decide whether a wheel sequence scrolls content, waits at a boundary, or changes slides; section components own only semantic showcase markers. Restore the header's active-slide scroll tracking so its existing non-sticky behavior survives the stack change.

**Tech Stack:** React 19, TypeScript, GSAP 3, Motion, Tailwind CSS 4, Node test runner, Vite 6

**Design spec:** `docs/superpowers/specs/2026-08-31-scroll-effect-video-focus-design.md`

---

## File Map

- Modify `src/lib/portfolioUi.ts`: pure showcase-offset and wheel-gesture decision helpers.
- Modify `src/lib/portfolioUi.test.ts`: unit coverage for focus geometry and gesture boundaries.
- Create `src/lib/scrollShowcaseContract.test.ts`: source-level regression contract for one showcase marker per video section and none per `VideoCard`.
- Modify `src/components/VideoCard.tsx`: remove per-card scroll target markers.
- Modify `src/components/S3Experience.tsx`: mark the primary S3 video and retain one shared scroll root.
- Modify `src/components/S4Commercials.tsx`: mark the two-video grid.
- Modify `src/components/S5Animation.tsx`: mark the two-video grid.
- Modify `src/components/S6TikTok.tsx`: mark the portrait video grid.
- Modify `src/components/S7Reviews.tsx`: mark the portrait video grid.
- Modify `src/components/S8Events.tsx`: mark the mixed video grid.
- Modify `src/App.tsx`: restore the controlled GSAP slide stack, focus preparation, gesture sequencing, and unified input navigation.
- Modify `src/components/Header.tsx`: follow the active inner scroller and preserve drawer isolation after the stack restoration.
- Modify `src/index.css`: remove obsolete document snap rules and restore slide animation containment.

### Task 1: Lock Focus Geometry and Gesture Decisions

**Files:**
- Modify: `src/lib/portfolioUi.ts`
- Modify: `src/lib/portfolioUi.test.ts`

- [ ] **Step 1: Write failing focus-position tests**

Add imports and tests covering the exact center, tall-target safe alignment, and range clamping:

```ts
test('showcase focus centers a target that fits the usable viewport', () => {
  assert.equal(
    getShowcaseScrollTop({
      scrollHeight: 1800,
      clientHeight: 900,
      targetOffsetTop: 700,
      targetHeight: 400,
      safeInset: 80,
    }),
    410
  );
});

test('showcase focus top-aligns tall targets below the safe inset', () => {
  assert.equal(
    getShowcaseScrollTop({
      scrollHeight: 2200,
      clientHeight: 900,
      targetOffsetTop: 600,
      targetHeight: 1000,
      safeInset: 80,
    }),
    520
  );
});

test('showcase focus stays inside the section scroll range', () => {
  assert.equal(getShowcaseScrollTop({ scrollHeight: 1000, clientHeight: 800, targetOffsetTop: 50, targetHeight: 300, safeInset: 80 }), 0);
  assert.equal(getShowcaseScrollTop({ scrollHeight: 1000, clientHeight: 800, targetOffsetTop: 900, targetHeight: 300, safeInset: 80 }), 200);
});
```

- [ ] **Step 2: Write failing wheel-sequence tests**

```ts
test('wheel gestures scroll long section content before changing slides', () => {
  assert.equal(
    getWheelGestureAction({ atBoundary: false, startedAtBoundary: false, accumulatedDelta: 80 }),
    'scroll-section'
  );
});

test('the gesture that reaches a boundary cannot spend its inertial tail on navigation', () => {
  assert.equal(
    getWheelGestureAction({ atBoundary: true, startedAtBoundary: false, accumulatedDelta: 160 }),
    'hold-boundary'
  );
});

test('a new deliberate gesture at the boundary changes slides after its threshold', () => {
  assert.equal(
    getWheelGestureAction({ atBoundary: true, startedAtBoundary: true, accumulatedDelta: 20 }),
    'hold-boundary'
  );
  assert.equal(
    getWheelGestureAction({ atBoundary: true, startedAtBoundary: true, accumulatedDelta: 30 }),
    'navigate-slide'
  );
});
```

- [ ] **Step 3: Run the focused tests and confirm RED**

Run: `bun test src/lib/portfolioUi.test.ts`

Expected: FAIL because `getShowcaseScrollTop` and `getWheelGestureAction` do not exist.

- [ ] **Step 4: Implement the pure helpers**

Add these public contracts to `src/lib/portfolioUi.ts`:

```ts
interface ShowcaseScrollOptions {
  scrollHeight: number;
  clientHeight: number;
  targetOffsetTop: number;
  targetHeight: number;
  safeInset: number;
}

interface WheelGestureActionOptions {
  atBoundary: boolean;
  startedAtBoundary: boolean;
  accumulatedDelta: number;
  threshold?: number;
}

export type WheelGestureAction = 'scroll-section' | 'hold-boundary' | 'navigate-slide';

export function getShowcaseScrollTop(options: ShowcaseScrollOptions): number {
  const clientHeight = Math.max(0, options.clientHeight);
  const safeInset = Math.min(clientHeight, Math.max(0, options.safeInset));
  const usableHeight = Math.max(0, clientHeight - safeInset);
  const maxScrollTop = Math.max(0, options.scrollHeight - clientHeight);
  const targetOffsetTop = Math.max(0, options.targetOffsetTop);
  const targetHeight = Math.max(0, options.targetHeight);
  const desiredTop = targetHeight <= usableHeight
    ? targetOffsetTop - safeInset - (usableHeight - targetHeight) / 2
    : targetOffsetTop - safeInset;

  return Math.min(maxScrollTop, Math.max(0, desiredTop));
}

export function getWheelGestureAction(
  options: WheelGestureActionOptions
): WheelGestureAction {
  if (!options.atBoundary) return 'scroll-section';
  const threshold = Math.max(0, options.threshold ?? 30);
  return options.startedAtBoundary && options.accumulatedDelta >= threshold
    ? 'navigate-slide'
    : 'hold-boundary';
}
```

- [ ] **Step 5: Run the focused tests and confirm GREEN**

Run: `bun test src/lib/portfolioUi.test.ts`

Expected: all `portfolioUi` tests pass.

- [ ] **Step 6: Commit the helper boundary**

```bash
git add src/lib/portfolioUi.ts src/lib/portfolioUi.test.ts
git commit -m "Make scroll destinations deterministic" \
  -m "Pure geometry and gesture decisions let slide navigation focus the intended showcase while separating trackpad momentum from a new boundary gesture." \
  -m "Confidence: high" -m "Scope-risk: narrow" \
  -m "Tested: bun test src/lib/portfolioUi.test.ts"
```

### Task 2: Establish One Showcase Target per Video Section

**Files:**
- Create: `src/lib/scrollShowcaseContract.test.ts`
- Modify: `src/components/VideoCard.tsx`
- Modify: `src/components/S3Experience.tsx`
- Modify: `src/components/S4Commercials.tsx`
- Modify: `src/components/S5Animation.tsx`
- Modify: `src/components/S6TikTok.tsx`
- Modify: `src/components/S7Reviews.tsx`
- Modify: `src/components/S8Events.tsx`

- [ ] **Step 1: Write the failing source contract**

Create a Node test that reads the relevant component files and enforces the marker mapping:

```ts
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const components = ['S3Experience', 'S4Commercials', 'S5Animation', 'S6TikTok', 'S7Reviews', 'S8Events'];

test('each video section owns exactly one showcase focus target', async () => {
  for (const component of components) {
    const source = await readFile(new URL(`../components/${component}.tsx`, import.meta.url), 'utf8');
    assert.equal(source.match(/data-showcase-focus/g)?.length, 1, `${component} must expose one showcase target`);
  }
});

test('individual video cards are not scroll navigation targets', async () => {
  const source = await readFile(new URL('../components/VideoCard.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /data-scroll-focus|data-showcase-focus/);
});

test('S3 keeps one shared section scroll owner', async () => {
  const source = await readFile(new URL('../components/S3Experience.tsx', import.meta.url), 'utf8');
  assert.equal(source.match(/data-slide-scroll/g)?.length, 1);
});
```

- [ ] **Step 2: Run the contract and confirm RED**

Run: `bun test src/lib/scrollShowcaseContract.test.ts`

Expected: FAIL because section-level showcase markers do not exist and `VideoCard` still owns `data-scroll-focus`.

- [ ] **Step 3: Move the semantic markers**

- Remove both `data-scroll-focus` attributes from `VideoCard.tsx`.
- Add `data-showcase-focus` to the primary-video wrapper in S3.
- Add `data-showcase-focus` to the outer video grid in each of S4-S8.
- Do not add overflow styles or a second `data-slide-scroll` marker to either S3 column.

- [ ] **Step 4: Run contract and media tests**

Run: `bun test src/lib/scrollShowcaseContract.test.ts src/lib/videoShowcaseContract.test.ts`

Expected: all tests pass.

- [ ] **Step 5: Commit the DOM contract**

```bash
git add src/components/VideoCard.tsx src/components/S3Experience.tsx src/components/S4Commercials.tsx src/components/S5Animation.tsx src/components/S6TikTok.tsx src/components/S7Reviews.tsx src/components/S8Events.tsx src/lib/scrollShowcaseContract.test.ts
git commit -m "Give every video section one landing target" \
  -m "Section-level markers focus complete showcases and prevent individual cards from competing for scroll navigation." \
  -m "Constraint: S3 retains exactly one vertical scroll owner." \
  -m "Confidence: high" -m "Scope-risk: narrow" \
  -m "Tested: scroll showcase and video showcase contract tests"
```

### Task 3: Restore the Old Slide Motion with Boundary-Gated Inputs

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Restore controlled slide-stack refs and GSAP setup**

- Import `gsap`, `canNavigateSlides`, `getShowcaseScrollTop`, `getWheelGestureAction`, and `shouldNavigateFromScroll`.
- Replace the document `scrollContainerRef` and `IntersectionObserver` with `containerRef`, `slidesRef`, and `isAnimating`.
- Keep S1-S9 mounted as absolute full-viewport slide elements. At rest, only `currentSlide` is displayed. Immediately before a transition, GSAP reveals the pending incoming slide so outgoing and incoming slides are both renderable for the overlapping exit/entrance; after `currentSlide` updates, React hides every non-active slide again. Retain all current `isActive` and `reducedMotion` props.

- [ ] **Step 2: Implement showcase preparation**

Add a callback that finds the target slide's `[data-slide-scroll]` and optional `[data-showcase-focus]`. Compute the target offset from `getBoundingClientRect()` plus current `scrollTop`, pass current measurements to `getShowcaseScrollTop`, and set the inner scroller before entrance. Use the measured header height as the safe inset on overlay-header viewports; use `0` when no header is found. When the section has no showcase marker, explicitly set its inner `scrollTop` to `0`; this is the required S1, S2, and S9 landing behavior.

- [ ] **Step 3: Restore the approved GSAP timeline**

Implement `goToSlide` using the exact approved values:

```ts
const exitDuration = reducedMotion ? 0.01 : 0.46;
const enterDuration = reducedMotion ? 0.01 : 0.78;
const enterOffset = reducedMotion ? 0 : 18;
const exitOffset = reducedMotion ? 0 : 10;
```

Use `power2.in` for exit, `power3.out` for entrance, and start entrance at `0.08s`. Invalid indices and concurrent transitions return early. Navigating to the active slide only reapplies showcase focus.

- [ ] **Step 4: Implement wheel gesture sessions**

Use a ref with direction, accumulated absolute delta, whether the gesture started at the requested boundary, and last-event time. Treat a direction change or at least `160ms` without wheel input as a new gesture. While the active inner scroller can move, allow native scrolling. At a boundary, prevent default; hold if the current gesture reached it from within the section; navigate only when `getWheelGestureAction` returns `navigate-slide`.

This makes the left and right S3 columns scroll the same ancestor and requires a fresh gesture after the work-history boundary.

- [ ] **Step 5: Apply the same boundary rule to touch and keyboard**

- Record top/bottom boundary state at `touchstart`; at `touchend`, navigate only when a qualifying swipe began at the requested boundary.
- Arrow and Page keys scroll the active inner section while it can move, then change slides at a boundary.
- Home, End, menu buttons, and side controls reuse `goToSlide`.
- Suspend these handlers while the drawer is open or focus is inside an interactive control.

- [ ] **Step 6: Remove obsolete native document snapping**

Delete `[data-portfolio-scroll]`, `[data-scroll-focus]`, and scroll-snap rules from `src/index.css`. Restore `.magazine-slide { will-change: transform, opacity; }` and keep reduced-motion animation overrides.

- [ ] **Step 7: Run static and unit verification**

Run: `bun run lint && bun test`

Expected: TypeScript passes and the full suite is green.

- [ ] **Step 8: Commit slide navigation**

```bash
git add src/App.tsx src/index.css
git commit -m "Restore deliberate slide motion without skipping long content" \
  -m "The original short-travel GSAP transition now lands on section showcase targets, while gesture sessions keep trackpad momentum inside long slides until a fresh boundary input." \
  -m "Constraint: Preserve the f07687f motion curve and reduced-motion behavior." \
  -m "Rejected: Mandatory native snap | cannot reproduce the approved transition and reintroduces competing targets." \
  -m "Confidence: high" -m "Scope-risk: moderate" \
  -m "Tested: TypeScript and full unit suite"
```

### Task 4: Preserve Header and Drawer Behavior on the Restored Stack

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/App.tsx`
- Test: `src/lib/portfolioUi.test.ts`

- [ ] **Step 1: Restore active-scroller header tracking**

Reintroduce Motion's `useMotionValue` and `useSpring`, use the existing `getHeaderTranslateY`, and locate the active slide's one `[data-slide-scroll]` element. On active-section scroll, move the header out by at most its measured height; reset and attach to the new scroller when `currentSlide` changes.

- [ ] **Step 2: Point drawer locking at the active inner scroller**

Replace the global `[data-portfolio-scroll]` lookup with the active slide helper. Keep focus trap, focus restoration, body overflow restoration, and drawer-triggered navigation behavior unchanged.

- [ ] **Step 3: Pass reduced motion from App**

Add `reducedMotion?: boolean` to `HeaderProps` and pass the current value from `App` so reduced-motion mode uses the direct header motion value.

- [ ] **Step 4: Run regression verification**

Run: `bun run lint && bun test`

Expected: TypeScript and all tests pass, including the existing header-offset and drawer contracts.

- [ ] **Step 5: Commit the integration**

```bash
git add src/App.tsx src/components/Header.tsx
git commit -m "Keep navigation chrome aligned with active slide scrolling" \
  -m "The restored slide stack now drives the existing non-sticky header and drawer lock from the active section's single inner scroller." \
  -m "Confidence: high" -m "Scope-risk: narrow" \
  -m "Tested: TypeScript and full unit suite"
```

### Task 5: Browser QA and Release-Quality Verification

**Files:**
- Modify only if QA finds a confirmed defect in the files above.

- [ ] **Step 1: Start the app and verify basic rendering**

Run: `bun run dev`

Expected: Vite serves the portfolio on `http://localhost:3000` without console errors.

- [ ] **Step 2: Verify desktop S3 left/right equivalence**

At 1440x900:

- enter S3 and record its active `data-slide-scroll.scrollTop`;
- wheel over the left column and confirm that same scrollTop advances while `currentSlide` remains S3;
- wheel over the right work-history column and confirm the same owner advances;
- reach the bottom in one trackpad-like sequence and confirm S4 does not appear;
- after at least `160ms` without input, start a new downward gesture and confirm the old GSAP transition enters S4.

- [ ] **Step 3: Verify showcase landing targets**

Navigate both directions through S3-S8 using wheel, Page keys, menu, and side controls. Confirm one target per section and validate short-target centering versus tall-target safe-top alignment.

- [ ] **Step 4: Verify mobile, drawer, media, and reduced motion**

At 390x844, verify touch boundary behavior and drawer isolation. Confirm active videos retain current load/play behavior. Emulate reduced motion and confirm immediate, correctly positioned transitions.

- [ ] **Step 5: Run final automated verification**

Run: `bun run lint && bun test && bun run build`

Expected: TypeScript passes, all tests pass, and the Vite production build succeeds.

- [ ] **Step 6: Inspect the final diff**

Run: `git diff HEAD~4 --check && git status --short`

Expected: no whitespace errors; only intended source, test, and plan files differ from the pre-implementation boundary; unrelated untracked workspace files remain untouched.

- [ ] **Step 7: Record any QA-only correction**

If browser QA required a correction, commit only that verified fix with a Lore-format message including exact `Tested:` evidence. If no correction was required, do not create an empty commit.

---

## Completion Evidence

- Exact `f07687f` transition parameters are present and observable in both directions.
- S3 uses one scroll owner; left and right wheel input advance the same `scrollTop`.
- The gesture that reaches S3's bottom cannot enter S4; a fresh boundary gesture can.
- S3-S8 each expose one section-level showcase focus target; `VideoCard` exposes none.
- Drawer, keyboard, touch, media lifecycle, and reduced-motion regressions are checked.
- `bun run lint`, `bun test`, and `bun run build` all pass.
