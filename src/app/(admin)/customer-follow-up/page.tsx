"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "跟进会员", key: "memberName" },
  { title: "跟进红娘", key: "matchmaker" },
  { title: "跟进时间", key: "followTime" },
  { title: "跟进内容", key: "followContent" },
  {
    title: "操作",
    key: "action",
    width: 100,
    render: () => (
      <span className="flex items-center gap-2">
        <button type="button" className="text-[#3658f7] hover:text-[#5281f3] text-sm cursor-pointer bg-transparent border-none p-0">查看</button>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [];

export default function CustomerFollowUpPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("客源线索", "跟进全览")}
      pageTitle="跟进全览"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      searchFields={[
        { label: "跟进会员", type: "input", placeholder: "请输入会员昵称" },
        { label: "跟进红娘", type: "input", placeholder: "请输入红娘姓名" },
        { label: "跟进时间", type: "dateRange" },
      ]}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
