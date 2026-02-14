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
  /** Register a command, returns its index in the queue */
  register: (id: string) => number;
  /** Signal that command at index is done (typing + fade complete) */
  complete: (index: number) => void;
  /** Current active command index */
  activeIndex: number;
}

const CommandQueueContext = createContext<QueueContext>({
  register: () => 0,
  complete: () => {},
  activeIndex: 0,
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
    <CommandQueueContext.Provider value={{ register, complete, activeIndex }}>
      {children}
    </CommandQueueContext.Provider>
  );
}

export function useCommandQueue() {
  return useContext(CommandQueueContext);
}
