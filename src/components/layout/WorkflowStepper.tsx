import React from "react";
import { useNavigate } from "react-router";
import { ChevronRight } from "lucide-react";

type WorkflowPath = "/analytics" | "/survey" | "/live" | "/report";

const STEPS: Array<{ path: WorkflowPath; label: string }> = [
  { path: "/analytics", label: "세그먼트 분석" },
  { path: "/survey", label: "설문 Design Agent" },
  { path: "/live", label: "실시간 설문 분석" },
  { path: "/report", label: "분석 결과 리포트" },
];

export const WorkflowStepper: React.FC<{ currentPath: WorkflowPath }> = ({ currentPath }) => {
  const navigate = useNavigate();
  const currentIndex = STEPS.findIndex((step) => step.path === currentPath);

  return (
    <div className="bg-white border-b border-[#E1E8F1] px-6 py-3">
      <div className="flex flex-wrap items-center gap-2">
        {STEPS.map((step, index) => {
          const isActive = step.path === currentPath;
          const isDone = index < currentIndex;
          return (
            <React.Fragment key={step.path}>
              <button
                type="button"
                onClick={() => navigate(step.path)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors ${
                  isActive
                    ? "bg-[#EEF4FF] text-[#2454C8]"
                    : isDone
                      ? "bg-[#F7FAFF] text-[#3C4556] hover:bg-[#EEF4FF]"
                      : "bg-transparent text-[#94A3B8] hover:bg-[#F8FAFF]"
                }`}
                style={{ fontSize: 12, fontWeight: isActive ? 700 : 500 }}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full ${
                    isActive ? "bg-[#3D5AF1] text-white" : isDone ? "bg-[#DCE8FF] text-[#3D5AF1]" : "bg-[#EEF2F7] text-[#94A3B8]"
                  }`}
                  style={{ fontSize: 10, fontWeight: 700 }}
                >
                  {index + 1}
                </span>
                <span>{step.label}</span>
              </button>
              {index < STEPS.length - 1 && <ChevronRight size={14} className="text-[#CBD5E1]" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
