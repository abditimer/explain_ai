import { useCallback } from 'react';
import { select } from 'd3';
import { useDiagramSetup } from './useDiagramSetup';

const W = 480, H = 220;

export function BlockDiagram({ step = 0 }) {
  const initFn = useCallback((svg) => {
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', '100%');

    svg.append('text').attr('x', W / 2).attr('y', 20)
      .attr('text-anchor', 'middle').attr('fill', '#94a3b8')
      .attr('font-size', 12).attr('font-family', 'Inter, sans-serif')
      .text('Transformer Block (one of 12)');

    // Input label
    svg.append('text').attr('class', 'blk-input').attr('x', W / 2).attr('y', 46)
      .attr('text-anchor', 'middle').attr('fill', '#64748b')
      .attr('font-size', 11).attr('font-family', 'Inter, sans-serif').attr('opacity', 0)
      .text('x (768-dim)');

    // Attention box
    const attnG = svg.append('g').attr('class', 'blk-attn').attr('opacity', 0);
    attnG.append('rect').attr('x', W / 2 - 70).attr('y', 55).attr('width', 140).attr('height', 46)
      .attr('rx', 6).attr('fill', '#1e3a5f').attr('stroke', '#60a5fa').attr('stroke-width', 1.5);
    attnG.append('text').attr('x', W / 2).attr('y', 74)
      .attr('text-anchor', 'middle').attr('fill', '#60a5fa')
      .attr('font-size', 11).attr('font-family', 'Inter, sans-serif').attr('font-weight', 600)
      .text('LayerNorm → Attention');
    attnG.append('text').attr('x', W / 2).attr('y', 90)
      .attr('text-anchor', 'middle').attr('fill', '#93c5fd')
      .attr('font-size', 10).attr('font-family', 'Inter, sans-serif')
      .text('→ Dropout → + x');

    // FFN box
    const ffnG = svg.append('g').attr('class', 'blk-ffn').attr('opacity', 0);
    ffnG.append('rect').attr('x', W / 2 - 70).attr('y', 120).attr('width', 140).attr('height', 46)
      .attr('rx', 6).attr('fill', '#1a3a2a').attr('stroke', '#34d399').attr('stroke-width', 1.5);
    ffnG.append('text').attr('x', W / 2).attr('y', 139)
      .attr('text-anchor', 'middle').attr('fill', '#34d399')
      .attr('font-size', 11).attr('font-family', 'Inter, sans-serif').attr('font-weight', 600)
      .text('LayerNorm → FFN');
    ffnG.append('text').attr('x', W / 2).attr('y', 155)
      .attr('text-anchor', 'middle').attr('fill', '#6ee7b7')
      .attr('font-size', 10).attr('font-family', 'Inter, sans-serif')
      .text('→ Dropout → + x');

    // Residual connections (dashed skip lines)
    const resG = svg.append('g').attr('class', 'blk-res').attr('opacity', 0);
    // Left residual skip over attention
    resG.append('path').attr('d', `M${W/2-90},52 L${W/2-90},105`)
      .attr('stroke', '#f472b6').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3').attr('fill', 'none');
    resG.append('circle').attr('cx', W/2-90).attr('cy', 105).attr('r', 6)
      .attr('fill', '#1e293b').attr('stroke', '#f472b6').attr('stroke-width', 1.5);
    resG.append('text').attr('x', W/2-90).attr('y', 109)
      .attr('text-anchor', 'middle').attr('fill', '#f472b6').attr('font-size', 9).attr('font-family', 'monospace')
      .text('+');
    // Right residual skip over ffn
    resG.append('path').attr('d', `M${W/2+90},116 L${W/2+90},170`)
      .attr('stroke', '#f472b6').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3').attr('fill', 'none');
    resG.append('circle').attr('cx', W/2+90).attr('cy', 170).attr('r', 6)
      .attr('fill', '#1e293b').attr('stroke', '#f472b6').attr('stroke-width', 1.5);
    resG.append('text').attr('x', W/2+90).attr('y', 174)
      .attr('text-anchor', 'middle').attr('fill', '#f472b6').attr('font-size', 9).attr('font-family', 'monospace')
      .text('+');
    resG.append('text').attr('x', W/2+100).attr('y', 200)
      .attr('fill', '#f472b6').attr('font-size', 10).attr('font-family', 'Inter, sans-serif')
      .text('residual');
  }, []);

  const updateFn = useCallback((svg, s) => {
    svg.select('.blk-input').transition().duration(400).attr('opacity', s >= 1 ? 1 : 0);
    svg.select('.blk-attn').transition().duration(400).attr('opacity', s >= 1 ? 1 : 0);
    svg.select('.blk-ffn').transition().duration(400).delay(150).attr('opacity', s >= 2 ? 1 : 0);
    svg.select('.blk-res').transition().duration(400).delay(200).attr('opacity', s >= 3 ? 1 : 0);
  }, []);

  const svgRef = useDiagramSetup({ initFn, updateFn, step });
  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
}
