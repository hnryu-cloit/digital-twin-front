import type React from"react";
import { useState, useEffect } from"react";
import { fetchIndividualPersonas } from "@/lib/api";
import { AppPagination } from"@/components/ui/AppPagination";
import {
 Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from"@/components/ui/table";
import { Button } from"@/components/ui/button";
import { Badge } from"@/components/ui/badge";
import {
 Search, Plus, Smartphone, X,
 UserCircle2, Gamepad2, Coffee, Briefcase,
 Music, LayoutGrid, List,
 Brain, Heart, Zap, ShieldCheck, Activity, Target, AlertCircle,
 TrendingUp, History, MessageSquare, BarChart2, Star, CreditCard, MousePointer2,
 ChevronRight, Cpu, Package
} from"lucide-react";

/* ─── Types ─── */
type Gender ="남성" |"여성";
type Segment ="MZ 얼리어답터" |"프리미엄 구매자" |"실용 중시 가족형" |"게이밍 성향군" |"비즈니스 프로";
type TechLevel ="초보" |"중급" |"전문가";

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
  "MZ 얼리어답터":    { bg: "#eef3ff", text: "#2f66ff", border: "#c9d8ff" },
  "프리미엄 구매자":  { bg: "#eef3ff", text: "#2f66ff", border: "#c9d8ff" },
  "실용 중시 가족형": { bg: "#eef3ff", text: "#2f66ff", border: "#c9d8ff" },
  "게이밍 성향군":    { bg: "#eef3ff", text: "#2f66ff", border: "#c9d8ff" },
  "비즈니스 프로":    { bg: "#eef3ff", text: "#2f66ff", border: "#c9d8ff" },
};


const ICON_META = [
  { bg: "#eef3ff", color: "#2f66ff" },
  { bg: "#eef3ff", color: "#2f66ff" },
  { bg: "#eef3ff", color: "#2f66ff" },
  { bg: "#eef3ff", color: "#2f66ff" },
  { bg: "#eef3ff", color: "#2f66ff" },
];
const PAGE_SIZE = 6;

