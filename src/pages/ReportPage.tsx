import type React from"react";
import { useState, useRef, useEffect } from"react";
import { reportApi, type ReportDetail } from"@/lib/api";
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
} from"lucide-react";
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
} from"recharts";

/* ─── Mock Data ─── */
const RADAR_DATA = [
 { subject:"성능 지향", Gamer: 92, General: 65, fullMark: 100 },
 { subject:"배터리 효율", Gamer: 70, General: 85, fullMark: 100 },
 { subject:"카메라 혁신", Gamer: 88, General: 72, fullMark: 100 },
 { subject:"AI 지능화", Gamer: 75, General: 68, fullMark: 100 },
 { subject:"가격 합리성", Gamer: 45, General: 78, fullMark: 100 },
];

const OPPORTUNITY_DATA = [
 { name:"20대", value: 72, target: 85 },
 { name:"30대", value: 88, target: 90 },
 { name:"40대", value: 55, target: 70 },
 { name:"50대", value: 38, target: 60 },
];

const TREND_DATA = [
 { week:"W1", value: 52 },
 { week:"W2", value: 61 },
 { week:"W3", value: 58 },
 { week:"W4", value: 74 },
 { week:"W5", value: 71 },
 { week:"W6", value: 83 },
 { week:"W7", value: 89 },
];

const FINDINGS = [
  {
    rank: 1,
    tag: "Primary Target",
    label: "최우선 전환 세그먼트",
    value: "30대 테크 게이머",
    delta: "+23.4%",
    isPositive: true,
    desc: "고성능 하드웨어와 AI 소프트웨어 시너지를 가장 높게 평가하는 핵심 수익원입니다.",
    evidence: [
      { label: "AI 기능 지불 용의(WTP)", value: "76.3%" },
      { label: "실시간 레이트레이싱 선호도", value: "88.1%" },
      { label: "경쟁사 대비 브랜드 선호", value: "+2.1배" },
    ],
    action: "런칭 캠페인 핵심 소구점을 '레이트레이싱 + AI 업스케일링' 조합으로 집중 배치하고, 게이밍 인플루언서 파트너십을 통한 체험형 바이럴 마케팅을 선제 집행하세요.",
  },
  {
    rank: 2,
    tag: "Core Value",
    label: "카메라 경험의 결정적 요인",
    value: "야간 시인성 (64.2%)",
    delta: "+11.8%",
    isPositive: true,
    desc: "단순 화소수보다 저조도 AI 노이즈 억제력이 실구매 전환의 핵심 변수입니다.",
    evidence: [
      { label: "야간 촬영 만족도 우선 응답", value: "64.2%" },
      { label: "SNS 즉시 공유 의향", value: "71.5%" },
      { label: "RAW 편집 대비 자동보정 선호", value: "3.2배" },
    ],
    action: "'찍으면 바로 작품이 되는' 직관적 편의성을 전면에 내세우고, 야간 촬영 비교 시연 콘텐츠를 온·오프라인 체험 마케팅의 핵심 크리에이티브로 활용하세요.",
  },
  {
    rank: 3,
    tag: "Risk Alert",
    label: "가격 저항선 및 이탈 리스크",
    value: "50대 실용주의층",
    delta: "-8.5%",
    isPositive: false,
    desc: "AI 기능의 효용성보다 기기 출고가 인상에 대한 심리적 저항이 임계치에 도달했습니다.",
    evidence: [
      { label: "출고가 인상 거부 응답률", value: "72.8%" },
      { label: "타 그룹 대비 가격 민감도", value: "2.4배" },
      { label: "AI 기능 '부가' 인식 비율", value: "61.0%" },
    ],
    action: "초기 구매 할인보다 보상 판매·장기 보증 강화 등 '잔존 가치 보전' 프로그램을 전면에 제시하고, AI 기능을 '비용'이 아닌 '생활 절감 도구'로 재프레이밍하는 메시지를 별도 운용하세요.",
  },
];

