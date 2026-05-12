import type React from "react";
import { TrendingUp } from "lucide-react";

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  delta?: string;
  reliability: string;
}

export function KpiCard({ icon, label, value, sub, delta, reliability }: KpiCardProps) {
  return (
    <div className="app-card group relative flex flex-col gap-5 overflow-hidden p-7 transition-all duration-500 hover:shadow-[var(--shadow-lg)]">
      <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] text-primary shadow-[var(--shadow-sm)] transition-colors group-hover:bg-card">
          {icon}
        </div>
        <div className="flex flex-col items-end">
          {delta && (
            <span className="flex items-center gap-1 rounded-lg border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] px-2 py-1 text-[11px] font-black text-primary shadow-[var(--shadow-sm)]">
              <TrendingUp size={10} /> {delta}
            </span>
          )}
          <span className="mt-2 text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
            {reliability} Confidence
          </span>
        </div>
      </div>
      <div className="relative z-10">
        <p className="mb-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-[var(--subtle-foreground)]">
          {label}
        </p>
        <p className="mb-2 text-[28px] font-black leading-none tracking-tighter text-foreground">{value}</p>
        <p className="text-[12px] font-bold text-[var(--muted-foreground)] opacity-80">{sub}</p>
      </div>
    </div>
  );
}
