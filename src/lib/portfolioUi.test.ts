import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildYouTubeEmbedUrl,
  canNavigateSlides,
  getActiveMediaSource,
  getCursorPalette,
  getHeaderTranslateY,
  getFocusTrapTargetIndex,
  getMediaRenderState,
  getMediaObjectFit,
  getPortalAssetSources,
  getNextMediaSourceIndex,
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

test('portrait and square sources are contained inside the shared 16:9 stage', () => {
  assert.equal(getMediaObjectFit('16:9'), 'cover');
  assert.equal(getMediaObjectFit('9:16'), 'contain');
  assert.equal(getMediaObjectFit('4:5'), 'contain');
  assert.equal(getMediaObjectFit('1:1'), 'contain');
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
