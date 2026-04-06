import { useEffect, useState } from "react";
import { projectApi, resolveDefaultProjectId, type ProjectDetail } from "@/lib/api";

interface UseProjectResult {
  project: ProjectDetail | null;
  projectId: string | null;
  loading: boolean;
}

/**
 * 기본 프로젝트를 resolve하고 상세 정보를 로드한다.
 * initialProjectId가 주어지면 해당 ID를 사용하고, 없으면 resolveDefaultProjectId()로 결정한다.
 */
export function useProject(initialProjectId?: string | null): UseProjectResult {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [projectId, setProjectId] = useState<string | null>(initialProjectId ?? null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const pid = initialProjectId !== undefined ? initialProjectId : await resolveDefaultProjectId();
        if (cancelled) return;
        setProjectId(pid);
        if (!pid) return;
        const detail = await projectApi.getProject(pid);
        if (cancelled) return;
        setProject(detail);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { project, projectId, loading };
}
