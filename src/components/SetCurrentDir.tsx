"use client";

import { useEffect } from "react";
import { useTerminal } from "@/lib/terminal";

export default function SetCurrentDir({ slugPath }: { slugPath: string }) {
  const { setCurrentDir } = useTerminal();
  useEffect(() => {
    setCurrentDir(slugPath);
  }, [slugPath, setCurrentDir]);
  return null;
}
