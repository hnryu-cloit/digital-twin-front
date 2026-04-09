import { ChevronRight, Clock } from "lucide-react";
import type { Project } from "@/lib/api";

const STATUS_STYLE: Record<Project["status"], { bg: string; text: string; label: string }> = {
  진행중: { bg: "#EEF4FF", text: "#5B7DFF", label: "진행중" },
  완료: { bg: "#F0FDF4", text: "#16A34A", label: "완료" },
  초안: { bg: "#F7FAFF", text: "#7C8397", label: "초안" },
  분석중: { bg: "#FFF7ED", text: "#EA580C", label: "분석중" },
};

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const s = STATUS_STYLE[project.status] || STATUS_STYLE["초안"];
  const themeColor = project.typeColor || "#5B7DFF";
  const themeBg = project.typeBg || "#EEF4FF";

  return (
    <div
      onClick={onClick}
      className="app-card p-6 cursor-pointer hover:shadow-[var(--shadow-lg)] hover:border-primary/30 transition-all group flex flex-col"
    >
      <div className="flex items-start justify-between mb-4">
        <span
          className="px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tight"
          style={{ backgroundColor: themeBg, color: themeColor, borderColor: themeColor + "22" }}
        >
          {project.type}
        </span>
        <span
          className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight"
          style={{ backgroundColor: s.bg, color: s.text }}
        >
          {s.label}
        </span>
      </div>
      <h3 className="text-[15px] font-black text-foreground leading-tight mb-2 group-hover:text-primary transition-colors">
        {project.title}
      </h3>
      <div className="flex flex-wrap gap-1.5 mb-5">
        {(project.tags || []).map((t) => (
          <span
            key={t}
            className="bg-[var(--panel-soft)] border border-[var(--border)] text-muted-foreground px-2 py-0.5 rounded-md font-bold"
            style={{ fontSize: 10 }}
          >
            #{t}
          </span>
        ))}
      </div>
      <div className="mb-4 mt-auto">
        <div className="flex justify-between mb-1.5">
          <span className="text-[11px] font-black text-[var(--subtle-foreground)] uppercase tracking-widest">
            응답 수집
          </span>
          <span className="text-[11px] font-black text-foreground">
            {(project.responses || 0).toLocaleString()} / {(project.target || 0).toLocaleString()}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out shadow-[var(--shadow-sm)]"
            style={{ width: `${Math.min(project.progress || 0, 100)}%`, backgroundColor: themeColor }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border/30">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tighter flex items-center gap-1.5">
          <Clock size={12} className="text-[var(--subtle-foreground)]" /> {project.updatedAt || "방금 전"}
        </span>
        <div className="w-7 h-7 rounded-lg bg-[var(--panel-soft)] flex items-center justify-center text-[var(--subtle-foreground)] group-hover:bg-primary/10 group-hover:text-primary transition-all">
          <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
}
