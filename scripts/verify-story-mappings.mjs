import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { storySections } from '../src/data/story.js';
import { codeBlocks } from '../src/data/generatedCodeBlocks.js';

const sourcePath = new URL('../docs/code/teaching_transformer.py', import.meta.url);
const sourceLines = (await readFile(sourcePath, 'utf8')).split(/\r?\n/);
const componentFiles = new URL('../src/components/diagrams/', import.meta.url);
const { readdir } = await import('node:fs/promises');
const componentSources = await Promise.all((await readdir(componentFiles))
  .filter((file) => file.endsWith('.jsx'))
  .map((file) => readFile(new URL(file, componentFiles), 'utf8')));
const staticIds = new Set();
const dynamicPrefixes = new Set();

for (const source of componentSources) {
  const literals = /data-object-id['"]\s*,\s*(['"`])([^'"`]+)\1/g;
  for (const match of source.matchAll(literals)) {
    const value = match[2];
    const dynamicAt = value.indexOf('${');
    if (dynamicAt < 0) staticIds.add(value);
    else dynamicPrefixes.add(value.slice(0, dynamicAt));
  }
}

let mappedBeats = 0;
for (const section of storySections) {
  const beatIds = new Set(section.beats.map(({ id }) => id));
  for (const [beatId, operation] of Object.entries(section.operations ?? {})) {
    assert.ok(beatIds.has(beatId), `${section.id}: operation references unknown beat ${beatId}`);
    assert.ok(operation.id, `${beatId}: operation id is required`);
    assert.ok(operation.tensorShape, `${beatId}: tensor shape is required`);
    const snippetId = operation.snippetId ?? section.snippetId;
    assert.ok(codeBlocks.some((block) => block.id === snippetId), `${beatId}: unknown code excerpt ${snippetId}`);
    assert.ok(Array.isArray(operation.lines) && operation.lines.length === 2, `${beatId}: source line range is required`);
    const [start, end] = operation.lines;
    assert.ok(Number.isInteger(start) && Number.isInteger(end) && start > 0 && end >= start && end <= sourceLines.length,
      `${beatId}: invalid source range ${start}-${end}`);
    assert.ok(Array.isArray(operation.diagramObjectIds) && operation.diagramObjectIds.length > 0,
      `${beatId}: at least one diagram object mapping is required`);
    for (const objectId of operation.diagramObjectIds) {
      assert.ok(staticIds.has(objectId) || [...dynamicPrefixes].some((prefix) => objectId.startsWith(prefix)),
        `${beatId}: diagram object ${objectId} is not present in the diagram source`);
    }
    mappedBeats += 1;
  }
}

console.log(`Verified ${mappedBeats} beat-to-code ranges and diagram object mappings.`);
