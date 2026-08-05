"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "规则名称", key: "ruleName" },
  { title: "关键词", key: "keyword" },
  { title: "回复类型", key: "replyType", width: 80, align: "center" },
  { title: "回复内容", key: "replyContent" },
  { title: "状态", key: "status", width: 80, align: "center" },
  { title: "操作", key: "action", width: 140, align: "center" },
];

const data: Record<string, unknown>[] = [
  { id: 1, ruleName: "关注自动回复", keyword: "[关注]", replyType: "文本", replyContent: "欢迎关注宣誓爱婚恋平台!我是您的专属红娘小助手,有任何问题都可以随时问我～", status: "启用", action: "编辑 删除" },
  { id: 2, ruleName: "关键词-你好", keyword: "你好", replyType: "文本", replyContent: "您好!很高兴为您服务,请告诉我您有什么需求?", status: "启用", action: "编辑 删除" },
  { id: 3, ruleName: "关键词-帮助", keyword: "帮助", replyType: "图文", replyContent: "我们提供以下帮助: 1.如何注册 2.如何牵线 3.VIP权益 请回复数字获取帮助", status: "启用", action: "编辑 删除" },
  { id: 4, ruleName: "关键词-活动", keyword: "活动", replyType: "图文", replyContent: "七夕脱单派对 8月10日重磅来袭", status: "启用", action: "编辑 删除" },
  { id: 5, ruleName: "关键词-会员", keyword: "会员", replyType: "文本", replyContent: "VIP会员享受专属牵线服务、优先推荐权、活动折扣等多重权益。回复\"价格\"了解详情。", status: "启用", action: "编辑 删除" },
  { id: 6, ruleName: "关键词-牵线", keyword: "牵线", replyType: "图文", replyContent: "牵线服务介绍 专业红娘一对一服务", status: "启用", action: "编辑 删除" },
  { id: 7, ruleName: "关键词-价格", keyword: "价格", replyType: "文本", replyContent: "VIP月卡98元,季卡268元,年卡888元。牵线服务199元/次。更多优惠请关注公众号。", status: "启用", action: "编辑 删除" },
  { id: 8, ruleName: "关键词-客服", keyword: "客服", replyType: "文本", replyContent: "正在为您转接人工客服,请稍候...工作时间:9:00-21:00", status: "启用", action: "编辑 删除" },
  { id: 9, ruleName: "关键词-电话", keyword: "电话", replyType: "文本", replyContent: "客服热线:400-123-4567,工作时间:9:00-21:00", status: "启用", action: "编辑 删除" },
  { id: 10, ruleName: "默认回复", keyword: "[默认]", replyType: "文本", replyContent: "您的问题小助手暂时无法解答,请回复\"客服\"转接人工服务。", status: "启用", action: "编辑 删除" },
  { id: 11, ruleName: "关键词-地址", keyword: "地址", replyType: "文本", replyContent: "公司地址:XX市XX区XX路XX号XX大厦12层", status: "停用", action: "编辑 删除" },
  { id: 12, ruleName: "关键词-注册", keyword: "注册", replyType: "图文", replyContent: "快速注册 开启你的寻爱之旅", status: "停用", action: "编辑 删除" },
];

export default function WechatAutoreplyPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("公众号", "自动回复")}
      pageTitle="自动回复"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 12 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
