"use client";

import { ReactNode, useEffect } from "react";
import { useTerminal } from "@/lib/terminal";
import { CommandQueue } from "@/lib/command-queue";

interface Props {
  id: string;
  children: ReactNode;
}

export default function TerminalBlock({ id, children }: Props) {
  const { register } = useTerminal();

  useEffect(() => {
    register(id, children);
  }, [id]);

  return <CommandQueue>{children}</CommandQueue>;
}
