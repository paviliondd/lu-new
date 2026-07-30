"use client";

import { useEffect, useState, useRef } from "react";

export type JobStatus = "pending" | "running" | "success" | "failed";

export type WorkflowJob =
  | "commit"
  | "lint"
  | "unit"
  | "build"
  | "scan"
  | "deploy";

interface CicdWorkflowProps {
  className?: string;
}

const INITIAL_JOBS: Record<WorkflowJob, JobStatus> = {
  commit: "pending",
  lint: "pending",
  unit: "pending",
  build: "pending",
  scan: "pending",
  deploy: "pending",
};

export default function CicdWorkflow({ className = "" }: CicdWorkflowProps) {
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  const [jobs, setJobs] = useState<Record<WorkflowJob, JobStatus>>(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return {
        commit: "success",
        lint: "success",
        unit: "success",
        build: "success",
        scan: "success",
        deploy: "success",
      };
    }
    return INITIAL_JOBS;
  });

  const [headerStatus, setHeaderStatus] = useState<string>(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "✓ passed · 01:31"
      : "● pending"
  );
  const [headerState, setHeaderState] = useState<"pending" | "running" | "scanning" | "deploying" | "passed">(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "passed"
      : "pending"
  );
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [fadingOut, setFadingOut] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Listen to prefers-reduced-motion changes dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
      if (e.matches) {
        setJobs({
          commit: "success",
          lint: "success",
          unit: "success",
          build: "success",
          scan: "success",
          deploy: "success",
        });
        setHeaderState("passed");
        setHeaderStatus("✓ passed · 01:31");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    let isSubscribed = true;
    let timeouts: NodeJS.Timeout[] = [];

    const schedule = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        if (isSubscribed && !document.hidden) {
          fn();
        }
      }, ms);
      timeouts.push(id);
      return id;
    };

    const clearAllTimeouts = () => {
      timeouts.forEach(clearTimeout);
      timeouts = [];
    };

    const runTimeline = () => {
      clearAllTimeouts();
      setFadingOut(false);
      setIsBlinking(false);

      // 0.0s: Reset all workflow jobs
      setJobs(INITIAL_JOBS);
      setHeaderState("running");
      setHeaderStatus("● running");

      // 1.0s: commit begins
      schedule(() => {
        setJobs((prev) => ({ ...prev, commit: "running" }));
      }, 1000);

      // 3.5s: commit ✓ (took 2.5s)
      schedule(() => {
        setJobs((prev) => ({ ...prev, commit: "success" }));
      }, 3500);

      // 4.5s: lint and unit start concurrently (Quality Verification Stage)
      schedule(() => {
        setJobs((prev) => ({
          ...prev,
          lint: "running",
          unit: "running",
        }));
      }, 4500);

      // 8.5s: lint ✓ (took 4.0s - finishes fast)
      schedule(() => {
        setJobs((prev) => ({ ...prev, lint: "success" }));
      }, 8500);

      // 11.5s: unit ✓ (took 7.0s - finishes fast)
      schedule(() => {
        setJobs((prev) => ({ ...prev, unit: "success" }));
      }, 11500);

      // 12.2s: Both lint & unit passed -> build begins (Packaging Stage)
      schedule(() => {
        setJobs((prev) => ({ ...prev, build: "running" }));
      }, 12200);

      // 19.5s: build ✓ (took 7.3s: > 5s rule)
      schedule(() => {
        setJobs((prev) => ({ ...prev, build: "success" }));
      }, 19500);

      // 20.2s: scan begins (Container Image Vulnerability Scan Stage)
      schedule(() => {
        setHeaderState("scanning");
        setHeaderStatus("● scanning");
        setJobs((prev) => ({ ...prev, scan: "running" }));
      }, 20200);

      // 23.5s: scan ✓ (took 3.3s)
      schedule(() => {
        setJobs((prev) => ({ ...prev, scan: "success" }));
      }, 23500);

      // 24.2s: deploy begins (Deployment Stage)
      schedule(() => {
        setHeaderState("deploying");
        setHeaderStatus("● deploying");
        setJobs((prev) => ({ ...prev, deploy: "running" }));
      }, 24200);

      // 27.5s: deploy ✓ (took 3.3s: ~27.5s total active workflow duration)
      schedule(() => {
        setJobs((prev) => ({ ...prev, deploy: "success" }));
      }, 27500);

      // 27.8s: Header -> ✓ passed
      schedule(() => {
        setHeaderState("passed");
        setHeaderStatus("✓ passed");
        setIsBlinking(true);
      }, 27800);

      // Stop celebration blinking after 3.2s
      schedule(() => {
        setIsBlinking(false);
      }, 31000);

      // 45.5s: Fade out slightly before restart (15s pause cycle after completion)
      schedule(() => {
        setFadingOut(true);
      }, 45500);

      // 46.0s: Restart new loop
      schedule(() => {
        runTimeline();
      }, 46000);
    };

    // Page Visibility API handler
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearAllTimeouts();
      } else {
        runTimeline();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    runTimeline();

    return () => {
      isSubscribed = false;
      clearAllTimeouts();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [reducedMotion]);

  // Helper function to resolve path stroke color
  const getPathColor = (fromJob: WorkflowJob, toJob: WorkflowJob) => {
    const fromStatus = jobs[fromJob];
    const toStatus = jobs[toJob];

    if (toStatus === "success") {
      return "#50e3b3"; // mint green
    }
    if (fromStatus === "success" || toStatus === "running") {
      return "#f59e0b"; // running orange
    }
    return "#64748b"; // pending gray
  };

  const getPathOpacity = (fromJob: WorkflowJob, toJob: WorkflowJob) => {
    const fromStatus = jobs[fromJob];
    const toStatus = jobs[toJob];
    if (fromStatus === "pending" && toStatus === "pending") {
      return 0.35;
    }
    return 1;
  };

  const getJobTextColor = (status: JobStatus) => {
    if (status === "success") return "#50e3b3";
    if (status === "running") return "#ffffff";
    if (status === "failed") return "#f87171";
    return "#64748b";
  };

  const getJobTextOpacity = (status: JobStatus) => {
    if (status === "pending") return 0.45;
    return 1;
  };

  return (
    <div
      ref={containerRef}
      aria-label="Live CI/CD Workflow Pipeline"
      className={`relative w-full rounded-xl border border-slate-700/60 bg-[#111a29] p-4 text-xs font-mono text-[#e5e7eb] shadow-xl shadow-slate-950/20 backdrop-blur-xl transition-all duration-700 dark:border-slate-800 dark:bg-[#111a29] sm:p-5 ${
        fadingOut ? "opacity-60 scale-[0.99]" : "opacity-100 scale-100"
      } ${className}`}
    >
      <style jsx global>{`
        @keyframes running-pulse {
          0%,
          100% {
            opacity: 0.55;
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 0 6px rgba(245, 158, 11, 0);
          }
        }
        @keyframes blink-success {
          0%,
          100% {
            opacity: 1;
            filter: drop-shadow(0 0 6px rgba(80, 227, 179, 0.8));
          }
          50% {
            opacity: 0.45;
            filter: drop-shadow(0 0 1px rgba(80, 227, 179, 0.2));
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 dark:border-slate-800/80">
        <span className="font-mono text-[11px] sm:text-xs tracking-tight text-slate-400">
          workflow / main · #1842
        </span>
        <div className="flex items-center gap-1.5 font-mono text-[11px] sm:text-xs">
          {headerState === "passed" ? (
            <span
              className={`font-semibold text-[#50e3b3] ${
                isBlinking ? "animate-[blink-success_1s_ease-in-out_infinite]" : ""
              }`}
            >
              {headerStatus}
            </span>
          ) : headerState === "pending" ? (
            <span className="text-[#64748b] opacity-60">● pending</span>
          ) : (
            <span className="flex items-center gap-1.5 font-medium text-[#f59e0b]">
              <span
                className="inline-block h-2 w-2 rounded-full bg-[#f59e0b]"
                style={{ animation: "running-pulse 900ms ease-in-out infinite" }}
              />
              {headerStatus.replace("● ", "")}
            </span>
          )}
        </div>
      </div>

      {/* Diagram Canvas: Standard Industry Pipeline (commit -> [lint, unit] -> build -> scan -> deploy) */}
      <div className="relative my-3 h-52 w-full select-none sm:h-56">
        <svg
          className="h-full w-full overflow-visible"
          viewBox="0 0 580 220"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Hand-drawn SVG Bézier curves without arrowheads & with standard industry flow */}
          {/* commit -> lint (top branch) */}
          <path
            d="M 115 106 C 142 98, 160 63, 178 65"
            fill="none"
            stroke={getPathColor("commit", "lint")}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={getPathOpacity("commit", "lint")}
            style={{ transition: "stroke 1200ms ease-in-out, opacity 1200ms ease-in-out" }}
          />

          {/* commit -> unit (bottom branch) */}
          <path
            d="M 115 114 C 142 122, 160 157, 178 155"
            fill="none"
            stroke={getPathColor("commit", "unit")}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={getPathOpacity("commit", "unit")}
            style={{ transition: "stroke 1200ms ease-in-out, opacity 1200ms ease-in-out" }}
          />

          {/* lint -> build */}
          <path
            d="M 245 65 C 265 67, 282 102, 298 106"
            fill="none"
            stroke={getPathColor("lint", "build")}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={getPathOpacity("lint", "build")}
            style={{ transition: "stroke 1200ms ease-in-out, opacity 1200ms ease-in-out" }}
          />

          {/* unit -> build */}
          <path
            d="M 245 155 C 265 153, 282 118, 298 114"
            fill="none"
            stroke={getPathColor("unit", "build")}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={getPathOpacity("unit", "build")}
            style={{ transition: "stroke 1200ms ease-in-out, opacity 1200ms ease-in-out" }}
          />

          {/* build -> scan */}
          <path
            d="M 372 110 C 385 108, 398 112, 408 110"
            fill="none"
            stroke={getPathColor("build", "scan")}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={getPathOpacity("build", "scan")}
            style={{ transition: "stroke 1200ms ease-in-out, opacity 1200ms ease-in-out" }}
          />

          {/* scan -> deploy */}
          <path
            d="M 478 110 C 490 108, 500 112, 508 110"
            fill="none"
            stroke={getPathColor("scan", "deploy")}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={getPathOpacity("scan", "deploy")}
            style={{ transition: "stroke 1200ms ease-in-out, opacity 1200ms ease-in-out" }}
          />

          {/* Node 1: commit */}
          <g transform="translate(30, 114)">
            <text
              fontFamily="monospace"
              fontSize="13"
              fontWeight="600"
              fill={getJobTextColor(jobs.commit)}
              opacity={getJobTextOpacity(jobs.commit)}
            >
              commit
            </text>
            {jobs.commit === "success" && (
              <text
                x="57"
                y="0"
                fontFamily="monospace"
                fontSize="13"
                fontWeight="bold"
                fill="#50e3b3"
                className={isBlinking ? "animate-[blink-success_1s_ease-in-out_infinite]" : ""}
              >
                ✓
              </text>
            )}
            {jobs.commit === "running" && (
              <circle
                cx="61"
                cy="-4"
                r="3.5"
                fill="#f59e0b"
                style={{ animation: "running-pulse 900ms ease-in-out infinite" }}
              />
            )}
          </g>

          {/* Node 2: lint (Top branch) */}
          <g transform="translate(185, 69)">
            <text
              fontFamily="monospace"
              fontSize="13"
              fontWeight="600"
              fill={getJobTextColor(jobs.lint)}
              opacity={getJobTextOpacity(jobs.lint)}
            >
              lint
            </text>
            {jobs.lint === "success" && (
              <text
                x="37"
                y="0"
                fontFamily="monospace"
                fontSize="13"
                fontWeight="bold"
                fill="#50e3b3"
                className={isBlinking ? "animate-[blink-success_1s_ease-in-out_infinite]" : ""}
              >
                ✓
              </text>
            )}
            {jobs.lint === "running" && (
              <circle
                cx="41"
                cy="-4"
                r="3.5"
                fill="#f59e0b"
                style={{ animation: "running-pulse 900ms ease-in-out infinite" }}
              />
            )}
          </g>

          {/* Node 3: unit (Bottom branch) */}
          <g transform="translate(185, 159)">
            <text
              fontFamily="monospace"
              fontSize="13"
              fontWeight="600"
              fill={getJobTextColor(jobs.unit)}
              opacity={getJobTextOpacity(jobs.unit)}
            >
              unit
            </text>
            {jobs.unit === "success" && (
              <text
                x="37"
                y="0"
                fontFamily="monospace"
                fontSize="13"
                fontWeight="bold"
                fill="#50e3b3"
                className={isBlinking ? "animate-[blink-success_1s_ease-in-out_infinite]" : ""}
              >
                ✓
              </text>
            )}
            {jobs.unit === "running" && (
              <circle
                cx="41"
                cy="-4"
                r="3.5"
                fill="#f59e0b"
                style={{ animation: "running-pulse 900ms ease-in-out infinite" }}
              />
            )}
          </g>

          {/* Node 4: build (Converged center) */}
          <g transform="translate(305, 114)">
            <text
              fontFamily="monospace"
              fontSize="13"
              fontWeight="600"
              fill={getJobTextColor(jobs.build)}
              opacity={getJobTextOpacity(jobs.build)}
            >
              build
            </text>
            {jobs.build === "success" && (
              <text
                x="47"
                y="0"
                fontFamily="monospace"
                fontSize="13"
                fontWeight="bold"
                fill="#50e3b3"
                className={isBlinking ? "animate-[blink-success_1s_ease-in-out_infinite]" : ""}
              >
                ✓
              </text>
            )}
            {jobs.build === "running" && (
              <circle
                cx="51"
                cy="-4"
                r="3.5"
                fill="#f59e0b"
                style={{ animation: "running-pulse 900ms ease-in-out infinite" }}
              />
            )}
          </g>

          {/* Node 5: scan */}
          <g transform="translate(415, 114)">
            <text
              fontFamily="monospace"
              fontSize="13"
              fontWeight="600"
              fill={getJobTextColor(jobs.scan)}
              opacity={getJobTextOpacity(jobs.scan)}
            >
              scan
            </text>
            {jobs.scan === "success" && (
              <text
                x="37"
                y="0"
                fontFamily="monospace"
                fontSize="13"
                fontWeight="bold"
                fill="#50e3b3"
                className={isBlinking ? "animate-[blink-success_1s_ease-in-out_infinite]" : ""}
              >
                ✓
              </text>
            )}
            {jobs.scan === "running" && (
              <circle
                cx="41"
                cy="-4"
                r="3.5"
                fill="#f59e0b"
                style={{ animation: "running-pulse 900ms ease-in-out infinite" }}
              />
            )}
          </g>

          {/* Node 6: deploy */}
          <g transform="translate(515, 114)">
            <text
              fontFamily="monospace"
              fontSize="13"
              fontWeight="600"
              fill={getJobTextColor(jobs.deploy)}
              opacity={getJobTextOpacity(jobs.deploy)}
            >
              deploy
            </text>
            {jobs.deploy === "success" && (
              <text
                x="56"
                y="0"
                fontFamily="monospace"
                fontSize="13"
                fontWeight="bold"
                fill="#50e3b3"
                className={isBlinking ? "animate-[blink-success_1s_ease-in-out_infinite]" : ""}
              >
                ✓
              </text>
            )}
            {jobs.deploy === "running" && (
              <circle
                cx="59"
                cy="-4"
                r="3.5"
                fill="#f59e0b"
                style={{ animation: "running-pulse 900ms ease-in-out infinite" }}
              />
            )}
          </g>
        </svg>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-700/60 pt-3 font-mono text-[11px] sm:text-xs text-[#64748b] dark:border-slate-800/80">
        <span>sha 7f3a91c · elapsed 01:31 · production</span>
      </div>
    </div>
  );
}
