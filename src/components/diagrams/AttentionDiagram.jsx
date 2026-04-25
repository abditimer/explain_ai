import { useCallback } from 'react';
import { scaleLinear } from 'd3';
import { useDiagramSetup } from './useDiagramSetup';

const W = 480, H = 340;
const TOKENS = ['The', 'cat', 'sat'];
const RAW_SCORES = [
  [3.2, -1e9, -1e9],
  [1.1, 2.8, -1e9],
  [0.6, 1.4, 2.1],
];
const SOFTMAX = [
  [1.0,  0.0,  0.0],
  [0.18, 0.82, 0.0],
  [0.12, 0.28, 0.60],
];
const CELL = 62;
const GRID_X = (W - TOKENS.length * CELL) / 2;
const GRID_Y = 80;

export function AttentionDiagram({ step = 0 }) {
  const initFn = useCallback((svg) => {
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', '100%');

    svg.append('text').attr('x', W / 2).attr('y', 28)
      .attr('text-anchor', 'middle').attr('fill', '#334155')
      .attr('font-size', 11).attr('font-family', 'Inter, sans-serif').attr('letter-spacing', '0.1em')
      .text('ATTENTION HEATMAP (CAUSAL MASK)');

    // Column headers (keys)
    TOKENS.forEach((t, j) => {
      svg.append('text').attr('x', GRID_X + j * CELL + CELL / 2).attr('y', 62)
        .attr('text-anchor', 'middle').attr('fill', '#475569')
        .attr('font-size', 13).attr('font-family', 'Inter, sans-serif').attr('font-weight', 500).text(t);
    });

    // Row labels (queries)
    TOKENS.forEach((t, i) => {
      svg.append('text')
        .attr('x', GRID_X - 12).attr('y', GRID_Y + i * CELL + CELL / 2 + 5)
        .attr('text-anchor', 'end').attr('fill', '#475569')
        .attr('font-size', 13).attr('font-family', 'Inter, sans-serif').attr('font-weight', 500).text(t);
    });

    // Cells
    TOKENS.forEach((_, i) => {
      TOKENS.forEach((_, j) => {
        svg.append('rect').attr('class', `cell-${i}-${j}`)
          .attr('x', GRID_X + j * CELL + 2).attr('y', GRID_Y + i * CELL + 2)
          .attr('width', CELL - 4).attr('height', CELL - 4).attr('rx', 5)
          .attr('fill', '#0f172a').attr('opacity', 0);
        svg.append('text').attr('class', `cell-txt-${i}-${j}`)
          .attr('x', GRID_X + j * CELL + CELL / 2).attr('y', GRID_Y + i * CELL + CELL / 2 + 6)
          .attr('text-anchor', 'middle').attr('fill', '#e8e8f0')
          .attr('font-size', 12).attr('font-family', 'JetBrains Mono, monospace')
          .attr('opacity', 0).text('');
      });
    });

    // Query highlight
    svg.append('rect').attr('class', 'query-row')
      .attr('x', GRID_X - 2).attr('y', GRID_Y + CELL + 2)
      .attr('width', TOKENS.length * CELL + 4).attr('height', CELL - 4)
      .attr('rx', 6).attr('fill', 'none').attr('stroke', '#fb923c')
      .attr('stroke-width', 1.5).attr('stroke-dasharray', '5,3').attr('opacity', 0);
    svg.append('text').attr('class', 'query-label')
      .attr('x', GRID_X + TOKENS.length * CELL + 14).attr('y', GRID_Y + CELL + CELL / 2 + 5)
      .attr('fill', '#fb923c').attr('font-size', 11).attr('font-family', 'Inter, sans-serif')
      .attr('opacity', 0).text('query: "cat"');

    svg.append('text').attr('class', 'softmax-label')
      .attr('x', W / 2).attr('y', 318)
      .attr('text-anchor', 'middle').attr('fill', '#1e293b')
      .attr('font-size', 11).attr('font-family', 'Inter, sans-serif')
      .attr('opacity', 0).text('softmax weights → weighted sum of values');
  }, []);

  const updateFn = useCallback((svg, s) => {
    const colorScale = scaleLinear().domain([0, 1]).range(['#0d1b2e', '#60a5fa']);

    svg.select('.query-row').transition().duration(400).attr('opacity', s >= 1 ? 1 : 0);
    svg.select('.query-label').transition().duration(400).attr('opacity', s >= 1 ? 1 : 0);

    if (s >= 2 && s < 3) {
      TOKENS.forEach((_, i) => TOKENS.forEach((_, j) => {
        const raw = RAW_SCORES[i][j];
        const masked = raw < -999;
        svg.select(`.cell-${i}-${j}`).transition().duration(300).delay((i + j) * 50)
          .attr('fill', masked ? '#060a10' : colorScale(Math.min(raw / 3.5, 1)))
          .attr('opacity', 1);
        svg.select(`.cell-txt-${i}-${j}`).transition().duration(300).delay((i + j) * 50)
          .attr('opacity', 1).text(masked ? '−∞' : raw.toFixed(1));
      }));
    }
    if (s >= 3) {
      TOKENS.forEach((_, i) => TOKENS.forEach((_, j) => {
        const w = SOFTMAX[i][j];
        svg.select(`.cell-${i}-${j}`).transition().duration(350).delay((i + j) * 50)
          .attr('fill', colorScale(w)).attr('opacity', 1);
        svg.select(`.cell-txt-${i}-${j}`).transition().duration(350).delay((i + j) * 50)
          .attr('opacity', 1).text(w === 0 ? '0' : w.toFixed(2));
      }));
      svg.select('.softmax-label').transition().duration(400).attr('opacity', 1);
    }
    if (s < 2) {
      TOKENS.forEach((_, i) => TOKENS.forEach((_, j) => {
        svg.select(`.cell-${i}-${j}`).transition().duration(300).attr('opacity', 0);
        svg.select(`.cell-txt-${i}-${j}`).transition().duration(300).attr('opacity', 0);
      }));
    }
    if (s < 3) {
      svg.select('.softmax-label').transition().duration(300).attr('opacity', 0);
    }
  }, []);

  const svgRef = useDiagramSetup({ initFn, updateFn, step });
  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
}
