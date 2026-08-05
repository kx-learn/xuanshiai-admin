"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "合同编号", key: "contractNo" },
  { title: "签署人", key: "signer" },
  { title: "合同类型", key: "contractType" },
  { title: "签署时间", key: "signTime" },
  {
    title: "状态",
    key: "status",
    width: 80,
    render: (row: Record<string, unknown>) => {
      const status = String(row.status ?? "");
      const colorMap: Record<string, string> = {
        "已签署": "inline-block px-2 py-0.5 text-xs rounded bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]",
        "待签署": "inline-block px-2 py-0.5 text-xs rounded bg-[#fff7e6] text-[#fa8c16] border border-[#ffd591]",
        "已过期": "inline-block px-2 py-0.5 text-xs rounded bg-[#f5f5f5] text-[#999] border border-[#d9d9d9]",
        "已取消": "inline-block px-2 py-0.5 text-xs rounded bg-[#fff1f0] text-[#ff4d4f] border border-[#ffa39e]",
      };
      return <span className={colorMap[status] || ""}>{status}</span>;
    },
  },
  {
    title: "操作",
    key: "action",
    width: 140,
    render: () => (
      <span className="flex items-center gap-2">
        <button type="button" className="text-[#3658f7] hover:text-[#5281f3] text-sm cursor-pointer bg-transparent border-none p-0">查看</button>
        <button type="button" className="text-[#3658f7] hover:text-[#5281f3] text-sm cursor-pointer bg-transparent border-none p-0">下载</button>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [
  { id: 1, contractNo: "HT-2026-1001", signer: "张三", contractType: "VIP会员合同", signTime: "2026-07-13 15:20:00", status: "已签署" },
  { id: 2, contractNo: "HT-2026-1002", signer: "李四", contractType: "牵线服务协议", signTime: "2026-07-12 15:21:00", status: "已签署" },
  { id: 3, contractNo: "HT-2026-1003", signer: "王五", contractType: "活动参与协议", signTime: "2026-07-11 15:22:00", status: "已签署" },
  { id: 4, contractNo: "HT-2026-1004", signer: "赵六", contractType: "实名认证授权书", signTime: "2026-07-10 15:23:00", status: "已签署" },
  { id: 5, contractNo: "HT-2026-1005", signer: "孙七", contractType: "隐私协议", signTime: "2026-07-09 15:24:00", status: "已签署" },
  { id: 6, contractNo: "HT-2026-1006", signer: "周八", contractType: "用户服务协议", signTime: "2026-07-08 15:25:00", status: "已签署" },
  { id: 7, contractNo: "HT-2026-1007", signer: "吴九", contractType: "VIP会员合同", signTime: "-", status: "待签署" },
  { id: 8, contractNo: "HT-2026-1008", signer: "郑十", contractType: "退款协议", signTime: "-", status: "待签署" },
  { id: 9, contractNo: "HT-2026-1009", signer: "钱十一", contractType: "牵线服务协议", signTime: "2026-07-04 15:29:00", status: "已过期" },
  { id: 10, contractNo: "HT-2026-1010", signer: "刘十二", contractType: "数据授权协议", signTime: "2026-07-03 15:30:00", status: "已过期" },
  { id: 11, contractNo: "HT-2026-1011", signer: "陈十三", contractType: "VIP会员合同", signTime: "2026-07-02 15:31:00", status: "已取消" },
  { id: 12, contractNo: "HT-2026-1012", signer: "杨十四", contractType: "活动参与协议", signTime: "2026-07-01 15:32:00", status: "已取消" },
];

export default function EContractListPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("财务管理", "合同管理")}
      pageTitle="合同管理"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: data.length }}
      searchFields={[
        { label: "合同编号", type: "input", placeholder: "请输入合同编号" },
        { label: "会员姓名", type: "input", placeholder: "请输入会员姓名" },
        { label: "状态", type: "select", options: [
          { label: "全部", value: "" },
          { label: "待签署", value: "pending" },
          { label: "已签署", value: "signed" },
          { label: "已过期", value: "expired" },
          { label: "已取消", value: "cancelled" },
        ]},
      ]}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
