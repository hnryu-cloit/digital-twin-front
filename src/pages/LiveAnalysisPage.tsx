import type React from"react";
import { useEffect, useState } from"react";
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
} from"lucide-react";
import {
 Bar,
 BarChart,
 Cell,
 ResponsiveContainer,
 Tooltip,
 XAxis,
 YAxis,
} from"recharts";

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
 consistencyStatus:"Good" |"Warn" |"Error";
 timestamp: string;
 cot: string[];
}

const INITIAL_QUESTION_RESULTS = [
 { id:"Q1", text:"Galaxy S25 AI 카메라 컨셉에 대한 인지도는 어느 정도입니까?", insightTitle:"인지 신호", insightSummary:"인지도가 충분히 형성되어 기능 설명 중심에서 사용 장면 중심의 커뮤니케이션으로 전환할 수 있습니다.", insightAction:"기능명 중심의 메시지보다 결과 체감을 보여주는 자산으로 캠페인을 전환하세요.", data: [{ label:"매우 잘 안다", value: 41 }, { label:"어느 정도 안다", value: 32 }, { label:"들어봤다", value: 18 }, { label:"잘 모른다", value: 9 }] },
 { id:"Q2", text:"현재 사용 중인 스마트폰 카메라 경험에 얼마나 만족하십니까?", insightTitle:"満足 신호", insightSummary:"현재 만족도가 매우 낮지는 않아 단순한 문제 제기보다 명확한 업그레이드 이유를 만들어야 합니다.", insightAction:"비교 전후 구도를 활용해 개선 포인트를 직관적으로 보여주세요.", data: [{ label:"매우 만족", value: 28 }, { label:"만족", value: 35 }, { label:"보통", value: 22 }, { label:"불만족", value: 9 }, { label:"매우 불만족", value: 6 }] },
 { id:"Q3", text:"AI 카메라 컨셉이 구매 의향을 얼마나 높여준다고 느끼십니까?", insightTitle:"전환 신호", insightSummary:"해당 컨셉은 단순 제품 상세 기능이 아니라 실제 구매 전환을 이끄는 요소로 작동하고 있습니다.", insightAction:"출시 메시지에는 전환 효과를 증명하는 자산을 전면에 배치하세요.", data: [{ label:"매우 크다", value: 45 }, { label:"크다", value: 30 }, { label:"보통", value: 15 }, { label:"낮다", value: 7 }, { label:"매우 낮다", value: 3 }] },
 { id:"Q4", text:"가장 기대되는 AI 카메라 기능은 무엇입니까?", insightTitle:"기능 선호", insightSummary:"야간 촬영 보정과 실시간 통번역 기능에 대한 기대치가 가장 높게 나타납니다.", insightAction:"마케팅 소재 제작 시 '야간 보정' 성능을 1순위로 강조하세요.", data: [{ label:"야간 보정", value: 38 }, { label:"자동 줌", value: 24 }, { label:"AI 편집", value: 22 }, { label:"기타", value: 16 }] },
 { id:"Q5", text:"S25의 예상 가격대에 대해 어떻게 생각하십니까?", insightTitle:"가격 수용도", insightSummary:"성능 대비 적정하다는 의견이 많으나, 경쟁사 대비 가격 경쟁력 확보가 필요합니다.", insightAction:"보상 판매 및 사전 예약 혜택을 강조하여 가격 저항선을 낮추세요.", data: [{ label:"매우 저렴", value: 5 }, { label:"적정함", value: 42 }, { label:"비싼 편", value: 38 }, { label:"매우 비쌈", value: 15 }] },
 { id:"Q6", text:"AI 기능이 실생활에서 얼마나 유용할 것이라고 보십니까?", insightTitle:"효용성 인식", insightSummary:"일상적인 스냅 촬영에서의 유용성에 대해 긍정적인 평가가 지배적입니다.", insightAction:"평범한 일상이 AI로 특별해지는 순간을 영상 자산으로 제작하세요.", data: [{ label:"매우 유용", value: 52 }, { label:"유용함", value: 31 }, { label:"보통", value: 12 }, { label:"부족함", value: 5 }] },
 { id:"Q7", text:"현재 기기를 교체한다면 가장 큰 이유는 무엇입니까?", insightTitle:"교체 동인", insightSummary:"성능 저하보다 '새로운 기능(AI)'에 대한 호기심이 교체 수요를 자극하고 있습니다.", insightAction:"기존 갤럭시 사용자를 위한 AI 경험 업그레이드 캠페인을 진행하세요.", data: [{ label:"성능 저하", value: 25 }, { label:"새 기능", value: 48 }, { label:"디자인", value: 18 }, { label:"배터리", value: 9 }] },
 { id:"Q8", text:"Galaxy 브랜드에 대한 전반적인 신뢰도는 어느 정도입니까?", insightTitle:"브랜드 로열티", insightSummary:"플래그십 라인업에 대한 신뢰도는 여전히 견고하며, AI 혁신이 이를 강화하고 있습니다.", insightAction:"기술 리더십 이미지를 강화하는 브랜딩 메시지를 유지하세요.", data: [{ label:"매우 높음", value: 44 }, { label:"높음", value: 36 }, { label:"보통", value: 15 }, { label:"낮음", value: 5 }] },
 { id:"Q9", text:"경쟁사 기기로 번호이동을 고려해 본 적이 있습니까?", insightTitle:"이탈 리스크", insightSummary:"생태계 락인 효과로 인해 실제 이탈 가능성은 낮으나, 20대 연령층의 선호도 변화는 주시해야 합니다.", insightAction:"20대 대상의 전용 페르소나 마케팅 및 체험 공간을 확대하세요.", data: [{ label:"자주 한다", value: 8 }, { label:"가끔 한다", value: 22 }, { label:"거의 없다", value: 45 }, { label:"전혀 없다", value: 25 }] },
 { id:"Q10", text:"사전 예약 시 가장 선호하는 사은품 혜택은 무엇입니까?", insightTitle:"프로모션 선호", insightSummary:"가격 할인 직접 혜택보다는 기기 파손 보험 및 액세서리 패키지에 대한 선호도가 높습니다.", insightAction:"케어 플러스 혜택을 포함한 사전 예약 패키지를 주력으로 구성하세요.", data: [{ label:"가격 할인", value: 30 }, { label:"보험 혜택", value: 42 }, { label:"액세서리", value: 20 }, { label:"포인트", value: 8 }] },
];

