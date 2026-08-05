"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 70, align: "center" },
  { title: "配置名称", key: "configName", width: 200 },
  { title: "配置值", key: "configValue", width: 150 },
  { title: "说明", key: "description" },
  { title: "更新时间", key: "updateTime", width: 180 },
  {
    title: "操作",
    key: "action",
    width: 100,
    render: () => (
      <span className="text-[#3658f7] cursor-pointer hover:underline">编辑</span>
    ),
  },
];

const data: Record<string, unknown>[] = [
  { id: 1, configName: "合伙人注册开关", configValue: "开启", description: "控制合伙人注册功能是否可用", updateTime: "2026-07-14 09:15:00" },
  { id: 2, configName: "团队人数上限", configValue: "50人", description: "单个团队最大成员数量限制", updateTime: "2026-07-14 09:15:00" },
  { id: 3, configName: "最低分成门槛", configValue: "0元", description: "达到分成的最低消费额，0表示不限制", updateTime: "2026-07-14 09:15:00" },
  { id: 4, configName: "邀请奖励开关", configValue: "开启", description: "是否开启邀请奖励机制", updateTime: "2026-07-14 09:15:00" },
  { id: 5, configName: "推广素材审核", configValue: "开启", description: "是否审核推广素材内容", updateTime: "2026-07-14 09:15:00" },
  { id: 6, configName: "自动结算开关", configValue: "开启", description: "是否自动结算分成收入", updateTime: "2026-07-14 09:15:00" },
  { id: 7, configName: "提现最低额度", configValue: "1元", description: "单次提现最低金额限制", updateTime: "2026-07-14 09:15:00" },
  { id: 8, configName: "合伙人等级体系", configValue: "三级", description: "合伙人等级划分：初级/中级/高级", updateTime: "2026-07-14 09:15:00" },
  { id: 9, configName: "团队奖励倍数", configValue: "1.5倍", description: "团队业绩奖励的倍率系数", updateTime: "2026-07-14 09:15:00" },
  { id: 10, configName: "新人保护期", configValue: "30天", description: "新人合伙人加入后的保护天数", updateTime: "2026-07-14 09:15:00" },
];

export default function LovePartnerConfigPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("合伙红娘", "功能配置")}
      pageTitle="功能配置"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 10 }}
    />
  );
}
