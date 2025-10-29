import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";

// Register service worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed, but app still works
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
