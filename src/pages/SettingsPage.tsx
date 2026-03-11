import type React from "react";
import { useState } from "react";

/* ─── 네비게이션 ─── */
interface NavSection {
  label: string;
  items: { key: string; label: string }[];
}

const NAV: NavSection[] = [
  {
    label: "관리자 보드",
    items: [
      { key: "users",    label: "사용자 및 역할 관리" },
      { key: "security", label: "권한 정책 및 보안" },
      { key: "datasrc",  label: "데이터 소스 및 수집 설정" },
      { key: "report",   label: "리포트 정책 및 승인 흐름" },
      { key: "menu",     label: "서비스 화면 및 메뉴 구성" },
      { key: "org",      label: "조직 및 운영 단위 관리" },
      { key: "api",      label: "API 키 및 시스템 연동" },
    ],
  },
];

/* ─── 공통 UI 블록 ─── */
function SettingRow({
  label,
  desc,
  control,
}: {
  label: string;
  desc?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-8 border-b border-[#F1F5F9] py-5 last:border-0">
      <div className="min-w-0">
        <p style={{ fontSize: 14, fontWeight: 400, color: "#1E293B" }}>{label}</p>
        {desc && <p style={{ fontSize: 12, color: "#3D5AF1", marginTop: 2 }}>{desc}</p>}
      </div>
      <div className="shrink-0" style={{ fontSize: 14, color: "#1E293B" }}>{control}</div>
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <div
      className="relative flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors"
      style={{ backgroundColor: on ? "#3D5AF1" : "#CBD5E1" }}
    >
      <span
        className="absolute h-4 w-4 rounded-full bg-white shadow transition-transform"
        style={{ transform: on ? "translateX(17px)" : "translateX(2px)" }}
      />
    </div>
  );
}

function Tag({ color, children }: { color: "blue" | "green" | "gray" | "orange"; children: React.ReactNode }) {
  const styles = {
    blue:   { bg: "#EEF4FF", text: "#3D5AF1" },
    green:  { bg: "#F0FDF4", text: "#16A34A" },
    gray:   { bg: "#F1F5F9", text: "#64748B" },
    orange: { bg: "#FFF7ED", text: "#EA580C" },
  };
  return (
    <span
      className="inline-flex items-center rounded-md px-2.5 py-1"
      style={{ fontSize: 12, fontWeight: 600, backgroundColor: styles[color].bg, color: styles[color].text }}
    >
      {children}
    </span>
  );
}

function SectionTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-6">
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>{title}</h2>
      {desc && <p style={{ fontSize: 13, color: "#3D5AF1", marginTop: 4 }}>{desc}</p>}
    </div>
  );
}

function Group({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      {title && (
        <p className="mb-2" style={{ fontSize: 11, color: "#CBD5E1", letterSpacing: "0.04em" }}>
          {title}
        </p>
      )}
      <div>{children}</div>
    </div>
  );
}

