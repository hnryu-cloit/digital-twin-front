import type React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  /** 현재 페이지 (1-based) */
  current: number;
  /** 전체 페이지 수 */
  total: number;
  onChange: (page: number) => void;
  /** 표시할 최대 페이지 버튼 수 (기본 10) */
  maxVisible?: number;
}

export const AppPagination: React.FC<Props> = ({ current, total, onChange, maxVisible = 10 }) => {
  const pages = Array.from({ length: Math.min(maxVisible, total) }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="p-1 rounded transition-colors text-[#9BA6B8] disabled:opacity-25 disabled:cursor-not-allowed hover:text-[#5B7DFF]"
      >
        <ChevronLeft size={15} />
      </button>

      {pages.map((p) => {
        const isActive = p === current;
        const isDisabled = p > total;
        return (
          <button
            key={p}
            onClick={() => !isDisabled && onChange(p)}
            className="rounded transition-colors"
            style={{
              width: 28,
              height: 28,
              fontSize: 13,
              fontWeight: isActive ? 700 : 400,
              color: isActive ? "#5B7DFF" : isDisabled ? "#D1D8E6" : "#7C8397",
              cursor: isDisabled ? "default" : "pointer",
              background: "none",
              border: "none",
              outline: "none",
              borderBottom: isActive ? "2px solid #5B7DFF" : "2px solid transparent",
            }}
          >
            {p}
          </button>
        );
      })}

      <button
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current >= total}
        className="p-1 rounded transition-colors text-[#9BA6B8] disabled:opacity-25 disabled:cursor-not-allowed hover:text-[#5B7DFF]"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
};