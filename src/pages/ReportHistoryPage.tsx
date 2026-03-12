import type React from"react";
import { useEffect, useRef, useState } from"react";
import { 
 Calendar, Download, FileText, MoreHorizontal, 
 Search, Filter
} from"lucide-react";
import { AppPagination } from"@/components/ui/AppPagination";

interface ReportItem {
 id: string;
 title: string;
 project: string;
 createdAt: string;
 type: string;
 typeColor: string;
 typeBg: string;
 format:"PDF" |"DOCX" |"PPTX";
}

const REPORT_ITEMS: ReportItem[] = [
  { id: "r1", title: "Galaxy S25 컨셉 테스트 분석 리포트", project: "Galaxy S25 컨셉 테스트", createdAt: "2026-03-08", type: "컨셉 테스트", typeColor: "var(--tag-blue)", typeBg: "var(--tag-blue-bg)", format: "PDF" },
  { id: "r2", title: "MZ세대 스마트폰 Usage 종합 리포트", project: "MZ세대 스마트폰 Usage 조사", createdAt: "2026-03-05", type: "Usage 조사", typeColor: "var(--tag-indigo)", typeBg: "var(--tag-indigo-bg)", format: "DOCX" },
  { id: "r3", title: "브랜드 인지도 Q1 2026 최종 리포트", project: "브랜드 인지도 조사 Q1 2026", createdAt: "2026-03-01", type: "브랜드 인식", typeColor: "var(--tag-purple)", typeBg: "var(--tag-purple-bg)", format: "PPTX" },
  { id: "r4", title: "온라인 쇼핑 만족도 분석 리포트", project: "온라인 쇼핑 경험 만족도", createdAt: "2026-02-20", type: "Usage 조사", typeColor: "var(--tag-indigo)", typeBg: "var(--tag-indigo-bg)", format: "PDF" },
  { id: "r5", title: "2030 뷰티 소비자 인식 중간 리포트", project: "2030 뷰티 소비자 인식 조사", createdAt: "2026-02-14", type: "브랜드 인식", typeColor: "var(--tag-purple)", typeBg: "var(--tag-purple-bg)", format: "DOCX" },
  { id: "r6", title: "Global UX Usability Final Report", project: "UX Global Standard", createdAt: "2026-02-10", type: "UX 테스트", typeColor: "var(--tag-teal)", typeBg: "var(--tag-teal-bg)", format: "PDF" },
];


export const ReportHistoryPage: React.FC = () => {
 const [downloadOpenId, setDownloadOpenId] = useState<string | null>(null);
 const downloadRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const handler = (e: MouseEvent) => {
 if (downloadRef.current && !downloadRef.current.contains(e.target as Node)) {
 setDownloadOpenId(null);
 }
 };
 document.addEventListener("mousedown", handler);
 return () => document.removeEventListener("mousedown", handler);
 }, []);

 return (
 <div className="flex flex-1 flex-col overflow-hidden bg-background">
 
 {/* ── 페이지 헤더 ── */}
 <div className="app-page-header shrink-0 flex items-end justify-between gap-8">
 <div>
 <p className="app-page-eyebrow">Report Archive</p>
 <h1 className="app-page-title mt-1">
 분석 리포트 <span className="text-primary">아카이브.</span>
 </h1>
 <p className="app-page-description">
 지금까지 생성된 모든 전략 리포트와 분석 데이터를 체계적으로 관리합니다.
 </p>
 </div>
 
 {/* 헤더 우측 컨트롤 */}
 <div className="flex items-center gap-3 shrink-0 pb-1">
 <div className="flex items-center gap-2.5 bg-card border border-[var(--border)] rounded-xl px-4 py-2.5 shadow-[var(--shadow-sm)] focus-within:border-primary transition-all">
 <Search size={15} className="text-[var(--subtle-foreground)]" />
 <input className="bg-transparent outline-none text-[13px] font-bold w-64 text-foreground placeholder:text-[var(--subtle-foreground)]" placeholder="리포트 제목 또는 프로젝트 검색..." />
 </div>
 <button className="p-3 bg-card border border-[var(--border)] rounded-xl text-muted-foreground hover:text-primary hover:border-primary/30 transition-all shadow-[var(--shadow-sm)] active:scale-95">
 <Filter size={18} />
 </button>
 </div>
 </div>

 {/* Report List Section */}
 <div className="flex-1 overflow-y-auto px-10 py-8 hide-scrollbar">
 <div className="max-w-6xl mx-auto space-y-5 pb-20">
 {REPORT_ITEMS.map((item) => (
 <div 
 key={item.id} 
 className="app-card p-6 flex items-center gap-8 relative group transition-all duration-300 hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-[var(--shadow-md)])]"
 >
 {/* Format Icon */}
 <div className="w-16 h-16 shrink-0 rounded-2xl bg-[var(--panel-soft)] flex items-center justify-center text-primary border border-[var(--border)] group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
 <FileText size={28} />
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-3 mb-2.5">
 <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tight border" style={{ backgroundColor: item.typeBg, color: item.typeColor, borderColor: item.typeColor +"33" }}>{item.type}</span>
 <span className="text-[10px] font-bold text-[var(--subtle-foreground)] uppercase tracking-[0.1em]">{item.format} Format</span>
 </div>
 <h3 className="text-[18px] font-bold text-foreground leading-tight mb-2 group-hover:text-primary transition-colors truncate">{item.title}</h3>
 <div className="flex items-center gap-5">
 <div className="flex items-center gap-1.5 text-[var(--muted-foreground)] text-[12px] font-semibold">
 <Calendar size={13} /> {item.createdAt}
 </div>
 <div className="w-1 h-1 rounded-full bg-[var(--border)]" />
 <div className="text-[12px] font-medium text-[var(--subtle-foreground)] truncate italic">{item.project}</div>
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center gap-3 relative z-20">
 <div className="relative" ref={item.id === downloadOpenId ? downloadRef : null}>
 <button 
 onClick={() => setDownloadOpenId(downloadOpenId === item.id ? null : item.id)}
 className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-[13px] font-bold hover:bg-primary-hover shadow-[var(--shadow-[var(--shadow-sm)])] active:scale-95 transition-all"
 >
 <Download size={15} /> 다운로드
 </button>
 {downloadOpenId === item.id && (
 <div className="absolute right-0 top-full mt-2 z-50 w-44 bg-card border border-[var(--border)] rounded-xl shadow-[var(--shadow-[var(--shadow-lg)])] p-1.5 animate-in fade-in slide-in-from-top-1">
 {["PDF","DOCX","PPTX"].map(ext => (
 <button key={ext} className="w-full text-left px-3.5 py-2 rounded-lg text-[12px] font-semibold text-[var(--secondary-foreground)] hover:bg-[var(--panel-soft)] hover:text-primary transition-colors">{ext} 파일 받기</button>
 ))}
 </div>
 )}
 </div>
 <button className="w-10 h-10 flex items-center justify-center bg-card border border-[var(--border)] rounded-xl text-[var(--subtle-foreground)] hover:bg-[var(--surface-hover)] hover:text-foreground transition-all shadow-[var(--shadow-sm)]">
 <MoreHorizontal size={18} />
 </button>
 </div>
 </div>
 ))}
 
 <div className="flex justify-center pt-8">
 <AppPagination current={1} total={3} onChange={() => {}} />
 </div>
 </div>
 </div>

 </div>
 );
};
