"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
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
  const [navKey, setNavKey] = useState(0);

  useEffect(() => {
    const uniqueId = `${id}:${++globalNavCounter}`;
    register(uniqueId, children);
    setNavKey(globalNavCounter);
  }, [id, pathname]);

  // Remove the SSR hide attribute once JS hydrates
  useEffect(() => {
    wrapRef.current?.removeAttribute("data-terminal-hide");
  }, []);

  return (
    <div ref={wrapRef} data-terminal-hide="">
      <CommandQueue key={navKey}>{children}</CommandQueue>
    </div>
  );
}
