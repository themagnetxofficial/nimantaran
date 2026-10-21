"use client";

import type { ReactNode } from "react";
import { eventLabel } from "@/lib/i18n/invite-labels";
import { formatEventDate, formatEventTime } from "@/lib/invite/datetime";
import type { InviteEvent } from "@/lib/invite/schema";
import { cn } from "@/lib/utils/cn";
import { AddToCalendar } from "./AddToCalendar";
import { MapButton } from "./MapButton";
import { useInvite } from "./runtime";

export interface EventCardClassNames {
  root?: string;
  title?: string;
  date?: string;
  venue?: string;
  address?: string;
  note?: string;
  button?: string;
}

interface Props {
  event: InviteEvent;
  classNames?: EventCardClassNames;
  /** Decorative content rendered at the top of the card (e.g. an ornament) */
  ornament?: ReactNode;
}

export function EventCard({ event, classNames = {}, ornament }: Props) {
  const { data } = useInvite();
  const lang = data.language;
  const title = eventLabel(event.kind, event.customName, lang);
  const date = formatEventDate(event, lang);
  const time = formatEventTime(event, lang);
  const names = [data.names.first, data.names.second].filter(Boolean).join(" & ");

  return (
    <article className={cn("relative text-center", classNames.root)}>
      {ornament}
      <h3 className={cn("font-serif text-3xl", classNames.title)}>
        <span lang={title.lang}>{title.main}</span>
        {title.sub && (
          <span lang="hi" className="mt-1 block font-hindi text-lg opacity-80">
            {title.sub}
          </span>
        )}
      </h3>
      {(date || time) && (
        <p className={cn("mt-3 text-sm", classNames.date)} lang={lang === "hi" ? "hi" : "en"}>
          {date}
          {date && time && <span aria-hidden> · </span>}
          {time}
        </p>
      )}
      {event.venueName && <p className={cn("mt-4 font-serif text-xl", classNames.venue)}>{event.venueName}</p>}
      {event.address && <p className={cn("mx-auto mt-1 max-w-xs text-sm opacity-80", classNames.address)}>{event.address}</p>}
      {event.note && <p className={cn("mt-3 text-sm italic", classNames.note)}>{event.note}</p>}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <MapButton event={event} className={classNames.button} />
        <AddToCalendar
          event={event}
          title={`${title.main}${names ? ` · ${names}` : ""}`}
          description={data.tagline || data.message}
          url={typeof window !== "undefined" ? window.location.href : undefined}
          className={classNames.button}
        />
      </div>
    </article>
  );
}
