"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "sn", width: 70 },
  { title: "操作人", key: "operator" },
  {
    title: "操作类型",
    key: "operationType",
    render: (row: Record<string, unknown>) => {
      const type = String(row.operationType ?? "");
      const colorMap: Record<string, string> = {
        "登录": "text-[#3658f7]",
        "新增": "text-[#52c41a]",
        "编辑": "text-[#fa8c16]",
        "删除": "text-[#ff4d4f]",
        "导出": "text-[#722ed1]",
      };
      return <span className={`font-medium ${colorMap[type] || ""}`}>{type}</span>;
    },
  },
  { title: "操作内容", key: "content" },
  { title: "IP地址", key: "ip" },
  { title: "操作时间", key: "operationTime" },
];

const data: Record<string, unknown>[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("系统管理", "系统日志")}
      pageTitle="系统日志"
      searchFields={[
        { label: "操作人", type: "input", placeholder: "请输入操作人" },
        { label: "操作类型", type: "select", options: [
          { label: "全部", value: "" },
          { label: "登录", value: "login" },
          { label: "新增", value: "create" },
          { label: "编辑", value: "edit" },
          { label: "删除", value: "delete" },
          { label: "导出", value: "export" },
        ]},
        { label: "时间范围", type: "dateRange" },
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
