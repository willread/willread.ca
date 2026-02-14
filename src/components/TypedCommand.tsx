"use client";

import { ReactNode, useState, useLayoutEffect, useRef, useMemo } from "react";
import { toDosPath } from "@/lib/dos";
import { useCommandQueue } from "@/lib/command-queue";

interface Props {
  id: string;
  slugPath: string;
  command: string;
  children: ReactNode;
  speed?: number;
}

// line-height 1.3 * 16px = 20.8px
const LINE_HEIGHT = 20.8;

export default function TypedCommand({
  id,
  slugPath,
  command,
  children,
  speed = 50,
}: Props) {
  const { register, complete, activeIndex, isStatic } = useCommandQueue();
  const myIndex = useMemo(() => register(id), [id, register]);
  const isMyTurn = activeIndex >= myIndex;

  const contentRef = useRef<HTMLDivElement>(null);

  // Phase: "idle" (waiting) | "typing" | "revealing" | "done"
  const [phase, setPhase] = useState<"idle" | "typing" | "revealing" | "done">("done");
  const [chars, setChars] = useState(command.length);
  const [revealHeight, setRevealHeight] = useState<number | null>(null); // null = show all

  useLayoutEffect(() => {
    if (isStatic) return;

    if (isMyTurn) {
      // Start animation
      setPhase("typing");
      setChars(0);
      setRevealHeight(0);

      let charIndex = 0;
      let cancelled = false;

      const typeInterval = setInterval(() => {
        if (cancelled) return;
        charIndex++;
        setChars(charIndex);
        if (charIndex >= command.length) {
          clearInterval(typeInterval);
          // Small pause then start revealing content
          setTimeout(() => {
            if (cancelled) return;
            setPhase("revealing");

            const totalHeight = contentRef.current?.scrollHeight ?? 0;
            if (totalHeight === 0) {
              // No content to reveal
              setRevealHeight(null);
              setPhase("done");
              complete(myIndex);
              return;
            }

            let currentHeight = 0;
            const revealInterval = setInterval(() => {
              if (cancelled) return;
              currentHeight += LINE_HEIGHT;
              if (currentHeight >= totalHeight) {
                clearInterval(revealInterval);
                setRevealHeight(null);
                setPhase("done");
                complete(myIndex);
              } else {
                setRevealHeight(currentHeight);
              }
            }, speed);
          }, 50);
        }
      }, speed);

      return () => {
        cancelled = true;
        clearInterval(typeInterval);
        // Reset to SSR state for Strict Mode cleanup
        setChars(command.length);
        setRevealHeight(null);
        setPhase("done");
      };
    }

    // Not our turn — go idle
    setPhase("idle");
    setChars(0);
    setRevealHeight(0);
  }, [isMyTurn, isStatic]); // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = `${toDosPath(slugPath)}>`;

  // Static mode (history) — render everything instantly
  if (isStatic) {
    return (
      <div>
        <div className="text-[var(--dos-prompt)]">{prompt}{command}</div>
        <div>{children}</div>
      </div>
    );
  }

  // Not our turn — hidden but SEO-accessible
  if (phase === "idle") {
    return (
      <div aria-hidden style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }}>
        <div>{prompt}{command}</div>
        <div>{children}</div>
      </div>
    );
  }

  // Typing or revealing or done
  const typing = phase === "typing";
  const contentStyle: React.CSSProperties =
    revealHeight !== null
      ? { maxHeight: revealHeight, overflow: "hidden" }
      : {};

  return (
    <div>
      <div className="text-[var(--dos-prompt)]">
        {prompt}
        <span>{command.slice(0, chars)}</span>
        {typing && (
          <span className="cursor-blink text-[var(--dos-highlight)]">▓</span>
        )}
      </div>
      <div ref={contentRef} style={contentStyle}>
        {children}
      </div>
    </div>
  );
}
