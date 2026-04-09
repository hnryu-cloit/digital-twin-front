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

const SEGMENT_PROFILES = [
  {
    segment: "테크 얼리어답터",
    count: 31,
    ageBase: 27,
    ageSpread: 9,
    maleEvery: 4,
    keywords: ["AI카메라", "야간모드", "슬림디자인"],
    channels: ["모바일앱", "온라인", "온라인"],
    buyChannels: ["삼성닷컴", "삼성스토어", "쿠팡"],
    productGroups: ["갤럭시S시리즈", "갤럭시Z시리즈", "갤럭시S시리즈"],
  },
  {
    segment: "실용주의 소비자",
    count: 27,
    ageBase: 34,
    ageSpread: 10,
    maleEvery: 3,
    keywords: ["배터리", "가성비", "내구성"],
    channels: ["온라인", "오프라인", "모바일앱"],
    buyChannels: ["쿠팡", "삼성닷컴", "카카오쇼핑"],
    productGroups: ["갤럭시A시리즈", "갤럭시S시리즈", "갤럭시A시리즈"],
  },
  {
    segment: "가성비 추구형",
    count: 24,
    ageBase: 31,
    ageSpread: 12,
    maleEvery: 2,
    keywords: ["가격", "실용성", "AS"],
    channels: ["온라인", "온라인", "오프라인"],
    buyChannels: ["쿠팡", "카카오쇼핑", "통신사몰"],
    productGroups: ["갤럭시A시리즈", "갤럭시A시리즈", "갤럭시S시리즈"],
  },
  {
    segment: "브랜드 충성고객",
    count: 21,
    ageBase: 39,
    ageSpread: 11,
    maleEvery: 5,
    keywords: ["삼성페이", "갤럭시생태계", "S펜"],
    channels: ["모바일앱", "오프라인", "모바일앱"],
    buyChannels: ["삼성닷컴", "삼성스토어", "오프라인 리테일"],
    productGroups: ["갤럭시S시리즈", "갤럭시Z시리즈", "갤럭시탭"],
  },
  {
    segment: "신중한 비교구매자",
    count: 17,
    ageBase: 42,
    ageSpread: 9,
    maleEvery: 2,
    keywords: ["스펙비교", "리뷰분석", "신중구매"],
    channels: ["온라인", "뉴스/미디어", "오프라인"],
    buyChannels: ["쿠팡", "삼성닷컴", "통신사 대리점"],
    productGroups: ["갤럭시S시리즈", "갤럭시A시리즈", "갤럭시S시리즈"],
  },
] as const;

function getSegmentProfile(index: number) {
  let cursor = 0;
  for (const profile of SEGMENT_PROFILES) {
    cursor += profile.count;
    if (index < cursor) return profile;
  }
  return SEGMENT_PROFILES[SEGMENT_PROFILES.length - 1];
}

function makePersona(i: number): Persona {
  const profile = getSegmentProfile(i);
  const seg = profile.segment;
  const occ = OCCUPATIONS[i % OCCUPATIONS.length];
  const region = REGIONS[i % REGIONS.length];
  const gender = i % profile.maleEvery === 0 ? "여성" : "남성";
  const age = profile.ageBase + (i % profile.ageSpread);
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
    keywords: profile.keywords,
    age,
    gender,
    occupation: occ,
    occupation_category: ["IT/기술", "창작", "서비스", "교육", "비즈니스"][i % 5],
    region,
    household_type: ["1인가구", "신혼부부", "자녀있는가정", "대가족"][i % 4],
    preferred_channel: profile.channels[i % profile.channels.length],
    buy_channel: profile.buyChannels[i % profile.buyChannels.length],
    product_group: profile.productGroups[i % profile.productGroups.length],
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
    recommended_question_count: 30,
    required_blocks: ["브랜드인지", "제품경험", "구매의향", "NPS"],
  },
  {
    template_id: "tmpl-purchase-intent",
    template_version: 1,
    title: "구매 의향 조사",
    survey_type: "purchase",
    description: "신제품에 대한 구매 의향과 구매 장벽을 파악합니다.",
    recommended_question_count: 30,
    required_blocks: ["제품인식", "구매의향", "가격민감도", "채널선호"],
  },
  {
    template_id: "tmpl-ux-feedback",
    template_version: 3,
    title: "UX 만족도 조사",
    survey_type: "ux",
    description: "제품/서비스 사용 경험과 만족도를 심층 측정합니다.",
    recommended_question_count: 30,
    required_blocks: ["사용성", "만족도", "개선요구", "추천의향"],
  },
];

