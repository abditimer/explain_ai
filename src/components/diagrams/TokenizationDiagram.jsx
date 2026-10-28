import { useCallback } from 'react';
import { useDiagramSetup } from './useDiagramSetup';
import tokenizerDemo from '../../../docs/code/tokenizer_demo.json';

const W = 480, H = 340;
const WORDS = tokenizerDemo.token_pieces.map((word, index) => ({ word, id: tokenizerDemo.token_ids[index] }));
const COLORS = ['#60a5fa', '#a78bfa', '#f472b6', '#fb923c', '#34d399'];

export function TokenizationDiagram({ step = 0 }) {
  const initFn = useCallback((svg) => {
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', '100%');

    svg.append('title').text(`Recorded GPT-2 tokenization of “${tokenizerDemo.input_text}”`);
    svg.append('desc').text('Each token piece is shown above its exact vocabulary ID. A visible space marker represents the leading space in pieces after the first.');
    svg.append('text').attr('x', W / 2).attr('y', 32)
      .attr('text-anchor', 'middle').attr('fill', '#cbd5e1')
      .attr('font-size', 12).attr('font-family', 'Manrope Variable, sans-serif').attr('letter-spacing', '0.1em')
      .text('THE STORY PREFIX · RECORDED GPT-2 TOKENIZATION');

    const itemWidth = 88;
    const totalW = WORDS.length * itemWidth;
    const startX = (W - totalW) / 2;

    WORDS.forEach((d, i) => {
      const x = startX + i * itemWidth;
      const cx = x + itemWidth / 2;
      const displayPiece = d.word.startsWith(' ') ? `␠${d.word.slice(1)}` : d.word;

      const wordG = svg.append('g').attr('class', `word-${i}`).attr('data-object-id', `tokens.pieces.${i + 1}`).attr('opacity', 0);
      wordG.append('rect').attr('x', x + 4).attr('y', 60).attr('width', 80).attr('height', 52)
        .attr('rx', 8).attr('fill', '#0f172a').attr('stroke', COLORS[i]).attr('stroke-width', 1.5);
      wordG.append('text').attr('x', cx).attr('y', 92)
        .attr('text-anchor', 'middle').attr('fill', COLORS[i])
        .attr('font-size', 15).attr('font-family', 'Manrope Variable, sans-serif').attr('font-weight', 700)
        .text(displayPiece);
      wordG.append('title').text(`Token piece ${JSON.stringify(d.word)}`);

      const connG = svg.append('g').attr('class', `conn-${i}`).attr('opacity', 0);
      connG.append('line')
        .attr('x1', cx).attr('y1', 114).attr('x2', cx).attr('y2', 145)
        .attr('stroke', '#1e293b').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3');
      connG.append('polygon')
        .attr('points', `${cx-5},143 ${cx+5},143 ${cx},151`)
        .attr('fill', '#1e293b');

      const idG = svg.append('g').attr('class', `id-${i}`).attr('data-object-id', `tokens.ids.${i + 1}`).attr('opacity', 0);
      idG.append('rect').attr('x', x + 8).attr('y', 154).attr('width', 72).attr('height', 44)
        .attr('rx', 6).attr('fill', '#060a10').attr('stroke', COLORS[i]).attr('stroke-width', 1).attr('stroke-opacity', 0.6);
      idG.append('text').attr('x', cx).attr('y', 185)
        .attr('text-anchor', 'middle').attr('fill', COLORS[i])
        .attr('font-size', 17).attr('font-family', 'JetBrains Mono, monospace').attr('font-weight', 700)
        .text(d.id);
    });

    svg.append('text').attr('class', 'footer').attr('x', W / 2).attr('y', 260)
      .attr('text-anchor', 'middle').attr('fill', '#cbd5e1')
      .attr('font-size', 12).attr('font-family', 'Manrope Variable, sans-serif').attr('opacity', 0)
      .text('Recorded output · IDs are vocabulary labels, not measurements of meaning.');
  }, []);

  const updateFn = useCallback((svg, s) => {
    WORDS.forEach((_, i) => {
      svg.select(`.word-${i}`).attr('opacity', Math.max(0, Math.min(1, s)));
      svg.select(`.conn-${i}`).attr('opacity', Math.max(0, Math.min(1, s - 1)));
      svg.select(`.id-${i}`).attr('opacity', Math.max(0, Math.min(1, s - 1)));
    });
    svg.select('.footer').attr('opacity', Math.max(0, Math.min(1, s - 2)));
  }, []);

  const svgRef = useDiagramSetup({ initFn, updateFn, step });
  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
}
