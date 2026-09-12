"use client";

import { useCallback, useEffect, useState } from "react";
import { Download } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints, type MerchantOrderItem, type MerchantOption } from "@/lib/admin-endpoints";
import { showConfigToast } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("商家联盟", "订单管理");

const columns = ["ID", "下单商品", "商家", "下单人", "下单时间", "订单状态", "订单金额", "方式/时间", "核销状态", "操作"];

const ORDER_STATUS: Record<string, string> = { pending: "待支付", paid: "已支付", used: "已核销", cancelled: "已取消" };
const VERIFY_STATUS: Record<string, string> = { pending: "未核销", verified: "已核销" };

const fmt = (v: string | null | undefined) => (v ? v.replace("T", " ").slice(0, 16) : "-");

export default function MerchantOrderPage() {
  const [rows, setRows] = useState<MerchantOrderItem[]>([]);
  const [merchants, setMerchants] = useState<MerchantOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [merchantId, setMerchantId] = useState("");
  const [status, setStatus] = useState("");
  const [verifyStatus, setVerifyStatus] = useState("");
  const [productKeyword, setProductKeyword] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [buyerBy, setBuyerBy] = useState("");
  const [buyerKeyword, setBuyerKeyword] = useState("");
  const [verifyStart, setVerifyStart] = useState("");
  const [verifyEnd, setVerifyEnd] = useState("");

  useEffect(() => {
    adminEndpoints.merchantOptions().then(setMerchants).catch(() => undefined);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminEndpoints.merchantOrderList({
        page: 1, page_size: 50,
        merchant_id: merchantId ? Number(merchantId) : undefined,
        status: status || undefined,
        verify_status: verifyStatus || undefined,
        keyword: productKeyword || undefined,
        order_no: orderNo || undefined,
        buyer_keyword: buyerKeyword || undefined,
        verify_start: verifyStart || undefined,
        verify_end: verifyEnd || undefined,
      });
      setRows(res.items);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    } finally {
      setLoading(false);
    }
  }, [merchantId, status, verifyStatus, productKeyword, orderNo, buyerKeyword, verifyStart, verifyEnd]);

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const cancelOrder = async (r: MerchantOrderItem) => {
    if (!window.confirm(`确定取消订单 ${r.order_no}？`)) return;
    try {
      await adminEndpoints.updateMerchantOrder(r.id, "cancelled", "后台取消");
      showConfigToast("操作成功", "ok");
      load();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "操作失败", "error");
    }
  };

  const exportExcel = () => {
    adminEndpoints.exportMerchantOrders({
      merchant_id: merchantId || undefined,
      status: status || undefined,
      verify_status: verifyStatus || undefined,
      keyword: productKeyword || undefined,
      order_no: orderNo || undefined,
      buyer_keyword: buyerKeyword || undefined,
      verify_start: verifyStart || undefined,
      verify_end: verifyEnd || undefined,
    }).catch((e) => showConfigToast(e instanceof Error ? e.message : "导出失败", "error"));
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>1、未支付、已支付但未核销状态下的订单均可随时取消订单；</p>
            <p>2、已支付订单（无论是否核销），若需退款，请在"财务管理-收入明细"中操作订单不可删除</p>
          </div>
        </div>
      </div>

      <div className="finord-card mo-card">
        <div className="mo-filters">
          <div className="mo-filters-row">
            <select className="mo-select" value={merchantId} onChange={(e) => setMerchantId(e.target.value)}>
              <option value="">全部商家</option>
              {merchants.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
            <select className="mo-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">订单状态</option>
              {Object.entries(ORDER_STATUS).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
            </select>
            <select className="mo-select" value={verifyStatus} onChange={(e) => setVerifyStatus(e.target.value)}>
              <option value="">核销状态</option>
              <option value="pending">未核销</option>
              <option value="verified">已核销</option>
            </select>
            <div className="mo-searchbox">
              <input className="mo-input" placeholder="按商品关键词" value={productKeyword} onChange={(e) => setProductKeyword(e.target.value)} />
            </div>
            <div className="mo-searchbox">
              <input className="mo-input" placeholder="按订单号" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} />
            </div>
            <select className="mo-select" value={buyerBy} onChange={(e) => setBuyerBy(e.target.value)}>
              <option value="">按昵称</option>
              <option value="nickname">按昵称</option>
              <option value="phone">按手机号</option>
            </select>
            <input className="mo-input" placeholder="请输入" value={buyerKeyword} onChange={(e) => setBuyerKeyword(e.target.value)} />
          </div>
          <div className="mo-filters-row">
            <div className="mo-daterange">
              <span className="mo-text-muted">核销时间开始</span>
              <input className="mo-date" type="date" value={verifyStart} onChange={(e) => setVerifyStart(e.target.value)} />
              <span className="mo-text-muted">→</span>
              <span className="mo-text-muted">核销时间结束</span>
              <input className="mo-date" type="date" value={verifyEnd} onChange={(e) => setVerifyEnd(e.target.value)} />
            </div>
            <button className="finord-btn finord-btn-primary mo-search-btn" onClick={() => load()}>搜索</button>
            <button className="finord-btn finord-btn-primary mo-export-btn" onClick={exportExcel}><Download size={14} /> 导出EXCEL</button>
          </div>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table mo-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.product_name || "-"}</td>
                  <td>{r.merchant_name || "-"}</td>
                  <td>{r.buyer_nickname || r.buyer_user_id}<br /><span className="mo-text-muted">{r.buyer_phone || ""}</span></td>
                  <td>{fmt(r.created_at)}</td>
                  <td>{ORDER_STATUS[r.status] || r.status}</td>
                  <td>¥{r.amount}</td>
                  <td>{r.pay_method || "-"}<br /><span className="mo-text-muted">{fmt(r.paid_at)}</span></td>
                  <td>{VERIFY_STATUS[r.verify_status] || r.verify_status}<br /><span className="mo-text-muted">{fmt(r.verified_at)}</span></td>
                  <td>
                    {r.status !== "cancelled" && r.verify_status !== "verified" && (
                      <a className="finord-link" onClick={() => cancelOrder(r)}>取消订单</a>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="mo-empty">
                    <div className="mo-empty-inner">
                      <div className="mo-empty-icon">📦</div>
                      <div className="mo-empty-text">暂无数据</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
