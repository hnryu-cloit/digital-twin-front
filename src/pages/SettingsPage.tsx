import type React from "react";
import { User, Bell, Shield, Palette, Globe, ChevronRight } from "lucide-react";

interface SettingSection {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  colorBg: string;
}

const SETTING_SECTIONS: SettingSection[] = [
  { icon: <User size={18} />, title: "프로필 설정", description: "이름, 이메일, 프로필 이미지를 관리합니다.", color: "#3D5AF1", colorBg: "#EEF1FF" },
  { icon: <Bell size={18} />, title: "알림 설정", description: "응답 완료, 리포트 생성 등 알림 조건을 설정합니다.", color: "#16A34A", colorBg: "#F0FDF4" },
  { icon: <Shield size={18} />, title: "보안 설정", description: "비밀번호 변경 및 2단계 인증을 관리합니다.", color: "#EA580C", colorBg: "#FFF7ED" },
  { icon: <Palette size={18} />, title: "테마 설정", description: "다크모드, 컬러 테마 등 UI 환경을 설정합니다.", color: "#7C3AED", colorBg: "#F5F3FF" },
  { icon: <Globe size={18} />, title: "언어 / 지역 설정", description: "언어, 시간대, 날짜 형식을 설정합니다.", color: "#0284C7", colorBg: "#F0F9FF" },
];

export const SettingsPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col bg-[#F4F6FB] overflow-hidden">
      {/* Page Header */}
      <div className="bg-white border-b border-[#E8ECF4] px-8 py-5 shrink-0">
        <p style={{ fontSize: 12, color: "#3D5AF1", fontWeight: 600, letterSpacing: "0.06em" }}>Settings</p>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B" }}>설정</h1>
        <p style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>계정 및 시스템 환경을 설정합니다.</p>
      </div>

      {/* Settings List */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="flex flex-col gap-3 max-w-2xl">
          {SETTING_SECTIONS.map((section) => (
            <button
              key={section.title}
              className="bg-white rounded-2xl border border-[#E8ECF4] p-5 flex items-center gap-4 hover:shadow-md hover:border-[#C7D2FE] transition-all text-left group"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: section.colorBg }}
              >
                <span style={{ color: section.color }}>{section.icon}</span>
              </div>
              <div className="flex-1">
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>{section.title}</h3>
                <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{section.description}</p>
              </div>
              <ChevronRight size={16} className="text-[#CBD5E1] group-hover:text-[#3D5AF1] transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
