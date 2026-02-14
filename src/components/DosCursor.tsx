import { toDosPath } from "@/lib/dos";

interface Props {
  slugPath?: string;
}

/** Blinking cursor prompt at the bottom of the screen */
export default function DosCursor({ slugPath = "" }: Props) {
  return (
    <div className="mt-4 flex items-center">
      <span className="text-[var(--dos-prompt)]">{toDosPath(slugPath)}&gt;</span>
      <span className="cursor-blink text-[var(--dos-highlight)]">▓</span>
    </div>
  );
}
