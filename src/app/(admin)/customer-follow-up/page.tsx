"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Download, PackageOpen, Upload } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";

type FollowUp = {
  id: number;
  user_id: number;
  nickname: string;
  method: string | null;
  content: string;
  next_follow_at: string | null;
  created_by: number;
  created_at: string;
};
type Page = {
  items: FollowUp[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
};
const methodName = (m?: string | null) =>
  ({ PHONE: "电话", WECHAT: "微信", VISIT: "到访", OTHER: "其他" })[m || ""] || m || "-";
const fmt = (v?: string | null) => (v ? new Date(v).toLocaleString("zh-CN", { hour12: false }) : "-");

export default function CustomerFollowUpPage() {
  const [data, setData] = useState<Page>({ items: [], page: 1, page_size: 20, total: 0, has_more: false });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const load = useCallback(async (nextPage = 1, size = 20) => {
    setLoading(true);
    try {
      const rows = (await adminEndpoints.memberFollowUpsOverview({
        page: nextPage,
        page_size: size,
        search: keyword || undefined,
      })) as Page;
      setData(rows);
      setMessage("");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => {
    void load(1);
  }, [load]);

  const ranges: [string, "today" | "yesterday" | "3d" | "week" | "lastweek" | "month" | "lastmonth", string][] = [
    ["今天", "today", "今日"],
    ["昨天", "yesterday", "昨日"],
    ["最近3天", "3d", "近3日"],
    ["本周", "week", "本周"],
    ["上周", "lastweek", "上周"],
    ["本月", "month", "本月"],
    ["上月", "lastmonth", "上月"],
  ];
  const inRange = (date: string, range: "today" | "yesterday" | "3d" | "week" | "lastweek" | "month" | "lastmonth") => {
    const d = new Date(date);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    if (range === "today") return startOfDay === startOfToday;
    if (range === "yesterday") return startOfDay === startOfToday - 86400000;
    if (range === "3d") return startOfDay >= startOfToday - 2 * 86400000 && startOfDay <= startOfToday;
    if (range === "week") {
      const day = (now.getDay() + 6) % 7;
      return startOfDay >= startOfToday - day * 86400000 && startOfDay <= startOfToday;
    }
    if (range === "lastweek") {
      const day = (now.getDay() + 6) % 7;
      const thisMonday = startOfToday - day * 86400000;
      return startOfDay >= thisMonday - 7 * 86400000 && startOfDay < thisMonday;
    }
    if (range === "month") return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    if (range === "lastmonth") {
      const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getFullYear() === last.getFullYear() && d.getMonth() === last.getMonth();
    }
    return false;
  };
  const filterByDate = (items: FollowUp[]) => {
    if (!startDate && !endDate) return items;
    const fromTs = startDate ? new Date(`${startDate}T00:00:00`).getTime() : -Infinity;
    const toTs = endDate ? new Date(`${endDate}T23:59:59`).getTime() : Infinity;
    return items.filter((item) => {
      const t = new Date(item.created_at).getTime();
      return t >= fromTs && t <= toTs;
    });
  };
  const dateFilteredItems = filterByDate(data.items);
  const countBy = (range: Parameters<typeof inRange>[1]) => dateFilteredItems.filter((x) => inRange(x.created_at, range)).length;

  return (
    <div className="follow-up-page">
      <AdminBreadcrumb items={getBreadcrumb("客源线索", "跟进全览")} />
      <section className="mb-5 rounded border border-[#cdd8ff] bg-[#f4f6ff] px-5 py-4 text-sm leading-6 text-[#46516b]"><h2 className="mb-1 font-semibold text-[#26324a]">💡 须知</h2><p>您可以在本页面查看所有的跟进记录，方便平台管理员快捷直观的了解和浏览跟进情况</p></section>
      <div className="follow-metrics">
        <div className="follow-metric active"><strong>全部</strong><small>{dateFilteredItems.length} 条</small></div>
        {ranges.map(([label, range]) => (
          <div key={label} className="follow-metric"><strong>{countBy(range)}</strong><small>{label}</small></div>
        ))}
      </div>
      <section className="admin-card overflow-hidden">
        <header className="follow-header"><h2>跟进全览</h2><div><button><Download size={15} />导出EXCEL</button><button><Upload size={15} />导入历史跟进</button></div></header>
        <div className="follow-filters">
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="请输入会员昵称/姓名/手机" />
          <button className="search-btn" onClick={() => void load(1)}>搜索</button>
          <label className="date-filter date-range-picker">
            <span className="dr-field">
              {!startDate && <span className="dr-placeholder">开始日期</span>}
              <input aria-label="开始日期" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </span>
            <span aria-hidden className="dr-arrow">→</span>
            <span className="dr-field">
              {!endDate && <span className="dr-placeholder">结束日期</span>}
              <input aria-label="结束日期" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </span>
            <CalendarDays size={16} />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-[#fafafa] text-[#666]"><tr>{["跟进会员", "跟进红娘", "跟进时间", "跟进内容", "操作"].map((x) => <th key={x} className="border-b px-3 py-3 text-left font-normal">{x}</th>)}</tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center text-[#999]">加载中...</td></tr>
              ) : dateFilteredItems.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-[#999]"><PackageOpen size={40} className="mx-auto mb-2" />暂无数据</td></tr>
              ) : (
                dateFilteredItems.map((x) => (
                  <tr key={x.id} className="border-b hover:bg-[#fafcff]">
                    <td className="px-3 py-3">
                      <div className="font-medium">{x.nickname || "-"}</div>
                      <div className="text-xs text-[#999]">#{x.user_id}</div>
                    </td>
                    <td className="px-3 py-3">账号 #{x.created_by}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-[#777]">{fmt(x.created_at)}</td>
                    <td className="px-3 py-3">
                      <div>{x.content || "-"}</div>
                      <div className="text-xs text-[#3658f7]">{methodName(x.method)} {x.next_follow_at ? `· 下次${fmt(x.next_follow_at)}` : ""}</div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-[#3658f7]"><button>详情</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AdminPagination
          page={data.page}
          pageSize={data.page_size}
          total={data.total}
          onPageChange={(p) => void load(p, data.page_size)}
          onPageSizeChange={(size) => void load(1, size)}
        />
      </section>
      {message && <p className="mt-3 text-sm text-red-600">{message}</p>}
    </div>
  );
}
