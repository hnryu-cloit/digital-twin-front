import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Shield,
  Database,
  FileText,
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
  UserCheck,
  ChevronRight,
  Award,
  BarChart,
  Cpu,
  FlaskConical,
  ChevronDown,
  List,
  LayoutGrid as LayoutGridIcon,
  RefreshCw,
  Plug,
  Info,
  ArrowLeft,
  UserCircle,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { settingsApi } from "@/lib/api";

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
  { id: "tpl_concept_test", label: "컨셉 테스트", icon: FlaskConical, group: "survey" },
  { id: "tpl_ad_message", label: "광고 메시지 테스트", icon: Target, group: "survey" },
  { id: "tpl_usage_probe", label: "사용 습관 탐색", icon: Eye, group: "survey" },
  { id: "tpl_brand_awareness", label: "브랜드 인식 조사", icon: Award, group: "survey" },
  { id: "tpl_price_sensitivity", label: "가격 민감도 조사", icon: BarChart, group: "survey" },
  { id: "tpl_csat", label: "고객 만족도 (CSAT)", icon: UserCheck, group: "survey" },
  { id: "tpl_competitor", label: "경쟁사 비교 조사", icon: BarChart2, group: "survey" },
  { id: "simulation", label: "시뮬레이션", icon: Zap, group: "pipeline" },
  { id: "assistant", label: "어시스턴트", icon: Sparkles, group: "pipeline" },
] as const;

