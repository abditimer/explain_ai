import { useCallback } from 'react';
import { select } from 'd3';
import { useDiagramSetup } from './useDiagramSetup';

const W = 480, H = 340;
const SENTENCE = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
const COLORS = ['#60a5fa','#a78bfa','#f472b6','#fb923c','#34d399','#818cf8'];

export function IntroDiagram({ step = 0 }) {
  const initFn = useCallback((svg) => {
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', '100%');

    svg.append('text')
      .attr('class', 'sentence-label')
      .attr('x', W / 2).attr('y', 58)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e8e8f0').attr('font-size', 20).attr('font-family', 'Inter, sans-serif').attr('font-weight', 500)
      .text('The cat sat on the mat');

    const tokenG = svg.append('g').attr('class', 'tokens').attr('opacity', 0);
    SENTENCE.forEach((word, i) => {
      const x = 16 + i * 75;
      tokenG.append('rect').attr('x', x).attr('y', 90).attr('width', 65).attr('height', 42)
        .attr('rx', 7).attr('fill', COLORS[i]).attr('opacity', 0.22);
      tokenG.append('text').attr('x', x + 32).attr('y', 116)
        .attr('text-anchor', 'middle').attr('fill', COLORS[i])
        .attr('font-size', 14).attr('font-family', 'Inter, sans-serif').attr('font-weight', 700)
        .text(word);
    });

    svg.append('text').attr('class', 'arrow-line')
      .attr('x', W / 2).attr('y', 175)
      .attr('text-anchor', 'middle').attr('fill', '#334155')
      .attr('font-size', 13).attr('font-family', 'Inter, sans-serif').attr('opacity', 0)
      .text('↓  next token prediction');

    const predG = svg.append('g').attr('class', 'predict').attr('opacity', 0);
    predG.append('rect').attr('x', W / 2 - 60).attr('y', 192).attr('width', 120).attr('height', 50)
      .attr('rx', 8).attr('fill', '#0f172a').attr('stroke', '#60a5fa').attr('stroke-width', 1.5);
    predG.append('text').attr('x', W / 2).attr('y', 223)
      .attr('text-anchor', 'middle').attr('fill', '#60a5fa')
      .attr('font-size', 20).attr('font-family', 'monospace').attr('font-weight', 700)
      .text('"?"');

    svg.append('text').attr('class', 'sub-label')
      .attr('x', W / 2).attr('y', 285)
      .attr('text-anchor', 'middle').attr('fill', '#1e293b')
      .attr('font-size', 11).attr('font-family', 'Inter, sans-serif').attr('opacity', 0)
      .text('autoregressive — one token at a time');
  }, []);

  const updateFn = useCallback((svg, s) => {
    svg.select('.tokens').transition().duration(500).attr('opacity', s >= 1 ? 1 : 0);
    svg.select('.arrow-line').transition().duration(400).delay(100).attr('opacity', s >= 2 ? 1 : 0);
    svg.select('.predict').transition().duration(500).delay(200).attr('opacity', s >= 2 ? 1 : 0);
    svg.select('.sub-label').transition().duration(400).delay(300).attr('opacity', s >= 3 ? 1 : 0);
  }, []);

  const svgRef = useDiagramSetup({ initFn, updateFn, step });
  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
}
