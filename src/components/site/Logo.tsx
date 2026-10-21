import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2", className)} aria-label="Nimantran home">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <circle cx="16" cy="16" r="15" fill="#6f1a2b" />
        <path d="M16 6c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10Z" fill="#e6cc8a" />
        <path d="M9 22h14" stroke="#e6cc8a" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="font-serif text-2xl font-semibold tracking-wide text-wine-700">Nimantran</span>
    </Link>
  );
}
