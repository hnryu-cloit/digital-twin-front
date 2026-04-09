import axios from "axios";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import * as MOCK from "@/lib/mockData";

const IS_MOCK = import.meta.env.VITE_MOCK_MODE === "true";

// 백엔드 FastAPI 기본 URL (로컬 개발 환경 기준)
export const apiClient = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

// 토큰 캐시
let _cachedToken: string | null = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
let _defaultProjectIdPromise: Promise<string | null> | null = null;

async function ensureToken(): Promise<string | null> {
  if (_cachedToken) return _cachedToken;
  try {
    const res = await axios.post("http://localhost:8000/api/auth/login", {
      email: "admin@digital-twin.ai",
      password: "Admin1234!",
    });
    _cachedToken = res.data.access_token as string;
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, _cachedToken);
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
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
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
export type WorkflowStage = "created" | "survey" | "simulation" | "report";

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
  createdAt: string;
  workflowStage: WorkflowStage;
  tags: string[];
}

export interface ProjectListResponse {
  items: Project[];
  page: number;
  size: number;
  total: number;
}

export interface ProjectOption {
  id: string;
  name: string;
}

export interface ProjectCreatePayload {
  name: string;
  type: string;
  purpose: string;
  description?: string;
  data_sources?: string[];
  tags?: string[];
}

export interface ProjectDetail {
  id: string;
  name: string;
  type: string;
  purpose: string;
  description?: string | null;
  data_sources: string[];
  tags: string[];
  status: string;
  progress: number;
  response_count: number;
  target_responses: number;
  surveys_count: number;
  reports_count: number;
  persona_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Persona {
  id: string;
  project_id?: string;
  name: string;
  segment: string;
  keywords: string[];
  age: number;
  gender: string;
  occupation: string;
  occupation_category: string;
  region: string;
  household_type: string;
  preferred_channel: string;
  buy_channel: string;
  product_group: string;
  churn_risk?: string;
}

export interface PersonaIndividualStory {
  index?: number;
  name?: string;
  job?: string;
  personality?: string;
  samsung_experience?: string;
}

export interface PersonaDetail extends Persona {
  profile: string;
  purchase_history: string[];
  individual_stories: PersonaIndividualStory[];
  activity_logs: string[];
  cot: string[];
  purchase_intent: number;
  marketing_acceptance: number;
  brand_attitude: number;
  score?: {
    future_value?: number;
    churn_risk?: number;
  };
}

export interface PersonaListResponse {
  items: Persona[];
  page: number;
  size: number;
  total: number;
  view_mode: string;
}

export interface FilterOptionItem {
  label: string;
  count: number;
  ratio: number;
}

export interface SegmentFilterOptions {
  occupations: FilterOptionItem[];
  regions: FilterOptionItem[];
  households: FilterOptionItem[];
  buy_channels: FilterOptionItem[];
  content_channels: FilterOptionItem[];
  product_groups: FilterOptionItem[];
}

export interface DataTableSummary {
  available: boolean;
  rows?: number;
  columns?: number;
}

export async function resolveDefaultProjectId(): Promise<string | null> {
  if (IS_MOCK) return MOCK.MOCK_PROJECT_ID;
  if (!_defaultProjectIdPromise) {
    _defaultProjectIdPromise = (async () => {
      try {
        const { data } = await apiClient.get("/projects?page=1&size=1");
        return data.items?.[0]?.id ?? null;
      } catch (error) {
        console.warn("resolveDefaultProjectId failed.", error);
        return null;
      }
    })();
  }
  return _defaultProjectIdPromise;
}

/* ─── Legacy Compatibility & New Endpoints ─── */

/**
 * 기존 DashboardPage와 PersonaManagerPage에서 사용하던 함수
 * 안정성을 위해 목업 데이터를 반환하거나 백엔드 연동을 시도함
 */
export const fetchIndividualPersonas = async (projectId?: string | null): Promise<Persona[]> => {
  try {
    const query = new URLSearchParams({
      page: "1",
      size: "100",
    });
    if (projectId) {
      query.set("project_id", projectId);
    }
    const { data } = await apiClient.get(`/personas?${query.toString()}`);
    return data.items || [];
  } catch (error) {
    console.error("fetchIndividualPersonas failed:", error);
    return [];
  }
};

// 백엔드 status → 프론트엔드 한국어 status 매핑
const STATUS_MAP: Record<string, Project["status"]> = {
  진행중: "진행중",
  완료: "완료",
  초안: "초안",
  분석중: "분석중",
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
    createdAt: raw.created_at ? raw.created_at.slice(0, 10) : "",
    workflowStage: (raw.workflow_stage as WorkflowStage) ?? "created",
    tags: raw.tags ?? [],
  };
}

