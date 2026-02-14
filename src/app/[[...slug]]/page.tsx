import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getDirListing, getFileContent, getAllPaths } from "@/lib/content";
import { toDosPath, parentSlug } from "@/lib/dos";
import DirListing from "@/components/DirListing";
import ClickableDir from "@/components/ClickableDir";
import FileView from "@/components/FileView";
import TerminalBlock from "@/components/TerminalBlock";
import SetCurrentDir from "@/components/SetCurrentDir";
import CdFromParam from "@/components/CdFromParam";

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

export default async function Page({ params }: Props) {
  const slugPath = slugFromParams((await params).slug);

  // File view — TYPE then root DIR for navigation
  const file = getFileContent(slugPath);
  if (file) {
    const fileParent = parentSlug(slugPath) ?? "";
    const parentDir = getDirListing(fileParent);
    const grandparent = parentSlug(fileParent);
    return (
      <TerminalBlock id={`file:${slugPath}`}>
        <SetCurrentDir slugPath={fileParent} />
        <FileView slugPath={fileParent} fileName={file.name} content={file.body} />
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
    return (
      <TerminalBlock id={`dir:${slugPath}`}>
        <SetCurrentDir slugPath={slugPath} />
        <CdFromParam slugPath={slugPath} />
        <DirListing slugPath={slugPath} entries={dir.entries} parentSlug={parent} />
      </TerminalBlock>
    );
  }

  notFound();
}
