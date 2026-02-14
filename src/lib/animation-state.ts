"use client";

import { useSyncExternalStore } from "react";

type Listener = () => void;
const listeners = new Set<Listener>();
let animatingCount = 0;

function notify() {
  listeners.forEach((fn) => fn());
}

/** Push an animation source. While count > 0, DosCursor hides. */
export function pushAnimating() {
  animatingCount++;
  notify();
}

/** Pop an animation source. */
export function popAnimating() {
  animatingCount = Math.max(0, animatingCount - 1);
  notify();
}

export function useIsAnimating(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => { listeners.delete(onStoreChange); };
    },
    () => animatingCount > 0,
    () => true, // server: assume animating so DosCursor doesn't render on SSR
  );
}
