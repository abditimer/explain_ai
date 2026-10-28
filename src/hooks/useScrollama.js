import { useRef, useEffect } from 'react';
import scrollama from 'scrollama';

export function useScrollama({ step, offset = 0.5, onStepEnter, onStepExit, onStepProgress } = {}) {
  const scrollerRef = useRef(null);
  const onEnterRef = useRef(onStepEnter);
  const onExitRef = useRef(onStepExit);
  const onProgressRef = useRef(onStepProgress);

  useEffect(() => { onEnterRef.current = onStepEnter; }, [onStepEnter]);
  useEffect(() => { onExitRef.current = onStepExit; }, [onStepExit]);
  useEffect(() => { onProgressRef.current = onStepProgress; }, [onStepProgress]);

  useEffect(() => {
    if (!step) return;
    scrollerRef.current = scrollama();
    scrollerRef.current
      .setup({ step, offset })
      .onStepEnter((r) => onEnterRef.current?.(r))
      .onStepExit((r) => onExitRef.current?.(r))
      .onStepProgress((r) => onProgressRef.current?.(r));

    const handleResize = () => scrollerRef.current?.resize();
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
      scrollerRef.current?.destroy();
    };
  }, [step, offset]);
}
