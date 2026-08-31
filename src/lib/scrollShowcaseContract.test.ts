import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const showcaseComponents = [
  'S3Experience',
  'S4Commercials',
  'S5Animation',
  'S6TikTok',
  'S7Reviews',
  'S8Events',
];

test('each video section owns exactly one showcase focus target', async () => {
  for (const component of showcaseComponents) {
    const source = await readFile(
      new URL(`../components/${component}.tsx`, import.meta.url),
      'utf8'
    );

    assert.equal(
      source.match(/data-showcase-focus/g)?.length,
      1,
      `${component} must expose one showcase target`
    );
  }
});

test('individual video cards are not scroll navigation targets', async () => {
  const source = await readFile(
    new URL('../components/VideoCard.tsx', import.meta.url),
    'utf8'
  );

  assert.doesNotMatch(source, /data-scroll-focus|data-showcase-focus/);
});

test('S3 keeps one shared section scroll owner', async () => {
  const source = await readFile(
    new URL('../components/S3Experience.tsx', import.meta.url),
    'utf8'
  );

  assert.equal(source.match(/data-slide-scroll/g)?.length, 1);
  assert.equal(source.match(/data-showcase-anchor/g)?.length, 1);
});

test('App restores the approved GSAP motion and section focus preparation', async () => {
  const source = await readFile(new URL('../App.tsx', import.meta.url), 'utf8');

  assert.match(source, /import gsap from 'gsap'/);
  assert.match(source, /const exitDuration = reducedMotion \? 0\.01 : 0\.22/);
  assert.match(source, /const enterDuration = reducedMotion \? 0\.01 : 0\.34/);
  assert.match(source, /const enterOffset = reducedMotion \? 0 : 18/);
  assert.match(source, /const exitOffset = reducedMotion \? 0 : 10/);
  assert.match(source, /getShowcaseScrollTop/);
  assert.match(source, /getElementOffsetTop\(showcaseAnchor, scrollElement\)/);
  assert.match(source, /getWheelGestureAction/);
  assert.match(source, /getWheelDeltaPixels/);
  assert.match(source, /addEventListener\('touchcancel'/);
  assert.match(source, /removeEventListener\('touchcancel'/);
  assert.doesNotMatch(source, /IntersectionObserver|data-scroll-focus/);
});

test('incoming slides become measurable before showcase focus is calculated', async () => {
  const source = await readFile(new URL('../App.tsx', import.meta.url), 'utf8');
  const navigationStart = source.indexOf('const goToSlide');
  const hiddenReveal = source.indexOf("visibility: 'hidden'", navigationStart);
  const focusPreparation = source.indexOf('prepareSlideFocus(targetIndex)', hiddenReveal);
  const entrancePreparation = source.indexOf(
    'yPercent: direction * enterOffset',
    navigationStart
  );

  assert.ok(hiddenReveal >= 0, 'incoming slide must be revealed invisibly for measurement');
  assert.ok(hiddenReveal < focusPreparation, 'incoming slide must be measurable before focus');
  assert.ok(focusPreparation < entrancePreparation, 'focus must settle before entrance motion');
});

test('document-level snap rules do not compete with controlled slide motion', async () => {
  const source = await readFile(new URL('../index.css', import.meta.url), 'utf8');

  assert.doesNotMatch(source, /scroll-snap-type|scroll-snap-align|data-scroll-focus/);
  assert.match(source, /\.magazine-slide\s*\{[^}]*will-change:\s*transform, opacity/s);
});

test('header follows and locks the active inner slide scroller', async () => {
  const source = await readFile(new URL('../components/Header.tsx', import.meta.url), 'utf8');

  assert.match(source, /useMotionValue/);
  assert.match(source, /useSpring/);
  assert.match(source, /getHeaderTranslateY/);
  assert.match(source, /\[data-slide-scroll\]/);
  assert.match(source, /reducedMotion\?: boolean/);
  assert.doesNotMatch(source, /\[data-portfolio-scroll\]/);
});
