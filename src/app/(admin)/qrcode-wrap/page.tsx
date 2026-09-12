"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminApi } from "@/lib/admin-api";
import { showConfigToast, uploadAdminImage } from "@/lib/platform-config";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "吸粉二维码", href: "/qrcode-wrap" },
  { label: "二维码管理" },
];

const columns = ["ID", "分享封面", "标识", "分享内容", "二维码有效期", "生成时间", "推送次数", "带来关注", "二维码", "操作"];

type QrContent = {
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

type QrPage = { items: QrContent[]; total: number; page: number; page_size: number };

type QrDraft = {
  id: number | null;
  cover_url: string;
  ident: string;
  share_title: string;
  share_summary: string;
  share_link: string;
  validity: string;
};

const EMPTY_DRAFT: QrDraft = {
  id: null,
  cover_url: "",
  ident: "",
  share_title: "",
  share_summary: "",
  share_link: "",
  validity: "临时二维码（30天后失效）",
};

export default function QrcodeWrapPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rows, setRows] = useState<QrContent[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIdx, setPageIdx] = useState(1);
  const [draft, setDraft] = useState<QrDraft>(EMPTY_DRAFT);
  const [selected, setSelected] = useState<number[]>([]);

  const load = async (page = pageIdx) => {
    try {
      const resp = await adminApi<QrPage>("admin/content/fan_qrcode", {
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

  const openEdit = (item: QrContent) => {
    const extra = item.extra ?? {};
    setDraft({
      id: item.id,
      cover_url: item.image_url ?? "",
      ident: item.title,
      share_title: typeof extra.share_title === "string" ? extra.share_title : "",
      share_summary: typeof extra.share_summary === "string" ? extra.share_summary : "",
      share_link: typeof extra.share_link === "string" ? extra.share_link : "",
      validity: typeof extra.validity === "string" ? extra.validity : "永久有效二维码",
    });
    setDrawerOpen(true);
  };

  const submit = async () => {
    if (!draft.ident.trim() || !draft.share_title.trim()) {
      showConfigToast("请填写标识和分享标题", "error");
      return;
    }
    try {
      const payload = {
        title: draft.ident.trim(),
        subtitle: draft.share_summary.trim() || null,
        image_url: draft.cover_url || null,
        status: 1,
        sort: 100,
        extra: {
          share_title: draft.share_title.trim(),
          share_summary: draft.share_summary.trim(),
          share_link: draft.share_link.trim(),
          validity: draft.validity,
        },
      };
      if (draft.id === null) {
        await adminApi("admin/content/fan_qrcode", { method: "POST", body: payload });
      } else {
        await adminApi(`admin/content/fan_qrcode/${draft.id}`, { method: "PATCH", body: payload });
      }
      showConfigToast("已保存", "ok");
      setDrawerOpen(false);
      void load(1);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "保存失败", "error");
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("确定删除？")) return;
    try {
      await adminApi(`admin/content/fan_qrcode/${id}`, { method: "DELETE" });
      showConfigToast("已删除", "ok");
      void load(pageIdx);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const toggleAll = () => {
    if (selected.length === rows.length) setSelected([]);
    else setSelected(rows.map((r) => r.id));
  };

  const toggleRow = (id: number) => {
    setSelected((cur) => cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id]);
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / 20)), [total]);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>本应用可以用来生成自定义微信分享内容且带公众号引导关注的二维码，将给您的吸粉，推广带来极大的方便和灵活性。</p>
            <p>使用示例：比如给每一个推广渠道(或人或事件)建立一个专属二维码，将该二维码应用到其各自的推广中。</p>
            <p>若用户未关注公众号，扫码后将出现的公众号关注页面；若用户已关注，将直接在公众号对话框中您设置的分享内容发送给用户。</p>
          </div>
        </div>
      </div>

      <div className="finord-card fq-card">
        <div className="fq-head">
          <h2 className="fq-title">二维码管理</h2>
          <button type="button" className="finord-btn finord-btn-primary" onClick={openCreate}>
            <span className="fq-btn-plus">+</span> 添加二维码
          </button>
        </div>

        <div className="fq-table-wrap">
          <table className="fq-table">
            <thead>
              <tr>
                <th className="fq-col-check">
                  <input
                    type="checkbox"
                    className="fq-check"
                    checked={rows.length > 0 && selected.length === rows.length}
                    onChange={toggleAll}
                  />
                </th>
                {columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const extra = r.extra ?? {};
                return (
                  <tr key={r.id}>
                    <td className="fq-col-check">
                      <input
                        type="checkbox"
                        className="fq-check"
                        checked={selected.includes(r.id)}
                        onChange={() => toggleRow(r.id)}
                      />
                    </td>
                    <td className="fq-id">{r.id}</td>
                    <td>
                      <div className="fq-cover">
                        {r.image_url ? (
                          <img src={r.image_url} alt="cover" style={{ width: 60, height: 60, borderRadius: 6, objectFit: "cover" }} />
                        ) : (
                          <span>无封面</span>
                        )}
                      </div>
                    </td>
                    <td className="fq-ident">{r.title}</td>
                    <td className="fq-share">
                      <div className="fq-share-title">标题: {typeof extra.share_title === "string" ? extra.share_title : (r.subtitle ?? "-")}</div>
                      <div className="fq-share-sub">摘要: {typeof extra.share_summary === "string" ? extra.share_summary : "-"}</div>
                      <div className="fq-share-link">链接: {typeof extra.share_link === "string" ? extra.share_link : "-"}</div>
                    </td>
                    <td><span className="fq-expired">{typeof extra.validity === "string" ? extra.validity : (r.status === 1 ? "有效" : "已过期")}</span></td>
                    <td className="fq-time">{(r.created_at ?? "-").replace("T", " ").slice(0, 19)}</td>
                    <td className="fq-num">{typeof extra.push_count === "number" ? extra.push_count : 0}</td>
                    <td className="fq-num">{typeof extra.follow_count === "number" ? extra.follow_count : 0}</td>
                    <td><a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); showConfigToast("二维码预览敬请期待", "ok"); }}>查看</a></td>
                    <td>
                      <div className="fq-ops">
                        <a className="fq-op" onClick={(e) => { e.preventDefault(); showConfigToast("数据统计敬请期待", "ok"); }}>数据统计</a>
                        <a className="fq-op" onClick={(e) => { e.preventDefault(); openEdit(r); }}>延期</a>
                        <a className="fq-op fq-op-del" onClick={(e) => { e.preventDefault(); void remove(r.id); }}>删除</a>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={11} className="ecl-empty">
                    <div className="ecl-empty-inner">
                      <div className="ecl-empty-icon">▤</div>
                      <div className="ecl-empty-text">暂无数据</div>
                    </div>
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
        </div>
      </div>

      {drawerOpen && (
        <AddQrcodeDrawer
          onClose={() => setDrawerOpen(false)}
          draft={draft}
          setDraft={setDraft}
          onSubmit={submit}
        />
      )}
    </div>
  );
}

