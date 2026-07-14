"use client";

export type CodeActionIconName =
  | "close"
  | "collapse"
  | "expand"
  | "explain"
  | "file"
  | "showMore";

const iconPaths: Record<CodeActionIconName, string[]> = {
  close: ["M18 6 6 18", "m6 6 12 12"],
  collapse: ["m18 15-6-6-6 6"],
  expand: ["M15 3h6v6", "m21 3-7 7", "m3 21 7-7", "M9 21H3v-6"],
  explain: ["M8 6h13", "M8 12h13", "M8 18h13", "M3 6h.01", "M3 12h.01", "M3 18h.01"],
  file: ["M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z", "M14 2v6h6"],
  showMore: ["m6 9 6 6 6-6"],
};

export function createActionIcon(name: CodeActionIconName) {
  const namespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(namespace, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("code-action-button__icon");

  iconPaths[name].forEach((pathData) => {
    const path = document.createElementNS(namespace, "path");
    path.setAttribute("d", pathData);
    svg.appendChild(path);
  });

  return svg;
}
