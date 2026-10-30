/**
 * The reading mode carried in a post link, so a shared link opens the same
 * experience: ?read=sound, ?read=silence or ?read=plain for scored stories,
 * and ?read=still for poems.
 */
export const READ_PARAM = "read";

export const READ_MODES = ["sound", "silence", "plain", "still"] as const;

export type ReadMode = (typeof READ_MODES)[number];

export function parseReadMode(value: unknown): ReadMode | null {
  return typeof value === "string" && (READ_MODES as readonly string[]).includes(value)
    ? (value as ReadMode)
    : null;
}

/** Updates the address bar without navigating, keeping other parameters. */
export function setReadParam(mode: ReadMode | null) {
  const url = new URL(window.location.href);
  if (url.searchParams.get(READ_PARAM) === mode) return;
  if (mode) url.searchParams.set(READ_PARAM, mode);
  else url.searchParams.delete(READ_PARAM);
  window.history.replaceState(null, "", url);
}

/** Describes a mode for the share menu, e.g. "with sound". */
export function describeReadMode(mode: ReadMode): string {
  switch (mode) {
    case "sound":
      return "with sound";
    case "silence":
      return "with light and colour, no sound";
    case "plain":
      return "as plain text";
    case "still":
      return "as still text";
  }
}
