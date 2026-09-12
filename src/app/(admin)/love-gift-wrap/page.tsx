"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Plus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminApi } from "@/lib/admin-api";
import { showConfigToast, uploadAdminImage } from "@/lib/platform-config";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "送礼物" },
];

type GiftContent = {
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

type GiftPage = { items: GiftContent[]; total: number; page: number; page_size: number };

type GiftDraft = {
  id: number | null;
  name: string;
  unit: string;
  icon: string;
  icon_url: string;
  required: number;
  reward: number;
};

const EMPTY_DRAFT: GiftDraft = {
  id: null,
  name: "",
  unit: "个",
  icon: "",
  icon_url: "",
  required: 0,
  reward: 0,
};

export default function LoveGiftWrapPage() {
  const [tab, setTab] = useState<"礼物管理" | "赠送礼物">("礼物管理");
  const [rows, setRows] = useState<GiftContent[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIdx, setPageIdx] = useState(1);
  const [payFilter, setPayFilter] = useState<"全部" | "已支付" | "未支付">("全部");
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState<GiftDraft>(EMPTY_DRAFT);

  const load = async (page = pageIdx) => {
    try {
      const domain = tab === "礼物管理" ? "gift" : "gift_record";
      const kw = tab === "赠送礼物" && payFilter !== "全部"
        ? `status\":\"${payFilter}`
        : undefined;
      const resp = await adminApi<GiftPage>(`admin/content/${domain}`, {
        method: "GET",
        query: { page, page_size: 20, keyword: kw },
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
  }, [tab, payFilter]);

  const openCreate = () => {
    setDraft(EMPTY_DRAFT);
    setAddOpen(true);
  };

  const openEdit = (item: GiftContent) => {
    const extra = item.extra ?? {};
    setDraft({
      id: item.id,
      name: item.title,
      unit: typeof extra.unit === "string" ? extra.unit : "个",
      icon: typeof extra.icon === "string" ? extra.icon : "",
      icon_url: item.image_url ?? "",
      required: typeof extra.required === "number" ? extra.required : (item.amount ?? 0),
      reward: typeof extra.reward === "number" ? extra.reward : 0,
    });
    setAddOpen(true);
  };

  const submit = async () => {
    if (!draft.name.trim()) {
      showConfigToast("请填写礼物名称", "error");
      return;
    }
    try {
      const payload = {
        title: draft.name.trim(),
        subtitle: draft.unit,
        image_url: draft.icon_url || null,
        amount: draft.required,
        status: 1,
        sort: 100,
        extra: {
          unit: draft.unit,
          icon: draft.icon,
          required: draft.required,
          reward: draft.reward,
        },
      };
      if (draft.id === null) {
        await adminApi("admin/content/gift", { method: "POST", body: payload });
      } else {
        await adminApi(`admin/content/gift/${draft.id}`, { method: "PATCH", body: payload });
      }
      showConfigToast("已保存", "ok");
      setAddOpen(false);
      void load(1);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "保存失败", "error");
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("确定删除？")) return;
    try {
      const domain = tab === "礼物管理" ? "gift" : "gift_record";
      await adminApi(`admin/content/${domain}/${id}`, { method: "DELETE" });
      showConfigToast("已删除", "ok");
      void load(pageIdx);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / 20)), [total]);

  return (
    <div>
      <AdminBreadcrumb
        items={[
          ...breadcrumb,
          { label: tab },
        ]}
      />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p><em>「送礼物」</em>能够给相亲会员之间大大增加互动性、给平台增加盈利收入、提高会员对平台的粘度和回头率。</p>
            <p>礼物赠送需要向平台支付对应的礼物费用进行赠送（收益归平台所有）</p>
            <p>赠送礼物后对方将立即收到短信提示</p>
            <p>礼物获赠方将自动获得平台给予的积分奖励</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        <div className="gift-tabbar">
          <div className="gift-tabs">
            {(["礼物管理", "赠送礼物"] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={`gift-tab ${tab === t ? "active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === "礼物管理" && (
            <button type="button" className="finord-btn finord-btn-primary" onClick={openCreate}>💳 添加礼物</button>
          )}
        </div>

        {tab === "礼物管理" ? (
          <div className="gift-table-wrap">
            <table className="finord-table gift-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>礼物名称</th>
                  <th>礼物单位</th>
                  <th>礼物图片</th>
                  <th>销量统计</th>
                  <th>所需积分</th>
                  <th>奖励积分</th>
                  <th>排序</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => {
                  const extra = r.extra ?? {};
                  return (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.title}</td>
                      <td>{typeof extra.unit === "string" ? extra.unit : (r.subtitle ?? "-")}</td>
                      <td>
                        <span className="gift-thumb">
                          {r.image_url ? <img src={r.image_url} alt={r.title} style={{ width: 28, height: 28, borderRadius: 6 }} /> : (typeof extra.icon === "string" ? extra.icon : "🎁")}
                        </span>
                      </td>
                      <td><span className="gift-sales"><b>{typeof extra.sales === "number" ? extra.sales : 0}</b>查看</span></td>
                      <td><span className="gift-coin">{typeof extra.required === "number" ? extra.required : (r.amount ?? 0)}金币</span></td>
                      <td><span className="gift-coin">{typeof extra.reward === "number" ? extra.reward : 0}金币</span></td>
                      <td>{idx + 1}</td>
                      <td>
                        <span className="gift-ops">
                          <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); openEdit(r); }}>编辑</a>
                          <span className="gift-op-sep">|</span>
                          <a className="finord-link gift-op-del" href="#" onClick={(e) => { e.preventDefault(); void remove(r.id); }}>删除</a>
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="ecl-empty">
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
        ) : (
          <>
            <div className="gift-subtabs">
              {(["全部", "已支付", "未支付"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`gift-subtab ${payFilter === f ? "active" : ""}`}
                  onClick={() => setPayFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="gift-table-wrap">
              <table className="finord-table gift-table gift-table-wide">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>赠送礼物</th>
                    <th>赠送数量</th>
                    <th>赠送人</th>
                    <th>消耗积分</th>
                    <th>实付金额</th>
                    <th>奖励积分</th>
                    <th>赠送对象</th>
                    <th>支付状态</th>
                    <th>赠送时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const extra = r.extra ?? {};
                    return (
                      <tr key={r.id}>
                        <td>{r.id}</td>
                        <td>{r.title}</td>
                        <td>{typeof extra.qty === "string" ? extra.qty : "1个"}</td>
                        <td>
                          <span className="gift-person">
                            <span className="gift-avatar" />
                            <span className="gift-person-info">
                              <span className="gift-name">{typeof extra.from_name === "string" ? extra.from_name : "-"}</span>
                              <span className="gift-id">编号: {typeof extra.from_id === "string" ? extra.from_id : "-"}</span>
                            </span>
                          </span>
                        </td>
                        <td><span className="gift-coin">{typeof extra.consume === "number" ? extra.consume : 0}金币</span></td>
                        <td><span className="gift-price">{typeof extra.paid === "number" ? extra.paid : 0}元</span></td>
                        <td><span className="gift-coin">{typeof extra.reward === "number" ? extra.reward : 0}金币</span></td>
                        <td>
                          <span className="gift-person">
                            <span className="gift-avatar gift-avatar-recv" />
                            <span className="gift-person-info">
                              <span className="gift-name">{typeof extra.to_name === "string" ? extra.to_name : "-"}</span>
                              <span className="gift-id">编号: {typeof extra.to_id === "string" ? extra.to_id : "-"}</span>
                            </span>
                          </span>
                        </td>
                        <td><span className="gift-status">{typeof extra.pay_status === "string" ? extra.pay_status : (r.status === 1 ? "已支付" : "未支付")}</span></td>
                        <td className="gift-dash">{(r.created_at ?? "-").replace("T", " ").slice(0, 19)}</td>
                        <td><a className="finord-link gift-op-del" href="#" onClick={(e) => { e.preventDefault(); void remove(r.id); }}>删除</a></td>
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
          </>
        )}

        <div className="finord-pagination">
          <span className="finord-info">共 {total} 条</span>
          <div className="finord-pages">
            <button className="finord-page nav" onClick={() => load(Math.max(1, pageIdx - 1))} disabled={pageIdx <= 1}>‹</button>
            <span className="finord-page active">{pageIdx} / {totalPages}</span>
            <button className="finord-page nav" onClick={() => load(Math.min(totalPages, pageIdx + 1))} disabled={pageIdx >= totalPages}>›</button>
          </div>
        </div>
      </div>

      {addOpen && (
        <AddGiftDrawer
          onClose={() => setAddOpen(false)}
          draft={draft}
          setDraft={setDraft}
          onSubmit={submit}
        />
      )}
    </div>
  );
}

function AddGiftDrawer({
  onClose,
  draft,
  setDraft,
  onSubmit,
}: {
  onClose: () => void;
  draft: GiftDraft;
  setDraft: React.Dispatch<React.SetStateAction<GiftDraft>>;
  onSubmit: () => void;
}) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel gi-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">{draft.id === null ? "添加" : "编辑"}礼物</span>
          </div>
          <div className="gi-head-actions">
            <button className="finord-btn gi-cancel" onClick={onClose}>取消</button>
            <button className="finord-btn finord-btn-primary" onClick={onSubmit}>确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          <div className="gi-row">
            <span className="gi-label">＊礼物名称</span>
            <div className="gi-content">
              <input
                className="gi-input gi-input-wide"
                value={draft.name}
                onChange={(e) => setDraft((cur) => ({ ...cur, name: e.target.value }))}
                maxLength={8}
              />
              <div className="gi-info">① 不要超过8个汉字</div>
            </div>
          </div>

          <div className="gi-row">
            <span className="gi-label">＊礼物单位</span>
            <input
              className="gi-input gi-input-wide"
              value={draft.unit}
              onChange={(e) => setDraft((cur) => ({ ...cur, unit: e.target.value }))}
            />
          </div>

          <div className="gi-row">
            <span className="gi-label">＊礼物图片</span>
            <div className="gi-pick">
              <input
                id="gi-icon-picker"
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (!f) return;
                  try {
                    const url = await uploadAdminImage(f);
                    setDraft((cur) => ({ ...cur, icon_url: url }));
                  } catch (err) {
                    showConfigToast(err instanceof Error ? err.message : "上传失败", "error");
                  }
                }}
              />
              <button type="button" onClick={() => document.getElementById("gi-icon-picker")?.click()}>
                <Plus size={18} /><span>{draft.icon_url ? "替换图片" : "上传图片"}</span>
              </button>
              {draft.icon_url && <img src={draft.icon_url} alt="gift" style={{ width: 32, height: 32, borderRadius: 6 }} />}
            </div>
          </div>

          <div className="gi-row">
            <span className="gi-label">＊购买所需积分数</span>
            <div className="gi-content">
              <div className="gi-inline">
                <input
                  type="number"
                  className="gi-input gi-input-num"
                  value={draft.required}
                  onChange={(e) => setDraft((cur) => ({ ...cur, required: Number(e.target.value) || 0 }))}
                />
                <span className="gi-unit">积分</span>
              </div>
              <div className="gi-info">① 礼物赠送方需要支出的积分</div>
            </div>
          </div>

          <div className="gi-row">
            <span className="gi-label">＊平台奖励积分</span>
            <div className="gi-content">
              <div className="gi-inline">
                <input
                  type="number"
                  className="gi-input gi-input-num"
                  value={draft.reward}
                  onChange={(e) => setDraft((cur) => ({ ...cur, reward: Number(e.target.value) || 0 }))}
                />
                <span className="gi-unit">积分</span>
              </div>
              <div className="gi-info">① 礼物获赠方获得的平台奖励积分</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
