"use client";

import { ReactNode, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTerminal } from "@/lib/terminal";
import DosCursor from "./DosCursor";

export default function DosScreen({ children }: { children: ReactNode }) {
  const { history, pushSnapshot } = useTerminal();
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const prevPathnameRef = useRef<string>(pathname);
  const snapshotTakenRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const slugPath = pathname === "/" ? "" : pathname.slice(1);

  // When pathname changes, snapshot the current content and push to history
  useEffect(() => {
    if (
      prevPathnameRef.current !== pathname &&
      snapshotTakenRef.current !== prevPathnameRef.current &&
      contentRef.current
    ) {
      snapshotTakenRef.current = prevPathnameRef.current;
      pushSnapshot(contentRef.current.innerHTML);
    }
    prevPathnameRef.current = pathname;
  }, [pathname, pushSnapshot]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history.length, pathname]);

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-8 max-w-4xl mx-auto">
      {history.map((html, i) => (
        <div
          key={i}
          className="mb-4 opacity-60 pointer-events-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ))}

      <div ref={contentRef}>{children}</div>

      <DosCursor slugPath={slugPath} />
      <div ref={bottomRef} className="h-16" />
    </div>
  );
}
