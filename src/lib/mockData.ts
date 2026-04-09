/**
 * 데모 시연용 목업 데이터
 * VITE_MOCK_MODE=true 환경에서 API 대신 사용됩니다.
 */
import type {
  Project,
  ProjectListResponse,
  ProjectDetail,
  ProjectOption,
  Persona,
  PersonaDetail,
  PersonaListResponse,
  AIJob,
  SurveyQuestion,
  SurveyDraftPreview,
  SurveyTemplate,
  SimulationProgress,
  SimulationFeedItem,
  ResponseDistributionItem,
  ResponseListResponse,
  InsightResponse,
  KeywordTrendItem,
  ReportSummary,
  ReportDetail,
  SegmentFilterOptions,
  QuestionStat,
} from "@/lib/api";

/* ─── 프로젝트 ─── */
export const MOCK_PROJECT_ID = "proj-001";
export const MOCK_PROJECT_ID_2 = "proj-002";
export const MOCK_PROJECT_ID_3 = "proj-003";

export const MOCK_PROJECTS: Project[] = [
  {
    id: MOCK_PROJECT_ID,
    title: "갤럭시 S25 고객 인식 조사",
    type: "브랜드 인식",
    status: "진행중",
    progress: 68,
    responses: 681,
    target: 1000,
    updatedAt: "2시간 전",
    createdAt: "2026-03-10",
    workflowStage: "simulation",
    tags: ["스마트폰", "MZ세대", "플래그십"],
  },
  {
    id: MOCK_PROJECT_ID_2,
    title: "삼성 TV Neo QLED 구매 의향 분석",
    type: "구매 의향",
    status: "완료",
    progress: 100,
    responses: 1200,
    target: 1200,
    updatedAt: "3일 전",
    createdAt: "2026-02-15",
    workflowStage: "report",
    tags: ["TV", "프리미엄", "홈엔터테인먼트"],
  },
  {
    id: MOCK_PROJECT_ID_3,
    title: "갤럭시 탭 S10 타겟 세그먼트 연구",
    type: "세그먼트 분석",
    status: "분석중",
    progress: 45,
    responses: 450,
    target: 1000,
    updatedAt: "1일 전",
    createdAt: "2026-03-25",
    workflowStage: "survey",
    tags: ["태블릿", "업무용", "크리에이터"],
  },
];

export const MOCK_PROJECT_LIST: ProjectListResponse = {
  items: MOCK_PROJECTS,
  page: 1,
  size: 10,
  total: 3,
};

export const MOCK_PROJECT_DETAIL: ProjectDetail = {
  id: MOCK_PROJECT_ID,
  name: "갤럭시 S25 고객 인식 조사",
  type: "브랜드 인식",
  purpose: "갤럭시 S25 출시에 앞서 MZ세대 및 주요 고객층의 브랜드 인식과 구매 의향을 파악한다.",
  description:
    "1,000명의 디지털 트윈 페르소나를 활용하여 갤럭시 S25의 핵심 기능(AI 카메라, 슬림 디자인, 배터리 개선)에 대한 반응과 경쟁사 대비 인식을 심층 분석합니다.",
  data_sources: ["CRM", "소셜미디어", "구매이력"],
  tags: ["스마트폰", "MZ세대", "플래그십"],
  status: "진행중",
  progress: 68,
  response_count: 681,
  target_responses: 1000,
  surveys_count: 1,
  reports_count: 0,
  persona_count: 120,
  created_by: "admin@samsung.com",
  created_at: "2026-03-10T09:00:00",
  updated_at: "2026-04-09T14:30:00",
};

export const MOCK_PROJECT_OPTIONS: ProjectOption[] = MOCK_PROJECTS.map((p) => ({
  id: p.id,
  name: p.title,
}));

/* ─── 페르소나 ─── */
const SEGMENTS = ["테크 얼리어답터", "실용주의 소비자", "가성비 추구형", "브랜드 충성고객", "신중한 비교구매자"];
const OCCUPATIONS = ["IT개발자", "디자이너", "마케터", "교사", "자영업자", "대학생", "회사원", "공무원"];
const REGIONS = ["서울", "경기", "인천", "부산", "대구", "광주", "대전"];
const CHANNELS = ["온라인", "오프라인", "모바일앱"];

