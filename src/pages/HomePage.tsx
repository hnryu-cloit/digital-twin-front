import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Plus, Search, Clock, CheckCircle2, BarChart2, Users, Zap, ChevronRight,
  FileText, Target, TrendingUp, Lightbulb, ShoppingCart, Star, Award,
  Layers, ArrowRight, Play, X, ChevronLeft, MessageSquare,
  Database, Upload, Link2, Brain, ListChecks, SlidersHorizontal,
  Sparkles, LayoutGrid, Flame, Globe, Package, Eye,
  AlertCircle, Check, Loader, ChevronDown
} from "lucide-react";

/* ─── Types ─── */
interface Project {
  id: string;
  title: string;
  type: string;
  typeColor: string;
  typeBg: string;
  status: "진행중" | "완료" | "초안" | "분석중";
  progress: number;
  responses: number;
  target: number;
  updatedAt: string;
  tags: string[];
}

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

/* ─── Mock Data ─── */
const RECENT_PROJECTS: Project[] = [
  { id: "pr1", title: "Galaxy S25 컨셉 테스트", type: "컨셉 테스트", typeColor: "#5B7DFF", typeBg: "#EEF4FF", status: "진행중", progress: 67, responses: 1340, target: 2000, updatedAt: "2시간 전", tags: ["스마트폰", "신제품"] },
  { id: "pr2", title: "MZ세대 스마트폰 Usage 조사", type: "Usage 조사", typeColor: "#16A34A", typeBg: "#F0FDF4", status: "분석중", progress: 100, responses: 3200, target: 3000, updatedAt: "1일 전", tags: ["MZ", "사용행태"] },
  { id: "pr3", title: "브랜드 인지도 조사 Q1 2026", type: "브랜드 인식", typeColor: "#7C3AED", typeBg: "#F5F3FF", status: "완료", progress: 100, responses: 5000, target: 5000, updatedAt: "3일 전", tags: ["브랜드", "분기"] },
  { id: "pr4", title: "신규 UI 사용성 테스트 v2", type: "UX 테스트", typeColor: "#EA580C", typeBg: "#FFF7ED", status: "초안", progress: 0, responses: 0, target: 500, updatedAt: "5일 전", tags: ["UI", "사용성"] },
];

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
  "완료":   { bg: "#F0FDF4", text: "#16A34A", label: "완료" },
  "초안":   { bg: "#F7FAFF", text: "#7C8397", label: "초안" },
  "분석중": { bg: "#FFF7ED", text: "#EA580C", label: "분석중" },
};

/* ─── Project Card ─── */
function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const s = STATUS_STYLE[project.status];
  return (
    <div onClick={onClick} className="app-card p-6 cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all group flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <span className="px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tight"
          style={{ backgroundColor: project.typeBg, color: project.typeColor, borderColor: project.typeColor + "22" }}>
          {project.type}
        </span>
        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight" style={{ backgroundColor: s.bg, color: s.text }}>
          {s.label}
        </span>
      </div>
      <h3 className="text-[15px] font-black text-foreground leading-tight mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
      <div className="flex flex-wrap gap-1.5 mb-5">
        {project.tags.map((t) => (
          <span key={t} className="bg-[var(--panel-soft)] border border-border text-muted-foreground px-2 py-0.5 rounded-md font-bold" style={{ fontSize: 10 }}>#{t}</span>
        ))}
      </div>
      {/* Progress */}
      <div className="mb-4 mt-auto">
        <div className="flex justify-between mb-1.5">
          <span className="text-[11px] font-black text-[var(--subtle-foreground)] uppercase tracking-widest">응답 수집</span>
          <span className="text-[11px] font-black text-foreground">{project.responses.toLocaleString()} / {project.target.toLocaleString()}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden shadow-inner">
          <div className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm" style={{ width: `${Math.min(project.progress, 100)}%`, backgroundColor: project.typeColor }} />
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border/30">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tighter flex items-center gap-1.5"><Clock size={12} className="text-[var(--subtle-foreground)]" /> {project.updatedAt}</span>
        <div className="w-7 h-7 rounded-lg bg-[var(--panel-soft)] flex items-center justify-center text-[var(--subtle-foreground)] group-hover:bg-primary/10 group-hover:text-primary transition-all">
          <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
}

