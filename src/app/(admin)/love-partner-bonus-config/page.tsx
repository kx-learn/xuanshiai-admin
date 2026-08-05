"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 70, align: "center" },
  { title: "等级名称", key: "levelName", width: 130 },
  { title: "团队业绩要求", key: "performanceRequirement", width: 200 },
  { title: "团队有效会员要求", key: "memberRequirement", width: 180 },
  { title: "分成比例(%)", key: "bonusRate", width: 130 },
  { title: "更新时间", key: "updateTime", width: 180 },
  {
    title: "操作",
    key: "action",
    width: 120,
    render: () => (
      <span className="flex items-center gap-2">
        <span className="text-[#3658f7] cursor-pointer hover:underline">编辑</span>
        <span className="text-[#ff4d4f] cursor-pointer hover:underline">删除</span>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [
  { id: 1, levelName: "初级合伙", performanceRequirement: "累计业绩≥0元", memberRequirement: "有效会员≥0人", bonusRate: 5, updateTime: "2026-06-28 14:30:17" },
  { id: 2, levelName: "中级合伙", performanceRequirement: "累计业绩≥10000元", memberRequirement: "有效会员≥10人", bonusRate: 8, updateTime: "2026-06-28 14:30:17" },
  { id: 3, levelName: "高级合伙", performanceRequirement: "累计业绩≥50000元", memberRequirement: "有效会员≥30人", bonusRate: 12, updateTime: "2026-06-28 14:30:17" },
];

const actions = [
  { label: "添加等级", variant: "primary" as const },
];

export default function LovePartnerBonusConfigPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("合伙红娘", "分成配置")}
      pageTitle="分成配置"
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 3 }}
    />
  );
}
