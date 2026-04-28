import { useState, useCallback, useEffect, useRef } from 'react';
import { useTypewriter } from './hooks/useTypewriter';
// NOTE: keyboard arrow navigation lives in main.jsx (direct lenis reference, no React lifecycle)
import {
  IntroDiagram, TokenizationDiagram, EmbeddingsDiagram, AttentionDiagram,
  FeedForwardDiagram, BlockDiagram, GenerationDiagram, TrainingDiagram,
} from './components/diagrams/index';
import { ChapterNav, MobileNav } from './components/ProgressNav/ProgressNav';
import { CodeBlock } from './components/CodeBlock/CodeBlock';
import { useScrollama } from './hooks/useScrollama';
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

function findSnippet(id) {
  return codeBlocks.find((b) => b.id === id) ?? codeBlocks[0];
}

const SCROLL_STEPS = storySections.flatMap((section, sIdx) =>
  section.steps.map((text, stepIdx) => ({
    section,
    sectionIndex: sIdx,
    stepIndex: stepIdx + 1,
    isFirst: stepIdx === 0,
    text,
  }))
);

export default function App() {
  const [activeGlobal, setActiveGlobal] = useState(-1);
  const [expandedSteps, setExpandedSteps] = useState({});
  const [prevSection, setPrevSection] = useState(null);
  const [isCrossfading, setIsCrossfading] = useState(false);
  const crossfadeTimerRef = useRef(null);
  const prevSectionIdRef = useRef(null);
  const scrollProgress = useScrollProgress();
  const { displayed: heroLines, activeLine: heroActiveLine, done: heroDone } =
    useTypewriter(['How Transformers', 'Are Built']);

  const onStepEnter = useCallback(({ index }) => setActiveGlobal(index), []);
  useScrollama({ step: '.story-step', offset: 0.5, onStepEnter });

  // Keep main.jsx keyboard handler in sync with the active step
  useEffect(() => {
    window.__activeStep = activeGlobal;
    // Also sync __targetStep so Scrollama re-anchors it after natural scrolling
    if (activeGlobal >= 0) window.__targetStep = activeGlobal;
  }, [activeGlobal]);

  const current = activeGlobal >= 0 ? SCROLL_STEPS[activeGlobal] : null;
  const section = current?.section ?? storySections[0];

  // Crossfade: when section changes, keep old diagram visible while new one fades in
  useEffect(() => {
    if (prevSectionIdRef.current && prevSectionIdRef.current !== section.id) {
      const prev = storySections.find((s) => s.id === prevSectionIdRef.current);
      setPrevSection(prev ?? null);
      setIsCrossfading(true);
      clearTimeout(crossfadeTimerRef.current);
      crossfadeTimerRef.current = setTimeout(() => {
        setPrevSection(null);
        setIsCrossfading(false);
      }, 420);
    }
    prevSectionIdRef.current = section.id;
  }, [section.id]);
  const stepIndex = current?.stepIndex ?? 0;
  const sectionIndex = current?.sectionIndex ?? -1;
  const DiagramComponent = DIAGRAM_MAP[section.id];

  const toggleExpand = (key) =>
    setExpandedSteps((prev) => ({ ...prev, [key]: !prev[key] }));

  // Scroll to a specific global step index via Lenis (used by nav clicks)
  const scrollToStep = useCallback((idx) => {
    const clamped = Math.max(0, Math.min(SCROLL_STEPS.length - 1, idx));
    const el = document.querySelectorAll('.story-step')[clamped];
    if (!el) return;
    const lenis = window.__lenis;
    if (lenis) {
      const stepHeight = el.offsetHeight;
      const topOffset = Math.max(0, (window.innerHeight - stepHeight) / 2);
      lenis.scrollTo(Math.max(0, el.getBoundingClientRect().top + window.scrollY - topOffset), { duration: 1.0 });
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const goToSection = useCallback((sIdx) => {
    const target = SCROLL_STEPS.findIndex((s) => s.sectionIndex === sIdx);
    scrollToStep(target);
  }, [scrollToStep]);

  return (
    <>
      <div className="top-bar" style={{ transform: `scaleX(${scrollProgress})` }} />

      <ChapterNav
        sections={storySections}
        currentSection={sectionIndex}
        currentSubStep={stepIndex - 1}
        onChapterClick={(sIdx) => {
          const target = SCROLL_STEPS.findIndex((s) => s.sectionIndex === sIdx);
          scrollToStep(target);
        }}
        onSubStepClick={(sIdx, stepIdx) => {
          const target = SCROLL_STEPS.findIndex(
            (s) => s.sectionIndex === sIdx && s.stepIndex === stepIdx + 1
          );
          scrollToStep(target);
        }}
      />

      <main className="experience-shell">

        {/* ── LEFT: scrolling narrative + inline code ── */}
        <div className="story-column">
          <div className="story-hero">
            <h1 className="story-hero-title" aria-label="How Transformers Are Built">
              {heroLines.map((text, i) => (
                <span key={i} className="typewriter-line">
                  {text || ' '}
                  {heroActiveLine === i && <span className="typewriter-cursor" aria-hidden="true" />}
                  {heroDone && i === heroLines.length - 1 && <span className="typewriter-cursor is-done" aria-hidden="true" />}
                </span>
              ))}
            </h1>
            <p className={`story-hero-sub${heroDone ? ' is-visible' : ''}`}>Scroll to explore the architecture behind GPT — from raw text to generated language.</p>
            <div className="hero-scroll-hint">
              <span className="scroll-hint-line" />
              <span className="scroll-hint-text">scroll</span>
            </div>
          </div>

          {SCROLL_STEPS.map((s, i) => {
            const stepSnippet = s.section.snippetId ? findSnippet(s.section.snippetId) : null;
            const expandKey = `${s.section.id}-${s.stepIndex}`;
            const isExpanded = !!expandedSteps[expandKey];

            return (
              <div
                key={expandKey}
                className={`story-step${activeGlobal === i ? ' is-active' : ''}`}
              >
                {s.isFirst && (
                  <div className="section-header">
                    <span className={`eyebrow ${s.section.accent}`}>{s.section.eyebrow}</span>
                    <h2 className="panel-title">{s.section.title}</h2>
                  </div>
                )}

                <p className="step-caption">{s.text}</p>

                {/* Inline code snippet */}
                {stepSnippet && (
                  <div className="step-code">
                    <div className="step-code-header">
                      <div className="window-chrome">
                        <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
                      </div>
                      <span className="step-code-title">{stepSnippet.title}</span>
                      <button
                        className="expand-btn"
                        onClick={() => toggleExpand(expandKey)}
                        aria-label="Toggle code"
                      >{isExpanded ? '−' : '+'}</button>
                    </div>
                    <div className={`step-code-body${isExpanded ? ' is-expanded' : ''}`}>
                      <CodeBlock code={stepSnippet.code} />
                    </div>
                  </div>
                )}

                {s.stepIndex === s.section.steps.length && (
                  <>
                    <div className="panel-stats">
                      {s.section.stats.map((st) => (
                        <div key={st.label} className="stat-chip">
                          <span className="stat-value">{st.value}</span>
                          <span className="stat-label">{st.label}</span>
                        </div>
                      ))}
                    </div>
                    <blockquote className="panel-callout">{s.section.callout}</blockquote>
                  </>
                )}
              </div>
            );
          })}

          <div className="story-end">
            <p>You've seen the full transformer stack.</p>
            <p className="story-end-sub">Tokens → Embeddings → Attention → FFN → Generation → Training.</p>
          </div>
        </div>

        {/* ── RIGHT: sticky diagram only — full height ── */}
        <aside className="diagram-column">
          <div className="diagram-frame">
            <div className="diagram-label">
              <span className={`diagram-section-badge ${section.accent}`}>{section.id}</span>
              <div className="diagram-step-pips">
                {Array.from({ length: section.steps.length }, (_, i) => (
                  <span key={i} className={`step-pip${stepIndex > i ? ' is-filled' : ''}`} />
                ))}
              </div>
            </div>
            <div className="diagram-canvas">
              {isCrossfading && prevSection && (() => {
                const PrevDiagram = DIAGRAM_MAP[prevSection.id];
                return PrevDiagram ? (
                  <div key={`${prevSection.id}-exit`} className="diagram-canvas-inner is-exiting">
                    <PrevDiagram step={0} />
                  </div>
                ) : null;
              })()}
              <div key={section.id} className="diagram-canvas-inner">
                {DiagramComponent && <DiagramComponent step={stepIndex} />}
              </div>
            </div>
          </div>
        </aside>

      </main>

      <MobileNav
        sections={storySections}
        currentSection={sectionIndex}
        onPrev={() => goToSection(Math.max(0, sectionIndex - 1))}
        onNext={() => goToSection(Math.min(storySections.length - 1, sectionIndex + 1))}
      />
    </>
  );
}
