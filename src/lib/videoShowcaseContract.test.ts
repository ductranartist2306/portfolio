import assert from 'node:assert/strict';
import test from 'node:test';

import contentData from '../data/contentData.json';

type ShowcaseItem = {
  title?: string;
  description?: string;
  youtubeUrl?: string | null;
  fallbackVideoUrl?: string | null;
  posterUrl?: string;
  videoUrl?: string | null;
  aspectRatio?: string;
  type?: string;
};

const slides = contentData.slides as unknown as Record<string, Record<string, unknown>>;

function assertShowcasePoster(item: ShowcaseItem, aspectRatio: '16:9' | '9:16') {
  assert.equal(item.aspectRatio, aspectRatio);
  assert.equal(
    item.posterUrl,
    aspectRatio === '16:9'
      ? './assets/video-poster-horizontal.webp'
      : './assets/video-poster-portrait.webp'
  );
}

function assertEmbeddedShowcaseItem(item: ShowcaseItem, aspectRatio: '16:9' | '9:16') {
  assert.ok(item.title?.trim(), 'showcase item requires a title');
  assert.ok(item.description?.trim(), 'showcase item requires a description');
  assert.match(item.youtubeUrl ?? '', /^https:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/);
  assert.match(
    item.fallbackVideoUrl ?? item.videoUrl ?? '',
    /^https:\/\/media\.w3\.org\/.*\.mp4$/,
    'showcase item requires a browser-accessible native fallback'
  );
  assertShowcasePoster(item, aspectRatio);
}

function assertPendingShowcaseItem(item: ShowcaseItem, aspectRatio: '16:9' | '9:16') {
  assert.ok(item.title?.trim(), 'pending showcase item still requires a title');
  assert.equal(item.youtubeUrl ?? null, null, 'pending item must not carry a fake video link');
  assert.equal(item.fallbackVideoUrl ?? null, null, 'pending item must not carry a fake fallback');
  assert.equal(item.videoUrl ?? null, null, 'pending item must not carry a fake fallback');
  assertShowcasePoster(item, aspectRatio);
}

test('S4 exposes one real and one pending horizontal showcase', () => {
  const items = slides.s4.bentoGrid as ShowcaseItem[];
  assert.equal(items.length, 2);
  assertEmbeddedShowcaseItem(items[0], '16:9');
  assertPendingShowcaseItem(items[1], '16:9');
});

test('S5 exposes two real horizontal YouTube showcases', () => {
  const items = slides.s5.bentoGrid as ShowcaseItem[];
  assert.equal(items.length, 2);
  items.forEach((item) => assertEmbeddedShowcaseItem(item, '16:9'));
});

test('S6 exposes three real and one pending vertical showcase', () => {
  const items = slides.s6.grid as ShowcaseItem[];
  assert.equal(items.length, 4);
  items.slice(0, 3).forEach((item) => assertEmbeddedShowcaseItem(item, '9:16'));
  assertPendingShowcaseItem(items[3], '9:16');
});

test('S7 exposes four real vertical YouTube showcases', () => {
  const items = slides.s7.reviews as ShowcaseItem[];
  assert.equal(items.length, 4);
  items.forEach((item) => assertEmbeddedShowcaseItem(item, '9:16'));
});

test('S8 exposes one pending horizontal and one real vertical showcase', () => {
  const items = slides.s8.sections as ShowcaseItem[];

  assert.equal(items.length, 2);
  assert.deepEqual(items.map((item) => item.type), ['video', 'video']);
  assertPendingShowcaseItem(items[0], '16:9');
  assertEmbeddedShowcaseItem(items[1], '9:16');
});
