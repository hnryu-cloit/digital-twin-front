import type React from "react";
import { useState, useRef, useEffect } from "react";
import { AppPagination } from "@/components/ui/AppPagination";
import {
  Search, Plus, Pencil, Trash2, MoreHorizontal, Smartphone, Users, X,
  ChevronDown, Check, UserCircle2, Gamepad2, ShoppingBag, Coffee, Briefcase,
  Music, SlidersHorizontal, RotateCcw, LayoutGrid, List, Download,
  Eye, Brain, Heart, Zap, Info, ShieldCheck, Activity, Target, AlertCircle,
  TrendingUp, History, MessageSquare, BarChart2, Star, CreditCard, MousePointer2,
  ChevronRight
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
  "MZ 얼리어답터": { bg: "#EEF4FF", text: "#316BFF", border: "#CFE0FF" },
  "프리미엄 구매자": { bg: "#FDF2F8", text: "#DB2777", border: "#FBCFE8" },
  "실용 중시 가족형": { bg: "#F0FDF4", text: "#16A34A", border: "#DCFCE7" },
  "게이밍 성향군": { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" },
  "비즈니스 프로": { bg: "#F0F9FF", text: "#0284C7", border: "#E0F2FE" },
};

const ICON_META = [
  { bg: "#EEF4FF", color: "#316BFF" },
  { bg: "#FDF2F8", color: "#DB2777" },
  { bg: "#F0F9FF", color: "#0284C7" },
  { bg: "#F5F3FF", color: "#7C3AED" },
  { bg: "#F0FDF4", color: "#16A34A" },
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

function FutureValueBadge({ value }: { value: number }) {
  let label = "High";
  let color = "text-green-600 bg-green-50 border-green-100";
  if (value < 40) { label = "Low"; color = "text-slate-400 bg-slate-50 border-slate-100"; }
  else if (value < 75) { label = "Mid"; color = "text-blue-600 bg-blue-50 border-blue-100"; }
  return <span className={`rounded px-1.5 py-0.5 text-[10px] font-black border uppercase ${color}`}>{label} {value}</span>;
}

/* ─── Detail Modal ─── */
function DetailModal({ persona, onClose }: { persona: Persona; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#DCE4F3] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-10 py-8 border-b border-slate-50 bg-[#F7FAFF] flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center shadow-xl border border-blue-50" style={{ color: persona.color }}><PersonaIcon iconKey={persona.iconKey} size={32} /></div>
            <div>
              <div className="flex items-center gap-3"><h2 className="text-[26px] font-black text-slate-900 tracking-tight">{persona.name} 상세 분석</h2><span className="bg-blue-50 text-[#2454C8] px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">LV.{Math.floor(persona.futureValue/10)} Priority</span></div>
              <p className="text-[14px] text-[#2454C8] font-black mt-1 uppercase italic tracking-[0.15em] opacity-70">{persona.segments.join(" · ")}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-all shadow-sm"><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="overflow-y-auto p-10 bg-white grid grid-cols-12 gap-8 hide-scrollbar">
          <div className="col-span-4 space-y-8">
            <section className="bg-slate-50 border border-slate-100 rounded-2xl p-7 shadow-inner">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2.5"><UserCircle2 size={14} /> Profile Basics</h3>
              <div className="space-y-4">{[{l:"연령 / 성별", v:`${persona.age}세 / ${persona.gender}`}, {l:"직업", v:persona.occupation}, {l:"IT 숙련도", v:persona.techLevel}, {l:"기술 지출", v:persona.monthlyTechSpend}].map(i=>(<div key={i.l} className="flex justify-between border-b border-white pb-3"><span className="text-[12px] text-slate-500 font-bold">{i.l}</span><span className="text-[13px] text-slate-900 font-black">{i.v}</span></div>))}</div>
            </section>
            <section className="bg-[#2454C8] rounded-2xl p-7 text-white shadow-xl shadow-blue-900/20">
              <h3 className="text-[11px] font-black text-blue-200 uppercase tracking-widest mb-5 flex items-center gap-2.5"><Target size={14} /> Brand Attitude</h3>
              <div className="flex items-end gap-2 mb-5"><span className="text-[40px] font-black leading-none">{persona.brandAttitude}</span><span className="text-[12px] font-bold opacity-60">pts / 100</span></div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-white shadow-[0_0_10px_white]" style={{ width: `${persona.brandAttitude}%` }} /></div>
            </section>
          </div>
          <div className="col-span-8 space-y-8">
            <div className="grid grid-cols-2 gap-6">
              {[{l:"미래가치 지수", v:persona.futureValue+"%", c:"bg-blue-500", i:TrendingUp}, {l:"마케팅 수용도", v:persona.marketingAcceptance+"%", c:"bg-green-500", i:Zap}].map(m=>(<section key={m.l} className="bg-white border border-slate-100 rounded-2xl p-7 shadow-sm hover:shadow-md transition-all"><h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2.5"><m.i size={14} /> {m.l}</h3><div className="flex items-center gap-5"><span className="text-[28px] font-black text-slate-900">{m.v}</span><div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden shadow-inner"><div className={`h-full ${m.c}`} style={{width:m.v}} /></div></div></section>))}
            </div>
            <section className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-8 shadow-inner"><h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2.5"><MessageSquare size={14} /> Competitor Perception</h3><p className="text-[15px] text-slate-700 font-bold leading-relaxed italic">"{persona.competitorPerception}"</p></section>
            <div className="grid grid-cols-2 gap-8">
              <section className="space-y-4">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2.5">
                  <CreditCard size={14} /> Purchase History
                </h3>
                <div className="space-y-2">
                  {persona.purchaseHistory.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-[12px] text-slate-700 font-bold">{h}</span>
                    </div>
                  ))}
                </div>
              </section>
              <section className="space-y-4">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2.5">
                  <MousePointer2 size={14} /> User Activity Logs
                </h3>
                <div className="space-y-2">
                  {persona.userLogs.map((l, i) => (
                    <div key={i} className="app-soft flex items-center gap-3 p-4 italic">
                      <History size={12} className="text-slate-300" />
                      <span className="text-[11px] text-slate-500 font-bold leading-tight">{l}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
        <div className="px-10 py-8 border-t border-slate-50 bg-[#F7FAFF] flex justify-end"><button onClick={onClose} className="px-10 py-3.5 bg-[#2454C8] text-white rounded-2xl font-black shadow-xl shadow-blue-100 active:scale-95 transition-all text-[14px]">분석 결과 확인 완료</button></div>
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
    <div className="flex h-full w-full flex-col bg-[#F8FAFC] overflow-hidden">
      {/* Welcome Header */}
      <div className="px-10 py-8 shrink-0">
        <section className="rounded-2xl border border-border/90 bg-card p-8 shadow-elevated relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-all duration-1000" />
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Management System</p>
            <h1 className="mt-2 font-title text-3xl font-bold leading-tight text-slate-900 md:text-4xl tracking-tight">
              가상 페르소나 <span className="text-primary">자산 관리.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-base font-medium text-slate-500">
              디지털 트윈으로 구현된 타겟 그룹별 페르소나 프로파일을 관리하고 분석에 활용합니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-5 py-2.5 shadow-sm focus-within:border-primary transition-all">
                <Search size={16} className="text-slate-300" />
                <input className="bg-transparent outline-none text-[13px] font-bold w-48" placeholder="페르소나 검색..." />
              </div>
              <button className="flex items-center gap-2.5 bg-[#2454C8] text-white px-6 py-3 rounded-xl font-black shadow-xl shadow-blue-100 hover:bg-[#1E46A8] active:scale-95 transition-all text-[14px]">
                <Plus size={18} strokeWidth={3} /> 신규 등록
              </button>
            </div>
          </div>
        </section>
      </div>

      <div className="flex-1 overflow-y-auto px-10 pb-10 hide-scrollbar bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
              <button onClick={() => setViewMode("card")} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-black transition-all ${viewMode === "card" ? "bg-[#EDF3FF] text-[#2454C8] shadow-sm" : "text-slate-400 hover:bg-slate-50"}`}><LayoutGrid size={14} /> 카드 뷰</button>
              <button onClick={() => setViewMode("list")} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-black transition-all ${viewMode === "list" ? "bg-[#EDF3FF] text-[#2454C8] shadow-sm" : "text-slate-400 hover:bg-slate-50"}`}><List size={14} /> 리스트 뷰</button>
            </div>
            <div className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Total {personas.length} Personas Registered</div>
          </div>

          {viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
              {paginated.map(p => (
                <div key={p.id} className="app-card group relative flex flex-col p-8 transition-all duration-300 hover:shadow-lg hover:border-primary/30">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 shadow-sm transition-transform group-hover:scale-105" style={{ color: p.color }}>
                        <PersonaIcon iconKey={p.iconKey} size={24} />
                      </div>
                      <div>
                        <h3 className="text-[17px] font-black text-slate-900 tracking-tight mb-0.5">{p.name}</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                          {p.age}세 · {p.gender} · {p.occupation}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 rounded-xl text-slate-300 hover:bg-slate-50 hover:text-slate-600 transition-all">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  <div className="app-soft p-5 mb-6 italic">
                    <p className="text-[13px] text-slate-600 font-bold leading-relaxed line-clamp-2">
                      "{p.description}"
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {p.segments.map(seg => (
                      <span key={seg} className="px-3 py-1.5 bg-white border border-slate-100 rounded-full text-[10px] font-black text-primary shadow-sm uppercase tracking-tight">
                        {seg}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Brand Score</span>
                      <span className="text-[18px] font-black text-primary tracking-tighter">
                        {p.brandAttitude}<span className="text-[11px] ml-0.5 text-slate-300 font-bold uppercase">pts</span>
                      </span>
                    </div>
                    <button 
                      onClick={() => setDetailTarget(p)} 
                      className="flex items-center gap-2 bg-[#F8FAFC] border border-slate-100 text-slate-600 px-5 py-2.5 rounded-xl text-[12px] font-black hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all shadow-sm"
                    >
                      상세 프로필 <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="app-card overflow-hidden mb-12">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Persona Profile</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Brand Score</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Future Val</th>
                    <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest pr-12">Analysis</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(p => (
                    <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shadow-sm group-hover:bg-white" style={{ color: p.color }}>
                            <PersonaIcon iconKey={p.iconKey} size={18} />
                          </div>
                          <div>
                            <p className="text-[14px] font-black text-slate-900 mb-0.5">{p.name}</p>
                            <p className="text-[11px] text-slate-400 font-bold">{p.age}세 · {p.gender} · {p.occupation}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center font-black text-primary">{p.brandAttitude}</td>
                      <td className="px-8 py-6 text-center"><FutureValueBadge value={p.futureValue} /></td>
                      <td className="px-8 py-6 text-right pr-12">
                        <button onClick={() => setDetailTarget(p)} className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-blue-50 transition-all">
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-center pb-20"><AppPagination current={page} total={totalPages} onChange={setPage} /></div>
        </div>
      </div>
      {detailTarget && <DetailModal persona={detailTarget} onClose={() => setDetailTarget(undefined)} />}
    </div>
  );
};
