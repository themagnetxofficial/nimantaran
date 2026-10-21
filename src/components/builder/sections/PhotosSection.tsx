"use client";

import { useRef, useState } from "react";
import { LIMITS } from "@/lib/invite/schema";
import { PHOTO_ACCEPT, UploadError, uploadPhoto } from "@/lib/media/upload";
import { cn } from "@/lib/utils/cn";
import type { SectionProps } from "../types";

export function PhotosSection({ data, update }: SectionProps) {
  const coverInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"cover" | "gallery" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const remaining = LIMITS.gallery - data.gallery.length;

  const handle = async (files: FileList | null, target: "cover" | "gallery") => {
    if (!files?.length) return;
    setError(null);
    setBusy(target);
    try {
      if (target === "cover") {
        const photo = await uploadPhoto(files[0]);
        update((d) => void (d.coverPhoto = photo));
      } else {
        const list = Array.from(files).slice(0, remaining);
        if (files.length > remaining) setError(`Only ${LIMITS.gallery} photos allowed, extra ones were skipped.`);
        for (const f of list) {
          const photo = await uploadPhoto(f);
          update((d) => {
            if (d.gallery.length < LIMITS.gallery) d.gallery.push(photo);
          });
        }
      }
    } catch (e) {
      setError(e instanceof UploadError ? e.message : "Could not process that photo. Please try another one.");
    } finally {
      setBusy(null);
      if (coverInput.current) coverInput.current.value = "";
      if (galleryInput.current) galleryInput.current.value = "";
    }
  };

  return (
    <>
      <p className="text-xs text-ink-500">Photos are compressed on your phone before saving, so they load fast for guests. Max 5 MB each.</p>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-ink-700">Cover photo</h3>
        <div className="flex items-center gap-4">
          <div className="relative aspect-[3/4] w-24 overflow-hidden rounded-t-full rounded-b-lg bg-ivory-200 ring-1 ring-ivory-300">
            {data.coverPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.coverPhoto.src} alt="" className="size-full object-cover" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => coverInput.current?.click()} disabled={busy !== null} className="rounded-full bg-wine-700 px-4 py-2 text-sm font-semibold text-ivory-50 disabled:opacity-50">
              {busy === "cover" ? "Processing…" : data.coverPhoto ? "Change photo" : "Upload photo"}
            </button>
            {data.coverPhoto && (
              <button type="button" onClick={() => update((d) => void (d.coverPhoto = null))} className="text-sm text-ink-500 hover:text-wine-700">
                Remove
              </button>
            )}
          </div>
          <input ref={coverInput} type="file" accept={PHOTO_ACCEPT} hidden onChange={(e) => handle(e.target.files, "cover")} />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-ink-700">
          Gallery <span className="font-normal text-ink-500">({data.gallery.length}/{LIMITS.gallery})</span>
        </h3>
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {data.gallery.map((p, i) => (
            <li key={p.id} className="group relative aspect-square overflow-hidden rounded-lg bg-ivory-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt="" className="size-full object-cover" />
              <button
                type="button"
                aria-label={`Remove photo ${i + 1}`}
                onClick={() => update((d) => void d.gallery.splice(i, 1))}
                className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-black/55 text-xs text-white"
              >
                ✕
              </button>
            </li>
          ))}
          {remaining > 0 && (
            <li>
              <button
                type="button"
                onClick={() => galleryInput.current?.click()}
                disabled={busy !== null}
                className={cn(
                  "grid aspect-square w-full place-items-center rounded-lg border-2 border-dashed border-ivory-300 text-sm text-ink-500 hover:border-gold-400 hover:text-wine-700",
                  busy === "gallery" && "animate-pulse",
                )}
              >
                {busy === "gallery" ? "Adding…" : "+ Add"}
              </button>
            </li>
          )}
        </ul>
        <input ref={galleryInput} type="file" accept={PHOTO_ACCEPT} multiple hidden onChange={(e) => handle(e.target.files, "gallery")} />
      </div>
      {error && (
        <p role="alert" className="text-sm text-wine-600">
          {error}
        </p>
      )}
    </>
  );
}
