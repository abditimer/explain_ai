import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const artifactPath = new URL('../docs/code/gpt2_next_token.json', import.meta.url);
const logitsPath = new URL('../docs/code/gpt2_next_token_logits.f32', import.meta.url);
const publicArtifactPath = new URL('../public/docs/code/gpt2_next_token.json', import.meta.url);
const publicLogitsPath = new URL('../public/docs/code/gpt2_next_token_logits.f32', import.meta.url);
const sourceTokenizerPath = new URL('../docs/code/tokenizer_demo.json', import.meta.url);
const generatorPath = new URL('../docs/code/record_gpt2_output.py', import.meta.url);

const [artifactBytes, logitsBytes, publicArtifactBytes, publicLogitsBytes, tokenizerBytes, generatorBytes] = await Promise.all([
  readFile(artifactPath), readFile(logitsPath), readFile(publicArtifactPath), readFile(publicLogitsPath), readFile(sourceTokenizerPath), readFile(generatorPath),
]);
const artifact = JSON.parse(artifactBytes.toString('utf8'));
const sha256 = (data) => createHash('sha256').update(data).digest('hex');
assert.equal(artifact.kind, 'checkpoint_next_token_logits');
assert.equal(artifact.model, 'openai-community/gpt2');
assert.equal(artifact.model_revision, '3fe9a169f57f3ca0cac0b9133351644193b9dd3c');
assert.equal(artifact.model_license, 'MIT');
assert.equal(artifact.input_text, 'The cat sat on the');
assert.deepEqual(artifact.input_token_ids, JSON.parse(tokenizerBytes.toString('utf8')).token_ids);
assert.equal(artifact.model_config.vocabulary_size, 50257);
assert.equal(artifact.logits_file.count, 50257);
assert.equal(logitsBytes.length, artifact.logits_file.size_bytes);
assert.equal(logitsBytes.length, artifact.logits_file.count * 4);
assert.equal(sha256(logitsBytes), artifact.logits_file.sha256);
assert.equal(sha256(publicLogitsBytes), artifact.logits_file.sha256);
assert.deepEqual(publicArtifactBytes, artifactBytes);
assert.equal(artifact.provenance.tokenizer_artifact_sha256, sha256(tokenizerBytes));
assert.equal(artifact.provenance.generator_sha256, sha256(generatorBytes));
assert.equal(artifact.checkpoint_file.sha256, '248dfc3911869ec493c76e65bf2fcf7f615828b0254c12b473182f0f81d3a707');

const view = new DataView(logitsBytes.buffer, logitsBytes.byteOffset, logitsBytes.byteLength);
const logits = Array.from({ length: artifact.logits_file.count }, (_, index) => view.getFloat32(index * 4, true));
assert.ok(logits.every(Number.isFinite), 'all checkpoint logits should be finite');
const max = logits.reduce((largest, value) => Math.max(largest, value), -Infinity);
const denominator = logits.reduce((sum, value) => sum + Math.exp(value - max), 0);
const probabilitySum = logits.reduce((sum, value) => sum + Math.exp(value - max) / denominator, 0);
assert.ok(Math.abs(probabilitySum - 1) < 1e-6, `probabilities should sum to 1, found ${probabilitySum}`);
const topIds = logits.map((value, tokenId) => ({ value, tokenId }))
  .sort((left, right) => right.value - left.value)
  .slice(0, artifact.top_tokens_at_temperature_1.length)
  .map(({ tokenId }) => tokenId);
assert.deepEqual(topIds, artifact.top_tokens_at_temperature_1.map(({ token_id }) => token_id));
for (const candidate of artifact.top_tokens_at_temperature_1) {
  const probability = Math.exp(logits[candidate.token_id] - max) / denominator;
  assert.ok(Math.abs(probability - candidate.probability) < 1e-6);
}

function getDistributionSummary(temperature) {
  const scaledMax = logits.reduce((largest, value) => Math.max(largest, value / temperature), -Infinity);
  const scaled = logits.map((value) => Math.exp(value / temperature - scaledMax));
  const total = scaled.reduce((sum, value) => sum + value, 0);
  const normalized = scaled.map((value) => value / total);
  return {
    sum: normalized.reduce((sum, value) => sum + value, 0),
    maximum: Math.max(...normalized),
    entropy: normalized.reduce((sum, value) => value > 0 ? sum - value * Math.log(value) : sum, 0),
  };
}
const sharpened = getDistributionSummary(0.5);
const baseline = getDistributionSummary(1);
const flattened = getDistributionSummary(2);
for (const summary of [sharpened, baseline, flattened]) assert.ok(Math.abs(summary.sum - 1) < 1e-6);
assert.ok(sharpened.maximum > baseline.maximum && baseline.maximum > flattened.maximum);
assert.ok(sharpened.entropy < baseline.entropy && baseline.entropy < flattened.entropy);

console.log(`Verified ${logits.length} logits, pinned checkpoint/tokenizer provenance, top-${topIds.length} ranking, normalized full-vocabulary probabilities at T=0.5/1/2, temperature concentration, and public artifact copies.`);
