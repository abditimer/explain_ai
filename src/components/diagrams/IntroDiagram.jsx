import { useCallback } from 'react';
import { useDiagramSetup } from './useDiagramSetup';

const W = 480, H = 340;
const COLORS = ['#60a5fa','#a78bfa','#f472b6','#fb923c','#34d399','#818cf8'];
const CONTINUATIONS = [' mat', ' floor', ' sofa'];

export function IntroDiagram({ step = 0 }) {
  const initFn = useCallback((svg) => {
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', '100%');

    svg.append('text')
      .attr('class', 'sentence-label')
      .attr('data-object-id', 'sentence.prefix')
      .attr('x', 34).attr('y', 66)
      .attr('text-anchor', 'start')
      .attr('fill', '#e8e8f0').attr('font-size', 20).attr('font-family', 'Manrope Variable, sans-serif').attr('font-weight', 500)
      .text('The cat sat on the');

    svg.append('rect').attr('x', 330).attr('y', 39).attr('width', 116).attr('height', 40)
      .attr('rx', 7).attr('fill', 'none').attr('stroke', '#a78bfa').attr('stroke-dasharray', '5,4')
      .attr('data-object-id', 'sentence.missing-continuation');
    svg.append('text').attr('x', 388).attr('y', 65).attr('text-anchor', 'middle')
      .attr('fill', '#a78bfa').attr('font-size', 18).attr('font-family', 'Manrope Variable, sans-serif')
      .text('…?');

    svg.append('text').attr('class', 'arrow-line')
      .attr('x', W / 2).attr('y', 132)
      .attr('text-anchor', 'middle').attr('fill', '#cbd5e1')
      .attr('font-size', 13).attr('font-family', 'Manrope Variable, sans-serif').attr('opacity', 0)
      .text('What might come next?');

    const predG = svg.append('g').attr('class', 'predict').attr('data-object-id', 'sentence.candidates').attr('opacity', 0);
    CONTINUATIONS.forEach((candidate, i) => {
      const x = 34 + i * 142;
      const candidateG = predG.append('g').attr('data-object-id', `sentence.candidate.${i + 1}`);
      candidateG.append('rect').attr('x', x).attr('y', 158).attr('width', 124).attr('height', 48)
        .attr('rx', 8).attr('fill', '#172033').attr('stroke', COLORS[i]).attr('stroke-width', 1.5);
      candidateG.append('text').attr('x', x + 62).attr('y', 188)
        .attr('text-anchor', 'middle').attr('fill', COLORS[i])
        .attr('font-size', 19).attr('font-family', 'ui-monospace, monospace').attr('font-weight', 700)
        .text(candidate);
    });
    predG.append('text').attr('x', W / 2).attr('y', 230).attr('text-anchor', 'middle')
      .attr('fill', '#cbd5e1').attr('font-size', 10).attr('font-family', 'Manrope Variable, sans-serif')
      .text('Editorial examples · not model predictions');

    svg.append('text').attr('class', 'sub-label')
      .attr('x', W / 2).attr('y', 285)
      .attr('text-anchor', 'middle').attr('fill', '#cbd5e1')
      .attr('font-size', 11).attr('font-family', 'Manrope Variable, sans-serif').attr('opacity', 0)
      .text('A model selects one token at a time');
  }, []);

  const updateFn = useCallback((svg, s) => {
    svg.select('.arrow-line').attr('opacity', Math.max(0, Math.min(1, s - 1)));
    svg.select('.predict').attr('opacity', Math.max(0, Math.min(1, s - 1)));
    svg.select('.sub-label').attr('opacity', Math.max(0, Math.min(1, s - 2)));
  }, []);

  const svgRef = useDiagramSetup({ initFn, updateFn, step });
  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
}
