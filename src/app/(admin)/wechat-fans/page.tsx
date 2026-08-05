"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "头像", key: "avatar", width: 60 },
  { title: "昵称", key: "nickname" },
  { title: "性别", key: "gender", width: 60, align: "center" },
  { title: "关注时间", key: "followTime" },
  { title: "标签", key: "tags" },
  { title: "操作", key: "action", width: 100, align: "center" },
];

const data: Record<string, unknown>[] = [
  { id: 1, avatar: "", nickname: "月下独酌", gender: "男", followTime: "2026-06-10 10:00:00", tags: "VIP会员", action: "查看详情" },
  { id: 2, avatar: "", nickname: "春风十里", gender: "女", followTime: "2026-06-11 11:00:00", tags: "活跃用户", action: "查看详情" },
  { id: 3, avatar: "", nickname: "细雨微风", gender: "男", followTime: "2026-06-12 12:00:00", tags: "新关注", action: "查看详情" },
  { id: 4, avatar: "", nickname: "星空梦想", gender: "女", followTime: "2026-06-13 13:00:00", tags: "高意向", action: "查看详情" },
  { id: 5, avatar: "", nickname: "暖阳如初", gender: "男", followTime: "2026-06-14 14:00:00", tags: "活跃用户/VIP会员", action: "查看详情" },
  { id: 6, avatar: "", nickname: "清风徐来", gender: "女", followTime: "2026-01-15 15:00:00", tags: "新关注", action: "查看详情" },
  { id: 7, avatar: "", nickname: "花开富贵", gender: "男", followTime: "2026-01-16 16:00:00", tags: "活跃用户", action: "查看详情" },
  { id: 8, avatar: "", nickname: "幸福永久", gender: "女", followTime: "2026-01-17 17:00:00", tags: "VIP会员/高意向", action: "查看详情" },
  { id: 9, avatar: "", nickname: "蓝海之恋", gender: "男", followTime: "2026-01-18 18:00:00", tags: "新关注", action: "查看详情" },
  { id: 10, avatar: "", nickname: "阳光正好", gender: "女", followTime: "2026-01-19 19:00:00", tags: "活跃用户", action: "查看详情" },
  { id: 11, avatar: "", nickname: "茉莉花香", gender: "男", followTime: "2026-01-20 20:00:00", tags: "VIP会员", action: "查看详情" },
  { id: 12, avatar: "", nickname: "山水之间", gender: "女", followTime: "2026-01-21 21:00:00", tags: "新关注/高意向", action: "查看详情" },
];

export default function WechatFansPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("公众号", "关注粉丝")}
      pageTitle="关注粉丝"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 12 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
