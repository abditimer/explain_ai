import { lazy, Suspense, useState, useCallback, useEffect, useReducer } from 'react';
import { ChapterNav } from './components/ProgressNav/ProgressNav';
import { CodeBlock } from './components/CodeBlock/CodeBlock';
import { useScrollama } from './hooks/useScrollama';
import { useScrollProgress } from './hooks/useScrollProgress';
import { useNarrativeNavigation } from './hooks/useNarrativeNavigation';
import { storySections } from './data/story';
import { codeBlocks } from './data/codeBlocks';
import { EXAMPLE_CANDIDATES, TOY_LOGITS, getToyProbabilities } from './data/generationDemo';
import { ILLUSTRATIVE_ATTENTION_SCORES, ILLUSTRATIVE_ATTENTION_WEIGHTS } from './data/attentionDemo.js';
import {
  initialNarrativeState,
  narrativeReducer,
  initialExperimentState,
  experimentReducer,
} from './state/narrativeState';
import tokenizerDemo from '../docs/code/tokenizer_demo.json';
import './App.css';

const PUBLIC_BASE = import.meta.env.BASE_URL;

const DIAGRAM_MAP = {
  intro: lazy(() => import('./components/diagrams/IntroDiagram').then((module) => ({ default: module.IntroDiagram }))),
  tokenization: lazy(() => import('./components/diagrams/TokenizationDiagram').then((module) => ({ default: module.TokenizationDiagram }))),
  embeddings: lazy(() => import('./components/diagrams/EmbeddingsDiagram').then((module) => ({ default: module.EmbeddingsDiagram }))),
  attention: lazy(() => import('./components/diagrams/AttentionDiagram').then((module) => ({ default: module.AttentionDiagram }))),
  feedforward: lazy(() => import('./components/diagrams/FeedForwardDiagram').then((module) => ({ default: module.FeedForwardDiagram }))),
  block: lazy(() => import('./components/diagrams/BlockDiagram').then((module) => ({ default: module.BlockDiagram }))),
  generation: lazy(() => import('./components/diagrams/GenerationDiagram').then((module) => ({ default: module.GenerationDiagram }))),
  training: lazy(() => import('./components/diagrams/TrainingDiagram').then((module) => ({ default: module.TrainingDiagram }))),
};

const DIAGRAM_OBJECT_IDS = {
  intro: ['sentence.prefix', 'sentence.missing-continuation', 'sentence.candidates', 'sentence.candidate.1', 'sentence.candidate.2', 'sentence.candidate.3'],
  tokenization: ['tokens.pieces', 'tokens.ids'],
  embeddings: ['representations.token', 'representations.position', 'representations.sum'],
  attention: ['attention.scores', 'attention.mask', 'attention.weights', 'attention.output'],
  feedforward: ['feedforward.input', 'feedforward.hidden', 'feedforward.output'],
  block: ['block.residual.attention', 'block.residual.feedforward'],
  generation: ['generation.logits', 'generation.selection', 'generation.appended-token'],
  training: ['training.loss', 'training.gradients', 'training.update'],
};

function findSnippet(id) {
  return codeBlocks.find((b) => b.id === id) ?? null;
}

