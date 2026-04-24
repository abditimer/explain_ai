import { useCallback } from 'react';
import { select, scaleLinear, line, axisBottom, axisLeft, easeQuadInOut } from 'd3';
import { useDiagramSetup } from './useDiagramSetup';

const W = 480, H = 220;
const MARGIN = { top: 30, right: 30, bottom: 36, left: 46 };
const IW = W - MARGIN.left - MARGIN.right;
const IH = H - MARGIN.top - MARGIN.bottom;

const STEPS_DATA = Array.from({ length: 30 }, (_, i) => ({
  x: i,
  y: 4.2 * Math.exp(-i * 0.12) + 0.8 + Math.random() * 0.15,
}));

export function TrainingDiagram({ step = 0 }) {
  const initFn = useCallback((svg) => {
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', '100%');

    const g = svg.append('g').attr('class', 'chart').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    const xScale = scaleLinear().domain([0, STEPS_DATA.length - 1]).range([0, IW]);
    const yScale = scaleLinear().domain([0, 5]).range([IH, 0]);

    // Axes (visible immediately)
    g.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${IH})`).attr('opacity', 1)
      .call(axisBottom(xScale).ticks(5))
      .selectAll('text, line, path').attr('stroke', '#475569').attr('fill', '#475569');
    g.append('g').attr('class', 'y-axis').attr('opacity', 1)
      .call(axisLeft(yScale).ticks(4))
      .selectAll('text, line, path').attr('stroke', '#475569').attr('fill', '#475569');

    g.append('text').attr('x', IW / 2).attr('y', IH + 32)
      .attr('text-anchor', 'middle').attr('fill', '#475569')
      .attr('font-size', 10).attr('font-family', 'Inter, sans-serif').text('Training step');
    g.append('text').attr('transform', 'rotate(-90)').attr('x', -IH / 2).attr('y', -38)
      .attr('text-anchor', 'middle').attr('fill', '#475569')
      .attr('font-size', 10).attr('font-family', 'Inter, sans-serif').text('Loss');

    // Loss path
    const lineGen = line().x(d => xScale(d.x)).y(d => yScale(d.y));
    const path = g.append('path').attr('class', 'loss-path').attr('d', lineGen(STEPS_DATA))
      .attr('fill', 'none').attr('stroke', '#f472b6').attr('stroke-width', 2).attr('opacity', 0);

    const totalLength = path.node()?.getTotalLength() ?? 0;
    path.attr('stroke-dasharray', totalLength).attr('stroke-dashoffset', totalLength);

    // Endpoint dot
    const last = STEPS_DATA[STEPS_DATA.length - 1];
    g.append('circle').attr('class', 'end-dot').attr('cx', xScale(last.x)).attr('cy', yScale(last.y))
      .attr('r', 5).attr('fill', '#34d399').attr('opacity', 0);
    g.append('text').attr('class', 'end-label')
      .attr('x', xScale(last.x) - 6).attr('y', yScale(last.y) - 10)
      .attr('text-anchor', 'end').attr('fill', '#34d399')
      .attr('font-size', 10).attr('font-family', 'Inter, sans-serif').attr('opacity', 0)
      .text('converging');
  }, []);

  const updateFn = useCallback((svg, s) => {
    const g = svg.select('.chart');

    if (s >= 1) {
      const path = g.select('.loss-path');
      const totalLength = path.node()?.getTotalLength() ?? 0;
      path.attr('opacity', 1)
        .transition().duration(1200).ease(easeQuadInOut)
        .attr('stroke-dashoffset', 0);
    } else {
      const path = g.select('.loss-path');
      const totalLength = path.node()?.getTotalLength() ?? 0;
      path.attr('opacity', 0).attr('stroke-dashoffset', totalLength);
    }

    if (s >= 3) {
      g.select('.end-dot').transition().duration(300).attr('opacity', 1)
        .attr('r', 7).transition().duration(300).attr('r', 5);
      g.select('.end-label').transition().duration(300).attr('opacity', 1);
    } else {
      g.select('.end-dot').attr('opacity', 0);
      g.select('.end-label').attr('opacity', 0);
    }
  }, []);

  const svgRef = useDiagramSetup({ initFn, updateFn, step });
  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
}
