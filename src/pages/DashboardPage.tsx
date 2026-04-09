import type React from "react";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchIndividualPersonas,
  geminiApi,
  projectApi,
  segmentApi,
  type SegmentFilterOptions,
  type ResearchRecommendationResponse,
} from "@/lib/api";
import { useProject } from "@/hooks/useProject";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  Users,
  Smartphone,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  MapPin,
  ShoppingBag,
  SlidersHorizontal,
  Clock,
  Briefcase,
  Globe,
  Tag,
  Search,
  X,
  Plus,
  Cpu,
  Layers,
  Wallet,
  TrendingUp,
  Heart,
  Activity,
  Monitor,
  Store,
  Sparkles,
} from "lucide-react";
import { WorkflowStepper } from "@/components/layout/WorkflowStepper";

/* ─── Persona Pool ─── */
type PersonaSegment = "MZ 얼리어답터" | "프리미엄 구매자" | "실용 중시 가족형" | "게이밍 성향군" | "비즈니스 프로";

type OccupationCat = "학생" | "직장인" | "전문직" | "자영업자" | "프리랜서";
type SpendingLevel = "가성비형" | "실용형" | "프리미엄형";
type BrandLoyalty = "낮음" | "중간" | "높음";
type SnsActivity = "낮음" | "보통" | "활발";
type PurchaseIntent = "낮음" | "보통" | "높음";

interface FilterPersona {
  id: string;
  name: string;
  age: number;
  gender: "남성" | "여성";
  occupation: string;
  occupationCat: OccupationCat;
  region: string;
  householdType: string;
  device: string;
  segments: PersonaSegment[];
  techLevel: "초보" | "중급" | "전문가";
  interests: string[];
  keywords: string[];
  spendingLevel: SpendingLevel;
  purchaseIntent: PurchaseIntent;
  brandLoyalty: BrandLoyalty;
  snsActivity: SnsActivity;
  contentChannels: string[];
  buyChannel: string;
}

const SEG_STYLE: Record<PersonaSegment, { bg: string; text: string; dot: string }> = {
  "MZ 얼리어답터": { bg: "#eef3ff", text: "#2f66ff", dot: "#2f66ff" },
  "프리미엄 구매자": { bg: "#eef3ff", text: "#2f66ff", dot: "#2f66ff" },
  "실용 중시 가족형": { bg: "#eef3ff", text: "#2f66ff", dot: "#2f66ff" },
  "게이밍 성향군": { bg: "#eef3ff", text: "#2f66ff", dot: "#2f66ff" },
  "비즈니스 프로": { bg: "#eef3ff", text: "#2f66ff", dot: "#2f66ff" },
};

const SEG_COLORS = ["var(--primary)", "#DB2777", "#16A34A", "#9333EA", "#0D9488"];

/* ─── Segment Derivation ─── */
function topN(arr: string[], n: number) {
  const cnt: Record<string, number> = {};
  arr.forEach((v) => {
    cnt[v] = (cnt[v] ?? 0) + 1;
  });
  return Object.entries(cnt)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([k]) => k);
}

function deriveSegments(personas: FilterPersona[]) {
  if (personas.length === 0) return [];
  const map = new Map<string, FilterPersona[]>();
  personas.forEach((p) => {
    const key = p.segments[0];
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  });
  return Array.from(map.entries())
    .sort(([, a], [, b]) => b.length - a.length)
    .map(([name, members]) => {
      const avgAge = Math.round(members.reduce((s, p) => s + p.age, 0) / members.length);
      const maleRatio = Math.round((members.filter((p) => p.gender === "남성").length / members.length) * 100);
      const techDist = ["초보", "중급", "전문가"].map((t) => ({
        label: t,
        count: members.filter((p) => p.techLevel === t).length,
      }));
      const topInterests = topN(
        members.flatMap((p) => p.interests),
        4
      );
      const topKeywords = topN(
        members.flatMap((p) => p.keywords),
        4
      );
      return { name: name as PersonaSegment, members, avgAge, maleRatio, techDist, topInterests, topKeywords };
    });
}

const DONUT_COLORS = [
  "var(--primary)",
  "var(--primary-active-border)",
  "var(--primary-light-border)",
  "var(--primary-light-bg)",
  "var(--panel-soft)",
];

const AGE_GROUPS = [
  { label: "10대", min: 10, max: 19 },
  { label: "20대", min: 20, max: 29 },
  { label: "30대", min: 30, max: 39 },
  { label: "40대", min: 40, max: 49 },
  { label: "50대+", min: 50, max: 99 },
];

