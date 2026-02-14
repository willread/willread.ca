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

  // Initial state matches SSR: full content, done
  const [chars, setChars] = useState(command.length);
  const [fadeIn, setFadeIn] = useState(true);
  const [done, setDone] = useState(true);

  useLayoutEffect(() => {
    // Static or already running — skip
    if (isStatic) return;

    // Reset to start animation when it's our turn
    if (isMyTurn && done) {
      setChars(0);
      setFadeIn(false);
      setDone(false);

      let i = 0;
      let fadeTimeout: ReturnType<typeof setTimeout>;
      let doneTimeout: ReturnType<typeof setTimeout>;

      const interval = setInterval(() => {
        i++;
        setChars(i);
        if (i >= command.length) {
          clearInterval(interval);
          fadeTimeout = setTimeout(() => {
            setFadeIn(true);
            doneTimeout = setTimeout(() => {
              setDone(true);
              complete(myIndex);
            }, fadeDuration);
          }, 50);
        }
      }, speed);

      return () => {
        clearInterval(interval);
        clearTimeout(fadeTimeout);
        clearTimeout(doneTimeout);
        // Reset to full state for Strict Mode remount
        setChars(command.length);
        setFadeIn(true);
        setDone(true);
      };
    }

    // Not our turn — hide
    if (!isMyTurn) {
      setChars(0);
      setFadeIn(false);
      setDone(false);
    }
  }, [isMyTurn, isStatic]); // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = `${toDosPath(slugPath)}>`;

  // Static (history) or done
  if (isStatic || done) {
    return (
      <div>
        <div className="text-[var(--dos-prompt)]">{prompt}{command}</div>
        <div>{children}</div>
      </div>
    );
  }

  // Not our turn — SEO-safe hidden
  if (!isMyTurn) {
    return (
      <div aria-hidden style={{ position: "absolute", left: "-9999px", opacity: 0 }}>
        <div>{prompt}{command}</div>
        <div>{children}</div>
      </div>
    );
  }

  // Animating
  const typing = chars < command.length;

  return (
    <div>
      <div className="text-[var(--dos-prompt)]">
        {prompt}
        <span>{command.slice(0, chars)}</span>
        {typing && (
          <span className="cursor-blink text-[var(--dos-highlight)]">▓</span>
        )}
      </div>
      <div
        style={
          fadeIn
            ? { opacity: 1, transition: `opacity ${fadeDuration}ms ease-in` }
            : { opacity: 0 }
        }
      >
        {children}
      </div>
    </div>
  );
}
