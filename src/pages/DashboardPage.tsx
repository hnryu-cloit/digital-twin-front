import type React from "react";
import { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  Users, Smartphone, RefreshCw,
  ChevronDown, ChevronUp, BarChart2,
  MapPin, ShoppingBag, TrendingUp, TrendingDown, Minus,
  SlidersHorizontal, Clock, Briefcase, Wallet, Globe, Tag
} from "lucide-react";
import { WorkflowStepper } from "@/components/layout/WorkflowStepper";

/* ─── Mock Data ─── */
const donutData = [
  { name: "타겟 그룹 A", value: 31 },
  { name: "타겟 그룹 B", value: 28 },
  { name: "타겟 그룹 C", value: 19 },
  { name: "타겟 그룹 D", value: 14 },
  { name: "기타 그룹 E", value: 8 },
];

const DONUT_COLORS = ["var(--primary)", "var(--primary-active-border)", "var(--primary-light-border)", "var(--primary-light-bg)", "var(--panel-soft)"];

const productData = [
  { name: "S25 Ultra", value: 26 },
  { name: "S25+", value: 18 },
  { name: "S25", value: 22 },
  { name: "Z Fold6", value: 11 },
  { name: "Z Flip6", value: 13 },
  { name: "A55", value: 6 },
  { name: "기타", value: 4 },
];

const BAR_COLORS = ["var(--primary)", "var(--primary)", "var(--primary)", "var(--primary-light-border)", "var(--primary-light-border)", "var(--border)", "var(--panel-soft)"];

const SEGMENT_METRICS = [
  { label: "타겟 그룹 A", value: 31, count: 9300, color: "var(--primary)", trend: "up", trendVal: "+4.2%p", sub: "분석을 통해 도출된 핵심 타겟 세그먼트 A" },
  { label: "타겟 그룹 B", value: 28, count: 8400, color: "var(--primary)", trend: "up", trendVal: "+1.8%p", sub: "분석을 통해 도출된 핵심 타겟 세그먼트 B" },
  { label: "타겟 그룹 C", value: 19, count: 5700, color: "var(--primary-active-border)", trend: "flat", trendVal: "0%p", sub: "잠재적 기회를 보유한 분석 그룹 C" },
];

const REGION_DATA = [
  { label: "수도권", value: 48, color: "var(--primary)" },
  { label: "경상권", value: 21, color: "var(--primary-active-border)" },
  { label: "전라권", value: 12, color: "var(--primary-light-border)" },
  { label: "충청권", value: 10, color: "var(--primary-light-bg)" },
  { label: "기타", value: 9, color: "var(--panel-soft)" },
];

const CHANNEL_DATA = [
  { label: "통신사 대리점", value: 44, color: "var(--primary)" },
  { label: "삼성 공식몰", value: 27, color: "var(--primary-active-border)" },
  { label: "자급제 (온라인)", value: 18, color: "var(--primary-light-border)" },
  { label: "오프라인 유통", value: 11, color: "var(--primary-light-bg)" },
];

