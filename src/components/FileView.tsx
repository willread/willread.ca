"use client";

import Markdown from "react-markdown";
import { ReactNode } from "react";
import TypedCommand from "./TypedCommand";

interface Props {
  slugPath: string;
  fileName: string;
  content: string;
}

interface ComponentProps {
  children?: ReactNode;
  href?: string;
}

const markdownComponents = {
  h1: ({ children }: ComponentProps) => (
    <div className="text-[var(--dos-highlight)] mb-2 font-bold">{children}</div>
  ),
  h2: ({ children }: ComponentProps) => (
    <div className="text-[var(--dos-highlight)] mb-1 mt-3">{children}</div>
  ),
  h3: ({ children }: ComponentProps) => (
    <div className="text-[var(--dos-highlight)] mb-1 mt-2">{children}</div>
  ),
  p: ({ children }: ComponentProps) => <div className="mb-2">{children}</div>,
  a: ({ href, children }: ComponentProps) => (
    <a
      href={href}
      className="text-[var(--dos-highlight)] underline hover:bg-[var(--dos-fg)] hover:text-[var(--dos-bg)]"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  ul: ({ children }: ComponentProps) => <div className="mb-2 ml-2">{children}</div>,
  ol: ({ children }: ComponentProps) => <div className="mb-2 ml-2">{children}</div>,
  li: ({ children }: ComponentProps) => <div>· {children}</div>,
  strong: ({ children }: ComponentProps) => (
    <span className="text-[var(--dos-highlight)]">{children}</span>
  ),
  em: ({ children }: ComponentProps) => <span className="italic">{children}</span>,
  code: ({ children }: ComponentProps) => (
    <span className="text-[var(--dos-highlight)]">{children}</span>
  ),
  hr: () => (
    <hr className="my-2 border-t border-[var(--dos-prompt)]" />
  ),
  blockquote: ({ children }: ComponentProps) => (
    <div className="ml-2 pl-2 border-l-2 border-[var(--dos-prompt)]">
      {children}
    </div>
  ),
};

export default function FileView({ slugPath, fileName, content }: Props) {
  return (
    <TypedCommand id={`type-${fileName}`} slugPath={slugPath} command={`TYPE ${fileName}`}>
      <div className="mt-2 break-words">
        <Markdown components={markdownComponents}>{content}</Markdown>
      </div>
    </TypedCommand>
  );
}
