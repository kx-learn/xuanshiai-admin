"use client";

import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPageHeader from "@/components/AdminPageHeader";
import { DataTable, type Column } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const mockData = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: [
    "无法上传头像", "实名认证失败", "建议增加筛选功能", "支付后未到账",
    "页面加载缓慢反馈", "建议增加语音聊天", "提现申请未处理", "修改手机号需求",
    "活动报名问题", "消息通知延迟", "建议优化搜索体验", "删除账号申请",
  ][i],
  feedbackType: ["BUG", "BUG", "建议", "BUG", "BUG", "建议", "咨询", "咨询", "BUG", "BUG", "建议", "咨询"][i],
  submitter: ["张三", "李四", "王五", "赵六", "孙七", "周八", "吴九", "郑十", "钱十一", "刘十二", "陈十三", "杨十四"][i],
  submitTime: `2026-07-${String(14 - i).padStart(2, "0")} ${9 + i}:${(i * 7) % 60}:00`,
  status: i < 6 ? "已处理" : i < 9 ? "处理中" : "待处理",
}));

export default function SystemFeedbackPage() {
  const columns: Column[] = [
    { key: "id", title: "编号", dataIndex: "id", width: 70 },
    { key: "title", title: "工单标题", dataIndex: "title" },
    {
      key: "feedbackType",
      title: "反馈类型",
      dataIndex: "feedbackType",
      render: (value: unknown) => {
        const type = String(value ?? "");
        const colorMap: Record<string, string> = {
          "BUG": "inline-block px-2 py-0.5 text-xs rounded bg-[#fff1f0] text-[#ff4d4f] border border-[#ffa39e]",
          "咨询": "inline-block px-2 py-0.5 text-xs rounded bg-[#e6f7ff] text-[#1890ff] border border-[#91d5ff]",
          "建议": "inline-block px-2 py-0.5 text-xs rounded bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]",
        };
        return <span className={colorMap[type] || ""}>{type}</span>;
      },
    },
    { key: "submitter", title: "提交人", dataIndex: "submitter" },
    { key: "submitTime", title: "提交时间", dataIndex: "submitTime" },
    {
      key: "status",
      title: "状态",
      dataIndex: "status",
      width: 80,
      render: (value: unknown) => {
        const status = String(value ?? "");
        const colorMap: Record<string, string> = {
          "已处理": "inline-block px-2 py-0.5 text-xs rounded bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]",
          "处理中": "inline-block px-2 py-0.5 text-xs rounded bg-[#e6f7ff] text-[#1890ff] border border-[#91d5ff]",
          "待处理": "inline-block px-2 py-0.5 text-xs rounded bg-[#fff7e6] text-[#fa8c16] border border-[#ffd591]",
        };
        return <span className={colorMap[status] || ""}>{status}</span>;
      },
    },
    {
      key: "action",
      title: "操作",
      dataIndex: "action",
      width: 80,
      render: () => (
        <Button variant="link" size="sm">查看</Button>
      ),
    },
  ];

  return (
    <div>
      <AdminBreadcrumb
        items={[
          { label: "首页", href: "/" },
          { label: "系统管理" },
          { label: "工单反馈" },
        ]}
      />
      <AdminPageHeader
        title="工单反馈"
        extra={<Button variant="primary" size="sm">提交工单</Button>}
      />
      <div className="admin-card">
        <div className="admin-card-body">
          <DataTable columns={columns} dataSource={mockData as unknown as Record<string, unknown>[]} />
          <div className="flex items-center justify-between mt-4 text-sm text-[#999]">
            <span>共 {mockData.length} 条</span>
            <div className="flex items-center gap-2">
              <Button variant="default" size="sm" disabled>上一页</Button>
              <span>1 / 1</span>
              <Button variant="default" size="sm">下一页</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
