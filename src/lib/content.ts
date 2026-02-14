import fs from "fs";
import path from "path";

export interface FileEntry {
  name: string;
  type: "file" | "dir";
  size: number;
  date: string; // MM-DD-YYYY
  time: string; // HH:MMa/p
  extension?: string;
}

export interface DirListing {
  path: string;
  label: string;
  entries: FileEntry[];
}

export interface FileContent {
  name: string;
  body: string; // markdown content
}

const CONTENT_DIR = path.join(process.cwd(), "content");

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

export function getDirListing(dirPath: string = ""): DirListing | null {
  const fullPath = path.join(CONTENT_DIR, dirPath);
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
      // Count items in directory
      const subItems = fs.readdirSync(itemPath);
      entries.push({
        name: item,
        type: "dir",
        size: subItems.length,
        date,
        time,
      });
    } else if (item.endsWith(".md")) {
      const displayName = item.replace(/\.md$/, ".TXT");
      const content = fs.readFileSync(itemPath, "utf-8");
      entries.push({
        name: displayName,
        type: "file",
        size: content.length,
        date,
        time,
        extension: "TXT",
      });
    }
  }

  // Dirs first, then files
  entries.sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  const dosPath = dirPath ? `C:\\WILL\\${dirPath.toUpperCase().replace(/\//g, "\\")}` : "C:\\WILL";

  return {
    path: dosPath,
    label: dirPath || "root",
    entries,
  };
}

export function getFileContent(filePath: string): FileContent | null {
  // filePath comes in as e.g. "readme" or "posts/my-post"
  const mdPath = path.join(CONTENT_DIR, filePath + ".md");
  if (!fs.existsSync(mdPath)) return null;

  const body = fs.readFileSync(mdPath, "utf-8");
  const name = path.basename(filePath).toUpperCase() + ".TXT";

  return { name, body };
}

export function getAllPaths(): string[] {
  const paths: string[] = [""];

  function walk(dir: string, prefix: string) {
    const items = fs.readdirSync(path.join(CONTENT_DIR, dir));
    for (const item of items) {
      const full = path.join(CONTENT_DIR, dir, item);
      const rel = dir ? `${dir}/${item}` : item;
      if (fs.statSync(full).isDirectory()) {
        paths.push(rel);
        walk(rel, prefix);
      } else if (item.endsWith(".md")) {
        paths.push(rel.replace(/\.md$/, ""));
      }
    }
  }

  if (fs.existsSync(CONTENT_DIR)) {
    walk("", "");
  }

  return paths;
}
