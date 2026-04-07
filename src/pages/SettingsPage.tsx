import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Shield,
  Database,
  FileText,
  LayoutGrid,
  Users,
  Sparkles,
  Save,
  RotateCcw,
  Terminal,
  Target,
  Globe,
  BarChart2,
  Eye,
  Package,
  TrendingUp,
  MapPin,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Search,
  Briefcase,
  MessageSquare,
  History,
  TableProperties,
  Network,
  Key,
  Plus,
  Calendar,
  Send,
  Layers,
  UserCheck,
  ChevronRight,
  Mail,
  Award,
  BarChart,
  PieChart,
  Cpu,
  FlaskConical,
  ChevronDown,
  List,
  LayoutGrid as LayoutGridIcon,
  RefreshCw,
  Plug,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { settingsApi, type GeoSettings, type SeoSettings } from "@/lib/api";

/* ─── 네비게이션 구조 ─── */
interface NavSection {
  label: string;
  items: { key: string; label: string; icon: React.ElementType }[];
}

const NAV: NavSection[] = [
  {
    label: "엔터프라이즈 통합 관리",
    items: [
      { key: "projects", label: "리서치 프로젝트 마스터 뷰", icon: Briefcase },
      { key: "datasrc", label: "데이터 소스 및 스키마", icon: Database },
      { key: "users", label: "사용자 및 권한 제어", icon: Users },
    ],
  },
  {
    label: "AI 엔진 및 감사 로그",
    items: [
      { key: "prompt", label: "시스템 프롬프트 설정", icon: Terminal },
      { key: "logs", label: "AI 대화 감사 로그", icon: MessageSquare },
      { key: "validation", label: "페르소나 검증 (CoT) 아카이브", icon: History },
    ],
  },
  {
    label: "서비스 운영",
    items: [
      { key: "report", label: "리포트 배포 정책", icon: FileText },
      { key: "menu", label: "화면 위젯 구성", icon: LayoutGrid },
    ],
  },
  {
    label: "검색 및 지역화",
    items: [
      { key: "seo", label: "SEO 최적화 설정", icon: TrendingUp },
      { key: "geo", label: "GEO 지역 타겟팅", icon: MapPin },
    ],
  },
];

/* ─── 공통 컴포넌트 ─── */
function SectionTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-6 animate-in fade-in slide-in-from-left-4 duration-300">
      <h2 className="text-2xl font-black text-foreground tracking-tight">{title}</h2>
      {desc && <p className="app-page-description mt-1.5">{desc}</p>}
    </div>
  );
}

