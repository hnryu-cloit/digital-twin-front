interface ReportSectionHeaderProps {
  num: string;
  title: string;
  badge?: string;
  onDetailClick?: () => void;
}

export function ReportSectionHeader({ num, title, badge, onDetailClick }: ReportSectionHeaderProps) {
  return (
    <div className="mb-10 flex items-center justify-between border-b border-[var(--border)] pb-8">
      <div className="flex items-center gap-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-[13px] font-black text-white shadow-[var(--shadow-lg)]">
          {num}
        </div>
        <div>
          <h2 className="text-[22px] font-black tracking-tight text-foreground">{title}</h2>
          {badge && (
            <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.2em] text-primary opacity-60">
              {badge}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onDetailClick}
        className="group/btn flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-card px-4 py-2 text-[12px] font-black text-[var(--secondary-foreground)] shadow-[var(--shadow-sm)] transition-all hover:border-primary/30 hover:bg-[var(--panel-soft)] hover:text-primary active:scale-95"
      >
        더보기
        <span className="text-[11px] text-[var(--subtle-foreground)] transition-transform group-hover/btn:translate-x-0.5">
          &gt;
        </span>
      </button>
    </div>
  );
}
