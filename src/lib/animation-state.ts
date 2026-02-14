"use client";

import { useState, useEffect, useCallback } from "react";

type Listener = (animating: boolean) => void;
const listeners = new Set<Listener>();
let currentlyAnimating = false;

export function setAnimating(value: boolean) {
  currentlyAnimating = value;
  listeners.forEach((fn) => fn(value));
}

export function useIsAnimating(): boolean {
  const [animating, setAnimating] = useState(currentlyAnimating);

  useEffect(() => {
    const handler = (value: boolean) => setAnimating(value);
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  return animating;
}
