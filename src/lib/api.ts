import axios from "axios";

// 백엔드 FastAPI 기본 URL (로컬 개발 환경 기준)
export const apiClient = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

// 토큰 캐시
let _cachedToken: string | null = localStorage.getItem("dt_access_token");

async function ensureToken(): Promise<string | null> {
  if (_cachedToken) return _cachedToken;
  try {
    const res = await axios.post("http://localhost:8000/api/auth/login", {
      email: "admin@digital-twin.ai",
      password: "Admin1234!",
    });
    _cachedToken = res.data.access_token as string;
    localStorage.setItem("dt_access_token", _cachedToken);
    return _cachedToken;
  } catch {
    return null;
  }
}

// 요청 인터셉터 — 모든 요청에 Bearer 토큰 자동 첨부
apiClient.interceptors.request.use(async (config) => {
  const token = await ensureToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 — 401 시 토큰 재발급 후 재시도
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      _cachedToken = null;
      localStorage.removeItem("dt_access_token");
      const token = await ensureToken();
      if (token && error.config) {
        error.config.headers["Authorization"] = `Bearer ${token}`;
        return axios(error.config);
      }
    }
    return Promise.reject(error);
  }
);

/* ─── Interfaces ─── */
export interface Project {
  id: string;
  title: string;
  type: string;
  typeColor?: string;
  typeBg?: string;
  status: "진행중" | "완료" | "초안" | "분석중";
  progress: number;
  responses: number;
  target: number;
  updatedAt: string;
  tags: string[];
}

export interface ProjectListResponse {
  items: Project[];
  page: number;
  size: number;
  total: number;
}

export interface Persona {
  id: string;
  name: string;
  segment: string;
  keywords: string[];
  age: number;
  gender: string;
  churn_risk?: string;
}

export interface PersonaListResponse {
  items: Persona[];
  page: number;
  size: number;
  total: number;
  view_mode: string;
}

/* ─── Legacy Compatibility & New Endpoints ─── */

/**
 * 기존 DashboardPage와 PersonaManagerPage에서 사용하던 함수
 * 안정성을 위해 목업 데이터를 반환하거나 백엔드 연동을 시도함
 */
export const fetchIndividualPersonas = async (projectId = "prj-001"): Promise<Persona[]> => {
  try {
    const { data } = await apiClient.get(`/v1/personas?project_id=${projectId}&page=1&size=100`);
    return data.items || [];
  } catch (error) {
    console.warn("fetchIndividualPersonas failed, returning empty.", error);
    return [];
  }
};

// 백엔드 status → 프론트엔드 한국어 status 매핑
const STATUS_MAP: Record<string, Project["status"]> = {
  "진행중": "진행중",
  "완료": "완료",
  "초안": "초안",
  "분석중": "분석중",
  in_progress: "진행중",
  completed: "완료",
  draft: "초안",
  analyzing: "분석중",
};

// 상대 시간 포맷 (ISO datetime → "N시간 전")
function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

// 백엔드 응답 → 프론트엔드 Project 매핑
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProject(raw: any): Project {
  return {
    id: raw.id,
    title: raw.name ?? raw.title ?? "",
    type: raw.type ?? "",
    status: STATUS_MAP[raw.status] ?? "초안",
    progress: raw.progress ?? 0,
    responses: raw.response_count ?? raw.responses ?? 0,
    target: raw.target_responses ?? raw.target ?? 0,
    updatedAt: raw.updated_at ? formatRelativeTime(raw.updated_at) : (raw.updatedAt ?? ""),
    tags: raw.tags ?? [],
  };
}

export const projectApi = {
  getProjects: async (page = 1, size = 10): Promise<ProjectListResponse> => {
    try {
      const { data } = await apiClient.get(`/v1/projects?page=${page}&size=${size}`);
      const items: Project[] = (data.items ?? []).map(mapProject);
      return { items, page: data.page ?? page, size: data.size ?? size, total: data.total ?? items.length };
    } catch (error) {
      console.warn("projectApi.getProjects failed.", error);
      return { items: [], page, size, total: 0 };
    }
  },
};

export const personaApi = {
  getPersonas: async (projectId: string, page = 1, size = 12): Promise<PersonaListResponse> => {
    try {
      const { data } = await apiClient.get(`/v1/personas?project_id=${projectId}&page=${page}&size=${size}`);
      return data;
    } catch (error) {
      console.warn("personaApi.getPersonas failed.", error);
      return { items: [], page, size, total: 0, view_mode: "card" };
    }
  },
};

/* ─── Survey ─── */
export interface SurveyQuestion {
  id: string;
  text: string;
  type: string;
  order: number;
}

export const surveyApi = {
  getQuestions: async (projectId: string): Promise<SurveyQuestion[]> => {
    try {
      const { data } = await apiClient.get(`/surveys/${projectId}/questions`);
      return data.questions ?? [];
    } catch (error) {
      console.warn("surveyApi.getQuestions failed.", error);
      return [];
    }
  },
};

/* ─── Simulation ─── */
export interface SimulationProgress {
  project_id: string;
  job_id: string | null;
  completed_responses: number;
  target_responses: number;
  progress: number;
  status?: string;
}

export interface SimulationFeedItem {
  id: string;
  persona_name: string;
  segment: string;
  question_id: string;
  question_text: string;
  selected_option: string;
  rationale: string;
  integrity_score: number;
  consistency_status: "Good" | "Warn" | "Error";
  timestamp: string;
  cot: string[];
}

export const simulationApi = {
  getProgress: async (projectId: string): Promise<SimulationProgress | null> => {
    try {
      const { data } = await apiClient.get(`/simulations/progress?project_id=${projectId}`);
      return data;
    } catch (error) {
      console.warn("simulationApi.getProgress failed.", error);
      return null;
    }
  },
  getFeed: async (projectId: string, limit = 20): Promise<SimulationFeedItem[]> => {
    try {
      const { data } = await apiClient.get(`/simulations/feed?project_id=${projectId}&limit=${limit}`);
      return data;
    } catch (error) {
      console.warn("simulationApi.getFeed failed.", error);
      return [];
    }
  },
  control: async (projectId: string, action: "start" | "stop"): Promise<void> => {
    try {
      await apiClient.post("/simulations/control", { project_id: projectId, action });
    } catch (error) {
      console.warn("simulationApi.control failed.", error);
    }
  },
};

/* ─── Report ─── */
export interface ReportSummary {
  id: string;
  project_id: string;
  title: string;
  type: string;
  format: string;
  size: string;
  created_at: string;
}

export interface ReportDetail extends ReportSummary {
  sections: { id: string; title: string; content: string }[];
  kpis: { label: string; value: string }[];
  charts: { id: string; type: string; title: string }[];
}

export const reportApi = {
  getReport: async (reportId: string): Promise<ReportDetail | null> => {
    try {
      const { data } = await apiClient.get(`/reports/${reportId}`);
      return data;
    } catch (error) {
      console.warn("reportApi.getReport failed.", error);
      return null;
    }
  },
  listReports: async (
    projectId: string,
    page = 1,
    size = 10,
    search?: string,
  ): Promise<{ items: ReportSummary[]; total: number }> => {
    try {
      const params = new URLSearchParams({
        project_id: projectId,
        page: String(page),
        size: String(size),
      });
      if (search) params.set("search", search);
      const { data } = await apiClient.get(`/reports?${params}`);
      return { items: data.items ?? [], total: data.total ?? 0 };
    } catch (error) {
      console.warn("reportApi.listReports failed.", error);
      return { items: [], total: 0 };
    }
  },
};
