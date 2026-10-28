import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const generatedPath = new URL('../src/data/generatedCodeBlocks.js', import.meta.url);
const sourcePath = new URL('../docs/code/teaching_transformer.py', import.meta.url);
const pagePath = new URL('../public/implementation.html', import.meta.url);
const generated = (await readFile(generatedPath, 'utf8')).replace(/^\/\/.*\n/, '');
const { codeBlocks } = await import(`data:text/javascript;base64,${Buffer.from(generated).toString('base64')}`);
const sourceLines = (await readFile(sourcePath, 'utf8')).split(/\r?\n/);
const page = await readFile(pagePath, 'utf8');

for (const block of codeBlocks) {
  assert.equal(
    block.code,
    sourceLines.slice(block.startLine - 1, block.endLine).join('\n').trimEnd(),
    `${block.id} excerpt must match the canonical source line range`,
  );
  assert.ok(page.includes(`id="region-${block.id}"`), `${block.id} full-source anchor must exist`);
  assert.ok(page.includes(`id="region-${block.id}-L${block.startLine}"`), `${block.id} exact start-line anchor must exist`);
}

console.log(`Verified ${codeBlocks.length} canonical code excerpts and full-source anchors.`);
