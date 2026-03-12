import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
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
  ChevronLeft,
  ShieldCheck,
} from "lucide-react";
import { WorkflowStepper } from "@/components/layout/WorkflowStepper";
import { AppPagination } from "@/components/ui/AppPagination";

type QuestionType = "단일선택" | "복수선택" | "리커트척도" | "주관식";

interface Question {
  id: number;
  text: string;
  type: QuestionType;
}

const TYPE_COLORS: Record<QuestionType, { bg: string; text: string; border: string }> = {
  단일선택: { bg: "var(--primary-light-bg)", text: "var(--primary)", border: "var(--primary-light-border)" },
  복수선택: { bg: "var(--success-light)", text: "var(--success)", border: "var(--success-light)" },
  리커트척도: { bg: "var(--warning-light)", text: "var(--warning)", border: "var(--warning-light)" },
  주관식: { bg: "var(--muted)", text: "var(--muted-foreground)", border: "var(--border)" },
};

const TYPE_ICONS: Record<QuestionType, React.ReactNode> = {
  단일선택: <CheckSquare size={11} />,
  복수선택: <CheckSquare size={11} />,
  리커트척도: <Sliders size={11} />,
  주관식: <AlignLeft size={11} />,
};

const INITIAL_QUESTIONS: Question[] = [
  { id: 1, text: "귀하는 현재 어떤 스마트폰을 사용하고 계십니까?", type: "단일선택" },
  { id: 2, text: "S25의 새로운 AI 카메라 기능에 대해 들어본 적이 있습니까?", type: "단일선택" },
  { id: 3, text: "해당 기능이 구매 결정에 얼마나 영향을 미칠 것 같습니까?", type: "리커트척도" },
  { id: 4, text: "가장 기대되는 AI 기능은 무엇입니까?", type: "주관식" },
  { id: 5, text: "다음 중 스마트폰 구매 시 가장 중요하게 고려하는 요소를 모두 선택해 주세요.", type: "복수선택" },
  { id: 6, text: "S25의 예상 출시 가격대가 구매 의향에 얼마나 영향을 미칩니까?", type: "리커트척도" },
  { id: 7, text: "현재 사용 중인 스마트폰의 카메라 기능에 대해 얼마나 만족하십니까?", type: "리커트척도" },
  { id: 8, text: "AI 카메라 기능 외에 S25에서 가장 기대하는 신기능은 무엇입니까?", type: "주관식" },
  { id: 9, text: "귀하의 연령대는 어디에 해당하십니까?", type: "단일선택" },
  { id: 10, text: "다음 중 평소 자주 사용하는 카메라 촬영 모드를 모두 선택해 주세요.", type: "복수선택" },
  { id: 11, text: "S25 출시 후 6개월 이내에 구매할 의향이 있으십니까?", type: "단일선택" },
  { id: 12, text: "S25 AI 카메라 기능에 대한 전반적인 인상을 자유롭게 적어주세요.", type: "주관식" },
];

type ChatRole = "user" | "bot";
interface ChatMessage {
  id: number;
  role: ChatRole;
  text: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    role: "user",
    text: "S25 AI 카메라 기능에 대한 선호도 조사를 하고 싶어. 컨셉 테스트 유형으로 만들어줘.",
  },
  {
    id: 2,
    role: "bot",
    text: "네, 컨셉 테스트 유형으로 5개 문항을 생성했습니다. 우측 패널에서 확인해주세요.",
  },
];

