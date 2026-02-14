"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface TerminalState {
  history: string[];
  pushSnapshot: (html: string) => void;
}

const TerminalContext = createContext<TerminalState>({
  history: [],
  pushSnapshot: () => {},
});

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<string[]>([]);

  const pushSnapshot = useCallback((html: string) => {
    if (html.trim()) {
      setHistory((prev) => [...prev, html]);
    }
  }, []);

  return (
    <TerminalContext.Provider value={{ history, pushSnapshot }}>
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal() {
  return useContext(TerminalContext);
}
