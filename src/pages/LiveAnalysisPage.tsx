import type React from "react";
import { useEffect, useState, useRef } from "react";
import {
  Activity,
  BarChart3,
  Brain,
  Clock3,
  Pause,
  Play,
  Target,
  Users,
  Zap,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
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
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppPagination } from "@/components/ui/AppPagination";

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
  { id: "Q2", text: "현재 사용 중인 스마트폰 카메라 경험에 얼마나 만족하십니까?", insightTitle: "만족 신호", insightSummary: "현재 만족도가 매우 낮지는 않아 단순한 문제 제기보다 명확한 업그레이드 이유를 만들어야 합니다.", insightAction: "비교 전후 구도를 활용해 개선 포인트를 직관적으로 보여주세요.", data: [{ label: "매우 만족", value: 28 }, { label: "만족", value: 35 }, { label: "보통", value: 22 }, { label: "불만족", value: 9 }, { label: "매우 불만족", value: 6 }] },
  { id: "Q3", text: "AI 카메라 컨셉이 구매 의향을 얼마나 높여준다고 느끼십니까?", insightTitle: "전환 신호", insightSummary: "해당 컨셉은 단순 제품 상세 기능이 아니라 실제 구매 전환을 이끄는 요소로 작동하고 있습니다.", insightAction: "출시 메시지에는 전환 효과를 증명하는 자산을 전면에 배치하세요.", data: [{ label: "매우 크다", value: 45 }, { label: "크다", value: 30 }, { label: "보통", value: 15 }, { label: "낮다", value: 7 }, { label: "매우 낮다", value: 3 }] },
  { id: "Q4", text: "가장 기대되는 AI 카메라 기능은 무엇입니까?", insightTitle: "기능 선호", insightSummary: "야간 촬영 보정과 실시간 통번역 기능에 대한 기대치가 가장 높게 나타납니다.", insightAction: "마케팅 소재 제작 시 '야간 보정' 성능을 1순위로 강조하세요.", data: [{ label: "야간 보정", value: 38 }, { label: "자동 줌", value: 24 }, { label: "AI 편집", value: 22 }, { label: "기타", value: 16 }] },
  { id: "Q5", text: "S25의 예상 가격대에 대해 어떻게 생각하십니까?", insightTitle: "가격 수용도", insightSummary: "성능 대비 적정하다는 의견이 많으나, 경쟁사 대비 가격 경쟁력 확보가 필요합니다.", insightAction: "보상 판매 및 사전 예약 혜택을 강조하여 가격 저항선을 낮추세요.", data: [{ label: "매우 저렴", value: 5 }, { label: "적정함", value: 42 }, { label: "비싼 편", value: 38 }, { label: "매우 비쌈", value: 15 }] },
  { id: "Q6", text: "AI 기능이 실생활에서 얼마나 유용할 것이라고 보십니까?", insightTitle: "효용성 인식", insightSummary: "일상적인 스냅 촬영에서의 유용성에 대해 긍정적인 평가가 지배적입니다.", insightAction: "평범한 일상이 AI로 특별해지는 순간을 영상 자산으로 제작하세요.", data: [{ label: "매우 유용", value: 52 }, { label: "유용함", value: 31 }, { label: "보통", value: 12 }, { label: "부족함", value: 5 }] },
  { id: "Q7", text: "현재 기기를 교체한다면 가장 큰 이유는 무엇입니까?", insightTitle: "교체 동인", insightSummary: "성능 저하보다 '새로운 기능(AI)'에 대한 호기심이 교체 수요를 자극하고 있습니다.", insightAction: "기존 갤럭시 사용자를 위한 AI 경험 업그레이드 캠페인을 진행하세요.", data: [{ label: "성능 저하", value: 25 }, { label: "새 기능", value: 48 }, { label: "디자인", value: 18 }, { label: "배터리", value: 9 }] },
  { id: "Q8", text: "Galaxy 브랜드에 대한 전반적인 신뢰도는 어느 정도입니까?", insightTitle: "브랜드 로열티", insightSummary: "플래그십 라인업에 대한 신뢰도는 여전히 견고하며, AI 혁신이 이를 강화하고 있습니다.", insightAction: "기술 리더십 이미지를 강화하는 브랜딩 메시지를 유지하세요.", data: [{ label: "매우 높음", value: 44 }, { label: "높음", value: 36 }, { label: "보통", value: 15 }, { label: "낮음", value: 5 }] },
  { id: "Q9", text: "경쟁사 기기로 번호이동을 고려해 본 적이 있습니까?", insightTitle: "이탈 리스크", insightSummary: "생태계 락인 효과로 인해 실제 이탈 가능성은 낮으나, 20대 연령층의 선호도 변화는 주시해야 합니다.", insightAction: "20대 대상의 전용 페르소나 마케팅 및 체험 공간을 확대하세요.", data: [{ label: "자주 한다", value: 8 }, { label: "가끔 한다", value: 22 }, { label: "거의 없다", value: 45 }, { label: "전혀 없다", value: 25 }] },
  { id: "Q10", text: "사전 예약 시 가장 선호하는 사은품 혜택은 무엇입니까?", insightTitle: "프로모션 선호", insightSummary: "가격 할인 직접 혜택보다는 기기 파손 보험 및 액세서리 패키지에 대한 선호도가 높습니다.", insightAction: "케어 플러스 혜택을 포함한 사전 예약 패키지를 주력으로 구성하세요.", data: [{ label: "가격 할인", value: 30 }, { label: "보험 혜택", value: 42 }, { label: "액세서리", value: 20 }, { label: "포인트", value: 8 }] },
];

