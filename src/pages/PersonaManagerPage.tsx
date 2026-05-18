import type React from "react";
import { useState, useEffect } from "react";
import {
  aiJobApi,
  personaApi,
  projectApi,
  type AIJob,
  type DynamicInsight,
  type PersonaIndividualStory,
  type ProjectDetail,
  type ProjectOption,
} from "@/lib/api";
import { AppPagination } from "../components/AppPagination";
import { PersonaIcon } from "@/components/persona/PersonaIcon";
import { PersonaDetailModal } from "@/components/persona/PersonaDetailModal";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Smartphone, LayoutGrid, List, AlertCircle, ChevronRight } from "lucide-react";

/* ─── Types ─── */
type Gender = "남성" | "여성";
type Segment = string;

interface Persona {
  id: string;
  projectId?: string;
  analysisRunId?: string | null;
  analysisContext?: Record<string, unknown>;
  name: string;
  age: number;
  gender: Gender;
  occupation: string;
  device: string;
  segments: Segment[];
  keywords: string[];
  purchaseIntent: number;
  color: string;
  iconBg: string;
  iconKey: number;
  description: string;
  dynamicInsights: DynamicInsight[];
  interests: string[];
  competitorPerception: string;
  marketingAcceptance: number;
  futureValue: number;
  purchaseHistory: string[];
  individualStories: PersonaIndividualStory[];
  userLogs: string[];
  brandAttitude: number;
}

const SEGMENT_COLORS: Record<Segment, { bg: string; text: string; border: string }> = {};
const DEFAULT_SEGMENT_COLOR = { bg: "#eef3ff", text: "#2f66ff", border: "#c9d8ff" };

const CARD_PAGE_SIZE = 9;
const LIST_PAGE_SIZE = 20;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPersonaItems(items: Array<Record<string, any>>): Persona[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (items || []).map((item: Record<string, any>, idx: number) => ({
    id: String(item.id ?? ""),
    projectId: item.project_id ? String(item.project_id) : undefined,
    analysisRunId: item.analysis_run_id ? String(item.analysis_run_id) : null,
    analysisContext: item.analysis_context && typeof item.analysis_context === "object" ? item.analysis_context : {},
    name: String(item.name || "이름 없음"),
    age: Number(item.age || 0),
    gender: (item.gender === "남성" || item.gender === "여성" ? item.gender : "남성") as Gender,
    occupation: String(item.occupation || "직업 미상"),
    device: Array.isArray(item.purchase_history)
      ? item.purchase_history[0] || item.product_group || "분석 중"
      : item.product_group || "분석 중",
    segments: [item.segment || "미분류 군집"] as Segment[],
    keywords: Array.isArray(item.keywords) && item.keywords.length ? item.keywords : [],
    purchaseIntent: Number(item.purchase_intent ?? 70),
    color: "var(--primary)",
    iconBg: "#eef3ff",
    iconKey: idx % 5,
    description: String(item.profile || "분석 실행 기준으로 생성된 군집 대표 페르소나입니다."),
    dynamicInsights: Array.isArray(item.dynamic_insights) ? (item.dynamic_insights as DynamicInsight[]) : [],
    interests: Array.isArray(item.interests) && item.interests.length ? item.interests : [],
    competitorPerception: Array.isArray(item.cot) ? item.cot.join(", ") || "분석 중" : "분석 중",
    marketingAcceptance: Number(item.marketing_acceptance ?? 80),
    futureValue: Number(item.future_value ?? 85),
    purchaseHistory:
      Array.isArray(item.purchase_history) && item.purchase_history.length
        ? item.purchase_history
        : item.product_group
          ? [String(item.product_group)]
          : [],
    individualStories:
      Array.isArray(item.individual_stories) && item.individual_stories.length ? item.individual_stories : [],
    userLogs: Array.isArray(item.activity_logs) && item.activity_logs.length ? item.activity_logs : ["분석 로그 없음"],
    brandAttitude: Number(item.brand_attitude ?? 80),
  }));
}

