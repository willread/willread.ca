"use client";

import { ReactNode } from "react";

export default function DosScreen({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      {children}
      <div className="mt-4 flex items-center">
        <span className="text-[var(--dos-prompt)]">C:\WILL&gt;</span>
        <span className="cursor-blink ml-0 text-[var(--dos-highlight)]">▓</span>
      </div>
      <div className="h-16" />
    </div>
  );
}
