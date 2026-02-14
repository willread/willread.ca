"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";

interface QueueContext {
  register: (id: string) => number;
  complete: (index: number) => void;
  activeIndex: number;
  /** When true, all commands render instantly (no animation) */
  isStatic: boolean;
}

const CommandQueueContext = createContext<QueueContext>({
  register: () => 0,
  complete: () => {},
  activeIndex: 0,
  isStatic: false,
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

  return (
    <CommandQueueContext.Provider value={{ register, complete, activeIndex, isStatic: false }}>
      {children}
    </CommandQueueContext.Provider>
  );
}

/** Renders all commands instantly with no animation */
export function StaticCommandQueue({ children }: { children: ReactNode }) {
  return (
    <CommandQueueContext.Provider
      value={{
        register: () => 0,
        complete: () => {},
        activeIndex: Infinity,
        isStatic: true,
      }}
    >
      {children}
    </CommandQueueContext.Provider>
  );
}

export function useCommandQueue() {
  return useContext(CommandQueueContext);
}
