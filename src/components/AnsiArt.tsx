"use client";

import { Fragment, useMemo } from "react";
import { parseAnsi } from "@/lib/ansi";
import styles from "./AnsiArt.module.css";

export default function AnsiArt({ content }: { content: string }) {
  const runs = useMemo(() => parseAnsi(content), [content]);
  const geometry = useMemo(() => {
    const lines = runs.map((run) => run.text).join("").replace(/\n$/, "").split("\n");
    return { width: Math.max(...lines.map((line) => Array.from(line).length)) * 8, height: lines.length * 16 };
  }, [runs]);

  return (
    <div className={styles.scroll} role="region" aria-label="ANSI project artwork; scroll horizontally on small screens" tabIndex={0}>
      <div className={styles.geometry} style={geometry}>
      <pre className={styles.art}>
        {runs.map((run, index) => (
          <span key={index} style={{ color: run.color, backgroundColor: run.background }}>
            {run.text.split(/(https?:\/\/[^\s]+)/g).map((part, partIndex) => {
              const href = /^https?:\/\//.test(part) ? part : undefined;
              return href ? (
                <a key={partIndex} href={href} target="_blank" rel="noopener noreferrer">{part}</a>
              ) : <Fragment key={partIndex}>{part}</Fragment>;
            })}
          </span>
        ))}
      </pre>
      </div>
    </div>
  );
}
