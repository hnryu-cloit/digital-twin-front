import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Shield,
  Database,
  FileText,
  Users,
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
  Calendar as CalendarIcon,
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
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { cn } from "@/lib/utils";
import { settingsApi } from "@/lib/api";
import type { DateRange } from "react-day-picker";

/* ─── 네비게이션 구조 ─── */
interface NavSection {
  label: string;
  items: { key: string; label: string; icon: React.ElementType }[];
}

const NAV: NavSection[] = [
  {
    label: "플랫폼 관리",
    items: [
      { key: "projects", label: "프로젝트 현황판", icon: Briefcase },
      { key: "datasrc", label: "데이터 커넥터", icon: Database },
      { key: "users", label: "멤버 & 접근 제어", icon: Users },
    ],
  },
  {
    label: "AI 구성 & 감사",
    items: [
      { key: "prompt", label: "설문 템플릿 관리", icon: Terminal },
      { key: "logs", label: "대화 감사 로그", icon: MessageSquare },
      { key: "validation", label: "품질 검증 아카이브", icon: History },
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
] as const;

interface TemplateDefault {
  prompt: string;
  temperature: number;
  top_p: number;
  model: string;
  reasoning_effort: "low" | "medium" | "high";
  deep_research: boolean;
  allow_external_data: boolean;
  allow_third_party_data: boolean;
  use_project_context: boolean;
  use_segment_context: boolean;
  survey_type: string;
  recommended_question_count: number;
  required_blocks: string[];
}

function buildSurveyTemplatePrompt({
  role,
  surveyType,
  requiredBlocks,
  extraRules,
}: {
  role: string;
  surveyType: string;
  requiredBlocks: string[];
  extraRules: string[];
}) {
  return `${role}

[현재 설문 생성 계약]
- 이 템플릿은 survey_type="${surveyType}" 기반 설문 생성에 사용됩니다
- 입력은 user_prompt, research template, segment_context를 함께 반영해야 합니다
- 출력은 JSON 배열만 가정하며 각 문항은 text, type, options를 포함해야 합니다
- 허용 문항 타입은 단일선택, 복수선택, 리커트척도, 주관식 4종입니다
- 주관식 문항의 options는 반드시 빈 배열 [] 이어야 합니다
- 리커트척도 문항은 5점 척도를 기본으로 설계합니다
- question_count를 초과하지 말고, 각 문항은 서로 다른 역할을 가져야 합니다

[필수 블록]
${requiredBlocks.map((block, index) => `${index + 1}. ${block}`).join("\n")}

[설계 원칙]
- 사용자 요청을 그대로 반복하지 말고 측정 가능한 문항으로 변환하세요
- segment_context가 주어지면 세그먼트 특성을 rationale 수준으로 반영하되 편향적 표현은 피하세요
- 문항 텍스트는 한국어 기준으로 자연스럽고 중립적인 어조를 유지하세요
- 현재 데이터 스키마상 options는 문자열 배열만 허용되므로 복합 구조를 만들지 마세요
- 추후 시뮬레이션과 리포트에서 재사용되므로 질문 의도와 선택지가 명확해야 합니다

[템플릿별 추가 규칙]
${extraRules.map((rule) => `- ${rule}`).join("\n")}`;
}

const TEMPLATE_DEFAULTS: Record<string, TemplateDefault> = {
  tpl_concept_test: {
    model: "gemini-2.5-pro",
    reasoning_effort: "medium",
    deep_research: false,
    allow_external_data: false,
    allow_third_party_data: false,
    use_project_context: true,
    use_segment_context: true,
    survey_type: "concept",
    recommended_question_count: 8,
    required_blocks: ["awareness", "appeal", "purchase_intent", "concern", "open_feedback"],
    temperature: 0.4,
    top_p: 0.85,
    prompt: buildSurveyTemplatePrompt({
      role: "당신은 삼성전자 소비자 리서치 전문가입니다. 신제품 또는 기능 컨셉의 초기 수용 가능성과 구매 유발 요인을 측정하는 설문을 설계하세요.",
      surveyType: "concept",
      requiredBlocks: ["awareness", "appeal", "purchase_intent", "concern", "open_feedback"],
      extraRules: [
        "첫인상과 매력도, 구매 의향, 우려 요소가 모두 포함되도록 설계하세요.",
        "브랜드명과 제품명은 [브랜드], [제품명] 플레이스홀더로 남겨 두세요.",
        "정성 문항은 최소 2개 포함해 구매 맥락과 우려 이유를 확보하세요.",
      ],
    }),
  },
  tpl_ad_message: {
    model: "gemini-2.5-pro",
    reasoning_effort: "medium",
    deep_research: false,
    allow_external_data: false,
    allow_third_party_data: false,
    use_project_context: true,
    use_segment_context: true,
    survey_type: "ad",
    recommended_question_count: 8,
    required_blocks: ["message_clarity", "memorability", "brand_fit", "intent_shift", "improvement_area"],
    temperature: 0.4,
    top_p: 0.85,
    prompt: buildSurveyTemplatePrompt({
      role: "당신은 삼성전자 광고 효과 측정 전문가입니다. 광고 메시지의 전달력과 브랜드 적합성, 구매 의향 변화를 측정하는 설문을 설계하세요.",
      surveyType: "ad",
      requiredBlocks: ["message_clarity", "memorability", "brand_fit", "intent_shift", "improvement_area"],
      extraRules: [
        "광고 노출 전과 후의 질문 흐름을 분리해 메시지 효과를 비교 가능하게 만드세요.",
        "광고 소재는 [광고 소재] 플레이스홀더로 남겨 두세요.",
        "비보조 기억과 보조 기억을 혼동하지 않도록 문항 순서를 설계하세요.",
      ],
    }),
  },
  tpl_usage_probe: {
    model: "gemini-2.5-pro",
    reasoning_effort: "high",
    deep_research: false,
    allow_external_data: false,
    allow_third_party_data: false,
    use_project_context: true,
    use_segment_context: true,
    survey_type: "usage",
    recommended_question_count: 10,
    required_blocks: ["usage_context", "satisfaction", "pain_point", "workaround", "future_need"],
    temperature: 0.5,
    top_p: 0.9,
    prompt: buildSurveyTemplatePrompt({
      role: "당신은 삼성전자 UX 리서치 전문가입니다. 실제 사용 맥락, 불편 요소, 우회 행동, 향후 니즈를 깊게 탐색하는 설문을 설계하세요.",
      surveyType: "usage",
      requiredBlocks: ["usage_context", "satisfaction", "pain_point", "workaround", "future_need"],
      extraRules: [
        "행동 기반 질문을 우선하고, 단순 의견 질문만으로 구성하지 마세요.",
        "제품명은 [제품명] 플레이스홀더로 남겨 두세요.",
        "정성 탐색 목적이 강하므로 주관식 문항 비중을 충분히 확보하세요.",
      ],
    }),
  },
  tpl_brand_awareness: {
    model: "gemini-2.5-pro",
    reasoning_effort: "medium",
    deep_research: true,
    allow_external_data: true,
    allow_third_party_data: true,
    use_project_context: true,
    use_segment_context: true,
    survey_type: "brand_awareness",
    recommended_question_count: 9,
    required_blocks: [
      "spontaneous_awareness",
      "aided_recall",
      "brand_association",
      "competitive_positioning",
      "preference",
    ],
    temperature: 0.4,
    top_p: 0.85,
    prompt: buildSurveyTemplatePrompt({
      role: "당신은 삼성전자 브랜드 전략 리서치 전문가입니다. 브랜드 인지도, 연상 이미지, 경쟁 대비 포지셔닝을 측정하는 설문을 설계하세요.",
      surveyType: "brand_awareness",
      requiredBlocks: [
        "spontaneous_awareness",
        "aided_recall",
        "brand_association",
        "competitive_positioning",
        "preference",
      ],
      extraRules: [
        "비보조 인지 후 보조 인지 순서를 반드시 유지하세요.",
        "경쟁 브랜드명은 [경쟁사A], [경쟁사B] 플레이스홀더로 남겨 두세요.",
        "외부 시장 정보가 있더라도 문항은 중립적 비교 구조로 유지하세요.",
      ],
    }),
  },
  tpl_price_sensitivity: {
    model: "gemini-2.5-pro",
    reasoning_effort: "high",
    deep_research: true,
    allow_external_data: true,
    allow_third_party_data: true,
    use_project_context: true,
    use_segment_context: true,
    survey_type: "price_sensitivity",
    recommended_question_count: 7,
    required_blocks: ["too_cheap", "cheap", "expensive", "too_expensive", "price_context"],
    temperature: 0.3,
    top_p: 0.8,
    prompt: buildSurveyTemplatePrompt({
      role: "당신은 삼성전자 가격 전략 리서치 전문가입니다. Van Westendorp 기반으로 가격 수용 범위와 지불 의향을 측정하는 설문을 설계하세요.",
      surveyType: "price_sensitivity",
      requiredBlocks: ["too_cheap", "cheap", "expensive", "too_expensive", "price_context"],
      extraRules: [
        "Too Cheap, Cheap, Expensive, Too Expensive의 4개 핵심 가격 문항을 반드시 포함하세요.",
        "제품 사양은 [제품 사양] 플레이스홀더로 남겨 두세요.",
        "가격 맥락을 해석할 수 있도록 현재 지출 또는 대안 비교 문항을 포함하세요.",
      ],
    }),
  },
  tpl_csat: {
    model: "gemini-2.5-pro",
    reasoning_effort: "medium",
    deep_research: false,
    allow_external_data: false,
    allow_third_party_data: false,
    use_project_context: true,
    use_segment_context: true,
    survey_type: "csat",
    recommended_question_count: 8,
    required_blocks: ["overall_csat", "nps", "dimension_csat", "repurchase_intent", "improvement_priority"],
    temperature: 0.3,
    top_p: 0.8,
    prompt: buildSurveyTemplatePrompt({
      role: "당신은 삼성전자 CX 리서치 전문가입니다. 제품 또는 서비스의 전반 만족도와 추천, 재구매 의향을 측정하는 설문을 설계하세요.",
      surveyType: "csat",
      requiredBlocks: ["overall_csat", "nps", "dimension_csat", "repurchase_intent", "improvement_priority"],
      extraRules: [
        "CSAT는 5점 척도, NPS는 0~10점 척도를 유지하세요.",
        "NPS 점수 이유를 파악할 수 있는 주관식 또는 후속 문항을 포함하세요.",
        "세부 만족도는 품질, 가격, 서비스 등 개선 액션과 연결되게 설계하세요.",
      ],
    }),
  },
  tpl_competitor: {
    model: "gemini-2.5-pro",
    reasoning_effort: "high",
    deep_research: true,
    allow_external_data: true,
    allow_third_party_data: true,
    use_project_context: true,
    use_segment_context: true,
    survey_type: "competitor",
    recommended_question_count: 10,
    required_blocks: ["awareness", "usage_experience", "attribute_comparison", "switching_intent", "ideal_product"],
    temperature: 0.4,
    top_p: 0.85,
    prompt: buildSurveyTemplatePrompt({
      role: "당신은 삼성전자 경쟁사 인텔리전스 리서치 전문가입니다. 자사와 주요 경쟁사를 비교 평가하는 설문을 설계하세요.",
      surveyType: "competitor",
      requiredBlocks: ["awareness", "usage_experience", "attribute_comparison", "switching_intent", "ideal_product"],
      extraRules: [
        "비교 대상 브랜드는 [경쟁사A], [경쟁사B] 플레이스홀더로 남겨 두세요.",
        "현재 사용 브랜드에 따라 분기 가능한 질문 흐름을 고려하세요.",
        "속성 비교 문항은 품질, 가격, 디자인, 서비스처럼 해석 가능한 항목으로 제한하세요.",
      ],
    }),
  },
  simulation: {
    model: "gemini-2.5-flash",
    reasoning_effort: "medium",
    deep_research: false,
    allow_external_data: false,
    allow_third_party_data: false,
    use_project_context: true,
    use_segment_context: true,
    survey_type: "simulation",
    recommended_question_count: 0,
    required_blocks: [],
    temperature: 0.8,
    top_p: 0.95,
    prompt: `당신은 삼성전자 디지털 트윈 시뮬레이션 엔진입니다. 주어진 인구통계 및 심리통계 프로파일을 가진 가상 페르소나로서 설문에 응답하세요.

[페르소나 응답 원칙]
- 페르소나의 연령, 직업, 소비 성향, 브랜드 선호도, 기술 수용 수준을 일관되게 반영하세요
- 응답은 해당 페르소나의 실제 경험과 가치관에 근거해야 합니다
- 모든 응답자가 동일하게 응답하는 패턴을 피하고, 페르소나별 개성을 유지하세요
- 척도 응답 시 중립(3점)으로만 수렴하지 말고, 프로파일에 맞는 분포를 형성하세요

[응답 품질 기준]
- 주관식 응답은 2~4문장으로 작성하되, 페르소나의 어휘 수준과 관심사를 반영하세요
- 브랜드 충성도가 높은 페르소나는 긍정 편향을, 가격 민감 페르소나는 가성비 관점을 중심으로 응답하세요`,
  },
  assistant: {
    model: "gemini-2.5-pro",
    reasoning_effort: "medium",
    deep_research: true,
    allow_external_data: true,
    allow_third_party_data: true,
    use_project_context: true,
    use_segment_context: true,
    survey_type: "assistant",
    recommended_question_count: 0,
    required_blocks: [],
    temperature: 0.6,
    top_p: 0.9,
    prompt: `당신은 삼성전자 리서치 인사이트 어시스턴트입니다. 수집된 설문 데이터와 페르소나 분석 결과를 바탕으로 마케팅 전략적 인사이트를 제공하세요.

[응답 원칙]
- 질문에 대한 답변은 데이터 근거를 먼저 제시하고, 그로부터 도출되는 인사이트를 설명하세요
- 수치와 비율은 구체적으로 인용하되, 불확실한 추측은 명확히 구분하세요
- 실행 가능한 액션 아이템을 포함하여 답변을 마무리하세요

[출력 형식]
- 복잡한 질문은 핵심 요약 → 상세 분석 → 권고 사항 순으로 구조화하세요
- 임원 보고용 요약이 필요한 경우 3줄 이내 불릿 포인트로 제공하세요
- 세그먼트별 비교가 필요한 경우 표 형식을 활용하세요`,
  },
};

function StatCard({
  label,
  value,
  sub,
  tone = "neutral",
  icon: Icon,
  onDetail,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "primary" | "warn" | "danger" | "success";
  icon?: React.ElementType;
  onDetail?: () => void;
}) {
  const valueColor = {
    neutral: "text-foreground",
    primary: "text-primary",
    warn: "text-[var(--warning)]",
    danger: "text-[var(--destructive)]",
    success: "text-[var(--success)]",
  }[tone];

  const iconColor = {
    neutral: "text-[var(--subtle-foreground)]",
    primary: "text-primary",
    warn: "text-[var(--warning)]",
    danger: "text-[var(--destructive)]",
    success: "text-[var(--success)]",
  }[tone];

  return (
    <div className="group bg-card border border-[var(--border)] rounded-xl p-4 flex flex-col gap-0 hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-sm)] transition-all">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--subtle-foreground)] mb-2.5">
        {Icon && <Icon size={11} className={iconColor} />}
        {label}
      </p>
      <p className={cn("text-[20px] font-black leading-none tracking-tight", valueColor)}>{value}</p>
      <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-[var(--border)]">
        {sub ? <p className="text-[10px] font-medium text-[var(--muted-foreground)]">{sub}</p> : <span />}
        <button
          type="button"
          onClick={onDetail}
          className="flex items-center gap-0.5 text-[10px] font-bold text-[var(--muted-foreground)] hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
        >
          더보기 <ChevronRight size={11} />
        </button>
      </div>
    </div>
  );
}

