import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Send, User, X, RotateCcw } from "lucide-react";
import { assistantApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import favicon from "@/assets/favicon.svg";
import { useProject } from "@/hooks/useProject";

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
    content:
      "안녕하세요! Digital Twin AI 어시스턴트입니다. 현재 분석 중인 데이터나 리포트에 대해 궁금한 점을 질문해 주세요.",
    timestamp: "오전 09:00",
  },
];

export const FloatingAiChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { projectId } = useProject();
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

  const send = async () => {
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

    try {
      const history = messages.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        message: m.content,
      }));

      const res = await assistantApi.chat(text, history, projectId);

      if (res) {
        const aiMsg: Message = {
          id: nextId.current++,
          role: "assistant",
          content: res.answer,
          evidence: res.evidence,
          confidence: res.confidence,
          timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error("No response from AI assistant");
      }
    } catch (error) {
      console.error("AI Assistant Error:", error);
      const errorMsg: Message = {
        id: nextId.current++,
        role: "assistant",
        content: "죄송합니다. 메시지 처리 중 오류가 발생했습니다. 다시 시도해 주세요.",
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-5 flex h-[640px] w-[390px] flex-col overflow-hidden rounded-[32px] border border-[#DCE4F3] bg-card shadow-[var(--shadow-lg)] animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between bg-[var(--primary-active-text)] px-6 py-5 text-white shadow-[var(--shadow-lg)]">
            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-card p-1.5 shadow-[var(--shadow-sm)]">
                <img src={favicon} alt="Icon" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-[15px] font-black tracking-tight">Digital Twin AI 어시스턴트</p>
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
              <button onClick={() => setIsOpen(false)} className="rounded-lg p-1.5 hover:bg-white/10 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-[#F8FAFF] p-6 hide-scrollbar">
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}>
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-[var(--shadow-sm)] overflow-hidden",
                      msg.role === "assistant"
                        ? "bg-card p-1.5 border-[var(--border)]"
                        : "bg-[var(--muted-foreground)] border-[var(--subtle-foreground)]"
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <img src={favicon} className="h-full w-full" />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div
                    className={cn("flex max-w-[85%] flex-col gap-2", msg.role === "user" ? "items-end" : "items-start")}
                  >
                    <div
                      className={cn(
                        "rounded-[20px] px-4 py-3 text-[13px] shadow-[var(--shadow-sm)] leading-relaxed",
                        msg.role === "user"
                          ? "rounded-tr-none bg-[var(--primary-active-text)] text-white font-bold"
                          : "rounded-tl-none border border-[#DCE4F3] bg-card text-[var(--secondary-foreground)] font-bold"
                      )}
                    >
                      {msg.content}
                    </div>
                    {msg.evidence && (
                      <div className="w-full rounded-2xl border border-[#BFD1ED]/40 bg-white/60 p-4 shadow-inner">
                        <p className="mb-2 text-[10px] font-black text-[var(--primary-active-text)] uppercase tracking-[0.15em]">
                          Analysis Evidence
                        </p>
                        <div className="space-y-1.5">
                          {msg.evidence.map((ev) => (
                            <div key={ev.label} className="flex justify-between text-[11px]">
                              <span className="text-[var(--subtle-foreground)] font-bold uppercase">{ev.label}</span>
                              <span className="font-black text-[var(--secondary-foreground)]">{ev.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <span className="text-[10px] font-black text-[var(--subtle-foreground)] uppercase">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card border border-[#DCE4F3] p-1.5 shadow-[var(--shadow-sm)]">
                    <img src={favicon} className="h-full w-full" />
                  </div>
                  <div className="rounded-[20px] rounded-tl-none border border-[#DCE4F3] bg-card px-4 py-3 shadow-[var(--shadow-sm)]">
                    <div className="flex gap-1.5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--primary-active-text)]/40" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--primary-active-text)]/40 [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--primary-active-text)]/40 [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-[var(--border)] bg-card p-5">
            <div className="flex items-center gap-3 rounded-2xl border border-[#D6E0F0] bg-background px-4 py-2.5 transition-all focus-within:border-[var(--primary-active-text)] focus-within:bg-card focus-within:shadow-[var(--shadow-lg)] focus-within:">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="질문을 입력하세요..."
                className="flex-1 bg-transparent text-[13px] font-bold outline-none text-[var(--secondary-foreground)] placeholder:text-[var(--subtle-foreground)]"
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--primary-active-text)] text-white shadow-[var(--shadow-lg)] transition-all hover:bg-[#1E46A8] disabled:opacity-30 active:scale-95"
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
          "flex h-14 w-14 items-center justify-center rounded-full shadow-[var(--shadow-lg)] transition-all duration-300 hover:scale-105 active:scale-95 border-2",
          isOpen
            ? "bg-foreground border-[var(--subtle-foreground)] text-card"
            : "bg-card border-primary/10 text-primary"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="h-8 w-8">
            <img src={favicon} alt="AI" className="h-full w-full object-contain" />
          </div>
        )}
      </button>
    </div>
  );
};
