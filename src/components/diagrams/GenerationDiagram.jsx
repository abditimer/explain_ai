import { useCallback } from 'react';
import { useDiagramSetup } from './useDiagramSetup';
import { DISPLAY_CANDIDATES, getCandidateProbabilities } from '../../data/generationDemo';
import tokenizerDemo from '../../../docs/code/tokenizer_demo.json';

const W = 480;
const H = 360;
const CONTEXT = tokenizerDemo.token_pieces;
const CANDIDATE_COLORS = ['#75c7bd', '#e9b77d', '#b7a8e5', '#8bb8e8', '#dd9ab2'];

export function GenerationDiagram({
  step = 0,
  temperature = 1,
  selectedContinuationTokenId = null,
  checkpointLogits = null,
  checkpointError = '',
}) {
  const initFn = useCallback((svg) => {
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', '100%');

    svg.append('text').attr('x', W / 2).attr('y', 25)
      .attr('text-anchor', 'middle').attr('fill', '#cbd5e1')
      .attr('font-size', 11).attr('font-family', 'Manrope Variable, sans-serif').attr('letter-spacing', '0.1em')
      .text('NEXT TOKEN · PRETRAINED GPT-2 SMALL');

    const ctxG = svg.append('g').attr('class', 'gen-ctx').attr('data-object-id', 'generation.context').attr('opacity', 0);
    const tokenW = 50;
    const tokenGap = 6;
    const tokenH = 36;
    const rowY = 49;
    CONTEXT.forEach((piece, index) => {
      const x = 16 + index * (tokenW + tokenGap);
      const displayPiece = piece.startsWith(' ') ? `␠${piece.slice(1)}` : piece;
      ctxG.append('rect').attr('data-object-id', `generation.context.token.${index + 1}`)
        .attr('x', x).attr('y', rowY).attr('width', tokenW).attr('height', tokenH)
        .attr('rx', 6).attr('fill', '#1e293b').attr('stroke', '#75c7bd').attr('stroke-width', 1.5);
      ctxG.append('text').attr('x', x + tokenW / 2).attr('y', rowY + 23)
        .attr('text-anchor', 'middle').attr('fill', '#75c7bd')
        .attr('font-size', 11).attr('font-family', 'Manrope Variable, sans-serif').attr('font-weight', 600)
        .text(displayPiece);
    });
    const contextWidth = CONTEXT.length * tokenW + (CONTEXT.length - 1) * tokenGap;
    ctxG.append('text').attr('x', 16 + contextWidth / 2).attr('y', rowY + tokenH + 16)
      .attr('text-anchor', 'middle').attr('fill', '#cbd5e1')
      .attr('font-size', 10).attr('font-family', 'Manrope Variable, sans-serif').text('five-token context');

    const modelG = svg.append('g').attr('class', 'gen-model').attr('data-object-id', 'generation.model').attr('opacity', 0);
    modelG.append('rect').attr('x', 322).attr('y', rowY - 5).attr('width', 142).attr('height', tokenH + 10)
      .attr('rx', 8).attr('fill', '#1e1b4b').attr('stroke', '#b7a8e5').attr('stroke-width', 1.5);
    modelG.append('text').attr('x', 393).attr('y', rowY + 15)
      .attr('text-anchor', 'middle').attr('fill', '#d2c9f0')
      .attr('font-size', 12).attr('font-family', 'Manrope Variable, sans-serif').attr('font-weight', 700)
      .text('GPT-2 Small');
    modelG.append('text').attr('x', 393).attr('y', rowY + 30)
      .attr('text-anchor', 'middle').attr('fill', '#a5b4fc')
      .attr('font-size', 9).attr('font-family', 'Manrope Variable, sans-serif').text('pinned checkpoint');

    const outputG = svg.append('g').attr('class', 'gen-logits').attr('data-object-id', 'generation.candidates').attr('opacity', 0);
    outputG.append('text').attr('data-object-id', 'generation.logits').attr('x', 24).attr('y', 143)
      .attr('fill', '#f4f1e8').attr('font-size', 11).attr('font-family', 'Manrope Variable, sans-serif')
      .text('Top five next-token scores from the checkpoint');
    outputG.append('text').attr('class', 'generation-source-note').attr('x', 24).attr('y', 159)
      .attr('fill', '#aebbb5').attr('font-size', 9).attr('font-family', 'Manrope Variable, sans-serif')
      .text('Softmax probability uses all 50,257 logits · waiting for recorded output…');
    outputG.append('text').attr('x', 24).attr('y', 176).attr('fill', '#aebbb5')
      .attr('font-size', 7).attr('font-family', 'Manrope Variable, sans-serif').text('TOKEN');
    outputG.append('text').attr('x', 237).attr('y', 176).attr('text-anchor', 'middle').attr('fill', '#aebbb5')
      .attr('font-size', 7).attr('font-family', 'Manrope Variable, sans-serif').text('RELATIVE BAR');
    outputG.append('text').attr('x', 360).attr('y', 176).attr('fill', '#aebbb5')
      .attr('font-size', 7).attr('font-family', 'Manrope Variable, sans-serif').text('P(T)');
    outputG.append('text').attr('x', 415).attr('y', 176).attr('text-anchor', 'middle').attr('fill', '#aebbb5')
      .attr('font-size', 7).attr('font-family', 'Manrope Variable, sans-serif').text('LOGIT');
    outputG.append('text').attr('x', 464).attr('y', 176).attr('text-anchor', 'end').attr('fill', '#aebbb5')
      .attr('font-size', 7).attr('font-family', 'Manrope Variable, sans-serif').text('ID');

    DISPLAY_CANDIDATES.forEach((candidate, index) => {
      const y = 185 + index * 25;
      const color = CANDIDATE_COLORS[index];
      const row = outputG.append('g').attr('class', `generation-candidate candidate-${index}`)
        .attr('data-token-id', candidate.token_id);
      row.append('text').attr('class', 'candidate-piece').attr('x', 24).attr('y', y + 12)
        .attr('fill', color).attr('font-size', 12).attr('font-family', 'Manrope Variable, sans-serif').attr('font-weight', 650)
        .text(candidate.display_piece);
      row.append('rect').attr('x', 122).attr('y', y).attr('width', 230).attr('height', 15)
        .attr('rx', 5).attr('fill', '#26342f');
      row.append('rect').attr('class', 'candidate-bar').attr('data-object-id', `generation.probability.${index + 1}`)
        .attr('x', 122).attr('y', y).attr('width', 0).attr('height', 15)
        .attr('rx', 5).attr('fill', color);
      row.append('text').attr('class', 'candidate-probability').attr('x', 360).attr('y', y + 12)
        .attr('text-anchor', 'start').attr('fill', '#e5e9e5')
        .attr('font-size', 10).attr('font-family', 'Manrope Variable, sans-serif').text('—');
      row.append('text').attr('class', 'candidate-logit').attr('x', 415).attr('y', y + 12)
        .attr('text-anchor', 'middle').attr('fill', '#cbd5e1')
        .attr('font-size', 8).attr('font-family', 'Manrope Variable, sans-serif').text(candidate.logit.toFixed(2));
      row.append('text').attr('class', 'candidate-id').attr('x', 464).attr('y', y + 12)
        .attr('text-anchor', 'end').attr('fill', '#aebbb5')
        .attr('font-size', 8).attr('font-family', 'Manrope Variable, sans-serif').text(String(candidate.token_id));
    });
    outputG.append('text').attr('class', 'generation-bar-note').attr('x', 24).attr('y', 322)
      .attr('fill', '#aebbb5').attr('font-size', 8).attr('font-family', 'Manrope Variable, sans-serif')
      .text('Bar length is relative to the most likely token; labels show full-vocabulary probability.');

    const appendG = svg.append('g').attr('class', 'gen-append').attr('data-object-id', 'generation.appended-token').attr('opacity', 0);
    appendG.append('text').attr('x', W - 20).attr('y', 80)
      .attr('text-anchor', 'end').attr('fill', '#cbd5e1')
      .attr('font-size', 10).attr('font-family', 'Manrope Variable, sans-serif').text('reader-selected token');
    appendG.append('rect').attr('x', W - 84).attr('y', 88).attr('width', 64).attr('height', 34)
      .attr('rx', 6).attr('fill', '#1e293b').attr('stroke', '#75c7bd').attr('stroke-width', 2);
    appendG.append('text').attr('x', W - 52).attr('y', 110)
      .attr('text-anchor', 'middle').attr('fill', '#75c7bd')
      .attr('class', 'append-token-label')
      .attr('font-size', 13).attr('font-family', 'Manrope Variable, sans-serif').attr('font-weight', 700).text('—');
    appendG.append('text').attr('class', 'append-token-id').attr('x', W - 52).attr('y', 137)
      .attr('text-anchor', 'middle').attr('fill', '#cbd5e1')
      .attr('font-size', 8).attr('font-family', 'Manrope Variable, sans-serif').text('');

    svg.append('text').attr('class', 'updated-context').attr('x', 24).attr('y', 346)
      .attr('text-anchor', 'start').attr('fill', '#75c7bd')
      .attr('font-size', 10).attr('font-family', 'Manrope Variable, sans-serif').attr('opacity', 0).text('');
  }, []);

  const updateFn = useCallback((svg, progress) => {
    svg.select('.gen-ctx').attr('opacity', Math.max(0, Math.min(1, progress)));
    svg.select('.gen-model').attr('opacity', Math.max(0, Math.min(1, progress)));
    svg.select('.gen-logits').attr('opacity', Math.max(0, Math.min(1, progress - 1)));
    const appendProgress = Math.max(0, Math.min(1, progress - 3));
    svg.select('.gen-append').attr('opacity', appendProgress);

    const probabilities = getCandidateProbabilities(checkpointLogits, temperature);
    const maximum = probabilities?.[0]?.probability ?? 1;
    const selectedCandidate = DISPLAY_CANDIDATES.find((candidate) => candidate.token_id === selectedContinuationTokenId);
    svg.select('.append-token-label').text(selectedCandidate ? selectedCandidate.display_piece : '—');
    svg.select('.append-token-id').text(selectedCandidate ? `token ID ${selectedCandidate.token_id}` : '');
    svg.select('.updated-context')
      .attr('opacity', selectedCandidate ? appendProgress : 0)
      .text(selectedCandidate ? `Updated context: ${tokenizerDemo.input_text}${selectedCandidate.piece}` : '');
    svg.select('.generation-source-note').text(checkpointError
      ? 'Recorded checkpoint output could not be loaded.'
      : checkpointLogits
        ? `Full-vocabulary softmax · temperature ${temperature.toFixed(1)} · pinned GPT-2 Small checkpoint`
        : 'Probabilities use all 50,257 model logits · loading recorded output…');

    probabilities?.forEach((candidate, index) => {
      const relativeWidth = maximum > 0 ? 230 * candidate.probability / maximum : 0;
      svg.select(`.candidate-${index} .candidate-bar`).attr('width', relativeWidth);
      svg.select(`.candidate-${index} .candidate-probability`).text(`${(candidate.probability * 100).toFixed(2)}%`);
    });
  }, [checkpointError, checkpointLogits, selectedContinuationTokenId, temperature]);

  const svgRef = useDiagramSetup({ initFn, updateFn, step });
  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
}
