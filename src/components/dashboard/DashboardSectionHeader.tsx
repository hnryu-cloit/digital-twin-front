import type React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface DashboardSectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  open: boolean;
  onToggle: () => void;
  count?: number;
}

export function DashboardSectionHeader({ icon, title, open, onToggle, count }: DashboardSectionHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--surface-hover)] transition-colors rounded-xl group"
    >
      <div className="flex items-center gap-3">
        <span
          className={`transition-colors ${open ? "text-primary" : "text-[var(--subtle-foreground)] group-hover:text-primary"}`}
        >
          {icon}
        </span>
        <span
          className={`text-[12px] font-bold tracking-tight ${open ? "text-foreground" : "text-[var(--secondary-foreground)] group-hover:text-foreground"}`}
        >
          {title}
        </span>
        {!!count && count > 0 && (
          <span className="bg-[var(--primary-light-bg)] text-primary px-2 py-0.5 rounded-full text-[9px] font-bold border border-[var(--primary-light-border)]">
            {count}
          </span>
        )}
      </div>
      <div className="text-[var(--subtle-foreground)] group-hover:text-primary transition-all">
        {open ? <ChevronUp size={14} strokeWidth={2.5} /> : <ChevronDown size={14} strokeWidth={2.5} />}
      </div>
    </button>
  );
}