/* ─── Mock Data (20 Personas for 3+ pages) ─── */
const RAW_PERSONAS: Omit<Persona,"id">[] = [
 { name:"이준혁", age:28, gender:"남성", occupation:"게임 개발자", device:"Galaxy S24 Ultra", segments:["MZ 얼리어답터","게이밍 성향군"], keywords:["고성능","AI카메라","멀티태스킹"], purchaseIntent:92, iconKey:0, color:"var(--primary)", iconBg:"#eef3ff", description:"최신 모바일 기술에 관심 많은 20대 남성 게이머. 성능과 스펙을 최우선으로 고려함.", techLevel:"전문가", monthlyTechSpend:"50만원 이상", interests: ["고성능 게임","AI 자동화","영상 편집"], competitorPerception:"아이폰 프로 모델 대비 갤럭시의 자유도와 카메라 줌 성능을 높게 평가하나 브랜드 이미지는 약하다고 느낌.", marketingAcceptance: 85, futureValue: 94, purchaseHistory: ["S24 Ultra (2024)","Tab S9 Ultra (2023)"], userLogs: ["갤럭시 스토어 런처 실행 (2시간 전)"], brandAttitude: 88 },
 { name:"김지연", age:34, gender:"여성", occupation:"디지털 마케터", device:"Z Flip6", segments:["MZ 얼리어답터","프리미엄 구매자"], keywords:["디자인","트렌드","SNS"], purchaseIntent:78, iconKey:1, color:"#2f66ff", iconBg:"#eef3ff", description:"트렌드에 민감한 30대 여성 마케터. 디자인과 브랜드 가치를 중시하며 SNS 활동이 활발함.", techLevel:"중급", monthlyTechSpend:"20-30만원", interests: ["패션/뷰티","사진 촬영","자기계발"], competitorPerception:"갤럭시의 폴더블 폼팩터는 혁신적이라고 생각하나, 감성적인 측면에서 보완이 필요하다고 느낌.", marketingAcceptance: 92, futureValue: 81, purchaseHistory: ["Z Flip6 (2024)","Buds3 Pro (2024)"], userLogs: ["인스타그램 업로드용 카메라 앱 사용 (1시간 전)"], brandAttitude: 75 },
 { name:"박민수", age:45, gender:"남성", occupation:"금융 컨설턴트", device:"S24+", segments:["비즈니스 프로","실용 중시 가족형"], keywords:["업무효율","보안","배터리"], purchaseIntent:65, iconKey:2, color:"#2f66ff", iconBg:"#eef3ff", description:"안정성과 업무 연속성을 중시하는 40대 전문직. 신기술보다는 검증된 유용성을 선호함.", techLevel:"중급", monthlyTechSpend:"10-20만원", interests: ["재테크","뉴스 구독","골프"], competitorPerception:"갤럭시의 통화 녹음과 삼성 페이를 핵심 기능으로 인지하며 업무용으로는 대체 불가능하다고 생각함.", marketingAcceptance: 45, futureValue: 72, purchaseHistory: ["S24+ (2024)","Watch6 (2023)"], userLogs: ["Samsung Notes 동기화 (30분 전)"], brandAttitude: 90 },
 { name:"최수아", age:23, gender:"여성", occupation:"대학생", device:"A55", segments:["MZ 얼리어답터"], keywords:["가성비","카메라","디자인"], purchaseIntent:85, iconKey:3, color:"#2f66ff", iconBg:"#eef3ff", description:"가성비를 중시하면서도 최신 트렌드를 쫓는 대학생. 브이로그 촬영을 즐김.", techLevel:"초보", monthlyTechSpend:"5만원 미만", interests: ["유튜브 시청","여행","사진 어플"], competitorPerception:"아이폰을 선호하지만 가격 부담으로 갤럭시 A시리즈를 선택함.", marketingAcceptance: 95, futureValue: 60, purchaseHistory: ["A55 (2024)"], userLogs: ["카메라 필터 앱 연동 (어제)"], brandAttitude: 65 },
 { name:"정태영", age:39, gender:"남성", occupation:"건축가", device:"Z Fold6", segments:["프리미엄 구매자","비즈니스 프로"], keywords:["대화면","멀티태스킹","S펜"], purchaseIntent:98, iconKey:4, color:"#2f66ff", iconBg:"#eef3ff", description:"도면 확인 및 수정 작업이 잦은 30대 후반 건축가. 넓은 화면과 S펜 활용을 필수적으로 여김.", techLevel:"전문가", monthlyTechSpend:"30-50만원", interests: ["건축 디자인","스마트홈","자동차"], competitorPerception:"애플 생태계보다 윈도우/안드로이드 연동성을 높게 평가함.", marketingAcceptance: 60, futureValue: 88, purchaseHistory: ["Z Fold6 (2024)","Tab S9 (2023)"], userLogs: ["Samsung Notes 도면 스케치 (오전)"], brandAttitude: 95 },
 { name:"한소희", age:42, gender:"여성", occupation:"학원 강사", device:"S23", segments:["실용 중시 가족형"], keywords:["배터리","안정성","카메라"], purchaseIntent:50, iconKey:1, color:"#2f66ff", iconBg:"#eef3ff", description:"가족 사진 촬영과 연락 수단으로 스마트폰을 사용하는 40대 워킹맘.", techLevel:"초보", monthlyTechSpend:"5-10만원", interests: ["육아","교육","쇼핑"], competitorPerception:"타 브랜드에 대한 관심이 적고 기존에 쓰던 브랜드를 계속 쓰는 성향.", marketingAcceptance: 40, futureValue: 65, purchaseHistory: ["S23 (2023)"], userLogs: ["카카오톡 장시간 사용 (상시)"], brandAttitude: 80 },
 { name:"강현우", age:19, gender:"남성", occupation:"고등학생", device:"S23 FE", segments:["게이밍 성향군"], keywords:["게임","디스플레이","가성비"], purchaseIntent:80, iconKey:0, color:"var(--primary)", iconBg:"#eef3ff", description:"모바일 게임을 즐겨하는 10대. 고주사율 디스플레이와 쿨링 성능에 민감함.", techLevel:"중급", monthlyTechSpend:"5만원 미만", interests: ["모바일 e스포츠","웹툰","PC 하드웨어"], competitorPerception:"아이폰의 게이밍 성능을 부러워하나 안드로이드의 앱 생태계를 선호함.", marketingAcceptance: 90, futureValue: 75, purchaseHistory: ["S23 FE (2023)"], userLogs: ["게임 런처 통해 원신 2시간 플레이 (어젯밤)"], brandAttitude: 70 },
 { name:"유진아", age:31, gender:"여성", occupation:"UX 디자이너", device:"Z Flip5", segments:["MZ 얼리어답터","프리미엄 구매자"], keywords:["커스터마이징","감성","카메라"], purchaseIntent:75, iconKey:3, color:"#2f66ff", iconBg:"#eef3ff", description:"자신만의 스타일로 기기를 꾸미는 것을 좋아하는 30대 초반 디자이너.", techLevel:"중급", monthlyTechSpend:"10-20만원", interests: ["인테리어","전시회","디자인 툴"], competitorPerception:"아이폰의 감성을 좋아하지만 플립의 폼팩터 매력 때문에 넘어옴.", marketingAcceptance: 85, futureValue: 80, purchaseHistory: ["Z Flip5 (2023)"], userLogs: ["커버 화면 GIF 교체 (오늘 아침)"], brandAttitude: 82 },
 { name:"조상민", age:55, gender:"남성", occupation:"개인사업자", device:"Z Fold5", segments:["비즈니스 프로"], keywords:["큰화면","신뢰감","주식"], purchaseIntent:60, iconKey:2, color:"#2f66ff", iconBg:"#eef3ff", description:"주식 차트와 이메일 확인을 위해 큰 화면을 선호하는 50대 사업가.", techLevel:"초보", monthlyTechSpend:"10만원 미만", interests: ["주식","부동산","뉴스"], competitorPerception:"폴더블 기술력에 대한 높은 신뢰, 타사는 고려하지 않음.", marketingAcceptance: 30, futureValue: 70, purchaseHistory: ["Z Fold5 (2023)"], userLogs: ["증권사 앱 다중 분할 화면 사용 (오전 9시)"], brandAttitude: 98 },
 { name:"임도윤", age:26, gender:"남성", occupation:"유튜버", device:"S24 Ultra", segments:["MZ 얼리어답터","프리미엄 구매자"], keywords:["동영상","마이크","저장용량"], purchaseIntent:95, iconKey:4, color:"#2f66ff", iconBg:"#eef3ff", description:"야외 브이로그 촬영을 주로 하는 20대 후반 크리에이터. 카메라 렌즈 성능과 손떨림 방지를 가장 중요하게 생각함.", techLevel:"전문가", monthlyTechSpend:"30만원 이상", interests: ["영상 편집","카메라 장비","여행"], competitorPerception:"비디오 촬영 시 아이폰의 색감을 선호하기도 하지만, 오디오 녹음 및 줌 성능에서 울트라를 선택.", marketingAcceptance: 88, futureValue: 96, purchaseHistory: ["S24 Ultra (2024)","Buds2 Pro (2022)"], userLogs: ["Pro Video 모드 4K 촬영 (어제 낮)"], brandAttitude: 85 },
 { name:"박은지", age:29, gender:"여성", occupation:"회사원", device:"S24", segments:["MZ 얼리어답터"], keywords:["휴대성","디자인","AI통번역"], purchaseIntent:82, iconKey:1, color:"#2f66ff", iconBg:"#eef3ff", description:"해외 출장과 여행이 잦은 20대 후반 직장인. 가벼운 기기와 실시간 번역 기능에 만족함.", techLevel:"중급", monthlyTechSpend:"10만원 대", interests: ["해외 여행","외국어","카페 투어"], competitorPerception:"애플은 불편하고 갤럭시는 무겁다는 편견이 있었으나 일반 모델의 그립감에 만족함.", marketingAcceptance: 75, futureValue: 84, purchaseHistory: ["S24 (2024)","Watch5 (2022)"], userLogs: ["통화 중 실시간 통번역 사용 (3일 전)"], brandAttitude: 89 },
 { name:"송지훈", age:35, gender:"남성", occupation:"프리랜서", device:"S23+", segments:["실용 중시 가족형"], keywords:["배터리타임","화면크기","내구성"], purchaseIntent:55, iconKey:2, color:"#2f66ff", iconBg:"#eef3ff", description:"차량 이동이 많고 내비게이션을 자주 쓰는 프리랜서. 배터리 소모가 적고 화면이 적당히 큰 플러스 모델을 선호.", techLevel:"중급", monthlyTechSpend:"5만원 미만", interests: ["자동차","캠핑","OTT"], competitorPerception:"기능적 차이에 크게 민감하지 않으며, AS 편의성 때문에 삼성을 유지함.", marketingAcceptance: 50, futureValue: 68, purchaseHistory: ["S23+ (2023)"], userLogs: ["Android Auto 무선 연결 3시간 (어제)"], brandAttitude: 80 },
 { name:"이채원", age:22, gender:"여성", occupation:"대학생", device:"Z Flip6", segments:["MZ 얼리어답터"], keywords:["인스타","셀피","콤팩트"], purchaseIntent:90, iconKey:3, color:"#2f66ff", iconBg:"#eef3ff", description:"친구들과 사진 찍기를 좋아하며 인스타그램을 활발히 하는 대학생. 플립의 플렉스 모드 촬영을 애용함.", techLevel:"중급", monthlyTechSpend:"5-10만원", interests: ["패션","뷰티","핫플 탐방"], competitorPerception:"아이폰 사용자 친구들이 많아 소외감을 느끼기도 하지만, 플립의 디자인으로 차별화를 둠.", marketingAcceptance: 95, futureValue: 78, purchaseHistory: ["Z Flip6 (2024)"], userLogs: ["플렉스 모드로 릴스 촬영 (오늘 오후)"], brandAttitude: 76 },
 { name:"김동현", age:48, gender:"남성", occupation:"영업팀장", device:"Z Fold6", segments:["비즈니스 프로","프리미엄 구매자"], keywords:["화면분할","문서작업","배터리"], purchaseIntent:85, iconKey:4, color:"#2f66ff", iconBg:"#eef3ff", description:"외근이 잦고 고객에게 자료를 보여줄 일이 많은 40대 후반 영업팀장.", techLevel:"중급", monthlyTechSpend:"20만원 대", interests: ["골프","경제","자기계발"], competitorPerception:"업무용으로는 갤럭시가 유일한 선택지라고 굳게 믿음.", marketingAcceptance: 65, futureValue: 89, purchaseHistory: ["Z Fold6 (2024)","Watch6 Classic (2023)"], userLogs: ["PDF 뷰어와 카카오톡 동시 띄우기 (1시간 전)"], brandAttitude: 96 },
 { name:"서유리", age:27, gender:"여성", occupation:"일러스트레이터", device:"S24 Ultra", segments:["게이밍 성향군"], keywords:["S펜","드로잉","고해상도"], purchaseIntent:70, iconKey:0, color:"var(--primary)", iconBg:"#eef3ff", description:"이동 중에도 아이디어를 스케치하는 20대 후반 프리랜서 작가.", techLevel:"전문가", monthlyTechSpend:"15만원 대", interests: ["웹툰","전시","일러스트"], competitorPerception:"아이패드를 메인으로 쓰지만, 스마트폰은 펜이 내장된 울트라가 편해서 씀.", marketingAcceptance: 80, futureValue: 82, purchaseHistory: ["S24 Ultra (2024)"], userLogs: ["Penup 앱으로 30분간 스케치 (오늘 오전)"], brandAttitude: 84 },
 { name:"황인호", age:33, gender:"남성", occupation:"백엔드 개발자", device:"S23", segments:["실용 중시 가족형"], keywords:["작은크기","가벼움","가성비"], purchaseIntent:40, iconKey:2, color:"#2f66ff", iconBg:"#eef3ff", description:"IT 기기에 관심은 많지만 스마트폰은 전화와 메시지 용도로만 쓰는 실용주의자.", techLevel:"전문가", monthlyTechSpend:"5만원 미만", interests: ["코딩","스팀 게임","테크 리뷰"], competitorPerception:"모든 스마트폰이 상향 평준화되었다고 생각하여 비싼 기기 구매를 꺼림.", marketingAcceptance: 20, futureValue: 60, purchaseHistory: ["S23 (2023)"], userLogs: ["삼성 페이 간편 결제 (방금 전)"], brandAttitude: 70 },
 { name:"박지민", age:25, gender:"여성", occupation:"취업준비생", device:"A34", segments:["실용 중시 가족형"], keywords:["가성비","인강","배터리"], purchaseIntent:60, iconKey:1, color:"#2f66ff", iconBg:"#eef3ff", description:"주로 도서관에서 인강을 듣는 취준생. 통신비와 기기값이 저렴한 모델을 선호함.", techLevel:"초보", monthlyTechSpend:"5만원 미만", interests: ["취업","토익","유튜브"], competitorPerception:"취업 후에는 플래그십 모델(아이폰 또는 S시리즈)로 넘어가고 싶어 함.", marketingAcceptance: 80, futureValue: 65, purchaseHistory: ["A34 (2023)"], userLogs: ["유튜브 인강 재생 4시간 (어제)"], brandAttitude: 68 },
 { name:"최건우", age:30, gender:"남성", occupation:"마케팅 대행사 AE", device:"S24+", segments:["MZ 얼리어답터","프리미엄 구매자"], keywords:["디자인","성능균형","AI요약"], purchaseIntent:88, iconKey:0, color:"var(--primary)", iconBg:"#eef3ff", description:"트렌드에 민감하고 미팅이 많은 30대 초반 직장인. AI 회의록 요약 기능을 가장 유용하게 씀.", techLevel:"중급", monthlyTechSpend:"10-15만원", interests: ["트렌드 리서치","운동","맛집 탐방"], competitorPerception:"업무 효율성 측면에서 갤럭시의 AI 기능이 경쟁사를 압도한다고 평가함.", marketingAcceptance: 85, futureValue: 90, purchaseHistory: ["S24+ (2024)","Buds2 (2022)"], userLogs: ["음성 녹음 후 AI 요약 텍스트 변환 (어제 오후)"], brandAttitude: 92 },
 { name:"윤보라", age:37, gender:"여성", occupation:"요가 강사", device:"Z Flip5", segments:["실용 중시 가족형"], keywords:["휴대성","거치촬영","건강관리"], purchaseIntent:75, iconKey:3, color:"#2f66ff", iconBg:"#eef3ff", description:"수업 동작을 촬영하고 SNS에 올리는 요가 강사. 삼각대 없이 바닥에 두고 찍기 편한 점을 최고로 꼽음.", techLevel:"초보", monthlyTechSpend:"5만원 대", interests: ["요가","다이어트식단","명상"], competitorPerception:"Z Flip의 폼팩터 자체가 타사 대비 압도적인 장점이라 생각함.", marketingAcceptance: 70, futureValue: 76, purchaseHistory: ["Z Flip5 (2023)","Watch5 (2022)"], userLogs: ["삼성 헬스 수면 측정 (오늘 아침)"], brandAttitude: 88 },
 { name:"구승민", age:41, gender:"남성", occupation:"연구원", device:"S24 Ultra", segments:["게이밍 성향군","비즈니스 프로"], keywords:["고성능","최신기술","디스플레이"], purchaseIntent:90, iconKey:4, color:"#2f66ff", iconBg:"#eef3ff", description:"기술 스펙 자체를 파고드는 것을 즐기는 40대 초반 연구원. 벤치마크 점수와 발열 제어에 예민함.", techLevel:"전문가", monthlyTechSpend:"20만원 이상", interests: ["IT 테크","모바일 게임","SF영화"], competitorPerception:"애플의 칩셋 성능은 인정하지만, 안드로이드의 파일 시스템과 자유도 때문에 갤럭시를 떠날 수 없음.", marketingAcceptance: 80, futureValue: 95, purchaseHistory: ["S24 Ultra (2024)","Watch6 (2023)","Tab S9 Ultra (2023)"], userLogs: ["Geekbench 구동 (일주일 전)"], brandAttitude: 94 }
];

