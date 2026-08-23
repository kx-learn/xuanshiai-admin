"use client";

import Link from "next/link";
import { CalendarDays, Search, PackageOpen } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const columns = [
  "记录ID", "客源ID", "资料", "放弃人", "放弃类型", "放弃原因",
  "弃海时间", "分派状态（捞取人）", "捞取/分派时间",
];

export default function AbandonLogPage() {
  return (
    <div className="customer-lead-page">
      <AdminBreadcrumb items={getBreadcrumb("客源线索", "弃海记录")} />
      <section className="customer-notice mb-5 rounded border border-[#cdd8ff] bg-[#f4f6ff] px-5 py-4 text-sm leading-6 text-[#46516b]">
        <h2 className="mb-1 font-semibold text-[#26324a]">💡 须知</h2>
        <p>系统管理员、超级红娘可以在线索管理中将任意客源设置为“放入弃海”；红娘可以对自己名下的进行“放入弃海”操作；红娘超过指定的时间未对客源进行跟进会被系统自动放入弃海</p>
        <p>客源一旦进入到弃海，则其红娘分派自动变更为“待分派”，所有红娘均可见弃海中的“未被捞取”的客源信息，可进行“捞取”操作，捞取成功后自动分派到自己名下进行销售跟进</p>
        <p>平台可以设置被动弃海的时间期限，红娘每日可捞取客源的上限；同一客源可以多次被放入弃海，每放入一次就生成一次记录；管理员或超级红娘可以直接将弃海客源重新分派给任一红娘。已入库的客源可以在“会员CRM”中进行弃海、捞取操作。</p>
      </section>

      <section className="admin-card overflow-hidden pt-4">
        <div className="lead-tabs flex items-center gap-8 border-b">
          <Link href="/love-customer-list">线索管理</Link>
          <Link href="/love-customer-abandon">弃海客源(0)</Link>
          <Link href="/love-customer-abandon-log" className="active">弃海记录</Link>
        </div>

        <div className="abandon-log-filters flex flex-nowrap items-center gap-3 px-8 py-5">
          <select className="h-10 w-[220px] shrink-0 rounded-lg border border-[#dfe2e8] bg-white px-3 text-[14px] text-[#a6abb5]">
            <option>放弃红娘：不限</option>
          </select>
          <label className="relative flex h-10 w-[360px] shrink-0 items-center rounded-lg border border-[#dfe2e8] bg-white text-[#a6abb5]">
            <input type="text" placeholder="开始日期       →  结束日期" className="h-full w-full rounded-lg bg-transparent px-3 pr-10 text-[14px] outline-none placeholder:text-[#a6abb5]" />
            <CalendarDays size={17} className="pointer-events-none absolute right-3 text-[#b7bbc2]" />
          </label>
          <div className="flex h-10 min-w-[330px] flex-1">
            <input placeholder="请输入会员昵称/手机/姓名/编号" className="min-w-0 flex-1 rounded-l-lg border border-r-0 border-[#dfe2e8] px-3 text-[14px] outline-none placeholder:text-[#a6abb5]" />
            <button className="flex w-[78px] shrink-0 items-center justify-center gap-1 rounded-r-lg bg-[#3658f7] text-[14px] text-white"><Search size={16} />搜索</button>
          </div>
          <label className="flex shrink-0 items-center gap-2 whitespace-nowrap text-[14px] text-[#333]"><input type="checkbox" className="h-4 w-4" />待捞取/分派</label>
          <div className="w-[300px] shrink-0 whitespace-nowrap rounded bg-[#f5f6fa] px-2 py-2.5 text-center text-[13px] text-[#333]">共有弃海记录：<b className="text-[#5876f5]">0条</b><span className="mx-2">待捞取/分派:</span><b className="text-[#5876f5]">0条</b></div>
        </div>

        <div className="overflow-x-auto px-8">
          <table className="w-full min-w-[1100px] table-fixed text-[14px]">
            <thead className="bg-[#fafafa] text-[#222]"><tr>
              {columns.map((column) => <th key={column} className="border-b px-3 py-3 text-left font-semibold">{column}</th>)}
            </tr></thead>
            <tbody><tr><td colSpan={columns.length} className="h-[210px] border-b text-center text-[#c9cdd3]"><PackageOpen size={52} strokeWidth={1.3} className="mx-auto mb-2 text-[#e0e2e5]" /><span>暂无数据</span></td></tr></tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
