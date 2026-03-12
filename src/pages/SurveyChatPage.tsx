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
  단일선택: { bg: "#EEF4FF", text: "#5B7DFF", border: "#BFD4FF" },
  복수선택: { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
  리커트척도: { bg: "#FFF7ED", text: "#EA580C", border: "#FED7AA" },
  주관식: { bg: "#F7FAFF", text: "#7C8397", border: "#DCE4F3" },
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
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border"
      style={{
        fontSize: 10,
        fontWeight: 600,
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
      className="absolute right-0 top-8 z-20 bg-white border border-[#E1E8F1] rounded-xl shadow-lg py-1.5 w-44"
    >
      {[
        { icon: <Settings size={12} />, label: "설정" },
        { icon: <Sparkles size={12} />, label: "문항 품질체크" },
        { icon: <ChevronRight size={12} />, label: "로직 설정" },
        { icon: <CheckSquare size={12} />, label: "필수 응답 여부" },
      ].map((item) => (
        <button
          key={item.label}
          onClick={onClose}
          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#EEF4FF] text-left transition-colors"
        >
          <span className="text-[#5B7DFF]">{item.icon}</span>
          <span style={{ fontSize: 12, color: "#1D1F3D" }}>{item.label}</span>
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

  /* 페이지네이션 버튼 목록 생성 (1 2 3 ... 5 형태) */
  const getPaginationItems = (): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);
    const items: (number | "...")[] = [];
    if (currentPage <= 3) {
      items.push(0, 1, 2, 3, 4, "...", totalPages - 1);
    } else if (currentPage >= totalPages - 4) {
      items.push(0, "...", totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1);
    } else {
      items.push(0, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages - 1);
    }
    return items;
  };

  return (
    <div className="flex flex-1 flex-col bg-[#EEF2FA] overflow-hidden">
      <WorkflowStepper currentPath="/survey" />
      <div className="bg-white border-b border-[#E1E8F1] px-6 pt-5 pb-4">
        <p style={{ fontSize: 11, color: "#5B7DFF", fontWeight: 600, letterSpacing: "0.06em" }}>
          SURVEY
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1D1F3D", lineHeight: 1.3 }}>
          설문 디자인
        </h1>
        <p style={{ fontSize: 13, color: "#7C8397", marginTop: 4 }}>
          대화형 편집으로 설문 문항을 설계하고 생성 결과를 바로 정리합니다
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">
      {/* Left: Chat Panel */}
      <div className="w-[420px] shrink-0 flex flex-col bg-white border-r border-[#E1E8F1]">
        {/* Panel Header */}
        <div className="px-5 pt-5 pb-4 border-b border-[#E1E8F1]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-[#EEF4FF] flex items-center justify-center">
              <Bot size={13} className="text-[#5B7DFF]" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1D1F3D" }}>
              설문 에이전트 채팅
            </span>
          </div>
          <p style={{ fontSize: 12, color: "#9BA6B8" }}>
            AI와 대화하면서 문항을 편집하고 구조를 다듬습니다.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
            >
              {msg.role === "bot" && (
                <div className="w-7 h-7 rounded-full bg-[#EEF4FF] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={13} className="text-[#5B7DFF]" />
                </div>
              )}
              <div
                className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-[#5B7DFF] text-white rounded-tr-sm"
                    : "bg-[#EEF2FA] text-[#1D1F3D] rounded-tl-sm"
                }`}
                style={{ fontSize: 13, lineHeight: 1.55 }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* AI Features Box */}
        <div className="mx-5 mb-4 rounded-xl border border-[#BFD4FF] bg-[#EEF4FF] p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={13} className="text-[#5B7DFF]" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#5B7DFF" }}>AI Features</span>
          </div>
          <ul className="flex flex-col gap-1">
            {[
              "Interactive Editing (문항 수정, 보기 추가/삭제)",
              "AI Quality Check (중복/유도 질문 경고)",
              "Natural Language Refinement ('7점 척도로 변경해줘')",
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-1.5">
                <span className="text-[#5B7DFF] mt-0.5">•</span>
                <span style={{ fontSize: 11, color: "#3C4556", lineHeight: 1.5 }}>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Input */}
        <div className="px-4 pb-5">
          <div className="flex items-center gap-2 bg-[#EEF2FA] rounded-xl border border-[#E1E8F1] px-3 py-2">
            <input
              className="flex-1 bg-transparent outline-none text-[#1D1F3D] placeholder:text-[#9BA6B8]"
              style={{ fontSize: 13 }}
              placeholder="메시지를 입력하세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                input.trim()
                  ? "bg-[#5B7DFF] hover:bg-[#4562E8]"
                  : "bg-[#DCE4F3]"
              }`}
            >
              <Send size={13} className={input.trim() ? "text-white" : "text-[#9BA6B8]"} />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Generated Questions */}
      <div className="flex-1 flex flex-col bg-[#EEF2FA] overflow-hidden">
        {/* Panel Header */}
        <div className="px-6 pt-5 pb-4 bg-white border-b border-[#E1E8F1]">
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 11, color: "#5B7DFF", fontWeight: 600, letterSpacing: "0.06em" }}>
                WORKSPACE
              </p>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1D1F3D" }}>
                생성 문항
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="bg-[#EEF4FF] text-[#5B7DFF] px-2.5 py-1 rounded-full border border-[#BFD4FF]"
                style={{ fontSize: 12, fontWeight: 600 }}
              >
                {questions.length}개 문항
              </span>
              <button
                onClick={addQuestion}
                className="flex items-center gap-1.5 bg-[#5B7DFF] text-white px-3 py-1.5 rounded-lg hover:bg-[#4562E8] transition-colors shadow-sm"
                style={{ fontSize: 12, fontWeight: 600 }}
              >
                <Plus size={13} />
                문항 추가
              </button>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
          {pagedQuestions.map((q, localIdx) => {
            const globalIdx = currentPage * QUESTIONS_PER_PAGE + localIdx;
            return (
              <div
                key={q.id}
                className="bg-white rounded-xl border border-[#E1E8F1] shadow-sm p-4 group relative"
              >
                <div className="flex items-start gap-3">
                  {/* Drag handle + number */}
                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    <GripVertical size={14} className="text-[#DCE4F3] cursor-grab" />
                    <span
                      className="w-5 h-5 rounded-full bg-[#5B7DFF] text-white flex items-center justify-center"
                      style={{ fontSize: 10, fontWeight: 700 }}
                    >
                      {globalIdx + 1}
                    </span>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1 min-w-0">
                    {editingId === q.id ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          className="w-full border border-[#5B7DFF] rounded-lg px-3 py-2 outline-none resize-none bg-[#F7FAFF]"
                          style={{ fontSize: 13, color: "#1D1F3D", lineHeight: 1.5 }}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={2}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="px-3 py-1 bg-[#5B7DFF] text-white rounded-lg hover:bg-[#4562E8] transition-colors"
                            style={{ fontSize: 11, fontWeight: 600 }}
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 bg-[#F1F5F9] text-[#7C8397] rounded-lg hover:bg-[#DCE4F3] transition-colors"
                            style={{ fontSize: 11, fontWeight: 600 }}
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p style={{ fontSize: 13, color: "#1D1F3D", lineHeight: 1.55 }}>
                          <span style={{ fontWeight: 600 }}>Q{globalIdx + 1}.</span> {q.text}
                        </p>
                        <div className="mt-2">
                          <TypeBadge type={q.type} />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {editingId !== q.id && (
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(q)}
                        className="w-7 h-7 rounded-lg bg-[#EEF2FA] hover:bg-[#EEF4FF] flex items-center justify-center transition-colors"
                        title="편집"
                      >
                        <Pencil size={12} className="text-[#5B7DFF]" />
                      </button>
                      <button
                        onClick={() => deleteQuestion(q.id)}
                        className="w-7 h-7 rounded-lg bg-[#EEF2FA] hover:bg-[#FFF0F0] flex items-center justify-center transition-colors"
                        title="삭제"
                      >
                        <Trash2 size={12} className="text-[#E53E3E]" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === q.id ? null : q.id)}
                          className="w-7 h-7 rounded-lg bg-[#EEF2FA] hover:bg-[#EEF4FF] flex items-center justify-center transition-colors"
                          title="설정"
                        >
                          <MoreHorizontal size={12} className="text-[#7C8397]" />
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
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF4FF] flex items-center justify-center mb-3">
                <Sparkles size={22} className="text-[#5B7DFF]" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#1D1F3D" }}>
                아직 생성된 문항이 없습니다
              </p>
              <p style={{ fontSize: 12, color: "#9BA6B8", marginTop: 4 }}>
                좌측 채팅창에서 원하는 설문을 요청해보세요.
              </p>
            </div>
          )}

        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center bg-[#EEF2FA] px-6 py-2 shrink-0">
            <AppPagination
              current={currentPage + 1}
              total={totalPages}
              onChange={(p) => setCurrentPage(p - 1)}
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="bg-white border-t border-[#E1E8F1] px-6 py-3 flex items-center justify-between">
          <p style={{ fontSize: 12, color: "#9BA6B8" }}>
            총 <span style={{ color: "#5B7DFF", fontWeight: 600 }}>{questions.length}</span>개 문항이 구성되었습니다.
          </p>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 border border-[#E1E8F1] rounded-lg text-[#3C4556] hover:bg-[#EEF2FA] transition-colors"
              style={{ fontSize: 12, fontWeight: 600 }}
            >
              미리보기
            </button>
            <button
              className="px-4 py-2 bg-[#5B7DFF] text-white rounded-lg hover:bg-[#4562E8] transition-colors shadow-sm"
              style={{ fontSize: 12, fontWeight: 600 }}
            >
              설문 저장
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
