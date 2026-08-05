"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef, type ActionButton, type SearchField } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "申请牵线人", key: "initiator", width: 200 },
  { title: "牵线对象", key: "target", width: 200 },
  { title: "牵线红娘", key: "matchmaker", width: 100 },
  { title: "支付状态", key: "payStatus", width: 90 },
  {
    title: "牵线状态",
    key: "matchStatus",
    width: 90,
    render: (row: Record<string, unknown>) => {
      const status = String(row.matchStatus ?? "");
      const colorMap: Record<string, string> = {
        "成功": "#52c41a",
        "失败": "#ff4d4f",
        "待牵线": "#1890ff",
        "牵线中": "#fa8c16",
      };
      const bgMap: Record<string, string> = {
        "成功": "#f6ffed",
        "失败": "#fff1f0",
        "待牵线": "#e6f7ff",
        "牵线中": "#fff7e6",
      };
      const borderMap: Record<string, string> = {
        "成功": "#b7eb8f",
        "失败": "#ffa39e",
        "待牵线": "#91d5ff",
        "牵线中": "#ffd591",
      };
      return (
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            fontSize: 12,
            borderRadius: 4,
            color: colorMap[status] || "#999",
            backgroundColor: bgMap[status] || "#f5f5f5",
            border: `1px solid ${borderMap[status] || "#d9d9d9"}`,
          }}
        >
          {status || "-"}
        </span>
      );
    },
  },
  { title: "申请时间", key: "applyTime", width: 160 },
  { title: "完成时间", key: "completeTime", width: 160 },
  { title: "操作", key: "action", width: 120 },
];

const data: Record<string, unknown>[] = [
  { id: 50, initiator: "男 27岁\n秋刀鱼 | 李会强\n已实名 已签承诺书\n编号：B976071", target: "女 21岁\n乌龙茶607i | 朱颖\n已实名 未签承诺书\n编号：G714715", matchmaker: "", payStatus: "已支付", matchStatus: "失败", applyTime: "2026-07-09 10:09:03", completeTime: "2026-07-10 00:00:03", action: "后台 admin 删除" },
  { id: 49, initiator: "男 46岁\n出现1 | 张瑞\n已实名 已签承诺书\n编号：B241050", target: "女 25岁\n越可名 | 杨俊芳\n已实名 未签承诺书\n编号：G777211", matchmaker: "", payStatus: "已支付", matchStatus: "失败", applyTime: "2026-07-09 08:39:22", completeTime: "2026-07-10 00:00:03", action: "后台 admin 删除" },
  { id: 48, initiator: "男 46岁\n出现1 | 张瑞\n已实名 已签承诺书\n编号：B241050", target: "女 27岁\n余生请指教 | 陈涵涵\n已实名 已签承诺书\n编号：G519122", matchmaker: "", payStatus: "已支付", matchStatus: "失败", applyTime: "2026-07-08 21:33:27", completeTime: "2026-07-09 00:00:04", action: "后台 admin 删除" },
  { id: 47, initiator: "男 27岁\n秋刀鱼 | 李会强\n已实名 已签承诺书\n编号：B976071", target: "女 31岁\n蓝色琉璃梦 | 吴小雪\n已实名 已签承诺书\n编号：G797491", matchmaker: "芸希老师", payStatus: "已支付", matchStatus: "成功", applyTime: "2026-07-02 14:44:23", completeTime: "2026-07-03 15:53:47", action: "后台 admin" },
  { id: 46, initiator: "男 27岁\n秋刀鱼 | 李会强\n已实名 已签承诺书\n编号：B976071", target: "女 30岁\n小Yang又困 | 方梓涵\n已实名 已签承诺书\n编号：G667599", matchmaker: "芸希老师", payStatus: "已支付", matchStatus: "成功", applyTime: "2026-07-02 13:25:06", completeTime: "2026-07-02 17:09:23", action: "后台 李会强" },
  { id: 45, initiator: "女 25岁\n越可名 | 杨俊芳\n已实名 未签承诺书\n编号：G777211", target: "男 26岁\n我脸1点也不圆 | 张有洲\n已实名 已签承诺书\n编号：B328247", matchmaker: "芸希老师", payStatus: "已支付", matchStatus: "成功", applyTime: "2026-07-02 10:03:53", completeTime: "2026-07-02 16:52:39", action: "后台 李会强" },
  { id: 44, initiator: "女 21岁\n乌龙茶607i | 朱颖\n已实名 未签承诺书\n编号：G714715", target: "男 27岁\n李会强\n已实名 已签承诺书\n编号：B134461", matchmaker: "芸希老师", payStatus: "未支付", matchStatus: "-", applyTime: "2026-06-30 20:40:08", completeTime: "", action: "-" },
  { id: 43, initiator: "男 27岁\n李会强\n已实名 已签承诺书\n编号：B134461", target: "女 23岁\n小猪 | 朱鑫昱\n已实名 未签承诺书\n编号：G916807", matchmaker: "", payStatus: "已支付", matchStatus: "待牵线", applyTime: "2026-06-30 15:27:28", completeTime: "", action: "会员 李会强" },
  { id: 42, initiator: "男 46岁\n出现1 | 张瑞\n已实名 已签承诺书\n编号：B241050", target: "女 28岁\n晕头小狗xox | 黄予方\n已实名 已签承诺书\n编号：G732661", matchmaker: "", payStatus: "已支付", matchStatus: "成功", applyTime: "2026-06-30 13:48:03", completeTime: "2026-07-03 15:53:54", action: "后台 admin" },
];

const searchFields: SearchField[] = [
  { label: "操作人", type: "select", placeholder: "全部操作人", options: [{ label: "全部操作人", value: "" }], width: 140 },
  { label: "服务红娘", type: "select", placeholder: "全部服务红娘", options: [{ label: "全部服务红娘", value: "" }], width: 140 },
  { label: "时间", type: "dateRange" },
  { label: "搜索", type: "select", placeholder: "按申请人昵称搜", options: [{ label: "按申请人昵称搜", value: "nickname" }, { label: "按编号搜", value: "id" }], width: 150 },
  { label: "", type: "input", placeholder: "请输入", width: 180 },
];

const actions: ActionButton[] = [
  { label: "添加牵线记录", variant: "primary" },
  { label: "导出EXCEL", variant: "primary" },
];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("会员服务", "红娘牵线")}
      pageTitle="红娘牵线"
      searchFields={searchFields}
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 20, total: 50 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
