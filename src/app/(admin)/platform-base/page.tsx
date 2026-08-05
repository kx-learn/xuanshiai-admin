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

const categoryData: Record<string, Record<string, unknown>[]> = {
  career: [
    { id: 1, label: "IT/互联网", sortOrder: 1, status: "启用", action: "编辑 删除" },
    { id: 2, label: "金融/保险", sortOrder: 2, status: "启用", action: "编辑 删除" },
    { id: 3, label: "教育/培训", sortOrder: 3, status: "启用", action: "编辑 删除" },
    { id: 4, label: "医疗/健康", sortOrder: 4, status: "启用", action: "编辑 删除" },
    { id: 5, label: "政府/事业", sortOrder: 5, status: "启用", action: "编辑 删除" },
    { id: 6, label: "销售/市场", sortOrder: 6, status: "启用", action: "编辑 删除" },
    { id: 7, label: "艺术/设计", sortOrder: 7, status: "启用", action: "编辑 删除" },
    { id: 8, label: "自由职业", sortOrder: 8, status: "启用", action: "编辑 删除" },
    { id: 9, label: "制造业", sortOrder: 9, status: "停用", action: "编辑 删除" },
    { id: 10, label: "其他", sortOrder: 10, status: "启用", action: "编辑 删除" },
  ],
  education: [
    { id: 1, label: "初中及以下", sortOrder: 1, status: "启用", action: "编辑 删除" },
    { id: 2, label: "高中/中专", sortOrder: 2, status: "启用", action: "编辑 删除" },
    { id: 3, label: "大专", sortOrder: 3, status: "启用", action: "编辑 删除" },
    { id: 4, label: "本科", sortOrder: 4, status: "启用", action: "编辑 删除" },
    { id: 5, label: "硕士", sortOrder: 5, status: "启用", action: "编辑 删除" },
    { id: 6, label: "博士", sortOrder: 6, status: "启用", action: "编辑 删除" },
    { id: 7, label: "博士后", sortOrder: 7, status: "停用", action: "编辑 删除" },
  ],
  income: [
    { id: 1, label: "5万以下", sortOrder: 1, status: "启用", action: "编辑 删除" },
    { id: 2, label: "5-10万", sortOrder: 2, status: "启用", action: "编辑 删除" },
    { id: 3, label: "10-20万", sortOrder: 3, status: "启用", action: "编辑 删除" },
    { id: 4, label: "20-30万", sortOrder: 4, status: "启用", action: "编辑 删除" },
    { id: 5, label: "30-50万", sortOrder: 5, status: "启用", action: "编辑 删除" },
    { id: 6, label: "50-100万", sortOrder: 6, status: "启用", action: "编辑 删除" },
    { id: 7, label: "100万以上", sortOrder: 7, status: "启用", action: "编辑 删除" },
  ],
  marriage: [
    { id: 1, label: "未婚", sortOrder: 1, status: "启用", action: "编辑 删除" },
    { id: 2, label: "离异", sortOrder: 2, status: "启用", action: "编辑 删除" },
    { id: 3, label: "丧偶", sortOrder: 3, status: "启用", action: "编辑 删除" },
    { id: 4, label: "已婚", sortOrder: 4, status: "停用", action: "编辑 删除" },
  ],
  house: [
    { id: 1, label: "已购房(有贷款)", sortOrder: 1, status: "启用", action: "编辑 删除" },
    { id: 2, label: "已购房(无贷款)", sortOrder: 2, status: "启用", action: "编辑 删除" },
    { id: 3, label: "租房", sortOrder: 3, status: "启用", action: "编辑 删除" },
    { id: 4, label: "与父母同住", sortOrder: 4, status: "启用", action: "编辑 删除" },
    { id: 5, label: "单位宿舍", sortOrder: 5, status: "启用", action: "编辑 删除" },
  ],
  car: [
    { id: 1, label: "已购车", sortOrder: 1, status: "启用", action: "编辑 删除" },
    { id: 2, label: "未购车", sortOrder: 2, status: "启用", action: "编辑 删除" },
    { id: 3, label: "计划购车", sortOrder: 3, status: "启用", action: "编辑 删除" },
  ],
};

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
