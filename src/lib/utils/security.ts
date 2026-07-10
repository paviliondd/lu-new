import {
  FilterXSS,
  escapeAttrValue,
  safeAttrValue,
  type ICSSFilter,
  type IFilterXSSOptions,
  type IWhiteList,
} from "xss";

const commonAttributes = ["id", "class", "title", "role", "aria-label", "aria-hidden"];
const tableCellAttributes = ["colspan", "rowspan", "scope", "align", "valign"];
const mediaAttributes = [
  "alt",
  "decoding",
  "fetchpriority",
  "height",
  "loading",
  "sizes",
  "src",
  "srcset",
  "title",
  "width",
];

const articleWhiteList: IWhiteList = {
  a: [...commonAttributes, "href", "rel", "target"],
  abbr: [...commonAttributes],
  aside: commonAttributes,
  b: commonAttributes,
  blockquote: [...commonAttributes, "cite"],
  br: [],
  caption: commonAttributes,
  cite: commonAttributes,
  code: commonAttributes,
  col: ["span", "width"],
  colgroup: ["span", "width"],
  dd: commonAttributes,
  del: [...commonAttributes, "datetime"],
  details: [...commonAttributes, "open"],
  div: commonAttributes,
  dl: commonAttributes,
  dt: commonAttributes,
  em: commonAttributes,
  figcaption: commonAttributes,
  figure: commonAttributes,
  h1: commonAttributes,
  h2: commonAttributes,
  h3: commonAttributes,
  h4: commonAttributes,
  h5: commonAttributes,
  h6: commonAttributes,
  hr: commonAttributes,
  i: commonAttributes,
  img: [...commonAttributes, ...mediaAttributes],
  ins: [...commonAttributes, "datetime"],
  kbd: commonAttributes,
  li: commonAttributes,
  mark: commonAttributes,
  ol: commonAttributes,
  p: commonAttributes,
  pre: [...commonAttributes, "data-filename", "data-language"],
  s: commonAttributes,
  small: commonAttributes,
  source: [...commonAttributes, "media", "sizes", "src", "srcset", "type"],
  span: commonAttributes,
  strong: commonAttributes,
  sub: commonAttributes,
  summary: commonAttributes,
  sup: commonAttributes,
  table: [...commonAttributes, "width"],
  tbody: commonAttributes,
  td: [...commonAttributes, ...tableCellAttributes],
  tfoot: commonAttributes,
  th: [...commonAttributes, ...tableCellAttributes],
  thead: commonAttributes,
  tr: commonAttributes,
  u: commonAttributes,
  ul: commonAttributes,
};

const blockedDynamicAttributes = new Set([
  "data-lazy-src",
  "data-original",
  "data-src",
  "data-srcset",
]);

function sanitizeSrcSet(tag: string, value: string, cssFilter: ICSSFilter) {
  return value
    .split(",")
    .map((candidate) => {
      const [url, ...descriptors] = candidate.trim().split(/\s+/);
      if (!url) return "";

      const safeUrl = safeAttrValue(tag, "src", url, cssFilter);
      if (!safeUrl) return "";

      const safeDescriptors = descriptors.filter((descriptor) =>
        /^(?:\d+(?:\.\d+)?w|\d+(?:\.\d+)?x)$/i.test(descriptor)
      );

      return [safeUrl, ...safeDescriptors].join(" ");
    })
    .filter(Boolean)
    .join(", ");
}

const articleXssOptions: IFilterXSSOptions = {
  whiteList: articleWhiteList,
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style", "iframe", "object", "embed"],
  allowCommentTag: false,
  css: false,
  safeAttrValue(tag, name, value, cssFilter) {
    if (name === "srcset") {
      return sanitizeSrcSet(tag, value, cssFilter);
    }

    return safeAttrValue(tag, name, value, cssFilter);
  },
  onIgnoreTagAttr(_tag, name, value) {
    const normalizedName = name.toLowerCase();

    if (
      blockedDynamicAttributes.has(normalizedName) ||
      normalizedName.startsWith("on") ||
      normalizedName === "style"
    ) {
      return "";
    }

    if (/^(?:aria|data)-[a-z0-9_.:-]+$/i.test(name)) {
      return `${name}="${escapeAttrValue(value)}"`;
    }

    return "";
  },
};

const articleXssFilter = new FilterXSS(articleXssOptions);

export function sanitizeArticleHtml(html: string): string {
  return articleXssFilter.process(html);
}
