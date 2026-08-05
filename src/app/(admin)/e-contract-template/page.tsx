"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "模板名称", key: "templateName" },
  { title: "模板类型", key: "templateType" },
  { title: "创建时间", key: "createTime" },
  {
    title: "状态",
    key: "status",
    width: 80,
    render: (row: Record<string, unknown>) => {
      const status = String(row.status ?? "");
      return (
        <span className={status === "启用" ? "inline-block px-2 py-0.5 text-xs rounded bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]" : "inline-block px-2 py-0.5 text-xs rounded bg-[#f5f5f5] text-[#999] border border-[#d9d9d9]"}>
          {status}
        </span>
      );
    },
  },
  {
    title: "操作",
    key: "action",
    width: 140,
    render: () => (
      <span className="flex items-center gap-2">
        <button type="button" className="text-[#3658f7] hover:text-[#5281f3] text-sm cursor-pointer bg-transparent border-none p-0">编辑</button>
        <button type="button" className="text-[#ff4d4f] hover:text-[#ff7875] text-sm cursor-pointer bg-transparent border-none p-0">删除</button>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [
  { id: 1, templateName: "标准服务合同", templateType: "服务合同", createTime: "2026-06-10 08:30:00", status: "启用" },
  { id: 2, templateName: "VIP会员合同", templateType: "会员合同", createTime: "2026-06-11 08:31:00", status: "启用" },
  { id: 3, templateName: "牵线服务协议", templateType: "服务协议", createTime: "2026-06-12 08:32:00", status: "启用" },
  { id: 4, templateName: "活动参与协议", templateType: "活动协议", createTime: "2026-06-13 08:33:00", status: "启用" },
  { id: 5, templateName: "隐私协议", templateType: "隐私协议", createTime: "2026-06-14 08:34:00", status: "启用" },
  { id: 6, templateName: "用户服务协议", templateType: "用户协议", createTime: "2026-05-10 08:35:00", status: "启用" },
  { id: 7, templateName: "实名认证授权书", templateType: "授权书", createTime: "2026-05-11 08:36:00", status: "启用" },
  { id: 8, templateName: "退款协议", templateType: "退款协议", createTime: "2026-05-12 08:37:00", status: "启用" },
  { id: 9, templateName: "数据授权协议", templateType: "数据协议", createTime: "2026-05-13 08:38:00", status: "停用" },
  { id: 10, templateName: "平台规则确认书", templateType: "规则确认", createTime: "2026-05-14 08:39:00", status: "停用" },
];

export default function EContractTemplatePage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("财务管理", "合同模板")}
      pageTitle="合同模板"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: data.length }}
      actions={[
        { label: "新增模板", variant: "primary" },
      ]}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
