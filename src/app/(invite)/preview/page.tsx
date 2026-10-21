import type { Metadata } from "next";
import { PreviewClient } from "./PreviewClient";

export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

/** Rendered inside the builder's phone frame (iframe), or full screen in a new tab. */
export default function PreviewPage() {
  return <PreviewClient />;
}
