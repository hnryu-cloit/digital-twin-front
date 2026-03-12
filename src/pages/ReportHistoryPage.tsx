import type React from "react";
import { useEffect, useRef, useState } from "react";
import { 
  Calendar, Download, FileText, MoreHorizontal, 
  Search, Filter
} from "lucide-react";
import { AppPagination } from "@/components/ui/AppPagination";

interface ReportItem {
  id: string;
  title: string;
  project: string;
  createdAt: string;
  type: string;
  typeColor: string;
  typeBg: string;
  format: "PDF" | "DOCX" | "PPTX";
}

const REPORT_ITEMS: ReportItem[] = [
  { id: "r1", title: "Galaxy S25 컨셉 테스트 분석 리포트", project: "Galaxy S25 컨셉 테스트", createdAt: "2026-03-08", type: "컨셉 테스트", typeColor: "var(--primary)", typeBg: "var(--primary-light-bg)", format: "PDF" },
  { id: "r2", title: "MZ세대 스마트폰 Usage 종합 리포트", project: "MZ세대 스마트폰 Usage 조사", createdAt: "2026-03-05", type: "Usage 조사", typeColor: "#4338CA", typeBg: "#E0E7FF", format: "DOCX" },
  { id: "r3", title: "브랜드 인지도 Q1 2026 최종 리포트", project: "브랜드 인지도 조사 Q1 2026", createdAt: "2026-03-01", type: "브랜드 인식", typeColor: "#0369A1", typeBg: "#F0F9FF", format: "PPTX" },
  { id: "r4", title: "온라인 쇼핑 만족도 분석 리포트", project: "온라인 쇼핑 경험 만족도", createdAt: "2026-02-20", type: "Usage 조사", typeColor: "#4338CA", typeBg: "#E0E7FF", format: "PDF" },
  { id: "r5", title: "2030 뷰티 소비자 인식 중간 리포트", project: "2030 뷰티 소비자 인식 조사", createdAt: "2026-02-14", type: "브랜드 인식", typeColor: "#0369A1", typeBg: "#F0F9FF", format: "DOCX" },
  { id: "r6", title: "Global UX Usability Final Report", project: "UX Global Standard", createdAt: "2026-02-10", type: "UX 테스트", typeColor: "#475569", typeBg: "#F1F5F9", format: "PDF" },
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
          <div className="flex items-center gap-2.5 bg-card border border-border rounded-xl px-4 py-2.5 shadow-sm focus-within:border-primary transition-all">
            <Search size={15} className="text-[var(--subtle-foreground)]" />
            <input className="bg-transparent outline-none text-[13px] font-bold w-64 text-foreground placeholder:text-[var(--subtle-foreground)]" placeholder="리포트 제목 또는 프로젝트 검색..." />
          </div>
          <button className="p-3 bg-card border border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary/30 transition-all shadow-sm active:scale-95">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Report List - Scaled Up Section */}
      <div className="flex-1 overflow-y-auto px-10 py-10 hide-scrollbar">
        <div className="max-w-7xl mx-auto space-y-6 pb-20"> {/* 너비 확장 max-w-6xl -> max-w-7xl */}
          {REPORT_ITEMS.map((item) => (
            <div key={item.id} className="app-card p-8 hover:shadow-xl hover:border-primary/30 transition-all duration-500 flex items-center gap-10 relative group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 blur-2xl group-hover:scale-110 transition-transform opacity-50 pointer-events-none" />
              
              {/* Format Icon Scaled Up */}
              <div className="w-20 h-20 rounded-2xl bg-[var(--panel-soft)] flex items-center justify-center text-primary shadow-inner border border-[var(--border)] group-hover:bg-primary group-hover:text-white transition-all duration-500 relative z-10">
                <FileText size={36} /> {/* 아이콘 크기 확대 28 -> 36 */}
              </div>

              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-4 mb-3.5">
                  <span className="px-3.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-tight shadow-sm border" style={{ backgroundColor: item.typeBg, color: item.typeColor, borderColor: item.typeColor + "22" }}>{item.type}</span>
                  <span className="text-[11px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">{item.format} 문서 형식</span>
                </div>
                <h3 className="text-[22px] font-black text-foreground leading-tight mb-3 group-hover:text-primary transition-colors truncate">{item.title}</h3> {/* 폰트 확대 18 -> 22 */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-[var(--subtle-foreground)] text-[14px] font-bold"><Calendar size={15} /> {item.createdAt}</div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--border)]" />
                  <div className="text-[var(--subtle-foreground)] text-[14px] font-bold italic truncate opacity-80">{item.project}</div>
                </div>
              </div>

              {/* Actions Scaled Up */}
              <div className="flex items-center gap-4 relative z-20">
                <div className="relative" ref={item.id === downloadOpenId ? downloadRef : null}>
                  <button 
                    onClick={() => setDownloadOpenId(downloadOpenId === item.id ? null : item.id)}
                    className="flex items-center gap-2.5 bg-primary text-white px-8 py-4 rounded-xl text-[15px] font-black hover:bg-primary-hover shadow-xl shadow-blue-100 active:scale-95 transition-all"
                  >
                    <Download size={18} /> 리포트 다운로드
                  </button>
                  {downloadOpenId === item.id && (
                    <div className="absolute right-0 top-full mt-3 z-50 w-48 bg-white border border-[var(--border)] rounded-2xl shadow-2xl p-1.5 animate-in fade-in slide-in-from-top-2">
                      <button className="w-full text-left px-4 py-3 rounded-xl text-[13px] font-bold text-[var(--secondary-foreground)] hover:bg-[var(--panel-soft)] hover:text-primary transition-all">PDF 파일 다운로드</button>
                      <button className="w-full text-left px-4 py-3 rounded-xl text-[13px] font-bold text-[var(--secondary-foreground)] hover:bg-[var(--panel-soft)] hover:text-primary transition-all">DOCX 파일 다운로드</button>
                      <button className="w-full text-left px-4 py-3 rounded-xl text-[13px] font-bold text-[var(--secondary-foreground)] hover:bg-[var(--panel-soft)] hover:text-primary transition-all">PPTX 파일 다운로드</button>
                    </div>
                  )}
                </div>
                <button className="p-4 bg-white border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:bg-[var(--panel-soft)] hover:text-[var(--secondary-foreground)] transition-all shadow-sm"><MoreHorizontal size={20} /></button>
              </div>
            </div>
          ))}
          
          <div className="flex justify-center pt-12 scale-110"><AppPagination current={1} total={3} onChange={() => {}} /></div>
        </div>
      </div>
    </div>
  );
};
