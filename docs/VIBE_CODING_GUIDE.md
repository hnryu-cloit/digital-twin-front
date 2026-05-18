# Frontend 코딩 가이드

## 목적

이 문서는 `digital-twin-front` 레포지토리의 폴더 구조, 파일 배치 기준, 네이밍 규칙을 일관되게 유지하기 위한 가이드이다.

목표:
- 파일 책임을 명확하게 분리한다.
- 신규 파일 추가 시 팀원마다 다른 기준으로 위치를 결정하지 않도록 한다.
- AI를 활용한 코드 생성 및 리팩토링 시에도 동일한 구조 원칙을 유지한다.

---

## 커밋 전 QA 체크리스트

커밋 실행 전 반드시 아래 항목을 순서대로 실행하고 **모두 통과한 뒤** 커밋한다.

```bash
# 1. Prettier 포맷 검사
npx prettier --check "src/**/*.{ts,tsx}"

# 2. TypeScript 타입 검사
npx tsc --noEmit

# 3. ESLint 코드 컨벤션 검사
npm run lint
```

- Prettier 포맷 불일치 0개 확인 (불일치 시 `npx prettier --write "src/**/*.{ts,tsx}"` 실행 후 재확인)
- `tsc --noEmit` 오류 0개 확인
- ESLint 오류(error) 0개 확인 (warning은 허용)

---

## 커밋 규칙

- 커밋 타이틀과 본문은 **한글**로 작성한다.
- 변경사항을 **의미 단위로 분리**하여 커밋한다 (컴포넌트, 훅, API 레이어, 타입, 설정 등).
- 커밋 메시지 마지막에 **Co-authored-by 줄을 절대 추가하지 않는다**.
- 이전 커밋 메시지의 스타일(형식, 어조)을 참고하여 일관성을 유지한다.
- 가상환경 디렉터리(`.venv`, `.venv311` 등), 바이너리 산출물(`artifacts/`)은 커밋하지 않는다.

---

## 기본 원칙

### 1. 파일은 역할에 맞는 위치에 둔다

| 역할 | 위치 |
|---|---|
| 라우트 진입점 페이지 | `src/pages/` |
| 도메인 전용 UI 컴포넌트 | `src/components/{domain}/` |
| shadcn/ui primitive | `src/components/ui/` |
| 공유 커스텀 훅 | `src/hooks/` |
| API 호출 함수 | `src/lib/api.ts` (도메인 객체) |
| localStorage 키 상수 | `src/lib/storageKeys.ts` |
| 공용 유틸 함수 | `src/lib/utils.ts` |
| 여러 컴포넌트 공유 상수 | `src/constants/` |

### 2. barrel export는 사용하지 않는다

- `index.ts`를 통해 export를 모아두지 않는다.
- import 경로가 길어지더라도 명시적인 파일 경로 import를 사용한다.

### 3. API 함수명은 HTTP 메서드 기준으로 작성한다

| HTTP | 함수명 접두어 |
|---|---|
| GET | `get...` |
| POST | `post...` |
| PUT | `put...` |
| PATCH | `patch...` |
| DELETE | `delete...` |

`fetch`, `create`, `save`, `load` 혼합 규칙은 사용하지 않는다.

예시: `getProjects`, `postGeneratePersona`, `patchProjectSettings`, `deleteReport`

### 4. 폴더 구조보다 배치 기준이 더 중요하다

같은 이름의 폴더를 만든다고 해서 구조가 정리되는 것이 아니다.
각 파일이 **왜 그 위치에 있어야 하는지** 설명 가능해야 한다.

---

## 권장 루트 구조

```text
src
├── assets
├── components
│   ├── ui                  (shadcn/ui 전용)
│   ├── layout              (공통 레이아웃: Header, Sidebar, FloatingAiChat 등)
│   ├── home                (홈 화면 전용 컴포넌트)
│   └── {domain}            (도메인 전용 컴포넌트)
├── constants               (여러 컴포넌트가 공유하는 상수)
├── hooks                   (공유 커스텀 훅)
├── lib
│   ├── api.ts              (API 호출 — 도메인 객체 방식)
│   ├── storageKeys.ts      (localStorage/sessionStorage 키 상수)
│   └── utils.ts            (공용 유틸)
└── pages                   (라우트 진입점)
    ├── DashboardPage.tsx
    ├── PersonaManagerPage.tsx
    └── ...
```

---

## UI 디자인 불변 원칙

- **UI 디자인(레이아웃, 색상, 간격, 폰트, 컴포넌트 외형)은 리팩토링 중 절대 변경하지 않는다.**
- 리팩토링 범위는 코드 구조, 타입 안전성, 로직 분리에 한정한다.
- 기존 TailwindCSS 클래스, Radix UI 컴포넌트 구성, shadcn/ui 스타일은 그대로 유지한다.

