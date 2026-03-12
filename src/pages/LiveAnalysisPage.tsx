import type React from "react";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Brain, Clock3, Pause, Play, Target, Users, Zap,
} from "lucide-react";
import { WorkflowStepper } from "@/components/layout/WorkflowStepper";

const TOTAL_PERSONAS = 30000;

const INITIAL_QUESTION_RESULTS = [
  {
    id: "Q1",
    text: "S25 AI 카메라 기능을 알고 계십니까?",
    insightTitle: "인지 수준 해석",
    insightSummary: "`잘 알고 있다`와 `어느 정도 안다` 응답이 높으면 기능 인지도는 충분히 형성된 상태로 볼 수 있습니다.",
    insightAction: "인지율이 높아질수록 기능 설명보다 체감 효용 중심 메시지가 더 유효합니다.",
    caution: "하위 응답 비중이 커지면 기능 설명 자체가 아직 충분히 전달되지 않았을 가능성을 봐야 합니다.",
    data: [
      { label: "잘 알고 있다", value: 41 },
      { label: "어느 정도 안다", value: 32 },
      { label: "들어본 적 있다", value: 18 },
      { label: "모른다", value: 9 },
    ],
  },
  {
    id: "Q2",
    text: "현재 사용 중인 카메라 기능 만족도는 어떻습니까?",
    insightTitle: "만족도 해석",
    insightSummary: "만족 응답이 우세하면 현재 경험 기반으로 다음 제품 기대치도 함께 높아질 가능성이 큽니다.",
    insightAction: "만족층에는 개선 포인트보다 차세대 기능 차별점을 강조하는 편이 효과적입니다.",
    caution: "불만족 비중이 커지면 신규 기능 소개보다 기존 불편 해소 메시지가 먼저 필요합니다.",
    data: [
      { label: "매우 만족", value: 28 },
      { label: "만족", value: 35 },
      { label: "보통", value: 22 },
      { label: "불만족", value: 9 },
      { label: "매우 불만족", value: 6 },
    ],
  },
  {
    id: "Q3",
    text: "S25 AI 카메라 기능이 구매 의향에 영향을 미칩니까?",
    insightTitle: "구매 영향 해석",
    insightSummary: "`매우 그렇다`와 `그렇다` 비중이 높으면 AI 카메라가 실제 구매 유인으로 작동하는 흐름입니다.",
    insightAction: "광고 메시지는 AI 자체보다 구매 전환을 일으키는 체감 장면 중심으로 설계하는 것이 유리합니다.",
    caution: "`보통이다` 이하 비중이 커지면 기술 호감이 실제 전환으로 이어지지 않는 구간을 별도로 봐야 합니다.",
    data: [
      { label: "매우 그렇다", value: 45 },
      { label: "그렇다", value: 30 },
      { label: "보통이다", value: 15 },
      { label: "그렇지 않다", value: 7 },
      { label: "전혀 그렇지 않다", value: 3 },
    ],
  },
  {
    id: "Q4",
    text: "가장 기대되는 AI 카메라 기능은 무엇입니까?",
    insightTitle: "기대 기능 해석",
    insightSummary: "상위 기능에 응답이 몰리면 커뮤니케이션 우선순위가 비교적 명확하게 형성된 상태입니다.",
    insightAction: "상위 1~2개 기능을 메인 메시지로 잡고 나머지는 보조 포인트로 두는 것이 좋습니다.",
    caution: "상위 응답이 비슷하게 분산되면 단일 기능 강조보다 상황별 사용 시나리오 제시가 더 적합할 수 있습니다.",
    data: [
      { label: "야간 촬영", value: 32 },
      { label: "줌 기능", value: 28 },
      { label: "화질 개선", value: 21 },
      { label: "AI 편집", value: 14 },
      { label: "기타", value: 5 },
    ],
  },
  {
    id: "Q5",
    text: "S25 출시 후 6개월 내 구매 의향이 있으십니까?",
    insightTitle: "전환 가능성 해석",
    insightSummary: "`있다` 응답이 높더라도 `고려 중` 비중이 두꺼우면 설득 여지가 큰 전환 구간으로 볼 수 있습니다.",
    insightAction: "가격, 차별점, 출시 초기 혜택 같은 추가 자극이 전환율에 직접 영향을 줄 수 있습니다.",
    caution: "`없다` 비중이 커질 경우에는 메시지 보강만으로 해결되지 않는 구조적 저항 요인이 있는지 확인이 필요합니다.",
    data: [
      { label: "있다", value: 56 },
      { label: "고려 중", value: 28 },
      { label: "없다", value: 16 },
    ],
  },
];

