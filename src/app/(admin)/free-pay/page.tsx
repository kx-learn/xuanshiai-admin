"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminApi } from "@/lib/admin-api";
import { pickAndUploadImage, showConfigToast, useConfigDomain } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("运营工具", "自由收款");

type Tab = "items" | "orders";

type ItemContent = {
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

type ItemDraft = {
  id: number | null;
  title: string;
  category_id: number;
  amount: number;
  promoter_reward_amount: number;
  service_reward_amount: number;
  partner_reward_amount: number;
  store_reward_amount: number;
  cover_url: string | null;
  sort: number;
  enabled: boolean;
};

const EMPTY_ITEM: ItemDraft = {
  id: null,
  title: "",
  category_id: 0,
  amount: 0,
  promoter_reward_amount: 0,
  service_reward_amount: 0,
  partner_reward_amount: 0,
  store_reward_amount: 0,
  cover_url: null,
  sort: 100,
  enabled: true,
};

type Category = {
  id: number;
  name: string;
  intro_html: string;
  cover_url: string | null;
  share_title: string;
  share_cover_url: string | null;
  share_summary: string;
  enabled: boolean;
};

type CategoryConfig = {
  categories: Category[];
  qrcode_url: string | null;
  remark: string;
};

const DEFAULT_CATEGORY_CONFIG: CategoryConfig = {
  categories: [],
  qrcode_url: null,
  remark: "",
};

export default function FreePayPage() {
  const [tab, setTab] = useState<Tab>("items");
  const { snapshot, save } = useConfigDomain<CategoryConfig>("tools_free_pay", DEFAULT_CATEGORY_CONFIG);
  const [categories, setCategories] = useState<Category[]>([]);
  const [qrcodeUrl, setQrcodeUrl] = useState<string | null>(null);
  const [remark, setRemark] = useState<string>("");

  const [items, setItems] = useState<ItemContent[]>([]);
  const [orders, setOrders] = useState<ItemContent[]>([]);
  const [itemDrawer, setItemDrawer] = useState(false);
  const [itemDraft, setItemDraft] = useState<ItemDraft>(EMPTY_ITEM);
  const [catDrawer, setCatDrawer] = useState(false);
  const [catDraft, setCatDraft] = useState<Category>({
    id: 0,
    name: "",
    intro_html: "",
    cover_url: null,
    share_title: "",
    share_cover_url: null,
    share_summary: "",
    enabled: true,
  });

  useEffect(() => {
    if (!snapshot) return;
    const data = snapshot.config;
    setCategories(Array.isArray(data.categories) ? data.categories : []);
    setQrcodeUrl(typeof data.qrcode_url === "string" ? (data.qrcode_url as string) : null);
    setRemark(typeof data.remark === "string" ? (data.remark as string) : "");
  }, [snapshot]);

  const loadItems = async () => {
    try {
      const resp = await adminApi<{ items: ItemContent[]; total: number }>("admin/content/free_pay_item", {
        method: "GET",
        query: { page: 1, page_size: 50 },
      });
      setItems(resp.items);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载项目失败", "error");
    }
  };

  const loadOrders = async () => {
    try {
      const resp = await adminApi<{ items: ItemContent[]; total: number }>("admin/content/free_pay_order", {
        method: "GET",
        query: { page: 1, page_size: 50 },
      });
      setOrders(resp.items);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载订单失败", "error");
    }
  };

  useEffect(() => {
    void loadItems();
    void loadOrders();
  }, []);

  const openCreateItem = () => {
    setItemDraft({ ...EMPTY_ITEM, category_id: categories[0]?.id ?? 0 });
    setItemDrawer(true);
  };
  const openEditItem = (item: ItemContent) => {
    const extra = item.extra ?? {};
    setItemDraft({
      id: item.id,
      title: item.title || "",
      category_id: typeof extra.category_id === "number" ? (extra.category_id as number) : 0,
      amount: item.amount ?? 0,
      promoter_reward_amount: typeof extra.promoter_reward_amount === "number" ? (extra.promoter_reward_amount as number) : 0,
      service_reward_amount: typeof extra.service_reward_amount === "number" ? (extra.service_reward_amount as number) : 0,
      partner_reward_amount: typeof extra.partner_reward_amount === "number" ? (extra.partner_reward_amount as number) : 0,
      store_reward_amount: typeof extra.store_reward_amount === "number" ? (extra.store_reward_amount as number) : 0,
      cover_url: typeof extra.cover_url === "string" ? (extra.cover_url as string) : item.image_url ?? null,
      sort: typeof extra.sort === "number" ? (extra.sort as number) : item.sort ?? 100,
      enabled: item.status === 1,
    });
    setItemDrawer(true);
  };
  const removeItem = async (id: number) => {
    if (!window.confirm("确定删除该收款项目？")) return;
    try {
      await adminApi(`admin/content/free_pay_item/${id}`, { method: "DELETE" });
      showConfigToast("已删除", "ok");
      void loadItems();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };
  const submitItem = async () => {
    if (!itemDraft.title.trim()) {
      showConfigToast("请输入收款项目名称", "error");
      return;
    }
    if (itemDraft.amount < 0) {
      showConfigToast("金额必须非负", "error");
      return;
    }
    const payload = {
      title: itemDraft.title.trim(),
      subtitle: categories.find((c) => c.id === itemDraft.category_id)?.name ?? null,
      image_url: itemDraft.cover_url,
      amount: itemDraft.amount,
      status: itemDraft.enabled ? 1 : 2,
      sort: itemDraft.sort,
      extra: {
        category_id: itemDraft.category_id,
        promoter_reward_amount: itemDraft.promoter_reward_amount,
        service_reward_amount: itemDraft.service_reward_amount,
        partner_reward_amount: itemDraft.partner_reward_amount,
        store_reward_amount: itemDraft.store_reward_amount,
        cover_url: itemDraft.cover_url,
      },
    };
    try {
      if (itemDraft.id === null) {
        await adminApi("admin/content/free_pay_item", { method: "POST", body: payload });
      } else {
        await adminApi(`admin/content/free_pay_item/${itemDraft.id}`, { method: "PATCH", body: payload });
      }
      showConfigToast("已保存", "ok");
      setItemDrawer(false);
      void loadItems();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "保存失败", "error");
    }
  };

  const openCreateCategory = () => {
    setCatDraft({
      id: Date.now(),
      name: "",
      intro_html: "",
      cover_url: null,
      share_title: "",
      share_cover_url: null,
      share_summary: "",
      enabled: true,
    });
    setCatDrawer(true);
  };
  const openEditCategory = (cat: Category) => {
    setCatDraft({ ...cat });
    setCatDrawer(true);
  };
  const removeCategory = (id: number) => {
    if (!window.confirm("确定删除该类目？")) return;
    setCategories((arr) => arr.filter((c) => c.id !== id));
  };
  const submitCategory = async () => {
    if (!catDraft.name.trim()) {
      showConfigToast("请输入类目名称", "error");
      return;
    }
    setCategories((arr) => {
      const idx = arr.findIndex((c) => c.id === catDraft.id);
      if (idx >= 0) {
        const next = [...arr];
        next[idx] = catDraft;
        return next;
      }
      return [...arr, catDraft];
    });
    setCatDrawer(false);
  };

  const saveConfig = async () => {
    const ok = await save({ categories, qrcode_url: qrcodeUrl, remark }, "自由收款配置更新");
    showConfigToast(ok ? "已保存" : "内容无变化", ok ? "ok" : "error");
  };

  const filteredItems = useMemo(() => {
    return items;
  }, [items]);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card">
        <div className="fp-tab-bar">
          {(["items", "orders"] as Tab[]).map((t) => (
            <button key={t} className={`fp-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t === "items" ? "自由收款" : "收款订单"}
            </button>
          ))}
        </div>

        {tab === "items" ? (
          <>
            <div className="ecl-notice">
              <div className="ecl-notice-body">
                <span className="ecl-notice-ic">◇</span>
                <div className="ecl-notice-text">
                  <div className="ecl-notice-title">须知</div>
                  <p>这是一款<em>自由在线收款解决方案</em>，帮助您在平台上快速完成服务或商品介绍、在线收款、财务数据统计。</p>
                  <p>您可以在这里创建任意在线支付项目，发送到微信或微信群给客户即可完成在线收款，款项直接进入到您的微信账户中。</p>
                </div>
              </div>
            </div>

            <div className="finord-section-title fp-title">收款类目</div>
            <div className="fp-cat-table">
              <div className="fp-cat-row">
                {categories.length === 0 ? (
                  <span className="fp-empty">暂无类目</span>
                ) : (
                  categories.map((c) => (
                    <span key={c.id} className="fp-cat-chip">
                      {c.name}
                      <button type="button" className="fp-cat-edit" onClick={() => openEditCategory(c)}>✎</button>
                      <button type="button" className="fp-cat-del" onClick={() => removeCategory(c.id)}>×</button>
                    </span>
                  ))
                )}
                <button type="button" className="finord-btn finord-btn-primary" onClick={openCreateCategory}>＋ 添加类目</button>
              </div>
            </div>

            <div className="finord-section-title fp-title">收款项目</div>
            <div className="finord-filters fp-filters">
              <div className="finord-searchbox">
                <span className="finord-search-label">类目:</span>
                <select className="finord-select" onChange={() => loadItems()}>
                  <option value="">不限</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="fp-spacer" />
              <button type="button" className="finord-btn finord-btn-primary" onClick={openCreateItem}>＋ 添加收款项目</button>
            </div>

            <div className="finord-table-wrap">
              <table className="finord-table">
                <thead>
                  <tr>
                    <th>ID</th><th>项目名称</th><th>类目</th><th>金额</th>
                    <th>推广红娘奖励</th><th>服务红娘奖励</th><th>合伙红娘分成</th><th>分店分成</th><th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr><td colSpan={9} className="ecl-empty"><div className="ecl-empty-inner"><div className="ecl-empty-icon">▤</div><div className="ecl-empty-text">暂无项目，点击「添加收款项目」创建</div></div></td></tr>
                  ) : (
                    filteredItems.map((it) => {
                      const extra = it.extra ?? {};
                      const catName = categories.find((c) => c.id === extra.category_id)?.name ?? "-";
                      return (
                        <tr key={it.id}>
                          <td>{it.id}</td>
                          <td>{it.title}</td>
                          <td>{catName}</td>
                          <td>¥{it.amount ?? 0}</td>
                          <td>{typeof extra.promoter_reward_amount === "number" ? (extra.promoter_reward_amount as number) : 0}</td>
                          <td>{typeof extra.service_reward_amount === "number" ? (extra.service_reward_amount as number) : 0}</td>
                          <td>{typeof extra.partner_reward_amount === "number" ? (extra.partner_reward_amount as number) : 0}</td>
                          <td>{typeof extra.store_reward_amount === "number" ? (extra.store_reward_amount as number) : 0}</td>
                          <td>
                            <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); openEditItem(it); }}>编辑</a>
                            <span className="ex-op-sep">/</span>
                            <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); void removeItem(it.id); }}>删除</a>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="xm-actions" style={{ marginTop: 16 }}>
              <button type="button" className="xm-submit" onClick={saveConfig}>保存类目配置</button>
            </div>
          </>
        ) : (
          <>
            <div className="ecl-notice">
              <div className="ecl-notice-body">
                <div className="ecl-notice-text">
                  <p>客户在平台点击&ldquo;立即支付&rdquo;系统就会创建一个订单，您在这里可以查询到您的全部订单信息，您可以在&ldquo;财务管理-收入明细&rdquo;中进行更多操作。</p>
                </div>
              </div>
            </div>
            <div className="finord-table-wrap">
              <table className="finord-table">
                <thead>
                  <tr>
                    <th>ID</th><th>下单时间</th><th>项目</th><th>金额</th><th>支付状态</th><th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={6} className="ecl-empty"><div className="ecl-empty-inner"><div className="ecl-empty-icon">▤</div><div className="ecl-empty-text">暂无订单</div></div></td></tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.created_at ?? "-"}</td>
                        <td>{o.title}</td>
                        <td>¥{o.amount ?? 0}</td>
                        <td>{o.status === 1 ? "已支付" : "未支付"}</td>
                        <td><a className="finord-link" href="#">查看</a></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {itemDrawer && (
        <>
          <div className="tlc-mask" onClick={() => setItemDrawer(false)} />
          <div className="tlc-panel fp-panel">
            <div className="tlc-panel-head">
              <div className="tlc-panel-head-left">
                <button type="button" className="tlc-x" onClick={() => setItemDrawer(false)} aria-label="关闭"><X size={18} /></button>
                <span className="tlc-panel-title">{itemDraft.id === null ? "添加" : "编辑"}收款项目</span>
              </div>
              <div className="fp-head-actions">
                <button type="button" className="finord-btn fp-cancel" onClick={() => setItemDrawer(false)}>取消</button>
                <button type="button" className="finord-btn finord-btn-primary" onClick={submitItem}>确定提交</button>
              </div>
            </div>
            <div className="tlc-panel-body">
              <div className="fp-row">
                <span className="fp-label">＊项目名称</span>
                <input className="fp-input fp-input-wide" value={itemDraft.title} onChange={(e) => setItemDraft((cur) => ({ ...cur, title: e.target.value }))} maxLength={20} />
              </div>
              <div className="fp-row">
                <span className="fp-label">＊归集类目</span>
                <select className="fp-select fp-select-wide" value={itemDraft.category_id} onChange={(e) => setItemDraft((cur) => ({ ...cur, category_id: Number(e.target.value) }))}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="fp-row">
                <span className="fp-label">＊收款金额</span>
                <div className="fp-content">
                  <input type="number" min={0} className="fp-input fp-input-num" value={itemDraft.amount} onChange={(e) => setItemDraft((cur) => ({ ...cur, amount: Math.max(0, Number(e.target.value) || 0) }))} />
                  <span className="fp-unit">元</span>
                </div>
              </div>
              {[
                { key: "promoter_reward_amount", label: "推广红娘奖励" },
                { key: "service_reward_amount", label: "服务红娘奖励" },
                { key: "partner_reward_amount", label: "合伙红娘分成" },
                { key: "store_reward_amount", label: "分店分成" },
              ].map((row) => (
                <div key={row.key} className="fp-row">
                  <span className="fp-label">{row.label}</span>
                  <div className="fp-content">
                    <input
                      type="number"
                      min={0}
                      className="fp-input fp-input-num"
                      value={itemDraft[row.key as keyof ItemDraft] as number}
                      onChange={(e) =>
                        setItemDraft((cur) => ({ ...cur, [row.key]: Math.max(0, Number(e.target.value) || 0) } as ItemDraft))
                      }
                    />
                    <span className="fp-unit">元</span>
                  </div>
                </div>
              ))}
              <div className="fp-row fp-row-top">
                <span className="fp-label">页面头图</span>
                <div className="fp-content">
                  <div className="fp-cover" style={{ cursor: "pointer" }}>
                    {itemDraft.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={itemDraft.cover_url} alt="头图" style={{ width: 120, height: 60, objectFit: "cover" }} />
                    ) : (
                      <span>+ 上传</span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) =>
                        pickAndUploadImage(
                          e.target.files?.[0],
                          (url) => setItemDraft((cur) => ({ ...cur, cover_url: url })),
                          (m) => showConfigToast(m, "error"),
                        )
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="fp-row">
                <span className="fp-label">显示排序</span>
                <input type="number" className="fp-input fp-input-num" value={itemDraft.sort} onChange={(e) => setItemDraft((cur) => ({ ...cur, sort: Number(e.target.value) || 0 }))} />
              </div>
            </div>
          </div>
        </>
      )}

      {catDrawer && (
        <>
          <div className="tlc-mask" onClick={() => setCatDrawer(false)} />
          <div className="tlc-panel fp-panel">
            <div className="tlc-panel-head">
              <div className="tlc-panel-head-left">
                <button type="button" className="tlc-x" onClick={() => setCatDrawer(false)} aria-label="关闭"><X size={18} /></button>
                <span className="tlc-panel-title">添加/编辑类目</span>
              </div>
              <div className="fp-head-actions">
                <button type="button" className="finord-btn fp-cancel" onClick={() => setCatDrawer(false)}>取消</button>
                <button type="button" className="finord-btn finord-btn-primary" onClick={submitCategory}>确定</button>
              </div>
            </div>
            <div className="tlc-panel-body">
              <div className="fp-row">
                <span className="fp-label">＊类目名称</span>
                <input className="fp-input fp-input-wide" value={catDraft.name} onChange={(e) => setCatDraft((cur) => ({ ...cur, name: e.target.value }))} maxLength={20} />
              </div>
              <div className="fp-row">
                <span className="fp-label">服务介绍</span>
                <textarea className="fp-textarea" rows={3} value={catDraft.intro_html} onChange={(e) => setCatDraft((cur) => ({ ...cur, intro_html: e.target.value }))} />
              </div>
              <div className="fp-row">
                <span className="fp-label">页面头图</span>
                <div className="fp-content">
                  <div className="fp-cover" style={{ cursor: "pointer" }}>
                    {catDraft.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={catDraft.cover_url} alt="头图" style={{ width: 120, height: 60, objectFit: "cover" }} />
                    ) : (
                      <span>+750*350</span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) =>
                        pickAndUploadImage(
                          e.target.files?.[0],
                          (url) => setCatDraft((cur) => ({ ...cur, cover_url: url })),
                          (m) => showConfigToast(m, "error"),
                        )
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="fp-row">
                <span className="fp-label">分享标题</span>
                <input className="fp-input fp-input-wide" value={catDraft.share_title} onChange={(e) => setCatDraft((cur) => ({ ...cur, share_title: e.target.value }))} />
              </div>
              <div className="fp-row">
                <span className="fp-label">分享描述</span>
                <textarea className="fp-textarea" rows={3} value={catDraft.share_summary} onChange={(e) => setCatDraft((cur) => ({ ...cur, share_summary: e.target.value }))} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
