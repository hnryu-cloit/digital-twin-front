import type React from "react";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Clock, TrendingUp, UserCircle2, RefreshCw } from "lucide-react";

/* ────────── Word Cloud Data ────────── */
const WORDS = [
  { text: "카메라", weight: 9 },
  { text: "줌 기능", weight: 8 },
  { text: "야간 촬영", weight: 7 },
  { text: "가격", weight: 7 },
  { text: "화질", weight: 6 },
  { text: "디자인", weight: 5 },
  { text: "성능", weight: 5 },
  { text: "배터리", weight: 4 },
  { text: "매장", weight: 4 },
  { text: "화질", weight: 3 },
  { text: "성능", weight: 3 },
  { text: "디자인", weight: 2 },
  { text: "배터리", weight: 2 },
  { text: "화질", weight: 2 },
];

const WORD_SIZES: Record<number, { fontSize: number; color: string; weight: number }> = {
  9: { fontSize: 34, color: "#1E3A8A", weight: 800 },
  8: { fontSize: 28, color: "#1D4ED8", weight: 800 },
  7: { fontSize: 22, color: "#2563EB", weight: 700 },
  6: { fontSize: 18, color: "#3B82F6", weight: 700 },
  5: { fontSize: 15, color: "#3D5AF1", weight: 600 },
  4: { fontSize: 13, color: "#6366F1", weight: 600 },
  3: { fontSize: 12, color: "#818CF8", weight: 500 },
  2: { fontSize: 11, color: "#A5B4FC", weight: 500 },
};

/* ────────── Bar Chart Data ────────── */
const CHART_DATA = [
  { label: "매우 그렇다", value: 4500, pct: 45 },
  { label: "그렇다", value: 3000, pct: 30 },
  { label: "보통이다", value: 1500, pct: 15 },
  { label: "그렇지 않다", value: 700, pct: 7 },
  { label: "전혀 그렇지 않다", value: 300, pct: 3 },
];

const BAR_COLORS = ["#3D5AF1", "#6D7AF1", "#A5B4FC", "#C7D2FE", "#E0E7FF"];

/* ────────── Real-time Feed ────────── */
const INITIAL_FEED = [
  { id: 1, time: "14:32:05", user: "Twin ID_482", content: "Q3. 매우 그렇다, Q4. 줌 기능" },
  { id: 2, time: "14:31:58", user: "Twin ID_481", content: "Q3. 그렇다, Q4. 야간 촬영" },
  { id: 3, time: "14:31:52", user: "Twin ID_480", content: "Q3. 보통이다, Q4. 디자인" },
];

const AVATAR_COLORS = ["#EEF1FF", "#F0FDF4", "#FFF7ED", "#FDF2F8", "#F0F9FF"];
const AVATAR_TEXT_COLORS = ["#3D5AF1", "#16A34A", "#EA580C", "#DB2777", "#0284C7"];

/* ────────── Custom Bar Label ────────── */
const CustomBarLabel = (props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
  index?: number;
}) => {
  const { x = 0, y = 0, width = 0, height = 0, value = 0, index = 0 } = props;
  const pct = CHART_DATA[index]?.pct ?? 0;
  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      fill="#475569"
      dominantBaseline="central"
      style={{ fontSize: 11 }}
    >
      {value.toLocaleString()} ({pct}%)
    </text>
  );
};

