import type React from "react";
import { useState } from "react";
import {
  Shield, Database, FileText, LayoutGrid, Users,
  Sparkles, Save, RotateCcw, Terminal, Target, Globe, BarChart2,
  Star, Eye, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── 네비게이션 구조 ─── */
interface NavSection {
  label: string;
  items: { key: string; label: string; icon: React.ElementType }[];
}

const NAV: NavSection[] = [
  {
    label: "시스템 관리",
    items: [
      { key: "users",    label: "사용자 및 역할 관리", icon: Users },
      { key: "security", label: "보안 정책 설정", icon: Shield },
      { key: "datasrc",  label: "데이터 소스 커넥터", icon: Database },
    ],
  },
  {
    label: "AI 엔진 최적화",
    items: [
      { key: "prompt",   label: "프롬프트 파인튜닝", icon: Terminal },
    ],
  },
  {
    label: "서비스 운영",
    items: [
      { key: "report",   label: "리포트 배포 정책", icon: FileText },
      { key: "menu",     label: "화면 위젯 구성", icon: LayoutGrid },
    ],
  },
];

/* ─── 공통 컴포넌트 ─── */
function SectionTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-6 animate-in fade-in slide-in-from-left-4 duration-300">
      <h2 className="text-2xl font-black text-foreground tracking-tight">{title}</h2>
      {desc && <p className="app-page-description mt-1.5">{desc}</p>}
    </div>
  );
}

function SettingGroup({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="app-card mb-6 p-6">
      {title && <p className="mb-5 border-b border-border/40 pb-3 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">{title}</p>}
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  );
}

/* ─── 프롬프트 파인튜닝 전용 컴포넌트 ─── */
function PromptEditor({ template }: { template: string }) {
  const [prompt, setPrompt] = useState(`You are an expert researcher specializing in ${template}. 
Your goal is to analyze raw persona response data and generate strategic insights.
Focus on:
1. Identifying statistically significant patterns.
2. Highlighting risk factors based on p-value < 0.05.
3. Suggesting actionable marketing strategies for Samsung Galaxy S25.`);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-black text-foreground">시스템 프롬프트 (System Prompt)</span>
        <span className="app-soft px-2 py-0.5 text-[11px] font-black uppercase tracking-tighter text-muted-foreground">v2.4.1 Stable</span>
      </div>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        className="app-textarea h-64 font-mono text-[13px]"
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" size="sm" className="gap-2 rounded-xl text-[12px] font-bold">
          <RotateCcw size={14} /> 초기화
        </Button>
        <Button size="sm" className="gap-2 rounded-xl text-[12px] font-black">
          <Save size={14} /> 변경사항 적용
        </Button>
      </div>
    </div>
  );
}

