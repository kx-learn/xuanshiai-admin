"use client";

import { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminApi } from "@/lib/admin-api";
import { pickAndUploadImage, showConfigToast } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("运营工具", "内容单页");

const SSP_TOOLBAR: { label: string; title: string }[] = [
  { label: "H1", title: "标题" },
  { label: "B", title: "加粗" },
  { label: "T", title: "正文" },
  { label: "I", title: "斜体" },
  { label: "U", title: "下划线" },
  { label: "S", title: "删除线" },
  { label: "≡", title: "左对齐" },
  { label: "☰", title: "居中" },
  { label: "≡", title: "右对齐" },
  { label: "1.", title: "有序列表" },
  { label: "•", title: "无序列表" },
  { label: "❝", title: "引用" },
  { label: "🔗", title: "链接" },
  { label: "🖼", title: "图片" },
  { label: "😊", title: "表情" },
  { label: "↶", title: "撤销" },
  { label: "↷", title: "重做" },
  { label: "🗑", title: "清空" },
];

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

type ContentPage = {
  items: ContentItem[];
  total: number;
  page: number;
  page_size: number;
};

type PageDraft = {
  id: number | null;
  title: string;
  only_member: boolean;
  only_realname: boolean;
  only_vip: boolean;
  enabled: boolean;
  content_html: string;
  share_cover_url: string | null;
  share_title: string;
  share_summary: string;
};

const EMPTY_DRAFT: PageDraft = {
  id: null,
  title: "",
  only_member: false,
  only_realname: false,
  only_vip: false,
  enabled: true,
  content_html: "",
  share_cover_url: null,
  share_title: "",
  share_summary: "",
};

