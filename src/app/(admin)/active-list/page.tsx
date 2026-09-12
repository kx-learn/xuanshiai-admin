"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Plus, Eye, Type, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, Quote, List, ListOrdered, Link2, Image as ImageIcon, Smile, Code, Heading1, Heading2, RotateCcw, RotateCw, Maximize2, Minus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints, type ActivityItem, type ActivityCreatePayload, type ActivityLinkInfo } from "@/lib/admin-endpoints";
import { pickAndUploadImage, showConfigToast, useConfigDomain } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("活动报名", "活动管理");

const TOOLBAR: { icon: React.ReactNode; title: string }[] = [
  { icon: <Heading1 size={14} />, title: "标题" },
  { icon: <Type size={14} />, title: "正文" },
  { icon: <Bold size={14} />, title: "加粗" },
  { icon: <Italic size={14} />, title: "斜体" },
  { icon: <Underline size={14} />, title: "下划线" },
  { icon: <Strikethrough size={14} />, title: "删除线" },
  { icon: <AlignLeft size={14} />, title: "左对齐" },
  { icon: <AlignCenter size={14} />, title: "居中" },
  { icon: <AlignRight size={14} />, title: "右对齐" },
  { icon: <Quote size={14} />, title: "引用" },
  { icon: <Link2 size={14} />, title: "链接" },
  { icon: <ImageIcon size={14} />, title: "图片" },
  { icon: <Smile size={14} />, title: "表情" },
  { icon: <Code size={14} />, title: "代码" },
  { icon: <List size={14} />, title: "无序列表" },
  { icon: <ListOrdered size={14} />, title: "有序列表" },
  { icon: <Minus size={14} />, title: "分割线" },
  { icon: <RotateCcw size={14} />, title: "撤销" },
  { icon: <RotateCw size={14} />, title: "重做" },
  { icon: <Maximize2 size={14} />, title: "全屏" },
];

const SIDEBAR_SECTIONS = [
  "基本信息", "时间地点", "活动费用", "报名要求", "人数限额", "红娘奖励", "活动详情", "活动提醒", "其他设置", "管理设置",
];

type ActivityConfig = { categories: string[] };

interface FormState {
  id: number | null;
  title: string;
  type: string;
  organizer: string;
  timeText: string;
  address: string;
  endDate: string;
  deadlineDate: string;
  cover: string | null;
  coverSmall: string | null;
  feeName: string;
  priceMale: number;
  priceFemale: number;
  signupMode: "anyone" | "member";
  requireRealname: boolean;
  limitMode: "gender" | "total";
  maxMale: number;
  maxFemale: number;
  maxPeople: number;
  virtualPeople: number;
  virtualFemale: number;
  hideSignupCount: boolean;
  rewardPromoter: number;
  rewardService: number;
  rewardPartner: number;
  description: string;
  reminderHtml: string;
  serviceWechat: string;
  serviceQr: string | null;
  virtualViews: number;
  sortOrder: number;
  customShare: boolean;
  managerIds: string;
  notifyPhones: string;
}

const EMPTY_FORM: FormState = {
  id: null, title: "", type: "", organizer: "", timeText: "", address: "", endDate: "", deadlineDate: "",
  cover: null, coverSmall: null, feeName: "报名费", priceMale: 0, priceFemale: 0, signupMode: "anyone",
  requireRealname: false, limitMode: "gender", maxMale: 0, maxFemale: 0, maxPeople: 0,
  virtualPeople: 0, virtualFemale: 0, hideSignupCount: false, rewardPromoter: 0, rewardService: 0,
  rewardPartner: 0, description: "", reminderHtml: "", serviceWechat: "", serviceQr: null, virtualViews: 0,
  sortOrder: 0, customShare: false, managerIds: "", notifyPhones: "",
};

const ACTIVITY_STATUS_TEXT: Record<number, string> = { 1: "报名中", 2: "已满额", 3: "报名截止", 4: "活动结束", 5: "已取消" };
const AUDIT_TEXT: Record<string, string> = { pending: "待审", approved: "通过", rejected: "未通过" };

const fmtDate = (v: string | null | undefined) => (v ? v.replace("T", " ").slice(0, 16) : "");

