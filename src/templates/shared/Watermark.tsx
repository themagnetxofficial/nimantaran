/** Shown on unpaid / draft invites. Removed only when the server marks the invite as paid. */
export function PreviewWatermark() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <div className="absolute inset-x-0 top-0 bg-wine-800/90 py-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory-50">
        Preview – Nimantran
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-around opacity-[0.06]">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="-rotate-[24deg] whitespace-nowrap font-serif text-4xl font-semibold text-black">
            Preview – Nimantran
          </span>
        ))}
      </div>
    </div>
  );
}
