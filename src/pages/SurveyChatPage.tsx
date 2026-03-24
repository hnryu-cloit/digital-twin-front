import type React from"react";
import { useState, useRef, useEffect } from"react";
import {
 Send,
 Sparkles,
 Pencil,
 Trash2,
 Settings,
 ChevronRight,
 Plus,
 GripVertical,
 CheckSquare,
 AlignLeft,
 Sliders,
 MoreHorizontal,
 ShieldCheck,
} from"lucide-react";
import { WorkflowStepper } from"@/components/layout/WorkflowStepper";
import { AppPagination } from"@/components/ui/AppPagination";
import { buttonVariants } from"@/components/ui/button";
import { cn } from"@/lib/utils";
import favicon from"@/assets/favicon.svg";
import { surveyApi } from"@/lib/api";

type QuestionType ="단일선택" |"복수선택" |"리커트척도" |"주관식";

interface Question {
 id: number;
 text: string;
 type: QuestionType;
}

const TYPE_COLORS: Record<QuestionType, { bg: string; text: string; border: string }> = {
  단일선택: { bg: "var(--tag-blue-bg)", text: "var(--tag-blue)", border: "var(--tag-blue-bg)" },
  복수선택: { bg: "var(--tag-indigo-bg)", text: "var(--tag-indigo)", border: "var(--tag-indigo-bg)" },
  리커트척도: { bg: "var(--tag-purple-bg)", text: "var(--tag-purple)", border: "var(--tag-purple-bg)" },
  주관식: { bg: "var(--tag-teal-bg)", text: "var(--tag-teal)", border: "var(--tag-teal-bg)" },
};


const TYPE_ICONS: Record<QuestionType, React.ReactNode> = {
 단일선택: <CheckSquare size={11} />,
 복수선택: <CheckSquare size={11} />,
 리커트척도: <Sliders size={11} />,
 주관식: <AlignLeft size={11} />,
};

const INITIAL_QUESTIONS: Question[] = [
 { id: 1, text:"귀하는 현재 어떤 스마트폰을 사용하고 계십니까?", type:"단일선택" },
 { id: 2, text:"S26의 새로운 AI 카메라 기능에 대해 들어본 적이 있습니까?", type:"단일선택" },
 { id: 3, text:"해당 기능이 구매 결정에 얼마나 영향을 미칠 것 같습니까?", type:"리커트척도" },
 { id: 4, text:"가장 기대되는 AI 기능은 무엇입니까?", type:"주관식" },
 { id: 5, text:"다음 중 스마트폰 구매 시 가장 중요하게 고려하는 요소를 모두 선택해 주세요.", type:"복수선택" },
 { id: 6, text:"S26의 예상 출시 가격대가 구매 의향에 얼마나 영향을 미칩니까?", type:"리커트척도" },
 { id: 7, text:"현재 사용 중인 스마트폰의 카메라 기능에 대해 얼마나 만족하십니까?", type:"리커트척도" },
 { id: 8, text:"AI 카메라 기능 외에 S26에서 가장 기대하는 신기능은 무엇입니까?", type:"주관식" },
 { id: 9, text:"귀하의 연령대는 어디에 해당하십니까?", type:"단일선택" },
 { id: 10, text:"다음 중 평소 자주 사용하는 카메라 촬영 모드를 모두 선택해 주세요.", type:"복수선택" },
 { id: 11, text:"S26 출시 후 6개월 이내에 구매할 의향이 있으십니까?", type:"단일선택" },
 { id: 12, text:"S26 AI 카메라 기능에 대한 전반적인 인상을 자유롭게 적어주세요.", type:"주관식" },
];

type ChatRole ="user" |"bot";
interface ChatMessage {
 id: number;
 role: ChatRole;
 text: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
 {
 id: 1,
 role:"user",
 text:"S26 AI 카메라 기능에 대한 선호도 조사를 하고 싶어. 컨셉 테스트 유형으로 만들어줘.",
 },
 {
 id: 2,
 role:"bot",
 text:"네, 컨셉 테스트 유형으로 5개 문항을 생성했습니다. 우측 패널에서 확인해주세요.",
 },
];

