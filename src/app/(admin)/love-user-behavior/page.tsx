"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "会员昵称", key: "nickname" },
  { title: "行为类型", key: "behaviorType" },
  { title: "目标对象", key: "target" },
  { title: "时间", key: "time" },
  { title: "IP地址", key: "ip" },
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

export default function LoveUserBehaviorPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("会员CRM", "线上行为")}
      pageTitle="线上行为"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: data.length }}
      searchFields={[
        { label: "会员昵称", type: "input", placeholder: "请输入会员昵称" },
        {
          label: "行为类型",
          type: "select",
          options: [
            { label: "全部", value: "" },
            { label: "浏览", value: "browse" },
            { label: "发消息", value: "message" },
            { label: "送礼物", value: "gift" },
            { label: "关注", value: "follow" },
          ],
        },
        { label: "时间范围", type: "dateRange" },
      ]}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
