// Fixed illustrative inputs for the generation temperature demonstration.
export const TOY_LOGITS = [2, 1, 0];

export function getToyProbabilities(temperature) {
  const scaled = TOY_LOGITS.map((score) => score / temperature);
  const maxScore = Math.max(...scaled);
  const exponentials = scaled.map((score) => Math.exp(score - maxScore));
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map((value) => value / total);
}
