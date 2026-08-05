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

const data: DistributionRow[] = [
  { id: 1, configName: "基础推广分成", promotionRate: 5, updateTime: "2026-01-01 15:20:00" },
  { id: 2, configName: "高级推广分成", promotionRate: 8, updateTime: "2026-02-01 15:21:00" },
  { id: 3, configName: "渠道专属分成", promotionRate: 11, updateTime: "2026-03-01 15:22:00" },
  { id: 4, configName: "阶梯推广分成", promotionRate: 14, updateTime: "2026-04-01 15:23:00" },
  { id: 5, configName: "新人推广分成", promotionRate: 17, updateTime: "2026-05-01 15:24:00" },
  { id: 6, configName: "季度推广奖励", promotionRate: 20, updateTime: "2026-06-01 15:25:00" },
  { id: 7, configName: "年度推广分成", promotionRate: 23, updateTime: "2026-07-01 15:26:00" },
  { id: 8, configName: "活动推广分成", promotionRate: 26, updateTime: "2026-01-15 15:27:00" },
  { id: 9, configName: "VIP推广分成", promotionRate: 29, updateTime: "2026-02-15 15:28:00" },
  { id: 10, configName: "保底推广分成", promotionRate: 3, updateTime: "2026-03-15 15:29:00" },
];

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
      pagination={{ current: 1, pageSize: 10, total: 10 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
