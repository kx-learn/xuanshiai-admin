"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "布局名称", key: "name" },
  { title: "布局描述", key: "description" },
  { title: "状态", key: "status", width: 100, align: "center" },
  { title: "操作", key: "action", width: 100, align: "center" },
];

const data: Record<string, unknown>[] = [
  { id: 1, name: "经典布局", description: "顶部导航+三栏内容区域", status: "当前使用", action: "编辑" },
  { id: 2, name: "简约布局", description: "左侧导航+右侧内容区", status: "未启用", action: "编辑" },
  { id: 3, name: "瀑布流布局", description: "卡片式瀑布流信息展示", status: "未启用", action: "编辑" },
  { id: 4, name: "网格布局", description: "规则网格展示会员卡片", status: "未启用", action: "编辑" },
  { id: 5, name: "杂志布局", description: "类杂志翻页浏览体验", status: "未启用", action: "编辑" },
  { id: 6, name: "列表布局", description: "简洁列表式信息展示", status: "未启用", action: "编辑" },
];

export default function PlatformPagePage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("平台配置", "平台布局")}
      pageTitle="平台布局"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 6 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
