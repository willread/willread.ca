"use client";

import { ReactNode, useEffect } from "react";
import { useTerminal } from "@/lib/terminal";

interface Props {
  id: string;
  children: ReactNode;
}

/**
 * Registers its children with the terminal history system.
 * When a NEW block mounts (different id), the previous block
 * gets pushed into the scrollback history.
 */
export default function TerminalBlock({ id, children }: Props) {
  const { register } = useTerminal();

  useEffect(() => {
    register(id, children);
  }, [id]); // intentionally omit children — we capture the initial render only

  return <>{children}</>;
}
