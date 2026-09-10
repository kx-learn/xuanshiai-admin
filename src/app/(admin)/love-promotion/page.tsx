"use client";

import { Inbox } from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

export default function Page() {
  return (
    <div className="min-w-0">
      <AdminBreadcrumb items={getBreadcrumb("会员服务", "推广管理")} />

      <section className="lvi-card">
        {/* 须知 */}
        <div className="lvi-notice">
          <div className="lvi-notice-title">
            <span className="lvi-notice-icon">i</span>
            <span>须知</span>
          </div>
          <p>
            推广服务是指为会员撰写专门的介绍文章或视频发布在平台的公众号、红娘朋友圈等自媒体平台，帮助会员快速扩散相亲信息。
          </p>
        </div>

        {/* 卡片头 */}
        <div className="lvi-head">
          <h2 className="lvi-title">推广管理</h2>
        </div>

        {/* 表格 */}
        <div className="lvi-table-wrap">
          <table className="lvi-table lpro-table">
            <colgroup>
              <col style={{ width: 90 }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: "auto" }} />
              <col style={{ width: 140 }} />
              <col style={{ width: 140 }} />
            </colgroup>
            <thead>
              <tr>
                <th>ID</th>
                <th>购买时间</th>
                <th>购买推广人</th>
                <th>支付状态</th>
                <th>支付方式</th>
                <th>支付订单</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
          </table>
          <div className="lap-empty">
            <Inbox className="lap-empty-icon" />
            <span>暂无数据</span>
          </div>
        </div>
      </section>
    </div>
  );
}
