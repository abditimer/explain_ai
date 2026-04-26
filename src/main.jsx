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
window.__targetStep = 0;

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
  const targetY = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.35;
  lenis.scrollTo(Math.max(0, targetY), { duration: 1.0 });
}, { capture: true });
// ────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
