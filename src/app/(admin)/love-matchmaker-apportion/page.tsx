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

const data: ApportionRow[] = [
  { id: 1, ruleName: "自动分派规则-A", distributionType: "自动", applicableStore: "总店", createTime: "2026-01-01 10:00:00", status: "启用" },
  { id: 2, ruleName: "手动分派规则-B", distributionType: "手动", applicableStore: "朝阳分站", createTime: "2026-02-01 10:01:00", status: "启用" },
  { id: 3, ruleName: "VIP优先分派", distributionType: "自动", applicableStore: "海淀分站", createTime: "2026-03-01 10:02:00", status: "启用" },
  { id: 4, ruleName: "地域优先分派", distributionType: "手动", applicableStore: "西城分站", createTime: "2026-04-01 10:03:00", status: "停用" },
  { id: 5, ruleName: "轮询分派规则", distributionType: "自动", applicableStore: "东城分站", createTime: "2026-05-01 10:04:00", status: "启用" },
  { id: 6, ruleName: "权重分派规则", distributionType: "手动", applicableStore: "总店", createTime: "2026-06-01 10:05:00", status: "启用" },
  { id: 7, ruleName: "时段分派规则", distributionType: "自动", applicableStore: "朝阳分站", createTime: "2026-07-01 10:06:00", status: "启用" },
  { id: 8, ruleName: "等级匹配规则", distributionType: "手动", applicableStore: "海淀分站", createTime: "2026-01-15 10:07:00", status: "启用" },
  { id: 9, ruleName: "随机分派规则", distributionType: "自动", applicableStore: "西城分站", createTime: "2026-02-15 10:08:00", status: "启用" },
  { id: 10, ruleName: "负载均衡规则", distributionType: "手动", applicableStore: "东城分站", createTime: "2026-03-15 10:09:00", status: "启用" },
  { id: 11, ruleName: "偏好分派规则", distributionType: "自动", applicableStore: "总店", createTime: "2026-04-15 10:10:00", status: "启用" },
  { id: 12, ruleName: "就近分派规则", distributionType: "手动", applicableStore: "朝阳分站", createTime: "2026-05-15 10:11:00", status: "启用" },
];

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
      pagination={{ current: 1, pageSize: 10, total: 12 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
