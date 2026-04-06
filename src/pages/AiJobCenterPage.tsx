import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Activity, Ban, BrainCircuit, CheckCircle2, Clock3, RefreshCcw, Search, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppPagination } from "@/components/ui/AppPagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { aiJobApi, type AIJob } from "@/lib/api";
import { useProject } from "@/hooks/useProject";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

const PAGE_SIZE = 10;

const JOB_TYPE_LABEL: Record<string, string> = {
  survey_generate: "설문 생성",
  persona_generate: "페르소나 생성",
  report_generate: "리포트 생성",
};

const STATUS_META: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  queued: {
    label: "대기 중",
    className: "border-[var(--border)] bg-card text-[var(--muted-foreground)]",
    icon: <Clock3 size={13} />,
  },
  running: {
    label: "실행 중",
    className: "border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] text-primary",
    icon: <Activity size={13} />,
  },
  completed: {
    label: "완료",
    className: "border-emerald-200 bg-emerald-50/60 text-emerald-700",
    icon: <CheckCircle2 size={13} />,
  },
  failed: {
    label: "실패",
    className: "border-red-200 bg-red-50/60 text-[var(--destructive)]",
    icon: <XCircle size={13} />,
  },
  cancelled: {
    label: "취소됨",
    className: "border-amber-200 bg-amber-50/60 text-amber-700",
    icon: <Ban size={13} />,
  },
};

function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function resultSummary(job: AIJob): string {
  const result = job.result_ref;
  if (!result) return "-";
  if (typeof result.question_count === "number") return `${result.question_count}개 문항 생성`;
  if (typeof result.persona_count === "number") return `${result.persona_count}개 페르소나 반영`;
  if (typeof result.report_id === "string") return `리포트 ${result.report_id}`;
  return result.resource ? String(result.resource) : "완료";
}

