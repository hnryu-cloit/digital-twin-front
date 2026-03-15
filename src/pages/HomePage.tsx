import type React from"react";
import { useState } from"react";
import { useNavigate } from"react-router";
import {
 Plus, Search, Clock, BarChart2, Users, ChevronRight,
 FileText, Target, ShoppingCart, Star,
 Layers, X, ChevronLeft, MessageSquare,
 Database, Upload, ListChecks,
 Globe, Package, Eye,
 Check, Loader
} from"lucide-react";

/* ─── Types ─── */
interface Project {
 id: string;
 title: string;
 type: string;
 typeColor: string;
 typeBg: string;
 status:"진행중" |"완료" |"초안" |"분석중";
 progress: number;
 responses: number;
 target: number;
 updatedAt: string;
 tags: string[];
}

type SurveyType = {
 id: string;
 icon: React.ElementType;
 title: string;
 desc: string;
 tags: string[];
 questions: number;
 duration: string;
 difficulty:"쉬움" |"보통" |"전문";
 popular?: boolean;
 category: string;
};

/* ─── Mock Data ─── */
const RECENT_PROJECTS: Project[] = [
 { id:"pr1", title:"Galaxy S26 컨셉 테스트", type:"컨셉 테스트", typeColor:"#5B7DFF", typeBg:"#EEF4FF", status:"진행중", progress: 67, responses: 1340, target: 2000, updatedAt:"2시간 전", tags: ["스마트폰","신제품"] },
 { id:"pr2", title:"MZ세대 스마트폰 Usage 조사", type:"Usage 조사", typeColor:"#16A34A", typeBg:"#F0FDF4", status:"분석중", progress: 100, responses: 3200, target: 3000, updatedAt:"1일 전", tags: ["MZ","사용행태"] },
 { id:"pr3", title:"브랜드 인지도 조사 Q1 2026", type:"브랜드 인식", typeColor:"#7C3AED", typeBg:"#F5F3FF", status:"완료", progress: 100, responses: 5000, target: 5000, updatedAt:"3일 전", tags: ["브랜드","분기"] },
 { id:"pr4", title:"신규 UI 사용성 테스트 v2", type:"UX 테스트", typeColor:"#EA580C", typeBg:"#FFF7ED", status:"초안", progress: 0, responses: 0, target: 500, updatedAt:"5일 전", tags: ["UI","사용성"] },
];

const SURVEY_TYPES: SurveyType[] = [
 { id:"st1", icon: Target, title:"컨셉 테스트", desc:"신제품·서비스 컨셉의 소비자 반응 및 수용도를 측정합니다.", tags: ["신제품","아이디어 검증"], questions: 18, duration:"8–12분", difficulty:"보통", popular: true, category:"제품" },
 { id:"st2", icon: BarChart2, title:"Usage 조사", desc:"제품·서비스의 실제 사용 행태와 패턴을 심층 분석합니다.", tags: ["사용 행태","빈도"], questions: 22, duration:"10–15분", difficulty:"보통", popular: true, category:"사용자" },
 { id:"st3", icon: Globe, title:"브랜드 인식 조사", desc:"브랜드 인지도, 이미지, 경쟁 포지셔닝을 종합 분석합니다.", tags: ["브랜드","인지도"], questions: 25, duration:"12–18분", difficulty:"전문", popular: true, category:"브랜드" },
 { id:"st4", icon: Star, title:"고객 만족도 (CSAT/NPS)", desc:"제품·서비스 만족도와 추천 의향을 정량적으로 측정합니다.", tags: ["만족도","NPS"], questions: 14, duration:"5–8분", difficulty:"쉬움", category:"만족도" },
 { id:"st5", icon: Eye, title:"광고 효과 측정", desc:"광고 소재·캠페인의 인지도와 태도 변화를 측정합니다.", tags: ["광고","캠페인"], questions: 16, duration:"7–10분", difficulty:"보통", category:"마케팅" },
 { id:"st6", icon: Package, title:"패키지 테스트", desc:"패키지 디자인, 컬러, 카피에 대한 소비자 반응을 측정합니다.", tags: ["디자인","패키지"], questions: 20, duration:"10–14분", difficulty:"보통", category:"제품" },
];

