import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import favicon from "@/assets/favicon.svg";
import { FloatingAiChat } from "@/components/layout/FloatingAiChat";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import {
  Activity,
  BarChart2,
  Bell,
  ChevronRight,
  FileText,
  Home,
  Layers3,
  Lock,
  LogOut,
  Menu,
  MessageSquare,
  Radio,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  path: string;
  label: string;
  section: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: <Home size={16} />, path: "/", label: "대시보드", section: "홈" },
  { icon: <BarChart2 size={16} />, path: "/analytics", label: "세그먼트 분석", section: "워크플로우" },
  { icon: <MessageSquare size={16} />, path: "/survey", label: "설문 디자인", section: "워크플로우" },
  { icon: <Radio size={16} />, path: "/live", label: "실시간 응답 분석", section: "워크플로우" },
  { icon: <FileText size={16} />, path: "/report", label: "분석 결과 리포트", section: "워크플로우" },
  { icon: <Users size={16} />, path: "/persona", label: "페르소나 관리", section: "운영" },
  { icon: <Layers3 size={16} />, path: "/jobs", label: "AI 작업 허브", section: "운영" },
  { icon: <Activity size={16} />, path: "/reports", label: "리포트 히스토리 관리", section: "운영" },
];

const SECTION_ORDER = ["홈", "워크플로우", "운영"] as const;

const SIDEBAR_MINI = "w-[72px]";
const SIDEBAR_FULL = "w-56";
const CONTENT_MINI = "lg:pl-[72px]";
const CONTENT_FULL = "lg:pl-56";

const WORKFLOW_STEPS = [
  { path: "/analytics", label: "세그먼트 분석" },
  { path: "/survey",    label: "설문 디자인" },
  { path: "/live",      label: "실시간 응답 분석" },
  { path: "/report",   label: "분석 결과 리포트" },
] as const;

