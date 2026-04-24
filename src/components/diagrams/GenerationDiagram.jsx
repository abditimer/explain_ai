import { useCallback } from 'react';
import { select, scaleLinear, max } from 'd3';
import { useDiagramSetup } from './useDiagramSetup';

const W = 480, H = 220;
const CONTEXT = ['The', 'cat', 'sat'];
const LOGITS = [{ token: 'on', val: 0.72 }, { token: 'down', val: 0.45 }, { token: 'there', val: 0.31 }, { token: 'up', val: 0.18 }];

export function GenerationDiagram({ step = 0 }) {
  const initFn = useCallback((svg) => {
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', '100%');

    // Context tokens
    const ctxG = svg.append('g').attr('class', 'gen-ctx').attr('opacity', 0);
    CONTEXT.forEach((t, i) => {
      ctxG.append('rect').attr('x', 16 + i * 52).attr('y', 80).attr('width', 44).attr('height', 30)
        .attr('rx', 4).attr('fill', '#1e293b').attr('stroke', '#60a5fa').attr('stroke-width', 1);
      ctxG.append('text').attr('x', 38 + i * 52).attr('y', 99)
        .attr('text-anchor', 'middle').attr('fill', '#60a5fa')
        .attr('font-size', 12).attr('font-family', 'Inter, sans-serif').attr('font-weight', 600)
        .text(t);
    });

    // Model box
    const modelG = svg.append('g').attr('class', 'gen-model').attr('opacity', 0);
    modelG.append('rect').attr('x', 178).attr('y', 68).attr('width', 72).attr('height', 54)
      .attr('rx', 6).attr('fill', '#1e1b4b').attr('stroke', '#818cf8').attr('stroke-width', 1.5);
    modelG.append('text').attr('x', 214).attr('y', 91)
      .attr('text-anchor', 'middle').attr('fill', '#818cf8')
      .attr('font-size', 11).attr('font-family', 'Inter, sans-serif').attr('font-weight', 700)
      .text('GPT');
    modelG.append('text').attr('x', 214).attr('y', 107)
      .attr('text-anchor', 'middle').attr('fill', '#6366f1')
      .attr('font-size', 9).attr('font-family', 'Inter, sans-serif').text('12 blocks');

    // Logit bars
    const barG = svg.append('g').attr('class', 'gen-logits').attr('opacity', 0);
    const xScale = scaleLinear().domain([0, max(LOGITS, d => d.val)]).range([0, 100]);
    LOGITS.forEach((d, i) => {
      const y = 32 + i * 24;
      barG.append('rect').attr('x', 264).attr('y', y).attr('width', xScale(d.val)).attr('height', 18)
        .attr('rx', 3).attr('fill', '#818cf8').attr('opacity', 0.7 - i * 0.1);
      barG.append('text').attr('x', 260).attr('y', y + 13)
        .attr('text-anchor', 'end').attr('fill', '#94a3b8')
        .attr('font-size', 11).attr('font-family', 'monospace').text(d.token);
      barG.append('text').attr('x', 268 + xScale(d.val)).attr('y', y + 13)
        .attr('fill', '#64748b').attr('font-size', 9).attr('font-family', 'Inter, sans-serif')
        .text(d.val.toFixed(2));
    });

    // Append arrow
    const appendG = svg.append('g').attr('class', 'gen-append').attr('opacity', 0);
    appendG.append('line').attr('x1', 370).attr('y1', 42).attr('x2', 400).attr('y2', 85)
      .attr('stroke', '#34d399').attr('stroke-width', 1.5);
    appendG.append('rect').attr('x', 400).attr('y', 80).attr('width', 44).attr('height', 30)
      .attr('rx', 4).attr('fill', '#1e293b').attr('stroke', '#34d399').attr('stroke-width', 2);
    appendG.append('text').attr('x', 422).attr('y', 99)
      .attr('text-anchor', 'middle').attr('fill', '#34d399')
      .attr('font-size', 12).attr('font-family', 'Inter, sans-serif').attr('font-weight', 700)
      .text('on');
    appendG.append('text').attr('x', 422).attr('y', 125)
      .attr('text-anchor', 'middle').attr('fill', '#64748b')
      .attr('font-size', 9).attr('font-family', 'Inter, sans-serif').text('appended');

    svg.append('text').attr('class', 'gen-loop').attr('x', W / 2).attr('y', 208)
      .attr('text-anchor', 'middle').attr('fill', '#475569')
      .attr('font-size', 10).attr('font-family', 'Inter, sans-serif').attr('opacity', 0)
      .text('→ repeat with "The cat sat on" →');
  }, []);

  const updateFn = useCallback((svg, s) => {
    svg.select('.gen-ctx').transition().duration(400).attr('opacity', s >= 1 ? 1 : 0);
    svg.select('.gen-model').transition().duration(400).delay(100).attr('opacity', s >= 1 ? 1 : 0);
    svg.select('.gen-logits').transition().duration(400).delay(200).attr('opacity', s >= 2 ? 1 : 0);
    svg.select('.gen-append').transition().duration(400).attr('opacity', s >= 3 ? 1 : 0);
    svg.select('.gen-loop').transition().duration(400).attr('opacity', s >= 3 ? 1 : 0);
  }, []);

  const svgRef = useDiagramSetup({ initFn, updateFn, step });
  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
}
