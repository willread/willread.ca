import { Metadata } from "next";
import { getDirListing, getFileContent, getAllPaths } from "@/lib/content";
import DosScreen from "@/components/DosScreen";
import DirListing from "@/components/DirListing";
import FileView from "@/components/FileView";
import Link from "next/link";

interface Props {
  params: Promise<{ slug?: string[] }>;
}

export async function generateStaticParams() {
  const paths = getAllPaths();
  return paths.map((p) => ({
    slug: p === "" ? undefined : p.split("/"),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug?.join("/") || "";

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
      title: `DIR ${dir.path} — Will`,
      description: `Directory listing of ${dir.path}`,
    };
  }

  return { title: "C:\\WILL>" };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const slugPath = slug?.join("/") || "";

  // Try as file first
  const file = getFileContent(slugPath);
  if (file) {
    const dirParts = slugPath.split("/");
    dirParts.pop();
    const parentDir = dirParts.join("/");
    const dosPath = parentDir
      ? `C:\\WILL\\${parentDir.toUpperCase().replace(/\//g, "\\")}`
      : "C:\\WILL";

    return (
      <DosScreen>
        <FileView dosPath={dosPath} fileName={file.name} content={file.body} />
        <div className="mt-4">
          <Link
            href={parentDir ? `/${parentDir}` : "/"}
            className="text-[var(--dos-prompt)] hover:text-[var(--dos-highlight)]"
          >
            {dosPath}&gt;CD ..
          </Link>
        </div>
      </DosScreen>
    );
  }

  // Try as directory
  const dir = getDirListing(slugPath);
  if (dir) {
    const parentParts = slugPath.split("/").filter(Boolean);
    parentParts.pop();
    const parentPath = slugPath ? parentParts.join("/") : undefined;

    return (
      <DosScreen>
        <DirListing
          dosPath={dir.path}
          entries={dir.entries}
          parentPath={parentPath}
        />
      </DosScreen>
    );
  }

  // 404-style
  return (
    <DosScreen>
      <div>
        <div className="text-[var(--dos-prompt)] mb-2">
          C:\WILL&gt;<span className="text-[var(--dos-highlight)]">
            {slugPath.toUpperCase()}
          </span>
        </div>
        <div className="mb-2">Bad command or file name</div>
        <Link href="/" className="text-[var(--dos-prompt)] hover:text-[var(--dos-highlight)]">
          C:\WILL&gt;CD \
        </Link>
      </div>
    </DosScreen>
  );
}
