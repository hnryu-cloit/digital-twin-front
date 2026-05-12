import { Eye, ShieldCheck, Sparkles, X } from "lucide-react";

export interface ChatResponseForModal {
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

interface CotModalProps {
  chat: ChatResponseForModal;
  onClose: () => void;
}

export function CotModal({ chat, onClose }: CotModalProps) {
  return (
    <div className="app-modal-overlay">
      <div className="app-modal max-w-xl animate-in zoom-in-95 duration-300">
        <div className="app-modal-header">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] text-primary">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-[20px] font-black tracking-tight text-foreground">응답 일관성 상세 분석</h2>
              <p className="mt-0.5 text-[11px] font-black uppercase tracking-[0.15em] text-primary opacity-70">
                Response Integrity Logic
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-card text-muted-foreground transition-all hover:bg-[var(--surface-hover)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="app-modal-body space-y-8">
          <div className="space-y-3">
            <div className="app-soft border-border/30 bg-[var(--panel-soft)]/50 px-5 py-3">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-white">
                  {chat.questionId}
                </span>
              </div>
              <p className="text-[13px] font-bold leading-snug text-muted-foreground">{chat.questionText}</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/8 px-5 py-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary shadow-[var(--shadow-sm)]">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4L4 7L9 1"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-[16px] font-black leading-tight text-primary">{chat.selectedOption}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              사고 과정 추적 (Reasoning)
            </h3>
            <div className="space-y-3">
              {chat.cot.map((step, index) => (
                <div key={`${chat.id}-${index}`} className="group flex gap-4">
                  <div className="flex shrink-0 flex-col items-center">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--border)] bg-card text-[10px] font-bold text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary">
                      {index + 1}
                    </div>
                    {index < chat.cot.length - 1 && <div className="my-1 w-0.5 flex-1 bg-[var(--border)]" />}
                  </div>
                  <p className="pt-0.5 text-[13px] font-bold leading-relaxed text-secondary-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="app-modal-footer bg-[var(--panel-soft)]/50">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-success" />
            <span className="text-[12px] font-bold uppercase text-muted-foreground">
              검증된 일관성 지수: {chat.integrityScore}%
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-card px-4 py-2 text-[12px] font-bold text-foreground transition-all hover:border-primary/40 hover:bg-[var(--primary-light-bg)] hover:text-primary active:scale-95"
          >
            <Eye size={13} />
            CoT 추론 전체 보기
          </button>
        </div>
      </div>
    </div>
  );
}
