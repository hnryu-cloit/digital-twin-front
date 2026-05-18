import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
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
import { Activity, BarChart3, Layers, ShieldCheck, Target, Users, Zap } from "lucide-react";
import { reportApi, type ReportDetail } from "@/lib/api";

type ChartDatum = Record<string, string | number | boolean | null | undefined>;

function asChartData(value: unknown): ChartDatum[] {
  return Array.isArray(value)
    ? (value.filter((item) => typeof item === "object" && item !== null) as ChartDatum[])
    : [];
}

function findChart(report: ReportDetail | null, id: string): ChartDatum[] {
  const chart = report?.charts?.find((item) => item.id === id);
  return asChartData(chart?.data);
}

function sectionContent(report: ReportDetail | null, id: string): string {
  return report?.sections?.find((section) => section.id === id)?.content ?? "";
}

function sectionTitle(report: ReportDetail | null, id: string, fallback: string): string {
  return report?.sections?.find((section) => section.id === id)?.title ?? fallback;
}

function PrintSection({
  num,
  title,
  badge,
  children,
}: {
  num: string;
  title: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <section className="report-print-section app-card break-inside-avoid p-10">
      <div className="mb-8 flex items-center justify-between border-b border-[var(--border)] pb-5">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-[15px] font-black text-white shadow-[var(--shadow-sm)]">
            {num}
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">{badge}</p>
            <h2 className="mt-1 text-[24px] font-black tracking-tight text-foreground">{title}</h2>
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

export const ReportPrintPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reportId) return;
    let cancelled = false;
    const loadReport = async () => {
      setLoading(true);
      const detail = await reportApi.getReport(reportId);
      if (!cancelled) {
        setReport(detail);
        setLoading(false);
      }
    };
    void loadReport();
    return () => {
      cancelled = true;
    };
  }, [reportId]);

  useEffect(() => {
    if (loading) return;
    const timer = window.setTimeout(() => {
      document.body.dataset.pdfReady = "true";
      document.documentElement.dataset.pdfReady = "true";
    }, 800);
    return () => window.clearTimeout(timer);
  }, [loading, report]);

  const keywordRadar = useMemo(() => findChart(report, "keyword-radar"), [report]);
  const ageDistribution = useMemo(() => findChart(report, "age-distribution"), [report]);
  const questionDistribution = useMemo(() => findChart(report, "question-distribution"), [report]);
  const segmentCards = useMemo(() => findChart(report, "segment-cards"), [report]);
  const summary = sectionContent(report, "summary");
  const findings = report?.sections?.filter((section) => section.id === "findings") ?? [];
  const detailText = sectionContent(report, "detail");
  const segmentText = sectionContent(report, "segment");

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-10 text-foreground">
        <div className="app-card p-10 text-[14px] font-bold text-[var(--muted-foreground)]">
          리포트를 불러오는 중입니다.
        </div>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="min-h-screen bg-background p-10 text-foreground">
        <div className="app-card p-10 text-[14px] font-bold text-[var(--muted-foreground)]">
          리포트를 찾을 수 없습니다.
        </div>
      </main>
    );
  }

  return (
    <main className="report-print-root min-h-screen bg-background px-8 py-10 text-foreground">
      <div className="mx-auto max-w-[1120px] space-y-8">
        <header className="app-card overflow-hidden p-10">
          <p className="app-page-eyebrow">Insight Report</p>
          <div className="mt-2 flex items-end justify-between gap-8">
            <div>
              <h1 className="text-[34px] font-black leading-tight tracking-tight text-foreground">{report.title}</h1>
              <p className="mt-3 max-w-3xl text-[15px] font-semibold leading-relaxed text-[var(--muted-foreground)]">
                디지털 트윈 시뮬레이션 결과 기반 전략 분석 리포트
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] px-5 py-4 text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Generated</p>
              <p className="mt-1 text-[13px] font-black text-foreground">
                {new Date(report.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-4 gap-4 break-inside-avoid">
          {(report.kpis ?? []).slice(0, 4).map((kpi, index) => {
            const icons = [Users, Target, ShieldCheck, Zap];
            const Icon = icons[index] ?? Activity;
            return (
              <div key={`${kpi.label}-${index}`} className="app-card p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primary-light-bg)] text-primary">
                  <Icon size={18} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--subtle-foreground)]">
                  {kpi.label}
                </p>
                <p className="mt-2 text-[25px] font-black tracking-tight text-foreground">{kpi.value}</p>
              </div>
            );
          })}
        </section>

        <PrintSection num="01" title={sectionTitle(report, "summary", "종합 분석 및 총평")} badge="Executive Summary">
          <div className="grid grid-cols-[1fr_360px] gap-8">
            <div>
              <p className="text-[20px] font-medium leading-[1.85] tracking-tight text-foreground">
                {summary || "종합 분석 요약 데이터가 없습니다."}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 text-[12px] font-bold text-[var(--muted-foreground)]">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-5 py-4">
                  섹션 수 <span className="ml-2 text-primary">{report.sections.length}</span>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-5 py-4">
                  차트 수 <span className="ml-2 text-primary">{report.charts.length}</span>
                </div>
              </div>
            </div>
            <div className="app-soft h-[310px] border-[var(--border)] bg-[var(--panel-soft)] p-5">
              <div className="mb-3 flex items-center gap-2 text-[12px] font-black text-foreground">
                <Layers size={15} className="text-primary" />
                상위 키워드 레이더
              </div>
              <ResponsiveContainer width="100%" height="88%">
                <RadarChart data={keywordRadar}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 10, fontWeight: 800, fill: "var(--secondary-foreground)" }}
                  />
                  <Radar
                    dataKey="dominant"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.18}
                    strokeWidth={3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </PrintSection>

        <PrintSection num="02" title="전략적 핵심 인사이트" badge="Key Findings & Decisions">
          <div className="space-y-5">
            {findings.length ? (
              findings.map((section, index) => (
                <article
                  key={`${section.id}-${index}`}
                  className="break-inside-avoid rounded-3xl border border-[var(--border)] bg-card p-7"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="rounded-xl bg-primary px-3 py-1 text-[11px] font-black text-white">
                      #{index + 1}
                    </span>
                    <h3 className="text-[20px] font-black text-foreground">{section.title}</h3>
                  </div>
                  <p className="text-[14px] font-semibold leading-[1.75] text-[var(--secondary-foreground)]">
                    {section.content}
                  </p>
                  {section.evidence && section.evidence.length > 0 && (
                    <div className="mt-5 grid grid-cols-3 gap-3">
                      {section.evidence.slice(0, 3).map((item) => (
                        <div
                          key={`${section.title}-${item.label}`}
                          className="rounded-2xl border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] px-4 py-3"
                        >
                          <p className="text-[10px] font-black uppercase tracking-wider text-primary">{item.label}</p>
                          <p className="mt-1 text-[13px] font-black text-foreground">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {section.action && (
                    <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-5 py-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                        전략적 권장 액션
                      </p>
                      <p className="mt-2 text-[13px] font-bold leading-relaxed text-foreground">{section.action}</p>
                    </div>
                  )}
                </article>
              ))
            ) : (
              <p className="text-[14px] font-bold text-[var(--muted-foreground)]">전략 인사이트 데이터가 없습니다.</p>
            )}
          </div>
        </PrintSection>

        <PrintSection
          num="03"
          title={sectionTitle(report, "detail", "데이터 기반 심층 분석")}
          badge="Quantitative Evidence"
        >
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="mb-6 text-[15px] font-semibold leading-[1.75] text-[var(--secondary-foreground)]">
                {detailText}
              </p>
              <div className="app-soft h-[320px] border-[var(--border)] bg-[var(--panel-soft)] p-5">
                <div className="mb-3 flex items-center gap-2 text-[12px] font-black text-foreground">
                  <BarChart3 size={15} className="text-primary" />
                  연령대별 분석 대상 규모
                </div>
                <ResponsiveContainer width="100%" height="88%">
                  <BarChart data={ageDistribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 800 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="benchmark" fill="var(--border)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-3xl bg-primary p-8 text-white shadow-[var(--shadow-lg)]">
              <p className="mb-5 text-[11px] font-black uppercase tracking-[0.24em] text-white/70">
                Question Distribution
              </p>
              {questionDistribution.slice(0, 3).map((item, index) => (
                <div
                  key={`${item.question_id ?? index}`}
                  className="mb-4 rounded-2xl border border-white/20 bg-white/10 px-5 py-4"
                >
                  <p className="text-[12px] font-black text-white">{String(item.question_id ?? `Q${index + 1}`)}</p>
                  <p className="mt-2 text-[12px] font-medium leading-relaxed text-white/80">
                    {String(item.question_text ?? "")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </PrintSection>

        <PrintSection
          num="04"
          title={sectionTitle(report, "segment", "세그먼트 그룹별 분석 및 권장 액션")}
          badge="Segmented Action Strategy"
        >
          <p className="mb-6 text-[15px] font-semibold leading-[1.75] text-[var(--secondary-foreground)]">
            {segmentText}
          </p>
          <div className="space-y-4">
            {segmentCards.slice(0, 5).map((item, index) => (
              <article
                key={`${item.segment ?? index}`}
                className="break-inside-avoid rounded-3xl border border-[var(--border)] bg-card p-6"
              >
                <div className="grid grid-cols-[240px_1fr] gap-6">
                  <div className="rounded-2xl bg-[var(--panel-soft)] p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Live Segment</p>
                    <h3 className="mt-2 text-[19px] font-black text-foreground">{String(item.segment ?? "미분류")}</h3>
                    <p className="mt-2 text-[15px] font-black text-primary">{String(item.share ?? "0")}% 비중</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      ["대상 수", item.count],
                      ["구매 채널", item.buyChannel],
                      ["제품군", item.productGroup],
                    ].map(([label, value]) => (
                      <div
                        key={`${item.segment}-${label}`}
                        className="rounded-2xl border border-[var(--border)] px-4 py-4"
                      >
                        <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)]">
                          {label}
                        </p>
                        <p className="mt-2 text-[13px] font-black text-foreground">{String(value ?? "데이터 없음")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </PrintSection>
      </div>
    </main>
  );
};
