import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Lenis from "lenis";
import "./index.css";
import App from "./App.jsx";

// Smooth scroll
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  wheelMultiplier: 0.7,
  touchMultiplier: 1.2,
  autoRaf: true,
});
window.__lenis = lenis;

// Lenis calculates limit=0 before the DOM paints — recalculate once ready.
window.addEventListener('load', () => lenis.resize());

// ── Keyboard step navigation ─────────────────────────────────────────────
// Direct lenis closure; reads __activeStep set by Scrollama in App.jsx.
window.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' &&
      e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;

  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  e.preventDefault();

  const steps = document.querySelectorAll('.story-step');
  if (!steps.length) return;

  const currentIdx = typeof window.__activeStep === 'number' ? window.__activeStep : 0;
  const isForward = e.key === 'ArrowDown' || e.key === 'ArrowRight';
  const nextIdx = Math.max(0, Math.min(steps.length - 1, currentIdx + (isForward ? 1 : -1)));
  const el = steps[nextIdx];
  if (!el) return;

  // Recalculate limit in case Lenis hasn't seen a resize since init
  lenis.resize();

  const targetY = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.35;
  lenis.scrollTo(Math.max(0, targetY), { duration: 1.0 });
}, { capture: true });
// ────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
