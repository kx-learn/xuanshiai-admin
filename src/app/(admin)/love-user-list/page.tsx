"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type ActionButton, type SearchField, type TabConfig } from "@/components/ListPage";

const tabs: TabConfig[] = [
  { key: "members", label: "会员资料" },
  { key: "abandoned", label: "弃海会员(17)" },
  { key: "abandonedLog", label: "弃海记录" },
];

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60, align: "center" },
  {
    title: "头像",
    key: "avatar",
    width: 60,
    align: "center",
    render: (row: Record<string, unknown>) => (
      <div className="relative inline-block">
        <div className="w-9 h-9 rounded-full bg-[#e8edf5] flex items-center justify-center text-xs text-[#3658f7]">
          {(row.gender as string) === "男" ? "M" : "F"}
        </div>
        {row.isNew ? (
          <span className="absolute -top-1 -right-1 text-[10px] bg-[#ff4d4f] text-white px-1 rounded leading-tight">新</span>
        ) : null}
      </div>
    ),
  },
  {
    title: "资料",
    key: "profile",
    width: 320,
    render: (row: Record<string, unknown>) => (
      <div className="text-xs leading-relaxed">
        <div className="font-medium">{(row.gender as string)} {(row.age as string)}岁</div>
        <div className="text-[#333]">
          <span className="font-medium">{row.nickname as string}</span>
          <span className={row.realNameStatus === "已实名" ? "text-[#52c41a] ml-1" : "text-[#999] ml-1"}>{(row.realNameStatus as string)}</span>
          <span className="text-[#999] ml-1">{row.memberId as string}</span>
        </div>
        <div className="text-[#666] mt-0.5">{(row.birthYear as string)}年 / {(row.height as string)}cm / {(row.education as string)} / {(row.income as string)} / {(row.maritalStatus as string)}</div>
        <div className="text-[#666]">籍贯{(row.hometown as string)} / 现居{(row.currentCity as string)}</div>
        <div className="flex gap-1 mt-1">
          <span className="text-[#3658f7] cursor-pointer hover:underline">详细资料</span>
          <span className="text-[#3658f7] cursor-pointer hover:underline">服务跟进</span>
          <span className="text-[#3658f7] cursor-pointer hover:underline">牵线记录</span>
          <span className="text-[#3658f7] cursor-pointer hover:underline">更多</span>
        </div>
      </div>
    ),
  },
  {
    title: "审核",
    key: "audit",
    width: 80,
    render: (row: Record<string, unknown>) => {
      const audit = row.audit as string;
      const fee = row.auditFee as string;
      const auditColor = audit === "通过" ? "text-[#52c41a]" : "text-[#fa8c16]";
      return (
        <div className="text-xs leading-relaxed">
          <span className={auditColor}>{audit}</span>
          <div className="text-[#999]">{fee}</div>
        </div>
      );
    },
  },
  {
    title: "状态/级别",
    key: "statusLevel",
    width: 100,
    render: (row: Record<string, unknown>) => (
      <div className="text-xs leading-relaxed">
        <div>{(row.visibility as string)}</div>
        <div className="text-[#999]">{row.memberLevel as string}</div>
      </div>
    ),
  },
  {
    title: "红娘",
    key: "matchmakerInfo",
    width: 160,
    render: (row: Record<string, unknown>) => (
      <div className="text-xs leading-relaxed">
        <div>跟进：{row.followMatchmaker as string}</div>
        <div>推广：{row.promotionMatchmaker as string}</div>
      </div>
    ),
  },
  {
    title: "跟进",
    key: "followUp",
    width: 130,
    render: (row: Record<string, unknown>) => (
      <div className="text-xs leading-relaxed">
        <span className="text-[#ff4d4f]">{(row.followUpStatus as string)}</span>
        {row.followUpDays ? <span className="text-[#ff4d4f] ml-1">{(row.followUpDays as string)}</span> : null}
        <div className="text-[#ff4d4f] cursor-pointer hover:underline">{row.abandonAction as string}</div>
      </div>
    ),
  },
  {
    title: "客户意向",
    key: "intention",
    width: 90,
    render: () => (
      <select className="h-7 px-2 text-xs border border-[#d9d9d9] rounded bg-white">
        <option>请选择</option>
      </select>
    ),
  },
  {
    title: "来源/注册/登录/分派时间",
    key: "sourceTime",
    width: 170,
    render: (row: Record<string, unknown>) => (
      <div className="text-xs leading-relaxed">
        <div>{row.registerSource as string}</div>
        <div className="text-[#666]">注册：{row.registerTime as string}</div>
        {row.lastLoginTime ? <div className="text-[#666]">最后：{row.lastLoginTime as string}</div> : null}
      </div>
    ),
  },
];

