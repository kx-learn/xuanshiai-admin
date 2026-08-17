"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type ActionButton, type SearchField } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70, align: "center" },
  { title: "规则名称", key: "ruleName" },
  {
    title: "分派方式",
    key: "distributionType",
    width: 100,
    render: (row: Record<string, unknown>) => {
      const type = String(row.distributionType ?? "");
      return (
        <span className={type === "自动" ? "inline-block px-2 py-0.5 text-xs rounded bg-[#edf2ff] text-[#3658f7] border border-[#adc6ff]" : "inline-block px-2 py-0.5 text-xs rounded bg-[#fff7e6] text-[#fa8c16] border border-[#ffd591]"}>
          {type}
        </span>
      );
    },
  },
  { title: "适用门店", key: "applicableStore", width: 140 },
  { title: "创建时间", key: "createTime", width: 180 },
  {
    title: "状态",
    key: "status",
    width: 80,
    render: (row: Record<string, unknown>) => {
      const status = String(row.status ?? "");
      const isActive = status === "启用";
      return (
        <span className={isActive ? "inline-block px-2 py-0.5 text-xs rounded bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]" : "inline-block px-2 py-0.5 text-xs rounded bg-[#f5f5f5] text-[#999] border border-[#d9d9d9]"}>
          {status}
        </span>
      );
    },
  },
  {
    title: "操作",
    key: "action",
    width: 120,
    render: () => (
      <span className="flex items-center gap-2">
        <span className="text-[#3658f7] cursor-pointer hover:underline text-xs">编辑</span>
        <span className="text-[#ff4d4f] cursor-pointer hover:underline text-xs">删除</span>
      </span>
    ),
  },
];

interface ApportionRow {
  id: number;
  ruleName: string;
  distributionType: string;
  applicableStore: string;
  createTime: string;
  status: string;
}

const data: ApportionRow[] = [];

const searchFields: SearchField[] = [
  { label: "配置名称", type: "input", placeholder: "请输入配置名称", width: 180 },
];

const actions: ActionButton[] = [
  { label: "新增规则", variant: "primary" },
];

const dataSource = data as unknown as Record<string, unknown>[];

export default function LoveMatchmakerApportionPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("总店红娘", "分派配置")}
      pageTitle="分派配置"
      searchFields={searchFields}
      actions={actions}
      columns={columns}
      dataSource={dataSource}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