/* ─── UI Components ─── */
function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
        checked ? "bg-primary border-primary shadow-[0_2px_6px_rgba(47,102,255,0.2)]" : "border-[var(--border)] bg-card hover:border-[var(--border-hover)]"
      }`}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="block animate-in zoom-in-50 duration-200">
          <path d="M1.5 4L4 6.5L8.5 1.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

function SectionHeader({ icon, title, open, onToggle, count }: any) {
  return (
    <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--surface-hover)] transition-colors rounded-xl group">
      <div className="flex items-center gap-3">
        <span className={`transition-colors ${open ? "text-primary" : "text-[var(--subtle-foreground)] group-hover:text-primary"}`}>{icon}</span>
        <span className={`text-[12px] font-bold tracking-tight ${open ? "text-foreground" : "text-[var(--secondary-foreground)] group-hover:text-foreground"}`}>{title}</span>
        {count > 0 && <span className="bg-[var(--primary-light-bg)] text-primary px-2 py-0.5 rounded-full text-[9px] font-bold border border-[var(--primary-light-border)]">{count}</span>}
      </div>
      <div className="text-[var(--subtle-foreground)] group-hover:text-primary transition-all">{open ? <ChevronUp size={14} strokeWidth={2.5} /> : <ChevronDown size={14} strokeWidth={2.5} />}</div>
    </button>
  );
}

const CUSTOM_LABEL = ({ cx, cy }: { cx: number; cy: number }) => (
  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
    <tspan x={cx} dy="-0.6em" className="text-[10px] fill-[var(--subtle-foreground)] font-semibold uppercase tracking-[0.1em]">전체 표본</tspan>
    <tspan x={cx} dy="1.4em" className="text-[22px] fill-foreground font-bold tracking-tight">30,000</tspan>
  </text>
);

function TrendBadge({ trend, val }: { trend: string; val: string }) {
  if (trend === "up") return <span className="flex items-center gap-0.5 text-primary text-[11px] font-bold"><TrendingUp size={11} />{val}</span>;
  return <span className="flex items-center gap-0.5 text-[var(--subtle-foreground)] text-[11px] font-bold"><Minus size={11} />{val}</span>;
}

/* ─── Main Component ─── */
export const DashboardPage: React.FC = () => {
  const [openSections, setOpenSections] = useState({
    demographic: true,
    gender: true,
    product: true,
    region: false,
    household: false,
    interest: false,
  });

  const toggle = (key: keyof typeof openSections) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const [ageRange] = useState([25, 49]);
  const [gender, setGender] = useState({ male: true, female: true });
  const [products, setProducts] = useState({
    s25ultra: true, s25plus: true, s25: true,
    zfold6: false, zflip6: true, a55: false,
  });

  const productCount = Object.values(products).filter(Boolean).length;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <WorkflowStepper currentPath="/analytics" />

      <div className="flex flex-1 overflow-hidden">
        {/* ── 필터 사이드바 (인구통계 항목 강화) ── */}
        <aside className="w-72 shrink-0 flex flex-col border-r border-[var(--border)] bg-card overflow-hidden shadow-[var(--shadow-sm)]">
          <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--border)] shrink-0 bg-[var(--panel-soft)]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={15} className="text-primary" />
              <p className="text-[12px] text-foreground font-bold uppercase tracking-[0.14em]">분석 필터 설정</p>
            </div>
            <button className="text-[10px] text-primary font-bold hover:underline">초기화</button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-4 hide-scrollbar">
            <div className="flex flex-col gap-1">
              <div className="rounded-2xl overflow-hidden">
                <SectionHeader icon={<Users size={14} />} title="연령 범위" open={openSections.demographic} onToggle={() => toggle("demographic")} />
                {openSections.demographic && (
                  <div className="px-5 pb-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] text-[var(--subtle-foreground)] font-semibold uppercase">연령대 선택</span>
                      <span className="bg-primary text-white px-3 py-0.5 rounded-full text-[11px] font-bold shadow-[var(--shadow-sm)]">{ageRange[0]}~{ageRange[1]}세</span>
                    </div>
                    <div className="relative h-6 flex items-center mb-2 px-1">
                      <div className="w-full h-1.5 bg-[var(--panel-soft)] rounded-full" />
                      <div className="absolute h-1.5 bg-primary rounded-full" style={{ left: "12%", right: "28%" }} />
                      <div className="absolute w-4 h-4 bg-card border-2 border-primary rounded-full shadow-[var(--shadow-sm)]" style={{ left: "calc(12% - 8px)" }} />
                      <div className="absolute w-4 h-4 bg-primary rounded-full shadow-[var(--shadow-sm)]" style={{ left: "calc(72% - 8px)" }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden">
                <SectionHeader icon={<Users size={14} />} title="성별 선택" open={openSections.gender} onToggle={() => toggle("gender")} />
                {openSections.gender && (
                  <div className="px-5 pb-4 flex gap-2">
                    <button onClick={() => setGender(p => ({ ...p, male: !p.male }))} className={`flex-1 py-3 rounded-xl border transition-all flex items-center justify-center ${gender.male ? "border-primary bg-[var(--primary-light-bg)] text-primary font-bold shadow-sm" : "border-[var(--border)] bg-card text-[var(--subtle-foreground)] hover:border-[var(--border-hover)]"}`}><span className="text-[13px]">남성</span></button>
                    <button onClick={() => setGender(p => ({ ...p, female: !p.female }))} className={`flex-1 py-3 rounded-xl border transition-all flex items-center justify-center ${gender.female ? "border-primary bg-[var(--primary-light-bg)] text-primary font-bold shadow-sm" : "border-[var(--border)] bg-card text-[var(--subtle-foreground)] hover:border-[var(--border-hover)]"}`}><span className="text-[13px]">여성</span></button>
                  </div>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden">
                <SectionHeader icon={<Globe size={14} />} title="거주 지역" open={openSections.region} onToggle={() => toggle("region")} />
                {openSections.region && (
                  <div className="px-5 pb-4 flex flex-col gap-2">
                    {["수도권", "경상권", "전라권", "충청권"].map(r => (
                      <label key={r} className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 cursor-pointer transition-all border-[var(--border)] bg-card hover:border-[var(--border-hover)]`}>
                        <Checkbox checked={false} onChange={() => {}} />
                        <span className="text-[12px] font-semibold text-[var(--secondary-foreground)]">{r}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden">
                <SectionHeader icon={<Briefcase size={14} />} title="가구 형태" open={openSections.household} onToggle={() => toggle("household")} />
                {openSections.household && (
                  <div className="px-5 pb-4 flex flex-col gap-2">
                    {["1인 가구", "2인 가구", "3인 이상 가구", "딩크족"].map(h => (
                      <label key={h} className="flex items-center gap-3 px-1 cursor-pointer group">
                        <Checkbox checked={false} onChange={() => {}} />
                        <span className="text-[12px] font-semibold text-[var(--subtle-foreground)] group-hover:text-foreground">{h}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden">
                <SectionHeader icon={<Tag size={14} />} title="주요 관심사" open={openSections.interest} onToggle={() => toggle("interest")} />
                {openSections.interest && (
                  <div className="px-5 pb-4 flex flex-wrap gap-2">
                    {["IT/테크", "게임", "패션", "육아", "재테크", "여행"].map(i => (
                      <button key={i} className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-card text-[11px] font-bold text-[var(--subtle-foreground)] hover:border-primary hover:text-primary transition-all">{i}</button>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden">
                <SectionHeader icon={<Smartphone size={14} />} title="Galaxy 제품군" open={openSections.product} onToggle={() => toggle("product")} count={productCount} />
                {openSections.product && (
                  <div className="px-5 pb-4 flex flex-col gap-3">
                    {[
                      { id: "s25ultra", label: "Galaxy S25 Ultra", pct: 26 },
                      { id: "s25plus", label: "Galaxy S25+", pct: 18 },
                      { id: "s25", label: "Galaxy S25", pct: 22 },
                      { id: "zflip6", label: "Galaxy Z Flip6", pct: 13 },
                    ].map((d) => (
                      <label key={d.id} className="flex items-center gap-3 cursor-pointer group">
                        <Checkbox checked={(products as any)[d.id]} onChange={() => setProducts(p => ({ ...p, [d.id]: !(p as any)[d.id] }))} />
                        <span className={`text-[12px] font-semibold flex-1 ${(products as any)[d.id] ? "text-foreground" : "text-[var(--subtle-foreground)] group-hover:text-[var(--secondary-foreground)]"}`}>{d.label}</span>
                        <span className="text-[10px] text-[var(--muted-foreground)] font-bold">{d.pct}%</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-[var(--border)] bg-card shrink-0">
            <button className="w-full bg-primary text-white rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-[var(--shadow-sm)] hover:bg-primary-hover active:scale-[0.98] transition-all">
              <RefreshCw size={14} />
              <span className="text-[13px] font-bold uppercase tracking-tight">분석 필터 적용</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="app-page-header shrink-0">
            <p className="app-page-eyebrow">Segment Intelligence</p>
            <h1 className="app-page-title mt-1">세그먼트 설정 및 <span className="text-primary">분포 현황.</span></h1>
            <p className="app-page-description">삼성전자 Galaxy 제품군 구매·사용자 30,000명 대상의 실시간 분석 데이터입니다.</p>
          </div>

          <main className="flex-1 overflow-y-auto px-10 py-8 hide-scrollbar space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.6fr] gap-8">
              <div className="app-card p-8 flex flex-col md:flex-row md:items-center gap-10 relative overflow-hidden transition-colors hover:border-[var(--border-hover)]" style={{ boxShadow: "var(--shadow-md)" }}>
                <div className="flex-1 relative z-10">
                  <p className="text-[12px] text-[var(--subtle-foreground)] font-bold uppercase tracking-[0.14em] mb-2">전체 분석 대상</p>
                  <div className="flex items-end gap-2 mb-6">
                    <span className="text-[48px] font-bold text-foreground tracking-tighter leading-none">30,000</span>
                    <span className="text-[18px] text-[var(--subtle-foreground)] font-bold pb-1 uppercase">명</span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-[var(--panel-soft)] text-[var(--primary-active-text)] px-3 py-1.5 rounded-lg border border-[var(--primary-light-border)]">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    <span className="text-[12px] font-semibold uppercase tracking-tight">실시간 데이터 연산 중</span>
                  </div>
                  <div className="mt-8 grid grid-cols-3 gap-4">
                    {[
                      { label: "평균 연령", value: "33.4세", icon: <Clock size={12} /> },
                      { label: "남성 비율", value: "58%", icon: <Users size={12} /> },
                      { label: "수도권 비중", value: "48%", icon: <MapPin size={12} /> },
                    ].map((s) => (
                      <div key={s.label} className="bg-[var(--panel-soft)] rounded-xl p-3.5 border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-all group/stat min-w-0">
                        <p className="text-[10px] text-[var(--subtle-foreground)] font-bold uppercase flex items-center gap-1 whitespace-nowrap overflow-hidden">{s.icon}{s.label}</p>
                        <p className="text-[16px] font-bold text-[var(--secondary-foreground)] group-hover/stat:text-primary mt-0.5">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-8 bg-[var(--panel-soft)] p-8 rounded-3xl border border-[var(--border)] shadow-inner relative z-10 shrink-0">
                  <div style={{ width: 180, height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} startAngle={90} endAngle={-270} dataKey="value" labelLine={false} label={CUSTOM_LABEL} strokeWidth={0}>
                          {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => [`${v}%`, ""]} contentStyle={{ borderRadius: 12, border: "none", fontSize: 12, fontWeight: 600, boxShadow: "var(--shadow-lg)" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-3 min-w-[100px]">
                    {donutData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: DONUT_COLORS[i] }} />
                        <div className="min-w-0">
                          <p className="text-[10px] text-[var(--subtle-foreground)] font-semibold leading-none mb-1 truncate">{d.name}</p>
                          <p className="text-[14px] font-bold leading-none text-[var(--secondary-foreground)]">{d.value}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="app-card p-8 border-[var(--border)]" style={{ boxShadow: "var(--shadow-md)" }}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-xl bg-[var(--panel-soft)] text-primary border border-[var(--border)] shadow-sm"><ShoppingBag size={16} /></div>
                  <h3 className="text-[14px] font-bold text-foreground uppercase tracking-tight">주요 채널 분포</h3>
                </div>
                <div className="flex flex-col gap-6">
                  {CHANNEL_DATA.map((c) => (
                    <div key={c.label} className="group">
                      <div className="flex justify-between mb-2 text-[12px] font-semibold">
                        <span className="text-[var(--secondary-foreground)] group-hover:text-primary transition-colors truncate pr-2">{c.label}</span>
                        <span className="text-foreground shrink-0">{c.value}%</span>
                      </div>
                      <div className="h-1.5 bg-[var(--panel-soft)] rounded-full overflow-hidden shadow-inner">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${c.value}%`, backgroundColor: c.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="app-card p-8 border-[var(--border)]" style={{ boxShadow: "var(--shadow-md)" }}>
              <div className="flex items-center justify-between mb-8 border-b border-[var(--border)] pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[var(--panel-soft)] text-primary border border-[var(--border)] shadow-sm"><BarChart2 size={18} /></div>
                  <h3 className="text-[16px] font-bold text-foreground uppercase tracking-tight">세그먼트 지표 요약</h3>
                </div>
                <div className="bg-[var(--panel-soft)] px-3 py-1 rounded-full border border-[var(--border)] text-[10px] text-[var(--subtle-foreground)] font-semibold uppercase tracking-[0.1em]">전월 대비 분석 결과</div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {SEGMENT_METRICS.map((item) => (
                  <div key={item.label} className="rounded-xl border border-[var(--border)] p-6 hover:bg-[var(--surface-hover)] hover:border-[var(--border-hover)] transition-all group flex items-center gap-10">
                    <div className="w-40 shrink-0">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[14px] font-bold text-foreground group-hover:text-primary">{item.label}</span>
                      </div>
                      <TrendBadge trend={item.trend} val={item.trendVal} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-2.5">
                        <p className="text-[11px] text-[var(--muted-foreground)] font-medium max-w-sm">{item.sub}</p>
                        <div className="text-right">
                          <span className="text-[11px] text-[var(--subtle-foreground)] font-bold mr-3">{item.count.toLocaleString()} N</span>
                          <span className="text-[20px] font-bold tracking-tight text-foreground">{item.value}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-[var(--panel-soft)] rounded-full overflow-hidden shadow-inner">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-10">
              <div className="app-card p-8 border-[var(--border)]" style={{ boxShadow: "var(--shadow-md)" }}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-xl bg-[var(--panel-soft)] text-primary border border-[var(--border)] shadow-sm"><Smartphone size={16} /></div>
                  <h3 className="text-[14px] font-bold text-foreground uppercase tracking-tight">Galaxy 기기별 분포 현황</h3>
                </div>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productData} margin={{ top: 0, right: 20, bottom: 0, left: -10 }} barSize={20}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--subtle-foreground)", fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "var(--subtle-foreground)", fontWeight: 600 }} axisLine={false} tickLine={false} unit="%" />
                      <Tooltip cursor={{ fill: "var(--panel-soft)" }} contentStyle={{ borderRadius: 12, border: "none", fontSize: 11, fontWeight: 700, boxShadow: "var(--shadow-lg)" }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {productData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="app-card p-8 border-[var(--border)]" style={{ boxShadow: "var(--shadow-md)" }}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-xl bg-[var(--panel-soft)] text-primary border border-[var(--border)] shadow-sm"><MapPin size={16} /></div>
                  <h3 className="text-[14px] font-bold text-foreground uppercase tracking-tight">지역별 분포 현황</h3>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  {REGION_DATA.map((r) => (
                    <div key={r.label} className="flex flex-col items-center gap-4 group">
                      <div className="w-full bg-[var(--panel-soft)] rounded-xl overflow-hidden flex flex-col justify-end p-0.5 border border-[var(--border)] shadow-inner group-hover:bg-[var(--surface-hover)] transition-all" style={{ height: 140 }}>
                        <div className="w-full rounded-lg transition-all duration-1000" style={{ height: `${r.value * 1.8}%`, minHeight: 4, backgroundColor: r.color }} />
                      </div>
                      <div className="text-center">
                        <span className="text-[13px] font-bold block mb-0.5 text-[var(--secondary-foreground)]">{r.value}%</span>
                        <span className="text-[10px] text-[var(--subtle-foreground)] font-semibold uppercase tracking-tight">{r.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
