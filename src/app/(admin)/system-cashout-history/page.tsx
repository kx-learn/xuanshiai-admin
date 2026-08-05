"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "申请人", key: "applicant" },
  {
    title: "提现金额",
    key: "amount",
    render: (row: Record<string, unknown>) => (
      <span className="font-medium text-[#ff4d4f]">¥{String(row.amount)}</span>
    ),
  },
  { title: "银行卡号", key: "bankCard" },
  { title: "申请时间", key: "applyTime" },
  {
    title: "状态",
    key: "status",
    width: 80,
    render: (row: Record<string, unknown>) => {
      const status = String(row.status ?? "");
      const colorMap: Record<string, string> = {
        "待处理": "inline-block px-2 py-0.5 text-xs rounded bg-[#fff7e6] text-[#fa8c16] border border-[#ffd591]",
        "已完成": "inline-block px-2 py-0.5 text-xs rounded bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]",
        "已拒绝": "inline-block px-2 py-0.5 text-xs rounded bg-[#fff1f0] text-[#ff4d4f] border border-[#ffa39e]",
      };
      return <span className={colorMap[status] || ""}>{status}</span>;
    },
  },
  {
    title: "操作",
    key: "action",
    width: 140,
    render: (row: Record<string, unknown>) => {
      const status = String(row.status ?? "");
      if (status === "待处理") {
        return (
          <span className="flex items-center gap-2">
            <button type="button" className="text-[#52c41a] hover:text-[#73d13d] text-sm cursor-pointer bg-transparent border-none p-0">通过</button>
            <button type="button" className="text-[#ff4d4f] hover:text-[#ff7875] text-sm cursor-pointer bg-transparent border-none p-0">拒绝</button>
          </span>
        );
      }
      return (
        <span className="flex items-center gap-2">
          <button type="button" className="text-[#3658f7] hover:text-[#5281f3] text-sm cursor-pointer bg-transparent border-none p-0">查看</button>
        </span>
      );
    },
  },
];

const allData: Record<string, unknown>[] = [
  { id: 1, applicant: "张三", amount: 500, bankCard: "****6789", applyTime: "2026-07-14 09:00:00", status: "待处理" },
  { id: 2, applicant: "李四", amount: 1000, bankCard: "****6790", applyTime: "2026-07-13 10:13:00", status: "待处理" },
  { id: 3, applicant: "王五", amount: 200, bankCard: "****6791", applyTime: "2026-07-12 11:26:00", status: "待处理" },
  { id: 4, applicant: "赵六", amount: 3000, bankCard: "****6792", applyTime: "2026-07-11 12:39:00", status: "待处理" },
  { id: 5, applicant: "孙七", amount: 1500, bankCard: "****6793", applyTime: "2026-07-10 13:52:00", status: "已完成" },
  { id: 6, applicant: "周八", amount: 800, bankCard: "****6794", applyTime: "2026-07-09 14:05:00", status: "已完成" },
  { id: 7, applicant: "吴九", amount: 2000, bankCard: "****6795", applyTime: "2026-07-08 15:18:00", status: "已完成" },
  { id: 8, applicant: "郑十", amount: 5000, bankCard: "****6796", applyTime: "2026-07-07 16:31:00", status: "已完成" },
  { id: 9, applicant: "钱十一", amount: 600, bankCard: "****6797", applyTime: "2026-07-06 17:44:00", status: "已完成" },
  { id: 10, applicant: "刘十二", amount: 1200, bankCard: "****6798", applyTime: "2026-07-05 18:57:00", status: "已拒绝" },
  { id: 11, applicant: "陈十三", amount: 3500, bankCard: "****6799", applyTime: "2026-07-04 19:10:00", status: "已拒绝" },
  { id: 12, applicant: "杨十四", amount: 250, bankCard: "****6800", applyTime: "2026-07-03 20:23:00", status: "已拒绝" },
];

export default function SystemCashoutHistoryPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("财务管理", "余额提现")}
      pageTitle="余额提现"
      columns={columns}
      dataSource={allData}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: allData.length }}
      tabs={[
        { key: "all", label: "全部" },
        { key: "pending", label: "待处理" },
        { key: "completed", label: "已完成" },
        { key: "rejected", label: "已拒绝" },
      ]}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
