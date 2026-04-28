# How Transformers Are Built

A Pudding-style scrollytelling website that explains the GPT architecture — from raw text to trained model — with animated D3 diagrams and real PyTorch code synced to each section.

**Live:** https://abditimer.github.io/explain_ai/

## Architecture

```
Story column (scrolls)          Diagram column (sticky)
────────────────────────        ──────────────────────────
Hero title                      D3 animated diagram
                                  └─ auto-advances through steps
Section 1 (step trigger)             as each section enters view
Section 2
…                               Code workspace
Section 8                         └─ PyTorch snippet synced
                                     to current section
```

## Story sections

| # | ID | Topic |
|---|---|---|
| 1 | `intro` | Next-token prediction |
| 2 | `tokenization` | BPE tokenisation + sliding window |
| 3 | `embeddings` | Token + position embeddings |
| 4 | `attention` | Multi-head attention heatmap |
| 5 | `feedforward` | FFN expansion 768 → 3072 → 768 |
| 6 | `block` | Transformer block + residuals |
| 7 | `generation` | Autoregressive sampling |
| 8 | `training` | Loss curve, backprop, AdamW |

## Tech stack

| Library | Role |
|---|---|
| **React 19** + **Vite** | UI and dev server |
| **Scrollama** | IntersectionObserver-based step triggers |
| **Lenis** | Smooth scroll (doesn't break `position:sticky`) |
| **D3.js** | Animated SVG diagrams |
| **highlight.js** | Python syntax highlighting |

## Scrollytelling pattern

- **Sticky graphic**: diagram column is `position: sticky` with `align-items: start` on the grid
- **Step triggers**: `.story-step` elements are Scrollama steps; `onStepEnter` sets `activeGlobal`
- **Diagram crossfade**: when the section changes, the old diagram fades out (`translateY(-6px)`) while the new one fades in — both rendered simultaneously for a smooth overlap
- **Keyboard nav**: arrow keys scroll step-by-step via Lenis; `__targetStep` advances immediately, `__activeStep` syncs back from Scrollama ground truth
- **Diagram map**: `DIAGRAM_MAP[section.id]` selects the D3 component for the active section

## Navigation

- **Desktop**: fixed dot-nav panel on the right edge — click any section number or sub-step to jump
- **Mobile**: fixed bottom bar with ← Prev / section name / Next → buttons

## Roadmap

- [x] Phase 1 — Scroll engine (Scrollama + Lenis)
- [x] Phase 2 — Layout rebuild (sticky diagram + code workspace)
- [x] Phase 3 — D3 animated diagrams (all 8 sections)
- [x] Phase 4 — Polish (syntax highlighting, progress bar, dot nav, step pips)
- [x] Phase 5 — Diagram crossfade transition between sections
- [x] Phase 6 — Mobile layout pass (375px, 768px) + bottom nav bar
- [ ] Phase 7 — Hero typewriter animation

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

| Command | Description |
|---|---|
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