---

## pages/ 가이드

`pages/`는 라우팅 진입점이다. 화면 조합과 상태 조율만 담당한다.

원칙:
- page 파일에는 데이터 조회, 상태 조합, 컴포넌트 배치 정도만 남긴다.
- 화면의 각 구역은 `components/{domain}/` 아래 별도 파일로 분리한다.
- page 내부에서 컴포넌트를 직접 정의하지 않는다.

잘못된 예시:
```tsx
// DashboardPage.tsx 안에 모두 구현
function DashboardPage() {
  // 필터, 차트, 카드, 모달 JSX를 모두 이 파일에서 선언
}
```

올바른 예시:
```tsx
// DashboardPage.tsx
function DashboardPage() {
  return (
    <Layout>
      <SegmentFilterBar ... />
      <PersonaSummaryCards ... />
      <SegmentChartSection ... />
    </Layout>
  );
}
```

---

## components/ 가이드

### components/ui — shadcn/ui 전용

shadcn CLI로 추가되는 primitive 컴포넌트만 둔다.

넣어도 되는 것: `button.tsx`, `dialog.tsx`, `input.tsx`, `dropdown-menu.tsx`, `sheet.tsx`

넣으면 안 되는 것:
- 직접 만든 비즈니스 컴포넌트
- 도메인 로직이 섞인 UI 컴포넌트

### components/{domain} — 도메인 전용

특정 도메인 또는 화면 구역에 속하는 컴포넌트를 모은다.

예시:
```text
components
├── layout
│   ├── AppSidebar.tsx
│   ├── Header.tsx
│   └── FloatingAiChat.tsx
├── home
│   └── ProjectCard.tsx
└── persona
    ├── PersonaCard.tsx
    └── PersonaEditModal.tsx
```

---

## hooks/ 가이드

2개 이상의 page/component에서 반복되는 상태 로직은 `src/hooks/` 아래 커스텀 훅으로 추출한다.

예시:
- 프로젝트 로드 패턴 → `useProject(projectId?)`
- 폴링/자동 갱신 → `useAutoRefresh(fn, intervalMs)`
- 모달 open/close 상태 → `useModal<T>()`
- 필터 상태 묶음 → `useFilters<T>(initialState)`

`resolveDefaultProjectId()` 같은 전역 프로젝트 로드 로직은 page에서 직접 호출하지 않고 `useProject()` 훅을 사용한다.

---

## lib/api.ts 가이드

모든 API 호출은 `src/lib/api.ts`의 도메인별 객체를 통해서만 한다.

원칙:
- page/component에서 `apiClient`를 직접 import하지 않는다.
- API 함수에서 에러를 묵음(`catch` 후 빈 배열·null 반환)하지 않는다 → `console.warn` 또는 `console.error`로 반드시 로그를 남긴다.

```ts
// 올바른 구조
export const personaApi = {
  getPersonas: (projectId: string) => apiClient.get(...),
  postGeneratePersona: (req: GeneratePersonaRequest) => apiClient.post(...),
  deletePersona: (personaId: string) => apiClient.delete(...),
};

// 잘못된 구조
// page에서 apiClient를 직접 import해 사용하는 것
```

---

## lib/storageKeys.ts 가이드

localStorage/sessionStorage 접근 키는 반드시 `storageKeys.ts`의 상수를 참조한다.
문자열 리터럴을 코드에 직접 사용하지 않는다.

```ts
// 올바른 사용
import { STORAGE_KEYS } from "@/lib/storageKeys";
localStorage.setItem(STORAGE_KEYS.SELECTED_PROJECT_ID, id);

// 잘못된 사용
localStorage.setItem("selectedProjectId", id);
```

---

## 상수 및 설정값 관리

- 컴포넌트 내부에서 렌더링마다 재생성되는 배열·객체 상수는 컴포넌트 밖 모듈 스코프에 선언한다.
- 색상 매핑, 세그먼트 스타일 등 여러 컴포넌트가 공유하는 상수는 `src/constants/` 아래 파일로 분리한다.
- API base URL 등 환경별 설정값은 `import.meta.env.VITE_*` 환경 변수로 관리하고 `.env.example`에 반영한다.

---

## 네이밍 규칙

### 파일명

