"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "商品名称", key: "productName", width: 220 },
  { title: "商家名称", key: "merchantName", width: 180 },
  { title: "销售价格", key: "price", width: 100 },
  { title: "添加时间", key: "createTime", width: 160 },
  { title: "销量统计", key: "salesCount", width: 80, align: "center" },
  {
    title: "上架",
    key: "online",
    width: 60,
    align: "center",
    render: (row: Record<string, unknown>) => {
      const online = String(row.online ?? "");
      return (
        <span style={{ color: online === "是" ? "#52c41a" : "#999" }}>{online}</span>
      );
    },
  },
  { title: "链接/二维码", key: "link", width: 90, align: "center" },
  {
    title: "操作",
    key: "action",
    width: 150,
    render: () => (
      <span className="flex items-center gap-2">
        <span className="text-[#3658f7] cursor-pointer hover:opacity-80">编辑</span>
        <span className="text-[#3658f7] cursor-pointer hover:opacity-80">查看</span>
        <span className="text-[#ff4d4f] cursor-pointer hover:opacity-80">下架</span>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [
  { id: 1, productName: "钻石会员年卡", merchantName: "星辰婚恋服务有限公司", price: "¥3,999", createTime: "2026-06-15 09:30:00", salesCount: 128, online: "是", link: "查看" },
  { id: 2, productName: "高端一对一匹配服务", merchantName: "幸福起点婚介所", price: "¥2,999", createTime: "2026-06-14 14:20:00", salesCount: 56, online: "是", link: "查看" },
  { id: 3, productName: "情感咨询套餐A", merchantName: "缘来是你文化传播", price: "¥1,999", createTime: "2026-06-13 10:00:00", salesCount: 32, online: "是", link: "查看" },
  { id: 4, productName: "线下相亲活动门票", merchantName: "玫瑰之约婚恋中心", price: "¥299", createTime: "2026-06-12 16:45:00", salesCount: 215, online: "是", link: "查看" },
  { id: 5, productName: "VIP会员季卡", merchantName: "爱桥婚姻服务有限公司", price: "¥1,999", createTime: "2026-06-11 11:15:00", salesCount: 89, online: "是", link: "查看" },
  { id: 6, productName: "婚礼策划基础套餐", merchantName: "金玉良缘工作室", price: "¥5,999", createTime: "2026-06-10 09:00:00", salesCount: 12, online: "是", link: "查看" },
  { id: 7, productName: "形象改造课程", merchantName: "星辰婚恋服务有限公司", price: "¥999", createTime: "2026-06-08 13:30:00", salesCount: 45, online: "否", link: "查看" },
  { id: 8, productName: "恋爱技巧培训课", merchantName: "幸福起点婚介所", price: "¥199", createTime: "2026-06-05 15:00:00", salesCount: 167, online: "是", link: "查看" },
];

const actions: ActionButton[] = [
  { label: "添加商品", variant: "primary" },
];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("商家联盟", "商品管理")}
      pageTitle="商品管理"
      searchFields={[
        { label: "商品名称", type: "input", placeholder: "请输入商品名称", width: 180 },
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
