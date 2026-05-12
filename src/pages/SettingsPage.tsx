import type React from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Shield,
  Database,
  Users,
  Save,
  Terminal,
  Globe,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Search,
  Briefcase,
  MessageSquare,
  History,
  Network,
  Plus,
  Calendar as CalendarIcon,
  UserCheck,
  ChevronRight,
  BarChart,
  ArrowLeft,
  UserCircle,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";
import { SectionTitle } from "@/components/settings/SectionTitle";
import { SettingGroup } from "@/components/settings/SettingGroup";
import { StatCard } from "@/components/settings/StatCard";
import { DataSourceSection } from "@/components/settings/DataSourceSection";
import { PromptSettingsSection } from "@/components/settings/PromptSettingsSection";
import { LogsSection } from "@/components/settings/LogsSection";
import { ValidationSection } from "@/components/settings/ValidationSection";

/* ─── 네비게이션 구조 ─── */
interface NavSection {
  label: string;
  items: { key: string; label: string; icon: React.ElementType }[];
}

const NAV: NavSection[] = [
  {
    label: "플랫폼 관리",
    items: [
      { key: "projects", label: "프로젝트 현황판", icon: Briefcase },
      { key: "datasrc", label: "데이터 커넥터", icon: Database },
      { key: "users", label: "멤버 & 접근 제어", icon: Users },
    ],
  },
  {
    label: "AI 구성 & 감사",
    items: [
      { key: "prompt", label: "설문 템플릿 관리", icon: Terminal },
      { key: "logs", label: "대화 감사 로그", icon: MessageSquare },
      { key: "validation", label: "품질 검증 아카이브", icon: History },
    ],
  },
];

