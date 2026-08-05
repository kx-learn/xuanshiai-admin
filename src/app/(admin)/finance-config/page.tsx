"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "配置名称", key: "configName" },
  { title: "配置值", key: "configValue" },
  { title: "说明", key: "description" },
  { title: "更新时间", key: "updateTime" },
  {
    title: "操作",
    key: "action",
    width: 100,
    render: () => (
      <span className="flex items-center gap-2">
        <button type="button" className="text-[#3658f7] hover:text-[#5281f3] text-sm cursor-pointer bg-transparent border-none p-0">编辑</button>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [
  { id: 1, configName: "积分名称", configValue: "金币", description: "积分名称配置", updateTime: "2026-07-10 10:20:00" },
  { id: 2, configName: "积分比例", configValue: "1元 = 10积分", description: "积分兑换比例", updateTime: "2026-07-10 10:20:00" },
  { id: 3, configName: "余额名称", configValue: "余额", description: "余额显示名称", updateTime: "2026-07-10 10:20:00" },
  { id: 4, configName: "余额提现", configValue: "开启", description: "是否开启余额提现功能", updateTime: "2026-07-10 10:20:00" },
  { id: 5, configName: "提现手续费", configValue: ">=100元扣手续费", description: "提现金额 >= 100 元，扣手续费", updateTime: "2026-07-10 10:20:00" },
  { id: 6, configName: "手续费费率", configValue: "1%", description: "按提现全额计算，四舍五入，手续费不满1元时按1元扣", updateTime: "2026-07-10 10:20:00" },
  { id: 7, configName: "自动提现到微信零钱", configValue: "关闭", description: "单笔最小1元，最大500元", updateTime: "2026-07-10 10:20:00" },
  { id: 8, configName: "人工转账提现到微信", configValue: "开启", description: "单笔最小1元，最大1000元", updateTime: "2026-07-10 10:20:00" },
  { id: 9, configName: "人工转账提现到银行卡", configValue: "开启", description: "单笔最小1元，最大1000元", updateTime: "2026-07-10 10:20:00" },
  { id: 10, configName: "人工转账提现到支付宝", configValue: "开启", description: "单笔最小1元，最大1000元", updateTime: "2026-07-10 10:20:00" },
  { id: 11, configName: "积分充值套餐", configValue: "6个套餐(1元~600元)", description: "积分充值套餐1-6，充值金额从1元到600元", updateTime: "2026-07-10 10:20:00" },
];

export default function FinanceConfigPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("财务管理", "系统配置")}
      pageTitle="系统配置"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: data.length }}
      searchFields={[
        { label: "配置名称", type: "input", placeholder: "请输入配置名称" },
      ]}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
