import sanitize from "sanitize-html";

export const sanitizeProductHtml = (html: string) =>
  sanitize(html, {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "span", "a", "h2", "h3", "h4", "table", "thead", "tbody", "tr", "th", "td"],
    allowedAttributes: { a: ["href", "title", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: { a: sanitize.simpleTransform("a", { rel: "noopener noreferrer" }) },
  });