/* ─── 섹션 콘텐츠 ─── */
const CONTENT: Record<string, React.ReactNode> = {
  projects: (
    <>
      <SectionTitle
        title="프로젝트 현황판"
        desc="진행 중인 전체 리서치 프로젝트 현황과 연결된 데이터 소스를 한눈에 확인합니다"
      />
      <div className="grid grid-cols-1 gap-6">
        {/* 요약 스탯 */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="전체 프로젝트" value="14" sub="이번 분기 기준" tone="neutral" icon={Briefcase} />
          <StatCard label="진행중" value="5" sub="응답 수집 중" tone="primary" icon={Activity} />
          <StatCard label="분석중" value="4" sub="AI 처리 완료" tone="success" icon={BarChart} />
          <StatCard label="대기 / 일시정지" value="5" sub="시작 전 또는 보류" tone="warn" icon={Clock} />
        </div>

        {/* 필터 바 */}
        <SettingGroup>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-[var(--panel-soft)] px-4 py-2.5 rounded-xl border border-[var(--border)] focus-within:border-primary focus-within:bg-card transition-all">
              <Search size={14} className="text-[var(--subtle-foreground)] shrink-0" />
              <input
                className="bg-transparent border-none outline-none text-[13px] font-bold w-full text-foreground placeholder:text-[var(--subtle-foreground)] placeholder:font-medium"
                placeholder="프로젝트명, 담당자, 소스 키워드 검색.."
              />
            </div>
            {["전체", "진행중", "분석중", "완료", "대기"].map((chip) => (
              <button
                key={chip}
                type="button"
                className={cn(
                  "px-3 py-2 rounded-lg text-[12px] font-black border transition-all",
                  chip === "전체"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-[var(--secondary-foreground)] border-[var(--border)] hover:border-primary/40 hover:text-primary"
                )}
              >
                {chip}
              </button>
            ))}
            <Button variant="outline" size="sm" className="gap-1.5 ml-auto">
              <Plus size={13} /> 프로젝트 등록
            </Button>
          </div>
        </SettingGroup>

        {/* 프로젝트 목록 */}
        <SettingGroup title="프로젝트별 데이터 매핑 현황">
          <div className="space-y-4">
            {[
              {
                name: "Galaxy S26 컨셉 테스트",
                status: "진행중",
                owner: "이동훈",
                team: 5,
                sources: ["CRM API", "오프라인 설문 DB"],
                progress: 67,
                personas: 240,
                aiStatus: "생성 완료",
                updated: "방금 전",
                deadline: "2026-04-30",
              },
              {
                name: "MZ세대 스마트폰 Usage 조사",
                status: "분석중",
                owner: "김민준",
                team: 3,
                sources: ["소셜 리뷰 Webhook", "앱 행동 로그"],
                progress: 100,
                personas: 512,
                aiStatus: "리포트 생성 중",
                updated: "2시간 전",
                deadline: "2026-04-15",
              },
              {
                name: "글로벌 브랜드 인지도 Q1",
                status: "대기",
                owner: "이서연",
                team: 4,
                sources: ["글로벌 POS 데이터"],
                progress: 0,
                personas: 0,
                aiStatus: "시작 전",
                updated: "어제",
                deadline: "2026-05-20",
              },
              {
                name: "프리미엄 사용자 재구매 의향 분석",
                status: "진행중",
                owner: "박지호",
                team: 2,
                sources: ["삼성 멤버십 프로파일", "CRM API"],
                progress: 42,
                personas: 180,
                aiStatus: "생성 완료",
                updated: "3시간 전",
                deadline: "2026-04-28",
              },
              {
                name: "Z세대 갤럭시 버즈 인식 조사",
                status: "완료",
                owner: "최예은",
                team: 3,
                sources: ["소셜 미디어 리뷰", "고객 설문 응답 DB"],
                progress: 100,
                personas: 320,
                aiStatus: "리포트 배포 완료",
                updated: "3일 전",
                deadline: "2026-03-31",
              },
            ].map((p) => (
              <div
                key={p.name}
                className="p-5 rounded-xl bg-[var(--panel-soft)] border border-[var(--border)] hover:border-primary/40 transition-all shadow-sm group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-card border border-[var(--border)] shadow-sm group-hover:border-primary/30 transition-colors">
                      <Briefcase size={15} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-[14px] font-black text-foreground leading-tight">{p.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[11px] font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                          <UserCheck size={10} /> {p.owner}
                        </span>
                        <span className="text-[11px] font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                          <Users size={10} /> {p.team}명
                        </span>
                        <span className="text-[11px] font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                          <CalendarIcon size={10} /> {p.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border",
                        p.status === "진행중" &&
                          "bg-[var(--primary-light-bg)] text-primary border-[var(--primary-light-border)]",
                        p.status === "분석중" &&
                          "bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]/30",
                        p.status === "완료" &&
                          "bg-[var(--panel-soft)] text-[var(--muted-foreground)] border-[var(--border)]",
                        p.status === "대기" &&
                          "bg-[var(--warning-light)] text-[var(--warning)] border-[var(--warning)]/30"
                      )}
                    >
                      {p.status}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-[var(--subtle-foreground)] group-hover:text-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-lg bg-card border border-[var(--border)] px-3 py-2 text-center shadow-sm">
                    <p className="text-[18px] font-black text-foreground">{p.personas.toLocaleString()}</p>
                    <p className="text-[9px] font-black uppercase tracking-wider text-[var(--muted-foreground)]">
                      페르소나
                    </p>
                  </div>
                  <div className="rounded-lg bg-card border border-[var(--border)] px-3 py-2 text-center shadow-sm">
                    <p className="text-[14px] font-black text-foreground truncate">{p.aiStatus}</p>
                    <p className="text-[9px] font-black uppercase tracking-wider text-[var(--muted-foreground)]">
                      AI 상태
                    </p>
                  </div>
                  <div className="rounded-lg bg-card border border-[var(--border)] px-3 py-2 text-center shadow-sm">
                    <p className="text-[14px] font-black text-foreground">{p.updated}</p>
                    <p className="text-[9px] font-black uppercase tracking-wider text-[var(--muted-foreground)]">
                      최근 갱신
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <Network size={11} className="text-[var(--subtle-foreground)] shrink-0" />
                  {p.sources.map((src) => (
                    <span
                      key={src}
                      className="px-2 py-0.5 bg-card border border-[var(--border)] rounded-md text-[10px] font-semibold text-[var(--secondary-foreground)] shadow-sm"
                    >
                      {src}
                    </span>
                  ))}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-wider">
                    <span>응답 수집 진행률</span>
                    <span>{p.progress}%</span>
                  </div>
                  <div className="h-2 bg-card rounded-full overflow-hidden border border-[var(--border)]/50">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        p.progress === 100 ? "bg-[var(--success)]" : "bg-primary"
                      )}
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SettingGroup>
      </div>
    </>
  ),
  datasrc: <DataSourceSection />,
  users: (
    <>
      <SectionTitle title="멤버 & 접근 제어" desc="역할별 접근 권한과 민감 데이터 열람 통제 정책을 관리합니다" />
      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="전체 사용자" value="20" sub="+1 이번 달" tone="neutral" icon={Users} />
          <StatCard label="활성 세션" value="6" sub="현재 접속 중" tone="primary" icon={Activity} />
          <StatCard label="2FA 미설정" value="3" sub="조치 필요" tone="warn" icon={AlertTriangle} />
          <StatCard label="휴면 계정 (90d+)" value="2" sub="비활성화 권고" tone="danger" icon={Clock} />
        </div>

        <SettingGroup title="사용자 목록">
          <div className="flex items-center gap-2 mb-4 bg-[var(--panel-soft)] px-4 py-3 rounded-xl border border-[var(--border)] focus-within:border-primary focus-within:bg-card transition-all">
            <Search size={15} className="text-[var(--subtle-foreground)]" />
            <input
              className="bg-transparent border-none outline-none text-[13px] font-bold w-full text-foreground placeholder:text-[var(--subtle-foreground)] placeholder:font-medium"
              placeholder="이름, 이메일, 역할 검색.."
            />
          </div>
          <div className="overflow-hidden rounded-xl border border-[var(--border)] shadow-sm">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-[var(--panel-soft)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-5 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-widest">
                    사용자
                  </th>
                  <th className="px-5 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-widest">
                    역할
                  </th>
                  <th className="px-5 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-widest">
                    상태
                  </th>
                  <th className="px-5 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-widest">
                    부서
                  </th>
                  <th className="px-5 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-widest">
                    최근 접속
                  </th>
                  <th className="px-5 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-widest text-center">
                    2FA
                  </th>
                  <th className="px-5 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-widest text-right">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-card">
                {[
                  {
                    name: "이동훈",
                    email: "dh.lee@samsung.com",
                    role: "운영자",
                    status: "active" as const,
                    dept: "소비자인사이트팀",
                    lastAccess: "방금 전",
                    mfa: true,
                  },
                  {
                    name: "김민준",
                    email: "mj.kim@samsung.com",
                    role: "편집자",
                    status: "active" as const,
                    dept: "MX 마케팅실",
                    lastAccess: "32분 전",
                    mfa: true,
                  },
                  {
                    name: "이서연",
                    email: "sy.lee@samsung.com",
                    role: "편집자",
                    status: "active" as const,
                    dept: "브랜드전략팀",
                    lastAccess: "1시간 전",
                    mfa: true,
                  },
                  {
                    name: "박지호",
                    email: "jh.park@samsung.com",
                    role: "편집자",
                    status: "active" as const,
                    dept: "삼성 리서치",
                    lastAccess: "2시간 전",
                    mfa: true,
                  },
                  {
                    name: "최예은",
                    email: "ye.choi@samsung.com",
                    role: "편집자",
                    status: "active" as const,
                    dept: "소비자인사이트팀",
                    lastAccess: "3시간 전",
                    mfa: true,
                  },
                  {
                    name: "정태양",
                    email: "ty.jung@samsung.com",
                    role: "편집자",
                    status: "active" as const,
                    dept: "DX마케팅기획팀",
                    lastAccess: "5시간 전",
                    mfa: false,
                  },
                  {
                    name: "한수빈",
                    email: "sb.han@samsung.com",
                    role: "편집자",
                    status: "active" as const,
                    dept: "MX 마케팅실",
                    lastAccess: "어제",
                    mfa: true,
                  },
                  {
                    name: "오민재",
                    email: "mj.oh@samsung.com",
                    role: "편집자",
                    status: "active" as const,
                    dept: "제품전략팀",
                    lastAccess: "어제",
                    mfa: true,
                  },
                  {
                    name: "장예진",
                    email: "yj.jang@samsung.com",
                    role: "편집자",
                    status: "invited" as const,
                    dept: "삼성 리서치",
                    lastAccess: "—",
                    mfa: false,
                  },
                  {
                    name: "윤성호",
                    email: "sh.yoon@samsung.com",
                    role: "편집자",
                    status: "invited" as const,
                    dept: "브랜드전략팀",
                    lastAccess: "—",
                    mfa: false,
                  },
                  {
                    name: "강지수",
                    email: "js.kang@samsung.com",
                    role: "뷰어",
                    status: "active" as const,
                    dept: "글로벌마케팅오피스",
                    lastAccess: "2시간 전",
                    mfa: true,
                  },
                  {
                    name: "임현우",
                    email: "hw.lim@samsung.com",
                    role: "뷰어",
                    status: "active" as const,
                    dept: "CX전략팀",
                    lastAccess: "어제",
                    mfa: true,
                  },
                  {
                    name: "신다연",
                    email: "dy.shin@samsung.com",
                    role: "뷰어",
                    status: "active" as const,
                    dept: "MX 마케팅실",
                    lastAccess: "어제",
                    mfa: false,
                  },
                  {
                    name: "조현석",
                    email: "hs.cho@samsung.com",
                    role: "뷰어",
                    status: "active" as const,
                    dept: "DX마케팅기획팀",
                    lastAccess: "2일 전",
                    mfa: true,
                  },
                  {
                    name: "배소윤",
                    email: "sy.bae@samsung.com",
                    role: "뷰어",
                    status: "active" as const,
                    dept: "제품전략팀",
                    lastAccess: "2일 전",
                    mfa: true,
                  },
                  {
                    name: "홍준서",
                    email: "js.hong@samsung.com",
                    role: "뷰어",
                    status: "active" as const,
                    dept: "글로벌마케팅오피스",
                    lastAccess: "3일 전",
                    mfa: true,
                  },
                  {
                    name: "문지현",
                    email: "jh.moon@samsung.com",
                    role: "뷰어",
                    status: "active" as const,
                    dept: "소비자인사이트팀",
                    lastAccess: "4일 전",
                    mfa: false,
                  },
                  {
                    name: "권태은",
                    email: "te.kwon@samsung.com",
                    role: "뷰어",
                    status: "active" as const,
                    dept: "CX전략팀",
                    lastAccess: "1주일 전",
                    mfa: true,
                  },
                  {
                    name: "류상민",
                    email: "sm.ryu@samsung.com",
                    role: "뷰어",
                    status: "suspended" as const,
                    dept: "브랜드전략팀",
                    lastAccess: "45일 전",
                    mfa: true,
                  },
                  {
                    name: "나은채",
                    email: "ec.na@samsung.com",
                    role: "뷰어",
                    status: "suspended" as const,
                    dept: "DX마케팅기획팀",
                    lastAccess: "62일 전",
                    mfa: true,
                  },
                ].map((u) => {
                  const statusStyle = {
                    active: {
                      label: "Active",
                      cls: "border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] text-primary",
                    },
                    invited: {
                      label: "Invited",
                      cls: "border-[var(--warning)]/30 bg-[var(--warning-light)] text-[var(--warning)]",
                    },
                    suspended: {
                      label: "Suspended",
                      cls: "border-[var(--destructive)]/20 bg-[var(--destructive)]/5 text-[var(--destructive)]",
                    },
                  }[u.status];
                  return (
                    <tr key={u.email} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-black text-foreground text-[13px]">{u.name}</p>
                        <p className="font-medium text-[var(--muted-foreground)] text-[11px]">{u.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-black text-[10px]",
                            u.role === "운영자"
                              ? "text-primary border-primary/30 bg-[var(--primary-light-bg)]"
                              : u.role === "편집자"
                                ? "text-[var(--secondary-foreground)] border-[var(--border-strong)] bg-[var(--panel-soft)]"
                                : "text-[var(--muted-foreground)] border-[var(--border)] bg-[var(--accent)]"
                          )}
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant="outline" className={cn("font-bold text-[10px]", statusStyle.cls)}>
                          {statusStyle.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-[var(--secondary-foreground)] text-[12px]">
                        {u.dept}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-[var(--muted-foreground)] text-[12px] align-middle">
                        <div className="flex items-center gap-1.5">
                          <Clock size={11} /> {u.lastAccess}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {u.mfa ? (
                          <div className="inline-flex items-center gap-1 text-[10px] font-black text-[var(--success)] bg-[var(--success-light)] px-2 py-0.5 rounded-full border border-[var(--success)]/30">
                            <CheckCircle2 size={10} /> ON
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-[10px] font-black text-[var(--warning)] bg-[var(--warning-light)] px-2 py-0.5 rounded-full border border-[var(--warning)]/30">
                            <AlertTriangle size={10} /> OFF
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button variant="outline" size="sm" className="text-[11px] h-7 px-3">
                          권한 수정
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-[12px] font-bold text-[var(--muted-foreground)]">전체 20명</span>
            <Button size="sm" className="gap-2">
              <Users size={14} /> 사용자 초대
            </Button>
          </div>
        </SettingGroup>

        <SettingGroup title="역할별 권한 매트릭스">
          <div className="overflow-hidden rounded-xl border border-[var(--border)] overflow-x-auto shadow-sm">
            <table className="w-full text-left text-[12px] min-w-[600px]">
              <thead className="bg-[var(--panel-soft)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-5 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-widest">
                    권한 항목
                  </th>
                  <th className="px-5 py-3.5 font-black text-center text-primary">운영자</th>
                  <th className="px-5 py-3.5 font-black text-center text-foreground">편집자</th>
                  <th className="px-5 py-3.5 font-black text-center text-[var(--muted-foreground)]">뷰어</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-card">
                {(
                  [
                    {
                      key: "user_mgmt",
                      label: "사용자 관리 및 시스템 설정",
                      admin: true,
                      editor: false,
                      viewer: false,
                    },
                    { key: "project", label: "프로젝트 생성 및 삭제", admin: true, editor: true, viewer: false },
                    { key: "survey", label: "설문 생성 및 실행", admin: true, editor: true, viewer: false },
                    { key: "simulation", label: "시뮬레이션 실행", admin: true, editor: true, viewer: false },
                    { key: "report", label: "리포트 생성 및 다운로드", admin: true, editor: true, viewer: true },
                    { key: "persona", label: "페르소나 열람 및 편집", admin: true, editor: true, viewer: true },
                    {
                      key: "result_view",
                      label: "분석 결과 및 인사이트 조회",
                      admin: true,
                      editor: true,
                      viewer: true,
                    },
                    { key: "prompt", label: "시스템 프롬프트 설정 변경", admin: true, editor: false, viewer: false },
                  ] as { key: string; label: string; admin: boolean; editor: boolean; viewer: boolean }[]
                ).map((row) => {
                  const Dot = ({ on, tone }: { on: boolean; tone: "primary" | "neutral" | "muted" }) =>
                    on ? (
                      <div
                        className={cn(
                          "w-2.5 h-2.5 rounded-full mx-auto",
                          tone === "primary" && "bg-primary shadow-[0_0_8px_rgba(49,107,255,0.4)]",
                          tone === "neutral" && "bg-foreground",
                          tone === "muted" && "bg-[var(--border-strong)]"
                        )}
                      />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full mx-auto border border-[var(--border)] bg-transparent" />
                    );
                  return (
                    <tr key={row.key} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="px-5 py-3.5 font-bold text-foreground">{row.label}</td>
                      <td className="px-5 py-3.5 text-center">
                        <Dot on={row.admin} tone="primary" />
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <Dot on={row.editor} tone="neutral" />
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <Dot on={row.viewer} tone="muted" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SettingGroup>
      </div>
    </>
  ),
  logs: <LogsSection />,
  validation: <ValidationSection />,
  security: (
    <>
      <SectionTitle
        title="보안 및 규정 준수"
        desc="데이터 보호를 위한 SSO 연동, IP 제어, 로그인 정책 등을 설정합니다"
      />

      <div className="grid grid-cols-1 gap-6">
        <SettingGroup title="인증 보안 강화">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-xl border bg-[var(--primary-light-bg)] border-primary/30 shadow-sm cursor-pointer hover:border-primary/50 transition-colors">
                <div>
                  <p className="text-[13px] font-black text-primary">SSO 연동 활성화 (Okta/AD)</p>
                  <p className="text-[11px] font-medium text-[var(--subtle-foreground)] mt-0.5">
                    사내 통합 인증 체계 필수 사용
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
              </label>
              <label className="flex items-center justify-between p-4 rounded-xl border bg-[var(--panel-soft)] border-[var(--border)] shadow-sm cursor-pointer hover:bg-card transition-colors">
                <div>
                  <p className="text-[13px] font-black text-foreground">전체 사용자 2FA 의무화</p>
                  <p className="text-[11px] font-medium text-[var(--subtle-foreground)] mt-0.5">OTP/모바일 인증 필수</p>
                </div>
                <input type="checkbox" className="w-4 h-4" />
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-[var(--muted-foreground)] ml-1 tracking-wider">
                  암호 변경 주기
                </label>
                <select className="w-full bg-card border border-[var(--border)] rounded-xl px-4 h-[44px] text-[13px] font-bold text-foreground outline-none focus:border-primary shadow-sm">
                  <option>매 3개월</option>
                  <option>매 6개월</option>
                  <option>상시(만료 없음)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-[var(--muted-foreground)] ml-1 tracking-wider">
                  최대 동시 세션
                </label>
                <select className="w-full bg-card border border-[var(--border)] rounded-xl px-4 h-[44px] text-[13px] font-bold text-foreground outline-none focus:border-primary shadow-sm">
                  <option>1개 (중복 로그인 방지)</option>
                  <option>3개</option>
                  <option>제한 없음</option>
                </select>
              </div>
            </div>
          </div>
        </SettingGroup>

        <SettingGroup title="네트워크 및 IP 제어">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-bold text-[var(--muted-foreground)]">허용 IP 화이트리스트</p>
              <Button variant="outline" size="sm" className="text-[11px] uppercase tracking-tight gap-1.5">
                <Globe size={13} /> IP 추가
              </Button>
            </div>
            <div className="space-y-2">
              {["211.231.54.120 (사내망 — Seoul HQ)", "14.52.12.5 (IDC — Suwon)", "10.0.0.0/8 (VPN 내부망)"].map(
                (ip) => (
                  <div
                    key={ip}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--panel-soft)] border border-dashed border-[var(--border)]"
                  >
                    <span className="text-[13px] font-mono font-bold text-[var(--secondary-foreground)]">{ip}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Save size={13} className="rotate-45" />
                    </Button>
                  </div>
                )
              )}
            </div>
          </div>
        </SettingGroup>

        <div className="flex justify-end pt-2">
          <Button size="lg" className="gap-2">
            <Shield size={16} /> 보안 강화 정책 일괄 적용
          </Button>
        </div>
      </div>
    </>
  ),
  prompt: null,
};

/* ─── 메인 ─── */
export const SettingsPage: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const active = tab ?? "projects";
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar Nav */}
      <nav className="flex w-[240px] shrink-0 flex-col border-r border-[var(--border)] bg-card shadow-[var(--shadow-sm)]">
        {/* 상단: 뒤로가기 */}
        <div className="shrink-0 border-b border-[var(--border)] px-4 py-4 min-h-[112px] flex flex-col justify-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-[var(--surface-hover)]"
          >
            <ArrowLeft
              size={15}
              className="text-[var(--subtle-foreground)] transition-transform group-hover:-translate-x-0.5 group-hover:text-primary"
            />
            <span className="text-[13px] font-semibold text-[var(--secondary-foreground)] group-hover:text-primary">
              홈으로 돌아가기
            </span>
          </button>
          <div className="mt-3 px-3">
            <p className="text-[11px] font-black uppercase tracking-widest text-[var(--subtle-foreground)]">Settings</p>
          </div>
        </div>

        {/* 가운데: 섹션 네비게이션 */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-5">
          {NAV.map((section) => (
            <div key={section.label} className="mb-7">
              <p className="px-3 pb-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--subtle-foreground)]">
                {section.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => navigate(`/settings/${item.key}`)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                      active === item.key
                        ? "bg-[var(--primary-light-bg)] text-primary border border-[var(--primary-light-border)] font-bold"
                        : "text-[var(--secondary-foreground)] font-semibold hover:bg-[var(--surface-hover)] hover:text-foreground"
                    )}
                  >
                    <item.icon
                      size={15}
                      className={
                        active === item.key
                          ? "text-primary"
                          : "text-[var(--subtle-foreground)] group-hover:text-primary transition-colors"
                      }
                    />
                    <span className="text-[13px]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 하단: 유저카드 */}
        <div className="relative shrink-0 border-t border-[var(--border)] p-3">
          {userMenuOpen && (
            <div className="absolute bottom-[76px] left-3 right-3 z-50 overflow-hidden rounded-2xl border border-[var(--border)] bg-card p-1.5 shadow-[var(--shadow-lg)]">
              <div className="my-1 h-px bg-[var(--border)] opacity-50" />
              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-[var(--destructive)] transition-colors hover:bg-red-50"
              >
                <LogOut size={16} /> 로그아웃
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setUserMenuOpen((v) => !v)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl p-2 transition-all hover:bg-[var(--surface-hover)]",
              userMenuOpen && "bg-[var(--surface-hover)]"
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary-light-bg)] text-primary shadow-inner">
              <UserCircle size={20} />
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-[13px] font-bold text-foreground">관리자</p>
              <p className="truncate text-[11px] font-medium text-[var(--subtle-foreground)]">admin@samsung.com</p>
            </div>
          </button>
        </div>
      </nav>

      {/* Content Area */}
      <div className="hide-scrollbar flex-1 flex flex-col overflow-hidden">
        {/* Page Header */}
        <div className="app-page-header shrink-0 flex items-end justify-between gap-8">
          <div>
            <p className="app-page-eyebrow">Enterprise Admin Console</p>
            <h1 className="app-page-title mt-1">
              전사 데이터 및 <span className="text-primary">AI 운영 통제소</span>
            </h1>
            <p className="app-page-description">
              리서치 프로젝트 마스터 관리, 데이터 스키마 커넥터, AI 프롬프트 감사 로그 및 사용자 데이터 접근 권한을 통합
              제어합니다
            </p>
          </div>
        </div>

        {/* Section Content */}
        <div className="hide-scrollbar flex-1 overflow-y-auto px-10 pt-8 pb-20">
          {active === "prompt" ? (
            <PromptSettingsSection />
          ) : (
            CONTENT[active] || (
              <div className="py-32 text-center text-[var(--muted-foreground)] italic font-black uppercase text-xl">
                Section Coming Soon
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
