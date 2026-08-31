import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const cursorPath = new URL('../components/CustomCursor.tsx', import.meta.url);
const appPath = new URL('../App.tsx', import.meta.url);

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
