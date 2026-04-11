import { useState, useRef, useEffect } from 'react';
import { sections } from '../data/sections';

export function useTutorialNavigation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [collapsed, setCollapsed] = useState({});
  const [showCode, setShowCode] = useState(false);
  const codeRefs = useRef({});

  const currentSection = sections[currentIndex];
  const currentColor = currentSection.color;
  const highlightId = currentSection.highlightSection || currentSection.id;

  const toggleCollapse = (id) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const goNext = () => {
    if (currentIndex < sections.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowCode(false);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowCode(false);
    }
  };

  useEffect(() => {
    if (codeRefs.current[highlightId]) {
      codeRefs.current[highlightId].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentIndex, highlightId]);

  return {
    currentIndex,
    currentSection,
    currentColor,
    highlightId,
    totalSections: sections.length,
    collapsed,
    showCode,
    setShowCode,
    codeRefs,
    toggleCollapse,
    goNext,
    goPrev
  };
}
