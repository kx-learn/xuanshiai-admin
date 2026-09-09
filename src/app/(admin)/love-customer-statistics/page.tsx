"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";

const tabs = ["客户跟进统计", "客户意向统计", "客户来源统计", "客源状态统计", "客户增量统计", "客源分派统计", "推广红娘获客统计"];
const statusLabels: Record<string, string> = {
  NEW: "待联系",
  CONTACTED: "已联系",
  INTENDED: "有意向",
  CONVERTED: "已入库",
  LOST: "已弃海",
  CLOSED: "已关闭",
};
const followColumns = ["红娘", "名下客源", "从未跟进", "超3天未跟进", "超7天未跟进", "超15天未跟进", "超30天未跟进", "跟进总条数", "本月跟进条数"];
const daysSince = (date: string) => Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000));
const intentLabels = ["待联系", "已联系", "有意向", "已入库", "已弃海"];

export default function Page() {
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({ total: 0, new_count: 0, contacted_count: 0, intended_count: 0, converted_count: 0, lost_count: 0 });
  const [leads, setLeads] = useState<Array<{ id: number; source: string; status: string; matchmaker_id: number | null; created_at: string; next_follow_at: string | null }>>([]);
  const [message, setMessage] = useState("");
  const [promoterFilter, setPromoterFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  useEffect(() => {
    void (async () => {
      try {
        const [summary, page] = await Promise.all([
          adminEndpoints.customerLeadStatistics(),
          adminEndpoints.customerLeads({ page: 1, page_size: 100 }),
        ]);
        setStats(summary as typeof stats);
        setLeads((page as { items: typeof leads }).items);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "加载失败");
      }
    })();
  }, []);

  const filterByDate = (items: typeof leads) => {
    if (!fromDate && !toDate) return items;
    const fromTs = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : -Infinity;
    const toTs = toDate ? new Date(`${toDate}T23:59:59`).getTime() : Infinity;
    return items.filter((lead) => {
      const ts = new Date(lead.created_at).getTime();
      return ts >= fromTs && ts <= toTs;
    });
  };
  const dateFilteredLeads = filterByDate(leads);

  const intentValues = [stats.new_count, stats.contacted_count, stats.intended_count, stats.converted_count, stats.lost_count];
  const sourceRows = Array.from(new Set(dateFilteredLeads.map((lead) => lead.source).filter(Boolean)));
  const sourceValues = sourceRows.map((source) => dateFilteredLeads.filter((lead) => lead.source === source).length);
  const statusRows = Array.from(new Set(dateFilteredLeads.map((lead) => lead.status).filter(Boolean)));
  const statusValues = statusRows.map((status) => dateFilteredLeads.filter((lead) => lead.status === status).length);

  // 客户跟进统计：按红娘聚合真实客源数据
  const redniangMap = new Map<number | null, { count: number; never: number; d3: number; d7: number; d15: number; d30: number }>();
  dateFilteredLeads.forEach((lead) => {
    const key = lead.matchmaker_id;
    const item = redniangMap.get(key) || { count: 0, never: 0, d3: 0, d7: 0, d15: 0, d30: 0 };
    item.count += 1;
    const days = daysSince(lead.created_at);
    if (!lead.next_follow_at) {
      item.never += 1;
      if (days > 3) item.d3 += 1;
      if (days > 7) item.d7 += 1;
      if (days > 15) item.d15 += 1;
      if (days > 30) item.d30 += 1;
    }
    redniangMap.set(key, item);
  });

  return (
    <div className="customer-statistics-page">
      <AdminBreadcrumb items={getBreadcrumb("客源线索", "数据报表")} />
      <section className="mb-5 rounded border border-[#cdd8ff] bg-[#f4f6ff] px-5 py-4 text-sm leading-6 text-[#46516b]">
        <h2 className="mb-1 font-semibold text-[#26324a]">💡 须知</h2>
        <p>为您统计了线索库中运营人员（推广红娘）的获客、销售红娘跟进、分派、客户意向等数据</p>
      </section>
      <section className="admin-card overflow-hidden px-5 pt-3">
        <div className="statistics-tabs flex items-center gap-8 border-b">
          {tabs.map((tab, index) => <button key={tab} type="button" className={activeTab === index ? "active" : ""} onClick={() => setActiveTab(index)}>{tab}</button>)}
        </div>
        {(activeTab === 2 || activeTab === 4 || activeTab === 5) && <DateFilter fromValue={fromDate} toValue={toDate} onFromChange={setFromDate} onToChange={setToDate} />}
        {activeTab === 6 && <div className="statistics-filter-row"><input placeholder="推广红娘" value={promoterFilter} onChange={(event) => setPromoterFilter(event.target.value)} /><DateFilter fromValue={fromDate} toValue={toDate} onFromChange={setFromDate} onToChange={setToDate} /></div>}
        <div className="overflow-x-auto pt-5">
          {activeTab === 1 || activeTab === 2 || activeTab === 3 ? <div className="py-3">
            {activeTab === 1 && <ReportTable headers={["客户意向", "客源数量", "占比"]} labels={intentLabels} values={intentValues} />}
            {activeTab === 2 && <ReportTable headers={["来源", "客源数量", "占比"]} labels={sourceRows} values={sourceValues} />}
            {activeTab === 3 && <ReportTable headers={["状态", "客源数量", "占比"]} labels={statusRows.map((s) => statusLabels[s] || s)} values={statusValues} />}
          </div> : activeTab === 4 ? <EmptyReport /> : activeTab === 5 ? <ReportTable headers={["分派给", "新分派客源", "操作"]} labels={[]} actions /> : activeTab === 6 ? <ReportTable headers={["推广红娘", "录入客源总数", "男客源", "女客源", "有效（男客源）", "有效（女客源）", "待审", "无效"]} labels={[]} plain /> : <table className="w-full min-w-[1100px] table-fixed text-sm">
            <thead className="bg-[#fafafa] text-[#222]"><tr>{followColumns.map((column) => <th key={column} className="border-b px-3 py-3 text-left font-semibold">{column}</th>)}</tr></thead>
            <tbody>
              {leads.length === 0 ? <tr><td colSpan={followColumns.length} className="h-40 text-center text-[#999]">暂无数据</td></tr> : (
                Array.from(redniangMap.entries()).map(([matchmakerId, item]) => (
                  <tr key={matchmakerId} className="border-b">
                    <td className="px-3 py-3">{matchmakerId ? `红娘 #${matchmakerId}` : "未分派"}</td>
                    <td className="px-3 py-3 text-center">{item.count}</td>
                    <td className="px-3 py-3 text-center">{item.never}</td>
                    <td className="px-3 py-3 text-center">{item.d3}</td>
                    <td className="px-3 py-3 text-center">{item.d7}</td>
                    <td className="px-3 py-3 text-center">{item.d15}</td>
                    <td className="px-3 py-3 text-center">{item.d30}</td>
                    <td className="px-3 py-3 text-center">-</td>
                    <td className="px-3 py-3 text-center">-</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>}{message && <p className="mt-3 text-sm text-red-600">{message}</p>}
        </div>
      </section>
    </div>
  );
}

function EmptyReport() { return <div className="flex h-40 items-center justify-center text-sm text-[#999]">暂无数据</div>; }

function DateFilter({ fromValue, toValue, onFromChange, onToChange }: { fromValue: string; toValue: string; onFromChange: (v: string) => void; onToChange: (v: string) => void }) {
  return <div className="statistics-date-filter date-range-picker"><span className="dr-field">{!fromValue && <span className="dr-placeholder">开始日期</span>}<input aria-label="开始日期" type="date" value={fromValue} onChange={(event) => onFromChange(event.target.value)} /></span><span aria-hidden className="dr-arrow">→</span><span className="dr-field">{!toValue && <span className="dr-placeholder">结束日期</span>}<input aria-label="结束日期" type="date" value={toValue} onChange={(event) => onToChange(event.target.value)} /></span><CalendarDays size={16} /></div>;
}

function ReportTable({ headers, labels, values = [], actions = false, plain = false }: { headers: string[]; labels: string[]; values?: number[]; actions?: boolean; plain?: boolean }) {
  const total = values.reduce((sum, value) => sum + value, 0);
  return <table className="w-full table-fixed text-sm"><thead className="bg-[#fafafa]"><tr>{headers.map((header) => <th key={header} className="border-b px-3 py-3 text-left font-semibold">{header}</th>)}</tr></thead><tbody>{labels.length === 0 ? <tr><td colSpan={headers.length} className="h-40 text-center text-[#999]">暂无数据</td></tr> : labels.map((label, index) => { const value = values[index] ?? 0; return <tr key={label} className="border-b"><td className="px-3 py-3">{label}</td>{headers.slice(1).map((header) => <td key={header} className="px-3 py-3">{actions && header === "操作" ? <span className="text-[#3658f7]">查看明细</span> : plain ? "-" : header === "占比" ? `${total ? ((value / total) * 100).toFixed(2) : "0.00"}%` : `${value}条`}</td>)}</tr>;})}</tbody></table>;
}
