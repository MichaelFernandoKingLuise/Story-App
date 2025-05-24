import "../styles/styles.css";
import App from "../scripts/pages/app.js";
import { registerServiceWorker } from './utils';

const supportsViewTransitions = "startViewTransition" in document;
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    loginItem: document.querySelector("#login-item"),
    logoutItem: document.querySelector("#logout-item"),
    hamburgerBtn: document.querySelector("#hamburger-btn"),
    navList: document.querySelector("#nav-list"),
    supportsViewTransitions,
    prefersReducedMotion,
  });

  await app.renderPage();

  await registerServiceWorker();

  let hashChangeTimeout;
  window.addEventListener("hashchange", () => {
    clearTimeout(hashChangeTimeout);
    hashChangeTimeout = setTimeout(async () => {
      await app.renderPage();
    }, 50);
  });
});
