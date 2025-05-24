export const supportsViewTransitions = !!document.startViewTransition;

export const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

export function transitionView(callback) {
  if (supportsViewTransitions && !prefersReducedMotion) {
    return document.startViewTransition(callback);
  } else {
    callback();
    return null;
  }
}

export function animateElement(element, keyframes, options) {
  if (prefersReducedMotion) {
    if (keyframes.length > 0) {
      Object.assign(element.style, keyframes[keyframes.length - 1]);
    }
    return null;
  }

  return element.animate(keyframes, options);
}

export function zoomIntoElement(element, duration = 300) {
  if (!element || prefersReducedMotion) return;

  const rect = element.getBoundingClientRect();

  const clone = element.cloneNode(true);
  clone.style.position = "fixed";
  clone.style.top = `${rect.top}px`;
  clone.style.left = `${rect.left}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.zIndex = "9999";
  clone.style.transition = `all ${duration}ms ease-in-out`;

  document.body.appendChild(clone);

  void clone.offsetWidth;

  clone.style.top = "0";
  clone.style.left = "0";
  clone.style.width = "100vw";
  clone.style.height = "100vh";
  clone.style.objectFit = "contain";
  clone.style.backgroundColor = "rgba(0, 0, 0, 0.9)";

  setTimeout(() => {
    clone.addEventListener("click", () => {
      clone.style.top = `${rect.top}px`;
      clone.style.left = `${rect.left}px`;
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      clone.style.backgroundColor = "rgba(0, 0, 0, 0)";

      setTimeout(() => {
        document.body.removeChild(clone);
      }, duration);
    });
  }, duration);

  return clone;
}
