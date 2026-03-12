import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  ArrowUpRight,
  Download,
  RotateCcw,
  Share2,
  ChevronDown,
  Activity,
  Target,
  TrendingUp,
  Users,
  Sparkles,
  Info,
  BarChart2,
  Zap
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/* ─── Mock Data ─── */
const RADAR_DATA = [
  { subject: "성능", Gamer: 85, General: 65 },
  { subject: "배터리", Gamer: 70, General: 75 },
  { subject: "카메라", Gamer: 80, General: 72 },
  { subject: "AI", Gamer: 60, General: 68 },
  { subject: "가격", Gamer: 50, General: 70 },
];

const BAR_DATA = [
  { name: "20대", Gamer: 72, General: 45 },
  { name: "30대", Gamer: 88, General: 58 },
  { name: "40대", Gamer: 55, General: 62 },
  { name: "50대", Gamer: 30, General: 70 },
];

const LINE_DATA = [
  { week: "W1", intent: 52 },
  { week: "W2", intent: 61 },
  { week: "W3", intent: 58 },
  { week: "W4", intent: 74 },
  { week: "W5", intent: 71 },
  { week: "W6", intent: 83 },
];

const FINDINGS = [
  {
    rank: 1,
    label: "최고 전환 세그먼트",
    value: "30대 Gamer",
    delta: "+23%",
    desc: "전체 평균 대비 구매 의향 상승폭이 가장 큽니다.",
    detail: "30대 Gamer 세그먼트는 카메라 기대감과 구매 전환 준비도가 모두 가장 높습니다. 특히 야간 촬영 보정 기능이 주된 구매 동인으로 확인됩니다.",
  },
  {
    rank: 2,
    label: "카메라 우선 구매 요인",
    value: "64.2%",
    delta: "+11%",
    desc: "성능 매력보다 카메라 결과 중요도가 더 높습니다.",
    detail: "순수 AP 성능보다 실생활에서의 '결과물' 체감도가 더 높게 평가되었습니다. 메시지는 스펙보다는 결과물 위주로 구성해야 합니다.",
  },
  {
    rank: 3,
    label: "가격 리스크 세그먼트",
    value: "50대 General",
    delta: "-8%",
    desc: "가격 민감도가 구매 의향 격차를 만드는 핵심 요인입니다.",
    detail: "고연령층에서는 AI 기능에 대한 기대감보다 출고가에 대한 저항이 더 큽니다. 보상 판매 및 장기 할부 프로그램 강조가 필수적입니다.",
  },
];

const Q_DATA = [
  { 
    id: "Q1",
    q: "Galaxy S25 AI 카메라 기능의 인지도", 
    options: [{ label: "매우 높음", pct: 45 }, { label: "보통", pct: 30 }, { label: "낮음", pct: 25 }],
    stats: "신뢰 수준 95%에서 오차 범위 ±2.8%p 기록. Early Adopter 그룹의 인지도는 전체 평균 대비 1.4배 높게 나타나 전략적 타겟팅이 유효함을 입증함.",
    insight: "기능 설명 단계에서 사용 장면 중심으로 커뮤니케이션 전환 필요."
  },
  { 
    id: "Q2",
    q: "현재 스마트폰 카메라 경험 만족도", 
    options: [{ label: "만족", pct: 63 }, { label: "보통", pct: 22 }, { label: "불만족", pct: 15 }],
    stats: "불만족 그룹의 82%가 '야간 촬영 품질'을 주 원인으로 꼽음. 이는 S25의 주요 소구 포인트인 Nightography와의 높은 정합성을 시사함.",
    insight: "야간 촬영 비포/애프터 비교 자산을 활용한 교체 수요 자극 권장."
  },
  { 
    id: "Q3",
    q: "AI 기능이 구매 결정에 미치는 영향", 
    options: [{ label: "매우 큼", pct: 52 }, { label: "큼", pct: 28 }, { label: "보통", pct: 20 }],
    stats: "회귀 분석 결과, AI 유용성 인지도가 1단위 증가할 때 구매 의향은 0.64만큼 상승함. 통계적으로 매우 유의미한 양(+)의 상관관계 확인.",
    insight: "AI 기능의 실생활 효용성을 강조하는 '생활 밀착형' 시나리오 마케팅 주력."
  },
];

