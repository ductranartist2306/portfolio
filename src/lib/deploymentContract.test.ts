import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const workflowPath = new URL('../../.github/workflows/deploy-pages.yml', import.meta.url);
const viteConfigPath = new URL('../../vite.config.ts', import.meta.url);

test('GitHub Pages workflow verifies and deploys the dist artifact from main', async () => {
  const workflow = await readFile(workflowPath, 'utf8');

  assert.match(workflow, /branches:\s*\n\s*- main/);
  assert.match(workflow, /bun install --frozen-lockfile/);
  assert.match(workflow, /bun run test/);
  assert.match(workflow, /bun run lint/);
  assert.match(workflow, /VITE_BASE_PATH: \/portfolio\//);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /path: dist/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /pages: write/);
  assert.match(workflow, /id-token: write/);
});

test('Vite reads the deploy-time Pages base without changing local development', async () => {
  const viteConfig = await readFile(viteConfigPath, 'utf8');

  assert.match(viteConfig, /base: process\.env\.VITE_BASE_PATH \|\| '\/'/);
});
