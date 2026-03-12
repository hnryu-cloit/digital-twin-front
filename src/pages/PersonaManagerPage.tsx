import type React from "react";
import { useState } from "react";
import { AppPagination } from "@/components/ui/AppPagination";
import {
  Search, Plus, Smartphone, X,
  UserCircle2, Gamepad2, Coffee, Briefcase,
  Music, LayoutGrid, List,
  Brain, Heart, Zap, ShieldCheck, Activity, Target, AlertCircle,
  TrendingUp, History, MessageSquare, BarChart2, Star, CreditCard, MousePointer2,
  ChevronRight, Cpu, Package
} from "lucide-react";

/* ─── Types ─── */
type Gender = "남성" | "여성";
type Segment = "MZ 얼리어답터" | "프리미엄 구매자" | "실용 중시 가족형" | "게이밍 성향군" | "비즈니스 프로";
type TechLevel = "초보" | "중급" | "전문가";

interface Persona {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  occupation: string;
  device: string;
  segments: Segment[];
  keywords: string[];
  purchaseIntent: number;
  color: string;
  iconBg: string;
  iconKey: number;
  description: string;
  techLevel: TechLevel;
  monthlyTechSpend: string;
  interests: string[];
  competitorPerception: string;
  marketingAcceptance: number;
  futureValue: number;
  purchaseHistory: string[];
  userLogs: string[];
  brandAttitude: number;
}

const SEGMENT_COLORS: Record<Segment, { bg: string; text: string; border: string }> = {
  "MZ 얼리어답터": { bg: "var(--primary-light-bg)", text: "var(--primary)", border: "var(--primary-light-border)" },
  "프리미엄 구매자": { bg: "#E0E7FF", text: "#4338CA", border: "#C7D2FE" },
  "실용 중시 가족형": { bg: "#F1F5F9", text: "#475569", border: "#E2E8F0" },
  "게이밍 성향군": { bg: "#EEF2FF", text: "#4F46E5", border: "#C7D2FE" },
  "비즈니스 프로": { bg: "#F0F9FF", text: "#0369A1", border: "#B9E6FE" },
};

const ICON_META = [
  { bg: "var(--primary-light-bg)", color: "var(--primary)" },
  { bg: "#E0E7FF", color: "#4338CA" },
  { bg: "#F0F9FF", color: "#0369A1" },
  { bg: "#EEF2FF", color: "#4F46E5" },
  { bg: "#F1F5F9", color: "#475569" },
];
const PAGE_SIZE = 6;

