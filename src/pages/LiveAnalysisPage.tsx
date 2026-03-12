import type React from "react";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Brain,
  Pause,
  Play,
  Target,
  Zap,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  MessageCircle,
  Workflow,
  X,
  UserCircle2,
  Scale,
  RefreshCw,
  Hash,
  Lightbulb
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/* ─── Types ─── */
interface ChatResponse {
  id: string;
  personaName: string;
  segment: string;
  questionId: string;
  answer: string;
  integrityScore: number;
  consistencyStatus: "Good" | "Warn" | "Error";
  timestamp: string;
  cot: string[];
}

const INITIAL_QUESTION_RESULTS = [
  { id: "Q1", text: "Galaxy S25 AI 카메라 컨셉에 대한 인지도는 어느 정도입니까?", insightTitle: "인지 신호", insightSummary: "인지도가 충분히 형성되어 기능 설명 중심에서 사용 장면 중심의 커뮤니케이션으로 전환할 수 있습니다.", insightAction: "기능명 중심의 메시지보다 결과 체감을 보여주는 자산으로 캠페인을 전환하세요.", data: [{ label: "매우 잘 안다", value: 41 }, { label: "어느 정도 안다", value: 32 }, { label: "들어봤다", value: 18 }, { label: "잘 모른다", value: 9 }] },
  { id: "Q2", text: "현재 사용 중인 스마트폰 카메라 경험에 얼마나 만족하십니까?", insightTitle: "満足 신호", insightSummary: "현재 만족도가 매우 낮지는 않아 단순한 문제 제기보다 명확한 업그레이드 이유를 만들어야 합니다.", insightAction: "비교 전후 구도를 활용해 개선 포인트를 직관적으로 보여주세요.", data: [{ label: "매우 만족", value: 28 }, { label: "만족", value: 35 }, { label: "보통", value: 22 }, { label: "불만족", value: 9 }, { label: "매우 불만족", value: 6 }] },
  { id: "Q3", text: "AI 카메라 컨셉이 구매 의향을 얼마나 높여준다고 느끼십니까?", insightTitle: "전환 신호", insightSummary: "해당 컨셉은 단순 제품 상세 기능이 아니라 실제 구매 전환을 이끄는 요소로 작동하고 있습니다.", insightAction: "출시 메시지에는 전환 효과를 증명하는 자산을 전면에 배치하세요.", data: [{ label: "매우 크다", value: 45 }, { label: "크다", value: 30 }, { label: "보통", value: 15 }, { label: "낮다", value: 7 }, { label: "매우 낮다", value: 3 }] },
  { id: "Q4", text: "가장 기대되는 AI 카메라 기능은 무엇입니까?", insightTitle: "기능 선호", insightSummary: "야간 촬영 보정과 실시간 통번역 기능에 대한 기대치가 가장 높게 나타납니다.", insightAction: "마케팅 소재 제작 시 '야간 보정' 성능을 1순위로 강조하세요.", data: [{ label: "야간 보정", value: 38 }, { label: "자동 줌", value: 24 }, { label: "AI 편집", value: 22 }, { label: "기타", value: 16 }] },
  { id: "Q5", text: "S25의 예상 가격대에 대해 어떻게 생각하십니까?", insightTitle: "가격 수용도", insightSummary: "성능 대비 적정하다는 의견이 많으나, 경쟁사 대비 가격 경쟁력 확보가 필요합니다.", insightAction: "보상 판매 및 사전 예약 혜택을 강조하여 가격 저항선을 낮추세요.", data: [{ label: "매우 저렴", value: 5 }, { label: "적정함", value: 42 }, { label: "비싼 편", value: 38 }, { label: "매우 비쌈", value: 15 }] },
  { id: "Q6", text: "AI 기능이 실생활에서 얼마나 유용할 것이라고 보십니까?", insightTitle: "효용성 인식", insightSummary: "일상적인 스냅 촬영에서의 유용성에 대해 긍정적인 평가가 지배적입니다.", insightAction: "평범한 일상이 AI로 특별해지는 순간을 영상 자산으로 제작하세요.", data: [{ label: "매우 유용", value: 52 }, { label: "유용함", value: 31 }, { label: "보통", value: 12 }, { label: "부족함", value: 5 }] },
  { id: "Q7", text: "현재 기기를 교체한다면 가장 큰 이유는 무엇입니까?", insightTitle: "교체 동인", insightSummary: "성능 저하보다 '새로운 기능(AI)'에 대한 호기심이 교체 수요를 자극하고 있습니다.", insightAction: "기존 갤럭시 사용자를 위한 AI 경험 업그레이드 캠페인을 진행하세요.", data: [{ label: "성능 저하", value: 25 }, { label: "새 기능", value: 48 }, { label: "디자인", value: 18 }, { label: "배터리", value: 9 }] },
  { id: "Q8", text: "Galaxy 브랜드에 대한 전반적인 신뢰도는 어느 정도입니까?", insightTitle: "브랜드 로열티", insightSummary: "플래그십 라인업에 대한 신뢰도는 여전히 견고하며, AI 혁신이 이를 강화하고 있습니다.", insightAction: "기술 리더십 이미지를 강화하는 브랜딩 메시지를 유지하세요.", data: [{ label: "매우 높음", value: 44 }, { label: "높음", value: 36 }, { label: "보통", value: 15 }, { label: "낮음", value: 5 }] },
  { id: "Q9", text: "경쟁사 기기로 번호이동을 고려해 본 적이 있습니까?", insightTitle: "이탈 리스크", insightSummary: "생태계 락인 효과로 인해 실제 이탈 가능성은 낮으나, 20대 연령층의 선호도 변화는 주시해야 합니다.", insightAction: "20대 대상의 전용 페르소나 마케팅 및 체험 공간을 확대하세요.", data: [{ label: "자주 한다", value: 8 }, { label: "가끔 한다", value: 22 }, { label: "거의 없다", value: 45 }, { label: "전혀 없다", value: 25 }] },
  { id: "Q10", text: "사전 예약 시 가장 선호하는 사은품 혜택은 무엇입니까?", insightTitle: "프로모션 선호", insightSummary: "가격 할인 직접 혜택보다는 기기 파손 보험 및 액세서리 패키지에 대한 선호도가 높습니다.", insightAction: "케어 플러스 혜택을 포함한 사전 예약 패키지를 주력으로 구성하세요.", data: [{ label: "가격 할인", value: 30 }, { label: "보험 혜택", value: 42 }, { label: "액세서리", value: 20 }, { label: "포인트", value: 8 }] },
];

