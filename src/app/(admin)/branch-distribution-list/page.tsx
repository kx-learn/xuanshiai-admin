"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type SearchField, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 70, align: "center" },
  { title: "时间", key: "time", width: 170 },
  { title: "分店名称", key: "branchName", width: 130 },
  { title: "红娘", key: "matchmaker", width: 100 },
  { title: "消费会员", key: "member", width: 160 },
  { title: "分成/奖励事件", key: "bonusEvent", width: 130 },
  { title: "消费金额", key: "amount", width: 100, align: "right" },
  { title: "分成金额", key: "bonusAmount", width: 100, align: "right" },
];

const data: Record<string, unknown>[] = [];

const searchFields: SearchField[] = [
  { label: "分店名称", type: "input", placeholder: "请输入分店名称", width: 160 },
  { label: "时间范围", type: "dateRange" },
];

const actions: ActionButton[] = [
  { label: "导出Excel（当前分店）", variant: "primary", onClick: () => {} },
];

export default function BranchDistributionListPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("分店管理", "分成明细")}
      pageTitle="分成明细"
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
