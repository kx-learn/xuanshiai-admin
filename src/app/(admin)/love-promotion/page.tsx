"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Inbox } from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { PromotionOrder } from "@/lib/admin-endpoints";

const PAY_STATUS_LABEL: Record<string, string> = {
  unpaid: "未支付",
  paid: "已支付",
  refunded: "已退款",
};
const PAY_METHOD_LABEL: Record<string, string> = {
  wechat: "微信支付",
  alipay: "支付宝",
  balance: "余额支付",
  offline: "线下转账",
};
const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "待处理",
  processing: "推广中",
  done: "已完成",
  cancelled: "已取消",
};
const fmt = (value: string | null) => (value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "-");

const PAY_STATUS_OPTIONS: Array<[string, string]> = [
  ["", "全部支付状态"],
  ["unpaid", "未支付"],
  ["paid", "已支付"],
  ["refunded", "已退款"],
];
const ORDER_STATUS_OPTIONS: Array<[string, string]> = [
  ["", "全部订单状态"],
  ["pending", "待处理"],
  ["processing", "推广中"],
  ["done", "已完成"],
  ["cancelled", "已取消"],
];

export default function Page() {
  const [rows, setRows] = useState<PromotionOrder[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  /* 后端 GET /admin/promotion-orders 仅支持 page / page_size / pay_status / status / search 五个参数 */
  const [payStatus, setPayStatus] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminEndpoints.promotionOrders({
        page,
        page_size: pageSize,
        pay_status: payStatus || undefined,
        status: orderStatus || undefined,
        search: search.trim() || undefined,
      });
      setRows(result.items);
      setTotal(result.total);
      setSelected([]);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, payStatus, orderStatus, search]);

  useEffect(() => { void load(); }, [load]);

  const runSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const resetFilters = () => {
    setPayStatus("");
    setOrderStatus("");
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const markPaid = async (row: PromotionOrder) => {
    try {
      await adminEndpoints.updatePromotionOrder(row.id, { pay_status: "paid", status: "processing" });
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    }
  };

  const markDone = async (row: PromotionOrder) => {
    try {
      await adminEndpoints.updatePromotionOrder(row.id, { status: "done" });
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    }
  };

  const removeRow = async (row: PromotionOrder) => {
    if (typeof window !== "undefined" && !window.confirm(`确认删除推广订单 ${row.order_no}？`)) return;
    try {
      await adminEndpoints.deletePromotionOrder(row.id);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除失败");
    }
  };

  return (
    <div className="min-w-0">
      <AdminBreadcrumb items={getBreadcrumb("会员服务", "推广管理")} />

      <section className="lvi-card">
        {/* 须知 */}
        <div className="lvi-notice">
          <div className="lvi-notice-title">
            <span className="lvi-notice-icon">i</span>
            <span>须知</span>
          </div>
          <p>
            推广服务是指为会员撰写专门的介绍文章或视频发布在平台的公众号、红娘朋友圈等自媒体平台，帮助会员快速扩散相亲信息。
          </p>
        </div>

        {/* 卡片头 */}
        <div className="lvi-head">
          <h2 className="lvi-title">推广管理</h2>
        </div>

        {/* 筛选：全部对应后端 promotion-orders 支持的 pay_status / status / search 参数 */}
        <div className="lvi-filters">
          <label className="lvi-select">
            <select
              value={payStatus}
              aria-label="支付状态筛选"
              onChange={(e) => { setPayStatus(e.target.value); setPage(1); }}
            >
              {PAY_STATUS_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <ChevronDown className="lvi-caret" />
          </label>
          <label className="lvi-select">
            <select
              value={orderStatus}
              aria-label="订单状态筛选"
              onChange={(e) => { setOrderStatus(e.target.value); setPage(1); }}
            >
              {ORDER_STATUS_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <ChevronDown className="lvi-caret" />
          </label>
          <input
            type="text"
            className="lvi-search-input"
            placeholder="订单号 / 昵称 / 套餐名"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
          />
          <button type="button" className="lvi-btn primary" onClick={runSearch}>搜索</button>
          <button type="button" className="lvi-btn" onClick={resetFilters}>重置</button>
        </div>

        {/* 表格 */}
        <div className="lvi-table-wrap">
          <table className="lvi-table lpro-table">
            <colgroup>
              <col style={{ width: 56 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: "auto" }} />
              <col style={{ width: 140 }} />
              <col style={{ width: 140 }} />
            </colgroup>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    aria-label="全选"
                    checked={rows.length > 0 && selected.length === rows.length}
                    onChange={() => setSelected(selected.length === rows.length ? [] : rows.map((row) => row.id))}
                  />
                </th>
                <th>ID</th>
                <th>购买时间</th>
                <th>购买推广人</th>
                <th>支付状态</th>
                <th>支付方式</th>
                <th>支付订单</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`选择推广订单 ${row.id}`}
                      checked={selected.includes(row.id)}
                      onChange={() => setSelected((current) => current.includes(row.id) ? current.filter((id) => id !== row.id) : [...current, row.id])}
                    />
                  </td>
                  <td>{row.id}</td>
                  <td>{fmt(row.created_at)}</td>
                  <td>{row.user_nickname || `用户${row.user_id}`}</td>
                  <td>{PAY_STATUS_LABEL[row.pay_status] ?? row.pay_status}</td>
                  <td>{row.pay_method ? (PAY_METHOD_LABEL[row.pay_method] ?? row.pay_method) : "-"}</td>
                  <td>{row.order_no}</td>
                  <td>{ORDER_STATUS_LABEL[row.status] ?? row.status}</td>
                  <td>
                    <div className="lvi-actions">
                      {row.pay_status === "unpaid" && (
                        <button type="button" className="lvi-link" onClick={() => void markPaid(row)}>标记已支付</button>
                      )}
                      {row.status !== "done" && row.status !== "cancelled" && (
                        <button type="button" className="lvi-link" onClick={() => void markDone(row)}>完成</button>
                      )}
                      <button type="button" className="lvi-link" onClick={() => void removeRow(row)}>删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="lap-empty">
              <Inbox className="lap-empty-icon" />
              <span>{loading ? "加载中…" : "暂无数据"}</span>
            </div>
          )}
        </div>
        <AdminPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
        {selected.length > 0 && (
          <div className="lead-bulk-toolbar lpro-bulk-toolbar">
            <span>已选择 <b>{selected.length}</b> 项</span>
            <button type="button" onClick={() => setSelected([])}>取消选择</button>
          </div>
        )}
        {message && <p className="lvi-side-hint" style={{ color: "#ff4d4f" }}>{message}</p>}
      </section>
    </div>
  );
}
