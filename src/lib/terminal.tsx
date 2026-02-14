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
  currentDir: string;
  register: (id: string, content: ReactNode) => void;
  forceNav: () => void;
  setCurrentDir: (dir: string) => void;
}

const TerminalContext = createContext<TerminalContextValue>({
  history: [],
  navKey: 0,
  currentDir: "",
  register: () => {},
  forceNav: () => {},
  setCurrentDir: () => {},
});

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<ReactNode[]>([]);
  const [navKey, setNavKey] = useState(0);
  const [currentDir, setCurrentDir] = useState("");
  const currentRef = useRef<CurrentBlock | null>(null);
  const lastPushedRef = useRef<string | null>(null);

  const register = useCallback((id: string, content: ReactNode) => {
    // Same id — update content, don't push (handles Strict Mode re-runs)
    if (currentRef.current && currentRef.current.id === id) {
      currentRef.current = { id, content };
      return;
    }
    // Different id — push previous to history (but not if already pushed)
    if (currentRef.current && currentRef.current.id !== lastPushedRef.current) {
      const prev = currentRef.current.content;
      lastPushedRef.current = currentRef.current.id;
      setHistory((h) => [...h, prev]);
    }
    currentRef.current = { id, content };
  }, []);

  const forceNav = useCallback(() => {
    if (currentRef.current) {
      const prev = currentRef.current.content;
      lastPushedRef.current = currentRef.current.id;
      setHistory((h) => [...h, prev]);
      currentRef.current = null;
    }
    setNavKey((k) => k + 1);
  }, []);

  return (
    <TerminalContext.Provider value={{ history, navKey, currentDir, register, forceNav, setCurrentDir }}>
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal() {
  return useContext(TerminalContext);
}
