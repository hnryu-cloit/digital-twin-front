import type React from "react";
import { useState } from "react";
import { 
  Settings, Shield, Database, FileText, LayoutGrid, Users, Code, 
  Sparkles, Save, RotateCcw, AlertCircle, Terminal, Cpu, Sliders,
  MessageSquare, Brain, Target, Globe, BarChart2
} from "lucide-react";

/* ─── 네비게이션 구조 ─── */
interface NavSection {
  label: string;
  items: { key: string; label: string; icon: React.ElementType }[];
}

const NAV: NavSection[] = [
  {
    label: "시스템 관리",
    items: [
      { key: "users",    label: "사용자 및 역할 관리", icon: Users },
      { key: "security", label: "보안 정책 설정", icon: Shield },
      { key: "datasrc",  label: "데이터 소스 커넥터", icon: Database },
    ],
  },
  {
    label: "AI 엔진 최적화",
    items: [
      { key: "prompt",   label: "프롬프트 파인튜닝", icon: Terminal },
      { key: "model",    label: "모델 및 하이퍼파라미터", icon: Cpu },
    ],
  },
  {
    label: "서비스 운영",
    items: [
      { key: "report",   label: "리포트 배포 정책", icon: FileText },
      { key: "menu",     label: "화면 위젯 구성", icon: LayoutGrid },
    ],
  },
];

/* ─── 공통 컴포넌트 ─── */
function SectionTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-8 animate-in fade-in slide-in-from-left-4 duration-300">
      <h2 className="text-[28px] font-black text-slate-900 tracking-tight">{title}</h2>
      {desc && <p className="text-[14px] text-[#2454C8] font-bold mt-2 opacity-80 uppercase tracking-widest">{desc}</p>}
    </div>
  );
}

function SettingGroup({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
      {title && <p className="mb-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3">{title}</p>}
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  );
}

/* ─── 프롬프트 파인튜닝 전용 컴포넌트 ─── */
function PromptEditor({ template }: { template: string }) {
  const [prompt, setPrompt] = useState(`You are an expert researcher specializing in ${template}. 
Your goal is to analyze raw persona response data and generate strategic insights.
Focus on:
1. Identifying statistically significant patterns.
2. Highlighting risk factors based on p-value < 0.05.
3. Suggesting actionable marketing strategies for Samsung Galaxy S25.`);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-black text-slate-700">시스템 프롬프트 (System Prompt)</span>
        <span className="text-[11px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded font-black uppercase tracking-tighter">v2.4.1 Stable</span>
      </div>
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2454C8] to-blue-400 rounded-2xl opacity-10 group-hover:opacity-20 transition-all" />
        <textarea 
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          className="relative w-full h-64 bg-[#1E293B] text-blue-100 p-6 rounded-2xl font-mono text-[13px] leading-relaxed outline-none focus:ring-2 ring-primary/50 shadow-2xl"
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-[12px] font-bold text-slate-500 hover:bg-slate-50 transition-all"><RotateCcw size={14} /> 초기화</button>
        <button className="flex items-center gap-2 px-6 py-2 rounded-xl bg-[#2454C8] text-white text-[12px] font-black shadow-lg shadow-blue-100 hover:bg-[#1E46A8] transition-all"><Save size={14} /> 변경사항 적용</button>
      </div>
    </div>
  );
}

