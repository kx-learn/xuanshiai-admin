"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type SearchField, type ActionButton, type TabConfig } from "@/components/ListPage";

const tabs: TabConfig[] = [
  { key: "all", label: "全部" },
  { key: "ongoing", label: "进行中" },
  { key: "ended", label: "已结束" },
];

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70, align: "center" },
  { title: "活动名称", key: "activityName", width: 180 },
  { title: "男嘉宾数", key: "maleCount", width: 100, align: "center" },
  { title: "女嘉宾数", key: "femaleCount", width: 100, align: "center" },
  { title: "互选成功数", key: "mutualCount", width: 110, align: "center" },
  { title: "开始时间", key: "startTime", width: 180 },
  {
    title: "状态",
    key: "status",
    width: 90,
    render: (row: Record<string, unknown>) => {
      const status = String(row.status ?? "");
      const map: Record<string, { label: string; className: string }> = {
        ongoing: { label: "进行中", className: "bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]" },
        ended: { label: "已结束", className: "bg-[#f5f5f5] text-[#999] border border-[#d9d9d9]" },
      };
      const item = map[status] || { label: status, className: "bg-[#f5f5f5] text-[#999] border border-[#d9d9d9]" };
      return <span className={`inline-block px-2 py-0.5 text-xs rounded ${item.className}`}>{item.label}</span>;
    },
  },
  {
    title: "操作",
    key: "action",
    width: 120,
    render: (_row: Record<string, unknown>) => (
      <span className="flex items-center gap-2">
        <button className="text-[#3658f7] hover:text-[#6b85ff] text-sm">详情</button>
        <button className="text-[#3658f7] hover:text-[#6b85ff] text-sm">记录</button>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [];

const searchFields: SearchField[] = [
  { label: "活动名称", type: "input", placeholder: "请输入活动名称", width: 180 },
  { label: "状态", type: "select", options: [{ label: "全部", value: "" }, { label: "进行中", value: "ongoing" }, { label: "已结束", value: "ended" }], width: 120 },
];

const actions: ActionButton[] = [
  { label: "创建活动", variant: "primary", onClick: () => {} },
];

export default function MutualSelectionListPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("活动报名", "活动列表")}
      pageTitle="互选活动"
      tabs={tabs}
      searchFields={searchFields}
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
