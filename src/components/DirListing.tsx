"use client";

import Link from "next/link";
import { FileEntry } from "@/lib/content";
import { toDosPath, toHref, entryToSlug } from "@/lib/dos";
import TypedCommand from "./TypedCommand";

interface Props {
  slugPath: string;
  entries: FileEntry[];
  parentSlug?: string;
}

const linkClass = "block hover:bg-[#aaa] hover:text-black transition-none";
const linkStyle = { color: "#ffffff" };

export default function DirListing({ slugPath, entries, parentSlug }: Props) {
  const dosPath = toDosPath(slugPath);
  const fileCount = entries.filter((e) => e.type !== "dir").length;
  const dirCount = entries.filter((e) => e.type === "dir").length;
  const totalBytes = entries
    .filter((e) => e.type !== "dir")
    .reduce((sum, e) => sum + e.size, 0);

  return (
    <TypedCommand slugPath={slugPath} command="DIR">
      <div className="mt-1"> Volume in drive C is WILL</div>
      <div> Volume Serial Number is H0M3-P4G3</div>
      <div className="mt-1 mb-2"> Directory of {dosPath}</div>

      <DirRow name="." type="dir" />
      {parentSlug !== undefined && (
        <Link href={toHref(parentSlug)} className={linkClass} style={linkStyle}>
          <DirRow name=".." type="dir" />
        </Link>
      )}

      {entries.map((entry) => {
        // External links open in new tab
        if (entry.type === "link" && entry.url) {
          return (
            <a
              key={entry.name}
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={linkStyle}
            >
              <DirRow
                name={entry.name}
                type={entry.type}
                size={entry.size}
                date={entry.date}
                time={entry.time}
              />
            </a>
          );
        }

        const entrySlugPart = entryToSlug(entry.name, entry.type);
        const href = toHref(
          slugPath ? `${slugPath}/${entrySlugPart}` : entrySlugPart
        );

        return (
          <Link key={entry.name} href={href} className={linkClass} style={linkStyle}>
            <DirRow
              name={entry.name}
              type={entry.type}
              size={entry.size}
              date={entry.date}
              time={entry.time}
            />
          </Link>
        );
      })}

      <div className="mt-1">
        {"     "}
        {fileCount} File(s){"     "}
        {totalBytes.toLocaleString()} bytes
      </div>
      <div>
        {"     "}
        {dirCount + 2} Dir(s){"  "}420,694,200 bytes free
      </div>
    </TypedCommand>
  );
}

function DirRow({
  name,
  type,
  size,
  date,
  time,
}: {
  name: string;
  type: "file" | "dir" | "link";
  size?: number;
  date?: string;
  time?: string;
}) {
  let dosName: string;
  if (type === "dir") {
    dosName = name.toUpperCase();
  } else {
    const dot = name.lastIndexOf(".");
    const base = dot >= 0 ? name.slice(0, dot) : name;
    const ext = dot >= 0 ? name.slice(dot + 1) : "";
    dosName = `${base.toUpperCase()}.${ext.toUpperCase()}`;
  }

  const sizeLabel = type === "dir" ? "<DIR>" : size?.toLocaleString() ?? "0";

  return (
    <div className="flex gap-x-3 sm:gap-x-4">
      <span className="shrink-0 min-w-[8ch]">{dosName}</span>
      <span className="shrink-0 min-w-[5ch] text-right">{sizeLabel}</span>
      {date && (
        <span className="shrink-0 hidden sm:inline text-[var(--dos-prompt)]">
          {date}
        </span>
      )}
      {time && (
        <span className="shrink-0 hidden sm:inline text-[var(--dos-prompt)]">
          {time}
        </span>
      )}
    </div>
  );
}