/* ─── 섹션 콘텐츠 ─── */
const CONTENT: Record<string, React.ReactNode> = {
  prompt: (
    <>
      <SectionTitle title="프롬프트 파인튜닝" desc="리서치 유형별 AI 분석 에이전트의 페르소나와 지시문을 최적화합니다." />
      
      <div className="grid grid-cols-1 gap-8">
        <SettingGroup title="리서치 템플릿 선택">
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: "concept", label: "컨셉 테스트", icon: Target },
              { id: "usage", label: "Usage 조사", icon: BarChart2 },
              { id: "brand", label: "브랜드 인식", icon: Globe },
            ].map(t => (
              <button key={t.id} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${t.id === "concept" ? "border-[#2454C8] bg-[#F7FAFF] shadow-sm" : "border-slate-100 hover:border-slate-200"}`}>
                <div className={`p-2 rounded-lg ${t.id === "concept" ? "bg-[#2454C8] text-white" : "bg-slate-50 text-slate-400"}`}><t.icon size={18} /></div>
                <span className={`text-[14px] font-black ${t.id === "concept" ? "text-[#2454C8]" : "text-slate-600"}`}>{t.label}</span>
              </button>
            ))}
          </div>
        </SettingGroup>

        <SettingGroup title="분석 지시문 편집">
          <PromptEditor template="Concept Test" />
        </SettingGroup>

        <SettingGroup title="모델 파라미터 최적화">
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-3"><span className="text-[12px] font-black text-slate-700">창의성 (Temperature)</span><span className="text-[12px] font-black text-[#2454C8]">0.7</span></div>
                <input type="range" className="w-full accent-[#2454C8]" min="0" max="1" step="0.1" defaultValue="0.7" />
                <p className="text-[11px] text-slate-400 mt-2 font-bold italic">* 낮을수록 정확하고 결정론적인 답변을 생성합니다.</p>
              </div>
              <div>
                <div className="flex justify-between mb-3"><span className="text-[12px] font-black text-slate-700">문맥 유지 (Top-P)</span><span className="text-[12px] font-black text-[#2454C8]">0.9</span></div>
                <input type="range" className="w-full accent-[#2454C8]" min="0" max="1" step="0.1" defaultValue="0.9" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#2454C8] mb-1"><Sparkles size={14} /><span className="text-[11px] font-black uppercase">Fine-tuning Guide</span></div>
                <p className="text-[12px] text-slate-500 font-bold leading-relaxed">특정 세그먼트에 대한 분석 성능을 높이려면 시스템 프롬프트 하단에 페르소나별 가중치 지시문을 추가하는 것이 효과적입니다.</p>
              </div>
            </div>
          </div>
        </SettingGroup>
      </div>
    </>
  ),
  users: (
    <>
      <SectionTitle title="사용자 및 역할 관리" desc="시스템에 접속하는 구성원의 권한을 정의합니다." />
      <SettingGroup title="관리자 리스트">
        <div className="p-20 text-center text-slate-300 font-black italic">User Management Module - Ready</div>
      </SettingGroup>
    </>
  ),
};

/* ─── 메인 ─── */
export const SettingsPage: React.FC = () => {
  const [active, setActive] = useState("prompt");

  return (
    <div className="flex h-full w-full items-start justify-center overflow-hidden bg-[#F8FAFC] p-8">
      <div className="flex h-full w-full max-w-6xl overflow-hidden rounded-[40px] border border-[#DCE4F3] bg-white shadow-2xl animate-in fade-in zoom-in duration-500">
        {/* Sidebar Nav */}
        <nav className="w-64 shrink-0 overflow-y-auto border-r border-[#F1F5F9] bg-[#F7FAFF]/50 px-4 py-10 hide-scrollbar">
          {NAV.map((section) => (
            <div key={section.label} className="mb-10">
              <p className="px-5 pb-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-70">
                {section.label}
              </p>
              <div className="flex flex-col gap-1.5">
                {section.items.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActive(item.key)}
                    className={`flex w-full items-center gap-4 rounded-2xl px-5 py-3.5 text-left transition-all group ${
                      active === item.key 
                        ? "bg-[#2454C8] text-white shadow-xl shadow-blue-200 font-black scale-[1.03]" 
                        : "text-slate-500 font-bold hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    <item.icon size={18} className={active === item.key ? "text-white" : "text-slate-300 group-hover:text-primary"} />
                    <span className="text-[13px]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-white hide-scrollbar">
          <div className="mx-auto max-w-4xl px-12 pt-12 pb-24">
            {/* Welcome Header */}
            <section className="rounded-2xl border border-border/90 bg-card p-8 shadow-elevated relative overflow-hidden group mb-12">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-all duration-1000" />
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Management System</p>
                <h1 className="mt-2 font-title text-3xl font-bold leading-tight text-slate-900 md:text-4xl tracking-tight">
                  시스템 및 <span className="text-primary">운영 설정.</span>
                </h1>
                <p className="mt-3 max-w-2xl text-base font-medium text-slate-500">
                  분석 모델 환경, 데이터 보안 및 사용자 권한 설정을 최적화합니다.
                </p>
              </div>
            </section>

            {CONTENT[active] || <div className="p-20 text-center text-slate-300 italic font-black uppercase">Section Coming Soon</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
