import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dataApi, projectApi, type Project, type ProjectCreatePayload } from "@/lib/api";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Clock, BarChart2, ChevronRight,
  Target, Star,
  Globe, Package, Eye,
  MessageSquare,
  Loader,
  Database,
  Layers,
  Plus,
  Search,
  Upload,
  Users,
  X
} from "lucide-react";

type SurveyType = {
  id: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  tags: string[];
  questions: number;
  duration: string;
  difficulty: "쉬움" | "보통" | "전문";
  popular?: boolean;
  category: string;
};

const SURVEY_TYPES: SurveyType[] = [
  { id: "st1", icon: Target, title: "컨셉 테스트", desc: "신제품·서비스 컨셉의 소비자 반응 및 수용도를 측정합니다.", tags: ["신제품", "아이디어 검증"], questions: 18, duration: "8–12분", difficulty: "보통", popular: true, category: "제품" },
  { id: "st2", icon: BarChart2, title: "Usage 조사", desc: "제품·서비스의 실제 사용 행태와 패턴을 심층 분석합니다.", tags: ["사용 행태", "빈도"], questions: 22, duration: "10–15분", difficulty: "보통", popular: true, category: "사용자" },
  { id: "st3", icon: Globe, title: "브랜드 인식 조사", desc: "브랜드 인지도, 이미지, 경쟁 포지셔닝을 종합 분석합니다.", tags: ["브랜드", "인지도"], questions: 25, duration: "12–18분", difficulty: "전문", popular: true, category: "브랜드" },
  { id: "st4", icon: Star, title: "고객 만족도 (CSAT/NPS)", desc: "제품·서비스 만족도와 추천 의향을 정량적으로 측정합니다.", tags: ["만족도", "NPS"], questions: 14, duration: "5–8분", difficulty: "쉬움", category: "만족도" },
  { id: "st5", icon: Eye, title: "광고 효과 측정", desc: "광고 소재·캠페인의 인지도와 태도 변화를 측정합니다.", tags: ["광고", "캠페인"], questions: 16, duration: "7–10분", difficulty: "보통", category: "마케팅" },
  { id: "st6", icon: Package, title: "패키지 테스트", desc: "패키지 디자인, 컬러, 카피에 대한 소비자 반응을 측정합니다.", tags: ["디자인", "패키지"], questions: 20, duration: "10–14분", difficulty: "보통", category: "제품" },
];

const STATUS_STYLE: Record<Project["status"], { bg: string; text: string; label: string }> = {
  "진행중": { bg: "#EEF4FF", text: "#5B7DFF", label: "진행중" },
  "완료": { bg: "#F0FDF4", text: "#16A34A", label: "완료" },
  "초안": { bg: "#F7FAFF", text: "#7C8397", label: "초안" },
  "분석중": { bg: "#FFF7ED", text: "#EA580C", label: "분석중" },
};

