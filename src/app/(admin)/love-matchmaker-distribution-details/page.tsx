"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type SearchField } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70, align: "center" },
  { title: "红娘姓名", key: "matchmakerName", width: 120 },
  { title: "订单金额", key: "orderAmount", width: 120 },
  { title: "分成金额", key: "bonusAmount", width: 120 },
  {
    title: "分成类型",
    key: "bonusType",
    width: 120,
    render: (row: Record<string, unknown>) => {
      const type = String(row.bonusType ?? "");
      return (
        <span className="inline-block px-2 py-0.5 text-xs rounded bg-[#edf2ff] text-[#3658f7] border border-[#adc6ff]">
          {type}
        </span>
      );
    },
  },
  { title: "时间", key: "time", width: 180 },
  {
    title: "状态",
    key: "status",
    width: 90,
    render: (row: Record<string, unknown>) => {
      const status = String(row.status ?? "");
      const isSettled = status === "已结算";
      return (
        <span className={isSettled ? "inline-block px-2 py-0.5 text-xs rounded bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]" : "inline-block px-2 py-0.5 text-xs rounded bg-[#fffbe6] text-[#faad14] border border-[#ffe58f]"}>
          {status}
        </span>
      );
    },
  },
];

interface DetailsRow {
  id: number;
  matchmakerName: string;
  orderAmount: number;
  bonusAmount: number;
  bonusType: string;
  time: string;
  status: string;
}

const data: DetailsRow[] = [];

const searchFields: SearchField[] = [
  { label: "红娘姓名", type: "input", placeholder: "请输入红娘姓名", width: 180 },
  { label: "时间范围", type: "dateRange" },
];

const dataSource = data as unknown as Record<string, unknown>[];

export default function LoveMatchmakerDistributionDetailsPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("总店红娘", "分成明细")}
      pageTitle="分成明细"
      searchFields={searchFields}
      columns={columns}
      dataSource={dataSource}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
