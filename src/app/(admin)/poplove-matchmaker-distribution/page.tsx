"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70, align: "center" },
  { title: "配置名称", key: "configName" },
  { title: "推广分成比例(%)", key: "promotionRate", width: 160, align: "center" },
  { title: "更新时间", key: "updateTime", width: 180 },
  {
    title: "操作",
    key: "action",
    width: 120,
    render: () => (
      <span className="flex items-center gap-2">
        <span className="text-[#3658f7] cursor-pointer hover:underline text-xs">编辑</span>
        <span className="text-[#ff4d4f] cursor-pointer hover:underline text-xs">删除</span>
      </span>
    ),
  },
];

interface DistributionRow {
  id: number;
  configName: string;
  promotionRate: number;
  updateTime: string;
}

const data: DistributionRow[] = [];

const actions: ActionButton[] = [
  { label: "新增配置", variant: "primary" },
];

const dataSource = data as unknown as Record<string, unknown>[];

export default function PoploveMatchmakerDistributionPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("推广红娘", "推广分成配置")}
      pageTitle="推广分成配置"
      actions={actions}
      columns={columns}
      dataSource={dataSource}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