const WORKFLOW_PATHS = WORKFLOW_STEPS.map((s) => s.path) as string[];

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [projectName, setProjectName] = useState<string>("");
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isWorkflowPage = WORKFLOW_PATHS.includes(location.pathname);
  const [furthestStepIndex, setFurthestStepIndex] = useState<number>(() => {
    return parseInt(sessionStorage.getItem("workflowFurthestStep") ?? "-1");
  });

  useEffect(() => {
    const stepIndex = WORKFLOW_STEPS.findIndex((s) => s.path === location.pathname);
    if (stepIndex >= 0) {
      setProjectName(sessionStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT_NAME) ?? "");
      const stored = parseInt(sessionStorage.getItem("workflowFurthestStep") ?? "-1");
      if (stepIndex > stored) {
        sessionStorage.setItem("workflowFurthestStep", String(stepIndex));
        setFurthestStepIndex(stepIndex);
      } else {
        setFurthestStepIndex(stored);
      }
    } else if (location.pathname === "/") {
      sessionStorage.removeItem("workflowFurthestStep");
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_PROJECT_NAME);
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_PROJECT_ID);
      setFurthestStepIndex(-1);
      setProjectName("");
    }
  }, [location.pathname]);

  const currentItem = [...NAV_ITEMS, { path: "/settings", label: "설정", section: "운영", icon: null }]
    .find((item) => item.path === location.pathname) ?? NAV_ITEMS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10 selection:text-primary">
      {/* ── Top Header ── */}
      <header className="fixed inset-x-0 top-0 z-30 h-14 border-b border-[var(--border)] bg-card/80 backdrop-blur-md shadow-[var(--shadow-sm)]">
        <div className="flex h-full items-center">
          <div
            className={`hidden h-full shrink-0 items-center transition-[width] duration-200 lg:flex ${
              collapsed ? `${SIDEBAR_MINI} justify-center` : `${SIDEBAR_FULL} justify-between px-5`
            }`}
          >
            {!collapsed && (
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                  <img src={favicon} alt="Digital Twin" className="h-5 w-5 brightness-0 invert" />
                </div>
                <p className="text-[15px] font-bold tracking-tight text-foreground">Digital Twin</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--panel-soft)] text-[var(--muted-foreground)] transition-colors hover:border-primary/30 hover:bg-[var(--primary-light-bg)] hover:text-primary active:scale-95"
              aria-label="사이드바 토글"
            >
              <Menu size={15} />
            </button>
          </div>

          <div className="hidden h-6 w-px bg-[var(--border)] lg:block" />

          <div className="flex min-w-0 flex-1 items-center justify-between px-6">
            <div className="flex min-w-0 items-center gap-1 text-[12px] font-medium text-[var(--subtle-foreground)] overflow-x-auto hide-scrollbar">
              {isWorkflowPage ? (
                <>
                  {projectName && (
                    <>
                      <span className="shrink-0 font-semibold">{projectName}</span>
                      <ChevronRight size={11} className="shrink-0 opacity-40" />
                    </>
                  )}
                  {WORKFLOW_STEPS.map((step, i) => {
                    const isActive = location.pathname === step.path;
                    const isDone = WORKFLOW_STEPS.findIndex((s) => s.path === location.pathname) > i;
                    return (
                      <span key={step.path} className="flex shrink-0 items-center gap-1">
                        <span className={
                          isActive
                            ? "font-black text-primary"
                            : isDone
                            ? "font-semibold text-[var(--muted-foreground)]"
                            : "font-medium text-[var(--border)]"
                        }>
                          {step.label}
                        </span>
                        {i < WORKFLOW_STEPS.length - 1 && (
                          <ChevronRight size={11} className="shrink-0 opacity-30" />
                        )}
                      </span>
                    );
                  })}
                </>
              ) : (
                <>
                  <span>{currentItem.section}</span>
                  <ChevronRight size={12} className="opacity-50" />
                  <span className="truncate font-bold text-primary">{currentItem.label}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[var(--surface-hover)]" aria-label="알림">
                <Bell size={18} className="text-[var(--muted-foreground)]" />
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white ring-2 ring-card">
                  2
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Left Sidebar ── */}
      <aside
        className={`fixed bottom-0 left-0 top-14 z-20 hidden border-r border-[var(--border)] bg-card transition-[width] duration-200 lg:flex lg:flex-col ${
          collapsed ? SIDEBAR_MINI : SIDEBAR_FULL
        }`}
      >
        <div className="hide-scrollbar flex-1 overflow-y-auto py-5">
          <div className="flex flex-col gap-6">
            {SECTION_ORDER.map((section) => {
              const items = NAV_ITEMS.filter((item) => item.section === section);
              return (
                <section key={section} className="px-3">
                  {!collapsed && (
                    <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--subtle-foreground)] opacity-70">
                      {section}
                    </p>
                  )}
                  <div className="flex flex-col gap-1">
                    {items.map((item) => {
                      const isActive = location.pathname === item.path;
                      const workflowIndex = WORKFLOW_PATHS.indexOf(item.path);
                      const isWorkflowItem = workflowIndex >= 0;
                      const isLocked = isWorkflowItem && workflowIndex > furthestStepIndex;

                      const handleClick = () => {
                        if (isLocked) return;
                        if (isWorkflowItem) {
                          const pid = sessionStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT_ID);
                          navigate(item.path, pid ? { state: { projectId: pid } } : undefined);
                        } else {
                          navigate(item.path);
                        }
                      };

                      return (
                        <div key={item.path} className="relative group/nav">
                          <button
                            type="button"
                            onClick={handleClick}
                            title={collapsed ? item.label : undefined}
                            className={`group relative flex w-full items-center rounded-xl py-2.5 transition-all ${
                              collapsed ? "justify-center" : "gap-3 px-3 text-left"
                            } ${
                              isLocked
                                ? "cursor-not-allowed opacity-40"
                                : "active:scale-[0.97]"
                            } ${
                              isActive
                                ? "bg-[var(--primary-light-bg)] text-primary shadow-sm"
                                : isLocked
                                ? "text-[var(--secondary-foreground)]"
                                : "text-[var(--secondary-foreground)] hover:bg-[var(--surface-hover)] hover:text-primary"
                            }`}
                          >
                            <span className={`flex shrink-0 items-center justify-center transition-colors ${
                              isActive ? "text-primary" : "text-[var(--subtle-foreground)] group-hover:text-primary"
                            }`}>
                              {item.icon}
                            </span>
                            {!collapsed && (
                              <span className={`flex-1 truncate text-[13px] tracking-tight ${isActive ? "font-bold" : "font-semibold"}`}>
                                {item.label}
                              </span>
                            )}
                            {!collapsed && isLocked && (
                              <Lock size={10} className="shrink-0 text-[var(--subtle-foreground)]" />
                            )}
                            {isActive && (
                              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />
                            )}
                          </button>
                          {isLocked && !collapsed && (
                            <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 hidden group-hover/nav:block">
                              <div className="whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-[11px] font-semibold text-background shadow-lg">
                                이전 단계 완료 후 진입 가능합니다
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        {/* User Profile Area */}
        <div className="shrink-0 border-t border-[var(--border)] p-3" ref={userMenuRef}>
          {userMenuOpen && (
            <div className="absolute bottom-[76px] left-3 right-3 z-50 overflow-hidden rounded-2xl border border-[var(--border)] bg-card p-1.5 shadow-[var(--shadow-lg)] animate-in fade-in slide-in-from-bottom-2 duration-200">
              <button
                onClick={() => { navigate("/settings"); setUserMenuOpen(false); }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-[var(--secondary-foreground)] transition-colors hover:bg-[var(--surface-hover)] hover:text-primary"
              >
                <Settings size={16} /> 설정
              </button>
              <div className="my-1 h-px bg-[var(--border)] opacity-50" />
              <button className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-[var(--destructive)] transition-colors hover:bg-red-50">
                <LogOut size={16} /> 로그아웃
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setUserMenuOpen((v) => !v)}
            className={`flex w-full items-center rounded-xl p-2 transition-all hover:bg-[var(--surface-hover)] ${
              collapsed ? "justify-center" : "gap-3"
            } ${userMenuOpen ? "bg-[var(--surface-hover)]" : ""}`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary-light-bg)] text-primary shadow-inner">
              <UserCircle size={20} />
            </div>
            {!collapsed && (
              <div className="min-w-0 text-left">
                <p className="truncate text-[13px] font-bold text-foreground">관리자</p>
                <p className="truncate text-[11px] font-medium text-[var(--subtle-foreground)]">admin@samsung.com</p>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className={`pt-14 transition-[padding-left] duration-200 ${collapsed ? CONTENT_MINI : CONTENT_FULL}`}>
        <div className="app-content-density hide-scrollbar flex h-[calc((100vh-56px)/0.9)] overflow-hidden">
          <Outlet />
        </div>
      </div>

      {location.pathname !== "/survey" && <FloatingAiChat />}
    </div>
  );
};
