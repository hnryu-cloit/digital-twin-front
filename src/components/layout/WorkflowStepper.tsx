import type React from "react";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Check } from "lucide-react";

type WorkflowPath = "/analytics" | "/survey" | "/live" | "/report";

const STEPS: Array<{ path: WorkflowPath; label: string }> = [
  { path: "/analytics", label: "세그먼트 분석" },
  { path: "/survey", label: "설문 디자인" },
  { path: "/live", label: "실시간 응답 분석" },
  { path: "/report", label: "분석 결과 리포트" },
];

export const WorkflowStepper: React.FC<{ currentPath: WorkflowPath }> = ({ currentPath }) => {
  const navigate = useNavigate();
  const currentIndex = STEPS.findIndex((step) => step.path === currentPath);

  return (
    <div className="border-b border-[var(--border)] bg-card px-6 py-2.5 lg:hidden shadow-[var(--shadow-sm)]">
      <div className="hide-scrollbar flex items-center gap-1.5 overflow-x-auto">
        {STEPS.map((step, index) => {
          const isActive = step.path === currentPath;
          const isDone = index < currentIndex;

          return (
            <Fragment key={step.path}>
              <button
                type="button"
                onClick={() => navigate(step.path)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground font-black shadow-[var(--shadow-md)] scale-105"
                    : isDone
                      ? "bg-primary-light-bg text-primary font-bold hover:bg-primary-light-border/30"
                      : "bg-accent/50 text-subtle-foreground font-bold hover:bg-accent"
                }`}
                style={{ fontSize: 11 }}
              >
                {isDone && <Check size={12} className="shrink-0" />}
                <span>{step.label}</span>
              </button>
              {index < STEPS.length - 1 && <ChevronRight size={14} className="shrink-0 text-border" />}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};
