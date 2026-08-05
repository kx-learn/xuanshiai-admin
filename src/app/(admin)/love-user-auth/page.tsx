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

const data: AuthRow[] = [
  { id: 364, memberName: "hunyun", memberCode: "B470445", realName: "王宇珽", idCard: "330105199306150613", gender: "男", birth: "1993-06-15", issuePlace: "浙江省杭州市", certPhoto: "未上传", verifyMethod: "动作活检", faceProvider: "腾讯云人脸核身", faceScore: "93.39", verifyFile: "", certResult: "认证成功", submitTime: "2026-07-12 11:14:48" },
  { id: 363, memberName: "小稳", memberCode: "B671811", realName: "马鹏稳", idCard: "321284200211031617", gender: "男", birth: "2002-11-03", issuePlace: "江苏省泰州市", certPhoto: "未上传", verifyMethod: "动作活检", faceProvider: "腾讯云人脸核身", faceScore: "93.39", verifyFile: "", certResult: "认证成功", submitTime: "2026-07-09 14:07:51" },
  { id: 362, memberName: "Kellen", memberCode: "B669610", realName: "徐竹轩", idCard: "320582199306298530", gender: "男", birth: "1993-06-29", issuePlace: "江苏省苏州市", certPhoto: "未上传", verifyMethod: "照片对比", faceProvider: "腾讯云人脸核身", faceScore: "95.51", verifyFile: "", certResult: "认证成功", submitTime: "2026-07-05 22:22:01" },
  { id: 361, memberName: "xy", memberCode: "B011925", realName: "谢喻", idCard: "440202200008285330", gender: "男", birth: "2000-08-28", issuePlace: "广东省", certPhoto: "未上传", verifyMethod: "动作活检", faceProvider: "腾讯云人脸核身", faceScore: "96.24", verifyFile: "", certResult: "认证成功", submitTime: "2026-07-05 18:17:43" },
  { id: 360, memberName: "麟", memberCode: "B036800", realName: "张毓麟", idCard: "42060219970623201X", gender: "男", birth: "1997-06-23", issuePlace: "湖北省襄阳市", certPhoto: "未上传", verifyMethod: "照片对比", faceProvider: "腾讯云人脸核身", faceScore: "93.69", verifyFile: "", certResult: "认证成功", submitTime: "2026-07-05 09:29:08" },
  { id: 359, memberName: "昔稠嵘", memberCode: "G746064", realName: "陶佳鹭", idCard: "310114200204271420", gender: "女", birth: "2002-04-27", issuePlace: "上海市上海市", certPhoto: "未上传", verifyMethod: "照片对比", faceProvider: "腾讯云人脸核身", faceScore: "95.51", verifyFile: "", certResult: "认证成功", submitTime: "2026-07-04 18:13:01" },
  { id: 358, memberName: "joker", memberCode: "B715844", realName: "孙毅", idCard: "320111199602020413", gender: "男", birth: "1996-02-02", issuePlace: "江苏省南京市", certPhoto: "未上传", verifyMethod: "照片对比", faceProvider: "腾讯云人脸核身", faceScore: "96.41", verifyFile: "", certResult: "认证成功", submitTime: "2026-07-04 10:55:17" },
  { id: 357, memberName: "手搓大师", memberCode: "G853072", realName: "尹欣", idCard: "440106199205234027", gender: "女", birth: "1992-05-23", issuePlace: "广东省广州市", certPhoto: "未上传", verifyMethod: "照片对比", faceProvider: "腾讯云人脸核身", faceScore: "92.80", verifyFile: "", certResult: "认证成功", submitTime: "2026-07-03 13:01:07" },
  { id: 356, memberName: "璃殇", memberCode: "B650336", realName: "张超睿", idCard: "320104200102130810", gender: "男", birth: "2001-02-13", issuePlace: "江苏省南京市", certPhoto: "未上传", verifyMethod: "照片对比", faceProvider: "腾讯云人脸核身", faceScore: "95.51", verifyFile: "", certResult: "认证成功", submitTime: "2026-07-01 17:50:25" },
  { id: 355, memberName: "秋刀鱼", memberCode: "B245655", realName: "李会强", idCard: "341224199902205657", gender: "男", birth: "1999-02-20", issuePlace: "安徽省阜阳市", certPhoto: "未上传", verifyMethod: "照片对比", faceProvider: "腾讯云人脸核身", faceScore: "96.41", verifyFile: "", certResult: "认证成功", submitTime: "2026-07-01 16:24:19" },
];

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
      pagination={{ current: 1, pageSize: 10, total: 765 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
