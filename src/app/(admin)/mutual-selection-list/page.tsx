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

const data: Record<string, unknown>[] = [
  { id: 1, activityName: "七夕浪漫互选会", maleCount: 87, femaleCount: 92, mutualCount: 23, startTime: "2026-07-15 14:00:00", status: "ongoing" },
  { id: 2, activityName: "金秋十月相亲会", maleCount: 65, femaleCount: 58, mutualCount: 18, startTime: "2026-07-16 14:00:00", status: "ongoing" },
  { id: 3, activityName: "周末趣味互选", maleCount: 45, femaleCount: 51, mutualCount: 12, startTime: "2026-07-17 14:00:00", status: "ongoing" },
  { id: 4, activityName: "520心动互选", maleCount: 120, femaleCount: 135, mutualCount: 35, startTime: "2026-06-20 14:00:00", status: "ended" },
  { id: 5, activityName: "新年交友派对", maleCount: 95, femaleCount: 88, mutualCount: 28, startTime: "2026-06-21 14:00:00", status: "ended" },
  { id: 6, activityName: "春之恋互选活动", maleCount: 72, femaleCount: 69, mutualCount: 20, startTime: "2026-06-22 14:00:00", status: "ended" },
  { id: 7, activityName: "精英专场互选", maleCount: 56, femaleCount: 62, mutualCount: 15, startTime: "2026-07-18 14:00:00", status: "ongoing" },
  { id: 8, activityName: "90后专场互选", maleCount: 108, femaleCount: 112, mutualCount: 31, startTime: "2026-07-19 14:00:00", status: "ongoing" },
  { id: 9, activityName: "公务员专场互选", maleCount: 42, femaleCount: 48, mutualCount: 11, startTime: "2026-05-15 14:00:00", status: "ended" },
  { id: 10, activityName: "海归专场互选", maleCount: 78, femaleCount: 85, mutualCount: 22, startTime: "2026-07-20 14:00:00", status: "ongoing" },
];

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
      pagination={{ current: 1, pageSize: 10, total: 10 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