function makePersona(i: number): Persona {
  const seg = SEGMENTS[i % SEGMENTS.length];
  const occ = OCCUPATIONS[i % OCCUPATIONS.length];
  const region = REGIONS[i % REGIONS.length];
  const gender = i % 3 === 0 ? "여성" : "남성";
  const age = 22 + (i % 30);
  return {
    id: `persona-${String(i).padStart(3, "0")}`,
    project_id: MOCK_PROJECT_ID,
    name: [
      "김민준",
      "이서연",
      "박지훈",
      "최수아",
      "정도윤",
      "강하은",
      "조민서",
      "윤지원",
      "장서준",
      "임나연",
      "한동현",
      "오채원",
      "서예준",
      "신지유",
      "권태양",
      "문소율",
      "남현우",
      "류아린",
      "안재혁",
      "배하늘",
    ][i % 20],
    segment: seg,
    keywords: [
      ["AI카메라", "야간모드", "슬림디자인"],
      ["배터리", "가성비", "내구성"],
      ["가격", "실용성", "AS"],
      ["삼성페이", "갤럭시생태계", "S펜"],
      ["스펙비교", "리뷰분석", "신중구매"],
    ][i % 5],
    age,
    gender,
    occupation: occ,
    occupation_category: ["IT/기술", "창작", "서비스", "교육", "비즈니스"][i % 5],
    region,
    household_type: ["1인가구", "신혼부부", "자녀있는가정", "대가족"][i % 4],
    preferred_channel: CHANNELS[i % 3],
    buy_channel: ["삼성닷컴", "쿠팡", "삼성스토어", "카카오쇼핑"][i % 4],
    product_group: ["갤럭시S시리즈", "갤럭시A시리즈", "갤럭시Z시리즈"][i % 3],
    churn_risk: ["낮음", "보통", "높음"][i % 3],
  };
}

export const MOCK_PERSONAS: Persona[] = Array.from({ length: 120 }, (_, i) => makePersona(i));

export function getMockPersonaPage(page: number, size: number, search = ""): PersonaListResponse {
  const filtered = search
    ? MOCK_PERSONAS.filter(
        (p) =>
          p.name.includes(search) ||
          p.segment.includes(search) ||
          p.occupation.includes(search) ||
          p.keywords.some((k) => k.includes(search))
      )
    : MOCK_PERSONAS;
  const start = (page - 1) * size;
  return {
    items: filtered.slice(start, start + size),
    page,
    size,
    total: filtered.length,
    view_mode: "card",
  };
}

export const MOCK_PERSONA_DETAIL: PersonaDetail = {
  ...MOCK_PERSONAS[0],
  profile:
    "김민준은 서울 마포구에 거주하는 28세 IT 개발자입니다. 최신 기술에 민감하고 스마트폰을 업무와 일상 모두에서 적극 활용합니다. 갤럭시 생태계 사용자로 S시리즈를 3년째 사용 중이며, 이번 S25의 AI 카메라 기능과 슬림 디자인에 높은 관심을 보입니다.",
  purchase_history: ["갤럭시 S22 Ultra (2022.03)", "갤럭시 버즈2 Pro (2022.09)", "갤럭시 워치5 (2023.01)"],
  individual_stories: [
    {
      index: 1,
      name: "갤럭시 S25 사전예약 검토",
      job: "S25 출시 정보 수집 및 사전예약 여부 결정",
      personality: "분석적이고 꼼꼼한 성향으로 구매 전 충분한 정보를 수집함",
      samsung_experience: "삼성 공식 앱의 S25 사전예약 페이지를 방문하여 스펙 비교표를 확인함",
    },
    {
      index: 2,
      name: "AI 카메라 기능 체험",
      job: "갤럭시 AI 카메라 기능의 실사용 가능성 평가",
      personality: "기술적 혁신에 관심이 높고 직접 체험 후 구매 결정을 선호함",
      samsung_experience: "삼성스토어에서 S25 체험 후 야간 모드 품질에 만족감 표현",
    },
  ],
  activity_logs: [
    "삼성닷컴 갤럭시 S25 페이지 방문 (3회)",
    "갤럭시 AI 카메라 리뷰 유튜브 시청",
    "커뮤니티 갤럭시 S25 vs iPhone 16 비교글 작성",
    "삼성멤버스 앱 S25 사전예약 알림 설정",
  ],
  cot: [
    "S25 출시 정보를 접하고 업그레이드 필요성 인식",
    "AI 카메라와 슬림 디자인이 핵심 구매 동기",
    "현재 S22와의 스펙 차이 비교 분석",
    "사전예약 혜택과 출시일 확인 후 구매 결정",
  ],
  purchase_intent: 85,
  marketing_acceptance: 72,
  brand_attitude: 88,
  score: { future_value: 91, churn_risk: 12 },
};

