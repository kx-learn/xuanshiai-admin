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
  { id: 1, configName: "合同有效期", configValue: "365天", description: "合同默认有效期限", updateTime: "2026-07-10 09:30:00" },
  { id: 2, configName: "签署方式", configValue: "电子签章", description: "合同签署认证方式", updateTime: "2026-07-10 09:31:00" },
  { id: 3, configName: "自动续签", configValue: "关闭", description: "到期是否自动续签", updateTime: "2026-07-10 09:32:00" },
  { id: 4, configName: "签署提醒", configValue: "提前7天", description: "合同到期前提醒天数", updateTime: "2026-07-10 09:33:00" },
  { id: 5, configName: "模板审批", configValue: "需要审批", description: "模板是否需要审批", updateTime: "2026-07-10 09:34:00" },
  { id: 6, configName: "合同编号规则", configValue: "HT-{YYYY}-{NNNN}", description: "合同编号生成规则", updateTime: "2026-07-11 09:35:00" },
  { id: 7, configName: "水印设置", configValue: "开启", description: "签署文档水印设置", updateTime: "2026-07-11 09:36:00" },
  { id: 8, configName: "超时自动取消", configValue: "72小时", description: "签署超时自动取消时间", updateTime: "2026-07-12 09:37:00" },
  { id: 9, configName: "签署顺序", configValue: "顺序签署", description: "多方签署顺序规则", updateTime: "2026-07-13 09:38:00" },
  { id: 10, configName: "归档方式", configValue: "自动归档", description: "已完成合同归档方式", updateTime: "2026-07-14 09:39:00" },
];

export default function EContractConfigPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("财务管理", "合同配置")}
      pageTitle="合同配置"
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
