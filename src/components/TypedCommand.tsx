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
  const { register, complete, activeIndex, isStatic } = useCommandQueue();
  const myIndex = useMemo(() => register(id), [id, register]);
  const isMyTurn = activeIndex >= myIndex;

  const [phase, setPhase] = useState<"idle" | "typing" | "fading" | "done">(
    isStatic ? "done" : "idle"
  );
  const [typedChars, setTypedChars] = useState(isStatic ? command.length : 0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  // Start typing when it's our turn
  useEffect(() => {
    if (isStatic || !isMyTurn || phase !== "idle") return;

    setPhase("typing");
    setTypedChars(0);

    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      setTypedChars(i);
      if (i >= command.length) {
        clearInterval(intervalRef.current!);
        setPhase("fading");
        timeoutRef.current = setTimeout(() => {
          setPhase("done");
          complete(myIndex);
        }, fadeDuration);
      }
    }, speed);

    return cleanup;
  }, [isMyTurn, isStatic, phase, command.length, speed, fadeDuration, myIndex, complete, cleanup]);

  const prompt = `${toDosPath(slugPath)}>`;

  // Static: render instantly
  if (isStatic || phase === "done") {
    return (
      <div>
        <div className="text-[var(--dos-prompt)]">{prompt}{command}</div>
        <div>{children}</div>
      </div>
    );
  }

  // Not our turn yet: hidden but in DOM for SEO
  if (phase === "idle") {
    return (
      <div style={{ position: "absolute", opacity: 0, height: 0, overflow: "hidden" }}>
        <div>{prompt}{command}</div>
        <div>{children}</div>
      </div>
    );
  }

  // Typing or fading
  return (
    <div>
      <div className="text-[var(--dos-prompt)]">
        {prompt}
        <span>{command.slice(0, typedChars)}</span>
        {phase === "typing" && typedChars < command.length && (
          <span className="cursor-blink text-[var(--dos-highlight)]">▓</span>
        )}
      </div>
      <div
        style={{
          opacity: phase === "fading" || phase === "done" ? 1 : 0,
          transition: `opacity ${fadeDuration}ms ease-in`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
