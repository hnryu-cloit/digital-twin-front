import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Search, Plus, Pencil, Trash2, MoreHorizontal, Smartphone, Tag, Users, X,
  ChevronDown, Check, UserCircle2, Gamepad2, ShoppingBag, Coffee, Briefcase,
  Music, SlidersHorizontal, ChevronLeft, ChevronRight, Filter, RotateCcw, LayoutGrid, List,
} from "lucide-react";

/* ─────────────── Types ─────────────── */
type Gender = "남성" | "여성";
type Segment = "Gamer" | "Premium Buyer" | "Early Adopter" | "Value Seeker" | "Trendsetter" | "Business User";

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
}

/* ─────────────── Constants ─────────────── */
const SEGMENT_COLORS: Record<Segment, { bg: string; text: string; border: string }> = {
  "Gamer":         { bg: "#EEF4FF", text: "#5B7DFF", border: "#BFD4FF" },
  "Premium Buyer": { bg: "#FDF2F8", text: "#DB2777", border: "#FBCFE8" },
  "Early Adopter": { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
  "Value Seeker":  { bg: "#FFF7ED", text: "#EA580C", border: "#FED7AA" },
  "Trendsetter":   { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" },
  "Business User": { bg: "#F0F9FF", text: "#0284C7", border: "#BAE6FD" },
};
const ALL_SEGMENTS: Segment[] = ["Gamer", "Premium Buyer", "Early Adopter", "Value Seeker", "Trendsetter", "Business User"];
const DEVICES = ["Galaxy S24 Ultra", "Z Flip6", "Galaxy S23", "Galaxy S24+", "Galaxy A54", "Galaxy Tab S9"];
const AGE_GROUPS = ["10대", "20대", "30대", "40대", "50대+"];
const ICON_META = [
  { bg: "#EEF4FF", color: "#5B7DFF" },
  { bg: "#FDF2F8", color: "#DB2777" },
  { bg: "#F0F9FF", color: "#0284C7" },
  { bg: "#F5F3FF", color: "#7C3AED" },
  { bg: "#F0FDF4", color: "#16A34A" },
  { bg: "#FFF7ED", color: "#EA580C" },
];
const PAGE_SIZE = 6;

/* ─────────────── 30 Mock Personas ─────────────── */
const RAW_PERSONAS: Omit<Persona, "id">[] = [
  { name:"이준혁", age:28, gender:"남성", occupation:"게임 개발자",     device:"Galaxy S24 Ultra", segments:["Gamer","Early Adopter"],   keywords:["카메라","성능","배터리"],        purchaseIntent:92, iconKey:0, color:"#5B7DFF", iconBg:"#EEF4FF", description:"최신 모바일 기술에 관심 많은 20대 남성 게이머. 고성��� 디바이스 선호." },
  { name:"김지연", age:34, gender:"여성", occupation:"마케터",          device:"Z Flip6",          segments:["Premium Buyer","Trendsetter"], keywords:["디자인","카메라","가격"],       purchaseIntent:78, iconKey:1, color:"#DB2777", iconBg:"#FDF2F8", description:"트렌드에 민감한 30대 마케터. 디자인과 브랜드 가치 중시." },
  { name:"박민수", age:42, gender:"남성", occupation:"중소기업 대표",   device:"Galaxy S23",       segments:["Business User","Value Seeker"],keywords:["배터리","성능","가격"],        purchaseIntent:55, iconKey:2, color:"#0284C7", iconBg:"#F0F9FF", description:"실용성과 가성비를 중시하는 40대 비즈니스 유저." },
  { name:"최수아", age:22, gender:"여성", occupation:"대학생",          device:"Z Flip6",          segments:["Trendsetter","Early Adopter"], keywords:["디자인","야간 촬영","SNS"],     purchaseIntent:70, iconKey:3, color:"#7C3AED", iconBg:"#F5F3FF", description:"SNS 콘텐츠 제작에 관심 많은 20대 대학생." },
  { name:"정태영", age:38, gender:"남성", occupation:"IT 엔지니어",     device:"Galaxy S24 Ultra", segments:["Early Adopter","Premium Buyer"],keywords:["성능","줌 기능","AI 기능"],   purchaseIntent:88, iconKey:4, color:"#16A34A", iconBg:"#F0FDF4", description:"최신 IT 기술을 빠르게 수용하는 얼리 어답터." },
  { name:"한소영", age:31, gender:"여성", occupation:"쇼핑몰 운영",     device:"Galaxy S23",       segments:["Premium Buyer","Value Seeker"],keywords:["가격","디자인","배터리"],       purchaseIntent:63, iconKey:5, color:"#EA580C", iconBg:"#FFF7ED", description:"가격 대비 성능을 꼼꼼히 따지는 30대 쇼핑몰 운영자." },
  { name:"윤성호", age:19, gender:"남성", occupation:"고등학생",        device:"Galaxy A54",       segments:["Gamer","Trendsetter"],         keywords:["게임","카메라","SNS"],          purchaseIntent:48, iconKey:0, color:"#5B7DFF", iconBg:"#EEF4FF", description:"게임과 SNS를 즐기는 10대 학생." },
  { name:"오미래", age:26, gender:"여성", occupation:"콘텐츠 크리에이터",device:"Z Flip6",         segments:["Trendsetter","Premium Buyer"], keywords:["카메라","영상","디자인"],       purchaseIntent:84, iconKey:1, color:"#DB2777", iconBg:"#FDF2F8", description:"유튜브·인스타 활동을 하는 20대 크리에이터." },
  { name:"강현준", age:45, gender:"남성", occupation:"의사",            device:"Galaxy S24 Ultra", segments:["Business User","Premium Buyer"],keywords:["보안","성능","배터리"],        purchaseIntent:72, iconKey:2, color:"#0284C7", iconBg:"#F0F9FF", description:"바쁜 일상 속 효율을 중시하는 40대 의료 전문가." },
  { name:"이서윤", age:29, gender:"여성", occupation:"UX 디자이너",     device:"Galaxy S24+",      segments:["Early Adopter","Trendsetter"],  keywords:["디자인","AI 기능","카메라"],   purchaseIntent:81, iconKey:3, color:"#7C3AED", iconBg:"#F5F3FF", description:"사용성과 미적 감각을 균형 있게 보는 UX 디자이너." },
  { name:"김도윤", age:33, gender:"남성", occupation:"스타트업 창업자", device:"Galaxy S24 Ultra", segments:["Early Adopter","Business User"],keywords:["성능","AI 기능","배터리"],    purchaseIntent:90, iconKey:4, color:"#16A34A", iconBg:"#F0FDF4", description:"빠른 의사결정을 하는 30대 스타트업 창업자." },
  { name:"박채원", age:24, gender:"여성", occupation:"간호사",          device:"Galaxy S23",       segments:["Value Seeker"],                keywords:["가격","배터리","성능"],         purchaseIntent:52, iconKey:5, color:"#EA580C", iconBg:"#FFF7ED", description:"합리적 가격의 제품을 선호하는 20대 간호사." },
  { name:"조현우", age:36, gender:"남성", occupation:"영업 관리자",     device:"Galaxy S24+",      segments:["Business User","Value Seeker"],keywords:["배터리","통화 품질","가격"],   purchaseIntent:60, iconKey:2, color:"#0284C7", iconBg:"#F0F9FF", description:"이동이 잦은 영업직 30대 관리자." },
  { name:"신예린", age:21, gender:"여성", occupation:"대학생",          device:"Galaxy A54",       segments:["Trendsetter","Gamer"],          keywords:["SNS","디자인","게임"],          purchaseIntent:45, iconKey:3, color:"#7C3AED", iconBg:"#F5F3FF", description:"트렌디한 감성과 게임을 즐기는 20대 대학생." },
  { name:"문재훈", age:50, gender:"남성", occupation:"공무원",          device:"Galaxy S23",       segments:["Value Seeker","Business User"], keywords:["가격","내구성","배터리"],       purchaseIntent:40, iconKey:2, color:"#0284C7", iconBg:"#F0F9FF", description:"안정적이고 가성비 높은 제품을 선호하는 50대 공무원." },
  { name:"류하은", age:27, gender:"여성", occupation:"패션 MD",         device:"Z Flip6",          segments:["Premium Buyer","Trendsetter"], keywords:["디자인","카메라","SNS"],        purchaseIntent:86, iconKey:1, color:"#DB2777", iconBg:"#FDF2F8", description:"패션과 트렌드를 중시하는 20대 패션 MD." },
  { name:"임종석", age:41, gender:"남성", occupation:"회계사",          device:"Galaxy S24+",      segments:["Business User","Value Seeker"],keywords:["보안","가격","성능"],          purchaseIntent:58, iconKey:2, color:"#0284C7", iconBg:"#F0F9FF", description:"데이터 보안을 중시하는 40대 회계사." },
  { name:"홍지민", age:23, gender:"여성", occupation:"뷰티 유튜버",     device:"Galaxy S24 Ultra", segments:["Trendsetter","Premium Buyer"], keywords:["카메라","영상","조명"],         purchaseIntent:93, iconKey:1, color:"#DB2777", iconBg:"#FDF2F8", description:"뷰티 콘텐츠에 집중하는 20대 유튜버." },
  { name:"송민기", age:30, gender:"남성", occupation:"프리랜서 개발자", device:"Galaxy S24 Ultra", segments:["Gamer","Early Adopter"],       keywords:["성능","AI 기능","줌 기능"],   purchaseIntent:80, iconKey:0, color:"#5B7DFF", iconBg:"#EEF4FF", description:"최신 기술에 관심 많은 30대 프리랜서." },
  { name:"전수빈", age:35, gender:"여성", occupation:"초등학교 교사",   device:"Galaxy S23",       segments:["Value Seeker"],                keywords:["가격","내구성","카메라"],       purchaseIntent:50, iconKey:5, color:"#EA580C", iconBg:"#FFF7ED", description:"학부모 소통을 위해 스마트폰을 활용하는 선생님." },
  { name:"남상우", age:18, gender:"남성", occupation:"고등학생",        device:"Galaxy A54",       segments:["Gamer","Trendsetter"],          keywords:["게임","성능","SNS"],           purchaseIntent:43, iconKey:0, color:"#5B7DFF", iconBg:"#EEF4FF", description:"게임과 SNS가 주요 스마트폰 활용 목적인 10대." },
  { name:"백지아", age:39, gender:"여성", occupation:"간호 관리자",     device:"Galaxy S24+",      segments:["Business User","Value Seeker"],keywords:["배터리","가격","보안"],         purchaseIntent:62, iconKey:2, color:"#0284C7", iconBg:"#F0F9FF", description:"업무용 앱을 많이 쓰는 30대 의료 관리자." },
  { name:"권오준", age:47, gender:"남성", occupation:"건설 현장 소장",  device:"Galaxy S23",       segments:["Value Seeker"],                keywords:["내구성","배터리","가격"],       purchaseIntent:38, iconKey:5, color:"#EA580C", iconBg:"#FFF7ED", description:"야외 환경에서 내구성 있는 기기를 선호하는 40대." },
  { name:"유나연", age:25, gender:"여성", occupation:"인테리어 디자이너",device:"Z Flip6",          segments:["Trendsetter","Early Adopter"], keywords:["디자인","카메라","색감"],       purchaseIntent:75, iconKey:3, color:"#7C3AED", iconBg:"#F5F3FF", description:"공간 촬영을 위한 카메라 성능을 중시하는 디자이너." },
  { name:"장준혁", age:32, gender:"남성", occupation:"게임 스트리머",   device:"Galaxy S24 Ultra", segments:["Gamer","Premium Buyer"],        keywords:["성능","배터리","스트리밍"],     purchaseIntent:96, iconKey:0, color:"#5B7DFF", iconBg:"#EEF4FF", description:"고성능 기기가 필수인 전업 게임 스트리머." },
  { name:"이혜원", age:44, gender:"여성", occupation:"작가",            device:"Galaxy Tab S9",    segments:["Premium Buyer","Value Seeker"],keywords:["배터리","노트","성능"],         purchaseIntent:66, iconKey:3, color:"#7C3AED", iconBg:"#F5F3FF", description:"글쓰기와 메모를 위해 태블릿을 주로 쓰는 작가." },
  { name:"최병찬", age:53, gender:"남성", occupation:"자영업자",        device:"Galaxy S23",       segments:["Business User"],               keywords:["가격","통화","배터리"],         purchaseIntent:35, iconKey:2, color:"#0284C7", iconBg:"#F0F9FF", description:"비용 효율을 최우선으로 보는 50대 자영업자." },
  { name:"김나희", age:20, gender:"여성", occupation:"대학생",          device:"Galaxy A54",       segments:["Trendsetter","Early Adopter"], keywords:["SNS","카메라","디자인"],        purchaseIntent:55, iconKey:1, color:"#DB2777", iconBg:"#FDF2F8", description:"트렌드와 감성을 중시하는 20대 초반 대학생." },
  { name:"박세준", age:37, gender:"남성", occupation:"데이터 분석가",   device:"Galaxy S24 Ultra", segments:["Early Adopter","Business User"],keywords:["AI 기능","성능","보안"],       purchaseIntent:83, iconKey:4, color:"#16A34A", iconBg:"#F0FDF4", description:"데이터와 AI 기능에 관심 높은 30대 분석가." },
  { name:"오수진", age:43, gender:"여성", occupation:"HR 매니저",       device:"Galaxy S24+",      segments:["Business User","Premium Buyer"],keywords:["성능","보안","가격"],          purchaseIntent:69, iconKey:1, color:"#DB2777", iconBg:"#FDF2F8", description:"팀 커뮤니케이션 효율을 중시하는 40대 HR 담당자." },
];

const PERSONA_LIST: Persona[] = RAW_PERSONAS.map((p, i) => ({ ...p, id: `p${i + 1}` }));

/* ─────────────── Icon Renderer ─────────────── */
function PersonaIcon({ iconKey, size = 20 }: { iconKey: number; size?: number }) {
  const icons = [
    <Gamepad2 size={size} />, <Coffee size={size} />, <Briefcase size={size} />,
    <Music size={size} />, <Smartphone size={size} />, <ShoppingBag size={size} />,
  ];
  return <span style={{ color: ICON_META[iconKey % 6].color }}>{icons[iconKey % 6]}</span>;
}

/* ─────────────── Intent Bar ─────────────── */
function IntentBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#1D1F3D", minWidth: 30, textAlign: "right" }}>{value}%</span>
    </div>
  );
}

