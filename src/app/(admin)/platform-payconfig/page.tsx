"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "收费项目", key: "itemName" },
  { title: "金额(元)", key: "amount" },
  { title: "有效期", key: "validity" },
  { title: "说明", key: "description" },
  { title: "更新时间", key: "updateTime" },
  { title: "操作", key: "action", width: 100, align: "center" },
];

const data: Record<string, unknown>[] = [
  { id: 1, itemName: "VIP月度会员", amount: "98", validity: "30天", description: "VIP会员月度订阅", updateTime: "2026-07-10 11:20:00", action: "编辑" },
  { id: 2, itemName: "VIP季度会员", amount: "268", validity: "90天", description: "VIP会员季度订阅", updateTime: "2026-07-11 11:21:00", action: "编辑" },
  { id: 3, itemName: "VIP年度会员", amount: "888", validity: "365天", description: "VIP会员年度订阅", updateTime: "2026-07-12 11:22:00", action: "编辑" },
  { id: 4, itemName: "牵线服务费", amount: "199", validity: "单次", description: "红娘牵线服务单次费用", updateTime: "2026-07-13 11:23:00", action: "编辑" },
  { id: 5, itemName: "活动报名费", amount: "50", validity: "单次", description: "线下活动报名费用", updateTime: "2026-07-14 11:24:00", action: "编辑" },
  { id: 6, itemName: "实名认证费", amount: "9.9", validity: "永久", description: "用户实名认证服务费", updateTime: "2026-07-10 11:25:00", action: "编辑" },
  { id: 7, itemName: "礼物-玫瑰花束", amount: "19.9", validity: "单次", description: "虚拟礼物-玫瑰花束", updateTime: "2026-07-11 11:26:00", action: "编辑" },
  { id: 8, itemName: "礼物-巧克力", amount: "29.9", validity: "单次", description: "虚拟礼物-巧克力礼盒", updateTime: "2026-07-12 11:27:00", action: "编辑" },
  { id: 9, itemName: "积分充值-100", amount: "10", validity: "永久", description: "积分充值100点", updateTime: "2026-07-13 11:28:00", action: "编辑" },
  { id: 10, itemName: "积分充值-500", amount: "50", validity: "永久", description: "积分充值500点", updateTime: "2026-07-14 11:29:00", action: "编辑" },
  { id: 11, itemName: "积分充值-1000", amount: "100", validity: "永久", description: "积分充值1000点", updateTime: "2026-07-10 11:30:00", action: "编辑" },
  { id: 12, itemName: "增值服务包", amount: "399", validity: "90天", description: "包含多项增值服务", updateTime: "2026-07-11 11:31:00", action: "编辑" },
];

export default function PlatformPayconfigPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("平台配置", "收费配置")}
      pageTitle="收费配置"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 12 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
