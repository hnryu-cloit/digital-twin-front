import type React from "react";
import {
  Building2,
  ChevronRight,
  Database,
  FileCheck,
  KeyRound,
  LayoutGrid,
  Shield,
  Users,
} from "lucide-react";

interface AdminMetric {
  label: string;
  value: string;
  sub: string;
  color: string;
}

interface AdminSection {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  colorBg: string;
}

const ADMIN_METRICS: AdminMetric[] = [
  { label: "활성 사용자", value: "128", sub: "본사 12 / 실무 116", color: "#5B7DFF" },
  { label: "연결 데이터 소스", value: "9", sub: "CRM, 설문, 로그, 리포트", color: "#16A34A" },
  { label: "운영 권한 정책", value: "14", sub: "역할별 권한 세트", color: "#EA580C" },
  { label: "정기 리포트 작업", value: "23", sub: "주간 12 / 월간 11", color: "#7C3AED" },
];

const ADMIN_SECTIONS: AdminSection[] = [
  {
    icon: <Users size={18} />,
    title: "사용자 및 역할 관리",
    description: "관리자, 분석가, 운영자 권한을 분리하고 사용자별 접근 범위를 설정합니다.",
    color: "#5B7DFF",
    colorBg: "#EEF4FF",
  },
  {
    icon: <Shield size={18} />,
    title: "권한 정책 및 보안",
    description: "메뉴 접근 권한, 다운로드 제어, 감사 로그, 인증 정책을 관리합니다.",
    color: "#16A34A",
    colorBg: "#F0FDF4",
  },
  {
    icon: <Database size={18} />,
    title: "데이터 소스 및 수집 설정",
    description: "설문, 로그, 외부 연동 데이터의 연결 상태와 동기화 주기를 관리합니다.",
    color: "#0284C7",
    colorBg: "#F0F9FF",
  },
  {
    icon: <FileCheck size={18} />,
    title: "리포트 정책 및 승인 흐름",
    description: "리포트 템플릿, 검수 단계, 배포 채널, 보관 주기를 운영 기준에 맞게 설정합니다.",
    color: "#EA580C",
    colorBg: "#FFF7ED",
  },
  {
    icon: <LayoutGrid size={18} />,
    title: "서비스 화면 및 메뉴 구성",
    description: "워크플로우 노출 순서, 홈 대시보드 위젯, 관리자 전용 메뉴를 구성합니다.",
    color: "#7C3AED",
    colorBg: "#F5F3FF",
  },
  {
    icon: <Building2 size={18} />,
    title: "조직 및 운영 단위 관리",
    description: "법인, 본부, 팀, 프로젝트 단위로 운영 범위를 나누고 기본 정책을 연결합니다.",
    color: "#DB2777",
    colorBg: "#FDF2F8",
  },
  {
    icon: <KeyRound size={18} />,
    title: "API 키 및 시스템 연동",
    description: "외부 서비스 연동 키, 웹훅, 배치 작업, 시스템 헬스 체크 기준을 관리합니다.",
    color: "#475569",
    colorBg: "#F8FAFC",
  },
];

export const SettingsPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col bg-[#EEF2FA] overflow-hidden">
      <div className="bg-white border-b border-[#E1E8F1] px-8 py-5 shrink-0">
        <p style={{ fontSize: 12, color: "#5B7DFF", fontWeight: 600, letterSpacing: "0.06em" }}>
          ADMIN BOARD
        </p>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1D1F3D" }}>설정</h1>
        <p style={{ fontSize: 13, color: "#7C8397", marginTop: 2 }}>
          서비스 운영 정책, 권한 체계, 데이터 연동, 리포트 관리 기준을 통합 설정합니다.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {ADMIN_METRICS.map((metric) => (
            <article
              key={metric.label}
              className="rounded-2xl border border-[#E1E8F1] bg-white p-5"
            >
              <p style={{ fontSize: 11, color: "#9BA6B8", fontWeight: 600 }}>{metric.label}</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: "#1D1F3D", marginTop: 4 }}>{metric.value}</p>
              <p style={{ fontSize: 12, color: metric.color, marginTop: 6, fontWeight: 600 }}>{metric.sub}</p>
            </article>
          ))}
        </section>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1D1F3D" }}>관리자 보드 메뉴</h2>
              <p style={{ fontSize: 12, color: "#9BA6B8", marginTop: 2 }}>
                운영자가 직접 관리해야 하는 핵심 설정 영역만 별도 분리했습니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {ADMIN_SECTIONS.map((section) => (
              <button
                key={section.title}
                className="bg-white rounded-2xl border border-[#E1E8F1] p-5 flex items-center gap-4 hover:shadow-md hover:border-[#BFD4FF] transition-all text-left group"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: section.colorBg }}
                >
                  <span style={{ color: section.color }}>{section.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1D1F3D" }}>{section.title}</h3>
                  <p style={{ fontSize: 12, color: "#7C8397", marginTop: 4, lineHeight: 1.6 }}>
                    {section.description}
                  </p>
                </div>
                <ChevronRight size={16} className="text-[#DCE4F3] group-hover:text-[#5B7DFF] transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
