"use client";

import { useRef, useState } from "react";

interface ArchifyArtifactProps {
  alt: string;
  htmlPath: string;
  src: string;
  svgPath: string;
}

function withEmbedMode(path: string) {
  return `${path}${path.includes("?") ? "&" : "?"}embed=1`;
}

export default function ArchifyArtifact({ alt, htmlPath, src }: ArchifyArtifactProps) {
  const shellRef = useRef<HTMLElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const enterFullscreen = async () => {
    if (!shellRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await shellRef.current.requestFullscreen();
  };

  return (
    <figure ref={shellRef} className="archify-shell" data-archify-shell="true">
      <div className="archify-shell__interactive" role="region" aria-label={`${alt} interactive preview`}>
        {!loaded && !failed && <span className="archify-shell__status" role="status">Loading diagram…</span>}
        {failed && (
          <div className="archify-shell__fallback" role="alert">
            <p>Interactive diagram could not be loaded.</p>
            <img src={src} alt={alt} loading="lazy" decoding="async" />
          </div>
        )}
        {!failed && (
          <iframe
            title={`${alt} interactive architecture diagram`}
            src={withEmbedMode(htmlPath)}
            loading="lazy"
            sandbox="allow-scripts"
            allow="fullscreen"
            allowFullScreen
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        )}
        <button
          className="archify-shell__fullscreen"
          type="button"
          onClick={enterFullscreen}
          aria-label="Open architecture in fullscreen"
          title="Fullscreen"
        >
          <span aria-hidden="true">⛶</span>
        </button>
      </div>
    </figure>
  );
}
