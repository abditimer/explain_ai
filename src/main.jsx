import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Lenis from "lenis";
import "./index.css";
import App from "./App.jsx";

// Smooth scroll — slow enough to read each step without jumping ahead
const lenis = new Lenis({
  duration: 1.4,          // longer lerp duration = smoother deceleration
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  wheelMultiplier: 0.7,   // slower wheel sensitivity so steps don't skip
  touchMultiplier: 1.2,
  autoRaf: true,
});
window.__lenis = lenis;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
