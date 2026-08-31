import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildYouTubeEmbedUrl,
  canNavigateSlides,
  getActiveMediaSource,
  getCursorPalette,
  getElementOffsetTop,
  getHeaderTranslateY,
  getFocusTrapTargetIndex,
  getMediaRenderState,
  getMediaObjectFit,
  getMediaStageClass,
  getPortalAssetSources,
  getNextMediaSourceIndex,
  getShowcaseScrollTop,
  shouldHoldTransitionInput,
  getWheelDeltaPixels,
  getWheelGestureAction,
  shouldNavigateFromScroll,
  shouldEnableCustomCursor,
} from './portfolioUi';

test('header scrolls away over exactly one measured header height', () => {
  assert.equal(getHeaderTranslateY(0, 72), 0);
  assert.equal(getHeaderTranslateY(24, 72), -24);
  assert.equal(getHeaderTranslateY(120, 72), -72);
  assert.equal(getHeaderTranslateY(-12, 72), 0);
});

test('inactive YouTube media has no iframe source', () => {
  assert.equal(
    buildYouTubeEmbedUrl('https://www.youtube.com/embed/abc123', {
      isActive: false,
      autoplay: true,
      reducedMotion: false,
    }),
    null
  );
});

test('inactive native media has no video source', () => {
  assert.equal(getActiveMediaSource('/assets/project.mp4', false), undefined);
  assert.equal(getActiveMediaSource('/assets/project.mp4', true), '/assets/project.mp4');
});

test('active YouTube media exposes controls and scopes autoplay to motion preference', () => {
  const activeUrl = buildYouTubeEmbedUrl('https://www.youtube.com/embed/abc123?controls=0', {
    isActive: true,
    autoplay: true,
    reducedMotion: false,
  });
  const reducedUrl = buildYouTubeEmbedUrl('https://www.youtube.com/embed/abc123?autoplay=1', {
    isActive: true,
    autoplay: true,
    reducedMotion: true,
  });

  assert.ok(activeUrl);
  assert.equal(new URL(activeUrl).searchParams.get('enablejsapi'), '1');
  assert.equal(new URL(activeUrl).searchParams.get('controls'), '1');
  assert.equal(new URL(activeUrl).searchParams.get('autoplay'), '1');
  assert.equal(new URL(activeUrl).searchParams.get('mute'), '1');
  assert.ok(reducedUrl);
  assert.equal(new URL(reducedUrl).searchParams.get('autoplay'), '0');
});

test('non-landscape native sources remain contained inside their presentation stage', () => {
  assert.equal(getMediaObjectFit('16:9'), 'cover');
  assert.equal(getMediaObjectFit('9:16'), 'contain');
  assert.equal(getMediaObjectFit('4:5'), 'contain');
  assert.equal(getMediaObjectFit('1:1'), 'contain');
});

test('showcase stages use the requested horizontal or vertical presentation ratio', () => {
  assert.equal(getMediaStageClass('16:9'), 'aspect-video');
  assert.equal(getMediaStageClass('9:16'), 'aspect-[9/16]');
  assert.equal(getMediaStageClass('4:5'), 'aspect-[4/5]');
  assert.equal(getMediaStageClass('1:1'), 'aspect-square');
});

test('media render state distinguishes unavailable, deferred, native, and YouTube branches', () => {
  assert.equal(
    getMediaRenderState({ activeSource: undefined, hasError: false, hasYoutube: false, youtubeSrc: null }),
    'unavailable'
  );
  assert.equal(
    getMediaRenderState({ activeSource: '/video.mp4', hasError: true, hasYoutube: false, youtubeSrc: null }),
    'unavailable'
  );
  assert.equal(
    getMediaRenderState({ activeSource: undefined, hasError: false, hasYoutube: true, youtubeSrc: null }),
    'deferred-youtube'
  );
  assert.equal(
    getMediaRenderState({ activeSource: undefined, hasError: false, hasYoutube: true, youtubeSrc: 'https://www.youtube.com/embed/id' }),
    'youtube'
  );
  assert.equal(
    getMediaRenderState({ activeSource: '/video.mp4', hasError: false, hasYoutube: false, youtubeSrc: null }),
    'native'
  );
});

test('failed YouTube embeds fall back to an available native source', () => {
  const options = {
    activeSource: '/video-fallback.mp4',
    hasError: false,
    hasYoutube: true,
    youtubeSrc: 'https://www.youtube.com/embed/blocked',
    youtubeFailed: true,
  } as Parameters<typeof getMediaRenderState>[0] & { youtubeFailed: boolean };

  assert.equal(getMediaRenderState(options), 'native');
});

test('portal asset URLs honor the GitHub Pages base path', () => {
  assert.deepEqual(getPortalAssetSources('/portfolio/'), {
    desktopAvif: '/portfolio/assets/golden-portal-desktop.avif',
    desktopWebp: '/portfolio/assets/golden-portal-desktop.webp',
    mobileAvif: '/portfolio/assets/golden-portal-mobile.avif',
    mobileWebp: '/portfolio/assets/golden-portal-mobile.webp',
  });
  assert.equal(getPortalAssetSources('/portfolio').desktopAvif, '/portfolio/assets/golden-portal-desktop.avif');
});

test('focus trap wraps only at drawer boundaries', () => {
  assert.equal(getFocusTrapTargetIndex({ activeIndex: 0, count: 4, shiftKey: true }), 3);
  assert.equal(getFocusTrapTargetIndex({ activeIndex: 3, count: 4, shiftKey: false }), 0);
  assert.equal(getFocusTrapTargetIndex({ activeIndex: 1, count: 4, shiftKey: false }), null);
  assert.equal(getFocusTrapTargetIndex({ activeIndex: -1, count: 0, shiftKey: false }), null);
});

