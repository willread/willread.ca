"use client";

import { ReactNode, useRef, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTerminal } from "@/lib/terminal";
import { StaticCommandQueue } from "@/lib/command-queue";
import DosCursor from "./DosCursor";

let screenNavCounter = 0;

export default function DosScreen({ children }: { children: ReactNode }) {
  const { history } = useTerminal();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevPathRef = useRef(pathname);
  const navKeyRef = useRef(screenNavCounter);

  // Detect navigation synchronously
  if (prevPathRef.current !== pathname) {
    prevPathRef.current = pathname;
    navKeyRef.current = ++screenNavCounter;
  }

  // Auto-scroll whenever DOM content changes (typing, revealing, navigation)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scroll = () => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const observer = new MutationObserver(scroll);
    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["style"],
    });

    scroll();
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen p-3 sm:p-4 md:p-8 max-w-4xl mx-auto">
      {/* Previous output */}
      {history.map((node, i) => (
        <div key={i} className="mb-4 opacity-30">
          <StaticCommandQueue>{node}</StaticCommandQueue>
        </div>
      ))}

      {/* Current page — key forces full remount on navigation */}
      <div key={navKeyRef.current}>
        {children}
      </div>

      <DosCursor slugPath="" />
      <div ref={bottomRef} className="h-16" />
    </div>
  );
}