/* ─── Project Card Component ─── */
const ProjectCard: React.FC<{ project: Project; onClick: () => void }> = ({ project, onClick }) => {
  const s = STATUS_STYLE[project.status] || STATUS_STYLE["초안"];
  const themeColor = project.typeColor || "#5B7DFF";
  const themeBg = project.typeBg || "#EEF4FF";

  return (
    <div onClick={onClick} className="app-card p-6 cursor-pointer hover:shadow-[var(--shadow-lg)] hover:border-primary/30 transition-all group flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <span className="px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tight"
          style={{ backgroundColor: themeBg, color: themeColor, borderColor: themeColor + "22" }}>
          {project.type}
        </span>
        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight" style={{ backgroundColor: s.bg, color: s.text }}>
          {s.label}
        </span>
      </div>
      <h3 className="text-[15px] font-black text-foreground leading-tight mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
      <div className="flex flex-wrap gap-1.5 mb-5">
        {(project.tags || []).map((t) => (
          <span key={t} className="bg-[var(--panel-soft)] border border-[var(--border)] text-muted-foreground px-2 py-0.5 rounded-md font-bold" style={{ fontSize: 10 }}>#{t}</span>
        ))}
      </div>
      <div className="mb-4 mt-auto">
        <div className="flex justify-between mb-1.5">
          <span className="text-[11px] font-black text-[var(--subtle-foreground)] uppercase tracking-widest">응답 수집</span>
          <span className="text-[11px] font-black text-foreground">{(project.responses || 0).toLocaleString()} / {(project.target || 0).toLocaleString()}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden shadow-inner">
          <div className="h-full rounded-full transition-all duration-1000 ease-out shadow-[var(--shadow-sm)]" style={{ width: `${Math.min(project.progress || 0, 100)}%`, backgroundColor: themeColor }} />
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border/30">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tighter flex items-center gap-1.5"><Clock size={12} className="text-[var(--subtle-foreground)]" /> {project.updatedAt || "방금 전"}</span>
        <div className="w-7 h-7 rounded-lg bg-[var(--panel-soft)] flex items-center justify-center text-[var(--subtle-foreground)] group-hover:bg-primary/10 group-hover:text-primary transition-all">
          <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
};

type WizardFormState = {
  name: string;
  type: string;
  purpose: string;
  description: string;
  target_responses: number;
  tags: string;
  data_sources: string[];
  custom_data_sources: string;
  attachmentNames: string[];
};

function buildInitialFormState(template?: SurveyType): WizardFormState {
  return {
    name: template ? `${template.title} 프로젝트` : "",
    type: template?.title ?? "컨셉 테스트",
    purpose: template?.desc ?? "",
    description: "",
    target_responses: 1000,
    tags: template?.tags.join(", ") ?? "",
    data_sources: ["demo", "purchase", "app_usage"],
    custom_data_sources: "survey, persona, simulation",
    attachmentNames: [],
  };
}

type DataSourceCard = {
  id: string;
  title: string;
  desc: string;
  category: string;
  icon: React.ElementType;
};

const DATA_SOURCE_CARD_META: Record<string, Omit<DataSourceCard, "id">> = {
  demo: { title: "고객 프로파일", desc: "나이, 성별, 지역 등 기본 인구통계 데이터", category: "기본", icon: Users },
  clv: { title: "CLV 데이터", desc: "고객 생애가치와 유지 성과를 반영하는 수익성 데이터", category: "가치", icon: Star },
  purchase: { title: "구매이력", desc: "온/오프라인 구매 패턴 및 카테고리별 소비 데이터", category: "구매", icon: Package },
  owned: { title: "보유 제품", desc: "삼성 제품 보유 현황과 디바이스 조합 데이터", category: "제품", icon: Layers },
  app_usage: { title: "앱 사용기록", desc: "앱/서비스 사용 패턴과 행동 데이터", category: "행동", icon: Globe },
  interests: { title: "관심사 데이터", desc: "콘텐츠 소비와 선호 카테고리 기반 관심사 데이터", category: "관심사", icon: MessageSquare },
  rewards: { title: "리워즈 데이터", desc: "혜택 참여와 멤버십 반응을 나타내는 데이터", category: "리워즈", icon: Database },
};

const DATA_PRESET: Record<string, string[]> = {
  st1: ["demo", "purchase", "app_usage"],
  st2: ["demo", "app_usage", "owned"],
  st3: ["demo", "interests", "rewards"],
  st4: ["demo", "purchase", "rewards"],
  st5: ["demo", "interests", "app_usage"],
  st6: ["demo", "purchase", "owned"],
  custom: [],
};

/* ─── Wizard Modal ─── */
const WizardModal: React.FC<{
  initialTemplate?: SurveyType;
  onClose: () => void;
  onSubmit: (payload: ProjectCreatePayload) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
}> = ({ initialTemplate, onClose, onSubmit, isSubmitting, submitError }) => {
  const [form, setForm] = useState<WizardFormState>(() => buildInitialFormState(initialTemplate));
  const [step, setStep] = useState(initialTemplate ? 1 : 0);
  const [selectedType, setSelectedType] = useState<SurveyType | null>(initialTemplate ?? null);
  const [typeSearch, setTypeSearch] = useState("");
  const [typeCategory, setTypeCategory] = useState("전체");
  const [typePage, setTypePage] = useState(0);
  const [dataSearch, setDataSearch] = useState("");
  const [dataPage, setDataPage] = useState(0);
  const { data: tables, isLoading: tablesLoading, isError: tablesError } = useQuery({
    queryKey: ["data-tables"],
    queryFn: () => dataApi.listTables(),
    retry: false,
  });
  const steps = ["목적 설정", "유형 선택", "데이터 연결"];
  const PAGE_SIZE = 4;
  const categories = ["전체", ...Array.from(new Set(SURVEY_TYPES.map((item) => item.category)))];
  const availableDataSources: DataSourceCard[] = Object.entries(tables ?? {})
    .filter(([, meta]) => meta.available)
    .map(([id]) => ({ id, ...(DATA_SOURCE_CARD_META[id] ?? {
      title: id,
      desc: "연결 가능한 데이터 소스",
      category: "기타",
      icon: Database,
    }) }));
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
  const filteredDataSources = availableDataSources.filter((item) => {
    const search = dataSearch.trim();
    return !search || item.title.includes(search) || item.desc.includes(search) || item.category.includes(search);
  });
  const pagedDataSources = filteredDataSources.slice(dataPage * PAGE_SIZE, (dataPage + 1) * PAGE_SIZE);

  const updateField = <K extends keyof WizardFormState>(key: K, value: WizardFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleDataSource = (source: string) => {
    setForm((prev) => ({
      ...prev,
      data_sources: prev.data_sources.includes(source)
        ? prev.data_sources.filter((item) => item !== source)
        : [...prev.data_sources, source],
    }));
  };

  const handleAttachmentChange = (files: FileList | null) => {
    if (!files) return;
    updateField("attachmentNames", Array.from(files).map((file) => file.name));
  };

  const handleNext = () => {
    if (step === 0) {
      if (!form.name.trim() || !form.purpose.trim()) return;
      setStep(1);
      return;
    }
    if (step === 1) {
      if (!selectedType) return;
      const preset = DATA_PRESET[selectedType.id] ?? [];
      setForm((prev) => ({
        ...prev,
        type: selectedType.title,
        purpose: prev.purpose.trim() || selectedType.desc,
        tags: prev.tags.trim() || selectedType.tags.join(", "),
        data_sources: preset,
      }));
      setStep(2);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const combinedDataSources = [
      ...form.data_sources,
      ...form.custom_data_sources.split(",").map((item) => item.trim()).filter(Boolean),
    ];
    await onSubmit({
      name: form.name.trim(),
      type: form.type.trim(),
      purpose: form.purpose.trim(),
      description: form.description.trim() || undefined,
      target_responses: Math.max(1, Number(form.target_responses) || 1),
      tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
      data_sources: Array.from(new Set(combinedDataSources)),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-[32px] bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-8 py-6">
          <div>
            <h2 className="text-2xl font-black">새 프로젝트 생성</h2>
            <p className="mt-2 text-[13px] font-medium text-muted-foreground">
              {[
                "리서치 목적과 프로젝트 이름을 입력하세요.",
                "조사 유형 템플릿을 선택하세요.",
                "연결할 데이터 소스를 선택한 뒤 프로젝트를 시작하세요.",
              ][step]}
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

        <div className="flex bg-background border-b border-[var(--border)] px-8 py-5 shrink-0">
          {steps.map((label, index) => (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-3">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black transition-all ${
                  index <= step ? "bg-primary text-white shadow-[var(--shadow-lg)]" : "bg-muted text-muted-foreground"
                }`}>
                  {index < step ? <Check size={14} strokeWidth={3} /> : index + 1}
                </div>
                <span className={`text-[12px] font-black uppercase tracking-tight ${index === step ? "text-foreground" : "text-[var(--subtle-foreground)]"}`}>
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && <div className={`mx-6 h-px flex-1 ${index < step ? "bg-primary/30" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-8 py-7">
          {step === 0 ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[12px] font-black uppercase tracking-wider text-[var(--subtle-foreground)]">프로젝트명</span>
                  <input
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="예: Galaxy S26 초기 반응 조사"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-semibold outline-none transition-colors focus:border-primary"
                    required
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-[12px] font-black uppercase tracking-wider text-[var(--subtle-foreground)]">목표 응답 수</span>
                  <input
                    type="number"
                    min={1}
                    value={form.target_responses}
                    onChange={(event) => updateField("target_responses", Number(event.target.value))}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-semibold outline-none transition-colors focus:border-primary"
                    required
                  />
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-[12px] font-black uppercase tracking-wider text-[var(--subtle-foreground)]">조사 목적</span>
                <textarea
                  value={form.purpose}
                  onChange={(event) => updateField("purpose", event.target.value)}
                  placeholder="예: 20~30대 실사용자를 대상으로 신규 기능 수용도를 파악하고 싶습니다."
                  className="min-h-[110px] w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-semibold outline-none transition-colors focus:border-primary"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-[12px] font-black uppercase tracking-wider text-[var(--subtle-foreground)]">설명</span>
                <textarea
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="배경 설명이나 프로젝트 컨텍스트를 남겨두면 이후 설문 설계에 활용할 수 있습니다."
                  className="min-h-[88px] w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-semibold outline-none transition-colors focus:border-primary"
                />
              </label>

              <div>
                <span className="text-[12px] font-black uppercase tracking-wider text-[var(--subtle-foreground)]">참고자료</span>
                <label className="mt-2 flex items-center gap-4 w-full px-5 py-4 rounded-[14px] border border-dashed border-[var(--primary-light-border)] bg-card hover:bg-[var(--primary-light-bg)] hover:border-[var(--primary-active-border)] transition-all cursor-pointer group shadow-[var(--shadow-sm)]">
                  <input type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.csv" className="hidden" onChange={(event) => handleAttachmentChange(event.target.files)} />
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

          {step === 1 ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--subtle-foreground)]" />
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
                      <item.icon className={`h-5 w-5 ${selectedType?.id === item.id ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className={`text-[13px] font-bold ${selectedType?.id === item.id ? "text-primary" : "text-foreground"}`}>{item.title}</p>
                      <p className="mt-1 text-[11px] font-medium leading-relaxed text-muted-foreground line-clamp-2">{item.desc}</p>
                    </div>
                    {item.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="rounded-md border border-[var(--border)] bg-[var(--panel-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--secondary-foreground)]">
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

          {step === 2 ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-black uppercase tracking-[0.16em] text-primary">데이터 연결</p>
                  <p className="mt-1 text-[13px] font-medium text-[var(--muted-foreground)]">
                    backend `/api/data/tables` 기준으로 연결 가능한 데이터 소스를 선택합니다.
                  </p>
                </div>
              </div>

              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--subtle-foreground)]" />
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

              {tablesLoading ? (
                <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-card px-4 py-8 text-[13px] font-semibold text-muted-foreground">
                  <Loader size={14} className="animate-spin" /> 연결 가능한 데이터 소스를 확인하는 중...
                </div>
              ) : tablesError ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-6 text-[13px] font-semibold text-amber-700">
                  데이터 소스 목록을 불러오지 못했습니다. backend `/api/data/tables` 연결 상태를 확인해주세요.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {pagedDataSources.map((item) => {
                      const selected = form.data_sources.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleDataSource(item.id)}
                          className={`app-card p-5 text-left transition-all ${
                            selected
                              ? "border-primary bg-[var(--primary-light-bg)] shadow-[var(--shadow-md)] ring-1 ring-primary"
                              : "hover:border-primary/30 hover:bg-card"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                              selected ? "bg-primary border-primary text-white shadow-[var(--shadow-sm)]" : "bg-[var(--panel-soft)] border-[var(--border)] text-muted-foreground"
                            }`}>
                              <item.icon className="h-5 w-5" />
                            </div>
                            {selected ? <Check size={16} className="text-primary" /> : null}
                          </div>
                          <div className="mt-3">
                            <p className={`text-[13px] font-bold ${selected ? "text-primary" : "text-foreground"}`}>{item.title}</p>
                            <p className="mt-1 text-[11px] font-medium leading-relaxed text-muted-foreground">{item.desc}</p>
                            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--subtle-foreground)]">{item.category}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {Math.ceil(filteredDataSources.length / PAGE_SIZE) > 1 ? (
                    <div className="flex items-center justify-center gap-1.5">
                      {Array.from({ length: Math.ceil(filteredDataSources.length / PAGE_SIZE) }).map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setDataPage(index)}
                          className={`h-2 rounded-full transition-all ${dataPage === index ? "w-5 bg-primary" : "w-2 bg-[var(--border)] hover:bg-[var(--border-hover)]"}`}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              )}

              <label className="space-y-2">
                <span className="text-[12px] font-black uppercase tracking-wider text-[var(--subtle-foreground)]">추가 데이터 소스</span>
                <input
                  value={form.custom_data_sources}
                  onChange={(event) => updateField("custom_data_sources", event.target.value)}
                  placeholder="예: survey, persona, simulation"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-semibold outline-none transition-colors focus:border-primary"
                />
              </label>
            </div>
          ) : null}

          {step === 0 ? (
            <div className="grid gap-5 md:grid-cols-3">
            <label className="space-y-2 md:col-span-3">
              <span className="text-[12px] font-black uppercase tracking-wider text-[var(--subtle-foreground)]">태그</span>
              <input
                value={form.tags}
                onChange={(event) => updateField("tags", event.target.value)}
                placeholder="쉼표로 구분해 입력"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-semibold outline-none transition-colors focus:border-primary"
              />
            </label>
          </div>
          ) : null}

          {submitError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">
              {submitError}
            </div>
          ) : null}

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
                type="submit"
                disabled={isSubmitting || !form.name.trim() || !form.purpose.trim()}
                className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-10 py-3 text-[14px] font-black text-white transition-all hover:bg-primary-hover disabled:opacity-40 shadow-[var(--shadow-lg)] active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" /> 프로젝트 생성 중...
                  </>
                ) : (
                  <>
                    프로젝트 시작 <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Main HomePage Component ─── */
export function HomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardTemplate, setWizardTemplate] = useState<SurveyType | undefined>();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectApi.getProjects(1, 4),
    retry: false,
  });

  const createProjectMutation = useMutation({
    mutationFn: projectApi.createProject,
    onSuccess: async (project) => {
      if (!project) {
        setSubmitError("프로젝트를 생성하지 못했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      setWizardOpen(false);
      setWizardTemplate(undefined);
      setSubmitError(null);
      navigate("/survey", { state: { projectId: project.id } });
    },
    onError: () => {
      setSubmitError("프로젝트 생성 요청 중 오류가 발생했습니다.");
    },
  });

  const projects = data?.items ?? [];

  const openWizard = (tmpl?: SurveyType) => {
    setWizardTemplate(tmpl);
    setSubmitError(null);
    setWizardOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background px-10 pt-8 pb-4">
      <div className="space-y-8">
        {/* Welcome Section */}
        <section className="app-card p-7 border relative overflow-hidden group">
          <div className="relative z-10">
            <h1 className="text-2xl font-black">안녕하세요, <span className="text-primary">관리자</span>님.</h1>
            <p className="mt-3 text-[13px] font-medium text-muted-foreground">가상 페르소나 리서치 허브에 오신 것을 환영합니다.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => openWizard()} className="bg-primary text-white px-6 py-2.5 rounded-xl font-black shadow-lg hover:scale-105 transition-transform active:scale-95">새 프로젝트 시작</button>
              <button className="bg-card border border-border px-6 py-2.5 rounded-xl font-black hover:bg-muted transition-colors">데이터 불러오기</button>
            </div>
          </div>
        </section>

        {/* Recent Projects Section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black">최근 프로젝트</h2>
              {isError && <span className="text-[9px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">OFFLINE</span>}
            </div>
            {isError && (
              <button
                type="button"
                onClick={() => void refetch()}
                className="rounded-xl border border-[var(--border)] bg-card px-4 py-2 text-[12px] font-black text-[var(--secondary-foreground)] transition-colors hover:bg-[var(--panel-soft)]"
              >
                다시 시도
              </button>
            )}
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {isLoading && !data ? (
              <div className="col-span-full py-20 flex justify-center"><Loader className="animate-spin text-primary opacity-20" /></div>
            ) : isError ? (
              <div className="col-span-full rounded-[28px] border border-amber-200 bg-amber-50/70 px-6 py-10 text-center">
                <p className="text-[15px] font-black text-amber-700">프로젝트 목록을 불러오지 못했습니다.</p>
                <p className="mt-2 text-[13px] font-medium text-amber-700/80">
                  백엔드 연결 상태를 확인한 뒤 다시 시도해주세요. 홈 화면은 더 이상 목업 프로젝트로 대체하지 않습니다.
                </p>
              </div>
            ) : projects.length === 0 ? (
              <div className="col-span-full rounded-[28px] border border-[var(--border)] bg-card px-6 py-12 text-center shadow-[var(--shadow-sm)]">
                <p className="text-[16px] font-black text-foreground">아직 생성된 프로젝트가 없습니다.</p>
                <p className="mt-2 text-[13px] font-medium text-muted-foreground">
                  새 프로젝트를 시작하거나 템플릿을 선택해 첫 조사 흐름을 생성하세요.
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => openWizard()}
                    className="rounded-2xl bg-primary px-5 py-3 text-[13px] font-black text-white shadow-lg"
                  >
                    새 프로젝트 시작
                  </button>
                  <button
                    type="button"
                    onClick={() => openWizard(SURVEY_TYPES[0])}
                    className="rounded-2xl border border-[var(--border)] bg-card px-5 py-3 text-[13px] font-black text-[var(--secondary-foreground)]"
                  >
                    추천 템플릿 사용
                  </button>
                </div>
              </div>
            ) : (
              projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => navigate("/survey", { state: { projectId: project.id } })}
                />
              ))
            )}
          </div>
        </section>

        {/* Template Library Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-base font-black">템플릿 라이브러리</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {SURVEY_TYPES.map(t => (
              <div key={t.id} onClick={() => openWizard(t)} className="app-card p-7 cursor-pointer hover:border-primary/40 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <t.icon size={20} />
                </div>
                <h4 className="text-[16px] font-black mb-1.5">{t.title}</h4>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {wizardOpen && (
        <WizardModal
          initialTemplate={wizardTemplate}
          onClose={() => setWizardOpen(false)}
          onSubmit={async (payload) => {
            setSubmitError(null);
            await createProjectMutation.mutateAsync(payload);
          }}
          isSubmitting={createProjectMutation.isPending}
          submitError={submitError}
        />
      )}
    </div>
  );
}
