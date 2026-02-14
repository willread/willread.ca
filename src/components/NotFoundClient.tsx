"use client";

import { useLayoutEffect } from "react";
import Link from "next/link";
import { toDosPath } from "@/lib/dos";
import { pushAnimating, popAnimating } from "@/lib/animation-state";
import { useCommandQueue } from "@/lib/command-queue";

export default function NotFoundClient() {
  const { allDone: parentDone, isStatic } = useCommandQueue();
  const prompt = `${toDosPath("")}>`;
  const command = "CD \\";

  // Hide the bottom DosCursor while we're showing our own clickable prompt
  useLayoutEffect(() => {
    if (!isStatic && parentDone) {
      pushAnimating();
      return () => popAnimating();
    }
  }, [isStatic, parentDone]);

  // In history/static mode — show completed state, no interaction
  if (isStatic) {
    return (
      <>
        <p className="text-[var(--dos-prompt)]">Bad command or file name</p>
        <div className="mt-4 text-[var(--dos-prompt)]">{prompt}{command}</div>
      </>
    );
  }

  // Don't show until parent commands are done
  if (!parentDone) return null;

  return (
    <>
      <p className="text-[var(--dos-prompt)]">Bad command or file name</p>
      <Link
        href="/"
        className="group mt-4 flex items-center cursor-pointer hover:bg-[rgba(85,255,85,0.2)] hover:text-black active:bg-[rgba(85,255,85,0.2)] active:text-[var(--dos-link)] transition-none"
      >
        <span className="text-[var(--dos-prompt)]">{prompt}</span>
        <span style={{ color: "var(--dos-link)" }} className="group-hover:opacity-100 opacity-50">{command}</span>
        <span className="cursor-blink text-[var(--dos-highlight)]">▓</span>
      </Link>
    </>
  );
}
