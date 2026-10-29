import { generateJSON } from "@tiptap/html/server";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { viewerExtensions } from "@/components/editor/viewer-extensions";

const YOUTUBE_EMBED_REGEX =
  /^https:\/\/www\.youtube(-nocookie)?\.com\/embed\/[\w-]+/;

/**
 * Server-side render of stored TipTap HTML. The HTML is parsed through the
 * editor schema first, so anything the schema does not know (scripts, event
 * handlers, javascript: links) is dropped before it reaches the page.
 */
export function renderPostContent(html: string) {
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
      },
    },
  });
}