/* ─── 섹션 콘텐츠 ─── */
const CONTENT: Record<string, React.ReactNode> = {
  general: (
    <>
      <SectionTitle title="일반" />
      <Group>
        <SettingRow label="언어" control={<span style={{ fontSize: 13, color: "#334155" }}>한국어</span>} />
        <SettingRow label="테마" control={<span style={{ fontSize: 13, color: "#334155" }}>시스템 기본값</span>} />
        <SettingRow label="시간대" control={<span style={{ fontSize: 13, color: "#334155" }}>Asia/Seoul (UTC+9)</span>} />
        <SettingRow label="날짜 형식" control={<span style={{ fontSize: 13, color: "#334155" }}>YYYY-MM-DD</span>} />
        <SettingRow label="알림 수신" control={<Toggle on={true} />} />
      </Group>
    </>
  ),

  account: (
    <>
      <SectionTitle title="계정" />
      <Group>
        <SettingRow label="이름" control={<span style={{ fontSize: 13, color: "#334155" }}>관리자</span>} />
        <SettingRow label="이메일" control={<span style={{ fontSize: 13, color: "#334155" }}>admin@digitaltwin.ai</span>} />
        <SettingRow label="역할" control={<Tag color="blue">슈퍼 관리자</Tag>} />
        <SettingRow label="계정 생성일" control={<span style={{ fontSize: 13, color: "#334155" }}>2024-01-15</span>} />
        <SettingRow label="마지막 로그인" control={<span style={{ fontSize: 13, color: "#334155" }}>2026-03-10 09:32</span>} />
        <SettingRow label="2단계 인증" control={<Toggle on={true} />} />
      </Group>
    </>
  ),

  privacy: (
    <>
      <SectionTitle title="개인정보보호" desc="데이터 수집 범위와 개인정보 처리 동의를 관리합니다." />
      <Group>
        <SettingRow label="활동 로그 수집" desc="접속 기록, 메뉴 사용 이력" control={<Toggle on={true} />} />
        <SettingRow label="분석 데이터 활용" desc="서비스 개선 목적 익명 집계" control={<Toggle on={true} />} />
        <SettingRow label="마케팅 수신" control={<Toggle on={false} />} />
        <SettingRow label="개인정보 보유 기간" control={<span style={{ fontSize: 13, color: "#334155" }}>3년</span>} />
        <SettingRow
          label="내 데이터 다운로드"
          control={<button style={{ fontSize: 13, fontWeight: 600, color: "#3D5AF1" }}>요청하기</button>}
        />
      </Group>
    </>
  ),

  billing: (
    <>
      <SectionTitle title="결제" />
      <Group>
        <SettingRow label="현재 플랜" control={<Tag color="blue">Enterprise</Tag>} />
        <SettingRow label="청구 주기" control={<span style={{ fontSize: 13, color: "#334155" }}>연간</span>} />
        <SettingRow label="구독 기간" control={<span style={{ fontSize: 13, color: "#334155" }}>2026-01-01 ~ 2026-12-31</span>} />
        <SettingRow label="다음 결제일" control={<span style={{ fontSize: 13, color: "#334155" }}>2027-01-01</span>} />
        <SettingRow label="결제 수단" control={<span style={{ fontSize: 13, color: "#334155" }}>법인카드 •••• 4521</span>} />
      </Group>
    </>
  ),

  usage: (
    <>
      <SectionTitle title="사용량" desc="이번 달 기준" />
      <Group title="사용자">
        <SettingRow label="활성 사용자" desc="본사 12 / 실무 116" control={<span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>128명</span>} />
      </Group>
      <Group title="서비스">
        <SettingRow label="설문 응답 수집" control={<span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>14,302건</span>} />
        <SettingRow label="AI 분석 호출" desc="토큰 약 2.1M" control={<span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>3,817회</span>} />
        <SettingRow label="리포트 생성" desc="주간 12 / 월간 11" control={<span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>23건</span>} />
      </Group>
      <Group title="인프라">
        <SettingRow label="데이터 저장 용량" control={<span style={{ fontSize: 13, color: "#334155" }}>18.4 GB / 100 GB</span>} />
        <SettingRow label="API 호출" desc="한도 500,000회" control={<span style={{ fontSize: 13, color: "#334155" }}>42,190회</span>} />
      </Group>
    </>
  ),

  feature: (
    <>
      <SectionTitle title="기능" desc="베타 및 실험적 기능의 활성화 여부를 설정합니다." />
      <Group>
        <SettingRow label="AI 자동 요약" desc="리포트 섹션 자동 요약 생성" control={<Toggle on={true} />} />
        <SettingRow label="실시간 알림 푸시" control={<Toggle on={true} />} />
        <SettingRow label="다중 언어 설문" desc="베타" control={<Toggle on={false} />} />
        <SettingRow label="고급 세그먼트 필터" desc="신청 후 사용 가능" control={<Tag color="orange">베타</Tag>} />
        <SettingRow label="자동 리포트 스케줄" control={<Toggle on={true} />} />
      </Group>
    </>
  ),

  connector: (
    <>
      <SectionTitle title="커넥터" desc="외부 서비스와의 연동 상태를 확인합니다." />
      <Group>
        <SettingRow label="Slack" desc="리포트 알림 채널: #analytics" control={<Tag color="green">연결됨</Tag>} />
        <SettingRow label="Google Sheets" desc="응답 데이터 자동 동기화" control={<Tag color="green">연결됨</Tag>} />
        <SettingRow label="Salesforce CRM" desc="마지막 동기화: 오늘 08:00" control={<Tag color="green">연결됨</Tag>} />
        <SettingRow label="Tableau" control={<Tag color="gray">미연결</Tag>} />
        <SettingRow label="Webhook" desc="3개 엔드포인트 활성" control={<Tag color="green">연결됨</Tag>} />
      </Group>
    </>
  ),

  users: (
    <>
      <SectionTitle title="사용자 및 역할 관리" desc="관리자, 분석가, 운영자 권한을 분리하고 사용자별 접근 범위를 설정합니다." />
      <Group title="현황">
        <SettingRow label="전체 사용자" control={<span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>128명</span>} />
        <SettingRow label="슈퍼 관리자" control={<span style={{ fontSize: 13, color: "#334155" }}>2명</span>} />
        <SettingRow label="일반 관리자" control={<span style={{ fontSize: 13, color: "#334155" }}>10명</span>} />
        <SettingRow label="분석가" control={<span style={{ fontSize: 13, color: "#334155" }}>34명</span>} />
        <SettingRow label="운영자" control={<span style={{ fontSize: 13, color: "#334155" }}>82명</span>} />
      </Group>
      <Group title="정책">
        <SettingRow label="역할 정책 세트" desc="역할별 접근 권한 정의" control={<span style={{ fontSize: 13, color: "#334155" }}>14개</span>} />
      </Group>
    </>
  ),

  security: (
    <>
      <SectionTitle title="권한 정책 및 보안" desc="메뉴 접근 권한, 다운로드 제어, 감사 로그, 인증 정책을 관리합니다." />
      <Group title="인증">
        <SettingRow label="SSO 인증" desc="SAML 2.0 기반" control={<Toggle on={true} />} />
        <SettingRow label="2단계 인증 강제 적용" control={<Tag color="blue">전체 강제</Tag>} />
        <SettingRow label="세션 만료 시간" control={<span style={{ fontSize: 13, color: "#334155" }}>8시간</span>} />
      </Group>
      <Group title="접근 제어">
        <SettingRow label="IP 허용 목록" control={<span style={{ fontSize: 13, color: "#334155" }}>12개 대역</span>} />
        <SettingRow label="다운로드 권한" control={<span style={{ fontSize: 13, color: "#334155" }}>관리자 이상</span>} />
        <SettingRow label="감사 로그 보관" control={<span style={{ fontSize: 13, color: "#334155" }}>1년</span>} />
      </Group>
    </>
  ),

  datasrc: (
    <>
      <SectionTitle title="데이터 소스 및 수집 설정" desc="설문, 로그, 외부 연동 데이터의 연결 상태와 동기화 주기를 관리합니다." />
      <Group title="연결 현황">
        <SettingRow label="연결 데이터 소스" control={<span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>9개</span>} />
      </Group>
      <Group title="소스별 상태">
        <SettingRow label="설문 플랫폼" desc="실시간 수집 · 응답 14,302건" control={<Tag color="green">정상</Tag>} />
        <SettingRow label="CRM 데이터" desc="1시간 주기 동기화" control={<Tag color="green">정상</Tag>} />
        <SettingRow label="행동 로그" desc="실시간 스트리밍" control={<Tag color="green">정상</Tag>} />
        <SettingRow label="외부 리포트 DB" desc="1일 주기 동기화" control={<Tag color="green">정상</Tag>} />
        <SettingRow label="데이터 정합성 검사" desc="마지막 검사: 오늘 06:00" control={<Tag color="green">정상</Tag>} />
      </Group>
    </>
  ),

  report: (
    <>
      <SectionTitle title="리포트 정책 및 승인 흐름" desc="리포트 템플릿, 검수 단계, 배포 채널, 보관 주기를 운영 기준에 맞게 설정합니다." />
      <Group title="현황">
        <SettingRow label="정기 리포트 작업" desc="주간 12 / 월간 11" control={<span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>23건</span>} />
        <SettingRow label="리포트 템플릿" desc="공개 4 / 관리자 전용 4" control={<span style={{ fontSize: 13, color: "#334155" }}>8개</span>} />
      </Group>
      <Group title="정책">
        <SettingRow label="승인 단계" desc="작성자 → 팀장 → 배포" control={<span style={{ fontSize: 13, color: "#334155" }}>2단계</span>} />
        <SettingRow label="기본 보관 기간" control={<span style={{ fontSize: 13, color: "#334155" }}>5년</span>} />
        <SettingRow label="배포 채널" control={<span style={{ fontSize: 13, color: "#334155" }}>이메일 · Slack · PDF</span>} />
        <SettingRow label="자동 생성 스케줄" control={<Toggle on={true} />} />
      </Group>
    </>
  ),

  menu: (
    <>
      <SectionTitle title="서비스 화면 및 메뉴 구성" desc="워크플로우 노출 순서, 홈 대시보드 위젯, 관리자 전용 메뉴를 구성합니다." />
      <Group>
        <SettingRow label="홈 대시보드 위젯" desc="KPI, 설문 현황, 실시간 등" control={<span style={{ fontSize: 13, color: "#334155" }}>6개 활성</span>} />
        <SettingRow label="워크플로우 노출 순서" desc="세그먼트 → 설문 → 실시간 → 리포트" control={<span style={{ fontSize: 13, color: "#334155" }}>커스텀</span>} />
        <SettingRow label="관리자 전용 메뉴" control={<Toggle on={true} />} />
        <SettingRow label="사이드바 기본 상태" control={<span style={{ fontSize: 13, color: "#334155" }}>펼침</span>} />
        <SettingRow label="다크모드" control={<Toggle on={false} />} />
      </Group>
    </>
  ),

  org: (
    <>
      <SectionTitle title="조직 및 운영 단위 관리" desc="법인, 본부, 팀, 프로젝트 단위로 운영 범위를 나누고 기본 정책을 연결합니다." />
      <Group title="조직 구조">
        <SettingRow label="계층 구조" desc="법인 › 본부 › 팀 › 개인" control={<span style={{ fontSize: 13, color: "#334155" }}>4단계</span>} />
        <SettingRow label="법인" control={<span style={{ fontSize: 13, color: "#334155" }}>3개</span>} />
        <SettingRow label="본부" control={<span style={{ fontSize: 13, color: "#334155" }}>8개</span>} />
        <SettingRow label="팀" control={<span style={{ fontSize: 13, color: "#334155" }}>34개</span>} />
        <SettingRow label="활성 프로젝트" control={<span style={{ fontSize: 13, color: "#334155" }}>12개</span>} />
      </Group>
      <Group title="정책">
        <SettingRow label="운영 정책 세트" desc="조직 단위별 권한 연결" control={<span style={{ fontSize: 13, color: "#334155" }}>14개</span>} />
      </Group>
    </>
  ),

  api: (
    <>
      <SectionTitle title="API 키 및 시스템 연동" desc="외부 서비스 연동 키, 웹훅, 배치 작업, 시스템 헬스 체크 기준을 관리합니다." />
      <Group title="API 키">
        <SettingRow label="발급된 API 키" desc="활성 5 / 만료 2" control={<span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>7개</span>} />
        <SettingRow label="이번 달 호출량" desc="한도 500,000회" control={<span style={{ fontSize: 13, color: "#334155" }}>42,190회</span>} />
        <SettingRow label="API 버전" control={<span style={{ fontSize: 13, color: "#334155" }}>v2.1.0</span>} />
      </Group>
      <Group title="시스템">
        <SettingRow label="웹훅 엔드포인트" desc="모두 정상 응답" control={<span style={{ fontSize: 13, color: "#334155" }}>3개</span>} />
        <SettingRow label="배치 작업" desc="일 5 / 주 1" control={<span style={{ fontSize: 13, color: "#334155" }}>6개</span>} />
        <SettingRow label="시스템 헬스" desc="마지막 체크: 5분 전" control={<Tag color="green">정상</Tag>} />
      </Group>
    </>
  ),
};