export const AiJobCenterPage: React.FC = () => {
  const { projectId } = useProject();
  const [jobs, setJobs] = useState<AIJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState<"all" | "survey_generate" | "persona_generate" | "report_generate">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "queued" | "running" | "completed" | "failed" | "cancelled">("all");
  const [page, setPage] = useState(1);

  const loadJobs = async (nextLoading = true) => {
    if (!projectId) return;
    if (nextLoading) setLoading(true);
    const { items } = await aiJobApi.listJobs({
      projectId,
      jobType: jobTypeFilter === "all" ? undefined : jobTypeFilter,
    });
    setJobs(items);
    if (nextLoading) setLoading(false);
  };

  useEffect(() => {
    if (!projectId) return;
    void loadJobs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, jobTypeFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, jobTypeFilter]);

  const hasActiveJobs = jobs.some((job) => job.status === "queued" || job.status === "running");
  useAutoRefresh(() => loadJobs(false), 2000, !!projectId && hasActiveJobs);

  const filteredJobs = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return jobs.filter((job) => {
      if (statusFilter !== "all" && job.status !== statusFilter) return false;
      if (!keyword) return true;
      return [
        job.id,
        job.project_id,
        JOB_TYPE_LABEL[job.job_type] ?? job.job_type,
        job.error_message ?? "",
        resultSummary(job),
      ].some((value) => value.toLowerCase().includes(keyword));
    });
  }, [jobs, searchQuery, statusFilter]);

  const paginatedJobs = filteredJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));

  const handleCancel = async (jobId: string) => {
    const updated = await aiJobApi.cancelJob(jobId);
    if (!updated) return;
    setJobs((current) => current.map((job) => (job.id === updated.id ? updated : job)));
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-[var(--muted-foreground)]">AI 작업 상태를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      <div className="app-page-header shrink-0 flex items-end justify-between gap-8 border-b border-[var(--border)]">
        <div>
          <p className="app-page-eyebrow">AI Orchestration</p>
          <h1 className="app-page-title mt-1">
            AI 작업 <span className="text-primary">허브.</span>
          </h1>
          <p className="app-page-description">
            설문, 페르소나, 리포트 생성 job의 상태를 한 곳에서 추적하고 제어합니다.
          </p>
        </div>
        <div className="flex items-center gap-3 pb-1">
          <div className="flex items-center gap-2.5 bg-card border border-[var(--border)] rounded-xl px-4 py-2.5 shadow-[var(--shadow-sm)] focus-within:border-primary transition-all group">
            <Search size={15} className="text-[var(--subtle-foreground)] group-focus-within:text-primary transition-colors" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="bg-transparent outline-none text-[13px] font-bold w-56 text-foreground placeholder:text-[var(--subtle-foreground)]"
              placeholder="job id 또는 결과 검색..."
            />
          </div>
          <Button variant="outline" className="gap-2 text-[13px] font-bold" onClick={() => void loadJobs(false)}>
            <RefreshCcw size={14} /> 새로고침
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-10 pt-8 pb-4 hide-scrollbar">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "전체" },
              { id: "survey_generate", label: "설문" },
              { id: "persona_generate", label: "페르소나" },
              { id: "report_generate", label: "리포트" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setJobTypeFilter(item.id as typeof jobTypeFilter)}
                className={`rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition-all ${
                  jobTypeFilter === item.id
                    ? "border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] text-primary"
                    : "border-[var(--border)] bg-card text-[var(--muted-foreground)] hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "전체 상태" },
              { id: "queued", label: "대기" },
              { id: "running", label: "실행" },
              { id: "completed", label: "완료" },
              { id: "failed", label: "실패" },
              { id: "cancelled", label: "취소" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStatusFilter(item.id as typeof statusFilter)}
                className={`rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition-all ${
                  statusFilter === item.id
                    ? "border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] text-primary"
                    : "border-[var(--border)] bg-card text-[var(--muted-foreground)] hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between px-1">
          <p className="text-[12px] font-black uppercase tracking-widest text-[var(--subtle-foreground)]">
            총 <span className="text-primary">{filteredJobs.length}</span>개의 작업
          </p>
          <div className="rounded-xl border border-[var(--border)] bg-card px-3 py-2 text-[12px] font-semibold text-[var(--muted-foreground)]">
            프로젝트: <span className="font-bold text-foreground">{projectId ?? "-"}</span>
          </div>
        </div>

        <div className="app-card overflow-hidden border-[var(--border)] shadow-[var(--shadow-[var(--shadow-md)])]">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--panel-soft)] hover:bg-[var(--panel-soft)] border-b border-[var(--border)]">
                <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--subtle-foreground)]">작업</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--subtle-foreground)]">유형</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--subtle-foreground)]">상태</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--subtle-foreground)] text-center">진행률</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--subtle-foreground)]">결과</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--subtle-foreground)]">생성 시각</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--subtle-foreground)] text-right pr-8">제어</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-[var(--muted-foreground)]">
                      <BrainCircuit size={28} className="text-[var(--subtle-foreground)]" />
                      <p className="text-[14px] font-semibold">조건에 맞는 AI 작업이 없습니다.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedJobs.map((job) => {
                  const statusMeta = STATUS_META[job.status] ?? STATUS_META.queued;
                  const canCancel = job.status === "queued" || job.status === "running";
                  return (
                    <TableRow key={job.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)]">
                      <TableCell className="px-6 py-4">
                        <div>
                          <p className="text-[13px] font-bold text-foreground">{job.id}</p>
                          <p className="text-[11px] font-medium text-[var(--muted-foreground)]">{job.project_id}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant="outline" className="border-[var(--border)] bg-card text-[var(--secondary-foreground)]">
                          {JOB_TYPE_LABEL[job.job_type] ?? job.job_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant="outline" className={`gap-1.5 ${statusMeta.className}`}>
                          {statusMeta.icon}
                          {statusMeta.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <div className="mx-auto w-28">
                          <div className="mb-1 flex items-center justify-between text-[11px] font-bold text-[var(--secondary-foreground)]">
                            <span>{job.progress}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${job.progress}%` }} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <p className="text-[12px] font-semibold text-[var(--secondary-foreground)]">{resultSummary(job)}</p>
                        {job.error_message && (
                          <p className="mt-1 max-w-xs truncate text-[11px] font-medium text-[var(--destructive)]">{job.error_message}</p>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div>
                          <p className="text-[12px] font-semibold text-[var(--secondary-foreground)]">{formatDateTime(job.created_at)}</p>
                          <p className="text-[11px] font-medium text-[var(--muted-foreground)]">완료: {formatDateTime(job.completed_at)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right pr-8">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canCancel}
                          onClick={() => void handleCancel(job.id)}
                          className="text-[12px] font-bold"
                        >
                          작업 취소
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-center pt-8 pb-10">
          <AppPagination current={page} total={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
};
