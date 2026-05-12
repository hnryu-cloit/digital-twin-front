import { useState } from "react";
import type { DynamicInsight, PersonaIndividualStory } from "@/lib/api";
import { PersonaIcon } from "@/components/persona/PersonaIcon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  UserCircle2,
  Target,
  Brain,
  History,
  BarChart2,
  MessageSquare,
  TrendingUp,
  Zap,
  Heart,
  AlertCircle,
  Star,
  Package,
  MousePointer2,
  ShieldCheck,
  Smartphone,
  Activity,
  Sparkles,
} from "lucide-react";

export interface PersonaModalData {
  id: string;
  projectId?: string;
  name: string;
  age: number;
  gender: string;
  occupation: string;
  device: string;
  segments: string[];
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

interface PersonaDetailModalProps {
  persona: PersonaModalData;
  onClose: () => void;
}

export function PersonaDetailModal({ persona, onClose }: PersonaDetailModalProps) {
  const [detailTab, setDetailTab] = useState<"summary" | "activity" | "campaign">("summary");
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
      title: "군집 인사이트 검증",
      detail: `${persona.dynamicInsights[0]?.label ?? "핵심 특징"} 기준으로 메시지와 오퍼 가설 검증`,
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
                  { l: "대표 제품/서비스", v: persona.device || "분석 중", i: Smartphone },
                  { l: "수용 단계", v: adoptionStage, i: Activity },
                  ...(persona.dynamicInsights.length
                    ? persona.dynamicInsights.slice(0, 3).map((insight) => ({
                        l: insight.label,
                        v: insight.value || "데이터 없음",
                        i: AlertCircle,
                      }))
                    : [{ l: "동적 인사이트", v: "분석 중", i: AlertCircle }]),
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
                {[...persona.interests, ...persona.keywords].length ? (
                  [...persona.interests, ...persona.keywords].map((interest) => (
                    <span
                      key={interest}
                      className="rounded-lg border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] px-2.5 py-1 text-[10px] font-bold text-primary"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <span className="text-[12px] font-semibold text-[var(--muted-foreground)]">분석 중</span>
                )}
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
                    </div>
                  </div>
                  <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-5">
                    <h4 className="mb-4 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--secondary-foreground)]">
                      <Sparkles size={14} className="text-primary" /> 동적 군집 인사이트
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {persona.dynamicInsights.length ? (
                        persona.dynamicInsights.map((insight, index) => (
                          <div
                            key={`${insight.label}-${index}`}
                            className="rounded-xl border border-[var(--border)] bg-card p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-[12px] font-bold text-foreground">{insight.label}</p>
                              {typeof insight.confidence === "number" ? (
                                <span className="rounded-md bg-[var(--primary-light-bg)] px-2 py-0.5 text-[10px] font-bold text-primary">
                                  {Math.round(insight.confidence * 100)}%
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-2 text-[13px] font-semibold leading-relaxed text-[var(--secondary-foreground)]">
                              {insight.value || "데이터 없음"}
                            </p>
                            {insight.evidence ? (
                              <p className="mt-2 text-[11px] font-medium leading-relaxed text-[var(--muted-foreground)]">
                                {insight.evidence}
                              </p>
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 rounded-xl border border-[var(--border)] bg-card p-4 text-[12px] font-semibold text-[var(--muted-foreground)]">
                          이 분석 실행에서 산출된 동적 인사이트가 아직 없습니다.
                        </div>
                      )}
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
                    { l: "주의 포인트", v: persona.dynamicInsights[0]?.label ?? "분석 중" },
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
    </div>
  );
}