/* ─────────────── Persona Card ─────────────── */
function PersonaCard({ persona, onEdit, onDelete }: { persona: Persona; onEdit: (p: Persona) => void; onDelete: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-[#E1E8F1] shadow-sm p-5 flex flex-col gap-3 relative group hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: ICON_META[persona.iconKey % 6].bg }}>
            <PersonaIcon iconKey={persona.iconKey} size={20} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1D1F3D" }}>{persona.name}</p>
            <p style={{ fontSize: 12, color: "#7C8397" }}>{persona.age}세 · {persona.gender} · {persona.occupation}</p>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen((p) => !p)}
            className="w-7 h-7 rounded-lg bg-[#EEF2FA] hover:bg-[#EEF4FF] flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100">
            <MoreHorizontal size={14} className="text-[#7C8397]" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-30 bg-white border border-[#E1E8F1] rounded-xl shadow-lg py-1.5 w-32">
              <button onClick={() => { onEdit(persona); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#EEF4FF] transition-colors">
                <Pencil size={12} className="text-[#5B7DFF]" />
                <span style={{ fontSize: 12, color: "#1D1F3D" }}>편집</span>
              </button>
              <button onClick={() => { onDelete(persona.id); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#FFF0F0] transition-colors">
                <Trash2 size={12} className="text-[#EF4444]" />
                <span style={{ fontSize: 12, color: "#EF4444" }}>삭제</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="line-clamp-2" style={{ fontSize: 12, color: "#7C8397", lineHeight: 1.6 }}>{persona.description}</p>

      <div className="flex items-center gap-1.5">
        <Smartphone size={12} className="text-[#9BA6B8]" />
        <span style={{ fontSize: 12, color: "#3C4556" }}>{persona.device}</span>
      </div>

      <div className="flex flex-wrap gap-1">
        {persona.segments.map((seg) => {
          const c = SEGMENT_COLORS[seg];
          return (
            <span key={seg} className="px-2 py-0.5 rounded-full border"
              style={{ fontSize: 10, fontWeight: 600, backgroundColor: c.bg, color: c.text, borderColor: c.border }}>
              {seg}
            </span>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-1">
        {persona.keywords.slice(0, 4).map((kw) => (
          <span key={kw} className="bg-[#F7FAFF] border border-[#DCE4F3] text-[#7C8397] px-2 py-0.5 rounded-full"
            style={{ fontSize: 10 }}>
            # {kw}
          </span>
        ))}
      </div>

      <div>
        <span style={{ fontSize: 11, color: "#9BA6B8" }}>구매 의향</span>
        <IntentBar value={persona.purchaseIntent} color={persona.color} />
      </div>

      {/* Quick edit button */}
      <button
        onClick={() => onEdit(persona)}
        className="absolute bottom-4 right-4 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#EEF4FF] text-[#5B7DFF] border border-[#BFD4FF] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#5B7DFF] hover:text-white"
        style={{ fontSize: 11, fontWeight: 600 }}
      >
        <Pencil size={11} />
        편집
      </button>
    </div>
  );
}

function PersonaListRow({
  persona,
  onEdit,
  onDelete,
}: {
  persona: Persona;
  onEdit: (p: Persona) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <tr className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#FAFCFF] transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: ICON_META[persona.iconKey % 6].bg }}
          >
            <PersonaIcon iconKey={persona.iconKey} size={18} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1D1F3D" }}>{persona.name}</p>
            <p style={{ fontSize: 11, color: "#7C8397" }}>{persona.age}세 · {persona.gender} · {persona.occupation}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span style={{ fontSize: 12, color: "#3C4556" }}>{persona.device}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {persona.segments.slice(0, 2).map((seg) => {
            const c = SEGMENT_COLORS[seg];
            return (
              <span
                key={seg}
                className="px-2 py-0.5 rounded-full border"
                style={{ fontSize: 10, fontWeight: 600, backgroundColor: c.bg, color: c.text, borderColor: c.border }}
              >
                {seg}
              </span>
            );
          })}
          {persona.segments.length > 2 && (
            <span className="px-2 py-0.5 rounded-full border border-[#DCE4F3] bg-[#F7FAFF]" style={{ fontSize: 10, color: "#7C8397" }}>
              +{persona.segments.length - 2}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="max-w-[180px]">
          <IntentBar value={persona.purchaseIntent} color={persona.color} />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(persona)}
            className="px-3 py-1.5 rounded-lg border border-[#E1E8F1] text-[#3C4556] hover:bg-[#EEF4FF] hover:border-[#BFD4FF] hover:text-[#5B7DFF] transition-colors"
            style={{ fontSize: 11, fontWeight: 600 }}
          >
            수정
          </button>
          <button
            onClick={() => onDelete(persona.id)}
            className="px-3 py-1.5 rounded-lg border border-[#F5C2C7] text-[#EF4444] hover:bg-[#FFF1F2] transition-colors"
            style={{ fontSize: 11, fontWeight: 600 }}
          >
            삭제
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ─────────────── Edit Modal ─────────────── */
const EMPTY: Omit<Persona, "id"> = {
  name: "", age: 25, gender: "남성", occupation: "", device: "Galaxy S24 Ultra",
  segments: [], keywords: [], purchaseIntent: 70,
  color: "#5B7DFF", iconBg: "#EEF4FF", iconKey: 0, description: "",
};

function EditModal({ initial, onSave, onClose }: {
  initial?: Persona; onSave: (data: Omit<Persona, "id">) => void; onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<Persona, "id">>(initial ? { ...initial } : { ...EMPTY });
  const [kwInput, setKwInput] = useState("");
  const [segOpen, setSegOpen] = useState(false);

  const toggleSeg = (seg: Segment) =>
    setForm((p) => ({ ...p, segments: p.segments.includes(seg) ? p.segments.filter((s) => s !== seg) : [...p.segments, seg] }));

  const addKw = () => {
    const kw = kwInput.trim();
    if (kw && !form.keywords.includes(kw)) setForm((p) => ({ ...p, keywords: [...p.keywords, kw] }));
    setKwInput("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-[#E1E8F1] w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E1E8F1]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#5B7DFF] flex items-center justify-center">
              <UserCircle2 size={14} className="text-white" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1D1F3D" }}>
              {initial ? "페르소나 편집" : "페르소나 추가"}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#EEF2FA] hover:bg-[#EEF4FF] flex items-center justify-center transition-colors">
            <X size={14} className="text-[#7C8397]" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {/* Name + Age */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5" style={{ fontSize: 12, fontWeight: 700, color: "#3C4556" }}>이름</label>
              <input className="w-full border border-[#E1E8F1] rounded-lg px-3 py-2 outline-none focus:border-[#5B7DFF] bg-[#F7FAFF] focus:bg-white transition-colors"
                style={{ fontSize: 13, color: "#1D1F3D" }} placeholder="홍길동"
                value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 12, fontWeight: 700, color: "#3C4556" }}>나이</label>
              <input type="number" className="w-full border border-[#E1E8F1] rounded-lg px-3 py-2 outline-none focus:border-[#5B7DFF] bg-[#F7FAFF] focus:bg-white transition-colors"
                style={{ fontSize: 13, color: "#1D1F3D" }}
                value={form.age} onChange={(e) => setForm((p) => ({ ...p, age: Number(e.target.value) }))} />
            </div>
          </div>

          {/* Gender + Occupation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5" style={{ fontSize: 12, fontWeight: 700, color: "#3C4556" }}>성별</label>
              <div className="flex gap-2">
                {(["남성", "여성"] as Gender[]).map((g) => (
                  <button key={g} onClick={() => setForm((p) => ({ ...p, gender: g }))}
                    className="flex-1 py-2 rounded-lg border transition-colors"
                    style={{ fontSize: 13, fontWeight: form.gender === g ? 700 : 500,
                      backgroundColor: form.gender === g ? "#EEF4FF" : "#F7FAFF",
                      borderColor: form.gender === g ? "#5B7DFF" : "#E1E8F1",
                      color: form.gender === g ? "#5B7DFF" : "#3C4556" }}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 12, fontWeight: 700, color: "#3C4556" }}>직업</label>
              <input className="w-full border border-[#E1E8F1] rounded-lg px-3 py-2 outline-none focus:border-[#5B7DFF] bg-[#F7FAFF] focus:bg-white transition-colors"
                style={{ fontSize: 13, color: "#1D1F3D" }} placeholder="직업을 입력하세요"
                value={form.occupation} onChange={(e) => setForm((p) => ({ ...p, occupation: e.target.value }))} />
            </div>
          </div>

          {/* Device */}
          <div>
            <label className="block mb-1.5" style={{ fontSize: 12, fontWeight: 700, color: "#3C4556" }}>사용 기기</label>
            <div className="relative">
              <select className="w-full border border-[#E1E8F1] rounded-lg px-3 py-2 outline-none focus:border-[#5B7DFF] bg-[#F7FAFF] appearance-none"
                style={{ fontSize: 13, color: "#1D1F3D" }}
                value={form.device} onChange={(e) => setForm((p) => ({ ...p, device: e.target.value }))}>
                {DEVICES.map((d) => <option key={d}>{d}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9BA6B8] pointer-events-none" />
            </div>
          </div>

          {/* Segments */}
          <div>
            <label className="block mb-1.5" style={{ fontSize: 12, fontWeight: 700, color: "#3C4556" }}>세그먼트</label>
            <div className="border border-[#E1E8F1] rounded-lg px-3 py-2 bg-[#F7FAFF] flex flex-wrap gap-1.5 cursor-pointer min-h-[40px]"
              onClick={() => setSegOpen((p) => !p)}>
              {form.segments.length === 0 && <span style={{ fontSize: 13, color: "#DCE4F3" }}>세그먼트 선택...</span>}
              {form.segments.map((seg) => {
                const c = SEGMENT_COLORS[seg];
                return <span key={seg} className="px-2 py-0.5 rounded-full border"
                  style={{ fontSize: 11, fontWeight: 600, backgroundColor: c.bg, color: c.text, borderColor: c.border }}>{seg}</span>;
              })}
            </div>
            {segOpen && (
              <div className="border border-[#E1E8F1] rounded-lg mt-1 bg-white shadow-lg overflow-hidden z-10 relative">
                {ALL_SEGMENTS.map((seg) => {
                  const c = SEGMENT_COLORS[seg];
                  const active = form.segments.includes(seg);
                  return (
                    <button key={seg} onClick={() => toggleSeg(seg)}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#EEF2FA] transition-colors">
                      <span className="px-2 py-0.5 rounded-full border"
                        style={{ fontSize: 11, fontWeight: 600, backgroundColor: c.bg, color: c.text, borderColor: c.border }}>{seg}</span>
                      {active && <Check size={13} className="text-[#5B7DFF]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Keywords */}
          <div>
            <label className="block mb-1.5" style={{ fontSize: 12, fontWeight: 700, color: "#3C4556" }}>관심 키워드</label>
            <div className="flex gap-2 mb-2">
              <input className="flex-1 border border-[#E1E8F1] rounded-lg px-3 py-2 outline-none focus:border-[#5B7DFF] bg-[#F7FAFF] focus:bg-white transition-colors"
                style={{ fontSize: 13, color: "#1D1F3D" }} placeholder="키워드 입력 후 Enter"
                value={kwInput} onChange={(e) => setKwInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addKw()} />
              <button onClick={addKw} className="px-3 py-2 bg-[#5B7DFF] text-white rounded-lg hover:bg-[#4562E8] transition-colors"
                style={{ fontSize: 12 }}>추가</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.keywords.map((kw) => (
                <span key={kw} className="flex items-center gap-1 bg-[#F7FAFF] border border-[#DCE4F3] text-[#3C4556] px-2 py-0.5 rounded-full"
                  style={{ fontSize: 11 }}>
                  # {kw}
                  <button onClick={() => setForm((p) => ({ ...p, keywords: p.keywords.filter((k) => k !== kw) }))}
                    className="text-[#DCE4F3] hover:text-[#EF4444] transition-colors"><X size={10} /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Purchase Intent */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label style={{ fontSize: 12, fontWeight: 700, color: "#3C4556" }}>구매 의향</label>
              <span className="bg-[#EEF4FF] text-[#5B7DFF] px-2 py-0.5 rounded-full" style={{ fontSize: 11, fontWeight: 700 }}>
                {form.purchaseIntent}%
              </span>
            </div>
            <input type="range" min={0} max={100} value={form.purchaseIntent}
              onChange={(e) => setForm((p) => ({ ...p, purchaseIntent: Number(e.target.value) }))}
              className="w-full accent-[#5B7DFF]" />
            <div className="flex justify-between"><span style={{ fontSize: 10, color: "#DCE4F3" }}>0%</span><span style={{ fontSize: 10, color: "#DCE4F3" }}>100%</span></div>
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1.5" style={{ fontSize: 12, fontWeight: 700, color: "#3C4556" }}>설명</label>
            <textarea className="w-full border border-[#E1E8F1] rounded-lg px-3 py-2 outline-none focus:border-[#5B7DFF] bg-[#F7FAFF] focus:bg-white transition-colors resize-none"
              style={{ fontSize: 13, color: "#1D1F3D", lineHeight: 1.6 }} rows={3}
              placeholder="페르소나에 대한 설명을 입력하세요..."
              value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
        </div>

        <div className="flex gap-2 px-6 py-4 border-t border-[#E1E8F1]">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#E1E8F1] rounded-lg text-[#3C4556] hover:bg-[#EEF2FA] transition-colors"
            style={{ fontSize: 13, fontWeight: 600 }}>취소</button>
          <button onClick={() => onSave(form)} disabled={!form.name.trim() || !form.occupation.trim()}
            className="flex-1 py-2.5 bg-[#5B7DFF] text-white rounded-lg hover:bg-[#4562E8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            style={{ fontSize: 13, fontWeight: 600 }}>
            {initial ? "저장하기" : "페르소나 추가"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────��───── Advanced Filter Popup ─────────────── */
interface AdvancedFilter {
  genders: Gender[];
  ageGroups: string[];
  devices: string[];
  segments: Segment[];
  intentMin: number;
  intentMax: number;
}

const DEFAULT_FILTER: AdvancedFilter = {
  genders: [], ageGroups: [], devices: [], segments: [], intentMin: 0, intentMax: 100,
};

function AdvancedFilterPopup({ filter, onChange, onClose, onReset, position }: {
  filter: AdvancedFilter;
  onChange: (f: AdvancedFilter) => void;
  onClose: () => void;
  onReset: () => void;
  position: { top: number; left: number };
}) {
  const [local, setLocal] = useState<AdvancedFilter>({ ...filter });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const toggle = <T extends string>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const apply = () => { onChange(local); onClose(); };
  const reset = () => { setLocal({ ...DEFAULT_FILTER }); onReset(); };

  const activeCount = [
    local.genders.length, local.ageGroups.length, local.devices.length, local.segments.length,
    local.intentMin > 0 || local.intentMax < 100 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div
      ref={ref}
      className="fixed z-[80] w-[520px] overflow-hidden rounded-2xl border border-[#E1E8F1] bg-white shadow-2xl"
      style={{ top: position.top, left: position.left, boxShadow: "0 20px 60px #0000001A" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#EEF4FF] flex items-center justify-center">
            <SlidersHorizontal size={14} className="text-[#5B7DFF]" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#1D1F3D" }}>상세 필터</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 bg-[#5B7DFF] text-white rounded-full flex items-center justify-center"
              style={{ fontSize: 10, fontWeight: 700 }}>{activeCount}</span>
          )}
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg bg-[#EEF2FA] hover:bg-[#EEF4FF] flex items-center justify-center transition-colors">
          <X size={13} className="text-[#7C8397]" />
        </button>
      </div>

      <div className="px-5 py-4 flex flex-col gap-5 max-h-[520px] overflow-y-auto">

        {/* 인구통계 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#5B7DFF] rounded-full" />
            <span style={{ fontSize: 12, fontWeight: 800, color: "#1D1F3D" }}>인구통계</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Gender */}
            <div>
              <p style={{ fontSize: 11, color: "#9BA6B8", fontWeight: 600, marginBottom: 8 }}>성별</p>
              <div className="flex gap-2">
                {(["남성", "여성"] as Gender[]).map((g) => (
                  <button key={g} onClick={() => setLocal((p) => ({ ...p, genders: toggle(p.genders, g) }))}
                    className="flex-1 py-2 rounded-xl border transition-colors"
                    style={{
                      fontSize: 12, fontWeight: local.genders.includes(g) ? 700 : 500,
                      backgroundColor: local.genders.includes(g) ? "#EEF4FF" : "#F7FAFF",
                      borderColor: local.genders.includes(g) ? "#5B7DFF" : "#E1E8F1",
                      color: local.genders.includes(g) ? "#5B7DFF" : "#7C8397",
                    }}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            {/* Age */}
            <div>
              <p style={{ fontSize: 11, color: "#9BA6B8", fontWeight: 600, marginBottom: 8 }}>연령대</p>
              <div className="flex flex-wrap gap-1.5">
                {AGE_GROUPS.map((ag) => (
                  <button key={ag} onClick={() => setLocal((p) => ({ ...p, ageGroups: toggle(p.ageGroups, ag) }))}
                    className="px-2.5 py-1 rounded-full border transition-colors"
                    style={{
                      fontSize: 11, fontWeight: local.ageGroups.includes(ag) ? 700 : 500,
                      backgroundColor: local.ageGroups.includes(ag) ? "#EEF4FF" : "#F7FAFF",
                      borderColor: local.ageGroups.includes(ag) ? "#5B7DFF" : "#E1E8F1",
                      color: local.ageGroups.includes(ag) ? "#5B7DFF" : "#7C8397",
                    }}>
                    {ag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-[#F1F5F9]" />

        {/* 사용 기기 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#8B5CF6] rounded-full" />
            <span style={{ fontSize: 12, fontWeight: 800, color: "#1D1F3D" }}>사용 기기</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DEVICES.map((d) => (
              <button key={d} onClick={() => setLocal((p) => ({ ...p, devices: toggle(p.devices, d) }))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors"
                style={{
                  fontSize: 11, fontWeight: local.devices.includes(d) ? 700 : 500,
                  backgroundColor: local.devices.includes(d) ? "#F5F3FF" : "#F7FAFF",
                  borderColor: local.devices.includes(d) ? "#8B5CF6" : "#E1E8F1",
                  color: local.devices.includes(d) ? "#7C3AED" : "#7C8397",
                }}>
                <Smartphone size={11} />
                {d}
                {local.devices.includes(d) && <Check size={10} />}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-[#F1F5F9]" />

        {/* 세그먼트 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#22C55E] rounded-full" />
            <span style={{ fontSize: 12, fontWeight: 800, color: "#1D1F3D" }}>세그먼트</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_SEGMENTS.map((seg) => {
              const c = SEGMENT_COLORS[seg];
              const active = local.segments.includes(seg);
              return (
                <button key={seg} onClick={() => setLocal((p) => ({ ...p, segments: toggle(p.segments, seg) }))}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full border transition-colors"
                  style={{ fontSize: 11, fontWeight: active ? 700 : 500,
                    backgroundColor: active ? c.bg : "#F7FAFF",
                    borderColor: active ? c.border : "#E1E8F1",
                    color: active ? c.text : "#7C8397" }}>
                  {seg}
                  {active && <Check size={10} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-[#F1F5F9]" />

        {/* 구매 의향 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#F59E0B] rounded-full" />
            <span style={{ fontSize: 12, fontWeight: 800, color: "#1D1F3D" }}>구매 의향 범위</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontSize: 11, color: "#9BA6B8" }}>최소</span>
                <span className="bg-[#FFF7ED] text-[#F59E0B] px-2 py-0.5 rounded-full border border-[#FDE68A]"
                  style={{ fontSize: 11, fontWeight: 700 }}>{local.intentMin}%</span>
              </div>
              <input type="range" min={0} max={100} value={local.intentMin}
                onChange={(e) => setLocal((p) => ({ ...p, intentMin: Math.min(Number(e.target.value), p.intentMax - 5) }))}
                className="w-full accent-[#F59E0B]" />
            </div>
            <span style={{ fontSize: 14, color: "#DCE4F3" }}>—</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontSize: 11, color: "#9BA6B8" }}>최대</span>
                <span className="bg-[#FFF7ED] text-[#F59E0B] px-2 py-0.5 rounded-full border border-[#FDE68A]"
                  style={{ fontSize: 11, fontWeight: 700 }}>{local.intentMax}%</span>
              </div>
              <input type="range" min={0} max={100} value={local.intentMax}
                onChange={(e) => setLocal((p) => ({ ...p, intentMax: Math.max(Number(e.target.value), p.intentMin + 5) }))}
                className="w-full accent-[#F59E0B]" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-2 px-5 py-4 border-t border-[#F1F5F9]">
        <button onClick={reset} className="flex items-center gap-1.5 px-4 py-2.5 border border-[#E1E8F1] rounded-xl text-[#9BA6B8] hover:bg-[#EEF2FA] transition-colors"
          style={{ fontSize: 12, fontWeight: 600 }}>
          <RotateCcw size={12} />초기화
        </button>
        <button onClick={apply} className="flex-1 py-2.5 bg-[#5B7DFF] text-white rounded-xl hover:bg-[#4562E8] transition-colors shadow-md"
          style={{ fontSize: 13, fontWeight: 700, boxShadow: "0 4px 12px #5B7DFF30" }}>
          필터 적용
        </button>
      </div>
    </div>
  );
}

/* ─────────────── Pagination ─────────────── */
function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  const FIXED_PAGES = 10;

  return (
    <div className="flex items-center gap-1">
      {/* Prev */}
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="p-1 rounded transition-colors disabled:opacity-25 disabled:cursor-not-allowed hover:text-[#5B7DFF]"
        style={{ color: "#9BA6B8" }}
      >
        <ChevronLeft size={15} />
      </button>

      {/* Page numbers */}
      {Array.from({ length: FIXED_PAGES }, (_, i) => i + 1).map((p) => {
        const isActive = p === current;
        const isDisabled = p > total;
        return (
          <button
            key={p}
            onClick={() => !isDisabled && onChange(p)}
            className="rounded transition-colors"
            style={{
              width: 28, height: 28,
              fontSize: 13,
              fontWeight: isActive ? 700 : 400,
              color: isActive ? "#5B7DFF" : isDisabled ? "#D1D8E6" : "#7C8397",
              cursor: isDisabled ? "default" : "pointer",
              background: "none", border: "none", outline: "none",
              borderBottom: isActive ? "2px solid #5B7DFF" : "2px solid transparent",
            }}
          >
            {p}
          </button>
        );
      })}

      {/* Next */}
      <button
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current >= total}
        className="p-1 rounded transition-colors disabled:opacity-25 disabled:cursor-not-allowed hover:text-[#5B7DFF]"
        style={{ color: "#9BA6B8" }}
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

/* ─────────────── Main Page ─────────────── */
export const PersonaManagerPage: React.FC = () => {
  const [personas, setPersonas] = useState<Persona[]>(PERSONA_LIST);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [advFilter, setAdvFilter] = useState<AdvancedFilter>({ ...DEFAULT_FILTER });
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterPosition, setFilterPosition] = useState<{ top: number; left: number } | null>(null);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Persona | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const getAgeGroup = (age: number) => {
    if (age < 20) return "10대";
    if (age < 30) return "20대";
    if (age < 40) return "30대";
    if (age < 50) return "40대";
    return "50대+";
  };

  const filtered = personas.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.includes(q) || p.occupation.toLowerCase().includes(q) || p.keywords.some((k) => k.includes(q));
    const matchGender = advFilter.genders.length === 0 || advFilter.genders.includes(p.gender);
    const matchAge = advFilter.ageGroups.length === 0 || advFilter.ageGroups.includes(getAgeGroup(p.age));
    const matchDevice = advFilter.devices.length === 0 || advFilter.devices.includes(p.device);
    const matchSeg = advFilter.segments.length === 0 || p.segments.some((s) => advFilter.segments.includes(s));
    const matchIntent = p.purchaseIntent >= advFilter.intentMin && p.purchaseIntent <= advFilter.intentMax;
    return matchSearch && matchGender && matchAge && matchDevice && matchSeg && matchIntent;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleFilterChange = (f: AdvancedFilter) => { setAdvFilter(f); setPage(1); };
  const toggleFilterPopup = () => {
    if (filterOpen) {
      setFilterOpen(false);
      return;
    }

    const rect = filterRef.current?.getBoundingClientRect();
    if (rect) {
      setFilterPosition({
        top: rect.bottom + 8,
        left: Math.max(16, Math.min(rect.left, window.innerWidth - 536)),
      });
    }
    setFilterOpen(true);
  };

  const activeFilterCount = [
    advFilter.genders.length, advFilter.ageGroups.length, advFilter.devices.length, advFilter.segments.length,
    advFilter.intentMin > 0 || advFilter.intentMax < 100 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const handleSave = (data: Omit<Persona, "id">) => {
    if (editTarget) {
      setPersonas((prev) => prev.map((p) => p.id === editTarget.id ? { ...editTarget, ...data } : p));
    } else {
      const idx = personas.length % 6;
      setPersonas((prev) => [{ ...data, id: `p${Date.now()}`, iconKey: idx, color: ICON_META[idx].color, iconBg: ICON_META[idx].bg }, ...prev]);
    }
    setModalOpen(false);
    setEditTarget(undefined);
    setPage(1);
  };

  const confirmDelete = () => {
    if (deleteConfirm) { setPersonas((prev) => prev.filter((p) => p.id !== deleteConfirm)); setDeleteConfirm(null); }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#EEF2FA] overflow-hidden">

      {/* Header */}
      <div className="app-page-header flex items-start justify-between gap-4">
        <div>
          <p style={{ fontSize: 11, color: "#5B7DFF", fontWeight: 600, letterSpacing: "0.06em" }}>PERSONA</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1D1F3D", lineHeight: 1.3 }}>페르소나 관리</h1>
          <p style={{ fontSize: 13, color: "#7C8397", marginTop: 4 }}>시스템에 등록된 사용자 페르소나를 관리합니다.</p>
        </div>
        <button onClick={() => { setEditTarget(undefined); setModalOpen(true); }}
          className="flex items-center gap-2 bg-[#5B7DFF] text-white px-4 py-2.5 rounded-xl hover:bg-[#4562E8] transition-colors shadow-md shrink-0"
          style={{ fontSize: 13, fontWeight: 600, boxShadow: "0 4px 12px #5B7DFF30" }}>
          <Plus size={15} />페르소나 추가
        </button>
      </div>

      {/* Toolbar */}
      <div className="app-toolbar flex items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 bg-[#EEF2FA] border border-[#E1E8F1] rounded-xl px-3 py-2 flex-1 max-w-80">
          <Search size={14} className="text-[#9BA6B8] shrink-0" />
          <input className="bg-transparent outline-none flex-1 text-[#1D1F3D] placeholder:text-[#DCE4F3]"
            style={{ fontSize: 13 }} placeholder="이름, 직업, 키워드 검색..."
            value={search} onChange={(e) => handleSearch(e.target.value)} />
          {search && (
            <button onClick={() => handleSearch("")}><X size={13} className="text-[#DCE4F3] hover:text-[#9BA6B8]" /></button>
          )}
        </div>

        {/* Advanced Filter Button */}
        <div className="relative" ref={filterRef}>
          <button onClick={toggleFilterPopup}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
              filterOpen || activeFilterCount > 0
                ? "bg-[#EEF4FF] border-[#5B7DFF] text-[#5B7DFF]"
                : "bg-[#EEF2FA] border-[#E1E8F1] text-[#7C8397] hover:bg-[#EEF4FF] hover:border-[#BFD4FF]"
            }`}
            style={{ fontSize: 12, fontWeight: 600 }}>
            <SlidersHorizontal size={14} />
            상세 필터
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-[#5B7DFF] text-white rounded-full flex items-center justify-center"
                style={{ fontSize: 10, fontWeight: 800 }}>{activeFilterCount}</span>
            )}
            <ChevronDown size={13} className={`transition-transform ${filterOpen ? "rotate-180" : ""}`} />
          </button>

          {filterOpen && filterPosition && (
            <AdvancedFilterPopup
              filter={advFilter}
              onChange={handleFilterChange}
              onClose={() => setFilterOpen(false)}
              onReset={() => { setAdvFilter({ ...DEFAULT_FILTER }); setPage(1); }}
              position={filterPosition}
            />
          )}
        </div>

        <div className="flex items-center rounded-xl border border-[#E1E8F1] bg-white p-1">
          <button
            onClick={() => setViewMode("card")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
              viewMode === "card" ? "bg-[#EEF4FF] text-[#5B7DFF]" : "text-[#7C8397] hover:bg-[#F7FAFF]"
            }`}
            style={{ fontSize: 12, fontWeight: 600 }}
          >
            <LayoutGrid size={13} />
            카드
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
              viewMode === "list" ? "bg-[#EEF4FF] text-[#5B7DFF]" : "text-[#7C8397] hover:bg-[#F7FAFF]"
            }`}
            style={{ fontSize: 12, fontWeight: 600 }}
          >
            <List size={13} />
            리스트
          </button>
        </div>

        {/* Active filter chips */}
        {advFilter.genders.map((g) => (
          <span key={g} className="flex items-center gap-1 bg-[#EEF4FF] text-[#5B7DFF] border border-[#BFD4FF] px-2.5 py-1 rounded-full"
            style={{ fontSize: 11, fontWeight: 600 }}>
            {g}
            <button onClick={() => setAdvFilter((p) => ({ ...p, genders: p.genders.filter((v) => v !== g) }))}>
              <X size={10} />
            </button>
          </span>
        ))}
        {advFilter.ageGroups.map((ag) => (
          <span key={ag} className="flex items-center gap-1 bg-[#EEF4FF] text-[#5B7DFF] border border-[#BFD4FF] px-2.5 py-1 rounded-full"
            style={{ fontSize: 11, fontWeight: 600 }}>
            {ag}
            <button onClick={() => setAdvFilter((p) => ({ ...p, ageGroups: p.ageGroups.filter((v) => v !== ag) }))}>
              <X size={10} />
            </button>
          </span>
        ))}
        {advFilter.segments.map((seg) => {
          const c = SEGMENT_COLORS[seg];
          return (
            <span key={seg} className="flex items-center gap-1 px-2.5 py-1 rounded-full border"
              style={{ fontSize: 11, fontWeight: 600, backgroundColor: c.bg, color: c.text, borderColor: c.border }}>
              {seg}
              <button onClick={() => setAdvFilter((p) => ({ ...p, segments: p.segments.filter((v) => v !== seg) }))}>
                <X size={10} />
              </button>
            </span>
          );
        })}

        {/* Count */}
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <Users size={13} className="text-[#9BA6B8]" />
          <span style={{ fontSize: 12, color: "#7C8397" }}>
            <span style={{ fontWeight: 700, color: "#5B7DFF" }}>{filtered.length}</span> / {personas.length}명
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 pt-5 pb-2">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#EEF4FF] flex items-center justify-center mb-3">
              <Users size={24} className="text-[#5B7DFF]" />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1D1F3D" }}>검색 결과가 없습니다</p>
            <p style={{ fontSize: 13, color: "#9BA6B8", marginTop: 4 }}>필터 조건을 변경해보세요.</p>
            {activeFilterCount > 0 && (
              <button onClick={() => setAdvFilter({ ...DEFAULT_FILTER })}
                className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B7DFF] text-white hover:bg-[#4562E8] transition-colors"
                style={{ fontSize: 12, fontWeight: 600 }}>
                <RotateCcw size={12} />필터 초기화
              </button>
            )}
          </div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.map((p) => (
              <PersonaCard key={p.id} persona={p}
                onEdit={(p) => { setEditTarget(p); setModalOpen(true); }}
                onDelete={(id) => setDeleteConfirm(id)} />
            ))}
          </div>
        ) : (
          <div className="app-stat-card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px]">
                <thead>
                  <tr className="bg-[#F7FAFF]">
                    <th className="px-4 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, color: "#9BA6B8" }}>페르소나</th>
                    <th className="px-4 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, color: "#9BA6B8" }}>기기</th>
                    <th className="px-4 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, color: "#9BA6B8" }}>세그먼트</th>
                    <th className="px-4 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, color: "#9BA6B8" }}>구매 의향</th>
                    <th className="px-4 py-3 text-right" style={{ fontSize: 11, fontWeight: 700, color: "#9BA6B8" }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p) => (
                    <PersonaListRow
                      key={p.id}
                      persona={p}
                      onEdit={(persona) => { setEditTarget(persona); setModalOpen(true); }}
                      onDelete={(id) => setDeleteConfirm(id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 py-4">
        <Pagination current={safePage} total={totalPages} onChange={(p) => { setPage(p); }} />
      </div>

      {/* Edit/Add Modal */}
      {modalOpen && (
        <EditModal initial={editTarget} onSave={handleSave} onClose={() => { setModalOpen(false); setEditTarget(undefined); }} />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E1E8F1] p-6 w-80">
            <div className="w-12 h-12 rounded-xl bg-[#FFF0F0] flex items-center justify-center mb-4">
              <Trash2 size={20} className="text-[#EF4444]" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1D1F3D", marginBottom: 6 }}>페르소나 삭제</h3>
            <p style={{ fontSize: 13, color: "#7C8397", lineHeight: 1.6, marginBottom: 20 }}>
              이 페르소나를 삭제하면 복구할 수 없습니다. 계속하시겠습니까?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-[#E1E8F1] rounded-lg text-[#3C4556] hover:bg-[#EEF2FA] transition-colors"
                style={{ fontSize: 13, fontWeight: 600 }}>취소</button>
              <button onClick={confirmDelete}
                className="flex-1 py-2.5 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-colors"
                style={{ fontSize: 13, fontWeight: 600 }}>삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
