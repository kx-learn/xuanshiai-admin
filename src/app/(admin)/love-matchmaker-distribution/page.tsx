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

const data: DistributionRow[] = [
  { id: 1, configName: "基础分成方案", matchmakerRate: 30, promotionRate: 10, partnerRate: 5, updateTime: "2026-01-01 14:30:00" },
  { id: 2, configName: "高级分成方案", matchmakerRate: 35, promotionRate: 12, partnerRate: 8, updateTime: "2026-02-01 14:31:00" },
  { id: 3, configName: "VIP分成方案", matchmakerRate: 40, promotionRate: 14, partnerRate: 11, updateTime: "2026-03-01 14:32:00" },
  { id: 4, configName: "活动分成方案", matchmakerRate: 45, promotionRate: 16, partnerRate: 14, updateTime: "2026-04-01 14:33:00" },
  { id: 5, configName: "季度奖励方案", matchmakerRate: 50, promotionRate: 18, partnerRate: 17, updateTime: "2026-05-01 14:34:00" },
  { id: 6, configName: "年度分成方案", matchmakerRate: 55, promotionRate: 20, partnerRate: 20, updateTime: "2026-06-01 14:35:00" },
  { id: 7, configName: "阶梯分成方案", matchmakerRate: 60, promotionRate: 22, partnerRate: 23, updateTime: "2026-07-01 14:36:00" },
  { id: 8, configName: "保底分成方案", matchmakerRate: 25, promotionRate: 8, partnerRate: 3, updateTime: "2026-01-15 14:37:00" },
  { id: 9, configName: "超额分成方案", matchmakerRate: 65, promotionRate: 24, partnerRate: 26, updateTime: "2026-02-15 14:38:00" },
  { id: 10, configName: "新人分成方案", matchmakerRate: 20, promotionRate: 6, partnerRate: 2, updateTime: "2026-03-15 14:39:00" },
];

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
      pagination={{ current: 1, pageSize: 10, total: 10 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
