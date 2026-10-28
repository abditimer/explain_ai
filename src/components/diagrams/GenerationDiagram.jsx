import { useCallback } from 'react';
import { useDiagramSetup } from './useDiagramSetup';
import { EXAMPLE_CANDIDATES, getToyProbabilities } from '../../data/generationDemo';
import tokenizerDemo from '../../../docs/code/tokenizer_demo.json';

const W = 480, H = 340;
const CONTEXT = tokenizerDemo.token_pieces;
export function GenerationDiagram({ step = 0, temperature = 1, selectedContinuationTokenId = null }) {
  const initFn = useCallback((svg) => {
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', '100%');

    svg.append('text').attr('x', W / 2).attr('y', 28)
      .attr('text-anchor', 'middle').attr('fill', '#cbd5e1')
      .attr('font-size', 11).attr('font-family', 'Manrope Variable, sans-serif').attr('letter-spacing', '0.1em')
      .text('AUTOREGRESSIVE GENERATION');

    // Context tokens row
    const ctxG = svg.append('g').attr('class', 'gen-ctx').attr('data-object-id', 'generation.context').attr('opacity', 0);
    const tokenW = 50, tokenGap = 6, tokenH = 38, rowY = 60;
    CONTEXT.forEach((t, i) => {
      const x = 16 + i * (tokenW + tokenGap);
      const visiblePiece = t.startsWith(' ') ? `␠${t.slice(1)}` : t;
      ctxG.append('rect').attr('data-object-id', `generation.context.token.${i + 1}`)
        .attr('x', x).attr('y', rowY).attr('width', tokenW).attr('height', tokenH)
        .attr('rx', 6).attr('fill', '#1e293b').attr('stroke', '#60a5fa').attr('stroke-width', 1.5);
      ctxG.append('text').attr('x', x + tokenW / 2).attr('y', rowY + 24)
        .attr('text-anchor', 'middle').attr('fill', '#60a5fa')
        .attr('font-size', 11).attr('font-family', 'Manrope Variable, sans-serif').attr('font-weight', 600)
        .text(visiblePiece);
    });
    const contextWidth = CONTEXT.length * tokenW + (CONTEXT.length - 1) * tokenGap;
    ctxG.append('text').attr('x', 16 + contextWidth / 2).attr('y', rowY + tokenH + 18)
      .attr('text-anchor', 'middle').attr('fill', '#cbd5e1')
      .attr('font-size', 11).attr('font-family', 'Manrope Variable, sans-serif').text('context window');

    // Model box
    const modelG = svg.append('g').attr('class', 'gen-model').attr('data-object-id', 'generation.model').attr('opacity', 0);
    const modelX = 322;
    modelG.append('rect').attr('x', modelX).attr('y', rowY - 8).attr('width', 120).attr('height', tokenH + 16)
      .attr('rx', 8).attr('fill', '#1e1b4b').attr('stroke', '#818cf8').attr('stroke-width', 1.5);
    modelG.append('text').attr('x', modelX + 60).attr('y', rowY + 14)
      .attr('text-anchor', 'middle').attr('fill', '#818cf8')
      .attr('font-size', 12).attr('font-family', 'Manrope Variable, sans-serif').attr('font-weight', 700)
      .text('GPT-2 style');
    modelG.append('text').attr('x', modelX + 60).attr('y', rowY + 30)
      .attr('text-anchor', 'middle').attr('fill', '#a5b4fc')
      .attr('font-size', 10).attr('font-family', 'Manrope Variable, sans-serif').text('12 blocks');

    // Toy values demonstrate temperature; they are not model output.
    const barG = svg.append('g').attr('class', 'gen-logits').attr('data-object-id', 'generation.candidates').attr('opacity', 0);
    barG.append('text').attr('data-object-id', 'generation.logits').attr('x', 24).attr('y', 158)
      .attr('fill', '#cbd5e1').attr('font-size', 11).attr('font-family', 'Manrope Variable, sans-serif')
      .text('Three-example toy logits [2, 1, 0] → softmax:');
    barG.append('text').attr('x', 24).attr('y', 173)
      .attr('fill', '#94a3b8').attr('font-size', 9).attr('font-family', 'Manrope Variable, sans-serif')
      .text('Illustrative only · not the model’s full 50,257-token output');
    EXAMPLE_CANDIDATES.forEach((candidate, i) => {
      const x = 24 + i * 142;
      barG.append('rect').attr('class', `probability-track-${i}`).attr('x', x).attr('y', 190).attr('width', 122).attr('height', 18)
        .attr('rx', 5).attr('fill', '#1e293b');
      barG.append('rect').attr('class', `probability-bar-${i}`).attr('data-object-id', `generation.probability.${i + 1}`)
        .attr('x', x).attr('y', 190).attr('width', 0).attr('height', 18)
        .attr('rx', 5).attr('fill', ['#60a5fa', '#a78bfa', '#f472b6'][i]);
      barG.append('text').attr('x', x).attr('y', 226)
        .attr('text-anchor', 'start').attr('fill', ['#60a5fa', '#a78bfa', '#f472b6'][i])
        .attr('font-size', 14).attr('font-family', 'JetBrains Mono, monospace').text(candidate.text);
      barG.append('text').attr('class', `probability-label-${i}`).attr('x', x + 122).attr('y', 226)
        .attr('text-anchor', 'end').attr('fill', '#cbd5e1')
        .attr('font-size', 12).attr('font-family', 'JetBrains Mono, monospace').text('');
      barG.append('text').attr('x', x).attr('y', 245)
        .attr('text-anchor', 'start').attr('fill', '#94a3b8')
        .attr('font-size', 9).attr('font-family', 'JetBrains Mono, monospace')
        .text(`token ID ${candidate.tokenId}`);
    });

    // Append result
    const appendG = svg.append('g').attr('class', 'gen-append').attr('data-object-id', 'generation.appended-token').attr('opacity', 0);
    appendG.append('text').attr('x', W - 24).attr('y', 82)
      .attr('text-anchor', 'end').attr('fill', '#cbd5e1')
      .attr('font-size', 11).attr('font-family', 'Manrope Variable, sans-serif').text('example token:');
    appendG.append('rect').attr('x', W - 78).attr('y', 92).attr('width', 66).attr('height', 38)
      .attr('rx', 6).attr('fill', '#1e293b').attr('stroke', '#34d399').attr('stroke-width', 2);
    appendG.append('text').attr('x', W - 45).attr('y', 117)
      .attr('text-anchor', 'middle').attr('fill', '#34d399')
      .attr('class', 'append-token-label')
      .attr('font-size', 15).attr('font-family', 'Manrope Variable, sans-serif').attr('font-weight', 700)
      .text('—');
    appendG.append('text').attr('class', 'append-token-id').attr('x', W - 45).attr('y', 145)
      .attr('text-anchor', 'middle').attr('fill', '#cbd5e1')
      .attr('font-size', 9).attr('font-family', 'JetBrains Mono, monospace').text('');

    svg.append('text').attr('class', 'updated-context').attr('x', 24).attr('y', 282)
      .attr('text-anchor', 'start').attr('fill', '#34d399')
      .attr('font-size', 12).attr('font-family', 'Manrope Variable, sans-serif').attr('opacity', 0).text('');

    svg.append('text').attr('class', 'gen-loop').attr('x', W / 2).attr('y', 316)
      .attr('text-anchor', 'middle').attr('fill', '#cbd5e1')
      .attr('font-size', 11).attr('font-family', 'Manrope Variable, sans-serif').attr('opacity', 0)
      .text('Your choice is appended to the exact token prefix; it is not a model prediction.');
  }, []);

  const updateFn = useCallback((svg, s) => {
    svg.select('.gen-ctx').attr('opacity', Math.max(0, Math.min(1, s)));
    svg.select('.gen-model').attr('opacity', Math.max(0, Math.min(1, s)));
    svg.select('.gen-logits').attr('opacity', Math.max(0, Math.min(1, s - 1)));
    const appendProgress = Math.max(0, Math.min(1, s - 3));
    svg.select('.gen-append').attr('opacity', appendProgress);
    svg.select('.gen-loop').attr('opacity', appendProgress);
    const selectedCandidate = EXAMPLE_CANDIDATES.find((candidate) => candidate.tokenId === selectedContinuationTokenId);
    svg.select('.append-token-label').text(selectedCandidate ? JSON.stringify(selectedCandidate.text) : '—');
    svg.select('.append-token-id').text(selectedCandidate ? `token ID ${selectedCandidate.tokenId}` : '');
    svg.select('.updated-context')
      .attr('opacity', selectedCandidate ? appendProgress : 0)
      .text(selectedCandidate ? `Updated context: ${tokenizerDemo.input_text}${selectedCandidate.text}` : '');
    const probabilities = getToyProbabilities(temperature);
    probabilities.forEach((probability, index) => {
      svg.select(`.probability-bar-${index}`).attr('width', 122 * probability);
      svg.select(`.probability-label-${index}`).text(`${(probability * 100).toFixed(1)}%`);
    });
  }, [selectedContinuationTokenId, temperature]);

  const svgRef = useDiagramSetup({ initFn, updateFn, step });
  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
}
