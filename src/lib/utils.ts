import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createHash } from "crypto"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate SHA-256 hash of text content for cache key generation
 * @param text - The text content to hash
 * @returns SHA-256 hash string
 */
export function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}
