"use client";

import type { LabelKey } from "@/lib/i18n/invite-labels";
import { cn } from "@/lib/utils/cn";
import { useInvite } from "./runtime";

interface Props {
  k: LabelKey;
  className?: string;
  /** class for the secondary (English) line on bilingual invites */
  subClassName?: string;
  as?: "span" | "p" | "h2" | "h3";
}

/**
 * Renders a fixed invite label in the invite's language.
 * Bilingual invites show Hindi on top and English underneath.
 */
export function L({ k, className, subClassName, as: Tag = "span" }: Props) {
  const { t } = useInvite();
  const label = t(k);
  return (
    <Tag className={className}>
      <span lang={label.lang}>{label.main}</span>
      {label.sub && (
        <span lang="en" className={cn("mt-1 block text-[0.7em] opacity-75", subClassName)}>
          {label.sub}
        </span>
      )}
    </Tag>
  );
}
