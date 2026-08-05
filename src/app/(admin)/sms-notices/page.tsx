"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "sn", width: 60 },
  { title: "短信通知场景描述", key: "sceneDesc" },
  { title: "短信内容示例（以实际收到信息为准）", key: "contentTemplate" },
  { title: "通知对象", key: "target" },
  {
    title: "状态",
    key: "status",
    width: 80,
    render: (row: Record<string, unknown>) => {
      const s = String(row.status ?? "");
      return (
        <span className={`inline-block px-2 py-0.5 text-xs rounded border ${s === "启用" ? "bg-[#f6ffed] text-[#52c41a] border-[#b7eb8f]" : "bg-[#f5f5f5] text-[#999] border-[#d9d9d9]"}`}>
          {s}
        </span>
      );
    },
  },
  {
    title: "操作",
    key: "action",
    width: 100,
    render: () => (
      <span className="flex items-center gap-2">
        <button className="text-sm text-[#3658f7] hover:text-[#2d4fd6]">编辑</button>
        <button className="text-sm text-[#3658f7] hover:text-[#2d4fd6]">开关</button>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [
  { id: 1, sn: "1", sceneDesc: "全平台验证码（会员登录、注册、绑定、后台登录等）", contentTemplate: "验证码为：{1}，5分钟内有效", target: "任意用户", status: "启用" },
  { id: 2, sn: "2", sceneDesc: "账户余额变动通知（收入）", contentTemplate: "您的账户余额有变动！收入：{1}元", target: "前台会员", status: "关闭" },
  { id: 3, sn: "3", sceneDesc: "账户余额变动通知（支出）", contentTemplate: "您的账户余额有变动！支出：{1}元", target: "前台会员", status: "关闭" },
  { id: 4, sn: "4", sceneDesc: "余额提现结果通知（成功）", contentTemplate: "您提交的余额提现已经审核通过，本次申请提现金额：{1}元，扣除手续费：{2}元，实际到您帐为：{3}元，请注意查收", target: "前台会员", status: "关闭" },
  { id: 5, sn: "5", sceneDesc: "退款成功通知", contentTemplate: "您的支付订单号:{1}退款成功！退款金额：{2}元，退款方式：{3}", target: "前台会员", status: "关闭" },
  { id: 6, sn: "6", sceneDesc: "会员资料审核结果通知（通过）", contentTemplate: "恭喜！您的资料审核通过，编号为：{1}，有任何问题请联系您的专属服务人员", target: "前台会员", status: "关闭" },
  { id: 7, sn: "7", sceneDesc: "会员资料审核结果通知（未通过）", contentTemplate: "遗憾！您资料未通过审核，原因：{1}，请完善修正后我们会尽快再次审核", target: "前台会员", status: "启用" },
  { id: 8, sn: "8", sceneDesc: "实名认证结果通知（通过）", contentTemplate: "恭喜！您的实名认证审核通过", target: "前台会员", status: "关闭" },
  { id: 9, sn: "9", sceneDesc: "实名认证结果通知（未通过）", contentTemplate: "遗憾！您的实名认证审核未通过，请核实资料后再次提交", target: "前台会员", status: "启用" },
  { id: 10, sn: "10", sceneDesc: "承诺书签署结果通知（通过）", contentTemplate: "恭喜！您签署的承诺书已经通过！", target: "前台会员", status: "关闭" },
];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("系统设置", "短信通知配置")}
      pageTitle="短信通知配置"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: data.length }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
