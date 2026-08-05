"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type ActionButton, type SearchField, type TabConfig } from "@/components/ListPage";

const tabs: TabConfig[] = [
  { key: "lead", label: "线索管理" },
  { key: "abandoned", label: "弃海客源(0)" },
  { key: "abandonedLog", label: "弃海记录" },
];

const columns: ColumnDef[] = [
  { title: "客源ID", key: "customerId", width: 70, align: "center" },
  {
    title: "资料",
    key: "profile",
    width: 240,
    render: (row: Record<string, unknown>) => (
      <div className="text-xs leading-relaxed">
        <div className="font-medium">{(row.profileSummary as string)}</div>
        <div className="flex gap-1 mt-0.5">
          <span className="text-[#3658f7] cursor-pointer hover:underline">基本资料</span>
          <span className="text-[#3658f7] cursor-pointer hover:underline">择偶要求</span>
          <span className="text-[#3658f7] cursor-pointer hover:underline">跟进信息</span>
          <span className="text-[#3658f7] cursor-pointer hover:underline">更多</span>
        </div>
      </div>
    ),
  },
  {
    title: "客户意向",
    key: "intention",
    width: 100,
    render: () => (
      <select className="h-7 px-2 text-xs border border-[#d9d9d9] rounded bg-white">
        <option>请选择</option>
      </select>
    ),
  },
  { title: "来源", key: "source", width: 80 },
  {
    title: "审核",
    key: "verify",
    width: 60,
    render: (row: Record<string, unknown>) => {
      const v = row.verify as string;
      return <span className={v === "有效" ? "text-[#52c41a]" : "text-[#999]"}>{v}</span>;
    },
  },
  {
    title: "录入人",
    key: "recorder",
    width: 150,
    render: (row: Record<string, unknown>) => (
      <div className="text-xs leading-relaxed">
        <div>{row.recorderName as string}</div>
        <div className="text-[#999]">{row.recorderTime as string}</div>
      </div>
    ),
  },
  {
    title: "状态",
    key: "matchStatus",
    width: 100,
    render: (row: Record<string, unknown>) => (
      <div className="text-xs leading-relaxed">
        <div>{row.matchStatus as string}</div>
        <div className="text-[#999]">{row.matchStatusDate as string}</div>
      </div>
    ),
  },
  {
    title: "分派跟进",
    key: "assignFollow",
    width: 100,
    render: (row: Record<string, unknown>) => {
      const v = row.assignFollow as string;
      const d = row.assignDate as string;
      return (
        <div className="text-xs leading-relaxed">
          <div>{v}</div>
          {d ? <div className="text-[#999]">{d}</div> : null}
        </div>
      );
    },
  },
  {
    title: "跟进",
    key: "followUp",
    width: 130,
    render: (row: Record<string, unknown>) => (
      <div className="text-xs leading-relaxed text-[#ff4d4f]">
        <div>{row.followUp as string}</div>
        {row.followUpDays ? <div>{row.followUpDays as string}</div> : null}
      </div>
    ),
  },
  {
    title: "通话",
    key: "callStatus",
    width: 80,
    render: (row: Record<string, unknown>) => (
      <span className="text-xs text-[#999]">{row.callStatus as string}</span>
    ),
  },
  {
    title: "入库状态",
    key: "entryStatus",
    width: 120,
    render: (row: Record<string, unknown>) => {
      const v = row.entryStatus as string;
      const code = row.entryCode as string;
      if (v === "未入库") return <span className="text-xs text-[#fa8c16]">未入库</span>;
      return (
        <div className="text-xs leading-relaxed">
          <span className="text-[#52c41a]">已入库</span>
          {code ? <span className="text-[#999] ml-1">{code}</span> : null}
        </div>
      );
    },
  },
  {
    title: "操作",
    key: "action",
    width: 120,
    render: (row: Record<string, unknown>) => {
      const action = row.actionText as string;
      if (action === "一键入库") {
        return <span className="text-[#3658f7] cursor-pointer hover:underline text-xs">一键入库</span>;
      }
      if (action === "放入弃海") {
        return <span className="text-[#ff4d4f] cursor-pointer hover:underline text-xs">放入弃海</span>;
      }
      return <span className="text-[#3658f7] cursor-pointer hover:underline text-xs">查看会员</span>;
    },
  },
];

