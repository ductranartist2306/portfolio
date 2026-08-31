# Cursor, Flash, and Compact S3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the native cursor while retaining the particle trail, eliminate the slide-completion flash, and make S3 a four-role vertical block that advances to S4 in one desktop gesture.

**Architecture:** Simplify `CustomCursor` into a capability-gated canvas trail renderer, change GSAP completion ordering so outgoing content is hidden before styles are cleared, and reduce S3 data/layout to four compact vertical accordion cards. A gated desktop CSS layout (`min-width: 1280px` and `min-height: 720px`) removes meaningful S3 inner travel while shorter/narrower viewports keep reachable inner scrolling.

**Tech Stack:** React 19, TypeScript, GSAP 3, Tailwind CSS 4, Node test runner, Vite 6

**Design spec:** `docs/superpowers/specs/2026-08-31-cursor-flash-s3-compact-design.md`

---

## File Map

- Modify `src/components/CustomCursor.tsx`: retain canvas particles and native cursor semantics; remove custom dot/ring replacement.
- Modify `src/App.tsx`: hide outgoing slide before clearing animation styles.
- Modify `src/data/contentData.json`: retain only Bazic, Baliogo, Govi, and Carnow in S3.
- Modify `src/components/S3Experience.tsx`: render four compact vertical accordion cards, derive years, and remove duplicated employer summary/sticky layout.
- Modify `src/index.css`: add the explicit desktop width-and-height gate for compact S3 geometry.
- Create `src/lib/portfolioPolishContract.test.ts`: behavior/source contracts for native cursor, flash ordering, S3 data, layout, and responsive gate.

### Task 1: Restore the Native Cursor and Keep the Trail

**Files:**
- Create: `src/lib/portfolioPolishContract.test.ts`
- Modify: `src/components/CustomCursor.tsx`

- [ ] **Step 1: Write the failing cursor contract**

Read `CustomCursor.tsx` and assert:

```ts
test('custom cursor keeps only the particle canvas and never hides the native cursor', async () => {
  const source = await readFile(cursorPath, 'utf8');
  assert.doesNotMatch(source, /cursor:\s*none|CURSOR_STYLE_ID|ringRef|dotRef/);
  assert.doesNotMatch(source, /h-8 w-8 rounded-full|h-3 w-3 rounded-full/);
  assert.match(source, /<canvas/);
  assert.match(source, /spawnParticle/);
});
```

- [ ] **Step 2: Run RED**

Run: `bun test src/lib/portfolioPolishContract.test.ts`

Expected: FAIL because cursor replacement, ring, and dot still exist.

- [ ] **Step 3: Simplify `CustomCursor`**

- Remove injected `cursor: none` CSS and the root dataset.
- Remove ring/dot refs, size DOM, palette styling, scale state, and pointer-down scaling.
- Retain capability media queries, event tone resolution, canvas resize, particle spawning, trail animation, blur fade, listener cleanup, and reduced-motion/coarse-pointer gating.
- Return only the particle canvas when enabled.

- [ ] **Step 4: Run GREEN and static checks**

Run: `bun test src/lib/portfolioPolishContract.test.ts && bun run lint`

Expected: cursor contract and TypeScript pass.

- [ ] **Step 5: Commit**

Commit with a Lore message recording native cursor ownership, preserved trail behavior, and focused verification.

### Task 2: Remove the Slide-Completion Flash

