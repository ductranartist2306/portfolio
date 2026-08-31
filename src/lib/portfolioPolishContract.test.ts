import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const cursorPath = new URL('../components/CustomCursor.tsx', import.meta.url);

test('custom cursor keeps only the particle canvas and never hides the native cursor', async () => {
  const source = await readFile(cursorPath, 'utf8');

  assert.doesNotMatch(source, /cursor:\s*none|CURSOR_STYLE_ID|ringRef|dotRef/);
  assert.doesNotMatch(source, /h-8 w-8 rounded-full|h-3 w-3 rounded-full/);
  assert.match(source, /<canvas/);
  assert.match(source, /spawnParticle/);
});
