"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "会员昵称", key: "nickname" },
  { title: "红娘", key: "matchmaker" },
  { title: "跟进方式", key: "method" },
  {
    title: "跟进内容",
    key: "content",
    render: (row: Record<string, unknown>) => {
      const text = row.content as string;
      return text.length > 30 ? `${text.slice(0, 30)}...` : text;
    },
  },
  { title: "时间", key: "time" },
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

const data: Record<string, unknown>[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  nickname: `会员${3000 + i}`,
  matchmaker: ["王红娘", "赵红娘", "李红娘", "张红娘"][i % 4],
  method: ["电话", "微信", "见面"][i % 3],
  content: `会员跟进记录${["了解择偶要求", "推荐匹配对象", "安排线下见面", "回访约会感受"][i % 4]}的详细描述`,
  time: `2026-07-${String(13 - i).padStart(2, "0")} ${10 + i}:${String((i * 15) % 60).padStart(2, "0")}:00`,
}));

export default function LoveUserFollowUpPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("会员CRM", "跟进全览")}
      pageTitle="会员跟进全览"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: data.length }}
      searchFields={[
        { label: "会员昵称", type: "input", placeholder: "请输入会员昵称" },
        { label: "红娘", type: "input", placeholder: "请输入红娘姓名" },
        { label: "时间范围", type: "dateRange" },
      ]}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
