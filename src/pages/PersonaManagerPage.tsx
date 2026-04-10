import type React from "react";
import { useState, useEffect } from "react";
import {
  aiJobApi,
  personaApi,
  projectApi,
  type AIJob,
  type Persona as ApiPersona,
  type PersonaDetail as ApiPersonaDetail,
  type PersonaIndividualStory,
  type ProjectDetail,
  type ProjectOption,
} from "@/lib/api";
import { AppPagination } from "@/components/ui/AppPagination";
import { AiLoadingModal } from "@/components/ui/ai-loading-modal";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Smartphone,
  X,
  UserCircle2,
  Gamepad2,
  Coffee,
  Briefcase,
  Music,
  LayoutGrid,
  List,
  Brain,
  Heart,
  Zap,
  ShieldCheck,
  Activity,
  Target,
  AlertCircle,
  TrendingUp,
  History,
  MessageSquare,
  BarChart2,
  Star,
  CreditCard,
  MousePointer2,
  ChevronRight,
  Cpu,
  Package,
} from "lucide-react";

/* ─── Types ─── */
type Gender = "남성" | "여성";
type Segment = string;
type TechLevel = "초보" | "중급" | "전문가";

interface Persona {
  id: string;
  projectId?: string;
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
  techLevel: TechLevel;
  monthlyTechSpend: string;
  interests: string[];
  competitorPerception: string;
  marketingAcceptance: number;
  futureValue: number;
  purchaseHistory: string[];
  individualStories: PersonaIndividualStory[];
  userLogs: string[];
  cotSteps: string[];
  brandAttitude: number;
}

const SEGMENT_COLORS: Record<Segment, { bg: string; text: string; border: string }> = {
  "MZ 얼리어답터": { bg: "#eef3ff", text: "#2f66ff", border: "#c9d8ff" },
  "프리미엄 구매자": { bg: "#fff3e8", text: "#c76b00", border: "#ffd7a8" },
  "실용 중시 가족형": { bg: "#eefaf1", text: "#22804f", border: "#c4e8d0" },
  "게이밍 성향군": { bg: "#f6efff", text: "#7a44d1", border: "#dac8ff" },
  "비즈니스 프로": { bg: "#eef8f7", text: "#1c7f79", border: "#bee7e2" },
  "테크 얼리어답터": { bg: "#eef3ff", text: "#2f66ff", border: "#c9d8ff" },
  "실용주의 소비자": { bg: "#eefaf1", text: "#22804f", border: "#c4e8d0" },
  "가성비 추구형": { bg: "#fff8e8", text: "#b7791f", border: "#f2d59d" },
  "브랜드 충성고객": { bg: "#fff1f5", text: "#cc4b78", border: "#f3c2d4" },
  "신중한 비교구매자": { bg: "#f3f4f6", text: "#4b5563", border: "#d7dbe2" },
};

const DEFAULT_SEGMENT_COLOR = { bg: "#eef3ff", text: "#2f66ff", border: "#c9d8ff" };

const ICON_META = [
  { bg: "#eef3ff", color: "#2f66ff" },
  { bg: "#fff3e8", color: "#c76b00" },
  { bg: "#eefaf1", color: "#22804f" },
  { bg: "#f6efff", color: "#7a44d1" },
  { bg: "#eef8f7", color: "#1c7f79" },
];
const CARD_PAGE_SIZE = 9;
const LIST_PAGE_SIZE = 20;

/* ─── Helpers ─── */
function PersonaIcon({ iconKey, size = 20 }: { iconKey: number; size?: number }) {
  const icons = [
    <Gamepad2 size={size} />,
    <Coffee size={size} />,
    <Briefcase size={size} />,
    <Music size={size} />,
    <Smartphone size={size} />,
  ];
  return <span style={{ color: ICON_META[iconKey % 5].color }}>{icons[iconKey % 5]}</span>;
}

