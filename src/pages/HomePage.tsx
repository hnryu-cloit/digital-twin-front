import type React from "react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectApi, type Project, type ProjectCreatePayload } from "@/lib/api";
import {
  Clock, BarChart2, ChevronRight,
  Target, Star,
  Globe, Package, Eye,
  Loader,
  X
} from "lucide-react";

/* ─── Static Mock Data ─── */
const MOCK_PROJECTS: Project[] = [
  { id: "pr1", title: "Galaxy S26 컨셉 테스트", type: "컨셉 테스트", status: "진행중", progress: 67, responses: 1340, target: 2000, updatedAt: "2시간 전", tags: ["스마트폰", "신제품"] },
  { id: "pr2", title: "MZ세대 스마트폰 Usage 조사", type: "Usage 조사", status: "분석중", progress: 100, responses: 3200, target: 3000, updatedAt: "1일 전", tags: ["MZ", "사용행태"] },
  { id: "pr3", title: "브랜드 인지도 조사 Q1 2026", type: "브랜드 인식", status: "완료", progress: 100, responses: 5000, target: 5000, updatedAt: "3일 전", tags: ["브랜드", "분기"] },
  { id: "pr4", title: "신규 UI 사용성 테스트 v2", type: "UX 테스트", status: "초안", progress: 0, responses: 0, target: 500, updatedAt: "5일 전", tags: ["UI", "사용성"] },
];

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
  data_sources: string;
};

function buildInitialFormState(template?: SurveyType): WizardFormState {
  return {
    name: template ? `${template.title} 프로젝트` : "",
    type: template?.title ?? "컨셉 테스트",
    purpose: template?.desc ?? "",
    description: "",
    target_responses: 1000,
    tags: template?.tags.join(", ") ?? "",
    data_sources: "survey, persona, simulation",
  };
}

/* ─── Wizard Modal ─── */
const WizardModal: React.FC<{
  initialTemplate?: SurveyType;
  onClose: () => void;
  onSubmit: (payload: ProjectCreatePayload) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
}> = ({ initialTemplate, onClose, onSubmit, isSubmitting, submitError }) => {
  const [form, setForm] = useState<WizardFormState>(() => buildInitialFormState(initialTemplate));

  const updateField = <K extends keyof WizardFormState>(key: K, value: WizardFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      name: form.name.trim(),
      type: form.type.trim(),
      purpose: form.purpose.trim(),
      description: form.description.trim() || undefined,
      target_responses: Math.max(1, Number(form.target_responses) || 1),
      tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
      data_sources: form.data_sources.split(",").map((item) => item.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[32px] bg-card p-8 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">새 프로젝트 시작</h2>
            <p className="mt-2 text-[13px] font-medium text-muted-foreground">
              프로젝트 정보를 입력하면 backend에 즉시 생성하고 설문 설계 흐름으로 이동합니다.
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-[12px] font-black uppercase tracking-wider text-[var(--subtle-foreground)]">프로젝트명</span>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="예: Galaxy S26 컨셉 테스트"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-semibold outline-none transition-colors focus:border-primary"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-[12px] font-black uppercase tracking-wider text-[var(--subtle-foreground)]">조사 유형</span>
              <input
                value={form.type}
                onChange={(event) => updateField("type", event.target.value)}
                placeholder="예: 컨셉 테스트"
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
              placeholder="프로젝트의 조사 목적을 입력하세요."
              className="min-h-[96px] w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-semibold outline-none transition-colors focus:border-primary"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-[12px] font-black uppercase tracking-wider text-[var(--subtle-foreground)]">설명</span>
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="선택 입력입니다. 제품/캠페인 배경을 적어두면 이후 설문 설계에 활용할 수 있습니다."
              className="min-h-[88px] w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-semibold outline-none transition-colors focus:border-primary"
            />
          </label>

          <div className="grid gap-5 md:grid-cols-3">
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
            <label className="space-y-2 md:col-span-2">
              <span className="text-[12px] font-black uppercase tracking-wider text-[var(--subtle-foreground)]">태그</span>
              <input
                value={form.tags}
                onChange={(event) => updateField("tags", event.target.value)}
                placeholder="쉼표로 구분해 입력"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-semibold outline-none transition-colors focus:border-primary"
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-[12px] font-black uppercase tracking-wider text-[var(--subtle-foreground)]">데이터 소스</span>
            <input
              value={form.data_sources}
              onChange={(event) => updateField("data_sources", event.target.value)}
              placeholder="예: survey, persona, simulation"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-semibold outline-none transition-colors focus:border-primary"
            />
          </label>

          {submitError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">
              {submitError}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-border bg-card px-5 py-3 text-[13px] font-black transition-colors hover:bg-muted"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !form.name.trim() || !form.type.trim() || !form.purpose.trim()}
              className="rounded-2xl bg-primary px-6 py-3 text-[13px] font-black text-white shadow-lg transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "생성 중..." : "프로젝트 생성"}
            </button>
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

  const { data, isLoading, isError } = useQuery({
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

  // 에러 발생하거나 로딩 중일 때 MOCK_PROJECTS를 기본값으로 사용하여 렌더링 보장
  const projects = useMemo(() => {
    if (!data || !data.items || data.items.length === 0) return MOCK_PROJECTS;
    return data.items;
  }, [data]);

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
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {isLoading && !data ? (
              <div className="col-span-full py-20 flex justify-center"><Loader className="animate-spin text-primary opacity-20" /></div>
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
