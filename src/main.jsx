import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Lenis from "lenis";
import "./index.css";
import App from "./App.jsx";

const lenis = new Lenis({ autoRaf: true });
window.__lenis = lenis;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