/* ─── 데이터 소스 섹션 ─── */
const DATA_SOURCES = [
  {
    id: "pos",
    name: "삼성 POS 트랜잭션",
    type: "GCS 배치 업로드",
    status: "Healthy" as const,
    sync: "1시간 전",
    signal: 100,
    icon: Database,
    endpoint: "gs://samsung-dt-lake/pos/",
    auth: "GCP 서비스 계정",
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
    endpoint: "postgres://survey-db.dt.samsung.internal:5432/responses",
    auth: "GCP 서비스 계정",
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
    type: "GCP SDK Integration",
    status: "Healthy" as const,
    sync: "실시간",
    signal: 90,
    icon: Zap,
    endpoint: "https://samsung-dt-app-default-rtdb.asia-southeast1.firebasedatabase.app",
    auth: "GCP 서비스 계정 JSON",
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
        title="데이터 커넥터"
        desc="연결된 데이터 소스의 상태를 모니터링하고 소스별 스키마와 동기화 이력을 확인합니다"
      />
      <div className="grid grid-cols-1 gap-4">
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
        <div className="app-card p-6">
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
        </div>

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
  const [selectedPromptType, setSelectedPromptType] =
    useState<(typeof PROMPT_PRESETS)[number]["id"]>("tpl_concept_test");
  const [prompt, setPrompt] = useState(TEMPLATE_DEFAULTS["tpl_concept_test"].prompt);
  const [savedPrompt, setSavedPrompt] = useState("");
  const [temperature, setTemperature] = useState(TEMPLATE_DEFAULTS["tpl_concept_test"].temperature);
  const [topP, setTopP] = useState(TEMPLATE_DEFAULTS["tpl_concept_test"].top_p);
  const [model, setModel] = useState(TEMPLATE_DEFAULTS["tpl_concept_test"].model);
  const [reasoningEffort, setReasoningEffort] = useState(TEMPLATE_DEFAULTS["tpl_concept_test"].reasoning_effort);
  const [deepResearch, setDeepResearch] = useState(TEMPLATE_DEFAULTS["tpl_concept_test"].deep_research);
  const [allowExternalData, setAllowExternalData] = useState(TEMPLATE_DEFAULTS["tpl_concept_test"].allow_external_data);
  const [allowThirdPartyData, setAllowThirdPartyData] = useState(
    TEMPLATE_DEFAULTS["tpl_concept_test"].allow_third_party_data
  );
  const [useProjectContext, setUseProjectContext] = useState(TEMPLATE_DEFAULTS["tpl_concept_test"].use_project_context);
  const [useSegmentContext, setUseSegmentContext] = useState(TEMPLATE_DEFAULTS["tpl_concept_test"].use_segment_context);
  const [savedTemplate, setSavedTemplate] = useState(TEMPLATE_DEFAULTS["tpl_concept_test"]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaults = TEMPLATE_DEFAULTS[selectedPromptType];
  const activePreset = PROMPT_PRESETS.find((preset) => preset.id === selectedPromptType) ?? PROMPT_PRESETS[0];
  const enabledRuntimeFlags = [
    deepResearch,
    allowExternalData,
    allowThirdPartyData,
    useProjectContext,
    useSegmentContext,
  ].filter(Boolean).length;

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      setErrorMessage(null);
      const [promptResponse, llmResponse, templateBundle] = await Promise.all([
        settingsApi.getPrompt(selectedPromptType),
        settingsApi.getLlmParameters(),
        settingsApi.getSurveyTemplateSettings(),
      ]);

      const storedTemplate = templateBundle?.templates?.[selectedPromptType];

      const resolvedPrompt = storedTemplate?.prompt || promptResponse?.prompt || defaults.prompt;
      const resolvedTemp = storedTemplate?.temperature ?? llmResponse?.temperature ?? defaults.temperature;
      const resolvedTopP = storedTemplate?.top_p ?? llmResponse?.top_p ?? defaults.top_p;
      const resolvedTemplate = {
        ...defaults,
        ...storedTemplate,
        prompt: resolvedPrompt,
        temperature: resolvedTemp,
        top_p: resolvedTopP,
      };

      setPrompt(resolvedTemplate.prompt);
      setSavedPrompt(resolvedTemplate.prompt);
      setTemperature(resolvedTemplate.temperature);
      setTopP(resolvedTemplate.top_p);
      setModel(resolvedTemplate.model);
      setReasoningEffort(resolvedTemplate.reasoning_effort);
      setDeepResearch(resolvedTemplate.deep_research);
      setAllowExternalData(resolvedTemplate.allow_external_data);
      setAllowThirdPartyData(resolvedTemplate.allow_third_party_data);
      setUseProjectContext(resolvedTemplate.use_project_context);
      setUseSegmentContext(resolvedTemplate.use_segment_context);
      setSavedTemplate(resolvedTemplate);

      if (!promptResponse && !storedTemplate) {
        console.warn("템플릿 설정을 불러오지 못해 기본값을 사용합니다.");
      }
      setLoading(false);
    };

    void loadSettings();
  }, [defaults, selectedPromptType]);

  const resetCurrent = () => {
    setPrompt(savedPrompt || savedTemplate.prompt || defaults.prompt);
    setTemperature(savedTemplate.temperature);
    setTopP(savedTemplate.top_p);
    setModel(savedTemplate.model);
    setReasoningEffort(savedTemplate.reasoning_effort);
    setDeepResearch(savedTemplate.deep_research);
    setAllowExternalData(savedTemplate.allow_external_data);
    setAllowThirdPartyData(savedTemplate.allow_third_party_data);
    setUseProjectContext(savedTemplate.use_project_context);
    setUseSegmentContext(savedTemplate.use_segment_context);
    setStatusMessage("마지막 저장 상태로 되돌렸습니다.");
    setErrorMessage(null);
  };

  const saveCurrent = async () => {
    setSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    const templateBundle = await settingsApi.getSurveyTemplateSettings();
    const nextTemplate = {
      ...defaults,
      prompt,
      model,
      temperature,
      top_p: topP,
      reasoning_effort: reasoningEffort,
      deep_research: deepResearch,
      allow_external_data: allowExternalData,
      allow_third_party_data: allowThirdPartyData,
      use_project_context: useProjectContext,
      use_segment_context: useSegmentContext,
    };
    const nextBundle = {
      templates: {
        ...(templateBundle?.templates ?? {}),
        [selectedPromptType]: nextTemplate,
      },
      updated_at: new Date().toISOString(),
    };

    const [promptResponse, llmResponse, templateResponse] = await Promise.all([
      settingsApi.savePrompt(selectedPromptType, prompt),
      settingsApi.saveLlmParameters({ temperature, top_p: topP }),
      settingsApi.saveSurveyTemplateSettings(nextBundle),
    ]);

    if (!promptResponse || !llmResponse || !templateResponse) {
      setErrorMessage("일부 템플릿 설정 저장에 실패했습니다.");
      setSaving(false);
      return;
    }

    setSavedPrompt(promptResponse.prompt);
    setSavedTemplate(nextTemplate);
    setStatusMessage("템플릿 번들과 레거시 프롬프트/LLM 값을 함께 저장했습니다.");
    setSaving(false);
  };

  return (
    <>
      <SectionTitle
        title="설문 템플릿 관리"
        desc="시스템 프롬프트는 물론 모델, 딥리서치, 외부 데이터 허용 여부까지 템플릿 단위로 묶어서 관리합니다"
      />

      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="활성 템플릿"
            value={String(PROMPT_PRESETS.length)}
            sub="설문 유형 기준"
            tone="success"
            icon={FlaskConical}
          />
          <StatCard
            label="권장 문항 수"
            value={`${defaults.recommended_question_count}문항`}
            sub={defaults.survey_type}
            tone="primary"
            icon={List}
          />
          <StatCard
            label="필수 블록"
            value={String(defaults.required_blocks.length)}
            sub="템플릿 계약 기준"
            tone="warn"
            icon={CheckCircle2}
          />
          <StatCard
            label="실행 옵션"
            value={`${enabledRuntimeFlags}/5`}
            sub="현재 활성화됨"
            tone="neutral"
            icon={Cpu}
          />
        </div>

        <SettingGroup title="템플릿별 설계 규칙 및 실행 옵션">
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
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[13px] font-black text-foreground">시스템 프롬프트</span>
                <p className="mt-1 text-[11px] font-medium text-[var(--muted-foreground)]">
                  현재 설문 스키마(`text`, `type`, `options`)와 생성 계약을 반영하도록 기본 프롬프트를 정리했습니다.
                </p>
              </div>
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
                  model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-[var(--border)] bg-card px-4 py-3 text-[13px] font-bold text-foreground outline-none focus:border-primary disabled:opacity-60"
                >
                  <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  <option value="gpt-5.4">gpt-5.4</option>
                  <option value="gpt-5.4-mini">gpt-5.4-mini</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                  reasoning_effort
                </label>
                <select
                  value={reasoningEffort}
                  onChange={(e) => setReasoningEffort(e.target.value as "low" | "medium" | "high")}
                  disabled={loading}
                  className="w-full rounded-xl border border-[var(--border)] bg-card px-4 py-3 text-[13px] font-bold text-foreground outline-none focus:border-primary disabled:opacity-60"
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                    temperature
                  </label>
                  <span className="text-[10px] font-bold text-[var(--subtle-foreground)]">
                    기본값 {defaults.temperature.toFixed(1)}
                  </span>
                </div>
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
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[12px] font-black text-primary">{temperature.toFixed(1)}</span>
                    {temperature !== defaults.temperature && (
                      <span className="text-[10px] font-bold text-[var(--warning)]">기본값과 다름</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                    top_p
                  </label>
                  <span className="text-[10px] font-bold text-[var(--subtle-foreground)]">
                    기본값 {defaults.top_p.toFixed(2)}
                  </span>
                </div>
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

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: "딥리서치 사용",
                  value: deepResearch,
                  setter: setDeepResearch,
                  desc: "고난도 탐색형 템플릿에만 권장합니다.",
                },
                {
                  label: "외부 데이터 허용",
                  value: allowExternalData,
                  setter: setAllowExternalData,
                  desc: "프로젝트 내부 데이터 외 시장 정보 사용 여부입니다.",
                },
                {
                  label: "3rd-party 데이터 허용",
                  value: allowThirdPartyData,
                  setter: setAllowThirdPartyData,
                  desc: "패널/경쟁사/외부 파트너 데이터 사용 정책입니다.",
                },
                {
                  label: "프로젝트 컨텍스트 반영",
                  value: useProjectContext,
                  setter: setUseProjectContext,
                  desc: "프로젝트 목적과 브리프를 프롬프트에 주입합니다.",
                },
                {
                  label: "세그먼트 컨텍스트 반영",
                  value: useSegmentContext,
                  setter: setUseSegmentContext,
                  desc: "세그먼트 분석 결과를 설문 설계 근거로 반영합니다.",
                },
              ].map((item) => (
                <label
                  key={item.label}
                  className="flex items-start justify-between gap-3 rounded-xl border border-[var(--border)] bg-card px-4 py-3"
                >
                  <div>
                    <p className="text-[13px] font-black text-foreground">{item.label}</p>
                    <p className="mt-1 text-[11px] font-medium leading-relaxed text-[var(--muted-foreground)]">
                      {item.desc}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={item.value}
                    disabled={loading}
                    onChange={(e) => item.setter(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0"
                  />
                </label>
              ))}
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

        <SettingGroup title="템플릿 저장 레이어">
          <div className="space-y-3">
            {[
              {
                version: "live",
                label: "Bundle",
                date: "실시간 조회",
                author: "settings/kv",
                changes: "현재 선택된 템플릿의 시스템 프롬프트와 실행 옵션을 묶어서 저장합니다.",
                active: true,
              },
              {
                version: "prompt",
                label: "Legacy",
                date: "호환성 레이어",
                author: "settings/prompts + settings/llm-parameters",
                changes: "기존 저장 구조와의 호환을 위해 프롬프트와 기본 LLM 파라미터를 함께 미러링합니다.",
                active: false,
              },
              {
                version: "fallback",
                label: "Code Default",
                date: "코드 기본값",
                author: activePreset.label,
                changes: "저장값이 없을 때 템플릿별 기본 프롬프트, 모델, 옵션 preset을 사용합니다.",
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

/* ─── 기간 선택 피커 ─── */
type Preset = "week" | "month" | "lastMonth" | "custom";

function getPresetRange(preset: Preset): DateRange {
  const now = new Date();
  if (preset === "week") {
    const day = now.getDay();
    const from = new Date(now);
    from.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(from.getDate() + 6);
    return { from, to };
  }
  if (preset === "month") {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    };
  }
  if (preset === "lastMonth") {
    return {
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      to: new Date(now.getFullYear(), now.getMonth(), 0),
    };
  }
  return { from: undefined, to: undefined };
}

function formatDateRange(range: DateRange): string {
  const fmt = (d: Date) =>
    `${d.getFullYear()}년 ${String(d.getMonth() + 1).padStart(2, "0")}월 ${String(d.getDate()).padStart(2, "0")}일`;
  if (!range.from) return "기간 선택";
  if (!range.to) return fmt(range.from);
  return `${fmt(range.from)} ~ ${fmt(range.to)}`;
}

const PRESET_LABELS: { key: Preset; label: string }[] = [
  { key: "week", label: "이번 주" },
  { key: "month", label: "이번 달" },
  { key: "lastMonth", label: "지난 달" },
  { key: "custom", label: "직접 설정" },
];

function DateRangePicker({ value, onChange }: { value: DateRange; onChange: (range: DateRange) => void }) {
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<Preset>("month");
  const [localRange, setLocalRange] = useState<DateRange>(value);

  const applyPreset = (key: Preset) => {
    setActivePreset(key);
    if (key !== "custom") {
      const range = getPresetRange(key);
      setLocalRange(range);
      onChange(range);
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (!range) return;
    setLocalRange(range);
    if (range.from && range.to) {
      onChange(range);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* 프리셋 탭 */}
      <div className="flex items-center gap-1 bg-[var(--panel-soft)] rounded-xl p-1 border border-[var(--border)]">
        {PRESET_LABELS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => applyPreset(key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[11px] font-black transition-all",
              activePreset === key
                ? "bg-primary text-white shadow-sm"
                : "text-[var(--secondary-foreground)] hover:bg-card hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
        {/* 날짜 표시 */}
        <button
          type="button"
          onClick={() => {
            setActivePreset("custom");
            setOpen((v) => !v);
          }}
          className={cn(
            "ml-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all",
            open
              ? "border-primary bg-[var(--primary-light-bg)] text-primary"
              : "border-[var(--border)] bg-card text-[var(--secondary-foreground)] hover:border-primary/40"
          )}
        >
          <CalendarIcon size={11} />
          <span>{formatDateRange(localRange)}</span>
        </button>
      </div>

      {/* 캘린더 드롭다운 */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 rounded-2xl border border-[var(--border)] bg-card shadow-2xl p-4">
          <CalendarPicker
            mode="range"
            selected={localRange}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
            locale={undefined}
            className="rounded-xl"
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)] mt-1">
            <Button variant="outline" size="sm" className="text-[11px]" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button
              size="sm"
              className="text-[11px]"
              disabled={!localRange.from || !localRange.to}
              onClick={() => {
                if (localRange.from && localRange.to) {
                  onChange(localRange);
                  setOpen(false);
                }
              }}
            >
              적용
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function LogsSection() {
  const [dateRange, setDateRange] = useState<DateRange>(() => getPresetRange("month"));

  const handleRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  const rangeLabel = formatDateRange(dateRange);

  return (
    <>
      <SectionTitle
        title="대화 감사 로그"
        desc="AI 어시스턴트 및 설문 챗봇과 나눈 질의응답 이력을 조회하고 감사합니다"
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
        <div className="app-card p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
              사용자별 AI 사용 현황
              <span className="ml-2 font-semibold normal-case tracking-normal text-primary">{rangeLabel}</span>
            </p>
            <DateRangePicker value={dateRange} onChange={handleRangeChange} />
          </div>
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
        </div>

        <SettingGroup title="대화 로그">
          {/* 필터 바 */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-[var(--panel-soft)] px-4 py-2.5 rounded-xl border border-[var(--border)] focus-within:border-primary focus-within:bg-card transition-all">
              <Search size={14} className="text-[var(--subtle-foreground)] shrink-0" />
              <input
                className="bg-transparent border-none outline-none text-[13px] font-bold w-full text-foreground placeholder:text-[var(--subtle-foreground)] placeholder:font-medium"
                placeholder="사용자, 리서치명, 프롬프트 키워드 검색.."
              />
            </div>
            <select className="bg-card border border-[var(--border)] rounded-xl px-3 h-[42px] text-[12px] font-bold text-foreground outline-none focus:border-primary shadow-sm shrink-0">
              <option>전체 사용자</option>
              <option>dh.lee@samsung.com</option>
              <option>mj.kim@samsung.com</option>
              <option>sy.lee@samsung.com</option>
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
  );
}

/* ─── 품질 검증 아카이브 ─── */
const VAL_PROJECTS = [
  {
    id: "p1",
    name: "Galaxy S26 컨셉 테스트",
    created: "2026-03-01",
    owner: "이동훈",
    status: "진행중",
    accessible: true,
  },
  {
    id: "p2",
    name: "MZ세대 스마트폰 Usage 조사",
    created: "2026-02-15",
    owner: "김민준",
    status: "분석중",
    accessible: true,
  },
  {
    id: "p3",
    name: "프리미엄 사용자 재구매 의향 분석",
    created: "2026-02-20",
    owner: "박지호",
    status: "진행중",
    accessible: true,
  },
  {
    id: "p4",
    name: "글로벌 브랜드 인지도 Q1",
    created: "2026-01-10",
    owner: "이서연",
    status: "대기",
    accessible: true,
  },
  {
    id: "p5",
    name: "Z세대 갤럭시 버즈 인식 조사",
    created: "2026-01-25",
    owner: "최예은",
    status: "완료",
    accessible: true,
  },
  {
    id: "p6",
    name: "북미 시장 S25 포지셔닝 연구",
    created: "2025-12-05",
    owner: "정태양",
    status: "완료",
    accessible: false,
  },
  {
    id: "p7",
    name: "동남아 신흥시장 브랜드 침투율",
    created: "2025-11-18",
    owner: "한수빈",
    status: "완료",
    accessible: false,
  },
  {
    id: "p8",
    name: "갤럭시 AI 기능 인지도 조사",
    created: "2026-03-10",
    owner: "오민재",
    status: "진행중",
    accessible: true,
  },
  {
    id: "p9",
    name: "웨어러블 신제품 컨셉 테스트",
    created: "2026-03-20",
    owner: "장예진",
    status: "대기",
    accessible: true,
  },
];

const VAL_LOGS = [
  {
    id: "VAL-8831",
    project: "Galaxy S26 컨셉 테스트",
    questionNo: "Q3",
    questionLabel: "구매 의향",
    q: "삼성 Knox의 엔터프라이즈 보안 솔루션이 구매에 영향을 주나요?",
    answer: "별로 중요하지 않아요. 저는 그냥 카메라랑 배터리 보면 돼요.",
    persona: "P19 · 19세 / 고등학생",
    cot: "19세 고등학생 페르소나는 엔터프라이즈 보안 솔루션에 대한 실질적 경험이나 의사결정 권한이 없음. 질문 자체가 해당 페르소나의 사용 맥락과 불일치하여 응답 신뢰도 저하 판정.",
    score: 45,
    result: "Flagged",
    date: "2026-03-13 13:50",
  },
  {
    id: "VAL-8829",
    project: "Galaxy S26 컨셉 테스트",
    questionNo: "Q4",
    questionLabel: "기능 인지도",
    q: "S26 카메라의 AI 보정 기능이 게임 플레이 경험에 영향을 주나요?",
    answer:
      "게임 중 백그라운드 자원을 잡아먹을 수 있어서 신경 쓰이죠. 성능 모드로 전환하면 카메라 기능이 제한되는지 궁금합니다.",
    persona: "P12 · 28세 / 게임 개발자",
    cot: "게임 개발자는 GPU 성능과 발열 관리에 민감한 페르소나. 카메라 AI 기능의 시스템 자원 점유가 게임 프레임에 미치는 영향을 인식하고 있어 응답 일관성·신뢰도 높음.",
    score: 98,
    result: "Pass",
    date: "2026-03-13 14:20",
  },
  {
    id: "VAL-8830",
    project: "프리미엄 사용자 재구매 의향 분석",
    questionNo: "Q2",
    questionLabel: "기능 만족도",
    q: "보안 폴더의 사용 편의성에 대해 어떻게 생각하십니까?",
    answer:
      "업무용 문서를 분리 보관할 수 있어 유용합니다. 다만 폴더 진입 시 생체인증 단계가 한 번 더 있으면 좋겠습니다.",
    persona: "P05 · 45세 / 금융 컨설턴트",
    cot: "금융 컨설턴트는 기밀 문서 보안에 높은 관심을 가지며 기업용 보안 솔루션 사용 경험이 있을 가능성 높음. 실용적 관점에서 보안 폴더를 평가한 응답 패턴이 페르소나 프로파일과 일치.",
    score: 95,
    result: "Pass",
    date: "2026-03-13 14:15",
  },
  {
    id: "VAL-8826",
    project: "MZ세대 스마트폰 Usage 조사",
    questionNo: "Q5",
    questionLabel: "SNS 사용 행태",
    q: "인스타그램 릴스 편집 기능 중 가장 자주 사용하는 AI 필터는 무엇인가요?",
    answer: "저는 주로 네이버 블로그를 써서 잘 모르겠어요.",
    persona: "P33 · 52세 / 소상공인",
    cot: "52세 소상공인 페르소나는 릴스 편집 세부 기능 사용 빈도가 낮을 것으로 예측됨. MZ세대 대상 조사에 고령층 페르소나를 적용한 설계 오류로 판정. 페르소나-설문 매핑 재검토 필요.",
    score: 62,
    result: "Flagged",
    date: "2026-03-12 16:30",
  },
  {
    id: "VAL-8824",
    project: "MZ세대 스마트폰 Usage 조사",
    questionNo: "Q4",
    questionLabel: "AI 기능 활용도",
    q: "Galaxy AI의 통화 번역 기능을 업무에서 얼마나 자주 활용하시나요?",
    answer: "해외 클라이언트와 영어로 통화할 때 주 1~2회 정도 씁니다. 발음 인식률이 개선되면 더 자주 쓸 것 같아요.",
    persona: "P07 · 34세 / UX 디자이너",
    cot: "UX 디자이너는 다국어 협업 도구에 대한 필요성이 있으며 해외 클라이언트와의 소통에서 번역 기능을 활용할 구체적 맥락이 존재함. 사용 빈도·이유가 페르소나 직무와 일관됨.",
    score: 91,
    result: "Pass",
    date: "2026-03-12 10:05",
  },
];

function ProjectPickerDialog({
  open,
  onClose,
  selected,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  selected: Set<string>;
  onConfirm: (ids: Set<string>) => void;
}) {
  const [pickerSearch, setPickerSearch] = useState("");
  const [temp, setTemp] = useState<Set<string>>(new Set(selected));

  // selected가 바뀌면 temp 동기화 (Dialog 열릴 때)
  useEffect(() => {
    if (open) setTemp(new Set(selected));
  }, [open, selected]);

  const toggle = (id: string) =>
    setTemp((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const filtered = VAL_PROJECTS.filter(
    (p) => p.name.toLowerCase().includes(pickerSearch.toLowerCase()) || p.owner.includes(pickerSearch)
  );

  const statusCls = (s: string) =>
    ({
      진행중: "bg-[var(--primary-light-bg)] text-primary border-[var(--primary-light-border)]",
      분석중: "bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]/30",
      완료: "bg-[var(--panel-soft)] text-[var(--muted-foreground)] border-[var(--border)]",
      대기: "bg-[var(--warning-light)] text-[var(--warning)] border-[var(--warning)]/30",
    })[s] ?? "bg-[var(--panel-soft)] text-[var(--muted-foreground)] border-[var(--border)]";

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="max-w-3xl overflow-hidden rounded-[32px] border-[var(--border)] bg-card p-0 gap-0 shadow-2xl">
        <DialogHeader className="border-b border-[var(--border)] bg-card px-8 py-6">
          <DialogTitle className="text-2xl font-black text-foreground tracking-tight">리서치 프로젝트 선택</DialogTitle>
          <p className="mt-2 text-[13px] font-medium leading-relaxed text-[var(--muted-foreground)]">
            접근 가능한 프로젝트만 표시됩니다. 체크 후 확인을 누르면 해당 프로젝트의 검증 로그를 필터합니다
          </p>
        </DialogHeader>

        {/* 검색 */}
        <div className="border-b border-[var(--border)] bg-background px-8 py-5">
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-card px-4 py-3 shadow-[var(--shadow-sm)] transition-all focus-within:border-primary">
            <Search size={13} className="text-[var(--subtle-foreground)] shrink-0" />
            <input
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              className="bg-transparent outline-none text-[13px] font-bold w-full text-foreground placeholder:text-[var(--subtle-foreground)] placeholder:font-medium"
              placeholder="프로젝트명, 담당자 검색..."
              autoFocus
            />
            {pickerSearch && (
              <button
                type="button"
                onClick={() => setPickerSearch("")}
                className="text-[var(--subtle-foreground)] hover:text-foreground"
              >
                <Plus size={13} className="rotate-45" />
              </button>
            )}
          </div>
        </div>

        {/* 프로젝트 목록 */}
        <div className="max-h-[420px] overflow-y-auto bg-card">
          <table className="w-full text-left text-[12px]">
            <thead className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--panel-soft)]/95 backdrop-blur-sm">
              <tr>
                <th className="w-10 px-6 py-3.5" />
                <th className="px-4 py-3.5 font-black text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                  프로젝트명
                </th>
                <th className="px-4 py-3.5 font-black text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                  담당자
                </th>
                <th className="px-4 py-3.5 font-black text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                  생성일
                </th>
                <th className="px-4 py-3.5 font-black text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                  상태
                </th>
                <th className="px-4 py-3.5 font-black text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                  접근
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-card">
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => p.accessible && toggle(p.id)}
                  className={cn(
                    "transition-colors",
                    p.accessible
                      ? "cursor-pointer hover:bg-[var(--surface-hover)]"
                      : "cursor-not-allowed bg-[var(--panel-soft)] opacity-40",
                    temp.has(p.id) && "bg-[var(--primary-light-bg2)]"
                  )}
                >
                  <td className="px-6 py-4">
                    <div
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all",
                        temp.has(p.id)
                          ? "bg-primary border-primary shadow-[0_2px_6px_rgba(47,102,255,0.25)]"
                          : "border-[var(--border)] bg-card"
                      )}
                    >
                      {temp.has(p.id) && (
                        <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1.5 4L4 6.5L8.5 1.5"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-black text-foreground">{p.name}</td>
                  <td className="px-4 py-4 font-bold text-[var(--secondary-foreground)]">{p.owner}</td>
                  <td className="px-4 py-4 font-bold text-[var(--muted-foreground)]">{p.created}</td>
                  <td className="px-4 py-4">
                    <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-black border", statusCls(p.status))}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {p.accessible ? (
                      <span className="text-[var(--success)] text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 size={11} /> 허용
                      </span>
                    ) : (
                      <span className="text-[var(--muted-foreground)] text-[11px] font-bold">제한</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-[13px] font-bold text-[var(--muted-foreground)]"
                  >
                    검색 결과가 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <DialogFooter className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--panel-soft)] px-8 py-5">
          <span className="text-[12px] font-bold text-[var(--muted-foreground)]">
            {temp.size > 0 ? `${temp.size}개 선택됨` : "선택 없음 (전체 표시)"}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setTemp(new Set())}>
              선택 초기화
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={onClose}>
              취소
            </Button>
            <Button
              size="sm"
              className="rounded-xl px-4"
              onClick={() => {
                onConfirm(temp);
                onClose();
              }}
            >
              확인
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ValidationSection() {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [resultFilter, setResultFilter] = useState<"전체" | "Pass" | "Flagged">("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [questionFilter, setQuestionFilter] = useState("전체");

  const selectedNames = VAL_PROJECTS.filter((p) => selectedProjects.has(p.id)).map((p) => p.name);

  const visibleLogs = VAL_LOGS.filter((log) => {
    if (selectedProjects.size > 0 && !selectedNames.includes(log.project)) return false;
    if (resultFilter !== "전체" && log.result !== resultFilter) return false;
    if (questionFilter !== "전체" && log.questionNo !== questionFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!log.q.toLowerCase().includes(q) && !log.answer.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <>
      <SectionTitle
        title="품질 검증 아카이브"
        desc="페르소나 응답 생성 시 AI가 거친 추론 과정과 품질 검증 이력을 기록하고 검토합니다"
      />
      <div className="grid grid-cols-1 gap-6">
        {/* 요약 스탯 */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="총 검증 건수" value="8,831" sub="누적 전체" tone="neutral" icon={FlaskConical} />
          <StatCard label="Pass" value="8,614" sub="97.5% 통과율" tone="success" icon={CheckCircle2} />
          <StatCard label="Flagged" value="217" sub="재검토 필요" tone="warn" icon={AlertTriangle} />
          <StatCard label="평균 신뢰도" value="93.2" sub="/ 100 기준" tone="primary" icon={Award} />
        </div>

        {/* 검증 로그 */}
        <SettingGroup title="응답 무결성 검증 로그">
          {/* 필터 바 */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {/* 검색 */}
            <div className="flex items-center gap-2 bg-[var(--panel-soft)] px-3 py-2.5 rounded-xl border border-[var(--border)] focus-within:border-primary focus-within:bg-card transition-all min-w-[180px] flex-1">
              <Search size={13} className="text-[var(--subtle-foreground)] shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-[12px] font-bold w-full text-foreground placeholder:text-[var(--subtle-foreground)] placeholder:font-medium"
                placeholder="질문 키워드, 답변 내용 검색..."
              />
            </div>

            {/* 프로젝트 피커 트리거 */}
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className={cn(
                "flex items-center gap-2 h-[38px] px-3.5 rounded-xl border text-[12px] font-bold transition-all shrink-0",
                selectedProjects.size > 0
                  ? "bg-[var(--primary-light-bg)] border-[var(--primary-light-border)] text-primary"
                  : "bg-card border-[var(--border)] text-[var(--secondary-foreground)] hover:border-primary/40"
              )}
            >
              <Briefcase size={13} />
              {selectedProjects.size > 0 ? (
                <span>프로젝트 {selectedProjects.size}개 선택</span>
              ) : (
                <span>전체 프로젝트</span>
              )}
              <ChevronDown size={12} className="text-[var(--muted-foreground)]" />
            </button>

            {/* 설문 항목 */}
            <select
              value={questionFilter}
              onChange={(e) => setQuestionFilter(e.target.value)}
              className="bg-card border border-[var(--border)] rounded-xl px-3 h-[38px] text-[12px] font-bold text-foreground outline-none focus:border-primary shrink-0"
            >
              <option value="전체">전체 설문 항목</option>
              <option value="Q1">Q1 — 컨셉 첫인상</option>
              <option value="Q2">Q2 — 매력도 평가</option>
              <option value="Q3">Q3 — 구매 의향</option>
              <option value="Q4">Q4 — 기능 인지도</option>
              <option value="Q5">Q5 — 가격 수용성</option>
            </select>

            {/* 결과 필터 */}
            {(["전체", "Pass", "Flagged"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setResultFilter(f)}
                className={cn(
                  "px-3 py-2 rounded-lg text-[12px] font-black border transition-all shrink-0",
                  resultFilter === f
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-[var(--secondary-foreground)] border-[var(--border)] hover:border-primary/40"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* 선택된 프로젝트 뱃지 */}
          {selectedProjects.size > 0 && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                필터 중:
              </span>
              {selectedNames.map((name) => (
                <span
                  key={name}
                  className="flex items-center gap-1 bg-[var(--primary-light-bg)] border border-[var(--primary-light-border)] text-primary text-[11px] font-bold px-2.5 py-1 rounded-lg"
                >
                  {name}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedProjects((prev) => {
                        const next = new Set(prev);
                        const id = VAL_PROJECTS.find((p) => p.name === name)?.id;
                        if (id) next.delete(id);
                        return next;
                      })
                    }
                    className="hover:opacity-60 transition-opacity ml-0.5"
                  >
                    <Plus size={11} className="rotate-45" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() => setSelectedProjects(new Set())}
                className="text-[11px] font-bold text-[var(--muted-foreground)] hover:text-foreground transition-colors"
              >
                전체 초기화
              </button>
            </div>
          )}

          <div className="space-y-3">
            {visibleLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-[var(--border)] bg-card overflow-hidden hover:border-[var(--border-hover)] transition-all"
              >
                <div className="flex items-center justify-between px-4 py-3 bg-[var(--panel-soft)] border-b border-[var(--border)]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono font-black text-[var(--subtle-foreground)] bg-card border border-[var(--border)] px-2 py-0.5 rounded-md shrink-0">
                      {log.id}
                    </span>
                    <span className="text-[11px] font-black text-[var(--secondary-foreground)] truncate">
                      {log.project}
                    </span>
                    <span className="text-[var(--subtle-foreground)]">›</span>
                    <span className="shrink-0 text-[10px] font-black text-primary bg-[var(--primary-light-bg)] border border-[var(--primary-light-border)] px-2 py-0.5 rounded-md">
                      {log.questionNo} {log.questionLabel}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tight border shrink-0",
                      log.result === "Pass"
                        ? "bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]/30"
                        : "bg-red-50 text-[var(--destructive)] border-red-100 animate-pulse"
                    )}
                  >
                    {log.result === "Flagged" ? "Hallucination Risk" : log.result}
                  </span>
                </div>
                <div className="px-4 py-4 space-y-3">
                  <div className="flex gap-2">
                    <span className="text-[11px] font-black text-[var(--muted-foreground)] shrink-0 mt-0.5">Q</span>
                    <p className="text-[13px] font-medium text-[var(--secondary-foreground)] leading-relaxed">
                      {log.q}
                    </p>
                  </div>
                  <div className="flex gap-2 p-3 bg-[var(--panel-soft)] rounded-lg border border-[var(--border)]">
                    <span className="text-[11px] font-black text-primary shrink-0 mt-0.5">A</span>
                    <p className="text-[13px] font-medium text-foreground leading-relaxed">{log.answer}</p>
                  </div>
                  <div className="p-3 border border-dashed border-[var(--border)] rounded-lg">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1.5">
                      <FlaskConical size={10} /> CoT 추론 요약
                    </p>
                    <p className="text-[12px] font-medium text-[var(--secondary-foreground)] leading-relaxed">
                      {log.cot}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                        <Users size={10} /> {log.persona}
                      </span>
                      <span className="text-[10px] font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                        <Clock size={10} /> {log.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" className="text-[11px] gap-1.5 h-7">
                        <Eye size={12} /> CoT 전체 보기
                      </Button>
                      <div className="flex items-center gap-1.5">
                        <div className="w-20 h-1.5 bg-[var(--panel-soft)] rounded-full overflow-hidden border border-[var(--border)]/50">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              log.score >= 80
                                ? "bg-primary"
                                : log.score >= 60
                                  ? "bg-[var(--warning)]"
                                  : "bg-[var(--destructive)]"
                            )}
                            style={{ width: `${log.score}%` }}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-[12px] font-black tabular-nums",
                            log.score >= 80
                              ? "text-primary"
                              : log.score >= 60
                                ? "text-[var(--warning)]"
                                : "text-[var(--destructive)]"
                          )}
                        >
                          {log.score}
                        </span>
                        <span className="text-[10px] text-[var(--subtle-foreground)]">/ 100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {visibleLogs.length === 0 && (
              <div className="py-12 text-center text-[13px] font-bold text-[var(--muted-foreground)]">
                조건에 맞는 검증 로그가 없습니다
              </div>
            )}
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-[12px] font-bold text-[var(--muted-foreground)]">
              {visibleLogs.length}건 표시 중 (전체 8,831건)
            </span>
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileText size={13} /> CSV 내보내기
            </Button>
          </div>
        </SettingGroup>
      </div>

      <ProjectPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selected={selectedProjects}
        onConfirm={setSelectedProjects}
      />
    </>
  );
}

/* ─── 섹션 콘텐츠 ─── */
const CONTENT: Record<string, React.ReactNode> = {
  projects: (
    <>
      <SectionTitle
        title="프로젝트 현황판"
        desc="진행 중인 전체 리서치 프로젝트 현황과 연결된 데이터 소스를 한눈에 확인합니다"
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
                placeholder="프로젝트명, 담당자, 소스 키워드 검색.."
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
                          <CalendarIcon size={10} /> {p.deadline}
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
      <SectionTitle title="멤버 & 접근 제어" desc="역할별 접근 권한과 민감 데이터 열람 통제 정책을 관리합니다" />
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
              placeholder="이름, 이메일, 역할 검색.."
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
                      cls: "border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] text-primary",
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
                      <td className="px-5 py-3.5 font-bold text-[var(--muted-foreground)] text-[12px] align-middle">
                        <div className="flex items-center gap-1.5">
                          <Clock size={11} /> {u.lastAccess}
                        </div>
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
  logs: <LogsSection />,
  validation: <ValidationSection />,
  security: (
    <>
      <SectionTitle
        title="보안 및 규정 준수"
        desc="데이터 보호를 위한 SSO 연동, IP 제어, 로그인 정책 등을 설정합니다"
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
        <div className="shrink-0 border-b border-[var(--border)] px-4 py-4 min-h-[112px] flex flex-col justify-center">
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
              전사 데이터 및 <span className="text-primary">AI 운영 통제소</span>
            </h1>
            <p className="app-page-description">
              리서치 프로젝트 마스터 관리, 데이터 스키마 커넥터, AI 프롬프트 감사 로그 및 사용자 데이터 접근 권한을 통합
              제어합니다
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
