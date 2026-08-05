"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type ActionButton, type SearchField, type TabConfig } from "@/components/ListPage";

const statusTabs: TabConfig[] = [
  { key: "all", label: "全部" },
  { key: "matching", label: "匹配推荐中" },
  { key: "dating", label: "约会进行中" },
  { key: "deepContact", label: "深度接触" },
  { key: "inLove", label: "已经恋爱" },
  { key: "metParents", label: "已见父母" },
  { key: "paused", label: "暂停服务" },
  { key: "breakup", label: "恋爱分手" },
  { key: "married", label: "已经领证" },
];

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 70, align: "center" },
  {
    title: "会员",
    key: "member",
    width: 180,
    render: (row: Record<string, unknown>) => (
      <div className="text-xs leading-relaxed">
        <div className="font-medium">{row.memberName as string}</div>
        <div className="text-[#999]">{row.memberId as string}</div>
      </div>
    ),
  },
  { title: "签约日期", key: "signDate", width: 120 },
  { title: "服务套餐", key: "servicePlan", width: 120 },
  {
    title: "服务进度",
    key: "serviceProgress",
    width: 140,
    render: (row: Record<string, unknown>) => {
      const v = row.serviceProgress as string;
      return (
        <span className={`inline-block px-2 py-0.5 text-xs rounded ${
          v === "已经领证" ? "bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]" :
          v === "服务中" ? "bg-[#e6f7ff] text-[#1890ff] border border-[#91d5ff]" :
          v === "即将到期" ? "bg-[#fff7e6] text-[#fa8c16] border border-[#ffd591]" :
          "bg-[#f5f5f5] text-[#999] border border-[#d9d9d9]"
        }`}>
          {v}
        </span>
      );
    },
  },
  { title: "最近跟进", key: "lastFollowUp", width: 150 },
  {
    title: "合同金额",
    key: "contractAmount",
    width: 100,
    render: (row: Record<string, unknown>) => {
      const v = row.contractAmount as number;
      return <span>{v ? `¥${v.toLocaleString()}` : "-"}</span>;
    },
  },
  { title: "红娘", key: "matchmaker", width: 100 },
  {
    title: "电子合同",
    key: "eContract",
    width: 100,
    align: "center",
    render: () => (
      <span className="text-[#3658f7] cursor-pointer hover:underline text-xs">查看合同</span>
    ),
  },
  { title: "备注信息", key: "remark", width: 150 },
];

const data: Record<string, unknown>[] = [];

const searchFields: SearchField[] = [
  { label: "搜索", type: "input", placeholder: "按昵称搜", width: 180 },
  { label: "服务红娘", type: "select", options: [{ label: "全部服务红娘", value: "" }], width: 150 },
  { label: "销售红娘", type: "select", options: [{ label: "全部销售红娘", value: "" }], width: 150 },
  { label: "签约日期", type: "dateRange" },
];

const actions: ActionButton[] = [
  { label: "添加线下VIP会员", variant: "primary" },
  { label: "业绩报表", variant: "primary" },
  { label: "导出EXCEL", variant: "primary" },
];

export default function LoveUserVipUnderlinePage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("会员CRM", "线下VIP")}
      pageTitle="线下VIP"
      tabs={statusTabs}
      activeTab="all"
      searchFields={searchFields}
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
