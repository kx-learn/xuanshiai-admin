"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Type, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, Quote, List, ListOrdered, Link2, Image as ImageIcon, Smile, Code, Heading1, Heading2, RotateCcw, RotateCw, Maximize2, Minus, Plus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints, type MutualActivityItem, type MutualParticipant } from "@/lib/admin-endpoints";
import { pickAndUploadImage, showConfigToast } from "@/lib/platform-config";

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

const columns = ["ID", "活动名称", "创建时间", "活动时间", "活动状态", "真实报名人数", "参与嘉宾", "上线", "链接/二维码", "操作"];

const STATUS_TEXT: Record<number, string> = { 1: "报名中", 2: "进行中", 3: "活动结束" };

const fmt = (v: string | null | undefined) => (v ? v.replace("T", " ").slice(0, 16) : "-");

interface Form {
  id: number | null;
  title: string;
  cover: string | null;
  startDate: string;
  endDate: string;
  pickLimit: number;
  virtualSignup: number;
  priceMale: number;
  priceFemale: number;
  priceVip: number;
  rewardPromoter: number;
  rewardService: number;
  requireRealname: boolean;
  requireAvatar: boolean;
  requireThreePhoto: boolean;
  intro: string;
  shareTitle: string;
  syncTitle: boolean;
  shareDesc: string;
  shareIcon: string | null;
  wechatInfo: boolean;
  noticeHtml: string;
  successNotice: string;
}

const EMPTY_FORM: Form = {
  id: null, title: "", cover: null, startDate: "", endDate: "", pickLimit: 5, virtualSignup: 0,
  priceMale: 0, priceFemale: 0, priceVip: 0, rewardPromoter: 0, rewardService: 0,
  requireRealname: false, requireAvatar: false, requireThreePhoto: false, intro: "",
  shareTitle: "", syncTitle: false, shareDesc: "", shareIcon: null, wechatInfo: true,
  noticeHtml: "", successNotice: "",
};

function toForm(r: MutualActivityItem): Form {
  return {
    id: r.id, title: r.title, cover: r.cover,
    startDate: r.start_time ? r.start_time.slice(0, 10) : "",
    endDate: r.end_time ? r.end_time.slice(0, 10) : "",
    pickLimit: r.pick_limit ?? 5, virtualSignup: r.virtual_signup ?? 0,
    priceMale: r.price_male ?? 0, priceFemale: r.price_female ?? 0, priceVip: r.price_vip ?? 0,
    rewardPromoter: r.reward_promoter ?? 0, rewardService: r.reward_service ?? 0,
    requireRealname: !!r.require_realname, requireAvatar: !!r.require_avatar, requireThreePhoto: !!r.require_three_photo,
    intro: r.intro ?? "", shareTitle: r.share_title ?? "", syncTitle: false, shareDesc: r.share_desc ?? "",
    shareIcon: r.share_icon, wechatInfo: r.success_mode !== "contact_matchmaker",
    noticeHtml: r.notice_html ?? "", successNotice: r.success_notice ?? "",
  };
}

