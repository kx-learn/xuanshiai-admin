"use client";

import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "红娘", key: "nickname", width: 180, render: (row) => <div className="flex items-center gap-2"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#edf2ff] text-[#3658f7]">{String(row.nickname ?? "?").slice(0, 1)}</div><div><div className="font-medium">{String(row.nickname ?? "-")}</div><div className="text-xs text-[#999]">ID: {String(row.user_id ?? "-")}</div></div></div> },
  { title: "服务类型", key: "application_type", width: 130 },
  { title: "认证标签", key: "certification_tags", width: 180, render: (row) => Array.isArray(row.certification_tags) ? row.certification_tags.join("、") : "-" },
  { title: "完成服务", key: "success_count", width: 100 },
  { title: "评分", key: "rating_score", width: 80 },
  { title: "接单状态", key: "is_available", width: 100, render: (row) => <span className={row.is_available ? "text-[#52c41a]" : "text-[#999]"}>{row.is_available ? "可接单" : "暂停接单"}</span> },
  { title: "操作", key: "action", width: 140, render: () => <div className="flex gap-3"><button className="text-[#3658f7]">查看</button><button className="text-[#3658f7]">状态</button></div> },
];

export default function LoveMatchmakerListPage() {
  return <ListPage breadcrumb={getBreadcrumb("总店红娘", "红娘管理")} pageTitle="红娘管理" searchFields={[
    { label: "红娘昵称", type: "input", placeholder: "请输入昵称", width: 180 },
    { label: "接单状态", type: "select", options: [{ label: "可接单", value: "true" }, { label: "暂停接单", value: "false" }] },
  ]} actions={[{ label: "导出 Excel", variant: "default" }]} columns={columns} dataSource={[]} rowKey="user_id" endpoint="/api/backend/admin/matchmaker/matchmakers?page=1&page_size=20" pagination={{ current: 1, pageSize: 20, total: 0 }} onSearch={() => {}} onReset={() => {}} />;
}