function toForm(row: ActivityItem): FormState {
  return {
    id: row.id,
    title: row.title ?? "",
    type: row.type ?? "",
    organizer: row.organizer ?? "",
    timeText: row.time_text ?? "",
    address: row.address ?? "",
    endDate: row.end_time ? row.end_time.slice(0, 10) : "",
    deadlineDate: row.signup_deadline ? row.signup_deadline.slice(0, 10) : "",
    cover: row.cover,
    coverSmall: row.cover_small,
    feeName: row.fee_name || "报名费",
    priceMale: row.price_male ?? 0,
    priceFemale: row.price_female ?? 0,
    signupMode: row.signup_mode === "member" ? "member" : "anyone",
    requireRealname: !!row.require_realname,
    limitMode: row.limit_mode === "total" ? "total" : "gender",
    maxMale: row.max_male ?? 0,
    maxFemale: row.max_female ?? 0,
    maxPeople: row.max_people ?? 0,
    virtualPeople: row.virtual_people ?? 0,
    virtualFemale: row.virtual_female ?? 0,
    hideSignupCount: !!row.hide_signup_count,
    rewardPromoter: row.reward_promoter ?? 0,
    rewardService: row.reward_service ?? 0,
    rewardPartner: row.reward_partner ?? 0,
    description: row.description ?? "",
    reminderHtml: row.reminder_html ?? "",
    serviceWechat: row.service_wechat ?? "",
    serviceQr: row.service_qr,
    virtualViews: row.virtual_views ?? 0,
    sortOrder: row.sort_order ?? 0,
    customShare: !!row.custom_share,
    managerIds: row.manager_ids ?? "",
    notifyPhones: row.notify_phones ?? "",
  };
}

function buildPayload(form: FormState): ActivityCreatePayload {
  const endDate = form.endDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const start = `${endDate}T09:00:00`;
  const end = `${endDate}T18:00:00`;
  let deadline: string | null = form.deadlineDate ? `${form.deadlineDate}T23:59:59` : null;
  if (deadline && deadline > start) deadline = start;
  return {
    title: form.title,
    type: form.type || null,
    organizer: form.organizer || null,
    time_text: form.timeText || null,
    address: form.address || null,
    start_time: start,
    end_time: end,
    signup_deadline: deadline,
    cover: form.cover,
    cover_small: form.coverSmall,
    fee_name: form.feeName || "报名费",
    price: form.priceMale,
    price_male: form.priceMale,
    price_female: form.priceFemale,
    signup_mode: form.signupMode,
    require_realname: form.requireRealname,
    limit_mode: form.limitMode,
    max_male: form.maxMale,
    max_female: form.maxFemale,
    max_people: form.maxPeople,
    virtual_people: form.virtualPeople,
    virtual_female: form.virtualFemale,
    hide_signup_count: form.hideSignupCount,
    reward_promoter: form.rewardPromoter,
    reward_service: form.rewardService,
    reward_partner: form.rewardPartner,
    description: form.description || null,
    reminder_html: form.reminderHtml || null,
    service_wechat: form.serviceWechat || null,
    service_qr: form.serviceQr,
    virtual_views: form.virtualViews,
    sort_order: form.sortOrder,
    custom_share: form.customShare,
    manager_ids: form.managerIds || null,
    notify_phones: form.notifyPhones || null,
  };
}

