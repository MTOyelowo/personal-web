import { type SceneCue, readSceneCue } from "@/lib/scene-cues";

export interface StoryScene {
  el: HTMLElement;
  cue: SceneCue;
}

export interface StoryMap {
  root: HTMLElement;
  scenes: StoryScene[];
  /** Paragraph-level blocks, in reading order. */
  blocks: HTMLElement[];
  /** Scene index each block belongs to. A scene lasts until the next begins. */
  sceneOf: Map<Element, number>;
}

const isScene = (el: Element) => el.matches("section[data-scene]");

/** Maps the rendered story into scenes and reading blocks. */
export function mapStory(story: HTMLElement): StoryMap {
  const scenes: StoryScene[] = [];
  const blocks: HTMLElement[] = [];
  const sceneOf = new Map<Element, number>();
  const pending: HTMLElement[] = [];

  for (const child of Array.from(story.children) as HTMLElement[]) {
    if (isScene(child)) {
      const index = scenes.length;
      scenes.push({ el: child, cue: readSceneCue(child) });
      // Blocks before the first scene open with it
      for (const b of pending.splice(0)) sceneOf.set(b, index);
      for (const b of Array.from(child.children) as HTMLElement[]) {
        blocks.push(b);
        sceneOf.set(b, index);
      }
    } else {
      blocks.push(child);
      if (scenes.length) sceneOf.set(child, scenes.length - 1);
      else pending.push(child);
    }
  }
  return { root: story, scenes, blocks, sceneOf };
}

/** The reading block that contains `el`. */
export function blockOf(el: Element, story: HTMLElement): Element | null {
  let node: Element | null = el;
  while (node && node.parentElement) {
    const parent: Element = node.parentElement;
    if (parent === story || (isScene(parent) && parent.parentElement === story)) {
      return node;
    }
    node = parent;
  }
  return null;
}
