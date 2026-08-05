"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "sn", width: 70 },
  { title: "操作人", key: "operator" },
  {
    title: "操作类型",
    key: "operationType",
    render: (row: Record<string, unknown>) => {
      const type = String(row.operationType ?? "");
      const colorMap: Record<string, string> = {
        "登录": "text-[#3658f7]",
        "新增": "text-[#52c41a]",
        "编辑": "text-[#fa8c16]",
        "删除": "text-[#ff4d4f]",
        "导出": "text-[#722ed1]",
      };
      return <span className={`font-medium ${colorMap[type] || ""}`}>{type}</span>;
    },
  },
  { title: "操作内容", key: "content" },
  { title: "IP地址", key: "ip" },
  { title: "操作时间", key: "operationTime" },
];

const data: Record<string, unknown>[] = [
  { id: 1, sn: 1, operator: "admin", operationType: "登录", content: "登录后台管理系统", ip: "192.168.1.100", operationTime: "2026-07-14 08:00:00" },
  { id: 2, sn: 2, operator: "admin", operationType: "编辑", content: "修改VIP会员价格配置", ip: "192.168.1.100", operationTime: "2026-07-14 09:22:00" },
  { id: 3, sn: 3, operator: "张管理员", operationType: "新增", content: "添加新用户张三", ip: "192.168.1.101", operationTime: "2026-07-14 10:15:00" },
  { id: 4, sn: 4, operator: "李管理员", operationType: "删除", content: "删除过期广告内容", ip: "192.168.1.102", operationTime: "2026-07-13 16:44:00" },
  { id: 5, sn: 5, operator: "王红娘", operationType: "编辑", content: "修改牵线服务配置", ip: "192.168.1.103", operationTime: "2026-07-13 14:33:00" },
  { id: 6, sn: 6, operator: "admin", operationType: "导出", content: "导出本月收入报表", ip: "192.168.1.100", operationTime: "2026-07-13 11:07:00" },
  { id: 7, sn: 7, operator: "张管理员", operationType: "登录", content: "登录后台管理系统", ip: "192.168.1.101", operationTime: "2026-07-12 09:55:00" },
  { id: 8, sn: 8, operator: "赵红娘", operationType: "新增", content: "添加新活动报名记录", ip: "192.168.1.104", operationTime: "2026-07-12 15:22:00" },
  { id: 9, sn: 9, operator: "admin", operationType: "编辑", content: "修改合同模板内容", ip: "192.168.1.100", operationTime: "2026-07-11 10:33:00" },
  { id: 10, sn: 10, operator: "李管理员", operationType: "登录", content: "登录后台管理系统", ip: "192.168.1.102", operationTime: "2026-07-11 08:44:00" },
  { id: 11, sn: 11, operator: "王红娘", operationType: "编辑", content: "修改积分规则配置", ip: "192.168.1.103", operationTime: "2026-07-10 14:11:00" },
  { id: 12, sn: 12, operator: "admin", operationType: "登录", content: "登录后台管理系统", ip: "192.168.1.100", operationTime: "2026-07-10 08:09:00" },
  { id: 13, sn: 13, operator: "张管理员", operationType: "删除", content: "删除测试账号", ip: "192.168.1.101", operationTime: "2026-07-09 16:55:00" },
  { id: 14, sn: 14, operator: "admin", operationType: "编辑", content: "修改系统基本配置", ip: "192.168.1.100", operationTime: "2026-07-09 10:33:00" },
  { id: 15, sn: 15, operator: "王红娘", operationType: "新增", content: "添加新权限分组", ip: "192.168.1.103", operationTime: "2026-07-08 14:07:00" },
];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("系统管理", "系统日志")}
      pageTitle="系统日志"
      searchFields={[
        { label: "操作人", type: "input", placeholder: "请输入操作人" },
        { label: "操作类型", type: "select", options: [
          { label: "全部", value: "" },
          { label: "登录", value: "login" },
          { label: "新增", value: "create" },
          { label: "编辑", value: "edit" },
          { label: "删除", value: "delete" },
          { label: "导出", value: "export" },
        ]},
        { label: "时间范围", type: "dateRange" },
      ]}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: data.length }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
