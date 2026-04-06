import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { projectApi } from "@/lib/api";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { ProjectCard } from "@/components/home/ProjectCard";
import { WizardModal } from "@/components/home/WizardModal";
import { SURVEY_TYPES, type SurveyType } from "@/components/home/wizardTypes";
export function HomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardTemplate, setWizardTemplate] = useState<SurveyType | undefined>();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectApi.getProjects(1, 4),
    retry: false,
  });

  const createProjectMutation = useMutation({
    mutationFn: projectApi.createProject,
    onSuccess: async (project) => {
      if (!project) {
        setSubmitError("프로젝트를 생성하지 못했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      setWizardOpen(false);
      setWizardTemplate(undefined);
      setSubmitError(null);
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT_NAME, project.name);
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT_ID, project.id);
      navigate("/analytics", { state: { projectId: project.id } });
    },
    onError: () => {
      setSubmitError("프로젝트 생성 요청 중 오류가 발생했습니다.");
    },
  });

  const projects = data?.items ?? [];

  const openWizard = (tmpl?: SurveyType) => {
    setWizardTemplate(tmpl);
    setSubmitError(null);
    setWizardOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background px-10 pt-8 pb-4">
      <div className="space-y-8">
        {/* Welcome Section */}
        <section className="app-card p-7 border relative overflow-hidden group">
          <div className="relative z-10">
            <h1 className="text-2xl font-black">
              안녕하세요, <span className="text-primary">관리자</span>님.
            </h1>
            <p className="mt-3 text-[13px] font-medium text-muted-foreground">
              가상 페르소나 리서치 허브에 오신 것을 환영합니다.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => openWizard()}
                className="bg-primary text-white px-6 py-2.5 rounded-xl font-black shadow-lg hover:scale-105 transition-transform active:scale-95"
              >
                새 프로젝트 시작
              </button>
              <button className="bg-card border border-border px-6 py-2.5 rounded-xl font-black hover:bg-muted transition-colors">
                데이터 불러오기
              </button>
            </div>
          </div>
        </section>

        {/* Recent Projects Section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black">최근 프로젝트</h2>
              {isError && (
                <span className="text-[9px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  OFFLINE
                </span>
              )}
            </div>
            {isError && (
              <button
                type="button"
                onClick={() => void refetch()}
                className="rounded-xl border border-[var(--border)] bg-card px-4 py-2 text-[12px] font-black text-[var(--secondary-foreground)] transition-colors hover:bg-[var(--panel-soft)]"
              >
                다시 시도
              </button>
            )}
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {isLoading && !data ? (
              <div className="col-span-full py-20 flex justify-center">
                <Loader className="animate-spin text-primary opacity-20" />
              </div>
            ) : isError ? (
              <div className="col-span-full rounded-[28px] border border-amber-200 bg-amber-50/70 px-6 py-10 text-center">
                <p className="text-[15px] font-black text-amber-700">프로젝트 목록을 불러오지 못했습니다.</p>
                <p className="mt-2 text-[13px] font-medium text-amber-700/80">
                  백엔드 연결 상태를 확인한 뒤 다시 시도해주세요. 홈 화면은 더 이상 목업 프로젝트로 대체하지 않습니다.
                </p>
              </div>
            ) : projects.length === 0 ? (
              <div className="col-span-full rounded-[28px] border border-[var(--border)] bg-card px-6 py-12 text-center shadow-[var(--shadow-sm)]">
                <p className="text-[16px] font-black text-foreground">아직 생성된 프로젝트가 없습니다.</p>
                <p className="mt-2 text-[13px] font-medium text-muted-foreground">
                  새 프로젝트를 시작하거나 템플릿을 선택해 첫 조사 흐름을 생성하세요.
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => openWizard()}
                    className="rounded-2xl bg-primary px-5 py-3 text-[13px] font-black text-white shadow-lg"
                  >
                    새 프로젝트 시작
                  </button>
                  <button
                    type="button"
                    onClick={() => openWizard(SURVEY_TYPES[0])}
                    className="rounded-2xl border border-[var(--border)] bg-card px-5 py-3 text-[13px] font-black text-[var(--secondary-foreground)]"
                  >
                    추천 템플릿 사용
                  </button>
                </div>
              </div>
            ) : (
              projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => {
                    sessionStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT_NAME, project.title);
                    sessionStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT_ID, project.id);
                    navigate("/analytics", { state: { projectId: project.id } });
                  }}
                />
              ))
            )}
          </div>
        </section>

        {/* Template Library Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-base font-black">템플릿 라이브러리</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {SURVEY_TYPES.map((t) => (
              <div
                key={t.id}
                onClick={() => openWizard(t)}
                className="app-card p-7 cursor-pointer hover:border-primary/40 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <t.icon size={20} />
                </div>
                <h4 className="text-[16px] font-black mb-1.5">{t.title}</h4>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {wizardOpen && (
        <WizardModal
          initialTemplate={wizardTemplate}
          onClose={() => setWizardOpen(false)}
          onSubmit={async (payload) => {
            setSubmitError(null);
            await createProjectMutation.mutateAsync(payload);
          }}
          isSubmitting={createProjectMutation.isPending}
          submitError={submitError}
        />
      )}
    </div>
  );
}
