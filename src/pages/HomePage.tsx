import type React from "react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { projectApi, type Project } from "@/lib/api";
import {
  Clock, BarChart2, ChevronRight,
  Target, Star,
  Globe, Package, Eye,
  Loader
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

/* ─── Wizard Modal Placeholder ─── */
const WizardModal: React.FC<{ initialTemplate?: SurveyType; onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-card p-10 rounded-[40px] shadow-2xl flex flex-col items-center gap-6">
        <h2 className="text-2xl font-black">프로젝트 설계 모드</h2>
        <p className="text-muted-foreground text-center">현재 API 연결 기반 리팩토링 중입니다. 리서치 설계를 시작하려면 백엔드 연동을 완료하세요.</p>
        <button onClick={onClose} className="bg-primary text-white px-8 py-3 rounded-2xl font-black">닫기</button>
      </div>
    </div>
  );
};

/* ─── Main HomePage Component ─── */
export function HomePage() {
  const navigate = useNavigate();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardTemplate, setWizardTemplate] = useState<SurveyType | undefined>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectApi.getProjects(1, 4),
    retry: false,
  });

  // 에러 발생하거나 로딩 중일 때 MOCK_PROJECTS를 기본값으로 사용하여 렌더링 보장
  const projects = useMemo(() => {
    if (!data || !data.items || data.items.length === 0) return MOCK_PROJECTS;
    return data.items;
  }, [data]);

  const openWizard = (tmpl?: SurveyType) => {
    setWizardTemplate(tmpl);
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
              projects.map(p => <ProjectCard key={p.id} project={p} onClick={() => navigate("/survey")} />)
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

      {wizardOpen && <WizardModal initialTemplate={wizardTemplate} onClose={() => setWizardOpen(false)} />}
    </div>
  );
}
