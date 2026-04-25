import { useCallback } from 'react';

import { useDiagramSetup } from './useDiagramSetup';

const W = 480, H = 340;
const TOKENS = [42, 15496, 995, 0];
const COLORS = ['#60a5fa', '#a78bfa', '#f472b6', '#fb923c'];
const COL_W = W / TOKENS.length;

function seedBars(tok, phase) {
  return Array.from({ length: 7 }, (_, j) => {
    const h = 9 + Math.sin(tok * 0.3 + j + phase) * 7;
    return Math.max(3, h);
  });
}

export function EmbeddingsDiagram({ step = 0 }) {
  const initFn = useCallback((svg) => {
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', '100%');

    svg.append('text').attr('x', W / 2).attr('y', 24)
      .attr('text-anchor', 'middle').attr('fill', '#334155')
      .attr('font-size', 11).attr('font-family', 'Inter, sans-serif').attr('letter-spacing', '0.1em')
      .text('TOKEN + POSITION EMBEDDINGS');

    TOKENS.forEach((tok, i) => {
      const cx = COL_W * i + COL_W / 2;

      // Token ID
      const idG = svg.append('g').attr('class', `tok-id-${i}`).attr('opacity', 0);
      idG.append('rect').attr('x', cx - 30).attr('y', 36).attr('width', 60).attr('height', 28)
        .attr('rx', 5).attr('fill', '#0f172a').attr('stroke', COLORS[i]).attr('stroke-width', 1.5);
      idG.append('text').attr('x', cx).attr('y', 55)
        .attr('text-anchor', 'middle').attr('fill', COLORS[i])
        .attr('font-size', 13).attr('font-family', 'JetBrains Mono, monospace').attr('font-weight', 700)
        .text(tok);

      // Token embed bars
      const tokBars = seedBars(tok, 0);
      const tokG = svg.append('g').attr('class', `tok-em-${i}`).attr('opacity', 0);
      tokBars.forEach((h, j) => {
        tokG.append('rect')
          .attr('x', cx - 26 + j * 8).attr('y', 100 - h)
          .attr('width', 6).attr('height', h * 2)
          .attr('rx', 2).attr('fill', COLORS[i]).attr('opacity', 0.75);
      });
      tokG.append('text').attr('x', cx).attr('y', 128)
        .attr('text-anchor', 'middle').attr('fill', '#334155')
        .attr('font-size', 10).attr('font-family', 'Inter, sans-serif').text('tok emb');

      // Pos embed bars
      const posBars = seedBars(i, 2.5);
      const posG = svg.append('g').attr('class', `pos-em-${i}`).attr('opacity', 0);
      posG.append('text').attr('x', cx).attr('y', 162)
        .attr('text-anchor', 'middle').attr('fill', '#1e293b')
        .attr('font-size', 18).text('+');
      posBars.forEach((h, j) => {
        posG.append('rect')
          .attr('x', cx - 26 + j * 8).attr('y', 188 - h)
          .attr('width', 6).attr('height', h * 2)
          .attr('rx', 2).attr('fill', '#334155').attr('opacity', 0.6);
      });
      posG.append('text').attr('x', cx).attr('y', 216)
        .attr('text-anchor', 'middle').attr('fill', '#1e293b')
        .attr('font-size', 10).attr('font-family', 'Inter, sans-serif').text('pos emb');

      // Sum
      const sumBars = seedBars(tok + i, 1);
      const sumG = svg.append('g').attr('class', `sum-${i}`).attr('opacity', 0);
      sumG.append('text').attr('x', cx).attr('y', 248)
        .attr('text-anchor', 'middle').attr('fill', '#1e293b')
        .attr('font-size', 18).text('=');
      sumBars.forEach((h, j) => {
        sumG.append('rect')
          .attr('x', cx - 26 + j * 8).attr('y', 270 - h / 2)
          .attr('width', 6).attr('height', h * 1.6)
          .attr('rx', 2).attr('fill', COLORS[i]).attr('opacity', 0.95);
      });
      sumG.append('text').attr('x', cx).attr('y', 310)
        .attr('text-anchor', 'middle').attr('fill', COLORS[i])
        .attr('font-size', 9).attr('font-family', 'JetBrains Mono, monospace').text('768-dim');
    });
  }, []);

  const updateFn = useCallback((svg, s) => {
    TOKENS.forEach((_, i) => {
      svg.select(`.tok-id-${i}`).transition().duration(400).delay(i * 70).attr('opacity', s >= 1 ? 1 : 0);
      svg.select(`.tok-em-${i}`).transition().duration(400).delay(i * 70).attr('opacity', s >= 2 ? 1 : 0);
      svg.select(`.pos-em-${i}`).transition().duration(400).delay(i * 70).attr('opacity', s >= 3 ? 1 : 0);
      svg.select(`.sum-${i}`).transition().duration(400).delay(i * 70).attr('opacity', s >= 4 ? 1 : 0);
    });
  }, []);

  const svgRef = useDiagramSetup({ initFn, updateFn, step });
  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
}
