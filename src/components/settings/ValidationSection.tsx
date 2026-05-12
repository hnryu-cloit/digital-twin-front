import { useState } from "react";
import {
  Search,
  Plus,
  Eye,
  FileText,
  Clock,
  Briefcase,
  FlaskConical,
  Users,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionTitle } from "@/components/settings/SectionTitle";
import { SettingGroup } from "@/components/settings/SettingGroup";
import { StatCard } from "@/components/settings/StatCard";
import { ProjectPickerDialog, VAL_PROJECTS } from "@/components/settings/ProjectPickerDialog";

const VAL_LOGS = [
  {
    id: "VAL-8831",
    project: "Galaxy S26 컨셉 테스트",
    questionNo: "Q3",
    questionLabel: "구매 의향",
    q: "삼성 Knox의 엔터프라이즈 보안 솔루션이 구매에 영향을 주나요?",
    answer: "별로 중요하지 않아요. 저는 그냥 카메라랑 배터리 보면 돼요.",
    persona: "P19 · 19세 / 고등학생",
    cot: "19세 고등학생 페르소나는 엔터프라이즈 보안 솔루션에 대한 실질적 경험이나 의사결정 권한이 없음. 질문 자체가 해당 페르소나의 사용 맥락과 불일치하여 응답 신뢰도 저하 판정.",
    score: 45,
    result: "Flagged",
    date: "2026-03-13 13:50",
  },
  {
    id: "VAL-8829",
    project: "Galaxy S26 컨셉 테스트",
    questionNo: "Q4",
    questionLabel: "기능 인지도",
    q: "S26 카메라의 AI 보정 기능이 게임 플레이 경험에 영향을 주나요?",
    answer:
      "게임 중 백그라운드 자원을 잡아먹을 수 있어서 신경 쓰이죠. 성능 모드로 전환하면 카메라 기능이 제한되는지 궁금합니다.",
    persona: "P12 · 28세 / 게임 개발자",
    cot: "게임 개발자는 GPU 성능과 발열 관리에 민감한 페르소나. 카메라 AI 기능의 시스템 자원 점유가 게임 프레임에 미치는 영향을 인식하고 있어 응답 일관성·신뢰도 높음.",
    score: 98,
    result: "Pass",
    date: "2026-03-13 14:20",
  },
  {
    id: "VAL-8830",
    project: "프리미엄 사용자 재구매 의향 분석",
    questionNo: "Q2",
    questionLabel: "기능 만족도",
    q: "보안 폴더의 사용 편의성에 대해 어떻게 생각하십니까?",
    answer:
      "업무용 문서를 분리 보관할 수 있어 유용합니다. 다만 폴더 진입 시 생체인증 단계가 한 번 더 있으면 좋겠습니다.",
    persona: "P05 · 45세 / 금융 컨설턴트",
    cot: "금융 컨설턴트는 기밀 문서 보안에 높은 관심을 가지며 기업용 보안 솔루션 사용 경험이 있을 가능성 높음. 실용적 관점에서 보안 폴더를 평가한 응답 패턴이 페르소나 프로파일과 일치.",
    score: 95,
    result: "Pass",
    date: "2026-03-13 14:15",
  },
  {
    id: "VAL-8826",
    project: "MZ세대 스마트폰 Usage 조사",
    questionNo: "Q5",
    questionLabel: "SNS 사용 행태",
    q: "인스타그램 릴스 편집 기능 중 가장 자주 사용하는 AI 필터는 무엇인가요?",
    answer: "저는 주로 네이버 블로그를 써서 잘 모르겠어요.",
    persona: "P33 · 52세 / 소상공인",
    cot: "52세 소상공인 페르소나는 릴스 편집 세부 기능 사용 빈도가 낮을 것으로 예측됨. MZ세대 대상 조사에 고령층 페르소나를 적용한 설계 오류로 판정. 페르소나-설문 매핑 재검토 필요.",
    score: 62,
    result: "Flagged",
    date: "2026-03-12 16:30",
  },
  {
    id: "VAL-8824",
    project: "MZ세대 스마트폰 Usage 조사",
    questionNo: "Q4",
    questionLabel: "AI 기능 활용도",
    q: "Galaxy AI의 통화 번역 기능을 업무에서 얼마나 자주 활용하시나요?",
    answer: "해외 클라이언트와 영어로 통화할 때 주 1~2회 정도 씁니다. 발음 인식률이 개선되면 더 자주 쓸 것 같아요.",
    persona: "P07 · 34세 / UX 디자이너",
    cot: "UX 디자이너는 다국어 협업 도구에 대한 필요성이 있으며 해외 클라이언트와의 소통에서 번역 기능을 활용할 구체적 맥락이 존재함. 사용 빈도·이유가 페르소나 직무와 일관됨.",
    score: 91,
    result: "Pass",
    date: "2026-03-12 10:05",
  },
];

