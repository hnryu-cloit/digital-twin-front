import type React from "react";
import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Smartphone,
  Tag,
  History,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  BarChart2,
  Activity,
} from "lucide-react";

const donutData = [
  { name: "Standard", value: 22 },
  { name: "Premium", value: 78 },
];
const COLORS = ["#CBD5E1", "#3D5AF1"];

const CUSTOM_LABEL = ({ cx, cy }: { cx: number; cy: number }) => (
  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
    <tspan x={cx} dy="-0.4em" style={{ fontSize: 11, fill: "#64748B" }}>
      총 N수
    </tspan>
    <tspan x={cx} dy="1.4em" style={{ fontSize: 13, fill: "#1E293B", fontWeight: 600 }}>
      12,847
    </tspan>
  </text>
);

function SectionHeader({
  icon,
  title,
  open,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F1F5FF] transition-colors rounded-lg"
    >
      <div className="flex items-center gap-2">
        <span className="text-[#3D5AF1]">{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{title}</span>
      </div>
      {open ? (
        <ChevronUp size={15} className="text-slate-400" />
      ) : (
        <ChevronDown size={15} className="text-slate-400" />
      )}
    </button>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E8ECF4] p-4 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-[#3D5AF1]">{icon}</span>
        <span style={{ fontSize: 12, color: "#64748B" }}>{label}</span>
      </div>
      <div className="flex items-end gap-1">
        <span style={{ fontSize: 28, fontWeight: 700, color: "#1E293B", lineHeight: 1.1 }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 14, color: "#64748B", marginBottom: 2 }}>{unit}</span>
        )}
      </div>
    </div>
  );
}

