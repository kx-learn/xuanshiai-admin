"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "会员", key: "nickname" }, { title: "跟进方式", key: "method" },
  { title: "跟进内容", key: "content" }, { title: "下次跟进", key: "next_follow_at" }, { title: "跟进时间", key: "created_at" },
];

export default function LoveUserFollowUpPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("会员CRM", "跟进全览")}
      pageTitle="会员跟进全览"
      columns={columns}
      dataSource={[]}
      rowKey="id"
      endpoint="/api/backend/admin/members/follow-ups"
      pagination={{ current: 1, pageSize: 20, total: 0 }}
      searchFields={[
        { label: "会员昵称", type: "input", placeholder: "请输入会员昵称" },
        { label: "红娘", type: "input", placeholder: "请输入红娘姓名" },
        { label: "时间范围", type: "dateRange" },
      ]}
      onSearch={() => undefined}
      onReset={() => undefined}
    />
  );
}
