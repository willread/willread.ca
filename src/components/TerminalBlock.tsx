"use client";

import { ReactNode, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTerminal } from "@/lib/terminal";
import { CommandQueue } from "@/lib/command-queue";

let globalNavCounter = 0;

interface Props {
  id: string;
  children: ReactNode;
}

export default function TerminalBlock({ id, children }: Props) {
  const { register } = useTerminal();
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement>(null);
  const prevPathRef = useRef(pathname);
  const navKeyRef = useRef(globalNavCounter);

  // Detect navigation synchronously during render (not in effect)
  if (prevPathRef.current !== pathname) {
    prevPathRef.current = pathname;
    navKeyRef.current = ++globalNavCounter;
  }

  const navKey = navKeyRef.current;

  useEffect(() => {
    const uniqueId = `${id}:${navKey}`;
    register(uniqueId, children);
  }, [id, navKey]);

  // Remove the SSR hide attribute once JS hydrates
  useEffect(() => {
    wrapRef.current?.removeAttribute("data-terminal-hide");
  }, [navKey]);

  return (
    <div ref={wrapRef} data-terminal-hide="">
      <CommandQueue key={navKey}>{children}</CommandQueue>
    </div>
  );
}
