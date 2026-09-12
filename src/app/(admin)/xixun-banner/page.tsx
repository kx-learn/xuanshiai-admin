"use client";

import { useEffect, useMemo, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminApi } from "@/lib/admin-api";
import { showConfigToast } from "@/lib/platform-config";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "红娘喜讯", href: "/xixun-menu" },
  { label: "锦旗管理" },
];

type BannerContent = {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  status: number;
  sort: number;
  extra: Record<string, unknown>;
  created_at: string | null;
};

type BannerPage = { items: BannerContent[]; total: number; page: number; page_size: number };

const EMPTY_DRAFT: BannerDraft = {
  id: null,
  title: "",
  maker: "",
  giver: "",
  target: "",
  words: "",
  public: true,
  sort: 100,
  template: "default",
};

type BannerDraft = {
  id: number | null;
  title: string;
  maker: string;
  giver: string;
  target: string;
  words: string;
  public: boolean;
  sort: number;
  template: string;
};

export default function XixunBannerPage() {
  const [rows, setRows] = useState<BannerContent[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIdx, setPageIdx] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<BannerDraft>(EMPTY_DRAFT);

  const load = async (page = pageIdx) => {
    try {
      const resp = await adminApi<BannerPage>("admin/content/good_news_pennant", {
        method: "GET",
        query: { page, page_size: 20 },
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
    setDrawerOpen(true);
  };

  const openEdit = (item: BannerContent) => {
    const extra = item.extra ?? {};
    setDraft({
      id: item.id,
      title: item.title,
      maker: typeof extra.maker === "string" ? extra.maker : "",
      giver: typeof extra.giver === "string" ? extra.giver : "",
      target: typeof extra.target === "string" ? extra.target : "",
      words: typeof extra.words === "string" ? extra.words : "",
      public: extra.public !== false,
      sort: typeof extra.sort === "number" ? extra.sort : item.sort ?? 100,
      template: typeof extra.template === "string" ? extra.template : "default",
    });
    setDrawerOpen(true);
  };

  const submit = async () => {
    if (!draft.giver.trim() || !draft.target.trim()) {
      showConfigToast("请填写赠送人/受赠人", "error");
      return;
    }
    const payload = {
      title: draft.title.trim() || `锦旗-${draft.giver}→${draft.target}`,
      subtitle: draft.maker.trim() || null,
      image_url: null,
      status: draft.public ? 1 : 2,
      sort: draft.sort,
      extra: {
        maker: draft.maker.trim(),
        giver: draft.giver.trim(),
        target: draft.target.trim(),
        words: draft.words.trim(),
        public: draft.public,
        template: draft.template,
      },
    };
    try {
      if (draft.id === null) {
        await adminApi("admin/content/good_news_pennant", { method: "POST", body: payload });
      } else {
        await adminApi(`admin/content/good_news_pennant/${draft.id}`, { method: "PATCH", body: payload });
      }
      showConfigToast("已保存", "ok");
      setDrawerOpen(false);
      void load(1);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "保存失败", "error");
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("确定删除该锦旗？")) return;
    try {
      await adminApi(`admin/content/good_news_pennant/${id}`, { method: "DELETE" });
      showConfigToast("已删除", "ok");
      void load(pageIdx);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const togglePublic = async (item: BannerContent) => {
    const extra = { ...(item.extra ?? {}), public: !(item.extra?.public !== false) };
    try {
      await adminApi(`admin/content/good_news_pennant/${item.id}`, {
        method: "PATCH",
        body: { title: item.title, status: extra.public ? 1 : 2, extra },
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
          <span className="ecl-notice-ic">◇</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>本系统中研发了锦旗在线制作功能，只需输入赠语即可快速生成一面电子锦旗</p>
            <p>红娘在与会员的日常跟进中可引导会员在平台上制作赠送"电子锦旗"，锦旗会在平台上进行展示</p>
            <p>您可以将电子锦旗自行在文印店中制作为实物锦旗悬挂于您的门店中</p>
            <p><a className="xj-entry" href="#">在线制作锦旗入口</a></p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        <div className="finord-filters xj-filters">
          <button type="button" className="finord-btn finord-btn-primary" onClick={openCreate}>添加锦旗</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table xj-table">
            <thead>
              <tr>
                <th>赠送时间</th>
                <th>制作人</th>
                <th>赠送人</th>
                <th>赠送给</th>
                <th>赠送语</th>
                <th>平台公开展示</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const extra = r.extra ?? {};
                return (
                  <tr key={r.id}>
                    <td className="xj-time">{(r.created_at ?? "-").replace("T", " ").slice(0, 19)}</td>
                    <td className="xj-maker">{typeof extra.maker === "string" ? extra.maker : (r.subtitle ?? "-")}</td>
                    <td>{typeof extra.giver === "string" ? extra.giver : "-"}</td>
                    <td>{typeof extra.target === "string" ? extra.target : "-"}</td>
                    <td className="xj-words">{typeof extra.words === "string" ? extra.words : "-"}</td>
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
                      <span className="xj-ops">
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
                  <td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#888" }}>
                    暂无锦旗，点击「添加锦旗」开始创建
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
          <div className="tlc-panel xj-panel">
            <div className="tlc-panel-head">
              <div className="tlc-panel-head-left">
                <span className="tlc-panel-title">{draft.id === null ? "添加" : "编辑"}锦旗</span>
              </div>
              <div className="xj-head-actions">
                <button type="button" className="finord-btn xj-cancel" onClick={() => setDrawerOpen(false)}>关闭</button>
                <button type="button" className="finord-btn finord-btn-primary" onClick={submit}>确定提交</button>
              </div>
            </div>
            <div className="tlc-panel-body">
              <div className="xj-row">
                <span className="xj-label">赠送人</span>
                <input className="xj-input xj-input-wide" value={draft.giver} onChange={(e) => setDraft((cur) => ({ ...cur, giver: e.target.value }))} />
              </div>
              <div className="xj-row">
                <span className="xj-label">受赠人</span>
                <input className="xj-input xj-input-wide" value={draft.target} onChange={(e) => setDraft((cur) => ({ ...cur, target: e.target.value }))} />
              </div>
              <div className="xj-row">
                <span className="xj-label">制作人</span>
                <input className="xj-input xj-input-wide" value={draft.maker} onChange={(e) => setDraft((cur) => ({ ...cur, maker: e.target.value }))} />
              </div>
              <div className="xj-row">
                <span className="xj-label">赠语</span>
                <textarea className="xj-textarea" rows={3} value={draft.words} onChange={(e) => setDraft((cur) => ({ ...cur, words: e.target.value }))} />
              </div>
              <div className="xj-row">
                <span className="xj-label">锦旗标题</span>
                <input className="xj-input xj-input-wide" value={draft.title} onChange={(e) => setDraft((cur) => ({ ...cur, title: e.target.value }))} placeholder="留空将自动生成" />
              </div>
              <div className="xj-row">
                <span className="xj-label">锦旗模板</span>
                <select className="xj-select" value={draft.template} onChange={(e) => setDraft((cur) => ({ ...cur, template: e.target.value }))}>
                  <option value="default">默认模板</option>
                  <option value="red">红色喜庆</option>
                  <option value="gold">金色荣耀</option>
                </select>
              </div>
              <div className="xj-row">
                <span className="xj-label">显示排序</span>
                <input type="number" className="xj-input xj-input-num" value={draft.sort} onChange={(e) => setDraft((cur) => ({ ...cur, sort: Number(e.target.value) || 0 }))} />
              </div>
              <div className="xj-row">
                <span className="xj-label">平台公开展示</span>
                <div className="xj-options">
                  {[true, false].map((v) => (
                    <label key={String(v)} className={`xj-radio ${draft.public === v ? "active" : ""}`}>
                      <input type="radio" name="xjPublic" checked={draft.public === v} onChange={() => setDraft((cur) => ({ ...cur, public: v }))} />
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
