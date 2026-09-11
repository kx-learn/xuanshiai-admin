"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Image as ImageIcon,
  Inbox,
  Plus,
  Search,
  Settings,
  X,
} from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type {
  AuthTypeItem,
  CommitmentReviewItem,
  EducationReviewItem,
  HouseReviewItem,
  MarriageReviewItem,
  MemberAuthKind,
  OtherReviewItem,
  RealnameReviewItem,
  RealnameStats,
  MarriageStats,
} from "@/lib/admin-endpoints";
import { showConfigToast, pickAndUploadImage, asStr, asBool } from "@/lib/platform-config";
import type { Dict } from "@/lib/platform-config";
import { resolveMediaUrl } from "@/lib/admin-api";
import MemberQuickProfileDrawer from "@/components/MemberQuickProfileDrawer";

type AuthTab = "realname" | "commitment" | "marriage" | "house" | "education" | "other";

const tabs: { key: AuthTab; label: string }[] = [
  { key: "realname", label: "实名认证" },
  { key: "commitment", label: "会员承诺" },
  { key: "marriage", label: "婚姻状况" },
  { key: "house", label: "房产认证" },
  { key: "education", label: "学历认证" },
  { key: "other", label: "其他认证" },
];

/* 状态 Tab 中文标签 → 后端 status 枚举 */
const statusApi = (kind: AuthTab, ui: string): string => {
  if (kind === "realname") return ui === "认证成功" ? "success" : ui === "认证失败" ? "fail" : "all";
  if (kind === "marriage")
    return ui === "已婚" ? "married" : ui === "无登记信息" ? "no_record" : ui === "离异" ? "divorced" : "all";
  if (ui === "通过") return "pass";
  if (ui === "待审") return "pending";
  if (ui === "未通过") return "fail";
  return "all";
};

/* 时间格式化：ISO -> YYYY-MM-DD HH:mm:ss（与 UI 原占位一致） */
const fmtDateTime = (v: string | null | undefined): string => {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

/* 审核结果徽标（pass/pending/fail） */
const statusMap: Record<string, { label: string; cls: string }> = {
  pass: { label: "通过", cls: "uath-badge pass" },
  pending: { label: "待审", cls: "uath-badge pending" },
  fail: { label: "未通过", cls: "uath-badge fail" },
};

function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <div className="uath-empty">
          <Inbox className="uath-empty-icon" strokeWidth={1.2} />
          <span>暂无数据</span>
        </div>
      </td>
    </tr>
  );
}

