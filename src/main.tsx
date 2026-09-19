import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { initSmoothScroll } from "./lib/smoothScroll";
import { startPerfWatch } from "./lib/perf";
import "./index.css";

initSmoothScroll();
startPerfWatch();

createRoot(document.getElementById("root")!).render(<App />);