/* ─── 섹션 콘텐츠 ─── */
const CONTENT: Record<string, React.ReactNode> = {
  prompt: (
    <>
      <SectionTitle title="프롬프트 파인튜닝" desc="리서치 유형별 AI 분석 에이전트의 페르소나와 지시문을 최적화합니다." />
      
      <div className="grid grid-cols-1 gap-6">
        <SettingGroup title="리서치 템플릿 선택">
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "concept", label: "컨셉 테스트", icon: Target },
              { id: "usage",   label: "Usage 조사", icon: BarChart2 },
              { id: "brand",   label: "브랜드 인식 조사", icon: Globe },
              { id: "csat",    label: "고객 만족도 (CSAT/NPS)", icon: Star },
              { id: "ad",      label: "광고 효과 측정", icon: Eye },
              { id: "package", label: "패키지 테스트", icon: Package },
            ].map(t => (
              <Button
                key={t.id}
                variant={t.id === "concept" ? "default" : "outline"}
                className="h-auto justify-start gap-3 rounded-xl px-4 py-3 text-left"
              >
                <span className={`rounded-lg p-2 ${t.id === "concept" ? "bg-white/20" : "bg-accent text-muted-foreground"}`}>
                  <t.icon size={16} />
                </span>
                <span className="text-[13px] font-semibold">{t.label}</span>
              </Button>
            ))}
          </div>
        </SettingGroup>

        <SettingGroup title="분석 지시문 편집">
          <PromptEditor template="Concept Test" />
        </SettingGroup>
        <SettingGroup title="파인튜닝 가이드">
          <div className="app-soft flex flex-col gap-3 p-5">
            <div className="mb-1 flex items-center gap-2 text-primary">
              <Sparkles size={14} />
              <span className="text-[11px] font-black uppercase">Fine-tuning Guide</span>
            </div>
            <p className="text-[12px] font-bold leading-relaxed text-muted-foreground">
              특정 세그먼트 분석 정확도를 높이려면 시스템 프롬프트 하단에 페르소나별 가중치 지시문을 추가하세요.
            </p>
          </div>
        </SettingGroup>
      </div>
    </>
  ),
  users: (
    <>
      <SectionTitle title="사용자 및 역할 관리" desc="시스템에 접속하는 구성원의 권한을 정의합니다." />
      <SettingGroup title="관리자 기본 정책">
        <div className="grid grid-cols-2 gap-4">
          <label className="app-label">초대 기본 권한</label>
          <select className="app-input">
            <option>운영자</option>
            <option>분석가</option>
            <option>뷰어</option>
          </select>
          <label className="app-label">비활성 계정 자동 처리</label>
          <select className="app-input">
            <option>90일 미접속 시 잠금</option>
            <option>180일 미접속 시 잠금</option>
            <option>자동 처리 안함</option>
          </select>
        </div>
      </SettingGroup>
      <SettingGroup title="권한 템플릿">
        <div className="grid grid-cols-3 gap-3">
          {["운영자", "분석가", "뷰어"].map((role) => (
            <div key={role} className="app-soft p-4">
              <p className="text-[13px] font-black text-foreground">{role}</p>
              <p className="mt-1 text-[12px] font-bold text-muted-foreground">
                {role === "운영자" && "설정/사용자/리포트 배포 권한"}
                {role === "분석가" && "분석 워크플로우 및 리포트 생성 권한"}
                {role === "뷰어" && "조회 전용 권한"}
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm">초기화</Button>
          <Button size="sm">정책 저장</Button>
        </div>
      </SettingGroup>
    </>
  ),
  security: (
    <>
      <SectionTitle title="보안 정책 설정" desc="접근 제어, 로그인 정책, 감사 로그 기준을 설정합니다." />
      <SettingGroup title="로그인 보안">
        <div className="grid grid-cols-2 gap-4">
          <label className="app-label">비밀번호 최소 길이</label>
          <input className="app-input" defaultValue="10" />
          <label className="app-label">로그인 실패 잠금 횟수</label>
          <input className="app-input" defaultValue="5" />
          <label className="app-label">세션 만료 시간(분)</label>
          <input className="app-input" defaultValue="60" />
          <label className="app-label">2차 인증(관리자)</label>
          <select className="app-input">
            <option>필수</option>
            <option>선택</option>
            <option>미사용</option>
          </select>
        </div>
      </SettingGroup>
      <SettingGroup title="감사 및 접근 통제">
        <div className="grid grid-cols-1 gap-3">
          <label className="app-soft flex items-center justify-between p-4">
            <span className="text-[13px] font-bold text-foreground">관리자 권한 변경 로그 저장</span>
            <input type="checkbox" defaultChecked />
          </label>
          <label className="app-soft flex items-center justify-between p-4">
            <span className="text-[13px] font-bold text-foreground">IP 허용 목록 사용</span>
            <input type="checkbox" />
          </label>
          <label className="app-soft flex items-center justify-between p-4">
            <span className="text-[13px] font-bold text-foreground">민감 액션 재인증</span>
            <input type="checkbox" defaultChecked />
          </label>
        </div>
        <div className="flex justify-end">
          <Button size="sm">보안 정책 적용</Button>
        </div>
      </SettingGroup>
    </>
  ),
  datasrc: (
    <>
      <SectionTitle title="데이터 소스 커넥터" desc="업로드/외부 수집 소스 연결 상태와 동기화 정책을 설정합니다." />
      <SettingGroup title="커넥터 상태">
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: "POS 업로드", state: "연결됨" },
            { name: "CRM 수집", state: "대기중" },
            { name: "리뷰 수집", state: "연결됨" },
          ].map((item) => (
            <div key={item.name} className="app-soft p-4">
              <p className="text-[13px] font-black text-foreground">{item.name}</p>
              <p className="mt-1 text-[12px] font-bold text-muted-foreground">{item.state}</p>
            </div>
          ))}
        </div>
      </SettingGroup>
      <SettingGroup title="동기화 기본값">
        <div className="grid grid-cols-2 gap-4">
          <label className="app-label">자동 동기화 주기</label>
          <select className="app-input">
            <option>30분</option>
            <option>1시간</option>
            <option>3시간</option>
          </select>
          <label className="app-label">실패 재시도 횟수</label>
          <input className="app-input" defaultValue="3" />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm">연결 테스트</Button>
          <Button size="sm">설정 저장</Button>
        </div>
      </SettingGroup>
    </>
  ),
  report: (
    <>
      <SectionTitle title="리포트 배포 정책" desc="정기 리포트 생성 주기와 수신 채널 정책을 관리합니다." />
      <SettingGroup title="자동 배포 스케줄">
        <div className="grid grid-cols-2 gap-4">
          <label className="app-label">점주 일간 리포트</label>
          <input className="app-input" defaultValue="매일 08:30" />
          <label className="app-label">본사 주간 리포트</label>
          <input className="app-input" defaultValue="매주 월요일 09:00" />
          <label className="app-label">SV 브리핑</label>
          <input className="app-input" defaultValue="평일 08:00" />
        </div>
      </SettingGroup>
      <SettingGroup title="배포 채널">
        <div className="grid grid-cols-1 gap-3">
          <label className="app-soft flex items-center justify-between p-4">
            <span className="text-[13px] font-bold text-foreground">이메일 배포</span>
            <input type="checkbox" defaultChecked />
          </label>
          <label className="app-soft flex items-center justify-between p-4">
            <span className="text-[13px] font-bold text-foreground">알림센터 인박스 저장</span>
            <input type="checkbox" defaultChecked />
          </label>
          <label className="app-soft flex items-center justify-between p-4">
            <span className="text-[13px] font-bold text-foreground">메신저 연동 전송</span>
            <input type="checkbox" />
          </label>
        </div>
        <div className="flex justify-end">
          <Button size="sm">배포 정책 저장</Button>
        </div>
      </SettingGroup>
    </>
  ),
  menu: (
    <>
      <SectionTitle title="화면 위젯 구성" desc="대시보드별 위젯 노출 여부와 기본 배치를 설정합니다." />
      <SettingGroup title="홈 화면 위젯">
        <div className="grid grid-cols-2 gap-3">
          {[
            "오늘의 핵심 액션",
            "최근 프로젝트",
            "템플릿 라이브러리",
            "성과 요약 카드",
          ].map((widget) => (
            <label key={widget} className="app-soft flex items-center justify-between p-4">
              <span className="text-[13px] font-bold text-foreground">{widget}</span>
              <input type="checkbox" defaultChecked />
            </label>
          ))}
        </div>
      </SettingGroup>
      <SettingGroup title="분석 화면 기본 레이아웃">
        <div className="grid grid-cols-2 gap-4">
          <label className="app-label">기본 차트 유형</label>
          <select className="app-input">
            <option>혼합형(도넛+바)</option>
            <option>차트 집중형</option>
            <option>요약 카드형</option>
          </select>
          <label className="app-label">필터 패널 기본 상태</label>
          <select className="app-input">
            <option>펼침</option>
            <option>접힘</option>
          </select>
        </div>
        <div className="flex justify-end">
          <Button size="sm">위젯 구성 저장</Button>
        </div>
      </SettingGroup>
    </>
  ),
};

