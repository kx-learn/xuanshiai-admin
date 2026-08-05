"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "配置项", key: "configKey" },
  { title: "配置内容", key: "configValue" },
  { title: "操作", key: "action", width: 100, align: "center" },
];

const data: Record<string, unknown>[] = [
  { id: 1, configKey: "首页标题", configValue: "宣誓爱 - 找对象,上宣誓爱", action: "编辑" },
  { id: 2, configKey: "首页描述", configValue: "宣誓爱婚恋平台，专业的婚恋交友服务，海量优质会员，真实可靠", action: "编辑" },
  { id: 3, configKey: "底部版权信息", configValue: "Copyright 2026 宣誓爱婚恋平台 All Rights Reserved", action: "编辑" },
  { id: 4, configKey: "客服电话", configValue: "400-123-4567", action: "编辑" },
  { id: 5, configKey: "服务时间", configValue: "周一至周日 09:00-21:00", action: "编辑" },
  { id: 6, configKey: "公司地址", configValue: "北京市朝阳区XX路XX号XX大厦12层", action: "编辑" },
];

export default function PlatformContentPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("平台配置", "内容配置")}
      pageTitle="内容配置"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 6 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
