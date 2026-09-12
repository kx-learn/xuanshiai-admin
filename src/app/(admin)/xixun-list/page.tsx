"use client";

import { useEffect, useState } from "react";
import { X, Upload } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminApi } from "@/lib/admin-api";
import { adminEndpoints } from "@/lib/admin-endpoints";
import { showConfigToast } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("运营工具", "喜讯管理");

const STATUS_OPTIONS = ["牵手成功", "恋爱生活", "已见父母", "已订婚", "已领证", "已办婚礼", "婚后生活", "已验证", "其他"];

type XixunContent = {
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

type XixunPage = { items: XixunContent[]; total: number; page: number; page_size: number };

type XixunDraft = {
  id: number | null;
  status: string;
  matchmaker_id: number | null;
  feedback_name: string;
  partner_name: string;
  feedback_source: "member" | "custom";
  partner_source: "member" | "custom";
  meet_duration: string;
  content_html: string;
  blessing: string;
  public: boolean;
  sort: number;
};

const EMPTY_DRAFT: XixunDraft = {
  id: null,
  status: "牵手成功",
  matchmaker_id: null,
  feedback_name: "",
  partner_name: "",
  feedback_source: "member",
  partner_source: "member",
  meet_duration: "",
  content_html: "",
  blessing: "",
  public: true,
  sort: 100,
};

export default function XixunListPage() {
  const [rows, setRows] = useState<XixunContent[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIdx, setPageIdx] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMatchmaker, setFilterMatchmaker] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<XixunDraft>(EMPTY_DRAFT);
  const [matchmakerOptions, setMatchmakerOptions] = useState<{ id: number; nickname: string }[]>([]);

  const load = async (page = pageIdx) => {
    try {
      const filters = [
        filterStatus && `status\\":\\"${filterStatus}`,
        filterMatchmaker && `matchmaker_name\\":\\"${filterMatchmaker}`,
      ].filter(Boolean);
      const resp = await adminApi<XixunPage>("admin/content/good_news", {
        method: "GET",
        query: {
          page,
          page_size: 20,
          keyword: filters.length > 0 ? filters.join(" OR ") : undefined,
        },
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
  }, [filterStatus, filterMatchmaker]);

  useEffect(() => {
    adminEndpoints
      .matchmakers({ page: 1, page_size: 200 })
      .then((res) => {
        const data = (res ?? {}) as { items?: Array<{ id: number; nickname?: string; real_name?: string }> };
        const items = data.items ?? [];
        setMatchmakerOptions(
          items.map((m) => ({ id: m.id, nickname: m.nickname || m.real_name || `红娘 ${m.id}` })),
        );
      })
      .catch(() => undefined);
  }, []);

  const openCreate = () => { setDraft(EMPTY_DRAFT); setDrawerOpen(true); };
  const openEdit = (item: XixunContent) => {
    const extra = item.extra ?? {};
    setDraft({
      id: item.id,
      status: typeof extra.status === "string" ? (extra.status as string) : "牵手成功",
      matchmaker_id: typeof extra.matchmaker_id === "number" ? (extra.matchmaker_id as number) : null,
      feedback_name: typeof extra.feedback_name === "string" ? (extra.feedback_name as string) : "",
      partner_name: typeof extra.partner_name === "string" ? (extra.partner_name as string) : "",
      feedback_source: extra.feedback_source === "custom" ? "custom" : "member",
      partner_source: extra.partner_source === "custom" ? "custom" : "member",
      meet_duration: typeof extra.meet_duration === "string" ? (extra.meet_duration as string) : "",
      content_html: typeof extra.content_html === "string" ? (extra.content_html as string) : "",
      blessing: typeof extra.blessing === "string" ? (extra.blessing as string) : "",
      public: extra.public !== false,
      sort: typeof extra.sort === "number" ? (extra.sort as number) : item.sort ?? 100,
    });
    setDrawerOpen(true);
  };

  const submit = async () => {
    if (!draft.feedback_name.trim() || !draft.partner_name.trim()) {
      showConfigToast("请填写反馈方与交往方", "error");
      return;
    }
    const matchmaker = matchmakerOptions.find((m) => m.id === draft.matchmaker_id);
    const payload = {
      title: `喜讯-${draft.feedback_name}`,
      subtitle: matchmaker?.nickname ?? null,
      image_url: null,
      status: draft.public ? 1 : 2,
      sort: draft.sort,
      extra: {
        status: draft.status,
        matchmaker_id: draft.matchmaker_id,
        matchmaker_name: matchmaker?.nickname ?? null,
        feedback_name: draft.feedback_name.trim(),
        partner_name: draft.partner_name.trim(),
        feedback_source: draft.feedback_source,
        partner_source: draft.partner_source,
        meet_duration: draft.meet_duration.trim(),
        content_html: draft.content_html,
        blessing: draft.blessing.trim(),
        public: draft.public,
        views: 0,
      },
    };
    try {
      if (draft.id === null) {
        await adminApi("admin/content/good_news", { method: "POST", body: payload });
      } else {
        await adminApi(`admin/content/good_news/${draft.id}`, { method: "PATCH", body: payload });
      }
      showConfigToast("已保存", "ok");
      setDrawerOpen(false);
      void load(1);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "保存失败", "error");
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("确定删除该喜讯？")) return;
    try {
      await adminApi(`admin/content/good_news/${id}`, { method: "DELETE" });
      showConfigToast("已删除", "ok");
      void load(pageIdx);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const togglePublic = async (item: XixunContent) => {
    const extra = { ...(item.extra ?? {}), public: !(item.extra?.public !== false) };
    try {
      await adminApi(`admin/content/good_news/${item.id}`, {
        method: "PATCH",
        body: { title: item.title, status: extra.public ? 1 : 2, extra },
      });
      void load(pageIdx);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "更新失败", "error");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">◇</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>红娘每天工作中需对客户保持跟进回访，了解情感进展，收集他们的反馈。可将客户的反馈内容、聊天截图等作为喜讯，添加到系统中集中展示在平台中展示给公众号</p>
            <p>超级红娘可查看、管理全平台喜讯；普通红娘仅查看、管理服务红娘是本人，以及自己发布添加的喜讯内容</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        <div className="finord-filters xl-filters">
          <select className="finord-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">按状态分类</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select className="finord-select" value={filterMatchmaker} onChange={(e) => setFilterMatchmaker(e.target.value)}>
            <option value="">按服务红娘筛选</option>
            {matchmakerOptions.map((m) => (
              <option key={m.id} value={String(m.id)}>{m.nickname}</option>
            ))}
          </select>
          <button type="button" className="finord-btn finord-btn-primary" onClick={() => load(1)}>筛选</button>
          <button type="button" className="finord-btn finord-btn-primary" onClick={openCreate}>添加喜讯</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table xl-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>添加时间</th>
                <th>反馈方</th>
                <th>交往方</th>
                <th>相识时间</th>
                <th>情感状态</th>
                <th>服务红娘</th>
                <th>红娘祝福</th>
                <th>浏览次数</th>
                <th>平台公开展示</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const extra = r.extra ?? {};
                return (
                  <tr key={r.id}>
                    <td className="finord-id">{r.id}</td>
                    <td className="xl-time">{r.created_at ?? "-"}</td>
                    <td>{typeof extra.feedback_name === "string" ? (extra.feedback_name as string) : "-"}</td>
                    <td>{typeof extra.partner_name === "string" ? (extra.partner_name as string) : "-"}</td>
                    <td>{typeof extra.meet_duration === "string" ? (extra.meet_duration as string) : "-"}</td>
                    <td>{typeof extra.status === "string" ? (extra.status as string) : "-"}</td>
                    <td>{typeof extra.matchmaker_name === "string" ? (extra.matchmaker_name as string) : (r.subtitle ?? "-")}</td>
                    <td className="xl-blessing">{typeof extra.blessing === "string" ? (extra.blessing as string) : "-"}</td>
                    <td>{typeof extra.views === "number" ? (extra.views as number) : 0}</td>
                    <td>
                      <button
                        type="button"
                        className={`mp-switch ${extra.public !== false ? "on" : ""}`}
                        onClick={() => void togglePublic(r)}
                        aria-label="切换公开"
                      >
                        {extra.public !== false && <span className="mp-switch-label">开</span>}
                        <span className="mp-switch-knob" />
                      </button>
                    </td>
                    <td>
                      <span className="xl-ops">
                        <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); openEdit(r); }}>编辑/查看</a>
                        <span className="cs-op-sep">|</span>
                        <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); void remove(r.id); }}>删除</a>
                      </span>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={11} style={{ padding: 24, textAlign: "center", color: "#888" }}>
                    暂无喜讯，点击「添加喜讯」开始创建
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="finord-pagination">
          <span className="finord-info">共 {total} 条</span>
          <div className="finord-pages">
            <button type="button" className="finord-page nav" onClick={() => load(Math.max(1, pageIdx - 1))} disabled={pageIdx <= 1}>‹</button>
            <span className="finord-page active">{pageIdx} / {totalPages}</span>
            <button type="button" className="finord-page nav" onClick={() => load(Math.min(totalPages, pageIdx + 1))} disabled={pageIdx >= totalPages}>›</button>
          </div>
        </div>
      </div>

      {drawerOpen && (
        <>
          <div className="tlc-mask" onClick={() => setDrawerOpen(false)} />
          <div className="tlc-panel xx-panel">
            <div className="tlc-panel-head">
              <div className="tlc-panel-head-left">
                <button type="button" className="tlc-x" onClick={() => setDrawerOpen(false)} aria-label="关闭"><X size={18} /></button>
                <span className="tlc-panel-title">{draft.id === null ? "添加" : "编辑"}喜讯</span>
              </div>
              <div className="xx-head-actions">
                <button type="button" className="finord-btn xx-cancel" onClick={() => setDrawerOpen(false)}>关闭</button>
                <button type="button" className="finord-btn finord-btn-primary" onClick={submit}>确定提交</button>
              </div>
            </div>
            <div className="tlc-panel-body">
              <div className="xx-row">
                <span className="xx-label">＊反馈方</span>
                <div className="xx-content">
                  <div className="xx-options">
                    {(["member", "custom"] as const).map((s) => (
                      <label key={s} className={`xx-radio ${draft.feedback_source === s ? "active" : ""}`}>
                        <input type="radio" name="fbType" value={s} checked={draft.feedback_source === s} onChange={() => setDraft((cur) => ({ ...cur, feedback_source: s }))} />
                        <span>{s === "member" ? "库中会员" : "自定义"}</span>
                      </label>
                    ))}
                  </div>
                  <input className="xx-input xx-input-wide" placeholder="输入昵称关键词" value={draft.feedback_name} onChange={(e) => setDraft((cur) => ({ ...cur, feedback_name: e.target.value }))} />
                </div>
              </div>

              <div className="xx-row">
                <span className="xx-label">＊交往方</span>
                <div className="xx-content">
                  <div className="xx-options">
                    {(["member", "custom"] as const).map((s) => (
                      <label key={s} className={`xx-radio ${draft.partner_source === s ? "active" : ""}`}>
                        <input type="radio" name="ptType" value={s} checked={draft.partner_source === s} onChange={() => setDraft((cur) => ({ ...cur, partner_source: s }))} />
                        <span>{s === "member" ? "库中会员" : "自定义"}</span>
                      </label>
                    ))}
                  </div>
                  <input className="xx-input xx-input-wide" placeholder="输入昵称关键词" value={draft.partner_name} onChange={(e) => setDraft((cur) => ({ ...cur, partner_name: e.target.value }))} />
                </div>
              </div>

              <div className="xx-row">
                <span className="xx-label">＊交往时间</span>
                <div className="xx-content">
                  <div className="xx-inline">
                    <input
                      className="xx-input"
                      placeholder="只能填写数字"
                      value={draft.meet_duration}
                      onChange={(e) => setDraft((cur) => ({ ...cur, meet_duration: e.target.value.replace(/[^0-9]/g, "") }))}
                    />
                    <span className="xx-unit">个月</span>
                  </div>
                </div>
              </div>

              <div className="xx-row">
                <span className="xx-label">＊情感状态</span>
                <div className="xx-content">
                  <select className="xx-select xx-select-wide" value={draft.status} onChange={(e) => setDraft((cur) => ({ ...cur, status: e.target.value }))}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="xx-row">
                <span className="xx-label">＊服务红娘</span>
                <div className="xx-content">
                  <select
                    className="xx-select xx-select-wide"
                    value={draft.matchmaker_id ?? ""}
                    onChange={(e) => setDraft((cur) => ({ ...cur, matchmaker_id: e.target.value ? Number(e.target.value) : null }))}
                  >
                    <option value="">请选择服务红娘</option>
                    {matchmakerOptions.map((m) => (
                      <option key={m.id} value={m.id}>{m.nickname}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="xx-row">
                <span className="xx-label">红娘祝福</span>
                <textarea
                  className="xx-textarea"
                  rows={2}
                  placeholder="一句祝福语"
                  value={draft.blessing}
                  onChange={(e) => setDraft((cur) => ({ ...cur, blessing: e.target.value }))}
                />
              </div>

              <div className="xx-row">
                <span className="xx-label">＊喜讯内容</span>
                <div className="xx-content">
                  <textarea
                    className="xx-textarea"
                    rows={6}
                    placeholder="支持段落排版"
                    value={draft.content_html}
                    onChange={(e) => setDraft((cur) => ({ ...cur, content_html: e.target.value }))}
                  />
                  <div className="xx-upload-row">
                    <button type="button" className="xx-upload-btn-line" onClick={() => showConfigToast("请前往详情面板上传图片", "ok")}>
                      <Upload size={14} /> 图片上传/管理（点击上传）
                    </button>
                  </div>
                </div>
              </div>

              <div className="xx-row">
                <span className="xx-label">显示排序</span>
                <input
                  type="number"
                  className="xx-input xx-input-num"
                  value={draft.sort}
                  onChange={(e) => setDraft((cur) => ({ ...cur, sort: Number(e.target.value) || 0 }))}
                />
              </div>

              <div className="xx-row">
                <span className="xx-label">平台公开展示</span>
                <div className="xx-options">
                  {[true, false].map((v) => (
                    <label key={String(v)} className={`xx-radio ${draft.public === v ? "active" : ""}`}>
                      <input type="radio" name="public" checked={draft.public === v} onChange={() => setDraft((cur) => ({ ...cur, public: v }))} />
                      <span>{v ? "开" : "关"}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
