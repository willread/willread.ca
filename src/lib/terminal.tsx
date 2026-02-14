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

const RegisterContext = createContext<(block: TerminalBlock) => void>(() => {});

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<TerminalBlock[]>([]);
  const pendingRef = useRef<TerminalBlock | null>(null);
  const prevPathnameRef = useRef<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Only commit pending block when pathname actually changes (not on initial mount)
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname) {
      if (pendingRef.current) {
        const block = pendingRef.current;
        setHistory((prev) => [...prev, block]);
        pendingRef.current = null;
      }
    }
    prevPathnameRef.current = pathname;
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

export function useTerminal() {
  return useContext(TerminalContext);
}

export function useRegisterBlock(id: string, content: ReactNode) {
  const register = useContext(RegisterContext);

  useEffect(() => {
    register({ id, content });
  }, [id, content, register]);
}
