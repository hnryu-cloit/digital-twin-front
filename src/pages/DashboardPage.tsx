import type React from "react";
import { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
} from "recharts";
import {
  Users, Smartphone, Tag, RefreshCw,
  ChevronDown, ChevronUp, BarChart2,
  MapPin, ShoppingBag, TrendingUp, TrendingDown, Minus,
  SlidersHorizontal, Clock,
} from "lucide-react";
import { WorkflowStepper } from "@/components/layout/WorkflowStepper";

/* ─── 도넛 차트 데이터 ─── */
const donutData = [
  { name: "MZ 얼리어답터", value: 31 },
  { name: "프리미엄 바이어", value: 28 },
  { name: "패밀리 유저", value: 19 },
  { name: "게이머", value: 14 },
  { name: "비즈니스", value: 8 },
];
const DONUT_COLORS = ["#316BFF", "#4F83FF", "#7DA1FF", "#A9C0FF", "#D4DFFF"];

const CUSTOM_LABEL = ({ cx, cy }: { cx: number; cy: number }) => (
  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
    <tspan x={cx} dy="-0.6em" className="text-[11px] fill-muted-foreground font-bold">총 N수</tspan>
    <tspan x={cx} dy="1.5em" className="text-[16px] fill-foreground font-black">30,000</tspan>
  </text>
);

/* ─── 제품군별 분포 차트 ─── */
const productData = [
  { name: "S25 Ultra", value: 26 },
  { name: "S25+", value: 18 },
  { name: "S25", value: 22 },
  { name: "Z Fold6", value: 11 },
  { name: "Z Flip6", value: 13 },
  { name: "A55", value: 6 },
  { name: "기타", value: 4 },
];
const BAR_COLORS = ["#316BFF", "#4F83FF", "#7DA1FF", "#A9C0FF", "#D4DFFF", "#E2E8F0", "#F1F5F9"];

/* ─── 세그먼트 지표 데이터 ─── */
interface SegmentMetric {
  label: string;
  value: number;
  count: number;
  color: string;
  trend: "up" | "down" | "flat";
  trendVal: string;
  sub: string;
}

const SEGMENT_METRICS: SegmentMetric[] = [
  { label: "MZ 얼리어답터", value: 31, count: 9300, color: "#316BFF", trend: "up", trendVal: "+4.2%p", sub: "20~34세 · 출시 즉시 구매 의향 72%" },
  { label: "프리미엄 바이어", value: 28, count: 8400, color: "#4F83FF", trend: "up", trendVal: "+1.8%p", sub: "35~49세 · S Ultra/Fold 선호 · 고가 모델 집중" },
  { label: "패밀리 유저", value: 19, count: 5700, color: "#7DA1FF", trend: "flat", trendVal: "0%p", sub: "30~50세 · 통신사 구매 비중 81% · AS 중시" },
  { label: "게이머", value: 14, count: 4200, color: "#A9C0FF", trend: "down", trendVal: "-1.1%p", sub: "18~30세 · 120Hz·발열 관심 높음 · Z Flip 선호" },
  { label: "비즈니스 유저", value: 8, count: 2400, color: "#D4DFFF", trend: "flat", trendVal: "0%p", sub: "40~55세 · 보안·DeX 기능 중시 · 자급제 비중 높음" },
];

/* ─── 구매 채널 데이터 ─── */
const CHANNEL_DATA = [
  { label: "통신사 대리점", value: 44, color: "#316BFF" },
  { label: "삼성 공식몰", value: 27, color: "#4F83FF" },
  { label: "자급제 (온라인)", value: 18, color: "#7DA1FF" },
  { label: "오프라인 유통", value: 11, color: "#A9C0FF" },
];

/* ─── 지역 데이터 ─── */
const REGION_DATA = [
  { label: "수도권", value: 48, color: "#316BFF" },
  { label: "경상권", value: 21, color: "#4F83FF" },
  { label: "전라권", value: 12, color: "#7DA1FF" },
  { label: "충청권", value: 10, color: "#A9C0FF" },
  { label: "기타", value: 9, color: "#D4DFFF" },
];

/* ─── 체크박스 공통 컴포넌트 ─── */
function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      className={`w-4 h-4 rounded flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
        checked ? "bg-primary border-primary shadow-sm" : "border-border bg-card hover:border-primary/50"
      }`}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

