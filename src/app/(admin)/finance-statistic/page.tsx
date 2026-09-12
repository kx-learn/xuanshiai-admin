"use client";
import { useCallback, useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";

const TAB_GROUPS = [
  ["全部", "积分充值", "兑换礼物", "余额充值", "男会员审核", "女会员审核", "VIP会员", "会员置顶", "单次牵线", "牵线套餐", "资料推广", "送礼物", "会员爆灯", "活动报名"],
  ["短视频打赏", "短视频红包", "社群缴费", "推广红娘入伙费", "合伙红娘入伙费", "商品销售", "互选活动报名", "婚况查询费", "实名认证费", "线上收款"],
];

const PERIODS = ["日榜", "月榜", "年榜"];

type DailyRow = {
  date: string;
  paid_count: number;
  paid_amount: string;
  refunded_count: number;
  refunded_amount: string;
};

export default function FinanceStatisticPage() {
  const [activeTab, setActiveTab] = useState("全部");
  const [period, setPeriod] = useState("日榜");
  const [startDate, setStartDate] = useState("2026-08-26");
  const [endDate, setEndDate] = useState("2026-09-09");
  const [rows, setRows] = useState<DailyRow[]>([]);
  const [loading, setLoading] = useState(false);

  const breadcrumb = getBreadcrumb("财务管理", "统计报表");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminEndpoints.financeDailyReport({
        start_date: startDate,
        end_date: endDate,
      });
      const list = (Array.isArray(data) ? data : []) as unknown[];
      setRows(
        list.map((r, i) => {
          const o = r as Record<string, unknown>;
          return {
            date: String(o.date ?? ""),
            paid_count: Number(o.paid_count ?? 0),
            paid_amount: String(o.paid_amount ?? "0.00"),
            refunded_count: Number(o.refunded_count ?? 0),
            refunded_amount: String(o.refunded_amount ?? "0.00"),
          };
        }),
      );
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card">
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

        <div className="fs-timeselect">
          <span className="fs-label">统计时间:</span>
          <div className="fs-radios">
            {PERIODS.map((p) => (
              <label key={p} className={`fs-radio ${period === p ? "active" : ""}`}>
                <input
                  type="radio"
                  name="fs-period"
                  checked={period === p}
                  onChange={() => setPeriod(p)}
                />
                <span>{p}</span>
              </label>
            ))}
          </div>
          <div className="fs-daterange">
            <input
              className="finord-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="finord-date-sep">→</span>
            <input
              className="finord-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <span className="fs-cal">▦</span>
            <button className="finord-btn finord-btn-primary" onClick={load} disabled={loading}>
              {loading ? "加载中..." : "查询"}
            </button>
          </div>
        </div>

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
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "32px 0", color: "#999" }}>
                    {loading ? "加载中..." : "暂无数据"}
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.date}>
                    <td className="fs-td-time">{r.date}</td>
                    <td className="fs-td-center fs-red">{r.paid_count}笔</td>
                    <td className="fs-td-center fs-red">{r.paid_amount}元</td>
                    <td className="fs-td-center fs-red">{r.refunded_amount}元, {r.refunded_count}笔</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
