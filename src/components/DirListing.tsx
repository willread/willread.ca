import Link from "next/link";
import { FileEntry } from "@/lib/content";
import { toDosPath, toHref, entryToSlug, formatDosRow } from "@/lib/dos";
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

  return (
    <div>
      <DosPrompt slugPath={slugPath} command="DIR" />

      <div className="mt-1"> Volume in drive C is WILL</div>
      <div> Volume Serial Number is 1337-DEAD</div>
      <div className="mt-1 mb-2"> Directory of {dosPath}</div>

      {/* . and .. entries */}
      <DirRow name="." type="dir" size={0} date="" time="" />
      {parentSlug !== undefined && (
        <Link
          href={toHref(parentSlug)}
          className="block hover:bg-[var(--dos-fg)] hover:text-[var(--dos-bg)] transition-none"
        >
          <DirRow name=".." type="dir" size={0} date="" time="" />
        </Link>
      )}

      {/* File/dir entries */}
      {entries.map((entry) => {
        const entrySlugPart = entryToSlug(entry.name, entry.type);
        const href = toHref(slugPath ? `${slugPath}/${entrySlugPart}` : entrySlugPart);

        return (
          <Link
            key={entry.name}
            href={href}
            className="block hover:bg-[var(--dos-fg)] hover:text-[var(--dos-bg)] transition-none"
          >
            <DirRow {...entry} />
          </Link>
        );
      })}

      {/* Summary */}
      <div className="mt-1">
        {"     "}{fileCount} File(s){"     "}{totalBytes.toLocaleString()} bytes
      </div>
      <div>
        {"     "}{dirCount + 2} Dir(s){"  "}420,694,200 bytes free
      </div>
    </div>
  );
}

function DirRow({ name, type, size, date, time }: FileEntry & { name: string }) {
  return (
    <div className="font-mono whitespace-pre">
      {formatDosRow(name, type, size, date, time)}
    </div>
  );
}