const KEYWORDS = [
  { text: "야간 촬영", weight: 9, top: "22%", left: "28%", delta: "+1.2%p", trend: "up" },
  { text: "줌 기능", weight: 8, top: "56%", left: "34%", delta: "+0.8%p", trend: "up" },
  { text: "화질 개선", weight: 7, top: "18%", left: "62%", delta: "+0.5%p", trend: "up" },
  { text: "AI 편집", weight: 6, top: "70%", left: "60%", delta: "+0.3%p", trend: "up" },
  { text: "저조도", weight: 5, top: "45%", left: "16%", delta: "+0.4%p", trend: "up" },
  { text: "배터리", weight: 4, top: "78%", left: "20%", delta: "-0.1%p", trend: "down" },
  { text: "가격", weight: 4, top: "76%", left: "77%", delta: "+0.6%p", trend: "up" },
  { text: "브랜드 신뢰", weight: 5, top: "40%", left: "72%", delta: "+0.2%p", trend: "up" },
];

const WORD_STYLES: Record<number, { fontSize: number; color: string; weight: number }> = {
  9: { fontSize: 29, color: "#1D4ED8", weight: 800 },
  8: { fontSize: 23, color: "#2563EB", weight: 800 },
  7: { fontSize: 19, color: "#3B82F6", weight: 700 },
  6: { fontSize: 16, color: "#4F46E5", weight: 700 },
  5: { fontSize: 14, color: "#5B7DFF", weight: 600 },
  4: { fontSize: 12, color: "#7C3AED", weight: 600 },
};

const BAR_COLORS = ["#5B7DFF", "#7C3AED", "#818CF8", "#A5B4FC", "#C7D2FE"];

type QuestionResult = (typeof INITIAL_QUESTION_RESULTS)[number];

function KpiCard({ label, value, sub, icon, color, bg }: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <div className="app-stat-card flex items-center gap-3 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: bg }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p style={{ fontSize: 11, color: "#9BA6B8", fontWeight: 600 }}>{label}</p>
        <p style={{ fontSize: 20, fontWeight: 800, color: "#1D1F3D", lineHeight: 1.2 }}>{value}</p>
        <p style={{ fontSize: 11, color, fontWeight: 600, marginTop: 2 }}>{sub}</p>
      </div>
    </div>
  );
}

function nudgeQuestionResults(results: QuestionResult[]) {
  return results.map((question) => {
    const cloned = question.data.map((item) => ({ ...item }));
    if (cloned.length === 0) return question;

    const selectedIndex = Math.floor(Math.random() * cloned.length);
    const direction = Math.random() > 0.35 ? 1 : -1;
    const magnitude = Math.random() > 0.55 ? 1 : 0;
    const nextValue = Math.max(2, Math.min(80, cloned[selectedIndex].value + direction * magnitude));
    const diff = nextValue - cloned[selectedIndex].value;
    cloned[selectedIndex].value = nextValue;

    if (diff !== 0) {
      const redistributeIndex = cloned.findIndex((_, index) => index !== selectedIndex);
      if (redistributeIndex >= 0) {
        cloned[redistributeIndex].value = Math.max(1, cloned[redistributeIndex].value - diff);
      }
    }

    return { ...question, data: cloned };
  });
}

