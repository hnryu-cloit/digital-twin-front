import type React from "react";
import { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
} from "recharts";
import {
  Users, Smartphone, Tag, History, RefreshCw,
  ChevronDown, ChevronUp, BarChart2, Activity,
  MapPin, ShoppingBag, TrendingUp, TrendingDown, Minus,
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
const DONUT_COLORS = ["#5B7DFF", "#6366F1", "#818CF8", "#A5B4FC", "#DCE4F3"];

const CUSTOM_LABEL = ({ cx, cy }: { cx: number; cy: number }) => (
  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
    <tspan x={cx} dy="-0.6em" style={{ fontSize: 11, fill: "#7C8397" }}>총 N수</tspan>
    <tspan x={cx} dy="1.5em" style={{ fontSize: 15, fill: "#1D1F3D", fontWeight: 700 }}>30,000</tspan>
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
const BAR_COLORS = ["#5B7DFF", "#4F6AF3", "#6D84F5", "#818CF8", "#9CA3FB", "#A5B4FC", "#DCE4F3"];

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
  { label: "MZ 얼리어답터", value: 31, count: 9300, color: "#5B7DFF", trend: "up", trendVal: "+4.2%p", sub: "20~34세 · 출시 즉시 구매 의향 72%" },
  { label: "프리미엄 바이어", value: 28, count: 8400, color: "#6366F1", trend: "up", trendVal: "+1.8%p", sub: "35~49세 · S Ultra/Fold 선호 · 고가 모델 집중" },
  { label: "패밀리 유저", value: 19, count: 5700, color: "#818CF8", trend: "flat", trendVal: "0%p", sub: "30~50세 · 통신사 구매 비중 81% · AS 중시" },
  { label: "게이머", value: 14, count: 4200, color: "#A5B4FC", trend: "down", trendVal: "-1.1%p", sub: "18~30세 · 120Hz·발열 관심 높음 · Z Flip 선호" },
  { label: "비즈니스 유저", value: 8, count: 2400, color: "#DCE4F3", trend: "flat", trendVal: "0%p", sub: "40~55세 · 보안·DeX 기능 중시 · 자급제 비중 높음" },
];

/* ─── 구매 채널 데이터 ─── */
const CHANNEL_DATA = [
  { label: "통신사 대리점", value: 44, color: "#5B7DFF" },
  { label: "삼성 공식몰", value: 27, color: "#6366F1" },
  { label: "자급제 (온라인)", value: 18, color: "#818CF8" },
  { label: "오프라인 유통", value: 11, color: "#DCE4F3" },
];

/* ─── 지역 데이터 ─── */
const REGION_DATA = [
  { label: "수도권", value: 48, color: "#5B7DFF" },
  { label: "경상권", value: 21, color: "#6366F1" },
  { label: "전라권", value: 12, color: "#818CF8" },
  { label: "충청권", value: 10, color: "#A5B4FC" },
  { label: "기타", value: 9, color: "#DCE4F3" },
];

/* ─── 체크박스 공통 컴포넌트 ─── */
function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      className={`w-4 h-4 rounded flex items-center justify-center border transition-colors cursor-pointer shrink-0 ${
        checked ? "bg-[#5B7DFF] border-[#5B7DFF]" : "border-[#DCE4F3] bg-white"
      }`}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
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
      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#EEF4FF] transition-colors rounded-lg"
    >
      <div className="flex items-center gap-2">
        <span className="text-[#5B7DFF]">{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#1D1F3D" }}>{title}</span>
        {count !== undefined && count > 0 && (
          <span className="bg-[#5B7DFF] text-white px-1.5 py-0.5 rounded-full" style={{ fontSize: 9, fontWeight: 700 }}>{count}</span>
        )}
      </div>
      {open ? <ChevronUp size={13} className="text-[#9BA6B8]" /> : <ChevronDown size={13} className="text-[#9BA6B8]" />}
    </button>
  );
}

