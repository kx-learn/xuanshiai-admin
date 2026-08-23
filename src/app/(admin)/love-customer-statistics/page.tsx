"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const tabs = ["客户跟进统计", "客户意向统计", "客户来源统计", "客源状态统计", "客户增量统计", "客源分派统计", "推广红娘获客统计"];
const followColumns = ["红娘", "名下客源", "从未跟进", "超3天未跟进", "超7天未跟进", "超15天未跟进", "超30天未跟进", "跟进总条数", "本月跟进条数"];
const rows = [["芸希老师", 0, 0, 0, 0, 0, 0, "0条", "0条"], ["依依", 0, 0, 0, 0, 0, 0, "0条", "0条"]];
const intentRows = ["A类 未接", "B类 初步沟通", "C类 深入沟通未缔结", "D类 待确定到店时间", "E类 已确定到店", "F类 毁约需二邀", "G类 已到店未签约", "I类 已签单", "J类 放弃资源"];
const sourceRows = ["抖音", "其他渠道", "微信群", "本地群", "身边朋友", "同行群", "朋友圈", "朋友介绍", "QQ", "落地页"];
const statusRows = ["找对象中", "接触中", "恋爱中", "已结婚", "已到门店"];

export default function Page() {
  const [activeTab, setActiveTab] = useState(0);
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
        {(activeTab === 2 || activeTab === 4 || activeTab === 5) && <DateFilter />}
        {activeTab === 6 && <div className="statistics-filter-row"><input placeholder="推广红娘" /><DateFilter /></div>}
        <div className="overflow-x-auto pt-5">
          {activeTab === 1 || activeTab === 2 || activeTab === 3 ? <div className="py-3">
            {activeTab === 1 && <ReportTable headers={["客户意向", "客源数量", "占比"]} labels={intentRows} />}
            {activeTab === 2 && <ReportTable headers={["来源", "客源数量", "占比"]} labels={sourceRows} />}
            {activeTab === 3 && <ReportTable headers={["状态", "客源数量", "占比"]} labels={statusRows} />}
          </div> : activeTab === 4 ? <div className="report-chart"><span>单位：人</span><div className="report-chart-line">5</div><div className="report-chart-axis">2026-05　　　　　　　　　2026-06　　　　　　　　　2026-07</div></div> : activeTab === 5 ? <ReportTable headers={["分派给", "新分派客源", "操作"]} labels={["芸希老师", "依依"]} actions /> : activeTab === 6 ? <ReportTable headers={["推广红娘", "录入客源总数", "男客源", "女客源", "有效（男客源）", "有效（女客源）", "待审", "无效"]} labels={["拟姐说媒", "胡航恒", "宣哲爱", "乐乐", "是静香本人没错", "Sofia", "越可名"]} plain /> : <table className="w-full min-w-[1100px] table-fixed text-sm">
            <thead className="bg-[#fafafa] text-[#222]"><tr>{followColumns.map((column) => <th key={column} className="border-b px-3 py-3 text-left font-semibold">{column}</th>)}</tr></thead>
            <tbody>{rows.map((row) => <tr key={String(row[0])} className="border-b">{row.map((cell, index) => <td key={`${row[0]}-${index}`} className="px-3 py-3 text-center first:text-left">{cell}</td>)}</tr>)}</tbody>
          </table>}
        </div>
      </section>
    </div>
  );
}

function DateFilter() {
  return <label className="statistics-date-filter"><input placeholder="开始日期        →  结束日期" /><CalendarDays size={16} /></label>;
}

function ReportTable({ headers, labels, actions = false, plain = false }: { headers: string[]; labels: string[]; actions?: boolean; plain?: boolean }) {
  return <table className="w-full table-fixed text-sm"><thead className="bg-[#fafafa]"><tr>{headers.map((header) => <th key={header} className="border-b px-3 py-3 text-left font-semibold">{header}</th>)}</tr></thead><tbody>{labels.map((label, index) => <tr key={label} className="border-b"><td className="px-3 py-3">{label}</td>{headers.slice(1).map((header) => <td key={header} className="px-3 py-3">{actions && header === "操作" ? <span className="text-[#3658f7]">查看明细</span> : plain ? "-" : header === "占比" ? <span className="inline-flex items-center gap-3"><span className="inline-block h-7 w-[300px] rounded bg-[#f5f5f5]"></span>0.00%{index === 0 && <b className="rounded bg-[#ffe2df] px-2 py-1 font-normal text-[#ff6f66]">最多</b>}</span> : "0条"}</td>)}</tr>)}</tbody></table>;
}
