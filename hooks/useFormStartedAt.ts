"use client";

import { useRef } from "react";

/** Timestamp when the form first mounted — used to block instant bot submissions. */
export function useFormStartedAt(): number {
  const startedAt = useRef(Date.now());
  return startedAt.current;
}
