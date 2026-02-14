"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import { toDosPath } from "@/lib/dos";

interface Props {
  slugPath: string;
  command: string;
  children: ReactNode;
  /** ms per character */
  speed?: number;
  /** ms delay after typing before showing output */
  outputDelay?: number;
}

/**
 * Animates typing a DOS command, then reveals the output.
 * Server-renders everything visible for SEO; client animates on hydration.
 */
export default function TypedCommand({
  slugPath,
  command,
  children,
  speed = 35,
  outputDelay = 150,
}: Props) {
  const [hydrated, setHydrated] = useState(false);
  const [typedChars, setTypedChars] = useState(0);
  const [showOutput, setShowOutput] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setHydrated(true);
    setTypedChars(0);
    setShowOutput(false);

    // Start typing
    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      setTypedChars(i);
      if (i >= command.length) {
        clearInterval(intervalRef.current!);
        // Delay then show output
        setTimeout(() => setShowOutput(true), outputDelay);
      }
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [command, speed, outputDelay]);

  const prompt = `${toDosPath(slugPath)}>`;

  // Server render: show everything
  if (!hydrated) {
    return (
      <div>
        <div className="text-[var(--dos-prompt)]">
          {prompt}{command}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div>
      <div className="text-[var(--dos-prompt)]">
        {prompt}
        <span>{command.slice(0, typedChars)}</span>
        {typedChars < command.length && (
          <span className="cursor-blink text-[var(--dos-highlight)]">▓</span>
        )}
      </div>
      {/* Output stays in DOM for SEO but hidden until animation completes */}
      <div
        style={{
          visibility: showOutput ? "visible" : "hidden",
          position: showOutput ? "static" : "absolute",
          height: showOutput ? "auto" : 0,
          overflow: showOutput ? "visible" : "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
