"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "发送时间", key: "sendTime" },
  { title: "手机号码", key: "phone" },
  { title: "短信内容", key: "content" },
  { title: "短信类型", key: "smsType" },
  { title: "发送结果", key: "result",
    render: (row: Record<string, unknown>) => {
      const s = String(row.result ?? "");
      const colorMap: Record<string, string> = {
        "成功": "bg-[#f6ffed] text-[#52c41a] border-[#b7eb8f]",
        "失败": "bg-[#fff1f0] text-[#ff4d4f] border-[#ffa39e]",
      };
      return <span className={`inline-block px-2 py-0.5 text-xs rounded border ${colorMap[s] || ""}`}>{s}</span>;
    },
  },
  { title: "失败原因", key: "failReason" },
];

const data: Record<string, unknown>[] = [
  { id: 1, sendTime: "2026-07-14 10:30:00", phone: "138****1234", content: "验证码为：123456，5分钟内有效", smsType: "验证码", result: "成功", failReason: "-" },
  { id: 2, sendTime: "2026-07-14 10:15:00", phone: "139****5678", content: "恭喜！您的资料审核通过，编号为：10001", smsType: "通知", result: "成功", failReason: "-" },
  { id: 3, sendTime: "2026-07-14 09:45:00", phone: "137****9012", content: "您的账户余额有变动！收入：100元", smsType: "通知", result: "失败", failReason: "号码已停机" },
  { id: 4, sendTime: "2026-07-13 18:00:00", phone: "136****3456", content: "遗憾！您资料未通过审核，原因：照片不清晰", smsType: "通知", result: "成功", failReason: "-" },
  { id: 5, sendTime: "2026-07-13 14:20:00", phone: "135****7890", content: "您提交的余额提现已审核通过，金额：500元", smsType: "通知", result: "成功", failReason: "-" },
];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("系统设置", "短信发送记录")}
      pageTitle="短信发送记录"
      searchFields={[
        { label: "手机号码", type: "input", placeholder: "请输入手机号码" },
        { label: "时间范围", type: "dateRange" },
      ]}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: data.length }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
