"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { FileEntry } from "@/lib/content";
import { toDosPath } from "@/lib/dos";
import { setAnimating } from "@/lib/animation-state";
import { CommandQueue, useCommandQueue } from "@/lib/command-queue";
import DirListing from "./DirListing";

interface Props {
  slugPath: string;
  entries: FileEntry[];
  parentSlug?: string;
}

export default function ClickableDir({ slugPath, entries, parentSlug }: Props) {
  const { allDone: parentDone } = useCommandQueue();
  const [clicked, setClicked] = useState(false);
  const prompt = `${toDosPath(slugPath)}>`;

  // Hide the bottom DosCursor while we're showing our own clickable prompt
  // useLayoutEffect to prevent flash of DosCursor between CommandQueue done and this taking over
  useLayoutEffect(() => {
    if (parentDone && !clicked) {
      setAnimating(true);
      return () => setAnimating(false);
    }
  }, [parentDone, clicked]);

  // Don't show until parent commands (e.g. TYPE) are done
  if (!parentDone) return null;

  if (!clicked) {
    return (
      <div
        className="mt-4 flex items-center cursor-pointer hover:bg-[#aaa] hover:text-black transition-none"
        style={{ color: "#ffffff", opacity: 0.5 }}
        onClick={() => setClicked(true)}
      >
        <span className="text-[var(--dos-prompt)]">{prompt}</span>
        <span>DIR</span>
        <span className="cursor-blink text-[var(--dos-highlight)]">▓</span>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <CommandQueue>
        <DirListing slugPath={slugPath} entries={entries} parentSlug={parentSlug} />
      </CommandQueue>
    </div>
  );
}
