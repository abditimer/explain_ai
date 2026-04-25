import { useCallback } from 'react';
import { scaleLinear, line, axisBottom, axisLeft, easeQuadInOut } from 'd3';
import { useDiagramSetup } from './useDiagramSetup';

const W = 480, H = 340;
const MARGIN = { top: 44, right: 40, bottom: 52, left: 56 };
const IW = W - MARGIN.left - MARGIN.right;
const IH = H - MARGIN.top - MARGIN.bottom;

const STEPS_DATA = Array.from({ length: 30 }, (_, i) => ({
  x: i,
  y: 4.2 * Math.exp(-i * 0.12) + 0.8 + Math.sin(i * 1.3) * 0.08,
}));

export function TrainingDiagram({ step = 0 }) {
  const initFn = useCallback((svg) => {
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', '100%');

    svg.append('text').attr('x', W / 2).attr('y', 26)
      .attr('text-anchor', 'middle').attr('fill', '#334155')
      .attr('font-size', 11).attr('font-family', 'Inter, sans-serif').attr('letter-spacing', '0.1em')
      .text('TRAINING: LOSS CURVE');

    const g = svg.append('g').attr('class', 'chart').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    const xScale = scaleLinear().domain([0, STEPS_DATA.length - 1]).range([0, IW]);
    const yScale = scaleLinear().domain([0, 5]).range([IH, 0]);

    // Grid lines
    const gridG = g.append('g').attr('class', 'grid');
    yScale.ticks(4).forEach(val => {
      gridG.append('line')
        .attr('x1', 0).attr('y1', yScale(val)).attr('x2', IW).attr('y2', yScale(val))
        .attr('stroke', '#1e293b').attr('stroke-width', 1).attr('stroke-dasharray', '3,3');
    });

    // Axes
    const xAxisG = g.append('g').attr('class', 'x-axis')
      .attr('transform', `translate(0,${IH})`).attr('opacity', 1)
      .call(axisBottom(xScale).ticks(5));
    xAxisG.selectAll('text').attr('fill', '#64748b').attr('font-size', 11);
    xAxisG.selectAll('line, path').attr('stroke', '#334155');

    const yAxisG = g.append('g').attr('class', 'y-axis').attr('opacity', 1)
      .call(axisLeft(yScale).ticks(4));
    yAxisG.selectAll('text').attr('fill', '#64748b').attr('font-size', 11);
    yAxisG.selectAll('line, path').attr('stroke', '#334155');

    g.append('text').attr('x', IW / 2).attr('y', IH + 42)
      .attr('text-anchor', 'middle').attr('fill', '#64748b')
      .attr('font-size', 11).attr('font-family', 'Inter, sans-serif').text('Training step (thousands)');
    g.append('text').attr('transform', 'rotate(-90)').attr('x', -IH / 2).attr('y', -44)
      .attr('text-anchor', 'middle').attr('fill', '#64748b')
      .attr('font-size', 11).attr('font-family', 'Inter, sans-serif').text('Loss');

    // Loss path
    const lineGen = line().x(d => xScale(d.x)).y(d => yScale(d.y));
    const path = g.append('path').attr('class', 'loss-path').attr('d', lineGen(STEPS_DATA))
      .attr('fill', 'none').attr('stroke', '#f472b6').attr('stroke-width', 2.5).attr('opacity', 0);

    const totalLength = path.node()?.getTotalLength() ?? 0;
    path.attr('stroke-dasharray', totalLength).attr('stroke-dashoffset', totalLength);

    // Endpoint dot + label
    const last = STEPS_DATA[STEPS_DATA.length - 1];
    g.append('circle').attr('class', 'end-dot').attr('cx', xScale(last.x)).attr('cy', yScale(last.y))
      .attr('r', 6).attr('fill', '#34d399').attr('opacity', 0);
    g.append('text').attr('class', 'end-label')
      .attr('x', xScale(last.x) - 8).attr('y', yScale(last.y) - 12)
      .attr('text-anchor', 'end').attr('fill', '#34d399')
      .attr('font-size', 11).attr('font-family', 'Inter, sans-serif').attr('opacity', 0)
      .text('converging ✓');

    // Backprop label
    g.append('text').attr('class', 'backprop-label')
      .attr('x', xScale(8)).attr('y', yScale(2.8) - 14)
      .attr('text-anchor', 'middle').attr('fill', '#fb923c')
      .attr('font-size', 10).attr('font-family', 'Inter, sans-serif').attr('opacity', 0)
      .text('backprop + Adam');
    g.append('line').attr('class', 'backprop-label')
      .attr('x1', xScale(8)).attr('y1', yScale(2.8) - 10)
      .attr('x2', xScale(8)).attr('y2', yScale(2.8))
      .attr('stroke', '#fb923c').attr('stroke-width', 1).attr('stroke-dasharray', '3,2').attr('opacity', 0);
  }, []);

  const updateFn = useCallback((svg, s) => {
    const g = svg.select('.chart');

    if (s >= 1) {
      const path = g.select('.loss-path');
      path.attr('opacity', 1)
        .transition().duration(1400).ease(easeQuadInOut)
        .attr('stroke-dashoffset', 0);
    } else {
      const path = g.select('.loss-path');
      const totalLength = path.node()?.getTotalLength() ?? 0;
      path.attr('opacity', 0).attr('stroke-dashoffset', totalLength);
    }

    g.selectAll('.backprop-label').transition().duration(400).attr('opacity', s >= 2 ? 1 : 0);

    if (s >= 3) {
      g.select('.end-dot').transition().duration(300).attr('opacity', 1)
        .attr('r', 9).transition().duration(300).attr('r', 6);
      g.select('.end-label').transition().duration(300).attr('opacity', 1);
    } else {
      g.select('.end-dot').attr('opacity', 0);
      g.select('.end-label').attr('opacity', 0);
    }
  }, []);

  const svgRef = useDiagramSetup({ initFn, updateFn, step });
  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
}
