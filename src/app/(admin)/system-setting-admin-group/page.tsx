"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "用户组名", key: "groupName" },
  { title: "当前用户", key: "currentUsers" },
  {
    title: "操作",
    key: "action",
    width: 200,
    render: () => (
      <span className="flex items-center gap-2">
        <button className="text-sm text-[#3658f7] hover:text-[#2d4fd6]">编辑</button>
        <button className="text-sm text-[#3658f7] hover:text-[#2d4fd6]">权限管理</button>
        <button className="text-sm text-[#ff4d4f] hover:text-[#ff7875]">删除</button>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [
  { id: 1, groupName: "超级用户组", currentUsers: "admin、shushu" },
  { id: 2, groupName: "一般用户组", currentUsers: "李会强" },
  { id: 3, groupName: "一般运营组", currentUsers: "三土" },
];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("系统管理", "权限分组")}
      pageTitle="权限分组"
      actions={[
        { label: "添加用户组", variant: "primary" },
      ]}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: data.length }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