function CotModal({ persona, onClose }: { persona: Persona; onClose: () => void }) {
  return (
    <div className="app-modal-overlay z-[160]">
      <div className="app-modal max-w-3xl animate-in zoom-in-95 duration-300">
        <div className="app-modal-header">
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)]"
              style={{ backgroundColor: persona.iconBg, color: persona.color }}
            >
              <Brain size={22} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Chain Of Thought</p>
              <h2 className="mt-1 text-[20px] font-black tracking-tight text-foreground">{persona.name} CoT 전체보기</h2>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 text-[var(--subtle-foreground)] border-[var(--border)] hover:bg-[var(--surface-hover)] hover:text-foreground active:scale-95"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="app-modal-body space-y-4">
          {persona.cotSteps.length > 0 ? (
            persona.cotSteps.map((step, index) => (
              <div key={`${persona.id}-cot-${index}`} className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card text-[11px] font-black text-primary border border-[var(--border)]">
                  {index + 1}
                </div>
                <p className="pt-1 text-[13px] font-semibold leading-relaxed text-[var(--secondary-foreground)]">{step}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-5 text-[13px] font-medium text-[var(--muted-foreground)]">
              표시할 CoT 데이터가 없습니다.
            </div>
          )}
        </div>

        <div className="app-modal-footer bg-[var(--panel-soft)]">
          <p className="text-[12px] font-semibold text-[var(--muted-foreground)]">AI 추론 흐름 전체 단계</p>
          <Button onClick={onClose} className="px-8 text-[13px] font-bold active:scale-95">
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Detail Modal ─── */
function DetailModal({ persona, onClose }: { persona: Persona; onClose: () => void }) {
  const [detailTab, setDetailTab] = useState<"summary" | "activity" | "campaign">("summary");
  const [cotModalOpen, setCotModalOpen] = useState(false);
  const engagementScore = Math.round(
    persona.purchaseIntent * 0.35 + persona.marketingAcceptance * 0.3 + persona.brandAttitude * 0.35
  );
  const churnRisk = Math.max(
    5,
    Math.min(
      95,
      100 - Math.round(persona.brandAttitude * 0.4 + persona.marketingAcceptance * 0.25 + persona.purchaseIntent * 0.35)
    )
  );
  const dataConfidence = Math.round((engagementScore + persona.futureValue) / 2);

  const spendTier =
    persona.monthlyTechSpend.includes("50") || persona.monthlyTechSpend.includes("30")
      ? "high"
      : persona.monthlyTechSpend.includes("20") || persona.monthlyTechSpend.includes("10")
        ? "mid"
        : "low";
  const priceSensitivity = spendTier === "high" ? "낮음" : spendTier === "mid" ? "보통" : "높음";
  const adoptionStage =
    persona.purchaseIntent >= 85 ? "즉시 전환 가능" : persona.purchaseIntent >= 65 ? "관심 단계" : "관망 단계";
  const preferredChannel = persona.interests.some((v) => v.includes("유튜브") || v.includes("영상"))
    ? "영상 캠페인"
    : persona.interests.some((v) => v.includes("뉴스") || v.includes("경제"))
      ? "텍스트 브리핑"
      : "SNS 숏폼";

  const actionPlan = [
    {
      title: "개인화 메시지 집행",
      detail: `${preferredChannel} 채널에서 ${persona.keywords[0]} 중심 소재를 노출`,
      impact: `예상 반응률 +${Math.max(6, Math.round(persona.marketingAcceptance / 12))}%`,
    },
    {
      title: "가격/혜택 패키지 제안",
      detail: `가격 민감도 ${priceSensitivity} 기준으로 혜택 강도 차등 적용`,
      impact: `구매의향 개선 +${Math.max(4, Math.round(persona.purchaseIntent / 20))}%p`,
    },
    {
      title: "리텐션 후속 액션",
      detail: `최근 활동 로그 기반 ${persona.device} 관련 후속 콘텐츠 큐레이션`,
      impact: `이탈 위험 ${Math.max(3, Math.round(churnRisk / 8))}%p 완화`,
    },
  ];

  const insightText =
    persona.futureValue >= 85
      ? "즉시 전환 타겟으로 분류됩니다. 혜택보다 경험 중심 메시지의 효율이 높습니다."
      : persona.futureValue >= 70
        ? "중기 성장 타겟으로 분류됩니다. 기능 신뢰와 가격 납득을 함께 설계해야 합니다."
        : "장기 육성 타겟으로 분류됩니다. 강한 세일즈보다 브랜드 친숙도 축적이 우선입니다.";

  const urgencyTone = churnRisk >= 55 ? "주의" : churnRisk >= 35 ? "관찰" : "안정";
  const urgencyCls =
    churnRisk >= 55
      ? "bg-red-50/50 text-[var(--destructive)] border-red-200"
      : churnRisk >= 35
        ? "bg-amber-50/50 text-amber-600 border-amber-200"
        : "bg-emerald-50/50 text-emerald-600 border-emerald-200";

  return (
    <div className="app-modal-overlay">
      <div className="app-modal h-[86vh] max-w-6xl animate-in zoom-in-95 duration-300 shadow-[var(--shadow-[var(--shadow-lg)])]">
        {/* Modal Header */}
        <div className="app-modal-header border-b border-[var(--border)]">
          <div className="flex min-w-0 items-center gap-5">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "#eef3ff", color: persona.color }}
            >
              <PersonaIcon iconKey={persona.iconKey} size={30} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h2 className="truncate text-[22px] font-bold tracking-tight text-foreground">{persona.name}</h2>
                <Badge
                  variant="outline"
                  className="border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] text-primary tracking-wider uppercase"
                >
                  LV.{Math.floor(persona.futureValue / 10)}
                </Badge>
                <Badge variant="outline" className={`tracking-wider uppercase ${urgencyCls}`}>
                  {urgencyTone}
                </Badge>
              </div>
              <p className="mt-1 text-[12px] font-medium text-[var(--muted-foreground)]">
                {persona.age}세 · {persona.gender} · {persona.occupation}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 text-[var(--subtle-foreground)] border-[var(--border)] hover:bg-[var(--surface-hover)] hover:text-foreground active:scale-95"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="app-modal-body !p-0 grid grid-cols-12 overflow-hidden">
          {/* Left Side Panel */}
          <div className="hide-scrollbar col-span-4 space-y-5 overflow-y-auto border-r border-[var(--border)] bg-[var(--panel-soft)] p-6">
            <section
              className="app-card p-5 border-[var(--border)]"
              style={{ boxShadow: "var(--shadow-[var(--shadow-sm)])" }}
            >
              <h3 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--subtle-foreground)]">
                <UserCircle2 size={13} className="text-primary" /> Persona Snapshot
              </h3>
              <p className="mb-4 text-[13px] font-medium leading-relaxed text-foreground italic">
                "{persona.description}"
              </p>
              <div className="space-y-2">
                {[
                  { l: "IT 숙련도", v: persona.techLevel, i: Cpu },
                  { l: "기술 지출", v: persona.monthlyTechSpend, i: CreditCard },
                  { l: "주요 기기", v: persona.device, i: Smartphone },
                  { l: "가격 민감도", v: priceSensitivity, i: AlertCircle },
                  { l: "수용 단계", v: adoptionStage, i: Activity },
                ].map((item) => (
                  <div
                    key={item.l}
                    className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-card px-3.5 py-2.5 transition-colors hover:border-[var(--border-hover)]"
                  >
                    <div className="flex items-center gap-2">
                      <item.i size={13} className="text-[var(--subtle-foreground)]" />
                      <span className="text-[12px] text-[var(--muted-foreground)] font-semibold">{item.l}</span>
                    </div>
                    <span className="text-[12px] text-foreground font-bold">{item.v}</span>
                  </div>
                ))}
              </div>
            </section>

            <section
              className="rounded-2xl p-5 text-white shadow-[var(--shadow-[var(--shadow-md)])]"
              style={{ background: "var(--brand-strong)" }}
            >
              <h3 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/70">
                <Target size={13} /> 핵심 점수 지표
              </h3>
              <div className="space-y-4">
                {[
                  { label: "브랜드 선호", value: persona.brandAttitude },
                  { label: "마케팅 참여", value: engagementScore },
                  { label: "데이터 신뢰", value: dataConfidence },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-white/80">{row.label}</span>
                      <span className="text-[12px] font-bold">{row.value}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                      <div className="h-full rounded-full bg-card" style={{ width: `${row.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section
              className="app-card p-5 border-[var(--border)]"
              style={{ boxShadow: "var(--shadow-[var(--shadow-sm)])" }}
            >
              <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--subtle-foreground)]">
                관심사 및 키워드
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {[...persona.interests, ...persona.keywords].map((interest) => (
                  <span
                    key={interest}
                    className="rounded-lg border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] px-2.5 py-1 text-[10px] font-bold text-primary"
                  >
                    {interest}
                  </span>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <p className="text-[11px] font-semibold text-[var(--muted-foreground)]">
                  최적 캠페인 채널: <span className="text-primary font-bold">{preferredChannel}</span>
                </p>
              </div>
            </section>
          </div>

          {/* Right Main Content */}
          <div className="hide-scrollbar col-span-8 space-y-6 overflow-y-auto bg-card p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 bg-[var(--panel-soft)] p-1 rounded-xl border border-[var(--border)]">
                {[
                  { id: "summary", label: "요약 인사이트", icon: Brain },
                  { id: "activity", label: "행동 패턴 로그", icon: History },
                  { id: "campaign", label: "캠페인 전략", icon: BarChart2 },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id as "summary" | "activity" | "campaign")}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] font-bold transition-all ${
                      detailTab === tab.id
                        ? "bg-card text-primary shadow-[var(--shadow-[var(--shadow-sm)])] border border-[var(--border)]"
                        : "text-[var(--subtle-foreground)] hover:text-[var(--secondary-foreground)]"
                    }`}
                  >
                    <tab.icon size={14} />
                    {tab.label}
                  </button>
                ))}
              </div>
              <span className="rounded-md border border-[var(--border)] bg-[var(--panel-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--subtle-foreground)]">
                AI Analytics Engine
              </span>
            </div>

            {detailTab === "summary" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                <section className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "기대 미래 가치",
                      value: `${persona.futureValue}%`,
                      icon: TrendingUp,
                      color: "var(--primary)",
                    },
                    {
                      label: "마케팅 수용도",
                      value: `${persona.marketingAcceptance}%`,
                      icon: Zap,
                      color: "var(--success)",
                    },
                    {
                      label: "현재 구매 의향",
                      value: `${persona.purchaseIntent}%`,
                      icon: Heart,
                      color: "var(--primary)",
                    },
                    {
                      label: "Churn Risk",
                      value: `${churnRisk}%`,
                      icon: AlertCircle,
                      color: churnRisk > 50 ? "var(--destructive)" : "var(--warning)",
                    },
                  ].map((kpi) => (
                    <div
                      key={kpi.label}
                      className="bg-[var(--panel-soft)] border border-[var(--border)] p-5 rounded-2xl transition-all hover:border-[var(--border-hover)]"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <kpi.icon size={14} style={{ color: kpi.color }} />
                          <span className="text-[12px] font-bold text-[var(--secondary-foreground)]">{kpi.label}</span>
                        </div>
                        <span className="text-[20px] font-bold text-foreground">{kpi.value}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: kpi.value, backgroundColor: kpi.color }}
                        />
                      </div>
                    </div>
                  ))}
                </section>

                <section
                  className="app-card p-6 border-[var(--border)]"
                  style={{ boxShadow: "var(--shadow-[var(--shadow-sm)])" }}
                >
                  <h3 className="mb-5 flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--secondary-foreground)]">
                    <MessageSquare size={16} className="text-primary" /> 전략적 행동 제언
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-[var(--panel-soft)] p-5 rounded-2xl border border-[var(--border)]">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--subtle-foreground)]">
                        경쟁사 인식 현황
                      </p>
                      <p className="text-[13px] font-semibold leading-relaxed text-foreground">
                        "{persona.competitorPerception}"
                      </p>
                    </div>
                    <div className="bg-[var(--panel-soft)] p-5 rounded-2xl border border-[var(--border)]">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--subtle-foreground)]">
                        데이터 종합 진단
                      </p>
                      <p className="text-[13px] font-semibold leading-relaxed text-foreground">{insightText}</p>
                      <button
                        type="button"
                        onClick={() => setCotModalOpen(true)}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] px-3.5 py-2 text-[12px] font-bold text-primary transition-colors hover:bg-card"
                      >
                        CoT 전체보기
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                  {persona.individualStories.length > 0 && (
                    <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-5">
                      <h4 className="mb-4 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--secondary-foreground)]">
                        <MessageSquare size={14} className="text-primary" /> 개별 스토리 샘플
                      </h4>
                      <div className="space-y-3">
                        {persona.individualStories.map((story, index) => (
                          <div
                            key={`${story.name ?? "story"}-${index}`}
                            className="rounded-xl border border-[var(--border)] bg-card p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-[13px] font-bold text-foreground">
                                {story.name ?? `샘플 ${index + 1}`}
                              </p>
                              {story.job ? (
                                <span className="text-[11px] font-semibold text-[var(--muted-foreground)]">
                                  {story.job}
                                </span>
                              ) : null}
                            </div>
                            {story.personality ? (
                              <p className="mt-2 text-[12px] font-medium leading-relaxed text-[var(--secondary-foreground)]">
                                {story.personality}
                              </p>
                            ) : null}
                            {story.samsung_experience ? (
                              <p className="mt-2 text-[12px] font-semibold leading-relaxed text-primary">
                                {story.samsung_experience}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              </div>
            )}

            {detailTab === "activity" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 grid grid-cols-2 gap-6">
                <div className="app-card p-6 border-[var(--border)]">
                  <h3 className="mb-5 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--secondary-foreground)]">
                    <MessageSquare size={15} /> 개별 스토리
                  </h3>
                  <div className="space-y-3">
                    {persona.individualStories.length > 0 ? (
                      persona.individualStories.map((story, i) => (
                        <div
                          key={`${story.name ?? "story"}-${i}`}
                          className="bg-[var(--panel-soft)] border border-[var(--border)] p-4 rounded-xl"
                        >
                          <p className="text-[12px] font-bold text-foreground">{story.name ?? `샘플 ${i + 1}`}</p>
                          {story.job ? (
                            <p className="text-[11px] font-semibold text-[var(--muted-foreground)] mt-1">{story.job}</p>
                          ) : null}
                          {story.personality ? (
                            <p className="text-[12px] font-medium text-[var(--secondary-foreground)] mt-2 leading-relaxed">
                              {story.personality}
                            </p>
                          ) : null}
                          {story.samsung_experience ? (
                            <p className="text-[11px] font-semibold text-primary mt-2 leading-relaxed">
                              {story.samsung_experience}
                            </p>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <div className="bg-[var(--panel-soft)] border border-[var(--border)] p-4 rounded-xl text-[12px] font-medium text-[var(--muted-foreground)]">
                        개별 스토리 데이터가 아직 없습니다
                      </div>
                    )}
                  </div>
                </div>

                <div className="app-card p-6 border-[var(--border)]">
                  <h3 className="mb-5 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--secondary-foreground)]">
                    <Package size={15} /> 최근 구매/소유 이력
                  </h3>
                  <div className="space-y-4">
                    {persona.purchaseHistory.map((h, i) => (
                      <div key={h + i} className="flex items-center gap-3.5 group">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] text-[var(--subtle-foreground)] group-hover:bg-[var(--primary-light-bg)] group-hover:text-primary transition-colors">
                          <Package size={15} />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-foreground">{h}</p>
                          <p className="text-[11px] font-medium text-[var(--muted-foreground)]">Device Purchase</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="app-card p-6 border-[var(--border)]">
                  <h3 className="mb-5 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--secondary-foreground)]">
                    <MousePointer2 size={15} /> 실시간 디지털 활동 로그
                  </h3>
                  <div className="space-y-3">
                    {persona.userLogs.map((l, i) => (
                      <div
                        key={l + i}
                        className="bg-[var(--panel-soft)] border border-[var(--border)] p-4 rounded-xl flex gap-3 transition-all hover:border-[var(--border-hover)]"
                      >
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        <div>
                          <p className="text-[12px] font-bold text-foreground">{l}</p>
                          <p className="text-[11px] font-medium text-[var(--muted-foreground)]">
                            Activity Event Captured
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {detailTab === "campaign" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                <section className="app-card p-6 border-[var(--border)]">
                  <h3 className="mb-5 flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--secondary-foreground)]">
                    <Star size={16} className="text-primary" /> Next Best Actions (NBA)
                  </h3>
                  <div className="space-y-3">
                    {actionPlan.map((act, idx) => (
                      <div
                        key={act.title}
                        className="bg-[var(--panel-soft)] border border-[var(--border)] p-5 rounded-2xl hover:bg-[var(--surface-hover)] transition-all"
                      >
                        <div className="mb-1.5 flex items-center justify-between">
                          <p className="text-[14px] font-bold text-foreground">
                            {idx + 1}. {act.title}
                          </p>
                          <span className="text-[11px] font-bold text-primary bg-card px-2 py-1 rounded-md shadow-[var(--shadow-sm)] border border-[var(--primary-light-border)]">
                            {act.impact}
                          </span>
                        </div>
                        <p className="text-[13px] font-medium text-[var(--muted-foreground)]">{act.detail}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="grid grid-cols-3 gap-4">
                  {[
                    { l: "추천 채널", v: preferredChannel },
                    { l: "추천 메시지", v: `"${persona.keywords[0]} 경험"` },
                    { l: "주의 포인트", v: priceSensitivity === "높음" ? "가격 혜택 강조" : "브랜드 가치 중심" },
                  ].map((box) => (
                    <div
                      key={box.l}
                      className="bg-[var(--panel-soft)] border border-[var(--border)] p-4 rounded-xl text-center"
                    >
                      <p className="text-[10px] font-bold uppercase text-[var(--subtle-foreground)] mb-1">{box.l}</p>
                      <p className="text-[12px] font-bold text-[var(--secondary-foreground)]">{box.v}</p>
                    </div>
                  ))}
                </section>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="app-modal-footer border-t border-[var(--border)] bg-[var(--panel-soft)]">
          <p className="flex items-center gap-2 text-[12px] font-semibold text-[var(--muted-foreground)]">
            <ShieldCheck size={14} className="text-[var(--success)]" /> AI Simulation Profile Verified
          </p>
          <Button onClick={onClose} className="px-10 text-[13px] font-bold active:scale-95">
            프로필 닫기
          </Button>
        </div>
      </div>
      {cotModalOpen && <CotModal persona={persona} onClose={() => setCotModalOpen(false)} />}
    </div>
  );
}

const TECH_LEVEL_MAP: Record<string, TechLevel> = {
  "MZ 얼리어답터": "전문가",
  "게이밍 성향군": "전문가",
  "프리미엄 구매자": "중급",
  "비즈니스 프로": "중급",
  "실용 중시 가족형": "초보",
  "콘텐츠 크리에이터": "중급",
};
const SPEND_MAP: Record<string, string> = {
  "MZ 얼리어답터": "20-30만원",
  "게이밍 성향군": "50만원 이상",
  "프리미엄 구매자": "30-50만원",
  "비즈니스 프로": "30-50만원",
  "실용 중시 가족형": "10-20만원",
  "콘텐츠 크리에이터": "15-25만원",
};

function mapPersonaItems(items: Array<ApiPersona | ApiPersonaDetail>): Persona[] {
  return items.map((item, idx) => {
    const primarySegment = (item.segment || "MZ 얼리어답터") as Segment;
    const palette = SEGMENT_COLORS[primarySegment] ?? DEFAULT_SEGMENT_COLOR;
    const detailItem = item as Partial<ApiPersonaDetail>;
    const purchaseHistory = Array.isArray(detailItem.purchase_history)
      ? detailItem.purchase_history
      : [item.product_group || "Galaxy S24"];
    const interests = Array.isArray((detailItem as { interests?: string[] }).interests)
      ? ((detailItem as { interests?: string[] }).interests ?? [])
      : ["스마트폰", "테크"];
    const activityLogs = Array.isArray(detailItem.activity_logs) ? detailItem.activity_logs : ["앱 사용 기록 없음"];
    const cotSteps = Array.isArray(detailItem.cot) ? detailItem.cot : [];
    const individualStories = Array.isArray(detailItem.individual_stories) ? detailItem.individual_stories : [];
    const purchaseIntent = typeof detailItem.purchase_intent === "number" ? detailItem.purchase_intent : 70;
    const marketingAcceptance = typeof detailItem.marketing_acceptance === "number" ? detailItem.marketing_acceptance : 80;
    const brandAttitude = typeof detailItem.brand_attitude === "number" ? detailItem.brand_attitude : 80;
    const futureValue = typeof detailItem.score?.future_value === "number" ? detailItem.score.future_value : 85;

    return {
      id: item.id,
      projectId: item.project_id,
      name: item.name || "이름 없음",
      age: item.age || 0,
      gender: (item.gender === "남성" || item.gender === "여성" ? item.gender : "남성") as Gender,
      occupation: item.occupation || "직업 미상",
      device: purchaseHistory[0] || item.product_group || "Galaxy S24",
      segments: [primarySegment] as Segment[],
      keywords: item.keywords?.length ? item.keywords : ["성능", "디자인"],
      purchaseIntent,
      color: palette.text,
      iconBg: palette.bg,
      iconKey: idx % ICON_META.length,
      description: detailItem.profile || "디지털 트윈 페르소나입니다.",
      techLevel: (TECH_LEVEL_MAP[item.segment] ?? "중급") as TechLevel,
      monthlyTechSpend: SPEND_MAP[item.segment] ?? "20-30만원",
      interests: interests.length > 0 ? interests : ["스마트폰", "테크"],
      competitorPerception: cotSteps.join(", ") || "브랜드 경험 정보가 없습니다.",
      marketingAcceptance,
      futureValue,
      purchaseHistory,
      individualStories,
      userLogs: activityLogs.length > 0 ? activityLogs : ["앱 사용 기록 없음"],
      cotSteps,
      brandAttitude,
    };
  });
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
      const [response, projectDetail, options] = await Promise.all([
        personaApi.getPersonas(pid ?? undefined, 1, CARD_PAGE_SIZE, ""),
        pid ? projectApi.getProject(pid) : Promise.resolve(null),
        projectApi.getProjectOptions(),
      ]);
      setProjectOptions(options);
      setProject(projectDetail);
      setPersonas(mapPersonaItems(response.items));
      setTotal(response.total);
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
          description: detail.profile || current.description,
          purchaseHistory: detail.purchase_history?.length ? detail.purchase_history : current.purchaseHistory,
          individualStories: detail.individual_stories ?? current.individualStories,
          userLogs: detail.activity_logs?.length ? detail.activity_logs : current.userLogs,
          cotSteps: detail.cot?.length ? detail.cot : current.cotSteps,
          competitorPerception: detail.cot?.join(", ") || current.competitorPerception,
          purchaseIntent: detail.purchase_intent ?? current.purchaseIntent,
          marketingAcceptance: detail.marketing_acceptance ?? current.marketingAcceptance,
          brandAttitude: detail.brand_attitude ?? current.brandAttitude,
          futureValue: detail.score?.future_value ?? current.futureValue,
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
      n_personas: 7,
      overwrite_existing: true,
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
    <>
      <AiLoadingModal
        open={activeJob?.status === "queued" || activeJob?.status === "running"}
        title="페르소나 업데이트"
        steps={[
          "기존 프로젝트와 페르소나 데이터를 확인하고 있습니다…",
          "세그먼트 변화를 반영해 페르소나를 업데이트하고 있습니다…",
          "프로필과 행동 패턴을 다시 정리하고 있습니다…",
          "구매 성향과 반응 특성을 다시 계산하고 있습니다…",
          "업데이트 결과를 검토해 화면에 반영하고 있습니다…",
        ]}
      />
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

      {detailTarget && <DetailModal persona={detailTarget} onClose={() => setDetailTarget(undefined)} />}
      </div>
    </>
  );
};
