"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import { useState } from "react";
import ListPage, { type ColumnDef, type ActionButton } from "@/components/ListPage";

const tabs = [
  { key: "accounts", label: "账号管理" },
  { key: "canceled", label: "注销申请" },
];

const accountCols: ColumnDef[] = [
  { title: "ID", key: "id", width: 65 },
  { title: "头像", key: "avatar", width: 55, render: () => (
    <div className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center text-xs text-[#999]">👤</div>
  )},
  { title: "账号", key: "account", render: (row) => (
    <div>
      <span>{row.nickname as string}</span>
      <span className="text-xs text-[#999] ml-1">{row.phone as string}</span>
      <div className="text-xs text-[#999]">手机属地：{row.phoneLocation as string}{row.location as string}</div>
    </div>
  )},
  { title: "推广人", key: "promoter", width: 110, render: (row) => row.promoter ? <span className="text-xs">{row.promoter as string}</span> : <span className="text-[#999]">-</span> },
  { title: "相亲会员", key: "isLoveMember", width: 80, render: (row) => row.isLoveMember
    ? <span className="inline-block px-2 py-0.5 text-xs bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f] rounded">是</span>
    : <span className="inline-block px-2 py-0.5 text-xs text-[#999] border border-[#d9d9d9] rounded">不是</span>
  },
  { title: "积分", key: "points", width: 55 },
  { title: "余额", key: "balance", width: 120, render: (row) => (<>{row.balance as string} <a className="text-[#3658f7] text-xs cursor-pointer hover:text-[#5281f3]">修改</a></>) },
  { title: "注册IP", key: "ip", width: 210, render: (row) => (<div><div>{row.ip as string}</div><div className="text-xs text-[#999]">IP属地：{row.ipLocation as string}</div></div>) },
  { title: "时间", key: "time", width: 220, render: (row) => (<div className="text-xs"><div>登录次数：{row.loginCount as string}</div><div className="text-[#999]">注册时间：{row.registerTime as string}</div><div className="text-[#999]">最后登录：{row.lastLogin as string}</div></div>) },
  { title: "线索入库", key: "leadStatus", width: 80, render: (row) => row.leadIn ? <a className="text-[#3658f7] text-xs cursor-pointer hover:text-[#5281f3]">入库线索</a> : <span className="text-[#999]">-</span> },
  { title: "操作", key: "actions", width: 180, render: () => (<div className="flex items-center gap-1.5 whitespace-nowrap"><span className="inline-block px-1.5 py-0.5 text-xs bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f] rounded">正常</span><a className="text-[#3658f7] text-xs cursor-pointer hover:text-[#5281f3]">编辑</a><a className="text-[#3658f7] text-xs cursor-pointer hover:text-[#5281f3]">登录</a><a className="text-[#ff4d4f] text-xs cursor-pointer hover:text-[#ff7875]">删除</a></div>) },
];

const canceledCols: ColumnDef[] = [
  { title: "ID", key: "id", width: 65 },
  { title: "账号", key: "account", render: (row) => (
    <div>
      <div className="text-sm">{row.nickname as string}</div>
      <div className="text-xs text-[#999]">{row.phone as string}</div>
    </div>
  )},
  { title: "申请注销时间", key: "applyTime" },
  { title: "IP地址", key: "ip", render: (row) => (<div><div>{row.ip as string}</div><div className="text-xs text-[#999]">IP属地：{row.ipLoc as string}</div></div>) },
  { title: "会员资料关联", key: "memberLink", width: 120, render: (row) => row.memberLink ? <a className="text-[#3658f7] text-xs cursor-pointer hover:text-[#5281f3]">查看资料</a> : <span className="text-[#999]">-</span> },
  { title: "推广红娘关联", key: "promoteLink", width: 120, render: (row) => row.promoteLink ? <a className="text-[#3658f7] text-xs cursor-pointer hover:text-[#5281f3]">查看红娘</a> : <span className="text-[#999]">-</span> },
  { title: "合伙红娘关联", key: "partnerLink", width: 120, render: (row) => row.partnerLink ? <a className="text-[#3658f7] text-xs cursor-pointer hover:text-[#5281f3]">查看红娘</a> : <span className="text-[#999]">-</span> },
  { title: "服务红娘关联", key: "svcLink", width: 120, render: (row) => row.svcLink ? <a className="text-[#3658f7] text-xs cursor-pointer hover:text-[#5281f3]">查看红娘</a> : <span className="text-[#999]">-</span> },
  { title: "状态", key: "status", width: 90, render: (row) => {
    const s = row.status as string;
    if (s === "待审核") return <span className="inline-block px-2 py-0.5 text-xs bg-[#fff7e6] text-[#fa8c16] border border-[#ffd591] rounded">待审核</span>;
    if (s === "已注销") return <span className="inline-block px-2 py-0.5 text-xs bg-[#fff1f0] text-[#ff4d4f] border border-[#ffa39e] rounded">已注销</span>;
    if (s === "已拒绝") return <span className="inline-block px-2 py-0.5 text-xs text-[#999] border border-[#d9d9d9] rounded">已拒绝</span>;
    return <span className="text-xs">{s}</span>;
  }},
  { title: "操作", key: "actions", width: 120, render: (row) => (
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      {row.status === "待审核" ? <>
        <a className="text-[#3658f7] text-xs cursor-pointer hover:text-[#5281f3]">通过</a>
        <a className="text-[#ff4d4f] text-xs cursor-pointer hover:text-[#ff7875]">拒绝</a>
      </> : <span className="text-[#999] text-xs">-</span>}
    </div>
  )},
];

const accountData = [
  { id: 762, nickname: "泥絮", phone: "197****2201", phoneLocation: "-", location: "未知未知", promoter: null, isLoveMember: true, points: 0, balance: "0元", ip: "117.147.79.2", ipLocation: "浙江省杭州市钱塘区", loginCount: 1, registerTime: "2026-07-14 18:07:17", lastLogin: "2026-07-14 18:07:17", leadIn: false },
  { id: 761, nickname: "fighting", phone: "-", phoneLocation: "-", location: "-", promoter: null, isLoveMember: false, points: 0, balance: "0元", ip: "117.136.111.47", ipLocation: "浙江省杭州市区", loginCount: 1, registerTime: "2026-07-14 14:35:58", lastLogin: "2026-07-14 14:35:58", leadIn: true },
  { id: 760, nickname: "Oᴗoಣ", phone: "197****0945", phoneLocation: "-", location: "未知未知", promoter: null, isLoveMember: true, points: 0, balance: "0元", ip: "39.144.124.73", ipLocation: "浙江省市区", loginCount: 3, registerTime: "2026-07-14 14:25:28", lastLogin: "2026-07-14 16:45:00", leadIn: false },
  { id: 759, nickname: "nkk", phone: "197****2884", phoneLocation: "-", location: "未知未知", promoter: null, isLoveMember: false, points: 0, balance: "0元", ip: "117.147.79.2", ipLocation: "浙江省杭州市钱塘区", loginCount: 1, registerTime: "2026-07-14 14:14:42", lastLogin: "2026-07-14 14:14:42", leadIn: true },
  { id: 758, nickname: "唱起那首笑忘歌", phone: "159****0438", phoneLocation: "-", location: "未知未知", promoter: null, isLoveMember: true, points: 0, balance: "0元", ip: "117.62.168.169", ipLocation: "江苏省南京市浦口区", loginCount: 1, registerTime: "2026-07-13 22:31:44", lastLogin: "2026-07-13 22:31:44", leadIn: false },
  { id: 757, nickname: "事缓则圆", phone: "183****8537", phoneLocation: "-", location: "未知未知", promoter: null, isLoveMember: false, points: 0, balance: "0元", ip: "121.229.178.56", ipLocation: "江苏省南京市栖霞区", loginCount: 1, registerTime: "2026-07-13 20:46:27", lastLogin: "2026-07-13 20:46:27", leadIn: true },
  { id: 756, nickname: "A刘东", phone: "198****1666", phoneLocation: "-", location: "未知未知", promoter: null, isLoveMember: false, points: 0, balance: "0元", ip: "223.104.158.201", ipLocation: "江苏省盐城市区", loginCount: 2, registerTime: "2026-07-12 15:54:01", lastLogin: "2026-07-12 15:54:01", leadIn: true },
  { id: 755, nickname: "hunyun", phone: "188****3701", phoneLocation: "-", location: "未知未知", promoter: null, isLoveMember: true, points: 0, balance: "0元", ip: "60.176.123.11", ipLocation: "浙江省杭州市上城区", loginCount: 2, registerTime: "2026-07-12 10:58:31", lastLogin: "2026-07-12 11:05:00", leadIn: false },
  { id: 754, nickname: "張.先生", phone: "138****8611", phoneLocation: "-", location: "未知未知", promoter: null, isLoveMember: true, points: 0, balance: "0元", ip: "180.98.162.44", ipLocation: "江苏省苏州市区", loginCount: 1, registerTime: "2026-07-11 15:23:56", lastLogin: "2026-07-11 15:23:56", leadIn: false },
  { id: 753, nickname: "zack", phone: "182****8908", phoneLocation: "-", location: "未知未知", promoter: null, isLoveMember: false, points: 0, balance: "0元", ip: "183.192.39.103", ipLocation: "上海市浦东区", loginCount: 1, registerTime: "2026-07-11 12:19:34", lastLogin: "2026-07-11 12:19:34", leadIn: true },
];

const canceledData = [
  { id: 321, nickname: "用户A001", phone: "138****1234", ip: "120.243.101.155", ipLoc: "安徽省蚌埠市区", applyTime: "2026-07-13 15:30:22", memberLink: true, promoteLink: false, partnerLink: false, svcLink: true, status: "待审核" },
  { id: 320, nickname: "用户B002", phone: "159****5678", ip: "58.212.250.160", ipLoc: "江苏省南京市浦口区", applyTime: "2026-07-12 10:15:33", memberLink: true, promoteLink: true, partnerLink: false, svcLink: false, status: "已注销" },
  { id: 319, nickname: "用户C003", phone: "186****9012", ip: "113.232.131.140", ipLoc: "辽宁省沈阳市浑南区", applyTime: "2026-07-10 08:45:11", memberLink: false, promoteLink: false, partnerLink: true, svcLink: false, status: "已拒绝" },
  { id: 318, nickname: "用户D004", phone: "177****3456", ip: "112.22.189.158", ipLoc: "江苏省南京市秦淮区", applyTime: "2026-07-08 20:12:44", memberLink: true, promoteLink: false, partnerLink: false, svcLink: false, status: "待审核" },
  { id: 317, nickname: "用户E005", phone: "133****7890", ip: "117.147.79.2", ipLoc: "浙江省杭州市钱塘区", applyTime: "2026-07-05 14:00:05", memberLink: true, promoteLink: true, partnerLink: true, svcLink: true, status: "已注销" },
];

export default function Page() {
  const [activeTab, setActiveTab] = useState("accounts");

  const isCanceled = activeTab === "canceled";

  return (
    <ListPage
      breadcrumb={getBreadcrumb("平台账号", "账号管理")}
      pageTitle=""
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      searchFields={isCanceled ? [
        { label: "昵称", type: "input" as const, placeholder: "请输入昵称", width: 180 },
        { label: "手机", type: "input" as const, placeholder: "请输入手机号", width: 180 },
        { label: "注销时间", type: "dateRange" as const },
      ] : [
        { label: "昵称", type: "input" as const, placeholder: "请输入昵称", width: 180 },
        { label: "手机", type: "input" as const, placeholder: "请输入手机号", width: 180 },
      ]}
      actions={isCanceled ? [] : [
        { label: "添加账号", variant: "primary" },
        { label: "导出账号资料", variant: "default" },
        { label: "一键更新全部账号IP属地", variant: "default" },
        { label: "一键更新全部账号手机属地", variant: "default" },
      ]}
      columns={isCanceled ? canceledCols : accountCols}
      dataSource={isCanceled ? canceledData : accountData}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: isCanceled ? 23 : 11536 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
