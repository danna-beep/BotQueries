import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge conditional class names and de-duplicate conflicting Tailwind utilities.
 * Referenced across components per `docs/code/components/conventions.md`.
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
