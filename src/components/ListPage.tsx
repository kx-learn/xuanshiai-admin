"use client";

import { useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Button } from "@/components/ui/button";

export interface TabConfig { key: string; label: string }
export interface SearchField { label: string; type: "input" | "select" | "dateRange"; placeholder?: string; options?: { label: string; value: string }[]; width?: number }
export interface ActionButton { label: string; icon?: string; variant?: "primary" | "default" | "link" | "danger"; onClick?: () => void }
export interface ColumnDef { title: string; key: string; width?: number | string; render?: (row: Record<string, unknown>) => React.ReactNode; align?: "left" | "center" | "right" }
export interface PaginationInfo { current: number; pageSize: number; total: number }
interface ListPageProps {
  breadcrumb: { label: string; href?: string }[]; pageTitle: string; tabs?: TabConfig[]; activeTab?: string; onTabChange?: (key: string) => void;
  searchFields?: SearchField[]; actions?: ActionButton[]; columns: ColumnDef[]; dataSource: Record<string, unknown>[]; rowKey?: string;
  pagination?: PaginationInfo; onSearch?: () => void; onReset?: () => void; loading?: boolean; endpoint?: string;
}

export default function ListPage({ breadcrumb, pageTitle, tabs, activeTab = "", onTabChange, searchFields = [], actions = [], columns, dataSource, rowKey = "id", pagination, onSearch, onReset, loading = false, endpoint }: ListPageProps) {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [remoteRows, setRemoteRows] = useState<Record<string, unknown>[] | null>(null);
  const [remoteTotal, setRemoteTotal] = useState<number | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(Boolean(endpoint));
  useEffect(() => {
    if (!endpoint) return;
    setRemoteLoading(true);
    const controller = new AbortController();
    fetch(endpoint, { signal: controller.signal }).then((response) => {
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      return response.json();
    }).then((payload) => {
      const rows = Array.isArray(payload) ? payload : Array.isArray(payload.items) ? payload.items : Array.isArray(payload.data) ? payload.data : [];
      setRemoteRows(rows);
      const total = Number(payload?.total);
      setRemoteTotal(Number.isFinite(total) ? total : rows.length);
    }).catch((error) => {
      if (error?.name !== "AbortError") {
        setRemoteRows(null);
        setRemoteTotal(null);
      }
    }).finally(() => setRemoteLoading(false));
    return () => controller.abort();
  }, [endpoint]);
  const rows = remoteRows ?? dataSource;
  const pg = pagination ? { ...pagination, total: remoteTotal ?? pagination.total } : { current: 1, pageSize: 10, total: remoteTotal ?? rows.length };
  const changeTab = (key: string) => { setCurrentTab(key); onTabChange?.(key); };
  return <div>
    <AdminBreadcrumb items={breadcrumb} />
    {(pageTitle || tabs) && <div className="mb-4"><h1 className="text-xl font-medium text-[#333] mb-3">{pageTitle}</h1>{tabs && <div className="flex border-b border-[#f0f0f0]">{tabs.map((tab) => <button key={tab.key} onClick={() => changeTab(tab.key)} className={`px-4 py-3 text-sm -mb-px ${((currentTab || tabs[0]?.key) === tab.key) ? "text-[#3658f7] border-b-2 border-[#3658f7]" : "text-[#666]"}`}>{tab.label}</button>)}</div>}</div>}
    {(searchFields.length || actions.length) > 0 && <div className="admin-card mb-4"><div className="admin-card-body !py-3 flex flex-wrap items-end gap-3">{searchFields.map((field, index) => <div key={index} className="flex items-center gap-2"><label className="text-sm text-[#666] whitespace-nowrap">{field.label}</label>{field.type === "input" && <input placeholder={field.placeholder || "请输入"} className="h-8 px-3 text-sm border border-[#d9d9d9] rounded-md" style={{ width: field.width || 160 }} />}{field.type === "select" && <select className="h-8 px-3 text-sm border border-[#d9d9d9] rounded-md bg-white" style={{ width: field.width || 140 }}>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>}{field.type === "dateRange" && <><input type="date" className="h-8 px-2 border border-[#d9d9d9] rounded-md" /><span>-</span><input type="date" className="h-8 px-2 border border-[#d9d9d9] rounded-md" /></>}</div>)}{onSearch && <Button size="sm" variant="primary" onClick={onSearch}>搜索</Button>}{onReset && <Button size="sm" variant="default" onClick={onReset}>重置</Button>}<div className="flex-1" />{actions.map((action, index) => <Button key={index} size="sm" variant={action.variant || "default"} onClick={action.onClick}>{action.icon && <span className="mr-1">{action.icon}</span>}{action.label}</Button>)}</div></div>}
    <div className="admin-card overflow-x-auto">{(loading || remoteLoading) ? <div className="p-8 text-center text-[#999]">加载中...</div> : rows.length === 0 ? <div className="p-8 text-center text-[#999]">暂无数据</div> : <table className="w-full"><thead><tr>{columns.map((column) => <th key={column.key} className="bg-[#fafafa] p-2 border-b border-[#f0f0f0] text-sm font-medium whitespace-nowrap" style={{ width: column.width, textAlign: column.align || "left" }}>{column.title}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={String(row[rowKey] ?? rowIndex)} className="hover:bg-[#fafafa]"><td colSpan={0} className="hidden" />{columns.map((column) => <td key={column.key} className="p-2 border-b border-[#f0f0f0] text-sm" style={{ textAlign: column.align || "left" }}>{column.render ? column.render(row) : String(row[column.key] ?? "")}</td>)}</tr>)}</tbody></table>}<div className="flex justify-between px-4 py-4 text-sm text-[#999]"><span>共 {pg.total} 条</span><span>{pg.current} / {Math.max(1, Math.ceil(pg.total / pg.pageSize))} 页</span></div></div>
  </div>;
}
