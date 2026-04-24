# How Transformers Are Built

A Pudding-style scrollytelling website that explains the GPT architecture — from raw text to trained model — with animated D3 diagrams and real PyTorch code synced to each section.

## Architecture

```
Story column (scrolls)          Diagram column (sticky)
────────────────────────        ──────────────────────────
Hero title                      D3 animated diagram
                                  └─ auto-advances through steps
Section 1 (step trigger)          as each section enters view
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

## Scrollytelling pattern

- **Sticky graphic**: diagram column is `position: sticky` with `align-items: start` on the grid
- **Step triggers**: `.story-panel` elements are Scrollama steps; `onStepEnter` sets `currentStep`
- **Auto-advance**: when `currentStep` changes, `diagramStep` resets to 0 then increments every 1800ms
- **Diagram swap**: `DIAGRAM_MAP[section.id]` selects the right D3 component; falls back to nothing

## Roadmap

- [x] Phase 1 — Scroll engine (Scrollama + Lenis)
- [x] Phase 2 — Layout rebuild (sticky diagram + code workspace)
- [x] Phase 3 — D3 animated diagrams (all 8 sections)
- [ ] Phase 4 — Polish (syntax highlighting, mobile, progress indicator)

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