function TypeBadge({ type }: { type: QuestionType }) {
 const c = TYPE_COLORS[type];
 return (
 <span
 className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold"
 style={{ backgroundColor: c.bg, color: c.text, borderColor: c.border }}
 >
 {TYPE_ICONS[type]}
 {type}
 </span>
 );
}

interface TooltipMenuProps {
 onClose: () => void;
}

function TooltipMenu({ onClose }: TooltipMenuProps) {
 const ref = useRef<HTMLDivElement>(null);
 const [position, setPosition] = useState<"top" | "bottom">("top");

 useEffect(() => {
 if (ref.current) {
 const rect = ref.current.getBoundingClientRect();
 const spaceBelow = window.innerHeight - rect.top;
 if (spaceBelow < 250) { // Enough space for menu
 setPosition("bottom");
 }
 }

 const handler = (e: MouseEvent) => {
 if (ref.current && !ref.current.contains(e.target as Node)) {
 onClose();
 }
 };
 document.addEventListener("mousedown", handler);
 return () => document.removeEventListener("mousedown", handler);
 }, [onClose]);

 return (
 <div
 ref={ref}
 className={cn(
 "absolute right-0 z-50 bg-card border border-[var(--border)] rounded-xl shadow-[var(--shadow-[var(--shadow-lg)])] py-1.5 w-48 animate-in fade-in duration-200",
 position === "top" ? "top-8 slide-in-from-top-2" : "bottom-8 slide-in-from-bottom-2"
 )}
 >
 {[
 { icon: <Settings size={13} />, label:"상세 설정" },
 { icon: <Sparkles size={13} />, label:"문항 품질체크" },
 { icon: <ChevronRight size={13} />, label:"로직 설정" },
 { icon: <CheckSquare size={13} />, label:"필수 응답" },
 ].map((item) => (
 <button
 key={item.label}
 onClick={onClose}
 className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--surface-hover)] text-left transition-colors group"
 >
 <span className="text-[var(--subtle-foreground)] group-hover:text-primary transition-colors">{item.icon}</span>
 <span className="text-[12px] font-medium text-[var(--secondary-foreground)]">{item.label}</span>
 </button>
 ))}
 </div>
 );
}

const QUESTIONS_PER_PAGE = 5;

