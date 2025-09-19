import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { AuthContextProvider } from "./context/AuthContext";
import { DarkModeContextProvider } from "./context/darkModeContext";
import axios from "axios";

// Dev-only: filter noisy ResizeObserver warnings and stop WDS overlay
if (process.env.NODE_ENV !== 'production') {
  const shouldSuppress = (msg) =>
    typeof msg === 'string' && (
      msg.includes('ResizeObserver loop limit exceeded') ||
      msg.includes('ResizeObserver loop completed with undelivered notifications')
    );

  // Silence console.error for these messages
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args && shouldSuppress(args[0])) return;
    originalConsoleError(...args);
  };

  // Stop error events from bubbling to the overlay
  window.addEventListener('error', (e) => {
    if (e?.message && shouldSuppress(e.message)) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return false;
    }
  }, true);

  // Guard against promise rejections carrying the same text
  window.addEventListener('unhandledrejection', (e) => {
    const reason = e?.reason;
    const msg = typeof reason === 'string' ? reason : reason?.message;
    if (msg && shouldSuppress(msg)) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return false;
    }
  }, true);

  // Best-effort: neutralize WDS overlay render if it still catches it
  const noopOverlay = () => {
    try {
      const anyWin = window;
      const overlayKey = Object.keys(anyWin).find(k => /webpack.*overlay/i.test(k));
      if (overlayKey && anyWin[overlayKey]?.showError) {
        anyWin[overlayKey].showError = () => {};
        anyWin[overlayKey].showWarnings = () => {};
      }
    } catch {}
  };
  // Run after bundle load
  if (document.readyState === 'complete') noopOverlay();
  else window.addEventListener('load', noopOverlay);
}

// Set axios defaults early so first renders carry auth
axios.defaults.withCredentials = true;
try {
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
} catch {}

ReactDOM.render(
  <React.StrictMode>
    <AuthContextProvider>
      <DarkModeContextProvider>
        <App />
      </DarkModeContextProvider>
    </AuthContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
