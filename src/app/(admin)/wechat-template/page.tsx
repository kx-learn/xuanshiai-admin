"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "模板名称", key: "templateName" },
  { title: "模板ID", key: "templateId" },
  { title: "模板类型", key: "templateType" },
  { title: "创建时间", key: "createTime" },
  { title: "状态", key: "status", width: 80, align: "center" },
  { title: "操作", key: "action", width: 100, align: "center" },
];

const data: Record<string, unknown>[] = [
  { id: 1, templateName: "新用户注册通知", templateId: "TM10001", templateType: "通知类", createTime: "2026-06-10 10:00:00", status: "启用", action: "编辑" },
  { id: 2, templateName: "会员到期提醒", templateId: "TM10002", templateType: "提醒类", createTime: "2026-06-11 10:00:00", status: "启用", action: "编辑" },
  { id: 3, templateName: "牵线匹配通知", templateId: "TM10003", templateType: "通知类", createTime: "2026-06-12 10:00:00", status: "启用", action: "编辑" },
  { id: 4, templateName: "活动报名成功", templateId: "TM10004", templateType: "通知类", createTime: "2026-06-13 10:00:00", status: "启用", action: "编辑" },
  { id: 5, templateName: "实名认证通过", templateId: "TM10005", templateType: "通知类", createTime: "2026-06-14 10:00:00", status: "启用", action: "编辑" },
  { id: 6, templateName: "积分变动通知", templateId: "TM10006", templateType: "通知类", createTime: "2026-01-15 10:00:00", status: "启用", action: "编辑" },
  { id: 7, templateName: "余额变动通知", templateId: "TM10007", templateType: "通知类", createTime: "2026-01-16 10:00:00", status: "启用", action: "编辑" },
  { id: 8, templateName: "合同签署通知", templateId: "TM10008", templateType: "通知类", createTime: "2026-01-17 10:00:00", status: "启用", action: "编辑" },
  { id: 9, templateName: "订单支付成功", templateId: "TM10009", templateType: "通知类", createTime: "2026-01-18 10:00:00", status: "启用", action: "编辑" },
  { id: 10, templateName: "退款成功通知", templateId: "TM10010", templateType: "通知类", createTime: "2026-01-19 10:00:00", status: "启用", action: "编辑" },
  { id: 11, templateName: "系统公告推送", templateId: "TM10011", templateType: "公告类", createTime: "2026-01-20 10:00:00", status: "停用", action: "编辑" },
  { id: 12, templateName: "生日祝福推送", templateId: "TM10012", templateType: "营销类", createTime: "2026-01-21 10:00:00", status: "停用", action: "编辑" },
];

export default function WechatTemplatePage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("公众号", "模板消息")}
      pageTitle="模板消息"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 12 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
