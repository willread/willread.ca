"use client";

import { ReactNode, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTerminal } from "@/lib/terminal";
import { StaticCommandQueue } from "@/lib/command-queue";
import DosCursor from "./DosCursor";

export default function DosScreen({ children }: { children: ReactNode }) {
  const { history } = useTerminal();
  const pathname = usePathname();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Always show root prompt — all commands run from C:\
  const slugPath = "";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history.length, pathname]);

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-8 max-w-4xl mx-auto">
      {/* Previous output */}
      {history.map((node, i) => (
        <div key={i} className="mb-4 opacity-60">
          <StaticCommandQueue>{node}</StaticCommandQueue>
        </div>
      ))}

      {/* Current page */}
      {children}

      <DosCursor slugPath={slugPath} />
      <div ref={bottomRef} className="h-16" />
    </div>
  );
}
