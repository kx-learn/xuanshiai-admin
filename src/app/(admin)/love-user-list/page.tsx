"use client";

import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 80 },
  { title: "昵称", key: "nickname", width: 180, render: (row) => <div><div className="font-medium">{String(row.nickname ?? "-")}</div><div className="text-xs text-[#999]">{String(row.phone ?? "-")}</div></div> },
  { title: "性别", key: "gender", width: 80, render: (row) => row.gender === 1 ? "男" : row.gender === 2 ? "女" : "-" },
  { title: "状态", key: "status", width: 90, render: (row) => <span className={row.status === 1 ? "text-[#52c41a]" : "text-[#ff4d4f]"}>{row.status === 1 ? "正常" : row.status === 2 ? "冻结" : row.status === 3 ? "注销" : "-"}</span> },
  { title: "VIP", key: "is_vip", width: 80, render: (row) => row.is_vip ? <span className="rounded border border-[#ffd591] bg-[#fff7e6] px-2 py-0.5 text-xs text-[#fa8c16]">VIP</span> : <span className="text-[#999]">普通</span> },
  { title: "负责红娘", key: "matchmaker_id", width: 120 },
  { title: "创建时间", key: "created_at", width: 180 },
  { title: "操作", key: "action", width: 100, render: () => <button className="text-[#3658f7]">查看详情</button> },
];

export default function LoveUserListPage() {
  return <ListPage breadcrumb={getBreadcrumb("会员 CRM", "资料管理")} pageTitle="会员资料" searchFields={[
    { label: "昵称/手机号", type: "input", placeholder: "请输入昵称或手机号", width: 220 },
    { label: "性别", type: "select", options: [{ label: "男", value: "1" }, { label: "女", value: "2" }] },
    { label: "状态", type: "select", options: [{ label: "正常", value: "1" }, { label: "冻结", value: "2" }, { label: "注销", value: "3" }] },
  ]} actions={[{ label: "导出 Excel", variant: "default" }]} columns={columns} dataSource={[]} rowKey="id" endpoint="/api/backend/admin/matchmaker/members?page=1&page_size=20" pagination={{ current: 1, pageSize: 20, total: 0 }} onSearch={() => {}} onReset={() => {}} />;
}
