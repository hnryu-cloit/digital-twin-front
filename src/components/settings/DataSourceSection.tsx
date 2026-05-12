import { useState } from "react";
import {
  Database,
  Network,
  Activity,
  TableProperties,
  Zap,
  Key,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Info,
  RefreshCw,
  ChevronDown,
  LayoutGrid as LayoutGridIcon,
  List,
  Plus,
  Plug,
  Package,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionTitle } from "@/components/settings/SectionTitle";
import { SettingGroup } from "@/components/settings/SettingGroup";
import { StatCard } from "@/components/settings/StatCard";

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

export function DataSourceSection() {
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
