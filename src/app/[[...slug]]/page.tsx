import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getDirListing, getFileContent, getAllPaths } from "@/lib/content";
import { toDosPath, parentSlug } from "@/lib/dos";
import TypedCommand from "@/components/TypedCommand";
import DirListing from "@/components/DirListing";
import ClickableDir from "@/components/ClickableDir";
import FileView from "@/components/FileView";
import TerminalBlock from "@/components/TerminalBlock";

interface Props {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ from?: string }>;
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
    return { title: "will://", description: "Will's personal homepage — projects, posts, and more." };
  }

  const file = getFileContent(slugPath);
  if (file) {
    const title = `will://${slugPath}.txt`;
    return { title, description: file.body.slice(0, 160).replace(/[#*_\n]/g, "") };
  }

  const dir = getDirListing(slugPath);
  if (dir) {
    const title = `will://${slugPath}`;
    return { title, description: `Directory listing of ${toDosPath(slugPath)}` };
  }

  return { title: `will://${slugPath}` };
}

export default async function Page({ params, searchParams }: Props) {
  const slugPath = slugFromParams((await params).slug);
  const { from } = await searchParams;

  // File view — TYPE then root DIR for navigation
  const file = getFileContent(slugPath);
  if (file) {
    const fileParent = parentSlug(slugPath) ?? "";
    const parentDir = getDirListing(fileParent);
    const grandparent = parentSlug(fileParent);
    return (
      <TerminalBlock id={`file:${slugPath}`}>
        <FileView slugPath="" fileName={file.name} content={file.body} />
        {parentDir && (
          <ClickableDir slugPath={fileParent} entries={parentDir.entries} parentSlug={grandparent} />
        )}
      </TerminalBlock>
    );
  }

  // Directory listing
  const dir = getDirListing(slugPath);
  if (dir) {
    const parent = parentSlug(slugPath);
    // Determine CD command based on navigation source
    let cdCommand: string | null = null;
    let cdPromptSlug = "";
    if (from) {
      const fromSlug = from === "/" ? "" : from;
      const fromDepth = fromSlug ? fromSlug.split("/").filter(Boolean).length : 0;
      const toDepth = slugPath ? slugPath.split("/").filter(Boolean).length : 0;

      if (fromDepth > toDepth) {
        // Going up (e.g. posts → root)
        cdCommand = "CD ..";
        cdPromptSlug = fromSlug;
      } else if (toDepth > fromDepth) {
        // Going down (e.g. root → posts)
        const dirName = slugPath.split("/").pop()?.toUpperCase();
        if (dirName) {
          cdCommand = `CD ${dirName}`;
          cdPromptSlug = fromSlug;
        }
      }
    }
    return (
      <TerminalBlock id={`dir:${slugPath}`}>
        {cdCommand && (
          <TypedCommand id={`cd-${slugPath}-${from}`} slugPath={cdPromptSlug} command={cdCommand}>
            <div />
          </TypedCommand>
        )}
        <DirListing slugPath={slugPath} entries={dir.entries} parentSlug={parent} />
      </TerminalBlock>
    );
  }

  notFound();
}
