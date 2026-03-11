import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Plus, Search, Clock, CheckCircle2, BarChart2, Users, Zap, ChevronRight,
  FileText, Target, TrendingUp, Lightbulb, ShoppingCart, Star, Award,
  Layers, ArrowRight, Play, X, ChevronLeft, MessageSquare,
  Database, Upload, Link2, Brain, ListChecks, SlidersHorizontal,
  Sparkles, Radio, LayoutGrid, Flame, Globe, Package, Eye,
  AlertCircle, Check, Loader,
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
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
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
  { id: "pr5", title: "2030 뷰티 소비자 인식 조사", type: "브랜드 인식", typeColor: "#DB2777", typeBg: "#FFF0F5", status: "진행중", progress: 42, responses: 840, target: 2000, updatedAt: "1일 전", tags: ["뷰티", "2030"] },
  { id: "pr6", title: "온라인 쇼핑 경험 만족도", type: "Usage 조사", typeColor: "#059669", typeBg: "#F0FDF4", status: "완료", progress: 100, responses: 4100, target: 4000, updatedAt: "1주 전", tags: ["이커머스", "만족도"] },
  { id: "pr7", title: "광고 캠페인 사전 효과 측정", type: "광고 효과", typeColor: "#D97706", typeBg: "#FFFBEB", status: "초안", progress: 0, responses: 0, target: 1000, updatedAt: "2주 전", tags: ["광고", "캠페인"] },
  { id: "pr8", title: "신규 구독 서비스 컨셉 검증", type: "컨셉 테스트", typeColor: "#5B7DFF", typeBg: "#EEF4FF", status: "분석중", progress: 100, responses: 2200, target: 2000, updatedAt: "2주 전", tags: ["구독", "서비스"] },
];

const SURVEY_TYPES: SurveyType[] = [
  { id: "st1", icon: <Target size={20} />, iconBg: "#EEF4FF", iconColor: "#5B7DFF", title: "컨셉 테스트", desc: "신제품·서비스 컨셉의 소비자 반응 및 수용도를 측정합니다.", tags: ["신제품", "아이디어 검증"], questions: 18, duration: "8–12분", difficulty: "보통", popular: true, category: "제품" },
  { id: "st2", icon: <BarChart2 size={20} />, iconBg: "#F0FDF4", iconColor: "#16A34A", title: "Usage 조사", desc: "제품·서비스의 실제 사용 행태와 패턴을 심층 분석합니다.", tags: ["사용 행태", "빈도"], questions: 22, duration: "10–15분", difficulty: "보통", popular: true, category: "사용자" },
  { id: "st3", icon: <Globe size={20} />, iconBg: "#F5F3FF", iconColor: "#7C3AED", title: "브랜드 인식 조사", desc: "브랜드 인지도, 이미지, 경쟁 포지셔닝을 종합 분석합니다.", tags: ["브랜드", "인지도"], questions: 25, duration: "12–18분", difficulty: "전문", popular: true, category: "브랜드" },
  { id: "st4", icon: <Star size={20} />, iconBg: "#FFFBEB", iconColor: "#D97706", title: "고객 만족도 (CSAT/NPS)", desc: "제품·서비스 만족도와 추천 의향을 정량적으로 측정합니다.", tags: ["만족도", "NPS"], questions: 14, duration: "5–8분", difficulty: "쉬움", category: "만족도" },
  { id: "st5", icon: <Eye size={20} />, iconBg: "#FFF0F5", iconColor: "#DB2777", title: "광고 효과 측정", desc: "광고 소재·캠페인의 인지도와 태도 변화를 측정합니다.", tags: ["광고", "캠페인"], questions: 16, duration: "7–10분", difficulty: "보통", category: "마케팅" },
  { id: "st6", icon: <Package size={20} />, iconBg: "#FFF7ED", iconColor: "#EA580C", title: "패키지 & 디자인 테스트", desc: "패키지 디자인, 컬러, 카피에 대 소비자 반응 측정합다.", tags: ["디자인", "패키지"], questions: 20, duration: "10–14분", difficulty: "보통", category: "제품" },
  { id: "st7", icon: <ShoppingCart size={20} />, iconBg: "#F0FDF4", iconColor: "#059669", title: "구매 의향 조사", desc: "가격 민감도와 구매 결정 요인을 분석합니다.", tags: ["가격", "���매"], questions: 18, duration: "8–12분", difficulty: "보통", category: "시장" },
  { id: "st8", icon: <TrendingUp size={20} />, iconBg: "#F0F9FF", iconColor: "#0284C7", title: "시장·트렌드 탐색", desc: "소비자 트렌드와 시장 기회를 발굴하는 탐색적 조사입니다.", tags: ["트렌드", "시장"], questions: 30, duration: "15–20분", difficulty: "전문", category: "시장" },
  { id: "st9", icon: <Layers size={20} />, iconBg: "#F5F3FF", iconColor: "#6D28D9", title: "경쟁사 비교 분석", desc: "경쟁 브랜드 대비 자사 포지션과 차별점을 분석합니다.", tags: ["경쟁사", "비교"], questions: 28, duration: "15–20분", difficulty: "전문", category: "브랜드" },
  { id: "st10", icon: <Lightbulb size={20} />, iconBg: "#FFFBEB", iconColor: "#F59E0B", title: "신규 피처 검증", desc: "새 기능에 대한 니즈, 관심도, 개선점을 사전 검증합니다.", tags: ["기능", "검증"], questions: 16, duration: "7–10분", difficulty: "쉬움", category: "사용자" },
  { id: "st11", icon: <Award size={20} />, iconBg: "#FFF0F5", iconColor: "#EC4899", title: "브랜드 로열티 분석", desc: "충성 고객의 행동 패턴과 재구매 동인을 분석합니다.", tags: ["로열티", "재구매"], questions: 20, duration: "10–15분", difficulty: "전문", category: "브랜드" },
  { id: "st12", icon: <MessageSquare size={20} />, iconBg: "#F0FDF4", iconColor: "#22C55E", title: "사용자 인터뷰 설계", desc: "정성 조사를 위한 가이드 문항과 심층 인터뷰 구조를 생성합니다.", tags: ["인터뷰", "정성"], questions: 12, duration: "30–60분", difficulty: "전문", category: "사용자" },
];

