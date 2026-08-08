import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { initSmoothScroll } from "./lib/smoothScroll";
import "./index.css";

initSmoothScroll();

createRoot(document.getElementById("root")!).render(<App />);
