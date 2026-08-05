"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type ActionButton, type SearchField } from "@/components/ListPage";

const columns: ColumnDef[] = [
  {
    title: "会员",
    key: "member",
    width: 200,
    render: (row: Record<string, unknown>) => (
      <div className="text-xs leading-relaxed">
        <div className="font-medium">{row.memberName as string}</div>
        <div className="text-[#999]">{row.memberId as string}</div>
      </div>
    ),
  },
  { title: "VIP级别", key: "vipLevel", width: 100 },
  {
    title: "开通方式",
    key: "openMethod",
    width: 90,
    render: (row: Record<string, unknown>) => {
      const v = row.openMethod as string;
      return <span className={v === "自助开通" ? "text-[#fa8c16]" : "text-[#666]"}>{v}</span>;
    },
  },
  {
    title: "开通性质",
    key: "openType",
    width: 90,
    render: (row: Record<string, unknown>) => {
      const v = row.openType as string;
      return <span className={v === "首次开通" ? "text-[#52c41a]" : "text-[#3658f7]"}>{v}</span>;
    },
  },
  { title: "开通时间", key: "openTime", width: 150 },
  { title: "有效期", key: "validUntil", width: 160 },
  {
    title: "VIP状态",
    key: "vipStatus",
    width: 90,
    render: (row: Record<string, unknown>) => {
      const v = row.vipStatus as string;
      return (
        <span className={`inline-block px-2 py-0.5 text-xs rounded ${v === "未过期" ? "bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]" : "bg-[#fff1f0] text-[#ff4d4f] border border-[#ffa39e]"}`}>
          {v}
        </span>
      );
    },
  },
  {
    title: "支付金额",
    key: "amount",
    width: 90,
    render: (row: Record<string, unknown>) => {
      const v = row.amount as string;
      return <span>{v === "0" ? "¥0" : `¥${v}`}</span>;
    },
  },
  { title: "增加牵线次数", key: "addedConnections", width: 100, align: "center" },
  { title: "牵线剩余次数", key: "remainingConnections", width: 100, align: "center" },
  {
    title: "操作",
    key: "action",
    width: 140,
    render: () => (
      <span className="flex items-center gap-2 text-xs">
        <span className="text-[#3658f7] cursor-pointer hover:underline">查看资料</span>
        <span className="text-[#3658f7] cursor-pointer hover:underline">发起合同</span>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [
  { memberName: "秋刀鱼 | 李会强", memberId: "编号：B976071", vipLevel: "臻爱专享", openMethod: "后台开通", openType: "升级开通", openTime: "2026-07-02 15:03:39", validUntil: "2027-07-01 00:00:00", vipStatus: "未过期", amount: "0", addedConnections: "20", remainingConnections: "20" },
  { memberName: "Sofia | 陈垚林", memberId: "编号：G410116", vipLevel: "新人专享", openMethod: "后台开通", openType: "首次开通", openTime: "2026-07-01 17:46:29", validUntil: "2026-09-30 00:00:00", vipStatus: "未过期", amount: "0", addedConnections: "3", remainingConnections: "3" },
  { memberName: "越可名 | 杨俊芳", memberId: "编号：G777211", vipLevel: "新人专享", openMethod: "后台开通", openType: "首次开通", openTime: "2026-07-01 17:46:08", validUntil: "2026-09-30 00:00:00", vipStatus: "未过期", amount: "0", addedConnections: "3", remainingConnections: "2" },
  { memberName: "乌龙茶607i | 朱颖", memberId: "编号：G714715", vipLevel: "新人专享", openMethod: "后台开通", openType: "首次开通", openTime: "2026-07-01 17:45:52", validUntil: "2026-09-30 00:00:00", vipStatus: "未过期", amount: "0", addedConnections: "3", remainingConnections: "3" },
  { memberName: "秋刀鱼 | 李会强", memberId: "编号：B976071", vipLevel: "臻爱专享", openMethod: "后台开通", openType: "首次开通", openTime: "2026-07-01 16:33:41", validUntil: "2027-07-01 00:00:00", vipStatus: "未过期", amount: "0", addedConnections: "20", remainingConnections: "20" },
  { memberName: "是静香本人没错 | 潘童", memberId: "编号：G858401", vipLevel: "新人专享", openMethod: "自助开通", openType: "首次开通", openTime: "2026-06-30 11:51:56", validUntil: "2026-09-28 00:00:00", vipStatus: "未过期", amount: "299", addedConnections: "3", remainingConnections: "1" },
  { memberName: "张天宇 | 张超睿", memberId: "编号：B224118", vipLevel: "新人专享", openMethod: "后台开通", openType: "首次开通", openTime: "2026-06-28 17:05:18", validUntil: "2026-09-18 00:00:00", vipStatus: "未过期", amount: "0", addedConnections: "3", remainingConnections: "3" },
  { memberName: "六月", memberId: "编号：B970357", vipLevel: "新人专享", openMethod: "后台开通", openType: "首次开通", openTime: "2026-06-28 17:04:43", validUntil: "2026-08-28 00:00:00", vipStatus: "未过期", amount: "0", addedConnections: "3", remainingConnections: "3" },
  { memberName: "Karo | 杨一帆", memberId: "编号：B582604", vipLevel: "新人专享", openMethod: "后台开通", openType: "首次开通", openTime: "2026-06-28 16:51:57", validUntil: "2026-09-28 00:00:00", vipStatus: "未过期", amount: "0", addedConnections: "3", remainingConnections: "3" },
  { memberName: "出现1 | 张瑞", memberId: "编号：B241050", vipLevel: "臻爱专享", openMethod: "自助开通", openType: "首次开通", openTime: "2026-06-28 15:10:50", validUntil: "2027-06-28 00:00:00", vipStatus: "未过期", amount: "999", addedConnections: "20", remainingConnections: "15" },
];

const searchFields: SearchField[] = [
  { label: "会员", type: "input", placeholder: "请输入会员昵称/姓名/编号", width: 220 },
  { label: "VIP级别", type: "select", options: [{ label: "全部", value: "" }, { label: "新人专享", value: "new" }, { label: "臻爱专享", value: "premium" }], width: 130 },
  { label: "开通方式", type: "select", options: [{ label: "全部", value: "" }, { label: "后台开通", value: "admin" }, { label: "自助开通", value: "self" }], width: 120 },
  { label: "VIP状态", type: "select", options: [{ label: "全部", value: "" }, { label: "未过期", value: "active" }, { label: "已过期", value: "expired" }], width: 120 },
  { label: "开通时间", type: "dateRange" },
];

const actions: ActionButton[] = [
  { label: "导出EXCEL", variant: "primary" },
];

export default function LoveUserVipPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("会员CRM", "线上VIP")}
      pageTitle="线上VIP"
      searchFields={searchFields}
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="memberId"
      pagination={{ current: 1, pageSize: 20, total: 160 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
