import type { DailyQuote, TextAlign, QuoteBackground } from "./types";

interface RenderOptions {
  quote: DailyQuote;
  background?: QuoteBackground;
  gradient?: string;
  textAlign: TextAlign;
  quoteColor: string;
  authorColor: string;
  size?: number;
}

/**
 * Draws the quote card onto an off-screen canvas and returns it as a Blob.
 * Supports both image backgrounds and CSS gradient strings.
 */
export async function renderQuoteImage({
  quote,
  background,
  gradient,
  textAlign,
  quoteColor,
  authorColor,
  size = 1080,
}: RenderOptions): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // --- Draw background ---
  if (background) {
    const img = await loadImage(background.src);
    drawCover(ctx, img, size, size);
  } else if (gradient) {
    // Parse CSS gradient into canvas gradient (supports linear-gradient)
    drawCSSGradient(ctx, gradient, size);
  } else {
    // Fallback to solid dark
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, size, size);
  }

  // --- Dark overlay ---
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillRect(0, 0, size, size);

  // --- Text layout ---
  const padding = size * 0.08;
  const maxTextWidth = size - padding * 2;

  // Quote text
  const quoteFontSize = Math.round(size * 0.045);
  ctx.font = `500 ${quoteFontSize}px "Space Grotesk", system-ui, sans-serif`;
  ctx.fillStyle = quoteColor;
  ctx.textAlign = textAlign;

  const quoteText = `\u201C${quote.text}\u201D`;
  const quoteLines = wrapText(ctx, quoteText, maxTextWidth);
  const lineHeight = quoteFontSize * 1.5;

  // Center the block vertically
  const authorFontSize = Math.round(size * 0.03);
  const authorLineHeight = authorFontSize * 1.6;
  const sourceFontSize = Math.round(size * 0.025);
  const sourceLineHeight = sourceFontSize * 1.6;
  const hasAuthor = !!quote.author;
  const hasSource = !!quote.source;
  const totalTextHeight =
    quoteLines.length * lineHeight +
    (hasAuthor ? authorLineHeight + size * 0.03 : 0) +
    (hasSource ? sourceLineHeight + (hasAuthor ? 0 : size * 0.03) : 0);
  let y = (size - totalTextHeight) / 2;

  const x =
    textAlign === "left"
      ? padding
      : textAlign === "right"
        ? size - padding
        : size / 2;

  for (const line of quoteLines) {
    ctx.fillText(line, x, y + quoteFontSize);
    y += lineHeight;
  }

  // Author text
  if (hasAuthor) {
    y += size * 0.03;
    ctx.font = `400 ${authorFontSize}px "Space Grotesk", system-ui, sans-serif`;
    ctx.fillStyle = authorColor;
    ctx.fillText(`\u2014 ${quote.author}`, x, y + authorFontSize);
    y += authorLineHeight;
  }

  // Source text
  if (hasSource) {
    if (!hasAuthor) y += size * 0.03;
    ctx.font = `400 ${sourceFontSize}px "Space Grotesk", system-ui, sans-serif`;
    ctx.fillStyle = authorColor;
    ctx.globalAlpha = 0.7;
    ctx.fillText(quote.source!, x, y + sourceFontSize);
    ctx.globalAlpha = 1;
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Canvas toBlob failed")),
      "image/png",
    );
  });
}

// --- Helpers ---

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Draws an image "cover" style into the canvas. */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number,
) {
  const imgRatio = img.width / img.height;
  const canvasRatio = cw / ch;

  let sx = 0,
    sy = 0,
    sw = img.width,
    sh = img.height;

  if (imgRatio > canvasRatio) {
    sw = img.height * canvasRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / canvasRatio;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
}

/** Word-wraps text to fit within maxWidth. */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Parses a simple CSS linear-gradient string and draws it onto the canvas.
 * Supports: linear-gradient(135deg, #color1, #color2, ...)
 */
function drawCSSGradient(
  ctx: CanvasRenderingContext2D,
  css: string,
  size: number,
) {
  const match = css.match(/linear-gradient\((\d+)deg,\s*(.+)\)/);
  if (!match) {
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, size, size);
    return;
  }

  const angle = parseInt(match[1], 10);
  const colors = match[2].split(",").map((c) => c.trim());

  // Convert angle to line coordinates
  const rad = ((angle - 90) * Math.PI) / 180;
  const cx = size / 2;
  const cy = size / 2;
  const len = size * 0.75;

  const grad = ctx.createLinearGradient(
    cx - Math.cos(rad) * len,
    cy - Math.sin(rad) * len,
    cx + Math.cos(rad) * len,
    cy + Math.sin(rad) * len,
  );

  colors.forEach((color, i) => {
    grad.addColorStop(i / (colors.length - 1), color);
  });

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
}
