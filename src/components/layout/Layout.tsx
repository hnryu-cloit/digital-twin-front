import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import favicon from "@/assets/favicon.svg";
import {
  Activity,
  BarChart2,
  Bell,
  ChevronRight,
  FileText,
  Home,
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
  { icon: <Activity size={16} />, path: "/reports", label: "리포트 히스토리 관리", section: "운영" },
];

const SECTION_ORDER = ["홈", "워크플로우", "운영"] as const;

const SIDEBAR_MINI = "w-[72px]";
const SIDEBAR_FULL = "w-56";
const CONTENT_MINI = "lg:pl-[72px]";
const CONTENT_FULL = "lg:pl-56";

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
    <div className="min-h-screen bg-[#F4F6FB]">
      <header className="fixed inset-x-0 top-0 z-30 h-14 border-b border-[#E8ECF4] bg-white shadow-sm">
        <div className="flex h-full items-center">
          {/* 사이드바 너비와 동일한 브랜드 영역 */}
          <div
            className={`hidden h-full shrink-0 items-center transition-[width] duration-200 lg:flex ${
              collapsed ? `${SIDEBAR_MINI} justify-center` : `${SIDEBAR_FULL} justify-between px-4`
            }`}
          >
            {!collapsed && (
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF4FF]">
                  <img src={favicon} alt="Digital Twin" className="h-5 w-5" />
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#1E293B" }}>Digital Twin</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E1E8F1] bg-[#F8FAFF] text-[#64748B] transition-colors hover:bg-[#EEF4FF] hover:text-[#3D5AF1]"
              aria-label="사이드바 토글"
            >
              <Menu size={16} />
            </button>
          </div>

          <div className="hidden h-6 w-px bg-[#E8ECF4] lg:block" />

          {/* 나머지 헤더 영역 */}
          <div className="flex min-w-0 flex-1 items-center justify-between px-6">
            <div className="flex min-w-0 items-center gap-1 text-slate-400" style={{ fontSize: 13 }}>
              <span>{currentItem.section}</span>
              <ChevronRight size={13} />
              <span className="truncate text-[#3D5AF1]" style={{ fontWeight: 600 }}>
                {currentItem.label}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative" aria-label="알림">
                <Bell size={18} className="text-slate-500" />
                <span
                  className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#3D5AF1] text-white"
                  style={{ fontSize: 9 }}
                >
                  2
                </span>
              </button>
              <div className="flex items-center gap-2">
              </div>
            </div>
          </div>
        </div>
      </header>

      <aside
        className={`fixed bottom-0 left-0 top-14 z-20 hidden border-r border-[#EAEEF6] bg-white transition-[width] duration-200 lg:flex lg:flex-col ${
          collapsed ? SIDEBAR_MINI : SIDEBAR_FULL
        }`}
      >
        {/* 네비게이션 */}
        <div className="hide-scrollbar flex-1 overflow-y-auto py-4">
          <div className="flex flex-col gap-5">
            {SECTION_ORDER.map((section) => {
              const items = NAV_ITEMS.filter((item) => item.section === section);
              return (
                <section key={section}>
                  {!collapsed && (
                    <p
                      className="px-5 pb-2"
                      style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#A0AEC0" }}
                    >
                      {section.toUpperCase()}
                    </p>
                  )}
                  <div className="flex flex-col gap-1 px-2">
                    {items.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => navigate(item.path)}
                          title={collapsed ? item.label : undefined}
                          className={`flex items-center rounded-lg py-1.5 transition-colors ${
                            collapsed ? "justify-center px-0" : "gap-3 px-3 text-left"
                          } ${isActive ? "bg-[#EEF4FF]" : "hover:bg-[#F8FAFF]"}`}
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              isActive ? "bg-[#DCE8FF] text-[#3D5AF1]" : "text-[#7B8798]"
                            }`}
                          >
                            {item.icon}
                          </span>
                          {!collapsed && (
                            <span
                              className="truncate"
                              style={{
                                fontSize: 13,
                                fontWeight: isActive ? 700 : 500,
                                color: isActive ? "#2454C8" : "#334155",
                              }}
                            >
                              {item.label}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        {/* 유저 카드 */}
        <div className="shrink-0 border-t border-[#EAEEF6] p-2" ref={userMenuRef}>
          {/* 팝업 메뉴 */}
          {userMenuOpen && (
            <div
              className="absolute bottom-[72px] left-2 right-2 z-50 overflow-hidden rounded-xl border border-[#E8ECF4] bg-white shadow-lg"
              style={{ minWidth: 160 }}
            >
              <button
                type="button"
                onClick={() => { navigate("/settings"); setUserMenuOpen(false); }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-[#F4F7FF]"
                style={{ fontSize: 13, color: "#334155" }}
              >
                <Settings size={15} className="text-[#7B8798]" />
                설정
              </button>
              <div className="mx-3 h-px bg-[#F1F5F9]" />
              <button
                type="button"
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-[#F4F7FF]"
                style={{ fontSize: 13, color: "#334155" }}
              >
                <LogOut size={15} className="text-[#7B8798]" />
                로그아웃
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setUserMenuOpen((v) => !v)}
            className={`flex w-full items-center rounded-xl py-2 transition-colors hover:bg-[#F4F7FF] ${
              collapsed ? "justify-center px-0" : "gap-3 px-2"
            } ${userMenuOpen ? "bg-[#F4F7FF]" : ""}`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF1FF]">
              <UserCircle size={18} className="text-[#3D5AF1]" />
            </div>
            {!collapsed && (
              <div className="min-w-0 text-left">
                <p className="truncate" style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>관리자</p>
                <p className="truncate" style={{ fontSize: 11, color: "#94A3B8" }}>admin@samsung.com</p>
              </div>
            )}
          </button>
        </div>
      </aside>

      <div className={`pt-14 transition-[padding-left] duration-200 ${collapsed ? CONTENT_MINI : CONTENT_FULL}`}>
        <div className="hide-scrollbar flex h-[calc(100vh-56px)] overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
