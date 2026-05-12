import { useEffect, useState } from "react";
import { Search, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const VAL_PROJECTS = [
  {
    id: "p1",
    name: "Galaxy S26 컨셉 테스트",
    created: "2026-03-01",
    owner: "이동훈",
    status: "진행중",
    accessible: true,
  },
  {
    id: "p2",
    name: "MZ세대 스마트폰 Usage 조사",
    created: "2026-02-15",
    owner: "김민준",
    status: "분석중",
    accessible: true,
  },
  {
    id: "p3",
    name: "프리미엄 사용자 재구매 의향 분석",
    created: "2026-02-20",
    owner: "박지호",
    status: "진행중",
    accessible: true,
  },
  {
    id: "p4",
    name: "글로벌 브랜드 인지도 Q1",
    created: "2026-01-10",
    owner: "이서연",
    status: "대기",
    accessible: true,
  },
  {
    id: "p5",
    name: "Z세대 갤럭시 버즈 인식 조사",
    created: "2026-01-25",
    owner: "최예은",
    status: "완료",
    accessible: true,
  },
  {
    id: "p6",
    name: "북미 시장 S25 포지셔닝 연구",
    created: "2025-12-05",
    owner: "정태양",
    status: "완료",
    accessible: false,
  },
  {
    id: "p7",
    name: "동남아 신흥시장 브랜드 침투율",
    created: "2025-11-18",
    owner: "한수빈",
    status: "완료",
    accessible: false,
  },
  {
    id: "p8",
    name: "갤럭시 AI 기능 인지도 조사",
    created: "2026-03-10",
    owner: "오민재",
    status: "진행중",
    accessible: true,
  },
  {
    id: "p9",
    name: "웨어러블 신제품 컨셉 테스트",
    created: "2026-03-20",
    owner: "장예진",
    status: "대기",
    accessible: true,
  },
];

export function ProjectPickerDialog({
  open,
  onClose,
  selected,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  selected: Set<string>;
  onConfirm: (ids: Set<string>) => void;
}) {
  const [pickerSearch, setPickerSearch] = useState("");
  const [temp, setTemp] = useState<Set<string>>(new Set(selected));

  // selected가 바뀌면 temp 동기화 (Dialog 열릴 때)
  useEffect(() => {
    if (open) setTemp(new Set(selected));
  }, [open, selected]);

  const toggle = (id: string) =>
    setTemp((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const filtered = VAL_PROJECTS.filter(
    (p) => p.name.toLowerCase().includes(pickerSearch.toLowerCase()) || p.owner.includes(pickerSearch)
  );

  const statusCls = (s: string) =>
    ({
      진행중: "bg-[var(--primary-light-bg)] text-primary border-[var(--primary-light-border)]",
      분석중: "bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]/30",
      완료: "bg-[var(--panel-soft)] text-[var(--muted-foreground)] border-[var(--border)]",
      대기: "bg-[var(--warning-light)] text-[var(--warning)] border-[var(--warning)]/30",
    })[s] ?? "bg-[var(--panel-soft)] text-[var(--muted-foreground)] border-[var(--border)]";

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-[var(--border)]">
          <DialogTitle className="text-[16px] font-black text-foreground tracking-tight">
            리서치 프로젝트 선택
          </DialogTitle>
          <p className="text-[12px] font-medium text-[var(--muted-foreground)] mt-0.5">
            접근 가능한 프로젝트만 표시됩니다. 체크 후 확인을 누르면 해당 프로젝트의 검증 로그를 필터합니다
          </p>
        </DialogHeader>

        {/* 검색 */}
        <div className="px-6 py-3 border-b border-[var(--border)] bg-[var(--panel-soft)]">
          <div className="flex items-center gap-2 bg-card border border-[var(--border)] rounded-xl px-3 py-2.5 focus-within:border-primary transition-all">
            <Search size={13} className="text-[var(--subtle-foreground)] shrink-0" />
            <input
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              className="bg-transparent outline-none text-[13px] font-bold w-full text-foreground placeholder:text-[var(--subtle-foreground)] placeholder:font-medium"
              placeholder="프로젝트명, 담당자 검색..."
              autoFocus
            />
            {pickerSearch && (
              <button
                type="button"
                onClick={() => setPickerSearch("")}
                className="text-[var(--subtle-foreground)] hover:text-foreground"
              >
                <Plus size={13} className="rotate-45" />
              </button>
            )}
          </div>
        </div>

        {/* 프로젝트 목록 */}
        <div className="overflow-y-auto max-h-[380px]">
          <table className="w-full text-left text-[12px]">
            <thead className="sticky top-0 bg-[var(--panel-soft)] border-b border-[var(--border)] z-10">
              <tr>
                <th className="w-10 px-4 py-3" />
                <th className="px-4 py-3 font-black text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                  프로젝트명
                </th>
                <th className="px-4 py-3 font-black text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                  담당자
                </th>
                <th className="px-4 py-3 font-black text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                  생성일
                </th>
                <th className="px-4 py-3 font-black text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                  상태
                </th>
                <th className="px-4 py-3 font-black text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                  접근
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => p.accessible && toggle(p.id)}
                  className={cn(
                    "transition-colors",
                    p.accessible
                      ? "cursor-pointer hover:bg-[var(--surface-hover)]"
                      : "opacity-40 cursor-not-allowed bg-[var(--panel-soft)]",
                    temp.has(p.id) && "bg-[var(--primary-light-bg2)]"
                  )}
                >
                  <td className="px-4 py-3.5">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0",
                        temp.has(p.id)
                          ? "bg-primary border-primary shadow-[0_2px_6px_rgba(47,102,255,0.25)]"
                          : "border-[var(--border)] bg-card"
                      )}
                    >
                      {temp.has(p.id) && (
                        <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1.5 4L4 6.5L8.5 1.5"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-black text-foreground">{p.name}</td>
                  <td className="px-4 py-3.5 font-bold text-[var(--secondary-foreground)]">{p.owner}</td>
                  <td className="px-4 py-3.5 font-bold text-[var(--muted-foreground)]">{p.created}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-black border", statusCls(p.status))}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {p.accessible ? (
                      <span className="text-[var(--success)] text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 size={11} /> 허용
                      </span>
                    ) : (
                      <span className="text-[var(--muted-foreground)] text-[11px] font-bold">제한</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-[13px] font-bold text-[var(--muted-foreground)]"
                  >
                    검색 결과가 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-[var(--border)] bg-[var(--panel-soft)] flex items-center justify-between">
          <span className="text-[12px] font-bold text-[var(--muted-foreground)]">
            {temp.size > 0 ? `${temp.size}개 선택됨` : "선택 없음 (전체 표시)"}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setTemp(new Set())}>
              선택 초기화
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              취소
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onConfirm(temp);
                onClose();
              }}
            >
              확인
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