/* ─── 설문 ─── */
export const MOCK_SURVEY_TEMPLATES: SurveyTemplate[] = [
  {
    template_id: "tmpl-brand-awareness",
    template_version: 2,
    title: "브랜드 인식 조사",
    survey_type: "brand",
    description: "브랜드 인지도, 선호도, 경쟁사 대비 포지셔닝을 측정합니다.",
    recommended_question_count: 12,
    required_blocks: ["브랜드인지", "제품경험", "구매의향", "NPS"],
  },
  {
    template_id: "tmpl-purchase-intent",
    template_version: 1,
    title: "구매 의향 조사",
    survey_type: "purchase",
    description: "신제품에 대한 구매 의향과 구매 장벽을 파악합니다.",
    recommended_question_count: 10,
    required_blocks: ["제품인식", "구매의향", "가격민감도", "채널선호"],
  },
  {
    template_id: "tmpl-ux-feedback",
    template_version: 3,
    title: "UX 만족도 조사",
    survey_type: "ux",
    description: "제품/서비스 사용 경험과 만족도를 심층 측정합니다.",
    recommended_question_count: 15,
    required_blocks: ["사용성", "만족도", "개선요구", "추천의향"],
  },
];

export const MOCK_SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: "q-001",
    text: "갤럭시 S25를 구매할 의향이 얼마나 있으신가요?",
    type: "scale",
    order: 1,
    options: ["1", "2", "3", "4", "5"],
    status: "confirmed",
  },
  {
    id: "q-002",
    text: "갤럭시 S25에서 가장 매력적인 기능은 무엇인가요?",
    type: "single_choice",
    order: 2,
    options: ["AI 카메라", "슬림 디자인", "배터리 개선", "성능 향상", "갤럭시 AI 기능"],
    status: "confirmed",
  },
  {
    id: "q-003",
    text: "현재 사용 중인 스마트폰 브랜드는 무엇인가요?",
    type: "single_choice",
    order: 3,
    options: ["삼성 갤럭시", "애플 아이폰", "LG", "기타"],
    status: "confirmed",
  },
  {
    id: "q-004",
    text: "갤럭시 S25 출시 가격(예상 139만원)은 적절하다고 생각하시나요?",
    type: "scale",
    order: 4,
    options: ["1", "2", "3", "4", "5"],
    status: "confirmed",
  },
  {
    id: "q-005",
    text: "갤럭시 S25를 구매한다면 어떤 채널을 이용하시겠어요?",
    type: "single_choice",
    order: 5,
    options: ["삼성닷컴 공식몰", "삼성 직영 스토어", "통신사 대리점", "온라인 쇼핑몰(쿠팡 등)"],
    status: "confirmed",
  },
  {
    id: "q-006",
    text: "갤럭시 S25의 AI 카메라 기능(야간모드, 생성형 편집 등)에 대해 어떻게 생각하시나요?",
    type: "text",
    order: 6,
    status: "confirmed",
  },
  {
    id: "q-007",
    text: "경쟁 제품(iPhone 16) 대비 갤럭시 S25의 경쟁력을 평가해주세요.",
    type: "scale",
    order: 7,
    options: ["1", "2", "3", "4", "5"],
    status: "confirmed",
  },
  {
    id: "q-008",
    text: "삼성 갤럭시 브랜드에 대한 전반적인 만족도는 어느 정도인가요?",
    type: "scale",
    order: 8,
    options: ["1", "2", "3", "4", "5"],
    status: "confirmed",
  },
];

