import { useState, useEffect, useRef } from 'react';

export function useTypewriter(lines, { charDelay = 42, lineDelay = 200 } = {}) {
  const [displayed, setDisplayed] = useState(lines.map(() => ''));
  const [activeLine, setActiveLine] = useState(0);
  const [done, setDone] = useState(false);
  const stateRef = useRef({ lineIdx: 0, charIdx: 0 });

  useEffect(() => {
    let timerId;

    const tick = () => {
      const { lineIdx, charIdx } = stateRef.current;
      if (lineIdx >= lines.length) {
        setDone(true);
        setActiveLine(-1);
        return;
      }
      const nextChar = charIdx + 1;
      setDisplayed(prev => {
        const next = [...prev];
        next[lineIdx] = lines[lineIdx].slice(0, nextChar);
        return next;
      });
      if (nextChar >= lines[lineIdx].length) {
        stateRef.current = { lineIdx: lineIdx + 1, charIdx: 0 };
        setActiveLine(lineIdx + 1);
        timerId = setTimeout(tick, lineDelay);
      } else {
        stateRef.current = { lineIdx, charIdx: nextChar };
        timerId = setTimeout(tick, charDelay);
      }
    };

    timerId = setTimeout(tick, 400);
    return () => clearTimeout(timerId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { displayed, activeLine, done };
}
