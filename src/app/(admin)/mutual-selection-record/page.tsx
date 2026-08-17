"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type SearchField } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70, align: "center" },
  { title: "活动名称", key: "activityName", width: 180 },
  { title: "男嘉宾", key: "maleGuest", width: 100 },
  { title: "女嘉宾", key: "femaleGuest", width: 100 },
  {
    title: "是否互选",
    key: "isMutual",
    width: 90,
    align: "center",
    render: (row: Record<string, unknown>) => {
      const isMutual = row.isMutual as boolean;
      return (
        <span className={`inline-block px-2 py-0.5 text-xs rounded ${isMutual ? "bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]" : "bg-[#fff2f0] text-[#ff4d4f] border border-[#ffccc7]"}`}>
          {isMutual ? "是" : "否"}
        </span>
      );
    },
  },
  { title: "时间", key: "time", width: 180 },
];

const data: Record<string, unknown>[] = [];

const searchFields: SearchField[] = [
  { label: "活动名称", type: "input", placeholder: "请输入活动名称", width: 180 },
];

export default function MutualSelectionRecordPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("活动报名", "互选记录")}
      pageTitle="互选记录"
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
