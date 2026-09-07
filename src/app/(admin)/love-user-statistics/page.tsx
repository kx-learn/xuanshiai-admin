"use client";

import { useEffect, useMemo, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminEndpoints } from "@/lib/admin-endpoints";

type Value = string | number | null | undefined;
type Row = Record<string, Value>;
type Item = { label: string; value: number };
type TabKey = "growth" | "follow" | "intention" | "basic" | "requirement" | "browse" | "popularity";
type Column = { key: string; title: string; align?: "left" | "right" | "center"; render?: (row: Row) => React.ReactNode };

const tabs: { key: TabKey; label: string }[] = [
  { key: "growth", label: "会员增长统计" }, { key: "follow", label: "会员跟进统计" },
  { key: "intention", label: "会员意向统计" }, { key: "basic", label: "会员基本状况统计" },
  { key: "requirement", label: "会员择偶要求统计" }, { key: "browse", label: "浏览统计" },
  { key: "popularity", label: "人气统计" },
];
const basicTitles: Record<string, string> = {
  gender: "性别统计", marriage: "婚况统计", age: "年龄统计", education: "学历统计", house: "房产统计",
  car: "车辆统计", income: "收入统计", realname: "实名统计", occupation: "最多的职业（前5）",
  hometown: "籍贯最多的地区（前5）", residence: "现居地最多的地区（前5）", dating_status: "会员相亲状态",
};
const requirementTitles: Record<string, string> = {
  age: "年龄要求", marriage: "婚况要求", height: "身高要求", education: "学历要求", housing: "住房要求",
  smoking: "抽烟要求", drinking: "喝酒要求", goal: "结婚要求", occupation: "择偶职业（前10）",
};
const number = (value: Value) => new Intl.NumberFormat("zh-CN").format(Number(value) || 0);
const asObject = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const asItems = (value: unknown): Item[] => Array.isArray(value) ? value.map((item) => {
  const row = asObject(item);
  return { label: String(row.label ?? "未填写"), value: Number(row.value) || 0 };
}) : [];
const asRows = (value: unknown): Row[] => Array.isArray(value) ? value.map((item) => asObject(item) as Row) : [];

function defaultDates() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 14);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

