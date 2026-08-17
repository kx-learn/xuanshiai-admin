"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70, align: "center" },
  { title: "配置名称", key: "configName" },
  { title: "红娘分成比例(%)", key: "matchmakerRate", width: 140, align: "center" },
  { title: "推广分成比例(%)", key: "promotionRate", width: 140, align: "center" },
  { title: "合伙人分成比例(%)", key: "partnerRate", width: 140, align: "center" },
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
  matchmakerRate: number;
  promotionRate: number;
  partnerRate: number;
  updateTime: string;
}

const data: DistributionRow[] = [];

const actions: ActionButton[] = [
  { label: "新增配置", variant: "primary" },
];

const dataSource = data as unknown as Record<string, unknown>[];

export default function LoveMatchmakerDistributionPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("总店红娘", "分成配置")}
      pageTitle="分成配置"
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
