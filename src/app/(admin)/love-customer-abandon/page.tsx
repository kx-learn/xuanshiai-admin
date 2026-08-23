"use client";

import Link from "next/link";
import { useState } from "react";
import { FileDown, Plus, Search } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const filters = [
  "审核状态：不限",
  "分派跟进：不限",
  "客源状态：不限",
  "录入红娘：不限",
  "推广红娘",
  "录入管理员：不限",
  "客源来源：不限",
  "客户意向：不限",
];

const metrics = [
  ["全部", 8],
  ["未分派", 5],
  ["今日跟进", 0],
  ["从未跟进", 8],
  ["超3天未跟进", 7],
  ["今日需跟进", 0],
] as const;

const columns = [
  "客源ID", "资料", "客户意向", "来源", "审核", "录入人", "状态",
  "分派跟进", "跟进", "通话", "入库状态", "操作",
];

export default function AbandonPage() {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  return (
    <div className="customer-lead-page">
      <AdminBreadcrumb items={getBreadcrumb("客源线索", "弃海客源")} />
      <section className="customer-notice mb-5 rounded border border-[#cdd8ff] bg-[#f4f6ff] px-5 py-4 text-sm leading-6 text-[#46516b]">
        <h2 className="mb-1 font-semibold text-[#26324a]">💡 须知</h2>
        <p>客源线索（简称“线索库”）是指您广泛通过各种渠道获取到的单身潜在客户简单信息以快速便捷的形式收集汇总到“线索管理”中，分派给红娘进行销售跟进，并丰富完善更多信息。</p>
        <p>根据业务进展情况可将客源线索一键入库转入到会员资料库（会员CRM）中，系统会自动生成账号，该账号初始登录密码为：abc123；</p>
        <p>已入库到“会员CRM”的客户线索在本页面中仅做记录查询，请在会员资料中管理，本页不再提供编辑和任何操作；删除客源记录不影响会员资料中的数据。</p>
      </section>

      <section className="bg-white px-5 pt-4">
        <div className="lead-tabs flex items-center justify-between border-b">
          <div>
            <Link href="/love-customer-list">线索管理</Link>
            <Link href="/love-customer-abandon" className="active">弃海客源(0)</Link>
            <Link href="/love-customer-abandon-log">弃海记录</Link>
          </div>
          <div className="flex gap-2 pb-3">
            <button className="flex items-center gap-1 rounded bg-[#3658f7] px-3 py-1.5 text-sm text-white"><Plus size={15} />添加客源</button>
            <button className="rounded bg-[#3658f7] px-3 py-1.5 text-sm text-white">智能录入</button>
            <Link href="/love-customer-statistics" className="whitespace-nowrap rounded bg-[#3658f7] px-3 py-1.5 text-sm text-white">数据报表</Link>
            <button className="flex items-center gap-1 rounded bg-[#3658f7] px-3 py-1.5 text-sm text-white"><FileDown size={15} />导出EXCEL</button>
          </div>
        </div>

        <div className="lead-filter-grid grid gap-3 pt-4 md:grid-cols-4 xl:grid-cols-8">
          {filters.map((label) => (
            <select key={label} defaultValue="" className="h-10 rounded border border-[#ddd] bg-white px-3 text-left text-sm text-[#9aa1ad]">
              <option value="">{label}</option>
              <option>不限</option>
              <option>已设置</option>
            </select>
          ))}
        </div>
        <button type="button" className="lead-more-filters" onClick={() => setShowMoreFilters((visible) => !visible)}>{showMoreFilters ? "收起选项" : "更多选项"}<span className="lead-chevron" /></button>
        {showMoreFilters && <div className="lead-extra-filters">
          {["客户性别：不限", "年龄：不限", "身高：不限", "职业：不限", "学历：不限", "婚况：不限"].map((label) => <select key={label} defaultValue="" className="lead-filter-select"><option value="">{label}</option><option>不限</option><option>已填写</option></select>)}
          <input placeholder="标签：不限（多选）" />
          <label><input type="checkbox" /> 隐藏今日已跟进</label>
          <label><input type="checkbox" /> 隐藏今日已通话</label>
        </div>}

        <div className="lead-search-row flex flex-wrap items-end gap-3 py-4">
          <input placeholder="请输入称呼/微信号/手机号/ID" className="h-10 w-[430px] rounded border border-[#ddd] px-3 text-sm placeholder:text-[#b4bac5]" />
          <button className="flex h-10 items-center gap-1 rounded bg-[#3658f7] px-5 text-sm text-white"><Search size={14} />搜索</button>
          <button className="h-10 rounded border px-4 text-sm">重置</button>
          <span className="pb-2 text-sm">排序：录入时间</span>
        </div>

        <div className="lead-metrics-grid grid grid-cols-2 gap-3 md:grid-cols-6">
          {metrics.map(([name, count], index) => (
            <div key={name} className={`lead-metric-card ${index === 0 ? "selected" : ""}`}><div>{name}</div><div>{count}</div></div>
          ))}
        </div>
      </section>

      <div className="overflow-x-auto bg-white">
        <table className="w-full min-w-[1280px] text-sm">
          <thead className="bg-[#fafafa] text-[#666]"><tr>
            <th className="border-b px-3 py-3 text-left font-normal"><input type="checkbox" aria-label="全选弃海客源" /></th>
            {columns.map((column) => <th key={column} className="border-b px-3 py-3 text-left font-normal">{column}</th>)}
          </tr></thead>
          <tbody><tr><td colSpan={columns.length + 1} className="h-52 text-center text-[#c5c9d0]">暂无数据</td></tr></tbody>
        </table>
      </div>
    </div>
  );
}
