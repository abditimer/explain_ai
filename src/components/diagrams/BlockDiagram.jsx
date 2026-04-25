import { useCallback } from 'react';

import { useDiagramSetup } from './useDiagramSetup';

const W = 480, H = 340;

export function BlockDiagram({ step = 0 }) {
  const initFn = useCallback((svg) => {
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', '100%');

    svg.append('text').attr('x', W / 2).attr('y', 28)
      .attr('text-anchor', 'middle').attr('fill', '#334155')
      .attr('font-size', 11).attr('font-family', 'Inter, sans-serif').attr('letter-spacing', '0.1em')
      .text('TRANSFORMER BLOCK (ONE OF 12)');

    // Input label
    svg.append('text').attr('class', 'blk-input').attr('x', W / 2).attr('y', 62)
      .attr('text-anchor', 'middle').attr('fill', '#94a3b8')
      .attr('font-size', 12).attr('font-family', 'JetBrains Mono, monospace').attr('opacity', 0)
      .text('x  (768-dim)');

    // Connector from input to attn
    svg.append('line').attr('class', 'blk-input').attr('x1', W/2).attr('y1', 68)
      .attr('x2', W/2).attr('y2', 85)
      .attr('stroke', '#334155').attr('stroke-width', 1.5).attr('opacity', 0);

    // Attention box
    const attnG = svg.append('g').attr('class', 'blk-attn').attr('opacity', 0);
    attnG.append('rect').attr('x', W / 2 - 90).attr('y', 86).attr('width', 180).attr('height', 60)
      .attr('rx', 8).attr('fill', '#1e3a5f').attr('stroke', '#60a5fa').attr('stroke-width', 1.5);
    attnG.append('text').attr('x', W / 2).attr('y', 111)
      .attr('text-anchor', 'middle').attr('fill', '#60a5fa')
      .attr('font-size', 13).attr('font-family', 'Inter, sans-serif').attr('font-weight', 600)
      .text('LayerNorm → Attention');
    attnG.append('text').attr('x', W / 2).attr('y', 132)
      .attr('text-anchor', 'middle').attr('fill', '#93c5fd')
      .attr('font-size', 11).attr('font-family', 'Inter, sans-serif')
      .text('Dropout → residual add');

    // Connector attn → ffn
    svg.append('line').attr('class', 'blk-conn').attr('x1', W/2).attr('y1', 148)
      .attr('x2', W/2).attr('y2', 168)
      .attr('stroke', '#334155').attr('stroke-width', 1.5).attr('opacity', 0);

    // FFN box
    const ffnG = svg.append('g').attr('class', 'blk-ffn').attr('opacity', 0);
    ffnG.append('rect').attr('x', W / 2 - 90).attr('y', 170).attr('width', 180).attr('height', 60)
      .attr('rx', 8).attr('fill', '#1a3a2a').attr('stroke', '#34d399').attr('stroke-width', 1.5);
    ffnG.append('text').attr('x', W / 2).attr('y', 195)
      .attr('text-anchor', 'middle').attr('fill', '#34d399')
      .attr('font-size', 13).attr('font-family', 'Inter, sans-serif').attr('font-weight', 600)
      .text('LayerNorm → FFN');
    ffnG.append('text').attr('x', W / 2).attr('y', 216)
      .attr('text-anchor', 'middle').attr('fill', '#6ee7b7')
      .attr('font-size', 11).attr('font-family', 'Inter, sans-serif')
      .text('Dropout → residual add');

    // Output label
    svg.append('text').attr('class', 'blk-output').attr('x', W / 2).attr('y', 258)
      .attr('text-anchor', 'middle').attr('fill', '#94a3b8')
      .attr('font-size', 12).attr('font-family', 'JetBrains Mono, monospace').attr('opacity', 0)
      .text('x′  (768-dim, enriched)');

    // Residual connections (dashed skip lines on each side)
    const resG = svg.append('g').attr('class', 'blk-res').attr('opacity', 0);

    // Left skip — attention residual
    resG.append('path')
      .attr('d', `M${W/2-110},86 L${W/2-110},62 L${W/2-20},62`)
      .attr('stroke', '#f472b6').attr('stroke-width', 1.5).attr('stroke-dasharray', '5,3').attr('fill', 'none');
    resG.append('path')
      .attr('d', `M${W/2-110},148 L${W/2-110},162 L${W/2-20},162`)
      .attr('stroke', '#f472b6').attr('stroke-width', 1.5).attr('stroke-dasharray', '5,3').attr('fill', 'none');
    resG.append('circle').attr('cx', W/2-20).attr('cy', 62).attr('r', 7)
      .attr('fill', '#1e293b').attr('stroke', '#f472b6').attr('stroke-width', 1.5);
    resG.append('text').attr('x', W/2-20).attr('y', 66).attr('text-anchor', 'middle')
      .attr('fill', '#f472b6').attr('font-size', 10).attr('font-family', 'monospace').text('+');
    resG.append('circle').attr('cx', W/2-20).attr('cy', 162).attr('r', 7)
      .attr('fill', '#1e293b').attr('stroke', '#f472b6').attr('stroke-width', 1.5);
    resG.append('text').attr('x', W/2-20).attr('y', 166).attr('text-anchor', 'middle')
      .attr('fill', '#f472b6').attr('font-size', 10).attr('font-family', 'monospace').text('+');

    // Residual label
    resG.append('text').attr('x', W/2-118).attr('y', 120)
      .attr('text-anchor', 'middle').attr('fill', '#f472b6')
      .attr('font-size', 10).attr('font-family', 'Inter, sans-serif').attr('transform', `rotate(-90,${W/2-118},120)`)
      .text('residual skip');

    // ×12 badge
    svg.append('rect').attr('class', 'blk-badge').attr('x', W/2+100).attr('y', 120)
      .attr('width', 52).attr('height', 28).attr('rx', 6)
      .attr('fill', '#1e293b').attr('stroke', '#818cf8').attr('stroke-width', 1).attr('opacity', 0);
    svg.append('text').attr('class', 'blk-badge').attr('x', W/2+126).attr('y', 139)
      .attr('text-anchor', 'middle').attr('fill', '#818cf8')
      .attr('font-size', 13).attr('font-family', 'Inter, sans-serif').attr('font-weight', 700).attr('opacity', 0)
      .text('× 12');
  }, []);

  const updateFn = useCallback((svg, s) => {
    svg.selectAll('.blk-input').transition().duration(400).attr('opacity', s >= 1 ? 1 : 0);
    svg.select('.blk-attn').transition().duration(400).attr('opacity', s >= 1 ? 1 : 0);
    svg.select('.blk-conn').transition().duration(400).attr('opacity', s >= 2 ? 1 : 0);
    svg.select('.blk-ffn').transition().duration(400).delay(150).attr('opacity', s >= 2 ? 1 : 0);
    svg.select('.blk-output').transition().duration(400).delay(200).attr('opacity', s >= 2 ? 1 : 0);
    svg.select('.blk-res').transition().duration(400).delay(200).attr('opacity', s >= 3 ? 1 : 0);
    svg.selectAll('.blk-badge').transition().duration(400).delay(300).attr('opacity', s >= 3 ? 1 : 0);
  }, []);

  const svgRef = useDiagramSetup({ initFn, updateFn, step });
  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
}
