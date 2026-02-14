import fs from "fs";
import path from "path";

export interface FileEntry {
  name: string;       // 8.3 DOS name e.g. "HELLO~1.TXT"
  slug: string;       // original slug for URL routing
  type: "file" | "dir" | "link";
  size: number;       // bytes (files) or child count (dirs)
  date: string;
  time: string;
  url?: string;       // for .lnk files
}

export interface DirListing {
  slug: string;
  entries: FileEntry[];
}

export interface FileContent {
  name: string;
  body: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content");

// Debug: log content directory at build time
if (typeof process !== "undefined") {
  try {
    const items = fs.readdirSync(CONTENT_DIR);
    console.log(`[content] CONTENT_DIR=${CONTENT_DIR} items=${JSON.stringify(items)}`);
  } catch (e) {
    console.log(`[content] CONTENT_DIR=${CONTENT_DIR} ERROR: ${e}`);
  }
}

function formatDate(d: Date): { date: string; time: string } {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  let h = d.getHours();
  const ampm = h >= 12 ? "p" : "a";
  h = h % 12 || 12;
  const min = String(d.getMinutes()).padStart(2, "0");
  return {
    date: `${mm}-${dd}-${yyyy}`,
    time: `${String(h).padStart(2, " ")}:${min}${ampm}`,
  };
}

/** Convert a filename to 8.3 DOS format. Base capped at 8 chars with ~1 if truncated. */
function toDos83(filename: string, ext: string): string {
  let base = filename.toUpperCase();
  if (base.length > 8) {
    base = base.slice(0, 6) + "~1";
  }
  return ext ? `${base}.${ext.toUpperCase()}` : base;
}

/** List a content directory. Returns null if path doesn't exist or isn't a directory. */
export function getDirListing(slugPath: string = ""): DirListing | null {
  const fullPath = path.join(CONTENT_DIR, slugPath);
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) {
    return null;
  }

  const items = fs.readdirSync(fullPath);
  const entries: FileEntry[] = [];

  for (const item of items) {
    const itemPath = path.join(fullPath, item);
    const stat = fs.statSync(itemPath);
    const { date, time } = formatDate(stat.mtime);

    if (stat.isDirectory()) {
      entries.push({
        name: item.toUpperCase().slice(0, 8),
        slug: item.toLowerCase(),
        type: "dir",
        size: fs.readdirSync(itemPath).length,
        date,
        time,
      });
    } else if (item.endsWith(".md")) {
      const base = item.replace(/\.md$/, "");
      entries.push({
        name: toDos83(base, "TXT"),
        slug: base.toLowerCase(),
        type: "file",
        size: stat.size,
        date,
        time,
      });
    } else if (item.endsWith(".lnk")) {
      const base = item.replace(/\.lnk$/, "");
      const url = fs.readFileSync(itemPath, "utf-8").trim();
      entries.push({
        name: toDos83(base, "LNK"),
        slug: base.toLowerCase(),
        type: "link",
        size: stat.size,
        date,
        time,
        url,
      });
    }
  }

  // Directories first, then files/links, alphabetical within each group
  entries.sort((a, b) => {
    if (a.type === "dir" && b.type !== "dir") return -1;
    if (a.type !== "dir" && b.type === "dir") return 1;
    return a.name.localeCompare(b.name);
  });

  return { slug: slugPath, entries };
}

/** Read a content file by slug path. Returns null if not found. */
export function getFileContent(slugPath: string): FileContent | null {
  const mdPath = path.join(CONTENT_DIR, slugPath + ".md");
  if (!fs.existsSync(mdPath)) return null;

  const base = path.basename(slugPath);
  return {
    name: toDos83(base, "TXT"),
    body: fs.readFileSync(mdPath, "utf-8"),
  };
}

/** Check if a slug path is a valid route (directory or .md file). */
export function isValidPath(slugPath: string): boolean {
  if (!slugPath) return true; // root
  const dirPath = path.join(CONTENT_DIR, slugPath);
  const mdPath = path.join(CONTENT_DIR, slugPath + ".md");
  return fs.existsSync(dirPath) || fs.existsSync(mdPath);
}

/** Walk all content paths for static generation. */
export function getAllPaths(): string[] {
  const paths: string[] = [""];
  if (!fs.existsSync(CONTENT_DIR)) return paths;

  function walk(dir: string) {
    for (const item of fs.readdirSync(path.join(CONTENT_DIR, dir))) {
      const rel = dir ? `${dir}/${item}` : item;
      const full = path.join(CONTENT_DIR, rel);

      if (fs.statSync(full).isDirectory()) {
        paths.push(rel);
        walk(rel);
      } else if (item.endsWith(".md")) {
        paths.push(rel.replace(/\.md$/, ""));
      }
      // .lnk files don't get their own routes — they link externally
    }
  }

  walk("");
  return paths;
}
