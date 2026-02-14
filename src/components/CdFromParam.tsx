"use client";

import { useState, useEffect } from "react";
import { useTerminal } from "@/lib/terminal";
import TypedCommand from "./TypedCommand";

interface Props {
  slugPath: string;
}

export default function CdFromParam({ slugPath }: Props) {
  const { consumePrevDir } = useTerminal();
  const [from, setFrom] = useState<string | null>(null);

  useEffect(() => {
    setFrom(consumePrevDir());
  }, [consumePrevDir]);

  if (from === null) return null;

  const fromDepth = from ? from.split("/").filter(Boolean).length : 0;
  const toDepth = slugPath ? slugPath.split("/").filter(Boolean).length : 0;

  let cdCommand: string | null = null;
  let cdPromptSlug = "";

  if (fromDepth > toDepth) {
    cdCommand = "CD ..";
    cdPromptSlug = from;
  } else if (toDepth > fromDepth) {
    const dirName = slugPath.split("/").pop()?.toUpperCase();
    if (dirName) {
      cdCommand = `CD ${dirName}`;
      cdPromptSlug = from;
    }
  }

  if (!cdCommand) return null;

  return (
    <TypedCommand id={`cd-${slugPath}-${from}`} slugPath={cdPromptSlug} command={cdCommand}>
      <div />
    </TypedCommand>
  );
}
