"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "生成项目", key: "projectName" },
  { title: "创建时间", key: "createTime" },
  { title: "操作", key: "action", width: 120 },
];

const data: Record<string, unknown>[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("运营工具", "生成工具")}
      pageTitle="生成工具"
      actions={[
        { label: "生成模板", variant: "primary" },
        { label: "一键复制", variant: "primary" },
      ]}
      searchFields={[
        { label: "会员性别", type: "select", options: [{ label: "全部", value: "" }, { label: "男", value: "male" }, { label: "女", value: "female" }] },
        { label: "婚姻状态", type: "select", options: [{ label: "全部", value: "" }, { label: "未婚", value: "unmarried" }, { label: "离异", value: "divorced" }] },
        { label: "会员级别", type: "select", options: [{ label: "全部", value: "" }, { label: "普通", value: "normal" }, { label: "VIP", value: "vip" }] },
      ]}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
