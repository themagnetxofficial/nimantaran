"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/invite/schema";
import { cn } from "@/lib/utils/cn";

interface Props {
  photos: Photo[];
  className?: string;
  itemClassName?: string;
}

/**
 * Lazy-loaded photo grid with a full-screen lightbox (native <dialog>).
 * Photos are already compressed to WebP during upload, so plain <img> with
 * loading="lazy" is the lightest option here.
 */
export function Gallery({ photos, className, itemClassName }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);

  const openAt = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const step = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i === null ? i : (i + dir + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    d.addEventListener("keydown", onKey);
    return () => d.removeEventListener("keydown", onKey);
  }, [step]);

  if (photos.length === 0) return null;
  const current = index !== null ? photos[index] : null;

  return (
    <>
      <ul className={cn("grid grid-cols-2 gap-2", className)}>
        {photos.map((p, i) => (
          <li key={p.id} className={cn(i === 0 && photos.length % 2 === 1 && "col-span-2")}>
            <button
              type="button"
              onClick={() => openAt(i)}
              className={cn("block w-full overflow-hidden rounded-lg", itemClassName)}
              aria-label={`Open photo ${i + 1} of ${photos.length}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                alt={p.alt}
                loading="lazy"
                decoding="async"
                width={p.width}
                height={p.height}
                className={cn("w-full object-cover", i === 0 && photos.length % 2 === 1 ? "aspect-[4/3]" : "aspect-[4/5]")}
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setIndex(null)}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto h-dvh max-h-none w-screen max-w-none bg-black/90 p-0 text-white backdrop:bg-black/80"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {current && (
          <div className="flex h-full items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && close()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.src} alt={current.alt} className="max-h-full max-w-full rounded-md object-contain" />
          </div>
        )}
        <button type="button" onClick={close} className="absolute right-3 top-3 rounded-full bg-white/15 px-3 py-1.5 text-sm" aria-label="Close">
          ✕
        </button>
        {photos.length > 1 && (
          <>
            <button type="button" onClick={() => step(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/15 px-3 py-2" aria-label="Previous photo">
              ‹
            </button>
            <button type="button" onClick={() => step(1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/15 px-3 py-2" aria-label="Next photo">
              ›
            </button>
            <p className="absolute bottom-4 left-0 right-0 text-center text-sm opacity-70">
              {(index ?? 0) + 1} / {photos.length}
            </p>
          </>
        )}
      </dialog>
    </>
  );
}
