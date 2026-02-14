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
import { usePathname } from "next/navigation";

export interface TerminalBlock {
  id: string;
  content: ReactNode;
}

interface TerminalState {
  history: TerminalBlock[];
}

const TerminalContext = createContext<TerminalState>({ history: [] });

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<TerminalBlock[]>([]);
  const pendingRef = useRef<TerminalBlock | null>(null);
  const pathname = usePathname();

  // When the pathname changes, commit whatever was pending (the previous page)
  useEffect(() => {
    if (pendingRef.current) {
      const block = pendingRef.current;
      setHistory((prev) => [...prev, block]);
    }
    pendingRef.current = null;
  }, [pathname]);

  const registerCurrent = useCallback((block: TerminalBlock) => {
    pendingRef.current = block;
  }, []);

  return (
    <TerminalContext.Provider value={{ history }}>
      <RegisterContext.Provider value={registerCurrent}>
        {children}
      </RegisterContext.Provider>
    </TerminalContext.Provider>
  );
}

const RegisterContext = createContext<(block: TerminalBlock) => void>(() => {});

export function useTerminal() {
  return useContext(TerminalContext);
}

/** Register the current page's output so it becomes history on the NEXT navigation */
export function useRegisterBlock(id: string, content: ReactNode) {
  const register = useContext(RegisterContext);

  useEffect(() => {
    register({ id, content });
  }, [id, content, register]);
}