const SECTIONS = [
 { id:"summary", label:"종합 분석 요약", icon:"01" },
 { id:"findings", label:"전략적 핵심 인사이트", icon:"02" },
 { id:"detail", label:"데이터 기반 상세 분석", icon:"03" },
 { id:"segment", label:"세그먼트 기회 매트릭스", icon:"04" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

/* ─── Components ─── */
function KpiCard({ icon, label, value, sub, delta, reliability }: { icon: React.ReactNode; label: string; value: string; sub: string; delta?: string; reliability: string }) {
 return (
 <div className="app-card p-7 flex flex-col gap-5 hover:shadow-[var(--shadow-lg)] transition-all duration-500 group relative overflow-hidden">
 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform" />
 <div className="flex items-start justify-between relative z-10">
 <div className="w-12 h-12 rounded-2xl bg-[var(--primary-light-bg)] text-primary flex items-center justify-center border border-[var(--primary-light-border)] shadow-[var(--shadow-sm)] group-hover:bg-card transition-colors">
 {icon}
 </div>
 <div className="flex flex-col items-end">
 {delta && (
 <span className="flex items-center gap-1 text-[11px] font-black text-primary bg-[var(--primary-light-bg)] px-2 py-1 rounded-lg border border-[var(--primary-light-border)] shadow-[var(--shadow-sm)]">
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
 <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center text-[13px] font-black shadow-[var(--shadow-lg)]">{num}</div>
 <div>
 <h2 className="text-[22px] font-black text-foreground tracking-tight">{title}</h2>
 {badge && <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1 block opacity-60">{badge}</span>}
 </div>
 </div>
 <button 
 onClick={onDetailClick}
 className="flex items-center gap-1.5 bg-card border border-[var(--border)] px-4 py-2 rounded-xl text-[12px] font-black text-[var(--secondary-foreground)] hover:bg-[var(--panel-soft)] hover:text-primary hover:border-primary/30 transition-all shadow-[var(--shadow-sm)] group/btn active:scale-95"
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
 const [reportData, setReportData] = useState<ReportDetail | null>(null);

 useEffect(() => {
   reportApi.getReport("rpt-001").then(setReportData);
 }, []);

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
 target.scrollIntoView({ behavior:"smooth", block:"start" });
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
 { rootMargin:"-150px 0px -70% 0px", threshold: 0 }
 );

 Object.values(sectionRefs).forEach((ref) => {
 if (ref.current) observer.observe(ref.current);
 });

 return () => observer.disconnect();
 // sectionRefs는 렌더마다 재생성되는 객체이므로 deps 제외
 // eslint-disable-next-line react-hooks/exhaustive-deps
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
 <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border)] bg-card text-[13px] font-black text-[var(--secondary-foreground)] hover:bg-[var(--panel-soft)] transition-all shadow-[var(--shadow-sm)] active:scale-95">
 <RotateCcw size={16} />재분석 실행
 </button>
 <div className="relative" ref={downloadRef}>
 <button onClick={() => setDownloadOpen(!downloadOpen)} className="flex items-center gap-3 px-7 py-2.5 rounded-xl bg-primary text-white text-[14px] font-black hover:bg-primary-hover shadow-[var(--shadow-lg)] transition-all active:scale-95">
 <Download size={18} />리포트 내보내기<ChevronDown size={16} className={`transition-transform ${downloadOpen ?"rotate-180" :""}`} />
 </button>
 {downloadOpen && (
 <div className="absolute right-0 top-full mt-3 z-50 w-56 bg-card border border-[var(--border)] rounded-2xl shadow-[var(--shadow-lg)] p-1.5 animate-in fade-in slide-in-from-top-2">
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
 <KpiCard icon={<Users size={22} />} label="분석 총 표본수" value={reportData?.kpis?.[0]?.value ?? "30,000"} sub="성별/연령/지역 비례 할당" delta="+4.2%" reliability="99.2%" />
 <KpiCard icon={<Target size={22} />} label="최종 구매 의향" value={reportData?.kpis?.[1]?.value ?? "68.7%"} sub="목표 수치(60%) 대비 상회" delta="+12.0%" reliability="95.0%" />
 <KpiCard icon={<ShieldCheck size={22} />} label="응답 논리 정합성" value={reportData?.kpis?.[2]?.value ?? "98.4%"} sub="모순 탐지 0.3% 미만" reliability="99.9%" />
 <KpiCard icon={<Zap size={22} />} label="핵심 전략 액션" value={reportData?.kpis?.[3]?.value ?? "03"} sub="실행 우선순위 도출 완료" delta="New" reliability="High" />
 </section>

 <div className="grid grid-cols-[280px_1fr] gap-8 items-start">
 
 {/* ─── Sticky Section Nav ─── */}
 <aside className="sticky top-0 z-20 space-y-1.5 bg-white/80 backdrop-blur-md border border-[var(--border)] rounded-[28px] p-4 shadow-[var(--shadow-[var(--shadow-md)])]">
 <div className="px-4 py-3 mb-2 border-b border-[var(--border)]">
 <p className="text-[10px] font-black uppercase text-[var(--muted-foreground)] tracking-[0.2em]">Table of Contents</p>
 </div>
 {SECTIONS.map(s => (
 <button key={s.id} onClick={() => scrollToSection(s.id)}
 className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all relative group/nav ${activeSection === s.id ?"bg-primary text-white shadow-[var(--shadow-[var(--shadow-sm)])] font-black" :"text-[var(--subtle-foreground)] hover:bg-[var(--panel-soft)]"}`}>
 <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-black border transition-all ${activeSection === s.id ?"bg-white/20 border-white/30 text-white" :"bg-[var(--panel-soft)] border-[var(--border)] text-[var(--muted-foreground)] opacity-60 group-hover/nav:opacity-100"}`}>{s.icon}</span>
 <span className="text-[13.5px] tracking-tight">{s.label}</span>
 {activeSection === s.id && <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-card animate-pulse" />}
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
 <PolarAngleAxis dataKey="subject" tick={{fontSize: 11, fontWeight: 800, fill:"var(--secondary-foreground)"}} />
 <Radar name="핵심 타겟" dataKey="Gamer" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.15} strokeWidth={4} />
 <Radar name="비교 그룹" dataKey="General" stroke="var(--subtle-foreground)" fill="var(--subtle-foreground)" fillOpacity={0.05} strokeWidth={2} strokeDasharray="4 4" />
 <Tooltip contentStyle={{borderRadius: 16, border:"none", boxShadow:"var(--shadow-[var(--shadow-lg)])"}} />
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
 <Tooltip contentStyle={{borderRadius: 16, border:"none", boxShadow:"var(--shadow-[var(--shadow-lg)])"}} />
 <Area type="monotone" dataKey="value" stroke="var(--chart-1)" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>

 {/* Strategic Intelligence Report - 전문 리포트 스타일로 개편 */}
 <div className="mt-16 mb-12 border-y border-[var(--border)] py-12 px-2">
   <div className="max-w-4xl mx-auto">
     {/* 리포트 헤더 */}
     <div className="flex items-baseline justify-between mb-10 border-b border-[var(--border)] pb-6">
       <div>
         <h2 className="text-[24px] font-bold text-foreground tracking-tight mb-1">Strategic Intelligence Report</h2>
         <p className="text-[14px] text-[var(--muted-foreground)] font-medium">AI 기반 종합 전략 분석 요약</p>
       </div>
       <div className="text-right">
         <p className="text-[11px] font-bold text-[var(--subtle-foreground)] uppercase tracking-widest">Confidence Index</p>
         <p className="text-[18px] font-bold text-primary">98.4% Verified</p>
       </div>
     </div>

     {/* 리포트 본문 - 글에 집중 */}
     <div className="relative">
       <div className="absolute -left-6 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
       <p className="text-[20px] font-medium leading-[1.8] text-foreground tracking-tight text-justify">
         "Galaxy S26의 초기 시장 진입은 30대 헤비 유저 그룹의 압도적인 호응을 바탕으로 매우 긍정적일 것으로 예측됩니다. 
         특히 <span className="text-primary font-bold">AI 화질 보정 알고리즘</span>에 대한 높은 신뢰도는 경쟁사 대비 강력한 차별화 요소로 작동하고 있습니다. 
         하반기에는 가격 탄력성이 높은 보급형 시장을 위한 전략적 금융 프로모션이 선행되어야 하며, 이를 통해 초기 프리미엄 이미지를 볼륨 세그먼트로 전이시키는 과정이 필요합니다."
       </p>
     </div>

     {/* 리포트 푸터 / 메타 정보 */}
     <div className="mt-12 flex items-center gap-8 text-[12px] text-[var(--subtle-foreground)] font-medium border-t border-[var(--border)] pt-6">
       <div className="flex items-center gap-2">
         <span className="w-1.5 h-1.5 rounded-full bg-[var(--border)]" />
         <span>표본 규모: 30,000건 실데이터</span>
       </div>
       <div className="flex items-center gap-2">
         <span className="w-1.5 h-1.5 rounded-full bg-[var(--border)]" />
         <span>분석 모델: 페르소나 디지털 트윈 시뮬레이션</span>
       </div>
       <div className="ml-auto italic opacity-60">
         Generated by AI Strategic Engine · 2025 Q4 Analysis
       </div>
     </div>
   </div>
 </div>

 </section>

 {/* SECTION 02: 핵심 인사이트 */}
        <section id="findings" ref={sectionRefs.findings} className="app-card p-12 relative overflow-hidden">
          <SectionHeader num="02" title="전략적 핵심 인사이트" badge="Key Findings & Decisions" />
          <div className="grid grid-cols-1 gap-6">
            {FINDINGS.map(f => {
              const isRisk = !f.isPositive;
              return (
                <div key={f.rank} className={`rounded-3xl border transition-all duration-300 group overflow-hidden ${isRisk ? "border-red-200 bg-red-50/30 hover:border-red-300" : "border-[var(--border)] bg-[var(--panel-soft)]/40 hover:border-primary/30"}`}>
                  {/* 카드 헤더 */}
                  <div className={`flex items-center gap-6 px-10 py-6 border-b ${isRisk ? "border-red-100 bg-red-50/50" : "border-[var(--border)] bg-card"}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[18px] font-black shrink-0 shadow-[var(--shadow-sm)] transition-all duration-300 group-hover:scale-110 ${isRisk ? "bg-red-100 text-red-500" : "bg-[var(--primary-light-bg)] text-primary border border-[var(--primary-light-border)]"}`}>
                      #{f.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${isRisk ? "bg-red-100 text-red-500" : "bg-[var(--primary-light-bg)] text-primary border border-[var(--primary-light-border)]"}`}>{f.tag}</span>
                        <span className="text-[11px] font-black text-[var(--subtle-foreground)] uppercase tracking-widest">{f.label}</span>
                      </div>
                      <h4 className="text-[20px] font-black text-foreground tracking-tight truncate">{f.value}</h4>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-[26px] font-black leading-none ${isRisk ? "text-red-500" : "text-primary"}`}>{f.delta}</p>
                      <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mt-1">Impact Score</p>
                    </div>
                  </div>

                  {/* 카드 바디 */}
                  <div className="grid grid-cols-[1fr_320px] divide-x divide-[var(--border)]">
                    {/* 좌측: 요약 + 근거 수치 */}
                    <div className="p-8 space-y-6">
                      <p className="text-[14px] text-[var(--secondary-foreground)] font-semibold leading-relaxed">{f.desc}</p>
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.18em]">근거 데이터</p>
                        {f.evidence.map((ev, i) => (
                          <div key={i} className="flex items-center justify-between py-2.5 border-b border-[var(--border)]/50 last:border-0">
                            <span className="text-[13px] font-semibold text-[var(--secondary-foreground)]">{ev.label}</span>
                            <span className={`text-[14px] font-black tabular-nums ${isRisk ? "text-red-500" : "text-primary"}`}>{ev.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 우측: 전략 액션 */}
                    <div className={`p-8 flex flex-col gap-4 ${isRisk ? "bg-red-50/40" : "bg-[var(--primary-light-bg)]/20"}`}>
                      <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${isRisk ? "text-red-400" : "text-primary"}`}>전략적 권장 액션</p>
                      <p className="text-[14px] font-bold text-foreground leading-[1.75] flex-1">{f.action}</p>
                      <div className={`flex items-center gap-2 text-[12px] font-black ${isRisk ? "text-red-400" : "text-primary"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isRisk ? "bg-red-400" : "bg-primary"} animate-pulse`} />
                        즉시 실행 권장
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
 <div className="app-soft p-10 bg-primary text-white border-none shadow-[var(--shadow-[var(--shadow-lg)])] flex flex-col justify-center relative overflow-hidden">
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

 {/* SECTION 04: 세그먼트 그룹별 심층 분석 및 권장 액션 */}
 <section id="segment" ref={sectionRefs.segment} className="app-card p-12">
   <SectionHeader num="04" title="세그먼트 그룹별 분석 및 권장 액션" badge="Segmented Action Strategy" />

   <div className="grid grid-cols-1 gap-6">
     {[
       {
         group: "MZ 얼리어답터",
         tag: "High Growth",
         stat: "구매 의향 84%",
         response: "AI 생성형 편집 기능에 대한 유료 결제 의사 62%로 가장 높음",
         action: "구독형 AI 프리미엄 서비스 번들링 오퍼 제안 및 SNS 숏폼 챌린지 연계 마케팅 집행",
         color: "var(--tag-pink)"
       },
       {
         group: "프리미엄 바이어",
         tag: "Stable Retention",
         stat: "브랜드 충성도 92%",
         response: "기존 갤럭시 생태계(Watch, Buds) 연동성에 대한 만족도가 구매 결정의 1순위",
         action: "기존 플래그십 유저 대상 독점적 보상 판매 프로그램 및 프리미엄 케어 서비스 강화",
         color: "var(--tag-amber)"
       },
       {
         group: "실용 중시 가족형",
         tag: "Price Sensitive",
         stat: "가격 민감도 78%",
         response: "AI 기능 자체는 긍정적이나, 기기 가격 상승 시 기변 포기 의향이 타 그룹 대비 2.4배 높음",
         action: "장기 할부 금융 프로그램 및 가족 결합 혜택 강조를 통한 심리적 가격 장벽 완화",
         color: "var(--tag-green)"
       }
     ].map((item, i) => (
       <div key={i} className="group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-card transition-all hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-md)]">
         <div className="flex flex-col md:flex-row">
           {/* 좌측: 세그먼트 정보 */}
           <div className="w-full md:w-72 bg-[var(--panel-soft)] p-8 border-r border-[var(--border)]">
             <div className="flex items-center gap-2 mb-4">
               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
               <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">{item.tag}</span>
             </div>
             <h5 className="text-[20px] font-bold text-foreground mb-2">{item.group}</h5>
             <p className="text-[16px] font-bold text-primary">{item.stat}</p>
           </div>

           {/* 우측: 분석 및 액션 */}
           <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div>
               <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--subtle-foreground)] mb-3">핵심 응답 데이터 분석</p>
               <p className="text-[14px] font-semibold text-[var(--secondary-foreground)] leading-relaxed">
                 "{item.response}"
               </p>
             </div>
             <div className="bg-[var(--primary-light-bg)]/30 rounded-2xl p-6 border border-[var(--primary-light-border)]/50">
               <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-3">전략적 권장 액션</p>
               <p className="text-[14px] font-bold text-foreground leading-relaxed">
                 {item.action}
               </p>
             </div>
           </div>
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
