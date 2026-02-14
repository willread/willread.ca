"use client";

import { useSearchParams } from "next/navigation";
import TypedCommand from "./TypedCommand";

interface Props {
  slugPath: string;
}

export default function CdFromParam({ slugPath }: Props) {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  if (!from) return null;

  const fromSlug = from === "/" ? "" : from;
  const fromDepth = fromSlug ? fromSlug.split("/").filter(Boolean).length : 0;
  const toDepth = slugPath ? slugPath.split("/").filter(Boolean).length : 0;

  let cdCommand: string | null = null;
  let cdPromptSlug = "";

  if (fromDepth > toDepth) {
    cdCommand = "CD ..";
    cdPromptSlug = fromSlug;
  } else if (toDepth > fromDepth) {
    const dirName = slugPath.split("/").pop()?.toUpperCase();
    if (dirName) {
      cdCommand = `CD ${dirName}`;
      cdPromptSlug = fromSlug;
    }
  }

  if (!cdCommand) return null;

  return (
    <TypedCommand id={`cd-${slugPath}-${from}`} slugPath={cdPromptSlug} command={cdCommand}>
      <div />
    </TypedCommand>
  );
}
