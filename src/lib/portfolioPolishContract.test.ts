import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const cursorPath = new URL('../components/CustomCursor.tsx', import.meta.url);
const appPath = new URL('../App.tsx', import.meta.url);
const contentPath = new URL('../data/contentData.json', import.meta.url);
const s3Path = new URL('../components/S3Experience.tsx', import.meta.url);
const cssPath = new URL('../index.css', import.meta.url);

test('custom cursor keeps only the particle canvas and never hides the native cursor', async () => {
  const source = await readFile(cursorPath, 'utf8');

  assert.doesNotMatch(source, /cursor:\s*none|CURSOR_STYLE_ID|ringRef|dotRef/);
  assert.doesNotMatch(source, /h-8 w-8 rounded-full|h-3 w-3 rounded-full/);
  assert.match(source, /<canvas/);
  assert.match(source, /spawnParticle/);
});

test('slide completion hides the outgoing element before clearing its fade styles', async () => {
  const source = await readFile(appPath, 'utf8');
  const completion = source.indexOf('onComplete: () =>');
  const hideOutgoing = source.indexOf("display: 'none'", completion);
  const clearOutgoing = source.indexOf(
    "clearProps: 'transform,opacity,scale,pointerEvents'",
    completion
  );

  assert.ok(completion >= 0);
  assert.ok(hideOutgoing >= 0, 'outgoing slide must be hidden in onComplete');
  assert.ok(hideOutgoing < clearOutgoing, 'outgoing slide must hide before clearProps');
});

test('wheel input is released immediately after a transition completes', async () => {
  const source = await readFile(appPath, 'utf8');
  const completion = source.indexOf('onComplete: () =>');
  const handleWheel = source.indexOf('const handleWheel =');
  const handleWheelEnd = source.indexOf('const handleTouchStart =', handleWheel);
  const wheelHandler = source.slice(handleWheel, handleWheelEnd);

  assert.ok(completion >= 0);
  assert.doesNotMatch(source, /transitionInputLockUntilRef/);
  assert.match(wheelHandler, /shouldHoldTransitionInput\(\{ isAnimating: isAnimating\.current \}\)/);
});

test('S3 keeps the four approved roles in chronological order', async () => {
  const content = JSON.parse(await readFile(contentPath, 'utf8'));
  const companies = content.slides.s3.timeline.map((item: { company: string }) => item.company);

  assert.deepEqual(companies, [
    'BAZIC ENTERTAINMENT',
    'CÔNG TY CỔ PHẦN TẬP ĐOÀN BALIOGO',
    'CÔNG TY CỔ PHẦN GOVI VIỆT NAM',
    'CÔNG TY CỔ PHẦN CARNOW',
  ]);
});

test('S3 renders one compact vertical timeline without duplicated employer UI', async () => {
  const source = await readFile(s3Path, 'utf8');

  assert.doesNotMatch(source, /GAPO Social|VOV World|ĐƠN VỊ ĐÃ CÔNG TÁC|lg:sticky/);
  assert.match(source, /const startYear =/);
  assert.match(source, /const endYear =/);
  assert.match(source, /data-s3-root/);
  assert.match(source, /data-s3-header/);
  assert.match(source, /data-s3-grid/);
  assert.match(source, /data-s3-left/);
  assert.match(source, /data-s3-timeline/);
  assert.match(source, /data-s3-timeline[^>]*className="[^"]*space-y-3/s);
  assert.doesNotMatch(source, /data-s3-timeline[^>]*grid-cols-2/s);
});

test('S3 desktop fit uses an explicit width-and-height gate without hiding content', async () => {
  const source = await readFile(cssPath, 'utf8');
  const mediaStart = source.indexOf('@media (min-width: 1280px) and (min-height: 720px)');
  const nextMedia = source.indexOf('@media', mediaStart + 1);
  const gatedRules = source.slice(mediaStart, nextMedia >= 0 ? nextMedia : undefined);

  assert.ok(mediaStart >= 0, 'compact S3 requires the approved desktop gate');
  assert.match(gatedRules, /\[data-s3-root\]/);
  assert.match(gatedRules, /\[data-s3-header\]/);
  assert.match(gatedRules, /\[data-s3-grid\]/);
  assert.match(gatedRules, /\[data-s3-left\]/);
  assert.match(gatedRules, /\[data-s3-timeline\]/);
  assert.doesNotMatch(
    gatedRules,
    /overflow:\s*hidden|max-height|line-clamp|\n\s*height:\s*\d/
  );
});
