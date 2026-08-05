"use client";

import { useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminSearchBar, { type SearchField } from "@/components/AdminSearchBar";
import { DataTable, type Column } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const mockData = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  tipper: ["陈小明", "林小红", "王建国", "赵丽丽", "孙大海", "周美玲"][i % 6],
  videoTitle: [
    "教你如何在相亲中留下好印象",
    "婚恋市场最新趋势分析",
    "我们的爱情故事分享",
    "红娘教你识别靠谱对象",
    "第一次约会该去哪里",
    "婚姻保鲜的五个秘诀",
    "如何写好一份相亲简历",
    "恋爱中的沟通技巧",
    "父母催婚怎么办",
    "相亲中的那些趣事",
    "婚恋平台的使用心得",
    "从相识到相知的美好旅程",
  ][i],
  amount: [10, 20, 50, 5, 30, 66, 8, 18, 100, 15, 25, 88][i],
  tipTime: `2026-07-${String(13 - i).padStart(2, "0")} ${String(14 + i).padStart(2, "0")}:${String(i * 5).padStart(2, "0")}:00`,
}));

export default function ShortVideoTipPage() {
  const [tipper, setTipper] = useState("");

  const searchFields: SearchField[] = [
    { label: "打赏者", name: "tipper", type: "text", placeholder: "请输入打赏者", value: tipper, onChange: setTipper },
  ];

  const columns: Column[] = [
    { key: "id", title: "编号", dataIndex: "id", width: 70 },
    { key: "tipper", title: "打赏者", dataIndex: "tipper" },
    { key: "videoTitle", title: "被打赏视频", dataIndex: "videoTitle" },
    { key: "amount", title: "金额", dataIndex: "amount", render: (value: unknown) => `¥${value}` },
    { key: "tipTime", title: "打赏时间", dataIndex: "tipTime" },
    {
      key: "action",
      title: "操作",
      dataIndex: "action",
      width: 80,
      render: (_value: unknown, _record: Record<string, unknown>) => (
        <span className="flex items-center gap-2">
          <Button variant="link" size="sm">详情</Button>
        </span>
      ),
    },
  ];

  return (
    <>
      <AdminBreadcrumb
        items={[
          { label: "首页", href: "/" },
          { label: "短视频" },
          { label: "打赏管理" },
        ]}
      />
      <AdminPageHeader title="打赏管理" />
      <div className="admin-card">
        <div className="admin-card-body">
          <AdminSearchBar
            fields={searchFields}
            onSearch={() => {}}
            onReset={() => { setTipper(""); }}
          />
          <DataTable columns={columns} dataSource={mockData as unknown as Record<string, unknown>[]} />
          <div className="flex items-center justify-end gap-2 mt-4 text-sm text-[#666]">
            <span>共 {mockData.length} 条</span>
            <span className="flex items-center gap-1">
              <Button variant="default" size="sm" disabled>上一页</Button>
              <span className="px-2">1 / 2</span>
              <Button variant="default" size="sm">下一页</Button>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
