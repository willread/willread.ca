import { toDosPath } from "@/lib/dos";

interface Props {
  slugPath: string;
  command?: string;
}

/** Renders a DOS prompt line: C:\WILL\POSTS>DIR */
export default function DosPrompt({ slugPath, command }: Props) {
  return (
    <div className="text-[var(--dos-prompt)]">
      {toDosPath(slugPath)}&gt;
      {command && <span>{command}</span>}
    </div>
  );
}
