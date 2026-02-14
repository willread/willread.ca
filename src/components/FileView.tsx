"use client";

import Markdown from "react-markdown";
import TypedCommand from "./TypedCommand";

interface Props {
  slugPath: string;
  fileName: string;
  content: string;
}

const markdownComponents = {
  h1: ({ children }: any) => (
    <div className="text-[var(--dos-highlight)] mb-2 font-bold">{children}</div>
  ),
  h2: ({ children }: any) => (
    <div className="text-[var(--dos-highlight)] mb-1 mt-3">{children}</div>
  ),
  h3: ({ children }: any) => (
    <div className="text-[var(--dos-highlight)] mb-1 mt-2">{children}</div>
  ),
  p: ({ children }: any) => <div className="mb-2">{children}</div>,
  a: ({ href, children }: any) => (
    <a
      href={href}
      className="text-[var(--dos-highlight)] underline hover:bg-[var(--dos-fg)] hover:text-[var(--dos-bg)]"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  ul: ({ children }: any) => <div className="mb-2 ml-2">{children}</div>,
  ol: ({ children }: any) => <div className="mb-2 ml-2">{children}</div>,
  li: ({ children }: any) => <div>· {children}</div>,
  strong: ({ children }: any) => (
    <span className="text-[var(--dos-highlight)]">{children}</span>
  ),
  em: ({ children }: any) => <span className="italic">{children}</span>,
  code: ({ children }: any) => (
    <span className="text-[var(--dos-highlight)]">{children}</span>
  ),
  hr: () => (
    <div className="my-2 text-[var(--dos-prompt)]">{"─".repeat(60)}</div>
  ),
  blockquote: ({ children }: any) => (
    <div className="ml-2 pl-2 border-l-2 border-[var(--dos-prompt)]">
      {children}
    </div>
  ),
};

export default function FileView({ slugPath, fileName, content }: Props) {
  return (
    <TypedCommand slugPath={slugPath} command={`TYPE ${fileName}`}>
      <div className="mt-2 leading-relaxed break-words">
        <Markdown components={markdownComponents}>{content}</Markdown>
      </div>
    </TypedCommand>
  );
}
