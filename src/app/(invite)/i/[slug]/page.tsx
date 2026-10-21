import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { InviteLoading } from "@/components/site/InviteLoading";
import { mainEvent, formatShortDate } from "@/lib/invite/datetime";
import { findSampleInvite, sampleInvites } from "@/lib/invite/samples";
import { TemplateRenderer } from "@/templates/TemplateRenderer";

/*
 * Phase 1: invites come from sample data (src/lib/invite/samples.ts).
 * Phase 2 replaces `findSampleInvite` with a Supabase query.
 */
export function generateStaticParams() {
  return sampleInvites.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/i/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const invite = findSampleInvite(slug);
  if (!invite) return { title: "Invitation not found" };
  const { names, tagline } = invite.data;
  const title = [names.first, names.second].filter(Boolean).join(" & ");
  const main = mainEvent(invite.data);
  const description = [tagline, main && formatShortDate(main.date, "en")].filter(Boolean).join(" · ");
  return {
    title: `${title} – You're invited`,
    description,
    // Unpaid / draft invites must never be indexed.
    robots: invite.isPaid ? undefined : { index: false, follow: false },
    openGraph: { title, description, type: "website" },
  };
}

// URL data is read inside <Suspense> so navigation to an invite shows the loader instantly.
export default function InvitePage({ params }: PageProps<"/i/[slug]">) {
  return (
    <Suspense fallback={<InviteLoading />}>
      <Invite params={params} />
    </Suspense>
  );
}

async function Invite({ params }: Pick<PageProps<"/i/[slug]">, "params">) {
  const { slug } = await params;
  const invite = findSampleInvite(slug);
  if (!invite) notFound();
  return <TemplateRenderer templateId={invite.templateId} data={invite.data} mode="live" isPaid={invite.isPaid} />;
}
