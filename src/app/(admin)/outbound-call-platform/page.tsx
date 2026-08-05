"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "配置名称", key: "configName" },
  { title: "配置值", key: "configValue" },
  { title: "说明", key: "description" },
  { title: "更新时间", key: "updateTime" },
  {
    title: "操作",
    key: "action",
    width: 100,
    render: () => (
      <button className="text-sm text-[#3658f7] hover:text-[#2d4fd6]">编辑</button>
    ),
  },
];

const data: Record<string, unknown>[] = [
  { id: 1, configName: "API地址", configValue: "https://api.call.example.com", description: "外呼平台API接口地址", updateTime: "2026-07-10 15:10:00" },
  { id: 2, configName: "认证密钥", configValue: "sk-****a1b2", description: "接口认证密钥", updateTime: "2026-07-11 15:11:00" },
  { id: 3, configName: "主叫号码", configValue: "400-123-4567", description: "外呼显示主叫号码", updateTime: "2026-07-12 15:12:00" },
  { id: 4, configName: "呼叫超时", configValue: "30", description: "呼叫超时时间(秒)", updateTime: "2026-07-13 15:13:00" },
  { id: 5, configName: "重试次数", configValue: "3", description: "失败重试次数上限", updateTime: "2026-07-14 15:14:00" },
  { id: 6, configName: "并发限制", configValue: "10", description: "最大并发呼叫数限制", updateTime: "2026-07-10 15:15:00" },
  { id: 7, configName: "录音保存", configValue: "开启", description: "是否保存通话录音", updateTime: "2026-07-11 15:16:00" },
  { id: 8, configName: "呼叫时段开始", configValue: "09:00", description: "允许呼叫开始时间", updateTime: "2026-07-12 15:17:00" },
  { id: 9, configName: "呼叫时段结束", configValue: "21:00", description: "允许呼叫结束时间", updateTime: "2026-07-13 15:18:00" },
  { id: 10, configName: "线路类型", configValue: "双向线路", description: "语音通话线路类型", updateTime: "2026-07-14 15:19:00" },
];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("系统管理", "外呼平台配置")}
      pageTitle="外呼平台配置"
      searchFields={[
        { label: "配置名称", type: "input", placeholder: "请输入配置名称" },
      ]}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: data.length }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
