"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef, type ActionButton, type SearchField } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "红娘", key: "matchmaker", width: 180 },
  { title: "手机/微信", key: "phone", width: 160 },
  { title: "角色", key: "role", width: 120 },
  { title: "分成级别", key: "shareLevel", width: 100 },
  { title: "牵线成功数", key: "successCount", width: 100 },
  { title: "累积分成", key: "totalShare", width: 100 },
  {
    title: "锁定",
    key: "locked",
    width: 70,
    render: (row: Record<string, unknown>) => {
      const val = String(row.locked ?? "");
      return (
        <span style={{ color: val === "正常" ? "#52c41a" : "#ff4d4f" }}>
          {val}
        </span>
      );
    },
  },
  {
    title: "前台展示",
    key: "show",
    width: 80,
  },
  { title: "菜单权限", key: "menuPermission", width: 100 },
  { title: "操作", key: "action", width: 260 },
];

const data: Record<string, unknown>[] = [
  {
    id: 1,
    matchmaker: "称呼：芸希老师\n账号：芸希老师\n隶属：总店\n描述：-",
    phone: "17384472282\n17384472282",
    role: "总店-超级红娘",
    shareLevel: "中级分成",
    successCount: "21人",
    totalShare: "509元",
    locked: "正常",
    show: "显示",
    menuPermission: "菜单管理",
    action: "红娘平台 数据报表 海报 编辑 删除",
  },
];

const searchFields: SearchField[] = [
  { label: "红娘姓名", type: "input", placeholder: "请输入红娘姓名", width: 160 },
  { label: "手机号", type: "input", placeholder: "请输入手机号", width: 160 },
  { label: "角色", type: "select", placeholder: "全部", options: [{ label: "全部", value: "" }, { label: "超级红娘", value: "super" }, { label: "普通红娘", value: "normal" }], width: 120 },
];

const actions: ActionButton[] = [
  { label: "添加红娘", variant: "primary" },
];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("总店红娘", "红娘管理（总店）")}
      pageTitle="红娘管理（总店）"
      searchFields={searchFields}
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 1 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
