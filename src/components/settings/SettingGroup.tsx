import type React from "react";

interface SettingGroupProps {
  title?: string;
  children: React.ReactNode;
}

export function SettingGroup({ title, children }: SettingGroupProps) {
  return (
    <div className="app-card mb-6 p-6">
      {title && (
        <p className="mb-5 border-b border-[var(--border)] pb-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
          {title}
        </p>
      )}
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  );
}
