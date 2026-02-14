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
  /** Set current directory and return the previous one (or null on first call) */
  setCurrentDir: (dir: string) => string | null;
}

const TerminalContext = createContext<TerminalContextValue>({
  history: [],
  navKey: 0,
  currentDir: "",
  register: () => {},
  forceNav: () => {},
  setCurrentDir: () => null,
});

// Module-level dir tracker (avoids ref-during-render issues in React 19)
const _dirTracker = { current: "", hasSet: false };

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<ReactNode[]>([]);
  const [navKey, setNavKey] = useState(0);
  const [currentDir, setCurrentDirState] = useState("");

  const setCurrentDir = useCallback((dir: string): string | null => {
    const prev = _dirTracker.current;
    const isFirst = !_dirTracker.hasSet;
    _dirTracker.hasSet = true;
    _dirTracker.current = dir;
    setCurrentDirState(dir);
    if (isFirst) return null;
    if (prev === dir) return null;
    return prev;
  }, []);

  const currentRef = useRef<CurrentBlock | null>(null);
  const lastPushedRef = useRef<string | null>(null);

  const register = useCallback((id: string, content: ReactNode) => {
    if (currentRef.current && currentRef.current.id === id) {
      currentRef.current = { id, content };
      return;
    }
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
