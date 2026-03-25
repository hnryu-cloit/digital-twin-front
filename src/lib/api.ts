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
let _defaultProjectIdPromise: Promise<string | null> | null = null;

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
  target_responses: number;
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
      const { data } = await apiClient.get(`/projects?page=${page}&size=${size}`);
      const items: Project[] = (data.items ?? []).map(mapProject);
      return { items, page: data.page ?? page, size: data.size ?? size, total: data.total ?? items.length };
    } catch (error) {
      console.warn("projectApi.getProjects failed.", error);
      return { items: [], page, size, total: 0 };
    }
  },
  createProject: async (payload: ProjectCreatePayload): Promise<ProjectDetail | null> => {
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
    try {
      const { data } = await apiClient.get(`/projects/${projectId}`);
      return data;
    } catch (error) {
      console.warn("projectApi.getProject failed.", error);
      return null;
    }
  },
  getProjectOptions: async (): Promise<ProjectOption[]> => {
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
};

export const personaApi = {
  getPersonas: async (projectId: string | undefined, page = 1, size = 12, search = ""): Promise<PersonaListResponse> => {
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
};

export const segmentApi = {
  getFilterOptions: async (projectId?: string): Promise<SegmentFilterOptions | null> => {
    try {
      const resolvedProjectId = projectId ?? await resolveDefaultProjectId();
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
    try {
      const { data } = await apiClient.get("/surveys/templates");
      return data.items ?? [];
    } catch (error) {
      console.warn("surveyApi.getTemplates failed.", error);
      return [];
    }
  },
  getQuestions: async (projectId?: string): Promise<SurveyQuestion[]> => {
    try {
      const resolvedProjectId = projectId ?? await resolveDefaultProjectId();
      if (!resolvedProjectId) return [];
      const { data } = await apiClient.get(`/surveys/${resolvedProjectId}/questions`);
      return data.questions ?? [];
    } catch (error) {
      console.warn("surveyApi.getQuestions failed.", error);
      return [];
    }
  },
  getPreview: async (projectId?: string): Promise<SurveyDraftPreview | null> => {
    try {
      const resolvedProjectId = projectId ?? await resolveDefaultProjectId();
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
      const resolvedProjectId = projectId ?? await resolveDefaultProjectId();
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
      const resolvedProjectId = projectId ?? await resolveDefaultProjectId();
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
  listJobs: async (params?: {
    projectId?: string;
    jobType?: string;
  }): Promise<{ items: AIJob[]; total: number }> => {
    try {
      const query = new URLSearchParams();
      const resolvedProjectId = params?.projectId ?? await resolveDefaultProjectId();
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
    try {
      const { data } = await apiClient.get(`/ai/jobs/${jobId}`);
      return data;
    } catch (error) {
      console.warn("aiJobApi.getJob failed.", error);
      return null;
    }
  },
  cancelJob: async (jobId: string): Promise<AIJob | null> => {
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
    try {
      const resolvedProjectId = projectId ?? await resolveDefaultProjectId();
      if (!resolvedProjectId) return null;
      const { data } = await apiClient.get(`/simulations/progress?project_id=${resolvedProjectId}`);
      return data;
    } catch (error) {
      console.warn("simulationApi.getProgress failed.", error);
      return null;
    }
  },
  getFeed: async (projectId?: string, limit = 20): Promise<SimulationFeedItem[]> => {
    try {
      const resolvedProjectId = projectId ?? await resolveDefaultProjectId();
      if (!resolvedProjectId) return [];
      const { data } = await apiClient.get(`/simulations/feed?project_id=${resolvedProjectId}&limit=${limit}`);
      return data;
    } catch (error) {
      console.warn("simulationApi.getFeed failed.", error);
      return [];
    }
  },
  getDistribution: async (projectId: string | undefined, questionId: string): Promise<ResponseDistributionItem[]> => {
    try {
      const resolvedProjectId = projectId ?? await resolveDefaultProjectId();
      if (!resolvedProjectId) return [];
      const { data } = await apiClient.get(`/simulations/distribution?project_id=${resolvedProjectId}&question_id=${questionId}`);
      return data ?? [];
    } catch (error) {
      console.warn("simulationApi.getDistribution failed.", error);
      return [];
    }
  },
  getInsight: async (projectId: string | undefined, questionId: string): Promise<InsightResponse | null> => {
    try {
      const resolvedProjectId = projectId ?? await resolveDefaultProjectId();
      if (!resolvedProjectId) return null;
      const { data } = await apiClient.get(`/simulations/insight?project_id=${resolvedProjectId}&question_id=${questionId}`);
      return data;
    } catch (error) {
      console.warn("simulationApi.getInsight failed.", error);
      return null;
    }
  },
  getKeywords: async (projectId?: string): Promise<KeywordTrendItem[]> => {
    try {
      const resolvedProjectId = projectId ?? await resolveDefaultProjectId();
      if (!resolvedProjectId) return [];
      const { data } = await apiClient.get(`/simulations/keywords?project_id=${resolvedProjectId}`);
      return data ?? [];
    } catch (error) {
      console.warn("simulationApi.getKeywords failed.", error);
      return [];
    }
  },
  control: async (projectId: string | undefined, action: "start" | "stop"): Promise<void> => {
    try {
      const resolvedProjectId = projectId ?? await resolveDefaultProjectId();
      if (!resolvedProjectId) return;
      await apiClient.post("/simulations/control", { project_id: resolvedProjectId, action });
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
  sections: { id: string; title: string; content: string; evidence?: { label: string; value: string }[]; action?: string }[];
  kpis: { label: string; value: string }[];
  charts: { id: string; type: string; title: string; data?: Record<string, unknown>[] }[];
}

export interface ReportDownloadInfo {
  report_id: string;
  format: string;
  download_url: string;
  expires_at: string;
}

export const reportApi = {
  generateJob: async (payload: {
    project_id: string;
    report_type?: string;
  }): Promise<AIJob | null> => {
    try {
      const { data } = await apiClient.post("/reports/generate-job", payload);
      return data;
    } catch (error) {
      console.warn("reportApi.generateJob failed.", error);
      return null;
    }
  },
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
    projectId?: string,
    page = 1,
    size = 10,
    search?: string,
  ): Promise<{ items: ReportSummary[]; total: number }> => {
    try {
      const resolvedProjectId = projectId ?? await resolveDefaultProjectId();
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
    try {
      const { data } = await apiClient.get(`/reports/${reportId}/download?format=${format}`);
      return data;
    } catch (error) {
      console.warn("reportApi.getDownloadInfo failed.", error);
      return null;
    }
  },
};

/* ─── Settings ─── */
export interface PromptSettingsResponse {
  prompt_type: string;
  prompt: string;
}

export interface LlmParameterResponse {
  temperature: number;
  top_p: number;
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
  getSeoSettings: async (): Promise<SeoSettings | null> => settingsApi.getJsonSetting<SeoSettings>("seo_policy"),
  saveSeoSettings: async (value: SeoSettings): Promise<SeoSettings | null> => settingsApi.saveJsonSetting("seo_policy", value),
  getGeoSettings: async (): Promise<GeoSettings | null> => settingsApi.getJsonSetting<GeoSettings>("geo_policy"),
  saveGeoSettings: async (value: GeoSettings): Promise<GeoSettings | null> => settingsApi.saveJsonSetting("geo_policy", value),
};
