import type React from "react";
import { useRef, useState, useEffect } from "react";
import { Send, User, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import favicon from "@/assets/favicon.svg";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  evidence?: { label: string; value: string }[];
  confidence?: number;
  timestamp: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content: "안녕하세요! Digital Twin AI 어시스턴트입니다. 현재 분석 중인 데이터나 리포트에 대해 궁금한 점을 질문해 주세요.",
    timestamp: "오전 09:00",
  },
];

const mockResponses: Record<string, Message> = {
  default: {
    id: 0,
    role: "assistant",
    content: "현재 분석 결과, 30대 Gamer 세그먼트의 구매 의향이 전주 대비 12% 상승했습니다. 특히 카메라의 AI 보정 기능이 주된 요인으로 분석됩니다.",
    evidence: [
      { label: "데이터 신뢰도", value: "94%" },
      { label: "분석 표본", value: "30,000명" },
    ],
    confidence: 94,
    timestamp: "",
  },
  리포트: {
    id: 0,
    role: "assistant",
    content: "리포트 종합 요약에 따르면, 신규 컨셉에 대한 긍정 반응이 68%로 매우 높게 나타납니다. 가격 저항선이 높은 고연령층을 위한 별도 혜택 구성을 추천합니다.",
    evidence: [
      { label: "주요 인사이트", value: "가격 최적화 필요" },
      { label: "추천 액션", value: "보상판매 강화" },
    ],
    confidence: 91,
    timestamp: "",
  },
};

export const FloatingAiChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [isOpen, messages]);

  const send = () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: nextId.current++,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const res = text.includes("리포트") ? mockResponses["리포트"] : mockResponses["default"];
      const aiMsg: Message = {
        ...res,
        id: nextId.current++,
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="fixed bottom-20 right-8 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-5 flex h-[640px] w-[390px] flex-col overflow-hidden rounded-[32px] border border-[#DCE4F3] bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between bg-[#2454C8] px-6 py-5 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm">
                <img src={favicon} alt="Icon" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-[15px] font-black tracking-tight">AI 분석 어시스턴트</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-[11px] opacity-80 font-bold uppercase tracking-widest">Real-time Analysis</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setMessages(initialMessages)}
                className="rounded-lg p-1.5 hover:bg-white/10 transition-colors"
                title="대화 초기화"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-[#F8FAFF] p-6 hide-scrollbar">
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}>
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-sm overflow-hidden",
                    msg.role === "assistant" ? "bg-white p-1.5 border-[#DCE4F3]" : "bg-slate-400 border-slate-300"
                  )}>
                    {msg.role === "assistant" ? <img src={favicon} className="h-full w-full" /> : <User className="h-4 w-4 text-white" />}
                  </div>
                  <div className={cn("flex max-w-[85%] flex-col gap-2", msg.role === "user" ? "items-end" : "items-start")}>
                    <div className={cn(
                      "rounded-[20px] px-4 py-3 text-[13px] shadow-sm leading-relaxed",
                      msg.role === "user" 
                        ? "rounded-tr-none bg-[#2454C8] text-white font-bold" 
                        : "rounded-tl-none border border-[#DCE4F3] bg-white text-slate-700 font-bold"
                    )}>
                      {msg.content}
                    </div>
                    {msg.evidence && (
                      <div className="w-full rounded-2xl border border-[#BFD1ED]/40 bg-white/60 p-4 shadow-inner">
                        <p className="mb-2 text-[10px] font-black text-[#2454C8] uppercase tracking-[0.15em]">Analysis Evidence</p>
                        <div className="space-y-1.5">
                          {msg.evidence.map((ev) => (
                            <div key={ev.label} className="flex justify-between text-[11px]">
                              <span className="text-slate-400 font-bold uppercase">{ev.label}</span>
                              <span className="font-black text-slate-600">{ev.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <span className="text-[10px] font-black text-slate-300 uppercase">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-[#DCE4F3] p-1.5 shadow-sm">
                    <img src={favicon} className="h-full w-full" />
                  </div>
                  <div className="rounded-[20px] rounded-tl-none border border-[#DCE4F3] bg-white px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#2454C8]/40" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#2454C8]/40 [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#2454C8]/40 [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-border bg-white p-5">
            <div className="flex items-center gap-3 rounded-2xl border border-[#D6E0F0] bg-[#F8FAFC] px-4 py-2.5 transition-all focus-within:border-[#2454C8] focus-within:bg-white focus-within:shadow-lg focus-within:shadow-blue-50">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="질문을 입력하세요..."
                className="flex-1 bg-transparent text-[13px] font-bold outline-none text-slate-700 placeholder:text-slate-300"
              />
              <button 
                onClick={send}
                disabled={!input.trim() || loading}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2454C8] text-white shadow-lg shadow-blue-100 transition-all hover:bg-[#1E46A8] disabled:opacity-30 active:scale-95"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-16 w-14 items-center justify-center rounded-[20px] shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border-2",
          isOpen 
            ? "bg-slate-900 border-slate-800 text-white" 
            : "bg-white border-[#316BFF]/10 text-[#316BFF]"
        )}
      >
        {isOpen ? (
          <X className="h-7 w-7" />
        ) : (
          <div className="h-10 w-10 relative">
            <img src={favicon} alt="AI" className="h-full w-full object-contain" />
            <div className="absolute -right-1 -top-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping" />
            <div className="absolute -right-1 -top-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm" />
          </div>
        )}
      </button>
    </div>
  );
};
