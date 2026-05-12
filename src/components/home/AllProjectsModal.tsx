import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Loader, Search, Trash2, X } from "lucide-react";
import { projectApi, type Project } from "@/lib/api";
import { WORKFLOW_STAGE_META } from "@/components/home/ProjectCard";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function fmtDate(s?: string): string {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

interface PendingDelete {
  ids: string[];
  label: string;
}

interface AllProjectsModalProps {
  onClose: () => void;
  onSelect: (project: Project) => void;
  onDelete: (id: string) => void;
  onDeleteMany: (ids: string[]) => void;
}

export function AllProjectsModal({ onClose, onSelect, onDelete, onDeleteMany }: AllProjectsModalProps) {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["projects-all"],
    queryFn: () => projectApi.getProjects(1, 100),
    retry: false,
  });

  const all = data?.items ?? [];

  const filtered = useMemo(() => {
    return all.filter((p) => {
      if (search.trim()) {
        const kw = search.toLowerCase();
        const match = p.title.toLowerCase().includes(kw) || (p.tags ?? []).some((t) => t.toLowerCase().includes(kw));
        if (!match) return false;
      }
      if (dateFrom && p.createdAt && p.createdAt < dateFrom) return false;
      if (dateTo && p.createdAt && p.createdAt > dateTo) return false;
      return true;
    });
  }, [all, search, dateFrom, dateTo]);

  const allChecked = filtered.length > 0 && filtered.every((p) => selected.has(p.id));
  const someChecked = filtered.some((p) => selected.has(p.id));
  const selectedCount = selected.size;

  const toggleAll = () => {
    if (allChecked) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((p) => next.add(p.id));
        return next;
      });
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const requestDelete = (ids: string[], label: string) => {
    setPendingDelete({ ids, label });
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.ids.length === 1) {
      onDelete(pendingDelete.ids[0]);
    } else {
      onDeleteMany(pendingDelete.ids);
    }
    setSelected((prev) => {
      const next = new Set(prev);
      pendingDelete.ids.forEach((id) => next.delete(id));
      return next;
    });
    setPendingDelete(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-card border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <h2 className="text-[14px] font-black text-foreground tracking-tight">전체 리서치</h2>
              {!isLoading && (
                <span className="text-[11px] font-semibold text-[var(--muted-foreground)] bg-[var(--panel-soft)] border border-[var(--border)] px-2 py-0.5 rounded-full tabular-nums">
                  {all.length}개
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--subtle-foreground)] hover:bg-[var(--surface-hover)] hover:text-foreground transition-all"
            >
              <X size={14} />
            </button>
          </div>

          {/* 필터 바 */}
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-[var(--border)] bg-[var(--panel-soft)]">
            <div className="flex items-center gap-2 bg-card border border-[var(--border)] rounded-lg px-3 py-1.5 focus-within:border-primary transition-all flex-1 min-w-[160px] h-[32px]">
              <Search size={12} className="text-[var(--subtle-foreground)] shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="리서치명 또는 태그 검색"
                className="bg-transparent outline-none text-[12px] flex-1 text-foreground placeholder:text-[var(--subtle-foreground)]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-[var(--subtle-foreground)] hover:text-foreground"
                >
                  <X size={11} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-[var(--subtle-foreground)]">기간</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-card border border-[var(--border)] rounded-lg px-2.5 py-0 text-[11px] text-foreground outline-none focus:border-primary h-[32px]"
              />
              <span className="text-[var(--subtle-foreground)] text-[11px]">—</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-card border border-[var(--border)] rounded-lg px-2.5 py-0 text-[11px] text-foreground outline-none focus:border-primary h-[32px]"
              />
              {(dateFrom || dateTo) && (
                <button
                  type="button"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="text-[11px] text-[var(--muted-foreground)] hover:text-foreground transition-colors px-1"
                >
                  초기화
                </button>
              )}
            </div>
          </div>

          {/* 테이블 */}
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader className="animate-spin text-primary opacity-30" size={18} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-[13px] font-semibold text-[var(--muted-foreground)]">
                조건에 맞는 리서치가 없습니다
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[var(--panel-soft)] z-10">
                  <tr className="border-b border-[var(--border)]">
                    <th className="w-12 px-5 py-2.5">
                      <Checkbox
                        checked={allChecked ? true : someChecked ? "indeterminate" : false}
                        onCheckedChange={() => toggleAll()}
                      />
                    </th>
                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[var(--subtle-foreground)]">
                      리서치명
                    </th>
                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[var(--subtle-foreground)] w-28">
                      유형
                    </th>
                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[var(--subtle-foreground)] w-28">
                      상태
                    </th>
                    <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[var(--subtle-foreground)] w-28">
                      생성일
                    </th>
                    <th className="w-12" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((project) => {
                    const stage = WORKFLOW_STAGE_META[project.workflowStage] ?? WORKFLOW_STAGE_META.created;
                    const isChecked = selected.has(project.id);
                    return (
                      <tr
                        key={project.id}
                        onClick={() => toggleOne(project.id)}
                        className={`border-b border-[var(--border)] last:border-0 transition-colors cursor-pointer group ${
                          isChecked ? "bg-[var(--primary-light-bg)]" : "hover:bg-[var(--surface-hover)]"
                        }`}
                      >
                        <td className="w-12 px-5 py-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox checked={isChecked} onCheckedChange={() => toggleOne(project.id)} />
                        </td>
                        <td className="px-3 py-3 min-w-0 max-w-[240px]">
                          <p className="text-[12px] font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {project.title}
                          </p>
                          {(project.tags ?? []).length > 0 && (
                            <div className="flex gap-1 mt-0.5 flex-wrap">
                              {(project.tags ?? []).slice(0, 3).map((t) => (
                                <span
                                  key={t}
                                  className="text-[9px] font-medium text-[var(--subtle-foreground)] bg-[var(--panel-soft)] border border-[var(--border)] px-1.5 py-0.5 rounded-sm"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 w-28">
                          <span className="text-[11px] text-[var(--muted-foreground)]">{project.type || "—"}</span>
                        </td>
                        <td className="px-3 py-3 w-28">
                          <span
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold"
                            style={{ backgroundColor: stage.bg, color: stage.text }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: stage.text }}
                            />
                            {stage.label}
                          </span>
                        </td>
                        <td className="px-3 py-3 w-28">
                          <span className="text-[11px] tabular-nums text-[var(--muted-foreground)]">
                            {fmtDate(project.createdAt || project.updatedAt)}
                          </span>
                        </td>
                        <td className="w-12 pr-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => requestDelete([project.id], project.title)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-red-50 text-[var(--subtle-foreground)] hover:text-red-500"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border)] bg-[var(--panel-soft)]">
            <p className="text-[12px] text-[var(--muted-foreground)]">
              {selectedCount > 0 ? (
                <span>
                  <span className="font-bold text-foreground">{selectedCount}개</span> 선택됨
                </span>
              ) : (
                <>
                  <span className="font-semibold text-foreground">{filtered.length}</span>개 표시
                  {filtered.length !== all.length && (
                    <span className="ml-1 text-[var(--subtle-foreground)]">/ 전체 {all.length}개</span>
                  )}
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg border border-[var(--border)] text-[12px] font-semibold text-[var(--secondary-foreground)] hover:bg-[var(--surface-hover)] transition-all"
              >
                닫기
              </button>
              {selectedCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const ids = [...selected];
                    const first = filtered.find((p) => selected.has(p.id));
                    requestDelete(ids, selectedCount === 1 && first ? first.title : `${selectedCount}개 리서치`);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-[12px] font-semibold text-red-600 hover:bg-red-100 transition-all"
                >
                  <Trash2 size={12} />
                  삭제{selectedCount > 1 ? ` (${selectedCount}개)` : ""}
                </button>
              )}
              {selectedCount === 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const proj = filtered.find((p) => selected.has(p.id));
                    if (proj) onSelect(proj);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-white text-[12px] font-semibold hover:bg-primary-hover transition-all"
                >
                  열기
                  <ArrowUpRight size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 삭제 확인 */}
      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>리서치 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete && pendingDelete.ids.length === 1 ? (
                <>
                  <span className="font-medium text-foreground">"{pendingDelete.label}"</span>을(를) 삭제합니다. 이
                  작업은 되돌릴 수 없습니다.
                </>
              ) : (
                <>
                  선택한 <span className="font-medium text-foreground">{pendingDelete?.ids.length}개</span>의 리서치를
                  모두 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDelete(null)}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white border-0"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
