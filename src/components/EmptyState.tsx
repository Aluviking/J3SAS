import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="mt-6 flex flex-col items-center justify-center text-center bg-surface border border-border rounded-tl-2xl py-16 px-6">
      <div className="w-14 h-14 rounded-tl-lg bg-surface-alt flex items-center justify-center">
        <Icon size={24} className="text-muted" />
      </div>
      <p className="mt-4 font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm text-muted max-w-xs">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 inline-block text-sm font-semibold bg-ink text-white px-5 py-2.5 rounded-tl-md hover:bg-cta transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
