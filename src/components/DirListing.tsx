"use client";

import Link from "next/link";
import { FileEntry } from "@/lib/content";
import { toDosPath, toHref, entryToSlug } from "@/lib/dos";
import { useRegisterBlock } from "@/lib/terminal";
import DosPrompt from "./DosPrompt";

interface Props {
  slugPath: string;
  entries: FileEntry[];
  parentSlug?: string;
}

export default function DirListing({ slugPath, entries, parentSlug }: Props) {
  const dosPath = toDosPath(slugPath);
  const fileCount = entries.filter((e) => e.type === "file").length;
  const dirCount = entries.filter((e) => e.type === "dir").length;
  const totalBytes = entries
    .filter((e) => e.type === "file")
    .reduce((sum, e) => sum + e.size, 0);

  const currentOutput = (
    <DirOutput
      slugPath={slugPath}
      dosPath={dosPath}
      entries={entries}
      parentSlug={parentSlug}
      fileCount={fileCount}
      dirCount={dirCount}
      totalBytes={totalBytes}
      interactive={false}
    />
  );

  useRegisterBlock(`dir-${slugPath}`, currentOutput);

  return (
    <DirOutput
      slugPath={slugPath}
      dosPath={dosPath}
      entries={entries}
      parentSlug={parentSlug}
      fileCount={fileCount}
      dirCount={dirCount}
      totalBytes={totalBytes}
      interactive
    />
  );
}

interface DirOutputProps {
  slugPath: string;
  dosPath: string;
  entries: FileEntry[];
  parentSlug?: string;
  fileCount: number;
  dirCount: number;
  totalBytes: number;
  interactive: boolean;
}

function DirOutput({
  slugPath,
  dosPath,
  entries,
  parentSlug,
  fileCount,
  dirCount,
  totalBytes,
  interactive,
}: DirOutputProps) {
  return (
    <div>
      <DosPrompt slugPath={slugPath} command="DIR" />

      <div className="mt-1"> Volume in drive C is WILL</div>
      <div> Volume Serial Number is 1337-DEAD</div>
      <div className="mt-1 mb-2"> Directory of {dosPath}</div>

      <DirRow name="." type="dir" />
      {parentSlug !== undefined && (
        <MaybeLink href={toHref(parentSlug)} interactive={interactive}>
          <DirRow name=".." type="dir" />
        </MaybeLink>
      )}

      {entries.map((entry) => {
        const entrySlugPart = entryToSlug(entry.name, entry.type);
        const href = toHref(
          slugPath ? `${slugPath}/${entrySlugPart}` : entrySlugPart
        );

        return (
          <MaybeLink key={entry.name} href={href} interactive={interactive}>
            <DirRow
              name={entry.name}
              type={entry.type}
              size={entry.size}
              date={entry.date}
              time={entry.time}
            />
          </MaybeLink>
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
    </div>
  );
}

function MaybeLink({
  href,
  interactive,
  children,
}: {
  href: string;
  interactive: boolean;
  children: React.ReactNode;
}) {
  if (!interactive) return <>{children}</>;
  return (
    <Link
      href={href}
      className="block hover:bg-[var(--dos-fg)] hover:text-[var(--dos-bg)] transition-none"
    >
      {children}
    </Link>
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
  type: "file" | "dir";
  size?: number;
  date?: string;
  time?: string;
}) {
  // 8.3 name formatting
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