/* ─── 트렌드 아이콘 ─── */
function TrendBadge({ trend, val }: { trend: "up" | "down" | "flat"; val: string }) {
  if (trend === "up") return (
    <span className="flex items-center gap-0.5 text-[#16A34A]" style={{ fontSize: 10, fontWeight: 700 }}>
      <TrendingUp size={10} />{val}
    </span>
  );
  if (trend === "down") return (
    <span className="flex items-center gap-0.5 text-[#DC2626]" style={{ fontSize: 10, fontWeight: 700 }}>
      <TrendingDown size={10} />{val}
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-[#9BA6B8]" style={{ fontSize: 10, fontWeight: 700 }}>
      <Minus size={10} />{val}
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
    <div className="flex flex-1 flex-col overflow-hidden">
      <WorkflowStepper currentPath="/analytics" />
      <div className="flex flex-1 overflow-hidden">
      {/* ── 필터 사이드바 ── */}
      <aside className="app-panel w-64 rounded-none border-r flex flex-col overflow-y-auto shrink-0">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <p style={{ fontSize: 11, color: "#9BA6B8", fontWeight: 700, letterSpacing: "0.06em" }}>필터 설정</p>
          <button style={{ fontSize: 10, color: "#5B7DFF", fontWeight: 600 }}>초기화</button>
        </div>

        <div className="flex flex-col gap-0.5 px-2 pb-4">

          {/* 인구통계 - 연령 */}
          <div className="rounded-xl overflow-hidden">
            <SectionHeader icon={<Users size={13} />} title="연령대" open={openSections.demographic} onToggle={() => toggle("demographic")} />
            {openSections.demographic && (
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: 11, color: "#7C8397" }}>연령 범위</span>
                  <span className="bg-[#EEF4FF] text-[#5B7DFF] px-2 py-0.5 rounded-full" style={{ fontSize: 10, fontWeight: 700 }}>
                    {ageRange[0]}~{ageRange[1]}세
                  </span>
                </div>
                <div className="relative h-4 flex items-center mb-1">
                  <div className="w-full h-1.5 bg-[#DCE4F3] rounded-full" />
                  <div className="absolute h-1.5 bg-[#5B7DFF] rounded-full" style={{ left: "12%", right: "28%" }} />
                  <div className="absolute w-3.5 h-3.5 bg-white border-2 border-[#5B7DFF] rounded-full shadow" style={{ left: "calc(12% - 7px)" }} />
                  <div className="absolute w-3.5 h-3.5 bg-[#5B7DFF] rounded-full shadow" style={{ left: "calc(72% - 7px)" }} />
                </div>
                <div className="flex justify-between">
                  <span style={{ fontSize: 9, color: "#9BA6B8" }}>18세</span>
                  <span style={{ fontSize: 9, color: "#9BA6B8" }}>65세</span>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {["10대", "20대", "30대", "40대", "50대+"].map((g, i) => (
                    <span key={g} className={`px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${i < 3 ? "bg-[#EEF4FF] border-[#BFD4FF] text-[#5B7DFF]" : "bg-[#F7FAFF] border-[#DCE4F3] text-[#9BA6B8]"}`}
                      style={{ fontSize: 10, fontWeight: 600 }}>
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 성별 */}
          <div className="rounded-xl overflow-hidden">
            <SectionHeader icon={<Users size={13} />} title="성별" open={openSections.gender} onToggle={() => toggle("gender")} />
            {openSections.gender && (
              <div className="px-4 pb-3 flex gap-2">
                {([
                  { key: "male", label: "남성", pct: "58%" },
                  { key: "female", label: "여성", pct: "42%" },
                ] as { key: keyof typeof gender; label: string; pct: string }[]).map((g) => (
                  <button key={g.key}
                    onClick={() => setGender((p) => ({ ...p, [g.key]: !p[g.key] }))}
                    className={`flex-1 py-2 rounded-xl border transition-all flex flex-col items-center gap-0.5 ${gender[g.key] ? "border-[#5B7DFF] bg-[#EEF4FF]" : "border-[#DCE4F3] bg-[#F7FAFF]"}`}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: gender[g.key] ? "#5B7DFF" : "#9BA6B8" }}>{g.label}</span>
                    <span style={{ fontSize: 10, color: gender[g.key] ? "#6366F1" : "#DCE4F3" }}>{g.pct}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 삼성 제품군 */}
          <div className="rounded-xl overflow-hidden">
            <SectionHeader icon={<Smartphone size={13} />} title="Galaxy 제품군" open={openSections.product} onToggle={() => toggle("product")} count={productCount} />
            {openSections.product && (
              <div className="px-4 pb-3 flex flex-col gap-2">
                <p style={{ fontSize: 10, color: "#9BA6B8", fontWeight: 600, letterSpacing: "0.04em" }}>S 시리즈</p>
                {([
                  { key: "s25ultra", label: "Galaxy S25 Ultra", pct: 26 },
                  { key: "s25plus", label: "Galaxy S25+", pct: 18 },
                  { key: "s25", label: "Galaxy S25", pct: 22 },
                ] as { key: keyof typeof products; label: string; pct: number }[]).map((d) => (
                  <label key={d.key} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={products[d.key]} onChange={() => setProducts((p) => ({ ...p, [d.key]: !p[d.key] }))} />
                    <span style={{ fontSize: 11, color: products[d.key] ? "#1D1F3D" : "#9BA6B8", flex: 1 }}>{d.label}</span>
                    <span style={{ fontSize: 10, color: "#9BA6B8" }}>{d.pct}%</span>
                  </label>
                ))}
                <p style={{ fontSize: 10, color: "#9BA6B8", fontWeight: 600, letterSpacing: "0.04em", marginTop: 4 }}>Z 시리즈</p>
                {([
                  { key: "zfold6", label: "Galaxy Z Fold6", pct: 11 },
                  { key: "zflip6", label: "Galaxy Z Flip6", pct: 13 },
                ] as { key: keyof typeof products; label: string; pct: number }[]).map((d) => (
                  <label key={d.key} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={products[d.key]} onChange={() => setProducts((p) => ({ ...p, [d.key]: !p[d.key] }))} />
                    <span style={{ fontSize: 11, color: products[d.key] ? "#1D1F3D" : "#9BA6B8", flex: 1 }}>{d.label}</span>
                    <span style={{ fontSize: 10, color: "#9BA6B8" }}>{d.pct}%</span>
                  </label>
                ))}
                <p style={{ fontSize: 10, color: "#9BA6B8", fontWeight: 600, letterSpacing: "0.04em", marginTop: 4 }}>A 시리즈</p>
                {([
                  { key: "a55", label: "Galaxy A55", pct: 6 },
                ] as { key: keyof typeof products; label: string; pct: number }[]).map((d) => (
                  <label key={d.key} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={products[d.key]} onChange={() => setProducts((p) => ({ ...p, [d.key]: !p[d.key] }))} />
                    <span style={{ fontSize: 11, color: products[d.key] ? "#1D1F3D" : "#9BA6B8", flex: 1 }}>{d.label}</span>
                    <span style={{ fontSize: 10, color: "#9BA6B8" }}>{d.pct}%</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 세그먼트 */}
          <div className="rounded-xl overflow-hidden">
            <SectionHeader icon={<Tag size={13} />} title="사용자 세그먼트" open={openSections.segment} onToggle={() => toggle("segment")} count={segmentCount} />
            {openSections.segment && (
              <div className="px-4 pb-3 flex flex-col gap-2">
                {([
                  { key: "mz", label: "MZ 얼리어답터", color: "#5B7DFF" },
                  { key: "premium", label: "프리미엄 바이어", color: "#7C3AED" },
                  { key: "family", label: "패밀리 유저", color: "#94A3B8" },
                  { key: "gamer", label: "게이머", color: "#0F766E" },
                  { key: "business", label: "비즈니스 유저", color: "#0284C7" },
                ] as { key: keyof typeof segments; label: string; color: string }[]).map((s) => (
                  <label
                    key={s.key}
                    className="flex items-center gap-2 rounded-xl border px-2.5 py-2 cursor-pointer transition-colors"
                    style={{
                      borderColor: segments[s.key] ? "#BFD4FF" : "#E2E8F0",
                      backgroundColor: segments[s.key] ? "#F8FBFF" : "#FFFFFF",
                    }}
                  >
                    <Checkbox checked={segments[s.key]} onChange={() => setSegments((p) => ({ ...p, [s.key]: !p[s.key] }))} />
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: s.color, opacity: segments[s.key] ? 1 : 0.35 }} />
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: segments[s.key] ? 700 : 500,
                          color: segments[s.key] ? "#1D1F3D" : "#64748B",
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 구매 채널 */}
          <div className="rounded-xl overflow-hidden">
            <SectionHeader icon={<ShoppingBag size={13} />} title="구매 채널" open={openSections.channel} onToggle={() => toggle("channel")} />
            {openSections.channel && (
              <div className="px-4 pb-3 flex flex-col gap-2">
                {([
                  { key: "carrier", label: "통신사 대리점", pct: 44 },
                  { key: "official", label: "삼성 공식몰", pct: 27 },
                  { key: "unlocked", label: "자급제 (온라인)", pct: 18 },
                  { key: "offline", label: "오프라인 유통", pct: 11 },
                ] as { key: keyof typeof channels; label: string; pct: number }[]).map((c) => (
                  <label key={c.key} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={channels[c.key]} onChange={() => setChannels((p) => ({ ...p, [c.key]: !p[c.key] }))} />
                    <span style={{ fontSize: 11, color: channels[c.key] ? "#1D1F3D" : "#9BA6B8", flex: 1 }}>{c.label}</span>
                    <span style={{ fontSize: 10, color: "#9BA6B8" }}>{c.pct}%</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 지역 */}
          <div className="rounded-xl overflow-hidden">
            <SectionHeader icon={<MapPin size={13} />} title="지역" open={openSections.region} onToggle={() => toggle("region")} />
            {openSections.region && (
              <div className="px-4 pb-3 flex flex-col gap-2">
                {([
                  { key: "metro", label: "수도권", pct: 48 },
                  { key: "gyeong", label: "경상권", pct: 21 },
                  { key: "jeon", label: "전라권", pct: 12 },
                  { key: "chung", label: "충청권", pct: 10 },
                  { key: "other", label: "기타 지역", pct: 9 },
                ] as { key: keyof typeof regions; label: string; pct: number }[]).map((r) => (
                  <label key={r.key} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={regions[r.key]} onChange={() => setRegions((p) => ({ ...p, [r.key]: !p[r.key] }))} />
                    <span style={{ fontSize: 11, color: regions[r.key] ? "#1D1F3D" : "#9BA6B8", flex: 1 }}>{r.label}</span>
                    <span style={{ fontSize: 10, color: "#9BA6B8" }}>{r.pct}%</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 앱 사용 이력 */}
          <div className="rounded-xl overflow-hidden">
            <SectionHeader icon={<History size={13} />} title="앱 사용 이력" open={openSections.appHistory} onToggle={() => toggle("appHistory")} />
            {openSections.appHistory && (
              <div className="px-4 pb-3 grid grid-cols-2 gap-2">
                {([
                  { key: "game", label: "게임" },
                  { key: "social", label: "SNS" },
                  { key: "shopping", label: "쇼핑" },
                  { key: "finance", label: "금융" },
                  { key: "health", label: "헬스" },
                ] as { key: keyof typeof apps; label: string }[]).map((a) => (
                  <label key={a.key} className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox checked={apps[a.key]} onChange={() => setApps((p) => ({ ...p, [a.key]: !p[a.key] }))} />
                    <span style={{ fontSize: 11, color: apps[a.key] ? "#1D1F3D" : "#9BA6B8" }}>{a.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto px-4 pb-5 pt-2 border-t border-[#F1F5F9]">
          <button className="w-full bg-[#5B7DFF] text-white rounded-xl py-2.5 flex items-center justify-center gap-2 shadow-md hover:bg-[#4562E8] transition-colors">
            <RefreshCw size={13} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>필터 적용</span>
          </button>
        </div>
      </aside>

      {/* ── 메인 콘텐츠 ── */}
      <main className="flex-1 overflow-y-auto bg-[#EEF2FA] p-6">
        {/* 타이틀 */}
        <div className="app-page-header mb-5 rounded-2xl border">
          <p style={{ fontSize: 11, color: "#5B7DFF", fontWeight: 600, letterSpacing: "0.06em" }}>SETTING</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1D1F3D", lineHeight: 1.3 }}>세그먼트 설정</h1>
          <p style={{ fontSize: 13, color: "#7C8397", marginTop: 4 }}>삼성전자 Galaxy 제품군 구매·사용자 30,000명 대상 실시간 세그먼트 분포</p>
        </div>

        {/* N수 + 도넛 차트 */}
        <div className="app-stat-card mb-4 p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <p style={{ fontSize: 13, color: "#7C8397" }}>총 응답자 수</p>
              <div className="flex items-end gap-2 mt-1">
                <span style={{ fontSize: 44, fontWeight: 800, color: "#1D1F3D", lineHeight: 1, letterSpacing: "-0.02em" }}>30,000</span>
                <span style={{ fontSize: 18, color: "#7C8397", marginBottom: 4 }}>명</span>
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 bg-[#5B7DFF] text-white px-3 py-1.5 rounded-full shadow-md">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span style={{ fontSize: 12, fontWeight: 600 }}>실시간 업데이트 (Real-time Calculation)</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: "평균 연령", value: "33.4세" },
                  { label: "남성 비율", value: "58%" },
                  { label: "수도권 비율", value: "48%" },
                ].map((s) => (
                  <div key={s.label} className="bg-[#F7FAFF] rounded-xl p-3 border border-[#E1E8F1]">
                    <p style={{ fontSize: 10, color: "#9BA6B8", fontWeight: 600 }}>{s.label}</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: "#1D1F3D", marginTop: 2 }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div style={{ width: 190, height: 190 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={58} outerRadius={82}
                      startAngle={90} endAngle={-270} dataKey="value"
                      labelLine={false} label={CUSTOM_LABEL} strokeWidth={0}>
                      {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v}%`, ""]}
                      contentStyle={{ borderRadius: 8, border: "1px solid #E1E8F1", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2">
                {donutData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: DONUT_COLORS[i] }} />
                    <div>
                      <p style={{ fontSize: 11, color: "#7C8397", lineHeight: 1.2 }}>{d.name}</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: DONUT_COLORS[i] }}>{d.value}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 제품군별 분포 + 구매 채널 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* 제품군별 분포 */}
          <div className="app-stat-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone size={14} className="text-[#5B7DFF]" />
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1D1F3D" }}>Galaxy 제품군별 분포</h3>
            </div>
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productData} margin={{ top: 0, right: 16, bottom: 0, left: -20 }} barSize={14}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#7C8397" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9BA6B8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E1E8F1", fontSize: 11 }} formatter={(v: number) => [`${v}%`, ""]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {productData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 구매 채널 */}
          <div className="app-stat-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag size={14} className="text-[#5B7DFF]" />
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1D1F3D" }}>구매 채널 분포</h3>
            </div>
            <div className="flex flex-col gap-3">
              {CHANNEL_DATA.map((c) => (
                <div key={c.label}>
                  <div className="flex justify-between mb-1">
                    <span style={{ fontSize: 12, color: "#3C4556" }}>{c.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1D1F3D" }}>{c.value}%</span>
                  </div>
                  <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${c.value}%`, backgroundColor: c.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 세그먼트 지표 요약 */}
        <div className="app-stat-card mb-4 p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 size={15} className="text-[#5B7DFF]" />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1D1F3D" }}>세그먼트 지표 요약</h3>
            <span className="ml-auto text-[#9BA6B8]" style={{ fontSize: 11 }}>vs 전월 비교</span>
          </div>
          <div className="flex flex-col gap-4">
            {SEGMENT_METRICS.map((item) => (
              <div key={item.label} className="rounded-xl border border-[#F1F5F9] p-3.5 hover:border-[#BFD4FF] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1D1F3D" }}>{item.label}</span>
                    <TrendBadge trend={item.trend} val={item.trendVal} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 11, color: "#9BA6B8" }}>{item.count.toLocaleString()}명</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: item.color }}>{item.value}%</span>
                  </div>
                </div>
                <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden mb-2">
                  <div className="h-full rounded-full transition-all" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                </div>
                <p style={{ fontSize: 11, color: "#7C8397" }}>{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 지역 분포 */}
        <div className="app-stat-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={14} className="text-[#5B7DFF]" />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1D1F3D" }}>지역별 분포</h3>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {REGION_DATA.map((r) => (
              <div key={r.label} className="flex flex-col items-center gap-1.5">
                <div className="w-full bg-[#F1F5F9] rounded-xl overflow-hidden flex flex-col justify-end" style={{ height: 80 }}>
                  <div className="w-full rounded-xl transition-all" style={{ height: `${r.value * 1.5}%`, minHeight: 8, backgroundColor: r.color }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{r.value}%</span>
                <span style={{ fontSize: 10, color: "#7C8397", textAlign: "center" }}>{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
      </div>
    </div>
  );
};
