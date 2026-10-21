"use client";

import { whatsAppChatUrl } from "@/lib/share/whatsapp";
import { cn } from "@/lib/utils/cn";
import { useInvite } from "./runtime";

/** Contact people with "Call" and WhatsApp click-to-chat buttons. */
export function ContactList({ className, buttonClassName }: { className?: string; buttonClassName?: string }) {
  const { data } = useInvite();
  const contacts = data.contacts.filter((c) => c.name || c.phone);
  if (contacts.length === 0) return null;
  return (
    <ul className={cn("flex flex-col gap-4", className)}>
      {contacts.map((c) => (
        <li key={c.id} className="flex flex-col items-center gap-2">
          <span className="font-serif text-xl">{c.name}</span>
          {c.phone && (
            <div className="flex gap-2">
              <a href={`tel:${c.phone}`} className={cn("rounded-full px-4 py-1.5 text-sm", buttonClassName)}>
                Call
              </a>
              {c.whatsapp && (
                <a
                  href={whatsAppChatUrl(c.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn("rounded-full px-4 py-1.5 text-sm", buttonClassName)}
                >
                  WhatsApp
                </a>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
