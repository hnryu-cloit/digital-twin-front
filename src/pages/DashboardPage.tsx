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

/* ─── 도넛 차트 데이터 (모노크롬 블루) ─── */
const donutData = [
  { name: "MZ 얼리어답터", value: 31 },
  { name: "프리미엄 바이어", value: 28 },
  { name: "패밀리 유저", value: 19 },
  { name: "게이머", value: 14 },
  { name: "비즈니스", value: 8 },
];
const DONUT_COLORS = ["#316BFF", "#648EFF", "#CBD5E1", "#E2E8F0", "#F1F5F9"];

const CUSTOM_LABEL = ({ cx, cy }: { cx: number; cy: number }) => (
  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
    <tspan x={cx} dy="-0.6em" className="text-[11px] fill-[var(--subtle-foreground)] font-bold">전체 표본</tspan>
    <tspan x={cx} dy="1.5em" className="text-[16px] fill-foreground font-black">30,000</tspan>
  </text>
);

/* ─── 제품군별 분포 차트 (차분한 컬러) ─── */
const productData = [
  { name: "S25 Ultra", value: 26 },
  { name: "S25+", value: 18 },
  { name: "S25", value: 22 },
  { name: "Z Fold6", value: 11 },
  { name: "Z Flip6", value: 13 },
  { name: "A55", value: 6 },
  { name: "기타", value: 4 },
];
const BAR_COLORS = ["#316BFF", "#316BFF", "#316BFF", "#94A3B8", "#94A3B8", "#CBD5E1", "#E2E8F0"];

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
  { label: "프리미엄 바이어", value: 28, count: 8400, color: "#316BFF", trend: "up", trendVal: "+1.8%p", sub: "35~49세 · S Ultra/Fold 선호 · 고가 모델 집중" },
  { label: "패밀리 유저", value: 19, count: 5700, color: "#94A3B8", trend: "flat", trendVal: "0%p", sub: "30~50세 · 통신사 구매 비중 81% · AS 중시" },
  { label: "게이머", value: 14, count: 4200, color: "#94A3B8", trend: "down", trendVal: "-1.1%p", sub: "18~30세 · 120Hz·발열 관심 높음 · Z Flip 선호" },
  { label: "비즈니스 유저", value: 8, count: 2400, color: "#94A3B8", trend: "flat", trendVal: "0%p", sub: "40~55세 · 보안·DeX 기능 중시 · 자급제 비중 높음" },
];

/* ─── 구매 채널 데이터 ─── */
const CHANNEL_DATA = [
  { label: "통신사 대리점", value: 44, color: "#316BFF" },
  { label: "삼성 공식몰", value: 27, color: "#648EFF" },
  { label: "자급제 (온라인)", value: 18, color: "#94A3B8" },
  { label: "오프라인 유통", value: 11, color: "#CBD5E1" },
];

/* ─── 지역 데이터 ─── */
const REGION_DATA = [
  { label: "수도권", value: 48, color: "#316BFF" },
  { label: "경상권", value: 21, color: "#94A3B8" },
  { label: "전라권", value: 12, color: "#CBD5E1" },
  { label: "충청권", value: 10, color: "#E2E8F0" },
  { label: "기타", value: 9, color: "#F1F5F9" },
];

