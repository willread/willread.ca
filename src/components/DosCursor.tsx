"use client";

import { toDosPath } from "@/lib/dos";
import { useIsAnimating } from "@/lib/animation-state";

interface Props {
  slugPath?: string;
}

export default function DosCursor({ slugPath = "" }: Props) {
  const animating = useIsAnimating();

  if (animating) return null;

  return (
    <div className="mt-4 flex items-center">
      <span className="text-[var(--dos-prompt)]">{toDosPath(slugPath)}&gt;</span>
      <span className="cursor-blink text-[var(--dos-highlight)]">▓</span>
    </div>
  );
}
