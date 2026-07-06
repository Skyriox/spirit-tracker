'use client';

import { useState } from 'react';

export default function InviteCodeChip({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard not available — silently ignore
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="btn-pop flex items-center gap-2 rounded-2xl border border-dashed border-spirit-cyan/60 bg-spirit-cyan/10 px-4 py-2 font-display text-lg font-extrabold tracking-[0.3em] hover:bg-spirit-cyan/20"
      title="Click to copy"
    >
      {code}
      <span className="text-sm">{copied ? '✅' : '📋'}</span>
    </button>
  );
}
