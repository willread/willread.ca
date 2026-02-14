"use client";

import Link from "next/link";
import { FileEntry } from "@/lib/content";
import { toDosPath, toHref } from "@/lib/dos";
import { useCommandQueue } from "@/lib/command-queue";
import TypedCommand from "./TypedCommand";

interface Props {
  slugPath: string;
  entries: FileEntry[];
  parentSlug?: string;
}

const linkClass = "block hover:bg-[var(--dos-link)] hover:text-black active:bg-[var(--dos-highlight)] active:text-black transition-none";
const linkStyle = { color: "var(--dos-link)" };

export default function DirListing({ slugPath, entries, parentSlug }: Props) {
  const { isStatic } = useCommandQueue();
  const dosPath = toDosPath(slugPath);
  const fileCount = entries.filter((e) => e.type !== "dir").length;
  const dirCount = entries.filter((e) => e.type === "dir").length;
  const totalBytes = entries
    .filter((e) => e.type !== "dir")
    .reduce((sum, e) => sum + e.size, 0);

  return (
    <TypedCommand id={`dir-${slugPath}`} slugPath={slugPath} command="DIR">
      <pre className="mt-1 font-[inherit] text-[length:inherit] leading-[inherit]">{" Volume in drive C is WILL"}</pre>
      <pre className="font-[inherit] text-[length:inherit] leading-[inherit]">{" Volume Serial Number is H0M3-P4G3"}</pre>
      <pre className="font-[inherit] text-[length:inherit] leading-[inherit] mt-1 mb-2">{" Directory of "}{dosPath}</pre>

      <DirRow name="." type="dir" />
      {parentSlug !== undefined && (
        isStatic ? (
          <div style={linkStyle}><DirRow name=".." type="dir" /></div>
        ) : (
          <Link href={toHref(parentSlug)} className={linkClass} style={linkStyle}>
            <DirRow name=".." type="dir" />
          </Link>
        )
      )}

      {entries.map((entry) => {
        const row = (
          <DirRow
            name={entry.name}
            type={entry.type}
            size={entry.size}
            date={entry.date}
            time={entry.time}
          />
        );

        // Static mode (history) — no links
        if (isStatic) {
          return <div key={entry.name} style={linkStyle}>{row}</div>;
        }

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
              {row}
            </a>
          );
        }

        const href = toHref(
          slugPath ? `${slugPath}/${entry.slug}` : entry.slug
        );

        return (
          <Link key={entry.name} href={href} className={linkClass} style={linkStyle}>
            {row}
          </Link>
        );
      })}

      <pre className="font-[inherit] text-[length:inherit] leading-[inherit] mt-1 flex">
        <span>{`             ${String(fileCount).padStart(3)} File(s)  ${`${totalBytes.toLocaleString()} bytes`.padEnd(20)}`}</span>
      </pre>
      <pre className="font-[inherit] text-[length:inherit] leading-[inherit] flex">
        <span>{`             ${String(dirCount + 2).padStart(3)} Dir(s)   ${"420,694,200 bytes free".padEnd(20)}`}</span>
      </pre>
    </TypedCommand>
  );
}

/**
 * DOS DIR row with proper 8.3 column alignment.
 * Format: FILENAME EXT   <DIR>           MM-DD-YYYY HH:MMa
 */
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
  let basePart: string;
  let extPart: string;

  if (type === "dir") {
    basePart = name.toUpperCase().padEnd(8);
    extPart = "   ";
  } else {
    const dot = name.lastIndexOf(".");
    const base = dot >= 0 ? name.slice(0, dot) : name;
    const ext = dot >= 0 ? name.slice(dot + 1) : "";
    basePart = base.toUpperCase().padEnd(8);
    extPart = ext.toUpperCase().padEnd(3);
  }

  const sizePart = type === "dir"
    ? "<DIR>".padEnd(20)
    : `${size?.toLocaleString() ?? "0"} bytes`.padEnd(20);

  const preStyle = "font-[inherit] text-[length:inherit] leading-[inherit] flex";

  return (
    <pre className={preStyle}>
      <span>{basePart} {extPart} {sizePart}</span>
      {date && <span className="hidden sm:inline ml-auto"> {date}</span>}
      {time && <span className="hidden sm:inline"> {time}</span>}
    </pre>
  );
}
