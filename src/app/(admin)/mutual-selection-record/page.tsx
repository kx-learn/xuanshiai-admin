"use client";

import { useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("活动报名", "互选记录");

const columns = ["时间", "行为方", "行为动作", "行为对象", "活动名称", "互选结果"];

export default function MutualSelectionRecordPage() {
  const [status, setStatus] = useState("不选");
  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>在这里记录了所有活动参与者「选择心动嘉宾」的历史记录，可以让红娘掌握客户的心动意向，为精准服务和跟进提供重要参考；</p>
            <p>活动结束之后，若互选都选择了对方心动嘉宾，则被视为「互选成功」，可自行添加对方微信或者由红娘介入互推微信名片。</p>
          </div>
        </div>
      </div>

      <div className="finord-card mr-card">
        <div className="mr-title">互选记录</div>

        <div className="mr-filters">
          <select className="mr-select"><option>按活动筛选</option></select>
          <select className="mr-select"><option>按行为方</option></select>
          <input className="mr-input" placeholder="输入会员昵称/编号/姓名" />
          <button className="finord-btn finord-btn-primary mr-search-btn">搜索</button>
          <div className="mr-status">
            <span className="mr-status-label">状态：</span>
            {["不选", "未成功", "已成功"].map((o) => (
              <label key={o} className={`mr-radio ${status === o ? "active" : ""}`}>
                <input type="radio" name="status" value={o} checked={status === o} onChange={() => setStatus(o)} />
                <span>{o}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table mr-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="mr-empty">
                  <div className="mr-empty-inner">
                    <div className="mr-empty-icon">📦</div>
                    <div className="mr-empty-text">暂无数据</div>
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