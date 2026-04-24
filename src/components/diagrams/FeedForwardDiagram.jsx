import { useCallback } from 'react';
import { select } from 'd3';
import { useDiagramSetup } from './useDiagramSetup';

const W = 480, H = 220;

export function FeedForwardDiagram({ step = 0 }) {
  const initFn = useCallback((svg) => {
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', '100%');

    svg.append('text').attr('x', W / 2).attr('y', 22)
      .attr('text-anchor', 'middle').attr('fill', '#94a3b8')
      .attr('font-size', 12).attr('font-family', 'Inter, sans-serif')
      .text('Feed-Forward Network (per token)');

    // Input bar 768
    const inG = svg.append('g').attr('class', 'ffn-in').attr('opacity', 0);
    inG.append('rect').attr('x', 32).attr('y', 80).attr('width', 20).attr('height', 60)
      .attr('rx', 3).attr('fill', '#34d399').attr('opacity', 0.8);
    inG.append('text').attr('x', 42).attr('y', 75).attr('text-anchor', 'middle')
      .attr('fill', '#34d399').attr('font-size', 11).attr('font-family', 'monospace').text('768');
    inG.append('text').attr('x', 42).attr('y', 158).attr('text-anchor', 'middle')
      .attr('fill', '#64748b').attr('font-size', 10).attr('font-family', 'Inter, sans-serif').text('in');

    // Arrow1
    const arr1 = svg.append('g').attr('class', 'ffn-arr1').attr('opacity', 0);
    arr1.append('line').attr('x1', 54).attr('y1', 110).attr('x2', 96).attr('y2', 110)
      .attr('stroke', '#475569').attr('stroke-width', 1.5).attr('marker-end', 'url(#arrow)');
    arr1.append('text').attr('x', 75).attr('y', 104).attr('text-anchor', 'middle')
      .attr('fill', '#475569').attr('font-size', 9).attr('font-family', 'Inter, sans-serif').text('Linear');

    // Hidden bar 3072
    const hidG = svg.append('g').attr('class', 'ffn-hid').attr('opacity', 0);
    hidG.append('rect').attr('x', 98).attr('y', 40).attr('width', 36).attr('height', 140)
      .attr('rx', 3).attr('fill', '#f472b6').attr('opacity', 0.7);
    hidG.append('text').attr('x', 116).attr('y', 34).attr('text-anchor', 'middle')
      .attr('fill', '#f472b6').attr('font-size', 11).attr('font-family', 'monospace').text('3072');
    hidG.append('text').attr('x', 116).attr('y', 198).attr('text-anchor', 'middle')
      .attr('fill', '#f472b6').attr('font-size', 10).attr('font-family', 'Inter, sans-serif').text('GELU');

    // Arrow2
    const arr2 = svg.append('g').attr('class', 'ffn-arr2').attr('opacity', 0);
    arr2.append('line').attr('x1', 136).attr('y1', 110).attr('x2', 178).attr('y2', 110)
      .attr('stroke', '#475569').attr('stroke-width', 1.5).attr('marker-end', 'url(#arrow)');
    arr2.append('text').attr('x', 157).attr('y', 104).attr('text-anchor', 'middle')
      .attr('fill', '#475569').attr('font-size', 9).attr('font-family', 'Inter, sans-serif').text('Linear');

    // Output bar 768
    const outG = svg.append('g').attr('class', 'ffn-out').attr('opacity', 0);
    outG.append('rect').attr('x', 180).attr('y', 80).attr('width', 20).attr('height', 60)
      .attr('rx', 3).attr('fill', '#34d399').attr('opacity', 0.8);
    outG.append('text').attr('x', 190).attr('y', 75).attr('text-anchor', 'middle')
      .attr('fill', '#34d399').attr('font-size', 11).attr('font-family', 'monospace').text('768');
    outG.append('text').attr('x', 190).attr('y', 158).attr('text-anchor', 'middle')
      .attr('fill', '#64748b').attr('font-size', 10).attr('font-family', 'Inter, sans-serif').text('out');

    // Caption
    svg.append('text').attr('class', 'ffn-caption').attr('x', W * 0.65).attr('y', 100)
      .attr('fill', '#64748b').attr('font-size', 11).attr('font-family', 'Inter, sans-serif')
      .attr('opacity', 0)
      .text('Each position independently');
    svg.append('text').attr('class', 'ffn-caption2').attr('x', W * 0.65).attr('y', 118)
      .attr('fill', '#64748b').attr('font-size', 11).attr('font-family', 'Inter, sans-serif')
      .attr('opacity', 0)
      .text('refined — no cross-token mixing.');

    // Arrow marker
    const defs = svg.append('defs');
    const marker = defs.append('marker').attr('id', 'arrow')
      .attr('markerWidth', 6).attr('markerHeight', 6)
      .attr('refX', 3).attr('refY', 3).attr('orient', 'auto');
    marker.append('path').attr('d', 'M0,0 L0,6 L6,3 z').attr('fill', '#475569');
  }, []);

  const updateFn = useCallback((svg, s) => {
    svg.select('.ffn-in').transition().duration(400).attr('opacity', s >= 1 ? 1 : 0);
    svg.select('.ffn-arr1').transition().duration(400).delay(100).attr('opacity', s >= 2 ? 1 : 0);
    svg.select('.ffn-hid').transition().duration(400).delay(200).attr('opacity', s >= 2 ? 1 : 0);
    svg.select('.ffn-arr2').transition().duration(400).delay(300).attr('opacity', s >= 3 ? 1 : 0);
    svg.select('.ffn-out').transition().duration(400).delay(400).attr('opacity', s >= 3 ? 1 : 0);
    svg.select('.ffn-caption').transition().duration(400).attr('opacity', s >= 3 ? 1 : 0);
    svg.select('.ffn-caption2').transition().duration(400).attr('opacity', s >= 3 ? 1 : 0);
  }, []);

  const svgRef = useDiagramSetup({ initFn, updateFn, step });
  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
}
