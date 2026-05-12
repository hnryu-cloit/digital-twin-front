import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileText, Search, MessageSquare, Activity, Cpu, TrendingUp } from "lucide-react";
import { SectionTitle } from "@/components/settings/SectionTitle";
import { SettingGroup } from "@/components/settings/SettingGroup";
import { StatCard } from "@/components/settings/StatCard";
import { DateRangePicker, getPresetRange, formatDateRange } from "@/components/settings/DateRangePicker";
import type { DateRange } from "react-day-picker";

export function LogsSection() {
  const [dateRange, setDateRange] = useState<DateRange>(() => getPresetRange("month"));

  const handleRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  const rangeLabel = formatDateRange(dateRange);

  return (
    <>
      <SectionTitle
        title="대화 감사 로그"
        desc="AI 어시스턴트 및 설문 챗봇과 나눈 질의응답 이력을 조회하고 감사합니다"
      />

      <div className="grid grid-cols-1 gap-6">
        {/* 요약 스탯 */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="총 대화 요청" value="1,284" sub="전체 누적" tone="neutral" icon={MessageSquare} />
          <StatCard label="오늘 요청" value="38" sub="+12% 어제 대비" tone="primary" icon={Activity} />
          <StatCard label="평균 토큰" value="428" sub="응답 당 기준" tone="neutral" icon={Cpu} />
          <StatCard label="누적 처리 비용" value="$18.4" sub="이번 달 기준" tone="warn" icon={TrendingUp} />
        </div>

        {/* 사용자별 토큰 랭킹 */}
        <div className="app-card p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
              사용자별 AI 사용 현황
              <span className="ml-2 font-semibold normal-case tracking-normal text-primary">{rangeLabel}</span>
            </p>
            <DateRangePicker value={dateRange} onChange={handleRangeChange} />
          </div>
          <div className="space-y-3">
            {[
              { name: "김민준", email: "mj.kim@samsung.com", requests: 312, tokens: 134800, role: "편집자" },
              { name: "정태양", email: "ty.jung@samsung.com", requests: 241, tokens: 103600, role: "편집자" },
              { name: "이동훈", email: "dh.lee@samsung.com", requests: 184, tokens: 78420, role: "운영자" },
              { name: "이서연", email: "sy.lee@samsung.com", requests: 97, tokens: 41200, role: "편집자" },
              { name: "강지수", email: "js.kang@samsung.com", requests: 56, tokens: 23900, role: "뷰어" },
            ].map((u, i) => {
              const maxTokens = 134800;
              const pct = Math.round((u.tokens / maxTokens) * 100);
              return (
                <div key={u.email} className="flex items-center gap-4">
                  <span className="w-5 text-[12px] font-black text-[var(--muted-foreground)] text-right shrink-0">
                    {i + 1}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[var(--panel-soft)] border border-[var(--border)] flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-black text-primary">{u.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-black text-foreground">{u.name}</span>
                        <Badge variant="outline" className="text-[9px] font-black px-1.5">
                          {u.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-bold text-[var(--muted-foreground)] shrink-0">
                        <span>{u.requests}건</span>
                        <span className="font-mono text-primary">{u.tokens.toLocaleString()} tok</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-[var(--panel-soft)] rounded-full overflow-hidden border border-[var(--border)]/50">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <SettingGroup title="대화 로그">
          {/* 필터 바 */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-[var(--panel-soft)] px-4 py-2.5 rounded-xl border border-[var(--border)] focus-within:border-primary focus-within:bg-card transition-all">
              <Search size={14} className="text-[var(--subtle-foreground)] shrink-0" />
              <input
                className="bg-transparent border-none outline-none text-[13px] font-bold w-full text-foreground placeholder:text-[var(--subtle-foreground)] placeholder:font-medium"
                placeholder="사용자, 리서치명, 프롬프트 키워드 검색.."
              />
            </div>
            <select className="bg-card border border-[var(--border)] rounded-xl px-3 h-[42px] text-[12px] font-bold text-foreground outline-none focus:border-primary shadow-sm shrink-0">
              <option>전체 사용자</option>
              <option>dh.lee@samsung.com</option>
              <option>mj.kim@samsung.com</option>
              <option>sy.lee@samsung.com</option>
            </select>
          </div>

          {/* 테이블 */}
          <div className="overflow-hidden rounded-xl border border-[var(--border)] shadow-sm overflow-x-auto">
            <table className="w-full text-left text-[12px] min-w-[900px]">
              <thead className="bg-[var(--panel-soft)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-4 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-wider">
                    사용자
                  </th>
                  <th className="px-4 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-wider">
                    리서치명
                  </th>
                  <th className="px-4 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-wider">
                    프롬프트
                  </th>
                  <th className="px-4 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-wider">
                    AI 답변 요약
                  </th>
                  <th className="px-4 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-wider text-center">
                    토큰
                  </th>
                  <th className="px-4 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-wider">
                    생성일시
                  </th>
                  <th className="px-4 py-3.5 font-black text-[var(--muted-foreground)] uppercase tracking-wider text-center">
                    상세
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-card">
                {[
                  {
                    user: "이동훈",
                    email: "dh.lee@samsung.com",
                    research: "Galaxy S26 컨셉 테스트",
                    prompt: "기존 3번 문항을 MZ 세대 톤앤매너로 수정해줘.",
                    answer: '"S26, 너의 다음 레벨" 형태로 감성 중심 문항 3개 제안. 구어체 + 이모지 옵션 포함.',
                    tokens: 142,
                    date: "2026-03-15 09:12",
                    page: "/survey",
                  },
                  {
                    user: "김민준",
                    email: "mj.kim@samsung.com",
                    research: "MZ세대 스마트폰 Usage 조사",
                    prompt: "현재 필터링된 그룹에서 20대 여성의 가장 큰 불만 요인은 뭐야?",
                    answer: "배터리 수명(38%), 카메라 야간 성능(27%), 무게(18%) 순으로 불만 집중. 세부 코멘트 첨부.",
                    tokens: 890,
                    date: "2026-03-15 08:31",
                    page: "/analytics",
                  },
                  {
                    user: "이서연",
                    email: "sy.lee@samsung.com",
                    research: "글로벌 브랜드 인지도 Q1",
                    prompt: "이 리포트의 결론을 3줄로 요약해서 임원 보고용으로 만들어줘.",
                    answer:
                      "① 국내 MZ 브랜드 선호도 +4.2%p ② 북미 시장 갤럭시 인지도 72% ③ 카메라·AI 기능이 핵심 구매 트리거.",
                    tokens: 1250,
                    date: "2026-03-14 17:45",
                    page: "/report",
                  },
                  {
                    user: "박지호",
                    email: "jh.park@samsung.com",
                    research: "Galaxy S26 컨셉 테스트",
                    prompt: "이번 분석에서 구매 여력이 높은 군집의 가격 저항선은 얼마야?",
                    answer:
                      "150만원 이하 응답 61%, 180만원 이하 84%. 고사양 카메라 번들 시 10~15만원 추가 지불 의향 확인.",
                    tokens: 540,
                    date: "2026-03-14 14:20",
                    page: "/analytics",
                  },
                  {
                    user: "정태양",
                    email: "ty.jung@samsung.com",
                    research: "MZ세대 스마트폰 Usage 조사",
                    prompt: "이번 분석에서 게임 사용 비중이 높은 군집의 주요 기능 키워드를 뽑아줘.",
                    answer:
                      "게임 성능(52%), 발열 관리(44%), 화면 주사율(39%), 배터리(35%), 냉각 시스템(28%) 순으로 추출.",
                    tokens: 317,
                    date: "2026-03-13 11:05",
                    page: "/analytics",
                  },
                ].map((log, i) => (
                  <tr key={i} className="hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="px-4 py-4">
                      <p className="font-black text-foreground text-[13px]">{log.user}</p>
                      <p className="font-medium text-[var(--muted-foreground)] text-[10px]">{log.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-[var(--secondary-foreground)] text-[12px] leading-snug">
                        {log.research}
                      </span>
                    </td>
                    <td className="px-4 py-4 max-w-[200px]">
                      <p className="font-medium text-[var(--secondary-foreground)] text-[12px] leading-snug line-clamp-2 italic">
                        "{log.prompt}"
                      </p>
                    </td>
                    <td className="px-4 py-4 max-w-[220px]">
                      <p className="font-medium text-[var(--muted-foreground)] text-[12px] leading-snug line-clamp-2">
                        {log.answer}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-mono font-black text-[12px] text-primary">
                        {log.tokens.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-[var(--muted-foreground)] text-[12px] whitespace-nowrap">
                        {log.date}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] gap-1">
                        <Eye size={12} /> 보기
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center pt-3">
            <span className="text-[12px] font-bold text-[var(--muted-foreground)]">총 5건 표시 중 (전체 1,284건)</span>
            <Button variant="outline" size="sm" className="gap-2">
              <FileText size={13} /> CSV 내보내기
            </Button>
          </div>
        </SettingGroup>
      </div>
    </>
  );
}
