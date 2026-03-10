import type React from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import {
  BarChart2,
  Home,
  Users,
  Activity,
  Settings,
  Bell,
  UserCircle,
  ChevronRight,
  MessageSquare,
  Radio,
  FileText,
} from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  path: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: <Home size={18} />, path: "/", label: "홈" },
  { icon: <BarChart2 size={18} />, path: "/analytics", label: "세그먼트 분석" },
  { icon: <MessageSquare size={18} />, path: "/survey", label: "설문 에이전트" },
  { icon: <Radio size={18} />, path: "/live", label: "실시간 분석" },
  { icon: <FileText size={18} />, path: "/report", label: "분석 리포트" },
  { icon: <Users size={18} />, path: "/persona", label: "페르소나 관리" },
  { icon: <Activity size={18} />, path: "/reports", label: "리포트 히스토리" },
  { icon: <Settings size={18} />, path: "/settings", label: "설정" },
];

const PAGE_TITLES: Record<string, { sub: string; title: string }> = {
  "/": { sub: "Home", title: "대시보드" },
  "/analytics": { sub: "Analytics", title: "세그먼트 분석" },
  "/survey": { sub: "Survey", title: "설문 Design Agent" },
  "/live": { sub: "Live", title: "실시간 설문 분석" },
  "/report": { sub: "Report", title: "분석 결과 리포트" },
  "/persona": { sub: "Persona", title: "페르소나 관리" },
  "/reports": { sub: "Reports", title: "리포트 히스토리" },
  "/settings": { sub: "Settings", title: "설정" },
};

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pageInfo = PAGE_TITLES[location.pathname] ?? { sub: "Analytics", title: "대시보드" };

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col">
      {/* Top Header */}
      <header className="h-14 bg-white border-b border-[#E8ECF4] flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#3D5AF1] rounded-lg flex items-center justify-center">
              <BarChart2 size={15} className="text-white" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#1E293B" }}>
              Analytics
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400" style={{ fontSize: 13 }}>
            <span>{pageInfo.sub}</span>
            <ChevronRight size={13} />
            <span className="text-[#3D5AF1]" style={{ fontWeight: 600 }}>
              {pageInfo.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative">
            <Bell size={18} className="text-slate-500" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#3D5AF1] rounded-full flex items-center justify-center text-white" style={{ fontSize: 9 }}>
              2
            </span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#EEF1FF] rounded-full flex items-center justify-center">
              <UserCircle size={18} className="text-[#3D5AF1]" />
            </div>
            <div className="hidden sm:block">
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", lineHeight: 1.2 }}>관리자</p>
              <p style={{ fontSize: 11, color: "#94A3B8" }}>admin@analytics.com</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Icon Nav */}
        <nav className="w-14 bg-white border-r border-[#E8ECF4] flex flex-col items-center py-4 gap-2 shrink-0">
          {NAV_ITEMS.map((item, i) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={i}
                title={item.label}
                onClick={() => navigate(item.path)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  isActive
                    ? "bg-[#3D5AF1] text-white shadow-md"
                    : "text-slate-400 hover:bg-[#F1F5FF] hover:text-[#3D5AF1]"
                }`}
              >
                {item.icon}
              </button>
            );
          })}
        </nav>

        {/* Page Content */}
        <Outlet />
      </div>
    </div>
  );
};