export const PersonaManagerPage: React.FC = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [total, setTotal] = useState(0);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const pageSize = viewMode === "card" ? CARD_PAGE_SIZE : LIST_PAGE_SIZE;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeJob, setActiveJob] = useState<AIJob | null>(null);
  const [detailTarget, setDetailTarget] = useState<Persona | undefined>();
  const [applyStoredFilter, setApplyStoredFilter] = useState(false);
  const [savedFilter, setSavedFilter] = useState<Record<string, unknown> | null>(null);

  const fetchPersonas = async (pid: string | null, pg: number, q: string, ps: number) => {
    try {
      const response = await personaApi.getPersonas(pid ?? undefined, pg, ps, q);
      setPersonas(mapPersonaItems(response.items));
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to fetch personas:", error);
      setPersonas([]);
      setTotal(0);
    }
  };

  const loadAll = async (pid: string | null) => {
    try {
      setLoading(true);
      setProjectId(pid);
      setPage(1);
      setSearchQuery("");
      setApplyStoredFilter(false);
      const [response, projectDetail, options, filterData] = await Promise.all([
        personaApi.getPersonas(pid ?? undefined, 1, CARD_PAGE_SIZE, ""),
        pid ? projectApi.getProject(pid) : Promise.resolve(null),
        projectApi.getProjectOptions(),
        pid ? projectApi.getSegmentFilter(pid) : Promise.resolve(null),
      ]);
      setProjectOptions(options);
      setProject(projectDetail);
      setPersonas(mapPersonaItems(response.items));
      setTotal(response.total);
      const pf = (filterData as Record<string, unknown> | null)?.persona_filter;
      setSavedFilter(pf && typeof pf === "object" ? (pf as Record<string, unknown>) : null);
    } catch (error) {
      console.error("Failed to load persona data:", error);
      setPersonas([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll(null);
  }, []);

  useEffect(() => {
    if (loading) return;
    setPage(1);
    void fetchPersonas(projectId, 1, searchQuery, pageSize);
  }, [viewMode]);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setPage(1);
    void fetchPersonas(projectId, 1, q, pageSize);
  };

  const handlePageChange = (pg: number) => {
    setPage(pg);
    void fetchPersonas(projectId, pg, searchQuery, pageSize);
  };

  useEffect(() => {
    if (!activeJob || !projectId) return;
    if (activeJob.status !== "queued" && activeJob.status !== "running") return;

    let cancelled = false;
    const pollJob = async () => {
      const latestJob = await aiJobApi.getJob(activeJob.id);
      if (!latestJob || cancelled) return;
      setActiveJob(latestJob);
      if (latestJob.status === "completed") {
        await fetchPersonas(projectId, page, searchQuery, pageSize);
      }
    };

    void pollJob();
    const timer = window.setInterval(() => {
      void pollJob();
    }, 1500);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [activeJob, projectId]);

  useEffect(() => {
    if (!detailTarget?.id) return;
    let cancelled = false;
    const loadDetail = async () => {
      const detail = await personaApi.getPersona(detailTarget.id);
      if (!detail || cancelled) return;
      setDetailTarget((current) => {
        if (!current || current.id !== detail.id) return current;
        const merged: Persona = {
          ...current,
          projectId: detail.project_id,
          analysisRunId: detail.analysis_run_id ?? current.analysisRunId,
          analysisContext: detail.analysis_context ?? current.analysisContext,
          description: detail.profile || current.description,
          purchaseHistory: detail.purchase_history?.length ? detail.purchase_history : current.purchaseHistory,
          individualStories: detail.individual_stories ?? current.individualStories,
          userLogs: detail.activity_logs?.length ? detail.activity_logs : current.userLogs,
          competitorPerception: detail.cot?.join(", ") || current.competitorPerception,
          purchaseIntent: detail.purchase_intent ?? current.purchaseIntent,
          marketingAcceptance: detail.marketing_acceptance ?? current.marketingAcceptance,
          brandAttitude: detail.brand_attitude ?? current.brandAttitude,
          futureValue: detail.score?.future_value ?? current.futureValue,
          dynamicInsights: detail.dynamic_insights ?? current.dynamicInsights,
        };
        return merged;
      });
    };
    void loadDetail();
    return () => {
      cancelled = true;
    };
  }, [detailTarget?.id]);

  const handleGeneratePersonas = async () => {
    if (!projectId) return;
    const job = await personaApi.generateJob({
      project_id: projectId,
      n_synthetic_customers: Math.max(project?.target_responses ?? 1000, 1000),
      overwrite_existing: true,
      ...(applyStoredFilter && savedFilter ? { pre_cluster_filter: savedFilter } : {}),
    });
    if (job) {
      setActiveJob(job);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const generationStatusLabel =
    activeJob?.status === "running"
      ? "생성 중"
      : activeJob?.status === "queued"
        ? "대기 중"
        : activeJob?.status === "failed"
          ? "실패"
          : activeJob?.status === "completed"
            ? "완료"
            : "준비";
  const generationStatusClass =
    activeJob?.status === "running" || activeJob?.status === "queued"
      ? "border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] text-primary"
      : activeJob?.status === "failed"
        ? "border-red-200 bg-red-50/50 text-[var(--destructive)]"
        : activeJob?.status === "completed"
          ? "border-emerald-200 bg-emerald-50/50 text-emerald-700"
          : "border-[var(--border)] bg-card text-[var(--muted-foreground)]";

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-[var(--muted-foreground)]">디지털 트윈 데이터를 불러오는 중..</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-background overflow-hidden">
      {/* ── 페이지 헤더 ── */}
      <div className="app-page-header shrink-0 flex items-start justify-between gap-8 border-b border-[var(--border)]">
        <div>
          <p className="app-page-eyebrow">Persona Lifecycle</p>
          <h1 className="app-page-title mt-1">
            가상 페르소나 <span className="text-primary">자산 관리</span>
          </h1>
          <p className="app-page-description">
            디지털 트윈으로 구현된 타겟 그룹별 페르소나 프로파일을 관리하고 분석에 활용합니다
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pt-1">
          <select
            className="rounded-xl border border-[var(--border)] bg-card px-4 py-2.5 text-[13px] font-semibold text-foreground outline-none"
            value={projectId ?? ""}
            onChange={(event) => {
              const nextProjectId = event.target.value || null;
              void loadAll(nextProjectId);
            }}
          >
            <option value="">전체 프로젝트</option>
            {projectOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2.5 bg-card border border-[var(--border)] rounded-xl px-4 py-2.5 shadow-[var(--shadow-[var(--shadow-sm)])] focus-within:border-primary transition-colors">
            <Search size={15} className="text-[var(--subtle-foreground)]" />
            <input
              className="bg-transparent outline-none text-[13px] font-medium w-48 text-foreground placeholder:text-[var(--subtle-foreground)]"
              placeholder="페르소나 검색.."
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
          </div>
          {projectId && savedFilter && (
            <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--muted-foreground)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={applyStoredFilter}
                onChange={(e) => setApplyStoredFilter(e.target.checked)}
                className="rounded"
              />
              저장된 필터 기반 분석
            </label>
          )}
          <Button
            size="sm"
            className="gap-2 text-[13px] font-bold px-5 active:scale-95"
            onClick={() => void handleGeneratePersonas()}
            disabled={!projectId || activeJob?.status === "queued" || activeJob?.status === "running"}
          >
            <Plus size={15} strokeWidth={2.5} />
            {activeJob?.status === "queued" || activeJob?.status === "running" ? "AI 생성 중" : "페르소나 업데이트"}
          </Button>
        </div>
      </div>

      {/* ── 본문 ── */}
      <div className="flex-1 overflow-y-auto px-10 pt-8 pb-4 hide-scrollbar">
        {/* 뷰 전환 툴바 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-1 bg-[var(--panel-soft)] p-1 rounded-xl border border-[var(--border)] shadow-[var(--shadow-[var(--shadow-sm)])]">
            <button
              onClick={() => setViewMode("card")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-bold transition-all ${
                viewMode === "card"
                  ? "bg-card text-primary shadow-[var(--shadow-[var(--shadow-sm)])] border border-[var(--border)]"
                  : "text-[var(--subtle-foreground)] hover:text-foreground"
              }`}
            >
              <LayoutGrid size={14} /> 카드 뷰
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-bold transition-all ${
                viewMode === "list"
                  ? "bg-card text-primary shadow-[var(--shadow-[var(--shadow-sm)])] border border-[var(--border)]"
                  : "text-[var(--subtle-foreground)] hover:text-foreground"
              }`}
            >
              <List size={14} /> 리스트 뷰
            </button>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[11px] font-bold text-[var(--subtle-foreground)] uppercase tracking-[0.14em]">
              총 <span className="text-primary">{(project?.persona_count ?? total).toLocaleString()}</span>명의 자산
              등록됨
            </p>
            <Badge variant="outline" className={generationStatusClass}>
              생성 상태: {generationStatusLabel}
            </Badge>
          </div>
        </div>

        {activeJob?.status === "failed" && activeJob.error_message && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50/60 px-4 py-3 text-[13px] font-medium text-[var(--destructive)]">
            <AlertCircle size={15} />
            <span>{activeJob.error_message}</span>
          </div>
        )}

        {/* ── 카드 뷰 ── */}
        {personas.length > 0 ? (
          viewMode === "card" ? (
            <div className="grid grid-cols-1 gap-5 mb-10 md:grid-cols-2 xl:grid-cols-3">
              {personas.map((p) => {
                const riskFlag =
                  100 - Math.round(p.brandAttitude * 0.45 + p.marketingAcceptance * 0.25 + p.purchaseIntent * 0.3);
                const riskMeta =
                  riskFlag >= 50
                    ? { label: "High Risk", cls: "border-red-200 bg-red-50/50 text-[var(--destructive)]" }
                    : riskFlag >= 35
                      ? { label: "Watch", cls: "border-amber-200 bg-amber-50/50 text-amber-600" }
                      : { label: "Stable", cls: "border-emerald-200 bg-emerald-50/50 text-emerald-600" };

                return (
                  <article
                    key={p.id}
                    className="app-card flex flex-col gap-0 p-5 transition-all hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-[var(--shadow-md)])]"
                  >
                    {/* 헤더 */}
                    <header className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                          style={{ backgroundColor: p.iconBg }}
                        >
                          <PersonaIcon iconKey={p.iconKey} size={20} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-[15px] font-bold text-foreground">{p.name}</h3>
                          <p className="text-[11px] font-medium text-[var(--muted-foreground)] mt-0.5">
                            {p.age}세 · {p.gender} · {p.occupation}
                          </p>
                        </div>
                      </div>
                      <Badge className={`text-[10px] uppercase tracking-tight shrink-0 ${riskMeta.cls}`}>
                        {riskMeta.label}
                      </Badge>
                    </header>

                    {/* 인구통계 stat 그리드 */}
                    <div className="grid grid-cols-2 gap-1.5 mb-4">
                      {[
                        { label: "연령", value: `${p.age}세` },
                        { label: "성별", value: p.gender },
                        { label: "직업", value: p.occupation },
                        { label: "주기기", value: p.device },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-2"
                        >
                          <span className="text-[10px] font-bold text-[var(--subtle-foreground)] uppercase tracking-wide">
                            {s.label}
                          </span>
                          <span className="text-[11px] font-bold text-foreground truncate max-w-[80px] text-right">
                            {s.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* 핵심 점수 바 */}
                    <div className="space-y-2 mb-4">
                      {[
                        { label: "브랜드 태도", value: p.brandAttitude },
                        { label: "구매 의향", value: p.purchaseIntent },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-[var(--subtle-foreground)] w-16 shrink-0">
                            {row.label}
                          </span>
                          <div className="flex-1 h-1.5 bg-[var(--panel-soft)] rounded-full overflow-hidden border border-[var(--border)]/50">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${row.value}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-black text-foreground tabular-nums w-7 text-right shrink-0">
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* 푸터 */}
                    <footer className="flex items-center justify-between border-t border-[var(--border)] pt-3.5">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--subtle-foreground)] mb-0.5">
                          Future Value
                        </p>
                        <p className="text-[14px] font-black text-foreground">{p.futureValue}%</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDetailTarget(p)}
                        className="gap-1.5 text-[12px] font-bold text-[var(--secondary-foreground)] border-[var(--border)] bg-[var(--panel-soft)] hover:border-[var(--primary-light-border)] hover:bg-[var(--primary-light-bg)] hover:text-primary active:scale-95"
                      >
                        상세 분석 <ChevronRight size={13} />
                      </Button>
                    </footer>
                  </article>
                );
              })}
            </div>
          ) : (
            /* ── 리스트 뷰 ── */
            <div className="app-card overflow-hidden mb-12 border-[var(--border)] shadow-[var(--shadow-[var(--shadow-md)])]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[var(--panel-soft)] hover:bg-[var(--panel-soft)] border-b border-[var(--border)]">
                    <TableHead className="px-6 py-4 text-[10px] font-bold text-[var(--subtle-foreground)] uppercase tracking-[0.14em] h-auto">
                      페르소나 프로필
                    </TableHead>
                    <TableHead className="px-6 py-4 text-[10px] font-bold text-[var(--subtle-foreground)] uppercase tracking-[0.14em] h-auto">
                      세그먼트
                    </TableHead>
                    <TableHead className="px-6 py-4 text-[10px] font-bold text-[var(--subtle-foreground)] uppercase tracking-[0.14em] h-auto">
                      기기
                    </TableHead>
                    <TableHead className="px-6 py-4 text-[10px] font-bold text-[var(--subtle-foreground)] uppercase tracking-[0.14em] h-auto text-center">
                      브랜드 / 의향
                    </TableHead>
                    <TableHead className="px-6 py-4 text-[10px] font-bold text-[var(--subtle-foreground)] uppercase tracking-[0.14em] h-auto text-center">
                      미래 가치
                    </TableHead>
                    <TableHead className="px-6 py-4 text-[10px] font-bold text-[var(--subtle-foreground)] uppercase tracking-[0.14em] h-auto text-center">
                      마케팅 수용도
                    </TableHead>
                    <TableHead className="px-6 py-4 text-[10px] font-bold text-[var(--subtle-foreground)] uppercase tracking-[0.14em] h-auto text-center">
                      이탈 위험
                    </TableHead>
                    <TableHead className="px-6 py-4 text-[10px] font-bold text-[var(--subtle-foreground)] uppercase tracking-[0.14em] h-auto text-right pr-8">
                      상세 분석
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {personas.map((p) => {
                    const risk =
                      100 - Math.round(p.brandAttitude * 0.45 + p.marketingAcceptance * 0.25 + p.purchaseIntent * 0.3);
                    const riskCls =
                      risk >= 50
                        ? "border-red-200 bg-red-50/50 text-[var(--destructive)]"
                        : risk >= 35
                          ? "border-amber-200 bg-amber-50/50 text-amber-600"
                          : "border-emerald-200 bg-emerald-50/50 text-emerald-600";
                    return (
                      <TableRow
                        key={p.id}
                        className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors group"
                      >
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: p.iconBg }}
                            >
                              <PersonaIcon iconKey={p.iconKey} size={20} />
                            </div>
                            <div>
                              <p className="text-[14px] font-bold text-foreground mb-0.5">{p.name}</p>
                              <p className="text-[11px] font-semibold text-[var(--muted-foreground)]">
                                {p.age}세 · {p.occupation}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {p.segments.map((seg) => {
                              const segmentColor = SEGMENT_COLORS[seg] ?? DEFAULT_SEGMENT_COLOR;
                              return (
                                <Badge
                                  key={seg}
                                  variant="outline"
                                  style={{
                                    backgroundColor: segmentColor.bg,
                                    color: segmentColor.text,
                                    borderColor: segmentColor.border,
                                  }}
                                >
                                  {seg}
                                </Badge>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Smartphone size={12} className="text-[var(--subtle-foreground)] shrink-0" />
                            <span className="text-[12px] font-semibold text-[var(--secondary-foreground)] whitespace-nowrap">
                              {p.device}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <p className="text-[14px] font-bold text-primary">{p.brandAttitude}</p>
                          <p className="text-[10px] font-bold text-[var(--subtle-foreground)] uppercase">
                            Intent {p.purchaseIntent}%
                          </p>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <p className="text-[14px] font-bold text-foreground">{p.futureValue}%</p>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <p className="text-[14px] font-bold text-foreground">{p.marketingAcceptance}%</p>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <Badge className={`uppercase ${riskCls}`}>{risk}%</Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right pr-8">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDetailTarget(p)}
                            className="gap-1.5 text-[12px] font-bold text-[var(--secondary-foreground)] border-[var(--border)] bg-[var(--panel-soft)] hover:border-[var(--primary-light-border)] hover:bg-[var(--primary-light-bg)] hover:text-primary"
                          >
                            상세 <ChevronRight size={13} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )
        ) : null}
        <div className="flex items-center justify-between pt-2 pb-10">
          <p className="text-[12px] font-bold text-[var(--muted-foreground)]">
            총 {total.toLocaleString()}명 중 {(page - 1) * pageSize + (total === 0 ? 0 : 1)}-
            {Math.min(page * pageSize, total)}명 표시
          </p>
          <AppPagination current={page} total={totalPages} onChange={handlePageChange} />
        </div>
      </div>

      {detailTarget && <PersonaDetailModal persona={detailTarget} onClose={() => setDetailTarget(undefined)} />}
    </div>
  );
};
