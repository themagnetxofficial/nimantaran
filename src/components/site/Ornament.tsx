import { cn } from "@/lib/utils/cn";

/** Small gold ornamental divider used across the app UI. */
export function Ornament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 20" className={cn("h-4 w-40 text-gold-500", className)} aria-hidden fill="none" stroke="currentColor">
      <path d="M4 10h70M126 10h70" strokeWidth="1" />
      <path d="M100 3l7 7-7 7-7-7z" fill="currentColor" stroke="none" />
      <circle cx="84" cy="10" r="2" fill="currentColor" stroke="none" />
      <circle cx="116" cy="10" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}
