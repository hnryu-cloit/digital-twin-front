import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Database,
  Key,
  Network,
  Package,
  Plus,
  Search,
  TableProperties,
  Target,
  Upload,
  X,
  Zap,
} from "lucide-react";
import type React from "react";
import type { ProjectCreatePayload } from "@/lib/api";
import { DATA_PRESET, SURVEY_TYPES, type SurveyType } from "@/components/home/wizardTypes";

/* ─── Data connection sources (SettingsPage 데이터소스와 동기화) ─── */
type DataConnectionSource = {
  id: string;
  name: string;
  connector: string;
  status: "Healthy" | "Warning" | "Idle";
  lastSync: string;
  icon: React.ElementType;
};

const DATA_CONNECTION_SOURCES: DataConnectionSource[] = [
  {
    id: "pos_tx",
    name: "삼성 POS 트랜잭션",
    connector: "GCS 배치 업로드",
    status: "Healthy",
    lastSync: "1시간 전",
    icon: Database,
  },
  {
    id: "crm_api",
    name: "Global CRM API",
    connector: "Direct Connection",
    status: "Warning",
    lastSync: "연결 오류",
    icon: Network,
  },
  {
    id: "social",
    name: "소셜 미디어 리뷰",
    connector: "Webhook",
    status: "Healthy",
    lastSync: "실시간",
    icon: Activity,
  },
  {
    id: "survey_db",
    name: "고객 설문 응답 DB",
    connector: "PostgreSQL",
    status: "Healthy",
    lastSync: "5분 전",
    icon: TableProperties,
  },
  {
    id: "app_log",
    name: "앱 행동 로그 (Firebase)",
    connector: "GCP SDK Integration",
    status: "Healthy",
    lastSync: "실시간",
    icon: Zap,
  },
  {
    id: "membership",
    name: "삼성 멤버십 프로파일",
    connector: "REST API",
    status: "Healthy",
    lastSync: "30분 전",
    icon: Key,
  },
  {
    id: "panel",
    name: "외부 패널 파트너 (Embrain)",
    connector: "SFTP Batch",
    status: "Idle",
    lastSync: "어제 23:00",
    icon: Package,
  },
  {
    id: "ad_data",
    name: "광고 반응 데이터 (Criteo)",
    connector: "API Connector",
    status: "Warning",
    lastSync: "인증 만료",
    icon: Target,
  },
];

/* 템플릿별 Gemini 추천 초기 선택 */
const CONNECTION_PRESET: Record<string, string[]> = {
  st1: ["pos_tx", "survey_db", "membership"],
  st2: ["app_log", "membership", "pos_tx"],
  st3: ["social", "panel", "ad_data"],
  st4: ["survey_db", "membership", "crm_api"],
  st5: ["ad_data", "social", "app_log"],
  st6: ["survey_db", "social", "panel"],
  custom: [],
};

