import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  RotateCcw,
  ChevronDown,
  Activity,
  Target,
  TrendingUp,
  Users,
  Zap,
  ShieldCheck,
  ExternalLink,
  Layers,
  Database,
  X,
  ChevronRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  aiJobApi,
  fetchIndividualPersonas,
  reportApi,
  simulationApi,
  surveyApi,
  type KeywordTrendItem,
  type AIJob,
  type Persona,
  type ReportDownloadInfo,
  type ReportDetail,
  type ResponseDistributionItem,
  type ResponseListItem,
  type QuestionStat,
  type ActionPlanResponse,
  geminiApi,
} from "@/lib/api";
import { useProject } from "@/hooks/useProject";
import { AiLoadingModal } from "@/components/ui/ai-loading-modal";
import { stopNavigationLoading } from "@/lib/navigationLoading";

const SECTIONS = [
  { id: "summary", label: "종합 분석 요약", icon: "01" },
  { id: "findings", label: "전략적 핵심 인사이트", icon: "02" },
  { id: "detail", label: "데이터 기반 상세 분석", icon: "03" },
  { id: "segment", label: "세그먼트 기회 매트릭스", icon: "04" },
  { id: "actionPlan", label: "마케팅 액션 플랜", icon: "05" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

interface DistributionWithQuestion {
  questionId: string;
  questionText: string;
  distribution: ResponseDistributionItem[];
}

interface FindingCardData {
  id: string;
  tag: string;
  label: string;
  value: string;
  desc: string;
  evidence: { label: string; value: string }[];
  action: string;
  tone: "primary" | "neutral";
}

interface SegmentCardData {
  segment: string;
  count: number;
  share: number;
  buyChannel: string;
  productGroup: string;
  region: string;
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function percentileFromCount(count: number, total: number): number {
  if (!total) return 0;
  return (count / total) * 100;
}

function topEntry(values: string[]): string {
  const counts = new Map<string, number>();
  values.filter(Boolean).forEach((value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "데이터 없음";
}

function parseBudgetAllocation(value?: string) {
  if (!value) return [];
  return value
    .split("/")
    .map((item) => item.trim())
    .map((item) => {
      const match = item.match(/(.+?)\s+(\d+)%/);
      if (!match) return null;
      return { label: match[1].trim(), percent: Number(match[2]) };
    })
    .filter((item): item is { label: string; percent: number } => item !== null);
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  delta,
  reliability,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  delta?: string;
  reliability: string;
}) {
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

function SectionHeader({
  num,
  title,
  badge,
  onDetailClick,
}: {
  num: string;
  title: string;
  badge?: string;
  onDetailClick?: () => void;
}) {
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

export const ReportPage: React.FC = () => {
  const { project, projectId } = useProject();
  const [activeSection, setSection] = useState<SectionId>("summary");
  const [downloadOpen, setDownloadOpen] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);
  const [reportData, setReportData] = useState<ReportDetail | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [keywords, setKeywords] = useState<KeywordTrendItem[]>([]);
  const [questionDistributions, setQuestionDistributions] = useState<DistributionWithQuestion[]>([]);
  const [downloadInfo, setDownloadInfo] = useState<ReportDownloadInfo | null>(null);
  const [activeReportJob, setActiveReportJob] = useState<AIJob | null>(null);
  const [actionPlan, setActionPlan] = useState<ActionPlanResponse | null>(null);
  const [actionPlanLoading, setActionPlanLoading] = useState(false);
  const [sourceDrawer, setSourceDrawer] = useState<{
    open: boolean;
    questionId: string | null;
    stat: QuestionStat | null;
    responses: ResponseListItem[];
    loading: boolean;
    page: number;
    total: number;
  }>({ open: false, questionId: null, stat: null, responses: [], loading: false, page: 1, total: 0 });

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    const loadData = async () => {
      const [{ items }, personaItems, surveyQuestions, keywordItems] = await Promise.all([
        reportApi.listReports(projectId, 1, 1),
        fetchIndividualPersonas(projectId),
        surveyApi.getQuestions(projectId),
        simulationApi.getKeywords(projectId),
      ]);

      if (cancelled) return;
      setPersonas(personaItems);
      setKeywords(keywordItems);

      if (items[0]?.id) {
        const detail = await reportApi.getReport(items[0].id);
        const nextDownloadInfo = await reportApi.getDownloadInfo(items[0].id, "pdf");
        if (!cancelled) {
          setReportData(detail);
          setDownloadInfo(nextDownloadInfo);
        }
      }

      const distributions = await Promise.all(
        surveyQuestions.map(async (question) => ({
          questionId: question.id,
          questionText: question.text,
          distribution: await simulationApi.getDistribution(projectId, question.id),
        }))
      );

      if (!cancelled) {
        setQuestionDistributions(distributions.filter((item) => item.distribution.length > 0));
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      stopNavigationLoading();
    }
  }, [projectId]);

  useEffect(() => {
    if (!activeReportJob) return;
    if (activeReportJob.status !== "queued" && activeReportJob.status !== "running") return;
    let cancelled = false;
    const pollJob = async () => {
      const latest = await aiJobApi.getJob(activeReportJob.id);
      if (!latest || cancelled) return;
      setActiveReportJob(latest);
      if (latest.status === "completed") {
        const reportId = typeof latest.result_ref?.report_id === "string" ? latest.result_ref.report_id : null;
        if (reportId) {
          const [detail, nextDownloadInfo] = await Promise.all([
            reportApi.getReport(reportId),
            reportApi.getDownloadInfo(reportId, "pdf"),
          ]);
          if (!cancelled) {
            setReportData(detail);
            setDownloadInfo(nextDownloadInfo);
          }
        }
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
  }, [activeReportJob]);

  const sectionRefs: Record<SectionId, React.RefObject<HTMLDivElement>> = {
    summary: useRef<HTMLDivElement>(null),
    findings: useRef<HTMLDivElement>(null),
    detail: useRef<HTMLDivElement>(null),
    segment: useRef<HTMLDivElement>(null),
    actionPlan: useRef<HTMLDivElement>(null),
  };

  const totalCount = personas.length;

  const fallbackRadarData = useMemo(() => {
    const maxFrequency = Math.max(...keywords.map((item) => item.frequency), 1);
    return keywords.slice(0, 5).map((item) => ({
      subject: item.keyword,
      dominant: Math.round((item.frequency / maxFrequency) * 100),
      baseline: 50,
      fullMark: 100,
    }));
  }, [keywords]);

  const fallbackTrendData = useMemo(() => {
    return questionDistributions.slice(0, 7).map((item, index) => ({
      label: item.questionId || `Q${index + 1}`,
      value: Math.max(...item.distribution.map((entry) => entry.value), 0),
    }));
  }, [questionDistributions]);

  const insightCards = useMemo<FindingCardData[]>(() => {
    const reportSections = (reportData?.sections ?? [])
      .filter((section) => section.id === "findings")
      .map((section, index) => ({
        id: section.id,
        tag: index === 0 ? "Report Section" : "Analysis Note",
        label: section.title,
        value: section.title,
        desc: section.content,
        evidence:
          section.evidence ??
          reportData?.kpis?.slice(0, 3).map((kpi) => ({ label: kpi.label, value: kpi.value })) ??
          [],
        action: section.action ?? section.content,
        tone: "primary" as const,
      }));

    const keywordCard = keywords[0]
      ? {
          id: `keyword-${keywords[0].keyword}`,
          tag: "Keyword Signal",
          label: "최상위 연관 키워드",
          value: keywords[0].keyword,
          desc: `응답 데이터에서 ${keywords[0].keyword} 키워드가 가장 자주 관측되었습니다.`,
          evidence: keywords.slice(0, 3).map((item) => ({
            label: item.keyword,
            value: `${item.frequency}회`,
          })),
          action: `${keywords[0].keyword} 관련 메시지를 메인 카피와 상세 페이지 핵심 표현으로 우선 배치합니다.`,
          tone: "neutral" as const,
        }
      : null;

    return [...reportSections, ...(keywordCard ? [keywordCard] : [])].slice(0, 3);
  }, [keywords, reportData]);

  const fallbackAgeOpportunityData = useMemo(() => {
    const buckets = new Map<string, number>([
      ["20대", 0],
      ["30대", 0],
      ["40대", 0],
      ["50대+", 0],
    ]);
    personas.forEach((persona) => {
      if (persona.age < 30) buckets.set("20대", (buckets.get("20대") ?? 0) + 1);
      else if (persona.age < 40) buckets.set("30대", (buckets.get("30대") ?? 0) + 1);
      else if (persona.age < 50) buckets.set("40대", (buckets.get("40대") ?? 0) + 1);
      else buckets.set("50대+", (buckets.get("50대+") ?? 0) + 1);
    });

    const highest = Math.max(...buckets.values(), 1);
    return [...buckets.entries()].map(([name, value]) => ({
      name,
      value,
      benchmark: highest,
    }));
  }, [personas]);

  const fallbackSegmentCards = useMemo<SegmentCardData[]>(() => {
    const grouped = new Map<string, Persona[]>();
    personas.forEach((persona) => {
      const current = grouped.get(persona.segment) ?? [];
      current.push(persona);
      grouped.set(persona.segment, current);
    });

    return [...grouped.entries()]
      .map(([segment, members]) => ({
        segment,
        count: members.length,
        share: percentileFromCount(members.length, totalCount),
        buyChannel: topEntry(members.map((persona) => persona.buy_channel)),
        productGroup: topEntry(members.map((persona) => persona.product_group)),
        region: topEntry(members.map((persona) => persona.region)),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [personas, totalCount]);

  const dominantQuestion = questionDistributions[0];
  const executiveSummary =
    reportData?.sections?.find((section) => section.id === "summary")?.content ?? "리포트 본문 데이터가 아직 없습니다.";
  const radarData =
    (reportData?.charts?.find((chart) => chart.id === "keyword-radar")?.data as typeof fallbackRadarData | undefined) ??
    fallbackRadarData;
  const trendData =
    (reportData?.charts?.find((chart) => chart.id === "question-strength")?.data as
      | typeof fallbackTrendData
      | undefined) ?? fallbackTrendData;
  const ageOpportunityData =
    (reportData?.charts?.find((chart) => chart.id === "age-distribution")?.data as
      | typeof fallbackAgeOpportunityData
      | undefined) ?? fallbackAgeOpportunityData;
  const segmentCards =
    (reportData?.charts?.find((chart) => chart.id === "segment-cards")?.data as SegmentCardData[] | undefined) ??
    fallbackSegmentCards;
  const reportDistributionData =
    (reportData?.charts?.find((chart) => chart.id === "question-distribution")?.data as
      | Array<{ question_id: string; question_text: string; distribution: ResponseDistributionItem[] }>
      | undefined) ?? [];
  const reportDominantQuestion = reportDistributionData[0];
  const budgetAllocationItems = useMemo(
    () => parseBudgetAllocation(actionPlan?.budget_allocation),
    [actionPlan?.budget_allocation]
  );

  const openSourceDrawer = async (questionId: string) => {
    if (!projectId) return;
    const stat = reportData?.question_stats?.find((s) => s.question_id === questionId) ?? null;
    setSourceDrawer({ open: true, questionId, stat, responses: [], loading: true, page: 1, total: 0 });
    const result = await simulationApi.getResponses(projectId, questionId, undefined, 1, 20);
    setSourceDrawer((prev) => ({
      ...prev,
      responses: result.items,
      total: result.total,
      loading: false,
    }));
  };

  const loadMoreResponses = async () => {
    if (!projectId || !sourceDrawer.questionId) return;
    const nextPage = sourceDrawer.page + 1;
    const result = await simulationApi.getResponses(projectId, sourceDrawer.questionId, undefined, nextPage, 20);
    setSourceDrawer((prev) => ({
      ...prev,
      responses: [...prev.responses, ...result.items],
      page: nextPage,
    }));
  };

  const scrollToSection = (id: SectionId) => {
    setSection(id);
    const target = sectionRefs[id].current;
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSection(entry.target.id as SectionId);
          }
        });
      },
      { rootMargin: "-150px 0px -70% 0px", threshold: 0 }
    );

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  const handleGenerateReport = async () => {
    if (!projectId) return;
    const job = await reportApi.generateJob({
      project_id: projectId,
      report_type: "strategy",
    });
    if (job) {
      setActiveReportJob(job);
    }
  };

  const handleGenerateActionPlan = async () => {
    if (!reportData?.id) return;
    setActionPlanLoading(true);
    try {
      const plan = await geminiApi.getMarketingActionPlan(reportData.id);
      if (plan) setActionPlan(plan);
    } catch (error) {
      console.error("Action plan generation failed:", error);
    } finally {
      setActionPlanLoading(false);
    }
  };

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) setDownloadOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <AiLoadingModal
        open={activeReportJob?.status === "queued" || activeReportJob?.status === "running"}
        title="리포트 재분석"
        steps={[
          "설문 결과와 세그먼트 데이터를 다시 읽고 있습니다…",
          "핵심 인사이트와 패턴을 재분석하고 있습니다…",
          "전략적 요약과 리포트 구조를 재구성하고 있습니다…",
          "시사점과 우선 과제를 다시 정리하고 있습니다…",
          "재분석 결과를 리포트에 반영하고 있습니다…",
        ]}
      />
      <AiLoadingModal
        open={actionPlanLoading}
        title="액션 플랜 생성"
        steps={[
          "리포트 핵심 결과를 해석하고 있습니다…",
          "우선순위가 높은 실행 과제를 도출하고 있습니다…",
          "세그먼트별 실행 전략을 정리하고 있습니다…",
          "채널과 메시지 우선순위를 조정하고 있습니다…",
          "마케팅 액션 플랜을 생성하고 있습니다…",
        ]}
      />
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <div className="app-page-header relative z-30 flex shrink-0 items-center justify-between">
        <div>
          <p className="app-page-eyebrow">Insight Report</p>
          <h1 className="app-page-title mt-1">
            전략적 분석 결과 <span className="text-primary">최종 리포트</span>
          </h1>
          <p className="app-page-description">{`${(project?.target_responses ?? 0).toLocaleString()}건 규모 프로젝트 기반 컨설팅 인사이트 보고서입니다.`}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={() => void handleGenerateReport()}
            disabled={!projectId || activeReportJob?.status === "queued" || activeReportJob?.status === "running"}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-card px-5 py-2.5 text-[13px] font-black text-[var(--secondary-foreground)] shadow-[var(--shadow-sm)] transition-all hover:bg-[var(--panel-soft)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RotateCcw size={16} />
            {activeReportJob?.status === "queued" || activeReportJob?.status === "running"
              ? "리포트 생성 중"
              : "재분석 실행"}
          </button>
          <div className="relative z-40" ref={downloadRef}>
            <button
              onClick={() => setDownloadOpen(!downloadOpen)}
              className="flex items-center gap-3 rounded-xl bg-primary px-7 py-2.5 text-[14px] font-black text-white shadow-[var(--shadow-lg)] transition-all hover:bg-primary-hover active:scale-95"
            >
              <Download size={18} />
              리포트 내보내기
              <ChevronDown size={16} className={`transition-transform ${downloadOpen ? "rotate-180" : ""}`} />
            </button>
            {downloadOpen && (
              <div className="absolute right-0 top-full z-50 mt-3 w-56 rounded-2xl border border-[var(--border)] bg-card p-1.5 shadow-[var(--shadow-lg)]">
                <a
                  href={downloadInfo?.download_url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full rounded-xl px-4 py-3 text-left text-[13px] font-bold text-[var(--secondary-foreground)] transition-all hover:bg-[var(--panel-soft)] hover:text-primary"
                >
                  PDF (High Quality) 다운로드
                </a>
                <button className="w-full rounded-xl px-4 py-3 text-left text-[13px] font-bold text-[var(--secondary-foreground)] transition-all hover:bg-[var(--panel-soft)] hover:text-primary">
                  DOCX (Editable) 다운로드
                </button>
                <button className="w-full rounded-xl px-4 py-3 text-left text-[13px] font-bold text-[var(--secondary-foreground)] transition-all hover:bg-[var(--panel-soft)] hover:text-primary">
                  PPTX (Presentation) 다운로드
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hide-scrollbar flex-1 overflow-y-auto px-10 pb-10 scroll-smooth">
        <div className="mx-auto max-w-[1600px] space-y-8 pb-24 pt-2">
          <section className="grid grid-cols-4 gap-6">
            <KpiCard
              icon={<Users size={22} />}
              label="분석 총 표본수"
              value={reportData?.kpis?.[2]?.value ?? project?.target_responses?.toLocaleString() ?? "0"}
              sub={`${personas.length.toLocaleString()}명 페르소나 데이터 반영`}
              delta={reportData?.kpis?.[0]?.value}
              reliability="99.2%"
            />
            <KpiCard
              icon={<Target size={22} />}
              label="리포트 핵심 KPI"
              value={reportData?.kpis?.[0]?.value ?? "데이터 없음"}
              sub={reportData?.kpis?.[0]?.label ?? "핵심 KPI 미생성"}
              reliability="95.0%"
            />
            <KpiCard
              icon={<ShieldCheck size={22} />}
              label="총 시뮬레이션 응답"
              value={reportData?.kpis?.[3]?.value ?? "데이터 없음"}
              sub={reportData?.kpis?.[3]?.label ?? "응답 지표 미생성"}
              reliability="99.9%"
            />
            <KpiCard
              icon={<Zap size={22} />}
              label="전략 액션 수"
              value={String(insightCards.length).padStart(2, "0")}
              sub="리포트 인사이트 기반 권장 액션"
              delta={keywords[0] ? `${keywords[0].frequency}회` : undefined}
              reliability="High"
            />
          </section>

          <div className="grid grid-cols-[280px_1fr] items-start gap-8">
            <aside className="sticky top-0 z-20 space-y-1.5 rounded-[28px] border border-[var(--border)] bg-white/80 p-4 backdrop-blur-md shadow-[var(--shadow-md)]">
              <div className="mb-2 border-b border-[var(--border)] px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                  Table of Contents
                </p>
              </div>
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`group/nav relative flex w-full items-center gap-4 rounded-2xl px-4 py-4 transition-all ${
                    activeSection === section.id
                      ? "bg-primary font-black text-white shadow-[var(--shadow-sm)]"
                      : "text-[var(--subtle-foreground)] hover:bg-[var(--panel-soft)]"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-xl border text-[11px] font-black transition-all ${
                      activeSection === section.id
                        ? "border-white/30 bg-white/20 text-white"
                        : "border-[var(--border)] bg-[var(--panel-soft)] text-[var(--muted-foreground)] opacity-60 group-hover/nav:opacity-100"
                    }`}
                  >
                    {section.icon}
                  </span>
                  <span className="text-[13.5px] tracking-tight">{section.label}</span>
                </button>
              ))}
            </aside>

            <div className="space-y-10">
              <section id="summary" ref={sectionRefs.summary} className="app-card group relative overflow-hidden p-12">
                <div className="absolute -right-64 -top-64 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl transition-all duration-1000 group-hover:bg-primary/10" />
                <SectionHeader num="01" title="종합 분석 및 총평" badge="Executive Summary" />

                <div className="relative z-10 grid grid-cols-2 gap-16">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="flex items-center gap-3 text-[13px] font-black uppercase tracking-widest text-foreground">
                        <Layers size={16} className="text-primary" />
                        상위 키워드 레이더
                      </p>
                      <span className="text-[11px] font-black text-[var(--muted-foreground)]">Keyword Frequency</span>
                    </div>
                    <div className="app-soft h-[280px] rounded-3xl border-[var(--border)] bg-[var(--panel-soft)] p-6 shadow-inner">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="var(--border)" />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fontSize: 11, fontWeight: 800, fill: "var(--secondary-foreground)" }}
                          />
                          <Radar
                            name="현재 데이터"
                            dataKey="dominant"
                            stroke="var(--chart-1)"
                            fill="var(--chart-1)"
                            fillOpacity={0.15}
                            strokeWidth={4}
                          />
                          <Radar
                            name="기준선"
                            dataKey="baseline"
                            stroke="var(--subtle-foreground)"
                            fill="var(--subtle-foreground)"
                            fillOpacity={0.05}
                            strokeWidth={2}
                            strokeDasharray="4 4"
                          />
                          <Tooltip contentStyle={{ borderRadius: 16, border: "none", boxShadow: "var(--shadow-lg)" }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="flex items-center gap-3 text-[13px] font-black uppercase tracking-widest text-foreground">
                        <Activity size={16} className="text-primary" />
                        문항별 우세 응답 강도
                      </p>
                      <span className="text-[11px] font-black text-[var(--muted-foreground)]">
                        Response Distribution
                      </span>
                    </div>
                    <div className="app-soft h-[280px] rounded-3xl border-[var(--border)] bg-[var(--panel-soft)] p-6 shadow-inner">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                          <defs>
                            <linearGradient id="reportTrendArea" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 3" />
                          <XAxis dataKey="label" hide />
                          <Tooltip contentStyle={{ borderRadius: 16, border: "none", boxShadow: "var(--shadow-lg)" }} />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="var(--chart-1)"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#reportTrendArea)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="mb-12 mt-16 border-y border-[var(--border)] px-2 py-12">
                  <div className="mx-auto max-w-4xl">
                    <div className="mb-10 flex items-baseline justify-between border-b border-[var(--border)] pb-6">
                      <div>
                        <h2 className="mb-1 text-[24px] font-bold tracking-tight text-foreground">
                          Strategic Intelligence Report
                        </h2>
                        <p className="text-[14px] font-medium text-[var(--muted-foreground)]">
                          AI 기반 종합 전략 분석 요약
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--subtle-foreground)]">
                          Confidence Index
                        </p>
                        <p className="text-[18px] font-bold text-primary">{reportData?.kpis?.[3]?.value ?? "N/A"}</p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-6 bottom-0 top-0 w-1 rounded-full bg-primary/20" />
                      <p className="text-justify text-[20px] font-medium leading-[1.8] tracking-tight text-foreground">
                        {executiveSummary}
                      </p>
                    </div>

                    <div className="mt-12 flex items-center gap-8 border-t border-[var(--border)] pt-6 text-[12px] font-medium text-[var(--subtle-foreground)]">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--border)]" />
                        <span>표본 규모: {(project?.target_responses ?? 0).toLocaleString()}건</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--border)]" />
                        <span>리포트 섹션: {(reportData?.sections ?? []).length}개</span>
                      </div>
                      <div className="ml-auto italic opacity-60">Generated by AI Strategic Engine</div>
                    </div>
                  </div>
                </div>
              </section>

              <section id="findings" ref={sectionRefs.findings} className="app-card relative overflow-hidden p-12">
                <SectionHeader num="02" title="전략적 핵심 인사이트" badge="Key Findings & Decisions" />
                <div className="grid grid-cols-1 gap-6">
                  {insightCards.length > 0 ? (
                    insightCards.map((card, index) => {
                      const isNeutral = card.tone === "neutral";
                      return (
                        <div
                          key={card.id}
                          className={`group overflow-hidden rounded-3xl border transition-all duration-300 ${isNeutral ? "border-[var(--border)] bg-[var(--panel-soft)]/40 hover:border-primary/30" : "border-[var(--border)] bg-card hover:border-primary/30"}`}
                        >
                          <div className="flex items-center gap-6 border-b border-[var(--border)] bg-card px-10 py-6">
                            <div
                              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[18px] font-black shadow-[var(--shadow-sm)] transition-all duration-300 group-hover:scale-110 ${isNeutral ? "bg-[var(--panel-soft)] text-primary" : "border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] text-primary"}`}
                            >
                              #{index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                <span className="rounded-lg border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-primary">
                                  {card.tag}
                                </span>
                                <span className="text-[11px] font-black uppercase tracking-widest text-[var(--subtle-foreground)]">
                                  {card.label}
                                </span>
                              </div>
                              <h4 className="truncate text-[20px] font-black tracking-tight text-foreground">
                                {card.value}
                              </h4>
                            </div>
                          </div>

                          <div className="grid grid-cols-[1fr_320px] divide-x divide-[var(--border)]">
                            <div className="space-y-6 p-8">
                              <p className="text-[14px] font-semibold leading-relaxed text-[var(--secondary-foreground)]">
                                {card.desc}
                              </p>
                              <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                                  근거 데이터
                                </p>
                                {card.evidence.length > 0 ? (
                                  card.evidence.map((evidence) => (
                                    <div
                                      key={`${card.id}-${evidence.label}`}
                                      className="flex items-center justify-between border-b border-[var(--border)]/50 py-2.5 last:border-0"
                                    >
                                      <span className="text-[13px] font-semibold text-[var(--secondary-foreground)]">
                                        {evidence.label}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[14px] font-black tabular-nums text-primary">
                                          {evidence.value}
                                        </span>
                                        {evidence.source_question_id && (
                                          <button
                                            type="button"
                                            title="원본 데이터 보기"
                                            onClick={() => void openSourceDrawer(evidence.source_question_id!)}
                                            className="flex h-5 w-5 items-center justify-center rounded-md border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] text-primary opacity-60 transition-opacity hover:opacity-100"
                                          >
                                            <Database size={10} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-[13px] font-semibold text-[var(--muted-foreground)]">
                                    근거 데이터가 없습니다
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col gap-4 bg-[var(--primary-light-bg)]/20 p-8">
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                                전략적 권장 액션
                              </p>
                              <p className="flex-1 text-[14px] font-bold leading-[1.75] text-foreground">
                                {card.action}
                              </p>
                              <div className="flex items-center gap-2 text-[12px] font-black text-primary">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                                즉시 실행 권장
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--panel-soft)]/30 px-8 py-10 text-center text-[14px] font-bold text-[var(--muted-foreground)]">
                      리포트 인사이트 데이터가 없습니다
                    </div>
                  )}
                </div>
              </section>

              <section id="detail" ref={sectionRefs.detail} className="app-card p-12">
                <SectionHeader num="03" title="데이터 기반 심층 분석" badge="Quantitative Evidence" />
                <div className="grid grid-cols-2 gap-8">
                  <div className="app-soft space-y-8 border-[var(--border)] bg-[var(--panel-soft)] p-8">
                    <div className="flex items-center justify-between">
                      <h4 className="flex items-center gap-3 text-[15px] font-black text-foreground">
                        <TrendingUp size={18} className="text-primary" />
                        연령대별 분석 대상 규모
                      </h4>
                    </div>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ageOpportunityData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: 800 }}
                          />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                          <Tooltip contentStyle={{ borderRadius: 16, border: "none", boxShadow: "var(--shadow-lg)" }} />
                          <Bar dataKey="value" fill="var(--chart-1)" radius={[6, 6, 0, 0]} barSize={32} />
                          <Bar dataKey="benchmark" fill="var(--border)" radius={[6, 6, 0, 0]} barSize={32} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="relative flex flex-col justify-center overflow-hidden border-none bg-primary p-10 text-white shadow-[var(--shadow-lg)]">
                    <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative z-10">
                      <p className="mb-6 text-[11px] font-black uppercase tracking-[0.3em] text-white/80 opacity-60">
                        Opportunity Matrix
                      </p>
                      <h4 className="mb-6 text-[24px] font-black leading-tight">
                        {reportDominantQuestion?.question_id ?? dominantQuestion?.questionId ?? "Q-00"} 기준
                        <br />
                        최우세 응답{" "}
                        {Math.max(
                          ...(reportDominantQuestion?.distribution ?? dominantQuestion?.distribution ?? []).map(
                            (item) => item.value
                          ),
                          0
                        )}
                        %
                      </h4>
                      <p className="mb-8 text-[14px] font-medium italic leading-relaxed text-white/80">
                        {reportDominantQuestion?.question_text ??
                          dominantQuestion?.questionText ??
                          "분석 가능한 문항 데이터가 아직 없습니다."}
                      </p>
                      <button className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-[13px] font-black text-white transition-all hover:bg-white/20">
                        세부 시뮬레이션 결과 보기 <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section id="segment" ref={sectionRefs.segment} className="app-card p-12">
                <SectionHeader num="04" title="세그먼트 그룹별 분석 및 권장 액션" badge="Segmented Action Strategy" />

                <div className="grid grid-cols-1 gap-6">
                  {segmentCards.length > 0 ? (
                    segmentCards.map((item) => (
                      <div
                        key={item.segment}
                        className="group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-card transition-all hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-md)]"
                      >
                        <div className="flex flex-col md:flex-row">
                          <div className="w-full border-r border-[var(--border)] bg-[var(--panel-soft)] p-8 md:w-72">
                            <div className="mb-4 flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                                Live Segment
                              </span>
                            </div>
                            <h5 className="mb-2 text-[20px] font-bold text-foreground">{item.segment}</h5>
                            <p className="text-[16px] font-bold text-primary">{formatPercent(item.share)} 비중</p>
                          </div>

                          <div className="grid flex-1 grid-cols-1 gap-8 p-8 lg:grid-cols-2">
                            <div>
                              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--subtle-foreground)]">
                                핵심 응답 데이터 분석
                              </p>
                              <p className="text-[14px] font-semibold leading-relaxed text-[var(--secondary-foreground)]">
                                {`${item.count.toLocaleString()}명의 페르소나가 이 세그먼트에 속하며, 주 구매 채널은 ${item.buyChannel}, 주요 제품군은 ${item.productGroup}, 대표 지역은 ${item.region}입니다.`}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-[var(--primary-light-border)]/50 bg-[var(--primary-light-bg)]/30 p-6">
                              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
                                전략적 권장 액션
                              </p>
                              <p className="text-[14px] font-bold leading-relaxed text-foreground">
                                {`${item.segment} 세그먼트에는 ${item.buyChannel} 중심 유입 경로와 ${item.productGroup} 메시지를 결합한 지역 맞춤형 캠페인을 우선 배치합니다.`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--panel-soft)]/30 px-8 py-10 text-center text-[14px] font-bold text-[var(--muted-foreground)]">
                      세그먼트 데이터가 없습니다
                    </div>
                  )}
                </div>
              </section>

              <section id="actionPlan" ref={sectionRefs.actionPlan} className="app-card p-12 overflow-hidden relative">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-2xl" />
                <SectionHeader num="05" title="마케팅 액션 플랜 (90일)" badge="90-Day Execution Roadmap" />

                {!actionPlan && !actionPlanLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-[var(--panel-soft)]/30 rounded-3xl border border-dashed border-[var(--border)]">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-[var(--border)] flex items-center justify-center mb-5 shadow-sm text-primary">
                      <Zap size={28} />
                    </div>
                    <h3 className="text-[16px] font-bold text-foreground">실행 가능한 마케팅 플랜이 필요하신가요?</h3>
                    <p className="text-[13px] text-[var(--muted-foreground)] font-medium mt-2 max-w-xs leading-relaxed">
                      분석 리포트 결과를 바탕으로 AI가 구체적인 90일 실행 계획과 예산 배분안을 수립합니다
                    </p>
                    <button
                      onClick={handleGenerateActionPlan}
                      className="mt-6 flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-hover transition-all shadow-md active:scale-95 text-[14px]"
                    >
                      <Zap size={16} />
                      마케팅 액션 플랜 생성
                    </button>
                  </div>
                ) : actionPlanLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="relative mb-6">
                      <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Zap size={20} className="text-primary animate-pulse" />
                      </div>
                    </div>
                    <p className="text-[15px] font-bold text-foreground">최적의 마케팅 믹스를 계산 중입니다..</p>
                    <p className="text-[12px] text-[var(--muted-foreground)] mt-2">
                      리포트의 핵심 인사이트를 실행 과제로 전환하고 있습니다
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
                      <div className="space-y-6">
                        <h4 className="flex items-center gap-2 text-[14px] font-black uppercase tracking-widest text-foreground">
                          <Activity size={16} className="text-primary" />
                          Phased Execution Roadmap
                        </h4>
                        <div className="overflow-hidden rounded-2xl border border-[var(--border)] shadow-sm">
                          <table className="w-full text-left text-[13px] border-collapse">
                            <thead>
                              <tr className="bg-[var(--panel-soft)] border-b border-[var(--border)]">
                                <th className="px-6 py-4 font-black text-[var(--subtle-foreground)] uppercase tracking-wider">
                                  Period
                                </th>
                                <th className="px-6 py-4 font-black text-[var(--subtle-foreground)] uppercase tracking-wider">
                                  Core Action
                                </th>
                                <th className="px-6 py-4 font-black text-[var(--subtle-foreground)] uppercase tracking-wider">
                                  Main Channel
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)] bg-card">
                              {actionPlan?.phases.map((phase, i) => (
                                <tr key={i} className="hover:bg-[var(--surface-hover)] transition-colors">
                                  <td className="px-6 py-4 font-black text-primary whitespace-nowrap">{phase.week}</td>
                                  <td className="px-6 py-4 font-bold text-[var(--secondary-foreground)] leading-relaxed">
                                    {phase.action}
                                  </td>
                                  <td className="px-6 py-4 font-semibold text-[var(--muted-foreground)]">
                                    {phase.channel}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="app-card border-primary/10 bg-primary/[0.02] p-6 shadow-sm">
                          <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-primary mb-4">
                            <Target size={14} />
                            Priority Segments
                          </h4>
                          <div className="space-y-3">
                            {actionPlan?.priority_segments.map((seg, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 bg-white border border-[var(--border)] rounded-xl px-4 py-3 shadow-sm"
                              >
                                <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[11px] font-black">
                                  {i + 1}
                                </div>
                                <span className="text-[13px] font-bold text-foreground">{seg}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="app-card border-[var(--border)] bg-[linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.98))] p-6 shadow-sm">
                          <h4 className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[var(--secondary-foreground)]">
                            <Target size={14} />
                            Budget Allocation
                          </h4>
                          <div className="rounded-2xl border border-[var(--primary-light-border)] bg-white px-4 py-4 shadow-[var(--shadow-sm)]">
                            {budgetAllocationItems.length > 0 ? (
                              <div className="space-y-3">
                                {budgetAllocationItems.map((item, index) => (
                                  <div key={item.label} className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-3">
                                      <span className="text-[13px] font-bold text-foreground">{item.label}</span>
                                      <span className="text-[12px] font-black tabular-nums text-primary">
                                        {item.percent}%
                                      </span>
                                    </div>
                                    <div className="h-2.5 overflow-hidden rounded-full bg-[var(--panel-soft)]">
                                      <div
                                        className={
                                          index === 0
                                            ? "h-full rounded-full bg-primary"
                                            : index === 1
                                              ? "h-full rounded-full bg-[rgba(47,102,255,0.68)]"
                                              : "h-full rounded-full bg-[rgba(47,102,255,0.4)]"
                                        }
                                        style={{ width: `${item.percent}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[14px] font-bold leading-relaxed text-foreground">
                                {actionPlan?.budget_allocation}
                              </p>
                            )}
                          </div>
                          <div className="mt-4 flex items-center gap-2 border-t border-[var(--border)] pt-4 text-[11px] font-bold text-[var(--muted-foreground)]">
                            <ShieldCheck size={12} className="text-primary" />
                            Recommended based on ROI data
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* 원본 데이터 드로어 */}
      {sourceDrawer.open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSourceDrawer((prev) => ({ ...prev, open: false }))}
          />
          <div className="relative z-10 flex h-full w-[520px] flex-col overflow-hidden bg-card shadow-2xl">
            {/* 헤더 */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--primary-light-bg)] text-primary">
                  <Database size={14} />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                    데이터 출처
                  </p>
                  <p className="text-[14px] font-black text-foreground">
                    {sourceDrawer.stat?.question_text ?? sourceDrawer.questionId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSourceDrawer((prev) => ({ ...prev, open: false }))}
                className="rounded-lg p-1.5 hover:bg-[var(--panel-soft)] text-[var(--muted-foreground)]"
              >
                <X size={16} />
              </button>
            </div>

            {/* 문항 통계 요약 */}
            {sourceDrawer.stat && (
              <div className="border-b border-[var(--border)] bg-[var(--panel-soft)]/50 px-6 py-4 space-y-3">
                <div className="flex flex-wrap gap-2 text-[11px] font-black">
                  <span className="rounded-lg border border-[var(--border)] bg-card px-2.5 py-1 text-[var(--secondary-foreground)]">
                    {sourceDrawer.stat.question_type}
                  </span>
                  <span className="rounded-lg border border-[var(--border)] bg-card px-2.5 py-1 text-[var(--secondary-foreground)]">
                    응답 {sourceDrawer.stat.response_count.toLocaleString()}건
                  </span>
                  {sourceDrawer.stat.mean !== undefined && (
                    <span className="rounded-lg border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] px-2.5 py-1 text-primary">
                      평균 {sourceDrawer.stat.mean}점 / {sourceDrawer.stat.max_score}점 · σ {sourceDrawer.stat.std_dev}
                    </span>
                  )}
                </div>
                {/* 분포 바 */}
                <div className="space-y-1.5">
                  {sourceDrawer.stat.distribution.slice(0, 5).map((d) => (
                    <div key={d.label} className="flex items-center gap-2">
                      <span className="w-28 shrink-0 truncate text-[11px] font-semibold text-[var(--secondary-foreground)]">
                        {d.label}
                      </span>
                      <div className="flex-1 rounded-full bg-[var(--border)] h-2 overflow-hidden">
                        <div className="h-full rounded-full bg-primary/70" style={{ width: `${d.value}%` }} />
                      </div>
                      <span className="w-12 text-right text-[11px] font-black tabular-nums text-primary">
                        {d.value}%
                        {d.count ? (
                          <span className="text-[var(--muted-foreground)] font-semibold"> ({d.count})</span>
                        ) : null}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 원본 응답 목록 */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                원본 응답 ({sourceDrawer.total.toLocaleString()}건)
              </p>
              {sourceDrawer.loading ? (
                <div className="flex items-center justify-center py-10 text-[var(--muted-foreground)] text-[13px]">
                  불러오는 중..
                </div>
              ) : sourceDrawer.responses.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-[var(--muted-foreground)] text-[13px]">
                  응답 데이터가 없습니다
                </div>
              ) : (
                <>
                  {sourceDrawer.responses.map((resp) => (
                    <div
                      key={resp.id}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)]/40 p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-black text-foreground">{resp.persona_name}</span>
                          <span className="text-[10px] font-semibold text-[var(--muted-foreground)] border border-[var(--border)] rounded-md px-1.5 py-0.5">
                            {resp.segment}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            resp.consistency_status === "Good"
                              ? "bg-green-50 text-green-600 border border-green-200"
                              : resp.consistency_status === "Warn"
                                ? "bg-amber-50 text-amber-600 border border-amber-200"
                                : "bg-red-50 text-red-600 border border-red-200"
                          }`}
                        >
                          {resp.integrity_score.toFixed(0)}
                        </span>
                      </div>
                      <p className="text-[12px] font-black text-primary">{resp.selected_option}</p>
                      <p className="text-[12px] font-semibold leading-relaxed text-[var(--secondary-foreground)]">
                        {resp.rationale}
                      </p>
                    </div>
                  ))}
                  {sourceDrawer.responses.length < sourceDrawer.total && (
                    <button
                      type="button"
                      onClick={() => void loadMoreResponses()}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] py-2.5 text-[12px] font-black text-[var(--secondary-foreground)] hover:bg-[var(--panel-soft)] transition-colors"
                    >
                      더 보기 <ChevronRight size={12} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};
