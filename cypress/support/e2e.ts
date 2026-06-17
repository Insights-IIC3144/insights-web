import "cypress-real-events/support";
import "./commands";

// Disable CSS animations and transitions globally so Cypress visibility
// checks don't race against entrance animations (e.g. shadcn/ui dialogs).
Cypress.on("window:before:load", (win) => {
  const style = win.document.createElement("style");
  style.innerHTML =
    "*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }";
  win.document.head.appendChild(style);
});

Cypress.on("uncaught:exception", (err) => {
  if (
    err.message.includes("getOportunidad") ||
    err.message.includes("ResizeObserver") ||
    err.message.includes("Hydration failed") ||
    err.message.includes("next/router")
  ) {
    return false;
  }
  return true;
});