/* ─── Mock Data (20 Personas for 3+ pages) ─── */
const RAW_PERSONAS: Omit<Persona, "id">[] = [
  { name:"이준혁", age:28, gender:"남성", occupation:"게임 개발자", device:"Galaxy S24 Ultra", segments:["MZ 얼리어답터","게이밍 성향군"], keywords:["고성능","AI카메라","멀티태스킹"], purchaseIntent:92, iconKey:0, color:"#316BFF", iconBg:"#EEF4FF", description:"최신 모바일 기술에 관심 많은 20대 남성 게이머. 성능과 스펙을 최우선으로 고려함.", techLevel: "전문가", monthlyTechSpend: "50만원 이상", interests: ["고성능 게임", "AI 자동화", "영상 편집"], competitorPerception: "아이폰 프로 모델 대비 갤럭시의 자유도와 카메라 줌 성능을 높게 평가하나 브랜드 이미지는 약하다고 느낌.", marketingAcceptance: 85, futureValue: 94, purchaseHistory: ["S24 Ultra (2024)", "Tab S9 Ultra (2023)"], userLogs: ["갤럭시 스토어 런처 실행 (2시간 전)"], brandAttitude: 88 },
  { name:"김지연", age:34, gender:"여성", occupation:"디지털 마케터", device:"Z Flip6", segments:["MZ 얼리어답터","프리미엄 구매자"], keywords:["디자인","트렌드","SNS"], purchaseIntent:78, iconKey:1, color:"#DB2777", iconBg:"#FDF2F8", description:"트렌드에 민감한 30대 여성 마케터. 디자인과 브랜드 가치를 중시하며 SNS 활동이 활발함.", techLevel: "중급", monthlyTechSpend: "20-30만원", interests: ["패션/뷰티", "사진 촬영", "자기계발"], competitorPerception: "갤럭시의 폴더블 폼팩터는 혁신적이라고 생각하나, 감성적인 측면에서 보완이 필요하다고 느낌.", marketingAcceptance: 92, futureValue: 81, purchaseHistory: ["Z Flip6 (2024)", "Buds3 Pro (2024)"], userLogs: ["인스타그램 업로드용 카메라 앱 사용 (1시간 전)"], brandAttitude: 75 },
  { name:"박민수", age:45, gender:"남성", occupation:"금융 컨설턴트", device:"S24+", segments:["비즈니스 프로","실용 중시 가족형"], keywords:["업무효율","보안","배터리"], purchaseIntent:65, iconKey:2, color:"#0284C7", iconBg:"#F0F9FF", description:"안정성과 업무 연속성을 중시하는 40대 전문직. 신기술보다는 검증된 유용성을 선호함.", techLevel: "중급", monthlyTechSpend: "10-20만원", interests: ["재테크", "뉴스 구독", "골프"], competitorPerception: "갤럭시의 통화 녹음과 삼성 페이를 핵심 기능으로 인지하며 업무용으로는 대체 불가능하다고 생각함.", marketingAcceptance: 45, futureValue: 72, purchaseHistory: ["S24+ (2024)", "Watch6 (2023)"], userLogs: ["Samsung Notes 동기화 (30분 전)"], brandAttitude: 90 },
  { name:"최수아", age:23, gender:"여성", occupation:"대학생", device:"A55", segments:["MZ 얼리어답터"], keywords:["가성비","카메라","디자인"], purchaseIntent:85, iconKey:3, color:"#7C3AED", iconBg:"#F5F3FF", description:"가성비를 중시하면서도 최신 트렌드를 쫓는 대학생. 브이로그 촬영을 즐김.", techLevel: "초보", monthlyTechSpend: "5만원 미만", interests: ["유튜브 시청", "여행", "사진 어플"], competitorPerception: "아이폰을 선호하지만 가격 부담으로 갤럭시 A시리즈를 선택함.", marketingAcceptance: 95, futureValue: 60, purchaseHistory: ["A55 (2024)"], userLogs: ["카메라 필터 앱 연동 (어제)"], brandAttitude: 65 },
  { name:"정태영", age:39, gender:"남성", occupation:"건축가", device:"Z Fold6", segments:["프리미엄 구매자","비즈니스 프로"], keywords:["대화면","멀티태스킹","S펜"], purchaseIntent:98, iconKey:4, color:"#16A34A", iconBg:"#F0FDF4", description:"도면 확인 및 수정 작업이 잦은 30대 후반 건축가. 넓은 화면과 S펜 활용을 필수적으로 여김.", techLevel: "전문가", monthlyTechSpend: "30-50만원", interests: ["건축 디자인", "스마트홈", "자동차"], competitorPerception: "애플 생태계보다 윈도우/안드로이드 연동성을 높게 평가함.", marketingAcceptance: 60, futureValue: 88, purchaseHistory: ["Z Fold6 (2024)", "Tab S9 (2023)"], userLogs: ["Samsung Notes 도면 스케치 (오전)"], brandAttitude: 95 },
  { name:"한소희", age:42, gender:"여성", occupation:"학원 강사", device:"S23", segments:["실용 중시 가족형"], keywords:["배터리","안정성","카메라"], purchaseIntent:50, iconKey:1, color:"#DB2777", iconBg:"#FDF2F8", description:"가족 사진 촬영과 연락 수단으로 스마트폰을 사용하는 40대 워킹맘.", techLevel: "초보", monthlyTechSpend: "5-10만원", interests: ["육아", "교육", "쇼핑"], competitorPerception: "타 브랜드에 대한 관심이 적고 기존에 쓰던 브랜드를 계속 쓰는 성향.", marketingAcceptance: 40, futureValue: 65, purchaseHistory: ["S23 (2023)"], userLogs: ["카카오톡 장시간 사용 (상시)"], brandAttitude: 80 },
  { name:"강현우", age:19, gender:"남성", occupation:"고등학생", device:"S23 FE", segments:["게이밍 성향군"], keywords:["게임","디스플레이","가성비"], purchaseIntent:80, iconKey:0, color:"#316BFF", iconBg:"#EEF4FF", description:"모바일 게임을 즐겨하는 10대. 고주사율 디스플레이와 쿨링 성능에 민감함.", techLevel: "중급", monthlyTechSpend: "5만원 미만", interests: ["모바일 e스포츠", "웹툰", "PC 하드웨어"], competitorPerception: "아이폰의 게이밍 성능을 부러워하나 안드로이드의 앱 생태계를 선호함.", marketingAcceptance: 90, futureValue: 75, purchaseHistory: ["S23 FE (2023)"], userLogs: ["게임 런처 통해 원신 2시간 플레이 (어젯밤)"], brandAttitude: 70 },
  { name:"유진아", age:31, gender:"여성", occupation:"UX 디자이너", device:"Z Flip5", segments:["MZ 얼리어답터","프리미엄 구매자"], keywords:["커스터마이징","감성","카메라"], purchaseIntent:75, iconKey:3, color:"#7C3AED", iconBg:"#F5F3FF", description:"자신만의 스타일로 기기를 꾸미는 것을 좋아하는 30대 초반 디자이너.", techLevel: "중급", monthlyTechSpend: "10-20만원", interests: ["인테리어", "전시회", "디자인 툴"], competitorPerception: "아이폰의 감성을 좋아하지만 플립의 폼팩터 매력 때문에 넘어옴.", marketingAcceptance: 85, futureValue: 80, purchaseHistory: ["Z Flip5 (2023)"], userLogs: ["커버 화면 GIF 교체 (오늘 아침)"], brandAttitude: 82 },
  { name:"조상민", age:55, gender:"남성", occupation:"개인사업자", device:"Z Fold5", segments:["비즈니스 프로"], keywords:["큰화면","신뢰감","주식"], purchaseIntent:60, iconKey:2, color:"#0284C7", iconBg:"#F0F9FF", description:"주식 차트와 이메일 확인을 위해 큰 화면을 선호하는 50대 사업가.", techLevel: "초보", monthlyTechSpend: "10만원 미만", interests: ["주식", "부동산", "뉴스"], competitorPerception: "폴더블 기술력에 대한 높은 신뢰, 타사는 고려하지 않음.", marketingAcceptance: 30, futureValue: 70, purchaseHistory: ["Z Fold5 (2023)"], userLogs: ["증권사 앱 다중 분할 화면 사용 (오전 9시)"], brandAttitude: 98 },
  { name:"임도윤", age:26, gender:"남성", occupation:"유튜버", device:"S24 Ultra", segments:["MZ 얼리어답터","프리미엄 구매자"], keywords:["동영상","마이크","저장용량"], purchaseIntent:95, iconKey:4, color:"#16A34A", iconBg:"#F0FDF4", description:"야외 브이로그 촬영을 주로 하는 20대 후반 크리에이터. 카메라 렌즈 성능과 손떨림 방지를 가장 중요하게 생각함.", techLevel: "전문가", monthlyTechSpend: "30만원 이상", interests: ["영상 편집", "카메라 장비", "여행"], competitorPerception: "비디오 촬영 시 아이폰의 색감을 선호하기도 하지만, 오디오 녹음 및 줌 성능에서 울트라를 선택.", marketingAcceptance: 88, futureValue: 96, purchaseHistory: ["S24 Ultra (2024)", "Buds2 Pro (2022)"], userLogs: ["Pro Video 모드 4K 촬영 (어제 낮)"], brandAttitude: 85 },
  { name:"박은지", age:29, gender:"여성", occupation:"회사원", device:"S24", segments:["MZ 얼리어답터"], keywords:["휴대성","디자인","AI통번역"], purchaseIntent:82, iconKey:1, color:"#DB2777", iconBg:"#FDF2F8", description:"해외 출장과 여행이 잦은 20대 후반 직장인. 가벼운 기기와 실시간 번역 기능에 만족함.", techLevel: "중급", monthlyTechSpend: "10만원 대", interests: ["해외 여행", "외국어", "카페 투어"], competitorPerception: "애플은 불편하고 갤럭시는 무겁다는 편견이 있었으나 일반 모델의 그립감에 만족함.", marketingAcceptance: 75, futureValue: 84, purchaseHistory: ["S24 (2024)", "Watch5 (2022)"], userLogs: ["통화 중 실시간 통번역 사용 (3일 전)"], brandAttitude: 89 },
  { name:"송지훈", age:35, gender:"남성", occupation:"프리랜서", device:"S23+", segments:["실용 중시 가족형"], keywords:["배터리타임","화면크기","내구성"], purchaseIntent:55, iconKey:2, color:"#0284C7", iconBg:"#F0F9FF", description:"차량 이동이 많고 내비게이션을 자주 쓰는 프리랜서. 배터리 소모가 적고 화면이 적당히 큰 플러스 모델을 선호.", techLevel: "중급", monthlyTechSpend: "5만원 미만", interests: ["자동차", "캠핑", "OTT"], competitorPerception: "기능적 차이에 크게 민감하지 않으며, AS 편의성 때문에 삼성을 유지함.", marketingAcceptance: 50, futureValue: 68, purchaseHistory: ["S23+ (2023)"], userLogs: ["Android Auto 무선 연결 3시간 (어제)"], brandAttitude: 80 },
  { name:"이채원", age:22, gender:"여성", occupation:"대학생", device:"Z Flip6", segments:["MZ 얼리어답터"], keywords:["인스타","셀피","콤팩트"], purchaseIntent:90, iconKey:3, color:"#7C3AED", iconBg:"#F5F3FF", description:"친구들과 사진 찍기를 좋아하며 인스타그램을 활발히 하는 대학생. 플립의 플렉스 모드 촬영을 애용함.", techLevel: "중급", monthlyTechSpend: "5-10만원", interests: ["패션", "뷰티", "핫플 탐방"], competitorPerception: "아이폰 사용자 친구들이 많아 소외감을 느끼기도 하지만, 플립의 디자인으로 차별화를 둠.", marketingAcceptance: 95, futureValue: 78, purchaseHistory: ["Z Flip6 (2024)"], userLogs: ["플렉스 모드로 릴스 촬영 (오늘 오후)"], brandAttitude: 76 },
  { name:"김동현", age:48, gender:"남성", occupation:"영업팀장", device:"Z Fold6", segments:["비즈니스 프로","프리미엄 구매자"], keywords:["화면분할","문서작업","배터리"], purchaseIntent:85, iconKey:4, color:"#16A34A", iconBg:"#F0FDF4", description:"외근이 잦고 고객에게 자료를 보여줄 일이 많은 40대 후반 영업팀장.", techLevel: "중급", monthlyTechSpend: "20만원 대", interests: ["골프", "경제", "자기계발"], competitorPerception: "업무용으로는 갤럭시가 유일한 선택지라고 굳게 믿음.", marketingAcceptance: 65, futureValue: 89, purchaseHistory: ["Z Fold6 (2024)", "Watch6 Classic (2023)"], userLogs: ["PDF 뷰어와 카카오톡 동시 띄우기 (1시간 전)"], brandAttitude: 96 },
  { name:"서유리", age:27, gender:"여성", occupation:"일러스트레이터", device:"S24 Ultra", segments:["게이밍 성향군"], keywords:["S펜","드로잉","고해상도"], purchaseIntent:70, iconKey:0, color:"#316BFF", iconBg:"#EEF4FF", description:"이동 중에도 아이디어를 스케치하는 20대 후반 프리랜서 작가.", techLevel: "전문가", monthlyTechSpend: "15만원 대", interests: ["웹툰", "전시", "일러스트"], competitorPerception: "아이패드를 메인으로 쓰지만, 스마트폰은 펜이 내장된 울트라가 편해서 씀.", marketingAcceptance: 80, futureValue: 82, purchaseHistory: ["S24 Ultra (2024)"], userLogs: ["Penup 앱으로 30분간 스케치 (오늘 오전)"], brandAttitude: 84 },
  { name:"황인호", age:33, gender:"남성", occupation:"백엔드 개발자", device:"S23", segments:["실용 중시 가족형"], keywords:["작은크기","가벼움","가성비"], purchaseIntent:40, iconKey:2, color:"#0284C7", iconBg:"#F0F9FF", description:"IT 기기에 관심은 많지만 스마트폰은 전화와 메시지 용도로만 쓰는 실용주의자.", techLevel: "전문가", monthlyTechSpend: "5만원 미만", interests: ["코딩", "스팀 게임", "테크 리뷰"], competitorPerception: "모든 스마트폰이 상향 평준화되었다고 생각하여 비싼 기기 구매를 꺼림.", marketingAcceptance: 20, futureValue: 60, purchaseHistory: ["S23 (2023)"], userLogs: ["삼성 페이 간편 결제 (방금 전)"], brandAttitude: 70 },
  { name:"박지민", age:25, gender:"여성", occupation:"취업준비생", device:"A34", segments:["실용 중시 가족형"], keywords:["가성비","인강","배터리"], purchaseIntent:60, iconKey:1, color:"#DB2777", iconBg:"#FDF2F8", description:"주로 도서관에서 인강을 듣는 취준생. 통신비와 기기값이 저렴한 모델을 선호함.", techLevel: "초보", monthlyTechSpend: "5만원 미만", interests: ["취업", "토익", "유튜브"], competitorPerception: "취업 후에는 플래그십 모델(아이폰 또는 S시리즈)로 넘어가고 싶어 함.", marketingAcceptance: 80, futureValue: 65, purchaseHistory: ["A34 (2023)"], userLogs: ["유튜브 인강 재생 4시간 (어제)"], brandAttitude: 68 },
  { name:"최건우", age:30, gender:"남성", occupation:"마케팅 대행사 AE", device:"S24+", segments:["MZ 얼리어답터","프리미엄 구매자"], keywords:["디자인","성능균형","AI요약"], purchaseIntent:88, iconKey:0, color:"#316BFF", iconBg:"#EEF4FF", description:"트렌드에 민감하고 미팅이 많은 30대 초반 직장인. AI 회의록 요약 기능을 가장 유용하게 씀.", techLevel: "중급", monthlyTechSpend: "10-15만원", interests: ["트렌드 리서치", "운동", "맛집 탐방"], competitorPerception: "업무 효율성 측면에서 갤럭시의 AI 기능이 경쟁사를 압도한다고 평가함.", marketingAcceptance: 85, futureValue: 90, purchaseHistory: ["S24+ (2024)", "Buds2 (2022)"], userLogs: ["음성 녹음 후 AI 요약 텍스트 변환 (어제 오후)"], brandAttitude: 92 },
  { name:"윤보라", age:37, gender:"여성", occupation:"요가 강사", device:"Z Flip5", segments:["실용 중시 가족형"], keywords:["휴대성","거치촬영","건강관리"], purchaseIntent:75, iconKey:3, color:"#7C3AED", iconBg:"#F5F3FF", description:"수업 동작을 촬영하고 SNS에 올리는 요가 강사. 삼각대 없이 바닥에 두고 찍기 편한 점을 최고로 꼽음.", techLevel: "초보", monthlyTechSpend: "5만원 대", interests: ["요가", "다이어트식단", "명상"], competitorPerception: "Z Flip의 폼팩터 자체가 타사 대비 압도적인 장점이라 생각함.", marketingAcceptance: 70, futureValue: 76, purchaseHistory: ["Z Flip5 (2023)", "Watch5 (2022)"], userLogs: ["삼성 헬스 수면 측정 (오늘 아침)"], brandAttitude: 88 },
  { name:"구승민", age:41, gender:"남성", occupation:"연구원", device:"S24 Ultra", segments:["게이밍 성향군","비즈니스 프로"], keywords:["고성능","최신기술","디스플레이"], purchaseIntent:90, iconKey:4, color:"#16A34A", iconBg:"#F0FDF4", description:"기술 스펙 자체를 파고드는 것을 즐기는 40대 초반 연구원. 벤치마크 점수와 발열 제어에 예민함.", techLevel: "전문가", monthlyTechSpend: "20만원 이상", interests: ["IT 테크", "모바일 게임", "SF영화"], competitorPerception: "애플의 칩셋 성능은 인정하지만, 안드로이드의 파일 시스템과 자유도 때문에 갤럭시를 떠날 수 없음.", marketingAcceptance: 80, futureValue: 95, purchaseHistory: ["S24 Ultra (2024)", "Watch6 (2023)", "Tab S9 Ultra (2023)"], userLogs: ["Geekbench 구동 (일주일 전)"], brandAttitude: 94 }
];

