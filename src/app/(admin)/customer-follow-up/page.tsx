"use client";

import { CalendarDays, Download, PackageOpen, Upload } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const metrics = ["全部", "今天（2026.08.23）", "昨天", "最近3天", "本周", "上周", "本月", "上月"];

export default function CustomerFollowUpPage() {
  return <div className="follow-up-page">
    <AdminBreadcrumb items={getBreadcrumb("客源线索", "跟进全览")} />
    <section className="mb-5 rounded border border-[#cdd8ff] bg-[#f4f6ff] px-5 py-4 text-sm leading-6 text-[#46516b]"><h2 className="mb-1 font-semibold text-[#26324a]">💡 须知</h2><p>您可以在本页面查看所有的跟进记录，方便平台管理员快捷直观的了解和浏览跟进情况</p></section>
    <div className="follow-metrics">{metrics.map((label, index) => <div key={label} className={`follow-metric ${index === 0 ? "active" : ""}`}><strong>{index === 0 ? "全部" : "0"}{index === 0 ? <i className="follow-chevron" /> : <small>条</small>}</strong>{index > 0 && <span>{label}</span>}</div>)}</div>
    <section className="admin-card overflow-hidden"><header className="follow-header"><h2>跟进全览</h2><div><button><Download size={15} />导出EXCEL</button><button><Upload size={15} />导入历史跟进</button></div></header>
      <div className="follow-filters"><select><option>客户意向：不限</option></select><input placeholder="请输入会员昵称/姓名/手机" /><button className="search-btn">搜索</button><label className="date-filter"><input placeholder="开始日期       结束日期" /><CalendarDays size={16} /></label></div>
      <table><thead><tr>{["跟进会员", "跟进红娘", "跟进时间", "跟进内容", "操作"].map((x) => <th key={x}>{x}</th>)}</tr></thead><tbody><tr><td colSpan={5} className="empty"><PackageOpen size={48} /><span>暂无数据</span></td></tr></tbody></table>
    </section>
  </div>;
}
