import { Node, mergeAttributes, findParentNode } from "@tiptap/core";
import {
  type SceneCue,
  parseBpm,
  parseDay,
  parseEffects,
  parseHex,
  parseLabel,
  parseLevel,
  parseSound,
  parseWash,
  serializeSound,
  toCueId,
} from "@/lib/scene-cues";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    scene: {
      /** Wraps the selected blocks in a scene. */
      setScene: (attributes?: Partial<SceneCue>) => ReturnType;
      /** Removes the scene around the selection, keeping its content. */
      unsetScene: () => ReturnType;
    };
  }
}

/**
 * Replaces StarterKit's document so scenes can only sit at the top level:
 * a scene holds ordinary blocks, never another scene.
 */
export const SceneDocument = Node.create({
  name: "doc",
  topNode: true,
  content: "(block | scene)+",
});

type AttributeSpec<T> = {
  default: T;
  parseHTML: (element: HTMLElement) => T;
  renderHTML: (attributes: Record<string, unknown>) => Record<string, string>;
};

function attr<T>(
  key: string,
  dataName: string,
  empty: T,
  parse: (raw: string | null) => T,
  serialize: (value: T) => string | null = (v) => (v == null ? null : String(v)),
): AttributeSpec<T> {
  return {
    default: empty,
    parseHTML: (element) => parse(element.getAttribute(dataName)),
    // Values set through commands are re-validated on the way out too.
    renderHTML: (attributes) => {
      const raw = attributes[key];
      const value = serialize(
        parse(Array.isArray(raw) ? raw.join(" ") : raw == null ? null : String(raw)),
      );
      return value === null ? {} : { [dataName]: value };
    },
  };
}

export const Scene = Node.create({
  name: "scene",
  group: "scene",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      cue: attr("cue", "data-cue", null, toCueId),
      name: attr("name", "data-name", null, (v) => parseLabel(v)),
      time: attr("time", "data-time", null, (v) => parseLabel(v, 40)),
      day: attr("day", "data-day", null, parseDay),
      bg: attr("bg", "data-bg", null, parseHex),
      ink: attr("ink", "data-ink", null, parseHex),
      dark: attr(
        "dark",
        "data-dark",
        false,
        (v) => v !== null && v !== "false",
        (v) => (v ? "" : null),
      ),
      wash: attr("wash", "data-wash", [] as string[], parseWash, (v) =>
        v.length ? v.join(" ") : null,
      ),
      washOpacity: attr("washOpacity", "data-wash-opacity", null, parseLevel),
      stroke: attr("stroke", "data-stroke", null, parseHex),
      canvasOpacity: attr(
        "canvasOpacity",
        "data-canvas-opacity",
        null,
        parseLevel,
      ),
      glow: attr("glow", "data-glow", null, parseHex),
      vignette: attr("vignette", "data-vignette", null, parseLevel),
      bpm: attr("bpm", "data-bpm", null, parseBpm),
      effects: attr("effects", "data-effects", [] as string[], parseEffects, (v) =>
        v.length ? v.join(" ") : null,
      ),
      sound: {
        default: {},
        parseHTML: (element) => parseSound(element.getAttribute("data-sound")),
        renderHTML: (attributes) => {
          const raw = attributes.sound as SceneCue["sound"] | null;
          const value = serializeSound(parseSound(serializeSound(raw)));
          return value === null ? {} : { "data-sound": value };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "section[data-scene]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["section", mergeAttributes({ "data-scene": "" }, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setScene:
        (attributes = {}) =>
        ({ commands }) =>
          commands.wrapIn(this.name, attributes),
      unsetScene:
        () =>
        ({ state, tr, dispatch }) => {
          const scene = findParentNode((node) => node.type.name === this.name)(
            state.selection,
          );
          if (!scene) return false;
          if (dispatch) {
            tr.replaceWith(
              scene.pos,
              scene.pos + scene.node.nodeSize,
              scene.node.content,
            );
          }
          return true;
        },
    };
  },
});