const DEFAULT_PROMPT_TEXT: Record<string, string> = {
  tpl_concept_test:
    "신제품 또는 기능 컨셉에 대한 첫 반응, 매력도, 구매 의향을 정량·정성으로 측정하는 설문을 생성하세요. awareness → appeal → purchase_intent → concern → open_feedback 블록 순서를 준수하세요.",
  tpl_ad_message:
    "광고 메시지의 전달력, 기억도, 구매 의향 변화를 측정하는 설문을 생성하세요. message_clarity → memorability → intent_shift → improvement_area 블록을 포함하세요.",
  tpl_usage_probe:
    "실제 사용 맥락과 불편 요소, 향후 니즈를 탐색하는 설문을 생성하세요. usage_context → pain_point → future_need 블록을 중심으로 구성하세요.",
  tpl_brand_awareness:
    "브랜드 인지도, 연상 이미지, 경쟁 대비 포지셔닝을 측정하는 설문을 생성하세요. spontaneous awareness → aided recall → brand association → competitive positioning 순서로 구성하세요.",
  tpl_price_sensitivity:
    "응답자의 가격 수용 범위와 WTP(지불 의향)를 Van Westendorp 또는 직접 질문 방식으로 측정하는 설문을 생성하세요.",
  tpl_csat:
    "현재 제품·서비스 경험에 대한 전반적 만족도(CSAT)와 재구매 의향, 개선 우선순위를 수집하는 설문을 생성하세요. NPS 문항을 포함할 수 있습니다.",
  tpl_competitor:
    "자사 제품과 주요 경쟁사를 비교 평가하는 설문을 생성하세요. 인지도, 사용 경험, 선호 요인, 전환 의향을 포함하세요.",
  simulation:
    "Respond as a digital twin persona that authentically reflects the given demographic and psychographic profile. Base all answers on the persona's background, values, and usage context.",
  assistant:
    "Answer research questions with evidence and analytical confidence. Provide structured insights grounded in the available data.",
};

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
  const accent = {
    neutral: "border-l-[var(--border-strong)]",
    primary: "border-l-primary",
    warn: "border-l-[var(--warning)]",
    danger: "border-l-[var(--destructive)]",
    success: "border-l-[var(--success)]",
  }[tone];

  const valueColor = {
    neutral: "text-foreground",
    primary: "text-primary",
    warn: "text-[var(--warning)]",
    danger: "text-[var(--destructive)]",
    success: "text-[var(--success)]",
  }[tone];

  const iconColor = {
    neutral: "text-[var(--muted-foreground)]",
    primary: "text-primary",
    warn: "text-[var(--warning)]",
    danger: "text-[var(--destructive)]",
    success: "text-[var(--success)]",
  }[tone];

  return (
    <div className={cn("bg-card border border-[var(--border)] border-l-[3px] px-4 py-3.5 rounded-xl", accent)}>
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
        {Icon && <Icon size={11} className={iconColor} />}
        {label}
      </p>
      <p className={cn("text-[22px] font-black leading-none tracking-tight", valueColor)}>{value}</p>
      {sub && <p className="mt-1.5 text-[10px] font-medium text-[var(--muted-foreground)]">{sub}</p>}
    </div>
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
                                  ? "bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]/30"
                                  : src.status === "Idle"
                                    ? "bg-[var(--panel-soft)] text-[var(--muted-foreground)] border-[var(--border)]"
                                    : "bg-red-50 text-[var(--destructive)] border-red-100 animate-pulse"
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
                                ? "bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]/30"
                                : src.status === "Idle"
                                  ? "bg-[var(--panel-soft)] text-[var(--muted-foreground)] border-[var(--border)]"
                                  : "bg-red-50 text-[var(--destructive)] border-red-100 animate-pulse"
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
                                          ? "bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]/30"
                                          : "bg-red-50 text-[var(--destructive)] border-red-100"
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
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="평균 응답 속도" value="1.2s" sub="AI 파이프라인 기준" tone="success" icon={Zap} />
          <StatCard
            label="분석 정확도 (QA)"
            value="98.4%"
            sub="페르소나 검증 기준"
            tone="primary"
            icon={CheckCircle2}
          />
          <StatCard label="토큰 효율성" value="92%" sub="입출력 대비 평균" tone="warn" icon={Cpu} />
          <StatCard label="실패율" value="0.02%" sub="최근 30일 기준" tone="neutral" icon={AlertTriangle} />
        </div>

        <SettingGroup title="리서치 유형별 시스템 프롬프트">
          <div className="mb-5 space-y-3">
            <div>
              <p className="app-label mb-2">설문 템플릿</p>
              <div className="flex flex-wrap gap-2">
                {PROMPT_PRESETS.filter((p) => p.group === "survey").map((preset) => (
                  <Button
                    key={preset.id}
                    variant={preset.id === selectedPromptType ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                    onClick={() => setSelectedPromptType(preset.id)}
                  >
                    <preset.icon size={13} /> {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <p className="app-label mb-2">AI 파이프라인</p>
              <div className="flex flex-wrap gap-2">
                {PROMPT_PRESETS.filter((p) => p.group === "pipeline").map((preset) => (
                  <Button
                    key={preset.id}
                    variant={preset.id === selectedPromptType ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                    onClick={() => setSelectedPromptType(preset.id)}
                  >
                    <preset.icon size={13} /> {preset.label}
                  </Button>
                ))}
              </div>
            </div>
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
                        p.status === "진행중" &&
                          "bg-[var(--primary-light-bg)] text-primary border-[var(--primary-light-border)]",
                        p.status === "분석중" &&
                          "bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]/30",
                        p.status === "완료" &&
                          "bg-[var(--panel-soft)] text-[var(--muted-foreground)] border-[var(--border)]",
                        p.status === "대기" &&
                          "bg-[var(--warning-light)] text-[var(--warning)] border-[var(--warning)]/30"
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
                        p.progress === 100 ? "bg-[var(--success)]" : "bg-primary"
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
        desc="운영자/편집자/뷰어 등 역할별 상세 접근 권한 및 민감 데이터 열람 통제 정책을 관리합니다."
      />
      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="전체 사용자" value="20" sub="+1 이번 달" tone="neutral" icon={Users} />
          <StatCard label="활성 세션" value="6" sub="현재 접속 중" tone="primary" icon={Activity} />
          <StatCard label="2FA 미설정" value="3" sub="조치 필요" tone="warn" icon={AlertTriangle} />
          <StatCard label="휴면 계정 (90d+)" value="2" sub="비활성화 권고" tone="danger" icon={Clock} />
        </div>

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
                    상태
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
                    status: "active" as const,
                    dept: "소비자인사이트팀",
                    lastAccess: "방금 전",
                    mfa: true,
                  },
                  {
                    name: "김민준",
                    email: "mj.kim@samsung.com",
                    role: "편집자",
                    status: "active" as const,
                    dept: "MX 마케팅실",
                    lastAccess: "32분 전",
                    mfa: true,
                  },
                  {
                    name: "이서연",
                    email: "sy.lee@samsung.com",
                    role: "편집자",
                    status: "active" as const,
                    dept: "브랜드전략팀",
                    lastAccess: "1시간 전",
                    mfa: true,
                  },
                  {
                    name: "박지호",
                    email: "jh.park@samsung.com",
                    role: "편집자",
                    status: "active" as const,
                    dept: "삼성 리서치",
                    lastAccess: "2시간 전",
                    mfa: true,
                  },
                  {
                    name: "최예은",
                    email: "ye.choi@samsung.com",
                    role: "편집자",
                    status: "active" as const,
                    dept: "소비자인사이트팀",
                    lastAccess: "3시간 전",
                    mfa: true,
                  },
                  {
                    name: "정태양",
                    email: "ty.jung@samsung.com",
                    role: "편집자",
                    status: "active" as const,
                    dept: "DX마케팅기획팀",
                    lastAccess: "5시간 전",
                    mfa: false,
                  },
                  {
                    name: "한수빈",
                    email: "sb.han@samsung.com",
                    role: "편집자",
                    status: "active" as const,
                    dept: "MX 마케팅실",
                    lastAccess: "어제",
                    mfa: true,
                  },
                  {
                    name: "오민재",
                    email: "mj.oh@samsung.com",
                    role: "편집자",
                    status: "active" as const,
                    dept: "제품전략팀",
                    lastAccess: "어제",
                    mfa: true,
                  },
                  {
                    name: "장예진",
                    email: "yj.jang@samsung.com",
                    role: "편집자",
                    status: "invited" as const,
                    dept: "삼성 리서치",
                    lastAccess: "—",
                    mfa: false,
                  },
                  {
                    name: "윤성호",
                    email: "sh.yoon@samsung.com",
                    role: "편집자",
                    status: "invited" as const,
                    dept: "브랜드전략팀",
                    lastAccess: "—",
                    mfa: false,
                  },
                  {
                    name: "강지수",
                    email: "js.kang@samsung.com",
                    role: "뷰어",
                    status: "active" as const,
                    dept: "글로벌마케팅오피스",
                    lastAccess: "2시간 전",
                    mfa: true,
                  },
                  {
                    name: "임현우",
                    email: "hw.lim@samsung.com",
                    role: "뷰어",
                    status: "active" as const,
                    dept: "CX전략팀",
                    lastAccess: "어제",
                    mfa: true,
                  },
                  {
                    name: "신다연",
                    email: "dy.shin@samsung.com",
                    role: "뷰어",
                    status: "active" as const,
                    dept: "MX 마케팅실",
                    lastAccess: "어제",
                    mfa: false,
                  },
                  {
                    name: "조현석",
                    email: "hs.cho@samsung.com",
                    role: "뷰어",
                    status: "active" as const,
                    dept: "DX마케팅기획팀",
                    lastAccess: "2일 전",
                    mfa: true,
                  },
                  {
                    name: "배소윤",
                    email: "sy.bae@samsung.com",
                    role: "뷰어",
                    status: "active" as const,
                    dept: "제품전략팀",
                    lastAccess: "2일 전",
                    mfa: true,
                  },
                  {
                    name: "홍준서",
                    email: "js.hong@samsung.com",
                    role: "뷰어",
                    status: "active" as const,
                    dept: "글로벌마케팅오피스",
                    lastAccess: "3일 전",
                    mfa: true,
                  },
                  {
                    name: "문지현",
                    email: "jh.moon@samsung.com",
                    role: "뷰어",
                    status: "active" as const,
                    dept: "소비자인사이트팀",
                    lastAccess: "4일 전",
                    mfa: false,
                  },
                  {
                    name: "권태은",
                    email: "te.kwon@samsung.com",
                    role: "뷰어",
                    status: "active" as const,
                    dept: "CX전략팀",
                    lastAccess: "1주일 전",
                    mfa: true,
                  },
                  {
                    name: "류상민",
                    email: "sm.ryu@samsung.com",
                    role: "뷰어",
                    status: "suspended" as const,
                    dept: "브랜드전략팀",
                    lastAccess: "45일 전",
                    mfa: true,
                  },
                  {
                    name: "나은채",
                    email: "ec.na@samsung.com",
                    role: "뷰어",
                    status: "suspended" as const,
                    dept: "DX마케팅기획팀",
                    lastAccess: "62일 전",
                    mfa: true,
                  },
                ].map((u) => {
                  const statusStyle = {
                    active: {
                      label: "Active",
                      cls: "border-[var(--success)]/30 bg-[var(--success-light)] text-[var(--success)]",
                    },
                    invited: {
                      label: "Invited",
                      cls: "border-[var(--warning)]/30 bg-[var(--warning-light)] text-[var(--warning)]",
                    },
                    suspended: {
                      label: "Suspended",
                      cls: "border-[var(--destructive)]/20 bg-[var(--destructive)]/5 text-[var(--destructive)]",
                    },
                  }[u.status];
                  return (
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
                            u.role === "운영자"
                              ? "text-primary border-primary/30 bg-[var(--primary-light-bg)]"
                              : u.role === "편집자"
                                ? "text-[var(--secondary-foreground)] border-[var(--border-strong)] bg-[var(--panel-soft)]"
                                : "text-[var(--muted-foreground)] border-[var(--border)] bg-[var(--accent)]"
                          )}
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant="outline" className={cn("font-bold text-[10px]", statusStyle.cls)}>
                          {statusStyle.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-[var(--secondary-foreground)] text-[12px]">
                        {u.dept}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-[var(--muted-foreground)] text-[12px] flex items-center gap-1.5">
                        <Clock size={11} /> {u.lastAccess}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {u.mfa ? (
                          <div className="inline-flex items-center gap-1 text-[10px] font-black text-[var(--success)] bg-[var(--success-light)] px-2 py-0.5 rounded-full border border-[var(--success)]/30">
                            <CheckCircle2 size={10} /> ON
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-[10px] font-black text-[var(--warning)] bg-[var(--warning-light)] px-2 py-0.5 rounded-full border border-[var(--warning)]/30">
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
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-[12px] font-bold text-[var(--muted-foreground)]">전체 20명</span>
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
                  <th className="px-5 py-3.5 font-black text-center text-foreground">편집자</th>
                  <th className="px-5 py-3.5 font-black text-center text-[var(--muted-foreground)]">뷰어</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-card">
                {(
                  [
                    {
                      key: "user_mgmt",
                      label: "사용자 관리 및 시스템 설정",
                      admin: true,
                      editor: false,
                      viewer: false,
                    },
                    { key: "project", label: "프로젝트 생성 및 삭제", admin: true, editor: true, viewer: false },
                    { key: "survey", label: "설문 생성 및 실행", admin: true, editor: true, viewer: false },
                    { key: "simulation", label: "시뮬레이션 실행", admin: true, editor: true, viewer: false },
                    { key: "report", label: "리포트 생성 및 다운로드", admin: true, editor: true, viewer: true },
                    { key: "persona", label: "페르소나 열람 및 편집", admin: true, editor: true, viewer: true },
                    {
                      key: "result_view",
                      label: "분석 결과 및 인사이트 조회",
                      admin: true,
                      editor: true,
                      viewer: true,
                    },
                    { key: "prompt", label: "시스템 프롬프트 설정 변경", admin: true, editor: false, viewer: false },
                  ] as { key: string; label: string; admin: boolean; editor: boolean; viewer: boolean }[]
                ).map((row) => {
                  const Dot = ({ on, tone }: { on: boolean; tone: "primary" | "neutral" | "muted" }) =>
                    on ? (
                      <div
                        className={cn(
                          "w-2.5 h-2.5 rounded-full mx-auto",
                          tone === "primary" && "bg-primary shadow-[0_0_8px_rgba(49,107,255,0.4)]",
                          tone === "neutral" && "bg-foreground",
                          tone === "muted" && "bg-[var(--border-strong)]"
                        )}
                      />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full mx-auto border border-[var(--border)] bg-transparent" />
                    );
                  return (
                    <tr key={row.key} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="px-5 py-3.5 font-bold text-foreground">{row.label}</td>
                      <td className="px-5 py-3.5 text-center">
                        <Dot on={row.admin} tone="primary" />
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <Dot on={row.editor} tone="neutral" />
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <Dot on={row.viewer} tone="muted" />
                      </td>
                    </tr>
                  );
                })}
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
              { name: "김민준", email: "mj.kim@samsung.com", requests: 312, tokens: 134800, role: "편집자" },
              { name: "정태양", email: "ty.jung@samsung.com", requests: 241, tokens: 103600, role: "편집자" },
              { name: "이동훈", email: "dh.lee@samsung.com", requests: 184, tokens: 78420, role: "운영자" },
              { name: "이서연", email: "sy.lee@samsung.com", requests: 97, tokens: 41200, role: "편집자" },
              { name: "강지수", email: "js.kang@samsung.com", requests: 56, tokens: 23900, role: "뷰어" },
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
                        ? "bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]/30"
                        : "bg-red-50 text-[var(--destructive)] border-red-100 animate-pulse"
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
};

/* ─── 메인 ─── */
export const SettingsPage: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const active = tab ?? "projects";
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar Nav */}
      <nav className="flex w-[240px] shrink-0 flex-col border-r border-[var(--border)] bg-card shadow-[var(--shadow-sm)]">
        {/* 상단: 뒤로가기 */}
        <div className="shrink-0 border-b border-[var(--border)] px-4 py-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-[var(--surface-hover)]"
          >
            <ArrowLeft
              size={15}
              className="text-[var(--subtle-foreground)] transition-transform group-hover:-translate-x-0.5 group-hover:text-primary"
            />
            <span className="text-[13px] font-semibold text-[var(--secondary-foreground)] group-hover:text-primary">
              홈으로 돌아가기
            </span>
          </button>
          <div className="mt-3 px-3">
            <p className="text-[11px] font-black uppercase tracking-widest text-[var(--subtle-foreground)]">Settings</p>
          </div>
        </div>

        {/* 가운데: 섹션 네비게이션 */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-5">
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
        </div>

        {/* 하단: 유저카드 */}
        <div className="relative shrink-0 border-t border-[var(--border)] p-3">
          {userMenuOpen && (
            <div className="absolute bottom-[76px] left-3 right-3 z-50 overflow-hidden rounded-2xl border border-[var(--border)] bg-card p-1.5 shadow-[var(--shadow-lg)]">
              <div className="my-1 h-px bg-[var(--border)] opacity-50" />
              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-[var(--destructive)] transition-colors hover:bg-red-50"
              >
                <LogOut size={16} /> 로그아웃
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setUserMenuOpen((v) => !v)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl p-2 transition-all hover:bg-[var(--surface-hover)]",
              userMenuOpen && "bg-[var(--surface-hover)]"
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary-light-bg)] text-primary shadow-inner">
              <UserCircle size={20} />
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-[13px] font-bold text-foreground">관리자</p>
              <p className="truncate text-[11px] font-medium text-[var(--subtle-foreground)]">admin@samsung.com</p>
            </div>
          </button>
        </div>
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
