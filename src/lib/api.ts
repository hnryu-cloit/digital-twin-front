import axios from "axios";

// 백엔드 FastAPI 기본 URL (로컬 개발 환경 기준)
export const apiClient = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 3000,
});

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
export const fetchIndividualPersonas = async (): Promise<Persona[]> => {
  try {
    const { data } = await apiClient.get("/v1/personas?page=1&size=100");
    return data.items || [];
  } catch (error) {
    console.warn("fetchIndividualPersonas failed, returning empty.", error);
    return [];
  }
};

export const projectApi = {
  getProjects: async (page = 1, size = 10): Promise<ProjectListResponse> => {
    try {
      const { data } = await apiClient.get(`/v1/projects?page=${page}&size=${size}`);
      return data;
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