const BAR_COLORS = ["#316BFF", "#4F83FF", "#7DA1FF", "#A9C0FF", "#D4DFFF"];

/* ─── CoT Modal ─── */
function CotModal({ chat, onClose }: { chat: ChatResponse; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
      <div className="bg-white rounded-[40px] shadow-2xl border border-[#DCE4F3] w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-10 py-8 border-b border-slate-50 bg-[#F7FAFF] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#2454C8] flex items-center justify-center shadow-lg text-white"><Brain size={24} /></div>
            <div>
              <h2 className="text-[20px] font-black text-slate-900">응답 일관성 상세 분석</h2>
              <p className="text-[12px] text-[#2454C8] font-bold uppercase tracking-widest mt-0.5">Response Integrity Logic</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-all"><X size={18} className="text-slate-400" /></button>
        </div>
        <div className="p-10 space-y-8 bg-white overflow-y-auto max-h-[70vh] hide-scrollbar">
          <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center gap-2"><span className="bg-[#2454C8] text-white text-[10px] font-black px-1.5 py-0.5 rounded">{chat.questionId} Response</span></div>
            <p className="text-[15px] font-black text-slate-800 italic leading-relaxed">"{chat.answer}"</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center"><span className="text-[10px] font-black text-blue-400 uppercase block mb-1">유사질문 일치</span><span className="text-[18px] font-black text-[#2454C8]">{chat.integrityScore.toFixed(1)}%</span></div>
            <div className="p-4 rounded-2xl bg-green-50 border border-green-100 text-center"><span className="text-[10px] font-black text-green-400 uppercase block mb-1">모순 탐지</span><span className="text-[18px] font-black text-green-600">CLEAN</span></div>
            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 text-center"><span className="text-[10px] font-black text-orange-400 uppercase block mb-1">메시지 합치</span><span className="text-[18px] font-black text-orange-600">HIGH</span></div>
          </div>
          <div className="space-y-6">
            <h3 className="text-[14px] font-black text-slate-900 flex items-center gap-2"><Workflow size={16} className="text-primary" /> AI 사고 단계 (Chain-of-Thought)</h3>
            {chat.cot.map((step, i) => (
              <div key={i} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-black text-primary">{i + 1}</div>
                  {i < chat.cot.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 my-1" />}
                </div>
                <p className="pb-4 text-[13px] text-slate-600 font-bold leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="px-10 py-8 border-t border-slate-50 bg-[#F7FAFF] flex justify-end"><button onClick={onClose} className="px-8 py-3 bg-[#2454C8] text-white rounded-2xl font-black shadow-xl shadow-blue-100 active:scale-95 transition-all text-[13px]">검증 결과 확인 완료</button></div>
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
  const [liveKeywords, setLiveKeywords] = useState(["AI 카메라", "야간 보정", "가격 혜택", "신속한 전환", "성능 만족"]);

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
    <div className="flex h-full w-full overflow-hidden bg-[#F8FAFC]">
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Welcome Header */}
        <div className="px-10 py-8 shrink-0">
          <section className="rounded-2xl border border-border/90 bg-card p-8 shadow-elevated relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-all duration-1000" />
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Management System</p>
              <h1 className="mt-2 font-title text-3xl font-bold leading-tight text-slate-900 md:text-4xl tracking-tight">
                실시간 <span className="text-primary">응답 분석.</span>
              </h1>
              <p className="mt-3 max-w-2xl text-base font-medium text-slate-500">
                페르소나별 실시간 응답 현황과 AI 기반 핵심 감성 지표를 모니터링합니다.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button 
                  onClick={() => setIsLive(!isLive)} 
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-[14px] shadow-lg active:scale-95 transition-all ${isLive ? "bg-red-50 text-red-500 border border-red-100 shadow-red-50" : "bg-[#2454C8] text-white shadow-blue-100"}`}
                >
                  {isLive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />} {isLive ? "시뮬레이션 중단" : "시뮬레이션 재개"}
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="flex-1 grid grid-cols-12 overflow-hidden">
          {/* 중앙: 상세 분석 */}
          <div className="col-span-8 overflow-y-auto px-10 pb-10 space-y-10 hide-scrollbar">
            {/* KPI Summary */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-[#2454C8] rounded-[32px] p-8 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />
                <p className="text-[11px] font-black text-blue-200 uppercase tracking-widest mb-5 flex items-center gap-2"><Scale size={14} /> 응답 일관성 신뢰도</p>
                <div className="flex items-end gap-2 mb-5"><span className="text-[40px] font-black leading-none">98.4<span className="text-[16px] ml-1 opacity-60">%</span></span></div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-white shadow-[0_0_12px_white]" style={{width:`98.4%`}} /></div>
              </div>
              <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm flex items-center gap-5"><div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100 shadow-sm"><Target size={28} /></div><div><p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Affinity Index</p><p className="text-[24px] font-black text-slate-900">Optimal</p></div></div>
              <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm flex items-center gap-5"><div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shadow-sm"><RefreshCw size={28} /></div><div><p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Progress</p><p className="text-[24px] font-black text-slate-900">{completionRate}%</p></div></div>
            </div>

            {/* 문항별 분포 카드 (페이지네이션 포함) */}
            <div className="bg-white rounded-[40px] border border-[#DCE4F3] p-10 shadow-xl relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-[#EDF3FF] text-[#2454C8] border border-blue-50 shadow-sm"><BarChart3 size={24} /></div>
                  <h3 className="text-[20px] font-black text-slate-900 tracking-tight">문항별 실시간 응답 분포</h3>
                </div>
                
                {/* ─── 문항 페이지네이션 ─── */}
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
                  <button 
                    onClick={() => setActiveQuestion(prev => Math.max(0, prev - 1))}
                    disabled={activeQuestion === 0}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                  >
                    <ChevronLeft size={20} strokeWidth={3} />
                  </button>
                  <div className="flex items-center px-4">
                    <span className="text-[14px] font-black text-primary">Q{activeQuestion + 1}</span>
                    <span className="text-[14px] font-bold text-slate-300 mx-2">/</span>
                    <span className="text-[14px] font-bold text-slate-400">{INITIAL_QUESTION_RESULTS.length}</span>
                  </div>
                  <button 
                    onClick={() => setActiveQuestion(prev => Math.min(INITIAL_QUESTION_RESULTS.length - 1, prev + 1))}
                    disabled={activeQuestion === INITIAL_QUESTION_RESULTS.length - 1}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                  >
                    <ChevronRight size={20} strokeWidth={3} />
                  </button>
                </div>
              </div>

              <div className="mb-10 rounded-[24px] bg-[#F8FAFC] px-8 py-6 border border-slate-100 shadow-inner italic relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2454C8] opacity-20 group-hover:opacity-100 transition-all" />
                <p className="text-[18px] font-black text-slate-800 leading-relaxed tracking-tight"><span className="text-[#2454C8] mr-3 font-black">[{activeResult.id}]</span> {activeResult.text}</p>
              </div>

              <div className="h-[320px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={activeResult.data} layout="vertical" margin={{top:0, right:60, bottom:0, left:20}} barSize={20}><XAxis type="number" hide /><YAxis dataKey="label" type="category" width={140} tick={{fontSize:13, fontWeight:800, fill:"#475569"}} axisLine={false} tickLine={false} /><Tooltip cursor={{fill:"#F8FAFC"}} contentStyle={{borderRadius:16, border:"none", fontWeight:800, boxShadow:"var(--shadow-2xl)"}} /><Bar dataKey="value" radius={[0, 10, 10, 0]}>{activeResult.data.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}</Bar></BarChart></ResponsiveContainer></div>
              
              <div className="mt-12 grid grid-cols-2 gap-8 pt-10 border-t border-slate-50">
                <div className="p-6 rounded-[28px] bg-slate-50 border border-slate-100 shadow-inner group hover:bg-white transition-all"><div className="flex items-center gap-2 text-slate-400 mb-4 uppercase tracking-widest font-black text-[10px]"><Lightbulb size={14} />분석 인사이트 요약</div><p className="text-[14px] text-slate-600 font-bold leading-relaxed">{activeResult.insightSummary}</p></div>
                <div className="p-6 rounded-[28px] bg-[#EDF3FF]/50 border border-[#DCE4F3] shadow-inner group hover:bg-white transition-all"><div className="flex items-center gap-2 text-[#2454C8] mb-4 uppercase tracking-widest font-black text-[10px]"><Zap size={14} />전략적 권장 액션</div><p className="text-[14px] text-[#1E46A8] font-black leading-relaxed">{activeResult.insightAction}</p></div>
              </div>
            </div>

            {/* 실시간 키워드 */}
            <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-md">
              <div className="flex items-center gap-3 mb-8"><div className="p-2.5 rounded-xl bg-slate-50 text-slate-400 border border-slate-100"><Hash size={20} /></div><h3 className="text-[18px] font-black text-slate-900 tracking-tight uppercase">텍스트 마이닝 실시간 키워드</h3></div>
              <div className="flex flex-wrap gap-3">
                {liveKeywords.map(kw => <div key={kw} className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-black text-slate-600 shadow-sm hover:border-primary/30 transition-all cursor-default flex items-center gap-2"><span className="text-primary opacity-40">#</span> {kw}</div>)}
                <div className="px-6 py-3 border border-dashed border-slate-200 rounded-2xl text-[13px] font-bold text-slate-300 animate-pulse">Extracting Trends...</div>
              </div>
            </div>
          </div>

          {/* 우측: 실시간 응답 피드 */}
          <div className="col-span-4 border-l border-[#DCE4F3] bg-white flex flex-col shadow-2xl relative z-10 overflow-hidden">
            <div className="px-8 py-8 border-b border-slate-50 bg-[#F8FAFC]/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-50 text-green-600 border border-green-100"><MessageCircle size={18} /></div>
                <span className="text-[15px] font-black text-slate-900 uppercase tracking-widest">Response Stream</span>
              </div>
              <div className="flex items-center gap-2 bg-green-100/50 px-3 py-1 rounded-full"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" /><span className="text-[10px] font-black text-green-600 uppercase">Live</span></div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-4 hide-scrollbar">
              {chatFeed.map((chat) => (
                <div key={chat.id} onClick={() => setSelectedChat(chat)} className="app-card p-6 transition-all duration-300 hover:shadow-md hover:border-primary/30 cursor-pointer group animate-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shadow-sm group-hover:bg-white transition-colors">
                        <UserCircle2 size={20} />
                      </div>
                      <div>
                        <span className="block text-[14px] font-black text-slate-900 leading-tight mb-0.5">{chat.personaName}</span>
                        <span className="block text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">{chat.segment}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-green-50/50 px-2 py-1 rounded-lg border border-green-100/50">
                      <ShieldCheck size={12} className="text-green-500" />
                      <span className="text-[10px] font-black text-green-600 uppercase">Valid</span>
                    </div>
                  </div>
                  
                  <div className="app-soft p-4 mb-4 border-primary/10">
                    <p className="text-[13px] text-slate-600 font-bold leading-relaxed line-clamp-3 italic">
                      "{chat.answer}"
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-primary/5 text-primary px-2 py-1 rounded-md font-black border border-primary/10">
                      {chat.questionId}
                    </span>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                      {chat.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 border-t border-slate-50 bg-[#F8FAFC]/50 text-center"><p className="text-[12px] text-slate-400 font-bold italic leading-relaxed">응답을 클릭하여 논리적 일관성과<br />AI 사고 과정(CoT)을 검증하세요.</p></div>
          </div>
        </div>
      </main>

      {selectedChat && <CotModal chat={selectedChat} onClose={() => setSelectedChat(null)} />}
    </div>
  );
};
