"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowLeft,
  Bookmark,
  Camera,
  Clipboard,
  Eye,
  FileText,
  Image as ImageIcon,
  Info,
  Link2,
  Menu,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { adminApi, resolveMediaUrl } from "@/lib/admin-api";
import { adminEndpoints, type AdminAccountItem, type AdminListQuery, type JsonBody, type MemberBehaviorItem, type MemberBehaviorPage, type MemberDatingRecordItem, type MemberMatchQuota, type MemberProfileUpdatePayload, type RealnameReviewItem } from "@/lib/admin-endpoints";
import UserCandidatePicker from "@/components/UserCandidatePicker";

type Member = {
  id?: number;
  nickname?: string | null;
  avatar?: string | null;
  [key: string]: unknown;
};

type DetailData = Record<string, unknown>;
type DetailPage = { items?: DetailData[]; total?: number };
type Region = { code: string; name: string };
type RegionSelection = { value: string; provinceCode: string; cityCode: string; districtCode: string };
const regionCode = (value: string, length: number) => value.replace(/\D/g, "").slice(0, length);
type BasicDraft = {
  matchStatus: string;
  tags: string[];
  nickname: string;
  gender: string;
  birthday: string;
  constellation: string;
  zodiac: string;
  height: string;
  weight: string;
  isMarried: string;
  hometown: string;
  hometownProvinceCode: string;
  hometownCityCode: string;
  hometownDistrictCode: string;
  residence: string;
  residenceProvinceCode: string;
  residenceCityCode: string;
  residenceDistrictCode: string;
  household: string;
  householdProvinceCode: string;
  householdCityCode: string;
  householdDistrictCode: string;
  education: string;
  job: string;
  income: string;
  ethnicity: string;
  house: string;
  car: string;
  smoking: string;
  drinking: string;
  religion: string;
  marriagePlan: string;
  school: string;
  company: string;
};

const dataValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  if (Array.isArray(value)) return value.join("、") || "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const dataItems = (value: unknown): DetailData[] => {
  if (Array.isArray(value)) return value as DetailData[];
  if (value && typeof value === "object" && Array.isArray((value as DetailPage).items)) return (value as DetailPage).items!;
  return [];
};

const formatDateTime = (value: unknown) => {
  if (typeof value !== "string" || !value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("zh-CN", { hour12: false });
};

const maskContact = (value: unknown) => {
  const text = typeof value === "string" ? value : "";
  if (!text) return "-";
  if (text.length === 11) return `${text.slice(0, 3)}****${text.slice(-4)}`;
  if (text.length > 5) return `${text.slice(0, 2)}****${text.slice(-2)}`;
  return text;
};

const realnameLabel = (value: unknown) => ({ 0: "未认证", 1: "审核中", 2: "已实名", 3: "未通过", 4: "未通过" })[Number(value)] ?? "未认证";
const memberStatusLabel = (value: unknown) => ({ 1: "公开相亲", 2: "委托红娘", 3: "完全私密", 4: "停止相亲", 5: "已经脱单" })[Number(value)] ?? "-";
const memberStatusValue = (value: string) => STATUS_OPTIONS.indexOf(value) + 1;
const certificationLabel = (value: unknown) => ({ 0: "未提交", 1: "审核中", 2: "已通过", 3: "未通过" })[Number(value)] ?? "-";
const stringValue = (value: unknown) => value === null || value === undefined ? "" : String(value);
const dateValue = (value: unknown) => stringValue(value).slice(0, 10);
const statusValue = (value: unknown) => {
  const label = memberStatusLabel(value);
  return label === "-" ? STATUS_OPTIONS[0] : label;
};
const marriageValue = (value: unknown) => ({ 1: "未婚", 2: "离异", 3: "丧偶" })[Number(value)] ?? "";
const tagsValue = (value: unknown) => {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (value && typeof value === "object") return Object.values(value as Record<string, unknown>).flatMap((item) => Array.isArray(item) ? item.filter((tag): tag is string => typeof tag === "string") : []);
  return [];
};
const incomeLabel = (value: unknown) => {
  const raw = stringValue(value);
  if (!raw) return "";
  if (INCOME.includes(raw)) return raw;
  const income = Number(raw);
  if (!Number.isFinite(income)) return raw;
  if (income < 3000) return "3千元以下";
  if (income < 5000) return "3-5千元";
  if (income < 8000) return "5-8千元";
  if (income < 10000) return "8千-1万元";
  if (income < 20000) return "1-2万元";
  if (income < 50000) return "2万以上";
  return "5万以上";
};
const basicDraftFrom = (detail: DetailData, fallback: Member): BasicDraft => ({
  matchStatus: statusValue(detail.match_status ?? fallback.match_status),
  tags: tagsValue(detail.tags ?? fallback.tags),
  nickname: stringValue(detail.nickname ?? fallback.nickname),
  gender: Number(detail.gender ?? fallback.gender) === 2 ? "女" : "男",
  birthday: dateValue(detail.birthday ?? fallback.birthday),
  constellation: stringValue(detail.constellation ?? fallback.constellation),
  zodiac: stringValue(detail.zodiac ?? fallback.zodiac),
  height: stringValue(detail.height ?? fallback.height),
  weight: stringValue(detail.weight ?? fallback.weight),
  isMarried: marriageValue(detail.is_married ?? fallback.is_married),
  hometown: stringValue(detail.hometown ?? fallback.hometown),
  hometownProvinceCode: stringValue(detail.hometown_province_code ?? fallback.hometown_province_code),
  hometownCityCode: stringValue(detail.hometown_city_code ?? fallback.hometown_city_code),
  hometownDistrictCode: stringValue(detail.hometown_district_code ?? fallback.hometown_district_code),
  residence: stringValue(detail.residence ?? fallback.residence),
  residenceProvinceCode: stringValue(detail.residence_province_code ?? fallback.residence_province_code),
  residenceCityCode: stringValue(detail.residence_city_code ?? fallback.residence_city_code),
  residenceDistrictCode: stringValue(detail.residence_district_code ?? fallback.residence_district_code),
  household: stringValue(detail.household ?? fallback.household),
  householdProvinceCode: stringValue(detail.household_province_code ?? fallback.household_province_code),
  householdCityCode: stringValue(detail.household_city_code ?? fallback.household_city_code),
  householdDistrictCode: stringValue(detail.household_district_code ?? fallback.household_district_code),
  education: stringValue(detail.education ?? fallback.education),
  job: stringValue(detail.job ?? fallback.job),
  income: incomeLabel(detail.income ?? fallback.income),
  ethnicity: stringValue(detail.ethnicity ?? fallback.ethnicity),
  house: stringValue(detail.house ?? fallback.house),
  car: stringValue(detail.car ?? fallback.car),
  smoking: stringValue(detail.smoking ?? fallback.smoking),
  drinking: stringValue(detail.drinking ?? fallback.drinking),
  religion: stringValue(detail.religion ?? fallback.religion),
  marriagePlan: stringValue(detail.marriage_plan ?? fallback.marriage_plan),
  school: stringValue(detail.school ?? fallback.school),
  company: stringValue(detail.company ?? fallback.company),
});

function ApiState({ loading, error, empty = "暂无数据", children }: { loading: boolean; error: string; empty?: string; children: React.ReactNode }) {
  if (loading) return <div className="mdt-empty">加载中...</div>;
  if (error) return <div className="mdt-empty text-[#d4380d]">{error}</div>;
  return <>{children}</>;
}

const TABS = [
  { key: "basic", label: "基本资料" },
  { key: "auth", label: "认证信息" },
  { key: "media", label: "照片视频" },
  { key: "intro", label: "自我介绍" },
  { key: "requirement", label: "择偶要求" },
  { key: "follow", label: "服务跟进" },
  { key: "private", label: "私密信息" },
  { key: "match", label: "推荐匹配" },
  { key: "calls", label: "通话记录" },
  { key: "line", label: "牵线记录" },
  { key: "dating", label: "约会记录" },
  { key: "activities", label: "活动报名" },
  { key: "behavior", label: "线上行为" },
  { key: "super", label: "超级管理" },
  { key: "source", label: "信息溯源" },
];

const STATUS_OPTIONS = ["公开相亲", "委托红娘", "完全私密", "停止相亲", "已经脱单"];
const TAG_OPTIONS = [
  "高颜值",
  "高收入",
  "985毕业",
  "211毕业",
  "事业单位",
  "双一流",
  "海归",
  "身材好",
  "博士",
  "央国企",
  "银行金融",
  "公务员",
];
const ZODIAC = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
const EDUCATION = ["初中", "技校", "高中", "中专", "大专", "本科", "硕士", "博士"];
const INCOME = ["3千元以下", "3-5千元", "5-8千元", "8千-1万元", "1-2万元", "2万以上", "5万以上", "年入百万"];
const INCOME_VALUES: Record<string, number> = {
  "3千元以下": 2500,
  "3-5千元": 4000,
  "5-8千元": 6500,
  "8千-1万元": 9000,
  "1-2万元": 15000,
  "2万以上": 30000,
  "5万以上": 50000,
  "年入百万": 83333,
};
const OCCUPATION = [
  "私企员工",
  "央企/国企",
  "外企",
  "事业单位",
  "公务员",
  "教师",
  "医生",
  "护士",
  "互联网行业",
  "自由职业",
  "军人",
  "工人",
  "服务业",
  "金融",
  "律师",
  "求职中",
  "在校学生",
  "个体老板",
  "公司高管",
  "美容师/健身教练",
];
const MARRIAGE_TARGET = ["一年内结婚", "两年内结婚", "三年内结婚", "时机成熟时结婚"];
const ETHNICITY = ["汉族", "蒙古族", "回族", "藏族", "维吾尔族", "苗族", "其他"];
const HOUSE = ["不限", "愿意和父母同住", "要有独立婚房", "住房无所谓"];
const SMOKE = ["不限", "不接受吸烟", "可以偶尔吸烟", "吸烟无所谓"];
const DRINK = ["不限", "不接受喝酒", "可以偶尔小酌", "喝酒无所谓"];
const MARITAL_ACCEPT = ["不限", "不接受离异", "可接受离异未育", "可接受离异有孩子", "视情况而定"];

/* ── 智能匹配筛选项：与「基础资料」页的下拉选项保持一致（后端按中文精确匹配） ── */
const MATCH_CONSTELLATION = ["白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座", "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座"];
const MATCH_HOUSE = ["无房", "有房", "共有住房"];
const MATCH_SMOKING = ["不吸烟", "偶尔吸烟", "经常吸烟"];
const MATCH_DRINKING = ["不喝酒", "偶尔喝酒", "经常喝酒"];
const MATCH_MARRIAGE: Record<string, number> = { 未婚: 1, 离异: 2, 丧偶: 3 };
const MATCH_MBTI = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];
/** 底部单选：中文文案 → 后端 vip_filter 枚举（枚举严格，传错 422） */
const MATCH_VIP_FILTERS: { label: string; value: string }[] = [
  { label: "不限", value: "all" },
  { label: "仅显示线下VIP", value: "offline_vip" },
  { label: "仅显示线上VIP", value: "online_vip" },
  { label: "仅显示到店核验", value: "store_verified" },
  { label: "排除弃海会员", value: "exclude_abandoned" },
];

/** 择偶要求芯片：null / 空 → 「不限」 */
const preferChip = (label: string, value: unknown, suffix = "") => {
  if (value === null || value === undefined || value === "") return `${label}不限`;
  return `${label}${value}${suffix}`;
};

/* ------------------------------------------------------------------ */
/* 基础表单组件（静态：使用 defaultValue / defaultChecked）            */
/* ------------------------------------------------------------------ */

function Inp({
  value,
  placeholder,
  readOnly,
  type,
  unit,
  onChange,
}: {
  value?: string;
  placeholder?: string;
  readOnly?: boolean;
  type?: string;
  unit?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <span className="mdt-input-wrap">
      <input
        className="mdt-input"
        value={onChange ? value ?? "" : undefined}
        defaultValue={onChange ? undefined : value}
        placeholder={placeholder}
        readOnly={readOnly}
        type={type}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        style={unit ? { paddingRight: 36 } : undefined}
      />
      {unit ? <span className="mdt-unit">{unit}</span> : null}
    </span>
  );
}

