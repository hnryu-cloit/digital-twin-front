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
    <div onClick={onClick} className="bg-white rounded-2xl border border-[#E1E8F1] p-5 cursor-pointer hover:shadow-lg hover:border-[#BFD4FF] transition-all group">
      <div className="flex items-start justify-between mb-3">
        <span className="px-2.5 py-1 rounded-full border text-[10px] font-bold"
          style={{ backgroundColor: project.typeBg, color: project.typeColor, borderColor: project.typeColor + "33" }}>
          {project.type}
        </span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: s.bg, color: s.text }}>
          {s.label}
        </span>
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1D1F3D", lineHeight: 1.4, marginBottom: 8 }}>{project.title}</h3>
      <div className="flex flex-wrap gap-1 mb-4">
        {project.tags.map((t) => (
          <span key={t} className="bg-[#F7FAFF] border border-[#DCE4F3] text-[#7C8397] px-2 py-0.5 rounded-full" style={{ fontSize: 10 }}>#{t}</span>
        ))}
      </div>
      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span style={{ fontSize: 11, color: "#9BA6B8" }}>응답 수집</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: project.typeColor }}>{project.responses.toLocaleString()} / {project.target.toLocaleString()}</span>
        </div>
        <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(project.progress, 100)}%`, backgroundColor: project.typeColor }} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 11, color: "#9BA6B8" }}><Clock size={11} className="inline mr-1" />{project.updatedAt} 업데이트</span>
        <ChevronRight size={14} className="text-[#DCE4F3] group-hover:text-[#5B7DFF] transition-colors" />
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
      <div className="flex h-[640px] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#F1F5F9] bg-[#F7FAFF] px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5B7DFF] shadow-lg shadow-blue-100">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">새 프로젝트 생성</h2>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Step {step + 1} of 4: {steps[step]}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex bg-white px-8 pt-6">
          {steps.map((label, i) => (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2.5">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                  i <= step ? "bg-[#5B7DFF] text-white" : "bg-slate-100 text-slate-400"
                }`}>
                  {i < step ? <Check size={12} strokeWidth={3} /> : i + 1}
                </div>
                <span className={`text-xs font-semibold ${i === step ? "text-slate-900" : "text-slate-400"}`}>{label}</span>
              </div>
              {i < steps.length - 1 && <div className={`mx-4 h-px flex-1 ${i < step ? "bg-[#5B7DFF]" : "bg-slate-100"}`} />}
            </div>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-8 hide-scrollbar">
          {step === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="rounded-xl border border-[#BFD4FF] bg-[#EEF4FF] p-4 flex gap-3">
                <Brain className="h-5 w-5 text-[#5B7DFF] shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-[#1E46A8] leading-relaxed">
                  프로젝트의 목적을 입력해 주세요. AI 에이전트가 리서치 목표에 가장 적합한 문항 구조와 타겟 페르소나를 추천합니다.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">프로젝트 이름</label>
                  <input 
                    className="w-full rounded-lg border border-[#D6E0F0] px-4 py-2.5 text-sm font-medium outline-none focus:border-[#5B7DFF] transition-colors"
                    placeholder="예: Galaxy S25 초기 반응 조사"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">조사 목적</label>
                  <textarea 
                    className="w-full rounded-lg border border-[#D6E0F0] px-4 py-2.5 text-sm font-medium outline-none focus:border-[#5B7DFF] transition-colors resize-none"
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
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-2 gap-3">
                {visibleTypes.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => setSelectedType(t)}
                    className={`flex flex-col gap-3 rounded-xl border p-4 text-left transition-all ${
                      selectedType?.id === t.id 
                        ? "border-[#5B7DFF] bg-[#EEF4FF] shadow-sm ring-1 ring-[#5B7DFF]" 
                        : "border-[#DCE4F3] bg-white hover:border-[#BFD1ED]"
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm border border-[#EEF2F8]">
                      <t.icon className={`h-5 w-5 ${selectedType?.id === t.id ? "text-[#5B7DFF]" : "text-slate-400"}`} />
                    </div>
                    <div>
                      <p className={`font-bold ${selectedType?.id === t.id ? "text-[#5B7DFF]" : "text-slate-900"}`}>{t.title}</p>
                      <p className="mt-1 text-xs leading-snug text-slate-500 line-clamp-2">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step >= 2 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="h-12 w-12 text-[#5B7DFF] mb-4" />
              <p className="font-bold text-slate-900">설계 확인 중</p>
              <p className="text-sm text-slate-500 mt-2">입력된 정보를 바탕으로 최적의 리서치를 구성합니다.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#F1F5F9] bg-[#F7FAFF] px-8 py-5">
          <button 
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D6E0F0] bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-white"
          >
            <ChevronLeft size={16} /> {step === 0 ? "취소" : "이전"}
          </button>
          <button 
            onClick={handleNext}
            disabled={step === 0 && (!projectName || !goal)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#5B7DFF] px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4562E8] disabled:opacity-50 shadow-lg shadow-blue-100"
          >
            {isGenerating ? (
              <><Loader className="h-4 w-4 animate-spin" /> 생성 중...</>
            ) : (
              <>{step === 3 ? "프로젝트 시작" : "다음 단계"} <ChevronRight size={16} /></>
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
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-8 hide-scrollbar">
      <div className="mx-auto max-w-6xl space-y-10 pb-12">
        
        {/* Welcome Header */}
        <section className="rounded-2xl border border-border/90 bg-card p-8 shadow-elevated relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-all duration-1000" />
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Management System</p>
            <h1 className="mt-2 font-title text-3xl font-bold leading-tight text-slate-900 md:text-4xl tracking-tight">
              안녕하세요, <span className="text-primary">관리자님.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-base font-medium text-slate-500">
              오늘도 디지털 트윈과 함께 전략적 인사이트를 발견해보세요.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button 
                onClick={() => openWizard()}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#1E5BE9] shadow-lg shadow-blue-100 active:scale-95"
              >
                <Plus size={18} strokeWidth={3} /> 새 프로젝트 시작
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-[#D6E0F0] bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                기존 데이터 불러오기
              </button>
            </div>
          </div>
        </section>

        {/* Stats Summary */}
        <section className="grid grid-cols-4 gap-5">
          {[
            { label: "진행 중", value: "4", sub: "프로젝트", icon: FileText, color: "text-[#5B7DFF]", bg: "bg-[#EEF4FF]" },
            { label: "이번 달 완료", value: "12", sub: "건", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
            { label: "평균 응답률", value: "68%", sub: "Index", icon: BarChart2, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "등록 페르소나", value: "30", sub: "명", icon: Users, color: "text-slate-600", bg: "bg-slate-100" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-border/90 bg-card p-5 shadow-sm flex items-center gap-4">
              <div className={`rounded-xl p-3 ${s.bg} ${s.color}`}><s.icon size={20} /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">{s.label}</p>
                <p className="text-xl font-black text-slate-900">{s.value}<span className="text-xs font-bold text-slate-400 ml-1 uppercase">{s.sub}</span></p>
              </div>
            </div>
          ))}
        </section>

        {/* Recent Projects */}
        <section>
          <div className="mb-4 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#5B7DFF]" />
              <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">최근 프로젝트</h2>
            </div>
            <button className="text-xs font-bold text-[#5B7DFF] hover:underline">전체 보기</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {RECENT_PROJECTS.map(p => <ProjectCard key={p.id} project={p} onClick={() => navigate("/survey")} />)}
          </div>
        </section>

        {/* Template Library */}
        <section>
          <div className="mb-4 flex items-center gap-2 px-1">
            <LayoutGrid className="h-4 w-4 text-[#5B7DFF]" />
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">템플릿 라이브러리</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {SURVEY_TYPES.map(t => (
              <div key={t.id} onClick={() => openWizard(t)} className="bg-white rounded-2xl border border-[#E1E8F1] p-5 hover:shadow-lg hover:border-[#BFD4FF] transition-all cursor-pointer group flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-[#5B7DFF] shadow-sm">
                    <t.icon size={20} />
                  </div>
                  {t.popular && <span className="bg-[#FFF7ED] text-[#EA580C] px-2 py-0.5 rounded-full text-[10px] font-black border border-[#FED7AA]">인기</span>}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{t.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{t.desc}</p>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-50 mt-auto">
                  <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><ListChecks size={12} /> {t.questions} Qs</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><Clock size={12} /> {t.duration}</span>
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