function TypeBadge({ type }: { type: QuestionType }) {
  const c = TYPE_COLORS[type];
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-black shadow-sm"
      style={{
        backgroundColor: c.bg,
        color: c.text,
        borderColor: c.border,
      }}
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

  useEffect(() => {
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
      className="absolute right-0 top-8 z-20 bg-white border border-border rounded-xl shadow-2xl py-1.5 w-48 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {[
        { icon: <Settings size={13} />, label: "상세 설정" },
        { icon: <Sparkles size={13} />, label: "문항 품질체크" },
        { icon: <ChevronRight size={13} />, label: "로직 설정" },
        { icon: <CheckSquare size={13} />, label: "필수 응답" },
      ].map((item) => (
        <button
          key={item.label}
          onClick={onClose}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left transition-colors group"
        >
          <span className="text-slate-400 group-hover:text-primary transition-colors">{item.icon}</span>
          <span className="text-[12px] font-bold text-slate-600">{item.label}</span>
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: ChatMessage = { id: Date.now(), role: "user", text: input.trim() };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        role: "bot",
        text: "요청 내용을 반영해서 문항을 수정했습니다. 우측 패널에서 변경사항을 확인해주세요.",
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
      text: "새 문항을 입력하세요.",
      type: "단일선택",
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
    <div className="flex h-full w-full flex-col bg-[#F8FAFC] overflow-hidden">
      <WorkflowStepper currentPath="/survey" />

      {/* Welcome Header */}
      <div className="px-10 pt-6 pb-6 shrink-0">
        <section className="rounded-2xl border border-border/90 bg-card p-8 shadow-elevated relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-all duration-1000" />
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Management System</p>
            <h1 className="mt-2 font-title text-3xl font-bold leading-tight text-slate-900 md:text-4xl tracking-tight">
              AI 기반 <span className="text-primary">설문 설계.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-base font-medium text-slate-500">
              자연어로 대화하며 리서치 목적에 맞는 최적의 문항 구조를 실시간으로 구축합니다.
            </p>
          </div>
        </section>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Chat Panel */}
        <div className="w-[440px] shrink-0 flex flex-col bg-white border-r border-border shadow-sm relative z-10 overflow-hidden">
          {/* Panel Header */}
          <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-blue-100">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-[16px] font-black text-foreground leading-tight">설문 에이전트</h2>
                <p className="text-[11px] text-primary font-black uppercase tracking-widest mt-0.5">AI Survey Designer</p>
              </div>
            </div>
            <p className="text-[12px] text-slate-500 font-bold leading-relaxed">
              자연어로 대화하며 리서치 목적에 맞는 최적의 문항을 설계하세요.
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-6 bg-white hide-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                {msg.role === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5 border border-blue-100 shadow-sm">
                    <Bot size={14} className="text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-5 py-3.5 rounded-[20px] shadow-sm text-[13px] font-bold leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-slate-100 border border-slate-200 text-slate-700 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* AI Features Box */}
          <div className="mx-8 mb-6 rounded-2xl border border-primary/10 bg-primary-light-bg/20 p-5 shadow-inner">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={15} className="text-primary" />
              <span className="text-[12px] font-black text-primary uppercase tracking-widest">Powered by AI Engine</span>
            </div>
            <ul className="flex flex-col gap-2.5">
              {[
                "Interactive Editing (대화형 문항 수정)",
                "AI Quality Check (중복/편향 질문 검사)",
                "Natural Language Refinement (톤앤매너 조정)",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_8px_rgba(49,107,255,0.4)]" />
                  <span className="text-[11px] text-primary-active-text font-black leading-snug">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Input */}
          <div className="px-8 pb-8 pt-2">
            <div className="flex items-center gap-3 bg-slate-50 rounded-[20px] border border-slate-200 px-5 py-4 shadow-inner focus-within:border-primary/50 focus-within:bg-white transition-all group">
              <input
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-slate-400 text-[13px] font-bold"
                placeholder="에이전트에게 요청할 메시지를 입력하세요..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-lg ${
                  input.trim()
                    ? "bg-primary text-white shadow-blue-200 hover:bg-primary-hover active:scale-95"
                    : "bg-slate-200 text-slate-400 grayscale opacity-50"
                }`}
              >
                <Send size={16} className={input.trim() ? "translate-x-0.5" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Generated Questions */}
        <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden">
          {/* Panel Header */}
          <div className="h-20 shrink-0 flex items-center justify-between px-10 bg-white/50 backdrop-blur-md border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-primary border border-blue-100 shadow-sm">
                <AlignLeft size={18} />
              </div>
              <div>
                <h2 className="text-[18px] font-black text-foreground tracking-tight">생성 문항 리스트</h2>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Total <span className="text-primary">{questions.length}</span> Items</p>
              </div>
            </div>
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-black hover:bg-primary-hover transition-all shadow-xl shadow-blue-200 active:scale-95 text-[13px]"
            >
              <Plus size={16} strokeWidth={3} />
              문항 추가
            </button>
          </div>

          {/* Questions List */}
          <div className="flex-1 overflow-y-auto px-10 py-10 flex flex-col gap-5 hide-scrollbar">
            {pagedQuestions.map((q, localIdx) => {
              const globalIdx = currentPage * QUESTIONS_PER_PAGE + localIdx;
              return (
                <div
                  key={q.id}
                  className="app-card p-6 group relative hover:shadow-xl hover:border-primary/20 transition-all border-border/60 bg-white"
                >
                  <div className="flex items-start gap-5">
                    {/* Drag handle + number */}
                    <div className="flex items-center gap-3 shrink-0 pt-1">
                      <GripVertical size={18} className="text-slate-200 cursor-grab group-hover:text-slate-400 transition-colors" />
                      <div className="w-12 h-10 rounded-xl bg-[#2454C8] text-white flex items-center justify-center text-[13px] font-black shadow-lg shadow-blue-100 transition-all">
                        Q{globalIdx + 1}
                      </div>
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 min-w-0">
                      {editingId === q.id ? (
                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                          <textarea
                            className="w-full border border-primary rounded-2xl px-5 py-4 outline-none resize-none bg-white text-[14px] font-bold leading-relaxed shadow-xl shadow-blue-50"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={3}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={saveEdit}
                              className="px-6 py-2 bg-primary text-white rounded-xl font-black hover:bg-primary-hover transition-all shadow-lg shadow-blue-100 text-[12px]"
                            >
                              변경사항 저장
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-6 py-2 bg-slate-100 text-slate-500 rounded-xl font-black hover:bg-slate-200 transition-all text-[12px]"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-1">
                          <p className="text-[15px] font-black text-slate-700 leading-relaxed group-hover:text-slate-900 transition-colors">
                            {q.text}
                          </p>
                          <div className="mt-4 flex items-center gap-4">
                            <TypeBadge type={q.type} />
                            <div className="h-1 w-1 rounded-full bg-slate-200" />
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-black uppercase tracking-tighter">
                              <ShieldCheck size={12} className="text-success" />
                              Mandatory Validation
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {editingId !== q.id && (
                      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 pt-1">
                        <button
                          onClick={() => startEdit(q)}
                          className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-primary transition-all border border-slate-100 hover:border-blue-100 shadow-sm"
                          title="편집"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => deleteQuestion(q.id)}
                          className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-destructive transition-all border border-slate-100 hover:border-red-100 shadow-sm"
                          title="삭제"
                        >
                          <Trash2 size={15} />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === q.id ? null : q.id)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border shadow-sm ${
                              openMenu === q.id 
                                ? "bg-primary text-white border-primary shadow-blue-200" 
                                : "bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-400"
                            }`}
                            title="옵션"
                          >
                            <MoreHorizontal size={16} />
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
              <div className="flex-1 flex flex-col items-center justify-center py-24 text-center bg-white/40 rounded-[40px] border-2 border-dashed border-slate-200 m-4">
                <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center mb-6 shadow-inner">
                  <Sparkles size={36} className="text-slate-300" />
                </div>
                <p className="text-[18px] font-black text-slate-700">
                  작성된 설문 문항이 없습니다
                </p>
                <p className="text-[14px] text-slate-400 mt-2 font-bold max-w-xs leading-relaxed">
                  에이전트에게 주제를 제안하거나<br />[문항 추가] 버튼을 눌러 직접 설계하세요.
                </p>
              </div>
            )}
          </div>

          {/* Pagination Area */}
          {totalPages > 1 && (
            <div className="shrink-0 flex items-center justify-center py-6 border-t border-slate-100 bg-white/50">
              <AppPagination
                current={currentPage + 1}
                total={totalPages}
                onChange={(p) => setCurrentPage(p - 1)}
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="h-24 shrink-0 bg-white border-t border-border px-10 flex items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.04)] relative z-20">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <span className="text-[12px] text-slate-400 font-black uppercase tracking-widest">Status</span>
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[13px] text-foreground font-black ml-1">Drafting</span>
              </div>
              <p className="text-[13px] text-slate-400 font-bold ml-2">
                총 <span className="text-primary font-black">{questions.length}</span>개의 문항이 구성됨
              </p>
            </div>
            <div className="flex gap-3">
              <button
                className="px-8 py-3 rounded-2xl border border-slate-200 bg-white text-slate-600 font-black hover:bg-slate-50 transition-all shadow-md active:scale-95 text-[14px]"
              >
                미리보기
              </button>
              <button
                className="px-10 py-3 rounded-2xl bg-primary text-white font-black hover:bg-primary-hover transition-all shadow-xl shadow-blue-200 active:scale-95 text-[14px]"
              >
                설문 저장 및 확정
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
