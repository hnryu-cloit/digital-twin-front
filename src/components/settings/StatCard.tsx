import type React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "primary" | "warn" | "danger" | "success";
  icon?: React.ElementType;
  onDetail?: () => void;
}

export function StatCard({ label, value, sub, tone = "neutral", icon: Icon, onDetail }: StatCardProps) {
  const valueColor = {
    neutral: "text-foreground",
    primary: "text-primary",
    warn: "text-[var(--warning)]",
    danger: "text-[var(--destructive)]",
    success: "text-[var(--success)]",
  }[tone];

  const iconColor = {
    neutral: "text-[var(--subtle-foreground)]",
    primary: "text-primary",
    warn: "text-[var(--warning)]",
    danger: "text-[var(--destructive)]",
    success: "text-[var(--success)]",
  }[tone];

  return (
    <div className="group bg-card border border-[var(--border)] rounded-xl p-4 flex flex-col gap-0 hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-sm)] transition-all">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--subtle-foreground)] mb-2.5">
        {Icon && <Icon size={11} className={iconColor} />}
        {label}
      </p>
      <p className={cn("text-[20px] font-black leading-none tracking-tight", valueColor)}>{value}</p>
      <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-[var(--border)]">
        {sub ? <p className="text-[10px] font-medium text-[var(--muted-foreground)]">{sub}</p> : <span />}
        <button
          type="button"
          onClick={onDetail}
          className="flex items-center gap-0.5 text-[10px] font-bold text-[var(--muted-foreground)] hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
        >
          더보기 <ChevronRight size={11} />
        </button>
      </div>
    </div>
  );
}
