import { CheckSquare, Sliders, AlignLeft } from "lucide-react";
import type React from "react";

type QuestionType = "단일선택" | "복수선택" | "리커트척도" | "주관식";

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
