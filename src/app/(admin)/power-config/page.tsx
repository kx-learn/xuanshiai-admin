"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "规则名称", key: "ruleName" },
  { title: "适用角色", key: "applicableRole" },
  { title: "权限内容", key: "permissions" },
  { title: "创建时间", key: "createTime" },
  { title: "状态", key: "status", width: 80, align: "center" },
  { title: "操作", key: "action", width: 140, align: "center" },
];

const data: Record<string, unknown>[] = [
  { id: 1, ruleName: "超级管理员权限", applicableRole: "超级管理员", permissions: "全部权限", createTime: "2026-06-10 09:00:00", status: "启用", action: "编辑 删除" },
  { id: 2, ruleName: "管理员基础权限", applicableRole: "管理员", permissions: "用户/订单/内容管理", createTime: "2026-06-11 09:00:00", status: "启用", action: "编辑 删除" },
  { id: 3, ruleName: "红娘操作权限", applicableRole: "红娘", permissions: "会员/牵线/活动", createTime: "2026-06-12 09:00:00", status: "启用", action: "编辑 删除" },
  { id: 4, ruleName: "财务查看权限", applicableRole: "财务", permissions: "财务/账单/提现", createTime: "2026-06-13 09:00:00", status: "启用", action: "编辑 删除" },
  { id: 5, ruleName: "客服操作权限", applicableRole: "客服", permissions: "工单/客服/反馈", createTime: "2026-06-14 09:00:00", status: "启用", action: "编辑 删除" },
  { id: 6, ruleName: "内容编辑权限", applicableRole: "编辑", permissions: "内容/文章/页面", createTime: "2026-01-10 09:00:00", status: "启用", action: "编辑 删除" },
  { id: 7, ruleName: "审核操作权限", applicableRole: "审核员", permissions: "审核/实名/留言", createTime: "2026-01-11 09:00:00", status: "启用", action: "编辑 删除" },
  { id: 8, ruleName: "运营管理权限", applicableRole: "运营", permissions: "活动/推送/报表", createTime: "2026-01-12 09:00:00", status: "启用", action: "编辑 删除" },
  { id: 9, ruleName: "数据查看权限", applicableRole: "数据分析师", permissions: "数据/统计/导出", createTime: "2026-01-13 09:00:00", status: "启用", action: "编辑 删除" },
  { id: 10, ruleName: "访客浏览权限", applicableRole: "访客", permissions: "浏览", createTime: "2026-01-14 09:00:00", status: "启用", action: "编辑 删除" },
  { id: 11, ruleName: "注册用户权限", applicableRole: "注册用户", permissions: "浏览/评论/收藏", createTime: "2026-01-15 09:00:00", status: "停用", action: "编辑 删除" },
  { id: 12, ruleName: "VIP会员权限", applicableRole: "VIP会员", permissions: "浏览/评论/收藏/牵线", createTime: "2026-01-16 09:00:00", status: "停用", action: "编辑 删除" },
];

export default function PowerConfigPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("平台配置", "权限配置")}
      pageTitle="权限配置"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 12 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
