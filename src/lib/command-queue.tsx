"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { setAnimating } from "@/lib/animation-state";

interface QueueContext {
  register: (id: string) => number;
  complete: (index: number) => void;
  activeIndex: number;
  isStatic: boolean;
  allDone: boolean;
  totalCommands: number;
}

const CommandQueueContext = createContext<QueueContext>({
  register: () => 0,
  complete: () => {},
  activeIndex: 0,
  isStatic: false,
  allDone: true,
  totalCommands: 0,
});

export function CommandQueue({ children }: { children: ReactNode }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const counterRef = useRef(0);
  const registeredRef = useRef<Map<string, number>>(new Map());

  const register = useCallback((id: string) => {
    if (registeredRef.current.has(id)) {
      return registeredRef.current.get(id)!;
    }
    const idx = counterRef.current++;
    registeredRef.current.set(id, idx);
    return idx;
  }, []);

  const complete = useCallback((index: number) => {
    setActiveIndex((prev) => Math.max(prev, index + 1));
  }, []);

  const totalCommands = counterRef.current;
  const allDone = activeIndex >= totalCommands;

  // Signal global animation state
  useEffect(() => {
    if (totalCommands > 0) {
      setAnimating(!allDone);
    }
  }, [allDone, totalCommands]);

  return (
    <CommandQueueContext.Provider
      value={{ register, complete, activeIndex, isStatic: false, allDone, totalCommands }}
    >
      {children}
    </CommandQueueContext.Provider>
  );
}

export function StaticCommandQueue({ children }: { children: ReactNode }) {
  return (
    <CommandQueueContext.Provider
      value={{
        register: () => 0,
        complete: () => {},
        activeIndex: Infinity,
        isStatic: true,
        allDone: true,
        totalCommands: 0,
      }}
    >
      {children}
    </CommandQueueContext.Provider>
  );
}

export function useCommandQueue() {
  return useContext(CommandQueueContext);
}
