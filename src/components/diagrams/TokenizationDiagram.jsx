import { useCallback } from 'react';
import { select } from 'd3';
import { useDiagramSetup } from './useDiagramSetup';

const W = 480, H = 220;
const WORDS = [{ word: 'Hello', id: 15496 }, { word: 'world', id: 995 }, { word: '!', id: 0 }];

export function TokenizationDiagram({ step = 0 }) {
  const initFn = useCallback((svg) => {
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', '100%');

    svg.append('text').attr('x', W / 2).attr('y', 28)
      .attr('text-anchor', 'middle').attr('fill', '#94a3b8')
      .attr('font-size', 12).attr('font-family', 'Inter, sans-serif')
      .text('BPE Tokenization');

    const totalW = WORDS.length * 130;
    const startX = (W - totalW) / 2;

    WORDS.forEach((d, i) => {
      const x = startX + i * 130;
      const wordG = svg.append('g').attr('class', `word-${i}`).attr('opacity', 0);
      wordG.append('rect').attr('x', x).attr('y', 50).attr('width', 110).attr('height', 40)
        .attr('rx', 6).attr('fill', '#1e293b').attr('stroke', '#a78bfa').attr('stroke-width', 1.5);
      wordG.append('text').attr('x', x + 55).attr('y', 75)
        .attr('text-anchor', 'middle').attr('fill', '#a78bfa')
        .attr('font-size', 16).attr('font-family', 'Inter, sans-serif').attr('font-weight', 600)
        .text(d.word);

      const idG = svg.append('g').attr('class', `id-${i}`).attr('opacity', 0);
      idG.append('line').attr('x1', x + 55).attr('y1', 92).attr('x2', x + 55).attr('y2', 118)
        .attr('stroke', '#475569').attr('stroke-width', 1).attr('stroke-dasharray', '3,2');
      idG.append('rect').attr('x', x + 15).attr('y', 120).attr('width', 80).attr('height', 34)
        .attr('rx', 4).attr('fill', '#0f172a').attr('stroke', '#38bdf8').attr('stroke-width', 1);
      idG.append('text').attr('x', x + 55).attr('y', 142)
        .attr('text-anchor', 'middle').attr('fill', '#38bdf8')
        .attr('font-size', 13).attr('font-family', 'monospace').attr('font-weight', 700)
        .text(d.id);
    });

    svg.append('text').attr('class', 'arrow-label').attr('x', W / 2).attr('y', 195)
      .attr('text-anchor', 'middle').attr('fill', '#64748b')
      .attr('font-size', 11).attr('font-family', 'Inter, sans-serif').attr('opacity', 0)
      .text('integer token IDs fed to embedding layer');
  }, []);

  const updateFn = useCallback((svg, s) => {
    WORDS.forEach((_, i) => {
      svg.select(`.word-${i}`).transition().duration(400).delay(i * 100).attr('opacity', s >= 1 ? 1 : 0);
      svg.select(`.id-${i}`).transition().duration(400).delay(i * 120).attr('opacity', s >= 2 ? 1 : 0);
    });
    svg.select('.arrow-label').transition().duration(400).attr('opacity', s >= 2 ? 1 : 0);
  }, []);

  const svgRef = useDiagramSetup({ initFn, updateFn, step });
  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
}
