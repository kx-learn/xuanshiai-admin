"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Camera, Type, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link2, Image as ImageIcon, Smile, Quote, Code, Heading1, Heading2, RotateCcw, RotateCw, Trash2, Maximize2, Plus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminApi } from "@/lib/admin-api";
import { showConfigToast } from "@/lib/platform-config";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "搭子社群", href: "/group-menu" },
  { label: "社群管理" },
];

type GroupContent = {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  amount: number | null;
  status: number;
  sort: number;
  extra: Record<string, unknown>;
  created_at: string | null;
};

type GroupPage = { items: GroupContent[]; total: number; page: number; page_size: number };

const STATUS_OPTIONS = ["邀请加入", "已满", "下线"] as const;
type StatusKey = (typeof STATUS_OPTIONS)[number];

const SIGNUP_OPTIONS = ["注册登录", "完善资料（无需实名认证）", "需实名认证"] as const;
type SignupKey = (typeof SIGNUP_OPTIONS)[number];

type GroupDraft = {
  id: number | null;
  title: string;
  area: string;
  category: string;
  cover_url: string;
  banner_url: string;
  tags: string[];
  signup_mode: SignupKey;
  fee: number;
  reward: number;
  initiator: string;
  content_html: string;
  sort: number;
  status: StatusKey;
  online: boolean;
};

const EMPTY_DRAFT: GroupDraft = {
  id: null,
  title: "",
  area: "",
  category: "",
  cover_url: "",
  banner_url: "",
  tags: [],
  signup_mode: "注册登录",
  fee: 0,
  reward: 0,
  initiator: "",
  content_html: "",
  sort: 100,
  status: "邀请加入",
  online: true,
};

const GX_TOOLBAR: { icon: React.ReactNode; title: string }[] = [
  { icon: <Heading1 size={14} />, title: "标题" },
  { icon: <Type size={14} />, title: "正文" },
  { icon: <Bold size={14} />, title: "加粗" },
  { icon: <Italic size={14} />, title: "斜体" },
  { icon: <Underline size={14} />, title: "下划线" },
  { icon: <Strikethrough size={14} />, title: "删除线" },
  { icon: <AlignLeft size={14} />, title: "左对齐" },
  { icon: <AlignCenter size={14} />, title: "居中" },
  { icon: <AlignRight size={14} />, title: "右对齐" },
  { icon: <List size={14} />, title: "无序列表" },
  { icon: <ListOrdered size={14} />, title: "有序列表" },
  { icon: <Quote size={14} />, title: "引用" },
  { icon: <Link2 size={14} />, title: "链接" },
  { icon: <ImageIcon size={14} />, title: "图片" },
  { icon: <Smile size={14} />, title: "表情" },
  { icon: <Code size={14} />, title: "代码" },
  { icon: <Plus size={14} />, title: "更多" },
  { icon: <RotateCcw size={14} />, title: "撤销" },
  { icon: <RotateCw size={14} />, title: "重做" },
  { icon: <Trash2 size={14} />, title: "清空" },
  { icon: <Maximize2 size={14} />, title: "全屏" },
];

const CATEGORIES = ["美食搭子", "运动搭子", "旅行搭子", "读书搭子", "电影搭子", "音乐搭子", "其他"];

