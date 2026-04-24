import { useState, useEffect, useCallback, useRef } from 'react';
import { Scrolly } from './components/Scrolly/Scrolly';
import {
  IntroDiagram, TokenizationDiagram, EmbeddingsDiagram, AttentionDiagram,
  FeedForwardDiagram, BlockDiagram, GenerationDiagram, TrainingDiagram,
} from './components/diagrams/index';
import { ProgressNav } from './components/ProgressNav/ProgressNav';
import { CodeBlock } from './components/CodeBlock/CodeBlock';
import { useScrollProgress } from './hooks/useScrollProgress';
import { storySections } from './data/story';
import { codeBlocks } from './data/codeBlocks';
import './App.css';

const DIAGRAM_MAP = {
  intro: IntroDiagram,
  tokenization: TokenizationDiagram,
  embeddings: EmbeddingsDiagram,
  attention: AttentionDiagram,
  feedforward: FeedForwardDiagram,
  block: BlockDiagram,
  generation: GenerationDiagram,
  training: TrainingDiagram,
};

function findSnippet(snippetId) {
  return codeBlocks.find((b) => b.id === snippetId) ?? codeBlocks[0];
}

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [diagramStep, setDiagramStep] = useState(0);
  const [showFullCode, setShowFullCode] = useState(false);
  const panelRefs = useRef([]);
  const scrollProgress = useScrollProgress();

  useEffect(() => {
    setDiagramStep(0);
    const section = storySections[currentStep];
    if (!section) return;
    const total = section.diagramSteps ?? 0;
    if (total <= 0) return;
    const timers = [];
    for (let i = 1; i <= total; i++) {
      timers.push(setTimeout(() => setDiagramStep(i), i * 1800));
    }
    return () => timers.forEach(clearTimeout);
  }, [currentStep]);

  const handleStepChange = useCallback((idx) => setCurrentStep(idx), []);

  const scrollToSection = useCallback((idx) => {
    panelRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const section = storySections[currentStep];
  const snippet = section?.snippetId ? findSnippet(section.snippetId) : null;
  const DiagramComponent = DIAGRAM_MAP[section?.id];

  return (
    <>
      {/* Top progress bar */}
      <div className="scroll-progress-bar" style={{ transform: `scaleX(${scrollProgress})` }} />

      {/* Section dot nav */}
      <ProgressNav sections={storySections} currentStep={currentStep} onDotClick={scrollToSection} />

      <Scrolly stepSelector=".story-panel" offset={0.45} onStepChange={handleStepChange}>
        {(localStep) => (
          <main className="experience-shell">

            {/* ── Left: scrolling narrative ── */}
            <section className="story-column">
              <div className="story-hero">
                <h1 className="story-hero-title">How Transformers Are Built</h1>
                <p className="story-hero-sub">Scroll to explore the architecture behind GPT — from raw text to generated language.</p>
                <div className="hero-scroll-hint">
                  <span className="scroll-hint-line" />
                  <span className="scroll-hint-text">scroll</span>
                </div>
              </div>

              {storySections.map((sec, i) => (
                <article
                  key={sec.id}
                  ref={(el) => { panelRefs.current[i] = el; }}
                  className={`story-panel${localStep === i ? ' is-active' : ''}`}
                  data-section={sec.id}
                >
                  <span className={`eyebrow ${sec.accent}`}>{sec.eyebrow}</span>
                  <h2 className="panel-title">{sec.title}</h2>
                  <p className="panel-summary">{sec.summary}</p>
                  <div className="panel-stats">
                    {sec.stats.map((s) => (
                      <div key={s.label} className="stat-chip">
                        <span className="stat-value">{s.value}</span>
                        <span className="stat-label">{s.label}</span>
                      </div>
                    ))}
                  </div>
                  <blockquote className="panel-callout">{sec.callout}</blockquote>
                </article>
              ))}

              <div className="story-end">
                <p>You've seen the full transformer stack.</p>
                <p className="story-end-sub">Data → Tokens → Embeddings → Attention → FFN → Generation → Training.</p>
              </div>
            </section>

            {/* ── Right: sticky diagram + code ── */}
            <aside className="diagram-column">
              <div className="diagram-frame">
                <div className="diagram-label">
                  <span className={`diagram-section-badge ${section?.accent}`}>{section?.id ?? 'intro'}</span>
                  <div className="diagram-step-pips">
                    {Array.from({ length: section?.diagramSteps ?? 0 }, (_, i) => (
                      <span
                        key={i}
                        className={`step-pip${diagramStep > i ? ' is-filled' : ''}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="diagram-canvas">
                  {DiagramComponent && <DiagramComponent step={diagramStep} />}
                </div>
              </div>

              {snippet && (
                <div className="code-workspace">
                  <div className="workspace-header">
                    <div className="window-chrome">
                      <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
                    </div>
                    <span className="snippet-title">{snippet.title}</span>
                    <button
                      className="expand-btn"
                      onClick={() => setShowFullCode((v) => !v)}
                      aria-label="Toggle full code"
                    >
                      {showFullCode ? '−' : '+'}
                    </button>
                  </div>
                  <div className={`code-frame${showFullCode ? ' is-expanded' : ''}`}>
                    <CodeBlock code={snippet.code} />
                  </div>
                </div>
              )}
            </aside>

          </main>
        )}
      </Scrolly>
    </>
  );
}