function getDiagramDescription(sectionId, stepIndex, progress, experimentState) {
  const pieces = tokenizerDemo.token_pieces;
  const ids = tokenizerDemo.token_ids;
  const tokenPairs = pieces.map((piece, index) => `${JSON.stringify(piece)}, ID ${ids[index]}`).join('; ');

  switch (sectionId) {
    case 'intro':
      return stepIndex >= 2
        ? 'The sentence “The cat sat on the” ends with an open continuation. Three visible editorial examples are “ mat”, “ floor”, and “ sofa”; their colors are decorative, and they are not model predictions.'
        : 'The sentence “The cat sat on the” ends with an open continuation slot.';
    case 'tokenization':
      return `The recorded GPT-2 token pieces and vocabulary IDs are: ${tokenPairs}. A visible space marker denotes the leading space in each later piece. IDs label vocabulary entries; they do not measure meaning.`;
    case 'embeddings':
      return `For the exact prefix token/ID pairs ${tokenPairs}, each position shows a token embedding row, a position embedding row, and their elementwise sum. Each vector has 768 dimensions; the drawn bars show selected schematic dimensions only and are not model values. Labels and plus/equal signs identify the rows; color is not the only distinction.`;
    case 'attention': {
      const queryTokens = pieces.slice(0, 3);
      const queryIds = ids.slice(0, 3);
      const selectedIndex = Math.max(0, queryIds.indexOf(experimentState.selectedTokenId ?? queryIds[1]));
      const selectedPiece = queryTokens[selectedIndex];
      if (stepIndex <= 1) {
        return `Each token position is projected to a query, key, and value vector. Queries compare with permitted keys; masked softmax weights mix the value vectors. The SVG overview also shows concatenated heads, output projection, and the residual addition. This is a conceptual overview, not a model output.`;
      }
      const scorePhase = Math.max(0, Math.min(1, stepIndex - 2 + progress));
      const maskPhase = Math.max(0, Math.min(1, stepIndex - 3 + progress));
      const weightPhase = Math.max(0, Math.min(1, stepIndex - 4 + progress));
      const selectedScores = ILLUSTRATIVE_ATTENTION_SCORES[selectedIndex].map((value, index) => {
        const masked = index > selectedIndex && maskPhase > 0.5;
        return masked ? 'minus infinity' : value.toFixed(1);
      }).join(', ');
      const selectedWeights = ILLUSTRATIVE_ATTENTION_WEIGHTS[selectedIndex].map((value) => value.toFixed(2)).join(', ');
      let phase;
      if (scorePhase < 1) {
        phase = `The score matrix is appearing. The selected row's illustrative dot-product scores are ${selectedScores}.`;
      } else if (weightPhase > 0.25) {
        phase = `After dividing permitted scores by the square root of 64 and applying softmax, the selected row shows illustrative weights ${selectedWeights}, which sum to one.`;
      } else if (maskPhase >= 1) {
        phase = `The selected row's causal mask permits the first ${selectedIndex + 1} positions and excludes later positions. Its displayed values are ${selectedScores}; excluded cells are labelled minus infinity.`;
      } else if (maskPhase > 0) {
        phase = `The selected row currently shows scores ${selectedScores}; the causal mask is being revealed. It permits the first ${selectedIndex + 1} positions and excludes later positions.`;
      } else {
        phase = `The selected row shows illustrative dot-product scores ${selectedScores}; the next beat applies the causal mask to exclude future positions.`;
      }
      return `The matrix rows are query tokens and columns are key tokens, ordered ${queryTokens.map((piece) => JSON.stringify(piece)).join(', ')}. The selected query is ${JSON.stringify(selectedPiece)}, ID ${queryIds[selectedIndex]}. ${phase} Values are illustrative, not model outputs; numeric labels accompany the cell shading.`;
    }
    case 'feedforward':
      return 'For each token position independently, the feed-forward path expands a 768-dimensional vector to 3,072, applies GELU, then projects back to 768. The input, hidden width, output, and operations are named in text; the illustration does not use color as the only cue.';
    case 'block':
      return stepIndex >= 4
        ? 'A schematic pullback shows the same token position passing through 12 separately parameterised blocks. The pink path tracks that position, not its numeric values; each block transforms its 768-dimensional representation.'
        : 'One block applies LayerNorm, attention, dropout, then adds the original input through a residual connection. It then applies a second LayerNorm, feed-forward network, dropout, and another residual addition. A label identifies this as one of 12 separately parameterised blocks.';
    case 'generation':
      return `The five-token context is ${tokenPairs}. A three-example toy chart uses logits ${TOY_LOGITS.join(', ')} for editorial candidate tokens ${EXAMPLE_CANDIDATES.map((candidate) => `${JSON.stringify(candidate.text)}, ID ${candidate.tokenId}`).join('; ')}. This is not the model's full 50,257-token output. The current temperature changes the illustrative probabilities. Any appended continuation is the reader’s explicit choice, with its token ID announced separately.`;
    case 'training':
      return 'A schematic line chart has training step on the horizontal axis and loss on the vertical axis; the drawn loss trends downward but is not recorded training data. Text labels identify the curve as illustrative and mark the backpropagation and Adam update stage.';
    default:
      return '';
  }
}

