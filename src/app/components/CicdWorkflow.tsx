"use client";

import { useEffect, useState, useRef } from "react";

export type JobStatus = "pending" | "running" | "success" | "failed";

export type WorkflowJob =
  | "commit"
  | "build"
  | "test"
  | "unit"
  | "scan"
  | "deploy";

interface CicdWorkflowProps {
  className?: string;
}

const INITIAL_JOBS: Record<WorkflowJob, JobStatus> = {
  commit: "pending",
  build: "pending",
  test: "pending",
  unit: "pending",
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
        build: "success",
        test: "success",
        unit: "success",
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
  const [fadingOut, setFadingOut] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pathRefCommitBuild = useRef<SVGPathElement>(null);
  const pathRefCommitTest = useRef<SVGPathElement>(null);
  const pathRefCommitUnit = useRef<SVGPathElement>(null);
  const pathRefBuildScan = useRef<SVGPathElement>(null);
  const pathRefTestScan = useRef<SVGPathElement>(null);
  const pathRefUnitScan = useRef<SVGPathElement>(null);
  const pathRefScanDeploy = useRef<SVGPathElement>(null);

  // Listen to prefers-reduced-motion changes dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
      if (e.matches) {
        setJobs({
          commit: "success",
          build: "success",
          test: "success",
          unit: "success",
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

      // 0.0s: Reset all workflow jobs
      setJobs(INITIAL_JOBS);
      setHeaderState("running");
      setHeaderStatus("● running");

      // 0.4s: commit begins
      schedule(() => {
        setJobs((prev) => ({ ...prev, commit: "running" }));
      }, 400);

      // 1.0s: commit ✓
      schedule(() => {
        setJobs((prev) => ({ ...prev, commit: "success" }));
      }, 1000);

      // 1.3s: build, test, unit start concurrently
      schedule(() => {
        setJobs((prev) => ({
          ...prev,
          build: "running",
          test: "running",
          unit: "running",
        }));
      }, 1300);

      // 2.2s: build ✓
      schedule(() => {
        setJobs((prev) => ({ ...prev, build: "success" }));
      }, 2200);

      // 2.8s: test ✓
      schedule(() => {
        setJobs((prev) => ({ ...prev, test: "success" }));
      }, 2800);

      // 3.5s: unit ✓
      schedule(() => {
        setJobs((prev) => ({ ...prev, unit: "success" }));
      }, 3500);

      // 4.5s: scan begins
      schedule(() => {
        setHeaderState("scanning");
        setHeaderStatus("● scanning");
        setJobs((prev) => ({ ...prev, scan: "running" }));
      }, 4500);

      // 5.5s: scan ✓
      schedule(() => {
        setJobs((prev) => ({ ...prev, scan: "success" }));
      }, 5500);

      // 6.4s: deploy begins
      schedule(() => {
        setHeaderState("deploying");
        setHeaderStatus("● deploying");
        setJobs((prev) => ({ ...prev, deploy: "running" }));
      }, 6400);

      // 7.8s: deploy ✓
      schedule(() => {
        setJobs((prev) => ({ ...prev, deploy: "success" }));
      }, 7800);

      // 8.0s: Header -> ✓ passed
      schedule(() => {
        setHeaderState("passed");
        setHeaderStatus("✓ passed");
      }, 8000);

      // 10.0s: Fade out slightly and restart loop
      schedule(() => {
        setFadingOut(true);
      }, 10000);

      schedule(() => {
        runTimeline();
      }, 10600);
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

  const getPathColor = (fromJob: WorkflowJob, toJob: WorkflowJob) => {
    const fromStatus = jobs[fromJob];
    const toStatus = jobs[toJob];

    if (toStatus === "success") {
      return "#50e3b3"; // mint
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
      return 0.4;
    }
    return 1;
  };

  const renderJobSymbol = (status: JobStatus) => {
    if (status === "success") {
      return <span className="ml-1 text-[#50e3b3]">✓</span>;
    }
    if (status === "running") {
      return (
        <span
          className="ml-1.5 inline-block h-2 w-2 rounded-full bg-[#f59e0b]"
          style={{
            animation: "running-pulse 900ms ease-in-out infinite",
          }}
        />
      );
    }
    if (status === "failed") {
      return <span className="ml-1 text-[#f87171]">×</span>;
    }
    return null;
  };

  const getJobTextColor = (status: JobStatus) => {
    if (status === "success") return "text-[#50e3b3]";
    if (status === "running") return "text-white font-medium";
    if (status === "failed") return "text-[#f87171]";
    return "text-[#64748b] opacity-60";
  };

  return (
    <div
      ref={containerRef}
      aria-label="Live CI/CD Workflow Pipeline"
      className={`relative w-full rounded-xl border border-[#27364a] bg-[#111a29] p-4 text-xs font-mono text-[#e5e7eb] shadow-xl transition-opacity duration-500 sm:p-5 ${
        fadingOut ? "opacity-75" : "opacity-100"
      } ${className}`}
    >
      <style jsx global>{`
        @keyframes running-pulse {
          0%,
          100% {
            opacity: 0.55;
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.35);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 0 6px rgba(245, 158, 11, 0);
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#27364a]/60 pb-3">
        <span className="text-slate-400 font-mono tracking-tight text-[11px] sm:text-xs">
          workflow / main · #1842
        </span>
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono">
          {headerState === "passed" ? (
            <span className="text-[#50e3b3] font-semibold">{headerStatus}</span>
          ) : headerState === "pending" ? (
            <span className="text-[#64748b] opacity-60">● pending</span>
          ) : (
            <span className="flex items-center gap-1.5 text-[#f59e0b] font-medium">
              <span
                className="inline-block h-2 w-2 rounded-full bg-[#f59e0b]"
                style={{ animation: "running-pulse 900ms ease-in-out infinite" }}
              />
              {headerStatus.replace("● ", "")}
            </span>
          )}
        </div>
      </div>

      {/* Diagram Canvas */}
      <div className="relative my-4 h-48 w-full select-none sm:h-52">
        {/* SVG Bezier Connector Paths */}
        <svg
          className="absolute inset-0 h-full w-full overflow-visible"
          viewBox="0 0 520 200"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <marker
              id="arrow-pending"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" opacity="0.5" />
            </marker>
            <marker
              id="arrow-running"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
            </marker>
            <marker
              id="arrow-success"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#50e3b3" />
            </marker>
          </defs>

          {/* commit -> build */}
          <path
            ref={pathRefCommitBuild}
            d="M 104 98 C 136 92, 150 48, 185 48"
            fill="none"
            stroke={getPathColor("commit", "build")}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={getPathOpacity("commit", "build")}
            markerEnd={`url(#arrow-${
              jobs.build === "success"
                ? "success"
                : jobs.commit === "success" || jobs.build === "running"
                ? "running"
                : "pending"
            })`}
            className="transition-colors duration-300"
          />

          {/* commit -> test */}
          <path
            ref={pathRefCommitTest}
            d="M 104 100 C 132 98, 158 102, 185 100"
            fill="none"
            stroke={getPathColor("commit", "test")}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={getPathOpacity("commit", "test")}
            markerEnd={`url(#arrow-${
              jobs.test === "success"
                ? "success"
                : jobs.commit === "success" || jobs.test === "running"
                ? "running"
                : "pending"
            })`}
            className="transition-colors duration-300"
          />

          {/* commit -> unit */}
          <path
            ref={pathRefCommitUnit}
            d="M 104 104 C 136 110, 150 152, 185 152"
            fill="none"
            stroke={getPathColor("commit", "unit")}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={getPathOpacity("commit", "unit")}
            markerEnd={`url(#arrow-${
              jobs.unit === "success"
                ? "success"
                : jobs.commit === "success" || jobs.unit === "running"
                ? "running"
                : "pending"
            })`}
            className="transition-colors duration-300"
          />

          {/* build -> scan */}
          <path
            ref={pathRefBuildScan}
            d="M 252 48 C 288 48, 308 94, 342 98"
            fill="none"
            stroke={getPathColor("build", "scan")}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={getPathOpacity("build", "scan")}
            markerEnd={`url(#arrow-${
              jobs.scan === "success"
                ? "success"
                : jobs.build === "success" || jobs.scan === "running"
                ? "running"
                : "pending"
            })`}
            className="transition-colors duration-300"
          />

          {/* test -> scan */}
          <path
            ref={pathRefTestScan}
            d="M 245 100 C 275 102, 312 98, 342 100"
            fill="none"
            stroke={getPathColor("test", "scan")}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={getPathOpacity("test", "scan")}
            markerEnd={`url(#arrow-${
              jobs.scan === "success"
                ? "success"
                : jobs.test === "success" || jobs.scan === "running"
                ? "running"
                : "pending"
            })`}
            className="transition-colors duration-300"
          />

          {/* unit -> scan */}
          <path
            ref={pathRefUnitScan}
            d="M 245 152 C 288 152, 308 106, 342 102"
            fill="none"
            stroke={getPathColor("unit", "scan")}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={getPathOpacity("unit", "scan")}
            markerEnd={`url(#arrow-${
              jobs.scan === "success"
                ? "success"
                : jobs.unit === "success" || jobs.scan === "running"
                ? "running"
                : "pending"
            })`}
            className="transition-colors duration-300"
          />

          {/* scan -> deploy */}
          <path
            ref={pathRefScanDeploy}
            d="M 400 100 C 418 98, 432 102, 448 100"
            fill="none"
            stroke={getPathColor("scan", "deploy")}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={getPathOpacity("scan", "deploy")}
            markerEnd={`url(#arrow-${
              jobs.deploy === "success"
                ? "success"
                : jobs.scan === "success" || jobs.deploy === "running"
                ? "running"
                : "pending"
            })`}
            className="transition-colors duration-300"
          />
        </svg>

        {/* Nodes overlay positioned in coordination with SVG ViewBox 520x200 */}
        <div className="absolute inset-0 flex items-center justify-between text-xs font-mono pointer-events-none">
          {/* Node 1: commit */}
          <div className="absolute left-[5%] top-[46%] -translate-y-1/2 flex items-center gap-0.5">
            <span className={getJobTextColor(jobs.commit)}>commit</span>
            {renderJobSymbol(jobs.commit)}
          </div>

          {/* Node 2: build, test, unit stacked vertically */}
          <div className="absolute left-[36%] top-0 bottom-0 flex flex-col justify-around">
            <div className="flex items-center gap-0.5">
              <span className={getJobTextColor(jobs.build)}>build</span>
              {renderJobSymbol(jobs.build)}
            </div>
            <div className="flex items-center gap-0.5">
              <span className={getJobTextColor(jobs.test)}>test</span>
              {renderJobSymbol(jobs.test)}
            </div>
            <div className="flex items-center gap-0.5">
              <span className={getJobTextColor(jobs.unit)}>unit</span>
              {renderJobSymbol(jobs.unit)}
            </div>
          </div>

          {/* Node 3: scan */}
          <div className="absolute left-[67%] top-[46%] -translate-y-1/2 flex items-center gap-0.5">
            <span className={getJobTextColor(jobs.scan)}>scan</span>
            {renderJobSymbol(jobs.scan)}
          </div>

          {/* Node 4: deploy */}
          <div className="absolute right-[3%] top-[46%] -translate-y-1/2 flex items-center gap-0.5">
            <span className={getJobTextColor(jobs.deploy)}>deploy</span>
            {renderJobSymbol(jobs.deploy)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#27364a]/60 pt-3 text-[11px] sm:text-xs font-mono text-[#64748b]">
        <span>sha 7f3a91c · elapsed 01:31 · production</span>
      </div>
    </div>
  );
}
