import { useCallback } from 'react';
import { select, scaleLinear } from 'd3';
import { useDiagramSetup } from './useDiagramSetup';

const W = 480, H = 220;
const TOKENS = ['The', 'cat', 'sat'];
const RAW_SCORES = [
  [3.2, -1e9, -1e9],
  [1.1, 2.8, -1e9],
  [0.6, 1.4, 2.1],
];
const SOFTMAX_WEIGHTS = [
  [1.0, 0.0, 0.0],
  [0.18, 0.82, 0.0],
  [0.12, 0.28, 0.60],
];
const CELL = 44;
const GRID_X = (W - TOKENS.length * CELL) / 2;
const GRID_Y = 55;

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

export function AttentionDiagram({ step = 0 }) {
  const initFn = useCallback((svg) => {
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', '100%');

    svg.append('text').attr('x', W / 2).attr('y', 22)
      .attr('text-anchor', 'middle').attr('fill', '#94a3b8')
      .attr('font-size', 12).attr('font-family', 'Inter, sans-serif')
      .text('Attention heatmap (causal mask)');

    // Column headers (key tokens)
    TOKENS.forEach((t, j) => {
      svg.append('text').attr('x', GRID_X + j * CELL + CELL / 2).attr('y', 48)
        .attr('text-anchor', 'middle').attr('fill', '#64748b')
        .attr('font-size', 11).attr('font-family', 'Inter, sans-serif').text(t);
    });

    // Row labels (query tokens)
    TOKENS.forEach((t, i) => {
      svg.append('text').attr('x', GRID_X - 8).attr('y', GRID_Y + i * CELL + CELL / 2 + 4)
        .attr('text-anchor', 'end').attr('fill', '#64748b')
        .attr('font-size', 11).attr('font-family', 'Inter, sans-serif').text(t);
    });

    // Grid cells — blank initially
    TOKENS.forEach((_, i) => {
      TOKENS.forEach((_, j) => {
        svg.append('rect').attr('class', `cell-${i}-${j}`)
          .attr('x', GRID_X + j * CELL + 1).attr('y', GRID_Y + i * CELL + 1)
          .attr('width', CELL - 2).attr('height', CELL - 2).attr('rx', 3)
          .attr('fill', '#1e293b').attr('opacity', 0);

        svg.append('text').attr('class', `cell-txt-${i}-${j}`)
          .attr('x', GRID_X + j * CELL + CELL / 2)
          .attr('y', GRID_Y + i * CELL + CELL / 2 + 5)
          .attr('text-anchor', 'middle').attr('fill', '#e8e8f0')
          .attr('font-size', 10).attr('font-family', 'monospace').attr('opacity', 0)
          .text('');
      });
    });

    // Query row highlight
    svg.append('rect').attr('class', 'query-row')
      .attr('x', GRID_X - 2).attr('y', GRID_Y + CELL + 1)
      .attr('width', TOKENS.length * CELL + 4).attr('height', CELL - 2)
      .attr('rx', 4).attr('fill', 'none').attr('stroke', '#fb923c')
      .attr('stroke-width', 1.5).attr('stroke-dasharray', '4,2').attr('opacity', 0);

    svg.append('text').attr('class', 'query-label').attr('x', W - 16).attr('y', GRID_Y + CELL + CELL / 2 + 5)
      .attr('text-anchor', 'end').attr('fill', '#fb923c')
      .attr('font-size', 10).attr('font-family', 'Inter, sans-serif').attr('opacity', 0)
      .text('query: "cat"');
  }, []);

  const updateFn = useCallback((svg, s) => {
    const colorScale = scaleLinear().domain([0, 1]).range(['#1e293b', '#60a5fa']);

    // Step 1: show query row highlight
    svg.select('.query-row').transition().duration(400).attr('opacity', s >= 1 ? 1 : 0);
    svg.select('.query-label').transition().duration(400).attr('opacity', s >= 1 ? 1 : 0);

    // Step 2: raw QK^T scores
    if (s >= 2 && s < 3) {
      TOKENS.forEach((_, i) => {
        TOKENS.forEach((_, j) => {
          const raw = RAW_SCORES[i][j];
          const isMasked = raw < -999;
          const alpha = isMasked ? 0 : clamp(raw / 3.5, 0.1, 0.9);
          svg.select(`.cell-${i}-${j}`).transition().duration(350).delay((i + j) * 40)
            .attr('fill', isMasked ? '#0f172a' : colorScale(alpha)).attr('opacity', 1);
          svg.select(`.cell-txt-${i}-${j}`).transition().duration(350).delay((i + j) * 40)
            .attr('opacity', 1).text(isMasked ? '−∞' : raw.toFixed(1));
        });
      });
    }

    // Step 3: softmax weights
    if (s >= 3) {
      TOKENS.forEach((_, i) => {
        TOKENS.forEach((_, j) => {
          const w = SOFTMAX_WEIGHTS[i][j];
          svg.select(`.cell-${i}-${j}`).transition().duration(350).delay((i + j) * 40)
            .attr('fill', colorScale(w)).attr('opacity', 1);
          svg.select(`.cell-txt-${i}-${j}`).transition().duration(350).delay((i + j) * 40)
            .attr('opacity', 1).text(w === 0 ? '0' : w.toFixed(2));
        });
      });
    }

    // Reset cells on step 0
    if (s < 2) {
      TOKENS.forEach((_, i) => {
        TOKENS.forEach((_, j) => {
          svg.select(`.cell-${i}-${j}`).transition().duration(300).attr('opacity', 0);
          svg.select(`.cell-txt-${i}-${j}`).transition().duration(300).attr('opacity', 0);
        });
      });
    }
  }, []);

  const svgRef = useDiagramSetup({ initFn, updateFn, step });
  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
}
