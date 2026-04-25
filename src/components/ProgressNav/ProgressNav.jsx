import './ProgressNav.css';

export function ProgressNav({ sections, currentStep, onDotClick }) {
  return (
    <nav className="progress-nav" aria-label="Section navigation">
      {sections.map((sec, i) => (
        <button
          key={sec.id}
          className={`progress-dot${currentStep === i ? ' is-active' : ''}${currentStep > i ? ' is-past' : ''} ${sec.accent}`}
          onClick={() => onDotClick(i)}
          title={sec.title}
          aria-label={`Go to ${sec.title}`}
        >
          <span className="progress-dot-tooltip">{sec.title}</span>
        </button>
      ))}
    </nav>
  );
}
