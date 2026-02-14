/** Shared DOS path/formatting utilities */

const ROOT = "C:\\WILL";

/** Convert a URL slug path to a DOS-style path: "" → "C:\WILL", "posts" → "C:\WILL\POSTS" */
export function toDosPath(slugPath: string): string {
  if (!slugPath) return ROOT;
  return `${ROOT}\\${slugPath.toUpperCase().replace(/\//g, "\\")}`;
}

/** Convert a slug path to a URL href: "" → "/", "posts" → "/posts" */
export function toHref(slugPath: string): string {
  return slugPath ? `/${slugPath}` : "/";
}

/** Get the parent slug path: "posts/hello" → "posts", "posts" → "", "" → undefined */
export function parentSlug(slugPath: string): string | undefined {
  if (!slugPath) return undefined;
  const parts = slugPath.split("/");
  parts.pop();
  return parts.join("/");
}

/** Convert a DOS display name to a slug-safe name for URLs */
export function entryToSlug(name: string, type: "file" | "dir"): string {
  if (type === "dir") return name.toLowerCase();
  return name.replace(/\.TXT$/i, "").toLowerCase();
}

/** Format a DOS 8.3 style row: name, extension, size or <DIR>, date, time */
export function formatDosRow(
  name: string,
  type: "file" | "dir",
  size: number,
  date: string,
  time: string
): string {
  let namePart: string;
  if (type === "dir") {
    namePart = name.toUpperCase().padEnd(8) + "    ";
  } else {
    const dot = name.lastIndexOf(".");
    const base = dot >= 0 ? name.slice(0, dot) : name;
    const ext = dot >= 0 ? name.slice(dot + 1) : "";
    namePart = base.toUpperCase().padEnd(8) + " " + ext.toUpperCase().padEnd(3);
  }

  const sizePart = type === "dir" ? " <DIR>     " : String(size).padStart(11);
  const timePart = time ? ` ${time}` : "";

  return `${namePart} ${sizePart} ${date}${timePart}`;
}
