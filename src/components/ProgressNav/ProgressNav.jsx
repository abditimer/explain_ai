import './ProgressNav.css';

export function MobileNav({ sections, currentSection, onPrev, onNext }) {
  const idx = currentSection >= 0 ? currentSection : 0;
  const section = sections[idx] ?? sections[0];
  const canPrev = idx > 0;
  const canNext = idx < sections.length - 1;

  return (
    <nav className="mobile-nav" aria-label="Section navigation">
      <button
        className="mobile-nav-btn"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Previous section"
      >← Prev</button>
      <span className={`mobile-nav-label ${section.accent}`}>{section.title}</span>
      <button
        className="mobile-nav-btn"
        onClick={onNext}
        disabled={!canNext}
        aria-label="Next section"
      >Next →</button>
    </nav>
  );
}

export function ChapterNav({ sections, currentSection, currentSubStep, onChapterClick, onSubStepClick }) {
  return (
    <nav className="chapter-nav" aria-label="Chapter navigation">
      {sections.map((sec, sIdx) => {
        const isActiveSection = currentSection === sIdx;
        const isPastSection = currentSection > sIdx;

        return (
          <div key={sec.id} className="chapter-group">
            {/* Section row */}
            <button
              className={`chapter-section-item${isActiveSection ? ' is-active' : ''}${isPastSection ? ' is-past' : ''}`}
              onClick={() => onChapterClick(sIdx)}
              title={sec.title}
              aria-label={`Go to section ${sIdx + 1}: ${sec.title}`}
              aria-current={isActiveSection ? 'true' : undefined}
            >
              <span className={`chapter-section-num ${isActiveSection ? sec.accent : ''}`}>
                {sIdx + 1}
              </span>
              <span className={`chapter-section-line ${isActiveSection ? sec.accent : ''}`} />
            </button>

            {/* Sub-step rows */}
            {sec.steps.map((_, stepIdx) => {
              const isActiveSub = isActiveSection && currentSubStep === stepIdx;
              const isPastSub = isPastSection || (isActiveSection && currentSubStep > stepIdx);

              return (
                <button
                  key={stepIdx}
                  className={`chapter-sub-item${isActiveSub ? ' is-active' : ''}${isPastSub ? ' is-past' : ''}`}
                  onClick={() => onSubStepClick(sIdx, stepIdx)}
                  title={`${sIdx + 1}.${stepIdx + 1}`}
                  aria-label={`Go to ${sIdx + 1}.${stepIdx + 1}: ${sec.title}`}
                  aria-current={isActiveSub ? 'true' : undefined}
                >
                  <span className={`chapter-sub-num${isActiveSub ? ' is-active' : ''}${isPastSub ? ' is-past' : ''}`}>
                    {sIdx + 1}.{stepIdx + 1}
                  </span>
                  <span className={`chapter-sub-tick${isActiveSub ? ` is-active ${sec.accent}` : ''}${isPastSub ? ' is-past' : ''}`} />
                </button>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
