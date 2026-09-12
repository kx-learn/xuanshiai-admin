"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Plus, Type, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, Quote, List, ListOrdered, Link2, Image as ImageIcon, Smile, Code, Heading1, Heading2, RotateCcw, RotateCw, Maximize2, Minus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints, type MerchantProductItem, type MerchantOption } from "@/lib/admin-endpoints";
import { pickAndUploadImage, showConfigToast } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("商家联盟", "商品管理");

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

const columns = ["ID", "商品名称", "商家名称", "销售价格", "添加时间", "销量统计", "上架", "链接/二维码", "操作"];

const fmt = (v: string | null | undefined) => (v ? v.replace("T", " ").slice(0, 16) : "-");

interface Form {
  id: number | null;
  merchantId: string;
  name: string;
  cover: string | null;
  originalPrice: number;
  salePrice: number;
  settleAmount: number;
  promoteMode: "fixed" | "by_level";
  promoteAmount: number;
  partnerMode: "fixed" | "by_level";
  partnerAmount: number;
  serviceAmount: number;
  limitMode: "account" | "order";
  accountLimit: number;
  orderLimit: number;
  noticeMode: "default" | "custom";
  noticeText: string;
  intro: string;
  sort: number;
}

const EMPTY_FORM: Form = {
  id: null, merchantId: "", name: "", cover: null, originalPrice: 0, salePrice: 0, settleAmount: 0,
  promoteMode: "fixed", promoteAmount: 0, partnerMode: "fixed", partnerAmount: 0, serviceAmount: 0,
  limitMode: "account", accountLimit: 0, orderLimit: 0, noticeMode: "default", noticeText: "", intro: "", sort: 0,
};

export default function MerchantProductPage() {
  const [rows, setRows] = useState<MerchantProductItem[]>([]);
  const [merchants, setMerchants] = useState<MerchantOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [merchantId, setMerchantId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY_FORM);

  useEffect(() => {
    adminEndpoints.merchantOptions().then(setMerchants).catch(() => undefined);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminEndpoints.merchantProductList({
        page: 1, page_size: 50,
        merchant_id: merchantId ? Number(merchantId) : undefined,
        keyword: keyword || undefined,
      });
      setRows(res.items);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    } finally {
      setLoading(false);
    }
  }, [merchantId, keyword]);

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setAddOpen(true); };
  const openEdit = (r: MerchantProductItem) => {
    setForm({
      id: r.id, merchantId: String(r.merchant_id), name: r.name, cover: r.cover,
      originalPrice: r.original_price ?? 0, salePrice: r.sale_price ?? 0, settleAmount: r.settle_amount ?? 0,
      promoteMode: r.promote_split_mode ?? "fixed", promoteAmount: r.promote_amount ?? 0,
      partnerMode: r.partner_split_mode ?? "fixed", partnerAmount: r.partner_amount ?? 0,
      serviceAmount: r.service_amount ?? 0, limitMode: r.buy_limit_mode ?? "account",
      accountLimit: r.account_limit ?? 0, orderLimit: r.order_limit ?? 0,
      noticeMode: r.notice_mode ?? "default", noticeText: r.notice_text ?? "", intro: r.intro ?? "", sort: r.sort ?? 0,
    });
    setAddOpen(true);
  };

  const toggleStatus = async (r: MerchantProductItem) => {
    const next = r.status === 1 ? 2 : 1;
    setRows((l) => l.map((x) => (x.id === r.id ? { ...x, status: next } : x)));
    try {
      await adminEndpoints.setMerchantProductStatus(r.id, next);
    } catch (e) {
      setRows((l) => l.map((x) => (x.id === r.id ? { ...x, status: r.status } : x)));
      showConfigToast(e instanceof Error ? e.message : "操作失败", "error");
    }
  };

  const deleteRow = async (r: MerchantProductItem) => {
    if (!window.confirm(`确定删除商品「${r.name}」？`)) return;
    try {
      await adminEndpoints.deleteMerchantProduct(r.id);
      showConfigToast("删除成功", "ok");
      load();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    if (!form.name.trim()) { showConfigToast("请填写商品名称", "error"); return; }
    if (!form.merchantId) { showConfigToast("请选择合作商家", "error"); return; }
    const payload = {
      merchant_id: Number(form.merchantId),
      name: form.name,
      cover: form.cover,
      original_price: form.originalPrice,
      sale_price: form.salePrice,
      settle_amount: form.settleAmount,
      promote_split_mode: form.promoteMode,
      promote_amount: form.promoteAmount,
      partner_split_mode: form.partnerMode,
      partner_amount: form.partnerAmount,
      service_amount: form.serviceAmount,
      buy_limit_mode: form.limitMode,
      account_limit: form.accountLimit,
      order_limit: form.orderLimit,
      notice_mode: form.noticeMode,
      notice_text: form.noticeText || null,
      intro: form.intro || null,
      sort: form.sort,
    };
    try {
      if (form.id) {
        await adminEndpoints.updateMerchantProduct(form.id, payload);
      } else {
        await adminEndpoints.createMerchantProduct(payload);
      }
      showConfigToast("提交成功", "ok");
      setAddOpen(false);
      load();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "提交失败", "error");
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
            <p>您可以在这里添加、管理所有的合作销售的商品或服务</p>
          </div>
        </div>
      </div>

      <div className="finord-card mp-card">
        <div className="mp-head">
          <h2 className="mp-title">商品管理</h2>
          <button className="finord-btn finord-btn-primary" onClick={openAdd}>＋ 添加商品</button>
        </div>

        <div className="mp-filters">
          <select className="mp-select" value={merchantId} onChange={(e) => setMerchantId(e.target.value)}>
            <option value="">所有商家</option>
            {merchants.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          <input className="mp-input" placeholder="按商品名称" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
          <button className="finord-btn finord-btn-primary mp-search-btn" onClick={() => load()}>搜索</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table mp-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.name}</td>
                  <td>{r.merchant_name || "-"}</td>
                  <td>¥{r.sale_price}</td>
                  <td>{fmt(r.create_time || r.created_at)}</td>
                  <td>销量 {r.sales_count} / 金额 ¥{r.sales_amount}</td>
                  <td>
                    <button type="button" className={`mp-switch ${r.status === 1 ? "on" : ""}`} onClick={() => toggleStatus(r)}>
                      <span className="mp-switch-knob"></span>
                    </button>
                  </td>
                  <td><a className="finord-link" onClick={() => r.link_url && window.open(r.link_url, "_blank")}>查看</a></td>
                  <td>
                    <div className="mp-ops">
                      <a className="finord-link" onClick={() => openEdit(r)}>编辑</a>
                      <a className="finord-link" onClick={() => deleteRow(r)}>删除</a>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="mp-empty">
                    <div className="mp-empty-inner">
                      <div className="mp-empty-icon">📦</div>
                      <div className="mp-empty-text">暂无数据</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {addOpen && (
        <AddProductDrawer form={form} set={set} merchants={merchants} submit={submit} onClose={() => setAddOpen(false)} />
      )}
    </div>
  );
}

