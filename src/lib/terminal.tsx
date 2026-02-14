"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useRef,
} from "react";

interface CurrentBlock {
  id: string;
  content: ReactNode;
}

interface TerminalContextValue {
  history: ReactNode[];
  register: (id: string, content: ReactNode) => void;
}

const TerminalContext = createContext<TerminalContextValue>({
  history: [],
  register: () => {},
});

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<ReactNode[]>([]);
  const currentRef = useRef<CurrentBlock | null>(null);

  const register = useCallback((id: string, content: ReactNode) => {
    if (currentRef.current && currentRef.current.id !== id) {
      const prev = currentRef.current.content;
      setHistory((h) => [...h, prev]);
    }
    currentRef.current = { id, content };
  }, []);

  return (
    <TerminalContext.Provider value={{ history, register }}>
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal() {
  return useContext(TerminalContext);
}
