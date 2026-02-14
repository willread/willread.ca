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

  useEffect(() => {
    const uniqueId = `${id}:${++globalNavCounter}`;
    register(uniqueId, children);
  }, [id]);

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