export default function MutualSelectionListPage() {
  const [rows, setRows] = useState<MutualActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [participantOf, setParticipantOf] = useState<MutualActivityItem | null>(null);

  const load = useCallback(async (kw = keyword) => {
    setLoading(true);
    try {
      const res = await adminEndpoints.mutualActivityList({ page: 1, page_size: 50, keyword: kw || undefined });
      setRows(res.items);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => { load(""); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setPanelOpen(true); };
  const openEdit = (r: MutualActivityItem) => { setForm(toForm(r)); setPanelOpen(true); };

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const toggleVisible = async (r: MutualActivityItem) => {
    const next = !r.visible;
    setRows((list) => list.map((x) => (x.id === r.id ? { ...x, visible: next } : x)));
    try {
      await adminEndpoints.setMutualActivityVisible(r.id, next);
    } catch (e) {
      setRows((list) => list.map((x) => (x.id === r.id ? { ...x, visible: r.visible } : x)));
      showConfigToast(e instanceof Error ? e.message : "操作失败", "error");
    }
  };

  const copyRow = async (r: MutualActivityItem) => {
    try {
      await adminEndpoints.copyMutualActivity(r.id);
      showConfigToast("复制成功", "ok");
      load();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "复制失败", "error");
    }
  };

  const deleteRow = async (r: MutualActivityItem) => {
    if (!window.confirm(`确定删除互选活动「${r.title}」？`)) return;
    try {
      await adminEndpoints.deleteMutualActivity(r.id);
      showConfigToast("删除成功", "ok");
      load();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const submit = async () => {
    if (!form.title.trim()) { showConfigToast("请填写活动标题", "error"); return; }
    const endDate = form.endDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const start = `${form.startDate || endDate}T08:59:00`;
    const end = `${endDate}T23:59:00`;
    const payload = {
      title: form.title,
      cover: form.cover,
      start_time: start,
      end_time: end,
      pick_limit: form.pickLimit,
      virtual_signup: form.virtualSignup,
      price_male: form.priceMale,
      price_female: form.priceFemale,
      price_vip: form.priceVip,
      reward_promoter: form.rewardPromoter,
      reward_service: form.rewardService,
      require_realname: form.requireRealname,
      require_avatar: form.requireAvatar,
      require_three_photo: form.requireThreePhoto,
      intro: form.intro || null,
      share_title: form.syncTitle ? form.title : (form.shareTitle || null),
      share_desc: form.shareDesc || null,
      share_icon: form.shareIcon,
      success_mode: form.wechatInfo ? "show_wechat" : "contact_matchmaker",
      notice_html: form.noticeHtml || null,
      success_notice: form.successNotice || null,
    } as Partial<MutualActivityItem>;
    setSaving(true);
    try {
      if (form.id) {
        await adminEndpoints.updateMutualActivity(form.id, payload);
      } else {
        await adminEndpoints.createMutualActivity(payload);
      }
      showConfigToast("提交成功", "ok");
      setPanelOpen(false);
      load();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "提交失败", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>互选CP活动是目前非常流行且受欢迎的一种线上交友形式,参与者可以在互选大厅中,自主浏览并选择自己心仪的对象,当两个人都选择了对方,视为互选成功,即可互加微信(微信加个推报片名)。</p>
            <p>互选活动可以有效的帮婚恋公司获取单身客源、激活推广客户、还能大大提高客户与红娘之间的粘性和沟通,提高销售转化。同时,互选的结果也给红娘提供了非常精准的数据依据,判断新客户的意向和择偶需求,帮助红娘提高配精准度。</p>
            <p>活动流程: 1.创建活动 2.活动宣传邀约报名(这是最重要的获客引流环节) 3.互选活动开始 4.活动结束(红娘根据选择结果进行逐一面访邀约) 5.活动回顾。</p>
            <p>互选活动分为三种状态:</p>
            <p>1、报名中: 在活动开始之前活动状态为"报名中",会员可以在线报名加入活动,管理员也可以在后手动将其报名加入活动中。</p>
            <p>2、进行中: 在活动开始时间后,活动状态自动变更为"进行中",不可以再报名,所有已报名会员在活动结束时间之前可以查看对方已加心意嘉宾;</p>
            <p>3、已结束: 在活动结束时间之后,活动状态自动变更为"已结束",所有参与嘉宾的信息将不再允许被任何人浏览。</p>
            <p>重点逻辑说明:</p>
            <p>1、在活动单位参与互选时,管理员也可以选择已设定的心动嘉宾数,活动结束之后每位参与可对已选择嘉宾发取消心动,取消后不计入次数;</p>
            <p>2、活动结束之后,才可以查看哪些嘉宾选择了自己;</p>
            <p>3、活动结束之后,若互选都选择了对方心动嘉宾,则被视为"互选成功",嘉宾自行添加对方微信号或者由红娘介入互推微信名片。</p>
          </div>
        </div>
      </div>

      <div className="finord-card ms-card">
        <div className="ms-head">
          <h2 className="ms-title">活动管理</h2>
          <button className="finord-btn finord-btn-primary ms-create-btn" onClick={openAdd}>＋ 创建活动</button>
        </div>

        <div className="ms-filters">
          <input className="ms-input" placeholder="请输入关键字搜索" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
          <button className="finord-btn finord-btn-primary ms-search-btn" onClick={() => load()}>搜索</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table ms-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="ms-row-content">
                      <input type="checkbox" className="ms-check" />
                      <span className="ms-id">{r.id}</span>
                    </div>
                  </td>
                  <td>
                    <div className="ms-activity">
                      <div className="ms-cover ms-cover-mutual">{r.title.slice(0, 2)}</div>
                      <div className="ms-activity-info">
                        <div className="ms-activity-name">{r.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="ms-time">{fmt(r.created_at)}</td>
                  <td>
                    <div className="ms-time-block">
                      <div>开始：{fmt(r.start_time)}</div>
                      <div>结束：{fmt(r.end_time)}</div>
                    </div>
                  </td>
                  <td><span className="ms-status">{STATUS_TEXT[r.status] || "报名中"}</span></td>
                  <td>
                    <div className="ms-count">
                      <div>男生 <span className="ms-count-num">{r.male_count}</span>人</div>
                      <div>女生 <span className="ms-count-num">{r.female_count}</span>人</div>
                    </div>
                  </td>
                  <td><a className="finord-link" onClick={() => setParticipantOf(r)}>添加/查看</a></td>
                  <td>
                    <button type="button" className={`mp-switch ${r.visible ? "on" : ""}`} onClick={() => toggleVisible(r)}>
                      <span className="mp-switch-knob"></span>
                    </button>
                  </td>
                  <td><a className="finord-link" onClick={() => r.link_url && window.open(r.link_url, "_blank")}>查看</a></td>
                  <td>
                    <div className="ms-ops">
                      <a className="finord-link">群发短信</a>
                      <a className="finord-link" onClick={() => openEdit(r)}>编辑</a>
                      <a className="finord-link" onClick={() => copyRow(r)}>复制</a>
                      <a className="finord-link" onClick={() => deleteRow(r)}>删除</a>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={columns.length} style={{ textAlign: "center", padding: "32px 0", color: "#98a2b3" }}>暂无数据</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="ms-pager">
          <span className="ms-pager-arrow">‹</span>
          <span className="ms-pager-cur">1</span>
          <span className="ms-pager-arrow">›</span>
        </div>
      </div>

      {panelOpen && (
        <CreateMutualDrawer form={form} set={set} saving={saving} submit={submit} onClose={() => setPanelOpen(false)} />
      )}
      {participantOf && (
        <ParticipantDrawer activity={participantOf} onClose={() => setParticipantOf(null)} />
      )}
    </div>
  );
}

function CreateMutualDrawer({ form, set, saving, submit, onClose }: {
  form: Form;
  set: <K extends keyof Form>(key: K, value: Form[K]) => void;
  saving: boolean;
  submit: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel ms-drawer-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">{form.id ? "编辑活动" : "添加活动"}</span>
          </div>
          <div className="ms-head-actions">
            <button className="finord-btn ms-cancel" onClick={onClose}>取消</button>
            <button className="finord-btn finord-btn-primary" onClick={submit} disabled={saving}>{saving ? "提交中…" : "确定提交"}</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 活动标题 */}
          <div className="ms-row">
            <span className="ms-label">＊活动标题</span>
            <div className="ms-content">
              <input className="ms-input-wide" placeholder="最多80字符" value={form.title} onChange={(e) => set("title", e.target.value)} />
              <div className="ms-info">活动标题参考</div>
            </div>
          </div>

          {/* 封面图片 */}
          <div className="ms-row ms-row-top">
            <span className="ms-label">＊封面图片</span>
            <div className="ms-content">
              <label className="ms-pick">
                {form.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.cover} alt="封面" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                ) : (<><Plus size={18} /><span>上传图片</span></>)}
                <input type="file" accept="image/*" hidden onChange={(e) => pickAndUploadImage(e.target.files?.[0], (url) => set("cover", url), (m) => showConfigToast(m, "error"))} />
              </label>
              <button type="button" className="ms-cloud-btn">📷 从云端素材</button>
              <div className="ms-info">① 最佳尺寸：900×383（与公众号首图一致）</div>
            </div>
          </div>

          {/* 活动时间 */}
          <div className="ms-row">
            <span className="ms-label">＊活动时间</span>
            <div className="ms-content">
              <div className="ms-daterange">
                <span>开始日期</span>
                <input className="ms-date" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
                <span className="ms-text-muted">→</span>
                <span>结束日期</span>
                <input className="ms-date" type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
              </div>
              <div className="ms-info">① 在开始日期之前,活动状态为"报名中",可报名;开始时间之后为"进行中",不可再报名,所有已报名会员在活动结束时间之前可以查看对方已加心意嘉宾;在结束时间之后,活动状态自动变更为"已结束"。</div>
            </div>
          </div>

          {/* 选择人数 */}
          <div className="ms-row">
            <span className="ms-label">选择人数</span>
            <div className="ms-content">
              <div className="ms-fee-row">
                <input className="ms-num" type="number" value={form.pickLimit} onChange={(e) => set("pickLimit", Number(e.target.value))} />
                <span className="ms-unit">次</span>
              </div>
              <div className="ms-info">① 本次活动参与嘉宾可以选择的心动嘉宾人数</div>
            </div>
          </div>

          {/* 显示报名人数 */}
          <div className="ms-row">
            <span className="ms-label">显示报名人数</span>
            <div className="ms-content">
              <input className="ms-num" type="number" value={form.virtualSignup} onChange={(e) => set("virtualSignup", Number(e.target.value))} />
              <div className="ms-info">① 平台中显示报名人数将在此设置数值上累加</div>
            </div>
          </div>

          {/* 活动费用 */}
          <div className="ms-row">
            <span className="ms-label">活动费用</span>
            <div className="ms-content">
              <div className="ms-fee-row">
                <span>男生</span>
                <input className="ms-num" type="number" value={form.priceMale} onChange={(e) => set("priceMale", Number(e.target.value))} />
                <span className="ms-unit">元</span>
                <span>女生</span>
                <input className="ms-num" type="number" value={form.priceFemale} onChange={(e) => set("priceFemale", Number(e.target.value))} />
                <span className="ms-unit">元</span>
                <span>VIP会员</span>
                <input className="ms-num" type="number" value={form.priceVip} onChange={(e) => set("priceVip", Number(e.target.value))} />
                <span className="ms-unit">元</span>
              </div>
              <div className="ms-info">① 0表示免费。本费用需报名人在线支付;VIP会员包含线上和线下的两种类型</div>
            </div>
          </div>

          {/* 红娘奖励 */}
          <div className="ms-row">
            <span className="ms-label">红娘奖励</span>
            <div className="ms-content">
              <div className="ms-fee-row">
                <span>推广红娘奖励</span>
                <input className="ms-num" type="number" value={form.rewardPromoter} onChange={(e) => set("rewardPromoter", Number(e.target.value))} />
                <span className="ms-unit">元</span>
                <span>服务红娘奖励</span>
                <input className="ms-num" type="number" value={form.rewardService} onChange={(e) => set("rewardService", Number(e.target.value))} />
                <span className="ms-unit">元</span>
              </div>
              <div className="ms-info">① 会员报名本活动支付费用后,其所属推广红娘、服务红娘获得的奖励金额,0表示不奖励,红娘在微信中转发活动详情页,客户点击关注后即可跟我们红娘绑定归属关系</div>
            </div>
          </div>

          {/* 报名要求 */}
          <div className="ms-row ms-row-top">
            <span className="ms-label">报名要求</span>
            <div className="ms-content">
              <div className="ms-checks-row">
                <label className="ms-checkbox">
                  <input type="checkbox" checked={form.requireRealname} onChange={() => set("requireRealname", !form.requireRealname)} />
                  <span>实名认证</span>
                </label>
                <label className="ms-checkbox">
                  <input type="checkbox" checked={form.requireAvatar} onChange={() => set("requireAvatar", !form.requireAvatar)} />
                  <span>必须有头像</span>
                </label>
                <label className="ms-checkbox">
                  <input type="checkbox" checked={form.requireThreePhoto} onChange={() => set("requireThreePhoto", !form.requireThreePhoto)} />
                  <span>必须至少有3张照片</span>
                </label>
              </div>
              <div className="ms-form-grid">
                <span className="ms-form-item">年龄：<em className="ms-required">必填</em></span>
                <span className="ms-form-item">学历：<em className="ms-required">必填</em></span>
                <span className="ms-form-item">收入：<select className="ms-select-inline"><option>请选择</option></select></span>
              </div>
            </div>
          </div>

          {/* 活动介绍 */}
          <div className="ms-row ms-row-top">
            <span className="ms-label">＊活动介绍</span>
            <div className="ms-content">
              <div className="ms-editor">
                <div className="ms-editor-toolbar">
                  {TOOLBAR.map((it, idx) => (
                    <button key={idx} type="button" className="ms-editor-tool" title={it.title}>{it.icon}</button>
                  ))}
                </div>
                <div className="ms-editor-body" contentEditable suppressContentEditableWarning onBlur={(e) => set("intro", e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{ __html: form.intro }} />
              </div>
              <div className="ms-link-row">
                <a className="finord-link">查看别人怎么写的</a>
              </div>
              <div className="ms-required-text">请输入活动介绍</div>
            </div>
          </div>

          {/* 分享标题 */}
          <div className="ms-row">
            <span className="ms-label">分享标题</span>
            <div className="ms-content">
              <div className="ms-share-row">
                <input className="ms-input-wide" placeholder="不要超出50文字" value={form.shareTitle} onChange={(e) => set("shareTitle", e.target.value)} />
                <label className="ms-checkbox ms-checkbox-right">
                  <input type="checkbox" checked={form.syncTitle} onChange={() => set("syncTitle", !form.syncTitle)} />
                  <span>同步标题</span>
                </label>
              </div>
            </div>
          </div>

          {/* 分享描述 */}
          <div className="ms-row ms-row-top">
            <span className="ms-label">分享描述</span>
            <div className="ms-content">
              <textarea className="ms-textarea" rows={3} value={form.shareDesc} onChange={(e) => set("shareDesc", e.target.value)} />
            </div>
          </div>

          {/* 分享图标 */}
          <div className="ms-row ms-row-top">
            <span className="ms-label">分享图标</span>
            <div className="ms-content">
              <div className="ms-icon-row">
                <label className="ms-pick ms-pick-square">
                  {form.shareIcon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.shareIcon} alt="分享图标" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                  ) : (<><Plus size={18} /><span>上传图标</span></>)}
                  <input type="file" accept="image/*" hidden onChange={(e) => pickAndUploadImage(e.target.files?.[0], (url) => set("shareIcon", url), (m) => showConfigToast(m, "error"))} />
                </label>
                <button type="button" className="ms-cloud-btn">📷 从云端素材</button>
              </div>
            </div>
          </div>

          {/* 互选成功后 */}
          <div className="ms-row ms-row-top">
            <span className="ms-label">互选成功后</span>
            <div className="ms-content">
              <div className="ms-radio-row">
                <label className="ms-radio">
                  <input type="radio" name="wechatInfo" value="show" checked={form.wechatInfo} onChange={() => set("wechatInfo", true)} />
                  <span>显示双方微信信息已加</span>
                </label>
                <a className="finord-link">效果参考</a>
                <label className="ms-radio">
                  <input type="radio" name="wechatInfo" value="hide" checked={!form.wechatInfo} onChange={() => set("wechatInfo", false)} />
                  <span>提示联系红娘推送微信号</span>
                </label>
                <a className="finord-link">效果参考</a>
              </div>
            </div>
          </div>

          {/* 进入嘉宾互选时弹出的须知 */}
          <div className="ms-row ms-row-top">
            <span className="ms-label">进入嘉宾互选时弹出的须知</span>
            <div className="ms-content">
              <div className="ms-note-box" contentEditable suppressContentEditableWarning onBlur={(e) => set("noticeHtml", e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{ __html: form.noticeHtml || "<div>想在本次活动中可以选择心仪嘉宾为心仪对象;</div><div>活动结束之前您可以取消已选的嘉宾,不计入人数;</div><div>活动结束后,互选选择的心动嘉宾可以查对方微信号。</div>" }} />
              <div className="ms-link-row">
                <a className="finord-link">效果参考</a>
              </div>
            </div>
          </div>

          {/* 互选成功后添加微信页面提示 */}
          <div className="ms-row ms-row-top">
            <span className="ms-label">互选成功后添加微信页面的提示</span>
            <div className="ms-content">
              <div className="ms-note-box" contentEditable suppressContentEditableWarning onBlur={(e) => set("successNotice", e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{ __html: form.successNotice || "<div>这是一个有温度的交友平台,希望大家在尊重、严肃认真对待</div><div>流程择偶标准,也无论最终100%的准确命中率,更无法确保真实的</div><div>诚信交友!请慎重交友!</div>" }} />
            </div>
          </div>

          <div className="ms-submit-row">
            <button className="finord-btn finord-btn-primary ms-submit" onClick={submit} disabled={saving}>{saving ? "提交中…" : "确定提交"}</button>
          </div>
        </div>
      </div>
    </>
  );
}

function ParticipantDrawer({ activity, onClose }: { activity: MutualActivityItem; onClose: () => void }) {
  const [list, setList] = useState<MutualParticipant[]>([]);
  const [userId, setUserId] = useState("");

  const load = useCallback(() => {
    adminEndpoints.mutualParticipants(activity.id).then(setList).catch(() => undefined);
  }, [activity.id]);
  useEffect(load, [load]);

  const add = async () => {
    if (!userId) return;
    try {
      await adminEndpoints.addMutualParticipant(activity.id, Number(userId));
      setUserId("");
      load();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "添加失败", "error");
    }
  };
  const remove = async (uid: number) => {
    try {
      await adminEndpoints.removeMutualParticipant(activity.id, uid);
      load();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "移除失败", "error");
    }
  };

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel ms-drawer-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">参与嘉宾 · {activity.title}</span>
          </div>
          <div className="ms-head-actions">
            <button className="finord-btn ms-cancel" onClick={onClose}>关闭</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          <div className="ms-row">
            <span className="ms-label">添加嘉宾</span>
            <div className="ms-content">
              <div className="ms-fee-row">
                <input className="ms-input-wide" placeholder="输入会员ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
                <button className="finord-btn finord-btn-primary" onClick={add}>添加</button>
              </div>
            </div>
          </div>
          <div className="finord-table-wrap">
            <table className="finord-table ms-table">
              <thead>
                <tr><th>会员ID</th><th>昵称</th><th>性别</th><th>操作</th></tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.user_id}>
                    <td>{p.user_id}</td>
                    <td>{p.nickname || "-"}</td>
                    <td>{p.gender || "-"}</td>
                    <td><a className="finord-link" onClick={() => remove(p.user_id)}>移除</a></td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: "24px 0", color: "#98a2b3" }}>暂无参与嘉宾</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
