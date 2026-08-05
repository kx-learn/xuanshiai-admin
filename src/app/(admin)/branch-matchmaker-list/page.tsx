"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type SearchField, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "红娘", key: "name", width: 120 },
  { title: "手机/微信", key: "phone", width: 150 },
  { title: "角色", key: "role", width: 100 },
  { title: "隶属门店", key: "store", width: 150 },
  {
    title: "锁定",
    key: "locked",
    width: 80,
    align: "center",
    render: (row: Record<string, unknown>) => {
      const locked = row.locked as boolean;
      return (
        <span className={`inline-block px-2 py-0.5 text-xs rounded ${locked ? "bg-[#fff2f0] text-[#ff4d4f] border border-[#ffccc7]" : "bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]"}`}>
          {locked ? "是" : "否"}
        </span>
      );
    },
  },
  {
    title: "前台展示",
    key: "showFront",
    width: 90,
    align: "center",
    render: (row: Record<string, unknown>) => {
      const show = row.showFront as boolean;
      return (
        <span className={`inline-block px-2 py-0.5 text-xs rounded ${show ? "bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]" : "bg-[#f5f5f5] text-[#999] border border-[#d9d9d9]"}`}>
          {show ? "是" : "否"}
        </span>
      );
    },
  },
  { title: "菜单权限", key: "menuPermission", width: 120 },
  {
    title: "操作",
    key: "action",
    width: 120,
    render: (_row: Record<string, unknown>) => (
      <span className="flex items-center gap-2">
        <button className="text-[#3658f7] hover:text-[#6b85ff] text-sm">编辑</button>
        <button className="text-[#3658f7] hover:text-[#6b85ff] text-sm">查看</button>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [];

const searchFields: SearchField[] = [
  { label: "红娘姓名", type: "input", placeholder: "请输入红娘姓名", width: 160 },
  { label: "所属门店", type: "select", options: [{ label: "全部", value: "" }], width: 140 },
];

const actions: ActionButton[] = [
  { label: "添加红娘", variant: "primary", onClick: () => {} },
];

export default function BranchMatchmakerListPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("分店管理", "分店红娘")}
      pageTitle="分店红娘"
      searchFields={searchFields}
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
