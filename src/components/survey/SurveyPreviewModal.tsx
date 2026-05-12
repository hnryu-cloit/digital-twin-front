import { X } from "lucide-react";
import type { SurveyDraftPreview } from "@/lib/api";
import { TypeBadge } from "@/components/survey/TypeBadge";

type QuestionType = "단일선택" | "복수선택" | "리커트척도" | "주관식";

interface SurveyPreviewModalProps {
  preview: SurveyDraftPreview;
  onClose: () => void;
  onConfirm: () => void;
  confirming: boolean;
}

export function SurveyPreviewModal({ preview, onClose, onConfirm, confirming }: SurveyPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] bg-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-[var(--border)] px-8 py-6">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Draft Preview</p>
            <h2 className="mt-2 text-[24px] font-black text-foreground">설문 초안 미리보기</h2>
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-[var(--muted-foreground)]">
              {preview.summary}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] text-[var(--muted-foreground)] transition-colors hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid flex-1 overflow-hidden md:grid-cols-[1fr_320px]">
          <div className="overflow-y-auto px-8 py-6">
            <div className="mb-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-[var(--border)] bg-background px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--subtle-foreground)]">
                  문항 수
                </p>
                <p className="mt-2 text-[20px] font-black text-foreground">{preview.generation_meta.question_count}</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-background px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--subtle-foreground)]">
                  Draft
                </p>
                <p className="mt-2 text-[20px] font-black text-foreground">{preview.generation_meta.draft_count}</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-background px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--subtle-foreground)]">
                  Confirmed
                </p>
                <p className="mt-2 text-[20px] font-black text-foreground">{preview.generation_meta.confirmed_count}</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-background px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--subtle-foreground)]">
                  템플릿
                </p>
                <p className="mt-2 text-[14px] font-black text-foreground">
                  {preview.generation_meta.template_id ?? "직접 편집"}
                </p>
              </div>
            </div>
            <div className="space-y-5">
              {preview.questions.map((question, index) => (
                <div key={question.id} className="rounded-3xl border border-[var(--border)] bg-background p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="rounded-xl bg-primary px-3 py-1 text-[11px] font-black text-white">
                      Q{index + 1}
                    </span>
                    <TypeBadge type={question.type as QuestionType} />
                    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--subtle-foreground)]">
                      {question.status ?? "draft"}
                    </span>
                  </div>
                  <p className="text-[15px] font-bold leading-relaxed text-foreground">{question.text}</p>
                  <p className="mt-3 text-[13px] font-medium leading-relaxed text-[var(--secondary-foreground)]">
                    {question.rationale}
                  </p>
                  {question.options && question.options.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {question.options.map((option) => (
                        <span
                          key={`${question.id}-${option}`}
                          className="rounded-full border border-[var(--border)] bg-card px-3 py-1 text-[12px] font-semibold text-[var(--secondary-foreground)]"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto border-l border-[var(--border)] bg-[var(--panel-soft)]/35 px-6 py-6">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Question Evidence</p>
            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-card p-4">
              <p className="text-[13px] font-black text-foreground">생성 메타데이터</p>
              <div className="mt-3 space-y-2 text-[12px] font-semibold text-[var(--secondary-foreground)]">
                <div className="flex items-center justify-between gap-3">
                  <span>최근 job</span>
                  <span className="font-black text-primary">{preview.generation_meta.latest_job_id ?? "-"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>세그먼트 소스</span>
                  <span className="font-black text-primary">{preview.generation_meta.segment_source ?? "-"}</span>
                </div>
                <div className="border-t border-[var(--border)] pt-2">
                  <p className="mb-1 text-[11px] font-black uppercase tracking-[0.12em] text-[var(--subtle-foreground)]">
                    사용자 요청
                  </p>
                  <p className="leading-relaxed">{preview.generation_meta.user_prompt ?? "기록 없음"}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {preview.questions.map((question, index) => (
                <div key={`evidence-${question.id}`} className="rounded-2xl border border-[var(--border)] bg-card p-4">
                  <p className="mb-3 text-[13px] font-black text-foreground">Q{index + 1} 근거</p>
                  <div className="space-y-2">
                    {question.evidence.map((item) => (
                      <div
                        key={`${question.id}-${item.label}`}
                        className="flex items-center justify-between gap-3 border-b border-[var(--border)]/60 py-2 last:border-b-0"
                      >
                        <span className="text-[12px] font-semibold text-[var(--secondary-foreground)]">
                          {item.label}
                        </span>
                        <span className="text-[12px] font-black text-primary">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] bg-[var(--panel-soft)]/35 px-8 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-[var(--border)] bg-card px-5 py-2.5 text-[13px] font-semibold text-[var(--secondary-foreground)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            닫기
          </button>
          <button
            onClick={onConfirm}
            disabled={confirming || preview.status === "confirmed"}
            className="rounded-xl bg-primary px-6 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {preview.status === "confirmed" ? "이미 확정됨" : confirming ? "확정 중..." : "이 초안 확정"}
          </button>
        </div>
      </div>
    </div>
  );
}
