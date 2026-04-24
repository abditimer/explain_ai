import { useCallback } from 'react';
import { select } from 'd3';
import { useDiagramSetup } from './useDiagramSetup';

const W = 480, H = 220;
const TOKENS = [42, 15496, 995, 0];
const COLORS = ['#60a5fa', '#a78bfa', '#f472b6', '#fb923c'];

export function EmbeddingsDiagram({ step = 0 }) {
  const initFn = useCallback((svg) => {
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', '100%');

    const colW = W / TOKENS.length;
    TOKENS.forEach((tok, i) => {
      const cx = colW * i + colW / 2;

      // Token ID badge
      const idG = svg.append('g').attr('class', `tok-id-${i}`).attr('opacity', 0);
      idG.append('rect').attr('x', cx - 28).attr('y', 16).attr('width', 56).attr('height', 26)
        .attr('rx', 4).attr('fill', '#1e293b').attr('stroke', COLORS[i]).attr('stroke-width', 1.5);
      idG.append('text').attr('x', cx).attr('y', 33)
        .attr('text-anchor', 'middle').attr('fill', COLORS[i])
        .attr('font-size', 12).attr('font-family', 'monospace').attr('font-weight', 700)
        .text(tok);

      // Token embedding mini-bar
      const tokEmG = svg.append('g').attr('class', `tok-em-${i}`).attr('opacity', 0);
      for (let j = 0; j < 6; j++) {
        const h = 8 + Math.sin(tok * 0.3 + j) * 6;
        tokEmG.append('rect').attr('x', cx - 24 + j * 8).attr('y', 65 - h).attr('width', 6).attr('height', h * 2)
          .attr('rx', 2).attr('fill', COLORS[i]).attr('opacity', 0.7);
      }
      tokEmG.append('text').attr('x', cx).attr('y', 98)
        .attr('text-anchor', 'middle').attr('fill', '#64748b')
        .attr('font-size', 9).attr('font-family', 'Inter, sans-serif').text('tok emb');

      // Position embedding mini-bar
      const posEmG = svg.append('g').attr('class', `pos-em-${i}`).attr('opacity', 0);
      for (let j = 0; j < 6; j++) {
        const h = 8 + Math.cos(i * 0.8 + j * 0.5) * 6;
        posEmG.append('rect').attr('x', cx - 24 + j * 8).attr('y', 120 - h).attr('width', 6).attr('height', h * 2)
          .attr('rx', 2).attr('fill', '#94a3b8').attr('opacity', 0.5);
      }
      posEmG.append('text').attr('x', cx).attr('y', 153)
        .attr('text-anchor', 'middle').attr('fill', '#475569')
        .attr('font-size', 9).attr('font-family', 'Inter, sans-serif').text('pos emb');

      // Sum arrow + result
      const sumG = svg.append('g').attr('class', `sum-${i}`).attr('opacity', 0);
      sumG.append('text').attr('x', cx).attr('y', 175)
        .attr('text-anchor', 'middle').attr('fill', '#94a3b8').attr('font-size', 14).text('+');
      for (let j = 0; j < 6; j++) {
        sumG.append('rect').attr('x', cx - 24 + j * 8).attr('y', 188).attr('width', 6).attr('height', 16)
          .attr('rx', 2).attr('fill', COLORS[i]).attr('opacity', 0.9);
      }
    });
  }, []);

  const updateFn = useCallback((svg, s) => {
    TOKENS.forEach((_, i) => {
      svg.select(`.tok-id-${i}`).transition().duration(400).delay(i * 80).attr('opacity', s >= 1 ? 1 : 0);
      svg.select(`.tok-em-${i}`).transition().duration(400).delay(i * 80).attr('opacity', s >= 2 ? 1 : 0);
      svg.select(`.pos-em-${i}`).transition().duration(400).delay(i * 80).attr('opacity', s >= 3 ? 1 : 0);
      svg.select(`.sum-${i}`).transition().duration(400).delay(i * 80).attr('opacity', s >= 4 ? 1 : 0);
    });
  }, []);

  const svgRef = useDiagramSetup({ initFn, updateFn, step });
  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
}
