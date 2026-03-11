import type React from "react";
import { useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer, Cell,
  PieChart, Pie,
} from "recharts";
import {
  Sparkles, Send, ChevronRight, Download,
  FileText, Share2, Presentation, Database,
  TrendingUp, Users, BarChart2, Target,
  CheckCircle2, Zap, ArrowUpRight,
  Edit3, RotateCcw, Eye, Menu, X,
} from "lucide-react";
import { WorkflowStepper } from "@/components/layout/WorkflowStepper";

/* ─────────────────────────── DATA ─────────────────────────── */

const RADAR_DATA = [
  { subject: "성능",   Gamer: 85, General: 65 },
  { subject: "배터리", Gamer: 70, General: 75 },
  { subject: "카메라", Gamer: 80, General: 72 },
  { subject: "디자인", Gamer: 60, General: 68 },
  { subject: "가격",   Gamer: 50, General: 70 },
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

const PIE_DATA = [
  { name: "Gamer",         value: 38, color: "#5B7DFF" },
  { name: "Premium Buyer", value: 27, color: "#8B5CF6" },
  { name: "Early Adopter", value: 20, color: "#22C55E" },
  { name: "Value Seeker",  value: 15, color: "#F59E0B" },
];

const FINDINGS = [
  {
    rank: 1, color: "#5B7DFF", bg: "#EEF4FF",
    label: "구매 의향 최고 세그먼트", value: "30대 Gamer",
    delta: "+23%", deltaColor: "#16A34A",
    desc: "전체 평균 대비 구매 의향이 가장 높음",
    detail: "30대 Gamer 세그먼트는 성능과 카메라 속성에서 타 세그먼트 대비 평균 18pt 높은 선호도를 보입니다. 특히 야간 촬영과 AI 기능에 높은 반응률을 기록했습니다.",
  },
  {
    rank: 2, color: "#8B5CF6", bg: "#F5F3FF",
    label: "카메라 기능 우선 비율", value: "64.2%",
    delta: "+11%", deltaColor: "#16A34A",
    desc: "성능보다 카메라를 선호하는 응답자 비율",
    detail: "카메라 기능(64.2%)이 성능(55.8%)을 앞질러 최우선 구매 결정 요인으로 자리잡았습니다. 이는 전년 대비 11%p 상승한 수치입니다.",
  },
  {
    rank: 3, color: "#F59E0B", bg: "#FFFBEB",
    label: "가격 민감도 상위 그룹", value: "50대 General",
    delta: "−8%", deltaColor: "#EF4444",
    desc: "가격 요인이 구매 결정에 미치는 영향 최대",
    detail: "50대 General 세그먼트는 가격 요인 민감도가 가장 높으며, 구매 의향이 전체 평균 대비 8%p 낮습니다. 가성비 중심 마케팅 전략이 필요합니다.",
  },
];

const Q_DATA = [
  { q: "Q1. AI 카메라 기능 중요도", options: [{ label: "매우 중요", pct: 45 }, { label: "중요", pct: 30 }, { label: "보통", pct: 15 }, { label: "낮음", pct: 10 }] },
  { q: "Q2. 야간 촬영 기능 만족도", options: [{ label: "매우 만족", pct: 38 }, { label: "만족", pct: 34 }, { label: "보통", pct: 18 }, { label: "불만족", pct: 10 }] },
  { q: "Q3. 현재 기기 대비 업그레이드 의향", options: [{ label: "강함", pct: 52 }, { label: "있음", pct: 25 }, { label: "보통", pct: 14 }, { label: "없음", pct: 9 }] },
];

const SEG_COMPARE = [
  { seg: "Gamer",         성능: 85, 배터리: 70, 카메라: 80, 디자인: 60, 가격: 50, color: "#5B7DFF" },
  { seg: "Premium Buyer", 성능: 72, 배터리: 68, 카메라: 88, 디자인: 85, 가격: 40, color: "#8B5CF6" },
  { seg: "Early Adopter", 성능: 78, 배터리: 65, 카메라: 75, 디자인: 70, 가격: 55, color: "#22C55E" },
  { seg: "Value Seeker",  성능: 60, 배터리: 80, 카메라: 62, 디자인: 55, 가격: 88, color: "#F59E0B" },
];

const SECTIONS = [
  { id: "summary",  label: "Executive Summary", icon: "01" },
  { id: "findings", label: "Key Findings",       icon: "02" },
  { id: "detail",   label: "문항별 상세",         icon: "03" },
  { id: "segment",  label: "세그먼트 비교",        icon: "04" },
];

const THEME_COLORS = [
  "#5B7DFF", "#6D7AF1", "#8B5CF6", "#EC4899",
  "#22C55E", "#14B8A6", "#F59E0B", "#EF4444",
];

/* ─────────────────────── SHARED COMPONENTS ─────────────────────── */

type BlockProps = {
  selectedBlock: string | null;
  setSelectedBlock: (id: string | null) => void;
  onEdit: () => void;
};

function EditableBlock({
  id, blockProps, children,
}: { id: string; blockProps: BlockProps; children: React.ReactNode }) {
  const isSelected = blockProps.selectedBlock === id;
  return (
    <div className="relative">
      <div
        onClick={() => blockProps.setSelectedBlock(isSelected ? null : id)}
        className="cursor-pointer transition-all"
        style={{
          borderRadius: 16,
          boxShadow: isSelected ? "0 0 0 2px #5B7DFF" : "none",
        }}
      >
        {children}
      </div>
      {isSelected && (
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={(e) => { e.stopPropagation(); blockProps.onEdit(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5B7DFF] text-white rounded-xl hover:bg-[#4562E8] transition-colors"
            style={{ fontSize: 12, fontWeight: 700, boxShadow: "0 4px 14px #5B7DFF55" }}
          >
            <Edit3 size={12} /> 편집하기
          </button>
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon, label, value, delta, sub, accent }: {
  icon: React.ReactNode; label: string; value: string;
  delta?: string; sub?: string; accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E1E8F1] p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: accent + "18" }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
        {delta && (
          <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full" style={{
            fontSize: 11, fontWeight: 700,
            backgroundColor: delta.startsWith("+") ? "#F0FDF4" : "#FFF0F0",
            color: delta.startsWith("+") ? "#16A34A" : "#EF4444",
          }}>
            <ArrowUpRight size={10} style={{ transform: delta.startsWith("+") ? "none" : "rotate(90deg)" }} />
            {delta}
          </span>
        )}
      </div>
      <div>
        <p style={{ fontSize: 11, color: "#9BA6B8", fontWeight: 600, letterSpacing: "0.03em" }}>{label}</p>
        <p style={{ fontSize: 22, fontWeight: 800, color: "#1D1F3D", lineHeight: 1.2, marginTop: 2 }}>{value}</p>
        {sub && <p style={{ fontSize: 11, color: "#9BA6B8", marginTop: 3 }}>{sub}</p>}
      </div>
    </div>
  );
}

function SectionHeader({ num, title, badge }: { num: string; title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-7 h-7 rounded-lg bg-[#5B7DFF] flex items-center justify-center shrink-0">
        <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{num}</span>
      </div>
      <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1D1F3D" }}>{title}</h2>
      {badge && (
        <span className="ml-auto bg-[#EEF4FF] text-[#5B7DFF] border border-[#BFD4FF] px-2.5 py-0.5 rounded-full"
          style={{ fontSize: 11, fontWeight: 600 }}>{badge}</span>
      )}
    </div>
  );
}

/* ─────────────────────── SECTION VIEWS ─────────────────────── */

function SummaryView({ theme, blockProps }: { theme: string; blockProps: BlockProps }) {
  return (
    <div className="flex flex-col gap-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        <KpiCard icon={<Users size={16} />} label="총 응답자" value="1,248" sub="목표 대비 104.0%" delta="+4%" accent="#5B7DFF" />
        <KpiCard icon={<CheckCircle2 size={16} />} label="완료율" value="91.3%" sub="미완료 108명 제외" delta="+6%" accent="#22C55E" />
        <KpiCard icon={<Target size={16} />} label="평균 구매 의향" value="68.7%" sub="전월 대비" delta="+12%" accent="#8B5CF6" />
        <KpiCard icon={<TrendingUp size={16} />} label="핵심 인사이트" value="3건" sub="AI 자동 추출" accent="#F59E0B" />
      </div>

      {/* Charts */}
      <EditableBlock id="summary-charts" blockProps={blockProps}>
        <div className="bg-white rounded-2xl border border-[#E1E8F1] shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
            <SectionHeader num="01" title="Executive Summary" badge="세그먼트 × 속성 비교" />
          </div>
          <div className="p-5 grid grid-cols-2 gap-5">
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#3C4556", marginBottom: 4 }}>속성별 선호도 — 방사형</p>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={RADAR_DATA} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                    <PolarGrid stroke="#F1F5F9" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#7C8397" }} />
                    <PolarRadiusAxis angle={72} domain={[0, 100]} tick={{ fontSize: 9, fill: "#DCE4F3" }} axisLine={false} />
                    <Radar name="Gamer" dataKey="Gamer" stroke={theme} fill={theme} fillOpacity={0.2} strokeWidth={2.5} dot={{ r: 4, fill: theme, strokeWidth: 0 }} />
                    <Radar name="General" dataKey="General" stroke="#DCE4F3" fill="#DCE4F3" fillOpacity={0.12} strokeWidth={1.5} strokeDasharray="5 3" dot={{ r: 3, fill: "#9BA6B8", strokeWidth: 0 }} />
                    <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E1E8F1", fontSize: 12, boxShadow: "0 4px 16px #0001" }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#3C4556", marginBottom: 4 }}>연령별 구매 의향 비교 — 막대</p>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={BAR_DATA} barGap={4} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#7C8397" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#DCE4F3" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E1E8F1", fontSize: 12, boxShadow: "0 4px 16px #0001" }} />
                    <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Gamer" fill={theme} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="General" fill="#DCE4F3" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </EditableBlock>

      {/* Summary text */}
      <EditableBlock id="summary-text" blockProps={blockProps}>
        <div className="bg-white rounded-2xl border border-[#E1E8F1] shadow-sm p-5">
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1D1F3D", marginBottom: 10 }}>종합 요약</p>
          <div className="flex flex-col gap-3">
            {[
              "S25 AI 카메라 기능 선호도 조사에 총 1,248명이 참여하여 목표 대비 104%를 달성했습니다.",
              "30대 Gamer 세그먼트의 구매 의향이 가장 높으며, 성능과 카메라를 핵심 구매 요인으로 꼽았습니다.",
              "전체 응답자의 64.2%가 카메라 기능을 최우선 구매 결정 요인으로 선택했습니다.",
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#EEF4FF] flex items-center justify-center shrink-0 mt-0.5">
                  <span style={{ fontSize: 9, fontWeight: 800, color: "#5B7DFF" }}>{i + 1}</span>
                </div>
                <p style={{ fontSize: 13, color: "#3C4556", lineHeight: 1.7 }}>{t}</p>
              </div>
            ))}
          </div>
        </div>
      </EditableBlock>
    </div>
  );
}

function FindingsView({ theme, aiInput, setAiInput, aiMessages, sendAiMessage }: {
  theme: string;
  aiInput: string;
  setAiInput: (v: string) => void;
  aiMessages: { role: string; text: string }[];
  sendAiMessage: () => void;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-5">
      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard icon={<TrendingUp size={16} />} label="핵심 인사이트" value="3건" sub="AI 자동 추출" accent="#5B7DFF" />
        <KpiCard icon={<ArrowUpRight size={16} />} label="최대 상승 지표" value="+23%" sub="30대 Gamer 구매 의향" delta="+23%" accent="#22C55E" />
        <KpiCard icon={<Target size={16} />} label="주요 타겟 세그먼트" value="Gamer" sub="우선 공략 권장 그룹" accent="#8B5CF6" />
      </div>

      {/* Findings Cards */}
      <div className="bg-white rounded-2xl border border-[#E1E8F1] shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
          <SectionHeader num="02" title="Key Findings" badge="AI 자동 추출 3건" />
        </div>
        <div className="p-5 flex flex-col gap-3">
          {FINDINGS.map((f) => (
            <div
              key={f.rank}
              className="rounded-xl border overflow-hidden transition-all"
              style={{ borderColor: expanded === f.rank ? f.color + "60" : "#E1E8F1" }}
            >
              <button
                className="w-full flex items-center gap-4 p-4 hover:bg-[#FAFBFF] transition-colors text-left"
                onClick={() => setExpanded(expanded === f.rank ? null : f.rank)}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: f.bg }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: f.color }}>#{f.rank}</span>
                </div>
                <div className="flex-1">
                  <p style={{ fontSize: 12, color: "#9BA6B8", fontWeight: 600 }}>{f.label}</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "#1D1F3D" }}>{f.value}</p>
                  <p style={{ fontSize: 11, color: "#9BA6B8", marginTop: 2 }}>{f.desc}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full"
                    style={{ backgroundColor: f.deltaColor === "#16A34A" ? "#F0FDF4" : "#FFF0F0", color: f.deltaColor, fontSize: 13, fontWeight: 800 }}>
                    {f.delta}
                  </div>
                  <ChevronRight size={14} className="text-[#DCE4F3] transition-transform"
                    style={{ transform: expanded === f.rank ? "rotate(90deg)" : "none" }} />
                </div>
              </button>
              {expanded === f.rank && (
                <div className="px-5 pb-4 pt-1 border-t border-[#F1F5F9]" style={{ backgroundColor: f.bg + "40" }}>
                  <p style={{ fontSize: 13, color: "#3C4556", lineHeight: 1.75 }}>{f.detail}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Insight */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ borderColor: "#BFD4FF", background: "linear-gradient(135deg, #EEF4FF 0%, #F5F3FF 100%)" }}>
        <div className="px-5 py-4 flex items-start gap-3 border-b" style={{ borderColor: "#BFD4FF50" }}>
          <div className="w-8 h-8 rounded-xl bg-[#5B7DFF] flex items-center justify-center shrink-0"
            style={{ boxShadow: "0 4px 12px #5B7DFF40" }}>
            <Sparkles size={15} className="text-white" />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#5B7DFF" }}>AI 분석 인사이트</p>
            <p style={{ fontSize: 12, color: "#6366F1", marginTop: 2, lineHeight: 1.6 }}>추가 분석을 요청해보세요.</p>
          </div>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          {aiMessages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {msg.role === "ai" && (
                <div className="w-6 h-6 rounded-full bg-[#5B7DFF] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={11} className="text-white" />
                </div>
              )}
              <div className="px-3 py-2 rounded-xl max-w-[85%]" style={{
                fontSize: 12, lineHeight: 1.6,
                backgroundColor: msg.role === "ai" ? "white" : "#5B7DFF",
                color: msg.role === "ai" ? "#1D1F3D" : "white",
                border: msg.role === "ai" ? "1px solid #E1E8F1" : "none",
                boxShadow: msg.role === "ai" ? "0 2px 8px #0000000A" : "0 4px 12px #5B7DFF30",
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 flex items-center gap-2 bg-white border border-[#BFD4FF] rounded-xl px-3 py-2.5 shadow-sm">
              <input
                className="flex-1 bg-transparent outline-none text-[#1D1F3D] placeholder:text-[#BFD4FF]"
                style={{ fontSize: 12 }}
                placeholder="AI에게 추가 분석을 요청하세요..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendAiMessage()}
              />
            </div>
            <button onClick={sendAiMessage}
              className="w-9 h-9 rounded-xl bg-[#5B7DFF] hover:bg-[#4562E8] flex items-center justify-center transition-colors"
              style={{ boxShadow: "0 4px 12px #5B7DFF30" }}>
              <Send size={14} className="text-white" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["30대 Gamer 상세 분석", "가격 민감도 요인 분석", "경쟁 모델 비교"].map((prompt) => (
              <button key={prompt} onClick={() => setAiInput(prompt)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#BFD4FF] hover:bg-[#EEF4FF] transition-colors"
                style={{ fontSize: 11, color: "#5B7DFF", fontWeight: 600 }}>
                <Zap size={9} />{prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailView({ theme, blockProps }: { theme: string; blockProps: BlockProps }) {
  const [activeQ, setActiveQ] = useState(0);
  return (
    <div className="flex flex-col gap-5">
      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard icon={<BarChart2 size={16} />} label="총 문항 수" value="12문항" sub="단일/복수 선택 포함" accent="#5B7DFF" />
        <KpiCard icon={<CheckCircle2 size={16} />} label="평균 응답 시간" value="4분 32초" sub="전월 대비 −18초" delta="+6%" accent="#22C55E" />
        <KpiCard icon={<TrendingUp size={16} />} label="이탈률" value="8.7%" sub="3문항 이후 급감" accent="#EF4444" />
      </div>

      {/* Line + Pie */}
      <EditableBlock id="detail-charts" blockProps={blockProps}>
        <div className="bg-white rounded-2xl border border-[#E1E8F1] shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
            <SectionHeader num="03" title="문항별 상세" badge="추이 & 세그먼트 구성" />
          </div>
          <div className="p-5 grid grid-cols-5 gap-5">
            <div className="col-span-3">
              <p style={{ fontSize: 12, fontWeight: 700, color: "#3C4556", marginBottom: 4 }}>주차별 구매 의향 추이</p>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={LINE_DATA} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#7C8397" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[40, 90]} tick={{ fontSize: 10, fill: "#DCE4F3" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E1E8F1", fontSize: 12, boxShadow: "0 4px 16px #0001" }} />
                    <Line type="monotone" dataKey="intent" stroke={theme} strokeWidth={2.5}
                      dot={{ r: 4, fill: theme, strokeWidth: 0 }} activeDot={{ r: 6, fill: theme }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="col-span-2 flex flex-col">
              <p style={{ fontSize: 12, fontWeight: 700, color: "#3C4556", marginBottom: 4 }}>세그먼트 구성 비율</p>
              <div style={{ height: 150 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="value">
                      {PIE_DATA.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E1E8F1", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1.5 mt-2">
                {PIE_DATA.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span style={{ fontSize: 11, color: "#7C8397", flex: 1 }}>{d.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1D1F3D" }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </EditableBlock>

      {/* Question-by-question */}
      <EditableBlock id="detail-qna" blockProps={blockProps}>
        <div className="bg-white rounded-2xl border border-[#E1E8F1] shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
            <p style={{ fontSize: 14, fontWeight: 800, color: "#1D1F3D" }}>문항별 응답 분포</p>
          </div>
          {/* Tab */}
          <div className="flex border-b border-[#F1F5F9]">
            {Q_DATA.map((q, i) => (
              <button key={i} onClick={() => setActiveQ(i)}
                className={`px-4 py-3 transition-colors border-b-2 ${activeQ === i ? "border-[#5B7DFF] text-[#5B7DFF]" : "border-transparent text-[#9BA6B8] hover:text-[#3C4556]"}`}
                style={{ fontSize: 12, fontWeight: activeQ === i ? 700 : 500 }}>
                Q{i + 1}
              </button>
            ))}
          </div>
          <div className="p-5">
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1D1F3D", marginBottom: 16 }}>
              {Q_DATA[activeQ].q}
            </p>
            <div className="flex flex-col gap-3">
              {Q_DATA[activeQ].options.map((opt) => (
                <div key={opt.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: 12, color: "#3C4556" }}>{opt.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1D1F3D" }}>{opt.pct}%</span>
                  </div>
                  <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${opt.pct}%`, backgroundColor: theme }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </EditableBlock>
    </div>
  );
}

function SegmentView({ theme, blockProps }: { theme: string; blockProps: BlockProps }) {
  const [activeAttr, setActiveAttr] = useState<string>("카메라");
  const attrs = ["성능", "배터리", "카메라", "디자인", "가격"];

  return (
    <div className="flex flex-col gap-5">
      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3">
        <KpiCard icon={<Users size={16} />} label="비교 세그먼트" value="4개" sub="Gamer, Premium, EA, VS" accent="#5B7DFF" />
        <KpiCard icon={<Target size={16} />} label="최고 카메라 선호" value="Premium" sub="88pt / 100" delta="+8%" accent="#8B5CF6" />
        <KpiCard icon={<TrendingUp size={16} />} label="최고 가격 민감도" value="Value Seeker" sub="88pt / 100" accent="#F59E0B" />
        <KpiCard icon={<BarChart2 size={16} />} label="Gamer 성능 점수" value="85pt" sub="전체 1위" delta="+13%" accent="#22C55E" />
      </div>

      {/* Radar 비교 */}
      <EditableBlock id="segment-radar" blockProps={blockProps}>
        <div className="bg-white rounded-2xl border border-[#E1E8F1] shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
            <SectionHeader num="04" title="세그먼트 비교" badge="4개 세그먼트 전체 속성" />
          </div>
          <div className="p-5 grid grid-cols-2 gap-5">
            {/* Multi Radar */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#3C4556", marginBottom: 4 }}>세그먼트별 전체 속성 비교</p>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    data={attrs.map((a) => {
                      const row: Record<string, string | number> = { subject: a };
                      SEG_COMPARE.forEach((s) => { row[s.seg] = (s as any)[a]; });
                      return row;
                    })}
                    margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
                  >
                    <PolarGrid stroke="#F1F5F9" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#7C8397" }} />
                    <PolarRadiusAxis angle={72} domain={[0, 100]} tick={{ fontSize: 9, fill: "#DCE4F3" }} axisLine={false} />
                    {SEG_COMPARE.map((s) => (
                      <Radar key={s.seg} name={s.seg} dataKey={s.seg}
                        stroke={s.color} fill={s.color} fillOpacity={0.08} strokeWidth={1.8}
                        dot={{ r: 3, fill: s.color, strokeWidth: 0 }} />
                    ))}
                    <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E1E8F1", fontSize: 12, boxShadow: "0 4px 16px #0001" }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Attribute Bar */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#3C4556", marginBottom: 8 }}>속성별 세그먼트 점수</p>
              <div className="flex gap-1.5 flex-wrap mb-4">
                {attrs.map((a) => (
                  <button key={a} onClick={() => setActiveAttr(a)}
                    className="px-2.5 py-1 rounded-full border transition-colors"
                    style={{
                      fontSize: 11, fontWeight: activeAttr === a ? 700 : 500,
                      backgroundColor: activeAttr === a ? "#EEF4FF" : "#F7FAFF",
                      borderColor: activeAttr === a ? "#BFD4FF" : "#E1E8F1",
                      color: activeAttr === a ? "#5B7DFF" : "#9BA6B8",
                    }}>
                    {a}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                {SEG_COMPARE
                  .slice()
                  .sort((a, b) => (b as any)[activeAttr] - (a as any)[activeAttr])
                  .map((s, i) => (
                    <div key={s.seg}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                          <span style={{ fontSize: 12, color: "#3C4556" }}>{s.seg}</span>
                          {i === 0 && (
                            <span className="px-1.5 py-0.5 rounded text-white" style={{ fontSize: 9, fontWeight: 700, backgroundColor: s.color }}>
                              1위
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#1D1F3D" }}>{(s as any)[activeAttr]}pt</span>
                      </div>
                      <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${(s as any)[activeAttr]}%`, backgroundColor: s.color }} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </EditableBlock>

      {/* Segment detail table */}
      <EditableBlock id="segment-table" blockProps={blockProps}>
        <div className="bg-white rounded-2xl border border-[#E1E8F1] shadow-sm overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-[#F1F5F9]">
            <p style={{ fontSize: 14, fontWeight: 800, color: "#1D1F3D" }}>세그먼트 상세 스코어카드</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F7FAFF]">
                  <th className="text-left px-5 py-3" style={{ fontSize: 11, fontWeight: 700, color: "#9BA6B8" }}>세그먼트</th>
                  {attrs.map((a) => (
                    <th key={a} className="text-center px-3 py-3" style={{ fontSize: 11, fontWeight: 700, color: "#9BA6B8" }}>{a}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SEG_COMPARE.map((s, i) => (
                  <tr key={s.seg} className={i % 2 === 0 ? "bg-white" : "bg-[#FAFBFF]"}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#1D1F3D" }}>{s.seg}</span>
                      </div>
                    </td>
                    {attrs.map((a) => {
                      const val = (s as any)[a];
                      const isMax = SEG_COMPARE.every((x) => (x as any)[a] <= val) &&
                        SEG_COMPARE.filter((x) => (x as any)[a] === val).length === 1;
                      return (
                        <td key={a} className="text-center px-3 py-3">
                          <span className={`px-2 py-0.5 rounded-lg`} style={{
                            fontSize: 12, fontWeight: 700,
                            backgroundColor: isMax ? s.color + "18" : "transparent",
                            color: isMax ? s.color : "#3C4556",
                          }}>
                            {val}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </EditableBlock>
    </div>
  );
}

/* ─────────────────────────── PAGE ─────────────────────────── */

export const ReportPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState("summary");
  const [selectedTheme, setSelectedTheme] = useState("#5B7DFF");
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    { role: "ai", text: "샘플로 교차 분석을 완료했습니다. 30대 게이머 세그먼트의 구매 의향이 전체 평균 대비 23% 높게 나타났습니다." },
  ]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [editPanelOpen, setEditPanelOpen] = useState(false);

  const blockProps: BlockProps = {
    selectedBlock,
    setSelectedBlock,
    onEdit: () => setEditPanelOpen(true),
  };

  const sendAiMessage = () => {
    const text = aiInput.trim();
    if (!text) return;
    setAiMessages((p) => [
      ...p,
      { role: "user", text },
      { role: "ai", text: `"${text}"에 대한 추가 분석을 요청했습니다. 잠시 후 결과를 확인하세요.` },
    ]);
    setAiInput("");
  };

  const currentSection = SECTIONS.find((s) => s.id === activeSection)!;

  return (
    <div className="flex-1 flex flex-col bg-[#EEF2FA] overflow-hidden">
      <WorkflowStepper currentPath="/report" />

      {/* ─── Page Header ─── */}
      <div className="bg-white border-b border-[#E1E8F1] px-6 pt-5 pb-4 flex items-center justify-between shrink-0">
        <div>
          <p style={{ fontSize: 11, color: "#5B7DFF", fontWeight: 600, letterSpacing: "0.06em" }}>
            REPORT
          </p>
          <div className="mt-1 flex items-center gap-2">
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1D1F3D", lineHeight: 1.3 }}>분석 결과 리포트</h1>
            <span className="flex items-center gap-1.5 bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] px-2.5 py-0.5 rounded-full"
              style={{ fontSize: 11, fontWeight: 700 }}>
              <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full" />
              분석 완료
            </span>
          </div>
          <p style={{ fontSize: 13, color: "#7C8397", marginTop: 4 }}>
            S25 AI 카메라 기능 선호도 조사 - 총 1,248명 응답 기반 결과를 편집 가능한 리포트로 구성합니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Hamburger: Edit & Visualize */}
          <button
            onClick={() => setEditPanelOpen((p) => !p)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-colors"
            style={{
              fontSize: 12, fontWeight: 600,
              borderColor: editPanelOpen ? "#BFD4FF" : "#E1E8F1",
              backgroundColor: editPanelOpen ? "#EEF4FF" : "#EEF2FA",
              color: editPanelOpen ? "#5B7DFF" : "#3C4556",
            }}>
            {editPanelOpen ? <X size={14} /> : <Menu size={14} />}
            <span>Edit & Visualize</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E1E8F1] bg-[#EEF2FA] hover:bg-[#EEF4FF] hover:border-[#BFD4FF] transition-colors"
            style={{ fontSize: 12, fontWeight: 600, color: "#3C4556" }}>
            <Share2 size={13} />공유
          </button>
          <div className="relative">
            <button onClick={() => setShowExportMenu((p) => !p)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B7DFF] text-white hover:bg-[#4562E8] transition-colors"
              style={{ fontSize: 12, fontWeight: 700, boxShadow: "0 4px 12px #5B7DFF30" }}>
              <Download size={13} />내보내기
              <ChevronRight size={12} className={`transition-transform ${showExportMenu ? "rotate-90" : ""}`} />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-10 z-20 bg-white rounded-2xl border border-[#E1E8F1] shadow-xl py-2 w-52">
                {[
                  { icon: <Presentation size={14} className="text-[#E03E2D]" />, label: "PPT 슬라이드", sub: "Standard Template" },
                  { icon: <FileText size={14} className="text-[#5B7DFF]" />, label: "PDF 리포트", sub: "Full Report" },
                  { icon: <Database size={14} className="text-[#16A34A]" />, label: "Raw Data", sub: "Excel / CSV" },
                  { icon: <Share2 size={14} className="text-[#8B5CF6]" />, label: "웹 링크 공유", sub: "공개 URL 생성" },
                ].map((item) => (
                  <button key={item.label} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#EEF2FA] transition-colors"
                    onClick={() => setShowExportMenu(false)}>
                    <div className="w-7 h-7 rounded-lg bg-[#EEF2FA] flex items-center justify-center shrink-0">{item.icon}</div>
                    <div className="text-left">
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#1D1F3D" }}>{item.label}</p>
                      <p style={{ fontSize: 10, color: "#9BA6B8" }}>{item.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Body ─── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left TOC */}
        <aside className="w-52 bg-white border-r border-[#E1E8F1] flex flex-col py-5 shrink-0">
          <p className="px-5 mb-4" style={{ fontSize: 10, color: "#9BA6B8", fontWeight: 700, letterSpacing: "0.08em" }}>
            CONTENTS
          </p>
          <div className="flex flex-col gap-1 px-3">
            {SECTIONS.map((s) => {
              const active = activeSection === s.id;
              return (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className={`w-full text-left px-3 py-3 rounded-xl transition-all flex items-center gap-3 ${active ? "bg-[#EEF4FF]" : "hover:bg-[#EEF2FA]"}`}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                    style={{ backgroundColor: active ? "#5B7DFF" : "#F1F5F9" }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: active ? "#fff" : "#9BA6B8" }}>{s.icon}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? "#5B7DFF" : "#7C8397", lineHeight: 1.3 }}>
                    {s.label}
                  </span>
                  {active && <div className="ml-auto w-1.5 h-1.5 bg-[#5B7DFF] rounded-full" />}
                </button>
              );
            })}
          </div>

          {/* Progress */}
          <div className="mt-auto mx-3 mb-2 bg-[#EEF2FA] rounded-xl p-3 border border-[#E1E8F1]">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={13} className="text-[#22C55E]" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#1D1F3D" }}>분석 완료</span>
            </div>
            <div className="w-full h-1.5 bg-[#DCE4F3] rounded-full overflow-hidden">
              <div className="h-full bg-[#5B7DFF] rounded-full" style={{ width: "100%" }} />
            </div>
            <p style={{ fontSize: 10, color: "#9BA6B8", marginTop: 6 }}>4/4 섹션 분석됨</p>
          </div>
        </aside>

        {/* ─── Main + Right ─── */}
        <div className="flex-1 flex overflow-hidden">

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {activeSection === "summary" && <SummaryView theme={selectedTheme} blockProps={blockProps} />}
            {activeSection === "findings" && (
              <FindingsView
                theme={selectedTheme}
                aiInput={aiInput}
                setAiInput={setAiInput}
                aiMessages={aiMessages}
                sendAiMessage={sendAiMessage}
              />
            )}
            {activeSection === "detail"   && <DetailView theme={selectedTheme} blockProps={blockProps} />}
            {activeSection === "segment"  && <SegmentView theme={selectedTheme} blockProps={blockProps} />}
          </div>

          {/* Edit & Visualize Panel — only visible when editPanelOpen */}
          {editPanelOpen && (
          <aside className="w-56 bg-white border-l border-[#E1E8F1] flex flex-col shrink-0 overflow-y-auto">
            <div className="px-4 pt-5 pb-3 border-b border-[#F1F5F9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#EEF4FF] flex items-center justify-center">
                  <Edit3 size={12} className="text-[#5B7DFF]" />
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: "#1D1F3D" }}>Edit & Visualize</h3>
              </div>
              <button onClick={() => setEditPanelOpen(false)}
                className="w-6 h-6 rounded-lg hover:bg-[#EEF2FA] flex items-center justify-center transition-colors">
                <X size={12} className="text-[#9BA6B8]" />
              </button>
            </div>
            {selectedBlock && (
              <div className="mx-4 mt-3 px-3 py-2 bg-[#EEF4FF] border border-[#BFD4FF] rounded-xl">
                <p style={{ fontSize: 10, fontWeight: 700, color: "#5B7DFF", marginBottom: 2 }}>선택된 블록</p>
                <p style={{ fontSize: 11, color: "#3C4556" }}>{selectedBlock}</p>
              </div>
            )}
            <div className="px-4 py-4 flex flex-col gap-5">

              {/* Preview */}
              <div className="rounded-xl overflow-hidden border border-[#E1E8F1]">
                <div className="bg-[#F7FAFF] px-3 py-2 border-b border-[#E1E8F1] flex items-center justify-between">
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#9BA6B8", letterSpacing: "0.04em" }}>PREVIEW</span>
                  <Eye size={11} className="text-[#DCE4F3]" />
                </div>
                <div className="bg-white p-3 flex flex-col gap-2">
                  <div className="flex items-end gap-1 h-14">
                    {[55, 80, 65, 90, 70].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t transition-all"
                        style={{ height: `${h}%`, backgroundColor: i % 2 === 0 ? selectedTheme : selectedTheme + "40" }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedTheme }} />
                      <span style={{ fontSize: 9, color: "#9BA6B8" }}>Gamer</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedTheme + "40" }} />
                      <span style={{ fontSize: 9, color: "#9BA6B8" }}>General</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Theme Color */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#9BA6B8", letterSpacing: "0.06em", marginBottom: 8 }}>포인트 컬러</p>
                <div className="grid grid-cols-4 gap-2">
                  {THEME_COLORS.map((color) => (
                    <button key={color} onClick={() => setSelectedTheme(color)}
                      className="w-full aspect-square rounded-lg transition-all hover:scale-110 relative"
                      style={{ backgroundColor: color }}>
                      {selectedTheme === color && (
                        <div className="absolute inset-0 rounded-lg flex items-center justify-center bg-black/20">
                          <div className="w-3 h-3 bg-white rounded-full" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Section Info */}
              <div className="rounded-xl bg-[#EEF2FA] border border-[#E1E8F1] p-3">
                <p style={{ fontSize: 10, fontWeight: 700, color: "#9BA6B8", letterSpacing: "0.04em", marginBottom: 6 }}>현재 섹션</p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#5B7DFF] flex items-center justify-center">
                    <span style={{ fontSize: 8, fontWeight: 800, color: "#fff" }}>{currentSection.icon}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1D1F3D" }}>{currentSection.label}</span>
                </div>
                <div className="mt-2 flex flex-col gap-1">
                  {SECTIONS.map((s) => (
                    <div key={s.id} className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${s.id === activeSection ? "bg-[#5B7DFF]" : "bg-[#DCE4F3]"}`} />
                      <span style={{ fontSize: 10, color: s.id === activeSection ? "#5B7DFF" : "#DCE4F3", fontWeight: s.id === activeSection ? 700 : 400 }}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <button onClick={() => setSelectedTheme("#5B7DFF")}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#E1E8F1] hover:bg-[#EEF2FA] transition-colors"
                style={{ fontSize: 11, fontWeight: 600, color: "#9BA6B8" }}>
                <RotateCcw size={11} />기본값으로 초기화
              </button>
            </div>
          </aside>
          )}
        </div>
      </div>
    </div>
  );
}
