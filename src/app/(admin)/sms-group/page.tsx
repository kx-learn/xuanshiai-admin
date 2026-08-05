"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "任务名称", key: "taskName" },
  { title: "创建时间", key: "createTime" },
  { title: "发送对象", key: "target" },
  { title: "手机号码清单", key: "phoneList" },
  { title: "任务状态", key: "taskStatus" },
  { title: "发送统计", key: "sendStats" },
  { title: "发送明细", key: "sendDetail" },
  { title: "操作", key: "action", width: 120 },
];

const data: Record<string, unknown>[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("运营工具", "短信群发")}
      pageTitle="短信群发"
      actions={[
        { label: "创建群发任务", variant: "primary" },
        { label: "短信充值", variant: "primary" },
        { label: "提交群发模板", variant: "primary" },
      ]}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