function Donut({ data }: { data: Item[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = ["#3658f7", "#6f88f7", "#3bb7a2", "#efb649", "#e47d8c", "#9c8bda", "#70a7c5"];
  let offset = 0;
  const segments = data.map((item, index) => {
    const start = offset;
    offset += total ? item.value / total * 360 : 0;
    return `${colors[index % colors.length]} ${start}deg ${offset}deg`;
  });
  return <div className="flex min-h-40 items-center gap-5 px-4 py-4">
    <div className="relative grid size-32 shrink-0 place-items-center rounded-full" style={{ background: total ? `conic-gradient(${segments.join(",")})` : "#edf0f5" }}>
      <div className="grid size-20 place-items-center rounded-full bg-white text-center"><b className="text-base text-[#333]">{number(total)}</b><span className="text-xs text-[#8c8c8c]">合计</span></div>
    </div>
    <div className="grid min-w-0 flex-1 gap-x-4 gap-y-2 text-xs sm:grid-cols-2">
      {data.length === 0 ? <span className="text-[#999]">暂无数据</span> : data.map((item, index) => <div className="flex min-w-0 items-center justify-between gap-2" key={item.label}>
        <span className="truncate text-[#666]"><i className="mr-2 inline-block size-2 rounded-full" style={{ background: colors[index % colors.length] }} />{item.label}</span><b className="shrink-0 text-[#333]">{number(item.value)}</b>
      </div>)}
    </div>
  </div>;
}

function DenseTable({ columns, rows, ariaLabel }: { columns: Column[]; rows: Row[]; ariaLabel: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const ids = pageRows.map((row, index) => String(row.id ?? `${currentPage}-${index}-${row.label ?? "row"}`));
  const allSelected = ids.length > 0 && ids.every((id) => selected.includes(id));
  const cell = (row: Row, column: Column) => column.render ? column.render(row) : (row[column.key] ?? "-");
  const changeSize = (next: number) => { setPageSize(next); setPage(1); setSelected([]); };
  return <div className="overflow-x-auto">
    <table aria-label={ariaLabel} className="w-full min-w-[760px] table-fixed text-sm">
      <thead><tr className="bg-[#fafafa] text-[#333]">
        <th className="w-11 border-b border-[#eee] px-3 py-3 text-center"><input type="checkbox" aria-label={`全选${ariaLabel}当前页`} checked={allSelected} onChange={(event) => setSelected((current) => event.target.checked ? [...new Set([...current, ...ids])] : current.filter((id) => !ids.includes(id)))} /></th>
        {columns.map((column) => <th key={column.key} className={`whitespace-nowrap border-b border-[#eee] px-3 py-3 text-${column.align ?? "left"} font-medium`}>{column.title}</th>)}
      </tr></thead>
      <tbody>{pageRows.length === 0 ? <tr><td colSpan={columns.length + 1} className="border-b border-[#eee] px-3 py-10 text-center text-[#999]">暂无数据</td></tr> : pageRows.map((row, index) => {
        const id = ids[index];
        return <tr key={id} className="text-[#595959]">
          <td className="border-b border-[#eee] px-3 py-3 text-center"><input type="checkbox" aria-label={`选择${ariaLabel}第${index + 1}项`} checked={selected.includes(id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, id] : current.filter((key) => key !== id))} /></td>
          {columns.map((column) => <td key={column.key} className={`max-w-52 truncate whitespace-nowrap border-b border-[#eee] px-3 py-3 text-${column.align ?? "left"}`}>{cell(row, column)}</td>)}
        </tr>;
      })}</tbody>
    </table>
    {selected.length > 0 && <div className="sticky bottom-0 z-10 flex h-12 items-center gap-3 border-x border-b border-[#d9d9d9] bg-white px-4 text-xs shadow-sm"><span>已选 {selected.length} 条</span><button type="button" className="border border-[#d9d9d9] px-3 py-1.5 text-[#595959]">批量导出</button><button type="button" className="ml-auto text-[#3658f7]" onClick={() => setSelected([])}>取消选择</button></div>}
    <div className="flex items-center justify-between px-4 py-3 text-xs text-[#8c8c8c]">
      <span>共 {rows.length} 条，每页 {pageSize} 条</span>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="上一页" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="grid size-7 place-items-center border border-[#d9d9d9] disabled:text-[#d9d9d9]"><span className="size-1.5 rotate-45 border-b border-l border-current" /></button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1).map((item) => <button type="button" key={item} onClick={() => setPage(item)} className={`grid size-7 place-items-center border ${currentPage === item ? "border-[#3658f7] text-[#3658f7]" : "border-transparent text-[#595959]"}`}>{item}</button>)}
        {totalPages > 5 && <span className="px-1">…</span>}
        <button type="button" aria-label="下一页" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)} className="grid size-7 place-items-center border border-[#d9d9d9] disabled:text-[#d9d9d9]"><span className="size-1.5 -rotate-45 border-r border-t border-current" /></button>
        <label className="relative ml-2"><select value={pageSize} onChange={(event) => changeSize(Number(event.target.value))} className="h-7 appearance-none border border-[#d9d9d9] bg-white py-0 pl-2 pr-7 text-xs text-[#595959]"><option value={20}>20 条/页</option><option value={50}>50 条/页</option><option value={100}>100 条/页</option></select><span className="pointer-events-none absolute right-2 top-2 size-1.5 rotate-45 border-b border-r border-[#8c8c8c]" /></label>
      </div>
    </div>
  </div>;
}

function ReportPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border border-[#eee] bg-white"><h2 className="border-b border-[#eee] bg-[#fafafa] px-4 py-3 text-sm font-medium text-[#333]">{title}</h2>{children}</section>;
}