**Files:**
- Modify: `src/lib/portfolioPolishContract.test.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write the failing completion-order contract**

Locate the GSAP `onComplete` callback and assert source order:

```ts
const completion = appSource.indexOf('onComplete: () =>');
const hideOutgoing = appSource.indexOf("display: 'none'", completion);
const clearOutgoing = appSource.indexOf("clearProps: 'transform,opacity,scale,pointerEvents'", completion);
assert.ok(hideOutgoing >= 0);
assert.ok(hideOutgoing < clearOutgoing);
```

- [ ] **Step 2: Run RED**

Run: `bun test src/lib/portfolioPolishContract.test.ts`

Expected: FAIL because outgoing styles are currently cleared before React hides the element.

- [ ] **Step 3: Implement the minimal ordering fix**

In `onComplete`, set `currentElement` to `display: none` first, then update `currentSlide`, then clear transform/opacity/scale/pointer-event properties without clearing `display`. Keep incoming cleanup and animation lock behavior unchanged.

- [ ] **Step 4: Run GREEN and regression suite**

Run: `bun test src/lib/portfolioPolishContract.test.ts && bun test`

Expected: contract passes and no existing motion/focus tests regress.

- [ ] **Step 5: Commit**

Commit with the measured 28ms flash cause and hide-before-clear rule in Lore trailers.

### Task 3: Reduce S3 to Four Vertical Roles

**Files:**
- Modify: `src/lib/portfolioPolishContract.test.ts`
- Modify: `src/data/contentData.json`
- Modify: `src/components/S3Experience.tsx`

- [ ] **Step 1: Write failing data and layout contracts**

Assert the S3 timeline company order equals:

```ts
[
  'BAZIC ENTERTAINMENT',
  'CÔNG TY CỔ PHẦN TẬP ĐOÀN BALIOGO',
  'CÔNG TY CỔ PHẦN GOVI VIỆT NAM',
  'CÔNG TY CỔ PHẦN CARNOW',
]
```

Also assert `S3Experience.tsx`:

- does not contain GAPO/VOV hard-coded summaries or `ĐƠN VỊ ĐÃ CÔNG TÁC`;
- does not contain `lg:sticky`;
- contains one vertical `space-y` timeline and no two-column role grid;
- derives the visible year range from the first and last timeline periods;
- exposes `data-s3-root`, `data-s3-header`, `data-s3-grid`, `data-s3-left`, and `data-s3-timeline` markers for gated layout CSS.

- [ ] **Step 2: Run RED**

Run: `bun test src/lib/portfolioPolishContract.test.ts`

Expected: FAIL with six timeline records, duplicated employer card, stale `2019 — 2026`, and sticky layout.

- [ ] **Step 3: Update data and component markup**

- Delete the first two S3 timeline records from JSON.
- Derive `startYear` and `endYear` from the retained timeline periods.
- Keep `activeExp = timeline.length - 1` so Carnow starts expanded.
- Remove the redundant employer summary card.
- Remove desktop sticky classes.
- Keep four cards vertical; reduce gaps from `4` to `3`, button padding from `6` to `4`, and expanded-detail spacing to a compact readable rhythm.
- Add the named data markers without introducing another scroller.

- [ ] **Step 4: Run GREEN**

Run: `bun test src/lib/portfolioPolishContract.test.ts src/lib/videoShowcaseContract.test.ts && bun run lint`

Expected: data/layout contracts, video contracts, and TypeScript pass.

- [ ] **Step 5: Commit**

Commit the four-role data and vertical compact markup together because they form one visible content contract.

### Task 4: Gate Desktop Viewport Fit Without Breaking Short Screens

**Files:**
- Modify: `src/lib/portfolioPolishContract.test.ts`
- Modify: `src/index.css`

- [ ] **Step 1: Write the failing responsive CSS contract**

Assert `index.css` includes `@media (min-width: 1280px) and (min-height: 720px)` and rules for the S3 data markers that compact root padding, heading spacing, grid gap, and timeline detail spacing. Extract that gated block and explicitly reject `overflow: hidden`, fixed `height`, `max-height`, and `line-clamp` patterns so the contract proves compaction does not hide timeline content.

- [ ] **Step 2: Run RED**

Run: `bun test src/lib/portfolioPolishContract.test.ts`

Expected: FAIL because no gated S3 CSS exists.

- [ ] **Step 3: Implement minimal gated CSS**

Within the exact media query:

- compact S3 root top/bottom padding while preserving header clearance;
- compact header bottom margin/padding;
- reduce grid gap;
- ensure left video and vertical timeline align at the top;
- reduce retained timeline card/detail spacing only within the gate.

Do not set `overflow: hidden`, fixed heights, line clamps, or content-hiding rules. Below the gate, existing mobile/short-screen scrolling stays untouched.

- [ ] **Step 4: Run automated verification**

Run: `bun run lint && bun test && bun run build`

Expected: TypeScript, full tests, and production build pass.

- [ ] **Step 5: Commit**

Commit the responsive gate with explicit `1280×720` and `1600×700` behavior recorded in Lore trailers.

### Task 5: End-User Browser QA and Iteration

**Files:**
- Modify only confirmed defects from the files above.
- Persist: `.omx/state/cursor-flash-s3-compact/ralph-progress.json` and screenshots.

- [ ] **Step 1: Cursor dogfood**

At `1440×900` with a fine pointer:

- verify computed cursor is not `none` on body, links, and buttons;
- move across dark, light/accent, and interactive targets;
- verify particle canvas renders/moves while no ring/dot DOM exists;
- verify reduced motion and coarse-pointer emulation remove the trail without changing native cursor behavior.

- [ ] **Step 2: Frame-trace transitions**

Record `display` and opacity every animation frame for downward and upward transitions. Confirm outgoing opacity reaches zero, outgoing display becomes none, and no later frame shows outgoing `display:block` at opacity `1`.

- [ ] **Step 3: Desktop S3 dogfood**

At `1280×720` and `1440×900`:

- verify four vertical cards in approved order and Carnow expanded;
- click Bazic, Baliogo, Govi, and Carnow and verify details update;
- verify `scrollHeight <= clientHeight + 1`;
- send one deliberate downward wheel gesture and verify the S4 GSAP transition starts.

- [ ] **Step 4: Below-gate dogfood**

At `1600×700` and `390×844`, verify S3 can inner-scroll to every role and expanded detail without clipping; only a later boundary gesture leaves the section.

- [ ] **Step 5: Regression dogfood**

Recheck S4-S8 showcase landing, drawer isolation, keyboard navigation, touch cancellation, YouTube lifecycle, and reduced-motion transition cleanup. Check browser console for errors.

- [ ] **Step 6: Visual verdict and iteration**

Capture the final S3 desktop screenshot, run the visual-verdict workflow, persist score/reasoning/next actions, and continue until score is at least 90.

- [ ] **Step 7: Final verification and review**

Run: `bun run lint && bun test && bun run build && git diff --check`

Dispatch an independent code reviewer against the implementation commits, fix every Critical/Important finding, re-run verification, and report end-user feedback including remaining limitations.

---

## Completion Evidence

- Native arrow/hand cursor remains visible; particle trail remains responsive.
- Frame trace proves no outgoing full-opacity flash after completion.
- S3 contains exactly four approved vertical roles and accurate `2021–2026` metadata.
- S3 has no meaningful inner travel at `1280×720` and `1440×900`, but remains reachable at `1600×700` and mobile.
- One deliberate desktop gesture enters S4.
- TypeScript, tests, build, visual verdict, end-user QA, and independent review all pass.
