import { useEffect, useState } from "react";
import {
  Save,
  RotateCcw,
  Clock,
  FlaskConical,
  Target,
  Eye,
  Award,
  BarChart,
  BarChart2,
  UserCheck,
  CheckCircle2,
  Cpu,
  List,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { settingsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { SectionTitle } from "@/components/settings/SectionTitle";
import { SettingGroup } from "@/components/settings/SettingGroup";
import { StatCard } from "@/components/settings/StatCard";

const PROMPT_PRESETS = [
  { id: "tpl_concept_test", label: "컨셉 테스트", icon: FlaskConical, group: "survey" },
  { id: "tpl_ad_message", label: "광고 메시지 테스트", icon: Target, group: "survey" },
  { id: "tpl_usage_probe", label: "사용 습관 탐색", icon: Eye, group: "survey" },
  { id: "tpl_brand_awareness", label: "브랜드 인식 조사", icon: Award, group: "survey" },
  { id: "tpl_price_sensitivity", label: "가격 민감도 조사", icon: BarChart, group: "survey" },
  { id: "tpl_csat", label: "고객 만족도 (CSAT)", icon: UserCheck, group: "survey" },
  { id: "tpl_competitor", label: "경쟁사 비교 조사", icon: BarChart2, group: "survey" },
] as const;

interface TemplateDefault {
  prompt: string;
  temperature: number;
  top_p: number;
  model: string;
  reasoning_effort: "low" | "medium" | "high";
  deep_research: boolean;
  allow_external_data: boolean;
  allow_third_party_data: boolean;
  use_project_context: boolean;
  use_segment_context: boolean;
  survey_type: string;
  recommended_question_count: number;
  required_blocks: string[];
}

function buildSurveyTemplatePrompt({
  role,
  surveyType,
  requiredBlocks,
  extraRules,
}: {
  role: string;
  surveyType: string;
  requiredBlocks: string[];
  extraRules: string[];
}) {
  return `${role}

[현재 설문 생성 계약]
- 이 템플릿은 survey_type="${surveyType}" 기반 설문 생성에 사용됩니다
- 입력은 user_prompt, research template, segment_context를 함께 반영해야 합니다
- 출력은 JSON 배열만 가정하며 각 문항은 text, type, options를 포함해야 합니다
- 허용 문항 타입은 단일선택, 복수선택, 리커트척도, 주관식 4종입니다
- 주관식 문항의 options는 반드시 빈 배열 [] 이어야 합니다
- 리커트척도 문항은 5점 척도를 기본으로 설계합니다
- question_count를 초과하지 말고, 각 문항은 서로 다른 역할을 가져야 합니다

[필수 블록]
${requiredBlocks.map((block, index) => `${index + 1}. ${block}`).join("\n")}

[설계 원칙]
- 사용자 요청을 그대로 반복하지 말고 측정 가능한 문항으로 변환하세요
- segment_context가 주어지면 세그먼트 특성을 rationale 수준으로 반영하되 편향적 표현은 피하세요
- 문항 텍스트는 한국어 기준으로 자연스럽고 중립적인 어조를 유지하세요
- 현재 데이터 스키마상 options는 문자열 배열만 허용되므로 복합 구조를 만들지 마세요
- 추후 시뮬레이션과 리포트에서 재사용되므로 질문 의도와 선택지가 명확해야 합니다

[템플릿별 추가 규칙]
${extraRules.map((rule) => `- ${rule}`).join("\n")}`;
}

const TEMPLATE_DEFAULTS: Record<string, TemplateDefault> = {
  tpl_concept_test: {
    model: "gemini-2.5-pro",
    reasoning_effort: "medium",
    deep_research: false,
    allow_external_data: false,
    allow_third_party_data: false,
    use_project_context: true,
    use_segment_context: true,
    survey_type: "concept",
    recommended_question_count: 8,
    required_blocks: ["awareness", "appeal", "purchase_intent", "concern", "open_feedback"],
    temperature: 0.4,
    top_p: 0.85,
    prompt: buildSurveyTemplatePrompt({
      role: "당신은 삼성전자 소비자 리서치 전문가입니다. 신제품 또는 기능 컨셉의 초기 수용 가능성과 구매 유발 요인을 측정하는 설문을 설계하세요.",
      surveyType: "concept",
      requiredBlocks: ["awareness", "appeal", "purchase_intent", "concern", "open_feedback"],
      extraRules: [
        "첫인상과 매력도, 구매 의향, 우려 요소가 모두 포함되도록 설계하세요.",
        "브랜드명과 제품명은 [브랜드], [제품명] 플레이스홀더로 남겨 두세요.",
        "정성 문항은 최소 2개 포함해 구매 맥락과 우려 이유를 확보하세요.",
      ],
    }),
  },
  tpl_ad_message: {
    model: "gemini-2.5-pro",
    reasoning_effort: "medium",
    deep_research: false,
    allow_external_data: false,
    allow_third_party_data: false,
    use_project_context: true,
    use_segment_context: true,
    survey_type: "ad",
    recommended_question_count: 8,
    required_blocks: ["message_clarity", "memorability", "brand_fit", "intent_shift", "improvement_area"],
    temperature: 0.4,
    top_p: 0.85,
    prompt: buildSurveyTemplatePrompt({
      role: "당신은 삼성전자 광고 효과 측정 전문가입니다. 광고 메시지의 전달력과 브랜드 적합성, 구매 의향 변화를 측정하는 설문을 설계하세요.",
      surveyType: "ad",
      requiredBlocks: ["message_clarity", "memorability", "brand_fit", "intent_shift", "improvement_area"],
      extraRules: [
        "광고 노출 전과 후의 질문 흐름을 분리해 메시지 효과를 비교 가능하게 만드세요.",
        "광고 소재는 [광고 소재] 플레이스홀더로 남겨 두세요.",
        "비보조 기억과 보조 기억을 혼동하지 않도록 문항 순서를 설계하세요.",
      ],
    }),
  },
  tpl_usage_probe: {
    model: "gemini-2.5-pro",
    reasoning_effort: "high",
    deep_research: false,
    allow_external_data: false,
    allow_third_party_data: false,
    use_project_context: true,
    use_segment_context: true,
    survey_type: "usage",
    recommended_question_count: 10,
    required_blocks: ["usage_context", "satisfaction", "pain_point", "workaround", "future_need"],
    temperature: 0.5,
    top_p: 0.9,
    prompt: buildSurveyTemplatePrompt({
      role: "당신은 삼성전자 UX 리서치 전문가입니다. 실제 사용 맥락, 불편 요소, 우회 행동, 향후 니즈를 깊게 탐색하는 설문을 설계하세요.",
      surveyType: "usage",
      requiredBlocks: ["usage_context", "satisfaction", "pain_point", "workaround", "future_need"],
      extraRules: [
        "행동 기반 질문을 우선하고, 단순 의견 질문만으로 구성하지 마세요.",
        "제품명은 [제품명] 플레이스홀더로 남겨 두세요.",
        "정성 탐색 목적이 강하므로 주관식 문항 비중을 충분히 확보하세요.",
      ],
    }),
  },
  tpl_brand_awareness: {
    model: "gemini-2.5-pro",
    reasoning_effort: "medium",
    deep_research: true,
    allow_external_data: true,
    allow_third_party_data: true,
    use_project_context: true,
    use_segment_context: true,
    survey_type: "brand_awareness",
    recommended_question_count: 9,
    required_blocks: [
      "spontaneous_awareness",
      "aided_recall",
      "brand_association",
      "competitive_positioning",
      "preference",
    ],
    temperature: 0.4,
    top_p: 0.85,
    prompt: buildSurveyTemplatePrompt({
      role: "당신은 삼성전자 브랜드 전략 리서치 전문가입니다. 브랜드 인지도, 연상 이미지, 경쟁 대비 포지셔닝을 측정하는 설문을 설계하세요.",
      surveyType: "brand_awareness",
      requiredBlocks: [
        "spontaneous_awareness",
        "aided_recall",
        "brand_association",
        "competitive_positioning",
        "preference",
      ],
      extraRules: [
        "비보조 인지 후 보조 인지 순서를 반드시 유지하세요.",
        "경쟁 브랜드명은 [경쟁사A], [경쟁사B] 플레이스홀더로 남겨 두세요.",
        "외부 시장 정보가 있더라도 문항은 중립적 비교 구조로 유지하세요.",
      ],
    }),
  },
  tpl_price_sensitivity: {
    model: "gemini-2.5-pro",
    reasoning_effort: "high",
    deep_research: true,
    allow_external_data: true,
    allow_third_party_data: true,
    use_project_context: true,
    use_segment_context: true,
    survey_type: "price_sensitivity",
    recommended_question_count: 7,
    required_blocks: ["too_cheap", "cheap", "expensive", "too_expensive", "price_context"],
    temperature: 0.3,
    top_p: 0.8,
    prompt: buildSurveyTemplatePrompt({
      role: "당신은 삼성전자 가격 전략 리서치 전문가입니다. Van Westendorp 기반으로 가격 수용 범위와 지불 의향을 측정하는 설문을 설계하세요.",
      surveyType: "price_sensitivity",
      requiredBlocks: ["too_cheap", "cheap", "expensive", "too_expensive", "price_context"],
      extraRules: [
        "Too Cheap, Cheap, Expensive, Too Expensive의 4개 핵심 가격 문항을 반드시 포함하세요.",
        "제품 사양은 [제품 사양] 플레이스홀더로 남겨 두세요.",
        "가격 맥락을 해석할 수 있도록 현재 지출 또는 대안 비교 문항을 포함하세요.",
      ],
    }),
  },
  tpl_csat: {
    model: "gemini-2.5-pro",
    reasoning_effort: "medium",
    deep_research: false,
    allow_external_data: false,
    allow_third_party_data: false,
    use_project_context: true,
    use_segment_context: true,
    survey_type: "csat",
    recommended_question_count: 8,
    required_blocks: ["overall_csat", "nps", "dimension_csat", "repurchase_intent", "improvement_priority"],
    temperature: 0.3,
    top_p: 0.8,
    prompt: buildSurveyTemplatePrompt({
      role: "당신은 삼성전자 CX 리서치 전문가입니다. 제품 또는 서비스의 전반 만족도와 추천, 재구매 의향을 측정하는 설문을 설계하세요.",
      surveyType: "csat",
      requiredBlocks: ["overall_csat", "nps", "dimension_csat", "repurchase_intent", "improvement_priority"],
      extraRules: [
        "CSAT는 5점 척도, NPS는 0~10점 척도를 유지하세요.",
        "NPS 점수 이유를 파악할 수 있는 주관식 또는 후속 문항을 포함하세요.",
        "세부 만족도는 품질, 가격, 서비스 등 개선 액션과 연결되게 설계하세요.",
      ],
    }),
  },
  tpl_competitor: {
    model: "gemini-2.5-pro",
    reasoning_effort: "high",
    deep_research: true,
    allow_external_data: true,
    allow_third_party_data: true,
    use_project_context: true,
    use_segment_context: true,
    survey_type: "competitor",
    recommended_question_count: 10,
    required_blocks: ["awareness", "usage_experience", "attribute_comparison", "switching_intent", "ideal_product"],
    temperature: 0.4,
    top_p: 0.85,
    prompt: buildSurveyTemplatePrompt({
      role: "당신은 삼성전자 경쟁사 인텔리전스 리서치 전문가입니다. 자사와 주요 경쟁사를 비교 평가하는 설문을 설계하세요.",
      surveyType: "competitor",
      requiredBlocks: ["awareness", "usage_experience", "attribute_comparison", "switching_intent", "ideal_product"],
      extraRules: [
        "비교 대상 브랜드는 [경쟁사A], [경쟁사B] 플레이스홀더로 남겨 두세요.",
        "현재 사용 브랜드에 따라 분기 가능한 질문 흐름을 고려하세요.",
        "속성 비교 문항은 품질, 가격, 디자인, 서비스처럼 해석 가능한 항목으로 제한하세요.",
      ],
    }),
  },
  simulation: {
    model: "gemini-2.5-flash",
    reasoning_effort: "medium",
    deep_research: false,
    allow_external_data: false,
    allow_third_party_data: false,
    use_project_context: true,
    use_segment_context: true,
    survey_type: "simulation",
    recommended_question_count: 0,
    required_blocks: [],
    temperature: 0.8,
    top_p: 0.95,
    prompt: `당신은 삼성전자 디지털 트윈 시뮬레이션 엔진입니다. 주어진 인구통계 및 심리통계 프로파일을 가진 가상 페르소나로서 설문에 응답하세요.

[페르소나 응답 원칙]
- 페르소나의 연령, 직업, 소비 성향, 브랜드 선호도, 기술 수용 수준을 일관되게 반영하세요
- 응답은 해당 페르소나의 실제 경험과 가치관에 근거해야 합니다
- 모든 응답자가 동일하게 응답하는 패턴을 피하고, 페르소나별 개성을 유지하세요
- 척도 응답 시 중립(3점)으로만 수렴하지 말고, 프로파일에 맞는 분포를 형성하세요

[응답 품질 기준]
- 주관식 응답은 2~4문장으로 작성하되, 페르소나의 어휘 수준과 관심사를 반영하세요
- 브랜드 충성도가 높은 페르소나는 긍정 편향을, 가격 민감 페르소나는 가성비 관점을 중심으로 응답하세요`,
  },
  assistant: {
    model: "gemini-2.5-pro",
    reasoning_effort: "medium",
    deep_research: true,
    allow_external_data: true,
    allow_third_party_data: true,
    use_project_context: true,
    use_segment_context: true,
    survey_type: "assistant",
    recommended_question_count: 0,
    required_blocks: [],
    temperature: 0.6,
    top_p: 0.9,
    prompt: `당신은 삼성전자 리서치 인사이트 어시스턴트입니다. 수집된 설문 데이터와 페르소나 분석 결과를 바탕으로 마케팅 전략적 인사이트를 제공하세요.

[응답 원칙]
- 질문에 대한 답변은 데이터 근거를 먼저 제시하고, 그로부터 도출되는 인사이트를 설명하세요
- 수치와 비율은 구체적으로 인용하되, 불확실한 추측은 명확히 구분하세요
- 실행 가능한 액션 아이템을 포함하여 답변을 마무리하세요

[출력 형식]
- 복잡한 질문은 핵심 요약 → 상세 분석 → 권고 사항 순으로 구조화하세요
- 임원 보고용 요약이 필요한 경우 3줄 이내 불릿 포인트로 제공하세요
- 세그먼트별 비교가 필요한 경우 표 형식을 활용하세요`,
  },
};

export function PromptSettingsSection() {
  const [selectedPromptType, setSelectedPromptType] =
    useState<(typeof PROMPT_PRESETS)[number]["id"]>("tpl_concept_test");
  const [prompt, setPrompt] = useState(TEMPLATE_DEFAULTS["tpl_concept_test"].prompt);
  const [savedPrompt, setSavedPrompt] = useState("");
  const [temperature, setTemperature] = useState(TEMPLATE_DEFAULTS["tpl_concept_test"].temperature);
  const [topP, setTopP] = useState(TEMPLATE_DEFAULTS["tpl_concept_test"].top_p);
  const [model, setModel] = useState(TEMPLATE_DEFAULTS["tpl_concept_test"].model);
  const [reasoningEffort, setReasoningEffort] = useState(TEMPLATE_DEFAULTS["tpl_concept_test"].reasoning_effort);
  const [deepResearch, setDeepResearch] = useState(TEMPLATE_DEFAULTS["tpl_concept_test"].deep_research);
  const [allowExternalData, setAllowExternalData] = useState(TEMPLATE_DEFAULTS["tpl_concept_test"].allow_external_data);
  const [allowThirdPartyData, setAllowThirdPartyData] = useState(
    TEMPLATE_DEFAULTS["tpl_concept_test"].allow_third_party_data
  );
  const [useProjectContext, setUseProjectContext] = useState(TEMPLATE_DEFAULTS["tpl_concept_test"].use_project_context);
  const [useSegmentContext, setUseSegmentContext] = useState(TEMPLATE_DEFAULTS["tpl_concept_test"].use_segment_context);
  const [savedTemplate, setSavedTemplate] = useState(TEMPLATE_DEFAULTS["tpl_concept_test"]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaults = TEMPLATE_DEFAULTS[selectedPromptType];
  const activePreset = PROMPT_PRESETS.find((preset) => preset.id === selectedPromptType) ?? PROMPT_PRESETS[0];
  const enabledRuntimeFlags = [
    deepResearch,
    allowExternalData,
    allowThirdPartyData,
    useProjectContext,
    useSegmentContext,
  ].filter(Boolean).length;

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      setErrorMessage(null);
      const [promptResponse, llmResponse, templateBundle] = await Promise.all([
        settingsApi.getPrompt(selectedPromptType),
        settingsApi.getLlmParameters(),
        settingsApi.getSurveyTemplateSettings(),
      ]);

      const storedTemplate = templateBundle?.templates?.[selectedPromptType];

      const resolvedPrompt = storedTemplate?.prompt || promptResponse?.prompt || defaults.prompt;
      const resolvedTemp = storedTemplate?.temperature ?? llmResponse?.temperature ?? defaults.temperature;
      const resolvedTopP = storedTemplate?.top_p ?? llmResponse?.top_p ?? defaults.top_p;
      const resolvedTemplate = {
        ...defaults,
        ...storedTemplate,
        prompt: resolvedPrompt,
        temperature: resolvedTemp,
        top_p: resolvedTopP,
      };

      setPrompt(resolvedTemplate.prompt);
      setSavedPrompt(resolvedTemplate.prompt);
      setTemperature(resolvedTemplate.temperature);
      setTopP(resolvedTemplate.top_p);
      setModel(resolvedTemplate.model);
      setReasoningEffort(resolvedTemplate.reasoning_effort);
      setDeepResearch(resolvedTemplate.deep_research);
      setAllowExternalData(resolvedTemplate.allow_external_data);
      setAllowThirdPartyData(resolvedTemplate.allow_third_party_data);
      setUseProjectContext(resolvedTemplate.use_project_context);
      setUseSegmentContext(resolvedTemplate.use_segment_context);
      setSavedTemplate(resolvedTemplate);

      if (!promptResponse && !storedTemplate) {
        console.warn("템플릿 설정을 불러오지 못해 기본값을 사용합니다.");
      }
      setLoading(false);
    };

    void loadSettings();
  }, [defaults, selectedPromptType]);

  const resetCurrent = () => {
    setPrompt(savedPrompt || savedTemplate.prompt || defaults.prompt);
    setTemperature(savedTemplate.temperature);
    setTopP(savedTemplate.top_p);
    setModel(savedTemplate.model);
    setReasoningEffort(savedTemplate.reasoning_effort);
    setDeepResearch(savedTemplate.deep_research);
    setAllowExternalData(savedTemplate.allow_external_data);
    setAllowThirdPartyData(savedTemplate.allow_third_party_data);
    setUseProjectContext(savedTemplate.use_project_context);
    setUseSegmentContext(savedTemplate.use_segment_context);
    setStatusMessage("마지막 저장 상태로 되돌렸습니다.");
    setErrorMessage(null);
  };

  const saveCurrent = async () => {
    setSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    const templateBundle = await settingsApi.getSurveyTemplateSettings();
    const nextTemplate = {
      ...defaults,
      prompt,
      model,
      temperature,
      top_p: topP,
      reasoning_effort: reasoningEffort,
      deep_research: deepResearch,
      allow_external_data: allowExternalData,
      allow_third_party_data: allowThirdPartyData,
      use_project_context: useProjectContext,
      use_segment_context: useSegmentContext,
    };
    const nextBundle = {
      templates: {
        ...(templateBundle?.templates ?? {}),
        [selectedPromptType]: nextTemplate,
      },
      updated_at: new Date().toISOString(),
    };

    const [promptResponse, llmResponse, templateResponse] = await Promise.all([
      settingsApi.putPrompt(selectedPromptType, prompt),
      settingsApi.putLlmParameters({ temperature, top_p: topP }),
      settingsApi.saveSurveyTemplateSettings(nextBundle),
    ]);

    if (!promptResponse || !llmResponse || !templateResponse) {
      setErrorMessage("일부 템플릿 설정 저장에 실패했습니다.");
      setSaving(false);
      return;
    }

    setSavedPrompt(promptResponse.prompt);
    setSavedTemplate(nextTemplate);
    setStatusMessage("템플릿 번들과 레거시 프롬프트/LLM 값을 함께 저장했습니다.");
    setSaving(false);
  };

  return (
    <>
      <SectionTitle
        title="설문 템플릿 관리"
        desc="시스템 프롬프트는 물론 모델, 딥리서치, 외부 데이터 허용 여부까지 템플릿 단위로 묶어서 관리합니다"
      />

      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="활성 템플릿"
            value={String(PROMPT_PRESETS.length)}
            sub="설문 유형 기준"
            tone="success"
            icon={FlaskConical}
          />
          <StatCard
            label="권장 문항 수"
            value={`${defaults.recommended_question_count}문항`}
            sub={defaults.survey_type}
            tone="primary"
            icon={List}
          />
          <StatCard
            label="필수 블록"
            value={String(defaults.required_blocks.length)}
            sub="템플릿 계약 기준"
            tone="warn"
            icon={CheckCircle2}
          />
          <StatCard
            label="실행 옵션"
            value={`${enabledRuntimeFlags}/5`}
            sub="현재 활성화됨"
            tone="neutral"
            icon={Cpu}
          />
        </div>

        <SettingGroup title="템플릿별 설계 규칙 및 실행 옵션">
          <div className="mb-5 space-y-3">
            <div>
              <p className="app-label mb-2">설문 템플릿</p>
              <div className="flex flex-wrap gap-2">
                {PROMPT_PRESETS.filter((p) => p.group === "survey").map((preset) => (
                  <Button
                    key={preset.id}
                    variant={preset.id === selectedPromptType ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                    onClick={() => setSelectedPromptType(preset.id)}
                  >
                    <preset.icon size={13} /> {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[13px] font-black text-foreground">시스템 프롬프트</span>
                <p className="mt-1 text-[11px] font-medium text-[var(--muted-foreground)]">
                  현재 설문 스키마(`text`, `type`, `options`)와 생성 계약을 반영하도록 기본 프롬프트를 정리했습니다.
                </p>
              </div>
              <span className="bg-[var(--panel-soft)] px-2 py-0.5 text-[11px] font-black uppercase tracking-tighter text-[var(--muted-foreground)] rounded-md border border-[var(--border)]">
                {selectedPromptType}
              </span>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              className="w-full bg-card border border-[var(--border)] rounded-xl px-4 py-3 h-64 font-mono text-[13px] outline-none focus:border-primary transition-colors text-foreground placeholder:text-[var(--subtle-foreground)] leading-relaxed disabled:opacity-60"
            />

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                  model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-[var(--border)] bg-card px-4 py-3 text-[13px] font-bold text-foreground outline-none focus:border-primary disabled:opacity-60"
                >
                  <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  <option value="gpt-5.4">gpt-5.4</option>
                  <option value="gpt-5.4-mini">gpt-5.4-mini</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                  reasoning_effort
                </label>
                <select
                  value={reasoningEffort}
                  onChange={(e) => setReasoningEffort(e.target.value as "low" | "medium" | "high")}
                  disabled={loading}
                  className="w-full rounded-xl border border-[var(--border)] bg-card px-4 py-3 text-[13px] font-bold text-foreground outline-none focus:border-primary disabled:opacity-60"
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                    temperature
                  </label>
                  <span className="text-[10px] font-bold text-[var(--subtle-foreground)]">
                    기본값 {defaults.temperature.toFixed(1)}
                  </span>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-card px-4 py-3">
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[12px] font-black text-primary">{temperature.toFixed(1)}</span>
                    {temperature !== defaults.temperature && (
                      <span className="text-[10px] font-bold text-[var(--warning)]">기본값과 다름</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                    top_p
                  </label>
                  <span className="text-[10px] font-bold text-[var(--subtle-foreground)]">
                    기본값 {defaults.top_p.toFixed(2)}
                  </span>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-card px-4 py-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={topP}
                    onChange={(e) => setTopP(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="mt-2 text-[12px] font-black text-primary">{topP.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: "딥리서치 사용",
                  value: deepResearch,
                  setter: setDeepResearch,
                  desc: "고난도 탐색형 템플릿에만 권장합니다.",
                },
                {
                  label: "외부 데이터 허용",
                  value: allowExternalData,
                  setter: setAllowExternalData,
                  desc: "프로젝트 내부 데이터 외 시장 정보 사용 여부입니다.",
                },
                {
                  label: "3rd-party 데이터 허용",
                  value: allowThirdPartyData,
                  setter: setAllowThirdPartyData,
                  desc: "패널/경쟁사/외부 파트너 데이터 사용 정책입니다.",
                },
                {
                  label: "프로젝트 컨텍스트 반영",
                  value: useProjectContext,
                  setter: setUseProjectContext,
                  desc: "프로젝트 목적과 브리프를 프롬프트에 주입합니다.",
                },
                {
                  label: "세그먼트 컨텍스트 반영",
                  value: useSegmentContext,
                  setter: setUseSegmentContext,
                  desc: "세그먼트 분석 결과를 설문 설계 근거로 반영합니다.",
                },
              ].map((item) => (
                <label
                  key={item.label}
                  className="flex items-start justify-between gap-3 rounded-xl border border-[var(--border)] bg-card px-4 py-3"
                >
                  <div>
                    <p className="text-[13px] font-black text-foreground">{item.label}</p>
                    <p className="mt-1 text-[11px] font-medium leading-relaxed text-[var(--muted-foreground)]">
                      {item.desc}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={item.value}
                    disabled={loading}
                    onChange={(e) => item.setter(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0"
                  />
                </label>
              ))}
            </div>

            {statusMessage ? (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[12px] font-bold text-green-700">
                {statusMessage}
              </div>
            ) : null}
            {errorMessage ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] font-bold text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={resetCurrent} disabled={loading || saving}>
                <RotateCcw size={14} /> 초기화
              </Button>
              <Button size="sm" className="gap-2" onClick={saveCurrent} disabled={loading || saving || !prompt.trim()}>
                <Save size={14} /> {saving ? "저장 중..." : "변경사항 적용"}
              </Button>
            </div>
          </div>
        </SettingGroup>

        <SettingGroup title="템플릿 저장 레이어">
          <div className="space-y-3">
            {[
              {
                version: "live",
                label: "Bundle",
                date: "실시간 조회",
                author: "settings/kv",
                changes: "현재 선택된 템플릿의 시스템 프롬프트와 실행 옵션을 묶어서 저장합니다.",
                active: true,
              },
              {
                version: "prompt",
                label: "Legacy",
                date: "호환성 레이어",
                author: "settings/prompts + settings/llm-parameters",
                changes: "기존 저장 구조와의 호환을 위해 프롬프트와 기본 LLM 파라미터를 함께 미러링합니다.",
                active: false,
              },
              {
                version: "fallback",
                label: "Code Default",
                date: "코드 기본값",
                author: activePreset.label,
                changes: "저장값이 없을 때 템플릿별 기본 프롬프트, 모델, 옵션 preset을 사용합니다.",
                active: false,
              },
            ].map((v) => (
              <div
                key={v.version}
                className={cn(
                  "p-5 rounded-xl border transition-all",
                  v.active
                    ? "bg-[#eef3ff] border-primary/30"
                    : "bg-card border-[var(--border)] hover:border-[var(--border-hover)]"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[13px] font-black text-foreground">{v.version}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-black uppercase tracking-wider",
                        v.active ? "text-primary border-primary/40 bg-white" : "text-[var(--muted-foreground)]"
                      )}
                    >
                      {v.label}
                    </Badge>
                    {v.active && (
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> 현재 적용 중
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[12px] font-medium text-[var(--secondary-foreground)] leading-relaxed mb-3">
                  {v.changes}
                </p>
                <div className="flex items-center gap-4 text-[10px] font-bold text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> {v.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={10} /> {v.author}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SettingGroup>
      </div>
    </>
  );
}