const PERSONA_LIST: Persona[] = RAW_PERSONAS.map((p, i) => ({ ...p, id: `p${i + 1}` }));

/* ─── Helpers ─── */
function PersonaIcon({ iconKey, size = 20 }: { iconKey: number; size?: number }) {
  const icons = [<Gamepad2 size={size} />, <Coffee size={size} />, <Briefcase size={size} />, <Music size={size} />, <Smartphone size={size} />];
  return <span style={{ color: ICON_META[iconKey % 5].color }}>{icons[iconKey % 5]}</span>;
}

/* ─── Detail Modal ─── */
function DetailModal({ persona, onClose }: { persona: Persona; onClose: () => void }) {
  const [detailTab, setDetailTab] = useState<"summary" | "activity" | "campaign">("summary");
  const engagementScore = Math.round(
    persona.purchaseIntent * 0.35 + persona.marketingAcceptance * 0.3 + persona.brandAttitude * 0.35,
  );
  const churnRisk = Math.max(
    5,
    Math.min(
      95,
      100 - Math.round(persona.brandAttitude * 0.4 + persona.marketingAcceptance * 0.25 + persona.purchaseIntent * 0.35),
    ),
  );
  const dataConfidence = Math.round((engagementScore + persona.futureValue) / 2);

  const spendTier =
    persona.monthlyTechSpend.includes("50") || persona.monthlyTechSpend.includes("30")
      ? "high"
      : persona.monthlyTechSpend.includes("20") || persona.monthlyTechSpend.includes("10")
        ? "mid"
        : "low";
  const priceSensitivity = spendTier === "high" ? "낮음" : spendTier === "mid" ? "보통" : "높음";
  const adoptionStage =
    persona.purchaseIntent >= 85 ? "즉시 전환 가능" : persona.purchaseIntent >= 65 ? "관심 단계" : "관망 단계";
  const preferredChannel =
    persona.interests.some((v) => v.includes("유튜브") || v.includes("영상"))
      ? "영상 캠페인"
      : persona.interests.some((v) => v.includes("뉴스") || v.includes("경제"))
        ? "텍스트 브리핑"
        : "SNS 숏폼";

  const actionPlan = [
    {
      title: "개인화 메시지 집행",
      detail: `${preferredChannel} 채널에서 ${persona.keywords[0]} 중심 소재를 노출`,
      impact: `예상 반응률 +${Math.max(6, Math.round(persona.marketingAcceptance / 12))}%`,
    },
    {
      title: "가격/혜택 패키지 제안",
      detail: `가격 민감도 ${priceSensitivity} 기준으로 혜택 강도 차등 적용`,
      impact: `구매의향 개선 +${Math.max(4, Math.round(persona.purchaseIntent / 20))}%p`,
    },
    {
      title: "리텐션 후속 액션",
      detail: `최근 활동 로그 기반 ${persona.device} 관련 후속 콘텐츠 큐레이션`,
      impact: `이탈 위험 ${Math.max(3, Math.round(churnRisk / 8))}%p 완화`,
    },
  ];

  const insightText =
    persona.futureValue >= 85
      ? "즉시 전환 타겟으로 분류됩니다. 혜택보다 경험 중심 메시지의 효율이 높습니다."
      : persona.futureValue >= 70
        ? "중기 성장 타겟으로 분류됩니다. 기능 신뢰와 가격 납득을 함께 설계해야 합니다."
        : "장기 육성 타겟으로 분류됩니다. 강한 세일즈보다 브랜드 친숙도 축적이 우선입니다.";

  const urgencyTone = churnRisk >= 55 ? "주의" : churnRisk >= 35 ? "관찰" : "안정";
  const urgencyCls =
    churnRisk >= 55
      ? "bg-red-50 text-red-600 border-red-100"
      : churnRisk >= 35
        ? "bg-amber-50 text-amber-600 border-amber-100"
        : "bg-emerald-50 text-emerald-600 border-emerald-100";

  return (
    <div className="app-modal-overlay">
      <div className="app-modal h-[86vh] max-w-6xl animate-in zoom-in-95 duration-300">

        {/* Modal Header */}
        <div className="app-modal-header">
          <div className="flex min-w-0 items-center gap-5">
            <div
              className="flex h-18 w-18 shrink-0 items-center justify-center rounded-2xl border bg-card shadow-lg"
              style={{ color: persona.color, borderColor: persona.color + "33" }}
            >
              <PersonaIcon iconKey={persona.iconKey} size={34} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h2 className="truncate text-[26px] font-black tracking-tight text-foreground">{persona.name}</h2>
                <span className="rounded-lg border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-primary">
                  LV.{Math.floor(persona.futureValue / 10)}
                </span>
                <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${urgencyCls}`}>
                  {urgencyTone}
                </span>
              </div>
              <p className="mt-1 text-[13px] font-bold text-muted-foreground">
                {persona.age}세 · {persona.gender} · {persona.occupation}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {persona.segments.map((seg) => (
                  <span
                    key={seg}
                    className="rounded-full border px-2 py-0.5 text-[10px] font-black uppercase"
                    style={{
                      backgroundColor: SEGMENT_COLORS[seg].bg,
                      color: SEGMENT_COLORS[seg].text,
                      borderColor: SEGMENT_COLORS[seg].border,
                    }}
                  >
                    {seg}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-all hover:bg-[var(--surface-hover)] active:scale-95"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="app-modal-body !p-0 grid grid-cols-12 overflow-hidden">

          {/* Left */}
          <div className="hide-scrollbar col-span-4 space-y-6 overflow-y-auto border-r border-border bg-[var(--panel-soft)] p-6">
            <section className="app-card p-4">
              <h3 className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                <UserCircle2 size={14} className="text-primary" /> Persona Snapshot
              </h3>
              <p className="mb-3 text-[13px] font-bold leading-relaxed text-foreground">"{persona.description}"</p>
              <div className="space-y-2.5">
                {[
                  { l: "IT 숙련도", v: persona.techLevel, i: Cpu },
                  { l: "기술 지출", v: persona.monthlyTechSpend, i: CreditCard },
                  { l: "주요 기기", v: persona.device, i: Smartphone },
                  { l: "가격 민감도", v: priceSensitivity, i: AlertCircle },
                  { l: "수용 단계", v: adoptionStage, i: Activity },
                ].map((item) => (
                  <div key={item.l} className="flex items-center justify-between rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <item.i size={13} className="text-[var(--subtle-foreground)]" />
                      <span className="text-[12px] text-muted-foreground font-bold">{item.l}</span>
                    </div>
                    <span className="text-[12px] text-foreground font-black">{item.v}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border-none p-5 text-white shadow-xl shadow-blue-200" style={{ background: "var(--brand-strong)" }}>
              <h3 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                <Target size={14} /> 핵심 점수
              </h3>
              <div className="space-y-3">
                {[
                  { label: "브랜드 선호", value: persona.brandAttitude },
                  { label: "참여도", value: engagementScore },
                  { label: "데이터 신뢰", value: dataConfidence },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white/70">{row.label}</span>
                      <span className="text-[12px] font-black">{row.value}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                      <div className="h-full rounded-full bg-white" style={{ width: `${row.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="app-card p-4">
              <h3 className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">관심사/키워드</h3>
              <div className="flex flex-wrap gap-2">
                {[...persona.interests, ...persona.keywords].map((interest) => (
                  <span key={interest} className="rounded-lg border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] px-2.5 py-1 text-[10px] font-black text-primary">
                    {interest}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[11px] font-bold text-muted-foreground">
                권장 채널: <span className="text-primary">{preferredChannel}</span>
              </p>
            </section>
          </div>

          {/* Right */}
          <div className="hide-scrollbar col-span-8 space-y-5 overflow-y-auto bg-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 rounded-xl border border-border bg-[var(--panel-soft)] p-1.5">
                {[
                  { id: "summary", label: "요약 인사이트", icon: Brain },
                  { id: "activity", label: "행동 로그", icon: History },
                  { id: "campaign", label: "캠페인 실행", icon: BarChart2 },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id as "summary" | "activity" | "campaign")}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-black transition-all ${
                      detailTab === tab.id
                        ? "border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] text-primary"
                        : "text-muted-foreground hover:bg-card hover:text-foreground"
                    }`}
                  >
                    <tab.icon size={14} />
                    {tab.label}
                  </button>
                ))}
              </div>
              <span className="rounded-md border border-border bg-[var(--panel-soft)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                AI Synthesized
              </span>
            </div>

            {detailTab === "summary" && (
              <>
                <section className="grid grid-cols-2 gap-4">
                  {[
                    { label: "미래 가치", value: `${persona.futureValue}%`, icon: TrendingUp, tone: "primary" },
                    { label: "마케팅 수용도", value: `${persona.marketingAcceptance}%`, icon: Zap, tone: "success" },
                    { label: "구매 의향", value: `${persona.purchaseIntent}%`, icon: Heart, tone: "primary" },
                    { label: "이탈 위험", value: `${churnRisk}%`, icon: AlertCircle, tone: "danger" },
                  ].map((kpi) => (
                    <div key={kpi.label} className="app-soft border-border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <kpi.icon
                            size={14}
                            className={
                              kpi.tone === "success"
                                ? "text-[var(--success)]"
                                : kpi.tone === "danger"
                                  ? "text-red-500"
                                  : "text-primary"
                            }
                          />
                          <span className="text-[12px] font-black text-foreground">{kpi.label}</span>
                        </div>
                        <span className="text-[18px] font-black text-foreground">{kpi.value}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={
                            kpi.tone === "success"
                              ? "h-full rounded-full bg-[var(--success)]"
                              : kpi.tone === "danger"
                                ? "h-full rounded-full bg-red-500"
                                : "h-full rounded-full bg-primary"
                          }
                          style={{ width: kpi.value }}
                        />
                      </div>
                    </div>
                  ))}
                </section>

                <section className="app-card p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-[13px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                    <MessageSquare size={15} className="text-primary" /> 전략 인사이트
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="app-soft p-4">
                      <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-muted-foreground">경쟁사 인식</p>
                      <p className="text-[13px] font-bold leading-relaxed text-foreground">"{persona.competitorPerception}"</p>
                    </div>
                    <div className="app-soft p-4">
                      <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-muted-foreground">종합 해석</p>
                      <p className="text-[13px] font-bold leading-relaxed text-foreground">{insightText}</p>
                    </div>
                  </div>
                </section>
              </>
            )}

            {detailTab === "activity" && (
              <section className="grid grid-cols-2 gap-4">
                <div className="app-card p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                    <Package size={14} /> 최근 구매 이력
                  </h3>
                  <div className="space-y-3">
                    {persona.purchaseHistory.map((h, i) => (
                      <div key={h + i} className="flex items-start gap-3">
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-[var(--panel-soft)] text-muted-foreground">
                          <Package size={14} />
                        </div>
                        <div>
                          <p className="text-[12px] font-black text-foreground">{h}</p>
                          <p className="text-[11px] font-bold text-muted-foreground">구매 이벤트</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="app-card p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                    <MousePointer2 size={14} /> 실시간 활동 로그
                  </h3>
                  <div className="space-y-3">
                    {persona.userLogs.map((l, i) => (
                      <div key={l + i} className="app-soft flex gap-3 border-border p-3.5">
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        <div>
                          <p className="text-[12px] font-black text-foreground">{l}</p>
                          <p className="text-[11px] font-bold text-muted-foreground">행동 패턴 수집</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {detailTab === "campaign" && (
              <>
                <section className="app-card p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-[13px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                    <Star size={15} className="text-primary" /> Next Best Actions
                  </h3>
                  <div className="space-y-3">
                    {actionPlan.map((act, idx) => (
                      <div key={act.title} className="app-soft border-border p-4">
                        <div className="mb-1 flex items-center justify-between">
                          <p className="text-[13px] font-black text-foreground">
                            {idx + 1}. {act.title}
                          </p>
                          <span className="text-[11px] font-black text-primary">{act.impact}</span>
                        </div>
                        <p className="text-[12px] font-bold text-muted-foreground">{act.detail}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="grid grid-cols-3 gap-4">
                  <div className="app-soft border-border p-3.5">
                    <p className="text-[11px] font-black uppercase text-muted-foreground">추천 채널</p>
                    <p className="mt-1 text-[13px] font-black text-foreground">{preferredChannel}</p>
                  </div>
                  <div className="app-soft border-border p-3.5">
                    <p className="text-[11px] font-black uppercase text-muted-foreground">추천 CTA</p>
                    <p className="mt-1 text-[13px] font-black text-foreground">"{persona.keywords[0]} 경험해보기"</p>
                  </div>
                  <div className="app-soft border-border p-3.5">
                    <p className="text-[11px] font-black uppercase text-muted-foreground">주의 포인트</p>
                    <p className="mt-1 text-[13px] font-black text-foreground">
                      {priceSensitivity === "높음" ? "가격/혜택 문구 우선" : "경험 가치 중심 메시지"}
                    </p>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="app-modal-footer">
          <p className="flex items-center gap-2 text-[12px] font-bold text-muted-foreground">
            <ShieldCheck size={14} className="text-[var(--success)]" /> AI 시뮬레이션 기반 프로필 업데이트 완료
          </p>
          <button
            onClick={onClose}
            className="rounded-xl bg-primary px-8 py-3 text-[13px] font-black text-white shadow-xl shadow-blue-100 transition-all hover:bg-primary-hover active:scale-95"
          >
            상세 프로필 닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export const PersonaManagerPage: React.FC = () => {
  const [personas] = useState<Persona[]>(PERSONA_LIST);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [page, setPage] = useState(1);
  const [detailTarget, setDetailTarget] = useState<Persona | undefined>();

  const paginated = personas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(personas.length / PAGE_SIZE);

  return (
    <div className="flex h-full w-full flex-col bg-background overflow-hidden">

      {/* ── 페이지 헤더 ── */}
      <div className="app-page-header shrink-0 flex items-start justify-between gap-8">
        <div>
          <p className="app-page-eyebrow">운영 관리 시스템</p>
          <h1 className="app-page-title mt-1">
            가상 페르소나 <span className="text-primary">자산 관리.</span>
          </h1>
          <p className="app-page-description">
            디지털 트윈으로 구현된 타겟 그룹별 페르소나 프로파일을 관리하고 분석에 활용합니다.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pt-1">
          <div className="flex items-center gap-2.5 bg-card border border-border rounded-xl px-4 py-2.5 shadow-sm focus-within:border-primary transition-all">
            <Search size={15} className="text-[var(--subtle-foreground)]" />
            <input className="bg-transparent outline-none text-[13px] font-bold w-44 text-foreground placeholder:text-[var(--subtle-foreground)]" placeholder="페르소나 검색..." />
          </div>
          <button className="flex items-center gap-2.5 bg-primary text-white px-6 py-2.5 rounded-xl font-black shadow-lg shadow-blue-100 hover:bg-primary-hover active:scale-95 transition-all text-[13px]">
            <Plus size={16} strokeWidth={3} /> 신규 페르소나 등록
          </button>
        </div>
      </div>

      {/* ── 본문 ── */}
      <div className="flex-1 overflow-y-auto px-8 py-7 hide-scrollbar">

        {/* 뷰 전환 툴바 */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-1.5 bg-card p-1.5 rounded-2xl border border-border shadow-sm">
            <button
              onClick={() => setViewMode("card")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-colors ${
                viewMode === "card"
                  ? "bg-[var(--primary-light-bg)] text-primary border border-[var(--primary-light-border)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              <LayoutGrid size={14} /> 카드 뷰
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-colors ${
                viewMode === "list"
                  ? "bg-[var(--primary-light-bg)] text-primary border border-[var(--primary-light-border)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              <List size={14} /> 리스트 뷰
            </button>
          </div>
          <p className="text-[11px] font-medium text-[var(--subtle-foreground)] uppercase tracking-[0.14em]">
            총 {personas.length}명의 페르소나 등록
          </p>
        </div>

        {/* ── 카드 뷰 ── */}
        {viewMode === "card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
            {paginated.map(p => {
              const riskFlag = 100 - Math.round((p.brandAttitude * 0.45 + p.marketingAcceptance * 0.25 + p.purchaseIntent * 0.3));
              const engagement = Math.round((p.brandAttitude + p.purchaseIntent + p.marketingAcceptance) / 3);
              return (
                <div key={p.id} className="app-card group relative flex flex-col overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-hover)] hover:shadow-lg">
                  <div className="absolute left-0 top-0 h-full w-1.5" style={{ background: `linear-gradient(180deg, ${p.color}, transparent)` }} />

                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-sm" style={{ backgroundColor: p.iconBg, borderColor: `${p.color}2e` }}>
                      <PersonaIcon iconKey={p.iconKey} size={21} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[15px] font-bold text-foreground">{p.name}</h3>
                      <p className="text-[11px] font-medium text-[var(--subtle-foreground)]">{p.age}세 · {p.gender} · {p.occupation}</p>
                    </div>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {p.segments.map(seg => (
                      <span
                        key={seg}
                        className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                        style={{ backgroundColor: SEGMENT_COLORS[seg].bg, color: SEGMENT_COLORS[seg].text, borderColor: SEGMENT_COLORS[seg].border }}
                      >
                        {seg}
                      </span>
                    ))}
                  </div>

                  <p className="mb-4 line-clamp-2 text-[12px] font-medium leading-relaxed text-[var(--muted-foreground)]">
                    "{p.description}"
                  </p>

                  <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-3">
                    <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-[var(--subtle-foreground)]">
                      <span>종합 참여도</span>
                      <span className="text-foreground">{engagement}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${engagement}%` }} />
                    </div>
                  </div>

                  <div className="mb-5 grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-soft)] p-2 text-center">
                      <p className="text-[10px] font-semibold uppercase text-[var(--subtle-foreground)]">Brand</p>
                      <p className="mt-1 text-[14px] font-bold text-primary">{p.brandAttitude}</p>
                    </div>
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-soft)] p-2 text-center">
                      <p className="text-[10px] font-semibold uppercase text-[var(--subtle-foreground)]">Intent</p>
                      <p className="mt-1 text-[14px] font-bold text-foreground">{p.purchaseIntent}%</p>
                    </div>
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-soft)] p-2 text-center">
                      <p className="text-[10px] font-semibold uppercase text-[var(--subtle-foreground)]">Risk</p>
                      <p className={`mt-1 text-[14px] font-bold ${riskFlag >= 50 ? "text-red-500" : riskFlag >= 35 ? "text-amber-500" : "text-emerald-600"}`}>
                        {riskFlag}%
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setDetailTarget(p)}
                    className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-2.5 text-[12px] font-semibold text-[var(--secondary-foreground)] transition-colors hover:border-[var(--primary-light-border)] hover:bg-[var(--primary-light-bg)] hover:text-primary"
                  >
                    상세 프로필 <ChevronRight size={13} />
                  </button>
                </div>
              )})}
          </div>
        ) : (
          /* ── 리스트 뷰 ── */
          <div className="app-card overflow-hidden mb-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--panel-soft)] border-b border-border">
                  <th className="px-6 py-4 text-[10px] font-semibold text-[var(--subtle-foreground)] uppercase tracking-[0.14em]">Persona</th>
                  <th className="px-6 py-4 text-[10px] font-semibold text-[var(--subtle-foreground)] uppercase tracking-[0.14em] text-center">핵심지표</th>
                  <th className="px-6 py-4 text-[10px] font-semibold text-[var(--subtle-foreground)] uppercase tracking-[0.14em] text-center">세그먼트</th>
                  <th className="px-6 py-4 text-[10px] font-semibold text-[var(--subtle-foreground)] uppercase tracking-[0.14em] text-center">Risk</th>
                  <th className="px-6 py-4 text-right text-[10px] font-semibold text-[var(--subtle-foreground)] uppercase tracking-[0.14em] pr-8">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(p => {
                  const risk = 100 - Math.round((p.brandAttitude * 0.45 + p.marketingAcceptance * 0.25 + p.purchaseIntent * 0.3));
                  return (
                  <tr key={p.id} className="border-b border-border/30 last:border-0 hover:bg-[var(--surface-hover)] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl border flex items-center justify-center shadow-sm transition-colors group-hover:border-primary/30" style={{ backgroundColor: p.iconBg, borderColor: p.color + "22" }}>
                          <PersonaIcon iconKey={p.iconKey} size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-bold text-foreground mb-0.5">{p.name}</p>
                          <p className="text-[11px] font-medium text-[var(--subtle-foreground)]">{p.age}세 · {p.gender} · {p.occupation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="text-[12px] font-semibold text-foreground">Brand {p.brandAttitude}</p>
                      <p className="text-[11px] font-medium text-[var(--subtle-foreground)]">Intent {p.purchaseIntent}% · MKT {p.marketingAcceptance}%</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {p.segments.slice(0, 2).map((seg) => (
                          <span
                            key={seg}
                            className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                            style={{ backgroundColor: SEGMENT_COLORS[seg].bg, color: SEGMENT_COLORS[seg].text, borderColor: SEGMENT_COLORS[seg].border }}
                          >
                            {seg}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${risk >= 50 ? "border-red-200 bg-red-50 text-red-600" : risk >= 35 ? "border-amber-200 bg-amber-50 text-amber-600" : "border-emerald-200 bg-emerald-50 text-emerald-600"}`}>
                        {risk}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right pr-8">
                      <button
                        onClick={() => setDetailTarget(p)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-1.5 text-[11px] font-semibold text-[var(--secondary-foreground)] transition-colors hover:border-[var(--primary-light-border)] hover:bg-[var(--primary-light-bg)] hover:text-primary"
                      >
                        상세 <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-center pt-2 pb-6">
          <AppPagination current={page} total={totalPages} onChange={setPage} />
        </div>
      </div>

      {detailTarget && <DetailModal persona={detailTarget} onClose={() => setDetailTarget(undefined)} />}
    </div>
  );
};
