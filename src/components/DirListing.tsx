"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileEntry } from "@/lib/content";
import { toDosPath, toHref } from "@/lib/dos";
import { useCommandQueue } from "@/lib/command-queue";
import { useTerminal } from "@/lib/terminal";
import TypedCommand from "./TypedCommand";

interface Props {
  slugPath: string;
  entries: FileEntry[];
  parentSlug?: string;
}

const linkClass = "block cursor-pointer hover:bg-[rgba(85,255,85,0.2)] hover:text-black active:bg-[rgba(85,255,85,0.2)] active:text-[var(--dos-link)] transition-none";
const linkStyle = { color: "var(--dos-link)" };

export default function DirListing({ slugPath, entries, parentSlug }: Props) {
  const { isStatic } = useCommandQueue();
  const { forceNav, setCurrentDir } = useTerminal();
  const pathname = usePathname();
  const router = useRouter();

  // Compute CD command from previous dir.
  const prevDir = setCurrentDir(slugPath);
  let cdCommand: string | null = null;
  let cdPromptSlug = "";

  if (prevDir !== null) {
    const fromDepth = prevDir ? prevDir.split("/").filter(Boolean).length : 0;
    const toDepth = slugPath ? slugPath.split("/").filter(Boolean).length : 0;

    if (fromDepth > toDepth) {
      cdCommand = "CD ..";
      cdPromptSlug = prevDir;
    } else if (toDepth > fromDepth) {
      const dirName = slugPath.split("/").pop()?.toUpperCase();
      if (dirName) {
        cdCommand = `CD ${dirName}`;
        cdPromptSlug = prevDir;
      }
    }
  }

  const dosPath = toDosPath(slugPath);
  const fileCount = entries.filter((e) => e.type !== "dir").length;
  const dirCount = entries.filter((e) => e.type === "dir").length;
  const totalBytes = entries
    .filter((e) => e.type !== "dir")
    .reduce((sum, e) => sum + e.size, 0);

  return (
    <>
      {cdCommand && (
        <TypedCommand id={`cd-${slugPath}`} slugPath={cdPromptSlug} command={cdCommand}>
          <div />
        </TypedCommand>
      )}
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

          if (isStatic) {
            return <div key={entry.name} style={linkStyle}>{row}</div>;
          }

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

          const entryPath = slugPath ? `${slugPath}/${entry.slug}` : entry.slug;
          const href = toHref(entryPath);
          const isCurrent = pathname === href;

          if (isCurrent) {
            return (
              <div
                key={entry.name}
                className={`${linkClass} cursor-pointer`}
                style={linkStyle}
                onClick={() => {
                  forceNav();
                  router.refresh();
                }}
              >
                {row}
              </div>
            );
          }

          return (
            <Link key={entry.name} href={href} className={linkClass} style={linkStyle}>
              {row}
            </Link>
          );
        })}

        <pre className="font-[inherit] text-[length:inherit] leading-[inherit] mt-1 flex">
          <span>{`${`${fileCount} File(s)`.padStart(12).padEnd(13)}${totalBytes.toLocaleString()} bytes`}</span>
        </pre>
        <pre className="font-[inherit] text-[length:inherit] leading-[inherit] flex">
          <span>{`${`${dirCount + 2} Dir(s)`.padStart(12).padEnd(13)}420,694,200 bytes free`}</span>
        </pre>
      </TypedCommand>
    </>
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