const SCROLL_STEPS = storySections.flatMap((section, sIdx) =>
  section.beats.map((beat, stepIdx) => ({
    section,
    sceneId: section.id,
    beatId: beat.id,
    sectionIndex: sIdx,
    stepIndex: stepIdx + 1,
    isFirst: stepIdx === 0,
    text: beat.text,
  }))
);

const NAVIGATION_BEATS = SCROLL_STEPS.map(({ sceneId, beatId }) => ({ sceneId, beatId }));

function getInitialBeatIndex() {
  const hashBeatId = decodeURIComponent(window.location.hash.slice(1));
  const savedBeatId = window.sessionStorage.getItem('narrative.beatId');
  const restored = SCROLL_STEPS.findIndex((beat) => beat.beatId === hashBeatId);
  if (restored >= 0) return restored;
  const saved = SCROLL_STEPS.findIndex((beat) => beat.beatId === savedBeatId);
  if (saved >= 0) return saved;
  return new URLSearchParams(window.location.search).get('presentation') === '1' ? 0 : -1;
}

export default function App() {
  const [activeGlobal, setActiveGlobal] = useState(getInitialBeatIndex);
  const [visitedScenes, setVisitedScenes] = useState(() => new Set([
    activeGlobal >= 0 ? SCROLL_STEPS[activeGlobal].sceneId : storySections[0].id,
  ]));
  const [presentationMode, setPresentationMode] = useState(() =>
    new URLSearchParams(window.location.search).get('presentation') === '1'
  );
  const [narrativeState, dispatchNarrative] = useReducer(narrativeReducer, initialNarrativeState);
  const [experimentState, dispatchExperiment] = useReducer(experimentReducer, initialExperimentState);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const markSceneVisited = useCallback((sceneId) => {
    setVisitedScenes((previous) => {
      if (previous.has(sceneId)) return previous;
      const next = new Set(previous);
      next.add(sceneId);
      return next;
    });
  }, []);
  const onNavigationRequest = useCallback(({ sceneId, beatId }) => {
    dispatchNarrative({ type: 'narrative/request', sceneId, beatId });
    markSceneVisited(sceneId);
    if (presentationMode) {
      const requestedIndex = SCROLL_STEPS.findIndex((beat) => beat.beatId === beatId);
      if (requestedIndex >= 0) setActiveGlobal(requestedIndex);
    }
  }, [dispatchNarrative, markSceneVisited, presentationMode]);
  const onNavigationRestore = useCallback(({ sceneId, beatId }) => {
    dispatchNarrative({ type: 'narrative/restore', sceneId, beatId });
  }, []);
  const onNavigationCancel = useCallback(() => {
    dispatchNarrative({ type: 'narrative/cancel-request' });
  }, []);
  const { observeBeat, requestBeat } = useNarrativeNavigation(NAVIGATION_BEATS, {
    onRequest: onNavigationRequest,
    onCancel: onNavigationCancel,
    onRestore: onNavigationRestore,
  });
  const scrollProgress = useScrollProgress();
  const diagramProgress = prefersReducedMotion ? 1 : narrativeState.transitionProgress;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', syncPreference);
    return () => mediaQuery.removeEventListener('change', syncPreference);
  }, []);

  const onStepEnter = useCallback(({ index }) => {
    setActiveGlobal(index);
    const target = SCROLL_STEPS[index];
    if (target) {
      observeBeat(target.beatId);
      markSceneVisited(target.sceneId);
      dispatchNarrative({
        type: 'narrative/seek',
        sceneId: target.sceneId,
        beatId: target.beatId,
        transitionProgress: 1,
      });
    }
  }, [dispatchNarrative, markSceneVisited, observeBeat]);
  const onStepProgress = useCallback(({ index, progress }) => {
    const target = SCROLL_STEPS[index];
    if (target) dispatchNarrative({ type: 'narrative/progress', sceneId: target.sceneId, beatId: target.beatId, progress });
  }, [dispatchNarrative]);
  useScrollama({ step: '.story-step', offset: 0.5, onStepEnter, onStepProgress });

  useEffect(() => {
    const onResize = () => window.requestAnimationFrame(() => window.__lenis?.resize());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const syncFromHash = () => {
      const beatId = decodeURIComponent(window.location.hash.slice(1));
      const index = SCROLL_STEPS.findIndex((beat) => beat.beatId === beatId);
      if (index >= 0) setActiveGlobal(index);
    };
    window.addEventListener('hashchange', syncFromHash);
    window.addEventListener('popstate', syncFromHash);
    return () => {
      window.removeEventListener('hashchange', syncFromHash);
      window.removeEventListener('popstate', syncFromHash);
    };
  }, []);

  const current = activeGlobal >= 0 ? SCROLL_STEPS[activeGlobal] : null;
  const section = current?.section ?? storySections[0];
  const stepIndex = current?.stepIndex ?? 0;
  const sectionIndex = current?.sectionIndex ?? -1;
  const currentOperation = current ? section.operations?.[current.beatId] : null;
  const sectionCode = findSnippet(currentOperation?.snippetId ?? section.snippetId);
  const presentationBeatId = current?.beatId;

  const activeDiagramLabel = (() => {
    const parts = [`Diagram: ${section.title}. ${section.summary}`, getDiagramDescription(section.id, stepIndex, diagramProgress, experimentState), current ? `Current step: ${current.text}` : ''];
    if (section.id === 'attention') {
      const selectedIndex = tokenizerDemo.token_ids.slice(0, 3).indexOf(experimentState.selectedTokenId ?? tokenizerDemo.token_ids[1]);
      const selectedPiece = tokenizerDemo.token_pieces[selectedIndex] ?? tokenizerDemo.token_pieces[1];
      parts.push(`Query token ${JSON.stringify(selectedPiece)} is selected. Attention values are illustrative, not model outputs.`);
    }
    if (section.id === 'generation') {
      const probabilities = getToyProbabilities(experimentState.temperature)
        .map((probability, index) => `${JSON.stringify(EXAMPLE_CANDIDATES[index].text)}: ${(probability * 100).toFixed(1)} percent`)
        .join('; ');
      parts.push(`Toy logits ${TOY_LOGITS.join(', ')} at temperature ${experimentState.temperature.toFixed(1)} give ${probabilities}. These are illustrative, not model outputs.`);
      const selected = EXAMPLE_CANDIDATES.find((candidate) => candidate.tokenId === experimentState.selectedContinuationTokenId);
      if (selected) parts.push(`The reader appended the example token ${JSON.stringify(selected.text)} with ID ${selected.tokenId}; the updated context is ${JSON.stringify(`${tokenizerDemo.input_text}${selected.text}`)}.`);
    }
    return parts.filter(Boolean).join(' ');
  })();

  const setPresentationUrl = useCallback((enabled) => {
    const url = new URL(window.location.href);
    if (enabled) url.searchParams.set('presentation', '1');
    else url.searchParams.delete('presentation');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    setPresentationMode(enabled);
  }, []);

  const navigatePresentation = useCallback((direction) => {
    const from = activeGlobal < 0 ? 0 : activeGlobal;
    const destinationIndex = Math.max(0, Math.min(SCROLL_STEPS.length - 1, from + direction));
    const destination = SCROLL_STEPS[destinationIndex];
    if (!destination) return;
    setActiveGlobal(destinationIndex);
    dispatchNarrative({ type: 'narrative/request', sceneId: destination.sceneId, beatId: destination.beatId });
    requestBeat(destination.beatId);
  }, [activeGlobal, dispatchNarrative, requestBeat]);

  const replayPresentation = useCallback(() => {
    const firstBeat = SCROLL_STEPS[0];
    setActiveGlobal(0);
    dispatchNarrative({ type: 'narrative/request', sceneId: firstBeat.sceneId, beatId: firstBeat.beatId });
    requestBeat(firstBeat.beatId);
  }, [dispatchNarrative, requestBeat]);

  useEffect(() => {
    if (!presentationMode || !presentationBeatId) return undefined;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(presentationBeatId)?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center',
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [presentationMode, presentationBeatId, prefersReducedMotion]);

  useEffect(() => {
    if (!currentOperation?.transitionToDiagram || prefersReducedMotion || window.matchMedia('(max-width: 900px)').matches) return undefined;
    const sourceLine = document.getElementById(`${currentOperation.id}-line-${currentOperation.lines[0]}`);
    const targetObject = Array.from(document.querySelectorAll('[data-object-id]'))
      .find((element) => element.dataset.objectId === currentOperation.diagramObjectIds[0]);
    if (!sourceLine || !targetObject) return undefined;

    const sourceRect = sourceLine.getBoundingClientRect();
    const targetRect = targetObject.getBoundingClientRect();
    if (!sourceRect.width || !sourceRect.height || !targetRect.width || !targetRect.height) return undefined;
    const ghost = sourceLine.cloneNode(true);
    ghost.removeAttribute('id');
    ghost.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
    ghost.setAttribute('aria-hidden', 'true');
    ghost.classList.add('code-transition-ghost');
    Object.assign(ghost.style, {
      position: 'fixed',
      left: `${sourceRect.left}px`,
      top: `${sourceRect.top}px`,
      width: `${sourceRect.width}px`,
      height: `${sourceRect.height}px`,
      zIndex: '300',
      margin: '0',
      overflow: 'hidden',
      pointerEvents: 'none',
      transformOrigin: 'top left',
    });
    document.body.append(ghost);
    const dx = targetRect.left + targetRect.width / 2 - sourceRect.left;
    const dy = targetRect.top + targetRect.height / 2 - sourceRect.top;
    const animation = ghost.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 0.95 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.45)`, opacity: 0 },
    ], { duration: 440, easing: 'cubic-bezier(.2,.7,.2,1)' });
    animation.onfinish = () => ghost.remove();
    return () => {
      animation.cancel();
      ghost.remove();
    };
  }, [currentOperation, prefersReducedMotion]);

  return (
    <>
      <div className="top-bar" style={{ transform: `scaleX(${scrollProgress})` }} />

      <nav className={`presentation-controls${presentationMode ? ' is-active' : ''}`} aria-label="Presentation controls">
        {presentationMode ? (
          <>
            <span className="presentation-position" role="status" aria-live="polite">
              {section.title} · Beat {Math.max(1, stepIndex)} of {section.beats.length}
            </span>
            <button type="button" onClick={() => navigatePresentation(-1)} disabled={activeGlobal <= 0}>Previous</button>
            <button type="button" onClick={() => navigatePresentation(1)} disabled={activeGlobal >= SCROLL_STEPS.length - 1}>Next</button>
            <button type="button" onClick={replayPresentation} aria-label="Replay presentation from the first beat">Replay</button>
            <button type="button" className="presentation-exit" onClick={() => setPresentationUrl(false)}>Exit presentation</button>
          </>
        ) : (
          <button type="button" onClick={() => {
            if (activeGlobal < 0) navigatePresentation(0);
            setPresentationUrl(true);
          }}>Presentation mode</button>
        )}
      </nav>

      <ChapterNav
        sections={storySections}
        currentSection={sectionIndex}
        currentSubStep={stepIndex - 1}
        onChapterClick={(sIdx) => {
          const target = SCROLL_STEPS.findIndex((s) => s.sectionIndex === sIdx);
          if (target >= 0) {
            const destination = SCROLL_STEPS[target];
            dispatchNarrative({ type: 'narrative/request', sceneId: destination.sceneId, beatId: destination.beatId });
            requestBeat(destination.beatId);
          }
        }}
        onSubStepClick={(sIdx, stepIdx) => {
          const target = SCROLL_STEPS.findIndex(
            (s) => s.sectionIndex === sIdx && s.stepIndex === stepIdx + 1
          );
          if (target >= 0) {
            const destination = SCROLL_STEPS[target];
            dispatchNarrative({ type: 'narrative/request', sceneId: destination.sceneId, beatId: destination.beatId });
            requestBeat(destination.beatId);
          }
        }}
      />

      <main className={`experience-shell${presentationMode ? ' is-presentation' : ''}`}>

        {/* ── LEFT: scrolling narrative + inline code ── */}
        <div className="story-column">
          <div className="story-hero">
            <h1 className="story-hero-title">How a Machine<br />Continues Text</h1>
            <p className="story-hero-sub">Follow text through a GPT-2 Small–style teaching model—with a few implementation differences—from token IDs to a next-token choice.</p>
            <div className="hero-scroll-hint">
              <span className="scroll-hint-line" />
              <span className="scroll-hint-text">scroll</span>
            </div>
          </div>

          {SCROLL_STEPS.map((s, i) => {
            const operation = s.section.operations?.[s.beatId];
            const stepSnippet = findSnippet(operation?.snippetId ?? s.section.snippetId);
            const sourceRange = operation?.lines ?? (stepSnippet ? [stepSnippet.startLine, stepSnippet.endLine] : null);

            return (
              <div
                key={s.beatId}
                id={s.beatId}
                className={`story-step${activeGlobal === i ? ' is-active is-stage-active' : ''}`}
              >
                {s.isFirst && (
                  <div className="section-header">
                    <span className={`eyebrow ${s.section.accent}`}>{s.section.eyebrow}</span>
                    <h2 className="panel-title">{s.section.title}</h2>
                  </div>
                )}

                <p className="step-caption">{s.text}</p>

                {stepSnippet && (
                  <p className="step-code-reference" data-code-expression-id={operation?.id ?? stepSnippet.expressionId}>
                    Simplified code excerpt · {operation?.label ?? stepSnippet.title}{' '}
                    <a href={`${PUBLIC_BASE}implementation.html#L${sourceRange[0]}`}>
                      View source lines {sourceRange[0]}{sourceRange[1] !== sourceRange[0] ? `–${sourceRange[1]}` : ''} ↗
                    </a>
                  </p>
                )}

                {s.stepIndex === s.section.beats.length && (
                  <>
                    <div className="panel-stats">
                      {s.section.stats.map((st) => (
                        <div key={st.label} className="stat-chip" data-code-expression-id={s.section.operations?.[s.beatId]?.id ?? findSnippet(s.section.snippetId)?.expressionId ?? ''}>
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
            <p className="story-end-kicker">THE LOOP, COMPLETE</p>
            <h2>A small choice begins the story again.</h2>
            <p>A word arrives as tokens, gathers context through attention, passes through repeated transformations, and leaves the model as a distribution of possible next tokens. The reader’s choice closes this example; a language model would draw from the distribution and continue.</p>
            <p className="story-end-sub">TOKENS → REPRESENTATIONS → ATTENTION → BLOCKS → SCORES → NEXT TOKEN</p>
            <nav className="story-end-links" aria-label="Continue exploring">
              <a href="#generation.beat-01">Return to next-token selection ↑</a>
              <a href="#training.beat-01">Explore how models learn ↗</a>
              <a href={`${PUBLIC_BASE}implementation.html`}>Read the complete implementation ↗</a>
              <a href={`${PUBLIC_BASE}sources.html`}>Sources and simplifications ↗</a>
            </nav>
            <p className="story-end-credit">An independent teaching project · Made by Abdi</p>
          </div>
        </div>

        <aside className="code-column" aria-label="Persistent Python implementation">
          <div className="code-surface">
            <div className="code-surface-heading">
              <span>Implementation</span>
              <a href={`${PUBLIC_BASE}implementation.html`}>Open full source ↗</a>
            </div>
            {codeBlocks.filter((block) => block.id === sectionCode?.id).map((block) => (
              <section
                className="persistent-code-block is-active"
                id={`code-${block.id}`}
                key={block.id}
                data-code-expression-id={currentOperation?.id ?? block.expressionId}
                data-tensor-shape={currentOperation?.tensorShape ?? ''}
                aria-labelledby={`code-title-${block.id}`}
              >
                <h2 id={`code-title-${block.id}`}>{block.title}</h2>
                {currentOperation && <p className="code-operation-label">{currentOperation.label} · {currentOperation.tensorShape}</p>}
                <CodeBlock
                  code={block.code}
                  startLine={block.startLine}
                  expressionId={block.expressionId}
                  operationId={currentOperation?.id}
                  activeRange={currentOperation?.lines ?? [block.startLine, block.endLine]}
                />
              </section>
            ))}
          </div>
        </aside>

        {/* ── RIGHT: sticky diagram only — full height ── */}
        <aside className="diagram-column">
          <div
            className="diagram-frame"
            data-scene-id={narrativeState.sceneId}
            data-beat-id={narrativeState.beatId}
            data-requested-scene-id={narrativeState.requestedSceneId ?? ''}
            data-requested-beat-id={narrativeState.requestedBeatId ?? ''}
            data-transition-progress={narrativeState.transitionProgress}
            data-diagram-object-ids={(currentOperation?.diagramObjectIds ?? DIAGRAM_OBJECT_IDS[section.id])?.join(' ')}
            data-code-expression-id={currentOperation?.id ?? sectionCode?.expressionId ?? ''}
          >
            <div className="diagram-label">
              <span className={`diagram-section-badge ${section.accent}`}>{section.id}</span>
              <div className="diagram-step-pips">
                {section.beats.map((beat, i) => (
                  <span key={beat.id} data-beat-id={beat.id} className={`step-pip${stepIndex > i ? ' is-filled' : ''}`} />
                ))}
              </div>
            </div>
            {section.id === 'attention' && stepIndex > 1 && (
              <div className="attention-token-controls" role="group" aria-label="Choose an attention query token">
                <span>Choose a query</span>
                {tokenizerDemo.token_pieces.slice(0, 3).map((piece, index) => {
                  const tokenId = tokenizerDemo.token_ids[index];
                  const displayPiece = piece.startsWith(' ') ? `␠${piece.slice(1)}` : piece;
                  return (
                    <button
                      type="button"
                      key={tokenId}
                      aria-label={`Use query token ${JSON.stringify(piece)}, ID ${tokenId}`}
                      aria-pressed={experimentState.selectedTokenId === tokenId || (experimentState.selectedTokenId == null && index === 1)}
                      onClick={() => dispatchExperiment({ type: 'experiment/select-token', tokenId })}
                    >
                      {displayPiece}
                    </button>
                  );
                })}
              </div>
            )}
            {section.id === 'generation' && stepIndex > 1 && (
              <div className="generation-controls">
                <label htmlFor="generation-temperature">Temperature <output>{experimentState.temperature.toFixed(1)}</output></label>
                <input
                  id="generation-temperature"
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={experimentState.temperature}
                  aria-valuetext={`${experimentState.temperature.toFixed(1)}; lower values sharpen the toy distribution, higher values flatten it`}
                  aria-describedby="temperature-explanation"
                  onChange={(event) => dispatchExperiment({ type: 'experiment/set-temperature', temperature: Number(event.target.value) })}
                />
                <p id="temperature-explanation">Lower positive values concentrate this toy distribution; higher values flatten it. These are illustrative scores, not model outputs.</p>
                {stepIndex > 3 && (
                  <div className="continuation-controls" role="group" aria-label="Choose an example next token to append">
                    <span>Choose an example next token</span>
                    {EXAMPLE_CANDIDATES.map((candidate) => (
                      <button
                        type="button"
                        key={candidate.tokenId}
                        aria-pressed={experimentState.selectedContinuationTokenId === candidate.tokenId}
                        onClick={() => dispatchExperiment({ type: 'experiment/select-continuation', tokenId: candidate.tokenId })}
                      >
                        {candidate.text} · ID {candidate.tokenId}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="diagram-canvas">
              <div className="diagram-stage">
                {storySections.filter((diagramSection) => visitedScenes.has(diagramSection.id)).map((diagramSection) => {
                  const DiagramComponent = DIAGRAM_MAP[diagramSection.id];
                  const isActive = diagramSection.id === section.id;
                  return (
                    <div
                      key={diagramSection.id}
                      className={`diagram-canvas-inner${isActive ? ' is-active' : ''}`}
                      aria-hidden={!isActive}
                      role={isActive ? 'img' : undefined}
                      aria-label={isActive ? activeDiagramLabel : undefined}
                      data-scene-id={diagramSection.id}
                      inert={!isActive}
                    >
                      <Suspense fallback={<p className="diagram-loading">Preparing this diagram…</p>}>
                        <DiagramComponent
                          step={isActive ? stepIndex : 0}
                          progress={isActive ? diagramProgress : 0}
                          beatId={isActive ? narrativeState.beatId : null}
                          selectedTokenId={experimentState.selectedTokenId}
                          temperature={experimentState.temperature}
                          selectedContinuationTokenId={experimentState.selectedContinuationTokenId}
                        />
                      </Suspense>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

      </main>
    </>
  );
}