export function ValidationSection() {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [resultFilter, setResultFilter] = useState<"전체" | "Pass" | "Flagged">("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [questionFilter, setQuestionFilter] = useState("전체");

  const selectedNames = VAL_PROJECTS.filter((p) => selectedProjects.has(p.id)).map((p) => p.name);

  const visibleLogs = VAL_LOGS.filter((log) => {
    if (selectedProjects.size > 0 && !selectedNames.includes(log.project)) return false;
    if (resultFilter !== "전체" && log.result !== resultFilter) return false;
    if (questionFilter !== "전체" && log.questionNo !== questionFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!log.q.toLowerCase().includes(q) && !log.answer.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <>
      <SectionTitle
        title="품질 검증 아카이브"
        desc="페르소나 응답 생성 시 AI가 거친 추론 과정과 품질 검증 이력을 기록하고 검토합니다"
      />
      <div className="grid grid-cols-1 gap-6">
        {/* 요약 스탯 */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="총 검증 건수" value="8,831" sub="누적 전체" tone="neutral" icon={FlaskConical} />
          <StatCard label="Pass" value="8,614" sub="97.5% 통과율" tone="success" icon={CheckCircle2} />
          <StatCard label="Flagged" value="217" sub="재검토 필요" tone="warn" icon={AlertTriangle} />
          <StatCard label="평균 신뢰도" value="93.2" sub="/ 100 기준" tone="primary" icon={Award} />
        </div>

        {/* 신뢰도 분포 */}
        <SettingGroup title="신뢰도 구간 분포">
          <div className="space-y-3">
            {[
              { label: "95 ~ 100 (우수)", count: 5820, total: 8831, color: "bg-[var(--success)]" },
              { label: "80 ~ 94 (양호)", count: 2794, total: 8831, color: "bg-primary" },
              { label: "60 ~ 79 (보통)", count: 147, total: 8831, color: "bg-[var(--warning)]" },
              { label: "0 ~ 59 (위험 — Flagged)", count: 70, total: 8831, color: "bg-[var(--destructive)]" },
            ].map((band) => {
              const pct = Math.round((band.count / band.total) * 100);
              return (
                <div key={band.label} className="flex items-center gap-4">
                  <span className="w-48 text-[11px] font-bold text-[var(--secondary-foreground)] shrink-0">
                    {band.label}
                  </span>
                  <div className="flex-1 h-2.5 bg-[var(--panel-soft)] rounded-full overflow-hidden border border-[var(--border)]/50">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", band.color)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-20 text-right text-[11px] font-black text-[var(--muted-foreground)] shrink-0">
                    {band.count.toLocaleString()}건 ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </SettingGroup>

        {/* 검증 로그 */}
        <SettingGroup title="응답 무결성 검증 로그">
          {/* 필터 바 */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {/* 검색 */}
            <div className="flex items-center gap-2 bg-[var(--panel-soft)] px-3 py-2.5 rounded-xl border border-[var(--border)] focus-within:border-primary focus-within:bg-card transition-all min-w-[180px] flex-1">
              <Search size={13} className="text-[var(--subtle-foreground)] shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-[12px] font-bold w-full text-foreground placeholder:text-[var(--subtle-foreground)] placeholder:font-medium"
                placeholder="질문 키워드, 답변 내용 검색..."
              />
            </div>

            {/* 프로젝트 피커 트리거 */}
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className={cn(
                "flex items-center gap-2 h-[38px] px-3.5 rounded-xl border text-[12px] font-bold transition-all shrink-0",
                selectedProjects.size > 0
                  ? "bg-[var(--primary-light-bg)] border-[var(--primary-light-border)] text-primary"
                  : "bg-card border-[var(--border)] text-[var(--secondary-foreground)] hover:border-primary/40"
              )}
            >
              <Briefcase size={13} />
              {selectedProjects.size > 0 ? (
                <span>프로젝트 {selectedProjects.size}개 선택</span>
              ) : (
                <span>전체 프로젝트</span>
              )}
              <ChevronDown size={12} className="text-[var(--muted-foreground)]" />
            </button>

            {/* 설문 항목 */}
            <select
              value={questionFilter}
              onChange={(e) => setQuestionFilter(e.target.value)}
              className="bg-card border border-[var(--border)] rounded-xl px-3 h-[38px] text-[12px] font-bold text-foreground outline-none focus:border-primary shrink-0"
            >
              <option value="전체">전체 설문 항목</option>
              <option value="Q1">Q1 — 컨셉 첫인상</option>
              <option value="Q2">Q2 — 매력도 평가</option>
              <option value="Q3">Q3 — 구매 의향</option>
              <option value="Q4">Q4 — 기능 인지도</option>
              <option value="Q5">Q5 — 가격 수용성</option>
            </select>

            {/* 결과 필터 */}
            {(["전체", "Pass", "Flagged"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setResultFilter(f)}
                className={cn(
                  "px-3 py-2 rounded-lg text-[12px] font-black border transition-all shrink-0",
                  resultFilter === f
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-[var(--secondary-foreground)] border-[var(--border)] hover:border-primary/40"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* 선택된 프로젝트 뱃지 */}
          {selectedProjects.size > 0 && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                필터 중:
              </span>
              {selectedNames.map((name) => (
                <span
                  key={name}
                  className="flex items-center gap-1 bg-[var(--primary-light-bg)] border border-[var(--primary-light-border)] text-primary text-[11px] font-bold px-2.5 py-1 rounded-lg"
                >
                  {name}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedProjects((prev) => {
                        const next = new Set(prev);
                        const id = VAL_PROJECTS.find((p) => p.name === name)?.id;
                        if (id) next.delete(id);
                        return next;
                      })
                    }
                    className="hover:opacity-60 transition-opacity ml-0.5"
                  >
                    <Plus size={11} className="rotate-45" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() => setSelectedProjects(new Set())}
                className="text-[11px] font-bold text-[var(--muted-foreground)] hover:text-foreground transition-colors"
              >
                전체 초기화
              </button>
            </div>
          )}

          <div className="space-y-3">
            {visibleLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-[var(--border)] bg-card overflow-hidden hover:border-[var(--border-hover)] transition-all"
              >
                <div className="flex items-center justify-between px-4 py-3 bg-[var(--panel-soft)] border-b border-[var(--border)]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono font-black text-[var(--subtle-foreground)] bg-card border border-[var(--border)] px-2 py-0.5 rounded-md shrink-0">
                      {log.id}
                    </span>
                    <span className="text-[11px] font-black text-[var(--secondary-foreground)] truncate">
                      {log.project}
                    </span>
                    <span className="text-[var(--subtle-foreground)]">›</span>
                    <span className="shrink-0 text-[10px] font-black text-primary bg-[var(--primary-light-bg)] border border-[var(--primary-light-border)] px-2 py-0.5 rounded-md">
                      {log.questionNo} {log.questionLabel}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tight border shrink-0",
                      log.result === "Pass"
                        ? "bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]/30"
                        : "bg-red-50 text-[var(--destructive)] border-red-100 animate-pulse"
                    )}
                  >
                    {log.result === "Flagged" ? "Hallucination Risk" : log.result}
                  </span>
                </div>
                <div className="px-4 py-4 space-y-3">
                  <div className="flex gap-2">
                    <span className="text-[11px] font-black text-[var(--muted-foreground)] shrink-0 mt-0.5">Q</span>
                    <p className="text-[13px] font-medium text-[var(--secondary-foreground)] leading-relaxed">
                      {log.q}
                    </p>
                  </div>
                  <div className="flex gap-2 p-3 bg-[var(--panel-soft)] rounded-lg border border-[var(--border)]">
                    <span className="text-[11px] font-black text-primary shrink-0 mt-0.5">A</span>
                    <p className="text-[13px] font-medium text-foreground leading-relaxed">{log.answer}</p>
                  </div>
                  <div className="p-3 border border-dashed border-[var(--border)] rounded-lg">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1.5">
                      <FlaskConical size={10} /> CoT 추론 요약
                    </p>
                    <p className="text-[12px] font-medium text-[var(--secondary-foreground)] leading-relaxed">
                      {log.cot}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                        <Users size={10} /> {log.persona}
                      </span>
                      <span className="text-[10px] font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                        <Clock size={10} /> {log.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" className="text-[11px] gap-1.5 h-7">
                        <Eye size={12} /> CoT 전체 보기
                      </Button>
                      <div className="flex items-center gap-1.5">
                        <div className="w-20 h-1.5 bg-[var(--panel-soft)] rounded-full overflow-hidden border border-[var(--border)]/50">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              log.score >= 80
                                ? "bg-primary"
                                : log.score >= 60
                                  ? "bg-[var(--warning)]"
                                  : "bg-[var(--destructive)]"
                            )}
                            style={{ width: `${log.score}%` }}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-[12px] font-black tabular-nums",
                            log.score >= 80
                              ? "text-primary"
                              : log.score >= 60
                                ? "text-[var(--warning)]"
                                : "text-[var(--destructive)]"
                          )}
                        >
                          {log.score}
                        </span>
                        <span className="text-[10px] text-[var(--subtle-foreground)]">/ 100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {visibleLogs.length === 0 && (
              <div className="py-12 text-center text-[13px] font-bold text-[var(--muted-foreground)]">
                조건에 맞는 검증 로그가 없습니다
              </div>
            )}
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-[12px] font-bold text-[var(--muted-foreground)]">
              {visibleLogs.length}건 표시 중 (전체 8,831건)
            </span>
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileText size={13} /> CSV 내보내기
            </Button>
          </div>
        </SettingGroup>
      </div>

      <ProjectPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selected={selectedProjects}
        onConfirm={setSelectedProjects}
      />
    </>
  );
}