export const LiveAnalysisPage: React.FC = () => {
  const [isLive, setIsLive] = useState(true);
  const [completed, setCompleted] = useState(13241);
  const [purchaseIntent, setPurchaseIntent] = useState(56);
  const [positiveRatio, setPositiveRatio] = useState(61);
  const [questionResults, setQuestionResults] = useState(INITIAL_QUESTION_RESULTS);
  const [activeQuestion, setActiveQuestion] = useState(2);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setCompleted((prev) => Math.min(TOTAL_PERSONAS, prev + Math.floor(Math.random() * 150 + 40)));
      setPurchaseIntent((prev) => Math.max(45, Math.min(68, prev + (Math.random() > 0.5 ? 1 : 0) - (Math.random() > 0.88 ? 1 : 0))));
      setPositiveRatio((prev) => Math.max(50, Math.min(74, prev + (Math.random() > 0.55 ? 1 : 0) - (Math.random() > 0.9 ? 1 : 0))));
      setQuestionResults((prev) => nudgeQuestionResults(prev));
    }, 2800);

    return () => clearInterval(interval);
  }, [isLive, completed, positiveRatio, purchaseIntent]);

  const completionRate = Math.round((completed / TOTAL_PERSONAS) * 100);
  const activeResult = questionResults[activeQuestion];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#EEF2FA]">
      <WorkflowStepper currentPath="/live" />

      <div className="app-page-header flex items-start justify-between gap-4">
        <div>
          <p style={{ fontSize: 11, color: "#5B7DFF", fontWeight: 700, letterSpacing: "0.08em" }}>LIVE SIMULATION</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1D1F3D", lineHeight: 1.3 }}>실시간 응답 분석</h1>
          <p style={{ fontSize: 13, color: "#7C8397", marginTop: 4 }}>
            가상 페르소나가 설문을 완료할 때마다 결과 통계와 분석 지표가 실시간으로 업데이트됩니다.
          </p>
        </div>
        <button
          onClick={() => setIsLive((value) => !value)}
          className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 transition-colors ${
            isLive
              ? "border-[#FCA5A5] bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2]"
              : "border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A] hover:bg-[#DCFCE7]"
          }`}
          style={{ fontSize: 13, fontWeight: 600 }}
        >
          {isLive ? <Pause size={14} /> : <Play size={14} />}
          {isLive ? "실시간 업데이트 일시정지" : "실시간 업데이트 재개"}
        </button>
      </div>

      <div className="hide-scrollbar flex-1 overflow-y-auto px-6 py-4">
        <div className="flex flex-col gap-4">

          <div className="app-stat-card px-6 py-4">
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p style={{ fontSize: 11, color: "#9BA6B8", fontWeight: 600 }}>총 응답자 수</p>
                    <p style={{ fontSize: 22, fontWeight: 800, color: "#1D1F3D", lineHeight: 1.25, marginTop: 4 }}>
                      {completed.toLocaleString()}
                      <span style={{ color: "#9BA6B8", fontWeight: 600 }}>/ {TOTAL_PERSONAS.toLocaleString()}</span>
                      <span style={{ fontSize: 15, color: "#9BA6B8", fontWeight: 600, marginLeft: 4 }}>명</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {isLive && (
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-[#22C55E]" />
                        <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 600 }}>분석 진행 중</span>
                      </div>
                    )}
                    <span className="rounded-full border border-[#BFD4FF] bg-[#EEF4FF] px-2.5 py-0.5 text-[#5B7DFF]" style={{ fontSize: 12, fontWeight: 700 }}>
                      {completionRate}%
                    </span>
                  </div>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[#E1E8F1]">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${completionRate}%`, background: "linear-gradient(90deg, #5B7DFF, #7C3AED)" }}
                  />
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F3FF]">
                  <Clock3 size={14} className="text-[#7C3AED]" />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "#9BA6B8" }}>예상 잔여시간</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#1D1F3D" }}>약 3분 20초</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <KpiCard label="완료 응답 수" value={completed.toLocaleString()} sub={`${TOTAL_PERSONAS.toLocaleString()} 페르소나 기준`} icon={<Users size={18} />} color="#5B7DFF" bg="#EEF4FF" />
            <KpiCard label="구매 의향" value={`${purchaseIntent}%`} sub="Q5 기준 실시간 재계산" icon={<Target size={18} />} color="#EA580C" bg="#FFF7ED" />
            <KpiCard label="긍정 반응" value={`${positiveRatio}%`} sub="감성 지표 반영" icon={<Zap size={18} />} color="#16A34A" bg="#F0FDF4" />
            <KpiCard label="업데이트 주기" value="2.8초" sub="집계 결과 자동 갱신" icon={<Clock3 size={18} />} color="#7C3AED" bg="#F5F3FF" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="app-stat-card h-full p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1D1F3D" }}>문항별 응답 분포</h3>
                  <p style={{ fontSize: 12, color: "#7C8397", marginTop: 4 }}>완료된 페르소나 응답을 기준으로 분포가 계속 갱신됩니다.</p>
                </div>
                <div className="flex items-center gap-1">
                  {questionResults.map((question, index) => (
                    <button
                      key={question.id}
                      onClick={() => setActiveQuestion(index)}
                      className="rounded-lg px-2.5 py-1 transition-colors"
                      style={{
                        fontSize: 11,
                        fontWeight: activeQuestion === index ? 700 : 500,
                        backgroundColor: activeQuestion === index ? "#5B7DFF" : "#EEF2FA",
                        color: activeQuestion === index ? "#fff" : "#7C8397",
                      }}
                    >
                      {question.id}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-[#F8FAFC] px-3 py-2">
                <p style={{ fontSize: 12, color: "#334155", fontWeight: 600 }}>{activeResult.text}</p>
              </div>
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={activeResult.data} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }} barSize={14}>
                    <XAxis type="number" domain={[0, 60]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} unit="%" />
                    <YAxis type="category" dataKey="label" width={95} tick={{ fontSize: 11, fill: "#334155" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: "#EEF2FA" }}
                      contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }}
                      formatter={(value: number) => [`${value}%`, "실시간 비중"]}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {activeResult.data.map((_, index) => (
                        <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="app-stat-card flex h-full flex-col p-5">
              <div className="mb-4 flex items-center gap-2">
                <Brain size={15} className="text-[#EA580C]" />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1D1F3D" }}>전체 응답 해석</h3>
              </div>
              <div className="flex flex-1 flex-col gap-3">
                <div className="rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>핵심 응답 신호</p>
                  <p style={{ fontSize: 14, color: "#1D1F3D", fontWeight: 800, lineHeight: 1.55, marginTop: 6 }}>
                    구매 의향은 현재 {purchaseIntent}% 수준으로 유지되고 있으며, 기능 기대 응답은 상위 몇 개 항목으로 꾸준히 수렴하고 있습니다.
                  </p>
                </div>
                <div className="rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>활용 포인트</p>
                  <p style={{ fontSize: 14, color: "#1D1F3D", fontWeight: 800, lineHeight: 1.55, marginTop: 6 }}>
                    메시지는 AI 기술 자체보다 실제 촬영 결과와 구매 전환을 자극하는 체감 장면 중심으로 구성하는 편이 적절합니다.
                  </p>
                </div>
                <div className="rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>현재 읽히는 흐름</p>
                  <p style={{ fontSize: 14, color: "#1D1F3D", fontWeight: 800, lineHeight: 1.55, marginTop: 6 }}>
                    전체 응답은 긍정 반응 {positiveRatio}%를 유지하고 있어, 상위 기대 기능과 구매 의향 사이 연결성이 비교적 안정적으로 형성되고 있습니다.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3">
                  <p style={{ fontSize: 11, color: "#B45309", fontWeight: 700 }}>주의 포인트</p>
                  <p style={{ fontSize: 12, color: "#92400E", lineHeight: 1.6, marginTop: 4 }}>
                    일부 문항은 상위 응답에 비중이 몰릴 수 있으므로, 실제 검증 단계에서는 반대 선택지와 보조 질문 보강이 필요할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="app-stat-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Zap size={15} className="text-[#5B7DFF]" />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1D1F3D" }}>실시간 주요 키워드</h3>
              </div>
              <div className="mb-3 flex items-center justify-between rounded-2xl border border-[#D9E4FF] bg-[linear-gradient(90deg,#F8FBFF_0%,#EEF4FF_100%)] px-4 py-3">
                <div>
                  <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>최근 갱신</p>
                  <p style={{ fontSize: 13, color: "#1D1F3D", fontWeight: 700, marginTop: 4 }}>2.8초 주기 스트리밍 집계</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-[#22C55E]" />
                  <span style={{ fontSize: 11, color: "#16A34A", fontWeight: 700 }}>LIVE KEYWORDS</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="relative overflow-hidden rounded-2xl border border-[#D9E4FF] bg-[radial-gradient(circle_at_top,#EEF4FF_0%,#F8FAFC_55%,#FFFFFF_100%)] px-3 py-3" style={{ height: 230 }}>
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-[linear-gradient(180deg,rgba(91,125,255,0.12),rgba(91,125,255,0))]" />
                  <div className="pointer-events-none absolute inset-y-0 left-[18%] w-px bg-[#D9E4FF]" />
                  <div className="pointer-events-none absolute inset-y-0 left-[52%] w-px bg-[#EEF2F7]" />
                  <div className="pointer-events-none absolute inset-x-0 top-[48%] h-px bg-[#E2E8F0]" />
                  <div className="pointer-events-none absolute left-0 right-0 top-[18%] h-8 bg-[linear-gradient(90deg,rgba(91,125,255,0),rgba(91,125,255,0.12),rgba(91,125,255,0))] opacity-80" />
                  {KEYWORDS.map((keyword, index) => {
                    const style = WORD_STYLES[keyword.weight];
                    return (
                      <div
                        key={`${keyword.text}-${index}`}
                        className="absolute"
                        style={{
                          top: keyword.top,
                          left: keyword.left,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className="select-none whitespace-nowrap transition-opacity hover:opacity-70"
                            style={{
                              fontSize: Math.max(style.fontSize - 2, 11),
                              color: style.color,
                              fontWeight: style.weight,
                              lineHeight: 1,
                            }}
                          >
                            {keyword.text}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 ${keyword.trend === "up" ? "bg-[#EFFCF3] text-[#16A34A]" : "bg-[#FFF1F2] text-[#DC2626]"}`}
                            style={{ fontSize: 10, fontWeight: 700 }}
                          >
                            {keyword.delta}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {KEYWORDS.slice(0, 5).map((keyword, index) => (
                    <div key={keyword.text} className="rounded-2xl bg-[#F8FAFC] px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EEF4FF]" style={{ fontSize: 10, color: "#5B7DFF", fontWeight: 800 }}>
                            {index + 1}
                          </span>
                          <span style={{ fontSize: 12, color: "#1D1F3D", fontWeight: 700 }}>{keyword.text}</span>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 ${keyword.trend === "up" ? "bg-[#EFFCF3] text-[#16A34A]" : "bg-[#FFF1F2] text-[#DC2626]"}`}
                          style={{ fontSize: 10, fontWeight: 800 }}
                        >
                          {keyword.delta}
                        </span>
                      </div>
                      <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 6 }}>
                        {index < 2 ? "방금 응답 로그에서 반복적으로 포착됨" : "최근 누적 분포에서 비중 상승"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
