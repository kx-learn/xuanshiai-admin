"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "ID", key: "uid", width: 50 },
  { title: "昵称", key: "nickname", width: 300, render: (row) => (
    <div>
      <div>{row.nickname as string}</div>
      <div className="text-xs text-[#999]">{row.phone as string}</div>
    </div>
  )},
  { title: "IP地址", key: "ip", width: 230, render: (row) => (
    <div>
      <div>{row.ip as string}</div>
      <div className="text-xs text-[#999]">IP属地：{row.ipLoc as string}</div>
    </div>
  )},
  { title: "登录时间", key: "loginTime", width: 200 },
  { title: "操作", key: "action", render: () => (
    <span className="text-[#ff4d4f] text-xs cursor-pointer hover:text-[#ff7875]">删除</span>
  )},
];

const data = [
  { id: 1, uid: 762, nickname: "泥絮", phone: "197****2201", ip: "117.147.79.2", ipLoc: "浙江省杭州市钱塘区", loginTime: "2026-07-14 18:07:17" },
  { id: 2, uid: 761, nickname: "fighting", phone: "188****8888", ip: "117.136.111.47", ipLoc: "浙江省杭州市区", loginTime: "2026-07-14 14:35:58" },
  { id: 3, uid: 760, nickname: "Oᴗoಣ", phone: "197****0945", ip: "39.144.124.73", ipLoc: "浙江省市区", loginTime: "2026-07-14 14:25:28" },
  { id: 4, uid: 759, nickname: "nkk", phone: "197****2884", ip: "117.147.79.2", ipLoc: "浙江省杭州市钱塘区", loginTime: "2026-07-14 14:14:42" },
  { id: 5, uid: 758, nickname: "唱起那首笑忘歌", phone: "159****0438", ip: "117.62.168.169", ipLoc: "江苏省南京市浦口区", loginTime: "2026-07-13 22:31:44" },
  { id: 6, uid: 757, nickname: "事缓则圆", phone: "183****8537", ip: "121.229.178.56", ipLoc: "江苏省南京市栖霞区", loginTime: "2026-07-13 20:46:27" },
  { id: 7, uid: 756, nickname: "A刘东", phone: "198****1666", ip: "223.104.158.201", ipLoc: "江苏省盐城市区", loginTime: "2026-07-12 15:54:01" },
  { id: 8, uid: 755, nickname: "hunyun", phone: "188****3701", ip: "60.176.123.11", ipLoc: "浙江省杭州市上城区", loginTime: "2026-07-12 10:58:31" },
  { id: 9, uid: 754, nickname: "張.先生", phone: "138****8611", ip: "180.98.162.44", ipLoc: "江苏省苏州市区", loginTime: "2026-07-11 15:23:56" },
  { id: 10, uid: 753, nickname: "zack", phone: "182****8908", ip: "183.192.39.103", ipLoc: "上海市浦东区", loginTime: "2026-07-11 12:19:34" },
];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("平台账号", "登录日志")}
      pageTitle=""
      searchFields={[
        { label: "昵称", type: "input", placeholder: "请输入昵称", width: 180 },
        { label: "IP地址", type: "input", placeholder: "请输入IP地址", width: 180 },
        { label: "登录时间", type: "dateRange" },
      ]}
      actions={[{ label: "一键删除全部日志", variant: "primary" }]}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 1834 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
