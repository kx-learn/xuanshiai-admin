"use client";

import { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminApi } from "@/lib/admin-api";
import { pickAndUploadImage, showConfigToast } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("运营工具", "礼品管理");

type ContentItem = {
  id: number;
  domain: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  amount: number | null;
  status: number;
  sort: number;
  extra: Record<string, unknown>;
  created_at: string | null;
  updated_at: string | null;
};

type ContentPage = { items: ContentItem[]; total: number; page: number; page_size: number };

type GiftDraft = {
  id: number | null;
  title: string;
  cover_url: string | null;
  nature: "physical_express" | "physical_pickup" | "virtual";
  points: number;
  stock: number;
  description_html: string;
  notice_html: string;
};

const EMPTY_DRAFT: GiftDraft = {
  id: null,
  title: "",
  cover_url: null,
  nature: "physical_express",
  points: 100,
  stock: 99,
  description_html: "",
  notice_html: "",
};

const NATURE_LABEL: Record<GiftDraft["nature"], string> = {
  physical_express: "实物快递",
  physical_pickup: "实物自取",
  virtual: "虚拟物品",
};

export default function GiftListPage() {
  const [rows, setRows] = useState<ContentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIdx, setPageIdx] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<GiftDraft>(EMPTY_DRAFT);

  const load = async (page = pageIdx, kw = keyword) => {
    try {
      const resp = await adminApi<ContentPage>("admin/content/point_gift", {
        method: "GET",
        query: { page, page_size: 20, keyword: kw || undefined },
      });
      setRows(resp.items);
      setTotal(resp.total);
      setPageIdx(resp.page);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    }
  };

  useEffect(() => {
    void load(1, "");
  }, []);

  const openCreate = () => { setDraft(EMPTY_DRAFT); setDrawerOpen(true); };

  const openEdit = (item: ContentItem) => {
    const extra = item.extra ?? {};
    const natureVal = (typeof extra.nature === "string" ? extra.nature : "physical_express") as GiftDraft["nature"];
    setDraft({
      id: item.id,
      title: item.title || "",
      cover_url: item.image_url ?? null,
      nature: natureVal,
      points: typeof extra.points === "number" ? (extra.points as number) : (item.amount ?? 100),
      stock: typeof extra.stock === "number" ? (extra.stock as number) : 0,
      description_html: typeof extra.description_html === "string" ? (extra.description_html as string) : "",
      notice_html: typeof extra.notice_html === "string" ? (extra.notice_html as string) : "",
    });
    setDrawerOpen(true);
  };

  const submit = async () => {
    if (!draft.title.trim()) {
      showConfigToast("请输入礼品标题", "error");
      return;
    }
    if (!Number.isFinite(draft.points) || draft.points < 0) {
      showConfigToast("积分必须为非负整数", "error");
      return;
    }
    if (!Number.isFinite(draft.stock) || draft.stock < 0) {
      showConfigToast("库存必须为非负整数", "error");
      return;
    }
    const payload = {
      title: draft.title.trim(),
      subtitle: NATURE_LABEL[draft.nature],
      image_url: draft.cover_url,
      amount: draft.points,
      status: 1,
      sort: 100,
      extra: {
        nature: draft.nature,
        points: draft.points,
        stock: draft.stock,
        description_html: draft.description_html,
        notice_html: draft.notice_html,
      },
    };
    try {
      if (draft.id === null) {
        await adminApi("admin/content/point_gift", { method: "POST", body: payload });
        showConfigToast("已添加", "ok");
      } else {
        await adminApi(`admin/content/point_gift/${draft.id}`, { method: "PATCH", body: payload });
        showConfigToast("已保存", "ok");
      }
      setDrawerOpen(false);
      void load(1, keyword);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "保存失败", "error");
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("确定删除该礼品？")) return;
    try {
      await adminApi(`admin/content/point_gift/${id}`, { method: "DELETE" });
      showConfigToast("已删除", "ok");
      void load(pageIdx, keyword);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card gl-card">
        <div className="gl-filters">
          <div className="gl-searchbox">
            <input
              className="gl-search-input"
              placeholder="请输入礼品标题关键字"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void load(1, keyword); }}
            />
            <button type="button" className="finord-btn finord-btn-primary gl-search-btn" onClick={() => void load(1, keyword)}>搜索</button>
          </div>
        </div>

        <div className="gl-head">
          <h2 className="gl-title">礼品管理</h2>
          <button type="button" className="finord-btn finord-btn-primary" onClick={openCreate}>＋ 添加礼品</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table gl-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>礼品标题</th>
                <th>性质</th>
                <th>所需积分</th>
                <th>库存数</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const extra = row.extra ?? {};
                return (
                  <tr key={row.id}>
                    <td className="gl-id">{row.id}</td>
                    <td>
                      <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); openEdit(row); }}>{row.title}</a>
                    </td>
                    <td className="gl-type">
                      {NATURE_LABEL[(typeof extra.nature === "string" ? extra.nature : "physical_express") as GiftDraft["nature"]]}
                    </td>
                    <td className="gl-points">{typeof extra.points === "number" ? (extra.points as number) : (row.amount ?? 0)}</td>
                    <td className="gl-stock">{typeof extra.stock === "number" ? (extra.stock as number) : 0}</td>
                    <td>
                      <div className="gl-ops">
                        <a className="finord-link gl-op" href="#" onClick={(e) => { e.preventDefault(); openEdit(row); }}>编辑</a>
                        <span className="gl-op-sep">|</span>
                        <a className="finord-link gl-op" href="#" onClick={(e) => { e.preventDefault(); void remove(row.id); }}>删除</a>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#888" }}>
                    暂无礼品，点击「添加礼品」开始创建
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="gl-pager">
          <span className="finord-info">共 {total} 条</span>
          <span className="gl-pager-arrow" onClick={() => load(Math.max(1, pageIdx - 1), keyword)} style={{ cursor: pageIdx > 1 ? "pointer" : "not-allowed", opacity: pageIdx > 1 ? 1 : 0.4 }}>‹</span>
          <span className="gl-pager-cur">{pageIdx} / {totalPages}</span>
          <span className="gl-pager-arrow" onClick={() => load(Math.min(totalPages, pageIdx + 1), keyword)} style={{ cursor: pageIdx < totalPages ? "pointer" : "not-allowed", opacity: pageIdx < totalPages ? 1 : 0.4 }}>›</span>
        </div>
      </div>

      {drawerOpen && (
        <>
          <div className="tlc-mask" onClick={() => setDrawerOpen(false)} />
          <div className="tlc-panel gl-drawer-panel">
            <div className="tlc-panel-head">
              <div className="tlc-panel-head-left">
                <button type="button" className="tlc-x" onClick={() => setDrawerOpen(false)} aria-label="关闭"><X size={18} /></button>
                <span className="tlc-panel-title">{draft.id === null ? "添加礼品" : "编辑礼品"}</span>
              </div>
              <div className="gl-head-actions">
                <button type="button" className="finord-btn gl-cancel" onClick={() => setDrawerOpen(false)}>取消</button>
                <button type="button" className="finord-btn finord-btn-primary" onClick={submit}>确定提交</button>
              </div>
            </div>
            <div className="tlc-panel-body">
              <div className="gl-d-row">
                <span className="gl-d-label">＊标题</span>
                <input
                  className="gl-d-input gl-d-input-wide"
                  value={draft.title}
                  onChange={(e) => setDraft((cur) => ({ ...cur, title: e.target.value }))}
                />
              </div>

              <div className="gl-d-row gl-d-row-top">
                <span className="gl-d-label">＊图片</span>
                <div className="gl-d-content">
                  <div className="gl-d-pick" style={{ cursor: "pointer" }}>
                    {draft.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={draft.cover_url} alt="礼品图" style={{ width: 60, height: 60, objectFit: "cover" }} />
                    ) : (
                      <>
                        <Plus size={18} />
                        <span>上传图片</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) =>
                        pickAndUploadImage(
                          e.target.files?.[0],
                          (url) => setDraft((cur) => ({ ...cur, cover_url: url })),
                          (m) => showConfigToast(m, "error"),
                        )
                      }
                    />
                  </div>
                  <div className="gl-d-info">① 最佳尺寸：750像素×750像素</div>
                </div>
              </div>

              <div className="gl-d-row">
                <span className="gl-d-label">性质</span>
                <div className="gl-d-options">
                  {(["physical_express", "physical_pickup", "virtual"] as const).map((key) => (
                    <label key={key} className={`gl-d-radio ${draft.nature === key ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="nature"
                        value={key}
                        checked={draft.nature === key}
                        onChange={() => setDraft((cur) => ({ ...cur, nature: key }))}
                      />
                      <span>{NATURE_LABEL[key]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="gl-d-row">
                <span className="gl-d-label">＊积分</span>
                <input
                  type="number"
                  min={0}
                  className="gl-d-input gl-d-input-wide"
                  value={draft.points}
                  onChange={(e) => setDraft((cur) => ({ ...cur, points: Math.max(0, Number(e.target.value) || 0) }))}
                />
              </div>

              <div className="gl-d-row">
                <span className="gl-d-label">＊库存</span>
                <input
                  type="number"
                  min={0}
                  className="gl-d-input gl-d-input-wide"
                  value={draft.stock}
                  onChange={(e) => setDraft((cur) => ({ ...cur, stock: Math.max(0, Number(e.target.value) || 0) }))}
                />
              </div>

              <div className="gl-d-row gl-d-row-top">
                <span className="gl-d-label">＊须知</span>
                <div className="gl-d-content">
                  <textarea
                    className="gl-d-textarea"
                    rows={3}
                    placeholder="请输入兑换须知"
                    value={draft.notice_html}
                    onChange={(e) => setDraft((cur) => ({ ...cur, notice_html: e.target.value }))}
                  />
                </div>
              </div>

              <div className="gl-d-row gl-d-row-top">
                <span className="gl-d-label">＊介绍</span>
                <div className="gl-d-content">
                  <textarea
                    className="gl-d-textarea"
                    rows={5}
                    placeholder="请输入礼品介绍"
                    value={draft.description_html}
                    onChange={(e) => setDraft((cur) => ({ ...cur, description_html: e.target.value }))}
                  />
                </div>
              </div>

              <div className="gl-d-submit-row">
                <button type="button" className="finord-btn finord-btn-primary gl-d-submit" onClick={submit}>确定提交</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
