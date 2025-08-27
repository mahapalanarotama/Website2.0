import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
);

// Service worker auto-reload on update
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').then(reg => {
    reg.onupdatefound = () => {
      const installingWorker = reg.installing;
      if (installingWorker) {
        installingWorker.onstatechange = () => {
          if (
            installingWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            // Service worker baru terinstall, reload otomatis
            window.location.reload();
          }
        };
      }
    };
  });
}

// Blokir klik kanan
window.addEventListener('contextmenu', event => event.preventDefault());
// Blokir shortcut DevTools
window.addEventListener('keydown', function(e) {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
    (e.ctrlKey && e.key === 'U')
  ) {
    e.preventDefault();
    return false;
  }
});