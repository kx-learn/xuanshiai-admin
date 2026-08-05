"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import { useState } from "react";
import ListPage, { type ColumnDef, type TabConfig } from "@/components/ListPage";

const tabs: TabConfig[] = [
  { key: "basic", label: "基本配置" },
  { key: "mode", label: "运营模式" },
  { key: "guide", label: "信息登记引导页配置" },
  { key: "profile", label: "基本资料登记配置" },
  { key: "private", label: "私密信息登记与展示配置" },
  { key: "filter", label: "筛选功能配置" },
];

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "数据项目", key: "itemName" },
  { title: "是否加入到会员注册流程", key: "inRegister", width: 160, align: "center" },
  { title: "是否展示在编辑资料", key: "inEdit", width: 140, align: "center" },
  { title: "引导文案", key: "guideText" },
  { title: "是否展示在会员详情页", key: "inDetail", width: 140, align: "center" },
  { title: "排序", key: "sort", width: 100, align: "center" },
];

const data: Record<string, unknown>[] = [
  { id: 1, itemName: "民族", inRegister: "", inEdit: "", guideText: "", inDetail: "", sort: "" },
  { id: 2, itemName: "身材体型", inRegister: "", inEdit: "", guideText: "", inDetail: "", sort: "" },
  { id: 3, itemName: "脸型类型", inRegister: "", inEdit: "", guideText: "", inDetail: "", sort: "" },
  { id: 4, itemName: "皮肤类型", inRegister: "", inEdit: "", guideText: "", inDetail: "", sort: "" },
  { id: 5, itemName: "眼睛类型", inRegister: "", inEdit: "", guideText: "", inDetail: "", sort: "" },
  { id: 6, itemName: "恋爱经历", inRegister: "", inEdit: "", guideText: "", inDetail: "", sort: "" },
  { id: 7, itemName: "最长恋爱", inRegister: "", inEdit: "", guideText: "", inDetail: "", sort: "" },
  { id: 8, itemName: "单身时长", inRegister: "", inEdit: "", guideText: "", inDetail: "", sort: "" },
  { id: 9, itemName: "工作情况", inRegister: "", inEdit: "", guideText: "", inDetail: "", sort: "" },
  { id: 10, itemName: "孩子情况", inRegister: "", inEdit: "", guideText: "", inDetail: "", sort: "" },
];

export default function PlatformConfigBasicPage() {
  const [activeTab, setActiveTab] = useState("basic");

  return (
    <ListPage
      breadcrumb={getBreadcrumb("平台配置", "基本配置")}
      pageTitle="基本配置"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 10 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
