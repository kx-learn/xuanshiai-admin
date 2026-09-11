"use client";

import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

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

export default function ShortVideoTipPage() {
  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card svt-card">
        <div className="svt-head">
          <h2 className="svt-title">打赏管理</h2>
          <div className="svt-total">共收到打赏：<span className="svt-total-num">0元</span></div>
        </div>

        <div className="svt-filters">
          <select className="svt-select"><option>按标题搜</option></select>
          <input className="svt-input" placeholder="请输入" />
          <button className="finord-btn finord-btn-primary svt-search-btn">搜索</button>
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
              <tr>
                <td colSpan={columns.length + 1} className="svt-empty">
                  <div className="svt-empty-inner">
                    <div className="svt-empty-icon">📦</div>
                    <div className="svt-empty-text">暂时无数据</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}