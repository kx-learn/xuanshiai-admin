"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const tabs = [{ key: "realname", label: "实名认证" }];

const columns: ColumnDef[] = [
  { title: "会员", key: "nickname" }, { title: "真实姓名", key: "real_name" }, { title: "身份证号", key: "id_card" },
  { title: "性别", key: "gender" }, { title: "认证状态", key: "auth_status" }, { title: "提交时间", key: "submitted_at" },
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

const dataSource: Record<string, unknown>[] = [];

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
      endpoint="/api/backend/admin/matchmaker/members/auth"
      pagination={{ current: 1, pageSize: 20, total: 0 }}
      onSearch={() => undefined}
      onReset={() => undefined}
    />
  );
}
