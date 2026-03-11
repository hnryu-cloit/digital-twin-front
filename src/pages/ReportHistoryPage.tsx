import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Archive, Calendar, Download, FileText, Link2, MoreHorizontal, Search, Trash2 } from "lucide-react";

interface ReportItem {
  id: string;
  title: string;
  project: string;
  createdAt: string;
  type: string;
  typeColor: string;
  typeBg: string;
  format: "PDF" | "DOCX" | "HWP";
}

const FORMAT_STYLE: Record<ReportItem["format"], { bg: string; color: string }> = {
  PDF:  { bg: "#FFF7ED", color: "#EA580C" },
  DOCX: { bg: "#EEF4FF", color: "#3D5AF1" },
  HWP:  { bg: "#F0FDF4", color: "#16A34A" },
};

const REPORT_ITEMS: ReportItem[] = [
  { id: "r1", title: "Galaxy S25 컨셉 테스트 분석 리포트",  project: "Galaxy S25 컨셉 테스트",      createdAt: "2026-03-08", type: "컨셉 테스트", typeColor: "#5B7DFF", typeBg: "#EEF4FF", format: "PDF" },
  { id: "r2", title: "MZ세대 스마트폰 Usage 종합 리포트",   project: "MZ세대 스마트폰 Usage 조사",  createdAt: "2026-03-05", type: "Usage 조사",  typeColor: "#16A34A", typeBg: "#F0FDF4", format: "DOCX" },
  { id: "r3", title: "브랜드 인지도 Q1 2026 최종 리포트",   project: "브랜드 인지도 조사 Q1 2026", createdAt: "2026-03-01", type: "브랜드 인식", typeColor: "#7C3AED", typeBg: "#F5F3FF", format: "HWP" },
  { id: "r4", title: "온라인 쇼핑 만족도 분석 리포트",      project: "온라인 쇼핑 경험 만족도",    createdAt: "2026-02-20", type: "Usage 조사",  typeColor: "#059669", typeBg: "#F0FDF4", format: "PDF" },
  { id: "r5", title: "2030 뷰티 소비자 인식 중간 리포트",   project: "2030 뷰티 소비자 인식 조사", createdAt: "2026-02-14", type: "브랜드 인식", typeColor: "#DB2777", typeBg: "#FFF0F5", format: "DOCX" },
];

function MoreMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-10 z-50 w-44 overflow-hidden rounded-xl border border-[#E8ECF4] bg-white shadow-lg"
    >
      <div className="px-1 py-1">
        <button
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-[#F4F7FF]"
          style={{ fontSize: 13, color: "#334155" }}
        >
          <FileText size={14} className="text-[#7B8798]" />
          응답 데이터 다운로드
        </button>
      </div>

      <div className="mx-2 h-px bg-[#F1F5F9]" />

      <div className="px-1 py-1">
        <button
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-[#F4F7FF]"
          style={{ fontSize: 13, color: "#334155" }}
        >
          <Link2 size={14} className="text-[#7B8798]" />
          공유
        </button>
        <button
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-[#F4F7FF]"
          style={{ fontSize: 13, color: "#334155" }}
        >
          <Archive size={14} className="text-[#7B8798]" />
          보관
        </button>
      </div>

      <div className="mx-2 h-px bg-[#F1F5F9]" />

      <div className="px-1 py-1">
        <button
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-[#FFF4F4]"
          style={{ fontSize: 13, color: "#EF4444" }}
        >
          <Trash2 size={14} />
          삭제
        </button>
      </div>
    </div>
  );
}

export const ReportHistoryPage: React.FC = () => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#EEF2FA]">
      {/* Page Header */}
      <div className="shrink-0 border-b border-[#E1E8F1] bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontSize: 12, color: "#5B7DFF", fontWeight: 600, letterSpacing: "0.06em" }}>Reports</p>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1D1F3D" }}>리포트 히스토리</h1>
            <p style={{ fontSize: 13, color: "#7C8397", marginTop: 2 }}>생성된 분석 리포트를 확인하고 다운로드하세요.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#E1E8F1] bg-white px-3 py-2">
            <Search size={13} className="text-[#9BA6B8]" />
            <input
              className="bg-transparent outline-none placeholder:text-[#DCE4F3]"
              style={{ fontSize: 13, color: "#1D1F3D", width: 200 }}
              placeholder="리포트 검색..."
            />
          </div>
        </div>
      </div>

      {/* Report List */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="flex flex-col gap-3">
          {REPORT_ITEMS.map((item) => {
            const fmt = FORMAT_STYLE[item.format];
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-2xl border border-[#E1E8F1] bg-white p-5 transition-all hover:border-[#BFD4FF] hover:shadow-md"
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: item.typeBg }}
                >
                  <FileText size={20} style={{ color: item.typeColor }} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    {/* 리포트 유형 */}
                    <span
                      className="rounded-full border px-2 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: item.typeBg, color: item.typeColor, borderColor: item.typeColor + "33" }}
                    >
                      {item.type}
                    </span>
                    {/* 형식 태그 */}
                    <span
                      className="rounded-md px-2 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: fmt.bg, color: fmt.color }}
                    >
                      {item.format}
                    </span>
                  </div>
                  <h3 className="truncate" style={{ fontSize: 14, fontWeight: 700, color: "#1D1F3D" }}>
                    {item.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Calendar size={11} className="text-[#9BA6B8]" />
                    <span style={{ fontSize: 11, color: "#9BA6B8" }}>{item.createdAt}</span>
                    <span style={{ fontSize: 11, color: "#DCE4F3" }}>·</span>
                    <span style={{ fontSize: 11, color: "#7C8397" }}>{item.project}</span>
                  </div>
                </div>

                {/* 액션 */}
                <div className="relative flex shrink-0 items-center gap-2">
                  <button
                    className="flex items-center gap-1.5 rounded-xl border border-[#E1E8F1] px-4 py-2 text-[#3C4556] transition-colors hover:border-[#BFD4FF] hover:bg-[#EEF4FF] hover:text-[#5B7DFF]"
                    style={{ fontSize: 12, fontWeight: 600 }}
                  >
                    <Download size={13} />
                    다운로드
                  </button>

                  <button
                    onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                    className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
                      openMenuId === item.id
                        ? "border-[#BFD4FF] bg-[#EEF4FF] text-[#5B7DFF]"
                        : "border-[#E1E8F1] text-[#9BA6B8] hover:border-[#BFD4FF] hover:bg-[#EEF4FF] hover:text-[#5B7DFF]"
                    }`}
                  >
                    <MoreHorizontal size={15} />
                  </button>

                  <MoreMenu
                    open={openMenuId === item.id}
                    onClose={() => setOpenMenuId(null)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};