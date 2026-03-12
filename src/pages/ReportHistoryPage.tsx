import type React from "react";
import { useEffect, useRef, useState } from "react";
import { 
  Archive, Calendar, Download, FileText, Link2, MoreHorizontal, 
  Search, Trash2, ChevronRight, Filter, Clock, Activity,
  CheckCircle2, AlertCircle
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
  { id: "r1", title: "Galaxy S25 컨셉 테스트 분석 리포트", project: "Galaxy S25 컨셉 테스트", createdAt: "2026-03-08", type: "컨셉 테스트", typeColor: "#2454C8", typeBg: "#EDF3FF", format: "PDF" },
  { id: "r2", title: "MZ세대 스마트폰 Usage 종합 리포트", project: "MZ세대 스마트폰 Usage 조사", createdAt: "2026-03-05", type: "Usage 조사", typeColor: "#16A34A", typeBg: "#F0FDF4", format: "DOCX" },
  { id: "r3", title: "브랜드 인지도 Q1 2026 최종 리포트", project: "브랜드 인지도 조사 Q1 2026", createdAt: "2026-03-01", type: "브랜드 인식", typeColor: "#7C3AED", typeBg: "#F5F3FF", format: "PPTX" },
  { id: "r4", title: "온라인 쇼핑 만족도 분석 리포트", project: "온라인 쇼핑 경험 만족도", createdAt: "2026-02-20", type: "Usage 조사", typeColor: "#16A34A", typeBg: "#F0FDF4", format: "PDF" },
  { id: "r5", title: "2030 뷰티 소비자 인식 중간 리포트", project: "2030 뷰티 소비자 인식 조사", createdAt: "2026-02-14", type: "브랜드 인식", typeColor: "#DB2777", typeBg: "#FFF0F5", format: "DOCX" },
  { id: "r6", title: "Global UX Usability Final Report", project: "UX Global Standard", createdAt: "2026-02-10", type: "UX 테스트", typeColor: "#EA580C", typeBg: "#FFF7ED", format: "PDF" },
];

export const ReportHistoryPage: React.FC = () => {
  const [page, setPage] = useState(1);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#F8FAFC]">
      {/* Welcome Header */}
      <div className="px-10 pt-10 shrink-0">
        <section className="rounded-2xl border border-border/90 bg-card p-8 shadow-elevated relative overflow-hidden group mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-all duration-1000" />
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Management System</p>
            <h1 className="mt-2 font-title text-3xl font-bold leading-tight text-slate-900 md:text-4xl tracking-tight">
              분석 리포트 <span className="text-primary">아카이브.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-base font-medium text-slate-500">
              지금까지 생성된 모든 전략 리포트와 분석 데이터를 체계적으로 관리합니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-5 py-2.5 shadow-sm focus-within:border-primary transition-all">
                <Search size={16} className="text-slate-300" />
                <input className="bg-transparent outline-none text-[13px] font-bold w-64" placeholder="리포트 제목 또는 프로젝트 검색..." />
              </div>
              <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm"><Filter size={18} /></button>
            </div>
          </div>
        </section>
      </div>

      {/* Report List */}
      <div className="flex-1 overflow-y-auto px-10 py-2 hide-scrollbar bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto space-y-4 pb-20">
          {REPORT_ITEMS.map((item) => (
            <div key={item.id} className="group bg-white rounded-[32px] border border-slate-100 p-7 shadow-sm hover:shadow-xl hover:border-[#2454C8]/20 transition-all duration-500 flex items-center gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F7FAFF] rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform opacity-50" />
              
              {/* Format Icon */}
              <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-primary shadow-inner border border-slate-50 group-hover:bg-[#2454C8] group-hover:text-white transition-all duration-500 relative z-10">
                <FileText size={28} />
              </div>

              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-3 mb-2.5">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight shadow-sm border" style={{ backgroundColor: item.typeBg, color: item.typeColor, borderColor: item.typeColor + "22" }}>{item.type}</span>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.1em]">{item.format} Format</span>
                </div>
                <h3 className="text-[18px] font-black text-slate-900 leading-tight mb-2 group-hover:text-[#2454C8] transition-colors truncate">{item.title}</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[12px] font-bold"><Calendar size={13} /> {item.createdAt}</div>
                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                  <div className="text-slate-400 text-[12px] font-bold italic truncate">{item.project}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 relative z-10">
                <button className="flex items-center gap-2 bg-[#F8FAFC] text-slate-600 px-6 py-3 rounded-2xl text-[13px] font-black hover:bg-[#EDF3FF] hover:text-[#2454C8] hover:border-[#2454C8]/20 transition-all shadow-sm border border-slate-100">
                  <Download size={16} /> 다운로드
                </button>
                <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-300 hover:bg-slate-50 hover:text-slate-600 transition-all shadow-sm"><MoreHorizontal size={18} /></button>
              </div>
            </div>
          ))}
          
          <div className="flex justify-center pt-10"><AppPagination current={1} total={3} onChange={() => {}} /></div>
        </div>
      </div>
    </div>
  );
};
