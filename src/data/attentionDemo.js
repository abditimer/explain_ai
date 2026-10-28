// Invented values used only to illustrate causal masking and row normalization.
export const ILLUSTRATIVE_ATTENTION_SCORES = [
  [3.2, 1.0, 0.4],
  [1.1, 2.8, 1.2],
  [0.6, 1.4, 2.1],
];

const HEAD_DIM = 64;

export const ILLUSTRATIVE_ATTENTION_WEIGHTS = ILLUSTRATIVE_ATTENTION_SCORES.map((row, queryIndex) => {
  const allowedScores = row.slice(0, queryIndex + 1).map((score) => score / Math.sqrt(HEAD_DIM));
  const maxScore = Math.max(...allowedScores);
  const exponentials = allowedScores.map((score) => Math.exp(score - maxScore));
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  const allowedWeights = exponentials.map((value) => value / total);
  return [...allowedWeights, ...Array(row.length - allowedWeights.length).fill(0)];
});
