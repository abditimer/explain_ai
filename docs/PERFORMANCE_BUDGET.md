# Loading and motion budgets

## Build-time budgets

- Initial application JavaScript: at most 110 KB gzip.
- Initial CSS: at most 8 KB gzip.
- Locally bundled Latin variable fonts combined: at most 70 KB WOFF2.
- Each deferred diagram scene: at most 15 KB gzip, excluding the shared diagram runtime.
- The HTML shell should remain below 5 KB before compression.

## Current production build snapshot

Measured with `npm run build` on 2026-10-28:

- App entry: 94.95 KB gzip.
- CSS: 5.26 KB gzip.
- Fraunces and Manrope WOFF2: 61.46 KB combined.
- Largest scene component: training at 3.66 KB gzip; the shared diagram setup chunk is 3.96 KB gzip.
- HTML shell: 3.39 KB before compression.

These build outputs are within the stated budgets. Diagram components are split into separate chunks and loaded when their scene is first visited; visited diagrams remain mounted for reverse navigation.

## Runtime motion budgets

- Code-to-diagram emphasis should settle within 500 ms after the source operation is selected.
- No animation should block input for more than 50 ms on the main thread.
- Reduced-motion mode should settle immediately without running the code-to-diagram animation.

Runtime frame and long-task measurements still require browser performance profiling; this document records the targets, not a claim that those runtime budgets have been measured.
