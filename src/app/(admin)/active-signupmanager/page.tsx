"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type SearchField, type TabConfig } from "@/components/ListPage";

const tabs: TabConfig[] = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待确认" },
  { key: "confirmed", label: "已确认" },
  { key: "rejected", label: "已拒绝" },
];

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60, align: "center" },
  { title: "活动名称", key: "activityName", width: 180 },
  { title: "报名人", key: "signupName", width: 120 },
  { title: "手机号", key: "phone", width: 140 },
  { title: "报名时间", key: "signupTime", width: 180 },
  {
    title: "状态",
    key: "status",
    width: 90,
    render: (row: Record<string, unknown>) => {
      const status = row.status as string;
      let cls = "inline-block px-2 py-0.5 text-xs rounded";
      if (status === "已确认") cls += " bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]";
      else if (status === "已拒绝") cls += " bg-[#fff2f0] text-[#ff4d4f] border border-[#ffccc7]";
      else cls += " bg-[#fffbe6] text-[#faad14] border border-[#ffe58f]";
      return <span className={cls}>{status}</span>;
    },
  },
  {
    title: "操作",
    key: "action",
    width: 120,
    render: () => (
      <span className="flex items-center gap-2">
        <span className="text-[#3658f7] cursor-pointer hover:underline">确认</span>
        <span className="text-[#ff4d4f] cursor-pointer hover:underline">拒绝</span>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [];

const searchFields: SearchField[] = [
  { label: "活动名称", type: "input", placeholder: "请输入活动名称", width: 180 },
  { label: "报名人", type: "input", placeholder: "请输入报名人", width: 160 },
  { label: "状态", type: "select", options: [{ label: "全部", value: "" }, { label: "待确认", value: "pending" }, { label: "已确认", value: "confirmed" }, { label: "已拒绝", value: "rejected" }], width: 120 },
  { label: "报名时间", type: "dateRange" },
];

export default function ActiveSignupmanagerPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("活动报名", "活动报名管理")}
      pageTitle="活动报名管理"
      tabs={tabs}
      activeTab="all"
      searchFields={searchFields}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