/* ─── 섹션 헤더 ─── */
interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  open: boolean;
  onToggle: () => void;
  count?: number;
}

function SectionHeader({ icon, title, open, onToggle, count }: SectionHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors rounded-xl group"
    >
      <div className="flex items-center gap-2.5">
        <span className="text-slate-400 group-hover:text-primary transition-colors">{icon}</span>
        <span className="text-[13px] font-bold text-slate-700">{title}</span>
        {count !== undefined && count > 0 && (
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-black">{count}</span>
        )}
      </div>
      {open ? <ChevronUp size={14} className="text-slate-300" /> : <ChevronDown size={14} className="text-slate-300" />}
    </button>
  );
}

/* ─── 트렌드 아이콘 ─── */
function TrendBadge({ trend, val }: { trend: "up" | "down" | "flat"; val: string }) {
  if (trend === "up") return (
    <span className="flex items-center gap-0.5 text-success text-[11px] font-black">
      <TrendingUp size={11} />{val}
    </span>
  );
  if (trend === "down") return (
    <span className="flex items-center gap-0.5 text-destructive text-[11px] font-black">
      <TrendingDown size={11} />{val}
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-slate-400 text-[11px] font-black">
      <Minus size={11} />{val}
    </span>
  );
}

/* ─── 메인 컴포넌트 ─── */
export const DashboardPage: React.FC = () => {
  const [openSections, setOpenSections] = useState({
    demographic: true,
    gender: true,
    product: true,
    segment: true,
    channel: false,
    region: false,
    appHistory: false,
  });

  const toggle = (key: keyof typeof openSections) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  /* 인구통계 */
  const [ageRange] = useState([25, 49]);

  /* 성별 */
  const [gender, setGender] = useState({ male: true, female: true });

  /* 제품군 */
  const [products, setProducts] = useState({
    s25ultra: true, s25plus: true, s25: true,
    zfold6: false, zflip6: true, a55: false,
  });

  /* 세그먼트 */
  const [segments, setSegments] = useState({
    mz: true, premium: true, family: false, gamer: true, business: false,
  });

  /* 구매 채널 */
  const [channels, setChannels] = useState({
    carrier: true, official: true, unlocked: false, offline: false,
  });

  /* 지역 */
  const [regions, setRegions] = useState({
    metro: true, gyeong: false, jeon: false, chung: false, other: false,
  });

  /* 앱 사용 이력 */
  const [apps, setApps] = useState({
    game: true, social: true, shopping: false, finance: false, health: false,
  });

  const productCount = Object.values(products).filter(Boolean).length;
  const segmentCount = Object.values(segments).filter(Boolean).length;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#F8FAFC]">
      <WorkflowStepper currentPath="/analytics" />
      
      <div className="flex flex-1 overflow-hidden">
        {/* ── 필터 사이드바 ── */}
        <aside className="w-72 shrink-0 flex flex-col border-r border-border bg-white shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-50">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-primary" />
              <p className="text-[13px] text-foreground font-black uppercase tracking-widest">Filter Settings</p>
            </div>
            <button className="text-[11px] text-primary font-black hover:underline uppercase tracking-tighter">Reset</button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-4 hide-scrollbar">
            <div className="flex flex-col gap-1">

              {/* 인구통계 - 연령 */}
              <div className="rounded-2xl overflow-hidden bg-white">
                <SectionHeader icon={<Users size={15} />} title="연령 범위" open={openSections.demographic} onToggle={() => toggle("demographic")} />
                {openSections.demographic && (
                  <div className="px-5 pb-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] text-slate-400 font-bold uppercase">Age Range</span>
                      <span className="bg-primary text-white px-3 py-0.5 rounded-full text-[11px] font-black shadow-md shadow-blue-100">
                        {ageRange[0]}~{ageRange[1]}세
                      </span>
                    </div>
                    <div className="relative h-6 flex items-center mb-2 px-1">
                      <div className="w-full h-1.5 bg-slate-100 rounded-full" />
                      <div className="absolute h-1.5 bg-primary rounded-full" style={{ left: "12%", right: "28%" }} />
                      <div className="absolute w-4 h-4 bg-white border-2 border-primary rounded-full shadow-lg cursor-pointer" style={{ left: "calc(12% - 8px)" }} />
                      <div className="absolute w-4 h-4 bg-primary rounded-full shadow-lg shadow-blue-200 cursor-pointer" style={{ left: "calc(72% - 8px)" }} />
                    </div>
                    <div className="flex justify-between px-1">
                      <span className="text-[10px] text-slate-300 font-black tracking-tighter uppercase">Min 18</span>
                      <span className="text-[10px] text-slate-300 font-black tracking-tighter uppercase">Max 65</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 성별 */}
              <div className="rounded-2xl overflow-hidden">
                <SectionHeader icon={<Users size={15} />} title="성별 분포" open={openSections.gender} onToggle={() => toggle("gender")} />
                {openSections.gender && (
                  <div className="px-5 pb-4 flex gap-2">
                    {([
                      { key: "male", label: "남성", pct: "58%" },
                      { key: "female", label: "여성", pct: "42%" },
                    ] as { key: keyof typeof gender; label: string; pct: string }[]).map((g) => (
                      <button key={g.key}
                        onClick={() => setGender((p) => ({ ...p, [g.key]: !p[g.key] }))}
                        className={`flex-1 py-3 rounded-2xl border transition-all flex flex-col items-center gap-1 shadow-sm ${gender[g.key] ? "border-primary bg-primary-light-bg text-primary" : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"}`}>
                        <span className={`text-[13px] font-black ${gender[g.key] ? "text-primary" : "text-slate-500"}`}>{g.label}</span>
                        <span className={`text-[11px] font-bold ${gender[g.key] ? "text-primary opacity-70" : "text-slate-300"}`}>{g.pct}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 삼성 제품군 */}
              <div className="rounded-2xl overflow-hidden">
                <SectionHeader icon={<Smartphone size={15} />} title="Galaxy 제품군" open={openSections.product} onToggle={() => toggle("product")} count={productCount} />
                {openSections.product && (
                  <div className="px-5 pb-4 flex flex-col gap-2.5">
                    <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest border-b border-slate-50 pb-1 mb-1">S-Series</p>
                    {([
                      { key: "s25ultra", label: "Galaxy S25 Ultra", pct: 26 },
                      { key: "s25plus", label: "Galaxy S25+", pct: 18 },
                      { key: "s25", label: "Galaxy S25", pct: 22 },
                    ] as { key: keyof typeof products; label: string; pct: number }[]).map((d) => (
                      <label key={d.key} className="flex items-center gap-3 cursor-pointer group">
                        <Checkbox checked={products[d.key]} onChange={() => setProducts((p) => ({ ...p, [d.key]: !p[d.key] }))} />
                        <span className={`text-[12px] font-bold flex-1 transition-colors ${products[d.key] ? "text-slate-700" : "text-slate-400 group-hover:text-slate-600"}`}>{d.label}</span>
                        <span className="text-[11px] text-slate-300 font-black">{d.pct}%</span>
                      </label>
                    ))}
                    <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest border-b border-slate-50 pb-1 mt-3 mb-1">Z-Series</p>
                    {([
                      { key: "zfold6", label: "Galaxy Z Fold6", pct: 11 },
                      { key: "zflip6", label: "Galaxy Z Flip6", pct: 13 },
                    ] as { key: keyof typeof products; label: string; pct: number }[]).map((d) => (
                      <label key={d.key} className="flex items-center gap-3 cursor-pointer group">
                        <Checkbox checked={products[d.key]} onChange={() => setProducts((p) => ({ ...p, [d.key]: !p[d.key] }))} />
                        <span className={`text-[12px] font-bold flex-1 transition-colors ${products[d.key] ? "text-slate-700" : "text-slate-400 group-hover:text-slate-600"}`}>{d.label}</span>
                        <span className="text-[11px] text-slate-300 font-black">{d.pct}%</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 세그먼트 */}
              <div className="rounded-2xl overflow-hidden">
                <SectionHeader icon={<Tag size={15} />} title="사용자 세그먼트" open={openSections.segment} onToggle={() => toggle("segment")} count={segmentCount} />
                {openSections.segment && (
                  <div className="px-5 pb-4 flex flex-col gap-2">
                    {([
                      { key: "mz", label: "MZ 얼리어답터", color: "#316BFF" },
                      { key: "premium", label: "프리미엄 바이어", color: "#4F83FF" },
                      { key: "family", label: "패밀리 유저", color: "#7DA1FF" },
                      { key: "gamer", label: "게이머", color: "#A9C0FF" },
                      { key: "business", label: "비즈니스 유저", color: "#D4DFFF" },
                    ] as { key: keyof typeof segments; label: string; color: string }[]).map((s) => (
                      <label
                        key={s.key}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition-all shadow-sm ${
                          segments[s.key] ? "border-primary bg-primary-light-bg/30" : "border-slate-100 bg-white hover:border-slate-200"
                        }`}
                      >
                        <Checkbox checked={segments[s.key]} onChange={() => setSegments((p) => ({ ...p, [s.key]: !p[s.key] }))} />
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm" style={{ backgroundColor: s.color, opacity: segments[s.key] ? 1 : 0.3 }} />
                          <span
                            className={`text-[12px] truncate transition-colors ${
                              segments[s.key] ? "font-black text-primary" : "font-bold text-slate-400"
                            }`}
                          >
                            {s.label}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-border bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
            <button className="w-full bg-primary text-white rounded-2xl py-3.5 flex items-center justify-center gap-2 shadow-xl shadow-blue-200 hover:bg-primary-hover transition-all active:scale-[0.98]">
              <RefreshCw size={15} />
              <span className="text-[14px] font-black uppercase tracking-tight">Apply Filters</span>
            </button>
          </div>
        </aside>

        {/* ── 메인 콘텐츠 ── */}
        <main className="flex-1 overflow-y-auto px-10 py-8 hide-scrollbar space-y-8">
          {/* Welcome Header */}
          <section className="rounded-2xl border border-border/90 bg-card p-8 shadow-elevated relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-all duration-1000" />
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Management System</p>
              <h1 className="mt-2 font-title text-3xl font-bold leading-tight text-slate-900 md:text-4xl tracking-tight">
                세그먼트 설정 및 <span className="text-primary">분포 현황.</span>
              </h1>
              <p className="mt-3 max-w-2xl text-base font-medium text-slate-500">
                삼성전자 Galaxy 제품군 구매·사용자 30,000명 대상의 실시간 분석 데이터입니다.
              </p>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
            {/* N수 + 도넛 차트 */}
            <div className="app-card p-8 flex flex-col md:flex-row md:items-center gap-12 border-border/60 shadow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-all" />
              <div className="flex-1 relative z-10">
                <p className="text-[14px] text-slate-400 font-black uppercase tracking-widest mb-2">Total Participants</p>
                <div className="flex items-end gap-3 mb-6">
                  <span className="text-[56px] font-black text-foreground leading-none tracking-tighter">30,000</span>
                  <span className="text-[20px] text-slate-400 font-black pb-1.5 uppercase">Persons</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-[#F0F7FF] text-primary px-4 py-2 rounded-2xl border border-blue-100 shadow-sm">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-[13px] font-black uppercase tracking-tighter">Real-time Calculation</span>
                </div>
                <div className="mt-10 grid grid-cols-3 gap-2">
                  {[
                    { label: "평균 연령", value: "33.4세", icon: <Clock size={12} /> },
                    { label: "남성 비율", value: "58%", icon: <Users size={12} /> },
                    { label: "수도권 비중", value: "48%", icon: <MapPin size={12} /> },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100 hover:bg-white hover:shadow-md transition-all group/stat overflow-hidden">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-tight mb-1.5 flex items-center gap-1 whitespace-nowrap">{s.icon}{s.label}</p>
                      <p className="text-[17px] font-black text-slate-700 group-hover/stat:text-primary transition-colors">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-8 bg-slate-50/30 p-8 rounded-[32px] border border-white shadow-inner relative z-10">
                <div style={{ width: 200, height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={donutData} cx="50%" cy="50%" innerRadius={65} outerRadius={90}
                        startAngle={90} endAngle={-270} dataKey="value"
                        labelLine={false} label={CUSTOM_LABEL} strokeWidth={0}>
                        {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${v}%`, ""]}
                        contentStyle={{ borderRadius: 16, border: "none", fontSize: 13, fontWeight: 800, boxShadow: "var(--shadow-2xl)", padding: "12px 16px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-3">
                  {donutData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-3 group/item">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm group-hover/item:scale-125 transition-transform" style={{ backgroundColor: DONUT_COLORS[i] }} />
                      <div>
                        <p className="text-[11px] text-slate-400 font-bold leading-none mb-1">{d.name}</p>
                        <p className="text-[15px] font-black leading-none" style={{ color: DONUT_COLORS[i] }}>{d.value}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 구매 채널 분포 */}
            <div className="app-card p-8 border-border/60 shadow-md">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-xl bg-blue-50 text-primary border border-blue-100 shadow-sm">
                  <ShoppingBag size={18} />
                </div>
                <h3 className="text-[16px] font-black text-foreground uppercase tracking-tight">Channel Distribution</h3>
              </div>
              <div className="flex flex-col gap-6">
                {CHANNEL_DATA.map((c) => (
                  <div key={c.label} className="group">
                    <div className="flex justify-between mb-2.5">
                      <span className="text-[13px] text-slate-600 font-black group-hover:text-primary transition-colors">{c.label}</span>
                      <span className="text-[13px] font-black text-foreground">{c.value}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(49,107,255,0.2)]" style={{ width: `${c.value}%`, backgroundColor: c.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 세그먼트 지표 요약 */}
          <div className="app-card mb-8 p-8 border-border/60 shadow-md">
            <div className="flex items-center justify-between mb-10 border-b border-slate-50 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-primary border border-blue-100 shadow-sm">
                  <BarChart2 size={20} />
                </div>
                <h3 className="text-[18px] font-black text-foreground uppercase tracking-tight">Segment Summary</h3>
              </div>
              <div className="bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100 shadow-inner">
                <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest italic">vs Last Month Analysis</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {SEGMENT_METRICS.map((item) => (
                <div key={item.label} className="rounded-[24px] border border-border/50 p-6 hover:border-primary/30 hover:bg-slate-50/50 transition-all group flex items-center gap-10">
                  <div className="w-48 shrink-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-[15px] font-black text-slate-700 group-hover:text-primary transition-colors">{item.label}</span>
                    </div>
                    <TrendBadge trend={item.trend} val={item.trendVal} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-end mb-2.5">
                      <p className="text-[12px] text-slate-400 font-bold leading-relaxed max-w-sm">{item.sub}</p>
                      <div className="text-right">
                        <span className="text-[12px] text-slate-300 font-black mr-3">{item.count.toLocaleString()} N</span>
                        <span className="text-[24px] font-black tracking-tighter" style={{ color: item.color }}>{item.value}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* 제품군별 분포 */}
            <div className="app-card p-8 border-border/60 shadow-md">
              <div className="flex items-center gap-3 mb-10">
                <div className="p-2 rounded-xl bg-blue-50 text-primary border border-blue-100 shadow-sm">
                  <Smartphone size={18} />
                </div>
                <h3 className="text-[16px] font-black text-foreground uppercase tracking-tight">Galaxy Device Distribution</h3>
              </div>
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productData} margin={{ top: 0, right: 20, bottom: 0, left: -10 }} barSize={24}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--subtle-foreground)", fontWeight: 700 }} axisLine={false} tickLine={false} unit="%" />
                    <Tooltip 
                      cursor={{ fill: "#F8FAFC" }}
                      contentStyle={{ borderRadius: 16, border: "none", fontSize: 12, fontWeight: 800, boxShadow: "var(--shadow-2xl)", padding: "12px 16px" }} 
                      formatter={(v: number) => [`${v}%`, ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {productData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 지역별 분포 */}
            <div className="app-card p-8 border-border/60 shadow-md">
              <div className="flex items-center gap-3 mb-10">
                <div className="p-2 rounded-xl bg-blue-50 text-primary border border-blue-100 shadow-sm">
                  <MapPin size={18} />
                </div>
                <h3 className="text-[16px] font-black text-foreground uppercase tracking-tight">Regional Distribution</h3>
              </div>
              <div className="grid grid-cols-5 gap-6">
                {REGION_DATA.map((r) => (
                  <div key={r.label} className="flex flex-col items-center gap-4 group">
                    <div className="w-full bg-slate-50/50 rounded-2xl overflow-hidden flex flex-col justify-end p-1 border border-slate-100 shadow-inner group-hover:bg-white transition-all" style={{ height: 160 }}>
                      <div className="w-full rounded-xl transition-all duration-1000 ease-out shadow-lg shadow-blue-100" style={{ height: `${r.value * 1.8}%`, minHeight: 8, backgroundColor: r.color }} />
                    </div>
                    <div className="text-center">
                      <span className="text-[15px] font-black block mb-1" style={{ color: r.color }}>{r.value}%</span>
                      <span className="text-[11px] text-slate-400 font-black uppercase tracking-tighter">{r.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