export const projectApi = {
  getProjects: async (page = 1, size = 10): Promise<ProjectListResponse> => {
    if (IS_MOCK) {
      const start = (page - 1) * size;
      return { items: MOCK.MOCK_PROJECTS.slice(start, start + size), page, size, total: MOCK.MOCK_PROJECTS.length };
    }
    try {
      const { data } = await apiClient.get(`/projects?page=${page}&size=${size}`);
      const items: Project[] = (data.items ?? []).map(mapProject);
      return { items, page: data.page ?? page, size: data.size ?? size, total: data.total ?? items.length };
    } catch (error) {
      console.warn("projectApi.getProjects failed.", error);
      return { items: [], page, size, total: 0 };
    }
  },
  createProject: async (payload: ProjectCreatePayload): Promise<ProjectDetail | null> => {
    if (IS_MOCK) return { ...MOCK.MOCK_PROJECT_DETAIL, name: payload.name, type: payload.type };
    try {
      const { data } = await apiClient.post("/projects", payload);
      _defaultProjectIdPromise = Promise.resolve(data.id ?? null);
      return data;
    } catch (error) {
      console.warn("projectApi.createProject failed.", error);
      return null;
    }
  },
  getProject: async (projectId: string): Promise<ProjectDetail | null> => {
    if (IS_MOCK) return MOCK.MOCK_PROJECT_DETAIL;
    try {
      const { data } = await apiClient.get(`/projects/${projectId}`);
      return data;
    } catch (error) {
      console.warn("projectApi.getProject failed.", error);
      return null;
    }
  },
  getProjectOptions: async (): Promise<ProjectOption[]> => {
    if (IS_MOCK) return MOCK.MOCK_PROJECT_OPTIONS;
    try {
      const { data } = await apiClient.get("/projects?page=1&size=100");
      return (data.items ?? []).map((item: { id: string; name?: string; title?: string }) => ({
        id: item.id,
        name: item.name ?? item.title ?? item.id,
      }));
    } catch (error) {
      console.warn("projectApi.getProjectOptions failed.", error);
      return [];
    }
  },
  saveSegmentFilter: async (
    projectId: string,
    personaFilter: Record<string, unknown>,
    selectedPersonaIds: string[]
  ): Promise<{ project_id: string; selected_count: number } | null> => {
    try {
      const { data } = await apiClient.post(`/projects/${projectId}/segment-filter`, {
        persona_filter: personaFilter,
        selected_persona_ids: selectedPersonaIds,
      });
      return data;
    } catch (error) {
      console.warn("projectApi.saveSegmentFilter failed.", error);
      return null;
    }
  },
  getSegmentFilter: async (
    projectId: string
  ): Promise<{
    persona_filter: Record<string, unknown> | null;
    selected_persona_ids: string[];
    selected_count: number;
  } | null> => {
    try {
      const { data } = await apiClient.get(`/projects/${projectId}/segment-filter`);
      return data;
    } catch (error) {
      console.warn("projectApi.getSegmentFilter failed.", error);
      return null;
    }
  },
  deleteProject: async (projectId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/projects/${projectId}`);
      return true;
    } catch (error) {
      console.warn("projectApi.deleteProject failed.", error);
      return false;
    }
  },
};

export const personaApi = {
  getPersonas: async (
    projectId: string | undefined,
    page = 1,
    size = 12,
    search = ""
  ): Promise<PersonaListResponse> => {
    if (IS_MOCK) return MOCK.getMockPersonaPage(page, size, search);
    try {
      const query = new URLSearchParams({ page: String(page), size: String(size) });
      if (projectId) query.set("project_id", projectId);
      if (search.trim()) query.set("search", search.trim());
      const { data } = await apiClient.get(`/personas?${query.toString()}`);
      return data;
    } catch (error) {
      console.warn("personaApi.getPersonas failed.", error);
      return { items: [], page, size, total: 0, view_mode: "card" };
    }
  },
  getPersona: async (personaId: string): Promise<PersonaDetail | null> => {
    if (IS_MOCK) return { ...MOCK.MOCK_PERSONA_DETAIL, id: personaId };
    try {
      const { data } = await apiClient.get(`/personas/${personaId}`);
      return data;
    } catch (error) {
      console.warn("personaApi.getPersona failed.", error);
      return null;
    }
  },
  generateJob: async (payload: {
    project_id: string;
    random_state?: number;
    n_synthetic_customers?: number;
    n_personas?: number;
    excel_path?: string;
    output_dir?: string;
    overwrite_existing?: boolean;
  }): Promise<AIJob | null> => {
    try {
      const { data } = await apiClient.post("/personas/generate-job", payload);
      return data;
    } catch (error) {
      console.warn("personaApi.generateJob failed.", error);
      return null;
    }
  },
  importExcel: async (projectId: string, overwrite = true): Promise<{ persona_count: number } | null> => {
    try {
      const { data } = await apiClient.post(`/personas/import-excel?project_id=${projectId}&overwrite=${overwrite}`);
      return data;
    } catch (error) {
      console.warn("personaApi.importExcel failed.", error);
      return null;
    }
  },
};

export const segmentApi = {
  getFilterOptions: async (projectId?: string): Promise<SegmentFilterOptions | null> => {
    if (IS_MOCK) return MOCK.MOCK_SEGMENT_FILTER_OPTIONS;
    try {
      const resolvedProjectId = projectId ?? (await resolveDefaultProjectId());
      const query = resolvedProjectId ? `?project_id=${resolvedProjectId}` : "";
      const { data } = await apiClient.get(`/segments/filter-options${query}`);
      return data;
    } catch (error) {
      console.warn("segmentApi.getFilterOptions failed.", error);
      return null;
    }
  },
};

export const dataApi = {
  listTables: async (): Promise<Record<string, DataTableSummary>> => {
    try {
      const { data } = await apiClient.get("/data/tables");
      return data ?? {};
    } catch (error) {
      console.warn("dataApi.listTables failed.", error);
      return {};
    }
  },
};

/* ─── Survey ─── */
export interface SurveyQuestion {
  id: string;
  text: string;
  type: string;
  order: number;
  options?: string[];
  status?: string;
}

export interface SurveyDraftEvidenceItem {
  label: string;
  value: string;
}

export interface SurveyDraftQuestion extends SurveyQuestion {
  rationale: string;
  evidence: SurveyDraftEvidenceItem[];
}

export interface SurveyDraftGenerationMeta {
  question_count: number;
  draft_count: number;
  confirmed_count: number;
  latest_job_id?: string | null;
  user_prompt?: string | null;
  template_id?: string | null;
  template_version?: number | null;
  segment_source?: string | null;
}

export interface SurveyDraftPreview {
  project_id: string;
  status: string;
  summary: string;
  generation_meta: SurveyDraftGenerationMeta;
  questions: SurveyDraftQuestion[];
}

export interface SurveyTemplate {
  template_id: string;
  template_version: number;
  title: string;
  survey_type: string;
  description: string;
  recommended_question_count: number;
  required_blocks: string[];
}

export interface AIJob {
  id: string;
  project_id: string;
  job_type: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  progress: number;
  payload: Record<string, unknown>;
  result_ref?: Record<string, unknown> | null;
  error_code?: string | null;
  error_message?: string | null;
  created_by: string;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
}

export const surveyApi = {
  getTemplates: async (): Promise<SurveyTemplate[]> => {
    if (IS_MOCK) return MOCK.MOCK_SURVEY_TEMPLATES;
    try {
      const { data } = await apiClient.get("/surveys/templates");
      return data.items ?? [];
    } catch (error) {
      console.warn("surveyApi.getTemplates failed.", error);
      return [];
    }
  },
  getQuestions: async (projectId?: string): Promise<SurveyQuestion[]> => {
    if (IS_MOCK) return MOCK.MOCK_SURVEY_QUESTIONS;
    try {
      const resolvedProjectId = projectId ?? (await resolveDefaultProjectId());
      if (!resolvedProjectId) return [];
      const { data } = await apiClient.get(`/surveys/${resolvedProjectId}/questions`);
      return data.questions ?? [];
    } catch (error) {
      console.warn("surveyApi.getQuestions failed.", error);
      return [];
    }
  },
  getPreview: async (projectId?: string): Promise<SurveyDraftPreview | null> => {
    if (IS_MOCK) return MOCK.MOCK_SURVEY_PREVIEW;
    try {
      const resolvedProjectId = projectId ?? (await resolveDefaultProjectId());
      if (!resolvedProjectId) return null;
      const { data } = await apiClient.get(`/surveys/${resolvedProjectId}/preview`);
      return data;
    } catch (error) {
      console.warn("surveyApi.getPreview failed.", error);
      return null;
    }
  },
  saveQuestions: async (
    projectId: string | undefined,
    questions: Array<{ text: string; type: string; options?: string[] }>
  ): Promise<SurveyQuestion[]> => {
    try {
      const resolvedProjectId = projectId ?? (await resolveDefaultProjectId());
      if (!resolvedProjectId) return [];
      const { data } = await apiClient.put(`/surveys/${resolvedProjectId}/questions`, { questions });
      return data.questions ?? [];
    } catch (error) {
      console.warn("surveyApi.saveQuestions failed.", error);
      return [];
    }
  },
  confirm: async (projectId?: string): Promise<boolean> => {
    try {
      const resolvedProjectId = projectId ?? (await resolveDefaultProjectId());
      if (!resolvedProjectId) return false;
      await apiClient.post("/surveys/confirm", { project_id: resolvedProjectId });
      return true;
    } catch (error) {
      console.warn("surveyApi.confirm failed.", error);
      return false;
    }
  },
  generateJob: async (payload: {
    project_id: string;
    user_prompt: string;
    survey_type: string;
    question_count: number;
    template?: Record<string, unknown>;
    segment_context?: Record<string, unknown>;
  }): Promise<AIJob | null> => {
    try {
      const { data } = await apiClient.post("/surveys/generate-job", payload);
      return data;
    } catch (error) {
      console.warn("surveyApi.generateJob failed.", error);
      return null;
    }
  },
};

export const aiJobApi = {
  listJobs: async (params?: { projectId?: string; jobType?: string }): Promise<{ items: AIJob[]; total: number }> => {
    if (IS_MOCK) {
      const jobs = params?.jobType ? MOCK.MOCK_AI_JOBS.filter((j) => j.job_type === params.jobType) : MOCK.MOCK_AI_JOBS;
      return { items: jobs, total: jobs.length };
    }
    try {
      const query = new URLSearchParams();
      const resolvedProjectId = params?.projectId ?? (await resolveDefaultProjectId());
      if (resolvedProjectId) {
        query.set("project_id", resolvedProjectId);
      }
      if (params?.jobType) {
        query.set("job_type", params.jobType);
      }
      const queryString = query.toString();
      const { data } = await apiClient.get(`/ai/jobs${queryString ? `?${queryString}` : ""}`);
      return { items: data.items ?? [], total: data.total ?? 0 };
    } catch (error) {
      console.warn("aiJobApi.listJobs failed.", error);
      return { items: [], total: 0 };
    }
  },
  getJob: async (jobId: string): Promise<AIJob | null> => {
    if (IS_MOCK) return MOCK.MOCK_AI_JOBS.find((j) => j.id === jobId) ?? null;
    try {
      const { data } = await apiClient.get(`/ai/jobs/${jobId}`);
      return data;
    } catch (error) {
      console.warn("aiJobApi.getJob failed.", error);
      return null;
    }
  },
  cancelJob: async (jobId: string): Promise<AIJob | null> => {
    if (IS_MOCK) return MOCK.MOCK_AI_JOBS.find((j) => j.id === jobId) ?? null;
    try {
      const { data } = await apiClient.post(`/ai/jobs/${jobId}/cancel`);
      return data;
    } catch (error) {
      console.warn("aiJobApi.cancelJob failed.", error);
      return null;
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

export interface ResponseDistributionItem {
  label: string;
  value: number;
  count?: number;
}

export interface ResponseListItem {
  id: string;
  persona_name: string;
  segment: string;
  question_id: string;
  question_text: string;
  selected_option: string;
  rationale: string;
  integrity_score: number;
  timestamp: string;
  consistency_status: "Good" | "Warn" | "Error";
}

export interface ResponseListResponse {
  items: ResponseListItem[];
  page: number;
  size: number;
  total: number;
}

export interface QuestionStat {
  question_id: string;
  question_text: string;
  question_type: string;
  response_count: number;
  distribution: ResponseDistributionItem[];
  mean?: number;
  std_dev?: number;
  max_score?: number;
}

export interface InsightResponse {
  summary: string;
  strategies: string[];
  cached_until: string;
}

export interface KeywordTrendItem {
  keyword: string;
  frequency: number;
  trend: "up" | "down" | "flat";
}

export const simulationApi = {
  getProgress: async (projectId?: string): Promise<SimulationProgress | null> => {
    if (IS_MOCK) return MOCK.MOCK_SIMULATION_PROGRESS;
    try {
      const resolvedProjectId = projectId ?? (await resolveDefaultProjectId());
      if (!resolvedProjectId) return null;
      const { data } = await apiClient.get(`/simulations/progress?project_id=${resolvedProjectId}`);
      return data;
    } catch (error) {
      console.warn("simulationApi.getProgress failed.", error);
      return null;
    }
  },
  getFeed: async (projectId?: string, limit = 20): Promise<SimulationFeedItem[]> => {
    if (IS_MOCK) return MOCK.MOCK_SIMULATION_FEED.slice(0, limit);
    try {
      const resolvedProjectId = projectId ?? (await resolveDefaultProjectId());
      if (!resolvedProjectId) return [];
      const { data } = await apiClient.get(`/simulations/feed?project_id=${resolvedProjectId}&limit=${limit}`);
      return data;
    } catch (error) {
      console.warn("simulationApi.getFeed failed.", error);
      return [];
    }
  },
  getDistribution: async (projectId: string | undefined, questionId: string): Promise<ResponseDistributionItem[]> => {
    if (IS_MOCK) return MOCK.MOCK_RESPONSE_DISTRIBUTIONS[questionId] ?? MOCK.MOCK_RESPONSE_DISTRIBUTIONS["q-001"];
    try {
      const resolvedProjectId = projectId ?? (await resolveDefaultProjectId());
      if (!resolvedProjectId) return [];
      const { data } = await apiClient.get(
        `/simulations/distribution?project_id=${resolvedProjectId}&question_id=${questionId}`
      );
      return data ?? [];
    } catch (error) {
      console.warn("simulationApi.getDistribution failed.", error);
      return [];
    }
  },
  getInsight: async (projectId: string | undefined, questionId: string): Promise<InsightResponse | null> => {
    if (IS_MOCK) return MOCK.MOCK_INSIGHT;
    try {
      const resolvedProjectId = projectId ?? (await resolveDefaultProjectId());
      if (!resolvedProjectId) return null;
      const { data } = await apiClient.get(
        `/simulations/insight?project_id=${resolvedProjectId}&question_id=${questionId}`
      );
      return data;
    } catch (error) {
      console.warn("simulationApi.getInsight failed.", error);
      return null;
    }
  },
  getKeywords: async (projectId?: string): Promise<KeywordTrendItem[]> => {
    if (IS_MOCK) return MOCK.MOCK_KEYWORDS;
    try {
      const resolvedProjectId = projectId ?? (await resolveDefaultProjectId());
      if (!resolvedProjectId) return [];
      const { data } = await apiClient.get(`/simulations/keywords?project_id=${resolvedProjectId}`);
      return data ?? [];
    } catch (error) {
      console.warn("simulationApi.getKeywords failed.", error);
      return [];
    }
  },
  getResponses: async (
    projectId: string,
    questionId?: string,
    segment?: string,
    page = 1,
    size = 20
  ): Promise<ResponseListResponse> => {
    if (IS_MOCK) return MOCK.MOCK_RESPONSES;
    try {
      const params = new URLSearchParams({ project_id: projectId, page: String(page), size: String(size) });
      if (questionId) params.set("question_id", questionId);
      if (segment) params.set("segment", segment);
      const { data } = await apiClient.get(`/simulations/responses?${params}`);
      return data;
    } catch (error) {
      console.warn("simulationApi.getResponses failed.", error);
      return { items: [], page, size, total: 0 };
    }
  },
  control: async (projectId: string | undefined, action: "start" | "stop"): Promise<void> => {
    if (IS_MOCK) return;
    try {
      const resolvedProjectId = projectId ?? (await resolveDefaultProjectId());
      if (!resolvedProjectId) return;
      await apiClient.post("/simulations/control", { project_id: resolvedProjectId, action });
    } catch (error) {
      console.warn("simulationApi.control failed.", error);
    }
  },
  /**
   * Streams simulation SSE events via fetch (supports auth headers).
   * Calls onEvent for each parsed event, onDone when stream ends.
   * Returns an AbortController — call .abort() to cancel.
   */
  streamRun: (
    projectId: string,
    batchSize = 5,
    onEvent: (event: Record<string, unknown>) => void,
    onDone: () => void,
    onError?: (err: unknown) => void
  ): AbortController => {
    const controller = new AbortController();

    if (IS_MOCK) {
      let idx = 0;
      const feed = MOCK.MOCK_SIMULATION_FEED;
      const tick = () => {
        if (controller.signal.aborted || idx >= feed.length) {
          onDone();
          return;
        }
        const f = feed[idx++];
        onEvent({
          type: "result",
          persona_name: f.persona_name,
          segment: f.segment,
          answers: [
            {
              question_id: f.question_id,
              question_text: f.question_text,
              selected_option: f.selected_option,
              rationale: f.rationale,
            },
          ],
        });
        setTimeout(tick, 1800);
      };
      setTimeout(tick, 800);
      return controller;
    }
    const token =
      localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN) ?? sessionStorage.getItem(STORAGE_KEYS.SESSION_TOKEN) ?? "";

    (async () => {
      try {
        const resp = await fetch(
          `http://localhost:8000/api/simulations/stream?project_id=${encodeURIComponent(projectId)}&batch_size=${batchSize}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );
        if (!resp.ok || !resp.body) throw new Error(`HTTP ${resp.status}`);

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const raw = line.slice(5).trim();
            if (!raw) continue;
            try {
              const evt = JSON.parse(raw) as Record<string, unknown>;
              onEvent(evt);
              if (evt.type === "done") {
                onDone();
                return;
              }
            } catch {
              /* ignore malformed */
            }
          }
        }
        onDone();
      } catch (err) {
        if ((err as { name?: string }).name !== "AbortError") onError?.(err);
      }
    })();

    return controller;
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
  sections: {
    id: string;
    title: string;
    content: string;
    evidence?: { label: string; value: string; source_question_id?: string | null }[];
    action?: string;
  }[];
  kpis: { label: string; value: string }[];
  charts: { id: string; type: string; title: string; data?: Record<string, unknown>[] }[];
  question_stats?: QuestionStat[];
}

