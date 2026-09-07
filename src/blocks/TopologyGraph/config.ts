import type { Block } from "payload";

export const topologyGraphBlock: Block = {
  slug: "topologyGraph",
  labels: {
    singular: "eBPF Topology Graph",
    plural: "eBPF Topology Graphs",
  },
  admin: {
    disableBlockName: true,
  },
  fields: [
    { name: "namespace", type: "text", required: true, label: "Namespace" },
    {
      name: "live",
      type: "checkbox",
      defaultValue: true,
      label: "Show live indicator",
    },
    {
      name: "nodes",
      type: "array",
      required: true,
      minRows: 1,
      label: "Nodes",
      fields: [
        { name: "id", type: "text", required: true, label: "ID" },
        { name: "label", type: "text", required: true, label: "Label" },
        { name: "col", type: "number", required: true, min: 0, admin: { step: 1 } },
        {
          name: "row",
          type: "select",
          required: true,
          defaultValue: "mid",
          options: [
            { label: "Top", value: "top" },
            { label: "Middle", value: "mid" },
            { label: "Bottom", value: "bottom" },
          ],
        },
        { name: "warn", type: "checkbox", defaultValue: false, label: "Warning state" },
      ],
    },
    {
      name: "edges",
      type: "array",
      label: "Edges",
      fields: [
        { name: "from", type: "text", required: true, label: "From node ID" },
        { name: "to", type: "text", required: true, label: "To node ID" },
        { name: "flowing", type: "checkbox", defaultValue: false, label: "Animate traffic" },
      ],
    },
  ],
};
