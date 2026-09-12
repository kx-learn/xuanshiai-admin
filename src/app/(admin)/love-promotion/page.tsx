"use client";

import { useCallback, useEffect, useState } from "react";
import { Inbox } from "lucide-react";
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

export default function Page() {
  const [rows, setRows] = useState<PromotionOrder[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminEndpoints.promotionOrders({ page, page_size: pageSize });
      setRows(result.items);
      setTotal(result.total);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => { void load(); }, [load]);

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

        {/* 表格 */}
        <div className="lvi-table-wrap">
          <table className="lvi-table lpro-table">
            <colgroup>
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
        {message && <p className="lvi-side-hint" style={{ color: "#ff4d4f" }}>{message}</p>}
      </section>
    </div>
  );
}
