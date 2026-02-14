import { Metadata } from "next";
import Link from "next/link";
import { getDirListing, getFileContent, getAllPaths } from "@/lib/content";
import { toDosPath, toHref, parentSlug } from "@/lib/dos";
import DosPrompt from "@/components/DosPrompt";
import DirListing from "@/components/DirListing";
import FileView from "@/components/FileView";

interface Props {
  params: Promise<{ slug?: string[] }>;
}

function slugFromParams(slug?: string[]): string {
  return slug?.join("/") || "";
}

export async function generateStaticParams() {
  return getAllPaths().map((p) => ({
    slug: p === "" ? undefined : p.split("/"),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slugPath = slugFromParams((await params).slug);

  if (!slugPath) {
    return {
      title: "C:\\>",
      description: "Will's personal homepage — projects, posts, and more.",
    };
  }

  const file = getFileContent(slugPath);
  if (file) {
    return {
      title: `TYPE ${file.name} — Will`,
      description: file.body.slice(0, 160).replace(/[#*_\n]/g, ""),
    };
  }

  const dir = getDirListing(slugPath);
  if (dir) {
    return {
      title: `DIR ${toDosPath(slugPath)} — Will`,
      description: `Directory listing of ${toDosPath(slugPath)}`,
    };
  }

  return { title: "C:\\>" };
}

export default async function Page({ params }: Props) {
  const slugPath = slugFromParams((await params).slug);

  // File view — show file content then parent DIR for navigation
  const file = getFileContent(slugPath);
  if (file) {
    const parent = parentSlug(slugPath) ?? "";
    const parentDir = getDirListing(parent);
    return (
      <>
        <FileView slugPath={parent} fileName={file.name} content={file.body} />
        {parentDir && (
          <div className="mt-4">
            <DirListing
              slugPath={parent}
              entries={parentDir.entries}
              parentSlug={parentSlug(parent)}
            />
          </div>
        )}
      </>
    );
  }

  // Directory listing
  const dir = getDirListing(slugPath);
  if (dir) {
    return (
      <DirListing
        slugPath={slugPath}
        entries={dir.entries}
        parentSlug={parentSlug(slugPath)}
      />
    );
  }

  // 404
  return (
    <div>
      <DosPrompt slugPath="" command={slugPath.toUpperCase()} />
      <div className="mt-2 mb-2">Bad command or file name</div>
      <Link
        href="/"
        className="text-[var(--dos-prompt)] hover:text-[var(--dos-highlight)]"
      >
        C:\&gt;CD \
      </Link>
    </div>
  );
}
