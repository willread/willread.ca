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
  navKey: number;
  register: (id: string, content: ReactNode) => void;
  forceNav: () => void;
}

const TerminalContext = createContext<TerminalContextValue>({
  history: [],
  navKey: 0,
  register: () => {},
  forceNav: () => {},
});

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<ReactNode[]>([]);
  const [navKey, setNavKey] = useState(0);
  const currentRef = useRef<CurrentBlock | null>(null);

  const register = useCallback((id: string, content: ReactNode) => {
    if (currentRef.current && currentRef.current.id !== id) {
      const prev = currentRef.current.content;
      setHistory((h) => [...h, prev]);
    }
    currentRef.current = { id, content };
  }, []);

  const forceNav = useCallback(() => {
    // Push current to history and bump navKey to force remount
    if (currentRef.current) {
      const prev = currentRef.current.content;
      setHistory((h) => [...h, prev]);
      currentRef.current = null;
    }
    setNavKey((k) => k + 1);
  }, []);

  return (
    <TerminalContext.Provider value={{ history, navKey, register, forceNav }}>
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal() {
  return useContext(TerminalContext);
}
