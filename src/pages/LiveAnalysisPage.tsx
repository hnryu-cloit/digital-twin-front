import type React from "react";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Pause,
  Play,
  ShieldCheck,
  MessageCircle,
  X,
  UserCircle2,
  RefreshCw,
  Hash,
  Lightbulb,
  Sparkles,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import { WorkflowStepper } from "@/components/layout/WorkflowStepper";

/* ─── Types ─── */
interface ChatResponse {
  id: string;
  personaName: string;
  segment: string;
  questionId: string;
  questionText: string;
  selectedOption: string;
  rationale: string;
  integrityScore: number;
  consistencyStatus: "Good" | "Warn" | "Error";
  timestamp: string;
  cot: string[];
}

const INITIAL_QUESTION_RESULTS = [
  { id: "Q1", text: "Galaxy S26 AI 카메라 컨셉에 대한 인지도는 어느 정도입니까?", insightTitle: "인지 신호", insightSummary: "인지도가 충분히 형성되어 기능 설명 중심에서 사용 장면 중심의 커뮤니케이션으로 전환할 수 있습니다.", insightAction: "기능명 중심의 메시지보다 결과 체감을 보여주는 자산으로 캠페인을 전환하세요.", data: [{ label: "매우 잘 안다", value: 41 }, { label: "어느 정도 안다", value: 32 }, { label: "들어봤다", value: 18 }, { label: "잘 모른다", value: 9 }] },
  { id: "Q2", text: "현재 사용 중인 스마트폰 카메라 경험에 얼마나 만족하십니까?", insightTitle: "満足 신호", insightSummary: "현재 만족도가 매우 낮지는 않아 단순한 문제 제기보다 명확한 업그레이드 이유를 만들어야 합니다.", insightAction: "비교 전후 구도를 활용해 개선 포인트를 직관적으로 보여주세요.", data: [{ label: "매우 만족", value: 28 }, { label: "만족", value: 35 }, { label: "보통", value: 22 }, { label: "불만족", value: 9 }, { label: "매우 불만족", value: 6 }] },
  { id: "Q3", text: "AI 카메라 컨셉이 구매 의향을 얼마나 높여준다고 느끼십니까?", insightTitle: "전환 신호", insightSummary: "해당 컨셉은 단순 제품 상세 기능이 아니라 실제 구매 전환을 이끄는 요소로 작동하고 있습니다.", insightAction: "출시 메시지에는 전환 효과를 증명하는 자산을 전면에 배치하세요.", data: [{ label: "매우 크다", value: 45 }, { label: "크다", value: 30 }, { label: "보통", value: 15 }, { label: "낮다", value: 7 }, { label: "매우 낮다", value: 3 }] },
];

