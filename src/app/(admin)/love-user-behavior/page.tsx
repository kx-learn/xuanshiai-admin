"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "会员", key: "nickname" }, { title: "行为类型", key: "event_type" },
  { title: "目标对象", key: "target_nickname" }, { title: "行为详情", key: "detail" }, { title: "时间", key: "occurred_at" },
];

export default function LoveUserBehaviorPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("会员CRM", "线上行为")}
      pageTitle="线上行为"
      columns={columns}
      dataSource={[]}
      rowKey="event_id"
      endpoint="/api/backend/admin/members/behavior/all"
      pagination={{ current: 1, pageSize: 20, total: 0 }}
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
      onSearch={() => undefined}
      onReset={() => undefined}
    />
  );
}
