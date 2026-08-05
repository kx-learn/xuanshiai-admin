"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 50 },
  { title: "封面", key: "cover", width: 60, align: "center" },
  { title: "描述", key: "description", width: 280 },
  { title: "浏览权限", key: "permission", width: 90 },
  { title: "关联内容", key: "related", width: 80 },
  { title: "统计数据", key: "stats", width: 160 },
  { title: "打赏收入", key: "tipIncome", width: 80 },
  { title: "红包", key: "redPacket", width: 70 },
  { title: "显示", key: "display", width: 50, align: "center" },
  {
    title: "审核",
    key: "audit",
    width: 60,
    align: "center",
    render: (row: Record<string, unknown>) => {
      const audit = String(row.audit ?? "");
      return (
        <span style={{ color: audit === "通过" ? "#52c41a" : "#faad14" }}>{audit}</span>
      );
    },
  },
  { title: "属性", key: "props", width: 140 },
  {
    title: "操作",
    key: "action",
    width: 180,
    render: (row: Record<string, unknown>) => {
      const hasRedPacket = String(row.redPacket ?? "") === "有红包";
      return (
        <span className="flex items-center gap-1.5 text-xs">
          {hasRedPacket && <span className="text-[#3658f7] cursor-pointer hover:opacity-80">发红包</span>}
          <span className="text-[#3658f7] cursor-pointer hover:opacity-80">编辑</span>
          <span className="text-[#3658f7] cursor-pointer hover:opacity-80">预览</span>
          <span className="text-[#3658f7] cursor-pointer hover:opacity-80">视频</span>
          <span className="text-[#ff4d4f] cursor-pointer hover:opacity-80">删除</span>
        </span>
      );
    },
  },
];

const data: Record<string, unknown>[] = [
  { id: 1, cover: "1", description: "相亲一定要先见面再聊天！！ 文字都是冷冰冰的，真实的见面才能拉近两颗心的距离", permission: "必须先登录", related: "自定义", stats: "播放数：2477 评论量：3 点赞量：4", tipIncome: "0元", redPacket: "有红包", display: "否", audit: "通过", props: "置顶：否 推荐：是 热门：是" },
  { id: 2, cover: "2", description: "5.24脱单活动《寻找灵魂伴侣》圆满收官，现场精彩回顾", permission: "必须先登录", related: "自定义", stats: "播放数：2610 评论量：0 点赞量：0", tipIncome: "0元", redPacket: "有红包", display: "否", audit: "通过", props: "置顶：否 推荐：是 热门：是" },
  { id: 3, cover: "3", description: "南京98年男生，985硕士，产品经理，飞盘全国冠军，喜欢游泳唱歌打羽毛球，长相清爽，你想认识他吗？", permission: "必须先登录", related: "自定义", stats: "播放数：3448 评论量：0 点赞量：1", tipIncome: "0元", redPacket: "有红包", display: "否", audit: "通过", props: "置顶：否 推荐：是 热门：是" },
  { id: 4, cover: "4", description: "来听听我们的价值观和服务亮点", permission: "必须先登录", related: "自定义", stats: "播放数：3464 评论量：0 点赞量：1", tipIncome: "0元", redPacket: "有红包", display: "否", audit: "通过", props: "置顶：否 推荐：是 热门：是" },
  { id: 5, cover: "5", description: "为了结婚而结婚的男人，他的婚恋观你认同吗？", permission: "必须先登录", related: "自定义", stats: "播放数：1992 评论量：0 点赞量：0", tipIncome: "0元", redPacket: "有红包", display: "否", audit: "通过", props: "置顶：否 推荐：是 热门：是" },
  { id: 6, cover: "6", description: "相亲聊这5个话题，迅速判断你和ta合不合适", permission: "必须先登录", related: "自定义", stats: "播放数：2251 评论量：0 点赞量：1", tipIncome: "0元", redPacket: "-", display: "是", audit: "通过", props: "置顶：否 推荐：是 热门：是" },
  { id: 7, cover: "7", description: "00年高个子女生，北大本港大硕，大厂工作，热爱旅行，喜欢桌游剧本杀，性格超好，在等同频的你", permission: "必须先登录", related: "自定义", stats: "播放数：2225 评论量：0 点赞量：0", tipIncome: "0元", redPacket: "-", display: "是", audit: "通过", props: "置顶：否 推荐：是 热门：是" },
  { id: 8, cover: "8", description: "37岁母单女生，想找年入百万成熟爱我的男人", permission: "必须先登录", related: "自定义", stats: "播放数：2145 评论量：0 点赞量：0", tipIncome: "0元", redPacket: "-", display: "是", audit: "通过", props: "置顶：否 推荐：是 热门：是" },
  { id: 9, cover: "9", description: "我们在南京开了一家不让你踩坑的婚恋机构", permission: "必须先登录", related: "自定义", stats: "播放数：1874 评论量：0 点赞量：0", tipIncome: "0元", redPacket: "-", display: "是", audit: "通过", props: "置顶：否 推荐：是 热门：是" },
  { id: 10, cover: "10", description: "为了结婚而结婚的男人，他的婚恋观你认同吗？", permission: "必须先登录", related: "自定义", stats: "播放数：2101 评论量：0 点赞量：0", tipIncome: "0元", redPacket: "-", display: "是", audit: "通过", props: "置顶：否 推荐：是 热门：是" },
];

const actions: ActionButton[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("短视频", "视频管理")}
      pageTitle="视频管理"
      searchFields={[
        { label: "描述", type: "input", placeholder: "请输入描述", width: 180 },
      ]}
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 10 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
