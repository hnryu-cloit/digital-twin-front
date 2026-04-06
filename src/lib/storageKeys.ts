export const STORAGE_KEYS = {
  /** axios 인터셉터 및 일반 API 요청에 사용하는 액세스 토큰 */
  ACCESS_TOKEN: "dt_access_token",
  /** SSE 스트리밍(fetch 기반) 요청에 사용하는 액세스 토큰 */
  SESSION_TOKEN: "access_token",
  /** 현재 선택된 프로젝트 이름 (Layout 표시용) */
  CURRENT_PROJECT_NAME: "currentProjectName",
  /** 현재 선택된 프로젝트 ID (워크플로우 네비게이션용) */
  CURRENT_PROJECT_ID: "currentProjectId",
} as const;