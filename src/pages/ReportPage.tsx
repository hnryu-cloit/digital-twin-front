import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Download,
  RotateCcw,
  ChevronDown,
  Activity,
  Target,
  TrendingUp,
  Users,
  Zap,
  ShieldCheck,
  Maximize2,
  ExternalLink,
  Layers,
  Brain
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart
} from "recharts";

/* ─── Mock Data ─── */
const RADAR_DATA = [
  { subject: "성능 지향", Gamer: 92, General: 65, fullMark: 100 },
  { subject: "배터리 효율", Gamer: 70, General: 85, fullMark: 100 },
  { subject: "카메라 혁신", Gamer: 88, General: 72, fullMark: 100 },
  { subject: "AI 지능화", Gamer: 75, General: 68, fullMark: 100 },
  { subject: "가격 합리성", Gamer: 45, General: 78, fullMark: 100 },
];

const OPPORTUNITY_DATA = [
  { name: "20대", value: 72, target: 85 },
  { name: "30대", value: 88, target: 90 },
  { name: "40대", value: 55, target: 70 },
  { name: "50대", value: 38, target: 60 },
];

const TREND_DATA = [
  { week: "W1", value: 52 },
  { week: "W2", value: 61 },
  { week: "W3", value: 58 },
  { week: "W4", value: 74 },
  { week: "W5", value: 71 },
  { week: "W6", value: 83 },
  { week: "W7", value: 89 },
];

const FINDINGS = [
  {
    rank: 1,
    label: "최우선 전환 세그먼트",
    value: "30대 테크 게이머",
    delta: "+23.4%",
    desc: "고성능 하드웨어와 AI 소프트웨어 시너지를 가장 높게 평가하는 그룹입니다.",
    detail: "해당 그룹은 단순 스펙을 넘어 '실시간 레이트레이싱'과 'AI 화질 업스케일링' 기능에 압도적인 지불 용의(WTP)를 보이고 있습니다. 런칭 캠페인의 핵심 소구점으로 활용이 필요합니다.",
    tag: "Primary Target"
  },
  {
    rank: 2,
    label: "카메라 경험의 결정적 요인",
    value: "야간 시인성 (64.2%)",
    delta: "+11.8%",
    desc: "단순 화소수보다 저조도 환경에서의 AI 노이즈 억제력을 주요 구매 동인으로 선택했습니다.",
    detail: "전문가용 RAW 파일 편집 기능보다 자동 보정된 결과물의 'SNS 즉시 공유성'에 더 높은 가치를 부여합니다. '찍으면 바로 작품이 되는' 직관적 편의성을 강조하세요.",
    tag: "Core Value"
  },
  {
    rank: 3,
    label: "가격 저항선 및 이탈 리스크",
    value: "50대 실용주의층",
    delta: "-8.5%",
    desc: "AI 기능의 효용성보다 기기 출고가 인상에 대한 민감도가 임계치에 도달했습니다.",
    detail: "고연령 일반 사용자는 AI 기능을 '필수'가 아닌 '부가' 서비스로 인지합니다. 초기 구매 혜택보다는 '장기 사용 시의 잔존 가치 보전' 프로그램 제시가 효과적일 것입니다.",
    tag: "Risk Alert"
  },
];

