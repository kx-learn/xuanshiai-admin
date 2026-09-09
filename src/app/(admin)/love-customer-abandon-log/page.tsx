"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Search, PackageOpen } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";

type R = { id: number; lead_id: number; reason: string; abandoned_by: number; abandoned_at: string; restored_by: number | null; restored_at: string | null };
type L = { id: number; name: string };
const fmt = (v: string | null) => v ? new Date(v).toLocaleString("zh-CN", { hour12: false }) : "-";

export default function Page() {
  const [rows, setRows] = useState<R[]>([]);
  const [leads, setLeads] = useState<Record<number, L>>({});
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [abandonedBy, setAbandonedBy] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminEndpoints.customerLeadAbandonments() as R[];
      const d = await Promise.all(r.map((x) => adminEndpoints.customerLead(x.lead_id).catch(() => null)));
      const m: Record<number, L> = {};
      d.forEach((x) => { if (x) m[(x as L).id] = x as L });
      setRows(r);
      setLeads(m);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const filteredRows = useMemo(() => {
    const kw = keyword.trim();
    const fromTs = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : -Infinity;
    const toTs = toDate ? new Date(`${toDate}T23:59:59`).getTime() : Infinity;
    return rows.filter((row) => {
      if (abandonedBy && String(row.abandoned_by) !== abandonedBy) return false;
      const ts = new Date(row.abandoned_at).getTime();
      if (ts < fromTs || ts > toTs) return false;
      if (kw) {
        const lead = leads[row.lead_id];
        const blob = `${lead?.name ?? ""}`.toLowerCase();
        if (!blob.includes(kw.toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, leads, keyword, abandonedBy, fromDate, toDate]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  return (
    <div className="customer-lead-page">
      <AdminBreadcrumb items={getBreadcrumb("客源线索", "弃海记录")} />
      <section className="customer-notice mb-5 rounded border border-[#cdd8ff] bg-[#f4f6ff] px-5 py-4 text-sm leading-6 text-[#46516b]">
        <h2 className="mb-1 font-semibold text-[#26324a]">💡 须知</h2>
        <p>系统管理员、超级红娘可以在线索管理中将任意客源设置为"放入弃海"；红娘可以对自己名下的进行"放入弃海"操作。</p>
      </section>
      <section className="admin-card overflow-hidden pt-4">
        <div className="lead-tabs flex items-center gap-8 border-b">
          <Link href="/love-customer-list">线索管理</Link>
          <Link href="/love-customer-abandon">弃海客源</Link>
          <Link href="/love-customer-abandon-log" className="active">弃海记录</Link>
        </div>
        <div className="flex flex-wrap items-center gap-3 px-8 py-5">
          <select className="h-10 w-56 rounded border px-3 text-sm" value={abandonedBy} onChange={(event) => setAbandonedBy(event.target.value)}>
            <option value="">放弃红娘：不限</option>
            {Array.from(new Set(rows.map((row) => row.abandoned_by))).map((id) => <option key={id} value={id}>账号 #{id}</option>)}
          </select>
          <div className="date-range-picker w-80">
            <span className="dr-field">
              {!fromDate && <span className="dr-placeholder">开始日期</span>}
              <input aria-label="开始日期" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
            </span>
            <span aria-hidden className="dr-arrow">→</span>
            <span className="dr-field">
              {!toDate && <span className="dr-placeholder">结束日期</span>}
              <input aria-label="结束日期" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
            </span>
            <CalendarDays size={16} />
          </div>
          <div className="flex h-10 min-w-[280px] flex-1">
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="请输入会员昵称/手机/姓名/编号" className="min-w-0 flex-1 rounded-l border border-r-0 px-3 text-sm" />
            <button type="button" onClick={() => undefined} className="flex w-20 items-center justify-center gap-1 rounded-r bg-[#3658f7] text-sm text-white"><Search size={15} />搜索</button>
          </div>
          <button type="button" onClick={() => { setKeyword(""); setAbandonedBy(""); setFromDate(""); setToDate(""); setPage(1); }} className="h-10 rounded border border-[#d9d9d9] bg-white px-4 text-sm text-[#666]">重置</button>
          <span className="whitespace-nowrap text-sm">共有弃海记录：<b className="text-[#3658f7]">{filteredRows.length}条</b></span>
        </div>
        <div className="overflow-x-auto px-8">
          <table className="w-full min-w-[1100px] table-fixed text-sm">
            <thead>
              <tr>
                {["记录ID", "客源ID", "资料", "放弃人", "放弃类型", "放弃原因", "弃海时间", "分派状态（捞取人）", "捞取/分派时间"].map((x) => (
                  <th key={x} className="border-b bg-[#fafafa] px-3 py-3 text-left">{x}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="h-52 text-center">加载中...</td></tr>
              ) : pagedRows.length === 0 ? (
                <tr><td colSpan={9} className="h-52 text-center"><PackageOpen className="mx-auto" />暂无数据</td></tr>
              ) : pagedRows.map((x) => (
                <tr key={x.id} className="border-b">
                  <td className="px-3 py-3">{x.id}</td>
                  <td className="px-3 py-3">{x.lead_id}</td>
                  <td className="px-3 py-3">{leads[x.lead_id]?.name || "-"}</td>
                  <td className="px-3 py-3">账号 #{x.abandoned_by}</td>
                  <td className="px-3 py-3">主动弃海</td>
                  <td className="px-3 py-3">{x.reason}</td>
                  <td className="px-3 py-3">{fmt(x.abandoned_at)}</td>
                  <td className="px-3 py-3">{x.restored_at ? `已捞取（账号 #${x.restored_by}）` : "待捞取/分派"}</td>
                  <td className="px-3 py-3">{fmt(x.restored_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AdminPagination
          page={page}
          pageSize={pageSize}
          total={filteredRows.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </section>
    </div>
  );
}