function SettingGroup({ title, children }: { title?: string; children: React.ReactNode }) {
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

const PROMPT_PRESETS = [
  { id: "survey", label: "설문 생성", icon: Target },
  { id: "simulation", label: "시뮬레이션", icon: BarChart2 },
  { id: "assistant", label: "어시스턴트", icon: Sparkles },
] as const;

const DEFAULT_PROMPT_TEXT: Record<string, string> = {
  survey: "Generate concise and structured survey questions.",
  simulation: "Respond as a market research digital twin.",
  assistant: "Answer with evidence and confidence.",
};

const DEFAULT_SEO_SETTINGS: SeoSettings = {
  enabled: true,
  scope: ["report", "project", "insight"],
  locale: { language: "ko", country: "KR" },
  meta: {
    title_template: "{프로젝트명} | Digital Twin Insight {YYYY}",
    description_template: "{프로젝트명} 핵심 인사이트와 리서치 결과를 요약합니다.",
    canonical_base_url: "https://insight.example.com/reports",
    og_image_mode: "per-project",
  },
  keywords: {
    manual_keywords: ["디지털 트윈", "리서치 자동화", "시장조사"],
    ai_extraction_enabled: true,
    excluded_keywords: ["무료", "이벤트"],
    brand_priority: true,
  },
  content_policy: {
    summary_length: "medium",
    auto_headings: true,
    faq_block: true,
    structured_data: true,
  },
  publishing: {
    auto_publish: false,
    approval_required: true,
  },
};

const DEFAULT_GEO_SETTINGS: GeoSettings = {
  enabled: true,
  default_market: "대한민국",
  included_regions: ["수도권", "영남권", "호남권", "충청/강원/제주"],
  excluded_regions: [],
  sampling: {
    weights: [
      { region: "수도권", ratio: 45, min_sample: 400 },
      { region: "영남권", ratio: 25, min_sample: 200 },
      { region: "호남권", ratio: 15, min_sample: 120 },
      { region: "충청/강원/제주", ratio: 15, min_sample: 120 },
    ],
    rebalance_enabled: true,
  },
  localization: {
    auto_translation: true,
    cultural_filter_enabled: true,
    locale_format: {
      currency: "KRW",
      measurement: "metric",
      date_format: "YYYY-MM-DD",
    },
  },
  apply_to: {
    survey_generation: true,
    persona_generation: true,
    simulation: true,
    report_rendering: false,
  },
};

function parseCsv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toCsv(items: string[]): string {
  return items.join(", ");
}

function StatCard({
  label,
  value,
  sub,
  tone = "neutral",
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "primary" | "warn" | "danger" | "success";
  icon?: React.ElementType;
}) {
  const iconBg = {
    neutral: "bg-[var(--panel-soft)] border-[var(--border)] text-[var(--secondary-foreground)]",
    primary: "bg-primary/10 border-primary/20 text-primary",
    warn: "bg-[var(--warning-light)] border-[var(--warning)]/20 text-[var(--warning)]",
    danger: "bg-red-50 border-red-100 text-[#ef4444]",
    success: "bg-[var(--success-light)] border-[var(--success)]/20 text-[var(--success)]",
  }[tone];

  const valueColor = {
    neutral: "text-foreground",
    primary: "text-primary",
    warn: "text-[var(--warning)]",
    danger: "text-[#ef4444]",
    success: "text-[var(--success)]",
  }[tone];

  return (
    <div className="bg-card border border-[var(--border)] p-5 rounded-2xl shadow-[var(--shadow-sm)] transition-all hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-md)]">
      {Icon && (
        <div className={cn("mb-4 inline-flex rounded-xl border p-2.5", iconBg)}>
          <Icon size={15} />
        </div>
      )}
      <p className={cn("text-[22px] font-black leading-none", valueColor)}>{value}</p>
      <p className="mt-1.5 text-[12px] font-bold text-[var(--secondary-foreground)]">{label}</p>
      {sub && <p className="mt-1 text-[11px] font-medium text-[var(--muted-foreground)]">{sub}</p>}
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-4 shadow-sm">
      <div>
        <p className="text-[13px] font-black text-foreground">{label}</p>
        <p className="mt-1 text-[11px] font-medium text-[var(--secondary-foreground)]">{desc}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-primary"
      />
    </label>
  );
}

function SeoSettingsSection() {
  const [settings, setSettings] = useState<SeoSettings>(DEFAULT_SEO_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<SeoSettings>(DEFAULT_SEO_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const response = await settingsApi.getSeoSettings();
      const next = response ? { ...DEFAULT_SEO_SETTINGS, ...response } : DEFAULT_SEO_SETTINGS;
      setSettings(next);
      setSavedSettings(next);
      setLoading(false);
    };
    load();
  }, []);

  const isDirty = JSON.stringify(settings) !== JSON.stringify(savedSettings);
  const keywordCoverage = settings.keywords.manual_keywords.length + (settings.keywords.ai_extraction_enabled ? 5 : 0);
  const previewTitle = settings.meta.title_template
    .replace("{프로젝트명}", "Galaxy S26 AI 카메라")
    .replace("{YYYY}", "2026");
  const previewDescription = settings.meta.description_template.replace("{프로젝트명}", "Galaxy S26 AI 카메라");
  const normalizedPreviewUrl = `${settings.meta.canonical_base_url.replace(/\/$/, "")}/galaxy-s26-ai-camera`;
  const contentReadiness = [
    settings.content_policy.auto_headings,
    settings.content_policy.faq_block,
    settings.content_policy.structured_data,
    settings.keywords.ai_extraction_enabled,
  ].filter(Boolean).length;
  const qualityChecks = [
    {
      label: "타이틀 길이",
      state: previewTitle.length >= 20 && previewTitle.length <= 60 ? "ok" : "warn",
      helper: `${previewTitle.length}자`,
    },
    {
      label: "설명 길이",
      state: previewDescription.length >= 70 && previewDescription.length <= 160 ? "ok" : "warn",
      helper: `${previewDescription.length}자`,
    },
    {
      label: "키워드 밀도",
      state: settings.keywords.manual_keywords.length >= 3 ? "ok" : "warn",
      helper: `${settings.keywords.manual_keywords.length}개 수동 키워드`,
    },
    {
      label: "발행 안전성",
      state: settings.publishing.auto_publish && !settings.publishing.approval_required ? "warn" : "ok",
      helper: settings.publishing.approval_required ? "승인 절차 유지" : "자동 발행 우선",
    },
  ] as const;
  const seoPriorityCards = [
    {
      title: "검색 결과 품질",
      value: `${Math.min(100, 58 + contentReadiness * 9)}점`,
      desc: "메타 정보, FAQ, 구조화 데이터, 헤딩 정책을 합산한 운영 점검 지표",
      tone: "primary",
    },
    {
      title: "콘텐츠 생성 방향",
      value:
        settings.content_policy.summary_length === "short"
          ? "짧은 요약"
          : settings.content_policy.summary_length === "medium"
            ? "균형형 요약"
            : "긴 설명형",
      desc: "AI가 검색용 요약과 섹션 구조를 만드는 기본 톤",
      tone: "neutral",
    },
    {
      title: "배포 리스크",
      value:
        settings.publishing.auto_publish && !settings.publishing.approval_required
          ? "높음"
          : settings.publishing.auto_publish
            ? "보통"
            : "낮음",
      desc: "승인 절차와 자동 발행 조합 기준의 운영 위험도",
      tone: "danger",
    },
  ] as const;

  const save = async () => {
    setSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);
    const response = await settingsApi.saveSeoSettings(settings);
    if (!response) {
      setErrorMessage("SEO 설정 저장에 실패했습니다.");
      setSaving(false);
      return;
    }
    setSettings(response);
    setSavedSettings(response);
    setStatusMessage("SEO 정책을 저장했습니다.");
    setSaving(false);
  };

  const reset = () => {
    setSettings(savedSettings);
    setStatusMessage("마지막 저장 상태로 되돌렸습니다.");
    setErrorMessage(null);
  };

  return (
    <>
      <SectionTitle
        title="SEO 정책 콘솔"
        desc="검색 노출용 메타데이터와 키워드 생성 규칙, 발행 검수 정책을 실제 설정값 기준으로 관리합니다."
      />

      <div className="grid grid-cols-1 gap-6">
        <SettingGroup title="정책 상태">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  label: "SEO 적용 상태",
                  value: settings.enabled ? "활성" : "비활성",
                  sub: settings.scope.join(" · ") || "적용 대상 없음",
                },
                {
                  label: "키워드 커버리지",
                  value: `${keywordCoverage}개`,
                  sub: settings.keywords.ai_extraction_enabled ? "AI 추출 포함" : "수동 키워드만 사용",
                },
                {
                  label: "발행 정책",
                  value: settings.publishing.approval_required ? "승인 필요" : "자동 발행",
                  sub: settings.publishing.auto_publish ? "자동 발행 허용" : "초안 저장 우선",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-5 shadow-sm"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                    {item.label}
                  </p>
                  <p className="mt-3 text-2xl font-black text-foreground">{item.value}</p>
                  <p className="mt-1 text-[11px] font-medium text-[var(--secondary-foreground)]">{item.sub}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-[var(--primary-light-bg)] via-card to-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                    Search Operations Brief
                  </p>
                  <h3 className="mt-2 text-[18px] font-black tracking-tight text-foreground">
                    검색 노출 정책을 콘텐츠 운영 흐름과 연결
                  </h3>
                </div>
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                  <Search size={18} />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline" className="border-primary/30 bg-white text-primary">
                  {settings.locale.language.toUpperCase()} / {settings.locale.country}
                </Badge>
                <Badge variant="outline" className="border-primary/30 bg-white text-primary">
                  {settings.meta.og_image_mode}
                </Badge>
                <Badge variant="outline" className="border-primary/30 bg-white text-primary">
                  {settings.scope.length}개 노출 채널
                </Badge>
              </div>
              <p className="mt-4 text-[12px] font-medium leading-relaxed text-[var(--secondary-foreground)]">
                이 정책은 리포트 메타데이터, 인사이트 요약, 랜딩 설명문에 공통 적용됩니다. 검색 프리뷰 길이와 승인
                정책을 함께 보면 운영 리스크를 빠르게 판단할 수 있습니다.
              </p>
            </div>
          </div>
        </SettingGroup>

        <SettingGroup title="운영 우선순위">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {seoPriorityCards.map((card) => (
              <div
                key={card.title}
                className={cn(
                  "rounded-2xl border p-5 shadow-sm",
                  card.tone === "primary" && "border-primary/20 bg-[var(--primary-light-bg)]",
                  card.tone === "neutral" && "border-[var(--border)] bg-[var(--panel-soft)]",
                  card.tone === "danger" && "border-amber-200 bg-amber-50/80"
                )}
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                  {card.title}
                </p>
                <p className="mt-3 text-2xl font-black text-foreground">{card.value}</p>
                <p className="mt-2 text-[12px] font-medium leading-relaxed text-[var(--secondary-foreground)]">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </SettingGroup>

        <SettingGroup title="기본 정책">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ToggleRow
              label="SEO 정책 활성화"
              desc="리포트와 프로젝트 소개 콘텐츠에 검색 노출용 규칙을 적용합니다."
              checked={settings.enabled}
              onChange={(enabled) => setSettings((prev) => ({ ...prev, enabled }))}
            />
            <ToggleRow
              label="브랜드 키워드 우선 반영"
              desc="메타데이터와 요약 생성 시 브랜드 키워드를 우선 순위로 배치합니다."
              checked={settings.keywords.brand_priority}
              onChange={(brand_priority) =>
                setSettings((prev) => ({ ...prev, keywords: { ...prev.keywords, brand_priority } }))
              }
            />
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                기본 언어
              </label>
              <select
                value={settings.locale.language}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, locale: { ...prev.locale, language: e.target.value } }))
                }
                className="h-[44px] w-full rounded-xl border border-[var(--border)] bg-card px-4 text-[13px] font-bold text-foreground outline-none focus:border-primary shadow-sm"
              >
                <option value="ko">한국어</option>
                <option value="en">영어</option>
                <option value="ja">일본어</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                기본 국가
              </label>
              <select
                value={settings.locale.country}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, locale: { ...prev.locale, country: e.target.value } }))
                }
                className="h-[44px] w-full rounded-xl border border-[var(--border)] bg-card px-4 text-[13px] font-bold text-foreground outline-none focus:border-primary shadow-sm"
              >
                <option value="KR">대한민국</option>
                <option value="US">미국</option>
                <option value="JP">일본</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
              적용 대상
            </label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                ["report", "리포트"],
                ["project", "프로젝트 소개"],
                ["insight", "인사이트 요약"],
                ["landing", "랜딩 페이지"],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-card px-4 py-3 text-[13px] font-bold text-[var(--secondary-foreground)] shadow-sm"
                >
                  <input
                    type="checkbox"
                    checked={settings.scope.includes(value)}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        scope: e.target.checked ? [...prev.scope, value] : prev.scope.filter((item) => item !== value),
                      }))
                    }
                    className="h-4 w-4 accent-primary"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </SettingGroup>

        <SettingGroup title="메타 및 키워드 규칙">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                타이틀 템플릿
              </label>
              <input
                value={settings.meta.title_template}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, meta: { ...prev.meta, title_template: e.target.value } }))
                }
                className="h-[44px] w-full rounded-xl border border-[var(--border)] bg-card px-4 text-[13px] font-bold text-foreground outline-none focus:border-primary shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                Canonical Base URL
              </label>
              <input
                value={settings.meta.canonical_base_url}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, meta: { ...prev.meta, canonical_base_url: e.target.value } }))
                }
                className="h-[44px] w-full rounded-xl border border-[var(--border)] bg-card px-4 text-[13px] font-bold text-foreground outline-none focus:border-primary shadow-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                OG 이미지 정책
              </label>
              <select
                value={settings.meta.og_image_mode}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    meta: { ...prev.meta, og_image_mode: e.target.value as SeoSettings["meta"]["og_image_mode"] },
                  }))
                }
                className="h-[44px] w-full rounded-xl border border-[var(--border)] bg-card px-4 text-[13px] font-bold text-foreground outline-none focus:border-primary shadow-sm"
              >
                <option value="default">기본 템플릿</option>
                <option value="per-project">프로젝트별 비주얼</option>
                <option value="manual">수동 업로드</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                요약 길이
              </label>
              <select
                value={settings.content_policy.summary_length}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    content_policy: {
                      ...prev.content_policy,
                      summary_length: e.target.value as SeoSettings["content_policy"]["summary_length"],
                    },
                  }))
                }
                className="h-[44px] w-full rounded-xl border border-[var(--border)] bg-card px-4 text-[13px] font-bold text-foreground outline-none focus:border-primary shadow-sm"
              >
                <option value="short">짧게</option>
                <option value="medium">균형형</option>
                <option value="long">길게</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
              메타 설명 템플릿
            </label>
            <textarea
              value={settings.meta.description_template}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, meta: { ...prev.meta, description_template: e.target.value } }))
              }
              className="h-28 w-full rounded-xl border border-[var(--border)] bg-card px-4 py-3 text-[13px] font-medium text-foreground outline-none focus:border-primary shadow-sm"
            />
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                수동 키워드
              </label>
              <input
                value={toCsv(settings.keywords.manual_keywords)}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    keywords: { ...prev.keywords, manual_keywords: parseCsv(e.target.value) },
                  }))
                }
                className="h-[44px] w-full rounded-xl border border-[var(--border)] bg-card px-4 text-[13px] font-medium text-foreground outline-none focus:border-primary shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                제외 키워드
              </label>
              <input
                value={toCsv(settings.keywords.excluded_keywords)}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    keywords: { ...prev.keywords, excluded_keywords: parseCsv(e.target.value) },
                  }))
                }
                className="h-[44px] w-full rounded-xl border border-[var(--border)] bg-card px-4 text-[13px] font-medium text-foreground outline-none focus:border-primary shadow-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ToggleRow
              label="AI 키워드 추출"
              desc="본문 요약에서 보조 키워드를 자동 생성합니다."
              checked={settings.keywords.ai_extraction_enabled}
              onChange={(ai_extraction_enabled) =>
                setSettings((prev) => ({ ...prev, keywords: { ...prev.keywords, ai_extraction_enabled } }))
              }
            />
            <ToggleRow
              label="자동 헤딩 생성"
              desc="H1~H3 구조를 정책에 맞춰 생성합니다."
              checked={settings.content_policy.auto_headings}
              onChange={(auto_headings) =>
                setSettings((prev) => ({ ...prev, content_policy: { ...prev.content_policy, auto_headings } }))
              }
            />
            <ToggleRow
              label="FAQ 블록 생성"
              desc="주요 질문과 답변을 검색 노출용 블록으로 생성합니다."
              checked={settings.content_policy.faq_block}
              onChange={(faq_block) =>
                setSettings((prev) => ({ ...prev, content_policy: { ...prev.content_policy, faq_block } }))
              }
            />
          </div>
        </SettingGroup>

        <SettingGroup title="발행 정책 및 미리보기">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5">
              <div className="space-y-4">
                <ToggleRow
                  label="구조화 데이터(schema.org) 사용"
                  desc="리포트와 인사이트 페이지에 구조화 마크업을 삽입합니다."
                  checked={settings.content_policy.structured_data}
                  onChange={(structured_data) =>
                    setSettings((prev) => ({ ...prev, content_policy: { ...prev.content_policy, structured_data } }))
                  }
                />
                <ToggleRow
                  label="자동 발행 허용"
                  desc="검수 조건 충족 시 초안 단계를 건너뛰고 배포합니다."
                  checked={settings.publishing.auto_publish}
                  onChange={(auto_publish) =>
                    setSettings((prev) => ({ ...prev, publishing: { ...prev.publishing, auto_publish } }))
                  }
                />
                <ToggleRow
                  label="승인 절차 필요"
                  desc="최종 게시 전에 운영자 승인을 필수로 요구합니다."
                  checked={settings.publishing.approval_required}
                  onChange={(approval_required) =>
                    setSettings((prev) => ({ ...prev, publishing: { ...prev.publishing, approval_required } }))
                  }
                />
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-2.5 text-primary shadow-sm">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                      Content Guidance
                    </p>
                    <p className="mt-1 text-[14px] font-black text-foreground">
                      운영자가 바로 이해할 수 있는 생성 원칙
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {[
                    `요약 길이: ${settings.content_policy.summary_length}`,
                    settings.content_policy.auto_headings ? "헤딩 구조 자동 생성" : "헤딩은 수동 검수 우선",
                    settings.content_policy.faq_block ? "FAQ 블록 포함" : "FAQ 블록 미포함",
                    settings.meta.og_image_mode === "manual" ? "OG 이미지는 수동 관리" : "OG 이미지는 정책 자동 생성",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-[var(--border)] bg-card px-4 py-3 text-[12px] font-bold text-[var(--secondary-foreground)]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-5">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                      Search Preview
                    </p>
                    <p className="mt-1 text-[12px] font-medium text-[var(--secondary-foreground)]">
                      Google 검색 결과와 공유 미리보기를 동시에 점검합니다.
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-2.5 text-primary shadow-sm">
                    <Globe size={16} />
                  </div>
                </div>
                <div className="mt-5 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
                  <p className="text-[18px] font-black leading-snug text-[#1A0DAB]">{previewTitle}</p>
                  <p className="mt-1 text-[12px] font-bold text-[#188038]">{normalizedPreviewUrl}</p>
                  <p className="mt-3 text-[13px] font-medium leading-relaxed text-[#4D5156]">{previewDescription}</p>
                </div>
                <div className="mt-4 rounded-2xl border border-[var(--border)] bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                      Open Graph Preview
                    </p>
                    <Badge variant="outline" className="border-primary/30 bg-white text-primary">
                      {settings.meta.og_image_mode}
                    </Badge>
                  </div>
                  <div className="mt-3 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel-soft)]">
                    <div className="h-28 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent" />
                    <div className="p-4">
                      <p className="text-[13px] font-black text-foreground">{previewTitle}</p>
                      <p className="mt-1 text-[12px] font-medium leading-relaxed text-[var(--secondary-foreground)]">
                        {previewDescription}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {settings.keywords.manual_keywords.slice(0, 5).map((keyword) => (
                    <Badge key={keyword} variant="outline" className="border-primary/30 bg-white text-primary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-50 p-2.5 text-amber-500 shadow-sm">
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                      Quality Checks
                    </p>
                    <p className="mt-1 text-[14px] font-black text-foreground">저장 전에 확인할 검색 품질 포인트</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {qualityChecks.map((check) => (
                    <div
                      key={check.label}
                      className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3"
                    >
                      <div>
                        <p className="text-[12px] font-black text-foreground">{check.label}</p>
                        <p className="mt-1 text-[11px] font-medium text-[var(--secondary-foreground)]">
                          {check.helper}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-black uppercase tracking-wider",
                          check.state === "ok"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                            : "border-amber-200 bg-amber-50 text-amber-600"
                        )}
                      >
                        {check.state === "ok" ? "적정" : "점검 필요"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {(statusMessage || errorMessage) && (
            <div
              className={cn(
                "rounded-xl border px-4 py-3 text-[12px] font-bold",
                errorMessage
                  ? "border-red-200 bg-red-50 text-red-500"
                  : "border-primary/20 bg-[var(--primary-light-bg)] text-primary"
              )}
            >
              {errorMessage ?? statusMessage}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={reset}
              disabled={loading || saving || !isDirty}
            >
              <RotateCcw size={16} /> 되돌리기
            </Button>
            <Button size="lg" className="gap-2" onClick={save} disabled={loading || saving || !isDirty}>
              <Save size={16} /> {saving ? "저장 중..." : "SEO 정책 저장"}
            </Button>
          </div>
        </SettingGroup>
      </div>
    </>
  );
}

function GeoSettingsSection() {
  const [settings, setSettings] = useState<GeoSettings>(DEFAULT_GEO_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<GeoSettings>(DEFAULT_GEO_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const response = await settingsApi.getGeoSettings();
      const next = response ? { ...DEFAULT_GEO_SETTINGS, ...response } : DEFAULT_GEO_SETTINGS;
      setSettings(next);
      setSavedSettings(next);
      setLoading(false);
    };
    load();
  }, []);

  const isDirty = JSON.stringify(settings) !== JSON.stringify(savedSettings);
  const totalRatio = settings.sampling.weights.reduce((sum, item) => sum + Number(item.ratio || 0), 0);
  const ratioValid = totalRatio === 100;
  const highestRegion = [...settings.sampling.weights].sort((a, b) => b.ratio - a.ratio)[0];
  const totalMinSample = settings.sampling.weights.reduce((sum, item) => sum + Number(item.min_sample || 0), 0);
  const geoChecks = [
    {
      label: "가중치 합계",
      state: ratioValid ? "ok" : "warn",
      helper: `${totalRatio}%`,
    },
    {
      label: "포함 지역 수",
      state: settings.included_regions.length >= 2 ? "ok" : "warn",
      helper: `${settings.included_regions.length}개 시장`,
    },
    {
      label: "기본 시장 지정",
      state: settings.default_market.trim() ? "ok" : "warn",
      helper: settings.default_market || "미지정",
    },
    {
      label: "로컬라이징 정책",
      state: settings.localization.auto_translation || settings.localization.cultural_filter_enabled ? "ok" : "warn",
      helper: settings.localization.auto_translation ? "번역 활성" : "번역 비활성",
    },
  ] as const;
  const geoPriorityCards = [
    {
      title: "대표 시장",
      value: highestRegion ? highestRegion.region : "미설정",
      desc: highestRegion ? `현재 기본 가중치 ${highestRegion.ratio}%` : "가중치 설정 필요",
      tone: "primary",
    },
    {
      title: "최소 확보 표본",
      value: `${totalMinSample.toLocaleString()}명`,
      desc: "리전별 min sample 합계 기준의 초기 수집 목표치",
      tone: "neutral",
    },
    {
      title: "운영 리스크",
      value: ratioValid ? "안정" : "점검 필요",
      desc: ratioValid ? "가중치 합계와 시장 범위가 정상입니다." : "가중치 합계 또는 시장 범위를 재검토해야 합니다.",
      tone: "danger",
    },
  ] as const;

  const updateWeight = (region: string, field: "ratio" | "min_sample", value: number) => {
    setSettings((prev) => ({
      ...prev,
      sampling: {
        ...prev.sampling,
        weights: prev.sampling.weights.map((item) => (item.region === region ? { ...item, [field]: value } : item)),
      },
    }));
  };

  const save = async () => {
    if (!ratioValid) {
      setErrorMessage("지역별 가중치 합계는 100이어야 합니다.");
      return;
    }
    setSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);
    const response = await settingsApi.saveGeoSettings(settings);
    if (!response) {
      setErrorMessage("GEO 설정 저장에 실패했습니다.");
      setSaving(false);
      return;
    }
    setSettings(response);
    setSavedSettings(response);
    setStatusMessage("GEO 타겟팅 정책을 저장했습니다.");
    setSaving(false);
  };

  const reset = () => {
    setSettings(savedSettings);
    setStatusMessage("마지막 저장 상태로 되돌렸습니다.");
    setErrorMessage(null);
  };

  return (
    <>
      <SectionTitle
        title="GEO 정책 콘솔"
        desc="대상 시장 범위, 샘플링 비중, 로컬라이징 정책을 실제 생성 흐름에 반영할 수 있도록 관리합니다."
      />

      <div className="grid grid-cols-1 gap-6">
        <SettingGroup title="시장 운영 브리프">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {geoPriorityCards.map((card) => (
                <div
                  key={card.title}
                  className={cn(
                    "rounded-2xl border p-5 shadow-sm",
                    card.tone === "primary" && "border-primary/20 bg-[var(--primary-light-bg)]",
                    card.tone === "neutral" && "border-[var(--border)] bg-[var(--panel-soft)]",
                    card.tone === "danger" && "border-amber-200 bg-amber-50/80"
                  )}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                    {card.title}
                  </p>
                  <p className="mt-3 text-2xl font-black text-foreground">{card.value}</p>
                  <p className="mt-2 text-[12px] font-medium leading-relaxed text-[var(--secondary-foreground)]">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-[var(--primary-light-bg)] via-card to-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Geo Operations Brief</p>
                  <h3 className="mt-2 text-[18px] font-black tracking-tight text-foreground">
                    시장 범위와 샘플링 정책을 같은 화면에서 통제
                  </h3>
                </div>
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                  <MapPin size={18} />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline" className="border-primary/30 bg-white text-primary">
                  {settings.default_market || "기본 시장 미지정"}
                </Badge>
                <Badge variant="outline" className="border-primary/30 bg-white text-primary">
                  {settings.localization.locale_format.currency}
                </Badge>
                <Badge variant="outline" className="border-primary/30 bg-white text-primary">
                  {settings.localization.locale_format.measurement}
                </Badge>
              </div>
              <p className="mt-4 text-[12px] font-medium leading-relaxed text-[var(--secondary-foreground)]">
                이 정책은 설문 생성, 페르소나 샘플링, 시뮬레이션 응답, 리포트 현지화에 연결됩니다. 지역 가중치와 번역
                정책을 같이 보면서 운영 리스크를 점검하는 용도입니다.
              </p>
            </div>
          </div>
        </SettingGroup>

        <SettingGroup title="시장 범위 및 적용 대상">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ToggleRow
              label="GEO 타겟팅 활성화"
              desc="신규 프로젝트와 설문 생성 시 지역 정책을 기본값으로 적용합니다."
              checked={settings.enabled}
              onChange={(enabled) => setSettings((prev) => ({ ...prev, enabled }))}
            />
            <ToggleRow
              label="대표성 자동 보정"
              desc="실행 중 응답 분포가 목표 비율에서 벗어나면 후속 배치를 재조정합니다."
              checked={settings.sampling.rebalance_enabled}
              onChange={(rebalance_enabled) =>
                setSettings((prev) => ({ ...prev, sampling: { ...prev.sampling, rebalance_enabled } }))
              }
            />
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                기본 시장
              </label>
              <input
                value={settings.default_market}
                onChange={(e) => setSettings((prev) => ({ ...prev, default_market: e.target.value }))}
                className="h-[44px] w-full rounded-xl border border-[var(--border)] bg-card px-4 text-[13px] font-bold text-foreground outline-none focus:border-primary shadow-sm"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                포함 지역
              </label>
              <input
                value={toCsv(settings.included_regions)}
                onChange={(e) => setSettings((prev) => ({ ...prev, included_regions: parseCsv(e.target.value) }))}
                className="h-[44px] w-full rounded-xl border border-[var(--border)] bg-card px-4 text-[13px] font-medium text-foreground outline-none focus:border-primary shadow-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
              제외 지역
            </label>
            <input
              value={toCsv(settings.excluded_regions)}
              onChange={(e) => setSettings((prev) => ({ ...prev, excluded_regions: parseCsv(e.target.value) }))}
              className="h-[44px] w-full rounded-xl border border-[var(--border)] bg-card px-4 text-[13px] font-medium text-foreground outline-none focus:border-primary shadow-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ["survey_generation", "설문 생성"],
              ["persona_generation", "페르소나 생성"],
              ["simulation", "시뮬레이션"],
              ["report_rendering", "리포트 렌더링"],
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-card px-4 py-3 text-[13px] font-bold text-[var(--secondary-foreground)] shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={settings.apply_to[key as keyof GeoSettings["apply_to"]]}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, apply_to: { ...prev.apply_to, [key]: e.target.checked } }))
                  }
                  className="h-4 w-4 accent-primary"
                />
                {label}
              </label>
            ))}
          </div>
        </SettingGroup>

        <SettingGroup title="지역별 샘플링 비중">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5">
              <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-card shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-[var(--panel-soft)]">
                    <tr className="text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                      <th className="px-4 py-3">Region</th>
                      <th className="px-4 py-3">Ratio</th>
                      <th className="px-4 py-3">Min Sample</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.sampling.weights.map((item) => (
                      <tr key={item.region} className="border-t border-[var(--border)]">
                        <td className="px-4 py-3 text-[13px] font-black text-foreground">{item.region}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={item.ratio}
                            onChange={(e) => updateWeight(item.region, "ratio", Number(e.target.value))}
                            className="h-10 w-24 rounded-lg border border-[var(--border)] bg-[var(--panel-soft)] px-3 text-[13px] font-bold text-foreground outline-none focus:border-primary"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={0}
                            value={item.min_sample ?? 0}
                            onChange={(e) => updateWeight(item.region, "min_sample", Number(e.target.value))}
                            className="h-10 w-28 rounded-lg border border-[var(--border)] bg-[var(--panel-soft)] px-3 text-[13px] font-bold text-foreground outline-none focus:border-primary"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-2.5 text-primary shadow-sm">
                    <Globe size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                      Localization Guidance
                    </p>
                    <p className="mt-1 text-[14px] font-black text-foreground">
                      시장별 응답 문맥에 직접 영향을 주는 로컬라이징 기준
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {[
                    settings.localization.auto_translation ? "자동 번역 활성화" : "원문 중심 운영",
                    settings.localization.cultural_filter_enabled ? "문화권 금기어 필터 적용" : "금기어 필터 비활성",
                    `통화: ${settings.localization.locale_format.currency}`,
                    `도량형: ${settings.localization.locale_format.measurement}`,
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-[var(--border)] bg-card px-4 py-3 text-[12px] font-bold text-[var(--secondary-foreground)]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-5">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                      Market Mix Preview
                    </p>
                    <p className="mt-1 text-[12px] font-medium text-[var(--secondary-foreground)]">
                      현재 설정이 실제 샘플링 비중으로 어떻게 보이는지 확인합니다.
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-2.5 text-primary shadow-sm">
                    <MapPin size={16} />
                  </div>
                </div>
                <div className="mt-5 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                        기본 시장
                      </p>
                      <p className="mt-2 text-[16px] font-black text-foreground">
                        {settings.default_market || "미지정"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                        비중 합계
                      </p>
                      <p className={cn("mt-2 text-[16px] font-black", ratioValid ? "text-foreground" : "text-red-500")}>
                        {totalRatio}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {settings.sampling.weights.map((item) => (
                      <div key={item.region}>
                        <div className="mb-1 flex items-center justify-between text-[12px] font-bold text-[var(--secondary-foreground)]">
                          <span>{item.region}</span>
                          <span>{item.ratio}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden border border-[var(--border)] bg-card">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.min(item.ratio, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-50 p-2.5 text-amber-500 shadow-sm">
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                      Policy Checks
                    </p>
                    <p className="mt-1 text-[14px] font-black text-foreground">저장 전에 확인할 지역 정책 리스크</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {geoChecks.map((check) => (
                    <div
                      key={check.label}
                      className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3"
                    >
                      <div>
                        <p className="text-[12px] font-black text-foreground">{check.label}</p>
                        <p className="mt-1 text-[11px] font-medium text-[var(--secondary-foreground)]">
                          {check.helper}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-black uppercase tracking-wider",
                          check.state === "ok"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                            : "border-amber-200 bg-amber-50 text-amber-600"
                        )}
                      >
                        {check.state === "ok" ? "정상" : "점검 필요"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SettingGroup>

        <SettingGroup title="로컬라이징 정책">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ToggleRow
              label="자동 현지화 번역"
              desc="시장 언어에 맞춰 설문/리포트 문구를 자동 변환합니다."
              checked={settings.localization.auto_translation}
              onChange={(auto_translation) =>
                setSettings((prev) => ({ ...prev, localization: { ...prev.localization, auto_translation } }))
              }
            />
            <ToggleRow
              label="문화권 금기어 필터"
              desc="현지 문화권에서 문제될 수 있는 표현을 차단합니다."
              checked={settings.localization.cultural_filter_enabled}
              onChange={(cultural_filter_enabled) =>
                setSettings((prev) => ({ ...prev, localization: { ...prev.localization, cultural_filter_enabled } }))
              }
            />
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                통화
              </label>
              <select
                value={settings.localization.locale_format.currency}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    localization: {
                      ...prev.localization,
                      locale_format: { ...prev.localization.locale_format, currency: e.target.value },
                    },
                  }))
                }
                className="h-[44px] w-full rounded-xl border border-[var(--border)] bg-card px-4 text-[13px] font-bold text-foreground outline-none focus:border-primary shadow-sm"
              >
                <option value="KRW">KRW</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                도량형
              </label>
              <select
                value={settings.localization.locale_format.measurement}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    localization: {
                      ...prev.localization,
                      locale_format: {
                        ...prev.localization.locale_format,
                        measurement: e.target.value as "metric" | "imperial",
                      },
                    },
                  }))
                }
                className="h-[44px] w-full rounded-xl border border-[var(--border)] bg-card px-4 text-[13px] font-bold text-foreground outline-none focus:border-primary shadow-sm"
              >
                <option value="metric">Metric</option>
                <option value="imperial">Imperial</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                날짜 형식
              </label>
              <input
                value={settings.localization.locale_format.date_format}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    localization: {
                      ...prev.localization,
                      locale_format: { ...prev.localization.locale_format, date_format: e.target.value },
                    },
                  }))
                }
                className="h-[44px] w-full rounded-xl border border-[var(--border)] bg-card px-4 text-[13px] font-bold text-foreground outline-none focus:border-primary shadow-sm"
              />
            </div>
          </div>
          {(statusMessage || errorMessage) && (
            <div
              className={cn(
                "rounded-xl border px-4 py-3 text-[12px] font-bold",
                errorMessage
                  ? "border-red-200 bg-red-50 text-red-500"
                  : "border-primary/20 bg-[var(--primary-light-bg)] text-primary"
              )}
            >
              {errorMessage ?? statusMessage}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={reset}
              disabled={loading || saving || !isDirty}
            >
              <RotateCcw size={16} /> 되돌리기
            </Button>
            <Button size="lg" className="gap-2" onClick={save} disabled={loading || saving || !isDirty || !ratioValid}>
              <MapPin size={16} /> {saving ? "저장 중..." : "GEO 정책 저장"}
            </Button>
          </div>
        </SettingGroup>
      </div>
    </>
  );
}

/* ─── 데이터 소스 섹션 ─── */
const DATA_SOURCES = [
  {
    id: "pos",
    name: "삼성 POS 트랜잭션",
    type: "Manual Upload",
    status: "Healthy" as const,
    sync: "1시간 전",
    signal: 100,
    icon: Database,
    endpoint: "s3://samsung-dt-uploads/pos/",
    auth: "IAM Role",
    schedule: "매일 02:00",
    syncHistory: [
      { date: "2026-04-07 02:01", rows: 184200, duration: "4m 12s", result: "Success" },
      { date: "2026-04-06 02:00", rows: 176800, duration: "3m 58s", result: "Success" },
      { date: "2026-04-05 02:03", rows: 191400, duration: "4m 31s", result: "Success" },
    ],
    schema: [
      { col: "transaction_id", type: "String", desc: "거래 고유 ID", pii: false },
      { col: "store_code", type: "String", desc: "판매점 코드", pii: false },
      { col: "product_sku", type: "String", desc: "제품 SKU", pii: false },
      { col: "quantity", type: "Integer", desc: "판매 수량", pii: false },
      { col: "price_krw", type: "Decimal", desc: "판매가 (원화)", pii: false },
      { col: "customer_hash", type: "String", desc: "고객 해시 ID (익명)", pii: false },
      { col: "txn_date", type: "DateTime", desc: "거래 일시", pii: false },
    ],
  },
  {
    id: "crm",
    name: "Global CRM API",
    type: "Direct Connection",
    status: "Warning" as const,
    sync: "연결 오류",
    signal: 20,
    icon: Network,
    endpoint: "https://crm.samsung.com/api/v3",
    auth: "OAuth 2.0 (만료)",
    schedule: "실시간 Webhook",
    syncHistory: [
      { date: "2026-04-07 08:14", rows: 0, duration: "—", result: "Failed" },
      { date: "2026-04-07 06:00", rows: 0, duration: "—", result: "Failed" },
      { date: "2026-04-06 18:30", rows: 3240, duration: "1m 02s", result: "Success" },
    ],
    schema: [
      { col: "customer_id", type: "String", desc: "CRM 고객 ID", pii: false },
      { col: "full_name", type: "String", desc: "고객 성명", pii: true },
      { col: "email", type: "String", desc: "이메일 주소", pii: true },
      { col: "region", type: "Enum", desc: "지역 코드", pii: false },
      { col: "tier", type: "Enum", desc: "고객 등급 (Gold/Silver/Bronze)", pii: false },
      { col: "last_purchase", type: "Date", desc: "마지막 구매일", pii: false },
    ],
  },
  {
    id: "social",
    name: "소셜 미디어 리뷰",
    type: "Webhook",
    status: "Healthy" as const,
    sync: "실시간",
    signal: 85,
    icon: Activity,
    endpoint: "wss://social-hook.samsung-dt.io/review",
    auth: "HMAC Signature",
    schedule: "실시간 Push",
    syncHistory: [
      { date: "2026-04-07 09:55", rows: 412, duration: "0.3s", result: "Success" },
      { date: "2026-04-07 09:50", rows: 388, duration: "0.3s", result: "Success" },
      { date: "2026-04-07 09:45", rows: 401, duration: "0.3s", result: "Success" },
    ],
    schema: [
      { col: "review_id", type: "String", desc: "리뷰 고유 ID", pii: false },
      { col: "platform", type: "Enum", desc: "플랫폼 (Instagram/TikTok/Naver)", pii: false },
      { col: "author_alias", type: "String", desc: "작성자 별칭 (익명 처리)", pii: false },
      { col: "text_raw", type: "Text", desc: "원문 리뷰 텍스트", pii: false },
      { col: "sentiment", type: "Enum", desc: "감성 분석 결과", pii: false },
      { col: "keywords", type: "Array<String>", desc: "추출된 키워드 목록", pii: false },
      { col: "published_at", type: "DateTime", desc: "게시 일시", pii: false },
    ],
  },
  {
    id: "survey_db",
    name: "고객 설문 응답 DB",
    type: "PostgreSQL",
    status: "Healthy" as const,
    sync: "5분 전",
    signal: 95,
    icon: TableProperties,
    endpoint: "postgres://survey-db.internal:5432/responses",
    auth: "Service Account",
    schedule: "5분 주기 풀링",
    syncHistory: [
      { date: "2026-04-07 09:55", rows: 1820, duration: "8s", result: "Success" },
      { date: "2026-04-07 09:50", rows: 1817, duration: "7s", result: "Success" },
      { date: "2026-04-07 09:45", rows: 1814, duration: "9s", result: "Success" },
    ],
    schema: [
      { col: "response_id", type: "UUID", desc: "응답 고유 ID", pii: false },
      { col: "project_id", type: "String", desc: "연결된 프로젝트 ID", pii: false },
      { col: "respondent_hash", type: "String", desc: "응답자 해시 (익명)", pii: false },
      { col: "question_id", type: "String", desc: "문항 ID", pii: false },
      { col: "answer_value", type: "JSONB", desc: "응답 값 (단일/복수 선택)", pii: false },
      { col: "submitted_at", type: "DateTime", desc: "제출 일시", pii: false },
      { col: "device_type", type: "Enum", desc: "응답 기기 유형", pii: false },
    ],
  },
  {
    id: "firebase",
    name: "앱 행동 로그 (Firebase)",
    type: "SDK Integration",
    status: "Healthy" as const,
    sync: "실시간",
    signal: 90,
    icon: Zap,
    endpoint: "firebase://samsung-dt-app.firebaseio.com",
    auth: "Service Account JSON",
    schedule: "실시간 Stream",
    syncHistory: [
      { date: "2026-04-07 09:56", rows: 9820, duration: "0.1s", result: "Success" },
      { date: "2026-04-07 09:55", rows: 10140, duration: "0.1s", result: "Success" },
      { date: "2026-04-07 09:54", rows: 9600, duration: "0.1s", result: "Success" },
    ],
    schema: [
      { col: "event_id", type: "String", desc: "이벤트 고유 ID", pii: false },
      { col: "user_pseudo_id", type: "String", desc: "Firebase 익명 사용자 ID", pii: false },
      { col: "event_name", type: "String", desc: "이벤트명 (screen_view 등)", pii: false },
      { col: "event_params", type: "JSONB", desc: "이벤트 파라미터 묶음", pii: false },
      { col: "device_model", type: "String", desc: "기기 모델명", pii: false },
      { col: "os_version", type: "String", desc: "OS 버전", pii: false },
      { col: "event_timestamp", type: "Int64", desc: "이벤트 발생 타임스탬프 (μs)", pii: false },
    ],
  },
  {
    id: "membership",
    name: "삼성 멤버십 프로파일",
    type: "REST API",
    status: "Healthy" as const,
    sync: "30분 전",
    signal: 80,
    icon: Key,
    endpoint: "https://membership-api.samsung.com/v2/profiles",
    auth: "API Key",
    schedule: "30분 주기",
    syncHistory: [
      { date: "2026-04-07 09:30", rows: 52400, duration: "2m 18s", result: "Success" },
      { date: "2026-04-07 09:00", rows: 52380, duration: "2m 14s", result: "Success" },
      { date: "2026-04-07 08:30", rows: 52310, duration: "2m 22s", result: "Success" },
    ],
    schema: [
      { col: "member_id", type: "String", desc: "멤버십 ID", pii: false },
      { col: "grade", type: "Enum", desc: "등급 (Diamond/Platinum/Gold)", pii: false },
      { col: "points_balance", type: "Integer", desc: "누적 포인트", pii: false },
      { col: "owned_devices", type: "Array<String>", desc: "보유 기기 목록", pii: false },
      { col: "region_code", type: "String", desc: "거주 지역 코드", pii: false },
      { col: "join_date", type: "Date", desc: "가입일", pii: false },
    ],
  },
  {
    id: "embrain",
    name: "외부 패널 파트너 (Embrain)",
    type: "SFTP Batch",
    status: "Idle" as const,
    sync: "어제 23:00",
    signal: 60,
    icon: Package,
    endpoint: "sftp://ftp.embrain.com/samsung/",
    auth: "SSH Key",
    schedule: "매일 23:00 배치",
    syncHistory: [
      { date: "2026-04-06 23:01", rows: 8400, duration: "6m 40s", result: "Success" },
      { date: "2026-04-05 23:02", rows: 8210, duration: "6m 22s", result: "Success" },
      { date: "2026-04-04 23:00", rows: 8590, duration: "6m 55s", result: "Success" },
    ],
    schema: [
      { col: "panel_id", type: "String", desc: "패널 참여자 ID", pii: false },
      { col: "age_band", type: "Enum", desc: "연령대 (20s/30s 등)", pii: false },
      { col: "gender", type: "Enum", desc: "성별", pii: false },
      { col: "occupation_code", type: "String", desc: "직업 분류 코드", pii: false },
      { col: "monthly_income_band", type: "Enum", desc: "월소득 구간", pii: true },
      { col: "survey_ids", type: "Array<String>", desc: "참여 설문 ID 목록", pii: false },
    ],
  },
  {
    id: "criteo",
    name: "광고 반응 데이터 (Criteo)",
    type: "API Connector",
    status: "Warning" as const,
    sync: "인증 만료",
    signal: 40,
    icon: Target,
    endpoint: "https://api.criteo.com/2023-07/retail-media",
    auth: "OAuth 2.0 (만료)",
    schedule: "매시 정각",
    syncHistory: [
      { date: "2026-04-07 09:00", rows: 0, duration: "—", result: "Failed" },
      { date: "2026-04-07 08:00", rows: 0, duration: "—", result: "Failed" },
      { date: "2026-04-06 22:00", rows: 14200, duration: "1m 08s", result: "Success" },
    ],
    schema: [
      { col: "ad_id", type: "String", desc: "광고 소재 ID", pii: false },
      { col: "campaign_id", type: "String", desc: "캠페인 ID", pii: false },
      { col: "impressions", type: "Integer", desc: "노출 수", pii: false },
      { col: "clicks", type: "Integer", desc: "클릭 수", pii: false },
      { col: "conversions", type: "Integer", desc: "전환 수", pii: false },
      { col: "spend_krw", type: "Decimal", desc: "집행 비용 (원화)", pii: false },
      { col: "date", type: "Date", desc: "집계 날짜", pii: false },
    ],
  },
];

function DataSourceSection() {
  const [viewType, setViewType] = useState<"card" | "list">("card");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const healthy = DATA_SOURCES.filter((s) => s.status === "Healthy").length;
  const warning = DATA_SOURCES.filter((s) => s.status === "Warning").length;
  const idle = DATA_SOURCES.filter((s) => s.status === "Idle").length;

  return (
    <>
      <SectionTitle
        title="데이터 소스 및 스키마 커넥터"
        desc="연결된 데이터 소스의 상태를 모니터링하고, 소스별 스키마와 동기화 이력을 관리합니다."
      />
      <div className="grid grid-cols-1 gap-6">
        {/* 상태 요약 */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="전체 소스"
            value={String(DATA_SOURCES.length)}
            sub="연결 구성 완료"
            tone="neutral"
            icon={Plug}
          />
          <StatCard
            label="정상 (Healthy)"
            value={String(healthy)}
            sub="실시간 수집 중"
            tone="success"
            icon={CheckCircle2}
          />
          <StatCard
            label="경고 (Warning)"
            value={String(warning)}
            sub="즉시 조치 필요"
            tone="danger"
            icon={AlertTriangle}
          />
          <StatCard label="대기 (Idle)" value={String(idle)} sub="배치 대기 중" tone="warn" icon={Clock} />
        </div>

        {/* 뷰 타입 토글 + 액션 */}
        <SettingGroup>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-[var(--panel-soft)] p-1 rounded-xl border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setViewType("card")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-black transition-all",
                  viewType === "card"
                    ? "bg-card text-primary shadow-sm border border-[var(--border)]"
                    : "text-[var(--muted-foreground)] hover:text-foreground"
                )}
              >
                <LayoutGridIcon size={13} /> 카드형
              </button>
              <button
                type="button"
                onClick={() => setViewType("list")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-black transition-all",
                  viewType === "list"
                    ? "bg-card text-primary shadow-sm border border-[var(--border)]"
                    : "text-[var(--muted-foreground)] hover:text-foreground"
                )}
              >
                <List size={13} /> 리스트형
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[var(--muted-foreground)]">
                소스를 클릭하면 스키마와 동기화 이력을 확인할 수 있습니다
              </span>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Plus size={13} /> 소스 추가
              </Button>
            </div>
          </div>
        </SettingGroup>

        {/* 소스 목록 */}
        <SettingGroup title="연결된 데이터 소스">
          <div className={cn(viewType === "card" ? "grid grid-cols-2 gap-4" : "flex flex-col gap-2")}>
            {DATA_SOURCES.map((src) => {
              const isExpanded = expandedId === src.id;
              return (
                <div
                  key={src.id}
                  className={cn(
                    "rounded-xl border transition-all overflow-hidden",
                    isExpanded ? "border-primary/40 shadow-md" : "border-[var(--border)] hover:border-primary/30"
                  )}
                >
                  {/* 헤더 — 클릭으로 아코디언 토글 */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : src.id)}
                    className={cn(
                      "w-full text-left transition-colors",
                      viewType === "card" ? "p-5" : "px-5 py-4",
                      isExpanded ? "bg-[var(--primary-light-bg2)]" : "bg-card hover:bg-[var(--surface-hover)]"
                    )}
                  >
                    {viewType === "card" ? (
                      /* 카드형 헤더 */
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div
                            className={cn(
                              "p-2 rounded-xl border shadow-sm",
                              isExpanded
                                ? "bg-primary/10 border-primary/30 text-primary"
                                : "bg-[var(--panel-soft)] border-[var(--border)] text-primary"
                            )}
                          >
                            <src.icon size={16} />
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border",
                                src.status === "Healthy"
                                  ? "bg-green-50 text-green-600 border-green-200"
                                  : src.status === "Idle"
                                    ? "bg-[var(--panel-soft)] text-[var(--muted-foreground)] border-[var(--border)]"
                                    : "bg-red-50 text-red-600 border-red-200 animate-pulse"
                              )}
                            >
                              {src.status}
                            </div>
                            <ChevronDown
                              size={14}
                              className={cn(
                                "text-[var(--muted-foreground)] transition-transform",
                                isExpanded && "rotate-180"
                              )}
                            />
                          </div>
                        </div>
                        <p className="text-[14px] font-black text-foreground">{src.name}</p>
                        <p className="text-[10px] font-bold text-[var(--muted-foreground)] mt-0.5 mb-4">{src.type}</p>
                        <div className="pt-3 border-t border-[var(--border)] flex justify-between items-center text-[10px]">
                          <span className="font-bold text-[var(--muted-foreground)] flex items-center gap-1.5">
                            <Clock size={11} /> {src.sync}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "w-1 h-2.5 rounded-full",
                                  i < Math.round(src.signal / 20) ? "bg-primary" : "bg-[var(--border)]"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* 리스트형 헤더 */
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "p-1.5 rounded-lg border shrink-0",
                            isExpanded
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "bg-[var(--panel-soft)] border-[var(--border)] text-primary"
                          )}
                        >
                          <src.icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-black text-foreground">{src.name}</p>
                          <p className="text-[10px] font-bold text-[var(--muted-foreground)]">{src.type}</p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-[11px] font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                            <Clock size={10} /> {src.sync}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "w-1 h-2 rounded-full",
                                  i < Math.round(src.signal / 20) ? "bg-primary" : "bg-[var(--border)]"
                                )}
                              />
                            ))}
                          </div>
                          <div
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[9px] font-black uppercase border",
                              src.status === "Healthy"
                                ? "bg-green-50 text-green-600 border-green-200"
                                : src.status === "Idle"
                                  ? "bg-[var(--panel-soft)] text-[var(--muted-foreground)] border-[var(--border)]"
                                  : "bg-red-50 text-red-600 border-red-200 animate-pulse"
                            )}
                          >
                            {src.status}
                          </div>
                          <ChevronDown
                            size={13}
                            className={cn(
                              "text-[var(--muted-foreground)] transition-transform",
                              isExpanded && "rotate-180"
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </button>

                  {/* 아코디언 확장 영역 */}
                  {isExpanded && (
                    <div className="border-t border-primary/20 bg-card px-5 pb-5 pt-4 space-y-5">
                      {/* 연결 정보 */}
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-3 flex items-center gap-1.5">
                          <Info size={10} /> 연결 정보
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: "Endpoint", value: src.endpoint },
                            { label: "Auth", value: src.auth },
                            { label: "동기 주기", value: src.schedule },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className="rounded-lg bg-[var(--panel-soft)] border border-[var(--border)] px-3 py-2.5"
                            >
                              <p className="text-[9px] font-black uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
                                {item.label}
                              </p>
                              <p
                                className={cn(
                                  "font-bold truncate",
                                  item.label === "Endpoint"
                                    ? "text-[11px] font-mono text-primary"
                                    : "text-[12px] text-foreground"
                                )}
                              >
                                {item.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 최근 동기 이력 */}
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-3 flex items-center gap-1.5">
                          <RefreshCw size={10} /> 최근 동기화 이력
                        </p>
                        <div className="overflow-hidden rounded-lg border border-[var(--border)]">
                          <table className="w-full text-left text-[12px]">
                            <thead className="bg-[var(--panel-soft)] border-b border-[var(--border)]">
                              <tr>
                                {["일시", "처리 행수", "소요 시간", "결과"].map((h) => (
                                  <th
                                    key={h}
                                    className="px-3 py-2 font-black text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]"
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)] bg-card">
                              {src.syncHistory.map((h, i) => (
                                <tr key={i} className="hover:bg-[var(--surface-hover)]">
                                  <td className="px-3 py-2 font-bold text-[var(--muted-foreground)] whitespace-nowrap">
                                    {h.date}
                                  </td>
                                  <td className="px-3 py-2 font-black text-foreground">
                                    {h.rows > 0 ? h.rows.toLocaleString() : "—"}
                                  </td>
                                  <td className="px-3 py-2 font-mono text-[var(--secondary-foreground)]">
                                    {h.duration}
                                  </td>
                                  <td className="px-3 py-2">
                                    <span
                                      className={cn(
                                        "px-2 py-0.5 rounded-md text-[10px] font-black border",
                                        h.result === "Success"
                                          ? "bg-green-50 text-green-600 border-green-200"
                                          : "bg-red-50 text-red-600 border-red-200"
                                      )}
                                    >
                                      {h.result}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* 스키마 뷰어 */}
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-3 flex items-center gap-1.5">
                          <TableProperties size={10} /> 스키마 필드 ({src.schema.length}개)
                        </p>
                        <div className="overflow-hidden rounded-lg border border-[var(--border)]">
                          <table className="w-full text-left text-[12px]">
                            <thead className="bg-[var(--panel-soft)] border-b border-[var(--border)]">
                              <tr>
                                {["Field Name", "Type", "Description", "PII"].map((h) => (
                                  <th
                                    key={h}
                                    className="px-3 py-2 font-black text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]"
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)] bg-card">
                              {src.schema.map((row) => (
                                <tr key={row.col} className="hover:bg-[var(--surface-hover)]">
                                  <td className="px-3 py-2.5 font-mono font-bold text-primary">{row.col}</td>
                                  <td className="px-3 py-2.5 font-semibold text-[var(--muted-foreground)]">
                                    {row.type}
                                  </td>
                                  <td className="px-3 py-2.5 font-medium text-[var(--secondary-foreground)]">
                                    {row.desc}
                                  </td>
                                  <td className="px-3 py-2.5">
                                    {row.pii && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                                        <AlertTriangle size={9} /> PII
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex items-center gap-2 pt-1 border-t border-[var(--border)]">
                        <Button variant="outline" size="sm" className="gap-1.5 text-[11px]">
                          <RefreshCw size={12} /> 연결 테스트
                        </Button>
                        {src.status === "Warning" && (
                          <Button size="sm" className="gap-1.5 text-[11px]">
                            <Plug size={12} /> 인증 재설정
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-[11px] text-[var(--muted-foreground)]"
                        >
                          설정 수정
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SettingGroup>
      </div>
    </>
  );
}

function PromptSettingsSection() {
  const [selectedPromptType, setSelectedPromptType] = useState<(typeof PROMPT_PRESETS)[number]["id"]>("survey");
  const [prompt, setPrompt] = useState("");
  const [savedPrompt, setSavedPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [savedLlm, setSavedLlm] = useState({ temperature: 0.7, top_p: 0.9 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      setErrorMessage(null);
      const [promptResponse, llmResponse] = await Promise.all([
        settingsApi.getPrompt(selectedPromptType),
        settingsApi.getLlmParameters(),
      ]);

      if (!promptResponse) {
        setErrorMessage("설정 정보를 불러오지 못했습니다.");
      } else {
        setPrompt(promptResponse.prompt);
        setSavedPrompt(promptResponse.prompt);
      }

      if (llmResponse) {
        setTemperature(llmResponse.temperature);
        setTopP(llmResponse.top_p);
        setSavedLlm(llmResponse);
      }
      setLoading(false);
    };

    loadSettings();
  }, [selectedPromptType]);

  const resetCurrent = () => {
    setPrompt(savedPrompt || DEFAULT_PROMPT_TEXT[selectedPromptType]);
    setTemperature(savedLlm.temperature);
    setTopP(savedLlm.top_p);
    setStatusMessage("마지막 저장 상태로 되돌렸습니다.");
    setErrorMessage(null);
  };

  const saveCurrent = async () => {
    setSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    const [promptResponse, llmResponse] = await Promise.all([
      settingsApi.savePrompt(selectedPromptType, prompt),
      settingsApi.saveLlmParameters({ temperature, top_p: topP }),
    ]);

    if (!promptResponse || !llmResponse) {
      setErrorMessage("일부 설정 저장에 실패했습니다.");
      setSaving(false);
      return;
    }

    setSavedPrompt(promptResponse.prompt);
    setSavedLlm(llmResponse);
    setStatusMessage("프롬프트와 LLM 파라미터를 저장했습니다.");
    setSaving(false);
  };

  return (
    <>
      <SectionTitle
        title="시스템 프롬프트 설정 및 버전 관리"
        desc="리서치 템플릿별 AI 시스템 프롬프트를 설정하고, 배포된 버전 이력을 관리합니다."
      />

      <div className="grid grid-cols-1 gap-6">
        <SettingGroup title="엔진 성능 대시보드">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "평균 응답 속도", value: "1.2s", color: "text-green-500", bg: "bg-green-50" },
              { label: "분석 정확도(QA)", value: "98.4%", color: "text-primary", bg: "bg-[var(--primary-light-bg)]" },
              { label: "토큰 효율성", value: "92%", color: "text-amber-500", bg: "bg-amber-50" },
              {
                label: "실패율",
                value: "0.02%",
                color: "text-[var(--muted-foreground)]",
                bg: "bg-[var(--panel-soft)]",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={cn("p-5 rounded-xl border border-[var(--border)] text-center shadow-sm", s.bg)}
              >
                <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-2">
                  {s.label}
                </p>
                <p className={cn("text-2xl font-black tracking-tight", s.color)}>{s.value}</p>
              </div>
            ))}
          </div>
        </SettingGroup>

        <SettingGroup title="분석 지시문(Prompt) 파인튜닝">
          <div className="mb-5 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {PROMPT_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                variant={preset.id === selectedPromptType ? "default" : "outline"}
                size="sm"
                className="shrink-0 gap-2"
                onClick={() => setSelectedPromptType(preset.id)}
              >
                <preset.icon size={14} /> {preset.label}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-black text-foreground">시스템 프롬프트 (System Prompt)</span>
              <span className="bg-[var(--panel-soft)] px-2 py-0.5 text-[11px] font-black uppercase tracking-tighter text-[var(--muted-foreground)] rounded-md border border-[var(--border)]">
                {selectedPromptType}
              </span>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              className="w-full bg-card border border-[var(--border)] rounded-xl px-4 py-3 h-64 font-mono text-[13px] outline-none focus:border-primary transition-colors text-foreground placeholder:text-[var(--subtle-foreground)] leading-relaxed disabled:opacity-60"
            />

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                  temperature
                </label>
                <div className="rounded-xl border border-[var(--border)] bg-card px-4 py-3">
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="mt-2 text-[12px] font-black text-primary">{temperature.toFixed(1)}</div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                  top_p
                </label>
                <div className="rounded-xl border border-[var(--border)] bg-card px-4 py-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={topP}
                    onChange={(e) => setTopP(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="mt-2 text-[12px] font-black text-primary">{topP.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {statusMessage ? (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[12px] font-bold text-green-700">
                {statusMessage}
              </div>
            ) : null}
            {errorMessage ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] font-bold text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={resetCurrent} disabled={loading || saving}>
                <RotateCcw size={14} /> 초기화
              </Button>
              <Button size="sm" className="gap-2" onClick={saveCurrent} disabled={loading || saving || !prompt.trim()}>
                <Save size={14} /> {saving ? "저장 중..." : "변경사항 적용"}
              </Button>
            </div>
          </div>
        </SettingGroup>

        <SettingGroup title="프롬프트 버전 히스토리">
          <div className="space-y-3">
            {[
              {
                version: "live",
                label: "Current",
                date: "실시간 조회",
                author: "backend settings API",
                changes: "현재 저장된 프롬프트와 LLM 파라미터가 적용됩니다.",
                active: true,
              },
              {
                version: "fallback",
                label: "Default",
                date: "코드 기본값",
                author: "app/core/defaults.py",
                changes: "서버 저장값이 없을 때 기본 프롬프트와 기본 LLM 파라미터를 사용합니다.",
                active: false,
              },
            ].map((v) => (
              <div
                key={v.version}
                className={cn(
                  "p-5 rounded-xl border transition-all",
                  v.active
                    ? "bg-[#eef3ff] border-primary/30"
                    : "bg-card border-[var(--border)] hover:border-[var(--border-hover)]"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[13px] font-black text-foreground">{v.version}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-black uppercase tracking-wider",
                        v.active ? "text-primary border-primary/40 bg-white" : "text-[var(--muted-foreground)]"
                      )}
                    >
                      {v.label}
                    </Badge>
                    {v.active && (
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> 현재 적용 중
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[12px] font-medium text-[var(--secondary-foreground)] leading-relaxed mb-3">
                  {v.changes}
                </p>
                <div className="flex items-center gap-4 text-[10px] font-bold text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> {v.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={10} /> {v.author}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SettingGroup>
      </div>
    </>
  );
}

/* ─── 섹션 콘텐츠 ─── */
const CONTENT: Record<string, React.ReactNode> = {
  projects: (
    <>
      <SectionTitle
        title="리서치 프로젝트 마스터 뷰"
        desc="전사적으로 진행 중인 전체 설문 리서치 프로젝트 현황과 연결된 데이터 소스를 한눈에 관리합니다."
      />
      <div className="grid grid-cols-1 gap-6">
        {/* 요약 스탯 */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="전체 프로젝트" value="14" sub="이번 분기 기준" tone="neutral" icon={Briefcase} />
          <StatCard label="진행중" value="5" sub="응답 수집 중" tone="primary" icon={Activity} />
          <StatCard label="분석중" value="4" sub="AI 처리 완료" tone="success" icon={BarChart} />
          <StatCard label="대기 / 일시정지" value="5" sub="시작 전 또는 보류" tone="warn" icon={Clock} />
        </div>

        {/* 필터 바 */}
        <SettingGroup>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-[var(--panel-soft)] px-4 py-2.5 rounded-xl border border-[var(--border)] focus-within:border-primary focus-within:bg-card transition-all">
              <Search size={14} className="text-[var(--subtle-foreground)] shrink-0" />
              <input
                className="bg-transparent border-none outline-none text-[13px] font-bold w-full text-foreground placeholder:text-[var(--subtle-foreground)] placeholder:font-medium"
                placeholder="프로젝트명, 담당자, 소스 키워드 검색..."
              />
            </div>
            {["전체", "진행중", "분석중", "완료", "대기"].map((chip) => (
              <button
                key={chip}
                type="button"
                className={cn(
                  "px-3 py-2 rounded-lg text-[12px] font-black border transition-all",
                  chip === "전체"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-[var(--secondary-foreground)] border-[var(--border)] hover:border-primary/40 hover:text-primary"
                )}
              >
                {chip}
              </button>
            ))}
            <Button variant="outline" size="sm" className="gap-1.5 ml-auto">
              <Plus size={13} /> 프로젝트 등록
            </Button>
          </div>
        </SettingGroup>

        {/* 프로젝트 목록 */}
        <SettingGroup title="프로젝트별 데이터 매핑 현황">
          <div className="space-y-4">
            {[
              {
                name: "Galaxy S26 컨셉 테스트",
                status: "진행중",
                owner: "이동훈",
                team: 5,
                sources: ["CRM API", "오프라인 설문 DB"],
                progress: 67,
                personas: 240,
                aiStatus: "생성 완료",
                updated: "방금 전",
                deadline: "2026-04-30",
              },
              {
                name: "MZ세대 스마트폰 Usage 조사",
                status: "분석중",
                owner: "김민준",
                team: 3,
                sources: ["소셜 리뷰 Webhook", "앱 행동 로그"],
                progress: 100,
                personas: 512,
                aiStatus: "리포트 생성 중",
                updated: "2시간 전",
                deadline: "2026-04-15",
              },
              {
                name: "글로벌 브랜드 인지도 Q1",
                status: "대기",
                owner: "이서연",
                team: 4,
                sources: ["글로벌 POS 데이터"],
                progress: 0,
                personas: 0,
                aiStatus: "시작 전",
                updated: "어제",
                deadline: "2026-05-20",
              },
              {
                name: "프리미엄 사용자 재구매 의향 분석",
                status: "진행중",
                owner: "박지호",
                team: 2,
                sources: ["삼성 멤버십 프로파일", "CRM API"],
                progress: 42,
                personas: 180,
                aiStatus: "생성 완료",
                updated: "3시간 전",
                deadline: "2026-04-28",
              },
              {
                name: "Z세대 갤럭시 버즈 인식 조사",
                status: "완료",
                owner: "최예은",
                team: 3,
                sources: ["소셜 미디어 리뷰", "고객 설문 응답 DB"],
                progress: 100,
                personas: 320,
                aiStatus: "리포트 배포 완료",
                updated: "3일 전",
                deadline: "2026-03-31",
              },
            ].map((p) => (
              <div
                key={p.name}
                className="p-5 rounded-xl bg-[var(--panel-soft)] border border-[var(--border)] hover:border-primary/40 transition-all shadow-sm group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-card border border-[var(--border)] shadow-sm group-hover:border-primary/30 transition-colors">
                      <Briefcase size={15} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-[14px] font-black text-foreground leading-tight">{p.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[11px] font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                          <UserCheck size={10} /> {p.owner}
                        </span>
                        <span className="text-[11px] font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                          <Users size={10} /> {p.team}명
                        </span>
                        <span className="text-[11px] font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                          <Calendar size={10} /> {p.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border",
                        p.status === "진행중" && "bg-blue-50/60 text-blue-600 border-blue-200",
                        p.status === "분석중" && "bg-emerald-50/60 text-emerald-600 border-emerald-200",
                        p.status === "완료" &&
                          "bg-[var(--panel-soft)] text-[var(--muted-foreground)] border-[var(--border)]",
                        p.status === "대기" && "bg-amber-50/60 text-amber-600 border-amber-200"
                      )}
                    >
                      {p.status}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-[var(--subtle-foreground)] group-hover:text-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-lg bg-card border border-[var(--border)] px-3 py-2 text-center shadow-sm">
                    <p className="text-[18px] font-black text-foreground">{p.personas.toLocaleString()}</p>
                    <p className="text-[9px] font-black uppercase tracking-wider text-[var(--muted-foreground)]">
                      페르소나
                    </p>
                  </div>
                  <div className="rounded-lg bg-card border border-[var(--border)] px-3 py-2 text-center shadow-sm">
                    <p className="text-[14px] font-black text-foreground truncate">{p.aiStatus}</p>
                    <p className="text-[9px] font-black uppercase tracking-wider text-[var(--muted-foreground)]">
                      AI 상태
                    </p>
                  </div>
                  <div className="rounded-lg bg-card border border-[var(--border)] px-3 py-2 text-center shadow-sm">
                    <p className="text-[14px] font-black text-foreground">{p.updated}</p>
                    <p className="text-[9px] font-black uppercase tracking-wider text-[var(--muted-foreground)]">
                      최근 갱신
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <Network size={11} className="text-[var(--subtle-foreground)] shrink-0" />
                  {p.sources.map((src) => (
                    <span
                      key={src}
                      className="px-2 py-0.5 bg-card border border-[var(--border)] rounded-md text-[10px] font-semibold text-[var(--secondary-foreground)] shadow-sm"
                    >
                      {src}
                    </span>
                  ))}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-wider">
                    <span>응답 수집 진행률</span>
                    <span>{p.progress}%</span>
                  </div>
                  <div className="h-2 bg-card rounded-full overflow-hidden border border-[var(--border)]/50">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        p.progress === 100 ? "bg-emerald-500" : "bg-primary"
                      )}
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SettingGroup>
      </div>
    </>
  ),
  datasrc: <DataSourceSection />,
  users: (
    <>
      <SectionTitle
        title="사용자 및 권한 제어 (Data Access)"
        desc="운영자/분석가/뷰어 등 역할별 상세 접근 권한 및 민감 데이터 열람 통제 정책을 관리합니다."
      />
      <div className="grid grid-cols-1 gap-6">
        <SettingGroup title="계정 현황">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "전체 사용자", value: "31", sub: "+2 이번 달" },
              { label: "활성 세션", value: "8", sub: "현재 접속 중" },
              { label: "2FA 미설정", value: "12", sub: "조치 필요", warn: true },
              { label: "휴면 계정 (90d+)", value: "3", sub: "비활성화 권고", warn: true },
            ].map((s) => (
              <div
                key={s.label}
                className={cn(
                  "p-5 rounded-xl border text-center shadow-sm",
                  s.warn ? "bg-red-50/40 border-red-100" : "bg-[var(--panel-soft)] border-[var(--border)]"
                )}
              >
                <p
                  className={cn("text-3xl font-black leading-none mb-1.5", s.warn ? "text-red-500" : "text-foreground")}
                >
                  {s.value}
                </p>
                <p className="text-[11px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">
                  {s.label}
                </p>
                <p
                  className={cn(
                    "text-[10px] font-bold mt-1",
                    s.warn ? "text-red-400" : "text-[var(--subtle-foreground)]"
                  )}
                >
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        </SettingGroup>

        <SettingGroup title="사용자 목록">
          <div className="flex items-center gap-2 mb-4 bg-[var(--panel-soft)] px-4 py-3 rounded-xl border border-[var(--border)] focus-within:border-primary focus-within:bg-card transition-all">
            <Search size={15} className="text-[var(--subtle-foreground)]" />
            <input
              className="bg-transparent border-none outline-none text-[13px] font-bold w-full text-foreground placeholder:text-[var(--subtle-foreground)] placeholder:font-medium"
              placeholder="이름, 이메일, 역할 검색..."
            />
          </div>
          <div className="overflow-hidden rounded-xl border border-[var(--border)] shadow-sm">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-[var(--panel-soft)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-5 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-widest">
                    사용자
                  </th>
                  <th className="px-5 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-widest">
                    역할
                  </th>
                  <th className="px-5 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-widest">
                    부서
                  </th>
                  <th className="px-5 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-widest">
                    최근 접속
                  </th>
                  <th className="px-5 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-widest text-center">
                    2FA
                  </th>
                  <th className="px-5 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-widest text-right">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-card">
                {[
                  {
                    name: "이동훈",
                    email: "dh.lee@samsung.com",
                    role: "운영자",
                    dept: "CX 전략팀",
                    lastAccess: "방금 전",
                    mfa: true,
                  },
                  {
                    name: "김민준",
                    email: "mj.kim@samsung.com",
                    role: "분석가",
                    dept: "삼성 리서치",
                    lastAccess: "1시간 전",
                    mfa: true,
                  },
                  {
                    name: "이서연",
                    email: "sy.lee@samsung.com",
                    role: "분석가",
                    dept: "MX 마케팅실",
                    lastAccess: "3시간 전",
                    mfa: false,
                  },
                  {
                    name: "박지호",
                    email: "jh.park@samsung.com",
                    role: "뷰어",
                    dept: "글로벌 전략팀",
                    lastAccess: "어제",
                    mfa: false,
                  },
                  {
                    name: "최예은",
                    email: "ye.choi@samsung.com",
                    role: "뷰어",
                    dept: "영남 지역 본부",
                    lastAccess: "2일 전",
                    mfa: true,
                  },
                  {
                    name: "정태양",
                    email: "ty.jung@samsung.com",
                    role: "분석가",
                    dept: "삼성 리서치",
                    lastAccess: "5일 전",
                    mfa: false,
                  },
                ].map((u) => (
                  <tr key={u.email} className="hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-black text-foreground text-[13px]">{u.name}</p>
                      <p className="font-medium text-[var(--muted-foreground)] text-[11px]">{u.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-black text-[10px]",
                          u.role === "운영자" ? "text-primary border-primary/30 bg-[#eef3ff]" : ""
                        )}
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[var(--secondary-foreground)] text-[12px]">{u.dept}</td>
                    <td className="px-5 py-3.5 font-bold text-[var(--muted-foreground)] text-[12px] flex items-center gap-1.5">
                      <Clock size={11} /> {u.lastAccess}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {u.mfa ? (
                        <div className="inline-flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                          <CheckCircle2 size={10} /> ON
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 text-[10px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <AlertTriangle size={10} /> OFF
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button variant="outline" size="sm" className="text-[11px] h-7 px-3">
                        권한 수정
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-[12px] font-bold text-[var(--muted-foreground)]">총 6명 표시 중 (전체 31명)</span>
            <Button size="sm" className="gap-2">
              <Users size={14} /> 사용자 초대
            </Button>
          </div>
        </SettingGroup>

        <SettingGroup title="역할별 권한 매트릭스">
          <div className="overflow-hidden rounded-xl border border-[var(--border)] overflow-x-auto shadow-sm">
            <table className="w-full text-left text-[12px] min-w-[600px]">
              <thead className="bg-[var(--panel-soft)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-5 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-widest">
                    권한 항목
                  </th>
                  <th className="px-5 py-3.5 font-black text-center text-primary">운영자</th>
                  <th className="px-5 py-3.5 font-black text-center text-foreground">분석가</th>
                  <th className="px-5 py-3.5 font-black text-center text-[var(--muted-foreground)]">뷰어</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-card">
                {[
                  { key: "admin", label: "시스템 설정 및 사용자 관리" },
                  { key: "analyze", label: "분석 워크플로우 실행/수정" },
                  { key: "report", label: "리포트 생성 및 배포" },
                  { key: "pii", label: "민감 데이터(PII) 원본 열람" },
                  { key: "view", label: "익명화 데이터 조회 및 다운로드" },
                ].map((row) => (
                  <tr key={row.key} className="hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="px-5 py-3.5 font-bold text-foreground">{row.label}</td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary mx-auto shadow-[0_0_8px_rgba(49,107,255,0.4)]" />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {(row.key === "analyze" || row.key === "report" || row.key === "view") && (
                        <div className="w-2.5 h-2.5 rounded-full bg-foreground mx-auto" />
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {row.key === "view" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[var(--border-strong)] mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingGroup>
      </div>
    </>
  ),
  logs: (
    <>
      <SectionTitle
        title="AI 대화 감사 로그"
        desc="사용자들이 AI 어시스턴트 및 설문 챗봇과 나눈 질의응답 이력을 조회하고 감사합니다."
      />

      <div className="grid grid-cols-1 gap-6">
        {/* 요약 스탯 */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="총 대화 요청" value="1,284" sub="전체 누적" tone="neutral" icon={MessageSquare} />
          <StatCard label="오늘 요청" value="38" sub="+12% 어제 대비" tone="primary" icon={Activity} />
          <StatCard label="평균 토큰" value="428" sub="응답 당 기준" tone="neutral" icon={Cpu} />
          <StatCard label="누적 처리 비용" value="$18.4" sub="이번 달 기준" tone="warn" icon={TrendingUp} />
        </div>

        {/* 사용자별 토큰 랭킹 */}
        <SettingGroup title="사용자별 AI 사용 현황 (이번 달)">
          <div className="space-y-3">
            {[
              { name: "이동훈", email: "dh.lee@samsung.com", requests: 184, tokens: 78420, role: "운영자" },
              { name: "김민준", email: "mj.kim@samsung.com", requests: 312, tokens: 134800, role: "분석가" },
              { name: "이서연", email: "sy.lee@samsung.com", requests: 97, tokens: 41200, role: "분석가" },
              { name: "박지호", email: "jh.park@samsung.com", requests: 56, tokens: 23900, role: "뷰어" },
              { name: "정태양", email: "ty.jung@samsung.com", requests: 241, tokens: 103600, role: "분석가" },
            ].map((u, i) => {
              const maxTokens = 134800;
              const pct = Math.round((u.tokens / maxTokens) * 100);
              return (
                <div key={u.email} className="flex items-center gap-4">
                  <span className="w-5 text-[12px] font-black text-[var(--muted-foreground)] text-right shrink-0">
                    {i + 1}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[var(--panel-soft)] border border-[var(--border)] flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-black text-primary">{u.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-black text-foreground">{u.name}</span>
                        <Badge variant="outline" className="text-[9px] font-black px-1.5">
                          {u.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-bold text-[var(--muted-foreground)] shrink-0">
                        <span>{u.requests}건</span>
                        <span className="font-mono text-primary">{u.tokens.toLocaleString()} tok</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-[var(--panel-soft)] rounded-full overflow-hidden border border-[var(--border)]/50">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SettingGroup>

        <SettingGroup title="대화 로그">
          {/* 필터 바 */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-[var(--panel-soft)] px-4 py-2.5 rounded-xl border border-[var(--border)] focus-within:border-primary focus-within:bg-card transition-all">
              <Search size={14} className="text-[var(--subtle-foreground)] shrink-0" />
              <input
                className="bg-transparent border-none outline-none text-[13px] font-bold w-full text-foreground placeholder:text-[var(--subtle-foreground)] placeholder:font-medium"
                placeholder="사용자, 리서치명, 프롬프트 키워드 검색..."
              />
            </div>
            <select className="bg-card border border-[var(--border)] rounded-xl px-3 h-[42px] text-[12px] font-bold text-foreground outline-none focus:border-primary shadow-sm shrink-0">
              <option>전체 사용자</option>
              <option>dh.lee@samsung.com</option>
              <option>mj.kim@samsung.com</option>
              <option>sy.lee@samsung.com</option>
            </select>
            <select className="bg-card border border-[var(--border)] rounded-xl px-3 h-[42px] text-[12px] font-bold text-foreground outline-none focus:border-primary shadow-sm shrink-0">
              <option>전체 기간</option>
              <option>오늘</option>
              <option>최근 7일</option>
              <option>최근 30일</option>
            </select>
          </div>

          {/* 테이블 */}
          <div className="overflow-hidden rounded-xl border border-[var(--border)] shadow-sm overflow-x-auto">
            <table className="w-full text-left text-[12px] min-w-[900px]">
              <thead className="bg-[var(--panel-soft)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-4 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-wider">
                    사용자
                  </th>
                  <th className="px-4 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-wider">
                    리서치명
                  </th>
                  <th className="px-4 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-wider">
                    프롬프트
                  </th>
                  <th className="px-4 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-wider">
                    AI 답변 요약
                  </th>
                  <th className="px-4 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-wider text-center">
                    토큰
                  </th>
                  <th className="px-4 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-wider">
                    생성일시
                  </th>
                  <th className="px-4 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-wider text-center">
                    상세
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-card">
                {[
                  {
                    user: "이동훈",
                    email: "dh.lee@samsung.com",
                    research: "Galaxy S26 컨셉 테스트",
                    prompt: "기존 3번 문항을 MZ 세대 톤앤매너로 수정해줘.",
                    answer: '"S26, 너의 다음 레벨" 형태로 감성 중심 문항 3개 제안. 구어체 + 이모지 옵션 포함.',
                    tokens: 142,
                    date: "2026-03-15 09:12",
                    page: "/survey",
                  },
                  {
                    user: "김민준",
                    email: "mj.kim@samsung.com",
                    research: "MZ세대 스마트폰 Usage 조사",
                    prompt: "현재 필터링된 그룹에서 20대 여성의 가장 큰 불만 요인은 뭐야?",
                    answer: "배터리 수명(38%), 카메라 야간 성능(27%), 무게(18%) 순으로 불만 집중. 세부 코멘트 첨부.",
                    tokens: 890,
                    date: "2026-03-15 08:31",
                    page: "/analytics",
                  },
                  {
                    user: "이서연",
                    email: "sy.lee@samsung.com",
                    research: "글로벌 브랜드 인지도 Q1",
                    prompt: "이 리포트의 결론을 3줄로 요약해서 임원 보고용으로 만들어줘.",
                    answer:
                      "① 국내 MZ 브랜드 선호도 +4.2%p ② 북미 시장 갤럭시 인지도 72% ③ 카메라·AI 기능이 핵심 구매 트리거.",
                    tokens: 1250,
                    date: "2026-03-14 17:45",
                    page: "/report",
                  },
                  {
                    user: "박지호",
                    email: "jh.park@samsung.com",
                    research: "Galaxy S26 컨셉 테스트",
                    prompt: "프리미엄 구매자 세그먼트의 가격 저항선은 얼마야?",
                    answer:
                      "150만원 이하 응답 61%, 180만원 이하 84%. 고사양 카메라 번들 시 10~15만원 추가 지불 의향 확인.",
                    tokens: 540,
                    date: "2026-03-14 14:20",
                    page: "/analytics",
                  },
                  {
                    user: "정태양",
                    email: "ty.jung@samsung.com",
                    research: "MZ세대 스마트폰 Usage 조사",
                    prompt: "게이밍 성향군 응답자들이 가장 많이 언급한 기능 키워드 뽑아줘.",
                    answer:
                      "게임 성능(52%), 발열 관리(44%), 화면 주사율(39%), 배터리(35%), 냉각 시스템(28%) 순으로 추출.",
                    tokens: 317,
                    date: "2026-03-13 11:05",
                    page: "/analytics",
                  },
                ].map((log, i) => (
                  <tr key={i} className="hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="px-4 py-4">
                      <p className="font-black text-foreground text-[13px]">{log.user}</p>
                      <p className="font-medium text-[var(--muted-foreground)] text-[10px]">{log.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-[var(--secondary-foreground)] text-[12px] leading-snug">
                        {log.research}
                      </span>
                    </td>
                    <td className="px-4 py-4 max-w-[200px]">
                      <p className="font-medium text-[var(--secondary-foreground)] text-[12px] leading-snug line-clamp-2 italic">
                        "{log.prompt}"
                      </p>
                    </td>
                    <td className="px-4 py-4 max-w-[220px]">
                      <p className="font-medium text-[var(--muted-foreground)] text-[12px] leading-snug line-clamp-2">
                        {log.answer}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-mono font-black text-[12px] text-primary">
                        {log.tokens.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-[var(--muted-foreground)] text-[12px] whitespace-nowrap">
                        {log.date}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] gap-1">
                        <Eye size={12} /> 보기
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center pt-3">
            <span className="text-[12px] font-bold text-[var(--muted-foreground)]">총 5건 표시 중 (전체 1,284건)</span>
            <Button variant="outline" size="sm" className="gap-2">
              <FileText size={13} /> CSV 내보내기
            </Button>
          </div>
        </SettingGroup>
      </div>
    </>
  ),
  validation: (
    <>
      <SectionTitle
        title="페르소나 검증 (CoT) 아카이브"
        desc="가상 페르소나 응답 산출 시 사용된 추론 과정(Chain of Thought) 및 품질 검증 이력을 아카이브합니다."
      />
      <div className="grid grid-cols-1 gap-6">
        {/* 요약 스탯 */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="총 검증 건수" value="8,831" sub="누적 전체" tone="neutral" icon={FlaskConical} />
          <StatCard label="Pass" value="8,614" sub="97.5% 통과율" tone="success" icon={CheckCircle2} />
          <StatCard label="Flagged" value="217" sub="재검토 필요" tone="warn" icon={AlertTriangle} />
          <StatCard label="평균 신뢰도" value="93.2" sub="/ 100 기준" tone="primary" icon={Award} />
        </div>

        {/* 신뢰도 분포 */}
        <SettingGroup title="신뢰도 구간 분포">
          <div className="space-y-3">
            {[
              { label: "95 ~ 100 (우수)", count: 5820, total: 8831, color: "bg-emerald-500" },
              { label: "80 ~ 94 (양호)", count: 2794, total: 8831, color: "bg-primary" },
              { label: "60 ~ 79 (보통)", count: 147, total: 8831, color: "bg-amber-400" },
              { label: "0 ~ 59 (위험 — Flagged)", count: 70, total: 8831, color: "bg-red-500" },
            ].map((band) => {
              const pct = Math.round((band.count / band.total) * 100);
              return (
                <div key={band.label} className="flex items-center gap-4">
                  <span className="w-48 text-[11px] font-bold text-[var(--secondary-foreground)] shrink-0">
                    {band.label}
                  </span>
                  <div className="flex-1 h-2.5 bg-[var(--panel-soft)] rounded-full overflow-hidden border border-[var(--border)]/50">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", band.color)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-20 text-right text-[11px] font-black text-[var(--muted-foreground)] shrink-0">
                    {band.count.toLocaleString()}건 ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </SettingGroup>

        {/* 검증 로그 */}
        <SettingGroup title="응답 무결성 검증 로그">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="flex-1 min-w-[160px] flex items-center gap-2 bg-[var(--panel-soft)] px-4 py-2.5 rounded-xl border border-[var(--border)] focus-within:border-primary focus-within:bg-card transition-all">
              <Search size={13} className="text-[var(--subtle-foreground)] shrink-0" />
              <input
                className="bg-transparent border-none outline-none text-[12px] font-bold w-full text-foreground placeholder:text-[var(--subtle-foreground)] placeholder:font-medium"
                placeholder="페르소나 ID, 질문 키워드 검색..."
              />
            </div>
            {["전체", "Pass", "Flagged"].map((f) => (
              <button
                key={f}
                type="button"
                className={cn(
                  "px-3 py-2 rounded-lg text-[12px] font-black border transition-all",
                  f === "전체"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-[var(--secondary-foreground)] border-[var(--border)] hover:border-primary/40"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="space-y-4">
            {[
              {
                id: "VAL-8831",
                persona: "P19 (19세 / 고등학생)",
                project: "Galaxy S26 컨셉 테스트",
                q: "삼성 Knox의 엔터프라이즈 보안 솔루션이 구매에 영향을 주나요?",
                cot: "19세 고등학생 페르소나는 엔터프라이즈 보안 솔루션에 대한 실질적 경험이나 의사결정 권한이 없을 가능성 높음. 응답 신뢰도 저하 판정.",
                score: 45,
                result: "Flagged",
                date: "2026-03-13 13:50",
              },
              {
                id: "VAL-8829",
                persona: "P12 (28세 / 게임개발자)",
                project: "Galaxy S26 컨셉 테스트",
                q: "S26 카메라의 AI 보정 기능이 게임 플레이 경험에 영향을 주나요?",
                cot: "게임개발자는 GPU 성능과 발열 관리에 민감한 페르소나. 카메라 AI 기능이 시스템 자원을 점유할 경우 게임 프레임에 영향을 줄 수 있음을 인식하고 있어 응답 신뢰도 높음.",
                score: 98,
                result: "Pass",
                date: "2026-03-13 14:20",
              },
              {
                id: "VAL-8830",
                persona: "P05 (45세 / 금융컨설턴트)",
                project: "프리미엄 사용자 재구매 의향 분석",
                q: "보안 폴더의 사용 편의성에 대해 어떻게 생각하십니까?",
                cot: "금융컨설턴트는 기밀 문서 보안에 높은 관심을 가지며, 기업용 보안 솔루션 사용 경험 있을 가능성 높음. 실용적 관점에서 보안 폴더를 평가하는 응답 패턴 확인.",
                score: 95,
                result: "Pass",
                date: "2026-03-13 14:15",
              },
              {
                id: "VAL-8826",
                persona: "P33 (52세 / 소상공인)",
                project: "MZ세대 스마트폰 Usage 조사",
                q: "인스타그램 릴스 편집 기능 중 가장 자주 사용하는 AI 필터는 무엇인가요?",
                cot: "52세 소상공인 페르소나는 인스타그램 릴스 편집 세부 기능 사용 빈도가 낮을 것으로 예측됨. MZ세대 대상 조사에 고령층 페르소나 적용 여부 재검토 필요.",
                score: 62,
                result: "Flagged",
                date: "2026-03-12 16:30",
              },
              {
                id: "VAL-8824",
                persona: "P07 (34세 / UX 디자이너)",
                project: "MZ세대 스마트폰 Usage 조사",
                q: "Galaxy AI의 통화 번역 기능을 업무에서 얼마나 자주 활용하시나요?",
                cot: "UX 디자이너는 다국어 협업 도구에 대한 필요성이 있으며, 해외 클라이언트와의 소통에서 번역 기능을 활용할 구체적 맥락이 존재함. 응답 일관성 확인.",
                score: 91,
                result: "Pass",
                date: "2026-03-12 10:05",
              },
            ].map((log) => (
              <div key={log.id} className="app-card p-5 hover:border-[var(--border-hover)] transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-2.5 flex-wrap">
                    <span className="text-[10px] font-mono font-black text-[var(--subtle-foreground)] bg-[var(--panel-soft)] border border-[var(--border)] px-2 py-0.5 rounded-md shadow-sm shrink-0 mt-0.5">
                      {log.id}
                    </span>
                    <div>
                      <p className="text-[13px] font-black text-foreground">{log.persona}</p>
                      <p className="text-[10px] font-bold text-[var(--muted-foreground)] mt-0.5 flex items-center gap-1">
                        <Briefcase size={9} /> {log.project}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tight border shadow-sm shrink-0",
                      log.result === "Pass"
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-red-50 text-red-600 border-red-200 animate-pulse"
                    )}
                  >
                    {log.result === "Flagged" ? "Hallucination Risk" : log.result}
                  </span>
                </div>

                <p className="text-[13px] text-[var(--secondary-foreground)] font-medium leading-relaxed mb-3 p-3 bg-[var(--panel-soft)] rounded-lg border border-[var(--border)]">
                  <strong className="text-primary font-black mr-1.5">Q.</strong> {log.q}
                </p>

                <div className="mb-4 p-3 bg-card border border-dashed border-[var(--border)] rounded-lg">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1.5">
                    <FlaskConical size={10} /> CoT 추론 요약
                  </p>
                  <p className="text-[12px] font-medium text-[var(--secondary-foreground)] leading-relaxed">
                    {log.cot}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="text-[11px] gap-1.5">
                      <Eye size={13} /> 전체 CoT 트리
                    </Button>
                    <span className="text-[11px] font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                      <Clock size={10} /> {log.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-[var(--panel-soft)] rounded-full overflow-hidden border border-[var(--border)]/50">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          log.score >= 80 ? "bg-primary" : log.score >= 60 ? "bg-amber-400" : "bg-red-500"
                        )}
                        style={{ width: `${log.score}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-[13px] font-black tabular-nums",
                        log.score >= 80 ? "text-primary" : log.score >= 60 ? "text-amber-500" : "text-red-500"
                      )}
                    >
                      {log.score}
                    </span>
                    <span className="text-[11px] text-[var(--subtle-foreground)]">/ 100</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-[12px] font-bold text-[var(--muted-foreground)]">5건 표시 중 (전체 8,831건)</span>
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileText size={13} /> CSV 내보내기
            </Button>
          </div>
        </SettingGroup>
      </div>
    </>
  ),
  security: (
    <>
      <SectionTitle
        title="보안 및 규정 준수"
        desc="데이터 보호를 위한 SSO 연동, IP 제어, 로그인 정책 등을 설정합니다."
      />

      <div className="grid grid-cols-1 gap-6">
        <SettingGroup title="인증 보안 강화">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-xl border bg-[var(--primary-light-bg)] border-primary/30 shadow-sm cursor-pointer hover:border-primary/50 transition-colors">
                <div>
                  <p className="text-[13px] font-black text-primary">SSO 연동 활성화 (Okta/AD)</p>
                  <p className="text-[11px] font-medium text-[var(--subtle-foreground)] mt-0.5">
                    사내 통합 인증 체계 필수 사용
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
              </label>
              <label className="flex items-center justify-between p-4 rounded-xl border bg-[var(--panel-soft)] border-[var(--border)] shadow-sm cursor-pointer hover:bg-card transition-colors">
                <div>
                  <p className="text-[13px] font-black text-foreground">전체 사용자 2FA 의무화</p>
                  <p className="text-[11px] font-medium text-[var(--subtle-foreground)] mt-0.5">OTP/모바일 인증 필수</p>
                </div>
                <input type="checkbox" className="w-4 h-4" />
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-[var(--muted-foreground)] ml-1 tracking-wider">
                  암호 변경 주기
                </label>
                <select className="w-full bg-card border border-[var(--border)] rounded-xl px-4 h-[44px] text-[13px] font-bold text-foreground outline-none focus:border-primary shadow-sm">
                  <option>매 3개월</option>
                  <option>매 6개월</option>
                  <option>상시(만료 없음)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-[var(--muted-foreground)] ml-1 tracking-wider">
                  최대 동시 세션
                </label>
                <select className="w-full bg-card border border-[var(--border)] rounded-xl px-4 h-[44px] text-[13px] font-bold text-foreground outline-none focus:border-primary shadow-sm">
                  <option>1개 (중복 로그인 방지)</option>
                  <option>3개</option>
                  <option>제한 없음</option>
                </select>
              </div>
            </div>
          </div>
        </SettingGroup>

        <SettingGroup title="네트워크 및 IP 제어">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-bold text-[var(--muted-foreground)]">허용 IP 화이트리스트</p>
              <Button variant="outline" size="sm" className="text-[11px] uppercase tracking-tight gap-1.5">
                <Globe size={13} /> IP 추가
              </Button>
            </div>
            <div className="space-y-2">
              {["211.231.54.120 (사내망 — Seoul HQ)", "14.52.12.5 (IDC — Suwon)", "10.0.0.0/8 (VPN 내부망)"].map(
                (ip) => (
                  <div
                    key={ip}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--panel-soft)] border border-dashed border-[var(--border)]"
                  >
                    <span className="text-[13px] font-mono font-bold text-[var(--secondary-foreground)]">{ip}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Save size={13} className="rotate-45" />
                    </Button>
                  </div>
                )
              )}
            </div>
          </div>
        </SettingGroup>

        <div className="flex justify-end pt-2">
          <Button size="lg" className="gap-2">
            <Shield size={16} /> 보안 강화 정책 일괄 적용
          </Button>
        </div>
      </div>
    </>
  ),
  prompt: null,
  report: (
    <>
      <SectionTitle
        title="리포트 배포 및 자동화"
        desc="생성된 리포트의 정기 배포 주기와 수신 채널, 보안 워터마크 정책을 설정합니다."
      />

      <div className="grid grid-cols-1 gap-6">
        {/* 배포 현황 스탯 */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="이번 달 발송" value="142건" sub="전월 대비 +18건" tone="primary" icon={Send} />
          <StatCard label="평균 열람률" value="78.4%" sub="업계 평균 52%" tone="success" icon={Eye} />
          <StatCard label="미확인 리포트" value="9건" sub="수신 확인 대기" tone="warn" icon={AlertTriangle} />
          <StatCard label="활성 배포 룰" value="7개" sub="3채널 운영 중" tone="neutral" icon={Calendar} />
        </div>

        {/* 자동 배포 타임라인 */}
        <SettingGroup title="자동 배포 스케줄">
          <div className="space-y-3">
            {[
              {
                label: "점주용 일간 리포트",
                schedule: "매일 08:30",
                type: "Email",
                icon: Mail,
                recipients: 24,
                lastSent: "오늘 08:30",
                status: "active",
              },
              {
                label: "본사 전략 주간 보고",
                schedule: "매주 월요일 09:00",
                type: "Slack",
                icon: MessageSquare,
                recipients: 8,
                lastSent: "어제 09:00",
                status: "active",
              },
              {
                label: "글로벌 마켓 월간 요약",
                schedule: "매월 1일",
                type: "Dashboard",
                icon: Globe,
                recipients: 15,
                lastSent: "2026-04-01",
                status: "active",
              },
              {
                label: "MZ 세그먼트 인사이트 알림",
                schedule: "매주 수요일 14:00",
                type: "Email",
                icon: Mail,
                recipients: 6,
                lastSent: "3일 전",
                status: "paused",
              },
              {
                label: "글로벌 브랜드 지수 주간 리포트",
                schedule: "매주 금요일 17:00",
                type: "Slack",
                icon: MessageSquare,
                recipients: 12,
                lastSent: "2일 전",
                status: "active",
              },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-4 group">
                <div className="w-32 shrink-0 text-right">
                  <p className="text-[11px] font-black text-[var(--subtle-foreground)] leading-tight">{r.schedule}</p>
                  <p className="text-[10px] font-bold text-[var(--muted-foreground)] mt-0.5 flex items-center justify-end gap-1">
                    <Clock size={9} /> {r.lastSent}
                  </p>
                </div>
                <div className="relative flex flex-col items-center shrink-0">
                  <div
                    className={cn(
                      "w-3.5 h-3.5 rounded-full border-[3px] bg-card z-10 shadow-sm",
                      r.status === "active" ? "border-primary" : "border-[var(--border)]"
                    )}
                  />
                  <div className="absolute top-3.5 bottom-0 w-px bg-[var(--border)] -mb-3 group-last:hidden" />
                </div>
                <div
                  className={cn(
                    "flex-1 border rounded-xl p-4 hover:border-primary/30 transition-all shadow-sm",
                    r.status === "paused"
                      ? "bg-[var(--panel-soft)] border-[var(--border)] opacity-60"
                      : "bg-[var(--panel-soft)] border-[var(--border)]"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-card border border-[var(--border)] shadow-sm">
                        <r.icon size={13} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-[13px] font-black text-foreground">{r.label}</p>
                        <p className="text-[10px] font-bold text-[var(--muted-foreground)] mt-0.5 flex items-center gap-1.5">
                          <Users size={9} /> {r.recipients}명 수신
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-black border shadow-sm",
                          r.status === "active"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : "bg-[var(--panel-soft)] text-[var(--muted-foreground)] border-[var(--border)]"
                        )}
                      >
                        {r.status === "active" ? "운영중" : "일시정지"}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-card border border-[var(--border)] text-[10px] font-black text-[var(--muted-foreground)] shadow-sm">
                        {r.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Plus size={13} /> 배포 룰 추가
            </Button>
          </div>
        </SettingGroup>

        {/* 최근 발송 이력 */}
        <SettingGroup title="최근 발송 이력">
          <div className="overflow-hidden rounded-xl border border-[var(--border)] shadow-sm">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-[var(--panel-soft)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-4 py-3 font-black text-[var(--muted-foreground)] uppercase tracking-wider">
                    리포트명
                  </th>
                  <th className="px-4 py-3 font-black text-[var(--muted-foreground)] uppercase tracking-wider">채널</th>
                  <th className="px-4 py-3 font-black text-[var(--muted-foreground)] uppercase tracking-wider text-center">
                    수신자
                  </th>
                  <th className="px-4 py-3 font-black text-[var(--muted-foreground)] uppercase tracking-wider text-center">
                    열람
                  </th>
                  <th className="px-4 py-3 font-black text-[var(--muted-foreground)] uppercase tracking-wider">
                    발송일시
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-card">
                {[
                  {
                    name: "점주용 일간 리포트 #84",
                    channel: "Email",
                    recipients: 24,
                    opened: 21,
                    date: "2026-04-07 08:30",
                  },
                  {
                    name: "본사 전략 주간 보고 #18",
                    channel: "Slack",
                    recipients: 8,
                    opened: 8,
                    date: "2026-04-06 09:00",
                  },
                  {
                    name: "MZ 세그먼트 인사이트 #12",
                    channel: "Email",
                    recipients: 6,
                    opened: 4,
                    date: "2026-04-02 14:00",
                  },
                  {
                    name: "글로벌 마켓 월간 요약 #4",
                    channel: "Dashboard",
                    recipients: 15,
                    opened: 15,
                    date: "2026-04-01 00:00",
                  },
                ].map((row, i) => {
                  const openRate = Math.round((row.opened / row.recipients) * 100);
                  return (
                    <tr key={i} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="px-4 py-3 font-bold text-foreground">{row.name}</td>
                      <td className="px-4 py-3">
                        <span className="font-black text-[11px] px-2 py-0.5 rounded-md bg-[var(--panel-soft)] border border-[var(--border)]">
                          {row.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-black text-foreground">{row.recipients}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "font-black text-[12px]",
                            openRate >= 80 ? "text-emerald-600" : openRate >= 60 ? "text-amber-500" : "text-red-500"
                          )}
                        >
                          {openRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-[var(--muted-foreground)] whitespace-nowrap">
                        {row.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SettingGroup>

        <SettingGroup title="배포 보안 및 권한 설정">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              {[
                { label: "PDF 워터마크 강제 적용", checked: true },
                { label: "수신인 고유 식별 코드 삽입", checked: true },
                { label: "배포 후 7일 뒤 자동 파기", checked: true },
                { label: "미열람 건 3일 후 재발송", checked: false },
              ].map((opt) => (
                <label
                  key={opt.label}
                  className="flex items-center justify-between p-4 rounded-xl bg-[var(--panel-soft)] border border-[var(--border)] cursor-pointer hover:bg-card transition-colors"
                >
                  <span className="text-[13px] font-bold text-[var(--secondary-foreground)]">{opt.label}</span>
                  <input type="checkbox" defaultChecked={opt.checked} className="w-4 h-4 accent-primary" />
                </label>
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-[var(--muted-foreground)] ml-1 tracking-widest">
                수신 그룹 화이트리스트
              </label>
              <div className="h-[192px] bg-card border border-dashed border-[var(--border)] rounded-xl p-3 overflow-y-auto space-y-1.5 shadow-inner">
                {[
                  { name: "CX 전략팀", members: 8 },
                  { name: "본사 마케팅실", members: 12 },
                  { name: "영남 지역 본부", members: 5 },
                  { name: "글로벌 리서치센터", members: 7 },
                  { name: "삼성 리서치", members: 15 },
                ].map((team) => (
                  <div
                    key={team.name}
                    className="flex items-center justify-between px-3 py-2.5 hover:bg-[var(--surface-hover)] rounded-lg transition-colors border border-transparent hover:border-[var(--border)]"
                  >
                    <div>
                      <span className="text-[12px] font-bold text-[var(--secondary-foreground)]">{team.name}</span>
                      <span className="text-[10px] font-bold text-[var(--muted-foreground)] ml-2">
                        {team.members}명
                      </span>
                    </div>
                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 accent-primary" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SettingGroup>

        <div className="flex justify-end pt-2">
          <Button size="lg" className="gap-2">
            <Save size={16} /> 글로벌 배포 정책 저장
          </Button>
        </div>
      </div>
    </>
  ),
  seo: <SeoSettingsSection />,
  geo: <GeoSettingsSection />,
  menu: (
    <>
      <SectionTitle
        title="화면 위젯 및 대시보드 커스터마이징"
        desc="사용자별 업무 특성에 맞춰 대시보드 레이아웃과 위젯 배치를 최적화합니다."
      />

      <div className="grid grid-cols-1 gap-6">
        {/* 역할별 프리셋 */}
        <SettingGroup title="역할별 추천 구성 프리셋">
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                role: "운영자",
                icon: Shield,
                desc: "전체 프로젝트 현황, 팀 활동 로그, 시스템 경고 중심",
                widgets: ["마스터 프로젝트 뷰", "팀 활동 로그", "AI 사용 현황", "보안 알림"],
                tone: "primary" as const,
                active: true,
              },
              {
                role: "분석가",
                icon: BarChart,
                desc: "데이터 스트림, 인사이트 요약, 설문 진행 차트 중심",
                widgets: ["인사이트 요약", "실시간 응답 스트림", "페르소나 분포", "퀵 액션"],
                tone: "neutral" as const,
                active: false,
              },
              {
                role: "뷰어",
                icon: Eye,
                desc: "최신 리포트 목록, 공유된 인사이트 피드 중심",
                widgets: ["최신 리포트 목록", "공유 인사이트 피드", "공지사항"],
                tone: "neutral" as const,
                active: false,
              },
            ].map((preset) => (
              <div
                key={preset.role}
                className={cn(
                  "rounded-xl border p-5 cursor-pointer hover:border-primary/50 transition-all shadow-sm",
                  preset.active
                    ? "border-primary/30 bg-[var(--primary-light-bg)]"
                    : "border-[var(--border)] bg-[var(--panel-soft)] hover:bg-card"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        preset.active
                          ? "bg-primary/10 text-primary"
                          : "bg-card text-[var(--muted-foreground)] border border-[var(--border)]"
                      )}
                    >
                      <preset.icon size={14} />
                    </div>
                    <span className={cn("text-[14px] font-black", preset.active ? "text-primary" : "text-foreground")}>
                      {preset.role}
                    </span>
                  </div>
                  {preset.active && (
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> 현재 적용
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-medium text-[var(--secondary-foreground)] leading-relaxed mb-3">
                  {preset.desc}
                </p>
                <div className="flex flex-wrap gap-1">
                  {preset.widgets.map((w) => (
                    <span
                      key={w}
                      className="px-1.5 py-0.5 rounded bg-card border border-[var(--border)] text-[9px] font-bold text-[var(--muted-foreground)] shadow-sm"
                    >
                      {w}
                    </span>
                  ))}
                </div>
                {!preset.active && (
                  <Button variant="outline" size="sm" className="mt-4 w-full text-[11px] gap-1">
                    <Layers size={12} /> 이 프리셋 적용
                  </Button>
                )}
              </div>
            ))}
          </div>
        </SettingGroup>

        {/* 위젯 배치 미리보기 */}
        <SettingGroup title="대시보드 레이아웃 미리보기 (운영자 기준)">
          <div className="p-6 bg-[var(--panel-soft)] border-2 border-dashed border-[var(--border)] rounded-2xl">
            <div className="grid grid-cols-3 grid-rows-2 gap-3" style={{ height: 220 }}>
              <div className="col-span-2 row-span-1 bg-card border border-primary/30 rounded-xl flex items-center justify-center shadow-md relative overflow-hidden group cursor-move">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-center">
                  <BarChart size={18} className="text-primary mx-auto mb-1" />
                  <p className="text-[11px] font-black text-primary uppercase tracking-widest">마스터 프로젝트 뷰</p>
                </div>
              </div>
              <div className="col-span-1 row-span-2 bg-card border border-[var(--border)] rounded-xl flex items-center justify-center shadow-sm opacity-75 hover:opacity-100 transition-opacity cursor-move group">
                <div className="text-center">
                  <Activity
                    size={16}
                    className="text-[var(--muted-foreground)] mx-auto mb-1 group-hover:text-primary transition-colors"
                  />
                  <p className="text-[10px] font-bold text-[var(--muted-foreground)]">팀 활동 로그</p>
                </div>
              </div>
              <div className="col-span-1 row-span-1 bg-card border border-[var(--border)] rounded-xl flex items-center justify-center shadow-sm opacity-75 hover:opacity-100 transition-opacity cursor-move group">
                <div className="text-center">
                  <Zap
                    size={14}
                    className="text-[var(--muted-foreground)] mx-auto mb-1 group-hover:text-primary transition-colors"
                  />
                  <p className="text-[10px] font-bold text-[var(--muted-foreground)]">AI 사용 현황</p>
                </div>
              </div>
              <div className="col-span-1 row-span-1 bg-card border border-[var(--border)] rounded-xl flex items-center justify-center shadow-sm opacity-75 hover:opacity-100 transition-opacity cursor-move group">
                <div className="text-center">
                  <Shield
                    size={14}
                    className="text-[var(--muted-foreground)] mx-auto mb-1 group-hover:text-primary transition-colors"
                  />
                  <p className="text-[10px] font-bold text-[var(--muted-foreground)]">보안 알림</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-[11px] font-bold text-[var(--muted-foreground)] flex items-center justify-center gap-2">
              <LayoutGrid size={12} /> 드래그 앤 드롭으로 위젯 위치·크기를 조정합니다
            </p>
          </div>
        </SettingGroup>

        {/* 위젯별 노출 설정 */}
        <SettingGroup title="위젯 노출 상세 설정">
          <div className="space-y-3">
            {[
              {
                name: "마스터 프로젝트 뷰",
                desc: "전사 프로젝트 진행률 및 상태 요약",
                icon: Briefcase,
                checked: true,
                size: "Large",
              },
              {
                name: "AI 대화 사용 현황",
                desc: "사용자별 AI 요청 건수 및 토큰 소비",
                icon: Cpu,
                checked: true,
                size: "Medium",
              },
              {
                name: "팀 활동 로그",
                desc: "최근 팀원 작업·접속 이력 피드",
                icon: Activity,
                checked: true,
                size: "Medium",
              },
              {
                name: "인사이트 요약 카드",
                desc: "오늘의 핵심 발견사항 자동 요약",
                icon: Sparkles,
                checked: true,
                size: "Small",
              },
              {
                name: "실시간 응답 스트림",
                desc: "현재 수집 중인 설문 응답 실시간 피드",
                icon: Zap,
                checked: false,
                size: "Large",
              },
              {
                name: "페르소나 분포 차트",
                desc: "생성된 페르소나의 인구통계 분포 시각화",
                icon: PieChart,
                checked: false,
                size: "Medium",
              },
              {
                name: "커스텀 단축 버튼",
                desc: "자주 쓰는 기능 바로가기 (최대 5개)",
                icon: LayoutGrid,
                checked: true,
                size: "Small",
              },
              {
                name: "보안 알림 배너",
                desc: "로그인 이상·권한 변경 실시간 경고",
                icon: Shield,
                checked: true,
                size: "Small",
              },
            ].map((w) => (
              <label
                key={w.name}
                className="flex items-center gap-4 p-4 rounded-xl bg-[var(--panel-soft)] border border-[var(--border)] cursor-pointer hover:bg-card shadow-sm transition-colors group"
              >
                <div className="p-2 rounded-lg bg-card border border-[var(--border)] shadow-sm group-hover:border-primary/30 transition-colors shrink-0">
                  <w.icon
                    size={14}
                    className="text-[var(--muted-foreground)] group-hover:text-primary transition-colors"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-black text-foreground">{w.name}</p>
                  <p className="text-[11px] font-medium text-[var(--muted-foreground)] mt-0.5">{w.desc}</p>
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-card border border-[var(--border)] text-[var(--muted-foreground)] shrink-0">
                  {w.size}
                </span>
                <input type="checkbox" defaultChecked={w.checked} className="w-4 h-4 accent-primary shrink-0" />
              </label>
            ))}
          </div>
        </SettingGroup>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" size="lg" className="gap-2">
            <FileText size={16} /> 공용 템플릿으로 저장
          </Button>
          <Button size="lg" className="gap-2">
            <LayoutGrid size={16} /> 위젯 레이아웃 적용
          </Button>
        </div>
      </div>
    </>
  ),
};

/* ─── 메인 ─── */
export const SettingsPage: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const active = tab ?? "projects";

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* Sidebar Nav */}
      <nav className="hide-scrollbar w-[240px] shrink-0 overflow-y-auto border-r border-[var(--border)] bg-card px-4 py-6 shadow-[var(--shadow-sm)]">
        {NAV.map((section) => (
          <div key={section.label} className="mb-7">
            <p className="px-3 pb-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--subtle-foreground)]">
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(`/settings/${item.key}`)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                    active === item.key
                      ? "bg-[var(--primary-light-bg)] text-primary border border-[var(--primary-light-border)] font-bold"
                      : "text-[var(--secondary-foreground)] font-semibold hover:bg-[var(--surface-hover)] hover:text-foreground"
                  )}
                >
                  <item.icon
                    size={15}
                    className={
                      active === item.key
                        ? "text-primary"
                        : "text-[var(--subtle-foreground)] group-hover:text-primary transition-colors"
                    }
                  />
                  <span className="text-[13px]">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Content Area */}
      <div className="hide-scrollbar flex-1 flex flex-col overflow-hidden">
        {/* Page Header */}
        <div className="app-page-header shrink-0 flex items-end justify-between gap-8">
          <div>
            <p className="app-page-eyebrow">Enterprise Admin Console</p>
            <h1 className="app-page-title mt-1">
              전사 데이터 및 <span className="text-primary">AI 운영 통제소.</span>
            </h1>
            <p className="app-page-description">
              리서치 프로젝트 마스터 관리, 데이터 스키마 커넥터, AI 프롬프트 감사 로그 및 사용자 데이터 접근 권한을 통합
              제어합니다.
            </p>
          </div>
        </div>

        {/* Section Content */}
        <div className="hide-scrollbar flex-1 overflow-y-auto px-10 pt-8 pb-20">
          {active === "prompt" ? (
            <PromptSettingsSection />
          ) : (
            CONTENT[active] || (
              <div className="py-32 text-center text-[var(--muted-foreground)] italic font-black uppercase text-xl">
                Section Coming Soon
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