interface DataSource { id: string; title: string; desc: string; category: string; icon: React.ElementType; }

const DATA_SOURCES: DataSource[] = [
 { id:"customer_profile", title:"고객 프로파일", desc:"나이, 성별, 지역 등 기본 인구통계 데이터", category:"기본", icon: Users },
 { id:"device", title:"장치 사용 데이터", desc:"갤럭시 스마트폰, 가전, 웨어러블 등 삼성 제품 사용 현황", category:"제품", icon: Layers },
 { id:"app_web", title:"앱/웹 사용기록", desc:"삼성 앱·서비스의 실제 사용 패턴 및 행동 데이터", category:"행동", icon: Globe },
 { id:"crm", title:"CRM 데이터", desc:"고객 관계 관리, CS 이력, 세그먼트 정보", category:"CRM", icon: Database },
 { id:"bas_survey", title:"BAS Survey", desc:"기존 Brand Awareness & Satisfaction 조사 데이터", category:"리서치", icon: FileText },
 { id:"purchase", title:"구매이력", desc:"온/오프라인 구매 패턴 및 카테고리별 소비 데이터", category:"구매", icon: ShoppingCart },
 { id:"social", title:"소셜/리뷰 데이터", desc:"SNS 반응, 제품 리뷰, 커뮤니티 언급 데이터", category:"소셜", icon: MessageSquare },
 { id:"nps", title:"NPS/CSAT 데이터", desc:"순추천고객지수, 만족도 측정 히스토리", category:"리서치", icon: Star },
];

const DATA_PRESET: Record<string, string[]> = {
 st1: ["customer_profile","device","bas_survey"],
 st2: ["device","app_web","purchase"],
 st3: ["customer_profile","bas_survey","social"],
 st4: ["crm","nps","purchase"],
 st5: ["customer_profile","social","bas_survey"],
 st6: ["customer_profile","purchase","bas_survey"],
 custom: [],
};

const STATUS_STYLE: Record<Project["status"], { bg: string; text: string; label: string }> = {
"진행중": { bg:"#EEF4FF", text:"#5B7DFF", label:"진행중" },
"완료": { bg:"#F0FDF4", text:"#16A34A", label:"완료" },
"초안": { bg:"#F7FAFF", text:"#7C8397", label:"초안" },
"분석중": { bg:"#FFF7ED", text:"#EA580C", label:"분석중" },
};

/* ─── Project Card ─── */
function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
 const s = STATUS_STYLE[project.status];
 return (
 <div onClick={onClick} className="app-card p-6 cursor-pointer hover:shadow-[var(--shadow-lg)] hover:border-primary/30 transition-all group flex flex-col">
 <div className="flex items-start justify-between mb-4">
 <span className="px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tight"
 style={{ backgroundColor: project.typeBg, color: project.typeColor, borderColor: project.typeColor +"22" }}>
 {project.type}
 </span>
 <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight" style={{ backgroundColor: s.bg, color: s.text }}>
 {s.label}
 </span>
 </div>
 <h3 className="text-[15px] font-black text-foreground leading-tight mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
 <div className="flex flex-wrap gap-1.5 mb-5">
 {project.tags.map((t) => (
 <span key={t} className="bg-[var(--panel-soft)] border border-[var(--border)] text-muted-foreground px-2 py-0.5 rounded-md font-bold" style={{ fontSize: 10 }}>#{t}</span>
 ))}
 </div>
 {/* Progress */}
 <div className="mb-4 mt-auto">
 <div className="flex justify-between mb-1.5">
 <span className="text-[11px] font-black text-[var(--subtle-foreground)] uppercase tracking-widest">응답 수집</span>
 <span className="text-[11px] font-black text-foreground">{project.responses.toLocaleString()} / {project.target.toLocaleString()}</span>
 </div>
 <div className="h-1.5 bg-muted rounded-full overflow-hidden shadow-inner">
 <div className="h-full rounded-full transition-all duration-1000 ease-out shadow-[var(--shadow-sm)]" style={{ width: `${Math.min(project.progress, 100)}%`, backgroundColor: project.typeColor }} />
 </div>
 </div>
 <div className="flex items-center justify-between pt-4 border-t border-border/30">
 <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tighter flex items-center gap-1.5"><Clock size={12} className="text-[var(--subtle-foreground)]" /> {project.updatedAt}</span>
 <div className="w-7 h-7 rounded-lg bg-[var(--panel-soft)] flex items-center justify-center text-[var(--subtle-foreground)] group-hover:bg-primary/10 group-hover:text-primary transition-all">
 <ChevronRight size={14} />
 </div>
 </div>
 </div>
 );
}

