import { CheckSquare, Sliders, AlignLeft, Star, LayoutGrid, ListOrdered } from "lucide-react";
import type React from "react";

type QuestionType = "단일선택" | "복수선택" | "리커트척도" | "주관식" | "NPS" | "매트릭스" | "순위형";

const TYPE_COLORS: Record<QuestionType, { bg: string; text: string; border: string }> = {
  단일선택: { bg: "var(--tag-blue-bg)", text: "var(--tag-blue)", border: "var(--tag-blue-bg)" },
  복수선택: { bg: "var(--tag-indigo-bg)", text: "var(--tag-indigo)", border: "var(--tag-indigo-bg)" },
  리커트척도: { bg: "var(--tag-purple-bg)", text: "var(--tag-purple)", border: "var(--tag-purple-bg)" },
  주관식: { bg: "var(--tag-teal-bg)", text: "var(--tag-teal)", border: "var(--tag-teal-bg)" },
  NPS: { bg: "var(--tag-orange-bg)", text: "var(--tag-orange)", border: "var(--tag-orange-bg)" },
  매트릭스: { bg: "var(--tag-green-bg)", text: "var(--tag-green)", border: "var(--tag-green-bg)" },
  순위형: { bg: "var(--tag-amber-bg)", text: "var(--tag-amber)", border: "var(--tag-amber-bg)" },
};

const TYPE_ICONS: Record<QuestionType, React.ReactNode> = {
  단일선택: <CheckSquare size={11} />,
  복수선택: <CheckSquare size={11} />,
  리커트척도: <Sliders size={11} />,
  주관식: <AlignLeft size={11} />,
  NPS: <Star size={11} />,
  매트릭스: <LayoutGrid size={11} />,
  순위형: <ListOrdered size={11} />,
};

export type { QuestionType };

interface TypeBadgeProps {
  type: QuestionType;
}

export function TypeBadge({ type }: TypeBadgeProps) {
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
