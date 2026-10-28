import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const distRoot = new URL('../dist/', import.meta.url);
const manifestPath = new URL('../dist/precache-manifest.json', import.meta.url);
const assetPaths = JSON.parse(await readFile(manifestPath, 'utf8'));
assert.ok(Array.isArray(assetPaths), 'offline manifest must be a path list');
assert.ok(assetPaths.includes('implementation.html'), 'full source page must be available offline');
assert.ok(assetPaths.includes('sources.html'), 'sources page must be available offline');
assert.ok(assetPaths.some((file) => file.endsWith('gpt2_next_token_logits.f32')), 'full-vocabulary checkpoint data must be available offline');
assert.ok(assetPaths.some((file) => /GenerationDiagram-.*\.js$/.test(file)), 'deferred generation scene must be available offline');
assert.ok(assetPaths.some((file) => /AttentionDiagram-.*\.js$/.test(file)), 'deferred attention scene must be available offline');
assert.ok(!assetPaths.includes('index.html'), 'the app shell is cached separately');
assert.ok(!assetPaths.includes('service-worker.js'), 'the worker must stay updateable from the network');
assert.ok(!assetPaths.includes('precache-manifest.json'), 'the manifest is read during install rather than cached');

let totalBytes = 0;
const expectedFiles = new Set();
for (const assetPath of assetPaths) {
  assert.equal(path.posix.normalize(assetPath), assetPath, `manifest path should be normalized: ${assetPath}`);
  const absolutePath = new URL(assetPath, distRoot);
  const details = await stat(absolutePath);
  assert.ok(details.isFile(), `manifest target must exist: ${assetPath}`);
  totalBytes += details.size;
  expectedFiles.add(assetPath);
}

async function allDistFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = await Promise.all(entries.map(async (entry) => {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return allDistFiles(new URL(`${entry.name}/`, directory), relativePath);
    if (entry.name === 'index.html' || entry.name === 'service-worker.js' || entry.name === 'precache-manifest.json') return [];
    return [relativePath];
  }));
  return paths.flat();
}

const allAssets = await allDistFiles(distRoot);
assert.deepEqual([...expectedFiles].sort(), allAssets.sort(), 'manifest should contain every offline file exactly once');
assert.ok(totalBytes <= 1_500_000, `offline precache budget exceeded: ${totalBytes} bytes`);
console.log(`Verified ${assetPaths.length} offline assets (${totalBytes.toLocaleString()} bytes), including the full vocabulary output and all scene chunks.`);