export const MOCK_SURVEY_PREVIEW: SurveyDraftPreview = {
  project_id: MOCK_PROJECT_ID,
  status: "confirmed",
  summary:
    "갤럭시 S25의 구매 의향, 핵심 기능 선호도, 가격 적정성, 브랜드 인식을 종합 측정하는 8문항 설문입니다. MZ세대 중심의 디지털 트윈 페르소나 1,000명을 대상으로 시뮬레이션을 진행합니다.",
  generation_meta: {
    question_count: 8,
    draft_count: 10,
    confirmed_count: 8,
    latest_job_id: "job-survey-001",
    user_prompt: "갤럭시 S25 출시 관련 구매 의향과 브랜드 인식 조사",
    template_id: "tmpl-brand-awareness",
    template_version: 2,
    segment_source: "디지털 트윈 페르소나",
  },
  questions: MOCK_SURVEY_QUESTIONS.map((q) => ({
    ...q,
    rationale: "페르소나 분석 결과 해당 항목이 구매 결정에 중요한 영향을 미치는 것으로 나타남",
    evidence: [
      { label: "관련 페르소나 비율", value: "78%" },
      { label: "키워드 빈도", value: "상위 5위" },
    ],
  })),
};

/* ─── 시뮬레이션 ─── */
export const MOCK_SIMULATION_PROGRESS: SimulationProgress = {
  project_id: MOCK_PROJECT_ID,
  job_id: "job-sim-001",
  completed_responses: 681,
  target_responses: 1000,
  progress: 68,
  status: "running",
};

export const MOCK_SIMULATION_FEED: SimulationFeedItem[] = [
  {
    id: "feed-001",
    persona_name: "김민준",
    segment: "테크 얼리어답터",
    question_id: "q-001",
    question_text: "갤럭시 S25를 구매할 의향이 얼마나 있으신가요?",
    selected_option: "5",
    rationale: "AI 카메라와 슬림 디자인이 매력적이며 갤럭시 생태계 충성도가 높아 강한 구매 의향을 보임",
    integrity_score: 0.94,
    consistency_status: "Good",
    timestamp: new Date(Date.now() - 10000).toISOString(),
    cot: ["기존 S22 대비 AI 기능 향상 인식", "디자인 개선에 긍정적 반응", "사전예약 혜택 고려"],
  },
  {
    id: "feed-002",
    persona_name: "이서연",
    segment: "실용주의 소비자",
    question_id: "q-002",
    question_text: "갤럭시 S25에서 가장 매력적인 기능은 무엇인가요?",
    selected_option: "배터리 개선",
    rationale: "하루 종일 업무와 개인 용도로 스마트폰을 사용하는 패턴상 배터리 수명이 최우선 고려 요소",
    integrity_score: 0.91,
    consistency_status: "Good",
    timestamp: new Date(Date.now() - 25000).toISOString(),
    cot: ["장시간 사용 패턴 확인", "배터리 소모 이슈 경험", "배터리 개선 필요성 인식"],
  },
  {
    id: "feed-003",
    persona_name: "박지훈",
    segment: "가성비 추구형",
    question_id: "q-004",
    question_text: "갤럭시 S25 출시 가격(예상 139만원)은 적절하다고 생각하시나요?",
    selected_option: "2",
    rationale: "가격 대비 성능을 중시하는 소비 성향으로 139만원은 다소 높다고 인식, A시리즈 고려 중",
    integrity_score: 0.88,
    consistency_status: "Good",
    timestamp: new Date(Date.now() - 45000).toISOString(),
    cot: ["가격 민감도 높음", "A시리즈와 비교 분석", "가성비 관점 평가"],
  },
  {
    id: "feed-004",
    persona_name: "최수아",
    segment: "브랜드 충성고객",
    question_id: "q-007",
    question_text: "경쟁 제품(iPhone 16) 대비 갤럭시 S25의 경쟁력을 평가해주세요.",
    selected_option: "5",
    rationale: "삼성 갤럭시 생태계 전반(워치, 버즈, 탭)을 사용 중으로 브랜드 경쟁력을 높게 평가",
    integrity_score: 0.96,
    consistency_status: "Good",
    timestamp: new Date(Date.now() - 70000).toISOString(),
    cot: ["갤럭시 생태계 연동 강점 인식", "iOS 호환성 우려 없음", "삼성페이 활용도 높음"],
  },
  {
    id: "feed-005",
    persona_name: "정도윤",
    segment: "신중한 비교구매자",
    question_id: "q-003",
    question_text: "현재 사용 중인 스마트폰 브랜드는 무엇인가요?",
    selected_option: "애플 아이폰",
    rationale: "현재 iPhone 사용자이나 갤럭시 AI 기능에 관심을 가지고 비교 검토 중",
    integrity_score: 0.82,
    consistency_status: "Warn",
    timestamp: new Date(Date.now() - 90000).toISOString(),
    cot: ["iOS→Android 전환 가능성 검토", "AI 카메라 기능 비교", "앱 마이그레이션 부담 고려"],
  },
];