const PERSONA_LIST: Persona[] = RAW_PERSONAS.map((p, i) => ({ ...p, id: `p${i + 1}` }));

/* ─── Helpers ─── */
function PersonaIcon({ iconKey, size = 20 }: { iconKey: number; size?: number }) {
 const icons = [<Gamepad2 size={size} />, <Coffee size={size} />, <Briefcase size={size} />, <Music size={size} />, <Smartphone size={size} />];
 return <span style={{ color: ICON_META[iconKey % 5].color }}>{icons[iconKey % 5]}</span>;
}

/* ─── Detail Modal ─── */
function DetailModal({ persona, onClose }: { persona: Persona; onClose: () => void }) {
 const [detailTab, setDetailTab] = useState<"summary" |"activity" |"campaign">("summary");
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
 ?"high"
 : persona.monthlyTechSpend.includes("20") || persona.monthlyTechSpend.includes("10")
 ?"mid"
 :"low";
 const priceSensitivity = spendTier ==="high" ?"낮음" : spendTier ==="mid" ?"보통" :"높음";
 const adoptionStage =
 persona.purchaseIntent >= 85 ?"즉시 전환 가능" : persona.purchaseIntent >= 65 ?"관심 단계" :"관망 단계";
 const preferredChannel =
 persona.interests.some((v) => v.includes("유튜브") || v.includes("영상"))
 ?"영상 캠페인"
 : persona.interests.some((v) => v.includes("뉴스") || v.includes("경제"))
 ?"텍스트 브리핑"
 :"SNS 숏폼";

 const actionPlan = [
 {
 title:"개인화 메시지 집행",
 detail: `${preferredChannel} 채널에서 ${persona.keywords[0]} 중심 소재를 노출`,
 impact: `예상 반응률 +${Math.max(6, Math.round(persona.marketingAcceptance / 12))}%`,
 },
 {
 title:"가격/혜택 패키지 제안",
 detail: `가격 민감도 ${priceSensitivity} 기준으로 혜택 강도 차등 적용`,
 impact: `구매의향 개선 +${Math.max(4, Math.round(persona.purchaseIntent / 20))}%p`,
 },
 {
 title:"리텐션 후속 액션",
 detail: `최근 활동 로그 기반 ${persona.device} 관련 후속 콘텐츠 큐레이션`,
 impact: `이탈 위험 ${Math.max(3, Math.round(churnRisk / 8))}%p 완화`,
 },
 ];

 const insightText =
 persona.futureValue >= 85
 ?"즉시 전환 타겟으로 분류됩니다. 혜택보다 경험 중심 메시지의 효율이 높습니다."
 : persona.futureValue >= 70
 ?"중기 성장 타겟으로 분류됩니다. 기능 신뢰와 가격 납득을 함께 설계해야 합니다."
 :"장기 육성 타겟으로 분류됩니다. 강한 세일즈보다 브랜드 친숙도 축적이 우선입니다.";

 const urgencyTone = churnRisk >= 55 ?"주의" : churnRisk >= 35 ?"관찰" :"안정";
 const urgencyCls =
 churnRisk >= 55
 ?"bg-red-50/50 text-[var(--destructive)] border-red-200"
 : churnRisk >= 35
 ?"bg-amber-50/50 text-amber-600 border-amber-200"
 :"bg-emerald-50/50 text-emerald-600 border-emerald-200";

 return (
 <div className="app-modal-overlay">
 <div className="app-modal h-[86vh] max-w-6xl animate-in zoom-in-95 duration-300 shadow-[var(--shadow-[var(--shadow-lg)])]">

 {/* Modal Header */}
 <div className="app-modal-header border-b border-[var(--border)]">
 <div className="flex min-w-0 items-center gap-5">
 <div
 className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
 style={{ backgroundColor: "#eef3ff", color: persona.color }}
 >
 <PersonaIcon iconKey={persona.iconKey} size={30} />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2.5">
 <h2 className="truncate text-[22px] font-bold tracking-tight text-foreground">{persona.name}</h2>
 <Badge variant="outline" className="border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] text-primary tracking-wider uppercase">
 LV.{Math.floor(persona.futureValue / 10)}
 </Badge>
 <Badge variant="outline" className={`tracking-wider uppercase ${urgencyCls}`}>
 {urgencyTone}
 </Badge>
 </div>
 <p className="mt-1 text-[12px] font-medium text-[var(--muted-foreground)]">
 {persona.age}세 · {persona.gender} · {persona.occupation}
 </p>
 </div>
 </div>
 <Button variant="outline" size="icon" onClick={onClose} className="h-10 w-10 text-[var(--subtle-foreground)] border-[var(--border)] hover:bg-[var(--surface-hover)] hover:text-foreground active:scale-95">
 <X size={18} />
 </Button>
 </div>

 {/* Modal Body */}
 <div className="app-modal-body !p-0 grid grid-cols-12 overflow-hidden">

 {/* Left Side Panel */}
 <div className="hide-scrollbar col-span-4 space-y-5 overflow-y-auto border-r border-[var(--border)] bg-[var(--panel-soft)] p-6">
 <section className="app-card p-5 border-[var(--border)]" style={{ boxShadow:"var(--shadow-[var(--shadow-sm)])" }}>
 <h3 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--subtle-foreground)]">
 <UserCircle2 size={13} className="text-primary" /> Persona Snapshot
 </h3>
 <p className="mb-4 text-[13px] font-medium leading-relaxed text-foreground italic">"{persona.description}"</p>
 <div className="space-y-2">
 {[
 { l:"IT 숙련도", v: persona.techLevel, i: Cpu },
 { l:"기술 지출", v: persona.monthlyTechSpend, i: CreditCard },
 { l:"주요 기기", v: persona.device, i: Smartphone },
 { l:"가격 민감도", v: priceSensitivity, i: AlertCircle },
 { l:"수용 단계", v: adoptionStage, i: Activity },
 ].map((item) => (
 <div key={item.l} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-card px-3.5 py-2.5 transition-colors hover:border-[var(--border-hover)]">
 <div className="flex items-center gap-2">
 <item.i size={13} className="text-[var(--subtle-foreground)]" />
 <span className="text-[12px] text-[var(--muted-foreground)] font-semibold">{item.l}</span>
 </div>
 <span className="text-[12px] text-foreground font-bold">{item.v}</span>
 </div>
 ))}
 </div>
 </section>

 <section className="rounded-2xl p-5 text-white shadow-[var(--shadow-[var(--shadow-md)])]" style={{ background:"var(--brand-strong)" }}>
 <h3 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/70">
 <Target size={13} /> 핵심 점수 지표
 </h3>
 <div className="space-y-4">
 {[
 { label:"브랜드 선호", value: persona.brandAttitude },
 { label:"마케팅 참여", value: engagementScore },
 { label:"데이터 신뢰", value: dataConfidence },
 ].map((row) => (
 <div key={row.label}>
 <div className="mb-1.5 flex items-center justify-between">
 <span className="text-[11px] font-medium text-white/80">{row.label}</span>
 <span className="text-[12px] font-bold">{row.value}</span>
 </div>
 <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
 <div className="h-full rounded-full bg-card" style={{ width: `${row.value}%` }} />
 </div>
 </div>
 ))}
 </div>
 </section>

 <section className="app-card p-5 border-[var(--border)]" style={{ boxShadow:"var(--shadow-[var(--shadow-sm)])" }}>
 <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--subtle-foreground)]">관심사 및 키워드</h3>
 <div className="flex flex-wrap gap-1.5">
 {[...persona.interests, ...persona.keywords].map((interest) => (
 <span key={interest} className="rounded-lg border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] px-2.5 py-1 text-[10px] font-bold text-primary">
 {interest}
 </span>
 ))}
 </div>
 <div className="mt-4 pt-4 border-t border-[var(--border)]">
 <p className="text-[11px] font-semibold text-[var(--muted-foreground)]">
 최적 캠페인 채널: <span className="text-primary font-bold">{preferredChannel}</span>
 </p>
 </div>
 </section>
 </div>

 {/* Right Main Content */}
 <div className="hide-scrollbar col-span-8 space-y-6 overflow-y-auto bg-card p-8">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-1 bg-[var(--panel-soft)] p-1 rounded-xl border border-[var(--border)]">
 {[
 { id:"summary", label:"요약 인사이트", icon: Brain },
 { id:"activity", label:"행동 패턴 로그", icon: History },
 { id:"campaign", label:"캠페인 전략", icon: BarChart2 },
 ].map((tab) => (
 <button
 key={tab.id}
 onClick={() => setDetailTab(tab.id as"summary" |"activity" |"campaign")}
 className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] font-bold transition-all ${
 detailTab === tab.id
 ?"bg-card text-primary shadow-[var(--shadow-[var(--shadow-sm)])] border border-[var(--border)]"
 :"text-[var(--subtle-foreground)] hover:text-[var(--secondary-foreground)]"
 }`}
 >
 <tab.icon size={14} />
 {tab.label}
 </button>
 ))}
 </div>
 <span className="rounded-md border border-[var(--border)] bg-[var(--panel-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--subtle-foreground)]">
 AI Analytics Engine
 </span>
 </div>

 {detailTab ==="summary" && (
 <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
 <section className="grid grid-cols-2 gap-4">
 {[
 { label:"기대 미래 가치", value: `${persona.futureValue}%`, icon: TrendingUp, color:"var(--primary)" },
 { label:"마케팅 수용도", value: `${persona.marketingAcceptance}%`, icon: Zap, color:"var(--success)" },
 { label:"현재 구매 의향", value: `${persona.purchaseIntent}%`, icon: Heart, color:"var(--primary)" },
 { label:"Churn Risk", value: `${churnRisk}%`, icon: AlertCircle, color: churnRisk > 50 ?"var(--destructive)" :"var(--warning)" },
 ].map((kpi) => (
 <div key={kpi.label} className="bg-[var(--panel-soft)] border border-[var(--border)] p-5 rounded-2xl transition-all hover:border-[var(--border-hover)]">
 <div className="mb-3 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <kpi.icon size={14} style={{ color: kpi.color }} />
 <span className="text-[12px] font-bold text-[var(--secondary-foreground)]">{kpi.label}</span>
 </div>
 <span className="text-[20px] font-bold text-foreground">{kpi.value}</span>
 </div>
 <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
 <div className="h-full rounded-full transition-all duration-1000" style={{ width: kpi.value, backgroundColor: kpi.color }} />
 </div>
 </div>
 ))}
 </section>

 <section className="app-card p-6 border-[var(--border)]" style={{ boxShadow:"var(--shadow-[var(--shadow-sm)])" }}>
 <h3 className="mb-5 flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--secondary-foreground)]">
 <MessageSquare size={16} className="text-primary" /> 전략적 행동 제언
 </h3>
 <div className="grid grid-cols-2 gap-6">
 <div className="bg-[var(--panel-soft)] p-5 rounded-2xl border border-[var(--border)]">
 <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--subtle-foreground)]">경쟁사 인식 현황</p>
 <p className="text-[13px] font-semibold leading-relaxed text-foreground">"{persona.competitorPerception}"</p>
 </div>
 <div className="bg-[var(--panel-soft)] p-5 rounded-2xl border border-[var(--border)]">
 <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--subtle-foreground)]">데이터 종합 진단</p>
 <p className="text-[13px] font-semibold leading-relaxed text-foreground">{insightText}</p>
 </div>
 </div>
 </section>
 </div>
 )}

 {detailTab ==="activity" && (
 <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 grid grid-cols-2 gap-6">
 <div className="app-card p-6 border-[var(--border)]">
 <h3 className="mb-5 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--secondary-foreground)]">
 <Package size={15} /> 최근 구매/소유 이력
 </h3>
 <div className="space-y-4">
 {persona.purchaseHistory.map((h, i) => (
 <div key={h + i} className="flex items-center gap-3.5 group">
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] text-[var(--subtle-foreground)] group-hover:bg-[var(--primary-light-bg)] group-hover:text-primary transition-colors">
 <Package size={15} />
 </div>
 <div>
 <p className="text-[13px] font-bold text-foreground">{h}</p>
 <p className="text-[11px] font-medium text-[var(--muted-foreground)]">Device Purchase</p>
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className="app-card p-6 border-[var(--border)]">
 <h3 className="mb-5 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--secondary-foreground)]">
 <MousePointer2 size={15} /> 실시간 디지털 활동 로그
 </h3>
 <div className="space-y-3">
 {persona.userLogs.map((l, i) => (
 <div key={l + i} className="bg-[var(--panel-soft)] border border-[var(--border)] p-4 rounded-xl flex gap-3 transition-all hover:border-[var(--border-hover)]">
 <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
 <div>
 <p className="text-[12px] font-bold text-foreground">{l}</p>
 <p className="text-[11px] font-medium text-[var(--muted-foreground)]">Activity Event Captured</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 )}

 {detailTab ==="campaign" && (
 <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
 <section className="app-card p-6 border-[var(--border)]">
 <h3 className="mb-5 flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--secondary-foreground)]">
 <Star size={16} className="text-primary" /> Next Best Actions (NBA)
 </h3>
 <div className="space-y-3">
 {actionPlan.map((act, idx) => (
 <div key={act.title} className="bg-[var(--panel-soft)] border border-[var(--border)] p-5 rounded-2xl hover:bg-[var(--surface-hover)] transition-all">
 <div className="mb-1.5 flex items-center justify-between">
 <p className="text-[14px] font-bold text-foreground">
 {idx + 1}. {act.title}
 </p>
 <span className="text-[11px] font-bold text-primary bg-card px-2 py-1 rounded-md shadow-[var(--shadow-sm)] border border-[var(--primary-light-border)]">{act.impact}</span>
 </div>
 <p className="text-[13px] font-medium text-[var(--muted-foreground)]">{act.detail}</p>
 </div>
 ))}
 </div>
 </section>

 <section className="grid grid-cols-3 gap-4">
 {[
 { l:"추천 채널", v: preferredChannel },
 { l:"추천 메시지", v: `"${persona.keywords[0]} 경험"` },
 { l:"주의 포인트", v: priceSensitivity ==="높음" ?"가격 혜택 강조" :"브랜드 가치 중심" },
 ].map((box) => (
 <div key={box.l} className="bg-[var(--panel-soft)] border border-[var(--border)] p-4 rounded-xl text-center">
 <p className="text-[10px] font-bold uppercase text-[var(--subtle-foreground)] mb-1">{box.l}</p>
 <p className="text-[12px] font-bold text-[var(--secondary-foreground)]">{box.v}</p>
 </div>
 ))}
 </section>
 </div>
 )}
 </div>
 </div>

 {/* Modal Footer */}
 <div className="app-modal-footer border-t border-[var(--border)] bg-[var(--panel-soft)]">
 <p className="flex items-center gap-2 text-[12px] font-semibold text-[var(--muted-foreground)]">
 <ShieldCheck size={14} className="text-[var(--success)]" /> AI Simulation Profile Verified
 </p>
 <Button onClick={onClose} className="px-10 text-[13px] font-bold active:scale-95">
 프로필 닫기
 </Button>
 </div>
 </div>
 </div>
 );
}

export const PersonaManagerPage: React.FC = () => {
 const [personas, setPersonas] = useState<Persona[]>([]);
 const [loading, setLoading] = useState(true);
 const [viewMode, setViewMode] = useState<"card" |"list">("card");
 const [page, setPage] = useState(1);
 const [detailTarget, setDetailTarget] = useState<Persona | undefined>();

 useEffect(() => {
   const loadData = async () => {
     try {
       setLoading(true);
       const data = await fetchIndividualPersonas(1, 1000);
       
       const mappedPersonas: Persona[] = data.items.map((item: any) => {
         const all = item.all_data;
         return {
           id: `p${item.index}`,
           name: item.name || "이름 없음",
           age: item.age,
           gender: item.gender === "M" ? "남성" : "여성",
           occupation: item.job || "직업 미상",
           device: all["[option]own_tv"] ? "Smart TV" : (all["[option]own_refrigerator"] ? "Bespoke Refrigerator" : "Galaxy S24"),
           segments: [all["[option]lifestyle_type"] || "MZ 얼리어답터"],
           keywords: [all["[option]purchase_decision_factor"] || "성능", all["[option]preferred_promotion"] || "할인"],
           purchaseIntent: all["[option]satisfaction_sentiment"] || 70,
           color: "var(--primary)",
           iconBg: "#eef3ff",
           iconKey: item.index % 5,
           description: item.personality || "가상 페르소나 설명입니다.",
           techLevel: all["[option]lifestyle_type"] === "Tech Savvy" ? "전문가" : "중급",
           monthlyTechSpend: "20-30만원",
           interests: ["가전 인테리어", "스마트싱스"],
           competitorPerception: item.samsung_experience || "브랜드 경험 정보가 없습니다.",
           marketingAcceptance: 80,
           futureValue: 85,
           purchaseHistory: ["S24 (2024)"],
           userLogs: ["SmartThings 접속 (방금 전)"],
           brandAttitude: all["[option]satisfaction_sentiment"] || 80
         };
       });
       
       setPersonas(mappedPersonas);
     } catch (error) {
       console.error("Failed to fetch personas:", error);
     } finally {
       setLoading(false);
     }
   };

   loadData();
 }, []);

 const paginated = personas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
 const totalPages = Math.ceil(personas.length / PAGE_SIZE);

 if (loading) {
   return (
     <div className="flex h-screen items-center justify-center bg-[var(--background)]">
       <div className="flex flex-col items-center gap-4">
         <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
         <p className="text-sm font-medium text-[var(--muted-foreground)]">1,000명의 디지털 트윈 데이터를 불러오는 중...</p>
       </div>
     </div>
   );
 }

 return (
 <div className="flex h-full w-full flex-col bg-background overflow-hidden">

 {/* ── 페이지 헤더 ── */}
 <div className="app-page-header shrink-0 flex items-start justify-between gap-8 border-b border-[var(--border)]">
 <div>
 <p className="app-page-eyebrow">Persona Lifecycle</p>
 <h1 className="app-page-title mt-1">
 가상 페르소나 <span className="text-primary">자산 관리.</span>
 </h1>
 <p className="app-page-description">
 디지털 트윈으로 구현된 타겟 그룹별 페르소나 프로파일을 관리하고 분석에 활용합니다.
 </p>
 </div>
 <div className="flex items-center gap-3 shrink-0 pt-1">
 <div className="flex items-center gap-2.5 bg-card border border-[var(--border)] rounded-xl px-4 py-2.5 shadow-[var(--shadow-[var(--shadow-sm)])] focus-within:border-primary transition-colors">
 <Search size={15} className="text-[var(--subtle-foreground)]" />
 <input className="bg-transparent outline-none text-[13px] font-medium w-48 text-foreground placeholder:text-[var(--subtle-foreground)]" placeholder="페르소나 검색..." />
 </div>
 <Button size="sm" className="gap-2 text-[13px] font-bold px-5 active:scale-95">
 <Plus size={15} strokeWidth={2.5} /> 신규 등록
 </Button>
 </div>
 </div>

 {/* ── 본문 ── */}
 <div className="flex-1 overflow-y-auto px-10 pt-8 pb-4 hide-scrollbar">

 {/* 뷰 전환 툴바 */}
 <div className="flex items-center justify-between mb-8">
 <div className="flex items-center gap-1 bg-[var(--panel-soft)] p-1 rounded-xl border border-[var(--border)] shadow-[var(--shadow-[var(--shadow-sm)])]">
 <button
 onClick={() => setViewMode("card")}
 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-bold transition-all ${
 viewMode ==="card"
 ?"bg-card text-primary shadow-[var(--shadow-[var(--shadow-sm)])] border border-[var(--border)]"
 :"text-[var(--subtle-foreground)] hover:text-foreground"
 }`}
 >
 <LayoutGrid size={14} /> 카드 뷰
 </button>
 <button
 onClick={() => setViewMode("list")}
 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-bold transition-all ${
 viewMode ==="list"
 ?"bg-card text-primary shadow-[var(--shadow-[var(--shadow-sm)])] border border-[var(--border)]"
 :"text-[var(--subtle-foreground)] hover:text-foreground"
 }`}
 >
 <List size={14} /> 리스트 뷰
 </button>
 </div>
 <p className="text-[11px] font-bold text-[var(--subtle-foreground)] uppercase tracking-[0.14em]">
 총 <span className="text-primary">30,000</span>명의 자산 등록됨
 </p>
 </div>

 {/* ── 카드 뷰 ── */}
 {viewMode ==="card" ? (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
 {paginated.map(p => {
 const riskFlag = 100 - Math.round((p.brandAttitude * 0.45 + p.marketingAcceptance * 0.25 + p.purchaseIntent * 0.3));
 const riskMeta =
 riskFlag >= 50
 ? { label:"High Risk", cls:"border-red-200 bg-red-50/50 text-[var(--destructive)]" }
 : riskFlag >= 35
 ? { label:"Watch", cls:"border-amber-200 bg-amber-50/50 text-amber-600" }
 : { label:"Stable", cls:"border-emerald-200 bg-emerald-50/50 text-emerald-600" };

 return (
 <article key={p.id} className="app-card flex flex-col gap-4 p-6 transition-all hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-[var(--shadow-md)])]">
 <header className="flex items-start justify-between gap-3">
 <div className="flex items-center gap-3.5 min-w-0">
 <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: p.iconBg }}>
 <PersonaIcon iconKey={p.iconKey} size={24} />
 </div>
 <div className="min-w-0">
 <h3 className="truncate text-[16px] font-bold text-foreground">{p.name}</h3>
 <p className="text-[12px] font-medium text-[var(--muted-foreground)] mt-0.5">{p.age}세 · {p.occupation}</p>
 </div>
 </div>
 <Badge className={`uppercase tracking-tight ${riskMeta.cls}`}>
 {riskMeta.label}
 </Badge>
 </header>

 <div className="flex flex-wrap gap-1.5">
 {p.segments.map(seg => (
 <Badge
 key={seg}
 variant="outline"
 style={{ backgroundColor: SEGMENT_COLORS[seg].bg, color: SEGMENT_COLORS[seg].text, borderColor: SEGMENT_COLORS[seg].border }}
 >
 {seg}
 </Badge>
 ))}
 </div>

 <p className="line-clamp-2 text-[12px] font-medium leading-relaxed text-[var(--muted-foreground)] min-h-[36px]">
"{p.description}"
 </p>

 <footer className="flex items-center justify-between border-t border-[var(--border)] pt-4 mt-2">
 <div>
 <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--subtle-foreground)] mb-0.5">Future Value</p>
 <p className="text-[15px] font-bold text-foreground">{p.futureValue}%</p>
 </div>
 <Button
 variant="outline"
 size="sm"
 onClick={() => setDetailTarget(p)}
 className="gap-1.5 text-[12px] font-bold text-[var(--secondary-foreground)] border-[var(--border)] bg-[var(--panel-soft)] hover:border-[var(--primary-light-border)] hover:bg-[var(--primary-light-bg)] hover:text-primary active:scale-95"
 >
 상세 분석 <ChevronRight size={13} />
 </Button>
 </footer>
 </article>
 );
 })}
 </div>
 ) : (
 /* ── 리스트 뷰 ── */
 <div className="app-card overflow-hidden mb-12 border-[var(--border)] shadow-[var(--shadow-[var(--shadow-md)])]">
 <Table>
 <TableHeader>
 <TableRow className="bg-[var(--panel-soft)] hover:bg-[var(--panel-soft)] border-b border-[var(--border)]">
 <TableHead className="px-6 py-4 text-[10px] font-bold text-[var(--subtle-foreground)] uppercase tracking-[0.14em] h-auto">페르소나 프로필</TableHead>
 <TableHead className="px-6 py-4 text-[10px] font-bold text-[var(--subtle-foreground)] uppercase tracking-[0.14em] h-auto">세그먼트</TableHead>
 <TableHead className="px-6 py-4 text-[10px] font-bold text-[var(--subtle-foreground)] uppercase tracking-[0.14em] h-auto">기기</TableHead>
 <TableHead className="px-6 py-4 text-[10px] font-bold text-[var(--subtle-foreground)] uppercase tracking-[0.14em] h-auto text-center">브랜드 / 의향</TableHead>
 <TableHead className="px-6 py-4 text-[10px] font-bold text-[var(--subtle-foreground)] uppercase tracking-[0.14em] h-auto text-center">미래 가치</TableHead>
 <TableHead className="px-6 py-4 text-[10px] font-bold text-[var(--subtle-foreground)] uppercase tracking-[0.14em] h-auto text-center">마케팅 수용도</TableHead>
 <TableHead className="px-6 py-4 text-[10px] font-bold text-[var(--subtle-foreground)] uppercase tracking-[0.14em] h-auto text-center">이탈 위험</TableHead>
 <TableHead className="px-6 py-4 text-[10px] font-bold text-[var(--subtle-foreground)] uppercase tracking-[0.14em] h-auto text-right pr-8">상세 분석</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {paginated.map(p => {
 const risk = 100 - Math.round(p.brandAttitude * 0.45 + p.marketingAcceptance * 0.25 + p.purchaseIntent * 0.3);
 const riskCls = risk >= 50
 ? "border-red-200 bg-red-50/50 text-[var(--destructive)]"
 : risk >= 35
 ? "border-amber-200 bg-amber-50/50 text-amber-600"
 : "border-emerald-200 bg-emerald-50/50 text-emerald-600";
 return (
 <TableRow key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors group">
 <TableCell className="px-6 py-4">
 <div className="flex items-center gap-4">
 <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: p.iconBg }}>
 <PersonaIcon iconKey={p.iconKey} size={20} />
 </div>
 <div>
 <p className="text-[14px] font-bold text-foreground mb-0.5">{p.name}</p>
 <p className="text-[11px] font-semibold text-[var(--muted-foreground)]">{p.age}세 · {p.occupation}</p>
 </div>
 </div>
 </TableCell>
 <TableCell className="px-6 py-4">
 <div className="flex flex-wrap gap-1">
 {p.segments.map(seg => (
 <Badge key={seg} variant="outline" style={{ backgroundColor: SEGMENT_COLORS[seg].bg, color: SEGMENT_COLORS[seg].text, borderColor: SEGMENT_COLORS[seg].border }}>
 {seg}
 </Badge>
 ))}
 </div>
 </TableCell>
 <TableCell className="px-6 py-4">
 <div className="flex items-center gap-1.5">
 <Smartphone size={12} className="text-[var(--subtle-foreground)] shrink-0" />
 <span className="text-[12px] font-semibold text-[var(--secondary-foreground)] whitespace-nowrap">{p.device}</span>
 </div>
 </TableCell>
 <TableCell className="px-6 py-4 text-center">
 <p className="text-[14px] font-bold text-primary">{p.brandAttitude}</p>
 <p className="text-[10px] font-bold text-[var(--subtle-foreground)] uppercase">Intent {p.purchaseIntent}%</p>
 </TableCell>
 <TableCell className="px-6 py-4 text-center">
 <p className="text-[14px] font-bold text-foreground">{p.futureValue}%</p>
 </TableCell>
 <TableCell className="px-6 py-4 text-center">
 <p className="text-[14px] font-bold text-foreground">{p.marketingAcceptance}%</p>
 </TableCell>
 <TableCell className="px-6 py-4 text-center">
 <Badge className={`uppercase ${riskCls}`}>{risk}%</Badge>
 </TableCell>
 <TableCell className="px-6 py-4 text-right pr-8">
 <Button variant="outline" size="sm" onClick={() => setDetailTarget(p)} className="gap-1.5 text-[12px] font-bold text-[var(--secondary-foreground)] border-[var(--border)] bg-[var(--panel-soft)] hover:border-[var(--primary-light-border)] hover:bg-[var(--primary-light-bg)] hover:text-primary">
 상세 <ChevronRight size={13} />
 </Button>
 </TableCell>
 </TableRow>
 );
 })}
 </TableBody>
 </Table>
 </div>
 )}
 <div className="flex justify-center pt-2 pb-10">
 <AppPagination current={page} total={totalPages} onChange={setPage} />
 </div>
 </div>

 {detailTarget && <DetailModal persona={detailTarget} onClose={() => setDetailTarget(undefined)} />}
 </div>
 );
};
