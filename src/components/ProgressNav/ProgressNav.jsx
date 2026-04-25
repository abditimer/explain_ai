import './ProgressNav.css';

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
