"use client";

type CopyIconState = "idle" | "loading" | "copied" | "failed";

export async function copyText(value: string) {
  try {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to the textarea fallback below.
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}

export function createCopyIcon(state: CopyIconState) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.classList.add("code-copy-button__icon");

  if (state === "copied") {
    svg.innerHTML = '<path d="M20 6 9 17l-5-5"></path>';
    return svg;
  }

  if (state === "failed") {
    svg.innerHTML = '<path d="M12 8v4"></path><path d="M12 16h.01"></path><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"></path>';
    return svg;
  }

  if (state === "loading") {
    svg.setAttribute("stroke-dasharray", "8 4");
    svg.classList.add("code-copy-button__icon--spin");
    svg.innerHTML = '<path d="M21 12a9 9 0 1 1-3-6.7"></path>';
    return svg;
  }

  svg.innerHTML = '<path d="M20 2H10a2 2 0 0 0-2 2v10"></path><path d="M4 8h10a2 2 0 0 1 2 2v10H6a2 2 0 0 1-2-2Z"></path>';
  return svg;
}
