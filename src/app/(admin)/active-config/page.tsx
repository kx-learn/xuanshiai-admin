"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

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
  { id: 1, configName: "报名人数上限", configValue: "200人", description: "单场活动最大报名人数限制", updateTime: "2026-07-14 16:10:00" },
  { id: 2, configName: "活动可见范围", configValue: "全部用户", description: "活动对哪些用户可见（全部/VIP/指定区域）", updateTime: "2026-07-14 16:10:00" },
  { id: 3, configName: "自动审核开关", configValue: "开启", description: "是否自动审核报名信息", updateTime: "2026-07-14 16:10:00" },
  { id: 4, configName: "报名截止提醒", configValue: "提前24小时", description: "报名截止前的提醒时间设置", updateTime: "2026-07-14 16:10:00" },
  { id: 5, configName: "活动分享开关", configValue: "开启", description: "是否允许用户分享活动链接", updateTime: "2026-07-14 16:10:00" },
  { id: 6, configName: "签到功能开关", configValue: "开启", description: "是否开启活动现场签到功能", updateTime: "2026-07-14 16:10:00" },
  { id: 7, configName: "活动评价开关", configValue: "开启", description: "是否允许参与者评价活动", updateTime: "2026-07-14 16:10:00" },
  { id: 8, configName: "重复报名限制", configValue: "不允许", description: "是否允许用户重复报名同一活动", updateTime: "2026-07-14 16:10:00" },
  { id: 9, configName: "取消报名期限", configValue: "活动前2天", description: "取消报名的最后时限", updateTime: "2026-07-14 16:10:00" },
  { id: 10, configName: "活动推送开关", configValue: "开启", description: "是否推送活动通知给用户", updateTime: "2026-07-14 16:10:00" },
];

export default function ActiveConfigPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("活动报名", "活动参数配置")}
      pageTitle="活动参数配置"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 10 }}
    />
  );
}
