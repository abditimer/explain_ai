import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { TOY_LOGITS, getToyProbabilities } from '../src/data/toySoftmax.js';
import { ILLUSTRATIVE_ATTENTION_SCORES, ILLUSTRATIVE_ATTENTION_WEIGHTS } from '../src/data/attentionDemo.js';

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const generation = await readJson('../docs/code/generation_demo.json');
const generationPublic = await readFile(new URL('../public/docs/code/generation_demo.json', import.meta.url), 'utf8');
const generationSource = await readFile(new URL('../src/data/toySoftmax.js', import.meta.url));
const tokenizer = await readJson('../docs/code/tokenizer_demo.json');
const tokenizerPublic = await readFile(new URL('../public/docs/code/tokenizer_demo.json', import.meta.url), 'utf8');
const tokenizerSource = await readFile(new URL('../docs/code/record_tokenizer_demo.py', import.meta.url));
const close = (actual, expected, label) => assert.ok(Math.abs(actual - expected) <= 1e-12, `${label}: ${actual} != ${expected}`);

assert.deepEqual(generation.input.logits, TOY_LOGITS);
assert.deepEqual(generation.input.temperatures, [0.5, 1, 2]);
assert.equal(generation.provenance.source_sha256, createHash('sha256').update(generationSource).digest('hex'));
assert.equal(generation.provenance.tokenizer_artifact_sha256, createHash('sha256').update(await readFile(new URL('../docs/code/tokenizer_demo.json', import.meta.url))).digest('hex'));
assert.equal(await readFile(new URL('../public/docs/code/generation_demo.json', import.meta.url), 'utf8'), `${JSON.stringify(generation, null, 2)}\n`);
assert.equal(generationPublic, `${JSON.stringify(generation, null, 2)}\n`);

let previousPeak = 1;
for (const distribution of generation.output) {
  const expected = getToyProbabilities(distribution.temperature);
  assert.equal(distribution.probabilities.length, TOY_LOGITS.length);
  distribution.probabilities.forEach((probability, index) => close(probability, expected[index], `temperature ${distribution.temperature}, candidate ${index}`));
  close(distribution.probabilities.reduce((sum, value) => sum + value, 0), 1, `temperature ${distribution.temperature} normalization`);
  assert.ok(distribution.probabilities[0] < previousPeak, 'higher temperature should flatten the leading candidate');
  previousPeak = distribution.probabilities[0];
}

assert.equal(tokenizer.kind, 'tokenizer_output');
assert.equal(tokenizer.input_text, 'The cat sat on the');
assert.equal(tokenizer.decoded_text, tokenizer.input_text);
assert.equal(tokenizer.source_sha256, createHash('sha256').update(tokenizerSource).digest('hex'));
assert.deepEqual(generation.input.candidates, tokenizer.candidate_tokenizations.map(({ text, token_ids }) => ({ text, tokenId: token_ids[0] })));
assert.equal(tokenizerPublic, `${JSON.stringify(tokenizer, null, 2)}\n`);

assert.equal(ILLUSTRATIVE_ATTENTION_SCORES.length, 3);
assert.equal(ILLUSTRATIVE_ATTENTION_WEIGHTS.length, 3);
for (let queryIndex = 0; queryIndex < ILLUSTRATIVE_ATTENTION_SCORES.length; queryIndex += 1) {
  const scores = ILLUSTRATIVE_ATTENTION_SCORES[queryIndex];
  const weights = ILLUSTRATIVE_ATTENTION_WEIGHTS[queryIndex];
  assert.equal(scores.length, 3, `score row ${queryIndex} shape`);
  assert.equal(weights.length, 3, `weight row ${queryIndex} shape`);
  const allowed = scores.slice(0, queryIndex + 1).map((score) => score / Math.sqrt(64));
  const max = Math.max(...allowed);
  const exponentials = allowed.map((score) => Math.exp(score - max));
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  weights.forEach((weight, index) => {
    const expected = index <= queryIndex ? exponentials[index] / total : 0;
    close(weight, expected, `attention query ${queryIndex}, key ${index}`);
  });
  close(weights.reduce((sum, value) => sum + value, 0), 1, `attention query ${queryIndex} normalization`);
}

console.log('Verified tokenizer provenance, toy temperature softmax, causal attention mask, normalized weights, and public data copies.');
