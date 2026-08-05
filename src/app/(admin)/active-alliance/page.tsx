"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "更新内容", key: "content", width: 500 },
  { title: "更新时间", key: "time", width: 180 },
];

const data: Record<string, unknown>[] = [
  { id: 1, content: "新功能新增了客户婚姻状态查询功能", time: "2026-07-08 09:11:03" },
  { id: 2, content: "细节改进会员资料页进行了全新改版", time: "2026-07-08 09:09:47" },
  { id: 3, content: "功能升级新增了账号注销功能", time: "2026-07-08 09:08:17" },
  { id: 4, content: "新功能线上互选活动使用指南", time: "2025-05-25 12:57:20" },
  { id: 5, content: "细节改进后台平台账号-账号管理的注销申请TAB内，新增了账号注销流程图示链接", time: "2026-07-08 09:54:14" },
  { id: 6, content: "细节改进前台会员中心关注平台和用户协议页面进行了更新", time: "2026-07-08 09:51:34" },
  { id: 7, content: "细节改进小程序首页去除了「开通会员」文字", time: "2026-07-08 09:41:35" },
  { id: 8, content: "细节改进会员管理页面顶部的「来源」修改为了「登记」，以保持页面统一", time: "2026-07-08 09:39:18" },
  { id: 9, content: "功能升级会员CRM-会员资料管理中vip项改进为了可多选", time: "2026-07-08 09:37:43" },
  { id: 10, content: "功能升级红娘平台增加了-云端素材库", time: "2026-07-08 09:36:52" },
];

const actions: ActionButton[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("商家联盟", "运营方案")}
      pageTitle="运营方案"
      searchFields={[
        { label: "关键词", type: "input", placeholder: "输入关键词搜索", width: 200 },
      ]}
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 765 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