const BAR_COLORS = ["#316BFF", "#4F83FF", "#7DA1FF", "#A9C0FF", "#BDD0EA"];

/* ─── CoT Modal ─── */
function CotModal({ chat, onClose }: { chat: ChatResponse; onClose: () => void }) {
  return (
    <div className="app-modal-overlay">
      <div className="app-modal max-w-xl animate-in zoom-in-95 duration-300">
        <div className="app-modal-header">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-blue-100 text-white">
              <Brain size={24} />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-foreground tracking-tight">응답 일관성 상세 분석</h2>
              <p className="text-[11px] font-black text-primary uppercase tracking-[0.15em] mt-0.5 opacity-70">Response Integrity Logic</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-card border border-border hover:bg-[var(--surface-hover)] flex items-center justify-center transition-all text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="app-modal-body space-y-8">
          <div className="app-soft p-6 italic border-primary/10 bg-[var(--panel-soft)]/50">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">{chat.questionId} 응답</span>
            </div>
            <p className="text-[15px] font-bold text-foreground leading-relaxed">"{chat.answer}"</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--primary-light-bg)] border border-[var(--primary-light-border)] text-center shadow-sm">
              <span className="text-[10px] font-black text-primary/70 uppercase block mb-1">유사질문 일치</span>
              <span className="text-[18px] font-black text-primary">{chat.integrityScore.toFixed(1)}%</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-border text-center shadow-sm">
              <span className="text-[10px] font-black text-muted-foreground uppercase block mb-1">모순 탐지</span>
              <span className="text-[18px] font-black text-success">정상</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-border text-center shadow-sm">
              <span className="text-[10px] font-black text-muted-foreground uppercase block mb-1">논리 정합성</span>
              <span className="text-[18px] font-black text-primary">높음</span>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[14px] font-black text-foreground flex items-center gap-2">
              <Workflow size={16} className="text-primary" /> AI 사고 과정 (Chain-of-Thought)
            </h3>
            <div className="space-y-4">
              {chat.cot.map((step, i) => (
                <div key={i} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-[var(--primary-light-bg)] border border-[var(--primary-light-border)] flex items-center justify-center text-[10px] font-black text-primary shrink-0 shadow-sm">{i + 1}</div>
                    {i < chat.cot.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                  </div>
                  <p className="pb-4 text-[13px] text-secondary-foreground font-bold leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="app-modal-footer">
          <div className="flex-1" />
          <button onClick={onClose} className="px-8 py-3 bg-primary text-white rounded-xl font-black shadow-xl shadow-blue-100 active:scale-95 transition-all text-[13px] hover:bg-primary-hover">
            분석 결과 확인 완료
          </button>
        </div>
      </div>
    </div>
  );
}

export const LiveAnalysisPage: React.FC = () => {
  const [isLive, setIsLive] = useState(true);
  const [completed, setCompleted] = useState(13241);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [chatFeed, setChatFeed] = useState<ChatResponse[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatResponse | null>(null);
  const [liveKeywords] = useState(["AI 카메라", "야간 보정", "가격 혜택", "신속한 전환", "성능 만족"]);

  useEffect(() => {
    if (!isLive) return;
    const names = ["이준혁", "김지연", "박민수", "최수아", "정태영"];
    const segments = ["MZ 얼리어답터", "게이밍 성향군", "프리미엄 구매자"];
    const answers = ["야간 보정 기능이 정말 좋네요.", "AI 편집 도구로 작업이 훨씬 빨라질듯!", "비즈니스 효율성 측면에서 만족합니다."];
    const cotPool = [["성향 확인", "기술 가치 매칭", "논리 일관성 검사", "응답 생성"]];

    const interval = setInterval(() => {
      const qIds = ["Q1", "Q2", "Q3", "Q4", "Q5"];
      const newChat: ChatResponse = {
        id: Date.now().toString(),
        personaName: names[Math.floor(Math.random() * names.length)],
        segment: segments[Math.floor(Math.random() * segments.length)],
        questionId: qIds[Math.floor(Math.random() * qIds.length)],
        answer: answers[Math.floor(Math.random() * answers.length)],
        integrityScore: 94 + Math.random() * 6,
        consistencyStatus: "Good",
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        cot: cotPool[0]
      };
      setChatFeed(prev => [newChat, ...prev].slice(0, 15));
      setCompleted(prev => Math.min(30000, prev + 35));
    }, 3000);
    return () => clearInterval(interval);
  }, [isLive]);

  const activeResult = INITIAL_QUESTION_RESULTS[activeQuestion];
  const completionRate = Math.round((completed / 30000) * 100);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">

      {/* ── 페이지 헤더 ── */}
      <div className="app-page-header shrink-0 flex items-center justify-between">
        <div>
          <p className="app-page-eyebrow">Live Response Monitor</p>
          <h1 className="app-page-title mt-1">
            실시간 <span className="text-primary">응답 분석.</span>
          </h1>
          <p className="app-page-description">
            페르소나별 실시간 응답 현황과 AI 기반 핵심 감성 지표를 모니터링합니다.
          </p>
        </div>
        <button
          onClick={() => setIsLive(!isLive)}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-[14px] active:scale-95 transition-all shrink-0 ${
            isLive
              ? "bg-primary-light-bg text-primary border border-primary-light-border shadow-sm"
              : "bg-primary text-white shadow-lg shadow-blue-100 hover:bg-primary-hover"
          }`}
        >
          {isLive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          {isLive ? "시뮬레이션 중단" : "시뮬레이션 재개"}
        </button>
      </div>

      {/* ── 본문 ── */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_380px] overflow-hidden">

        {/* 중앙: 상세 분석 */}
        <div className="overflow-y-auto px-8 py-7 space-y-7 hide-scrollbar">

          {/* KPI Summary */}
          <div className="grid grid-cols-3 gap-6">
            <div className="rounded-2xl p-6 text-white relative overflow-hidden shadow-xl" style={{ background: "var(--brand-strong)" }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl transition-all group-hover:bg-white/20" />
              <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.15em] mb-4 flex items-center gap-1.5 relative z-10">
                <Scale size={11} /> 응답 일관성 신뢰도
              </p>
              <div className="flex items-end gap-1.5 mb-4 relative z-10">
                <span className="text-[36px] font-black leading-none">98.4</span>
                <span className="text-[14px] font-bold opacity-60 mb-1">%</span>
              </div>
              <div className="h-1 bg-white/20 rounded-full overflow-hidden relative z-10 shadow-inner">
                <div className="h-full bg-white shadow-[0_0_8px_white] rounded-full" style={{ width: "98.4%" }} />
              </div>
            </div>

            <div className="app-stat-card flex items-center gap-5 hover:shadow-md transition-shadow group border-border/60">
              <div className="w-12 h-12 rounded-xl bg-[var(--primary-light-bg)] text-primary flex items-center justify-center border border-[var(--primary-light-border)] shadow-sm shrink-0">
                <Target size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">브랜드 친밀도</p>
                <p className="text-[20px] font-black text-foreground tracking-tight">최적화 완료</p>
              </div>
            </div>

            <div className="app-stat-card flex items-center gap-5 hover:shadow-md transition-shadow group border-border/60">
              <div className="w-12 h-12 rounded-xl bg-[var(--panel-soft)] text-[var(--subtle-foreground)] flex items-center justify-center border border-border shadow-sm shrink-0 group-hover:bg-[var(--primary-light-bg)] group-hover:text-primary transition-colors">
                <RefreshCw size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">분석 진행률</p>
                <p className="text-[20px] font-black text-foreground tracking-tight">{completionRate}%</p>
              </div>
            </div>
          </div>

          {/* 메인 분석 카드 */}
          <div className="app-card p-8 border-border/60">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[var(--primary-light-bg)] text-primary border border-[var(--primary-light-border)] shadow-sm">
                  <BarChart3 size={18} />
                </div>
                <h3 className="text-[16px] font-black text-foreground tracking-tight">문항별 실시간 응답 분포</h3>
              </div>

              <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl border border-border">
                <button
                  onClick={() => setActiveQuestion(prev => Math.max(0, prev - 1))}
                  disabled={activeQuestion === 0}
                  className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-all disabled:opacity-30 shadow-sm"
                >
                  <ChevronLeft size={16} strokeWidth={3} />
                </button>
                <div className="flex items-center px-3">
                  <span className="text-[12px] font-black text-primary">Q{activeQuestion + 1}</span>
                  <span className="text-[12px] font-bold text-[var(--subtle-foreground)] mx-1.5">/</span>
                  <span className="text-[12px] font-bold text-muted-foreground">{INITIAL_QUESTION_RESULTS.length}</span>
                </div>
                <button
                  onClick={() => setActiveQuestion(prev => Math.min(INITIAL_QUESTION_RESULTS.length - 1, prev + 1))}
                  disabled={activeQuestion === INITIAL_QUESTION_RESULTS.length - 1}
                  className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-all disabled:opacity-30 shadow-sm"
                >
                  <ChevronRight size={16} strokeWidth={3} />
                </button>
              </div>
            </div>

            <div className="mb-8 app-soft px-6 py-5 italic relative overflow-hidden group border-border/50 bg-[var(--panel-soft)]/30">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-20 group-hover:opacity-80 transition-all rounded-l-xl" />
              <p className="text-[16px] font-black text-foreground leading-relaxed tracking-tight">
                <span className="text-primary mr-2">[{activeResult.id}]</span>
                {activeResult.text}
              </p>
            </div>

            <div className="h-[280px] mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeResult.data} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 10 }} barSize={18}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="label" type="category" width={120} tick={{ fontSize: 12, fontWeight: 700, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "var(--panel-soft)" }} contentStyle={{ borderRadius: 12, border: "none", fontWeight: 800, boxShadow: "var(--shadow-lg)" }} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {activeResult.data.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-border/30">
              <div className="app-soft p-5 group hover:bg-card transition-all border-border shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-3 uppercase tracking-widest font-black text-[10px]">
                  <Lightbulb size={13} /> 분석 인사이트 요약
                </div>
                <p className="text-[13px] text-secondary-foreground font-bold leading-relaxed">{activeResult.insightSummary}</p>
              </div>
              <div className="app-soft p-5 bg-[var(--primary-light-bg)] border-[var(--primary-light-border)] group hover:bg-card transition-all shadow-sm">
                <div className="flex items-center gap-2 text-primary mb-3 uppercase tracking-widest font-black text-[10px]">
                  <Zap size={13} /> 전략적 권장 액션
                </div>
                <p className="text-[13px] text-foreground font-black leading-relaxed">{activeResult.insightAction}</p>
              </div>
            </div>
          </div>

          {/* 실시간 키워드 */}
          <div className="app-card p-8 border-border/60">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-[var(--panel-soft)] text-muted-foreground border border-border shadow-sm">
                <Hash size={16} />
              </div>
              <h3 className="text-[15px] font-black text-foreground tracking-tight uppercase">텍스트 마이닝 실시간 키워드</h3>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {liveKeywords.map(kw => (
                <div key={kw} className="px-5 py-2.5 bg-[var(--panel-soft)] border border-border rounded-xl text-[13px] font-black text-secondary-foreground shadow-sm hover:border-primary/30 hover:bg-[var(--primary-light-bg)] hover:text-primary transition-all cursor-default flex items-center gap-2">
                  <span className="text-primary/40">#</span> {kw}
                </div>
              ))}
              <div className="px-5 py-2.5 border border-dashed border-border rounded-xl text-[12px] font-bold text-[var(--subtle-foreground)] animate-pulse flex items-center gap-2">
                트렌드 추출 중...
              </div>
            </div>
          </div>
        </div>

        {/* 우측 피드 영역 */}
        <div className="app-sidebar flex flex-col overflow-hidden border-l border-border/60">
          <div className="app-toolbar flex items-center justify-between shrink-0 bg-white/50">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[var(--primary-light-bg)] text-primary border border-[var(--primary-light-border)]">
                <MessageCircle size={15} />
              </div>
              <span className="text-[13px] font-black text-foreground uppercase tracking-widest">실시간 응답 피드</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[var(--primary-light-bg)] px-2.5 py-1 rounded-full border border-[var(--primary-light-border)]">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-black text-primary uppercase tracking-tighter">라이브</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar">
            {chatFeed.map((chat) => (
              <div key={chat.id} onClick={() => setSelectedChat(chat)} className="app-card p-5 transition-all duration-300 hover:shadow-md hover:border-primary/30 cursor-pointer group border-border/50">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[var(--panel-soft)] border border-border flex items-center justify-center text-primary shadow-sm group-hover:bg-[var(--primary-light-bg)] transition-colors shrink-0">
                      <UserCircle2 size={18} />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[13px] font-black text-foreground leading-tight mb-0.5 truncate">{chat.personaName}</span>
                      <span className="block text-[9px] font-black text-[var(--subtle-foreground)] uppercase tracking-widest leading-none truncate">{chat.segment}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[var(--primary-light-bg)] px-2 py-0.5 rounded-md shrink-0 border border-[var(--primary-light-border)]">
                    <ShieldCheck size={10} className="text-primary" />
                    <span className="text-[9px] font-black text-primary uppercase">검증</span>
                  </div>
                </div>
                <div className="app-soft p-4 mb-3 border-border/30 bg-[var(--panel-soft)]/50">
                  <p className="text-[12.5px] text-secondary-foreground font-bold leading-relaxed line-clamp-3 italic">"{chat.answer}"</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-black border border-border">
                    {chat.questionId}
                  </span>
                  <span className="text-[9px] font-black text-[var(--subtle-foreground)] uppercase tracking-tighter">
                    {chat.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-6 border-t border-border/50 bg-[var(--panel-soft)]/30 text-center shrink-0">
            <p className="text-[11px] text-muted-foreground font-bold italic leading-relaxed">
              응답을 클릭하여 논리적 일관성과<br />AI 사고 과정을 검증하세요.
            </p>
          </div>
        </div>
      </div>

      {selectedChat && <CotModal chat={selectedChat} onClose={() => setSelectedChat(null)} />}
    </div>
  );
};
