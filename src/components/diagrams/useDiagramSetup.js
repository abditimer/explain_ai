import { useRef, useEffect } from 'react';
import { select } from 'd3';

export function useDiagramSetup({ initFn, updateFn, step }) {
  const svgRef = useRef(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const svg = select(el);
    svg.selectAll('*').remove();
    initFn(svg);
  }, [initFn]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    updateFn(select(el), step);
  }, [step, updateFn]);

  return svgRef;
}