/* ─── 메인 ─── */
export const SettingsPage: React.FC = () => {
  const [active, setActive] = useState("prompt");

  return (
    <div className="flex h-full w-full items-start justify-center overflow-hidden bg-background p-8">
      <div className="flex h-full w-full max-w-6xl overflow-hidden rounded-[32px] border border-border bg-card shadow-lg animate-in fade-in zoom-in duration-500">
        {/* Sidebar Nav */}
        <nav className="hide-scrollbar w-64 shrink-0 overflow-y-auto border-r border-border bg-card px-4 py-8">
          {NAV.map((section) => (
            <div key={section.label} className="mb-8">
              <p className="px-4 pb-3 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                {section.label}
              </p>
              <div className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActive(item.key)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left transition-all ${
                      active === item.key 
                        ? "bg-primary text-primary-foreground shadow-md font-black" 
                        : "text-muted-foreground font-bold hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <item.icon size={16} className={active === item.key ? "text-white" : "text-subtle-foreground group-hover:text-primary"} />
                    <span className="text-[13px]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Content Area */}
        <div className="hide-scrollbar flex-1 overflow-y-auto bg-card">
          <div className="mx-auto max-w-4xl px-12 pt-10 pb-20">
            {/* Welcome Header */}
            <section className="app-card relative mb-10 overflow-hidden p-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-all duration-1000" />
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Management System</p>
                <h1 className="font-title mt-2 text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
                  시스템 및 <span className="text-primary">운영 설정.</span>
                </h1>
                <p className="mt-3 max-w-2xl text-base font-medium text-muted-foreground">
                  분석 모델 환경, 데이터 보안 및 사용자 권한 설정을 최적화합니다.
                </p>
              </div>
            </section>

            {CONTENT[active] || <div className="p-20 text-center text-[var(--muted-foreground)] italic font-black uppercase">Section Coming Soon</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
