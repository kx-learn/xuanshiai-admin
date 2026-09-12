"use client";

import { useCallback, useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints, type VideoTipItem } from "@/lib/admin-endpoints";
import { showConfigToast } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("短视频", "打赏管理");

const columns = [
  { key: "id", label: "ID" },
  { key: "video", label: "打赏视频" },
  { key: "tipper", label: "打赏用户" },
  { key: "receiver", label: "受赏用户" },
  { key: "msg", label: "打赏附言" },
  { key: "form", label: "打赏形式" },
  { key: "amount", label: "打赏数额" },
  { key: "time", label: "打赏时间" },
  { key: "pay", label: "支付方式" },
  { key: "order", label: "支付单号" },
  { key: "status", label: "状态" },
  { key: "action", label: "操作" },
];

const PAY_STATUS: Record<string, string> = { paid: "已支付", unpaid: "未支付", refunded: "已退款" };

const fmt = (v: string | null | undefined) => (v ? v.replace("T", " ").slice(0, 19) : "-");

export default function ShortVideoTipPage() {
  const [rows, setRows] = useState<VideoTipItem[]>([]);
  const [totalAmount, setTotalAmount] = useState("0");
  const [loading, setLoading] = useState(false);
  const [searchBy, setSearchBy] = useState("video");
  const [keyword, setKeyword] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminEndpoints.videoTipList({ page: 1, page_size: 50, search_by: searchBy, keyword: keyword || undefined });
      setRows(res.items);
      setTotalAmount(res.total_amount ?? "0");
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    } finally {
      setLoading(false);
    }
  }, [searchBy, keyword]);

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card svt-card">
        <div className="svt-head">
          <h2 className="svt-title">打赏管理</h2>
          <div className="svt-total">共收到打赏：<span className="svt-total-num">{totalAmount}元</span></div>
        </div>

        <div className="svt-filters">
          <select className="svt-select" value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
            <option value="video">按标题搜</option>
            <option value="tipper">按打赏用户</option>
            <option value="receiver">按受赏用户</option>
          </select>
          <input className="svt-input" placeholder="请输入" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
          <button className="finord-btn finord-btn-primary svt-search-btn" onClick={() => load()}>搜索</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table svt-table">
            <thead>
              <tr>
                <th className="svt-col-check"><input type="checkbox" className="svt-check" /></th>
                {columns.map((c) => <th key={c.key}>{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="svt-col-check"><input type="checkbox" className="svt-check" /></td>
                  <td>{r.id}</td>
                  <td>{r.video_description || r.video_id}</td>
                  <td>{r.tipper_nickname || r.tipper_user_id}</td>
                  <td>{r.receiver_nickname || r.receiver_user_id}</td>
                  <td>{r.message || "-"}</td>
                  <td>{r.tip_form_label}</td>
                  <td>{r.amount}元</td>
                  <td>{fmt(r.created_at)}</td>
                  <td>{r.pay_method || "-"}</td>
                  <td>{r.order_no || "-"}</td>
                  <td>{PAY_STATUS[r.status] || r.status}</td>
                  <td>-</td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="svt-empty">
                    <div className="svt-empty-inner">
                      <div className="svt-empty-icon">📦</div>
                      <div className="svt-empty-text">暂时无数据</div>
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
