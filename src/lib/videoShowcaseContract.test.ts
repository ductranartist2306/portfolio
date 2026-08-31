import assert from 'node:assert/strict';
import test from 'node:test';

import contentData from '../data/contentData.json';

type ShowcaseItem = {
  title?: string;
  description?: string;
  youtubeUrl?: string;
  fallbackVideoUrl?: string;
  posterUrl?: string;
  videoUrl?: string;
  aspectRatio?: string;
  type?: string;
};

const slides = contentData.slides as unknown as Record<string, Record<string, unknown>>;

function assertEmbeddedShowcaseItem(item: ShowcaseItem, aspectRatio: '16:9' | '9:16') {
  assert.ok(item.title?.trim(), 'showcase item requires a title');
  assert.ok(item.description?.trim(), 'showcase item requires a description');
  assert.match(item.youtubeUrl ?? '', /^https:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/);
  assert.match(
    item.fallbackVideoUrl ?? item.videoUrl ?? '',
    /^https:\/\/media\.w3\.org\/.*\.mp4$/,
    'showcase item requires a browser-accessible native fallback'
  );
  assert.equal(item.aspectRatio, aspectRatio);
  assert.equal(
    item.posterUrl,
    aspectRatio === '16:9'
      ? './assets/video-poster-horizontal.webp'
      : './assets/video-poster-portrait.webp'
  );
}

test('S4 and S5 each expose two horizontal YouTube showcases', () => {
  for (const slideId of ['s4', 's5']) {
    const items = slides[slideId].bentoGrid as ShowcaseItem[];
    assert.equal(items.length, 2);
    items.forEach((item) => assertEmbeddedShowcaseItem(item, '16:9'));
  }
});

test('S6 and S7 each expose two vertical YouTube showcases', () => {
  const collections = [
    slides.s6.grid as ShowcaseItem[],
    slides.s7.reviews as ShowcaseItem[],
  ];

  for (const items of collections) {
    assert.equal(items.length, 2);
    items.forEach((item) => assertEmbeddedShowcaseItem(item, '9:16'));
  }
});

test('S8 exposes one horizontal and one vertical YouTube showcase', () => {
  const items = slides.s8.sections as ShowcaseItem[];

  assert.equal(items.length, 2);
  assert.deepEqual(items.map((item) => item.type), ['video', 'video']);
  assertEmbeddedShowcaseItem(items[0], '16:9');
  assertEmbeddedShowcaseItem(items[1], '9:16');
});