/* ─── 체크박스 공통 컴포넌트 ─── */
function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      className={`w-4 h-4 rounded flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
        checked ? "bg-primary border-primary shadow-sm" : "border-[var(--border)] bg-card hover:border-primary/50"
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
      className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--surface-hover)] transition-colors rounded-xl group"
    >
      <div className="flex items-center gap-2.5">
        <span className="text-[var(--subtle-foreground)] group-hover:text-primary transition-colors">{icon}</span>
        <span className="text-[13px] font-bold text-[var(--secondary-foreground)]">{title}</span>
        {count !== undefined && count > 0 && (
          <span className="bg-[var(--panel-soft)] text-[var(--muted-foreground)] px-2 py-0.5 rounded-full text-[10px] font-black">{count}</span>
        )}
      </div>
      {open ? <ChevronUp size={14} className="text-[var(--muted-foreground)]" /> : <ChevronDown size={14} className="text-[var(--muted-foreground)]" />}
    </button>
  );
}

/* ─── 트렌드 아이콘 ─── */
function TrendBadge({ trend, val }: { trend: "up" | "down" | "flat"; val: string }) {
  if (trend === "up") return (
    <span className="flex items-center gap-0.5 text-primary text-[11px] font-black">
      <TrendingUp size={11} />{val}
    </span>
  );
  if (trend === "down") return (
    <span className="flex items-center gap-0.5 text-[var(--subtle-foreground)] text-[11px] font-black">
      <TrendingDown size={11} />{val}
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-[var(--muted-foreground)] text-[11px] font-black">
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

  const [ageRange] = useState([25, 49]);
  const [gender, setGender] = useState({ male: true, female: true });
  const [products, setProducts] = useState({
    s25ultra: true, s25plus: true, s25: true,
    zfold6: false, zflip6: true, a55: false,
  });
  const [segments, setSegments] = useState({
    mz: true, premium: true, family: false, gamer: true, business: false,
  });

  const productCount = Object.values(products).filter(Boolean).length;
  const segmentCount = Object.values(segments).filter(Boolean).length;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <WorkflowStepper currentPath="/analytics" />

      <div className="flex flex-1 overflow-hidden">
        {/* ── 필터 사이드바 ── */}
        <aside className="w-72 shrink-0 flex flex-col border-r border-[var(--border)] bg-card overflow-hidden shadow-sm">
          <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--border)] shrink-0">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-primary" />
              <p className="text-[13px] text-foreground font-black uppercase tracking-widest">분석 필터 설정</p>
            </div>
            <button className="text-[11px] text-primary font-black hover:underline uppercase tracking-tighter">초기화</button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-4 hide-scrollbar">
            <div className="flex flex-col gap-1">
              {/* 인구통계 */}
              <div className="rounded-2xl overflow-hidden">
                <SectionHeader icon={<Users size={15} />} title="연령 범위" open={openSections.demographic} onToggle={() => toggle("demographic")} />
                {openSections.demographic && (
                  <div className="px-5 pb-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] text-[var(--subtle-foreground)] font-bold uppercase">연령대 선택</span>
                      <span className="bg-primary text-white px-3 py-0.5 rounded-full text-[11px] font-black shadow-md shadow-blue-100">{ageRange[0]}~{ageRange[1]}세</span>
                    </div>
                    <div className="relative h-6 flex items-center mb-2 px-1">
                      <div className="w-full h-1.5 bg-[var(--panel-soft)] rounded-full" />
                      <div className="absolute h-1.5 bg-primary rounded-full" style={{ left: "12%", right: "28%" }} />
                      <div className="absolute w-4 h-4 bg-card border-2 border-primary rounded-full shadow-lg" style={{ left: "calc(12% - 8px)" }} />
                      <div className="absolute w-4 h-4 bg-primary rounded-full shadow-lg shadow-blue-200" style={{ left: "calc(72% - 8px)" }} />
                    </div>
                    <div className="flex justify-between px-1 text-[10px] text-[var(--muted-foreground)] font-black uppercase tracking-tighter">
                      <span>최소 18세</span>
                      <span>최대 65세</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 성별 분포 */}
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
                        className={`flex-1 py-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${gender[g.key] ? "border-primary bg-primary-light-bg text-primary shadow-sm" : "border-[var(--border)] bg-card text-[var(--subtle-foreground)]"}`}>
                        <span className="text-[12px] font-black">{g.label}</span>
                        <span className="text-[10px] font-bold opacity-70">{g.pct}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 제품군 */}
              <div className="rounded-2xl overflow-hidden">
                <SectionHeader icon={<Smartphone size={15} />} title="Galaxy 제품군" open={openSections.product} onToggle={() => toggle("product")} count={productCount} />
                {openSections.product && (
                  <div className="px-5 pb-4 flex flex-col gap-2.5">
                    {([
                      { key: "s25ultra", label: "Galaxy S25 Ultra", pct: 26 },
                      { key: "s25plus", label: "Galaxy S25+", pct: 18 },
                      { key: "s25", label: "Galaxy S25", pct: 22 },
                      { key: "zflip6", label: "Galaxy Z Flip6", pct: 13 },
                    ] as { key: keyof typeof products; label: string; pct: number }[]).map((d) => (
                      <label key={d.key} className="flex items-center gap-3 cursor-pointer group">
                        <Checkbox checked={products[d.key]} onChange={() => setProducts((p) => ({ ...p, [d.key]: !p[d.key] }))} />
                        <span className={`text-[12px] font-bold flex-1 ${products[d.key] ? "text-foreground" : "text-[var(--subtle-foreground)] group-hover:text-[var(--secondary-foreground)]"}`}>{d.label}</span>
                        <span className="text-[11px] text-[var(--muted-foreground)] font-black">{d.pct}%</span>
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
                      { key: "mz", label: "MZ 얼리어답터" },
                      { key: "premium", label: "프리미엄 바이어" },
                      { key: "gamer", label: "게이머" },
                    ] as { key: keyof typeof segments; label: string }[]).map((s) => (
                      <label key={s.key} className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${segments[s.key] ? "border-primary bg-primary-light-bg/30 shadow-sm" : "border-[var(--border)] bg-card"}`}>
                        <Checkbox checked={segments[s.key]} onChange={() => setSegments((p) => ({ ...p, [s.key]: !p[s.key] }))} />
                        <span className={`text-[12px] truncate ${segments[s.key] ? "font-black text-primary" : "font-bold text-[var(--subtle-foreground)]"}`}>{s.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-[var(--border)] bg-card shrink-0">
            <button className="w-full bg-primary text-white rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-blue-100 active:scale-[0.98]">
              <RefreshCw size={15} />
              <span className="text-[14px] font-black uppercase tracking-tight">분석 필터 적용</span>
            </button>
          </div>
        </aside>

        {/* ── 메인 영역 ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="app-page-header shrink-0">
            <p className="app-page-eyebrow">Segment Intelligence</p>
            <h1 className="app-page-title mt-1">세그먼트 설정 및 <span className="text-primary">분포 현황.</span></h1>
            <p className="app-page-description">삼성전자 Galaxy 제품군 구매·사용자 30,000명 대상의 실시간 분석 데이터입니다.</p>
          </div>

          <main className="flex-1 overflow-y-auto px-10 py-8 hide-scrollbar space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
              {/* N수 + 도넛 차트 */}
              <div className="app-card p-10 flex flex-col md:flex-row md:items-center gap-12 relative overflow-hidden group">
                <div className="flex-1 relative z-10">
                  <p className="text-[14px] text-[var(--subtle-foreground)] font-black uppercase tracking-widest mb-2">전체 분석 대상</p>
                  <div className="flex items-end gap-3 mb-6">
                    <span className="text-[56px] font-black text-foreground tracking-tighter leading-none">30,000</span>
                    <span className="text-[20px] text-[var(--subtle-foreground)] font-black pb-1.5 uppercase">명</span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-[var(--panel-soft)] text-[var(--muted-foreground)] px-4 py-2 rounded-xl border border-[var(--border)]">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-[13px] font-black uppercase">실시간 데이터 연산 중</span>
                  </div>
                  <div className="mt-10 grid grid-cols-3 gap-3">
                    {[
                      { label: "평균 연령", value: "33.4세", icon: <Clock size={12} /> },
                      { label: "남성 비율", value: "58%", icon: <Users size={12} /> },
                      { label: "수도권 비중", value: "48%", icon: <MapPin size={12} /> },
                    ].map((s) => (
                      <div key={s.label} className="bg-[var(--panel-soft)] rounded-xl p-4 border border-[var(--border)] hover:bg-[var(--surface-hover)] hover:shadow-md transition-all group/stat">
                        <p className="text-[10px] text-[var(--subtle-foreground)] font-black uppercase flex items-center gap-1">{s.icon}{s.label}</p>
                        <p className="text-[17px] font-black text-[var(--secondary-foreground)] group-hover/stat:text-primary">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-10 bg-[var(--panel-soft)] p-10 rounded-[32px] border border-[var(--border)] shadow-inner relative z-10">
                  <div style={{ width: 200, height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={donutData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} startAngle={90} endAngle={-270} dataKey="value" labelLine={false} label={CUSTOM_LABEL} strokeWidth={0}>
                          {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => [`${v}%`, ""]} contentStyle={{ borderRadius: 16, border: "none", fontSize: 13, fontWeight: 800, boxShadow: "var(--shadow-lg)" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-4">
                    {donutData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DONUT_COLORS[i] }} />
                        <div>
                          <p className="text-[11px] text-[var(--subtle-foreground)] font-bold leading-none mb-1">{d.name}</p>
                          <p className="text-[15px] font-black leading-none" style={{ color: i < 2 ? DONUT_COLORS[i] : "var(--secondary-foreground)" }}>{d.value}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 구매 채널 분포 */}
              <div className="app-card p-10 border-[var(--border)]">
                <div className="flex items-center gap-3 mb-10">
                  <div className="p-2 rounded-xl bg-[var(--panel-soft)] text-[var(--subtle-foreground)] border border-[var(--border)] shadow-sm"><ShoppingBag size={18} /></div>
                  <h3 className="text-[16px] font-black text-foreground uppercase">주요 구매 채널 분포</h3>
                </div>
                <div className="flex flex-col gap-8">
                  {CHANNEL_DATA.map((c) => (
                    <div key={c.label} className="group">
                      <div className="flex justify-between mb-3 text-[13px] font-black">
                        <span className="text-[var(--secondary-foreground)] group-hover:text-primary">{c.label}</span>
                        <span className="text-foreground">{c.value}%</span>
                      </div>
                      <div className="h-2 bg-[var(--panel-soft)] rounded-full overflow-hidden shadow-inner">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${c.value}%`, backgroundColor: c.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 세그먼트 지표 요약 */}
            <div className="app-card p-10 border-[var(--border)] shadow-sm">
              <div className="flex items-center justify-between mb-10 border-b border-[var(--border)] pb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[var(--panel-soft)] text-[var(--subtle-foreground)] border border-[var(--border)] shadow-sm"><BarChart2 size={20} /></div>
                  <h3 className="text-[18px] font-black text-foreground uppercase">세그먼트 지표 요약</h3>
                </div>
                <div className="bg-[var(--panel-soft)] px-4 py-1.5 rounded-full border border-[var(--border)] text-[11px] text-[var(--subtle-foreground)] font-black uppercase italic tracking-widest">전월 대비 분석 결과</div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {SEGMENT_METRICS.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-[var(--border)] p-8 hover:bg-[var(--surface-hover)]/50 transition-all group flex items-center gap-12">
                    <div className="w-48 shrink-0">
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[15px] font-black text-foreground group-hover:text-primary">{item.label}</span>
                      </div>
                      <TrendBadge trend={item.trend} val={item.trendVal} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-3">
                        <p className="text-[12px] text-[var(--subtle-foreground)] font-bold max-w-sm">{item.sub}</p>
                        <div className="text-right">
                          <span className="text-[12px] text-[var(--muted-foreground)] font-black mr-4">{item.count.toLocaleString()} N</span>
                          <span className="text-[24px] font-black tracking-tighter" style={{ color: item.color }}>{item.value}%</span>
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

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* 제품군별 분포 */}
              <div className="app-card p-10 border-[var(--border)]">
                <div className="flex items-center gap-3 mb-10">
                  <div className="p-2 rounded-xl bg-[var(--panel-soft)] text-[var(--subtle-foreground)] border border-[var(--border)] shadow-sm"><Smartphone size={18} /></div>
                  <h3 className="text-[16px] font-black text-foreground uppercase">Galaxy 기기별 분포 현황</h3>
                </div>
                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productData} margin={{ top: 0, right: 20, bottom: 0, left: -10 }} barSize={24}>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--subtle-foreground)", fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontWeight: 700 }} axisLine={false} tickLine={false} unit="%" />
                      <Tooltip cursor={{ fill: "var(--panel-soft)" }} contentStyle={{ borderRadius: 16, border: "none", fontSize: 12, fontWeight: 800, boxShadow: "var(--shadow-lg)" }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {productData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 지역별 분포 */}
              <div className="app-card p-10 border-[var(--border)]">
                <div className="flex items-center gap-3 mb-10">
                  <div className="p-2 rounded-xl bg-[var(--panel-soft)] text-[var(--subtle-foreground)] border border-[var(--border)] shadow-sm"><MapPin size={18} /></div>
                  <h3 className="text-[16px] font-black text-foreground uppercase">지역별 분포 현황</h3>
                </div>
                <div className="grid grid-cols-5 gap-6">
                  {REGION_DATA.map((r) => (
                    <div key={r.label} className="flex flex-col items-center gap-5 group">
                      <div className="w-full bg-[var(--panel-soft)] rounded-2xl overflow-hidden flex flex-col justify-end p-1 border border-[var(--border)] shadow-inner group-hover:bg-[var(--surface-hover)] transition-all" style={{ height: 160 }}>
                        <div className="w-full rounded-xl transition-all duration-1000" style={{ height: `${r.value * 1.8}%`, minHeight: 8, backgroundColor: r.color }} />
                      </div>
                      <div className="text-center">
                        <span className="text-[15px] font-black block mb-1" style={{ color: r.color === "#316BFF" ? "#316BFF" : "var(--secondary-foreground)" }}>{r.value}%</span>
                        <span className="text-[11px] text-[var(--subtle-foreground)] font-black uppercase tracking-tighter">{r.label}</span>
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
