import { useCallback, useEffect, useRef, useState } from 'react';

function setBeatHash(beatId, method = 'replaceState') {
  window.history[method]({ beatId }, '', `#${encodeURIComponent(beatId)}`);
}

function scrollToBeat(beatId, duration) {
  const element = document.getElementById(beatId);
  if (!element) return;
  const top = element.getBoundingClientRect().top + window.scrollY;
  const offset = Math.max(0, (window.innerHeight - element.offsetHeight) / 2);
  const destination = Math.max(0, top - offset);
  if (window.__lenis) window.__lenis.scrollTo(destination, { duration });
  else if (matchMedia('(prefers-reduced-motion: reduce)').matches) window.scrollTo({ top: destination, behavior: 'auto' });
  else element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function getInitialBeatId(beats) {
  const hashBeatId = decodeURIComponent(window.location.hash.slice(1));
  const savedBeatId = window.sessionStorage.getItem('narrative.beatId');
  return beats.find((beat) => beat.beatId === hashBeatId)?.beatId
    ?? beats.find((beat) => beat.beatId === savedBeatId)?.beatId
    ?? beats[0]?.beatId
    ?? null;
}

export function useNarrativeNavigation(beats, { duration = 1, onRequest, onCancel, onRestore } = {}) {
  const [observedBeatId, setObservedBeatId] = useState(() => getInitialBeatId(beats));
  const [requestedBeatId, setRequestedBeatId] = useState(null);
  const requestedRef = useRef(null);
  const observedRef = useRef(observedBeatId);
  const initializedRef = useRef(false);
  const callbacksRef = useRef({ onRequest, onCancel, onRestore });
  useEffect(() => { callbacksRef.current = { onRequest, onCancel, onRestore }; }, [onRequest, onCancel, onRestore]);
  const cancelRequest = useCallback(() => {
    requestedRef.current = null;
    setRequestedBeatId(null);
    callbacksRef.current.onCancel?.();
  }, []);

  const requestBeat = useCallback((beatId, { pushHistory = true } = {}) => {
    const target = beats.find((beat) => beat.beatId === beatId);
    if (!target) return;
    requestedRef.current = target.beatId;
    setRequestedBeatId(target.beatId);
    callbacksRef.current.onRequest?.(target);
    if (pushHistory) setBeatHash(target.beatId, 'pushState');

    scrollToBeat(target.beatId, duration);
  }, [beats, duration]);

  useEffect(() => {
    if (initializedRef.current) return undefined;
    initializedRef.current = true;
    const initialBeat = beats.find((beat) => beat.beatId === observedRef.current);
    if (!initialBeat) return undefined;
    observedRef.current = initialBeat.beatId;
    callbacksRef.current.onRestore?.(initialBeat);
    if (window.location.hash !== `#${encodeURIComponent(initialBeat.beatId)}`) {
      setBeatHash(initialBeat.beatId);
    }
    const restoreFrame = requestAnimationFrame(() => scrollToBeat(initialBeat.beatId, duration));

    const onHashChange = () => {
      const beatId = decodeURIComponent(window.location.hash.slice(1));
      const target = beats.find((beat) => beat.beatId === beatId);
      if (!target) return;
      requestedRef.current = target.beatId;
      setRequestedBeatId(target.beatId);
      callbacksRef.current.onRequest?.(target);
      scrollToBeat(target.beatId, duration);
    };
    const onResize = () => {
      window.__lenis?.resize();
      scrollToBeat(requestedRef.current ?? observedRef.current, duration);
    };
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('popstate', onHashChange);
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(restoreFrame);
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('popstate', onHashChange);
      window.removeEventListener('resize', onResize);
    };
  }, [beats, duration]);

  const observeBeat = useCallback((beatId) => {
    const observedIndex = beats.findIndex((beat) => beat.beatId === beatId);
    if (observedIndex < 0) return;
    observedRef.current = beatId;
    setObservedBeatId(beatId);
    const requestedIndex = beats.findIndex((beat) => beat.beatId === requestedRef.current);
    const previousIndex = beats.findIndex((beat) => beat.beatId === observedBeatId);
    const reachedRequest = requestedRef.current === beatId;
    const crossedRequest = requestedIndex >= 0 && previousIndex >= 0 &&
      ((requestedIndex > previousIndex && observedIndex > requestedIndex) ||
       (requestedIndex < previousIndex && observedIndex < requestedIndex));
    if (reachedRequest || crossedRequest) {
      requestedRef.current = null;
      setRequestedBeatId(null);
      callbacksRef.current.onCancel?.();
    }
    const currentHash = decodeURIComponent(window.location.hash.slice(1));
    if (currentHash !== beatId) setBeatHash(beatId);
    window.sessionStorage.setItem('narrative.beatId', beatId);
  }, [beats, observedBeatId]);

  useEffect(() => {
    const cancelOnUserScroll = (event) => {
      if (event.type === 'keydown' && !['PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) return;
      cancelRequest();
    };
    window.addEventListener('wheel', cancelOnUserScroll, { passive: true });
    window.addEventListener('touchstart', cancelOnUserScroll, { passive: true });
    window.addEventListener('keydown', cancelOnUserScroll, { capture: true });
    return () => {
      window.removeEventListener('wheel', cancelOnUserScroll);
      window.removeEventListener('touchstart', cancelOnUserScroll);
      window.removeEventListener('keydown', cancelOnUserScroll, { capture: true });
      cancelRequest();
    };
  }, [cancelRequest]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(event.key)) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select, button, a'))) {
        return;
      }

      const currentId = requestedRef.current ?? observedBeatId;
      const currentIndex = Math.max(0, beats.findIndex((beat) => beat.beatId === currentId));
      const delta = ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1;
      const next = beats[Math.max(0, Math.min(beats.length - 1, currentIndex + delta))];
      if (!next) return;
      event.preventDefault();
      requestBeat(next.beatId);
    };

    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true });
  }, [beats, observedBeatId, requestBeat]);

  return { observedBeatId, requestedBeatId, requestBeat, observeBeat, cancelRequest };
}
