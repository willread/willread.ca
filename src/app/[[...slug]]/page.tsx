import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDirListing, getFileContent, getAllPaths, isValidPath } from "@/lib/content";
import { toDosPath, parentSlug } from "@/lib/dos";
import TypedCommand from "@/components/TypedCommand";
import DirListing from "@/components/DirListing";
import FileView from "@/components/FileView";
import TerminalBlock from "@/components/TerminalBlock";

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

  // File view — TYPE then root DIR for navigation
  const file = getFileContent(slugPath);
  if (file) {
    const rootDir = getDirListing("");
    return (
      <TerminalBlock id={`file:${slugPath}`}>
        <FileView slugPath="" fileName={file.name} content={file.body} />
        {rootDir && (
          <div className="mt-4">
            <DirListing slugPath="" entries={rootDir.entries} />
          </div>
        )}
      </TerminalBlock>
    );
  }

  // Directory listing
  const dir = getDirListing(slugPath);
  if (dir) {
    const parent = parentSlug(slugPath);
    const dirName = slugPath.split("/").pop()?.toUpperCase();
    return (
      <TerminalBlock id={`dir:${slugPath}`}>
        {dirName ? (
          <TypedCommand slugPath={parent ?? ""} command={`CD ${dirName}`}>
            <DirListing
              slugPath={slugPath}
              entries={dir.entries}
              parentSlug={parent}
            />
          </TypedCommand>
        ) : (
          <DirListing
            slugPath={slugPath}
            entries={dir.entries}
            parentSlug={parent}
          />
        )}
      </TerminalBlock>
    );
  }

  // Not found
  notFound();
}
