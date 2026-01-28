import { useTutorialNavigation } from './hooks/useTutorialNavigation';
import { ExplanationPanel } from './components/ExplanationPanel/ExplanationPanel';
import { CodePanel } from './components/CodePanel/CodePanel';

// Mobile-optimized GPT Tutorial
//
// SCREEN SIZE BREAKPOINTS (change "lg:" throughout to adjust):
// - sm: 640px  (phones in landscape)
// - md: 768px  (tablets)
// - lg: 1024px (small laptops) ← CURRENT
// - xl: 1280px (desktops)
// - 2xl: 1536px (large screens)
//
// Below breakpoint: Toggle between explanation/code views
// Above breakpoint: Split screen side-by-side

const GPTTutorial = () => {
  const {
    currentIndex,
    currentSection,
    currentColor,
    highlightId,
    totalSections,
    collapsed,
    showCode,
    setShowCode,
    codeRefs,
    toggleCollapse,
    goNext,
    goPrev
  } = useTutorialNavigation();

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden bg-slate-50">
      <ExplanationPanel
        section={currentSection}
        currentIndex={currentIndex}
        totalSections={totalSections}
        currentColor={currentColor}
        showCode={showCode}
        onShowCode={() => setShowCode(true)}
        onPrev={goPrev}
        onNext={goNext}
      />

      <CodePanel
        showCode={showCode}
        onBack={() => setShowCode(false)}
        currentColor={currentColor}
        highlightId={highlightId}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        codeRefs={codeRefs}
      />
    </div>
  );
};

export default GPTTutorial;
