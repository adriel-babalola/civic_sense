import { clsx } from "clsx";

/** Conditional class names. Thin wrapper so the intent reads clearly. */
export function cn(...inputs) {
  return clsx(inputs);
}