| 종류 | 규칙 | 예시 |
|---|---|---|
| 페이지 컴포넌트 | `PascalCase + Page.tsx` | `DashboardPage.tsx` |
| UI 컴포넌트 | `PascalCase.tsx` | `PersonaCard.tsx`, `SegmentFilterBar.tsx` |
| 커스텀 훅 | `use + PascalCase.ts` | `useProject.ts`, `useModal.ts` |
| 유틸 함수 | `camelCase.ts` | `formatDate.ts` |
| 상수 파일 | `camelCase.ts` | `storageKeys.ts` |

### 컴포넌트 정의 방식

파일 내에서 `export function Foo()` 또는 `export const Foo: React.FC<Props>` 중 하나로 통일한다.
인라인 props 타입 대신 별도 `interface XxxProps { ... }`를 선언한다.

---

## 타입 안전성 규칙

- `any` 타입 사용 금지. 불가피한 경우 `// eslint-disable-next-line @typescript-eslint/no-explicit-any` 주석과 이유 명시
- API 응답 타입은 `src/lib/api.ts`의 인터페이스를 재사용. page 내부에 동일 구조 중복 정의 금지
- 타입 단언(`as`)보다 타입 가드나 `satisfies`를 우선 사용

---

## import 규칙

- `@/` alias를 사용한다.
- `import { X } from"@/..."` 형태(따옴표 앞 공백 누락)를 사용하지 않는다 → `from "@/..."` 형태로 작성한다.
- `import type { X }` 구문으로 타입 전용 import를 구분한다.
- 아이콘 등 대량 import는 알파벳순으로 정렬한다.

```ts
// 올바른 예시
import { personaApi } from "@/lib/api";
import type { Persona } from "@/lib/api";
import { useProject } from "@/hooks/useProject";
import { PersonaCard } from "@/components/persona/PersonaCard";
```

---

## 파일 배치 판단 기준

아래 순서대로 판단한다.

1. 이 컴포넌트/훅/함수는 단일 도메인에서만 사용되는가?
   - 예 → `components/{domain}/` 또는 해당 hook에 둔다.
2. 두 개 이상의 도메인에서 재사용되는가?
   - 예 → `hooks/` (훅) 또는 `lib/utils.ts` (유틸)로 이동 검토
3. 라우트 진입점인가?
   - 예 → `pages/`
4. shadcn CLI로 추가된 primitive인가?
   - 예 → `components/ui/`

---

## AI 리팩토링 작업 시 주의사항

- 파일을 이동하기 전에 실제 사용처를 먼저 분석할 것
- `index.ts`는 생성하지 말 것
- import 문은 실제 파일 경로 기준으로 수정할 것
- UI 디자인(레이아웃, 색상, 간격, 폰트)은 리팩토링 중 절대 변경하지 않는다
- 기능 동작을 깨지 않도록 영향 범위를 함께 점검할 것

---

## 작업 원칙

### README 업데이트

모든 작업사항에 대해 `digital-twin-front/README.md`를 업데이트한다.

### Feature List 업데이트

작업 세션 완료 이후 `feature list/digital-twin-front.csv`를 업데이트한다.

### QA 운영 지침

- QA 관련 기준 문서: `docs/qa/qa-guide.md`
- QA 항목 목록: `docs/qa/qa-master.csv`
- QA 실행 이력: `docs/qa/qa-run-log.csv`
- QA 담당자는 코드를 수정하지 않는다.
- `FAIL` 발생 시 `qa-run-log.csv`에 QA ID, 재현 절차, 실제결과, 기대결과, 증적 링크를 기록한다.

### 코딩 가이드 업데이트 규칙

아래 사항이 발생하면 해당 세션 종료 전에 이 문서를 반드시 업데이트한다.

- 새로운 패턴 또는 네이밍 규칙이 도입된 경우
- 계층 구조나 파일 배치 기준이 변경된 경우
- 일회성 예외가 아니라 앞으로도 반복 적용될 규칙인 경우

---

## 서비스 포트

| 서비스 | 개발 포트 |
|---|---|
| digital-twin-front | 5173 |

---

## 작업 선호

- 병렬로 진행 가능한 항목은 우선 분리해서 동시에 수행한다.
- 병렬 작업 시 agent별 파일 소유 범위를 먼저 고정하고, 메인에서 통합과 검증을 담당한다.

---

## 최종 정리

> `pages/`는 라우트 진입점, `components/{domain}/`은 UI 구역, `hooks/`는 공유 상태 로직, `lib/`는 API·유틸·설정이다.

- `components/ui`: shadcn/ui primitive 전용
- `pages/`: 화면 배치와 상태 조합만
- API 호출: `lib/api.ts` 도메인 객체를 통해서만
- storageKeys: `lib/storageKeys.ts` 상수 참조 필수
- barrel export(`index.ts`) 사용 금지
- API 함수명: `get/post/put/patch/delete + 대상명`