export const MOCK_RESPONSE_DISTRIBUTIONS: Record<string, ResponseDistributionItem[]> = {
  "q-001": [
    { label: "1 (전혀 없음)", value: 5, count: 34 },
    { label: "2", value: 8, count: 54 },
    { label: "3 (보통)", value: 19, count: 129 },
    { label: "4", value: 31, count: 211 },
    { label: "5 (매우 높음)", value: 37, count: 252 },
  ],
  "q-002": [
    { label: "AI 카메라", value: 34, count: 232 },
    { label: "슬림 디자인", value: 21, count: 143 },
    { label: "배터리 개선", value: 18, count: 123 },
    { label: "성능 향상", value: 15, count: 102 },
    { label: "갤럭시 AI 기능", value: 12, count: 82 },
  ],
  "q-004": [
    { label: "1 (매우 비쌈)", value: 12, count: 82 },
    { label: "2", value: 22, count: 150 },
    { label: "3 (적정)", value: 31, count: 211 },
    { label: "4", value: 24, count: 163 },
    { label: "5 (매우 저렴)", value: 11, count: 75 },
  ],
};

export const MOCK_INSIGHT: InsightResponse = {
  summary:
    "테크 얼리어답터 및 브랜드 충성고객 세그먼트에서 갤럭시 S25에 대한 구매 의향이 평균 4.2점으로 높게 나타났습니다. AI 카메라(34%)가 가장 매력적인 기능으로 선택됐으며, 가성비 추구형 세그먼트에서는 가격 민감도가 높아 프로모션 전략이 필요합니다.",
  strategies: [
    "AI 카메라 기능을 전면에 내세운 콘텐츠 마케팅 강화",
    "가성비 추구형 세그먼트 대상 할부 프로그램 및 트레이드인 혜택 확대",
    "브랜드 충성고객 대상 갤럭시 생태계 연동 혜택 강조",
    "iPhone 전환 고려 고객 대상 갤럭시 AI 체험 마케팅 집중",
  ],
  cached_until: new Date(Date.now() + 3600000).toISOString(),
};

export const MOCK_KEYWORDS: KeywordTrendItem[] = [
  { keyword: "AI 카메라", frequency: 312, trend: "up" },
  { keyword: "슬림 디자인", frequency: 245, trend: "up" },
  { keyword: "배터리", frequency: 198, trend: "flat" },
  { keyword: "가격", frequency: 176, trend: "down" },
  { keyword: "갤럭시 AI", frequency: 154, trend: "up" },
  { keyword: "야간모드", frequency: 132, trend: "up" },
  { keyword: "성능", frequency: 118, trend: "flat" },
  { keyword: "삼성페이", frequency: 97, trend: "flat" },
];

export const MOCK_RESPONSES: ResponseListResponse = {
  items: MOCK_SIMULATION_FEED.map((f) => ({
    id: f.id,
    persona_name: f.persona_name,
    segment: f.segment,
    question_id: f.question_id,
    question_text: f.question_text,
    selected_option: f.selected_option,
    rationale: f.rationale,
    integrity_score: f.integrity_score,
    timestamp: f.timestamp,
    consistency_status: f.consistency_status,
  })),
  page: 1,
  size: 20,
  total: 681,
};

