# CLAUDE.md — Agent Guide

This is a **Pudding-style scrollytelling website** explaining how GPT transformers are built. Each section pairs a narrative step with an animated D3 diagram and a syntax-highlighted PyTorch code snippet.

---

## Stack

| Tool | Purpose |
|---|---|
| React 19 + Vite | UI and dev server |
| Scrollama | IntersectionObserver step triggers (`useScrollama.js`) |
| Lenis | Smooth scroll — initialised once in `main.jsx`, doesn't break `position:sticky` |
| D3.js | Named imports only (`select`, `scaleLinear`, etc.) — no default import |
| highlight.js | Python syntax highlighting via `hljs.highlight()` + `dangerouslySetInnerHTML` |

---

## Scrollytelling pattern

```
story-column (scrolls)          diagram-column (position: sticky)
──────────────────────          ──────────────────────────────────
.story-hero                     .diagram-frame
.story-panel (step 0)             ├─ .diagram-label (badge + pips)
.story-panel (step 1)             └─ .diagram-canvas  ← D3 SVG here
…                               .code-workspace
.story-panel (step 7)             ├─ .workspace-header (window chrome)
.story-end                        └─ .code-frame  ← <CodeBlock />
```

- **Step triggers**: `.story-panel` elements are Scrollama steps. `onStepEnter` → `currentStep` state in `App.jsx`.
- **Diagram auto-advance**: when `currentStep` changes, `diagramStep` resets to 0 then increments by 1 every 1800ms via `setTimeout` loop. Cleared on next section change.
- **DIAGRAM_MAP**: module-scope object in `App.jsx` mapping `section.id` → diagram component.

---

## File structure

```
src/
  App.jsx                      # DIAGRAM_MAP, currentStep, diagramStep, auto-advance
  App.css                      # All layout styles — no Tailwind used here
  main.jsx                     # Lenis init (autoRaf: true)
  index.css                    # Bare reset only

  data/
    story.js                   # 8 storySections — id, eyebrow, title, summary, accent,
                               #   stats[3], callout, diagramSteps, snippetId
    codeBlocks.js              # PyTorch snippets keyed by id

  hooks/
    useScrollama.js            # Wraps scrollama lifecycle; stable callback refs via useRef
    useScrollProgress.js       # scroll / (scrollHeight - clientHeight) → 0–1

  components/
    Scrolly/Scrolly.jsx        # Render-prop wrapper: children(currentStep)
                               #   accepts onStepChange prop to lift state to App

    CodeBlock/CodeBlock.jsx    # hljs.highlight() → dangerouslySetInnerHTML
                               #   NO highlightElement — avoids double-render warnings

    ProgressNav/ProgressNav.jsx  # Fixed dot nav (right edge), tooltip on hover
    ProgressNav/ProgressNav.css

    diagrams/
      useDiagramSetup.js       # Two-effect hook: init effect (clears + rebuilds SVG),
                               #   update effect (fires on step change)
      IntroDiagram.jsx
      TokenizationDiagram.jsx
      EmbeddingsDiagram.jsx
      AttentionDiagram.jsx
      FeedForwardDiagram.jsx
      BlockDiagram.jsx
      GenerationDiagram.jsx
      TrainingDiagram.jsx
      index.js                 # Re-exports all 8
```

---

## Story sections

| id | Accent | diagramSteps | snippetId |
|---|---|---|---|
| intro | signal-blue | 3 | — |
| tokenization | signal-purple | 3 | data-prep |
| embeddings | signal-pink | 4 | model |
| attention | signal-orange | 4 | attention |
| feedforward | signal-green | 4 | feedforward |
| block | signal-teal | 4 | block |
| generation | signal-indigo | 4 | generation |
| training | signal-red | 4 | training |

---

## D3 diagram conventions

- **Always use named imports**: `import { select, scaleLinear } from 'd3'`
- **`useDiagramSetup({ initFn, updateFn, step })`** — wrap initFn and updateFn in `useCallback` with empty deps `[]`
- **`initFn(svg)`** — builds all SVG elements once, sets initial opacity to 0 (or visible for persistent elements like axes)
- **`updateFn(svg, step)`** — transitions opacity/attrs based on step number; never creates new elements
- **StrictMode safe**: `initFn` starts with `svg.selectAll('*').remove()` (handled inside `useDiagramSetup`)
- **Viewbox**: always `0 0 480 220`; use `width="100%"` `height="100%"` on the `<svg>`

---

## CSS patterns

- `.experience-shell` — `display: grid; grid-template-columns: 1fr 1fr; align-items: start`
- `.diagram-column` — `position: sticky; top: 1.5rem; height: calc(100vh - 3rem)`
- `.story-panel` — `opacity: 0.45`, becomes `opacity: 1` when `.is-active`
- Signal accent classes: `signal-blue/purple/pink/orange/green/teal/indigo/red`
- No Tailwind in App.css — plain CSS only

---

## What NOT to do

- **Don't call hooks inside the Scrolly render-prop callback** — it's a plain function, not a component
- **Don't use `hljs.highlightElement()`** — causes double-render warnings; use `hljs.highlight()` instead
- **Don't import all of d3** (`import * as d3`) — use named imports only
- **Don't add `scroll-behavior: smooth` to CSS** — Lenis owns smooth scroll

---

## Deploy

GitHub Actions workflow at `.github/workflows/deploy.yml` builds and deploys to GitHub Pages on push to `main`.
Live URL: `https://abditimer.github.io/explain_ai/`
Vite base path is set to `/explain_ai/` in `vite.config.js`.

---

## Roadmap

- [x] Phase 1 — Scroll engine (Scrollama + Lenis)
- [x] Phase 2 — Layout rebuild (sticky diagram + code workspace)
- [x] Phase 3 — D3 animated diagrams (all 8 sections)
- [x] Phase 4 — Polish (syntax highlighting, progress bar, dot nav, step pips)
- [ ] Phase 5 — Diagram crossfade transition between sections
- [ ] Phase 6 — Mobile layout pass (test at 375px, 768px)
- [ ] Phase 7 — Hero typewriter animation
