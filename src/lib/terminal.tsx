"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useRef,
  useEffect,
} from "react";

export interface TerminalBlock {
  id: string;
  slug: string;
  content: ReactNode;
}

interface TerminalState {
  history: TerminalBlock[];
  push: (block: TerminalBlock) => void;
  clear: () => void;
}

const TerminalContext = createContext<TerminalState>({
  history: [],
  push: () => {},
  clear: () => {},
});

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<TerminalBlock[]>([]);

  const push = useCallback((block: TerminalBlock) => {
    setHistory((prev) => {
      // Don't duplicate the same block at the end
      if (prev.length > 0 && prev[prev.length - 1].id === block.id) {
        return prev;
      }
      return [...prev, block];
    });
  }, []);

  const clear = useCallback(() => setHistory([]), []);

  return (
    <TerminalContext.Provider value={{ history, push, clear }}>
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal() {
  return useContext(TerminalContext);
}

/** Registers a block into terminal history on mount */
export function useRegisterBlock(slug: string, content: ReactNode) {
  const { push } = useTerminal();
  const registered = useRef(false);

  useEffect(() => {
    if (!registered.current) {
      registered.current = true;
      push({ id: `${slug}-${Date.now()}`, slug, content });
    }
  }, [slug, content, push]);
}