const CATEGORIES = ["전체", "제품", "사용자", "브랜드", "마케팅", "시장", "만족도"];

const STATUS_STYLE: Record<Project["status"], { bg: string; text: string; label: string }> = {
  "진행중": { bg: "#EEF4FF", text: "#5B7DFF", label: "진행중" },
  "완료":   { bg: "#F0FDF4", text: "#16A34A", label: "완료" },
  "초안":   { bg: "#F7FAFF", text: "#7C8397", label: "초안" },
  "분석중": { bg: "#FFF7ED", text: "#EA580C", label: "분석중" },
};

/* ─── Stats Card ─── */
function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E1E8F1] p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + "22" }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <p style={{ fontSize: 11, color: "#9BA6B8", fontWeight: 600, letterSpacing: "0.04em" }}>{label}</p>
        <p style={{ fontSize: 22, fontWeight: 800, color: "#1D1F3D", lineHeight: 1.2 }}>{value}</p>
        <p style={{ fontSize: 11, color: "#7C8397", marginTop: 2 }}>{sub}</p>
      </div>
    </div>
  );
}

/* ─── Project Card ─── */
function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const s = STATUS_STYLE[project.status];
  return (
    <div onClick={onClick} className="bg-white rounded-2xl border border-[#E1E8F1] p-5 cursor-pointer hover:shadow-lg hover:border-[#BFD4FF] transition-all group">
      <div className="flex items-start justify-between mb-3">
        <span className="px-2.5 py-1 rounded-full border text-xs font-semibold"
          style={{ backgroundColor: project.typeBg, color: project.typeColor, borderColor: project.typeColor + "33" }}>
          {project.type}
        </span>
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.text }}>
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
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(project.progress, 100)}%`, backgroundColor: project.typeColor }} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 11, color: "#9BA6B8" }}><Clock size={11} className="inline mr-1" />{project.updatedAt} 업데이트</span>
        <ChevronRight size={14} className="text-[#DCE4F3] group-hover:text-[#5B7DFF] transition-colors" />
      </div>
    </div>
  );
}

/* ─── Template Card ─── */
function TemplateCard({ tmpl, onSelect }: { tmpl: SurveyType; onSelect: (t: SurveyType) => void }) {
  const diffColor = tmpl.difficulty === "쉬움" ? "#16A34A" : tmpl.difficulty === "보통" ? "#D97706" : "#7C3AED";
  const diffBg = tmpl.difficulty === "쉬움" ? "#F0FDF4" : tmpl.difficulty === "보통" ? "#FFFBEB" : "#F5F3FF";
  return (
    <div className="bg-white rounded-2xl border border-[#E1E8F1] p-5 hover:shadow-lg hover:border-[#BFD4FF] transition-all cursor-pointer group flex flex-col gap-3"
      onClick={() => onSelect(tmpl)}>
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: tmpl.iconBg }}>
          <span style={{ color: tmpl.iconColor }}>{tmpl.icon}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {tmpl.popular && (
            <span className="flex items-center gap-0.5 bg-[#FFF7ED] text-[#EA580C] border border-[#FED7AA] px-2 py-0.5 rounded-full" style={{ fontSize: 10, fontWeight: 700 }}>
              <Flame size={9} />인기
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full border" style={{ fontSize: 10, fontWeight: 600, backgroundColor: diffBg, color: diffColor, borderColor: diffColor + "44" }}>
            {tmpl.difficulty}
          </span>
        </div>
      </div>
      <div>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: "#1D1F3D", marginBottom: 4 }}>{tmpl.title}</h4>
        <p style={{ fontSize: 12, color: "#7C8397", lineHeight: 1.6 }} className="line-clamp-2">{tmpl.desc}</p>
      </div>
      <div className="flex flex-wrap gap-1">
        {tmpl.tags.map((t) => (
          <span key={t} className="bg-[#F7FAFF] border border-[#DCE4F3] text-[#7C8397] px-2 py-0.5 rounded-full" style={{ fontSize: 10 }}>#{t}</span>
        ))}
      </div>
      <div className="flex items-center gap-3 pt-1 border-t border-[#F1F5F9] mt-auto">
        <span style={{ fontSize: 11, color: "#9BA6B8" }}><ListChecks size={11} className="inline mr-1" />{tmpl.questions}문항</span>
        <span style={{ fontSize: 11, color: "#9BA6B8" }}><Clock size={11} className="inline mr-1" />{tmpl.duration}</span>
        <button className="ml-auto flex items-center gap-1 text-[#5B7DFF] opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ fontSize: 11, fontWeight: 700 }}>
          선택 <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}

/* ─── New Project Wizard Modal ──── */
const STEP_LABELS = ["목적 설정", "유형 선택", "데이터 연결", "설계 완성"];

function WizardModal({ initialTemplate, onClose }: { initialTemplate?: SurveyType; onClose: () => void }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(initialTemplate ? 1 : 0);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [goal, setGoal] = useState("");
  const [selectedType, setSelectedType] = useState<SurveyType | null>(initialTemplate ?? null);
  const [selectedCat, setSelectedCat] = useState("전체");
  const [connectedData, setConnectedData] = useState<string[]>([]);
  const [hasRef, setHasRef] = useState(false);

  const DATA_SOURCES = ["CRM 고객 데이터", "구매 이력 데이터", "앱 사용 로그", "SNS 반응 데이터", "오프라인 판매 데이터"];

  const toggleData = (d: string) =>
    setConnectedData((p) => p.includes(d) ? p.filter((v) => v !== d) : [...p, d]);

  const canNext = [
    projectName.trim().length > 0 && goal.trim().length > 0,
    selectedType !== null,
    true,
    true,
  ][step];

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 2200);
  };

  const handleFinish = () => { onClose(); navigate("/survey"); };

  const GENERATED_QUESTIONS = selectedType ? [
    { no: 1, type: "단일선택", text: `귀하는 ${selectedType.title.replace("조사", "").replace("테스트", "")} 관련 경험이 있으신가요?`, options: ["있다", "없다"] },
    { no: 2, type: "척도형", text: "다음 항목에 대해 귀하의 동의 정도를 선택해 주세요. (전혀 동의 안함 ~ 매우 동의)", options: ["1", "2", "3", "4", "5"] },
    { no: 3, type: "복수선택", text: "다음 중 귀하가 중요하게 생각하는 요소를 모두 선택해 주세요.", options: ["성능", "가격", "디자인", "브랜드", "AS"] },
    { no: 4, type: "주관식", text: "위에서 선택하신 항목이 중요한 이유를 간략히 적어주세요." },
    { no: 5, type: "NPS", text: "해당 제품/서비스를 주변에 추천할 의향이 얼마나 됩니까? (0–10)", options: Array.from({length:11},(_, i)=>String(i)) },
  ] : [];

  const DESIGN_ELEMENTS = selectedType ? [
    { label: "리크루팅 기준", icon: <Users size={14} />, color: "#5B7DFF", value: "20~45세 스마트폰 주 사용자, 최근 6개월 내 구매 경험자" },
    { label: "목표 샘플 수", icon: <Target size={14} />, color: "#16A34A", value: `N=${selectedType.difficulty === "전문" ? "2,000+" : "1,000"} (성별·연령 비례 당)` },
    { label: "항 유형 구성", icon: <ListChecks size={14} />, color: "#7C3AED", value: `단일선택 ${Math.round(selectedType.questions*0.4)}문 / 척도형 ${Math.round(selectedType.questions*0.3)}문 / 주관식 ${Math.round(selectedType.questions*0.2)}문 / 기타 ${Math.round(selectedType.questions*0.1)}문` },
    { label: "스크리닝 로직", icon: <SlidersHorizontal size={14} />, color: "#EA580C", value: "구매 경험 → 브랜드 분류 → 분기 로직 자동 적용" },
    { label: "예상 소요 시간", icon: <Clock size={14} />, color: "#D97706", value: selectedType.duration },
    { label: "AI 최적화", icon: <Brain size={14} />, color: "#0284C7", value: "자연어 목적 기반 문항 배열 & 응답 이탈 최소화 로직" },
  ] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
        style={{ boxShadow: "0 32px 80px #0000002A" }}>

        {/* Header */}
        <div className="px-7 py-5 border-b border-[#F1F5F9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#5B7DFF] flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1D1F3D" }}>새 프로젝트 시작</h2>
              <p style={{ fontSize: 11, color: "#9BA6B8" }}>AI 기반 설문 설계 에이전트</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#EEF2FA] hover:bg-[#EEF4FF] flex items-center justify-center transition-colors">
            <X size={14} className="text-[#7C8397]" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-7 py-4 border-b border-[#F7FAFF] flex items-center gap-0">
          {STEP_LABELS.map((label, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: i < step ? "#5B7DFF" : i === step ? "#5B7DFF" : "#F1F5F9",
                    color: i <= step ? "#fff" : "#9BA6B8",
                    boxShadow: i === step ? "0 0 0 4px #5B7DFF20" : "none",
                  }}>
                  {i < step ? <Check size={13} /> : <span style={{ fontSize: 11, fontWeight: 800 }}>{i + 1}</span>}
                </div>
                <span style={{ fontSize: 12, fontWeight: i === step ? 700 : 500, color: i === step ? "#1D1F3D" : "#9BA6B8" }}>{label}</span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className="flex-1 mx-3 h-px" style={{ backgroundColor: i < step ? "#5B7DFF" : "#E1E8F1" }} />
              )}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6">

          {/* STEP 0: 목적 설정 */}
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div className="bg-[#F7FAFF] rounded-2xl p-4 border border-[#DCE4F3] flex items-start gap-3">
                <Brain size={18} className="text-[#5B7DFF] shrink-0 mt-0.5" />
                <p style={{ fontSize: 13, color: "#3C4556", lineHeight: 1.7 }}>
                  조사 목적을 자연어로 입력하면 AI가 최적의 설문 구조를 자동으로 설계합니다. 구체적일수록 더 정교한 결과를 얻을 수 있습니다.
                </p>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#3C4556" }} className="block mb-2">프로젝트 이름 *</label>
                <input
                  className="w-full border border-[#E1E8F1] rounded-xl px-4 py-3 outline-none focus:border-[#5B7DFF] bg-[#F7FAFF] focus:bg-white transition-colors"
                  style={{ fontSize: 14, color: "#1D1F3D" }}
                  placeholder="예: Galaxy S25 컨셉 테스트 2026 Q1"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#3C4556" }} className="block mb-2">조사 목적 (자연어 입력) *</label>
                <textarea
                  className="w-full border border-[#E1E8F1] rounded-xl px-4 py-3 outline-none focus:border-[#5B7DFF] bg-[#F7FAFF] focus:bg-white transition-colors resize-none"
                  style={{ fontSize: 13, color: "#1D1F3D", lineHeight: 1.7 }}
                  rows={4}
                  placeholder="예: 20~30대 스마트폰 헤비 유저를 대상으로 Galaxy S25의 신규 컨셉에 대한 초기 반응과 구매 의향, 경쟁사 대비 차별점 인식을 파악하고 싶습니다."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                />
                <p style={{ fontSize: 11, color: "#9BA6B8", marginTop: 6 }}>
                  💡 조사 대상, 제품/서비스명, 파악하고 싶은 내용을 포함할수록 좋습니다.
                </p>
              </div>

              {/* Quick examples */}
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#9BA6B8", marginBottom: 8 }}>빠른 예시 선택</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "신제품 컨셉 소비자 반응 조사",
                    "브랜드 인지도 및 이미지 측정",
                    "사용자 경험 개선 포인트 발굴",
                    "광고 캠페인 효과 사전 검증",
                  ].map((ex) => (
                    <button key={ex} onClick={() => setGoal(ex)}
                      className="px-3 py-1.5 rounded-full border border-[#E1E8F1] bg-[#F7FAFF] hover:bg-[#EEF4FF] hover:border-[#BFD4FF] hover:text-[#5B7DFF] transition-colors"
                      style={{ fontSize: 12, color: "#7C8397" }}>
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: 유형 선택 */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                {CATEGORIES.map((c) => (
                  <button key={c} onClick={() => setSelectedCat(c)}
                    className="px-3 py-1.5 rounded-full border transition-colors"
                    style={{
                      fontSize: 12, fontWeight: selectedCat === c ? 700 : 500,
                      backgroundColor: selectedCat === c ? "#5B7DFF" : "#F7FAFF",
                      borderColor: selectedCat === c ? "#5B7DFF" : "#E1E8F1",
                      color: selectedCat === c ? "#fff" : "#7C8397",
                    }}>
                    {c}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {SURVEY_TYPES.filter((t) => selectedCat === "전체" || t.category === selectedCat).map((t) => {
                  const isActive = selectedType?.id === t.id;
                  return (
                    <button key={t.id} onClick={() => setSelectedType(t)}
                      className="text-left p-4 rounded-2xl border transition-all flex flex-col gap-2 hover:shadow-md"
                      style={{
                        borderColor: isActive ? "#5B7DFF" : "#E1E8F1",
                        backgroundColor: isActive ? "#EEF4FF" : "#fff",
                        boxShadow: isActive ? "0 0 0 2px #5B7DFF20" : "none",
                      }}>
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: t.iconBg }}>
                          <span style={{ color: t.iconColor }}>{t.icon}</span>
                        </div>
                        {isActive && <div className="w-5 h-5 bg-[#5B7DFF] rounded-full flex items-center justify-center"><Check size={11} className="text-white" /></div>}
                        {t.popular && !isActive && <span className="text-[#EA580C] bg-[#FFF7ED] px-1.5 py-0.5 rounded-full border border-[#FED7AA]" style={{ fontSize: 9, fontWeight: 700 }}>인기</span>}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: isActive ? "#5B7DFF" : "#1D1F3D" }}>{t.title}</p>
                        <p style={{ fontSize: 11, color: "#7C8397", lineHeight: 1.5 }} className="line-clamp-2">{t.desc}</p>
                      </div>
                      <div className="flex gap-3">
                        <span style={{ fontSize: 10, color: "#9BA6B8" }}>{t.questions}문항</span>
                        <span style={{ fontSize: 10, color: "#9BA6B8" }}>{t.duration}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: 데이터 연결 */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Database size={16} className="text-[#5B7DFF]" />
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1D1F3D" }}>데이터 소스 연결</p>
                  <span className="text-[#9BA6B8]" style={{ fontSize: 12 }}>(선택)</span>
                </div>
                <p style={{ fontSize: 12, color: "#7C8397", marginBottom: 12, lineHeight: 1.6 }}>
                  연결된 데이터를 기반으로 AI가 리크루팅 기준과 스크리닝 로직을 자동으로 최적화합니다.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {DATA_SOURCES.map((d) => {
                    const active = connectedData.includes(d);
                    return (
                      <button key={d} onClick={() => toggleData(d)}
                        className="flex items-center gap-3 p-3 rounded-xl border transition-all text-left"
                        style={{ borderColor: active ? "#5B7DFF" : "#E1E8F1", backgroundColor: active ? "#EEF4FF" : "#F7FAFF" }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: active ? "#5B7DFF" : "#E1E8F1" }}>
                          <Link2 size={14} className={active ? "text-white" : "text-[#9BA6B8]"} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: active ? "#5B7DFF" : "#3C4556" }}>{d}</span>
                        {active && <Check size={14} className="text-[#5B7DFF] ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-[#F1F5F9]" />

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Upload size={16} className="text-[#7C3AED]" />
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1D1F3D" }}>참고 자료 업로드</p>
                  <span className="text-[#9BA6B8]" style={{ fontSize: 12 }}>(선택)</span>
                </div>
                <button
                  onClick={() => setHasRef((p) => !p)}
                  className="w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-3 transition-all hover:border-[#5B7DFF] hover:bg-[#F7FAFF]"
                  style={{ borderColor: hasRef ? "#5B7DFF" : "#E1E8F1", backgroundColor: hasRef ? "#EEF4FF" : "#F7FAFF" }}>
                  {hasRef ? (
                    <>
                      <div className="w-10 h-10 bg-[#5B7DFF] rounded-xl flex items-center justify-center">
                        <Check size={20} className="text-white" />
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#5B7DFF" }}>파일이 연결되었습니다</p>
                      <p style={{ fontSize: 11, color: "#7C8397" }}>brand_guideline_2026.pdf, competitor_report.xlsx</p>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-[#F1F5F9] rounded-xl flex items-center justify-center">
                        <Upload size={20} className="text-[#9BA6B8]" />
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#3C4556" }}>클릭하여 파일 업로드</p>
                      <p style={{ fontSize: 11, color: "#9BA6B8" }}>PDF, XLSX, DOCX, PPTX · 최대 50MB</p>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: 설계 완성 */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              {!generated ? (
                <>
                  <div className="bg-gradient-to-br from-[#EEF4FF] to-[#F7FAFF] rounded-2xl p-5 border border-[#DCE4F3]">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={16} className="text-[#5B7DFF]" />
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#1D1F3D" }}>AI 설계 요소 자동 구성</p>
                    </div>
                    <p style={{ fontSize: 12, color: "#7C8397", lineHeight: 1.7, marginBottom: 16 }}>
                      입력하신 목적과 선택한 유형을 기반으로 아래 설 요소가 자동 구되었습니다. 필요 시 수정 후 설문을 생성하세요.
                    </p>
                    <div className="flex flex-col gap-3">
                      {DESIGN_ELEMENTS.map((el) => (
                        <div key={el.label} className="bg-white rounded-xl p-3.5 flex items-start gap-3 border border-[#E1E8F1]">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: el.color + "18" }}>
                            <span style={{ color: el.color }}>{el.icon}</span>
                          </div>
                          <div className="flex-1">
                            <p style={{ fontSize: 11, fontWeight: 700, color: "#9BA6B8", marginBottom: 2 }}>{el.label}</p>
                            <p style={{ fontSize: 12, color: "#1D1F3D", lineHeight: 1.5 }}>{el.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button onClick={handleGenerate} disabled={generating}
                    className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
                    style={{ background: "linear-gradient(135deg, #5B7DFF 0%, #6366F1 100%)", color: "#fff", boxShadow: "0 6px 20px #5B7DFF40" }}>
                    {generating ? (
                      <><Loader size={16} className="animate-spin" /><span style={{ fontSize: 14, fontWeight: 700 }}>AI가 설문을 생성하고 있습니다...</span></>
                    ) : (
                      <><Sparkles size={16} /><span style={{ fontSize: 14, fontWeight: 700 }}>AI 설문 문항 자동 생성</span></>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl px-4 py-3">
                    <CheckCircle2 size={16} className="text-[#16A34A]" />
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#16A34A" }}>
                      {selectedType?.questions ?? 18}개 문항이 성공적으로 생성되었습니다
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {GENERATED_QUESTIONS.map((q) => (
                      <div key={q.no} className="bg-white border border-[#E1E8F1] rounded-xl p-4 flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#5B7DFF] text-white flex items-center justify-center shrink-0" style={{ fontSize: 11, fontWeight: 800 }}>{q.no}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="bg-[#EEF4FF] text-[#5B7DFF] border border-[#BFD4FF] px-2 py-0.5 rounded-full" style={{ fontSize: 10, fontWeight: 700 }}>{q.type}</span>
                          </div>
                          <p style={{ fontSize: 13, color: "#1D1F3D", lineHeight: 1.6 }}>{q.text}</p>
                          {q.options && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {q.options.slice(0, 4).map((opt) => (
                                <span key={opt} className="bg-[#F7FAFF] border border-[#DCE4F3] text-[#7C8397] px-2.5 py-1 rounded-lg" style={{ fontSize: 11 }}>{opt}</span>
                              ))}
                              {q.options.length > 4 && <span className="text-[#9BA6B8]" style={{ fontSize: 11 }}>+{q.options.length - 4}개</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="bg-[#F7FAFF] border border-dashed border-[#DCE4F3] rounded-xl p-3 text-center">
                      <span style={{ fontSize: 12, color: "#9BA6B8" }}>+ {(selectedType?.questions ?? 18) - GENERATED_QUESTIONS.length}개 문항 더 보기</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-[#F1F5F9] flex items-center justify-between">
          <button onClick={() => step > 0 ? setStep((p) => p - 1) : onClose()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E1E8F1] text-[#3C4556] hover:bg-[#EEF2FA] transition-colors"
            style={{ fontSize: 13, fontWeight: 600 }}>
            <ChevronLeft size={14} />
            {step === 0 ? "취소" : "이전"}
          </button>
          <div className="flex items-center gap-2">
            {STEP_LABELS.map((_, i) => (
              <div key={i} className="h-1.5 rounded-full transition-all"
                style={{ width: i === step ? 20 : 6, backgroundColor: i <= step ? "#5B7DFF" : "#E1E8F1" }} />
            ))}
          </div>
          {step < 3 ? (
            <button onClick={() => setStep((p) => p + 1)} disabled={!canNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#5B7DFF] text-white hover:bg-[#4562E8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              style={{ fontSize: 13, fontWeight: 700, boxShadow: canNext ? "0 4px 12px #5B7DFF30" : "none" }}>
              다음 <ChevronRight size={14} />
            </button>
          ) : (
            <button onClick={generated ? handleFinish : undefined} disabled={!generated}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#5B7DFF] text-white hover:bg-[#4562E8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              style={{ fontSize: 13, fontWeight: 700 }}>
              <Play size={13} /> 프로젝트 작
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Home Page ─── */
export const HomePage: React.FC = () => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardTemplate, setWizardTemplate] = useState<SurveyType | undefined>();
  const [searchQ, setSearchQ] = useState("");
  const [activeTab, setActiveTab] = useState("전체");
  const [templatePage, setTemplatePage] = useState(0);
  const navigate = useNavigate();

  const openWizard = (tmpl?: SurveyType) => { setWizardTemplate(tmpl); setWizardOpen(true); };

  const visibleProjects = RECENT_PROJECTS.slice(0, 4);

  const TEMPLATES_PER_PAGE = 6;
  const filteredTemplates = SURVEY_TYPES.filter((t) => {
    const matchCat = activeTab === "전체" || t.category === activeTab;
    const matchSearch = !searchQ || t.title.includes(searchQ) || t.desc.includes(searchQ) || t.tags.some((tg) => tg.includes(searchQ));
    return matchCat && matchSearch;
  });
  const totalTemplatePages = Math.ceil(filteredTemplates.length / TEMPLATES_PER_PAGE);
  const paginatedTemplates = filteredTemplates.slice(
    templatePage * TEMPLATES_PER_PAGE,
    (templatePage + 1) * TEMPLATES_PER_PAGE
  );

  return (
    <div className="flex-1 flex flex-col bg-[#EEF2FA] overflow-y-auto">

      {/* Page Header */}
      <div className="bg-white border-b border-[#E1E8F1] px-8 py-5 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontSize: 12, color: "#9BA6B8", fontWeight: 600, marginBottom: 4 }}>
              2026년 3월 10일 화요일
            </p>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1D1F3D" }}>
              안녕하세요, 관리자님.
            </h1>
          </div>
          <button
            onClick={() => openWizard()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5B7DFF] text-white hover:bg-[#4562E8] transition-colors"
            style={{ fontSize: 13, fontWeight: 700, boxShadow: "0 4px 14px #5B7DFF33" }}>
            <Plus size={15} />
            새 프로젝트 시작
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mt-5">
          {[
            { icon: <FileText size={16} />, label: "진행 중인 프로젝트", value: "4", sub: "+2 이번 달", color: "#5B7DFF" },
            { icon: <CheckCircle2 size={16} />, label: "이번 달 완료", value: "12", sub: "전월 대비 +3", color: "#16A34A" },
            { icon: <BarChart2 size={16} />, label: "평균 응답률", value: "68%", sub: "업계 평균 +12%p", color: "#7C3AED" },
            { icon: <Users size={16} />, label: "등록 페르소나", value: "30", sub: "6개 세그먼트", color: "#EA580C" },
          ].map((s) => (
            <div key={s.label} className="bg-[#F7FAFF] border border-[#E1E8F1] rounded-2xl px-4 py-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: s.color + "15" }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <div>
                <p style={{ fontSize: 11, color: "#9BA6B8", fontWeight: 600, marginBottom: 2 }}>{s.label}</p>
                <div className="flex items-baseline gap-2">
                  <span style={{ fontSize: 20, fontWeight: 800, color: "#1D1F3D" }}>{s.value}</span>
                  <span style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.sub}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-8 py-6 flex flex-col gap-8">

        {/* Recent Projects */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#5B7DFF]" />
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1D1F3D" }}>최근 프로젝트</h2>
            </div>
            <button className="flex items-center gap-1 text-[#5B7DFF] hover:underline" style={{ fontSize: 12, fontWeight: 600 }}>
              전체 보기 <ChevronRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {visibleProjects.map((p) => (
              <ProjectCard key={p.id} project={p} onClick={() => navigate("/survey")} />
            ))}
          </div>
        </section>

        {/* Template Library */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LayoutGrid size={16} className="text-[#5B7DFF]" />
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1D1F3D" }}>템플릿 라이브러리</h2>
              <span className="bg-[#EEF4FF] text-[#5B7DFF] px-2.5 py-0.5 rounded-full border border-[#BFD4FF]" style={{ fontSize: 11, fontWeight: 700 }}>{SURVEY_TYPES.length}</span>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white border border-[#E1E8F1] rounded-xl px-3 py-2 flex-1 max-w-72">
              <Search size={13} className="text-[#9BA6B8] shrink-0" />
              <input className="bg-transparent outline-none flex-1 placeholder:text-[#DCE4F3]"
                style={{ fontSize: 13, color: "#1D1F3D" }}
                placeholder="템플릿 검색..."
                value={searchQ} onChange={(e) => setSearchQ(e.target.value)} />
              {searchQ && <button onClick={() => setSearchQ("")}><X size={12} className="text-[#DCE4F3]" /></button>}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setActiveTab(c)}
                  className="px-3 py-1.5 rounded-full border transition-colors"
                  style={{
                    fontSize: 12, fontWeight: activeTab === c ? 700 : 500,
                    backgroundColor: activeTab === c ? "#1D1F3D" : "#F7FAFF",
                    borderColor: activeTab === c ? "#1D1F3D" : "#E1E8F1",
                    color: activeTab === c ? "#fff" : "#7C8397",
                  }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#E1E8F1]">
              <AlertCircle size={28} className="text-[#DCE4F3] mx-auto mb-3" />
              <p style={{ fontSize: 14, fontWeight: 600, color: "#9BA6B8" }}>검색 결과가 없습니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedTemplates.map((t) => (
                <TemplateCard key={t.id} tmpl={t} onSelect={openWizard} />
              ))}
              {totalTemplatePages > 1 && (
                <div className="col-span-2 xl:col-span-3 flex items-center justify-center gap-3">
                  {templatePage > 0 && (
                    <button
                      onClick={() => setTemplatePage((p) => p - 1)}
                      className="px-3 py-2 rounded-full bg-[#F7FAFF] border border-[#E1E8F1] text-[#7C8397] hover:bg-[#EEF4FF] hover:border-[#BFD4FF] hover:text-[#5B7DFF] transition-colors"
                    >
                      <ChevronLeft size={14} />
                    </button>
                  )}
                  <span style={{ fontSize: 12, color: "#9BA6B8" }}>
                    {templatePage + 1} / {totalTemplatePages}
                  </span>
                  {templatePage < totalTemplatePages - 1 && (
                    <button
                      onClick={() => setTemplatePage((p) => p + 1)}
                      className="px-3 py-2 rounded-full bg-[#F7FAFF] border border-[#E1E8F1] text-[#7C8397] hover:bg-[#EEF4FF] hover:border-[#BFD4FF] hover:text-[#5B7DFF] transition-colors"
                    >
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {wizardOpen && (
        <WizardModal
          initialTemplate={wizardTemplate}
          onClose={() => { setWizardOpen(false); setWizardTemplate(undefined); }}
        />
      )}
    </div>
  );
}