const MOCK_FEED: ChatResponse[] = [
  { 
    id: "c1", 
    personaName: "김민준", 
    segment: "30대 테크 게이머", 
    questionId: "Q3", 
    questionText: "AI 카메라 컨셉이 구매 의향을 얼마나 높여준다고 느끼십니까?", 
    selectedOption: "매우 크다", 
    rationale: "실시간 레이트레이싱과 AI 업스케일링 기능은 모바일 게임 경험을 완전히 바꿀 혁신입니다.", 
    integrityScore: 98.2, 
    consistencyStatus: "Good", 
    timestamp: "방금 전", 
    cot: ["최근 3개월간 고사양 게임 실행 시간 분석: 일 평균 2.4시간", "하드웨어 스펙 민감도: 상위 5%", "결론: 기술 시너지를 중시하는 고관여 유저"] 
  },
  { 
    id: "c2", 
    personaName: "이서윤", 
    segment: "실용 중시 가족형", 
    questionId: "Q1", 
    questionText: "Galaxy S26 AI 카메라 컨셉에 대한 인지도는 어느 정도입니까?", 
    selectedOption: "어느 정도 안다", 
    rationale: "아이들 사진 찍어줄 때 AI가 자동으로 보정해준다는 기능을 광고에서 봤습니다.", 
    integrityScore: 94.5, 
    consistencyStatus: "Good", 
    timestamp: "2분 전", 
    cot: ["유튜브 육아 채널 내 광고 노출 이력 확인", "사용자 검색어 로그: '아이 사진 예쁘게 찍는 법'", "결론: 실생활 편의 중심의 인지 형성"] 
  },
  { 
    id: "c3", 
    personaName: "박지훈", 
    segment: "20대 얼리어답터", 
    questionId: "Q2", 
    questionText: "현재 사용 중인 스마트폰 카메라 경험에 얼마나 만족하십니까?", 
    selectedOption: "불만족", 
    rationale: "야간 촬영 시 노이즈가 심하고, 후보정 과정이 너무 번거로워 AI 자동 최적화가 절실합니다.", 
    integrityScore: 91.8, 
    consistencyStatus: "Good", 
    timestamp: "5분 전", 
    cot: ["인스타그램 업로드 빈도: 주 12회", "사진 편집 앱 사용 시간 분석: 일 40분 이상", "결론: 수동 보정 피로도가 높은 헤비 업로더"] 
  },
  { 
    id: "c4", 
    personaName: "최민지", 
    segment: "프리미엄 바이어", 
    questionId: "Q3", 
    questionText: "AI 카메라 컨셉이 구매 의향을 얼마나 높여준다고 느끼십니까?", 
    selectedOption: "크다", 
    rationale: "디자인과 AI 기능의 조화가 고급스럽고, 특히 전문가용 편집 기능의 자동화가 매력적입니다.", 
    integrityScore: 96.4, 
    consistencyStatus: "Good", 
    timestamp: "8분 전", 
    cot: ["기존 플래그십 모델 3년 주기 교체 패턴 확인", "고가 가전/IT 제품 선호도: 최상위", "결론: 심미성과 기능적 우위를 동시에 추구"] 
  },
  { 
    id: "c5", 
    personaName: "강현우", 
    segment: "비즈니스 프로", 
    questionId: "Q1", 
    questionText: "Galaxy S26 AI 카메라 컨셉에 대한 인지도는 어느 정도입니까?", 
    selectedOption: "매우 잘 안다", 
    rationale: "업무상 문서 스캔과 실시간 번역 기능이 포함된 AI 카메라 기능을 유심히 살펴봤습니다.", 
    integrityScore: 99.1, 
    consistencyStatus: "Good", 
    timestamp: "12분 전", 
    cot: ["비즈니스 뉴스레터 구독 및 테크 아티클 열람 로그", "DeX 및 멀티태스킹 기능 사용률: 상위 10%", "결론: 생산성 도구로서의 AI 가치 인지"] 
  },
];

const BAR_COLORS = ["var(--primary)", "rgba(47, 102, 255, 0.7)", "rgba(47, 102, 255, 0.5)", "rgba(47, 102, 255, 0.3)", "var(--panel-soft)"];

