"use client";

import Markdown from "react-markdown";

interface Props {
  dosPath: string;
  fileName: string;
  content: string;
}

export default function FileView({ dosPath, fileName, content }: Props) {
  return (
    <div>
      <div className="text-[var(--dos-prompt)] mb-2">
        {dosPath}&gt;<span className="text-[var(--dos-highlight)]">TYPE {fileName}</span>
      </div>
      <div className="dos-markdown leading-relaxed">
        <Markdown
          components={{
            h1: ({ children }) => (
              <div className="text-[var(--dos-highlight)] mb-2 font-bold">{children}</div>
            ),
            h2: ({ children }) => (
              <div className="text-[var(--dos-highlight)] mb-1 mt-3">{children}</div>
            ),
            h3: ({ children }) => (
              <div className="text-[var(--dos-highlight)] mb-1 mt-2">{children}</div>
            ),
            p: ({ children }) => <div className="mb-2">{children}</div>,
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-[var(--dos-highlight)] underline hover:bg-[var(--dos-fg)] hover:text-[var(--dos-bg)]"
                target={href?.startsWith("http") ? "_blank" : undefined}
                rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {children}
              </a>
            ),
            ul: ({ children }) => <div className="mb-2 ml-2">{children}</div>,
            ol: ({ children }) => <div className="mb-2 ml-2">{children}</div>,
            li: ({ children }) => <div>· {children}</div>,
            strong: ({ children }) => (
              <span className="text-[var(--dos-highlight)]">{children}</span>
            ),
            em: ({ children }) => <span className="italic">{children}</span>,
            code: ({ children }) => (
              <span className="text-[var(--dos-highlight)]">{children}</span>
            ),
            hr: () => (
              <div className="my-2 text-[var(--dos-prompt)]">
                {"─".repeat(60)}
              </div>
            ),
            blockquote: ({ children }) => (
              <div className="ml-2 pl-2 border-l-2 border-[var(--dos-prompt)]">
                {children}
              </div>
            ),
          }}
        >
          {content}
        </Markdown>
      </div>
    </div>
  );
}
