import { Mark, mergeAttributes } from "@tiptap/core";
import { parseLabel } from "@/lib/scene-cues";

export const GLOSS_DEFINITION_MAX = 500;

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    gloss: {
      /** Marks the selection as a glossed term. */
      setGloss: (attributes: { definition: string; term?: string | null }) => ReturnType;
      /** Removes the gloss around the selection. */
      unsetGloss: () => ReturnType;
    };
  }
}

/**
 * A word or phrase with a meaning shown in the margin, e.g. a Yoruba, Hausa
 * or pidgin term. The term label defaults to the marked text; set it when
 * the marked text is a whole sentence, e.g. "Pidgin".
 */
export const Gloss = Mark.create({
  name: "gloss",
  inclusive: false,

  addAttributes() {
    return {
      definition: {
        default: null,
        parseHTML: (element) =>
          parseLabel(element.getAttribute("data-gloss"), GLOSS_DEFINITION_MAX),
        renderHTML: (attributes) => {
          const value = parseLabel(attributes.definition, GLOSS_DEFINITION_MAX);
          return value ? { "data-gloss": value } : {};
        },
      },
      term: {
        default: null,
        parseHTML: (element) =>
          parseLabel(element.getAttribute("data-gloss-term"), 60),
        renderHTML: (attributes) => {
          const value = parseLabel(attributes.term, 60);
          return value ? { "data-gloss-term": value } : {};
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-gloss]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setGloss:
        (attributes) =>
        ({ commands }) =>
          commands.setMark(this.name, attributes),
      unsetGloss:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name, { extendEmptyMarkRange: true }),
    };
  },
});
