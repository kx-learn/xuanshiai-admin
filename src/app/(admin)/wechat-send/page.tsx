"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "群发内容", key: "content" },
  { title: "目标人群", key: "targetGroup" },
  { title: "发送时间", key: "sendTime" },
  { title: "状态", key: "status", width: 80, align: "center" },
  { title: "操作", key: "action", width: 140, align: "center" },
];

const data: Record<string, unknown>[] = [
  { id: 1, content: "七夕脱单派对报名开始啦!限时优惠中...", targetGroup: "全部粉丝", sendTime: "2026-07-13 10:00:00", status: "已发送", action: "删除" },
  { id: 2, content: "尊敬的VIP会员,您有一份专属推荐请查收", targetGroup: "VIP会员", sendTime: "2026-07-12 10:00:00", status: "已发送", action: "删除" },
  { id: 3, content: "平台新功能上线通知:实名认证全面升级", targetGroup: "全部粉丝", sendTime: "2026-07-11 10:00:00", status: "已发送", action: "删除" },
  { id: 4, content: "周末相亲角活动火热报名中,名额有限", targetGroup: "注册用户", sendTime: "2026-07-10 10:00:00", status: "已发送", action: "删除" },
  { id: 5, content: "积分商城上新,多重好礼等您来兑", targetGroup: "全部粉丝", sendTime: "2026-07-09 10:00:00", status: "已发送", action: "删除" },
  { id: 6, content: "恋爱公开课第三期:如何建立健康的亲密关系", targetGroup: "注册用户", sendTime: "2026-07-08 10:00:00", status: "已发送", action: "删除" },
  { id: 7, content: "春节联谊活动预报名通道已开启", targetGroup: "VIP会员", sendTime: "未发送", status: "发送中", action: "删除" },
  { id: 8, content: "会员权益升级通知:新增多项特权", targetGroup: "VIP会员", sendTime: "未发送", status: "发送中", action: "删除" },
  { id: 9, content: "紧急通知:系统维护公告(7月20日0点-6点)", targetGroup: "全部粉丝", sendTime: "未发送", status: "待发送", action: "发送 删除" },
  { id: 10, content: "520脱单节活动倒计时,立即参与", targetGroup: "全部粉丝", sendTime: "未发送", status: "待发送", action: "发送 删除" },
  { id: 11, content: "合作单位专场相亲会邀请函", targetGroup: "注册用户", sendTime: "未发送", status: "草稿", action: "编辑 删除" },
  { id: 12, content: "平台周年庆,全场VIP会员8折优惠", targetGroup: "全部粉丝", sendTime: "未发送", status: "草稿", action: "编辑 删除" },
];

export default function WechatSendPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("公众号", "消息群发")}
      pageTitle="消息群发"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 12 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