/* ────────── Main Component ────────── */
export const LiveAnalysisPage: React.FC = () => {
  const [answered, setAnswered] = useState(3247);
  const total = 10000;
  const pct = Math.round((answered / total) * 100);

  const [feed, setFeed] = useState(INITIAL_FEED);
  const [tick, setTick] = useState(0);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAnswered((prev) => Math.min(prev + Math.floor(Math.random() * 8 + 1), total));
      setTick((t) => t + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tick === 0) return;
    const newId = Date.now();
    const names = ["카메라", "야간 촬영", "줌 기능", "디자인", "배터리", "화질"];
    const opinions = ["매우 그렇다", "그렇다", "보통이다"];
    const q4 = names[Math.floor(Math.random() * names.length)];
    const q3 = opinions[Math.floor(Math.random() * opinions.length)];
    const twinNum = 483 + tick;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    setFeed((prev) => [
      { id: newId, time: timeStr, user: `Twin ID_${twinNum}`, content: `Q3. ${q3}, Q4. ${q4}` },
      ...prev.slice(0, 4),
    ]);
  }, [tick]);

  return (
    <div className="flex-1 flex flex-col bg-[#F4F6FB] overflow-hidden">
      {/* Page Header */}
      <div className="bg-white border-b border-[#E8ECF4] px-6 pt-5 pb-4">
        <p style={{ fontSize: 11, color: "#3D5AF1", fontWeight: 600, letterSpacing: "0.06em" }}>
          LIVE
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E293B", lineHeight: 1.3 }}>
          실시간 설문 분석
        </h1>
        <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
          S25 AI 카메라 기능 선호도 조사 — 실시간 응답 현황
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
        {/* Progress Bar Card */}
        <div className="bg-white rounded-2xl border border-[#E8ECF4] shadow-sm px-6 py-4 flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 15, fontWeight: 700, color: "#1E293B" }}>
                {answered.toLocaleString()}
                <span style={{ color: "#94A3B8", fontWeight: 500 }}>/{total.toLocaleString()} 응답 완료</span>
              </span>
              <span
                className="bg-[#EEF1FF] text-[#3D5AF1] px-2.5 py-0.5 rounded-full border border-[#C7D2FE]"
                style={{ fontSize: 12, fontWeight: 700 }}
              >
                {pct}%
              </span>
            </div>
            <div className="h-2.5 bg-[#E8ECF4] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: "linear-gradient(90deg, #3D5AF1, #818CF8)",
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] flex items-center justify-center">
              <Clock size={15} className="text-[#16A34A]" />
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#94A3B8" }}>예상 잔여 시간</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>약 6분 40초</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
            <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 600 }}>수집 중</span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
          {/* Word Cloud */}
          <div className="bg-white rounded-2xl border border-[#E8ECF4] shadow-sm p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-[#3D5AF1]" />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>
                  주요 키워드
                </h3>
                <span
                  className="bg-[#EEF1FF] text-[#3D5AF1] px-2 py-0.5 rounded-full"
                  style={{ fontSize: 10, fontWeight: 600 }}
                >
                  Live Analysis
                </span>
              </div>
              <button className="w-7 h-7 rounded-lg bg-[#F4F6FB] hover:bg-[#EEF1FF] flex items-center justify-center transition-colors">
                <RefreshCw size={12} className="text-[#64748B]" />
              </button>
            </div>

            {/* Word Cloud Display */}
            <div
              className="flex-1 flex items-center justify-center"
              style={{ minHeight: 220 }}
            >
              <div
                className="relative w-full"
                style={{ height: 240 }}
              >
                {/* Manually position words to resemble a word cloud */}
                {[
                  { text: "카메라", w: 9, top: "38%", left: "28%" },
                  { text: "줌 기능", w: 8, top: "58%", left: "35%" },
                  { text: "야간 촬영", w: 7, top: "20%", left: "22%" },
                  { text: "가격", w: 7, top: "68%", left: "58%" },
                  { text: "화질", w: 6, top: "12%", left: "55%" },
                  { text: "화질", w: 3, top: "75%", left: "15%" },
                  { text: "화질", w: 2, top: "80%", left: "72%" },
                  { text: "디자인", w: 5, top: "8%", left: "30%" },
                  { text: "디자인", w: 2, top: "50%", left: "68%" },
                  { text: "성능", w: 5, top: "15%", left: "68%" },
                  { text: "성능", w: 3, top: "30%", left: "8%" },
                  { text: "배터리", w: 4, top: "45%", left: "5%" },
                  { text: "배터리", w: 2, top: "88%", left: "40%" },
                  { text: "매장", w: 4, top: "62%", left: "72%" },
                ].map((word, i) => {
                  const style = WORD_SIZES[word.w] ?? WORD_SIZES[2];
                  return (
                    <span
                      key={i}
                      className="absolute whitespace-nowrap select-none cursor-default hover:opacity-80 transition-opacity"
                      style={{
                        top: word.top,
                        left: word.left,
                        fontSize: style.fontSize,
                        color: style.color,
                        fontWeight: style.weight,
                        transform: "translate(-50%, -50%)",
                        lineHeight: 1,
                      }}
                    >
                      {word.text}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4">
            {/* Bar Chart */}
            <div className="bg-white rounded-2xl border border-[#E8ECF4] shadow-sm p-5 flex-1">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-6 h-6 rounded-lg bg-[#3D5AF1] text-white flex items-center justify-center"
                  style={{ fontSize: 11, fontWeight: 700 }}
                >
                  Q3
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>
                  구매 의향
                </h3>
              </div>
              <div style={{ height: 170 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={CHART_DATA}
                    layout="vertical"
                    margin={{ top: 0, right: 100, bottom: 0, left: 0 }}
                    barSize={14}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={80}
                      tick={{ fontSize: 11, fill: "#475569" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#F4F6FB" }}
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #E8ECF4",
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [`${v.toLocaleString()}명`, "응답 수"]}
                    />
                    <Bar
                      dataKey="value"
                      radius={[0, 4, 4, 0]}
                      label={<CustomBarLabel />}
                    >
                      {CHART_DATA.map((_, index) => (
                        <Cell key={index} fill={BAR_COLORS[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Real-time Feed */}
            <div className="bg-white rounded-2xl border border-[#E8ECF4] shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>
                    최근 응답
                  </h3>
                  <span
                    className="bg-[#EEF1FF] text-[#3D5AF1] px-2 py-0.5 rounded-full"
                    style={{ fontSize: 10, fontWeight: 600 }}
                  >
                    Real-time Feed
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
                  <span style={{ fontSize: 11, color: "#16A34A", fontWeight: 600 }}>LIVE</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {feed.slice(0, 4).map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-2 border-b border-[#F1F5F9] last:border-none"
                    style={{
                      opacity: idx === 0 ? 1 : 1 - idx * 0.12,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                      }}
                    >
                      <UserCircle2
                        size={18}
                        style={{ color: AVATAR_TEXT_COLORS[idx % AVATAR_TEXT_COLORS.length] }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="truncate"
                        style={{ fontSize: 12, color: "#1E293B", lineHeight: 1.4 }}
                      >
                        <span style={{ fontWeight: 600 }}>{item.time}</span>
                        {" · "}
                        <span style={{ color: "#3D5AF1", fontWeight: 600 }}>{item.user}</span>
                        {" · "}
                        <span style={{ color: "#475569" }}>{item.content}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
