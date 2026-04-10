import type React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  X,
} from "lucide-react";
import { WorkflowStepper } from "@/components/layout/WorkflowStepper";
import { AppPagination } from "@/components/ui/AppPagination";
import { AiLoadingModal } from "@/components/ui/ai-loading-modal";
import { buttonVariants } from "@/components/ui/button";
import { startNavigationLoading, stopNavigationLoading } from "@/lib/navigationLoading";
import { cn } from "@/lib/utils";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import favicon from "@/assets/favicon.svg";
import {
  aiJobApi,
  surveyApi,
  type AIJob,
  type SurveyDraftPreview,
  type SurveyQualityCheckResponse,
  type SurveyTemplate,
} from "@/lib/api";
import { useProject } from "@/hooks/useProject";

type QuestionType = "단일선택" | "복수선택" | "리커트척도" | "주관식";

interface Question {
  id: number | string;
  text: string;
  type: QuestionType;
  options?: string[];
  status?: string;
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

const INITIAL_QUESTIONS: Question[] = [];

type ChatRole = "user" | "bot";
interface ChatMessage {
  id: number | string;
  role: ChatRole;
  text: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    role: "bot",
    text: "반갑습니다! 삼성 디지털 트윈 설문 설계 어시스턴트입니다. 어떤 조사를 도와드릴까요?",
  },
];

function normalizeQuestionType(value?: string): QuestionType {
  switch (value) {
    case "single_choice":
    case "radio":
    case "단일선택":
      return "단일선택";
    case "multiple_choice":
    case "checkbox":
    case "복수선택":
      return "복수선택";
    case "scale":
    case "likert":
    case "리커트척도":
      return "리커트척도";
    case "text":
    case "subjective":
    case "주관식":
      return "주관식";
    default:
      return "단일선택";
  }
}

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

interface ValidationRow {
  id: number | string;
  questionNo: string;
  text: string;
  type: QuestionType;
  score: number;
  tone: "high" | "medium" | "low";
  reasons: string[];
}

