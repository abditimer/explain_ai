import { useCallback } from 'react';
import { select } from 'd3';
import { useDiagramSetup } from './useDiagramSetup';

const W = 480, H = 340;
const WORDS = [{ word: 'Hello', id: 15496 }, { word: 'world', id: 995 }, { word: '!', id: 0 }];
const COLORS = ['#60a5fa', '#a78bfa', '#f472b6'];

export function TokenizationDiagram({ step = 0 }) {
  const initFn = useCallback((svg) => {
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', '100%');

    svg.append('text').attr('x', W / 2).attr('y', 32)
      .attr('text-anchor', 'middle').attr('fill', '#334155')
      .attr('font-size', 12).attr('font-family', 'Inter, sans-serif').attr('letter-spacing', '0.1em')
      .text('BPE TOKENIZATION');

    const totalW = WORDS.length * 140;
    const startX = (W - totalW) / 2;

    WORDS.forEach((d, i) => {
      const x = startX + i * 140;
      const cx = x + 55;

      const wordG = svg.append('g').attr('class', `word-${i}`).attr('opacity', 0);
      wordG.append('rect').attr('x', x).attr('y', 60).attr('width', 110).attr('height', 52)
        .attr('rx', 8).attr('fill', '#0f172a').attr('stroke', COLORS[i]).attr('stroke-width', 1.5);
      wordG.append('text').attr('x', cx).attr('y', 92)
        .attr('text-anchor', 'middle').attr('fill', COLORS[i])
        .attr('font-size', 18).attr('font-family', 'Inter, sans-serif').attr('font-weight', 700)
        .text(d.word);

      const connG = svg.append('g').attr('class', `conn-${i}`).attr('opacity', 0);
      connG.append('line')
        .attr('x1', cx).attr('y1', 114).attr('x2', cx).attr('y2', 150)
        .attr('stroke', '#1e293b').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3');
      connG.append('polygon')
        .attr('points', `${cx-5},148 ${cx+5},148 ${cx},156`)
        .attr('fill', '#1e293b');

      const idG = svg.append('g').attr('class', `id-${i}`).attr('opacity', 0);
      idG.append('rect').attr('x', x + 10).attr('y', 158).attr('width', 90).attr('height', 44)
        .attr('rx', 6).attr('fill', '#060a10').attr('stroke', COLORS[i]).attr('stroke-width', 1).attr('stroke-opacity', 0.6);
      idG.append('text').attr('x', cx).attr('y', 185)
        .attr('text-anchor', 'middle').attr('fill', COLORS[i])
        .attr('font-size', 17).attr('font-family', 'JetBrains Mono, monospace').attr('font-weight', 700)
        .text(d.id);
    });

    svg.append('text').attr('class', 'footer').attr('x', W / 2).attr('y', 268)
      .attr('text-anchor', 'middle').attr('fill', '#1e293b')
      .attr('font-size', 12).attr('font-family', 'Inter, sans-serif').attr('opacity', 0)
      .text('integer token IDs → embedding lookup');
  }, []);

  const updateFn = useCallback((svg, s) => {
    WORDS.forEach((_, i) => {
      svg.select(`.word-${i}`).transition().duration(400).delay(i * 100).attr('opacity', s >= 1 ? 1 : 0);
      svg.select(`.conn-${i}`).transition().duration(300).delay(i * 100 + 150).attr('opacity', s >= 2 ? 1 : 0);
      svg.select(`.id-${i}`).transition().duration(400).delay(i * 100 + 200).attr('opacity', s >= 2 ? 1 : 0);
    });
    svg.select('.footer').transition().duration(400).delay(300).attr('opacity', s >= 3 ? 1 : 0);
  }, []);

  const svgRef = useDiagramSetup({ initFn, updateFn, step });
  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
}
