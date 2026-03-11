import type React from "react";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import favicon from "@/assets/favicon.svg";
import {
  Activity,
  BarChart2,
  Bell,
  ChevronRight,
  FileText,
  Home,
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
  { icon: <MessageSquare size={16} />, path: "/survey", label: "설문 Design Agent", section: "워크플로우" },
  { icon: <Radio size={16} />, path: "/live", label: "실시간 설문 분석", section: "워크플로우" },
  { icon: <FileText size={16} />, path: "/report", label: "분석 결과 리포트", section: "워크플로우" },
  { icon: <Users size={16} />, path: "/persona", label: "페르소나 관리", section: "운영" },
  { icon: <Activity size={16} />, path: "/reports", label: "리포트 히스토리 관리", section: "운영" },
  { icon: <Settings size={16} />, path: "/settings", label: "설정(관리자 보드)", section: "운영" },
];

const SECTION_ORDER = ["홈", "워크플로우", "운영"] as const;

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const currentItem = NAV_ITEMS.find((item) => item.path === location.pathname) ?? NAV_ITEMS[0];
  const sidebarWidthClass = collapsed ? "w-[76px]" : "w-64";
  const contentPaddingClass = collapsed ? "lg:pl-[76px]" : "lg:pl-64";

  return (
    <div className="min-h-screen bg-[#F4F6FB]">
      <header className="fixed inset-x-0 top-0 z-30 h-14 border-b border-[#E8ECF4] bg-white shadow-sm">
        <div className="flex h-full items-center">
          <div
            className={`hidden h-full items-center border-r border-[#E8ECF4] px-4 lg:flex ${sidebarWidthClass}`}
          >
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E1E8F1] bg-[#F8FAFF] text-[#64748B] transition-colors hover:bg-[#EEF4FF] hover:text-[#3D5AF1]"
              aria-label="사이드바 토글"
            >
              <Menu size={16} />
            </button>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-between px-6">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF4FF]">
                  <img src={favicon} alt="Digital Twin" className="h-5 w-5" />
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#1E293B" }}>Digital Twin</p>
              </div>

              <div className="flex min-w-0 items-center gap-1 text-slate-400" style={{ fontSize: 13 }}>
                <span>{currentItem.section}</span>
                <ChevronRight size={13} />
                <span className="truncate text-[#3D5AF1]" style={{ fontWeight: 600 }}>
                  {currentItem.label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative" aria-label="알림">
                <Bell size={18} className="text-slate-500" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#3D5AF1] text-white" style={{ fontSize: 9 }}>
                  2
                </span>
              </button>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF1FF]">
                  <UserCircle size={18} className="text-[#3D5AF1]" />
                </div>
                <div className="hidden sm:block">
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", lineHeight: 1.2 }}>관리자</p>
                  <p style={{ fontSize: 11, color: "#94A3B8" }}>admin@digitaltwin.ai</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <aside
        className={`fixed bottom-0 left-0 top-14 z-20 hidden border-r border-[#E8ECF4] bg-white transition-[width] duration-200 lg:flex lg:flex-col ${sidebarWidthClass}`}
      >
        <div className="hide-scrollbar flex-1 overflow-y-auto px-3 py-4">
          <div className="flex flex-col gap-5">
            {SECTION_ORDER.map((section) => {
              const items = NAV_ITEMS.filter((item) => item.section === section);
              return (
                <section key={section}>
                  {!collapsed && (
                    <p
                      className="px-3 pb-2"
                      style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#A0AEC0" }}
                    >
                      {section.toUpperCase()}
                    </p>
                  )}
                  <div className="flex flex-col gap-1">
                    {items.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => navigate(item.path)}
                          title={collapsed ? item.label : undefined}
                          className={`flex items-center rounded-lg transition-colors ${
                            collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5 text-left"
                          } ${isActive ? "bg-[#EEF4FF]" : "hover:bg-[#F8FAFF]"}`}
                        >
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
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
      </aside>

      <div className={`pt-14 transition-[padding-left] duration-200 ${contentPaddingClass}`}>
        <div className="hide-scrollbar flex h-[calc(100vh-56px)] overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