/* ─── Wizard Modal ─── */
function WizardModal({ initialTemplate, onClose }: { initialTemplate?: SurveyType; onClose: () => void }) {
 const navigate = useNavigate();
 const [step, setStep] = useState(initialTemplate ? 1 : 0);
 const [isGenerating, setIsGenerating] = useState(false);
 const [projectName, setProjectName] = useState("");
 const [goal, setGoal] = useState("");
 const [selectedType, setSelectedType] = useState<SurveyType | null>(initialTemplate ?? null);
 const [typeSearch, setTypeSearch] = useState("");
 const [dataSearch, setDataSearch] = useState("");
 const [selectedData, setSelectedData] = useState<string[]>([]);
 const [dataRanges, setDataRanges] = useState<Record<string, {from: string; to: string}>>({});
 const [dataPage, setDataPage] = useState(0);
 const steps = ["목적 설정","유형 선택","데이터 연결"];
 const CATEGORIES = ["전체", ...Array.from(new Set(SURVEY_TYPES.map(t => t.category)))];
 const PAGE_SIZE = 4;
 const [typeCategory, setTypeCategory] = useState("전체");
 const [typePage, setTypePage] = useState(0);

 const handleNext = () => {
 if (step === 1) {
 const preset = DATA_PRESET[selectedType?.id ?? "custom"] ?? [];
 setSelectedData(preset);
 setDataRanges(Object.fromEntries(preset.map(id => [id, defaultRange()])));
 setDataSearch("");
 setStep(2);
 } else if (step === 2) {
 setIsGenerating(true);
 setTimeout(() => {
 setIsGenerating(false);
 navigate("/analytics");
 onClose();
 }, 1500);
 } else {
 setStep(step + 1);
 }
 };

 const [expandedData, setExpandedData] = useState<string | null>(null);

 const defaultRange = () => {
 const to = new Date();
 const from = new Date();
 from.setFullYear(from.getFullYear() - 1);
 return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
 };

 const toggleData = (id: string) => {
 setSelectedData(prev => {
 if (prev.includes(id)) {
 setDataRanges(r => { const next = {...r}; delete next[id]; return next; });
 setExpandedData(e => e === id ? null : e);
 return prev.filter(d => d !== id);
 }
 setDataRanges(r => ({ ...r, [id]: defaultRange() }));
 return [...prev, id];
 });
 };
 const updateRange = (id: string, field: "from" | "to", value: string) =>
 setDataRanges(r => {
 const updated = { ...r, [id]: { ...r[id], [field]: value } };
 const newVal = updated[id];
 selectedData.forEach(sid => { updated[sid] = { ...updated[sid], [field]: newVal[field] }; });
 return updated;
 });
 const isDataSearching = dataSearch.length > 0;
 const filteredData = DATA_SOURCES.filter(d =>
 !dataSearch || d.title.includes(dataSearch) || d.desc.includes(dataSearch) || d.category.includes(dataSearch)
 );

 const CUSTOM_TYPE: SurveyType = { id:"custom", icon: Plus, title:"직접 만들기", desc:"템플릿 없이 처음부터 설계합니다.", tags: [], questions: 0, duration:"자유", difficulty:"보통", category:"기타" };

 const isSearching = typeSearch.length > 0;
 const filteredTypes = SURVEY_TYPES.filter(t => {
 const matchCat = typeCategory === "전체" || t.category === typeCategory;
 const matchSearch = !typeSearch || t.title.includes(typeSearch) || t.desc.includes(typeSearch) || t.tags.some(tag => tag.includes(typeSearch));
 return matchCat && matchSearch;
 });
 const allCards = [CUSTOM_TYPE, ...filteredTypes];
 const totalPages = Math.ceil(allCards.length / PAGE_SIZE);
 const pagedCards = allCards.slice(typePage * PAGE_SIZE, (typePage + 1) * PAGE_SIZE);

 return (
 <div className="app-modal-overlay">
 <div className="app-modal max-w-3xl h-[740px] animate-in zoom-in-95 duration-300">

 {/* Modal Header */}
 <div className="app-modal-header">
 <div className="flex items-center gap-4">
 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-[var(--shadow-lg)] border border-white/20">
 <Plus className="h-5 w-5 text-white" />
 </div>
 <div>
 <h2 className="text-[18px] font-black text-foreground tracking-tight">새 프로젝트 생성</h2>
 <p className="text-[11px] font-medium text-[var(--subtle-foreground)] mt-0.5">{["리서치 목적과 프로젝트 이름을 입력하세요", "조사 유형 템플릿을 선택하세요", "참고할 데이터 소스를 연결하세요"][step]}</p>
 </div>
 </div>
 <button onClick={onClose} className="w-10 h-10 rounded-xl bg-card border border-[var(--border)] hover:bg-[var(--surface-hover)] flex items-center justify-center transition-all text-muted-foreground">
 <X size={20} />
 </button>
 </div>

 {/* Step Indicator */}
 <div className="flex bg-background border-b border-[var(--border)] px-10 py-5 shrink-0">
 {steps.map((label, i) => (
 <div key={label} className="flex flex-1 items-center last:flex-none">
 <div className="flex items-center gap-3">
 <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black transition-all ${
 i <= step ?"bg-primary text-white shadow-[var(--shadow-lg)]" :"bg-muted text-muted-foreground"
 }`}>
 {i < step ? <Check size={14} strokeWidth={3} /> : i + 1}
 </div>
 <span className={`text-[12px] font-black uppercase tracking-tight ${i === step ?"text-foreground" :"text-[var(--subtle-foreground)]"}`}>{label}</span>
 </div>
 {i < steps.length - 1 && <div className={`mx-6 h-px flex-1 ${i < step ?"bg-primary/30" :"bg-border"}`} />}
 </div>
 ))}
 </div>

 {/* Modal Body */}
 <div className="app-modal-body">
 {step === 0 && (
 <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
 <div className="space-y-6">
 <div>
 <label className="app-label">프로젝트 이름</label>
 <input
 className="app-input"
 placeholder="예: Galaxy S26 초기 반응 조사"
 value={projectName}
 onChange={e => setProjectName(e.target.value)}
 />
 </div>
 <div>
 <label className="app-label">조사 목적</label>
 <textarea
 className="app-textarea"
 rows={4}
 placeholder="예: 20~30대 실사용자를 대상으로 신규 카메라 기능에 대한 수용도를 파악하고 싶습니다."
 value={goal}
 onChange={e => setGoal(e.target.value)}
 />
 </div>
 <div>
 <label className="app-label">참고자료</label>
 <label className="flex items-center gap-4 w-full px-5 py-4 rounded-[14px] border border-dashed border-[var(--primary-light-border)] bg-card hover:bg-[var(--primary-light-bg)] hover:border-[var(--primary-active-border)] transition-all cursor-pointer group shadow-[var(--shadow-sm)]">
 <input type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.csv" className="hidden" />
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-light-bg)] border border-[var(--primary-light-border)] text-primary group-hover:bg-white transition-colors">
 <Upload size={16} />
 </div>
 <div>
 <p className="text-[13px] font-semibold text-foreground">관련 자료 업로드
 </p>
 <p className="text-[11px] font-medium text-[var(--subtle-foreground)] mt-0.5">PDF, PPT, Word, Excel · 최대 10MB</p>
 </div>
 </label>
 </div>
 </div>
 </div>
 )}

 {step === 1 && (
 <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
 {/* Search */}
 <div className="relative">
 <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--subtle-foreground)]" />
 <input
 className="app-input pl-9 text-[13px]"
 placeholder="템플릿 검색..."
 value={typeSearch}
 onChange={e => { setTypeSearch(e.target.value); setTypePage(0); }}
 />
 </div>

 {isSearching ? (
 /* 검색 중: 전체 템플릿 리스트 */
 <div className="flex flex-col gap-2">
 {filteredTypes.length > 0 ? filteredTypes.map(t => (
 <button key={t.id} onClick={() => setSelectedType(t)}
 className={`flex items-center gap-4 px-4 py-3 rounded-xl border text-left transition-all ${
 selectedType?.id === t.id
 ? "border-primary bg-[var(--primary-light-bg)] ring-1 ring-primary"
 : "border-[var(--border)] bg-card hover:border-primary/30 hover:bg-[var(--primary-light-bg2)]"
 }`}>
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--panel-soft)] border border-[var(--border)]">
 <t.icon className={`h-4 w-4 ${selectedType?.id === t.id ? "text-primary" : "text-muted-foreground"}`} />
 </div>
 <div className="min-w-0">
 <p className={`text-[13px] font-semibold ${selectedType?.id === t.id ? "text-primary" : "text-foreground"}`}>{t.title}</p>
 <p className="text-[11px] text-muted-foreground truncate">{t.desc}</p>
 </div>
 </button>
 )) : (
 <div className="py-10 flex flex-col items-center gap-2 text-[var(--subtle-foreground)]">
 <Search size={22} className="opacity-40" />
 <p className="text-[13px] font-medium">'{typeSearch}'에 맞는 템플릿이 없어요</p>
 </div>
 )}
 </div>
 ) : (
 /* 기본: 카테고리 필터 + 그리드 + 페이지네이션 */
 <div className="space-y-4">
 <div className="flex gap-2 flex-wrap">
 {CATEGORIES.map(cat => (
 <button key={cat} onClick={() => { setTypeCategory(cat); setTypePage(0); }}
 className={`px-3 py-1 rounded-full border text-[11px] font-semibold transition-all ${
 typeCategory === cat
 ? "bg-primary border-primary text-white shadow-[var(--shadow-sm)]"
 : "border-[var(--border)] text-[var(--secondary-foreground)] hover:border-primary/40 hover:text-primary"
 }`}>{cat}</button>
 ))}
 </div>
 <div className="grid grid-cols-2 gap-3">
 {pagedCards.map(t => (
 <button key={t.id} onClick={() => setSelectedType(t)}
 className={`flex flex-col gap-3 app-card p-5 text-left transition-all ${t.id === "custom" ? "border-dashed" : ""} ${
 selectedType?.id === t.id
 ? "border-primary bg-[var(--primary-light-bg)] shadow-[var(--shadow-md)] ring-1 ring-primary"
 : "hover:border-primary/30 hover:bg-card"
 }`}>
 <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] shadow-[var(--shadow-sm)]">
 <t.icon className={`h-5 w-5 ${selectedType?.id === t.id ? "text-primary" : "text-muted-foreground"}`} />
 </div>
 <div>
 <p className={`text-[13px] font-bold ${selectedType?.id === t.id ? "text-primary" : "text-foreground"}`}>{t.title}</p>
 <p className="mt-1 text-[11px] font-medium leading-relaxed text-muted-foreground line-clamp-2">{t.desc}</p>
 </div>
 </button>
 ))}
 </div>
 {totalPages > 1 && (
 <div className="flex items-center justify-center gap-1.5">
 {Array.from({ length: totalPages }).map((_, i) => (
 <button key={i} onClick={() => setTypePage(i)}
 className={`h-2 rounded-full transition-all ${typePage === i ? "w-5 bg-primary" : "w-2 bg-[var(--border)] hover:bg-[var(--border-hover)]"}`} />
 ))}
 </div>
 )}
 </div>
 )}
 </div>
 )}

 {step === 2 && (
 <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
 {/* Search */}
 <div className="relative">
 <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--subtle-foreground)]" />
 <input
 className="app-input pl-9 text-[13px]"
 placeholder="데이터 소스 검색..."
 value={dataSearch}
 onChange={e => setDataSearch(e.target.value)}
 />
 </div>
 {selectedData.length > 0 && !isDataSearching && (
 <p className="text-[11px] font-medium text-[var(--subtle-foreground)] px-1">
 {selectedData.length}개 선택됨 · 중복 선택 가능
 </p>
 )}
 {isDataSearching ? (
 /* 검색 중: 리스트 */
 <div className="flex flex-col gap-2">
 {filteredData.length > 0 ? filteredData.map(d => (
 <button key={d.id} onClick={() => toggleData(d.id)}
 className={`flex items-center gap-4 px-4 py-3 rounded-xl border text-left transition-all ${
 selectedData.includes(d.id)
 ? "border-primary bg-[var(--primary-light-bg)] ring-1 ring-primary"
 : "border-[var(--border)] bg-card hover:border-primary/30 hover:bg-[var(--primary-light-bg2)]"
 }`}>
 <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${selectedData.includes(d.id) ? "bg-primary border-primary text-white" : "bg-[var(--panel-soft)] border-[var(--border)] text-muted-foreground"}`}>
 <d.icon className="h-4 w-4" />
 </div>
 <div className="min-w-0 flex-1">
 <p className={`text-[13px] font-semibold ${selectedData.includes(d.id) ? "text-primary" : "text-foreground"}`}>{d.title}</p>
 <p className="text-[11px] text-muted-foreground truncate">{d.desc}</p>
 </div>
 {selectedData.includes(d.id) && <Check size={15} className="shrink-0 text-primary" />}
 </button>
 )) : (
 <div className="py-10 flex flex-col items-center gap-2 text-[var(--subtle-foreground)]">
 <Search size={22} className="opacity-40" />
 <p className="text-[13px] font-medium">'{dataSearch}'에 맞는 데이터 소스가 없어요</p>
 </div>
 )}
 </div>
 ) : (
 /* 기본: 2열 그리드 + 페이지네이션 */
 <div className="space-y-4">
 <div className="grid grid-cols-2 gap-3">
 {DATA_SOURCES.slice(dataPage * PAGE_SIZE, (dataPage + 1) * PAGE_SIZE).map(d => {
 const isSelected = selectedData.includes(d.id);
 const isExpanded = expandedData === d.id;
 const range = dataRanges[d.id];
 return (
 <div key={d.id}
 className={`app-card text-left transition-all overflow-hidden ${
 isSelected
 ? "border-primary bg-[var(--primary-light-bg)] shadow-[var(--shadow-md)] ring-1 ring-primary"
 : "hover:border-primary/30 hover:bg-card"
 }`}>
 {/* 카드 메인 영역 */}
 <button className="w-full p-5 flex flex-col gap-3 text-left" onClick={() => toggleData(d.id)}>
 <div className="flex items-center justify-between">
 <div className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${isSelected ? "bg-primary border-primary text-white shadow-[var(--shadow-sm)]" : "bg-[var(--panel-soft)] border-[var(--border)] text-muted-foreground"}`}>
 <d.icon className="h-5 w-5" />
 </div>
 {isSelected && <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary"><Check size={11} className="text-white" strokeWidth={3} /></div>}
 </div>
 <div>
 <p className={`text-[13px] font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>{d.title}</p>
 <p className="mt-1 text-[11px] font-medium leading-relaxed text-muted-foreground line-clamp-2">{d.desc}</p>
 </div>
 </button>
 {/* 선택 시: 기간 설정 버튼 or 기간 표시 */}
 {isSelected && (
 <div className="px-5 pb-4">
 {isExpanded ? (
 <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200" onClick={e => e.stopPropagation()}>
 <input type="date" value={range?.from ?? ""} onChange={e => updateRange(d.id, "from", e.target.value)}
 className="app-input text-[11px] px-2 py-1.5 flex-1" />
 <span className="text-[10px] text-[var(--subtle-foreground)] shrink-0">~</span>
 <input type="date" value={range?.to ?? ""} onChange={e => updateRange(d.id, "to", e.target.value)}
 className="app-input text-[11px] px-2 py-1.5 flex-1" />
 <button onClick={e => { e.stopPropagation(); setExpandedData(null); }}
 className="shrink-0 px-2.5 py-1.5 rounded-lg bg-primary text-white text-[11px] font-bold transition-all hover:bg-primary-hover">
 확인
 </button>
 </div>
 ) : (
 <div className="flex items-center justify-between">
 <span className="text-[11px] font-medium text-[var(--primary-active-text)]">
 {range?.from && range?.to ? `${range.from} ~ ${range.to}` : "기간 미설정"}
 </span>
 <button onClick={e => { e.stopPropagation(); setExpandedData(d.id); }}
 className="text-[11px] font-semibold text-primary hover:underline underline-offset-2">
 설정
 </button>
 </div>
 )}
 </div>
 )}
 </div>
 );
 })}
 </div>
 {Math.ceil(DATA_SOURCES.length / PAGE_SIZE) > 1 && (
 <div className="flex items-center justify-center gap-1.5">
 {Array.from({ length: Math.ceil(DATA_SOURCES.length / PAGE_SIZE) }).map((_, i) => (
 <button key={i} onClick={() => setDataPage(i)}
 className={`h-2 rounded-full transition-all ${dataPage === i ? "w-5 bg-primary" : "w-2 bg-[var(--border)] hover:bg-[var(--border-hover)]"}`} />
 ))}
 </div>
 )}
 </div>
 )}
 </div>
 )}

 </div>

 {/* Modal Footer */}
 <div className="app-modal-footer">
 <button
 onClick={() => step > 0 ? setStep(step - 1) : onClose()}
 className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-card px-6 py-3 text-[13px] font-black text-muted-foreground transition-all hover:bg-[var(--surface-hover)] active:scale-95 shadow-[var(--shadow-sm)]"
 >
 <ChevronLeft size={16} /> {step === 0 ?"취소" :"이전"}
 </button>
 <button
 onClick={handleNext}
 disabled={step === 0 && (!projectName || !goal)}
 className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-10 py-3 text-[14px] font-black text-white transition-all hover:bg-primary-hover disabled:opacity-40 shadow-[var(--shadow-lg)] active:scale-95"
 >
 {isGenerating ? (
 <><Loader className="h-4 w-4 animate-spin" /> 에이전트 구동 중...</>
 ) : (
 <>{step === 2 ?"프로젝트 시작" :"다음 단계로"} <ChevronRight size={16} /></>
 )}
 </button>
 </div>
 </div>
 </div>
 );
}

