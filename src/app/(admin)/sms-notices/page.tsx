"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "sn", width: 60 },
  { title: "短信通知场景描述", key: "sceneDesc" },
  { title: "短信内容示例（以实际收到信息为准）", key: "contentTemplate" },
  { title: "通知对象", key: "target" },
  {
    title: "状态",
    key: "status",
    width: 80,
    render: (row: Record<string, unknown>) => {
      const s = String(row.status ?? "");
      return (
        <span className={`inline-block px-2 py-0.5 text-xs rounded border ${s === "启用" ? "bg-[#f6ffed] text-[#52c41a] border-[#b7eb8f]" : "bg-[#f5f5f5] text-[#999] border-[#d9d9d9]"}`}>
          {s}
        </span>
      );
    },
  },
  {
    title: "操作",
    key: "action",
    width: 100,
    render: () => (
      <span className="flex items-center gap-2">
        <button className="text-sm text-[#3658f7] hover:text-[#2d4fd6]">编辑</button>
        <button className="text-sm text-[#3658f7] hover:text-[#2d4fd6]">开关</button>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("系统设置", "短信通知配置")}
      pageTitle="短信通知配置"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: data.length }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
