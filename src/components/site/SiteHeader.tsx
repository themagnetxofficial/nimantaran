import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ivory-300/60 bg-ivory-50/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-4">
          <Link href="/templates" className="rounded-full px-3 py-2 text-sm font-medium text-ink-700 hover:text-wine-700">
            Templates
          </Link>
          <LinkButton href="/create/floral-pastel" size="sm">
            Create invite
          </LinkButton>
        </nav>
      </div>
    </header>
  );
}
