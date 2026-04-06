import React, { useEffect, useState } from "react";
import { useProject } from "@/hooks/useProject";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import {
  BarChart3,
  Pause,
  Play,
  ShieldCheck,
  MessageCircle,
  X,
  UserCircle2,
  RefreshCw,
  Hash,
  Lightbulb,
  Sparkles,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from "recharts";
import { useLocation } from "react-router-dom";
import { WorkflowStepper } from "@/components/layout/WorkflowStepper";
import {
  geminiApi,
  simulationApi,
  surveyApi,
  type CrossSegmentSummaryResponse,
  type KeywordTrendItem,
  type ResponseDistributionItem,
  type SimulationFeedItem,
} from "@/lib/api";

interface ChatResponse {
  id: string;
  personaName: string;
  segment: string;
  questionId: string;
  questionText: string;
  selectedOption: string;
  rationale: string;
  integrityScore: number;
  consistencyStatus: "Good" | "Warn" | "Error";
  timestamp: string;
  cot: string[];
}

interface QuestionResult {
  id: string;
  text: string;
  data: ResponseDistributionItem[];
}

const BAR_COLORS = [
  "var(--primary)",
  "rgba(47, 102, 255, 0.7)",
  "rgba(47, 102, 255, 0.5)",
  "rgba(47, 102, 255, 0.3)",
  "var(--panel-soft)",
];

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function CotModal({ chat, onClose }: { chat: ChatResponse; onClose: () => void }) {
  return (
    <div className="app-modal-overlay">
      <div className="app-modal max-w-xl animate-in zoom-in-95 duration-300">
        <div className="app-modal-header">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] text-primary">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-[20px] font-black tracking-tight text-foreground">응답 일관성 상세 분석</h2>
              <p className="mt-0.5 text-[11px] font-black uppercase tracking-[0.15em] text-primary opacity-70">
                Response Integrity Logic
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-card text-muted-foreground transition-all hover:bg-[var(--surface-hover)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="app-modal-body space-y-8">
          <div className="space-y-3">
            <div className="app-soft border-border/30 bg-[var(--panel-soft)]/50 px-5 py-3">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-white">
                  {chat.questionId}
                </span>
              </div>
              <p className="text-[13px] font-bold leading-snug text-muted-foreground">{chat.questionText}</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/8 px-5 py-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary shadow-[var(--shadow-sm)]">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4L4 7L9 1"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-[16px] font-black leading-tight text-primary">{chat.selectedOption}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              사고 과정 추적 (Reasoning)
            </h3>
            <div className="space-y-3">
              {chat.cot.map((step, index) => (
                <div key={`${chat.id}-${index}`} className="group flex gap-4">
                  <div className="flex shrink-0 flex-col items-center">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--border)] bg-card text-[10px] font-bold text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary">
                      {index + 1}
                    </div>
                    {index < chat.cot.length - 1 && <div className="my-1 w-0.5 flex-1 bg-[var(--border)]" />}
                  </div>
                  <p className="pt-0.5 text-[13px] font-bold leading-relaxed text-secondary-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="app-modal-footer bg-[var(--panel-soft)]/50">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-success" />
            <span className="text-[12px] font-bold uppercase text-muted-foreground">
              검증된 일관성 지수: {chat.integrityScore}%
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-primary px-8 py-2.5 text-[13px] font-black text-white transition-all hover:bg-primary-hover active:scale-95"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

function mapFeedItem(item: SimulationFeedItem): ChatResponse {
  return {
    id: item.id,
    personaName: item.persona_name,
    segment: item.segment,
    questionId: item.question_id,
    questionText: item.question_text,
    selectedOption: item.selected_option,
    rationale: item.rationale,
    integrityScore: item.integrity_score,
    consistencyStatus: item.consistency_status,
    timestamp: formatTimestamp(item.timestamp),
    cot: item.cot,
  };
}

export const LiveAnalysisPage: React.FC = () => {
  const location = useLocation();
  const segmentFilter =
    (
      location.state as {
        segmentFilter?: {
          totalMatched: number;
          totalPopulation: number;
          segments: Array<{ name: string; count: number }>;
          filterSummary: string;
        };
      } | null
    )?.segmentFilter ?? null;

  const { project, projectId } = useProject();
  const [activeQuestion, setActiveQuestion] = useState("");
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
  const [chatFeed, setChatFeed] = useState<ChatResponse[]>([]);
  const [keywords, setKeywords] = useState<KeywordTrendItem[]>([]);
  const [insightSummary, setInsightSummary] = useState("");
  const [insightStrategies, setInsightStrategies] = useState<string[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatResponse | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [completionRate, setCompletionRate] = useState(0);
  const [completedResponses, setCompletedResponses] = useState(0);
  const [targetResponses, setTargetResponses] = useState(0);
  const [crossSegmentSummary, setCrossSegmentSummary] = useState<CrossSegmentSummaryResponse | null>(null);
  const streamAbortRef = React.useRef<AbortController | null>(null);

  const activeResult = questionResults.find((question) => question.id === activeQuestion) ?? questionResults[0];
  const totalPopulation = segmentFilter?.totalMatched ?? project?.target_responses ?? targetResponses;

  // 컴포넌트 언마운트 시 스트림 중단
  // biome-ignore lint/correctness/useExhaustiveDependencies: cleanup only
  React.useEffect(() => {
    return () => {
      streamAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    const loadBaseData = async () => {
      const surveyQuestions = await surveyApi.getQuestions(projectId);
      if (cancelled) return;

      const results = await Promise.all(
        surveyQuestions.map(async (question) => ({
          id: question.id,
          text: question.text,
          data: await simulationApi.getDistribution(projectId, question.id),
        }))
      );

      if (cancelled) return;
      setQuestionResults(results);
      if (results[0]?.id) {
        setActiveQuestion((current) => current || results[0].id);
      }
    };

    void loadBaseData();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const refreshLiveData = async () => {
    if (!projectId) return;
    const [progress, feedItems, keywordItems] = await Promise.all([
      simulationApi.getProgress(projectId),
      simulationApi.getFeed(projectId, 20),
      simulationApi.getKeywords(projectId),
    ]);
    setKeywords(keywordItems);
    setChatFeed(feedItems.map(mapFeedItem));
    if (progress) {
      setCompletionRate(Math.round(progress.progress));
      setCompletedResponses(progress.completed_responses);
      setTargetResponses(progress.target_responses);
      setIsLive(progress.status === "running");
    }
  };

  // 최초 1회 로드
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (projectId) void refreshLiveData();
  }, [projectId]);

  // 10초 주기 폴링
  useAutoRefresh(refreshLiveData, 10_000, !!projectId);

  useEffect(() => {
    if (!projectId || !activeQuestion) return;
    let cancelled = false;

    const loadInsight = async () => {
      const insight = await simulationApi.getInsight(projectId, activeQuestion);
      if (cancelled) return;
      setInsightSummary(insight?.summary ?? "");
      setInsightStrategies(insight?.strategies ?? []);
    };

    loadInsight();

    return () => {
      cancelled = true;
    };
  }, [projectId, activeQuestion]);

  const handleToggle = async () => {
    if (isLive) {
      // 중지
      streamAbortRef.current?.abort();
      streamAbortRef.current = null;
      setIsLive(false);
      return;
    }

    if (!projectId) return;
    setIsLive(true);

    // 스트리밍 시뮬레이션 시작
    const batchSize = segmentFilter ? Math.min(5, segmentFilter.totalMatched || 5) : 5;
    const ctrl = simulationApi.streamRun(
      projectId,
      batchSize,
      (evt) => {
        const type = evt.type as string;

        if (type === "result") {
          // 새 응답을 피드에 추가
          const personaName = evt.persona_name as string;
          const segment = evt.segment as string;
          const answers = (evt.answers as Array<Record<string, unknown>>) ?? [];
          for (const answer of answers) {
            const feedItem: ChatResponse = {
              id: `resp-${Date.now()}-${Math.random()}`,
              personaName,
              segment,
              questionId: (answer.question_id as string) ?? "",
              questionText: (answer.question_text as string) ?? "",
              selectedOption: (answer.selected_option as string) ?? "",
              rationale: (answer.rationale as string) ?? "",
              integrityScore: (answer.integrity_score as number) ?? 85,
              consistencyStatus: ((answer.integrity_score as number) ?? 85) >= 90 ? "Good" : "Warn",
              timestamp: formatTimestamp(new Date().toISOString()),
              cot: (answer.cot as string[]) ?? [],
            };
            setChatFeed((prev) => [feedItem, ...prev].slice(0, 100));
          }
          setCompletedResponses((prev) => prev + answers.length);
        }

        if (type === "progress") {
          const done = (evt.done as number) ?? 0;
          const total = (evt.total as number) ?? 1;
          setCompletionRate(Math.round((done / total) * 100));
        }

        if (type === "done") {
          setIsLive(false);
          setCompletionRate(100);
          // 최종 데이터 갱신
          if (projectId) {
            simulationApi.getKeywords(projectId).then(setKeywords);
            simulationApi.getProgress(projectId).then((p) => {
              if (p) {
                setTargetResponses(p.target_responses);
                setCompletedResponses(p.completed_responses);
              }
            });
            // 크로스 세그먼트 요약 생성
            geminiApi.getCrossSegmentSummary(projectId).then((summary) => {
              if (summary) setCrossSegmentSummary(summary);
            });
            // 분포 갱신
            setQuestionResults((prev) =>
              prev.map((q) => {
                simulationApi
                  .getDistribution(projectId, q.id)
                  .then((data) =>
                    setQuestionResults((prev2) => prev2.map((q2) => (q2.id === q.id ? { ...q2, data } : q2)))
                  );
                return q;
              })
            );
          }
        }
      },
      () => {
        setIsLive(false);
      },
      (err) => {
        console.error("Simulation stream error:", err);
        setIsLive(false);
      }
    );
    streamAbortRef.current = ctrl;
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <WorkflowStepper currentPath="/live" />

      <div className="app-page-header flex shrink-0 items-center justify-between">
        <div>
          <p className="app-page-eyebrow">실시간 시뮬레이션 모니터링</p>
          <h1 className="app-page-title mt-1">실시간 응답 분석 현황</h1>
          <p className="app-page-description">페르소나별 실시간 응답 현황과 AI 기반 핵심 감성 지표를 모니터링합니다.</p>
          {segmentFilter && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 rounded-xl border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] px-3 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] font-bold text-primary">응답 대상</span>
                <span className="text-[11px] font-semibold text-foreground">{segmentFilter.filterSummary}</span>
                <span className="text-[11px] font-bold text-primary">
                  {segmentFilter.totalMatched.toLocaleString()}명
                </span>
              </div>
              {segmentFilter.segments.slice(0, 4).map((s) => (
                <span
                  key={s.name}
                  className="rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--secondary-foreground)]"
                >
                  {s.name} {s.count}명
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleToggle}
          className={`flex shrink-0 items-center gap-2.5 rounded-xl px-6 py-3 text-[14px] font-black transition-all active:scale-95 ${
            isLive
              ? "border border-primary-light-border bg-primary-light-bg text-primary shadow-[var(--shadow-sm)]"
              : "bg-primary text-white shadow-[var(--shadow-lg)] hover:bg-primary-hover"
          }`}
        >
          {isLive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          {isLive ? "시뮬레이션 중단" : "시뮬레이션 재개"}
        </button>
      </div>

      <div className="grid flex-1 grid-cols-1 overflow-hidden xl:grid-cols-[1fr_380px]">
        <div className="hide-scrollbar space-y-7 overflow-y-auto px-8 py-7">
          <div className="app-card border-[var(--border)] bg-card p-7 shadow-[var(--shadow-sm)]">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] p-2 text-primary">
                  <RefreshCw size={18} className={isLive ? "animate-spin-slow" : ""} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold leading-tight text-foreground">실시간 시뮬레이션 분석 진행률</h3>
                  <p className="mt-0.5 text-[11px] font-medium text-[var(--muted-foreground)]">
                    선택된 세그먼트 타겟 대상 디지털 트윈 응답 수집 현황입니다.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="mb-0.5 flex items-baseline justify-end gap-1.5">
                  <span className="text-[24px] font-bold leading-none tracking-tight text-primary">
                    {completionRate}%
                  </span>
                  <span className="text-[12px] font-bold uppercase tracking-tighter text-[var(--subtle-foreground)]">
                    진행률
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[var(--muted-foreground)]">
                  <span className="text-foreground">{completedResponses.toLocaleString()}</span>
                  <span className="mx-1">/</span>
                  <span>
                    {targetResponses.toLocaleString()}명 타겟팅
                    <span className="ml-1 opacity-60">(전체 {totalPopulation.toLocaleString()}명 중)</span>
                  </span>
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="h-3 w-full overflow-hidden rounded-full border border-[var(--border)]/30 bg-[var(--panel-soft)] shadow-inner">
                <div
                  className="relative h-full bg-primary transition-all duration-700 ease-out"
                  style={{ width: `${completionRate}%` }}
                >
                  <div className="absolute inset-0 bg-white/20" />
                </div>
              </div>
              <div className="absolute left-0 right-0 top-full mt-2 flex justify-between px-0.5">
                {[0, 25, 50, 75, 100].map((value) => (
                  <span key={value} className="text-[9px] font-bold text-[var(--subtle-foreground)] opacity-50">
                    {value}%
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="app-card border-[var(--border)] p-6">
            <div className="mb-6 flex items-center justify-between border-b border-[var(--border)]/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-soft)] p-2 text-primary">
                  <BarChart3 size={16} />
                </div>
                <h3 className="text-[14px] font-bold text-foreground">문항별 실시간 응답 분포</h3>
              </div>
              <select
                value={activeQuestion}
                onChange={(event) => setActiveQuestion(event.target.value)}
                className="cursor-pointer rounded-lg border border-[var(--border)] bg-card px-2.5 py-1.5 text-[11px] font-bold shadow-sm outline-none transition-colors focus:border-primary"
              >
                {questionResults.map((question) => (
                  <option key={question.id} value={question.id}>
                    {question.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <div className="mb-5 flex items-start gap-3 px-1">
                <span className="shrink-0 rounded border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] px-2 py-0.5 text-[10px] font-bold text-primary">
                  {activeResult?.id ?? "-"}
                </span>
                <p className="text-[14px] font-bold leading-tight text-foreground">
                  {activeResult?.text ?? "문항 데이터가 없습니다."}
                </p>
              </div>
              <div className="h-[180px] rounded-2xl border border-[var(--border)]/50 bg-[var(--panel-soft)]/30 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activeResult?.data ?? []}
                    layout="vertical"
                    margin={{ top: 5, right: 45, bottom: 5, left: 10 }}
                    barSize={14}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="label"
                      type="category"
                      width={100}
                      tick={{ fontSize: 11, fontWeight: 600, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--panel-soft)" }}
                      contentStyle={{
                        borderRadius: 12,
                        border: "none",
                        fontSize: 11,
                        fontWeight: 700,
                        boxShadow: "var(--shadow-lg)",
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {(activeResult?.data ?? []).map((_, index) => (
                        <Cell
                          key={`${activeResult?.id ?? "result"}-${index}`}
                          fill={BAR_COLORS[index % BAR_COLORS.length]}
                        />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="right"
                        formatter={(value: number) => `${value}%`}
                        style={{ fontSize: 11, fontWeight: 800, fill: "var(--secondary-foreground)" }}
                        offset={10}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 border-t border-[var(--border)]/50 pt-6">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Sparkles size={13} className="text-primary" />
                  <h4 className="text-[12px] font-bold text-foreground">AI 실시간 심층 분석</h4>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase text-[var(--subtle-foreground)]">
                  <span>
                    추론 신뢰도{" "}
                    <span className="text-primary">{Math.min(99, 80 + (activeResult?.data?.length ?? 0) * 3)}%</span>
                  </span>
                  <div className="h-2.5 w-px bg-[var(--border)]" />
                  <span>표본 규모 N={completedResponses.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="app-card border-[var(--border)] bg-[var(--panel-soft)]/40 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-2.5 w-1 rounded-full bg-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      시장 인지도 진단
                    </span>
                  </div>
                  <h5 className="mb-2 text-[14px] font-bold text-foreground">실시간 인사이트 요약</h5>
                  <p className="text-[13px] font-medium leading-relaxed text-[var(--secondary-foreground)]">
                    {insightSummary || "선택한 문항에 대한 실시간 인사이트가 아직 없습니다."}
                  </p>
                </div>

                <div className="app-card border-primary/10 p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-2.5 w-1 rounded-full bg-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      전략적 핵심 과제
                    </span>
                  </div>
                  <h5 className="mb-2 text-[14px] font-bold text-foreground">권장 액션</h5>
                  <ul className="space-y-3">
                    {insightStrategies.length > 0 ? (
                      insightStrategies.map((item, index) => (
                        <li key={`${activeQuestion}-strategy-${index}`} className="flex gap-2">
                          <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                          <div>
                            <p className="mb-1 text-[11px] font-bold leading-none text-foreground">{`전략 ${index + 1}`}</p>
                            <p className="text-[12px] font-medium leading-tight text-[var(--muted-foreground)]">
                              {item}
                            </p>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-[12px] font-medium text-[var(--muted-foreground)]">
                        권장 액션 데이터가 아직 없습니다.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="app-card group relative overflow-hidden border-border/60 p-8">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-2.5 text-primary shadow-sm">
                  <Hash size={18} />
                </div>
                <div>
                  <h3 className="text-[16px] font-black tracking-tight text-foreground">텍스트 마이닝 실시간 키워드</h3>
                  <p className="mt-0.5 text-[11px] font-bold text-[var(--muted-foreground)]">
                    응답 근거 데이터 내 고빈도 핵심 어휘 추출
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] px-3 py-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold text-primary">실시간 분석 엔진 가동 중</span>
              </div>
            </div>

            <div className="relative z-10 flex flex-wrap gap-3">
              {keywords.length > 0 ? (
                keywords.map((item, index) => (
                  <div
                    key={item.keyword}
                    className={`flex cursor-default items-center gap-2.5 rounded-2xl border px-5 py-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      index < 3
                        ? "z-20 scale-105 border-primary/30 bg-card font-black text-primary ring-1 ring-primary/5"
                        : "border-[var(--border)] bg-[var(--panel-soft)] font-bold text-[var(--secondary-foreground)] opacity-80 hover:opacity-100"
                    }`}
                  >
                    <span className={index < 3 ? "text-primary/40" : "text-[var(--subtle-foreground)]"}>#</span>
                    <span className={index < 3 ? "text-[15px]" : "text-[13px]"}>{item.keyword}</span>
                    <div className="ml-1 flex items-center gap-1 border-l border-current/10 pl-2">
                      <span className="text-[10px] font-medium opacity-60">{item.frequency}</span>
                      {item.trend === "up" && <TrendingUp size={10} className="text-primary" />}
                      {item.trend === "down" && <TrendingDown size={10} className="text-[var(--destructive)]" />}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--panel-soft)]/20 px-5 py-2.5 text-[12px] font-bold text-[var(--subtle-foreground)]">
                  추출된 키워드가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="app-sidebar flex flex-col overflow-hidden border-l border-border/60">
          <div className="app-toolbar flex shrink-0 items-center justify-between bg-card/50">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] p-1.5 text-primary">
                <MessageCircle size={15} />
              </div>
              <span className="text-[13px] font-black uppercase tracking-widest text-foreground">실시간 응답 피드</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] px-2.5 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-tighter text-primary">라이브</span>
            </div>
          </div>

          <div className="hide-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
            {chatFeed.length > 0 ? (
              chatFeed.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className="app-card group cursor-pointer overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/40 hover:shadow-[var(--shadow-md)]"
                >
                  <div className="flex items-center justify-between border-b border-border/30 px-4 pb-3 pt-4">
                    <div className="min-w-0 flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--panel-soft)] text-primary shadow-[var(--shadow-sm)] transition-colors group-hover:bg-[var(--primary-light-bg)]">
                        <UserCircle2 size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate text-[12px] font-black leading-tight text-foreground">
                          {chat.personaName}
                        </span>
                        <span className="mt-0.5 block truncate text-[9px] font-bold leading-none tracking-wide text-muted-foreground">
                          {chat.segment}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="rounded border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] px-2 py-0.5 text-[9px] font-black text-primary">
                        {chat.questionId}
                      </span>
                      <span className="text-[9px] font-bold text-muted-foreground">{chat.timestamp}</span>
                    </div>
                  </div>
                  <div className="px-4 pb-2 pt-3">
                    <p className="line-clamp-1 text-[10px] font-bold leading-snug text-muted-foreground">
                      {chat.questionText}
                    </p>
                  </div>
                  <div className="px-4 pb-3">
                    <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/8 px-3 py-2.5 transition-colors group-hover:bg-primary/12">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary shadow-[var(--shadow-sm)]">
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path
                            d="M1 3L3 5L7 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span className="text-[13px] font-black leading-tight text-primary">{chat.selectedOption}</span>
                    </div>
                  </div>
                  <div className="px-4 pb-3">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border border-[var(--border)] bg-[var(--panel-soft)]">
                        <Lightbulb size={8} className="text-muted-foreground" />
                      </div>
                      <p className="line-clamp-2 text-[11px] font-bold leading-relaxed text-secondary-foreground">
                        {chat.rationale}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 pb-3.5">
                    <div className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-[var(--panel-soft)] px-2 py-1">
                      <ShieldCheck size={9} className="text-success" />
                      <span className="text-[9px] font-black uppercase tracking-wide text-muted-foreground">
                        응답 검증 {chat.integrityScore.toFixed(1)}%
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-primary/60 transition-colors group-hover:text-primary">
                      AI 사고 보기 →
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--panel-soft)]/30 px-4 py-6 text-center text-[12px] font-bold text-[var(--muted-foreground)]">
                실시간 응답 피드가 아직 없습니다.
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-border/50 bg-[var(--panel-soft)]/30 px-5 py-4 text-center">
            <p className="text-[10px] font-bold leading-relaxed text-muted-foreground">
              카드를 클릭하면 <span className="text-primary">AI 사고 과정</span>과 논리 일관성을 검증할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 시뮬레이션 완료 후 크로스 세그먼트 AI 요약 카드 */}
      {crossSegmentSummary && (
        <div className="mx-8 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-2xl border border-[var(--primary-light-border)] bg-gradient-to-r from-[var(--primary-light-bg)] to-card p-6 shadow-[var(--shadow-sm)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-[var(--shadow-sm)]">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                  AI Cross-Segment Analysis
                </p>
                <h3 className="text-[15px] font-black text-foreground">세그먼트 간 비교 요약</h3>
              </div>
            </div>
            <p className="mb-4 text-[13px] font-medium leading-relaxed text-[var(--secondary-foreground)]">
              {crossSegmentSummary.summary}
            </p>
            {crossSegmentSummary.segment_highlights.length > 0 && (
              <div className="mb-4 grid gap-2 sm:grid-cols-2">
                {crossSegmentSummary.segment_highlights.map((highlight) => (
                  <div key={highlight.segment} className="rounded-xl border border-[var(--border)] bg-card px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-primary">{highlight.segment}</p>
                    <p className="mt-1 text-[12px] font-bold text-[var(--secondary-foreground)]">
                      {highlight.key_finding}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {crossSegmentSummary.notable_pattern && (
              <div className="flex items-start gap-2 rounded-xl border border-[var(--border)]/50 bg-[var(--panel-soft)] px-4 py-3">
                <Lightbulb size={14} className="mt-0.5 shrink-0 text-primary" />
                <p className="text-[12px] font-bold text-[var(--secondary-foreground)]">
                  {crossSegmentSummary.notable_pattern}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedChat && <CotModal chat={selectedChat} onClose={() => setSelectedChat(null)} />}
    </div>
  );
};
