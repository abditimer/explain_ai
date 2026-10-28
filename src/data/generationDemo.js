import tokenizerDemo from '../../docs/code/tokenizer_demo.json';
export { TOY_LOGITS, getToyProbabilities } from './toySoftmax.js';

export const EXAMPLE_CANDIDATES = tokenizerDemo.candidate_tokenizations.map((candidate) => ({
  text: candidate.text,
  tokenId: candidate.token_ids[0],
}));
