"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type ActionButton, type TabConfig } from "@/components/ListPage";

const tabs: TabConfig[] = [
  { key: "all", label: "全部" },
  { key: "active", label: "在职" },
  { key: "inactive", label: "离职" },
];

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70, align: "center" },
  { title: "姓名", key: "name", width: 120 },
  { title: "手机号", key: "phone", width: 140 },
  {
    title: "推广渠道",
    key: "channel",
    width: 120,
    render: (row: Record<string, unknown>) => {
      const channel = String(row.channel ?? "");
      return (
        <span className="inline-block px-2 py-0.5 text-xs rounded bg-[#edf2ff] text-[#3658f7] border border-[#adc6ff]">
          {channel}
        </span>
      );
    },
  },
  { title: "推广会员数", key: "memberCount", width: 120, align: "center" },
  { title: "入职时间", key: "joinDate", width: 140 },
  {
    title: "状态",
    key: "status",
    width: 80,
    render: (row: Record<string, unknown>) => {
      const status = String(row.status ?? "");
      const isActive = status === "在职";
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
        <span className="text-[#3658f7] cursor-pointer hover:underline text-xs">查看</span>
      </span>
    ),
  },
];

interface MatchmakerRow {
  id: number;
  name: string;
  phone: string;
  channel: string;
  memberCount: number;
  joinDate: string;
  status: string;
}

const data: MatchmakerRow[] = [];

const actions: ActionButton[] = [
  { label: "添加推广红娘", variant: "primary" },
];

const dataSource = data as unknown as Record<string, unknown>[];

export default function PoploveMatchmakerListPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("推广红娘", "推广红娘管理")}
      pageTitle="推广红娘管理"
      tabs={tabs}
      activeTab="all"
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
