import { useCallback } from 'react';

import { useDiagramSetup } from './useDiagramSetup';

const W = 480, H = 340;

export function FeedForwardDiagram({ step = 0 }) {
  const initFn = useCallback((svg) => {
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', '100%');

    svg.append('text').attr('x', W / 2).attr('y', 28)
      .attr('text-anchor', 'middle').attr('fill', '#cbd5e1')
      .attr('font-size', 11).attr('font-family', 'Manrope Variable, sans-serif').attr('letter-spacing', '0.1em')
      .text('FEED-FORWARD NETWORK (PER TOKEN)');

    // Arrow marker
    const defs = svg.append('defs');
    const marker = defs.append('marker').attr('id', 'ffn-arrow')
      .attr('markerWidth', 7).attr('markerHeight', 7)
      .attr('refX', 3.5).attr('refY', 3.5).attr('orient', 'auto');
    marker.append('path').attr('d', 'M0,0 L0,7 L7,3.5 z').attr('fill', '#475569');

    // Input bar 768
    const inG = svg.append('g').attr('class', 'ffn-in').attr('data-object-id', 'feedforward.input').attr('opacity', 0);
    inG.append('rect').attr('x', 36).attr('y', 110).attr('width', 28).attr('height', 100)
      .attr('rx', 4).attr('fill', '#34d399').attr('opacity', 0.8);
    inG.append('text').attr('x', 50).attr('y', 102).attr('text-anchor', 'middle')
      .attr('fill', '#34d399').attr('font-size', 12).attr('font-family', 'JetBrains Mono, monospace').text('768');
    inG.append('text').attr('x', 50).attr('y', 228).attr('text-anchor', 'middle')
      .attr('fill', '#cbd5e1').attr('font-size', 11).attr('font-family', 'Manrope Variable, sans-serif').text('input');

    // Arrow1
    const arr1 = svg.append('g').attr('class', 'ffn-arr1').attr('opacity', 0);
    arr1.append('line').attr('x1', 66).attr('y1', 160).attr('x2', 112).attr('y2', 160)
      .attr('stroke', '#475569').attr('stroke-width', 1.5).attr('marker-end', 'url(#ffn-arrow)');
    arr1.append('text').attr('x', 89).attr('y', 152).attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8').attr('font-size', 10).attr('font-family', 'Manrope Variable, sans-serif').text('Linear');

    // Hidden bar 3072
    const hidG = svg.append('g').attr('class', 'ffn-hid').attr('data-object-id', 'feedforward.hidden').attr('opacity', 0);
    hidG.append('rect').attr('x', 114).attr('y', 60).attr('width', 48).attr('height', 200)
      .attr('rx', 4).attr('fill', '#f472b6').attr('opacity', 0.7);
    hidG.append('text').attr('x', 138).attr('y', 52).attr('text-anchor', 'middle')
      .attr('fill', '#f472b6').attr('font-size', 12).attr('font-family', 'JetBrains Mono, monospace').text('3072');
    hidG.append('rect').attr('x', 114).attr('y', 275).attr('width', 48).attr('height', 22)
      .attr('rx', 4).attr('fill', '#7f1d4a').attr('opacity', 0.6);
    hidG.append('text').attr('x', 138).attr('y', 290).attr('text-anchor', 'middle')
      .attr('fill', '#f9a8d4').attr('font-size', 11).attr('font-family', 'Manrope Variable, sans-serif').text('GELU');

    // Arrow2
    const arr2 = svg.append('g').attr('class', 'ffn-arr2').attr('opacity', 0);
    arr2.append('line').attr('x1', 164).attr('y1', 160).attr('x2', 210).attr('y2', 160)
      .attr('stroke', '#475569').attr('stroke-width', 1.5).attr('marker-end', 'url(#ffn-arrow)');
    arr2.append('text').attr('x', 187).attr('y', 152).attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8').attr('font-size', 10).attr('font-family', 'Manrope Variable, sans-serif').text('Linear');

    // Output bar 768
    const outG = svg.append('g').attr('class', 'ffn-out').attr('data-object-id', 'feedforward.output').attr('opacity', 0);
    outG.append('rect').attr('x', 212).attr('y', 110).attr('width', 28).attr('height', 100)
      .attr('rx', 4).attr('fill', '#34d399').attr('opacity', 0.8);
    outG.append('text').attr('x', 226).attr('y', 102).attr('text-anchor', 'middle')
      .attr('fill', '#34d399').attr('font-size', 12).attr('font-family', 'JetBrains Mono, monospace').text('768');
    outG.append('text').attr('x', 226).attr('y', 228).attr('text-anchor', 'middle')
      .attr('fill', '#cbd5e1').attr('font-size', 11).attr('font-family', 'Manrope Variable, sans-serif').text('output');

    // Caption
    const capG = svg.append('g').attr('class', 'ffn-caption').attr('opacity', 0);
    capG.append('text').attr('x', W * 0.67).attr('y', 130)
      .attr('fill', '#94a3b8').attr('font-size', 12).attr('font-family', 'Manrope Variable, sans-serif')
      .text('Each position');
    capG.append('text').attr('x', W * 0.67).attr('y', 150)
      .attr('fill', '#94a3b8').attr('font-size', 12).attr('font-family', 'Manrope Variable, sans-serif')
      .text('processed');
    capG.append('text').attr('x', W * 0.67).attr('y', 170)
      .attr('fill', '#94a3b8').attr('font-size', 12).attr('font-family', 'Manrope Variable, sans-serif')
      .text('independently.');
    capG.append('text').attr('x', W * 0.67).attr('y', 200)
      .attr('fill', '#cbd5e1').attr('font-size', 11).attr('font-family', 'Manrope Variable, sans-serif')
      .text('No cross-token');
    capG.append('text').attr('x', W * 0.67).attr('y', 218)
      .attr('fill', '#cbd5e1').attr('font-size', 11).attr('font-family', 'Manrope Variable, sans-serif')
      .text('mixing here.');

    // 4× label
    svg.append('text').attr('class', 'ffn-ratio').attr('x', 138).attr('y', 320)
      .attr('text-anchor', 'middle').attr('fill', '#f472b6').attr('font-size', 11)
      .attr('font-family', 'Manrope Variable, sans-serif').attr('opacity', 0)
      .text('4× expansion (768 → 3072 → 768)');
  }, []);

  const updateFn = useCallback((svg, s) => {
    svg.select('.ffn-in').attr('opacity', Math.max(0, Math.min(1, s)));
    svg.select('.ffn-arr1').attr('opacity', Math.max(0, Math.min(1, s - 1)));
    svg.select('.ffn-hid').attr('opacity', Math.max(0, Math.min(1, s - 1)));
    svg.select('.ffn-arr2').attr('opacity', Math.max(0, Math.min(1, s - 2)));
    svg.select('.ffn-out').attr('opacity', Math.max(0, Math.min(1, s - 2)));
    svg.select('.ffn-caption').attr('opacity', Math.max(0, Math.min(1, s - 2)));
    svg.select('.ffn-ratio').attr('opacity', Math.max(0, Math.min(1, s - 2)));
  }, []);

  const svgRef = useDiagramSetup({ initFn, updateFn, step });
  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
}