export const DashboardPage: React.FC = () => {
  const [openSections, setOpenSections] = useState({
    demographic: true,
    device: true,
    segment: true,
    appHistory: true,
  });

  const toggle = (key: keyof typeof openSections) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const [devices, setDevices] = useState({
    s24ultra: true,
    zflip6: true,
    s23: false,
  });
  const [apps, setApps] = useState({
    game: true,
    social: true,
    stores: false,
  });

  const segments = ["Premium Buyer", "Premium Buyer", "Gamer", "Premium Buyer"];
  const [ageRange] = useState([30, 39]);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Filter Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E8ECF4] flex flex-col overflow-y-auto shrink-0">
        <div className="px-4 pt-5 pb-2">
          <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, letterSpacing: "0.05em" }}>
            필터 설정
          </p>
        </div>

        <div className="flex flex-col gap-1 px-2 pb-6">
          {/* 인구통계 */}
          <div className="rounded-xl overflow-hidden">
            <SectionHeader
              icon={<Users size={14} />}
              title="인구통계"
              open={openSections.demographic}
              onToggle={() => toggle("demographic")}
            />
            {openSections.demographic && (
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <span style={{ fontSize: 12, color: "#64748B" }}>Age</span>
                  <span
                    className="bg-[#EEF1FF] text-[#3D5AF1] px-2 py-0.5 rounded-full"
                    style={{ fontSize: 11, fontWeight: 700 }}
                  >
                    {ageRange[0]} - {ageRange[1]}
                  </span>
                </div>
                <div className="relative h-4 flex items-center">
                  <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full" />
                  <div
                    className="absolute h-1.5 bg-[#3D5AF1] rounded-full"
                    style={{ left: "10%", right: "30%" }}
                  />
                  <div
                    className="absolute w-4 h-4 bg-white border-2 border-[#3D5AF1] rounded-full shadow-md"
                    style={{ left: "calc(10% - 8px)" }}
                  />
                  <div
                    className="absolute w-4 h-4 bg-[#3D5AF1] rounded-full shadow-md"
                    style={{ left: "calc(70% - 8px)" }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span style={{ fontSize: 10, color: "#94A3B8" }}>20</span>
                  <span style={{ fontSize: 10, color: "#94A3B8" }}>60</span>
                </div>
              </div>
            )}
          </div>

          {/* 기기 정보 */}
          <div className="rounded-xl overflow-hidden">
            <SectionHeader
              icon={<Smartphone size={14} />}
              title="기기 정보"
              open={openSections.device}
              onToggle={() => toggle("device")}
            />
            {openSections.device && (
              <div className="px-4 pb-4 flex flex-col gap-2">
                {(
                  [
                    { key: "s24ultra", label: "Galaxy S24 Ultra" },
                    { key: "zflip6", label: "Z Flip6" },
                    { key: "s23", label: "Galaxy S23" },
                  ] as { key: keyof typeof devices; label: string }[]
                ).map((d) => (
                  <label key={d.key} className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() =>
                        setDevices((p) => ({ ...p, [d.key]: !p[d.key] }))
                      }
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                        devices[d.key]
                          ? "bg-[#3D5AF1] border-[#3D5AF1]"
                          : "border-[#CBD5E1] bg-white"
                      }`}
                    >
                      {devices[d.key] && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      style={{ fontSize: 12, color: devices[d.key] ? "#1E293B" : "#94A3B8" }}
                    >
                      {d.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 세그먼트 */}
          <div className="rounded-xl overflow-hidden">
            <SectionHeader
              icon={<Tag size={14} />}
              title="세그먼트"
              open={openSections.segment}
              onToggle={() => toggle("segment")}
            />
            {openSections.segment && (
              <div className="px-4 pb-4 flex flex-wrap gap-1.5">
                {segments.map((s, i) => (
                  <span
                    key={i}
                    className="bg-[#EEF1FF] text-[#3D5AF1] border border-[#C7D2FE] px-2 py-0.5 rounded-full"
                    style={{ fontSize: 11, fontWeight: 500 }}
                  >
                    {s}
                  </span>
                ))}
                <span
                  className="bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] px-2 py-0.5 rounded-full"
                  style={{ fontSize: 11, fontWeight: 500 }}
                >
                  Gamer
                </span>
              </div>
            )}
          </div>

          {/* 앱 사용 이력 */}
          <div className="rounded-xl overflow-hidden">
            <SectionHeader
              icon={<History size={14} />}
              title="앱 사용 이력"
              open={openSections.appHistory}
              onToggle={() => toggle("appHistory")}
            />
            {openSections.appHistory && (
              <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                {(
                  [
                    { key: "game", label: "GAME" },
                    { key: "social", label: "SOCIAL" },
                    { key: "stores", label: "STORES" },
                  ] as { key: keyof typeof apps; label: string }[]
                ).map((a) => (
                  <label key={a.key} className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() =>
                        setApps((p) => ({ ...p, [a.key]: !p[a.key] }))
                      }
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                        apps[a.key]
                          ? "bg-[#3D5AF1] border-[#3D5AF1]"
                          : "border-[#CBD5E1] bg-white"
                      }`}
                    >
                      {apps[a.key] && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      style={{ fontSize: 12, color: apps[a.key] ? "#1E293B" : "#94A3B8" }}
                    >
                      {a.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto px-4 pb-6">
          <button className="w-full bg-[#3D5AF1] text-white rounded-lg py-2.5 flex items-center justify-center gap-2 shadow-md hover:bg-[#2B46D9] transition-colors">
            <RefreshCw size={14} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>필터 적용</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="mb-5">
          <p style={{ fontSize: 11, color: "#3D5AF1", fontWeight: 600, letterSpacing: "0.06em" }}>
            세그먼트 분석
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E293B", lineHeight: 1.3 }}>
            사용자 세그먼트 현황
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
            선택된 조건에 따른 실시간 사용자 분포를 확인합니다.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8ECF4] shadow-sm p-6 mb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <p style={{ fontSize: 13, color: "#64748B" }}>총 N수</p>
              <div className="flex items-end gap-2 mt-1">
                <span
                  style={{
                    fontSize: 44,
                    fontWeight: 800,
                    color: "#1E293B",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  12,847
                </span>
                <span style={{ fontSize: 18, color: "#64748B", marginBottom: 4 }}>명</span>
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 bg-[#3D5AF1] text-white px-3 py-1.5 rounded-full shadow-md">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span style={{ fontSize: 12, fontWeight: 600 }}>
                  실시간 업데이트 (Real-time Calculation)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div style={{ width: 180, height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      labelLine={false}
                      label={CUSTOM_LABEL}
                      strokeWidth={0}
                    >
                      {donutData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, ""]}
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #E8ECF4",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-[#3D5AF1]" />
                  <div>
                    <p style={{ fontSize: 12, color: "#64748B" }}>Premium</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "#3D5AF1" }}>78%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-[#CBD5E1]" />
                  <div>
                    <p style={{ fontSize: 12, color: "#64748B" }}>Standard</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "#94A3B8" }}>22%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <StatCard icon={<Users size={15} />} label="평균 연령" value="35" unit="세" />
          <StatCard icon={<Smartphone size={15} />} label="S24 시리즈 비율" value="78" unit="%" />
          <StatCard icon={<Activity size={15} />} label="게임 앱 활성 사용자" value="62" unit="%" />
        </div>

        <div className="bg-white rounded-2xl border border-[#E8ECF4] shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 size={15} className="text-[#3D5AF1]" />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>
              세그먼트 지표 요약
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { label: "Premium Buyer", value: 78, color: "#3D5AF1" },
              { label: "S24 시리즈 사용자", value: 78, color: "#6D7AF1" },
              { label: "게임 앱 활성", value: 62, color: "#A5B4FC" },
              { label: "Standard", value: 22, color: "#CBD5E1" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-1.5">
                  <span style={{ fontSize: 12, color: "#475569" }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#1E293B" }}>
                    {item.value}%
                  </span>
                </div>
                <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
