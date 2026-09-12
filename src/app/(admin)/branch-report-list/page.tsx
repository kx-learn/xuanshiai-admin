"use client";

import { useCallback, useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { StoreAdminItem, StoreReportMonthly, StoreReportSummary } from "@/lib/admin-endpoints";

const breadcrumb = getBreadcrumb("分店管理", "分店报表");

type StatCell = { value: string; unit: string; label?: string; rank?: string; special?: boolean };

const columns = ["月份", "新增男会员", "新增女会员", "新增客源线索", "新增线上VIP会员", "新增牵线申请", "新增线下约会", "新增线下VIP会员", "线上分成", "线下业绩"];

const EMPTY_SUMMARY: StoreReportSummary = {
  store_id: 0,
  store_name: null,
  lead_count: 0,
  member_count: 0,
  online_match_count: 0,
  online_vip_count: 0,
  offline_vip_count: 0,
  meeting_arranged_count: 0,
  online_commission: "0.00",
  offline_performance: "0.00",
  meeting_rank: null,
  online_commission_rank: null,
  offline_performance_rank: null,
};

export default function BranchReportListPage() {
  const [stores, setStores] = useState<StoreAdminItem[]>([]);
  const [current, setCurrent] = useState<StoreAdminItem | null>(null);
  const [summary, setSummary] = useState<StoreReportSummary>(EMPTY_SUMMARY);
  const [monthly, setMonthly] = useState<StoreReportMonthly | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const result = await adminEndpoints.storeList({ page: 1, page_size: 100 });
        setStores(result.items);
        setCurrent(result.items[0] ?? null);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "门店列表加载失败");
        setLoading(false);
      }
    })();
  }, []);

  const load = useCallback(async (store: StoreAdminItem | null) => {
    if (!store) {
      setSummary(EMPTY_SUMMARY);
      setMonthly(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [sum, mon] = await Promise.all([
        adminEndpoints.storeReportSummary(store.id),
        adminEndpoints.storeReportMonthly(store.id, 6),
      ]);
      setSummary(sum);
      setMonthly(mon);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "报表加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(current); }, [current, load]);

  const STATS: StatCell[] = [
    { value: current ? (current.display_name || current.name) : "暂无门店", unit: "", special: true },
    { value: String(summary.lead_count), unit: "份", label: "客源线索" },
    { value: String(summary.member_count), unit: "人", label: "会员资料" },
    { value: String(summary.online_match_count), unit: "次", label: "成功线上牵线" },
    { value: String(summary.online_vip_count), unit: "人", label: "线上VIP" },
    { value: String(summary.offline_vip_count), unit: "次", label: "线下VIP" },
    { value: String(summary.meeting_arranged_count), unit: "元", label: "成功安排见面", rank: summary.meeting_rank ? String(summary.meeting_rank) : "0" },
    { value: summary.online_commission, unit: "元", label: "线上分成", rank: summary.online_commission_rank ? String(summary.online_commission_rank) : "0" },
    { value: summary.offline_performance, unit: "元", label: "线下业绩", rank: summary.offline_performance_rank ? String(summary.offline_performance_rank) : "0" },
  ];

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
              <div className="br-stat-special-link" onClick={() => setPickerOpen(true)}>切换分店</div>
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
              {(monthly?.months ?? []).map((row) => (
                <tr key={row.month}>
                  <td>{row.month}</td>
                  <td>{row.new_male_members}</td>
                  <td>{row.new_female_members}</td>
                  <td>{row.new_leads}</td>
                  <td>{row.new_online_vip}</td>
                  <td>{row.new_match_requests}</td>
                  <td>{row.new_offline_meetings}</td>
                  <td>{row.new_offline_vip}</td>
                  <td>{row.online_commission}</td>
                  <td>{row.offline_performance}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(monthly?.months?.length ?? 0) === 0 && (
            <div className="br-empty" style={{ display: "block" }}>
              <div className="br-empty-inner">
                <div className="br-empty-icon">📦</div>
                <div className="br-empty-text">{loading ? "加载中…" : "暂无数据"}</div>
              </div>
            </div>
          )}
        </div>
        {message && <p style={{ color: "#ff4d4f", fontSize: 13, marginTop: 8 }}>{message}</p>}
      </div>

      {pickerOpen && (
        <>
          <div className="tlc-mask" onClick={() => setPickerOpen(false)} />
          <div className="tlc-panel" style={{ width: 420 }}>
            <div className="tlc-panel-head">
              <div className="tlc-panel-head-left">
                <span className="tlc-panel-title">切换分店</span>
              </div>
              <div className="bm-head-actions">
                <button className="finord-btn bm-cancel" onClick={() => setPickerOpen(false)}>关闭</button>
              </div>
            </div>
            <div className="tlc-panel-body">
              {stores.length === 0 ? (
                <p style={{ color: "#9aa3b2", fontSize: 13 }}>暂无分店</p>
              ) : stores.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="finord-btn"
                  style={{
                    display: "block", width: "100%", textAlign: "left", marginBottom: 8,
                    background: current?.id === s.id ? "#eef4ff" : "#fff",
                    border: `1px solid ${current?.id === s.id ? "#3658f7" : "#d9dde6"}`,
                    color: current?.id === s.id ? "#3658f7" : "#545a69",
                  }}
                  onClick={() => { setCurrent(s); setPickerOpen(false); }}
                >
                  {s.display_name || s.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
