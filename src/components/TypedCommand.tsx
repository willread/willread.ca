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

  const [hydrated, setHydrated] = useState(false);
  const [started, setStarted] = useState(false);
  const [typedChars, setTypedChars] = useState(command.length); // match SSR
  const [showContent, setShowContent] = useState(true); // match SSR
  const [animDone, setAnimDone] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  // Mark hydrated
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Start typing when hydrated + it's our turn + haven't started yet
  useEffect(() => {
    if (isStatic || !hydrated || !isMyTurn || started) return;
    setStarted(true);
    setTypedChars(0);
    setShowContent(false);
    setAnimDone(false);

    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      setTypedChars(i);
      if (i >= command.length) {
        clearInterval(intervalRef.current!);
        setShowContent(true);
        timeoutRef.current = setTimeout(() => {
          setAnimDone(true);
          complete(myIndex);
        }, fadeDuration);
      }
    }, speed);

    return cleanup;
  }, [isMyTurn, hydrated, isStatic, started, command.length, speed, fadeDuration, myIndex, complete, cleanup]);

  const prompt = `${toDosPath(slugPath)}>`;

  // Static mode (history): instant render
  if (isStatic) {
    return (
      <div>
        <div className="text-[var(--dos-prompt)]">{prompt}{command}</div>
        <div>{children}</div>
      </div>
    );
  }

  // Before hydration or animation done: show full content (matches SSR)
  if (!hydrated || animDone) {
    return (
      <div>
        <div className="text-[var(--dos-prompt)]">{prompt}{command}</div>
        <div>{children}</div>
      </div>
    );
  }

  // Hydrated but not our turn yet: hide everything (SEO content already served)
  if (!isMyTurn && !started) {
    return (
      <div style={{ position: "absolute", opacity: 0, height: 0, overflow: "hidden" }}>
        <div>{prompt}{command}</div>
        <div>{children}</div>
      </div>
    );
  }

  // Animating: typing + fade
  const isTyping = typedChars < command.length;

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
          opacity: showContent ? 1 : 0,
          transition: `opacity ${fadeDuration}ms ease-in`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
