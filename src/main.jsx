import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Lenis from "lenis";
import "./index.css";
import "./fonts.css";
import App from "./App.jsx";
import { AppErrorBoundary } from "./components/AppErrorBoundary.jsx";

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let lenis = null;
const syncScrollMode = () => {
  if (reducedMotion.matches) {
    lenis?.destroy();
    lenis = null;
    window.__lenis = null;
    return;
  }
  if (lenis) return;
  try {
    lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.7,
      touchMultiplier: 1.2,
      autoRaf: true,
    });
    window.__lenis = lenis;
    window.addEventListener('load', () => lenis?.resize(), { once: true });
  } catch (error) {
    lenis = null;
    window.__lenis = null;
    console.warn('Smooth scrolling is unavailable; continuing with native scrolling.', error);
  }
};
syncScrollMode();
reducedMotion.addEventListener('change', syncScrollMode);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}service-worker.js`, {
      scope: import.meta.env.BASE_URL,
    }).catch((error) => {
      console.info('Offline support is unavailable; the explanation still works online.', error);
    });
  }, { once: true });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