const SECTIONS = [
  { id: "summary", label: "종합 분석 요약", icon: "01" },
  { id: "findings", label: "전략적 핵심 인사이트", icon: "02" },
  { id: "detail", label: "데이터 기반 상세 분석", icon: "03" },
  { id: "segment", label: "세그먼트 기회 매트릭스", icon: "04" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

/* ─── Components ─── */
function KpiCard({ icon, label, value, sub, delta, reliability }: { icon: React.ReactNode; label: string; value: string; sub: string; delta?: string; reliability: string }) {
  return (
    <div className="app-card p-7 flex flex-col gap-5 hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform" />
      <div className="flex items-start justify-between relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-[var(--primary-light-bg)] text-primary flex items-center justify-center border border-[var(--primary-light-border)] shadow-sm group-hover:bg-white transition-colors">
          {icon}
        </div>
        <div className="flex flex-col items-end">
          {delta && (
            <span className="flex items-center gap-1 text-[11px] font-black text-primary bg-[var(--primary-light-bg)] px-2 py-1 rounded-lg border border-[var(--primary-light-border)] shadow-sm">
              <TrendingUp size={10} /> {delta}
            </span>
          )}
          <span className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mt-2">{reliability} Confidence</span>
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-[11px] font-black text-[var(--subtle-foreground)] uppercase tracking-[0.1em] mb-1.5">{label}</p>
        <p className="text-[28px] font-black text-foreground tracking-tighter leading-none mb-2">{value}</p>
        <p className="text-[12px] text-[var(--muted-foreground)] font-bold opacity-80">{sub}</p>
      </div>
    </div>
  );
}

function SectionHeader({ num, title, badge, onDetailClick }: { num: string; title: string; badge?: string; onDetailClick?: () => void }) {
  return (
    <div className="mb-10 flex items-center justify-between border-b border-[var(--border)] pb-8">
      <div className="flex items-center gap-5">
        <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center text-[13px] font-black shadow-xl shadow-blue-100">{num}</div>
        <div>
          <h2 className="text-[22px] font-black text-foreground tracking-tight">{title}</h2>
          {badge && <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1 block opacity-60">{badge}</span>}
        </div>
      </div>
      <button 
        onClick={onDetailClick}
        className="flex items-center gap-1.5 bg-white border border-[var(--border)] px-4 py-2 rounded-xl text-[12px] font-black text-[var(--secondary-foreground)] hover:bg-[var(--panel-soft)] hover:text-primary hover:border-primary/30 transition-all shadow-sm group/btn active:scale-95"
      >
        더보기
        <span className="text-[11px] text-[var(--subtle-foreground)] group-hover/btn:translate-x-0.5 transition-transform">&gt;</span>
      </button>
    </div>
  );
}

export const ReportPage: React.FC = () => {
  const [activeSection, setSection] = useState<SectionId>("summary");
  const [downloadOpen, setDownloadOpen] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  const sectionRefs: Record<SectionId, React.RefObject<HTMLDivElement>> = {
    summary: useRef<HTMLDivElement>(null),
    findings: useRef<HTMLDivElement>(null),
    detail: useRef<HTMLDivElement>(null),
    segment: useRef<HTMLDivElement>(null),
  };

  const scrollToSection = (id: SectionId) => {
    setSection(id);
    const target = sectionRefs[id].current;
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSection(entry.target.id as SectionId);
          }
        });
      },
      { rootMargin: "-150px 0px -70% 0px", threshold: 0 }
    );

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(e.target as Node)) setDownloadOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex h-full w-full flex-col bg-background overflow-hidden">
      
      {/* ── 페이지 헤더 ── */}
      <div className="app-page-header shrink-0 flex items-center justify-between">
        <div>
          <p className="app-page-eyebrow">Insight Report</p>
          <h1 className="app-page-title mt-1">
            전략적 분석 결과 <span className="text-primary">최종 리포트.</span>
          </h1>
          <p className="app-page-description">
            가상 페르소나 데이터 30,000건 시뮬레이션 기반 컨설팅 인사이트 보고서입니다.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border)] bg-white text-[13px] font-black text-[var(--secondary-foreground)] hover:bg-[var(--panel-soft)] transition-all shadow-sm active:scale-95">
            <RotateCcw size={16} />재분석 실행
          </button>
          <div className="relative" ref={downloadRef}>
            <button onClick={() => setDownloadOpen(!downloadOpen)} className="flex items-center gap-3 px-7 py-2.5 rounded-xl bg-primary text-white text-[14px] font-black hover:bg-primary-hover shadow-xl shadow-blue-100 transition-all active:scale-95">
              <Download size={18} />리포트 내보내기<ChevronDown size={16} className={`transition-transform ${downloadOpen ? "rotate-180" : ""}`} />
            </button>
            {downloadOpen && (
              <div className="absolute right-0 top-full mt-3 z-50 w-56 bg-white border border-[var(--border)] rounded-2xl shadow-2xl p-1.5 animate-in fade-in slide-in-from-top-2">
                <button className="w-full text-left px-4 py-3 rounded-xl text-[13px] font-bold text-[var(--secondary-foreground)] hover:bg-[var(--panel-soft)] hover:text-primary transition-all">PDF (High Quality) 다운로드</button>
                <button className="w-full text-left px-4 py-3 rounded-xl text-[13px] font-bold text-[var(--secondary-foreground)] hover:bg-[var(--panel-soft)] hover:text-primary transition-all">DOCX (Editable) 다운로드</button>
                <button className="w-full text-left px-4 py-3 rounded-xl text-[13px] font-bold text-[var(--secondary-foreground)] hover:bg-[var(--panel-soft)] hover:text-primary transition-all">PPTX (Presentation) 다운로드</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-10 pb-10 hide-scrollbar scroll-smooth">
        <div className="max-w-[1600px] mx-auto space-y-8 pb-24 pt-2">
          
          {/* KPI Dashboard Grid */}
          <section className="grid grid-cols-4 gap-6">
            <KpiCard icon={<Users size={22} />} label="분석 총 표본수" value="30,000" sub="성별/연령/지역 비례 할당" delta="+4.2%" reliability="99.2%" />
            <KpiCard icon={<Target size={22} />} label="최종 구매 의향" value="68.7%" sub="목표 수치(60%) 대비 상회" delta="+12.0%" reliability="95.0%" />
            <KpiCard icon={<ShieldCheck size={22} />} label="응답 논리 정합성" value="98.4%" sub="모순 탐지 0.3% 미만" reliability="99.9%" />
            <KpiCard icon={<Zap size={22} />} label="핵심 전략 액션" value="03" sub="실행 우선순위 도출 완료" delta="New" reliability="High" />
          </section>

          <div className="grid grid-cols-[280px_1fr] gap-8 items-start">
            
            {/* ─── Sticky Section Nav ─── */}
            <aside className="sticky top-0 z-20 space-y-1.5 bg-white/80 backdrop-blur-md border border-[var(--border)] rounded-[28px] p-4 shadow-[var(--shadow-md)]">
              <div className="px-4 py-3 mb-2 border-b border-[var(--border)]">
                <p className="text-[10px] font-black uppercase text-[var(--muted-foreground)] tracking-[0.2em]">Table of Contents</p>
              </div>
              {SECTIONS.map(s => (
                <button key={s.id} onClick={() => scrollToSection(s.id)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all relative group/nav ${activeSection === s.id ? "bg-primary text-white shadow-[var(--shadow-sm)] font-black" : "text-[var(--subtle-foreground)] hover:bg-[var(--panel-soft)]"}`}>
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-black border transition-all ${activeSection === s.id ? "bg-white/20 border-white/30 text-white" : "bg-[var(--panel-soft)] border-[var(--border)] text-[var(--muted-foreground)] opacity-60 group-hover/nav:opacity-100"}`}>{s.icon}</span>
                  <span className="text-[13.5px] tracking-tight">{s.label}</span>
                  {activeSection === s.id && <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </button>
              ))}
            </aside>

            {/* ─── Content Area ─── */}
            <div className="space-y-10">
              
              {/* SECTION 01: 종합 요약 */}
              <section id="summary" ref={sectionRefs.summary} className="app-card p-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full -mr-64 -mt-64 blur-3xl group-hover:bg-primary/10 transition-all duration-1000" />
                <SectionHeader num="01" title="종합 분석 및 총평" badge="Executive Summary" />
                
                <div className="grid grid-cols-2 gap-16 relative z-10">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-black text-foreground uppercase tracking-widest flex items-center gap-3"><Layers size={16} className="text-primary" />핵심 선호 프로파일</p>
                      <span className="text-[11px] font-black text-[var(--muted-foreground)]">Confidence: 98%</span>
                    </div>
                    <div className="h-[280px] app-soft p-6 bg-[var(--panel-soft)] border-[var(--border)] shadow-inner rounded-3xl">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={RADAR_DATA}>
                          <PolarGrid stroke="var(--border)" />
                          <PolarAngleAxis dataKey="subject" tick={{fontSize: 11, fontWeight: 800, fill: "var(--secondary-foreground)"}} />
                          <Radar name="핵심 타겟" dataKey="Gamer" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.15} strokeWidth={4} />
                          <Radar name="비교 그룹" dataKey="General" stroke="var(--subtle-foreground)" fill="var(--subtle-foreground)" fillOpacity={0.05} strokeWidth={2} strokeDasharray="4 4" />
                          <Tooltip contentStyle={{borderRadius: 16, border: "none", boxShadow: "var(--shadow-xl)"}} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-black text-foreground uppercase tracking-widest flex items-center gap-3"><Activity size={16} className="text-primary" />구매 의향 가속도</p>
                      <span className="text-[11px] font-black text-[var(--muted-foreground)]">Trend Analysis</span>
                    </div>
                    <div className="h-[280px] app-soft p-6 bg-[var(--panel-soft)] border-[var(--border)] shadow-inner rounded-3xl">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={TREND_DATA}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 3" />
                          <XAxis dataKey="week" hide />
                          <Tooltip contentStyle={{borderRadius: 16, border: "none", boxShadow: "var(--shadow-xl)"}} />
                          <Area type="monotone" dataKey="value" stroke="var(--chart-1)" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="mt-12 p-10 bg-[var(--foreground)] text-white rounded-[32px] relative overflow-hidden shadow-[var(--shadow-lg)] border-none group/insight">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 group-hover/insight:opacity-100 transition-opacity" />
                  <div className="flex items-start gap-6 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shrink-0">
                      <Brain size={32} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-4">Strategic Intelligence Report</p>
                      <p className="text-[18px] font-bold leading-relaxed text-white/90 italic">
                        "Galaxy S25의 초기 시장 진입은 30대 헤비 유저 그룹의 압도적인 호응을 바탕으로 매우 긍정적일 것으로 예측됩니다. 
                        특히 <span className="text-primary">AI 화질 보정 알고리즘</span>에 대한 높은 신뢰도는 경쟁사 대비 강력한 차별화 요소로 작동하고 있습니다. 
                        하반기에는 가격 탄력성이 높은 보급형 시장을 위한 전략적 금융 프로모션이 선행되어야 합니다."
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 02: 핵심 인사이트 */}
              <section id="findings" ref={sectionRefs.findings} className="app-card p-12 relative overflow-hidden">
                <SectionHeader num="02" title="전략적 핵심 인사이트" badge="Key Findings & Decisions" />
                <div className="grid grid-cols-1 gap-8">
                  {FINDINGS.map(f => (
                    <div key={f.rank} className="app-soft p-10 hover:bg-card hover:shadow-xl transition-all duration-500 group border-[var(--border)] bg-[var(--panel-soft)]">
                      <div className="flex items-center gap-10 mb-8 pb-8 border-b border-[var(--border)]/50">
                        <div className="w-16 h-16 rounded-[24px] bg-white border border-[var(--border)] flex items-center justify-center text-[24px] font-black text-primary shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">#{f.rank}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className="text-[10px] font-black text-primary bg-[var(--primary-light-bg)] px-2 py-0.5 rounded uppercase tracking-tighter">{f.tag}</span>
                            <p className="text-[11px] font-black text-[var(--subtle-foreground)] uppercase tracking-widest">{f.label}</p>
                          </div>
                          <h4 className="text-[22px] font-black text-foreground tracking-tight">{f.value}</h4>
                        </div>
                        <div className="text-right">
                          <span className={`text-[24px] font-black ${f.delta.startsWith('+') ? 'text-primary' : 'text-[var(--subtle-foreground)]'}`}>{f.delta}</span>
                          <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase mt-1 tracking-widest">Impact Score</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <p className="text-[15px] text-[var(--secondary-foreground)] font-bold leading-relaxed">{f.desc}</p>
                        <div className="p-6 bg-white/80 rounded-2xl border border-[var(--border)] shadow-inner italic">
                          <p className="text-[14px] text-[var(--muted-foreground)] font-medium leading-relaxed opacity-90">"{f.detail}"</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION 03: 상세 분석 */}
              <section id="detail" ref={sectionRefs.detail} className="app-card p-12">
                <SectionHeader num="03" title="데이터 기반 심층 분석" badge="Quantitative Evidence" />
                <div className="grid grid-cols-2 gap-8">
                  <div className="app-soft p-8 space-y-8 bg-[var(--panel-soft)] border-[var(--border)]">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[15px] font-black text-foreground flex items-center gap-3"><TrendingUp size={18} className="text-primary" />세그먼트별 기회 지수</h4>
                      <button className="text-[var(--muted-foreground)] hover:text-primary transition-colors"><Maximize2 size={16} /></button>
                    </div>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={OPPORTUNITY_DATA} margin={{top:20, right:30, left:0, bottom:0}}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:12, fontWeight:800}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize:11}} />
                          <Bar dataKey="value" fill="var(--chart-1)" radius={[6, 6, 0, 0]} barSize={32} />
                          <Bar dataKey="target" fill="var(--border)" radius={[6, 6, 0, 0]} barSize={32} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="app-soft p-10 bg-primary text-white border-none shadow-[var(--shadow-lg)] flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl" />
                    <div className="relative z-10">
                      <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-6 opacity-60 text-white/80">Opportunity Matrix</p>
                      <h4 className="text-[24px] font-black leading-tight mb-6">30대 타겟 그룹의<br />성장 기회 지수 +142.5 pts</h4>
                      <p className="text-[14px] font-medium leading-relaxed text-white/80 mb-8 italic">
                        "경쟁사 이탈 의향이 있는 30대 얼리어답터 그룹을 대상으로 한 초기 프로모션 집중 시, 전체 판매량의 15% 추가 업사이드가 예상됩니다."
                      </p>
                      <button className="flex items-center gap-2 text-[13px] font-black text-white bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition-all border border-white/20">
                        세부 시뮬레이션 결과 보기 <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 04: 최종 액션 */}
              <section id="segment" ref={sectionRefs.segment} className="app-card p-12">
                <SectionHeader num="04" title="전략적 권장 액션" badge="Execution Roadmap" />
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { title: "메시징 최적화", desc: "기술 용어 중심에서 '사용 결과' 체감형 메시지로 전환", priority: "High", time: "Q1" },
                    { title: "타겟 오퍼 설계", desc: "헤비 유저 대상 기기 보상 판매 혜택 강화", priority: "High", time: "Immediate" },
                    { title: "체험 공간 확충", desc: "오프라인 AI 기능 집중 체험존 전국 50개소 확대", priority: "Mid", time: "Q2" },
                  ].map((action, i) => (
                    <div key={i} className="app-soft p-8 border-[var(--border)] hover:border-primary/30 transition-all group/action">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-10 h-10 rounded-xl bg-[var(--panel-soft)] flex items-center justify-center text-[var(--subtle-foreground)] group-hover/action:bg-primary group-hover/action:text-white transition-all"><Zap size={20} /></div>
                        <span className="text-[10px] font-black text-primary bg-[var(--primary-light-bg)] px-2 py-0.5 rounded uppercase">{action.priority}</span>
                      </div>
                      <h5 className="text-[16px] font-black text-foreground mb-3">{action.title}</h5>
                      <p className="text-[13px] text-[var(--muted-foreground)] font-bold leading-relaxed">{action.desc}</p>
                      <div className="mt-6 pt-6 border-t border-[var(--border)] flex items-center justify-between text-[11px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">
                        <span>Timeline</span>
                        <span className="text-[var(--muted-foreground)]">{action.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
