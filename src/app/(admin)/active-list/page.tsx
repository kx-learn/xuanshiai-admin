"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 50 },
  { title: "活动名称", key: "name", width: 280 },
  { title: "链接/二维码", key: "link", width: 80, align: "center" },
  { title: "分享海报", key: "poster", width: 80, align: "center" },
  {
    title: "活动状态",
    key: "activityStatus",
    width: 90,
    render: (row: Record<string, unknown>) => {
      const status = String(row.activityStatus ?? "");
      const isActive = status === "报名中";
      return (
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            fontSize: 12,
            borderRadius: 4,
            color: isActive ? "#52c41a" : "#999",
            backgroundColor: isActive ? "#f6ffed" : "#f5f5f5",
            border: `1px solid ${isActive ? "#b7eb8f" : "#d9d9d9"}`,
          }}
        >
          {status}
        </span>
      );
    },
  },
  { title: "报名人数", key: "signups", width: 140 },
  { title: "创建时间", key: "createTime", width: 160 },
  {
    title: "审核状态",
    key: "auditStatus",
    width: 70,
    render: (row: Record<string, unknown>) => {
      const status = String(row.auditStatus ?? "");
      return (
        <span style={{ color: status === "通过" ? "#52c41a" : "#999" }}>
          {status}
        </span>
      );
    },
  },
  {
    title: "上线",
    key: "online",
    width: 60,
    render: (row: Record<string, unknown>) => {
      const status = String(row.online ?? "");
      return (
        <span style={{ color: status === "上线" ? "#52c41a" : "#999" }}>
          {status}
        </span>
      );
    },
  },
  { title: "操作", key: "action", width: 200 },
];

const data: Record<string, unknown>[] = [
  { id: 8, name: "单身青年 免费择偶竞争力评分\n分类：免费活动\n管理用户：芸希老师,六月", link: "查看", poster: "查看", activityStatus: "报名中", signups: "男生23人女生31人", createTime: "2026-07-01 13:31:24", auditStatus: "通过", online: "上线", action: "复制 编辑 名单 展示 删除" },
  { id: 7, name: "7.26 一年内结婚专场\n分类：专场活动\n管理用户：芸希老师,六月", link: "查看", poster: "查看", activityStatus: "报名中", signups: "男生1人女生0人", createTime: "2026-06-27 17:44:18", auditStatus: "通过", online: "上线", action: "复制 编辑 名单 展示 删除" },
  { id: 6, name: "7.19 黑心媒婆大赛\n分类：专场活动\n管理用户：芸希老师,六月", link: "查看", poster: "查看", activityStatus: "报名中", signups: "男生0人女生0人", createTime: "2026-06-27 17:39:41", auditStatus: "通过", online: "上线", action: "复制 编辑 名单 展示 删除" },
  { id: 5, name: "90后未婚脱单专场\n分类：专场活动\n管理用户：芸希老师,六月", link: "查看", poster: "查看", activityStatus: "活动结束", signups: "男生17人女生17人", createTime: "2026-06-27 17:37:11", auditStatus: "通过", online: "上线", action: "复制 编辑 名单 展示 删除" },
  { id: 4, name: "7.5 南京单身青年职业分享脱单大会\n分类：专场活动\n管理用户：芸希老师,六月", link: "查看", poster: "查看", activityStatus: "活动结束", signups: "男生13人女生12人", createTime: "2026-06-27 17:19:22", auditStatus: "通过", online: "下线", action: "复制 编辑 名单 展示 删除" },
  { id: 3, name: "测试\n分类：专场活动\n管理用户：芸希老师", link: "查看", poster: "查看", activityStatus: "活动结束", signups: "男生1人女生0人", createTime: "2026-06-21 13:09:12", auditStatus: "通过", online: "下线", action: "复制 编辑 名单 展示 删除" },
  { id: 2, name: "6月19日高个子专场脱单局\n分类：专场活动\n管理用户：芸希老师,六月", link: "查看", poster: "查看", activityStatus: "活动结束", signups: "男生12人女生14人", createTime: "2026-06-10 13:27:56", auditStatus: "通过", online: "下线", action: "复制 编辑 名单 展示 删除" },
  { id: 1, name: "南京高学历专场--告别无效社交，遇见同频高知\n分类：专场活动\n管理用户：芸希老师", link: "查看", poster: "查看", activityStatus: "活动结束", signups: "男生17人女生17人", createTime: "2026-05-31 16:57:35", auditStatus: "通过", online: "下线", action: "复制 编辑 名单 展示 删除" },
];

const actions: ActionButton[] = [
  { label: "发布活动", variant: "primary" },
];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("活动报名", "活动管理")}
      pageTitle="活动管理"
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