function AddQrcodeDrawer({
  onClose,
  draft,
  setDraft,
  onSubmit,
}: {
  onClose: () => void;
  draft: QrDraft;
  setDraft: React.Dispatch<React.SetStateAction<QrDraft>>;
  onSubmit: () => void;
}) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel fq-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">{draft.id === null ? "添加" : "编辑"}二维码</span>
          </div>
          <div className="fq-head-actions">
            <button className="finord-btn fq-cancel" onClick={onClose}>取消</button>
            <button className="finord-btn finord-btn-primary" onClick={onSubmit}>确定提交</button>
          </div>
        </div>

        <div className="tlc-panel-body">
          <div className="fq-form-row">
            <span className="fq-form-label">＊分享封面</span>
            <div className="fq-content">
              <div className="fq-upload-box">
                <input
                  id="fq-cover-picker"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    try {
                      const url = await uploadAdminImage(f);
                      setDraft((cur) => ({ ...cur, cover_url: url }));
                    } catch (err) {
                      showConfigToast(err instanceof Error ? err.message : "上传失败", "error");
                    }
                  }}
                />
                <button
                  type="button"
                  className="fq-upload-btn"
                  onClick={() => document.getElementById("fq-cover-picker")?.click()}
                >
                  <span className="fq-upload-plus">+</span>
                  <span className="fq-upload-text">{draft.cover_url ? "替换图片" : "上传图片"}</span>
                </button>
                {draft.cover_url && <img src={draft.cover_url} alt="cover" style={{ width: 80, height: 80, borderRadius: 6, objectFit: "cover" }} />}
              </div>
              <div className="fq-info">① 最佳尺寸：300像素x300像素</div>
            </div>
          </div>

          <div className="fq-form-row">
            <span className="fq-form-label">＊标识</span>
            <div className="fq-content">
              <input
                className="fq-input fq-input-wide"
                placeholder="不要超出50字符"
                value={draft.ident}
                onChange={(e) => setDraft((cur) => ({ ...cur, ident: e.target.value }))}
                maxLength={50}
              />
              <div className="fq-info">① 自定义文字，仅用于方便区分和管理</div>
            </div>
          </div>

          <div className="fq-form-row">
            <span className="fq-form-label">＊分享标题</span>
            <div className="fq-content">
              <input
                className="fq-input fq-input-wide"
                placeholder="不要超出50字符"
                value={draft.share_title}
                onChange={(e) => setDraft((cur) => ({ ...cur, share_title: e.target.value }))}
                maxLength={50}
              />
            </div>
          </div>

          <div className="fq-form-row">
            <span className="fq-form-label">＊分享摘要</span>
            <div className="fq-content">
              <input
                className="fq-input fq-input-wide"
                value={draft.share_summary}
                onChange={(e) => setDraft((cur) => ({ ...cur, share_summary: e.target.value }))}
              />
            </div>
          </div>

          <div className="fq-form-row">
            <span className="fq-form-label">＊分享链接</span>
            <div className="fq-content">
              <input
                className="fq-input fq-input-wide"
                value={draft.share_link}
                onChange={(e) => setDraft((cur) => ({ ...cur, share_link: e.target.value }))}
              />
            </div>
          </div>

          <div className="fq-form-row">
            <span className="fq-form-label">有效期</span>
            <div className="fq-options">
              {["临时二维码（30天后失效）", "永久有效二维码"].map((o) => (
                <label key={o} className={`fq-radio ${draft.validity === o ? "active" : ""}`}>
                  <input type="radio" name="validity" value={o} checked={draft.validity === o} onChange={() => setDraft((cur) => ({ ...cur, validity: o }))} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="fq-submit-row">
            <button type="button" className="finord-btn finord-btn-primary fq-submit" onClick={onSubmit}>确定提交</button>
          </div>
        </div>
      </div>
    </>
  );
}
