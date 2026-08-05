"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "页面标题", key: "title" },
  { title: "仅相亲会员可浏览", key: "memberOnly" },
  { title: "仅实名会员可浏览", key: "realNameOnly" },
  { title: "仅VIP会员可浏览", key: "vipOnly" },
  { title: "浏览明细", key: "viewDetail" },
  { title: "链接/二维码", key: "linkQrcode" },
  { title: "预览效果", key: "preview" },
  { title: "启用/关闭", key: "enabled" },
  { title: "操作", key: "action", width: 160 },
];

const data: Record<string, unknown>[] = [
  { id: 4, title: "活动", memberOnly: "关闭", realNameOnly: "关闭", vipOnly: "关闭", viewDetail: "-", linkQrcode: "查看", preview: "预览", enabled: "开启" },
  { id: 3, title: "本周活动", memberOnly: "关闭", realNameOnly: "关闭", vipOnly: "关闭", viewDetail: "-", linkQrcode: "查看", preview: "预览", enabled: "开启" },
  { id: 1, title: "历史活动", memberOnly: "关闭", realNameOnly: "关闭", vipOnly: "关闭", viewDetail: "-", linkQrcode: "查看", preview: "预览", enabled: "开启" },
];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("运营工具", "内容单页")}
      pageTitle="内容单页"
      actions={[
        { label: "添加单页", variant: "primary" },
      ]}
      searchFields={[
        { label: "搜索", type: "input", placeholder: "请输入" },
      ]}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 3 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
