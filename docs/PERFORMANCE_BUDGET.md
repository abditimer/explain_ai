# Loading and motion budgets

## Build-time budgets

- Initial application JavaScript: at most 110 KB gzip.
- Initial CSS: at most 8 KB gzip.
- Locally bundled Latin variable fonts combined: at most 70 KB WOFF2.
- Each deferred diagram scene: at most 15 KB gzip, excluding the shared diagram runtime.
- Deferred full-vocabulary logits: at most 250 KB uncompressed, loaded only when the next-token chapter is visited.
- The HTML shell should remain below 5 KB before compression.

## Current production build snapshot

Measured with `npm run build` on 2026-10-28:

- App entry before the checkpoint data integration: 94.95 KB gzip.
- App entry after the checkpoint data integration: 96.33 KB gzip.
- CSS: 5.45 KB gzip.
- Fraunces and Manrope WOFF2: 61.46 KB combined.
- Largest scene component: training at 3.66 KB gzip; the shared diagram setup chunk is 3.96 KB gzip. The next-token diagram is 2.02 KB gzip.
- HTML shell: 3.39 KB before compression.

These build outputs are within the stated budgets. Diagram components are split into separate chunks and loaded when their scene is first visited; visited diagrams remain mounted for reverse navigation. The recorded checkpoint logits are a separate 201,028-byte float32 asset, fetched only on first entry to the next-token chapter and then cached by the service worker.

## Runtime motion budgets

- Code-to-diagram emphasis should settle within 500 ms after the source operation is selected.
- No animation should block input for more than 50 ms on the main thread.
- Reduced-motion mode should settle immediately without running the code-to-diagram animation.

Runtime frame and long-task measurements still require browser performance profiling; this document records the targets, not a claim that those runtime budgets have been measured.

## Runtime spot check

A headless Chrome 156 production-preview pass on 2026-10-28 navigated all eight chapter controls while collecting `requestAnimationFrame` intervals and the Long Tasks API. Across 458 sampled frame intervals, the 95th-percentile gap was 16.7 ms, the maximum was 33.3 ms, and none exceeded 50 ms. The Long Tasks API reported zero tasks. This single headless-machine spot check is evidence for the sampled route only; it does not cover other hardware, browsers, reduced-motion rendering, or a rendered visual review.