/* ─── Main Home Page ─── */
export function HomePage() {
 const [wizardOpen, setWizardOpen] = useState(false);
 const [wizardTemplate, setWizardTemplate] = useState<SurveyType | undefined>();
 const navigate = useNavigate();

 const openWizard = (tmpl?: SurveyType) => {
 setWizardTemplate(tmpl);
 setWizardOpen(true);
 };

 return (
 <div className="flex-1 overflow-y-auto bg-background px-10 pt-8 pb-4 hide-scrollbar">
 <div className="space-y-8">

 {/* Welcome Header */}
 <section className="app-card p-7 border-border/90 relative overflow-hidden group [box-shadow:var(--shadow-[var(--shadow-md)])]">
 <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl group-hover:bg-primary/10 transition-all duration-1000" />
 <div className="relative z-10">
 <p className="app-page-eyebrow mb-3">Workspace Hub</p>
 <h1 className="text-2xl font-black leading-tight text-foreground tracking-tight">
 안녕하세요, <span className="text-primary">관리자</span>님.
 </h1>
 <p className="mt-3 max-w-2xl text-[13px] font-medium text-muted-foreground leading-relaxed">
 디지털 트윈 기반의 가상 페르소나 시뮬레이션을 통해<br />오늘의 전략적 인사이트를 발견하고 리서치 효율을 극대화하세요.
 </p>
 <div className="mt-6 flex flex-wrap gap-3">
 <button
 onClick={() => openWizard()}
 className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-6 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-primary-hover shadow-[var(--shadow-lg)] active:scale-95"
 >
 <Plus size={20} strokeWidth={3} /> 새 프로젝트 설계 시작
 </button>
 <button className="inline-flex items-center gap-2.5 rounded-xl border border-[var(--border)] bg-card px-6 py-2.5 text-[13px] font-bold text-secondary-foreground transition-all hover:bg-[var(--surface-hover)] hover:border-[var(--border-hover)] shadow-[var(--shadow-sm)]">
 <Database size={18} /> 기존 데이터 불러오기
 </button>
 </div>
 </div>
 </section>



 {/* Recent Projects */}
 <section>
 <div className="mb-6 flex items-center justify-between px-2">
 <h2 className="text-base font-semibold text-foreground tracking-tight">최근 프로젝트</h2>
 <button className="flex items-center gap-1.5 bg-card border border-[var(--border)] px-4 py-2 rounded-xl text-[12px] font-black text-[var(--secondary-foreground)] hover:bg-[var(--panel-soft)] hover:text-primary hover:border-primary/30 transition-all shadow-[var(--shadow-sm)] group/btn active:scale-95">더보기<span className="text-[11px] text-[var(--subtle-foreground)] group-hover/btn:translate-x-0.5 transition-transform">&gt;</span></button>
 </div>
 <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
 {RECENT_PROJECTS.map(p => <ProjectCard key={p.id} project={p} onClick={() => navigate("/survey")} />)}
 </div>
 </section>

 {/* Template Library */}
 <section>
 <div className="mb-6 flex items-center justify-between px-2">
 <h2 className="text-base font-semibold text-foreground tracking-tight">템플릿 라이브러리</h2>
 <button className="flex items-center gap-1.5 bg-card border border-[var(--border)] px-4 py-2 rounded-xl text-[12px] font-black text-[var(--secondary-foreground)] hover:bg-[var(--panel-soft)] hover:text-primary hover:border-primary/30 transition-all shadow-[var(--shadow-sm)] group/btn active:scale-95">더보기<span className="text-[11px] text-[var(--subtle-foreground)] group-hover/btn:translate-x-0.5 transition-transform">&gt;</span></button>
 </div>
 <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
 {SURVEY_TYPES.map(t => (
 <div key={t.id} onClick={() => openWizard(t)} className="app-card p-7 hover:shadow-[var(--shadow-lg)] hover:border-primary/20 transition-all cursor-pointer group flex flex-col gap-5">
 <div className="flex items-start justify-between">
 <div className="w-12 h-12 rounded-2xl bg-[var(--panel-soft)] border border-[var(--border)] flex items-center justify-center text-primary shadow-[var(--shadow-sm)] group-hover:bg-card transition-colors">
 <t.icon size={22} />
 </div>
 {t.popular && <span className="bg-[var(--primary-light-bg)] text-[var(--primary-active-text)] border border-[var(--primary-light-border)] px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-tight">인기 항목</span>}
 </div>
 <div>
 <h4 className="text-[17px] font-black text-foreground tracking-tight mb-2 group-hover:text-primary transition-colors">{t.title}</h4>
 <p className="text-[13px] font-bold text-muted-foreground leading-relaxed line-clamp-2">{t.desc}</p>
 </div>
 <div className="flex items-center gap-4 pt-5 border-t border-border/30 mt-auto opacity-60 group-hover:opacity-100 transition-opacity">
 <span className="text-[11px] font-black text-muted-foreground uppercase tracking-tighter flex items-center gap-1.5"><ListChecks size={14} className="text-[var(--subtle-foreground)]" /> {t.questions}개 문항</span>
 <span className="text-[11px] font-black text-muted-foreground uppercase tracking-tighter flex items-center gap-1.5"><Clock size={14} className="text-[var(--subtle-foreground)]" /> {t.duration} 소요</span>
 </div>
 </div>
 ))}
 </div>
 </section>

 </div>

 {wizardOpen && <WizardModal initialTemplate={wizardTemplate} onClose={() => setWizardOpen(false)} />}
 </div>
 );
}
