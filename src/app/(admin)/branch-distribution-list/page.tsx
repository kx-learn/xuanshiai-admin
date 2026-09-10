"use client";

import { Download } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("分店管理", "分成明细");

const STATS = [
  { value: "0", label: "累计分得" },
  { value: "0", label: "本月分成" },
  { value: "0", label: "上月分成" },
  { value: "0", label: "待结算余额" },
];

const columns = ["ID", "时间", "分店名称", "红娘", "消费会员", "分成/奖励事件", "消费金额", "分成金额"];

export default function BranchDistributionListPage() {
  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 4 统计卡片 */}
      <div className="bd-stats-row">
        <div className="bd-stat bd-stat-special">
          <div className="bd-stat-header">
            <span className="bd-stat-special-icon">🏪</span>
            <span className="bd-stat-special-text">暂无门店</span>
          </div>
          <button className="bd-stat-switch-btn">切换分店</button>
        </div>
        {STATS.map((s, idx) => (
          <div className="bd-stat" key={idx}>
            <div className="bd-stat-value">¥<span className="bd-stat-num">{s.value}</span></div>
            <div className="bd-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>以下报表是分店名下的会员在平台中产生的线上成功支付记录，并根据平台与每个分店设置的分成标准生成并统计出相应的分成信息</p>
            <p>分店名下的会员在线上平台中支付的的费用都是统一进入到平台总的微信商户账号中，平台根据与分店达成的分成标准进行分成</p>
            <p>分店的分成金额 实时计入到对应分店店长的账户余额中，店长可实时到平台中申请提现和提现，平台将及时向申请提现的金额进行结算处理</p>
          </div>
        </div>
      </div>

      <div className="finord-card bd-card">
        <div className="bd-head">
          <h2 className="bd-title">线上分成明细</h2>
          <button className="finord-btn finord-btn-primary bd-export-btn"><Download size={14} /> 导出Excel（当前分店）</button>
        </div>

        <div className="bd-filters">
          <select className="bd-select"><option>请选择红娘</option></select>
          <select className="bd-select"><option>请选择事件</option></select>
          <div className="bd-daterange">
            <span className="bd-text-muted">开始日期</span>
            <input className="bd-date" type="date" />
            <span className="bd-text-muted">→</span>
            <span className="bd-text-muted">结束日期</span>
            <input className="bd-date" type="date" />
          </div>
          <button className="finord-btn finord-btn-primary bd-search-btn">搜索</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table bd-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="bd-empty">
                  <div className="bd-empty-inner">
                    <div className="bd-empty-icon">📦</div>
                    <div className="bd-empty-text">暂无数据</div>
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