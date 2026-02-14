"use client";

import { ReactNode, useState, useEffect, useRef, useCallback } from "react";
import { toDosPath } from "@/lib/dos";

interface Props {
  slugPath: string;
  command: string;
  children: ReactNode;
  speed?: number;
  outputDelay?: number;
}

export default function TypedCommand({
  slugPath,
  command,
  children,
  speed = 35,
  outputDelay = 150,
}: Props) {
  const [animating, setAnimating] = useState(false);
  const [typedChars, setTypedChars] = useState(command.length);
  const [showOutput, setShowOutput] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  // On mount (hydration), start the typing animation
  useEffect(() => {
    // Brief delay to let hydration settle
    const start = setTimeout(() => {
      setAnimating(true);
      setTypedChars(0);
      setShowOutput(false);

      let i = 0;
      intervalRef.current = setInterval(() => {
        i++;
        setTypedChars(i);
        if (i >= command.length) {
          clearInterval(intervalRef.current!);
          timeoutRef.current = setTimeout(() => {
            setShowOutput(true);
            setAnimating(false);
          }, outputDelay);
        }
      }, speed);
    }, 50);

    return () => {
      clearTimeout(start);
      cleanup();
    };
  }, [command, speed, outputDelay, cleanup]);

  const prompt = `${toDosPath(slugPath)}>`;

  return (
    <div>
      <div className="text-[var(--dos-prompt)]">
        {prompt}
        <span>{command.slice(0, typedChars)}</span>
        {animating && typedChars < command.length && (
          <span className="cursor-blink text-[var(--dos-highlight)]">▓</span>
        )}
      </div>
      <div
        style={
          showOutput
            ? undefined
            : {
                visibility: "hidden" as const,
                position: "absolute" as const,
                height: 0,
                overflow: "hidden" as const,
              }
        }
      >
        {children}
      </div>
    </div>
  );
}