export default function GroupListPage() {
  const [rows, setRows] = useState<GroupContent[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIdx, setPageIdx] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [gxOpen, setGxOpen] = useState(false);
  const [draft, setDraft] = useState<GroupDraft>(EMPTY_DRAFT);
  const [signupMode, setSignupMode] = useState<SignupKey>("注册登录");

  const load = async (page = pageIdx) => {
    try {
      const resp = await adminApi<GroupPage>("admin/content/community_group", {
        method: "GET",
        query: { page, page_size: 20, keyword: keyword || undefined },
      });
      setRows(resp.items);
      setTotal(resp.total);
      setPageIdx(resp.page);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    }
  };

  useEffect(() => {
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setDraft(EMPTY_DRAFT);
    setSignupMode("注册登录");
    setGxOpen(true);
  };

  const openEdit = (item: GroupContent) => {
    const extra = item.extra ?? {};
    const tags = Array.isArray(extra.tags) ? (extra.tags as string[]) : [];
    const mode = typeof extra.signup_mode === "string" ? (extra.signup_mode as SignupKey) : "注册登录";
    const status = typeof extra.status === "string" ? (extra.status as StatusKey) : "邀请加入";
    setDraft({
      id: item.id,
      title: item.title,
      area: typeof extra.area === "string" ? extra.area : "",
      category: typeof extra.category === "string" ? extra.category : "",
      cover_url: item.image_url ?? "",
      banner_url: typeof extra.banner_url === "string" ? extra.banner_url : "",
      tags,
      signup_mode: mode,
      fee: typeof extra.fee === "number" ? extra.fee : (item.amount ?? 0),
      reward: typeof extra.reward === "number" ? extra.reward : 0,
      initiator: typeof extra.initiator === "string" ? extra.initiator : (item.subtitle ?? ""),
      content_html: typeof extra.content_html === "string" ? extra.content_html : "",
      sort: item.sort ?? 100,
      status,
      online: item.status === 1,
    });
    setSignupMode(mode);
    setGxOpen(true);
  };

  const submit = async () => {
    if (!draft.title.trim()) {
      showConfigToast("请填写社群标题", "error");
      return;
    }
    const payload = {
      title: draft.title.trim(),
      subtitle: draft.initiator.trim() || null,
      image_url: draft.cover_url || null,
      amount: draft.fee,
      status: draft.online ? 1 : 2,
      sort: draft.sort,
      extra: {
        area: draft.area.trim(),
        category: draft.category,
        banner_url: draft.banner_url,
        tags: draft.tags,
        signup_mode: signupMode,
        fee: draft.fee,
        reward: draft.reward,
        initiator: draft.initiator.trim(),
        content_html: draft.content_html,
        status: draft.status,
      },
    };
    try {
      if (draft.id === null) {
        await adminApi("admin/content/community_group", { method: "POST", body: payload });
      } else {
        await adminApi(`admin/content/community_group/${draft.id}`, { method: "PATCH", body: payload });
      }
      showConfigToast("已保存", "ok");
      setGxOpen(false);
      void load(1);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "保存失败", "error");
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("确定删除该社群？")) return;
    try {
      await adminApi(`admin/content/community_group/${id}`, { method: "DELETE" });
      showConfigToast("已删除", "ok");
      void load(pageIdx);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const duplicate = async (item: GroupContent) => {
    const extra = item.extra ?? {};
    try {
      await adminApi("admin/content/community_group", {
        method: "POST",
        body: {
          title: `${item.title} - 副本`,
          subtitle: item.subtitle,
          image_url: item.image_url,
          amount: item.amount,
          status: 1,
          sort: Math.max(0, (item.sort ?? 100) - 1),
          extra,
        },
      });
      showConfigToast("已复制", "ok");
      void load(pageIdx);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "复制失败", "error");
    }
  };

  const toggleOnline = async (item: GroupContent) => {
    const next = !(item.status === 1);
    try {
      await adminApi(`admin/content/community_group/${item.id}`, {
        method: "PATCH",
        body: { status: next ? 1 : 2 },
      });
      void load(pageIdx);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "更新失败", "error");
    }
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / 20)), [total]);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">ℹ</span>
          <div className="ecl-notice-text">
            您可以在<b>这里添加、管理社群</b>；状态设置为&ldquo;<b>已满</b>&rdquo;将关闭线上的入群通道，并显示状态为&ldquo;<b>已满</b>&rdquo;；状态设置为&ldquo;<b>下线</b>&rdquo;该群信息将不在平台中展示
            <br />
            所有的推广红娘，不分级别，统一按照每个社群所设置的奖励金额给予<b>分成奖励</b>，您可在&ldquo;<b>推广红娘-分成明细</b>&rdquo;中选择分成事件&ldquo;<b>社群缴费</b>&rdquo;，可查询每一笔分成记录
          </div>
        </div>
      </div>

      <div className="finord-card">
        <div className="finord-filters gml-filters">
          <input
            className="finord-search-input gml-search"
            placeholder="输入社群标题关键词"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void load(1);
            }}
          />
          <button className="finord-btn finord-btn-primary" onClick={() => void load(1)}>搜索</button>
          <button className="finord-btn gml-add" onClick={openCreate}>＋ 添加社群信息</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table gml-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>社群标题</th>
                <th>发起人</th>
                <th>地区</th>
                <th>分类</th>
                <th>报名人数</th>
                <th>上线?</th>
                <th>状态</th>
                <th>海报/二维码</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((g) => {
                const extra = g.extra ?? {};
                return (
                  <tr key={g.id}>
                    <td className="finord-id">{g.id}</td>
                    <td>{g.title}</td>
                    <td>{typeof extra.initiator === "string" ? extra.initiator : (g.subtitle ?? "-")}</td>
                    <td>{typeof extra.area === "string" ? extra.area : "-"}</td>
                    <td>{typeof extra.category === "string" ? extra.category : "-"}</td>
                    <td className="gml-count">{typeof extra.signup_count === "number" ? extra.signup_count : 0}</td>
                    <td>
                      <button
                        className={`mp-switch ${g.status === 1 ? "on" : ""}`}
                        onClick={() => void toggleOnline(g)}
                        aria-label="切换上下线"
                      >
                        <span className="mp-switch-knob" />
                      </button>
                      <span className="gml-switch-label">{g.status === 1 ? "上线" : "下线"}</span>
                    </td>
                    <td>
                      <span className="gml-status">{typeof extra.status === "string" ? extra.status : "-"}</span>
                    </td>
                    <td>
                      <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); showConfigToast("海报功能敬请期待", "ok"); }}>查看</a>
                    </td>
                    <td className="gml-time">{(g.created_at ?? "-").replace("T", " ").slice(0, 19)}</td>
                    <td>
                      <span className="gml-ops">
                        <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); openEdit(g); }}>编辑</a>
                        <span className="cs-op-sep">|</span>
                        <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); void duplicate(g); }}>复制</a>
                        <span className="cs-op-sep">|</span>
                        <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); void remove(g.id); }}>删除</a>
                      </span>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={11} style={{ padding: 24, textAlign: "center", color: "#888" }}>
                    暂无社群，点击「＋ 添加社群信息」开始创建
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="finord-pagination">
          <span className="finord-info">共 {total} 条</span>
          <div className="finord-pages">
            <button className="finord-page nav" onClick={() => load(Math.max(1, pageIdx - 1))} disabled={pageIdx <= 1}>‹</button>
            <span className="finord-page active">{pageIdx} / {totalPages}</span>
            <button className="finord-page nav" onClick={() => load(Math.min(totalPages, pageIdx + 1))} disabled={pageIdx >= totalPages}>›</button>
          </div>
          <span className="finord-page-size">20 条/页</span>
        </div>
      </div>

      {gxOpen && (
        <AddGroupDrawer
          onClose={() => setGxOpen(false)}
          signupMode={signupMode}
          setSignupMode={setSignupMode}
          draft={draft}
          setDraft={setDraft}
          onSubmit={submit}
        />
      )}
    </div>
  );
}

