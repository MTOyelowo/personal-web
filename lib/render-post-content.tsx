import type { ReactNode } from "react";
import { generateJSON } from "@tiptap/html/server";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { viewerExtensions } from "@/components/editor/viewer-extensions";
import { parseVariant } from "@/components/editor/extensions/paragraph-variant";

const YOUTUBE_EMBED_REGEX =
  /^https:\/\/www\.youtube(-nocookie)?\.com\/embed\/[\w-]+/;

/** A paragraph that is only a row of break marks, e.g. "*****" or "· · ·". */
const BREAK_REGEX = /^[\s*·•~=_#\-–—]{3,}$/;

interface Options {
  /** Render paragraphs as stanzas of separate lines, for poem mode. */
  poem?: boolean;
}

/**
 * Server-side render of stored TipTap HTML. The HTML is parsed through the
 * editor schema first, so anything the schema does not know (scripts, event
 * handlers, javascript: links) is dropped before it reaches the page.
 */
export function renderPostContent(html: string, { poem = false }: Options = {}) {
  const content = generateJSON(html, viewerExtensions);

  return renderToReactElement({
    content,
    extensions: viewerExtensions,
    options: {
      nodeMapping: {
        // The extension's own renderHTML emits camelCase iframe attributes
        // React does not accept, so render the embed directly.
        youtube: ({ node }) => {
          const src = node.attrs.src as string | null;
          if (!src || !YOUTUBE_EMBED_REGEX.test(src)) return null;
          return (
            <div data-youtube-video="">
              <iframe
                src={src}
                title="YouTube video"
                className="aspect-video w-full rounded-lg my-3"
                allowFullScreen
                loading="lazy"
              />
            </div>
          );
        },
        paragraph: ({ node, children }) => {
          // A row of asterisks, dashes or dots is a section break. Written as
          // text it cannot wrap, and pushed phone layouts wider than the screen.
          if (BREAK_REGEX.test(node.textContent) && node.childCount > 0) {
            return <hr className="story-break" />;
          }
          const variant = parseVariant(node.attrs.variant);
          if (!poem) {
            return <p data-variant={variant ?? undefined}>{children}</p>;
          }
          // A stanza: each line between hard breaks becomes its own block,
          // so it can breathe in on its own as it scrolls into view.
          const rendered = Array.isArray(children) ? children : [children];
          const lines: { parts: ReactNode[]; text: string }[] = [{ parts: [], text: "" }];
          node.content.forEach((child, _offset, i) => {
            if (child.type.name === "hardBreak") {
              lines.push({ parts: [], text: "" });
              return;
            }
            const line = lines[lines.length - 1];
            line.parts.push(rendered[i]);
            line.text += child.textContent;
          });
          return (
            <p className="poem-stanza" data-variant={variant ?? undefined}>
              {lines.map((line, i) => {
                const words = line.text.trim().split(/\s+/).filter(Boolean).length;
                return (
                  <span
                    key={i}
                    className={`poem-line${words === 1 ? " poem-line-alone" : ""}`}
                  >
                    {line.parts}
                  </span>
                );
              })}
            </p>
          );
        },
      },
    },
  });
}
