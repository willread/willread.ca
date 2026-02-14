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
  searchParams: Promise<{ cd?: string }>; // cd = source slugPath when navigating via ".."
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
  const { cd } = await searchParams;

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
    const dirName = slugPath.split("/").pop()?.toUpperCase();
    // cd param = source slug when navigating via ".."
    const isGoingUp = cd !== undefined;
    const cdCommand = isGoingUp ? "CD .." : dirName ? `CD ${dirName}` : null;
    // CD .. is typed from the child dir's prompt; CD DIRNAME from the parent's prompt
    const cdPromptSlug = isGoingUp ? cd : (parent ?? "");
    const blockKey = isGoingUp ? `dir:${slugPath}:from:${cd}` : `dir:${slugPath}`;
    return (
      <TerminalBlock id={blockKey}>
        {cdCommand && (
          <TypedCommand id={`cd-${blockKey}`} slugPath={cdPromptSlug} command={cdCommand}>
            <div />
          </TypedCommand>
        )}
        <DirListing slugPath={slugPath} entries={dir.entries} parentSlug={parent} />
      </TerminalBlock>
    );
  }

  return (
    <div className="text-[var(--dos-prompt)]">Bad command or file name</div>
  );
}
