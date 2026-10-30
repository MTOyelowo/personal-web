import { Extension } from "@tiptap/core";

export const PARAGRAPH_VARIANTS = [
  { id: "chant", label: "Chant" },
  { id: "shout", label: "Shout" },
  { id: "prayer", label: "Prayer" },
] as const;

export type ParagraphVariantId = (typeof PARAGRAPH_VARIANTS)[number]["id"];

const VARIANT_IDS = new Set<string>(PARAGRAPH_VARIANTS.map((v) => v.id));

export function parseVariant(value: unknown): ParagraphVariantId | null {
  return typeof value === "string" && VARIANT_IDS.has(value)
    ? (value as ParagraphVariantId)
    : null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    paragraphVariant: {
      /** Styles the current paragraph as a chant, shout or prayer; null for normal. */
      setParagraphVariant: (variant: ParagraphVariantId | null) => ReturnType;
    };
  }
}

/**
 * Paragraph styles for stories: a chant (indented, with a rule), a shout
 * (bold) and a prayer (centred, with space around it).
 */
export const ParagraphVariant = Extension.create({
  name: "paragraphVariant",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph"],
        attributes: {
          variant: {
            default: null,
            // Enter starts a normal paragraph, not another shout
            keepOnSplit: false,
            parseHTML: (element) => parseVariant(element.getAttribute("data-variant")),
            renderHTML: (attributes) => {
              const variant = parseVariant(attributes.variant);
              return variant ? { "data-variant": variant } : {};
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setParagraphVariant:
        (variant) =>
        ({ commands }) =>
          commands.updateAttributes("paragraph", { variant }),
    };
  },
});
