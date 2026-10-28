import generationOutput from '../../docs/code/gpt2_next_token.json';
import logitsUrl from '../../docs/code/gpt2_next_token_logits.f32?url';

export const CHECKPOINT_OUTPUT = generationOutput;
export const TOP_CANDIDATES = generationOutput.top_tokens_at_temperature_1;
export const DISPLAY_CANDIDATES = TOP_CANDIDATES.slice(0, 5);

let logitsPromise;

export function loadCheckpointLogits() {
  if (!logitsPromise) {
    logitsPromise = fetch(logitsUrl).then(async (response) => {
      if (!response.ok) throw new Error(`Could not load checkpoint logits (${response.status})`);
      const buffer = await response.arrayBuffer();
      const expectedBytes = generationOutput.logits_file.count * Float32Array.BYTES_PER_ELEMENT;
      if (buffer.byteLength !== expectedBytes) {
        throw new Error(`Checkpoint logits have ${buffer.byteLength} bytes; expected ${expectedBytes}`);
      }
      const digest = await crypto.subtle.digest('SHA-256', buffer);
      const checksum = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
      if (checksum !== generationOutput.logits_file.sha256) throw new Error('Checkpoint logits checksum did not match the recorded output.');
      const view = new DataView(buffer);
      return Float32Array.from({ length: generationOutput.logits_file.count }, (_, index) => view.getFloat32(index * 4, true));
    }).catch((error) => {
      logitsPromise = undefined;
      throw error;
    });
  }
  return logitsPromise;
}

export function getCandidateProbabilities(logits, temperature) {
  if (!logits || logits.length !== generationOutput.model_config.vocabulary_size) return null;
  const maximum = logits.reduce((largest, value) => Math.max(largest, value / temperature), -Infinity);
  let denominator = 0;
  for (let index = 0; index < logits.length; index += 1) {
    denominator += Math.exp(logits[index] / temperature - maximum);
  }
  return DISPLAY_CANDIDATES.map((candidate) => ({
    ...candidate,
    probability: Math.exp(logits[candidate.token_id] / temperature - maximum) / denominator,
  }));
}

export function getTopProbability(probabilities) {
  return probabilities?.[0]?.probability ?? 0;
}
