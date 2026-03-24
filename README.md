# Digital Twin Front

> **⚠️ 전역 시스템 제약조건 및 코드 컨벤션**
> 본 프로젝트는 엔터프라이즈 B2B SaaS 아키텍처를 지향하며, 엄격한 코드 컨벤션을 따릅니다.
> 자세한 사항은 루트 디렉토리의 [`docs/conventions.md`](../docs/conventions.md)를 반드시 확인하세요.
> 주요 프론트엔드 제약: **Feature-Sliced Design, React Query 필수 사용, Strict TypeScript**

디지털 트윈 기반 가상 페르소나 리서치용 프론트엔드입니다.
React + TypeScript 기반 SPA로, 분석 워크플로우(세그먼트 분석 → 설문 설계 → 실시간 응답 분석 → 리포트)를 백엔드 SQLite DB와 연동하여 제공합니다.

---

## 전체 시스템 구조

```text
[Frontend (본 레포)]  ──►  [Backend API]  ──►  [SQLite DB]
     :5173               localhost:8000/api      digital_twin.db
```

- **Frontend** (본 레포): React SPA
- **API 클라이언트**: `src/lib/api.ts` — Axios 기반, JWT 자동 발급·갱신 인터셉터
- **Backend**: `digital-twin-backend` (FastAPI + SQLite)
- **인증**: 앱 최초 호출 시 어드민 계정으로 자동 로그인, 401 시 토큰 재발급

---

## 기술 스택

| 분류 | 라이브러리 | 버전 |
|------|-----------|------|
| Framework | React | 18.3.1 |
| Language | TypeScript | 5.6.x |
| Build Tool | Vite | 6.3.5 |
| Routing | react-router | 7.13.0 |
| Styling | Tailwind CSS | 4.1.12 |
| Charts | Recharts | 2.15.2 |
| UI Primitive | Radix UI | 1.1~2.2 |
| Icons | Lucide React | 0.487.0 |
| Utility | clsx + tailwind-merge | 2.1.1 / 3.2.0 |

---

## 코드 컨벤션

### ESLint
- `eslint/config`의 `defineConfig` + `globalIgnores` 방식 (flat config)
- `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` 모두 flat config `extends` 방식으로 적용

### TypeScript (`tsconfig.app.json`)
- `strict: true`
- `noUnusedLocals: true` — 미사용 변수 에러 처리
- `noUnusedParameters: true` — 미사용 파라미터 에러 처리
- `erasableSyntaxOnly: true`
- `noFallthroughCasesInSwitch: true`
- `noUncheckedSideEffectImports: true`

---

## 시작하기

### 사전 요구사항

- Node.js 20+
- npm

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 린트
npm run lint
```

### 사전 요구사항

백엔드 서버가 `http://localhost:8000`에서 실행 중이어야 합니다.

```bash
# digital-twin-backend 실행
cd ../digital-twin-backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

### 환경변수 (`.env`)

현재 코드에서 `import.meta.env` 사용이 없어 **필수 환경변수가 없습니다**.
API Base URL 변경이 필요하면 `src/lib/api.ts`의 `baseURL`을 수정하세요.

---

## 화면 구성

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | HomePage | 프로젝트 시작, 최근 활동, 템플릿 라이브러리, 생성 위저드 |
| `/analytics` | DashboardPage | 세그먼트 필터링 및 분포/지표 차트 대시보드 |
| `/survey` | SurveyChatPage | AI 설문 에이전트 채팅 + 문항 리스트 편집 |
| `/live` | LiveAnalysisPage | 실시간 응답 피드/문항별 분포/CoT 검증 모달 |
| `/report` | ReportPage | 최종 리포트, 섹션 네비게이션, 다운로드 포맷 선택 |
| `/persona` | PersonaManagerPage | 페르소나 카드/리스트 관리, 상세 프로필 모달 |
| `/reports` | ReportHistoryPage | 리포트 아카이브 목록 및 개별 다운로드 |
| `/settings` | SettingsPage | 엔터프라이즈 관리자 콘솔(사용자/보안/데이터/AI최적화 등) |

---

## 주요 기능

### 공통 레이아웃
- 고정 헤더 + 좌측 사이드바 + 콘텐츠 영역 레이아웃
- 현재 경로 기반 breadcrumb 표시
- 사이드바 접기/펼치기 및 사용자 메뉴 팝업

### 분석 워크플로우
- 세그먼트 분석 필터 패널 및 차트 시각화
- 설문 에이전트 대화형 문항 편집(추가/수정/삭제/페이지네이션)
- 실시간 응답 스트림 시뮬레이션 및 CoT 상세 확인
- 인사이트 중심 최종 리포트와 포맷별 다운로드 UI

### 엔터프라이즈 관리자 콘솔 (B2B SaaS)
- **전사 리서치 프로젝트 관리**: 진행 중인 전체 설문 리서치 프로젝트 마스터 뷰 및 항목별 데이터 소스 매핑 상태 확인
- **데이터 소스 및 스키마 커넥터**: 시스템/외부 데이터 소스 스키마 항목 노출 및 프로젝트 매핑, 데이터 동기화 상태/품질 모니터링
- **AI 프롬프트 및 대화 히스토리 (감사 로그)**: 사용자가 각 페이지에서 AI 어시스턴트/챗봇과 나눈 질의응답 로그 및 프롬프트 히스토리 조회
- **사용자 및 역할 관리 (권한 제어)**: 운영자/분석가/뷰어 등 역할별 상세 접근 권한(Data Access) 매트릭스 및 민감 데이터 통제
- **페르소나 응답 검증 이력 (CoT 로그)**: 가상 페르소나 응답 산출 시 사용된 추론 과정(Chain of Thought) 및 품질 검증 이력 아카이브
- **보안 및 규정 준수**: SSO 연동, IP 화이트리스트, 2FA 강제, 리스크 스코어링 대시보드

### 보조 인터랙션
- 전역 플로팅 AI 챗봇
- 공통 페이지네이션 컴포넌트
- 각 페이지별 모달/드롭다운/탭/토글 인터랙션

---

## 프로젝트 구조

```text
src/
├── assets/                    # 로고/파비콘
├── components/
│   ├── figma/                 # 이미지 fallback 컴포넌트
│   ├── layout/                # Layout, WorkflowStepper, FloatingAiChat
│   └── ui/                    # 공통 UI 컴포넌트(Radix 기반 포함)
├── lib/                       # 공용 유틸(cn)
├── pages/                     # 라우트 페이지
│   ├── HomePage.tsx
│   ├── DashboardPage.tsx
│   ├── SurveyChatPage.tsx
│   ├── LiveAnalysisPage.tsx
│   ├── ReportPage.tsx
│   ├── PersonaManagerPage.tsx
│   ├── ReportHistoryPage.tsx
│   └── SettingsPage.tsx
├── App.tsx                    # 라우팅 정의
└── main.tsx                   # 엔트리 포인트

