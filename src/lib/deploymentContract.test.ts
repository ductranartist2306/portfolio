import assert from 'node:assert/strict';
import { access, readFile, stat } from 'node:fs/promises';
import test from 'node:test';

const workflowPath = new URL('../../.github/workflows/deploy-pages.yml', import.meta.url);
const agentsPath = new URL('../../AGENTS.md', import.meta.url);
const viteConfigPath = new URL('../../vite.config.ts', import.meta.url);
const contentDataPath = new URL('../data/contentData.json', import.meta.url);
const compatibilitySpatialPath = new URL('../../assets/project_spatial.jpg', import.meta.url);
const publicSpatialPath = new URL('../../public/assets/project_spatial.jpg', import.meta.url);
const sourceSpatialPath = new URL('../assets/images/project_spatial_1786522224142.jpg', import.meta.url);

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

test('GitHub Pages deployment fails when the live site serves Vite source files', async () => {
  const [workflow, rules] = await Promise.all([
    readFile(workflowPath, 'utf8'),
    readFile(agentsPath, 'utf8'),
  ]);

  assert.match(workflow, /verify:\n\s+needs: deploy/);
  assert.match(workflow, /needs\.deploy\.outputs\.page_url/);
  assert.match(workflow, /actions: read/);
  assert.match(workflow, /github\.token/);
  assert.match(workflow, /pages build and deployment/);
  assert.match(workflow, /src="\/src\/main\.tsx"/);
  assert.match(workflow, /\/portfolio\/assets\//);
  assert.match(rules, /GitHub Actions/);
  assert.match(rules, /Deploy from a branch/);
});

test('Vite defaults production builds to the Pages project path without changing local development', async () => {
  const viteConfig = await readFile(viteConfigPath, 'utf8');

  assert.match(viteConfig, /defineConfig\(\(\{ command \}\)/);
  assert.match(
    viteConfig,
    /base: process\.env\.VITE_BASE_PATH \|\| \(command === 'build' \? '\/portfolio\/' : '\/'\)/
  );
});

test('legacy spatial fallback cannot re-enter the app or deployment artifact as a large asset', async () => {
  const compatibilityAsset = await stat(compatibilitySpatialPath);
  const compatibilityBytes = await readFile(compatibilitySpatialPath);
  const contentData = await readFile(contentDataPath, 'utf8');

  assert.ok(compatibilityAsset.size <= 1024, 'dev compatibility image must stay below 1 KB');
  assert.deepEqual([...compatibilityBytes.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  assert.doesNotMatch(contentData, /project_spatial/);
  await assert.rejects(access(publicSpatialPath));
  await assert.rejects(access(sourceSpatialPath));
});
