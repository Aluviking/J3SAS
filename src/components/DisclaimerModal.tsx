"use client";

import { useState } from "react";

export type Disclaimer = {
  title: string;
  body: string;
  buttonLabel?: string;
};

export default function DisclaimerModal({ disclaimer }: { disclaimer: Disclaimer }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4">
      <div className="max-w-md w-full bg-surface rounded-tl-2xl border border-border p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-ink">{disclaimer.title}</h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">{disclaimer.body}</p>
        <button
          onClick={() => setVisible(false)}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-cta text-white text-sm font-semibold py-3 rounded-tl-lg transition-colors hover:bg-cta-dark"
        >
          {disclaimer.buttonLabel ?? "Continuar"}
        </button>
      </div>
    </div>
  );
}