styles/
├── index.css                  # 글로벌 스타일 진입점
├── theme.css                  # 테마 토큰
├── tailwind.css               # Tailwind 레이어
└── fonts.css                  # 폰트 설정
```

---

## 아키텍처

### 라우팅
- `react-router v7` 사용
- `Layout` 하위에 업무 페이지 라우트 구성
- 현재는 별도 404 라우트 없이 정의된 경로 중심 운영

### 상태 관리
- 전역 상태 라이브러리 없이 `useState` 기반 로컬 상태 중심
- 페이지 단위로 모달/드롭다운/필터/채팅 상태 관리
- 서버 데이터는 `@tanstack/react-query` (`useQuery`) 로 캐싱

### API 연동 (`src/lib/api.ts`)

#### 공통 인프라
- `apiClient`: Axios 인스턴스, `baseURL: http://localhost:8000/api`
- **자동 인증 인터셉터**: 첫 요청 시 `POST /api/auth/login` 으로 JWT 취득 → `localStorage` 캐싱
- **401 재발급**: 토큰 만료 시 자동 재로그인 후 원본 요청 재시도
- **필드 매핑**: 백엔드 응답(`name`, `response_count`, `updated_at`) → 프론트 인터페이스(`title`, `responses`, `updatedAt`) 변환
- **폴백 전략**: 모든 API 호출은 `try/catch`로 감싸져 있어 실패 시 목업 데이터로 자동 전환

#### API 객체 목록

| 객체 | 엔드포인트 | 사용 페이지 |
|------|-----------|------------|
| `projectApi.getProjects()` | `GET /projects` | HomePage |
| `personaApi.getPersonas()` | `GET /personas` | DashboardPage, PersonaManagerPage |
| `surveyApi.getQuestions(projectId)` | `GET /surveys/{id}/questions` | SurveyChatPage |
| `simulationApi.getProgress(projectId)` | `GET /simulations/progress` | LiveAnalysisPage |
| `simulationApi.getFeed(projectId)` | `GET /simulations/feed` | LiveAnalysisPage |
| `simulationApi.control(projectId, action)` | `POST /simulations/control` | LiveAnalysisPage |
| `reportApi.getReport(reportId)` | `GET /reports/{id}` | ReportPage |
| `reportApi.listReports(projectId)` | `GET /reports` | ReportHistoryPage |

#### 페이지별 연동 방식

| 페이지 | 연동 방식 | 폴백 |
|--------|----------|------|
| `HomePage` | `useQuery` (React Query) | 목업 프로젝트 목록 |
| `DashboardPage` | `useEffect` + `useState` | 빈 배열 |
| `PersonaManagerPage` | `useEffect` + `useState` | `RAW_PERSONAS` 목업 |
| `SurveyChatPage` | `useEffect` (마운트 1회) | `INITIAL_QUESTIONS` 목업 |
| `LiveAnalysisPage` | `useEffect` (마운트 1회) | `MOCK_FEED` / 하드코딩 수치 |
| `ReportPage` | `useEffect` (마운트 1회) | 하드코딩 KPI 값 |
| `ReportHistoryPage` | `useEffect` + `useMemo` (검색 필터) | `REPORT_ITEMS` 목업 |

### UI 시스템
- Tailwind CSS + CSS 토큰(`styles/theme.css`) 기반 스타일링
- `components/ui`에 Radix 기반 공통 컴포넌트 보유
- `cn()` 유틸로 `clsx` + `tailwind-merge` 조합 사용

---

## 개발 현황

| 항목 | 상태 |
|------|------|
| 공통 레이아웃/라우팅 구성 | ✅ 완료 |
| 분석 워크플로우 UI (분석/설문/실시간/리포트) | ✅ 완료 |
| 페르소나/리포트 관리 화면 | ✅ 완료 |
| API 클라이언트 (자동 인증 인터셉터) | ✅ 완료 |
| 홈 프로젝트 목록 DB 연동 | ✅ 완료 |
| 세그먼트 분석 페르소나 DB 연동 | ✅ 완료 |
| 페르소나 관리 DB 연동 | ✅ 완료 |
| 설문 페이지 DB 연동 (설문 문항 로드) | ✅ 완료 |
| 실시간 분석 페이지 DB 연동 (진행률·피드·제어) | ✅ 완료 |
| 리포트 페이지 DB 연동 (KPI 동적 로드) | ✅ 완료 |
| 리포트 히스토리 DB 연동 (목록 로드·검색) | ✅ 완료 |
| 테스트 코드 | 🔲 미구현 |

---

## 참고 파일

- `feature list/front.csv`
