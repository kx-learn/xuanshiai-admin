"use client";

import { useCallback, useEffect, useState } from "react";
import { Download } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { StoreCommissionEntryItem, StoreCommissionOptions, StoreCommissionSummary } from "@/lib/admin-endpoints";

const breadcrumb = getBreadcrumb("分店管理", "分成明细");

const EMPTY_SUMMARY: StoreCommissionSummary = {
  total_amount: "0.00",
  current_month_amount: "0.00",
  previous_month_amount: "0.00",
  pending_amount: "0.00",
};

const fmt = (value: string | null) => (value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "-");

const columns = ["ID", "时间", "分店名称", "红娘", "消费会员", "分成/奖励事件", "消费金额", "分成金额"];

export default function BranchDistributionListPage() {
  const [options, setOptions] = useState<StoreCommissionOptions>({ stores: [], matchmakers: [], events: [] });
  const [summary, setSummary] = useState<StoreCommissionSummary>(EMPTY_SUMMARY);
  const [rows, setRows] = useState<StoreCommissionEntryItem[]>([]);
  const [storeId, setStoreId] = useState("");
  const [matchmakerId, setMatchmakerId] = useState("");
  const [ruleId, setRuleId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [applied, setApplied] = useState({ storeId: "", matchmakerId: "", ruleId: "", fromDate: "", toDate: "" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [message, setMessage] = useState("");

  const currentStore = options.stores.find((s) => String(s.id) === applied.storeId) ?? null;

  useEffect(() => {
    adminEndpoints.storeCommissionOptions()
      .then(setOptions)
      .catch((error) => setMessage(error instanceof Error ? error.message : "筛选项加载失败"));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = {
        page,
        page_size: pageSize,
        store_id: applied.storeId ? Number(applied.storeId) : undefined,
        matchmaker_id: applied.matchmakerId ? Number(applied.matchmakerId) : undefined,
        rule_id: applied.ruleId ? Number(applied.ruleId) : undefined,
        start_date: applied.fromDate || undefined,
        end_date: applied.toDate || undefined,
      };
      const [list, sum] = await Promise.all([
        adminEndpoints.storeCommissionEntries(query),
        adminEndpoints.storeCommissionSummary(query.store_id),
      ]);
      setRows(list.items);
      setTotal(list.total);
      setSummary(sum);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, applied]);

  useEffect(() => { void load(); }, [load]);

  const search = () => {
    setPage(1);
    setApplied({ storeId, matchmakerId, ruleId, fromDate, toDate });
  };

  const exportExcel = async () => {
    try {
      await adminEndpoints.exportStoreCommissionEntries({
        store_id: applied.storeId ? Number(applied.storeId) : undefined,
        matchmaker_id: applied.matchmakerId ? Number(applied.matchmakerId) : undefined,
        rule_id: applied.ruleId ? Number(applied.ruleId) : undefined,
        start_date: applied.fromDate || undefined,
        end_date: applied.toDate || undefined,
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "导出失败");
    }
  };

  const STATS = [
    { value: summary.total_amount, label: "累计分得" },
    { value: summary.current_month_amount, label: "本月分成" },
    { value: summary.previous_month_amount, label: "上月分成" },
    { value: summary.pending_amount, label: "待结算余额" },
  ];

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 4 统计卡片 */}
      <div className="bd-stats-row">
        <div className="bd-stat bd-stat-special">
          <div className="bd-stat-header">
            <span className="bd-stat-special-icon">🏪</span>
            <span className="bd-stat-special-text">{currentStore ? currentStore.name : "全部分店"}</span>
          </div>
          <button className="bd-stat-switch-btn" onClick={() => setPickerOpen(true)}>切换分店</button>
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
          <button className="finord-btn finord-btn-primary bd-export-btn" onClick={() => void exportExcel()}>
            <Download size={14} /> 导出Excel（当前分店）
          </button>
        </div>

        <div className="bd-filters">
          <select className="bd-select" value={matchmakerId} onChange={(e) => setMatchmakerId(e.target.value)}>
            <option value="">请选择红娘</option>
            {options.matchmakers.map((m) => (
              <option key={m.id} value={String(m.id)}>{m.name}</option>
            ))}
          </select>
          <select className="bd-select" value={ruleId} onChange={(e) => setRuleId(e.target.value)}>
            <option value="">请选择事件</option>
            {options.events.map((ev) => (
              <option key={ev.id} value={String(ev.id)}>{ev.name}</option>
            ))}
          </select>
          <div className="bd-daterange">
            <span className="bd-text-muted">开始日期</span>
            <input className="bd-date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            <span className="bd-text-muted">→</span>
            <span className="bd-text-muted">结束日期</span>
            <input className="bd-date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <button className="finord-btn finord-btn-primary bd-search-btn" onClick={search}>搜索</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table bd-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{fmt(row.created_at)}</td>
                  <td>{row.store_name}</td>
                  <td>{row.matchmaker_name || "-"}</td>
                  <td>{row.consumer_name || "-"}</td>
                  <td>{row.event_name}</td>
                  <td>¥{row.consumer_amount}</td>
                  <td>¥{row.commission_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="bd-empty" style={{ display: "block" }}>
              <div className="bd-empty-inner">
                <div className="bd-empty-icon">📦</div>
                <div className="bd-empty-text">{loading ? "加载中…" : "暂无数据"}</div>
              </div>
            </div>
          )}
        </div>
        <AdminPagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        />
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
              <button
                type="button"
                className="finord-btn"
                style={{
                  display: "block", width: "100%", textAlign: "left", marginBottom: 8,
                  background: !applied.storeId ? "#eef4ff" : "#fff",
                  border: `1px solid ${!applied.storeId ? "#3658f7" : "#d9dde6"}`,
                  color: !applied.storeId ? "#3658f7" : "#545a69",
                }}
                onClick={() => { setStoreId(""); setApplied((prev) => ({ ...prev, storeId: "" })); setPage(1); setPickerOpen(false); }}
              >
                全部分店
              </button>
              {options.stores.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="finord-btn"
                  style={{
                    display: "block", width: "100%", textAlign: "left", marginBottom: 8,
                    background: String(s.id) === applied.storeId ? "#eef4ff" : "#fff",
                    border: `1px solid ${String(s.id) === applied.storeId ? "#3658f7" : "#d9dde6"}`,
                    color: String(s.id) === applied.storeId ? "#3658f7" : "#545a69",
                  }}
                  onClick={() => { setStoreId(String(s.id)); setApplied((prev) => ({ ...prev, storeId: String(s.id) })); setPage(1); setPickerOpen(false); }}
                >
                  {s.name}{s.status !== 1 ? `（${s.status === 2 ? "已关闭" : "已停用"}）` : ""}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
