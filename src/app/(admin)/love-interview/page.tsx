"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef, type ActionButton, type SearchField } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "提交人", key: "submitter", width: 180 },
  { title: "想约见", key: "targetPerson", width: 180 },
  { title: "提交时间", key: "submitTime", width: 160 },
  { title: "红娘", key: "matchmaker", width: 100 },
  {
    title: "状态标记",
    key: "status",
    width: 90,
    render: (row: Record<string, unknown>) => {
      const status = String(row.status ?? "");
      const isPending = status === "待处理";
      return (
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            fontSize: 12,
            borderRadius: 4,
            color: isPending ? "#fa8c16" : "#52c41a",
            backgroundColor: isPending ? "#fff7e6" : "#f6ffed",
            border: `1px solid ${isPending ? "#ffd591" : "#b7eb8f"}`,
          }}
        >
          {status}
        </span>
      );
    },
  },
  { title: "操作", key: "action", width: 200 },
];

const data: Record<string, unknown>[] = [
  { id: 14, submitter: "出现1\n(编号：B241050)", targetPerson: "余生请指教\n(编号：G519122)", submitTime: "2026-07-09 09:42:45", matchmaker: "", status: "待处理", action: "添加约会记录 删除记录" },
  { id: 13, submitter: "李会强\n(编号：B134461)", targetPerson: "你芝士甘薯么呢\n(编号：G674881)", submitTime: "2026-06-28 13:58:35", matchmaker: "琴琴", status: "已处理", action: "添加约会记录 删除记录" },
  { id: 12, submitter: "毛毛\n(编号：G765914)", targetPerson: "李会强\n(编号：B134461)", submitTime: "2026-06-27 11:04:06", matchmaker: "芸希老师", status: "已处理", action: "添加约会记录 删除记录" },
  { id: 11, submitter: "Z\n(编号：G583088)", targetPerson: "出现\n(编号：B118408)", submitTime: "2026-06-04 14:58:00", matchmaker: "芸希老师", status: "已处理", action: "添加约会记录 删除记录" },
  { id: 10, submitter: "出现\n(编号：B118408)", targetPerson: "Z\n(编号：G583088)", submitTime: "2026-06-04 14:29:14", matchmaker: "芸希老师", status: "已处理", action: "添加约会记录 删除记录" },
  { id: 9, submitter: "出现\n(编号：B118408)", targetPerson: "Suntoo\n(编号：G107039)", submitTime: "2026-06-03 14:51:50", matchmaker: "芸希老师", status: "已处理", action: "添加约会记录 删除记录" },
  { id: 8, submitter: "别偷我橘子\n(编号：B329794)", targetPerson: "乐乐\n(编号：G093895)", submitTime: "2026-05-31 16:22:57", matchmaker: "芸希老师", status: "已处理", action: "添加约会记录 删除记录" },
  { id: 7, submitter: "别偷我橘子\n(编号：B329794)", targetPerson: "芒果\n(编号：G964781)", submitTime: "2026-05-31 16:19:53", matchmaker: "芸希老师", status: "已处理", action: "添加约会记录 删除记录" },
];

const searchFields: SearchField[] = [
  { label: "申请人", type: "input", placeholder: "请输入申请人", width: 160 },
  { label: "被申请人", type: "input", placeholder: "请输入被申请人", width: 160 },
  { label: "时间", type: "dateRange" },
];

const actions: ActionButton[] = [
  { label: "添加约见记录", variant: "primary" },
];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("会员服务", "约见申请")}
      pageTitle="约见申请"
      searchFields={searchFields}
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 14 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