function AddGroupDrawer({
  onClose,
  signupMode,
  setSignupMode,
  draft,
  setDraft,
  onSubmit,
}: {
  onClose: () => void;
  signupMode: SignupKey;
  setSignupMode: (v: SignupKey) => void;
  draft: GroupDraft;
  setDraft: React.Dispatch<React.SetStateAction<GroupDraft>>;
  onSubmit: () => void;
}) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel gx-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">{draft.id === null ? "添加" : "编辑"}社群</span>
          </div>
          <div className="gx-head-actions">
            <button className="finord-btn gx-cancel" onClick={onClose}>关闭</button>
            <button className="finord-btn finord-btn-primary" onClick={onSubmit}>确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          <div className="gx-row">
            <span className="gx-label">＊社群标题</span>
            <div className="gx-content">
              <input
                className="gx-input gx-input-wide"
                value={draft.title}
                onChange={(e) => setDraft((cur) => ({ ...cur, title: e.target.value }))}
                maxLength={30}
              />
              <div className="gx-info">最多30字</div>
            </div>
          </div>

          <div className="gx-row">
            <span className="gx-label">＊所在区域</span>
            <div className="gx-content">
              <input
                className="gx-input gx-input-wide"
                value={draft.area}
                onChange={(e) => setDraft((cur) => ({ ...cur, area: e.target.value }))}
                placeholder="如：江苏省南京市建邺区"
              />
            </div>
          </div>

          <div className="gx-row">
            <span className="gx-label">＊社群分类</span>
            <div className="gx-content">
              <select
                className="gx-select gx-select-wide"
                value={draft.category}
                onChange={(e) => setDraft((cur) => ({ ...cur, category: e.target.value }))}
              >
                <option value="">请选择社群分类</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="gx-row">
            <span className="gx-label">＊列表封面</span>
            <div className="gx-content">
              <div className="gx-cover-row">
                {draft.cover_url ? (
                  <img className="gx-cover gx-cover-square" src={draft.cover_url} alt="cover" />
                ) : (
                  <div className="gx-cover gx-cover-square"><span>+300*300</span></div>
                )}
                <button
                  type="button"
                  className="gx-pick-btn"
                  onClick={() => document.getElementById("gx-cover-picker")?.click()}
                >
                  <Camera size={14} /> 从云端素材选择
                </button>
                <input
                  id="gx-cover-picker"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    try {
                      const { uploadAdminImage } = await import("@/lib/platform-config");
                      const url = await uploadAdminImage(f);
                      setDraft((cur) => ({ ...cur, cover_url: url }));
                    } catch (err) {
                      showConfigToast(err instanceof Error ? err.message : "上传失败", "error");
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="gx-row">
            <span className="gx-label">＊内容头图</span>
            <div className="gx-content">
              <div className="gx-cover-row">
                {draft.banner_url ? (
                  <img className="gx-cover gx-cover-wide" src={draft.banner_url} alt="banner" />
                ) : (
                  <div className="gx-cover gx-cover-wide"><span>+750*250</span></div>
                )}
                <button
                  type="button"
                  className="gx-pick-btn"
                  onClick={() => document.getElementById("gx-banner-picker")?.click()}
                >
                  <Camera size={14} /> 从云端素材选择
                </button>
                <input
                  id="gx-banner-picker"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    try {
                      const { uploadAdminImage } = await import("@/lib/platform-config");
                      const url = await uploadAdminImage(f);
                      setDraft((cur) => ({ ...cur, banner_url: url }));
                    } catch (err) {
                      showConfigToast(err instanceof Error ? err.message : "上传失败", "error");
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="gx-row">
            <span className="gx-label">社群标签</span>
            <div className="gx-content">
              <div className="gx-tags">
                {draft.tags.map((t, i) => (
                  <span key={i} className="gx-tag">
                    {t}
                    <button type="button" className="gx-tag-x" onClick={() => setDraft((cur) => ({ ...cur, tags: cur.tags.filter((_, idx) => idx !== i) }))} aria-label="删除标签">×</button>
                  </span>
                ))}
                <button
                  type="button"
                  className="gx-add-tag"
                  onClick={() => {
                    const t = window.prompt("请输入标签");
                    if (t && t.trim()) setDraft((cur) => ({ ...cur, tags: [...cur.tags, t.trim()] }));
                  }}
                >
                  <Plus size={12} /> 添加标签
                </button>
              </div>
            </div>
          </div>

          <div className="gx-row">
            <span className="gx-label">报名条件</span>
            <div className="gx-options">
              {SIGNUP_OPTIONS.map((o) => (
                <label key={o} className={`gx-radio ${signupMode === o ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="signupMode"
                    value={o}
                    checked={signupMode === o}
                    onChange={() => {
                      setSignupMode(o);
                      setDraft((cur) => ({ ...cur, signup_mode: o }));
                    }}
                  />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="gx-row">
            <span className="gx-label">收费金额</span>
            <div className="gx-content">
              <div className="gx-inline">
                <input
                  type="number"
                  className="gx-input gx-input-num"
                  value={draft.fee}
                  onChange={(e) => setDraft((cur) => ({ ...cur, fee: Number(e.target.value) || 0 }))}
                />
                <span className="gx-unit">元</span>
              </div>
              <div className="gx-info">0元为免费</div>
            </div>
          </div>

          <div className="gx-row">
            <span className="gx-label">推广奖励</span>
            <div className="gx-content">
              <div className="gx-inline">
                <input
                  type="number"
                  className="gx-input gx-input-num"
                  value={draft.reward}
                  onChange={(e) => setDraft((cur) => ({ ...cur, reward: Number(e.target.value) || 0 }))}
                />
                <span className="gx-unit">元</span>
              </div>
              <div className="gx-info">推广红娘名下会员按照平台流程成功加入本群的奖励金额；用户付费入群后将自动计入到推广红娘账号的余额中</div>
            </div>
          </div>

          <div className="gx-row">
            <span className="gx-label">＊社群发起</span>
            <div className="gx-content">
              <input
                className="gx-input"
                placeholder="输入昵称关键词"
                value={draft.initiator}
                onChange={(e) => setDraft((cur) => ({ ...cur, initiator: e.target.value }))}
              />
              <div className="gx-info">帐号昵称和头像将被显示在平台中展示；若发起人原本平台，请先在帐号管理增加一个以平台名作为昵称的帐号</div>
            </div>
          </div>

          <div className="gx-row">
            <span className="gx-label">本群介绍</span>
            <div className="gx-content">
              <div className="gx-editor">
                <div className="gx-editor-toolbar">
                  {GX_TOOLBAR.map((it, idx) => (
                    <button key={idx} type="button" className="gx-editor-tool" title={it.title}>{it.icon}</button>
                  ))}
                </div>
                <textarea
                  className="gx-editor-body"
                  rows={6}
                  value={draft.content_html}
                  onChange={(e) => setDraft((cur) => ({ ...cur, content_html: e.target.value }))}
                  placeholder="请输入正文"
                />
              </div>
              <div className="gx-info">本内容显示在支付完成入群费后弹出的页面</div>
            </div>
          </div>

          <div className="gx-row">
            <span className="gx-label">社群状态</span>
            <div className="gx-content">
              <select
                className="gx-select"
                value={draft.status}
                onChange={(e) => setDraft((cur) => ({ ...cur, status: e.target.value as StatusKey }))}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="gx-row">
            <span className="gx-label">显示排序</span>
            <div className="gx-content">
              <input
                type="number"
                className="gx-input gx-input-num"
                value={draft.sort}
                onChange={(e) => setDraft((cur) => ({ ...cur, sort: Number(e.target.value) || 0 }))}
              />
              <div className="gx-info">数字越大显示越靠前</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