export default function LoveUserStatisticsPage() {
  const initialDates = useMemo(defaultDates, []);
  const [tab, setTab] = useState<TabKey>("growth");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [growthPeriod, setGrowthPeriod] = useState<"daily" | "monthly" | "yearly">("daily");
  const [from, setFrom] = useState(initialDates.from);
  const [to, setTo] = useState(initialDates.to);
  const [applied, setApplied] = useState(initialDates);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Record<string, unknown>>({});

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminEndpoints.memberStatistics(applied).then((data) => { if (active) setReport(asObject(data)); }).catch(() => { if (active) setReport({}); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [applied]);

  const groups = asObject(report.groups);
  const metrics = asObject(report.metrics);
  const basic = asObject(groups.basic_groups);
  const requirements = asObject(groups.requirements);
  const requirementGroups = asObject(requirements[gender]);
  const growth = asRows(groups.growth);
  const follow = asRows(groups.follow_report);
  const browse = asRows(groups.browse_report);
  const intention = asItems(groups.intention);
  const maximumDaily = growth.reduce((maximum, row) => Math.max(maximum, Number(row.member_count) || 0), 0);
  const monthlyGrowth = growth.reduce<Record<string, number>>((months, row) => { const month = String(row.date ?? "").slice(0, 7); months[month] = (months[month] ?? 0) + (Number(row.member_count) || 0); return months; }, {});
  const maximumMonthly = Math.max(0, ...Object.values(monthlyGrowth));
  const growthRows = (() => {
    if (growthPeriod === "daily") return growth;
    const buckets = new Map<string, Row>();
    growth.forEach((row) => {
      const date = String(row.date ?? "");
      const key = growthPeriod === "monthly" ? date.slice(0, 7) : date.slice(0, 4);
      const current = buckets.get(key) ?? { id: key, date: key, member_count: 0, vip_count: 0, apply_count: 0, failed_count: 0, success_count: 0 };
      ["member_count", "vip_count", "apply_count", "failed_count", "success_count"].forEach((field) => { current[field] = (Number(current[field]) || 0) + (Number(row[field]) || 0); });
      buckets.set(key, current);
    });
    return [...buckets.values()];
  })();
  const intentTotal = intention.reduce((sum, item) => sum + item.value, 0);
  const itemRows = (items: Item[]) => items.map((item, index) => ({ id: index + 1, label: item.label, value: item.value, proportion: intentTotal ? `${(item.value / intentTotal * 100).toFixed(2)}%` : "0.00%" }));
  const renderGroup = (title: string, data: Item[]) => <ReportPanel title={title}><Donut data={data} /><DenseTable ariaLabel={title} rows={data.map((item, index) => ({ id: index + 1, label: item.label, value: item.value }))} columns={[{ key: "label", title: "统计项" }, { key: "value", title: "人数", align: "right", render: (row) => `${number(row.value)} 人` }]} /></ReportPanel>;

  const content = () => {
    if (tab === "growth") return <div className="space-y-4">
      <div className="grid gap-px border border-[#eee] bg-[#eee] md:grid-cols-3">{([['会员总人数', metrics.total_members], ['单日新增最高', maximumDaily], ['单月新增最高', maximumMonthly]] as [string, Value][]).map(([label, value]) => <div className="bg-white px-6 py-5" key={label}><p className="text-sm text-[#666]">{label}</p><b className="mt-2 block text-2xl font-medium text-[#333]">{number(value)}</b></div>)}</div>
      <ReportPanel title="会员增长统计"><div className="flex border-b border-[#eee] px-4"><button type="button" onClick={() => setGrowthPeriod("daily")} className={`border-b-2 px-4 py-3 text-sm ${growthPeriod === "daily" ? "border-[#3658f7] text-[#3658f7]" : "border-transparent text-[#666]"}`}>日报</button><button type="button" onClick={() => setGrowthPeriod("monthly")} className={`border-b-2 px-4 py-3 text-sm ${growthPeriod === "monthly" ? "border-[#3658f7] text-[#3658f7]" : "border-transparent text-[#666]"}`}>月报</button><button type="button" onClick={() => setGrowthPeriod("yearly")} className={`border-b-2 px-4 py-3 text-sm ${growthPeriod === "yearly" ? "border-[#3658f7] text-[#3658f7]" : "border-transparent text-[#666]"}`}>年报</button></div><DenseTable ariaLabel="会员增长统计" rows={growthRows} columns={[{ key: "date", title: "日期（周期）" }, { key: "member_count", title: "新增会员", align: "right" }, { key: "vip_count", title: "新增VIP会员", align: "right" }, { key: "apply_count", title: "新申请红娘牵线数", align: "right" }, { key: "failed_count", title: "失败牵线数", align: "right" }, { key: "success_count", title: "成功牵线数", align: "right" }]} /></ReportPanel>
    </div>;
    if (tab === "follow") return <ReportPanel title="会员跟进统计"><DenseTable ariaLabel="会员跟进统计" rows={follow} columns={[{ key: "matchmaker", title: "红娘" }, { key: "member_count", title: "名下会员", align: "right" }, { key: "never_followed", title: "从未跟进", align: "right" }, { key: "over_3_days", title: "超3天未跟进", align: "right" }, { key: "over_7_days", title: "超7天未跟进", align: "right" }, { key: "over_15_days", title: "超15天未跟进", align: "right" }, { key: "over_30_days", title: "超30天未跟进", align: "right" }, { key: "follow_count", title: "跟进总条数", align: "right" }, { key: "month_follow_count", title: "本月跟进条数", align: "right" }]} /></ReportPanel>;
    if (tab === "intention") return <ReportPanel title="会员意向统计"><Donut data={intention} /><DenseTable ariaLabel="会员意向统计" rows={itemRows(intention)} columns={[{ key: "label", title: "客户意向" }, { key: "value", title: "客源数量", align: "right" }, { key: "proportion", title: "占比", align: "right" }]} /></ReportPanel>;
    if (tab === "basic") return <div className="grid gap-4 xl:grid-cols-2">{Object.entries(basic).map(([key, value]) => renderGroup(basicTitles[key] ?? key, asItems(value)))}</div>;
    if (tab === "requirement") return <div className="space-y-4"><div className="flex border-b border-[#eee]"><button type="button" onClick={() => setGender("male")} className={`border-b-2 px-5 py-3 text-sm ${gender === "male" ? "border-[#3658f7] text-[#3658f7]" : "border-transparent text-[#666]"}`}>男会员</button><button type="button" onClick={() => setGender("female")} className={`border-b-2 px-5 py-3 text-sm ${gender === "female" ? "border-[#3658f7] text-[#3658f7]" : "border-transparent text-[#666]"}`}>女会员</button></div><div className="grid gap-4 xl:grid-cols-2">{Object.entries(requirementTitles).map(([key, title]) => renderGroup(title, asItems(requirementGroups[key])))}</div></div>;
    if (tab === "browse") return <ReportPanel title="浏览统计"><DenseTable ariaLabel="浏览统计" rows={browse} columns={[{ key: "date", title: "日期" }, { key: "home_views", title: "平台首页浏览次数", align: "right" }, { key: "profile_views", title: "资料页浏览次数", align: "right" }, { key: "popular_member", title: "被浏览最多的资料页" }]} /></ReportPanel>;
    const rankings: [string, string][] = [["人气女会员排行（浏览量前10）", "popularity_female"], ["人气男会员排行（浏览量前10）", "popularity_male"], ["最受欢迎女会员排行（被申请牵线数前10）", "apply_female"], ["最受欢迎男会员排行（被申请牵线数前10）", "apply_male"]];
    return <div className="grid gap-4 xl:grid-cols-2">{rankings.map(([title, key]) => <ReportPanel title={title} key={key}><DenseTable ariaLabel={title} rows={asItems(groups[key]).map((item, index) => ({ id: index + 1, rank: index + 1, label: item.label, value: item.value }))} columns={[{ key: "rank", title: "排名", align: "center" }, { key: "label", title: "会员" }, { key: "value", title: "数量", align: "right" }]} /></ReportPanel>)}</div>;
  };

  return <div className="mx-auto max-w-[1600px]">
    <AdminBreadcrumb items={[{ label: "会员CRM" }, { label: "数据报表" }]} />
    <h1 className="mb-3 text-xl font-medium text-[#333]">会员数据报表</h1>
    <div className="mb-4 flex overflow-x-auto border-b border-[#eee]">{tabs.map((item) => <button type="button" key={item.key} onClick={() => setTab(item.key)} className={`shrink-0 border-b-2 px-4 py-3 text-sm ${tab === item.key ? "border-[#3658f7] text-[#3658f7]" : "border-transparent text-[#666]"}`}>{item.label}</button>)}</div>
    <div className="mb-4 flex flex-wrap items-center gap-3 border border-[#eee] bg-white px-4 py-3 text-sm text-[#595959]"><span>统计时间</span><input type="date" aria-label="开始日期" value={from} onChange={(event) => setFrom(event.target.value)} className="h-8 border border-[#d9d9d9] px-2" /><span>至</span><input type="date" aria-label="结束日期" value={to} onChange={(event) => setTo(event.target.value)} className="h-8 border border-[#d9d9d9] px-2" /><button type="button" onClick={() => setApplied({ from, to })} className="h-8 bg-[#3658f7] px-4 text-white">查询</button></div>
    {loading ? <div className="border border-[#eee] bg-white py-12 text-center text-sm text-[#999]">加载中...</div> : content()}
  </div>;
}