const data: Record<string, unknown>[] = [
  { customerId: "6", profileSummary: "男 31岁 琴琴 有电话", source: "-", verify: "有效", recorderName: "管理员刘佳", recorderTime: "2026-06-04 17:09:29", matchStatus: "待分派", matchStatusDate: "", assignFollow: "未设置", assignDate: "", followUp: "从未跟进", followUpDays: "40天未跟进", callStatus: "从未通话", entryStatus: "已入库", entryCode: "B970357", actionText: "查看会员" },
  { customerId: "5", profileSummary: "男 31岁 毛毛 有电话", source: "-", verify: "有效", recorderName: "管理员admin", recorderTime: "2026-05-27 20:34:05", matchStatus: "待分派", matchStatusDate: "", assignFollow: "未设置", assignDate: "", followUp: "从未跟进", followUpDays: "48天未跟进", callStatus: "从未通话", entryStatus: "未入库", entryCode: "", actionText: "一键入库" },
  { customerId: "4", profileSummary: "男 30岁 荔枝 有微信 171cm 未婚", source: "抖音", verify: "有效", recorderName: "服务红娘乐乐", recorderTime: "2026-05-15 15:25:43", matchStatus: "待分派", matchStatusDate: "2026-05-15 15:25:43", assignFollow: "未设置", assignDate: "", followUp: "从未跟进", followUpDays: "60天未跟进", callStatus: "从未通话", entryStatus: "已入库", entryCode: "B675838", actionText: "查看会员" },
  { customerId: "3", profileSummary: "男 32岁 羊羊羊 有微信 167cm 本科 8千-1万元 离异不带孩", source: "抖音", verify: "有效", recorderName: "服务红娘乐乐", recorderTime: "2026-05-15 15:20:23", matchStatus: "待分派", matchStatusDate: "2026-05-15 15:20:23", assignFollow: "未设置", assignDate: "", followUp: "从未跟进", followUpDays: "60天未跟进", callStatus: "从未通话", entryStatus: "已入库", entryCode: "B361428", actionText: "查看会员" },
  { customerId: "2", profileSummary: "男 27岁 李鑫 有微信 181cm 本科 8千-1万元 未婚", source: "抖音", verify: "有效", recorderName: "服务红娘乐乐", recorderTime: "2026-05-15 14:01:56", matchStatus: "待分派", matchStatusDate: "2026-05-15 14:01:56", assignFollow: "找对象中", assignDate: "", followUp: "从未跟进", followUpDays: "60天未跟进", callStatus: "从未通话", entryStatus: "已入库", entryCode: "B337928", actionText: "查看会员" },
  { customerId: "1", profileSummary: "男 32岁 夏成希 有电话 177cm 硕士 年入百万 未婚", source: "其他渠道", verify: "有效", recorderName: "-", recorderTime: "2026-05-13 16:41:29", matchStatus: "待分派", matchStatusDate: "", assignFollow: "未设置", assignDate: "", followUp: "从未跟进", followUpDays: "62天未跟进", callStatus: "从未通话", entryStatus: "已入库", entryCode: "B323032", actionText: "查看会员" },
];

const searchFields: SearchField[] = [
  { label: "用户", type: "input", placeholder: "请输入", width: 180 },
  { label: "相亲状态", type: "select", options: [{ label: "全部", value: "" }, { label: "找对象中", value: "searching" }, { label: "待分派", value: "pending" }], width: 140 },
  { label: "来源", type: "select", options: [{ label: "全部", value: "" }, { label: "抖音", value: "douyin" }, { label: "其他渠道", value: "other" }], width: 130 },
  { label: "入库时间", type: "dateRange" },
];

const actions: ActionButton[] = [
  { label: "添加客源", variant: "primary" },
  { label: "智能录入", variant: "primary" },
  { label: "数据报表", variant: "primary" },
  { label: "导出EXCEL", variant: "primary" },
];

export default function LoveCustomerListPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("客源线索", "线索管理")}
      pageTitle="线索管理"
      tabs={tabs}
      activeTab="lead"
      searchFields={searchFields}
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="customerId"
      pagination={{ current: 1, pageSize: 10, total: 6 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
