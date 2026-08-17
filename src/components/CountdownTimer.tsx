"use client";

import { useEffect, useState } from "react";

function useRemaining(targetMs: number) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const update = () => setRemaining(Math.max(0, targetMs - Date.now()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  return remaining;
}

function parts(remaining: number) {
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function CountdownBlocks({ hours = 63 }: { hours?: number }) {
  const [target] = useState(() => Date.now() + hours * 3600 * 1000);
  const { days, hours: h, minutes, seconds } = parts(useRemaining(target));

  return (
    <div className="flex items-center gap-2">
      {[
        ["Días", days],
        ["Hrs", h],
        ["Min", minutes],
        ["Seg", seconds],
      ].map(([label, val]) => (
        <div
          key={label as string}
          className="bg-white/10 border border-white/20 rounded-tl-md px-3 py-2 text-center min-w-[52px]"
        >
          <div className="text-lg font-semibold text-white leading-none tabular-nums">
            {pad(val as number)}
          </div>
          <div className="text-[10px] text-white/60 mt-1">{label}</div>
        </div>
      ))}
    </div>
  );
}

export function CountdownInline({ hours = 6 }: { hours?: number }) {
  const [target] = useState(() => Date.now() + hours * 3600 * 1000);
  const { hours: h, minutes, seconds } = parts(useRemaining(target));

  return (
    <span className="font-semibold tabular-nums">
      {pad(h)}:{pad(minutes)}:{pad(seconds)}
    </span>
  );
}
