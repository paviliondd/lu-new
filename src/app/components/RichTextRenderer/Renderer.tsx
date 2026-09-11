import parse, {
  domToReact,
  Element,
  type DOMNode,
  type HTMLReactParserOptions,
} from "html-react-parser";
import ArticleImageEnhancer from "../ArticleImageEnhancer";
import ArchifyArtifact from "../ArchifyArtifact";
import CodeBlock, { type CodeBlockLabels } from "../CodeBlock";
import MermaidRenderer from "../MermaidRenderer";
import TopologyGraph, {
  type TopologyEdge,
  type TopologyNode,
} from "../TopologyGraph";
import { languageFromClass, normalizeCodeLabel } from "../CodeBlock/syntax";
import ArticleTable from "../ArticleTable/ArticleTable";
import { isAsciiTopology, unwrapMarkdownCodeFence } from "@/lib/content/ascii-topology";

interface RichTextRendererProps {
  assetBase?: string;
  content: string;
  contentKey: string;
  labels: CodeBlockLabels;
  legacyAssetOrigins?: string[];
}

function nodeText(node: DOMNode): string {
  if ("data" in node && typeof node.data === "string") return node.data;
  if ("children" in node) return node.children.map((child) => nodeText(child as DOMNode)).join("");
  return "";
}

function nextElement(node: DOMNode | null) {
  let current = node;
  while (current) {
    if (current instanceof Element) return current;
    current = current.next as DOMNode | null;
  }
  return null;
}

function archifyAssetPath(src: string, extension: "svg" | "html") {
  const cleanSrc = src.split(/[?#]/, 1)[0];
  if (!((cleanSrc.startsWith("/uploads/k8s/") || cleanSrc.startsWith("/kubernetes-diagrams/")) && /\.(png|svg)$/i.test(cleanSrc))) return null;
  return `${cleanSrc.replace(/\.(png|svg)$/i, "")}.${extension}`;
}

function parseTopologyArray<T>(value: string | undefined): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function RichTextRenderer({
  assetBase,
  content,
  contentKey,
  labels,
  legacyAssetOrigins,
}: RichTextRendererProps) {
  const consumed = new WeakSet<object>();
  const options: HTMLReactParserOptions = {
    replace(domNode) {
      if (consumed.has(domNode)) return <></>;
      if (!(domNode instanceof Element)) return undefined;

      if (domNode.name === "div" && domNode.attribs["data-topology-graph"] === "true") {
        const nodes = parseTopologyArray<TopologyNode>(domNode.attribs["data-topology-nodes"]);
        const edges = parseTopologyArray<TopologyEdge>(domNode.attribs["data-topology-edges"]);
        if (nodes.length > 0) {
          return (
            <TopologyGraph
              namespace={domNode.attribs["data-topology-namespace"] || "default namespace"}
              live={domNode.attribs["data-topology-live"] !== "false"}
              nodes={nodes}
              edges={edges}
            />
          );
        }
        return <></>;
      }

      if (domNode.name === "img") {
        const src = domNode.attribs.src || "";
        const svgPath = archifyAssetPath(src, "svg");
        const htmlPath = archifyAssetPath(src, "html");
        if (svgPath && htmlPath) {
          const alt = domNode.attribs.alt || "Archify architecture diagram";
          return <ArchifyArtifact alt={alt} htmlPath={htmlPath} src={src} svgPath={svgPath} />;
        }
      }

      if (domNode.name === "h2") {
        const sectionLabel = nodeText(domNode).trim().replace(/^\d{1,2}[.)]\s+/, "");
        return (
          <h2
            id={domNode.attribs.id || undefined}
            data-section-label={sectionLabel || undefined}
          >
            {domToReact(domNode.children as DOMNode[], options)}
          </h2>
        );
      }

      if (domNode.name === "table") {
        return (
          <ArticleTable
            title={labels.table.title}
            copyLabel={labels.table.copy}
            copiedLabel={labels.table.copied}
            downloadLabel={labels.table.download}
          >
            <table>{domToReact(domNode.children as DOMNode[], options)}</table>
          </ArticleTable>
        );
      }

      if (domNode.name !== "pre") return undefined;

      const codeElement = domNode.children.find(
        (child): child is Element => child instanceof Element && child.name === "code",
      );
      if (!codeElement) return undefined;
      const highlightedLines = codeElement.children.filter(
        (child): child is Element =>
          child instanceof Element && child.attribs.class?.split(/\s+/).includes("line"),
      );

      const rawLanguage =
        domNode.attribs["data-language"] ||
          codeElement.attribs["data-language"] ||
          languageFromClass(codeElement.attribs.class) ||
          languageFromClass(domNode.attribs.class);
      const language = normalizeCodeLabel(rawLanguage).toLowerCase();
      if (language === "mermaid" || domNode.attribs["data-mermaid"] === "true") return undefined;

      const fencedCode = unwrapMarkdownCodeFence(nodeText(codeElement));
      const topologyLanguage = fencedCode.language || rawLanguage;
      if (isAsciiTopology(fencedCode.source, topologyLanguage)) {
        return (
          <figure className="topology-shell topology-shell--ascii">
            <pre data-topology-ascii="true">{fencedCode.source}</pre>
          </figure>
        );
      }

      const parentFigure =
        domNode.parent instanceof Element && domNode.parent.name === "figure" ? domNode.parent : null;
      const caption = parentFigure?.children.find(
        (child): child is Element => child instanceof Element && child.name === "figcaption",
      );
      if (caption) consumed.add(caption);

      const explanationElement = nextElement(domNode.next as DOMNode | null);
      const explanation =
        explanationElement &&
        ("data-code-explanation" in explanationElement.attribs ||
          explanationElement.attribs.class?.split(/\s+/).some((name) =>
            ["code-explanation", "code-block-explanation"].includes(name),
          ))
          ? explanationElement
          : null;
      if (explanation) consumed.add(explanation);

      return (
        <CodeBlock
          code={fencedCode.source}
          language={language || undefined}
          showLineNumbers={false}
          highlightedCode={domToReact(
            (highlightedLines.length ? highlightedLines : codeElement.children) as DOMNode[],
            options,
          )}
          explanation={
            explanation ? domToReact(explanation.children as DOMNode[], options) : undefined
          }
          labels={labels}
        />
      );
    },
  };

  return (
    <div className="article-content article-content--reading prose mx-auto w-full max-w-full dark:prose-invert">
      <MermaidRenderer contentKey={contentKey} />
      <ArticleImageEnhancer
        assetBase={assetBase}
        contentKey={contentKey}
        legacyAssetOrigins={legacyAssetOrigins}
      />
      <div className="article-content__body">{parse(content, options)}</div>
    </div>
  );
}
