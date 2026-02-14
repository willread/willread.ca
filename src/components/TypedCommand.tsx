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
  speed = 120,
  outputDelay = 400,
}: Props) {
  const [animating, setAnimating] = useState(false);
  const [typedChars, setTypedChars] = useState(command.length);
  const [outputOpacity, setOutputOpacity] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    const start = setTimeout(() => {
      setAnimating(true);
      setTypedChars(0);
      setOutputOpacity(0);

      let i = 0;
      intervalRef.current = setInterval(() => {
        i++;
        setTypedChars(i);
        if (i >= command.length) {
          clearInterval(intervalRef.current!);
          timeoutRef.current = setTimeout(() => {
            setOutputOpacity(1);
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
        style={{
          opacity: outputOpacity,
          transition: "opacity 0.6s ease-in",
        }}
      >
        {children}
      </div>
    </div>
  );
}
