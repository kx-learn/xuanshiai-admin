"use client";

import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("分店管理", "分店报表");

const STATS = [
  { value: "暂无门店", unit: "", sub: "切换分店", special: true },
  { value: "0", unit: "份", label: "客源线索" },
  { value: "0", unit: "人", label: "会员资料" },
  { value: "0", unit: "次", label: "成功线上牵线" },
  { value: "0", unit: "人", label: "线上VIP" },
  { value: "0", unit: "次", label: "线下VIP" },
  { value: "0", unit: "元", label: "成功安排见面", rank: "0" },
  { value: "0", unit: "元", label: "线上分成", rank: "0" },
  { value: "0", unit: "元", label: "线下业绩", rank: "0" },
];

const columns = ["月份", "新增男会员", "新增女会员", "新增客源线索", "新增线上VIP会员", "新增牵线申请", "新增线下约会", "新增线下VIP会员", "线上分成", "线下业绩"];

export default function BranchReportListPage() {
  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>以下是根据当前分店下所有红娘名下的客源、会员所统计的数据</p>
          </div>
        </div>
      </div>

      {/* 9 个统计卡片 */}
      <div className="br-stats-row">
        {STATS.map((s, idx) => (
          <div className={`br-stat ${s.special ? "br-stat-special" : ""}`} key={idx}>
            {s.rank && <div className="br-stat-rank">排名 {s.rank}</div>}
            <div className="br-stat-value">{s.value}<span className="br-stat-unit">{s.unit}</span></div>
            {s.special ? (
              <div className="br-stat-special-link">切换分店</div>
            ) : (
              <div className="br-stat-label">{s.label}</div>
            )}
          </div>
        ))}
      </div>

      <div className="finord-card br-card">
        <div className="finord-table-wrap">
          <table className="finord-table br-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="br-empty">
                  <div className="br-empty-inner">
                    <div className="br-empty-icon">📦</div>
                    <div className="br-empty-text">暂无数据</div>
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