const SECTIONS = [
  { id: "summary", label: "종합 요약", icon: "01" },
  { id: "findings", label: "핵심 인사이트", icon: "02" },
  { id: "detail", label: "문항 상세 분석", icon: "03" },
  { id: "segment", label: "세그먼트 심층 비교", icon: "04" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

/* ─── Components ─── */
function KpiCard({ icon, label, value, delta, sub }: { icon: React.ReactNode; label: string; value: string; delta?: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-slate-50 text-[#316BFF] border border-slate-100 flex items-center justify-center shadow-sm">
          {icon}
        </div>
        {delta && (
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-black border ${delta.startsWith("+") ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-500 border-red-100"}`}>
            {delta}
          </span>
        )}
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-[24px] font-black text-slate-900 leading-none">{value}</p>
        {sub && <p className="mt-2 text-[11px] text-slate-400 font-medium italic">{sub}</p>}
      </div>
    </div>
  );
}

function SectionHeader({ num, title, badge }: { num: string; title: string; badge?: string }) {
  return (
    <div className="mb-8 flex items-center gap-4 border-b border-slate-50 pb-6">
      <div className="w-8 h-8 rounded-xl bg-[#316BFF] text-white flex items-center justify-center text-[11px] font-black shadow-lg shadow-blue-100">{num}</div>
      <h2 className="text-[20px] font-black text-slate-900 tracking-tight">{title}</h2>
      {badge && <span className="ml-auto bg-slate-50 border border-slate-100 text-slate-400 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider">{badge}</span>}
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
    <div className="flex h-full w-full flex-col bg-[#F8FAFC] overflow-hidden">
      {/* Welcome Header */}
      <div className="px-10 py-8 shrink-0">
        <section className="rounded-2xl border border-border/90 bg-card p-8 shadow-elevated relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-all duration-1000" />
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Management System</p>
            <h1 className="mt-2 font-title text-3xl font-bold leading-tight text-slate-900 md:text-4xl tracking-tight">
              분석 결과 <span className="text-primary">최종 리포트.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-base font-medium text-slate-500">
              수집된 가상 페르소나 데이터 30,000건을 기반으로 한 전략 인사이트 보고서입니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="flex items-center gap-2.5 px-6 py-3 rounded-xl border border-slate-200 bg-white text-[13px] font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                <RotateCcw size={18} />재분석 실행
              </button>
              <div className="relative" ref={downloadRef}>
                <button onClick={() => setDownloadOpen(!downloadOpen)} className="flex items-center gap-3 px-8 py-3 rounded-xl bg-[#316BFF] text-white text-[14px] font-black hover:bg-[#1E46A8] shadow-xl shadow-blue-100 transition-all active:scale-95">
                  <Download size={18} />다운로드<ChevronDown size={16} className={`transition-transform ${downloadOpen ? "rotate-180" : ""}`} />
                </button>
                {downloadOpen && (
                  <div className="absolute right-0 top-full mt-3 z-50 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl p-1.5 animate-in fade-in slide-in-from-top-2">
                    <button className="w-full text-left px-4 py-3 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-all">Download as PDF</button>
                    <button className="w-full text-left px-4 py-3 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-all">Download as DOCX</button>
                    <button className="w-full text-left px-4 py-3 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-all">Download as PPTX</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="flex-1 overflow-y-auto px-10 pb-10 hide-scrollbar scroll-smooth">
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
          {/* KPI Summary */}
          <div className="grid grid-cols-4 gap-6">
            <KpiCard icon={<Users size={20} />} label="Total Sample" value="30,000" sub="성별/연령 비례 할당" delta="+4%" />
            <KpiCard icon={<Target size={20} />} label="Purchase Intent" value="68.7%" sub="Intent Index" delta="+12%" />
            <KpiCard icon={<Activity size={20} />} label="Data Reliability" value="98.4%" sub="Alpha: 0.82" />
            <KpiCard icon={<Zap size={20} />} label="Key Action Items" value="03" sub="Prioritized" />
          </div>

          <div className="grid grid-cols-[260px_1fr] gap-10 items-start">
            {/* ─── Sticky Section Nav ─── */}
            <aside className="sticky top-0 z-20 space-y-1 bg-white border border-slate-100 rounded-3xl p-4 shadow-xl shadow-slate-200/50">
              <p className="px-4 py-2 text-[11px] font-black uppercase text-slate-300 tracking-widest mb-2 border-b border-slate-50">Navigation</p>
              {SECTIONS.map(s => (
                <button key={s.id} onClick={() => scrollToSection(s.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative ${activeSection === s.id ? "bg-[#EDF3FF] text-[#2454C8] font-black" : "text-slate-400 hover:bg-slate-50"}`}>
                  {activeSection === s.id && <div className="absolute left-0 top-1/4 h-1/2 w-1 rounded-r-full bg-[#2454C8]" />}
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all ${activeSection === s.id ? "bg-[#2454C8] text-white border-[#2454C8]" : "bg-slate-50 border-slate-100 opacity-60"}`}>{s.icon}</span>
                  <span className="text-[13px] tracking-tight">{s.label}</span>
                </button>
              ))}
            </aside>

            {/* ─── Content Area ─── */}
            <div className="space-y-12">
              {/* SECTION 01: 종합 요약 */}
              <section id="summary" ref={sectionRefs.summary} className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-100/50 transition-all duration-1000" />
                <SectionHeader num="01" title="종합 분석 요약" badge="Executive Summary" />
                <div className="grid grid-cols-2 gap-12 relative z-10">
                  <div className="space-y-6">
                    <p className="text-[13px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary" />선호 프로파일 분석</p>
                    <div className="h-[260px] bg-slate-50/50 rounded-3xl p-4 border border-white shadow-inner"><ResponsiveContainer width="100%" height="100%"><RadarChart data={RADAR_DATA}><PolarGrid stroke="#E2E8F0" /><PolarAngleAxis dataKey="subject" tick={{fontSize: 11, fontWeight: 700, fill: "#64748B"}} /><Radar name="Gamer" dataKey="Gamer" stroke="#316BFF" fill="#316BFF" fillOpacity={0.15} strokeWidth={3} /><Radar name="General" dataKey="General" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.05} strokeWidth={1.5} /></RadarChart></ResponsiveContainer></div>
                  </div>
                  <div className="space-y-6">
                    <p className="text-[13px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary" />구매 의향 추이</p>
                    <div className="h-[260px] bg-slate-50/50 rounded-3xl p-4 border border-white shadow-inner"><ResponsiveContainer width="100%" height="100%"><LineChart data={LINE_DATA}><CartesianGrid stroke="#E2E8F0" vertical={false} strokeDasharray="3 3" /><XAxis dataKey="week" hide /><Line type="monotone" dataKey="intent" stroke="#316BFF" strokeWidth={4} dot={{r: 6, fill: "#316BFF", strokeWidth: 2, stroke: "#fff"}} /></LineChart></ResponsiveContainer></div>
                  </div>
                </div>
                <div className="mt-12 bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20"><div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" /><p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-4">Strategic Insight</p><p className="text-[16px] font-bold leading-relaxed opacity-90 italic">"30대 고관여 게이머 그룹의 압도적인 긍정 신호는 S25 시리즈의 성공적인 런칭을 암시합니다. 하반기에는 가격 저항선이 높은 고연령 General 세그먼트를 위한 맞춤형 금융 혜택 설계가 필요합니다."</p></div>
              </section>

              {/* SECTION 02: 핵심 인사이트 */}
              <section id="findings" ref={sectionRefs.findings} className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-xl"><SectionHeader num="02" title="핵심 인사이트 분석" badge="Deep Dive" /><div className="grid grid-cols-1 gap-6">{FINDINGS.map(f => (<div key={f.rank} className="bg-slate-50/50 rounded-[28px] border border-slate-100 p-8 hover:bg-white hover:shadow-xl transition-all group"><div className="flex items-center gap-8 mb-6"><div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[20px] font-black text-primary shadow-sm group-hover:scale-105 transition-all">#{f.rank}</div><div className="flex-1"><p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.label}</p><h4 className="text-[20px] font-black text-slate-900 tracking-tight">{f.value}</h4></div><div className="text-right"><span className="text-[18px] font-black text-green-500">{f.delta}</span><p className="text-[10px] font-black text-slate-300 uppercase mt-1">YoY Index</p></div></div><div className="bg-white/80 rounded-2xl p-6 border border-slate-50 italic"><p className="text-[14px] text-slate-600 font-bold leading-relaxed opacity-90">"{f.detail}"</p></div></div>))}</div></section>

              {/* SECTION 03: 문항 상세 분석 */}
              <section id="detail" ref={sectionRefs.detail} className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-xl"><SectionHeader num="03" title="문항별 통계 분석" badge="Statistical Evidence" /><div className="space-y-10">{Q_DATA.map(q => (<div key={q.id} className="bg-[#F8FAFC] rounded-[32px] border border-slate-100 p-8 group"><div className="flex items-start gap-8 mb-8"><div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary font-black text-[14px] border border-slate-100 group-hover:bg-primary group-hover:text-white transition-all">{q.id}</div><div className="flex-1"><h4 className="text-[18px] font-black text-slate-800 leading-tight mb-2">{q.q}</h4><p className="text-[13px] text-[#2454C8] font-black flex items-center gap-2"><Sparkles size={14} />{q.insight}</p></div></div><div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10"><div className="space-y-5">{q.options.map(o => (<div key={o.label}><div className="flex justify-between mb-2"><span className="text-[12px] font-bold text-slate-500">{o.label}</span><span className="text-[12px] font-black text-primary">{o.pct}%</span></div><div className="h-2 bg-white rounded-full overflow-hidden shadow-inner border border-slate-50"><div className="h-full bg-primary/80 transition-all duration-1000" style={{width:`${o.pct}%`}} /></div></div>))}</div><div className="bg-white/60 border border-slate-100 rounded-2xl p-6 shadow-inner"><div className="flex items-center gap-2 text-slate-400 mb-3"><Info size={14} /><span className="text-[10px] font-black uppercase tracking-widest">Statistical Analysis</span></div><p className="text-[12px] text-slate-500 font-bold leading-relaxed">{q.stats}</p></div></div></div>))}</div></section>

              {/* SECTION 04: 세그먼트 비교 */}
              <section id="segment" ref={sectionRefs.segment} className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-xl"><SectionHeader num="04" title="세그먼트 기회 지수" badge="Opportunity Matrix" /><div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-center"><div className="h-[340px] bg-slate-50/50 rounded-3xl p-8 border border-white shadow-inner"><ResponsiveContainer width="100%" height="100%"><BarChart data={BAR_DATA} margin={{top:20, right:30, left:20, bottom:5}}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:12, fontWeight:700}} /><YAxis axisLine={false} tickLine={false} tick={{fontSize:11}} /><Bar dataKey="Gamer" fill="#316BFF" radius={[6, 6, 0, 0]} barSize={32} /><Bar dataKey="General" fill="#CBD5E1" radius={[6, 6, 0, 0]} barSize={32} /></BarChart></ResponsiveContainer></div><div className="space-y-4"><div className="p-6 bg-blue-50 border border-blue-100 rounded-[24px] shadow-sm"><p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Target size={14} />Opportunity Group</p><p className="text-[14px] font-black text-slate-800 leading-tight">30대 Gamer 세그먼트</p><p className="text-[12px] text-slate-500 font-bold mt-2 leading-relaxed italic">"가장 높은 AI 기술 수용도와 기기 교체 의향을 동시에 보유한 고가치 타겟군으로 식별됨."</p></div><div className="p-6 bg-slate-50 border border-slate-100 rounded-[24px] shadow-inner"><p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><BarChart2 size={14} />Growth Index</p><p className="text-[20px] font-black text-slate-900 tracking-tighter">+142.5 <span className="text-[12px] text-slate-400 font-bold ml-1">pts</span></p></div></div></div></section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
