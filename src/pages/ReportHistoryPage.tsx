import type React from "react";
import { FileText, Download, Calendar, Search } from "lucide-react";

interface ReportItem {
  id: string;
  title: string;
  project: string;
  createdAt: string;
  type: string;
  typeColor: string;
  typeBg: string;
}

const REPORT_ITEMS: ReportItem[] = [
  { id: "r1", title: "Galaxy S25 컨셉 테스트 분석 리포트", project: "Galaxy S25 컨셉 테스트", createdAt: "2026-03-08", type: "컨셉 테스트", typeColor: "#3D5AF1", typeBg: "#EEF1FF" },
  { id: "r2", title: "MZ세대 스마트폰 Usage 종합 리포트", project: "MZ세대 스마트폰 Usage 조사", createdAt: "2026-03-05", type: "Usage 조사", typeColor: "#16A34A", typeBg: "#F0FDF4" },
  { id: "r3", title: "브랜드 인지도 Q1 2026 최종 리포트", project: "브랜드 인지도 조사 Q1 2026", createdAt: "2026-03-01", type: "브랜드 인식", typeColor: "#7C3AED", typeBg: "#F5F3FF" },
  { id: "r4", title: "온라인 쇼핑 만족도 분석 리포트", project: "온라인 쇼핑 경험 만족도", createdAt: "2026-02-20", type: "Usage 조사", typeColor: "#059669", typeBg: "#F0FDF4" },
  { id: "r5", title: "2030 뷰티 소비자 인식 중간 리포트", project: "2030 뷰티 소비자 인식 조사", createdAt: "2026-02-14", type: "브랜드 인식", typeColor: "#DB2777", typeBg: "#FFF0F5" },
];

export const ReportHistoryPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col bg-[#F4F6FB] overflow-hidden">
      {/* Page Header */}
      <div className="bg-white border-b border-[#E8ECF4] px-8 py-5 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontSize: 12, color: "#3D5AF1", fontWeight: 600, letterSpacing: "0.06em" }}>Reports</p>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B" }}>리포트 히스토리</h1>
            <p style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>생성된 분석 리포트를 확인하고 다운로드하세요.</p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-[#E8ECF4] rounded-xl px-3 py-2">
            <Search size={13} className="text-[#94A3B8]" />
            <input
              className="bg-transparent outline-none placeholder:text-[#CBD5E1]"
              style={{ fontSize: 13, color: "#1E293B", width: 200 }}
              placeholder="리포트 검색..."
            />
          </div>
        </div>
      </div>

      {/* Report List */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="flex flex-col gap-3">
          {REPORT_ITEMS.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#E8ECF4] p-5 flex items-center gap-4 hover:shadow-md hover:border-[#C7D2FE] transition-all"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: item.typeBg }}
              >
                <FileText size={20} style={{ color: item.typeColor }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="px-2 py-0.5 rounded-full border text-xs font-semibold"
                    style={{ backgroundColor: item.typeBg, color: item.typeColor, borderColor: item.typeColor + "33" }}
                  >
                    {item.type}
                  </span>
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }} className="truncate">
                  {item.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <Calendar size={11} className="text-[#94A3B8]" />
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>{item.createdAt}</span>
                  <span style={{ fontSize: 11, color: "#CBD5E1" }}>·</span>
                  <span style={{ fontSize: 11, color: "#64748B" }}>{item.project}</span>
                </div>
              </div>

              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E8ECF4] text-[#475569] hover:bg-[#EEF1FF] hover:border-[#C7D2FE] hover:text-[#3D5AF1] transition-colors"
                style={{ fontSize: 12, fontWeight: 600 }}
              >
                <Download size={13} />
                다운로드
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
