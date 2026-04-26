import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Lenis from "lenis";
import "./index.css";
import App from "./App.jsx";

// Smooth scroll — slow enough to read each step without jumping ahead
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  wheelMultiplier: 0.7,
  touchMultiplier: 1.2,
  autoRaf: true,
});
window.__lenis = lenis;

// ── Keyboard step navigation ─────────────────────────────────────────────
// Lives here (not in React) so it has a direct reference to lenis,
// never goes stale, and never fights with React lifecycle.
window.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' &&
      e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;

  // Don't hijack arrow keys when the user is typing in an input / textarea
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  e.preventDefault();

  const steps = Array.from(document.querySelectorAll('.story-step'));
  if (!steps.length) return;

  const vh = window.innerHeight;

  // Find the step whose centre is closest to the middle of the viewport
  let currentIdx = 0;
  let minDist = Infinity;
  steps.forEach((step, i) => {
    const rect = step.getBoundingClientRect();
    const dist = Math.abs(rect.top + rect.height / 2 - vh / 2);
    if (dist < minDist) { minDist = dist; currentIdx = i; }
  });

  const isForward = e.key === 'ArrowDown' || e.key === 'ArrowRight';
  const nextIdx = Math.max(0, Math.min(steps.length - 1, currentIdx + (isForward ? 1 : -1)));
  const el = steps[nextIdx];

  // Scroll so the target step is centred at 35% from the top
  const targetY = el.getBoundingClientRect().top + window.scrollY - vh * 0.35;
  lenis.scrollTo(Math.max(0, targetY), { duration: 1.0 });
}, { capture: true });
// ────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