/* ─── 리포트 ─── */
export const MOCK_REPORT_SUMMARIES: ReportSummary[] = [
  {
    id: "report-001",
    project_id: MOCK_PROJECT_ID_2,
    title: "삼성 TV Neo QLED 구매 의향 최종 분석 보고서",
    type: "종합 분석",
    format: "PDF",
    size: "2.4MB",
    created_at: "2026-04-01T10:00:00",
  },
  {
    id: "report-002",
    project_id: MOCK_PROJECT_ID_2,
    title: "프리미엄 TV 세그먼트별 구매 행동 인사이트",
    type: "세그먼트 분석",
    format: "PDF",
    size: "1.8MB",
    created_at: "2026-03-28T14:00:00",
  },
];

const MOCK_QUESTION_STATS: QuestionStat[] = MOCK_SURVEY_QUESTIONS.slice(0, 5).map((q) => ({
  question_id: q.id,
  question_text: q.text,
  question_type: q.type,
  response_count: 681,
  distribution: MOCK_RESPONSE_DISTRIBUTIONS[q.id] ?? [
    { label: "응답1", value: 30 },
    { label: "응답2", value: 40 },
    { label: "응답3", value: 30 },
  ],
  mean: q.type === "scale" ? 3.8 : undefined,
  std_dev: q.type === "scale" ? 0.9 : undefined,
}));

export const MOCK_REPORT_DETAIL: ReportDetail = {
  id: "report-001",
  project_id: MOCK_PROJECT_ID_2,
  title: "삼성 TV Neo QLED 구매 의향 최종 분석 보고서",
  type: "종합 분석",
  format: "PDF",
  size: "2.4MB",
  created_at: "2026-04-01T10:00:00",
  sections: [
    {
      id: "sec-01",
      title: "Executive Summary",
      content:
        "삼성 TV Neo QLED 75인치 제품에 대한 디지털 트윈 시뮬레이션 결과, 전체 응답자의 42%가 6개월 내 구매 의향을 보였습니다. 홈엔터테인먼트 선호 세그먼트에서 구매 전환율이 가장 높았으며(61%), 가격 민감도가 핵심 구매 장벽으로 확인됐습니다.",
      evidence: [
        { label: "전체 구매 의향률", value: "42%" },
        { label: "홈엔터테인먼트 세그먼트 전환율", value: "61%" },
        { label: "시뮬레이션 응답자 수", value: "1,200명" },
      ],
    },
    {
      id: "sec-02",
      title: "세그먼트별 핵심 인사이트",
      content:
        "테크 얼리어답터 세그먼트는 8K 해상도와 Neo Quantum Processor에 높은 관심을 보였고, 실용주의 소비자는 스마트 TV 기능과 OTT 통합에 주목했습니다. 가격 민감 세그먼트에서는 할부 프로그램 도입 시 구매 의향이 23%p 상승하는 것으로 분석됐습니다.",
      evidence: [
        { label: "얼리어답터 구매 의향", value: "72%" },
        { label: "할부 도입 시 의향 증가", value: "+23%p" },
      ],
      action: "가격 민감 세그먼트 대상 36개월 무이자 할부 프로그램 런칭 검토",
    },
    {
      id: "sec-03",
      title: "마케팅 채널 최적화 방안",
      content:
        "구매 여정 분석 결과 유튜브 리뷰 영상(38%)과 삼성닷컴 제품 상세 페이지(31%)가 주요 정보 탐색 채널로 확인됐습니다. 오프라인 삼성스토어 체험이 최종 구매 전환에 결정적인 역할(전환율 67%)을 하고 있어 체험 마케팅 강화가 권장됩니다.",
      evidence: [
        { label: "유튜브 정보 탐색 비율", value: "38%" },
        { label: "스토어 체험 후 전환율", value: "67%" },
      ],
      action: "프리미엄 스토어 내 Neo QLED 전용 체험존 확대",
    },
  ],
  kpis: [
    { label: "전체 구매 의향률", value: "42%" },
    { label: "NPS 점수", value: "67" },
    { label: "브랜드 선호도", value: "4.1 / 5.0" },
    { label: "경쟁사 대비 우위", value: "+18%p" },
  ],
  charts: [
    { id: "chart-01", type: "bar", title: "세그먼트별 구매 의향", data: [] },
    { id: "chart-02", type: "pie", title: "주요 정보 탐색 채널", data: [] },
    { id: "chart-03", type: "line", title: "가격대별 구매 의향 변화", data: [] },
  ],
  question_stats: MOCK_QUESTION_STATS,
};

