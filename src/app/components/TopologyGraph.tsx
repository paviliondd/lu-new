"use client";

import { useId, useMemo, useState } from "react";

export type TopologyNode = {
  id: string;
  label: string;
  col: number;
  row: "top" | "mid" | "bottom";
  warn?: boolean;
};

export type TopologyEdge = {
  from: string;
  to: string;
  flowing?: boolean;
};

export interface TopologyGraphProps {
  namespace: string;
  live?: boolean;
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}

const ROW_Y = { top: 70, mid: 150, bottom: 230 } as const;
const COL_X_STEP = 230;
const COL_X_START = 120;
const NODE_MIN_WIDTH = 132;
const NODE_MAX_WIDTH = 236;
const NODE_LINE_LIMIT = 23;

function splitLabel(label: string) {
  const words = label.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (current && next.length > NODE_LINE_LIMIT) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : ["Unnamed node"];
}

function nodeWidth(lines: string[]) {
  const longest = Math.max(...lines.map((line) => line.length));
  return Math.min(NODE_MAX_WIDTH, Math.max(NODE_MIN_WIDTH, longest * 8 + 38));
}

export default function TopologyGraph({ namespace, live = true, nodes, edges }: TopologyGraphProps) {
  const graphId = useId().replace(/:/g, "");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const layout = useMemo(() => {
    const positioned = new Map(
      nodes.map((node) => {
        const lines = splitLabel(node.label);
        const width = nodeWidth(lines);
        const height = Math.max(48, lines.length * 16 + 22);
        return [node.id, { node, lines, width, height, x: COL_X_START + node.col * COL_X_STEP, y: ROW_Y[node.row] }];
      }),
    );
    const maxCol = Math.max(0, ...nodes.map((node) => node.col));
    return { positioned, width: COL_X_START * 2 + maxCol * COL_X_STEP, height: 300 };
  }, [nodes]);

  const selected = selectedId ? nodeMap.get(selectedId) : null;
  const connected = selected
    ? edges
        .filter((edge) => edge.from === selected.id || edge.to === selected.id)
        .map((edge) => nodeMap.get(edge.from === selected.id ? edge.to : edge.from))
        .filter((node): node is TopologyNode => Boolean(node))
    : [];

  return (
    <figure className="topology-graph" aria-labelledby={`topology-title-${graphId}`}>
      <header className="topology-graph__head">
        <div>
          <span className="topology-graph__eyebrow">eBPF TOPOLOGY GRAPH</span>
          <strong id={`topology-title-${graphId}`}>{namespace}</strong>
        </div>
        {live && (
          <span className="topology-graph__live">
            <i aria-hidden="true" /> LIVE
          </span>
        )}
      </header>
      <div className="topology-graph__canvas" tabIndex={0} aria-label="Interactive topology graph. Select a node for details.">
        <svg className="topology-graph__svg" viewBox={`0 0 ${layout.width} ${layout.height}`} role="img">
          <title>{namespace} eBPF topology</title>
          <desc>Network nodes and animated traffic relationships.</desc>
          <defs>
            <marker id={`topology-arrow-${graphId}`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" className="topology-graph__arrow" />
            </marker>
          </defs>
          <g className="topology-graph__edges" aria-hidden="true">
            {edges.map((edge, index) => {
              const from = layout.positioned.get(edge.from);
              const to = layout.positioned.get(edge.to);
              if (!from || !to) return null;
              return (
                <line
                  key={`${edge.from}-${edge.to}-${index}`}
                  className={`topology-graph__edge${edge.flowing ? " topology-graph__edge--flow" : ""}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  markerEnd={`url(#topology-arrow-${graphId})`}
                />
              );
            })}
          </g>
          <g className="topology-graph__nodes">
            {nodes.map((node) => {
              const item = layout.positioned.get(node.id);
              if (!item) return null;
              const isSelected = selectedId === node.id;
              const startY = item.y - ((item.lines.length - 1) * 16) / 2;
              return (
                <g
                  key={node.id}
                  className={`topology-graph__node${node.warn ? " topology-graph__node--warn" : ""}${isSelected ? " topology-graph__node--selected" : ""}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${node.label}${node.warn ? ", warning" : ""}`}
                  onClick={() => setSelectedId(isSelected ? null : node.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedId(isSelected ? null : node.id);
                    }
                  }}
                >
                  <rect x={item.x - item.width / 2} y={item.y - item.height / 2} width={item.width} height={item.height} rx="10" />
                  {item.lines.map((line, lineIndex) => (
                    <text key={`${node.id}-${lineIndex}`} x={item.x} y={startY + lineIndex * 16 + 4} textAnchor="middle">
                      {line}
                    </text>
                  ))}
                  {node.warn && <text className="topology-graph__warning" x={item.x + item.width / 2 - 17} y={item.y - item.height / 2 + 17}>!</text>}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      {selected && (
        <div className="topology-graph__details" role="status" aria-live="polite">
          <strong>{selected.label}</strong>
          {selected.warn && <span className="topology-graph__details-warning">Needs attention</span>}
          {connected.length > 0 && <span>Connected: {connected.map((node) => node.label).join(" · ")}</span>}
        </div>
      )}
    </figure>
  );
}
