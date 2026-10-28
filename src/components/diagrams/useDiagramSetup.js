import { useRef, useEffect } from 'react';
import { select } from 'd3-selection';

export function useDiagramSetup({ initFn, updateFn, step }) {
  // React owns the persistent SVG element; D3 owns its contents and derives
  // animated attributes directly from the current, seekable progress value.
  const svgRef = useRef(null);
  const updateRef = useRef(updateFn);
  useEffect(() => { updateRef.current = updateFn; }, [updateFn]);

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
    updateRef.current(select(el), step);
  }, [step, updateFn]);

  return svgRef;
}