/* ─── AI 잡 ─── */
export const MOCK_AI_JOBS: AIJob[] = [
  {
    id: "job-sim-001",
    project_id: MOCK_PROJECT_ID,
    job_type: "simulation",
    status: "running",
    progress: 68,
    payload: { target_responses: 1000 },
    created_by: "admin@samsung.com",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    started_at: new Date(Date.now() - 3500000).toISOString(),
  },
  {
    id: "job-survey-001",
    project_id: MOCK_PROJECT_ID,
    job_type: "survey_generation",
    status: "completed",
    progress: 100,
    payload: { question_count: 8 },
    created_by: "admin@samsung.com",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    started_at: new Date(Date.now() - 86300000).toISOString(),
    completed_at: new Date(Date.now() - 86000000).toISOString(),
  },
  {
    id: "job-persona-001",
    project_id: MOCK_PROJECT_ID,
    job_type: "persona_generation",
    status: "completed",
    progress: 100,
    payload: { n_personas: 7, n_synthetic_customers: 1000 },
    created_by: "admin@samsung.com",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    started_at: new Date(Date.now() - 172700000).toISOString(),
    completed_at: new Date(Date.now() - 172400000).toISOString(),
  },
  {
    id: "job-report-001",
    project_id: MOCK_PROJECT_ID_2,
    job_type: "report_generation",
    status: "completed",
    progress: 100,
    payload: { report_type: "comprehensive" },
    created_by: "admin@samsung.com",
    created_at: new Date(Date.now() - 259200000).toISOString(),
    started_at: new Date(Date.now() - 259100000).toISOString(),
    completed_at: new Date(Date.now() - 258800000).toISOString(),
  },
];

/* ─── 세그먼트 필터 옵션 ─── */
export const MOCK_SEGMENT_FILTER_OPTIONS: SegmentFilterOptions = {
  occupations: [
    { label: "IT개발자", count: 24, ratio: 0.2 },
    { label: "디자이너", count: 18, ratio: 0.15 },
    { label: "마케터", count: 15, ratio: 0.125 },
    { label: "회사원", count: 22, ratio: 0.183 },
    { label: "대학생", count: 16, ratio: 0.133 },
    { label: "자영업자", count: 12, ratio: 0.1 },
    { label: "교사", count: 8, ratio: 0.067 },
    { label: "공무원", count: 5, ratio: 0.042 },
  ],
  regions: [
    { label: "서울", count: 42, ratio: 0.35 },
    { label: "경기", count: 30, ratio: 0.25 },
    { label: "부산", count: 15, ratio: 0.125 },
    { label: "인천", count: 12, ratio: 0.1 },
    { label: "대구", count: 10, ratio: 0.083 },
    { label: "광주", count: 6, ratio: 0.05 },
    { label: "대전", count: 5, ratio: 0.042 },
  ],
  households: [
    { label: "1인가구", count: 36, ratio: 0.3 },
    { label: "신혼부부", count: 24, ratio: 0.2 },
    { label: "자녀있는가정", count: 42, ratio: 0.35 },
    { label: "대가족", count: 18, ratio: 0.15 },
  ],
  buy_channels: [
    { label: "삼성닷컴", count: 45, ratio: 0.375 },
    { label: "쿠팡", count: 30, ratio: 0.25 },
    { label: "삼성스토어", count: 28, ratio: 0.233 },
    { label: "카카오쇼핑", count: 17, ratio: 0.142 },
  ],
  content_channels: [
    { label: "유튜브", count: 55, ratio: 0.458 },
    { label: "인스타그램", count: 32, ratio: 0.267 },
    { label: "네이버블로그", count: 20, ratio: 0.167 },
    { label: "커뮤니티", count: 13, ratio: 0.108 },
  ],
  product_groups: [
    { label: "갤럭시S시리즈", count: 58, ratio: 0.483 },
    { label: "갤럭시A시리즈", count: 38, ratio: 0.317 },
    { label: "갤럭시Z시리즈", count: 24, ratio: 0.2 },
  ],
};
