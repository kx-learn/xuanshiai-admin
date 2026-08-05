"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "礼物名称", key: "giftName" },
  { title: "礼物单位", key: "unit" },
  { title: "礼物图片", key: "image" },
  { title: "销量统计", key: "salesStats" },
  { title: "所需积分", key: "requiredPoints" },
  { title: "奖励积分", key: "rewardPoints" },
  { title: "排序", key: "sort" },
  { title: "操作", key: "action", width: 120 },
];

const data: Record<string, unknown>[] = [
  { id: 18, giftName: "水晶球", unit: "颗", image: "预览", salesStats: "3 查看", requiredPoints: "900金币", rewardPoints: "450金币", sort: "下移" },
  { id: 17, giftName: "啤酒", unit: "杯", image: "预览", salesStats: "0 查看", requiredPoints: "800金币", rewardPoints: "400金币", sort: "上移下移" },
  { id: 16, giftName: "小彩礼", unit: "个", image: "预览", salesStats: "0 查看", requiredPoints: "700金币", rewardPoints: "350金币", sort: "上移下移" },
  { id: 15, giftName: "小情药", unit: "个", image: "预览", salesStats: "0 查看", requiredPoints: "600金币", rewardPoints: "300金币", sort: "上移下移" },
  { id: 14, giftName: "甜甜圈", unit: "个", image: "预览", salesStats: "0 查看", requiredPoints: "500金币", rewardPoints: "250金币", sort: "上移下移" },
  { id: 13, giftName: "麦旋风蛋筒", unit: "个", image: "预览", salesStats: "0 查看", requiredPoints: "400金币", rewardPoints: "200金币", sort: "上移下移" },
  { id: 11, giftName: "彩虹糖", unit: "颗", image: "预览", salesStats: "0 查看", requiredPoints: "300金币", rewardPoints: "150金币", sort: "上移下移" },
  { id: 10, giftName: "棒棒糖", unit: "颗", image: "预览", salesStats: "2 查看", requiredPoints: "200金币", rewardPoints: "100金币", sort: "上移下移" },
  { id: 9, giftName: "宇宙火箭", unit: "发", image: "预览", salesStats: "0 查看", requiredPoints: "900金币", rewardPoints: "450金币", sort: "上移下移" },
  { id: 8, giftName: "炫光跑车", unit: "辆", image: "预览", salesStats: "0 查看", requiredPoints: "800金币", rewardPoints: "400金币", sort: "上移下移" },
];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("运营工具", "礼物管理")}
      pageTitle="礼物管理"
      tabs={[
        { key: "gift-manage", label: "礼物管理" },
        { key: "send-gift", label: "赠送礼物" },
      ]}
      actions={[
        { label: "添加礼物", variant: "primary" },
      ]}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 10 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