/* ─── 메인 ─── */
export const SettingsPage: React.FC = () => {
  const [active, setActive] = useState("users");

  return (
    <div className="flex h-full w-full items-start justify-center overflow-hidden bg-[#F4F6FB] p-4">
      <div className="flex h-full w-full max-w-5xl overflow-hidden rounded-2xl border border-[#E8ECF4] bg-white shadow-sm">
        {/* 좌측 네비 */}
        <nav className="hide-scrollbar w-48 shrink-0 overflow-y-auto border-r border-[#F1F5F9] px-3 py-5">
          {NAV.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="px-3 pb-2" style={{ fontSize: 11, color: "#3D5AF1", fontWeight: 500 }}>
                {section.label}
              </p>
              {section.items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActive(item.key)}
                  className="flex w-full items-center rounded-lg px-3 py-2 text-left transition-colors hover:bg-[#F8FAFF]"
                  style={{
                    fontSize: 13,
                    fontWeight: 400,
                    color: active === item.key ? "#3D5AF1" : "#1E293B",
                    backgroundColor: active === item.key ? "#EEF4FF" : "transparent",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* 우측 콘텐츠 */}
        <div className="hide-scrollbar flex-1 overflow-y-auto px-12 py-8">
          <div className="mx-auto max-w-3xl">
            {CONTENT[active]}
          </div>
        </div>
      </div>
    </div>
  );
};