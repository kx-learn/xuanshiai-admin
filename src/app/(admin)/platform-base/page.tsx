"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import { useState } from "react";
import ListPage, { type ColumnDef, type TabConfig } from "@/components/ListPage";

const tabs: TabConfig[] = [
  { key: "career", label: "职业" },
  { key: "education", label: "学历" },
  { key: "income", label: "收入" },
  { key: "marriage", label: "婚姻状况" },
  { key: "house", label: "房产" },
  { key: "car", label: "车辆" },
];

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "选项名称", key: "label" },
  { title: "排序", key: "sortOrder", width: 80, align: "center" },
  { title: "状态", key: "status", width: 80, align: "center" },
  { title: "操作", key: "action", width: 140, align: "center" },
];

const categoryData: Record<string, Record<string, unknown>[]> = { career: [], education: [], income: [], marriage: [], house: [], car: [] };

export default function PlatformBasePage() {
  const [activeTab, setActiveTab] = useState("career");
  const currentData = categoryData[activeTab] || [];

  return (
    <ListPage
      breadcrumb={getBreadcrumb("平台配置", "基础数据")}
      pageTitle="基础数据"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      columns={columns}
      dataSource={currentData}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: currentData.length }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
