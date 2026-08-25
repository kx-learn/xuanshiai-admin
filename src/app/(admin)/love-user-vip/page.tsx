"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type ActionButton, type SearchField } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "会员", key: "nickname" }, { title: "套餐", key: "package_type" }, { title: "支付金额", key: "amount" },
  { title: "订单号", key: "order_no" }, { title: "开通时间", key: "start_at" }, { title: "有效期至", key: "end_at" }, { title: "状态", key: "status" },
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
      dataSource={[]}
      rowKey="membership_id"
      endpoint="/api/backend/admin/members/vip"
      pagination={{ current: 1, pageSize: 20, total: 0 }}
      onSearch={() => undefined}
      onReset={() => undefined}
    />
  );
}