export interface ReportDownloadInfo {
  report_id: string;
  format: string;
  download_url: string;
  expires_at: string;
}

export const reportApi = {
  generateJob: async (payload: { project_id: string; report_type?: string }): Promise<AIJob | null> => {
    if (IS_MOCK) return MOCK.MOCK_AI_JOBS[3];
    try {
      const { data } = await apiClient.post("/reports/generate-job", payload);
      return data;
    } catch (error) {
      console.warn("reportApi.generateJob failed.", error);
      return null;
    }
  },
  getReport: async (reportId: string): Promise<ReportDetail | null> => {
    if (IS_MOCK) return { ...MOCK.MOCK_REPORT_DETAIL, id: reportId };
    try {
      const { data } = await apiClient.get(`/reports/${reportId}`);
      return data;
    } catch (error) {
      console.warn("reportApi.getReport failed.", error);
      return null;
    }
  },
  listReports: async (
    projectId?: string,
    page = 1,
    size = 10,
    search?: string
  ): Promise<{ items: ReportSummary[]; total: number }> => {
    if (IS_MOCK) {
      const filtered = search
        ? MOCK.MOCK_REPORT_SUMMARIES.filter((r) => r.title.includes(search))
        : MOCK.MOCK_REPORT_SUMMARIES;
      return { items: filtered, total: filtered.length };
    }
    try {
      const resolvedProjectId = projectId ?? (await resolveDefaultProjectId());
      if (!resolvedProjectId) return { items: [], total: 0 };
      const params = new URLSearchParams({
        project_id: resolvedProjectId,
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
  getDownloadInfo: async (reportId: string, format = "pdf"): Promise<ReportDownloadInfo | null> => {
    if (IS_MOCK)
      return {
        report_id: reportId,
        format,
        download_url: "#",
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      };
    try {
      const { data } = await apiClient.get(`/reports/${reportId}/download?format=${format}`);
      return data;
    } catch (error) {
      console.warn("reportApi.getDownloadInfo failed.", error);
      return null;
    }
  },
};

/* ─── Assistant ─── */
export interface AssistantChatResponse {
  answer: string;
  evidence: { label: string; value: string }[];
  confidence: number;
  session_id?: string;
}

const MOCK_CHAT_RESPONSES = [
  "갤럭시 S25 시뮬레이션 결과, 테크 얼리어답터 세그먼트에서 구매 의향이 가장 높게 나타났습니다(평균 4.2점). AI 카메라 기능이 핵심 구매 동기로 확인됐습니다.",
  "가성비 추구형 세그먼트는 139만원의 출시 가격에 민감하게 반응했습니다. 할부 프로그램 도입 시 구매 의향이 약 23%p 상승할 것으로 예측됩니다.",
  "브랜드 충성고객 세그먼트는 갤럭시 생태계(워치, 버즈, 탭) 연동을 높이 평가하며 경쟁사 대비 우위를 인정했습니다. NPS 점수는 67로 산업 평균을 상회합니다.",
  "시뮬레이션 응답 681건을 분석한 결과, '야간모드'와 'AI 카메라'가 키워드 빈도 1·2위를 차지했습니다. 콘텐츠 마케팅에서 해당 기능을 전면에 내세울 것을 권장합니다.",
];
let _mockChatIdx = 0;

export const assistantApi = {
  chat: async (
    message: string,
    messages: { role: string; message: string }[],
    projectId?: string | null
  ): Promise<AssistantChatResponse | null> => {
    if (IS_MOCK) {
      await new Promise((r) => setTimeout(r, 900));
      return {
        answer: MOCK_CHAT_RESPONSES[_mockChatIdx++ % MOCK_CHAT_RESPONSES.length],
        evidence: [
          { label: "시뮬레이션 응답 수", value: "681건" },
          { label: "신뢰도", value: "94%" },
        ],
        confidence: 0.94,
      };
    }
    try {
      const resolvedProjectId = projectId ?? (await resolveDefaultProjectId());
      const { data } = await apiClient.post("/assistant/chat", {
        message,
        messages,
        project_id: resolvedProjectId,
      });
      return data;
    } catch (error) {
      console.warn("assistantApi.chat failed.", error);
      return null;
    }
  },
};

/* ─── Gemini Enhancements ─── */
export interface SegmentNarrativeResponse {
  narrative: string;
}

export interface SurveyQualityCheckResponse {
  score: number;
  issues: string[];
  strengths: string[];
  suggestion: string;
}

export interface CrossSegmentSummaryResponse {
  summary: string;
  segment_highlights: { segment: string; key_finding: string }[];
  notable_pattern: string;
}

export const geminiApi = {
  getSegmentNarrative: async (payload: {
    project_id: string;
    filter_summary: string;
    segments: { name: string; count: number }[];
    target_count: number;
  }): Promise<SegmentNarrativeResponse | null> => {
    try {
      const { data } = await apiClient.post("/segments/narrative", payload);
      return data;
    } catch (error) {
      console.warn("geminiApi.getSegmentNarrative failed.", error);
      return null;
    }
  },
  checkSurveyQuality: async (projectId: string): Promise<SurveyQualityCheckResponse | null> => {
    try {
      const { data } = await apiClient.post(`/surveys/${projectId}/quality-check`);
      return data;
    } catch (error) {
      console.warn("geminiApi.checkSurveyQuality failed.", error);
      return null;
    }
  },
  getCrossSegmentSummary: async (projectId: string): Promise<CrossSegmentSummaryResponse | null> => {
    try {
      const { data } = await apiClient.get(`/simulations/cross-segment-summary?project_id=${projectId}`);
      return data;
    } catch (error) {
      console.warn("geminiApi.getCrossSegmentSummary failed.", error);
      return null;
    }
  },
  recommendFilters: async (projectId: string): Promise<ResearchRecommendationResponse | null> => {
    try {
      const { data } = await apiClient.get(`/segments/recommend-filters?project_id=${projectId}`);
      return data;
    } catch (error) {
      console.warn("geminiApi.recommendFilters failed.", error);
      return null;
    }
  },
  getMarketingActionPlan: async (reportId: string): Promise<ActionPlanResponse | null> => {
    try {
      const { data } = await apiClient.post(`/reports/${reportId}/action-plan`);
      return data;
    } catch (error) {
      console.warn("geminiApi.getMarketingActionPlan failed.", error);
      return null;
    }
  },
};

export interface ResearchRecommendationResponse {
  recommendation: string;
  suggested_filters: {
    age_ranges?: string[];
    regions?: string[];
    keywords?: string[];
  };
  rationale: string;
}

export interface ActionPlanResponse {
  period: string;
  phases: { week: string; action: string; channel: string }[];
  priority_segments: string[];
  budget_allocation: string;
}

/* ─── Settings ─── */
export interface PromptSettingsResponse {
  prompt_type: string;
  prompt: string;
}

export interface LlmParameterResponse {
  temperature: number;
  top_p: number;
}

export interface SurveyTemplateSetting {
  prompt: string;
  temperature: number;
  top_p: number;
  model: string;
  reasoning_effort: "low" | "medium" | "high";
  deep_research: boolean;
  allow_external_data: boolean;
  allow_third_party_data: boolean;
  use_project_context: boolean;
  use_segment_context: boolean;
}

export interface SurveyTemplateSettingsBundle {
  templates: Record<string, SurveyTemplateSetting>;
  updated_at?: string;
}

export interface SeoSettings {
  enabled: boolean;
  scope: string[];
  locale: {
    language: string;
    country: string;
  };
  meta: {
    title_template: string;
    description_template: string;
    canonical_base_url: string;
    og_image_mode: "default" | "per-project" | "manual";
  };
  keywords: {
    manual_keywords: string[];
    ai_extraction_enabled: boolean;
    excluded_keywords: string[];
    brand_priority: boolean;
  };
  content_policy: {
    summary_length: "short" | "medium" | "long";
    auto_headings: boolean;
    faq_block: boolean;
    structured_data: boolean;
  };
  publishing: {
    auto_publish: boolean;
    approval_required: boolean;
  };
}

export interface GeoSettings {
  enabled: boolean;
  default_market: string;
  included_regions: string[];
  excluded_regions: string[];
  sampling: {
    weights: { region: string; ratio: number; min_sample?: number }[];
    rebalance_enabled: boolean;
  };
  localization: {
    auto_translation: boolean;
    cultural_filter_enabled: boolean;
    locale_format: {
      currency: string;
      measurement: "metric" | "imperial";
      date_format: string;
    };
  };
  apply_to: {
    survey_generation: boolean;
    persona_generation: boolean;
    simulation: boolean;
    report_rendering: boolean;
  };
}

export const settingsApi = {
  getPrompt: async (promptType: string): Promise<PromptSettingsResponse | null> => {
    try {
      const { data } = await apiClient.get(`/settings/prompts/${promptType}`);
      return data;
    } catch (error) {
      console.warn("settingsApi.getPrompt failed.", error);
      return null;
    }
  },
  savePrompt: async (promptType: string, prompt: string): Promise<PromptSettingsResponse | null> => {
    try {
      const { data } = await apiClient.put("/settings/prompts", {
        prompt_type: promptType,
        prompt,
      });
      return data;
    } catch (error) {
      console.warn("settingsApi.savePrompt failed.", error);
      return null;
    }
  },
  getLlmParameters: async (): Promise<LlmParameterResponse | null> => {
    try {
      const { data } = await apiClient.get("/settings/llm-parameters");
      return data;
    } catch (error) {
      console.warn("settingsApi.getLlmParameters failed.", error);
      return null;
    }
  },
  saveLlmParameters: async (payload: LlmParameterResponse): Promise<LlmParameterResponse | null> => {
    try {
      const { data } = await apiClient.put("/settings/llm-parameters", payload);
      return data;
    } catch (error) {
      console.warn("settingsApi.saveLlmParameters failed.", error);
      return null;
    }
  },
  getJsonSetting: async <T extends object>(key: string): Promise<T | null> => {
    try {
      const { data } = await apiClient.get(`/settings/kv/${key}`);
      return (data?.value ?? {}) as T;
    } catch (error) {
      console.warn("settingsApi.getJsonSetting failed.", error);
      return null;
    }
  },
  saveJsonSetting: async <T extends object>(key: string, value: T): Promise<T | null> => {
    try {
      const { data } = await apiClient.put("/settings/kv", { key, value });
      return (data?.value ?? {}) as T;
    } catch (error) {
      console.warn("settingsApi.saveJsonSetting failed.", error);
      return null;
    }
  },
  getSurveyTemplateSettings: async (): Promise<SurveyTemplateSettingsBundle | null> =>
    settingsApi.getJsonSetting<SurveyTemplateSettingsBundle>("survey_template_settings"),
  saveSurveyTemplateSettings: async (
    value: SurveyTemplateSettingsBundle
  ): Promise<SurveyTemplateSettingsBundle | null> => settingsApi.saveJsonSetting("survey_template_settings", value),
  getSeoSettings: async (): Promise<SeoSettings | null> => settingsApi.getJsonSetting<SeoSettings>("seo_policy"),
  saveSeoSettings: async (value: SeoSettings): Promise<SeoSettings | null> =>
    settingsApi.saveJsonSetting("seo_policy", value),
  getGeoSettings: async (): Promise<GeoSettings | null> => settingsApi.getJsonSetting<GeoSettings>("geo_policy"),
  saveGeoSettings: async (value: GeoSettings): Promise<GeoSettings | null> =>
    settingsApi.saveJsonSetting("geo_policy", value),
};