function AddProductDrawer({ form, set, merchants, submit, onClose }: {
  form: Form;
  set: <K extends keyof Form>(key: K, value: Form[K]) => void;
  merchants: MerchantOption[];
  submit: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel mp-drawer-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">添加/编辑商品</span>
          </div>
          <div className="mp-head-actions">
            <button className="finord-btn mp-cancel" onClick={onClose}>关闭</button>
            <button className="finord-btn finord-btn-primary" onClick={submit}>确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 合作商家 */}
          <div className="mp-row">
            <span className="mp-label">＊合作商家</span>
            <select className="mp-input-wide" value={form.merchantId} onChange={(e) => set("merchantId", e.target.value)}>
              <option value="">输入关键词选择</option>
              {merchants.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>

          {/* 商品名称 */}
          <div className="mp-row">
            <span className="mp-label">＊商品名称</span>
            <input className="mp-input-wide" placeholder="不要超过30汉字" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>

          {/* 商品封面 */}
          <div className="mp-row">
            <span className="mp-label">＊商品封面</span>
            <label className="mp-pick">
              {form.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.cover} alt="商品封面" style={{ maxWidth: "100%", maxHeight: "100%" }} />
              ) : (<><Plus size={18} /><span>+800*800</span></>)}
              <input type="file" accept="image/*" hidden onChange={(e) => pickAndUploadImage(e.target.files?.[0], (url) => set("cover", url), (m) => showConfigToast(m, "error"))} />
            </label>
          </div>

          {/* 商品价格 */}
          <div className="mp-row">
            <span className="mp-label">＊商品价格</span>
            <div className="mp-price-row">
              <span className="mp-price-label">原价值</span>
              <input className="mp-input-num" type="number" value={form.originalPrice} onChange={(e) => set("originalPrice", Number(e.target.value))} />
              <span className="mp-unit">元</span>
              <span className="mp-price-label">合作优惠价</span>
              <input className="mp-input-num" type="number" value={form.salePrice} onChange={(e) => set("salePrice", Number(e.target.value))} />
              <span className="mp-unit">元</span>
            </div>
            <div className="mp-info">① 合作优惠价为客户下单实际支付所得价格</div>
          </div>

          {/* 商家结算 */}
          <div className="mp-row">
            <span className="mp-label">商家结算</span>
            <div className="mp-content">
              <div className="mp-range">
                <input className="mp-input-num" type="number" value={form.settleAmount} onChange={(e) => set("settleAmount", Number(e.target.value))} />
                <span className="mp-unit">元/份</span>
              </div>
              <div className="mp-info">① 订单核销成功后，平台给予商家结算的结算金额，本金额会自动计入到商家账号的"余额"中，且均有明细账务。0元表示不分成</div>
            </div>
          </div>

          {/* 推广红娘分成 */}
          <div className="mp-row">
            <span className="mp-label">推广红娘分成</span>
            <div className="mp-content">
              <div className="mp-split-row">
                {(["fixed", "by_level"] as const).map((v) => (
                  <label key={v} className={`mp-radio ${form.promoteMode === v ? "active" : ""}`}>
                    <input type="radio" name="promote" value={v} checked={form.promoteMode === v} onChange={() => set("promoteMode", v)} />
                    <span>{v === "fixed" ? "统一设置" : "按级别设置分成"}</span>
                  </label>
                ))}
                <select className="mp-select mp-select-sm"><option>固定金额</option></select>
                <input className="mp-input-num" type="number" value={form.promoteAmount} onChange={(e) => set("promoteAmount", Number(e.target.value))} disabled={form.promoteMode !== "fixed"} />
                <span className="mp-unit">元/份</span>
              </div>
              <div className="mp-info">① 订单核销成功后，平台可设置给予下单人所属于的推广红娘分成（以订单创建时归属关系为准），本金额会自动计入到红娘账号的"余额"中，且均有明细账务。0元表示不分成。特别提醒：客户仅需在平台一链接即可绑定归属关系，给予推广人订单分成，无需完善相亲会员资料</div>
            </div>
          </div>

          {/* 合伙红娘分成 */}
          <div className="mp-row">
            <span className="mp-label">合伙红娘分成</span>
            <div className="mp-content">
              <div className="mp-split-row">
                {(["fixed", "by_level"] as const).map((v) => (
                  <label key={v} className={`mp-radio ${form.partnerMode === v ? "active" : ""}`}>
                    <input type="radio" name="partner" value={v} checked={form.partnerMode === v} onChange={() => set("partnerMode", v)} />
                    <span>{v === "fixed" ? "统一设置" : "按级别设置分成"}</span>
                  </label>
                ))}
                <select className="mp-select mp-select-sm"><option>固定金额</option></select>
                <input className="mp-input-num" type="number" value={form.partnerAmount} onChange={(e) => set("partnerAmount", Number(e.target.value))} disabled={form.partnerMode !== "fixed"} />
                <span className="mp-unit">元/份</span>
              </div>
              <div className="mp-info">① 如果该付款客户有归属合伙红娘，将获得对应的金额分成，本金额会自动计入到合伙红娘账号的"余额"中</div>
            </div>
          </div>

          {/* 服务红娘分成 */}
          <div className="mp-row">
            <span className="mp-label">服务红娘分成</span>
            <div className="mp-content">
              <div className="mp-split-row">
                <select className="mp-select mp-select-sm"><option>固定金额</option></select>
                <input className="mp-input-num" type="number" value={form.serviceAmount} onChange={(e) => set("serviceAmount", Number(e.target.value))} />
                <span className="mp-unit">元/份</span>
              </div>
              <div className="mp-info">① 订单核销成功后，平台可设置给予下单人所属于的服务红娘分成，本金额会自动计入到红娘账号的"余额"中。0元表示不分成</div>
            </div>
          </div>

          {/* 购买限制 */}
          <div className="mp-row">
            <span className="mp-label">购买限制</span>
            <div className="mp-limit-row">
              <label className="mp-radio">
                <input type="radio" name="limit" value="account" checked={form.limitMode === "account"} onChange={() => set("limitMode", "account")} />
                <span>每个账号只能购买</span>
              </label>
              <input className="mp-input-num" type="number" value={form.accountLimit} onChange={(e) => set("accountLimit", Number(e.target.value))} />
              <span className="mp-unit">份</span>
              <label className="mp-radio">
                <input type="radio" name="limit" value="order" checked={form.limitMode === "order"} onChange={() => set("limitMode", "order")} />
                <span>每个订单只能购买</span>
              </label>
              <input className="mp-input-num" type="number" value={form.orderLimit} onChange={(e) => set("orderLimit", Number(e.target.value))} />
              <span className="mp-unit">份</span>
            </div>
            <div className="mp-info">① 若一个订单购买多份，只能一次性核销，无法分次核销</div>
          </div>

          {/* 购买须知 */}
          <div className="mp-row">
            <span className="mp-label">购买须知</span>
            <div className="mp-options">
              {(["default", "custom"] as const).map((v) => (
                <label key={v} className={`mp-radio ${form.noticeMode === v ? "active" : ""}`}>
                  <input type="radio" name="notice" value={v} checked={form.noticeMode === v} onChange={() => set("noticeMode", v)} />
                  <span>{v === "default" ? "使用默认" : "自定义"}</span>
                </label>
              ))}
            </div>
          </div>
          {form.noticeMode === "custom" && (
            <div className="mp-row">
              <span className="mp-label" />
              <textarea className="mp-input-wide" rows={3} value={form.noticeText} onChange={(e) => set("noticeText", e.target.value)} placeholder="请输入自定义购买须知" />
            </div>
          )}

          {/* 商品介绍 */}
          <div className="mp-row mp-row-top">
            <span className="mp-label">商品介绍</span>
            <div className="mp-editor">
              <div className="mp-editor-toolbar">
                {TOOLBAR.map((it, idx) => (
                  <button key={idx} type="button" className="mp-editor-tool" title={it.title}>{it.icon}</button>
                ))}
              </div>
              <div className="mp-editor-body" contentEditable suppressContentEditableWarning onBlur={(e) => set("intro", e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{ __html: form.intro }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
