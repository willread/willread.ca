"use client";

import { useSyncExternalStore } from "react";

type Listener = () => void;
const listeners = new Set<Listener>();
let currentlyAnimating = false;

export function setAnimating(value: boolean) {
  if (currentlyAnimating !== value) {
    currentlyAnimating = value;
    listeners.forEach((fn) => fn());
  }
}

export function useIsAnimating(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => { listeners.delete(onStoreChange); };
    },
    () => currentlyAnimating,
    () => true, // server snapshot: assume animating so DosCursor doesn't render on SSR
  );
}