export const SurveyChatPage: React.FC = () => {
 const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
 const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
 const [input, setInput] = useState("");
 const [openMenu, setOpenMenu] = useState<number | null>(null);
 const [editingId, setEditingId] = useState<number | null>(null);
 const [editText, setEditText] = useState("");
 const [currentPage, setCurrentPage] = useState(0);
 const chatEndRef = useRef<HTMLDivElement>(null);

 const totalPages = Math.max(1, Math.ceil(questions.length / QUESTIONS_PER_PAGE));
 const pagedQuestions = questions.slice(
 currentPage * QUESTIONS_PER_PAGE,
 (currentPage + 1) * QUESTIONS_PER_PAGE,
 );

 // 마운트 시 API에서 설문 문항 로드
 useEffect(() => {
   surveyApi.getQuestions("prj-001").then((apiQuestions) => {
     if (apiQuestions.length > 0) {
       setQuestions(
         apiQuestions.map((q) => ({
           id: q.order,
           text: q.text,
           type: q.type as QuestionType,
         }))
       );
     }
   });
 }, []);

 useEffect(() => {
 chatEndRef.current?.scrollIntoView({ behavior:"smooth" });
 }, [messages]);

 const sendMessage = () => {
 if (!input.trim()) return;
 const newMsg: ChatMessage = { id: Date.now(), role:"user", text: input.trim() };
 setMessages((prev) => [...prev, newMsg]);
 setInput("");

 setTimeout(() => {
 const botMsg: ChatMessage = {
 id: Date.now() + 1,
 role:"bot",
 text:"요청 내용을 반영해서 문항을 수정했습니다. 우측 패널에서 변경사항을 확인해주세요.",
 };
 setMessages((prev) => [...prev, botMsg]);
 }, 900);
 };

 const deleteQuestion = (id: number) => {
 setQuestions((prev) => {
 const next = prev.filter((q) => q.id !== id);
 const maxPage = Math.max(0, Math.ceil(next.length / QUESTIONS_PER_PAGE) - 1);
 setCurrentPage((p) => Math.min(p, maxPage));
 return next;
 });
 };

 const startEdit = (q: Question) => {
 setEditingId(q.id);
 setEditText(q.text);
 };

 const saveEdit = () => {
 setQuestions((prev) =>
 prev.map((q) => (q.id === editingId ? { ...q, text: editText } : q))
 );
 setEditingId(null);
 };

 const addQuestion = () => {
 const newQ: Question = {
 id: Date.now(),
 text:"새 문항을 입력하세요.",
 type:"단일선택",
 };
 setQuestions((prev) => {
 const next = [...prev, newQ];
 setCurrentPage(Math.ceil(next.length / QUESTIONS_PER_PAGE) - 1);
 return next;
 });
 setEditingId(newQ.id);
 setEditText(newQ.text);
 };

 return (
 <div className="flex h-full w-full flex-col bg-background overflow-hidden">
 <WorkflowStepper currentPath="/survey" />

 {/* ── 페이지 헤더 ── */}
 <div className="app-page-header shrink-0">
 <p className="app-page-eyebrow">AI Survey Studio</p>
 <h1 className="app-page-title mt-1">
 AI 기반 <span className="text-primary">설문 설계.</span>
 </h1>
 <p className="app-page-description">
 자연어로 대화하며 리서치 목적에 맞는 최적의 문항 구조를 실시간으로 구축합니다.
 </p>
 </div>

 <div className="flex flex-1 overflow-hidden">
 {/* ── Left: Chat Panel ── */}
 <div className="w-[420px] shrink-0 flex flex-col bg-card border-r border-[var(--border)] overflow-hidden">
 {/* Messages */}
 <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4 hide-scrollbar">
 {messages.map((msg) => (
 <div
 key={msg.id}
 className={`flex ${msg.role ==="user" ?"justify-end" :"justify-start"} gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300`}
 >
 {msg.role ==="bot" && (
 <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5 border border-[#DCE4F3] p-1 shadow-sm">
 <img src={favicon} alt="AI" className="w-full h-full object-contain" />
 </div>
 )}
 <div
 className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] font-medium leading-relaxed ${
 msg.role ==="user"
 ?"bg-primary text-white rounded-tr-sm"
 :"bg-[var(--panel-soft)] border border-[var(--border)] text-[var(--secondary-foreground)] rounded-tl-sm"
 }`}
 >
 {msg.text}
 </div>
 </div>
 ))}
 <div ref={chatEndRef} />
 </div>

 {/* Input */}
 <div className="px-6 pb-6 pt-1">
 <div className="flex items-center gap-2.5 bg-[var(--panel-soft)] rounded-2xl border border-[var(--border)] px-4 py-3 focus-within:border-primary focus-within:bg-card transition-colors">
 <input
 className="flex-1 bg-transparent outline-none text-foreground placeholder:text-[var(--subtle-foreground)] text-[13px] font-medium"
 placeholder="Digital Twin AI 에게 요청할 메시지를 입력하세요..."
 value={input}
 onChange={(e) => setInput(e.target.value)}
 onKeyDown={(e) => e.key ==="Enter" && sendMessage()}
 />
 <button
 onClick={sendMessage}
 disabled={!input.trim()}
 className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
 input.trim()
 ?"bg-primary text-white hover:bg-primary-hover active:scale-95"
 :"bg-[var(--muted)] text-[var(--subtle-foreground)] opacity-50"
 }`}
 >
 <Send size={14} className={input.trim() ?"translate-x-0.5" :""} />
 </button>
 </div>
 </div>
 </div>

 {/* ── Right: Generated Questions ── */}
 <div className="flex-1 flex flex-col bg-background">
 {/* Panel Header */}
 <div className="h-16 shrink-0 flex items-center justify-between px-8 bg-card border-b border-[var(--border)] z-10">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-xl bg-[var(--primary-light-bg)] text-primary border border-[var(--primary-light-border)]">
 <AlignLeft size={16} />
 </div>
 <div>
 <h2 className="text-[15px] font-bold text-foreground">생성 문항 리스트</h2>
 <p className="text-[10px] font-medium text-[var(--subtle-foreground)] uppercase tracking-[0.14em] mt-0.5">
 Total <span className="text-primary font-semibold">{questions.length}</span> Items
 </p>
 </div>
 </div>
 <button
 onClick={addQuestion}
 className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl font-semibold hover:bg-primary-hover transition-colors shadow-[var(--shadow-[var(--shadow-sm)])] active:scale-95 text-[13px]"
 >
 <Plus size={15} strokeWidth={2.5} />
 문항 추가
 </button>
 </div>

 {/* Questions List */}
 <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-4 hide-scrollbar">
 {pagedQuestions.map((q, localIdx) => {
 const globalIdx = currentPage * QUESTIONS_PER_PAGE + localIdx;
 return (
 <div
 key={q.id}
 className={cn(
 "app-card p-5 group relative transition-colors duration-200 hover:border-[var(--border-hover)]",
 openMenu === q.id ? "z-40 overflow-visible" : "z-0"
 )}
 style={{ boxShadow:"var(--shadow-[var(--shadow-md)])" }}
 >
 <div className="flex items-start gap-4">
 {/* Drag handle + number */}
 <div className="flex items-center gap-2.5 shrink-0 pt-0.5">
 <GripVertical size={16} className="text-[var(--border)] cursor-grab group-hover:text-[var(--subtle-foreground)] transition-colors" />
 <span
 className={cn(
 buttonVariants({ variant:"default", size:"sm" }),
"h-9 min-w-11 rounded-lg px-3 text-[12px] font-bold shadow-[var(--shadow-[var(--shadow-sm)])] pointer-events-none select-none",
 )}
 >
 Q{globalIdx + 1}
 </span>
 </div>

 {/* Question Content */}
 <div className="flex-1 min-w-0">
 {editingId === q.id ? (
 <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
 <textarea
 className="w-full border border-primary rounded-xl px-4 py-3 outline-none resize-none bg-card text-[13px] font-medium leading-relaxed shadow-[0_0_0_3px_rgba(49,107,255,0.08)]"
 value={editText}
 onChange={(e) => setEditText(e.target.value)}
 rows={3}
 autoFocus
 />
 <div className="flex gap-2">
 <button
 onClick={saveEdit}
 className="px-5 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors text-[12px]"
 >
 변경사항 저장
 </button>
 <button
 onClick={() => setEditingId(null)}
 className="px-5 py-2 bg-[var(--panel-soft)] border border-[var(--border)] text-[var(--secondary-foreground)] rounded-lg font-semibold hover:bg-[var(--surface-hover)] transition-colors text-[12px]"
 >
 취소
 </button>
 </div>
 </div>
 ) : (
 <div className="pt-0.5">
 <p className="text-[14px] font-semibold text-foreground leading-relaxed">
 {q.text}
 </p>
 <div className="mt-3 flex items-center gap-3">
 <TypeBadge type={q.type} />
 <div className="h-1 w-1 rounded-full bg-[var(--border)]" />
 <div className="flex items-center gap-1.5 text-[10px] text-[var(--subtle-foreground)] font-medium uppercase tracking-[0.1em]">
 <ShieldCheck size={11} className="text-[var(--success)]" />
 Mandatory Validation
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Action Buttons */}
 {editingId !== q.id && (
 <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0 pt-0.5">
 <button
 onClick={() => startEdit(q)}
 className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--panel-soft)] hover:bg-[var(--primary-light-bg)] text-[var(--subtle-foreground)] hover:text-primary transition-colors border border-[var(--border)] hover:border-[var(--primary-light-border)]"
 title="편집"
 >
 <Pencil size={14} />
 </button>
 <button
 onClick={() => deleteQuestion(q.id)}
 className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--panel-soft)] hover:bg-red-50/50 text-[var(--subtle-foreground)] hover:text-destructive transition-colors border border-[var(--border)] hover:border-red-200"
 title="삭제"
 >
 <Trash2 size={14} />
 </button>
 <div className="relative">
 <button
 onClick={() => setOpenMenu(openMenu === q.id ? null : q.id)}
 className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${
 openMenu === q.id
 ?"bg-primary text-white border-primary"
 :"bg-[var(--panel-soft)] hover:bg-[var(--surface-hover)] border-[var(--border)] text-[var(--subtle-foreground)]"
 }`}
 title="옵션"
 >
 <MoreHorizontal size={15} />
 </button>
 {openMenu === q.id && (
 <TooltipMenu onClose={() => setOpenMenu(null)} />
 )}
 </div>
 </div>
 )}
 </div>
 </div>
 );
 })}

 {/* Empty state */}
 {questions.length === 0 && (
 <div className="flex-1 flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-[var(--border)] mx-2">
 <div className="w-16 h-16 rounded-2xl bg-[var(--panel-soft)] border border-[var(--border)] flex items-center justify-center mb-5">
 <Sparkles size={28} className="text-[var(--subtle-foreground)]" />
 </div>
 <p className="text-[16px] font-semibold text-foreground">
 작성된 설문 문항이 없습니다
 </p>
 <p className="text-[13px] text-[var(--muted-foreground)] font-medium mt-2 max-w-xs leading-relaxed">
 에이전트에게 주제를 제안하거나<br />[문항 추가] 버튼을 눌러 직접 설계하세요.
 </p>
 </div>
 )}
 </div>

 {/* Pagination Area */}
 {totalPages > 1 && (
 <div className="shrink-0 flex items-center justify-center py-4 border-t border-[var(--border)] bg-card/50">
 <AppPagination
 current={currentPage + 1}
 total={totalPages}
 onChange={(p) => setCurrentPage(p - 1)}
 />
 </div>
 )}

 {/* Footer Actions */}
 <div className="shrink-0 bg-card border-t border-[var(--border)] px-8 py-4 flex items-center justify-between shadow-[0_-4px_14px_rgba(0,0,0,0.04)]">
 <div className="flex items-center gap-3">
 <div className="flex items-center gap-2 bg-[var(--panel-soft)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
 <span className="text-[10px] text-[var(--subtle-foreground)] font-semibold uppercase tracking-[0.14em]">Status</span>
 <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
 <span className="text-[12px] text-foreground font-semibold">Drafting</span>
 </div>
 <p className="text-[12px] text-[var(--muted-foreground)] font-medium">
 총 <span className="text-primary font-bold">{questions.length}</span>개의 문항이 구성됨
 </p>
 </div>
 <div className="flex gap-2.5">
 <button className="px-6 py-2.5 rounded-xl border border-[var(--border)] bg-card text-[var(--secondary-foreground)] font-semibold hover:bg-[var(--surface-hover)] transition-colors text-[13px]">
 미리보기
 </button>
 <button className="px-8 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-colors shadow-[var(--shadow-[var(--shadow-sm)])] active:scale-95 text-[13px]">
 설문 저장 및 확정
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
