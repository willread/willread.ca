"use client";

import { Fragment, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnsiRun, parseAnsi, splitFramedAnsiPage } from "@/lib/ansi";
import styles from "./AnsiArt.module.css";

function Runs({ runs }: { runs: AnsiRun[] }) {
  return runs.map((run, index) => (
    <span key={index} style={{ color: run.color, backgroundColor: run.background }}>
      {run.text.split(/(https?:\/\/[^\s]+)/g).map((part, partIndex) => (
        /^https?:\/\//.test(part)
          ? <a key={partIndex} href={part} target="_blank" rel="noopener noreferrer">{part}</a>
          : <Fragment key={partIndex}>{part}</Fragment>
      ))}
    </span>
  ));
}

function MobileAnsiSection({ runs, rows, width, scale }: { runs: AnsiRun[]; rows: number; width: number; scale: number }) {
  return (
    <div className={styles.mobileSection}>
      <div className={styles.mobileArt} style={{ height: rows * 16 * scale }}>
        {/* Crop the two side cells (ANSI border + padding); CSS owns the frame. */}
        <div className={styles.mobileNative} style={{ width, height: rows * 16, left: -16 * scale, transform: `scale(${scale})` }}>
          <pre className={styles.art}><Runs runs={runs} /></pre>
        </div>
      </div>
    </div>
  );
}

export default function AnsiArt({ content }: { content: string }) {
  const runs = useMemo(() => parseAnsi(content), [content]);
  const mobile = useMemo(() => splitFramedAnsiPage(content), [content]);
  const headerRuns = useMemo(() => mobile ? parseAnsi(mobile.header) : [], [mobile]);
  const pictureRuns = useMemo(() => mobile ? parseAnsi(mobile.picture) : [], [mobile]);
  const geometry = useMemo(() => {
    const lines = runs.map((run) => run.text).join("").replace(/\n$/, "").split("\n");
    return { width: Math.max(...lines.map((line) => Array.from(line).length)) * 8, height: lines.length * 16 };
  }, [runs]);
  const container = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(geometry.width);

  useLayoutEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setAvailableWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const compact = !!mobile && availableWidth < geometry.width;
  // Fixed 3px CSS borders; scale just the 76 inner character columns.
  const scale = Math.max(0, (availableWidth - 6) / (geometry.width - 32));

  return (
    <div ref={container} className={styles.scroll} style={{ width: geometry.width }}>
      {compact ? (
        <div className={styles.mobileFrame}>
          <MobileAnsiSection runs={headerRuns} rows={mobile.headerRows} width={geometry.width} scale={scale} />
          <MobileAnsiSection runs={pictureRuns} rows={mobile.pictureRows} width={geometry.width} scale={scale} />
          <div className={styles.copy}>
            <h2>{mobile.heading}</h2>
            {mobile.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
          <div className={styles.callout}>
            {mobile.callout && <p>{mobile.callout}</p>}
            <a href={mobile.url} target="_blank" rel="noopener noreferrer">{mobile.url}</a>
          </div>
        </div>
      ) : (
        <div className={styles.geometry} style={geometry}>
          <pre className={styles.art}><Runs runs={runs} /></pre>
        </div>
      )}
    </div>
  );
}
