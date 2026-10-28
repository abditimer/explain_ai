import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { TOY_LOGITS, getToyProbabilities } from '../src/data/toySoftmax.js';

const sourcePath = new URL('../src/data/toySoftmax.js', import.meta.url);
const tokenizerPath = new URL('../docs/code/tokenizer_demo.json', import.meta.url);
const outputPath = new URL('../docs/code/generation_demo.json', import.meta.url);
const publicOutputPath = new URL('../public/docs/code/generation_demo.json', import.meta.url);
const source = await readFile(sourcePath);
const tokenizerArtifact = JSON.parse(await readFile(tokenizerPath, 'utf8'));
const temperatures = [0.5, 1, 2];
const distributions = temperatures.map((temperature) => ({
  temperature,
  probabilities: getToyProbabilities(temperature),
}));

const artifact = {
  kind: 'illustrative_softmax_output',
  input: {
    logits: TOY_LOGITS,
    temperatures,
    candidates: tokenizerArtifact.candidate_tokenizations.map(({ text, token_ids }) => ({ text, tokenId: token_ids[0] })),
  },
  output: distributions,
  calculation: 'softmax(logits / temperature), with max subtraction for numerical stability',
  provenance: {
    source: 'src/data/toySoftmax.js',
    source_sha256: createHash('sha256').update(source).digest('hex'),
    tokenizer_artifact: 'docs/code/tokenizer_demo.json',
    tokenizer_artifact_sha256: createHash('sha256').update(await readFile(tokenizerPath)).digest('hex'),
    runtime: `Node.js ${process.versions.node}`,
    checkpoint: null,
  },
  note: 'Fixed illustrative logits only. Probabilities are not model outputs; candidate strings are editorial labels for the three toy scores.',
};

const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
await Promise.all([writeFile(outputPath, serialized), writeFile(publicOutputPath, serialized)]);
console.log(`Recorded ${distributions.length} illustrative distributions in ${outputPath.pathname}`);
