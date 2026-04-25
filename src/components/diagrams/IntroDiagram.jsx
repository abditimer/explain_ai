import { useCallback } from 'react';
import { select } from 'd3';
import { useDiagramSetup } from './useDiagramSetup';

const W = 480, H = 220;
const SENTENCE = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
const COLORS = ['#60a5fa','#a78bfa','#f472b6','#fb923c','#34d399','#818cf8'];

export function IntroDiagram({ step = 0 }) {
  const initFn = useCallback((svg) => {
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', '100%');

    svg.append('text')
      .attr('class', 'sentence-label')
      .attr('x', W / 2).attr('y', 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e8e8f0').attr('font-size', 18).attr('font-family', 'Inter, sans-serif')
      .text('The cat sat on the mat');

    const tokenG = svg.append('g').attr('class', 'tokens').attr('opacity', 0);
    SENTENCE.forEach((word, i) => {
      const x = 30 + i * 74;
      tokenG.append('rect').attr('x', x).attr('y', 70).attr('width', 64).attr('height', 36)
        .attr('rx', 6).attr('fill', COLORS[i]).attr('opacity', 0.25);
      tokenG.append('text').attr('x', x + 32).attr('y', 93)
        .attr('text-anchor', 'middle').attr('fill', COLORS[i])
        .attr('font-size', 13).attr('font-family', 'Inter, sans-serif').attr('font-weight', 600)
        .text(word);
    });

    const predG = svg.append('g').attr('class', 'predict').attr('opacity', 0);
    predG.append('text').attr('x', W / 2).attr('y', 148)
      .attr('text-anchor', 'middle').attr('fill', '#94a3b8').attr('font-size', 13).attr('font-family', 'Inter, sans-serif')
      .text('→ predict next token');
    predG.append('rect').attr('x', W / 2 - 46).attr('y', 158).attr('width', 92).attr('height', 36)
      .attr('rx', 6).attr('fill', '#1e293b').attr('stroke', '#60a5fa').attr('stroke-width', 1.5);
    predG.append('text').attr('x', W / 2).attr('y', 181)
      .attr('text-anchor', 'middle').attr('fill', '#60a5fa')
      .attr('font-size', 14).attr('font-family', 'monospace').attr('font-weight', 700)
      .text('"?"');
  }, []);

  const updateFn = useCallback((svg, s) => {
    svg.select('.tokens').transition().duration(500).attr('opacity', s >= 1 ? 1 : 0);
    svg.select('.predict').transition().duration(500).attr('opacity', s >= 2 ? 1 : 0);
  }, []);

  const svgRef = useDiagramSetup({ initFn, updateFn, step });
  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
}
