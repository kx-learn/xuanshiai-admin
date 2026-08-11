"use client";

import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "线索 ID", key: "id", width: 80 },
  { title: "客户", key: "name", width: 180, render: (row) => <div><div className="font-medium">{String(row.name ?? "-")}</div><div className="text-xs text-[#999]">{String(row.phone ?? row.wechat ?? "-")}</div></div> },
  { title: "来源", key: "source", width: 120 },
  { title: "意向等级", key: "intention_level", width: 100, render: (row) => row.intention_level === 1 ? "高" : row.intention_level === 2 ? "中" : row.intention_level === 3 ? "低" : "-" },
  { title: "状态", key: "status", width: 120, render: (row) => <span className="text-[#3658f7]">{String(row.status ?? "-")}</span> },
  { title: "负责红娘", key: "matchmaker_id", width: 120 },
  { title: "下次跟进", key: "next_follow_at", width: 170 },
  { title: "更新时间", key: "updated_at", width: 170 },
  { title: "操作", key: "action", width: 100, render: () => <button className="text-[#3658f7]">查看</button> },
];

export default function LoveCustomerListPage() {
  return <ListPage breadcrumb={getBreadcrumb("客源线索", "线索管理")} pageTitle="线索管理" tabs={[{ key: "all", label: "全部线索" }, { key: "new", label: "待联系" }, { key: "intended", label: "有意向" }]} activeTab="all" searchFields={[
    { label: "客户", type: "input", placeholder: "姓名/手机号/微信号", width: 220 },
    { label: "状态", type: "select", options: [{ label: "NEW", value: "NEW" }, { label: "CONTACTED", value: "CONTACTED" }, { label: "INTENDED", value: "INTENDED" }, { label: "CONVERTED", value: "CONVERTED" }] },
    { label: "来源", type: "input", placeholder: "请输入来源", width: 140 },
  ]} actions={[{ label: "新增线索", variant: "primary" }, { label: "导出 Excel", variant: "default" }]} columns={columns} dataSource={[]} rowKey="id" endpoint="/api/backend/admin/customer-leads?page=1&page_size=20" pagination={{ current: 1, pageSize: 20, total: 0 }} onSearch={() => {}} onReset={() => {}} />;
}
