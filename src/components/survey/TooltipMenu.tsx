import { useRef, useState, useEffect } from "react";
import { Settings, Sparkles, ChevronRight, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TooltipMenuProps {
  onClose: () => void;
}

export function TooltipMenu({ onClose }: TooltipMenuProps) {
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
        { icon: <ChevronRight size={13} />, label: "로직 설정" },
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
