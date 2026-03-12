import type React from"react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from"lucide-react";

interface Props {
 /** 현재 페이지 (1-based) */
 current: number;
 /** 전체 페이지 수 */
 total: number;
 onChange: (page: number) => void;
 /** 표시할 최대 페이지 버튼 수 (기본 5) */
 maxVisible?: number;
}

export const AppPagination: React.FC<Props> = ({ current, total, onChange, maxVisible = 5 }) => {
 // 페이지 범위 계산
 let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
 const endPage = Math.min(total, startPage + maxVisible - 1);

 if (endPage - startPage + 1 < maxVisible) {
 startPage = Math.max(1, endPage - maxVisible + 1);
 }

 const pages = [];
 for (let i = startPage; i <= endPage; i++) {
 pages.push(i);
 }

 const btnBase ="flex h-8 w-8 items-center justify-center rounded-lg border text-[13px] font-bold transition-all active:scale-95";
 const btnActive ="bg-primary border-primary text-white shadow-[var(--shadow-md)] shadow-primary/20";
 const btnInactive ="bg-card border-[var(--border)] text-secondary-foreground hover:border-primary hover:text-primary hover:bg-primary-light-bg/30";
 const btnDisabled ="bg-accent/50 border-[var(--border)] text-muted-foreground opacity-40 cursor-not-allowed";

 return (
 <div className="flex items-center gap-1.5">
 {/* 처음으로 */}
 <button
 onClick={() => onChange(1)}
 disabled={current === 1}
 className={`${btnBase} ${current === 1 ? btnDisabled : btnInactive}`}
 title="First Page"
 >
 <ChevronsLeft size={14} strokeWidth={2.5} />
 </button>

 {/* 이전 */}
 <button
 onClick={() => onChange(Math.max(1, current - 1))}
 disabled={current === 1}
 className={`${btnBase} ${current === 1 ? btnDisabled : btnInactive}`}
 title="Previous Page"
 >
 <ChevronLeft size={14} strokeWidth={2.5} />
 </button>

 <div className="flex items-center gap-1 mx-1">
 {pages.map((p) => (
 <button
 key={p}
 onClick={() => onChange(p)}
 className={`${btnBase} ${p === current ? btnActive : btnInactive}`}
 >
 {p}
 </button>
 ))}
 </div>

 {/* 다음 */}
 <button
 onClick={() => onChange(Math.min(total, current + 1))}
 disabled={current >= total}
 className={`${btnBase} ${current >= total ? btnDisabled : btnInactive}`}
 title="Next Page"
 >
 <ChevronRight size={14} strokeWidth={2.5} />
 </button>

 {/* 마지막으로 */}
 <button
 onClick={() => onChange(total)}
 disabled={current >= total}
 className={`${btnBase} ${current >= total ? btnDisabled : btnInactive}`}
 title="Last Page"
 >
 <ChevronsRight size={14} strokeWidth={2.5} />
 </button>
 </div>
 );
};
