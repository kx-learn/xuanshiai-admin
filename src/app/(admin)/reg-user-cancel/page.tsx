"use client";

import Link from "next/link";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Button } from "@/components/ui/button";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const rows = [
  [4, "suntoo", 765, "2026-07-22 10:56:30", "121.225.22.223", "×", "×", "×", "×"],
  [3, "Chloe", 769, "2026-07-22 10:42:43", "121.225.201.68", "×", "×", "×", "×"],
  [2, "泥絮", 762, "2026-07-19 18:40:31", "117.136.111.76", "✓", "×", "×", "×"],
  [1, "suntoo", 764, "2026-07-15 15:20:43", "117.89.49.128", "×", "×", "×", "×"],
];

export default function RegUserCancelPage() {
  return <div className="reg-user-cancel-page">
    <AdminBreadcrumb items={getBreadcrumb("平台账号", "账号管理")} />
    <section className="mb-5 rounded border border-[#cdd8ff] bg-[#f4f6ff] px-5 py-4 text-sm leading-6 text-[#46516b]"><h2 className="mb-1 font-semibold text-[#26324a]">💡 须知</h2><p>确定注销后，等同于删除账号，并且在系统中所有的账号关联将自动清空、解除绑定关系，会员资料自动变为“停止相亲”；待处理中的账号将被暂停登录；取消注销后账号恢复正常使用　<a className="text-[#3658f7]" href="#">账号注销流程图示</a></p></section>
    <div className="admin-card overflow-hidden"><div className="flex items-center gap-8 border-b border-[#edf0f5] px-8"><Link href="/reg-user-all" className="py-5 text-[#333]">账号管理</Link><Link href="/reg-user-cancel" className="border-b-2 border-[#3658f7] py-5 font-medium text-[#3658f7]">注销申请</Link></div><div className="flex flex-wrap items-center gap-3 px-8 py-5"><select className="h-10 rounded border px-3 text-sm"><option>全部账号</option></select><input className="h-10 w-96 rounded border px-3" placeholder="请输入会员昵称/手机" /><Button variant="primary">搜索</Button></div><div className="overflow-x-auto px-8"><table className="w-full min-w-[1200px] table-fixed"><thead><tr>{["ID", "账号", "申请注销时间", "IP地址", "会员资料关联", "推广红娘关联", "合伙红娘关联", "服务红娘关联", "状态", "操作"].map((title) => <th key={title} className="border-b bg-[#fafafa] p-3 text-left text-sm">{title}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row[0]} className="h-20"><td className="border-b p-3 text-sm text-[#8c96a8]">{row[0]}</td><td className="border-b p-3 text-sm"><strong className="block">{row[1]}</strong><span className="text-[#8c96a8]">账号ID：{row[2]}</span></td><td className="border-b p-3 text-sm">{row[3]}</td><td className="border-b p-3 text-sm">{row[4]}</td>{row.slice(5).map((value, index) => index < 4 ? <td key={index} className="border-b p-3 text-center text-lg">{value}</td> : null)}<td className="border-b p-3"><span className="rounded border border-[#91d5ff] bg-[#e6f7ff] px-2 py-1 text-xs text-[#1890ff]">待处理</span></td><td className="border-b p-3 text-sm"><button className="mr-3 text-[#3658f7]">取消注销</button><button className="text-[#3658f7]">确定注销</button></td></tr>)}</tbody></table></div><div className="admin-pagination"><button disabled>‹</button><span className="active">1</span><button disabled>›</button></div></div>
  </div>;
}
