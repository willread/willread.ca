"use client";

import { ReactNode, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTerminal } from "@/lib/terminal";
import DosCursor from "./DosCursor";

export default function DosScreen({ children }: { children: ReactNode }) {
  const { history } = useTerminal();
  const pathname = usePathname();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Derive slug from pathname: "/" → "", "/posts" → "posts"
  const slugPath = pathname === "/" ? "" : pathname.slice(1);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history.length]);

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-8 max-w-4xl mx-auto">
      {history.map((block) => (
        <div key={block.id} className="mb-4 opacity-70">
          {block.content}
        </div>
      ))}

      {children}

      <DosCursor slugPath={slugPath} />
      <div ref={bottomRef} className="h-16" />
    </div>
  );
}
