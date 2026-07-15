import parse, {
  domToReact,
  Element,
  type DOMNode,
  type HTMLReactParserOptions,
} from "html-react-parser";
import ArticleImageEnhancer from "../ArticleImageEnhancer";
import CodeBlock, { type CodeBlockLabels } from "../CodeBlock";
import MermaidRenderer from "../MermaidRenderer";
import { languageFromClass, normalizeCodeLabel } from "../CodeBlock/syntax";

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
      if (!(domNode instanceof Element) || domNode.name !== "pre") return undefined;

      const codeElement = domNode.children.find(
        (child): child is Element => child instanceof Element && child.name === "code",
      );
      if (!codeElement) return undefined;
      const highlightedLines = codeElement.children.filter(
        (child): child is Element =>
          child instanceof Element && child.attribs.class?.split(/\s+/).includes("line"),
      );

      const language = normalizeCodeLabel(
        domNode.attribs["data-language"] ||
          codeElement.attribs["data-language"] ||
          languageFromClass(codeElement.attribs.class) ||
          languageFromClass(domNode.attribs.class),
      ).toLowerCase();
      if (language === "mermaid" || domNode.attribs["data-mermaid"] === "true") return undefined;

      const parentFigure =
        domNode.parent instanceof Element && domNode.parent.name === "figure" ? domNode.parent : null;
      const caption = parentFigure?.children.find(
        (child): child is Element => child instanceof Element && child.name === "figcaption",
      );
      const filename = normalizeCodeLabel(
        domNode.attribs["data-filename"] ||
          domNode.attribs["data-file"] ||
          domNode.attribs["data-title"] ||
          codeElement.attribs["data-filename"] ||
          (caption ? nodeText(caption) : ""),
      );

      if (caption && filename) consumed.add(caption);

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
          code={nodeText(codeElement)}
          language={language || undefined}
          filename={filename || undefined}
          showLineNumbers={domNode.attribs["data-line-numbers"] !== "false"}
          downloadable={Boolean(filename)}
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
    <div className="article-content article-content--reading prose mx-auto w-full max-w-[1100px] dark:prose-invert">
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
