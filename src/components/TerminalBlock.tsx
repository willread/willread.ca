"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useTerminal } from "@/lib/terminal";
import { CommandQueue } from "@/lib/command-queue";

let globalNavCounter = 0;

interface Props {
  id: string;
  children: ReactNode;
}

export default function TerminalBlock({ id, children }: Props) {
  const { register } = useTerminal();
  const wrapRef = useRef<HTMLDivElement>(null);
  const navIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Reuse same navId for same base id (Strict Mode re-runs)
    if (!navIdRef.current || !navIdRef.current.startsWith(`${id}:`)) {
      navIdRef.current = `${id}:${++globalNavCounter}`;
    }
    register(navIdRef.current, children);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Remove the SSR hide attribute once JS hydrates
  useEffect(() => {
    wrapRef.current?.removeAttribute("data-terminal-hide");
  }, []);

  return (
    <div ref={wrapRef} data-terminal-hide="">
      <CommandQueue>{children}</CommandQueue>
    </div>
  );
}
