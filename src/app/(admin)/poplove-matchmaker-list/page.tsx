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

const data: MatchmakerRow[] = [
  { id: 1, name: "推广赵红", phone: "13712340001", channel: "抖音", memberCount: 85, joinDate: "2024-01-01", status: "在职" },
  { id: 2, name: "推广钱丽", phone: "13712340002", channel: "小红书", memberCount: 120, joinDate: "2024-02-01", status: "在职" },
  { id: 3, name: "推广孙美", phone: "13712340003", channel: "微信", memberCount: 65, joinDate: "2024-03-01", status: "在职" },
  { id: 4, name: "推广李芳", phone: "13712340004", channel: "知乎", memberCount: 42, joinDate: "2024-04-01", status: "在职" },
  { id: 5, name: "推广周雅", phone: "13712340005", channel: "微博", memberCount: 95, joinDate: "2024-05-01", status: "在职" },
  { id: 6, name: "推广吴婷", phone: "13712340006", channel: "快手", memberCount: 110, joinDate: "2024-06-01", status: "在职" },
  { id: 7, name: "推广郑秀", phone: "13712340007", channel: "抖音", memberCount: 78, joinDate: "2024-07-01", status: "在职" },
  { id: 8, name: "推广王琳", phone: "13712340008", channel: "小红书", memberCount: 56, joinDate: "2024-08-01", status: "在职" },
  { id: 9, name: "推广陈静", phone: "13712340009", channel: "微信", memberCount: 32, joinDate: "2024-09-01", status: "在职" },
  { id: 10, name: "推广林萍", phone: "13712340010", channel: "知乎", memberCount: 28, joinDate: "2025-01-01", status: "离职" },
  { id: 11, name: "推广何敏", phone: "13712340011", channel: "微博", memberCount: 45, joinDate: "2025-02-01", status: "离职" },
  { id: 12, name: "推广刘慧", phone: "13712340012", channel: "快手", memberCount: 38, joinDate: "2025-03-01", status: "离职" },
];

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
      pagination={{ current: 1, pageSize: 10, total: 12 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
