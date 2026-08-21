/**
 * -----------------------------------------------------------------------------
 * General-purpose UI helpers
 * -----------------------------------------------------------------------------
 * Small, dependency-light utilities shared across the entire app. `cn()` is
 * the standard class-name combinator used by every shadcn/ui component and
 * feature component to merge Tailwind classes (letting later classes override
 * earlier ones). `formatFileSize()` renders human-readable byte sizes in the
 * voice management UI (e.g. upload limits on the voice recorder/form).
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges conditional class names and resolves conflicting Tailwind utilities.
 *
 * @param inputs - Any mix of class strings, arrays, objects, or falsy values.
 * @returns A single deduplicated class string safe for Tailwind's purge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a byte count as a human-readable size string.
 *
 * @param bytes - The file size in bytes.
 * @returns e.g. `"512 B"`, `"1.5 KB"`, or `"3.2 MB"`.
 */
export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}