export default function ActiveListPage() {
  const { snapshot } = useConfigDomain<ActivityConfig>("tools_active", { categories: [] });
  const [rows, setRows] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [activeSection, setActiveSection] = useState("基本信息");
  const [saving, setSaving] = useState(false);
  const [linkInfo, setLinkInfo] = useState<ActivityLinkInfo | null>(null);

  const categories = snapshot?.config.categories ?? [];

  const loadList = useCallback(async (search = keyword) => {
    setLoading(true);
    try {
      const res = await adminEndpoints.activityList({ page: 1, page_size: 50, search: search || undefined });
      setRows(res.items);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => { loadList(""); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setActiveSection("基本信息"); setAddOpen(true); };
  const openEdit = (row: ActivityItem) => { setForm(toForm(row)); setActiveSection("基本信息"); setAddOpen(true); };

  const toggleOnline = async (row: ActivityItem) => {
    const next = !row.online;
    setRows((list) => list.map((r) => (r.id === row.id ? { ...r, online: next } : r)));
    try {
      await adminEndpoints.updateActivity(row.id, { online: next });
    } catch (e) {
      setRows((list) => list.map((r) => (r.id === row.id ? { ...r, online: row.online } : r)));
      showConfigToast(e instanceof Error ? e.message : "操作失败", "error");
    }
  };

  const copyRow = async (row: ActivityItem) => {
    try {
      await adminEndpoints.copyActivity(row.id);
      showConfigToast("复制成功", "ok");
      loadList();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "复制失败", "error");
    }
  };

  const deleteRow = async (row: ActivityItem) => {
    if (!window.confirm(`确定删除活动「${row.title}」？`)) return;
    try {
      await adminEndpoints.deleteActivity(row.id);
      showConfigToast("删除成功", "ok");
      loadList();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const openLink = async (row: ActivityItem) => {
    setLinkInfo({ link_url: row.link_url || "", qr_code: null });
    setLinkOpen(true);
    try {
      setLinkInfo(await adminEndpoints.activityLink(row.id));
    } catch {
      /* 保留回退值 */
    }
  };

  const submit = async () => {
    if (!form.title.trim()) { showConfigToast("请填写活动名称", "error"); return; }
    setSaving(true);
    try {
      const payload = buildPayload(form);
      if (form.id) {
        await adminEndpoints.updateActivity(form.id, payload);
      } else {
        await adminEndpoints.createActivity(payload);
      }
      showConfigToast("提交成功", "ok");
      setAddOpen(false);
      loadList();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "提交失败", "error");
    } finally {
      setSaving(false);
    }
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>本系统实现：活动发布、生成招募海报/二维码/报名链接、在线报名、在线收款、短信通知、活动签到、报名信息一键导入会员库、财务管理等功能</p>
            <p>活动分为四种状态："报名中"、"已满额"、"报名截止"、"已结束"，仅状态为"报名中"中可以报名</p>
            <p>活动为"审核通过"且"上线"才会在平台上显示</p>
          </div>
        </div>
      </div>

      <div className="finord-card al-card">
        <div className="al-head">
          <h2 className="al-title">活动管理</h2>
          <div className="al-head-actions">
            <button className="finord-btn finord-btn-primary al-publish-btn" onClick={openAdd}>＋ 发布活动</button>
            <button className="finord-btn finord-btn-primary al-preview-btn"><Eye size={14} /> 预览活动栏目</button>
          </div>
        </div>

        <div className="al-filters">
          <input className="al-input" placeholder="请输入关键字搜索" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && loadList()} />
          <button className="finord-btn finord-btn-primary al-search-btn" onClick={() => loadList()}>搜索</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table al-table">
            <thead>
              <tr>
                {["ID", "活动", "链接/二维码", "分享海报", "签到码", "活动状态", "报名人数", "创建时间", "审核状态", "上线", "操作"].map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="al-row-content">
                      <input type="checkbox" className="al-check" />
                      <span className="al-id">{r.id}</span>
                    </div>
                  </td>
                  <td>
                    <div className="al-activity">
                      <div className="al-cover" style={{ background: "linear-gradient(135deg, #c93b76, #f0648a)" }}>{r.cover_small || r.title.slice(0, 6)}</div>
                      <div className="al-activity-info">
                        <div className="al-activity-name">{r.title}</div>
                        <div className="al-activity-meta">
                          <span>分类：<span className="al-meta-blue">{r.type || "-"}</span></span>
                          <span>时间：{r.time_text || fmtDate(r.start_time)}</span>
                          <span>地点：{r.address || "-"}</span>
                          <span>管理：{r.manager_ids || "-"}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><a className="finord-link" onClick={() => openLink(r)}>查看</a></td>
                  <td><a className="finord-link">查看</a></td>
                  <td><a className="finord-link">查看</a></td>
                  <td>
                    <span className={`al-activity-status al-activity-status-${ACTIVITY_STATUS_TEXT[r.status] || "报名中"}`}>{ACTIVITY_STATUS_TEXT[r.status] || "报名中"}</span>
                  </td>
                  <td>
                    <div className="al-count">
                      <div>男生 <span className="al-count-num">{r.male_count}</span></div>
                      <div>女生 <span className="al-count-num">{r.female_count}</span></div>
                    </div>
                  </td>
                  <td className="al-time">{fmtDate(r.created_at)}</td>
                  <td><span className="al-audit">{AUDIT_TEXT[r.audit_status] || "通过"}</span></td>
                  <td>
                    <button type="button" className={`mp-switch ${r.online ? "on" : ""}`} onClick={() => toggleOnline(r)}>
                      <span className="mp-switch-knob"></span>
                    </button>
                  </td>
                  <td>
                    <div className="al-ops">
                      <a className="finord-link" onClick={() => copyRow(r)}>复制</a>
                      <a className="finord-link" onClick={() => openEdit(r)}>编辑</a>
                      <a className="finord-link">名单展示</a>
                      <a className="finord-link" onClick={() => deleteRow(r)}>删除</a>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={11} style={{ textAlign: "center", padding: "32px 0", color: "#98a2b3" }}>暂无数据</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {addOpen && (
        <AddActiveDrawer
          form={form}
          set={set}
          categories={categories}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          saving={saving}
          submit={submit}
          onClose={() => setAddOpen(false)}
        />
      )}
      {linkOpen && <LinkQrDrawer info={linkInfo} onClose={() => setLinkOpen(false)} />}
    </div>
  );
}

function AddActiveDrawer({ form, set, categories, activeSection, setActiveSection, saving, submit, onClose }: {
  form: FormState;
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  categories: string[];
  activeSection: string;
  setActiveSection: (s: string) => void;
  saving: boolean;
  submit: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel al-drawer-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">{form.id ? "编辑活动" : "添加活动"}</span>
          </div>
          <div className="al-head-actions">
            <button className="finord-btn al-cancel" onClick={onClose}>取消</button>
            <button className="finord-btn finord-btn-primary" onClick={submit} disabled={saving}>{saving ? "提交中…" : "确定提交"}</button>
          </div>
        </div>
        <div className="tlc-panel-body al-drawer-body">
          {/* 左侧菜单 */}
          <div className="al-drawer-sidebar">
            {SIDEBAR_SECTIONS.map((s) => (
              <button key={s} className={`al-drawer-nav ${activeSection === s ? "active" : ""}`} onClick={() => setActiveSection(s)}>
                {s}
              </button>
            ))}
          </div>

          {/* 右侧表单 */}
          <div className="al-drawer-form">
            {activeSection === "基本信息" && (
              <>
                <div className="al-section-head">| 基本信息</div>
                <div className="al-row"><span className="al-label">＊活动名称</span><input className="al-input-wide" placeholder="不要超出50汉字" value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
                <div className="al-row"><span className="al-label">＊活动分类</span>
                  <select className="al-input-wide al-select" value={form.type} onChange={(e) => set("type", e.target.value)}>
                    <option value="">选择活动分类</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="al-row"><span className="al-label">＊活动发起</span><input className="al-input-wide" placeholder="输入主办方名称" value={form.organizer} onChange={(e) => set("organizer", e.target.value)} /></div>
                <div className="al-row al-row-top">
                  <span className="al-label">封面大图</span>
                  <div className="al-content">
                    <label className="al-cover-pick al-cover-pick-wide">
                      {form.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={form.cover} alt="封面大图" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                      ) : (<><Plus size={18} /><span>上传图片</span></>)}
                      <input type="file" accept="image/*" hidden onChange={(e) => pickAndUploadImage(e.target.files?.[0], (url) => set("cover", url), (m) => showConfigToast(m, "error"))} />
                    </label>
                    <div className="al-info">① 最佳尺寸：900×383（与公众号首图一致）</div>
                  </div>
                </div>
                <div className="al-row al-row-top">
                  <span className="al-label">封面小图</span>
                  <div className="al-content">
                    <label className="al-cover-pick al-cover-pick-square">
                      {form.coverSmall ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={form.coverSmall} alt="封面小图" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                      ) : (<><Plus size={18} /><span>上传图片</span></>)}
                      <input type="file" accept="image/*" hidden onChange={(e) => pickAndUploadImage(e.target.files?.[0], (url) => set("coverSmall", url), (m) => showConfigToast(m, "error"))} />
                    </label>
                    <div className="al-info">① 最佳尺寸：300像素x300像素</div>
                  </div>
                </div>
              </>
            )}

            {activeSection === "时间地点" && (
              <>
                <div className="al-section-head">| 时间地点</div>
                <div className="al-row"><span className="al-label">活动时间</span><input className="al-input-wide" placeholder="请输入" value={form.timeText} onChange={(e) => set("timeText", e.target.value)} /><span className="al-text-muted">建议格式示例：9月28号（周六）下午2点-6点</span></div>
                <div className="al-row"><span className="al-label">活动地址</span><input className="al-input-wide" placeholder="请输入详细地址" value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
                <div className="al-row"><span className="al-label">＊报名截止</span><input className="al-input-wide al-date" type="date" value={form.deadlineDate} onChange={(e) => set("deadlineDate", e.target.value)} /></div>
                <div className="al-row"><span className="al-label">＊活动结束</span><input className="al-input-wide al-date" type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} /></div>
                <div className="al-info-block">① 该时间后活动状态自动变更为已结束</div>
              </>
            )}

            {activeSection === "活动费用" && (
              <>
                <div className="al-section-head">| 活动费用</div>
                <div className="al-row">
                  <span className="al-label">活动费用</span>
                  <div className="al-content">
                    <div className="al-fee-row">
                      <span>活动费用</span>
                      <input className="al-num" type="number" value={form.priceMale} onChange={(e) => set("priceMale", Number(e.target.value))} />
                      <span className="al-unit">元</span>
                      <span>女生</span>
                      <input className="al-num" type="number" value={form.priceFemale} onChange={(e) => set("priceFemale", Number(e.target.value))} />
                      <span className="al-unit">元</span>
                    </div>
                    <div className="al-info">① 表示免费。本费用按报名人在性别支付；VIP会员包含线上和线下的两种类型</div>
                  </div>
                </div>
                <div className="al-row"><span className="al-label">费用名称</span><input className="al-input-wide" value={form.feeName} onChange={(e) => set("feeName", e.target.value)} /></div>
              </>
            )}

            {activeSection === "报名要求" && (
              <>
                <div className="al-section-head">| 报名要求</div>
                <div className="al-row al-row-top">
                  <span className="al-label">报名要求</span>
                  <div className="al-content">
                    <div className="al-radio-row">
                      {([["anyone", "任何人都可以报名"], ["member", "相亲会员才可以报名"]] as const).map(([v, label]) => (
                        <label key={v} className={`al-radio ${form.signupMode === v ? "active" : ""}`}>
                          <input type="radio" name="signupMode" value={v} checked={form.signupMode === v} onChange={() => set("signupMode", v)} />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="al-info">① 用户只需要在平台一微信登录并绑定手机号后（无需完善资料和相亲会员）按照表单填写资料即可完成报名，报名后可浏览到以及一键将客户加入到会员CRM中分成奖励顾客</div>
                    <div className="al-form-grid">
                      <span>姓名：<span className="al-req">必填</span></span>
                      <span>手机：<span className="al-req">必填</span></span>
                      <span>性别：<span className="al-req">必填</span></span>
                      <span>年龄：<span className="al-req">必填</span></span>
                      <span>身高：</span>
                      <span>婚况：</span>
                      <span>单位：</span>
                      <span>收入：</span>
                      <span>学历：</span>
                      <span>头像：</span>
                      <span>身份证号：</span>
                    </div>
                    <label className="al-checkbox">
                      <input type="checkbox" checked={form.requireRealname} onChange={(e) => set("requireRealname", e.target.checked)} />
                      <span>必须实名认证</span>
                    </label>
                    <div className="al-info">② 勾选后，客户报名时会自动提示并引导客户完成实名认证再行报名</div>
                  </div>
                </div>
              </>
            )}

            {activeSection === "人数限额" && (
              <>
                <div className="al-section-head">| 人数限额</div>
                <div className="al-row al-row-top">
                  <span className="al-label">名额限制</span>
                  <div className="al-content">
                    <div className="al-radio-row">
                      {([["gender", "限制男女人数"], ["total", "仅限制总人数"]] as const).map(([v, label]) => (
                        <label key={v} className={`al-radio ${form.limitMode === v ? "active" : ""}`}>
                          <input type="radio" name="limitMode" value={v} checked={form.limitMode === v} onChange={() => set("limitMode", v)} />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="al-fee-row">
                      <span>男生</span>
                      <input className="al-num" type="number" value={form.maxMale} onChange={(e) => set("maxMale", Number(e.target.value))} />
                      <span className="al-unit">人</span>
                      <span>女生</span>
                      <input className="al-num" type="number" value={form.maxFemale} onChange={(e) => set("maxFemale", Number(e.target.value))} />
                      <span className="al-unit">人</span>
                    </div>
                    <div className="al-info">① 默认均为不限制。报名数超出所设置后无法继续报名</div>
                    <div className="al-fee-row">
                      <span>报名人数</span>
                      <input className="al-num" type="number" value={form.virtualPeople} onChange={(e) => set("virtualPeople", Number(e.target.value))} />
                      <span className="al-unit">人</span>
                      <span>女生</span>
                      <input className="al-num" type="number" value={form.virtualFemale} onChange={(e) => set("virtualFemale", Number(e.target.value))} />
                      <span className="al-unit">人</span>
                    </div>
                    <div className="al-info">② 显示人数在此基础上累计</div>
                    <div className="al-switch-row">
                      <span>隐藏报名数</span>
                      <button type="button" className={`mp-switch ${form.hideSignupCount ? "on" : ""}`} onClick={() => set("hideSignupCount", !form.hideSignupCount)}><span className="mp-switch-knob"></span></button>
                    </div>
                    <div className="al-info">③ 当设置为开启的状态下，在活动报名的页面中将不显示本次活动数</div>
                  </div>
                </div>
              </>
            )}

            {activeSection === "红娘奖励" && (
              <>
                <div className="al-section-head">| 红娘奖励</div>
                <div className="al-row al-row-top">
                  <span className="al-label">奖励</span>
                  <div className="al-content">
                    <div className="al-fee-row">
                      <span>推广红娘奖励</span>
                      <input className="al-num" type="number" value={form.rewardPromoter} onChange={(e) => set("rewardPromoter", Number(e.target.value))} />
                      <span className="al-unit">元</span>
                      <span>服务红娘奖励</span>
                      <input className="al-num" type="number" value={form.rewardService} onChange={(e) => set("rewardService", Number(e.target.value))} />
                      <span className="al-unit">元</span>
                      <span>合伙红娘奖励</span>
                      <input className="al-num" type="number" value={form.rewardPartner} onChange={(e) => set("rewardPartner", Number(e.target.value))} />
                      <span className="al-unit">元</span>
                    </div>
                    <div className="al-info">① 用户会员报名本活动支付费用后，其所属推广红娘、服务红娘获得的奖励金额，0表示不奖励<br />特别提醒：报名人未完善资料（非会员）的情况下，所属推广红娘照可获得分成</div>
                  </div>
                </div>
              </>
            )}

            {activeSection === "活动详情" && (
              <>
                <div className="al-section-head">| 活动详情</div>
                <div className="al-row al-row-top">
                  <span className="al-label">＊活动详情</span>
                  <div className="al-content">
                    <div className="al-editor">
                      <div className="al-editor-toolbar">
                        {TOOLBAR.map((it, idx) => (
                          <button key={idx} type="button" className="al-editor-tool" title={it.title}>{it.icon}</button>
                        ))}
                      </div>
                      <div className="al-editor-body" contentEditable suppressContentEditableWarning onBlur={(e) => set("description", e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{ __html: form.description }} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeSection === "活动提醒" && (
              <>
                <div className="al-section-head">| 活动提醒</div>
                <div className="al-row al-row-top">
                  <span className="al-label">活动提醒</span>
                  <div className="al-content">
                    <div className="al-editor">
                      <div className="al-editor-toolbar">
                        {TOOLBAR.map((it, idx) => (
                          <button key={idx} type="button" className="al-editor-tool" title={it.title}>{it.icon}</button>
                        ))}
                      </div>
                      <div className="al-editor-body" contentEditable suppressContentEditableWarning onBlur={(e) => set("reminderHtml", e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{ __html: form.reminderHtml }} />
                    </div>
                    <div className="al-info">① 本内容将会显示在报名成功后的提醒页面</div>
                  </div>
                </div>
              </>
            )}

            {activeSection === "其他设置" && (
              <>
                <div className="al-section-head">| 其他设置</div>
                <div className="al-row"><span className="al-label">客服微信</span><input className="al-input-wide" value={form.serviceWechat} onChange={(e) => set("serviceWechat", e.target.value)} /></div>
                <div className="al-row al-row-top">
                  <span className="al-label">客服二维码</span>
                  <div className="al-content">
                    <label className="al-cover-pick al-cover-pick-square">
                      {form.serviceQr ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={form.serviceQr} alt="客服二维码" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                      ) : (<><Plus size={18} /><span>上传图片</span></>)}
                      <input type="file" accept="image/*" hidden onChange={(e) => pickAndUploadImage(e.target.files?.[0], (url) => set("serviceQr", url), (m) => showConfigToast(m, "error"))} />
                    </label>
                    <div className="al-info">① 留空则自动默认显示平台客服的微信号和二维码（系统管理-系统配置中修改）</div>
                  </div>
                </div>
                <div className="al-row"><span className="al-label">浏览人气</span><input className="al-num" type="number" value={form.virtualViews} onChange={(e) => set("virtualViews", Number(e.target.value))} /></div>
                <div className="al-row"><span className="al-label">显示排序</span><input className="al-num" type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} /></div>
                <div className="al-info-block">① 数字越大显示越靠前</div>
                <div className="al-switch-row">
                  <span>自定义分享</span>
                  <button type="button" className={`mp-switch ${form.customShare ? "on" : ""}`} onClick={() => set("customShare", !form.customShare)}>
                    <span className="mp-switch-knob"></span>
                  </button>
                </div>
                <div className="al-info">② 若不启用则使用系统默认的分享封面、标题、摘要、预览效果</div>
              </>
            )}

            {activeSection === "管理设置" && (
              <>
                <div className="al-section-head">| 管理设置</div>
                <div className="al-row al-row-top">
                  <span className="al-label">＊管理红娘</span>
                  <div className="al-content">
                    <input className="al-input-wide" placeholder="请输入服务红娘的账号昵称" value={form.managerIds} onChange={(e) => set("managerIds", e.target.value)} />
                    <div className="al-info">① 可以设置多个红娘来管理、查看此活动的报名资料、扫码签到；超级红娘可管理查看所有活动的报名</div>
                  </div>
                </div>
                <div className="al-row al-row-top">
                  <span className="al-label">短信通知</span>
                  <div className="al-content">
                    <input className="al-input-wide" placeholder="请输入手机号" value={form.notifyPhones} onChange={(e) => set("notifyPhones", e.target.value)} />
                    <div className="al-info">① 设置号码后，有人报名活动时，将发送短信提醒到该指定手机号；最多可设置3个，多个手机号用逗号隔开；若留空则自动通知所有活动的管理红娘</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function LinkQrDrawer({ info, onClose }: { info: ActivityLinkInfo | null; onClose: () => void }) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel al-link-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">链接/二维码</span>
          </div>
          <div className="al-head-actions">
            <button className="finord-btn al-cancel" onClick={onClose}>关闭</button>
          </div>
        </div>
        <div className="tlc-panel-body al-link-body">
          <div className="al-link-url">链接地址</div>
          <input className="al-input-wide al-link-url-input" readOnly value={info?.link_url || ""} />
          <div className="al-link-qr-title">二维码</div>
          <div className="al-link-qr">
            <div className="al-phone">
              <div className="al-phone-bar" />
              <div className="al-phone-screen">
                <div className="al-phone-banner">
                  <div className="al-phone-banner-top">同城活动</div>
                  <div className="al-phone-banner-pill">百聊不如一见</div>
                  <div className="al-phone-banner-sub">同城相亲 交流活动</div>
                  <div className="al-phone-banner-btn">
                    <span className="al-phone-banner-btn-pink">线下活动</span>
                    <span className="al-phone-banner-btn-yellow">线上互选</span>
                  </div>
                  <div className="al-phone-qr">
                    <div className="al-phone-qr-grid">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div key={i} className="al-phone-qr-cell" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="al-phone-poster">
                  <div className="al-phone-poster-text">单身青年<br />免费择偶<br />竞争力评分</div>
                </div>
                <div className="al-phone-poster-small">
                  <div className="al-phone-poster-small-text">1年内结婚 专场脱单</div>
                </div>
                <div className="al-phone-card">
                  <div className="al-phone-card-cover" />
                  <div className="al-phone-card-info">
                    <div className="al-phone-card-name">7.26 一年内结婚专场</div>
                    <div className="al-phone-card-tag">报名专享 · 7.26 14点 持续进行中</div>
                  </div>
                </div>
                <div className="al-phone-tab-bar">
                  <span className="al-phone-tab">最新发布</span>
                  <span className="al-phone-tab">会员专区</span>
                  <span className="al-phone-tab">已订婚会员</span>
                  <span className="al-phone-tab">脱单情报员</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
