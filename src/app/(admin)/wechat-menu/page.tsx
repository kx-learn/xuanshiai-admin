"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "菜单名称", key: "menuName" },
  { title: "菜单类型", key: "menuType" },
  { title: "关联内容", key: "relatedContent" },
  { title: "排序", key: "sortOrder", width: 70, align: "center" },
  { title: "操作", key: "action", width: 140, align: "center" },
];

const data: Record<string, unknown>[] = [
  { id: 1, menuName: "关于我们", menuType: "主菜单", relatedContent: "图文消息-平台介绍", sortOrder: 1, action: "编辑 删除" },
  { id: 2, menuName: "找对象", menuType: "主菜单", relatedContent: "小程序-会员搜索页", sortOrder: 2, action: "编辑 删除" },
  { id: 3, menuName: "牵线服务", menuType: "主菜单", relatedContent: "网页-牵线介绍页", sortOrder: 3, action: "编辑 删除" },
  { id: 4, menuName: "活动中心", menuType: "子菜单", relatedContent: "活动列表-最新活动", sortOrder: 4, action: "编辑 删除" },
  { id: 5, menuName: "个人中心", menuType: "子菜单", relatedContent: "小程序-个人中心页", sortOrder: 5, action: "编辑 删除" },
  { id: 6, menuName: "帮助中心", menuType: "子菜单", relatedContent: "图文消息-帮助指南", sortOrder: 6, action: "编辑 删除" },
  { id: 7, menuName: "联系客服", menuType: "子菜单", relatedContent: "客服消息-在线客服", sortOrder: 7, action: "编辑 删除" },
  { id: 8, menuName: "情感课堂", menuType: "子菜单", relatedContent: "图文消息-恋爱技巧", sortOrder: 8, action: "编辑 删除" },
  { id: 9, menuName: "新人注册", menuType: "子菜单", relatedContent: "网页-注册引导页", sortOrder: 9, action: "编辑 删除" },
  { id: 10, menuName: "会员权益", menuType: "子菜单", relatedContent: "图文消息-VIP介绍", sortOrder: 10, action: "编辑 删除" },
  { id: 11, menuName: "最新活动", menuType: "子菜单", relatedContent: "活动列表-热门活动", sortOrder: 11, action: "编辑 删除" },
  { id: 12, menuName: "意见反馈", menuType: "子菜单", relatedContent: "网页-反馈表单", sortOrder: 12, action: "编辑 删除" },
];

export default function WechatMenuPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("公众号", "菜单配置")}
      pageTitle="菜单配置"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 12 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