/* ─── UI Atoms ─── */
function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
        checked
          ? "bg-primary border-primary shadow-[0_2px_6px_rgba(47,102,255,0.2)]"
          : "border-[var(--border)] bg-card hover:border-[var(--border-hover)]"
      }`}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="block animate-in zoom-in-50 duration-200">
          <path
            d="M1.5 4L4 6.5L8.5 1.5"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  open,
  onToggle,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  open: boolean;
  onToggle: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--surface-hover)] transition-colors rounded-xl group"
    >
      <div className="flex items-center gap-3">
        <span
          className={`transition-colors ${open ? "text-primary" : "text-[var(--subtle-foreground)] group-hover:text-primary"}`}
        >
          {icon}
        </span>
        <span
          className={`text-[12px] font-bold tracking-tight ${open ? "text-foreground" : "text-[var(--secondary-foreground)] group-hover:text-foreground"}`}
        >
          {title}
        </span>
        {!!count && count > 0 && (
          <span className="bg-[var(--primary-light-bg)] text-primary px-2 py-0.5 rounded-full text-[9px] font-bold border border-[var(--primary-light-border)]">
            {count}
          </span>
        )}
      </div>
      <div className="text-[var(--subtle-foreground)] group-hover:text-primary transition-all">
        {open ? <ChevronUp size={14} strokeWidth={2.5} /> : <ChevronDown size={14} strokeWidth={2.5} />}
      </div>
    </button>
  );
}

const CUSTOM_LABEL = ({ cx, cy, total }: { cx: number; cy: number; total: number }) => (
  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
    <tspan
      x={cx}
      dy="-0.6em"
      className="text-[10px] fill-[var(--subtle-foreground)] font-semibold uppercase tracking-[0.1em]"
    >
      전체 표본
    </tspan>
    <tspan x={cx} dy="1.4em" className="text-[22px] fill-foreground font-bold tracking-tight">
      {total.toLocaleString()}
    </tspan>
  </text>
);

const SEGMENT_SPEND: Record<string, SpendingLevel> = {
  "MZ 얼리어답터": "프리미엄형",
  "게이밍 성향군": "프리미엄형",
  "프리미엄 구매자": "프리미엄형",
  "비즈니스 프로": "실용형",
  "실용 중시 가족형": "실용형",
  "콘텐츠 크리에이터": "실용형",
};

const CHANNEL_MAP: Record<string, string> = {
  YouTube: "YouTube",
  Instagram: "Instagram",
  TikTok: "TikTok",
  LinkedIn: "뉴스/미디어",
};

const BUY_CHANNEL_MAP: Record<string, string> = {
  YouTube: "자급제",
  Instagram: "공식몰",
  TikTok: "통신사 대리점",
  LinkedIn: "오프라인 유통",
};

/* ─── Main Component ─── */
export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { project, projectId } = useProject();
  const [allPersonas, setAllPersonas] = useState<FilterPersona[]>([]);
  const [filterOptions, setFilterOptions] = useState<SegmentFilterOptions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId === null) return; // useProject가 아직 resolve 중
    const loadData = async () => {
      try {
        setLoading(true);
        // 항상 데이터마트 전체(1000명) 로드 — project_id 미지정
        const [items, options, savedFilter] = await Promise.all([
          fetchIndividualPersonas(undefined),
          segmentApi.getFilterOptions(),
          projectId ? projectApi.getSegmentFilter(projectId) : Promise.resolve(null),
        ]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: FilterPersona[] = (items || []).map((item: any) => ({
          id: item.id,
          name: item.name || "이름 없음",
          age: item.age || 30,
          gender: (item.gender === "남성" || item.gender === "여성" ? item.gender : "남성") as "남성" | "여성",
          occupation: item.occupation || "직업 미상",
          occupationCat: (item.occupation_category || "직장인") as OccupationCat,
          region: item.region || "대한민국",
          householdType: item.household_type || "1인 가구",
          device: item.product_group || item.purchase_history?.[0] || "Galaxy S",
          segments: [item.segment || "MZ 얼리어답터"] as PersonaSegment[],
          techLevel: (item.future_value >= 90 ? "전문가" : item.future_value >= 75 ? "중급" : "초보") as
            | "전문가"
            | "중급"
            | "초보",
          interests: item.interests?.length ? item.interests : ["스마트폰"],
          keywords: item.keywords?.length ? item.keywords : ["성능"],
          spendingLevel: (SEGMENT_SPEND[item.segment] ?? "실용형") as SpendingLevel,
          purchaseIntent: (item.purchase_intent >= 80 ? "높음" : item.purchase_intent >= 60 ? "보통" : "낮음") as
            | "높음"
            | "보통"
            | "낮음",
          brandLoyalty: (item.brand_attitude >= 80
            ? "높음"
            : item.brand_attitude >= 65
              ? "중간"
              : "낮음") as BrandLoyalty,
          snsActivity: (item.preferred_channel === "Instagram" || item.preferred_channel === "TikTok"
            ? "활발"
            : item.preferred_channel === "YouTube"
              ? "보통"
              : "낮음") as SnsActivity,
          contentChannels: item.preferred_channel
            ? [CHANNEL_MAP[item.preferred_channel] ?? item.preferred_channel]
            : ["YouTube"],
          buyChannel: item.buy_channel ?? BUY_CHANNEL_MAP[item.preferred_channel] ?? "공식몰",
        }));
        setAllPersonas(mapped);
        setFilterOptions(options ?? null);

        // 저장된 필터 복원
        if (savedFilter?.persona_filter) {
          const f = savedFilter.persona_filter as Record<string, unknown>;
          if (Array.isArray(f.ageGroups)) setSelectedAgeGroups(f.ageGroups as string[]);
          if (f.gender && typeof f.gender === "object") {
            const g = f.gender as { male?: boolean; female?: boolean };
            setGender({ male: g.male ?? true, female: g.female ?? true });
          }
          if (Array.isArray(f.occupations)) setSelectedOccupations(f.occupations as string[]);
          if (Array.isArray(f.regions)) setSelectedRegions(f.regions as string[]);
          if (Array.isArray(f.households)) setSelectedHouseholds(f.households as string[]);
          if (Array.isArray(f.spending)) setSelectedSpending(f.spending as SpendingLevel[]);
          if (Array.isArray(f.purchaseIntent)) setSelectedPurchaseIntent(f.purchaseIntent as PurchaseIntent[]);
          if (Array.isArray(f.buyChannels)) setSelectedBuyChannels(f.buyChannels as string[]);
          if (f.products && typeof f.products === "object") setProducts(f.products as Record<string, boolean>);
          if (Array.isArray(f.techLevels)) setSelectedTechLevels(f.techLevels as string[]);
          if (Array.isArray(f.sns)) setSelectedSns(f.sns as SnsActivity[]);
          if (Array.isArray(f.contentChannels)) setSelectedContentChannels(f.contentChannels as string[]);
          if (Array.isArray(f.brandLoyalty)) setSelectedBrandLoyalty(f.brandLoyalty as BrandLoyalty[]);
          if (Array.isArray(f.keywords)) setCustomKeywords(f.keywords as string[]);
          if (Array.isArray(f.customCountries)) setCustomCountries(f.customCountries as string[]);
          if (Array.isArray(f.customOccupations)) setCustomOccupations(f.customOccupations as string[]);
          if (Array.isArray(f.customHouseholds)) setCustomHouseholds(f.customHouseholds as string[]);
          if (Array.isArray(f.customContentChannels)) setCustomContentChannels(f.customContentChannels as string[]);
        }
      } catch (error) {
        console.error("Dashboard data load failed:", error);
      } finally {
        setLoading(false);
      }
    };
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  /* ── State ── */
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);

  const [gender, setGender] = useState({ male: true, female: true });
  const [selectedOccupations, setSelectedOccupations] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedHouseholds, setSelectedHouseholds] = useState<string[]>([]);

  /* ── 소비 행동 ── */
  const [selectedSpending, setSelectedSpending] = useState<SpendingLevel[]>([]);
  const [selectedPurchaseIntent, setSelectedPurchaseIntent] = useState<PurchaseIntent[]>([]);
  const [selectedBuyChannels, setSelectedBuyChannels] = useState<string[]>([]);
  const [products, setProducts] = useState<Record<string, boolean>>({});

  /* ── 디지털 특성 ── */
  const [selectedTechLevels, setSelectedTechLevels] = useState<string[]>([]);
  const [selectedSns, setSelectedSns] = useState<SnsActivity[]>([]);
  const [selectedContentChannels, setSelectedContentChannels] = useState<string[]>([]);
  const [selectedBrandLoyalty, setSelectedBrandLoyalty] = useState<BrandLoyalty[]>([]);

  /* ── 핵심 키워드 ── */
  const [keywordInput, setKeywordInput] = useState("");
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);

  /* ── custom badge additions ── */
  const [customCountries, setCustomCountries] = useState<string[]>([]);
  const [countryInput, setCountryInput] = useState("");
  const [customOccupations, setCustomOccupations] = useState<string[]>([]);
  const [occupationAddInput, setOccupationAddInput] = useState("");
  const [customHouseholds, setCustomHouseholds] = useState<string[]>([]);
  const [householdAddInput, setHouseholdAddInput] = useState("");
  const [customContentChannels, setCustomContentChannels] = useState<string[]>([]);
  const [contentChannelAddInput, setContentChannelAddInput] = useState("");

  /* sidebar open state */
  const [openSections, setOpenSections] = useState({
    age: true,
    gender: true,
    occupation: false,
    region: false,
    household: false,
    spending: false,
    intent: false,
    buyChannel: false,
    product: false,
    tech: false,
    sns: false,
    content: false,
    loyalty: false,
    keyword: true,
  });
  const toggle = (key: keyof typeof openSections) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  /* ── AI Narrative ── */
  const [narrative, setNarrative] = useState<string | null>(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);

  /* ── Research Recommendation ── */
  const [recommendation, setRecommendation] = useState<ResearchRecommendationResponse | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationVisible, setRecommendationOpen] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    const loadRecommendation = async () => {
      setRecommendationLoading(true);
      try {
        const res = await geminiApi.recommendFilters(projectId);
        if (res) setRecommendation(res);
      } catch (error) {
        console.error("Recommendation failed:", error);
      } finally {
        setRecommendationLoading(false);
      }
    };
    void loadRecommendation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const applyRecommendedFilters = () => {
    if (!recommendation) return;
    // 예: 연령대와 지역 필터 자동 설정
    if (recommendation.suggested_filters.age_ranges) {
      setSelectedAgeGroups(recommendation.suggested_filters.age_ranges);
    }
    if (recommendation.suggested_filters.regions) {
      setSelectedRegions(recommendation.suggested_filters.regions);
    }
    setRecommendationOpen(false);
  };

  /* ── 필터 파생값 (narrative useEffect deps보다 먼저 선언) ── */
  const allKeywords = [...customKeywords];
  const hasFilters =
    selectedAgeGroups.length > 0 ||
    !gender.male ||
    !gender.female ||
    selectedOccupations.length > 0 ||
    selectedRegions.length > 0 ||
    selectedHouseholds.length > 0 ||
    selectedSpending.length > 0 ||
    selectedPurchaseIntent.length > 0 ||
    selectedBuyChannels.length > 0 ||
    selectedTechLevels.length > 0 ||
    selectedSns.length > 0 ||
    selectedContentChannels.length > 0 ||
    selectedBrandLoyalty.length > 0 ||
    allKeywords.length > 0;

  const matchedPersonas = useMemo(() => {
    return allPersonas.filter((p) => {
      if (selectedAgeGroups.length > 0) {
        if (
          !AGE_GROUPS.filter((g) => selectedAgeGroups.includes(g.label)).some((g) => p.age >= g.min && p.age <= g.max)
        )
          return false;
      }
      if (p.gender === "남성" && !gender.male) return false;
      if (p.gender === "여성" && !gender.female) return false;
      if (selectedOccupations.length > 0 && !selectedOccupations.includes(p.occupationCat)) return false;
      if (selectedRegions.length > 0 && !selectedRegions.includes(p.region)) return false;
      if (selectedHouseholds.length > 0 && !selectedHouseholds.includes(p.householdType)) return false;
      if (selectedSpending.length > 0 && !selectedSpending.includes(p.spendingLevel)) return false;
      if (selectedPurchaseIntent.length > 0 && !selectedPurchaseIntent.includes(p.purchaseIntent)) return false;
      if (selectedBuyChannels.length > 0 && !selectedBuyChannels.includes(p.buyChannel)) return false;
      const selectedProducts = Object.entries(products)
        .filter(([, enabled]) => enabled)
        .map(([key]) => key);
      if (selectedProducts.length > 0 && !selectedProducts.includes(p.device)) return false;
      if (selectedTechLevels.length > 0 && !selectedTechLevels.includes(p.techLevel)) return false;
      if (selectedSns.length > 0 && !selectedSns.includes(p.snsActivity)) return false;
      if (selectedContentChannels.length > 0 && !selectedContentChannels.some((ch) => p.contentChannels.includes(ch)))
        return false;
      if (selectedBrandLoyalty.length > 0 && !selectedBrandLoyalty.includes(p.brandLoyalty)) return false;
      if (allKeywords.length > 0) {
        const hit = allKeywords.some((kw) => {
          const q = kw.toLowerCase();
          return (
            p.interests.some((i) => i.toLowerCase().includes(q)) ||
            p.keywords.some((k) => k.toLowerCase().includes(q)) ||
            p.occupation.toLowerCase().includes(q)
          );
        });
        if (!hit) return false;
      }
      return true;
    });
  }, [
    allPersonas,
    selectedAgeGroups,
    gender,
    selectedOccupations,
    selectedRegions,
    selectedHouseholds,
    selectedSpending,
    selectedPurchaseIntent,
    selectedBuyChannels,
    selectedTechLevels,
    selectedSns,
    selectedContentChannels,
    selectedBrandLoyalty,
    allKeywords,
    products,
  ]);

  const derivedSegments = useMemo(
    () => deriveSegments(hasFilters ? matchedPersonas : allPersonas),
    [matchedPersonas, allPersonas, hasFilters]
  );

  useEffect(() => {
    if (!project?.id) return;

    const timer = setTimeout(async () => {
      setNarrativeLoading(true);
      try {
        const filterSummaryParts: string[] = [];
        if (selectedAgeGroups.length > 0) filterSummaryParts.push(selectedAgeGroups.join("·"));
        if (!gender.male || !gender.female) filterSummaryParts.push(gender.male ? "남성" : "여성");
        if (selectedOccupations.length > 0) filterSummaryParts.push(selectedOccupations.join("·"));
        if (selectedRegions.length > 0) filterSummaryParts.push(selectedRegions.join("·"));
        if (allKeywords.length > 0) filterSummaryParts.push(allKeywords.join("·"));
        const filterSummary = filterSummaryParts.length > 0 ? filterSummaryParts.join(" · ") : "전체 모집단";

        const res = await geminiApi.getSegmentNarrative({
          project_id: project.id,
          filter_summary: filterSummary,
          segments: derivedSegments.map((s) => ({ name: s.name, count: s.members.length })),
          target_count: matchedPersonas.length,
        });
        if (res) setNarrative(res.narrative);
      } catch (error) {
        console.error("Narrative fetch failed:", error);
      } finally {
        setNarrativeLoading(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    project?.id,
    selectedAgeGroups,
    gender,
    selectedOccupations,
    selectedRegions,
    selectedHouseholds,
    selectedSpending,
    selectedPurchaseIntent,
    selectedBuyChannels,
    selectedTechLevels,
    selectedSns,
    selectedContentChannels,
    selectedBrandLoyalty,
    allKeywords,
    products,
    derivedSegments,
    matchedPersonas.length,
  ]);

  const productCount = Object.values(products).filter(Boolean).length;

  /* ── helpers ── */
  const toggleArr = <T extends string>(setter: React.Dispatch<React.SetStateAction<T[]>>, val: T) =>
    setter((prev) => (prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]));

  const addKeyword = (kw: string) => {
    const v = kw.trim();
    if (v && !customKeywords.includes(v)) setCustomKeywords((prev) => [...prev, v]);
    setKeywordInput("");
  };
  const removeKeyword = (kw: string) => setCustomKeywords((prev) => prev.filter((k) => k !== kw));

  /* ── reset ── */
  const resetFilters = () => {
    setSelectedAgeGroups([]);
    setGender({ male: true, female: true });
    setSelectedOccupations([]);
    setCustomOccupations([]);
    setSelectedRegions([]);
    setCustomCountries([]);
    setSelectedHouseholds([]);
    setCustomHouseholds([]);
    setSelectedSpending([]);
    setSelectedPurchaseIntent([]);
    setSelectedBuyChannels([]);
    setProducts({});
    setSelectedTechLevels([]);
    setSelectedSns([]);
    setSelectedContentChannels([]);
    setCustomContentChannels([]);
    setSelectedBrandLoyalty([]);
    setCustomKeywords([]);
    setKeywordInput("");
    setCountryInput("");
    setOccupationAddInput("");
    setHouseholdAddInput("");
    setContentChannelAddInput("");
  };

  /* ── active filter count ── */
  const activeFilterCount =
    [
      selectedAgeGroups,
      selectedOccupations,
      selectedRegions,
      selectedHouseholds,
      selectedSpending,
      selectedPurchaseIntent,
      selectedBuyChannels,
      selectedTechLevels,
      selectedSns,
      selectedContentChannels,
      selectedBrandLoyalty,
      allKeywords,
    ].reduce((s, a) => s + a.length, 0) + (gender.male && gender.female ? 0 : 1);

  const displayedPersonas = hasFilters ? matchedPersonas : allPersonas;
  const totalPopulation = allPersonas.length;
  const analyzedPopulation = displayedPersonas.length;
  const averageAge =
    analyzedPopulation > 0
      ? (displayedPersonas.reduce((sum, persona) => sum + persona.age, 0) / analyzedPopulation).toFixed(1)
      : "0.0";
  const maleRatio =
    analyzedPopulation > 0
      ? Math.round((displayedPersonas.filter((persona) => persona.gender === "남성").length / analyzedPopulation) * 100)
      : 0;
  const averagePurchaseIntent =
    analyzedPopulation > 0
      ? Math.round(
          (displayedPersonas.filter((persona) => persona.purchaseIntent === "높음").length / analyzedPopulation) * 100
        )
      : 0;

  const donutData = useMemo(() => {
    const base = derivedSegments.slice(0, 5);
    return base.map((segment) => ({
      name: segment.name,
      value: analyzedPopulation > 0 ? Math.round((segment.members.length / analyzedPopulation) * 100) : 0,
    }));
  }, [derivedSegments, analyzedPopulation]);

  const channelData = useMemo(() => {
    const counts = displayedPersonas.reduce<Record<string, number>>((acc, persona) => {
      acc[persona.buyChannel] = (acc[persona.buyChannel] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([label, count], index) => ({
        label,
        value: analyzedPopulation > 0 ? Math.round((count / analyzedPopulation) * 100) : 0,
        color: DONUT_COLORS[index % DONUT_COLORS.length],
      }));
  }, [displayedPersonas, analyzedPopulation]);

  const regionOptions = filterOptions?.regions.map((item) => item.label) ?? [];
  const householdOptions = filterOptions?.households.map((item) => item.label) ?? [];
  const occupationOptions = filterOptions?.occupations.map((item) => item.label) ?? [];
  const buyChannelOptions = filterOptions?.buy_channels.map((item) => item.label) ?? [];
  const contentChannelOptions = filterOptions?.content_channels.map((item) => item.label) ?? [];
  const productOptions = filterOptions?.product_groups ?? [];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-[var(--muted-foreground)]">실시간 디지털 트윈 데이터를 분석 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <WorkflowStepper currentPath="/analytics" />

      <div className="flex flex-1 overflow-hidden">
        {/* ── 필터 사이드바 ── */}
        <aside className="w-72 shrink-0 flex flex-col border-r border-[var(--border)] bg-card overflow-hidden shadow-[var(--shadow-sm)]">
          <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--border)] shrink-0 bg-[var(--panel-soft)]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={15} className="text-primary" />
              <p className="text-[12px] text-foreground font-bold uppercase tracking-[0.14em]">분석 필터 설정</p>
            </div>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <span className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
              {hasFilters && (
                <button onClick={resetFilters} className="text-[10px] text-primary font-bold hover:underline">
                  초기화
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-3 hide-scrollbar">
            <div className="flex flex-col gap-0.5">
              {/* ══ 인구통계 ══ */}
              <div className="px-4 pt-3 pb-1.5">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--subtle-foreground)]">
                  인구통계
                </p>
              </div>

              <div className="rounded-2xl overflow-hidden">
                <SectionHeader
                  icon={<Users size={14} />}
                  title="연령대"
                  open={openSections.age}
                  onToggle={() => toggle("age")}
                  count={selectedAgeGroups.length}
                />
                {openSections.age && (
                  <div className="px-4 pb-4 flex flex-wrap gap-1.5">
                    {AGE_GROUPS.map((g) => {
                      const active = selectedAgeGroups.includes(g.label);
                      return (
                        <button
                          key={g.label}
                          onClick={() => toggleArr(setSelectedAgeGroups, g.label)}
                          className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold transition-all ${active ? "border-primary bg-[var(--primary-light-bg)] text-primary" : "border-[var(--border)] bg-[var(--panel-soft)] text-[var(--subtle-foreground)] hover:border-primary/40 hover:text-primary"}`}
                        >
                          {g.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden">
                <SectionHeader
                  icon={<Users size={14} />}
                  title="성별"
                  open={openSections.gender}
                  onToggle={() => toggle("gender")}
                />
                {openSections.gender && (
                  <div className="px-4 pb-4 flex gap-1.5">
                    {[
                      { key: "male" as const, label: "남성" },
                      { key: "female" as const, label: "여성" },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setGender((p) => ({ ...p, [key]: !p[key] }))}
                        className={`px-4 py-0.5 rounded-full border text-[11px] font-bold transition-all ${gender[key] ? "border-primary bg-[var(--primary-light-bg)] text-primary" : "border-[var(--border)] bg-[var(--panel-soft)] text-[var(--subtle-foreground)] hover:border-primary/40 hover:text-primary"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden">
                <SectionHeader
                  icon={<Briefcase size={14} />}
                  title="직업군"
                  open={openSections.occupation}
                  onToggle={() => toggle("occupation")}
                  count={selectedOccupations.length}
                />
                {openSections.occupation && (
                  <div className="px-4 pb-4 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {[...occupationOptions, ...customOccupations].map((o) => {
                        const active = selectedOccupations.includes(o);
                        const isCustom = customOccupations.includes(o);
                        return (
                          <button
                            key={o}
                            onClick={() => toggleArr(setSelectedOccupations, o)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold transition-all ${active ? "border-primary bg-[var(--primary-light-bg)] text-primary" : "border-[var(--border)] bg-[var(--panel-soft)] text-[var(--subtle-foreground)] hover:border-primary/40 hover:text-primary"}`}
                          >
                            {o}
                            {isCustom && (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCustomOccupations((p) => p.filter((x) => x !== o));
                                  setSelectedOccupations((p) => p.filter((x) => x !== o));
                                }}
                                className="opacity-50 hover:opacity-100"
                              >
                                <X size={8} />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] bg-[var(--panel-soft)] px-2.5 py-1.5 focus-within:border-primary transition-all">
                      <input
                        value={occupationAddInput}
                        onChange={(e) => setOccupationAddInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const v = occupationAddInput.trim();
                            if (v && !customOccupations.includes(v)) {
                              setCustomOccupations((p) => [...p, v]);
                              setSelectedOccupations((p) => [...p, v]);
                            }
                            setOccupationAddInput("");
                          }
                        }}
                        placeholder="직업군 추가..."
                        className="flex-1 bg-transparent text-[11px] font-semibold outline-none text-[var(--secondary-foreground)] placeholder:text-[var(--subtle-foreground)] placeholder:font-normal"
                      />
                      <button
                        onClick={() => {
                          const v = occupationAddInput.trim();
                          if (v && !customOccupations.includes(v)) {
                            setCustomOccupations((p) => [...p, v]);
                            setSelectedOccupations((p) => [...p, v]);
                          }
                          setOccupationAddInput("");
                        }}
                        className="flex h-4 w-4 items-center justify-center rounded bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                      >
                        <Plus size={9} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden">
                <SectionHeader
                  icon={<Globe size={14} />}
                  title="국가"
                  open={openSections.region}
                  onToggle={() => toggle("region")}
                  count={selectedRegions.length}
                />
                {openSections.region && (
                  <div className="px-4 pb-4 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {[...regionOptions, ...customCountries].map((c) => {
                        const active = selectedRegions.includes(c);
                        const isCustom = customCountries.includes(c);
                        return (
                          <button
                            key={c}
                            onClick={() => toggleArr(setSelectedRegions, c)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold transition-all ${active ? "border-primary bg-[var(--primary-light-bg)] text-primary" : "border-[var(--border)] bg-[var(--panel-soft)] text-[var(--subtle-foreground)] hover:border-primary/40 hover:text-primary"}`}
                          >
                            {c}
                            {isCustom && (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCustomCountries((p) => p.filter((x) => x !== c));
                                  setSelectedRegions((p) => p.filter((x) => x !== c));
                                }}
                                className="opacity-50 hover:opacity-100"
                              >
                                <X size={8} />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] bg-[var(--panel-soft)] px-2.5 py-1.5 focus-within:border-primary transition-all">
                      <input
                        value={countryInput}
                        onChange={(e) => setCountryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const v = countryInput.trim();
                            if (v && !customCountries.includes(v) && !regionOptions.includes(v)) {
                              setCustomCountries((p) => [...p, v]);
                              setSelectedRegions((p) => [...p, v]);
                            }
                            setCountryInput("");
                          }
                        }}
                        placeholder="국가 추가..."
                        className="flex-1 bg-transparent text-[11px] font-semibold outline-none text-[var(--secondary-foreground)] placeholder:text-[var(--subtle-foreground)] placeholder:font-normal"
                      />
                      <button
                        onClick={() => {
                          const v = countryInput.trim();
                          if (v && !customCountries.includes(v) && !regionOptions.includes(v)) {
                            setCustomCountries((p) => [...p, v]);
                            setSelectedRegions((p) => [...p, v]);
                          }
                          setCountryInput("");
                        }}
                        className="flex h-4 w-4 items-center justify-center rounded bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                      >
                        <Plus size={9} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden">
                <SectionHeader
                  icon={<Users size={14} />}
                  title="가구 형태"
                  open={openSections.household}
                  onToggle={() => toggle("household")}
                  count={selectedHouseholds.length}
                />
                {openSections.household && (
                  <div className="px-4 pb-4 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {[...householdOptions, ...customHouseholds].map((h) => {
                        const active = selectedHouseholds.includes(h);
                        const isCustom = customHouseholds.includes(h);
                        return (
                          <button
                            key={h}
                            onClick={() => toggleArr(setSelectedHouseholds, h)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold transition-all ${active ? "border-primary bg-[var(--primary-light-bg)] text-primary" : "border-[var(--border)] bg-[var(--panel-soft)] text-[var(--subtle-foreground)] hover:border-primary/40 hover:text-primary"}`}
                          >
                            {h}
                            {isCustom && (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCustomHouseholds((p) => p.filter((x) => x !== h));
                                  setSelectedHouseholds((p) => p.filter((x) => x !== h));
                                }}
                                className="opacity-50 hover:opacity-100"
                              >
                                <X size={8} />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] bg-[var(--panel-soft)] px-2.5 py-1.5 focus-within:border-primary transition-all">
                      <input
                        value={householdAddInput}
                        onChange={(e) => setHouseholdAddInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const v = householdAddInput.trim();
                            if (v && !customHouseholds.includes(v)) {
                              setCustomHouseholds((p) => [...p, v]);
                              setSelectedHouseholds((p) => [...p, v]);
                            }
                            setHouseholdAddInput("");
                          }
                        }}
                        placeholder="가구 형태 추가..."
                        className="flex-1 bg-transparent text-[11px] font-semibold outline-none text-[var(--secondary-foreground)] placeholder:text-[var(--subtle-foreground)] placeholder:font-normal"
                      />
                      <button
                        onClick={() => {
                          const v = householdAddInput.trim();
                          if (v && !customHouseholds.includes(v)) {
                            setCustomHouseholds((p) => [...p, v]);
                            setSelectedHouseholds((p) => [...p, v]);
                          }
                          setHouseholdAddInput("");
                        }}
                        className="flex h-4 w-4 items-center justify-center rounded bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                      >
                        <Plus size={9} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ══ 소비 행동 ══ */}
              <div className="px-4 pt-4 pb-1.5">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--subtle-foreground)]">
                  소비 행동
                </p>
              </div>

              <div className="rounded-2xl overflow-hidden">
                <SectionHeader
                  icon={<Wallet size={14} />}
                  title="소비 성향"
                  open={openSections.spending}
                  onToggle={() => toggle("spending")}
                  count={selectedSpending.length}
                />
                {openSections.spending && (
                  <div className="px-4 pb-4 flex gap-2">
                    {(["가성비형", "실용형", "프리미엄형"] as SpendingLevel[]).map((s) => {
                      const active = selectedSpending.includes(s);
                      return (
                        <button
                          key={s}
                          onClick={() => toggleArr(setSelectedSpending, s)}
                          className={`flex-1 py-2.5 rounded-xl border text-[11px] font-bold transition-all ${active ? "border-primary bg-[var(--primary-light-bg)] text-primary shadow-sm" : "border-[var(--border)] bg-card text-[var(--subtle-foreground)] hover:border-[var(--border-hover)]"}`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden">
                <SectionHeader
                  icon={<TrendingUp size={14} />}
                  title="구매 의향"
                  open={openSections.intent}
                  onToggle={() => toggle("intent")}
                  count={selectedPurchaseIntent.length}
                />
                {openSections.intent && (
                  <div className="px-4 pb-4 flex gap-2">
                    {(["낮음", "보통", "높음"] as PurchaseIntent[]).map((v) => {
                      const active = selectedPurchaseIntent.includes(v);
                      const color =
                        v === "높음"
                          ? "text-primary border-primary bg-[var(--primary-light-bg)]"
                          : v === "보통"
                            ? "text-amber-600 border-amber-300 bg-amber-50"
                            : "text-[var(--muted-foreground)] border-[var(--border)] bg-card";
                      return (
                        <button
                          key={v}
                          onClick={() => toggleArr(setSelectedPurchaseIntent, v)}
                          className={`flex-1 py-2.5 rounded-xl border text-[12px] font-bold transition-all ${active ? color + " shadow-sm" : "border-[var(--border)] bg-card text-[var(--subtle-foreground)] hover:border-[var(--border-hover)]"}`}
                        >
                          {v}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden">
                <SectionHeader
                  icon={<Store size={14} />}
                  title="선호 구매 채널"
                  open={openSections.buyChannel}
                  onToggle={() => toggle("buyChannel")}
                  count={selectedBuyChannels.length}
                />
                {openSections.buyChannel && (
                  <div className="px-4 pb-4 flex flex-col gap-2">
                    {buyChannelOptions.map((ch) => {
                      const active = selectedBuyChannels.includes(ch);
                      return (
                        <label
                          key={ch}
                          className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 cursor-pointer transition-all ${active ? "border-primary bg-[var(--primary-light-bg)]" : "border-[var(--border)] bg-card hover:border-[var(--border-hover)]"}`}
                        >
                          <Checkbox checked={active} onChange={() => toggleArr(setSelectedBuyChannels, ch)} />
                          <span
                            className={`text-[12px] font-semibold ${active ? "text-primary" : "text-[var(--secondary-foreground)]"}`}
                          >
                            {ch}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden">
                <SectionHeader
                  icon={<Smartphone size={14} />}
                  title="Galaxy 제품군"
                  open={openSections.product}
                  onToggle={() => toggle("product")}
                  count={productCount}
                />
                {openSections.product && (
                  <div className="px-4 pb-4 flex flex-col gap-3">
                    {productOptions.map((d) => (
                      <label key={d.label} className="flex items-center gap-3 cursor-pointer group">
                        <Checkbox
                          checked={!!products[d.label]}
                          onChange={() => setProducts((p) => ({ ...p, [d.label]: !p[d.label] }))}
                        />
                        <span
                          className={`text-[12px] font-semibold flex-1 ${products[d.label] ? "text-foreground" : "text-[var(--subtle-foreground)] group-hover:text-[var(--secondary-foreground)]"}`}
                        >
                          {d.label}
                        </span>
                        <span className="text-[10px] text-[var(--muted-foreground)] font-bold">
                          {Math.round(d.ratio)}%
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* ══ 디지털 특성 ══ */}
              <div className="px-4 pt-4 pb-1.5">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--subtle-foreground)]">
                  디지털 특성
                </p>
              </div>

              <div className="rounded-2xl overflow-hidden">
                <SectionHeader
                  icon={<Cpu size={14} />}
                  title="기술 수준"
                  open={openSections.tech}
                  onToggle={() => toggle("tech")}
                  count={selectedTechLevels.length}
                />
                {openSections.tech && (
                  <div className="px-4 pb-4 flex gap-2">
                    {["초보", "중급", "전문가"].map((t) => {
                      const active = selectedTechLevels.includes(t);
                      return (
                        <button
                          key={t}
                          onClick={() => toggleArr(setSelectedTechLevels, t)}
                          className={`flex-1 py-2.5 rounded-xl border text-[12px] font-bold transition-all ${active ? "border-primary bg-[var(--primary-light-bg)] text-primary shadow-sm" : "border-[var(--border)] bg-card text-[var(--subtle-foreground)] hover:border-[var(--border-hover)]"}`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden">
                <SectionHeader
                  icon={<Activity size={14} />}
                  title="SNS 활동성"
                  open={openSections.sns}
                  onToggle={() => toggle("sns")}
                  count={selectedSns.length}
                />
                {openSections.sns && (
                  <div className="px-4 pb-4 flex gap-2">
                    {(["낮음", "보통", "활발"] as SnsActivity[]).map((s) => {
                      const active = selectedSns.includes(s);
                      return (
                        <button
                          key={s}
                          onClick={() => toggleArr(setSelectedSns, s)}
                          className={`flex-1 py-2.5 rounded-xl border text-[12px] font-bold transition-all ${active ? "border-primary bg-[var(--primary-light-bg)] text-primary shadow-sm" : "border-[var(--border)] bg-card text-[var(--subtle-foreground)] hover:border-[var(--border-hover)]"}`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden">
                <SectionHeader
                  icon={<Monitor size={14} />}
                  title="콘텐츠 채널"
                  open={openSections.content}
                  onToggle={() => toggle("content")}
                  count={selectedContentChannels.length}
                />
                {openSections.content && (
                  <div className="px-4 pb-4 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {[...contentChannelOptions, ...customContentChannels].map((ch) => {
                        const active = selectedContentChannels.includes(ch);
                        const isCustom = customContentChannels.includes(ch);
                        return (
                          <button
                            key={ch}
                            onClick={() => toggleArr(setSelectedContentChannels, ch)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold transition-all ${active ? "border-primary bg-[var(--primary-light-bg)] text-primary" : "border-[var(--border)] bg-[var(--panel-soft)] text-[var(--subtle-foreground)] hover:border-primary/40 hover:text-primary"}`}
                          >
                            {ch}
                            {isCustom && (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCustomContentChannels((p) => p.filter((x) => x !== ch));
                                  setSelectedContentChannels((p) => p.filter((x) => x !== ch));
                                }}
                                className="opacity-50 hover:opacity-100"
                              >
                                <X size={8} />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] bg-[var(--panel-soft)] px-2.5 py-1.5 focus-within:border-primary transition-all">
                      <input
                        value={contentChannelAddInput}
                        onChange={(e) => setContentChannelAddInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const v = contentChannelAddInput.trim();
                            if (v && !customContentChannels.includes(v)) {
                              setCustomContentChannels((p) => [...p, v]);
                              setSelectedContentChannels((p) => [...p, v]);
                            }
                            setContentChannelAddInput("");
                          }
                        }}
                        placeholder="채널 추가..."
                        className="flex-1 bg-transparent text-[11px] font-semibold outline-none text-[var(--secondary-foreground)] placeholder:text-[var(--subtle-foreground)] placeholder:font-normal"
                      />
                      <button
                        onClick={() => {
                          const v = contentChannelAddInput.trim();
                          if (v && !customContentChannels.includes(v)) {
                            setCustomContentChannels((p) => [...p, v]);
                            setSelectedContentChannels((p) => [...p, v]);
                          }
                          setContentChannelAddInput("");
                        }}
                        className="flex h-4 w-4 items-center justify-center rounded bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                      >
                        <Plus size={9} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden">
                <SectionHeader
                  icon={<Heart size={14} />}
                  title="브랜드 충성도"
                  open={openSections.loyalty}
                  onToggle={() => toggle("loyalty")}
                  count={selectedBrandLoyalty.length}
                />
                {openSections.loyalty && (
                  <div className="px-4 pb-4 flex gap-2">
                    {(["낮음", "중간", "높음"] as BrandLoyalty[]).map((v) => {
                      const active = selectedBrandLoyalty.includes(v);
                      return (
                        <button
                          key={v}
                          onClick={() => toggleArr(setSelectedBrandLoyalty, v)}
                          className={`flex-1 py-2.5 rounded-xl border text-[12px] font-bold transition-all ${active ? "border-primary bg-[var(--primary-light-bg)] text-primary shadow-sm" : "border-[var(--border)] bg-card text-[var(--subtle-foreground)] hover:border-[var(--border-hover)]"}`}
                        >
                          {v}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ══ 핵심 키워드 ══ */}
              <div className="px-4 pt-4 pb-1.5">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--subtle-foreground)]">
                  핵심 키워드
                </p>
              </div>

              <div className="rounded-2xl overflow-hidden">
                <SectionHeader
                  icon={<Tag size={14} />}
                  title="핵심 키워드 등록"
                  open={openSections.keyword}
                  onToggle={() => toggle("keyword")}
                  count={allKeywords.length}
                />
                {openSections.keyword && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-2 focus-within:border-primary focus-within:bg-card transition-all">
                      <Search size={12} className="shrink-0 text-[var(--subtle-foreground)]" />
                      <input
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addKeyword(keywordInput);
                          }
                        }}
                        placeholder="키워드 입력 후 Enter"
                        className="flex-1 bg-transparent text-[12px] font-semibold outline-none text-[var(--secondary-foreground)] placeholder:text-[var(--subtle-foreground)] placeholder:font-normal"
                      />
                      {keywordInput && (
                        <button
                          onClick={() => addKeyword(keywordInput)}
                          className="flex h-5 w-5 items-center justify-center rounded-md bg-primary text-white transition-colors hover:bg-[var(--primary-hover)]"
                        >
                          <Plus size={10} />
                        </button>
                      )}
                    </div>
                    {customKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {customKeywords.map((kw) => (
                          <span
                            key={kw}
                            className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-[var(--primary-light-bg)] px-2.5 py-1 text-[10px] font-bold text-primary"
                          >
                            {kw}
                            <button
                              onClick={() => removeKeyword(kw)}
                              className="opacity-60 hover:opacity-100 transition-opacity"
                            >
                              <X size={9} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 매칭 결과 요약 + 다음 단계 */}
          <div className="p-4 border-t border-[var(--border)] bg-card shrink-0 space-y-3">
            {/* AI Narrative Card */}
            {(narrative || narrativeLoading) && (
              <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu size={12} className="text-primary animate-pulse" />
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.15em]">
                    AI Segment Narrative
                  </p>
                </div>
                {narrativeLoading ? (
                  <div className="space-y-2">
                    <div className="h-3 bg-primary/10 rounded animate-pulse w-full" />
                    <div className="h-3 bg-primary/10 rounded animate-pulse w-[90%]" />
                    <div className="h-3 bg-primary/10 rounded animate-pulse w-[70%]" />
                  </div>
                ) : (
                  <p className="text-[11px] leading-relaxed font-bold text-[var(--secondary-foreground)]">
                    {narrative}
                  </p>
                )}
              </div>
            )}

            <div
              className={`rounded-xl border px-4 py-3 flex items-center justify-between ${displayedPersonas.length > 0 ? "border-[var(--primary-light-border)] bg-[var(--primary-light-bg2)]" : "border-red-100 bg-red-50"}`}
            >
              <div>
                <p
                  className={`text-[10px] font-bold uppercase tracking-[0.1em] ${displayedPersonas.length > 0 ? "text-primary" : "text-red-500"}`}
                >
                  {hasFilters ? "매칭된 페르소나" : "전체 페르소나"}
                </p>
                <p
                  className={`text-[20px] font-bold leading-none mt-0.5 ${displayedPersonas.length > 0 ? "text-foreground" : "text-red-400"}`}
                >
                  {displayedPersonas.length.toLocaleString()}
                  <span className="text-[13px] font-semibold ml-1 text-[var(--muted-foreground)]">
                    명 / {allPersonas.length.toLocaleString()}명
                  </span>
                </p>
              </div>
              <div
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${displayedPersonas.length > 0 ? "bg-primary/10 text-primary" : "bg-red-100 text-red-500"}`}
              >
                {displayedPersonas.length > 0 ? `${derivedSegments.length}개 그룹` : "해당 없음"}
              </div>
            </div>
            {/* AI 내러티브 카드 */}
            {(narrative || narrativeLoading) && (
              <div className="mb-3 rounded-xl border border-[var(--primary-light-border)] bg-[var(--primary-light-bg)] p-3">
                <p className="mb-1 text-[9px] font-black uppercase tracking-[0.18em] text-primary">
                  AI Segment Narrative
                </p>
                {narrativeLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.2s]" />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.4s]" />
                  </div>
                ) : (
                  <p className="text-[11px] font-medium leading-relaxed text-[var(--secondary-foreground)]">
                    {narrative}
                  </p>
                )}
              </div>
            )}
            <button
              disabled={displayedPersonas.length === 0}
              onClick={async () => {
                const filterSummaryParts: string[] = [];
                if (selectedAgeGroups.length > 0) filterSummaryParts.push(selectedAgeGroups.join("·"));
                if (!gender.male || !gender.female) filterSummaryParts.push(gender.male ? "남성" : "여성");
                if (selectedOccupations.length > 0)
                  filterSummaryParts.push(
                    selectedOccupations.slice(0, 2).join("·") +
                      (selectedOccupations.length > 2 ? ` 외 ${selectedOccupations.length - 2}` : "")
                  );
                if (selectedRegions.length > 0)
                  filterSummaryParts.push(
                    selectedRegions[0] + (selectedRegions.length > 1 ? ` 외 ${selectedRegions.length - 1}` : "")
                  );
                if (allKeywords.length > 0) filterSummaryParts.push(allKeywords.slice(0, 2).join("·"));

                // 필터 조건 및 선택된 페르소나 ID 저장
                if (projectId) {
                  const personaFilter = {
                    ageGroups: selectedAgeGroups,
                    gender,
                    occupations: selectedOccupations,
                    regions: selectedRegions,
                    households: selectedHouseholds,
                    spending: selectedSpending,
                    purchaseIntent: selectedPurchaseIntent,
                    buyChannels: selectedBuyChannels,
                    products,
                    techLevels: selectedTechLevels,
                    sns: selectedSns,
                    contentChannels: selectedContentChannels,
                    brandLoyalty: selectedBrandLoyalty,
                    keywords: customKeywords,
                    customCountries,
                    customOccupations,
                    customHouseholds,
                    customContentChannels,
                  };
                  await projectApi.saveSegmentFilter(
                    projectId,
                    personaFilter,
                    displayedPersonas.map((p) => p.id)
                  );
                }

                navigate("/survey", {
                  state: {
                    projectId: project?.id ?? null,
                    segmentFilter: {
                      totalMatched: displayedPersonas.length,
                      totalPopulation: allPersonas.length,
                      hasFilters,
                      segments: derivedSegments.map((s) => ({ name: s.name, count: s.members.length })),
                      personaIds: displayedPersonas.map((p) => p.id),
                      filterSummary: filterSummaryParts.length > 0 ? filterSummaryParts.join(" · ") : "전체 모집단",
                    },
                  },
                });
              }}
              className="w-full bg-primary text-white rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-[var(--shadow-sm)] hover:bg-[var(--primary-hover)] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="text-[13px] font-bold tracking-tight">설문 디자인으로</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </aside>

        {/* ── 메인 콘텐츠 ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="app-page-header shrink-0">
            <p className="app-page-eyebrow">Segment Intelligence</p>
            <h1 className="app-page-title mt-1">
              {hasFilters ? (
                <>
                  필터 기반 <span className="text-primary">세그먼트 분석 결과.</span>
                </>
              ) : (
                <>
                  세그먼트 설정 및 <span className="text-primary">분포 현황.</span>
                </>
              )}
            </h1>
            <p className="app-page-description">
              {hasFilters
                ? `설정된 필터 조건에 부합하는 페르소나 ${matchedPersonas.length.toLocaleString()}명 기준으로 ${derivedSegments.length}개의 세그먼트 그룹이 도출되었습니다.`
                : `${project?.name ?? "현재 프로젝트"}의 실제 API 응답 기준 분석 데이터입니다. 전체 모집단 ${totalPopulation.toLocaleString()}명 중 현재 분석 대상은 ${analyzedPopulation.toLocaleString()}명입니다.`}
            </p>
          </div>

          <main className="flex-1 overflow-y-auto px-10 pt-8 pb-4 hide-scrollbar space-y-8">
            {/* ── AI Research Design Recommendation Banner ── */}
            {recommendationVisible && (recommendation || recommendationLoading) && (
              <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/[0.04] to-card p-1 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="rounded-[22px] bg-white p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-inner">
                    <Sparkles size={32} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                      <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">
                        AI Research Design Recommendation
                      </p>
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    </div>
                    {recommendationLoading ? (
                      <div className="space-y-3">
                        <div className="h-6 bg-primary/5 rounded-lg animate-pulse w-3/4" />
                        <div className="h-4 bg-primary/5 rounded-lg animate-pulse w-1/2" />
                      </div>
                    ) : (
                      <>
                        <h2 className="text-[20px] font-black text-foreground tracking-tight mb-2">
                          {recommendation?.recommendation}
                        </h2>
                        <p className="text-[13px] font-medium text-[var(--muted-foreground)] leading-relaxed">
                          {recommendation?.rationale}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => setRecommendationOpen(false)}
                      className="px-6 py-3 rounded-xl border border-[var(--border)] text-[13px] font-bold text-[var(--secondary-foreground)] hover:bg-[var(--surface-hover)] transition-all"
                    >
                      나중에 하기
                    </button>
                    <button
                      onClick={applyRecommendedFilters}
                      disabled={recommendationLoading}
                      className="px-8 py-3 rounded-xl bg-primary text-white text-[13px] font-black shadow-lg hover:bg-primary-hover active:scale-95 transition-all flex items-center gap-2"
                    >
                      추천 필터 적용하기
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── 전체 분포 요약 ── */}
            <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.6fr] gap-8">
              <div
                className="app-card p-8 flex flex-col md:flex-row md:items-center gap-10 relative overflow-hidden transition-colors hover:border-[var(--border-hover)]"
                style={{ boxShadow: "var(--shadow-md)" }}
              >
                <div className="flex-1 relative z-10">
                  <p className="text-[12px] text-[var(--subtle-foreground)] font-bold uppercase tracking-[0.14em] mb-2">
                    전체 분석 대상
                  </p>
                  <div className="flex items-end gap-2 mb-6">
                    <span className="text-[48px] font-bold text-foreground tracking-tighter leading-none">
                      {analyzedPopulation.toLocaleString()}
                    </span>
                    <span className="text-[18px] text-[var(--subtle-foreground)] font-bold pb-1 uppercase">명</span>
                    <span className="text-[13px] text-[var(--muted-foreground)] font-semibold pb-2">
                      / {totalPopulation.toLocaleString()}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-[var(--panel-soft)] text-[var(--primary-active-text)] px-3 py-1.5 rounded-lg border border-[var(--primary-light-border)]">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    <span className="text-[12px] font-semibold uppercase tracking-tight">실시간 데이터 연산 중</span>
                  </div>
                  <div className="mt-8 grid grid-cols-3 gap-4">
                    {[
                      { label: "평균 연령", value: `${averageAge}세`, icon: <Clock size={12} /> },
                      { label: "남성 비율", value: `${maleRatio}%`, icon: <Users size={12} /> },
                      { label: "구매 의향", value: `${averagePurchaseIntent}%`, icon: <MapPin size={12} /> },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="bg-[var(--panel-soft)] rounded-xl p-3.5 border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-all group/stat min-w-0"
                      >
                        <p className="text-[10px] text-[var(--subtle-foreground)] font-bold uppercase flex items-center gap-1 whitespace-nowrap overflow-hidden">
                          {s.icon}
                          {s.label}
                        </p>
                        <p className="text-[16px] font-bold text-[var(--secondary-foreground)] group-hover/stat:text-primary mt-0.5">
                          {s.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-8 bg-[var(--panel-soft)] p-8 rounded-3xl border border-[var(--border)] shadow-inner relative z-10 shrink-0">
                  <div style={{ width: 180, height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                          labelLine={false}
                          label={(props) => <CUSTOM_LABEL {...props} total={analyzedPopulation} />}
                          strokeWidth={0}
                        >
                          {donutData.map((_, i) => (
                            <Cell key={i} fill={DONUT_COLORS[i]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: number) => [`${v}%`, ""]}
                          contentStyle={{
                            borderRadius: 12,
                            border: "none",
                            fontSize: 12,
                            fontWeight: 600,
                            boxShadow: "var(--shadow-lg)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-3 min-w-[100px]">
                    {donutData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: DONUT_COLORS[i] }} />
                        <div className="min-w-0">
                          <p className="text-[10px] text-[var(--subtle-foreground)] font-semibold leading-none mb-1 truncate">
                            {d.name}
                          </p>
                          <p className="text-[14px] font-bold leading-none text-[var(--secondary-foreground)]">
                            {d.value}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="app-card p-8 border-[var(--border)]" style={{ boxShadow: "var(--shadow-md)" }}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-xl bg-[var(--panel-soft)] text-primary border border-[var(--border)] shadow-sm">
                    <ShoppingBag size={16} />
                  </div>
                  <h3 className="text-[14px] font-bold text-foreground uppercase tracking-tight">주요 채널 분포</h3>
                </div>
                <div className="flex flex-col gap-6">
                  {channelData.map((c) => (
                    <div key={c.label} className="group">
                      <div className="flex justify-between mb-2 text-[12px] font-semibold">
                        <span className="text-[var(--secondary-foreground)] group-hover:text-primary transition-colors truncate pr-2">
                          {c.label}
                        </span>
                        <span className="text-foreground shrink-0">{c.value}%</span>
                      </div>
                      <div className="h-1.5 bg-[var(--panel-soft)] rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${c.value}%`, backgroundColor: c.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── 도출된 세그먼트 그룹 ── */}
            <div className="app-card border-[var(--border)]" style={{ boxShadow: "var(--shadow-md)" }}>
              <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[var(--panel-soft)] text-primary border border-[var(--border)] shadow-sm">
                    <Layers size={16} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-foreground uppercase tracking-tight">
                      도출된 세그먼트 그룹
                    </h3>
                    <p className="text-[11px] text-[var(--muted-foreground)] font-medium mt-0.5">
                      {hasFilters ? "필터 조건에 매칭된 페르소나 기반" : "전체 페르소나 기반"} 자동 분류 결과
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[var(--panel-soft)] px-3 py-1.5 rounded-full border border-[var(--border)]">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  <span className="text-[10px] font-semibold text-[var(--subtle-foreground)] uppercase tracking-tight">
                    {hasFilters
                      ? `${matchedPersonas.length.toLocaleString()}명 매칭`
                      : `전체 ${allPersonas.length.toLocaleString()}명`}
                  </span>
                </div>
              </div>

              {derivedSegments.length === 0 ? (
                <div className="px-8 py-12 text-center">
                  <p className="text-[14px] font-bold text-[var(--muted-foreground)]">
                    조건에 맞는 페르소나가 없습니다
                  </p>
                  <p className="text-[12px] text-[var(--subtle-foreground)] mt-1">
                    필터 조건을 조정하거나 초기화해 주세요.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 p-6">
                  {derivedSegments.map((seg, idx) => {
                    const style = SEG_STYLE[seg.name];
                    const ratio = Math.round(
                      (seg.members.length / (hasFilters ? matchedPersonas.length : allPersonas.length || 1)) * 100
                    );
                    return (
                      <div
                        key={seg.name}
                        className="rounded-2xl border border-[var(--border)] p-6 hover:border-[var(--border-hover)] hover:shadow-md transition-all group"
                        style={{ background: "linear-gradient(135deg, #eef3ff 0%, #ffffff 70%)" }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-black text-white shadow-sm"
                              style={{ backgroundColor: SEG_COLORS[idx % SEG_COLORS.length] }}
                            >
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <div>
                              <p className="text-[13px] font-black" style={{ color: style.text }}>
                                {seg.name}
                              </p>
                              <p className="text-[10px] font-semibold text-[var(--muted-foreground)] mt-0.5">
                                평균 {seg.avgAge}세 · 남성 {seg.maleRatio}% · 여성 {100 - seg.maleRatio}%
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[22px] font-black leading-none" style={{ color: style.text }}>
                              {seg.members.length.toLocaleString()}
                              <span className="text-[12px] font-semibold text-[var(--muted-foreground)] ml-0.5">
                                명
                              </span>
                            </p>
                            <p className="text-[10px] font-bold text-[var(--subtle-foreground)] mt-0.5">
                              {ratio}% 비중
                            </p>
                          </div>
                        </div>
                        <div className="h-1.5 bg-white/60 rounded-full overflow-hidden mb-4 shadow-inner">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${ratio}%`, backgroundColor: "var(--primary)" }}
                          />
                        </div>
                        <div className="flex gap-2 mb-4">
                          {seg.techDist.map(
                            (t) =>
                              t.count > 0 && (
                                <div
                                  key={t.label}
                                  className="flex items-center gap-1.5 rounded-lg bg-white/70 border border-white px-2.5 py-1.5 shadow-sm"
                                >
                                  <Cpu size={10} className="text-[var(--subtle-foreground)]" />
                                  <span className="text-[10px] font-bold text-[var(--secondary-foreground)]">
                                    {t.label}
                                  </span>
                                  <span className="text-[10px] font-black text-primary">{t.count}</span>
                                </div>
                              )
                          )}
                        </div>
                        <div className="mb-3">
                          <p className="text-[9px] font-bold text-[var(--subtle-foreground)] uppercase tracking-[0.12em] mb-1.5">
                            주요 관심사
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {seg.topInterests.map((i) => (
                              <span
                                key={i}
                                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold border"
                                style={{ background: "#eef3ff", color: "#2f66ff", borderColor: "#c9d8ff" }}
                              >
                                {i}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-[var(--subtle-foreground)] uppercase tracking-[0.12em] mb-1.5">
                            핵심 키워드
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {seg.topKeywords.map((k) => (
                              <span
                                key={k}
                                className="rounded-full bg-white/80 border border-white/60 px-2.5 py-0.5 text-[10px] font-bold text-[var(--secondary-foreground)] shadow-sm"
                              >
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/50 flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {seg.members.slice(0, 5).map((m, i) => (
                              <div
                                key={m.id}
                                title={`${m.name} (${m.age}세 ${m.gender})`}
                                className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white shadow-sm"
                                style={{ backgroundColor: SEG_COLORS[(idx + i) % SEG_COLORS.length], zIndex: 5 - i }}
                              >
                                {m.name[0]}
                              </div>
                            ))}
                            {seg.members.length > 5 && (
                              <div
                                className="w-7 h-7 rounded-full border-2 border-white bg-[var(--panel-soft)] flex items-center justify-center text-[9px] font-black text-[var(--muted-foreground)]"
                                style={{ zIndex: 0 }}
                              >
                                +{seg.members.length - 5}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">
                            {seg.members
                              .map((m) => m.name)
                              .slice(0, 3)
                              .join(", ")}
                            {seg.members.length > 3 ? ` 외 ${seg.members.length - 3}명` : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