function Sel({
  value,
  options,
  placeholder = "请选择",
  onChange,
}: {
  value?: string;
  options: string[];
  placeholder?: string;
  onChange?: (value: string) => void;
}) {
  const list = value && !options.includes(value) ? [value, ...options] : options;
  return (
    <span className="mdt-select-wrap">
      <select className="mdt-select" value={onChange ? value ?? "" : undefined} defaultValue={onChange ? undefined : value ?? ""} onChange={onChange ? (event) => onChange(event.target.value) : undefined}>
        {value ? null : <option value="">{placeholder}</option>}
        {list.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </span>
  );
}

function Radios({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <span className="mdt-radios">
      {options.map((item) => (
        <label key={item} className="mdt-radio">
          <input type="radio" name={name} checked={onChange ? item === value : undefined} defaultChecked={onChange ? undefined : item === value} onChange={onChange ? () => onChange(item) : undefined} />
          <span>{item}</span>
        </label>
      ))}
    </span>
  );
}

function Checks({
  options,
  checked = [],
  onChange,
}: {
  options: string[];
  checked?: string[];
  onChange?: (value: string[]) => void;
}) {
  return (
    <span className="mdt-radios">
      {options.map((item) => (
        <label key={item} className="mdt-check">
          <input type="checkbox" checked={onChange ? checked.includes(item) : undefined} defaultChecked={onChange ? undefined : checked.includes(item)} onChange={onChange ? (event) => onChange(event.target.checked ? [...checked, item] : checked.filter((tag) => tag !== item)) : undefined} />
          <span>{item}</span>
        </label>
      ))}
    </span>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mdt-field">
      <span className="mdt-label">
        {required ? <b>*</b> : null}
        {label}
      </span>
      <span className="mdt-control">{children}</span>
    </div>
  );
}

function Empty({ text = "暂无数据" }: { text?: string }) {
  return (
    <div className="mdt-empty">
      <FileText className="mdt-empty-ic size-10" strokeWidth={1.2} />
      {text}
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="mdt-notice">
      <Info className="mt-0.5 size-3.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 会员管理详情工作台                                                  */
/* ------------------------------------------------------------------ */

export default function MemberDetailWorkspace({
  member,
  initialTab = "basic",
  onClose,
}: {
  member: Member;
  initialTab?: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState(initialTab);
  const [showContact, setShowContact] = useState(false);
  const [matchTab, setMatchTab] = useState("smart");
  const [lineTab, setLineTab] = useState("out");
  const [behaviorTab, setBehaviorTab] = useState("viewed");
  const [topRecommend, setTopRecommend] = useState(false);
  const [newRecommend, setNewRecommend] = useState(false);
  const [guestCardOpen, setGuestCardOpen] = useState(false);
  const [posterOpen, setPosterOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [detail, setDetail] = useState<DetailData>({});
  const [sectionData, setSectionData] = useState<DetailData[] | DetailData>({});
  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionError, setSectionError] = useState("");
  /** 自增版本号：新增跟进等写操作完成后 +1，强制重新拉取当前 Tab 数据 */
  const [sectionVersion, setSectionVersion] = useState(0);
  const [realnameReview, setRealnameReview] = useState<RealnameReviewItem | null>(null);
  const [basicDraft, setBasicDraft] = useState<BasicDraft>(() => basicDraftFrom({}, member));
  const [savingBasic, setSavingBasic] = useState(false);
  const [basicSaveError, setBasicSaveError] = useState("");

  useEffect(() => {
    if (!member.id) return;
    void adminEndpoints.memberDetail(member.id)
      .then((result) => {
        setDetail(result);
        setBasicDraft(basicDraftFrom(result, member));
      })
      .catch(() => setDetail({}));
  }, [member.id]);

  useEffect(() => {
    if (!member.id) return;
    void adminEndpoints.memberRealnameReview(member.id)
      .then((result) => setRealnameReview(result.items.find((item) => item.user_id === member.id) ?? null))
      .catch(() => setRealnameReview(null));
  }, [member.id]);

  const saveBasic = async () => {
    if (!member.id) return;
    setSavingBasic(true);
    setBasicSaveError("");
    try {
      await adminEndpoints.updateMember(member.id, {
        nickname: basicDraft.nickname.trim(),
        gender: basicDraft.gender === "女" ? 2 : 1,
        birthday: basicDraft.birthday || null,
        constellation: basicDraft.constellation || null,
        zodiac: basicDraft.zodiac || null,
        height: basicDraft.height ? Number(basicDraft.height) : null,
        weight: basicDraft.weight ? Number(basicDraft.weight) : null,
        is_married: ({ "未婚": 1, "离异": 2, "丧偶": 3 } as Record<string, number>)[basicDraft.isMarried] ?? null,
        hometown: basicDraft.hometown || null,
        hometown_province_code: basicDraft.hometownProvinceCode || null,
        hometown_city_code: basicDraft.hometownCityCode || null,
        hometown_district_code: basicDraft.hometownDistrictCode || null,
        residence: basicDraft.residence || null,
        residence_province_code: basicDraft.residenceProvinceCode || null,
        residence_city_code: basicDraft.residenceCityCode || null,
        residence_district_code: basicDraft.residenceDistrictCode || null,
        household: basicDraft.household || null,
        household_province_code: basicDraft.householdProvinceCode || null,
        household_city_code: basicDraft.householdCityCode || null,
        household_district_code: basicDraft.householdDistrictCode || null,
        education: basicDraft.education || null,
        job: basicDraft.job || null,
        income: basicDraft.income ? INCOME_VALUES[basicDraft.income] ?? Number(basicDraft.income) : null,
        ethnicity: basicDraft.ethnicity || null,
        house: basicDraft.house || null,
        car: basicDraft.car || null,
        smoking: basicDraft.smoking || null,
        drinking: basicDraft.drinking || null,
        religion: basicDraft.religion || null,
        marriage_plan: basicDraft.marriagePlan || null,
        school: basicDraft.school.trim() || null,
        company: basicDraft.company.trim() || null,
        match_status: memberStatusValue(basicDraft.matchStatus),
        tags: basicDraft.tags,
      });
      const refreshed = await adminEndpoints.memberDetail(member.id);
      setDetail(refreshed);
      setBasicDraft(basicDraftFrom(refreshed, member));
    } catch (error) {
      setBasicSaveError(error instanceof Error ? error.message : "保存失败，请稍后重试");
    } finally {
      setSavingBasic(false);
    }
  };

  useEffect(() => {
    if (!member.id) return;
    const requests: Record<string, () => Promise<unknown>> = {
      auth: () => adminEndpoints.memberCertifications(member.id!),
      media: () => adminEndpoints.memberMedia(member.id!),
      follow: () => adminEndpoints.memberFollowUps(member.id!, { page: 1, page_size: 50 }),
      calls: () => adminEndpoints.memberCallRecords(member.id!, { page: 1, page_size: 50 }),
      line: () => adminEndpoints.memberMatchRecords(member.id!, { page: 1, page_size: 50 }),
      activities: () => adminEndpoints.memberActivitySignups(member.id!, { page: 1, page_size: 50 }),
      // behavior 由 BehaviorTab 自持拉取（8 个方向化接口），此处不再预取
      private: () => adminEndpoints.memberPrivateInfo(member.id!),
      source: () => adminEndpoints.memberSourceRecords(member.id!, { page: 1, page_size: 50 }),
      match: () => adminEndpoints.memberRecommendations(member.id!, { page: 1, page_size: 50 }),
    };
    let request: (() => Promise<unknown>) | undefined = requests[tab];
    // 推荐匹配：只有「推荐名单」有数据源；智能匹配（筛选候选人）与姻缘名单后端暂无可用接口
    if (tab === "match" && matchTab !== "recommend") request = undefined;
    if (!request) return;
    let cancelled = false;
    setSectionLoading(true);
    setSectionError("");
    void request()
      .then((result) => {
        if (!cancelled) setSectionData(result && typeof result === "object" ? result as DetailData : {});
      })
      .catch((error: unknown) => {
        if (!cancelled) setSectionError(error instanceof Error ? error.message : "接口请求失败");
      })
      .finally(() => {
        if (!cancelled) setSectionLoading(false);
      });
    return () => { cancelled = true; };
  }, [member.id, tab, matchTab, sectionVersion]);

  const nickname = (detail.nickname as string | null | undefined) || member.nickname || "未命名";
  const profile = { ...member, ...detail };
  const phone = profile.phone;
  const wechat = profile.wechat;
  const realnameStatus = profile.realname_status ?? profile.auth_status;
  const showFooter = ["basic", "intro", "requirement", "follow", "private", "super"].includes(tab);

  return (
    <div className="mdt-mask">
      <div className="mdt-panel">
        {/* 顶部 */}
        <header className="mdt-head">
          <div className="mdt-head-left">
            <button type="button" className="mdt-head-x" onClick={onClose} aria-label="关闭">
              <X className="size-5" />
            </button>
            <h2 className="mdt-head-title">会员管理</h2>
          </div>
          <div className="mdt-head-actions">
            <button type="button" className="mdt-btn mdt-btn-ai">
              <Sparkles className="size-3.5" />
              AI智能红娘
            </button>
            <button type="button" className="mdt-btn mdt-btn-outline">
              <Clipboard className="size-3.5" />
              复制资料
            </button>
            <button type="button" className="mdt-btn mdt-btn-outline" onClick={() => setPosterOpen(true)}>
              <ImageIcon className="size-3.5" />
              资料海报
            </button>
            <button type="button" className="mdt-btn mdt-btn-outline" onClick={() => setGuestCardOpen(true)}>
              制作嘉宾卡
            </button>
          </div>
        </header>

        {/* 会员资料区 */}
        <section className="mdt-profile">
          <div className="mdt-profile-inner">
            <div className="mdt-avatar">
              {typeof profile.avatar === "string" && profile.avatar ? (
                <img src={resolveMediaUrl(profile.avatar)} alt="" />
              ) : (
                <span className="mdt-avatar-ph">
                  <UserRound className="size-14" strokeWidth={1.2} />
                </span>
              )}
              <button type="button" className="mdt-avatar-btn">
                修改头像
              </button>
            </div>
            <div className="mdt-profile-main">
              <div className="mdt-name-row">
                <span>{nickname}</span>
                <span className="sep">/</span>
                <span>{dataValue(profile.member_code ?? profile.code)}</span>
                <span className="sep">/</span>
                <span>
                  {dataValue(realnameReview?.real_name ?? profile.real_name)} <span className="mdt-badge">{realnameReview?.result_label ?? realnameLabel(realnameStatus)}</span>
                </span>
                <span className="sep">/</span>
                <span>♡ {memberStatusLabel(profile.match_status)}</span>
              </div>

              <div className="mdt-contact-row">
                <div className="mdt-contact">
                  <Phone className="size-5 text-[#f47b36]" />
                  <strong>{showContact ? dataValue(phone) : maskContact(phone)}</strong>
                  <button type="button" className="mdt-link" onClick={() => setShowContact((v) => !v)}>
                    <Eye className="mr-1 inline size-3.5" />
                    {showContact ? "隐藏手机" : "查看手机"}
                  </button>
                  <button type="button" className="mdt-chip-btn">发短信</button>
                  <button type="button" className="mdt-chip-btn">一键呼叫</button>
                  <button type="button" className="mdt-link ml-auto">修改</button>
                </div>
                <div className="mdt-contact">
                  <MessageCircle className="size-5 text-[#22bf61]" />
                  <strong>{showContact ? dataValue(wechat) : maskContact(wechat)}</strong>
                  <button type="button" className="mdt-link" onClick={() => setShowContact((v) => !v)}>
                    <Eye className="mr-1 inline size-3.5" />
                    {showContact ? "隐藏微信" : "查看微信"}
                  </button>
                  <span className="ml-auto flex items-center gap-1">
                    <span className="mdt-select-wrap" style={{ width: 96, flex: "none" }}>
                      <select className="mdt-select" style={{ height: 28 }} defaultValue="yes">
                        <option value="yes">加上了？</option>
                        <option value="no">未通过</option>
                      </select>
                    </span>
                    <button type="button" className="mdt-link">修改</button>
                  </span>
                </div>
              </div>

              <div className="mdt-meta">
                <span>ID：{dataValue(profile.id)}</span>
                <span>加入：{formatDateTime(profile.created_at)}</span>
                <span>登记：{dataValue(profile.source_label ?? profile.source)}</span>
                <span>IP属地：{dataValue(profile.ip_location)}</span>
                <span>最近登录：{formatDateTime(profile.last_login_at)}</span>
                <span>跟进：{dataValue(profile.matchmaker_name ?? profile.matchmaker_id)}</span>
                <span>推广：{dataValue(profile.promoter_name ?? profile.promoter_id)}</span>
                <span>上次跟进：{formatDateTime(profile.last_follow_at)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tab */}
        <nav className="mdt-tabs">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={"mdt-tab" + (tab === item.key ? " active" : "")}
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* 内容 */}
        <main className="mdt-body">
          {tab === "basic" && <BasicTab member={profile} draft={basicDraft} onDraftChange={setBasicDraft} onSave={() => void saveBasic()} saving={savingBasic} error={basicSaveError} />}
          {tab === "auth" && <AuthTab member={profile} realnameReview={realnameReview} data={sectionData} loading={sectionLoading} error={sectionError} />}
          {tab === "media" && <MediaTab data={sectionData} loading={sectionLoading} error={sectionError} />}
          {tab === "intro" && <IntroTab userId={member.id} />}
          {tab === "requirement" && <RequirementTab userId={member.id} />}
          {tab === "follow" && (
            <FollowTab
              memberId={member.id}
              data={sectionData}
              loading={sectionLoading}
              error={sectionError}
              onCreated={() => setSectionVersion((version) => version + 1)}
            />
          )}
          {tab === "private" && (
            <PrivateTab
              memberId={member.id ?? 0}
              data={sectionData}
              loading={sectionLoading}
              error={sectionError}
              onSaved={() => setSectionVersion((version) => version + 1)}
            />
          )}
          {tab === "match" && (
            <MatchTab
              memberId={member.id ?? 0}
              sub={matchTab}
              onSub={setMatchTab}
              onOpenLibrary={() => setLibraryOpen(true)}
              onReload={() => setSectionVersion((version) => version + 1)}
              data={sectionData}
              loading={sectionLoading}
              error={sectionError}
              memberName={nickname}
            />
          )}
          {tab === "calls" && <CallsTab data={sectionData} loading={sectionLoading} error={sectionError} />}
          {tab === "line" && <LineTab memberId={member.id ?? 0} sub={lineTab} onSub={setLineTab} />}
          {tab === "dating" && <DatingTab memberId={member.id ?? 0} />}
          {tab === "activities" && <ActivitiesTab data={sectionData} loading={sectionLoading} error={sectionError} />}
          {tab === "behavior" && <BehaviorTab memberId={member.id ?? 0} sub={behaviorTab} onSub={setBehaviorTab} />}
          {tab === "super" && (
            <SuperTab
              memberId={member.id ?? 0}
              profile={profile}
              realnameReview={realnameReview}
              topRecommend={topRecommend}
              newRecommend={newRecommend}
              onTopRecommend={setTopRecommend}
              onNewRecommend={setNewRecommend}
            />
          )}
          {tab === "source" && <SourceTab data={sectionData} loading={sectionLoading} error={sectionError} />}
        </main>

        {showFooter ? (
          <footer className="mdt-footer">
            <button type="button" className="mdt-submit">
              确定提交
            </button>
          </footer>
        ) : null}
      </div>

      {guestCardOpen ? <GuestCardSheet onClose={() => setGuestCardOpen(false)} nickname={nickname} /> : null}
      {posterOpen ? <PosterSheet onClose={() => setPosterOpen(false)} /> : null}
      {libraryOpen ? <LibraryDrawer onClose={() => setLibraryOpen(false)} nickname={nickname} /> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 基本资料                                                            */
/* ------------------------------------------------------------------ */

function BasicTab({
  member,
  draft,
  onDraftChange,
  onSave,
  saving,
  error,
}: {
  member: DetailData;
  draft: BasicDraft;
  onDraftChange: (value: BasicDraft) => void;
  onSave: () => void;
  saving: boolean;
  error: string;
}) {
  const update = <K extends keyof BasicDraft>(key: K, value: BasicDraft[K]) => onDraftChange({ ...draft, [key]: value });
  const updateRegion = (prefix: "hometown" | "residence" | "household", selection: RegionSelection) => onDraftChange({
    ...draft,
    [prefix]: selection.value,
    [`${prefix}ProvinceCode`]: selection.provinceCode,
    [`${prefix}CityCode`]: selection.cityCode,
    [`${prefix}DistrictCode`]: selection.districtCode,
  });
  return (
    <>
      <div className="mdt-field" style={{ marginBottom: 16 }}>
        <span className="mdt-label">状态</span>
        <span className="mdt-control">
          <Radios name="mdt-status" options={STATUS_OPTIONS} value={draft.matchStatus} onChange={(value) => update("matchStatus", value)} />
        </span>
      </div>

      <Notice>在平台中公开显示头像，相亲会员可查看您的详细资料(不含任何联系方式)</Notice>

      <div className="mdt-field" style={{ margin: "18px 0" }}>
        <span className="mdt-label">标签</span>
        <span className="mdt-control" style={{ flexWrap: "wrap" }}>
          <Checks options={TAG_OPTIONS} checked={draft.tags} onChange={(value) => update("tags", value)} />
          
        </span>
      </div>

      <div className="mdt-grid3">
        <Field label="编号" required>
          <Inp value={dataValue(member.member_code ?? member.code)} readOnly />
        </Field>
        <Field label="姓名" required>
          <Inp value={dataValue(member.real_name)} readOnly />
        </Field>
        <Field label="性别" required>
          <Radios name="mdt-gender" options={["男", "女"]} value={draft.gender} onChange={(value) => update("gender", value)} />
        </Field>

        <Field label="生日" required>
          <Inp value={draft.birthday} type="date" onChange={(value) => update("birthday", value)} />
        </Field>
        <Field label="星座">
          <Sel value={draft.constellation} options={["白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座", "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座"]} onChange={(value) => update("constellation", value)} />
        </Field>
        <Field label="属相">
          <Sel value={draft.zodiac} options={ZODIAC} onChange={(value) => update("zodiac", value)} />
        </Field>

        <Field label="身高">
          <Inp value={draft.height} unit="cm" onChange={(value) => update("height", value)} />
        </Field>
        <Field label="体重">
          <Inp value={draft.weight} unit="kg" onChange={(value) => update("weight", value)} />
        </Field>
        <Field label="婚况">
          <Sel value={draft.isMarried} options={["未婚", "离异", "丧偶"]} onChange={(value) => update("isMarried", value)} />
        </Field>

        <Field label="家乡">
          <RegionSelect value={draft.hometown} provinceCode={draft.hometownProvinceCode} cityCode={draft.hometownCityCode} districtCode={draft.hometownDistrictCode} onChange={(value) => updateRegion("hometown", value)} />
        </Field>
        <Field label="现居">
          <RegionSelect value={draft.residence} provinceCode={draft.residenceProvinceCode} cityCode={draft.residenceCityCode} districtCode={draft.residenceDistrictCode} onChange={(value) => updateRegion("residence", value)} />
        </Field>
        <Field label="户口">
          <RegionSelect value={draft.household} provinceCode={draft.householdProvinceCode} cityCode={draft.householdCityCode} districtCode={draft.householdDistrictCode} onChange={(value) => updateRegion("household", value)} />
        </Field>

        <Field label="学历">
          <Sel value={draft.education} options={EDUCATION} onChange={(value) => update("education", value)} />
        </Field>
        <Field label="职业">
          <Sel value={draft.job} options={["不限", ...OCCUPATION]} onChange={(value) => update("job", value)} />
        </Field>
        <Field label="收入">
          <Sel value={draft.income} options={INCOME} onChange={(value) => update("income", value)} />
        </Field>

        <Field label="民族">
          <Sel value={draft.ethnicity} options={ETHNICITY} onChange={(value) => update("ethnicity", value)} />
        </Field>
        <Field label="购房">
          <Sel value={draft.house} placeholder="请选择购房" options={["无房", "有房", "共有住房"]} onChange={(value) => update("house", value)} />
        </Field>
        <Field label="购车">
          <Sel value={draft.car} placeholder="请选择购车" options={["无车", "有车", "计划购车"]} onChange={(value) => update("car", value)} />
        </Field>

        <Field label="吸烟">
          <Sel value={draft.smoking} placeholder="请选择吸烟" options={["不吸烟", "偶尔吸烟", "经常吸烟"]} onChange={(value) => update("smoking", value)} />
        </Field>
        <Field label="喝酒">
          <Sel value={draft.drinking} placeholder="请选择喝酒" options={["不喝酒", "偶尔喝酒", "经常喝酒"]} onChange={(value) => update("drinking", value)} />
        </Field>
        <Field label="宗教">
          <Sel value={draft.religion} options={["无宗教信仰", "佛教", "道教", "基督教", "伊斯兰教"]} onChange={(value) => update("religion", value)} />
        </Field>

        <Field label="结婚">
          <Sel value={draft.marriagePlan} options={MARRIAGE_TARGET} onChange={(value) => update("marriagePlan", value)} />
        </Field>
        <Field label="学校">
          <Inp value={draft.school} placeholder="填写毕业学校" onChange={(value) => update("school", value)} />
        </Field>
        <Field label="单位">
          <Inp value={draft.company} placeholder="填写工作单位" onChange={(value) => update("company", value)} />
        </Field>

        <Field label="登记">
          <Sel value="自己注册" options={["自己注册", "后台添加", "父母登记", "推广红娘录入"]} />
        </Field>
      </div>

      <div className="mt-5 flex justify-end">
        <button type="button" className="mdt-submit" disabled={saving} onClick={onSave}>{saving ? "提交中..." : "确定提交"}</button>
      </div>
      {error ? <p className="mt-3 text-right text-sm text-[#d4380d]">{error}</p> : null}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 认证信息                                                            */
/* ------------------------------------------------------------------ */

function AuthTab({ member, realnameReview, data, loading, error }: { member: DetailData; realnameReview: RealnameReviewItem | null; data: DetailData | DetailData[]; loading: boolean; error: string }) {
  const certifications = Array.isArray(data) ? {} : data;
  const certificationRows = [
    ["婚况核实", certifications.marriage],
    ["学历认证", certifications.education],
    ["房产认证", certifications.house],
  ] as const;
  return (
    <>
      <Notice>
        若会员已在线下提交过相关真实证件凭证、或签署过相关协议，可上传到“证件留档”中并人工设置为“已认证”或“已签署”
      </Notice>

      <div className="mdt-auth-item">
        <div className="mdt-auth-title">实名认证</div>
        <div className="mdt-auth-line">
          <span>姓名：{dataValue(realnameReview?.real_name ?? member.real_name)}</span>
          <span>身份证：{dataValue(realnameReview?.id_card_masked)}</span>
          <span>认证状态：<span className="mdt-badge">{realnameReview?.result_label ?? realnameLabel(member.realname_status ?? member.auth_status)}</span></span>
          <span className="mdt-auth-time">{formatDateTime(realnameReview?.created_at ?? member.realname_reviewed_at ?? member.auth_reviewed_at)}</span>
        </div>
      </div>

      <ApiState loading={loading} error={error}>
        {certificationRows.map(([title, item]) => {
          const detail = item && typeof item === "object" ? item as DetailData : null;
          return <div key={title} className="mdt-auth-item"><div className="mdt-auth-title">{title}</div>{detail ? <div className="mdt-auth-line"><span className="mdt-badge">{certificationLabel(detail.status)}</span><span>提交：{formatDateTime(detail.submitted_at)}</span><span>审核：{formatDateTime(detail.reviewed_at)}</span>{detail.fail_reason ? <span>原因：{dataValue(detail.fail_reason)}</span> : null}</div> : <div className="mdt-auth-none">暂无信息</div>}</div>;
        })}
      </ApiState>

      <div className="mdt-auth-item"><div className="mdt-auth-title">会员承诺</div><div className="mdt-auth-none">暂无信息</div></div>

      <div className="mdt-auth-item">
        <div className="mdt-auth-title">证件留档</div>
        <Notice>仅后台和红娘可见，不会对外公开展示</Notice>
        <button type="button" className="mdt-upload" style={{ marginTop: 14 }}>
          <Plus className="size-5" />
          上传图片
        </button>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 照片视频                                                            */
/* ------------------------------------------------------------------ */

function MediaTab({ data, loading, error }: { data: DetailData | DetailData[]; loading: boolean; error: string }) {
  const media = dataItems(data);
  const isVideoItem = (item: DetailData) => {
    const metaType = String(item.meta_type ?? "").toLowerCase();
    if (metaType) return metaType === "video";
    return String(item.media_type ?? item.type ?? "").toLowerCase().includes("video");
  };
  const mediaCover = (item: DetailData) => {
    const raw = String(item.thumbnail_url ?? item.main_url ?? item.file_url ?? "");
    return raw ? resolveMediaUrl(raw) : undefined;
  };
  const photos = media.filter((item) => !isVideoItem(item) && mediaCover(item));
  const videos = media.filter((item) => isVideoItem(item));
  const coverStyle: CSSProperties = { width: 96, height: 96, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e7eb", display: "block" };
  return (
    <>
      <div className="mdt-row-end">
        <button type="button" className="mdt-btn mdt-btn-plain">
          <Camera className="size-3.5" />
          手机上传
        </button>
        <button type="button" className="mdt-btn mdt-btn-plain">
          <RefreshCw className="size-3.5" />
          刷新列表
        </button>
      </div>

      <Notice>设置为“私密”后，仅后台和红娘可见，线上平台的相册中不展示、会员自己在会员中心的相册中也看不到</Notice>

      <div className="mdt-section-title">照片</div>
      <button type="button" className="mdt-upload">
        <Plus className="size-5" />
        上传图片
      </button>
      {photos.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
          {photos.map((item, index) => (
            <figure key={String(item.id ?? index)} style={{ margin: 0, position: "relative" }}>
              <img src={mediaCover(item) ?? ""} alt={String(item.media_type ?? "photo")} style={coverStyle} loading="lazy" />
              <figcaption style={{ fontSize: 12, color: "#6b7280", marginTop: 4, textAlign: "center" }}>
                {dataValue(item.media_type ?? item.type)}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}

      <div className="mdt-section-title">视频</div>
      <button type="button" className="mdt-upload">
        <Plus className="size-5" />
        上传视频
      </button>
      {videos.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
          {videos.map((item, index) => (
            <figure key={String(item.id ?? index)} style={{ margin: 0, position: "relative" }}>
              <img src={mediaCover(item) ?? ""} alt={String(item.media_type ?? "video")} style={coverStyle} loading="lazy" />
              <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.6)", pointerEvents: "none" }}>▶</span>
              <figcaption style={{ fontSize: 12, color: "#6b7280", marginTop: 4, textAlign: "center" }}>
                {dataValue(item.duration_seconds)}秒
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}

      <ApiState loading={loading} error={error}>
        {media.length > 0 ? <table className="mdt-table" style={{ marginTop: 14 }}><tbody>{media.map((item, index) => <tr key={String(item.id ?? index)}><td>{dataValue(item.media_type ?? item.type)}</td><td>{dataValue(item.status ?? item.review_status)}</td><td>{dataValue(item.created_at)}</td></tr>)}</tbody></table> : <Empty />}
      </ApiState>
    </>
  );
}

function RegionSelect({
  value,
  provinceCode: initialProvinceCode = "",
  cityCode: initialCityCode = "",
  districtCode: initialDistrictCode = "",
  onChange,
}: {
  value: string;
  provinceCode?: string;
  cityCode?: string;
  districtCode?: string;
  onChange: (value: RegionSelection) => void;
}) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [provinceCode, setProvinceCode] = useState(initialProvinceCode);
  const [cityCode, setCityCode] = useState(initialCityCode);
  const [districtCode, setDistrictCode] = useState(initialDistrictCode);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void adminApi<{ items: Region[] }>("regions/provinces")
      .then((result) => setProvinces(result.items))
      .catch(() => setProvinces([]));
  }, []);

  useEffect(() => {
    setProvinceCode(initialProvinceCode);
    setCityCode(initialCityCode);
    setDistrictCode(initialDistrictCode);
  }, [initialCityCode, initialDistrictCode, initialProvinceCode]);

  useEffect(() => {
    if (!provinceCode) {
      setCities([]);
      return;
    }
    void adminApi<{ items: Region[] }>("regions/cities", { query: { province_code: regionCode(provinceCode, 2) } })
      .then((result) => setCities(result.items))
      .catch(() => setCities([]));
  }, [provinceCode]);

  useEffect(() => {
    if (!cityCode) {
      setDistricts([]);
      return;
    }
    void adminApi<{ items: Region[] }>("regions/districts", { query: { city_code: regionCode(cityCode, 4) } })
      .then((result) => setDistricts(result.items))
      .catch(() => setDistricts([]));
  }, [cityCode]);

  useEffect(() => {
    if (!value || provinces.length === 0 || provinceCode) return;
    const names = value.split(/\s*[/,，]\s*/).filter(Boolean);
    const province = provinces.find((item) => item.name === names[0]);
    if (province) setProvinceCode(province.code);
  }, [provinceCode, provinces, value]);

  useEffect(() => {
    if (!value || cities.length === 0 || cityCode) return;
    const names = value.split(/\s*[/,，]\s*/).filter(Boolean);
    const city = cities.find((item) => item.name === names[1]);
    if (city) setCityCode(city.code);
  }, [cities, cityCode, value]);

  useEffect(() => {
    if (!value || districts.length === 0 || districtCode) return;
    const names = value.split(/\s*[/,，]\s*/).filter(Boolean);
    const district = districts.find((item) => item.name === names[2]);
    if (district) setDistrictCode(district.code);
  }, [districtCode, districts, value]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const emit = (nextProvince: string, nextCity: string, nextDistrict: string) => {
    const names = [
      provinces.find((item) => item.code === nextProvince)?.name,
      cities.find((item) => item.code === nextCity)?.name,
      districts.find((item) => item.code === nextDistrict)?.name,
    ].filter(Boolean);
    onChange({
      value: names.join(" / "),
      provinceCode: nextProvince,
      cityCode: nextCity,
      districtCode: nextDistrict,
    });
  };

  const selectProvince = (next: string) => {
    setProvinceCode(next);
    setCityCode("");
    setDistrictCode("");
    emit(next, "", "");
  };

  const selectCity = (next: string) => {
    setCityCode(next);
    setDistrictCode("");
    emit(provinceCode, next, "");
  };

  const selectDistrict = (next: string) => {
    setDistrictCode(next);
    emit(provinceCode, cityCode, next);
    setOpen(false);
  };

  return (
    <span className="mdt-region-picker" ref={rootRef}>
      <button type="button" className={`mdt-region-trigger${open ? " open" : ""}`} aria-expanded={open} onClick={() => setOpen((current) => !current)}>
        {value || "请选择省 / 市 / 区"}
      </button>
      {open && <span className="mdt-region-panel">
        <span className="mdt-region-column">
          {provinces.map((item) => <button type="button" key={item.code} className={item.code === provinceCode ? "active" : ""} onClick={() => selectProvince(item.code)}>{item.name}<i /></button>)}
        </span>
        <span className="mdt-region-column">
          {provinceCode ? cities.map((item) => <button type="button" key={item.code} className={item.code === cityCode ? "active" : ""} onClick={() => selectCity(item.code)}>{item.name}<i /></button>) : <span className="mdt-region-placeholder">请选择省</span>}
        </span>
        <span className="mdt-region-column">
          {cityCode ? districts.map((item) => <button type="button" key={item.code} className={item.code === districtCode ? "active" : ""} onClick={() => selectDistrict(item.code)}>{item.name}</button>) : <span className="mdt-region-placeholder">请选择市</span>}
        </span>
      </span>}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 自我介绍                                                            */
/* ------------------------------------------------------------------ */

/** 性格标签预设（personality_tags：0–10 个、单个 ≤20 字、自动去重） */
const PERSONALITY_PRESETS = ["外向", "内向", "中性", "活泼开朗", "成熟稳重", "顾家", "细心", "幽默", "孝顺", "浪漫"];
const PERSONALITY_TAGS_MAX = 10;
const PERSONALITY_TAG_MAX_LEN = 20;

type IntroDraft = {
  tags: string[];
  hobbies: string;
  mbti: string;
  selfIntro: string;
  note: string;
};

const emptyIntroDraft: IntroDraft = { tags: [], hobbies: "", mbti: "", selfIntro: "", note: "" };

function IntroTab({ userId }: { userId?: number }) {
  const [draft, setDraft] = useState<IntroDraft>(emptyIntroDraft);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [savingKey, setSavingKey] = useState<"" | "intro" | "note">("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [customTag, setCustomTag] = useState("");

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    setSaveMessage("");
    setSaveError("");
    void adminEndpoints.memberProfileExt(userId)
      .then((data) => {
        if (cancelled) return;
        setDraft({
          tags: tagsValue(data.personality_tags),
          hobbies: stringValue(data.hobbies),
          mbti: stringValue(data.mbti),
          selfIntro: stringValue(data.self_intro),
          note: stringValue(data.matchmaker_note),
        });
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : "自我介绍信息加载失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [userId]);

  const toggleTag = (tag: string) => {
    setSaveMessage("");
    setSaveError("");
    setDraft((current) => {
      if (current.tags.includes(tag)) return { ...current, tags: current.tags.filter((item) => item !== tag) };
      if (current.tags.length >= PERSONALITY_TAGS_MAX) return current;
      return { ...current, tags: [...current.tags, tag] };
    });
  };

  const addCustomTag = () => {
    const tag = customTag.trim().slice(0, PERSONALITY_TAG_MAX_LEN);
    if (!tag || draft.tags.includes(tag) || draft.tags.length >= PERSONALITY_TAGS_MAX) return;
    setDraft((current) => ({ ...current, tags: [...current.tags, tag] }));
    setCustomTag("");
  };

  const save = async (key: "intro" | "note") => {
    if (!userId) return;
    setSavingKey(key);
    setSaveMessage("");
    setSaveError("");
    const body: Record<string, unknown> = key === "note"
      ? { matchmaker_note: draft.note }
      : {
          personality_tags: draft.tags,
          hobbies: draft.hobbies,
          mbti: draft.mbti,
          self_intro: draft.selfIntro,
        };
    try {
      await adminEndpoints.updateMemberProfileExt(userId, body);
      const refreshed = await adminEndpoints.memberProfileExt(userId);
      setDraft({
        tags: tagsValue(refreshed.personality_tags),
        hobbies: stringValue(refreshed.hobbies),
        mbti: stringValue(refreshed.mbti),
        selfIntro: stringValue(refreshed.self_intro),
        note: stringValue(refreshed.matchmaker_note),
      });
      setSaveMessage("已保存");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "保存失败，请稍后重试");
    } finally {
      setSavingKey("");
    }
  };

  if (!userId) {
    return (
      <div className="mdt-stack">
        <Empty text="缺少会员 ID，无法加载自我介绍" />
      </div>
    );
  }

  return (
    <div className="mdt-stack">
      {loading && <Notice>正在加载自我介绍信息…</Notice>}
      {loadError && <Notice>加载失败：{loadError}</Notice>}

      <Field label="性格" required>
        <div className="flex flex-wrap items-center gap-1.5">
          {PERSONALITY_PRESETS.map((tag) => (
            <button
              type="button"
              key={tag}
              className={`mdt-tag${draft.tags.includes(tag) ? " active" : ""}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
          {draft.tags.filter((tag) => !PERSONALITY_PRESETS.includes(tag)).map((tag) => (
            <button type="button" key={tag} className="mdt-tag active" onClick={() => toggleTag(tag)}>
              {tag} <X className="inline size-3" />
            </button>
          ))}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <input
            className="mdt-input"
            style={{ maxWidth: 180 }}
            value={customTag}
            maxLength={PERSONALITY_TAG_MAX_LEN}
            placeholder={`自定义标签（≤${PERSONALITY_TAG_MAX_LEN}字）`}
            onChange={(event) => setCustomTag(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCustomTag(); } }}
          />
          <button type="button" className="mdt-link" onClick={addCustomTag}>
            <Plus className="mr-1 inline size-3.5" />
            添加标签
          </button>
          <span className="mdt-none">{draft.tags.length}/{PERSONALITY_TAGS_MAX}</span>
        </div>
      </Field>

      <Field label="爱好">
        <textarea
          className="mdt-textarea"
          style={{ minHeight: 60 }}
          maxLength={500}
          value={draft.hobbies}
          placeholder="请输入爱好，500字以内"
          onChange={(event) => { setSaveMessage(""); setDraft((current) => ({ ...current, hobbies: event.target.value })); }}
        />
      </Field>

      <Field label="人格类型（MBTI）">
        <Sel
          value={draft.mbti}
          options={["INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP", "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP"]}
          placeholder="未选择"
          onChange={(value) => { setSaveMessage(""); setDraft((current) => ({ ...current, mbti: value })); }}
        />
      </Field>

      <div className="mdt-block">
        <div className="mdt-block-label">自我介绍</div>
        <textarea
          className="mdt-textarea"
          style={{ minHeight: 150 }}
          maxLength={500}
          value={draft.selfIntro}
          placeholder="请输入，500字以内"
          onChange={(event) => { setSaveMessage(""); setDraft((current) => ({ ...current, selfIntro: event.target.value })); }}
        />
        <button type="button" className="mdt-link" style={{ marginTop: 8 }}>
          <Bookmark className="mr-1 inline size-3.5" />
          从模板选择
        </button>
      </div>

      <Field label="语音介绍">
        <span className="mdt-none">未上传</span>
      </Field>

      {saveError && savingKey !== "note" && <Notice>保存失败：{saveError}</Notice>}
      {saveMessage && savingKey !== "note" && <Notice>{saveMessage}</Notice>}

      <button type="button" className="mdt-submit" disabled={savingKey !== "" || loading} onClick={() => void save("intro")}>
        {savingKey === "intro" ? "保存中…" : "确定提交"}
      </button>

      <div className="mdt-hr" />

      <div className="mdt-block">
        <div className="mdt-block-label">
          <b>*</b>红娘说
        </div>
        <textarea
          className="mdt-textarea"
          style={{ minHeight: 120 }}
          maxLength={1000}
          value={draft.note}
          placeholder="请输入一段红娘对该会员的评价，本信息公开展示，1000字以内"
          onChange={(event) => { setSaveMessage(""); setDraft((current) => ({ ...current, note: event.target.value })); }}
        />
      </div>

      <button type="button" className="mdt-upload">
        <Plus className="size-5" />
        上传图片
      </button>
      <Notice>仅限上传3张图片</Notice>

      {saveError && savingKey === "note" && <Notice>保存失败：{saveError}</Notice>}
      {saveMessage && savingKey === "note" && <Notice>{saveMessage}</Notice>}

      <button type="button" className="mdt-submit" disabled={savingKey !== "" || loading} onClick={() => void save("note")}>
        {savingKey === "note" ? "保存中…" : "确定提交"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 择偶要求                                                            */
/* ------------------------------------------------------------------ */

const AGE_MIN_LIMIT = 18;
const AGE_MAX_LIMIT = 100;
const HEIGHT_MIN_LIMIT = 100;
const HEIGHT_MAX_LIMIT = 250;

const PREFERENCE_DEFAULTS = {
  ageMin: AGE_MIN_LIMIT,
  ageMax: AGE_MAX_LIMIT,
  heightMin: HEIGHT_MIN_LIMIT,
  heightMax: HEIGHT_MAX_LIMIT,
  income: "不限",
  education: "不限",
  occupation: "不限",
  marriage: "不限",
  housing: "不限",
  smoking: "不限",
  drinking: "不限",
  timeline: "不限",
  extra: "",
};

type PreferenceDraft = typeof PREFERENCE_DEFAULTS;

/** 择偶要求单选白名单：与后端 member_media_admin.py 的 Literal 逐字一致（含“不限”，提交即校验） */
const PREF_INCOME = ["不限", "3千元以下", "3千-5千元", "5-8千元", "8千-1万元", "1-2万元", "2万以上", "5万以上", "年入百万"];
const PREF_EDUCATION = ["不限", "初中", "技校", "高中", "中专", "大专", "本科", "硕士", "博士"];
const PREF_OCCUPATION = [
  "不限", "私企员工", "央企/国企", "外企", "事业单位", "公务员", "教师", "医生",
  "护士", "互联网行业", "自由职业", "军人", "工人", "服务业", "金融", "律师",
  "求职中", "在校学生", "个体老板", "公司高管", "美容师", "健身教练",
];
const PREF_MARRIAGE = ["不限", "不接受离异", "可接受离异未育", "可接受离异有孩子", "视情况而定"];
const PREF_HOUSING = ["不限", "愿意和父母同住", "要有独立婚房", "住房无所谓"];
const PREF_SMOKING = ["不限", "不接受吸烟", "可以偶尔吸烟", "吸烟无所谓"];
const PREF_DRINKING = ["不限", "不接受喝酒", "可以偶尔小酌", "喝酒无所谓"];
const PREF_TIMELINE = ["不限", "一年内结婚", "两年内结婚", "三年内结婚", "时机成熟时结婚"];

/** 当前值不在选项白名单时追加进去，保证已存值始终可见可选 */
const withValue = (options: string[], value: string) => (value && !options.includes(value) ? [...options, value] : options);

const prefNumber = (value: unknown, fallback: number) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : fallback;
};

const prefText = (value: unknown) => (typeof value === "string" && value ? value : "不限");

/** 双滑块：原生 range 叠加，仅露出拇指可拖动；允许交叉后自动换位，避免两端重合时卡死 */
function RangeSlider({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}) {
  const [lo, hi] = value;
  const loPct = ((lo - min) / (max - min)) * 100;
  const hiPct = ((hi - min) / (max - min)) * 100;
  const commitLow = (raw: number) => (raw > hi ? onChange([hi, raw]) : onChange([raw, hi]));
  const commitHigh = (raw: number) => (raw < lo ? onChange([raw, lo]) : onChange([lo, raw]));
  return (
    <span className="mdt-slider mdt-range">
      <span className="mdt-slider-fill" style={{ left: `${loPct}%`, width: `${hiPct - loPct}%` }} />
      <input
        type="range"
        className="mdt-range-input"
        min={min}
        max={max}
        step={1}
        value={lo}
        aria-label="最小值"
        onChange={(event) => commitLow(Number(event.target.value))}
      />
      <input
        type="range"
        className="mdt-range-input"
        min={min}
        max={max}
        step={1}
        value={hi}
        aria-label="最大值"
        onChange={(event) => commitHigh(Number(event.target.value))}
      />
      <span className="mdt-slider-knob" style={{ left: `${loPct}%` }} />
      <span className="mdt-slider-knob" style={{ left: `${hiPct}%` }} />
    </span>
  );
}

function RequirementTab({ userId }: { userId?: number }) {
  const currentYear = new Date().getFullYear();
  const [draft, setDraft] = useState<PreferenceDraft>(PREFERENCE_DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    setSaveMessage("");
    setSaveError("");
    void adminEndpoints.memberPreference(userId)
      .then((data) => {
        if (cancelled) return;
        setDraft({
          ageMin: Math.min(Math.max(prefNumber(data.age_min, PREFERENCE_DEFAULTS.ageMin), AGE_MIN_LIMIT), AGE_MAX_LIMIT),
          ageMax: Math.min(Math.max(prefNumber(data.age_max, PREFERENCE_DEFAULTS.ageMax), AGE_MIN_LIMIT), AGE_MAX_LIMIT),
          heightMin: Math.min(Math.max(prefNumber(data.height_min, PREFERENCE_DEFAULTS.heightMin), HEIGHT_MIN_LIMIT), HEIGHT_MAX_LIMIT),
          heightMax: Math.min(Math.max(prefNumber(data.height_max, PREFERENCE_DEFAULTS.heightMax), HEIGHT_MIN_LIMIT), HEIGHT_MAX_LIMIT),
          income: prefText(data.income_range),
          education: prefText(data.education_requirement),
          occupation: prefText(data.preferred_occupation),
          marriage: prefText(data.marriage_requirement),
          housing: prefText(data.housing_expectation),
          smoking: prefText(data.smoking_expectation),
          drinking: prefText(data.drinking_expectation),
          timeline: prefText(data.marriage_timeline),
          extra: typeof data.extra_requirement === "string" ? data.extra_requirement : "",
        });
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : "择偶要求加载失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [userId]);

  const update = <K extends keyof PreferenceDraft>(key: K, value: PreferenceDraft[K]) => {
    setSaveMessage("");
    setSaveError("");
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    setSaveMessage("");
    setSaveError("");
    try {
      await adminEndpoints.updateMemberPreference(userId, {
        age_min: draft.ageMin,
        age_max: draft.ageMax,
        height_min: draft.heightMin,
        height_max: draft.heightMax,
        income_range: draft.income,
        education_requirement: draft.education,
        preferred_occupation: draft.occupation,
        marriage_requirement: draft.marriage,
        housing_expectation: draft.housing,
        smoking_expectation: draft.smoking,
        drinking_expectation: draft.drinking,
        marriage_timeline: draft.timeline,
        extra_requirement: draft.extra,
      });
      const refreshed = await adminEndpoints.memberPreference(userId);
      setDraft({
        ageMin: Math.min(Math.max(prefNumber(refreshed.age_min, draft.ageMin), AGE_MIN_LIMIT), AGE_MAX_LIMIT),
        ageMax: Math.min(Math.max(prefNumber(refreshed.age_max, draft.ageMax), AGE_MIN_LIMIT), AGE_MAX_LIMIT),
        heightMin: Math.min(Math.max(prefNumber(refreshed.height_min, draft.heightMin), HEIGHT_MIN_LIMIT), HEIGHT_MAX_LIMIT),
        heightMax: Math.min(Math.max(prefNumber(refreshed.height_max, draft.heightMax), HEIGHT_MIN_LIMIT), HEIGHT_MAX_LIMIT),
        income: prefText(refreshed.income_range),
        education: prefText(refreshed.education_requirement),
        occupation: prefText(refreshed.preferred_occupation),
        marriage: prefText(refreshed.marriage_requirement),
        housing: prefText(refreshed.housing_expectation),
        smoking: prefText(refreshed.smoking_expectation),
        drinking: prefText(refreshed.drinking_expectation),
        timeline: prefText(refreshed.marriage_timeline),
        extra: typeof refreshed.extra_requirement === "string" ? refreshed.extra_requirement : "",
      });
      setSaveMessage("已保存");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "保存失败，请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  if (!userId) {
    return (
      <div className="mdt-stack">
        <Empty text="缺少会员 ID，无法加载择偶要求" />
      </div>
    );
  }

  return (
    <div className="mdt-stack">
      {loading && <Notice>正在加载择偶要求…</Notice>}
      {loadError && <Notice>加载失败：{loadError}</Notice>}

      <div className="mdt-slider-row">
        <span className="mdt-label">年龄</span>
        <div className="mdt-slider-box">
          <span className="mdt-slider-val">{draft.ageMin}岁({currentYear - draft.ageMin}年) - {draft.ageMax}岁({currentYear - draft.ageMax}年)</span>
          <RangeSlider
            min={AGE_MIN_LIMIT}
            max={AGE_MAX_LIMIT}
            value={[draft.ageMin, draft.ageMax]}
            onChange={([lo, hi]) => { setDraft((current) => ({ ...current, ageMin: lo, ageMax: hi })); setSaveMessage(""); }}
          />
        </div>
      </div>

      <div className="mdt-slider-row">
        <span className="mdt-label">身高</span>
        <div className="mdt-slider-box">
          <span className="mdt-slider-val">{draft.heightMin} - {draft.heightMax} cm</span>
          <RangeSlider
            min={HEIGHT_MIN_LIMIT}
            max={HEIGHT_MAX_LIMIT}
            value={[draft.heightMin, draft.heightMax]}
            onChange={([lo, hi]) => { setDraft((current) => ({ ...current, heightMin: lo, heightMax: hi })); setSaveMessage(""); }}
          />
        </div>
      </div>

      <div className="mdt-req-row">
        <span className="mdt-label">收入</span>
        <Radios name="mdt-req-income" options={withValue(PREF_INCOME, draft.income)} value={draft.income} onChange={(value) => update("income", value)} />
      </div>
      <div className="mdt-req-row">
        <span className="mdt-label">学历</span>
        <Radios name="mdt-req-edu" options={withValue(PREF_EDUCATION, draft.education)} value={draft.education} onChange={(value) => update("education", value)} />
      </div>
      <div className="mdt-req-row">
        <span className="mdt-label">职业</span>
        <Radios name="mdt-req-job" options={withValue(PREF_OCCUPATION, draft.occupation)} value={draft.occupation} onChange={(value) => update("occupation", value)} />
      </div>
      <div className="mdt-req-row">
        <span className="mdt-label">婚况</span>
        <Radios name="mdt-req-marital" options={withValue(PREF_MARRIAGE, draft.marriage)} value={draft.marriage} onChange={(value) => update("marriage", value)} />
      </div>
      <div className="mdt-req-row">
        <span className="mdt-label">住房</span>
        <Radios name="mdt-req-house" options={withValue(PREF_HOUSING, draft.housing)} value={draft.housing} onChange={(value) => update("housing", value)} />
      </div>
      <div className="mdt-req-row">
        <span className="mdt-label">吸烟</span>
        <Radios name="mdt-req-smoke" options={withValue(PREF_SMOKING, draft.smoking)} value={draft.smoking} onChange={(value) => update("smoking", value)} />
      </div>
      <div className="mdt-req-row">
        <span className="mdt-label">喝酒</span>
        <Radios name="mdt-req-drink" options={withValue(PREF_DRINKING, draft.drinking)} value={draft.drinking} onChange={(value) => update("drinking", value)} />
      </div>
      <div className="mdt-req-row">
        <span className="mdt-label">结婚</span>
        <Radios name="mdt-req-marry" options={withValue(PREF_TIMELINE, draft.timeline)} value={draft.timeline} onChange={(value) => update("timeline", value)} />
      </div>

      <div className="mdt-block">
        <div className="mdt-block-label">补充</div>
        <textarea
          className="mdt-textarea"
          style={{ minHeight: 100 }}
          maxLength={200}
          value={draft.extra}
          placeholder="请输入，200字以内"
          onChange={(event) => update("extra", event.target.value)}
        />
      </div>

      {saveError && <Notice>保存失败：{saveError}</Notice>}
      {saveMessage && <Notice>{saveMessage}</Notice>}

      <button type="button" className="mdt-submit" disabled={saving || loading} onClick={() => void save()}>
        {saving ? "保存中…" : "确定提交"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 服务跟进                                                            */
/* ------------------------------------------------------------------ */

const FOLLOW_METHODS = [
  { value: "PHONE", label: "电话" },
  { value: "WECHAT", label: "微信" },
  { value: "VISIT", label: "面谈" },
  { value: "OTHER", label: "其他" },
];
/** 后端 method 枚举 -> 中文，与后端 method_label（电话/微信/面谈/其他）一致 */
const FOLLOW_METHOD_LABEL: Record<string, string> = { PHONE: "电话", WECHAT: "微信", VISIT: "面谈", OTHER: "其他" };
const FOLLOW_TEMPLATES = ["核实资料", "邀约到店", "到店面谈", "服务交接"];
const FOLLOW_MAX_IMAGES = 9;
const FOLLOW_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const FOLLOW_VOICE_MAX_BYTES = 20 * 1024 * 1024;
const FOLLOW_VOICE_EXT = ["mp3", "wav", "m4a", "aac", "ogg", "amr", "webm"];
type FollowImage = { file: File; url: string };

/** images 字段可能是数组，也可能是 JSON 字符串（老数据） */
const followImages = (record: DetailData): string[] => {
  const raw = record.images;
  if (Array.isArray(raw)) return raw.map((item) => String(item));
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
    } catch {
      return [];
    }
  }
  return [];
};

function FollowTab({
  memberId,
  data,
  loading,
  error,
  onCreated,
}: {
  memberId?: number;
  data: DetailData | DetailData[];
  loading: boolean;
  error: string;
  onCreated?: () => void;
}) {
  const [method, setMethod] = useState("PHONE");
  const [content, setContent] = useState("");
  const [nextFollowAt, setNextFollowAt] = useState("");
  const [matchmakerId, setMatchmakerId] = useState("");
  const [accounts, setAccounts] = useState<AdminAccountItem[]>([]);
  const [images, setImages] = useState<FollowImage[]>([]);
  const [voice, setVoice] = useState<File | null>(null);
  const [voiceDuration, setVoiceDuration] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [sort, setSort] = useState<"new" | "old">("new");
  const imageInput = useRef<HTMLInputElement>(null);
  const voiceInput = useRef<HTMLInputElement>(null);
  const nextInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    void adminEndpoints
      .adminAccounts({ page: 1, page_size: 100 })
      .then((result) => {
        if (!cancelled) setAccounts((result.items ?? []).filter((item) => item.status === 1));
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => () => { images.forEach((item) => URL.revokeObjectURL(item.url)); }, [images]);

  const pickImages = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    let rejected = "";
    setImages((current) => {
      const next = [...current];
      for (const file of Array.from(files)) {
        if (next.length >= FOLLOW_MAX_IMAGES) { rejected = `图片最多 ${FOLLOW_MAX_IMAGES} 张`; break; }
        if (!/^image\/(jpe?g|png)$/i.test(file.type)) { rejected = "仅支持 JPG / PNG 图片"; continue; }
        if (file.size > FOLLOW_IMAGE_MAX_BYTES) { rejected = "单张图片不能超过 5MB"; continue; }
        next.push({ file, url: URL.createObjectURL(file) });
      }
      return next;
    });
    setSaveError(rejected);
  };

  const pickVoice = (file: File | undefined) => {
    if (!file) return;
    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    if (!FOLLOW_VOICE_EXT.includes(ext) && !/^audio\//i.test(file.type)) {
      setSaveError("仅支持 mp3/wav/m4a/aac/ogg/amr/webm 录音");
      return;
    }
    if (file.size > FOLLOW_VOICE_MAX_BYTES) {
      setSaveError("录音不能超过 20MB");
      return;
    }
    setVoice(file);
    setVoiceDuration(null);
    setSaveError("");
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      setVoiceDuration(Number.isFinite(audio.duration) ? Math.round(audio.duration) : null);
      URL.revokeObjectURL(url);
    };
    audio.onerror = () => {
      setVoiceDuration(null);
      URL.revokeObjectURL(url);
    };
    audio.src = url;
  };

  const clearDraft = () => {
    setImages((current) => { current.forEach((item) => URL.revokeObjectURL(item.url)); return []; });
    setVoice(null);
    setVoiceDuration(null);
    setContent("");
    setNextFollowAt("");
    if (imageInput.current) imageInput.current.value = "";
    if (voiceInput.current) voiceInput.current.value = "";
  };

  const submit = async () => {
    if (!memberId) { setSaveError("缺少会员 ID，无法提交跟进"); return; }
    const trimmed = content.trim();
    if (!trimmed && images.length === 0 && !voice) {
      setSaveError("跟进文字与图片/录音至少提供一项");
      return;
    }
    if (trimmed.length > 2000) { setSaveError("跟进内容不能超过 2000 字"); return; }
    setSaving(true);
    setSaveError("");
    setMessage("");
    try {
      const form = new FormData();
      form.set("method", method);
      form.set("content", trimmed);
      if (nextFollowAt) form.set("next_follow_at", new Date(nextFollowAt).toISOString());
      if (matchmakerId) form.set("matchmaker_id", matchmakerId);
      if (voice) {
        form.set("voice", voice);
        if (voiceDuration !== null) form.set("voice_duration_sec", String(voiceDuration));
      }
      images.forEach((item) => form.append("images", item.file));
      await adminEndpoints.createMemberFollowUpMedia(memberId, form);
      clearDraft();
      setMessage("已提交跟进");
      onCreated?.();
    } catch (submitError) {
      setSaveError(submitError instanceof Error ? submitError.message : "提交失败，请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  const records = [...dataItems(data)].sort((left, right) => {
    const leftTime = String(left.created_at ?? "");
    const rightTime = String(right.created_at ?? "");
    return sort === "new" ? rightTime.localeCompare(leftTime) : leftTime.localeCompare(rightTime);
  });

  return (
    <div className="mdt-follow">
      <div className="mdt-follow-left">
        <button type="button" className="mdt-btn mdt-btn-outline" onClick={() => nextInput.current?.focus()}>
          设置预约跟进时间 &gt;
        </button>

        <div className="mdt-follow-form">
          <div className="mdt-follow-row">
            <span className="mdt-label">跟进方式</span>
            <span className="mdt-select-wrap" style={{ width: 120 }}>
              <select className="mdt-select" value={method} onChange={(event) => setMethod(event.target.value)}>
                {FOLLOW_METHODS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </span>
            <span className="mdt-label">下次跟进</span>
            <input
              ref={nextInput}
              type="datetime-local"
              className="mdt-input"
              style={{ width: 200 }}
              value={nextFollowAt}
              onChange={(event) => setNextFollowAt(event.target.value)}
            />
            <span className="mdt-label">跟进红娘</span>
            <span className="mdt-select-wrap" style={{ width: 160 }}>
              <select className="mdt-select" value={matchmakerId} onChange={(event) => setMatchmakerId(event.target.value)}>
                <option value="">当前操作账号</option>
                {accounts.map((item) => (
                  <option key={item.id} value={String(item.id)}>{item.display_name || item.username}</option>
                ))}
              </select>
            </span>
          </div>

          <div className="mdt-block">
            <div className="mdt-block-label">
              <b>*</b>服务跟进
              <span className="mdt-follow-count">{content.length}/2000</span>
            </div>
            <textarea
              className="mdt-textarea"
              style={{ minHeight: 170 }}
              maxLength={2000}
              value={content}
              placeholder="本跟进内容仅红娘可见，不对外公开，2000字以内"
              onChange={(event) => setContent(event.target.value)}
            />
            <div className="mdt-upload-col">
              <button type="button" className="mdt-btn mdt-btn-plain" onClick={() => imageInput.current?.click()}>
                <Upload className="size-3.5" />
                上传图片（最多9张）
              </button>
              <button type="button" className="mdt-btn mdt-btn-plain" onClick={() => voiceInput.current?.click()}>
                <Upload className="size-3.5" />
                上传录音（≤20MB）
              </button>
              <input
                ref={imageInput}
                type="file"
                accept="image/jpeg,image/png"
                multiple
                hidden
                onChange={(event) => pickImages(event.target.files)}
              />
              <input
                ref={voiceInput}
                type="file"
                accept="audio/mpeg,audio/wav,audio/mp4,audio/aac,audio/ogg,audio/amr,audio/webm,.mp3,.wav,.m4a,.aac,.ogg,.amr,.webm"
                hidden
                onChange={(event) => pickVoice(event.target.files?.[0])}
              />
            </div>
          </div>

          {images.length > 0 && (
            <div className="mdt-follow-previews">
              {images.map((item, index) => (
                <span className="mdt-follow-thumb" key={item.url}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.file.name} />
                  <button
                    type="button"
                    className="mdt-follow-del"
                    aria-label="移除图片"
                    onClick={() => setImages((current) => {
                      URL.revokeObjectURL(item.url);
                      return current.filter((_, position) => position !== index);
                    })}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {voice && (
            <span className="mdt-follow-voice">
              录音：{voice.name}
              {voiceDuration !== null && ` · ${voiceDuration}秒`}
              <button type="button" className="mdt-link" onClick={() => { setVoice(null); setVoiceDuration(null); if (voiceInput.current) voiceInput.current.value = ""; }}>
                移除
              </button>
            </span>
          )}
        </div>

        <div className="mdt-template-row">
          <span className="mdt-label">从模板选择:</span>
          <span className="mdt-chips">
            {FOLLOW_TEMPLATES.map((item) => (
              <button key={item} type="button" className="mdt-chip" onClick={() => setContent((current) => (current ? `${current}\n${item}` : item))}>
                {item}
              </button>
            ))}
          </span>
          <button type="button" className="mdt-link" style={{ marginLeft: "auto" }}>
            管理模板
          </button>
        </div>

        {saveError && <Notice>提交失败：{saveError}</Notice>}
        {message && <Notice>{message}</Notice>}

        <button type="button" className="mdt-submit" style={{ marginTop: 18 }} disabled={saving} onClick={() => void submit()}>
          {saving ? "提交中…" : "确定提交"}
        </button>
      </div>

      <div className="mdt-follow-right">
        <div className="mdt-follow-sort">
          <span className="mdt-select-wrap" style={{ width: 200, display: "inline-block" }}>
            <select className="mdt-select" value={sort} onChange={(event) => setSort(event.target.value as "new" | "old")}>
              <option value="new">最新记录显示在前面</option>
              <option value="old">最早记录显示在前面</option>
            </select>
          </span>
        </div>
        <ApiState loading={loading} error={error}>
        {records.length === 0 ? <Empty /> : records.map((record, index) => {
          const photos = followImages(record).map((item) => resolveMediaUrl(item)).filter((item): item is string => Boolean(item));
          const audio = typeof record.voice_url === "string" && record.voice_url ? resolveMediaUrl(record.voice_url) : undefined;
          return (
            <div className="mdt-record" key={String(record.id ?? index)}>
              <div className="mdt-record-head">
                <span className="mdt-record-time">{dataValue(record.created_at)}</span>
                <span className="mdt-record-by">
                  {FOLLOW_METHOD_LABEL[String(record.method ?? "")] ?? dataValue(record.method)}
                  {record.matchmaker_name ? ` · ${String(record.matchmaker_name)}` : ""}
                </span>
                {record.next_follow_at ? <span className="mdt-record-time">下次：{dataValue(record.next_follow_at)}</span> : null}
              </div>
              <div className="mdt-record-body">{dataValue(record.content ?? record.remark ?? record.note)}</div>
              {photos.length > 0 && (
                <div className="mdt-record-media">
                  {photos.map((item) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={item} src={item} alt="" />
                  ))}
                </div>
              )}
              {audio && (
                <audio className="mdt-record-audio" controls src={audio}>
                  当前浏览器不支持音频播放
                </audio>
              )}
            </div>
          );
        })}
        </ApiState>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 私密信息                                                            */
/* ------------------------------------------------------------------ */

/** 私密资料表单草稿：键与后端 PUT 字段逐个同名，值统一为字符串 */
type PrivateInfoDraft = Record<string, string>;

/** 各分组字段清单（与后端 MemberPrivateInfoUpdate 同名同序） */
const PRIVATE_SINGLE_FIELDS = [
  "body_type", "face_type", "skin_type", "eye_type",
  "love_experience", "longest_love", "single_duration",
  "work_status", "rest_schedule", "health_condition",
  "infectious_disease", "genetic_disease", "bad_habits",
  "criminal_record", "emotional_status", "children_status",
  "parents_status", "family_structure", "family_members",
  "sibling_rank", "other_members",
  "father_age", "father_occupation", "father_health", "father_retirement",
  "mother_age", "mother_occupation", "mother_health", "mother_retirement",
] as const;
const PRIVATE_TEXT_FIELDS = ["breakup_reason", "love_bottom_line", "divorce_reason"] as const;
const PRIVATE_INFO_FIELDS = [...PRIVATE_SINGLE_FIELDS, "only_child", ...PRIVATE_TEXT_FIELDS, "other_info"] as const;

const privateDraftFrom = (info: DetailData): PrivateInfoDraft => {
  const draft: PrivateInfoDraft = {};
  for (const key of PRIVATE_INFO_FIELDS) {
    const value = info[key];
    draft[key] = value === null || value === undefined ? "" : String(value);
  }
  return draft;
};

function PrivateTab({
  memberId,
  data,
  loading,
  error,
  onSaved,
}: {
  memberId: number | string;
  data: DetailData | DetailData[];
  loading: boolean;
  error: string;
  onSaved: () => void;
}) {
  const info = Array.isArray(data) ? {} : data;
  const [draft, setDraft] = useState<PrivateInfoDraft>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  // 接口数据到达（或切换会员）后回填草稿
  useEffect(() => {
    if (Array.isArray(data)) return;
    setDraft(privateDraftFrom(data));
  }, [data]);

  const update = (key: string, value: string) => setDraft((prev) => ({ ...prev, [key]: value }));

  /** 只提交发生变化的字段：后端是增量更新，未改的传过去反而会覆盖成旧值 */
  const submit = async () => {
    if (!memberId || saving) return;
    const base = privateDraftFrom(info);
    const body: JsonBody = {};
    for (const key of PRIVATE_INFO_FIELDS) {
      if ((draft[key] ?? "") !== (base[key] ?? "")) body[key] = draft[key] ?? "";
    }
    if (Object.keys(body).length === 0) {
      setNotice("没有需要保存的改动");
      return;
    }
    setSaving(true);
    setNotice("");
    try {
      // 后端 PUT 返回更新后的完整对象，直接用返回值回填，省一次 GET
      await adminEndpoints.updateMemberPrivateInfo(memberId, body);
      onSaved();
      setNotice("保存成功");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "保存失败，请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mdt-stack">
      <ApiState loading={loading} error={error}>
        {notice ? <div className="mdt-notice">{notice}</div> : null}

        <Notice>
          以下信息默认不对外公开。 可设置修改为对外展示并要求会员填写
          <button type="button" className="mdt-link" style={{ marginLeft: 6 }}>
            修改设置 &gt;
          </button>
        </Notice>

        <div className="mdt-section-title">个人情况</div>
        <div className="mdt-grid3">
          <Field label="身材体型">
            <Sel value={draft.body_type} options={["匀称", "苗条", "健壮", "微胖", "未知"]} onChange={(v) => update("body_type", v)} />
          </Field>
          <Field label="脸型">
            <Sel value={draft.face_type} options={["圆脸", "方脸", "瓜子脸", "长脸", "未知"]} onChange={(v) => update("face_type", v)} />
          </Field>
          <Field label="皮肤类型">
            <Sel value={draft.skin_type} options={["白皙", "偏黄", "偏黑", "小麦色", "未知"]} onChange={(v) => update("skin_type", v)} />
          </Field>
          <Field label="眼睛类型">
            <Sel value={draft.eye_type} options={["双眼皮", "单眼皮", "内双", "未知"]} onChange={(v) => update("eye_type", v)} />
          </Field>
          <Field label="恋爱经历">
            <Sel value={draft.love_experience} options={["无", "1段", "2段", "3段及以上", "未知"]} onChange={(v) => update("love_experience", v)} />
          </Field>
          <Field label="最长恋爱">
            <Sel value={draft.longest_love} options={["半年以内", "半年-1年", "1-3年", "3年以上", "未知"]} onChange={(v) => update("longest_love", v)} />
          </Field>
          <Field label="单身时长">
            <Sel value={draft.single_duration} options={["1年以内", "1-3年", "3-5年", "5年以上", "未知"]} onChange={(v) => update("single_duration", v)} />
          </Field>
          <Field label="工作情况">
            <Sel value={draft.work_status} options={["朝九晚五", "经常加班", "弹性工作", "自由安排", "未知"]} onChange={(v) => update("work_status", v)} />
          </Field>
          <Field label="休息时间">
            <Sel value={draft.rest_schedule} options={["双休", "单休", "轮休", "不定时", "未知"]} onChange={(v) => update("rest_schedule", v)} />
          </Field>
          <Field label="身体情况">
            <Sel value={draft.health_condition} options={["健康", "一般", "有慢性病", "未知"]} onChange={(v) => update("health_condition", v)} />
          </Field>
          <Field label="传染病">
            <Sel value={draft.infectious_disease} options={["无", "有", "未知"]} onChange={(v) => update("infectious_disease", v)} />
          </Field>
          <Field label="遗传病史">
            <Sel value={draft.genetic_disease} options={["无", "有", "未知"]} onChange={(v) => update("genetic_disease", v)} />
          </Field>
          <Field label="不良嗜好">
            <Sel value={draft.bad_habits} options={["无", "有", "未知"]} onChange={(v) => update("bad_habits", v)} />
          </Field>
          <Field label="犯罪记录">
            <Sel value={draft.criminal_record} options={["无", "有", "未知"]} onChange={(v) => update("criminal_record", v)} />
          </Field>
          <Field label="情感状态">
            <Sel value={draft.emotional_status} options={["单身", "恋爱中", "已婚", "未知"]} onChange={(v) => update("emotional_status", v)} />
          </Field>
          <Field label="孩子情况">
            <Sel value={draft.children_status} options={["无", "有一个", "有两个", "未知"]} onChange={(v) => update("children_status", v)} />
          </Field>
        </div>

        <div className="mdt-block">
          <div className="mdt-block-label">分手原因</div>
          <textarea
            className="mdt-textarea"
            style={{ minHeight: 60 }}
            maxLength={200}
            placeholder="上一次恋爱分手原因是什么，200字以内"
            value={draft.breakup_reason ?? ""}
            onChange={(event) => update("breakup_reason", event.target.value)}
          />
        </div>
        <div className="mdt-block">
          <div className="mdt-block-label">感情底线</div>
          <textarea
            className="mdt-textarea"
            style={{ minHeight: 60 }}
            maxLength={200}
            placeholder="最不能接受的异性哪方面的问题，200字以内"
            value={draft.love_bottom_line ?? ""}
            onChange={(event) => update("love_bottom_line", event.target.value)}
          />
        </div>
        <div className="mdt-block">
          <div className="mdt-block-label">离婚原因</div>
          <textarea
            className="mdt-textarea"
            style={{ minHeight: 60 }}
            maxLength={200}
            placeholder="上一段婚姻破碎原因是什么，200字以内"
            value={draft.divorce_reason ?? ""}
            onChange={(event) => update("divorce_reason", event.target.value)}
          />
        </div>

        <div className="mdt-section-title">原生家庭</div>
        <div className="mdt-grid3">
          <Field label="父母婚况">
            <Sel value={draft.parents_status} options={["未婚", "离异", "丧偶", "在婚", "未知"]} onChange={(v) => update("parents_status", v)} />
          </Field>
          <Field label="家庭结构">
            <Sel value={draft.family_structure} options={["双亲家庭", "单亲家庭", "重组家庭", "未知"]} onChange={(v) => update("family_structure", v)} />
          </Field>
          <Field label="家庭成员">
            <Sel
              placeholder="请选择"
              value={draft.family_members}
              options={["独生", "有兄弟姐妹"]}
              onChange={(v) => update("family_members", v)}
            />
          </Field>
          <Field label="家中排行">
            <Sel value={draft.sibling_rank} options={["老大", "老二", "老三", "老小", "独生", "未知"]} onChange={(v) => update("sibling_rank", v)} />
          </Field>
          <Field label="独生子女">
            <Radios
              name="mdt-only-child"
              options={["未知", "独生", "非独生"]}
              value={draft.only_child || "未知"}
              onChange={(v) => update("only_child", v)}
            />
          </Field>
          <Field label="其他成员">
            <Inp
              placeholder="家庭中其他成员的情况描述，200字以内"
              value={draft.other_members ?? ""}
              onChange={(v) => update("other_members", v)}
            />
          </Field>
          <Field label="父亲年龄">
            <Sel value={draft.father_age} options={["45-50岁", "50-55岁", "55-60岁", "60岁以上", "未知"]} onChange={(v) => update("father_age", v)} />
          </Field>
          <Field label="父亲职业">
            <Sel value={draft.father_occupation} options={["在职", "退休", "个体经营", "未知"]} onChange={(v) => update("father_occupation", v)} />
          </Field>
          <Field label="父亲健康">
            <Sel value={draft.father_health} options={["健康", "一般", "欠佳", "未知"]} onChange={(v) => update("father_health", v)} />
          </Field>
          <Field label="退休情况">
            <Sel value={draft.father_retirement} options={["未退休", "已退休", "未知"]} onChange={(v) => update("father_retirement", v)} />
          </Field>
          <Field label="母亲年龄">
            <Sel value={draft.mother_age} options={["45-50岁", "50-55岁", "55-60岁", "60岁以上", "未知"]} onChange={(v) => update("mother_age", v)} />
          </Field>
          <Field label="母亲职业">
            <Sel value={draft.mother_occupation} options={["在职", "退休", "个体经营", "未知"]} onChange={(v) => update("mother_occupation", v)} />
          </Field>
          <Field label="母亲健康">
            <Sel value={draft.mother_health} options={["健康", "一般", "欠佳", "未知"]} onChange={(v) => update("mother_health", v)} />
          </Field>
          <Field label="退休情况">
            <Sel value={draft.mother_retirement} options={["未退休", "已退休", "未知"]} onChange={(v) => update("mother_retirement", v)} />
          </Field>
        </div>

        <div className="mdt-section-title">补充信息</div>
        <div className="mdt-block">
          <div className="mdt-block-label">其它信息</div>
          <textarea
            className="mdt-textarea"
            style={{ minHeight: 100 }}
            maxLength={1000}
            placeholder="在这里可以自由录入该会员的其它信息资料，限1000汉字以内"
            value={draft.other_info ?? ""}
            onChange={(event) => update("other_info", event.target.value)}
          />
        </div>

        <button type="button" className="mdt-submit" onClick={submit} disabled={saving}>
          {saving ? "保存中..." : "确定提交"}
        </button>
      </ApiState>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 推荐匹配                                                            */
/* ------------------------------------------------------------------ */

/** 推荐状态：is_liked / is_passed / is_viewed 在库里是 tinyint，也可能是布尔 */
const recommendState = (record: DetailData) => {
  const on = (value: unknown) => value === 1 || value === true || value === "1";
  if (on(record.is_liked)) return "已喜欢";
  if (on(record.is_passed)) return "已拒绝";
  if (on(record.is_viewed)) return "已查看";
  return "-";
};

function MatchTab({
  memberId,
  sub,
  onSub,
  onOpenLibrary,
  onReload,
  data,
  loading,
  error,
  memberName,
}: {
  memberId: number | string;
  sub: string;
  onSub: (key: string) => void;
  onOpenLibrary: () => void;
  /** 新增推荐成功后通知父级重新拉取推荐名单 */
  onReload: () => void;
  data: DetailData | DetailData[];
  loading: boolean;
  error: string;
  memberName: string;
}) {
  const recommendRows = dataItems(data);

  /* ── 智能匹配：筛选条件 + 候选人列表 ── */
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [occupationPick, setOccupationPick] = useState<string[]>([]);
  const [tagPick, setTagPick] = useState<string[]>([]);
  const [vipFilter, setVipFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<DetailData>({});
  const [candidates, setCandidates] = useState<DetailData[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [metFor, setMetFor] = useState<DetailData | null>(null);
  const [metRows, setMetRows] = useState<DetailData[]>([]);
  const [metLoading, setMetLoading] = useState(false);
  const [metError, setMetError] = useState("");
  const pageSize = 20;

  /* ── 推荐名单：手工添加推荐人 ── */
  const [addKeyword, setAddKeyword] = useState("");
  const [addUserId, setAddUserId] = useState<number | null>(null);
  const [addReason, setAddReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [addMessage, setAddMessage] = useState("");
  const [addError, setAddError] = useState("");

  const setFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const search = async (targetPage = page) => {
    if (!memberId) return;
    setSearching(true);
    setSearchError("");
    try {
      // 只传非「不限」的条件；多选用重复 query key
      const query: Record<string, string | string[] | number> = { page: targetPage, page_size: pageSize, vip_filter: vipFilter };
      for (const [key, value] of Object.entries(filters)) {
        if (!value || value === "不限") continue;
        if (key === "marriage") {
          const mapped = MATCH_MARRIAGE[value];
          if (mapped) query.marriage = mapped;
          continue;
        }
        query[key] = value;
      }
      if (occupationPick.length) query.occupations = occupationPick;
      if (tagPick.length) query.tags = tagPick;
      const page_ = await adminEndpoints.listMemberRecommendCandidates(memberId, query);
      const record = (page_ && typeof page_ === "object" ? page_ : {}) as DetailData;
      setResult(record);
      setCandidates(Array.isArray(record.items) ? (record.items as DetailData[]) : []);
      setPage(targetPage);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "查询失败，请稍后重试");
      setCandidates([]);
    } finally {
      setSearching(false);
    }
  };

  // 首次进入智能匹配时自动查一次（respect_preference 默认 true，后端自动套用择偶要求）
  useEffect(() => {
    if (sub !== "smart" || !memberId) return;
    void search(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sub, memberId]);

  /**
   * 从会员 CRM 中搜索候选人（编号/昵称/手机号）。
   * 复用会员列表接口的 `search` 参数，取其 items 映射成选择器需要的结构。
   */
  const searchCandidates = async (keyword: string) => {
    const hit = await adminEndpoints.members({ search: keyword.trim(), page: 1, page_size: 20 });
    const record = (hit && typeof hit === "object" ? hit : {}) as DetailData;
    const rows = Array.isArray(record.items) ? (record.items as DetailData[]) : [];
    return rows.map((row) => ({
      id: Number(row.id),
      nickname: (row.nickname as string) ?? null,
      phone: (row.phone as string) ?? null,
      avatar: (row.avatar as string) ?? null,
      // 已停用会员不参与推荐
      unavailable: Number(row.status) === 2,
      unavailable_reason: Number(row.status) === 2 ? "已停用" : null,
    }));
  };

  const submitRecommendation = async () => {
    setAddMessage("");
    setAddError("");
    if (!memberId) return;
    if (!addUserId) {
      setAddError("请先从搜索结果中选择要推荐的会员");
      return;
    }
    if (addUserId === Number(memberId)) {
      setAddError("不能把会员推荐给自己");
      return;
    }
    setSubmitting(true);
    try {
      await adminEndpoints.createMemberRecommendation(memberId, {
        recommend_user_id: addUserId,
        ...(addReason.trim() ? { match_reason: addReason.trim() } : {}),
      });
      setAddMessage("已添加到推荐名单");
      setAddKeyword("");
      setAddUserId(null);
      setAddReason("");
      onReload();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "提交失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  const openMet = async (row: DetailData) => {
    const targetId = row.user_id;
    if (targetId === null || targetId === undefined) return;
    setMetFor(row);
    setMetLoading(true);
    setMetError("");
    setMetRows([]);
    try {
      const met = await adminEndpoints.memberMetMembers(memberId, { page: 1, page_size: 50 });
      const record = (met && typeof met === "object" ? met : {}) as DetailData;
      const rows = Array.isArray(record.items) ? (record.items as DetailData[]) : [];
      // 接口按会员维度返回牵线对手方，这里筛出当前这一行的对手
      setMetRows(rows.filter((item) => Number(item.user_id) === Number(targetId)));
    } catch (err) {
      setMetError(err instanceof Error ? err.message : "名单加载失败");
    } finally {
      setMetLoading(false);
    }
  };

  const prefer = (result.preference && typeof result.preference === "object" ? result.preference : {}) as DetailData;
  const total = Number(result.total ?? 0);
  const hasMore = Boolean(result.has_more);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <div className="mdt-subtabs">
        {[
          ["smart", "智能匹配"],
          ["recommend", "推荐名单"],
          ["destiny", "姻缘名单"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={"mdt-subtab" + (sub === key ? " active" : "")}
            onClick={() => onSub(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {sub === "smart" && (
        <>
          <div className="mdt-section-title" style={{ marginTop: 0 }}>
            根据该会员择偶要求
          </div>
          <div className="mdt-chips">
            {[
              preferChip("年龄", prefer.age_min === null || prefer.age_max === null ? null : `${prefer.age_min}-${prefer.age_max}`, "岁"),
              preferChip("身高", prefer.height_min === null || prefer.height_max === null ? null : `${prefer.height_min}-${prefer.height_max}`),
              preferChip("学历", prefer.education_min),
              preferChip("收入", prefer.income_min),
            ].map((item) => (
              <span key={item} className="mdt-tag">
                {item}
              </span>
            ))}
          </div>

          <div className="mdt-section-title">附加更多条件</div>
          <div className="mdt-grid3">
            <Field label="抽烟">
              <Sel value={filters.smoking ?? "不限"} placeholder="不限" options={["不限", ...MATCH_SMOKING]} onChange={(v) => setFilter("smoking", v)} />
            </Field>
            <Field label="喝酒">
              <Sel value={filters.drinking ?? "不限"} placeholder="不限" options={["不限", ...MATCH_DRINKING]} onChange={(v) => setFilter("drinking", v)} />
            </Field>
            <Field label="住房">
              <Sel value={filters.house ?? "不限"} placeholder="不限" options={["不限", ...MATCH_HOUSE]} onChange={(v) => setFilter("house", v)} />
            </Field>
            <Field label="婚况">
              <Sel value={filters.marriage ?? "不限"} placeholder="不限" options={["不限", "未婚", "离异", "丧偶"]} onChange={(v) => setFilter("marriage", v)} />
            </Field>
            <Field label="民族">
              <Sel value={filters.ethnicity ?? "不限"} placeholder="不限" options={["不限", ...ETHNICITY]} onChange={(v) => setFilter("ethnicity", v)} />
            </Field>
            <Field label="星座">
              <Sel value={filters.constellation ?? "不限"} placeholder="不限" options={["不限", ...MATCH_CONSTELLATION]} onChange={(v) => setFilter("constellation", v)} />
            </Field>
            <Field label="家乡">
              <Inp value={filters.hometown ?? ""} placeholder="不限" onChange={(v) => setFilter("hometown", v)} />
            </Field>
            <Field label="现居">
              <Inp value={filters.residence ?? ""} placeholder="不限" onChange={(v) => setFilter("residence", v)} />
            </Field>
            <Field label="人格类型">
              <Sel value={filters.mbti ?? "不限"} placeholder="不限" options={["不限", ...MATCH_MBTI]} onChange={(v) => setFilter("mbti", v)} />
            </Field>
          </div>

          <div className="mdt-section-title">按标签筛选</div>
          <Checks options={TAG_OPTIONS} checked={tagPick} onChange={(v) => { setTagPick(v); setPage(1); }} />

          <div className="mdt-section-title">按职业筛选</div>
          <Checks options={OCCUPATION} checked={occupationPick} onChange={(v) => { setOccupationPick(v); setPage(1); }} />

          <div className="mdt-match-actions">
            <button type="button" className="mdt-submit" onClick={() => search(1)} disabled={searching}>
              {searching ? "查询中..." : "查询"}
            </button>
            <button
              type="button"
              className="mdt-btn mdt-btn-outline"
              onClick={() => {
                setFilters({});
                setOccupationPick([]);
                setTagPick([]);
                setVipFilter("all");
                setPage(1);
                void search(1);
              }}
            >
              重置
            </button>
          </div>

          <ApiState loading={searching} error={searchError}>
            <div className="mdt-match-count">
              查询到 <b>{total}</b> 位符合条件的会员
            </div>
            <Radios
              name="mdt-match-filter"
              options={MATCH_VIP_FILTERS.map((item) => item.label)}
              value={MATCH_VIP_FILTERS.find((item) => item.value === vipFilter)?.label ?? "不限"}
              onChange={(label) => {
                const hit = MATCH_VIP_FILTERS.find((item) => item.label === label);
                if (hit) {
                  setVipFilter(hit.value);
                  setPage(1);
                }
              }}
            />

            <table className="mdt-table" style={{ marginTop: 14 }}>
              <thead>
                <tr>
                  {["资料", "红娘", "到店核验", "VIP", "安排过", "见过哪些人"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <Empty />
                    </td>
                  </tr>
                ) : (
                  candidates.map((row, index) => {
                    const education = row.education_level ? EDUCATION[Number(row.education_level) - 1] : null;
                    const info = [
                      row.age ? `${row.age}岁` : null,
                      row.height ? `${row.height}cm` : null,
                      row.occupation,
                      row.income ? `年入${row.income}` : null,
                      education,
                    ].filter(Boolean).join(" / ");
                    const metCount = Number(row.met_count ?? 0);
                    return (
                      <tr key={String(row.user_id ?? index)}>
                        <td>
                          <div className="mdt-match-user">
                            <span className="mdt-match-avatar" />
                            <span>
                              <b>{dataValue(row.nickname)}</b>
                              <span className="mdt-match-code">编号：{dataValue(row.member_code)}</span>
                              <span className="mdt-match-info">{info || "-"}</span>
                            </span>
                          </div>
                        </td>
                        <td>{dataValue(row.matchmaker_name)}</td>
                        <td>{row.store_visited ? "已核验" : "未核验"}</td>
                        <td>{row.is_offline_vip ? "线下VIP" : "非线下VIP"}</td>
                        <td>{Number(row.promise_meet_count ?? 0)}次约见</td>
                        <td>
                          <button
                            type="button"
                            className="mdt-link"
                            disabled={metCount === 0}
                            onClick={() => void openMet(row)}
                          >
                            查看名单
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {total > pageSize ? (
              <div className="mdt-pager">
                <button type="button" className="au-page-btn" disabled={page <= 1} onClick={() => void search(page - 1)}>
                  ‹
                </button>
                <span className="au-page-num">{page}</span>
                <span className="mdt-pager-total">/ {totalPages}</span>
                <button type="button" className="au-page-btn" disabled={!hasMore} onClick={() => void search(page + 1)}>
                  ›
                </button>
              </div>
            ) : null}
          </ApiState>
        </>
      )}

      {metFor ? (
        <div className="mdt-met-mask" onClick={() => setMetFor(null)}>
          <div className="mdt-met-panel" onClick={(event) => event.stopPropagation()}>
            <div className="mdt-met-head">
              <b>{dataValue(metFor.nickname)}</b>
              <span>的牵线名单</span>
              <button type="button" className="mdt-link" style={{ marginLeft: "auto" }} onClick={() => setMetFor(null)}>
                关闭
              </button>
            </div>
            <ApiState loading={metLoading} error={metError}>
              {metRows.length === 0 ? (
                <Empty text="暂无牵线记录" />
              ) : (
                <table className="mdt-table">
                  <thead>
                    <tr>
                      {["会员", "编号", "状态", "牵线时间"].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metRows.map((item, index) => (
                      <tr key={String(item.user_id ?? index)}>
                        <td>{dataValue(item.nickname)}</td>
                        <td>{dataValue(item.member_code)}</td>
                        <td>{dataValue(item.apply_status)}</td>
                        <td>{dataValue(item.applied_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </ApiState>
          </div>
        </div>
      ) : null}

      {sub === "recommend" && (
        <>
          <Notice>
            推荐名单是红娘销售过程中的重要辅助工具，也为签单后的服务匹配作参考。客户登录平台后会在“匹配”栏中看到该名单，并标有“红娘推荐”。
          </Notice>
          <div className="mdt-recommend-bar">
            <span>添加推荐人：</span>
            <UserCandidatePicker
              value={addKeyword}
              onChange={(text, picked) => {
                setAddKeyword(text);
                setAddUserId(picked);
                setAddMessage("");
                setAddError("");
              }}
              search={searchCandidates}
              className="mdt-input mdt-recommend-picker"
              placeholder="请输入编号/姓名/手机号/昵称"
            />
            <input
              className="mdt-input"
              style={{ width: 200 }}
              maxLength={255}
              placeholder="推荐理由（选填）"
              value={addReason}
              onChange={(event) => setAddReason(event.target.value)}
            />
            <button
              type="button"
              className="mdt-submit"
              onClick={submitRecommendation}
              disabled={submitting || !addUserId}
              title={addUserId ? "提交后加入该会员的推荐名单" : "请先搜索并选择会员"}
            >
              {submitting ? "提交中..." : "确定提交"}
            </button>
            <label className="mdt-check">
              <input type="radio" name="mdt-rec-source" defaultChecked />
              从会员CRM中查找
            </label>
          </div>
          {addMessage && <div className="mdt-notice">{addMessage}</div>}
          {addError && <div className="mdt-notice mdt-notice-error">{addError}</div>}
          <table className="mdt-table">
            <thead>
              <tr>
                {["推荐会员", "已推荐给", "推荐人", "推荐理由", "推荐时间", "操作"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
          </table>
          <ApiState loading={loading} error={error}>
            {recommendRows.length === 0 ? (
              <Empty />
            ) : (
              <table className="mdt-table">
                <tbody>
                  {recommendRows.map((row, index) => (
                    <tr key={String(row.id ?? index)}>
                      <td>{dataValue(row.target_nickname ?? row.target_user_id)}</td>
                      <td>{memberName}</td>
                      <td>{dataValue(row.recommend_source)}</td>
                      <td>{dataValue(row.match_reason)}</td>
                      <td>{dataValue(row.recommend_date ?? row.created_at)}</td>
                      <td>{recommendState(row)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </ApiState>
        </>
      )}

      {sub === "destiny" && (
        <>
          <Notice>
            下面是客户到店与红娘面谈过程中从平台的资料库中选择的姻缘人选，服务红娘可以从下面的人选中给该客户进行撮合牵线搭桥，同时您可以根据客户所选择的这些人选分析总结出客户的核心择偶要求，从资源库中为客户筛选匹配，从更加宽泛的人选中为其提供精准服务。
          </Notice>
          <div className="mdt-destiny-bar">
            <button type="button" className="mdt-submit" onClick={onOpenLibrary}>
              为Ta创建销售姻缘库
            </button>
            <button type="button" className="mdt-link">
              <Link2 className="mr-1 inline size-3.5" />
              姻缘库使用方法
            </button>
          </div>
          <div className="mdt-empty">
            <UserRound className="mdt-empty-ic size-12" strokeWidth={1} />
            Ta还未创建销售姻缘库，
            <button type="button" className="mdt-link" onClick={onOpenLibrary}>
              立即创建
            </button>
          </div>
        </>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 通话 / 牵线 / 约会 / 活动报名                                        */
/* ------------------------------------------------------------------ */

function CallsTab({ data, loading, error }: { data: DetailData | DetailData[]; loading: boolean; error: string }) {
  const records = dataItems(data);
  return (
    <>
      <div className="mdt-check-line">
        <label className="mdt-check">
          <input type="checkbox" />
          呼叫：0次
        </label>
        <label className="mdt-check">
          <input type="checkbox" />
          通话总时长：0秒
        </label>
      </div>
      <table className="mdt-table">
        <thead>
          <tr>
            {["状态", "通话次数", "呼出坐席", "呼出开始时间", "挂机时间", "通话时长", "录音回放", "本次通话小结(同步到服务跟进)"].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        {records.length > 0 && <tbody>{records.map((record, index) => <tr key={String(record.id ?? index)}><td>{dataValue(record.status ?? record.status_label)}</td><td>{dataValue(record.call_count ?? record.times)}</td><td>{dataValue(record.agent_name ?? record.operator_name)}</td><td>{dataValue(record.started_at ?? record.created_at)}</td><td>{dataValue(record.ended_at ?? record.hangup_at)}</td><td>{dataValue(record.duration ?? record.duration_seconds)}</td><td>{dataValue(record.recording_url ?? record.record_url)}</td><td>{dataValue(record.summary ?? record.content ?? record.remark)}</td></tr>)}</tbody>}
      </table>
      <ApiState loading={loading} error={error}>{records.length === 0 ? <Empty /> : null}</ApiState>
    </>
  );
}

/**
 * 牵线申请状态（match_apply.status，参照 discovery.respond_application 的业务定义）：
 * 插入默认 0；accept → 1；reject → 2；超期或双方删好友时批量置 3。
 */
const MATCH_APPLY_STATUS: Record<number, string> = {
  0: "待处理",
  1: "已接受",
  2: "已拒绝",
  3: "已失效",
};
const matchApplyStatus = (value: unknown) => {
  const n = Number(value);
  return MATCH_APPLY_STATUS[n] ?? (Number.isNaN(n) ? "-" : `未知(${n})`);
};

function LineTab({
  memberId,
  sub,
  onSub,
}: {
  memberId: number | string;
  sub: string;
  onSub: (key: string) => void;
}) {
  /* ── 牵线记录：本组件自行分页（父级只给 50 条会截断，故走服务端分页） ── */
  const pageSize = 20;
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<DetailData[]>([]);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  const load = async (targetPage: number) => {
    if (!memberId) return;
    setListLoading(true);
    setListError("");
    try {
      const res = await adminEndpoints.memberMatchRecords(memberId, { page: targetPage, page_size: pageSize });
      const record = (res && typeof res === "object" ? res : {}) as DetailData;
      setRows(Array.isArray(record.items) ? (record.items as DetailData[]) : []);
      setTotal(Number(record.total ?? 0));
      setPage(targetPage);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "牵线记录加载失败");
      setRows([]);
      setTotal(0);
    } finally {
      setListLoading(false);
    }
  };

  // 首次进入 / 切换会员时拉取
  useEffect(() => {
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  /* ── 剩余牵线次数：与记录接口并行调用 ── */
  const [quota, setQuota] = useState<DetailData | null>(null);
  const [quotaFailed, setQuotaFailed] = useState(false);
  useEffect(() => {
    if (!memberId) return;
    let cancelled = false;
    setQuotaFailed(false);
    void adminEndpoints
      .memberMatchQuota(memberId)
      .then((res) => {
        if (!cancelled) setQuota((res && typeof res === "object" ? res : {}) as DetailData);
      })
      .catch(() => {
        // 次数属于辅助信息，取不到时不阻塞主表格，仅标灰
        if (!cancelled) setQuotaFailed(true);
      });
    return () => { cancelled = true; };
  }, [memberId]);

  /**
   * 子 Tab 前端切分：Ta发起的 = from 是本人；向Ta发起的 = to 是本人。
   * 后端该接口按会员维度返回「发起 + 收到」的全部记录，故筛完再分页；
   * 分页数按筛后条数算，避免翻到空页。
   */
  const source = memberId ? String(memberId) : "";
  const filtered = rows.filter((row) => {
    if (!source) return true;
    return sub === "out" ? String(row.from_user_id) === source : String(row.to_user_id) === source;
  });

  const outCount = rows.filter((row) => String(row.from_user_id) === source).length;
  const inCount = rows.filter((row) => String(row.to_user_id) === source).length;
  /**
   * 展示条数口径：后端 total 是「Ta发起 + 向Ta发起」的合计，与子 Tab 的单一方向不一致，
   * 故按当前方向统计；未筛到任何方向记录时（字段缺失等）退回后端 total 兜底。
   */
  const directionalCount = sub === "out" ? outCount : inCount;
  const shownTotal = directionalCount > 0 ? directionalCount : total;
  const pageCount = Math.max(1, Math.ceil(shownTotal / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => { setPage(1); }, [sub]);

  const quotaText = quotaFailed
    ? "牵线剩余次数：-"
    : quota
      ? `牵线剩余次数：${dataValue(quota.available_count)}`
      : "牵线剩余次数：…";

  return (
    <>
      <div className="mdt-line-head">
        <div className="mdt-subtabs" style={{ border: 0, margin: 0 }}>
          {[
            ["out", "Ta发起的"],
            ["in", "向Ta发起的"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={"mdt-subtab" + (sub === key ? " active" : "")}
              onClick={() => onSub(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="mdt-line-left">{quotaText}</span>
      </div>
      <ApiState loading={listLoading} error={listError}>
        {pageRows.length === 0 ? (
          <Empty text="暂无牵线记录" />
        ) : (
          <>
            <table className="mdt-table">
              <thead>
                <tr>
                  {["牵线会员", "牵线时间", "牵线状态", "操作"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((record, index) => (
                  <tr key={String(record.id ?? index)}>
                    <td>{dataValue(record.target_nickname)}</td>
                    <td>{dataValue(record.created_at)}</td>
                    <td>{matchApplyStatus(record.status)}</td>
                    <td>{dataValue(record.responded_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mdt-pager">
              <span className="mdt-pager-total">共 {shownTotal} 条</span>
              <button
                type="button"
                className="au-page-btn"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <i className="au-chevron left" />
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === pageCount || Math.abs(n - safePage) <= 1)
                .map((n, i, arr) => (
                  <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {i > 0 && arr[i - 1] !== n - 1 && <span className="mdt-pager-total">…</span>}
                    <button
                      type="button"
                      className={"au-page-num" + (n === safePage ? " active" : "")}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  </span>
                ))}
              <button
                type="button"
                className="au-page-btn"
                disabled={safePage >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                <i className="au-chevron right" />
              </button>
            </div>
          </>
        )}
      </ApiState>
    </>
  );
}

/** 约会状态中文名；与后端 meeting_record.status 枚举一一对应 */
const DATING_STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "待见面",
  REMINDED: "已提醒",
  CHECKED_IN: "已见面",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
  NO_SHOW: "未见面",
};
/** 会员维度约会记录分组：与后端 status_group 取值一致 */
const DATING_GROUPS: { key: string; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "waiting", label: "待见面" },
  { key: "not_met", label: "未见面" },
  { key: "met", label: "成功见面" },
];

/**
 * 会员详情「约会记录」。
 * 该接口支持 status_group 服务端分组，故本组件自持分页：
 * 切换分组时重新拉第 1 页，翻页只影响当前分组。
 */
function DatingTab({ memberId }: { memberId: number | string }) {
  const pageSize = 20;
  const [group, setGroup] = useState("all");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<MemberDatingRecordItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (targetGroup: string, targetPage: number) => {
    if (!memberId) return;
    setLoading(true);
    setError("");
    try {
      const res = await adminEndpoints.memberDatingRecords(memberId, {
        page: targetPage,
        page_size: pageSize,
        status_group: targetGroup,
      });
      setRows(Array.isArray(res?.items) ? res.items : []);
      setTotal(Number(res?.total ?? 0));
      setPage(targetPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "约会记录加载失败");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 切换会员或分组时回到第 1 页
  useEffect(() => {
    void load(group, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId, group]);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);

  /** 谁是「对方」：约会记录同时包含本人作为发起方或接收方的行 */
  const otherName = (record: MemberDatingRecordItem) => {
    const self = String(memberId);
    return String(record.from_user_id) === self
      ? `${dataValue(record.to_nickname)}（编号：${record.to_user_id}）`
      : `${dataValue(record.from_nickname)}（编号：${record.from_user_id}）`;
  };

  return (
    <>
      <div className="mdt-line-head">
        <div className="mdt-subtabs" style={{ border: 0, margin: 0 }}>
          {DATING_GROUPS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={"mdt-subtab" + (group === item.key ? " active" : "")}
              onClick={() => setGroup(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {total > 0 && <span className="mdt-line-left">共 {total} 条</span>}
      </div>
      <ApiState loading={loading} error={error}>
        {rows.length === 0 ? (
          <Empty text="暂无约会记录" />
        ) : (
          <>
            <table className="mdt-table">
              <thead>
                <tr>
                  {["约会时间", "见谁", "见面地点", "状态", "取消原因"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((record, index) => (
                  <tr key={String(record.id ?? index)}>
                    <td>{dataValue(record.scheduled_at)}</td>
                    <td>{otherName(record)}</td>
                    <td>{dataValue(record.location)}</td>
                    <td>{DATING_STATUS_LABEL[String(record.status)] ?? dataValue(record.status)}</td>
                    <td>{dataValue(record.cancel_reason)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pageCount > 1 && (
              <div className="mdt-pager">
                <span className="mdt-pager-total">共 {total} 条</span>
                <button
                  type="button"
                  className="au-page-btn"
                  disabled={safePage <= 1}
                  onClick={() => void load(group, Math.max(1, safePage - 1))}
                >
                  <i className="au-chevron left" />
                </button>
                {Array.from({ length: pageCount }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === pageCount || Math.abs(n - safePage) <= 1)
                  .map((n, i, arr) => (
                    <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {i > 0 && arr[i - 1] !== n - 1 && <span className="mdt-pager-total">…</span>}
                      <button
                        type="button"
                        className={"au-page-num" + (n === safePage ? " active" : "")}
                        onClick={() => void load(group, n)}
                      >
                        {n}
                      </button>
                    </span>
                  ))}
                <button
                  type="button"
                  className="au-page-btn"
                  disabled={safePage >= pageCount}
                  onClick={() => void load(group, Math.min(pageCount, safePage + 1))}
                >
                  <i className="au-chevron right" />
                </button>
              </div>
            )}
          </>
        )}
      </ApiState>
    </>
  );
}

function ActivitiesTab({ data, loading, error }: { data: DetailData | DetailData[]; loading: boolean; error: string }) {
  const records = dataItems(data);
  return (
    <>
      <Notice>该会员报名参加过下面的活动，方便红娘跟进回访</Notice>
      <table className="mdt-table" style={{ marginTop: 12 }}>
        <thead>
          <tr>
            {["报名时间", "报名活动"].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
      </table>
      <ApiState loading={loading} error={error}>{records.length === 0 ? <Empty /> : <table className="mdt-table"><tbody>{records.map((record, index) => <tr key={String(record.id ?? index)}><td>{dataValue(record.created_at ?? record.signup_at)}</td><td>{dataValue(record.activity_name ?? record.name ?? record.title)}</td></tr>)}</tbody></table>}</ApiState>
    </>
  );
}

/** 线上行为 8 个子 Tab：4 类 × 发出 / 收到 */
const BEHAVIOR_SUBS: { key: string; label: string; peer: "target" | "user"; peerLabel: string }[] = [
  { key: "viewed", label: "浏览过谁", peer: "target", peerLabel: "浏览了谁" },
  { key: "viewedBy", label: "被谁浏览", peer: "user", peerLabel: "浏览人" },
  { key: "favorite", label: "收藏了谁", peer: "target", peerLabel: "收藏了谁" },
  { key: "favoriteGot", label: "谁收藏我", peer: "user", peerLabel: "收藏人" },
  { key: "liked", label: "给谁爆灯", peer: "target", peerLabel: "爆灯对象" },
  { key: "likedBy", label: "谁给Ta爆灯", peer: "user", peerLabel: "爆灯人" },
  { key: "gift", label: "赠送礼物", peer: "target", peerLabel: "赠送对象" },
  { key: "giftGot", label: "收到礼物", peer: "user", peerLabel: "赠送人" },
];

/** 每个子 Tab 对应的方向化接口，member_id 由组件内部注入 */
const BEHAVIOR_LOADERS: Record<
  string,
  (memberId: number | string, query: AdminListQuery) => Promise<MemberBehaviorPage>
> = {
  viewed: (id, query) => adminEndpoints.behaviorBrowseHistory({ ...query, member_id: id }),
  viewedBy: (id, query) => adminEndpoints.behaviorVisitors({ ...query, member_id: id }),
  favorite: (id, query) => adminEndpoints.behaviorFavorites({ ...query, member_id: id }),
  favoriteGot: (id, query) => adminEndpoints.behaviorFavoritesReceived({ ...query, member_id: id }),
  liked: (id, query) => adminEndpoints.behaviorSuperlikes({ ...query, member_id: id }),
  likedBy: (id, query) => adminEndpoints.behaviorSuperlikesReceived({ ...query, member_id: id }),
  gift: (id, query) => adminEndpoints.behaviorGifts({ ...query, member_id: id }),
  giftGot: (id, query) => adminEndpoints.behaviorGiftsReceived({ ...query, member_id: id }),
};

const BEHAVIOR_TIME_LABEL: Record<string, string> = {
  viewed: "浏览时间",
  viewedBy: "浏览时间",
  favorite: "收藏时间",
  favoriteGot: "收藏时间",
  liked: "爆灯时间",
  likedBy: "爆灯时间",
  gift: "赠送时间",
  giftGot: "收到时间",
};

/**
 * 会员详情「线上行为」。
 *
 * 「发出」类接口（浏览过谁/收藏了谁/给谁爆灯/赠送礼物）返回的 user_id 是本人；
 * 「收到」类接口（被谁浏览/谁收藏我/谁给Ta爆灯/收到礼物）返回的 user_id 是**行为发起人**，
 * target_user_id 才是本人。所以「对方是谁」要按方向取不同字段，见 peerText()。
 */
function BehaviorTab({ memberId, sub, onSub }: { memberId: number | string; sub: string; onSub: (key: string) => void }) {
  const pageSize = 20;
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<MemberBehaviorItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (targetSub: string, targetPage: number) => {
    const loader = BEHAVIOR_LOADERS[targetSub];
    if (!memberId || !loader) return;
    setLoading(true);
    setError("");
    try {
      const res = await loader(memberId, { page: targetPage, page_size: pageSize });
      setRows(Array.isArray(res?.items) ? res.items : []);
      setTotal(Number(res?.total ?? 0));
      setPage(targetPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "线上行为加载失败");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 切换会员或子 Tab 时回到第 1 页
  useEffect(() => {
    void load(sub, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId, sub]);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);

  const meta = BEHAVIOR_SUBS.find((item) => item.key === sub) ?? BEHAVIOR_SUBS[0];
  const timeLabel = BEHAVIOR_TIME_LABEL[meta.key] ?? "时间";
  const isBrowse = meta.key === "viewed" || meta.key === "viewedBy";
  const isFavorite = meta.key === "favorite" || meta.key === "favoriteGot";
  const isSuperlike = meta.key === "liked" || meta.key === "likedBy";

  /** 对方是谁：发出类取 target_*，收到类取发起人 user_* */
  const peerText = (record: MemberBehaviorItem) => {
    const nick = meta.peer === "user" ? record.nickname : record.target_nickname;
    const code = meta.peer === "user" ? record.member_code : record.target_member_code;
    const id = meta.peer === "user" ? record.user_id : record.target_user_id;
    return `${nick || "—"}（编号：${code || id || "—"}）`;
  };

  const headers = isBrowse
    ? [meta.peerLabel, "第几次浏览", timeLabel]
    : isFavorite
      ? [meta.peerLabel, timeLabel]
      : isSuperlike
        ? [meta.peerLabel, "支付金额", "支付状态", "支付方式", "订单号", "状态", timeLabel]
        : ["礼物", "数量", meta.peerLabel, "消耗积分", "实付金额", "奖励积分", "支付状态", timeLabel];

  const renderRow = (record: MemberBehaviorItem, index: number) => (
    <tr key={String(record.event_id ?? index)}>
      {isBrowse && (
        <>
          <td>{peerText(record)}</td>
          <td>第{record.browse_times ?? 1}次</td>
          <td>{dataValue(record.occurred_at)}</td>
        </>
      )}
      {isFavorite && (
        <>
          <td>{peerText(record)}</td>
          <td>{dataValue(record.occurred_at)}</td>
        </>
      )}
      {isSuperlike && (
        <>
          <td>{peerText(record)}</td>
          <td>{dataValue(record.amount)}</td>
          <td>{dataValue(record.pay_status_label)}</td>
          <td>{dataValue(record.pay_method)}</td>
          <td>{dataValue(record.order_no)}</td>
          <td>{dataValue(record.event_status_label)}</td>
          <td>{dataValue(record.occurred_at)}</td>
        </>
      )}
      {!isBrowse && !isFavorite && !isSuperlike && (
        <>
          <td>{dataValue(record.gift_name)}</td>
          <td>{`${dataValue(record.gift_qty)}${record.qty_unit ?? ""}`}</td>
          <td>{peerText(record)}</td>
          <td>{dataValue(record.point_cost)}</td>
          <td>{dataValue(record.paid_amount)}</td>
          <td>{dataValue(record.reward_points)}</td>
          <td>{dataValue(record.pay_status_label)}</td>
          <td>{dataValue(record.occurred_at)}</td>
        </>
      )}
    </tr>
  );

  return (
    <>
      <div className="mdt-line-head">
        <div className="mdt-subtabs" style={{ border: 0, margin: 0, flexWrap: "wrap" }}>
          {BEHAVIOR_SUBS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={"mdt-subtab" + (sub === item.key ? " active" : "")}
              onClick={() => onSub(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {total > 0 && <span className="mdt-line-left">共 {total} 条</span>}
      </div>
      <ApiState loading={loading} error={error}>
        {rows.length === 0 ? (
          <Empty text="暂无线上行为记录" />
        ) : (
          <>
            <table className="mdt-table">
              <thead>
                <tr>
                  {headers.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{rows.map(renderRow)}</tbody>
            </table>
            {pageCount > 1 && (
              <div className="mdt-pager">
                <span className="mdt-pager-total">共 {total} 条</span>
                <button
                  type="button"
                  className="au-page-btn"
                  disabled={safePage <= 1}
                  onClick={() => void load(sub, Math.max(1, safePage - 1))}
                >
                  <i className="au-chevron left" />
                </button>
                {Array.from({ length: pageCount }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === pageCount || Math.abs(n - safePage) <= 1)
                  .map((n, i, arr) => (
                    <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {i > 0 && arr[i - 1] !== n - 1 && <span className="mdt-pager-total">…</span>}
                      <button
                        type="button"
                        className={"au-page-num" + (n === safePage ? " active" : "")}
                        onClick={() => void load(sub, n)}
                      >
                        {n}
                      </button>
                    </span>
                  ))}
                <button
                  type="button"
                  className="au-page-btn"
                  disabled={safePage >= pageCount}
                  onClick={() => void load(sub, Math.min(pageCount, safePage + 1))}
                >
                  <i className="au-chevron right" />
                </button>
              </div>
            )}
          </>
        )}
      </ApiState>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 超级管理                                                            */
/* ------------------------------------------------------------------ */

/** 认证状态 4 档；**数组下标即接口枚举值**（0 未提交 / 1 审核中 / 2 已通过 / 3 未通过） */
const CERT_STATUS_OPTIONS = ["未认证", "待审核", "已认证", "认证失败"];
/** 认证枚举值 → 界面文案；非法值返回空串（空串表示「未选择 / 不修改」） */
const certStatusLabel = (value: unknown) => {
  const index = Number(value);
  return Number.isInteger(index) && index >= 0 && index < CERT_STATUS_OPTIONS.length ? CERT_STATUS_OPTIONS[index] : "";
};
/** 界面文案 → 认证枚举值 */
const certStatusValue = (label: string) => CERT_STATUS_OPTIONS.indexOf(label);

function SuperTab({
  memberId,
  profile,
  realnameReview,
  topRecommend,
  newRecommend,
  onTopRecommend,
  onNewRecommend,
}: {
  memberId: number;
  profile: DetailData;
  realnameReview: RealnameReviewItem | null;
  topRecommend: boolean;
  newRecommend: boolean;
  onTopRecommend: (value: boolean) => void;
  onNewRecommend: (value: boolean) => void;
}) {
  /* ── 认证类字段 → PATCH /admin/members/{id}/profile ──────────────── */
  const [authStatus, setAuthStatus] = useState("");
  const [houseStatus, setHouseStatus] = useState("");
  const [eduStatus, setEduStatus] = useState("");
  const [singlePledge, setSinglePledge] = useState("");
  const [realName, setRealName] = useState("");
  const [profileReason, setProfileReason] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  /** 各字段的已加载原值，用于 diff：**只提交真正改动过的字段**，未改的不发、后端也就不会动 */
  const [initial, setInitial] = useState({ authStatus: "", houseStatus: "", eduStatus: "", realName: "" });

  /* ── 牵线次数 → PATCH /admin/members/{id}/match-quota ───────────── */
  const [quota, setQuota] = useState<MemberMatchQuota | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(true);
  const [quotaCount, setQuotaCount] = useState("");
  const [quotaReason, setQuotaReason] = useState("");
  const [savingQuota, setSavingQuota] = useState(false);
  const [quotaMessage, setQuotaMessage] = useState("");
  const [quotaError, setQuotaError] = useState("");

  /** 认证详情（房产/学历）与牵线次数互不依赖，并行拉取 */
  useEffect(() => {
    if (!memberId) return;
    let cancelled = false;
    void adminEndpoints
      .memberCertifications(memberId)
      .then((result) => {
        if (cancelled) return;
        const house = certStatusLabel(result?.house?.status);
        const education = certStatusLabel(result?.education?.status);
        setHouseStatus(house);
        setEduStatus(education);
        setInitial((prev) => ({ ...prev, houseStatus: house, eduStatus: education }));
      })
      .catch(() => {
        /* 认证详情取不到时置空即可：空值在提交阶段被当作「不修改」 */
      });
    void adminEndpoints
      .memberMatchQuota(memberId)
      .then((result) => {
        if (cancelled) return;
        setQuota(result);
        setQuotaCount(String(result.available_count));
      })
      .catch((error: unknown) => {
        if (!cancelled) setQuotaError(error instanceof Error ? error.message : "剩余次数加载失败");
      })
      .finally(() => {
        if (!cancelled) setQuotaLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [memberId]);

  /* 实名认证状态来自会员详情，姓名来自实名审核记录 */
  useEffect(() => {
    const label = certStatusLabel(profile.auth_status);
    setAuthStatus(label);
    setInitial((prev) => ({ ...prev, authStatus: label }));
  }, [profile.auth_status]);

  useEffect(() => {
    const name = realnameReview?.real_name ?? "";
    setRealName(name);
    setInitial((prev) => ({ ...prev, realName: name }));
  }, [realnameReview]);

  const submitProfile = async () => {
    if (!memberId) return;
    const reason = profileReason.trim();
    if (!reason) {
      setProfileError("请填写修改理由");
      setProfileMessage("");
      return;
    }
    const body: MemberProfileUpdatePayload = { reason };
    // 界面值为空 = 用户没动这个字段；与原值相同也不提交
    if (authStatus && authStatus !== initial.authStatus) body.auth_status = certStatusValue(authStatus) as 0 | 1 | 2 | 3;
    if (houseStatus && houseStatus !== initial.houseStatus) body.house_verified = certStatusValue(houseStatus) as 0 | 1 | 2 | 3;
    if (eduStatus && eduStatus !== initial.eduStatus) body.education_verified = certStatusValue(eduStatus) as 0 | 1 | 2 | 3;
    if (singlePledge) body.is_single_pledge = singlePledge === "是";
    if (realName.trim() && realName.trim() !== initial.realName) body.real_name = realName.trim();
    if (Object.keys(body).length <= 1) {
      setProfileError("没有需要提交的修改");
      setProfileMessage("");
      return;
    }
    setSavingProfile(true);
    setProfileError("");
    setProfileMessage("");
    try {
      const result = await adminEndpoints.updateMemberProfile(memberId, body);
      setProfileMessage(`已保存，本次修改 ${result.updated_fields.length} 项：${result.updated_fields.join("、")}`);
      setInitial({ authStatus, houseStatus, eduStatus, realName: realName.trim() });
      setProfileReason("");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "保存失败，请稍后重试");
    } finally {
      setSavingProfile(false);
    }
  };

  const submitQuota = async () => {
    if (!memberId) return;
    const count = Number(quotaCount);
    if (quotaCount.trim() === "" || !Number.isInteger(count) || count < 0 || count > 1000000) {
      setQuotaError("剩余次数需为 0-1000000 的整数");
      setQuotaMessage("");
      return;
    }
    const reason = quotaReason.trim();
    if (!reason) {
      setQuotaError("请填写修改理由");
      setQuotaMessage("");
      return;
    }
    setSavingQuota(true);
    setQuotaError("");
    setQuotaMessage("");
    try {
      const result = await adminEndpoints.updateMemberMatchQuota(memberId, { available_count: count, reason });
      setQuota(result);
      setQuotaCount(String(result.available_count));
      setQuotaReason("");
      setQuotaMessage(`已保存：剩余 ${result.available_count} 次（已用 ${result.used_count} 次、已退 ${result.refunded_count} 次）`);
    } catch (error) {
      setQuotaError(error instanceof Error ? error.message : "保存失败，请稍后重试");
    } finally {
      setSavingQuota(false);
    }
  };

  return (
    <div className="mdt-stack">
      <Field label="账号绑定" required>
        <span className="mdt-bind">
          <span className="mdt-bind-tag">
            Lemon
            <X className="size-3" />
          </span>
          <button type="button" className="mdt-link">
            <Pencil className="mr-1 inline size-3" />
            编辑
          </button>
        </span>
      </Field>
      <Notice>客户可以使用此账号登录平台</Notice>

      <div className="mdt-switch-row">
        <span className="mdt-switch-label">置顶推荐</span>
        <button
          type="button"
          className={"mdt-switch" + (topRecommend ? " on" : "")}
          onClick={() => onTopRecommend(!topRecommend)}
          aria-pressed={topRecommend}
        />
        <span className="mdt-switch-text">开启</span>
      </div>

      <div className="mdt-switch-row">
        <span className="mdt-switch-label">新人推荐</span>
        <button
          type="button"
          className={"mdt-switch" + (newRecommend ? " on" : "")}
          onClick={() => onNewRecommend(!newRecommend)}
          aria-pressed={newRecommend}
        />
        <span className="mdt-switch-text">开启</span>
      </div>

      <div className="mdt-super-row">
        <span className="mdt-label">实名认证</span>
        <span className="mdt-control" style={{ flexWrap: "wrap" }}>
          <Radios name="mdt-super-real" options={CERT_STATUS_OPTIONS} value={authStatus} onChange={setAuthStatus} />
          {/* 地区与身份证号这两个接口未覆盖，保持占位展示 */}
          <Sel value="中国大陆" options={["中国大陆", "中国香港", "中国澳门", "中国台湾"]} />
          <span className="mdt-inline-label">
            <b>*</b>实名信息
          </span>
          <Inp value={realnameReview?.id_card_masked ?? ""} readOnly />
          <span className="mdt-inline-label">姓名</span>
          <Inp value={realName} onChange={setRealName} placeholder="实名姓名" />
        </span>
      </div>

      <div className="mdt-super-row">
        <span className="mdt-label">房产认证</span>
        <Radios name="mdt-super-house" options={CERT_STATUS_OPTIONS} value={houseStatus} onChange={setHouseStatus} />
      </div>

      <div className="mdt-super-row">
        <span className="mdt-label">学历认证</span>
        <Radios name="mdt-super-edu" options={CERT_STATUS_OPTIONS} value={eduStatus} onChange={setEduStatus} />
      </div>

      <div className="mdt-super-row">
        <span className="mdt-label">单身承诺</span>
        {/* 接口字段 is_single_pledge 是布尔，因此这里用「否 / 是」两档 */}
        <Radios name="mdt-super-promise" options={["否", "是"]} value={singlePledge} onChange={setSinglePledge} />
      </div>

      <div className="mdt-super-row">
        <span className="mdt-label">线上VIP</span>
        <Radios
          name="mdt-super-online-vip"
          options={["普通会员", "VIP-新人专享", "VIP-心动专享", "VIP-臻爱专享"]}
          value="普通会员"
        />
      </div>

      <div className="mdt-super-row">
        <span className="mdt-label">线下VIP</span>
        <Radios name="mdt-super-offline-vip" options={["不是", "是"]} value="不是" />
      </div>
      <Notice>指已前往您线下门店签约购买高端服务的会员</Notice>

      <div className="mdt-super-row">
        <span className="mdt-label">牵线剩余</span>
        <span className="mdt-control" style={{ flexWrap: "wrap", gap: 12 }}>
          <span className="mdt-none">{quotaLoading ? "加载中…" : quota ? `当前 ${quota.available_count} 次` : "—"}</span>
          {/* 有效期这两个接口未覆盖，保持占位展示 */}
          <span className="mdt-inline-label">有效期至:</span>
          <Inp value="2026-09-02" type="date" />
          {/* 接口语义是「直接设置剩余次数」，因此用「设为」而不是「增加」 */}
          <span className="mdt-inline-label">设为</span>
          <Inp value={quotaCount} onChange={setQuotaCount} placeholder="0" />
          <span className="mdt-none">次</span>
          <Inp value={quotaReason} onChange={setQuotaReason} placeholder="填写理由，必填" />
          <button
            type="button"
            className="mdt-submit"
            style={{ marginTop: 0, height: 32, padding: "0 14px" }}
            disabled={savingQuota || quotaLoading}
            onClick={() => void submitQuota()}
          >
            {savingQuota ? "保存中…" : "保存次数"}
          </button>
          <button type="button" className="mdt-link">
            历史明细
          </button>
        </span>
      </div>
      {quotaError ? <Notice>次数保存失败：{quotaError}</Notice> : null}
      {quotaMessage ? <Notice>{quotaMessage}</Notice> : null}

      <div className="mdt-super-row">
        <span className="mdt-label">隐私设置</span>
        <label className="mdt-check">
          <input type="checkbox" defaultChecked />
          对非相亲会员显示头像
        </label>
      </div>

      <Field label="显示排序">
        <Inp value="0" />
      </Field>
      <Notice>数字越大显示越靠前</Notice>

      <Field label="推广红娘">
        <Inp placeholder="请输入推广红娘账号昵称" />
      </Field>
      <Notice>
        设置推广红娘后，该会员将计入到该推广红娘名下，如果该会员是审核通过状态，则自动在此刻给予注册奖励，若是未通过状态，则在下面的收费期都会给予该红娘相应的分成
      </Notice>

      {/* 认证类字段统一提交：PATCH /admin/members/{id}/profile */}
      <Field label="修改理由" required>
        <Inp value={profileReason} onChange={setProfileReason} placeholder="填写本次修改理由，必填" />
      </Field>
      {profileError ? <Notice>提交失败：{profileError}</Notice> : null}
      {profileMessage ? <Notice>{profileMessage}</Notice> : null}
      <button type="button" className="mdt-submit" style={{ marginTop: 18 }} disabled={savingProfile} onClick={() => void submitProfile()}>
        {savingProfile ? "提交中…" : "确定提交"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 信息溯源                                                            */
/* ------------------------------------------------------------------ */

function SourceTab({ data, loading, error }: { data: DetailData | DetailData[]; loading: boolean; error: string }) {
  const items = dataItems(data).map((item) => [dataValue(item.created_at ?? item.occurred_at ?? item.time), dataValue(item.content ?? item.action ?? item.remark ?? item.detail)]);
  return (
    <>
      <Notice>信息溯源记录了本条会员信息从录入、审核、红娘变更、意向变更等行为的变动记录。</Notice>
      <ApiState loading={loading} error={error}>
      {items.length === 0 ? <Empty /> : <div className="mdt-timeline" style={{ marginTop: 22 }}>
        {items.map(([time, text], index) => (
          <div key={`${time}-${index}`} className="mdt-tl-item">
            <span className="mdt-tl-dot" />
            <div className="mdt-tl-time">{time}</div>
            <div className="mdt-tl-text">{text}</div>
          </div>
        ))}
      </div>}
      </ApiState>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 制作/下载嘉宾信息卡                                                  */
/* ------------------------------------------------------------------ */

function GuestCardSheet({ onClose, nickname }: { onClose: () => void; nickname: string }) {
  const fields = [
    "编号",
    "性别",
    "姓名",
    "出生",
    "属相",
    "星座",
    "身高",
    "体重",
    "学历",
    "工作",
    "收入",
    "家乡",
    "现居",
    "民族",
    "信仰",
    "性格",
    "爱好",
    "父母婚况",
    "家庭结构",
    "是否独生",
    "家中排行",
  ];
  const [hidden, setHidden] = useState<string[]>([]);
  return (
    <div className="mdt-gc-mask">
      <div className="mdt-gc">
        <div className="mdt-gc-head">
          <div className="mdt-head-left">
            <button type="button" className="mdt-head-x" onClick={onClose} aria-label="关闭">
              <X className="size-5" />
            </button>
            <h2 className="mdt-head-title">制作/下载嘉宾信息卡</h2>
          </div>
          <button type="button" className="mdt-submit">
            下载保存
          </button>
        </div>

        <div className="mdt-gc-notice">
          <Info className="size-3.5" />
          <span>在线为该嘉宾制作一张专属的服务信息卡，用于1对1服务场景用途。</span>
          <button type="button" className="mdt-link">
            <Eye className="mr-1 inline size-3.5" />
            效果预览
          </button>
        </div>

        <div className="mdt-gc-body">
          <div className="mdt-gc-left">
            <div className="mdt-gc-photo">
              <span>请在下面的相册选择或上传一张照片</span>
              <span className="mdt-gc-photo-sub">宽度大于1140px</span>
              <span className="mdt-gc-photo-sub">高度大于1584px</span>
            </div>
            <button type="button" className="mdt-upload" style={{ marginTop: 14 }}>
              <Plus className="size-5" />
              上传图片
            </button>
          </div>

          <div className="mdt-gc-card">
            <div className="mdt-gc-paper">
              <div className="mdt-gc-paper-head">
                <span>{nickname}</span>
                <span className="mdt-gc-code">编号：B965945</span>
              </div>
              <div className="mdt-gc-real">人脸实名</div>

              <div className="mdt-gc-sec">💜 个人情况</div>
              <div className="mdt-gc-row">性别: 男</div>
              <div className="mdt-gc-row">婚况: 未婚</div>
              <div className="mdt-gc-row">姓名: 薛*乐</div>
              <div className="mdt-gc-row">出生: 1990年01月</div>
              <div className="mdt-gc-row">属相: 马</div>
              <div className="mdt-gc-row">星座: Capricorn</div>
              <div className="mdt-gc-row">身高: 175cm</div>
              <div className="mdt-gc-row">体重: 65kg</div>
              <div className="mdt-gc-row">学历: 大专</div>
              <div className="mdt-gc-row">工作: 不限</div>
              <div className="mdt-gc-row">收入: 8千-1万元</div>
              <div className="mdt-gc-row">家乡: 江苏省南京市</div>
              <div className="mdt-gc-row">现居: 江苏省南京市</div>
              <div className="mdt-gc-row">民族: 汉族</div>
              <div className="mdt-gc-row">信仰: 无宗教信仰</div>
              <div className="mdt-gc-row">性格: -</div>
              <div className="mdt-gc-row">爱好: -</div>

              <div className="mdt-gc-sec">💜 原生家庭</div>
              <div className="mdt-gc-row">父母婚况: 未知</div>
              <div className="mdt-gc-row">家庭结构: 未知</div>
              <div className="mdt-gc-row">是否独生: 未知</div>
              <div className="mdt-gc-row">家中排行: 未知</div>

              <div className="mdt-gc-foot">
                「内部资料，谢绝外传」
                <span>— 宣爱壹 —</span>
              </div>
            </div>
          </div>

          <div className="mdt-gc-right">
            {fields.map((field) => {
              const off = hidden.includes(field);
              return (
                <div key={field} className="mdt-gc-field">
                  <span>{field}</span>
                  <button
                    type="button"
                    className={"mdt-pill" + (off ? " off" : "")}
                    onClick={() =>
                      setHidden((current) =>
                        off ? current.filter((v) => v !== field) : [...current, field],
                      )
                    }
                  >
                    {off ? "隐藏" : "显示"}
                  </button>
                </div>
              );
            })}
            <textarea
              className="mdt-textarea"
              style={{ minHeight: 90, marginTop: 10 }}
              placeholder="自定义重点介绍文案，100字以内"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 资料海报                                                            */
/* ------------------------------------------------------------------ */

function PosterSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="mdt-poster-mask">
      <div className="mdt-poster">
        <div className="mdt-poster-head">
          <div className="mdt-head-left">
            <ArrowLeft className="size-4" />
            <h2 className="mdt-head-title">会员资料海报</h2>
          </div>
          <div className="mdt-head-actions">
            <UserRound className="size-4 text-[#666]" />
            <Menu className="size-4 text-[#666]" />
            <button type="button" className="mdt-btn mdt-btn-plain" onClick={onClose}>
              关闭
            </button>
          </div>
        </div>
        <div className="mdt-poster-body">
          <div className="mdt-poster-title">请选择您喜欢的样式</div>
          <div className="mdt-poster-grid">
            {["风格1", "风格2"].map((style, index) => (
              <div key={style} className="mdt-poster-card">
                <div className="mdt-poster-name">{index === 0 ? "嘉宾资料" : "真诚觅缘"}</div>
                <div className="mdt-poster-photo">嘉宾照片</div>
                <div className="mdt-poster-line">
                  大专学历，未婚，身高163cm、体重52kg、私企员工，年收入10万元左右，南京市栖霞区…
                </div>
                <div className="mdt-poster-name" style={{ marginTop: 10 }}>
                  {style}
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="mdt-poster-confirm">
            确认选择
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 编辑销售匹配库 Drawer                                               */
/* ------------------------------------------------------------------ */

function LibraryDrawer({ onClose, nickname }: { onClose: () => void; nickname: string }) {
  const [smart, setSmart] = useState(false);
  return (
    <div className="mdt-drawer-mask">
      <div className="mdt-drawer">
        <div className="mdt-head">
          <div className="mdt-head-left">
            <button type="button" className="mdt-head-x" onClick={onClose} aria-label="关闭">
              <X className="size-5" />
            </button>
            <h2 className="mdt-head-title">编辑销售匹配库</h2>
          </div>
          <div className="mdt-head-actions">
            <button type="button" className="mdt-btn mdt-btn-plain" onClick={onClose}>
              取消
            </button>
            <button type="button" className="mdt-submit">
              确定提交
            </button>
          </div>
        </div>

        <div className="mdt-drawer-body">
          <Field label="页面标题" required>
            <Inp placeholder="最多20汉字" />
          </Field>
          <Field label="分享描述">
            <Inp placeholder="请输入分享描述" />
          </Field>
          <Field label="客户性别">
            <Radios name="mdt-lib-gender" options={["男性", "女性"]} value="男性" />
          </Field>
          <Field label="账号昵称">
            <span className="mdt-bind-tag">
              {nickname}
              <X className="size-3" />
            </span>
          </Field>
          <Notice>
            指本客户在平台中已注册的账号昵称，关联后系统默认根据其择偶条件三要素进行智能匹配，若未注册可留空
            <br />
            绑定用户账号之后，姻缘库仅该用户和所属红娘微信登录后可以操作，未绑定的情况下任何人进入该页面均可操作
          </Notice>

          <Field label="智能匹配" required>
            <button
              type="button"
              className={"mdt-switch" + (smart ? " on" : "")}
              onClick={() => setSmart((v) => !v)}
              aria-pressed={smart}
            />
            <span className="mdt-switch-text">开启本功能后，系统将按照下面的条件筛选显示（不含已脱单会员）</span>
          </Field>

          <Field label="销售红娘" required>
            <Sel placeholder="请选择销售红娘" options={["芸希老师", "琴琴", "齐老师"]} />
          </Field>
          <Field label="选人上限" required>
            <Inp value="10" />
          </Field>
          <Notice>该客户最多可以选择的姻缘人选的数量限制</Notice>

          <Field label="状态">
            <Radios name="mdt-lib-status" options={["已到店", "未到店"]} value="未到店" />
          </Field>

          <Field label="温馨提示">
            <textarea className="mdt-textarea" style={{ minHeight: 80 }} placeholder="请输入温馨提示" />
          </Field>
          <Notice>这是前端进入到该匹配库时页面中弹出的提示（弹窗关闭后不再显示）</Notice>

          <button type="button" className="mdt-submit" style={{ marginTop: 16 }}>
            确定提交
          </button>
        </div>
      </div>
    </div>
  );
}