const STATUS_STYLE = {
  Healthy: { dot: "bg-green-500", badge: "bg-green-50 text-green-700 border-green-200" },
  Warning: { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  Idle: {
    dot: "bg-[var(--border)]",
    badge: "bg-[var(--panel-soft)] text-[var(--muted-foreground)] border-[var(--border)]",
  },
};

const defaultRange = () => {
  const to = new Date();
  const from = new Date();
  from.setFullYear(from.getFullYear() - 1);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
};

/* ─── Form state ─── */
type WizardFormState = {
  name: string;
  type: string;
  purpose: string;
  description: string;
  tags: string;
  attachmentNames: string[];
};

function buildInitialFormState(template?: SurveyType): WizardFormState {
  return {
    name: template ? `${template.title} 프로젝트` : "",
    type: template?.title ?? "컨셉 테스트",
    purpose: template?.desc ?? "",
    description: "",
    tags: template?.tags.join(", ") ?? "",
    attachmentNames: [],
  };
}

interface WizardModalProps {
  initialTemplate?: SurveyType;
  onClose: () => void;
  onSubmit: (payload: ProjectCreatePayload) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
}

export function WizardModal({ initialTemplate, onClose, onSubmit, isSubmitting, submitError }: WizardModalProps) {
  const [form, setForm] = useState<WizardFormState>(() => buildInitialFormState(initialTemplate));
  const [step, setStep] = useState(initialTemplate ? 1 : 0);
  const [selectedType, setSelectedType] = useState<SurveyType | null>(initialTemplate ?? null);
  const [typeSearch, setTypeSearch] = useState("");
  const [typeCategory, setTypeCategory] = useState("전체");
  const [typePage, setTypePage] = useState(0);
  const [dataSearch, setDataSearch] = useState("");
  const [dataPage, setDataPage] = useState(0);
  const [selectedData, setSelectedData] = useState<string[]>([]);
  const [dataRanges, setDataRanges] = useState<Record<string, { from: string; to: string }>>({});
  const [expandedData, setExpandedData] = useState<string | null>(null);

  const steps = ["목적 설정", "유형 선택", "데이터 연결"];
  const PAGE_SIZE = 4;
  const categories = ["전체", ...Array.from(new Set(SURVEY_TYPES.map((item) => item.category)))];

  const filteredTypes = SURVEY_TYPES.filter((item) => {
    const categoryMatch = typeCategory === "전체" || item.category === typeCategory;
    const search = typeSearch.trim();
    const searchMatch =
      !search ||
      item.title.includes(search) ||
      item.desc.includes(search) ||
      item.tags.some((tag) => tag.includes(search));
    return categoryMatch && searchMatch;
  });

  const customType: SurveyType = {
    id: "custom",
    icon: Plus,
    title: "직접 만들기",
    desc: "템플릿 없이 직접 목적과 문항 전략을 설계합니다.",
    tags: [],
    questions: 0,
    duration: "자유",
    difficulty: "보통",
    category: "기타",
  };
  const typeCards = [customType, ...filteredTypes];
  const pagedTypes = typeCards.slice(typePage * PAGE_SIZE, (typePage + 1) * PAGE_SIZE);

  const isDataSearching = dataSearch.trim().length > 0;
  const filteredDataSources = isDataSearching
    ? DATA_CONNECTION_SOURCES.filter(
        (d) => d.name.includes(dataSearch) || d.connector.includes(dataSearch) || d.status.includes(dataSearch)
      )
    : DATA_CONNECTION_SOURCES;
  const pagedDataSources = filteredDataSources.slice(dataPage * PAGE_SIZE, (dataPage + 1) * PAGE_SIZE);

  const updateField = <K extends keyof WizardFormState>(key: K, value: WizardFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAttachmentChange = (files: FileList | null) => {
    if (!files) return;
    updateField(
      "attachmentNames",
      Array.from(files).map((file) => file.name)
    );
  };

  const toggleData = (id: string) => {
    setSelectedData((prev) => {
      if (prev.includes(id)) {
        setDataRanges((r) => {
          const next = { ...r };
          delete next[id];
          return next;
        });
        setExpandedData((e) => (e === id ? null : e));
        return prev.filter((d) => d !== id);
      }
      setDataRanges((r) => ({ ...r, [id]: defaultRange() }));
      return [...prev, id];
    });
  };

  const updateRange = (id: string, field: "from" | "to", value: string) => {
    setDataRanges((r) => {
      const updated = { ...r, [id]: { ...r[id], [field]: value } };
      const newVal = updated[id];
      selectedData.forEach((sid) => {
        updated[sid] = { ...updated[sid], [field]: newVal[field] };
      });
      return updated;
    });
  };

  const handleNext = () => {
    if (step === 0) {
      if (!form.name.trim() || !form.purpose.trim()) return;
      setStep(1);
      return;
    }
    if (step === 1) {
      if (!selectedType) return;
      const preset = CONNECTION_PRESET[selectedType.id] ?? DATA_PRESET[selectedType.id] ?? [];
      setSelectedData(preset);
      setDataRanges(Object.fromEntries(preset.map((id) => [id, defaultRange()])));
      setDataSearch("");
      setDataPage(0);
      setForm((prev) => ({
        ...prev,
        type: selectedType.title,
        purpose: prev.purpose.trim() || selectedType.desc,
        tags: prev.tags.trim() || selectedType.tags.join(", "),
      }));
      setStep(2);
    }
  };

  const handleCreate = async () => {
    await onSubmit({
      name: form.name.trim(),
      type: form.type.trim(),
      purpose: form.purpose.trim(),
      description: form.description.trim() || undefined,
      tags: form.tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      data_sources: selectedData,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-[32px] bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-8 py-6">
          <div>
            <h2 className="text-2xl font-black">새 프로젝트 생성</h2>
            <p className="mt-2 text-[13px] font-medium text-muted-foreground">
              {
                [
                  "리서치 목적과 프로젝트 이름을 입력하세요.",
                  "조사 유형 템플릿을 선택하세요.",
                  "참고할 데이터 소스를 연결하세요.",
                ][step]
              }
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-[var(--panel-soft)] text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex bg-background border-b border-[var(--border)] px-8 py-5 shrink-0">
          {steps.map((label, index) => (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black transition-all ${
                    index <= step ? "bg-primary text-white shadow-[var(--shadow-lg)]" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index < step ? <Check size={14} strokeWidth={3} /> : index + 1}
                </div>
                <span
                  className={`text-[12px] font-black uppercase tracking-tight ${index === step ? "text-foreground" : "text-[var(--subtle-foreground)]"}`}
                >
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`mx-6 h-px flex-1 ${index < step ? "bg-primary/30" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6 px-8 py-7">
          <div className="min-h-[420px]">
            {/* Step 0: 목적 설정 */}
            {step === 0 ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-[12px] font-black uppercase tracking-wider text-[var(--subtle-foreground)]">
                      프로젝트명
                    </span>
                    <input
                      value={form.name}
                      onChange={(event) => updateField("name", event.target.value)}
                      placeholder="예: Galaxy S26 초기 반응 조사"
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-semibold outline-none transition-colors focus:border-primary"
                    />
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-[12px] font-black uppercase tracking-wider text-[var(--subtle-foreground)]">
                    조사 목적
                  </span>
                  <textarea
                    value={form.purpose}
                    onChange={(event) => updateField("purpose", event.target.value)}
                    placeholder="예: 20~30대 실사용자를 대상으로 신규 기능 수용도를 파악하고 싶습니다."
                    className="min-h-[88px] w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-semibold outline-none transition-colors focus:border-primary"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[12px] font-black uppercase tracking-wider text-[var(--subtle-foreground)]">
                    설명
                  </span>
                  <textarea
                    value={form.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    placeholder="배경 설명이나 프로젝트 컨텍스트를 남겨두면 이후 설문 설계에 활용할 수 있습니다."
                    className="min-h-[88px] w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-semibold outline-none transition-colors focus:border-primary"
                  />
                </label>

                <div>
                  <span className="text-[12px] font-black uppercase tracking-wider text-[var(--subtle-foreground)]">
                    참고자료
                  </span>
                  <label className="mt-2 flex items-center gap-4 w-full px-5 py-4 rounded-[14px] border border-dashed border-[var(--primary-light-border)] bg-card hover:bg-[var(--primary-light-bg)] hover:border-[var(--primary-active-border)] transition-all cursor-pointer group shadow-[var(--shadow-sm)]">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.csv"
                      className="hidden"
                      onChange={(event) => handleAttachmentChange(event.target.files)}
                    />
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-light-bg)] border border-[var(--primary-light-border)] text-primary group-hover:bg-white transition-colors">
                      <Upload size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-foreground">관련 자료 업로드</p>
                      <p className="text-[11px] font-medium text-[var(--subtle-foreground)] mt-0.5">
                        PDF, PPT, Word, Excel · 최대 10MB
                      </p>
                      {form.attachmentNames.length > 0 ? (
                        <p className="mt-2 truncate text-[11px] font-semibold text-primary">
                          {form.attachmentNames.join(", ")}
                        </p>
                      ) : null}
                    </div>
                  </label>
                </div>
              </div>
            ) : null}

            {/* Step 1: 유형 선택 */}
            {step === 1 ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="relative">
                  <Search
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--subtle-foreground)]"
                  />
                  <input
                    className="w-full rounded-2xl border border-border bg-background pl-10 pr-4 py-3 text-[13px] font-semibold outline-none transition-colors focus:border-primary"
                    placeholder="템플릿 검색..."
                    value={typeSearch}
                    onChange={(event) => {
                      setTypeSearch(event.target.value);
                      setTypePage(0);
                    }}
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setTypeCategory(category);
                        setTypePage(0);
                      }}
                      className={`px-3 py-1 rounded-full border text-[11px] font-semibold transition-all ${
                        typeCategory === category
                          ? "bg-primary border-primary text-white shadow-[var(--shadow-sm)]"
                          : "border-[var(--border)] text-[var(--secondary-foreground)] hover:border-primary/40 hover:text-primary"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {pagedTypes.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedType(item)}
                      className={`flex flex-col gap-3 app-card p-5 text-left transition-all ${item.id === "custom" ? "border-dashed" : ""} ${
                        selectedType?.id === item.id
                          ? "border-primary bg-[var(--primary-light-bg)] shadow-[var(--shadow-md)] ring-1 ring-primary"
                          : "hover:border-primary/30 hover:bg-card"
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] shadow-[var(--shadow-sm)]">
                        <item.icon
                          className={`h-5 w-5 ${selectedType?.id === item.id ? "text-primary" : "text-muted-foreground"}`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-[13px] font-bold ${selectedType?.id === item.id ? "text-primary" : "text-foreground"}`}
                        >
                          {item.title}
                        </p>
                        <p className="mt-1 text-[11px] font-medium leading-relaxed text-muted-foreground line-clamp-2">
                          {item.desc}
                        </p>
                      </div>
                      {item.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {item.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md border border-[var(--border)] bg-[var(--panel-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--secondary-foreground)]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </button>
                  ))}
                </div>

                {Math.ceil(typeCards.length / PAGE_SIZE) > 1 ? (
                  <div className="flex items-center justify-center gap-1.5">
                    {Array.from({ length: Math.ceil(typeCards.length / PAGE_SIZE) }).map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setTypePage(index)}
                        className={`h-2 rounded-full transition-all ${typePage === index ? "w-5 bg-primary" : "w-2 bg-[var(--border)] hover:bg-[var(--border-hover)]"}`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Step 2: 데이터 연결 */}
            {step === 2 ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-[var(--subtle-foreground)]">
                    {selectedData.length > 0
                      ? `${selectedData.length}개 선택됨 · 날짜 범위를 설정하면 해당 기간 데이터만 활용됩니다`
                      : "연결할 데이터 소스를 선택하세요"}
                  </p>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--subtle-foreground)]"
                  />
                  <input
                    className="w-full rounded-2xl border border-border bg-background pl-10 pr-4 py-3 text-[13px] font-semibold outline-none transition-colors focus:border-primary"
                    placeholder="데이터 소스 검색..."
                    value={dataSearch}
                    onChange={(event) => {
                      setDataSearch(event.target.value);
                      setDataPage(0);
                    }}
                  />
                </div>

                {/* Cards */}
                {isDataSearching && filteredDataSources.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-[var(--subtle-foreground)]">
                    <Search size={22} className="opacity-40" />
                    <p className="text-[13px] font-medium">'{dataSearch}'에 맞는 데이터 소스가 없어요</p>
                  </div>
                ) : isDataSearching ? (
                  /* 검색 중: 리스트 뷰 */
                  <div className="flex flex-col gap-2">
                    {filteredDataSources.map((d) => {
                      const isSelected = selectedData.includes(d.id);
                      const style = STATUS_STYLE[d.status];
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => toggleData(d.id)}
                          className={`flex items-center gap-4 px-4 py-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "border-primary bg-[var(--primary-light-bg)] ring-1 ring-primary"
                              : "border-[var(--border)] bg-card hover:border-primary/30 hover:bg-[var(--primary-light-bg2)]"
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${isSelected ? "bg-primary border-primary text-white" : "bg-[var(--panel-soft)] border-[var(--border)] text-muted-foreground"}`}
                          >
                            <d.icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-[13px] font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}
                            >
                              {d.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">{d.connector}</p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold flex items-center gap-1 ${style.badge}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                            {d.status}
                          </span>
                          {isSelected ? <Check size={15} className="shrink-0 text-primary" /> : null}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* 기본: 2열 그리드 + 페이지네이션 */
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {pagedDataSources.map((d) => {
                        const isSelected = selectedData.includes(d.id);
                        const isExpanded = expandedData === d.id;
                        const range = dataRanges[d.id];
                        const style = STATUS_STYLE[d.status];
                        return (
                          <div
                            key={d.id}
                            className={`app-card text-left transition-all overflow-hidden ${
                              isSelected
                                ? "border-primary bg-[var(--primary-light-bg)] shadow-[var(--shadow-md)] ring-1 ring-primary"
                                : "hover:border-primary/30 hover:bg-card"
                            }`}
                          >
                            {/* 카드 메인 */}
                            <button
                              type="button"
                              className="w-full p-5 flex flex-col gap-3 text-left"
                              onClick={() => toggleData(d.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                                    isSelected
                                      ? "bg-primary border-primary text-white shadow-[var(--shadow-sm)]"
                                      : "bg-[var(--panel-soft)] border-[var(--border)] text-muted-foreground"
                                  }`}
                                >
                                  <d.icon className="h-5 w-5" />
                                </div>
                                {isSelected ? (
                                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                                    <Check size={11} className="text-white" strokeWidth={3} />
                                  </div>
                                ) : null}
                              </div>
                              <div>
                                <p
                                  className={`text-[13px] font-bold ${isSelected ? "text-primary" : "text-foreground"}`}
                                >
                                  {d.name}
                                </p>
                                <p className="mt-0.5 text-[11px] font-medium text-muted-foreground truncate">
                                  {d.connector}
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-[10px] font-bold flex items-center gap-1 ${style.badge}`}
                                >
                                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                                  {d.status}
                                </span>
                                <span className="text-[10px] font-medium text-[var(--subtle-foreground)]">
                                  {d.lastSync}
                                </span>
                              </div>
                            </button>

                            {/* 선택 시: 날짜 범위 설정 */}
                            {isSelected ? (
                              <div className="px-5 pb-4">
                                {isExpanded ? (
                                  <div
                                    className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <input
                                      type="date"
                                      value={range?.from ?? ""}
                                      onChange={(e) => updateRange(d.id, "from", e.target.value)}
                                      className="rounded-xl border border-border bg-background px-2 py-1.5 text-[11px] font-semibold outline-none flex-1 focus:border-primary"
                                    />
                                    <span className="text-[10px] text-[var(--subtle-foreground)] shrink-0">~</span>
                                    <input
                                      type="date"
                                      value={range?.to ?? ""}
                                      onChange={(e) => updateRange(d.id, "to", e.target.value)}
                                      className="rounded-xl border border-border bg-background px-2 py-1.5 text-[11px] font-semibold outline-none flex-1 focus:border-primary"
                                    />
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedData(null);
                                      }}
                                      className="shrink-0 px-2.5 py-1.5 rounded-lg bg-primary text-white text-[11px] font-bold transition-all hover:bg-primary-hover"
                                    >
                                      확인
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-medium text-[var(--primary-active-text)]">
                                      {range?.from && range?.to ? `${range.from} ~ ${range.to}` : "기간 미설정"}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedData(d.id);
                                      }}
                                      className="text-[11px] font-semibold text-primary hover:underline underline-offset-2"
                                    >
                                      설정
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>

                    {Math.ceil(DATA_CONNECTION_SOURCES.length / PAGE_SIZE) > 1 ? (
                      <div className="flex items-center justify-center gap-1.5">
                        {Array.from({ length: Math.ceil(DATA_CONNECTION_SOURCES.length / PAGE_SIZE) }).map(
                          (_, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setDataPage(index)}
                              className={`h-2 rounded-full transition-all ${dataPage === index ? "w-5 bg-primary" : "w-2 bg-[var(--border)] hover:bg-[var(--border-hover)]"}`}
                            />
                          )
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}

            {submitError ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">
                {submitError}
              </div>
            ) : null}
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between border-t border-[var(--border)] pt-5">
            <button
              type="button"
              onClick={() => {
                if (step === 0) onClose();
                else setStep(step - 1);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-card px-6 py-3 text-[13px] font-black text-muted-foreground transition-all hover:bg-[var(--surface-hover)] active:scale-95 shadow-[var(--shadow-sm)]"
            >
              {step === 0 ? "취소" : <ChevronLeft size={16} />}
              {step === 0 ? null : "이전"}
            </button>

            {step < 2 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={(step === 0 && (!form.name.trim() || !form.purpose.trim())) || (step === 1 && !selectedType)}
                className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-10 py-3 text-[14px] font-black text-white transition-all hover:bg-primary-hover disabled:opacity-40 shadow-[var(--shadow-lg)] active:scale-95"
              >
                다음 단계로 <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleCreate()}
                disabled={isSubmitting || !form.name.trim() || !form.purpose.trim()}
                className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-10 py-3 text-[14px] font-black text-white transition-all hover:bg-primary-hover disabled:opacity-40 shadow-[var(--shadow-lg)] active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    프로젝트 생성 중...
                  </>
                ) : (
                  <>
                    프로젝트 시작 <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
