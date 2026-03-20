import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  Calendar, Download, FileText, MoreHorizontal,
  Search, Filter, ChevronRight, Clock,
  FilePieChart, Presentation
} from "lucide-react";
import { AppPagination } from "@/components/ui/AppPagination";
import { cn } from "@/lib/utils";

interface ReportItem {
  id: string;
  title: string;
  project: string;
  createdAt: string;
  type: string;
  typeColor: string;
  typeBg: string;
  format: "PDF" | "DOCX" | "PPTX";
  size: string;
}

const REPORT_ITEMS: ReportItem[] = [
  { id: "r1", title: "Galaxy S26 컨셉 테스트 분석 리포트", project: "Galaxy S26 컨셉 테스트", createdAt: "2026-03-08", type: "컨셉 테스트", typeColor: "#3B82F6", typeBg: "#EFF6FF", format: "PDF", size: "2.4 MB" },
  { id: "r2", title: "MZ세대 스마트폰 Usage 종합 리포트", project: "MZ세대 스마트폰 Usage 조사", createdAt: "2026-03-05", type: "Usage 조사", typeColor: "#6366F1", typeBg: "#EEF2FF", format: "DOCX", size: "1.8 MB" },
  { id: "r3", title: "브랜드 인지도 Q1 2026 최종 리포트", project: "브랜드 인지도 조사 Q1 2026", createdAt: "2026-03-01", type: "브랜드 인식", typeColor: "#8B5CF6", typeBg: "#F5F3FF", format: "PPTX", size: "5.2 MB" },
  { id: "r4", title: "온라인 쇼핑 만족도 분석 리포트", project: "온라인 쇼핑 경험 만족도", createdAt: "2026-02-20", type: "Usage 조사", typeColor: "#6366F1", typeBg: "#EEF2FF", format: "PDF", size: "3.1 MB" },
  { id: "r5", title: "2030 뷰티 소비자 인식 중간 리포트", project: "2030 뷰티 소비자 인식 조사", createdAt: "2026-02-14", type: "브랜드 인식", typeColor: "#8B5CF6", typeBg: "#F5F3FF", format: "DOCX", size: "1.5 MB" },
  { id: "r6", title: "Global UX Usability Final Report", project: "UX Global Standard", createdAt: "2026-02-10", type: "UX 테스트", typeColor: "#10B981", typeBg: "#ECFDF5", format: "PDF", size: "4.7 MB" },
];

const FORMAT_ICONS = {
  PDF: <FilePieChart size={24} />,
  DOCX: <FileText size={24} />,
  PPTX: <Presentation size={24} />,
};

export const ReportHistoryPage: React.FC = () => {
  const [downloadOpenId, setDownloadOpenId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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
          <div className="flex items-center gap-2.5 bg-card border border-[var(--border)] rounded-xl px-4 py-2.5 shadow-[var(--shadow-sm)] focus-within:border-primary transition-all group">
            <Search size={15} className="text-[var(--subtle-foreground)] group-focus-within:text-primary transition-colors" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-[13px] font-bold w-64 text-foreground placeholder:text-[var(--subtle-foreground)]"
              placeholder="리포트 제목 또는 프로젝트 검색..."
            />
          </div>
          <button className="h-[42px] px-4 flex items-center gap-2 bg-card border border-[var(--border)] rounded-xl text-muted-foreground hover:text-primary hover:border-primary/30 transition-all shadow-[var(--shadow-sm)] active:scale-95 text-[13px] font-bold">
            <Filter size={16} /> 필터
          </button>
        </div>
      </div>

      {/* Report List Section */}
      <div className="flex-1 overflow-y-auto px-10 pt-8 pb-4 hide-scrollbar">
        <div className="max-w-6xl mx-auto space-y-4 pb-20">
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-[12px] font-black text-[var(--subtle-foreground)] uppercase tracking-widest">
              총 <span className="text-primary">{REPORT_ITEMS.length}</span>개의 리포트
            </p>
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-bold text-[var(--subtle-foreground)] flex items-center gap-1.5">
                <Clock size={12} /> 최근 업데이트: 2026-03-13
              </span>
            </div>
          </div>

          {REPORT_ITEMS.map((item) => (
            <div
              key={item.id}
              className={cn(
                "app-card p-5 flex items-center gap-7 relative group transition-all duration-300 hover:border-primary/30 hover:shadow-[var(--shadow-md)] bg-card/50 hover:bg-card",
                downloadOpenId === item.id ? "z-40 overflow-visible" : "z-0"
              )}
            >
              {/* Format Icon */}
              <div className={cn(
                "w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center border transition-all duration-300 shadow-sm",
                "bg-[var(--panel-soft)] text-[var(--subtle-foreground)] border-[var(--border)] group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20"
              )}>
                {FORMAT_ICONS[item.format]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border" style={{ backgroundColor: item.typeBg, color: item.typeColor, borderColor: `${item.typeColor}30` }}>
                    {item.type}
                  </span>
                  <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-tight">
                    {item.size} · {item.format}
                  </span>
                </div>
                <h3 className="text-[16px] font-black text-foreground leading-tight mb-2 group-hover:text-primary transition-colors truncate">
                  {item.title}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[var(--subtle-foreground)] text-[11px] font-bold">
                    <Calendar size={12} /> {item.createdAt}
                  </div>
                  <div className="w-1 h-1 rounded-full bg-[var(--border)] opacity-50" />
                  <div className="text-[11px] font-semibold text-[var(--muted-foreground)] truncate flex items-center gap-1.5 max-w-md">
                    <span className="opacity-50 font-black">PROJ:</span> {item.project}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5 relative z-20">
                <div className="relative" ref={item.id === downloadOpenId ? downloadRef : null}>
                  <button
                    onClick={() => setDownloadOpenId(downloadOpenId === item.id ? null : item.id)}
                    className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-[13px] font-black hover:bg-primary-hover shadow-[var(--shadow-sm)] active:scale-95 transition-all"
                  >
                    <Download size={15} /> 다운로드
                  </button>
                  {downloadOpenId === item.id && (
                    <div className="absolute right-0 top-full mt-2 z-50 w-44 bg-card border border-[var(--border)] rounded-xl shadow-[var(--shadow-lg)] p-1.5 animate-in fade-in slide-in-from-top-1">
                      {["PDF", "DOCX", "PPTX"].map(ext => (
                        <button
                          key={ext}
                          onClick={() => setDownloadOpenId(null)}
                          className="w-full text-left px-3.5 py-2.5 rounded-lg text-[12px] font-bold text-[var(--secondary-foreground)] hover:bg-[var(--panel-soft)] hover:text-primary transition-colors flex items-center justify-between group/ext"
                        >
                          <span>{ext} 파일 받기</span>
                          <ChevronRight size={14} className="opacity-0 group-hover/ext:opacity-100 transition-all -translate-x-2 group-hover/ext:translate-x-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button className="w-10 h-10 flex items-center justify-center bg-card border border-[var(--border)] rounded-xl text-[var(--subtle-foreground)] hover:bg-[var(--panel-soft)] hover:text-foreground transition-all shadow-[var(--shadow-sm)] active:scale-95">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-center pt-10">
            <AppPagination current={1} total={3} onChange={() => { }} />
          </div>
        </div>
      </div>

    </div>
  );
};
