"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type SearchField, type TabConfig } from "@/components/ListPage";

const tabs: TabConfig[] = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待确认" },
  { key: "confirmed", label: "已确认" },
  { key: "rejected", label: "已拒绝" },
];

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60, align: "center" },
  { title: "活动名称", key: "activityName", width: 180 },
  { title: "报名人", key: "signupName", width: 120 },
  { title: "手机号", key: "phone", width: 140 },
  { title: "报名时间", key: "signupTime", width: 180 },
  {
    title: "状态",
    key: "status",
    width: 90,
    render: (row: Record<string, unknown>) => {
      const status = row.status as string;
      let cls = "inline-block px-2 py-0.5 text-xs rounded";
      if (status === "已确认") cls += " bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]";
      else if (status === "已拒绝") cls += " bg-[#fff2f0] text-[#ff4d4f] border border-[#ffccc7]";
      else cls += " bg-[#fffbe6] text-[#faad14] border border-[#ffe58f]";
      return <span className={cls}>{status}</span>;
    },
  },
  {
    title: "操作",
    key: "action",
    width: 120,
    render: () => (
      <span className="flex items-center gap-2">
        <span className="text-[#3658f7] cursor-pointer hover:underline">确认</span>
        <span className="text-[#ff4d4f] cursor-pointer hover:underline">拒绝</span>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [
  { id: 1, activityName: "七夕相亲大会", signupName: "张伟", phone: "138****6789", signupTime: "2026-07-14 08:30:00", status: "待确认" },
  { id: 2, activityName: "青年联谊会", signupName: "李娜", phone: "139****7890", signupTime: "2026-07-13 14:20:00", status: "已确认" },
  { id: 3, activityName: "周末交友派对", signupName: "王芳", phone: "137****8901", signupTime: "2026-07-13 10:15:00", status: "已确认" },
  { id: 4, activityName: "高端相亲沙龙", signupName: "赵敏", phone: "136****9012", signupTime: "2026-07-12 16:45:00", status: "已拒绝" },
  { id: 5, activityName: "七夕相亲大会", signupName: "孙静", phone: "135****0123", signupTime: "2026-07-12 09:00:00", status: "待确认" },
  { id: 6, activityName: "青年联谊会", signupName: "周华", phone: "138****1234", signupTime: "2026-07-11 11:30:00", status: "已确认" },
  { id: 7, activityName: "周末交友派对", signupName: "吴刚", phone: "139****2345", signupTime: "2026-07-11 08:00:00", status: "待确认" },
  { id: 8, activityName: "高端相亲沙龙", signupName: "郑丽", phone: "137****3456", signupTime: "2026-07-10 15:20:00", status: "已确认" },
  { id: 9, activityName: "七夕相亲大会", signupName: "陈峰", phone: "136****4567", signupTime: "2026-07-10 13:10:00", status: "已拒绝" },
  { id: 10, activityName: "青年联谊会", signupName: "林涛", phone: "135****5678", signupTime: "2026-07-09 10:40:00", status: "待确认" },
  { id: 11, activityName: "周末交友派对", signupName: "何静", phone: "138****6780", signupTime: "2026-07-09 09:15:00", status: "已确认" },
  { id: 12, activityName: "高端相亲沙龙", signupName: "刘洋", phone: "139****7891", signupTime: "2026-07-08 14:30:00", status: "待确认" },
];

const searchFields: SearchField[] = [
  { label: "活动名称", type: "input", placeholder: "请输入活动名称", width: 180 },
  { label: "报名人", type: "input", placeholder: "请输入报名人", width: 160 },
  { label: "状态", type: "select", options: [{ label: "全部", value: "" }, { label: "待确认", value: "pending" }, { label: "已确认", value: "confirmed" }, { label: "已拒绝", value: "rejected" }], width: 120 },
  { label: "报名时间", type: "dateRange" },
];

export default function ActiveSignupmanagerPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("活动报名", "活动报名管理")}
      pageTitle="活动报名管理"
      tabs={tabs}
      activeTab="all"
      searchFields={searchFields}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 12 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
