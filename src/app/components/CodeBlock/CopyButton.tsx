"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, LoaderCircle, TriangleAlert } from "lucide-react";
import { copyText } from "./copyText";

export type CopyState = "idle" | "copying" | "success" | "error";

export interface CopyButtonLabels {
  idle: string;
  copying: string;
  success: string;
  error: string;
  errorHelp: string;
}

interface CopyCodeButtonProps {
  code: string;
  labels: CopyButtonLabels;
  copy?: (value: string) => boolean | Promise<boolean>;
  resetDelayMs?: number;
}

export async function resolveCopyState(
  copy: (value: string) => boolean | Promise<boolean>,
  code: string,
): Promise<"success" | "error"> {
  try {
    return (await copy(code)) ? "success" : "error";
  } catch {
    return "error";
  }
}

export default function CopyCodeButton({
  code,
  labels,
  copy = copyText,
  resetDelayMs = 2000,
}: CopyCodeButtonProps) {
  const [state, setState] = useState<CopyState>("idle");
  const statusId = useId();
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyingRef = useRef(false);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const label = labels[state];
  const handleCopy = async () => {
    if (copyingRef.current) return;

    copyingRef.current = true;
    setState("copying");
    const nextState = await resolveCopyState(copy, code);
    copyingRef.current = false;
    setState(nextState);

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setState("idle"), resetDelayMs);
  };

  return (
    <div className="code-copy-control">
      <button
        type="button"
        className="code-copy-button"
        data-state={state}
        aria-label={label}
        aria-describedby={statusId}
        disabled={state === "copying"}
        onClick={handleCopy}
      >
        {state === "idle" && (
          <span className="code-copy-button__symbol" aria-hidden="true">
            ⧉
          </span>
        )}
        {state === "copying" && (
          <LoaderCircle className="code-copy-button__icon code-copy-button__icon--spin" aria-hidden="true" />
        )}
        {state === "success" && <Check className="code-copy-button__icon" aria-hidden="true" />}
        {state === "error" && <TriangleAlert className="code-copy-button__icon" aria-hidden="true" />}
        <span className="code-copy-button__label">{label}</span>
      </button>

      <span id={statusId} className="sr-only" role="status" aria-live="polite">
        {state === "idle" ? "" : label}
      </span>

      {state === "error" && (
        <span className="code-copy-control__error" role="note">
          {labels.errorHelp}
        </span>
      )}
    </div>
  );
}
