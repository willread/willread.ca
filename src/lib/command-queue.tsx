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
import { pushAnimating, popAnimating } from "@/lib/animation-state";

interface QueueContext {
  register: (id: string) => number;
  complete: (index: number) => void;
  activeIndex: number;
  isStatic: boolean;
  allDone: boolean;
}

const CommandQueueContext = createContext<QueueContext>({
  register: () => 0,
  complete: () => {},
  activeIndex: 0,
  isStatic: false,
  allDone: true,
});

export function CommandQueue({ children }: { children: ReactNode }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const counterRef = useRef(0);
  const registeredRef = useRef<Map<string, number>>(new Map());
  const [totalRegistered, setTotalRegistered] = useState(0);

  const register = useCallback((id: string) => {
    if (registeredRef.current.has(id)) {
      return registeredRef.current.get(id)!;
    }
    const idx = counterRef.current++;
    registeredRef.current.set(id, idx);
    setTotalRegistered(counterRef.current);
    return idx;
  }, []);

  const complete = useCallback((index: number) => {
    setActiveIndex((prev) => Math.max(prev, index + 1));
  }, []);

  // Signal global animation state
  useEffect(() => {
    if (totalRegistered > 0 && activeIndex < totalRegistered) {
      pushAnimating();
      return () => popAnimating();
    }
  }, [activeIndex, totalRegistered]);

  return (
    <CommandQueueContext.Provider
      value={{ register, complete, activeIndex, isStatic: false, allDone: activeIndex >= totalRegistered }}
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
      }}
    >
      {children}
    </CommandQueueContext.Provider>
  );
}

export function useCommandQueue() {
  return useContext(CommandQueueContext);
}
