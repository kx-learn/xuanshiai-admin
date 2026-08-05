"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "图标位置", key: "position" },
  { title: "当前图标", key: "preview" },
  { title: "图标名称", key: "iconName" },
  { title: "最佳尺寸", key: "bestSize" },
  { title: "操作", key: "action", width: 160 },
];

const data: Record<string, unknown>[] = [
  { id: 1, position: "首页", preview: "预览", iconName: "筛选", bestSize: "44*44", action: "上传更换 恢复默认" },
  { id: 2, position: "首页", preview: "预览", iconName: "双列模式", bestSize: "44*44", action: "上传更换 恢复默认" },
  { id: 3, position: "首页", preview: "预览", iconName: "单图模式", bestSize: "44*44", action: "上传更换 恢复默认" },
  { id: 4, position: "首页", preview: "预览", iconName: "大图模式", bestSize: "44*44", action: "上传更换 恢复默认" },
  { id: 5, position: "首页", preview: "预览", iconName: "简介模式", bestSize: "44*44", action: "上传更换 恢复默认" },
  { id: 6, position: "首页", preview: "预览", iconName: "简约模式", bestSize: "44*44", action: "上传更换 恢复默认" },
  { id: 7, position: "首页", preview: "预览", iconName: "置顶推荐", bestSize: "42*42", action: "上传更换 恢复默认" },
  { id: 8, position: "首页", preview: "预览", iconName: "VIP会员", bestSize: "42*42", action: "上传更换 恢复默认" },
  { id: 9, position: "首页", preview: "预览", iconName: "最新加入", bestSize: "42*42", action: "上传更换 恢复默认" },
  { id: 10, position: "首页", preview: "", iconName: "我要置顶", bestSize: "", action: "更换颜色 恢复默认" },
  { id: 11, position: "首页", preview: "", iconName: "开通会员", bestSize: "", action: "更换颜色 恢复默认" },
  { id: 12, position: "资料页", preview: "预览", iconName: "下一位", bestSize: "64*28", action: "上传更换 恢复默认" },
  { id: 13, position: "资料页", preview: "预览", iconName: "打招呼", bestSize: "48*48", action: "上传更换 恢复默认" },
  { id: 14, position: "资料页", preview: "预览", iconName: "分享", bestSize: "44*36", action: "上传更换 恢复默认" },
  { id: 15, position: "资料页", preview: "预览", iconName: "红娘", bestSize: "36*38", action: "上传更换 恢复默认" },
  { id: 16, position: "资料页", preview: "预览", iconName: "首页", bestSize: "32*32", action: "上传更换 恢复默认" },
  { id: 17, position: "资料页", preview: "预览", iconName: "举报", bestSize: "32*32", action: "上传更换 恢复默认" },
  { id: 18, position: "资料页", preview: "", iconName: "加Ta微信", bestSize: "", action: "更换颜色 恢复默认" },
  { id: 19, position: "资料页", preview: "", iconName: "申请牵线", bestSize: "", action: "更换颜色 恢复默认" },
  { id: 20, position: "资料页", preview: "", iconName: "我要爆灯", bestSize: "", action: "更换颜色 恢复默认" },
];

export default function PlatformNavconfigPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("平台配置", "导航配置")}
      pageTitle="导航配置"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 20, total: 20 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
