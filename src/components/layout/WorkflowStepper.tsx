import { Fragment } from "react";
import { useNavigate } from "react-router";
import { ChevronRight } from "lucide-react";

type WorkflowPath = "/analytics" | "/survey" | "/live" | "/report";

const STEPS: Array<{ path: WorkflowPath; label: string }> = [
  { path: "/analytics", label: "세그먼트 분석" },
  { path: "/survey", label: "설문 디자인" },
  { path: "/live", label: "실시간 설문 분석" },
  { path: "/report", label: "분석 결과 리포트" },
];

export const WorkflowStepper: React.FC<{ currentPath: WorkflowPath }> = ({ currentPath }) => {
  const navigate = useNavigate();
  const currentIndex = STEPS.findIndex((step) => step.path === currentPath);

  return (
    <div className="border-b border-[#E1E8F1] bg-white px-6 py-3 lg:hidden">
      <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto">
        {STEPS.map((step, index) => {
          const isActive = step.path === currentPath;
          const isDone = index < currentIndex;

          return (
            <Fragment key={step.path}>
              <button
                type="button"
                onClick={() => navigate(step.path)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 transition-colors ${
                  isActive
                    ? "bg-[#EEF4FF] text-[#2454C8]"
                    : isDone
                      ? "bg-[#F7FAFF] text-[#3C4556] hover:bg-[#EEF4FF]"
                      : "bg-transparent text-[#94A3B8] hover:bg-[#F8FAFF]"
                }`}
                style={{ fontSize: 12, fontWeight: isActive ? 700 : 500 }}
              >
                <span>{step.label}</span>
              </button>
              {index < STEPS.length - 1 && <ChevronRight size={14} className="shrink-0 text-[#CBD5E1]" />}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};
