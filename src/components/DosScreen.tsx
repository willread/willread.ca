"use client";

import { ReactNode, useRef, useEffect } from "react";
import { useTerminal } from "@/lib/terminal";
import DosCursor from "./DosCursor";

interface Props {
  slugPath?: string;
  children: ReactNode;
}

export default function DosScreen({ slugPath = "", children }: Props) {
  const { history } = useTerminal();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content appears
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history.length]);

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-8 max-w-4xl mx-auto">
      {/* Previous terminal output */}
      {history.map((block) => (
        <div key={block.id} className="mb-4 opacity-70">
          {block.content}
        </div>
      ))}

      {/* Current page content */}
      {children}

      <DosCursor slugPath={slugPath} />
      <div ref={bottomRef} className="h-16" />
    </div>
  );
}