const BAR_COLORS = ["var(--primary)","#4F83FF","#7DA1FF","#A9C0FF","#BDD0EA"];

/* ─── CoT Modal ─── */
function CotModal({ chat, onClose }: { chat: ChatResponse; onClose: () => void }) {
 return (
 <div className="app-modal-overlay">
 <div className="app-modal max-w-xl animate-in zoom-in-95 duration-300">
 <div className="app-modal-header">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-[var(--shadow-lg)] text-white">
 <Brain size={24} />
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
 <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-[var(--shadow-md)]">
 <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
 <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
 </svg>
 </div>
 <p className="text-[16px] font-black text-primary leading-tight">{chat.selectedOption}</p>
 </div>
 <div className="flex items-start gap-3 px-1">
 <Lightbulb size={14} className="text-muted-foreground shrink-0 mt-0.5" />
 <p className="text-[13px] font-bold text-secondary-foreground leading-relaxed italic">"{chat.rationale}"</p>
 </div>
 </div>

 <div className="grid grid-cols-3 gap-4">
 <div className="p-4 rounded-2xl bg-[var(--primary-light-bg)] border border-[var(--primary-light-border)] text-center shadow-[var(--shadow-sm)]">
 <span className="text-[10px] font-black text-primary/70 uppercase block mb-1">유사질문 일치</span>
 <span className="text-[18px] font-black text-primary">{chat.integrityScore.toFixed(1)}%</span>
 </div>
 <div className="p-4 rounded-2xl bg-card border border-[var(--border)] text-center shadow-[var(--shadow-sm)]">
 <span className="text-[10px] font-black text-muted-foreground uppercase block mb-1">모순 탐지</span>
 <span className="text-[18px] font-black text-success">정상</span>
 </div>
 <div className="p-4 rounded-2xl bg-card border border-[var(--border)] text-center shadow-[var(--shadow-sm)]">
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
 <div className="w-6 h-6 rounded-full bg-[var(--primary-light-bg)] border border-[var(--primary-light-border)] flex items-center justify-center text-[10px] font-black text-primary shrink-0 shadow-[var(--shadow-sm)]">{i + 1}</div>
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
 <button onClick={onClose} className="px-8 py-3 bg-primary text-white rounded-xl font-black shadow-[var(--shadow-lg)] active:scale-95 transition-all text-[13px] hover:bg-primary-hover">
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
 const [liveKeywords] = useState(["AI 카메라","야간 보정","가격 혜택","신속한 전환","성능 만족"]);

 useEffect(() => {
 if (!isLive) return;
 const names = ["이준혁","김지연","박민수","최수아","정태영","한유진","오세훈"];
 const segments = ["MZ 얼리어답터","게이밍 성향군","프리미엄 구매자","실용 소비자","브랜드 충성 고객"];

 const responsePool: Record<string, { q: string; option: string; rationale: string }[]> = {
 Q1: [
 { q:"Galaxy S25 AI 카메라 컨셉에 대한 인지도는?", option:"매우 잘 안다", rationale:"SNS와 유튜브 리뷰를 통해 출시 전부터 주요 기능들을 꼼꼼히 살펴봤습니다." },
 { q:"Galaxy S25 AI 카메라 컨셉에 대한 인지도는?", option:"어느 정도 안다", rationale:"광고에서 몇 번 접했지만 세부 스펙까지는 아직 확인하지 않았습니다." },
 { q:"Galaxy S25 AI 카메라 컨셉에 대한 인지도는?", option:"들어봤다", rationale:"주변 지인이 언급해서 이름 정도는 알지만 구체적으로는 잘 모릅니다." },
 ],
 Q2: [
 { q:"현재 스마트폰 카메라 경험 만족도는?", option:"만족", rationale:"일상 스냅 정도는 충분히 커버되지만 어두운 환경에서 아쉬움이 남습니다." },
 { q:"현재 스마트폰 카메라 경험 만족도는?", option:"보통", rationale:"기본 기능은 괜찮지만 전문적인 촬영 상황에서는 한계가 느껴집니다." },
 { q:"현재 스마트폰 카메라 경험 만족도는?", option:"매우 만족", rationale:"현재 기기의 카메라 성능이 제 사용 패턴에 충분히 맞아 매우 만족합니다." },
 ],
 Q3: [
 { q:"AI 카메라 컨셉이 구매 의향을 높여주는 정도는?", option:"매우 크다", rationale:"AI 기반 자동 보정 기능은 기존 스마트폰 카메라와 차별화된 핵심 포인트입니다." },
 { q:"AI 카메라 컨셉이 구매 의향을 높여주는 정도는?", option:"크다", rationale:"기능 자체보다 일상에서 활용 가능한 범위가 넓다는 점이 구매 욕구를 자극합니다." },
 { q:"AI 카메라 컨셉이 구매 의향을 높여주는 정도는?", option:"보통", rationale:"기능은 흥미롭지만 가격 대비 가치가 더 명확해야 실구매로 이어질 것 같습니다." },
 ],
 Q4: [
 { q:"가장 기대되는 AI 카메라 기능은?", option:"야간 보정", rationale:"야간 촬영을 자주 하는데 기존 기기의 노이즈 문제가 항상 불만이었습니다." },
 { q:"가장 기대되는 AI 카메라 기능은?", option:"자동 줌", rationale:"멀리서 피사체를 담을 때 화질 저하가 심해 AI 줌 기능에 가장 기대가 큽니다." },
 { q:"가장 기대되는 AI 카메라 기능은?", option:"AI 편집", rationale:"촬영 후 후보정에 시간을 많이 쓰는데, AI가 자동으로 처리해주면 매우 편리할 것 같습니다." },
 ],
 Q5: [
 { q:"S25 예상 가격대에 대한 생각은?", option:"적정함", rationale:"AI 기능의 부가가치를 고려하면 현 가격대는 합리적인 수준으로 판단됩니다." },
 { q:"S25 예상 가격대에 대한 생각은?", option:"비싼 편", rationale:"성능은 인정하지만 경쟁사 동급 제품과 비교했을 때 가격이 다소 높게 느껴집니다." },
 { q:"S25 예상 가격대에 대한 생각은?", option:"매우 저렴", rationale:"탑재된 AI 기능과 하드웨어 스펙을 감안하면 오히려 저렴하다고 생각합니다." },
 ],
 };

 const cotPool = [
 ["페르소나 성향 프로파일 분석","질문 의미 구조 파악 및 보기 매핑","과거 응답 패턴과 일관성 교차 검증","최종 응답 옵션 선택 및 근거 생성"],
 ["소비 성향 및 브랜드 친밀도 로드","기능 선호도 기반 응답 후보 생성","논리적 모순 여부 탐지","응답 신뢰도 스코어링 완료"],
 ];

 const interval = setInterval(() => {
 const qIds = ["Q1","Q2","Q3","Q4","Q5"] as const;
 const qId = qIds[Math.floor(Math.random() * qIds.length)];
 const pool = responsePool[qId];
 const picked = pool[Math.floor(Math.random() * pool.length)];
 const newChat: ChatResponse = {
 id: Date.now().toString(),
 personaName: names[Math.floor(Math.random() * names.length)],
 segment: segments[Math.floor(Math.random() * segments.length)],
 questionId: qId,
 questionText: picked.q,
 selectedOption: picked.option,
 rationale: picked.rationale,
 integrityScore: 94 + Math.random() * 6,
 consistencyStatus:"Good",
 timestamp: new Date().toLocaleTimeString("ko-KR", { hour:"2-digit", minute:"2-digit", second:"2-digit" }),
 cot: cotPool[Math.floor(Math.random() * cotPool.length)],
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
 ?"bg-primary-light-bg text-primary border border-primary-light-border shadow-[var(--shadow-sm)]"
 :"bg-primary text-white shadow-[var(--shadow-lg)] hover:bg-primary-hover"
 }`}
 >
 {isLive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
 {isLive ?"시뮬레이션 중단" :"시뮬레이션 재개"}
 </button>
 </div>

 {/* ── 본문 ── */}
 <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_380px] overflow-hidden">

 {/* 중앙: 상세 분석 */}
 <div className="overflow-y-auto px-8 py-7 space-y-7 hide-scrollbar">

 {/* KPI Summary */}
 <div className="grid grid-cols-3 gap-6">
 <div className="rounded-2xl p-6 text-white relative overflow-hidden shadow-[var(--shadow-lg)]" style={{ background:"var(--brand-strong)" }}>
 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl transition-all group-hover:bg-white/20" />
 <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.15em] mb-4 flex items-center gap-1.5 relative z-10">
 <Scale size={11} /> 응답 일관성 신뢰도
 </p>
 <div className="flex items-end gap-1.5 mb-4 relative z-10">
 <span className="text-[36px] font-black leading-none">98.4</span>
 <span className="text-[14px] font-bold opacity-60 mb-1">%</span>
 </div>
 <div className="h-1 bg-white/20 rounded-full overflow-hidden relative z-10 shadow-inner">
 <div className="h-full bg-card shadow-[0_0_8px_white] rounded-full" style={{ width:"98.4%" }} />
 </div>
 </div>

 <div className="app-stat-card flex items-center gap-5 hover:shadow-[var(--shadow-md)] transition-shadow group border-border/60">
 <div className="w-12 h-12 rounded-xl bg-[var(--primary-light-bg)] text-primary flex items-center justify-center border border-[var(--primary-light-border)] shadow-[var(--shadow-sm)] shrink-0">
 <Target size={22} />
 </div>
 <div>
 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">브랜드 친밀도</p>
 <p className="text-[20px] font-black text-foreground tracking-tight">최적화 완료</p>
 </div>
 </div>

 <div className="app-stat-card flex items-center gap-5 hover:shadow-[var(--shadow-md)] transition-shadow group border-border/60">
 <div className="w-12 h-12 rounded-xl bg-[var(--panel-soft)] text-[var(--subtle-foreground)] flex items-center justify-center border border-[var(--border)] shadow-[var(--shadow-sm)] shrink-0 group-hover:bg-[var(--primary-light-bg)] group-hover:text-primary transition-colors">
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
 <div className="p-2 rounded-xl bg-[var(--primary-light-bg)] text-primary border border-[var(--primary-light-border)] shadow-[var(--shadow-sm)]">
 <BarChart3 size={18} />
 </div>
 <h3 className="text-[16px] font-black text-foreground tracking-tight">문항별 실시간 응답 분포</h3>
 </div>

 <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl border border-[var(--border)]">
 <button
 onClick={() => setActiveQuestion(prev => Math.max(0, prev - 1))}
 disabled={activeQuestion === 0}
 className="w-8 h-8 rounded-lg bg-card border border-[var(--border)] flex items-center justify-center text-muted-foreground hover:text-primary transition-all disabled:opacity-30 shadow-[var(--shadow-sm)]"
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
 className="w-8 h-8 rounded-lg bg-card border border-[var(--border)] flex items-center justify-center text-muted-foreground hover:text-primary transition-all disabled:opacity-30 shadow-[var(--shadow-sm)]"
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
 <YAxis dataKey="label" type="category" width={120} tick={{ fontSize: 12, fontWeight: 700, fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false} />
 <Tooltip cursor={{ fill:"var(--panel-soft)" }} contentStyle={{ borderRadius: 12, border:"none", fontWeight: 800, boxShadow:"var(--shadow-[var(--shadow-lg)])" }} />
 <Bar dataKey="value" radius={[0, 8, 8, 0]}>
 {activeResult.data.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>

 <div className="grid grid-cols-2 gap-6 pt-8 border-t border-border/30">
 <div className="app-soft p-5 group hover:bg-card transition-all border-[var(--border)] shadow-[var(--shadow-sm)]">
 <div className="flex items-center gap-2 text-muted-foreground mb-3 uppercase tracking-widest font-black text-[10px]">
 <Lightbulb size={13} /> 분석 인사이트 요약
 </div>
 <p className="text-[13px] text-secondary-foreground font-bold leading-relaxed">{activeResult.insightSummary}</p>
 </div>
 <div className="app-soft p-5 bg-[var(--primary-light-bg)] border-[var(--primary-light-border)] group hover:bg-card transition-all shadow-[var(--shadow-sm)]">
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
 <div className="p-2 rounded-xl bg-[var(--panel-soft)] text-muted-foreground border border-[var(--border)] shadow-[var(--shadow-sm)]">
 <Hash size={16} />
 </div>
 <h3 className="text-[15px] font-black text-foreground tracking-tight uppercase">텍스트 마이닝 실시간 키워드</h3>
 </div>
 <div className="flex flex-wrap gap-2.5">
 {liveKeywords.map(kw => (
 <div key={kw} className="px-5 py-2.5 bg-[var(--panel-soft)] border border-[var(--border)] rounded-xl text-[13px] font-black text-secondary-foreground shadow-[var(--shadow-sm)] hover:border-primary/30 hover:bg-[var(--primary-light-bg)] hover:text-primary transition-all cursor-default flex items-center gap-2">
 <span className="text-primary/40">#</span> {kw}
 </div>
 ))}
 <div className="px-5 py-2.5 border border-dashed border-[var(--border)] rounded-xl text-[12px] font-bold text-[var(--subtle-foreground)] animate-pulse flex items-center gap-2">
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

 <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
 {chatFeed.map((chat) => (
 <div key={chat.id} onClick={() => setSelectedChat(chat)} className="app-card overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-md)] hover:border-primary/40 cursor-pointer group border-border/50">
 {/* 상단: 페르소나 정보 + 질문 ID */}
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
 <span className="text-[9px] bg-[var(--primary-light-bg)] text-primary px-2 py-0.5 rounded font-black border border-[var(--primary-light-border)]">
 {chat.questionId}
 </span>
 <span className="text-[9px] font-bold text-muted-foreground">{chat.timestamp}</span>
 </div>
 </div>

 {/* 질문 텍스트 */}
 <div className="px-4 pt-3 pb-2">
 <p className="text-[10px] font-bold text-muted-foreground leading-snug line-clamp-1">{chat.questionText}</p>
 </div>

 {/* 선택한 답변 */}
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

 {/* 응답 근거 */}
 <div className="px-4 pb-3">
 <div className="flex items-start gap-2">
 <div className="w-3.5 h-3.5 rounded bg-[var(--panel-soft)] border border-[var(--border)] flex items-center justify-center shrink-0 mt-0.5">
 <Lightbulb size={8} className="text-muted-foreground" />
 </div>
 <p className="text-[11px] text-secondary-foreground font-bold leading-relaxed line-clamp-2">{chat.rationale}</p>
 </div>
 </div>

 {/* 하단: 검증 배지 */}
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
 <p className="text-[10px] text-muted-foreground font-bold leading-relaxed">
 카드를 클릭하면 <span className="text-primary">AI 사고 과정</span>과 논리 일관성을 검증할 수 있습니다.
 </p>
 </div>
 </div>
 </div>

 {selectedChat && <CotModal chat={selectedChat} onClose={() => setSelectedChat(null)} />}
 </div>
 );
};
