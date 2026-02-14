import { ReactNode } from "react";
import DosCursor from "./DosCursor";

interface Props {
  slugPath?: string;
  children: ReactNode;
}

/** Full-screen DOS terminal wrapper with cursor at the bottom */
export default function DosScreen({ slugPath = "", children }: Props) {
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      {children}
      <DosCursor slugPath={slugPath} />
      <div className="h-16" />
    </div>
  );
}
