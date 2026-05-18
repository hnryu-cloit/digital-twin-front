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
  contextVariant?: string;
  contextSummary?: string;
  contextEvidence?: Array<Record<string, unknown>>;
  evaluationScores?: Record<string, number>;
  evaluationRationale?: string;
}

interface CotModalProps {
  chat: ChatResponseForModal;
  onClose: () => void;
}

const EVALUATION_LABELS: Record<string, string> = {
  opinion_consistency: "의견 일관성",
  memory_recall: "기억 회상",
  logical_reasoning: "논리적 추론",
  lexical_fidelity: "어휘적 충실도",
  persona_tone: "페르소나 톤",
  syntactic_style: "통사적 스타일",
};

const CONTEXT_LABELS: Record<string, string> = {
  background: "Background",
  profile: "Profile",
  profile_lexical: "Profile + Lexical",
  profile_semantic: "Profile + Semantic",
};

export function CotModal({ chat, onClose }: CotModalProps) {
  const evaluationEntries = Object.entries(chat.evaluationScores ?? {});
  const contextEvidence = chat.contextEvidence ?? [];
  const contextLabel = CONTEXT_LABELS[chat.contextVariant ?? ""] ?? chat.contextVariant ?? "Profile + Semantic";

  return (
    <div className="app-modal-overlay">
      <div className="app-modal max-w-2xl animate-in zoom-in-95 duration-300">
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

          <div className="space-y-3">
            <h3 className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              Persona Context
            </h3>
            <div className="rounded-xl border border-[var(--border)] bg-card px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[12px] font-black text-foreground">{contextLabel}</span>
                <span className="text-[10px] font-bold uppercase text-primary">
                  {chat.contextVariant ?? "profile_semantic"}
                </span>
              </div>
              {chat.contextSummary && (
                <p className="mt-2 text-[11px] font-bold leading-relaxed text-muted-foreground">
                  {chat.contextSummary}
                </p>
              )}
              {contextEvidence.length > 0 && (
                <div className="mt-3 space-y-2">
                  {contextEvidence.slice(0, 3).map((item, index) => (
                    <div key={`${chat.id}-evidence-${index}`} className="rounded-lg bg-[var(--panel-soft)] px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-black text-secondary-foreground">
                          {String(item.source ?? item.segment ?? `Evidence ${index + 1}`)}
                        </span>
                        {item.score !== undefined && (
                          <span className="text-[10px] font-bold text-primary">{Number(item.score).toFixed(2)}</span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-relaxed text-muted-foreground">
                        {String(item.text ?? "")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {evaluationEntries.length > 0 && (
            <div className="space-y-3">
              <h3 className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Evaluation Metrics
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {evaluationEntries.map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-[var(--border)] bg-card px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-muted-foreground">
                        {EVALUATION_LABELS[key] ?? key}
                      </span>
                      <span className="text-[12px] font-black text-foreground">{Number(value).toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
              {chat.evaluationRationale && (
                <p className="rounded-xl bg-[var(--panel-soft)] px-4 py-3 text-[12px] font-bold leading-relaxed text-secondary-foreground">
                  {chat.evaluationRationale}
                </p>
              )}
            </div>
          )}
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
