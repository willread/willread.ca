"use client";

import { ReactNode, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { toDosPath } from "@/lib/dos";
import { useCommandQueue } from "@/lib/command-queue";

interface Props {
  id: string;
  slugPath: string;
  command: string;
  children: ReactNode;
  speed?: number;
  fadeDuration?: number;
}

export default function TypedCommand({
  id,
  slugPath,
  command,
  children,
  speed = 100,
  fadeDuration = 400,
}: Props) {
  const { register, complete, activeIndex } = useCommandQueue();
  const myIndex = useMemo(() => register(id), [id, register]);

  const isMyTurn = activeIndex >= myIndex;
  const [typedChars, setTypedChars] = useState(command.length);
  const [showOutput, setShowOutput] = useState(true);
  const [started, setStarted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    if (!isMyTurn || started) return;
    setStarted(true);
    setTypedChars(0);
    setShowOutput(false);

    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      setTypedChars(i);
      if (i >= command.length) {
        clearInterval(intervalRef.current!);
        // Show output immediately, signal complete after fade
        setShowOutput(true);
        timeoutRef.current = setTimeout(() => {
          complete(myIndex);
        }, fadeDuration);
      }
    }, speed);

    return cleanup;
  }, [isMyTurn, started, command, speed, fadeDuration, myIndex, complete, cleanup]);

  const prompt = `${toDosPath(slugPath)}>`;
  const isTyping = started && typedChars < command.length;

  // Before our turn: hidden but in DOM for SEO
  if (!isMyTurn && !started) {
    return (
      <div>
        <div className="text-[var(--dos-prompt)]">
          {prompt}{command}
        </div>
        <div style={{ position: "absolute", opacity: 0, height: 0, overflow: "hidden" }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-[var(--dos-prompt)]">
        {prompt}
        <span>{command.slice(0, typedChars)}</span>
        {isTyping && (
          <span className="cursor-blink text-[var(--dos-highlight)]">▓</span>
        )}
      </div>
      <div
        style={{
          opacity: showOutput ? 1 : 0,
          transition: `opacity ${fadeDuration}ms ease-in`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
