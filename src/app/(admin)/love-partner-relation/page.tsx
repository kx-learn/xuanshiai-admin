"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type SearchField } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 70, align: "center" },
  { title: "上级合伙人", key: "parentPartner", width: 160 },
  { title: "下级合伙人", key: "childPartner", width: 160 },
  {
    title: "关系层级",
    key: "level",
    width: 100,
    render: (row: Record<string, unknown>) => {
      const level = row.level as string;
      let cls = "inline-block px-2 py-0.5 text-xs rounded";
      if (level === "一级") cls += " bg-[#edf2ff] text-[#3658f7] border border-[#adc6ff]";
      else if (level === "二级") cls += " bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]";
      else cls += " bg-[#fff7e6] text-[#fa8c16] border border-[#ffd591]";
      return <span className={cls}>{level}</span>;
    },
  },
  { title: "创建时间", key: "createTime", width: 180 },
  {
    title: "操作",
    key: "action",
    width: 120,
    render: () => (
      <span className="flex items-center gap-2">
        <span className="text-[#3658f7] cursor-pointer hover:underline">编辑</span>
        <span className="text-[#ff4d4f] cursor-pointer hover:underline">删除</span>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [];

const searchFields: SearchField[] = [
  { label: "上级合伙人", type: "input", placeholder: "请输入", width: 160 },
  { label: "下级合伙人", type: "input", placeholder: "请输入", width: 160 },
];

export default function LovePartnerRelationPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("合伙红娘", "团队关系")}
      pageTitle="团队关系"
      searchFields={searchFields}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
