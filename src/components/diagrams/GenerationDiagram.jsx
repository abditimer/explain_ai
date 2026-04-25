import { useCallback } from 'react';
import { select, scaleLinear, max } from 'd3';
import { useDiagramSetup } from './useDiagramSetup';

const W = 480, H = 340;
const CONTEXT = ['The', 'cat', 'sat'];
const LOGITS = [
  { token: 'on',    val: 0.72 },
  { token: 'down',  val: 0.45 },
  { token: 'there', val: 0.31 },
  { token: 'up',    val: 0.18 },
];

export function GenerationDiagram({ step = 0 }) {
  const initFn = useCallback((svg) => {
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', '100%');

    svg.append('text').attr('x', W / 2).attr('y', 28)
      .attr('text-anchor', 'middle').attr('fill', '#334155')
      .attr('font-size', 11).attr('font-family', 'Inter, sans-serif').attr('letter-spacing', '0.1em')
      .text('AUTOREGRESSIVE GENERATION');

    // Context tokens row
    const ctxG = svg.append('g').attr('class', 'gen-ctx').attr('opacity', 0);
    const tokenW = 66, tokenH = 38, rowY = 60;
    CONTEXT.forEach((t, i) => {
      ctxG.append('rect').attr('x', 16 + i * (tokenW + 8)).attr('y', rowY).attr('width', tokenW).attr('height', tokenH)
        .attr('rx', 6).attr('fill', '#1e293b').attr('stroke', '#60a5fa').attr('stroke-width', 1.5);
      ctxG.append('text').attr('x', 16 + i * (tokenW + 8) + tokenW / 2).attr('y', rowY + 24)
        .attr('text-anchor', 'middle').attr('fill', '#60a5fa')
        .attr('font-size', 14).attr('font-family', 'Inter, sans-serif').attr('font-weight', 600)
        .text(t);
    });
    ctxG.append('text').attr('x', 16 + CONTEXT.length * (tokenW + 8) / 2).attr('y', rowY + tokenH + 18)
      .attr('text-anchor', 'middle').attr('fill', '#475569')
      .attr('font-size', 11).attr('font-family', 'Inter, sans-serif').text('context window');

    // Model box
    const modelG = svg.append('g').attr('class', 'gen-model').attr('opacity', 0);
    const modelX = 16 + CONTEXT.length * (tokenW + 8) + 20;
    modelG.append('rect').attr('x', modelX).attr('y', rowY - 8).attr('width', 80).attr('height', tokenH + 16)
      .attr('rx', 8).attr('fill', '#1e1b4b').attr('stroke', '#818cf8').attr('stroke-width', 1.5);
    modelG.append('text').attr('x', modelX + 40).attr('y', rowY + 14)
      .attr('text-anchor', 'middle').attr('fill', '#818cf8')
      .attr('font-size', 14).attr('font-family', 'Inter, sans-serif').attr('font-weight', 700)
      .text('GPT');
    modelG.append('text').attr('x', modelX + 40).attr('y', rowY + 30)
      .attr('text-anchor', 'middle').attr('fill', '#6366f1')
      .attr('font-size', 10).attr('font-family', 'Inter, sans-serif').text('12 blocks');

    // Logit bars
    const barG = svg.append('g').attr('class', 'gen-logits').attr('opacity', 0);
    const xScale = scaleLinear().domain([0, max(LOGITS, d => d.val)]).range([0, 130]);
    const barStartX = 24;
    LOGITS.forEach((d, i) => {
      const y = 148 + i * 36;
      barG.append('rect').attr('x', barStartX + 58).attr('y', y).attr('width', xScale(d.val)).attr('height', 26)
        .attr('rx', 4).attr('fill', i === 0 ? '#6366f1' : '#818cf8').attr('opacity', 0.7 - i * 0.1);
      barG.append('text').attr('x', barStartX + 54).attr('y', y + 18)
        .attr('text-anchor', 'end').attr('fill', i === 0 ? '#c7d2fe' : '#94a3b8')
        .attr('font-size', 13).attr('font-family', 'JetBrains Mono, monospace').attr('font-weight', i === 0 ? 700 : 400)
        .text(d.token);
      barG.append('text').attr('x', barStartX + 62 + xScale(d.val)).attr('y', y + 18)
        .attr('fill', '#64748b').attr('font-size', 10).attr('font-family', 'Inter, sans-serif')
        .text(d.val.toFixed(2));
    });
    barG.append('text').attr('x', barStartX).attr('y', 142)
      .attr('fill', '#475569').attr('font-size', 11).attr('font-family', 'Inter, sans-serif')
      .text('next-token logits:');

    // Append result
    const appendG = svg.append('g').attr('class', 'gen-append').attr('opacity', 0);
    appendG.append('text').attr('x', W - 24).attr('y', 82)
      .attr('text-anchor', 'end').attr('fill', '#475569')
      .attr('font-size', 11).attr('font-family', 'Inter, sans-serif').text('→ top pick:');
    appendG.append('rect').attr('x', W - 78).attr('y', 92).attr('width', 66).attr('height', 38)
      .attr('rx', 6).attr('fill', '#1e293b').attr('stroke', '#34d399').attr('stroke-width', 2);
    appendG.append('text').attr('x', W - 45).attr('y', 117)
      .attr('text-anchor', 'middle').attr('fill', '#34d399')
      .attr('font-size', 16).attr('font-family', 'Inter, sans-serif').attr('font-weight', 700)
      .text('"on"');

    svg.append('text').attr('class', 'gen-loop').attr('x', W / 2).attr('y', 316)
      .attr('text-anchor', 'middle').attr('fill', '#475569')
      .attr('font-size', 11).attr('font-family', 'Inter, sans-serif').attr('opacity', 0)
      .text('Token appended → repeat with "The cat sat on" → …');
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
