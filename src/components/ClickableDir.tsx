"use client";

import { useState, useLayoutEffect } from "react";
import { FileEntry } from "@/lib/content";
import { toDosPath } from "@/lib/dos";
import { pushAnimating, popAnimating } from "@/lib/animation-state";
import { CommandQueue, useCommandQueue } from "@/lib/command-queue";
import DirListing from "./DirListing";

interface Props {
  slugPath: string;
  entries: FileEntry[];
  parentSlug?: string;
}

export default function ClickableDir({ slugPath, entries, parentSlug }: Props) {
  const { allDone: parentDone, isStatic } = useCommandQueue();
  const [clicked, setClicked] = useState(false);
  const prompt = `${toDosPath(slugPath)}>`;

  // Hide the bottom DosCursor while we're showing our own clickable prompt
  useLayoutEffect(() => {
    if (!isStatic && parentDone && !clicked) {
      pushAnimating();
      return () => popAnimating();
    }
  }, [isStatic, parentDone, clicked]);

  // In history/static mode — show completed DIR listing, no interaction
  if (isStatic) {
    return (
      <div className="mt-4">
        <DirListing slugPath={slugPath} entries={entries} parentSlug={parentSlug} />
      </div>
    );
  }

  // Don't show until parent commands (e.g. TYPE) are done
  if (!parentDone) return null;

  if (!clicked) {
    return (
      <div
        className="group mt-4 flex items-center cursor-pointer hover:bg-[rgba(85,255,85,0.2)] hover:text-black active:bg-[rgba(85,255,85,0.2)] active:text-[var(--dos-link)] transition-none"
        onClick={() => setClicked(true)}
      >
        <span className="text-[var(--dos-prompt)]">{prompt}</span>
        <span style={{ color: "var(--dos-link)" }} className="group-hover:opacity-100 opacity-50">DIR</span>
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
