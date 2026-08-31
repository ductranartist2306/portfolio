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
});
