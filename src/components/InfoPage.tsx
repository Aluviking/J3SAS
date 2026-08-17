import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export default function InfoPage({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 lg:px-8 py-5">
      <div className="text-sm text-muted mb-3">
        <Link href="/" className="hover:text-ink">
          Inicio
        </Link>{" "}
        / <span className="text-ink">{title}</span>
      </div>

      <div className="relative overflow-hidden rounded-tl-3xl bg-ink px-6 py-8 sm:px-10 sm:py-10">
        {Icon && (
          <div className="relative w-12 h-12 rounded-tl-lg bg-white/10 flex items-center justify-center mb-4">
            <Icon size={22} className="text-white" />
          </div>
        )}
        <h1 className="relative text-2xl sm:text-3xl font-semibold text-white">{title}</h1>
        {subtitle && (
          <p className="relative mt-2 text-sm text-white/70 max-w-lg">{subtitle}</p>
        )}
      </div>

      <div className="mt-6 bg-surface border border-border rounded-tl-2xl p-5 sm:p-8 space-y-5 text-sm text-ink leading-relaxed">
        {children}
      </div>
    </div>
  );
}
