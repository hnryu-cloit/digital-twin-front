import type React from "react";
import {
  BarChart2,
  Database,
  Eye,
  Globe,
  Layers,
  MessageSquare,
  Package,
  Star,
  Target,
  Users,
} from "lucide-react";

export type SurveyType = {
  id: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  tags: string[];
  questions: number;
  duration: string;
  difficulty: "쉬움" | "보통" | "전문";
  popular?: boolean;
  category: string;
};

export const SURVEY_TYPES: SurveyType[] = [
  { id: "st1", icon: Target, title: "컨셉 테스트", desc: "신제품·서비스 컨셉의 소비자 반응 및 수용도를 측정합니다.", tags: ["신제품", "아이디어 검증"], questions: 18, duration: "8–12분", difficulty: "보통", popular: true, category: "제품" },
  { id: "st2", icon: BarChart2, title: "Usage 조사", desc: "제품·서비스의 실제 사용 행태와 패턴을 심층 분석합니다.", tags: ["사용 행태", "빈도"], questions: 22, duration: "10–15분", difficulty: "보통", popular: true, category: "사용자" },
  { id: "st3", icon: Globe, title: "브랜드 인식 조사", desc: "브랜드 인지도, 이미지, 경쟁 포지셔닝을 종합 분석합니다.", tags: ["브랜드", "인지도"], questions: 25, duration: "12–18분", difficulty: "전문", popular: true, category: "브랜드" },
  { id: "st4", icon: Star, title: "고객 만족도 (CSAT/NPS)", desc: "제품·서비스 만족도와 추천 의향을 정량적으로 측정합니다.", tags: ["만족도", "NPS"], questions: 14, duration: "5–8분", difficulty: "쉬움", category: "만족도" },
  { id: "st5", icon: Eye, title: "광고 효과 측정", desc: "광고 소재·캠페인의 인지도와 태도 변화를 측정합니다.", tags: ["광고", "캠페인"], questions: 16, duration: "7–10분", difficulty: "보통", category: "마케팅" },
  { id: "st6", icon: Package, title: "패키지 테스트", desc: "패키지 디자인, 컬러, 카피에 대한 소비자 반응을 측정합니다.", tags: ["디자인", "패키지"], questions: 20, duration: "10–14분", difficulty: "보통", category: "제품" },
];

export type DataSourceCardMeta = {
  title: string;
  desc: string;
  category: string;
  icon: React.ElementType;
};

export const DATA_SOURCE_CARD_META: Record<string, DataSourceCardMeta> = {
  demo: { title: "고객 프로파일", desc: "나이, 성별, 지역 등 기본 인구통계 데이터", category: "기본", icon: Users },
  clv: { title: "CLV 데이터", desc: "고객 생애가치와 유지 성과를 반영하는 수익성 데이터", category: "가치", icon: Star },
  purchase: { title: "구매이력", desc: "온/오프라인 구매 패턴 및 카테고리별 소비 데이터", category: "구매", icon: Package },
  owned: { title: "보유 제품", desc: "삼성 제품 보유 현황과 디바이스 조합 데이터", category: "제품", icon: Layers },
  app_usage: { title: "앱 사용기록", desc: "앱/서비스 사용 패턴과 행동 데이터", category: "행동", icon: Globe },
  interests: { title: "관심사 데이터", desc: "콘텐츠 소비와 선호 카테고리 기반 관심사 데이터", category: "관심사", icon: MessageSquare },
  rewards: { title: "리워즈 데이터", desc: "혜택 참여와 멤버십 반응을 나타내는 데이터", category: "리워즈", icon: Database },
};

export const DATA_PRESET: Record<string, string[]> = {
  st1: ["demo", "purchase", "app_usage"],
  st2: ["demo", "app_usage", "owned"],
  st3: ["demo", "interests", "rewards"],
  st4: ["demo", "purchase", "rewards"],
  st5: ["demo", "interests", "app_usage"],
  st6: ["demo", "purchase", "owned"],
  custom: [],
};