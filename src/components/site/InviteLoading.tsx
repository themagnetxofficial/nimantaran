/** Lightweight placeholder shown while an invitation loads. */
export function InviteLoading() {
  return (
    <div className="grid min-h-dvh place-items-center bg-ivory-50" role="status">
      <div className="flex flex-col items-center gap-4">
        <span className="size-10 animate-spin rounded-full border-2 border-gold-300 border-t-wine-700" />
        <span className="font-serif text-lg italic text-ink-500">Opening your invitation…</span>
      </div>
    </div>
  );
}
