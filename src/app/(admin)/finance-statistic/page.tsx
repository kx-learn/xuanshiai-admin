"use client";
import { useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const TAB_GROUPS = [
  ["全部", "积分充值", "兑换礼物", "余额充值", "男会员审核", "女会员审核", "VIP会员", "会员置顶", "单次牵线", "牵线套餐", "资料推广", "送礼物", "会员爆灯", "活动报名"],
  ["短视频打赏", "短视频红包", "社群缴费", "推广红娘入伙费", "合伙红娘入伙费", "商品销售", "互选活动报名", "婚况查询费", "实名认证费", "线上收款"],
];

// 2026-09-09 倒序到 2026-08-26，共 15 天，全部为 0
const rows = [
  { date: "2026-09-09" }, { date: "2026-09-08" }, { date: "2026-09-07" }, { date: "2026-09-06" },
  { date: "2026-09-05" }, { date: "2026-09-04" }, { date: "2026-09-03" }, { date: "2026-09-02" },
  { date: "2026-09-01" }, { date: "2026-08-31" }, { date: "2026-08-30" }, { date: "2026-08-29" },
  { date: "2026-08-28" }, { date: "2026-08-27" }, { date: "2026-08-26" },
];

const PERIODS = ["日榜", "月榜", "年榜"];

export default function FinanceStatisticPage() {
  const [activeTab, setActiveTab] = useState("全部");
  const [period, setPeriod] = useState("日榜");
  const breadcrumb = getBreadcrumb("财务管理", "统计报表");

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card">
        {/* 分类 tab */}
        <div className="finord-tabs">
          {TAB_GROUPS.map((group, gi) => (
            <div className={`finord-tab-row ${gi > 0 ? "finord-tab-row-gap" : ""}`} key={gi}>
              {group.map((tab) => (
                <button
                  key={tab}
                  className={`finord-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="crh-head">
          <div className="crh-title">统计报表</div>
        </div>

        {/* 统计时间 */}
        <div className="fs-timeselect">
          <span className="fs-label">统计时间:</span>
          <div className="fs-radios">
            {PERIODS.map((p) => (
              <label key={p} className={`fs-radio ${period === p ? "active" : ""}`}>
                <input type="radio" name="fs-period" checked={period === p} onChange={() => setPeriod(p)} />
                <span>{p}</span>
              </label>
            ))}
          </div>
          <div className="fs-daterange">
            <input className="finord-date" type="date" defaultValue="2026-08-09" />
            <span className="finord-date-sep">→</span>
            <input className="finord-date" type="date" defaultValue="2026-09-09" />
            <span className="fs-cal">▦</span>
          </div>
        </div>

        {/* 表格 */}
        <div className="finord-table-wrap">
          <table className="finord-table fs-table">
            <thead>
              <tr>
                <th className="fs-th-time">时间</th>
                <th className="fs-th-center">成功付款笔数</th>
                <th className="fs-th-center">收入金额</th>
                <th className="fs-th-center">已退款</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.date}>
                  <td className="fs-td-time">{r.date}</td>
                  <td className="fs-td-center fs-red">0笔</td>
                  <td className="fs-td-center fs-red">0元</td>
                  <td className="fs-td-center fs-red">0元, 0笔</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
