"use client";

type CopyIconState = "idle" | "loading" | "copied" | "failed";

const clipboardTimeoutMs = 800;

export async function copyText(value: string) {
  let timeoutId: number | undefined;
  try {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      const clipboardResult = await Promise.race([
        navigator.clipboard.writeText(value).then(() => true),
        new Promise<false>((resolve) => {
          timeoutId = window.setTimeout(() => resolve(false), clipboardTimeoutMs);
        }),
      ]);
      if (clipboardResult) return true;
    }
  } catch {
    // Fall through to the textarea fallback below.
  } finally {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  }

  let textarea: HTMLTextAreaElement | null = null;
  try {
    textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea?.remove();
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
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("code-copy-button__icon");

  const appendPath = (pathData: string) => {
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", pathData);
    svg.appendChild(path);
  };

  if (state === "copied") {
    appendPath("M20 6 9 17l-5-5");
    return svg;
  }

  if (state === "failed") {
    appendPath("M12 8v4");
    appendPath("M12 16h.01");
    appendPath("M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z");
    return svg;
  }

  if (state === "loading") {
    svg.setAttribute("stroke-dasharray", "8 4");
    svg.classList.add("code-copy-button__icon--spin");
    appendPath("M21 12a9 9 0 1 1-3-6.7");
    return svg;
  }

  appendPath("M20 2H10a2 2 0 0 0-2 2v10");
  appendPath("M4 8h10a2 2 0 0 1 2 2v10H6a2 2 0 0 1-2-2Z");
  return svg;
}
