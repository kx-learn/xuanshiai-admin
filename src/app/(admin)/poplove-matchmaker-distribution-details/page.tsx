"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type SearchField, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60, align: "center" },
  { title: "时间", key: "time", width: 180 },
  { title: "推广红娘", key: "promoter", width: 100 },
  { title: "消费会员", key: "member", width: 200 },
  {
    title: "分成/奖励事件",
    key: "bonusEvent",
    width: 130,
    render: (row: Record<string, unknown>) => {
      const event = String(row.bonusEvent ?? "");
      const colors: Record<string, string> = {
        "会员注册奖励": "bg-[#edf2ff] text-[#3658f7] border-[#adc6ff]",
        "活动报名": "bg-[#f6ffed] text-[#52c41a] border-[#b7eb8f]",
      };
      const cls = colors[event] || "bg-[#f5f5f5] text-[#999] border-[#d9d9d9]";
      return <span className={`inline-block px-2 py-0.5 text-xs rounded border ${cls}`}>{event}</span>;
    },
  },
  { title: "分成金额", key: "bonusAmount", width: 100, align: "right" },
];

const data: Record<string, unknown>[] = [
  { id: 75, time: "2026-07-05 08:32:15", promoter: "Sofia", member: "fu福  |", bonusEvent: "活动报名", bonusAmount: "0元" },
  { id: 64, time: "2026-06-14 11:32:29", promoter: "悲喜", member: "Bj.Alex | 张鹏 | B721295", bonusEvent: "会员注册奖励", bonusAmount: "11元" },
  { id: 63, time: "2026-06-14 11:23:23", promoter: "悲喜", member: "一个人的浪漫 | 朱刚 | B978705", bonusEvent: "会员注册奖励", bonusAmount: "11元" },
  { id: 62, time: "2026-06-14 11:13:04", promoter: "悲喜", member: "SomnusL | 鲁鑫喆 | B366358", bonusEvent: "会员注册奖励", bonusAmount: "11元" },
  { id: 61, time: "2026-06-14 11:05:00", promoter: "悲喜", member: "zzz  | 李超 | B451744", bonusEvent: "会员注册奖励", bonusAmount: "11元" },
  { id: 60, time: "2026-06-14 11:00:35", promoter: "悲喜", member: "小拆 | 韩杰 | B241658", bonusEvent: "会员注册奖励", bonusAmount: "10元" },
  { id: 59, time: "2026-06-14 10:55:57", promoter: "悲喜", member: "空白 | 陈茂元 | B508345", bonusEvent: "会员注册奖励", bonusAmount: "10元" },
  { id: 58, time: "2026-06-14 10:00:15", promoter: "悲喜", member: "馋 | 周文阳 | B706944", bonusEvent: "会员注册奖励", bonusAmount: "10元" },
  { id: 57, time: "2026-06-13 17:33:03", promoter: "悲喜", member: "🌱1l96 | 苟雯颖 | G617884", bonusEvent: "会员注册奖励", bonusAmount: "20元" },
  { id: 56, time: "2026-06-13 17:30:57", promoter: "悲喜", member: "！！！gbfs | 李力华 | B501213", bonusEvent: "会员注册奖励", bonusAmount: "10元" },
  { id: 55, time: "2026-06-13 17:27:57", promoter: "悲喜", member: "-1+1-= | 李小亮 | B846068", bonusEvent: "会员注册奖励", bonusAmount: "10元" },
  { id: 54, time: "2026-06-13 16:36:55", promoter: "悲喜", member: "伟 | 邓承伟 | B631678", bonusEvent: "会员注册奖励", bonusAmount: "10元" },
  { id: 53, time: "2026-06-13 15:31:56", promoter: "悲喜", member: "王秋霞1510 | 王秋霞 | G063146", bonusEvent: "会员注册奖励", bonusAmount: "20元" },
  { id: 52, time: "2026-06-13 15:29:10", promoter: "悲喜", member: "童话故事导演🌈 | 尹广奎 | B015527", bonusEvent: "会员注册奖励", bonusAmount: "10元" },
  { id: 51, time: "2026-06-13 15:27:22", promoter: "悲喜", member: "小黄先森。 | 黄智 | B782572", bonusEvent: "会员注册奖励", bonusAmount: "10元" },
];

const searchFields: SearchField[] = [
  { label: "推广红娘", type: "input", placeholder: "请输入红娘姓名", width: 160 },
  { label: "时间范围", type: "dateRange" },
];

const actions: ActionButton[] = [
  { label: "录入一笔分成", variant: "primary", onClick: () => {} },
  { label: "导出EXCEL", onClick: () => {} },
];

export default function PoploveMatchmakerDistributionDetailsPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("推广红娘", "分成明细")}
      pageTitle="分成明细"
      searchFields={searchFields}
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 75 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