/* ─── CoT Modal ─── */
function CotModal({ chat, onClose }: { chat: ChatResponse; onClose: () => void }) {
  return (
    <div className="app-modal-overlay">
      <div className="app-modal max-w-xl animate-in zoom-in-95 duration-300">
        <div className="app-modal-header">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--primary-light-bg)] flex items-center justify-center border border-[var(--primary-light-border)] text-primary shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-foreground tracking-tight">응답 일관성 상세 분석</h2>
              <p className="text-[11px] font-black text-primary uppercase tracking-[0.15em] mt-0.5 opacity-70">Response Integrity Logic</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-card border border-[var(--border)] hover:bg-[var(--surface-hover)] flex items-center justify-center transition-all text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="app-modal-body space-y-8">
          <div className="space-y-3">
            <div className="app-soft px-5 py-3 bg-[var(--panel-soft)]/50 border-border/30">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">{chat.questionId}</span>
              </div>
              <p className="text-[13px] font-bold text-muted-foreground leading-snug">{chat.questionText}</p>
            </div>
            <div className="flex items-center gap-3 bg-primary/8 border border-primary/25 rounded-xl px-5 py-4">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-[var(--shadow-sm)]">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-[16px] font-black text-primary leading-tight">{chat.selectedOption}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest pl-1">사고 과정 추적 (Reasoning)</h3>
            <div className="space-y-3">
              {chat.cot.map((step, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-6 h-6 rounded-full border-2 border-[var(--border)] bg-card flex items-center justify-center text-[10px] font-bold text-muted-foreground group-hover:border-primary group-hover:text-primary transition-colors">{i+1}</div>
                    {i < chat.cot.length - 1 && <div className="w-0.5 flex-1 bg-[var(--border)] my-1" />}
                  </div>
                  <p className="text-[13px] font-bold text-secondary-foreground pt-0.5 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="app-modal-footer bg-[var(--panel-soft)]/50">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-success" />
            <span className="text-[12px] font-bold text-muted-foreground uppercase">검증된 일관성 지수: {chat.integrityScore}%</span>
          </div>
          <button onClick={onClose} className="bg-primary text-white px-8 py-2.5 rounded-xl font-black text-[13px] hover:bg-primary-hover shadow-[var(--shadow-sm)] active:scale-95 transition-all">확인</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export const LiveAnalysisPage: React.FC = () => {
  const [activeQuestion, setActiveQuestion] = useState("Q1");
  const [chatFeed] = useState<ChatResponse[]>(MOCK_FEED);
  const [selectedChat, setSelectedChat] = useState<ChatResponse | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [completionRate, setCompletionRate] = useState(64);

  const activeResult = INITIAL_QUESTION_RESULTS.find(q => q.id === activeQuestion) || INITIAL_QUESTION_RESULTS[0];

  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(() => {
      setCompletionRate(prev => Math.min(100, prev + (Math.random() > 0.7 ? 1 : 0)));
    }, 3000);
    return () => clearInterval(timer);
  }, [isLive]);

  return (
    <div className="flex h-full w-full flex-col bg-background overflow-hidden">
      <WorkflowStepper currentPath="/live" />

      {/* ── 페이지 헤더 ── */}
      <div className="app-page-header shrink-0 flex items-center justify-between">
        <div>
          <p className="app-page-eyebrow">실시간 시뮬레이션 모니터링</p>
          <h1 className="app-page-title mt-1">
            실시간 응답 분석 현황
          </h1>
          <p className="app-page-description">
            페르소나별 실시간 응답 현황과 AI 기반 핵심 감성 지표를 모니터링합니다.
          </p>
        </div>
        <button
          onClick={() => setIsLive(!isLive)}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-[14px] active:scale-95 transition-all shrink-0 ${
            isLive
              ? "bg-primary-light-bg text-primary border border-primary-light-border shadow-[var(--shadow-sm)]"
              : "bg-primary text-white shadow-[var(--shadow-lg)] hover:bg-primary-hover"
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

          {/* Analysis Progress */}
          <div className="app-card p-7 border-[var(--border)] bg-card shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[var(--primary-light-bg)] text-primary border border-[var(--primary-light-border)]">
                  <RefreshCw size={18} className={isLive ? "animate-spin-slow" : ""} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-foreground leading-tight">실시간 시뮬레이션 분석 진행률</h3>
                  <p className="text-[11px] text-[var(--muted-foreground)] font-medium mt-0.5">선택된 세그먼트 타겟 대상 디지털 트윈 응답 수집 중</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-baseline justify-end gap-1.5 mb-0.5">
                  <span className="text-[24px] font-bold text-primary tracking-tight leading-none">{completionRate}%</span>
                  <span className="text-[12px] font-bold text-[var(--subtle-foreground)] uppercase tracking-tighter">진행률</span>
                </div>
                <p className="text-[11px] font-bold text-[var(--muted-foreground)]">
                  <span className="text-foreground">{Math.floor(1847 * (completionRate / 100)).toLocaleString()}</span>
                  <span className="mx-1">/</span>
                  <span>1,847명 타겟팅 <span className="opacity-60 font-medium">(전체 30,000명 중)</span></span>
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="h-3 w-full bg-[var(--panel-soft)] rounded-full overflow-hidden shadow-inner border border-[var(--border)]/30">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out relative"
                  style={{ width: `${completionRate}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              <div className="absolute top-full mt-2 left-0 right-0 flex justify-between px-0.5">
                {[0, 25, 50, 75, 100].map(val => (
                  <span key={val} className="text-[9px] font-bold text-[var(--subtle-foreground)] opacity-50">{val}%</span>
                ))}
              </div>
            </div>
          </div>

          {/* 문항별 응답 분포 */}
          <div className="app-card p-6 border-[var(--border)]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border)]/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--panel-soft)] text-primary border border-[var(--border)]"><BarChart3 size={16} /></div>
                <h3 className="text-[14px] font-bold text-foreground">문항별 실시간 응답 분포</h3>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={activeQuestion} 
                  onChange={(e) => setActiveQuestion(e.target.value)}
                  className="bg-card text-[11px] font-bold border border-[var(--border)] rounded-lg px-2.5 py-1.5 outline-none focus:border-primary transition-colors cursor-pointer shadow-sm"
                >
                  {INITIAL_QUESTION_RESULTS.map(q => (
                    <option key={q.id} value={q.id}>{q.id}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-start gap-3 mb-5 px-1">
                <span className="bg-[var(--primary-light-bg)] text-primary px-2 py-0.5 rounded text-[10px] font-bold border border-[var(--primary-light-border)] shrink-0">{activeResult.id}</span>
                <p className="text-[14px] font-bold text-foreground leading-tight">{activeResult.text}</p>
              </div>
              <div className="h-[180px] bg-[var(--panel-soft)]/30 rounded-2xl border border-[var(--border)]/50 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeResult.data} layout="vertical" margin={{ top: 5, right: 45, bottom: 5, left: 10 }} barSize={14}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="label" type="category" width={100} tick={{ fontSize: 11, fontWeight: 600, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "var(--panel-soft)" }} contentStyle={{ borderRadius: 12, border: "none", fontSize: 11, fontWeight: 700, boxShadow: "var(--shadow-lg)" }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {activeResult.data.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                      <LabelList dataKey="value" position="right" formatter={(v: number) => `${v}%`} style={{ fontSize: 11, fontWeight: 800, fill: "var(--secondary-foreground)" }} offset={10} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-6 border-t border-[var(--border)]/50">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Sparkles size={13} className="text-primary" />
                  <h4 className="text-[12px] font-bold text-foreground">AI 실시간 심층 분석</h4>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold text-[var(--subtle-foreground)] uppercase">
                  <span>추론 신뢰도 <span className="text-primary">94.8%</span></span>
                  <div className="w-px h-2.5 bg-[var(--border)]" />
                  <span>표본 규모 N=1,847</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="app-card p-5 bg-[var(--panel-soft)]/40 border-[var(--border)]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-1 h-2.5 bg-primary rounded-full" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">시장 인지도 진단</span>
                  </div>
                  <h5 className="text-[14px] font-bold text-foreground mb-2">인지도 포화 및 커뮤니케이션 전환 지점</h5>
                  <p className="text-[13px] text-[var(--secondary-foreground)] font-medium leading-relaxed">
                    인지 지수가 <span className="text-primary font-bold">82%</span>에 도달하여 단순 정보 전달의 효율이 낮아졌습니다. <span className="underline underline-offset-2 decoration-primary/20">실제 사용 시나리오 중심</span>의 커뮤니케이션 전환 시 반응률 1.4배 상승이 예측됩니다.
                  </p>
                </div>

                <div className="app-card p-5 border-primary/10 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-1 h-2.5 bg-primary rounded-full" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">전략적 핵심 과제</span>
                  </div>
                  <h5 className="text-[14px] font-bold text-foreground mb-2">경험 가치 중심의 자산 최적화 및 타겟 확장</h5>
                  <ul className="space-y-3">
                    {[
                      { t: "크리에이티브 최적화", d: "기술 규격 위주 피로도를 일상적 'AI 워크플로우' 경험 소재로 전면 교환 (소재 반응률 +24% 예측)" },
                      { t: "세그먼트 타겟팅 전술", d: "인지도 80% 초과 그룹 대상 '기존 기기 보상 판매' 메시지 자동 개인화 노출" },
                      { t: "다차원 기대 효과", d: "전환 시 구매 의향(PI) 12.5%p 상승 및 브랜드 로열티 지수 전월 대비 +8.2% 견인" }
                    ].map((item, idx) => (
                      <li key={idx} className="flex gap-2">
                        <div className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
                        <div>
                          <p className="text-[11px] font-bold text-foreground leading-none mb-1">{item.t}</p>
                          <p className="text-[12px] text-[var(--muted-foreground)] font-medium leading-tight">{item.d}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 실시간 키워드 - 고도화 디자인 */}
          <div className="app-card p-8 border-border/60 relative overflow-hidden group">
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[var(--panel-soft)] text-primary border border-[var(--border)] shadow-sm">
                  <Hash size={18} />
                </div>
                <div>
                  <h3 className="text-[16px] font-black text-foreground tracking-tight">텍스트 마이닝 실시간 키워드</h3>
                  <p className="text-[11px] text-[var(--muted-foreground)] font-bold mt-0.5">응답 근거 데이터 내 고빈도 핵심 어휘 추출</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-[var(--primary-light-bg)] px-3 py-1.5 rounded-lg border border-[var(--primary-light-border)]">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-primary">실시간 분석 엔진 가동 중</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 relative z-10">
              {[
                { word: "인공지능 카메라", score: 98, trend: "up" },
                { word: "화질 보정", score: 85, trend: "up" },
                { word: "야간 촬영", score: 72, trend: "flat" },
                { word: "배터리 효율", score: 64, trend: "down" },
                { word: "혁신적 디자인", score: 58, trend: "up" },
                { word: "사용 편의성", score: 52, trend: "flat" },
                { word: "갤럭시 생태계", score: 48, trend: "up" },
                { word: "보안성 강화", score: 42, trend: "flat" },
                { word: "프로모션 혜택", score: 35, trend: "down" }
              ].map((item, i) => (
                <div 
                  key={item.word} 
                  className={`
                    flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border transition-all cursor-default shadow-sm hover:shadow-md hover:-translate-y-0.5
                    ${i < 3 
                      ? "bg-card border-primary/30 text-primary scale-105 z-20 font-black ring-1 ring-primary/5" 
                      : "bg-[var(--panel-soft)] border-[var(--border)] text-[var(--secondary-foreground)] font-bold opacity-80 hover:opacity-100"
                    }
                  `}
                >
                  <span className={i < 3 ? "text-primary/40" : "text-[var(--subtle-foreground)]"}>#</span>
                  <span className={i < 3 ? "text-[15px]" : "text-[13px]"}>{item.word}</span>
                  <div className="flex items-center gap-1 ml-1 pl-2 border-l border-current/10">
                    <span className="text-[10px] opacity-60 font-medium">{item.score}</span>
                    {item.trend === "up" && <TrendingUp size={10} className="text-primary" />}
                    {item.trend === "down" && <TrendingDown size={10} className="text-[var(--destructive)]" />}
                  </div>
                </div>
              ))}
              <div className="px-5 py-2.5 border border-dashed border-[var(--border)] rounded-2xl text-[12px] font-bold text-[var(--subtle-foreground)] animate-pulse flex items-center gap-2 bg-[var(--panel-soft)]/20">
                새로운 인사이트 추출 중...
              </div>
            </div>
          </div>
        </div>

        {/* 우측 피드 영역 */}
        <div className="app-sidebar flex flex-col overflow-hidden border-l border-border/60">
          <div className="app-toolbar flex items-center justify-between shrink-0 bg-card/50">
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

          <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
            {chatFeed.map((chat) => (
              <div key={chat.id} onClick={() => setSelectedChat(chat)} className="app-card overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-md)] hover:border-primary/40 cursor-pointer group border-border/50">
                <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-border/30">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[var(--panel-soft)] border border-[var(--border)] flex items-center justify-center text-primary shadow-[var(--shadow-sm)] group-hover:bg-[var(--primary-light-bg)] transition-colors shrink-0">
                      <UserCircle2 size={16} />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[12px] font-black text-foreground leading-tight truncate">{chat.personaName}</span>
                      <span className="block text-[9px] font-bold text-muted-foreground tracking-wide leading-none truncate mt-0.5">{chat.segment}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] bg-[var(--primary-light-bg)] text-primary px-2 py-0.5 rounded font-black border border-[var(--primary-light-border)]">{chat.questionId}</span>
                    <span className="text-[9px] font-bold text-muted-foreground">{chat.timestamp}</span>
                  </div>
                </div>
                <div className="px-4 pt-3 pb-2">
                  <p className="text-[10px] font-bold text-muted-foreground leading-snug line-clamp-1">{chat.questionText}</p>
                </div>
                <div className="px-4 pb-3">
                  <div className="flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-xl px-3 py-2.5 group-hover:bg-primary/12 transition-colors">
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-[var(--shadow-sm)]">
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-[13px] font-black text-primary leading-tight">{chat.selectedOption}</span>
                  </div>
                </div>
                <div className="px-4 pb-3">
                  <div className="flex items-start gap-2">
                    <div className="w-3.5 h-3.5 rounded bg-[var(--panel-soft)] border border-[var(--border)] flex items-center justify-center shrink-0 mt-0.5">
                      <Lightbulb size={8} className="text-muted-foreground" />
                    </div>
                    <p className="text-[11px] text-secondary-foreground font-bold leading-relaxed line-clamp-2">{chat.rationale}</p>
                  </div>
                </div>
                <div className="px-4 pb-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 bg-[var(--panel-soft)] px-2 py-1 rounded-lg border border-border/50">
                    <ShieldCheck size={9} className="text-success" />
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wide">응답 검증 {chat.integrityScore.toFixed(1)}%</span>
                  </div>
                  <span className="text-[9px] font-bold text-primary/60 group-hover:text-primary transition-colors">AI 사고 보기 →</span>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 border-t border-border/50 bg-[var(--panel-soft)]/30 text-center shrink-0">
            <p className="text-[10px] text-muted-foreground font-bold leading-relaxed">카드를 클릭하면 <span className="text-primary">AI 사고 과정</span>과 논리 일관성을 검증할 수 있습니다.</p>
          </div>
        </div>
      </div>

      {selectedChat && <CotModal chat={selectedChat} onClose={() => setSelectedChat(null)} />}
    </div>
  );
};
