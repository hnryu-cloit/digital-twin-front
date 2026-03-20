import type React from "react";
import { useState } from "react";
import {
  Shield, Database, FileText, LayoutGrid, Users,
  Sparkles, Save, RotateCcw, Terminal, Target, Globe, BarChart2,
  Star, Eye, Package, TrendingUp, MapPin, Clock, FilePieChart, Presentation,
  ChevronRight, Activity, AlertTriangle, CheckCircle2, Zap, Search,
  Briefcase, MessageSquare, History, TableProperties, Network, Key
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* ─── 네비게이션 구조 ─── */
interface NavSection {
  label: string;
  items: { key: string; label: string; icon: React.ElementType }[];
}

const NAV: NavSection[] = [
  {
    label: "엔터프라이즈 통합 관리",
    items: [
      { key: "projects", label: "리서치 프로젝트 마스터 뷰", icon: Briefcase },
      { key: "datasrc", label: "데이터 소스 및 스키마", icon: Database },
      { key: "users", label: "사용자 및 권한 제어", icon: Users },
    ],
  },
  {
    label: "AI 엔진 및 감사 로그",
    items: [
      { key: "prompt", label: "시스템 프롬프트 설정", icon: Terminal },
      { key: "logs", label: "AI 대화 감사 로그", icon: MessageSquare },
      { key: "validation", label: "페르소나 검증 (CoT) 아카이브", icon: History },
    ],
  },
  {
    label: "서비스 운영",
    items: [
      { key: "report", label: "리포트 배포 정책", icon: FileText },
      { key: "menu", label: "화면 위젯 구성", icon: LayoutGrid },
    ],
  },
  {
    label: "검색 및 지역화",
    items: [
      { key: "seo", label: "SEO 최적화 설정", icon: TrendingUp },
      { key: "geo", label: "GEO 지역 타겟팅", icon: MapPin },
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
    <div className="app-card mb-6 p-6 border-[var(--border)]" style={{ boxShadow: "var(--shadow-sm)" }}>
      {title && <p className="mb-5 border-b border-[var(--border)] pb-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">{title}</p>}
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  );
}

function PromptEditor({ template }: { template: string }) {
  const [prompt, setPrompt] = useState(`You are an expert researcher specializing in ${template}. 
Your goal is to analyze raw persona response data and generate strategic insights.
Focus on:
1. Identifying statistically significant patterns.
2. Highlighting risk factors based on p-value < 0.05.
3. Suggesting actionable marketing strategies for Samsung Galaxy S26.`);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-black text-foreground">시스템 프롬프트 (System Prompt)</span>
        <span className="bg-[var(--panel-soft)] px-2 py-0.5 text-[11px] font-black uppercase tracking-tighter text-[var(--muted-foreground)] rounded-md border border-[var(--border)]">v2.4.1 Stable</span>
      </div>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        className="w-full bg-card border border-[var(--border)] rounded-xl px-4 py-3 h-64 font-mono text-[13px] outline-none focus:border-primary transition-colors text-foreground placeholder:text-[var(--subtle-foreground)] leading-relaxed"
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" size="sm" className="gap-2">
          <RotateCcw size={14} /> 초기화
        </Button>
        <Button size="sm" className="gap-2">
          <Save size={14} /> 변경사항 적용
        </Button>
      </div>
    </div>
  );
}

/* ─── 섹션 콘텐츠 ─── */
const CONTENT: Record<string, React.ReactNode> = {
  projects: (
    <>
      <SectionTitle title="리서치 프로젝트 마스터 뷰" desc="전사적으로 진행 중인 전체 설문 리서치 프로젝트 현황과 연결된 데이터 소스를 한눈에 관리합니다." />
      <SettingGroup title="프로젝트별 데이터 매핑 현황">
        <div className="space-y-4">
          {[
            { name: "Galaxy S26 컨셉 테스트", status: "진행중", sources: ["CRM API", "오프라인 설문 DB"], progress: 67 },
            { name: "MZ세대 스마트폰 Usage 조사", status: "분석중", sources: ["소셜 리뷰 Webhook"], progress: 100 },
            { name: "글로벌 브랜드 인지도 Q1", status: "대기", sources: ["글로벌 POS 데이터"], progress: 0 },
          ].map(p => (
            <div key={p.name} className="p-5 rounded-xl bg-[var(--panel-soft)] border border-[var(--border)] hover:border-primary/40 transition-colors shadow-inner group">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-card border border-[var(--border)] shadow-sm group-hover:border-primary/30 transition-colors">
                    <Briefcase size={16} className="text-primary" />
                  </div>
                  <span className="text-[14px] font-black text-foreground">{p.name}</span>
                </div>
                <span className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase border",
                  p.status === "진행중" ? "bg-blue-50/50 text-blue-600 border-blue-200" : p.status === "분석중" ? "bg-green-50/50 text-green-600 border-green-200" : "bg-card text-[var(--muted-foreground)] border-[var(--border)]"
                )}>{p.status}</span>
              </div>
              <div className="flex items-center gap-2 mb-5">
                <Network size={12} className="text-[var(--subtle-foreground)]" />
                <span className="text-[11px] font-bold text-[var(--muted-foreground)]">매핑된 소스: </span>
                <div className="flex gap-1.5">
                  {p.sources.map(src => (
                    <span key={src} className="px-2 py-0.5 bg-card border border-[var(--border)] rounded text-[10px] font-semibold text-[var(--secondary-foreground)] shadow-sm">{src}</span>
                  ))}
                </div>
              </div>
              <div className="h-1.5 bg-card rounded-full overflow-hidden border border-[var(--border)]/50">
                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${p.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </SettingGroup>
    </>
  ),
  datasrc: (
    <>
      <SectionTitle title="데이터 소스 및 스키마 커넥터" desc="시스템 및 외부 데이터 소스의 스키마 항목을 조회하고 프로젝트 매핑 및 데이터 품질을 모니터링합니다." />
      
      <div className="grid grid-cols-1 gap-6">
        <SettingGroup title="연결된 데이터 소스">
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "삼성 POS 트랜잭션", type: "Manual Upload", status: "Healthy", sync: "1시간 전", signal: 100, icon: Database },
              { name: "Global CRM API", type: "Direct Connection", status: "Warning", sync: "연결 오류", signal: 20, icon: Network },
              { name: "소셜 미디어 리뷰", type: "Webhook", status: "Healthy", sync: "실시간", signal: 85, icon: Activity },
              { name: "고객 설문 응답 DB", type: "PostgreSQL", status: "Healthy", sync: "5분 전", signal: 95, icon: TableProperties },
              { name: "앱 행동 로그 (Firebase)", type: "SDK Integration", status: "Healthy", sync: "실시간", signal: 90, icon: Zap },
              { name: "삼성 멤버십 프로파일", type: "REST API", status: "Healthy", sync: "30분 전", signal: 80, icon: Key },
              { name: "외부 패널 파트너 (Embrain)", type: "SFTP Batch", status: "Idle", sync: "어제 23:00", signal: 60, icon: Package },
              { name: "광고 반응 데이터 (Criteo)", type: "API Connector", status: "Warning", sync: "인증 만료", signal: 40, icon: Target },
            ].map(conn => (
              <div key={conn.name} className="app-card p-5 hover:border-primary/30 transition-all group cursor-pointer border-[var(--border)]">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 rounded-xl bg-[var(--panel-soft)] text-primary border border-[var(--border)] shadow-sm">
                    <conn.icon size={16} />
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border",
                    conn.status === "Healthy" ? "bg-green-50/50 text-green-600 border-green-200"
                    : conn.status === "Idle" ? "bg-[var(--panel-soft)] text-[var(--muted-foreground)] border-[var(--border)]"
                    : "bg-red-50/50 text-red-600 border-red-200 animate-pulse"
                  )}>{conn.status}</div>
                </div>
                <p className="text-[14px] font-black text-foreground">{conn.name}</p>
                <p className="text-[10px] font-bold text-[var(--muted-foreground)] mt-0.5 mb-4">{conn.type}</p>
                <div className="pt-3 border-t border-[var(--border)] flex justify-between items-center text-[10px]">
                  <span className="font-bold text-[var(--muted-foreground)] flex items-center gap-1.5"><Clock size={11} /> {conn.sync}</span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={cn("w-1 h-2.5 rounded-full", i < Math.round(conn.signal / 20) ? "bg-primary" : "bg-[var(--border)]")} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SettingGroup>

        <SettingGroup title="데이터 스키마 뷰어 (Persona Asset Schema)">
          <div className="overflow-hidden rounded-xl border border-[var(--border)] shadow-sm">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-[var(--panel-soft)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-4 py-3 font-black text-[var(--muted-foreground)] uppercase tracking-wider">Field Name</th>
                  <th className="px-4 py-3 font-black text-[var(--muted-foreground)] uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 font-black text-[var(--muted-foreground)] uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 font-black text-[var(--muted-foreground)] uppercase tracking-wider text-center">PII (민감)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-card">
                {[
                  { col: "id", type: "String", desc: "페르소나 고유 ID", pii: false },
                  { col: "name", type: "String", desc: "사용자 성명", pii: true },
                  { col: "age", type: "Integer", desc: "연령 (만 나이)", pii: false },
                  { col: "gender", type: "Enum", desc: "성별 (남성/여성)", pii: false },
                  { col: "occupation", type: "String", desc: "세부 직업명", pii: false },
                  { col: "device", type: "String", desc: "현재 사용 기기 (S24 등)", pii: false },
                  { col: "segments", type: "Array<String>", desc: "소속 세그먼트 그룹", pii: false },
                  { col: "contentChannels", type: "Array<String>", desc: "주요 콘텐츠 소비 채널", pii: false },
                ].map(row => (
                  <tr key={row.col} className="hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-primary">{row.col}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--muted-foreground)]">{row.type}</td>
                    <td className="px-4 py-3 font-medium text-[var(--secondary-foreground)]">{row.desc}</td>
                    <td className="px-4 py-3 text-center">
                      {row.pii && <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm"><AlertTriangle size={10} /> PII</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingGroup>
      </div>
    </>
  ),
  users: (
    <>
      <SectionTitle title="사용자 및 권한 제어 (Data Access)" desc="운영자/분석가/뷰어 등 역할별 상세 접근 권한 및 민감 데이터 열람 통제 정책을 관리합니다." />
      <div className="grid grid-cols-1 gap-6">

        <SettingGroup title="계정 현황">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "전체 사용자", value: "31", sub: "+2 이번 달" },
              { label: "활성 세션", value: "8", sub: "현재 접속 중" },
              { label: "2FA 미설정", value: "12", sub: "조치 필요", warn: true },
              { label: "휴면 계정 (90d+)", value: "3", sub: "비활성화 권고", warn: true },
            ].map(s => (
              <div key={s.label} className={cn(
                "p-5 rounded-xl border text-center shadow-sm",
                s.warn ? "bg-red-50/40 border-red-100" : "bg-[var(--panel-soft)] border-[var(--border)]"
              )}>
                <p className={cn("text-3xl font-black leading-none mb-1.5", s.warn ? "text-red-500" : "text-foreground")}>{s.value}</p>
                <p className="text-[11px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">{s.label}</p>
                <p className={cn("text-[10px] font-bold mt-1", s.warn ? "text-red-400" : "text-[var(--subtle-foreground)]")}>{s.sub}</p>
              </div>
            ))}
          </div>
        </SettingGroup>

        <SettingGroup title="사용자 목록">
          <div className="flex items-center gap-2 mb-4 bg-[var(--panel-soft)] px-4 py-3 rounded-xl border border-[var(--border)] focus-within:border-primary focus-within:bg-card transition-all">
            <Search size={15} className="text-[var(--subtle-foreground)]" />
            <input className="bg-transparent border-none outline-none text-[13px] font-bold w-full text-foreground placeholder:text-[var(--subtle-foreground)] placeholder:font-medium" placeholder="이름, 이메일, 역할 검색..." />
          </div>
          <div className="overflow-hidden rounded-xl border border-[var(--border)] shadow-sm">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-[var(--panel-soft)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-5 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-widest">사용자</th>
                  <th className="px-5 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-widest">역할</th>
                  <th className="px-5 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-widest">부서</th>
                  <th className="px-5 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-widest">최근 접속</th>
                  <th className="px-5 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-widest text-center">2FA</th>
                  <th className="px-5 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-widest text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-card">
                {[

                  { name: "이동훈", email: "dh.lee@samsung.com", role: "운영자", dept: "CX 전략팀", lastAccess: "방금 전", mfa: true },
                  { name: "김민준", email: "mj.kim@samsung.com", role: "분석가", dept: "삼성 리서치", lastAccess: "1시간 전", mfa: true },
                  { name: "이서연", email: "sy.lee@samsung.com", role: "분석가", dept: "MX 마케팅실", lastAccess: "3시간 전", mfa: false },
                  { name: "박지호", email: "jh.park@samsung.com", role: "뷰어", dept: "글로벌 전략팀", lastAccess: "어제", mfa: false },
                  { name: "최예은", email: "ye.choi@samsung.com", role: "뷰어", dept: "영남 지역 본부", lastAccess: "2일 전", mfa: true },
                  { name: "정태양", email: "ty.jung@samsung.com", role: "분석가", dept: "삼성 리서치", lastAccess: "5일 전", mfa: false },
                ].map(u => (
                  <tr key={u.email} className="hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-black text-foreground text-[13px]">{u.name}</p>
                      <p className="font-medium text-[var(--muted-foreground)] text-[11px]">{u.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className={cn(
                        "font-black text-[10px]",
                        u.role === "운영자" ? "text-primary border-primary/30 bg-[#eef3ff]" : ""
                      )}>{u.role}</Badge>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[var(--secondary-foreground)] text-[12px]">{u.dept}</td>
                    <td className="px-5 py-3.5 font-bold text-[var(--muted-foreground)] text-[12px] flex items-center gap-1.5"><Clock size={11} /> {u.lastAccess}</td>
                    <td className="px-5 py-3.5 text-center">
                      {u.mfa
                        ? <div className="inline-flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200"><CheckCircle2 size={10} /> ON</div>
                        : <div className="inline-flex items-center gap-1 text-[10px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200"><AlertTriangle size={10} /> OFF</div>}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button variant="outline" size="sm" className="text-[11px] h-7 px-3">권한 수정</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-[12px] font-bold text-[var(--muted-foreground)]">총 6명 표시 중 (전체 31명)</span>
            <Button size="sm" className="gap-2"><Users size={14} /> 사용자 초대</Button>
          </div>
        </SettingGroup>

        <SettingGroup title="역할별 권한 매트릭스">
          <div className="overflow-hidden rounded-xl border border-[var(--border)] overflow-x-auto shadow-sm">
            <table className="w-full text-left text-[12px] min-w-[600px]">
              <thead className="bg-[var(--panel-soft)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-5 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-widest">권한 항목</th>
                  <th className="px-5 py-3.5 font-black text-center text-primary">운영자</th>
                  <th className="px-5 py-3.5 font-black text-center text-foreground">분석가</th>
                  <th className="px-5 py-3.5 font-black text-center text-[var(--muted-foreground)]">뷰어</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-card">
                {[
                  { key: "admin", label: "시스템 설정 및 사용자 관리" },
                  { key: "analyze", label: "분석 워크플로우 실행/수정" },
                  { key: "report", label: "리포트 생성 및 배포" },
                  { key: "pii", label: "민감 데이터(PII) 원본 열람" },
                  { key: "view", label: "익명화 데이터 조회 및 다운로드" },
                ].map((row) => (
                  <tr key={row.key} className="hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="px-5 py-3.5 font-bold text-foreground">{row.label}</td>
                    <td className="px-5 py-3.5 text-center"><div className="w-2.5 h-2.5 rounded-full bg-primary mx-auto shadow-[0_0_8px_rgba(49,107,255,0.4)]" /></td>
                    <td className="px-5 py-3.5 text-center">{(row.key === "analyze" || row.key === "report" || row.key === "view") && <div className="w-2.5 h-2.5 rounded-full bg-foreground mx-auto" />}</td>
                    <td className="px-5 py-3.5 text-center">{row.key === "view" && <div className="w-2.5 h-2.5 rounded-full bg-[var(--border-strong)] mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingGroup>
      </div>
    </>
  ),
  logs: (
    <>
      <SectionTitle title="AI 대화 감사 로그" desc="사용자들이 AI 어시스턴트 및 설문 챗봇과 나눈 질의응답 이력을 조회하고 감사합니다." />

      <SettingGroup title="대화 로그">
        {/* 필터 바 */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 flex items-center gap-2 bg-[var(--panel-soft)] px-4 py-2.5 rounded-xl border border-[var(--border)] focus-within:border-primary focus-within:bg-card transition-all">
            <Search size={14} className="text-[var(--subtle-foreground)] shrink-0" />
            <input className="bg-transparent border-none outline-none text-[13px] font-bold w-full text-foreground placeholder:text-[var(--subtle-foreground)] placeholder:font-medium" placeholder="사용자, 리서치명, 프롬프트 키워드 검색..." />
          </div>
          <select className="bg-card border border-[var(--border)] rounded-xl px-3 h-[42px] text-[12px] font-bold text-foreground outline-none focus:border-primary shadow-sm shrink-0">
            <option>전체 사용자</option>
            <option>dh.lee@samsung.com</option>
            <option>mj.kim@samsung.com</option>
            <option>sy.lee@samsung.com</option>
          </select>
          <select className="bg-card border border-[var(--border)] rounded-xl px-3 h-[42px] text-[12px] font-bold text-foreground outline-none focus:border-primary shadow-sm shrink-0">
            <option>전체 기간</option>
            <option>오늘</option>
            <option>최근 7일</option>
            <option>최근 30일</option>
          </select>
        </div>

        {/* 테이블 */}
        <div className="overflow-hidden rounded-xl border border-[var(--border)] shadow-sm overflow-x-auto">
          <table className="w-full text-left text-[12px] min-w-[900px]">
            <thead className="bg-[var(--panel-soft)] border-b border-[var(--border)]">
              <tr>
                <th className="px-4 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-wider">사용자</th>
                <th className="px-4 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-wider">리서치명</th>
                <th className="px-4 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-wider">프롬프트</th>
                <th className="px-4 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-wider">AI 답변 요약</th>
                <th className="px-4 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-wider text-center">토큰</th>
                <th className="px-4 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-wider">생성일시</th>
                <th className="px-4 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-wider text-center">상세</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-card">
              {[
                {
                  user: "이동훈", email: "dh.lee@samsung.com",
                  research: "Galaxy S26 컨셉 테스트",
                  prompt: "기존 3번 문항을 MZ 세대 톤앤매너로 수정해줘.",
                  answer: "\"S26, 너의 다음 레벨\" 형태로 감성 중심 문항 3개 제안. 구어체 + 이모지 옵션 포함.",
                  tokens: 142, date: "2026-03-15 09:12", page: "/survey",
                },
                {
                  user: "김민준", email: "mj.kim@samsung.com",
                  research: "MZ세대 스마트폰 Usage 조사",
                  prompt: "현재 필터링된 그룹에서 20대 여성의 가장 큰 불만 요인은 뭐야?",
                  answer: "배터리 수명(38%), 카메라 야간 성능(27%), 무게(18%) 순으로 불만 집중. 세부 코멘트 첨부.",
                  tokens: 890, date: "2026-03-15 08:31", page: "/analytics",
                },
                {
                  user: "이서연", email: "sy.lee@samsung.com",
                  research: "글로벌 브랜드 인지도 Q1",
                  prompt: "이 리포트의 결론을 3줄로 요약해서 임원 보고용으로 만들어줘.",
                  answer: "① 국내 MZ 브랜드 선호도 +4.2%p ② 북미 시장 갤럭시 인지도 72% ③ 카메라·AI 기능이 핵심 구매 트리거.",
                  tokens: 1250, date: "2026-03-14 17:45", page: "/report",
                },
                {
                  user: "박지호", email: "jh.park@samsung.com",
                  research: "Galaxy S26 컨셉 테스트",
                  prompt: "프리미엄 구매자 세그먼트의 가격 저항선은 얼마야?",
                  answer: "150만원 이하 응답 61%, 180만원 이하 84%. 고사양 카메라 번들 시 10~15만원 추가 지불 의향 확인.",
                  tokens: 540, date: "2026-03-14 14:20", page: "/analytics",
                },
                {
                  user: "정태양", email: "ty.jung@samsung.com",
                  research: "MZ세대 스마트폰 Usage 조사",
                  prompt: "게이밍 성향군 응답자들이 가장 많이 언급한 기능 키워드 뽑아줘.",
                  answer: "게임 성능(52%), 발열 관리(44%), 화면 주사율(39%), 배터리(35%), 냉각 시스템(28%) 순으로 추출.",
                  tokens: 317, date: "2026-03-13 11:05", page: "/analytics",
                },
              ].map((log, i) => (
                <tr key={i} className="hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="px-4 py-4">
                    <p className="font-black text-foreground text-[13px]">{log.user}</p>
                    <p className="font-medium text-[var(--muted-foreground)] text-[10px]">{log.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-[var(--secondary-foreground)] text-[12px] leading-snug">{log.research}</span>
                  </td>
                  <td className="px-4 py-4 max-w-[200px]">
                    <p className="font-medium text-[var(--secondary-foreground)] text-[12px] leading-snug line-clamp-2 italic">"{log.prompt}"</p>
                  </td>
                  <td className="px-4 py-4 max-w-[220px]">
                    <p className="font-medium text-[var(--muted-foreground)] text-[12px] leading-snug line-clamp-2">{log.answer}</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-mono font-black text-[12px] text-primary">{log.tokens.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-[var(--muted-foreground)] text-[12px] whitespace-nowrap">{log.date}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] gap-1"><Eye size={12} /> 보기</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center pt-3">
          <span className="text-[12px] font-bold text-[var(--muted-foreground)]">총 5건 표시 중 (전체 1,284건)</span>
          <Button variant="outline" size="sm" className="gap-2"><FileText size={13} /> CSV 내보내기</Button>
        </div>
      </SettingGroup>
    </>
  ),
  validation: (
    <>
      <SectionTitle title="페르소나 검증 (CoT) 아카이브" desc="가상 페르소나 응답 산출 시 사용된 추론 과정(Chain of Thought) 및 품질 검증 이력을 아카이브합니다." />
      <SettingGroup title="응답 무결성 검증 로그">
        <div className="space-y-4">
          {[
            { id: "VAL-8829", persona: "P12 (28세/게임개발자)", q: "S26 카메라의 AI 보정 기능이 게임 플레이 경험에 영향을 주나요?", score: 98, result: "Pass", date: "2026-03-13 14:20" },
            { id: "VAL-8830", persona: "P05 (45세/금융컨설턴트)", q: "보안 폴더의 사용 편의성에 대해 어떻게 생각하십니까?", score: 95, result: "Pass", date: "2026-03-13 14:15" },
            { id: "VAL-8831", persona: "P19 (19세/고등학생)", q: "삼성 Knox의 엔터프라이즈 보안 솔루션이 구매에 영향을 주나요?", score: 45, result: "Flagged", date: "2026-03-13 13:50" },
          ].map(log => (
            <div key={log.id} className="app-card p-5 hover:border-[var(--border-hover)] transition-all">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono font-black text-[var(--subtle-foreground)] bg-[var(--panel-soft)] border border-[var(--border)] px-2 py-0.5 rounded-md shadow-sm">{log.id}</span>
                  <span className="text-[13px] font-black text-foreground">{log.persona}</span>
                </div>
                <span className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tight border shadow-sm",
                  log.result === "Pass" ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-600 border-red-200 animate-pulse"
                )}>{log.result === "Flagged" ? "Hallucination Risk" : log.result}</span>
              </div>
              <p className="text-[13px] text-[var(--secondary-foreground)] font-medium leading-relaxed mb-4 p-3 bg-[var(--panel-soft)] rounded-lg border border-[var(--border)]">
                <strong className="text-primary font-black mr-1.5">Q.</strong> {log.q}
              </p>
              <div className="flex justify-between items-center pt-3 border-t border-[var(--border)]">
                <Button variant="outline" size="sm" className="text-[11px] gap-1.5">
                  <Eye size={13} /> CoT 추론 트리 뷰어
                </Button>
                <div className="flex items-center gap-2 text-[11px] font-bold">
                  <span className="text-[var(--subtle-foreground)] uppercase tracking-widest text-[9px]">Confidence:</span>
                  <span className={cn("text-[13px] font-black", log.score > 80 ? "text-primary" : "text-red-500")}>{log.score}</span>
                  <span className="text-[var(--subtle-foreground)]">/ 100</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SettingGroup>
    </>
  ),
  security: (
    <>
      <SectionTitle title="보안 및 규정 준수" desc="데이터 보호를 위한 SSO 연동, IP 제어, 로그인 정책 등을 설정합니다." />
      
      <div className="grid grid-cols-1 gap-6">
        <SettingGroup title="인증 보안 강화">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-xl border bg-[var(--primary-light-bg)] border-primary/30 shadow-sm cursor-pointer hover:border-primary/50 transition-colors">
                <div>
                  <p className="text-[13px] font-black text-primary">SSO 연동 활성화 (Okta/AD)</p>
                  <p className="text-[11px] font-medium text-[var(--subtle-foreground)] mt-0.5">사내 통합 인증 체계 필수 사용</p>
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
                <label className="text-[11px] font-black uppercase text-[var(--muted-foreground)] ml-1 tracking-wider">암호 변경 주기</label>
                <select className="w-full bg-card border border-[var(--border)] rounded-xl px-4 h-[44px] text-[13px] font-bold text-foreground outline-none focus:border-primary shadow-sm">
                  <option>매 3개월</option>
                  <option>매 6개월</option>
                  <option>상시(만료 없음)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-[var(--muted-foreground)] ml-1 tracking-wider">최대 동시 세션</label>
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
              {["211.231.54.120 (사내망 — Seoul HQ)", "14.52.12.5 (IDC — Suwon)", "10.0.0.0/8 (VPN 내부망)"].map(ip => (
                <div key={ip} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--panel-soft)] border border-dashed border-[var(--border)]">
                  <span className="text-[13px] font-mono font-bold text-[var(--secondary-foreground)]">{ip}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"><Save size={13} className="rotate-45" /></Button>
                </div>
              ))}
            </div>
          </div>
        </SettingGroup>

        <div className="flex justify-end pt-2">
          <Button size="lg" className="gap-2"><Shield size={16} /> 보안 강화 정책 일괄 적용</Button>
        </div>
      </div>
    </>
  ),
  prompt: (
    <>
      <SectionTitle title="시스템 프롬프트 설정 및 버전 관리" desc="리서치 템플릿별 AI 시스템 프롬프트를 설정하고, 배포된 버전 이력을 관리합니다." />

      <div className="grid grid-cols-1 gap-6">
        <SettingGroup title="엔진 성능 대시보드">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "평균 응답 속도", value: "1.2s", color: "text-green-500", bg: "bg-green-50" },
              { label: "분석 정확도(QA)", value: "98.4%", color: "text-primary", bg: "bg-[var(--primary-light-bg)]" },
              { label: "토큰 효율성", value: "92%", color: "text-amber-500", bg: "bg-amber-50" },
              { label: "실패율", value: "0.02%", color: "text-[var(--muted-foreground)]", bg: "bg-[var(--panel-soft)]" },
            ].map(s => (
              <div key={s.label} className={cn("p-5 rounded-xl border border-[var(--border)] text-center shadow-sm", s.bg)}>
                <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-2">{s.label}</p>
                <p className={cn("text-2xl font-black tracking-tight", s.color)}>{s.value}</p>
              </div>
            ))}
          </div>
        </SettingGroup>

        <SettingGroup title="분석 지시문(Prompt) 파인튜닝">
          <div className="mb-5 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {[
              { id: "concept", label: "컨셉 테스트", icon: Target },
              { id: "usage", label: "Usage 조사", icon: BarChart2 },
              { id: "brand", label: "브랜드 인식", icon: Globe },
              { id: "csat", label: "만족도(NPS)", icon: Star },
            ].map(t => (
              <Button
                key={t.id}
                variant={t.id === "concept" ? "default" : "outline"}
                size="sm"
                className="shrink-0 gap-2"
              >
                <t.icon size={14} /> {t.label}
              </Button>
            ))}
          </div>
          <PromptEditor template="Concept Test" />
        </SettingGroup>

        <SettingGroup title="프롬프트 버전 히스토리">
          <div className="space-y-3">
            {[
              { version: "v2.4.1", label: "Stable", date: "2026-03-12 10:00", author: "dh.lee@samsung.com", changes: "Galaxy S26 컨셉 테스트 특화 지시문 추가 및 리스크 감지 임계값 조정", active: true },
              { version: "v2.4.0", label: "Deprecated", date: "2026-02-28 14:30", author: "mj.kim@samsung.com", changes: "CoT 추론 강도 상향 (p-value 기준 0.05 → 0.03), 응답 포맷 표준화", active: false },
              { version: "v2.3.2", label: "Archived", date: "2026-01-15 09:15", author: "dh.lee@samsung.com", changes: "다국어 응답 지원 추가 (EN/JP), 글로벌 리서치 프로젝트 대응", active: false },
              { version: "v2.3.0", label: "Archived", date: "2025-12-01 11:00", author: "ty.jung@samsung.com", changes: "초기 프로덕션 배포 버전. 기본 페르소나 분석 지시문 세팅", active: false },
            ].map(v => (
              <div key={v.version} className={cn(
                "p-5 rounded-xl border transition-all",
                v.active ? "bg-[#eef3ff] border-primary/30" : "bg-card border-[var(--border)] hover:border-[var(--border-hover)]"
              )}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[13px] font-black text-foreground">{v.version}</span>
                    <Badge variant="outline" className={cn(
                      "text-[9px] font-black uppercase tracking-wider",
                      v.active ? "text-primary border-primary/40 bg-white" : "text-[var(--muted-foreground)]"
                    )}>{v.label}</Badge>
                    {v.active && <span className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> 현재 적용 중</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-[11px] h-7 px-3 gap-1"><Eye size={12} /> 내용 보기</Button>
                    {!v.active && <Button variant="outline" size="sm" className="text-[11px] h-7 px-3 gap-1"><RotateCcw size={12} /> 롤백</Button>}
                  </div>
                </div>
                <p className="text-[12px] font-medium text-[var(--secondary-foreground)] leading-relaxed mb-3">{v.changes}</p>
                <div className="flex items-center gap-4 text-[10px] font-bold text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1"><Clock size={10} /> {v.date}</span>
                  <span className="flex items-center gap-1"><Users size={10} /> {v.author}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-[12px] font-bold text-[var(--muted-foreground)]">총 4개 버전 (현재: v2.4.1)</span>
            <Button size="sm" className="gap-2"><Sparkles size={14} /> 새 버전 배포</Button>
          </div>
        </SettingGroup>
      </div>
    </>
  ),
  report: (
    <>
      <SectionTitle title="리포트 배포 및 자동화" desc="생성된 리포트의 정기 배포 주기와 수신 채널, 보안 워터마크 정책을 설정합니다." />
      
      <div className="grid grid-cols-1 gap-6">
        <SettingGroup title="자동 배포 타임라인">
          <div className="space-y-4">
            {[
              { label: "점주용 일간 리포트", schedule: "Daily at 08:30", type: "Email" },
              { label: "본사 전략 주간 보고", schedule: "Every Monday 09:00", type: "Slack" },
              { label: "글로벌 마켓 요약", schedule: "1st day of month", type: "Dashboard" },
            ].map(r => (
              <div key={r.label} className="flex items-center gap-5 group">
                <div className="w-28 shrink-0 text-[11px] font-black text-[var(--subtle-foreground)] text-right tracking-tight">{r.schedule}</div>
                <div className="relative flex flex-col items-center">
                  <div className="w-3.5 h-3.5 rounded-full border-[3px] border-primary bg-card z-10 shadow-sm" />
                  <div className="absolute top-3.5 bottom-0 w-px bg-[var(--border)] -mb-4 group-last:hidden" />
                </div>
                <div className="flex-1 bg-[var(--panel-soft)] border border-[var(--border)] rounded-xl p-4 hover:border-primary/30 transition-colors shadow-sm">
                  <div className="flex justify-between items-center">
                    <p className="text-[14px] font-black text-foreground">{r.label}</p>
                    <span className="px-2.5 py-1 rounded-md bg-card border border-[var(--border)] text-[10px] font-black text-[var(--muted-foreground)] shadow-sm">{r.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SettingGroup>

        <SettingGroup title="배포 보안 및 권한 설정">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              {["PDF 워터마크 강제 적용", "수신인 고유 식별 코드 삽입", "배포 후 7일 뒤 자동 파기"].map(opt => (
                <label key={opt} className="flex items-center justify-between p-4 rounded-xl bg-[var(--panel-soft)] border border-[var(--border)] cursor-pointer hover:bg-card transition-colors">
                  <span className="text-[13px] font-bold text-[var(--secondary-foreground)]">{opt}</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-[var(--muted-foreground)] ml-1 tracking-widest">수신 그룹 화이트리스트</label>
              <div className="h-[160px] bg-card border border-dashed border-[var(--border)] rounded-xl p-3 overflow-y-auto space-y-1.5 shadow-inner">
                {["CX 전략팀", "본사 마케팅실", "영남 지역 본부", "글로벌 리서치센터"].map(team => (
                  <div key={team} className="flex items-center justify-between px-3 py-2.5 hover:bg-[var(--surface-hover)] rounded-lg transition-colors border border-transparent hover:border-[var(--border)]">
                    <span className="text-[12px] font-bold text-[var(--secondary-foreground)]">{team}</span>
                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SettingGroup>

        <div className="flex justify-end pt-2">
          <Button size="lg" className="gap-2"><Save size={16} /> 글로벌 배포 정책 저장</Button>
        </div>
      </div>
    </>
  ),
  seo: (
    <>
      <SectionTitle title="SEO 최적화 및 콘텐츠 노출" desc="리서치 콘텐츠의 검색 엔진 가시성과 메타데이터 자동화 정책을 설정합니다." />
      
      <div className="grid grid-cols-1 gap-6">
        <SettingGroup title="SEO 상태 스코어카드">
          <div className="grid grid-cols-3 gap-5">
            <div className="bg-[var(--panel-soft)] border border-[var(--border)] p-6 rounded-xl border-t-4 border-t-green-500 shadow-sm">
              <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-2">콘텐츠 색인율</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-foreground leading-none">94.2%</span>
                <TrendingUp size={16} className="text-green-500 mb-1" />
              </div>
            </div>
            <div className="bg-[var(--panel-soft)] border border-[var(--border)] p-6 rounded-xl border-t-4 border-t-primary shadow-sm">
              <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-2">메타 데이터 완성도</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-foreground leading-none">88.0%</span>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse mb-2.5 ml-1 shadow-[0_0_8px_rgba(49,107,255,0.6)]" />
              </div>
            </div>
            <div className="bg-[var(--panel-soft)] border border-[var(--border)] p-6 rounded-xl border-t-4 border-t-amber-500 shadow-sm">
              <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-2">키워드 매칭률</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-foreground leading-none">72.5%</span>
                <span className="text-[12px] font-black text-amber-500 mb-1">+2.1%</span>
              </div>
            </div>
          </div>
        </SettingGroup>

        <SettingGroup title="메타데이터 자동 생성 규칙">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-[var(--muted-foreground)] ml-1 tracking-widest">리포트 타이틀 템플릿</label>
                <input className="w-full bg-card border border-[var(--border)] rounded-xl px-4 h-[44px] text-[13px] font-bold text-foreground outline-none focus:border-primary shadow-sm" defaultValue="{프로젝트명} | Digital Twin Insight {YYYY}" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-[var(--muted-foreground)] ml-1 tracking-widest">AI 요약 추출 모델</label>
                <select className="w-full bg-card border border-[var(--border)] rounded-xl px-4 h-[44px] text-[13px] font-bold text-foreground outline-none focus:border-primary shadow-sm">
                  <option>SEO 전용 고속 모델</option>
                  <option>전략 요약 정밀 모델</option>
                </select>
              </div>
            </div>
            <label className="flex items-center justify-between p-5 rounded-xl bg-[var(--primary-light-bg)] border border-primary/20 shadow-sm cursor-pointer hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl shadow-sm"><Sparkles size={18} /></div>
                <div>
                  <p className="text-[14px] font-black text-primary">AI 기반 자동 키워드 태깅</p>
                  <p className="text-[11px] font-medium text-[var(--secondary-foreground)] mt-0.5">리포트 본문에서 핵심 SEO 키워드 5~10개 자동 추출</p>
                </div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
            </label>
          </div>
        </SettingGroup>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" size="lg" className="gap-2"><Eye size={16} /> 검색 프리뷰 확인</Button>
          <Button size="lg" className="gap-2"><Save size={16} /> SEO 설정 저장</Button>
        </div>
      </div>
    </>
  ),
  geo: (
    <>
      <SectionTitle title="GEO 지역 타겟팅" desc="리서치 대상 지역 범위 및 지역별 페르소나 가중치를 인터랙티브하게 설정합니다." />
      
      <div className="grid grid-cols-1 gap-6">
        <SettingGroup title="지역별 데이터 비중 가중치">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center p-2">
            <div className="aspect-[4/3] bg-[var(--panel-soft)] rounded-3xl border border-[var(--border)] flex items-center justify-center relative overflow-hidden shadow-inner group">
              <MapPin size={64} className="text-primary/10 group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <div className="absolute top-1/4 left-1/3 w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/40 animate-pulse shadow-[0_0_15px_rgba(49,107,255,0.3)]" />
              <div className="absolute bottom-1/3 right-1/4 w-16 h-16 rounded-full bg-indigo-500/10 border-2 border-indigo-500/30" />
              <p className="absolute bottom-5 text-[11px] font-black text-[var(--muted-foreground)] uppercase tracking-widest bg-card/80 px-3 py-1 rounded-full backdrop-blur-sm border border-[var(--border)]">Interactive Region Map</p>
            </div>
            <div className="space-y-5">
              {[
                { label: "수도권", value: 45, color: "bg-primary" },
                { label: "영남권", value: 25, color: "bg-indigo-400" },
                { label: "호남권", value: 15, color: "bg-indigo-300" },
                { label: "충청/강원/제주", value: 15, color: "bg-indigo-200" },
              ].map(r => (
                <div key={r.label} className="space-y-2">
                  <div className="flex justify-between text-[13px] font-bold">
                    <span className="text-[var(--secondary-foreground)]">{r.label}</span>
                    <span className="text-primary font-black">{r.value}%</span>
                  </div>
                  <div className="h-2.5 bg-card border border-[var(--border)] rounded-full overflow-hidden shadow-inner">
                    <div className={cn("h-full rounded-full transition-all duration-1000", r.color)} style={{ width: `${r.value}%` }} />
                  </div>
                </div>
              ))}
              <div className="pt-5 mt-2 border-t border-[var(--border)]">
                <p className="text-[11px] font-medium text-[var(--muted-foreground)] leading-relaxed bg-[var(--panel-soft)] p-3 rounded-lg border border-[var(--border)]">
                  * 위 가중치는 신규 리서치 설계 시 기본 샘플링 비율로 자동 적용됩니다.
                </p>
              </div>
            </div>
          </div>
        </SettingGroup>

        <SettingGroup title="다국어 및 로컬라이징 정책">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 rounded-xl bg-[var(--panel-soft)] border border-[var(--border)] shadow-sm cursor-pointer hover:bg-card transition-colors">
                <span className="text-[13px] font-bold text-[var(--secondary-foreground)]">자동 현지화 번역 활성화</span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </label>
              <label className="flex items-center justify-between p-4 rounded-xl bg-[var(--panel-soft)] border border-[var(--border)] shadow-sm cursor-pointer hover:bg-card transition-colors">
                <span className="text-[13px] font-bold text-[var(--secondary-foreground)]">현지 문화권 금기어 필터링</span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-[var(--muted-foreground)] ml-1 tracking-widest">기준 통화 및 도량형</label>
              <select className="w-full bg-card border border-[var(--border)] rounded-xl px-4 h-[44px] text-[13px] font-bold text-foreground outline-none focus:border-primary shadow-sm">
                <option>KRW (₩) / Metric (m, kg)</option>
                <option>USD ($) / Imperial (ft, lb)</option>
                <option>EUR (€) / Metric</option>
              </select>
            </div>
          </div>
        </SettingGroup>

        <div className="flex justify-end pt-2">
          <Button size="lg" className="gap-2"><MapPin size={16} /> GEO 타겟팅 정책 확정</Button>
        </div>
      </div>
    </>
  ),
  menu: (
    <>
      <SectionTitle title="화면 위젯 및 대시보드 커스터마이징" desc="사용자별 업무 특성에 맞춰 대시보드 레이아웃과 위젯 배치를 최적화합니다." />
      
      <div className="grid grid-cols-1 gap-6">
        <SettingGroup title="대시보드 위젯 배치 미리보기">
          <div className="p-8 bg-[var(--panel-soft)] border-2 border-dashed border-[var(--border)] rounded-2xl">
            <div className="grid grid-cols-3 grid-rows-2 gap-4 aspect-video">
              <div className="col-span-2 row-span-1 bg-card border border-primary/30 rounded-xl flex items-center justify-center shadow-md relative overflow-hidden group cursor-move">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-[12px] font-black text-primary uppercase tracking-widest">Main Insight Summary</p>
              </div>
              <div className="col-span-1 row-span-2 bg-card border border-[var(--border)] rounded-xl flex items-center justify-center shadow-sm opacity-70 hover:opacity-100 transition-opacity cursor-move">
                <p className="text-[11px] font-bold text-[var(--muted-foreground)]">Recent Activity</p>
              </div>
              <div className="col-span-1 row-span-1 bg-card border border-[var(--border)] rounded-xl flex items-center justify-center shadow-sm opacity-70 hover:opacity-100 transition-opacity cursor-move">
                <p className="text-[11px] font-bold text-[var(--muted-foreground)]">Quick Actions</p>
              </div>
              <div className="col-span-1 row-span-1 bg-card border border-[var(--border)] rounded-xl flex items-center justify-center shadow-sm opacity-70 hover:opacity-100 transition-opacity cursor-move">
                <p className="text-[11px] font-bold text-[var(--muted-foreground)]">Status Card</p>
              </div>
            </div>
            <p className="mt-6 text-center text-[12px] font-bold text-[var(--muted-foreground)] flex items-center justify-center gap-2">
              <LayoutGrid size={14} /> 드래그 앤 드롭으로 위젯의 위치와 크기를 조정할 수 있습니다.
            </p>
          </div>
        </SettingGroup>

        <SettingGroup title="위젯 노출 상세 설정">
          <div className="grid grid-cols-2 gap-5">
            {[
              "오늘의 핵심 액션 가이드",
              "프로젝트 진행 현황 차트",
              "실시간 데이터 스트림 피드",
              "팀원 활동 로그 요약",
              "템플릿 퀵 브라우저",
              "커스텀 단축 버튼 (최대 5개)",
            ].map(w => (
              <label key={w} className="flex items-center justify-between p-4 rounded-xl bg-[var(--panel-soft)] border border-[var(--border)] cursor-pointer hover:bg-card shadow-sm transition-colors">
                <span className="text-[13px] font-bold text-[var(--secondary-foreground)]">{w}</span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </label>
            ))}
          </div>
        </SettingGroup>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" size="lg" className="gap-2"><FileText size={16} /> 공용 템플릿으로 저장</Button>
          <Button size="lg" className="gap-2"><LayoutGrid size={16} /> 위젯 레이아웃 적용</Button>
        </div>
      </div>
    </>
  ),
};

/* ─── 메인 ─── */
export const SettingsPage: React.FC = () => {
  const [active, setActive] = useState("projects");

  return (
    <div className="flex h-full w-full items-start justify-center overflow-hidden bg-background p-8">
      <div className="flex h-full w-full max-w-[1400px] overflow-hidden rounded-[32px] border border-[var(--border)] bg-card shadow-[var(--shadow-lg)] animate-in fade-in zoom-in duration-500">
        {/* Sidebar Nav */}
        <nav className="hide-scrollbar w-[280px] shrink-0 overflow-y-auto border-r border-[var(--border)] bg-[var(--panel-soft)] px-5 py-8">
          {NAV.map((section) => (
            <div key={section.label} className="mb-8">
              <p className="px-3 pb-3 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                {section.label}
              </p>
              <div className="flex flex-col gap-1.5">
                {section.items.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActive(item.key)}
                    className={cn(
                      "group flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left transition-all",
                      active === item.key 
                        ? "bg-primary text-primary-foreground shadow-[var(--shadow-md)] font-black" 
                        : "text-[var(--secondary-foreground)] font-bold hover:bg-card hover:border-[var(--border)] hover:shadow-sm border border-transparent"
                    )}
                  >
                    <item.icon size={16} className={active === item.key ? "text-white" : "text-[var(--subtle-foreground)] group-hover:text-primary transition-colors"} />
                    <span className="text-[13px]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Content Area */}
        <div className="hide-scrollbar flex-1 overflow-y-auto bg-background">
          <div className="mx-auto max-w-5xl px-16 pt-12 pb-24">
            {/* Welcome Header */}
            <section className="app-card relative mb-12 overflow-hidden p-10 border-primary/20 bg-gradient-to-br from-card via-card to-[var(--primary-light-bg)]" style={{ boxShadow: "var(--shadow-md)" }}>
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -mr-48 -mt-48 blur-[80px] pointer-events-none" />
              <div className="relative z-10">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-3 flex items-center gap-1.5">
                  <Key size={14} /> Enterprise Admin Console
                </p>
                <h1 className="font-title text-3xl font-black leading-tight tracking-tight text-foreground md:text-[34px]">
                  전사 데이터 및 <span className="text-primary">AI 운영 통제소.</span>
                </h1>
                <p className="mt-4 max-w-2xl text-[14px] font-medium text-[var(--muted-foreground)] leading-relaxed">
                  B2B 엔터프라이즈 환경에 맞춘 리서치 프로젝트 마스터 관리, 데이터 스키마 커넥터, AI 프롬프트 감사 로그 및 세밀한 사용자 데이터 접근 권한(Data Access)을 포괄적으로 제어합니다.
                </p>
              </div>
            </section>

            {CONTENT[active] || <div className="py-32 text-center text-[var(--muted-foreground)] italic font-black uppercase text-xl">Section Coming Soon</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