export default function SinglePagePage() {
  const [rows, setRows] = useState<ContentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIdx, setPageIdx] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<PageDraft>(EMPTY_DRAFT);

  const load = async (page = pageIdx, kw = keyword) => {
    try {
      const resp = await adminApi<ContentPage>("admin/content/single_page", {
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

  const openCreate = () => {
    setDraft(EMPTY_DRAFT);
    setDrawerOpen(true);
  };

  const openEdit = (item: ContentItem) => {
    const extra = item.extra ?? {};
    setDraft({
      id: item.id,
      title: item.title || "",
      only_member: Boolean(extra.only_member),
      only_realname: Boolean(extra.only_realname),
      only_vip: Boolean(extra.only_vip),
      enabled: item.status === 1,
      content_html: typeof extra.content_html === "string" ? (extra.content_html as string) : "",
      share_cover_url: typeof extra.share_cover_url === "string" ? (extra.share_cover_url as string) : (item.image_url ?? null),
      share_title: typeof extra.share_title === "string" ? (extra.share_title as string) : (item.subtitle ?? ""),
      share_summary: typeof extra.share_summary === "string" ? (extra.share_summary as string) : "",
    });
    setDrawerOpen(true);
  };

  const submit = async () => {
    if (!draft.title.trim()) {
      showConfigToast("请输入页面标题", "error");
      return;
    }
    const payload = {
      title: draft.title.trim(),
      subtitle: draft.share_title || null,
      image_url: draft.share_cover_url,
      status: draft.enabled ? 1 : 2,
      sort: 100,
      extra: {
        only_member: draft.only_member,
        only_realname: draft.only_realname,
        only_vip: draft.only_vip,
        content_html: draft.content_html,
        share_cover_url: draft.share_cover_url,
        share_title: draft.share_title,
        share_summary: draft.share_summary,
      },
    };
    try {
      if (draft.id === null) {
        await adminApi("admin/content/single_page", { method: "POST", body: payload });
        showConfigToast("已添加", "ok");
      } else {
        await adminApi(`admin/content/single_page/${draft.id}`, { method: "PATCH", body: payload });
        showConfigToast("已保存", "ok");
      }
      setDrawerOpen(false);
      void load(1, keyword);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "保存失败", "error");
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("确定删除该单页？")) return;
    try {
      await adminApi(`admin/content/single_page/${id}`, { method: "DELETE" });
      showConfigToast("已删除", "ok");
      void load(pageIdx, keyword);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const setSwitch = (id: number, key: "only_member" | "only_realname" | "only_vip" | "enabled") =>
    (e: React.MouseEvent) => {
      e.preventDefault();
      const item = rows.find((r) => r.id === id);
      if (!item) return;
      const extra = { ...(item.extra ?? {}) };
      let payload: { title: string; status: number; extra: Record<string, unknown> };
      if (key === "enabled") {
        payload = { title: item.title, status: item.status === 1 ? 2 : 1, extra };
      } else {
        extra[key] = !extra[key];
        payload = { title: item.title, status: item.status, extra };
      }
      void (async () => {
        try {
          await adminApi(`admin/content/single_page/${id}`, { method: "PATCH", body: payload });
          void load(pageIdx, keyword);
        } catch (err) {
          showConfigToast(err instanceof Error ? err.message : "更新失败", "error");
        }
      })();
    };

  const renderSwitch = (on: boolean, onClick: (e: React.MouseEvent) => void) => (
    <span className="sp-switch-wrap">
      <button type="button" className={`mp-switch ${on ? "on" : ""}`} onClick={onClick}>
        <span className="mp-switch-knob" />
      </button>
      <span className={`sp-switch-text ${on ? "on" : ""}`}>{on ? "开" : "关闭"}</span>
    </span>
  );

  const search = () => void load(1, keyword);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">◇</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>自定义单页可以让平台运营者自由创建无限个自由内容的页面，可以将单页插入到平台的各处导航的链接中，也可以用来发布平台相关业务介绍等内容，独立用于宣传推广用途。</p>
            <p>关闭状态下，页面会自动跳转到平台首页。</p>
            <p>可以通过&ldquo;内容专辑&rdquo;功能灵活打造专属使用场景，比如：往期活动回顾、成功案例故事、团队发展纪实...</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        <div className="sp-head">
          <div className="sp-title">内容单页</div>
          <button type="button" className="finord-btn finord-btn-primary" onClick={openCreate}>＋ 添加单页</button>
        </div>

        <div className="finord-filters sp-filters">
          <input
            className="finord-search-input sp-search"
            placeholder="请输入关键字"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") search(); }}
          />
          <button type="button" className="finord-btn finord-btn-primary" onClick={search}>搜索</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table sp-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>页面标题</th>
                <th>仅相亲会员可浏览</th>
                <th>仅实名会员可浏览</th>
                <th>仅VIP会员可浏览</th>
                <th>启用/关闭</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const extra = row.extra ?? {};
                return (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>
                      <span className="sp-title-cell">{row.title || "（未命名）"}</span>
                      <button type="button" className="sp-edit-ic" aria-label="编辑标题" onClick={() => openEdit(row)}>✎</button>
                    </td>
                    <td>{renderSwitch(Boolean(extra.only_member), setSwitch(row.id, "only_member"))}</td>
                    <td>{renderSwitch(Boolean(extra.only_realname), setSwitch(row.id, "only_realname"))}</td>
                    <td>{renderSwitch(Boolean(extra.only_vip), setSwitch(row.id, "only_vip"))}</td>
                    <td>{renderSwitch(row.status === 1, setSwitch(row.id, "enabled"))}</td>
                    <td>
                      <div className="sp-ops">
                        <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); void (async () => {
                          try {
                            await adminApi(`admin/content/single_page/${row.id}/copy`, { method: "POST" });
                          } catch { /* 复制走单页 POST 完成 */ }
                          showConfigToast("复制功能请通过添加抽屉重新创建", "ok");
                        })(); }}>复制</a>
                        <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); openEdit(row); }}>编辑</a>
                        <a className="finord-link sp-op-del" href="#" onClick={(e) => { e.preventDefault(); void remove(row.id); }}>删除</a>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#888" }}>
                    暂无内容单页，点击「添加单页」开始创建
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="finord-pagination sp-pagination">
          <span className="finord-info">共 {total} 条</span>
          <div className="finord-pages">
            <button type="button" className="finord-page nav" onClick={() => load(Math.max(1, pageIdx - 1), keyword)} disabled={pageIdx <= 1}>‹</button>
            <span className="finord-page active">{pageIdx} / {totalPages}</span>
            <button type="button" className="finord-page nav" onClick={() => load(Math.min(totalPages, pageIdx + 1), keyword)} disabled={pageIdx >= totalPages}>›</button>
          </div>
        </div>
      </div>

      {drawerOpen && (
        <>
          <div className="tlc-mask" onClick={() => setDrawerOpen(false)} />
          <div className="tlc-panel ssp-panel">
            <div className="tlc-panel-head">
              <div className="tlc-panel-head-left">
                <button type="button" className="tlc-x" onClick={() => setDrawerOpen(false)} aria-label="关闭"><X size={18} /></button>
                <span className="tlc-panel-title">{draft.id === null ? "添加" : "编辑"}单页</span>
              </div>
              <div className="ssp-head-actions">
                <button type="button" className="finord-btn ssp-cancel" onClick={() => setDrawerOpen(false)}>取消</button>
                <button type="button" className="finord-btn finord-btn-primary" onClick={submit}>确定提交</button>
              </div>
            </div>
            <div className="tlc-panel-body">
              <div className="ssp-row">
                <span className="ssp-label">＊页面标题</span>
                <input
                  className="ssp-input ssp-input-wide"
                  placeholder="最多6汉字"
                  value={draft.title}
                  onChange={(e) => setDraft((cur) => ({ ...cur, title: e.target.value }))}
                  maxLength={12}
                />
              </div>

              <div className="ssp-row ssp-row-top">
                <span className="ssp-label">页面内容</span>
                <div className="ssp-content">
                  <div className="ssp-editor">
                    <div className="ssp-editor-toolbar">
                      {SSP_TOOLBAR.map((it, idx) => (
                        <button key={idx} type="button" className="ssp-editor-tool" title={it.title} onClick={(e) => e.preventDefault()}>{it.label}</button>
                      ))}
                    </div>
                    <div
                      className="ssp-editor-body"
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) => setDraft((cur) => ({ ...cur, content_html: (e.target as HTMLDivElement).innerHTML }))}
                      dangerouslySetInnerHTML={{ __html: draft.content_html || "<p class=\"ssp-editor-placeholder\">请输入正文</p>" }}
                    />
                  </div>
                </div>
              </div>

              <div className="ssp-row ssp-row-top">
                <span className="ssp-label">分享图标</span>
                <div className="ssp-content">
                  <div className="ssp-pick" style={{ cursor: "pointer" }}>
                    {draft.share_cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={draft.share_cover_url} alt="分享图标" style={{ width: 60, height: 60, objectFit: "cover" }} />
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
                          (url) => setDraft((cur) => ({ ...cur, share_cover_url: url })),
                          (m) => showConfigToast(m, "error"),
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="ssp-row">
                <span className="ssp-label">分享标题</span>
                <input
                  className="ssp-input ssp-input-wide"
                  placeholder="请输入分享标题"
                  value={draft.share_title}
                  onChange={(e) => setDraft((cur) => ({ ...cur, share_title: e.target.value }))}
                />
              </div>

              <div className="ssp-row ssp-row-top">
                <span className="ssp-label">分享摘要</span>
                <textarea
                  className="ssp-textarea"
                  placeholder="请输入分享摘要"
                  rows={3}
                  value={draft.share_summary}
                  onChange={(e) => setDraft((cur) => ({ ...cur, share_summary: e.target.value }))}
                />
              </div>

              <div className="ssp-row">
                <span className="ssp-label">访问限制</span>
                <div className="ssp-options">
                  {[
                    { key: "only_member", label: "仅相亲会员" },
                    { key: "only_realname", label: "仅实名会员" },
                    { key: "only_vip", label: "仅VIP会员" },
                  ].map((opt) => (
                    <label key={opt.key} className={`ssp-radio ${draft[opt.key as keyof PageDraft] ? "active" : ""}`}>
                      <input
                        type="checkbox"
                        checked={Boolean(draft[opt.key as keyof PageDraft])}
                        onChange={(e) =>
                          setDraft((cur) => ({ ...cur, [opt.key]: e.target.checked } as PageDraft))
                        }
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="ssp-submit-row">
                <button type="button" className="finord-btn finord-btn-primary ssp-submit" onClick={submit}>确定提交</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