function buildValidationRows(questions: Question[]): ValidationRow[] {
  const normalizedTexts = questions.map((question) =>
    question.text
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
  );

  return questions.map((question, index) => {
    let score = 100;
    const reasons: string[] = [];
    const trimmedText = question.text.trim();
    const options = (question.options ?? []).filter((option) => option.trim().length > 0);
    const duplicateCount = normalizedTexts.filter((text) => text === normalizedTexts[index]).length;

    if (trimmedText.length < 12) {
      score -= 18;
      reasons.push("문항 텍스트가 짧아 의도가 충분히 드러나지 않습니다.");
    }

    if (trimmedText.length > 90) {
      score -= 8;
      reasons.push("문항 문장이 길어 응답 피로를 유발할 수 있습니다.");
    }

    if (duplicateCount > 1) {
      score -= 22;
      reasons.push("유사하거나 중복된 문항이 포함되어 있습니다.");
    }

    if ((question.type === "단일선택" || question.type === "복수선택") && options.length < 2) {
      score -= 24;
      reasons.push("선택형 문항인데 선택지가 부족합니다.");
    }

    if ((question.type === "단일선택" || question.type === "복수선택") && options.length > 7) {
      score -= 10;
      reasons.push("선택지가 많아 응답 판단이 분산될 수 있습니다.");
    }

    if (question.type === "리커트척도" && options.length > 0 && options.length !== 5) {
      score -= 14;
      reasons.push("리커트 척도는 5점 구조가 가장 안정적입니다.");
    }

    if (question.type === "주관식" && options.length > 0) {
      score -= 20;
      reasons.push("주관식 문항에는 선택지가 없어야 합니다.");
    }

    if (!/[?？]|다음|얼마나|어느 정도|무엇|어떻게|왜|가장/.test(trimmedText)) {
      score -= 8;
      reasons.push("질문형 표현이 약해 응답자가 문항 의도를 바로 이해하기 어려울 수 있습니다.");
    }

    if (reasons.length === 0) {
      reasons.push("문항 구조와 응답 형식이 안정적으로 설계되었습니다.");
    }

    const boundedScore = Math.max(48, Math.min(100, score));
    return {
      id: question.id,
      questionNo: `Q${index + 1}`,
      text: trimmedText,
      type: question.type,
      score: boundedScore,
      tone: boundedScore >= 85 ? "high" : boundedScore >= 70 ? "medium" : "low",
      reasons: reasons.slice(0, 2),
    };
  });
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
      if (spaceBelow < 250) {
        // Enough space for menu
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
        { icon: <Settings size={13} />, label: "상세 설정" },
        { icon: <Sparkles size={13} />, label: "문항 품질체크" },
        { icon: <CheckSquare size={13} />, label: "필수 응답" },
      ].map((item) => (
        <button
          key={item.label}
          onClick={onClose}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--surface-hover)] text-left transition-colors group"
        >
          <span className="text-[var(--subtle-foreground)] group-hover:text-primary transition-colors">
            {item.icon}
          </span>
          <span className="text-[12px] font-medium text-[var(--secondary-foreground)]">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

function PreviewModal({
  preview,
  onClose,
  onConfirm,
  confirming,
}: {
  preview: SurveyDraftPreview;
  onClose: () => void;
  onConfirm: () => void;
  confirming: boolean;
}) {
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

const QUESTIONS_PER_PAGE = 5;

export const SurveyChatPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = (location.state as {
    projectId?: string;
    showEntryLoading?: boolean;
    segmentFilter?: {
      totalMatched: number;
      totalPopulation: number;
      hasFilters: boolean;
      segments: Array<{ name: string; count: number }>;
      personaIds: string[];
      filterSummary: string;
    };
  } | null) ?? null;
  const routeProjectId = routeState?.projectId ?? null;
  const segmentFilter = routeState?.segmentFilter ?? null;
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [input, setInput] = useState("");
  const { projectId } = useProject(routeProjectId);
  const [entryLoading, setEntryLoading] = useState(Boolean(routeState?.showEntryLoading));
  const [activeJob, setActiveJob] = useState<AIJob | null>(null);
  const [openMenu, setOpenMenu] = useState<number | string | null>(null);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editText, setEditText] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [preview, setPreview] = useState<SurveyDraftPreview | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [confirming, setConfirming] = useState(false);
  const [qualityCheck] = useState<SurveyQualityCheckResponse | null>(null);
  const [qualityCheckOpen, setQualityCheckOpen] = useState(false);
  const qualityCheckLoading = false;
  const [templates, setTemplates] = useState<SurveyTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("tpl_concept_test_v1");
  const [initialDataReady, setInitialDataReady] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, Math.ceil(questions.length / QUESTIONS_PER_PAGE));
  const pagedQuestions = questions.slice(currentPage * QUESTIONS_PER_PAGE, (currentPage + 1) * QUESTIONS_PER_PAGE);
  const validationRows = useMemo(() => buildValidationRows(questions), [questions]);
  const validationAverageScore =
    validationRows.length > 0
      ? Math.round(validationRows.reduce((sum, row) => sum + row.score, 0) / validationRows.length)
      : qualityCheck?.score ?? 0;
  const generationStatus =
    activeJob?.status === "running" || activeJob?.status === "queued"
      ? "Generating"
      : activeJob?.status === "failed"
        ? "Failed"
        : "Drafting";

  // 마운트 시 API에서 설문 문항 로드 (projectId resolve 후 실행)
  useEffect(() => {
    if (!projectId) return;
    const loadQuestions = async () => {
      try {
        const [apiQuestions, apiTemplates] = await Promise.all([
          surveyApi.getQuestions(projectId),
          surveyApi.getTemplates(),
        ]);
        setTemplates(apiTemplates);
        if (apiTemplates.length > 0) {
          setSelectedTemplateId((current) =>
            apiTemplates.some((item) => item.template_id === current) ? current : apiTemplates[0].template_id
          );
        }
        if (apiQuestions.length > 0) {
          setQuestions(
            apiQuestions.map((q) => ({
              id: q.id,
              text: q.text,
              type: normalizeQuestionType(q.type),
              options: q.options ?? [],
              status: q.status,
            }))
          );
        }
      } finally {
        setInitialDataReady(true);
        if (routeState?.showEntryLoading) {
          window.setTimeout(() => {
            setEntryLoading(false);
            stopNavigationLoading();
          }, 1200);
        } else {
          setEntryLoading(false);
          stopNavigationLoading();
        }
      }
    };
    void loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (
      !activeJob ||
      activeJob.status === "completed" ||
      activeJob.status === "failed" ||
      activeJob.status === "cancelled"
    ) {
      return;
    }

    const timer = window.setInterval(async () => {
      const nextJob = await aiJobApi.getJob(activeJob.id);
      if (!nextJob) return;
      setActiveJob(nextJob);

      if (nextJob.status === "completed" && projectId) {
        const apiQuestions = await surveyApi.getQuestions(projectId);
        setQuestions(
          apiQuestions.map((q) => ({
            id: q.id,
            text: q.text,
            type: normalizeQuestionType(q.type),
            options: q.options ?? [],
            status: q.status,
          }))
        );
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            role: "bot",
            text: `AI가 설문 초안을 생성했습니다. ${apiQuestions.length}개 문항을 반영했습니다.`,
          },
        ]);
      }

      if (nextJob.status === "failed") {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            role: "bot",
            text: `설문 생성에 실패했습니다. ${nextJob.error_message ?? "잠시 후 다시 시도해주세요."}`,
          },
        ]);
      }
    }, 1500);

    return () => window.clearInterval(timer);
  }, [activeJob, projectId]);

  const sendMessage = async () => {
    const message = input.trim();
    if (!message || !projectId || activeJob?.status === "queued" || activeJob?.status === "running") return;
    const selectedTemplate = templates.find((item) => item.template_id === selectedTemplateId);
    const newMsg: ChatMessage = { id: Date.now(), role: "user", text: message };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    const job = await surveyApi.generateJob({
      project_id: projectId,
      user_prompt: message,
      survey_type: selectedTemplate?.survey_type ?? "concept",
      question_count: selectedTemplate?.recommended_question_count ?? 5,
      template: selectedTemplate
        ? {
            template_id: selectedTemplate.template_id,
            template_version: selectedTemplate.template_version,
            required_blocks: selectedTemplate.required_blocks,
          }
        : {
            template_id: "tpl_concept_test_v1",
            template_version: 1,
            required_blocks: ["awareness", "appeal", "purchase_intent", "concern", "open_feedback"],
          },
      segment_context: {
        source: "survey_chat_page",
        selected_segments: segmentFilter?.segments.map((s) => s.name) ?? [],
        persona_ids: segmentFilter?.personaIds ?? [],
        filter_summary: segmentFilter?.filterSummary ?? "",
        target_count: segmentFilter?.totalMatched ?? 0,
      },
    });

    if (!job) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "bot",
          text: "설문 생성 요청을 전송하지 못했습니다. 백엔드 상태를 확인해주세요.",
        },
      ]);
      return;
    }

    setActiveJob(job);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        role: "bot",
        text: "설문 생성 job을 시작했습니다. AI가 초안을 생성하는 중입니다.",
      },
    ]);
  };

  const deleteQuestion = (id: number | string) => {
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
    setQuestions((prev) => prev.map((q) => (q.id === editingId ? { ...q, text: editText, status: "draft" } : q)));
    setEditingId(null);
    setSyncStatus("idle");
  };

  const addQuestion = () => {
    const newQ: Question = {
      id: Date.now(),
      text: "새 문항을 입력하세요.",
      type: "단일선택",
      options: [],
      status: "draft",
    };
    setQuestions((prev) => {
      const next = [...prev, newQ];
      setCurrentPage(Math.ceil(next.length / QUESTIONS_PER_PAGE) - 1);
      return next;
    });
    setEditingId(newQ.id);
    setEditText(newQ.text);
    setSyncStatus("idle");
  };

  const syncQuestions = async () => {
    if (!projectId) return false;
    setSyncStatus("saving");
    const saved = await surveyApi.saveQuestions(
      projectId,
      questions.map((question) => ({
        text: question.text,
        type: question.type,
        options: question.options ?? [],
      }))
    );
    if (saved.length === 0 && questions.length > 0) {
      setSyncStatus("error");
      return false;
    }
    setQuestions(
      saved.map((q) => ({
        id: q.id,
        text: q.text,
        type: normalizeQuestionType(q.type),
        options: q.options ?? [],
        status: q.status,
      }))
    );
    setSyncStatus("saved");
    return true;
  };

  const openPreview = async () => {
    if (!projectId) return;
    const synced = await syncQuestions();
    if (!synced) return;
    const nextPreview = await surveyApi.getPreview(projectId);
    if (!nextPreview) {
      setSyncStatus("error");
      return;
    }
    setPreview(nextPreview);
    setPreviewOpen(true);
  };

  const confirmSurvey = async () => {
    if (!projectId || confirming) return;
    setQualityCheckOpen(false);
    setConfirming(true);
    const synced = await syncQuestions();
    if (!synced) {
      setConfirming(false);
      return;
    }
    const confirmed = await surveyApi.confirm(projectId);
    if (!confirmed) {
      setSyncStatus("error");
      setConfirming(false);
      return;
    }
    const nextPreview = await surveyApi.getPreview(projectId);
    if (nextPreview) {
      setPreview(nextPreview);
      setQuestions(
        nextPreview.questions.map((q) => ({
          id: q.id,
          text: q.text,
          type: normalizeQuestionType(q.type),
          options: q.options ?? [],
          status: q.status,
        }))
      );
    }
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "bot",
        text: "현재 설문 초안을 저장하고 확정했습니다. 이후 시뮬레이션과 리포트 흐름에서 사용할 수 있습니다.",
      },
    ]);
    setSyncStatus("saved");
    setConfirming(false);
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT_ID, projectId);
    startNavigationLoading({
      title: "실시간 응답 시뮬레이션 시작",
      steps: [
        "확정된 설문 구성을 반영하고 있습니다…",
        "응답 대상과 세그먼트 조건을 불러오고 있습니다…",
        "문항 데이터와 분석 구성을 연결하고 있습니다…",
        "응답 피드와 모니터링을 초기화하고 있습니다…",
        "실시간 응답 시뮬레이션을 시작하고 있습니다…",
      ],
    });
    navigate("/live", {
      state: {
        projectId,
        segmentFilter,
        autoStartSimulation: true,
      },
    });
  };

  const initialScreenLoading = entryLoading || !initialDataReady;

  if (initialScreenLoading) {
    if (routeState?.showEntryLoading) {
      return <div className="flex h-full w-full flex-col overflow-hidden bg-background" />;
    }

    return (
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        <AiLoadingModal
          open
          title="설문 디자인 준비"
          steps={[
            "선택한 세그먼트와 프로젝트 정보를 불러오고 있습니다…",
            "설문 설계에 필요한 조건을 정리하고 있습니다…",
            "추천 템플릿과 기존 문항을 확인하고 있습니다…",
            "타겟 세그먼트에 맞는 질문 방향을 정리하고 있습니다…",
            "설문 디자인 화면을 준비하고 있습니다…",
          ]}
        />
      </div>
    );
  }

  return (
    <>
      <AiLoadingModal
        open={activeJob?.status === "queued" || activeJob?.status === "running"}
        title="설문 생성"
        steps={[
          "입력한 요구사항과 세그먼트 조건을 분석하고 있습니다…",
          "조사 목적에 맞는 문항 구조를 설계하고 있습니다…",
          "질문 흐름과 응답 방식을 구성하고 있습니다…",
          "핵심 문항과 선택지를 구체화하고 있습니다…",
          "설문 초안을 생성해 화면에 반영하고 있습니다…",
        ]}
      />
      <AiLoadingModal
        open={qualityCheckLoading}
        title="문항 품질 점검"
        steps={[
          "현재 설문 문항 구성을 검토하고 있습니다…",
          "문항 중복과 응답 편향 가능성을 점검하고 있습니다…",
          "질문 순서와 응답 흐름의 자연스러움을 확인하고 있습니다…",
          "표현이 모호한 문항과 누락 항목을 확인하고 있습니다…",
          "설문 품질 개선 포인트를 정리하고 있습니다…",
        ]}
      />
      <div className="flex h-full w-full flex-col bg-background overflow-hidden">
      <WorkflowStepper currentPath="/survey" />

      {/* ── 페이지 헤더 ── */}
      <div className="app-page-header shrink-0">
        <p className="app-page-eyebrow">AI Survey Studio</p>
        <h1 className="app-page-title mt-1">
          AI 기반 <span className="text-primary">설문 설계</span>
        </h1>
        <p className="app-page-description">
          자연어로 대화하며 리서치 목적에 맞는 최적의 문항 구조를 실시간으로 구축합니다
        </p>
        {segmentFilter && (
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 rounded-xl border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] px-4 py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-wide">타겟 세그먼트</span>
              <span className="text-[11px] font-semibold text-foreground">{segmentFilter.filterSummary}</span>
              <span className="text-[11px] text-[var(--muted-foreground)]">|</span>
              <span className="text-[12px] font-bold text-primary">
                {segmentFilter.totalMatched.toLocaleString()}명
              </span>
            </div>
            {segmentFilter.segments.slice(0, 3).map((s) => (
              <span
                key={s.name}
                className="rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-1 text-[10px] font-bold text-[var(--secondary-foreground)]"
              >
                {s.name} {s.count}명
              </span>
            ))}
            {segmentFilter.segments.length > 3 && (
              <span className="text-[10px] font-bold text-[var(--subtle-foreground)]">
                외 {segmentFilter.segments.length - 3}개 세그먼트
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left: Chat Panel ── */}
        <div className="w-[420px] shrink-0 flex flex-col bg-card border-r border-[var(--border)] overflow-hidden">
          {/* Template Selector */}
          <div className="shrink-0 border-b border-[var(--border)] px-6 py-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--subtle-foreground)]">
                    Survey Template
                  </p>
                  <p className="mt-1 text-[13px] font-semibold text-foreground">
                    {templates.find((item) => item.template_id === selectedTemplateId)?.description ??
                      "설문 유형에 맞는 템플릿을 선택하세요."}
                  </p>
                </div>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="min-w-[170px] rounded-xl border border-[var(--border)] bg-card px-3 py-2 text-[12px] font-semibold text-foreground outline-none"
                >
                  <option value="tpl_concept_test_v1">컨셉 테스트</option>
                  {templates
                    .filter((item) => item.template_id !== "tpl_concept_test_v1")
                    .map((item) => (
                      <option key={item.template_id} value={item.template_id}>
                        {item.title}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4 hide-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                {msg.role === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5 border border-[#DCE4F3] p-1 shadow-sm">
                    <img src={favicon} alt="AI" className="w-full h-full object-contain" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] font-medium leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-sm"
                      : "bg-[var(--panel-soft)] border border-[var(--border)] text-[var(--secondary-foreground)] rounded-tl-sm"
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
                placeholder="Digital Twin AI 에게 요청할 메시지를 입력하세요.."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                disabled={
                  !input.trim() || !projectId || activeJob?.status === "queued" || activeJob?.status === "running"
                }
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  input.trim() && projectId && activeJob?.status !== "queued" && activeJob?.status !== "running"
                    ? "bg-primary text-white hover:bg-primary-hover active:scale-95"
                    : "bg-[var(--muted)] text-[var(--subtle-foreground)] opacity-50"
                }`}
              >
                <Send size={14} className={input.trim() ? "translate-x-0.5" : ""} />
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-2 text-[12px] font-semibold text-[var(--secondary-foreground)] transition-colors hover:bg-[var(--surface-hover)]"
              >
                <ChevronRight size={14} />
                전체 로직 설정
              </button>
              <button
                onClick={addQuestion}
                className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl font-semibold hover:bg-primary-hover transition-colors shadow-[var(--shadow-[var(--shadow-sm)])] active:scale-95 text-[13px]"
              >
                <Plus size={15} strokeWidth={2.5} />
                문항 추가
              </button>
            </div>
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
                  style={{ boxShadow: "var(--shadow-[var(--shadow-md)])" }}
                >
                  <div className="flex items-start gap-4">
                    {/* Drag handle + number */}
                    <div className="flex items-center gap-2.5 shrink-0 pt-0.5">
                      <GripVertical
                        size={16}
                        className="text-[var(--border)] cursor-grab group-hover:text-[var(--subtle-foreground)] transition-colors"
                      />
                      <span
                        className={cn(
                          buttonVariants({ variant: "default", size: "sm" }),
                          "h-9 min-w-11 rounded-lg px-3 text-[12px] font-bold shadow-[var(--shadow-[var(--shadow-sm)])] pointer-events-none select-none"
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
                          <p className="text-[14px] font-semibold text-foreground leading-relaxed">{q.text}</p>
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
                                ? "bg-primary text-white border-primary"
                                : "bg-[var(--panel-soft)] hover:bg-[var(--surface-hover)] border-[var(--border)] text-[var(--subtle-foreground)]"
                            }`}
                            title="옵션"
                          >
                            <MoreHorizontal size={15} />
                          </button>
                          {openMenu === q.id && <TooltipMenu onClose={() => setOpenMenu(null)} />}
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
                <p className="text-[16px] font-semibold text-foreground">작성된 설문 문항이 없습니다</p>
                <p className="text-[13px] text-[var(--muted-foreground)] font-medium mt-2 max-w-xs leading-relaxed">
                  에이전트에게 주제를 제안하거나
                  <br />
                  [문항 추가] 버튼을 눌러 직접 설계하세요
                </p>
              </div>
            )}
          </div>

          {/* Pagination Area */}
          {totalPages > 1 && (
            <div className="shrink-0 flex items-center justify-center py-4 border-t border-[var(--border)] bg-card/50">
              <AppPagination current={currentPage + 1} total={totalPages} onChange={(p) => setCurrentPage(p - 1)} />
            </div>
          )}

          {/* Footer Actions */}
          <div className="shrink-0 bg-card border-t border-[var(--border)] px-8 py-4 flex items-center justify-between shadow-[0_-4px_14px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[var(--panel-soft)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
                <span className="text-[10px] text-[var(--subtle-foreground)] font-semibold uppercase tracking-[0.14em]">
                  Status
                </span>
                <div
                  className={`w-1.5 h-1.5 rounded-full ${generationStatus === "Failed" ? "bg-[var(--destructive)]" : "bg-[var(--success)]"} ${generationStatus === "Generating" ? "animate-pulse" : ""}`}
                />
                <span className="text-[12px] text-foreground font-semibold">{generationStatus}</span>
              </div>
              <p className="text-[12px] text-[var(--muted-foreground)] font-medium">
                총 <span className="text-primary font-bold">{questions.length}</span>개의 문항이 구성됨
              </p>
              <p className="text-[12px] font-medium text-[var(--muted-foreground)]">
                {syncStatus === "saving"
                  ? "초안을 저장하는 중입니다."
                  : syncStatus === "saved"
                    ? "초안이 서버에 저장되었습니다."
                    : syncStatus === "error"
                      ? "초안 저장에 실패했습니다."
                      : "편집 후 미리보기로 근거를 검토할 수 있습니다."}
              </p>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={openPreview}
                disabled={!projectId || syncStatus === "saving" || confirming}
                className="px-6 py-2.5 rounded-xl border border-[var(--border)] bg-card text-[var(--secondary-foreground)] font-semibold hover:bg-[var(--surface-hover)] transition-colors text-[13px] disabled:cursor-not-allowed disabled:opacity-60"
              >
                미리보기
              </button>
              <button
                onClick={() => {
                  void confirmSurvey();
                }}
                disabled={!projectId || syncStatus === "saving" || confirming}
                className="px-8 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-colors shadow-[var(--shadow-sm)] active:scale-95 text-[13px] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {confirming ? "확정 중..." : "설문 저장 및 확정"}
              </button>
            </div>
          </div>
        </div>
        {previewOpen && preview ? (
          <PreviewModal
            preview={preview}
            onClose={() => setPreviewOpen(false)}
            onConfirm={() => {
              void confirmSurvey();
            }}
            confirming={confirming}
          />
        ) : null}
        {qualityCheckOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <div className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] bg-card shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="border-b border-[var(--border)] px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">AI Quality Review</p>
                    <h2 className="text-[22px] font-black text-foreground">설문 구조 검증 결과</h2>
                  </div>
                </div>
              </div>
              <div className="overflow-y-auto px-8 py-6">
                {qualityCheck ? (
                  <>
                    <div className="mb-6 rounded-[28px] border border-[var(--border)] bg-[linear-gradient(135deg,var(--panel-soft),rgba(255,255,255,0.92))] px-6 py-6">
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-primary bg-[var(--primary-light-bg)]">
                            <span className="text-[24px] font-black text-primary">{validationAverageScore}</span>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                              전체 평균 점수
                            </p>
                            <p className="mt-1 text-[15px] font-bold text-foreground">
                              {validationAverageScore >= 85
                                ? "설문 항목 구성이 전반적으로 안정적입니다."
                                : validationAverageScore >= 70
                                  ? "전체 구조는 양호하지만 일부 문항은 다듬는 편이 좋습니다."
                                  : "문항 구성의 구조 보완이 필요합니다."}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                            검증 대상
                          </p>
                          <p className="mt-1 text-[22px] font-black text-foreground">{validationRows.length}개 문항</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6 overflow-hidden rounded-[24px] border border-[var(--border)]">
                      <table className="w-full text-left text-[13px]">
                        <thead className="bg-[var(--panel-soft)]">
                          <tr className="border-b border-[var(--border)]">
                            <th className="px-5 py-3.5 font-black uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                              문항
                            </th>
                            <th className="px-5 py-3.5 font-black uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                              항목 설명
                            </th>
                            <th className="w-[120px] px-5 py-3.5 text-center font-black uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                              점수
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)] bg-card">
                          {validationRows.map((row) => (
                            <tr key={row.id} className="align-top">
                              <td className="whitespace-nowrap px-5 py-4">
                                <div className="space-y-2">
                                  <span className="inline-flex rounded-lg bg-[var(--panel-soft)] px-2.5 py-1 text-[11px] font-black text-foreground">
                                    {row.questionNo}
                                  </span>
                                  <div>
                                    <TypeBadge type={row.type} />
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="space-y-1.5">
                                  <p className="font-bold leading-relaxed text-foreground">{row.text}</p>
                                  {row.reasons.map((reason) => (
                                    <p key={`${row.id}-${reason}`} className="text-[12px] font-medium text-[var(--muted-foreground)]">
                                      {reason}
                                    </p>
                                  ))}
                                </div>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <span
                                  className={cn(
                                    "inline-flex min-w-[78px] items-center justify-center rounded-lg px-3 py-2 text-[13px] font-black",
                                    row.tone === "high" && "bg-[var(--success-light)] text-[var(--success)]",
                                    row.tone === "medium" && "bg-amber-50 text-amber-700",
                                    row.tone === "low" && "bg-red-50 text-[var(--destructive)]"
                                  )}
                                >
                                  {row.score}/100
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-[var(--muted-foreground)]">
                          강점
                        </p>
                        <ul className="space-y-1.5">
                          {qualityCheck.strengths.map((s) => (
                            <li
                              key={s}
                              className="flex items-start gap-2 text-[12px] font-medium text-[var(--secondary-foreground)]"
                            >
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-[var(--muted-foreground)]">
                          개선 필요
                        </p>
                        <ul className="space-y-1.5">
                          {qualityCheck.issues.map((issue) => (
                            <li
                              key={issue}
                              className="flex items-start gap-2 text-[12px] font-medium text-[var(--secondary-foreground)]"
                            >
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {qualityCheck.suggestion && (
                        <div className="md:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3">
                          <p className="text-[12px] font-bold text-[var(--secondary-foreground)]">
                            💡 {qualityCheck.suggestion}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-[13px] font-medium text-[var(--muted-foreground)]">
                    품질 검토 결과를 불러올 수 없습니다
                  </p>
                )}
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] px-8 py-4">
                <button
                  onClick={() => setQualityCheckOpen(false)}
                  className="rounded-xl border border-[var(--border)] bg-card px-5 py-2.5 text-[13px] font-semibold text-[var(--secondary-foreground)] hover:bg-[var(--surface-hover)] transition-colors"
                >
                  문항 수정
                </button>
                <button
                  onClick={() => void confirmSurvey()}
                  disabled={confirming}
                  className="rounded-xl bg-primary px-6 py-2.5 text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-60"
                >
                  {confirming ? "확정 중..." : "그래도 확정"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
};
