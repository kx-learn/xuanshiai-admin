"use client";

import { useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import DateRangePicker from "@/components/DateRangePicker";
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
  const [leads, setLeads] = useState<Array<{ id: number; source: string; status: string; matchmaker_id: number | null; promoter_id?: number | null; created_at: string; next_follow_at: string | null }>>([]);
  const [message, setMessage] = useState("");
  const [promoterFilter, setPromoterFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  useEffect(() => {
    void (async () => {
      try {
        const [summary, firstPage] = await Promise.all([
          adminEndpoints.customerLeadStatistics(),
          adminEndpoints.customerLeads({ page: 1, page_size: 100 }),
        ]);
        setStats(summary as typeof stats);
        const first = firstPage as { items: typeof leads; total: number; page_size: number };
        const pages = Math.max(1, Math.ceil(first.total / first.page_size));
        const rest = await Promise.all(
          Array.from({ length: pages - 1 }, (_, index) =>
            adminEndpoints.customerLeads({ page: index + 2, page_size: first.page_size }),
          ),
        );
        setLeads([
          ...first.items,
          ...rest.flatMap((result) => (result as { items: typeof leads }).items),
        ]);
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

  // 客户增量统计：按录入日期聚合，给出每天新增与累计
  const incrementMap = new Map<string, number>();
  dateFilteredLeads.forEach((lead) => {
    const day = (lead.created_at || "").slice(0, 10);
    if (!day) return;
    incrementMap.set(day, (incrementMap.get(day) ?? 0) + 1);
  });
  const incrementDays = [...incrementMap.keys()].sort();
  let runningTotal = 0;
  const incrementCumulative = incrementDays.map((day) => {
    runningTotal += incrementMap.get(day) ?? 0;
    return runningTotal;
  });
  const incrementValues = incrementDays.map((day) => incrementMap.get(day) ?? 0);

  // 客源分派统计：按服务红娘聚合分派量与其中已入库（转化成功）数量
  const assignMap = new Map<number | null, { total: number; converted: number }>();
  dateFilteredLeads.forEach((lead) => {
    if (!lead.matchmaker_id) return;
    const item = assignMap.get(lead.matchmaker_id) ?? { total: 0, converted: 0 };
    item.total += 1;
    if (lead.status === "CONVERTED") item.converted += 1;
    assignMap.set(lead.matchmaker_id, item);
  });
  const assignRows = [...assignMap.entries()].sort((a, b) => b[1].total - a[1].total);

  // 推广红娘获客统计：按 promoter_id 聚合录入量与状态分布
  const promoterMap = new Map<number, { total: number; converted: number; lost: number; active: number }>();
  dateFilteredLeads.forEach((lead) => {
    if (!lead.promoter_id) return;
    const item = promoterMap.get(lead.promoter_id) ?? { total: 0, converted: 0, lost: 0, active: 0 };
    item.total += 1;
    if (lead.status === "CONVERTED") item.converted += 1;
    else if (lead.status === "LOST") item.lost += 1;
    else item.active += 1;
    promoterMap.set(lead.promoter_id, item);
  });
  const promoterRows = [...promoterMap.entries()]
    .filter(([id]) => !promoterFilter || String(id).includes(promoterFilter.trim()))
    .sort((a, b) => b[1].total - a[1].total);

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
          </div> : activeTab === 4 ? <IncrementReport days={incrementDays} values={incrementValues} cumulative={incrementCumulative} /> : activeTab === 5 ? <AssignReport rows={assignRows} />
              : activeTab === 6 ? <PromoterReport rows={promoterRows} /> : <table className="w-full min-w-[1100px] table-fixed text-sm">
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

/** 客源分派统计：按服务红娘列出分派量、已入库数与转化率。 */
function AssignReport({ rows }: { rows: [number | null, { total: number; converted: number }][] }) {
  if (rows.length === 0) return <EmptyReport />;
  return (
    <table className="w-full table-fixed text-sm">
      <thead className="bg-[#fafafa]">
        <tr>{["分派给", "新分派客源", "已入库", "转化率"].map((header) => <th key={header} className="border-b px-3 py-3 text-left font-semibold">{header}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map(([id, item]) => (
          <tr key={String(id)} className="border-b">
            <td className="px-3 py-3">红娘 #{id}</td>
            <td className="px-3 py-3">{item.total}条</td>
            <td className="px-3 py-3">{item.converted}条</td>
            <td className="px-3 py-3">{item.total ? `${((item.converted / item.total) * 100).toFixed(2)}%` : "0.00%"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** 推广红娘获客统计：按推广红娘列出录入量与其状态分布。 */
function PromoterReport({ rows }: { rows: [number, { total: number; converted: number; lost: number; active: number }][] }) {
  if (rows.length === 0) return <EmptyReport />;
  return (
    <table className="w-full table-fixed text-sm">
      <thead className="bg-[#fafafa]">
        <tr>{["推广红娘", "录入客源总数", "进行中", "已入库", "已弃海", "入库率"].map((header) => <th key={header} className="border-b px-3 py-3 text-left font-semibold">{header}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map(([id, item]) => (
          <tr key={id} className="border-b">
            <td className="px-3 py-3">推广红娘 #{id}</td>
            <td className="px-3 py-3">{item.total}条</td>
            <td className="px-3 py-3">{item.active}条</td>
            <td className="px-3 py-3">{item.converted}条</td>
            <td className="px-3 py-3">{item.lost}条</td>
            <td className="px-3 py-3">{item.total ? `${((item.converted / item.total) * 100).toFixed(2)}%` : "0.00%"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** 客户增量统计：按录入日期逐日列出新增量与累计量。 */function IncrementReport({ days, values, cumulative }: { days: string[]; values: number[]; cumulative: number[] }) {
  if (days.length === 0) return <EmptyReport />;
  const total = values.reduce((sum, value) => sum + value, 0);
  return (
    <>
      <div className="py-2 text-xs text-[#8c8c8c]">
        区间内新增 {total} 条，覆盖 {days.length} 天
      </div>
      <table className="w-full table-fixed text-sm">
        <thead className="bg-[#fafafa]">
          <tr>{["日期", "新增客源", "累计客源"].map((header) => <th key={header} className="border-b px-3 py-3 text-left font-semibold">{header}</th>)}</tr>
        </thead>
        <tbody>
          {days.map((day, index) => (
            <tr key={day} className="border-b">
              <td className="px-3 py-3">{day}</td>
              <td className="px-3 py-3">{values[index] ?? 0}条</td>
              <td className="px-3 py-3">{cumulative[index] ?? 0}条</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function DateFilter({ fromValue, toValue, onFromChange, onToChange }: { fromValue: string; toValue: string; onFromChange: (v: string) => void; onToChange: (v: string) => void }) {
  return <DateRangePicker startValue={fromValue} endValue={toValue} onStartChange={onFromChange} onEndChange={onToChange} />;
}

function ReportTable({ headers, labels, values = [], actions = false, plain = false }: { headers: string[]; labels: string[]; values?: number[]; actions?: boolean; plain?: boolean }) {
  const total = values.reduce((sum, value) => sum + value, 0);
  return <table className="w-full table-fixed text-sm"><thead className="bg-[#fafafa]"><tr>{headers.map((header) => <th key={header} className="border-b px-3 py-3 text-left font-semibold">{header}</th>)}</tr></thead><tbody>{labels.length === 0 ? <tr><td colSpan={headers.length} className="h-40 text-center text-[#999]">暂无数据</td></tr> : labels.map((label, index) => { const value = values[index] ?? 0; return <tr key={label} className="border-b"><td className="px-3 py-3">{label}</td>{headers.slice(1).map((header) => <td key={header} className="px-3 py-3">{actions && header === "操作" ? <span className="text-[#3658f7]">查看明细</span> : plain ? "-" : header === "占比" ? `${total ? ((value / total) * 100).toFixed(2) : "0.00"}%` : `${value}条`}</td>)}</tr>;})}</tbody></table>;
}
