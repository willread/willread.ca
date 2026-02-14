"use client";

import Link from "next/link";
import { FileEntry } from "@/lib/content";

interface Props {
  dosPath: string;
  entries: FileEntry[];
  parentPath?: string;
}

export default function DirListing({ dosPath, entries, parentPath }: Props) {
  return (
    <div>
      <div className="text-[var(--dos-prompt)] mb-1">
        {dosPath}&gt;<span className="text-[var(--dos-highlight)]">DIR</span>
      </div>
      <div className="mb-1">
        <span> Volume in drive C is WILL</span>
      </div>
      <div className="mb-1">
        <span> Volume Serial Number is 1337-DEAD</span>
      </div>
      <div className="mb-2">
        <span> Directory of {dosPath}</span>
      </div>
      <div className="mb-1" />

      {/* Header dots */}
      <DirRow name="." type="dir" date="" time="" size={0} />
      {parentPath !== undefined && (
        <Link href={parentPath === "" ? "/" : `/${parentPath}`} className="block hover:bg-[var(--dos-fg)] hover:text-[var(--dos-bg)] transition-none">
          <DirRow name=".." type="dir" date="" time="" size={0} />
        </Link>
      )}

      {entries.map((entry) => {
        const href =
          entry.type === "dir"
            ? `/${dosPath.replace("C:\\WILL\\", "").replace("C:\\WILL", "").replace(/\\/g, "/").toLowerCase()}${dosPath === "C:\\WILL" ? "" : "/"}${entry.name.toLowerCase()}`
            : `/${dosPath.replace("C:\\WILL\\", "").replace("C:\\WILL", "").replace(/\\/g, "/").toLowerCase()}${dosPath === "C:\\WILL" ? "" : "/"}${entry.name.replace(/\.TXT$/i, "").toLowerCase()}`;

        // Clean up leading slashes
        const cleanHref = "/" + href.replace(/^\/+/, "");

        return (
          <Link
            key={entry.name}
            href={cleanHref}
            className="block hover:bg-[var(--dos-fg)] hover:text-[var(--dos-bg)] transition-none"
          >
            <DirRow
              name={entry.name}
              type={entry.type}
              date={entry.date}
              time={entry.time}
              size={entry.size}
            />
          </Link>
        );
      })}

      <div className="mt-1">
        <span>
          {"     "}
          {entries.filter((e) => e.type === "file").length} File(s)
          {"     "}
          {entries
            .filter((e) => e.type === "file")
            .reduce((a, b) => a + b.size, 0)
            .toLocaleString()}{" "}
          bytes
        </span>
      </div>
      <div>
        <span>
          {"     "}
          {entries.filter((e) => e.type === "dir").length + 2} Dir(s)
          {"  "}
          {"420,694,200"} bytes free
        </span>
      </div>
    </div>
  );
}

function DirRow({
  name,
  type,
  date,
  time,
  size,
}: {
  name: string;
  type: "dir" | "file";
  date: string;
  time: string;
  size: number;
}) {
  const namePart = name.includes(".")
    ? name.split(".")
    : [name, ""];

  const dosName = type === "dir"
    ? name.toUpperCase().padEnd(8, " ") + "    "
    : (namePart[0] || "").toUpperCase().padEnd(8, " ") + " " + (namePart[1] || "").toUpperCase().padEnd(3, " ");

  const sizeStr =
    type === "dir"
      ? " <DIR>     "
      : String(size).padStart(11, " ");

  return (
    <div className="font-mono whitespace-pre">
      {dosName} {sizeStr} {date} {time ? ` ${time}` : ""}
    </div>
  );
}
