"use client";

import { useEffect, useState } from "react";
import { loadLocalDraft } from "@/lib/invite/draft-storage";
import type { InviteData } from "@/lib/invite/schema";
import { isPreviewMessage, type PreviewMessage } from "@/lib/preview-messages";
import { TemplateRenderer } from "@/templates/TemplateRenderer";

interface State {
  templateId: string;
  data: InviteData;
}

export function PreviewClient() {
  const [state, setState] = useState<State | null>(null);
  const [replayKey, setReplayKey] = useState(0);
  const [embedded, setEmbedded] = useState(true);

  useEffect(() => {
    const inIframe = window.parent !== window;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== location.origin || !isPreviewMessage(e.data)) return;
      const msg = e.data;
      if (msg.type === "nimantran:update") setState({ templateId: msg.templateId, data: msg.data });
      if (msg.type === "nimantran:replay") {
        window.scrollTo(0, 0);
        setReplayKey((k) => k + 1);
      }
    };
    window.addEventListener("message", onMessage);

    if (inIframe) {
      window.parent.postMessage({ type: "nimantran:ready" } satisfies PreviewMessage, location.origin);
    } else {
      // Opened in a new tab: show the locally saved draft.
      const draft = loadLocalDraft();
      queueMicrotask(() => {
        setEmbedded(false);
        if (draft) setState({ templateId: draft.templateId, data: draft.data });
      });
    }
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!state) {
    return (
      <div className="grid min-h-dvh place-items-center p-8 text-center text-sm text-ink-500">
        {embedded ? "Loading preview…" : "No draft found. Open the builder to create your invite."}
      </div>
    );
  }

  return <TemplateRenderer key={`${state.templateId}-${replayKey}`} templateId={state.templateId} data={state.data} mode="preview" isPaid={false} />;
}