const data: Record<string, unknown>[] = [
  { id: "663", isNew: true, gender: "男", age: "36", nickname: "泥絮", realNameStatus: "未实名", memberId: "B914415", birthYear: "1990", height: "175", education: "大专", income: "8千-1万元", maritalStatus: "未婚", hometown: "南京市", currentCity: "南京市", audit: "待审", auditFee: "免审核费", visibility: "公开相亲", memberLevel: "普通会员", followMatchmaker: "芸希老师", promotionMatchmaker: "-", followUpStatus: "从未跟进", followUpDays: "", abandonAction: "放入弃海", registerSource: "自己注册", registerTime: "2026-07-14 18:40:19", lastLoginTime: "" },
  { id: "662", isNew: true, gender: "女", age: "36", nickname: "Oᴗoಣ", realNameStatus: "未实名", memberId: "G239989", birthYear: "1990", height: "175", education: "博士", income: "年入百万", maritalStatus: "未婚", hometown: "南京市", currentCity: "南京市", audit: "待审", auditFee: "免审核费", visibility: "公开相亲", memberLevel: "普通会员", followMatchmaker: "芸希老师", promotionMatchmaker: "-", followUpStatus: "从未跟进", followUpDays: "", abandonAction: "放入弃海", registerSource: "自己注册", registerTime: "2026-07-14 17:20:31", lastLoginTime: "" },
  { id: "661", isNew: true, gender: "女", age: "33", nickname: "唱起那首笑忘歌", realNameStatus: "未实名", memberId: "G533829", birthYear: "1993", height: "158", education: "本科", income: "1-2万元", maritalStatus: "未婚", hometown: "南京市浦口区", currentCity: "南京市", audit: "待审", auditFee: "免审核费", visibility: "公开相亲", memberLevel: "普通会员", followMatchmaker: "芸希老师", promotionMatchmaker: "-", followUpStatus: "从未跟进", followUpDays: "1天未跟进", abandonAction: "放入弃海", registerSource: "自己注册", registerTime: "2026-07-13 22:35:01", lastLoginTime: "" },
  { id: "660", isNew: true, gender: "女", age: "27", nickname: "rasin", realNameStatus: "未实名", memberId: "G847150", birthYear: "1999", height: "167", education: "本科", income: "1-2万元", maritalStatus: "未婚", hometown: "南京市建邺区", currentCity: "南京市鼓楼区", audit: "待审", auditFee: "免审核费", visibility: "公开相亲", memberLevel: "普通会员", followMatchmaker: "芸希老师", promotionMatchmaker: "Sofia", followUpStatus: "从未跟进", followUpDays: "2天未跟进", abandonAction: "放入弃海", registerSource: "自己注册", registerTime: "2026-07-12 20:39:37", lastLoginTime: "2026-07-13 15:49:28" },
  { id: "659", isNew: true, gender: "男", age: "33", nickname: "hunyun", realNameStatus: "已实名", memberId: "B470445", birthYear: "1993", height: "178", education: "博士", income: "2万以上", maritalStatus: "未婚", hometown: "杭州市拱墅区", currentCity: "杭州市萧山区", audit: "待审", auditFee: "免审核费", visibility: "公开相亲", memberLevel: "普通会员", followMatchmaker: "芸希老师", promotionMatchmaker: "-", followUpStatus: "从未跟进", followUpDays: "2天未跟进", abandonAction: "放入弃海", registerSource: "自己注册", registerTime: "2026-07-12 11:09:53", lastLoginTime: "" },
  { id: "658", isNew: true, gender: "男", age: "39", nickname: "張.先生", realNameStatus: "未实名", memberId: "B598549", birthYear: "1987", height: "181", education: "大专", income: "3-5千元", maritalStatus: "离异未育", hometown: "南京市秦淮区", currentCity: "南京市秦淮区", audit: "待审", auditFee: "免审核费", visibility: "公开相亲", memberLevel: "普通会员", followMatchmaker: "芸希老师", promotionMatchmaker: "-", followUpStatus: "从未跟进", followUpDays: "3天未跟进", abandonAction: "放入弃海", registerSource: "自己注册", registerTime: "2026-07-11 15:29:43", lastLoginTime: "" },
  { id: "657", isNew: false, gender: "女", age: "31", nickname: "Thera", realNameStatus: "未实名", memberId: "G824771", birthYear: "1995", height: "165", education: "本科", income: "2万以上", maritalStatus: "未婚", hometown: "威海市乳山市", currentCity: "北京市朝阳区", audit: "通过", auditFee: "免审核费", visibility: "公开相亲", memberLevel: "普通会员", followMatchmaker: "芸希老师", promotionMatchmaker: "Sofia", followUpStatus: "从未跟进", followUpDays: "4天未跟进", abandonAction: "放入弃海", registerSource: "自己注册", registerTime: "2026-07-10 14:10:38", lastLoginTime: "" },
  { id: "656", isNew: false, gender: "女", age: "23", nickname: "优米", realNameStatus: "未实名", memberId: "G411232", birthYear: "2003", height: "175", education: "本科", income: "8千-1万元", maritalStatus: "未婚", hometown: "南京市", currentCity: "南京市", audit: "通过", auditFee: "免审核费", visibility: "公开相亲", memberLevel: "普通会员", followMatchmaker: "芸希老师", promotionMatchmaker: "-", followUpStatus: "从未跟进", followUpDays: "5天未跟进", abandonAction: "放入弃海", registerSource: "自己注册", registerTime: "2026-07-09 16:27:07", lastLoginTime: "" },
  { id: "655", isNew: false, gender: "男", age: "24", nickname: "小稳", realNameStatus: "已实名", memberId: "B671811", birthYear: "2002", height: "180", education: "本科", income: "5-8千元", maritalStatus: "未婚", hometown: "泰州市姜堰市", currentCity: "南京市浦口区", audit: "通过", auditFee: "免审核费", visibility: "公开相亲", memberLevel: "普通会员", followMatchmaker: "芸希老师", promotionMatchmaker: "-", followUpStatus: "从未跟进", followUpDays: "5天未跟进", abandonAction: "放入弃海", registerSource: "自己注册", registerTime: "2026-07-09 14:07:04", lastLoginTime: "2026-07-10 14:59:38" },
];

const searchFields: SearchField[] = [
  { label: "用户", type: "input", placeholder: "请输入", width: 180 },
  { label: "审核状态", type: "select", options: [{ label: "全部", value: "" }, { label: "待审", value: "pending" }, { label: "通过", value: "approved" }], width: 120 },
  { label: "会员级别", type: "select", options: [{ label: "全部", value: "" }, { label: "普通会员", value: "normal" }, { label: "VIP会员", value: "vip" }], width: 130 },
  { label: "注册时间", type: "dateRange" },
];

const actions: ActionButton[] = [
  { label: "添加资料", variant: "primary" },
  { label: "智能录入", variant: "primary" },
  { label: "批量导入资料", variant: "primary" },
  { label: "导出EXCEL", variant: "primary" },
];

export default function LoveUserListPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("会员CRM", "资料管理")}
      pageTitle="会员资料"
      tabs={tabs}
      activeTab="members"
      searchFields={searchFields}
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 20, total: 640 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