/* ---------- 通用筛选行 ---------- */
function FilterRow({
  statusTabs,
  active,
  onStatus,
  placeholder,
  showType,
  typeValue,
  onTypeChange,
  typeOptions,
  keyword,
  onKeywordChange,
  onSearch,
  right,
}: {
  statusTabs: string[];
  active: string;
  onStatus: (v: string) => void;
  placeholder: string;
  showType?: boolean;
  typeValue?: string;
  onTypeChange?: (v: string) => void;
  typeOptions?: AuthTypeItem[];
  keyword?: string;
  onKeywordChange?: (v: string) => void;
  onSearch?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div className="uath-filters">
      <div className="uath-status-tabs">
        {statusTabs.map((item) => (
          <button
            key={item}
            type="button"
            className={`uath-status-tab ${active === item ? "active" : ""}`}
            onClick={() => onStatus(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="uath-filter-right">
        <label className="uath-searchbox">
          <span className="uath-search-label">按昵称搜</span>
          <input type="text" placeholder={placeholder} value={keyword ?? ""} onChange={(e) => onKeywordChange?.(e.target.value)} />
        </label>
        {showType && (
          <label className="uath-select">
            <span className="uath-select-prefix">认证类型</span>
            <select value={typeValue ?? ""} onChange={(e) => onTypeChange?.(e.target.value)}>
              <option value="">不限</option>
              {(typeOptions ?? []).map((o) => (
                <option key={o.id} value={String(o.id)}>
                  {o.name}
                </option>
              ))}
            </select>
            <ChevronDown className="uath-select-caret size-3.5" />
          </label>
        )}
        <button type="button" className="uath-btn primary" onClick={onSearch}>
          <Search className="size-3.5" />
          搜索
        </button>
        {right}
      </div>
    </div>
  );
}

/* ---------- 文件凭证缩略图 ---------- */
function Thumb({ kind }: { kind: "face" | "doc" | "none" }) {
  if (kind === "none") return <span className="uath-nofile">未上传</span>;
  return (
    <span className={`uath-thumb ${kind}`}>
      <ImageIcon className="size-4" />
    </span>
  );
}

export default function LoveUserAuthPage() {
  const [tab, setTab] = useState<AuthTab>("realname");
  const [drawer, setDrawer] = useState<null | "quick" | "commit" | "marriage" | "ctype">(null);
  const [ctypeMode, setCtypeMode] = useState<"list" | "create">("list");

  // 筛选状态
  const [rnStatus, setRnStatus] = useState("全部");
  const [cmStatus, setCmStatus] = useState("全部");
  const [mrStatus, setMrStatus] = useState("全部");
  const [hsStatus, setHsStatus] = useState("全部");
  const [edStatus, setEdStatus] = useState("全部");
  const [otStatus, setOtStatus] = useState("全部");

  // 关键字（受控）
  const [rnKeyword, setRnKeyword] = useState("");
  const [cmKeyword, setCmKeyword] = useState("");
  const [mrKeyword, setMrKeyword] = useState("");
  const [hsKeyword, setHsKeyword] = useState("");
  const [edKeyword, setEdKeyword] = useState("");
  const [otKeyword, setOtKeyword] = useState("");
  const [otType, setOtType] = useState("");

  // 各 Tab 列表数据
  const [rnStats, setRnStats] = useState<RealnameStats | null>(null);
  const [rnRows, setRnRows] = useState<RealnameReviewItem[]>([]);
  const [rnLoading, setRnLoading] = useState(false);
  const [cmRows, setCmRows] = useState<CommitmentReviewItem[]>([]);
  const [cmLoading, setCmLoading] = useState(false);
  const [mrStats, setMrStats] = useState<MarriageStats | null>(null);
  const [mrRows, setMrRows] = useState<MarriageReviewItem[]>([]);
  const [mrLoading, setMrLoading] = useState(false);
  const [hsRows, setHsRows] = useState<HouseReviewItem[]>([]);
  const [hsLoading, setHsLoading] = useState(false);
  const [edRows, setEdRows] = useState<EducationReviewItem[]>([]);
  const [edLoading, setEdLoading] = useState(false);
  const [otRows, setOtRows] = useState<OtherReviewItem[]>([]);
  const [otLoading, setOtLoading] = useState(false);

  // 认证类型（其他认证 select + 管理抽屉）
  const [authTypes, setAuthTypes] = useState<AuthTypeItem[]>([]);

  // 查看资料
  const [profile, setProfile] = useState<{ memberId: number; nickname?: string | null; memberCode?: string | null } | null>(null);

  // 配置域
  const [configVersion, setConfigVersion] = useState(1);
  const [configData, setConfigData] = useState<Dict>({});

  // 承诺书 / 婚姻协议表单
  const [commitTitle, setCommitTitle] = useState("单身承诺");
  const [commitContent, setCommitContent] = useState(
    "本人使用昵称[[会员昵称]]，编号：[[相亲会员编号]]，在[[相亲平台名称]]登记婚姻交友信息，承诺所登记资料属实，承诺当前婚恋状态为[[婚姻状态]]，本人自行承担信息不属实造成的一切后果，与平台无关。",
  );
  const [agreement, setAgreement] = useState(
    "为保障婚恋交友平台信息真实性，维护健康诚信的交友环境，本人（授权人）自愿、真实、不可撤销地授权，依法依规查询本人婚姻状态信息，用于婚恋相亲资料核实，现就授权、使用、免责事宜确认如下：\n一、授权事项与范围\n授权平台通过合法合规渠道，查询并核验本人婚姻登记状态（未婚/已婚/离异/丧偶）、登记时间、登记机关等依法可查询信息。\n授权平台仅为本人自助查询使用、展示、存储查询结果，不用于任何其他目的，不代查、不泄露、不向第三方提供。\n本人确认：本次授权为本人查询本人信息，不冒用、不伪造、不侵犯他人隐私。\n二、信息真实性与责任承诺\n本人承诺所提供身份信息真实、有效、完整。因信息不实、验证失败、冒用他人信息导致的一切法律责任与损失，由本人自行承担。\n本人知悉并同意：查询结果以婚姻登记机关官方登记数据为准，平台仅提供查询通道与结果展示服务。\n三、隐私与保密\n平台对本人信息严格保密，仅在授权范围内处理，不泄露、不出售、不非法提供给第三方（法律法规强制性要求除外）。\n本人同意平台为完成查询所需的身份信息、信息传输与临时存储，并遵守平台隐私政策。\n四、授权期限\n自本人在线确认之日起生效，至本次查询结果展示完毕止；法律法规另有规定的从其规定。\n五、免责声明\n信息来源免责。",
  );

  // 快捷设置表单
  const [quickForceId, setQuickForceId] = useState(false);
  const [quickFee, setQuickFee] = useState("0");

  // 认证类型表单
  const [ctypeName, setCtypeName] = useState("");
  const [ctypeRealname, setCtypeRealname] = useState("need");
  const [ctypeDesc, setCtypeDesc] = useState("");
  const [ctypeSort, setCtypeSort] = useState("0");
  const [ctypeEnable, setCtypeEnable] = useState("on");
  const [ctypeIcon, setCtypeIcon] = useState<string | null>(null);
  const [ctypeEditId, setCtypeEditId] = useState<number | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const label = tabs.find((item) => item.key === tab)?.label || "实名认证";

  // ─── 数据加载 ───────────────────────────────────────────────
  const loadRealname = async () => {
    setRnLoading(true);
    try {
      const [stats, page] = await Promise.all([
        adminEndpoints.memberAuthRealnameStats(),
        adminEndpoints.memberAuthRealnameReviews({
          page: 1,
          page_size: 20,
          status: statusApi("realname", rnStatus),
          keyword: rnKeyword || undefined,
        }),
      ]);
      setRnStats(stats);
      setRnRows(page.items);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    } finally {
      setRnLoading(false);
    }
  };

  const loadCommitment = async () => {
    setCmLoading(true);
    try {
      const page = await adminEndpoints.memberAuthCommitmentReviews({
        page: 1,
        page_size: 20,
        status: statusApi("commitment", cmStatus),
        keyword: cmKeyword || undefined,
      });
      setCmRows(page.items);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    } finally {
      setCmLoading(false);
    }
  };

  const loadMarriage = async () => {
    setMrLoading(true);
    try {
      const [stats, page] = await Promise.all([
        adminEndpoints.memberAuthMarriageStats(),
        adminEndpoints.memberAuthMarriageReviews({
          page: 1,
          page_size: 20,
          status: statusApi("marriage", mrStatus),
          keyword: mrKeyword || undefined,
        }),
      ]);
      setMrStats(stats);
      setMrRows(page.items);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    } finally {
      setMrLoading(false);
    }
  };

  const loadHouse = async () => {
    setHsLoading(true);
    try {
      const page = await adminEndpoints.memberAuthHouseReviews({
        page: 1,
        page_size: 20,
        status: statusApi("house", hsStatus),
        keyword: hsKeyword || undefined,
      });
      setHsRows(page.items);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    } finally {
      setHsLoading(false);
    }
  };

  const loadEducation = async () => {
    setEdLoading(true);
    try {
      const page = await adminEndpoints.memberAuthEducationReviews({
        page: 1,
        page_size: 20,
        status: statusApi("education", edStatus),
        keyword: edKeyword || undefined,
      });
      setEdRows(page.items);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    } finally {
      setEdLoading(false);
    }
  };

  const loadOther = async () => {
    setOtLoading(true);
    try {
      const page = await adminEndpoints.memberAuthOtherReviews({
        page: 1,
        page_size: 20,
        status: statusApi("other", otStatus),
        keyword: otKeyword || undefined,
        auth_type_id: otType ? Number(otType) : undefined,
      });
      setOtRows(page.items);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    } finally {
      setOtLoading(false);
    }
  };

  const loadAuthTypes = async () => {
    try {
      setAuthTypes(await adminEndpoints.memberAuthTypes());
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    }
  };

  // Tab 切换 / 状态切换 → 重新加载对应列表
  useEffect(() => {
    if (tab === "realname") void loadRealname();
    else if (tab === "commitment") void loadCommitment();
    else if (tab === "marriage") void loadMarriage();
    else if (tab === "house") void loadHouse();
    else if (tab === "education") void loadEducation();
    else if (tab === "other") void loadOther();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, rnStatus, cmStatus, mrStatus, hsStatus, edStatus, otStatus, otType]);

  // 管理认证类型抽屉：进入列表模式时加载类型
  useEffect(() => {
    if (drawer === "ctype" && ctypeMode === "list") void loadAuthTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawer, ctypeMode]);

  // ─── 配置抽屉（打开时回填） ─────────────────────────────────
  const openConfigDrawer = async (name: "quick" | "commit" | "marriage") => {
    try {
      const snap = await adminEndpoints.memberAuthConfig();
      setConfigVersion(snap.version);
      const cfg = (snap.config ?? {}) as Dict;
      setConfigData(cfg);
      setQuickForceId(asBool(cfg.realname_force_id_card, false));
      setQuickFee(asStr(cfg.realname_fee, "0"));
      setCommitTitle(asStr(cfg.commitment_title, "单身承诺"));
      setCommitContent(
        asStr(cfg.commitment_content, commitContent),
      );
      setAgreement(asStr(cfg.marriage_agreement, agreement));
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "配置加载失败", "error");
    }
    setDrawer(name);
  };

  const saveConfig = async (patch: Dict, summary: string) => {
    try {
      const merged = { ...configData, ...patch };
      await adminEndpoints.memberAuthConfigUpdate({ version: configVersion, config: merged, change_summary: summary });
      setConfigData(merged);
      showConfigToast("保存成功", "ok");
      setDrawer(null);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "保存失败", "error");
    }
  };

  // ─── 审核 / 删除 ───────────────────────────────────────────
  const onCommitResult = async (row: CommitmentReviewItem, value: string) => {
    if (value === "pending") return; // 审核不支持置为待审
    const status = value === "pass" ? 1 : 2;
    try {
      await adminEndpoints.memberAuthReview("commitment", row.id, { status });
      showConfigToast("已更新", "ok");
      await loadCommitment();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "保存失败", "error");
    }
  };

  const onDeleteReview = async (kind: MemberAuthKind, id: number, name: string) => {
    if (!window.confirm(`确定删除该${name}记录吗？`)) return;
    try {
      await adminEndpoints.memberAuthDeleteReview(kind, id);
      showConfigToast("已删除", "ok");
      if (kind === "commitment") await loadCommitment();
      else if (kind === "house") await loadHouse();
      else if (kind === "education") await loadEducation();
      else if (kind === "other") await loadOther();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  // ─── 认证类型 创建/编辑/删除 ───────────────────────────────
  const openCreateType = () => {
    setCtypeEditId(null);
    setCtypeName("");
    setCtypeRealname("need");
    setCtypeDesc("");
    setCtypeSort("0");
    setCtypeEnable("on");
    setCtypeIcon(null);
    setCtypeMode("create");
  };

  const openEditType = (t: AuthTypeItem) => {
    setCtypeEditId(t.id);
    setCtypeName(t.name);
    setCtypeRealname(t.require_realname ? "need" : "no");
    setCtypeDesc(t.description ?? "");
    setCtypeSort(String(t.sort));
    setCtypeEnable(t.status === 1 ? "on" : "off");
    setCtypeIcon(t.icon_url);
    setCtypeMode("create");
  };

  const submitCtype = async () => {
    if (!ctypeName.trim()) {
      showConfigToast("请填写认证类型名称", "error");
      return;
    }
    const payload = {
      name: ctypeName.trim(),
      require_realname: ctypeRealname === "need",
      description: ctypeDesc || null,
      sort: Number(ctypeSort) || 0,
      status: ctypeEnable === "on" ? 1 : 0,
      icon_url: ctypeIcon,
    };
    try {
      if (ctypeEditId) await adminEndpoints.memberAuthUpdateType(ctypeEditId, payload);
      else await adminEndpoints.memberAuthCreateType(payload);
      showConfigToast("保存成功", "ok");
      await loadAuthTypes();
      setCtypeMode("list");
      setCtypeEditId(null);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "保存失败", "error");
    }
  };

  const onDeleteType = async (id: number, name: string) => {
    if (!window.confirm(`确定删除认证类型「${name}」吗？`)) return;
    try {
      await adminEndpoints.memberAuthDeleteType(id);
      showConfigToast("已删除", "ok");
      await loadAuthTypes();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const onPickIcon = (file: File | undefined | null) => {
    pickAndUploadImage(file, (url) => setCtypeIcon(url), (msg) => showConfigToast(msg, "error"));
  };

  const currentRight = () => {
    if (tab === "commitment") {
      return (
        <button type="button" className="uath-btn primary" onClick={() => openConfigDrawer("commit")}>
          <Settings className="size-3.5" />
          配置承诺书
        </button>
      );
    }
    if (tab === "marriage") {
      return (
        <div className="uath-filter-actions">
          <button type="button" className="uath-btn link">
            婚姻状况核验说明
          </button>
          <button type="button" className="uath-btn primary" onClick={() => openConfigDrawer("marriage")}>
            配置《婚姻状态查询授权协议》
          </button>
        </div>
      );
    }
    if (tab === "other") {
      return (
        <button
          type="button"
          className="uath-btn primary"
          onClick={() => {
            setCtypeMode("list");
            setDrawer("ctype");
          }}
        >
          <Settings className="size-3.5" />
          管理认证类型
        </button>
      );
    }
    return null;
  };

  const realnameStatCards = rnStats
    ? [
        { value: `${rnStats.quota_remaining}条`, label: "人脸核验余量", recharge: true },
        { value: `${rnStats.success_count}次`, label: "核验成功" },
        { value: `${rnStats.fail_count}次`, label: "核验失败" },
        { value: `${rnStats.total_consumed}次`, label: "总计消耗" },
      ]
    : [
        { value: "0条", label: "人脸核验余量", recharge: true },
        { value: "0次", label: "核验成功" },
        { value: "0次", label: "核验失败" },
        { value: "0次", label: "总计消耗" },
      ];

  return (
    <div className="min-w-0">
      <AdminBreadcrumb items={[...getBreadcrumb("会员CRM", "会员认证"), { label }]} />

      <section className="uath-card">
        <div className="uath-tabs">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`uath-tab ${tab === item.key ? "active" : ""}`}
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* ============ 实名认证 ============ */}
        {tab === "realname" && (
          <>
            <div className="uath-notice">
              <div className="uath-notice-title">
                <span className="uath-notice-icon">!</span>
                须知
              </div>
              <p>根据《中华人民共和国网络安全法》第二十四条相关条款，网络平台（小程序/APP/网站）必须落实电子实名认证，用户不提供真实身份信息的，不得为其提供相关服务。</p>
              <p>本系统已对接腾讯云人脸核身能力，用户可直接在您的平台完成扫脸实名认证，核验基础身份信息。</p>
              <p>用户认证时根据指定动作视频上传至人脸核身服务商，系统将同步调用实名、身份证号、与公安官方权威数据实时交叉比对核验，并即时返回核验结果至我方平台。</p>
              <p>人脸核验按腾讯云服务用量计费，账户欠费会直接关停平台实名认证功能，请及时联系服务商完成充值。</p>
              <p>如需强制用户上传身份证件照片，可前往【平台配置 - 权限配置】页面并开启对应开关。</p>
            </div>

            <div className="uath-stat-row">
              {realnameStatCards.map((card) => (
                <div key={card.label} className="uath-stat">
                  <div className="uath-stat-top">
                    <span className="uath-stat-value">{card.value}</span>
                    {card.recharge && (
                      <button type="button" className="uath-btn primary sm">
                        在线充值
                      </button>
                    )}
                  </div>
                  <div className="uath-stat-label">{card.label}</div>
                </div>
              ))}
            </div>

            <div className="uath-filters">
              <div className="uath-status-tabs">
                {["全部", "认证成功", "认证失败"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`uath-status-tab ${rnStatus === item ? "active" : ""}`}
                    onClick={() => setRnStatus(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="uath-filter-right">
                <label className="uath-searchbox grow">
                  <input
                    type="text"
                    placeholder="请输入会员昵称/编号/姓名/身份证号"
                    value={rnKeyword}
                    onChange={(e) => setRnKeyword(e.target.value)}
                  />
                </label>
                <button type="button" className="uath-btn primary" onClick={() => loadRealname()}>
                  <Search className="size-3.5" />
                  搜索
                </button>
                <button type="button" className="uath-btn primary" onClick={() => openConfigDrawer("quick")}>
                  <Settings className="size-3.5" />
                  快捷设置
                </button>
              </div>
            </div>

            <div className="uath-table-wrap">
              <table className="uath-table">
                <colgroup>
                  <col style={{ width: 56 }} />
                  <col style={{ width: 230 }} />
                  <col style={{ width: 210 }} />
                  <col style={{ width: 90 }} />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 130 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 90 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 160 }} />
                  <col style={{ width: 100 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>会员</th>
                    <th>证件信息</th>
                    <th>证件照片</th>
                    <th>验证方式</th>
                    <th>人脸服务商</th>
                    <th>人脸比对得分</th>
                    <th>核验文件</th>
                    <th>认证结果</th>
                    <th>提交认证时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {rnLoading ? (
                    <EmptyRow colSpan={11} />
                  ) : rnRows.length === 0 ? (
                    <EmptyRow colSpan={11} />
                  ) : (
                    rnRows.map((row) => (
                      <tr key={row.id}>
                        <td className="uath-td-id">{row.id}</td>
                        <td>
                          <div className="uath-member">
                            <span className="uath-avatar" />
                            <div className="uath-member-info">
                              <div className="uath-member-nick">
                                {row.nickname} <span className="uath-code">编号:{row.member_code}</span>
                              </div>
                              <div className="uath-member-name">
                                姓名：{row.real_name} <span className="uath-idcard">身份证：{row.id_card_masked}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="uath-idinfo">
                            <span>性别：{row.gender}</span>
                            <span>出生：{row.birthday}</span>
                            {row.id_card_issued && <span>发证：{row.id_card_issued}</span>}
                          </div>
                        </td>
                        <td>
                          {row.id_card_front ? <span>有</span> : <span className="uath-nofile">未上传</span>}
                        </td>
                        <td>{row.face_method}</td>
                        <td>{row.face_vendor}</td>
                        <td className="uath-score">{row.face_score}</td>
                        <td>
                          {row.face_photo ? <Thumb kind="face" /> : <span className="uath-nofile">未上传</span>}
                        </td>
                        <td>
                          <span className={`uath-badge ${row.result}`}>
                            {row.result === "success" ? "认证成功" : row.result === "fail" ? "认证失败" : "待审"}
                          </span>
                        </td>
                        <td className="uath-time">{fmtDateTime(row.created_at)}</td>
                        <td>
                          <button type="button" className="uath-link" onClick={() => setProfile({ memberId: row.user_id, nickname: row.nickname, memberCode: row.member_code })}>
                            查看资料
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ============ 会员承诺 ============ */}
        {tab === "commitment" && (
          <>
            <div className="uath-notice">
              <div className="uath-notice-title">
                <span className="uath-notice-icon">!</span>
                须知
              </div>
              <p>会员通过在线签署承诺书，大大提升会员信息权威性、真实性，也是平台增加规避风险的一个有力措施和法律存证</p>
              <p>本页中记录了平台中会员所有在线签署的承诺书情况的明细；在线签署承诺书的文案内容可以进行自由配置</p>
              <p>会员签署的字迹不清晰、与实名认证的姓名不符可设置为审核不通过，用户可以重新签署</p>
            </div>

            <FilterRow
              statusTabs={["全部", "通过", "待审", "未通过"]}
              active={cmStatus}
              onStatus={setCmStatus}
              placeholder="请输入"
              keyword={cmKeyword}
              onKeywordChange={setCmKeyword}
              onSearch={() => loadCommitment()}
              right={currentRight()}
            />

            <div className="uath-table-wrap">
              <table className="uath-table">
                <colgroup>
                  <col style={{ width: 56 }} />
                  <col style={{ width: 260 }} />
                  <col style={{ width: 120 }} />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 120 }} />
                  <col style={{ width: 180 }} />
                  <col style={{ width: 150 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>会员</th>
                    <th>签名文件</th>
                    <th>第几次签署</th>
                    <th>签署结果</th>
                    <th>提交签署时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {cmLoading ? (
                    <EmptyRow colSpan={7} />
                  ) : cmRows.length === 0 ? (
                    <EmptyRow colSpan={7} />
                  ) : (
                    cmRows.map((row) => (
                      <tr key={row.id}>
                        <td className="uath-td-id">{row.id}</td>
                        <td>
                          <div className="uath-member">
                            <span className="uath-avatar" />
                            <div className="uath-member-info">
                              <div className="uath-member-nick">
                                {row.nickname} <span className="uath-code">编号:{row.member_code}</span>
                              </div>
                              <div className="uath-member-name">
                                姓名：{row.real_name} <span className="uath-idcard">身份证：{row.id_card_masked}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <button type="button" className="uath-file-btn" onClick={() => row.file_url && window.open(resolveMediaUrl(row.file_url), "_blank")}>
                            查看文件
                          </button>
                        </td>
                        <td>{row.sign_times}</td>
                        <td>
                          {row.result === "pass" ? (
                            <span className="uath-badge plain pass">{statusMap.pass.label}</span>
                          ) : (
                            <label className="uath-inline-select">
                              <select
                                value={row.result}
                                className={row.result}
                                onChange={(e) => onCommitResult(row, e.target.value)}
                              >
                                <option value="pass">通过</option>
                                <option value="pending">待审</option>
                                <option value="fail">未通过</option>
                              </select>
                              <ChevronDown className="uath-select-caret size-3.5" />
                            </label>
                          )}
                        </td>
                        <td className="uath-time">{fmtDateTime(row.created_at)}</td>
                        <td>
                          <div className="uath-actions">
                            <button type="button" className="uath-link" onClick={() => setProfile({ memberId: row.user_id, nickname: row.nickname, memberCode: row.member_code })}>
                              查看资料
                            </button>
                            <button type="button" className="uath-link danger" onClick={() => onDeleteReview("commitment", row.id, "承诺书签署")}>
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ============ 婚姻状况 ============ */}
        {tab === "marriage" && (
          <>
            <div className="uath-notice">
              <div className="uath-notice-title">
                <span className="uath-notice-icon">!</span>
                须知
              </div>
              <p>系统对接了第三方权威数据库, 客户本人在平台上人脸核验身份信息后，即可由本人操作&ldquo;授权查询婚姻状态&rdquo;，权威数据库将返回查询结果到系统中</p>
              <p>已婚冒充单身，离异冒充未婚，这一直是困扰婚恋行业的痛点，一旦发生，则会结客户造成巨大的伤害，婚恋企业也会卷入纠纷，影响口碑</p>
              <p>根据相关法律规定，查询他人婚姻状态需通过合法途径，仅限本人、司法机关或经授权代理人操作，否则涉嫌侵犯隐私权。</p>
              <p>我们需要在合法、合规的前提下核实客户真实婚姻状态，既要做到不侵犯客户隐私权，也不能让&ldquo;有心隐瞒&rdquo;之人有空可钻。</p>
              <p><b>特别提醒：</b></p>
              <p>1、民政部门的婚姻状态信息还未实现全国联网和实时数据同步，所以任何途径查询的信息都存在滞后的可能，部分偏远地区只能以户籍地民政系统线下查询的为准。对于重点&ldquo;婚况可疑&rdquo;客户，可多种方式组合核实，或拒不配合查询的&ldquo;可疑客户&rdquo;，可拒绝服务。</p>
              <p>2、根据法律法规，婚姻状态查询结果仅查询人本人可见。被授权方记录查询结果仅限用于客户婚恋服务中的登记信息交叉核对，不得将查询结果对外展示</p>
            </div>

            <div className="uath-stat-row">
              <div className="uath-stat">
                <div className="uath-stat-top">
                  <span className="uath-stat-value">{mrStats ? `${mrStats.quota_remaining}条` : "0条"}</span>
                  <button type="button" className="uath-btn primary sm">
                    在线充值
                  </button>
                </div>
                <div className="uath-stat-label">婚况核验查询余量</div>
              </div>
              <div className="uath-stat">
                <div className="uath-stat-top">
                  <span className="uath-stat-value">{mrStats ? `${mrStats.total_consumed}次` : "0次"}</span>
                </div>
                <div className="uath-stat-label">总计消耗</div>
              </div>
            </div>

            <FilterRow
              statusTabs={["全部", "已婚", "无登记信息", "离异"]}
              active={mrStatus}
              onStatus={setMrStatus}
              placeholder="请输入会员昵称/编号/姓名/身份证号"
              keyword={mrKeyword}
              onKeywordChange={setMrKeyword}
              onSearch={() => loadMarriage()}
              right={currentRight()}
            />

            <div className="uath-table-wrap">
              <table className="uath-table">
                <colgroup>
                  <col style={{ width: 70 }} />
                  <col style={{ width: 260 }} />
                  <col style={{ width: 130 }} />
                  <col style={{ width: 160 }} />
                  <col style={{ width: 130 }} />
                  <col style={{ width: 180 }} />
                  <col style={{ width: 120 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>会员</th>
                    <th>核验方式</th>
                    <th>客户资料中</th>
                    <th>核验结果</th>
                    <th>核验时间</th>
                    <th>查询费用</th>
                  </tr>
                </thead>
                <tbody>
                  {mrLoading ? (
                    <EmptyRow colSpan={7} />
                  ) : mrRows.length === 0 ? (
                    <EmptyRow colSpan={7} />
                  ) : (
                    mrRows.map((row) => (
                      <tr key={row.id}>
                        <td className="uath-td-id">{row.id}</td>
                        <td>
                          <div className="uath-member">
                            <span className="uath-avatar" />
                            <div className="uath-member-info">
                              <div className="uath-member-nick">
                                {row.nickname} <span className="uath-code">编号:{row.member_code}</span>
                              </div>
                              <div className="uath-member-name">
                                姓名：{row.real_name} <span className="uath-idcard">身份证：{row.id_card_masked}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{row.check_method}</td>
                        <td>{row.declared_status}</td>
                        <td>{row.result_label}</td>
                        <td className="uath-time">{fmtDateTime(row.checked_at)}</td>
                        <td>{row.cost ?? "暂无数据"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ============ 房产认证 ============ */}
        {tab === "house" && (
          <>
            <div className="uath-notice">
              <div className="uath-notice-title">
                <span className="uath-notice-icon">!</span>
                须知
              </div>
              <p>本页中记录了平台中会员所提交的房产认证资料，认证资料仅在后台管理员可见，不会对会员开放。</p>
              <p>参考审核标准：房产证的产权人包含所提交会员的姓名</p>
            </div>

            <FilterRow
              statusTabs={["全部", "通过", "待审", "未通过"]}
              active={hsStatus}
              onStatus={setHsStatus}
              placeholder="请输入"
              keyword={hsKeyword}
              onKeywordChange={setHsKeyword}
              onSearch={() => loadHouse()}
            />

            <div className="uath-table-wrap">
              <table className="uath-table">
                <colgroup>
                  <col style={{ width: 56 }} />
                  <col style={{ width: 280 }} />
                  <col style={{ width: 200 }} />
                  <col style={{ width: 140 }} />
                  <col style={{ width: 200 }} />
                  <col style={{ width: 160 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>会员</th>
                    <th>文件凭证</th>
                    <th>认证结果</th>
                    <th>提交认证时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {hsLoading ? (
                    <EmptyRow colSpan={6} />
                  ) : hsRows.length === 0 ? (
                    <EmptyRow colSpan={6} />
                  ) : (
                    hsRows.map((row) => (
                      <tr key={row.id}>
                        <td className="uath-td-id">{row.id}</td>
                        <td>
                          <div className="uath-member">
                            <span className="uath-avatar" />
                            <div className="uath-member-info">
                              <div className="uath-member-nick">
                                {row.nickname} <span className="uath-code">编号:{row.member_code}</span>
                              </div>
                              <div className="uath-member-name">
                                姓名：{row.real_name} <span className="uath-idcard">身份证：{row.id_card_masked}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {row.file_url ? <Thumb kind="doc" /> : <Thumb kind="none" />}
                        </td>
                        <td>
                          <span className={`uath-badge plain ${row.result}`}>{statusMap[row.result]?.label ?? row.result_label}</span>
                        </td>
                        <td className="uath-time">{fmtDateTime(row.created_at)}</td>
                        <td>
                          <div className="uath-actions">
                            <button type="button" className="uath-link" onClick={() => setProfile({ memberId: row.user_id, nickname: row.nickname, memberCode: row.member_code })}>
                              查看资料
                            </button>
                            <button type="button" className="uath-link danger" onClick={() => onDeleteReview("house", row.id, "房产认证")}>
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ============ 学历认证 ============ */}
        {tab === "education" && (
          <>
            <div className="uath-notice">
              <div className="uath-notice-title">
                <span className="uath-notice-icon">!</span>
                须知
              </div>
              <p>本页中记录了平台中会员所提交的学历认证资料，认证资料仅在后台管理员可见，不会对会员开放。</p>
              <p>参考审核标准：登录学信网选择&ldquo;零散查询&rdquo;，输入姓名、证书编号后将收到核验结果，且证书上的姓名与会员在平台中实名一致即可判断为通过</p>
            </div>

            <FilterRow
              statusTabs={["全部", "通过", "待审", "未通过"]}
              active={edStatus}
              onStatus={setEdStatus}
              placeholder="请输入"
              keyword={edKeyword}
              onKeywordChange={setEdKeyword}
              onSearch={() => loadEducation()}
            />

            <div className="uath-table-wrap">
              <table className="uath-table">
                <colgroup>
                  <col style={{ width: 56 }} />
                  <col style={{ width: 270 }} />
                  <col style={{ width: 90 }} />
                  <col style={{ width: 140 }} />
                  <col style={{ width: 90 }} />
                  <col style={{ width: 120 }} />
                  <col style={{ width: 180 }} />
                  <col style={{ width: 150 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>会员</th>
                    <th>学历</th>
                    <th>毕业学校</th>
                    <th>文件凭证</th>
                    <th>认证结果</th>
                    <th>提交认证时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {edLoading ? (
                    <EmptyRow colSpan={8} />
                  ) : edRows.length === 0 ? (
                    <EmptyRow colSpan={8} />
                  ) : (
                    edRows.map((row) => (
                      <tr key={row.id}>
                        <td className="uath-td-id">{row.id}</td>
                        <td>
                          <div className="uath-member">
                            <span className="uath-avatar" />
                            <div className="uath-member-info">
                              <div className="uath-member-nick">
                                {row.nickname} <span className="uath-code">编号:{row.member_code}</span>
                              </div>
                              <div className="uath-member-name">
                                姓名：{row.real_name} <span className="uath-idcard">身份证：{row.id_card_masked}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{row.degree}</td>
                        <td>{row.school || "-"}</td>
                        <td>
                          {row.file_url ? <Thumb kind="doc" /> : <Thumb kind="none" />}
                        </td>
                        <td>
                          <span className={`uath-badge plain ${row.result}`}>{statusMap[row.result]?.label ?? row.result_label}</span>
                        </td>
                        <td className="uath-time">{fmtDateTime(row.created_at)}</td>
                        <td>
                          <div className="uath-actions">
                            <button type="button" className="uath-link" onClick={() => setProfile({ memberId: row.user_id, nickname: row.nickname, memberCode: row.member_code })}>
                              查看资料
                            </button>
                            <button type="button" className="uath-link danger" onClick={() => onDeleteReview("education", row.id, "学历认证")}>
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ============ 其他认证 ============ */}
        {tab === "other" && (
          <>
            <div className="uath-notice">
              <div className="uath-notice-title">
                <span className="uath-notice-icon">!</span>
                须知
              </div>
              <p>系统中除了内置的实名认证、学历认证、房产认证之外，您可以通过&ldquo;其他认证&rdquo;系统来创建任何您所需的认证，帮助您实现通过线上高效收集到会员的更全面资料信息；并且可以通过认证的会员自动加入显示到指定的会员分区哦</p>
            </div>

            <FilterRow
              statusTabs={["全部", "通过", "待审", "未通过"]}
              active={otStatus}
              onStatus={setOtStatus}
              placeholder="请输入"
              showType
              typeValue={otType}
              onTypeChange={setOtType}
              typeOptions={authTypes}
              keyword={otKeyword}
              onKeywordChange={setOtKeyword}
              onSearch={() => loadOther()}
              right={currentRight()}
            />

            <div className="uath-table-wrap">
              <table className="uath-table">
                <colgroup>
                  <col style={{ width: 56 }} />
                  <col style={{ width: 140 }} />
                  <col style={{ width: 280 }} />
                  <col style={{ width: 140 }} />
                  <col style={{ width: 140 }} />
                  <col style={{ width: 200 }} />
                  <col style={{ width: 160 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>认证类型</th>
                    <th>会员</th>
                    <th>文件凭证</th>
                    <th>认证结果</th>
                    <th>提交认证时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {otLoading ? (
                    <EmptyRow colSpan={7} />
                  ) : otRows.length === 0 ? (
                    <EmptyRow colSpan={7} />
                  ) : (
                    otRows.map((row) => (
                      <tr key={row.id}>
                        <td className="uath-td-id">{row.id}</td>
                        <td>{row.auth_type_name}</td>
                        <td>
                          <div className="uath-member">
                            <span className="uath-avatar" />
                            <div className="uath-member-info">
                              <div className="uath-member-nick">
                                {row.nickname} <span className="uath-code">编号:{row.member_code}</span>
                              </div>
                              <div className="uath-member-name">
                                姓名：{row.real_name} <span className="uath-idcard">身份证：{row.id_card_masked}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {row.file_url ? <Thumb kind="doc" /> : <Thumb kind="none" />}
                        </td>
                        <td>
                          <span className={`uath-badge plain ${row.result}`}>{statusMap[row.result]?.label ?? row.result_label}</span>
                        </td>
                        <td className="uath-time">{fmtDateTime(row.created_at)}</td>
                        <td>
                          <div className="uath-actions">
                            <button type="button" className="uath-link" onClick={() => setProfile({ memberId: row.user_id, nickname: row.nickname, memberCode: row.member_code })}>
                              查看资料
                            </button>
                            <button type="button" className="uath-link danger" onClick={() => onDeleteReview("other", row.id, "其他认证")}>
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* ============ Drawer：快捷设置 ============ */}
      {drawer === "quick" && (
        <div className="uath-mask" onClick={() => setDrawer(null)}>
          <div className="uath-panel narrow" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="uath-panel-head">
              <div className="uath-panel-title">
                <span className="uath-panel-x" onClick={() => setDrawer(null)}>
                  <X className="size-4" />
                </span>
                <h2>快捷设置</h2>
              </div>
              <div className="uath-panel-actions">
                <button type="button" className="uath-panel-cancel" onClick={() => setDrawer(null)}>
                  取消
                </button>
                <button
                  type="button"
                  className="uath-panel-submit"
                  onClick={() =>
                    saveConfig(
                      { realname_force_id_card: quickForceId, realname_fee: quickFee },
                      "更新实名认证快捷设置",
                    )
                  }
                >
                  确定提交
                </button>
              </div>
            </div>
            <div className="uath-panel-body">
              <div className="uath-field">
                <div className="uath-field-label">实名时强制上传身份证</div>
                <div className="uath-field-control column">
                  <label className="uath-radio">
                    <input type="radio" name="force-id" checked={!quickForceId} onChange={() => setQuickForceId(false)} />
                    <span>不强制上传</span>
                  </label>
                  <label className="uath-radio">
                    <input type="radio" name="force-id" checked={quickForceId} onChange={() => setQuickForceId(true)} />
                    <span>强制上传</span>
                  </label>
                  <div className="uath-field-hint">
                    强制上传（在实名认证时除了人脸识别之外，还将强制要求客户必须上传身份证的照片给平台，开启本功能后可能会降低到实名认证率，注意系统并不对身份证照片进行验证）
                  </div>
                </div>
              </div>

              <div className="uath-field">
                <div className="uath-field-label">实名认证费</div>
                <div className="uath-field-control column">
                  <div className="uath-inline-unit">
                    <input
                      type="text"
                      className="uath-input short"
                      value={quickFee}
                      onChange={(e) => setQuickFee(e.target.value)}
                    />
                    <span className="uath-inline-unit-text">元/次</span>
                  </div>
                  <div className="uath-tip">
                    <span className="uath-tip-icon">i</span>
                    指客户在您平台实名认证的时候需要向您支付的费用；不建议设置收费；0元表示免费；
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ Drawer：配置承诺书 ============ */}
      {drawer === "commit" && (
        <div className="uath-mask" onClick={() => setDrawer(null)}>
          <div className="uath-panel" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="uath-panel-head">
              <div className="uath-panel-title">
                <span className="uath-panel-x" onClick={() => setDrawer(null)}>
                  <X className="size-4" />
                </span>
                <h2>配置承诺书</h2>
              </div>
              <div className="uath-panel-actions">
                <button type="button" className="uath-panel-cancel" onClick={() => setDrawer(null)}>
                  取消
                </button>
                <button
                  type="button"
                  className="uath-panel-submit"
                  onClick={() =>
                    saveConfig(
                      { commitment_title: commitTitle, commitment_content: commitContent },
                      "更新会员承诺书配置",
                    )
                  }
                >
                  确定提交
                </button>
              </div>
            </div>
            <div className="uath-panel-body">
              <div className="uath-field">
                <div className="uath-field-label">
                  <span className="req">*</span>标题
                </div>
                <div className="uath-field-control">
                  <input
                    className="uath-input"
                    value={commitTitle}
                    onChange={(e) => setCommitTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="uath-field top">
                <div className="uath-field-label">
                  <span className="req">*</span>内容
                </div>
                <div className="uath-field-control column">
                  <div className="uath-textarea-wrap">
                    <textarea
                      maxLength={1000}
                      value={commitContent}
                      onChange={(e) => setCommitContent(e.target.value)}
                    />
                    <span className="uath-textarea-count">{commitContent.length} / 1000</span>
                  </div>
                  <div className="uath-tags">
                    可插入标签：[[会员昵称]] [[姓名]] [[性别]] [[身份证号]] [[相亲会员编号]] [[相亲平台名称]] [[婚姻状态]]
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ Drawer：婚姻状态查询服务协议 ============ */}
      {drawer === "marriage" && (
        <div className="uath-mask" onClick={() => setDrawer(null)}>
          <div className="uath-panel" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="uath-panel-head">
              <div className="uath-panel-title">
                <span className="uath-panel-x" onClick={() => setDrawer(null)}>
                  <X className="size-4" />
                </span>
                <h2>婚姻状态查询服务协议</h2>
              </div>
              <div className="uath-panel-actions">
                <button type="button" className="uath-panel-cancel" onClick={() => setDrawer(null)}>
                  取消
                </button>
                <button
                  type="button"
                  className="uath-panel-submit"
                  onClick={() => saveConfig({ marriage_agreement: agreement }, "更新婚姻状态查询授权协议")}
                >
                  确定提交
                </button>
              </div>
            </div>
            <div className="uath-panel-body">
              <div className="uath-field top">
                <div className="uath-field-label">
                  <span className="req">*</span>内容
                </div>
                <div className="uath-field-control column">
                  <textarea
                    className="uath-textarea tall"
                    value={agreement}
                    onChange={(e) => setAgreement(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ Drawer：管理认证类型 ============ */}
      {drawer === "ctype" && (
        <div className="uath-mask" onClick={() => setDrawer(null)}>
          <div className="uath-panel" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="uath-panel-head">
              <div className="uath-panel-title">
                <span className="uath-panel-x" onClick={() => setDrawer(null)}>
                  <X className="size-4" />
                </span>
                <h2>管理认证类型</h2>
              </div>
              <div className="uath-panel-actions">
                {ctypeMode === "create" && (
                  <>
                    <button
                      type="button"
                      className="uath-panel-cancel"
                      onClick={() => {
                        setCtypeEditId(null);
                        setCtypeMode("list");
                      }}
                    >
                      取消
                    </button>
                    <button type="button" className="uath-panel-submit" onClick={() => submitCtype()}>
                      确定提交
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="uath-panel-body">
              {ctypeMode === "list" ? (
                <>
                  <table className="uath-table">
                    <colgroup>
                      <col style={{ width: 140 }} />
                      <col style={{ width: 90 }} />
                      <col style={{ width: 90 }} />
                      <col style={{ width: 100 }} />
                      <col style={{ width: 120 }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>认证类型</th>
                        <th>图标</th>
                        <th>排序</th>
                        <th>状态</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {authTypes.length === 0 ? (
                        <tr>
                          <td colSpan={5}>
                            <div className="uath-empty">
                              <Inbox className="uath-empty-icon" strokeWidth={1.2} />
                              <span>暂无数据</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        authTypes.map((t) => (
                          <tr key={t.id}>
                            <td>{t.name}</td>
                            <td>
                              {t.icon_url ? (
                                <img className="uath-thumb-img" src={resolveMediaUrl(t.icon_url)} alt={t.name} />
                              ) : (
                                <span className="uath-nofile">未上传</span>
                              )}
                            </td>
                            <td>{t.sort}</td>
                            <td>
                              <span className={`uath-badge plain ${t.status === 1 ? "pass" : "fail"}`}>
                                {t.status === 1 ? "启用" : "关闭"}
                              </span>
                            </td>
                            <td>
                              <div className="uath-actions">
                                <button type="button" className="uath-link" onClick={() => openEditType(t)}>
                                  编辑
                                </button>
                                <button type="button" className="uath-link danger" onClick={() => onDeleteType(t.id, t.name)}>
                                  删除
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  <div className="uath-ctype-create">
                    <button type="button" className="uath-btn primary" onClick={() => openCreateType()}>
                      <Plus className="size-3.5" />
                      创建新的认证类型
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="uath-field">
                    <div className="uath-field-label">
                      <span className="req">*</span>认证类型
                    </div>
                    <div className="uath-field-control">
                      <input
                        className="uath-input short"
                        placeholder="建议4个汉字"
                        value={ctypeName}
                        onChange={(e) => setCtypeName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="uath-field top">
                    <div className="uath-field-label">实名认证</div>
                    <div className="uath-field-control column">
                      <div className="uath-radio-group">
                        <label className="uath-radio">
                          <input
                            type="radio"
                            name="ctype-realname"
                            checked={ctypeRealname === "need"}
                            onChange={() => setCtypeRealname("need")}
                          />
                          <span>需要（建议开启）</span>
                        </label>
                        <label className="uath-radio">
                          <input
                            type="radio"
                            name="ctype-realname"
                            checked={ctypeRealname === "no"}
                            onChange={() => setCtypeRealname("no")}
                          />
                          <span>不需要</span>
                        </label>
                      </div>
                      <div className="uath-tip">
                        <span className="uath-tip-icon">i</span>
                        提交本认证是否先要求并引导会员完成实名认证
                      </div>
                    </div>
                  </div>

                  <div className="uath-field top">
                    <div className="uath-field-label">
                      <span className="req">*</span>认证图标
                    </div>
                    <div className="uath-field-control column">
                      <input
                        ref={iconInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => onPickIcon(e.target.files?.[0])}
                      />
                      <button type="button" className="uath-upload" onClick={() => iconInputRef.current?.click()}>
                        <Plus className="size-4" />
                        上传照片
                      </button>
                      {ctypeIcon && (
                        <img className="uath-thumb-img" src={resolveMediaUrl(ctypeIcon)} alt="认证图标" />
                      )}
                      <div className="uath-tip">
                        <span className="uath-tip-icon">i</span>
                        PNG格式，尺寸100像素X100像素，为了界面美观建议设计与系统中其他认证图标风格一致
                      </div>
                    </div>
                  </div>

                  <div className="uath-field top">
                    <div className="uath-field-label">说明文案</div>
                    <div className="uath-field-control column">
                      <textarea
                        className="uath-textarea"
                        value={ctypeDesc}
                        onChange={(e) => setCtypeDesc(e.target.value)}
                      />
                      <div className="uath-tip">
                        <span className="uath-tip-icon">i</span>
                        显示在会员提交资料页面的说明文字，图示位置：
                        <span className="uath-tip-thumb" />
                      </div>
                    </div>
                  </div>

                  <div className="uath-field top">
                    <div className="uath-field-label">显示排序</div>
                    <div className="uath-field-control column">
                      <input
                        className="uath-input short"
                        value={ctypeSort}
                        onChange={(e) => setCtypeSort(e.target.value)}
                      />
                      <div className="uath-tip">
                        <span className="uath-tip-icon">i</span>
                        数字越大显示越靠前，注意：均是显示在系统内置认证项目之后
                      </div>
                    </div>
                  </div>

                  <div className="uath-field">
                    <div className="uath-field-label">是否启用</div>
                    <div className="uath-field-control">
                      <div className="uath-radio-group">
                        <label className="uath-radio">
                          <input
                            type="radio"
                            name="ctype-enable"
                            checked={ctypeEnable === "on"}
                            onChange={() => setCtypeEnable("on")}
                          />
                          <span>启用</span>
                        </label>
                        <label className="uath-radio">
                          <input
                            type="radio"
                            name="ctype-enable"
                            checked={ctypeEnable === "off"}
                            onChange={() => setCtypeEnable("off")}
                          />
                          <span>关闭</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {profile && (
        <MemberQuickProfileDrawer
          memberId={profile.memberId}
          nickname={profile.nickname}
          memberCode={profile.memberCode}
          onClose={() => setProfile(null)}
        />
      )}
    </div>
  );
}
