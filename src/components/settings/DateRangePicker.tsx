import { useState } from "react";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

/* ─── 기간 선택 피커 ─── */
type Preset = "week" | "month" | "lastMonth" | "custom";

export function getPresetRange(preset: Preset): DateRange {
  const now = new Date();
  if (preset === "week") {
    const day = now.getDay();
    const from = new Date(now);
    from.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(from.getDate() + 6);
    return { from, to };
  }
  if (preset === "month") {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    };
  }
  if (preset === "lastMonth") {
    return {
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      to: new Date(now.getFullYear(), now.getMonth(), 0),
    };
  }
  return { from: undefined, to: undefined };
}

export function formatDateRange(range: DateRange): string {
  const fmt = (d: Date) =>
    `${d.getFullYear()}년 ${String(d.getMonth() + 1).padStart(2, "0")}월 ${String(d.getDate()).padStart(2, "0")}일`;
  if (!range.from) return "기간 선택";
  if (!range.to) return fmt(range.from);
  return `${fmt(range.from)} ~ ${fmt(range.to)}`;
}

const PRESET_LABELS: { key: Preset; label: string }[] = [
  { key: "week", label: "이번 주" },
  { key: "month", label: "이번 달" },
  { key: "lastMonth", label: "지난 달" },
  { key: "custom", label: "직접 설정" },
];

export function DateRangePicker({ value, onChange }: { value: DateRange; onChange: (range: DateRange) => void }) {
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<Preset>("month");
  const [localRange, setLocalRange] = useState<DateRange>(value);

  const applyPreset = (key: Preset) => {
    setActivePreset(key);
    if (key !== "custom") {
      const range = getPresetRange(key);
      setLocalRange(range);
      onChange(range);
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (!range) return;
    setLocalRange(range);
    if (range.from && range.to) {
      onChange(range);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* 프리셋 탭 */}
      <div className="flex items-center gap-1 bg-[var(--panel-soft)] rounded-xl p-1 border border-[var(--border)]">
        {PRESET_LABELS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => applyPreset(key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[11px] font-black transition-all",
              activePreset === key
                ? "bg-primary text-white shadow-sm"
                : "text-[var(--secondary-foreground)] hover:bg-card hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
        {/* 날짜 표시 */}
        <button
          type="button"
          onClick={() => {
            setActivePreset("custom");
            setOpen((v) => !v);
          }}
          className={cn(
            "ml-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all",
            open
              ? "border-primary bg-[var(--primary-light-bg)] text-primary"
              : "border-[var(--border)] bg-card text-[var(--secondary-foreground)] hover:border-primary/40"
          )}
        >
          <CalendarIcon size={11} />
          <span>{formatDateRange(localRange)}</span>
        </button>
      </div>

      {/* 캘린더 드롭다운 */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 rounded-2xl border border-[var(--border)] bg-card shadow-2xl p-4">
          <CalendarPicker
            mode="range"
            selected={localRange}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
            locale={undefined}
            className="rounded-xl"
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)] mt-1">
            <Button variant="outline" size="sm" className="text-[11px]" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button
              size="sm"
              className="text-[11px]"
              disabled={!localRange.from || !localRange.to}
              onClick={() => {
                if (localRange.from && localRange.to) {
                  onChange(localRange);
                  setOpen(false);
                }
              }}
            >
              적용
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
