import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Lenis from "lenis";
import "./index.css";
import App from "./App.jsx";

const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  wheelMultiplier: 0.7,
  touchMultiplier: 1.2,
  autoRaf: true,
});
window.__lenis = lenis;

// Lenis calculates limit=0 before the DOM paints — fix after load.
window.addEventListener('load', () => lenis.resize());

// ── Keyboard step navigation ─────────────────────────────────────────────
// __targetStep tracks where we intend to be (advances immediately on each
// keypress). __activeStep (set by Scrollama in App.jsx) syncs it back to
// ground truth once the scroll animation settles.
// -1 so the first ↓ press lands on step 0 (not step 1)
window.__targetStep = -1;

window.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' &&
      e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;

  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  e.preventDefault();

  const steps = document.querySelectorAll('.story-step');
  if (!steps.length) return;

  const isForward = e.key === 'ArrowDown' || e.key === 'ArrowRight';

  // Advance the target index immediately — don't wait for Scrollama
  window.__targetStep = Math.max(
    0,
    Math.min(steps.length - 1, window.__targetStep + (isForward ? 1 : -1))
  );

  const el = steps[window.__targetStep];
  if (!el) return;

  lenis.resize(); // ensure limit is calculated
  const rect = el.getBoundingClientRect();
  // Center the step vertically in the viewport
  const stepHeight = el.offsetHeight;
  const topOffset = Math.max(0, (window.innerHeight - stepHeight) / 2);
  const finalY = Math.max(0, rect.top + window.scrollY - topOffset);
  lenis.scrollTo(finalY, { duration: 1.0 });
}, { capture: true });
// ────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