const BASE_MOCK_SURVEY_QUESTIONS: SurveyQuestion[] = [
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

const EXTRA_MOCK_SURVEY_QUESTIONS: SurveyQuestion[] = [
  { id: "q-009", text: "제품 정보를 처음 접한 채널은 무엇인가요?", type: "single_choice", order: 9, options: ["유튜브", "인스타그램", "커뮤니티", "뉴스 기사", "오프라인 매장"], status: "confirmed" },
  { id: "q-010", text: "갤럭시 AI 기능 중 가장 기대되는 항목을 선택해주세요.", type: "single_choice", order: 10, options: ["실시간 번역", "생성형 편집", "요약 기능", "서클 투 서치", "잘 모르겠음"], status: "confirmed" },
  { id: "q-011", text: "현재 스마트폰 교체 주기는 어느 정도인가요?", type: "single_choice", order: 11, options: ["1년 이내", "2년", "3년", "4년 이상"], status: "confirmed" },
  { id: "q-012", text: "스마트폰 선택 시 카메라 성능의 중요도를 평가해주세요.", type: "scale", order: 12, options: ["1", "2", "3", "4", "5"], status: "confirmed" },
  { id: "q-013", text: "스마트폰 선택 시 배터리 성능의 중요도를 평가해주세요.", type: "scale", order: 13, options: ["1", "2", "3", "4", "5"], status: "confirmed" },
  { id: "q-014", text: "스마트폰 선택 시 디자인 완성도의 중요도를 평가해주세요.", type: "scale", order: 14, options: ["1", "2", "3", "4", "5"], status: "confirmed" },
  { id: "q-015", text: "스마트폰 선택 시 가격 혜택의 중요도를 평가해주세요.", type: "scale", order: 15, options: ["1", "2", "3", "4", "5"], status: "confirmed" },
  { id: "q-016", text: "갤럭시 생태계 기기 보유 현황을 선택해주세요.", type: "multiple_choice", order: 16, options: ["버즈", "워치", "탭", "북", "해당 없음"], status: "confirmed" },
  { id: "q-017", text: "가장 신뢰하는 제품 리뷰 형태는 무엇인가요?", type: "single_choice", order: 17, options: ["유튜브 영상", "전문 리뷰 기사", "사용자 후기", "지인 추천"], status: "confirmed" },
  { id: "q-018", text: "사전예약 혜택이 구매 결정에 미치는 영향을 평가해주세요.", type: "scale", order: 18, options: ["1", "2", "3", "4", "5"], status: "confirmed" },
  { id: "q-019", text: "중고 보상판매 프로그램이 있다면 구매 의향이 높아지나요?", type: "scale", order: 19, options: ["1", "2", "3", "4", "5"], status: "confirmed" },
  { id: "q-020", text: "선호하는 구매 결제 방식은 무엇인가요?", type: "single_choice", order: 20, options: ["일시불", "카드 할부", "통신사 할부", "렌탈/구독"], status: "confirmed" },
  { id: "q-021", text: "신제품 광고 메시지에서 가장 먼저 확인하는 정보는 무엇인가요?", type: "single_choice", order: 21, options: ["성능", "카메라", "가격", "디자인", "혜택"], status: "confirmed" },
  { id: "q-022", text: "오프라인 체험이 구매 전환에 미치는 영향을 평가해주세요.", type: "scale", order: 22, options: ["1", "2", "3", "4", "5"], status: "confirmed" },
  { id: "q-023", text: "제품 비교 시 가장 자주 비교하는 경쟁 브랜드는 무엇인가요?", type: "single_choice", order: 23, options: ["애플", "샤오미", "구글", "기타"], status: "confirmed" },
  { id: "q-024", text: "가장 선호하는 스마트폰 화면 크기를 선택해주세요.", type: "single_choice", order: 24, options: ["6.1형", "6.3형", "6.7형 이상", "상관없음"], status: "confirmed" },
  { id: "q-025", text: "제품 컬러 선택 시 중요하게 보는 요소를 작성해주세요.", type: "text", order: 25, status: "confirmed" },
  { id: "q-026", text: "브랜드 신뢰도가 가격보다 더 중요하다고 생각하시나요?", type: "scale", order: 26, options: ["1", "2", "3", "4", "5"], status: "confirmed" },
  { id: "q-027", text: "AI 기능 사용 경험이 실제 구매 의향에 영향을 주나요?", type: "scale", order: 27, options: ["1", "2", "3", "4", "5"], status: "confirmed" },
  { id: "q-028", text: "주변 추천이 신제품 선택에 미치는 영향을 평가해주세요.", type: "scale", order: 28, options: ["1", "2", "3", "4", "5"], status: "confirmed" },
  { id: "q-029", text: "출시 초기에 구매하지 않는다면 가장 큰 이유는 무엇인가요?", type: "single_choice", order: 29, options: ["가격", "정보 부족", "기존 제품 만족", "경쟁사 비교 필요"], status: "confirmed" },
  { id: "q-030", text: "갤럭시 S25 출시 커뮤니케이션에서 추가로 필요한 메시지를 자유롭게 적어주세요.", type: "text", order: 30, status: "confirmed" },
];

export const MOCK_SURVEY_QUESTIONS: SurveyQuestion[] = [...BASE_MOCK_SURVEY_QUESTIONS, ...EXTRA_MOCK_SURVEY_QUESTIONS];

export const MOCK_SURVEY_PREVIEW: SurveyDraftPreview = {
  project_id: MOCK_PROJECT_ID,
  status: "confirmed",
  summary:
    "갤럭시 S25의 구매 의향, 핵심 기능 선호도, 가격 적정성, 브랜드 인식을 종합 측정하는 30문항 설문입니다. MZ세대 중심의 디지털 트윈 페르소나를 대상으로 시뮬레이션을 진행합니다.",
  generation_meta: {
    question_count: 30,
    draft_count: 32,
    confirmed_count: 30,
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
  title: "갤럭시 S26 구매 의향 전략 분석 최종 리포트",
  type: "종합 분석",
  format: "PDF",
  size: "2.4MB",
  created_at: "2026-04-01T10:00:00",
  sections: [
    {
      id: "summary",
      title: "Executive Summary",
      content:
        "갤럭시 S26 디지털 트윈 시뮬레이션 결과, 전체 분석 대상 18,740명 중 30대 테크 게이머와 얼리어답터 세그먼트에서 구매 전환 가능성이 가장 높게 나타났습니다. AI 카메라, 야간 시인성, 생성형 편집 기능이 핵심 구매 유인으로 확인됐고, 가격 저항선은 50대 실용주의층에서 가장 크게 관찰되었습니다. 따라서 초기 런칭 메시지는 프리미엄 경험을, 후속 전환 메시지는 보상판매와 가치 보전 혜택을 분리해 운용하는 전략이 가장 유효합니다.",
      evidence: [
        { label: "전체 분석 모집단", value: "18,740명" },
        { label: "최우선 전환 세그먼트", value: "30대 테크 게이머" },
        { label: "핵심 구매 유인", value: "AI 카메라 / 야간 시인성" },
      ],
    },
    {
      id: "findings",
      title: "최우선 전환 세그먼트",
      content:
        "30대 테크 게이머는 고성능 하드웨어와 AI 소프트웨어의 결합을 가장 높게 평가하는 핵심 수익 세그먼트입니다. 실사용 맥락에서 레이트레이싱, AI 업스케일링, 배터리 안정성을 동시에 보는 경향이 강합니다.",
      evidence: [
        { label: "AI 기능 지불 용의", value: "76.3%", source_question_id: "q-010" },
        { label: "고성능 기능 선호도", value: "88.1%", source_question_id: "q-007" },
        { label: "경쟁사 대비 선호", value: "+2.1배", source_question_id: "q-003" },
      ],
      action:
        "런칭 초기에는 게이밍 인플루언서와 체험형 콘텐츠를 결합해 프리미엄 성능 인식을 선점하고, 상세 페이지 카피는 AI 성능과 실사용 효익을 함께 제시합니다.",
    },
    {
      id: "findings",
      title: "카메라 경험의 결정적 요인",
      content:
        "단순 화소 경쟁보다 야간 시인성과 자동 보정 품질이 구매 전환에 더 큰 영향을 주는 것으로 확인됐습니다. 즉, '스펙'보다 '바로 좋은 결과'를 주는 경험 설계가 더 중요합니다.",
      evidence: [
        { label: "야간 시인성 우선 응답", value: "64.2%", source_question_id: "q-006" },
        { label: "즉시 공유 의향", value: "71.5%", source_question_id: "q-025" },
        { label: "자동 보정 선호", value: "3.2배", source_question_id: "q-006" },
      ],
      action:
        "야간 촬영 비교 시연과 생성형 편집 before/after 콘텐츠를 메인 크리에이티브로 활용하고, '찍으면 바로 작품'이라는 사용 맥락 중심 메시지를 전면에 배치합니다.",
    },
    {
      id: "findings",
      title: "가격 저항선 및 이탈 리스크",
      content:
        "50대 실용주의층은 AI 기능 자체보다 출고가 인상에 더 민감하게 반응합니다. 이 그룹에서는 기능 설명보다 잔존 가치와 보상판매 혜택 설계가 더 중요합니다.",
      evidence: [
        { label: "출고가 인상 거부 응답", value: "72.8%", source_question_id: "q-029" },
        { label: "가격 민감도", value: "2.4배", source_question_id: "q-015" },
        { label: "AI 기능 부가 인식", value: "61.0%", source_question_id: "q-027" },
      ],
      action:
        "초기 구매 할인보다 보상 판매, 장기 보증, 할부 혜택을 강조하고, AI 기능은 생활 편의와 절감 가치로 재프레이밍한 별도 메시지 세트를 운용합니다.",
    },
  ],
  kpis: [
    { label: "평균 구매 의향", value: "68.7%" },
    { label: "완료율", value: "91.3%" },
    { label: "총 분석 표본", value: "18,740" },
    { label: "Confidence Index", value: "99.2%" },
  ],
  charts: [
    {
      id: "keyword-radar",
      type: "radar",
      title: "속성별 선호도 비교",
      data: [
        { subject: "성능 지향", dominant: 92, baseline: 65, fullMark: 100 },
        { subject: "배터리 효율", dominant: 70, baseline: 85, fullMark: 100 },
        { subject: "카메라 혁신", dominant: 88, baseline: 72, fullMark: 100 },
        { subject: "AI 지능화", dominant: 75, baseline: 68, fullMark: 100 },
        { subject: "가격 합리성", dominant: 45, baseline: 78, fullMark: 100 },
      ],
    },
    {
      id: "question-strength",
      type: "area",
      title: "구매 의향 추이",
      data: [
        { label: "W1", value: 52 },
        { label: "W2", value: 61 },
        { label: "W3", value: 58 },
        { label: "W4", value: 74 },
        { label: "W5", value: 71 },
        { label: "W6", value: 83 },
        { label: "W7", value: 89 },
      ],
    },
    {
      id: "age-distribution",
      type: "bar",
      title: "연령대별 기회 규모",
      data: [
        { name: "20대", value: 72, benchmark: 85 },
        { name: "30대", value: 88, benchmark: 90 },
        { name: "40대", value: 55, benchmark: 70 },
        { name: "50대+", value: 38, benchmark: 60 },
      ],
    },
    {
      id: "segment-cards",
      type: "cards",
      title: "세그먼트 비교",
      data: [
        { segment: "30대 테크 게이머", count: 4386, share: 23.4, buyChannel: "삼성닷컴", productGroup: "갤럭시 S26 Ultra", region: "서울" },
        { segment: "프리미엄 얼리어답터", count: 3561, share: 19.0, buyChannel: "공식몰", productGroup: "갤럭시 S26+", region: "경기" },
        { segment: "실속형 비교구매층", count: 2984, share: 15.9, buyChannel: "온라인 쇼핑몰", productGroup: "갤럭시 S26", region: "부산" },
      ],
    },
    {
      id: "question-distribution",
      type: "distribution",
      title: "문항별 응답 분포",
      data: [
        {
          question_id: "q-001",
          question_text: "갤럭시 S25를 구매할 의향이 얼마나 있으신가요?",
          distribution: [
            { label: "매우 높음", value: 45 },
            { label: "높음", value: 30 },
            { label: "보통", value: 15 },
            { label: "낮음", value: 10 },
          ],
        },
        {
          question_id: "q-006",
          question_text: "갤럭시 S25의 AI 카메라 기능에 대해 어떻게 생각하시나요?",
          distribution: [
            { label: "매우 긍정", value: 38 },
            { label: "긍정", value: 34 },
            { label: "보통", value: 18 },
            { label: "부정", value: 10 },
          ],
        },
      ],
    },
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
    payload: { question_count: 30 },
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

export const MOCK_RESEARCH_RECOMMENDATION = {
  recommendation:
    "서울·경기 20~30대와 프리미엄 구매 의향층을 우선 타깃으로 설정해 AI 카메라와 슬림 디자인 메시지를 집중 검증하는 것이 좋습니다.",
  suggested_filters: {
    age_ranges: ["20대", "30대"],
    regions: ["서울", "경기"],
    keywords: ["AI카메라", "슬림디자인", "야간모드"],
  },
  rationale:
    "목업 응답 기준으로 구매 의향과 키워드 빈도가 가장 높게 교차하는 구간이 수도권 20~30대 세그먼트에 집중되어 있습니다.",
};

export const MOCK_CROSS_SEGMENT_SUMMARY = {
  summary:
    "전체 세그먼트에서 AI 카메라와 배터리 지속시간이 공통 강점으로 나타났고, 가격 민감도는 세그먼트별 편차가 크게 관찰되었습니다.",
  segment_highlights: [
    {
      segment: "테크 얼리어답터",
      key_finding: "신기능 수용성이 가장 높고 AI 카메라 반응이 강하게 나타났습니다.",
    },
    {
      segment: "브랜드 충성고객",
      key_finding: "갤럭시 생태계 연동 경험이 재구매 의향을 견인했습니다.",
    },
    {
      segment: "가성비 추구형",
      key_finding: "출고가와 할인 정책에 따라 구매 의향 변동폭이 크게 나타났습니다.",
    },
  ],
  notable_pattern:
    "프리미엄 기능 선호층과 가격 민감층 모두에서 '배터리'가 핵심 평가 항목으로 반복 등장했습니다.",
};

export const MOCK_ACTION_PLAN = {
  period: "출시 전 6주",
  phases: [
    { week: "1-2주차", action: "AI 카메라 중심 티저 메시지 노출", channel: "YouTube / Instagram" },
    { week: "3-4주차", action: "가격 저항 완화용 보상판매·할부 혜택 커뮤니케이션", channel: "CRM / Paid Media" },
    { week: "5-6주차", action: "생태계 연동 스토리와 실사용 후기 확산", channel: "Owned Media / Community" },
  ],
  priority_segments: ["테크 얼리어답터", "브랜드 충성고객", "가성비 추구형"],
  budget_allocation: "브랜딩 40% / 전환 캠페인 35% / 리타겟팅 25%",
};
