import { Metadata } from "next";
import Link from "next/link";
import { getDirListing, getFileContent, getAllPaths } from "@/lib/content";
import { toDosPath, toHref, parentSlug } from "@/lib/dos";
import DosScreen from "@/components/DosScreen";
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
      title: "C:\\WILL>",
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

  return { title: "C:\\WILL>" };
}

export default async function Page({ params }: Props) {
  const slugPath = slugFromParams((await params).slug);

  // File view
  const file = getFileContent(slugPath);
  if (file) {
    const parent = parentSlug(slugPath) ?? "";
    return (
      <DosScreen slugPath={parent}>
        <FileView slugPath={parent} fileName={file.name} content={file.body} />
        <div className="mt-4">
          <Link
            href={toHref(parent)}
            className="text-[var(--dos-prompt)] hover:text-[var(--dos-highlight)]"
          >
            {toDosPath(parent)}&gt;CD ..
          </Link>
        </div>
      </DosScreen>
    );
  }

  // Directory listing
  const dir = getDirListing(slugPath);
  if (dir) {
    return (
      <DosScreen slugPath={slugPath}>
        <DirListing
          slugPath={slugPath}
          entries={dir.entries}
          parentSlug={parentSlug(slugPath)}
        />
      </DosScreen>
    );
  }

  // 404
  return (
    <DosScreen>
      <DosPrompt slugPath="" command={slugPath.toUpperCase()} />
      <div className="mt-2 mb-2">Bad command or file name</div>
      <Link
        href="/"
        className="text-[var(--dos-prompt)] hover:text-[var(--dos-highlight)]"
      >
        C:\WILL&gt;CD \
      </Link>
    </DosScreen>
  );
}