test('native media fallback advances once and stops after the final source', () => {
  assert.equal(getNextMediaSourceIndex(0, 2), 1);
  assert.equal(getNextMediaSourceIndex(1, 2), null);
  assert.equal(getNextMediaSourceIndex(0, 0), null);
});

test('custom cursor requires hover, a fine pointer, and full motion', () => {
  assert.equal(
    shouldEnableCustomCursor({ canHover: true, finePointer: true, reducedMotion: false }),
    true
  );
  assert.equal(
    shouldEnableCustomCursor({ canHover: false, finePointer: true, reducedMotion: false }),
    false
  );
  assert.equal(
    shouldEnableCustomCursor({ canHover: true, finePointer: true, reducedMotion: true }),
    false
  );
});

test('cursor palettes provide explicit light, dark, and accent contrast modes', () => {
  assert.deepEqual(getCursorPalette('light'), {
    foreground: '#FFF8E7',
    outline: '#111111',
    trail: 'rgba(255, 214, 140, 0.72)',
  });
  assert.deepEqual(getCursorPalette('dark'), {
    foreground: '#111111',
    outline: '#FFF8E7',
    trail: 'rgba(64, 32, 12, 0.58)',
  });
  assert.equal(getCursorPalette('accent').foreground, '#F4B860');
});

test('open navigation drawer suspends slide navigation', () => {
  assert.equal(canNavigateSlides({ drawerOpen: true, interactiveTarget: false }), false);
  assert.equal(canNavigateSlides({ drawerOpen: false, interactiveTarget: true }), false);
  assert.equal(canNavigateSlides({ drawerOpen: false, interactiveTarget: false }), true);
});

test('keyboard navigation leaves a long section only at its requested boundary', () => {
  assert.equal(
    shouldNavigateFromScroll({ direction: 'down', scrollTop: 120, scrollHeight: 1000, clientHeight: 500 }),
    false
  );
  assert.equal(
    shouldNavigateFromScroll({ direction: 'down', scrollTop: 500, scrollHeight: 1000, clientHeight: 500 }),
    true
  );
  assert.equal(
    shouldNavigateFromScroll({ direction: 'up', scrollTop: 120, scrollHeight: 1000, clientHeight: 500 }),
    false
  );
  assert.equal(
    shouldNavigateFromScroll({ direction: 'up', scrollTop: 0, scrollHeight: 1000, clientHeight: 500 }),
    true
  );
});

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

test('showcase focus top-aligns a tall target below the safe inset', () => {
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
  assert.equal(
    getShowcaseScrollTop({
      scrollHeight: 1000,
      clientHeight: 800,
      targetOffsetTop: 50,
      targetHeight: 300,
      safeInset: 80,
    }),
    0
  );
  assert.equal(
    getShowcaseScrollTop({
      scrollHeight: 1000,
      clientHeight: 800,
      targetOffsetTop: 900,
      targetHeight: 300,
      safeInset: 80,
    }),
    200
  );
});

test('showcase layout offsets follow a stable non-sticky anchor chain', () => {
  const root = { offsetTop: 0, offsetParent: null } as unknown as HTMLElement;
  const gridAnchor = { offsetTop: 237, offsetParent: root } as unknown as HTMLElement;
  const showcase = { offsetTop: 0, offsetParent: gridAnchor } as unknown as HTMLElement;

  assert.equal(getElementOffsetTop(showcase, root), 237);
});

test('wheel deltas normalize pixel, line, and page input to one distance unit', () => {
  assert.equal(
    getWheelDeltaPixels({ deltaY: 24, deltaMode: 0, lineHeight: 20, pageHeight: 900 }),
    24
  );
  assert.equal(
    getWheelDeltaPixels({ deltaY: 3, deltaMode: 1, lineHeight: 20, pageHeight: 900 }),
    60
  );
  assert.equal(
    getWheelDeltaPixels({ deltaY: -1, deltaMode: 2, lineHeight: 20, pageHeight: 900 }),
    -900
  );
});

test('wheel gestures scroll long section content before changing slides', () => {
  assert.equal(
    getWheelGestureAction({
      atBoundary: false,
      startedAtBoundary: false,
      accumulatedDelta: 80,
    }),
    'scroll-section'
  );
});

test('the gesture that reaches a boundary cannot spend its inertial tail on navigation', () => {
  assert.equal(
    getWheelGestureAction({
      atBoundary: true,
      startedAtBoundary: false,
      accumulatedDelta: 160,
    }),
    'hold-boundary'
  );
});

test('a new deliberate gesture at the boundary changes slides after its threshold', () => {
  assert.equal(
    getWheelGestureAction({
      atBoundary: true,
      startedAtBoundary: true,
      accumulatedDelta: 20,
    }),
    'hold-boundary'
  );
  assert.equal(
    getWheelGestureAction({
      atBoundary: true,
      startedAtBoundary: true,
      accumulatedDelta: 30,
    }),
    'navigate-slide'
  );
});

test('transition animation consumes wheel input while slides overlap', () => {
  assert.equal(shouldHoldTransitionInput({ isAnimating: true }), true);
});

test('completed transitions immediately release new wheel input', () => {
  const formerlyLockedInput = { isAnimating: false, now: 200, lockUntil: 260 };

  assert.equal(shouldHoldTransitionInput(formerlyLockedInput), false);
});
