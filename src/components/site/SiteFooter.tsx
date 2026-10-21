import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ivory-300/60 bg-ivory-100">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-10 text-center">
        <Logo />
        <p className="text-sm text-ink-500">Beautiful digital invitations, made with love in India.</p>
        <p className="text-xs text-ink-300">© Nimantran</p>
      </div>
    </footer>
  );
}
