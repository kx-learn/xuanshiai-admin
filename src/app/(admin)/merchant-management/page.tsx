"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "商家名称", key: "merchantName", width: 200 },
  { title: "分类", key: "category", width: 100 },
  { title: "管理账号", key: "account", width: 120 },
  { title: "创建时间", key: "createTime", width: 160 },
  { title: "商品统计", key: "productCount", width: 80, align: "center" },
  { title: "销售额统计", key: "salesAmount", width: 100 },
  { title: "核销员工", key: "verifyStaff", width: 100 },
  { title: "展示", key: "display", width: 60, align: "center" },
  { title: "链接/二维码", key: "link", width: 90, align: "center" },
  {
    title: "操作",
    key: "action",
    width: 150,
    render: () => (
      <span className="flex items-center gap-2">
        <span className="text-[#3658f7] cursor-pointer hover:opacity-80">编辑</span>
        <span className="text-[#ff4d4f] cursor-pointer hover:opacity-80">删除</span>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [
  { id: 1, merchantName: "星辰婚恋服务有限公司", category: "婚恋服务", account: "xingchen_admin", createTime: "2026-06-15 09:30:00", productCount: 3, salesAmount: "¥12,580", verifyStaff: "张伟", display: "是", link: "查看" },
  { id: 2, merchantName: "幸福起点婚介所", category: "婚介服务", account: "xingfu_admin", createTime: "2026-06-12 14:20:00", productCount: 5, salesAmount: "¥8,320", verifyStaff: "李娜", display: "是", link: "查看" },
  { id: 3, merchantName: "缘来是你文化传播", category: "文化传媒", account: "yuanlai_admin", createTime: "2026-06-10 10:00:00", productCount: 2, salesAmount: "¥5,100", verifyStaff: "王芳", display: "否", link: "查看" },
  { id: 4, merchantName: "玫瑰之约婚恋中心", category: "婚恋服务", account: "meigui_admin", createTime: "2026-06-08 16:45:00", productCount: 4, salesAmount: "¥15,200", verifyStaff: "赵强", display: "是", link: "查看" },
  { id: 5, merchantName: "爱桥婚姻服务有限公司", category: "婚姻服务", account: "aiqiao_admin", createTime: "2026-06-05 11:15:00", productCount: 1, salesAmount: "¥3,600", verifyStaff: "陈静", display: "是", link: "查看" },
  { id: 6, merchantName: "金玉良缘工作室", category: "婚恋服务", account: "jinyu_admin", createTime: "2026-06-01 09:00:00", productCount: 6, salesAmount: "¥22,800", verifyStaff: "刘洋", display: "否", link: "查看" },
  { id: 7, merchantName: "一生一世婚恋平台", category: "婚恋服务", account: "yisheng_admin", createTime: "2026-05-28 13:30:00", productCount: 3, salesAmount: "¥9,750", verifyStaff: "孙丽", display: "是", link: "查看" },
  { id: 8, merchantName: "桃花朵朵婚介所", category: "婚介服务", account: "taohua_admin", createTime: "2026-05-25 15:00:00", productCount: 2, salesAmount: "¥4,300", verifyStaff: "周杰", display: "是", link: "查看" },
];

const actions: ActionButton[] = [
  { label: "添加商家", variant: "primary" },
];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("商家联盟", "商家管理")}
      pageTitle="商家管理"
      searchFields={[
        { label: "商家名称", type: "input", placeholder: "请输入商家名称", width: 180 },
      ]}
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 8 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
