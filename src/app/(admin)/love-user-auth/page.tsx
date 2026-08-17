"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const tabs = [
  { key: "realname", label: "实名认证" },
  { key: "promise", label: "会员承诺" },
  { key: "marriage", label: "婚姻状况" },
  { key: "house", label: "房产认证" },
  { key: "education", label: "学历认证" },
  { key: "other", label: "其他认证" },
  { key: "all", label: "全部" },
];

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 50, align: "center" },
  {
    title: "会员",
    key: "member",
    width: 240,
    render: (row: Record<string, unknown>) => (
      <div className="text-xs leading-relaxed">
        <div>{(row as { memberName: string }).memberName}</div>
        <div className="text-[#999]">编号：{(row as { memberCode: string }).memberCode}</div>
        <div className="text-[#999]">姓名：{(row as { realName: string }).realName}</div>
        <div className="text-[#999]">身份证：{(row as { idCard: string }).idCard}</div>
      </div>
    ),
  },
  {
    title: "证件信息",
    key: "certInfo",
    width: 160,
    render: (row: Record<string, unknown>) => (
      <div className="text-xs leading-relaxed">
        <div>性别：{(row as { gender: string }).gender}</div>
        <div>出生：{(row as { birth: string }).birth}</div>
        <div>发证：{(row as { issuePlace: string }).issuePlace}</div>
      </div>
    ),
  },
  { title: "证件照片", key: "certPhoto", width: 80, align: "center" },
  { title: "验证方式", key: "verifyMethod", width: 90 },
  { title: "人脸服务商", key: "faceProvider", width: 130 },
  { title: "人脸比对得分", key: "faceScore", width: 110, align: "center" },
  { title: "核验文件", key: "verifyFile", width: 80 },
  {
    title: "认证结果",
    key: "certResult",
    width: 90,
    render: (row: Record<string, unknown>) => {
      const v = (row as { certResult: string }).certResult;
      return (
        <span className={v === "认证成功" ? "inline-block px-2 py-0.5 text-xs rounded bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]" : "inline-block px-2 py-0.5 text-xs rounded bg-[#fff1f0] text-[#ff4d4f] border border-[#ffa39e]"}>
          {v}
        </span>
      );
    },
  },
  { title: "提交认证时间", key: "submitTime", width: 150 },
  {
    title: "操作",
    key: "action",
    width: 90,
    render: () => (
      <span className="text-[#3658f7] cursor-pointer hover:underline text-xs">查看资料</span>
    ),
  },
];

interface AuthRow {
  id: number;
  memberName: string;
  memberCode: string;
  realName: string;
  idCard: string;
  gender: string;
  birth: string;
  issuePlace: string;
  certPhoto: string;
  verifyMethod: string;
  faceProvider: string;
  faceScore: string;
  verifyFile: string;
  certResult: string;
  submitTime: string;
}

const data: AuthRow[] = [];

const dataSource = data as unknown as Record<string, unknown>[];

export default function LoveUserAuthPage() {
  return (
    <ListPage
      breadcrumb={[...getBreadcrumb("会员CRM", "会员认证"), { label: "实名认证" }]}
      pageTitle="实名认证"
      tabs={tabs}
      activeTab="realname"
      columns={columns}
      dataSource={dataSource}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