/* ─── Wizard Modal ─── */
function WizardModal({ initialTemplate, onClose }: { initialTemplate?: SurveyType; onClose: () => void }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(initialTemplate ? 1 : 0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [goal, setGoal] = useState("");
  const [selectedType, setSelectedType] = useState<SurveyType | null>(initialTemplate ?? null);

  const steps = ["목적 설정", "유형 선택", "데이터 연결", "설계 완성"];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        navigate("/survey");
        onClose();
      }, 1500);
    }
  };

  const visibleTypes = SURVEY_TYPES.slice(0, 4);

  return (
    <div className="app-modal-overlay">
      <div className="app-modal max-w-3xl h-[640px] animate-in zoom-in-95 duration-300">

        {/* Modal Header */}
        <div className="app-modal-header">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-xl shadow-blue-100 border border-white/20">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-[18px] font-black text-foreground tracking-tight">새 프로젝트 생성</h2>
              <p className="text-[11px] font-black text-primary uppercase tracking-[0.15em] mt-0.5 opacity-70">Step {step + 1} of 4: {steps[step]}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-card border border-border hover:bg-[var(--surface-hover)] flex items-center justify-center transition-all text-muted-foreground">
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex bg-card px-10 pt-8 shrink-0">
          {steps.map((label, i) => (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-3">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black transition-all ${
                  i <= step ? "bg-primary text-white shadow-lg shadow-blue-100" : "bg-muted text-muted-foreground"
                }`}>
                  {i < step ? <Check size={14} strokeWidth={3} /> : i + 1}
                </div>
                <span className={`text-[12px] font-black uppercase tracking-tight ${i === step ? "text-foreground" : "text-[var(--subtle-foreground)]"}`}>{label}</span>
              </div>
              {i < steps.length - 1 && <div className={`mx-6 h-px flex-1 ${i < step ? "bg-primary/30" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {/* Modal Body */}
        <div className="app-modal-body">
          {step === 0 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="app-soft p-6 flex gap-4 border-primary/10">
                <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center text-primary shadow-sm border border-[var(--primary-light-border)] shrink-0">
                  <Brain size={20} />
                </div>
                <p className="text-[13px] font-bold text-primary-active-text leading-relaxed">
                  프로젝트의 목적을 입력해 주세요. AI 에이전트가 리서치 목표에 가장 적합한 문항 구조와 타겟 페르소나를 추천합니다.
                </p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="app-label">프로젝트 이름</label>
                  <input
                    className="app-input"
                    placeholder="예: Galaxy S25 초기 반응 조사"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="app-label">조사 목적</label>
                  <textarea
                    className="app-textarea"
                    rows={4}
                    placeholder="예: 20~30대 실사용자를 대상으로 신규 카메라 기능에 대한 수용도를 파악하고 싶습니다."
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-2 gap-4">
                {visibleTypes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t)}
                    className={`flex flex-col gap-4 app-card p-6 text-left transition-all ${
                      selectedType?.id === t.id
                        ? "border-primary bg-primary-light-bg/30 shadow-md ring-1 ring-primary"
                        : "hover:border-primary/30 hover:bg-card"
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--panel-soft)] border border-border shadow-sm transition-colors group-hover:bg-card">
                      <t.icon className={`h-6 w-6 ${selectedType?.id === t.id ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className={`text-[15px] font-black ${selectedType?.id === t.id ? "text-primary" : "text-foreground"}`}>{t.title}</p>
                      <p className="mt-1.5 text-[12px] font-bold leading-relaxed text-muted-foreground line-clamp-2">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step >= 2 && (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <div className="relative bg-card p-6 rounded-3xl border border-[var(--primary-light-border)] shadow-2xl">
                  <Sparkles className="h-14 w-12 text-primary animate-bounce" />
                </div>
              </div>
              <p className="text-[20px] font-black text-foreground tracking-tight">AI 에이전트 설계 분석 중</p>
              <p className="text-[14px] font-bold text-muted-foreground mt-3 max-w-sm leading-relaxed">입력된 리서치 목적을 바탕으로 최적의<br />페르소나 그룹과 문항 구조를 생성하고 있습니다.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="app-modal-footer">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-[13px] font-black text-muted-foreground transition-all hover:bg-[var(--surface-hover)] active:scale-95 shadow-sm"
          >
            <ChevronLeft size={16} /> {step === 0 ? "취소" : "이전"}
          </button>
          <button
            onClick={handleNext}
            disabled={step === 0 && (!projectName || !goal)}
            className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-10 py-3 text-[14px] font-black text-white transition-all hover:bg-primary-hover disabled:opacity-40 shadow-xl shadow-blue-100 active:scale-95"
          >
            {isGenerating ? (
              <><Loader className="h-4 w-4 animate-spin" /> 에이전트 구동 중...</>
            ) : (
              <>{step === 3 ? "프로젝트 시작하기" : "다음 단계로"} <ChevronRight size={16} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Home Page ─── */
export function HomePage() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardTemplate, setWizardTemplate] = useState<SurveyType | undefined>();
  const navigate = useNavigate();

  const openWizard = (tmpl?: SurveyType) => {
    setWizardTemplate(tmpl);
    setWizardOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background px-10 py-8 hide-scrollbar">
      <div className="mx-auto max-w-7xl space-y-10 pb-12">

        {/* Welcome Header */}
        <section className="app-card p-10 border-border/90 relative overflow-hidden group [box-shadow:var(--shadow-md)]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl group-hover:bg-primary/10 transition-all duration-1000" />
          <div className="relative z-10">
            <p className="app-page-eyebrow mb-3">Workspace Hub</p>
            <h1 className="text-4xl font-black leading-tight text-foreground tracking-tight">
              안녕하세요, <span className="text-primary italic">관리자</span>님.
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] font-bold text-muted-foreground leading-relaxed">
              디지털 트윈 기반의 가상 페르소나 시뮬레이션을 통해<br />오늘의 전략적 인사이트를 발견하고 리서치 효율을 극대화하세요.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => openWizard()}
                className="inline-flex items-center gap-3 rounded-2xl bg-primary px-8 py-4 text-[15px] font-black text-white transition-all hover:bg-primary-hover shadow-2xl shadow-blue-200 active:scale-95"
              >
                <Plus size={20} strokeWidth={3} /> 새 프로젝트 설계 시작
              </button>
              <button className="inline-flex items-center gap-3 rounded-2xl border border-border bg-card px-8 py-4 text-[15px] font-black text-secondary-foreground transition-all hover:bg-[var(--surface-hover)] hover:border-[var(--border-hover)] shadow-sm">
                <Database size={18} /> 기존 데이터 불러오기
              </button>
            </div>
          </div>
        </section>

        {/* Stats Summary */}
        <section className="grid grid-cols-4 gap-6">
          {[
            { label: "진행 중인 프로젝트", value: "4", sub: "개", icon: FileText, color: "text-primary", bg: "bg-[var(--primary-light-bg)]" },
            { label: "이번 달 완료", value: "12", sub: "건", icon: CheckCircle2, color: "text-[var(--success)]", bg: "bg-[var(--success-light)]" },
            { label: "평균 응답 지수", value: "68%", sub: "평균", icon: BarChart2, color: "text-[var(--warning)]", bg: "bg-[var(--warning-light)]" },
            { label: "등록 페르소나", value: "30", sub: "명", icon: Users, color: "text-secondary-foreground", bg: "bg-muted" },
          ].map(s => (
            <div key={s.label} className="app-card p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className={`rounded-2xl p-3.5 ${s.bg} ${s.color} border border-current/10 shadow-inner`}><s.icon size={22} /></div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-[24px] font-black text-foreground leading-none tracking-tighter">{s.value}<span className="text-[11px] font-bold text-[var(--subtle-foreground)] ml-1.5 uppercase">{s.sub}</span></p>
              </div>
            </div>
          ))}
        </section>

        {/* Recent Projects */}
        <section>
          <div className="mb-6 flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <h2 className="text-[13px] font-black text-foreground uppercase tracking-[0.15em]">최근 활동 내역</h2>
            </div>
            <button className="text-[11px] font-black text-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-4">전체 프로젝트 보기</button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {RECENT_PROJECTS.map(p => <ProjectCard key={p.id} project={p} onClick={() => navigate("/survey")} />)}
          </div>
        </section>

        {/* Template Library */}
        <section>
          <div className="mb-6 flex items-center gap-3 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <h2 className="text-[13px] font-black text-foreground uppercase tracking-[0.15em]">템플릿 라이브러리</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {SURVEY_TYPES.map(t => (
              <div key={t.id} onClick={() => openWizard(t)} className="app-card p-7 hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer group flex flex-col gap-5">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--panel-soft)] border border-border flex items-center justify-center text-primary shadow-sm group-hover:bg-card transition-colors">
                    <t.icon size={22} />
                  </div>
                  {t.popular && <span className="bg-[var(--warning-light)] text-[var(--warning)] px-2.5 py-1 rounded-lg text-[10px] font-black border border-[var(--warning-light)] uppercase tracking-tighter">인기 항목</span>}
                </div>
                <div>
                  <h4 className="text-[17px] font-black text-foreground tracking-tight mb-2 group-hover:text-primary transition-colors">{t.title}</h4>
                  <p className="text-[13px] font-bold text-muted-foreground leading-relaxed line-clamp-2">{t.desc}</p>
                </div>
                <div className="flex items-center gap-4 pt-5 border-t border-border/30 mt-auto opacity-60 group-hover:opacity-100 transition-opacity">
                  <span className="text-[11px] font-black text-muted-foreground uppercase tracking-tighter flex items-center gap-1.5"><ListChecks size={14} className="text-[var(--subtle-foreground)]" /> {t.questions}개 문항</span>
                  <span className="text-[11px] font-black text-muted-foreground uppercase tracking-tighter flex items-center gap-1.5"><Clock size={14} className="text-[var(--subtle-foreground)]" /> {t.duration} 소요</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {wizardOpen && <WizardModal initialTemplate={wizardTemplate} onClose={() => setWizardOpen(false)} />}
    </div>
  );
}
